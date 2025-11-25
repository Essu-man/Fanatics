"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Package } from "lucide-react";

interface TopProduct {
    name: string;
    sales: number;
    revenue: string;
}

interface DashboardData {
    stats: {
        revenue: string;
        orders: string;
        products: string;
        customers: string;
    };
    topProducts: TopProduct[];
}

export default function AdminAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Unable to load analytics");
            }

            setData({
                stats: result.stats,
                topProducts: result.topProducts || [],
            });
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate average order value
    const avgOrderValue = data?.stats.revenue && data?.stats.orders
        ? parseFloat(data.stats.revenue.replace("₵", "").replace(",", "")) / parseInt(data.stats.orders || "1")
        : 0;

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                    <p className="text-zinc-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-zinc-900">Analytics</h1>
                <p className="mt-1 text-sm text-zinc-600">
                    Track your store's performance and insights
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-600">Total Revenue</p>
                    <p className="mt-1 text-2xl font-bold text-zinc-900">{data?.stats.revenue || "₵0.00"}</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-600">Total Orders</p>
                    <p className="mt-1 text-2xl font-bold text-zinc-900">{data?.stats.orders || "0"}</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-600">Total Products</p>
                    <p className="mt-1 text-2xl font-bold text-zinc-900">{data?.stats.products || "0"}</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-600">Total Customers</p>
                    <p className="mt-1 text-2xl font-bold text-zinc-900">{data?.stats.customers || "0"}</p>
                </div>
            </div>

            {/* Revenue Chart Placeholder */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-zinc-900">Revenue Overview</h2>
                <div className="flex h-64 items-center justify-center rounded-lg bg-zinc-50">
                    <div className="text-center">
                        <BarChart3 className="mx-auto h-12 w-12 text-zinc-400" />
                        <p className="mt-2 text-sm text-zinc-600">Chart visualization coming soon</p>
                        <p className="text-xs text-zinc-500">Integrate with Chart.js or Recharts</p>
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-zinc-900">Top Performing Products</h3>
                    {data?.topProducts && data.topProducts.length > 0 ? (
                        <div className="space-y-3">
                            {data.topProducts.map((product, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-red)]/10">
                                            <Package className="h-5 w-5 text-[var(--brand-red)]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900">{product.name}</p>
                                            <p className="text-xs text-zinc-500">{product.sales} sales</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-zinc-900">{product.revenue}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <Package className="mx-auto h-8 w-8 text-zinc-400" />
                            <p className="mt-2 text-sm text-zinc-500">No product sales data yet</p>
                        </div>
                    )}
                </div>

                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-zinc-900">Customer Insights</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-4">
                            <div>
                                <p className="text-sm font-medium text-zinc-600">Avg. Order Value</p>
                                <p className="mt-1 text-2xl font-bold text-zinc-900">
                                    ₵{avgOrderValue.toFixed(2)}
                                </p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-4">
                            <div>
                                <p className="text-sm font-medium text-zinc-600">Total Orders</p>
                                <p className="mt-1 text-2xl font-bold text-zinc-900">
                                    {data?.stats.orders || "0"}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-4">
                            <div>
                                <p className="text-sm font-medium text-zinc-600">Total Revenue</p>
                                <p className="mt-1 text-2xl font-bold text-zinc-900">
                                    {data?.stats.revenue || "₵0.00"}
                                </p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-orange-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
