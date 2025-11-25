"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../providers/CartProvider";
import { useToast } from "../components/ui/ToastContainer";
import Button from "../components/ui/button";
import Input from "../components/ui/input";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Shield, Truck, ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
    const router = useRouter();
    const { items, clear } = useCart();
    const { showToast } = useToast();

    const [processing, setProcessing] = useState(false);

    // Shipping form state
    const [shipping, setShipping] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Ghana",
    });

    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const estimatedShipping = 0; // Free shipping
    const tax = 0; // No tax
    const total = subtotal + estimatedShipping + tax;

    const handleShippingChange = (field: string, value: string) => {
        setShipping((prev) => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        if (!shipping.firstName || !shipping.lastName || !shipping.email || !shipping.phone ||
            !shipping.address || !shipping.city || !shipping.state || !shipping.zipCode) {
            showToast("Please fill in all shipping details", "error");
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
            sessionStorage.setItem("checkoutShipping", JSON.stringify(shipping));
            sessionStorage.setItem("checkoutItems", JSON.stringify(items));
            sessionStorage.setItem("paymentReference", paymentData.data.reference);

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
                                <div className="sm:col-span-2">
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
                                <div className="sm:col-span-2">
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
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        Address *
                                    </label>
                                    <Input
                                        value={shipping.address}
                                        onChange={(e) => handleShippingChange("address", e.target.value)}
                                        placeholder="Street address"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        City *
                                    </label>
                                    <Input
                                        value={shipping.city}
                                        onChange={(e) => handleShippingChange("city", e.target.value)}
                                        placeholder="Accra"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        State/Region *
                                    </label>
                                    <Input
                                        value={shipping.state}
                                        onChange={(e) => handleShippingChange("state", e.target.value)}
                                        placeholder="Greater Accra"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        ZIP/Postal Code *
                                    </label>
                                    <Input
                                        value={shipping.zipCode}
                                        onChange={(e) => handleShippingChange("zipCode", e.target.value)}
                                        placeholder="00233"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        Country *
                                    </label>
                                    <Input
                                        value={shipping.country}
                                        onChange={(e) => handleShippingChange("country", e.target.value)}
                                        required
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
                                    <span className="font-semibold text-zinc-900">₵{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-600">Shipping</span>
                                    <span className="font-semibold text-green-600">FREE</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-zinc-200 pt-2 text-base font-bold text-zinc-900">
                                    <span>Total</span>
                                    <span>₵{total.toFixed(2)}</span>
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
