"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import type { Product } from "@/lib/firestore";
import { PlusCircle, Trash2, Boxes } from "lucide-react";
import { totalVariantStock, usesVariantStock } from "@/lib/stock-variants";
import { useToast } from "@/app/components/ui/ToastContainer";

export default function VendorProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch("/api/vendor/products", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (data.success) setProducts(data.products || []);
            else showToast(data.error || "Failed to load products", "error");
        } catch {
            showToast("Failed to load products", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        load();
    }, [load]);

    async function removeProduct(id: string) {
        if (!confirm("Delete this product?")) return;
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch(`/api/vendor/products/${id}`, {
                method: "DELETE",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || "Delete failed");
            showToast("Product removed", "success");
            load();
        } catch (e: any) {
            showToast(e.message || "Delete failed", "error");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">My products</h1>
                    <p className="text-sm text-zinc-600">Listings visible in the main shop when active.</p>
                </div>
                <Link
                    href="/vendor/products/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-red)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                >
                    <PlusCircle className="h-4 w-4" />
                    Add product
                </Link>
            </div>

            {loading ? (
                <p className="text-sm text-zinc-500">Loading…</p>
            ) : products.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-12 text-center">
                    <p className="text-zinc-600">No products yet.</p>
                    <Link href="/vendor/products/new" className="mt-4 inline-block font-medium text-[var(--brand-red)] hover:underline">
                        Create your first listing
                    </Link>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-zinc-200 text-sm">
                        <thead className="bg-zinc-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-zinc-700">Product</th>
                                <th className="px-4 py-3 text-left font-semibold text-zinc-700">Category</th>
                                <th className="px-4 py-3 text-right font-semibold text-zinc-700">Price</th>
                                <th className="px-4 py-3 text-right font-semibold text-zinc-700">Stock</th>
                                <th className="px-4 py-3 text-right font-semibold text-zinc-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {products.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-zinc-100">
                                                {p.images?.[0] ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                                                ) : null}
                                            </div>
                                            <div>
                                                <p className="font-medium text-zinc-900">{p.name}</p>
                                                <Link
                                                    href={`/products/${p.id}`}
                                                    className="text-xs text-[var(--brand-red)] hover:underline"
                                                >
                                                    View on shop
                                                </Link>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-600">{p.category}</td>
                                    <td className="px-4 py-3 text-right font-medium">₵{Number(p.price).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right text-zinc-600">
                                        {usesVariantStock(p)
                                            ? totalVariantStock(p.stockVariants!)
                                            : p.stock}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={`/vendor/stock?product=${p.id}`}
                                            className="mr-2 inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-zinc-700 hover:bg-zinc-50"
                                        >
                                            <Boxes className="h-4 w-4" />
                                            Stock
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => removeProduct(p.id)}
                                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
