"use client";

import Link from "next/link";
import Button from "./ui/button";
import Input from "./ui/input";
import { ShoppingBag, Search } from "lucide-react";
import { useCart } from "../providers/CartProvider";
import CategoryNav from "./CategoryNav";
import { useState } from "react";
import CartDrawer from "./CartDrawer";
import SearchAutocomplete from "./SearchAutocomplete";

export default function Header() {
    const { items } = useCart();
    const [cartOpen, setCartOpen] = useState(false);
    return (
        <header className="border-b border-zinc-200 bg-white text-zinc-900">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <div className="flex items-center gap-10">
                    <Link href="/" className="text-2xl font-extrabold tracking-tight">
                        <span className="text-[var(--brand-orange)]">cedi</span>man
                    </Link>

                    <div className="hidden md:block"><SearchAutocomplete /></div>
                </div>

                <div className="flex items-center gap-5">
                    <button onClick={() => setCartOpen(true)} className="relative text-zinc-700 hover:text-zinc-900">
                        <ShoppingBag className="h-5 w-5" />
                        {items.length > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand-orange)] text-[11px] font-medium text-white">
                                {items.reduce((acc, item) => acc + item.quantity, 0)}
                            </span>
                        )}
                    </button>

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" className="px-4 py-2 text-sm">
                            Log in
                        </Button>
                        <Button className="px-4 py-2 text-sm">
                            Sign up
                        </Button>
                    </div>
                </div>
            </div>
            <CategoryNav />
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </header>
    );
}
