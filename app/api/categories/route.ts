import { NextResponse } from "next/server";
import { getStoreCategories } from "@/lib/firestore";

export async function GET() {
    try {
        const categories = await getStoreCategories();
        return NextResponse.json({ success: true, categories });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
