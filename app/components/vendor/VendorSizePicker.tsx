"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { sortSizes } from "@/lib/sizes";

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
export const ONE_SIZE = "One Size";

type VendorSizePickerProps = {
    selectedSizes: string[];
    customSizes: string[];
    onTogglePreset: (size: string) => void;
    onAddCustomSize: (size: string) => void;
    onRemoveCustomSize: (size: string) => void;
    onUseOneSize: () => void;
};

export default function VendorSizePicker({
    selectedSizes,
    customSizes,
    onTogglePreset,
    onAddCustomSize,
    onRemoveCustomSize,
    onUseOneSize,
}: VendorSizePickerProps) {
    const [draft, setDraft] = useState("");

    const handleAdd = () => {
        const trimmed = draft.trim();
        if (!trimmed) return;
        onAddCustomSize(trimmed);
        setDraft("");
    };

    const allSelected = sortSizes([...new Set([...selectedSizes, ...customSizes])]);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-zinc-900">Sizes</p>
                <button
                    type="button"
                    onClick={onUseOneSize}
                    className="text-xs font-medium text-[var(--brand-red)] hover:underline"
                >
                    Use &quot;One Size&quot; only
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {PRESET_SIZES.map((size) => (
                    <button
                        key={size}
                        type="button"
                        onClick={() => onTogglePreset(size)}
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
            <div className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50/80 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">Custom size type</p>
                <div className="flex gap-2">
                    <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder='e.g. 28", US 10, 4-5 yrs'
                        className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAdd();
                            }
                        }}
                    />
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                    >
                        <Plus className="h-4 w-4" />
                        Add
                    </button>
                </div>
                {customSizes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {customSizes.map((size) => (
                            <span
                                key={size}
                                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-900"
                            >
                                {size}
                                <button
                                    type="button"
                                    onClick={() => onRemoveCustomSize(size)}
                                    className="text-emerald-700 hover:text-red-600"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
            {allSelected.length > 0 && (
                <p className="text-xs text-zinc-500">Selected: {allSelected.join(", ")}</p>
            )}
        </div>
    );
}
