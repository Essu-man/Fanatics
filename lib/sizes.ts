/**
 * Utility for handling product size sorting and formatting.
 */

// Logical order for adult sizes
const ADULT_SIZE_ORDER: Record<string, number> = {
    "XS": 10,
    "S": 20,
    "M": 30,
    "L": 40,
    "XL": 50,
    "XXL": 60,
    "2XL": 60,
    "XXXL": 70,
    "3XL": 70,
    "4XL": 80,
    "5XL": 90,
};

// Logical order for children sizes based on the predefined list in admin
const CHILDREN_SIZE_ORDER: Record<string, number> = {
    "1.5-2 yrs (16)": 10,
    "3 yrs (18)": 20,
    "4 yrs (20)": 30,
    "5-6 yrs (22)": 40,
    "7-8 yrs (24)": 50,
    "9-10 yrs (26)": 60,
    "11-12 yrs (28)": 70,
};

/**
 * Normalizes size names for consistent display (e.g., XXL -> 2XL).
 */
export function formatSize(size: string): string {
    if (!size) return "";
    const s = size.toUpperCase().trim();
    if (s === "XXL") return "2XL";
    if (s === "XXXL") return "3XL";
    return size;
}

/**
 * Sorts an array of sizes logically.
 * Handles both adult and children sizes.
 */
export function sortSizes(sizes: string[]): string[] {
    if (!sizes || !Array.isArray(sizes)) return [];

    return [...sizes].sort((a, b) => {
        const orderA = ADULT_SIZE_ORDER[a.toUpperCase()] || CHILDREN_SIZE_ORDER[a] || 999;
        const orderB = ADULT_SIZE_ORDER[b.toUpperCase()] || CHILDREN_SIZE_ORDER[b] || 999;
        
        if (orderA !== orderB) {
            return orderA - orderB;
        }
        
        // Fallback to alphabetical if order is same or unknown
        return a.localeCompare(b);
    });
}
