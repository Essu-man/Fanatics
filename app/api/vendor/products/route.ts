import { NextResponse } from "next/server";
import { createProduct, getProductsByVendorId } from "@/lib/firestore";
import { requireVendorAuth } from "@/lib/api-auth";
import { buildProductFirestorePayload, validateProductCreateBase, vendorDisplayName } from "@/lib/products-shared";

export const runtime = "nodejs";

export async function GET(request: Request) {
    const auth = await requireVendorAuth(request);
    if (!auth) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const products = await getProductsByVendorId(auth.vendorId);
        return NextResponse.json({ success: true, products });
    } catch (error: any) {
        console.error("Vendor products GET:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to load products" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const auth = await requireVendorAuth(request);
    if (!auth) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const {
            name,
            price,
            childrenPrice,
            stock,
            childrenStock,
            available = true,
            category,
            teamId,
            description,
            images,
            colors,
            sizes,
            childrenSizes,
        } = body;

        const base = validateProductCreateBase({
            name,
            price,
            images,
            sizes,
            childrenSizes,
            category,
            teamId,
        });
        if (!base.ok) {
            return NextResponse.json({ success: false, error: base.error }, { status: 400 });
        }

        const vendorName = vendorDisplayName(auth.vendor);

        const payload = await buildProductFirestorePayload({
            name,
            price: Number(price),
            childrenPrice: childrenPrice ? Number(childrenPrice) : undefined,
            stock: Number(stock ?? 0),
            childrenStock:
                childrenStock !== undefined && childrenStock !== null && childrenStock !== ""
                    ? Number(childrenStock)
                    : undefined,
            available: Boolean(available),
            category: category || "Other",
            teamId: typeof teamId === "string" ? teamId : undefined,
            description,
            images,
            colors: Array.isArray(colors) && colors.length > 0 ? colors : undefined,
            sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : undefined,
            childrenSizes: Array.isArray(childrenSizes) && childrenSizes.length > 0 ? childrenSizes : undefined,
            vendorId: auth.vendorId,
            vendorName,
            vendorSlug: auth.vendor.slug,
            approved: false,
            status: "pending",
        });

        const result = await createProduct(payload);
        if (!result.success) {
            throw new Error(result.error || "Failed to create product");
        }

        return NextResponse.json({ success: true, productId: result.id });
    } catch (error: any) {
        console.error("Vendor product create:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to create product" },
            { status: 500 }
        );
    }
}
