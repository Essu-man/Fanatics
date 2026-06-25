"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { useToast } from "@/app/components/ui/ToastContainer";
import { ExternalLink, Save, UploadCloud, X, Plus } from "lucide-react";
import VendorStorefrontBanner from "@/app/components/vendor/VendorStorefrontBanner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select";

const GHANA_BANKS = [
    { name: "Absa Bank Ghana Limited", code: "030100" },
    { name: "Access Bank", code: "280100" },
    { name: "ADB Bank Limited", code: "080100" },
    { name: "CAL Bank Limited", code: "140100" },
    { name: "Consolidated Bank Ghana Limited", code: "340100" },
    { name: "Ecobank Ghana Limited", code: "130100" },
    { name: "Fidelity Bank Ghana Limited", code: "240100" },
    { name: "First Atlantic Bank Limited", code: "170100" },
    { name: "First National Bank (Ghana) Limited", code: "330100" },
    { name: "GCB Bank Limited", code: "040100" },
    { name: "Guaranty Trust Bank (Ghana) Limited", code: "230100" },
    { name: "National Investment Bank Limited", code: "050100" },
    { name: "Prudential Bank Limited", code: "180100" },
    { name: "Republic Bank (GH) Limited", code: "110100" },
    { name: "Société Générale Ghana Limited", code: "090100" },
    { name: "Stanbic Bank Ghana Limited", code: "190100" },
    { name: "Standard Chartered Bank Ghana Limited", code: "020100" },
    { name: "United Bank for Africa (Ghana) Limited", code: "060100" },
    { name: "Universal Merchant Bank Ghana Limited", code: "100100" },
    { name: "Zenith Bank (Ghana) Limited", code: "120100" }
];

