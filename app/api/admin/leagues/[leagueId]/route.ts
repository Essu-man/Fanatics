import { NextResponse } from "next/server";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadImage, deleteImage } from "@/lib/supabase-storage";

export const runtime = "nodejs";

// PATCH - Update a league
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ leagueId: string }> }
) {
    try {
        const { leagueId } = await params;
        const formData = await request.formData();
        const name = formData.get("name") as string;
        const sport = formData.get("sport") as string;
        const logoFile = formData.get("logo") as File | null;

        if (!name || !sport) {
            return NextResponse.json(
                { success: false, error: "League name and sport are required" },
                { status: 400 }
            );
        }

        const leagueRef = doc(db, "custom_leagues", leagueId);
        const leagueDoc = await getDoc(leagueRef);

        if (!leagueDoc.exists()) {
            return NextResponse.json(
                { success: false, error: "League not found" },
                { status: 404 }
            );
        }

        const updateData: any = {
            name: name.trim(),
            sport: sport.trim().toLowerCase(),
        };

        // Upload new logo if provided
        if (logoFile && logoFile.size > 0) {
            const fileName = `league-logos/${Date.now()}-${logoFile.name}`;
            const result = await uploadImage(logoFile, fileName);

            if (!result.success || !result.url) {
                return NextResponse.json(
                    { success: false, error: result.error || 'Failed to upload logo' },
                    { status: 500 }
                );
            }

            updateData.logoUrl = result.url;

            // Delete old logo if exists
            const oldLogoUrl = leagueDoc.data().logoUrl;
            if (oldLogoUrl) {
                try {
                    // Extract path from URL
                    const urlParts = oldLogoUrl.split('/product-images/');
                    if (urlParts.length > 1) {
                        const oldPath = urlParts[1];
                        await deleteImage(oldPath);
                    }
                } catch (error) {
                    console.warn("Could not delete old logo:", error);
                }
            }
        }

        await updateDoc(leagueRef, updateData);

        return NextResponse.json({
            success: true,
            league: {
                id: leagueId,
                ...updateData,
            },
        });
    } catch (error: any) {
        console.error("Failed to update league:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to update league" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a league
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ leagueId: string }> }
) {
    try {
        const { leagueId } = await params;
        const leagueRef = doc(db, "custom_leagues", leagueId);
        const leagueDoc = await getDoc(leagueRef);

        if (!leagueDoc.exists()) {
            return NextResponse.json(
                { success: false, error: "League not found" },
                { status: 404 }
            );
        }

        // Delete logo from storage if exists
        const logoUrl = leagueDoc.data().logoUrl;
        if (logoUrl) {
            try {
                // Extract path from URL
                const urlParts = logoUrl.split('/product-images/');
                if (urlParts.length > 1) {
                    const path = urlParts[1];
                    await deleteImage(path);
                }
            } catch (error) {
                console.warn("Could not delete league logo:", error);
            }
        }

        await deleteDoc(leagueRef);

        return NextResponse.json({
            success: true,
            message: "League deleted successfully",
        });
    } catch (error: any) {
        console.error("Failed to delete league:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to delete league" },
            { status: 500 }
        );
    }
}
