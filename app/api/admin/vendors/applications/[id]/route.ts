import { NextResponse } from "next/server";
import { approveVendorApplication, rejectVendorApplication } from "@/lib/vendor-applications";

export const runtime = "nodejs";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const { id } = await Promise.resolve(params);
        const body = await req.json();
        const { status } = body;

        if (!status || !["approved", "rejected"].includes(status)) {
            return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
        }

        const result =
            status === "approved"
                ? await approveVendorApplication(id)
                : await rejectVendorApplication(id);

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
