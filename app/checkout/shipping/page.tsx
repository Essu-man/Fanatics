"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import { useCart } from "../../providers/CartProvider";
import CheckoutProgressTracker from "../../components/CheckoutProgressTracker";

interface ShippingFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
}

export default function CheckoutShippingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { items } = useCart();
    const [formData, setFormData] = useState<ShippingFormData>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
    });

    useEffect(() => {
        // Redirect if cart is empty
        if (items.length === 0) {
            router.push("/");
            return;
        }

        // Pre-fill form for logged-in users
        if (user) {
            setFormData((prev) => ({
                ...prev,
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "",
            }));
        }
    }, [user, items, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Store shipping info in sessionStorage
        sessionStorage.setItem("checkoutShipping", JSON.stringify(formData));

        // Continue to payment
        router.push("/checkout/payment");
    };

    const handleBack = () => {
        router.push("/checkout/cart");
    };

    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="mx-auto max-w-4xl px-6 py-8">
                {/* Progress Tracker */}
                <CheckoutProgressTracker currentStep={2} />

                {/* Page Title */}
                <div className="mb-8">
                    <button
                        onClick={handleBack}
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Cart
                    </button>
                    <h1 className="text-3xl font-bold text-zinc-900">Shipping Information</h1>
                    <p className="mt-1 text-sm text-zinc-600">
                        Enter your delivery details
                    </p>
                </div>

                {/* Shipping Form */}
                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Contact Information */}
                        <div>
                            <h2 className="mb-4 text-lg font-semibold text-zinc-900">Contact Information</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full rounded-lg border border-zinc-200 px-4 py-2 focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full rounded-lg border border-zinc-200 px-4 py-2 focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full rounded-lg border border-zinc-200 px-4 py-2 focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full rounded-lg border border-zinc-200 px-4 py-2 focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                        placeholder="+233 XX XXX XXXX"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div>
                            <h2 className="mb-4 text-lg font-semibold text-zinc-900">Delivery Address</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                                        Street Address *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full rounded-lg border border-zinc-200 px-4 py-2 focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                        placeholder="House number and street name"
                                        required
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full rounded-lg border border-zinc-200 px-4 py-2 focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">
                                            State/Region *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className="w-full rounded-lg border border-zinc-200 px-4 py-2 focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">
                                            Postal Code
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.zipCode}
                                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                            className="w-full rounded-lg border border-zinc-200 px-4 py-2 focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex-1 rounded-lg border border-zinc-200 px-4 py-3 font-semibold text-zinc-700 hover:bg-zinc-50"
                            >
                                Back to Cart
                            </button>
                            <button
                                type="submit"
                                className="flex-1 rounded-lg bg-[var(--brand-red)] px-4 py-3 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                            >
                                Continue to Payment
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
