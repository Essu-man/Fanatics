"use client";

import { useState } from "react";
import { ShoppingBag, Heart } from "lucide-react";
import Button from "@/app/components/ui/button";
import { useCart } from "@/app/providers/CartProvider";
import Modal from "@/app/components/ui/modal";
import type { Product as PType } from "@/lib/products";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select";

type ColorOption = {
    id: string;
    name: string;
    hex: string;
    image?: string;
};

export default function ProductCard({ product }: { product: PType }) {
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [open, setOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<ColorOption | null>(
        product.colors?.[0] ?? null
    );

    function handleAddToCart() {
        if (!selectedVariant) return;

        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            colorId: selectedVariant.id,
            quantity,
            image: selectedVariant.image || product.images?.[0]
        });

        // Reset state
        setOpen(false);
        setQuantity(1);
    }

    return (
        <article className="group relative flex flex-col">
            {/* Product Image */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-50">
                <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className={`h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105 ${((product as any).stock === 0 || (product as any).available === false) ? 'grayscale' : ''}`}
                />

                {/* Quick View Button */}
                <button
                    onClick={() => setOpen(true)}
                    className="absolute inset-x-4 bottom-4 flex items-center justify-center gap-2 rounded-lg bg-white/90 py-2 text-sm font-medium text-zinc-900 backdrop-blur transition-opacity group-hover:opacity-100 lg:opacity-0"
                >
                    Quick View
                </button>

                {/* Wishlist Button */}
                <button className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-900 backdrop-blur transition-opacity hover:text-red-500 group-hover:opacity-100 lg:opacity-0">
                    <Heart className="h-4 w-4" />
                </button>

                {/* Sale Badge */}
                {product.salePrice && (
                    <div className="absolute left-4 top-4 rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">
                        Sale
                    </div>
                )}

                {/* Out of Stock Badge */}
                {((product as any).stock !== undefined && (product as any).stock === 0) ||
                    ((product as any).available === false) ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/60 backdrop-blur-[2px]">
                        <div className="rounded bg-white/95 px-3 py-1.5 shadow-xl border border-red-100">
                            <p className="text-xs font-black text-red-600 tracking-wider">OUT OF STOCK</p>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Product Info */}
            <div className="flex flex-1 flex-col p-4">
                <h3 className="text-sm font-medium text-zinc-900">
                    {product.name}
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                    {product.team}
                </p>

                <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-medium text-zinc-900">
                        ₵{product.price.toFixed(2)}
                    </span>
                    {product.salePrice && (
                        <span className="text-sm text-zinc-500 line-through">
                            ₵{product.salePrice.toFixed(2)}
                        </span>
                    )}
                </div>

                {/* Color Options */}
                {product.colors && product.colors.length > 0 && (
                    <div className="mt-3 flex gap-1">
                        {product.colors.map((color) => (
                            <button
                                key={color.id}
                                onClick={() => setSelectedVariant(color)}
                                className={`h-6 w-6 rounded-full border-2 ${selectedVariant?.id === color.id
                                    ? "border-[var(--brand-red)]"
                                    : "border-transparent"
                                    }`}
                                style={{ background: color.hex }}
                            />
                        ))}
                    </div>
                )}
                {/* Sizes */}
                {product.sizes && product.sizes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                            <span key={size} className="px-2 py-0.5 rounded bg-zinc-100 text-xs font-semibold text-zinc-700 border border-zinc-200">
                                {size}
                            </span>
                        ))}
                    </div>
                )}

                {/* Add to Cart */}
                {((product as any).stock !== undefined && (product as any).stock === 0) ||
                    ((product as any).available === false) ? (
                    <Button
                        disabled
                        className="mt-4 w-full justify-center gap-2 text-sm opacity-50 cursor-not-allowed"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        Out of Stock
                    </Button>
                ) : (
                    <Button
                        onClick={handleAddToCart}
                        className="mt-4 w-full justify-center gap-2 text-sm"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        Add to Cart
                    </Button>
                )}
            </div>

            {/* Quick View Modal */}
            <Modal open={open} onClose={() => setOpen(false)}>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Product Images */}
                    <div>
                        <div className="aspect-[4/5] overflow-hidden rounded-lg bg-zinc-50">
                            <img
                                src={selectedVariant?.image || product.images?.[0]}
                                alt={product.name}
                                className="h-full w-full object-cover object-center"
                            />
                        </div>

                        {product.images && product.images.length > 1 && (
                            <div className="mt-3 grid grid-cols-4 gap-3">
                                {product.images.map((image) => (
                                    <button
                                        key={image}
                                        className="aspect-square overflow-hidden rounded-lg border border-zinc-200"
                                    >
                                        <img
                                            src={image}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col">
                        <h2 className="text-xl font-medium text-zinc-900">
                            {product.name}
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            {product.team}
                        </p>

                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-2xl font-medium text-zinc-900">
                                ₵{product.price.toFixed(2)}
                            </span>
                            {product.salePrice && (
                                <span className="text-lg text-zinc-500 line-through">
                                    ₵{product.salePrice.toFixed(2)}
                                </span>
                            )}
                        </div>

                        {/* Color Options */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-zinc-900">
                                    Color
                                </h3>
                                <div className="mt-2 flex gap-2">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color.id}
                                            onClick={() => setSelectedVariant(color)}
                                            className={`group flex items-center gap-2 rounded-full border p-1 ${selectedVariant?.id === color.id
                                                ? "border-[var(--brand-red)]"
                                                : "border-transparent hover:border-zinc-200"
                                                }`}
                                        >
                                            <span
                                                className="h-8 w-8 rounded-full"
                                                style={{ background: color.hex }}
                                            />
                                            <span className="pr-2 text-sm text-zinc-900">
                                                {color.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Sizes */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-zinc-900">
                                    Available Sizes
                                </h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {product.sizes.map((size) => (
                                        <span key={size} className="px-2 py-0.5 rounded bg-zinc-100 text-xs font-semibold text-zinc-700 border border-zinc-200">
                                            {size}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-zinc-900">
                                Quantity
                            </h3>
                            <Select
                                value={quantity.toString()}
                                onValueChange={(value) => setQuantity(Number(value))}
                            >
                                <SelectTrigger className="mt-2 w-24">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                        <SelectItem key={n} value={n.toString()}>
                                            {n}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Add to Cart */}
                        <div className="mt-6 flex gap-3">
                            {((product as any).stock !== undefined && (product as any).stock === 0) ||
                                ((product as any).available === false) ? (
                                <Button
                                    disabled
                                    className="flex-1 justify-center gap-2 opacity-50 cursor-not-allowed"
                                >
                                    <ShoppingBag className="h-4 w-4" />
                                    Out of Stock
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleAddToCart}
                                    className="flex-1 justify-center gap-2"
                                >
                                    <ShoppingBag className="h-4 w-4" />
                                    Add to Cart
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 px-4"
                            >
                                <Heart className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Product Description */}
                        <div className="mt-8 border-t border-zinc-200 pt-6">
                            <h3 className="text-sm font-medium text-zinc-900">
                                Description
                            </h3>
                            <p className="mt-2 text-sm text-zinc-500">
                                {product.description || "No description available."}
                            </p>
                        </div>
                    </div>
                </div>
            </Modal>
        </article>
    );
}