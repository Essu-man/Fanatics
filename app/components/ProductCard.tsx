"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "./ui/button";
import { useCart } from "../providers/CartProvider";
import Modal from "./ui/modal";
import type { Product as PType } from "../../lib/products";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { Heart } from "lucide-react";
import { useWishlist } from "../providers/WishlistProvider";
import { useToast } from "./ui/ToastContainer";

export default function ProductCard({ product }: { product: PType }) {
    const { addItem } = useCart();
    const { toggle, isSaved } = useWishlist();
    const { showToast } = useToast();
    const [quantity, setQuantity] = useState(1);
    const [open, setOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | undefined>(product.images?.[0]);
    const [selectedColor, setSelectedColor] = useState<string | null>(product.colors?.[0]?.id ?? null);

    function addToCart() {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            colorId: selectedColor,
            quantity,
            image: selectedImage
        });

        // Close modal if it's open
        if (open) {
            setOpen(false);
        }

        // Reset quantity
        setQuantity(1);

        // Show toast notification
        showToast(`${product.name} added to cart!`, "success");
    }

    function incrementQuantity() {
        setQuantity(q => Math.min(q + 1, 10));
    }

    function decrementQuantity() {
        setQuantity(q => Math.max(q - 1, 1));
    }

    function openModal() {
        setSelectedImage(product.images?.[0]);
        setOpen(true);
    }

    return (
        <>
            <article
                className="group relative flex w-72 flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md"
                role="article"
                aria-label={`Product: ${product.name}`}
            >
                <Link href={`/products/${product.id}`} className="relative block w-full overflow-hidden">
                    <div className="relative h-[200px]">
                        <img
                            src={product.images?.[0] || `https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500&h=300&fit=crop`}
                            alt={product.name}
                            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                            loading="lazy"
                        />
                        {product.images?.[1] && (
                            <img
                                src={product.images?.[1]}
                                alt={`${product.name} alt`}
                                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                loading="lazy"
                            />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggle(product.id);
                        }}
                        aria-label="Toggle wishlist"
                        className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-2 text-zinc-700 shadow hover:text-[var(--brand-red)]"
                    >
                        <Heart className={`h-4 w-4 ${isSaved(product.id) ? "fill-[var(--brand-red)] text-[var(--brand-red)]" : ""}`} />
                    </button>
                </Link>

                <div className="flex flex-col bg-white px-3 py-2">
                    <Link href={`/products/${product.id}`} className="hover:text-[var(--brand-red)] transition-colors">
                        <h3 className="text-sm font-medium text-zinc-900 line-clamp-1">{product.name}</h3>
                        <p className="text-xs text-zinc-500">{product.team}</p>
                    </Link>

                    <div className="mt-2">
                        <div className="mb-2 flex items-center justify-between">
                            <div className="text-sm font-semibold text-zinc-900">₵{product.price.toFixed(2)}</div>
                            <div className="flex h-6 items-center divide-x divide-zinc-100 rounded border border-zinc-100 bg-zinc-50 text-xs">
                                <button
                                    onClick={decrementQuantity}
                                    className="flex h-full w-6 items-center justify-center transition-colors hover:bg-white"
                                >
                                    <MinusIcon className="h-3 w-3 text-zinc-600" />
                                </button>
                                <span className="flex h-full min-w-[1.5rem] items-center justify-center font-medium">
                                    {quantity}
                                </span>
                                <button
                                    onClick={incrementQuantity}
                                    className="flex h-full w-6 items-center justify-center transition-colors hover:bg-white"
                                >
                                    <PlusIcon className="h-3 w-3 text-zinc-600" />
                                </button>
                            </div>
                        </div>
                        <Button
                            className="w-full justify-center py-1 text-xs font-medium"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToCart();
                            }}
                            aria-label={`Add ${product.name} to cart`}
                        >
                            Add to Cart
                        </Button>
                    </div>
                </div>
            </article>
            <Modal open={open} onClose={() => setOpen(false)}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <div className="rounded-md bg-zinc-100 p-4">
                            <img src={selectedImage} alt={product.name} className="w-full object-cover" />
                        </div>

                        <div className="mt-3 flex gap-3">
                            {product.images?.map((img) => (
                                <button
                                    key={img}
                                    onClick={() => setSelectedImage(img)}
                                    className={`h-16 w-16 overflow-hidden rounded-md border ${selectedImage === img ? "border-[var(--brand-red)]" : "border-zinc-200"}`}
                                >
                                    <img src={img} className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <p className="mt-1 text-sm text-zinc-500">{product.team}</p>

                        <div className="mt-4 text-xl font-bold text-zinc-900">₵{product.price.toFixed(2)}</div>

                        <div className="mt-6">
                            <div className="text-sm font-medium text-zinc-900">Colors</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {product.colors?.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelectedColor(c.id)}
                                        className={`flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs transition-colors ${selectedColor === c.id ? "border-[var(--brand-red)] bg-red-50 text-[var(--brand-red)]" : "border-zinc-200 hover:border-zinc-300"}`}
                                    >
                                        <span className="inline-block h-3 w-3 rounded-sm" style={{ background: c.hex ?? "#ddd" }} />
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="mb-4 flex w-40 items-center rounded-lg border border-zinc-200">
                                <button
                                    onClick={decrementQuantity}
                                    className="flex h-10 w-10 items-center justify-center border-r border-zinc-200 hover:bg-zinc-50"
                                >
                                    <MinusIcon className="h-4 w-4 text-zinc-600" />
                                </button>
                                <span className="flex h-10 flex-1 items-center justify-center text-sm font-medium">
                                    {quantity}
                                </span>
                                <button
                                    onClick={incrementQuantity}
                                    className="flex h-10 w-10 items-center justify-center border-l border-zinc-200 hover:bg-zinc-50"
                                >
                                    <PlusIcon className="h-4 w-4 text-zinc-600" />
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <Button className="px-4 py-2" onClick={addToCart}>Add to cart</Button>
                                <Button as="button" variant="ghost" className="px-4 py-2" onClick={() => setOpen(false)}>
                                    Continue shopping
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}
