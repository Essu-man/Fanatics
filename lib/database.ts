import { supabase, supabaseAdmin } from "./supabase";

// User Profile Operations
export interface UserProfile {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: "admin" | "customer" | "delivery";
    phone?: string;
    created_at: string;
    email_verified: boolean;
}

export const createUserProfile = async (userId: string, data: Omit<UserProfile, "id" | "created_at">) => {
    try {
        const { data: profile, error } = await supabase
            .from("users")
            .insert({
                id: userId,
                ...data,
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data: profile };
    } catch (error: any) {
        console.error("Error creating user profile:", error);
        return { success: false, error: error.message };
    }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single();

        if (error) throw error;
        return data as UserProfile;
    } catch (error) {
        console.error("Error getting user profile:", error);
        return null;
    }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    try {
        const { error } = await supabase
            .from("users")
            .update(updates)
            .eq("id", userId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Error updating user profile:", error);
        return { success: false, error: error.message };
    }
};

// Order Operations
export interface Order {
    id: string;
    user_id: string | null;
    guest_email: string | null;
    guest_phone: string | null;
    order_date: string;
    status: "submitted" | "confirmed" | "processing" | "in_transit" | "out_for_delivery" | "delivered" | "cancelled";
    items: any[];
    shipping: any;
    payment: any;
    subtotal: number;
    shipping_cost: number;
    tax: number;
    total: number;
    paystack_reference?: string;
    assigned_delivery_person?: string;
    delivery_proof?: string;
    status_history: any[];
}

export const createOrder = async (orderId: string, orderData: Omit<Order, "id" | "order_date" | "status_history">) => {
    try {
        // Use admin client if service role key is available, otherwise use regular client
        // The RLS policy should allow "Anyone can create orders" for guest checkout
        const clientToUse = process.env.SUPABASE_SERVICE_ROLE_KEY ? supabaseAdmin : supabase;

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.warn("SUPABASE_SERVICE_ROLE_KEY is not set. Using anon key - ensure RLS policies allow order creation.");
        }

        // Ensure all required fields are present
        const insertData = {
            id: orderId,
            user_id: orderData.user_id || null,
            guest_email: orderData.guest_email || null,
            guest_phone: orderData.guest_phone || null,
            order_date: new Date().toISOString(),
            status: orderData.status || "confirmed",
            items: Array.isArray(orderData.items) ? orderData.items : [],
            shipping: orderData.shipping || {},
            payment: orderData.payment || {},
            subtotal: Number(orderData.subtotal) || 0,
            shipping_cost: Number(orderData.shipping_cost) || 0,
            tax: Number(orderData.tax) || 0,
            total: Number(orderData.total) || 0,
            paystack_reference: orderData.paystack_reference || null,
            assigned_delivery_person: null,
            delivery_proof: null,
            status_history: [
                {
                    status: orderData.status || "submitted",
                    timestamp: new Date().toISOString(),
                    note: "Order submitted successfully",
                },
            ],
        };

        console.log("Inserting order with data:", JSON.stringify(insertData, null, 2));

        // Use the appropriate client (admin if service role key exists, otherwise anon)
        // If using anon key, the RLS policy "Anyone can create orders" should allow this
        const { data, error } = await clientToUse
            .from("orders")
            .insert(insertData)
            .select()
            .single();

        if (error) {
            console.error("Supabase error creating order:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
            console.error("Error details:", JSON.stringify(error, null, 2));

            // Provide helpful error message for RLS recursion issues
            if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
                return {
                    success: false,
                    error: "Database configuration error: RLS policy recursion detected",
                    details: "This usually means SUPABASE_SERVICE_ROLE_KEY is not set or the service role key is invalid. Please check your environment variables."
                };
            }

            throw error;
        }

        console.log("Order created successfully:", data);
        return { success: true, data };
    } catch (error: any) {
        console.error("Error creating order:", error);
        console.error("Error stack:", error.stack);
        return {
            success: false,
            error: error.message || "Unknown error occurred",
            details: error.details || error.hint || null,
            code: error.code || null
        };
    }
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
    try {
        // Use admin client to bypass RLS for public order tracking
        // This allows anyone to track orders by ID without authentication
        const clientToUse = process.env.SUPABASE_SERVICE_ROLE_KEY ? supabaseAdmin : supabase;

        const { data, error } = await clientToUse
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();

        if (error) {
            console.error("Error getting order:", error);
            console.error("Order ID:", orderId);
            console.error("Error details:", JSON.stringify(error, null, 2));
            throw error;
        }

        if (!data) {
            console.log("No order found with ID:", orderId);
            return null;
        }

        return data as Order;
    } catch (error: any) {
        console.error("Error getting order:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        return null;
    }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
    try {
        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq("user_id", userId)
            .order("order_date", { ascending: false });

        if (error) throw error;
        return data as Order[];
    } catch (error) {
        console.error("Error getting user orders:", error);
        return [];
    }
};

export const getAllOrders = async (limitCount: number = 50): Promise<Order[]> => {
    try {
        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .order("order_date", { ascending: false })
            .limit(limitCount);

        if (error) throw error;
        return data as Order[];
    } catch (error) {
        console.error("Error getting all orders:", error);
        return [];
    }
};

export const updateOrderStatus = async (orderId: string, status: Order["status"], note?: string) => {
    try {
        // Get current order to append to status history
        const order = await getOrder(orderId);
        if (!order) throw new Error("Order not found");

        const newHistoryEntry = {
            status,
            timestamp: new Date().toISOString(),
            note: note || `Order status updated to ${status}`,
        };

        const { error } = await supabase
            .from("orders")
            .update({
                status,
                status_history: [...order.status_history, newHistoryEntry],
            })
            .eq("id", orderId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Error updating order status:", error);
        return { success: false, error: error.message };
    }
};

// Product Operations
export interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    available: boolean;
    category: string;
    team?: string;
    images: string[];
    description: string;
    colors?: string[];
    sizes?: string[];
    similar_products?: string[];
}

export const getProducts = async (): Promise<Product[]> => {
    try {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("available", true);

        if (error) throw error;
        return data as Product[];
    } catch (error) {
        console.error("Error getting products:", error);
        return [];
    }
};

export const getProduct = async (productId: string): Promise<Product | null> => {
    try {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("id", productId)
            .single();

        if (error) throw error;
        return data as Product;
    } catch (error) {
        console.error("Error getting product:", error);
        return null;
    }
};

export const createProduct = async (productData: Omit<Product, "id">) => {
    try {
        const { data, error } = await supabaseAdmin
            .from("products")
            .insert(productData)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        console.error("Error creating product:", error);
        return { success: false, error: error.message };
    }
};

export const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
        const { error } = await supabaseAdmin
            .from("products")
            .update(updates)
            .eq("id", productId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Error updating product:", error);
        return { success: false, error: error.message };
    }
};

