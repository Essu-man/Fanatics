import { NextResponse } from "next/server";
import { getProducts, getProductsByTeam, createProduct, getVendor } from "@/lib/firestore";
import {
    buildProductFirestorePayload,
    validateProductCreateBase,
    vendorDisplayName,
} from "@/lib/products-shared";

export const runtime = "nodejs";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const teamId = searchParams.get("teamId");

        const products = teamId ? await getProductsByTeam(teamId) : await getProducts();

        return NextResponse.json({
            success: true,
            products,
        });
    } catch (error: any) {
        console.error("Failed to fetch admin products:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to load products" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
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
            vendorId: bodyVendorId,
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

        let vendorId: string | undefined =
            typeof bodyVendorId === "string" && bodyVendorId.trim() ? bodyVendorId.trim() : undefined;
        let vendorName: string | undefined;

        let vendorSlug: string | undefined;
        if (vendorId) {
            const v = await getVendor(vendorId);
            if (!v) {
                return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 400 });
            }
            vendorName = vendorDisplayName(v);
            vendorSlug = v.slug;
        }

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
            category: category || "Jersey",
            teamId: typeof teamId === "string" ? teamId : undefined,
            description,
            images,
            colors: Array.isArray(colors) && colors.length > 0 ? colors : undefined,
            sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : undefined,
            childrenSizes: Array.isArray(childrenSizes) && childrenSizes.length > 0 ? childrenSizes : undefined,
            vendorId,
            vendorName,
            vendorSlug,
        });

        const result = await createProduct(payload);
        if (!result.success) {
            throw new Error(result.error || "Failed to create product");
        }

        return NextResponse.json({
            success: true,
            productId: result.id,
        });
    } catch (error: any) {
        console.error("Failed to create product:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to create product" },
            { status: 500 }
        );
    }
}
