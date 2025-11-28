"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import { useCart } from "../../providers/CartProvider";
import CheckoutProgressTracker from "../../components/CheckoutProgressTracker";
import Input from "../../components/ui/input";

interface ShippingFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
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
        country: "Ghana",
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
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        First Name *
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        Last Name *
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        Email Address *
                                    </label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        Phone Number *
                                    </label>
                                    <Input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                            Street Address *
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="House number and street name"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                            City *
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            placeholder="Accra"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                            Region *
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            placeholder="Greater Accra"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                            Country *
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            placeholder="Ghana"
                                            required
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
