"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../providers/CartProvider";
import { useToast } from "../components/ui/ToastContainer";
import Button from "../components/ui/button";
import Input from "../components/ui/input";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Shield, Truck, ArrowLeft } from "lucide-react";
import { getRegions, getTownsByRegion } from "../../lib/ghanaLocations";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";

interface DeliveryPrice {
    price: number;
    location: string;
    found: boolean;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items, clear } = useCart();
    const { showToast } = useToast();

    const [processing, setProcessing] = useState(false);
    const [regions, setRegions] = useState<string[]>([]);
    const [towns, setTowns] = useState<string[]>([]);
    const [deliveryPrice, setDeliveryPrice] = useState<DeliveryPrice | null>(null);
    const [loadingPrice, setLoadingPrice] = useState(false);

    // Shipping form state
    const [shipping, setShipping] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        landmark: "",
        region: "",
        town: "",
        digitalAddress: "",
        country: "Ghana",
    });

    useEffect(() => {
        setRegions(getRegions());
    }, []);

    // Update towns when region changes
    useEffect(() => {
        if (shipping.region) {
            const availableTowns = getTownsByRegion(shipping.region);
            setTowns(availableTowns);
            // Reset town if it's not in the new region
            if (shipping.town && !availableTowns.includes(shipping.town)) {
                setShipping(prev => ({ ...prev, town: "" }));
            }
        } else {
            setTowns([]);
        }
    }, [shipping.region]);

    // Fetch delivery price when town changes
    useEffect(() => {
        if (shipping.town) {
            fetchDeliveryPrice(shipping.town);
        }
    }, [shipping.town]);

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

    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const estimatedShipping = deliveryPrice?.price || 0;
    const tax = 0; // No tax
    const total = subtotal + estimatedShipping + tax;

    const handleShippingChange = (field: string, value: string) => {
        setShipping((prev) => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        if (!shipping.firstName || !shipping.lastName || !shipping.email || !shipping.phone ||
            !shipping.region || !shipping.town || !shipping.country) {
            showToast("Please fill in all required shipping details", "error");
            return false;
        }

        return true;
    };

    const handlePlaceOrder = async () => {
        if (items.length === 0) {
            showToast("Your cart is empty", "error");
            router.push("/");
            return;
        }

        if (!validateForm()) {
            return;
        }

        setProcessing(true);

        try {
            // Initialize Paystack payment
            const paymentResponse = await fetch("/api/paystack/initialize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: shipping.email,
                    amount: total,
                    metadata: {
                        customerName: `${shipping.firstName} ${shipping.lastName}`,
                        phone: shipping.phone,
                        shipping: JSON.stringify(shipping), // Store full shipping info as backup
                        custom_fields: [
                            {
                                display_name: "Customer Name",
                                variable_name: "customer_name",
                                value: `${shipping.firstName} ${shipping.lastName}`,
                            },
                            {
                                display_name: "Phone",
                                variable_name: "phone",
                                value: shipping.phone,
                            },
                        ],
                    },
                }),
            });

            const paymentData = await paymentResponse.json();

            if (!paymentData.success) {
                showToast(paymentData.error || "Failed to initialize payment", "error");
                setProcessing(false);
                return;
            }

            // Store shipping info, cart items, and payment reference for callback page
            // Use both sessionStorage and localStorage as backup
            sessionStorage.setItem("checkoutShipping", JSON.stringify(shipping));
            sessionStorage.setItem("checkoutItems", JSON.stringify(items));
            sessionStorage.setItem("paymentReference", paymentData.data.reference);
            // Also store in localStorage as backup (more persistent across redirects)
            localStorage.setItem("checkoutShipping", JSON.stringify(shipping));
            localStorage.setItem("checkoutItems", JSON.stringify(items));
            localStorage.setItem("paymentReference", paymentData.data.reference);

            // Redirect to Paystack's hosted checkout page
            window.location.href = paymentData.data.authorization_url;
        } catch (error) {
            console.error("Checkout error:", error);
            showToast("An error occurred. Please try again.", "error");
            setProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="mx-auto max-w-7xl px-6 py-24 text-center">
                    <h1 className="mb-4 text-3xl font-bold text-zinc-900">Your cart is empty</h1>
                    <p className="mb-8 text-zinc-600">Add some items to your cart to checkout</p>
                    <Button as={Link} href="/">
                        Continue Shopping
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <Header />
            <div className="mx-auto max-w-7xl px-6 py-8">
                <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
                    <ArrowLeft className="h-4 w-4" />
                    Continue Shopping
                </Link>

                <h1 className="mb-8 text-3xl font-bold text-zinc-900">Checkout</h1>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Address */}
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-2">
                                <Truck className="h-5 w-5 text-[var(--brand-red)]" />
                                <h2 className="text-xl font-bold text-zinc-900">Shipping Address</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        First Name *
                                    </label>
                                    <Input
                                        value={shipping.firstName}
                                        onChange={(e) => handleShippingChange("firstName", e.target.value)}
                                        placeholder="John"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        Last Name *
                                    </label>
                                    <Input
                                        value={shipping.lastName}
                                        onChange={(e) => handleShippingChange("lastName", e.target.value)}
                                        placeholder="Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        Email *
                                    </label>
                                    <Input
                                        type="email"
                                        value={shipping.email}
                                        onChange={(e) => handleShippingChange("email", e.target.value)}
                                        placeholder="john.doe@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        Phone Number *
                                    </label>
                                    <Input
                                        type="tel"
                                        value={shipping.phone}
                                        onChange={(e) => handleShippingChange("phone", e.target.value)}
                                        placeholder="+233 XX XXX XXXX"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        Region *
                                    </label>
                                    <Select
                                        value={shipping.region}
                                        onValueChange={(value) => handleShippingChange("region", value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Region" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {regions.map((region) => (
                                                <SelectItem key={region} value={region}>
                                                    {region}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        Landmark
                                    </label>
                                    <Input
                                        value={shipping.landmark}
                                        onChange={(e) => handleShippingChange("landmark", e.target.value)}
                                        placeholder="Near mall, school, etc."
                                    />
                                </div>
                                {shipping.region && (
                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                            Town/Area *
                                        </label>
                                        <Select
                                            value={shipping.town}
                                            onValueChange={(value) => handleShippingChange("town", value)}
                                            disabled={!shipping.region}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Town/Area" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {towns.map((town) => (
                                                    <SelectItem key={town} value={town}>
                                                        {town}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {!shipping.region && (
                                            <p className="mt-1 text-xs text-zinc-500">
                                                Please select a region first to see available towns
                                            </p>
                                        )}
                                    </div>
                                )}
                                {deliveryPrice && shipping.town && (
                                    <div className="sm:col-span-2">
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
                                                            ? `Delivery to ${shipping.town}`
                                                            : 'Standard delivery fee. Actual cost may vary.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        Digital Address (Ghana Post GPS)
                                    </label>
                                    <Input
                                        value={shipping.digitalAddress}
                                        onChange={(e) => handleShippingChange("digitalAddress", e.target.value)}
                                        placeholder="e.g., GA-123-4567"
                                    />
                                    <p className="mt-1 text-xs text-zinc-500">Optional but helps with faster delivery</p>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        Country *
                                    </label>
                                    <Input
                                        value={shipping.country}
                                        disabled
                                        className="bg-zinc-100 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 rounded-lg bg-white p-6 shadow-sm">
                            <h2 className="mb-6 text-xl font-bold text-zinc-900">Order Summary</h2>

                            <div className="mb-6 space-y-3">
                                {items.map((item, index) => (
                                    <div key={`${item.id}-${item.colorId || 'default'}-${index}`} className="flex gap-3">
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100">
                                            {item.image && (
                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                                            <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                                            <p className="text-sm font-semibold text-zinc-900">
                                                ₵{(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 border-t border-zinc-200 pt-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-600">Subtotal</span>
                                    <span className="font-semibold text-zinc-900">GH₵ {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-600">Delivery Fee</span>
                                    <span className="font-semibold text-zinc-900">
                                        {estimatedShipping > 0 ? `GH₵ ${estimatedShipping.toFixed(2)}` : 'FREE'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-t border-zinc-200 pt-2 text-base font-bold text-zinc-900">
                                    <span>Total</span>
                                    <span>GH₵ {total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500">
                                <Shield className="h-4 w-4" />
                                <span>Secure payment with Paystack</span>
                            </div>

                            <Button
                                onClick={handlePlaceOrder}
                                disabled={processing}
                                className="mt-6 w-full justify-center gap-2 py-3 text-base font-bold shadow-lg transition-all hover:shadow-xl"
                            >
                                {processing ? (
                                    <>
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Redirecting to Paystack...
                                    </>
                                ) : (
                                    "Proceed to Payment"
                                )}
                            </Button>

                            <p className="mt-4 text-center text-xs text-zinc-500">
                                You will be redirected to Paystack to complete your payment
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
