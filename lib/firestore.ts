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
    role: "admin" | "customer";
    phone?: string;
    createdAt: Date;
    emailVerified: boolean;
}

export const createUserProfile = async (uid: string, data: Omit<UserProfile, "uid" | "createdAt">) => {
    try {
        await setDoc(doc(db, "users", uid), {
            ...data,
            uid,
            createdAt: Timestamp.now(),
        });
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
        await updateDoc(doc(db, "users", uid), data as DocumentData);
        return { success: true };
    } catch (error: any) {
        console.error("Error updating user profile:", error);
        return { success: false, error: error.message };
    }
};

// Order Operations
export interface Order {
    id: string;
    userId: string;
    orderDate: Date;
    status: "confirmed" | "processing" | "in_transit" | "out_for_delivery" | "delivered" | "cancelled";
    items: any[];
    shipping: any;
    payment: any;
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    paystackReference?: string;
}

export const createOrder = async (orderId: string, orderData: Omit<Order, "id" | "orderDate">) => {
    try {
        await setDoc(doc(db, "orders", orderId), {
            ...orderData,
            id: orderId,
            orderDate: Timestamp.now(),
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
        const q = query(
            collection(db, "orders"),
            where("userId", "==", userId),
            orderBy("orderDate", "desc")
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                ...data,
                orderDate: data.orderDate?.toDate() || new Date(),
            } as Order;
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
            } as Order;
        });
    } catch (error) {
        console.error("Error getting all orders:", error);
        return [];
    }
};

export const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
        await updateDoc(doc(db, "orders", orderId), { status });
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
    category: string;
    team?: string;
    images: string[];
    description: string;
    colors?: string[];
    sizes?: string[];
}

export const getProducts = async (): Promise<Product[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        } as Product));
    } catch (error) {
        console.error("Error getting products:", error);
        return [];
    }
};

export const getProduct = async (productId: string): Promise<Product | null> => {
    try {
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
            } as Product;
        }
        return null;
    } catch (error) {
        console.error("Error getting product:", error);
        return null;
    }
};

export const createProduct = async (productData: Omit<Product, "id">) => {
    try {
        const docRef = doc(collection(db, "products"));
        await setDoc(docRef, productData);
        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error("Error creating product:", error);
        return { success: false, error: error.message };
    }
};

export const updateProduct = async (productId: string, data: Partial<Product>) => {
    try {
        await updateDoc(doc(db, "products", productId), data as DocumentData);
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
