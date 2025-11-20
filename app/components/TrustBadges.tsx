import { Shield, CreditCard, Lock } from "lucide-react";

export default function TrustBadges() {
    const badges = [
        {
            icon: Shield,
            text: "Secure Payment",
            color: "text-green-600",
        },
        {
            icon: Lock,
            text: "SSL Encrypted",
            color: "text-blue-600",
        },
        {
            icon: CreditCard,
            text: "All Cards Accepted",
            color: "text-purple-600",
        },
    ];

    return (
        <div className="flex flex-wrap items-center justify-center gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            {badges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                    <div key={index} className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${badge.color}`} />
                        <span className="text-xs font-medium text-zinc-700">{badge.text}</span>
                    </div>
                );
            })}
        </div>
    );
}
