"use client";

import { BarChart3, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";

export default function AdminAnalyticsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-zinc-900">Analytics</h1>
                <p className="mt-1 text-sm text-zinc-600">
                    Track your store's performance and insights
                </p>
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
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-zinc-100"></div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900">Product {i}</p>
                                        <p className="text-xs text-zinc-500">{100 - i * 10} sales</p>
                                    </div>
                                </div>
                                <p className="text-sm font-semibold text-zinc-900">₵{(1000 - i * 100).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-zinc-900">Customer Insights</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-4">
                            <div>
                                <p className="text-sm font-medium text-zinc-600">Avg. Order Value</p>
                                <p className="mt-1 text-2xl font-bold text-zinc-900">₵125.50</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-4">
                            <div>
                                <p className="text-sm font-medium text-zinc-600">Conversion Rate</p>
                                <p className="mt-1 text-2xl font-bold text-zinc-900">3.2%</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-4">
                            <div>
                                <p className="text-sm font-medium text-zinc-600">Cart Abandonment</p>
                                <p className="mt-1 text-2xl font-bold text-zinc-900">68%</p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-orange-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
