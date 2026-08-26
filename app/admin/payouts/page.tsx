"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { auth } from "@/lib/firebase";
import { useToast } from "@/app/components/ui/ToastContainer";
import {
    DollarSign,
    Clock,
    CheckCircle2,
    XCircle,
    Building2,
    Wallet,
    Calendar,
    ArrowUpRight,
    Loader2,
    UserCircle,
    Search,
    Download,
    Zap,
    Percent,
    ShieldCheck,
    AlertCircle,
    Edit3
} from "lucide-react";

interface Vendor {
    id: string;
    businessName: string;
    slug: string;
    status: string;
    balanceAvailable: number;
    balancePending: number;
    payoutMethod: string | null;
    bankName: string | null;
    branch: string | null;
    accountNumber: string | null;
    accountName: string | null;
    momoNetwork: string | null;
    momoNumber: string | null;
    commissionRate: number;
    adminProfit?: number;
    paystackRecipientCode?: string;
}

interface PayoutRequest {
    id: string;
    vendorId: string;
    businessName: string;
    amount: number;
    status: string;
    payoutMethod: string;
    payoutDetails: any;
    createdAt: string;
}

interface PayoutHistory {
    id: string;
    vendorId: string;
    amount: number;
    status: string;
    createdAt: string;
    description: string;
}

