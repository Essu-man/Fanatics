"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Store, Upload, CheckCircle2 } from "lucide-react";
import { useToast } from "../../components/ui/ToastContainer";
import { useAuth } from "../../providers/AuthProvider";

export default function TeamApplyPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        teamName: "",
        leagueName: "",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            showToast("Please sign in to suggest a team", "error");
            router.push("/login?redirect=/teams/apply");
            return;
        }

        setSubmitting(true);
        try {
            // In a real app, this would save to a 'team_requests' collection in Firestore
            // For now, we'll simulate success and show a success message
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSubmitted(true);
            showToast("Team request submitted successfully!", "success");
        } catch (error) {
            showToast("Failed to submit request", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="mx-auto max-w-xl px-6 py-24 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="rounded-full bg-emerald-100 p-4">
                            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-zinc-900 mb-4">Request Submitted!</h1>
                    <p className="text-zinc-600 mb-8 text-lg">
                        Thank you for your suggestion. Our admins will review the team <strong>{formData.teamName}</strong> and add it to our store soon.
                    </p>
                    <button
                        onClick={() => router.push("/teams")}
                        className="bg-zinc-900 text-white px-8 py-3 rounded-full font-bold hover:bg-zinc-800 transition-all"
                    >
                        Back to Store
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <Header />
            <div className="mx-auto max-w-2xl px-6 py-16">
                <div className="rounded-3xl bg-white p-8 shadow-sm border border-zinc-100 md:p-12">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-4 uppercase tracking-widest">
                            <Store className="h-4 w-4" /> Team Request
                        </div>
                        <h1 className="text-4xl font-black text-zinc-900 mb-4">Suggest a Team</h1>
                        <p className="text-zinc-500 font-medium leading-relaxed">
                            Can't find your favorite team? Let us know and we'll review it for addition to our catalog.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-zinc-900 mb-2">Team Name</label>
                            <input
                                type="text"
                                required
                                value={formData.teamName}
                                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                                placeholder="e.g. Accra Lions"
                                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-zinc-900 mb-2">League / Competition</label>
                            <input
                                type="text"
                                required
                                value={formData.leagueName}
                                onChange={(e) => setFormData({ ...formData, leagueName: e.target.value })}
                                placeholder="e.g. Ghana Premier League"
                                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-zinc-900 mb-2">Additional Details (Optional)</label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Tell us more about the team or why we should add it..."
                                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-full bg-zinc-900 py-4 font-black text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {submitting ? "Submitting Request..." : "Submit Request"}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}
