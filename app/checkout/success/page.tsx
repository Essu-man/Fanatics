"use client";

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Button from "../../components/ui/button";
import { CheckCircle, Package, Mail, Home } from "lucide-react";
import OrderProgressTracker from "../../components/OrderProgressTracker";

function SuccessContent() {
    const [orderId, setOrderId] = useState<string>("");
    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        // Get orderId from URL
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const id = params.get("orderId");
            if (id) {
                setOrderId(id);

                // Load order details from localStorage
                try {
                    const stored = localStorage.getItem("cediman:orders");
                    if (stored) {
                        const orders = JSON.parse(stored);
                        const foundOrder = orders.find((o: any) => o.id === id);
                        if (foundOrder) {
                            setOrder(foundOrder);
                        }
                    }
                } catch (error) {
                    console.error("Error loading order:", error);
                }
            } else {
                // Fallback: generate a random order ID if not provided
                const fallbackId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
                setOrderId(fallbackId);
            }
        }
    }, []);

    // Calculate estimated delivery
    const orderDate = order ? new Date(order.orderDate) : new Date();
    const estimatedDelivery = new Date(orderDate);
    estimatedDelivery.setDate(orderDate.getDate() + 4);

    return (
        <div className="min-h-screen bg-zinc-50">
            <Header />
            <div className="mx-auto max-w-4xl px-6 py-12">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900">Order Confirmed!</h1>
                    <p className="mt-2 text-zinc-600">
                        Thank you for your purchase. Your order has been received.
                    </p>
                    <p className="mt-1 text-sm font-medium text-zinc-900">
                        Order ID: <span className="text-[var(--brand-red)]">{orderId}</span>
                    </p>
                </div>

                {/* Order Progress Tracker */}
                <div className="mb-6">
                    <OrderProgressTracker
                        currentStage="confirmed"
                        orderDate={orderDate.toLocaleDateString('en-GB')}
                        estimatedDelivery={estimatedDelivery.toLocaleDateString('en-GB')}
                    />
                </div>

                <div className="rounded-lg bg-white p-8 shadow-lg">
                    <div className="mb-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-left">
                        <h2 className="mb-4 text-lg font-semibold text-zinc-900">What's Next?</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 flex-shrink-0 text-[var(--brand-red)] mt-0.5" />
                                <div>
                                    <p className="font-medium text-zinc-900">Confirmation Email</p>
                                    <p className="text-sm text-zinc-600">
                                        We've sent an order confirmation email with your order details and tracking information.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Package className="h-5 w-5 flex-shrink-0 text-[var(--brand-red)] mt-0.5" />
                                <div>
                                    <p className="font-medium text-zinc-900">Order Processing</p>
                                    <p className="text-sm text-zinc-600">
                                        Your order is being processed and will be shipped within 2-3 business days.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Home className="h-5 w-5 flex-shrink-0 text-[var(--brand-red)] mt-0.5" />
                                <div>
                                    <p className="font-medium text-zinc-900">Delivery</p>
                                    <p className="text-sm text-zinc-600">
                                        You'll receive a tracking number via email once your order ships.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Button as={Link} href="/" variant="outline" className="gap-2">
                            <Home className="h-4 w-4" />
                            Continue Shopping
                        </Button>
                        <Button as={Link} href="/account/orders" className="gap-2">
                            <Package className="h-4 w-4" />
                            View All Orders
                        </Button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-50">
                <Header />
                <div className="mx-auto max-w-3xl px-6 py-16 text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                    <p className="text-zinc-600">Loading...</p>
                </div>
                <Footer />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}


