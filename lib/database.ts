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
    status: "confirmed" | "processing" | "in_transit" | "out_for_delivery" | "delivered" | "cancelled";
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
        const { data, error } = await supabase
            .from("orders")
            .insert({
                id: orderId,
                ...orderData,
                status: "confirmed",
                status_history: [
                    {
                        status: "confirmed",
                        timestamp: new Date().toISOString(),
                        note: "Order placed successfully",
                    },
                ],
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        console.error("Error creating order:", error);
        return { success: false, error: error.message };
    }
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
    try {
        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();

        if (error) throw error;
        return data as Order;
    } catch (error) {
        console.error("Error getting order:", error);
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
