"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { useToast } from "../../components/ui/ToastContainer";
import {
    ArrowLeft,
    Package,
    Truck,
    MapPin,
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    User,
    Phone,
    Car,
} from "lucide-react";

type OrderStatus = "submitted" | "confirmed" | "processing" | "out_for_delivery" | "delivered" | "cancelled";

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    colorId?: string;
    size?: string;
    jerseyType?: string;
    customization?: {
        playerName?: string;
        playerNumber?: string;
    };
}

interface DeliveryPersonInfo {
    name: string;
    phone: string;
    vehicleInfo?: string;
    assignedAt?: string;
}

interface Order {
    id: string;
    orderDate: string;
    status: OrderStatus;
    items: OrderItem[];
    shipping: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        region: string;
        country: string;
    };
    subtotal: number;
    shippingCost: number;
    customizationFee?: number;
    total: number;
    deliveryPersonInfo?: DeliveryPersonInfo;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
    submitted: { label: "Submitted", color: "bg-gray-100 text-gray-700 border-gray-200", icon: Clock },
    confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle },
    processing: { label: "Processing", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Package },
    out_for_delivery: { label: "Out for Delivery", color: "bg-orange-100 text-orange-700 border-orange-200", icon: Truck },
    delivered: { label: "Delivered", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { showToast } = useToast();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmingDelivery, setConfirmingDelivery] = useState(false);

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
            const data = await response.json();

            if (response.ok && data.success) {
                setOrder(data.order);
            } else {
                showToast("Order not found", "error");
            }
        } catch (error) {
            console.error("Error fetching order:", error);
            showToast("Failed to load order details", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelivery = async () => {
        if (!confirm("Confirm that you have received your order?")) {
            return;
        }

        try {
            setConfirmingDelivery(true);
            const response = await fetch("/api/orders/confirm-delivery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: order?.id,
                    userId: user?.id,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showToast("Order marked as delivered. Thank you!", "success");
                fetchOrder(); // Refresh order data
            } else {
                throw new Error(data.error || "Failed to confirm delivery");
            }
        } catch (error) {
            console.error("Error confirming delivery:", error);
            showToast(error instanceof Error ? error.message : "Failed to confirm delivery", "error");
        } finally {
            setConfirmingDelivery(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                    <p className="text-zinc-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="mb-4 text-3xl font-bold text-zinc-900">Order Not Found</h1>
                    <p className="mb-8 text-zinc-600">The order you're looking for doesn't exist.</p>
                    <Link
                        href="/"
                        className="inline-block rounded-lg bg-[var(--brand-red)] px-6 py-3 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                    >
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    // Calculate customization details
    const CUSTOMIZATION_FEE = 35;
    const itemsSubtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const customizationDetails = order.items.reduce((acc, item) => {
        if (item.customization && (item.customization.playerName || item.customization.playerNumber)) {
            return {
                count: acc.count + item.quantity,
                total: acc.total + (CUSTOMIZATION_FEE * item.quantity)
            };
        }
        return acc;
    }, { count: 0, total: 0 });

    const StatusIcon = statusConfig[order.status].icon;

    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="mx-auto max-w-6xl px-4 py-8">
                <Link href="/account" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Account
                </Link>

                {/* Order Header */}
                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-zinc-200">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="mb-2 text-2xl font-bold text-zinc-900">Order #{order.id.slice(0, 8)}</h1>
                            <div className="flex items-center gap-2 text-sm text-zinc-600">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(order.orderDate)}</span>
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 ${statusConfig[order.status].color}`}>
                            <StatusIcon className="h-5 w-5" />
                            <span className="font-semibold">{statusConfig[order.status].label}</span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Order Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Delivery Person Info */}
                        {order.status === "out_for_delivery" && order.deliveryPersonInfo && (
                            <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <Truck className="h-5 w-5 text-orange-700" />
                                    <h2 className="text-lg font-bold text-orange-900">Your Delivery Person</h2>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 rounded-lg bg-white p-3">
                                        <User className="h-5 w-5 text-orange-700" />
                                        <div>
                                            <p className="text-xs text-zinc-500">Name</p>
                                            <p className="font-semibold text-zinc-900">{order.deliveryPersonInfo.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg bg-white p-3">
                                        <Phone className="h-5 w-5 text-orange-700" />
                                        <div>
                                            <p className="text-xs text-zinc-500">Contact</p>
                                            <a
                                                href={`tel:${order.deliveryPersonInfo.phone}`}
                                                className="font-semibold text-orange-700 hover:underline"
                                            >
                                                {order.deliveryPersonInfo.phone}
                                            </a>
                                        </div>
                                    </div>
                                    {order.deliveryPersonInfo.vehicleInfo && (
                                        <div className="flex items-center gap-3 rounded-lg bg-white p-3">
                                            <Car className="h-5 w-5 text-orange-700" />
                                            <div>
                                                <p className="text-xs text-zinc-500">Vehicle</p>
                                                <p className="font-semibold text-zinc-900">{order.deliveryPersonInfo.vehicleInfo}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Delivery Button */}
                                <button
                                    onClick={handleConfirmDelivery}
                                    disabled={confirmingDelivery}
                                    className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {confirmingDelivery ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Confirming...
                                        </span>
                                    ) : (
                                        <>✓ I've Received My Order</>
                                    )}
                                </button>
                                <p className="mt-2 text-xs text-center text-orange-700">
                                    Click this button once you receive your delivery
                                </p>
                            </div>
                        )}

                        {/* Order Items */}
                        <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-200">
                            <h2 className="mb-4 text-lg font-bold text-zinc-900">Order Items</h2>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex gap-4 border-b border-zinc-100 pb-4 last:border-0">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-20 w-20 rounded-lg object-cover"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-zinc-900">{item.name}</h3>
                                            <div className="mt-1 space-y-0.5 text-xs text-zinc-600">
                                                {item.size && <p>Size: {item.size}</p>}
                                                {item.jerseyType && <p>Type: {item.jerseyType}</p>}
                                                {item.customization?.playerName && (
                                                    <p className="text-[var(--brand-red)] font-medium">
                                                        ✨ {item.customization.playerName}
                                                        {item.customization.playerNumber ? ` #${item.customization.playerNumber}` : ""}
                                                    </p>
                                                )}
                                                <p>Quantity: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-zinc-900">₵{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Summary & Shipping */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-200">
                            <h2 className="mb-4 text-lg font-bold text-zinc-900">Order Summary</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-600">Items Subtotal</span>
                                    <span className="font-semibold text-zinc-900">₵{itemsSubtotal.toFixed(2)}</span>
                                </div>
                                {customizationDetails.count > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-zinc-600">
                                            Customization ({customizationDetails.count} {customizationDetails.count === 1 ? 'jersey' : 'jerseys'})
                                        </span>
                                        <span className="font-semibold text-zinc-900">₵{customizationDetails.total.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-zinc-600">Delivery</span>
                                    <span className="font-semibold text-zinc-900">₵{order.shippingCost.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-zinc-200 pt-3 flex justify-between">
                                    <span className="font-bold text-zinc-900">Total</span>
                                    <span className="text-lg font-bold text-[var(--brand-red)]">₵{order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="rounded-xl bg-white p-6 shadow-sm border border-zinc-200">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="h-5 w-5 text-[var(--brand-red)]" />
                                <h2 className="text-lg font-bold text-zinc-900">Delivery Address</h2>
                            </div>
                            <div className="space-y-1 text-sm text-zinc-700">
                                <p className="font-semibold">{order.shipping.firstName} {order.shipping.lastName}</p>
                                <p>{order.shipping.address}</p>
                                <p>{order.shipping.city}, {order.shipping.region}</p>
                                <p>{order.shipping.country}</p>
                                <p className="pt-2 text-zinc-600">{order.shipping.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
