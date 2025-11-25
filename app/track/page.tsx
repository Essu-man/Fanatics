"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/ui/button";
import Input from "../components/ui/input";
import { Package, Search, ArrowLeft } from "lucide-react";

export default function TrackOrderPage() {
    const router = useRouter();
    const [orderId, setOrderId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleTrackOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!orderId.trim()) {
            setError("Please enter your order ID");
            return;
        }

        setLoading(true);

        try {
            // Check if order exists
            const response = await fetch(`/api/orders/${orderId}`);
            const data = await response.json();

            if (data.success) {
                // Redirect to tracking page
                router.push(`/track/${orderId}`);
            } else {
                setError(data.error || "Order not found. Please check your order ID.");
            }
        } catch (err) {
            setError("Failed to load order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50">
            <Header />
            <div className="mx-auto max-w-3xl px-6 py-12">
                <Link
                    href="/"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Store
                </Link>

                <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm w-full">
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-red)]/10">
                            <Package className="h-8 w-8 text-[var(--brand-red)]" />
                        </div>
                        <h1 className="text-3xl font-bold text-zinc-900">Track Your Order</h1>
                        <p className="mt-2 text-zinc-600">
                            Enter your order ID to view your order status
                        </p>
                    </div>

                    <form onSubmit={handleTrackOrder} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                Order ID
                            </label>
                            <Input
                                type="text"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                                placeholder="ORD-1234567890-ABC123"
                                required
                                className="font-mono text-lg w-full max-w-none"
                                autoFocus
                            />
                            <p className="mt-1 text-xs text-zinc-500">
                                You can find this in your order confirmation email or SMS
                            </p>
                        </div>

                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full justify-center gap-2 py-3 text-base font-bold"
                        >
                            {loading ? (
                                <>
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <Search className="h-5 w-5" />
                                    Track Order
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
                        <h3 className="mb-2 text-sm font-semibold text-blue-900">Need Help?</h3>
                        <p className="text-xs text-blue-700">
                            If you can't find your order ID, check your email inbox for the order confirmation email.
                            You can also contact our support team for assistance.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

