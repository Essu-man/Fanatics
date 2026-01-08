// Firestore admin instance for Node.js scripts
const { initializeApp, applicationDefault, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { existsSync, readFileSync } = require('fs');

function getServiceAccount() {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        try {
            return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        } catch (e) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON');
        }
    }
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

let app = null;
function getAdminApp() {
    if (app) return app;
    if (getApps().length > 0) {
        app = getApps()[0];
        return app;
    }
    const serviceAccount = getServiceAccount();
    app = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    return app;
}

function getAdminFirestore() {
    return getFirestore(getAdminApp());
}

module.exports = { getAdminFirestore };
