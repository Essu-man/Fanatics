"use client";

import StatsCard from "../components/admin/StatsCard";
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown } from "lucide-react";

export default function AdminDashboard() {
    // Mock data - in production, fetch from API
    const stats = {
        revenue: "₵45,231",
        revenueChange: "+12.5% from last month",
        orders: "234",
        ordersChange: "+8.2% from last month",
        products: "1,234",
        productsChange: "12 new this week",
        customers: "892",
        customersChange: "+23 new this month",
    };

    const recentOrders = [
        { id: "ORD-001", customer: "John Doe", amount: "₵120.00", status: "Completed", date: "2024-01-15" },
        { id: "ORD-002", customer: "Jane Smith", amount: "₵85.50", status: "Processing", date: "2024-01-15" },
        { id: "ORD-003", customer: "Bob Johnson", amount: "₵200.00", status: "Shipped", date: "2024-01-14" },
        { id: "ORD-004", customer: "Alice Brown", amount: "₵150.75", status: "Pending", date: "2024-01-14" },
        { id: "ORD-005", customer: "Charlie Wilson", amount: "₵95.00", status: "Completed", date: "2024-01-13" },
    ];

    const topProducts = [
        { name: "Manchester United Home Jersey", sales: 145, revenue: "₵7,250" },
        { name: "Barcelona Away Jersey", sales: 132, revenue: "₵6,600" },
        { name: "Real Madrid Third Jersey", sales: 98, revenue: "₵4,900" },
        { name: "Liverpool Home Jersey", sales: 87, revenue: "₵4,350" },
        { name: "PSG Home Jersey", sales: 76, revenue: "₵3,800" },
    ];

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
                    changeType="positive"
                    icon={DollarSign}
                    iconColor="bg-green-500"
                />
                <StatsCard
                    title="Total Orders"
                    value={stats.orders}
                    change={stats.ordersChange}
                    changeType="positive"
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
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-zinc-100">
                                        <td className="py-3 font-medium text-zinc-900">{order.id}</td>
                                        <td className="py-3 text-zinc-600">{order.customer}</td>
                                        <td className="py-3 font-semibold text-zinc-900">{order.amount}</td>
                                        <td className="py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${order.status === "Completed"
                                                        ? "bg-green-100 text-green-700"
                                                        : order.status === "Processing"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : order.status === "Shipped"
                                                                ? "bg-purple-100 text-purple-700"
                                                                : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Products */}
                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-zinc-900">Top Products</h2>
                    <div className="space-y-4">
                        {topProducts.map((product, index) => (
                            <div key={product.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900">{product.name}</p>
                                        <p className="text-xs text-zinc-500">{product.sales} sales</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-zinc-900">{product.revenue}</p>
                                    <div className="flex items-center gap-1 text-xs text-green-600">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>+12%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
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
