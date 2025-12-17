import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { existsSync, readFileSync } from 'fs';

// Helper to get service account
function getServiceAccount(): ServiceAccount {
    // 1. Try environment variable (JSON string)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        try {
            return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        } catch (e) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON');
        }
    }

    // 2. Try local file (Legacy/Dev path)
    const localPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'C:/Keys/cediman.json';
    if (existsSync(localPath)) {
        try {
            return JSON.parse(readFileSync(localPath, 'utf-8'));
        } catch (e) {
            console.error(`Failed to read service account from ${localPath}`);
        }
    }

    throw new Error('Firebase Service Account not found. Set FIREBASE_SERVICE_ACCOUNT_JSON or ensure file exists.');
}


let app: any = null;

function getAdminApp() {
    if (app) return app;
    if (getApps().length > 0) {
        app = getApps()[0];
        return app;
    }

    const serviceAccount = getServiceAccount();

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
    // Add other methods as needed
};
