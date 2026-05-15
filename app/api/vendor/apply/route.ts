import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { 
            contactPerson, 
            email, 
            phone, 
            businessName, 
            category, 
            description, 
            website, 
            instagram,
            payoutMethod,
            bankName,
            accountNumber,
            accountName
        } = body;

        if (!contactPerson || !email || !phone || !businessName) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Add to vendor_applications collection
        await addDoc(collection(db, "vendor_applications"), {
            contactPerson,
            email,
            phone,
            businessName,
            category,
            description: description || null,
            website: website || null,
            instagram: instagram || null,
            payoutMethod: payoutMethod || "Bank Transfer",
            bankName: bankName || null,
            accountNumber: accountNumber || null,
            accountName: accountName || null,
            status: "pending",
            appliedAt: serverTimestamp(),
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error submitting vendor application:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
