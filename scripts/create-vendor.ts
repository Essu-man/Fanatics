#!/usr/bin/env node
/**
 * Create a vendor document and optionally link a Firebase Auth user profile (role vendor + vendorId).
 *
 * Prerequisites: FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH (same as other scripts).
 *
 * Usage:
 *   npx tsx scripts/create-vendor.ts --slug my-shop --name "My Shop" --ownerUid <FIREBASE_UID> --status active
 */

import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

function loadEnvFile() {
    const envPath = join(process.cwd(), ".env.local");
    if (!existsSync(envPath)) return;
    try {
        const envFile = readFileSync(envPath, "utf-8");
        envFile.split("\n").forEach((line) => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#")) {
                const match = trimmed.match(/^([^=]+)=(.*)$/);
                if (match) {
                    let value = match[2].trim();
                    if (
                        (value.startsWith('"') && value.endsWith('"')) ||
                        (value.startsWith("'") && value.endsWith("'"))
                    ) {
                        value = value.slice(1, -1);
                    }
                    process.env[match[1].trim()] = value;
                }
            }
        });
    } catch {
        /* ignore */
    }
}

loadEnvFile();

function getServiceAccount(): ServiceAccount {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    }
    const localPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "C:/Keys/cediman.json";
    if (existsSync(localPath)) {
        return JSON.parse(readFileSync(localPath, "utf-8"));
    }
    throw new Error("Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH");
}

function getAdminApp() {
    if (getApps().length > 0) return getApps()[0];
    const sa = getServiceAccount();
    return initializeApp({
        credential: cert(sa),
        projectId: sa.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
}

function parseArgs() {
    const args = process.argv.slice(2);
    const out: Record<string, string> = {};
    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a.startsWith("--")) {
            const key = a.slice(2);
            const val = args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : "true";
            out[key] = val;
        }
    }
    return out;
}

async function main() {
    const args = parseArgs();
    const slug = (args.slug || "").trim().toLowerCase().replace(/\s+/g, "-");
    const businessName = (args.name || "").trim();
    const ownerUid = (args.ownerUid || args.ownerUserId || "").trim();
    const status = (args.status || "pending") as "pending" | "active" | "suspended";
    const description = (args.description || "").trim();
    const linkProfile = args.linkProfile !== "false";

    if (!slug || !businessName || !ownerUid) {
        console.error("Usage: npx tsx scripts/create-vendor.ts --slug my-shop --name \"My Shop\" --ownerUid <UID> [--status active] [--description \"...\"] [--linkProfile false]");
        process.exit(1);
    }

    const app = getAdminApp();
    const db = getFirestore(app);

    const col = db.collection("vendors");
    const dup = await col.where("slug", "==", slug).limit(1).get();
    if (!dup.empty) {
        console.error("Slug already exists:", slug);
        process.exit(1);
    }

    const ref = col.doc();
    const now = new Date();
    await ref.set({
        slug,
        businessName,
        ownerUserId: ownerUid,
        status: ["pending", "active", "suspended"].includes(status) ? status : "pending",
        ...(description ? { description } : {}),
        createdAt: now,
        updatedAt: now,
    });

    console.log("Created vendor", ref.id, slug);

    if (linkProfile) {
        await db.collection("users").doc(ownerUid).set(
            {
                role: "vendor",
                vendorId: ref.id,
                updatedAt: now,
            },
            { merge: true }
        );
        console.log("Linked users/", ownerUid, "→ role vendor, vendorId", ref.id);
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
