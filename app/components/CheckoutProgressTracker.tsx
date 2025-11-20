"use client";

import { Check } from "lucide-react";

interface CheckoutProgressTrackerProps {
    currentStep: 1 | 2 | 3;
}

const steps = [
    { number: 1, label: "Cart", description: "Review items" },
    { number: 2, label: "Shipping", description: "Delivery details" },
    { number: 3, label: "Payment", description: "Complete order" },
];

export default function CheckoutProgressTracker({ currentStep }: CheckoutProgressTrackerProps) {
    return (
        <div className="w-full py-8">
            <div className="mx-auto max-w-3xl">
                {/* Desktop Progress Bar */}
                <div className="hidden md:block">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex flex-1 items-center">
                                {/* Step Circle */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${step.number < currentStep
                                                ? "border-green-600 bg-green-600 text-white"
                                                : step.number === currentStep
                                                    ? "border-[var(--brand-red)] bg-[var(--brand-red)] text-white"
                                                    : "border-zinc-300 bg-white text-zinc-400"
                                            }`}
                                    >
                                        {step.number < currentStep ? (
                                            <Check className="h-6 w-6" />
                                        ) : (
                                            <span className="text-lg font-bold">{step.number}</span>
                                        )}
                                    </div>
                                    <div className="mt-2 text-center">
                                        <p
                                            className={`text-sm font-semibold ${step.number <= currentStep ? "text-zinc-900" : "text-zinc-400"
                                                }`}
                                        >
                                            {step.label}
                                        </p>
                                        <p className="text-xs text-zinc-500">{step.description}</p>
                                    </div>
                                </div>

                                {/* Connecting Line */}
                                {index < steps.length - 1 && (
                                    <div className="mx-4 flex-1">
                                        <div
                                            className={`h-1 rounded transition-all ${step.number < currentStep ? "bg-green-600" : "bg-zinc-200"
                                                }`}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Progress Bar */}
                <div className="md:hidden">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex flex-1 items-center">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${step.number < currentStep
                                                ? "border-green-600 bg-green-600 text-white"
                                                : step.number === currentStep
                                                    ? "border-[var(--brand-red)] bg-[var(--brand-red)] text-white"
                                                    : "border-zinc-300 bg-white text-zinc-400"
                                            }`}
                                    >
                                        {step.number < currentStep ? (
                                            <Check className="h-5 w-5" />
                                        ) : (
                                            <span className="text-sm font-bold">{step.number}</span>
                                        )}
                                    </div>
                                    <p
                                        className={`mt-1 text-xs font-medium ${step.number <= currentStep ? "text-zinc-900" : "text-zinc-400"
                                            }`}
                                    >
                                        {step.label}
                                    </p>
                                </div>

                                {index < steps.length - 1 && (
                                    <div className="mx-2 flex-1">
                                        <div
                                            className={`h-0.5 rounded transition-all ${step.number < currentStep ? "bg-green-600" : "bg-zinc-200"
                                                }`}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
