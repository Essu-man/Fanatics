"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../providers/AuthProvider";
import { Package, Eye, ArrowLeft } from "lucide-react";

interface Order {
    id: string;
    orderDate: string;
    status: string;
    items: any[];
    total: number;
}

export default function OrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Wait for auth to finish loading before checking user
        if (!authLoading) {
            if (user?.id) {
                fetchOrders();
            } else {
                setLoading(false);
            }
        }
    }, [user, authLoading]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/orders/user?userId=${user?.id}`, { cache: "no-store" });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Unable to load orders");
            }

            // Map the API response to the Order interface
            const mappedOrders: Order[] = (data.orders || []).map((order: any) => ({
                id: order.id,
                orderDate: order.orderDate || order.order_date || new Date().toISOString(),
                status: order.status || "pending",
                items: order.items || [],
                total: Number(order.total || 0),
            }));

            setOrders(mappedOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // Show loading while auth is being checked
    if (authLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                    <p className="text-zinc-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Only show sign in prompt if auth has finished loading and user is not authenticated
    if (!user) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-zinc-900 mb-4">Please Sign In</h1>
                    <Link
                        href="/login?redirect=/account/orders"
                        className="inline-block rounded-lg bg-[var(--brand-red)] px-6 py-3 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    // Show loading while orders are being fetched
    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                    <p className="text-zinc-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="mx-auto max-w-7xl px-6 py-12">
                {/* Header */}
                <Link
                    href="/"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900">My Orders</h1>
                    <p className="mt-2 text-zinc-600">View and track all your orders</p>
                </div>

                {/* Orders List */}
                {orders.length === 0 ? (
                    <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center shadow-sm">
                        <Package className="mx-auto h-12 w-12 text-zinc-400" />
                        <h3 className="mt-4 text-lg font-semibold text-zinc-900">No orders yet</h3>
                        <p className="mt-2 text-sm text-zinc-600">
                            Start shopping to see your orders here
                        </p>
                        <Link
                            href="/"
                            className="mt-6 inline-block rounded-lg bg-[var(--brand-red)] px-6 py-3 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-900">{order.id}</h3>
                                        <p className="mt-1 text-sm text-zinc-600">
                                            Placed on {new Date(order.orderDate).toLocaleDateString('en-GB')}
                                        </p>
                                        <p className="mt-1 text-sm">
                                            <span className="font-medium text-zinc-900">
                                                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                                            </span>
                                            {" · "}
                                            <span className="font-bold text-zinc-900">
                                                ₵{order.total.toFixed(2)}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${order.status === "delivered"
                                                ? "bg-green-100 text-green-700"
                                                : order.status === "shipped"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="mt-4 space-y-2">
                                    {order.items.slice(0, 3).map((item, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            {item.image && (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-12 w-12 rounded-lg object-cover"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                                                <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-semibold text-zinc-900">
                                                ₵{(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <p className="text-xs text-zinc-500">
                                            +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? "s" : ""}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-4 flex gap-3">
                                    <Link
                                        href={`/orders/${order.id}`}
                                        className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                                    >
                                        <Eye className="h-4 w-4" />
                                        View Details
                                    </Link>
                                    <button className="rounded-lg border border-[var(--brand-red)] px-4 py-2 text-sm font-medium text-[var(--brand-red)] hover:bg-red-50">
                                        Reorder
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
