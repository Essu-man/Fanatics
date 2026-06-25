import { getFirestore, FieldValue, type Firestore, type QueryDocumentSnapshot } from "firebase-admin/firestore";
import { getFirebaseAdminApp, adminAuth } from "./firebase-admin";
import type { Product, StoreCategory, UserProfile, Vendor } from "@/lib/firestore";

let adminDbInstance: Firestore | null = null;

export function getAdminDb(): Firestore {
    if (!adminDbInstance) {
        adminDbInstance = getFirestore(getFirebaseAdminApp());
    }
    return adminDbInstance;
}

function toDate(value: unknown): Date {
    if (value && typeof (value as { toDate?: () => Date }).toDate === "function") {
        return (value as { toDate: () => Date }).toDate();
    }
    if (value instanceof Date) return value;
    return new Date();
}

export async function adminGetUserProfile(uid: string): Promise<UserProfile | null> {
    try {
        const snap = await getAdminDb().collection("users").doc(uid).get();
        if (!snap.exists) return null;
        const data = snap.data()!;
        return {
            ...data,
            uid: snap.id,
            createdAt: toDate(data.createdAt),
        } as UserProfile;
    } catch (error) {
        console.error("adminGetUserProfile:", error);
        return null;
    }
}

export async function adminGetVendorBySlug(slug: string): Promise<Vendor | null> {
    try {
        const normalized = slug.trim().toLowerCase();
        const snap = await getAdminDb()
            .collection("vendors")
            .where("slug", "==", normalized)
            .limit(1)
            .get();
        if (snap.empty) return null;
        const doc = snap.docs[0];
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: toDate(data.createdAt),
            updatedAt: toDate(data.updatedAt),
        } as Vendor;
    } catch (error) {
        console.error("adminGetVendorBySlug:", error);
        return null;
    }
}

export async function adminGetVendor(vendorId: string): Promise<Vendor | null> {
    try {
        const snap = await getAdminDb().collection("vendors").doc(vendorId).get();
        if (!snap.exists) return null;
        const data = snap.data()!;
        return {
            id: snap.id,
            ...data,
            createdAt: toDate(data.createdAt),
            updatedAt: toDate(data.updatedAt),
        } as Vendor;
    } catch (error) {
        console.error("adminGetVendor:", error);
        return null;
    }
}

export async function adminGetVendorByOwnerUserId(ownerUserId: string): Promise<Vendor | null> {
    try {
        const snap = await getAdminDb()
            .collection("vendors")
            .where("ownerUserId", "==", ownerUserId)
            .limit(1)
            .get();
        if (snap.empty) return null;
        const doc = snap.docs[0];
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: toDate(data.createdAt),
            updatedAt: toDate(data.updatedAt),
        } as Vendor;
    } catch (error) {
        console.error("adminGetVendorByOwnerUserId:", error);
        return null;
    }
}

export async function adminLinkUserToVendor(
    uid: string,
    vendorId: string,
    email?: string
): Promise<void> {
    const db = getAdminDb();
    const batch = db.batch();
    const userRef = db.collection("users").doc(uid);
    const vendorRef = db.collection("vendors").doc(vendorId);
    batch.set(
        userRef,
        {
            role: "vendor",
            vendorId,
            ...(email ? { email } : {}),
        },
        { merge: true }
    );
    batch.set(vendorRef, { ownerUserId: uid, status: "active" }, { merge: true });
    await batch.commit();
}

function pickApprovedWithVendor(
    docs: QueryDocumentSnapshot[]
): { vendorId: string; businessName?: string } | null {
    for (const doc of docs) {
        const data = doc.data();
        if (data.status === "approved" && data.vendorId) {
            return { vendorId: data.vendorId as string, businessName: data.businessName as string };
        }
    }
    return null;
}

