"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Plus, Edit, Trash2, Folder, Upload, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "../../components/ui/ToastContainer";
import Modal from "../../components/ui/modal";

interface CustomLeague {
    id: string;
    name: string;
    sport: string;
    logoUrl?: string;
    createdAt?: Date;
}

export default function AdminLeaguesPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [leagues, setLeagues] = useState<CustomLeague[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingLeague, setEditingLeague] = useState<CustomLeague | null>(null);
    const [formData, setFormData] = useState({ name: "", sport: "" });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchLeagues();
    }, []);

    const fetchLeagues = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/leagues");
            const data = await response.json();

            if (response.ok && data.success) {
                setLeagues(data.leagues || []);
            }
        } catch (error) {
            console.error("Error fetching leagues:", error);
            showToast("Failed to load leagues", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (league?: CustomLeague) => {
        if (league) {
            setEditingLeague(league);
            setFormData({ name: league.name, sport: league.sport });
            setLogoPreview(league.logoUrl || "");
        } else {
            setEditingLeague(null);
            setFormData({ name: "", sport: "" });
            setLogoPreview("");
        }
        setLogoFile(null);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingLeague(null);
        setFormData({ name: "", sport: "" });
        setLogoFile(null);
        setLogoPreview("");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast("Image must be less than 5MB", "error");
                return;
            }
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.sport.trim()) {
            showToast("Please fill in all required fields", "error");
            return;
        }

        setSubmitting(true);
        try {
            const submitFormData = new FormData();
            submitFormData.append("name", formData.name.trim());
            submitFormData.append("sport", formData.sport.trim());

            if (logoFile) {
                submitFormData.append("logo", logoFile);
            }

            const url = editingLeague
                ? `/api/admin/leagues/${editingLeague.id}`
                : "/api/admin/leagues";
            const method = editingLeague ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                body: submitFormData,
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to save league");
            }

            showToast(
                editingLeague ? "League updated successfully" : "League added successfully",
                "success"
            );
            handleCloseModal();
            fetchLeagues();
        } catch (error) {
            console.error("Error saving league:", error);
            showToast(error instanceof Error ? error.message : "Failed to save league", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (leagueId: string) => {
        if (!confirm("Are you sure you want to delete this league? This action cannot be undone.")) return;

        try {
            const response = await fetch(`/api/admin/leagues/${leagueId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to delete league");
            }

            showToast("League deleted successfully", "success");
            fetchLeagues();
        } catch (error) {
            console.error("Error deleting league:", error);
            showToast(error instanceof Error ? error.message : "Failed to delete league", "error");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                    <p className="text-zinc-600">Loading leagues...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => router.push("/admin/teams")}
                        className="mb-2 inline-flex items-center gap-2 text-sm text-zinc-600 transition-colors hover:text-zinc-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Teams
                    </button>
                    <h1 className="text-3xl font-bold text-zinc-900">Manage Leagues</h1>
                    <p className="mt-1 text-sm text-zinc-600">
                        Create and manage custom leagues with logos
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-red)] px-4 py-2 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                >
                    <Plus className="h-5 w-5" />
                    Add League
                </button>
            </div>

            {/* Custom Leagues Section */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Folder className="h-5 w-5 text-zinc-600" />
                        <h2 className="text-xl font-bold text-zinc-900">Custom Leagues</h2>
                        <span className="ml-2 text-sm text-zinc-500">({leagues.length} leagues)</span>
                    </div>
                </div>

                {leagues.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
                        <Folder className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
                        <h3 className="mb-2 text-lg font-semibold text-zinc-900">No custom leagues yet</h3>
                        <p className="mb-6 text-sm text-zinc-600">
                            Create custom leagues to organize your teams and products
                        </p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-red)] px-6 py-3 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                        >
                            <Plus className="h-5 w-5" />
                            Add Your First League
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {leagues.map((league) => (
                            <div
                                key={league.id}
                                className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="mb-4 flex items-center justify-center">
                                    {league.logoUrl ? (
                                        <div className="h-16 w-16 rounded-full bg-zinc-100 overflow-hidden flex items-center justify-center">
                                            <img
                                                src={league.logoUrl}
                                                alt={league.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-16 w-16 rounded-full bg-zinc-200 flex items-center justify-center">
                                            <ImageIcon className="h-8 w-8 text-zinc-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="mb-4 text-center">
                                    <h3 className="text-lg font-bold text-zinc-900">{league.name}</h3>
                                    <p className="text-sm text-zinc-500 capitalize">{league.sport}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleOpenModal(league)}
                                        className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                                    >
                                        <Edit className="inline h-4 w-4 mr-1" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(league.id)}
                                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit League Modal */}
            <Modal open={modalOpen} onClose={handleCloseModal}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900">
                            {editingLeague ? "Edit League" : "Add New League"}
                        </h2>
                        <p className="mt-1 text-sm text-zinc-600">
                            {editingLeague
                                ? "Update the league information"
                                : "Add a custom league with a logo"}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                League Logo
                            </label>
                            <div className="flex items-center gap-4">
                                {logoPreview ? (
                                    <div className="h-20 w-20 rounded-full bg-zinc-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-20 w-20 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
                                        <ImageIcon className="h-10 w-10 text-zinc-400" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                                    >
                                        <Upload className="h-4 w-4" />
                                        {logoPreview ? "Change Logo" : "Upload Logo"}
                                    </button>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        PNG, JPG or WEBP (max 5MB)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">
                                League Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="e.g., Ghana Premier League"
                                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">
                                Sport *
                            </label>
                            <select
                                value={formData.sport}
                                onChange={(e) =>
                                    setFormData({ ...formData, sport: e.target.value })
                                }
                                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                required
                            >
                                <option value="">Select a sport</option>
                                <option value="football">Football (Soccer)</option>
                                <option value="basketball">Basketball</option>
                                <option value="baseball">Baseball</option>
                                <option value="american-football">American Football</option>
                                <option value="hockey">Hockey</option>
                                <option value="rugby">Rugby</option>
                                <option value="cricket">Cricket</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-lg bg-[var(--brand-red)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-red-dark)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting
                                ? editingLeague
                                    ? "Updating..."
                                    : "Adding..."
                                : editingLeague
                                    ? "Update League"
                                    : "Add League"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
