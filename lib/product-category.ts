/**
 * Categories that require team/league resolution (jersey & apparel flows).
 * Extend APPAREL_JERSEY_CATEGORIES as you add apparel types in admin/vendor UIs.
 */
export const APPAREL_JERSEY_CATEGORIES = new Set<string>(["Jersey"]);

/** Marketplace category options used in admin / vendor product forms */
export const MARKETPLACE_CATEGORIES = [
    "Jersey",
    "Trainers",
    "Cosmetics",
    "Gadgets",
    "Other",
] as const;

export type MarketplaceCategory = (typeof MARKETPLACE_CATEGORIES)[number];

export function isApparelJerseyCategory(category: string | undefined): boolean {
    if (!category) return false;
    const normalized = category.trim();
    return APPAREL_JERSEY_CATEGORIES.has(normalized);
}

/** Adult vs children size category step (jerseys with both size lists). */
export function usesAdultChildSizePicker(
    category: string | undefined,
    product: { sizes?: string[]; childrenSizes?: string[] }
): boolean {
    if (!isApparelJerseyCategory(category)) return false;
    const hasAdult = (product.sizes?.length ?? 0) > 0;
    const hasChild = (product.childrenSizes?.length ?? 0) > 0;
    return hasAdult && hasChild;
}

/** Hide the placeholder default swatch on general marketplace items. */
export function showsProductColorPicker(
    colors?: Array<{ id: string; name?: string }> | null
): boolean {
    if (!colors?.length) return false;
    if (colors.length === 1 && colors[0].id === "default") return false;
    return true;
}

export type CategoryOption = { id: string; name: string; slug: string; order: number };

/** Default options when Firestore `store_categories` is empty or unavailable */
export function defaultStoreCategories(): CategoryOption[] {
    return MARKETPLACE_CATEGORIES.map((name, order) => ({
        id: `default-${name.toLowerCase().replace(/\s+/g, "-")}`,
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        order,
    }));
}

export function categoryNamesFromOptions(
    categories: Array<{ name?: string }> | null | undefined
): string[] {
    if (!categories?.length) return [...MARKETPLACE_CATEGORIES];
    const names = categories
        .map((c) => (typeof c.name === "string" ? c.name.trim() : ""))
        .filter(Boolean);
    return names.length > 0 ? names : [...MARKETPLACE_CATEGORIES];
}
