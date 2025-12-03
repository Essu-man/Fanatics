"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, MapPin, MessageSquare, Star, ChevronRight, Truck } from "lucide-react";
import RecommendedProducts from "../components/RecommendedProducts";
import OrderActivityCard from "../components/OrderActivityCard";
import type { Product } from "@/lib/database";
import { signUp } from "@/lib/firebase-auth";
import { useToast } from "../components/ui/ToastContainer";

export default function AccountPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const [loadingRecs, setLoadingRecs] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
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
            fetchOrders();
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

    const fetchOrders = async () => {
        try {
            setLoadingOrders(true);
            const response = await fetch(`/api/orders/user?userId=${user!.id}`, { cache: "no-store" });
            const data = await response.json();

            if (response.ok && data.success) {
                // Show only active orders (not delivered or cancelled)
                const activeOrders = data.orders
                    .filter((order: any) =>
                        order.status !== "delivered" && order.status !== "cancelled"
                    )
                    .slice(0, 3); // Show max 3 active orders
                setOrders(activeOrders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoadingOrders(false);
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
            title: "Orders",
            description: "Track and manage your orders",
            href: "/account/orders",
        },
        {
            icon: MapPin,
            title: "Address Book",
            description: "Manage shipping addresses",
            href: "/account/addresses",
        },
        {
            icon: MessageSquare,
            title: "Inbox",
            description: "Messages and notifications",
            href: "/account/complaints",
        },
        {
            icon: Star,
            title: "Saved Items",
            description: "Your wishlist products",
            href: "/wishlist",
        },
    ];

    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="mx-auto max-w-6xl px-4 py-8">
                {/* Welcome Banner */}
                <div className="mb-6 rounded-lg bg-gradient-to-r from-[var(--brand-red)] to-red-600 p-6 text-white shadow-md">
                    <h1 className="text-2xl font-bold">Hi {user.firstName || user.email}!</h1>
                    <p className="mt-1 text-sm text-red-50">Welcome to your account</p>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Quick Links */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Account Overview */}
                        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
                            <div className="border-b border-zinc-200 p-4">
                                <h2 className="font-bold text-zinc-900">MY ACCOUNT</h2>
                            </div>
                            <div className="divide-y divide-zinc-100">
                                {quickLinks.map((link) => {
                                    const Icon = link.icon;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="flex items-center gap-3 p-4 transition-colors hover:bg-zinc-50"
                                        >
                                            <Icon className="h-5 w-5 text-zinc-600" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-zinc-900">{link.title}</p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-zinc-400" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
                            <div className="border-b border-zinc-200 p-4">
                                <h2 className="font-bold text-zinc-900">ACCOUNT DETAILS</h2>
                            </div>
                            <div className="p-4 space-y-3">
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase">Full Name</p>
                                    <p className="text-sm font-medium text-zinc-900">
                                        {user.firstName} {user.lastName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase">Email</p>
                                    <p className="text-sm font-medium text-zinc-900">{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase">Phone</p>
                                    <p className="text-sm font-medium text-zinc-900">{user.phone || "Not provided"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Activity & Recommendations */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Activity */}
                        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-zinc-200 p-4">
                                <div className="flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-[var(--brand-red)]" />
                                    <h2 className="font-bold text-zinc-900">ORDER ACTIVITY</h2>
                                </div>
                                <Link href="/account/orders" className="text-sm text-[var(--brand-red)] hover:underline">
                                    View All Orders
                                </Link>
                            </div>
                            <div className="p-4">
                                {loadingOrders ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                                    </div>
                                ) : orders.length > 0 ? (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <OrderActivityCard key={order.id} order={order} />
                                        ))}
                                        {orders.length >= 3 && (
                                            <Link
                                                href="/account/orders"
                                                className="block text-center text-sm font-medium text-[var(--brand-red)] hover:underline py-2"
                                            >
                                                View all your orders →
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Package className="mx-auto h-12 w-12 text-zinc-300 mb-3" />
                                        <p className="text-sm font-medium text-zinc-600">No active orders</p>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            Your current orders will appear here
                                        </p>
                                        <Link
                                            href="/"
                                            className="mt-4 inline-block rounded-lg bg-[var(--brand-red)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                                        >
                                            Start Shopping
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recommendations */}
                        {!loadingRecs && recommendations.length > 0 && (
                            <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
                                <div className="border-b border-zinc-200 p-4">
                                    <h2 className="font-bold text-zinc-900">RECOMMENDED FOR YOU</h2>
                                </div>
                                <div className="p-4">
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                        {recommendations.slice(0, 6).map((product) => (
                                            <Link
                                                key={product.id}
                                                href={`/products/${product.id}`}
                                                className="group"
                                            >
                                                <div className="aspect-square overflow-hidden rounded-lg bg-zinc-50">
                                                    <img
                                                        src={product.images?.[0]}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                </div>
                                                <p className="mt-2 text-sm font-medium text-zinc-900 line-clamp-1">
                                                    {product.name}
                                                </p>
                                                <p className="text-sm font-bold text-zinc-900">
                                                    ₵{product.price.toFixed(2)}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
