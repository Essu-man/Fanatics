"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, ArrowLeft, Plus, X } from "lucide-react";
import { useToast } from "@/app/components/ui/ToastContainer";
import { useAuth } from "@/app/providers/AuthProvider";
import { auth } from "@/lib/firebase";
import { type Team } from "@/lib/teams";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select";
import TeamSearchInput from "@/app/components/product-form/TeamSearchInput";
import { MARKETPLACE_CATEGORIES } from "@/lib/product-category";
import { isApparelJerseyCategory } from "@/lib/product-category";

const categories = [...MARKETPLACE_CATEGORIES];

export default function VendorNewProductPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const { vendorId } = useAuth();

    const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
    const ONE_SIZE = "One Size";

    const [name, setName] = useState("");
    const [teamId, setTeamId] = useState("");
    const [category, setCategory] = useState("Cosmetics");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("25");
    const [description, setDescription] = useState("");
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [colors, setColors] = useState<Array<{ id: string; name: string; hex: string }>>([]);
    const [newColorName, setNewColorName] = useState("");
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>(MARKETPLACE_CATEGORIES as any);
    const [customTeams, setCustomTeams] = useState<Team[]>([]);

    useEffect(() => {
        // Fetch categories
        fetch("/api/categories")
            .then(res => res.json())
            .then(data => {
                if (data.success && data.categories) {
                    setCategories(data.categories.map((c: any) => c.name));
                }
            })
            .catch(() => {});

        fetch("/api/admin/teams")
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.teams) setCustomTeams(data.teams);
            })
            .catch(() => {});
        return () => {
            previewUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, []);

    const allTeams = useMemo(() => {
        const groups: Array<{ label: string; teams: Team[] }> = [];
        const footballTeamsFromAPI = customTeams.filter((t) => t.sport === "football");
        const basketballTeamsFromAPI = customTeams.filter((t) => t.sport === "basketball");
        const internationalTeamsFromAPI = customTeams.filter((t) => t.sport === "international");
        if (footballTeamsFromAPI.length > 0) groups.push({ label: "Football Teams", teams: footballTeamsFromAPI });
        if (basketballTeamsFromAPI.length > 0) groups.push({ label: "Basketball Teams", teams: basketballTeamsFromAPI });
        if (internationalTeamsFromAPI.length > 0) groups.push({ label: "International Teams", teams: internationalTeamsFromAPI });
        return groups;
    }, [customTeams]);

    const toggleSize = (size: string) => {
        setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const remainingSlots = 6 - previewUrls.length;
        if (remainingSlots <= 0) {
            showToast("Maximum 6 images allowed", "error");
            return;
        }
        const filesToAdd = files.slice(0, remainingSlots);
        setImageFiles((prev) => [...prev, ...filesToAdd]);
        setPreviewUrls((prev) => [...prev, ...filesToAdd.map((file) => URL.createObjectURL(file))]);
    };

    const removeImage = (index: number) => {
        if (previewUrls[index]) URL.revokeObjectURL(previewUrls[index]);
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const addColor = () => {
        const trimmedName = newColorName.trim();
        if (!trimmedName) return;
        const hexColor = trimmedName.startsWith("#") && /^#[0-9A-Fa-f]{6}$/.test(trimmedName) ? trimmedName : "#64748b";
        const colorId = trimmedName.toLowerCase().replace(/\s+/g, "-").replace(/^#/, "");
        if (colors.some((c) => c.id === colorId)) {
            showToast("Color already exists", "error");
            return;
        }
        setColors([...colors, { id: colorId, name: trimmedName, hex: hexColor }]);
        setNewColorName("");
    };

    const removeColor = (colorId: string) => {
        setColors(colors.filter((c) => c.id !== colorId));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const needTeam = isApparelJerseyCategory(category);
        if (!name || !price || imageFiles.length === 0) {
            showToast("Name, price, and at least one image are required", "error");
            return;
        }
        if (selectedSizes.length === 0) {
            showToast("Select at least one size (or use One Size)", "error");
            return;
        }
        if (needTeam && !teamId) {
            showToast("Team is required for jersey products", "error");
            return;
        }
        if (needTeam && colors.length === 0) {
            showToast("Add at least one color for jerseys", "error");
            return;
        }

        setSubmitting(true);
        try {
            const uploadedImages: string[] = [];
            const folder = vendorId ? `vendors/${vendorId}` : "products/general";

            for (const file of imageFiles) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("folder", folder);

                const response = await fetch("/api/admin/upload-image", {
                    method: "POST",
                    body: formData,
                });
                const data = await response.json();
                if (!response.ok || !data.success) throw new Error(data.error || "Image upload failed");
                uploadedImages.push(data.url);
            }

            const token = await auth.currentUser?.getIdToken();
            if (!token) throw new Error("Please sign in again");

            const body = {
                name,
                price: Number(price),
                stock: Number(stock || 0),
                category,
                description,
                images: uploadedImages,
                teamId: needTeam ? teamId : undefined,
                sizes: selectedSizes,
                colors: colors.length > 0 ? colors : undefined,
            };

            const res = await fetch("/api/vendor/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.error || "Failed to create product");

            showToast("Product created!", "success");
            router.push("/vendor/products");
        } catch (error: any) {
            console.error(error);
            showToast(error instanceof Error ? error.message : "Failed to create product", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <button
                type="button"
                onClick={() => router.push("/vendor/products")}
                className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to products
            </button>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-zinc-900">New listing</h1>
                <p className="mt-1 text-sm text-zinc-600">
                    Your product will be reviewed by an admin before it goes live.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Product name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Category</label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {isApparelJerseyCategory(category) && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Team</label>
                            <TeamSearchInput teams={allTeams} value={teamId} onChange={setTeamId} />
                        </div>
                    )}

                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Price (GHS)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Stock</label>
                            <input
                                type="number"
                                min="0"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-zinc-900">Sizes</p>
                            <button
                                type="button"
                                onClick={() => setSelectedSizes([ONE_SIZE])}
                                className="text-xs font-medium text-[var(--brand-red)] hover:underline"
                            >
                                Use &quot;One Size&quot; only
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_SIZES.map((size) => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => toggleSize(size)}
                                    className={`rounded-lg border-2 px-3 py-2 text-sm font-medium ${
                                        selectedSizes.includes(size)
                                            ? "border-[var(--brand-red)] bg-[var(--brand-red)] text-white"
                                            : "border-zinc-200 bg-white text-zinc-800"
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                        {selectedSizes.length > 0 && (
                            <p className="text-xs text-zinc-500">Selected: {selectedSizes.join(", ")}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">
                            Colors {isApparelJerseyCategory(category) ? "(required for jerseys)" : "(optional)"}
                        </label>
                        <div className="flex gap-2">
                            <input
                                value={newColorName}
                                onChange={(e) => setNewColorName(e.target.value)}
                                placeholder="Name or hex"
                                className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addColor();
                                    }
                                }}
                            />
                            <button type="button" onClick={addColor} className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium">
                                <Plus className="inline h-4 w-4" /> Add
                            </button>
                        </div>
                        {colors.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {colors.map((c) => (
                                    <span
                                        key={c.id}
                                        className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs"
                                    >
                                        <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: c.hex }} />
                                        {c.name}
                                        <button type="button" onClick={() => removeColor(c.id)} className="text-zinc-400 hover:text-red-600">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Images (max 6)</label>
                        <div className="rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/60 p-4">
                            {previewUrls.length === 0 ? (
                                <label className="flex cursor-pointer flex-col items-center gap-2 py-8">
                                    <UploadCloud className="h-8 w-8 text-zinc-400" />
                                    <span className="text-sm text-zinc-600">Upload images</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                                </label>
                            ) : (
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                                    {previewUrls.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square overflow-hidden rounded-lg border bg-white">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={url} alt="" className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => router.push("/vendor/products")}
                            className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-lg bg-[var(--brand-red)] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {submitting ? "Publishing…" : "Publish"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
