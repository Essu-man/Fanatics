"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { signIn } from "@/lib/firebase-auth";
import { auth } from "@/lib/firebase";
import { useToast } from "../components/ui/ToastContainer";

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect");
    const { refreshUser } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
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

                if (redirectTo && redirectTo.startsWith("/")) {
                    router.push(redirectTo);
                    return;
                }
                if (result.user.role === "admin") {
                    router.push("/admin");
                    return;
                }
                if (result.user.role === "delivery") {
                    router.push("/delivery");
                    return;
                }
                if (result.user.role === "vendor") {
                    router.push("/vendor");
                    return;
                }

                // Sellers waiting on approval: show pending view at /vendor
                try {
                    const token = await auth.currentUser?.getIdToken();
                    if (token) {
                        const statusRes = await fetch("/api/vendor/application-status", {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const statusData = await statusRes.json();
                        if (statusData.success && statusData.application) {
                            router.push("/vendor");
                            return;
                        }
                    }
                } catch {
                    // fall through to home
                }

                router.push("/");
            } else {
                showToast(result.error || "Failed to sign in", "error");
            }
        } catch {
            showToast("An error occurred. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <div className="flex justify-center mb-3">
                        <img src="/cediman.png" alt="Cediman" className="h-32 w-auto" />
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900">Welcome Back</h1>
                    <p className="mt-2 text-sm text-zinc-600">
                        {redirectTo?.startsWith("/vendor")
                            ? "Sign in to your seller dashboard to manage products"
                            : "Sign in to your Cediman account"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm transition-all focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 hover:border-zinc-300"
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 pr-12 text-sm transition-all focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 hover:border-zinc-300"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 focus:outline-none transition-colors z-10"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <Link
                            href="/forgot-password"
                            className="text-[var(--brand-red)] hover:text-[var(--brand-red-dark)] hover:underline font-medium transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-[var(--brand-red)] px-4 py-3.5 font-semibold text-white shadow-md hover:bg-[var(--brand-red-dark)] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-zinc-200 space-y-3 text-center text-sm">
                    <p className="text-zinc-600">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/signup"
                            className="font-semibold text-[var(--brand-red)] hover:text-[var(--brand-red-dark)] hover:underline transition-colors"
                        >
                            Create an account
                        </Link>
                    </p>
                    <p className="text-zinc-500">
                        Want to sell on Cediman?{" "}
                        <Link href="/signup?role=vendor" className="font-semibold text-emerald-700 hover:underline">
                            Apply as a seller
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
