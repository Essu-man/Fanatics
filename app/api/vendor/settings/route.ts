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
            socialHandles: vendor.socialHandles ?? [],
            status: vendor.status,
            payoutMethod: vendor.payoutMethod ?? null,
            payoutSchedule: (vendor as any).payoutSchedule ?? "manual",
            bankName: vendor.bankName ?? null,
            branch: vendor.branch ?? null,
            accountNumber: vendor.accountNumber ?? null,
            accountName: vendor.accountName ?? null,
            momoNetwork: vendor.momoNetwork ?? null,
            momoNumber: vendor.momoNumber ?? null,
            paystackBankCode: vendor.paystackBankCode ?? null,
            paystackRecipientCode: vendor.paystackRecipientCode ?? null,
            deliveryEnabled: vendor.deliveryEnabled !== false,
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
            socialHandles,
            payoutMethod,
            payoutSchedule,
            bankName,
            branch,
            accountNumber,
            accountName,
            momoNetwork,
            momoNumber,
            bankCode,
            deliveryEnabled,
        } = body;

        const currentVendor = await adminGetVendor(authResult.auth.vendorId);

        const updates: Record<string, any> = {};

        if (deliveryEnabled !== undefined) {
            updates.deliveryEnabled = Boolean(deliveryEnabled);
        }

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
        if (payoutSchedule !== undefined) {
            updates.payoutSchedule = payoutSchedule;
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
        if (socialHandles !== undefined) {
            updates.socialHandles = Array.isArray(socialHandles) ? socialHandles : [];
        }

        // Determine if payout settings are being updated and have changed
        const hasPayoutDetailsChanged = 
            payoutMethod !== undefined && (
                payoutMethod !== currentVendor?.payoutMethod ||
                (payoutMethod === "Bank Transfer" && (
                    accountNumber !== currentVendor?.accountNumber ||
                    accountName !== currentVendor?.accountName ||
                    bankCode !== currentVendor?.paystackBankCode
                )) ||
                (payoutMethod === "Mobile Money" && (
                    momoNumber !== currentVendor?.momoNumber ||
                    momoNetwork !== currentVendor?.momoNetwork
                ))
            );

        const needsPaystackRegistration = hasPayoutDetailsChanged || (payoutMethod && !currentVendor?.paystackRecipientCode);

        if (needsPaystackRegistration) {
            const method = payoutMethod || currentVendor?.payoutMethod;
            if (method === "Bank Transfer") {
                const accNum = accountNumber !== undefined ? accountNumber : currentVendor?.accountNumber;
                const accName = accountName !== undefined ? accountName : currentVendor?.accountName;
                const bCode = bankCode !== undefined ? bankCode : currentVendor?.paystackBankCode;

                if (!accNum || !accName || !bCode) {
                    return NextResponse.json(
                        { success: false, error: "Missing account details or bank code for Paystack registration" },
                        { status: 400 }
                    );
                }

                // Call Paystack API
                const paystackResponse = await fetch("https://api.paystack.co/transferrecipient", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        type: "ghipss",
                        name: accName,
                        account_number: accNum,
                        bank_code: bCode,
                        currency: "GHS"
                    })
                });

                const paystackData = await paystackResponse.json();
                if (!paystackData.status) {
                    return NextResponse.json(
                        { success: false, error: `Paystack Verification Failed: ${paystackData.message}` },
                        { status: 400 }
                    );
                }

                updates.paystackRecipientCode = paystackData.data.recipient_code;
                updates.paystackBankCode = bCode;
            } else if (method === "Mobile Money") {
                const mobNum = momoNumber !== undefined ? momoNumber : currentVendor?.momoNumber;
                const mobNet = momoNetwork !== undefined ? momoNetwork : currentVendor?.momoNetwork;

                if (!mobNum || !mobNet) {
                    return NextResponse.json(
                        { success: false, error: "Missing mobile number or network for Paystack registration" },
                        { status: 400 }
                    );
                }

                // Map Network provider code
                let providerCode = mobNet;
                if (mobNet === "Telecel") {
                    providerCode = "VOD";
                } else if (mobNet === "AirtelTigo") {
                    providerCode = "ATL";
                } // MTN is MTN

                // Call Paystack API
                const paystackResponse = await fetch("https://api.paystack.co/transferrecipient", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        type: "mobile_money",
                        name: businessName || currentVendor?.businessName || "Vendor Owner",
                        account_number: mobNum,
                        bank_code: providerCode,
                        currency: "GHS"
                    })
                });

                const paystackData = await paystackResponse.json();
                if (!paystackData.status) {
                    return NextResponse.json(
                        { success: false, error: `Paystack Verification Failed: ${paystackData.message}` },
                        { status: 400 }
                    );
                }

                updates.paystackRecipientCode = paystackData.data.recipient_code;
                updates.paystackBankCode = providerCode;
            }
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
                      paystackBankCode: vendor.paystackBankCode ?? null,
                      paystackRecipientCode: vendor.paystackRecipientCode ?? null,
                      deliveryEnabled: vendor.deliveryEnabled !== false,
                  }
                : null,
            storefrontUrl: vendor ? `/store/${vendor.slug}` : null,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unable to save settings";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
