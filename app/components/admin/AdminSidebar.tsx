"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { useState } from "react";

const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={`fixed left-0 top-0 z-40 h-screen border-r border-zinc-200 bg-white transition-all duration-300 ${collapsed ? "w-20" : "w-64"
                }`}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4">
                <Link href="/admin" className="flex items-center justify-center w-full">
                    {collapsed ? (
                        <img
                            src="/cediman.png"
                            alt="Cediman"
                            className="h-8 w-auto"
                        />
                    ) : (
                        <img
                            src="/cediman.png"
                            alt="Cediman"
                            className="h-8 w-auto"
                        />
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                ? "bg-[var(--brand-red)] text-white"
                                : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                                } ${collapsed ? "justify-center" : ""}`}
                            title={collapsed ? item.name : undefined}
                        >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            {!collapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse Toggle */}
            <div className="border-t border-zinc-200 p-4">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? (
                        <ChevronRight className="h-5 w-5" />
                    ) : (
                        <>
                            <ChevronLeft className="h-5 w-5 mr-2" />
                            <span>Collapse</span>
                        </>
                    )}
                </button>
            </div>

            {/* Back to Store */}
            <div className="border-t border-zinc-200 p-4">
                <Link
                    href="/"
                    className={`flex items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 ${collapsed ? "justify-center" : ""
                        }`}
                    title={collapsed ? "Back to Store" : undefined}
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {!collapsed && <span>Back to Store</span>}
                </Link>
            </div>
        </aside>
    );
}
