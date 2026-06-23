import { NextResponse } from "next/server";
import { adminDeleteVendorAndStore, adminPurgeVendorAndAllData } from "@/lib/firestore-admin";

export const runtime = "nodejs";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const { id } = await Promise.resolve(params);
        if (!id) {
            return NextResponse.json({ success: false, error: "Missing vendor ID" }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const purge = searchParams.get("purge") === "true";

        const result = purge
            ? await adminPurgeVendorAndAllData(id)
            : await adminDeleteVendorAndStore(id);
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE /api/admin/vendors/[id]:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to delete vendor" },
            { status: 500 }
        );
    }
}
