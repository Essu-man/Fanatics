import { NextResponse } from "next/server";
import { approveVendorApplication, rejectVendorApplication } from "@/lib/vendor-applications";

import { db } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";

export const runtime = "nodejs";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const { id } = await Promise.resolve(params);
        const body = await req.json();
        const { status, reason } = body;

        if (!status || !["approved", "rejected"].includes(status)) {
            return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
        }

        const result =
            status === "approved"
                ? await approveVendorApplication(id)
                : await rejectVendorApplication(id, reason);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error || "Update failed" },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            vendorId: "vendorId" in result ? result.vendorId : undefined,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Server error";
        console.error("Error updating vendor application:", error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const { id } = await Promise.resolve(params);
        if (!id) {
            return NextResponse.json({ success: false, error: "Missing application ID" }, { status: 400 });
        }

        await deleteDoc(doc(db, "vendor_applications", id));
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE /api/admin/vendors/applications/[id]:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to delete application" },
            { status: 500 }
        );
    }
}
