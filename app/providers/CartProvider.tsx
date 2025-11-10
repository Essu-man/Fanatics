"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Product } from "../../lib/products";

export type CartItem = {
    id: string; // product id
    name: string;
    price: number;
    colorId?: string | null;
    quantity: number;
    image?: string;
};

type CartContextValue = {
    items: CartItem[];
    addItem: (p: CartItem) => void;
    removeItem: (id: string, colorId?: string | null) => void;
    clear: () => void;
};

const KEY = "cediman:cart";
const CartContext = createContext<CartContextValue | undefined>(undefined);

export default function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw) setItems(JSON.parse(raw));
        } catch (e) {
            setItems([]);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(KEY, JSON.stringify(items));
        } catch (e) { }
    }, [items]);

    function addItem(p: CartItem) {
        setItems((prev) => {
            const found = prev.find((it) => it.id === p.id && it.colorId === p.colorId);
            if (found) {
                return prev.map((it) => (it.id === p.id && it.colorId === p.colorId ? { ...it, quantity: it.quantity + p.quantity } : it));
            }
            return [p, ...prev];
        });
    }

    function removeItem(id: string, colorId?: string | null) {
        setItems((prev) => prev.filter((it) => !(it.id === id && it.colorId === colorId)));
    }

    function clear() {
        setItems([]);
    }

    return <CartContext.Provider value={{ items, addItem, removeItem, clear }}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
