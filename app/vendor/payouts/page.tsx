"use client";

import { useEffect, useState, useCallback } from "react";
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

export default function VendorPayoutsPage() {
    const { showToast } = useToast();
    const [balances, setBalances] = useState<Balances>({ available: 0, pending: 0 });
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

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black text-zinc-900">Payouts & Balances</h1>
                <p className="mt-1 text-sm text-zinc-600 font-semibold">
                    Monitor your earnings in escrow, transfer requests, and banking details.
                </p>
            </div>

            {/* Balances Layout */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Available Balance */}
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Available Balance</span>
                        <div className="rounded-xl bg-emerald-500 p-2 text-white">
                            <DollarSign className="h-5 w-5" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-emerald-950">GH₵ {balances.available.toFixed(2)}</h2>
                        <p className="text-xs text-emerald-700 mt-1 font-semibold">Cleared and withdrawable</p>
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
                    <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider mb-2">Request Payout</h3>
                    {balances.available > 0 ? (
                        <form onSubmit={handleRequestPayout} className="space-y-3">
                            <div className="relative rounded-xl border border-zinc-200 focus-within:border-zinc-500 transition-colors">
                                <span className="absolute left-3 top-3 text-sm font-black text-zinc-400 font-mono">GH₵</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={balances.available}
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    placeholder="0.00"
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
                        <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-50 p-4 rounded-xl font-semibold border border-zinc-100">
                            <AlertCircle className="h-5 w-5 shrink-0 text-zinc-400" />
                            No cleared funds available. Earnings move from pending once clients confirm delivery.
                        </div>
                    )}
                </div>
            </div>

            {/* Middle Section: Payout Details & Withdrawal Requests */}
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

                {/* Withdrawal Request Status */}
                <div className="lg:col-span-2 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-3">Withdrawal Requests</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] uppercase font-black tracking-widest text-zinc-400 border-b border-zinc-100">
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3">Amount</th>
                                    <th className="pb-3">Method</th>
                                    <th className="pb-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 text-sm font-semibold text-zinc-700">
                                {requests.slice(0, 5).map((req) => (
                                    <tr key={req.id}>
                                        <td className="py-3 font-medium text-xs text-zinc-500">
                                            {new Date(req.createdAt).toLocaleDateString("en-GB")}
                                        </td>
                                        <td className="py-3 font-black text-zinc-900">GH₵ {req.amount.toFixed(2)}</td>
                                        <td className="py-3 text-xs">{req.payoutMethod}</td>
                                        <td className="py-3">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                req.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                                                req.status === "pending" ? "bg-amber-100 text-amber-800" :
                                                "bg-zinc-100 text-zinc-700"
                                            }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {requests.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-xs text-zinc-400 font-bold">
                                            No withdrawal requests recorded.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Transaction Logs Ledger */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-3">Ledger Transaction History</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] uppercase font-black tracking-widest text-zinc-400 border-b border-zinc-100">
                                <th className="pb-3">Transaction Date</th>
                                <th className="pb-3">Order ID / Ref</th>
                                <th className="pb-3">Type</th>
                                <th className="pb-3">Description</th>
                                <th className="pb-3">Amount</th>
                                <th className="pb-3">Fulfillment Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 text-sm font-semibold text-zinc-700">
                            {history.map((entry) => {
                                const isSale = entry.type === "sale";
                                return (
                                    <tr key={entry.id} className="hover:bg-zinc-50/20">
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
                                        <td className="py-4 text-xs font-medium text-zinc-500 max-w-xs truncate" title={entry.description}>
                                            {entry.description}
                                        </td>
                                        <td className={`py-4 font-black ${isSale ? "text-emerald-700" : "text-amber-800"}`}>
                                            {isSale ? "+" : ""}GH₵ {entry.amount.toFixed(2)}
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                entry.status === "available" || entry.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                                                entry.status === "pending" ? "bg-amber-100 text-amber-800" :
                                                "bg-zinc-100 text-zinc-700"
                                            }`}>
                                                {entry.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-sm text-zinc-400 font-bold">
                                        No transactions recorded in your ledger account yet.
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
