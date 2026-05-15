import { doc, getDoc, collection, query, where, getDocs, limit, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { footballTeams, basketballTeams, internationalTeams } from "@/lib/teams";
import { isApparelJerseyCategory } from "@/lib/product-category";
import type { Product } from "@/lib/firestore";

const allTeams = [...footballTeams, ...basketballTeams, ...internationalTeams];

export type ResolvedTeam = {
    teamName: string;
    league: string;
    actualTeamId: string;
    isHardcodedTeam: boolean;
};

export async function resolveTeamForProduct(
    teamId: string | undefined,
    category: string
): Promise<ResolvedTeam | null> {
    if (!isApparelJerseyCategory(category)) {
        return null;
    }
    if (!teamId || typeof teamId !== "string") {
        throw new Error("Team is required for jersey / apparel categories");
    }

    let team = allTeams.find((t) => t.id === teamId);

    if (team) {
        return {
            teamName: team.name,
            league: team.league,
            actualTeamId: team.id,
            isHardcodedTeam: true,
        };
    }

    let customTeamSnap = await getDoc(doc(db, "custom_teams", teamId));

    if (!customTeamSnap.exists()) {
        throw new Error("Selected team is not recognized");
    }

    const customTeam = customTeamSnap.data();
    return {
        teamName: customTeam.name as string,
        league: customTeam.league as string,
        actualTeamId: customTeamSnap.id,
        isHardcodedTeam: false,
    };
}

/** Enable team catalog entries when a jersey product is created (matches legacy admin behavior). */
export async function enableTeamForProduct(resolved: ResolvedTeam | null): Promise<void> {
    if (!resolved) return;

    try {
        if (resolved.isHardcodedTeam) {
            const teamRef = doc(db, "teams", resolved.actualTeamId);
            const teamSnap = await getDoc(teamRef);
            if (teamSnap.exists()) {
                const currentData = teamSnap.data();
                if (!currentData.enabled) {
                    await updateDoc(teamRef, { enabled: true });
                }
            }
        } else {
            const teamRef = doc(db, "custom_teams", resolved.actualTeamId);
            const teamSnap = await getDoc(teamRef);
            if (teamSnap.exists()) {
                const currentData = teamSnap.data();
                if (currentData.enabled === false) {
                    await updateDoc(teamRef, { enabled: true });
                }
            }
        }
    } catch (e) {
        console.error("[Enable Team] Error enabling team:", e);
    }
}

export type BuildProductInput = {
    name: string;
    price: number;
    childrenPrice?: number;
    stock: number;
    /** Accept string from JSON APIs or number */
    childrenStock?: number | string | null;
    available?: boolean;
    category: string;
    teamId?: string;
    description?: string;
    images: string[];
    colors?: Array<{ id: string; name: string; hex: string }>;
    sizes?: string[];
    childrenSizes?: string[];
    vendorId?: string;
    vendorName?: string;
    vendorSlug?: string;
    approved?: boolean;
    status?: "pending" | "approved" | "rejected";
};

export async function buildProductFirestorePayload(input: BuildProductInput): Promise<Omit<Product, "id" | "createdAt" | "updatedAt">> {
    const category = input.category?.trim() || "Other";
    const resolved = await resolveTeamForProduct(input.teamId, category);
    await enableTeamForProduct(resolved);

    let colors = Array.isArray(input.colors) && input.colors.length > 0 ? input.colors : undefined;
    if (!colors && !isApparelJerseyCategory(category)) {
        colors = [{ id: "default", name: "Default", hex: "#e4e4e7" }];
    }

    const description =
        input.description?.trim() ||
        (resolved ? `${resolved.teamName} official merchandise` : `${input.name.trim()} — sold on Cediman`);

    const payload: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
        name: input.name.trim(),
        price: Number(input.price),
        childrenPrice: input.childrenPrice !== undefined ? Number(input.childrenPrice) : undefined,
        stock: Number(input.stock ?? 0),
        childrenStock:
            input.childrenStock !== undefined &&
            input.childrenStock !== null &&
            `${input.childrenStock}` !== ""
                ? Number(input.childrenStock)
                : undefined,
        available: input.available !== false,
        category,
        description,
        images: input.images,
        colors,
        sizes: Array.isArray(input.sizes) && input.sizes.length > 0 ? input.sizes : undefined,
        childrenSizes: Array.isArray(input.childrenSizes) && input.childrenSizes.length > 0 ? input.childrenSizes : undefined,
    };

    if (resolved) {
        payload.team = resolved.teamName;
        payload.teamId = resolved.actualTeamId;
        payload.league = resolved.league;
    } else {
        payload.team = undefined;
        payload.teamId = undefined;
        payload.league = undefined;
    }

    if (input.vendorId) {
        payload.vendorId = input.vendorId;
    }
    if (input.vendorName !== undefined) {
        payload.vendorName = input.vendorName;
    }
    if (input.vendorSlug !== undefined) {
        payload.vendorSlug = input.vendorSlug?.trim().toLowerCase();
    }

    if (input.approved !== undefined) {
        payload.approved = input.approved;
    }
    if (input.status !== undefined) {
        payload.status = input.status;
    }

    return payload;
}

/** Resolve display name for denormalized product.vendorName */
export function vendorDisplayName(vendor: { businessName: string; slug: string }): string {
    return vendor.businessName?.trim() || vendor.slug;
}

/** True when payload satisfies minimum fields for create */
export function validateProductCreateBase(body: {
    name?: unknown;
    price?: unknown;
    images?: unknown;
    sizes?: unknown;
    childrenSizes?: unknown;
    category?: unknown;
    teamId?: unknown;
}): { ok: true } | { ok: false; error: string } {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category = typeof body.category === "string" ? body.category : "Other";

    if (!name || typeof body.price === "undefined") {
        return { ok: false, error: "Name and price are required" };
    }

    const images = body.images;
    if (!Array.isArray(images) || images.length === 0) {
        return { ok: false, error: "At least one image is required" };
    }

    const sizes = body.sizes;
    const childrenSizes = body.childrenSizes;
    const hasSizes = Array.isArray(sizes) && sizes.length > 0;
    const hasChildrenSizes = Array.isArray(childrenSizes) && childrenSizes.length > 0;
    if (!hasSizes && !hasChildrenSizes) {
        return { ok: false, error: "Select at least one size (adult or children), or one size for general products" };
    }

    if (isApparelJerseyCategory(category) && (!body.teamId || typeof body.teamId !== "string")) {
        return { ok: false, error: "Team is required for jersey products" };
    }

    return { ok: true };
}

export async function assertSlugUnique(slug: string, excludeVendorId?: string): Promise<boolean> {
    const q = query(collection(db, "vendors"), where("slug", "==", slug.trim().toLowerCase()), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return true;
    const docId = snap.docs[0].id;
    if (excludeVendorId && docId === excludeVendorId) return true;
    return false;
}
