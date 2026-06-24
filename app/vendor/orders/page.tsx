"use client";

import { useEffect, useState, useCallback } from "react";
import { auth } from "@/lib/firebase";
import { useToast } from "@/app/components/ui/ToastContainer";
import { ClipboardList, Phone, MapPin, CheckCircle2, Clock, Loader2, Calendar } from "lucide-react";

interface OrderItem {
    id: string;
    productId?: string;
    name: string;
    productName?: string;
    price: number;
    quantity: number;
    colorId: string | null;
    size: string;
    image: string | null;
    fulfillmentStatus?: "pending" | "processing" | "ready" | "shipped" | "delivered";
    customization?: {
        playerName?: string;
        playerNumber?: string;
    };
}

interface Order {
    id: string;
    orderDate: string;
    status: string;
    shipping: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        region: string;
        town: string;
        landmark: string;
        digitalAddress: string;
    };
    items: OrderItem[];
    subtotal: number;
    shippingCost: number;
    total: number;
}

const ORDER_STATUS_LABELS: Record<string, string> = {
    awaiting_payment: "Awaiting payment",
    submitted: "Paid & Submitted",
    confirmed: "Confirmed",
    processing: "Processing",
    in_transit: "In Transit",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

const FULFILLMENT_LABELS: Record<string, string> = {
    pending: "Pending",
    processing: "Processing",
    ready: "Ready for Pickup",
    shipped: "Shipped",
    delivered: "Delivered",
};

export default function VendorOrdersPage() {
    const { showToast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "pending" | "ready" | "completed">("all");

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch("/api/vendor/orders", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                cache: "no-store",
            });
            const data = await res.json();
            if (data.success) {
                setOrders(data.orders || []);
            } else {
                throw new Error(data.error || "Failed to load orders");
            }
        } catch (e: any) {
            showToast(e.message || "Failed to load orders", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const handleFulfillmentUpdate = async (
        orderId: string,
        productId: string,
        colorId: string | null,
        size: string,
        status: "pending" | "processing" | "ready" | "shipped" | "delivered"
    ) => {
        const updateKey = `${orderId}-${productId}-${colorId || "default"}-${size}`;
        setUpdatingId(updateKey);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch("/api/vendor/orders", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    orderId,
                    productId,
                    colorId,
                    size,
                    fulfillmentStatus: status,
                }),
            });
            const data = await res.json();
            if (data.success) {
                showToast("Fulfillment status updated", "success");
                loadOrders();
            } else {
                throw new Error(data.error || "Failed to update status");
            }
        } catch (e: any) {
            showToast(e.message || "Failed to update status", "error");
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredOrders = orders.filter((order) => {
        if (filter === "all") return true;
        if (filter === "pending") {
            return order.items.some((item) => !item.fulfillmentStatus || item.fulfillmentStatus === "pending" || item.fulfillmentStatus === "processing");
        }
        if (filter === "ready") {
            return order.items.some((item) => item.fulfillmentStatus === "ready");
        }
        if (filter === "completed") {
            return order.items.every((item) => item.fulfillmentStatus === "shipped" || item.fulfillmentStatus === "delivered") || order.status === "delivered";
        }
        return true;
    });

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-[var(--brand-red)]" />
                    <p className="mt-2 text-sm text-zinc-600 font-bold">Loading orders…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black text-zinc-900">Orders Management</h1>
                <p className="mt-1 text-sm text-zinc-600 font-semibold">
                    Review client customizations, shipping addresses, and coordinate fulfillment states.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {(
                    [
                        { key: "all" as const, label: "All Orders" },
                        { key: "pending" as const, label: "Pending Fulfillment" },
                        { key: "ready" as const, label: "Ready for Pickup" },
                        { key: "completed" as const, label: "Completed / Shipped" },
                    ] as const
                ).map(({ key, label }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setFilter(key)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            filter === key
                                ? "bg-zinc-900 text-white shadow-md"
                                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Orders list */}
            <div className="space-y-6">
                {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white py-16 text-center shadow-sm">
                        <ClipboardList className="h-12 w-12 text-zinc-300" />
                        <p className="mt-4 text-sm font-bold text-zinc-500">No orders found in this filter.</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
                        >
                            {/* Order Card Header */}
                            <div className="flex flex-col gap-4 border-b border-zinc-100 bg-zinc-50/50 p-6 md:flex-row md:items-center md:justify-between">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="font-mono text-xs font-black text-zinc-400">
                                            {order.id}
                                        </span>
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                                order.status === "delivered"
                                                    ? "bg-emerald-100 text-emerald-800"
                                                    : order.status === "cancelled"
                                                      ? "bg-red-100 text-red-800"
                                                      : "bg-amber-100 text-amber-800"
                                            }`}
                                        >
                                            {ORDER_STATUS_LABELS[order.status] || order.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {new Date(order.orderDate).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                                <div className="text-left md:text-right">
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Client Name</p>
                                    <p className="text-sm font-black text-zinc-900">
                                        {order.shipping.firstName} {order.shipping.lastName}
                                    </p>
                                </div>
                            </div>

                            {/* Order Details Body */}
                            <div className="grid grid-cols-1 divide-y divide-zinc-100 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
                                {/* Items List */}
                                <div className="p-6 lg:col-span-2 space-y-4">
                                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Order Items</p>
                                    {order.items.map((item, index) => {
                                        const updateKey = `${order.id}-${item.id}-${item.colorId || "default"}-${item.size}`;
                                        const isUpdating = updatingId === updateKey;

                                        return (
                                            <div
                                                key={`${item.id}-${index}`}
                                                className="flex flex-col gap-4 rounded-2xl border border-zinc-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100 border border-zinc-100">
                                                        {item.image ? (
                                                            <img
                                                                src={item.image}
                                                                alt=""
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                                                                No img
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-zinc-900">{item.name}</h4>
                                                        <p className="text-xs font-semibold text-zinc-500">
                                                            Qty: {item.quantity} · Size: {item.size}
                                                            {item.colorId && ` · Color: ${item.colorId}`}
                                                        </p>

                                                        {/* Customization Details */}
                                                        {item.customization && (item.customization.playerName || item.customization.playerNumber) && (
                                                            <div className="mt-1.5 rounded-lg bg-amber-50 border border-amber-100 px-2.5 py-1 text-xs text-amber-900 font-bold">
                                                                Custom Name: {item.customization.playerName || "None"} · Number: {item.customization.playerNumber || "None"}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Item Fulfillment Status Controls */}
                                                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                                                item.fulfillmentStatus === "delivered"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : item.fulfillmentStatus === "ready"
                                                                      ? "bg-emerald-100 text-emerald-800"
                                                                      : item.fulfillmentStatus === "processing"
                                                                        ? "bg-blue-100 text-blue-800"
                                                                        : item.fulfillmentStatus === "shipped"
                                                                          ? "bg-zinc-100 text-zinc-800"
                                                                          : "bg-amber-100 text-amber-800"
                                                            }`}
                                                        >
                                                            {FULFILLMENT_LABELS[item.fulfillmentStatus || "pending"]}
                                                        </span>
                                                    </div>

                                                    {order.status !== "cancelled" && item.fulfillmentStatus !== "delivered" && (
                                                        <div className="flex gap-1.5 flex-wrap">
                                                            {(!item.fulfillmentStatus || item.fulfillmentStatus === "pending") && (
                                                                <button
                                                                    type="button"
                                                                    disabled={isUpdating}
                                                                    onClick={() => handleFulfillmentUpdate(order.id, item.id, item.colorId, item.size, "processing")}
                                                                    className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                                                                >
                                                                    {isUpdating ? "Saving..." : "Start Prep"}
                                                                </button>
                                                            )}
                                                            {(!item.fulfillmentStatus || item.fulfillmentStatus === "pending" || item.fulfillmentStatus === "processing") && (
                                                                <button
                                                                    type="button"
                                                                    disabled={isUpdating}
                                                                    onClick={() => handleFulfillmentUpdate(order.id, item.id, item.colorId, item.size, "ready")}
                                                                    className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-100 disabled:opacity-50"
                                                                >
                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                    Ready for Pickup
                                                                </button>
                                                            )}
                                                            {item.fulfillmentStatus === "ready" && (
                                                                <button
                                                                    type="button"
                                                                    disabled={isUpdating}
                                                                    onClick={() => handleFulfillmentUpdate(order.id, item.id, item.colorId, item.size, "shipped")}
                                                                    className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-100 disabled:opacity-50"
                                                                >
                                                                    Ship Item
                                                                </button>
                                                            )}
                                                            {(item.fulfillmentStatus === "ready" || item.fulfillmentStatus === "shipped") && (
                                                                <button
                                                                    type="button"
                                                                    disabled={isUpdating}
                                                                    onClick={() => handleFulfillmentUpdate(order.id, item.id, item.colorId, item.size, "delivered")}
                                                                    className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-green-600 px-3 text-xs font-bold text-white hover:bg-green-700 shadow-md shadow-green-100 disabled:opacity-50"
                                                                >
                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                    Mark Delivered
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Shipping Information */}
                                <div className="p-6 bg-zinc-50/20 space-y-4">
                                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Delivery Address</p>
                                    <div className="space-y-3 font-semibold text-zinc-700 text-sm">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                                            <div>
                                                <p className="font-bold text-zinc-900">
                                                    {order.shipping.town}, {order.shipping.region}
                                                </p>
                                                <p className="text-xs text-zinc-500 mt-0.5 font-medium">
                                                    Digital Address: {order.shipping.digitalAddress || "Not provided"}
                                                </p>
                                            </div>
                                        </div>

                                        {order.shipping.landmark && (
                                            <div className="rounded-xl bg-zinc-50 border border-zinc-200/60 p-3 text-xs text-zinc-600 font-medium">
                                                <strong>Landmark:</strong> {order.shipping.landmark}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
                                            <Phone className="h-4 w-4 text-zinc-400" />
                                            <a
                                                href={`tel:${order.shipping.phone}`}
                                                className="text-[var(--brand-red)] font-bold hover:underline"
                                            >
                                                {order.shipping.phone}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
