"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, MapPin, Trash2, Edit } from "lucide-react";
import { useToast } from "../../components/ui/ToastContainer";

interface Address {
    id: string;
    label: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    isDefault: boolean;
}

export default function AddressesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }
        loadAddresses();
    }, [user]);

    const loadAddresses = () => {
        // Load from localStorage for now (will be moved to Supabase)
        try {
            const saved = localStorage.getItem(`addresses:${user?.id}`);
            if (saved) {
                setAddresses(JSON.parse(saved));
            }
        } catch (error) {
            console.error("Error loading addresses:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveAddresses = (newAddresses: Address[]) => {
        try {
            localStorage.setItem(`addresses:${user?.id}`, JSON.stringify(newAddresses));
            setAddresses(newAddresses);
        } catch (error) {
            console.error("Error saving addresses:", error);
            showToast("Failed to save address", "error");
        }
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this address?")) {
            const updated = addresses.filter((addr) => addr.id !== id);
            saveAddresses(updated);
            showToast("Address deleted", "success");
        }
    };

    const handleSetDefault = (id: string) => {
        const updated = addresses.map((addr) => ({
            ...addr,
            isDefault: addr.id === id,
        }));
        saveAddresses(updated);
        showToast("Default address updated", "success");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                    <p className="text-zinc-600">Loading addresses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="mx-auto max-w-4xl px-6 py-12">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link
                            href="/account"
                            className="mb-2 inline-block text-sm text-zinc-600 hover:text-zinc-900"
                        >
                            ← Back to Account
                        </Link>
                        <h1 className="text-3xl font-bold text-zinc-900">My Addresses</h1>
                        <p className="mt-1 text-sm text-zinc-600">
                            Manage your shipping addresses
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/account/addresses/new")}
                        className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-red)] px-4 py-2 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                    >
                        <Plus className="h-5 w-5" />
                        Add Address
                    </button>
                </div>

                {/* Addresses List */}
                {addresses.length === 0 ? (
                    <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center shadow-sm">
                        <MapPin className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
                        <h2 className="mb-2 text-xl font-semibold text-zinc-900">No addresses yet</h2>
                        <p className="mb-6 text-zinc-600">
                            Add your first shipping address to make checkout faster
                        </p>
                        <button
                            onClick={() => router.push("/account/addresses/new")}
                            className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-red)] px-6 py-3 font-semibold text-white hover:bg-[var(--brand-red-dark)]"
                        >
                            <Plus className="h-5 w-5" />
                            Add Address
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {addresses.map((address) => (
                            <div
                                key={address.id}
                                className={`relative rounded-lg border ${address.isDefault
                                        ? "border-[var(--brand-red)] bg-red-50"
                                        : "border-zinc-200 bg-white"
                                    } p-6 shadow-sm`}
                            >
                                {address.isDefault && (
                                    <span className="absolute right-4 top-4 rounded-full bg-[var(--brand-red)] px-2 py-1 text-xs font-semibold text-white">
                                        Default
                                    </span>
                                )}

                                <div className="mb-4">
                                    <h3 className="mb-1 font-semibold text-zinc-900">{address.label}</h3>
                                    <p className="text-sm text-zinc-600">
                                        {address.firstName} {address.lastName}
                                    </p>
                                    <p className="text-sm text-zinc-600">{address.address}</p>
                                    <p className="text-sm text-zinc-600">
                                        {address.city}, {address.state} {address.zipCode}
                                    </p>
                                    <p className="text-sm text-zinc-600">{address.country}</p>
                                    <p className="text-sm text-zinc-600">{address.phone}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {!address.isDefault && (
                                        <button
                                            onClick={() => handleSetDefault(address.id)}
                                            className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                                        >
                                            Set as Default
                                        </button>
                                    )}
                                    <button
                                        onClick={() => router.push(`/account/addresses/edit/${address.id}`)}
                                        className="rounded-lg border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50"
                                        title="Edit"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(address.id)}
                                        className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
