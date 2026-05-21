import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type VendorApplicationStatus = "pending" | "approved" | "rejected";

export type UserVendorApplicationSummary = {
    id: string;
    status: VendorApplicationStatus;
    businessName: string;
    appliedAt: Date | null;
    reviewedAt?: Date | null;
};

function toDate(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof (value as { toDate?: () => Date }).toDate === "function") {
        return (value as { toDate: () => Date }).toDate();
    }
    return null;
}

/** Latest vendor application for this user (by Firebase uid or account email). */
export async function getLatestVendorApplicationForUser(
    uid: string,
    email?: string
): Promise<UserVendorApplicationSummary | null> {
    const candidates: UserVendorApplicationSummary[] = [];

    const byUid = query(collection(db, "vendor_applications"), where("applicantUserId", "==", uid));
    const uidSnap = await getDocs(byUid);
    uidSnap.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const status = data.status as VendorApplicationStatus;
        if (!["pending", "approved", "rejected"].includes(status)) return;
        candidates.push({
            id: docSnap.id,
            status,
            businessName: (data.businessName as string) || "Your store",
            appliedAt: toDate(data.appliedAt),
            reviewedAt: toDate(data.approvedAt) || toDate(data.rejectedAt),
        });
    });

    const normalizedEmail = email?.trim().toLowerCase();
    if (normalizedEmail) {
        const byEmail = query(collection(db, "vendor_applications"), where("email", "==", normalizedEmail));
        const emailSnap = await getDocs(byEmail);
        emailSnap.docs.forEach((docSnap) => {
            if (candidates.some((c) => c.id === docSnap.id)) return;
            const data = docSnap.data();
            const status = data.status as VendorApplicationStatus;
            if (!["pending", "approved", "rejected"].includes(status)) return;
            candidates.push({
                id: docSnap.id,
                status,
                businessName: (data.businessName as string) || "Your store",
                appliedAt: toDate(data.appliedAt),
                reviewedAt: toDate(data.approvedAt) || toDate(data.rejectedAt),
            });
        });
    }

    if (candidates.length === 0) return null;

    candidates.sort((a, b) => {
        const ta = a.appliedAt?.getTime() ?? 0;
        const tb = b.appliedAt?.getTime() ?? 0;
        return tb - ta;
    });

    return candidates[0];
}
