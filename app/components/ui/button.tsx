"use client";

import React from "react";
import cn from "../../../lib/cn";

type ButtonOwnProps = {
    variant?: "default" | "ghost" | "outline";
    className?: string;
    as?: React.ElementType;
};

type ButtonProps<T extends React.ElementType> = ButtonOwnProps & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className"> & { as?: T };

export default function Button<T extends React.ElementType = "button">({
    className,
    variant = "default",
    as,
    ...props
}: ButtonProps<T>) {
    const Component: React.ElementType = as || "button";

    const base = "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-all";
    const variantCls = {
        default: "bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange-700)]",
        ghost: "bg-transparent border border-zinc-300 text-zinc-700 hover:bg-zinc-50",
        outline: "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50",
    }[variant];

    return <Component {...(props as any)} className={cn(base, variantCls, className)} />;
}
