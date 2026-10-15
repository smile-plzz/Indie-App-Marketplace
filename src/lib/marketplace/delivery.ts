import crypto from "node:crypto";
import { S3Client, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { downloadSecret } from "./security";
import fs from "node:fs";
import path from "node:path";
export function localReleasePath(fileKey: string): string {
    const root = path.resolve(process.env.STORAGE_LOCAL_DIR || "./storage/releases");
    const resolved = path.resolve(root, fileKey.replace(/^releases\//, ""));
    const relative = path.relative(root, resolved);
    if (relative.startsWith("..") || path.isAbsolute(relative))
        throw new Error("Invalid release file path");
    const realRoot = fs.realpathSync(root);
    const realFile = fs.realpathSync(resolved);
    const realRelative = path.relative(realRoot, realFile);
    if (realRelative.startsWith("..") || path.isAbsolute(realRelative))
        throw new Error("Invalid release file path");
    return realFile;
}
import { getDownloadByTokenHash, getOrderById, incrementDownloadCount, createDownload, getDownloadByOrderId, } from "./db";
import { getReleaseForProduct } from "./catalog";
import type { Download, Order } from "./types";
export interface StorageAdapter {
    getSignedDownloadUrl(fileKey: string, expiresInSeconds: number): Promise<string>;
}
export class LocalStorageAdapter implements StorageAdapter {
    async getSignedDownloadUrl(fileKey: string, expiresInSeconds: number): Promise<string> {
        const secret = downloadSecret();
        const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
        const dataToSign = `${fileKey}:${expiresAt}`;
        const signature = crypto.createHmac("sha256", secret).update(dataToSign).digest("hex");
        return `/api/download/stream?key=${encodeURIComponent(fileKey)}&expires=${expiresAt}&sig=${signature}`;
    }
}
export class CloudflareR2Adapter implements StorageAdapter {
    private bucket: string;
    private endpoint: string;
    constructor() {
        this.bucket = process.env.STORAGE_BUCKET || "";
        this.endpoint = process.env.STORAGE_ENDPOINT || "";
    }
    async getSignedDownloadUrl(fileKey: string, expiresInSeconds: number): Promise<string> {
        if (!this.bucket || !this.endpoint || !process.env.STORAGE_ACCESS_KEY_ID || !process.env.STORAGE_SECRET_ACCESS_KEY) {
            throw new Error("Private storage is not configured");
        }
        const client = new S3Client({
            region: process.env.STORAGE_REGION || "auto", endpoint: this.endpoint, forcePathStyle: true,
            credentials: { accessKeyId: process.env.STORAGE_ACCESS_KEY_ID, secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY },
        });
        await client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: fileKey }));
        return getSignedUrl(client, new GetObjectCommand({ Bucket: this.bucket, Key: fileKey }), { expiresIn: expiresInSeconds });
    }
}
export function getStorageAdapter(): StorageAdapter {
    const provider = process.env.STORAGE_PROVIDER || "local";
    if (provider === "r2" || provider === "s3") {
        return new CloudflareR2Adapter();
    }
    return new LocalStorageAdapter();
}
/**
 * Download Tokens
 */
export function hashDownloadToken(plaintextToken: string): string {
    return crypto.createHash("sha256").update(plaintextToken).digest("hex");
}
export function generateDownloadToken(): {
    plaintextToken: string;
    tokenHash: string;
} {
    const plaintextToken = crypto.randomBytes(24).toString("hex");
    const tokenHash = hashDownloadToken(plaintextToken);
    return { plaintextToken, tokenHash };
}
export async function createOrderDownloadRecord(orderId: string, validityDays = 30, maxDownloads?: number): Promise<{
    download: Download;
    plaintextToken: string;
}> {
    const { plaintextToken, tokenHash } = generateDownloadToken();
    const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();
    const id = `dl_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const download = await createDownload({
        id,
        orderId,
        tokenHash,
        expiresAt,
        maxDownloads: maxDownloads ?? (await getDownloadByOrderId(orderId))?.maxDownloads ?? 5,
    });
    return { download, plaintextToken };
}
export interface VerificationResult {
    valid: boolean;
    error?: string;
    order?: Order;
    download?: Download;
    signedUrl?: string;
    fileName?: string;
    checksum?: string;
}
export async function verifyAndConsumeDownload(plaintextToken: string): Promise<VerificationResult> {
    const tokenHash = hashDownloadToken(plaintextToken);
    const download = await getDownloadByTokenHash(tokenHash);
    if (!download) {
        return { valid: false, error: "Invalid download link. The link does not exist." };
    }
    const order = await getOrderById(download.orderId);
    if (!order) {
        return { valid: false, error: "Associated order not found." };
    }
    if (order.status !== "paid") {
        if (order.status === "refunded") {
            return { valid: false, error: "This order has been refunded. Download access is revoked." };
        }
        return { valid: false, error: `Order is not paid (current status: ${order.status}).` };
    }
    const now = new Date();
    const expiresAt = new Date(download.expiresAt);
    if (now > expiresAt) {
        return {
            valid: false,
            error: "This download link has expired. Please request a new link via your order lookup page.",
        };
    }
    if (download.downloadCount >= download.maxDownloads) {
        return {
            valid: false,
            error: `Download limit reached (${download.maxDownloads} downloads used). If you need more downloads, contact support.`,
        };
    }
    const product = await getReleaseForProduct(order.productId, order.releaseVersion);
    if (!product?.installerFileKey)
        return { valid: false, error: "Release is unavailable. Contact support." };
    const fileKey = product.installerFileKey;
    const checksum = product.sha256Checksum;
    const fileName = fileKey.split("/").pop() || "download";
    if ((process.env.STORAGE_PROVIDER || "local") === "local") {
        try {
            localReleasePath(fileKey);
        }
        catch {
            return { valid: false, error: "Release file is unavailable. Contact support." };
        }
    }
    const signedUrl = await getStorageAdapter().getSignedDownloadUrl(fileKey, 120);
    // Claim after asynchronous work using a conditional write, so concurrent requests cannot exceed the quota.
    if (!await incrementDownloadCount(download.id))
        return { valid: false, error: "Download limit reached or access expired." };
    return {
        valid: true,
        order,
        download,
        signedUrl,
        fileName,
        checksum,
    };
}
/**
 * Magic Link Token for Order History Access
 */
export function generateMagicLinkToken(email: string, validityMinutes = 60): string {
    const secret = downloadSecret();
    const expiresAt = Date.now() + validityMinutes * 60 * 1000;
    const payload = `${email.toLowerCase().trim()}|${expiresAt}`;
    const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    return Buffer.from(`${payload}|${signature}`).toString("base64url");
}
export function verifyMagicLinkToken(token: string): {
    valid: boolean;
    email?: string;
    error?: string;
} {
    try {
        const decoded = Buffer.from(token, "base64url").toString("utf-8");
        const parts = decoded.split("|");
        if (parts.length !== 3) {
            return { valid: false, error: "Malformed access token" };
        }
        const [email, expiresStr, signature] = parts;
        const expiresAt = parseInt(expiresStr, 10);
        if (isNaN(expiresAt) || Date.now() > expiresAt) {
            return { valid: false, error: "Access token has expired. Please request a new link." };
        }
        const secret = downloadSecret();
        const payload = `${email}|${expiresStr}`;
        const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
            return { valid: false, error: "Invalid token signature" };
        }
        return { valid: true, email };
    }
    catch {
        return { valid: false, error: "Failed to verify access token" };
    }
}
