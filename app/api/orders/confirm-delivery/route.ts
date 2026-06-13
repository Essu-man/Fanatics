import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus, getOrder } from "@/lib/firestore";
import { sendEmail } from "@/lib/email";
import { clearPendingBalanceToAvailable } from "@/lib/vendor-ledger";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId, userId } = body;

        if (!orderId) {
            return NextResponse.json(
                { error: "Order ID is required" },
                { status: 400 }
            );
        }

        // Get the order to verify it belongs to the user
        const order = await getOrder(orderId);

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        // Verify the order belongs to the user (if userId is provided)
        if (userId && order.userId !== userId) {
            return NextResponse.json(
                { error: "Unauthorized to confirm delivery for this order" },
                { status: 403 }
            );
        }

        // Update order status to delivered
        const result = await updateOrderStatus(
            orderId,
            "delivered",
            undefined,
            "Delivery confirmed by customer"
        );

        if (!result.success) {
            return NextResponse.json(
                { error: "Failed to update order status", details: result.error },
                { status: 500 }
            );
        }

        // Clear vendor pending balances to available
        try {
            await clearPendingBalanceToAvailable(orderId);
        } catch (ledgerError) {
            console.error("Failed to clear vendor pending balance on delivery:", ledgerError);
        }

        // Optionally send confirmation email
        // This can be implemented later if needed

        return NextResponse.json({
            success: true,
            message: "Order marked as delivered successfully",
        });
    } catch (error: any) {
        console.error("Confirm delivery error:", error);
        return NextResponse.json(
            { error: "Failed to confirm delivery", details: error.message },
            { status: 500 }
        );
    }
}
