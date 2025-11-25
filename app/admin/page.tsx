"use client";

import { useEffect, useState, useMemo } from "react";
import StatsCard from "../components/admin/StatsCard";
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";

interface DashboardStats {
    revenue: string;
    revenueChange: string;
    orders: string;
    ordersChange: string;
    products: string;
    productsChange: string;
    customers: string;
    customersChange: string;
}

interface RecentOrder {
    id: string;
    customer: string;
    amount: string;
    status: string;
    date: string;
}

interface TopProduct {
    name: string;
    sales: number;
    revenue: string;
}

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        revenue: "₵0.00",
        revenueChange: "Loading...",
        orders: "0",
        ordersChange: "Loading...",
        products: "0",
        productsChange: "Loading...",
        customers: "0",
        customersChange: "Loading...",
    });
    const [allRecentOrders, setAllRecentOrders] = useState<RecentOrder[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 4;

    // Calculate pagination
    const totalPages = Math.ceil(allRecentOrders.length / ordersPerPage);
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const recentOrders = useMemo(() => {
        return allRecentOrders.slice(startIndex, endIndex);
    }, [allRecentOrders, startIndex, endIndex]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Reset to page 1 when orders change
    useEffect(() => {
        setCurrentPage(1);
    }, [allRecentOrders.length]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Unable to load dashboard data");
            }

            setStats(data.stats);
            setAllRecentOrders(data.recentOrders || []);
            setTopProducts(data.topProducts || []);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-zinc-600">
                        Welcome back! Here's what's happening with your store today.
                    </p>
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--brand-red)] border-r-transparent"></div>
                        <p className="mt-4 text-sm text-zinc-600">Loading dashboard data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
                <p className="mt-1 text-sm text-zinc-600">
                    Welcome back! Here's what's happening with your store today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Revenue"
                    value={stats.revenue}
                    change={stats.revenueChange}
                    changeType={stats.revenueChange.includes("+") ? "positive" : stats.revenueChange.includes("-") ? "negative" : "neutral"}
                    icon={DollarSign}
                    iconColor="bg-green-500"
                />
                <StatsCard
                    title="Total Orders"
                    value={stats.orders}
                    change={stats.ordersChange}
                    changeType={stats.ordersChange.includes("+") ? "positive" : stats.ordersChange.includes("-") ? "negative" : "neutral"}
                    icon={ShoppingCart}
                    iconColor="bg-blue-500"
                />
                <StatsCard
                    title="Total Products"
                    value={stats.products}
                    change={stats.productsChange}
                    changeType="neutral"
                    icon={Package}
                    iconColor="bg-purple-500"
                />
                <StatsCard
                    title="Total Customers"
                    value={stats.customers}
                    change={stats.customersChange}
                    changeType="positive"
                    icon={Users}
                    iconColor="bg-orange-500"
                />
            </div>

            {/* Charts and Tables */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Orders */}
                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-zinc-900">Recent Orders</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-200 text-left text-sm font-medium text-zinc-600">
                                    <th className="pb-3">Order ID</th>
                                    <th className="pb-3">Customer</th>
                                    <th className="pb-3">Amount</th>
                                    <th className="pb-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {recentOrders.length > 0 ? (
                                    recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b border-zinc-100">
                                            <td className="py-3 font-medium text-zinc-900">{order.id}</td>
                                            <td className="py-3 text-zinc-600">{order.customer}</td>
                                            <td className="py-3 font-semibold text-zinc-900">{order.amount}</td>
                                            <td className="py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${order.status === "delivered"
                                                        ? "bg-green-100 text-green-700"
                                                        : order.status === "processing" || order.status === "confirmed"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : order.status === "out_for_delivery" || order.status === "in_transit"
                                                                ? "bg-purple-100 text-purple-700"
                                                                : order.status === "cancelled"
                                                                    ? "bg-red-100 text-red-700"
                                                                    : "bg-yellow-100 text-yellow-700"
                                                        }`}
                                                >
                                                    {order.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-sm text-zinc-500">
                                            No recent orders
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {allRecentOrders.length > ordersPerPage && (
                        <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4">
                            <div className="text-sm text-zinc-600">
                                Showing {startIndex + 1} to {Math.min(endIndex, allRecentOrders.length)} of {allRecentOrders.length} orders
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${currentPage === page
                                                ? "bg-[var(--brand-red)] text-white"
                                                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Top Products */}
                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-zinc-900">Top Products</h2>
                    <div className="space-y-4">
                        {topProducts.length > 0 ? (
                            topProducts.map((product, index) => (
                                <div key={`${product.name}-${index}`} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900">{product.name}</p>
                                            <p className="text-xs text-zinc-500">{product.sales} {product.sales === 1 ? 'sale' : 'sales'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-zinc-900">{product.revenue}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-sm text-zinc-500">
                                No product sales data available
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-zinc-900">Quick Actions</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <button className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 text-left transition-colors hover:bg-zinc-50">
                        <Package className="h-8 w-8 text-[var(--brand-red)]" />
                        <div>
                            <p className="font-medium text-zinc-900">Add Product</p>
                            <p className="text-xs text-zinc-500">Create new product</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 text-left transition-colors hover:bg-zinc-50">
                        <ShoppingCart className="h-8 w-8 text-[var(--brand-red)]" />
                        <div>
                            <p className="font-medium text-zinc-900">View Orders</p>
                            <p className="text-xs text-zinc-500">Manage all orders</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 text-left transition-colors hover:bg-zinc-50">
                        <Users className="h-8 w-8 text-[var(--brand-red)]" />
                        <div>
                            <p className="font-medium text-zinc-900">Customers</p>
                            <p className="text-xs text-zinc-500">View customer list</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 text-left transition-colors hover:bg-zinc-50">
                        <TrendingUp className="h-8 w-8 text-[var(--brand-red)]" />
                        <div>
                            <p className="font-medium text-zinc-900">Analytics</p>
                            <p className="text-xs text-zinc-500">View detailed reports</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
