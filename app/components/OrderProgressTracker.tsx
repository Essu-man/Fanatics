import { Check, Package, Truck, MapPin, Home } from "lucide-react";

type OrderStage = "submitted" | "confirmed" | "processing" | "in_transit" | "out_for_delivery" | "delivered" | "cancelled";

interface OrderProgressTrackerProps {
    currentStage: OrderStage;
    orderDate?: string;
    estimatedDelivery?: string;
}

const stages = [
    {
        id: "submitted" as OrderStage,
        label: "Order Submitted",
        icon: Package,
        description: "Your order has been submitted",
    },
    {
        id: "confirmed" as OrderStage,
        label: "Order Confirmed",
        icon: Check,
        description: "Your order has been confirmed",
    },
    {
        id: "processing" as OrderStage,
        label: "Processing",
        icon: Package,
        description: "We're preparing your items",
    },
    {
        id: "in_transit" as OrderStage,
        label: "In Transit",
        icon: Truck,
        description: "Your order is on the way",
    },
    {
        id: "out_for_delivery" as OrderStage,
        label: "Out for Delivery",
        icon: MapPin,
        description: "Out for delivery today",
    },
    {
        id: "delivered" as OrderStage,
        label: "Delivered",
        icon: Home,
        description: "Order has been delivered",
    },
];

export default function OrderProgressTracker({
    currentStage,
    orderDate,
    estimatedDelivery,
}: OrderProgressTrackerProps) {
    // Don't show progress tracker for cancelled orders
    if (currentStage === "cancelled") {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                <p className="text-center text-sm font-medium text-red-900">
                    ❌ This order has been cancelled.
                </p>
            </div>
        );
    }

    // For submitted orders, show a special message
    if (currentStage === "submitted") {
        return (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                <div className="text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-900 mb-1">
                        Order Submitted
                    </p>
                    <p className="text-xs text-gray-600">
                        Your order has been submitted and is awaiting admin confirmation.
                    </p>
                </div>
            </div>
        );
    }

    const currentIndex = stages.findIndex((stage) => stage.id === currentStage);

    return (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900">Order Tracking</h3>
                {estimatedDelivery && currentStage !== "delivered" && (
                    <div className="text-right">
                        <p className="text-xs text-zinc-500">Estimated Delivery</p>
                        <p className="text-sm font-semibold text-zinc-900">{estimatedDelivery}</p>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="relative mb-8">
                {/* Background Line */}
                <div className="absolute left-0 top-5 h-1 w-full bg-zinc-200"></div>

                {/* Progress Line */}
                <div
                    className="absolute left-0 top-5 h-1 bg-[var(--brand-red)] transition-all duration-500"
                    style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
                ></div>

                {/* Stage Indicators */}
                <div className="relative flex justify-between">
                    {stages.map((stage, index) => {
                        const Icon = stage.icon;
                        const isCompleted = index <= currentIndex;
                        const isCurrent = index === currentIndex;

                        return (
                            <div key={stage.id} className="flex flex-col items-center" style={{ width: "20%" }}>
                                {/* Circle */}
                                <div
                                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${isCompleted
                                        ? "border-[var(--brand-red)] bg-[var(--brand-red)] text-white"
                                        : "border-zinc-300 bg-white text-zinc-400"
                                        } ${isCurrent ? "scale-110 shadow-lg" : ""}`}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>

                                {/* Label */}
                                <div className="mt-3 text-center">
                                    <p
                                        className={`text-xs font-semibold ${isCompleted ? "text-zinc-900" : "text-zinc-500"
                                            }`}
                                    >
                                        {stage.label}
                                    </p>
                                    {isCurrent && (
                                        <p className="mt-1 text-xs text-zinc-600">{stage.description}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Timeline Details */}
            <div className="space-y-3 border-t border-zinc-200 pt-4">
                {orderDate && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-600">Order Placed</span>
                        <span className="font-medium text-zinc-900">{orderDate}</span>
                    </div>
                )}
                {currentStage === "delivered" && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-600">Delivered On</span>
                        <span className="font-medium text-green-600">
                            {new Date().toLocaleDateString()}
                        </span>
                    </div>
                )}
            </div>

            {/* Status Message */}
            <div className="mt-4 rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-900">
                    {currentStage === "delivered"
                        ? "🎉 Your order has been delivered! Thank you for shopping with us."
                        : currentStage === "out_for_delivery"
                            ? "📦 Your order is out for delivery and will arrive today!"
                            : currentStage === "in_transit"
                                ? "🚚 Your order is on its way to you."
                                : currentStage === "processing"
                                    ? "⏳ We're carefully preparing your items for shipment."
                                    : currentStage === "confirmed"
                                        ? "✅ Your order has been confirmed and will be processed soon."
                                        : currentStage === "submitted"
                                            ? "📝 Your order has been submitted and is awaiting confirmation."
                                            : "✅ Your order has been confirmed and will be processed soon."}
                </p>
            </div>
        </div>
    );
}
