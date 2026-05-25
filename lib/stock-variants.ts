import type { Product } from "@/lib/firestore";
import { sortSizes } from "@/lib/sizes";

export type StockVariant = {
    colorId: string;
    size: string;
    stock: number;
};

/** Minimal product fields for stock lookups (shop + firestore shapes). */
export type ProductStockSource = {
    stock?: number;
    childrenStock?: number;
    stockVariants?: StockVariant[];
    childrenSizes?: string[];
};

export const DEFAULT_COLOR_ID = "default";

export function variantKey(colorId: string, size: string): string {
    return `${colorId}::${size}`;
}

export function productColors(product: Pick<Product, "colors">): Array<{ id: string; name: string; hex: string }> {
    if (product.colors?.length) return product.colors;
    return [{ id: DEFAULT_COLOR_ID, name: "Default", hex: "#e4e4e7" }];
}

export function productAdultSizes(product: Pick<Product, "sizes" | "customSizes">): string[] {
    const preset = product.sizes ?? [];
    const custom = product.customSizes ?? [];
    const merged = [...new Set([...preset, ...custom].map((s) => s.trim()).filter(Boolean))];
    return sortSizes(merged);
}

export function productAllSizes(product: Pick<Product, "sizes" | "customSizes" | "childrenSizes">): string[] {
    const adult = productAdultSizes(product);
    const children = product.childrenSizes ?? [];
    return sortSizes([...new Set([...adult, ...children])]);
}

/** Build variant rows for every color × size combination, preserving existing quantities. */
export function normalizeStockVariants(
    product: Pick<Product, "colors" | "sizes" | "customSizes" | "childrenSizes" | "stockVariants">
): StockVariant[] {
    const colors = productColors(product);
    const sizes = productAllSizes(product);
    const existing = new Map(
        (product.stockVariants ?? []).map((v) => [variantKey(v.colorId, v.size), Math.max(0, Number(v.stock) || 0)])
    );

    const variants: StockVariant[] = [];
    for (const color of colors) {
        for (const size of sizes) {
            const key = variantKey(color.id, size);
            variants.push({
                colorId: color.id,
                size,
                stock: existing.get(key) ?? 0,
            });
        }
    }
    return variants;
}

export function totalVariantStock(variants: StockVariant[]): number {
    return variants.reduce((sum, v) => sum + Math.max(0, v.stock), 0);
}

/** Split variant totals into adult stock + optional children stock for legacy fields. */
export function aggregateLegacyStock(
    product: Pick<Product, "sizes" | "customSizes" | "childrenSizes">,
    variants: StockVariant[]
): { stock: number; childrenStock?: number } {
    const childrenSet = new Set(product.childrenSizes ?? []);
    let adult = 0;
    let children = 0;
    for (const v of variants) {
        const qty = Math.max(0, v.stock);
        if (childrenSet.has(v.size)) children += qty;
        else adult += qty;
    }
    const result: { stock: number; childrenStock?: number } = { stock: adult };
    if ((product.childrenSizes?.length ?? 0) > 0) {
        result.childrenStock = children;
    } else if (children > 0 && adult === 0) {
        result.stock = children;
    }
    return result;
}

export function getVariantStock(
    product: ProductStockSource,
    colorId: string | null | undefined,
    size: string,
    sizeCategory?: "adult" | "children" | ""
): number {
    if (product.stockVariants?.length && size) {
        const cid = colorId || DEFAULT_COLOR_ID;
        const match = product.stockVariants.find((v) => v.colorId === cid && v.size === size);
        if (match) return Math.max(0, match.stock);
        return 0;
    }
    const isChildren =
        sizeCategory === "children" || (size && product.childrenSizes?.includes(size));
    if (isChildren && product.childrenStock !== undefined) {
        return Math.max(0, product.childrenStock);
    }
    return Math.max(0, product.stock ?? 0);
}

export function usesVariantStock(product: Pick<ProductStockSource, "stockVariants">): boolean {
    return Array.isArray(product.stockVariants) && product.stockVariants.length > 0;
}

export function decrementVariantStock(
    product: Product,
    colorId: string | null | undefined,
    size: string | undefined,
    quantity: number
): Partial<Product> | null {
    if (!usesVariantStock(product) || !size) return null;

    const cid = colorId || DEFAULT_COLOR_ID;
    const variants = (product.stockVariants ?? []).map((v) => ({ ...v }));
    const idx = variants.findIndex((v) => v.colorId === cid && v.size === size);
    if (idx < 0) return null;

    variants[idx].stock = Math.max(0, variants[idx].stock - quantity);
    const legacy = aggregateLegacyStock(product, variants);
    return {
        stockVariants: variants,
        ...legacy,
        available: totalVariantStock(variants) > 0 ? product.available !== false : false,
    };
}

export function parseStockVariantsInput(raw: unknown): StockVariant[] | null {
    if (!Array.isArray(raw)) return null;
    const variants: StockVariant[] = [];
    for (const row of raw) {
        if (!row || typeof row !== "object") continue;
        const colorId =
            typeof (row as StockVariant).colorId === "string"
                ? (row as StockVariant).colorId.trim()
                : DEFAULT_COLOR_ID;
        const size = typeof (row as StockVariant).size === "string" ? (row as StockVariant).size.trim() : "";
        if (!size) continue;
        variants.push({
            colorId: colorId || DEFAULT_COLOR_ID,
            size,
            stock: Math.max(0, Math.floor(Number((row as StockVariant).stock) || 0)),
        });
    }
    return variants;
}
