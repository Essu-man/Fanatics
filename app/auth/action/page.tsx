"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

/**
 * Custom Email Action Handler
 * 
 * This page handles all Firebase email actions:
 * - Email verification
 * - Password reset
 * - Email change
 * 
 * Firebase will redirect here with actionCode in the URL
 */
export default function AuthActionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");
    const [actionType, setActionType] = useState<"verify" | "reset" | "unknown">("unknown");

    useEffect(() => {
        const handleAction = async () => {
            try {
                // Get action code from URL
                const mode = searchParams.get("mode");
                const actionCode = searchParams.get("oobCode");
                const continueUrl = searchParams.get("continueUrl");
                const lang = searchParams.get("lang") || "en";

                if (!actionCode) {
                    setStatus("error");
                    setMessage("Invalid or missing action code. Please request a new verification email.");
                    return;
                }

                // Handle different action types
                switch (mode) {
                    case "verifyEmail":
                        await handleVerifyEmail(actionCode);
                        break;
                    case "resetPassword":
                        await handleResetPassword(actionCode, continueUrl);
                        break;
                    case "recoverEmail":
                        await handleRecoverEmail(actionCode);
                        break;
                    default:
                        // Try to apply the action code anyway (Firebase might use different mode values)
                        try {
                            await applyActionCode(auth, actionCode);
                            setStatus("success");
                            setActionType("verify");
                            setMessage("Your email has been verified successfully!");
                        } catch (error: any) {
                            console.error("Action code error:", error);
                            setStatus("error");
                            setMessage(error.message || "Invalid or expired link. Please request a new one.");
                        }
                }
            } catch (error: any) {
                console.error("Auth action error:", error);
                setStatus("error");
                setMessage(error.message || "An error occurred. Please try again.");
            }
        };

        handleAction();
    }, [searchParams, router]);

    const handleVerifyEmail = async (actionCode: string) => {
        try {
            await applyActionCode(auth, actionCode);
            setStatus("success");
            setActionType("verify");
            setMessage("Your email has been verified successfully! You can now log in.");

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/login?verified=true");
            }, 3000);
        } catch (error: any) {
            setStatus("error");
            setMessage(
                error.code === "auth/invalid-action-code"
                    ? "This verification link has expired or is invalid. Please request a new one."
                    : error.message || "Failed to verify email. Please try again."
            );
        }
    };

    const handleResetPassword = async (actionCode: string, continueUrl: string | null) => {
        try {
            // Verify the code is valid
            await verifyPasswordResetCode(auth, actionCode);

            // Store the action code in sessionStorage for the reset password page
            sessionStorage.setItem("resetPasswordCode", actionCode);

            // Redirect to reset password page
            router.push("/reset-password?code=" + encodeURIComponent(actionCode));
        } catch (error: any) {
            setStatus("error");
            setMessage(
                error.code === "auth/invalid-action-code"
                    ? "This password reset link has expired or is invalid. Please request a new one."
                    : error.message || "Failed to verify reset code. Please try again."
            );
        }
    };

    const handleRecoverEmail = async (actionCode: string) => {
        try {
            await applyActionCode(auth, actionCode);
            setStatus("success");
            setActionType("verify");
            setMessage("Your email has been recovered successfully!");

            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (error: any) {
            setStatus("error");
            setMessage(error.message || "Failed to recover email. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                {status === "loading" && (
                    <>
                        <Loader2 className="w-16 h-16 mx-auto mb-4 text-[var(--brand-red)] animate-spin" />
                        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Processing...</h1>
                        <p className="text-zinc-600">Please wait while we verify your request.</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Success!</h1>
                        <p className="text-zinc-600 mb-6">{message}</p>
                        {actionType === "verify" && (
                            <Link
                                href="/login?verified=true"
                                className="inline-block bg-[var(--brand-red)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                            >
                                Go to Login
                            </Link>
                        )}
                    </>
                )}

                {status === "error" && (
                    <>
                        <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Error</h1>
                        <p className="text-zinc-600 mb-6">{message}</p>
                        <div className="space-y-3">
                            <Link
                                href="/login"
                                className="block bg-[var(--brand-red)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                            >
                                Go to Login
                            </Link>
                            {actionType === "verify" && (
                                <Link
                                    href="/verify-email"
                                    className="block text-[var(--brand-red)] hover:underline"
                                >
                                    Request New Verification Email
                                </Link>
                            )}
                            {actionType === "reset" && (
                                <Link
                                    href="/forgot-password"
                                    className="block text-[var(--brand-red)] hover:underline"
                                >
                                    Request New Password Reset
                                </Link>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

