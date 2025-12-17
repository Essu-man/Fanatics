"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "../components/ui/ToastContainer";
import { confirmPasswordReset } from "@/lib/firebase-auth";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        // Check if we have the action code from Firebase
        const code = searchParams.get('code');
        const oobCode = searchParams.get('oobCode');
        const actionCode = code || oobCode;

        console.log('ResetPasswordContent useEffect:', {
            url: typeof window !== 'undefined' ? window.location.href : 'N/A',
            code,
            oobCode,
            actionCode,
            allParams: Array.from(searchParams.entries())
        });

        if (!actionCode) {
            // If no code, redirect to forgot password
            console.warn('No action code found, redirecting...');
            showToast("Invalid or expired reset link. Please request a new one.", "error");
            setTimeout(() => {
                router.push("/forgot-password");
            }, 2000);
        }
    }, [searchParams, router, showToast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (formData.password !== formData.confirmPassword) {
                showToast("Passwords do not match", "error");
                setLoading(false);
                return;
            }

            if (formData.password.length < 6) {
                showToast("Password must be at least 6 characters", "error");
                setLoading(false);
                return;
            }

            // Get the action code from URL
            const code = searchParams.get('code');
            const oobCode = searchParams.get('oobCode');
            const actionCode = code || oobCode;

            console.log('Reset Password Debug:', { code, oobCode, actionCode, password: formData.password });

            if (!actionCode) {
                showToast("Invalid reset link. Please request a new one.", "error");
                setLoading(false);
                router.push("/forgot-password");
                return;
            }

            // Confirm password reset with Firebase
            console.log('Calling confirmPasswordReset with:', { actionCode, passwordLength: formData.password.length });
            const result = await confirmPasswordReset(actionCode, formData.password);

            console.log('confirmPasswordReset result:', result);

            if (!result.success) {
                showToast(result.error || "Failed to update password", "error");
                setLoading(false);
                return;
            }

            setSuccess(true);
            showToast("Password updated successfully!", "success");

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (error: any) {
            console.error('Password reset error:', error);
            showToast(error.message || "An error occurred. Please try again.", "error");
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-zinc-900">Password Reset!</h1>
                            <p className="mt-2 text-sm text-zinc-600">
                                Your password has been successfully updated.
                            </p>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-zinc-600 mb-6">
                                Redirecting to login page...
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-sm text-[var(--brand-red)] hover:underline"
                            >
                                Go to Sign In
                                <ArrowLeft className="h-4 w-4 rotate-180" />
                            </Link>
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
                        <h1 className="text-3xl font-bold text-zinc-900">Reset Password</h1>
                        <p className="mt-2 text-sm text-zinc-600">
                            Enter your new password below.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full rounded-lg border border-zinc-200 px-4 py-3 pr-12 focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 focus:outline-none"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full rounded-lg border border-zinc-200 px-4 py-3 pr-12 focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 focus:outline-none"
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-[var(--brand-red)] px-4 py-3 font-semibold text-white hover:bg-[var(--brand-red-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                        <Loader2 className="w-16 h-16 mx-auto mb-4 text-[var(--brand-red)] animate-spin" />
                        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Loading...</h1>
                        <p className="text-zinc-600">Please wait while we load the page.</p>
                    </div>
                </div>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
}

