"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Plus, Edit, Trash2, Users, Folder, Upload, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "../../components/ui/ToastContainer";
import Modal from "../../components/ui/modal";

interface CustomTeam {
    id: string;
    name: string;
    league: string;
    leagueId?: string;
    logoUrl?: string;
    createdAt?: Date;
}

interface League {
    id: string;
    name: string;
    sport: string;
    logoUrl?: string;
    teamCount: number;
}

export default function AdminTeamsPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [teams, setTeams] = useState<CustomTeam[]>([]);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [customLeagues, setCustomLeagues] = useState<League[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingLeagues, setLoadingLeagues] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<CustomTeam | null>(null);
    const [formData, setFormData] = useState({ name: "", league: "", leagueId: "" });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const [isNewLeague, setIsNewLeague] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchTeams();
        fetchLeagues();
        fetchCustomLeagues();
    }, []);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/teams");
            const data = await response.json();

            if (response.ok && data.success) {
                setTeams(data.teams || []);
            }
        } catch (error) {
            console.error("Error fetching teams:", error);
            showToast("Failed to load teams", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchLeagues = async () => {
        try {
            setLoadingLeagues(true);
            const response = await fetch("/api/leagues");
            const data = await response.json();
            setLeagues(data.leagues || []);
        } catch (error) {
            console.error("Error fetching leagues:", error);
        } finally {
            setLoadingLeagues(false);
        }
    };

    const fetchCustomLeagues = async () => {
        try {
            const response = await fetch("/api/admin/leagues");
            const data = await response.json();
            if (response.ok && data.success) {
                setCustomLeagues(data.leagues || []);
            }
        } catch (error) {
            console.error("Error fetching custom leagues:", error);
        }
    };

    const handleOpenModal = (team?: CustomTeam) => {
        if (team) {
            setEditingTeam(team);
            setFormData({ name: team.name, league: team.league, leagueId: team.leagueId || "" });
            setLogoPreview(team.logoUrl || "");
            setIsNewLeague(!team.leagueId);
        } else {
            setEditingTeam(null);
            setFormData({ name: "", league: "", leagueId: "" });
            setLogoPreview("");
            setIsNewLeague(false);
        }
        setLogoFile(null);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingTeam(null);
        setFormData({ name: "", league: "", leagueId: "" });
        setLogoFile(null);
        setLogoPreview("");
        setIsNewLeague(false);
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

    const handleLeagueChange = (value: string) => {
        if (value === "new") {
            setIsNewLeague(true);
            setFormData({ ...formData, leagueId: "", league: "" });
        } else {
            setIsNewLeague(false);
            const selectedLeague = [...leagues, ...customLeagues].find(l => l.id === value);
            setFormData({
                ...formData,
                leagueId: value,
                league: selectedLeague?.name || ""
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.league.trim()) {
            showToast("Please fill in all required fields", "error");
            return;
        }

        setSubmitting(true);
        try {
            const submitFormData = new FormData();
            submitFormData.append("name", formData.name.trim());
            submitFormData.append("league", formData.league.trim());
            submitFormData.append("leagueId", formData.leagueId || "");

            if (logoFile) {
                submitFormData.append("logo", logoFile);
            }

            const url = editingTeam
                ? `/api/admin/teams/${editingTeam.id}`
                : "/api/admin/teams";
            const method = editingTeam ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                body: submitFormData,
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to save team");
            }

            showToast(
                editingTeam ? "Team updated successfully" : "Team added successfully",
                "success"
            );
            handleCloseModal();
            fetchTeams();
            fetchLeagues();
            fetchCustomLeagues();
        } catch (error) {
            console.error("Error saving team:", error);
            showToast(error instanceof Error ? error.message : "Failed to save team", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (teamId: string) => {
        if (!confirm("Are you sure you want to delete this team?")) return;

        try {
            const response = await fetch(`/api/admin/teams/${teamId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to delete team");
            }

            showToast("Team deleted successfully", "success");
            fetchTeams();
            fetchLeagues();
            fetchCustomLeagues();
        } catch (error) {
            console.error("Error deleting team:", error);
            showToast(error instanceof Error ? error.message : "Failed to delete team", "error");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                    <p className="text-zinc-600">Loading teams...</p>
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
                        onClick={() => router.push("/admin/products")}
                        className="mb-2 inline-flex items-center gap-2 text-sm text-zinc-600 transition-colors hover:text-zinc-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Products
                    </button>
                    <h1 className="text-3xl font-bold text-zinc-900">Manage Teams & Leagues</h1>
                    <p className="mt-1 text-sm text-zinc-600">
                        View all leagues and manage custom teams
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push("/admin/leagues")}
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 font-semibold text-zinc-700 hover:bg-zinc-50"
                    >
                        <Folder className="h-5 w-5" />
                        Manage Leagues
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-red)] px-4 py-2 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                    >
                        <Plus className="h-5 w-5" />
                        Add Team
                    </button>
                </div>
            </div>

            {/* Existing Leagues Section */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <Folder className="h-5 w-5 text-zinc-600" />
                    <h2 className="text-xl font-bold text-zinc-900">All Leagues</h2>
                    <span className="ml-2 text-sm text-zinc-500">({leagues.length} leagues)</span>
                </div>
                {loadingLeagues ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                    </div>
                ) : leagues.length === 0 ? (
                    <p className="py-4 text-center text-zinc-500">No leagues found</p>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {leagues.map((league) => (
                            <div
                                key={league.id}
                                className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 hover:border-zinc-300 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-zinc-900">{league.name}</h3>
                                        <p className="mt-1 text-xs text-zinc-500 capitalize">{league.sport}</p>
                                    </div>
                                    <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700">
                                        {league.teamCount} {league.teamCount === 1 ? 'team' : 'teams'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Custom Teams Section */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-zinc-600" />
                        <h2 className="text-xl font-bold text-zinc-900">Custom Teams</h2>
                        <span className="ml-2 text-sm text-zinc-500">({teams.length} teams)</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                    </div>
                ) : teams.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
                        <Users className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
                        <h3 className="mb-2 text-lg font-semibold text-zinc-900">No custom teams yet</h3>
                        <p className="mb-6 text-sm text-zinc-600">
                            Add custom teams to organize products that aren't in the predefined lists
                        </p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-red)] px-6 py-3 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                        >
                            <Plus className="h-5 w-5" />
                            Add Your First Team
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {teams.map((team) => (
                            <div
                                key={team.id}
                                className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="mb-4 flex items-start gap-3">
                                    {team.logoUrl ? (
                                        <div className="h-12 w-12 rounded-full bg-zinc-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                                            <img
                                                src={team.logoUrl}
                                                alt={team.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-12 w-12 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
                                            <ImageIcon className="h-6 w-6 text-zinc-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-zinc-900 truncate">{team.name}</h3>
                                        <p className="text-sm text-zinc-500 truncate">{team.league}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleOpenModal(team)}
                                        className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                                    >
                                        <Edit className="inline h-4 w-4 mr-1" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(team.id)}
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

            {/* Add/Edit Team Modal */}
            <Modal open={modalOpen} onClose={handleCloseModal}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900">
                            {editingTeam ? "Edit Team" : "Add New Team"}
                        </h2>
                        <p className="mt-1 text-sm text-zinc-600">
                            {editingTeam
                                ? "Update the team information"
                                : "Add a custom team to your catalog"}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Team Logo
                            </label>
                            <div className="flex items-center gap-4">
                                {logoPreview ? (
                                    <div className="h-16 w-16 rounded-full bg-zinc-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
                                        <ImageIcon className="h-8 w-8 text-zinc-400" />
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
                                Team Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="e.g., Ghana Black Stars"
                                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">
                                League/Competition *
                            </label>
                            <select
                                value={isNewLeague ? "new" : formData.leagueId}
                                onChange={(e) => handleLeagueChange(e.target.value)}
                                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 mb-2"
                            >
                                <option value="">Select a league</option>
                                <option value="new">+ Create New League</option>
                                <optgroup label="Custom Leagues">
                                    {customLeagues.map((league) => (
                                        <option key={league.id} value={league.id}>
                                            {league.name}
                                        </option>
                                    ))}
                                </optgroup>
                                <optgroup label="Football Leagues">
                                    {leagues.filter(l => l.sport === "football").map((league) => (
                                        <option key={league.id} value={league.id}>
                                            {league.name}
                                        </option>
                                    ))}
                                </optgroup>
                                <optgroup label="Basketball Leagues">
                                    {leagues.filter(l => l.sport === "basketball").map((league) => (
                                        <option key={league.id} value={league.id}>
                                            {league.name}
                                        </option>
                                    ))}
                                </optgroup>
                            </select>

                            {isNewLeague && (
                                <input
                                    type="text"
                                    value={formData.league}
                                    onChange={(e) =>
                                        setFormData({ ...formData, league: e.target.value })
                                    }
                                    placeholder="Enter new league name"
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                    required
                                />
                            )}
                            <p className="mt-1 text-xs text-zinc-500">
                                {isNewLeague
                                    ? "Creating a new league. You can add a logo in League Management."
                                    : "Select an existing league or create a new one"}
                            </p>
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
                                ? editingTeam
                                    ? "Updating..."
                                    : "Adding..."
                                : editingTeam
                                    ? "Update Team"
                                    : "Add Team"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
