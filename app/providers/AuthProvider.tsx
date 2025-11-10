"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export type Role = "buyer" | "seller" | "admin";

type AuthContextValue = {
    user: User | null;
    loading: boolean;
    role: Role;
    setRole: (r: Role) => void;
    signUp: (email: string, password: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRoleState] = useState<Role>("buyer");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // load persisted role
    useEffect(() => {
        try {
            const r = localStorage.getItem("cediman:role") as Role | null;
            if (r) setRoleState(r);
        } catch (e) { }
    }, []);

    function setRole(r: Role) {
        setRoleState(r);
        try {
            localStorage.setItem("cediman:role", r);
        } catch (e) { }
    }

    const signUp = async (email: string, password: string) => {
        await createUserWithEmailAndPassword(auth, email, password);
    };

    const signIn = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        await signOut(auth);
    };

    const value = {
        user,
        loading,
        role,
        setRole,
        signUp,
        signIn,
        logout
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
