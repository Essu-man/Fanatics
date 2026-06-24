"use client";

import { useEffect, useState, useCallback } from "react";
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
    UserCircle
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
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"requests" | "balances" | "history">("requests");

    // Modal state for custom manual payout
    const [showManualModal, setShowManualModal] = useState(false);
    const [manualVendor, setManualVendor] = useState<Vendor | null>(null);
    const [manualAmount, setManualAmount] = useState("");
    const [manualMethod, setManualMethod] = useState("Bank Transfer");
    const [manualDetails, setManualDetails] = useState("");

    // Commission editing state
    const [editingCommissionVendorId, setEditingCommissionVendorId] = useState<string | null>(null);
    const [newCommissionRate, setNewCommissionRate] = useState<string>("");

    const handleUpdateCommission = async (vendorId: string) => {
        const rate = Number(newCommissionRate);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            showToast("Commission rate must be a number between 0 and 100", "error");
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
        const headers = ["Vendor Name", "Pending Balance (GHS)", "Available Balance (GHS)", "Commission Rate (%)", "Payout Method", "Account Details"];
        const rows = vendors.map(v => [
            v.businessName,
            v.balancePending.toFixed(2),
            v.balanceAvailable.toFixed(2),
            `${v.commissionRate}%`,
            v.payoutMethod || "Not set",
            v.payoutMethod === "Bank Transfer"
                ? `${v.bankName} - ${v.accountNumber}`
                : v.payoutMethod === "Mobile Money"
                    ? `${v.momoNetwork} - ${v.momoNumber}`
                    : ""
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
        const headers = ["Disbursement Date", "Vendor Name", "Amount (GHS)", "Log Details"];
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
        link.setAttribute("download", `disbursement_history_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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

    const handleProcessRequest = async (requestId: string, action: "approve" | "reject") => {
        if (action === "approve") {
            const req = requests.find((r) => r.id === requestId);
            const amountStr = req ? `GH₵ ${req.amount.toFixed(2)}` : "this amount";
            const vendorName = req ? req.businessName : "the vendor";
            const confirm = window.confirm(
                `Are you sure you want to approve and disburse ${amountStr} to ${vendorName}? This will trigger an automatic transfer via Paystack, deduct this amount from their available balance, and record it in the ledger.`
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
                showToast(action === "approve" ? "Payout request marked as completed" : "Payout request rejected", "success");
                loadData();
            } else {
                throw new Error(data.error || "Failed to process request");
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
            showToast("Invalid amount", "error");
            return;
        }

        if (amount > manualVendor.balanceAvailable) {
            showToast("Amount exceeds available vendor balance", "error");
            return;
        }

        const confirm = window.confirm(`Register manual payout of GH₵ ${amount.toFixed(2)} to ${manualVendor.businessName}?`);
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
                    payoutDetails: manualDetails.trim() || "Manual Payout Registry",
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

    const totalAvailable = vendors.reduce((sum, v) => sum + (v.balanceAvailable || 0), 0);
    const totalPending = vendors.reduce((sum, v) => sum + (v.balancePending || 0), 0);
    const totalPaidOut = history.reduce((sum, h) => sum + (h.amount || 0), 0);

    const pendingRequests = requests.filter((r) => r.status === "pending");

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-[var(--brand-red)]" />
                    <p className="mt-2 text-sm text-zinc-600 font-bold">Loading payouts registry…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-black text-zinc-900">Payouts & Balances</h1>
                <p className="mt-1 text-zinc-500 font-medium">Coordinate vendor settlement, record bank transfers, and audit virtual ledgers.</p>
            </div>

            {/* Admin Stats Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Available liability</span>
                        <div className="rounded-xl bg-emerald-500 p-2 text-white">
                            <DollarSign className="h-4 w-4" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-zinc-950">GH₵ {totalAvailable.toFixed(2)}</h2>
                        <p className="text-[10px] text-zinc-400 mt-1 font-semibold">Ready for payout clearance</p>
                    </div>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white p-6 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Pending Escrow</span>
                        <div className="rounded-xl bg-amber-500 p-2 text-white">
                            <Clock className="h-4 w-4" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-zinc-950">GH₵ {totalPending.toFixed(2)}</h2>
                        <p className="text-[10px] text-zinc-400 mt-1 font-semibold">Held pending client deliveries</p>
                    </div>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white p-6 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Disbursed Payouts</span>
                        <div className="rounded-xl bg-blue-500 p-2 text-white">
                            <ArrowUpRight className="h-4 w-4" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-zinc-950">GH₵ {totalPaidOut.toFixed(2)}</h2>
                        <p className="text-[10px] text-zinc-400 mt-1 font-semibold">All-time settled transfers</p>
                    </div>
                </div>
            </div>

            {/* Tabs and CSV Exports Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex gap-1 p-1 bg-zinc-100 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab("requests")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === "requests" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                    >
                        Payout Requests
                        {pendingRequests.length > 0 && (
                            <span className="ml-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black">
                                {pendingRequests.length} pending
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("balances")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === "balances" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                    >
                        Vendor Balances
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === "history" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                    >
                        Disbursement History
                    </button>
                </div>

                {activeTab === "balances" && (
                    <button
                        onClick={handleExportBalances}
                        className="px-5 py-2.5 bg-zinc-950 text-white rounded-xl font-bold text-xs hover:bg-zinc-800 transition-all shadow-sm shrink-0"
                    >
                        Export Balances (CSV)
                    </button>
                )}
                {activeTab === "history" && (
                    <button
                        onClick={handleExportHistory}
                        className="px-5 py-2.5 bg-zinc-950 text-white rounded-xl font-bold text-xs hover:bg-zinc-800 transition-all shadow-sm shrink-0"
                    >
                        Export History (CSV)
                    </button>
                )}
            </div>

            {/* List section */}
            <div className="bg-white border border-zinc-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                {activeTab === "requests" && (
                    <div className="p-6 space-y-4">
                        {pendingRequests.length === 0 ? (
                            <div className="py-16 text-center">
                                <CheckCircle2 className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
                                <p className="text-zinc-500 font-bold">All caught up! No pending payout requests.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {pendingRequests.map((req) => (
                                    <div
                                        key={req.id}
                                        className="p-6 rounded-3xl bg-zinc-50/50 border border-zinc-100 flex flex-col md:flex-row gap-6 justify-between items-start"
                                    >
                                        <div className="space-y-3 flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h3 className="text-lg font-black text-zinc-900">{req.businessName}</h3>
                                                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                                                    Pending Settlement
                                                </span>
                                            </div>
                                            <div className="text-xl font-black text-zinc-900 font-mono">
                                                Requested: GH₵ {req.amount.toFixed(2)}
                                            </div>

                                            {/* Account Details Box */}
                                            <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 space-y-2 text-sm text-zinc-700 font-semibold max-w-lg">
                                                <p className="text-xs uppercase font-black tracking-widest text-zinc-400">Recipient Account ({req.payoutMethod})</p>
                                                {req.payoutMethod === "Bank Transfer" ? (
                                                    <div className="grid grid-cols-2 gap-1.5">
                                                        <p><span className="text-zinc-400 font-bold">Bank:</span> {req.payoutDetails.bankName}</p>
                                                        <p><span className="text-zinc-400 font-bold">Branch:</span> {req.payoutDetails.branch}</p>
                                                        <p className="col-span-2"><span className="text-zinc-400 font-bold">Account #:</span> <span className="font-mono text-xs text-zinc-800 font-bold">{req.payoutDetails.accountNumber}</span></p>
                                                        <p className="col-span-2"><span className="text-zinc-400 font-bold">Holder:</span> {req.payoutDetails.accountName}</p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-1.5">
                                                        <p><span className="text-zinc-400 font-bold">Network:</span> {req.payoutDetails.momoNetwork}</p>
                                                        <p><span className="text-zinc-400 font-bold">Number:</span> <span className="font-mono text-xs text-zinc-800 font-bold">{req.payoutDetails.momoNumber}</span></p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-zinc-400 font-bold font-mono">
                                                Requested on: {new Date(req.createdAt).toLocaleString("en-GB")}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0 pt-4 md:pt-0">
                                            <button
                                                type="button"
                                                disabled={actionLoading}
                                                onClick={() => handleProcessRequest(req.id, "reject")}
                                                className="flex items-center justify-center gap-1.5 px-5 h-12 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all disabled:opacity-50 text-sm"
                                            >
                                                <XCircle className="h-4 w-4" /> Reject Request
                                            </button>
                                            <button
                                                type="button"
                                                disabled={actionLoading}
                                                onClick={() => handleProcessRequest(req.id, "approve")}
                                                className="flex items-center justify-center gap-1.5 px-5 h-12 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all disabled:opacity-50 text-sm"
                                            >
                                                <CheckCircle2 className="h-4 w-4" /> Approve & Disburse
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "balances" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Seller Store</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Commission Rate</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Pending Balance</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Available Balance</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Default Account</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 text-sm font-semibold text-zinc-700">
                                {vendors.map((v) => (
                                    <tr key={v.id} className="hover:bg-zinc-50/20">
                                        <td className="px-6 py-4 font-bold text-zinc-900">{v.businessName}</td>
                                        <td className="px-6 py-4">
                                            {editingCommissionVendorId === v.id ? (
                                                <div className="flex items-center gap-1.5 max-w-[170px]">
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
                                                        className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700 transition-colors"
                                                        title="Save Rate"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingCommissionVendorId(null);
                                                            setNewCommissionRate("");
                                                        }}
                                                        className="px-2 py-1 bg-zinc-200 text-zinc-700 rounded text-[10px] font-bold hover:bg-zinc-300 transition-colors"
                                                        title="Cancel"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-zinc-900">{v.commissionRate ?? 10}%</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingCommissionVendorId(v.id);
                                                            setNewCommissionRate(String(v.commissionRate ?? 10));
                                                        }}
                                                        className="text-xs text-[var(--brand-red)] hover:underline font-bold"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-amber-700 font-mono">GH₵ {v.balancePending.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-emerald-700 font-mono">GH₵ {v.balanceAvailable.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            {v.payoutMethod ? (
                                                <div className="text-xs text-zinc-500 font-medium">
                                                    {v.payoutMethod === "Bank Transfer"
                                                        ? `${v.bankName} - ${v.accountNumber?.slice(-4)}`
                                                        : `${v.momoNetwork} - ${v.momoNumber}`}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-zinc-400 font-bold italic">Not set</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                type="button"
                                                disabled={v.balanceAvailable <= 0}
                                                onClick={() => {
                                                    setManualVendor(v);
                                                    setManualMethod(v.payoutMethod || "Bank Transfer");
                                                    setManualDetails(
                                                        v.payoutMethod === "Bank Transfer"
                                                            ? `${v.bankName} (${v.accountNumber})`
                                                            : `${v.momoNetwork} (${v.momoNumber})`
                                                    );
                                                    setShowManualModal(true);
                                                }}
                                                className="px-4 py-2 text-xs font-black bg-zinc-950 text-white rounded-lg hover:bg-emerald-600 transition-all disabled:opacity-30"
                                            >
                                                Log Manual Payout
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === "history" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Disbursement Date</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Seller Store</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Disbursed Amount</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Log Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 text-sm font-semibold text-zinc-700">
                                {history.map((h) => {
                                    const seller = vendors.find((v) => v.id === h.vendorId);
                                    return (
                                        <tr key={h.id}>
                                            <td className="px-6 py-4 text-xs text-zinc-500 font-medium">
                                                {new Date(h.createdAt).toLocaleString("en-GB")}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-zinc-900">
                                                {seller?.businessName || "Unknown Seller"}
                                            </td>
                                            <td className="px-6 py-4 font-black text-emerald-700 font-mono">
                                                GH₵ {h.amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-zinc-500 truncate max-w-sm" title={h.description}>
                                                {h.description}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {history.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-400 font-bold">
                                            No past payouts recorded.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Quick manual payout modal registry */}
            {showManualModal && manualVendor && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
                        <div>
                            <h3 className="text-xl font-black text-zinc-950">Record Payout</h3>
                            <p className="text-xs text-zinc-500 font-semibold mt-1">Deduct cleared funds from {manualVendor.businessName} available balance.</p>
                        </div>
                        <form onSubmit={handleManualPayoutSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">Withdrawable Available</label>
                                <div className="text-lg font-black font-mono text-zinc-900">GH₵ {manualVendor.balanceAvailable.toFixed(2)}</div>
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
                                    placeholder="Enter amount to pay out"
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
                                    placeholder="e.g. Sent via GCB Bank ref #12345"
                                    className="w-full h-11 px-4 rounded-xl border border-zinc-200 outline-none focus:border-zinc-500 font-medium text-sm"
                                    required
                                />
                            </div>
                            <div className="flex gap-2.5 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowManualModal(false);
                                        setManualVendor(null);
                                        setManualAmount("");
                                        setManualDetails("");
                                    }}
                                    className="flex-1 h-11 rounded-xl border border-zinc-200 text-zinc-700 font-bold hover:bg-zinc-50 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 h-11 rounded-xl bg-zinc-950 text-white font-bold hover:bg-emerald-600 transition-all text-sm disabled:opacity-50"
                                >
                                    Record Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
