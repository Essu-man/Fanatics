"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/app/components/ui/ToastContainer";
import type { Vendor } from "@/lib/firestore";
import VendorApplicationDetail, {
    type VendorApplicationRecord,
} from "@/app/components/admin/VendorApplicationDetail";
import {
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Mail,
    Phone,
    Info,
    Plus,
    Eye,
    Trash2,
    UserX,
} from "lucide-react";

export default function AdminVendorsPage() {
    const [activeTab, setActiveTab] = useState<"vendors" | "applications">("vendors");
    const [applicationFilter, setApplicationFilter] = useState<
        "all" | "pending" | "approved" | "rejected"
    >("all");
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [applications, setApplications] = useState<VendorApplicationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<VendorApplicationRecord | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Form state for manual add
    const [slug, setSlug] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [ownerUserId, setOwnerUserId] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<"pending" | "active" | "suspended">("pending");
    const [submitting, setSubmitting] = useState(false);
    
    const { showToast } = useToast();

    const loadData = async () => {
        setLoading(true);
        try {
            // Load Vendors
            const vRes = await fetch("/api/admin/vendors", { cache: "no-store" });
            const vData = await vRes.json();
            if (vData.success) setVendors(vData.vendors || []);

            // Load Applications
            const aRes = await fetch("/api/admin/vendors/applications", { cache: "no-store" });
            const aData = await aRes.json();
            if (aData.success) setApplications(aData.applications || []);

        } catch (err) {
            showToast("Failed to load data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!slug.trim() || !businessName.trim() || !ownerUserId.trim()) {
            showToast("Slug, business name, and owner user ID are required", "error");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/vendors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
                    businessName: businessName.trim(),
                    ownerUserId: ownerUserId.trim(),
                    description: description.trim() || undefined,
                    status,
                    linkUserProfile: true,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || "Create failed");
            showToast("Vendor created and user linked", "success");
            setSlug("");
            setBusinessName("");
            setOwnerUserId("");
            setDescription("");
            setShowAddForm(false);
            loadData();
        } catch (err: any) {
            showToast(err.message || "Create failed", "error");
        } finally {
            setSubmitting(false);
        }
    }

    const handleApplicationAction = async (id: string, action: "approve" | "reject") => {
        let rejectionReason: string | undefined;

        if (action === "reject") {
            const input = window.prompt(
                "Please enter a reason for rejecting this application.\nThis will be sent to the applicant in an email:",
                ""
            );
            // Cancelled or empty reason — abort
            if (input === null || input.trim() === "") {
                showToast("Rejection cancelled — a reason is required.", "error");
                return;
            }
            rejectionReason = input.trim();
        }

        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/vendors/applications/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: action === "approve" ? "approved" : "rejected",
                    ...(rejectionReason ? { reason: rejectionReason } : {}),
                }),
            });
            const data = await res.json();
            if (data.success) {
                showToast(
                    action === "approve"
                        ? "Application approved — vendor is now active"
                        : "Application rejected — applicant notified by email",
                    "success"
                );
                setSelectedApplication(null);
                if (action === "approve") setActiveTab("vendors");
                loadData();
            } else {
                showToast(data.error || "Failed to update application", "error");
            }
        } catch {
            showToast("An error occurred", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteVendor = async (id: string, name: string) => {
        const confirmDelete = window.confirm(
            `WARNING: Are you sure you want to permanently delete "${name}" and all their products?\n\nThis will revert their seller user profile to "customer". This action cannot be undone.`
        );
        if (!confirmDelete) return;

        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/vendors/${id}`, {
                method: "DELETE",
            });
            const data = await res.ok ? await res.json() : null;
            if (data && data.success) {
                showToast(`Successfully deleted vendor "${name}" and their store`, "success");
                loadData();
            } else {
                showToast(data?.error || "Failed to delete vendor", "error");
            }
        } catch (err: any) {
            showToast(err.message || "Failed to delete vendor", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handlePurgeVendor = async (id: string, name: string) => {
        const confirm1 = window.confirm(
            `CRITICAL WARNING: You are about to completely PURGE "${name}" from the database.\n\nThis will permanently delete:\n- The vendor & storefront document\n- All products associated with this store\n- All ledger records and vendor application history\n- The owner user profile document\n- The owner's actual Firebase Authentication account (they will not be able to log in)\n\nThis is a destructive operation that CANNOT BE UNDONE. Are you sure?`
        );
        if (!confirm1) return;

        const typedConfirm = window.prompt(
            `Please type "${name}" to confirm the complete purge of this vendor and user:`
        );
        if (typedConfirm !== name) {
            showToast("Purge cancelled — confirmation name did not match.", "error");
            return;
        }

        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/vendors/${id}?purge=true`, {
                method: "DELETE",
            });
            const data = await res.ok ? await res.json() : null;
            if (data && data.success) {
                showToast(`Successfully purged vendor "${name}" and all associated data from the database.`, "success");
                loadData();
            } else {
                showToast(data?.error || "Failed to purge vendor", "error");
            }
        } catch (err: any) {
            showToast(err.message || "Failed to purge vendor", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteApplication = async (id: string, businessName: string) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to permanently delete the vendor application for "${businessName}"?`
        );
        if (!confirmDelete) return;

        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/vendors/applications/${id}`, {
                method: "DELETE",
            });
            const data = await res.ok ? await res.json() : null;
            if (data && data.success) {
                showToast(`Successfully deleted vendor application for "${businessName}"`, "success");
                loadData();
            } else {
                showToast(data?.error || "Failed to delete application", "error");
            }
        } catch (err: any) {
            showToast(err.message || "Failed to delete application", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const activeVendors = vendors.filter((v) => v.status === "active");
    const pendingCount = applications.filter((a) => a.status === "pending").length;
    const approvedCount = applications.filter((a) => a.status === "approved").length;
    const rejectedCount = applications.filter((a) => a.status === "rejected").length;
    const filteredApplications =
        applicationFilter === "all"
            ? applications
            : applications.filter((a) => a.status === applicationFilter);

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900">Marketplace Sellers</h1>
                    <p className="mt-1 text-zinc-500 font-medium">Manage vendors and review new applications</p>
                </div>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-600 transition-all"
                >
                    <Plus className="h-4 w-4" />
                    Manual Add Vendor
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-zinc-100 rounded-2xl w-fit">
                <button 
                    onClick={() => setActiveTab("vendors")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === "vendors" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                >
                    <Users className="h-4 w-4" />
                    Active Vendors
                    <span className="ml-1 px-2 py-0.5 rounded-md bg-zinc-100 text-[10px]">{activeVendors.length}</span>
                </button>
                <button 
                    onClick={() => setActiveTab("applications")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === "applications" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                >
                    <Clock className="h-4 w-4" />
                    Applications
                    <span className="ml-1 px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-700 text-[10px] font-black">
                        {applications.length}
                    </span>
                    {pendingCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black">
                            {pendingCount} pending
                        </span>
                    )}
                </button>
            </div>

            {/* Add Form Overlay/Section */}
            {showAddForm && (
                <div className="bg-white border-2 border-zinc-100 rounded-[2rem] p-8 shadow-xl animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-xl font-black text-zinc-900 mb-6">Add New Vendor</h2>
                    <form onSubmit={handleCreate} className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-700">Business Name</label>
                            <input
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-700">Slug (URL)</label>
                            <input
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="e.g. kicks-and-kits"
                                className="w-full h-12 px-4 rounded-xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-zinc-700">Owner Firebase UID</label>
                            <input
                                value={ownerUserId}
                                onChange={(e) => setOwnerUserId(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 outline-none transition-all font-mono"
                                required
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-zinc-700">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                className="w-full p-4 rounded-xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as any)}
                                    className="w-full h-12 px-4 rounded-xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 outline-none transition-all appearance-none"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                            <div className="pt-8">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="h-12 px-8 bg-zinc-900 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50"
                                >
                                    {submitting ? "Saving..." : "Create Vendor"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* List Section */}
            <div className="bg-white border border-zinc-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                {activeTab === "vendors" ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Business</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Store Link</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Status</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Owner</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {activeVendors.map((v) => (
                                    <tr key={v.id} className="group hover:bg-zinc-50/30 transition-all">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center font-bold text-zinc-400">
                                                    {v.businessName[0]}
                                                </div>
                                                <span className="font-bold text-zinc-900">{v.businessName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <a 
                                                href={`/store/${v.slug}`} 
                                                target="_blank" 
                                                className="inline-flex items-center gap-1.5 text-emerald-600 font-bold hover:underline"
                                            >
                                                /{v.slug}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                v.status === "active" ? "bg-emerald-100 text-emerald-700" : 
                                                v.status === "pending" ? "bg-amber-100 text-amber-700" : 
                                                "bg-zinc-100 text-zinc-700"
                                            }`}>
                                                {v.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-zinc-400 font-mono text-[10px] truncate max-w-[150px]">
                                            {v.ownerUserId}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDeleteVendor(v.id, v.businessName)}
                                                    className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 p-2 rounded-lg transition-all"
                                                    title="Delete Vendor & Store (Keep User)"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handlePurgeVendor(v.id, v.businessName)}
                                                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-all"
                                                    title="Purge Vendor & User (Full Wipe)"
                                                >
                                                    <UserX className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeVendors.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-medium">
                                            No active vendors yet. Approve an application to add one here.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-6 space-y-6">
                        <div className="flex flex-wrap gap-2">
                            {(
                                [
                                    { key: "all" as const, label: "All", count: applications.length },
                                    { key: "pending" as const, label: "Pending", count: pendingCount },
                                    { key: "approved" as const, label: "Approved", count: approvedCount },
                                    { key: "rejected" as const, label: "Rejected", count: rejectedCount },
                                ] as const
                            ).map(({ key, label, count }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setApplicationFilter(key)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                        applicationFilter === key
                                            ? "bg-zinc-900 text-white"
                                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                    }`}
                                >
                                    {label} ({count})
                                </button>
                            ))}
                        </div>
                        <div className="grid gap-6">
                        {filteredApplications.length === 0 && !loading && (
                            <div className="py-20 text-center">
                                <Clock className="h-12 w-12 text-zinc-200 mx-auto mb-4" />
                                <p className="text-zinc-500 font-medium">
                                    {applications.length === 0
                                        ? "No applications yet"
                                        : `No ${applicationFilter === "all" ? "" : applicationFilter} applications`}
                                </p>
                            </div>
                        )}
                        {filteredApplications.map((app) => (
                            <div
                                key={app.id}
                                className="p-6 rounded-3xl bg-zinc-50/50 border border-zinc-100 flex flex-col md:flex-row gap-6 justify-between items-start"
                            >
                                <div className="space-y-4 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-xl font-black text-zinc-900">{app.businessName}</h3>
                                        <span
                                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                                app.status === "pending"
                                                    ? "bg-amber-100 text-amber-700"
                                                    : app.status === "approved"
                                                      ? "bg-emerald-100 text-emerald-700"
                                                      : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {app.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-zinc-500 font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <Mail className="h-4 w-4" /> {app.email}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Phone className="h-4 w-4" /> {app.phone}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Info className="h-4 w-4" />{" "}
                                            {app.category === "Other" && app.categoryOther
                                                ? `Other — ${app.categoryOther}`
                                                : app.category}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-600 bg-white p-4 rounded-2xl border border-zinc-100 line-clamp-2">
                                        {app.description}
                                    </p>
                                    {(app.sampleProductImageUrl || app.registrationCertificateUrl) && (
                                        <p className="text-xs font-semibold text-emerald-700">
                                            Includes uploaded sample & certificate — review before approving
                                        </p>
                                    )}
                                    {app.status === "approved" && app.vendorId && (
                                        <p className="text-xs font-semibold text-zinc-500">
                                            Linked vendor ID: <span className="font-mono">{app.vendorId}</span>
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedApplication(app)}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-zinc-200 text-zinc-900 rounded-2xl font-bold hover:bg-zinc-50 transition-all"
                                    >
                                        <Eye className="h-4 w-4" /> View details
                                    </button>
                                    {app.status === "pending" && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleApplicationAction(app.id, "reject")}
                                                disabled={actionLoading}
                                                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-red-100 text-red-600 rounded-2xl font-bold hover:bg-red-50 transition-all disabled:opacity-50"
                                            >
                                                <XCircle className="h-4 w-4" /> Reject
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleApplicationAction(app.id, "approve")}
                                                disabled={actionLoading}
                                                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
                                            >
                                                <CheckCircle2 className="h-4 w-4" /> Approve
                                            </button>
                                        </>
                                    )}
                                    {app.status === "approved" && !app.vendorId && (
                                        <button
                                            type="button"
                                            onClick={() => handleApplicationAction(app.id, "approve")}
                                            disabled={actionLoading}
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
                                        >
                                            <CheckCircle2 className="h-4 w-4" /> Activate vendor
                                        </button>
                                    )}
                                    {app.status === "rejected" && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteApplication(app.id, app.businessName || "")}
                                            disabled={actionLoading}
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-red-100 text-red-600 rounded-2xl font-bold hover:bg-red-50 transition-all disabled:opacity-50"
                                        >
                                            <Trash2 className="h-4 w-4" /> Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                )}
            </div>
            {loading && <p className="text-center py-10 text-zinc-400 font-medium">Loading marketplace data...</p>}

            {selectedApplication && (
                <VendorApplicationDetail
                    application={selectedApplication}
                    onClose={() => setSelectedApplication(null)}
                    onApprove={() => handleApplicationAction(selectedApplication.id, "approve")}
                    onReject={() => handleApplicationAction(selectedApplication.id, "reject")}
                    onDelete={selectedApplication.status === "rejected" ? () => {
                        handleDeleteApplication(selectedApplication.id, selectedApplication.businessName || "");
                        setSelectedApplication(null);
                    } : undefined}
                    actionLoading={actionLoading}
                />
            )}
        </div>
    );
}