export default function AdminPayoutsPage() {
    const { showToast } = useToast();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [requests, setRequests] = useState<PayoutRequest[]>([]);
    const [history, setHistory] = useState<PayoutHistory[]>([]);
    const [overallAdminProfit, setOverallAdminProfit] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"requests" | "balances" | "history">("requests");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state for custom manual payout
    const [showManualModal, setShowManualModal] = useState(false);
    const [manualVendor, setManualVendor] = useState<Vendor | null>(null);
    const [manualAmount, setManualAmount] = useState("");
    const [manualMethod, setManualMethod] = useState("Bank Transfer");
    const [manualDetails, setManualDetails] = useState("");

    // Commission editing state
    const [editingCommissionVendorId, setEditingCommissionVendorId] = useState<string | null>(null);
    const [newCommissionRate, setNewCommissionRate] = useState<string>("");
    const [selectedVendorBreakdown, setSelectedVendorBreakdown] = useState<Vendor | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch("/api/admin/payouts", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                cache: "no-store",
            });
            const data = await res.json();
            if (data.success) {
                setVendors(data.vendors || []);
                setRequests(data.payoutRequests || []);
                setHistory(data.payoutsHistory || []);
                setOverallAdminProfit(data.overallAdminProfit || 0);
            } else {
                throw new Error(data.error || "Failed to load payouts data");
            }
        } catch (e: any) {
            showToast(e.message || "Failed to load admin payouts", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleUpdateCommission = async (vendorId: string) => {
        const rate = Number(newCommissionRate);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            showToast("Commission rate must be between 0% and 100%", "error");
            return;
        }

        setActionLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch("/api/admin/payouts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    vendorId,
                    action: "update-commission",
                    commissionRate: rate,
                }),
            });
            const data = await res.json();
            if (data.success) {
                showToast("Commission rate updated successfully", "success");
                setEditingCommissionVendorId(null);
                setNewCommissionRate("");
                loadData();
            } else {
                throw new Error(data.error || "Update failed");
            }
        } catch (e: any) {
            showToast(e.message || "Failed to update commission rate", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleExportBalances = () => {
        const headers = ["Vendor Store", "Pending Escrow (GHS)", "Cleared Balance (GHS)", "Commission Rate (%)", "Admin Profit (GHS)", "Payout Method", "Account Details"];
        const rows = vendors.map(v => [
            v.businessName,
            v.balancePending.toFixed(2),
            v.balanceAvailable.toFixed(2),
            `${v.commissionRate}%`,
            (v.adminProfit || 0).toFixed(2),
            v.payoutMethod || "Not configured",
            v.payoutMethod === "Bank Transfer"
                ? `${v.bankName || "Bank"} - ${v.accountNumber || ""}`
                : v.payoutMethod === "Mobile Money"
                    ? `${v.momoNetwork || "MoMo"} - ${v.momoNumber || ""}`
                    : "Not configured"
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `vendor_balances_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportHistory = () => {
        const headers = ["Date & Time", "Vendor Store", "Disbursed Amount (GHS)", "Transaction Reference"];
        const rows = history.map(h => {
            const seller = vendors.find(v => v.id === h.vendorId);
            return [
                new Date(h.createdAt).toLocaleString("en-GB"),
                seller?.businessName || "Unknown Seller",
                h.amount.toFixed(2),
                h.description
            ];
        });

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `payout_history_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleProcessRequest = async (requestId: string, action: "approve" | "reject") => {
        if (action === "approve") {
            const req = requests.find((r) => r.id === requestId);
            const amountStr = req ? `GH₵ ${req.amount.toFixed(2)}` : "this amount";
            const vendorName = req ? req.businessName : "the vendor";
            const confirm = window.confirm(
                `Approve & Disburse ${amountStr} to ${vendorName}?\n\nThis will initiate an automated Paystack transfer to their registered account and deduct the funds from their cleared balance.`
            );
            if (!confirm) return;
        }

        setActionLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch("/api/admin/payouts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ requestId, action }),
            });
            const data = await res.json();
            if (data.success) {
                showToast(action === "approve" ? "Payout approved & disbursed successfully" : "Payout request declined", "success");
                loadData();
            } else {
                throw new Error(data.error || "Failed to process payout request");
            }
        } catch (e: any) {
            showToast(e.message || "Action failed", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleManualPayoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualVendor || !manualAmount) return;

        const amount = Number(manualAmount);
        if (isNaN(amount) || amount <= 0) {
            showToast("Invalid payout amount", "error");
            return;
        }

        if (amount > manualVendor.balanceAvailable) {
            showToast("Amount exceeds available cleared balance", "error");
            return;
        }

        const confirm = window.confirm(`Record manual payout of GH₵ ${amount.toFixed(2)} to ${manualVendor.businessName}?`);
        if (!confirm) return;

        setActionLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch("/api/admin/payouts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    vendorId: manualVendor.id,
                    amount,
                    payoutMethod: manualMethod,
                    payoutDetails: manualDetails.trim() || "Manual Transfer Log",
                }),
            });
            const data = await res.json();
            if (data.success) {
                showToast("Manual payout logged successfully", "success");
                setShowManualModal(false);
                setManualVendor(null);
                setManualAmount("");
                setManualDetails("");
                loadData();
            } else {
                throw new Error(data.error || "Registration failed");
            }
        } catch (e: any) {
            showToast(e.message || "Manual payout registry failed", "error");
        } finally {
            setActionLoading(false);
        }
    };

    // Filtered data based on search query
    const filteredVendors = useMemo(() => {
        if (!searchQuery.trim()) return vendors;
        const q = searchQuery.toLowerCase().trim();
        return vendors.filter(
            v => v.businessName.toLowerCase().includes(q) || v.slug.toLowerCase().includes(q)
        );
    }, [vendors, searchQuery]);

    const filteredRequests = useMemo(() => {
        const pending = requests.filter(r => r.status === "pending");
        if (!searchQuery.trim()) return pending;
        const q = searchQuery.toLowerCase().trim();
        return pending.filter(
            r => r.businessName.toLowerCase().includes(q) || r.payoutMethod.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
        );
    }, [requests, searchQuery]);

    const filteredHistory = useMemo(() => {
        if (!searchQuery.trim()) return history;
        const q = searchQuery.toLowerCase().trim();
        return history.filter(h => {
            const seller = vendors.find(v => v.id === h.vendorId);
            const name = seller?.businessName || "";
            return name.toLowerCase().includes(q) || h.description.toLowerCase().includes(q) || h.id.toLowerCase().includes(q);
        });
    }, [history, vendors, searchQuery]);

    const totalAvailable = vendors.reduce((sum, v) => sum + (v.balanceAvailable || 0), 0);
    const totalPending = vendors.reduce((sum, v) => sum + (v.balancePending || 0), 0);
    const totalPaidOut = history.reduce((sum, h) => sum + (h.amount || 0), 0);
    const pendingCount = requests.filter((r) => r.status === "pending").length;

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-[var(--brand-red)]" />
                    <p className="mt-3 text-sm text-zinc-600 font-bold">Loading payouts dashboard…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">Payouts & Balances</h1>
                    <p className="mt-1 text-sm text-zinc-500 font-medium">Manage seller withdrawals, platform commission earnings, and automated disbursements.</p>
                </div>

                {/* Instant Search Bar */}
                <div className="relative min-w-[260px]">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search store name or ref..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-zinc-200 text-xs font-semibold text-zinc-800 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/10 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Admin Stats Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-3xl border border-purple-100 bg-purple-50/40 p-5 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">Platform Commission</span>
                        <div className="rounded-xl bg-purple-600 p-2 text-white shadow-sm">
                            <Percent className="h-4 w-4" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-purple-950 font-mono">GH₵ {overallAdminProfit.toFixed(2)}</h2>
                        <p className="text-[11px] text-purple-700 mt-0.5 font-semibold">Total Cediman fee revenue earned</p>
                    </div>
                </div>

                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/40 p-5 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Cleared Available Liability</span>
                        <div className="rounded-xl bg-emerald-600 p-2 text-white shadow-sm">
                            <DollarSign className="h-4 w-4" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-emerald-950 font-mono">GH₵ {totalAvailable.toFixed(2)}</h2>
                        <p className="text-[11px] text-emerald-700 mt-0.5 font-semibold">Funds cleared ready for payout</p>
                    </div>
                </div>

                <div className="rounded-3xl border border-amber-100 bg-amber-50/40 p-5 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Pending Order Escrow</span>
                        <div className="rounded-xl bg-amber-600 p-2 text-white shadow-sm">
                            <Clock className="h-4 w-4" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-amber-950 font-mono">GH₵ {totalPending.toFixed(2)}</h2>
                        <p className="text-[11px] text-amber-700 mt-0.5 font-semibold">Held until client delivery confirmation</p>
                    </div>
                </div>

                <div className="rounded-3xl border border-blue-100 bg-blue-50/40 p-5 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Total Disbursed Payouts</span>
                        <div className="rounded-xl bg-blue-600 p-2 text-white shadow-sm">
                            <ArrowUpRight className="h-4 w-4" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-blue-950 font-mono">GH₵ {totalPaidOut.toFixed(2)}</h2>
                        <p className="text-[11px] text-blue-700 mt-0.5 font-semibold">All-time settled seller withdrawals</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 p-2 rounded-2xl border border-zinc-200/80">
                <div className="flex gap-1.5 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("requests")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                            activeTab === "requests"
                                ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/60"
                                : "text-zinc-500 hover:text-zinc-900"
                        }`}
                    >
                        Payout Requests
                        {pendingCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
                                {pendingCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab("balances")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                            activeTab === "balances"
                                ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/60"
                                : "text-zinc-500 hover:text-zinc-900"
                        }`}
                    >
                        Vendor Accounts & Balances ({vendors.length})
                    </button>

                    <button
                        onClick={() => setActiveTab("history")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                            activeTab === "history"
                                ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/60"
                                : "text-zinc-500 hover:text-zinc-900"
                        }`}
                    >
                        Disbursement History ({history.length})
                    </button>
                </div>

                {/* CSV Export Actions */}
                {activeTab === "balances" && (
                    <button
                        onClick={handleExportBalances}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-xl font-bold text-xs hover:bg-emerald-600 transition-all shadow-sm shrink-0"
                    >
                        <Download className="h-3.5 w-3.5" /> Export Balances CSV
                    </button>
                )}
                {activeTab === "history" && (
                    <button
                        onClick={handleExportHistory}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-xl font-bold text-xs hover:bg-emerald-600 transition-all shadow-sm shrink-0"
                    >
                        <Download className="h-3.5 w-3.5" /> Export History CSV
                    </button>
                )}
            </div>

            {/* TAB CONTENT SECTIONS */}

            {/* 1. PAYOUT REQUESTS TAB */}
            {activeTab === "requests" && (
                <div className="space-y-4">
                    {filteredRequests.length === 0 ? (
                        <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                            <h3 className="text-base font-black text-zinc-900">All caught up!</h3>
                            <p className="text-xs text-zinc-500 font-semibold mt-1">There are no pending payout requests requiring settlement.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredRequests.map((req) => {
                                return (
                                    <div
                                        key={req.id}
                                        className="rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-50/40 via-white to-white p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start"
                                    >
                                        <div className="space-y-3 flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <h3 className="text-lg font-black text-zinc-950">{req.businessName}</h3>
                                                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                                                    Pending Approval
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                                    <Zap className="h-3 w-3 text-emerald-600 shrink-0" /> Paystack Auto Disburse
                                                </span>
                                            </div>

                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Requested Withdrawal:</span>
                                                <span className="text-2xl font-black text-emerald-950 font-mono">
                                                    GH₵ {req.amount.toFixed(2)}
                                                </span>
                                            </div>

                                            {/* Structured Recipient Details Card */}
                                            <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-2 text-xs text-zinc-700 max-w-xl">
                                                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                                                    <span className="font-black text-zinc-900 uppercase tracking-wider text-[10px]">
                                                        Destination Account ({req.payoutMethod})
                                                    </span>
                                                    <span className="text-[10px] text-zinc-400 font-mono">Ref: {req.id}</span>
                                                </div>

                                                {req.payoutMethod === "Bank Transfer" ? (
                                                    <div className="grid grid-cols-2 gap-2 pt-1 font-semibold">
                                                        <div><span className="text-zinc-400">Bank:</span> <strong className="text-zinc-900">{req.payoutDetails?.bankName || "N/A"}</strong></div>
                                                        <div><span className="text-zinc-400">Branch:</span> <strong className="text-zinc-900">{req.payoutDetails?.branch || "N/A"}</strong></div>
                                                        <div className="col-span-2"><span className="text-zinc-400">Account Number:</span> <span className="font-mono text-zinc-900 font-black text-xs">{req.payoutDetails?.accountNumber || "N/A"}</span></div>
                                                        <div className="col-span-2"><span className="text-zinc-400">Account Holder:</span> <strong className="text-zinc-900">{req.payoutDetails?.accountName || "N/A"}</strong></div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-2 pt-1 font-semibold">
                                                        <div><span className="text-zinc-400">MoMo Network:</span> <strong className="text-zinc-900">{req.payoutDetails?.momoNetwork || "N/A"}</strong></div>
                                                        <div><span className="text-zinc-400">Phone Number:</span> <span className="font-mono text-zinc-900 font-black text-xs">{req.payoutDetails?.momoNumber || "N/A"}</span></div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-[11px] text-zinc-400 font-medium">
                                                Submitted on {new Date(req.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                                            <button
                                                type="button"
                                                disabled={actionLoading}
                                                onClick={() => handleProcessRequest(req.id, "reject")}
                                                className="inline-flex items-center justify-center gap-1.5 px-4 h-11 border border-red-200 text-red-700 rounded-xl font-bold hover:bg-red-50 transition-all disabled:opacity-50 text-xs"
                                            >
                                                <XCircle className="h-4 w-4" /> Reject
                                            </button>
                                            <button
                                                type="button"
                                                disabled={actionLoading}
                                                onClick={() => handleProcessRequest(req.id, "approve")}
                                                className="inline-flex items-center justify-center gap-1.5 px-6 h-11 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md shadow-emerald-100 transition-all disabled:opacity-50 text-xs"
                                            >
                                                {actionLoading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4" />
                                                )}
                                                Approve & Disburse
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* 2. VENDOR BALANCES TAB */}
            {activeTab === "balances" && (
                <div className="rounded-3xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-200/80">
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-500">Seller Store</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-500">Commission Rate</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-500">Platform Profit</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-500">Pending Escrow</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-500">Available Balance</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-500">Account Details</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-xs font-semibold text-zinc-700">
                                {filteredVendors.map((v) => (
                                    <tr key={v.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4 font-black text-zinc-900 text-sm">
                                            {v.businessName}
                                            <div className="text-[11px] text-zinc-400 font-mono font-normal">/store/{v.slug}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingCommissionVendorId === v.id ? (
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={newCommissionRate}
                                                        onChange={(e) => setNewCommissionRate(e.target.value)}
                                                        className="w-14 h-8 px-2 border border-zinc-300 rounded-lg font-mono font-bold text-xs outline-none focus:border-zinc-500"
                                                    />
                                                    <span className="text-zinc-500 text-xs font-bold">%</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateCommission(v.id)}
                                                        className="px-2 py-1 bg-emerald-600 text-white rounded-md text-[10px] font-bold hover:bg-emerald-700 transition-colors"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingCommissionVendorId(null);
                                                            setNewCommissionRate("");
                                                        }}
                                                        className="px-2 py-1 bg-zinc-200 text-zinc-700 rounded-md text-[10px] font-bold hover:bg-zinc-300 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-md font-mono">{v.commissionRate ?? 10}%</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingCommissionVendorId(v.id);
                                                            setNewCommissionRate(String(v.commissionRate ?? 10));
                                                        }}
                                                        className="text-[11px] text-[var(--brand-red)] hover:underline font-bold flex items-center gap-0.5"
                                                    >
                                                        <Edit3 className="h-3 w-3" /> Edit
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-purple-700 font-black font-mono">GH₵ {(v.adminProfit || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-amber-700 font-black font-mono">GH₵ {v.balancePending.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-emerald-700 font-black font-mono text-sm">GH₵ {v.balanceAvailable.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            {v.payoutMethod ? (
                                                <div className="text-xs text-zinc-600">
                                                    <div className="font-bold text-zinc-900">{v.payoutMethod}</div>
                                                    <div className="font-mono text-[11px] text-zinc-500">
                                                        {v.payoutMethod === "Bank Transfer"
                                                            ? `${v.bankName || "Bank"} (${v.accountNumber || ""})`
                                                            : `${v.momoNetwork || "MoMo"} (${v.momoNumber || ""})`}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-zinc-400 font-semibold italic">Not configured</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedVendorBreakdown(v)}
                                                    className="px-3 py-2 text-xs font-bold border border-zinc-200 text-zinc-700 bg-white rounded-xl hover:bg-zinc-100 transition-all"
                                                >
                                                    View Breakdown
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={v.balanceAvailable <= 0}
                                                    onClick={() => {
                                                        setManualVendor(v);
                                                        setManualMethod(v.payoutMethod || "Bank Transfer");
                                                        setManualDetails(
                                                            v.payoutMethod === "Bank Transfer"
                                                                ? `${v.bankName || "Bank"} (${v.accountNumber || ""})`
                                                                : `${v.momoNetwork || "MoMo"} (${v.momoNumber || ""})`
                                                        );
                                                        setShowManualModal(true);
                                                    }}
                                                    className="px-3.5 py-2 text-xs font-black bg-zinc-900 text-white rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-30"
                                                >
                                                    Log Manual Payout
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredVendors.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-xs text-zinc-400 font-bold">
                                            No vendors matched search query.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 3. DISBURSEMENT HISTORY TAB */}
            {activeTab === "history" && (
                <div className="rounded-3xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-200/80">
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-500">Disbursement Date</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-500">Seller Store</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-500">Disbursed Amount</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-500">Reference / Log Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-xs font-semibold text-zinc-700">
                                {filteredHistory.map((h) => {
                                    const seller = vendors.find((v) => v.id === h.vendorId);
                                    return (
                                        <tr key={h.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-4 text-xs text-zinc-500 font-medium">
                                                {new Date(h.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                                            </td>
                                            <td className="px-6 py-4 font-black text-zinc-900 text-sm">
                                                {seller?.businessName || "Unknown Seller"}
                                            </td>
                                            <td className="px-6 py-4 font-black text-emerald-700 font-mono text-sm">
                                                GH₵ {h.amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-zinc-600 truncate max-w-md" title={h.description}>
                                                {h.description}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredHistory.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-xs text-zinc-400 font-bold">
                                            No disbursement history recorded.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Quick manual payout modal registry */}
            {showManualModal && manualVendor && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
                        <div>
                            <h3 className="text-xl font-black text-zinc-950">Record Manual Payout</h3>
                            <p className="text-xs text-zinc-500 font-semibold mt-1">
                                Deduct offline transfer from <strong>{manualVendor.businessName}</strong> available balance.
                            </p>
                        </div>
                        <form onSubmit={handleManualPayoutSubmit} className="space-y-4">
                            <div className="space-y-1 bg-zinc-50 p-3 rounded-2xl border border-zinc-200/80">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Cleared Withdrawable Balance</span>
                                <div className="text-lg font-black font-mono text-emerald-800">GH₵ {manualVendor.balanceAvailable.toFixed(2)}</div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-700">Amount (GH₵)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={manualVendor.balanceAvailable}
                                    value={manualAmount}
                                    onChange={(e) => setManualAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full h-11 px-4 rounded-xl border border-zinc-200 outline-none focus:border-zinc-500 font-bold font-mono text-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-700">Payment Channel</label>
                                <select
                                    value={manualMethod}
                                    onChange={(e) => setManualMethod(e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-zinc-200 outline-none font-bold text-sm bg-white"
                                >
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Mobile Money">Mobile Money (MoMo)</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-700">Payment Reference / Details</label>
                                <input
                                    value={manualDetails}
                                    onChange={(e) => setManualDetails(e.target.value)}
                                    placeholder="e.g. Offline bank transfer ref #12345"
                                    className="w-full h-11 px-4 rounded-xl border border-zinc-200 outline-none focus:border-zinc-500 font-medium text-sm"
                                    required
                                />
                            </div>
                            <div className="flex gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowManualModal(false);
                                        setManualVendor(null);
                                        setManualAmount("");
                                        setManualDetails("");
                                    }}
                                    className="flex-1 h-11 rounded-xl border border-zinc-200 text-zinc-700 font-bold hover:bg-zinc-50 transition-all text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 h-11 rounded-xl bg-zinc-950 text-white font-bold hover:bg-emerald-600 transition-all text-xs disabled:opacity-50"
                                >
                                    {actionLoading ? "Processing..." : "Record Payment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Vendor Calculation Breakdown Modal */}
            {selectedVendorBreakdown && (() => {
                const v = selectedVendorBreakdown;
                const vHistory = history.filter(h => h.vendorId === v.id);
                const vPaidOut = vHistory.reduce((sum, h) => sum + (h.amount || 0), 0);
                const rate = v.commissionRate ?? 10;
                const netEarned = v.balanceAvailable + vPaidOut;
                const grossSales = rate < 100 ? netEarned / (1 - rate / 100) : netEarned;
                const adminFee = grossSales - netEarned;

                return (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                                <div>
                                    <h3 className="text-xl font-black text-zinc-950">{v.businessName}</h3>
                                    <p className="text-xs text-zinc-500 font-semibold">Store Financial Calculation Breakdown</p>
                                </div>
                                <button
                                    onClick={() => setSelectedVendorBreakdown(null)}
                                    className="px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100"
                                >
                                    Close
                                </button>
                            </div>

                            {/* Formula Banner */}
                            <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-4 text-xs text-purple-950 space-y-1 font-medium">
                                <strong>Platform Formula:</strong>
                                <p className="font-mono text-[11px] text-purple-800">
                                    [Gross Sales (₵{grossSales.toFixed(2)})] - [Cediman Fee ({rate}% = ₵{adminFee.toFixed(2)})] = Net Revenue (₵{netEarned.toFixed(2)})
                                </p>
                            </div>

                            {/* Itemized Calculation Cards */}
                            <div className="space-y-2.5 text-xs font-semibold">
                                <div className="flex justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100">
                                    <span className="text-zinc-600">Estimated Gross Product Sales</span>
                                    <span className="font-black text-zinc-900 font-mono">GH₵ {grossSales.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100">
                                    <span className="text-purple-900">Cediman Platform Commission ({rate}%)</span>
                                    <span className="font-black text-purple-900 font-mono">- GH₵ {adminFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                                    <span className="text-emerald-950">Net Revenue Earned</span>
                                    <span className="font-black text-emerald-900 font-mono">GH₵ {netEarned.toFixed(2)}</span>
                                </div>
                                {vPaidOut > 0 && (
                                    <div className="flex justify-between p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
                                        <span className="text-blue-900">Total Disbursed Payouts</span>
                                        <span className="font-black text-blue-900 font-mono">- GH₵ {vPaidOut.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100">
                                    <span className="text-amber-900">Pending Order Escrow</span>
                                    <span className="font-black text-amber-900 font-mono">GH₵ {v.balancePending.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Current Available Balance */}
                            <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-4 flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-black uppercase text-emerald-900">Cleared Available Balance</span>
                                    <p className="text-[11px] text-emerald-700">Funds available for immediate withdrawal request</p>
                                </div>
                                <span className="text-2xl font-black text-emerald-950 font-mono">
                                    GH₵ {v.balanceAvailable.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
