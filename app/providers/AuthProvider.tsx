"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, getCurrentUser, onAuthStateChange } from "@/lib/firebase-auth";

type AuthContextValue = {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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

    const refreshUser = async () => {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
    };

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
        refreshUser,
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
