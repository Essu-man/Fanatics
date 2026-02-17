"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { UploadCloud, ArrowLeft, Plus, X } from "lucide-react";
import { useToast } from "../../../../components/ui/ToastContainer";
import { footballTeams, basketballTeams, internationalTeams, type Team } from "@/lib/teams";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from "../../../../components/ui/select";

const categories = ["Jersey", "Trainers"];

export default function AdminEditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.productId as string;
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [teamId, setTeamId] = useState("");
    const [category, setCategory] = useState("Jersey");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("25");
    const [description, setDescription] = useState("");
    const [sizes, setSizes] = useState<string[]>([]);
    const allSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"];
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [colors, setColors] = useState<Array<{ id: string; name: string; hex: string }>>([]);
    const [newColorName, setNewColorName] = useState("");
    const [newColorHex, setNewColorHex] = useState("#000000");

    useEffect(() => {
        // Cleanup generated previews
        return () => {
            previewUrls.forEach((url) => {
                if (url.startsWith("blob:")) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [previewUrls]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/admin/products/${productId}`);
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.error || "Failed to load product");
                }

                const product = data.product;
                setName(product.name || "");
                setTeamId(product.teamId || product.team || "");
                setCategory(product.category || "Jersey");
                setPrice(String(product.price || ""));
                setStock(String(product.stock || "25"));
                setDescription(product.description || "");
                setExistingImages(product.images || []);
                setPreviewUrls(product.images || []);
                setColors(product.colors || []);
                setSizes(product.sizes || []);
            } catch (error) {
                console.error("Error fetching product:", error);
                showToast("Failed to load product", "error");
                router.push("/admin/products");
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId, router, showToast]);

    const allTeams = useMemo(
        () =>
            [
                { label: "Football Clubs", teams: footballTeams },
                { label: "Basketball Teams", teams: basketballTeams },
                { label: "International Teams", teams: internationalTeams },
            ] as Array<{ label: string; teams: Team[] }>,
        []
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
        // Revoke the object URL to prevent memory leaks (only for blob URLs)
        if (url && url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
        }

        // Remove from both arrays
        setImageFiles((prev) => {
            // If it's a new file, remove it from imageFiles
            const newFileIndex = index - existingImages.length;
            if (newFileIndex >= 0) {
                return prev.filter((_, i) => i !== newFileIndex);
            }
            return prev;
        });

        // Remove from preview URLs
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));

        // If it's an existing image, remove it from existingImages
        if (index < existingImages.length) {
            setExistingImages((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const clearAllImages = () => {
        // Revoke all blob URLs
        previewUrls.forEach((url) => {
            if (url.startsWith("blob:")) {
                URL.revokeObjectURL(url);
            }
        });
        setImageFiles([]);
        setPreviewUrls([]);
        setExistingImages([]);
    };

    // Color name to hex mapping
    const getColorHex = (colorName: string): string => {
        const colorMap: Record<string, string> = {
            'red': '#FF0000', 'blue': '#0000FF', 'green': '#008000',
            'yellow': '#FFFF00', 'orange': '#FFA500', 'purple': '#800080',
            'pink': '#FFC0CB', 'black': '#000000', 'white': '#FFFFFF',
            'gray': '#808080', 'grey': '#808080', 'brown': '#A52A2A',
            'navy': '#000080', 'maroon': '#800000', 'teal': '#008080',
            'cyan': '#00FFFF', 'lime': '#00FF00', 'magenta': '#FF00FF',
            'silver': '#C0C0C0', 'gold': '#FFD700',
        };
        const normalized = colorName.toLowerCase().trim();
        return colorMap[normalized] || newColorHex;
    };

    const addColor = () => {
        if (!newColorName.trim()) {
            showToast("Please enter a color name", "error");
            return;
        }

        // Extract hex color from input if it's a hex value
        let hexColor = newColorHex;
        const trimmedName = newColorName.trim();
        if (trimmedName.startsWith('#') && /^#[0-9A-Fa-f]{6}$/.test(trimmedName)) {
            hexColor = trimmedName;
        } else if (/^[0-9A-Fa-f]{6}$/.test(trimmedName)) {
            hexColor = `#${trimmedName}`;
        } else {
            // Try to get hex from color name
            hexColor = getColorHex(trimmedName);
        }

        const colorId = trimmedName.toLowerCase().replace(/\s+/g, "-").replace(/^#/, "");
        if (colors.some(c => c.id === colorId)) {
            showToast("Color already exists", "error");
            return;
        }
        setColors([...colors, { id: colorId, name: trimmedName, hex: hexColor }]);
        setNewColorName("");
        setNewColorHex("#000000");
    };

    const removeColor = (colorId: string) => {
        setColors(colors.filter(c => c.id !== colorId));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // Team is only required for Jersey category, not for Trainers
        const isTeamRequired = category === "Jersey";

        if (!name || !price) {
            showToast("Name and price are required", "error");
            return;
        }

        if (isTeamRequired && !teamId) {
            showToast("Team is required for jerseys", "error");
            return;
        }

        if (previewUrls.length === 0) {
            showToast("At least one image is required", "error");
            return;
        }

        setSubmitting(true);
        try {
            let uploadedImages: string[] = [...existingImages];

            // Upload new images only
            for (const file of imageFiles) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("folder", `teams/${teamId}`);

                const response = await fetch("/api/admin/upload-image", {
                    method: "POST",
                    body: formData,
                });
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.error || "Image upload failed");
                }

                uploadedImages.push(data.url);
            }

            if (uploadedImages.length === 0) {
                throw new Error("At least one product image is required");
            }

            const response = await fetch(`/api/admin/products/${productId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    price: Number(price),
                    stock: Number(stock || 0),
                    ...(teamId && { teamId }), // Only include teamId if it exists
                    category,
                    description,
                    images: uploadedImages,
                    colors: colors.length > 0 ? colors : undefined,
                    sizes: sizes.length > 0 ? sizes : undefined,
                }),
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.error || "Failed to update product");
            }

            showToast("Product updated successfully!", "success");
            router.push("/admin/products");
        } catch (error) {
            console.error("Product update failed:", error);
            showToast(
                error instanceof Error ? error.message : "Failed to update product",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                    <p className="text-zinc-600">Loading product...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <button
                onClick={() => router.push("/admin/products")}
                className="inline-flex items-center gap-2 text-sm text-zinc-600 transition-colors hover:text-zinc-900"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Products
            </button>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-zinc-900">Edit Product</h1>
                    <p className="mt-1 text-sm text-zinc-600">
                        Update product details, images, and settings.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">
                                Product Name
                            </label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Manchester City 24/25 Home Jersey"
                                className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">
                                Category
                            </label>
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

                    {/* Only show team selection for Jersey category */}
                    {category === "Jersey" && (
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700">Team</label>
                                <Select value={teamId} onValueChange={setTeamId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a team..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allTeams.map((group) => (
                                            <SelectGroup key={group.label}>
                                                <SelectLabel>{group.label}</SelectLabel>
                                                {group.teams.map((team) => (
                                                    <SelectItem key={`${group.label}-${team.id}`} value={team.id}>
                                                        {team.name} ({team.league})
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700">Price</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                    placeholder="450"
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
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="Talk about fit, material, and why fans love this drop..."
                            className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                        />
                    </div>

                    {/* Color Options */}
                    {/* Sizes Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Available Sizes</label>
                        <div className="flex flex-wrap gap-2">
                            {allSizes.map((size) => (
                                <button
                                    type="button"
                                    key={size}
                                    className={`px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${sizes.includes(size) ? 'bg-[var(--brand-red)] text-white border-[var(--brand-red)]' : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100'}`}
                                    onClick={() => setSizes(sizes.includes(size) ? sizes.filter(s => s !== size) : [...sizes, size])}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                        {sizes.length > 0 && (
                            <div className="text-xs text-zinc-500 mt-1">Selected: {sizes.join(', ')}</div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">
                            Available Colors (Optional)
                        </label>
                        <p className="text-xs text-zinc-500 mb-3">
                            Add color variants that will appear on the product card
                        </p>

                        {/* Add Color Input */}
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={newColorName}
                                onChange={(e) => {
                                    setNewColorName(e.target.value);
                                    // Try to parse as hex color if it looks like one
                                    const value = e.target.value.trim();
                                    if (value.startsWith('#') && /^#[0-9A-Fa-f]{6}$/.test(value)) {
                                        setNewColorHex(value);
                                    } else if (/^[0-9A-Fa-f]{6}$/.test(value)) {
                                        setNewColorHex(`#${value}`);
                                    } else if (value) {
                                        // Try to get hex from color name
                                        const colorMap: Record<string, string> = {
                                            'red': '#FF0000', 'blue': '#0000FF', 'green': '#008000',
                                            'yellow': '#FFFF00', 'orange': '#FFA500', 'purple': '#800080',
                                            'pink': '#FFC0CB', 'black': '#000000', 'white': '#FFFFFF',
                                            'gray': '#808080', 'grey': '#808080', 'brown': '#A52A2A',
                                            'navy': '#000080', 'maroon': '#800000', 'teal': '#008080',
                                            'cyan': '#00FFFF', 'lime': '#00FF00', 'magenta': '#FF00FF',
                                            'silver': '#C0C0C0', 'gold': '#FFD700',
                                        };
                                        const normalized = value.toLowerCase();
                                        if (colorMap[normalized]) {
                                            setNewColorHex(colorMap[normalized]);
                                        }
                                    }
                                }}
                                placeholder="Color name or hex (e.g., Blue or #0000FF)"
                                className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addColor();
                                    }
                                }}
                            />
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-10 w-16 rounded-lg border border-zinc-200 flex-shrink-0"
                                    style={{
                                        backgroundColor: (() => {
                                            const value = newColorName.trim();
                                            if (value.startsWith('#') && /^#[0-9A-Fa-f]{6}$/.test(value)) {
                                                return value;
                                            } else if (/^[0-9A-Fa-f]{6}$/.test(value)) {
                                                return `#${value}`;
                                            } else if (value) {
                                                const colorMap: Record<string, string> = {
                                                    'red': '#FF0000', 'blue': '#0000FF', 'green': '#008000',
                                                    'yellow': '#FFFF00', 'orange': '#FFA500', 'purple': '#800080',
                                                    'pink': '#FFC0CB', 'black': '#000000', 'white': '#FFFFFF',
                                                    'gray': '#808080', 'grey': '#808080', 'brown': '#A52A2A',
                                                    'navy': '#000080', 'maroon': '#800000', 'teal': '#008080',
                                                    'cyan': '#00FFFF', 'lime': '#00FF00', 'magenta': '#FF00FF',
                                                    'silver': '#C0C0C0', 'gold': '#FFD700',
                                                };
                                                return colorMap[value.toLowerCase()] || newColorHex;
                                            }
                                            return newColorHex;
                                        })()
                                    }}
                                    title="Color preview"
                                />
                                <button
                                    type="button"
                                    onClick={addColor}
                                    className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Color Preview */}
                        {colors.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-zinc-200 bg-zinc-50">
                                {colors.map((color) => (
                                    <div
                                        key={color.id}
                                        className="group flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-1.5"
                                    >
                                        <span
                                            className="h-6 w-6 rounded-full border-2 border-white shadow-sm"
                                            style={{ backgroundColor: color.hex }}
                                        />
                                        <span className="text-sm font-medium text-zinc-900">{color.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeColor(color.id)}
                                            className="ml-1 rounded-full p-0.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Remove color"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-zinc-700">
                                Product Images ({previewUrls.length}/6)
                            </label>
                            {previewUrls.length > 0 && (
                                <button
                                    type="button"
                                    onClick={clearAllImages}
                                    className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                        <div className="rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/60 p-4 transition hover:border-[var(--brand-red)] hover:bg-white min-h-[150px]">
                            {previewUrls.length === 0 ? (
                                <label className="flex flex-col items-center justify-center gap-3 h-full min-h-[150px] cursor-pointer">
                                    <UploadCloud className="h-8 w-8 text-zinc-400" />
                                    <div className="text-center">
                                        <p className="font-semibold text-zinc-900">Drop jersey shots here</p>
                                        <p className="text-xs text-zinc-500 mt-1">PNG, JPG up to 5MB each (Max 6 images)</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            ) : (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-6">
                                        {previewUrls.map((url, idx) => (
                                            <div
                                                key={idx}
                                                className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm"
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Preview ${idx + 1}`}
                                                    className="h-full w-full object-contain p-1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100 shadow-md"
                                                    title="Remove image"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <label className={`flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors w-full sm:w-auto ${previewUrls.length >= 6 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-50 cursor-pointer'}`}>
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

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => router.push("/admin/products")}
                            className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-lg bg-[var(--brand-red)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-red-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? "Updating..." : "Update Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

