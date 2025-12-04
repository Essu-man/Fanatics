import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

// User Profile Operations
export interface UserProfile {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "admin" | "customer" | "delivery";
    phone?: string;
    createdAt: Date;
    emailVerified: boolean;
}

export const createUserProfile = async (uid: string, data: Omit<UserProfile, "uid" | "createdAt">) => {
    try {
        // Remove undefined values (Firestore doesn't allow undefined)
        const profileData: any = {
            uid,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
            emailVerified: data.emailVerified,
            createdAt: Timestamp.now(),
        };

        // Only include phone if it's defined
        if (data.phone !== undefined && data.phone !== null) {
            profileData.phone = data.phone;
        }

        await setDoc(doc(db, "users", uid), profileData);
        return { success: true };
    } catch (error: any) {
        console.error("Error creating user profile:", error);
        return { success: false, error: error.message };
    }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
            } as UserProfile;
        }
        return null;
    } catch (error) {
        console.error("Error getting user profile:", error);
        return null;
    }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    try {
        // Remove undefined values (Firestore doesn't allow undefined)
        const updateData: any = {};

        if (data.email !== undefined) updateData.email = data.email;
        if (data.firstName !== undefined) updateData.firstName = data.firstName;
        if (data.lastName !== undefined) updateData.lastName = data.lastName;
        if (data.role !== undefined) updateData.role = data.role;
        if (data.emailVerified !== undefined) updateData.emailVerified = data.emailVerified;

        // Handle phone separately - can be null or string, but not undefined
        if (data.phone !== undefined) {
            updateData.phone = data.phone; // Can be null or string
        }

        await updateDoc(doc(db, "users", uid), updateData as DocumentData);
        return { success: true };
    } catch (error: any) {
        console.error("Error updating user profile:", error);
        return { success: false, error: error.message };
    }
};

// Order Operations
export interface Order {
    id: string;
    userId: string | null;
    guestEmail: string | null;
    guestPhone: string | null;
    orderDate: Date;
    status: "submitted" | "confirmed" | "processing" | "in_transit" | "out_for_delivery" | "delivered" | "cancelled";
    items: any[];
    shipping: any;
    payment: any;
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    paystackReference?: string;
    assignedDeliveryPerson?: string;
    deliveryProof?: string;
    statusHistory: any[];
    deliveryPersonInfo?: {
        name: string;
        phone: string;
        vehicleInfo?: string;
        assignedAt?: string;
    };
}

export const createOrder = async (orderId: string, orderData: Omit<Order, "id" | "orderDate" | "statusHistory">) => {
    try {
        const statusHistory = [
            {
                status: orderData.status || "submitted",
                timestamp: new Date().toISOString(),
                note: "Order submitted successfully",
            },
        ];

        await setDoc(doc(db, "orders", orderId), {
            ...orderData,
            id: orderId,
            orderDate: Timestamp.now(),
            statusHistory,
        });
        return { success: true };
    } catch (error: any) {
        console.error("Error creating order:", error);
        return { success: false, error: error.message };
    }
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
    try {
        const docRef = doc(db, "orders", orderId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                ...data,
                orderDate: data.orderDate?.toDate() || new Date(),
                statusHistory: data.statusHistory || [],
            } as Order;
        }
        return null;
    } catch (error) {
        console.error("Error getting order:", error);
        return null;
    }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
    try {
        // Query without orderBy to avoid requiring a composite index
        // We'll sort in memory instead
        const q = query(
            collection(db, "orders"),
            where("userId", "==", userId)
        );

        const querySnapshot = await getDocs(q);
        const orders = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                orderDate: data.orderDate?.toDate() || new Date(),
                statusHistory: data.statusHistory || [],
            } as Order;
        });

        // Sort by orderDate descending in memory
        return orders.sort((a, b) => {
            const dateA = a.orderDate instanceof Date ? a.orderDate : new Date(a.orderDate);
            const dateB = b.orderDate instanceof Date ? b.orderDate : new Date(b.orderDate);
            return dateB.getTime() - dateA.getTime();
        });
    } catch (error) {
        console.error("Error getting user orders:", error);
        return [];
    }
};

