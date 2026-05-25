import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import {
    FirebaseAdminConfigError,
    getFirebaseServiceAccount,
    isFirebaseAdminConfigError,
} from "@/lib/get-firebase-service-account";

let app: App | null = null;

function getAdminApp(): App {
    if (app) return app;
    if (getApps().length > 0) {
        app = getApps()[0]!;
        return app;
    }

    const serviceAccount = getFirebaseServiceAccount();

    app = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    return app;
}

export const adminAuth = {
    get generatePasswordResetLink() {
        return getAuth(getAdminApp()).generatePasswordResetLink.bind(getAuth(getAdminApp()));
    },
    get getUserByEmail() {
        return getAuth(getAdminApp()).getUserByEmail.bind(getAuth(getAdminApp()));
    },
};

export async function verifyFirebaseIdToken(idToken: string): Promise<DecodedIdToken> {
    try {
        const auth = getAuth(getAdminApp());
        return auth.verifyIdToken(idToken);
    } catch (error) {
        if (isFirebaseAdminConfigError(error)) throw error;
        throw error;
    }
}

export function getFirebaseAdminApp() {
    return getAdminApp();
}

export { FirebaseAdminConfigError, isFirebaseAdminConfigError };
