import { NextResponse } from "next/server";
import { getAllOrders } from "@/lib/firestore";

export const runtime = "nodejs";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get("limit");
        const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10), 1), 500) : 100;

        const orders = await getAllOrders(limit);
        const serialized = orders.map((order) => ({
            ...order,
            orderDate: order.orderDate instanceof Date ? order.orderDate.toISOString() : order.orderDate,
        }));

        return NextResponse.json({
            success: true,
            orders: serialized,
        });
    } catch (error: any) {
        console.error("Failed to load admin orders:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to load orders" },
            { status: 500 }
        );
    }
}


