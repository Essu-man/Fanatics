"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, MapPin, CreditCard } from "lucide-react";
import { useCart } from "../../providers/CartProvider";
import CheckoutProgressTracker from "../../components/CheckoutProgressTracker";
import PaystackButton from "../../components/PaystackButton";

export default function CheckoutPaymentPage() {
    const router = useRouter();
    const { items, clear } = useCart();
    const [shippingInfo, setShippingInfo] = useState<any>(null);

    const getCartTotal = () => {
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    useEffect(() => {
        // Redirect if cart is empty
        if (items.length === 0) {
            router.push("/");
            return;
        }

        // Load shipping info from sessionStorage
        const saved = sessionStorage.getItem("checkoutShipping");
        if (!saved) {
            router.push("/checkout/shipping");
            return;
        }

        setShippingInfo(JSON.parse(saved));
    }, [items, router]);

    const handleBack = () => {
        router.push("/checkout/shipping");
    };

    const handlePaymentSuccess = async (reference: string) => {
        // Create order in database
        try {
            const response = await fetch("/api/orders/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items,
                    shipping: shippingInfo,
                    paymentReference: reference,
                    total: getCartTotal(),
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Clear cart
                clear();

                // Clear shipping info
                sessionStorage.removeItem("checkoutShipping");

                // Redirect to success page
                router.push(`/checkout/success?orderId=${data.orderId}`);
            } else {
                alert("Failed to create order. Please contact support.");
            }
        } catch (error) {
            console.error("Error creating order:", error);
            alert("An error occurred. Please contact support.");
        }
    };

    if (!shippingInfo) {
        return null; // Will redirect
    }

    const subtotal = getCartTotal();
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;

    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="mx-auto max-w-4xl px-6 py-8">
                {/* Progress Tracker */}
                <CheckoutProgressTracker currentStep={3} />

                {/* Page Title */}
                <div className="mb-8">
                    <button
                        onClick={handleBack}
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Shipping
                    </button>
                    <h1 className="text-3xl font-bold text-zinc-900">Payment</h1>
                    <p className="mt-1 text-sm text-zinc-600">
                        Review your order and complete payment
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Order Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Information */}
                        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-zinc-600" />
                                <h2 className="text-lg font-semibold text-zinc-900">Shipping Address</h2>
                            </div>
                            <div className="text-sm text-zinc-600">
                                <p className="font-medium text-zinc-900">
                                    {shippingInfo.firstName} {shippingInfo.lastName}
                                </p>
                                <p>{shippingInfo.address}</p>
                                <p>
                                    {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                                </p>
                                <p className="mt-2">{shippingInfo.email}</p>
                                <p>{shippingInfo.phone}</p>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <Package className="h-5 w-5 text-zinc-600" />
                                <h2 className="text-lg font-semibold text-zinc-900">Order Items</h2>
                            </div>
                            <div className="space-y-4">
                                {items.map((item: any) => (
                                    <div key={`${item.id}-${item.colorId || 'default'}`} className="flex gap-4">
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                                            {item.image && (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex flex-1 justify-between">
                                            <div>
                                                <p className="font-medium text-zinc-900">{item.name}</p>
                                                <p className="text-sm text-zinc-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold text-zinc-900">
                                                ₵{(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-zinc-600" />
                                <h2 className="text-lg font-semibold text-zinc-900">Payment Summary</h2>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-600">Subtotal</span>
                                    <span className="font-medium text-zinc-900">₵{subtotal.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-zinc-600">Shipping</span>
                                    <span className="font-medium text-green-600">FREE</span>
                                </div>

                                <div className="border-t border-zinc-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-zinc-900">Total</span>
                                        <span className="text-xl font-bold text-zinc-900">₵{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <PaystackButton
                                    email={shippingInfo.email}
                                    amount={total}
                                    onSuccess={handlePaymentSuccess}
                                    onClose={() => console.log("Payment closed")}
                                    metadata={{
                                        custom_fields: [
                                            {
                                                display_name: "Customer Name",
                                                variable_name: "customer_name",
                                                value: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
                                            },
                                            {
                                                display_name: "Phone",
                                                variable_name: "phone",
                                                value: shippingInfo.phone,
                                            },
                                        ],
                                    }}
                                />
                            </div>

                            {/* Security Info */}
                            <div className="mt-6 space-y-2 text-xs text-zinc-500">
                                <div className="flex items-center gap-2">
                                    <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Secure payment with Paystack</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Your data is encrypted</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
