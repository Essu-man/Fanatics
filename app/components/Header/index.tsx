"use client";

import Link from "next/link";
import Button from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";
import { ShoppingBag, Search, User, Heart, ChevronDown } from "lucide-react";
import { useCart } from "@/app/providers/CartProvider";
import TopBanner from "@/app/components/TopBanner";

export default function Header() {
    const { items } = useCart();
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <header className="sticky top-0 z-50">
            <TopBanner />

            {/* Main Header */}
            <div className="border-b border-zinc-100 bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4">
                    {/* Top Section */}
                    <div className="flex items-center justify-between py-4">
                        <Link href="/" className="text-2xl font-extrabold tracking-tight">
                            <span className="text-[var(--brand-red)]">FANATICS</span>
                        </Link>

                        {/* Search */}
                        <div className="relative hidden lg:block">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-zinc-400" />
                            </div>
                            <Input
                                aria-label="Search"
                                placeholder="Search for teams, players, or items..."
                                className="w-[400px] bg-zinc-50 pl-10 py-2"
                            />
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-6">
                            <button className="flex items-center gap-2 text-sm text-zinc-700 hover:text-zinc-900">
                                <User className="h-5 w-5" />
                                <span className="hidden sm:inline">Account</span>
                            </button>

                            <button className="relative text-zinc-700 hover:text-zinc-900">
                                <Heart className="h-5 w-5" />
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand-red)] text-[11px] font-medium text-white">
                                    0
                                </span>
                            </button>

                            <button className="relative flex items-center gap-2 text-zinc-700 hover:text-zinc-900">
                                <ShoppingBag className="h-5 w-5" />
                                <span className="hidden sm:inline">Cart</span>
                                {totalItems > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand-red)] text-[11px] font-medium text-white">
                                        {totalItems}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex h-12 items-center justify-between border-t border-zinc-100">
                        <div className="flex h-full">
                            <button className="flex items-center gap-2 border-b-2 border-transparent px-4 text-sm font-medium text-zinc-700 hover:border-[var(--brand-red)] hover:text-zinc-900">
                                Teams
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            <button className="flex items-center gap-2 border-b-2 border-transparent px-4 text-sm font-medium text-zinc-700 hover:border-[var(--brand-red)] hover:text-zinc-900">
                                Players
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            <button className="flex items-center gap-2 border-b-2 border-transparent px-4 text-sm font-medium text-zinc-700 hover:border-[var(--brand-red)] hover:text-zinc-900">
                                Leagues
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="text-sm font-medium text-[var(--brand-red)] hover:text-[var(--brand-red-dark)]">
                                Sale
                            </button>
                            <button className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
                                New Arrivals
                            </button>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}