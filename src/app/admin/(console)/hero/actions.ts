"use server";

import { revalidatePath } from "next/cache";
import { asc, eq, max } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { heroFrames, media } from "@/db/schema";
import { audit } from "@/lib/cms/audit";
import { Forbidden, authorize } from "@/lib/cms/dal";
import { HERO } from "@/lib/data";
import { frameAlt } from "@/lib/hero";

export type HeroState = { error?: string; ok?: string } | undefined;

const MIME: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };
const id = z.string().uuid();
const label = z.string().trim().max(80).transform((v) => v || null);
const href = z
  .string()
  .trim()
  .max(512)
  .refine((v) => v === "" || (v.startsWith("/") && !v.startsWith("//")), "Links must be a site path starting with a single /")
  .transform((v) => v || null);

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/hero");
}

function fail(e: unknown, fallback: string): HeroState {
  if (e instanceof Forbidden) return { error: e.message };
  if (e instanceof z.ZodError) return { error: e.issues[0]?.message ?? "Invalid input" };
  return { error: fallback };
}

/** Copies the frames that ship with the site into the editable list, so the first change never wipes the current reel. */
async function seedBuiltIns(): Promise<void> {
  const [{ n }] = await db.select({ n: max(heroFrames.sortOrder) }).from(heroFrames);
  if (n !== null) return;
  let order = 0;
  for (const file of HERO.ticker) {
    const url = `/img/${file}`;
    const [existing] = await db.select({ id: media.id }).from(media).where(eq(media.url, url)).limit(1);
    const mediaId =
      existing?.id ??
      (await db.insert(media).values({ url, mime: MIME[file.split(".").pop() ?? ""] ?? "image/jpeg", alt: frameAlt(file) }).returning({ id: media.id }))[0].id;
    await db.insert(heroFrames).values({ mediaId, sortOrder: order++ });
  }
}

export async function addFrame(mediaId: string): Promise<HeroState> {
  try {
    const user = await authorize();
    const mid = id.parse(mediaId);
    await seedBuiltIns();
    const [{ top }] = await db.select({ top: max(heroFrames.sortOrder) }).from(heroFrames);
    const [row] = await db.insert(heroFrames).values({ mediaId: mid, sortOrder: (top ?? -1) + 1 }).returning({ id: heroFrames.id });
    await audit(user, "create", "hero_frame", row.id, { mediaId: mid });
    refresh();
    return { ok: "Added to the reel" };
  } catch (e) {
    return fail(e, "Could not add the frame");
  }
}

export async function removeFrame(frameId: string): Promise<HeroState> {
  try {
    const user = await authorize();
    const fid = id.parse(frameId);
    const rows = await db.select({ id: heroFrames.id }).from(heroFrames);
    if (rows.length <= 1) return { error: "Keep at least one frame in the reel" };
    await db.delete(heroFrames).where(eq(heroFrames.id, fid));
    await audit(user, "delete", "hero_frame", fid);
    refresh();
    return { ok: "Removed from the reel" };
  } catch (e) {
    return fail(e, "Could not remove the frame");
  }
}

export async function moveFrame(frameId: string, direction: "up" | "down"): Promise<HeroState> {
  try {
    const user = await authorize();
    const fid = id.parse(frameId);
    const rows = await db.select({ id: heroFrames.id }).from(heroFrames).orderBy(asc(heroFrames.sortOrder), asc(heroFrames.createdAt));
    const from = rows.findIndex((r) => r.id === fid);
    const to = direction === "up" ? from - 1 : from + 1;
    if (from < 0 || to < 0 || to >= rows.length) return undefined;
    const order = rows.map((r) => r.id);
    [order[from], order[to]] = [order[to], order[from]];
    await db.transaction(async (tx) => {
      for (const [i, rowId] of order.entries()) await tx.update(heroFrames).set({ sortOrder: i }).where(eq(heroFrames.id, rowId));
    });
    await audit(user, "update", "hero_frame", fid, { moved: direction });
    refresh();
    return { ok: "Order saved" };
  } catch (e) {
    return fail(e, "Could not reorder");
  }
}

export async function saveFrame(_prev: HeroState, formData: FormData): Promise<HeroState> {
  try {
    const user = await authorize();
    const v = z.object({ id, label, href }).parse({ id: formData.get("id"), label: formData.get("label") ?? "", href: formData.get("href") ?? "" });
    await db.update(heroFrames).set({ label: v.label, href: v.href }).where(eq(heroFrames.id, v.id));
    await audit(user, "update", "hero_frame", v.id, { label: v.label, href: v.href });
    refresh();
    return { ok: "Saved" };
  } catch (e) {
    return fail(e, "Could not save");
  }
}

export async function importBuiltIns(): Promise<HeroState> {
  try {
    await authorize();
    await seedBuiltIns();
    refresh();
    return { ok: "Current frames copied into the list" };
  } catch (e) {
    return fail(e, "Could not import the frames");
  }
}
