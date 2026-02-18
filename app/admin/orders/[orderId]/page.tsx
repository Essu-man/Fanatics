"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Mail, Phone, MapPin, CreditCard, Clock, CheckCircle2, History } from "lucide-react";
import OrderStatusUpdater from "../../../components/admin/OrderStatusUpdater";
import OrderProgressTracker from "../../../components/OrderProgressTracker";
import DeliveryPersonModal, { type DeliveryPersonInfo } from "../../../components/DeliveryPersonModal";
import DeleteOrderModal from "../../../components/DeleteOrderModal";

type Order = {
    id: string;
    userId?: string | null;
    guestEmail?: string | null;
    guestPhone?: string | null;
    orderDate?: string | Date;
    order_date?: string;
    status: string;
    items: any[];
    shipping?: any;
    subtotal: number;
    shippingCost?: number;
    shipping_cost?: number;
    tax: number;
    total: number;
    paystackReference?: string;
    paystack_reference?: string;
    statusHistory?: any[];
    status_history?: any[];
};

export default function AdminOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.orderId as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [verifyingPayment, setVerifyingPayment] = useState(false);

    // Delivery price state
    const [deliveryPrice, setDeliveryPrice] = useState<number | null>(null);
    const [deliveryLocation, setDeliveryLocation] = useState<string>("");

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/orders/${orderId}`);
            const data = await response.json();

            if (data.success) {
                setOrder(data.order);
            } else {
                setError("Order not found");
            }
        } catch (err) {
            setError("Failed to load order");
        } finally {
            setLoading(false);
        }
    };

    const handleDeliveryPersonAssignment = async (deliveryInfo: DeliveryPersonInfo) => {
        if (!order) return;

        try {
            const response = await fetch("/api/orders/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: order.id,
                    status: "out_for_delivery",
                    customerEmail: order.guestEmail || order.shipping?.email,
                    customerPhone: order.guestPhone || order.shipping?.phone,
                    customerName: order.shipping
                        ? `${order.shipping.firstName} ${order.shipping.lastName}`
                        : "Customer",
                    deliveryPersonInfo: deliveryInfo,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setShowDeliveryModal(false);
                await fetchOrder();
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const handleManualPaymentConfirmation = async () => {
        if (!order || verifyingPayment) return;

        if (!confirm("Are you sure you want to verify this payment with Paystack manually?")) {
            return;
        }

        setVerifyingPayment(true);
        try {
            const response = await fetch("/api/orders/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: order.id }),
            });

            const data = await response.json();

            if (data.success) {
                alert("Payment verified successfully!");
                await fetchOrder();
            } else {
                alert(data.error || "Failed to verify payment");
            }
        } catch (error) {
            console.error("Failed to verify payment:", error);
            alert("An error occurred while verifying payment");
        } finally {
            setVerifyingPayment(false);
        }
    };

    // Fetch delivery price when order loads
    useEffect(() => {
        if (order && order.shipping && (order.shipping.area || order.shipping.city)) {
            const location = order.shipping.area || order.shipping.city;
            setDeliveryLocation(location);
            fetch(`/api/delivery-prices?location=${encodeURIComponent(location)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) setDeliveryPrice(data.price);
                });
        }
    }, [order]);

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                    <p className="text-zinc-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <Package className="mx-auto h-16 w-16 text-zinc-400 mb-4" />
                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">Order Not Found</h2>
                    <p className="text-zinc-600 mb-6">{error}</p>
                    <Link
                        href="/admin/orders"
                        className="inline-block rounded-lg bg-[var(--brand-red)] px-6 py-3 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                    >
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    const orderDate = order.order_date || order.orderDate || new Date().toISOString();
    const estimatedDelivery = new Date(orderDate);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 2);

    const customerEmail = order.guestEmail || order.shipping?.email;
    const customerPhone = order.guestPhone || order.shipping?.phone;
    const customerName = order.shipping
        ? `${order.shipping.firstName} ${order.shipping.lastName}`
        : "Customer";

    // Get status history (handle both naming conventions)
    const statusHistory = order.status_history || order.statusHistory || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/admin/orders"
                        className="mb-2 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Orders
                    </Link>
                    <h1 className="text-3xl font-bold text-zinc-900">Order Details</h1>
                    <p className="mt-1 text-sm text-zinc-600">
                        Order ID: <span className="font-semibold text-[var(--brand-red)]">{order.id}</span>
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content - 2 columns */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Order Status & Progress */}
                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-zinc-900">Order Status</h2>
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ${order.status === "delivered"
                                    ? "bg-green-100 text-green-700"
                                    : order.status === "cancelled"
                                        ? "bg-red-100 text-red-700"
                                        : order.status === "out_for_delivery" || order.status === "in_transit"
                                            ? "bg-purple-100 text-purple-700"
                                            : order.status === "processing" || order.status === "confirmed"
                                                ? "bg-blue-100 text-blue-700"
                                                : order.status === "awaiting_payment"
                                                    ? "bg-orange-100 text-orange-700 font-bold border border-orange-200 animate-pulse"
                                                    : "bg-yellow-100 text-yellow-700"
                                    }`}
                            >
                                {order.status === "delivered" && <CheckCircle2 className="h-4 w-4" />}
                                {order.status === "awaiting_payment" ? "⚠️ Awaiting Payment" : order.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                        </div>
                        {order.status === "awaiting_payment" && (
                            <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex gap-3">
                                        <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-orange-900">Payment Confirmation Required</p>
                                            <p className="text-sm text-orange-800">
                                                This order was created but payment hasn't been confirmed yet.
                                                If the customer claims they have paid, check Paystack manually or click the button to verify.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleManualPaymentConfirmation}
                                        disabled={verifyingPayment}
                                        className="flex-shrink-0 rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50 shadow-sm transition-all flex items-center gap-2"
                                    >
                                        {verifyingPayment ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                Verifying...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="h-4 w-4" />
                                                Confirm Payment with Paystack
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                        <OrderProgressTracker
                            currentStage={order.status as any}
                            orderDate={new Date(orderDate).toLocaleDateString('en-GB')}
                            estimatedDelivery={estimatedDelivery.toLocaleDateString('en-GB')}
                        />
                    </div>

                    {/* Status History */}
                    {statusHistory.length > 0 && (
                        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <History className="h-5 w-5 text-zinc-600" />
                                <h2 className="text-lg font-bold text-zinc-900">Status History</h2>
                            </div>
                            <div className="space-y-3">
                                {statusHistory
                                    .slice()
                                    .reverse()
                                    .map((historyItem: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-3 border-l-2 border-zinc-200 pl-4 pb-3 last:pb-0"
                                        >
                                            <div className="mt-0.5 flex h-2 w-2 rounded-full bg-[var(--brand-red)]"></div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold text-zinc-900">
                                                        {historyItem.status
                                                            ? historyItem.status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
                                                            : "Status Updated"}
                                                    </p>
                                                    <p className="text-xs text-zinc-500">
                                                        {historyItem.timestamp
                                                            ? new Date(historyItem.timestamp).toLocaleString("en-US", {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })
                                                            : "Unknown date"}
                                                    </p>
                                                </div>
                                                {historyItem.note && (
                                                    <p className="mt-1 text-sm text-zinc-600">{historyItem.note}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-zinc-900">Order Items</h2>
                        <div className="space-y-3">
                            {order.items.map((item: any, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 border-b border-zinc-100 pb-3 last:border-0"
                                >
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-16 w-16 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-zinc-900">{item.name}</p>
                                        <div className="mt-1 flex gap-2 text-sm text-zinc-500">
                                            {item.size && <span>Size: {item.size}</span>}
                                            {item.size && item.colorId && <span>•</span>}
                                            {item.colorId && <span>Color: {item.colorId}</span>}
                                        </div>
                                        {item.customization && (item.customization.playerName || item.customization.playerNumber) && (
                                            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[var(--brand-red)]">
                                                <span>⚽</span>
                                                <span>
                                                    Custom: {item.customization.playerName} {item.customization.playerNumber && `#${item.customization.playerNumber}`}
                                                </span>
                                            </div>
                                        )}
                                        <p className="mt-1 text-sm text-zinc-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-zinc-900">
                                        ₵{(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="mt-6 space-y-2 border-t border-zinc-200 pt-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-600">Subtotal</span>
                                <span className="font-semibold text-zinc-900">₵{order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-600">Shipping</span>
                                <span className="font-semibold text-zinc-900">
                                    {(order.shippingCost || order.shipping_cost || 0) === 0 ? (
                                        <span className="text-green-600">FREE</span>
                                    ) : (
                                        `₵${(order.shippingCost || order.shipping_cost || 0).toFixed(2)}`
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-600">Tax</span>
                                <span className="font-semibold text-zinc-900">₵{order.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-zinc-200 pt-2 text-base font-bold text-zinc-900">
                                <span>Total</span>
                                <span>₵{order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Shipping Info */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-bold text-zinc-900">Customer Information</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <Mail className="mt-0.5 h-4 w-4 text-zinc-400" />
                                    <div>
                                        <p className="text-xs text-zinc-500">Email</p>
                                        <p className="font-medium text-zinc-900">{customerEmail}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Phone className="mt-0.5 h-4 w-4 text-zinc-400" />
                                    <div>
                                        <p className="text-xs text-zinc-500">Phone</p>
                                        <p className="font-medium text-zinc-900">{customerPhone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-bold text-zinc-900">Shipping Address</h3>
                            <div className="flex items-start gap-2 text-sm">
                                <MapPin className="mt-0.5 h-4 w-4 text-zinc-400" />
                                <div>
                                    {/* Clean Shipping Address with Area/City and Landmark, formatted as requested */}
                                    {(() => {
                                        const addr = order.shipping;
                                        return (
                                            <div className="space-y-1 text-sm text-zinc-700">
                                                <p><span className="font-semibold">Name:</span> {`${addr.firstName || ''} ${addr.lastName || ''}`.trim()}</p>
                                                {/* Only show Area/City once, prefer addr.area or deliveryLocation */}
                                                {(addr.area || deliveryLocation) && (
                                                    <p><span className="font-semibold">Area/City:</span> {addr.area || deliveryLocation} {deliveryPrice !== null && <span className="text-xs text-zinc-500">(Delivery: ₵{deliveryPrice})</span>}</p>
                                                )}
                                                {addr.landmark && <p><span className="font-semibold">Landmark:</span> {addr.landmark}</p>}
                                                {addr.region && <p><span className="font-semibold">Region:</span> {addr.region}</p>}
                                                {addr.country && <p><span className="font-semibold">Country:</span> {addr.country}</p>}
                                                {addr.phone && <p className="pt-2 text-zinc-600"><span className="font-semibold">Phone Number:</span> {addr.phone}</p>}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-zinc-900">Payment Information</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-zinc-400" />
                                <span className="text-zinc-600">Method:</span>
                                <span className="font-medium text-zinc-900">Paystack</span>
                            </div>
                            {order.paystack_reference && (
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-zinc-400" />
                                    <span className="text-zinc-600">Reference:</span>
                                    <span className="font-mono text-xs font-medium text-zinc-900">
                                        {order.paystack_reference}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar - 1 column */}
                <div className="space-y-6">
                    {/* Status Updater */}
                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-zinc-900">Update Status</h3>
                        <OrderStatusUpdater
                            orderId={order.id}
                            currentStatus={order.status}
                            customerEmail={customerEmail}
                            customerPhone={customerPhone}
                            customerName={customerName}
                            onStatusUpdated={fetchOrder}
                            onStatusUpdateAttempt={(status) => {
                                // Intercept "out_for_delivery" status to show delivery modal
                                if (status === "out_for_delivery") {
                                    setShowDeliveryModal(true);
                                    return true; // Prevent default update
                                }
                                return false; // Allow default update for other statuses
                            }}
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-zinc-900">Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                                Print Packing Slip
                            </button>
                            <button className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                                Assign to Delivery
                            </button>
                            <Link
                                href={`/track/${order.id}`}
                                target="_blank"
                                className="block w-full rounded-lg border border-zinc-200 px-4 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                            >
                                View Public Tracking
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delivery Person Assignment Modal */}
            <DeliveryPersonModal
                isOpen={showDeliveryModal}
                onClose={() => setShowDeliveryModal(false)}
                onSubmit={handleDeliveryPersonAssignment}
                orderId={order.id}
                isUpdating={false}
            />

            {/* Delete Order Modal */}
            <DeleteOrderModal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                orderId={order.id}
                onDelete={async () => {
                    setShowDeleteModal(false);
                    // Optionally, you can add a callback here to refresh the order list or redirect
                }}
                loading={false}
            />
        </div>
    );
}
