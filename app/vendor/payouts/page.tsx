"use client";

import React, { useEffect, useState, useCallback, Fragment } from "react";
import { auth } from "@/lib/firebase";
import { useToast } from "@/app/components/ui/ToastContainer";
import Link from "next/link";
import {
    DollarSign,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    ArrowDownLeft,
    TrendingUp,
    Settings,
    Loader2
} from "lucide-react";

interface LedgerEntry {
    id: string;
    orderId: string | null;
    type: "sale" | "payout" | "refund" | "adjustment";
    amount: number;
    status: "pending" | "available" | "completed" | "cancelled";
    createdAt: string;
    description: string;
}

interface PayoutRequest {
    id: string;
    amount: number;
    status: "pending" | "approved" | "completed" | "rejected";
    payoutMethod: string;
    payoutDetails: any;
    createdAt: string;
}

interface PayoutSettings {
    payoutMethod: string | null;
    bankName: string | null;
    branch: string | null;
    accountNumber: string | null;
    accountName: string | null;
    momoNetwork: string | null;
    momoNumber: string | null;
}

interface Balances {
    available: number;
    pending: number;
}

import BalanceBreakdownModal from "@/app/components/vendor/BalanceBreakdownModal";

export default function VendorPayoutsPage() {
    const { showToast } = useToast();
    const [balances, setBalances] = useState<Balances>({ available: 0, pending: 0 });
    const [commissionRate, setCommissionRate] = useState<number>(10);
    const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
    const [expandedLedgerId, setExpandedLedgerId] = useState<string | null>(null);
    const [payoutSettings, setPayoutSettings] = useState<PayoutSettings>({
        payoutMethod: null,
        bankName: null,
        branch: null,
        accountNumber: null,
        accountName: null,
        momoNetwork: null,
        momoNumber: null,
    });
    const [history, setHistory] = useState<LedgerEntry[]>([]);
    const [requests, setRequests] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Payout request states
    const [payoutAmount, setPayoutAmount] = useState("");
    const [requesting, setRequesting] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch("/api/vendor/payouts", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                cache: "no-store",
            });
            const data = await res.json();
            if (data.success) {
                setBalances(data.balances);
                if (typeof data.commissionRate === "number") {
                    setCommissionRate(data.commissionRate);
                }
                setPayoutSettings(data.payoutSettings);
                setHistory(data.history || []);
                setRequests(data.payoutRequests || []);
            } else {
                throw new Error(data.error || "Failed to load payout details");
            }
        } catch (e: any) {
            showToast(e.message || "Failed to load payouts data", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRequestPayout = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Number(payoutAmount);
        if (isNaN(amount) || amount <= 0) {
            showToast("Enter a valid amount", "error");
            return;
        }

        if (amount > balances.available) {
            showToast("Amount exceeds your available balance", "error");
            return;
        }

        setRequesting(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch("/api/vendor/payouts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ amount }),
            });
            const data = await res.json();
            if (data.success) {
                showToast("Withdrawal request submitted successfully", "success");
                setPayoutAmount("");
                loadData();
            } else {
                throw new Error(data.error || "Request failed");
            }
        } catch (e: any) {
            showToast(e.message || "Payout request failed", "error");
        } finally {
            setRequesting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-[var(--brand-red)]" />
                    <p className="mt-2 text-sm text-zinc-600 font-bold">Loading payouts info…</p>
                </div>
            </div>
        );
    }

    const netSaleTotal = history.filter(h => h.type === "sale").reduce((sum, h) => sum + (h.amount || 0), 0);
    const totalPaidOut = history.filter(h => h.type === "payout").reduce((sum, h) => sum + Math.abs(h.amount || 0), 0);
    const grossSales = commissionRate < 100 ? netSaleTotal / (1 - commissionRate / 100) : netSaleTotal;
    const platformFeeAmount = grossSales - netSaleTotal;

    const breakdownData = {
        grossSales: Number(grossSales.toFixed(2)),
        commissionRate,
        platformFeeAmount: Number(platformFeeAmount.toFixed(2)),
        netPayableRevenue: Number(netSaleTotal.toFixed(2)),
        totalPaidOut: Number(totalPaidOut.toFixed(2)),
        balanceAvailable: balances.available,
        balancePending: balances.pending,
    };

    return (
        <div className="space-y-8">
            <BalanceBreakdownModal
                isOpen={isBreakdownOpen}
                onClose={() => setIsBreakdownOpen(false)}
                data={breakdownData}
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900">Payouts & Balances</h1>
                    <p className="mt-1 text-sm text-zinc-600 font-semibold">
                        Monitor your earnings in escrow, transfer requests, and banking details.
                    </p>
                </div>
                <button
                    onClick={() => setIsBreakdownOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-900 shadow-sm hover:bg-emerald-100 transition-colors"
                >
                    <TrendingUp className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Cediman Rate: <strong>{commissionRate}%</strong> fee · View Breakdown Popup &rarr;</span>
                </button>
            </div>

            {/* Balances Layout */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Available Balance */}
                <div
                    onClick={() => setIsBreakdownOpen(true)}
                    className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6 space-y-3 shadow-sm cursor-pointer hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20 transition-all group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Available Balance</span>
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                Click breakdown
                            </span>
                        </div>
                        <div className="rounded-xl bg-emerald-500 p-2 text-white group-hover:scale-110 transition-transform">
                            <DollarSign className="h-5 w-5" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-emerald-950">GH₵ {balances.available.toFixed(2)}</h2>
                        <p className="text-xs text-emerald-700 mt-1 font-semibold">Cleared and withdrawable — click to see fee breakdown</p>
                    </div>
                </div>

                {/* Pending Balance */}
                <div className="rounded-3xl border border-amber-100 bg-amber-50/50 p-6 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-amber-800 uppercase tracking-wider">Pending Balance</span>
                        <div className="rounded-xl bg-amber-500 p-2 text-white">
                            <Clock className="h-5 w-5" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-amber-950">GH₵ {balances.pending.toFixed(2)}</h2>
                        <p className="text-xs text-amber-700 mt-1 font-semibold">Escrowed until orders are delivered</p>
                    </div>
                </div>

                {/* Quick Payout Form */}
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider mb-1">Request Payout</h3>
                        <p className="text-xs text-zinc-500 font-semibold mb-3">Min. threshold: <strong>GH₵ 20.00</strong></p>
                    </div>
                    {balances.available >= 20 ? (
                        <form onSubmit={handleRequestPayout} className="space-y-3">
                            <div className="relative rounded-xl border border-zinc-200 focus-within:border-zinc-500 transition-colors">
                                <span className="absolute left-3 top-3 text-sm font-black text-zinc-400 font-mono">GH₵</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="20.00"
                                    max={balances.available}
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    placeholder="20.00"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none outline-none font-black text-sm font-mono text-zinc-800"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={requesting}
                                className="w-full flex items-center justify-center bg-zinc-900 text-white font-bold h-11 rounded-xl hover:bg-emerald-600 transition-all text-sm disabled:opacity-50"
                            >
                                {requesting ? "Submitting..." : "Withdraw Funds"}
                            </button>
                        </form>
                    ) : (
                        <div className="flex flex-col gap-1 text-xs text-zinc-500 bg-zinc-50 p-4 rounded-xl font-semibold border border-zinc-100">
                            <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                                <AlertCircle className="h-4 w-4 text-zinc-400 shrink-0" />
                                {balances.available > 0 ? "Below Min. Threshold (GH₵ 20.00)" : "No Cleared Balance"}
                            </div>
                            <p className="text-[11px] text-zinc-400">
                                Available: GH₵ {balances.available.toFixed(2)}. Minimum withdrawal requirement is GH₵ 20.00.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Middle Section: Payout Details & Withdrawal Requests with Progress Tracker */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Payout Settings Summary */}
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Payout Account</h3>
                        <Link href="/vendor/settings" className="text-xs font-bold text-[var(--brand-red)] hover:underline flex items-center gap-1">
                            <Settings className="h-3.5 w-3.5" /> Edit
                        </Link>
                    </div>
                    {payoutSettings.payoutMethod ? (
                        <div className="space-y-2.5 text-sm font-semibold text-zinc-700">
                            <p className="text-xs text-zinc-400 font-black uppercase tracking-wider">Method: {payoutSettings.payoutMethod}</p>
                            {payoutSettings.payoutMethod === "Bank Transfer" ? (
                                <>
                                    <p><strong className="text-zinc-900">Bank:</strong> {payoutSettings.bankName}</p>
                                    <p><strong className="text-zinc-900">Branch:</strong> {payoutSettings.branch}</p>
                                    <p><strong className="text-zinc-900">Account #:</strong> <span className="font-mono text-xs">{payoutSettings.accountNumber}</span></p>
                                    <p><strong className="text-zinc-900">Holder:</strong> {payoutSettings.accountName}</p>
                                </>
                            ) : (
                                <>
                                    <p><strong className="text-zinc-900">Network:</strong> {payoutSettings.momoNetwork}</p>
                                    <p><strong className="text-zinc-900">Number:</strong> <span className="font-mono text-xs">{payoutSettings.momoNumber}</span></p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <AlertCircle className="h-10 w-10 text-zinc-300 mx-auto mb-2" />
                            <p className="text-xs text-zinc-500 font-bold mb-4">No payout method configured.</p>
                            <Link
                                href="/vendor/settings"
                                className="inline-flex items-center justify-center bg-zinc-900 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-emerald-600 transition-all"
                            >
                                Setup Payout Details
                            </Link>
                        </div>
                    )}
                </div>

                {/* Withdrawal Request Status & Real-Time Progress Tracker */}
                <div className="lg:col-span-2 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-3">Withdrawal Requests & Live Status Tracker</h3>
                    <div className="space-y-4">
                        {requests.slice(0, 4).map((req) => {
                            const isCompleted = req.status === "completed";
                            const isPending = req.status === "pending";
                            return (
                                <div key={req.id} className="rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-zinc-900 text-base">GH₵ {req.amount.toFixed(2)}</span>
                                                <span className="text-xs text-zinc-500 font-medium">via {req.payoutMethod}</span>
                                            </div>
                                            <div className="text-[11px] text-zinc-400 font-mono">
                                                Request Ref: {req.id} · {new Date(req.createdAt).toLocaleString("en-GB")}
                                            </div>
                                        </div>
                                        <span className={`self-start sm:self-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                            isCompleted ? "bg-emerald-100 text-emerald-800" :
                                            isPending ? "bg-amber-100 text-amber-800" :
                                            "bg-red-100 text-red-800"
                                        }`}>
                                            {req.status}
                                        </span>
                                    </div>

                                    {/* 4-Step Progress Tracker */}
                                    <div className="grid grid-cols-4 gap-1 pt-2 border-t border-zinc-200/60">
                                        <div className="text-center space-y-1">
                                            <div className="h-1.5 w-full rounded-full bg-emerald-500"></div>
                                            <p className="text-[9px] font-black text-emerald-700 uppercase">1. Submitted</p>
                                        </div>
                                        <div className="text-center space-y-1">
                                            <div className={`h-1.5 w-full rounded-full ${isCompleted || isPending ? "bg-emerald-500" : "bg-zinc-200"}`}></div>
                                            <p className={`text-[9px] font-black uppercase ${isCompleted || isPending ? "text-emerald-700" : "text-zinc-400"}`}>2. In Review</p>
                                        </div>
                                        <div className="text-center space-y-1">
                                            <div className={`h-1.5 w-full rounded-full ${isCompleted ? "bg-emerald-500" : "bg-zinc-200"}`}></div>
                                            <p className={`text-[9px] font-black uppercase ${isCompleted ? "text-emerald-700" : "text-zinc-400"}`}>3. Dispatched</p>
                                        </div>
                                        <div className="text-center space-y-1">
                                            <div className={`h-1.5 w-full rounded-full ${isCompleted ? "bg-emerald-500" : "bg-zinc-200"}`}></div>
                                            <p className={`text-[9px] font-black uppercase ${isCompleted ? "text-emerald-700" : "text-zinc-400"}`}>4. Completed</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {requests.length === 0 && (
                            <div className="py-8 text-center text-xs text-zinc-400 font-bold">
                                No withdrawal requests recorded.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Expandable Transaction Logs Ledger */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Ledger Transaction History</h3>
                    <p className="text-xs text-zinc-500 font-semibold">Click any row to reveal itemized order breakdown</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] uppercase font-black tracking-widest text-zinc-400 border-b border-zinc-100">
                                <th className="pb-3">Transaction Date</th>
                                <th className="pb-3">Order / Ref ID</th>
                                <th className="pb-3">Type</th>
                                <th className="pb-3">Description</th>
                                <th className="pb-3">Amount</th>
                                <th className="pb-3">Fulfillment</th>
                                <th className="pb-3 text-right">Breakdown</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 text-sm font-semibold text-zinc-700">
                            {history.map((entry) => {
                                const isSale = entry.type === "sale";
                                const netAmount = entry.amount || 0;
                                const estGross = commissionRate < 100 ? netAmount / (1 - commissionRate / 100) : netAmount;
                                const estFee = estGross - netAmount;

                                return (
                                    <React.Fragment key={entry.id}>
                                        <tr
                                            onClick={() => setExpandedLedgerId(expandedLedgerId === entry.id ? null : entry.id)}
                                            className="hover:bg-zinc-50/80 cursor-pointer transition-colors"
                                        >
                                            <td className="py-4 text-xs text-zinc-500 font-medium">
                                                {new Date(entry.createdAt).toLocaleString("en-GB", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>
                                            <td className="py-4 font-mono text-xs text-zinc-600">
                                                {entry.orderId ? entry.orderId.slice(0, 15) : "Platform Ref"}
                                            </td>
                                            <td className="py-4">
                                                <span className={`inline-flex items-center gap-1 text-xs font-black uppercase ${
                                                    isSale ? "text-emerald-600" : "text-amber-600"
                                                }`}>
                                                    {isSale ? <ArrowDownLeft className="h-3.5 w-3.5 shrink-0" /> : <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />}
                                                    {entry.type}
                                                </span>
                                            </td>
                                            <td className="py-4 text-xs max-w-xs truncate">{entry.description || (isSale ? "Product Sale Credit" : "Withdrawal Payout")}</td>
                                            <td className={`py-4 font-black ${isSale ? "text-emerald-950" : "text-zinc-900"}`}>
                                                {isSale ? "+" : "-"}GH₵ {Math.abs(entry.amount).toFixed(2)}
                                            </td>
                                            <td className="py-4 text-xs">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                                    entry.status === "available" || entry.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                                }`}>
                                                    {entry.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <span className="text-xs font-bold text-zinc-400 hover:text-zinc-900 underline">
                                                    {expandedLedgerId === entry.id ? "Hide ▲" : "View Breakdown ▼"}
                                                </span>
                                            </td>
                                        </tr>

                                        {expandedLedgerId === entry.id && (
                                            <tr>
                                                <td colSpan={7} className="p-0">
                                                    <div className="bg-emerald-50/40 border-y border-emerald-100 p-4 space-y-2 text-xs text-zinc-700">
                                                        <div className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] flex justify-between">
                                                            <span>Transaction Financial Breakdown Details</span>
                                                            <span className="font-mono text-zinc-500">Ref: {entry.id}</span>
                                                        </div>
                                                        {isSale ? (
                                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 font-semibold">
                                                                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                                                                    <span className="text-zinc-400 text-[10px] uppercase font-bold block">Gross Sales Value</span>
                                                                    <span className="font-black text-zinc-900 text-sm">GH₵ {estGross.toFixed(2)}</span>
                                                                </div>
                                                                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                                                                    <span className="text-zinc-400 text-[10px] uppercase font-bold block">Cediman Platform Fee ({commissionRate}%)</span>
                                                                    <span className="font-black text-amber-700 text-sm">- GH₵ {estFee.toFixed(2)}</span>
                                                                </div>
                                                                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                                                                    <span className="text-zinc-400 text-[10px] uppercase font-bold block">Net Credited Revenue</span>
                                                                    <span className="font-black text-emerald-700 text-sm">GH₵ {netAmount.toFixed(2)}</span>
                                                                </div>
                                                                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                                                                    <span className="text-zinc-400 text-[10px] uppercase font-bold block">Escrow Clearance Status</span>
                                                                    <span className="font-black text-zinc-900 text-sm uppercase">{entry.status}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-white p-3 rounded-xl border border-zinc-200">
                                                                <p className="font-bold text-zinc-900">Withdrawal Disbursed: GH₵ {Math.abs(entry.amount).toFixed(2)}</p>
                                                                <p className="text-zinc-500 text-[11px] mt-1">{entry.description || "Payout request processed."}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-xs text-zinc-400 font-bold">
                                        No ledger transactions logged yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
