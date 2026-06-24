"use client";

import { useEffect, useRef, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Loader2, RotateCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { useAuth } from "../providers/AuthProvider";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds
const EXPIRY_MINUTES = 15;

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") ?? "";
    const role = searchParams.get("role") ?? "customer";
    const { refreshUser } = useAuth();

    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Resend cooldown
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
    const [resending, setResending] = useState(false);
    const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Expiry countdown (15 min from load)
    const [expirySeconds, setExpirySeconds] = useState(EXPIRY_MINUTES * 60);
    const expiryRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(OTP_LENGTH).fill(null));

    // Start cooldown timer
    const startCooldown = useCallback(() => {
        setCooldown(RESEND_COOLDOWN);
        if (cooldownRef.current) clearInterval(cooldownRef.current);
        cooldownRef.current = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(cooldownRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    // Start expiry countdown
    const startExpiry = useCallback(() => {
        setExpirySeconds(EXPIRY_MINUTES * 60);
        if (expiryRef.current) clearInterval(expiryRef.current);
        expiryRef.current = setInterval(() => {
            setExpirySeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(expiryRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    // Start timers on mount (OTP was just sent on signup)
    useEffect(() => {
        startCooldown();
        startExpiry();
        inputRefs.current[0]?.focus();
        return () => {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
            if (expiryRef.current) clearInterval(expiryRef.current);
        };
    }, [startCooldown, startExpiry]);

    // ── Input handlers ──────────────────────────────────────────────────────

    const handleChange = (index: number, value: string) => {
        // Allow only digits
        const digit = value.replace(/\D/g, "").slice(-1);
        const next = [...digits];
        next[index] = digit;
        setDigits(next);
        setError(null);
        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (digits[index]) {
                const next = [...digits];
                next[index] = "";
                setDigits(next);
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (!pasted) return;
        const next = Array(OTP_LENGTH).fill("");
        pasted.split("").forEach((ch, i) => (next[i] = ch));
        setDigits(next);
        setError(null);
        const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
        inputRefs.current[focusIdx]?.focus();
    };

    // ── Submit ───────────────────────────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = digits.join("");
        if (code.length < OTP_LENGTH) {
            setError("Please enter all 6 digits.");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const firebaseUser = auth.currentUser;
            if (!firebaseUser) {
                setError("Session expired. Please log in and try again.");
                return;
            }
            const token = await firebaseUser.getIdToken();
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ code }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                await refreshUser();
                setTimeout(() => {
                    router.push(role === "vendor" ? "/vendor" : "/");
                }, 1500);
            } else {
                setError(data.error || "Incorrect code. Please try again.");
                // Clear inputs on wrong code
                setDigits(Array(OTP_LENGTH).fill(""));
                inputRefs.current[0]?.focus();
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Resend ───────────────────────────────────────────────────────────────

    const handleResend = async () => {
        if (cooldown > 0 || resending) return;
        setResending(true);
        setError(null);
        try {
            const firebaseUser = auth.currentUser;
            if (!firebaseUser) {
                setError("Session expired. Please log in again.");
                return;
            }
            const token = await firebaseUser.getIdToken();
            const res = await fetch("/api/auth/send-verification", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setDigits(Array(OTP_LENGTH).fill(""));
                inputRefs.current[0]?.focus();
                startCooldown();
                startExpiry();
            } else {
                setError(data.error || "Failed to resend code.");
            }
        } catch {
            setError("Failed to resend code. Please try again.");
        } finally {
            setResending(false);
        }
    };

    // ── Format helpers ────────────────────────────────────────────────────────

    const formatExpiry = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const maskedEmail = email
        ? (() => {
              const [user, domain] = email.split("@");
              if (!domain) return email;
              const visible = user.length > 3 ? user.slice(0, 3) : user.slice(0, 1);
              return `${visible}${"*".repeat(Math.max(0, user.length - visible.length))}@${domain}`;
          })()
        : "";

    // ── Render ────────────────────────────────────────────────────────────────

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl bg-white shadow-xl p-10 text-center border border-zinc-100">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/50">
                            <ShieldCheck className="h-10 w-10 text-emerald-500" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Email Verified!</h1>
                        <p className="text-zinc-500 text-sm mb-2">Your email address has been confirmed.</p>
                        <p className="text-zinc-400 text-xs flex items-center justify-center gap-1.5">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Redirecting you now…
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const isComplete = digits.every((d) => d !== "");

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center p-6">
            <div className="w-full max-w-md">

                {/* Card */}
                <div className="rounded-2xl bg-white shadow-xl border border-zinc-100 overflow-hidden">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-[var(--brand-red)] to-[#a01630] px-8 py-7 text-center">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                            <ShieldCheck className="h-7 w-7 text-white" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-xl font-bold text-white">Verify your email</h1>
                        <p className="mt-1 text-sm text-white/75">
                            We sent a 6-digit code to
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-white">{maskedEmail}</p>
                    </div>

                    {/* Body */}
                    <div className="px-8 py-8">
                        <form onSubmit={handleSubmit} autoComplete="off">
                            {/* Digit inputs */}
                            <div className="flex justify-center gap-2.5 mb-6" onPaste={handlePaste}>
                                {digits.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { inputRefs.current[i] = el; }}
                                        id={`otp-digit-${i}`}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        aria-label={`Digit ${i + 1}`}
                                        className={`h-14 w-12 rounded-xl border-2 text-center text-2xl font-bold text-zinc-900 outline-none transition-all
                                            ${digit ? "border-[var(--brand-red)] bg-red-50/30 shadow-sm" : "border-zinc-200 bg-zinc-50"}
                                            focus:border-[var(--brand-red)] focus:ring-4 focus:ring-[var(--brand-red)]/10
                                            ${error ? "border-red-400 animate-[shake_0.3s_ease]" : ""}
                                        `}
                                        disabled={submitting || success}
                                    />
                                ))}
                            </div>

                            {/* Error */}
                            {error && (
                                <p className="text-sm text-red-600 text-center mb-4 font-medium">
                                    {error}
                                </p>
                            )}

                            {/* Expiry */}
                            <p className={`text-xs text-center mb-5 font-medium ${expirySeconds < 60 ? "text-red-500" : "text-zinc-400"}`}>
                                {expirySeconds > 0
                                    ? <>Code expires in <span className="tabular-nums">{formatExpiry(expirySeconds)}</span></>
                                    : "⚠️ Code expired — please request a new one"
                                }
                            </p>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={!isComplete || submitting || expirySeconds === 0}
                                className="w-full rounded-xl bg-[var(--brand-red)] py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#a01630] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Verifying…
                                    </>
                                ) : "Confirm & Continue"}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-100" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white px-3 text-xs text-zinc-400">Didn&apos;t receive it?</span>
                            </div>
                        </div>

                        {/* Resend */}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={cooldown > 0 || resending}
                            className="w-full rounded-xl border border-zinc-200 py-3 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {resending ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                            ) : cooldown > 0 ? (
                                <><RotateCcw className="h-3.5 w-3.5" /> Resend in {cooldown}s</>
                            ) : (
                                <><RotateCcw className="h-3.5 w-3.5" /> Resend code</>
                            )}
                        </button>

                        {/* Spam hint */}
                        <p className="mt-4 text-center text-xs text-zinc-400">
                            💡 Check your spam folder if you don&apos;t see it
                        </p>
                    </div>
                </div>

                {/* Back link */}
                <div className="mt-5 text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-[var(--brand-red)] animate-spin" />
                </div>
            }
        >
            <VerifyEmailContent />
        </Suspense>
    );
}
