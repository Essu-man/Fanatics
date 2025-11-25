import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus, getOrder } from "@/lib/firestore";
import {
    getOrderStatusEmail,
    getOrderStatusSMS,
    sendEmail,
    sendSMS,
} from "@/lib/frogwigal";

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

        // Send email notification (non-blocking - don't fail status update if email fails)
        if (customerEmail) {
            try {
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
            } catch (emailError) {
                console.error("Failed to send email notification:", emailError);
                // Don't fail the status update if email fails
            }
        }

        // Send SMS notification (non-blocking - don't fail status update if SMS fails)
        if (customerPhone) {
            try {
                const smsMessage = getOrderStatusSMS(orderId, status, trackingLink);
                await sendSMS(customerPhone, smsMessage);
            } catch (smsError) {
                console.error("Failed to send SMS notification:", smsError);
                // Don't fail the status update if SMS fails
            }
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
