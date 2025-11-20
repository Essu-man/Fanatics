import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/database";

export async function GET(
    request: NextRequest,
    { params }: { params: { orderId: string } }
) {
    try {
        const { orderId } = params;

        if (!orderId) {
            return NextResponse.json(
                { error: "Order ID is required" },
                { status: 400 }
            );
        }

        const order = await getOrder(orderId);

        if (!order) {
            return NextResponse.json(
                { success: false, error: "Order not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            order,
        });
    } catch (error: any) {
        console.error("Get order error:", error);
        return NextResponse.json(
            { error: "Failed to fetch order", details: error.message },
            { status: 500 }
        );
    }
}
