import { NextRequest, NextResponse } from "next/server";
import { getOrder, updateOrderStatus } from "@/lib/firestore";
import { sendEmail, getOrderConfirmationEmail } from "@/lib/sendgrid";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json(
                { error: "Order ID is required" },
                { status: 400 }
            );
        }

        // Get the order from Firestore
        const order = await getOrder(orderId);
        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        const reference = order.paystackReference || (order.payment && order.payment.reference);
        if (!reference) {
            return NextResponse.json(
                { error: "Payment reference not found for this order" },
                { status: 400 }
            );
        }

        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!secretKey) {
            return NextResponse.json(
                { error: "Paystack configuration missing" },
                { status: 500 }
            );
        }

        // Verify payment with Paystack
        const response = await fetch(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const data = await response.json();

        if (!response.ok || !data.status || data.data.status !== "success") {
            const statusLabel = data.data ? data.data.status : "unknown";
            return NextResponse.json(
                {
                    success: false,
                    error: `Payment verification failed. Paystack status: ${statusLabel}`,
                    details: data
                },
                { status: 400 }
            );
        }

        // Payment is successful! Update order status
        const updateResult = await updateOrderStatus(orderId, "submitted", undefined, "Payment manually verified by admin");

        if (!updateResult.success) {
            return NextResponse.json(
                { error: "Failed to update order status", details: updateResult.error },
                { status: 500 }
            );
        }

        // Send confirmation email
        const emailRecipient = order.guestEmail || order.shipping?.email;
        if (emailRecipient) {
            try {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cediman.com";
                const emailHtml = getOrderConfirmationEmail(
                    order.shipping?.firstName || "Customer",
                    orderId,
                    order.total,
                    `${appUrl}/orders/${orderId}`,
                    order.items,
                    order.shippingCost,
                    new Date().toISOString(),
                    order.subtotal
                );

                await sendEmail(
                    emailRecipient,
                    `Order Confirmation - ${orderId}`,
                    emailHtml
                );
            } catch (emailError) {
                console.error("Failed to send email notification:", emailError);
            }
        }

        return NextResponse.json({
            success: true,
            message: "Payment verified and order status updated",
            data: {
                reference: data.data.reference,
                amount: data.data.amount / 100,
                paidAt: data.data.paid_at,
            }
        });

    } catch (error: any) {
        console.error("Error verifying payment manually:", error);
        return NextResponse.json(
            { error: "Failed to verify payment", details: error.message },
            { status: 500 }
        );
    }
}
