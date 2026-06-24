import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
const envPath = join(process.cwd(), '.env.local');
if (existsSync(envPath)) {
    const envFile = readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const match = trimmed.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                process.env[key] = value;
            }
        }
    });
}

// Find service account file
const saPath = join(process.cwd(), 'firebase-service-account.json');
if (!existsSync(saPath)) {
    console.error('Service account file not found!');
    process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(saPath, 'utf-8'));
initializeApp({
    credential: cert(serviceAccount),
});

const auth = getAuth();

async function run() {
    const uid = 'BbXJaQUisEZBz4UyJ60xDfOOuKj2';
    console.log("Resetting password for UID:", uid);
    await auth.updateUser(uid, {
        password: 'Password123!',
    });
    console.log("Password updated successfully to 'Password123!'");
}

run().catch(console.error);
