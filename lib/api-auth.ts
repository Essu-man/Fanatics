import { verifyFirebaseIdToken, isFirebaseAdminConfigError } from "@/lib/firebase-admin";
import type { Vendor } from "@/lib/firestore";
import {
    adminFindApprovedApplicationVendor,
    adminGetUserProfile,
    adminGetVendor,
    adminGetVendorByOwnerUserId,
    adminLinkUserToVendor,
} from "@/lib/firestore-admin";

export type VendorAuthContext = {
    uid: string;
    vendorId: string;
    vendor: Vendor;
};

export type VendorAuthFailure = {
    ok: false;
    status: number;
    error: string;
    code: string;
};

export type VendorAuthResult = { ok: true; auth: VendorAuthContext } | VendorAuthFailure;

function bearerToken(request: Request): string | null {
    const h = request.headers.get("authorization");
    if (!h?.startsWith("Bearer ")) return null;
    return h.slice(7).trim() || null;
}

async function resolveVendorForUser(
    uid: string,
    email?: string
): Promise<{ vendor: Vendor; vendorId: string; linked?: boolean } | null> {
    const profile = await adminGetUserProfile(uid);

    let vendorId = profile?.vendorId;
    let vendor = vendorId ? await adminGetVendor(vendorId) : null;

    if (!vendor) {
        vendor = await adminGetVendorByOwnerUserId(uid);
        if (vendor) vendorId = vendor.id;
    }

    if (!vendor) {
        const approved = await adminFindApprovedApplicationVendor(uid, email || profile?.email);
        if (approved?.vendorId) {
            vendor = await adminGetVendor(approved.vendorId);
            if (vendor) {
                vendorId = vendor.id;
                const ownerOk =
                    vendor.ownerUserId === uid || vendor.ownerUserId.startsWith("pending-link-");
                if (ownerOk) {
                    await adminLinkUserToVendor(uid, vendor.id, email || profile?.email);
                    vendor = { ...vendor, ownerUserId: uid, status: "active" };
                    return { vendor, vendorId: vendor.id, linked: true };
                }
            }
        }
    }

    if (!vendor || !vendorId) return null;

    if (vendor.ownerUserId !== uid && !vendor.ownerUserId.startsWith("pending-link-")) {
        return null;
    }

    if (vendor.ownerUserId.startsWith("pending-link-")) {
        await adminLinkUserToVendor(uid, vendor.id, email || profile?.email);
        vendor = { ...vendor, ownerUserId: uid, status: "active" };
        return { vendor, vendorId, linked: true };
    }

    if (profile?.role !== "vendor" || profile.vendorId !== vendorId) {
        await adminLinkUserToVendor(uid, vendorId, email || profile?.email);
        return { vendor, vendorId, linked: true };
    }

    return { vendor, vendorId };
}

/**
 * Authenticated marketplace vendor (Firebase ID token + active vendor doc).
 * Uses Admin Firestore so API routes work regardless of client security rules.
 */
export async function requireVendorAuthDetailed(request: Request): Promise<VendorAuthResult> {
    const token = bearerToken(request);
    if (!token) {
        return {
            ok: false,
            status: 401,
            error: "Sign in required. Please log in again.",
            code: "NO_TOKEN",
        };
    }

    try {
        const decoded = await verifyFirebaseIdToken(token);
        const uid = decoded.uid;
        const email = decoded.email;

        const resolved = await resolveVendorForUser(uid, email);
        if (!resolved) {
            return {
                ok: false,
                status: 403,
                error: "No seller account is linked to this login. If you were just approved, use “Open seller dashboard” on the application screen or contact support.",
                code: "NO_VENDOR",
            };
        }

        const { vendor, vendorId } = resolved;

        if (vendor.status === "suspended") {
            return {
                ok: false,
                status: 403,
                error: "Your seller account is suspended. Contact Cediman support.",
                code: "VENDOR_SUSPENDED",
            };
        }

        if (vendor.status !== "active") {
            return {
                ok: false,
                status: 403,
                error: "Your seller account is not active yet. Wait for admin approval, then refresh your session.",
                code: "VENDOR_NOT_ACTIVE",
            };
        }

        return {
            ok: true,
            auth: { uid, vendorId, vendor },
        };
    } catch (e) {
        console.error("requireVendorAuth:", e);
        if (isFirebaseAdminConfigError(e)) {
            return {
                ok: false,
                status: 503,
                error:
                    "Server Firebase Admin is not set up. Add FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json to .env.local and place your service account JSON in the project root.",
                code: "ADMIN_NOT_CONFIGURED",
            };
        }
        return {
            ok: false,
            status: 401,
            error: "Session expired or invalid. Sign out and sign in again.",
            code: "INVALID_TOKEN",
        };
    }
}

export async function requireVendorAuth(request: Request): Promise<VendorAuthContext | null> {
    const result = await requireVendorAuthDetailed(request);
    return result.ok ? result.auth : null;
}

export async function requireAdminProfile(request: Request): Promise<{ uid: string } | null> {
    const token = bearerToken(request);
    if (!token) return null;
    try {
        const decoded = await verifyFirebaseIdToken(token);
        const profile = await adminGetUserProfile(decoded.uid);
        if (profile?.role !== "admin") return null;
        return { uid: decoded.uid };
    } catch {
        return null;
    }
}