export async function adminFindApprovedApplicationVendor(
    uid: string,
    email?: string
): Promise<{ vendorId: string; businessName?: string } | null> {
    try {
        const db = getAdminDb();

        const byApplicant = await db
            .collection("vendor_applications")
            .where("applicantUserId", "==", uid)
            .limit(10)
            .get();
        const fromApplicant = pickApprovedWithVendor(byApplicant.docs);
        if (fromApplicant) return fromApplicant;

        if (email) {
            const normalized = email.trim().toLowerCase();
            const byEmail = await db
                .collection("vendor_applications")
                .where("email", "==", normalized)
                .limit(10)
                .get();
            const fromEmail = pickApprovedWithVendor(byEmail.docs);
            if (fromEmail) return fromEmail;
        }
        return null;
    } catch (error) {
        console.error("adminFindApprovedApplicationVendor:", error);
        return null;
    }
}

export async function adminUpdateVendor(
    vendorId: string,
    data: Partial<Vendor>
): Promise<{ success: boolean; error?: string }> {
    try {
        const updatePayload: Record<string, unknown> = {
            updatedAt: new Date(),
        };
        if (data.slug !== undefined) updatePayload.slug = data.slug.trim().toLowerCase();
        if (data.businessName !== undefined) updatePayload.businessName = data.businessName.trim();
        if (data.description !== undefined) updatePayload.description = data.description.trim();
        if (data.logoUrl !== undefined) updatePayload.logoUrl = data.logoUrl;
        if (data.bannerUrl !== undefined) updatePayload.bannerUrl = data.bannerUrl;
        if (data.socialHandles !== undefined) updatePayload.socialHandles = data.socialHandles;
        if (data.payoutMethod !== undefined) updatePayload.payoutMethod = data.payoutMethod;
        if (data.bankName !== undefined) updatePayload.bankName = data.bankName;
        if (data.branch !== undefined) updatePayload.branch = data.branch;
        if (data.accountNumber !== undefined) updatePayload.accountNumber = data.accountNumber;
        if (data.accountName !== undefined) updatePayload.accountName = data.accountName;
        if (data.momoNetwork !== undefined) updatePayload.momoNetwork = data.momoNetwork;
        if (data.momoNumber !== undefined) updatePayload.momoNumber = data.momoNumber;
        if (data.balanceAvailable !== undefined) updatePayload.balanceAvailable = data.balanceAvailable;
        if (data.balancePending !== undefined) updatePayload.balancePending = data.balancePending;
        if (data.commissionRate !== undefined) updatePayload.commissionRate = data.commissionRate;
        if (data.paystackRecipientCode !== undefined) updatePayload.paystackRecipientCode = data.paystackRecipientCode;
        if (data.paystackBankCode !== undefined) updatePayload.paystackBankCode = data.paystackBankCode;
        if (data.deliveryEnabled !== undefined) updatePayload.deliveryEnabled = data.deliveryEnabled;

        await getAdminDb().collection("vendors").doc(vendorId).update(updatePayload);
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Update failed";
        console.error("adminUpdateVendor:", error);
        return { success: false, error: message };
    }
}

export async function adminIsVendorSlugAvailable(
    slug: string,
    excludeVendorId?: string
): Promise<boolean> {
    try {
        const normalized = slug.trim().toLowerCase();
        const snap = await getAdminDb()
            .collection("vendors")
            .where("slug", "==", normalized)
            .limit(1)
            .get();
        if (snap.empty) return true;
        return excludeVendorId ? snap.docs[0].id === excludeVendorId : false;
    } catch (error) {
        console.error("adminIsVendorSlugAvailable:", error);
        return false;
    }
}

/** Vendor submissions awaiting admin review (marketplace listings only). */
export async function adminGetPendingProducts(): Promise<Product[]> {
    try {
        const snap = await getAdminDb()
            .collection("products")
            .where("status", "==", "pending")
            .get();
        const products = snap.docs.map((d) => {
            const data = d.data();
            return {
                id: d.id,
                ...data,
                createdAt: toDate(data.createdAt),
                updatedAt: toDate(data.updatedAt),
            } as Product;
        });
        return products
            .filter((p) => Boolean(p.vendorId))
            .sort((a, b) => {
                const ta = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
                const tb = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
                return tb - ta;
            });
    } catch (error) {
        console.error("adminGetPendingProducts:", error);
        return [];
    }
}

