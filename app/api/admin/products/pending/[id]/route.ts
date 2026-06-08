import { NextResponse } from "next/server";
import {
    adminUpdateProductApproval,
    getAdminDb,
    adminGetVendor,
    adminGetUserProfile,
} from "@/lib/firestore-admin";
import { sendEmail, getProductApprovedEmail, getProductRejectedEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const { id } = await Promise.resolve(params);
        const body = await req.json();
        const { action, reason } = body;

        if (!action || !["approve", "reject"].includes(action)) {
            return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
        }

        // Fetch vendor details BEFORE updating/deleting/modifying details,
        // or fetch now to ensure we have vendorId and productName.
        let vendorId: string | undefined;
        let productName = "your product";
        try {
            const db = getAdminDb();
            const productSnap = await db.collection("products").doc(id).get();
            if (productSnap.exists) {
                const productData = productSnap.data();
                vendorId = productData?.vendorId;
                productName = productData?.name || productName;
            }
        } catch (fetchErr) {
            console.error("Failed to fetch product details for email notification:", fetchErr);
        }

        const result = await adminUpdateProductApproval(id, action, reason);
        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error || "Failed to update product" },
                { status: 500 }
            );
        }

        // If product has a vendor, notify the vendor of approval/rejection via email
        if (vendorId) {
            try {
                const vendor = await adminGetVendor(vendorId);
                if (vendor?.ownerUserId) {
                    const userProfile = await adminGetUserProfile(vendor.ownerUserId);
                    if (userProfile?.email) {
                        const contactName = `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() || "Seller";
                        const recipientEmail = userProfile.email.trim().toLowerCase();
                        
                        if (action === "approve") {
                            const emailHtml = getProductApprovedEmail(contactName, productName);
                            await sendEmail(
                                recipientEmail,
                                `Product Approved & Live - ${productName}`,
                                emailHtml
                            );
                        } else if (action === "reject") {
                            const emailHtml = getProductRejectedEmail(contactName, productName, reason);
                            await sendEmail(
                                recipientEmail,
                                `Product Listing Update - ${productName}`,
                                emailHtml
                            );
                        }
                    }
                }
            } catch (emailErr) {
                console.error("Failed to send product status notification email:", emailErr);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to update product";
        console.error("PATCH /api/admin/products/pending/[id]:", error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
