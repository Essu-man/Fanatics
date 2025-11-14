"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "./ui/button";
import { useCart } from "../providers/CartProvider";
import Modal from "./ui/modal";
import type { Product as PType } from "../../lib/products";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { Heart, ShoppingBag } from "lucide-react";
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
                className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl"
                role="article"
                aria-label={`Product: ${product.name}`}
            >
                <Link href={`/products/${product.id}`} className="relative block w-full overflow-hidden">
                    <div className="relative h-[200px] overflow-hidden bg-zinc-50">
                        <img
                            src={product.images?.[0] || `https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500&h=300&fit=crop`}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />
                        {product.images?.[1] && (
                            <img
                                src={product.images?.[1]}
                                alt={`${product.name} alt`}
                                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                loading="lazy"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        {/* Wishlist Button */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggle(product.id);
                            }}
                            aria-label="Toggle wishlist"
                            className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white hover:shadow-xl"
                        >
                            <Heart className={`h-4 w-4 transition-colors ${isSaved(product.id) ? "fill-[var(--brand-red)] text-[var(--brand-red)]" : "text-zinc-700"}`} />
                        </button>

                        {/* Quick View Overlay */}
                        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-white/95 p-2 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openModal();
                                }}
                                className="w-full justify-center gap-1 text-xs font-semibold py-1.5"
                                variant="outline"
                            >
                                Quick View
                            </Button>
                        </div>
                    </div>
                </Link>

                {/* Product Info */}
                <div className="flex flex-col px-3 py-2">
                    <Link href={`/products/${product.id}`} className="hover:text-[var(--brand-red)] transition-colors">
                        <h3 className="text-sm font-bold text-zinc-900 line-clamp-1">{product.name}</h3>
                        <p className="mt-0.5 text-xs text-zinc-500">{product.team}</p>
                    </Link>

                    {/* Price */}
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-base font-black text-zinc-900">₵{product.price.toFixed(2)}</span>
                    </div>

                    {/* Color Swatches */}
                    {product.colors && product.colors.length > 0 && (
                        <div className="mt-2 flex items-center gap-1.5">
                            <span className="text-xs font-medium text-zinc-500">Colors:</span>
                            <div className="flex gap-1">
                                {product.colors.map((color) => (
                                    <button
                                        key={color.id}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setSelectedColor(color.id);
                                        }}
                                        className={`h-4 w-4 rounded-full border-2 transition-all ${
                                            selectedColor === color.id
                                                ? "border-[var(--brand-red)] scale-110 ring-1 ring-[var(--brand-red)]/20"
                                                : "border-zinc-300 hover:border-zinc-400"
                                        }`}
                                        style={{ backgroundColor: color.hex }}
                                        aria-label={color.name}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity and Add to Cart */}
                    <div className="mt-2 space-y-1.5">
                        <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-0.5">
                            <button
                                onClick={decrementQuantity}
                                className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-white hover:text-[var(--brand-red)]"
                                aria-label="Decrease quantity"
                            >
                                <MinusIcon className="h-3 w-3" />
                            </button>
                            <span className="min-w-[1.5rem] text-center text-xs font-semibold text-zinc-900">
                                {quantity}
                            </span>
                            <button
                                onClick={incrementQuantity}
                                className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-white hover:text-[var(--brand-red)]"
                                aria-label="Increase quantity"
                            >
                                <PlusIcon className="h-3 w-3" />
                            </button>
                        </div>
                        <Button
                            className="w-full justify-center gap-1.5 py-1.5 text-xs font-bold shadow-md transition-all hover:shadow-lg"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToCart();
                            }}
                            aria-label={`Add ${product.name} to cart`}
                        >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            Add to Cart
                        </Button>
                    </div>
                </div>
            </article>
            <Modal open={open} onClose={() => setOpen(false)}>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    {/* Image Gallery */}
                    <div>
                        <div className="overflow-hidden rounded-xl bg-zinc-50">
                            <img 
                                src={selectedImage} 
                                alt={product.name} 
                                className="aspect-[3/4] w-full object-cover" 
                            />
                        </div>

                        {product.images && product.images.length > 1 && (
                            <div className="mt-4 flex gap-3">
                                {product.images.map((img) => (
                                    <button
                                        key={img}
                                        onClick={() => setSelectedImage(img)}
                                        className={`h-20 w-20 overflow-hidden rounded-lg border-2 transition-all ${
                                            selectedImage === img 
                                                ? "border-[var(--brand-red)] ring-2 ring-[var(--brand-red)]/20 scale-105" 
                                                : "border-zinc-200 hover:border-zinc-300"
                                        }`}
                                    >
                                        <img src={img} alt="" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col">
                        <h3 className="text-2xl font-black text-zinc-900">{product.name}</h3>
                        <p className="mt-2 text-base text-zinc-500">{product.team}</p>

                        <div className="mt-6">
                            <span className="text-3xl font-black text-zinc-900">₵{product.price.toFixed(2)}</span>
                        </div>

                        {/* Color Selection */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="mt-8">
                                <div className="mb-3 text-sm font-bold text-zinc-900">Select Color</div>
                                <div className="flex flex-wrap gap-3">
                                    {product.colors.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => setSelectedColor(c.id)}
                                            className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                                                selectedColor === c.id
                                                    ? "border-[var(--brand-red)] bg-red-50 text-[var(--brand-red)] shadow-md"
                                                    : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                                            }`}
                                        >
                                            <span 
                                                className="h-5 w-5 rounded-full border-2 border-white shadow-sm" 
                                                style={{ backgroundColor: c.hex ?? "#ddd" }} 
                                            />
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="mt-8">
                            <div className="mb-3 text-sm font-bold text-zinc-900">Quantity</div>
                            <div className="flex w-40 items-center rounded-xl border-2 border-zinc-200 bg-zinc-50">
                                <button
                                    onClick={decrementQuantity}
                                    className="flex h-12 w-12 items-center justify-center rounded-l-xl border-r-2 border-zinc-200 transition-colors hover:bg-white hover:text-[var(--brand-red)]"
                                >
                                    <MinusIcon className="h-5 w-5" />
                                </button>
                                <span className="flex h-12 flex-1 items-center justify-center text-base font-bold text-zinc-900">
                                    {quantity}
                                </span>
                                <button
                                    onClick={incrementQuantity}
                                    className="flex h-12 w-12 items-center justify-center rounded-r-xl border-l-2 border-zinc-200 transition-colors hover:bg-white hover:text-[var(--brand-red)]"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-col gap-3">
                            <Button 
                                className="w-full justify-center gap-2 py-3 text-base font-bold shadow-lg transition-all hover:shadow-xl" 
                                onClick={addToCart}
                            >
                                <ShoppingBag className="h-5 w-5" />
                                Add to Cart
                            </Button>
                            <Button 
                                as="button" 
                                variant="outline" 
                                className="w-full justify-center py-3 text-base font-semibold" 
                                onClick={() => setOpen(false)}
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}
