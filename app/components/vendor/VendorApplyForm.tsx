"use client";

import { useEffect, useState } from "react";
import {
    Rocket,
    ArrowRight,
    CheckCircle2,
    User,
    Building2,
    CreditCard,
    ChevronLeft,
    Plus,
    X,
    Upload,
    Loader2,
} from "lucide-react";
import { useToast } from "@/app/components/ui/ToastContainer";
import { useAuth } from "@/app/providers/AuthProvider";
import { signUp } from "@/lib/firebase-auth";
import Link from "next/link";
import { MARKETPLACE_CATEGORIES } from "@/lib/product-category";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select";

type PayoutMethod = "Bank Transfer" | "Mobile Money";
type LocationType = "online" | "onsite";
type MomoNetwork = "MTN" | "AirtelTigo" | "Telecel Cash";

export type SocialHandleEntry = { platform: string; handle: string };

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

const selectTriggerClass =
    "h-14 rounded-2xl border-2 border-zinc-50 bg-zinc-50 px-4 text-base focus:ring-2 focus:ring-emerald-500/20";

/** Phone-input style: fixed-width platform segment + flex handle input */
const socialComboBoxClass =
    "flex w-full max-w-lg items-stretch overflow-hidden rounded-xl border-2 border-zinc-200 bg-white transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20";

const socialComboSelectTriggerClass =
    "!w-full !max-w-full h-11 min-h-11 border-0 rounded-none bg-zinc-50 px-2 text-xs font-medium shadow-none focus:ring-0 focus:ring-offset-0 [&>span]:line-clamp-1 [&>span]:truncate";

const socialComboInputClass =
    "min-w-0 flex-1 basis-0 grow h-11 border-0 bg-transparent px-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 read-only:bg-zinc-50/50 read-only:cursor-not-allowed";

async function uploadVendorFile(file: File, subfolder: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", `vendor-applications/${subfolder}`);
    const res = await fetch("/api/vendor/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Upload failed");
    return data.url as string;
}

type VendorApplyFormProps = {
    /** On /signup — create a login account before submitting the application */
    requireAccount?: boolean;
};

