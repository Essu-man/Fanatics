"use client";

import { Settings, Truck, Lock, Headphones } from "lucide-react";

const features = [
    { icon: Settings, text: "Official Licensed Products" },
    { icon: Truck, text: "Fast Shipping" },
    { icon: Lock, text: "Secure Checkout" },
    { icon: Headphones, text: "24/7 Support" },
];

export default function FeatureRibbons() {
    return (
        <section className="border-b border-t border-zinc-200 bg-zinc-50 py-6">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div key={index} className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-700">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-medium text-zinc-700">{feature.text}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

