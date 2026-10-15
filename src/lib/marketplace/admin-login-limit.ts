import crypto from "node:crypto";
import type { SanityClient } from "@sanity/client";
import { writeClient } from "@/lib/sanity";
import { rateLimited } from "./rate-limit";

/** Shared CMS counter lets content editing work before the order database is connected. */
export async function cmsLoginLimited(request: Request, client: SanityClient, secret: string) {
  if (!secret) throw new Error("Admin session secret is required");
  const identity = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const id = `adminRateLimit.${crypto.createHmac("sha256", secret).update(identity).digest("hex")}`;
  const bucket = Math.floor(Date.now() / 300_000);
  await client.createIfNotExists({ _id: id, _type: "adminRateLimit", bucket, hits: 0 });
  for (let attempt = 0; attempt < 5; attempt++) {
    const record = await client.getDocument<{ _id: string; _type: string; _rev: string; bucket: number; hits: number }>(id);
    if (!record) throw new Error("Login counter unavailable");
    if (record.bucket === bucket && record.hits >= 5) return true;
    try {
      await client.patch(id).ifRevisionId(record._rev).set({ bucket, hits: record.bucket === bucket ? record.hits + 1 : 1 }).commit();
      return false;
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode !== 409) throw error;
    }
  }
  // Contention never permits an uncounted password attempt.
  return true;
}

export function adminLoginLimited(request: Request) {
  if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
    return cmsLoginLimited(request, writeClient(), process.env.ADMIN_SESSION_SECRET || "");
  }
  return rateLimited(request, "admin-login", 5, 300);
}