export default function VendorApplyForm({ requireAccount = false }: VendorApplyFormProps) {
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingSample, setUploadingSample] = useState(false);
    const [uploadingCert, setUploadingCert] = useState(false);
    const [accountPassword, setAccountPassword] = useState("");
    const [accountConfirmPassword, setAccountConfirmPassword] = useState("");
    const { showToast } = useToast();
    const { user, refreshUser } = useAuth();

    const [socialHandles, setSocialHandles] = useState<SocialHandleEntry[]>([{ platform: "", handle: "" }]);

    const [formData, setFormData] = useState({
        contactPerson: "",
        email: "",
        phone: "",
        businessName: "",
        category: "Jersey" as string,
        categoryOther: "",
        description: "",
        businessLocationType: "online" as LocationType,
        businessAddress: "",
        logoUrl: "",
        sampleProductImageUrl: "",
        registrationCertificateUrl: "",
        payoutMethod: "Bank Transfer" as PayoutMethod,
        bankName: "",
        branch: "",
        accountNumber: "",
        accountName: "",
        momoNetwork: "MTN" as MomoNetwork,
        momoNumber: "",
    });

    useEffect(() => {
        if (!user) return;
        setFormData((f) => ({
            ...f,
            email: f.email || user.email,
            contactPerson:
                f.contactPerson ||
                [user.firstName, user.lastName].filter(Boolean).join(" ").trim(),
        }));
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const updateSocialPlatform = (index: number, platform: string) => {
        setSocialHandles((prev) => prev.map((entry, i) => (i === index ? { ...entry, platform } : entry)));
    };

    const updateSocialHandle = (index: number, handle: string) => {
        setSocialHandles((prev) => prev.map((entry, i) => (i === index ? { ...entry, handle } : entry)));
    };

    const addSocialHandle = () =>
        setSocialHandles((prev) => [...prev, { platform: "", handle: "" }]);

    const removeSocialHandle = (index: number) => {
        setSocialHandles((prev) =>
            prev.length <= 1 ? [{ platform: "", handle: "" }] : prev.filter((_, i) => i !== index)
        );
    };

    const usedPlatforms = (excludeIndex: number) =>
        new Set(socialHandles.map((s, i) => (i !== excludeIndex && s.platform ? s.platform : null)).filter(Boolean));

    const handleLogoImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            showToast("Logo must be an image (PNG, JPG, etc.)", "error");
            return;
        }
        setUploadingLogo(true);
        try {
            const url = await uploadVendorFile(file, "logos");
            setFormData((f) => ({ ...f, logoUrl: url }));
            showToast("Store logo uploaded", "success");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Upload failed";
            showToast(message, "error");
        } finally {
            setUploadingLogo(false);
            e.target.value = "";
        }
    };

    const handleSampleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            showToast("Sample must be an image", "error");
            return;
        }
        setUploadingSample(true);
        try {
            const url = await uploadVendorFile(file, "samples");
            setFormData((f) => ({ ...f, sampleProductImageUrl: url }));
            showToast("Sample image uploaded", "success");
        } catch (err: any) {
            showToast(err.message || "Upload failed", "error");
        } finally {
            setUploadingSample(false);
            e.target.value = "";
        }
    };

    const handleRegistrationCert = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const ok = file.type.startsWith("image/") || file.type === "application/pdf";
        if (!ok) {
            showToast("Certificate must be a PDF or image", "error");
            return;
        }
        setUploadingCert(true);
        try {
            const url = await uploadVendorFile(file, "certificates");
            setFormData((f) => ({ ...f, registrationCertificateUrl: url }));
            showToast("Certificate uploaded", "success");
        } catch (err: any) {
            showToast(err.message || "Upload failed", "error");
        } finally {
            setUploadingCert(false);
            e.target.value = "";
        }
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.contactPerson || !formData.email || !formData.phone) {
                showToast("Please fill in all basic information", "error");
                return;
            }
            if (requireAccount && !user) {
                if (accountPassword.length < 6) {
                    showToast("Password must be at least 6 characters", "error");
                    return;
                }
                if (accountPassword !== accountConfirmPassword) {
                    showToast("Passwords do not match", "error");
                    return;
                }
            }
        }
        if (step === 2) {
            if (!formData.businessName || !formData.description) {
                showToast("Please fill in business details", "error");
                return;
            }
            if (formData.category === "Other" && !formData.categoryOther.trim()) {
                showToast("Please describe your category", "error");
                return;
            }
            if (formData.businessLocationType === "onsite" && !formData.businessAddress.trim()) {
                showToast("Please enter your business location", "error");
                return;
            }
            if (!formData.logoUrl) {
                showToast("Please upload your store logo", "error");
                return;
            }
            if (!formData.sampleProductImageUrl) {
                showToast("Please upload a sample product image", "error");
                return;
            }
            if (!formData.registrationCertificateUrl) {
                showToast("Please upload your business registration certificate", "error");
                return;
            }
        }
        setStep((s) => s + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const prevStep = () => {
        setStep((s) => s - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.payoutMethod === "Bank Transfer") {
            if (!formData.bankName || !formData.branch || !formData.accountNumber || !formData.accountName) {
                showToast("Complete all bank details including branch", "error");
                return;
            }
        } else {
            if (!formData.momoNumber.trim()) {
                showToast("Enter your mobile money number", "error");
                return;
            }
        }

        setSubmitting(true);
        try {
            let applicantUserId = user?.id;

            if (!applicantUserId && requireAccount) {
                const nameParts = formData.contactPerson.trim().split(/\s+/);
                const firstName = nameParts[0] || "Seller";
                const lastName = nameParts.slice(1).join(" ") || "Applicant";
                const signUpResult = await signUp(
                    formData.email.trim(),
                    accountPassword,
                    firstName,
                    lastName,
                    "customer",
                    formData.phone.trim() || undefined
                );
                if (!signUpResult.success || !signUpResult.user) {
                    let errorMessage = signUpResult.error || "Could not create your account";
                    if (errorMessage.includes("auth/email-already-in-use")) {
                        errorMessage = "This email is already in use. Please sign in first, or use a different email address.";
                    }
                    showToast(errorMessage, "error");
                    return;
                }
                applicantUserId = signUpResult.user.id;
                await refreshUser();
            }

            const res = await fetch("/api/vendor/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    applicantUserId,
                    socialHandles: socialHandles
                        .filter((s) => s.platform && s.handle.trim())
                        .map((s) => ({ platform: s.platform, handle: s.handle.trim() })),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
                showToast("Application submitted successfully!", "success");
            } else {
                showToast(data.error || "Submission failed", "error");
            }
        } catch {
            showToast("An error occurred", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="text-center py-12 px-6">
                <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-12 w-12" />
                </div>
                <h2 className="text-3xl font-black text-zinc-900 mb-4">Application Received!</h2>
                <p className="text-lg text-zinc-600 mb-4 max-w-md mx-auto">
                    Thank you for applying. Our team will review your application within 2–3 business days.
                </p>
                <p className="text-sm text-zinc-500 mb-8 max-w-md mx-auto">
                    Once approved, sign in with the email you used here, then open your{" "}
                    <strong className="text-zinc-800">Seller dashboard</strong> at{" "}
                    <Link href="/vendor" className="font-semibold text-emerald-700 hover:underline">
                        /vendor
                    </Link>{" "}
                    to add products.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/login?redirect=/vendor"
                        className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all"
                    >
                        Sign in (after approval)
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const inputClass =
        "w-full h-14 px-5 rounded-2xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 focus:bg-white transition-all outline-none";

    return (
        <div className="space-y-8">
            <div className="mb-12">
                <div className="flex items-center justify-between relative px-2">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-100 -translate-y-1/2 z-0" />
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
                        style={{ width: `${((step - 1) / 2) * 100}%` }}
                    />
                    {[
                        { s: 1, icon: User, label: "Basic Info" },
                        { s: 2, icon: Building2, label: "Store Details" },
                        { s: 3, icon: CreditCard, label: "Payment" },
                    ].map((item) => (
                        <div key={item.s} className="relative z-10 flex flex-col items-center">
                            <div
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${
                                    step >= item.s
                                        ? "bg-emerald-500 border-emerald-100 text-white"
                                        : "bg-white border-zinc-100 text-zinc-300"
                                }`}
                            >
                                <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <span
                                className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest mt-3 ${
                                    step >= item.s ? "text-emerald-600" : "text-zinc-400"
                                }`}
                            >
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-700">Contact Person Name</label>
                            <input
                                name="contactPerson"
                                required
                                value={formData.contactPerson}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Full Name"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Business Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="hello@yourbusiness.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Phone Number</label>
                                <input
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="+233..."
                                />
                            </div>
                        </div>
                        {!user && requireAccount ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-5">
                                <p className="md:col-span-2 text-sm font-medium text-zinc-600">
                                    Create your seller login — you will use this to upload products after approval.
                                </p>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-700">Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={accountPassword}
                                        onChange={(e) => setAccountPassword(e.target.value)}
                                        className={inputClass}
                                        placeholder="At least 6 characters"
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-700">Confirm password</label>
                                    <input
                                        type="password"
                                        required
                                        value={accountConfirmPassword}
                                        onChange={(e) => setAccountConfirmPassword(e.target.value)}
                                        className={inputClass}
                                        placeholder="Repeat password"
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>
                        ) : !user ? (
                            <p className="text-sm text-zinc-500">
                                Already have an account?{" "}
                                <Link href="/login?redirect=/vendor/apply" className="font-semibold text-emerald-700 hover:underline">
                                    Sign in
                                </Link>{" "}
                                first so we can link your store, or apply at{" "}
                                <Link href="/signup?role=vendor" className="font-semibold text-emerald-700 hover:underline">
                                    Sign up → Seller
                                </Link>{" "}
                                to create a login with your application.
                            </p>
                        ) : null}
                        <button
                            type="button"
                            onClick={nextStep}
                            className="w-full h-16 bg-zinc-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all active:scale-[0.98]"
                        >
                            Continue to Store Details
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Business Name</label>
                                <input
                                    name="businessName"
                                    required
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="e.g. Kicks & Kits"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Category</label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                                >
                                    <SelectTrigger className={selectTriggerClass}>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MARKETPLACE_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {formData.category === "Other" && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Describe your category</label>
                                <input
                                    name="categoryOther"
                                    value={formData.categoryOther}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="e.g. Handmade accessories, books, etc."
                                    required
                                />
                            </div>
                        )}

                        <div className="space-y-2 max-w-md">
                            <label className="text-sm font-bold text-zinc-700">Store Description</label>
                            <textarea
                                name="description"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full max-w-md p-4 rounded-2xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 focus:bg-white transition-all outline-none text-sm resize-y"
                                placeholder="What do you sell? How long have you been in business?"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-zinc-700">Business location</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData({ ...formData, businessLocationType: "online", businessAddress: "" })
                                    }
                                    className={`h-14 rounded-2xl border-2 font-bold transition-all ${
                                        formData.businessLocationType === "online"
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                            : "border-zinc-50 bg-zinc-50 text-zinc-500"
                                    }`}
                                >
                                    Online only
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, businessLocationType: "onsite" })}
                                    className={`h-14 rounded-2xl border-2 font-bold transition-all ${
                                        formData.businessLocationType === "onsite"
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                            : "border-zinc-50 bg-zinc-50 text-zinc-500"
                                    }`}
                                >
                                    On-site (physical)
                                </button>
                            </div>
                            {formData.businessLocationType === "onsite" && (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-700">Business address / area</label>
                                    <input
                                        name="businessAddress"
                                        value={formData.businessAddress}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder="Shop number, street, city"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-zinc-700">Social handles</label>
                            <p className="text-xs text-zinc-500">
                                Choose a platform, then type your handle in the field next to it.
                            </p>
                            {socialHandles.map((entry, index) => {
                                const taken = usedPlatforms(index);
                                const hasPlatform = Boolean(entry.platform);
                                return (
                                    <div key={index} className="flex gap-2 items-center w-full max-w-lg">
                                        <div className={socialComboBoxClass}>
                                            <div className="relative z-10 w-[6.25rem] shrink-0 flex-none border-r border-zinc-200 bg-zinc-50">
                                                <Select
                                                    value={entry.platform || undefined}
                                                    onValueChange={(v) => updateSocialPlatform(index, v)}
                                                >
                                                    <SelectTrigger
                                                        className={socialComboSelectTriggerClass}
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
                                                                disabled={
                                                                    taken.has(platform) &&
                                                                    entry.platform !== platform
                                                                }
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
                                                onChange={(e) => updateSocialHandle(index, e.target.value)}
                                                readOnly={!hasPlatform}
                                                tabIndex={hasPlatform ? 0 : -1}
                                                className={socialComboInputClass}
                                                placeholder={
                                                    hasPlatform
                                                        ? entry.platform === "WhatsApp Business"
                                                            ? "Your number or link"
                                                            : "@username or profile URL"
                                                        : "Select platform first"
                                                }
                                                aria-label={
                                                    hasPlatform
                                                        ? `${entry.platform} handle`
                                                        : "Social handle"
                                                }
                                            />
                                        </div>
                                        {socialHandles.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSocialHandle(index)}
                                                className="shrink-0 h-11 w-10 rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:bg-red-50 hover:text-red-600 flex items-center justify-center"
                                                aria-label="Remove handle"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                            <button
                                type="button"
                                onClick={addSocialHandle}
                                disabled={socialHandles.length >= SOCIAL_PLATFORMS.length}
                                className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Plus className="h-4 w-4" />
                                Add another platform
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Store logo *</label>
                                <p className="text-xs text-zinc-500">Shown on your public store page</p>
                                <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 hover:border-emerald-400 transition-colors">
                                    {uploadingLogo ? (
                                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                    ) : formData.logoUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={formData.logoUrl}
                                            alt="Store logo"
                                            className="h-full w-full object-contain rounded-xl p-2"
                                        />
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-zinc-400 mb-2" />
                                            <span className="text-xs font-medium text-zinc-500">Square logo works best</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleLogoImage}
                                        disabled={uploadingLogo}
                                    />
                                </label>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Sample product image *</label>
                                <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 hover:border-emerald-400 transition-colors">
                                    {uploadingSample ? (
                                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                    ) : formData.sampleProductImageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={formData.sampleProductImageUrl}
                                            alt="Sample"
                                            className="h-full w-full object-contain rounded-xl p-2"
                                        />
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-zinc-400 mb-2" />
                                            <span className="text-xs font-medium text-zinc-500">Click to upload</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleSampleImage}
                                        disabled={uploadingSample}
                                    />
                                </label>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">
                                    Business registration certificate *
                                </label>
                                <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 hover:border-emerald-400 transition-colors px-4 text-center">
                                    {uploadingCert ? (
                                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                    ) : formData.registrationCertificateUrl ? (
                                        <span className="text-sm font-semibold text-emerald-700">Certificate uploaded ✓</span>
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-zinc-400 mb-2" />
                                            <span className="text-xs font-medium text-zinc-500">PDF or image</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        className="hidden"
                                        onChange={handleRegistrationCert}
                                        disabled={uploadingCert}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={prevStep}
                                className="w-20 h-16 bg-zinc-100 text-zinc-900 rounded-2xl font-black flex items-center justify-center hover:bg-zinc-200 transition-all"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex-1 h-16 bg-zinc-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all active:scale-[0.98]"
                            >
                                Payment Details
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-700">Preferred payout method</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, payoutMethod: "Bank Transfer" })}
                                    className={`h-14 rounded-2xl border-2 transition-all font-bold ${
                                        formData.payoutMethod === "Bank Transfer"
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                            : "border-zinc-50 bg-zinc-50 text-zinc-500"
                                    }`}
                                >
                                    Bank account
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, payoutMethod: "Mobile Money" })}
                                    className={`h-14 rounded-2xl border-2 transition-all font-bold ${
                                        formData.payoutMethod === "Mobile Money"
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                            : "border-zinc-50 bg-zinc-50 text-zinc-500"
                                    }`}
                                >
                                    Mobile money
                                </button>
                            </div>
                        </div>

                        {formData.payoutMethod === "Bank Transfer" ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-700">Bank name</label>
                                        <input
                                            name="bankName"
                                            required
                                            value={formData.bankName}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="e.g. GCB Bank"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-700">Branch</label>
                                        <input
                                            name="branch"
                                            required
                                            value={formData.branch}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="e.g. Osu Branch"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-700">Account number</label>
                                        <input
                                            name="accountNumber"
                                            required
                                            value={formData.accountNumber}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="XXXX XXXX XXXX"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-700">Account name</label>
                                        <input
                                            name="accountName"
                                            required
                                            value={formData.accountName}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="Name on account"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-700">Network</label>
                                    <Select
                                        value={formData.momoNetwork}
                                        onValueChange={(v) =>
                                            setFormData({ ...formData, momoNetwork: v as MomoNetwork })
                                        }
                                    >
                                        <SelectTrigger className="h-14 rounded-2xl border-2 border-zinc-50 bg-zinc-50 px-5 text-base">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MTN">MTN</SelectItem>
                                            <SelectItem value="AirtelTigo">AirtelTigo</SelectItem>
                                            <SelectItem value="Telecel Cash">Telecel Cash</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-700">Mobile money number</label>
                                    <input
                                        name="momoNumber"
                                        required
                                        value={formData.momoNumber}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder="+233 XX XXX XXXX"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={prevStep}
                                className="w-20 h-16 bg-zinc-100 text-zinc-900 rounded-2xl font-black flex items-center justify-center hover:bg-zinc-200 transition-all"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 h-16 bg-zinc-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {submitting ? "Submitting..." : "Submit Application"}
                                <Rocket className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
