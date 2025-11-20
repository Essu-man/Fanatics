"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import Link from "next/link";
import { Package, MapPin, MessageSquare, Star, ChevronRight } from "lucide-react";
import RecommendedProducts from "../components/RecommendedProducts";
import type { Product } from "@/lib/database";

export default function AccountPage() {
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const [loadingRecs, setLoadingRecs] = useState(true);

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

    if (!user) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-zinc-900 mb-4">Please Sign In</h1>
                    <p className="text-zinc-600 mb-6">You need to be signed in to view your account.</p>
                    <Link
                        href="/login"
                        className="inline-block rounded-lg bg-[var(--brand-red)] px-6 py-3 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                    >
                        Sign In
                    </Link>
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
