"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Eye,
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    DollarSign,
    RefreshCw,
    Filter,
    Trash2,
} from "lucide-react";
import { useToast } from "../../components/ui/ToastContainer";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";

type OrderStatus =
    | "submitted"
    | "confirmed"
    | "processing"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";

type AdminOrder = {
    id: string;
    userId?: string | null;
    guestEmail?: string | null;
    guestPhone?: string | null;
    orderDate: string;
    status: OrderStatus;
    items: any[];
    shipping?: any;
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    statusHistory?: any[];
};

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
    submitted: { label: "Submitted", color: "bg-gray-100 text-gray-700", icon: Clock },
    confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700", icon: Package },
    processing: { label: "Processing", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    in_transit: { label: "In Transit", color: "bg-purple-100 text-purple-700", icon: Truck },
    out_for_delivery: { label: "Out for Delivery", color: "bg-orange-100 text-orange-700", icon: Truck },
    delivered: { label: "Delivered", color: "bg-green-100 text-green-700", icon: CheckCircle },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function AdminOrdersPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
    const [statusDraft, setStatusDraft] = useState<Record<string, OrderStatus>>({});
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [fixingOrders, setFixingOrders] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        setStatusDraft((prev) => {
            const next: Record<string, OrderStatus> = {};
            orders.forEach((order) => {
                next[order.id] = prev[order.id] || order.status;
            });
            return next;
        });
    }, [orders]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/orders/admin?limit=200", { cache: "no-store" });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Unable to load orders");
            }

            const normalized: AdminOrder[] = data.orders.map((order: any) => ({
                id: order.id,
                userId: order.userId ?? order.user_id ?? null,
                guestEmail: order.guestEmail ?? order.guest_email ?? null,
                guestPhone: order.guestPhone ?? order.guest_phone ?? null,
                orderDate: order.orderDate ?? order.order_date ?? new Date().toISOString(),
                status: order.status,
                items: order.items || [],
                shipping: order.shipping || {},
                subtotal: Number(order.subtotal ?? order.subTotal ?? 0),
                shippingCost: Number(order.shippingCost ?? order.shipping_cost ?? 0),
                tax: Number(order.tax ?? 0),
                total: Number(order.total ?? 0),
                statusHistory: order.statusHistory ?? order.status_history ?? [],
            }));

            setOrders(normalized);
        } catch (error) {
            console.error("Error fetching orders:", error);
            showToast("Failed to load orders", "error");
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                order.id.toLowerCase().includes(query) ||
                (order.guestEmail?.toLowerCase() || "").includes(query) ||
                (order.shipping?.email?.toLowerCase() || "").includes(query);

            const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchQuery, selectedStatus]);

    const statusCounts = {
        all: orders.length,
        submitted: orders.filter((o) => o.status === "submitted").length,
        confirmed: orders.filter((o) => o.status === "confirmed").length,
        processing: orders.filter((o) => o.status === "processing").length,
        in_transit: orders.filter((o) => o.status === "in_transit").length,
        out_for_delivery: orders.filter((o) => o.status === "out_for_delivery").length,
        delivered: orders.filter((o) => o.status === "delivered").length,
        cancelled: orders.filter((o) => o.status === "cancelled").length,
    };

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const todayRevenue = orders
        .filter((o) => {
            const orderDate = new Date(o.orderDate);
            const today = new Date();
            return orderDate.toDateString() === today.toDateString();
        })
        .reduce((sum, order) => sum + (order.total || 0), 0);
    const pendingOrders = orders.filter((o) =>
        ["submitted", "confirmed", "processing", "in_transit", "out_for_delivery"].includes(o.status)
    ).length;

    const handleFixUserOrders = async () => {
        if (!confirm("This will match all orders with userId: null to users by email and update them. Continue?")) {
            return;
        }

        setFixingOrders(true);
        try {
            const response = await fetch("/api/admin/fix-user-orders", {
                method: "POST",
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to fix orders");
            }

            showToast(
                `Successfully updated ${data.stats.updated} orders! (${data.stats.matched} matched, ${data.stats.notMatched} not matched)`,
                "success"
            );

            // Refresh orders list
            fetchOrders();
        } catch (error) {
            console.error("Error fixing orders:", error);
            showToast("Failed to fix orders", "error");
        } finally {
            setFixingOrders(false);
        }
    };

    const handleDeleteOrder = async (orderId: string, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent row click

        if (!confirm(`Are you sure you want to delete order ${orderId}? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to delete order");
            }

            showToast("Order deleted successfully", "success");
            fetchOrders(); // Refresh the orders list
        } catch (error) {
            console.error("Error deleting order:", error);
            showToast("Failed to delete order", "error");
        }
    };

    const handleInlineStatusUpdate = async (order: AdminOrder) => {
        const nextStatus = statusDraft[order.id];
        if (!nextStatus || nextStatus === order.status) {
            showToast("Select a different status to update", "info");
            return;
        }

        try {
            setUpdatingId(order.id);
            const response = await fetch("/api/orders/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: order.id,
                    status: nextStatus,
                    customerEmail: order.guestEmail || order.shipping?.email,
                    customerPhone: order.guestPhone || order.shipping?.phone,
                    customerName: order.shipping
                        ? `${order.shipping.firstName || ""} ${order.shipping.lastName || ""}`.trim() || "Customer"
                        : "Customer",
                }),
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to update status");
            }

            showToast("Order status updated", "success");
            await fetchOrders();
        } catch (error) {
            console.error("Inline status update error:", error);
            showToast(error instanceof Error ? error.message : "Failed to update status", "error");
        } finally {
            setUpdatingId(null);
        }
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">Orders Management</h1>
                    <p className="mt-1 text-sm text-zinc-600">Manage and track all customer orders in real-time</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleFixUserOrders}
                        disabled={fixingOrders}
                        className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Fix User Orders - Match orders to users by email"
                    >
                        {fixingOrders ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                <span className="hidden sm:inline">Fixing...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4" />
                                <span className="hidden sm:inline">Fix User Orders</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={fetchOrders}
                        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                        title="Refresh Orders"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-zinc-600">Total Revenue</p>
                            <p className="mt-2 text-3xl font-bold text-green-700">₵{totalRevenue.toFixed(2)}</p>
                            <p className="mt-1 text-xs text-zinc-500">All time</p>
                        </div>
                        <div className="rounded-full bg-green-100 p-3">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-zinc-600">Today's Revenue</p>
                            <p className="mt-2 text-3xl font-bold text-blue-700">₵{todayRevenue.toFixed(2)}</p>
                            <p className="mt-1 text-xs text-zinc-500">
                                From{" "}
                                {
                                    orders.filter((o) => {
                                        const orderDate = new Date(o.orderDate);
                                        const today = new Date();
                                        return orderDate.toDateString() === today.toDateString();
                                    }).length
                                }{" "}
                                orders
                            </p>
                        </div>
                        <div className="rounded-full bg-blue-100 p-3">
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-zinc-600">Total Orders</p>
                            <p className="mt-2 text-3xl font-bold text-purple-700">{statusCounts.all}</p>
                            <p className="mt-1 text-xs text-zinc-500">{pendingOrders} pending</p>
                        </div>
                        <div className="rounded-full bg-purple-100 p-3">
                            <Package className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-zinc-600">Delivered</p>
                            <p className="mt-2 text-3xl font-bold text-emerald-700">{statusCounts.delivered}</p>
                            <p className="mt-1 text-xs text-zinc-500">
                                {statusCounts.all > 0
                                    ? `${Math.round((statusCounts.delivered / statusCounts.all) * 100)}% completion rate`
                                    : "No orders yet"}
                            </p>
                        </div>
                        <div className="rounded-full bg-emerald-100 p-3">
                            <CheckCircle className="h-6 w-6 text-emerald-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <button
                    onClick={() => setSelectedStatus("all")}
                    className={`rounded-lg border-2 p-3 text-center transition-all ${selectedStatus === "all"
                        ? "border-[var(--brand-red)] bg-red-50"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                        }`}
                >
                    <p className="text-2xl font-bold text-zinc-900">{statusCounts.all}</p>
                    <p className="mt-1 text-xs font-medium text-zinc-600">All Orders</p>
                </button>
                {Object.entries(statusConfig).map(([status, config]) => {
                    const Icon = config.icon;
                    return (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status as OrderStatus)}
                            className={`rounded-lg border-2 p-3 text-center transition-all ${selectedStatus === status
                                ? "border-[var(--brand-red)] bg-red-50"
                                : "border-zinc-200 bg-white hover:border-zinc-300"
                                }`}
                        >
                            <Icon
                                className={`mx-auto h-5 w-5 ${config.color
                                    .replace("bg-", "text-")
                                    .replace("-100", "-600")}`}
                            />
                            <p className="mt-1 text-xl font-bold text-zinc-900">
                                {statusCounts[status as keyof typeof statusCounts]}
                            </p>
                            <p className="mt-0.5 text-xs font-medium text-zinc-600">{config.label}</p>
                        </button>
                    );
                })}
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <Filter className="h-4 w-4 text-zinc-500" />
                    <h3 className="text-sm font-semibold text-zinc-700">Filters & Search</h3>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="search"
                            placeholder="Search by Order ID, email, or customer name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Select
                            value={selectedStatus}
                            onValueChange={(value) => setSelectedStatus(value as OrderStatus | "all")}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses ({statusCounts.all})</SelectItem>
                                <SelectItem value="submitted">Submitted ({statusCounts.submitted})</SelectItem>
                                <SelectItem value="confirmed">Confirmed ({statusCounts.confirmed})</SelectItem>
                                <SelectItem value="processing">Processing ({statusCounts.processing})</SelectItem>
                                <SelectItem value="in_transit">In Transit ({statusCounts.in_transit})</SelectItem>
                                <SelectItem value="out_for_delivery">
                                    Out for Delivery ({statusCounts.out_for_delivery})
                                </SelectItem>
                                <SelectItem value="delivered">Delivered ({statusCounts.delivered})</SelectItem>
                                <SelectItem value="cancelled">Cancelled ({statusCounts.cancelled})</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {(searchQuery || selectedStatus !== "all") && (
                    <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-zinc-500">
                            Showing {filteredOrders.length} of {orders.length} orders
                        </span>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedStatus("all");
                            }}
                            className="text-xs text-[var(--brand-red)] hover:underline"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-zinc-200 bg-gradient-to-r from-zinc-50 to-zinc-100">
                            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Items</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredOrders.map((order) => {
                                const StatusIcon = statusConfig[order.status].icon;
                                const customerEmail = order.guestEmail || order.shipping?.email || "N/A";
                                const customerName = order.shipping
                                    ? `${order.shipping.firstName || ""} ${order.shipping.lastName || ""}`.trim() ||
                                    "Guest"
                                    : "Guest";
                                const orderDate = new Date(order.orderDate);
                                const isRecent = Date.now() - orderDate.getTime() < 24 * 60 * 60 * 1000;
                                const draftValue = statusDraft[order.id] || order.status;

                                return (
                                    <tr
                                        key={order.id}
                                        className="cursor-pointer text-sm transition-colors hover:bg-gradient-to-r hover:from-zinc-50 hover:to-white"
                                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <p className="font-mono font-semibold text-zinc-900">{order.id}</p>
                                                {isRecent && (
                                                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                                        New
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="font-semibold text-zinc-900">{customerName}</p>
                                                <p className="max-w-[200px] truncate text-xs text-zinc-500">
                                                    {customerEmail}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-zinc-400" />
                                                <span className="font-medium text-zinc-700">{order.items.length}</span>
                                                <span className="text-xs text-zinc-500">
                                                    item{order.items.length !== 1 ? "s" : ""}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-zinc-900">₵{order.total.toFixed(2)}</p>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${statusConfig[order.status].color}`}
                                            >
                                                <StatusIcon className="h-3.5 w-3.5" />
                                                {statusConfig[order.status].label}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium text-zinc-900">
                                                    {orderDate.toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                                <p className="text-xs text-zinc-500">
                                                    {orderDate.toLocaleTimeString("en-US", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        </td>
                                        <td
                                            className="p-4"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                        >
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                                                <Select
                                                    value={draftValue}
                                                    onValueChange={(value) =>
                                                        setStatusDraft((prev) => ({
                                                            ...prev,
                                                            [order.id]: value as OrderStatus,
                                                        }))
                                                    }
                                                >
                                                    <SelectTrigger className="w-[140px] text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(statusConfig).map(([key, config]) => (
                                                            <SelectItem key={key} value={key}>
                                                                {config.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <button
                                                    onClick={() => handleInlineStatusUpdate(order)}
                                                    disabled={draftValue === order.status || updatingId === order.id}
                                                    className="rounded-lg bg-[var(--brand-red)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--brand-red-dark)] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {updatingId === order.id ? "Updating..." : "Update"}
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                                                    className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteOrder(order.id, e)}
                                                    className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                                                    title="Delete Order"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="py-12 text-center">
                        <Package className="mx-auto mb-3 h-12 w-12 text-zinc-400" />
                        <p className="text-sm font-medium text-zinc-900">No orders found</p>
                        <p className="mt-1 text-xs text-zinc-500">
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

