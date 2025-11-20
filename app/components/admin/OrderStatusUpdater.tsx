"use client";

import { useState } from "react";
import { useToast } from "../ui/ToastContainer";

interface OrderStatusUpdaterProps {
    orderId: string;
    currentStatus: string;
    customerEmail?: string;
    customerPhone?: string;
    customerName?: string;
    onStatusUpdated?: () => void;
}

const statusOptions = [
    { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-700" },
    { value: "processing", label: "Processing", color: "bg-yellow-100 text-yellow-700" },
    { value: "in_transit", label: "In Transit", color: "bg-purple-100 text-purple-700" },
    { value: "out_for_delivery", label: "Out for Delivery", color: "bg-orange-100 text-orange-700" },
    { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-700" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
];

export default function OrderStatusUpdater({
    orderId,
    currentStatus,
    customerEmail,
    customerPhone,
    customerName,
    onStatusUpdated,
}: OrderStatusUpdaterProps) {
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);
    const [updating, setUpdating] = useState(false);
    const { showToast } = useToast();

    const handleUpdateStatus = async () => {
        if (selectedStatus === currentStatus) {
            showToast("Status is already set to this value", "error");
            return;
        }

        setUpdating(true);

        try {
            const response = await fetch("/api/orders/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId,
                    status: selectedStatus,
                    customerEmail,
                    customerPhone,
                    customerName,
                }),
            });

            const data = await response.json();

            if (data.success) {
                showToast("Order status updated! Notifications sent to customer.", "success");
                if (onStatusUpdated) onStatusUpdated();
            } else {
                showToast(data.error || "Failed to update status", "error");
            }
        } catch (error) {
            console.error("Update status error:", error);
            showToast("An error occurred while updating status", "error");
        } finally {
            setUpdating(false);
        }
    };

    const currentStatusConfig = statusOptions.find((s) => s.value === selectedStatus);

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Order Status
                </label>
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={updating}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 disabled:opacity-50"
                >
                    {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {currentStatusConfig && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-600">Current:</span>
                    <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${currentStatusConfig.color}`}
                    >
                        {currentStatusConfig.label}
                    </span>
                </div>
            )}

            <button
                onClick={handleUpdateStatus}
                disabled={updating || selectedStatus === currentStatus}
                className="w-full rounded-lg bg-[var(--brand-red)] px-4 py-2.5 font-semibold text-white transition-all hover:bg-[var(--brand-red-dark)] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {updating ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Updating...
                    </span>
                ) : (
                    "Update Status & Notify Customer"
                )}
            </button>

            <p className="text-xs text-zinc-500">
                Customer will receive email and SMS notifications about the status change.
            </p>
        </div>
    );
}
