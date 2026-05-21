import { NextResponse } from "next/server";
import { uploadVendorAsset } from "@/lib/supabase-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const folder = (formData.get("folder") as string) || "vendor-applications";

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ success: false, error: "A valid file is required" }, { status: 400 });
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${folder}/${Date.now()}-${safeName}`;
        const result = await uploadVendorAsset(file, path);

        if (!result.success || !result.url) {
            return NextResponse.json(
                { success: false, error: result.error || "Failed to upload file" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, url: result.url });
    } catch (error: any) {
        console.error("Vendor upload failed:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to upload file" },
            { status: 500 }
        );
    }
}
