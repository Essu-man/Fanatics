import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        // Check if Supabase is configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
            return NextResponse.json(
                { success: false, error: "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL in your environment variables." },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file");
        const folder = (formData.get("folder") as string) || "products";
        const bucket = process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET || "product-images";

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { success: false, error: "A valid image file is required" },
                { status: 400 }
            );
        }

        // Check if bucket exists, create if it doesn't
        const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();

        if (listError) {
            console.error("Error listing buckets:", listError);
        } else {
            const bucketExists = buckets?.some((b) => b.name === bucket);

            if (!bucketExists) {
                // Try to create the bucket
                const { data: newBucket, error: createError } = await supabaseAdmin.storage.createBucket(bucket, {
                    public: true,
                    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                    fileSizeLimit: 5242880, // 5MB
                });

                if (createError) {
                    console.error("Error creating bucket:", createError);
                    return NextResponse.json(
                        {
                            success: false,
                            error: `Storage bucket "${bucket}" not found. Please create it in your Supabase dashboard under Storage, or check your environment variables.`
                        },
                        { status: 500 }
                    );
                }
            }
        }

        const fileExt = file.name.split(".").pop();
        const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
        const path = `${folder}/${Date.now()}-${randomUUID()}.${fileExt || "jpg"}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error } = await supabaseAdmin.storage
            .from(bucket)
            .upload(path, buffer, {
                contentType: file.type || "image/jpeg",
                upsert: false,
                cacheControl: "3600",
                metadata: { originalName: safeName },
            });

        if (error) {
            // Provide more helpful error messages
            if (error.message?.includes("Bucket not found") || error.message?.includes("not found")) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Storage bucket "${bucket}" not found. Please create it in your Supabase dashboard under Storage. Make sure it's set to public.`
                    },
                    { status: 500 }
                );
            }
            throw error;
        }

        const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);

        return NextResponse.json({
            success: true,
            path: data.path,
            url: publicData.publicUrl,
        });
    } catch (error: any) {
        console.error("Image upload failed:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to upload image" },
            { status: 500 }
        );
    }
}


