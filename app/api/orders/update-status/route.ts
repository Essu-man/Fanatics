import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus, getOrder } from "@/lib/database";
import {
    getOrderStatusEmail,
    getOrderStatusSMS,
    sendEmail,
    sendSMS,
} from "@/lib/arkesel";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId, status, customerEmail, customerPhone, customerName } = body;

        if (!orderId || !status) {
            return NextResponse.json(
                { error: "Order ID and status are required" },
                { status: 400 }
            );
        }

        // Update order status in Supabase
        const result = await updateOrderStatus(orderId, status);

        if (!result.success) {
            return NextResponse.json(
                { error: "Failed to update order status", details: result.error },
                { status: 500 }
            );
        }

        // Generate tracking link
        const trackingLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/track/${orderId}`;

        // Send email notification
        if (customerEmail) {
            const emailHtml = getOrderStatusEmail(
                customerName || "Customer",
                orderId,
                status,
                trackingLink
            );

            await sendEmail(
                customerEmail,
                `Order Update - ${orderId}`,
                emailHtml
            );
        }

        // Send SMS notification
        if (customerPhone) {
            const smsMessage = getOrderStatusSMS(orderId, status, trackingLink);
            await sendSMS(customerPhone, smsMessage);
        }

        return NextResponse.json({
            success: true,
            message: "Order status updated and notifications sent",
        });
    } catch (error: any) {
        console.error("Update order status error:", error);
        return NextResponse.json(
            { error: "Failed to update order status", details: error.message },
            { status: 500 }
        );
    }
}
