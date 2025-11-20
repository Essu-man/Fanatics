import { Check, Package, Truck, MapPin, Home } from "lucide-react";

type OrderStage = "confirmed" | "processing" | "in_transit" | "out_for_delivery" | "delivered";

interface OrderProgressTrackerProps {
    currentStage: OrderStage;
    orderDate?: string;
    estimatedDelivery?: string;
}

const stages = [
    {
        id: "confirmed" as OrderStage,
        label: "Order Confirmed",
        icon: Check,
        description: "Your order has been placed",
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
                                    : "✅ Your order has been confirmed and will be processed soon."}
                </p>
            </div>
        </div>
    );
}
