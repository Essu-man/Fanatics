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

// GET all custom leagues
export async function GET() {
    try {
        const q = query(collection(db, "custom_leagues"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const leagues = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                sport: data.sport,
                logoUrl: data.logoUrl,
                createdAt: data.createdAt?.toDate() || new Date(),
            };
        });

        return NextResponse.json({ success: true, leagues });
    } catch (error: any) {
        console.error("Failed to fetch custom leagues:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to load leagues" },
            { status: 500 }
        );
    }
}

// POST - Create a new custom league
export async function POST(request: Request) {
    try {
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

        let logoUrl = "";

        // Upload logo if provided
        if (logoFile && logoFile.size > 0) {
            const fileName = `league-logos/${Date.now()}-${logoFile.name}`;
            const storageRef = ref(storage, fileName);

            const bytes = await logoFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            await uploadBytes(storageRef, buffer, {
                contentType: logoFile.type,
            });

            logoUrl = await getDownloadURL(storageRef);
        }

        const leagueData = {
            name: name.trim(),
            sport: sport.trim().toLowerCase(),
            logoUrl,
            createdAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, "custom_leagues"), leagueData);

        return NextResponse.json({
            success: true,
            league: {
                id: docRef.id,
                ...leagueData,
            },
        });
    } catch (error: any) {
        console.error("Failed to create custom league:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to create league" },
            { status: 500 }
        );
    }
}
