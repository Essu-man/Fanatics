import { NextResponse } from "next/server";
import { getProduct, updateProduct } from "@/lib/firestore";
import { requireVendorAuthDetailed } from "@/lib/api-auth";
import {
    aggregateLegacyStock,
    normalizeStockVariants,
    parseStockVariantsInput,
    productAdultSizes,
    totalVariantStock,
} from "@/lib/stock-variants";
import { sortSizes } from "@/lib/sizes";

export const runtime = "nodejs";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ productId: string }> | { productId: string } }
) {
    const authResult = await requireVendorAuthDetailed(request);
    if (!authResult.ok) {
        return NextResponse.json(
            { success: false, error: authResult.error, code: authResult.code },
            { status: authResult.status }
        );
    }
    const auth = authResult.auth;

    try {
        const { productId } = await Promise.resolve(params);
        const existing = await getProduct(productId);
        if (!existing) {
            return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
        }
        if (existing.vendorId !== auth.vendorId) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const parsedVariants = parseStockVariantsInput(body.stockVariants);
        if (!parsedVariants) {
            return NextResponse.json({ success: false, error: "stockVariants array is required" }, { status: 400 });
        }

        let sizes = existing.sizes ?? [];
        let customSizes = existing.customSizes ?? [];
        let colors = existing.colors;

        if (Array.isArray(body.sizes)) {
            sizes = body.sizes.map((s: string) => String(s).trim()).filter(Boolean);
        }
        if (Array.isArray(body.customSizes)) {
            customSizes = body.customSizes.map((s: string) => String(s).trim()).filter(Boolean);
        }
        if (Array.isArray(body.colors) && body.colors.length > 0) {
            colors = body.colors;
        }

        const mergedSizes = sortSizes([
            ...new Set([...sizes, ...customSizes]),
        ]);

        if (mergedSizes.length === 0) {
            return NextResponse.json(
                { success: false, error: "Add at least one size before managing stock" },
                { status: 400 }
            );
        }

        const normalized = normalizeStockVariants({
            colors,
            sizes: mergedSizes,
            customSizes,
            childrenSizes: existing.childrenSizes,
            stockVariants: parsedVariants,
        });

        const legacy = aggregateLegacyStock(
            { sizes: mergedSizes, customSizes, childrenSizes: existing.childrenSizes },
            normalized
        );

        const result = await updateProduct(productId, {
            sizes: mergedSizes,
            customSizes: customSizes.length > 0 ? customSizes : undefined,
            colors,
            stockVariants: normalized,
            stock: legacy.stock,
            childrenStock: legacy.childrenStock,
            available: totalVariantStock(normalized) > 0,
        });

        if (!result.success) {
            throw new Error(result.error || "Failed to update stock");
        }

        const product = await getProduct(productId);
        return NextResponse.json({
            success: true,
            product,
            totalStock: totalVariantStock(normalized),
        });
    } catch (error: unknown) {
        console.error("Vendor stock PATCH:", error);
        const message = error instanceof Error ? error.message : "Unable to update stock";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

/** Initialize variant grid from product definition (zeros). */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ productId: string }> | { productId: string } }
) {
    const authResult = await requireVendorAuthDetailed(request);
    if (!authResult.ok) {
        return NextResponse.json(
            { success: false, error: authResult.error, code: authResult.code },
            { status: authResult.status }
        );
    }
    const auth = authResult.auth;

    try {
        const { productId } = await Promise.resolve(params);
        const product = await getProduct(productId);
        if (!product) {
            return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
        }
        if (product.vendorId !== auth.vendorId) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        const variants =
            product.stockVariants?.length
                ? product.stockVariants
                : normalizeStockVariants(product);

        return NextResponse.json({
            success: true,
            product: {
                id: product.id,
                name: product.name,
                category: product.category,
                images: product.images,
                colors: product.colors,
                sizes: productAdultSizes(product),
                customSizes: product.customSizes ?? [],
                childrenSizes: product.childrenSizes ?? [],
                stock: product.stock ?? 0,
            },
            stockVariants: variants,
            totalStock: totalVariantStock(variants),
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to load stock";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
