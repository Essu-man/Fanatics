"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/firebase-auth";
import { useAuth } from "../providers/AuthProvider";
import { useToast } from "../components/ui/ToastContainer";
import VendorApplyForm from "../components/vendor/VendorApplyForm";

function roleFromSearchParams(params: URLSearchParams): "customer" | "vendor" {
    const role = params.get("role")?.toLowerCase();
    if (role === "vendor" || role === "seller") return "vendor";
    return "customer";
}

export default function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const { refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "customer" as "customer" | "vendor",
    });

    useEffect(() => {
        const role = roleFromSearchParams(searchParams);
        setFormData((prev) => (prev.role === role ? prev : { ...prev, role }));
    }, [searchParams]);

    const setRole = (role: "customer" | "vendor") => {
        setFormData((prev) => ({ ...prev, role }));
        const url = new URL(window.location.href);
        if (role === "vendor") {
            url.searchParams.set("role", "vendor");
        } else {
            url.searchParams.delete("role");
        }
        router.replace(url.pathname + url.search, { scroll: false });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            showToast("Passwords do not match", "error");
            return;
        }

        if (formData.password.length < 6) {
            showToast("Password must be at least 6 characters", "error");
            return;
        }

        setLoading(true);

        try {
            const result = await signUp(
                formData.email,
                formData.password,
                formData.firstName,
                formData.lastName,
                formData.role
            );

            if (result.success) {
                showToast("Account created! Check your email for a verification code.", "success");
                router.push(
                    `/verify-email?email=${encodeURIComponent(formData.email)}&role=${formData.role}`
                );
            } else {
                let errorMessage = result.error || "Failed to create account";
                if (errorMessage.includes("auth/email-already-in-use")) {
                    errorMessage = "This email is already in use. Please sign in first, or use a different email address.";
                }
                showToast(errorMessage, "error");
            }
        } catch {
            showToast("An error occurred. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 flex items-center justify-center p-6">
            <div
                className={`w-full transition-all duration-500 ${formData.role === "vendor" ? "max-w-2xl" : "max-w-md"}`}
            >
                <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl">
                    <div className="mb-8 text-center">
                        <div className="flex justify-center mb-6">
                            <img src="/cediman.png" alt="Cediman" className="h-12 w-auto" />
                        </div>
                        <h1 className="text-3xl font-bold text-zinc-900">
                            {formData.role === "vendor" ? "Seller Application" : "Create Account"}
                        </h1>
                        <p className="mt-2 text-sm text-zinc-600">
                            {formData.role === "vendor"
                                ? "Join the #1 marketplace for fans gear in Ghana"
                                : "Join Cediman and start shopping for premium jerseys"}
                        </p>
                    </div>

                    <div className="flex gap-4 mb-8">
                        <button
                            type="button"
                            onClick={() => setRole("customer")}
                            className={`flex-1 p-4 rounded-xl border-2 transition-all text-center ${
                                formData.role === "customer"
                                    ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                                    : "border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-200"
                            }`}
                        >
                            <div className="text-sm font-bold uppercase tracking-widest mb-1">Buyer</div>
                            <div className="text-[10px]">I want to shop</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole("vendor")}
                            className={`flex-1 p-4 rounded-xl border-2 transition-all text-center ${
                                formData.role === "vendor"
                                    ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                                    : "border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-200"
                            }`}
                        >
                            <div className="text-sm font-bold uppercase tracking-widest mb-1">Seller</div>
                            <div className="text-[10px]">I want to sell</div>
                        </button>
                    </div>

                    {formData.role === "vendor" ? (
                        <VendorApplyForm requireAccount />
                    ) : (
                        <>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="firstName"
                                            className="block text-sm font-medium text-zinc-700 mb-2"
                                        >
                                            First Name
                                        </label>
                                        <input
                                            id="firstName"
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) =>
                                                setFormData({ ...formData, firstName: e.target.value })
                                            }
                                            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm transition-all focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 hover:border-zinc-300"
                                            placeholder="John"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="lastName"
                                            className="block text-sm font-medium text-zinc-700 mb-2"
                                        >
                                            Last Name
                                        </label>
                                        <input
                                            id="lastName"
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) =>
                                                setFormData({ ...formData, lastName: e.target.value })
                                            }
                                            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm transition-all focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 hover:border-zinc-300"
                                            placeholder="Doe"
                                            required
                                        />
                                    </div>
                                </div>

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
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-zinc-700 mb-2"
                                    >
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm transition-all focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 hover:border-zinc-300"
                                        placeholder="Enter your password"
                                        required
                                        minLength={6}
                                    />
                                    <p className="mt-1 text-xs text-zinc-500">At least 6 characters</p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-zinc-700 mb-2"
                                    >
                                        Confirm Password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) =>
                                            setFormData({ ...formData, confirmPassword: e.target.value })
                                        }
                                        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm transition-all focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 hover:border-zinc-300"
                                        placeholder="Confirm your password"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-lg bg-zinc-900 px-4 py-3.5 font-semibold text-white shadow-md hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {loading ? "Creating account..." : "Create Account"}
                                </button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-zinc-200 text-center text-sm">
                                <p className="text-zinc-600">
                                    Already have an account?{" "}
                                    <Link
                                        href="/login"
                                        className="font-semibold text-zinc-900 hover:text-emerald-600 hover:underline transition-colors"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                                <p className="mt-3 text-zinc-500">
                                    Want to sell?{" "}
                                    <button
                                        type="button"
                                        onClick={() => setRole("vendor")}
                                        className="font-semibold text-emerald-700 hover:underline"
                                    >
                                        Apply as a seller
                                    </button>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