export async function adminUpdateProductApproval(
    productId: string,
    action: "approve" | "reject",
    reason?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const status = action === "approve" ? "approved" : "rejected";
        const approved = action === "approve";
        await getAdminDb()
            .collection("products")
            .doc(productId)
            .update({
                status,
                approved,
                updatedAt: new Date(),
                ...(action === "reject" && reason ? { rejectionReason: reason } : {}),
            });
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Update failed";
        console.error("adminUpdateProductApproval:", error);
        return { success: false, error: message };
    }
}

export async function adminGetStoreCategories(): Promise<StoreCategory[]> {
    try {
        const snap = await getAdminDb().collection("store_categories").get();
        const categories = snap.docs.map((d) => {
            const data = d.data();
            return {
                id: d.id,
                ...data,
                createdAt: toDate(data.createdAt),
            } as StoreCategory;
        });
        return categories.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } catch (error) {
        console.error("adminGetStoreCategories:", error);
        return [];
    }
}

export async function adminDeleteVendorAndStore(vendorId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const vendor = await adminGetVendor(vendorId);
        if (!vendor) {
            return { success: false, error: "Vendor not found" };
        }

        const db = getAdminDb();

        // 1. Revert owner user role & remove vendorId link
        if (vendor.ownerUserId) {
            await db.collection("users").doc(vendor.ownerUserId).update({
                role: "customer",
                vendorId: FieldValue.delete()
            });
        }

        // 2. Delete all products belonging to this vendor
        const productsSnapshot = await db.collection("products").where("vendorId", "==", vendorId).get();
        const deleteProductPromises = productsSnapshot.docs.map((docSnap) => docSnap.ref.delete());
        await Promise.all(deleteProductPromises);

        // 3. Update any vendor applications that referenced this vendor to remove the vendorId link
        const appsSnapshot = await db.collection("vendor_applications").where("vendorId", "==", vendorId).get();
        const updateAppPromises = appsSnapshot.docs.map((docSnap) => docSnap.ref.update({
            vendorId: FieldValue.delete()
        }));
        await Promise.all(updateAppPromises);

        // 4. Delete the vendor document itself
        await db.collection("vendors").doc(vendorId).delete();

        return { success: true };
    } catch (error: any) {
        console.error("Error adminDeleteVendorAndStore:", error);
        return { success: false, error: error.message || "Failed to delete vendor and store" };
    }
}

export async function adminPurgeVendorAndAllData(vendorId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const vendor = await adminGetVendor(vendorId);
        if (!vendor) {
            return { success: false, error: "Vendor not found" };
        }

        const db = getAdminDb();

        // 1. Delete associated products
        const productsSnapshot = await db.collection("products").where("vendorId", "==", vendorId).get();
        const deleteProductPromises = productsSnapshot.docs.map((docSnap) => docSnap.ref.delete());
        await Promise.all(deleteProductPromises);

        // 2. Delete vendor applications
        const appsSnapshot = await db.collection("vendor_applications").where("vendorId", "==", vendorId).get();
        const deleteAppPromises = appsSnapshot.docs.map((docSnap) => docSnap.ref.delete());
        await Promise.all(deleteAppPromises);

        // 3. Delete vendor ledger entries
        const ledgersSnapshot = await db.collection("vendor_ledger_entries").where("vendorId", "==", vendorId).get();
        const deleteLedgerPromises = ledgersSnapshot.docs.map((docSnap) => docSnap.ref.delete());
        await Promise.all(deleteLedgerPromises);

        // 4. Delete Firestore user profile and Firebase Auth account
        if (vendor.ownerUserId) {
            await db.collection("users").doc(vendor.ownerUserId).delete();
            try {
                await adminAuth.deleteUser(vendor.ownerUserId);
            } catch (authError: any) {
                console.warn(`Auth user ${vendor.ownerUserId} not found or failed to delete:`, authError.message);
            }
        }

        // 5. Delete vendor document
        await db.collection("vendors").doc(vendorId).delete();

        return { success: true };
    } catch (error: any) {
        console.error("Error adminPurgeVendorAndAllData:", error);
        return { success: false, error: error.message || "Failed to purge vendor and all data" };
    }
}
