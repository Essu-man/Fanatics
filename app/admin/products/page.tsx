"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Edit, Trash2, AlertTriangle, Package, RefreshCw } from "lucide-react";
import { useToast } from "../../components/ui/ToastContainer";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import Modal from "../../components/ui/modal";

type AdminProduct = {
    id: string;
    name: string;
    price: number;
    stock: number;
    available: boolean;
    category?: string;
    team?: string;
    league?: string;
    images: string[];
};

export default function AdminProductsPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "available" | "out_of_stock">("all");
    const [restockModalOpen, setRestockModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
    const [restockQuantity, setRestockQuantity] = useState("");
    const [restocking, setRestocking] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/products", { cache: "no-store" });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Unable to load products");
            }

            setProducts(
                (data.products || []).map((product: any) => ({
                    id: product.id,
                    name: product.name,
                    price: Number(product.price || 0),
                    stock: Number(product.stock || 0),
                    available: Boolean(product.available),
                    category: product.category,
                    team: product.team,
                    league: product.league,
                    images: product.images || [],
                }))
            );
        } catch (error) {
            console.error("Error fetching products:", error);
            showToast("Failed to load products", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAvailability = async (productId: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/admin/products/${productId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ available: !currentStatus }),
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to update product");
            }

            showToast(
                `Product ${!currentStatus ? "marked as available" : "marked as unavailable"}`,
                "success"
            );
            fetchProducts();
        } catch (error) {
            console.error("Error updating product:", error);
            showToast("An error occurred", "error");
        }
    };

    const handleDelete = async (productId: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const response = await fetch(`/api/admin/products/${productId}`, {
                method: "DELETE",
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to delete product");
            }

            showToast("Product deleted successfully", "success");
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
            showToast("An error occurred", "error");
        }
    };

    const handleRestock = (product: AdminProduct) => {
        setSelectedProduct(product);
        setRestockQuantity("");
        setRestockModalOpen(true);
    };

    const handleRestockSubmit = async () => {
        if (!selectedProduct || !restockQuantity) return;

        const quantity = parseInt(restockQuantity);
        if (isNaN(quantity) || quantity <= 0) {
            showToast("Please enter a valid quantity", "error");
            return;
        }

        setRestocking(true);
        try {
            const newStock = selectedProduct.stock + quantity;
            const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    stock: newStock,
                    available: true,
                }),
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to restock product");
            }

            showToast(`Successfully restocked ${quantity} units`, "success");
            setRestockModalOpen(false);
            setSelectedProduct(null);
            setRestockQuantity("");
            fetchProducts();
        } catch (error) {
            console.error("Error restocking product:", error);
            showToast("Failed to restock product", "error");
        } finally {
            setRestocking(false);
        }
    };

    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.team?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter =
            filterStatus === "all" ||
            (filterStatus === "available" && product.available && product.stock > 0) ||
            (filterStatus === "out_of_stock" && (!product.available || product.stock === 0));

        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: products.length,
        available: products.filter((p) => p.available && p.stock > 0).length,
        outOfStock: products.filter((p) => !p.available || p.stock === 0).length,
        lowStock: products.filter((p) => p.available && p.stock > 0 && p.stock < 10).length,
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                    <p className="text-zinc-600">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">Products</h1>
                    <p className="mt-1 text-sm text-zinc-600">Manage your product inventory</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/admin/teams")}
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 font-semibold text-zinc-700 hover:bg-zinc-50"
                    >
                        <Plus className="h-5 w-5" />
                        Manage Teams
                    </button>
                    <button
                        onClick={() => router.push("/admin/products/new")}
                        className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-red)] px-4 py-2 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                    >
                        <Plus className="h-5 w-5" />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-600">Total Products</p>
                    <p className="mt-1 text-2xl font-bold text-zinc-900">{stats.total}</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-600">Available</p>
                    <p className="mt-1 text-2xl font-bold text-green-600">{stats.available}</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-600">Out of Stock</p>
                    <p className="mt-1 text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-zinc-600">Low Stock</p>
                    <p className="mt-1 text-2xl font-bold text-orange-600">{stats.lowStock}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="search"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-red)]"
                    />
                </div>
                <Select
                    value={filterStatus}
                    onValueChange={(value) => setFilterStatus(value as any)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Products ({stats.total})</SelectItem>
                        <SelectItem value="available">Available ({stats.available})</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock ({stats.outOfStock})</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Products Table */}
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-zinc-200 bg-zinc-50">
                            <tr className="text-left text-sm font-medium text-zinc-600">
                                <th className="p-4">Product</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="text-sm hover:bg-zinc-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {product.images && product.images.length > 0 && (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="h-12 w-12 rounded-lg object-cover"
                                                />
                                            )}
                                            <div>
                                                <p className="font-medium text-zinc-900">{product.name}</p>
                                                {product.team && <p className="text-xs text-zinc-500">{product.team}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-zinc-600">{product.category}</td>
                                    <td className="p-4 font-semibold text-zinc-900">₵{product.price.toFixed(2)}</td>
                                    <td className="p-4">
                                        <span
                                            className={`inline-flex items-center gap-1 ${product.stock === 0
                                                ? "text-red-600"
                                                : product.stock < 10
                                                    ? "text-orange-600"
                                                    : "text-green-600"
                                                }`}
                                        >
                                            {product.stock === 0 && <AlertTriangle className="h-3 w-3" />}
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleToggleAvailability(product.id, product.available)}
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${product.available && product.stock > 0
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {product.available && product.stock > 0 ? "Available" : "Unavailable"}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {product.stock === 0 && (
                                                <button
                                                    onClick={() => handleRestock(product)}
                                                    className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                                                    title="Restock"
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                                                className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="py-12 text-center">
                        <Package className="mx-auto mb-3 h-12 w-12 text-zinc-400" />
                        <p className="text-sm font-medium text-zinc-900">No products found</p>
                        <p className="mt-1 text-xs text-zinc-500">
                            {searchQuery || filterStatus !== "all"
                                ? "Try adjusting your filters"
                                : "Add your first product to get started"}
                        </p>
                    </div>
                )}
            </div>

            {/* Restock Modal */}
            <Modal open={restockModalOpen} onClose={() => {
                setRestockModalOpen(false);
                setSelectedProduct(null);
                setRestockQuantity("");
            }}>
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900">Restock Product</h2>
                        <p className="mt-1 text-sm text-zinc-600">
                            {selectedProduct?.name}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">
                            Current Stock: <span className="text-red-600">{selectedProduct?.stock || 0}</span>
                        </label>
                        <label className="block text-sm font-medium text-zinc-700">
                            Restock Quantity
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={restockQuantity}
                            onChange={(e) => setRestockQuantity(e.target.value)}
                            placeholder="Enter quantity to add"
                            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20"
                            autoFocus
                        />
                        <p className="text-xs text-zinc-500">
                            New stock will be: {selectedProduct ? (selectedProduct.stock + (parseInt(restockQuantity) || 0)) : 0}
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            onClick={() => {
                                setRestockModalOpen(false);
                                setSelectedProduct(null);
                                setRestockQuantity("");
                            }}
                            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                            disabled={restocking}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRestockSubmit}
                            disabled={restocking || !restockQuantity || parseInt(restockQuantity) <= 0}
                            className="rounded-lg bg-[var(--brand-red)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-red-dark)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {restocking ? "Restocking..." : "Restock"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
