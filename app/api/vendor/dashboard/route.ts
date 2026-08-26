import { NextResponse } from "next/server";
import { requireVendorAuthDetailed } from "@/lib/api-auth";
import { getAllOrders, getProductsByVendorId, type Order } from "@/lib/firestore";

export const runtime = "nodejs";

type OrderItem = {
    id?: string;
    productId?: string;
    vendorId?: string | null;
    name?: string;
    productName?: string;
    quantity?: number;
    price?: number;
};

function productListingStatus(p: { status?: string; approved?: boolean }): "live" | "pending" | "rejected" {
    if (p.status === "rejected") return "rejected";
    if (p.status === "pending") return "pending";
    if (p.status === "approved") return "live";
    if (p.approved === false) return "pending";
    return "live";
}

function vendorLineItems(
    order: Order,
    vendorId: string,
    vendorProductIds: Set<string>
): OrderItem[] {
    const items = Array.isArray(order.items) ? (order.items as OrderItem[]) : [];
    return items.filter((item) => {
        if (item.vendorId === vendorId) return true;
        const productId = item.productId || item.id;
        return productId != null && vendorProductIds.has(String(productId));
    });
}

function lineRevenue(item: OrderItem): number {
    const qty = item.quantity ?? 1;
    const price = item.price ?? 0;
    return qty * price;
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
        const activeOrders = orders.filter((o) => o.status !== "cancelled");

        let totalRevenue = 0;
        let unitsSold = 0;
        const orderIdsWithVendorItems = new Set<string>();
        const productSales: Record<string, { name: string; sales: number; revenue: number }> = {};

        const now = new Date();
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        let lastMonthRevenue = 0;
        let thisMonthRevenue = 0;
        let lastMonthOrderCount = 0;
        let thisMonthOrderCount = 0;

        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const revenueOverTime: { date: string; revenue: number; orders: number }[] = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            revenueOverTime.push({
                date: date.toISOString().split("T")[0],
                revenue: 0,
                orders: 0,
            });
        }

        const recentOrders: {
            id: string;
            date: string;
            status: string;
            yourRevenue: string;
            units: number;
        }[] = [];

        for (const order of activeOrders) {
            const lines = vendorLineItems(order, auth.vendorId, vendorProductIds);
            if (lines.length === 0) continue;

            const orderDate =
                order.orderDate instanceof Date ? order.orderDate : new Date(order.orderDate);
            const orderRevenue = lines.reduce((sum, item) => sum + lineRevenue(item), 0);
            const orderUnits = lines.reduce((sum, item) => sum + (item.quantity ?? 1), 0);

            totalRevenue += orderRevenue;
            unitsSold += orderUnits;
            orderIdsWithVendorItems.add(order.id);

            if (orderDate >= lastMonthStart && orderDate < thisMonthStart) {
                lastMonthRevenue += orderRevenue;
                lastMonthOrderCount += 1;
            }
            if (orderDate >= thisMonthStart) {
                thisMonthRevenue += orderRevenue;
                thisMonthOrderCount += 1;
            }

            if (orderDate >= thirtyDaysAgo) {
                const dateStr = orderDate.toISOString().split("T")[0];
                const dayData = revenueOverTime.find((d) => d.date === dateStr);
                if (dayData) {
                    dayData.revenue += orderRevenue;
                    dayData.orders += 1;
                }
            }

            for (const item of lines) {
                const productId = String(item.productId || item.id || "unknown");
                const productName = item.name || item.productName || "Product";
                const qty = item.quantity ?? 1;
                const rev = lineRevenue(item);
                if (productSales[productId]) {
                    productSales[productId].sales += qty;
                    productSales[productId].revenue += rev;
                } else {
                    productSales[productId] = { name: productName, sales: qty, revenue: rev };
                }
            }

            recentOrders.push({
                id: order.id,
                date: orderDate.toISOString().split("T")[0],
                status: order.status,
                yourRevenue: `₵${orderRevenue.toFixed(2)}`,
                units: orderUnits,
            });
        }

        recentOrders.sort((a, b) => b.date.localeCompare(a.date));

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)
            .map((p) => ({
                name: p.name,
                sales: p.sales,
                revenue: `₵${p.revenue.toFixed(2)}`,
            }));

        const revenueChange =
            lastMonthRevenue > 0
                ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
                : 0;
        const revenueChangeText =
            lastMonthRevenue > 0
                ? `${revenueChange > 0 ? "+" : ""}${revenueChange.toFixed(1)}% vs last month`
                : thisMonthRevenue > 0
                  ? "First sales this month"
                  : "No sales yet";

        const ordersChange =
            lastMonthOrderCount > 0
                ? ((thisMonthOrderCount - lastMonthOrderCount) / lastMonthOrderCount) * 100
                : 0;
        const ordersChangeText =
            lastMonthOrderCount > 0
                ? `${ordersChange > 0 ? "+" : ""}${ordersChange.toFixed(1)}% vs last month`
                : thisMonthOrderCount > 0
                  ? "First orders this month"
                  : "No orders yet";

        const listingCounts = { live: 0, pending: 0, rejected: 0 };
        let lowStockCount = 0;
        for (const p of products) {
            listingCounts[productListingStatus(p)] += 1;
            if (p.stockVariants?.length) {
                const lowVariants = p.stockVariants.filter((v) => v.stock > 0 && v.stock <= 5).length;
                if (lowVariants > 0) lowStockCount += 1;
            } else {
                const adultLow = (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5;
                const childLow =
                    p.childrenStock != null && p.childrenStock > 0 && p.childrenStock <= 5;
                if (adultLow || childLow) lowStockCount += 1;
            }
        }

        const orderCount = orderIdsWithVendorItems.size;
        const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

        const commissionRate = typeof auth.vendor.commissionRate === "number" ? auth.vendor.commissionRate : 10;
        const platformFeeAmount = totalRevenue * (commissionRate / 100);
        const netPayableRevenue = totalRevenue - platformFeeAmount;
        const balanceAvailable = auth.vendor.balanceAvailable ?? 0;
        const balancePending = auth.vendor.balancePending ?? 0;

        let totalPaidOut = 0;
        try {
            const { getAdminDb } = await import("@/lib/firestore-admin");
            const db = getAdminDb();
            const ledgerSnap = await db.collection("vendor_ledger_entries")
                .where("vendorId", "==", auth.vendorId)
                .where("type", "==", "payout")
                .where("status", "==", "completed")
                .get();
            ledgerSnap.forEach(doc => {
                totalPaidOut += Math.abs(doc.data().amount || 0);
            });
        } catch (e) {
            console.error("Failed to compute vendor totalPaidOut:", e);
        }

        return NextResponse.json({
            success: true,
            store: {
                slug: auth.vendor.slug,
                businessName: auth.vendor.businessName,
            },
            stats: {
                revenue: `₵${totalRevenue.toFixed(2)}`,
                commissionRate: commissionRate,
                platformFee: `₵${platformFeeAmount.toFixed(2)}`,
                netPayable: `₵${netPayableRevenue.toFixed(2)}`,
                balanceAvailable: `₵${balanceAvailable.toFixed(2)}`,
                balancePending: `₵${balancePending.toFixed(2)}`,
                revenueChange: revenueChangeText,
                orders: orderCount.toString(),
                ordersChange: ordersChangeText,
                unitsSold: unitsSold.toString(),
                productsLive: listingCounts.live.toString(),
                productsPending: listingCounts.pending.toString(),
                productsTotal: products.length.toString(),
                lowStock: lowStockCount.toString(),
                avgOrderValue: `₵${avgOrderValue.toFixed(2)}`,
            },
            breakdown: {
                grossSales: totalRevenue,
                commissionRate,
                platformFeeAmount,
                netPayableRevenue,
                totalPaidOut,
                balanceAvailable,
                balancePending,
            },
            topProducts,
            revenueOverTime,
            recentOrders: recentOrders.slice(0, 8),
        });
    } catch (error: unknown) {
        console.error("Vendor dashboard:", error);
        const message = error instanceof Error ? error.message : "Unable to load dashboard";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
