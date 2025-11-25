"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { resendEmailVerification } from "@/lib/firebase-auth";
import { useToast } from "../components/ui/ToastContainer";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const { showToast } = useToast();
    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);

    const handleResendEmail = async () => {
        setResending(true);
        try {
            const result = await resendEmailVerification();
            if (result.success) {
                setResent(true);
                showToast("Verification email sent!", "success");
            } else {
                showToast(result.error || "Failed to send verification email", "error");
            }
        } catch (error) {
            showToast("An error occurred. Please try again.", "error");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm text-center">
                    {/* Icon */}
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        <Mail className="h-8 w-8 text-blue-600" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-zinc-900 mb-2">
                        Verify Your Email
                    </h1>

                    {/* Description */}
                    <p className="text-zinc-600 mb-6">
                        We've sent a verification link to
                    </p>

                    {email && (
                        <p className="text-lg font-semibold text-[var(--brand-red)] mb-6">
                            {email}
                        </p>
                    )}

                    {/* Instructions */}
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-6 text-left">
                        <p className="text-sm font-semibold text-blue-900 mb-2">
                            Next Steps:
                        </p>
                        <ol className="text-sm text-blue-800 space-y-2">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>Check your email inbox</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>Click the verification link in the email</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>You'll be redirected to login</span>
                            </li>
                        </ol>
                    </div>

                    {/* Resend Email */}
                    <div className="mb-6">
                        <p className="text-sm text-zinc-600 mb-3">
                            Didn't receive the email?
                        </p>
                        <button
                            onClick={handleResendEmail}
                            disabled={resending || resent}
                            className="text-sm font-medium text-[var(--brand-red)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resending ? "Sending..." : resent ? "Email sent!" : "Resend verification email"}
                        </button>
                    </div>

                    {/* Check Spam */}
                    <div className="text-xs text-zinc-500 mb-6">
                        <p>💡 Check your spam folder if you don't see the email</p>
                    </div>

                    {/* Back to Login */}
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
                    >
                        Back to Login
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-zinc-600">
                        Need help?{" "}
                        <Link href="/contact" className="font-semibold text-[var(--brand-red)] hover:underline">
                            Contact Support
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
                    <div className="w-full max-w-md">
                        <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm text-center">
                            <Loader2 className="h-16 w-16 mx-auto mb-4 text-[var(--brand-red)] animate-spin" />
                            <h1 className="text-2xl font-bold text-zinc-900 mb-2">Loading...</h1>
                            <p className="text-zinc-600">Please wait while we load the page.</p>
                        </div>
                    </div>
                </div>
            }
        >
            <VerifyEmailContent />
        </Suspense>
    );
}
