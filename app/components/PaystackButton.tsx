"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
    const [isRedirecting, setIsRedirecting] = useState(false);
    const { showToast } = useToast();
    const router = useRouter();

    const handlePayment = useCallback(async () => {
        // Prevent multiple clicks
        if (loading || isRedirecting) {
            return;
        }

        setLoading(true);

        try {
            console.log("Initializing payment...", { email, amount });

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

            console.log("Payment initialize response:", result);

            if (!result.success) {
                showToast(result.error || "Failed to initialize payment", "error");
                setLoading(false);
                return;
            }

            // Store reference and shipping info in sessionStorage for callback page
            const reference = result.data.reference;
            sessionStorage.setItem("paymentReference", reference);
            sessionStorage.setItem("paymentCallback", JSON.stringify({
                onSuccessCallback: true,
            }));

            console.log("Redirecting to Paystack with reference:", reference);

            // Mark as redirecting (prevents button state reset on back)
            setIsRedirecting(true);

            // Redirect to Paystack's hosted checkout page
            // Use a slight delay to ensure session storage is written
            setTimeout(() => {
                window.location.href = result.data.authorization_url;
            }, 100);
        } catch (error) {
            console.error("Payment error:", error);
            showToast("An error occurred. Please try again.", "error");
            setLoading(false);
        }
    }, [loading, isRedirecting, email, amount, metadata, showToast]);

    // Handle back button from Paystack - reset loading state after page visibility change
    const handleVisibilityChange = useCallback(() => {
        if (document.visibilityState === "visible" && isRedirecting) {
            // User came back from Paystack, reset the button state
            console.log("User returned from Paystack, resetting button state");
            setLoading(false);
            setIsRedirecting(false);
        }
    }, [isRedirecting]);

    // Listen for visibility changes (user tabs away or comes back)
    if (typeof window !== "undefined") {
        document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return (
        <button
            onClick={handlePayment}
            disabled={disabled || loading || isRedirecting}
            className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-red)] px-6 py-3 font-semibold text-white transition-all hover:bg-[var(--brand-red-dark)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        >
            {loading || isRedirecting ? (
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
