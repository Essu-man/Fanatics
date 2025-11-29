"use client";

import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, ShoppingCart, Package } from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface TopProduct {
    name: string;
    sales: number;
    revenue: string;
}

interface RevenueDataPoint {
    date: string;
    revenue: number;
    orders: number;
}

interface DashboardData {
    stats: {
        revenue: string;
        orders: string;
        products: string;
        customers: string;
    };
    topProducts: TopProduct[];
    revenueOverTime: RevenueDataPoint[];
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
                revenueOverTime: result.revenueOverTime || [],
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

            {/* Revenue Chart */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-zinc-900">Revenue Overview (Last 30 Days)</h2>
                {data?.revenueOverTime && data.revenueOverTime.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.revenueOverTime}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                            <XAxis
                                dataKey="date"
                                stroke="#71717a"
                                style={{ fontSize: "12px" }}
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return `${date.getMonth() + 1}/${date.getDate()}`;
                                }}
                            />
                            <YAxis
                                stroke="#71717a"
                                style={{ fontSize: "12px" }}
                                tickFormatter={(value) => `₵${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #e4e4e7",
                                    borderRadius: "8px",
                                }}
                                labelFormatter={(value) => {
                                    const date = new Date(value);
                                    return date.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    });
                                }}
                                formatter={(value: number, name: string) => {
                                    if (name === "revenue") {
                                        return [`₵${value.toFixed(2)}`, "Revenue"];
                                    }
                                    return [value, "Orders"];
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#dc2626"
                                strokeWidth={2}
                                dot={{ fill: "#dc2626", r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Revenue"
                            />
                            <Line
                                type="monotone"
                                dataKey="orders"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: "#3b82f6", r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Orders"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-64 items-center justify-center rounded-lg bg-zinc-50">
                        <div className="text-center">
                            <Package className="mx-auto h-12 w-12 text-zinc-400" />
                            <p className="mt-2 text-sm text-zinc-500">No revenue data available</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Top Products Chart */}
            {data?.topProducts && data.topProducts.length > 0 && (
                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-zinc-900">Top Products by Sales</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={data.topProducts.map((product) => ({
                                name: product.name.length > 20 ? product.name.substring(0, 20) + "..." : product.name,
                                sales: product.sales,
                                revenue: parseFloat(product.revenue.replace("₵", "").replace(",", "")),
                            }))}
                            layout="vertical"
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                            <XAxis type="number" stroke="#71717a" style={{ fontSize: "12px" }} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                stroke="#71717a"
                                style={{ fontSize: "12px" }}
                                width={150}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #e4e4e7",
                                    borderRadius: "8px",
                                }}
                                formatter={(value: number, name: string) => {
                                    if (name === "revenue") {
                                        return [`₵${value.toFixed(2)}`, "Revenue"];
                                    }
                                    return [value, "Sales"];
                                }}
                            />
                            <Legend />
                            <Bar dataKey="sales" fill="#dc2626" name="Sales" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

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
