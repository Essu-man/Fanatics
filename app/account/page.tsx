"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, MapPin, MessageSquare, Star, ChevronRight } from "lucide-react";
import RecommendedProducts from "../components/RecommendedProducts";
import type { Product } from "@/lib/database";
import { signUp } from "@/lib/firebase-auth";
import { useToast } from "../components/ui/ToastContainer";

export default function AccountPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const [loadingRecs, setLoadingRecs] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        if (user && user.id) {
            fetchRecommendations();
        }
    }, [user]);

    const fetchRecommendations = async () => {
        try {
            setLoadingRecs(true);
            const { getPersonalizedRecommendations } = await import("@/lib/recommendations");
            const recs = await getPersonalizedRecommendations(user!.id, 8);
            setRecommendations(recs);
        } catch (error) {
            console.error("Error fetching recommendations:", error);
        } finally {
            setLoadingRecs(false);
        }
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
                formData.lastName
            );

            if (result.success) {
                showToast("Please check your email to verify your account", "success");
                router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
            } else {
                showToast(result.error || "Failed to create account", "error");
            }
        } catch (error) {
            showToast("An error occurred. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl">
                        <div className="mb-8 text-center">
                            <div className="flex justify-center mb-6">
                                <img
                                    src="/cediman.png"
                                    alt="Cediman"
                                    className="h-12 w-auto"
                                />
                            </div>
                            <h1 className="text-3xl font-bold text-zinc-900">Create Account</h1>
                            <p className="mt-2 text-sm text-zinc-600">
                                Join Cediman and start shopping for premium jerseys
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-zinc-700 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm transition-all focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 hover:border-zinc-300"
                                        placeholder="John"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-zinc-700 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
                                <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-2">
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
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm transition-all focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 hover:border-zinc-300"
                                    placeholder="Confirm your password"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-lg bg-[var(--brand-red)] px-4 py-3.5 font-semibold text-white shadow-md hover:bg-[var(--brand-red-dark)] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating account...
                                    </span>
                                ) : (
                                    "Create Account"
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-zinc-200 text-center text-sm">
                            <p className="text-zinc-600">
                                Already have an account?{" "}
                                <Link href="/login" className="font-semibold text-[var(--brand-red)] hover:text-[var(--brand-red-dark)] hover:underline transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const quickLinks = [
        {
            icon: Package,
            title: "My Orders",
            description: "Track and manage your orders",
            href: "/account/orders",
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            icon: MapPin,
            title: "Addresses",
            description: "Manage shipping addresses",
            href: "/account/addresses",
            color: "text-green-600",
            bg: "bg-green-50",
        },
        {
            icon: MessageSquare,
            title: "Complaints",
            description: "Submit and track issues",
            href: "/account/complaints",
            color: "text-orange-600",
            bg: "bg-orange-50",
        },
        {
            icon: Star,
            title: "Reviews",
            description: "Your product reviews",
            href: "/account/reviews",
            color: "text-purple-600",
            bg: "bg-purple-50",
        },
    ];

    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="mx-auto max-w-7xl px-6 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900">My Account</h1>
                    <p className="mt-2 text-zinc-600">
                        Welcome back, {user.email}!
                    </p>
                </div>

                {/* Quick Links */}
                <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {quickLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="group flex items-start gap-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                            >
                                <div className={`rounded-lg ${link.bg} p-3`}>
                                    <Icon className={`h-6 w-6 ${link.color}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="mb-1 font-semibold text-zinc-900">{link.title}</h3>
                                    <p className="text-sm text-zinc-600">{link.description}</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1" />
                            </Link>
                        );
                    })}
                </div>

                {/* Personalized Recommendations */}
                <div className="mb-12">
                    <RecommendedProducts
                        title="Recommended For You"
                        products={recommendations}
                        loading={loadingRecs}
                    />
                </div>

                {/* Account Info */}
                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold text-zinc-900">Account Information</h2>
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="text-zinc-500">Email</p>
                            <p className="font-medium text-zinc-900">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-zinc-500">Account Type</p>
                            <p className="font-medium text-zinc-900 capitalize">{user.role || "Customer"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
