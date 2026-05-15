"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/app/components/ui/ToastContainer";
import type { Vendor } from "@/lib/firestore";
import { 
    Users, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    ExternalLink,
    Mail,
    Phone,
    Info,
    Plus
} from "lucide-react";

interface Application {
    id: string;
    businessName: string;
    email: string;
    phone: string;
    category: string;
    description: string;
    website?: string;
    instagram?: string;
    status: "pending" | "approved" | "rejected";
    appliedAt: any;
}

export default function AdminVendorsPage() {
    const [activeTab, setActiveTab] = useState<"vendors" | "applications">("vendors");
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    
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
        try {
            const res = await fetch(`/api/admin/vendors/applications/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: action === "approve" ? "approved" : "rejected" })
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Application ${action}ed`, "success");
                loadData();
            } else {
                showToast(data.error || "Failed to update application", "error");
            }
        } catch (err) {
            showToast("An error occurred", "error");
        }
    };

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
                    <span className="ml-1 px-2 py-0.5 rounded-md bg-zinc-100 text-[10px]">{vendors.length}</span>
                </button>
                <button 
                    onClick={() => setActiveTab("applications")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === "applications" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                >
                    <Clock className="h-4 w-4" />
                    Applications
                    <span className="ml-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-black">
                        {applications.filter(a => a.status === "pending").length}
                    </span>
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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {vendors.map((v) => (
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
                                    </tr>
                                ))}
                                {vendors.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 font-medium">
                                            No vendors found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-6 grid gap-6">
                        {applications.length === 0 && !loading && (
                            <div className="py-20 text-center">
                                <Clock className="h-12 w-12 text-zinc-200 mx-auto mb-4" />
                                <p className="text-zinc-500 font-medium">No pending applications</p>
                            </div>
                        )}
                        {applications.map((app) => (
                            <div key={app.id} className="p-6 rounded-3xl bg-zinc-50/50 border border-zinc-100 flex flex-col md:flex-row gap-6 justify-between items-start">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-black text-zinc-900">{app.businessName}</h3>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                            app.status === "pending" ? "bg-amber-100 text-amber-700" :
                                            app.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                                            "bg-red-100 text-red-700"
                                        }`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-zinc-500 font-medium">
                                        <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {app.email}</span>
                                        <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {app.phone}</span>
                                        <span className="flex items-center gap-1.5"><Info className="h-4 w-4" /> {app.category}</span>
                                    </div>
                                    <p className="text-sm text-zinc-600 bg-white p-4 rounded-2xl border border-zinc-100">
                                        {app.description}
                                    </p>
                                </div>
                                {app.status === "pending" && (
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <button 
                                            onClick={() => handleApplicationAction(app.id, "reject")}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-red-100 text-red-600 rounded-2xl font-bold hover:bg-red-50 transition-all"
                                        >
                                            <XCircle className="h-4 w-4" /> Reject
                                        </button>
                                        <button 
                                            onClick={() => handleApplicationAction(app.id, "approve")}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
                                        >
                                            <CheckCircle2 className="h-4 w-4" /> Approve
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {loading && <p className="text-center py-10 text-zinc-400 font-medium">Loading marketplace data...</p>}
        </div>
    );
}
