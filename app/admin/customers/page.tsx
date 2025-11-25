"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Eye, Mail, Phone, Trophy } from "lucide-react";

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    orders: number;
    totalSpent: number;
    joinedDate: string;
    status: "active" | "inactive";
    rank?: number;
}

interface Order {
    id: string;
    userId?: string;
    guestEmail?: string;
    guestPhone?: string;
    total: number;
    orderDate: string;
}

export default function AdminCustomersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState<Customer[]>([]);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            // Fetch all orders to calculate customer stats
            const response = await fetch("/api/orders/admin?limit=1000", { cache: "no-store" });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Unable to load orders");
            }

            const orders: Order[] = data.orders || [];

            // Group orders by customer (userId or guestEmail)
            const customerMap = new Map<string, {
                id: string;
                email: string;
                phone: string;
                name: string;
                orders: number;
                totalSpent: number;
                firstOrderDate: string;
            }>();

            orders.forEach((order) => {
                const customerKey = order.userId || order.guestEmail || "unknown";
                const existing = customerMap.get(customerKey);

                if (existing) {
                    existing.orders += 1;
                    existing.totalSpent += order.total || 0;
                    // Keep the earliest order date
                    const orderDate = new Date(order.orderDate);
                    if (orderDate < new Date(existing.firstOrderDate)) {
                        existing.firstOrderDate = order.orderDate;
                    }
                } else {
                    // Extract name from email or use "Guest Customer"
                    const email = order.userId ? "" : (order.guestEmail || "");
                    const name = email ? email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "Guest Customer";

                    customerMap.set(customerKey, {
                        id: order.userId || `guest-${customerKey}`,
                        email: email || order.guestEmail || "N/A",
                        phone: order.guestPhone || "N/A",
                        name: order.userId ? "Registered User" : name,
                        orders: 1,
                        totalSpent: order.total || 0,
                        firstOrderDate: order.orderDate,
                    });
                }
            });

            // Convert to array and rank by total spent
            const customersList: Customer[] = Array.from(customerMap.values())
                .map((customer) => ({
                    id: customer.id,
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    orders: customer.orders,
                    totalSpent: customer.totalSpent,
                    joinedDate: new Date(customer.firstOrderDate).toISOString().split("T")[0],
                    status: (customer.orders > 0 ? "active" : "inactive") as "active" | "inactive",
                }))
                .sort((a, b) => b.totalSpent - a.totalSpent) // Sort by total spent descending
                .map((customer, index) => ({
                    ...customer,
                    rank: index + 1,
                }));

            setCustomers(customersList);
        } catch (error) {
            console.error("Error fetching customers:", error);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = useMemo(() => {
        return customers.filter((customer) =>
            customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [customers, searchQuery]);

    const stats = useMemo(() => {
        const totalCustomers = customers.length;
        const activeCustomers = customers.filter((c) => c.status === "active").length;
        const totalOrders = customers.reduce((sum, c) => sum + c.orders, 0);
        const avgOrderValue = totalOrders > 0
            ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / totalOrders
            : 0;

        return {
            totalCustomers,
            activeCustomers,
            avgOrderValue,
        };
    }, [customers]);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                    <p className="text-zinc-600">Loading customers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-zinc-900">Customers</h1>
                <p className="mt-1 text-sm text-zinc-600">
                    Manage your customer base and view customer insights. Ranked by total purchases.
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-600">Total Customers</p>
                    <p className="mt-1 text-2xl font-bold text-zinc-900">{stats.totalCustomers}</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-600">Active Customers</p>
                    <p className="mt-1 text-2xl font-bold text-green-600">
                        {stats.activeCustomers}
                    </p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-600">Avg. Order Value</p>
                    <p className="mt-1 text-2xl font-bold text-zinc-900">
                        ₵{stats.avgOrderValue.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="search"
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-red)]"
                    />
                </div>
            </div>

            {/* Customers Table */}
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-zinc-200 bg-zinc-50">
                            <tr className="text-left text-sm font-medium text-zinc-600">
                                <th className="p-4">Rank</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Orders</th>
                                <th className="p-4">Total Spent</th>
                                <th className="p-4">First Order</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="text-sm hover:bg-zinc-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {customer.rank === 1 && (
                                                <Trophy className="h-4 w-4 text-yellow-500" />
                                            )}
                                            {customer.rank === 2 && (
                                                <Trophy className="h-4 w-4 text-zinc-400" />
                                            )}
                                            {customer.rank === 3 && (
                                                <Trophy className="h-4 w-4 text-orange-600" />
                                            )}
                                            <span className={`font-bold ${(customer.rank || 0) <= 3 ? "text-[var(--brand-red)]" : "text-zinc-600"}`}>
                                                #{customer.rank || 0}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-red)] text-white font-semibold">
                                                {customer.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-zinc-900">{customer.name}</p>
                                                <p className="text-xs text-zinc-500">{customer.id.substring(0, 20)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-zinc-600">
                                                <Mail className="h-3 w-3" />
                                                <span className="text-xs">{customer.email}</span>
                                            </div>
                                            {customer.phone !== "N/A" && (
                                                <div className="flex items-center gap-2 text-zinc-600">
                                                    <Phone className="h-3 w-3" />
                                                    <span className="text-xs">{customer.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 font-semibold text-zinc-900">{customer.orders}</td>
                                    <td className="p-4 font-semibold text-zinc-900">
                                        ₵{customer.totalSpent.toFixed(2)}
                                    </td>
                                    <td className="p-4 text-zinc-600">{customer.joinedDate}</td>
                                    <td className="p-4">
                                        <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
                                            title="View Details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredCustomers.length === 0 && (
                    <div className="py-12 text-center">
                        <p className="text-sm text-zinc-600">No customers found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
