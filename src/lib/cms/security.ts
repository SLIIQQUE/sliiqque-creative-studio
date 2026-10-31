import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { rateLimits } from "@/db/schema";

export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

/** 32 random bytes, URL safe. Only its SHA-256 is ever stored. */
export const newToken = () => randomBytes(32).toString("base64url");

/**
 * Fixed-window rate limit backed by the database. Returns true when the call is allowed.
 * Fails open if the table is unreachable so a database hiccup cannot lock the owner out, but logs it.
 */
export async function allow(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  try {
    const now = Date.now();
    const windowStart = new Date(Math.floor(now / (windowSeconds * 1000)) * windowSeconds * 1000);
    const [row] = await db
      .insert(rateLimits)
      .values({ key, windowStart, hits: 1 })
      .onConflictDoUpdate({ target: [rateLimits.key, rateLimits.windowStart], set: { hits: sql`${rateLimits.hits} + 1` } })
      .returning({ hits: rateLimits.hits });
    // Opportunistic cleanup of old windows.
    if (Math.random() < 0.02) {
      await db.delete(rateLimits).where(sql`${rateLimits.windowStart} < now() - interval '1 day'`);
    }
    return row.hits <= limit;
  } catch (error) {
    console.error("rate limit check failed", error);
    return true;
  }
}

export const clientKey = (headers: Headers) =>
  (headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown").slice(0, 64);
