import { NextResponse } from "next/server";
import {
    collection,
    getDocs,
    addDoc,
    Timestamp,
    orderBy,
    query,
} from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const runtime = "nodejs";

// GET all custom teams
export async function GET() {
    try {
        const q = query(collection(db, "custom_teams"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const teams = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                league: data.league,
                leagueId: data.leagueId,
                logoUrl: data.logoUrl,
                createdAt: data.createdAt?.toDate() || new Date(),
            };
        });

        return NextResponse.json({ success: true, teams });
    } catch (error: any) {
        console.error("Failed to fetch custom teams:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to load teams" },
            { status: 500 }
        );
    }
}

// POST - Create a new custom team
export async function POST(request: Request) {
    try {
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

        let logoUrl = "";

        // Upload logo if provided
        if (logoFile && logoFile.size > 0) {
            const fileName = `team-logos/${Date.now()}-${logoFile.name}`;
            const storageRef = ref(storage, fileName);

            const bytes = await logoFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            await uploadBytes(storageRef, buffer, {
                contentType: logoFile.type,
            });

            logoUrl = await getDownloadURL(storageRef);
        }

        const teamData = {
            name: name.trim(),
            league: league.trim(),
            leagueId: leagueId || "",
            logoUrl,
            createdAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, "custom_teams"), teamData);

        return NextResponse.json({
            success: true,
            team: {
                id: docRef.id,
                ...teamData,
            },
        });
    } catch (error: any) {
        console.error("Failed to create custom team:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to create team" },
            { status: 500 }
        );
    }
}
