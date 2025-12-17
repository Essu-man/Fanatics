"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, MessageSquare, Clock, CheckCircle } from "lucide-react";
import { useToast } from "../../components/ui/ToastContainer";
import type { Complaint } from "@/lib/database";

export default function ComplaintsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        subject: "",
        description: "",
        orderId: "",
    });

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }
        fetchComplaints();
    }, [user]);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const { getUserComplaints } = await import("@/lib/database");
            const data = await getUserComplaints(user!.id);
            setComplaints(data);
        } catch (error) {
            console.error("Error fetching complaints:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.subject || !formData.description) {
            showToast("Please fill in all required fields", "error");
            return;
        }

        try {
            const { createComplaint } = await import("@/lib/database");
            const result = await createComplaint({
                user_id: user!.id,
                order_id: formData.orderId || undefined,
                subject: formData.subject,
                description: formData.description,
                status: "open",
            });

            if (result.success) {
                showToast("Complaint submitted successfully", "success");
                setShowForm(false);
                setFormData({ subject: "", description: "", orderId: "" });
                fetchComplaints();
            } else {
                showToast("Failed to submit complaint", "error");
            }
        } catch (error) {
            console.error("Error submitting complaint:", error);
            showToast("An error occurred", "error");
        }
    };

    const statusConfig = {
        open: { label: "Open", color: "bg-yellow-100 text-yellow-700", icon: Clock },
        in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700", icon: Clock },
        resolved: { label: "Resolved", color: "bg-green-100 text-green-700", icon: CheckCircle },
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                    <p className="text-zinc-600">Loading complaints...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="mx-auto max-w-4xl px-6 py-12">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link
                            href="/account"
                            className="mb-2 inline-block text-sm text-zinc-600 hover:text-zinc-900"
                        >
                            ← Back to Account
                        </Link>
                        <h1 className="text-3xl font-bold text-zinc-900">My Complaints</h1>
                        <p className="mt-1 text-sm text-zinc-600">
                            Submit and track your issues
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-red)] px-4 py-2 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                    >
                        <Plus className="h-5 w-5" />
                        New Complaint
                    </button>
                </div>

                {/* Complaint Form */}
                {showForm && (
                    <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-zinc-900">Submit a Complaint</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full rounded-lg border border-zinc-200 px-4 py-2 focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Order ID (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.orderId}
                                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                                    placeholder="ORD-..."
                                    className="w-full rounded-lg border border-zinc-200 px-4 py-2 focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="w-full rounded-lg border border-zinc-200 px-4 py-2 focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="rounded-lg bg-[var(--brand-red)] px-6 py-2 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                                >
                                    Submit Complaint
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="rounded-lg border border-zinc-200 px-6 py-2 font-medium text-zinc-700 hover:bg-zinc-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Complaints List */}
                {complaints.length === 0 ? (
                    <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center shadow-sm">
                        <MessageSquare className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
                        <h2 className="mb-2 text-xl font-semibold text-zinc-900">No complaints yet</h2>
                        <p className="mb-6 text-zinc-600">
                            If you have any issues, feel free to submit a complaint
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-red)] px-6 py-3 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                        >
                            <Plus className="h-5 w-5" />
                            Submit Complaint
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {complaints.map((complaint) => {
                            const StatusIcon = statusConfig[complaint.status].icon;
                            return (
                                <div
                                    key={complaint.id}
                                    className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
                                >
                                    <div className="mb-3 flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-zinc-900">{complaint.subject}</h3>
                                            {complaint.order_id && (
                                                <p className="text-xs text-zinc-500">Order: {complaint.order_id}</p>
                                            )}
                                        </div>
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusConfig[complaint.status].color}`}
                                        >
                                            <StatusIcon className="h-3 w-3" />
                                            {statusConfig[complaint.status].label}
                                        </span>
                                    </div>
                                    <p className="mb-3 text-sm text-zinc-600">{complaint.description}</p>
                                    <p className="text-xs text-zinc-500">
                                        Submitted: {new Date(complaint.created_at).toLocaleDateString('en-GB')}
                                    </p>
                                    {complaint.responses && complaint.responses.length > 0 && (
                                        <div className="mt-4 border-t border-zinc-100 pt-4">
                                            <p className="text-xs font-medium text-zinc-700 mb-2">
                                                {complaint.responses.length} Response(s)
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
