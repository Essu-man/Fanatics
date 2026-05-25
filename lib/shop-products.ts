import type { Product } from "@/lib/firestore";
import type { Product as ShopProduct } from "@/lib/products";
import { totalVariantStock } from "@/lib/stock-variants";

/** Whether a product should appear on the public shop, carousel, etc. */
export function isListedInShop(
    p: Pick<
        Product,
        "status" | "images" | "available" | "stock" | "stockVariants"
    >
): boolean {
    if (p.status === "pending" || p.status === "rejected") return false;
    if (!p.images?.length) return false;
    if (p.available === false) return false;
    if (p.stockVariants?.length) return totalVariantStock(p.stockVariants) > 0;
    return (p.stock ?? 0) > 0;
}

function serializeCreatedAt(value: Product["createdAt"]): string | null {
    if (!value) return null;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "string") return value;
    return null;
}

export function toShopProduct(p: Product): ShopProduct & { createdAt?: string | null } {
    return {
        id: p.id,
        name: p.name,
        team: p.team,
        league: p.league,
        category: p.category,
        price: p.price,
        childrenPrice: p.childrenPrice,
        salePrice: p.salePrice,
        images: p.images ?? [],
        colors: p.colors,
        sizes: p.sizes,
        childrenSizes: p.childrenSizes,
        customSizes: p.customSizes,
        stockVariants: p.stockVariants,
        stock: p.stock,
        childrenStock: p.childrenStock,
        available: p.available,
        vendorId: p.vendorId,
        vendorName: p.vendorName,
        vendorSlug: p.vendorSlug,
        description: p.description,
        createdAt: serializeCreatedAt(p.createdAt),
    };
}

export function filterShopProducts(products: Product[]): ShopProduct[] {
    return products.filter(isListedInShop).map(toShopProduct);
}
