import { NextResponse } from "next/server";
import { getAllOrders, getProducts, getAllCustomers } from "@/lib/firestore";

export const runtime = "nodejs";

export async function GET(request: Request) {
    try {
        // Fetch all data in parallel
        const [orders, products, customers] = await Promise.all([
            getAllOrders(1000), // Get a large number to calculate accurate stats
            getProducts(),
            getAllCustomers(),
        ]);

        // Calculate total revenue (sum of all order totals)
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

        // Calculate total orders
        const totalOrders = orders.length;

        // Calculate total products
        const totalProducts = products.length;

        // Calculate total customers
        const totalCustomers = customers.length;

        // Get recent orders (exclude delivered orders)
        const recentOrders = orders
            .filter((order) => order.status !== "delivered") // Exclude delivered orders
            .map((order) => {
                // Get customer name from userId or guest info
                let customerName = "Guest";
                if (order.userId) {
                    const customer = customers.find((c) => c.uid === order.userId);
                    if (customer) {
                        customerName = `${customer.firstName} ${customer.lastName}`;
                    }
                } else if (order.guestEmail) {
                    customerName = order.guestEmail;
                }

                return {
                    id: order.id,
                    customer: customerName,
                    amount: `₵${(order.total || 0).toFixed(2)}`,
                    status: order.status,
                    date: order.orderDate instanceof Date
                        ? order.orderDate.toISOString().split('T')[0]
                        : new Date(order.orderDate).toISOString().split('T')[0],
                };
            });

        // Calculate top products from order items
        const productSales: Record<string, { name: string; sales: number; revenue: number }> = {};

        orders.forEach((order) => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach((item: any) => {
                    const productId = item.productId || item.id;
                    const productName = item.name || item.productName || "Unknown Product";
                    const quantity = item.quantity || 1;
                    const price = item.price || 0;
                    const itemTotal = quantity * price;

                    if (productSales[productId]) {
                        productSales[productId].sales += quantity;
                        productSales[productId].revenue += itemTotal;
                    } else {
                        productSales[productId] = {
                            name: productName,
                            sales: quantity,
                            revenue: itemTotal,
                        };
                    }
                });
            }
        });

        // Convert to array and sort by sales
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5)
            .map((product) => ({
                name: product.name,
                sales: product.sales,
                revenue: `₵${product.revenue.toFixed(2)}`,
            }));

        // Calculate changes (comparing last month to this month)
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const lastMonthOrders = orders.filter(
            (order) => {
                const orderDate = order.orderDate instanceof Date ? order.orderDate : new Date(order.orderDate);
                return orderDate >= new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1) &&
                    orderDate < thisMonth;
            }
        );
        const thisMonthOrders = orders.filter(
            (order) => {
                const orderDate = order.orderDate instanceof Date ? order.orderDate : new Date(order.orderDate);
                return orderDate >= thisMonth;
            }
        );

        const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const revenueChange = lastMonthRevenue > 0
            ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
            : "0";
        const revenueChangeText = revenueChange !== "0"
            ? `${parseFloat(revenueChange) > 0 ? '+' : ''}${revenueChange}% from last month`
            : "No previous data";

        const ordersChange = lastMonthOrders.length > 0
            ? ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length * 100).toFixed(1)
            : "0";
        const ordersChangeText = ordersChange !== "0"
            ? `${parseFloat(ordersChange) > 0 ? '+' : ''}${ordersChange}% from last month`
            : "No previous data";

        // Products change (new products this week)
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const newProductsThisWeek = products.filter((product) => {
            const created = product.createdAt;
            if (!created) return false;
            const createdDate = created instanceof Date ? created : new Date(created);
            return createdDate >= weekAgo;
        }).length;
        const productsChangeText = `${newProductsThisWeek} new this week`;

        // Customers change (new customers this month)
        const newCustomersThisMonth = customers.filter((customer) => {
            const created = customer.createdAt;
            if (!created) return false;
            const createdDate = created instanceof Date ? created : new Date(created);
            return createdDate >= thisMonth;
        }).length;
        const customersChangeText = `+${newCustomersThisMonth} new this month`;

        return NextResponse.json({
            success: true,
            stats: {
                revenue: `₵${totalRevenue.toFixed(2)}`,
                revenueChange: revenueChangeText,
                orders: totalOrders.toString(),
                ordersChange: ordersChangeText,
                products: totalProducts.toString(),
                productsChange: productsChangeText,
                customers: totalCustomers.toString(),
                customersChange: customersChangeText,
            },
            recentOrders,
            topProducts,
        });
    } catch (error: any) {
        console.error("Failed to load dashboard stats:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to load dashboard statistics" },
            { status: 500 }
        );
    }
}

