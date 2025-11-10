"use client";

import { X } from "lucide-react";
import { useCart } from "../providers/CartProvider";
import Button from "./ui/button";
import { useEffect, useState } from "react";

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
	const { items, removeItem, clear } = useCart();
	const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

	// body scroll lock when open
	useEffect(() => {
		if (open) {
			const original = document.body.style.overflow;
			document.body.style.overflow = "hidden";
			return () => {
				document.body.style.overflow = original;
			};
		}
	}, [open]);

	return (
		<div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
			{/* Backdrop */}
			<div
				onClick={onClose}
				className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
			/>
			{/* Panel */}
			<aside
				className={`absolute right-0 top-0 h-full w-[360px] max-w-[90vw] bg-white shadow-2xl transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}
			>
				<div className="flex items-center justify-between border-b px-5 py-4">
					<h3 className="text-base font-semibold text-zinc-900">Your Cart</h3>
					<button onClick={onClose} aria-label="Close" className="text-zinc-600 hover:text-zinc-900">
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="flex h-[calc(100%-160px)] flex-col overflow-hidden">
					<div className="flex-1 overflow-y-auto px-5 py-4">
						{items.length === 0 ? (
							<div className="py-12 text-center text-sm text-zinc-500">Your cart is empty.</div>
						) : (
							<ul className="space-y-4">
								{items.map((it) => (
									<li key={`${it.id}-${it.colorId || "default"}`} className="flex gap-3">
										<div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100">
											{it.image ? (
												/* eslint-disable-next-line @next/next/no-img-element */
												<img src={it.image} alt={it.name} className="h-full w-full object-cover" />
											) : null}
										</div>
										<div className="min-w-0 flex-1">
											<div className="truncate text-sm font-medium text-zinc-900">{it.name}</div>
											<div className="mt-0.5 text-xs text-zinc-500">
												Qty {it.quantity}
												{it.colorId ? ` • ${it.colorId}` : ""}
											</div>
											<div className="mt-1 text-sm font-semibold text-zinc-900">₵{(it.price * it.quantity).toFixed(2)}</div>
										</div>
										<button
											onClick={() => removeItem(it.id, it.colorId)}
											className="self-start rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50"
										>
											Remove
										</button>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>

				<div className="border-t px-5 py-4">
					<div className="mb-3 flex items-center justify-between text-sm">
						<span className="text-zinc-600">Subtotal</span>
						<span className="font-semibold text-zinc-900">₵{subtotal.toFixed(2)}</span>
					</div>
					<div className="flex gap-2">
						<Button className="flex-1">Checkout</Button>
						<Button variant="outline" className="flex-1" onClick={clear}>
							Clear
						</Button>
					</div>
					<div className="mt-2 text-center text-[11px] text-zinc-500">Shipping & taxes calculated at checkout</div>
				</div>
			</aside>
		</div>
	);
}


