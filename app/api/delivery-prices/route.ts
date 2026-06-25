import { NextResponse } from "next/server";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const runtime = "nodejs";

// GET delivery price for a location
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const location = searchParams.get("location");
        const vendorsParam = searchParams.get("vendors");
        const productsParam = searchParams.get("products");

        if (!location) {
            return NextResponse.json(
                { success: false, error: "Location is required" },
                { status: 400 }
            );
        }

        // Query for the specific location (case-insensitive)
        const deliveryPricesRef = collection(db, "delivery_prices");
        const q = query(
            deliveryPricesRef,
            where("location", "==", location.trim())
        );
        const querySnapshot = await getDocs(q);

        let basePrice = 0;
        let found = false;
        let resolvedLocation = location;

        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const data = docSnap.data();
            basePrice = data.price || 0;
            found = true;
            resolvedLocation = data.location;
        }

        let totalPrice = basePrice;
        const uniqueVendorIds = new Set<string>();

        if (productsParam) {
            const productIds = Array.from(new Set(productsParam.split(",").map(p => p.trim()).filter(Boolean)));
            for (const productId of productIds) {
                try {
                    const productRef = doc(db, "products", productId);
                    const productSnap = await getDoc(productRef);
                    if (productSnap.exists()) {
                        const productData = productSnap.data();
                        if (productData.vendorId) {
                            uniqueVendorIds.add(productData.vendorId);
                        }
                    }
                } catch (e) {
                    console.error(`Failed to fetch product ${productId} in delivery-prices:`, e);
                }
            }
        } else if (vendorsParam) {
            const vendorIds = vendorsParam.split(",").map(v => v.trim()).filter(Boolean);
            vendorIds.forEach(id => uniqueVendorIds.add(id));
        }

        if (uniqueVendorIds.size > 0) {
            let enabledVendorsCount = 0;

            for (const vendorId of Array.from(uniqueVendorIds)) {
                try {
                    const vendorRef = doc(db, "vendors", vendorId);
                    const vendorSnap = await getDoc(vendorRef);
                    if (vendorSnap.exists()) {
                        const vendorData = vendorSnap.data();
                        // deliveryEnabled defaults to true if not explicitly set to false
                        if (vendorData.deliveryEnabled !== false) {
                            enabledVendorsCount++;
                        }
                    } else {
                        // Default to charging delivery if vendor document is not found
                        enabledVendorsCount++;
                    }
                } catch (e) {
                    console.error(`Failed to fetch vendor ${vendorId} in delivery-prices:`, e);
                    enabledVendorsCount++;
                }
            }

            totalPrice = basePrice * enabledVendorsCount;
        }

        return NextResponse.json({
            success: true,
            price: totalPrice,
            location: resolvedLocation,
            found: found,
        });
    } catch (error: any) {
        console.error("Failed to fetch delivery price:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Unable to fetch delivery price" },
            { status: 500 }
        );
    }
}
