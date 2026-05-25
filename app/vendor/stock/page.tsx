"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import type { Product } from "@/lib/firestore";
import { useToast } from "@/app/components/ui/ToastContainer";
import VendorSizePicker, { ONE_SIZE } from "@/app/components/vendor/VendorSizePicker";
import {
    DEFAULT_COLOR_ID,
    normalizeStockVariants,
    productColors,
    totalVariantStock,
    type StockVariant,
    variantKey,
} from "@/lib/stock-variants";
import { sortSizes } from "@/lib/sizes";
import { isApparelJerseyCategory, showsProductColorPicker } from "@/lib/product-category";
import { Boxes, Plus, Save, X } from "lucide-react";

type ColorRow = { id: string; name: string; hex: string };

export default function VendorStockPage() {
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedId, setSelectedId] = useState<string>(searchParams.get("product") ?? "");
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingStock, setLoadingStock] = useState(false);
    const [saving, setSaving] = useState(false);

    const [variants, setVariants] = useState<StockVariant[]>([]);
    const [colors, setColors] = useState<ColorRow[]>([]);
    const [presetSizes, setPresetSizes] = useState<string[]>([]);
    const [customSizes, setCustomSizes] = useState<string[]>([]);
    const [newColorName, setNewColorName] = useState("");
    const [newColorHex, setNewColorHex] = useState("#64748b");
    const [simpleStock, setSimpleStock] = useState(0);
    const [productCategory, setProductCategory] = useState("");

    const loadProducts = useCallback(async () => {
        setLoadingProducts(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch("/api/vendor/products", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (data.success) {
                const list: Product[] = data.products || [];
                setProducts(list);
                if (!selectedId && list.length > 0) setSelectedId(list[0].id);
            }
        } catch {
            showToast("Failed to load products", "error");
        } finally {
            setLoadingProducts(false);
        }
    }, [showToast]);

    const loadStock = useCallback(
        async (productId: string) => {
            if (!productId) return;
            setLoadingStock(true);
            try {
                const token = await auth.currentUser?.getIdToken();
                const res = await fetch(`/api/vendor/products/${productId}/stock`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.error || "Failed to load stock");

                const p = data.product;
                const preset = (p.sizes as string[]) ?? [];
                const custom = (p.customSizes as string[]) ?? [];
                const presetOnly = preset.filter((s: string) => !custom.includes(s));

                setPresetSizes(presetOnly);
                setCustomSizes(custom);
                setColors(p.colors?.length ? productColors({ colors: p.colors }) : []);
                setVariants(data.stockVariants ?? []);
            } catch (e: unknown) {
                showToast(e instanceof Error ? e.message : "Failed to load stock", "error");
            } finally {
                setLoadingStock(false);
            }
        },
        [showToast]
    );

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    useEffect(() => {
        if (selectedId) loadStock(selectedId);
    }, [selectedId, loadStock]);

    const allSizes = useMemo(
        () => sortSizes([...new Set([...presetSizes, ...customSizes])]),
        [presetSizes, customSizes]
    );

    const variantMap = useMemo(() => {
        const map = new Map<string, number>();
        for (const v of variants) map.set(variantKey(v.colorId, v.size), v.stock);
        return map;
    }, [variants]);

    const rebuildVariants = useCallback(
        (nextColors: ColorRow[], nextSizes: string[], prev: StockVariant[]) => {
            const existing = new Map(prev.map((v) => [variantKey(v.colorId, v.size), v.stock]));
            const rows: StockVariant[] = [];
            for (const color of nextColors) {
                for (const size of nextSizes) {
                    rows.push({
                        colorId: color.id,
                        size,
                        stock: existing.get(variantKey(color.id, size)) ?? 0,
                    });
                }
            }
            return rows;
        },
        []
    );

    const setCellStock = (colorId: string, size: string, stock: number) => {
        setVariants((prev) =>
            prev.map((v) =>
                v.colorId === colorId && v.size === size
                    ? { ...v, stock: Math.max(0, Math.floor(stock) || 0) }
                    : v
            )
        );
    };

    const addColor = () => {
        const name = newColorName.trim();
        if (!name) return;
        const id = name.toLowerCase().replace(/\s+/g, "-").replace(/^#/, "");
        if (colors.some((c) => c.id === id)) {
            showToast("Color already exists", "error");
            return;
        }
        const next = [...colors, { id, name, hex: newColorHex }];
        setColors(next);
        setVariants((prev) => rebuildVariants(next, allSizes, prev));
        setNewColorName("");
    };

    const removeColor = (id: string) => {
        const next = colors.filter((c) => c.id !== id);
        setColors(next);
        setVariants((prev) =>
            next.length > 0 ? rebuildVariants(next, allSizes, prev.filter((v) => v.colorId !== id)) : []
        );
    };

    const useSimpleStockOnly = allSizes.length === 0;
    /** One implicit row when sizes exist but no color variants were added */
    const colorsForGrid = useMemo(
        () =>
            colors.length > 0
                ? colors
                : [{ id: DEFAULT_COLOR_ID, name: "Quantity", hex: "#e4e4e7" }],
        [colors]
    );

    const handleSave = async () => {
        if (!selectedId || useSimpleStockOnly) return;
        setSaving(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const normalized = normalizeStockVariants({
                colors: colors.length > 0 ? colors : undefined,
                sizes: allSizes,
                customSizes,
                stockVariants: variants,
            });
            const res = await fetch(`/api/vendor/products/${selectedId}/stock`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    stockVariants: normalized,
                    sizes: allSizes,
                    customSizes,
                    colors: colors.length > 0 ? colors : undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || "Save failed");
            showToast(`Stock saved (${data.totalStock} units total)`, "success");
            setVariants(data.product?.stockVariants ?? normalized);
            loadProducts();
        } catch (e: unknown) {
            showToast(e instanceof Error ? e.message : "Save failed", "error");
        } finally {
            setSaving(false);
        }
    };

    const selectedProduct = products.find((p) => p.id === selectedId);
    const isJersey = isApparelJerseyCategory(selectedProduct?.category ?? productCategory);
    const showColorManagement = isJersey || showsProductColorPicker(colors);
    const totalUnits = totalVariantStock(variants);

    const saveSimpleStock = async () => {
        if (!selectedId) return;
        setSaving(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch(`/api/vendor/products/${selectedId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ stock: simpleStock }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || "Save failed");
            showToast(`Stock saved (${simpleStock} units)`, "success");
            loadProducts();
        } catch (e: unknown) {
            showToast(e instanceof Error ? e.message : "Save failed", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Stock management</h1>
                    <p className="mt-1 text-sm text-zinc-600">
                        Sizes and colors are optional. Use total units when you sell without variants, or add sizes
                        (and colors) for a quantity grid.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={useSimpleStockOnly ? saveSimpleStock : handleSave}
                    disabled={saving || !selectedId}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-red)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving…" : "Save stock"}
                </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Products</p>
                    {loadingProducts ? (
                        <p className="text-sm text-zinc-500">Loading…</p>
                    ) : products.length === 0 ? (
                        <p className="text-sm text-zinc-500">
                            No products yet.{" "}
                            <Link href="/vendor/products/new" className="text-[var(--brand-red)] hover:underline">
                                Add one
                            </Link>
                        </p>
                    ) : (
                        <ul className="max-h-[480px] space-y-1 overflow-y-auto">
                            {products.map((p) => (
                                <li key={p.id}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedId(p.id)}
                                        className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                                            selectedId === p.id
                                                ? "bg-[var(--brand-red)]/10 font-semibold text-[var(--brand-red)]"
                                                : "text-zinc-700 hover:bg-zinc-50"
                                        }`}
                                    >
                                        <span className="line-clamp-2">{p.name}</span>
                                        <span className="mt-0.5 block text-xs text-zinc-500">
                                            {p.stockVariants?.length
                                                ? `${totalVariantStock(p.stockVariants)} units (variants)`
                                                : `${p.stock ?? 0} units`}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="space-y-6">
                    {!selectedProduct ? (
                        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white">
                            <Boxes className="h-10 w-10 text-zinc-300" />
                        </div>
                    ) : loadingStock ? (
                        <p className="text-sm text-zinc-500">Loading stock grid…</p>
                    ) : (
                        <>
                            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                                <h2 className="font-semibold text-zinc-900">{selectedProduct.name}</h2>
                                <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
                                    {selectedProduct.category}
                                    {isJersey ? " · Jersey" : " · General"}
                                </p>
                                <p className="mt-1 text-sm text-zinc-500">
                                    {allSizes.length === 0 ? (
                                        <>
                                            Total units: <strong>{simpleStock}</strong>
                                        </>
                                    ) : (
                                        <>
                                            Total in grid: <strong>{totalUnits}</strong> units
                                            {showColorManagement
                                                ? ` across ${colors.length} color${colors.length !== 1 ? "s" : ""}`
                                                : ""}{" "}
                                            × {allSizes.length} size{allSizes.length !== 1 ? "s" : ""}
                                        </>
                                    )}
                                </p>
                            </div>

                            {useSimpleStockOnly ? (
                                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                                    <label className="text-sm font-semibold text-zinc-900">Total units in stock</label>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        No sizes on this product — track a single quantity here. Add sizes on the product
                                        form if you need per-size stock later.
                                    </p>
                                    <input
                                        type="number"
                                        min={0}
                                        value={simpleStock}
                                        onChange={(e) => setSimpleStock(Math.max(0, Number(e.target.value) || 0))}
                                        className="mt-3 w-32 rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                                    />
                                </div>
                            ) : (
                            <>
                            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                                <VendorSizePicker
                                    selectedSizes={presetSizes}
                                    customSizes={customSizes}
                                    onTogglePreset={(size) => {
                                        const nextPreset = presetSizes.includes(size)
                                            ? presetSizes.filter((s) => s !== size)
                                            : [...presetSizes, size];
                                        const nextSizes = sortSizes([...new Set([...nextPreset, ...customSizes])]);
                                        setPresetSizes(nextPreset);
                                        setVariants((prev) => rebuildVariants(colorsForGrid, nextSizes, prev));
                                    }}
                                    onAddCustomSize={(size) => {
                                        if (customSizes.includes(size) || presetSizes.includes(size)) {
                                            showToast("Size already added", "error");
                                            return;
                                        }
                                        const nextCustom = [...customSizes, size];
                                        const nextSizes = sortSizes([...new Set([...presetSizes, ...nextCustom])]);
                                        setCustomSizes(nextCustom);
                                        setVariants((prev) => rebuildVariants(colorsForGrid, nextSizes, prev));
                                    }}
                                    onRemoveCustomSize={(size) => {
                                        const nextCustom = customSizes.filter((s) => s !== size);
                                        const nextSizes = sortSizes([...new Set([...presetSizes, ...nextCustom])]);
                                        setCustomSizes(nextCustom);
                                        setVariants((prev) => rebuildVariants(colorsForGrid, nextSizes, prev));
                                    }}
                                    onUseOneSize={() => {
                                        setPresetSizes([ONE_SIZE]);
                                        setCustomSizes([]);
                                        setVariants((prev) => rebuildVariants(colorsForGrid, [ONE_SIZE], prev));
                                    }}
                                />
                            </div>

                            {showColorManagement && (
                            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
                                <p className="text-sm font-semibold text-zinc-900">
                                    {isJersey ? "Colors" : "Variants (optional)"}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {colors.map((c) => (
                                        <span
                                            key={c.id}
                                            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium"
                                        >
                                            <span
                                                className="h-4 w-4 rounded-full border"
                                                style={{ backgroundColor: c.hex }}
                                            />
                                            {c.name}
                                            {colors.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeColor(c.id)}
                                                    className="text-zinc-400 hover:text-red-600"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <input
                                        value={newColorName}
                                        onChange={(e) => setNewColorName(e.target.value)}
                                        placeholder="Color name"
                                        className="flex-1 min-w-[120px] rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                                    />
                                    <input
                                        type="color"
                                        value={newColorHex}
                                        onChange={(e) => setNewColorHex(e.target.value)}
                                        className="h-10 w-12 cursor-pointer rounded border border-zinc-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={addColor}
                                        className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium"
                                    >
                                        <Plus className="h-4 w-4" /> Add color
                                    </button>
                                </div>
                            </div>
                            )}

                            {allSizes.length > 0 ? (
                                <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-zinc-100 bg-zinc-50">
                                                <th className="sticky left-0 z-10 bg-zinc-50 px-4 py-3 text-left font-semibold text-zinc-700">
                                                    {showColorManagement ? "Color / Size" : "Size"}
                                                </th>
                                                {allSizes.map((size) => (
                                                    <th
                                                        key={size}
                                                        className="min-w-[88px] px-3 py-3 text-center font-semibold text-zinc-700"
                                                    >
                                                        {size}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-50">
                                            {colorsForGrid.map((color) => (
                                                <tr key={color.id}>
                                                    <td className="sticky left-0 z-10 bg-white px-4 py-3 font-medium text-zinc-900">
                                                        {showColorManagement ? (
                                                            <span className="inline-flex items-center gap-2">
                                                                <span
                                                                    className="h-4 w-4 rounded-full border"
                                                                    style={{ backgroundColor: color.hex }}
                                                                />
                                                                {color.name}
                                                            </span>
                                                        ) : (
                                                            "Quantity"
                                                        )}
                                                    </td>
                                                    {allSizes.map((size) => {
                                                        const stock =
                                                            variantMap.get(variantKey(color.id, size)) ?? 0;
                                                        return (
                                                            <td key={size} className="px-2 py-2 text-center">
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    value={stock}
                                                                    onChange={(e) =>
                                                                        setCellStock(
                                                                            color.id,
                                                                            size,
                                                                            Number(e.target.value)
                                                                        )
                                                                    }
                                                                    className="w-16 rounded-lg border border-zinc-200 px-2 py-1.5 text-center text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-red)]/30"
                                                                />
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-zinc-500">Add at least one size to manage quantities.</p>
                            )}
                            </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
