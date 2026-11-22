"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { asc, eq, max } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { videos } from "@/db/schema";
import { audit } from "@/lib/cms/audit";
import { revalidateSite } from "@/lib/cms/revalidate";
import { Forbidden, authorize } from "@/lib/cms/dal";
import { VIDEO_TYPES, clockToIso, parseYoutubeId } from "@/lib/video-utils";

export type VideoState = { error?: string; ok?: string } | undefined;

const uuid = z.string().uuid();
const path = z.string().refine((p) => p.startsWith("/") && !p.startsWith("//") && p.length <= 200, "Page paths must start with a single /");

const schema = z.object({
  id: z.string().optional(),
  youtubeId: z.string().transform((v, ctx) => parseYoutubeId(v) ?? (ctx.addIssue({ code: "custom", message: "That is not a YouTube link or video ID" }), z.NEVER)),
  title: z.string().trim().min(1, "Title is required").max(160),
  description: z.string().trim().max(1000),
  type: z.string().trim().min(1, "Choose a type").max(40).refine((t) => (VIDEO_TYPES as readonly string[]).includes(t), "Choose a type from the list"),
  orientation: z.enum(["landscape", "portrait"]),
  duration: z.string().transform((v, ctx) => clockToIso(v) ?? (ctx.addIssue({ code: "custom", message: "Duration looks like 0:30 or 1:15" }), z.NEVER)),
  uploadDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose the publish date"),
  pages: z.array(path),
  featured: z.boolean(),
  published: z.boolean(),
});

function refresh(pages: string[] = []) {
  revalidateSite();
  for (const p of ["/", "/videos", "/admin/videos", "/sitemap.xml", "/llms.txt", "/llms-full.txt", ...pages]) revalidatePath(p);
}

function fail(e: unknown, fallback: string): VideoState {
  if (e instanceof Forbidden) return { error: e.message };
  if (e instanceof z.ZodError) return { error: e.issues[0]?.message ?? "Invalid input" };
  return { error: fallback };
}

export async function saveVideo(_prev: VideoState, formData: FormData): Promise<VideoState> {
  try {
    const user = await authorize();
    const extra = String(formData.get("extraPaths") ?? "").split(/[\s,]+/).map((p) => p.trim()).filter(Boolean);
    const v = schema.parse({
      id: String(formData.get("id") ?? "") || undefined,
      youtubeId: formData.get("youtubeId") ?? "",
      title: formData.get("title") ?? "",
      description: formData.get("description") ?? "",
      type: formData.get("type") ?? "",
      orientation: formData.get("orientation") ?? "landscape",
      duration: formData.get("duration") ?? "",
      uploadDate: formData.get("uploadDate") ?? "",
      pages: [...new Set([...formData.getAll("pages").map(String), ...extra])],
      featured: formData.get("featured") === "on",
      published: formData.get("published") === "on",
    });
    const { id, ...fields } = v;
    let previous: string[] = [];
    if (id) {
      const vid = uuid.parse(id);
      const [row] = await db.select({ pages: videos.pages }).from(videos).where(eq(videos.id, vid)).limit(1);
      if (!row) return { error: "That video no longer exists" };
      previous = row.pages;
      const [dupe] = await db.select({ id: videos.id }).from(videos).where(eq(videos.youtubeId, fields.youtubeId)).limit(1);
      if (dupe && dupe.id !== vid) return { error: "That YouTube video is already in the list" };
      await db.update(videos).set(fields).where(eq(videos.id, vid));
      await audit(user, "update", "video", vid, { youtubeId: fields.youtubeId });
    } else {
      const [dupe] = await db.select({ id: videos.id }).from(videos).where(eq(videos.youtubeId, fields.youtubeId)).limit(1);
      if (dupe) return { error: "That YouTube video is already in the list" };
      const [{ top }] = await db.select({ top: max(videos.sortOrder) }).from(videos);
      const [row] = await db.insert(videos).values({ ...fields, sortOrder: (top ?? -1) + 1 }).returning({ id: videos.id });
      await audit(user, "create", "video", row.id, { youtubeId: fields.youtubeId });
    }
    refresh([...fields.pages, ...previous]);
  } catch (e) {
    return fail(e, "Could not save the video");
  }
  redirect("/admin/videos?saved=1");
}

export async function moveVideo(videoId: string, direction: "up" | "down"): Promise<VideoState> {
  try {
    const user = await authorize();
    const vid = uuid.parse(videoId);
    const rows = await db.select({ id: videos.id }).from(videos).orderBy(asc(videos.sortOrder), asc(videos.createdAt));
    const from = rows.findIndex((r) => r.id === vid);
    const to = direction === "up" ? from - 1 : from + 1;
    if (from < 0 || to < 0 || to >= rows.length) return undefined;
    const order = rows.map((r) => r.id);
    [order[from], order[to]] = [order[to], order[from]];
    await db.transaction(async (tx) => {
      for (const [i, rowId] of order.entries()) await tx.update(videos).set({ sortOrder: i }).where(eq(videos.id, rowId));
    });
    await audit(user, "update", "video", vid, { moved: direction });
    refresh();
    return { ok: "Order saved" };
  } catch (e) {
    return fail(e, "Could not reorder");
  }
}

export async function setVideoPublished(videoId: string, published: boolean): Promise<VideoState> {
  try {
    const user = await authorize();
    const vid = uuid.parse(videoId);
    const [row] = await db.update(videos).set({ published }).where(eq(videos.id, vid)).returning({ pages: videos.pages });
    if (!row) return { error: "That video no longer exists" };
    await audit(user, "update", "video", vid, { published });
    refresh(row.pages);
    return { ok: published ? "Published" : "Hidden from the site" };
  } catch (e) {
    return fail(e, "Could not update the video");
  }
}

export async function deleteVideo(videoId: string): Promise<VideoState> {
  try {
    const user = await authorize();
    const vid = uuid.parse(videoId);
    const [row] = await db.delete(videos).where(eq(videos.id, vid)).returning({ pages: videos.pages, youtubeId: videos.youtubeId });
    if (!row) return { error: "That video no longer exists" };
    await audit(user, "delete", "video", vid, { youtubeId: row.youtubeId });
    refresh(row.pages);
    return { ok: "Deleted" };
  } catch (e) {
    return fail(e, "Could not delete the video");
  }
}
