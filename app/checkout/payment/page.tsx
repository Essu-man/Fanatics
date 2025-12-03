"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, MapPin } from "lucide-react";
import { useCart } from "../../providers/CartProvider";
import CheckoutProgressTracker from "../../components/CheckoutProgressTracker";
import PaystackButton from "../../components/PaystackButton";

export default function CheckoutPaymentPage() {
    const router = useRouter();
    const { items } = useCart();
    const [shippingInfo, setShippingInfo] = useState<any>(null);
    const [deliveryPrice, setDeliveryPrice] = useState(0);

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

        // Load delivery price from sessionStorage
        const savedDeliveryPrice = sessionStorage.getItem("deliveryPrice");
        if (savedDeliveryPrice) {
            const priceData = JSON.parse(savedDeliveryPrice);
            setDeliveryPrice(priceData.price || 0);
        }
    }, [items, router]);

    const handleBack = () => {
        router.push("/checkout/shipping");
    };

    if (!shippingInfo) {
        return null; // Will redirect
    }

    const subtotal = getCartTotal();
    const shipping = deliveryPrice;
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
                    <h1 className="text-3xl font-bold text-zinc-900">Review & Pay</h1>
                    <p className="mt-1 text-sm text-zinc-600">
                        Review your order and proceed to payment
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
                                {shippingInfo.landmark && <p>Landmark: {shippingInfo.landmark}</p>}
                                <p>
                                    {shippingInfo.town}, {shippingInfo.city}
                                </p>
                                <p>{shippingInfo.region}</p>
                                {shippingInfo.digitalAddress && <p>Digital Address: {shippingInfo.digitalAddress}</p>}
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
                                {items.map((item: any, index: number) => (
                                    <div key={`${item.id}-${item.colorId || 'default'}-${index}`} className="flex gap-4">
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
                            <h2 className="mb-4 text-lg font-semibold text-zinc-900">Order Summary</h2>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-600">Subtotal</span>
                                    <span className="font-medium text-zinc-900">GH₵ {subtotal.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-zinc-600">Delivery Fee</span>
                                    <span className="font-medium text-zinc-900">
                                        {shipping > 0 ? `GH₵ ${shipping.toFixed(2)}` : 'FREE'}
                                    </span>
                                </div>

                                <div className="border-t border-zinc-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-zinc-900">Total</span>
                                        <span className="text-xl font-bold text-zinc-900">GH₵ {total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <PaystackButton
                                    email={shippingInfo.email}
                                    amount={total}
                                    onSuccess={() => { }}
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
                                    className="w-full"
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
                                    <span>You will be redirected to Paystack</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
``