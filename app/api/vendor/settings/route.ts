import { NextResponse } from "next/server";
import { requireVendorAuthDetailed } from "@/lib/api-auth";
import { adminGetUserProfile, adminGetVendor, adminIsVendorSlugAvailable, adminUpdateVendor } from "@/lib/firestore-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
    const authResult = await requireVendorAuthDetailed(request);
    if (!authResult.ok) {
        return NextResponse.json(
            { success: false, error: authResult.error, code: authResult.code },
            { status: authResult.status }
        );
    }

    const profile = await adminGetUserProfile(authResult.auth.uid);
    const vendor = (await adminGetVendor(authResult.auth.vendorId)) ?? authResult.auth.vendor;

    return NextResponse.json({
        success: true,
        vendor: {
            id: vendor.id,
            slug: vendor.slug,
            businessName: vendor.businessName,
            description: vendor.description ?? "",
            logoUrl: vendor.logoUrl ?? "",
            bannerUrl: vendor.bannerUrl ?? "",
            status: vendor.status,
            payoutMethod: vendor.payoutMethod ?? null,
            bankName: vendor.bankName ?? null,
            branch: vendor.branch ?? null,
            accountNumber: vendor.accountNumber ?? null,
            accountName: vendor.accountName ?? null,
            momoNetwork: vendor.momoNetwork ?? null,
            momoNumber: vendor.momoNumber ?? null,
        },
        account: profile
            ? {
                  email: profile.email,
                  firstName: profile.firstName,
                  lastName: profile.lastName,
              }
            : null,
        storefrontUrl: `/store/${vendor.slug}`,
    });
}

export async function PATCH(request: Request) {
    const authResult = await requireVendorAuthDetailed(request);
    if (!authResult.ok) {
        return NextResponse.json(
            { success: false, error: authResult.error, code: authResult.code },
            { status: authResult.status }
        );
    }

    try {
        const body = await request.json();
        const {
            businessName,
            slug,
            description,
            logoUrl,
            bannerUrl,
            payoutMethod,
            bankName,
            branch,
            accountNumber,
            accountName,
            momoNetwork,
            momoNumber,
        } = body;

        const updates: Record<string, any> = {};

        if (typeof businessName === "string" && businessName.trim()) {
            updates.businessName = businessName.trim();
        } else if (businessName !== undefined) {
            return NextResponse.json(
                { success: false, error: "Business name is required" },
                { status: 400 }
            );
        }

        if (typeof slug === "string" && slug.trim()) {
            const normalized = slug.trim().toLowerCase().replace(/\s+/g, "-");
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Store URL slug can only use lowercase letters, numbers, and hyphens",
                    },
                    { status: 400 }
                );
            }
            const available = await adminIsVendorSlugAvailable(normalized, authResult.auth.vendorId);
            if (!available) {
                return NextResponse.json(
                    { success: false, error: "That store URL is already taken" },
                    { status: 400 }
                );
            }
            updates.slug = normalized;
        }

        if (description !== undefined) {
            updates.description = typeof description === "string" ? description.trim() : "";
        }

        if (logoUrl !== undefined) {
            updates.logoUrl = typeof logoUrl === "string" ? logoUrl.trim() : "";
        }

        if (bannerUrl !== undefined) {
            updates.bannerUrl = typeof bannerUrl === "string" ? bannerUrl.trim() : "";
        }

        if (payoutMethod !== undefined) {
            updates.payoutMethod = payoutMethod;
        }
        if (bankName !== undefined) {
            updates.bankName = bankName;
        }
        if (branch !== undefined) {
            updates.branch = branch;
        }
        if (accountNumber !== undefined) {
            updates.accountNumber = accountNumber;
        }
        if (accountName !== undefined) {
            updates.accountName = accountName;
        }
        if (momoNetwork !== undefined) {
            updates.momoNetwork = momoNetwork;
        }
        if (momoNumber !== undefined) {
            updates.momoNumber = momoNumber;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ success: false, error: "No changes to save" }, { status: 400 });
        }

        const result = await adminUpdateVendor(authResult.auth.vendorId, updates);
        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error || "Failed to update settings" },
                { status: 500 }
            );
        }

        const vendor = await adminGetVendor(authResult.auth.vendorId);

        return NextResponse.json({
            success: true,
            vendor: vendor
                ? {
                      id: vendor.id,
                      slug: vendor.slug,
                      businessName: vendor.businessName,
                      description: vendor.description ?? "",
                      logoUrl: vendor.logoUrl ?? "",
                      bannerUrl: vendor.bannerUrl ?? "",
                      status: vendor.status,
                      payoutMethod: vendor.payoutMethod ?? null,
                      bankName: vendor.bankName ?? null,
                      branch: vendor.branch ?? null,
                      accountNumber: vendor.accountNumber ?? null,
                      accountName: vendor.accountName ?? null,
                      momoNetwork: vendor.momoNetwork ?? null,
                      momoNumber: vendor.momoNumber ?? null,
                  }
                : null,
            storefrontUrl: vendor ? `/store/${vendor.slug}` : null,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to save settings";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
