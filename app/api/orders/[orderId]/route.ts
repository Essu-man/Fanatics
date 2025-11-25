import { NextRequest, NextResponse } from "next/server";
import { getOrder, deleteOrder } from "@/lib/firestore";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;

        console.log("Fetching order with ID:", orderId);

        if (!orderId) {
            return NextResponse.json(
                { error: "Order ID is required" },
                { status: 400 }
            );
        }

        const order = await getOrder(orderId);

        if (!order) {
            console.log("Order not found:", orderId);
            return NextResponse.json(
                { success: false, error: "Order not found" },
                { status: 404 }
            );
        }

        console.log("Order found:", order.id);
        return NextResponse.json({
            success: true,
            order,
        });
    } catch (error: any) {
        console.error("Get order error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        return NextResponse.json(
            { error: "Failed to fetch order", details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;

        if (!orderId) {
            return NextResponse.json(
                { success: false, error: "Order ID is required" },
                { status: 400 }
            );
        }

        const result = await deleteOrder(orderId);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error || "Failed to delete order" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to delete order:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to delete order" },
            { status: 500 }
        );
    }
}
