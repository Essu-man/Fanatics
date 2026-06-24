import type { Vendor } from "@/lib/firestore";

/** Shape returned to storefront clients (JSON-safe). */
export function serializePublicVendor(vendor: Vendor) {
    return {
        id: vendor.id,
        slug: vendor.slug,
        businessName: vendor.businessName,
        description: vendor.description ?? "",
        logoUrl: vendor.logoUrl ?? "",
        bannerUrl: vendor.bannerUrl ?? "",
        socialHandles: vendor.socialHandles ?? [],
        status: vendor.status,
    };
}