export const deleteProduct = async (productId: string) => {
    try {
        const { error } = await supabaseAdmin
            .from("products")
            .delete()
            .eq("id", productId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting product:", error);
        return { success: false, error: error.message };
    }
};

// Customer Operations
export const getAllCustomers = async (): Promise<UserProfile[]> => {
    try {
        const { data, error } = await supabaseAdmin
            .from("users")
            .select("*")
            .eq("role", "customer");

        if (error) throw error;
        return data as UserProfile[];
    } catch (error) {
        console.error("Error getting customers:", error);
        return [];
    }
};

// Complaint Operations
export interface Complaint {
    id: string;
    user_id: string;
    order_id?: string;
    subject: string;
    description: string;
    status: "open" | "in_progress" | "resolved";
    responses: any[];
    created_at: string;
    resolved_at?: string;
}

export const createComplaint = async (complaintData: Omit<Complaint, "id" | "created_at" | "responses">) => {
    try {
        const { data, error } = await supabase
            .from("complaints")
            .insert({
                ...complaintData,
                responses: [],
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        console.error("Error creating complaint:", error);
        return { success: false, error: error.message };
    }
};

export const getUserComplaints = async (userId: string): Promise<Complaint[]> => {
    try {
        const { data, error } = await supabase
            .from("complaints")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data as Complaint[];
    } catch (error) {
        console.error("Error getting user complaints:", error);
        return [];
    }
};

// ============================================
// Cart Operations
// ============================================

export interface DBCartItem {
    id: string;
    product_id: string;
    product_name: string;
    price: number;
    color_id: string | null;
    quantity: number;
    image: string | null;
}

export const getUserCart = async (userId: string): Promise<DBCartItem[]> => {
    try {
        const { data, error } = await supabase
            .from("cart_items")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return (data || []).map(item => ({
            id: item.product_id,
            product_id: item.product_id,
            product_name: item.product_name,
            price: parseFloat(item.price),
            color_id: item.color_id,
            quantity: item.quantity,
            image: item.image,
        }));
    } catch (error) {
        console.error("Error getting user cart:", error);
        return [];
    }
};

export const addCartItem = async (userId: string, item: Omit<DBCartItem, "id">): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from("cart_items")
            .upsert({
                user_id: userId,
                product_id: item.product_id,
                product_name: item.product_name,
                price: item.price,
                color_id: item.color_id || null,
                quantity: item.quantity,
                image: item.image || null,
            }, {
                onConflict: "user_id,product_id,color_id",
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Error adding cart item:", error);
        return false;
    }
};

export const updateCartItem = async (userId: string, productId: string, colorId: string | null | undefined, quantity: number): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from("cart_items")
            .update({ quantity: Math.max(1, Math.min(10, quantity)) })
            .eq("user_id", userId)
            .eq("product_id", productId)
            .eq("color_id", colorId ?? null);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Error updating cart item:", error);
        return false;
    }
};

export const removeCartItem = async (userId: string, productId: string, colorId?: string | null): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from("cart_items")
            .delete()
            .eq("user_id", userId)
            .eq("product_id", productId)
            .eq("color_id", colorId || null);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Error removing cart item:", error);
        return false;
    }
};

