"use client";

import { useEffect, useState, useCallback } from "react";
import { auth } from "@/lib/firebase";
import { useToast } from "@/app/components/ui/ToastContainer";
import { ClipboardList, Phone, MapPin, CheckCircle2, Clock, Loader2, Calendar, Trash2 } from "lucide-react";

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
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isBulkActioning, setIsBulkActioning] = useState(false);

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
        const updateKey = `${orderId}::${productId}::${colorId || "default"}::${size}`;
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

    const handleDeleteItem = async (orderId: string, productId: string, colorId: string | null, size: string) => {
        if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;
        
        const updateKey = `${orderId}::${productId}::${colorId || "default"}::${size}`;
        setUpdatingId(updateKey);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch("/api/vendor/orders", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    orderId,
                    productId,
                    colorId,
                    size,
                }),
            });
            const data = await res.json();
            if (data.success) {
                showToast("Item deleted successfully", "success");
                loadOrders();
            } else {
                throw new Error(data.error || "Failed to delete item");
            }
        } catch (e: any) {
            showToast(e.message || "Failed to delete item", "error");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleBulkUpdate = async (status: "pending" | "processing" | "ready" | "shipped" | "delivered") => {
        if (selectedItems.length === 0) return;
        setIsBulkActioning(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const promises = selectedItems.map(key => {
                const [orderId, productId, colorId, size] = key.split("::");
                return fetch("/api/vendor/orders", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                        orderId,
                        productId,
                        colorId: colorId === "default" ? null : colorId,
                        size,
                        fulfillmentStatus: status,
                    }),
                }).then(res => res.json());
            });

            await Promise.all(promises);
            showToast(`Bulk update to ${FULFILLMENT_LABELS[status]} successful`, "success");
            setSelectedItems([]);
            loadOrders();
        } catch (e: any) {
            showToast("Bulk update failed partially or fully", "error");
        } finally {
            setIsBulkActioning(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedItems.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedItems.length} items? This action cannot be undone.`)) return;
        
        setIsBulkActioning(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const promises = selectedItems.map(key => {
                const [orderId, productId, colorId, size] = key.split("::");
                return fetch("/api/vendor/orders", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                        orderId,
                        productId,
                        colorId: colorId === "default" ? null : colorId,
                        size,
                    }),
                }).then(res => res.json());
            });

            await Promise.all(promises);
            showToast(`Successfully deleted ${selectedItems.length} items`, "success");
            setSelectedItems([]);
            loadOrders();
        } catch (e: any) {
            showToast("Bulk delete failed partially or fully", "error");
        } finally {
            setIsBulkActioning(false);
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

    const allFilteredItemKeys = filteredOrders.flatMap((order) =>
        order.items.map((item) => `${order.id}::${item.id}::${item.colorId || "default"}::${item.size}`)
    );

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

            {/* Bulk Actions Bar */}
            {selectedItems.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-900 rounded-2xl shadow-lg sticky top-4 z-10 mb-4 gap-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-zinc-800 text-zinc-300 text-xs font-black px-2.5 py-1 rounded-md">
                            {selectedItems.length} selected
                        </div>
                        <span className="text-sm font-semibold text-zinc-400">Apply to selection:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            disabled={isBulkActioning}
                            className="bg-zinc-800 border-none text-white text-sm font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                            onChange={(e) => {
                                if (e.target.value) {
                                    handleBulkUpdate(e.target.value as any);
                                    e.target.value = ""; // Reset after selection
                                }
                            }}
                        >
                            <option value="">Update Status...</option>
                            <option value="processing">Start Prep</option>
                            <option value="ready">Ready for Pickup</option>
                            <option value="shipped">Ship Items</option>
                            <option value="delivered">Mark Delivered</option>
                        </select>
                        
                        <div className="hidden sm:block w-px h-6 bg-zinc-700 mx-1"></div>
                        
                        <button
                            type="button"
                            disabled={isBulkActioning}
                            onClick={handleBulkDelete}
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-red-500/10 px-4 text-sm font-bold text-red-500 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Orders list */}
            <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white shadow-sm">
                {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <ClipboardList className="h-12 w-12 text-zinc-300" />
                        <p className="mt-4 text-sm font-bold text-zinc-500">No orders found in this filter.</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm text-zinc-600 whitespace-nowrap lg:whitespace-normal">
                        <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                            <tr>
                                <th className="px-4 py-4 w-10">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-zinc-300 w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                        checked={allFilteredItemKeys.length > 0 && selectedItems.length === allFilteredItemKeys.length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedItems(allFilteredItemKeys);
                                            } else {
                                                setSelectedItems([]);
                                            }
                                        }}
                                    />
                                </th>
                                <th className="px-6 py-4 font-black">Order Info</th>
                                <th className="px-6 py-4 font-black min-w-[300px]">Item Details</th>
                                <th className="px-6 py-4 font-black">Delivery</th>
                                <th className="px-6 py-4 font-black">Status</th>
                                <th className="px-6 py-4 font-black text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredOrders.flatMap((order) =>
                                order.items.map((item, index) => {
                                    const updateKey = `${order.id}::${item.id}::${item.colorId || "default"}::${item.size}`;
                                    const isUpdating = updatingId === updateKey;
                                    const isSelected = selectedItems.includes(updateKey);

                                    return (
                                        <tr key={`${order.id}::${item.id}::${index}`} className="hover:bg-zinc-50/50 transition-colors">
                                            {/* Checkbox */}
                                            <td className="px-4 py-4 align-top">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-zinc-300 w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer mt-0.5"
                                                    checked={isSelected}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedItems(prev => [...prev, updateKey]);
                                                        } else {
                                                            setSelectedItems(prev => prev.filter(k => k !== updateKey));
                                                        }
                                                    }}
                                                />
                                            </td>

                                            {/* Order Info */}
                                            <td className="px-6 py-4 align-top">
                                                <div className="font-mono text-xs font-black text-zinc-900 mb-1">
                                                    {order.id}
                                                </div>
                                                <div className="text-xs font-semibold text-zinc-500 mb-2">
                                                    {new Date(order.orderDate).toLocaleDateString("en-GB", {
                                                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                                                    })}
                                                </div>
                                                <div className="text-sm font-bold text-zinc-900">
                                                    {order.shipping.firstName} {order.shipping.lastName}
                                                </div>
                                            </td>

                                            {/* Item Details */}
                                            <td className="px-6 py-4 align-top">
                                                <div className="flex items-start gap-3">
                                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100 border border-zinc-200">
                                                        {item.image ? (
                                                            <img src={item.image} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">No img</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-black text-zinc-900 truncate">{item.name}</h4>
                                                        <p className="text-xs font-semibold text-zinc-500 mt-0.5">
                                                            Qty: {item.quantity} · Size: {item.size}
                                                            {item.colorId && ` · Color: ${item.colorId}`}
                                                        </p>
                                                        {item.customization && (item.customization.playerName || item.customization.playerNumber) && (
                                                            <div className="mt-1.5 inline-block rounded-md bg-amber-50 border border-amber-100 px-2 py-0.5 text-[10px] text-amber-900 font-bold whitespace-nowrap">
                                                                {item.customization.playerName || "None"} - {item.customization.playerNumber || "None"}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Delivery */}
                                            <td className="px-6 py-4 align-top">
                                                <div className="text-sm font-bold text-zinc-900">
                                                    {order.shipping.town}, {order.shipping.region}
                                                </div>
                                                <div className="text-xs font-medium text-zinc-500 mt-0.5">
                                                    {order.shipping.phone}
                                                </div>
                                                {order.shipping.landmark && (
                                                    <div className="text-xs font-medium text-zinc-400 mt-0.5 truncate max-w-[200px]">
                                                        Landmark: {order.shipping.landmark}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 align-top">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${
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
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 align-top text-right">
                                                {order.status !== "cancelled" && (
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <div className="flex gap-1.5">
                                                            {item.fulfillmentStatus !== "delivered" && (
                                                                <>
                                                                    {(!item.fulfillmentStatus || item.fulfillmentStatus === "pending") && (
                                                                        <button
                                                                            type="button"
                                                                            disabled={isUpdating}
                                                                            onClick={() => handleFulfillmentUpdate(order.id, item.id, item.colorId, item.size, "processing")}
                                                                            className="inline-flex h-7 items-center justify-center rounded-md border border-zinc-200 bg-white px-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 whitespace-nowrap"
                                                                        >
                                                                            {isUpdating ? "Saving..." : "Start Prep"}
                                                                        </button>
                                                                    )}
                                                                    {(!item.fulfillmentStatus || item.fulfillmentStatus === "pending" || item.fulfillmentStatus === "processing") && (
                                                                        <button
                                                                            type="button"
                                                                            disabled={isUpdating}
                                                                            onClick={() => handleFulfillmentUpdate(order.id, item.id, item.colorId, item.size, "ready")}
                                                                            className="inline-flex h-7 items-center justify-center gap-1 rounded-md bg-emerald-600 px-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm shadow-emerald-100 disabled:opacity-50 whitespace-nowrap"
                                                                        >
                                                                            Ready for Pickup
                                                                        </button>
                                                                    )}
                                                                    {item.fulfillmentStatus === "ready" && (
                                                                        <button
                                                                            type="button"
                                                                            disabled={isUpdating}
                                                                            onClick={() => handleFulfillmentUpdate(order.id, item.id, item.colorId, item.size, "shipped")}
                                                                            className="inline-flex h-7 items-center justify-center gap-1 rounded-md bg-blue-600 px-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm shadow-blue-100 disabled:opacity-50 whitespace-nowrap"
                                                                        >
                                                                            Ship Item
                                                                        </button>
                                                                    )}
                                                                    {(item.fulfillmentStatus === "ready" || item.fulfillmentStatus === "shipped") && (
                                                                        <button
                                                                            type="button"
                                                                            disabled={isUpdating}
                                                                            onClick={() => handleFulfillmentUpdate(order.id, item.id, item.colorId, item.size, "delivered")}
                                                                            className="inline-flex h-7 items-center justify-center gap-1 rounded-md bg-green-600 px-2.5 text-xs font-bold text-white hover:bg-green-700 shadow-sm shadow-green-100 disabled:opacity-50 whitespace-nowrap"
                                                                        >
                                                                            Mark Delivered
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                            <button
                                                                type="button"
                                                                disabled={isUpdating}
                                                                onClick={() => handleDeleteItem(order.id, item.id, item.colorId, item.size)}
                                                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 disabled:opacity-50 transition-colors"
                                                                title="Delete Item"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
