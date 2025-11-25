"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { Bell, Search, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminHeader() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    return (
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white">
            <div className="flex h-16 items-center justify-between px-6">
                {/* Search */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="search"
                            placeholder="Search products, orders, customers..."
                            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-red)]"
                        />
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <button className="relative rounded-lg p-2 text-zinc-600 hover:bg-zinc-100">
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[var(--brand-red)]"></span>
                    </button>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-red)] text-white font-semibold">
                                {user?.firstName?.[0] || "A"}
                            </div>
                            <div className="text-left">
                                <div className="font-medium text-zinc-900">
                                    {user?.firstName} {user?.lastName}
                                </div>
                                <div className="text-xs text-zinc-500 capitalize">{user?.role}</div>
                            </div>
                        </button>

                        {showDropdown && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowDropdown(false)}
                                ></div>
                                <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-zinc-200 bg-white shadow-lg">
                                    <div className="p-2">
                                        <button
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                if (loggingOut) return;

                                                setLoggingOut(true);
                                                setShowDropdown(false);

                                                try {
                                                    await logout();
                                                    // Redirect to home page
                                                    router.push('/');
                                                    router.refresh();
                                                } catch (error) {
                                                    console.error('Logout error:', error);
                                                    // Still redirect even if logout has issues
                                                    router.push('/');
                                                } finally {
                                                    setLoggingOut(false);
                                                }
                                            }}
                                            disabled={loggingOut}
                                            className="w-full rounded-md px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loggingOut ? 'Signing out...' : 'Sign Out'}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
