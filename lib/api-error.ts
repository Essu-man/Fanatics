import { NextResponse } from "next/server";
import { isFirebaseAdminConfigError } from "@/lib/get-firebase-service-account";

const ADMIN_SETUP_HINT =
    "Server Firebase Admin is not set up. In .env.local add FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json and place your Firebase service account JSON in the project root (Firebase Console → Project settings → Service accounts → Generate new private key).";

export function handleApiAuthError(error: unknown, logLabel: string) {
    if (isFirebaseAdminConfigError(error)) {
        console.error(`${logLabel}:`, error);
        return NextResponse.json(
            {
                success: false,
                error: ADMIN_SETUP_HINT,
                code: "ADMIN_NOT_CONFIGURED",
            },
            { status: 503 }
        );
    }
    return null;
}
