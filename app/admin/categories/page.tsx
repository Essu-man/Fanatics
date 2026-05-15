"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/app/components/ui/ToastContainer";
import type { StoreCategory } from "@/lib/firestore";
import { 
    Plus, 
    Trash2, 
    Settings, 
    GripVertical,
    Save,
    X,
    LayoutGrid,
    Search,
    Type,
    Link as LinkIcon
} from "lucide-react";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<StoreCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const { showToast } = useToast();

    // Form state
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [order, setOrder] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/categories", { cache: "no-store" });
            const data = await res.json();
            if (data.success) setCategories(data.categories || []);
        } catch (err) {
            showToast("Failed to load categories", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    name, 
                    slug: slug || name.toLowerCase().replace(/\s+/g, "-"), 
                    description, 
                    order: Number(order) 
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast("Category created", "success");
                setName("");
                setSlug("");
                setDescription("");
                setOrder(categories.length + 1);
                setShowAddForm(false);
                loadCategories();
            } else {
                showToast(data.error || "Failed to create category", "error");
            }
        } catch (err) {
            showToast("An error occurred", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? Products in this category will not be deleted but they may not show up correctly in filters.")) return;
        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                showToast("Category deleted", "success");
                loadCategories();
            }
        } catch (err) {
            showToast("Failed to delete", "error");
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900">Store Categories</h1>
                    <p className="mt-1 text-zinc-500 font-medium">Manage the global list of product categories</p>
                </div>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-600 transition-all"
                >
                    {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {showAddForm ? "Cancel" : "Add New Category"}
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white border-2 border-zinc-100 rounded-[2rem] p-8 shadow-xl animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-xl font-black text-zinc-900 mb-6">Create New Category</h2>
                    <form onSubmit={handleCreate} className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                                <Type className="h-4 w-4" /> Category Name
                            </label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Footwear"
                                className="w-full h-12 px-4 rounded-xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                                <LinkIcon className="h-4 w-4" /> Slug (URL)
                            </label>
                            <input
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="e.g. footwear"
                                className="w-full h-12 px-4 rounded-xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-zinc-700">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                className="w-full p-4 rounded-xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 outline-none transition-all"
                                placeholder="Optional description..."
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Display Order</label>
                                <input
                                    type="number"
                                    value={order}
                                    onChange={(e) => setOrder(Number(e.target.value))}
                                    className="w-full h-12 px-4 rounded-xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                            <div className="pt-8">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="h-12 px-8 bg-zinc-900 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    {submitting ? "Saving..." : "Save Category"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white border border-zinc-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 w-10">Order</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Category</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Slug</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {categories.map((c) => (
                                <tr key={c.id} className="group hover:bg-zinc-50/30 transition-all">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="h-4 w-4 text-zinc-300" />
                                            <span className="font-bold text-zinc-400">{c.order}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                <LayoutGrid className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-zinc-900">{c.name}</p>
                                                {c.description && <p className="text-xs text-zinc-500 font-medium">{c.description}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-2 py-1 rounded-md bg-zinc-100 text-zinc-600 text-xs font-bold">
                                            {c.slug}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button 
                                            onClick={() => handleDelete(c.id)}
                                            className="p-2 text-zinc-300 hover:text-red-500 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <LayoutGrid className="h-12 w-12 text-zinc-100 mx-auto mb-4" />
                                        <p className="text-zinc-500 font-medium">No categories created yet.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {loading && <p className="text-center py-10 text-zinc-400 font-medium animate-pulse">Loading categories...</p>}
        </div>
    );
}