export const getAllOrders = async (limitCount: number = 50): Promise<Order[]> => {
    try {
        const q = query(
            collection(db, "orders"),
            orderBy("orderDate", "desc"),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                ...data,
                orderDate: data.orderDate?.toDate() || new Date(),
                statusHistory: data.statusHistory || [],
            } as Order;
        });
    } catch (error) {
        console.error("Error getting all orders:", error);
        return [];
    }
};

export const updateOrderStatus = async (
    orderId: string,
    status: Order["status"],
    deliveryPersonInfo?: {
        name: string;
        phone: string;
        vehicleInfo?: string;
        assignedAt?: string;
    },
    note?: string
) => {
    try {
        // Get current order to append to status history
        const order = await getOrder(orderId);
        if (!order) {
            return { success: false, error: "Order not found" };
        }

        const newHistoryEntry = {
            status,
            timestamp: new Date().toISOString(),
            note: note || `Order status updated to ${status}`,
        };

        const updateData: any = {
            status,
            statusHistory: [...(order.statusHistory || []), newHistoryEntry],
        };

        // Add delivery person info if provided (for out_for_delivery status)
        if (deliveryPersonInfo) {
            updateData.deliveryPersonInfo = deliveryPersonInfo;
        }

        await updateDoc(doc(db, "orders", orderId), updateData);
        return { success: true };
    } catch (error: any) {
        console.error("Error updating order status:", error);
        return { success: false, error: error.message };
    }
};

export const deleteOrder = async (orderId: string) => {
    try {
        await deleteDoc(doc(db, "orders", orderId));
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting order:", error);
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
    teamId?: string;
    league?: string;
    images: string[]; // URLs from storage
    description: string;
    colors?: Array<{ id: string; name: string; hex: string }>;
    sizes?: string[];
    similarProducts?: string[];
    createdAt?: Date | null;
    updatedAt?: Date | null;
}

export const getProducts = async (): Promise<Product[]> => {
    try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : null,
            } as Product;
        });
    } catch (error) {
        console.error("Error getting products:", error);
        return [];
    }
};

export const getProductsByTeam = async (teamId: string): Promise<Product[]> => {
    try {
        const q = query(
            collection(db, "products"),
            where("teamId", "==", teamId)
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : null,
            } as Product;
        });
    } catch (error) {
        console.error("Error getting team products:", error);
        return [];
    }
};

export const getProduct = async (productId: string): Promise<Product | null> => {
    try {
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : null,
            } as Product;
        }
        return null;
    } catch (error) {
        console.error("Error getting product:", error);
        return null;
    }
};

export const createProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    try {
        const docRef = doc(collection(db, "products"));
        const timestamp = Timestamp.now();
        await setDoc(docRef, {
            ...productData,
            createdAt: timestamp,
            updatedAt: timestamp,
        });
        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error("Error creating product:", error);
        return { success: false, error: error.message };
    }
};

export const updateProduct = async (productId: string, data: Partial<Product>) => {
    try {
        await updateDoc(doc(db, "products", productId), {
            ...data,
            updatedAt: Timestamp.now(),
        } as DocumentData);
        return { success: true };
    } catch (error: any) {
        console.error("Error updating product:", error);
        return { success: false, error: error.message };
    }
};

export const deleteProduct = async (productId: string) => {
    try {
        await deleteDoc(doc(db, "products", productId));
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting product:", error);
        return { success: false, error: error.message };
    }
};

// Customer Operations
export const getAllCustomers = async (): Promise<UserProfile[]> => {
    try {
        const q = query(
            collection(db, "users"),
            where("role", "==", "customer")
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
            } as UserProfile;
        });
    } catch (error) {
        console.error("Error getting customers:", error);
        return [];
    }
};

// ============================================
// Cart Operations
// ============================================

export interface DBCartItem {
    id: string;
    userId: string;
    productId: string;
    productName: string;
    price: number;
    colorId: string | null;
    quantity: number;
    image: string | null;
    createdAt: Date;
}

