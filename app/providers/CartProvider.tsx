"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Product } from "../../lib/products";
import { useAuth } from "./AuthProvider";
import {
    getUserCart,
    addCartItem as addCartItemDB,
    updateCartItem as updateCartItemDB,
    removeCartItem as removeCartItemDB,
    clearUserCart as clearUserCartDB,
    syncCartToDatabase
} from "@/lib/firestore";

export type CartItem = {
    id: string; // product id
    name: string;
    price: number;
    colorId?: string | null;
    size?: string;
    quantity: number;
    image?: string;
    customization?: {
        playerName?: string;
        playerNumber?: string;
    };
};

type CartContextValue = {
    items: CartItem[];
    addItem: (p: CartItem) => void;
    updateItem: (id: string, colorId: string | null | undefined, quantity: number, size?: string) => void;
    removeItem: (id: string, colorId?: string | null, size?: string) => void;
    clear: () => void;
    syncing: boolean;
};

const KEY = "cediman:cart";
const CartContext = createContext<CartContextValue | undefined>(undefined);

export default function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [syncing, setSyncing] = useState(false);
    const { user, isAuthenticated } = useAuth();
    const [hasLoadedFromDB, setHasLoadedFromDB] = useState(false);

    // Load cart from database when user logs in
    useEffect(() => {
        if (isAuthenticated && user && !hasLoadedFromDB) {
            loadCartFromDatabase();
        } else if (!isAuthenticated && hasLoadedFromDB) {
            // User logged out, reset and load from localStorage
            setHasLoadedFromDB(false);
            loadCartFromLocalStorage();
        }
    }, [isAuthenticated, user, hasLoadedFromDB]);

    // Load cart from localStorage (for guests or initial load)
    const loadCartFromLocalStorage = useCallback(() => {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                setItems(parsed);
            }
        } catch (e) {
            setItems([]);
        }
    }, []);

    // Load cart from database and merge with localStorage
    const loadCartFromDatabase = useCallback(async () => {
        if (!user) return;

        setSyncing(true);
        try {
            // Get cart from database
            const dbCart = await getUserCart(user.id);

            // Get cart from localStorage
            let localCart: CartItem[] = [];
            try {
                const raw = localStorage.getItem(KEY);
                if (raw) localCart = JSON.parse(raw);
            } catch (e) { }

            // Merge: Database takes priority, but add unique items from localStorage
            const mergedCart: CartItem[] = [...dbCart.map(item => ({
                id: item.productId,
                name: item.productName,
                price: item.price,
                colorId: item.colorId ?? undefined,
                quantity: item.quantity,
                image: item.image ?? undefined,
            }))];

            // Add items from localStorage that don't exist in database
            for (const localItem of localCart) {
                const exists = mergedCart.find(
                    item => item.id === localItem.id && item.colorId === localItem.colorId
                );
                if (!exists) {
                    mergedCart.push(localItem);
                    // Sync to database
                    await addCartItemDB(user.id, {
                        productId: localItem.id,
                        productName: localItem.name,
                        price: localItem.price,
                        colorId: localItem.colorId ?? null,
                        quantity: localItem.quantity,
                        image: localItem.image ?? null,
                    });
                }
            }

            // Deduplicate: Combine items with same id and colorId, summing quantities
            const deduplicatedCart: CartItem[] = [];
            const seen = new Map<string, CartItem>();

            for (const item of mergedCart) {
                const key = `${item.id}-${item.colorId || 'default'}`;
                const existing = seen.get(key);

                if (existing) {
                    // Combine quantities
                    existing.quantity += item.quantity;
                } else {
                    // Create a new entry
                    const newItem = { ...item };
                    seen.set(key, newItem);
                    deduplicatedCart.push(newItem);
                }
            }

            setItems(deduplicatedCart);
            setHasLoadedFromDB(true);

            // Update localStorage
            localStorage.setItem(KEY, JSON.stringify(deduplicatedCart));
        } catch (error) {
            console.error("Error loading cart from database:", error);
            // Fallback to localStorage
            loadCartFromLocalStorage();
        } finally {
            setSyncing(false);
        }
    }, [user, loadCartFromLocalStorage]);

    // Initial load from localStorage
    useEffect(() => {
        if (!isAuthenticated) {
            loadCartFromLocalStorage();
        }
    }, []);

    // Sync to localStorage (always)
    useEffect(() => {
        if (items.length > 0 || localStorage.getItem(KEY)) {
            try {
                localStorage.setItem(KEY, JSON.stringify(items));
            } catch (e) { }
        }
    }, [items]);

    // Sync to database when items change (if authenticated)
    useEffect(() => {
        if (isAuthenticated && user && hasLoadedFromDB && items.length >= 0) {
            syncToDatabase();
        }
    }, [items, isAuthenticated, user, hasLoadedFromDB]);

    const syncToDatabase = useCallback(async () => {
        if (!user || !hasLoadedFromDB) return;

        setSyncing(true);
        try {
            await syncCartToDatabase(user.id, items.map(item => ({
                productId: item.id,
                productName: item.name,
                price: item.price,
                colorId: item.colorId ?? null,
                quantity: item.quantity,
                image: item.image ?? null,
            })));
        } catch (error) {
            console.error("Error syncing cart to database:", error);
        } finally {
            setSyncing(false);
        }
    }, [user, items, hasLoadedFromDB]);

    function addItem(p: CartItem) {
        setItems((prev) => {
            const found = prev.find((it) => it.id === p.id && it.colorId === p.colorId && it.size === p.size);
            if (found) {
                const updated = prev.map((it) =>
                    it.id === p.id && it.colorId === p.colorId && it.size === p.size
                        ? { ...it, quantity: it.quantity + p.quantity }
                        : it
                );

                // Sync to database immediately if authenticated
                if (isAuthenticated && user && hasLoadedFromDB) {
                    const updatedItem = updated.find(it => it.id === p.id && it.colorId === p.colorId && it.size === p.size);
                    if (updatedItem) {
                        updateCartItemDB(user.id, p.id, p.colorId, updatedItem.quantity).catch(console.error);
                    }
                }

                return updated;
            }

            const newItems = [p, ...prev];

            // Sync to database immediately if authenticated
            if (isAuthenticated && user && hasLoadedFromDB) {
                addCartItemDB(user.id, {
                    productId: p.id,
                    productName: p.name,
                    price: p.price,
                    colorId: p.colorId ?? null,
                    quantity: p.quantity,
                    image: p.image ?? null,
                }).catch(console.error);
            }

            return newItems;
        });
    }

    function updateItem(id: string, colorId: string | null | undefined, quantity: number, size?: string) {
        setItems((prev) => {
            const updated = prev.map((it) =>
                it.id === id && it.colorId === colorId && it.size === size
                    ? { ...it, quantity: Math.max(1, Math.min(10, quantity)) }
                    : it
            );

            // Sync to database immediately if authenticated
            if (isAuthenticated && user && hasLoadedFromDB) {
                updateCartItemDB(user.id, id, colorId, quantity).catch(console.error);
            }

            return updated;
        });
    }

    function removeItem(id: string, colorId?: string | null, size?: string) {
        setItems((prev) => {
            const filtered = prev.filter((it) => !(it.id === id && it.colorId === colorId && it.size === size));

            // Sync to database immediately if authenticated
            if (isAuthenticated && user && hasLoadedFromDB) {
                removeCartItemDB(user.id, id, colorId).catch(console.error);
            }

            return filtered;
        });
    }

    function clear() {
        setItems([]);

        // Clear from database if authenticated
        if (isAuthenticated && user) {
            clearUserCartDB(user.id);
        }

        // Clear localStorage
        localStorage.removeItem(KEY);
    }

    return <CartContext.Provider value={{ items, addItem, updateItem, removeItem, clear, syncing }}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
