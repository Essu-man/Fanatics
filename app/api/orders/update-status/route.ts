import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus, getOrder } from "@/lib/firestore";
import { sendEmail, getOrderStatusEmail } from "@/lib/sendgrid";

export const runtime = "nodejs";

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
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cediman.com";
        const trackingLink = `${appUrl}/track/${orderId}`;

        // Get order details for email
        const order = await getOrder(orderId);

        // Send email notification via SendGrid (non-blocking - don't fail status update if email fails)
        if (customerEmail) {
            try {
                const emailHtml = getOrderStatusEmail(
                    customerName || "Customer",
                    orderId,
                    status,
                    trackingLink,
                    order?.orderDate ? (typeof order.orderDate === 'string' ? order.orderDate : order.orderDate.toISOString()) : new Date().toISOString(),
                    order?.total,
                    order?.items
                );

                const emailResult = await sendEmail(
                    customerEmail,
                    `Order Update - ${orderId}`,
                    emailHtml
                );

                if (emailResult.success) {
                    console.log("Order status update email sent successfully");
                } else {
                    console.error("Failed to send email notification:", emailResult.error);
                }
            } catch (emailError) {
                console.error("Failed to send email notification:", emailError);
                // Don't fail the status update if email fails
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
