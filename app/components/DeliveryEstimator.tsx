import { Truck } from "lucide-react";

interface DeliveryEstimatorProps {
    city?: string;
}

export default function DeliveryEstimator({ city = "Accra" }: DeliveryEstimatorProps) {
    // Calculate delivery date (3-5 business days from now)
    const today = new Date();
    const minDays = 3;
    const maxDays = 5;

    const minDate = new Date(today);
    minDate.setDate(today.getDate() + minDays);

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + maxDays);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    // Check if we can deliver today
    const currentHour = today.getHours();
    const canDeliverToday = currentHour < 14; // Before 2 PM

    return (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
                <div className="rounded-full bg-green-100 p-2">
                    <Truck className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900">
                        {canDeliverToday ? "Order within 2 hours for same-day delivery!" : "Fast Delivery Available"}
                    </p>
                    <p className="mt-1 text-xs text-green-700">
                        Estimated delivery: <span className="font-medium">{formatDate(minDate)} - {formatDate(maxDate)}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-green-600">
                        Delivering to {city}
                    </p>
                </div>
            </div>
        </div>
    );
}
