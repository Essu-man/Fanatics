"use client";

import Link from "next/link";
import { ShoppingBag, User, LogOut, Settings, Package } from "lucide-react";
import { useCart } from "../providers/CartProvider";
import { useAuth } from "../providers/AuthProvider";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import CartDrawer from "./CartDrawer";
import SearchAutocomplete from "./SearchAutocomplete";

export default function Header() {
    const { items } = useCart();
    const { user, isAdmin, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [cartOpen, setCartOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    // Don't show header on login page or admin pages
    if (pathname?.startsWith('/login') || pathname?.startsWith('/admin') || pathname?.startsWith('/delivery')) {
        return null;
    }

    return (
        <header className="border-b border-zinc-200 bg-white text-zinc-900">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-2">
                    <img
                        src="/cediman.png"
                        alt="Cediman"
                        className="h-14 w-auto sm:h-16 lg:h-20 transition-all"
                    />
                </Link>

                <div className="hidden lg:block flex-1 max-w-[560px] mx-4 lg:mx-8">
                    <SearchAutocomplete />
                </div>

                <div className="flex items-center gap-4">
                    {/* Track Order Link */}
                    <Link
                        href="/track"
                        className="hidden sm:flex items-center gap-1.5 text-sm text-zinc-700 hover:text-[var(--brand-red)] transition-colors"
                        title="Track Your Order"
                    >
                        <Package className="h-5 w-5" />
                        <span>Track Order</span>
                    </Link>

                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                className="flex items-center gap-2 text-sm text-zinc-700 hover:text-zinc-900"
                            >
                                <User className="h-5 w-5" />
                                <span className="hidden sm:inline">{user.firstName}</span>
                            </button>

                            {userDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-[110]"
                                        onClick={() => setUserDropdownOpen(false)}
                                    ></div>
                                    <div className="absolute right-0 top-full z-[120] mt-2 w-48 rounded-lg border border-zinc-200 bg-white shadow-lg">
                                        <div className="p-2 space-y-1">
                                            {isAdmin && (
                                                <Link
                                                    href="/admin"
                                                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                >
                                                    <Settings className="h-4 w-4" />
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            <Link
                                                href="/account"
                                                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                                                onClick={() => setUserDropdownOpen(false)}
                                            >
                                                <User className="h-4 w-4" />
                                                My Account
                                            </Link>
                                            <Link
                                                href="/account/orders"
                                                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                                                onClick={() => setUserDropdownOpen(false)}
                                            >
                                                <Package className="h-4 w-4" />
                                                My Orders
                                            </Link>
                                            <button
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    if (loggingOut) return;

                                                    setLoggingOut(true);
                                                    setUserDropdownOpen(false);

                                                    try {
                                                        await logout();
                                                        // Use router for better navigation
                                                        router.push('/');
                                                        router.refresh(); // Refresh to clear any cached data
                                                    } catch (error) {
                                                        console.error('Logout error:', error);
                                                        // Still redirect even if logout has issues
                                                        router.push('/');
                                                    } finally {
                                                        setLoggingOut(false);
                                                    }
                                                }}
                                                disabled={loggingOut}
                                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                {loggingOut ? 'Signing out...' : 'Sign Out'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="ml-auto rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors">
                            Sign In
                        </Link>
                    )}
                    <button
                        onClick={() => setCartOpen(true)}
                        className="hidden lg:flex relative text-[var(--brand-red)] hover:text-[var(--brand-red-dark)]"
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
