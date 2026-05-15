import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();
        const { status } = body;

        if (!status || !["approved", "rejected"].includes(status)) {
            return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
        }

        const docRef = doc(db, "vendor_applications", id);
        await updateDoc(docRef, { status });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error updating vendor application:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
