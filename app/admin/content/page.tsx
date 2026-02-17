"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";

export default function ContentManagerPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [bannerImages, setBannerImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push("/admin/login");
            return;
        }
        fetchBannerImages();
    }, [user, router]);

    // Warn before leaving if unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // Default slides from PromoBanner.tsx
    const defaultSlides = [
        "https://vjhkurmmzgudtzgxgijb.supabase.co/storage/v1/object/public/banner/1.jpeg",
        "https://vjhkurmmzgudtzgxgijb.supabase.co/storage/v1/object/public/banner/2.jpeg",
        "https://vjhkurmmzgudtzgxgijb.supabase.co/storage/v1/object/public/banner/3.jpeg",
    ];

    const fetchBannerImages = async () => {
        try {
            const response = await fetch("/api/admin/content?id=home_banner");
            const result = await response.json();

            if (result.success && result.data && result.data.images && result.data.images.length > 0) {
                setBannerImages(result.data.images);
            } else {
                setBannerImages(defaultSlides);
            }
        } catch (error) {
            console.error("Error fetching banner images:", error);
            // Fallback to defaults on error too
            setBannerImages(defaultSlides);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadedUrls: string[] = [];

            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("folder", "banners"); // Changed from default to banners

                const response = await fetch("/api/admin/upload-image", {
                    method: "POST",
                    body: formData,
                });

                const result = await response.json();
                if (result.success && result.url) {
                    uploadedUrls.push(result.url);
                }
            }

            if (uploadedUrls.length > 0) {
                setBannerImages(prev => [...prev, ...uploadedUrls]);
                setHasUnsavedChanges(true);
            }
        } catch (error) {
            console.error("Error uploading images:", error);
            alert("Failed to upload images");
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = "";
        }
    };

    const handleRemoveImage = (index: number) => {
        setBannerImages(bannerImages.filter((_, i) => i !== index));
        setHasUnsavedChanges(true);
    };

    const handleMoveImage = (index: number, direction: 'left' | 'right') => {
        if (direction === 'left' && index === 0) return;
        if (direction === 'right' && index === bannerImages.length - 1) return;

        const newImages = [...bannerImages];
        const targetIndex = direction === 'left' ? index - 1 : index + 1;
        [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];

        setBannerImages(newImages);
        setHasUnsavedChanges(true);
    };

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        try {
            const response = await fetch("/api/admin/content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contentId: "home_banner",
                    images: bannerImages,
                    userId: user.id,
                    type: "banner",
                }),
            });

            const result = await response.json();
            if (result.success) {
                setHasUnsavedChanges(false);
                // Optional: Show a toast or clearer success message
                const button = document.getElementById('save-button');
                if (button) {
                    const originalText = button.innerText;
                    button.innerText = "Saved!";
                    setTimeout(() => {
                        button.innerText = originalText;
                    }, 2000);
                }
            } else {
                alert("Failed to update banner images");
            }
        } catch (error) {
            console.error("Error saving banner images:", error);
            alert("Failed to save banner images");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-zinc-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-6">
            <div className="mx-auto max-w-6xl">
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900">Content Manager</h1>
                        <p className="mt-2 text-zinc-600">Manage home page banner images</p>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-sm border border-zinc-200">
                    <div className="mb-6 flex items-center justify-between sticky top-0 bg-white z-10 py-4 border-b border-zinc-100">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-semibold text-zinc-900">Banner Images</h2>
                            {hasUnsavedChanges && (
                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                                    Unsaved Changes
                                </span>
                            )}
                        </div>
                        <div className="flex gap-3">
                            {hasUnsavedChanges && (
                                <button
                                    onClick={fetchBannerImages}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                id="save-button"
                                onClick={handleSave}
                                disabled={saving || !hasUnsavedChanges}
                                className={`rounded-lg px-6 py-2 font-medium text-white transition-all shadow-sm ${hasUnsavedChanges
                                    ? "bg-[var(--brand-red)] hover:bg-red-700"
                                    : "bg-zinc-300 cursor-not-allowed"
                                    }`}
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>

                    {/* Upload Section */}
                    <div className="mb-8">
                        <label className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all ${uploading
                            ? "border-zinc-300 bg-zinc-50 opacity-50 cursor-wait"
                            : "border-zinc-300 bg-zinc-50 hover:border-[var(--brand-red)] hover:bg-zinc-100"
                            }`}>
                            <Upload className={`mb-2 h-12 w-12 ${uploading ? "text-zinc-300" : "text-zinc-400"}`} />
                            <span className="text-sm font-medium text-zinc-700">
                                {uploading ? "Uploading..." : "Click to upload images"}
                            </span>
                            <span className="mt-1 text-xs text-zinc-500">PNG, JPG up to 10MB</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Images Grid */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {bannerImages.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-zinc-400 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                                <ImageIcon className="mb-2 h-16 w-16 opacity-20" />
                                <p className="text-lg font-medium text-zinc-600">No custom banner images</p>
                                <p className="mt-1 max-w-sm text-sm text-zinc-500">
                                    The home page is currently displaying default system images.
                                    Upload new images here to replace them.
                                </p>
                            </div>
                        ) : (
                            bannerImages.map((url, index) => (
                                <div
                                    key={index}
                                    className="group relative aspect-video overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 shadow-sm transition-all hover:shadow-md"
                                >
                                    <div className="absolute top-2 left-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                            {index + 1}
                                        </span>
                                    </div>

                                    <img
                                        src={url}
                                        alt={`Banner ${index + 1}`}
                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                    />

                                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />

                                    <div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleRemoveImage(index)}
                                            className="rounded-full bg-white/90 p-2 text-red-600 shadow-sm transition-all hover:bg-red-600 hover:text-white backdrop-blur-sm"
                                            title="Remove image"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
