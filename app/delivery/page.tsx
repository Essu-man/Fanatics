"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Truck, CheckCircle, Clock, MapPin } from "lucide-react";
import type { Order } from "@/lib/database";

export default function DeliveryDashboardPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignedOrders();
    }, []);

    const fetchAssignedOrders = async () => {
        try {
            setLoading(true);
            const { getAllOrders } = await import("@/lib/database");
            const allOrders = await getAllOrders(100);

            // Filter orders that are ready for delivery or out for delivery
            const deliveryOrders = allOrders.filter(
                (order) =>
                    order.status === "in_transit" ||
                    order.status === "out_for_delivery" ||
                    order.status === "delivered"
            );

            setOrders(deliveryOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        pending: orders.filter((o) => o.status === "in_transit").length,
        outForDelivery: orders.filter((o) => o.status === "out_for_delivery").length,
        deliveredToday: orders.filter(
            (o) =>
                o.status === "delivered" &&
                new Date(o.order_date).toDateString() === new Date().toDateString()
        ).length,
        total: orders.length,
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                    <p className="text-zinc-600">Loading deliveries...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="mx-auto max-w-7xl px-6 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900">Delivery Dashboard</h1>
                    <p className="mt-1 text-sm text-zinc-600">Manage your assigned deliveries</p>
                </div>

                {/* Stats */}
                <div className="mb-8 grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-yellow-50 p-3">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-600">Pending</p>
                                <p className="text-2xl font-bold text-zinc-900">{stats.pending}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-orange-50 p-3">
                                <Truck className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-600">Out for Delivery</p>
                                <p className="text-2xl font-bold text-zinc-900">{stats.outForDelivery}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-green-50 p-3">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-600">Delivered Today</p>
                                <p className="text-2xl font-bold text-zinc-900">{stats.deliveredToday}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-50 p-3">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-600">Total Orders</p>
                                <p className="text-2xl font-bold text-zinc-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-zinc-900">Active Deliveries</h2>

                    {orders.length === 0 ? (
                        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center shadow-sm">
                            <Package className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
                            <h3 className="mb-2 text-lg font-semibold text-zinc-900">No deliveries assigned</h3>
                            <p className="text-zinc-600">Check back later for new delivery assignments</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {orders.map((order) => {
                                const statusConfig = {
                                    in_transit: { label: "Ready for Pickup", color: "bg-yellow-100 text-yellow-700" },
                                    out_for_delivery: { label: "Out for Delivery", color: "bg-orange-100 text-orange-700" },
                                    delivered: { label: "Delivered", color: "bg-green-100 text-green-700" },
                                };

                                const config = statusConfig[order.status as keyof typeof statusConfig];

                                return (
                                    <Link
                                        key={order.id}
                                        href={`/delivery/orders/${order.id}`}
                                        className="block rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <h3 className="font-semibold text-zinc-900">{order.id}</h3>
                                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${config.color}`}>
                                                        {config.label}
                                                    </span>
                                                </div>

                                                <div className="mb-3 flex items-start gap-2 text-sm text-zinc-600">
                                                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-medium text-zinc-900">
                                                            {order.shipping.firstName} {order.shipping.lastName}
                                                        </p>
                                                        <p>{order.shipping.address}</p>
                                                        <p>
                                                            {order.shipping.city}, {order.shipping.state}
                                                        </p>
                                                        <p className="mt-1 text-xs">{order.shipping.phone}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="text-zinc-600">
                                                        Items: <span className="font-semibold text-zinc-900">{order.items.length}</span>
                                                    </span>
                                                    <span className="text-zinc-600">
                                                        Total: <span className="font-semibold text-zinc-900">₵{order.total.toFixed(2)}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="ml-4">
                                                <button className="rounded-lg bg-[var(--brand-red)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-red-dark)]">
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
