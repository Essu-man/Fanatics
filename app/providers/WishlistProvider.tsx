"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type WishlistContextValue = {
	items: string[]; // product ids
	toggle: (id: string) => void;
	isSaved: (id: string) => boolean;
	clear: () => void;
};

const KEY = "cediman:wishlist";
const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export default function WishlistProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<string[]>([]);

	useEffect(() => {
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) setItems(JSON.parse(raw));
		} catch {}
	}, []);

	useEffect(() => {
		try {
			localStorage.setItem(KEY, JSON.stringify(items));
		} catch {}
	}, [items]);

	function toggle(id: string) {
		setItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
	}
	function isSaved(id: string) {
		return items.includes(id);
	}
	function clear() {
		setItems([]);
	}

	const value = useMemo(() => ({ items, toggle, isSaved, clear }), [items]);
	return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
	const ctx = useContext(WishlistContext);
	if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
	return ctx;
}


