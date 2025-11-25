import { NextResponse } from "next/server";
import { updateProduct, deleteProduct, getProduct } from "@/lib/firestore";

export const runtime = "nodejs";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ productId: string }> | { productId: string } }
) {
    try {
        const { productId } = await Promise.resolve(params);
        const product = await getProduct(productId);

        if (!product) {
            return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        console.error("Failed to fetch product:", error);
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
    try {
        const { productId } = await Promise.resolve(params);
        const body = await request.json();

        const result = await updateProduct(productId, body);
        if (!result.success) {
            throw new Error(result.error || "Failed to update product");
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to update product:", error);
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
    try {
        const { productId } = await Promise.resolve(params);

        const result = await deleteProduct(productId);
        if (!result.success) {
            throw new Error(result.error || "Failed to delete product");
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to delete product:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to delete product" },
            { status: 500 }
        );
    }
}


