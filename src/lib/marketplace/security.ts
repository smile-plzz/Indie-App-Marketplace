import crypto from "node:crypto";
export function downloadSecret(): string {
    const secret = process.env.DOWNLOAD_SECRET;
    if (secret && secret.length >= 32 && !secret.startsWith("change-this"))
        return secret;
    if (process.env.NODE_ENV === "production")
        throw new Error("Configure a random DOWNLOAD_SECRET of at least 32 characters");
    return "local-development-only-download-secret";
}
export function safeEqual(a: string, b: string): boolean {
    const left = Buffer.from(a), right = Buffer.from(b);
    return left.length === right.length && crypto.timingSafeEqual(left, right);
}
export function orderAccessToken(orderId: string): string {
    return crypto.createHmac("sha256", downloadSecret()).update(`order:${orderId}`).digest("hex");
}
export function verifyOrderAccess(orderId: string, token: string | null): boolean {
    return Boolean(token && safeEqual(token, orderAccessToken(orderId)));
}
