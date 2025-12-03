"use client";

import { Package, Truck, CheckCircle, Clock, ChevronRight, User, Phone } from "lucide-react";
import Link from "next/link";

type OrderStatus =
    | "submitted"
    | "confirmed"
    | "processing"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";

interface OrderActivityCardProps {
    order: {
        id: string;
        orderDate: string;
        status: OrderStatus;
        items: any[];
        total: number;
        shipping?: {
            firstName?: string;
            lastName?: string;
            city?: string;
        };
        deliveryPersonInfo?: {
            name: string;
            phone: string;
            vehicleInfo?: string;
        };
    };
}

const statusConfig: Record<OrderStatus, {
    label: string;
    color: string;
    bgColor: string;
    icon: any;
    message: string;
}> = {
    submitted: {
        label: "Order Placed",
        color: "text-blue-700",
        bgColor: "bg-blue-50 border-blue-200",
        icon: Package,
        message: "We've received your order and are reviewing it"
    },
    confirmed: {
        label: "Confirmed",
        color: "text-green-700",
        bgColor: "bg-green-50 border-green-200",
        icon: CheckCircle,
        message: "Your order has been confirmed and will be processed soon"
    },
    processing: {
        label: "Processing",
        color: "text-yellow-700",
        bgColor: "bg-yellow-50 border-yellow-200",
        icon: Clock,
        message: "We're preparing your items for delivery"
    },
    out_for_delivery: {
        label: "Out for Delivery",
        color: "text-orange-700",
        bgColor: "bg-orange-50 border-orange-200",
        icon: Truck,
        message: "Your order is on its way!"
    },
    delivered: {
        label: "Delivered",
        color: "text-emerald-700",
        bgColor: "bg-emerald-50 border-emerald-200",
        icon: CheckCircle,
        message: "Your order has been delivered successfully"
    },
    cancelled: {
        label: "Cancelled",
        color: "text-red-700",
        bgColor: "bg-red-50 border-red-200",
        icon: Package,
        message: "This order has been cancelled"
    },
};

export default function OrderActivityCard({ order }: OrderActivityCardProps) {
    const config = statusConfig[order.status];
    const Icon = config.icon;
    const orderDate = new Date(order.orderDate);
    const isRecent = Date.now() - orderDate.getTime() < 24 * 60 * 60 * 1000; // Within 24 hours

    // Calculate progress percentage
    const getProgressPercentage = (status: OrderStatus): number => {
        const progressMap: Record<OrderStatus, number> = {
            submitted: 20,
            confirmed: 40,
            processing: 60,
            out_for_delivery: 80,
            delivered: 100,
            cancelled: 0,
        };
        return progressMap[status] || 0;
    };

    const progress = getProgressPercentage(order.status);

    return (
        <Link href={`/orders/${order.id}`}>
            <div className={`group relative overflow-hidden rounded-xl border-2 ${config.bgColor} p-5 shadow-sm transition-all hover:shadow-md cursor-pointer`}>
                {/* Status Badge */}
                {isRecent && order.status !== "delivered" && (
                    <div className="absolute right-4 top-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></div>
                            Active
                        </span>
                    </div>
                )}

                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`rounded-full ${config.color.replace('text-', 'bg-').replace('-700', '-100')} p-3`}>
                            <Icon className={`h-6 w-6 ${config.color}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-900">Order #{order.id.slice(0, 8)}</h3>
                            <p className="text-xs text-zinc-600">
                                {orderDate.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Message */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-semibold ${config.color}`}>
                            {config.label}
                        </span>
                        {order.status !== "cancelled" && (
                            <span className="text-xs font-medium text-zinc-600">
                                {progress}%
                            </span>
                        )}
                    </div>
                    {order.status !== "cancelled" && (
                        <div className="h-2 w-full rounded-full bg-white/60">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${config.color.replace('text-', 'bg-')}`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    )}
                    <p className="mt-2 text-sm text-zinc-700">
                        {config.message}
                    </p>
                </div>

                {/* Order Details */}
                <div className="rounded-lg bg-white/50 p-3">
                    <div className="flex items-center justify-between text-sm">
                        <div>
                            <p className="text-zinc-600">
                                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </p>
                            {order.shipping?.city && (
                                <p className="text-xs text-zinc-500 mt-1">
                                    Delivering to {order.shipping.city}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-zinc-900">₵{order.total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Delivery Person Info */}
                {order.status === "out_for_delivery" && order.deliveryPersonInfo && (
                    <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
                        <p className="text-xs font-semibold text-orange-900 mb-2 flex items-center gap-1">
                            <Truck className="h-3.5 w-3.5" />
                            Your Delivery Person
                        </p>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs">
                                <User className="h-3.5 w-3.5 text-orange-700" />
                                <span className="font-medium text-orange-900">{order.deliveryPersonInfo.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <Phone className="h-3.5 w-3.5 text-orange-700" />
                                <a
                                    href={`tel:${order.deliveryPersonInfo.phone}`}
                                    className="font-medium text-orange-900 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {order.deliveryPersonInfo.phone}
                                </a>
                            </div>
                            {order.deliveryPersonInfo.vehicleInfo && (
                                <p className="text-xs text-orange-700 mt-1">
                                    🚗 {order.deliveryPersonInfo.vehicleInfo}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* View Details Link */}
                <div className="mt-4 flex items-center justify-between">
                    <button className="flex items-center gap-1 text-sm font-medium text-[var(--brand-red)] group-hover:gap-2 transition-all">
                        Track Order
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    {order.status === "out_for_delivery" && (
                        <span className="text-xs font-medium text-orange-700">
                            Expected today
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
