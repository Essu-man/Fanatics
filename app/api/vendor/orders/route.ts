import { NextResponse } from "next/server";
import { requireVendorAuthDetailed } from "@/lib/api-auth";
import { getAllOrders, getProductsByVendorId, getOrder, updateOrderStatus } from "@/lib/firestore";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { clearPendingBalanceToAvailable } from "@/lib/vendor-ledger";

export const runtime = "nodejs";

// Helper to filter items belonging to the vendor
function filterVendorItems(items: any[], vendorId: string, vendorProductIds: Set<string>) {
    return (items || []).filter((item: any) => {
        if (item.vendorId === vendorId) return true;
        const productId = item.productId || item.id;
        return productId && vendorProductIds.has(String(productId));
    });
}

export async function GET(request: Request) {
    const authResult = await requireVendorAuthDetailed(request);
    if (!authResult.ok) {
        return NextResponse.json(
            { success: false, error: authResult.error, code: authResult.code },
            { status: authResult.status }
        );
    }
    const auth = authResult.auth;

    try {
        const [orders, products] = await Promise.all([
            getAllOrders(1000),
            getProductsByVendorId(auth.vendorId),
        ]);

        const vendorProductIds = new Set(products.map((p) => p.id));

        const vendorOrders = orders
            .map((order) => {
                const vendorItems = filterVendorItems(order.items, auth.vendorId, vendorProductIds);
                if (vendorItems.length === 0) return null;

                // Return a sanitized order object containing only the vendor's items
                return {
                    id: order.id,
                    orderDate: order.orderDate,
                    status: order.status,
                    shipping: {
                        firstName: order.shipping?.firstName || "",
                        lastName: order.shipping?.lastName || "",
                        email: order.shipping?.email || "",
                        phone: order.shipping?.phone || "",
                        region: order.shipping?.region || "",
                        town: order.shipping?.town || "",
                        landmark: order.shipping?.landmark || "",
                        digitalAddress: order.shipping?.digitalAddress || "",
                    },
                    items: vendorItems,
                    subtotal: order.subtotal,
                    shippingCost: order.shippingCost,
                    total: order.total,
                };
            })
            .filter(Boolean);

        return NextResponse.json({ success: true, orders: vendorOrders });
    } catch (error: any) {
        console.error("Vendor orders GET error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to load orders" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    const authResult = await requireVendorAuthDetailed(request);
    if (!authResult.ok) {
        return NextResponse.json(
            { success: false, error: authResult.error, code: authResult.code },
            { status: authResult.status }
        );
    }
    const auth = authResult.auth;

    try {
        const body = await request.json();
        const { orderId, productId, colorId, size, fulfillmentStatus } = body;

        if (!orderId || !productId || !fulfillmentStatus) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (!["pending", "processing", "ready", "shipped", "delivered"].includes(fulfillmentStatus)) {
            return NextResponse.json(
                { success: false, error: "Invalid fulfillment status" },
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

        // Verify the product belongs to this vendor
        const products = await getProductsByVendorId(auth.vendorId);
        const vendorProductIds = new Set(products.map((p) => p.id));
        
        let belongsToVendor = vendorProductIds.has(String(productId));
        
        // Secondary check via item's own vendorId
        const matchItem = order.items.find((item: any) => {
            const id = item.productId || item.id;
            return id === productId && 
                (!colorId || item.colorId === colorId) && 
                (!size || item.size === size);
        });

        if (matchItem && matchItem.vendorId === auth.vendorId) {
            belongsToVendor = true;
        }

        if (!belongsToVendor || !matchItem) {
            return NextResponse.json(
                { success: false, error: "Unauthorized: Product does not belong to vendor or is not in order" },
                { status: 403 }
            );
        }

        // Update item status
        const updatedItems = order.items.map((item: any) => {
            const id = item.productId || item.id;
            const matches = id === productId && 
                (!colorId || item.colorId === colorId) && 
                (!size || item.size === size);

            if (matches) {
                return {
                    ...item,
                    fulfillmentStatus,
                };
            }
            return item;
        });

        // Check if ALL items in the order are now marked as "delivered"
        const allDelivered = updatedItems.every((item: any) => item.fulfillmentStatus === "delivered");

        // Save back to Firestore
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
            items: updatedItems,
            updatedAt: new Date().toISOString()
        });

        if (allDelivered && order.status !== "delivered") {
            try {
                await updateOrderStatus(orderId, "delivered", undefined, "All items marked as delivered by vendor.");
                await clearPendingBalanceToAvailable(orderId);
            } catch (statusError) {
                console.error("Failed to update overall order status or clear pending balance:", statusError);
            }
        }

        return NextResponse.json({ success: true, message: "Item fulfillment status updated" });
    } catch (error: any) {
        console.error("Vendor orders PATCH error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to update fulfillment" },
            { status: 500 }
        );
    }
}