export const clearUserCart = async (userId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from("cart_items")
            .delete()
            .eq("user_id", userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Error clearing cart:", error);
        return false;
    }
};

export const syncCartToDatabase = async (userId: string, items: Array<{
    product_id: string;
    product_name: string;
    price: number;
    color_id: string | null;
    quantity: number;
    image: string | null;
}>): Promise<boolean> => {
    try {
        // Clear existing cart
        await clearUserCart(userId);

        // Add all items
        for (const item of items) {
            await addCartItem(userId, item);
        }
        return true;
    } catch (error) {
        console.error("Error syncing cart to database:", error);
        return false;
    }
};

// ============================================
// Wishlist Operations
// ============================================

export const getUserWishlist = async (userId: string): Promise<string[]> => {
    try {
        const { data, error } = await supabase
            .from("wishlist_items")
            .select("product_id")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return (data || []).map(item => item.product_id);
    } catch (error) {
        console.error("Error getting user wishlist:", error);
        return [];
    }
};

export const addWishlistItem = async (userId: string, productId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from("wishlist_items")
            .insert({
                user_id: userId,
                product_id: productId,
            });

        if (error) {
            // If item already exists, that's okay
            if (error.code === '23505') return true;
            throw error;
        }
        return true;
    } catch (error) {
        console.error("Error adding wishlist item:", error);
        return false;
    }
};

export const removeWishlistItem = async (userId: string, productId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from("wishlist_items")
            .delete()
            .eq("user_id", userId)
            .eq("product_id", productId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Error removing wishlist item:", error);
        return false;
    }
};

export const clearUserWishlist = async (userId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from("wishlist_items")
            .delete()
            .eq("user_id", userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Error clearing wishlist:", error);
        return false;
    }
};

export const syncWishlistToDatabase = async (userId: string, productIds: string[]): Promise<boolean> => {
    try {
        // Clear existing wishlist
        await clearUserWishlist(userId);

        // Add all items
        for (const productId of productIds) {
            await addWishlistItem(userId, productId);
        }
        return true;
    } catch (error) {
        console.error("Error syncing wishlist to database:", error);
        return false;
    }
};
