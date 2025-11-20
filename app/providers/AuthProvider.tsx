"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, getCurrentUser, onAuthStateChange } from "@/lib/supabase-auth";

type AuthContextValue = {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load initial user
        loadUser();

        // Listen to auth changes
        const { data: { subscription } } = onAuthStateChange((user) => {
            setUser(user);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const loadUser = async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error("Error loading user:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = async () => {
        await loadUser();
    };

    const value: AuthContextValue = {
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        refreshUser,
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
