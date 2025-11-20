"use client";

import { useState } from "react";
import { Search, Eye, Mail, Phone } from "lucide-react";

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    orders: number;
    totalSpent: number;
    joinedDate: string;
    status: "active" | "inactive";
}

const mockCustomers: Customer[] = [
    {
        id: "CUST-001",
        name: "John Doe",
        email: "john@example.com",
        phone: "+233 XX XXX XXXX",
        orders: 12,
        totalSpent: 1245.50,
        joinedDate: "2023-06-15",
        status: "active",
    },
    {
        id: "CUST-002",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+233 XX XXX XXXX",
        orders: 8,
        totalSpent: 890.00,
        joinedDate: "2023-08-22",
        status: "active",
    },
    {
        id: "CUST-003",
        name: "Bob Johnson",
        email: "bob@example.com",
        phone: "+233 XX XXX XXXX",
        orders: 5,
        totalSpent: 450.00,
        joinedDate: "2023-11-10",
        status: "active",
    },
];

export default function AdminCustomersPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCustomers = mockCustomers.filter((customer) =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-zinc-900">Customers</h1>
                <p className="mt-1 text-sm text-zinc-600">
                    Manage your customer base and view customer insights
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-600">Total Customers</p>
                    <p className="mt-1 text-2xl font-bold text-zinc-900">{mockCustomers.length}</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-600">Active Customers</p>
                    <p className="mt-1 text-2xl font-bold text-green-600">
                        {mockCustomers.filter((c) => c.status === "active").length}
                    </p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-600">Avg. Order Value</p>
                    <p className="mt-1 text-2xl font-bold text-zinc-900">
                        ₵{(mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / mockCustomers.reduce((sum, c) => sum + c.orders, 0)).toFixed(2)}
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
                                <th className="p-4">Customer</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Orders</th>
                                <th className="p-4">Total Spent</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="text-sm hover:bg-zinc-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-red)] text-white font-semibold">
                                                {customer.name.split(" ").map((n) => n[0]).join("")}
                                            </div>
                                            <div>
                                                <p className="font-medium text-zinc-900">{customer.name}</p>
                                                <p className="text-xs text-zinc-500">{customer.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-zinc-600">
                                                <Mail className="h-3 w-3" />
                                                <span className="text-xs">{customer.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-zinc-600">
                                                <Phone className="h-3 w-3" />
                                                <span className="text-xs">{customer.phone}</span>
                                            </div>
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
