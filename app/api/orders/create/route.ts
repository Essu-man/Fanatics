import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/database";
import {
    getOrderConfirmationEmail,
    getOrderConfirmationSMS,
    sendEmail,
    sendSMS,
} from "@/lib/arkesel";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            orderId,
            userId,
            guestEmail,
            guestPhone,
            customerName,
            items,
            shipping,
            payment,
            subtotal,
            shippingCost,
            tax,
            total,
            paystackReference,
        } = body;

        // Validate required fields
        if (!orderId || !items || !shipping || !total) {
            return NextResponse.json(
                { error: "Missing required order information" },
                { status: 400 }
            );
        }

        // Create order in Supabase
        const orderData = {
            user_id: userId || null,
            guest_email: guestEmail || null,
            guest_phone: guestPhone || null,
            status: "confirmed" as const,
            items,
            shipping,
            payment,
            subtotal,
            shipping_cost: shippingCost,
            tax,
            total,
            paystack_reference: paystackReference,
        };

        const result = await createOrder(orderId, orderData);

        if (!result.success) {
            return NextResponse.json(
                { error: "Failed to create order", details: result.error },
                { status: 500 }
            );
        }

        // Generate tracking link
        const trackingLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/track/${orderId}`;

        // Send email notification
        const emailRecipient = guestEmail || shipping.email;
        if (emailRecipient) {
            const emailHtml = getOrderConfirmationEmail(
                customerName || shipping.firstName,
                orderId,
                total,
                trackingLink,
                items
            );

            await sendEmail(
                emailRecipient,
                `Order Confirmation - ${orderId}`,
                emailHtml
            );
        }

        // Send SMS notification
        const phoneNumber = guestPhone || shipping.phone;
        if (phoneNumber) {
            const smsMessage = getOrderConfirmationSMS(orderId, trackingLink);
            await sendSMS(phoneNumber, smsMessage);
        }

        return NextResponse.json({
            success: true,
            orderId,
            trackingLink,
            message: "Order created and notifications sent",
        });
    } catch (error: any) {
        console.error("Create order error:", error);
        return NextResponse.json(
            { error: "Failed to create order", details: error.message },
            { status: 500 }
        );
    }
}