type VendorSettings = {
    id: string;
    slug: string;
    businessName: string;
    description: string;
    logoUrl: string;
    bannerUrl: string;
    status: string;
    payoutMethod?: string;
    bankName?: string;
    branch?: string;
    accountNumber?: string;
    accountName?: string;
    momoNetwork?: string;
    momoNumber?: string;
    paystackBankCode?: string;
    socialHandles?: Array<{ platform: string; handle: string }>;
    deliveryEnabled?: boolean;
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
    const [deliveryEnabled, setDeliveryEnabled] = useState(true);

    const [payoutMethod, setPayoutMethod] = useState("Bank Transfer");
    const [bankName, setBankName] = useState("");
    const [branch, setBranch] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");
    const [momoNetwork, setMomoNetwork] = useState("MTN");
    const [momoNumber, setMomoNumber] = useState("");
    const [bankCode, setBankCode] = useState("");
    const [socialHandles, setSocialHandles] = useState<Array<{ platform: string; handle: string }>>([
        { platform: "", handle: "" },
    ]);

    const SOCIAL_PLATFORMS = [
        "Instagram",
        "TikTok",
        "Snapchat",
        "Facebook",
        "WhatsApp Business",
        "X (Twitter)",
        "YouTube",
        "LinkedIn",
        "Threads",
        "Pinterest",
    ] as const;

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
            setPayoutMethod(v.payoutMethod || "Bank Transfer");
            setBankName(v.bankName || "");
            setBranch(v.branch || "");
            setAccountNumber(v.accountNumber || "");
            setAccountName(v.accountName || "");
            setMomoNetwork(v.momoNetwork || "MTN");
            setMomoNumber(v.momoNumber || "");
            setBankCode(v.paystackBankCode || "");
            setDeliveryEnabled(v.deliveryEnabled !== false);
            setSocialHandles(
                v.socialHandles && v.socialHandles.length > 0
                    ? v.socialHandles
                    : [{ platform: "", handle: "" }]
            );
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
                    payoutMethod,
                    bankName: payoutMethod === "Bank Transfer" ? bankName.trim() : "",
                    branch: payoutMethod === "Bank Transfer" ? branch.trim() : "",
                    accountNumber: payoutMethod === "Bank Transfer" ? accountNumber.trim() : "",
                    accountName: payoutMethod === "Bank Transfer" ? accountName.trim() : "",
                    momoNetwork: payoutMethod === "Mobile Money" ? momoNetwork : "",
                    momoNumber: payoutMethod === "Mobile Money" ? momoNumber.trim() : "",
                    bankCode: payoutMethod === "Bank Transfer" ? bankCode : "",
                    deliveryEnabled,
                    socialHandles: socialHandles
                        .filter((s) => s.platform && s.handle.trim())
                        .map((s) => ({ platform: s.platform, handle: s.handle.trim() })),
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || "Failed to save");

            if (data.vendor) {
                setSlug(data.vendor.slug);
                setStorefrontUrl(data.storefrontUrl || `/store/${data.vendor.slug}`);
                setBankCode(data.vendor.paystackBankCode || "");
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
                            socialHandles: socialHandles.filter((s) => s.platform && s.handle.trim()),
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

                {/* Social Handles Section */}
                <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">Social links</h2>
                        <p className="mt-1 text-sm text-zinc-500">
                            Add links to your social media channels. These will display as clickable icons on your storefront banner.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {socialHandles.map((entry, index) => {
                            const taken = new Set(
                                socialHandles
                                    .map((s, i) => (i !== index && s.platform ? s.platform : null))
                                    .filter(Boolean)
                            );
                            const hasPlatform = Boolean(entry.platform);
                            return (
                                <div key={index} className="flex gap-2 items-center w-full max-w-lg">
                                    <div className="flex w-full max-w-lg items-stretch overflow-hidden rounded-xl border-2 border-zinc-200 bg-white transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                                        <div className="relative z-10 w-[6.25rem] shrink-0 flex-none border-r border-zinc-200 bg-zinc-50">
                                            <Select
                                                value={entry.platform || undefined}
                                                onValueChange={(v) => {
                                                    setSocialHandles((prev) =>
                                                        prev.map((s, i) => (i === index ? { ...s, platform: v } : s))
                                                    );
                                                }}
                                            >
                                                <SelectTrigger
                                                    className="!w-full !max-w-full h-11 min-h-11 border-0 rounded-none bg-zinc-50 px-2 text-xs font-medium shadow-none focus:ring-0 focus:ring-offset-0 [&>span]:line-clamp-1 [&>span]:truncate"
                                                    aria-label="Social platform"
                                                >
                                                    <SelectValue placeholder="Platform" />
                                                </SelectTrigger>
                                                <SelectContent align="start" position="popper">
                                                    {SOCIAL_PLATFORMS.map((platform) => (
                                                        <SelectItem
                                                            key={platform}
                                                            value={platform}
                                                            textValue={platform}
                                                            disabled={taken.has(platform) && entry.platform !== platform}
                                                        >
                                                            {platform}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <input
                                            type="text"
                                            value={entry.handle}
                                            onChange={(e) => {
                                                setSocialHandles((prev) =>
                                                    prev.map((s, i) => (i === index ? { ...s, handle: e.target.value } : s))
                                                );
                                            }}
                                            disabled={!hasPlatform}
                                            className="min-w-0 flex-1 basis-0 grow h-11 border-0 bg-transparent px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 disabled:bg-zinc-50/50 disabled:cursor-not-allowed"
                                            placeholder={
                                                hasPlatform
                                                    ? entry.platform === "WhatsApp Business"
                                                        ? "Your number or link"
                                                        : "@username or profile URL"
                                                    : "Select platform first"
                                            }
                                        />
                                    </div>
                                    {socialHandles.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSocialHandles((prev) => prev.filter((_, i) => i !== index));
                                            }}
                                            className="shrink-0 h-11 w-10 rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:bg-red-50 hover:text-red-600 flex items-center justify-center"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                        <button
                            type="button"
                            onClick={() => setSocialHandles((prev) => [...prev, { platform: "", handle: "" }])}
                            disabled={socialHandles.length >= SOCIAL_PLATFORMS.length}
                            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Plus className="h-4 w-4" />
                            Add another platform
                        </button>
                    </div>
                </section>

                {/* Delivery Settings Section */}
                <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">Delivery settings</h2>
                        <p className="mt-1 text-sm text-zinc-500">
                            Choose whether to charge delivery fees on checkout for your products.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-zinc-50 border border-zinc-200 max-w-md">
                        <input
                            type="checkbox"
                            id="deliveryEnabled"
                            checked={deliveryEnabled}
                            onChange={(e) => setDeliveryEnabled(e.target.checked)}
                            className="h-4 w-4 rounded border-zinc-300 text-[var(--brand-red)] focus:ring-2 focus:ring-[var(--brand-red)]/20 cursor-pointer"
                        />
                        <label htmlFor="deliveryEnabled" className="text-sm font-medium text-zinc-700 cursor-pointer select-none">
                            Charge standard delivery fee for my products
                        </label>
                    </div>
                </section>

                {/* Payout/Payment Settings */}
                <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
                    <h2 className="text-lg font-semibold text-zinc-900">Payout settings</h2>
                    <p className="text-xs text-zinc-500">
                        How you receive payments for sold products. Balances are held until order delivery is confirmed.
                    </p>

                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer font-semibold text-zinc-700">
                            <input
                                type="radio"
                                name="payoutMethod"
                                value="Bank Transfer"
                                checked={payoutMethod === "Bank Transfer"}
                                onChange={(e) => setPayoutMethod(e.target.value)}
                                className="text-[var(--brand-red)] focus:ring-[var(--brand-red)]"
                            />
                            <span className="text-sm font-bold text-zinc-800">Bank account</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer font-semibold text-zinc-700">
                            <input
                                type="radio"
                                name="payoutMethod"
                                value="Mobile Money"
                                checked={payoutMethod === "Mobile Money"}
                                onChange={(e) => setPayoutMethod(e.target.value)}
                                className="text-[var(--brand-red)] focus:ring-[var(--brand-red)]"
                            />
                            <span className="text-sm font-bold text-zinc-800">Mobile Money (MoMo)</span>
                        </label>
                    </div>

                    {payoutMethod === "Bank Transfer" ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-600">Bank name</label>
                                <select
                                    value={bankCode}
                                    onChange={(e) => {
                                        const selectedCode = e.target.value;
                                        setBankCode(selectedCode);
                                        const bank = GHANA_BANKS.find(b => b.code === selectedCode);
                                        if (bank) {
                                            setBankName(bank.name);
                                        }
                                    }}
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm bg-white"
                                    required={payoutMethod === "Bank Transfer"}
                                >
                                    <option value="">Select a Bank...</option>
                                    {GHANA_BANKS.map((bank) => (
                                        <option key={bank.code} value={bank.code}>
                                            {bank.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-600">Branch name</label>
                                <input
                                    value={branch}
                                    onChange={(e) => setBranch(e.target.value)}
                                    placeholder="e.g. Accra Main"
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                                    required={payoutMethod === "Bank Transfer"}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-600">Account number</label>
                                <input
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder="Enter bank account number"
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-mono"
                                    required={payoutMethod === "Bank Transfer"}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-600">Account holder name</label>
                                <input
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    placeholder="Exact account holder name"
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                                    required={payoutMethod === "Bank Transfer"}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-600">MoMo network</label>
                                <select
                                    value={momoNetwork}
                                    onChange={(e) => setMomoNetwork(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm bg-white"
                                >
                                    <option value="MTN">MTN Mobile Money</option>
                                    <option value="Telecel">Telecel Cash</option>
                                    <option value="AirtelTigo">AirtelTigo Money</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-600">MoMo phone number</label>
                                <input
                                    value={momoNumber}
                                    onChange={(e) => setMomoNumber(e.target.value)}
                                    placeholder="e.g. 024XXXXXXX"
                                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-mono"
                                    required={payoutMethod === "Mobile Money"}
                                />
                            </div>
                        </div>
                    )}
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