export const getUserCart = async (userId: string): Promise<DBCartItem[]> => {
    try {
        // Query without orderBy to avoid requiring a composite index
        // We'll sort in memory instead
        const q = query(
            collection(db, "cart_items"),
            where("userId", "==", userId)
        );

        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
            } as DBCartItem;
        });

        // Sort by createdAt descending in memory
        return items.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
        });
    } catch (error) {
        console.error("Error getting user cart:", error);
        return [];
    }
};

export const addCartItem = async (userId: string, item: {
    productId: string;
    productName: string;
    price: number;
    colorId: string | null;
    quantity: number;
    image: string | null;
}): Promise<boolean> => {
    try {
        // Check if item already exists
        const q = query(
            collection(db, "cart_items"),
            where("userId", "==", userId),
            where("productId", "==", item.productId),
            where("colorId", "==", item.colorId || null)
        );
        const existing = await getDocs(q);

        if (!existing.empty) {
            // Update existing item
            const docRef = existing.docs[0].ref;
            await updateDoc(docRef, {
                quantity: item.quantity,
                price: item.price,
            });
        } else {
            // Create new item
            const docRef = doc(collection(db, "cart_items"));
            await setDoc(docRef, {
                userId,
                productId: item.productId,
                productName: item.productName,
                price: item.price,
                colorId: item.colorId || null,
                quantity: item.quantity,
                image: item.image || null,
                createdAt: Timestamp.now(),
            });
        }
        return true;
    } catch (error) {
        console.error("Error adding cart item:", error);
        return false;
    }
};

export const updateCartItem = async (userId: string, productId: string, colorId: string | null | undefined, quantity: number): Promise<boolean> => {
    try {
        const q = query(
            collection(db, "cart_items"),
            where("userId", "==", userId),
            where("productId", "==", productId),
            where("colorId", "==", colorId ?? null)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0].ref;
            await updateDoc(docRef, {
                quantity: Math.max(1, Math.min(10, quantity)),
            });
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error updating cart item:", error);
        return false;
    }
};

export const removeCartItem = async (userId: string, productId: string, colorId?: string | null): Promise<boolean> => {
    try {
        const q = query(
            collection(db, "cart_items"),
            where("userId", "==", userId),
            where("productId", "==", productId),
            where("colorId", "==", colorId ?? null)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            await deleteDoc(querySnapshot.docs[0].ref);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error removing cart item:", error);
        return false;
    }
};

export const clearUserCart = async (userId: string): Promise<boolean> => {
    try {
        const q = query(
            collection(db, "cart_items"),
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);

        const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        return true;
    } catch (error) {
        console.error("Error clearing cart:", error);
        return false;
    }
};

export const syncCartToDatabase = async (userId: string, items: Array<{
    productId: string;
    productName: string;
    price: number;
    colorId: string | null;
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
        // Query without orderBy to avoid requiring a composite index
        const q = query(
            collection(db, "wishlist_items"),
            where("userId", "==", userId)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => doc.data().productId);
    } catch (error) {
        console.error("Error getting user wishlist:", error);
        return [];
    }
};

export const addWishlistItem = async (userId: string, productId: string): Promise<boolean> => {
    try {
        // Check if already exists
        const q = query(
            collection(db, "wishlist_items"),
            where("userId", "==", userId),
            where("productId", "==", productId)
        );
        const existing = await getDocs(q);

        if (existing.empty) {
            const docRef = doc(collection(db, "wishlist_items"));
            await setDoc(docRef, {
                userId,
                productId,
                createdAt: Timestamp.now(),
            });
        }
        return true;
    } catch (error) {
        console.error("Error adding wishlist item:", error);
        return false;
    }
};

export const removeWishlistItem = async (userId: string, productId: string): Promise<boolean> => {
    try {
        const q = query(
            collection(db, "wishlist_items"),
            where("userId", "==", userId),
            where("productId", "==", productId)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            await deleteDoc(querySnapshot.docs[0].ref);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error removing wishlist item:", error);
        return false;
    }
};

export const clearUserWishlist = async (userId: string): Promise<boolean> => {
    try {
        const q = query(
            collection(db, "wishlist_items"),
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);

        const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
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
