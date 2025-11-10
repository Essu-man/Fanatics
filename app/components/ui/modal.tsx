"use client";

import React, { useEffect } from "react";
import cn from "../../../lib/cn";

export default function Modal({
    open,
    onClose,
    children,
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}) {
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        if (open) document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            <div className="relative z-10 max-w-4xl rounded-lg bg-white p-6 shadow-xl">
                <button
                    aria-label="Close"
                    onClick={onClose}
                    className="absolute right-3 top-3 rounded-md bg-zinc-50 px-2 py-1 text-xs hover:bg-zinc-100"
                >
                    ✕
                </button>

                <div>{children}</div>
            </div>
        </div>
    );
}
