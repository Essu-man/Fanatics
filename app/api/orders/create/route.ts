import { NextRequest, NextResponse } from "next/server";
import { createOrder, getProduct, updateProduct, getVendor } from "@/lib/firestore";
import { decrementVariantStock, usesVariantStock } from "@/lib/stock-variants";
import { sendEmail, getOrderConfirmationEmail } from "@/lib/email";
import { collection, query, where, getDocs, limit, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { creditPendingBalanceForOrder } from "@/lib/vendor-ledger";

export const runtime = "nodejs";

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
            status: requestedStatus,
            fulfillmentMethod: rawFulfillmentMethod,
        } = body;

        const fulfillmentMethod = (rawFulfillmentMethod || shipping?.fulfillmentMethod || "delivery") as "delivery" | "pickup";

        // Check if order with this paystack reference already exists
        if (paystackReference) {
            const q = query(
                collection(db, "orders"),
                where("paystackReference", "==", paystackReference),
                limit(1)
            );
            const existingOrder = await getDocs(q);

            if (!existingOrder.empty) {
                const existingOrderDoc = existingOrder.docs[0];
                const existingOrderData = existingOrderDoc.data();
                const existingOrderId = existingOrderDoc.id;

                // If existing order is "awaiting_payment" and we are now "submitted", allow update
                if (existingOrderData.status === "awaiting_payment" && requestedStatus !== "awaiting_payment") {
                    console.log("Updating awaiting_payment order to submitted for reference:", paystackReference);

                    const targetStatus = requestedStatus || "submitted";
                    const newHistoryEntry = {
                        status: targetStatus,
                        timestamp: new Date().toISOString(),
                        note: "Payment confirmed, order submitted",
                    };

                    const updateData: any = {
                        status: targetStatus,
                        payment: payment || { method: "paystack", reference: paystackReference },
                        updatedAt: new Date().toISOString(),
                        statusHistory: [...(existingOrderData.statusHistory || []), newHistoryEntry],
                    };

                    if (userId) {
                        updateData.userId = userId;
                    }

                    // Check/calculate vendor delivery fees
                    let vendorDeliveryFees = existingOrderData.vendorDeliveryFees;
                    if (!vendorDeliveryFees) {
                        vendorDeliveryFees = await calculateVendorDeliveryFees(
                            existingOrderData.shipping?.town || shipping?.town || "",
                            existingOrderData.items || []
                        );
                        updateData.vendorDeliveryFees = vendorDeliveryFees;
                        existingOrderData.vendorDeliveryFees = vendorDeliveryFees;
                    }

                    await updateDoc(doc(db, "orders", existingOrderId), updateData);

                    // Credit vendor balances if transitioning to submitted
                    if (targetStatus === "submitted") {
                        try {
                            await creditPendingBalanceForOrder({ 
                                id: existingOrderId, 
                                items: existingOrderData.items,
                                vendorDeliveryFees: vendorDeliveryFees
                            });
                        } catch (ledgerError) {
                            console.error("Failed to credit pending balance on order update:", ledgerError);
                        }
                    }

                    // Generate order page link (for button) and tracking link
                    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cediman.com";
                    const orderPageLink = `${appUrl}/orders/${existingOrderId}`;
                    const trackingLink = `${appUrl}/track/${existingOrderId}`;

                    // Send email notification (non-blocking)
                    const emailRecipient = guestEmail || existingOrderData.guestEmail || existingOrderData.shipping?.email;
                    if (emailRecipient && targetStatus !== "awaiting_payment") {
                        try {
                            const emailHtml = getOrderConfirmationEmail(
                                customerName || existingOrderData.customerName || existingOrderData.shipping?.firstName || "Customer",
                                existingOrderId,
                                existingOrderData.total,
                                orderPageLink,
                                existingOrderData.items,
                                existingOrderData.shippingCost,
                                new Date().toISOString(),
                                existingOrderData.subtotal
                            );

                            const emailResult = await sendEmail(
                                emailRecipient,
                                `Order Confirmation - ${existingOrderId}`,
                                emailHtml
                            );

                            if (emailResult.success) {
                                console.log("Order confirmation email sent successfully for updated order");
                            } else {
                                console.error("Failed to send email notification for updated order:", emailResult.error);
                            }
                        } catch (emailError) {
                            console.error("Failed to send email notification for updated order:", emailError);
                        }
                    }

                    return NextResponse.json({
                        success: true,
                        orderId: existingOrderId,
                        trackingLink,
                        message: "Order payment confirmed and processed",
                    });
                } else {
                    console.log("Order already exists with reference:", paystackReference, "Order ID:", existingOrderId);
                    return NextResponse.json({
                        success: true,
                        orderId: existingOrderId,
                        message: "Order already exists",
                        alreadyExists: true,
                    });
                }
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

        // Enrich line items with vendor attribution (server-side; supports legacy carts without vendor fields)
        const rawItems = Array.isArray(items) ? items : [];
        const enrichedItems = await Promise.all(
            rawItems.map(async (item: Record<string, unknown>) => {
                const productId = typeof item.id === "string" ? item.id : String(item.id ?? "");
                let vendorId: string | null | undefined = item.vendorId as string | null | undefined;
                let vendorName: string | null | undefined = item.vendorName as string | null | undefined;
                let platformFee: number | undefined;
                let vendorAmount: number | undefined;

                if (productId) {
                    try {
                        const product = await getProduct(productId);
                        if (product) {
                            vendorId = product.vendorId ?? null;
                            vendorName = product.vendorName ?? null;
                             if (vendorId) {
                                 const price = Number(item.price || product.price) || 0;
                                 const qty = Number(item.quantity) || 1;
                                 const subtotal = price * qty;
                                 const vendorDoc = await getVendor(vendorId);
                                 const commissionRate = (vendorDoc && typeof vendorDoc.commissionRate === "number")
                                     ? vendorDoc.commissionRate
                                     : 10;
                                 platformFee = subtotal * (commissionRate / 100);
                                 vendorAmount = subtotal - platformFee;
                             }
                        }
                    } catch {
                        /* keep client-sent values if any */
                    }
                }

                return {
                    ...item,
                    vendorId: vendorId ?? null,
                    vendorName: vendorName ?? null,
                    ...(platformFee !== undefined ? { platformFee } : {}),
                    ...(vendorAmount !== undefined ? { vendorAmount } : {}),
                };
            })
        );

        // Calculate vendor delivery fees (free for pickup)
        const vendorDeliveryFees = fulfillmentMethod === "pickup"
            ? {}
            : await calculateVendorDeliveryFees(
                shipping?.town || "",
                enrichedItems
            );

        const effectiveShippingCost = fulfillmentMethod === "pickup" ? 0 : (Number(shippingCost) || 0);

        // Create order in Firestore
        const orderData = {
            userId: userId || null,
            guestEmail: guestEmail || shipping?.email || null,
            guestPhone: guestPhone || shipping?.phone || null,
            status: (requestedStatus as any) || "submitted",
            items: enrichedItems,
            shipping: shipping || {},
            payment: payment || { method: "paystack", reference: paystackReference },
            subtotal: Number(subtotal) || 0,
            shippingCost: effectiveShippingCost,
            tax: Number(tax) || 0,
            total: Number(total) || 0,
            paystackReference: paystackReference || null,
            fulfillmentMethod,
            vendorDeliveryFees,
        };

        console.log("Creating order with data:", JSON.stringify(orderData, null, 2));

        // Decrease stock for each item in the order
        for (const item of rawItems) {
            try {
                const product = await getProduct(item.id);
                if (product) {
                    const variantUpdate = decrementVariantStock(
                        product,
                        item.colorId,
                        item.size,
                        item.quantity
                    );
                    if (usesVariantStock(product) && variantUpdate) {
                        await updateProduct(item.id, variantUpdate);
                        console.log(`Updated variant stock for product ${item.id}`);
                    } else {
                        const isChildrenSize = product.childrenSizes?.includes(item.size);

                        if (isChildrenSize) {
                            const currentStock = product.childrenStock ?? 0;
                            const newStock = Math.max(0, currentStock - item.quantity);
                            await updateProduct(item.id, {
                                childrenStock: newStock,
                            });
                            console.log(`Updated children stock for product ${item.id}: ${currentStock} -> ${newStock}`);
                        } else {
                            const newStock = Math.max(0, product.stock - item.quantity);
                            await updateProduct(item.id, {
                                stock: newStock,
                                available: newStock > 0 ? product.available : false,
                            });
                            console.log(`Updated adult stock for product ${item.id}: ${product.stock} -> ${newStock}`);
                        }
                    }
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

        // Credit vendor balances if order is created in submitted status
        if (orderData.status === "submitted") {
            try {
                await creditPendingBalanceForOrder({ 
                    id: orderId, 
                    items: enrichedItems,
                    vendorDeliveryFees
                });
            } catch (ledgerError) {
                console.error("Failed to credit pending balance on order creation:", ledgerError);
            }
        }

        // Generate order page link (for button) and tracking link
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cediman.com";
        const orderPageLink = `${appUrl}/orders/${orderId}`;
        const trackingLink = `${appUrl}/track/${orderId}`;

        // Send email notification via SendGrid (non-blocking - don't fail order if email fails)
        // Only send if status is NOT awaiting_payment
        const emailRecipient = guestEmail || shipping?.email;
        if (emailRecipient && orderData.status !== "awaiting_payment") {
            try {
                const emailHtml = getOrderConfirmationEmail(
                    customerName || shipping?.firstName || "Customer",
                    orderId,
                    total,
                    orderPageLink, // Use order page link for the button
                    items,
                    shippingCost,
                    new Date().toISOString(),
                    subtotal
                );

                const emailResult = await sendEmail(
                    emailRecipient,
                    `Order Confirmation - ${orderId}`,
                    emailHtml
                );

                if (emailResult.success) {
                    console.log("Order confirmation email sent successfully");
                } else {
                    console.error("Failed to send email notification:", emailResult.error);
                }
            } catch (emailError) {
                console.error("Failed to send email notification:", emailError);
                // Don't fail the order if email fails
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

async function calculateVendorDeliveryFees(town: string, items: any[]) {
    const vendorFees: Record<string, number> = {};
    if (!town) return vendorFees;

    try {
        // Query the base location price from 'delivery_prices'
        const q = query(
            collection(db, "delivery_prices"),
            where("location", "==", town.trim())
        );
        const querySnapshot = await getDocs(q);
        let basePrice = 0;
        if (!querySnapshot.empty) {
            basePrice = querySnapshot.docs[0].data().price || 0;
        }

        const uniqueVendorIds = Array.from(new Set(items.map(it => it.vendorId).filter(Boolean)));
        for (const vendorId of uniqueVendorIds) {
            try {
                const vendor = await getVendor(vendorId);
                // default deliveryEnabled to true if not explicitly false
                if (vendor && vendor.deliveryEnabled !== false) {
                    vendorFees[vendorId] = basePrice;
                }
            } catch (e) {
                console.error(`Failed to get vendor ${vendorId} for delivery fee calculation:`, e);
                vendorFees[vendorId] = basePrice; // default to basePrice on error
            }
        }
    } catch (e) {
        console.error("Failed to calculate vendor delivery fees:", e);
    }
    return vendorFees;
}
