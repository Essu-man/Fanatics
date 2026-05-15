import { NextResponse } from "next/server";
import { deleteProduct, getProduct, updateProduct } from "@/lib/firestore";
import { requireVendorAuth } from "@/lib/api-auth";
import { buildProductFirestorePayload, validateProductCreateBase, vendorDisplayName } from "@/lib/products-shared";
export const runtime = "nodejs";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ productId: string }> | { productId: string } }
) {
    const auth = await requireVendorAuth(request);
    if (!auth) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { productId } = await Promise.resolve(params);
        const product = await getProduct(productId);

        if (!product) {
            return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
        }
        if (product.vendorId !== auth.vendorId) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        console.error("Vendor product GET:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to load product" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ productId: string }> | { productId: string } }
) {
    const auth = await requireVendorAuth(request);
    if (!auth) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

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
        const {
            name,
            price,
            childrenPrice,
            stock,
            childrenStock,
            available,
            category,
            teamId,
            description,
            images,
            colors,
            sizes,
            childrenSizes,
        } = body;

        const mergedForValidation = {
            name: name ?? existing.name,
            price: price ?? existing.price,
            images: images ?? existing.images,
            sizes: sizes ?? existing.sizes,
            childrenSizes: childrenSizes ?? existing.childrenSizes,
            category: category ?? existing.category,
            teamId: teamId !== undefined ? teamId : existing.teamId,
        };

        const base = validateProductCreateBase(mergedForValidation);
        if (!base.ok) {
            return NextResponse.json({ success: false, error: base.error }, { status: 400 });
        }

        const vendorName = vendorDisplayName(auth.vendor);

        const payload = await buildProductFirestorePayload({
            name: mergedForValidation.name,
            price: Number(mergedForValidation.price),
            childrenPrice:
                childrenPrice !== undefined
                    ? Number(childrenPrice)
                    : existing.childrenPrice !== undefined
                      ? existing.childrenPrice
                      : undefined,
            stock: stock !== undefined ? Number(stock) : existing.stock,
            childrenStock:
                childrenStock !== undefined && childrenStock !== null && childrenStock !== ""
                    ? Number(childrenStock)
                    : existing.childrenStock,
            available: available !== undefined ? Boolean(available) : existing.available,
            category: mergedForValidation.category || "Other",
            teamId: typeof mergedForValidation.teamId === "string" ? mergedForValidation.teamId : undefined,
            description: description ?? existing.description,
            images: Array.isArray(mergedForValidation.images) ? mergedForValidation.images : existing.images,
            colors: colors ?? existing.colors,
            sizes: mergedForValidation.sizes,
            childrenSizes: mergedForValidation.childrenSizes,
            vendorId: auth.vendorId,
            vendorName,
            vendorSlug: auth.vendor.slug,
        });

        const result = await updateProduct(productId, payload);
        if (!result.success) {
            throw new Error(result.error || "Failed to update product");
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Vendor product PATCH:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to update product" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ productId: string }> | { productId: string } }
) {
    const auth = await requireVendorAuth(request);
    if (!auth) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { productId } = await Promise.resolve(params);
        const existing = await getProduct(productId);
        if (!existing) {
            return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
        }
        if (existing.vendorId !== auth.vendorId) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        const result = await deleteProduct(productId);
        if (!result.success) {
            throw new Error(result.error || "Failed to delete product");
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Vendor product DELETE:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to delete product" },
            { status: 500 }
        );
    }
}
