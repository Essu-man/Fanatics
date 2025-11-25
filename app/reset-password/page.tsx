"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "../components/ui/ToastContainer";
import { confirmPasswordReset } from "@/lib/firebase-auth";

export default function ResetPasswordPage() {
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

        if (!actionCode) {
            // If no code, redirect to forgot password
            showToast("Invalid or expired reset link. Please request a new one.", "error");
            setTimeout(() => {
                router.push("/forgot-password");
            }, 2000);
        }
    }, [searchParams, router, showToast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

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

        try {
            // Get the action code from URL (Firebase sends it as 'code' or 'oobCode')
            const code = searchParams.get('code');
            const oobCode = searchParams.get('oobCode');
            const actionCode = code || oobCode;

            if (!actionCode) {
                showToast("Invalid reset link. Please request a new one.", "error");
                router.push("/forgot-password");
                return;
            }

            // Confirm password reset with Firebase
            const result = await confirmPasswordReset(actionCode, formData.password);

            if (!result.success) {
                showToast(result.error || "Failed to update password", "error");
                return;
            }

            setSuccess(true);
            showToast("Password updated successfully!", "success");

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (error: any) {
            showToast(error.message || "An error occurred. Please try again.", "error");
        } finally {
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

