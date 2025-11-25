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
        // Load initial user
        loadUser();

        // Listen to auth changes
        const unsubscribe = onAuthStateChange((newUser) => {
            setUser((prevUser) => {
                // Only update if there's a meaningful change
                // If Firebase user exists but profile fetch failed, keep previous user
                // Only clear user if Firebase user is actually null (real logout)
                if (newUser === null && prevUser !== null) {
                    // Real logout - Firebase user is null
                    return null;
                }
                if (newUser !== null) {
                    // User exists - update
                    return newUser;
                }
                // Keep previous user if newUser is null but we had a user
                // This prevents clearing user on temporary profile fetch failures
                return prevUser;
            });
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const loadUser = async () => {
        try {
            setLoading(true);
            const currentUser = await getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
            } else {
                // Only clear user if we're certain there's no user
                // Don't clear during initial load to prevent flicker
                if (user !== null) {
                    setUser(null);
                }
            }
        } catch (error) {
            console.error("Error loading user:", error);
            // Don't clear user on error - might be a temporary network issue
            // Only clear if we're certain the user is logged out
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = async () => {
        await loadUser();
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
