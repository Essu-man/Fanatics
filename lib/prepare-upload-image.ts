/** MIME types Supabase Storage accepts on the product-images bucket */
const STORAGE_READY_MIME = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

export type PreparedImageUpload = {
    data: Buffer;
    contentType: string;
    fileName: string;
};

function safeBaseName(fileName: string): string {
    const withoutExt = fileName.replace(/\.[^.]+$/, "").trim();
    const cleaned = withoutExt.replace(/[^a-zA-Z0-9._-]/g, "_");
    return cleaned || "image";
}

/**
 * Normalize images for Supabase upload (converts AVIF, HEIC, etc. to JPEG).
 */
export async function prepareImageBufferForStorage(file: File): Promise<PreparedImageUpload> {
    const bytes = Buffer.from(await file.arrayBuffer());
    const base = safeBaseName(file.name);

    if (STORAGE_READY_MIME.has(file.type)) {
        const ext =
            file.name.split(".").pop()?.toLowerCase() ||
            (file.type === "image/png"
                ? "png"
                : file.type === "image/webp"
                  ? "webp"
                  : file.type === "image/gif"
                    ? "gif"
                    : "jpg");
        return {
            data: bytes,
            contentType: file.type,
            fileName: `${base}.${ext}`,
        };
    }

    try {
        const sharp = (await import("sharp")).default;
        const converted = await sharp(bytes, { failOn: "none" })
            .rotate()
            .jpeg({ quality: 88, mozjpeg: true })
            .toBuffer();
        return {
            data: converted,
            contentType: "image/jpeg",
            fileName: `${base}.jpg`,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Could not process image";
        throw new Error(
            `${message}. Try uploading JPEG, PNG, or WebP, or re-export the photo from your gallery.`
        );
    }
}

/** Build storage path, preserving folder + timestamp prefix from caller when present */
export function buildStoragePath(folderPath: string, preparedFileName: string): string {
    const slash = folderPath.lastIndexOf("/");
    const dir = slash >= 0 ? folderPath.slice(0, slash + 1) : "";
    const base = slash >= 0 ? folderPath.slice(slash + 1) : folderPath;
    const prefix = base.match(/^(\d+-)/)?.[1] ?? `${Date.now()}-`;
    return `${dir}${prefix}${preparedFileName}`;
}
