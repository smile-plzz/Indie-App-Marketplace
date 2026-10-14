import crypto from "node:crypto";
import {
  getDownloadByTokenHash,
  getOrderById,
  incrementDownloadCount,
  createDownload,
} from "./db";
import { getProductBySlug } from "./catalog";
import type { Download, Order } from "./types";

export interface StorageAdapter {
  getSignedDownloadUrl(fileKey: string, expiresInSeconds: number): Promise<string>;
}

export class LocalStorageAdapter implements StorageAdapter {
  async getSignedDownloadUrl(fileKey: string, expiresInSeconds: number): Promise<string> {
    const secret = process.env.DOWNLOAD_SECRET || "default-local-secret-for-signing-urls";
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const dataToSign = `${fileKey}:${expiresAt}`;
    const signature = crypto.createHmac("sha256", secret).update(dataToSign).digest("hex");

    return `/api/download/stream?key=${encodeURIComponent(
      fileKey
    )}&expires=${expiresAt}&sig=${signature}`;
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
    // If not configured, fall back to local adapter
    if (!this.bucket || !this.endpoint) {
      return new LocalStorageAdapter().getSignedDownloadUrl(fileKey, expiresInSeconds);
    }

    // In full S3/R2 deployment, AWS S3 SDK or standard S3 presigned URL is generated here
    return `https://${this.bucket}.${this.endpoint}/${fileKey}?expires=${expiresInSeconds}`;
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

export function generateDownloadToken(): { plaintextToken: string; tokenHash: string } {
  const plaintextToken = crypto.randomBytes(24).toString("hex");
  const tokenHash = hashDownloadToken(plaintextToken);
  return { plaintextToken, tokenHash };
}

export function createOrderDownloadRecord(
  orderId: string,
  validityDays = 30,
  maxDownloads = 5
): { download: Download; plaintextToken: string } {
  const { plaintextToken, tokenHash } = generateDownloadToken();
  const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();

  const id = `dl_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const download = createDownload({
    id,
    orderId,
    tokenHash,
    expiresAt,
    maxDownloads,
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
  const download = getDownloadByTokenHash(tokenHash);

  if (!download) {
    return { valid: false, error: "Invalid download link. The link does not exist." };
  }

  const order = getOrderById(download.orderId);
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

  // Look up product to find file key and checksum
  const product = await getProductBySlug(order.productId);
  const fileKey = product?.installerFileKey || `releases/${order.productId}/${order.productName}.exe`;
  const checksum = product?.sha256Checksum || "";
  const fileName = fileKey.split("/").pop() || `${order.productName}.exe`;

  // Increment counter
  incrementDownloadCount(download.id);

  // Generate short-lived signed URL (e.g. 120 seconds)
  const storage = getStorageAdapter();
  const signedUrl = await storage.getSignedDownloadUrl(fileKey, 120);

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
  const secret = process.env.DOWNLOAD_SECRET || "default-secret-for-magic-links";
  const expiresAt = Date.now() + validityMinutes * 60 * 1000;
  const payload = `${email.toLowerCase().trim()}|${expiresAt}`;
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}|${signature}`).toString("base64url");
}

export function verifyMagicLinkToken(token: string): { valid: boolean; email?: string; error?: string } {
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

    const secret = process.env.DOWNLOAD_SECRET || "default-secret-for-magic-links";
    const payload = `${email}|${expiresStr}`;
    const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return { valid: false, error: "Invalid token signature" };
    }

    return { valid: true, email };
  } catch {
    return { valid: false, error: "Failed to verify access token" };
  }
}
