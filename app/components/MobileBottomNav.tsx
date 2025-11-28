"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "../providers/CartProvider";
import { useState } from "react";
import CartDrawer from "./CartDrawer";

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { items } = useCart();
    const [cartOpen, setCartOpen] = useState(false);

    // Don't show on admin, login, or delivery pages
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/login') || pathname?.startsWith('/delivery')) {
        return null;
    }

    const navigation = [
        { name: "Home", href: "/", icon: Home },
        { name: "Search", href: "/search", icon: Search },
        { name: "Cart", href: "#", icon: ShoppingBag, badge: items.reduce((acc, item) => acc + item.quantity, 0), isButton: true },
        { name: "Account", href: "/account", icon: User },
    ];

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white md:hidden">
                <div className="grid grid-cols-4">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        if (item.isButton) {
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => setCartOpen(true)}
                                    className={`relative flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${isActive
                                        ? "text-[var(--brand-red)]"
                                        : "text-zinc-600 hover:text-zinc-900"
                                        }`}
                                    aria-label={`Shopping cart with ${item.badge || 0} items`}
                                >
                                    <div className="relative">
                                        <Icon className="h-6 w-6" />
                                        {item.badge !== undefined && item.badge > 0 && (
                                            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand-red)] text-[10px] font-semibold text-white">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <span>{item.name}</span>
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`relative flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${isActive
                                    ? "text-[var(--brand-red)]"
                                    : "text-zinc-600 hover:text-zinc-900"
                                    }`}
                            >
                                <div className="relative">
                                    <Icon className="h-6 w-6" />
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand-red)] text-[10px] font-semibold text-white">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </>
    );
}
