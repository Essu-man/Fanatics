"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Heart, Share2, ZoomIn, Plus, Minus, ChevronRight, X } from "lucide-react";
import Header from "../../components/Header";
import SportsNav from "../../components/SportsNav";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import ProductRecommendations from "../../components/ProductRecommendations";
import { useToast } from "../../components/ui/ToastContainer";
import { useCart } from "../../providers/CartProvider";
import { useWishlist } from "../../providers/WishlistProvider";
import type { Product } from "../../../lib/firestore";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.productId as string;
    const { addItem } = useCart();
    const { toggle, isSaved } = useWishlist();
    const { showToast } = useToast();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [jerseyType, setJerseyType] = useState<"fan" | "player">("fan");
    const [quantity, setQuantity] = useState(1);
    const [imageZoom, setImageZoom] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [customization, setCustomization] = useState({
        playerName: "",
        playerNumber: "",
    });

    useEffect(() => {
        setLoading(true);

        // Try to fetch from database via API
        fetch(`/api/products/${productId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.product) {
                    setProduct(data.product);
                    setSelectedImage(data.product.images?.[0] || "");
                    setSelectedImageIndex(0);
                    setSelectedColor(data.product.colors?.[0]?.id || null);
                    // Set default size from product's available sizes
                    if (data.product.sizes && data.product.sizes.length > 0) {
                        setSelectedSize(data.product.sizes[0]);
                    }
                    setLoading(false);
                } else {
                    // Fallback: Try to fetch from team products API
                    const teamId = productId.split("-").slice(0, -2).join("-");
                    if (teamId) {
                        fetch(`/api/teams/${teamId}`)
                            .then((res) => res.json())
                            .then((teamData) => {
                                if (teamData.products) {
                                    const teamProduct = teamData.products.find((p: Product) => p.id === productId);
                                    if (teamProduct) {
                                        setProduct(teamProduct);
                                        setSelectedImage(teamProduct.images?.[0] || "");
                                        setSelectedImageIndex(0);
                                        setSelectedColor(teamProduct.colors?.[0]?.id || null);
                                        // Set default size from product's available sizes
                                        if (teamProduct.sizes && teamProduct.sizes.length > 0) {
                                            setSelectedSize(teamProduct.sizes[0]);
                                        }
                                        setLoading(false);
                                    } else {
                                        setProduct(null);
                                        setLoading(false);
                                    }
                                } else {
                                    setProduct(null);
                                    setLoading(false);
                                }
                            })
                            .catch(() => {
                                setProduct(null);
                                setLoading(false);
                            });
                    } else {
                        setProduct(null);
                        setLoading(false);
                    }
                }
            })
            .catch(() => {
                // If API fails, try team products as fallback
                const teamId = productId.split("-").slice(0, -2).join("-");
                if (teamId) {
                    fetch(`/api/teams/${teamId}`)
                        .then((res) => res.json())
                        .then((teamData) => {
                            if (teamData.products) {
                                const teamProduct = teamData.products.find((p: Product) => p.id === productId);
                                if (teamProduct) {
                                    setProduct(teamProduct);
                                    setSelectedImage(teamProduct.images?.[0] || "");
                                    setSelectedImageIndex(0);
                                    setSelectedColor(teamProduct.colors?.[0]?.id || null);
                                    setLoading(false);
                                } else {
                                    setProduct(null);
                                    setLoading(false);
                                }
                            } else {
                                setProduct(null);
                                setLoading(false);
                            }
                        })
                        .catch(() => {
                            setProduct(null);
                            setLoading(false);
                        });
                } else {
                    setProduct(null);
                    setLoading(false);
                }
            });
    }, [productId]);

    useEffect(() => {
        if (product) {
            // Track viewed product
            const viewed = JSON.parse(localStorage.getItem("cediman:recentlyViewed") || "[]");
            const updated = [product.id, ...viewed.filter((id: string) => id !== product.id)].slice(0, 10);
            localStorage.setItem("cediman:recentlyViewed", JSON.stringify(updated));
        }
    }, [product]);

    // Keep main selected image in sync with current index
    useEffect(() => {
        if (product?.images?.length) {
            const img = product.images[selectedImageIndex] || product.images[0];
            setSelectedImage(img);
        }
    }, [selectedImageIndex, product]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white text-zinc-900">
                <Header />
                <SportsNav />
                <div className="mx-auto max-w-7xl px-6 py-12">
                    <div className="flex items-center justify-center py-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-[var(--brand-red)]" aria-label="Loading" />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white text-zinc-900">
                <Header />
                <SportsNav />
                <div className="mx-auto max-w-7xl px-6 py-12">
                    <div className="text-center py-12">
                        <p className="text-lg text-zinc-600 mb-4">Product not found.</p>
                        <button
                            onClick={() => router.back()}
                            className="text-[var(--brand-red)] hover:underline"
                        >
                            Go back
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const handleAddToCart = () => {
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
        const customText = customization.playerName || customization.playerNumber
            ? ` with ${[customization.playerName, customization.playerNumber].filter(Boolean).join(' #')}`
            : '';
        showToast(`${product.name}${customText} added to cart!`, "success");
        setIsAdded(true);
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900">
            <Header />
            <SportsNav />
            <div className="mx-auto max-w-7xl px-6 py-12">
                {/* Breadcrumb */}
                <div className="mb-6 flex items-center gap-2 text-sm">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1 text-zinc-600 hover:text-[var(--brand-red)] transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back</span>
                    </button>
                    <span className="text-zinc-400">/</span>
                    <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
                        Home
                    </Link>
                    <span className="text-zinc-400">/</span>
                    {product.team && (
                        <>
                            <Link href={`/teams/${product.team.toLowerCase().replace(/\s+/g, "-")}`} className="text-blue-600 hover:text-blue-800 underline">
                                {product.team}
                            </Link>
                            <span className="text-zinc-400">/</span>
                        </>
                    )}
                    <span className="text-zinc-900">{product.name}</span>
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-16">
                    {/* Image Gallery */}
                    <div className="relative">
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
                            <img
                                src={selectedImage || product.images?.[0]}
                                alt={product.name}
                                className="h-full w-full object-cover cursor-zoom-in"
                                onClick={() => setImageZoom(true)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        setImageZoom(true);
                                    }
                                }}
                                tabIndex={0}
                                role="button"
                                aria-label="Zoom product image"
                                loading="lazy"
                            />
                            {product.salePrice && (
                                <div className="absolute left-4 top-4 rounded bg-red-600 px-3 py-1 text-sm font-medium text-white">
                                    Sale
                                </div>
                            )}
                            <button
                                onClick={() => toggle(product.id)}
                                className="absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow-md hover:bg-white transition-colors"
                                aria-label="Toggle wishlist"
                            >
                                <Heart className={`h-5 w-5 ${isSaved(product.id) ? "fill-[var(--brand-red)] text-[var(--brand-red)]" : "text-zinc-700"}`} />
                            </button>

                            {/* Navigation Arrows on main image */}
                            {product.images && product.images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft className="h-5 w-5 text-zinc-900" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedImageIndex((prev) => (prev + 1) % product.images.length)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight className="h-5 w-5 text-zinc-900" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {product.images && product.images.length > 1 && (
                            <div className="mt-4 flex gap-2 overflow-x-auto">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => { setSelectedImage(img); setSelectedImageIndex(idx); }}
                                        className={`flex-shrink-0 overflow-hidden rounded-md border-2 transition-all ${selectedImage === img || (!selectedImage && idx === 0)
                                            ? "border-[var(--brand-red)]"
                                            : "border-zinc-200 hover:border-zinc-300"
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`${product.name} view ${idx + 1}`}
                                            className="h-20 w-20 object-cover"
                                            loading="lazy"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 mb-2">{product.name}</h1>
                        {product.team && (
                            <p className="text-lg text-zinc-600 mb-4">{product.team}</p>
                        )}

                        <div className="mb-6 flex items-center gap-3">
                            <span className="text-3xl font-bold text-zinc-900">
                                ₵{product.salePrice ? product.salePrice.toFixed(2) : product.price.toFixed(2)}
                            </span>
                            {product.salePrice && (
                                <>
                                    <span className="text-xl text-zinc-500 line-through">
                                        ₵{product.price.toFixed(2)}
                                    </span>
                                    <span className="rounded bg-red-100 px-2 py-1 text-sm font-medium text-red-700">
                                        {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Color Selection */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-medium text-zinc-900">
                                    Color: {product.colors.find((c) => c.id === selectedColor)?.name || "Select"}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color.id}
                                            onClick={() => setSelectedColor(color.id)}
                                            className={`flex items-center gap-2 rounded-md border-2 px-3 py-2 text-sm transition-all ${selectedColor === color.id
                                                ? "border-[var(--brand-red)] bg-red-50"
                                                : "border-zinc-200 hover:border-zinc-300"
                                                }`}
                                        >
                                            <span
                                                className="h-5 w-5 rounded-full border border-zinc-300"
                                                style={{ backgroundColor: color.hex }}
                                            />
                                            <span>{color.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Jersey Type */}
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-zinc-900">
                                Jersey Type
                            </label>
                            <div className="flex gap-2">
                                <button
                                    className={`px-3 py-2 rounded-md border-2 text-sm font-semibold transition-all ${jerseyType === 'fan' ? 'border-[var(--brand-red)] bg-red-50 text-[var(--brand-red)]' : 'border-zinc-200 hover:border-zinc-300'}`}
                                    onClick={() => setJerseyType('fan')}
                                    type="button"
                                >
                                    Fan Version
                                </button>
                                <button
                                    className={`px-3 py-2 rounded-md border-2 text-sm font-semibold transition-all ${jerseyType === 'player' ? 'border-[var(--brand-red)] bg-red-50 text-[var(--brand-red)]' : 'border-zinc-200 hover:border-zinc-300'}`}
                                    onClick={() => setJerseyType('player')}
                                    type="button"
                                >
                                    Player Version
                                </button>
                            </div>
                        </div>

                        {/* Size Selection */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-medium text-zinc-900">
                                    Size: {selectedSize}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`h-10 w-10 rounded-md border-2 text-sm font-medium transition-all ${selectedSize === size
                                                ? "border-[var(--brand-red)] bg-red-50 text-[var(--brand-red)]"
                                                : "border-zinc-200 hover:border-zinc-300"
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Jersey Customization - Show for all products */}
                        <div className="mb-6 rounded-lg border-2 border-dashed border-zinc-300 bg-gradient-to-br from-zinc-50 to-white p-4 sm:p-5">
                            <h3 className="mb-4 text-sm font-semibold text-zinc-900 flex items-center gap-2">
                                <span className="text-lg">⚽</span>
                                <span>Customize Your Jersey</span>
                                <span className="ml-auto text-xs font-normal text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">Optional</span>
                            </h3>
                            <div className="space-y-4">
                                {/* Name and Number Side by Side */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    {/* Player Name - Takes more space */}
                                    <div className="flex-1">
                                        <label htmlFor="playerName" className="mb-1.5 block text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                                            Name
                                        </label>
                                        <input
                                            id="playerName"
                                            type="text"
                                            maxLength={12}
                                            value={customization.playerName}
                                            onChange={(e) => setCustomization(prev => ({
                                                ...prev,
                                                playerName: e.target.value.toUpperCase()
                                            }))}
                                            placeholder="RONALDO"
                                            className="w-full rounded-lg border-2 border-zinc-300 bg-white px-3 sm:px-4 py-2.5 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 placeholder:font-normal focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 transition-all"
                                        />
                                        <p className="mt-1 text-xs text-zinc-500">
                                            {customization.playerName.length}/12 chars
                                        </p>
                                    </div>

                                    {/* Player Number - Smaller */}
                                    <div className="w-full sm:w-24">
                                        <label htmlFor="playerNumber" className="mb-1.5 block text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                                            #
                                        </label>
                                        <input
                                            id="playerNumber"
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
                                            className="w-full text-center rounded-lg border-2 border-zinc-300 bg-white px-3 py-2.5 text-lg font-bold text-zinc-900 placeholder:text-zinc-400 placeholder:font-normal focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 transition-all"
                                        />
                                        <p className="mt-1 text-xs text-zinc-500 text-center">0-99</p>
                                    </div>
                                </div>

                                {/* Preview */}
                                {(customization.playerName || customization.playerNumber) && (
                                    <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">Preview</p>
                                            <span className="text-xs text-blue-700">✓ Customization Active</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-white rounded-md px-3 py-2 border border-blue-300">
                                                <p className="text-base sm:text-lg font-black text-zinc-900 tracking-wide">
                                                    {customization.playerName || <span className="text-zinc-400">NAME</span>}
                                                </p>
                                            </div>
                                            {customization.playerNumber && (
                                                <div className="bg-white rounded-md px-3 py-2 border border-blue-300 min-w-[60px] text-center">
                                                    <p className="text-xl sm:text-2xl font-black text-[var(--brand-red)]">
                                                        #{customization.playerNumber}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Info Tip */}
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                                    <span className="text-base">💡</span>
                                    <p className="text-xs text-amber-900 leading-relaxed">
                                        <span className="font-semibold">Pro Tip:</span> Add your favorite player's name or personalize it with your own!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-zinc-900">Quantity</label>
                            <div className="flex w-32 items-center rounded-lg border border-zinc-200">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="flex h-10 w-10 items-center justify-center border-r border-zinc-200 hover:bg-zinc-50"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="flex h-10 flex-1 items-center justify-center text-sm font-medium">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                                    className="flex h-10 w-10 items-center justify-center border-l border-zinc-200 hover:bg-zinc-50"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mb-6 space-y-3">
                            {!isAdded ? (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 rounded-lg bg-[var(--brand-red)] px-6 py-3 text-white font-medium hover:bg-[var(--brand-red-dark)] transition-colors"
                                    >
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={() => toggle(product.id)}
                                        className="rounded-lg border-2 border-zinc-200 px-4 py-3 hover:border-[var(--brand-red)] transition-colors"
                                        aria-label="Add to wishlist"
                                    >
                                        <Heart className={`h-5 w-5 ${isSaved(product.id) ? "fill-[var(--brand-red)] text-[var(--brand-red)]" : "text-zinc-600"}`} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: product.name,
                                                    text: `Check out ${product.name} on Cediman!`,
                                                    url: window.location.href,
                                                });
                                            } else {
                                                navigator.clipboard.writeText(window.location.href);
                                                showToast("Link copied to clipboard!", "success");
                                            }
                                        }}
                                        className="rounded-lg border-2 border-zinc-200 px-4 py-3 hover:border-[var(--brand-red)] transition-colors"
                                        aria-label="Share"
                                    >
                                        <Share2 className="h-5 w-5 text-zinc-600" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="w-full rounded-lg bg-green-50 border-2 border-green-200 py-3 text-center">
                                        <p className="text-sm font-bold text-green-600">✓ Added to Cart</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsAdded(false);
                                            router.push("/checkout");
                                        }}
                                        className="w-full rounded-lg bg-[var(--brand-red)] px-6 py-3 text-white font-medium hover:bg-[var(--brand-red-dark)] transition-colors"
                                    >
                                        Proceed to Checkout
                                    </button>
                                    <button
                                        onClick={() => setIsAdded(false)}
                                        className="w-full rounded-lg border-2 border-zinc-200 px-6 py-3 text-zinc-900 font-medium hover:bg-zinc-50 transition-colors"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Stock Indicator & Social Proof */}
                        <div className="mb-6 space-y-3">
                            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                                <p className="text-sm font-medium text-green-800">
                                    ✓ In Stock - Usually ships within 2-3 business days
                                </p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-zinc-600">
                                <span>🔥 12 people viewing this</span>
                                <span>⭐ 4.8 (127 reviews)</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="mb-2 text-lg font-semibold text-zinc-900">Description</h3>
                            <p className="text-sm text-zinc-600">
                                {product.description || `Official ${product.name} from ${product.team || "your favorite team"}. Made with premium materials and authentic team branding. Perfect for game day or everyday wear.`}
                            </p>
                        </div>

                        {/* Product Details */}
                        <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                            <h3 className="mb-3 text-sm font-semibold text-zinc-900">Product Details</h3>
                            <ul className="space-y-2 text-xs text-zinc-600">
                                <li className="flex justify-between">
                                    <span>Material:</span>
                                    <span>100% Polyester</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Care:</span>
                                    <span>Machine Wash</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Origin:</span>
                                    <span>Quality Products</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {product && <ProductRecommendations currentProduct={product} />}
            </div>
            <Footer />
            {/* Image Zoom Modal */}
            {imageZoom && product.images && product.images.length > 0 && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setImageZoom(false)}
                >
                    <div
                        className="relative max-w-4xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={product.images[selectedImageIndex]}
                            alt={`${product.name} large view`}
                            className="w-full max-h-[80vh] object-contain select-none"
                            draggable={false}
                        />
                        {product.images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="h-6 w-6 text-zinc-900" />
                                </button>
                                <button
                                    onClick={() => setSelectedImageIndex((prev) => (prev + 1) % product.images.length)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="h-6 w-6 text-zinc-900" />
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => setImageZoom(false)}
                            className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-sm font-medium text-zinc-900 shadow hover:bg-white"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </div >
    );
}