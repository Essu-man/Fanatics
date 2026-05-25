import { NextResponse } from "next/server";
import { getStoreCategories } from "@/lib/firestore";
import { adminGetStoreCategories } from "@/lib/firestore-admin";
import { defaultStoreCategories, type CategoryOption } from "@/lib/product-category";

export const runtime = "nodejs";

async function loadCategories(): Promise<CategoryOption[]> {
    let categories = await adminGetStoreCategories();
    if (categories.length === 0) {
        const clientCategories = await getStoreCategories();
        categories = clientCategories;
    }
    if (categories.length === 0) {
        return defaultStoreCategories();
    }
    return categories.map((c, index) => ({
        id: c.id,
        name: c.name,
        slug: c.slug || c.name.toLowerCase().replace(/\s+/g, "-"),
        order: c.order ?? index,
    }));
}

export async function GET() {
    try {
        const categories = await loadCategories();
        return NextResponse.json({ success: true, categories });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to load categories";
        return NextResponse.json(
            { success: true, categories: defaultStoreCategories(), fallback: true, error: message }
        );
    }
}
