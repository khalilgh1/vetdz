import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { v2 as cloudinary } from "cloudinary";

type CloudinaryUploadResult = {
    url: string;
    publicId: string;
};

let isConfigured = false;

function getCloudinaryConfig() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        return null;
    }

    return {
        cloudName,
        apiKey,
        apiSecret,
    };
}

function ensureCloudinaryConfigured() {
    const config = getCloudinaryConfig();

    if (!config) {
        throw new Error("CLOUDINARY_NOT_CONFIGURED");
    }

    if (!isConfigured) {
        cloudinary.config({
            cloud_name: config.cloudName,
            api_key: config.apiKey,
            api_secret: config.apiSecret,
            secure: true,
        });

        isConfigured = true;
    }

    return config;
}

function normalizeFilename(filename: string) {
    const base = filename.replace(extname(filename), "");

    const normalized = base
        .trim()
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    return normalized || "image";
}

const versionSegmentRegex = /^v\d+$/;

export function extractCloudinaryPublicIdFromUrl(url: string) {
    try {
        const parsed = new URL(url);

        if (!parsed.hostname.endsWith("res.cloudinary.com")) {
            return null;
        }

        const parts = parsed.pathname.split("/").filter(Boolean);
        const uploadIndex = parts.indexOf("upload");

        if (uploadIndex === -1) {
            return null;
        }

        const afterUpload = parts.slice(uploadIndex + 1);

        if (afterUpload.length === 0) {
            return null;
        }

        const versionIndex = afterUpload.findIndex((segment) => versionSegmentRegex.test(segment));
        const publicIdParts = versionIndex === -1 ? afterUpload : afterUpload.slice(versionIndex + 1);

        if (publicIdParts.length === 0) {
            return null;
        }

        const full = decodeURIComponent(publicIdParts.join("/"));

        return full.replace(/\.[^/.]+$/, "");
    } catch {
        return null;
    }
}

export async function uploadProductImageBuffer(buffer: Buffer, filename: string): Promise<CloudinaryUploadResult> {
    ensureCloudinaryConfigured();

    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "vetdz/products";
    const slug = normalizeFilename(filename);
    const publicId = `${slug}-${Date.now()}-${randomUUID().slice(0, 8)}`;

    try {
        const result = await new Promise<{ secure_url?: string; public_id?: string }>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    public_id: publicId,
                    resource_type: "image",
                    overwrite: false,
                },
                (error, uploadResult) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(uploadResult || {});
                }
            );

            stream.end(buffer);
        });

        if (!result.secure_url || !result.public_id) {
            throw new Error("CLOUDINARY_UPLOAD_FAILED");
        }

        return {
            url: result.secure_url,
            publicId: result.public_id,
        };
    } catch {
        throw new Error("CLOUDINARY_UPLOAD_FAILED");
    }
}

export async function deleteCloudinaryImagesByUrls(urls: string[]) {
    const publicIds = Array.from(
        new Set(
            urls
                .map((url) => extractCloudinaryPublicIdFromUrl(url))
                .filter((value): value is string => Boolean(value))
        )
    );

    if (publicIds.length === 0) {
        return { deletedCount: 0, skipped: true as const };
    }

    ensureCloudinaryConfigured();

    const results = await Promise.allSettled(
        publicIds.map((publicId) =>
            cloudinary.uploader.destroy(publicId, {
                resource_type: "image",
                invalidate: true,
            })
        )
    );

    const hasFailures = results.some((result) => result.status === "rejected");

    if (hasFailures) {
        throw new Error("CLOUDINARY_DELETE_FAILED");
    }

    return { deletedCount: publicIds.length, skipped: false as const };
}
