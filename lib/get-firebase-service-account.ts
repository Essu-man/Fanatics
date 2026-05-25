import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { ServiceAccount } from "firebase-admin/app";

export class FirebaseAdminConfigError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "FirebaseAdminConfigError";
    }
}

type ServiceAccountJson = {
    project_id?: string;
    client_email?: string;
    private_key?: string;
    projectId?: string;
    clientEmail?: string;
    privateKey?: string;
};

function parseJsonServiceAccount(raw: string, source: string): ServiceAccount {
    try {
        const parsed = JSON.parse(raw) as ServiceAccountJson;
        const clientEmail = parsed.client_email ?? parsed.clientEmail;
        const privateKey = parsed.private_key ?? parsed.privateKey;
        const projectId = parsed.project_id ?? parsed.projectId;
        if (!clientEmail || !privateKey) {
            throw new Error("missing client_email or private_key");
        }
        return {
            projectId,
            clientEmail,
            privateKey,
        } as ServiceAccount;
    } catch {
        throw new FirebaseAdminConfigError(`Invalid service account JSON (${source})`);
    }
}

function fromDiscreteEnvVars(): ServiceAccount | null {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
    const projectId =
        process.env.FIREBASE_PROJECT_ID?.trim() ||
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();

    if (!clientEmail || !privateKey) return null;

    return {
        projectId,
        clientEmail,
        privateKey,
    } as ServiceAccount;
}

const CANDIDATE_FILES = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    join(process.cwd(), "firebase-service-account.json"),
    join(process.cwd(), "serviceAccount.json"),
    join(process.cwd(), "keys", "firebase-service-account.json"),
    join(process.cwd(), "keys", "cediman.json"),
    "C:/Keys/cediman.json",
];

export function getFirebaseServiceAccount(): ServiceAccount {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
        return parseJsonServiceAccount(
            process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
            "FIREBASE_SERVICE_ACCOUNT_JSON"
        );
    }

    const discrete = fromDiscreteEnvVars();
    if (discrete) return discrete;

    for (const candidate of CANDIDATE_FILES) {
        if (!candidate) continue;
        const resolved = candidate.startsWith("/") || /^[A-Za-z]:/.test(candidate)
            ? candidate
            : join(process.cwd(), candidate);
        if (!existsSync(resolved)) continue;
        try {
            return parseJsonServiceAccount(readFileSync(resolved, "utf-8"), resolved);
        } catch (e) {
            if (e instanceof FirebaseAdminConfigError) throw e;
            console.error(`Failed to read service account from ${resolved}`);
        }
    }

    throw new FirebaseAdminConfigError(
        "Firebase Admin is not configured. Add one of: " +
            "FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY, " +
            "FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json (file from Firebase Console), " +
            "or place firebase-service-account.json in the project root."
    );
}

export function isFirebaseAdminConfigError(error: unknown): boolean {
    return (
        error instanceof FirebaseAdminConfigError ||
        (error instanceof Error &&
            (error.message.includes("Service Account") ||
                error.message.includes("Firebase Admin is not configured")))
    );
}
