"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "./AuthProvider";
import {
	getUserWishlist,
	addWishlistItem as addWishlistItemDB,
	removeWishlistItem as removeWishlistItemDB,
	clearUserWishlist as clearUserWishlistDB,
	syncWishlistToDatabase
} from "@/lib/firestore";

type WishlistContextValue = {
	items: string[]; // product ids
	toggle: (id: string) => void;
	isSaved: (id: string) => boolean;
	clear: () => void;
	syncing: boolean;
};

const KEY = "cediman:wishlist";
const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export default function WishlistProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<string[]>([]);
	const [syncing, setSyncing] = useState(false);
	const { user, isAuthenticated } = useAuth();
	const [hasLoadedFromDB, setHasLoadedFromDB] = useState(false);

	// Load wishlist from database when user logs in
	useEffect(() => {
		if (isAuthenticated && user && !hasLoadedFromDB) {
			loadWishlistFromDatabase();
		} else if (!isAuthenticated && hasLoadedFromDB) {
			// User logged out, reset and load from localStorage
			setHasLoadedFromDB(false);
			loadWishlistFromLocalStorage();
		}
	}, [isAuthenticated, user, hasLoadedFromDB]);

	// Load wishlist from localStorage (for guests or initial load)
	const loadWishlistFromLocalStorage = useCallback(() => {
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

	// Load wishlist from database and merge with localStorage
	const loadWishlistFromDatabase = useCallback(async () => {
		if (!user) return;

		setSyncing(true);
		try {
			// Get wishlist from database
			const dbWishlist = await getUserWishlist(user.id);

			// Get wishlist from localStorage
			let localWishlist: string[] = [];
			try {
				const raw = localStorage.getItem(KEY);
				if (raw) localWishlist = JSON.parse(raw);
			} catch (e) { }

			// Merge: Combine both, database takes priority for conflicts
			const mergedWishlist = [...new Set([...dbWishlist, ...localWishlist])];

			setItems(mergedWishlist);
			setHasLoadedFromDB(true);

			// Sync merged list to database
			await syncWishlistToDatabase(user.id, mergedWishlist);

			// Update localStorage
			localStorage.setItem(KEY, JSON.stringify(mergedWishlist));
		} catch (error) {
			console.error("Error loading wishlist from database:", error);
			// Fallback to localStorage
			loadWishlistFromLocalStorage();
		} finally {
			setSyncing(false);
		}
	}, [user, loadWishlistFromLocalStorage]);

	// Initial load from localStorage
	useEffect(() => {
		if (!isAuthenticated) {
			loadWishlistFromLocalStorage();
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

	function toggle(id: string) {
		setItems((prev) => {
			const isCurrentlySaved = prev.includes(id);
			const updated = isCurrentlySaved
				? prev.filter((x) => x !== id)
				: [id, ...prev];

			// Sync to database immediately if authenticated
			if (isAuthenticated && user && hasLoadedFromDB) {
				if (isCurrentlySaved) {
					removeWishlistItemDB(user.id, id).catch(console.error);
				} else {
					addWishlistItemDB(user.id, id).catch(console.error);
				}
			}

			return updated;
		});
	}

	function isSaved(id: string) {
		return items.includes(id);
	}

	function clear() {
		setItems([]);

		// Clear from database if authenticated
		if (isAuthenticated && user) {
			clearUserWishlistDB(user.id);
		}

		// Clear localStorage
		localStorage.removeItem(KEY);
	}

	const value = useMemo(() => ({ items, toggle, isSaved, clear, syncing }), [items, syncing]);
	return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
	const ctx = useContext(WishlistContext);
	if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
	return ctx;
}


