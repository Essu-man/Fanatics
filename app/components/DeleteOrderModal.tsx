import React from "react";

interface DeleteOrderModalProps {
    open: boolean;
    onClose: () => void;
    onDelete: () => void;
    orderId: string;
    loading: boolean;
}

export default function DeleteOrderModal({ open, onClose, onDelete, orderId, loading }: DeleteOrderModalProps) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
                <h2 className="text-xl font-bold text-red-700 mb-2">Delete Order?</h2>
                <p className="mb-6 text-zinc-700">
                    Are you sure you want to delete order <span className="font-mono">{orderId}</span>?<br />
                    This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        className="px-4 py-2 rounded bg-zinc-200 text-zinc-700 font-semibold hover:bg-zinc-300"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
                        onClick={onDelete}
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}
