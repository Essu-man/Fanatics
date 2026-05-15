"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/app/components/ui/ToastContainer";
import type { Product } from "@/lib/firestore";
import { 
    CheckCircle2, 
    XCircle, 
    Eye, 
    Package, 
    Tag, 
    User,
    Calendar,
    ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function AdminPendingProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const loadProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/products/pending", { cache: "no-store" });
            const data = await res.json();
            if (data.success) setProducts(data.products || []);
            else showToast(data.error || "Failed to load products", "error");
        } catch (err) {
            showToast("Failed to load products", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleAction = async (id: string, action: "approve" | "reject") => {
        try {
            const res = await fetch(`/api/admin/products/pending/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Product ${action === "approve" ? "approved" : "rejected"}`, "success");
                loadProducts();
            } else {
                showToast(data.error || "Failed to update product", "error");
            }
        } catch (err) {
            showToast("An error occurred", "error");
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-black text-zinc-900">Pending Products</h1>
                <p className="mt-1 text-zinc-500 font-medium">Review and approve vendor product submissions</p>
            </div>

            {loading ? (
                <div className="py-20 text-center text-zinc-400 font-medium animate-pulse">
                    Loading pending products...
                </div>
            ) : products.length === 0 ? (
                <div className="bg-white border border-zinc-100 rounded-[2.5rem] py-20 text-center shadow-sm">
                    <Package className="h-12 w-12 text-zinc-200 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">All caught up! No products pending review.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {products.map((p) => (
                        <div key={p.id} className="bg-white border border-zinc-100 rounded-[2.5rem] p-6 shadow-sm flex flex-col sm:flex-row gap-6 hover:shadow-xl hover:border-emerald-100 transition-all duration-300">
                            {/* Product Image */}
                            <div className="w-full sm:w-40 aspect-square rounded-[1.5rem] overflow-hidden bg-zinc-50 flex-shrink-0">
                                {p.images && p.images[0] ? (
                                    <img 
                                        src={p.images[0]} 
                                        alt={p.name} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                        <Package className="h-8 w-8" />
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 space-y-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="text-xl font-black text-zinc-900 leading-tight">{p.name}</h3>
                                        <p className="text-emerald-600 font-black text-lg">GHS {p.price}</p>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider">
                                        Pending
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold">
                                        <Tag className="h-3.5 w-3.5 text-zinc-400" />
                                        {p.category}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold">
                                        <User className="h-3.5 w-3.5 text-zinc-400" />
                                        {p.vendorName || "Unknown Seller"}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold">
                                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "Recently"}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold">
                                        <Package className="h-3.5 w-3.5 text-zinc-400" />
                                        {p.stock} in stock
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center gap-2">
                                    <Link 
                                        href={`/products/${p.id}`}
                                        target="_blank"
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-50 text-zinc-600 rounded-xl font-bold hover:bg-zinc-100 transition-all text-sm"
                                    >
                                        <Eye className="h-4 w-4" /> Preview
                                    </Link>
                                    <button 
                                        onClick={() => handleAction(p.id, "reject")}
                                        className="inline-flex items-center justify-center p-2.5 bg-white border border-red-100 text-red-600 rounded-xl hover:bg-red-50 transition-all"
                                        title="Reject"
                                    >
                                        <XCircle className="h-5 w-5" />
                                    </button>
                                    <button 
                                        onClick={() => handleAction(p.id, "approve")}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all text-sm"
                                    >
                                        <CheckCircle2 className="h-4 w-4" /> Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
