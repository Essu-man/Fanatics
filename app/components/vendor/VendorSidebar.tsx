"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, PlusCircle } from "lucide-react";

const navigation = [
    { name: "Overview", href: "/vendor", icon: LayoutDashboard },
    { name: "My products", href: "/vendor/products", icon: Package },
    { name: "Add product", href: "/vendor/products/new", icon: PlusCircle },
];

export default function VendorSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-zinc-200 bg-white">
            <div className="flex h-16 items-center justify-center border-b border-zinc-200 px-4">
                <Link href="/vendor" className="text-lg font-bold text-zinc-900">
                    Seller dashboard
                </Link>
            </div>
            <nav className="space-y-1 p-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-[var(--brand-red)] text-white"
                                    : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                            }`}
                        >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-200 p-4">
                <Link
                    href="/"
                    className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                    Back to shop
                </Link>
            </div>
        </aside>
    );
}
