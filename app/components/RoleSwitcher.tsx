"use client";

import React from "react";
import { useAuth } from "../providers/AuthProvider";
import Button from "./ui/button";

export default function RoleSwitcher() {
    const { role, setRole } = useAuth();

    return (
        <div className="flex items-center gap-2">
            <div className="text-xs text-zinc-500">Role:</div>
            <div className="flex gap-2">
                <Button variant={role === "buyer" ? "default" : "ghost"} onClick={() => setRole("buyer")}>Buyer</Button>
                <Button variant={role === "seller" ? "default" : "ghost"} onClick={() => setRole("seller")}>Seller</Button>
                <Button variant={role === "admin" ? "default" : "ghost"} onClick={() => setRole("admin")}>Admin</Button>
            </div>
        </div>
    );
}

