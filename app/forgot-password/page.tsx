"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/supabase-auth";
import { useToast } from "../components/ui/ToastContainer";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await resetPassword(email);

            if (result.success) {
                setSent(true);
                showToast("Password reset email sent! Check your inbox.", "success");
            } else {
                showToast(result.error || "Failed to send reset email", "error");
            }
        } catch (error) {
            showToast("An error occurred. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <Mail className="h-8 w-8 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-zinc-900">Check Your Email</h1>
                            <p className="mt-2 text-sm text-zinc-600">
                                We've sent a password reset link to <strong>{email}</strong>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-zinc-600 text-center">
                                Click the link in the email to reset your password. The link will expire in 1 hour.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setSent(false);
                                        setEmail("");
                                    }}
                                    className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                                >
                                    Send Another Email
                                </button>
                                <Link
                                    href="/login"
                                    className="flex items-center justify-center gap-2 text-sm text-[var(--brand-red)] hover:underline"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Sign In
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
                    <div className="mb-8">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 mb-6"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Sign In
                        </Link>
                        <h1 className="text-3xl font-bold text-zinc-900">Forgot Password?</h1>
                        <p className="mt-2 text-sm text-zinc-600">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-zinc-200 px-4 py-3 focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-[var(--brand-red)] px-4 py-3 font-semibold text-white hover:bg-[var(--brand-red-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

