"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Package, Camera, CheckCircle } from "lucide-react";
import { useToast } from "../../../components/ui/ToastContainer";
import type { Order } from "@/lib/database";

export default function DeliveryOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const orderId = params.orderId as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/orders/${orderId}`);
            const data = await response.json();

            if (data.success) {
                setOrder(data.order);
            }
        } catch (error) {
            console.error("Error fetching order:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsOutForDelivery = async () => {
        if (!order) return;

        setUpdating(true);
        try {
            const response = await fetch("/api/orders/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: order.id,
                    status: "out_for_delivery",
                    customerEmail: order.guest_email || order.shipping?.email,
                    customerPhone: order.guest_phone || order.shipping?.phone,
                    customerName: order.shipping
                        ? `${order.shipping.firstName} ${order.shipping.lastName}`
                        : "Customer",
                }),
            });

            const data = await response.json();

            if (data.success) {
                showToast("Order marked as out for delivery! Customer notified.", "success");
                fetchOrder();
            } else {
                showToast("Failed to update status", "error");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            showToast("An error occurred", "error");
        } finally {
            setUpdating(false);
        }
    };

    const handleMarkAsDelivered = async () => {
        if (!order) return;

        setUpdating(true);
        try {
            const response = await fetch("/api/orders/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: order.id,
                    status: "delivered",
                    customerEmail: order.guest_email || order.shipping?.email,
                    customerPhone: order.guest_phone || order.shipping?.phone,
                    customerName: order.shipping
                        ? `${order.shipping.firstName} ${order.shipping.lastName}`
                        : "Customer",
                }),
            });

            const data = await response.json();

            if (data.success) {
                showToast("Order marked as delivered! Customer notified.", "success");
                fetchOrder();
            } else {
                showToast("Failed to update status", "error");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            showToast("An error occurred", "error");
        } finally {
            setUpdating(false);
        }
    };

    const handleNavigate = () => {
        if (!order) return;
        const address = `${order.shipping.address}, ${order.shipping.city}, ${order.shipping.state}`;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        window.open(mapsUrl, "_blank");
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                    <p className="text-zinc-600">Loading order...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50">
                <div className="text-center">
                    <Package className="mx-auto mb-4 h-16 w-16 text-zinc-400" />
                    <h2 className="mb-2 text-2xl font-bold text-zinc-900">Order Not Found</h2>
                    <Link
                        href="/delivery"
                        className="inline-block rounded-lg bg-[var(--brand-red)] px-6 py-3 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="mx-auto max-w-4xl px-6 py-12">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/delivery"
                        className="mb-2 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-zinc-900">Delivery Details</h1>
                    <p className="mt-1 text-sm text-zinc-600">Order ID: {order.id}</p>
                </div>

                <div className="space-y-6">
                    {/* Customer & Address */}
                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-zinc-900">Delivery Address</h2>
                        <div className="mb-4 flex items-start gap-3">
                            <MapPin className="mt-1 h-5 w-5 text-zinc-400" />
                            <div>
                                <p className="font-semibold text-zinc-900">
                                    {order.shipping.firstName} {order.shipping.lastName}
                                </p>
                                <p className="text-zinc-600">{order.shipping.address}</p>
                                <p className="text-zinc-600">
                                    {order.shipping.city}, {order.shipping.state} {order.shipping.zipCode}
                                </p>
                            </div>
                        </div>

                        <div className="mb-4 flex items-center gap-3">
                            <Phone className="h-5 w-5 text-zinc-400" />
                            <a
                                href={`tel:${order.shipping.phone}`}
                                className="font-medium text-[var(--brand-red)] hover:underline"
                            >
                                {order.shipping.phone}
                            </a>
                        </div>

                        <button
                            onClick={handleNavigate}
                            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                        >
                            Navigate with Google Maps
                        </button>
                    </div>

                    {/* Order Items */}
                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-zinc-900">Order Items</h2>
                        <div className="space-y-3">
                            {order.items.map((item: any, index: number) => (
                                <div key={index} className="flex items-center gap-3 border-b border-zinc-100 pb-3 last:border-0">
                                    {item.image && (
                                        <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-zinc-900">{item.name}</p>
                                        <p className="text-sm text-zinc-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-zinc-900">₵{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 border-t border-zinc-200 pt-4">
                            <div className="flex items-center justify-between font-bold text-zinc-900">
                                <span>Total</span>
                                <span>₵{order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-zinc-900">Delivery Actions</h2>
                        <div className="space-y-3">
                            {order.status === "in_transit" && (
                                <button
                                    onClick={handleMarkAsOutForDelivery}
                                    disabled={updating}
                                    className="w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                                >
                                    {updating ? "Updating..." : "Mark as Out for Delivery"}
                                </button>
                            )}

                            {order.status === "out_for_delivery" && (
                                <>
                                    <button
                                        onClick={handleMarkAsDelivered}
                                        disabled={updating}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                                    >
                                        <CheckCircle className="h-5 w-5" />
                                        {updating ? "Updating..." : "Mark as Delivered"}
                                    </button>

                                    <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 py-3 font-medium text-zinc-700 hover:bg-zinc-50">
                                        <Camera className="h-5 w-5" />
                                        Upload Delivery Proof
                                    </button>
                                </>
                            )}

                            {order.status === "delivered" && (
                                <div className="rounded-lg bg-green-50 p-4 text-center">
                                    <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
                                    <p className="font-semibold text-green-900">Order Delivered</p>
                                    <p className="text-sm text-green-700">This order has been successfully delivered</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
