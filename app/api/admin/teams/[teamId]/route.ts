import { NextResponse } from "next/server";
import { doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export const runtime = "nodejs";

// PATCH - Update a custom team
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ teamId: string }> }
) {
    try {
        const { teamId } = await params;
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

        const teamRef = doc(db, "custom_teams", teamId);
        const teamSnap = await getDoc(teamRef);

        if (!teamSnap.exists()) {
            return NextResponse.json(
                { success: false, error: "Team not found" },
                { status: 404 }
            );
        }

        const updateData: any = {
            name: name.trim(),
            league: league.trim(),
            leagueId: leagueId || "",
        };

        // Upload new logo if provided
        if (logoFile && logoFile.size > 0) {
            const fileName = `team-logos/${Date.now()}-${logoFile.name}`;
            const storageRef = ref(storage, fileName);

            const bytes = await logoFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            await uploadBytes(storageRef, buffer, {
                contentType: logoFile.type,
            });

            updateData.logoUrl = await getDownloadURL(storageRef);

            // Delete old logo if exists
            const oldLogoUrl = teamSnap.data().logoUrl;
            if (oldLogoUrl) {
                try {
                    const oldRef = ref(storage, oldLogoUrl);
                    await deleteObject(oldRef);
                } catch (error) {
                    console.warn("Could not delete old logo:", error);
                }
            }
        }

        await updateDoc(teamRef, updateData);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to update custom team:", error);
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
                const logoRef = ref(storage, logoUrl);
                await deleteObject(logoRef);
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
