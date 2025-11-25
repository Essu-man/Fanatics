import { NextRequest, NextResponse } from "next/server";
import { createOrder, getProduct, updateProduct } from "@/lib/firestore";
import {
    getOrderConfirmationEmail,
    getOrderConfirmationSMS,
    sendEmail,
    sendSMS,
} from "@/lib/frogwigal";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Log received data for debugging
        console.log("Received order data:", JSON.stringify(body, null, 2));

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

        // Check if order with this paystack reference already exists
        if (paystackReference) {
            const q = query(
                collection(db, "orders"),
                where("paystackReference", "==", paystackReference),
                limit(1)
            );
            const existingOrder = await getDocs(q);

            if (!existingOrder.empty) {
                const existingOrderId = existingOrder.docs[0].id;
                console.log("Order already exists with reference:", paystackReference, "Order ID:", existingOrderId);
                return NextResponse.json({
                    success: true,
                    orderId: existingOrderId,
                    message: "Order already exists",
                    alreadyExists: true,
                });
            }
        }

        // Validate required fields
        if (!orderId || !items || !shipping || !total) {
            const missingFields = [];
            if (!orderId) missingFields.push('orderId');
            if (!items) missingFields.push('items');
            if (!shipping) missingFields.push('shipping');
            if (!total) missingFields.push('total');

            console.error("Missing fields:", missingFields);
            return NextResponse.json(
                {
                    error: "Missing required order information",
                    missingFields,
                    receivedKeys: Object.keys(body)
                },
                { status: 400 }
            );
        }

        // Validate items array
        if (!Array.isArray(items) || items.length === 0) {
            console.error("Invalid items array:", items);
            return NextResponse.json(
                { error: "Items must be a non-empty array" },
                { status: 400 }
            );
        }

        // Create order in Firestore
        const orderData = {
            userId: userId || null,
            guestEmail: guestEmail || shipping?.email || null,
            guestPhone: guestPhone || shipping?.phone || null,
            status: "submitted" as const,
            items: Array.isArray(items) ? items : [],
            shipping: shipping || {},
            payment: payment || { method: "paystack", reference: paystackReference },
            subtotal: Number(subtotal) || 0,
            shippingCost: Number(shippingCost) || 0,
            tax: Number(tax) || 0,
            total: Number(total) || 0,
            paystackReference: paystackReference || null,
        };

        console.log("Creating order with data:", JSON.stringify(orderData, null, 2));

        // Decrease stock for each item in the order
        for (const item of items) {
            try {
                const product = await getProduct(item.id);
                if (product) {
                    const newStock = Math.max(0, product.stock - item.quantity);
                    await updateProduct(item.id, {
                        stock: newStock,
                        available: newStock > 0 ? product.available : false,
                    });
                    console.log(`Updated stock for product ${item.id}: ${product.stock} -> ${newStock}`);
                }
            } catch (stockError) {
                console.error(`Failed to update stock for product ${item.id}:`, stockError);
                // Don't fail the order if stock update fails, but log it
            }
        }

        const result = await createOrder(orderId, orderData);

        if (!result.success) {
            console.error("Order creation failed:", result.error);
            return NextResponse.json(
                {
                    error: "Failed to create order",
                    details: result.error,
                    orderId: orderId
                },
                { status: 500 }
            );
        }

        // Generate tracking link
        const trackingLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/track/${orderId}`;

        // Send email notification (non-blocking - don't fail order if email fails)
        const emailRecipient = guestEmail || shipping?.email;
        if (emailRecipient) {
            try {
                const emailHtml = getOrderConfirmationEmail(
                    customerName || shipping?.firstName || "Customer",
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
            } catch (emailError) {
                console.error("Failed to send email notification:", emailError);
                // Don't fail the order if email fails
            }
        }

        // Send SMS notification (non-blocking - don't fail order if SMS fails)
        const phoneNumber = guestPhone || shipping?.phone;
        if (phoneNumber) {
            try {
                const smsMessage = getOrderConfirmationSMS(orderId, trackingLink);
                await sendSMS(phoneNumber, smsMessage);
            } catch (smsError) {
                console.error("Failed to send SMS notification:", smsError);
                // Don't fail the order if SMS fails
            }
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
