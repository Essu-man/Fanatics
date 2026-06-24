import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { adminAuth } from "@/lib/firebase-admin";
import { assertSlugUnique } from "@/lib/products-shared";
import { createVendor, updateUserProfile, updateVendor } from "@/lib/firestore";
import { sendEmail, getVendorApplicationApprovedEmail, getVendorApplicationRejectedEmail } from "@/lib/email";

function slugifyBusinessName(name: string): string {
    const base = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);
    return base || "store";
}

async function uniqueSlugFromBusinessName(businessName: string): Promise<string> {
    const base = slugifyBusinessName(businessName);
    let slug = base;
    let suffix = 0;
    while (!(await assertSlugUnique(slug))) {
        suffix += 1;
        slug = `${base}-${suffix}`;
    }
    return slug;
}

async function resolveOwnerUserId(
    applicationId: string,
    email?: string,
    applicantUserId?: string
): Promise<string> {
    if (applicantUserId?.trim()) {
        return applicantUserId.trim();
    }

    if (email?.trim()) {
        const normalizedEmail = email.trim().toLowerCase();
        try {
            const user = await adminAuth.getUserByEmail(normalizedEmail);
            return user.uid;
        } catch {
            // Fall through to Firestore profile lookup
        }

        const usersQuery = query(
            collection(db, "users"),
            where("email", "==", normalizedEmail),
            limit(1)
        );
        const usersSnap = await getDocs(usersQuery);
        if (!usersSnap.empty) {
            return usersSnap.docs[0].id;
        }
    }

    return `pending-link-${applicationId}`;
}

export async function approveVendorApplication(
    applicationId: string
): Promise<{ success: boolean; vendorId?: string; error?: string }> {
    try {
        const appRef = doc(db, "vendor_applications", applicationId);
        const appSnap = await getDoc(appRef);
        if (!appSnap.exists()) {
            return { success: false, error: "Application not found" };
        }

        const app = appSnap.data();
        const businessName = (app.businessName as string)?.trim();
        if (!businessName) {
            return { success: false, error: "Application is missing a business name" };
        }

        let vendorId = app.vendorId as string | undefined;

        const logoUrl =
            (app.logoUrl as string | undefined) ||
            (app.sampleProductImageUrl as string | undefined) ||
            undefined;

        if (vendorId) {
            await updateVendor(vendorId, {
                status: "active",
                ...(logoUrl ? { logoUrl } : {}),
                description: (app.description as string | undefined)?.trim() || undefined,
                socialHandles: app.socialHandles || undefined,
            });
        } else {
            const ownerUserId = await resolveOwnerUserId(
                applicationId,
                app.email as string | undefined,
                app.applicantUserId as string | undefined
            );
            const slug =
                (app.slug as string | undefined)?.trim().toLowerCase() ||
                (await uniqueSlugFromBusinessName(businessName));

            const created = await createVendor({
                slug,
                businessName,
                ownerUserId,
                status: "active",
                description: (app.description as string | undefined)?.trim() || undefined,
                logoUrl,
                socialHandles: app.socialHandles || [],
                payoutMethod: app.payoutMethod || null,
                bankName: app.bankName || null,
                branch: app.branch || null,
                accountNumber: app.accountNumber || null,
                accountName: app.accountName || null,
                momoNetwork: app.momoNetwork || null,
                momoNumber: app.momoNumber || null,
                balanceAvailable: 0,
                balancePending: 0,
            });

            if (!created.success || !created.id) {
                return { success: false, error: created.error || "Failed to create vendor" };
            }

            vendorId = created.id;

            if (!ownerUserId.startsWith("pending-link-")) {
                await updateUserProfile(ownerUserId, {
                    role: "vendor",
                    vendorId,
                });
            }

            await updateDoc(appRef, {
                vendorId,
                slug,
            });
        }

        await updateDoc(appRef, {
            status: "approved",
            approvedAt: Timestamp.now(),
        });

        // Send approval email
        try {
            const recipientEmail = app.email;
            const contactName = app.contactPerson || "Seller";
            if (recipientEmail) {
                const emailHtml = getVendorApplicationApprovedEmail(contactName, businessName);
                await sendEmail(recipientEmail.trim().toLowerCase(), `Seller Application Approved - Welcome to Cediman!`, emailHtml);
            }
        } catch (emailError) {
            console.error("Failed to send vendor approval email:", emailError);
        }

        return { success: true, vendorId };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Approval failed";
        console.error("approveVendorApplication:", error);
        return { success: false, error: message };
    }
}

export async function rejectVendorApplication(
    applicationId: string,
    reason?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const appRef = doc(db, "vendor_applications", applicationId);
        const appSnap = await getDoc(appRef);
        if (!appSnap.exists()) {
            return { success: false, error: "Application not found" };
        }

        const app = appSnap.data();
        const businessName = (app.businessName as string)?.trim() || "your store";

        await updateDoc(appRef, {
            status: "rejected",
            rejectedAt: Timestamp.now(),
            ...(reason ? { rejectionReason: reason } : {}),
        });

        // Send rejection email
        try {
            const recipientEmail = app.email;
            const contactName = app.contactPerson || "Seller";
            if (recipientEmail) {
                const emailHtml = getVendorApplicationRejectedEmail(contactName, businessName, reason || "No specific reason provided.");
                await sendEmail(recipientEmail.trim().toLowerCase(), `Seller Application Update - ${businessName}`, emailHtml);
            }
        } catch (emailError) {
            console.error("Failed to send vendor rejection email:", emailError);
        }

        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Rejection failed";
        console.error("rejectVendorApplication:", error);
        return { success: false, error: message };
    }
}
