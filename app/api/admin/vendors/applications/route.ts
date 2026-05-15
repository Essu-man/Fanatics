import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";

export async function GET() {
    try {
        const q = query(collection(db, "vendor_applications"), orderBy("appliedAt", "desc"));
        const snap = await getDocs(q);
        
        const applications = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            appliedAt: doc.data().appliedAt?.toDate() || new Date(),
        }));

        return NextResponse.json({ success: true, applications });
    } catch (error: any) {
        console.error("Error fetching vendor applications:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
