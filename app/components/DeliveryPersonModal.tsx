"use client";

import { useState } from "react";
import { X, User, Phone, Truck } from "lucide-react";

interface DeliveryPersonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (deliveryInfo: DeliveryPersonInfo) => void;
    orderId: string;
    isUpdating: boolean;
}

export interface DeliveryPersonInfo {
    name: string;
    phone: string;
    vehicleInfo?: string;
}

export default function DeliveryPersonModal({
    isOpen,
    onClose,
    onSubmit,
    orderId,
    isUpdating,
}: DeliveryPersonModalProps) {
    const [formData, setFormData] = useState<DeliveryPersonInfo>({
        name: "",
        phone: "",
        vehicleInfo: "",
    });

    const [errors, setErrors] = useState<Partial<DeliveryPersonInfo>>({});

    const validateForm = (): boolean => {
        const newErrors: Partial<DeliveryPersonInfo> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Delivery person name is required";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
            newErrors.phone = "Please enter a valid phone number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const handleClose = () => {
        setFormData({ name: "", phone: "", vehicleInfo: "" });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-200 p-6">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900">Assign Delivery Person</h2>
                        <p className="mt-1 text-sm text-zinc-600">Order #{orderId.slice(0, 8)}</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                        disabled={isUpdating}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Delivery Person Name */}
                    <div>
                        <label htmlFor="deliveryName" className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700">
                            <User className="h-4 w-4 text-zinc-500" />
                            Delivery Person Name
                        </label>
                        <input
                            id="deliveryName"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full rounded-lg border ${errors.name ? "border-red-300" : "border-zinc-200"
                                } bg-white px-4 py-3 text-sm transition-all focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20`}
                            placeholder="Enter delivery person's full name"
                            disabled={isUpdating}
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label htmlFor="deliveryPhone" className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700">
                            <Phone className="h-4 w-4 text-zinc-500" />
                            Phone Number
                        </label>
                        <input
                            id="deliveryPhone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`w-full rounded-lg border ${errors.phone ? "border-red-300" : "border-zinc-200"
                                } bg-white px-4 py-3 text-sm transition-all focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20`}
                            placeholder="+233 XX XXX XXXX"
                            disabled={isUpdating}
                        />
                        {errors.phone && (
                            <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                        )}
                    </div>

                    {/* Vehicle Info (Optional) */}
                    <div>
                        <label htmlFor="vehicleInfo" className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700">
                            <Truck className="h-4 w-4 text-zinc-500" />
                            Vehicle Info <span className="text-xs font-normal text-zinc-500">(Optional)</span>
                        </label>
                        <input
                            id="vehicleInfo"
                            type="text"
                            value={formData.vehicleInfo}
                            onChange={(e) => setFormData({ ...formData, vehicleInfo: e.target.value })}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm transition-all focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                            placeholder="e.g., Red Toyota Corolla - GR 1234-20"
                            disabled={isUpdating}
                        />
                    </div>

                    {/* Info Box */}
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                        <p className="text-xs text-blue-900">
                            📋 This information will be shared with the customer so they can contact the delivery person.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
                            disabled={isUpdating}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 rounded-lg bg-[var(--brand-red)] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[var(--brand-red-dark)] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Assigning...
                                </span>
                            ) : (
                                "Assign & Update Status"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
