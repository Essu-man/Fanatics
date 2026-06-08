import { NextResponse } from "next/server";
import { createProduct, getProductsByVendorId } from "@/lib/firestore";
import { requireVendorAuthDetailed } from "@/lib/api-auth";
import { buildProductFirestorePayload, validateProductCreateBase, vendorDisplayName } from "@/lib/products-shared";
import { adminGetUserProfile } from "@/lib/firestore-admin";
import { sendEmail, getProductWithheldEmail, getAdminNewProductEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(request: Request) {
    const authResult = await requireVendorAuthDetailed(request);
    if (!authResult.ok) {
        return NextResponse.json(
            { success: false, error: authResult.error, code: authResult.code },
            { status: authResult.status }
        );
    }
    const auth = authResult.auth;

    try {
        const products = await getProductsByVendorId(auth.vendorId);
        return NextResponse.json({ success: true, products });
    } catch (error: any) {
        console.error("Vendor products GET:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to load products" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const authResult = await requireVendorAuthDetailed(request);
    if (!authResult.ok) {
        return NextResponse.json(
            { success: false, error: authResult.error, code: authResult.code },
            { status: authResult.status }
        );
    }
    const auth = authResult.auth;

    try {
        const body = await request.json();
        const {
            name,
            price,
            childrenPrice,
            stock,
            childrenStock,
            available = true,
            category,
            teamId,
            description,
            images,
            colors,
            sizes,
            customSizes,
            childrenSizes,
        } = body;

        const base = validateProductCreateBase({
            name,
            price,
            images,
            sizes,
            childrenSizes,
            category,
            teamId,
        });
        if (!base.ok) {
            return NextResponse.json({ success: false, error: base.error }, { status: 400 });
        }

        const vendorName = vendorDisplayName(auth.vendor);

        const payload = await buildProductFirestorePayload({
            name,
            price: Number(price),
            childrenPrice: childrenPrice ? Number(childrenPrice) : undefined,
            stock: Number(stock ?? 0),
            childrenStock:
                childrenStock !== undefined && childrenStock !== null && childrenStock !== ""
                    ? Number(childrenStock)
                    : undefined,
            available: Boolean(available),
            category: category || "Other",
            teamId: typeof teamId === "string" ? teamId : undefined,
            description,
            images,
            colors: Array.isArray(colors) && colors.length > 0 ? colors : undefined,
            sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : undefined,
            customSizes: Array.isArray(customSizes) && customSizes.length > 0 ? customSizes : undefined,
            childrenSizes: Array.isArray(childrenSizes) && childrenSizes.length > 0 ? childrenSizes : undefined,
            vendorId: auth.vendorId,
            vendorName,
            vendorSlug: auth.vendor.slug,
            approved: false,
            status: "pending",
        });

        const result = await createProduct(payload);
        if (!result.success) {
            throw new Error(result.error || "Failed to create product");
        }

        // Send email notification to vendor that the product has been posted but withheld pending review
        const businessName = auth.vendor.businessName || "your shop";
        try {
            const userProfile = await adminGetUserProfile(auth.uid);
            if (userProfile?.email) {
                const contactName = `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() || "Seller";
                const emailHtml = getProductWithheldEmail(contactName, businessName, name);
                await sendEmail(
                    userProfile.email.trim().toLowerCase(),
                    `Product Pending Review - ${name}`,
                    emailHtml
                );
            }
        } catch (emailError) {
            console.error("Failed to send product withheld email:", emailError);
        }

        // Send email notification to store administrator
        try {
            const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_FROM_EMAIL;
            if (adminEmail) {
                const adminEmailHtml = getAdminNewProductEmail("Administrator", businessName, name);
                await sendEmail(
                    adminEmail.trim().toLowerCase(),
                    `New Product Awaiting Review - ${name}`,
                    adminEmailHtml
                );
            }
        } catch (emailError) {
            console.error("Failed to send admin product notification email:", emailError);
        }

        return NextResponse.json({ success: true, productId: result.id });
    } catch (error: any) {
        console.error("Vendor product create:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to create product" },
            { status: 500 }
        );
    }
}
