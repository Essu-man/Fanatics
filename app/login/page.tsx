"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../providers/AuthProvider";
import { signIn } from "@/lib/supabase-auth";
import { useToast } from "../components/ui/ToastContainer";

export default function LoginPage() {
    const router = useRouter();
    const { refreshUser } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn(formData.email, formData.password);

            if (result.success && result.user) {
                showToast("Signed in successfully!", "success");
                await refreshUser();

                // Redirect based on role
                if (result.user.role === "admin") {
                    router.push("/admin");
                } else if (result.user.role === "delivery") {
                    router.push("/delivery");
                } else {
                    router.push("/");
                }
            } else {
                showToast(result.error || "Failed to sign in", "error");
            }
        } catch (error) {
            showToast("An error occurred. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-zinc-900">Welcome Back</h1>
                        <p className="mt-2 text-sm text-zinc-600">
                            Sign in to your Cediman account
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
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full rounded-lg border border-zinc-200 px-4 py-3 focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full rounded-lg border border-zinc-200 px-4 py-3 focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <Link
                                href="/forgot-password"
                                className="text-[var(--brand-red)] hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-[var(--brand-red)] px-4 py-3 font-semibold text-white hover:bg-[var(--brand-red-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-zinc-600">
                            Don't have an account?{" "}
                            <Link href="/signup" className="font-semibold text-[var(--brand-red)] hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    {/* Demo Credentials Info */}
                    <div className="mt-8 rounded-lg bg-blue-50 border border-blue-200 p-4">
                        <p className="text-xs font-semibold text-blue-900 mb-2">Demo Accounts:</p>
                        <div className="space-y-1 text-xs text-blue-700">
                            <p><strong>Admin:</strong> admin@cediman.com / admin123</p>
                            <p><strong>Customer:</strong> Any email with 6+ char password</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}