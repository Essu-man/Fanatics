"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "../providers/AuthProvider";
import { auth } from "@/lib/firebase";
import StatsCard from "../components/admin/StatsCard";
import {
    Package,
    PlusCircle,
    DollarSign,
    ShoppingCart,
    TrendingUp,
    Boxes,
    AlertTriangle,
    ExternalLink,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import BalanceBreakdownModal from "../components/vendor/BalanceBreakdownModal";
import { useRouter } from "next/navigation";

interface VendorDashboardData {
    store: { slug: string; businessName: string };
    stats: {
        revenue: string;
        commissionRate?: number;
        platformFee?: string;
        netPayable?: string;
        balanceAvailable?: string;
        balancePending?: string;
        revenueChange: string;
        orders: string;
        ordersChange: string;
        unitsSold: string;
        productsLive: string;
        productsPending: string;
        productsTotal: string;
        lowStock: string;
        avgOrderValue: string;
    };
    breakdown?: {
        grossSales: number;
        commissionRate: number;
        platformFeeAmount: number;
        netPayableRevenue: number;
        totalPaidOut: number;
        balanceAvailable: number;
        balancePending: number;
    };
    topProducts: { name: string; sales: number; revenue: string }[];
    revenueOverTime: { date: string; revenue: number; orders: number }[];
    recentOrders: {
        id: string;
        date: string;
        status: string;
        yourRevenue: string;
        units: number;
    }[];
}

const STATUS_LABELS: Record<string, string> = {
    awaiting_payment: "Awaiting payment",
    submitted: "Submitted",
    confirmed: "Confirmed",
    processing: "Processing",
    in_transit: "In transit",
    out_for_delivery: "Out for delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

export default function VendorHomePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<VendorDashboardData | null>(null);
    const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const token = await auth.currentUser?.getIdToken();
                const res = await fetch("/api/vendor/dashboard", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    cache: "no-store",
                });
                const json = await res.json();
                if (json.success) setData(json);
            } catch (e) {
                console.error("Vendor dashboard:", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const revenueChangeType = useMemo(() => {
        const text = data?.stats.revenueChange ?? "";
        if (text.startsWith("+")) return "positive" as const;
        if (text.includes("%") && text.startsWith("-")) return "negative" as const;
        return "neutral" as const;
    }, [data?.stats.revenueChange]);

    const ordersChangeType = useMemo(() => {
        const text = data?.stats.ordersChange ?? "";
        if (text.startsWith("+")) return "positive" as const;
        if (text.includes("%") && text.startsWith("-")) return "negative" as const;
        return "neutral" as const;
    }, [data?.stats.ordersChange]);

    if (loading) {
        return (
            <div className="flex min-h-[320px] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent" />
                    <p className="text-sm text-zinc-600">Loading your analytics…</p>
                </div>
            </div>
        );
    }

    const breakdownData = data?.breakdown || {
        grossSales: Number(data?.stats.revenue?.replace(/[^0-9.]/g, "") || 0),
        commissionRate: data?.stats.commissionRate ?? 10,
        platformFeeAmount: Number(data?.stats.platformFee?.replace(/[^0-9.]/g, "") || 0),
        netPayableRevenue: Number(data?.stats.netPayable?.replace(/[^0-9.]/g, "") || 0),
        totalPaidOut: 0,
        balanceAvailable: Number(data?.stats.balanceAvailable?.replace(/[^0-9.]/g, "") || 0),
        balancePending: Number(data?.stats.balancePending?.replace(/[^0-9.]/g, "") || 0),
    };

    return (
        <div className="space-y-8">
            <BalanceBreakdownModal
                isOpen={isBreakdownOpen}
                onClose={() => setIsBreakdownOpen(false)}
                data={breakdownData}
                onWithdrawClick={() => router.push("/vendor/payouts")}
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">
                        Welcome{user?.firstName ? `, ${user.firstName}` : ""}
                    </h1>
                    <p className="mt-1 text-sm text-zinc-600">
                        {data?.store.businessName
                            ? `${data.store.businessName} — performance at a glance`
                            : "Your seller performance at a glance"}
                    </p>
                </div>
                {data?.store.slug && (
                    <Link
                        href={`/store/${data.store.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm hover:border-[var(--brand-red)]/40"
                    >
                        View storefront
                        <ExternalLink className="h-4 w-4" />
                    </Link>
                )}
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 px-5 py-4 text-sm text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <strong>Cediman Fee Breakdown:</strong> Based on the {data?.stats.commissionRate ?? 10}% platform fee rate, your actual net payable amount is calculated after subtracting Cediman's fee from gross product sales. Click any balance card below to view the breakdown.
                </div>
                <button
                    onClick={() => setIsBreakdownOpen(true)}
                    className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 underline hover:text-emerald-950"
                >
                    View Breakdown Popup &rarr;
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatsCard
                    title="Actual Net Payable"
                    value={data?.stats.netPayable ?? "₵0.00"}
                    change={`Gross: ${data?.stats.revenue ?? "₵0.00"} · Fee (${data?.stats.commissionRate ?? 10}%): -${data?.stats.platformFee ?? "₵0.00"}`}
                    changeType="positive"
                    icon={DollarSign}
                    iconColor="bg-emerald-600"
                    onClick={() => setIsBreakdownOpen(true)}
                    clickHint="View breakdown"
                />
                <StatsCard
                    title="Gross Sales"
                    value={data?.stats.revenue ?? "₵0.00"}
                    change={data?.stats.revenueChange}
                    changeType={revenueChangeType}
                    icon={TrendingUp}
                    iconColor="bg-blue-600"
                />
                <StatsCard
                    title="Orders with your items"
                    value={data?.stats.orders ?? "0"}
                    change={data?.stats.ordersChange}
                    changeType={ordersChangeType}
                    icon={ShoppingCart}
                    iconColor="bg-[var(--brand-red)]"
                />
                <StatsCard
                    title="Available Balance"
                    value={data?.stats.balanceAvailable ?? "₵0.00"}
                    change={`Escrow pending: ${data?.stats.balancePending ?? "₵0.00"}`}
                    changeType="neutral"
                    icon={Boxes}
                    iconColor="bg-zinc-700"
                    onClick={() => setIsBreakdownOpen(true)}
                    clickHint="View breakdown"
                />
            </div>

            {(Number(data?.stats.lowStock) ?? 0) > 0 && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>
                        <strong>{data?.stats.lowStock}</strong> listing
                        {Number(data?.stats.lowStock) !== 1 ? "s have" : " has"} low stock (5 or fewer). Restock
                        soon to avoid missed sales.
                    </p>
                </div>
            )}

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-900">Your sales (last 30 days)</h2>
                <p className="mt-1 text-sm text-zinc-500">Daily revenue from your products only</p>
                {data?.revenueOverTime && data.revenueOverTime.some((d) => d.revenue > 0) ? (
                    <div className="mt-4 h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.revenueOverTime}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#71717a"
                                    tick={{ fontSize: 11 }}
                                    tickFormatter={(value) => {
                                        const date = new Date(value);
                                        return `${date.getMonth() + 1}/${date.getDate()}`;
                                    }}
                                />
                                <YAxis
                                    stroke="#71717a"
                                    tick={{ fontSize: 11 }}
                                    tickFormatter={(v) => `₵${v}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        border: "1px solid #e4e4e7",
                                        borderRadius: "8px",
                                    }}
                                    formatter={(value: number, name: string) => {
                                        if (name === "Revenue") return [`₵${Number(value).toFixed(2)}`, name];
                                        return [value, name];
                                    }}
                                    labelFormatter={(value) =>
                                        new Date(value).toLocaleDateString("en-GB", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#dc2626"
                                    strokeWidth={2}
                                    dot={{ fill: "#dc2626", r: 3 }}
                                    name="Revenue"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="mt-6 flex h-48 items-center justify-center rounded-lg bg-zinc-50">
                        <div className="text-center">
                            <Boxes className="mx-auto h-10 w-10 text-zinc-300" />
                            <p className="mt-2 text-sm text-zinc-500">No sales in the last 30 days yet</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-zinc-900">Top products</h2>
                    {data?.topProducts && data.topProducts.length > 0 ? (
                        <ul className="mt-4 space-y-3">
                            {data.topProducts.map((product, i) => (
                                <li
                                    key={i}
                                    className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900">{product.name}</p>
                                        <p className="text-xs text-zinc-500">{product.sales} units</p>
                                    </div>
                                    <p className="text-sm font-semibold text-zinc-900">{product.revenue}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-6 text-sm text-zinc-500">Sales will appear here once customers order your items.</p>
                    )}
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-zinc-900">Recent orders</h2>
                    {data?.recentOrders && data.recentOrders.length > 0 ? (
                        <ul className="mt-4 divide-y divide-zinc-100">
                            {data.recentOrders.map((order) => (
                                <li key={order.id} className="flex items-center justify-between py-3 first:pt-0">
                                    <div>
                                        <p className="font-mono text-xs text-zinc-500">{order.id.slice(0, 12)}…</p>
                                        <p className="text-sm text-zinc-600">
                                            {order.date} · {order.units} unit{order.units !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-zinc-900">{order.yourRevenue}</p>
                                        <p className="text-xs text-zinc-500">
                                            {STATUS_LABELS[order.status] ?? order.status}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-6 text-sm text-zinc-500">No orders including your products yet.</p>
                    )}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <Link
                    href="/vendor/products"
                    className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-[var(--brand-red)]/40"
                >
                    <Package className="h-10 w-10 text-[var(--brand-red)]" />
                    <div>
                        <p className="font-semibold text-zinc-900">My products</p>
                        <p className="text-sm text-zinc-500">View and edit what you sell</p>
                    </div>
                </Link>
                <Link
                    href="/vendor/stock"
                    className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-[var(--brand-red)]/40"
                >
                    <Boxes className="h-10 w-10 text-[var(--brand-red)]" />
                    <div>
                        <p className="font-semibold text-zinc-900">Manage stock</p>
                        <p className="text-sm text-zinc-500">Color & size quantities</p>
                    </div>
                </Link>
                <Link
                    href="/vendor/products/new"
                    className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-[var(--brand-red)]/40"
                >
                    <PlusCircle className="h-10 w-10 text-[var(--brand-red)]" />
                    <div>
                        <p className="font-semibold text-zinc-900">Add product</p>
                        <p className="text-sm text-zinc-500">Create a new listing</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
