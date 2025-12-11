"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "../../providers/CartProvider";
import { useAuth } from "../../providers/AuthProvider";
import { auth } from "@/lib/firebase";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function PaymentCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { items, clear } = useCart();
    const { user, loading: authLoading } = useAuth();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your payment...");
    const hasProcessedRef = useRef(false);
    const processedReferenceRef = useRef<string | null>(null);

    useEffect(() => {
        // Get reference from URL first
        const reference = searchParams.get("reference") || searchParams.get("trxref");

        if (!reference) {
            setStatus("error");
            setMessage("Payment reference not found");
            return;
        }

        // Prevent duplicate execution for the same reference
        if (hasProcessedRef.current && processedReferenceRef.current === reference) {
            return;
        }

        // Wait for auth to finish loading before processing payment
        // This ensures we have the correct userId for authenticated users
        if (authLoading) {
            setMessage("Checking authentication...");
            return;
        }

        const verifyPayment = async () => {
            // Give a small delay to ensure user state is fully loaded
            // This helps catch cases where authLoading is false but user isn't set yet
            await new Promise(resolve => setTimeout(resolve, 300));
            // Mark as processing immediately to prevent duplicate calls
            hasProcessedRef.current = true;
            processedReferenceRef.current = reference;

            try {
                // Verify payment with timeout (30 seconds max)
                const verifyController = new AbortController();
                const verifyTimeout = setTimeout(() => verifyController.abort(), 30000);

                const verifyResponse = await fetch("/api/paystack/verify", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        reference,
                    }),
                    signal: verifyController.signal,
                });

                clearTimeout(verifyTimeout);

                const verifyResult = await verifyResponse.json();

                console.log("Payment verification response:", verifyResult, "Status:", verifyResponse.status);

                if (!verifyResult.success) {
                    setStatus("error");
                    const errorMessage = verifyResult.error || "Payment verification failed";
                    setMessage(`${errorMessage}. Please contact support with reference: ${reference}`);
                    console.error("Payment verification failed:", verifyResult);
                    return;
                }

                // Get shipping info from sessionStorage, localStorage, or metadata (fallback)
                let shippingInfo = sessionStorage.getItem("checkoutShipping") || localStorage.getItem("checkoutShipping");

                // If both storage methods are missing, try to get from payment metadata
                if (!shippingInfo && verifyResult.data?.metadata) {
                    const metadata = verifyResult.data.metadata;
                    // Check if shipping info is in metadata
                    if (metadata.shipping) {
                        shippingInfo = metadata.shipping;
                        console.log("Retrieved shipping info from payment metadata");
                    }
                }

                if (!shippingInfo) {
                    setStatus("error");
                    setMessage("Shipping information not found");
                    return;
                }

                // Get cart items from sessionStorage or localStorage (fallback if cart context is empty)
                const storedItems = sessionStorage.getItem("checkoutItems") || localStorage.getItem("checkoutItems");
                const orderItems = storedItems ? JSON.parse(storedItems) : items;

                if (!orderItems || orderItems.length === 0) {
                    setStatus("error");
                    setMessage("Cart items not found. Please try again.");
                    return;
                }

                const shipping = JSON.parse(shippingInfo);
                const subtotal = orderItems.reduce((total: number, item: any) => total + item.price * item.quantity, 0);
                const shippingCost = 0; // Free shipping
                const tax = 0; // No tax
                const total = subtotal + shippingCost + tax;

                // Check if order already exists for this reference
                const checkResponse = await fetch(`/api/orders/check-reference?reference=${encodeURIComponent(reference)}`);
                const checkData = await checkResponse.json();

                if (checkData.exists) {
                    // Order already exists, redirect to success page
                    setStatus("success");
                    setMessage("Payment already processed. Redirecting...");
                    clear();
                    sessionStorage.removeItem("checkoutShipping");
                    sessionStorage.removeItem("checkoutItems");
                    sessionStorage.removeItem("paymentReference");
                    sessionStorage.removeItem("paymentCallback");
                    // Also clear localStorage
                    localStorage.removeItem("checkoutShipping");
                    localStorage.removeItem("checkoutItems");
                    localStorage.removeItem("paymentReference");
                    setTimeout(() => {
                        router.push(`/checkout/success?orderId=${checkData.orderId}`);
                    }, 2000);
                    return;
                }

                // Generate order ID
                const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

                // Get user ID for order - try multiple sources
                let userIdForOrder: string | null = null;

                // First try from AuthProvider user
                if (user?.id) {
                    userIdForOrder = user.id;
                } else {
                    // Fallback: Get directly from Firebase Auth
                    const firebaseUser = auth.currentUser;
                    if (firebaseUser) {
                        userIdForOrder = firebaseUser.uid;
                        console.log("Using Firebase Auth user ID as fallback:", userIdForOrder);
                    }
                }

                console.log("Creating order with userId:", userIdForOrder, "AuthProvider user:", user, "Firebase user:", auth.currentUser?.uid);

                // Create order with timeout (30 seconds max)
                const orderController = new AbortController();
                const orderTimeout = setTimeout(() => orderController.abort(), 30000);

                const orderResponse = await fetch("/api/orders/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        orderId,
                        userId: userIdForOrder, // Use authenticated user ID if available, otherwise guest
                        guestEmail: shipping.email,
                        guestPhone: shipping.phone,
                        customerName: `${shipping.firstName} ${shipping.lastName}`,
                        items: orderItems.map((item: any) => ({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            image: item.image,
                            size: item.size || null,
                            colorId: item.colorId || null,
                        })),
                        shipping,
                        payment: {
                            method: "paystack",
                            reference: reference,
                        },
                        subtotal,
                        shippingCost,
                        tax,
                        total,
                        paystackReference: reference,
                    }),
                    signal: orderController.signal,
                });

                clearTimeout(orderTimeout);

                if (!orderResponse.ok) {
                    const errorData = await orderResponse.json().catch(() => ({}));
                    setStatus("error");
                    const errorMessage = errorData.error || errorData.details || `Order creation failed (${orderResponse.status})`;
                    setMessage(`${errorMessage}. Your payment was successful but order creation failed. Please contact support with reference: ${reference}`);
                    console.error("Order creation error:", {
                        status: orderResponse.status,
                        data: errorData,
                        reference,
                    });
                    return;
                }

                const orderData = await orderResponse.json();

                if (orderData.success) {
                    setStatus("success");
                    setMessage(orderData.alreadyExists ? "Order already processed. Redirecting..." : "Payment successful! Redirecting...");

                    // Clear cart and shipping info
                    clear();
                    sessionStorage.removeItem("checkoutShipping");
                    sessionStorage.removeItem("checkoutItems");
                    sessionStorage.removeItem("paymentReference");
                    sessionStorage.removeItem("paymentCallback");
                    // Also clear localStorage
                    localStorage.removeItem("checkoutShipping");
                    localStorage.removeItem("checkoutItems");
                    localStorage.removeItem("paymentReference");

                    // Redirect to success page
                    setTimeout(() => {
                        router.push(`/checkout/success?orderId=${orderData.orderId || orderId}`);
                    }, 2000);
                } else {
                    setStatus("error");
                    setMessage(
                        orderData.error || orderData.details ||
                        "Failed to create order. Please contact support."
                    );
                    console.error("Order creation error:", orderData);
                }
            } catch (error) {
                console.error("Error verifying payment:", error);
                setStatus("error");
                setMessage("An error occurred. Please contact support.");
            }
        };

        verifyPayment();
    }, [searchParams, authLoading, user]); // Include authLoading and user to wait for auth, but hasProcessedRef prevents duplicate execution

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                {status === "loading" && (
                    <>
                        <Loader2 className="h-16 w-16 mx-auto text-[var(--brand-red)] animate-spin" />
                        <h1 className="mt-6 text-2xl font-bold text-zinc-900">Processing Payment</h1>
                        <p className="mt-2 text-zinc-600">{message}</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <CheckCircle className="h-16 w-16 mx-auto text-green-600" />
                        <h1 className="mt-6 text-2xl font-bold text-zinc-900">Payment Successful!</h1>
                        <p className="mt-2 text-zinc-600">{message}</p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <XCircle className="h-16 w-16 mx-auto text-red-600" />
                        <h1 className="mt-6 text-2xl font-bold text-zinc-900">Payment Failed</h1>
                        <p className="mt-2 text-zinc-600">{message}</p>
                        <button
                            onClick={() => router.push("/checkout/payment")}
                            className="mt-6 w-full rounded-lg bg-[var(--brand-red)] px-6 py-3 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                        >
                            Try Again
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function PaymentCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                        <Loader2 className="h-16 w-16 mx-auto text-[var(--brand-red)] animate-spin" />
                        <h1 className="mt-6 text-2xl font-bold text-zinc-900">Loading...</h1>
                        <p className="mt-2 text-zinc-600">Please wait while we process your payment.</p>
                    </div>
                </div>
            }
        >
            <PaymentCallbackContent />
        </Suspense>
    );
}
