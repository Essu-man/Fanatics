import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, Timestamp } from "firebase/firestore";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();
        const { action } = body;

        if (!action || !["approve", "reject"].includes(action)) {
            return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
        }

        const status = action === "approve" ? "approved" : "rejected";
        const approved = action === "approve";

        const docRef = doc(db, "products", id);
        await updateDoc(docRef, {
            status,
            approved,
            updatedAt: Timestamp.now()
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error updating product status:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
