import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            applicantUserId,
            contactPerson,
            email,
            phone,
            businessName,
            category,
            categoryOther,
            description,
            socialHandles,
            businessLocationType,
            businessAddress,
            logoUrl,
            sampleProductImageUrl,
            registrationCertificateUrl,
            payoutMethod,
            bankName,
            branch,
            accountNumber,
            accountName,
            momoNetwork,
            momoNumber,
        } = body;

        if (!contactPerson || !email || !phone || !businessName) {
            return NextResponse.json({ success: false, error: "Missing required contact fields" }, { status: 400 });
        }

        if (!description?.trim()) {
            return NextResponse.json({ success: false, error: "Store description is required" }, { status: 400 });
        }

        if (!category) {
            return NextResponse.json({ success: false, error: "Category is required" }, { status: 400 });
        }

        if (category === "Other" && !categoryOther?.trim()) {
            return NextResponse.json(
                { success: false, error: "Please describe your category when selecting Other" },
                { status: 400 }
            );
        }

        if (!businessLocationType || !["online", "onsite"].includes(businessLocationType)) {
            return NextResponse.json({ success: false, error: "Business location type is required" }, { status: 400 });
        }

        if (businessLocationType === "onsite" && !businessAddress?.trim()) {
            return NextResponse.json(
                { success: false, error: "Business address is required for on-site sellers" },
                { status: 400 }
            );
        }

        if (!logoUrl) {
            return NextResponse.json({ success: false, error: "Store logo is required" }, { status: 400 });
        }

        if (!sampleProductImageUrl) {
            return NextResponse.json({ success: false, error: "Sample product image is required" }, { status: 400 });
        }

        if (!registrationCertificateUrl) {
            return NextResponse.json(
                { success: false, error: "Business registration certificate is required" },
                { status: 400 }
            );
        }

        const handles = Array.isArray(socialHandles)
            ? socialHandles
                  .map((h: { platform?: string; handle?: string } | string) => {
                      if (typeof h === "string") {
                          const trimmed = h.trim();
                          return trimmed ? { platform: "Other", handle: trimmed } : null;
                      }
                      if (h?.platform && h?.handle?.trim()) {
                          return { platform: h.platform.trim(), handle: h.handle.trim() };
                      }
                      return null;
                  })
                  .filter(Boolean)
            : [];

        if (payoutMethod === "Bank Transfer") {
            if (!bankName?.trim() || !branch?.trim() || !accountNumber?.trim() || !accountName?.trim()) {
                return NextResponse.json(
                    { success: false, error: "Bank name, branch, account number, and account name are required" },
                    { status: 400 }
                );
            }
        } else if (payoutMethod === "Mobile Money") {
            if (!momoNetwork || !momoNumber?.trim()) {
                return NextResponse.json(
                    { success: false, error: "Mobile money network and number are required" },
                    { status: 400 }
                );
            }
        } else {
            return NextResponse.json({ success: false, error: "Invalid payout method" }, { status: 400 });
        }

        await addDoc(collection(db, "vendor_applications"), {
            applicantUserId:
                typeof applicantUserId === "string" && applicantUserId.trim()
                    ? applicantUserId.trim()
                    : null,
            contactPerson,
            email: email.trim().toLowerCase(),
            phone,
            businessName,
            category,
            categoryOther: category === "Other" ? categoryOther.trim() : null,
            description: description.trim(),
            socialHandles: handles,
            businessLocationType,
            businessAddress: businessLocationType === "onsite" ? businessAddress.trim() : null,
            logoUrl,
            sampleProductImageUrl,
            registrationCertificateUrl,
            payoutMethod,
            bankName: payoutMethod === "Bank Transfer" ? bankName.trim() : null,
            branch: payoutMethod === "Bank Transfer" ? branch.trim() : null,
            accountNumber: payoutMethod === "Bank Transfer" ? accountNumber.trim() : null,
            accountName: payoutMethod === "Bank Transfer" ? accountName.trim() : null,
            momoNetwork: payoutMethod === "Mobile Money" ? momoNetwork : null,
            momoNumber: payoutMethod === "Mobile Money" ? momoNumber.trim() : null,
            status: "pending",
            appliedAt: serverTimestamp(),
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error submitting vendor application:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
