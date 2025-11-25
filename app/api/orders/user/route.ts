import { NextRequest, NextResponse } from "next/server";
import { getUserOrders } from "@/lib/firestore";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "User ID is required" },
                { status: 400 }
            );
        }

        const orders = await getUserOrders(userId);

        // Serialize dates
        const serialized = orders.map((order) => ({
            ...order,
            orderDate: order.orderDate instanceof Date
                ? order.orderDate.toISOString()
                : order.orderDate,
        }));

        return NextResponse.json({
            success: true,
            orders: serialized,
        });
    } catch (error: any) {
        console.error("Failed to fetch user orders:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to load orders" },
            { status: 500 }
        );
    }
}

