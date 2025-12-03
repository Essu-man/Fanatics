"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import { useCart } from "../../providers/CartProvider";
import CheckoutProgressTracker from "../../components/CheckoutProgressTracker";
import Input from "../../components/ui/input";
import { getRegions, getTownsByRegion, getCuratedAccraTowns } from "../../../lib/ghanaLocations";

interface ShippingFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    digitalAddress: string;
    landmark: string;
    town: string;
    city: string;
    region: string;
    country: string;
}

interface DeliveryPrice {
    price: number;
    location: string;
    found: boolean;
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
        digitalAddress: "",
        landmark: "",
        town: "",
        city: "",
        region: "Greater Accra",
        country: "Ghana",
    });
    const [regions, setRegions] = useState<string[]>([]);
    const [towns, setTowns] = useState<string[]>([]);
    const [deliveryPrice, setDeliveryPrice] = useState<DeliveryPrice | null>(null);
    const [loadingPrice, setLoadingPrice] = useState(false);

    useEffect(() => {
        // Redirect if cart is empty
        if (items.length === 0) {
            router.push("/");
            return;
        }

        // Load regions (not used for selection now) and set curated towns for Greater Accra delivery
        setRegions(getRegions());
        setTowns(getCuratedAccraTowns());

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

    // Fetch delivery price when town changes
    useEffect(() => {
        if (formData.town) {
            fetchDeliveryPrice(formData.town);
        }
    }, [formData.town]);

    // Update towns when region changes
    useEffect(() => {
        if (formData.region) {
            const availableTowns = getTownsByRegion(formData.region);
            setTowns(availableTowns);
            // Reset town if it's not in the new region
            if (formData.town && !availableTowns.includes(formData.town)) {
                setFormData(prev => ({ ...prev, town: "" }));
            }
        } else {
            setTowns([]);
        }
    }, [formData.region]);

    const fetchDeliveryPrice = async (location: string) => {
        setLoadingPrice(true);
        try {
            const response = await fetch(`/api/delivery-prices?location=${encodeURIComponent(location)}`);
            const data = await response.json();

            if (data.success) {
                setDeliveryPrice({
                    price: data.price,
                    location: data.location,
                    found: data.found,
                });
            }
        } catch (error) {
            console.error("Error fetching delivery price:", error);
        } finally {
            setLoadingPrice(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Store shipping info and delivery price in sessionStorage
        sessionStorage.setItem("checkoutShipping", JSON.stringify(formData));
        sessionStorage.setItem("deliveryPrice", JSON.stringify({
            price: deliveryPrice?.price || 0,
            location: formData.town,
        }));

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
                    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <p className="text-sm text-blue-900">
                            📦 <strong>Delivery Notice:</strong> Currently delivering within Greater Accra only.
                        </p>
                    </div>
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
                                            Landmark
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.landmark}
                                            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                                            placeholder="Near mall, school, etc."
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                            City *
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            placeholder="e.g., Accra"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                            Region *
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.region}
                                            disabled
                                            className="bg-zinc-100 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        City/Area *
                                    </label>
                                    <select
                                        value={formData.town}
                                        onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                                        className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                        required
                                    >
                                        <option value="">Select City/Area</option>
                                        {towns.map((town) => (
                                            <option key={town} value={town}>
                                                {town}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {deliveryPrice && formData.town && (
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                        <div className="flex items-start gap-3">
                                            <svg className="h-5 w-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <div>
                                                <p className="text-sm font-semibold text-green-900">
                                                    Delivery Fee: GH₵ {deliveryPrice.price.toFixed(2)}
                                                </p>
                                                <p className="mt-1 text-xs text-green-700">
                                                    {deliveryPrice.found
                                                        ? `Delivery to ${formData.town}`
                                                        : 'Standard delivery fee. Actual cost may vary.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        Digital Address (Ghana Post GPS)
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.digitalAddress}
                                        onChange={(e) => setFormData({ ...formData, digitalAddress: e.target.value })}
                                        placeholder="e.g., GA-123-4567"
                                    />
                                    <p className="mt-1 text-xs text-zinc-500">Optional but helps with faster delivery</p>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        Country *
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.country}
                                        disabled
                                        className="bg-zinc-100 cursor-not-allowed"
                                    />
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
