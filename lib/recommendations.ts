import { supabase } from "./supabase";
import type { Product } from "./database";

// AI-Powered Product Recommendations

/**
 * Get personalized product recommendations based on user's purchase history
 */
export const getPersonalizedRecommendations = async (
    userId: string,
    limit: number = 10
): Promise<Product[]> => {
    try {
        // Get user's order history
        const { data: orders } = await supabase
            .from("orders")
            .select("items")
            .eq("user_id", userId)
            .order("order_date", { ascending: false })
            .limit(10);

        if (!orders || orders.length === 0) {
            // If no history, return trending products
            return getTrendingProducts(limit);
        }

        // Extract purchased product categories and teams
        const purchasedCategories = new Set<string>();
        const purchasedTeams = new Set<string>();

        orders.forEach((order) => {
            order.items.forEach((item: any) => {
                if (item.category) purchasedCategories.add(item.category);
                if (item.team) purchasedTeams.add(item.team);
            });
        });

        // Get products from similar categories/teams
        const { data: products } = await supabase
            .from("products")
            .select("*")
            .eq("available", true)
            .or(
                `category.in.(${Array.from(purchasedCategories).join(",")}),team.in.(${Array.from(purchasedTeams).join(",")})`
            )
            .limit(limit);

        return (products as Product[]) || [];
    } catch (error) {
        console.error("Error getting personalized recommendations:", error);
        return [];
    }
};

/**
 * Get similar products based on product features
 */
export const getSimilarProducts = async (
    productId: string,
    limit: number = 6
): Promise<Product[]> => {
    try {
        // Get the current product
        const { data: product } = await supabase
            .from("products")
            .select("*")
            .eq("id", productId)
            .single();

        if (!product) return [];

        // Find products with similar category or team
        const { data: similarProducts } = await supabase
            .from("products")
            .select("*")
            .eq("available", true)
            .neq("id", productId)
            .or(`category.eq.${product.category},team.eq.${product.team}`)
            .limit(limit);

        return (similarProducts as Product[]) || [];
    } catch (error) {
        console.error("Error getting similar products:", error);
        return [];
    }
};

/**
 * Get frequently bought together products
 */
export const getFrequentlyBoughtTogether = async (
    productId: string,
    limit: number = 4
): Promise<Product[]> => {
    try {
        // Get orders containing this product
        const { data: orders } = await supabase
            .from("orders")
            .select("items")
            .contains("items", [{ id: productId }])
            .limit(50);

        if (!orders || orders.length === 0) {
            return getSimilarProducts(productId, limit);
        }

        // Count frequency of other products in these orders
        const productFrequency = new Map<string, number>();

        orders.forEach((order) => {
            order.items.forEach((item: any) => {
                if (item.id !== productId) {
                    productFrequency.set(
                        item.id,
                        (productFrequency.get(item.id) || 0) + 1
                    );
                }
            });
        });

        // Sort by frequency and get top products
        const topProductIds = Array.from(productFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([id]) => id);

        if (topProductIds.length === 0) {
            return getSimilarProducts(productId, limit);
        }

        // Fetch the actual products
        const { data: products } = await supabase
            .from("products")
            .select("*")
            .in("id", topProductIds)
            .eq("available", true);

        return (products as Product[]) || [];
    } catch (error) {
        console.error("Error getting frequently bought together:", error);
        return [];
    }
};

/**
 * Get trending products based on recent orders
 */
export const getTrendingProducts = async (
    limit: number = 10
): Promise<Product[]> => {
    try {
        // Get recent orders (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: orders } = await supabase
            .from("orders")
            .select("items")
            .gte("order_date", thirtyDaysAgo.toISOString())
            .order("order_date", { ascending: false });

        if (!orders || orders.length === 0) {
            // Fallback to newest products
            const { data: products } = await supabase
                .from("products")
                .select("*")
                .eq("available", true)
                .order("created_at", { ascending: false })
                .limit(limit);

            return (products as Product[]) || [];
        }

        // Count product frequency
        const productFrequency = new Map<string, number>();

        orders.forEach((order) => {
            order.items.forEach((item: any) => {
                productFrequency.set(
                    item.id,
                    (productFrequency.get(item.id) || 0) + 1
                );
            });
        });

        // Sort by frequency
        const topProductIds = Array.from(productFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([id]) => id);

        // Fetch the actual products
        const { data: products } = await supabase
            .from("products")
            .select("*")
            .in("id", topProductIds)
            .eq("available", true);

        return (products as Product[]) || [];
    } catch (error) {
        console.error("Error getting trending products:", error);
        return [];
    }
};

/**
 * Get new arrivals
 */
export const getNewArrivals = async (limit: number = 8): Promise<Product[]> => {
    try {
        const { data: products } = await supabase
            .from("products")
            .select("*")
            .eq("available", true)
            .order("created_at", { ascending: false })
            .limit(limit);

        return (products as Product[]) || [];
    } catch (error) {
        console.error("Error getting new arrivals:", error);
        return [];
    }
};

/**
 * Search products with AI-enhanced relevance
 */
export const searchProducts = async (
    query: string,
    limit: number = 20
): Promise<Product[]> => {
    try {
        const searchTerm = `%${query}%`;

        const { data: products } = await supabase
            .from("products")
            .select("*")
            .eq("available", true)
            .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},team.ilike.${searchTerm},category.ilike.${searchTerm}`)
            .limit(limit);

        return (products as Product[]) || [];
    } catch (error) {
        console.error("Error searching products:", error);
        return [];
    }
};
