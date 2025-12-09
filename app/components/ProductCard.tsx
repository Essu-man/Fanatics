"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "./ui/button";
import { useCart } from "../providers/CartProvider";
import Modal from "./ui/modal";
import type { Product as PType } from "../../lib/products";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { Heart, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useWishlist } from "../providers/WishlistProvider";
import { useToast } from "./ui/ToastContainer";

export default function ProductCard({ product }: { product: PType }) {
    const router = useRouter();
    const { addItem } = useCart();
    const { toggle, isSaved } = useWishlist();
    const { showToast } = useToast();
    const [quantity, setQuantity] = useState(1);
    const [open, setOpen] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState<string | null>(product.colors?.[0]?.id ?? null);
    const [selectedSize, setSelectedSize] = useState<string>("M");
    const [jerseyType, setJerseyType] = useState<"fan" | "player">("fan");
    const [customization, setCustomization] = useState({
        playerName: "",
        playerNumber: "",
    });

    const images = product.images || [];
    const selectedImage = images[selectedImageIndex];
    const sizes = ["S", "M", "L", "XL"];

    // Check if product is out of stock
    const isOutOfStock = (product.available === false) || (product.stock !== undefined && product.stock === 0);

    function addToCart() {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            colorId: selectedColor,
            size: selectedSize,
            jerseyType,
            quantity,
            image: selectedImage,
            customization: customization.playerName || customization.playerNumber
                ? {
                    playerName: customization.playerName,
                    playerNumber: customization.playerNumber,
                }
                : undefined,
        });

        // Set added state to show checkout button
        setIsAdded(true);

        // Reset quantity and customization
        setQuantity(1);
        setCustomization({ playerName: "", playerNumber: "" });

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
        setSelectedImageIndex(0);
        setOpen(true);
        setIsAdded(false);
    }

    function nextImage() {
        if (images.length > 0) {
            setSelectedImageIndex((prev) => (prev + 1) % images.length);
        }
    }

    function prevImage() {
        if (images.length > 0) {
            setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    }

    // Reset to first image when modal opens
    useEffect(() => {
        if (open) {
            setSelectedImageIndex(0);
        }
    }, [open]);

    // Keyboard navigation
    useEffect(() => {
        if (!open || images.length <= 1) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "ArrowLeft") {
                setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
            } else if (e.key === "ArrowRight") {
                setSelectedImageIndex((prev) => (prev + 1) % images.length);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, images.length]);

    // Touch swipe support
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd || images.length <= 1) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            setSelectedImageIndex((prev) => (prev + 1) % images.length);
        }
        if (isRightSwipe) {
            setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    return (
        <>
            <article
                className={`group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl ${isOutOfStock ? 'opacity-60' : ''}`}
                role="article"
                aria-label={`Product: ${product.name}`}
            >
                <Link href={`/products/${product.id}`} className="relative block w-full overflow-hidden">
                    <div className="relative h-[200px] overflow-hidden bg-zinc-50">
                        <img
                            src={product.images?.[0] || `https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500&h=300&fit=crop`}
                            alt={product.name}
                            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'grayscale' : ''}`}
                            loading="lazy"
                        />
                        {product.images?.[1] && (
                            <img
                                src={product.images?.[1]}
                                alt={`${product.name} alt`}
                                className={`absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${isOutOfStock ? 'grayscale' : ''}`}
                                loading="lazy"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        {/* Out of Stock Overlay */}
                        {isOutOfStock && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                <div className="rounded-lg bg-white/95 px-4 py-2 shadow-xl">
                                    <p className="text-sm font-bold text-red-600">OUT OF STOCK</p>
                                </div>
                            </div>
                        )}

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
                                        className={`h-4 w-4 rounded-full border-2 transition-all ${selectedColor === color.id
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
                        {isOutOfStock ? (
                            <div className="rounded-lg border-2 border-red-200 bg-red-50 px-3 py-2 text-center">
                                <p className="text-xs font-bold text-red-600">OUT OF STOCK</p>
                            </div>
                        ) : (
                            <>
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
                                        openModal();
                                    }}
                                    aria-label={`View ${product.name}`}
                                >
                                    <ShoppingBag className="h-3.5 w-3.5" />
                                    View
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </article>
            <Modal open={open} onClose={() => setOpen(false)}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                    {/* Image Gallery Slider */}
                    <div>
                        <div
                            className="relative overflow-hidden rounded-xl bg-zinc-50 group"
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            {images.length > 0 && (
                                <>
                                    <img
                                        src={selectedImage}
                                        alt={product.name}
                                        className="aspect-[3/4] w-full object-cover transition-opacity duration-300 select-none"
                                        draggable={false}
                                    />

                                    {/* Navigation Arrows */}
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg opacity-0 transition-opacity hover:bg-white hover:shadow-xl group-hover:opacity-100"
                                                aria-label="Previous image"
                                            >
                                                <ChevronLeft className="h-5 w-5 text-zinc-900" />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg opacity-0 transition-opacity hover:bg-white hover:shadow-xl group-hover:opacity-100"
                                                aria-label="Next image"
                                            >
                                                <ChevronRight className="h-5 w-5 text-zinc-900" />
                                            </button>

                                            {/* Image Indicators */}
                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                                {images.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setSelectedImageIndex(index)}
                                                        className={`h-1.5 rounded-full transition-all ${selectedImageIndex === index
                                                            ? "w-6 bg-white"
                                                            : "w-1.5 bg-white/50 hover:bg-white/75"
                                                            }`}
                                                        aria-label={`Go to image ${index + 1}`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {images.length > 1 && (
                            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${selectedImageIndex === index
                                            ? "border-[var(--brand-red)] ring-2 ring-[var(--brand-red)]/20 scale-105"
                                            : "border-zinc-200 hover:border-zinc-300"
                                            }`}
                                    >
                                        <img src={img} alt={`${product.name} view ${index + 1}`} className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col">
                        <h3 className="text-xl sm:text-2xl font-black text-zinc-900">{product.name}</h3>
                        <p className="mt-2 text-sm sm:text-base text-zinc-500">{product.team}</p>

                        <div className="mt-4 sm:mt-6">
                            <span className="text-2xl sm:text-3xl font-black text-zinc-900">₵{product.price.toFixed(2)}</span>
                        </div>

                        {/* Jersey Type */}
                        <div className="mt-4 sm:mt-6">
                            <div className="mb-2 sm:mb-3 text-xs sm:text-sm font-bold text-zinc-900">Jersey Type</div>
                            <div className="flex gap-2">
                                <button
                                    className={`px-3 py-2 rounded-md border-2 text-xs sm:text-sm font-semibold transition-all ${jerseyType === 'fan' ? 'border-[var(--brand-red)] bg-red-50 text-[var(--brand-red)]' : 'border-zinc-200 hover:border-zinc-300'}`}
                                    onClick={() => setJerseyType('fan')}
                                >
                                    Fan Version
                                </button>
                                <button
                                    className={`px-3 py-2 rounded-md border-2 text-xs sm:text-sm font-semibold transition-all ${jerseyType === 'player' ? 'border-[var(--brand-red)] bg-red-50 text-[var(--brand-red)]' : 'border-zinc-200 hover:border-zinc-300'}`}
                                    onClick={() => setJerseyType('player')}
                                >
                                    Player Version
                                </button>
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div className="mt-4 sm:mt-8">
                            <div className="mb-2 sm:mb-3 text-xs sm:text-sm font-bold text-zinc-900">Select Size</div>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg border-2 text-xs sm:text-sm font-bold transition-all ${selectedSize === size
                                            ? "border-[var(--brand-red)] bg-red-50 text-[var(--brand-red)] shadow-md"
                                            : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Selection */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="mt-4 sm:mt-8">
                                <div className="mb-2 sm:mb-3 text-xs sm:text-sm font-bold text-zinc-900">Select Color</div>
                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                    {product.colors.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => setSelectedColor(c.id)}
                                            className={`flex items-center gap-1.5 sm:gap-2 rounded-full border-2 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all ${selectedColor === c.id
                                                ? "border-[var(--brand-red)] bg-red-50 text-[var(--brand-red)] shadow-md"
                                                : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                                                }`}
                                        >
                                            <span
                                                className="h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 border-white shadow-sm"
                                                style={{ backgroundColor: c.hex ?? "#ddd" }}
                                            />
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Jersey Customization - Show for all products that could be jerseys */}
                        <div className="mt-4 sm:mt-8 rounded-lg border-2 border-dashed border-zinc-300 bg-gradient-to-br from-zinc-50 to-white p-3 sm:p-5">
                            <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-semibold text-zinc-900 flex items-center gap-2">
                                <span className="text-base sm:text-lg">⚽</span>
                                <span>Customize Your Jersey</span>
                                <span className="ml-auto text-[10px] sm:text-xs font-normal text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">Optional</span>
                            </h3>
                            <div className="space-y-3 sm:space-y-4">
                                {/* Name and Number Side by Side */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    {/* Player Name - Takes more space */}
                                    <div className="flex-1">
                                        <label htmlFor="modal-playerName" className="mb-1.5 block text-[10px] sm:text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                                            Name
                                        </label>
                                        <input
                                            id="modal-playerName"
                                            type="text"
                                            maxLength={12}
                                            value={customization.playerName}
                                            onChange={(e) => setCustomization(prev => ({
                                                ...prev,
                                                playerName: e.target.value.toUpperCase()
                                            }))}
                                            placeholder="RONALDO"
                                            className="w-full rounded-lg border-2 border-zinc-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 placeholder:font-normal focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 transition-all"
                                        />
                                        <p className="mt-1 text-[10px] sm:text-xs text-zinc-500">
                                            {customization.playerName.length}/12 chars
                                        </p>
                                    </div>

                                    {/* Player Number - Smaller */}
                                    <div className="w-full sm:w-24">
                                        <label htmlFor="modal-playerNumber" className="mb-1.5 block text-[10px] sm:text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                                            #
                                        </label>
                                        <input
                                            id="modal-playerNumber"
                                            type="text"
                                            maxLength={2}
                                            value={customization.playerNumber}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^0-9]/g, '');
                                                setCustomization(prev => ({
                                                    ...prev,
                                                    playerNumber: value
                                                }));
                                            }}
                                            placeholder="7"
                                            className="w-full text-center rounded-lg border-2 border-zinc-300 bg-white px-3 py-2 sm:py-2.5 text-base sm:text-lg font-bold text-zinc-900 placeholder:text-zinc-400 placeholder:font-normal focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 transition-all"
                                        />
                                        <p className="mt-1 text-[10px] sm:text-xs text-zinc-500 text-center">0-99</p>
                                    </div>
                                </div>

                                {/* Preview */}
                                {(customization.playerName || customization.playerNumber) && (
                                    <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-3 sm:p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] sm:text-xs font-semibold text-blue-900 uppercase tracking-wide">Preview</p>
                                            <span className="text-[10px] sm:text-xs text-blue-700">✓ Customization Active</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-white rounded-md px-2 sm:px-3 py-1.5 sm:py-2 border border-blue-300">
                                                <p className="text-sm sm:text-base lg:text-lg font-black text-zinc-900 tracking-wide">
                                                    {customization.playerName || <span className="text-zinc-400">NAME</span>}
                                                </p>
                                            </div>
                                            {customization.playerNumber && (
                                                <div className="bg-white rounded-md px-2 sm:px-3 py-1.5 sm:py-2 border border-blue-300 min-w-[50px] sm:min-w-[60px] text-center">
                                                    <p className="text-lg sm:text-xl lg:text-2xl font-black text-[var(--brand-red)]">
                                                        #{customization.playerNumber}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Info Tip */}
                                <div className="flex items-start gap-2 p-2 sm:p-3 rounded-lg bg-amber-50 border border-amber-200">
                                    <span className="text-sm sm:text-base">💡</span>
                                    <p className="text-[10px] sm:text-xs text-amber-900 leading-relaxed">
                                        <span className="font-semibold">Pro Tip:</span> Add your favorite player's name or personalize it with your own!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="mt-4 sm:mt-8">
                            <div className="mb-2 sm:mb-3 text-xs sm:text-sm font-bold text-zinc-900">Quantity</div>
                            <div className="flex w-32 sm:w-40 items-center rounded-xl border-2 border-zinc-200 bg-zinc-50">
                                <button
                                    onClick={decrementQuantity}
                                    className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-l-xl border-r-2 border-zinc-200 transition-colors hover:bg-white hover:text-[var(--brand-red)]"
                                >
                                    <MinusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                                <span className="flex h-10 sm:h-12 flex-1 items-center justify-center text-sm sm:text-base font-bold text-zinc-900">
                                    {quantity}
                                </span>
                                <button
                                    onClick={incrementQuantity}
                                    className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-r-xl border-l-2 border-zinc-200 transition-colors hover:bg-white hover:text-[var(--brand-red)]"
                                >
                                    <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 sm:mt-8 flex flex-col gap-2 sm:gap-3">
                            {isOutOfStock ? (
                                <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 text-center">
                                    <p className="text-base font-bold text-red-600">OUT OF STOCK</p>
                                    <p className="mt-1 text-xs text-red-500">This item is currently unavailable</p>
                                </div>
                            ) : (
                                <>
                                    {!isAdded ? (
                                        <>
                                            <Button
                                                className="w-full justify-center gap-2 py-2.5 sm:py-3 text-sm sm:text-base font-bold shadow-lg transition-all hover:shadow-xl"
                                                onClick={addToCart}
                                            >
                                                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                                                Add to Cart
                                            </Button>
                                            <Button
                                                as="button"
                                                variant="outline"
                                                className="w-full justify-center py-2.5 sm:py-3 text-sm sm:text-base font-semibold"
                                                onClick={() => setOpen(false)}
                                            >
                                                Continue Shopping
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-full rounded-lg bg-green-50 border-2 border-green-200 py-3 text-center">
                                                <p className="text-sm font-bold text-green-600">✓ Added to Cart</p>
                                            </div>
                                            <Button
                                                className="w-full justify-center py-2.5 sm:py-3 text-sm sm:text-base font-bold shadow-lg transition-all hover:shadow-xl"
                                                onClick={() => {
                                                    setOpen(false);
                                                    router.push("/checkout");
                                                }}
                                            >
                                                Proceed to Checkout
                                            </Button>
                                            <Button
                                                as="button"
                                                variant="outline"
                                                className="w-full justify-center py-2.5 sm:py-3 text-sm sm:text-base font-semibold"
                                                onClick={() => {
                                                    setOpen(false);
                                                    setIsAdded(false);
                                                }}
                                            >
                                                Continue Shopping
                                            </Button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}
