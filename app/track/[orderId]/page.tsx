"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Package, ArrowLeft, Phone, Mail } from "lucide-react";
import OrderProgressTracker from "../../components/OrderProgressTracker";
import type { Order } from "@/lib/firestore";

export default function OrderTrackingPage() {
    const params = useParams();
    const orderId = params.orderId as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`/api/orders/${orderId}`);
                const data = await response.json();

                if (data.success) {
                    setOrder(data.order);
                } else {
                    setError(data.error || "Order not found");
                }
            } catch (err) {
                setError("Failed to load order");
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                    <p className="text-zinc-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <Package className="mx-auto h-16 w-16 text-zinc-400 mb-4" />
                    <h1 className="text-2xl font-bold text-zinc-900 mb-2">Order Not Found</h1>
                    <p className="text-zinc-600 mb-6">{error}</p>
                    <Link
                        href="/"
                        className="inline-block rounded-lg bg-[var(--brand-red)] px-6 py-3 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    const estimatedDelivery = new Date(order.orderDate);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);

    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="mx-auto max-w-4xl px-6 py-12">
                {/* Header */}
                <Link
                    href="/"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Store
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900">Track Your Order</h1>
                    <p className="mt-2 text-zinc-600">
                        Order ID: <span className="font-semibold text-[var(--brand-red)]">{order.id}</span>
                    </p>
                </div>

                {/* Order Progress Tracker */}
                <div className="mb-6">
                    <OrderProgressTracker
                        currentStage={order.status}
                        orderDate={new Date(order.orderDate).toLocaleDateString()}
                        estimatedDelivery={estimatedDelivery.toLocaleDateString()}
                    />
                </div>

                {/* Order Details */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Shipping Address */}
                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-zinc-900">Shipping Address</h3>
                        <div className="text-sm text-zinc-600">
                            <p className="font-medium text-zinc-900">
                                {order.shipping?.firstName || ""} {order.shipping?.lastName || ""}
                            </p>
                            <p>{order.shipping?.address || "N/A"}</p>
                            <p>
                                {order.shipping?.city || ""}, {order.shipping?.state || ""} {order.shipping?.zipCode || ""}
                            </p>
                            <p>{order.shipping?.country || "N/A"}</p>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-zinc-900">Contact Information</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2 text-zinc-600">
                                <Mail className="h-4 w-4" />
                                <span>{order.guestEmail || order.shipping?.email || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-600">
                                <Phone className="h-4 w-4" />
                                <span>{order.guestPhone || order.shipping?.phone || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-zinc-900">Order Items</h3>
                    <div className="space-y-3">
                        {order.items.map((item: any, index: number) => (
                            <div key={index} className="flex items-center gap-3 border-b border-zinc-100 pb-3 last:border-0">
                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-16 w-16 rounded-lg object-cover"
                                    />
                                )}
                                <div className="flex-1">
                                    <p className="font-medium text-zinc-900">{item.name}</p>
                                    <div className="mt-1 flex gap-2 text-sm text-zinc-500">
                                        {item.size && <span>Size: {item.size}</span>}
                                        {item.size && item.colorId && <span>•</span>}
                                        {item.colorId && <span>Color: {item.colorId}</span>}
                                    </div>
                                    <p className="mt-1 text-sm text-zinc-500">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-semibold text-zinc-900">
                                    ₵{(item.price * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-6 space-y-2 border-t border-zinc-200 pt-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-600">Subtotal</span>
                            <span className="font-semibold text-zinc-900">₵{order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-600">Shipping</span>
                            <span className="font-semibold text-zinc-900">
                                {order.shippingCost === 0 ? (
                                    <span className="text-green-600">FREE</span>
                                ) : (
                                    `₵${order.shippingCost.toFixed(2)}`
                                )}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-600">Tax</span>
                            <span className="font-semibold text-zinc-900">₵{order.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-zinc-200 pt-2 text-base font-bold text-zinc-900">
                            <span>Total</span>
                            <span>₵{order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Support */}
                <div className="mt-6 rounded-lg border border-zinc-200 bg-blue-50 p-6">
                    <h3 className="mb-2 font-semibold text-blue-900">Need Help?</h3>
                    <p className="text-sm text-blue-700">
                        If you have any questions about your order, please contact our support team.
                    </p>
                </div>
            </div>
        </div>
    );
}
