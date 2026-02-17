import { NextRequest, NextResponse } from "next/server";
import { getSiteContent, updateSiteContent } from "@/lib/firestore";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const contentId = searchParams.get("id") || "home_banner";

        const result = await getSiteContent(contentId);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.data,
        });
    } catch (error: any) {
        console.error("Error in GET /api/admin/content:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { contentId = "home_banner", images, userId, type = "banner" } = body;

        if (!images || !Array.isArray(images)) {
            return NextResponse.json(
                { success: false, error: "Images array is required" },
                { status: 400 }
            );
        }

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "User ID is required" },
                { status: 400 }
            );
        }

        const result = await updateSiteContent(contentId, images, userId, type);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Content updated successfully",
        });
    } catch (error: any) {
        console.error("Error in POST /api/admin/content:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
