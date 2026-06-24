"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { UploadCloud, ArrowLeft, Plus, X, Loader2 } from "lucide-react";
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
import {
    MARKETPLACE_CATEGORIES,
    categoryNamesFromOptions,
    isApparelJerseyCategory,
} from "@/lib/product-category";
import VendorSizePicker, { ONE_SIZE } from "@/app/components/vendor/VendorSizePicker";
import { sortSizes } from "@/lib/sizes";

export default function VendorEditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.productId as string;
    const { showToast } = useToast();
    const { vendorId } = useAuth();

    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [teamId, setTeamId] = useState("");
    const [category, setCategory] = useState("Jersey");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("25");
    const [description, setDescription] = useState("");
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [colors, setColors] = useState<Array<{ id: string; name: string; hex: string }>>([]);
    const [newColorName, setNewColorName] = useState("");
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [customSizes, setCustomSizes] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([...MARKETPLACE_CATEGORIES]);
    const [customTeams, setCustomTeams] = useState<Team[]>([]);

    useEffect(() => {
        // Fetch categories and teams
        fetch("/api/categories", { cache: "no-store" })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    const names = categoryNamesFromOptions(data.categories);
                    setCategories(names);
                }
            })
            .catch(() => {
                setCategories([...MARKETPLACE_CATEGORIES]);
            });

        fetch("/api/admin/teams")
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.teams) setCustomTeams(data.teams);
            })
            .catch(() => {});
    }, []);

    // Load product details
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const token = await auth.currentUser?.getIdToken();
                const response = await fetch(`/api/vendor/products/${productId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.error || "Failed to load product");
                }

                const product = data.product;
                setName(product.name || "");
                setTeamId(product.teamId || product.team || "");
                setCategory(product.category || "Jersey");
                setPrice(String(product.price || ""));
                setStock(String(product.stock || "0"));
                setDescription(product.description || "");
                setExistingImages(product.images || []);
                setPreviewUrls(product.images || []);
                setColors(product.colors || []);
                
                // Set sizes
                const sizesList = product.sizes || [];
                const customList = product.customSizes || [];
                setSelectedSizes(sizesList);
                setCustomSizes(customList);
            } catch (error: any) {
                console.error("Error fetching product:", error);
                showToast(error.message || "Failed to load product", "error");
                router.push("/vendor/products");
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId, router, showToast]);

    useEffect(() => {
        return () => {
            previewUrls.forEach((url) => {
                if (url.startsWith("blob:")) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [previewUrls]);

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

    const allSizes = useMemo(
        () => sortSizes([...new Set([...selectedSizes, ...customSizes])]),
        [selectedSizes, customSizes]
    );

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const currentCount = previewUrls.length;
        const remainingSlots = 6 - currentCount;

        if (remainingSlots <= 0) {
            showToast("Maximum 6 images allowed", "error");
            return;
        }

        const filesToAdd = files.slice(0, remainingSlots);
        if (files.length > remainingSlots) {
            showToast(`Only ${remainingSlots} more image(s) can be added (max 6 total)`, "error");
        }

        setImageFiles((prev) => [...prev, ...filesToAdd]);
        setPreviewUrls((prev) => [...prev, ...filesToAdd.map((file) => URL.createObjectURL(file))]);
    };

    const removeImage = (index: number) => {
        const url = previewUrls[index];
        if (url && url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
        }

        setImageFiles((prev) => {
            const newFileIndex = index - existingImages.length;
            if (newFileIndex >= 0) {
                return prev.filter((_, i) => i !== newFileIndex);
            }
            return prev;
        });

        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));

        if (index < existingImages.length) {
            setExistingImages((prev) => prev.filter((_, i) => i !== index));
        }
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
        if (!name || !price) {
            showToast("Name and price are required", "error");
            return;
        }
        if (needTeam && !teamId) {
            showToast("Team is required for jersey products", "error");
            return;
        }
        if (previewUrls.length === 0) {
            showToast("At least one product image is required", "error");
            return;
        }

        setSubmitting(true);
        try {
            const uploadedImages: string[] = [...existingImages];
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
                teamId: needTeam ? teamId : "",
                sizes: selectedSizes.length > 0 ? selectedSizes : [],
                customSizes: customSizes.length > 0 ? customSizes : [],
                colors: colors.length > 0 ? colors : [],
            };

            const res = await fetch(`/api/vendor/products/${productId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const result = await res.json();
            if (!res.ok || !result.success) {
                throw new Error(result.error || "Failed to update product");
            }

            showToast("Product updated successfully!", "success");
            router.push("/vendor/products");
        } catch (error: any) {
            console.error(error);
            showToast(error instanceof Error ? error.message : "Failed to update product", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mb-4 inline-block h-12 w-12 animate-spin text-[var(--brand-red)]" />
                    <p className="text-zinc-600">Loading product...</p>
                </div>
            </div>
        );
    }

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
                <h1 className="text-2xl font-bold text-zinc-900">Edit listing</h1>
                <p className="mt-1 text-sm text-zinc-600">
                    Update listing details, images, sizes, and colors.
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
                                    <SelectValue placeholder="Select category" />
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
                                className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
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
                                className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                        />
                    </div>

                    <p className="text-xs text-zinc-500">
                        Sizes are optional. Skip if you sell by unit only — set stock on the Stock page or below.
                    </p>
                    <VendorSizePicker
                        selectedSizes={selectedSizes}
                        customSizes={customSizes}
                        onTogglePreset={(size) =>
                            setSelectedSizes((prev) =>
                                prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
                            )
                        }
                        onAddCustomSize={(size) => {
                            if (customSizes.includes(size) || selectedSizes.includes(size)) {
                                showToast("Size already added", "error");
                                return;
                            }
                            setCustomSizes((prev) => [...prev, size]);
                        }}
                        onRemoveCustomSize={(size) => setCustomSizes((prev) => prev.filter((s) => s !== size))}
                        onUseOneSize={() => {
                            setSelectedSizes([ONE_SIZE]);
                            setCustomSizes([]);
                        }}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">
                            Colors (optional)
                        </label>
                        <div className="flex gap-2">
                            <input
                                value={newColorName}
                                onChange={(e) => setNewColorName(e.target.value)}
                                placeholder="Name or hex"
                                className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addColor();
                                    }
                                }}
                            />
                            <button type="button" onClick={addColor} className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium hover:bg-zinc-200">
                                <Plus className="inline h-4 w-4 mr-1" /> Add
                            </button>
                        </div>
                        {colors.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {colors.map((c) => (
                                    <span
                                        key={c.id}
                                        className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold"
                                    >
                                        <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: c.hex }} />
                                        {c.name}
                                        <button type="button" onClick={() => removeColor(c.id)} className="text-zinc-400 hover:text-red-600 transition-colors">
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
                                    <span className="text-sm text-zinc-600 font-semibold">Upload images</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                                </label>
                            ) : (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                                        {previewUrls.map((url, idx) => (
                                            <div key={idx} className="relative aspect-square overflow-hidden rounded-lg border bg-white shadow-sm">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={url} alt="" className="h-full w-full object-contain p-1" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 shadow animate-in fade-in duration-200"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <label className={`flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-750 transition-colors ${previewUrls.length >= 6 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-50 cursor-pointer'}`}>
                                        <Plus className="h-4 w-4" />
                                        <span>{previewUrls.length >= 6 ? 'Maximum 6 images reached' : 'Add More Images'}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileChange}
                                            className="hidden"
                                            disabled={previewUrls.length >= 6}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                        <button
                            type="button"
                            onClick={() => router.push("/vendor/products")}
                            className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-lg bg-[var(--brand-red)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-red-dark)] disabled:opacity-60 transition-colors"
                        >
                            {submitting ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
