import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    icon: LucideIcon;
    iconColor?: string;
}

export default function StatsCard({
    title,
    value,
    change,
    changeType = "neutral",
    icon: Icon,
    iconColor = "bg-blue-500",
}: StatsCardProps) {
    const changeColors = {
        positive: "text-green-600",
        negative: "text-red-600",
        neutral: "text-zinc-600",
    };

    return (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-600">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-zinc-900">{value}</p>
                    {change && (
                        <p className={`mt-2 text-sm font-medium ${changeColors[changeType]}`}>
                            {change}
                        </p>
                    )}
                </div>
                <div className={`rounded-lg ${iconColor} p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
        </div>
    );
}
