"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, MapPin, Trash2, Edit, Home, Building2, Search } from "lucide-react";
import { useToast } from "../../components/ui/ToastContainer";
import Modal from "../../components/ui/modal";
import { getRegions, getTownsByRegion } from "@/lib/ghanaLocations";

interface Address {
    id: string;
    label: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    landmark?: string;
    region: string;
    town: string;
    country: string;
    isDefault: boolean;
}

export default function AddressesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        label: "Home",
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        landmark: "",
        region: "",
        town: "",
        country: "Ghana",
        isDefault: false,
    });

    const [townSearch, setTownSearch] = useState("");
    const [filteredTowns, setFilteredTowns] = useState<string[]>([]);
    const [showTownDropdown, setShowTownDropdown] = useState(false);

    const regions = getRegions();

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }
        loadAddresses();
    }, [user]);

    useEffect(() => {
        if (formData.region) {
            const towns = getTownsByRegion(formData.region);
            setFilteredTowns(
                towns.filter((town) =>
                    town.toLowerCase().includes(townSearch.toLowerCase())
                )
            );
        }
    }, [formData.region, townSearch]);

    const loadAddresses = () => {
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

    const handleOpenModal = (address?: Address) => {
        if (address) {
            setEditingAddress(address);
            setFormData({
                label: address.label,
                firstName: address.firstName,
                lastName: address.lastName,
                phone: address.phone,
                address: address.address,
                landmark: address.landmark || "",
                region: address.region,
                town: address.town,
                country: address.country || "Ghana",
                isDefault: address.isDefault,
            });
            setTownSearch(address.town);
        } else {
            setEditingAddress(null);
            setFormData({
                label: "Home",
                firstName: user?.firstName || "",
                lastName: user?.lastName || "",
                phone: user?.phone || "",
                address: "",
                landmark: "",
                region: "",
                town: "",
                country: "Ghana",
                isDefault: addresses.length === 0,
            });
            setTownSearch("");
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingAddress(null);
        setFormData({
            label: "Home",
            firstName: "",
            lastName: "",
            phone: "",
            address: "",
            landmark: "",
            region: "",
            town: "",
            country: "Ghana",
            isDefault: false,
        });
        setTownSearch("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.region || !formData.town) {
            showToast("Please select region and town", "error");
            return;
        }

        setSubmitting(true);

        try {
            if (editingAddress) {
                // Update existing address
                const updated = addresses.map((addr) =>
                    addr.id === editingAddress.id
                        ? { ...formData, id: addr.id }
                        : formData.isDefault
                            ? { ...addr, isDefault: false }
                            : addr
                );
                saveAddresses(updated);
                showToast("Address updated successfully", "success");
            } else {
                // Add new address
                const newAddress: Address = {
                    ...formData,
                    id: Date.now().toString(),
                };

                const updated = formData.isDefault
                    ? addresses.map((addr) => ({ ...addr, isDefault: false })).concat(newAddress)
                    : addresses.concat(newAddress);

                saveAddresses(updated);
                showToast("Address added successfully", "success");
            }

            handleCloseModal();
        } catch (error) {
            showToast("Failed to save address", "error");
        } finally {
            setSubmitting(false);
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
        <div className="min-h-screen bg-zinc-50 pb-20 sm:pb-8">
            <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
                {/* Header */}
                <div className="mb-4 sm:mb-6">
                    <Link
                        href="/account"
                        className="mb-3 inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                    >
                        ← Back to Account
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-900">Address Book</h1>
                            <p className="mt-1 text-xs sm:text-sm text-zinc-600">
                                Manage your delivery addresses
                            </p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-red)] px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-semibold text-white hover:bg-[var(--brand-red-dark)] shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                        >
                            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="hidden sm:inline">Add New Address</span>
                            <span className="sm:hidden">Add Address</span>
                        </button>
                    </div>
                </div>

                {/* Addresses List */}
                {addresses.length === 0 ? (
                    <div className="rounded-lg sm:rounded-xl border border-zinc-200 bg-white p-8 sm:p-12 text-center shadow-sm">
                        <MapPin className="mx-auto mb-4 h-12 w-12 sm:h-16 sm:w-16 text-zinc-300" />
                        <h2 className="mb-2 text-lg sm:text-xl font-semibold text-zinc-900">No addresses yet</h2>
                        <p className="mb-6 text-sm sm:text-base text-zinc-600 max-w-md mx-auto">
                            Add your first delivery address to make checkout faster
                        </p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-red)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-red-dark)] shadow-md hover:shadow-lg transition-all"
                        >
                            <Plus className="h-5 w-5" />
                            Add Address
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {addresses.map((address) => (
                            <div
                                key={address.id}
                                className={`relative rounded-lg sm:rounded-xl border ${address.isDefault
                                    ? "border-[var(--brand-red)] bg-red-50/30 ring-2 ring-[var(--brand-red)]/10"
                                    : "border-zinc-200 bg-white"
                                    } p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow`}
                            >
                                {address.isDefault && (
                                    <span className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-full bg-[var(--brand-red)] px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold text-white uppercase tracking-wide">
                                        Default
                                    </span>
                                )}

                                <div className="mb-4 pr-16 sm:pr-20">
                                    <div className="mb-3 flex items-center gap-2">
                                        {address.label === "Home" ? (
                                            <Home className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--brand-red)]" />
                                        ) : address.label === "Office" ? (
                                            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--brand-red)]" />
                                        ) : (
                                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--brand-red)]" />
                                        )}
                                        <h3 className="font-bold text-sm sm:text-base text-zinc-900 uppercase tracking-wide">{address.label}</h3>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm sm:text-base font-semibold text-zinc-900">
                                            {address.firstName} {address.lastName}
                                        </p>
                                        <p className="text-xs sm:text-sm text-zinc-600 font-medium">{address.phone}</p>
                                        <div className="pt-2 space-y-0.5">
                                            <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">{address.address}</p>
                                            {address.landmark && (
                                                <p className="text-xs sm:text-sm text-zinc-500 flex items-start gap-1">
                                                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                    <span>{address.landmark}</span>
                                                </p>
                                            )}
                                            <p className="text-xs sm:text-sm text-zinc-700 font-medium">
                                                {address.town}, {address.region}
                                            </p>
                                            <p className="text-xs text-zinc-500">{address.country}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-3 border-t border-zinc-100">
                                    {!address.isDefault && (
                                        <button
                                            onClick={() => handleSetDefault(address.id)}
                                            className="flex-1 rounded-lg border border-zinc-300 bg-white px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 transition-all active:scale-95"
                                        >
                                            Set Default
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleOpenModal(address)}
                                        className="rounded-lg border border-zinc-300 bg-white p-2 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-400 transition-all active:scale-95"
                                        title="Edit address"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(address.id)}
                                        className="rounded-lg border border-red-200 bg-white p-2 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all active:scale-95"
                                        title="Delete address"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add/Edit Address Modal */}
                <Modal open={modalOpen} onClose={handleCloseModal}>
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        <div className="pb-3 border-b border-zinc-200">
                            <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
                                {editingAddress ? "Edit Address" : "Add New Address"}
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-zinc-600">
                                Fill in your delivery address details
                            </p>
                        </div>

                        {/* Address Label */}
                        <div>
                            <label className="mb-2 block text-xs sm:text-sm font-semibold text-zinc-700 uppercase tracking-wide">
                                Address Type *
                            </label>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                {["Home", "Office", "Other"].map((label) => (
                                    <button
                                        key={label}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, label })}
                                        className={`rounded-lg border-2 px-3 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-all active:scale-95 ${formData.label === label
                                            ? "border-[var(--brand-red)] bg-red-50 text-[var(--brand-red)] shadow-sm"
                                            : "border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="mb-1.5 block text-xs sm:text-sm font-medium text-zinc-700">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, firstName: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs sm:text-sm font-medium text-zinc-700">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, lastName: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="mb-1.5 block text-xs sm:text-sm font-medium text-zinc-700">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+233 XX XXX XXXX"
                                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 transition-all"
                                required
                            />
                        </div>

                        {/* Region */}
                        <div>
                            <label className="mb-1.5 block text-xs sm:text-sm font-medium text-zinc-700">
                                Region *
                            </label>
                            <select
                                value={formData.region}
                                onChange={(e) => {
                                    setFormData({ ...formData, region: e.target.value, town: "" });
                                    setTownSearch("");
                                }}
                                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 transition-all"
                                required
                            >
                                <option value="">Select Region</option>
                                {regions.map((region) => (
                                    <option key={region} value={region}>
                                        {region}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Town/City with Search */}
                        {formData.region && (
                            <div>
                                <label className="mb-1.5 block text-xs sm:text-sm font-medium text-zinc-700">
                                    Town/City *
                                </label>
                                <div className="relative">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <input
                                            type="text"
                                            value={townSearch}
                                            onChange={(e) => {
                                                setTownSearch(e.target.value);
                                                setShowTownDropdown(true);
                                            }}
                                            onFocus={() => setShowTownDropdown(true)}
                                            placeholder="Type to search..."
                                            className="w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-3 py-2.5 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 transition-all"
                                            required
                                        />
                                    </div>
                                    {showTownDropdown && filteredTowns.length > 0 && (
                                        <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-zinc-300 bg-white shadow-xl">
                                            {filteredTowns.map((town) => (
                                                <button
                                                    key={town}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({ ...formData, town });
                                                        setTownSearch(town);
                                                        setShowTownDropdown(false);
                                                    }}
                                                    className="w-full px-3 py-2.5 text-left text-sm hover:bg-zinc-50 active:bg-zinc-100 transition-colors border-b border-zinc-100 last:border-0"
                                                >
                                                    {town}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Street Address */}
                        <div>
                            <label className="mb-1.5 block text-xs sm:text-sm font-medium text-zinc-700">
                                Street Address *
                            </label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="House number and street name"
                                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 transition-all"
                                required
                            />
                        </div>

                        {/* Landmark */}
                        <div>
                            <label className="mb-1.5 block text-xs sm:text-sm font-medium text-zinc-700">
                                Landmark (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.landmark}
                                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                                placeholder="Near mall, school, etc."
                                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:border-[var(--brand-red)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/20 transition-all"
                            />
                        </div>

                        {/* Set as Default */}
                        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                            <input
                                type="checkbox"
                                id="isDefault"
                                checked={formData.isDefault}
                                onChange={(e) =>
                                    setFormData({ ...formData, isDefault: e.target.checked })
                                }
                                className="h-4 w-4 rounded border-zinc-300 text-[var(--brand-red)] focus:ring-2 focus:ring-[var(--brand-red)]/20"
                            />
                            <label htmlFor="isDefault" className="text-xs sm:text-sm font-medium text-zinc-700 cursor-pointer">
                                Set as default delivery address
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-zinc-200">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="flex-1 rounded-lg border-2 border-zinc-300 bg-white px-4 py-2.5 sm:py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 active:scale-95 transition-all"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 rounded-lg bg-[var(--brand-red)] px-4 py-2.5 sm:py-3 text-sm font-semibold text-white hover:bg-[var(--brand-red-dark)] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </span>
                                ) : (
                                    editingAddress ? "Update Address" : "Save Address"
                                )}
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
}
