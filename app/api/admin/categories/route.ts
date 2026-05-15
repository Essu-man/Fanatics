import { NextResponse } from "next/server";
import { getStoreCategories, createStoreCategory } from "@/lib/firestore";

export async function GET() {
    try {
        const categories = await getStoreCategories();
        return NextResponse.json({ success: true, categories });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = await createStoreCategory(body);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
