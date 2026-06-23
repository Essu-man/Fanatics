"use client";

import { X, CreditCard, FileText, Image as ImageIcon, ExternalLink, Trash2 } from "lucide-react";

export type VendorApplicationRecord = {
    id: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    businessName?: string;
    category?: string;
    categoryOther?: string | null;
    description?: string;
    socialHandles?: Array<string | { platform: string; handle: string }>;
    website?: string | null;
    instagram?: string | null;
    businessLocationType?: "online" | "onsite";
    businessAddress?: string | null;
    logoUrl?: string | null;
    sampleProductImageUrl?: string | null;
    registrationCertificateUrl?: string | null;
    payoutMethod?: string;
    bankName?: string | null;
    branch?: string | null;
    accountNumber?: string | null;
    accountName?: string | null;
    momoNetwork?: string | null;
    momoNumber?: string | null;
    status?: string;
    vendorId?: string | null;
    slug?: string | null;
    applicantUserId?: string | null;
    appliedAt?: Date | string;
};

function DetailRow({ label, value }: { label: string; value?: React.ReactNode }) {
    if (value === undefined || value === null || value === "") return null;
    return (
        <div className="py-3 border-b border-zinc-100 last:border-0">
            <dt className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{label}</dt>
            <dd className="text-sm font-medium text-zinc-800">{value}</dd>
        </div>
    );
}

function isPdfUrl(url: string) {
    return url.toLowerCase().includes(".pdf") || url.includes("application/pdf");
}

