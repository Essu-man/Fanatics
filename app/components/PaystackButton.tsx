"use client";

import { useState } from "react";
import { initializePaystack, type PaystackConfig } from "@/lib/paystack";
import { useToast } from "./ui/ToastContainer";

interface PaystackButtonProps {
    email: string;
    amount: number; // in cedis
    metadata?: any;
    onSuccess: (reference: string) => void;
    onClose?: () => void;
    className?: string;
    children?: React.ReactNode;
    disabled?: boolean;
}

export default function PaystackButton({
    email,
    amount,
    metadata,
    onSuccess,
    onClose,
    className = "",
    children = "Pay Now",
    disabled = false,
}: PaystackButtonProps) {
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handlePayment = async () => {
        setLoading(true);

        try {
            // Initialize payment with backend
            const response = await fetch("/api/paystack/initialize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    amount,
                    metadata,
                }),
            });

            const result = await response.json();

            if (!result.success) {
                showToast(result.error || "Failed to initialize payment", "error");
                setLoading(false);
                return;
            }

            const { publicKey, amount: amountInKobo, reference, currency } = result.data;

            // Initialize Paystack popup
            const config: PaystackConfig = {
                publicKey,
                email,
                amount: amountInKobo,
                currency,
                ref: reference,
                metadata,
                onSuccess: async (response) => {
                    setLoading(true);

                    // Verify payment on backend
                    const verifyResponse = await fetch("/api/paystack/verify", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            reference: response.reference,
                        }),
                    });

                    const verifyResult = await verifyResponse.json();

                    if (verifyResult.success) {
                        showToast("Payment successful!", "success");
                        onSuccess(response.reference);
                    } else {
                        showToast("Payment verification failed", "error");
                    }

                    setLoading(false);
                },
                onClose: () => {
                    setLoading(false);
                    if (onClose) onClose();
                },
            };

            const handler = initializePaystack(config);

            if (handler) {
                handler.openIframe();
            } else {
                showToast("Payment system not available. Please refresh the page.", "error");
                setLoading(false);
            }
        } catch (error) {
            console.error("Payment error:", error);
            showToast("An error occurred. Please try again.", "error");
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={disabled || loading}
            className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-red)] px-6 py-3 font-semibold text-white transition-all hover:bg-[var(--brand-red-dark)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        >
            {loading ? (
                <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing...
                </>
            ) : (
                children
            )}
        </button>
    );
}
