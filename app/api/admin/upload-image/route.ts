import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/supabase-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const folder = (formData.get("folder") as string) || "products";

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { success: false, error: "A valid image file is required" },
                { status: 400 }
            );
        }

        const path = `${folder}/${Date.now()}-${file.name}`;
        const result = await uploadImage(file, path);

        if (!result.success || !result.url) {
            return NextResponse.json(
                { success: false, error: result.error || "Failed to upload image" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            url: result.url,
        });
    } catch (error: any) {
        console.error("Image upload failed:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to upload image" },
            { status: 500 }
        );
    }
}



