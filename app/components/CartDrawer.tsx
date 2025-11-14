"use client";

import { X, Plus, Minus, Heart, CreditCard } from "lucide-react";
import { useCart } from "../providers/CartProvider";
import { useSavedForLater } from "../providers/SavedForLaterProvider";
import { useToast } from "./ui/ToastContainer";
import Button from "./ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
	const { items, removeItem, clear, updateItem } = useCart();
	const { saveItem: saveForLater, items: savedItems } = useSavedForLater();
	const { showToast } = useToast();
	const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
	const estimatedShipping = subtotal > 200 ? 0 : 20;
	const total = subtotal + estimatedShipping;

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
				className={`absolute right-0 top-0 flex h-full w-[360px] max-w-[90vw] flex-col bg-white shadow-2xl transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}
			>
				<div className="flex items-center justify-between border-b px-5 py-4 flex-shrink-0">
					<h3 className="text-base font-semibold text-zinc-900">Your Cart</h3>
					<button onClick={onClose} aria-label="Close" className="text-zinc-600 hover:text-zinc-900">
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
						{items.length === 0 ? (
							<div className="py-12 text-center">
								<div className="mb-4 text-4xl">🛒</div>
								<p className="mb-2 text-sm font-medium text-zinc-900">Your cart is empty</p>
								<p className="mb-4 text-xs text-zinc-500">Add some items to get started!</p>
								<Button onClick={onClose} className="text-sm">
									<Link href="/">Continue Shopping</Link>
								</Button>
							</div>
						) : (
							<ul className="space-y-4">
								{items.map((it) => (
									<li key={`${it.id}-${it.colorId || "default"}`} className="flex gap-3">
										<Link
											href={`/products/${it.id}`}
											onClick={onClose}
											className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100"
										>
											{it.image ? (
												<img src={it.image} alt={it.name} className="h-full w-full object-cover" loading="lazy" />
											) : null}
										</Link>
										<div className="min-w-0 flex-1">
											<Link
												href={`/products/${it.id}`}
												onClick={onClose}
												className="truncate text-sm font-medium text-zinc-900 hover:text-[var(--brand-red)]"
											>
												{it.name}
											</Link>
											<div className="mt-0.5 text-xs text-zinc-500">
												{it.colorId ? `${it.colorId} • ` : ""}₵{it.price.toFixed(2)} each
											</div>

											{/* Quantity Controls */}
											<div className="mt-2 flex items-center gap-2">
												<div className="flex items-center rounded border border-zinc-200">
													<button
														onClick={() => updateItem(it.id, it.colorId, it.quantity - 1)}
														className="flex h-7 w-7 items-center justify-center hover:bg-zinc-50"
														aria-label="Decrease quantity"
													>
														<Minus className="h-3 w-3 text-zinc-600" />
													</button>
													<span className="flex h-7 min-w-[2rem] items-center justify-center text-xs font-medium">
														{it.quantity}
													</span>
													<button
														onClick={() => updateItem(it.id, it.colorId, it.quantity + 1)}
														className="flex h-7 w-7 items-center justify-center hover:bg-zinc-50"
														aria-label="Increase quantity"
													>
														<Plus className="h-3 w-3 text-zinc-600" />
													</button>
												</div>
												<div className="text-sm font-semibold text-zinc-900">
													₵{(it.price * it.quantity).toFixed(2)}
												</div>
											</div>
										</div>
										<div className="flex flex-col gap-1">
											<button
												onClick={() => {
													saveForLater(it);
													removeItem(it.id, it.colorId);
													showToast("Item saved for later", "success");
												}}
												className="rounded-md border border-zinc-200 p-1.5 text-zinc-600 hover:bg-zinc-50"
												aria-label="Save for later"
											>
												<Heart className="h-4 w-4" />
											</button>
											<button
												onClick={() => {
													removeItem(it.id, it.colorId);
													showToast("Item removed from cart", "info");
												}}
												className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50"
											>
												Remove
											</button>
										</div>
									</li>
								))}
							</ul>
						)}

						{/* Saved for Later Section */}
						{savedItems.length > 0 && (
							<div className="mt-8 border-t border-zinc-200 pt-6">
								<h4 className="mb-3 text-sm font-semibold text-zinc-900">Saved for Later</h4>
								<ul className="space-y-3">
									{savedItems.map((it) => (
										<li key={`saved-${it.id}-${it.colorId || "default"}`} className="flex gap-3">
											<Link
												href={`/products/${it.id}`}
												onClick={onClose}
												className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100"
											>
												{it.image ? (
													<img src={it.image} alt={it.name} className="h-full w-full object-cover" loading="lazy" />
												) : null}
											</Link>
											<div className="min-w-0 flex-1">
												<Link
													href={`/products/${it.id}`}
													onClick={onClose}
													className="truncate text-xs font-medium text-zinc-900 hover:text-[var(--brand-red)]"
												>
													{it.name}
												</Link>
												<div className="mt-0.5 text-xs text-zinc-500">₵{it.price.toFixed(2)}</div>
											</div>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>

				<div className="border-t px-5 py-4 bg-zinc-50 flex-shrink-0">
					<div className="mb-3 space-y-2 text-sm">
						<div className="flex items-center justify-between">
							<span className="text-zinc-600">Subtotal</span>
							<span className="font-semibold text-zinc-900">₵{subtotal.toFixed(2)}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-zinc-600">Shipping</span>
							<span className="font-semibold text-zinc-900">
								{subtotal > 200 ? (
									<span className="text-green-600">FREE</span>
								) : (
									`₵${estimatedShipping.toFixed(2)}`
								)}
							</span>
						</div>
						{subtotal < 200 && (
							<p className="text-xs text-green-600">
								Add ₵{(200 - subtotal).toFixed(2)} more for free shipping!
							</p>
						)}
						<div className="border-t border-zinc-200 pt-2 flex items-center justify-between font-semibold text-zinc-900">
							<span>Total</span>
							<span>₵{total.toFixed(2)}</span>
						</div>
					</div>
					<div className="space-y-2">
						<Button 
							className="w-full justify-center gap-2 py-3 text-base font-bold shadow-lg transition-all hover:shadow-xl" 
							onClick={onClose}
						>
							<Link href="/checkout" className="flex items-center justify-center gap-2 w-full">
								<CreditCard className="h-5 w-5" />
								Proceed to Payment
							</Link>
						</Button>
						<div className="flex gap-2">
							<Button 
								variant="outline" 
								className="flex-1" 
								onClick={onClose}
							>
								<Link href="/checkout" className="w-full text-center">Checkout</Link>
							</Button>
							{items.length > 0 && (
								<Button
									variant="outline"
									className="px-3"
									onClick={() => {
										clear();
										showToast("Cart cleared", "info");
									}}
									aria-label="Clear cart"
								>
									<X className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>
					<div className="mt-2 text-center text-[11px] text-zinc-500">
						Taxes calculated at checkout
					</div>
				</div>
			</aside>
		</div>
	);
}


