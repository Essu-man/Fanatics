"use client";

import { useState } from "react";
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

            // Store reference and callback data in sessionStorage for callback page
            sessionStorage.setItem("paymentReference", result.data.reference);
            sessionStorage.setItem("paymentCallback", JSON.stringify({
                onSuccessCallback: true,
            }));

            // Redirect to Paystack's hosted checkout page
            window.location.href = result.data.authorization_url;
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
                    Redirecting to Paystack...
                </>
            ) : (
                children
            )}
        </button>
    );
}
