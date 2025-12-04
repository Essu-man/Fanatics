import { NextResponse } from "next/server";
import { doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadImage, deleteImage } from "@/lib/supabase-storage";

export const runtime = "nodejs";

// PATCH - Update a team or toggle enabled status
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ teamId: string }> }
) {
    try {
        const { teamId } = await params;
        const contentType = request.headers.get("content-type") || "";

        // Check if this is a JSON request (for toggling enabled status)
        if (contentType.includes("application/json")) {
            const body = await request.json();
            const { enabled } = body;

            // Determine if this is a hardcoded team or custom team
            let teamRef;
            let teamSnap;

            // Try hardcoded teams collection first
            teamRef = doc(db, "teams", teamId);
            teamSnap = await getDoc(teamRef);

            // If not found, try custom_teams
            if (!teamSnap.exists()) {
                teamRef = doc(db, "custom_teams", teamId);
                teamSnap = await getDoc(teamRef);
            }

            if (!teamSnap.exists()) {
                return NextResponse.json(
                    { success: false, error: "Team not found" },
                    { status: 404 }
                );
            }

            await updateDoc(teamRef, { enabled: enabled ?? true });
            return NextResponse.json({ success: true });
        }

        // FormData request (for updating team details)
        const formData = await request.formData();
        const name = formData.get("name") as string;
        const league = formData.get("league") as string;
        const leagueId = formData.get("leagueId") as string;
        const logoFile = formData.get("logo") as File | null;

        if (!name || !league) {
            return NextResponse.json(
                { success: false, error: "Team name and league are required" },
                { status: 400 }
            );
        }

        // Check if this is a hardcoded or custom team
        let teamRef = doc(db, "teams", teamId);
        let teamSnap = await getDoc(teamRef);
        let isHardcoded = teamSnap.exists();

        // If not found in hardcoded teams, try custom teams
        if (!teamSnap.exists()) {
            teamRef = doc(db, "custom_teams", teamId);
            teamSnap = await getDoc(teamRef);
            isHardcoded = false;
        }

        if (!teamSnap.exists()) {
            return NextResponse.json(
                { success: false, error: "Team not found" },
                { status: 404 }
            );
        }

        const updateData: any = {
            name: name.trim(),
            league: league.trim(),
        };

        // Add leagueId only for custom teams
        if (!isHardcoded) {
            updateData.leagueId = leagueId || "";
        }

        // Upload new logo if provided
        if (logoFile && logoFile.size > 0) {
            const fileName = `team-logos/${Date.now()}-${logoFile.name}`;
            const result = await uploadImage(logoFile, fileName);

            if (!result.success || !result.url) {
                return NextResponse.json(
                    { success: false, error: result.error || 'Failed to upload logo' },
                    { status: 500 }
                );
            }

            // For hardcoded teams, update logo field; for custom teams, update logoUrl
            if (isHardcoded) {
                updateData.logo = result.url;
            } else {
                updateData.logoUrl = result.url;
            }

            // Delete old logo if exists
            const oldLogoUrl = teamSnap.data().logoUrl || teamSnap.data().logo;
            if (oldLogoUrl) {
                try {
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

        await updateDoc(teamRef, updateData);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to update team:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to update team" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a custom team
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ teamId: string }> }
) {
    try {
        const { teamId } = await params;

        // Only custom teams can be deleted
        const teamRef = doc(db, "custom_teams", teamId);
        const teamSnap = await getDoc(teamRef);

        if (!teamSnap.exists()) {
            return NextResponse.json(
                { success: false, error: "Team not found" },
                { status: 404 }
            );
        }

        // Delete logo from storage if exists
        const logoUrl = teamSnap.data().logoUrl;
        if (logoUrl) {
            try {
                const urlParts = logoUrl.split('/product-images/');
                if (urlParts.length > 1) {
                    const path = urlParts[1];
                    await deleteImage(path);
                }
            } catch (error) {
                console.warn("Could not delete team logo:", error);
            }
        }

        await deleteDoc(teamRef);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to delete custom team:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to delete team" },
            { status: 500 }
        );
    }
}
