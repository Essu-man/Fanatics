#!/usr/bin/env node

/**
 * Firebase Admin User Creation Script
 * 
 * This script creates an admin user in Firebase Auth and Firestore
 * 
 * Prerequisites:
 *   1. Install firebase-admin: npm install firebase-admin
 *   2. Set up Firebase Admin SDK credentials (see CREATE_FIREBASE_ADMIN.md)
 * 
 * Usage:
 *   npx tsx scripts/create-firebase-admin.ts
 * 
 * Or with custom email/password:
 *   npx tsx scripts/create-firebase-admin.ts --email admin@example.com --password Admin123!
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
function loadEnvFile() {
    const envPath = join(process.cwd(), '.env.local');

    if (!existsSync(envPath)) {
        console.warn('⚠️  .env.local file not found');
        return;
    }

    try {
        const envFile = readFileSync(envPath, 'utf-8');
        const envVars: Record<string, string> = {};

        envFile.split('\n').forEach((line) => {
            const trimmed = line.trim();
            // Skip comments and empty lines
            if (trimmed && !trimmed.startsWith('#')) {
                const match = trimmed.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    let value = match[2].trim();

                    // Remove quotes if present
                    if ((value.startsWith('"') && value.endsWith('"')) ||
                        (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.slice(1, -1);
                    }

                    envVars[key] = value;
                    // Also set in process.env
                    process.env[key] = value;
                }
            }
        });

        return envVars;
    } catch (error) {
        console.warn('⚠️  Could not read .env.local file:', error);
    }
}

// Load environment variables
loadEnvFile();

// Default admin credentials
const DEFAULT_EMAIL = 'admin@cediman.com';
const DEFAULT_PASSWORD = 'Admin123!';
const DEFAULT_FIRST_NAME = 'Admin';
const DEFAULT_LAST_NAME = 'User';

// Get command line arguments
const args = process.argv.slice(2);
let email = DEFAULT_EMAIL;
let password = DEFAULT_PASSWORD;
let firstName = DEFAULT_FIRST_NAME;
let lastName = DEFAULT_LAST_NAME;

// Parse arguments
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
        email = args[i + 1];
        i++;
    } else if (args[i] === '--password' && args[i + 1]) {
        password = args[i + 1];
        i++;
    } else if (args[i] === '--firstName' && args[i + 1]) {
        firstName = args[i + 1];
        i++;
    } else if (args[i] === '--lastName' && args[i + 1]) {
        lastName = args[i + 1];
        i++;
    }
}

async function createAdminUser() {
    try {
        console.log('🔥 Firebase Admin User Creation Script\n');
        console.log('Email:', email);
        console.log('Password:', '*'.repeat(password.length));
        console.log('Name:', `${firstName} ${lastName}\n`);

        // Check for Firebase Admin SDK credentials
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'C:/Keys/cediman.json';
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

        if (!projectId) {
            console.error('❌ Error: NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set in .env.local');
            console.error('   Please add your Firebase project ID to .env.local');
            process.exit(1);
        }

        // Initialize Firebase Admin SDK
        let app;
        let serviceAccount: any = null;

        // Try to load service account from file path first
        if (existsSync(serviceAccountPath)) {
            try {
                console.log(`📁 Loading service account from: ${serviceAccountPath}`);
                const serviceAccountFile = readFileSync(serviceAccountPath, 'utf-8');
                serviceAccount = JSON.parse(serviceAccountFile);
                console.log('✅ Service account key loaded from file');
            } catch (error: any) {
                console.warn(`⚠️  Could not load service account from ${serviceAccountPath}:`, error.message);
            }
        }

        // If not loaded from file, try environment variable
        if (!serviceAccount && serviceAccountKey) {
            try {
                serviceAccount = JSON.parse(serviceAccountKey);
                console.log('✅ Service account key loaded from environment variable');
            } catch (error: any) {
                console.warn('⚠️  Could not parse FIREBASE_SERVICE_ACCOUNT_KEY:', error.message);
            }
        }

        // Initialize Firebase with service account if available
        if (serviceAccount) {
            app = getApps().length === 0
                ? initializeApp({
                    credential: cert(serviceAccount),
                    projectId: serviceAccount.project_id || projectId,
                })
                : getApps()[0];
            console.log('✅ Firebase Admin SDK initialized with service account');
        } else {
            // Use default credentials (requires GOOGLE_APPLICATION_CREDENTIALS or gcloud auth)
            console.warn('⚠️  Service account key not found. Trying default credentials...');
            console.warn('   Looking for:');
            console.warn(`   1. File: ${serviceAccountPath}`);
            console.warn('   2. Environment variable: FIREBASE_SERVICE_ACCOUNT_KEY');
            console.warn('   3. GOOGLE_APPLICATION_CREDENTIALS environment variable');
            console.warn('   4. gcloud auth (run: gcloud auth application-default login)');

            try {
                app = getApps().length === 0
                    ? initializeApp({ projectId })
                    : getApps()[0];
            } catch (error: any) {
                console.error('\n❌ Could not initialize Firebase Admin SDK');
                console.error('   Please provide a service account key file or set up authentication');
                console.error(`   Expected file location: ${serviceAccountPath}`);
                throw error;
            }
        }

        const auth = getAuth(app);
        const db = getFirestore(app);

        // Check if user already exists
        let user;
        try {
            user = await auth.getUserByEmail(email);
            console.log('✅ User already exists in Firebase Auth');
            console.log('   Updating password and profile...');

            // Update password for existing user
            await auth.updateUser(user.uid, {
                password: password,
                displayName: `${firstName} ${lastName}`,
                emailVerified: true,
            });
            console.log('✅ Password updated successfully');
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                // Create new user
                console.log('📝 Creating new Firebase Auth user...');
                user = await auth.createUser({
                    email,
                    password,
                    displayName: `${firstName} ${lastName}`,
                    emailVerified: true, // Auto-verify for admin
                });
                console.log('✅ Firebase Auth user created successfully');
            } else {
                throw error;
            }
        }

        // Create or update user profile in Firestore
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            console.log('📝 Updating existing Firestore profile...');
            await userRef.update({
                email,
                firstName,
                lastName,
                role: 'admin',
                emailVerified: true,
            });
            console.log('✅ Firestore profile updated to admin');
        } else {
            console.log('📝 Creating Firestore profile...');
            await userRef.set({
                uid: user.uid,
                email,
                firstName,
                lastName,
                role: 'admin',
                phone: null,
                emailVerified: true,
                createdAt: new Date(),
            });
            console.log('✅ Firestore profile created with admin role');
        }

        console.log('\n✅ SUCCESS! Admin user created/updated:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('User ID:', user.uid);
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Role: admin');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🔗 You can now login at: http://localhost:3000/login');
        console.log('⚠️  Please change the password after first login!\n');

    } catch (error: any) {
        console.error('\n❌ Error creating admin user:');
        console.error('   Message:', error.message);
        console.error('   Code:', error.code || 'N/A');

        if (error.code === 'auth/email-already-exists') {
            console.error('\n💡 User already exists. The script will update the profile to admin.');
        } else if (error.code === 'auth/invalid-email') {
            console.error('\n💡 Invalid email format. Please check your email address.');
        } else if (error.code === 'auth/weak-password') {
            console.error('\n💡 Password is too weak. Use a stronger password.');
        } else if (error.message?.includes('permission-denied') || error.message?.includes('PERMISSION_DENIED')) {
            console.error('\n💡 Permission denied. Make sure:');
            console.error('   1. FIREBASE_SERVICE_ACCOUNT_KEY is set correctly in .env.local, OR');
            console.error('   2. You are authenticated with gcloud (run: gcloud auth application-default login)');
            console.error('\n📖 See CREATE_FIREBASE_ADMIN.md for detailed setup instructions');
        } else if (error.code === 'app/no-app') {
            console.error('\n💡 Firebase Admin SDK not initialized. Check your credentials.');
        }

        process.exit(1);
    }
}

// Run the script
createAdminUser();
