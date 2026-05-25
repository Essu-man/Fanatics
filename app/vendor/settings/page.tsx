"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { useToast } from "@/app/components/ui/ToastContainer";
import { ExternalLink, Save, UploadCloud, X } from "lucide-react";
import VendorStorefrontBanner from "@/app/components/vendor/VendorStorefrontBanner";

type VendorSettings = {
    id: string;
    slug: string;
    businessName: string;
    description: string;
    logoUrl: string;
    bannerUrl: string;
    status: string;
};

type AccountInfo = {
    email: string;
    firstName: string;
    lastName: string;
};

export default function VendorSettingsPage() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [storefrontUrl, setStorefrontUrl] = useState("");

    const [businessName, setBusinessName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [bannerUrl, setBannerUrl] = useState("");
    const [status, setStatus] = useState("active");
    const [account, setAccount] = useState<AccountInfo | null>(null);

    const loadSettings = useCallback(async () => {
        setLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch("/api/vendor/settings", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                cache: "no-store",
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || "Failed to load settings");

            const v: VendorSettings = data.vendor;
            setBusinessName(v.businessName);
            setSlug(v.slug);
            setDescription(v.description);
            setLogoUrl(v.logoUrl);
            setBannerUrl(v.bannerUrl);
            setStatus(v.status);
            setStorefrontUrl(data.storefrontUrl || `/store/${v.slug}`);
            setAccount(data.account ?? null);
        } catch (e: unknown) {
            showToast(e instanceof Error ? e.message : "Failed to load settings", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    async function persistImageField(field: "logoUrl" | "bannerUrl", url: string) {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch("/api/vendor/settings", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ [field]: url }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to save");
        if (data.vendor) {
            setLogoUrl(data.vendor.logoUrl ?? "");
            setBannerUrl(data.vendor.bannerUrl ?? "");
        }
    }

    async function uploadStoreImage(
        file: File,
        subfolder: "logo" | "banner",
        onSuccess: (url: string) => void,
        setUploading: (v: boolean) => void
    ) {
        setUploading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", `vendors/${slug || "store"}/${subfolder}`);

            const res = await fetch("/api/vendor/upload", {
                method: "POST",
                body: formData,
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || "Upload failed");
            onSuccess(data.url);
            const field = subfolder === "banner" ? "bannerUrl" : "logoUrl";
            await persistImageField(field, data.url);
            showToast(
                subfolder === "banner" ? "Banner saved to your store" : "Logo saved to your store",
                "success"
            );
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Upload failed", "error");
        } finally {
            setUploading(false);
        }
    }

    function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadStoreImage(file, "logo", setLogoUrl, setUploadingLogo).finally(() => {
            e.target.value = "";
        });
    }

    function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadStoreImage(file, "banner", setBannerUrl, setUploadingBanner).finally(() => {
            e.target.value = "";
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!businessName.trim()) {
            showToast("Business name is required", "error");
            return;
        }
        setSaving(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch("/api/vendor/settings", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    businessName: businessName.trim(),
                    slug: slug.trim(),
                    description,
                    logoUrl,
                    bannerUrl,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || "Failed to save");

            if (data.vendor) {
                setSlug(data.vendor.slug);
                setStorefrontUrl(data.storefrontUrl || `/store/${data.vendor.slug}`);
            }
            showToast("Settings saved", "success");
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Failed to save", "error");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p className="text-sm text-zinc-500">Loading settings…</p>;
    }

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
                <p className="mt-1 text-sm text-zinc-600">
                    Manage your storefront details visible to customers on Cediman.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">Storefront banner</h2>
                        <p className="mt-1 text-sm text-zinc-500">
                            Wide header image on your public store. Your logo stays on the left.
                        </p>
                    </div>

                    <VendorStorefrontBanner
                        preview
                        vendor={{
                            businessName: businessName || "Your store",
                            description,
                            logoUrl,
                            bannerUrl,
                        }}
                    />

                    <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                            <UploadCloud className="h-4 w-4" />
                            {uploadingBanner ? "Uploading…" : "Upload banner image"}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingBanner}
                                onChange={handleBannerUpload}
                            />
                        </label>
                        {bannerUrl && (
                            <button
                                type="button"
                                onClick={() => setBannerUrl("")}
                                className="text-sm font-medium text-red-600 hover:underline"
                            >
                                Remove banner
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-zinc-500">
                        Recommended: 1200×400 px or wider. Without a banner, a simple gradient is used.
                    </p>
                </section>

                <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
                    <h2 className="text-lg font-semibold text-zinc-900">Store profile</h2>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Business name</label>
                        <input
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Store URL slug</label>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-zinc-500 shrink-0">/store/</span>
                            <input
                                value={slug}
                                onChange={(e) =>
                                    setSlug(
                                        e.target.value
                                            .toLowerCase()
                                            .replace(/\s+/g, "-")
                                            .replace(/[^a-z0-9-]/g, "")
                                    )
                                }
                                className="flex-1 rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-mono"
                                required
                            />
                        </div>
                        <p className="text-xs text-zinc-500">
                            Changing your slug updates your public store link. Old links may stop working.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="Tell shoppers about your store…"
                            className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Store logo</label>
                        <div className="flex flex-wrap items-start gap-4">
                            {logoUrl ? (
                                <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={logoUrl} alt="" className="h-full w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setLogoUrl("")}
                                        className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-zinc-600 hover:text-red-600"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-xs text-zinc-400">
                                    No logo
                                </div>
                            )}
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                                <UploadCloud className="h-4 w-4" />
                                {uploadingLogo ? "Uploading…" : "Upload logo"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploadingLogo}
                                    onChange={handleLogoUpload}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                                status === "active"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : status === "pending"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-zinc-100 text-zinc-700"
                            }`}
                        >
                            {status}
                        </span>
                        {storefrontUrl && (
                            <Link
                                href={storefrontUrl}
                                target="_blank"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-red)] hover:underline"
                            >
                                View storefront
                                <ExternalLink className="h-4 w-4" />
                            </Link>
                        )}
                    </div>
                </section>

                {account && (
                    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-3">
                        <h2 className="text-lg font-semibold text-zinc-900">Account</h2>
                        <p className="text-sm text-zinc-600">
                            Signed in as{" "}
                            <strong>
                                {account.firstName} {account.lastName}
                            </strong>{" "}
                            ({account.email})
                        </p>
                        <p className="text-xs text-zinc-500">
                            To change your password or email, use your{" "}
                            <Link href="/account" className="font-medium text-[var(--brand-red)] hover:underline">
                                account page
                            </Link>
                            .
                        </p>
                    </section>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-red)] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? "Saving…" : "Save settings"}
                    </button>
                </div>
            </form>
        </div>
    );
}
