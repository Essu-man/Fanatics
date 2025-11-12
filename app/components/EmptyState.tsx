"use client";

import Link from "next/link";
import { ShoppingBag, Search } from "lucide-react";
import Button from "./ui/button";

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    icon?: React.ReactNode;
}

export default function EmptyState({
    title,
    description,
    actionLabel = "Continue Shopping",
    actionHref = "/",
    icon,
}: EmptyStateProps) {
    return (
        <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
                {icon || <ShoppingBag className="h-10 w-10 text-zinc-400" />}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-zinc-900">{title}</h3>
            <p className="mb-6 text-sm text-zinc-600">{description}</p>
            <Button as={Link} href={actionHref}>
                {actionLabel}
            </Button>
        </div>
    );
}

