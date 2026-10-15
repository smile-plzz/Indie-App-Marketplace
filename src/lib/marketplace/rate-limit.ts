import crypto from "node:crypto";
import { getDatabase } from "./db";
export async function rateLimited(req: Request, scope: string, limit = 20, windowSeconds = 60): Promise<boolean> {
    const identity = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
    const key = crypto.createHash("sha256").update(`${scope}:${identity}`).digest("hex");
    const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
    const db = await getDatabase();
    await db.exec("CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, bucket INTEGER NOT NULL, hits INTEGER NOT NULL)");
    const row = await db.prepare(`INSERT INTO rate_limits(key,bucket,hits) VALUES (?,?,1)
    ON CONFLICT(key) DO UPDATE SET hits = CASE WHEN rate_limits.bucket = excluded.bucket THEN rate_limits.hits + 1 ELSE 1 END,
    bucket = excluded.bucket RETURNING hits`).get(key, bucket) as {
        hits: number;
    };
    return row.hits > limit;
}