export default function VendorApplicationDetail({
    application,
    onClose,
    onApprove,
    onReject,
    onDelete,
    actionLoading,
}: {
    application: VendorApplicationRecord;
    onClose: () => void;
    onApprove: () => void;
    onReject: () => void;
    onDelete?: () => void;
    actionLoading?: boolean;
}) {
    const socials: Array<{ platform: string; handle: string }> = application.socialHandles?.length
        ? application.socialHandles
              .map((h) => {
                  if (typeof h === "string") {
                      const trimmed = h.trim();
                      return trimmed ? { platform: "Social", handle: trimmed } : null;
                  }
                  if (h.platform && h.handle) return { platform: h.platform, handle: h.handle };
                  return null;
              })
              .filter((x): x is { platform: string; handle: string } => x !== null)
        : application.instagram
          ? [{ platform: "Instagram", handle: application.instagram }]
          : [];

    const certUrl = application.registrationCertificateUrl;
    const logoUrl = application.logoUrl;
    const sampleUrl = application.sampleProductImageUrl;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <button
                type="button"
                className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
                onClick={onClose}
                aria-label="Close"
            />
            <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
                    <div>
                        <h2 className="text-xl font-black text-zinc-900">{application.businessName}</h2>
                        <p className="text-sm text-zinc-500 capitalize">{application.status} application</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-zinc-100 text-zinc-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="grid gap-6 md:grid-cols-2">
                        <section>
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                                Contact
                            </h3>
                            <dl>
                                <DetailRow label="Contact person" value={application.contactPerson} />
                                <DetailRow
                                    label="Email"
                                    value={
                                        application.email ? (
                                            <a href={`mailto:${application.email}`} className="text-emerald-700 hover:underline">
                                                {application.email}
                                            </a>
                                        ) : null
                                    }
                                />
                                <DetailRow label="Phone" value={application.phone} />
                            </dl>
                        </section>

                        <section>
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                                Business
                            </h3>
                            <dl>
                                <DetailRow
                                    label="Category"
                                    value={
                                        application.category === "Other" && application.categoryOther
                                            ? `Other — ${application.categoryOther}`
                                            : application.category
                                    }
                                />
                                <DetailRow
                                    label="Location"
                                    value={
                                        application.businessLocationType === "onsite"
                                            ? `On-site — ${application.businessAddress || "—"}`
                                            : "Online only"
                                    }
                                />
                                <DetailRow label="Description" value={application.description} />
                            </dl>
                        </section>
                    </div>

                    {socials.length > 0 && (
                        <section className="mt-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                                Social handles
                            </h3>
                            <ul className="space-y-2">
                                {socials.map((h, i) => (
                                    <li
                                        key={i}
                                        className="rounded-xl bg-zinc-100 px-3 py-2 text-sm text-zinc-800"
                                    >
                                        <span className="font-bold text-zinc-900">{h.platform}</span>
                                        <span className="text-zinc-500"> · </span>
                                        {h.handle}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {(logoUrl || sampleUrl || certUrl) && (
                        <section className="mt-6 grid gap-4 sm:grid-cols-2">
                            {logoUrl && (
                                <div className="rounded-2xl border border-zinc-200 overflow-hidden bg-zinc-50">
                                    <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-100 bg-white">
                                        <ImageIcon className="h-4 w-4 text-zinc-500" />
                                        <span className="text-xs font-bold text-zinc-700">Store logo</span>
                                    </div>
                                    <a href={logoUrl} target="_blank" rel="noreferrer" className="block">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={logoUrl}
                                            alt="Store logo"
                                            className="max-h-48 w-full object-contain p-4"
                                        />
                                    </a>
                                </div>
                            )}
                            {sampleUrl && (
                                <div className="rounded-2xl border border-zinc-200 overflow-hidden bg-zinc-50">
                                    <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-100 bg-white">
                                        <ImageIcon className="h-4 w-4 text-zinc-500" />
                                        <span className="text-xs font-bold text-zinc-700">Sample product</span>
                                    </div>
                                    <a href={sampleUrl} target="_blank" rel="noreferrer" className="block">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={sampleUrl}
                                            alt="Sample product"
                                            className="w-full max-h-56 object-contain p-2"
                                        />
                                    </a>
                                </div>
                            )}
                            {certUrl && (
                                <div className="rounded-2xl border border-zinc-200 overflow-hidden bg-zinc-50">
                                    <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-100 bg-white">
                                        <FileText className="h-4 w-4 text-zinc-500" />
                                        <span className="text-xs font-bold text-zinc-700">Registration certificate</span>
                                    </div>
                                    {isPdfUrl(certUrl) ? (
                                        <div className="p-6 text-center">
                                            <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                                            <a
                                                href={certUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:underline"
                                            >
                                                Open PDF
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>
                                    ) : (
                                        <a href={certUrl} target="_blank" rel="noreferrer" className="block">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={certUrl}
                                                alt="Registration certificate"
                                                className="w-full max-h-56 object-contain p-2"
                                            />
                                        </a>
                                    )}
                                </div>
                            )}
                        </section>
                    )}

                    <section className="mt-6 rounded-2xl bg-zinc-50 border border-zinc-100 p-4">
                        <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
                            <CreditCard className="h-4 w-4" />
                            Payment details
                        </h3>
                        <dl>
                            <DetailRow label="Method" value={application.payoutMethod} />
                            {application.payoutMethod === "Bank Transfer" ? (
                                <>
                                    <DetailRow label="Bank" value={application.bankName} />
                                    <DetailRow label="Branch" value={application.branch} />
                                    <DetailRow label="Account number" value={application.accountNumber} />
                                    <DetailRow label="Account name" value={application.accountName} />
                                </>
                            ) : (
                                <>
                                    <DetailRow label="Network" value={application.momoNetwork} />
                                    <DetailRow label="MoMo number" value={application.momoNumber} />
                                </>
                            )}
                        </dl>
                    </section>
                </div>

                {application.status === "pending" && (
                    <div className="flex gap-3 border-t border-zinc-100 p-4 bg-white">
                        <button
                            type="button"
                            disabled={actionLoading}
                            onClick={onReject}
                            className="flex-1 py-3 rounded-2xl border border-red-200 text-red-600 font-bold hover:bg-red-50 disabled:opacity-50"
                        >
                            Reject
                        </button>
                        <button
                            type="button"
                            disabled={actionLoading}
                            onClick={onApprove}
                            className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50"
                        >
                            Approve
                        </button>
                    </div>
                )}
                {application.status === "rejected" && onDelete && (
                    <div className="flex gap-3 border-t border-zinc-100 p-4 bg-white">
                        <button
                            type="button"
                            disabled={actionLoading}
                            onClick={onDelete}
                            className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Application
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
