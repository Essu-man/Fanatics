// Admin Account Creation Script
// Run this script to create your admin account in Supabase
// 
// Usage: npx tsx scripts/create-admin.ts
// Or: node --loader tsx scripts/create-admin.ts

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env.local
function loadEnv() {
    try {
        const envPath = resolve(process.cwd(), '.env.local');
        const envFile = readFileSync(envPath, 'utf-8');
        const envVars: Record<string, string> = {};

        envFile.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    envVars[key.trim()] = valueParts.join('=').trim();
                }
            }
        });

        return envVars;
    } catch (error) {
        console.warn('Could not load .env.local, using process.env');
        return {};
    }
}

const env = loadEnv();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing environment variables!');
    console.error('Please ensure you have the following in your .env.local file:');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

// Use service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdminAccount() {
    // ⚠️ CONFIGURE THESE VALUES BEFORE RUNNING
    const adminEmail = 'admin@cediman.com';
    const adminPassword = 'Admin123!';
    const adminFirstName = 'Admin';
    const adminLastName = 'User';

    console.log('🚀 Creating admin account...\n');
    console.log('Configuration:');
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log(`  Name: ${adminFirstName} ${adminLastName}\n`);

    try {
        // Step 1: Create auth user
        console.log('Step 1: Creating authentication user...');
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true, // Auto-confirm email (no verification needed)
            user_metadata: {
                first_name: adminFirstName,
                last_name: adminLastName,
                role: 'admin'
            }
        });

        if (authError) {
            console.error('❌ Error creating auth user:', authError.message);
            if (authError.message.includes('already registered')) {
                console.error('   This email is already registered. Please use a different email or login with existing account.');
            }
            return;
        }

        if (!authData.user) {
            console.error('❌ Failed to create auth user: No user data returned');
            return;
        }

        console.log('✅ Auth user created successfully!');
        console.log(`   User ID: ${authData.user.id}\n`);

        // Step 2: Create user profile in users table
        console.log('Step 2: Creating user profile in database...');
        const { error: profileError } = await supabaseAdmin
            .from('users')
            .insert({
                id: authData.user.id,
                email: adminEmail,
                first_name: adminFirstName,
                last_name: adminLastName,
                role: 'admin',
                email_verified: true
            });

        if (profileError) {
            console.error('❌ Error creating user profile:', profileError.message);
            if (profileError.message.includes('duplicate') || profileError.code === '23505') {
                console.error('   User profile already exists. You can login with this account.');
            }
            return;
        }

        console.log('✅ User profile created successfully!\n');

        // Success message
        console.log('🎉 Admin account created successfully!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Login Credentials:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🔗 Next Steps:');
        console.log('   1. Go to http://localhost:3000/login');
        console.log('   2. Login with the credentials above');
        console.log('   3. You will be redirected to /admin dashboard\n');
        console.log('⚠️  IMPORTANT: Change your password after first login!');

    } catch (error: any) {
        console.error('❌ Unexpected error:', error.message);
        console.error(error);
    }
}

// Run the script
createAdminAccount()
    .then(() => {
        console.log('\n✨ Script completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
