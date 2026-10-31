import "server-only";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { settings } from "@/db/schema";
import { SITE_URL } from "@/lib/seo";

const HOST = new URL(SITE_URL).host;
// IndexNow keys are public by design (served at /<key>.txt from public/). Override with INDEXNOW_KEY if it is ever rotated.
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "19b48019398f4f8ab61c5e7d474980ea";

/** Every public path a journal change can affect. */
export function pathsAffected(slug: string, serviceSlug: string | null, extraSlugs: string[] = []): string[] {
  const paths = ["/blogs", `/blogs/${slug}`, ...extraSlugs.map((s) => `/blogs/${s}`), "/", "/feed.xml", "/sitemap.xml", "/llms.txt", "/llms-full.txt"];
  if (serviceSlug) paths.push(`/services/${serviceSlug}`);
  return paths;
}

export function revalidateJournal(slug: string, serviceSlug: string | null, extraSlugs: string[] = []): void {
  for (const path of pathsAffected(slug, serviceSlug, extraSlugs)) revalidatePath(path);
}

/** Tells IndexNow about changed URLs. Only runs in production, never throws, records the last status. */
export async function pingIndexNow(paths: string[]): Promise<void> {
  if (process.env.NODE_ENV !== "production") return;
  let status = "";
  try {
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`, urlList: paths.map((p) => `${SITE_URL}${p}`) }),
    });
    status = `${res.status} at ${new Date().toISOString()}`;
  } catch (error) {
    status = `failed: ${error instanceof Error ? error.message : "unknown"}`.slice(0, 250);
  }
  try {
    await db.update(settings).set({ indexNowLastStatus: status, updatedAt: new Date() }).where(eq(settings.id, 1));
  } catch (error) {
    console.error("could not record IndexNow status", error);
  }
}
