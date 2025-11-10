"use client";

import React from "react";
import cn from "../../../lib/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {};

export default function Input({ className, ...props }: InputProps) {
    return (
        <input
            {...props}
            className={cn(
                "rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-[var(--brand-navy-600)]",
                className
            )}
        />
    );
}
