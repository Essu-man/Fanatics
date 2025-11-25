

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { existsSync, readFileSync } from 'fs';

// Default values
const DEFAULT_EMAIL = 'admin@cediman.com';
const DEFAULT_PASSWORD = 'Admin123!';

// Get command line arguments
const args = process.argv.slice(2);
let email = DEFAULT_EMAIL;
let password = DEFAULT_PASSWORD;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
        email = args[i + 1];
        i++;
    } else if (args[i] === '--password' && args[i + 1]) {
        password = args[i + 1];
        i++;
    }
}

async function resetPassword() {
    try {
        console.log('🔐 Reset Admin Password Script\n');
        console.log('Email:', email);
        console.log('New Password:', '*'.repeat(password.length));
        console.log('');

        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        if (!projectId) {
            console.error('❌ Error: NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set');
            process.exit(1);
        }

        // Load service account
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'C:/Keys/cediman.json';
        let serviceAccount: any = null;

        if (existsSync(serviceAccountPath)) {
            try {
                const serviceAccountFile = readFileSync(serviceAccountPath, 'utf-8');
                serviceAccount = JSON.parse(serviceAccountFile);
            } catch (error: any) {
                console.error('❌ Could not load service account:', error.message);
                process.exit(1);
            }
        } else {
            console.error(`❌ Service account file not found at: ${serviceAccountPath}`);
            process.exit(1);
        }

        // Initialize Firebase Admin
        const app = getApps().length === 0
            ? initializeApp({
                credential: cert(serviceAccount),
                projectId: serviceAccount.project_id || projectId,
            })
            : getApps()[0];

        const auth = getAuth(app);

        // Get user by email
        console.log('📧 Looking up user...');
        const user = await auth.getUserByEmail(email);
        console.log('✅ User found:', user.uid);

        // Update password
        console.log('🔑 Updating password...');
        await auth.updateUser(user.uid, {
            password: password,
        });

        console.log('\n✅ SUCCESS! Password updated');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:', email);
        console.log('New Password:', password);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🔗 You can now login at: http://localhost:3000/login\n');

    } catch (error: any) {
        console.error('\n❌ Error resetting password:');
        console.error('   Message:', error.message);
        console.error('   Code:', error.code || 'N/A');

        if (error.code === 'auth/user-not-found') {
            console.error('\n💡 User not found. Make sure the email is correct.');
        } else if (error.code === 'auth/invalid-password') {
            console.error('\n💡 Password is too weak. Use a stronger password (at least 6 characters).');
        }

        process.exit(1);
    }
}

resetPassword();

