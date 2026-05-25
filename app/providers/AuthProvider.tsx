"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { auth } from "@/lib/firebase";
import { AuthUser, getCurrentUser, onAuthStateChange } from "@/lib/firebase-auth";

async function fetchUserFromApi(): Promise<AuthUser | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch("/api/user/me", {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
        const data = await res.json();
        if (res.ok && data.success && data.user) {
            return data.user as AuthUser;
        }
    } catch {
        /* fall back to client Firestore */
    }
    return null;
}

type AuthContextValue = {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isVendor: boolean;
    vendorId: string | undefined;
    refreshUser: () => Promise<void>;
    /** Update in-memory user without client Firestore (e.g. after /api/vendor/session). */
    syncUser: (user: AuthUser) => void;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function usersEqual(a: AuthUser | null, b: AuthUser | null): boolean {
    if (a === b) return true;
    if (!a || !b) return false;
    return (
        a.id === b.id &&
        a.email === b.email &&
        a.role === b.role &&
        a.firstName === b.firstName &&
        a.lastName === b.lastName &&
        a.vendorId === b.vendorId
    );
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Firebase's onAuthStateChange already persists auth state
        // Just listen to it - it will handle persistence automatically
        const unsubscribe = onAuthStateChange((newUser) => {
            setUser(newUser);
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const refreshUser = useCallback(async () => {
        const fromApi = await fetchUserFromApi();
        if (fromApi) {
            setUser((prev) => (usersEqual(prev, fromApi) ? prev : fromApi));
            return;
        }
        const currentUser = await getCurrentUser();
        setUser((prev) => (usersEqual(prev, currentUser) ? prev : currentUser));
    }, []);

    const syncUser = useCallback((next: AuthUser) => {
        setUser((prev) => (usersEqual(prev, next) ? prev : next));
    }, []);

    const logout = async () => {
        try {
            // Sign out from Firebase first (this will trigger onAuthStateChange)
            const { signOut } = await import("@/lib/firebase-auth");
            const result = await signOut();

            if (!result.success) {
                console.error("Logout error:", result.error);
            }

            // Clear user state after Firebase sign out
            setUser(null);

            // Clear any local storage items (but not all localStorage)
            try {
                localStorage.removeItem('cediman:cart');
                localStorage.removeItem('cediman:wishlist');
                localStorage.removeItem('cediman:savedForLater');
            } catch (e) {
                console.warn('Error clearing localStorage:', e);
            }
        } catch (error) {
            console.error("Logout failed:", error);
            // Clear user state even if sign out fails
            setUser(null);
        }
    };

    const value: AuthContextValue = {
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isVendor: user?.role === "vendor",
        vendorId: user?.vendorId,
        refreshUser,
        syncUser,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
