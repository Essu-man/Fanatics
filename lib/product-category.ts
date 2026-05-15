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
