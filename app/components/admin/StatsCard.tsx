import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    icon: LucideIcon;
    iconColor?: string;
    onClick?: () => void;
    clickHint?: string;
}

export default function StatsCard({
    title,
    value,
    change,
    changeType = "neutral",
    icon: Icon,
    iconColor = "bg-blue-500",
    onClick,
    clickHint,
}: StatsCardProps) {
    const changeColors = {
        positive: "text-green-600",
        negative: "text-red-600",
        neutral: "text-zinc-600",
    };

    return (
        <div
            onClick={onClick}
            className={`rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-all ${
                onClick
                    ? "cursor-pointer hover:border-emerald-500 hover:shadow-md hover:ring-2 hover:ring-emerald-500/20"
                    : "hover:shadow-md"
            }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-zinc-600">{title}</p>
                        {clickHint && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                {clickHint}
                            </span>
                        )}
                    </div>
                    <p className="mt-2 text-3xl font-bold text-zinc-900">{value}</p>
                    {change && (
                        <p className={`mt-2 text-sm font-medium ${changeColors[changeType]}`}>
                            {change}
                        </p>
                    )}
                </div>
                <div className={`rounded-lg ${iconColor} p-3 shrink-0 ml-3`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
        </div>
    );
}
