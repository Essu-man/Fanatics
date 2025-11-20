"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Mail, Phone, MapPin, CreditCard, Clock } from "lucide-react";
import OrderStatusUpdater from "../../../components/admin/OrderStatusUpdater";
import OrderProgressTracker from "../../../components/OrderProgressTracker";
import type { Order } from "@/lib/database";

export default function AdminOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.orderId as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/orders/${orderId}`);
            const data = await response.json();

            if (data.success) {
                setOrder(data.order);
            } else {
                setError("Order not found");
            }
        } catch (err) {
            setError("Failed to load order");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                    <p className="text-zinc-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <Package className="mx-auto h-16 w-16 text-zinc-400 mb-4" />
                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">Order Not Found</h2>
                    <p className="text-zinc-600 mb-6">{error}</p>
                    <Link
                        href="/admin/orders"
                        className="inline-block rounded-lg bg-[var(--brand-red)] px-6 py-3 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                    >
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    const estimatedDelivery = new Date(order.order_date);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);

    const customerEmail = order.guest_email || order.shipping?.email;
    const customerPhone = order.guest_phone || order.shipping?.phone;
    const customerName = order.shipping
        ? `${order.shipping.firstName} ${order.shipping.lastName}`
        : "Customer";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/admin/orders"
                        className="mb-2 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Orders
                    </Link>
                    <h1 className="text-3xl font-bold text-zinc-900">Order Details</h1>
                    <p className="mt-1 text-sm text-zinc-600">
                        Order ID: <span className="font-semibold text-[var(--brand-red)]">{order.id}</span>
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content - 2 columns */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Order Progress */}
                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-zinc-900">Order Progress</h2>
                        <OrderProgressTracker
                            currentStage={order.status}
                            orderDate={new Date(order.order_date).toLocaleDateString()}
                            estimatedDelivery={estimatedDelivery.toLocaleDateString()}
                        />
                    </div>

                    {/* Order Items */}
                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-zinc-900">Order Items</h2>
                        <div className="space-y-3">
                            {order.items.map((item: any, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 border-b border-zinc-100 pb-3 last:border-0"
                                >
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-16 w-16 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-zinc-900">{item.name}</p>
                                        <p className="text-sm text-zinc-500">Qty: {item.quantity}</p>
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
                                    {order.shipping_cost === 0 ? (
                                        <span className="text-green-600">FREE</span>
                                    ) : (
                                        `₵${order.shipping_cost.toFixed(2)}`
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

                    {/* Customer & Shipping Info */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-bold text-zinc-900">Customer Information</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <Mail className="mt-0.5 h-4 w-4 text-zinc-400" />
                                    <div>
                                        <p className="text-xs text-zinc-500">Email</p>
                                        <p className="font-medium text-zinc-900">{customerEmail}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Phone className="mt-0.5 h-4 w-4 text-zinc-400" />
                                    <div>
                                        <p className="text-xs text-zinc-500">Phone</p>
                                        <p className="font-medium text-zinc-900">{customerPhone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-bold text-zinc-900">Shipping Address</h3>
                            <div className="flex items-start gap-2 text-sm">
                                <MapPin className="mt-0.5 h-4 w-4 text-zinc-400" />
                                <div>
                                    <p className="font-medium text-zinc-900">
                                        {order.shipping.firstName} {order.shipping.lastName}
                                    </p>
                                    <p className="text-zinc-600">{order.shipping.address}</p>
                                    <p className="text-zinc-600">
                                        {order.shipping.city}, {order.shipping.state} {order.shipping.zipCode}
                                    </p>
                                    <p className="text-zinc-600">{order.shipping.country}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-zinc-900">Payment Information</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-zinc-400" />
                                <span className="text-zinc-600">Method:</span>
                                <span className="font-medium text-zinc-900">Paystack</span>
                            </div>
                            {order.paystack_reference && (
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-zinc-400" />
                                    <span className="text-zinc-600">Reference:</span>
                                    <span className="font-mono text-xs font-medium text-zinc-900">
                                        {order.paystack_reference}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar - 1 column */}
                <div className="space-y-6">
                    {/* Status Updater */}
                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-zinc-900">Update Status</h3>
                        <OrderStatusUpdater
                            orderId={order.id}
                            currentStatus={order.status}
                            customerEmail={customerEmail}
                            customerPhone={customerPhone}
                            customerName={customerName}
                            onStatusUpdated={fetchOrder}
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-zinc-900">Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                                Print Packing Slip
                            </button>
                            <button className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                                Assign to Delivery
                            </button>
                            <Link
                                href={`/track/${order.id}`}
                                target="_blank"
                                className="block w-full rounded-lg border border-zinc-200 px-4 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                            >
                                View Public Tracking
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
