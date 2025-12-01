"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "../../providers/CartProvider";
import CheckoutProgressTracker from "../../components/CheckoutProgressTracker";

export default function CheckoutCartPage() {
    const router = useRouter();
    const { items, updateItem, removeItem } = useCart();

    const getCartTotal = () => {
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    useEffect(() => {
        // If cart is empty, redirect to shop
        if (items.length === 0) {
            router.push("/");
        }
    }, [items, router]);

    const handleContinue = () => {
        router.push("/checkout/shipping");
    };

    if (items.length === 0) {
        return null; // Will redirect
    }

    const subtotal = getCartTotal();
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;

    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="mx-auto max-w-6xl px-6 py-8">
                {/* Progress Tracker */}
                <CheckoutProgressTracker currentStep={1} />

                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900">Shopping Cart</h1>
                    <p className="mt-1 text-sm text-zinc-600">
                        Review your items before proceeding to checkout
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="space-y-4">
                            {items.map((item: any, index: number) => (
                                <div
                                    key={`${item.id}-${item.colorId || 'default'}-${index}`}
                                    className="flex gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
                                >
                                    {/* Product Image */}
                                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex flex-1 flex-col">
                                        <div className="flex justify-between">
                                            <div>
                                                <h3 className="font-semibold text-zinc-900">{item.name}</h3>
                                                {item.customization && (item.customization.playerName || item.customization.playerNumber) && (
                                                    <p className="mt-1 text-sm font-medium text-[var(--brand-red)]">
                                                        ⚽ Custom: {item.customization.playerName} {item.customization.playerNumber && `#${item.customization.playerNumber}`}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id, item.colorId)}
                                                className="text-red-600 hover:text-red-700"
                                                title="Remove item"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>

                                        <div className="mt-auto flex items-center justify-between">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateItem(item.id, item.colorId, Math.max(1, item.quantity - 1))}
                                                    className="rounded-lg border border-zinc-200 p-1 hover:bg-zinc-50"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-12 text-center font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateItem(item.id, item.colorId, item.quantity + 1)}
                                                    className="rounded-lg border border-zinc-200 p-1 hover:bg-zinc-50"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <p className="text-lg font-bold text-zinc-900">
                                                ₵{(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Continue Shopping */}
                        <div className="mt-6">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-red)] hover:underline"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-bold text-zinc-900">Order Summary</h2>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-600">Subtotal ({items.length} items)</span>
                                    <span className="font-medium text-zinc-900">₵{subtotal.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-zinc-600">Shipping</span>
                                    <span className="font-medium text-green-600">FREE</span>
                                </div>

                                <div className="border-t border-zinc-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-zinc-900">Total</span>
                                        <span className="text-xl font-bold text-zinc-900">₵{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleContinue}
                                className="mt-6 w-full rounded-lg bg-[var(--brand-red)] px-4 py-3 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                            >
                                Continue to Shipping
                            </button>

                            {/* Trust Badges */}
                            <div className="mt-6 space-y-2 text-xs text-zinc-500">
                                <div className="flex items-center gap-2">
                                    <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Secure checkout</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Free shipping on all orders</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Easy returns within 30 days</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
