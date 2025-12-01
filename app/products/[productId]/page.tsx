"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Heart, Share2, ZoomIn, Plus, Minus } from "lucide-react";
import Header from "../../components/Header";
import SportsNav from "../../components/SportsNav";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import ProductRecommendations from "../../components/ProductRecommendations";
import { useToast } from "../../components/ui/ToastContainer";
import { useCart } from "../../providers/CartProvider";
import { useWishlist } from "../../providers/WishlistProvider";
import type { Product } from "../../../lib/products";
import { products } from "../../../lib/products";
import { generateTeamProducts } from "../../../lib/teamProducts";

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.productId as string;
    const { addItem } = useCart();
    const { toggle, isSaved } = useWishlist();
    const { showToast } = useToast();

    const [product, setProduct] = useState<Product | null>(null);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>("M");
    const [quantity, setQuantity] = useState(1);
    const [imageZoom, setImageZoom] = useState(false);
    const [customization, setCustomization] = useState({
        playerName: "",
        playerNumber: "",
    });

    useEffect(() => {
        // First try to find product in local products array
        const foundProduct = products.find((p) => p.id === productId);

        if (foundProduct) {
            setProduct(foundProduct);
            setSelectedImage(foundProduct.images?.[0] || "");
            setSelectedColor(foundProduct.colors?.[0]?.id || null);
            return;
        }

        // Try to fetch from database via API
        fetch(`/api/products/${productId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.product) {
                    setProduct(data.product);
                    setSelectedImage(data.product.images?.[0] || "");
                    setSelectedColor(data.product.colors?.[0]?.id || null);
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
                                        setSelectedColor(teamProduct.colors?.[0]?.id || null);
                                    } else {
                                        setProduct(null);
                                    }
                                } else {
                                    setProduct(null);
                                }
                            })
                            .catch(() => {
                                setProduct(null);
                            });
                    } else {
                        setProduct(null);
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
                                    setSelectedColor(teamProduct.colors?.[0]?.id || null);
                                } else {
                                    setProduct(null);
                                }
                            } else {
                                setProduct(null);
                            }
                        })
                        .catch(() => {
                            setProduct(null);
                        });
                } else {
                    setProduct(null);
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
                        </div>

                        {/* Thumbnail Gallery */}
                        {product.images && product.images.length > 1 && (
                            <div className="mt-4 flex gap-2 overflow-x-auto">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
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

                        {/* Size Selection */}
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-zinc-900">
                                Size: {selectedSize}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map((size) => (
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

                        {/* Jersey Customization */}
                        {(product.category?.toLowerCase().includes('jersey') ||
                            product.name.toLowerCase().includes('jersey')) && (
                                <div className="mb-6 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-4">
                                    <h3 className="mb-3 text-sm font-semibold text-zinc-900 flex items-center gap-2">
                                        <span>⚽</span>
                                        <span>Customize Your Jersey (Optional)</span>
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label htmlFor="playerName" className="mb-1 block text-xs font-medium text-zinc-700">
                                                Player Name
                                            </label>
                                            <input
                                                id="playerName"
                                                type="text"
                                                maxLength={20}
                                                value={customization.playerName}
                                                onChange={(e) => setCustomization(prev => ({
                                                    ...prev,
                                                    playerName: e.target.value.toUpperCase()
                                                }))}
                                                placeholder="e.g., RONALDO"
                                                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-red)]"
                                            />
                                            <p className="mt-1 text-xs text-zinc-500">
                                                {customization.playerName.length}/20 characters
                                            </p>
                                        </div>
                                        <div>
                                            <label htmlFor="playerNumber" className="mb-1 block text-xs font-medium text-zinc-700">
                                                Player Number
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
                                                placeholder="e.g., 7"
                                                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-red)]"
                                            />
                                            <p className="mt-1 text-xs text-zinc-500">Numbers 0-99</p>
                                        </div>
                                        {(customization.playerName || customization.playerNumber) && (
                                            <div className="mt-3 rounded-md bg-blue-50 border border-blue-200 p-3">
                                                <p className="text-xs font-medium text-blue-900 mb-1">Preview:</p>
                                                <p className="text-sm font-bold text-blue-800">
                                                    {customization.playerName} {customization.playerNumber && `#${customization.playerNumber}`}
                                                </p>
                                            </div>
                                        )}
                                        <p className="text-xs text-zinc-500 italic">
                                            💡 Add your favorite player's name or your own!
                                        </p>
                                    </div>
                                </div>
                            )}

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
                        <div className="mb-6 flex gap-3">
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
                                    <span>Official Licensed Product</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {product && <ProductRecommendations currentProduct={product} />}
            </div>
            <Footer />
        </div>
    );
}

