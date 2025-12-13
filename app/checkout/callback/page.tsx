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
    const [retryCount, setRetryCount] = useState(0);
    const hasProcessedRef = useRef(false);
    const processedReferenceRef = useRef<string | null>(null);
    const verificationStartTime = useRef<number>(Date.now());

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
                // Show mobile-friendly message after 10 seconds
                const slowNetworkTimer = setTimeout(() => {
                    setMessage("Still processing... This may take longer on mobile networks.");
                }, 10000);

                // Retry logic for payment verification (max 3 attempts)
                let verifyResult: any = null;
                let lastError: any = null;

                for (let attempt = 0; attempt < 3; attempt++) {
                    try {
                        if (attempt > 0) {
                            setRetryCount(attempt);
                            setMessage(`Retrying verification (${attempt}/3)...`);
                            // Exponential backoff: 2s, 4s
                            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                        }

                        const verifyResponse = await fetch("/api/paystack/verify", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                reference,
                            }),
                        });

                        verifyResult = await verifyResponse.json();

                        // If we got a response (even if unsuccessful), break the retry loop
                        if (verifyResult) {
                            break;
                        }
                    } catch (fetchError) {
                        lastError = fetchError;
                        console.error(`Verification attempt ${attempt + 1} failed:`, fetchError);
                        // Continue to next retry
                    }
                }

                clearTimeout(slowNetworkTimer);

                if (!verifyResult) {
                    setStatus("error");
                    setMessage("Unable to verify payment after multiple attempts. Please check your connection and contact support if the issue persists.");
                    return;
                }

                if (!verifyResult.success) {
                    setStatus("error");
                    setMessage(verifyResult.error || "Payment verification failed. Please contact support.");
                    return;
                }

                // Enhanced shipping info retrieval with better fallback handling
                let shippingInfo: string | null = null;
                let dataSource = "unknown";

                // Try sessionStorage first
                shippingInfo = sessionStorage.getItem("checkoutShipping");
                if (shippingInfo) {
                    dataSource = "sessionStorage";
                    console.log("Retrieved shipping info from sessionStorage");
                }

                // Try localStorage as fallback
                if (!shippingInfo) {
                    shippingInfo = localStorage.getItem("checkoutShipping");
                    if (shippingInfo) {
                        dataSource = "localStorage";
                        console.log("Retrieved shipping info from localStorage (mobile storage cleared)");
                    }
                }

                // Try payment metadata as ultimate fallback (important for mobile)
                if (!shippingInfo && verifyResult.data?.metadata) {
                    try {
                        const metadata = verifyResult.data.metadata;
                        if (metadata.shipping) {
                            // Metadata shipping might be a string or object
                            shippingInfo = typeof metadata.shipping === 'string'
                                ? metadata.shipping
                                : JSON.stringify(metadata.shipping);
                            dataSource = "paystack metadata";
                            console.log("Retrieved shipping info from Paystack metadata (all storage cleared)");
                        }
                    } catch (metadataError) {
                        console.error("Error parsing metadata:", metadataError);
                    }
                }

                if (!shippingInfo) {
                    setStatus("error");
                    setMessage("Shipping information not found. This may happen if browser storage was cleared. Please contact support with your payment reference: " + reference);
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

                // Get delivery price from storage
                const storedDeliveryPrice = sessionStorage.getItem("deliveryPrice") || localStorage.getItem("deliveryPrice");
                let shippingCost = 0;
                if (storedDeliveryPrice) {
                    try {
                        const priceData = JSON.parse(storedDeliveryPrice);
                        shippingCost = priceData.price || 0;
                    } catch (e) {
                        console.error("Error parsing delivery price:", e);
                    }
                }

                // Calculate subtotal including customization fees
                const CUSTOMIZATION_FEE = 35;
                const itemsSubtotal = orderItems.reduce((total: number, item: any) => total + item.price * item.quantity, 0);
                const customizationTotal = orderItems.reduce((total: number, item: any) => {
                    if (item.customization && (item.customization.playerName || item.customization.playerNumber)) {
                        return total + (CUSTOMIZATION_FEE * item.quantity);
                    }
                    return total;
                }, 0);
                const subtotal = itemsSubtotal + customizationTotal;
                const tax = 0; // No tax
                const total = subtotal + shippingCost + tax;

                // Check if order already exists for this reference
                const checkResponse = await fetch(`/api/orders/check-reference?reference=${encodeURIComponent(reference)}`);
                const checkData = await checkResponse.json();

                if (checkData.exists) {
                    // Order already exists, redirect to success page
                    setStatus("success");
                    setMessage("Payment already processed. Redirecting...");

                    // Clear cart and storage since order is complete
                    clear();
                    sessionStorage.removeItem("checkoutShipping");
                    sessionStorage.removeItem("checkoutItems");
                    sessionStorage.removeItem("paymentReference");
                    sessionStorage.removeItem("paymentCallback");
                    sessionStorage.removeItem("deliveryPrice");
                    localStorage.removeItem("checkoutShipping");
                    localStorage.removeItem("checkoutItems");
                    localStorage.removeItem("paymentReference");
                    localStorage.removeItem("deliveryPrice");

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

                // Create order
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
                            customization: item.customization || null,
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
                });

                if (!orderResponse.ok) {
                    const errorData = await orderResponse.json().catch(() => ({}));
                    setStatus("error");
                    setMessage(
                        errorData.error || errorData.details ||
                        `Failed to create order (${orderResponse.status}). Please contact support.`
                    );
                    console.error("Order creation error:", errorData);
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
                    sessionStorage.removeItem("deliveryPrice");
                    // Also clear localStorage
                    localStorage.removeItem("checkoutShipping");
                    localStorage.removeItem("checkoutItems");
                    localStorage.removeItem("paymentReference");
                    localStorage.removeItem("deliveryPrice");

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
                        {retryCount > 0 && (
                            <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                                <p className="text-sm text-yellow-800">
                                    Retrying... Attempt {retryCount} of 3
                                </p>
                                <p className="text-xs text-yellow-600 mt-1">
                                    This is normal on slow mobile networks
                                </p>
                            </div>
                        )}
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
                            onClick={() => router.push("/checkout")}
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
