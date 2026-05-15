"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ProductGrid from "@/app/components/ProductGrid/index";
import type { Product as ShopProduct } from "@/lib/products";
import type { Vendor } from "@/lib/firestore";

export default function VendorStorefrontPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [products, setProducts] = useState<ShopProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetch(`/api/vendors/${encodeURIComponent(slug)}`)
            .then((res) => res.json())
            .then((data) => {
                if (cancelled) return;
                if (!data.success) {
                    setError(data.error || "Store not found");
                    setVendor(null);
                    setProducts([]);
                    return;
                }
                setVendor(data.vendor);
                setProducts((data.products || []) as ShopProduct[]);
                setError(null);
            })
            .catch(() => {
                if (!cancelled) setError("Could not load store");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [slug]);

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <div className="mx-auto max-w-7xl px-4 py-10">
                {loading ? (
                    <p className="text-zinc-600">Loading store…</p>
                ) : error || !vendor ? (
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-12 text-center">
                        <h1 className="text-xl font-semibold text-zinc-900">Store unavailable</h1>
                        <p className="mt-2 text-sm text-zinc-600">{error || "This seller storefront is not available."}</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                            {vendor.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={vendor.logoUrl}
                                    alt=""
                                    className="h-20 w-20 rounded-xl border border-zinc-200 object-cover"
                                />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-zinc-100 text-2xl font-bold text-zinc-500">
                                    {vendor.businessName.slice(0, 1).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h1 className="text-3xl font-bold text-zinc-900">{vendor.businessName}</h1>
                                {vendor.description && <p className="mt-2 max-w-2xl text-sm text-zinc-600">{vendor.description}</p>}
                            </div>
                        </div>
                        <ProductGrid products={products} />
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
}
