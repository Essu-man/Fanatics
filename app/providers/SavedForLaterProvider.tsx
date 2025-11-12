"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { CartItem } from "./CartProvider";

type SavedForLaterContextValue = {
    items: CartItem[];
    saveItem: (item: CartItem) => void;
    removeItem: (id: string, colorId?: string | null) => void;
    moveToCart: (item: CartItem) => void;
    clear: () => void;
};

const KEY = "cediman:savedForLater";
const SavedForLaterContext = createContext<SavedForLaterContextValue | undefined>(undefined);

export default function SavedForLaterProvider({ children }: { children: React.ReactNode }) {
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

    function saveItem(item: CartItem) {
        setItems((prev) => {
            const exists = prev.find((it) => it.id === item.id && it.colorId === item.colorId);
            if (exists) return prev;
            return [...prev, item];
        });
    }

    function removeItem(id: string, colorId?: string | null) {
        setItems((prev) => prev.filter((it) => !(it.id === id && it.colorId === colorId)));
    }

    function moveToCart(item: CartItem) {
        // This will be handled by the component using both contexts
        removeItem(item.id, item.colorId);
    }

    function clear() {
        setItems([]);
    }

    return (
        <SavedForLaterContext.Provider value={{ items, saveItem, removeItem, moveToCart, clear }}>
            {children}
        </SavedForLaterContext.Provider>
    );
}

export function useSavedForLater() {
    const ctx = useContext(SavedForLaterContext);
    if (!ctx) throw new Error("useSavedForLater must be used within SavedForLaterProvider");
    return ctx;
}

