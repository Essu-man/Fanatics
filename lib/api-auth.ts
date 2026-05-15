import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { getUserProfile, getVendor, getVendorByOwnerUserId, type Vendor } from "@/lib/firestore";

export type VendorAuthContext = {
    uid: string;
    vendorId: string;
    vendor: Vendor;
};

function bearerToken(request: Request): string | null {
    const h = request.headers.get("authorization");
    if (!h?.startsWith("Bearer ")) return null;
    return h.slice(7).trim() || null;
}

/**
 * Authenticated marketplace vendor (Firebase ID token + active vendor doc).
 * Links profile.vendorId or vendors.ownerUserId for consistency.
 */
export async function requireVendorAuth(request: Request): Promise<VendorAuthContext | null> {
    const token = bearerToken(request);
    if (!token) return null;

    try {
        const decoded = await verifyFirebaseIdToken(token);
        const uid = decoded.uid;

        let vendorId = (await getUserProfile(uid))?.vendorId;
        let vendor = vendorId ? await getVendor(vendorId) : null;

        if (!vendor) {
            vendor = await getVendorByOwnerUserId(uid);
            if (vendor) vendorId = vendor.id;
        }

        if (!vendor || !vendorId) return null;
        if (vendor.ownerUserId !== uid) return null;
        if (vendor.status !== "active") return null;

        return { uid, vendorId, vendor };
    } catch (e) {
        console.error("requireVendorAuth:", e);
        return null;
    }
}

export async function requireAdminProfile(request: Request): Promise<{ uid: string } | null> {
    const token = bearerToken(request);
    if (!token) return null;
    try {
        const decoded = await verifyFirebaseIdToken(token);
        const profile = await getUserProfile(decoded.uid);
        if (profile?.role !== "admin") return null;
        return { uid: decoded.uid };
    } catch {
        return null;
    }
}
