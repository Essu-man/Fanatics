import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/database";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId, email } = body;

        if (!orderId || !email) {
            return NextResponse.json(
                { success: false, error: "Order ID and email are required" },
                { status: 400 }
            );
        }

        // Get the order
        const order = await getOrder(orderId);

        if (!order) {
            return NextResponse.json(
                { success: false, error: "Order not found" },
                { status: 404 }
            );
        }

        // Verify email matches (case-insensitive)
        const orderEmail = order.guest_email || order.shipping?.email || "";
        if (orderEmail.toLowerCase() !== email.toLowerCase()) {
            return NextResponse.json(
                { success: false, error: "Email does not match this order" },
                { status: 403 }
            );
        }

        // Return success with order ID (order details will be fetched on the tracking page)
        // Store email in response so frontend can use it
        return NextResponse.json({
            success: true,
            message: "Order verified",
            orderId,
            email, // Return email so frontend can store it
        });
    } catch (error: any) {
        console.error("Verify guest order error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to verify order", details: error.message },
            { status: 500 }
        );
    }
}

