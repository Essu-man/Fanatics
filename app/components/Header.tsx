"use client";

import Link from "next/link";
import { ShoppingBag, Search } from "lucide-react";
import { useCart } from "../providers/CartProvider";
import { useState } from "react";
import CartDrawer from "./CartDrawer";
import SearchAutocomplete from "./SearchAutocomplete";

export default function Header() {
    const { items } = useCart();
    const [cartOpen, setCartOpen] = useState(false);
    return (
        <header className="border-b border-zinc-200 bg-white text-zinc-900">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
                    <span className="text-3xl font-black">X</span>
                    <span className="text-zinc-900">Cediman</span>
                </Link>

                <div className="hidden md:block flex-1 max-w-[560px] mx-4 lg:mx-8">
                    <SearchAutocomplete />
                </div>
                <div className="md:hidden">
                    <button
                        onClick={() => {/* TODO: Open mobile search */ }}
                        className="text-zinc-700 hover:text-zinc-900"
                        aria-label="Search"
                    >
                        <Search className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex items-center gap-6">
                    <Link href="#" className="text-sm text-zinc-700 hover:text-zinc-900">
                        Help
                    </Link>
                    <Link href="#" className="text-sm text-zinc-700 hover:text-zinc-900">
                        My Account
                    </Link>
                    <button
                        onClick={() => setCartOpen(true)}
                        className="relative text-[var(--brand-red)] hover:text-[var(--brand-red-dark)]"
                        aria-label={`Shopping cart with ${items.reduce((acc, item) => acc + item.quantity, 0)} items`}
                    >
                        <ShoppingBag className="h-6 w-6" />
                        {items.length > 0 && (
                            <span
                                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand-red)] text-[11px] font-medium text-white"
                                aria-label={`${items.reduce((acc, item) => acc + item.quantity, 0)} items in cart`}
                            >
                                {items.reduce((acc, item) => acc + item.quantity, 0)}
                            </span>
                        )}
                    </button>
                </div>
            </div>
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </header>
    );
}
