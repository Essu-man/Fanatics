import { NextResponse } from "next/server";
import { adminUpdateProductApproval } from "@/lib/firestore-admin";

export const runtime = "nodejs";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const { id } = await Promise.resolve(params);
        const body = await req.json();
        const { action } = body;

        if (!action || !["approve", "reject"].includes(action)) {
            return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
        }

        const result = await adminUpdateProductApproval(id, action);
        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error || "Failed to update product" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to update product";
        console.error("PATCH /api/admin/products/pending/[id]:", error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
