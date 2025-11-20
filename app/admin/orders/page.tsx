"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import type { Order } from "@/lib/database";

type OrderStatus = "confirmed" | "processing" | "in_transit" | "out_for_delivery" | "delivered" | "cancelled";

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
    confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700", icon: Package },
    processing: { label: "Processing", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    in_transit: { label: "In Transit", color: "bg-purple-100 text-purple-700", icon: Truck },
    out_for_delivery: { label: "Out for Delivery", color: "bg-orange-100 text-orange-700", icon: Truck },
    delivered: { label: "Delivered", color: "bg-green-100 text-green-700", icon: CheckCircle },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function AdminOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { getAllOrders } = await import("@/lib/database");
            const fetchedOrders = await getAllOrders(100);
            setOrders(fetchedOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.guest_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.shipping?.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const statusCounts = {
        all: orders.length,
        confirmed: orders.filter((o) => o.status === "confirmed").length,
        processing: orders.filter((o) => o.status === "processing").length,
        in_transit: orders.filter((o) => o.status === "in_transit").length,
        out_for_delivery: orders.filter((o) => o.status === "out_for_delivery").length,
        delivered: orders.filter((o) => o.status === "delivered").length,
        cancelled: orders.filter((o) => o.status === "cancelled").length,
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                    <p className="text-zinc-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-zinc-900">Orders</h1>
                <p className="mt-1 text-sm text-zinc-600">
                    Manage and track all customer orders
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-600">Total Orders</p>
                    <p className="mt-1 text-2xl font-bold text-zinc-900">{statusCounts.all}</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-600">Confirmed</p>
                    <p className="mt-1 text-2xl font-bold text-blue-600">{statusCounts.confirmed}</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-600">Processing</p>
                    <p className="mt-1 text-2xl font-bold text-yellow-600">{statusCounts.processing}</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-600">Delivered</p>
                    <p className="mt-1 text-2xl font-bold text-green-600">{statusCounts.delivered}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="search"
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-red)]"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | "all")}
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-red)]"
                    >
                        <option value="all">All Statuses ({statusCounts.all})</option>
                        <option value="confirmed">Confirmed ({statusCounts.confirmed})</option>
                        <option value="processing">Processing ({statusCounts.processing})</option>
                        <option value="in_transit">In Transit ({statusCounts.in_transit})</option>
                        <option value="out_for_delivery">Out for Delivery ({statusCounts.out_for_delivery})</option>
                        <option value="delivered">Delivered ({statusCounts.delivered})</option>
                        <option value="cancelled">Cancelled ({statusCounts.cancelled})</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-zinc-200 bg-zinc-50">
                            <tr className="text-left text-sm font-medium text-zinc-600">
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Items</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredOrders.map((order) => {
                                const StatusIcon = statusConfig[order.status].icon;
                                const customerEmail = order.guest_email || order.shipping?.email || "N/A";
                                const customerName = order.shipping
                                    ? `${order.shipping.firstName} ${order.shipping.lastName}`
                                    : "Guest";

                                return (
                                    <tr key={order.id} className="text-sm hover:bg-zinc-50">
                                        <td className="p-4">
                                            <p className="font-medium text-zinc-900">{order.id}</p>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium text-zinc-900">{customerName}</p>
                                                <p className="text-xs text-zinc-500">{customerEmail}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-zinc-600">{order.items.length}</td>
                                        <td className="p-4 font-semibold text-zinc-900">
                                            ₵{order.total.toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig[order.status].color}`}
                                            >
                                                <StatusIcon className="h-3 w-3" />
                                                {statusConfig[order.status].label}
                                            </span>
                                        </td>
                                        <td className="p-4 text-zinc-600">
                                            {new Date(order.order_date).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => router.push(`/admin/orders/${order.id}`)}
                                                className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="py-12 text-center">
                        <Package className="mx-auto h-12 w-12 text-zinc-400 mb-3" />
                        <p className="text-sm font-medium text-zinc-900">No orders found</p>
                        <p className="text-xs text-zinc-500 mt-1">
                            {searchQuery || selectedStatus !== "all"
                                ? "Try adjusting your filters"
                                : "Orders will appear here once customers make purchases"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
