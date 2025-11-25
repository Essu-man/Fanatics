#!/usr/bin/env node

/**
 * Check Admin User Script
 * 
 * This script checks if the admin user exists in Firebase Auth and Firestore
 * 
 * Usage:
 *   npx tsx scripts/check-admin-user.ts
 *   npx tsx scripts/check-admin-user.ts --email admin@cediman.com
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { existsSync, readFileSync } from 'fs';
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
const loadedEnv = loadEnvFile();
if (loadedEnv) {
    console.log('📝 Loaded environment variables from .env.local');
    if (loadedEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        console.log('   ✅ Found NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    } else {
        console.log('   ⚠️  NEXT_PUBLIC_FIREBASE_PROJECT_ID not found in file');
    }
    console.log('');
}

// Default email
const DEFAULT_EMAIL = 'admin@cediman.com';

// Get command line arguments
const args = process.argv.slice(2);
let email = DEFAULT_EMAIL;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
        email = args[i + 1];
        i++;
    }
}

async function checkAdminUser() {
    try {
        console.log('🔍 Checking Admin User\n');
        console.log('Email:', email);
        console.log('');

        // Try multiple ways to get project ID
        let projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

        // Debug: Show what we found
        console.log('🔍 Debugging environment variables:');
        console.log('   process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID:', projectId || 'NOT SET');
        console.log('   process.env keys containing FIREBASE:', Object.keys(process.env).filter(k => k.includes('FIREBASE')));
        console.log('');

        if (!projectId) {
            console.error('❌ Error: NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set');
            console.error('   Please check your .env.local file');
            console.error('   Make sure the line looks like:');
            console.error('   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id');
            console.error('   (No spaces around the = sign)');
            process.exit(1);
        }

        console.log('📋 Project ID:', projectId);
        console.log('');

        // Load service account
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'C:/Keys/cediman.json';
        let serviceAccount: any = null;

        if (existsSync(serviceAccountPath)) {
            try {
                const serviceAccountFile = readFileSync(serviceAccountPath, 'utf-8');
                serviceAccount = JSON.parse(serviceAccountFile);
                console.log('✅ Service account loaded from:', serviceAccountPath);
                console.log('   Project ID in service account:', serviceAccount.project_id);
                console.log('');
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
        const db = getFirestore(app);

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('1. Checking Firebase Authentication...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Check Firebase Auth
        try {
            const user = await auth.getUserByEmail(email);
            console.log('✅ User found in Firebase Auth:');
            console.log('   User ID:', user.uid);
            console.log('   Email:', user.email);
            console.log('   Display Name:', user.displayName || 'N/A');
            console.log('   Email Verified:', user.emailVerified);
            console.log('   Created:', user.metadata.creationTime);
            console.log('   Last Sign In:', user.metadata.lastSignInTime || 'Never');
            console.log('');

            // Check Firestore
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('2. Checking Firestore Database...');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

            const userRef = db.collection('users').doc(user.uid);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                console.log('✅ User profile found in Firestore:');
                console.log('   Document ID:', userDoc.id);
                console.log('   Email:', userData?.email);
                console.log('   First Name:', userData?.firstName);
                console.log('   Last Name:', userData?.lastName);
                console.log('   Role:', userData?.role || '❌ NOT SET');
                console.log('   Email Verified:', userData?.emailVerified);
                console.log('   Created At:', userData?.createdAt?.toDate?.() || userData?.createdAt || 'N/A');
                console.log('');

                if (userData?.role !== 'admin') {
                    console.log('⚠️  WARNING: User role is not "admin"!');
                    console.log('   Current role:', userData?.role);
                    console.log('   Run the create-firebase-admin script to fix this.\n');
                } else {
                    console.log('✅ User has admin role!\n');
                }
            } else {
                console.log('❌ User profile NOT found in Firestore');
                console.log('   Document path: users/' + user.uid);
                console.log('   Run the create-firebase-admin script to create the profile.\n');
            }

            // Summary
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📊 Summary:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('Firebase Auth: ✅ User exists');
            console.log('Firestore Profile:', userDoc.exists ? '✅ Exists' : '❌ Missing');
            console.log('Admin Role:', userDoc.exists && userDoc.data()?.role === 'admin' ? '✅ Set' : '❌ Not set');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                console.log('❌ User NOT found in Firebase Auth');
                console.log('   Email:', email);
                console.log('   Run the create-firebase-admin script to create the user.\n');
            } else {
                throw error;
            }
        }

    } catch (error: any) {
        console.error('\n❌ Error checking admin user:');
        console.error('   Message:', error.message);
        console.error('   Code:', error.code || 'N/A');
        process.exit(1);
    }
}

checkAdminUser();

