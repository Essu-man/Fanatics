import { Check, Package, MapPin, Home } from "lucide-react";

type OrderStage = "submitted" | "confirmed" | "processing" | "out_for_delivery" | "delivered" | "cancelled" | string;

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
    // Normalize the stage
    const normalizedStage = (currentStage || "submitted").toString().toLowerCase().trim();

    // Don't show progress tracker for cancelled orders
    if (normalizedStage === "cancelled") {
        return (
            <div className="rounded-xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-8 mb-8 shadow-sm">
                <p className="text-center text-lg font-bold text-red-900">
                    ❌ This order has been cancelled
                </p>
            </div>
        );
    }

    let currentIndex = stages.findIndex((stage) => stage.id === normalizedStage);

    // Fallback mapping if a removed/unknown stage is provided
    if (currentIndex === -1) {
        const stageMappings: Record<string, string> = {
            "in_transit": "out_for_delivery",
            "pending": "submitted",
            "preparing": "processing",
            "shipped": "out_for_delivery",
        };

        const mappedStage = stageMappings[normalizedStage];
        if (mappedStage) {
            currentIndex = stages.findIndex((s) => s.id === mappedStage);
        } else {
            currentIndex = 0; // Default to first stage
        }
    }

    const progressPercentage = (currentIndex / (stages.length - 1)) * 100;

    return (
        <div className="w-full rounded-xl border-2 border-zinc-200 bg-white p-8 shadow-md mb-8" role="region" aria-label="Order progress tracker">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-zinc-900">Order Status Tracker</h3>
                    <p className="text-sm text-zinc-600 mt-1">Real-time tracking of your order</p>
                </div>
                {estimatedDelivery && normalizedStage !== "delivered" && (
                    <div className="bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Estimated Delivery</p>
                        <p className="text-xl font-bold text-blue-900">{estimatedDelivery}</p>
                    </div>
                )}
            </div>

            {/* Progress Bar with improved visibility */}
            <div className="relative mb-12">
                {/* Background Line */}
                <div className="absolute left-0 top-6 h-1.5 w-full bg-gradient-to-r from-zinc-200 to-zinc-300 rounded-full"></div>

                {/* Progress Line Animation */}
                <div
                    className="absolute left-0 top-6 h-1.5 bg-gradient-to-r from-green-400 via-blue-500 to-[var(--brand-red)] rounded-full transition-all duration-700 shadow-md"
                    style={{ width: `${progressPercentage}%` }}
                ></div>

                {/* Stage Indicators */}
                <div className="relative flex justify-between px-2">
                    {stages.map((stage, index) => {
                        const Icon = stage.icon;
                        const isCompleted = index <= currentIndex;
                        const isCurrent = index === currentIndex;

                        return (
                            <div key={stage.id} className="flex flex-col items-center flex-1">
                                {/* Circle with enhanced styling */}
                                <div
                                    className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-3 transition-all duration-300 shadow-lg ${isCompleted
                                        ? isCurrent
                                            ? "border-[var(--brand-red)] bg-[var(--brand-red)] text-white scale-125 shadow-xl"
                                            : "border-green-500 bg-green-500 text-white"
                                        : "border-zinc-300 bg-white text-zinc-400"
                                        }`}
                                >
                                    <Icon className="h-6 w-6" />
                                </div>

                                {/* Label */}
                                <div className="mt-4 text-center w-full">
                                    <p
                                        className={`text-sm font-bold transition-colors ${isCompleted ? "text-zinc-900" : "text-zinc-500"
                                            }`}
                                    >
                                        {stage.label}
                                    </p>
                                    {isCurrent && (
                                        <p className="mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block font-semibold">
                                            {stage.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Timeline Details */}
            <div className="space-y-3 border-t border-zinc-200 pt-6">
                {orderDate && (
                    <div className="flex items-center justify-between text-sm bg-zinc-50 p-3 rounded-lg">
                        <span className="text-zinc-600 font-medium">📅 Order Placed</span>
                        <span className="font-semibold text-zinc-900">{orderDate}</span>
                    </div>
                )}
                {normalizedStage === "delivered" && (
                    <div className="flex items-center justify-between text-sm bg-green-50 p-3 rounded-lg">
                        <span className="text-green-600 font-medium">✅ Delivered On</span>
                        <span className="font-semibold text-green-900">
                            {new Date().toLocaleDateString()}
                        </span>
                    </div>
                )}
            </div>

            {/* Enhanced Status Message */}
            <div className="mt-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-l-4 border-blue-500">
                <p className="text-sm font-semibold text-blue-900 flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">
                        {currentStage === "delivered"
                            ? "🎉"
                            : currentStage === "out_for_delivery"
                                ? "🚚"
                                : currentStage === "processing"
                                    ? "⏳"
                                    : currentStage === "confirmed"
                                        ? "✅"
                                        : "📝"}
                    </span>
                    <span>
                        {currentStage === "delivered"
                            ? "Your order has been delivered! Thank you for shopping with us."
                            : currentStage === "out_for_delivery"
                                ? "Your order is out for delivery and will arrive today!"
                                : currentStage === "processing"
                                    ? "We're carefully preparing your items for shipment."
                                    : currentStage === "confirmed"
                                        ? "Your order has been confirmed and will be processed soon."
                                        : currentStage === "submitted"
                                            ? "Your order has been submitted and is awaiting admin confirmation."
                                            : "Your order is being processed."}
                    </span>
                </p>
            </div>
        </div>
    );
}
