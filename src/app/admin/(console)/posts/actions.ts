"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { Forbidden, authorize } from "@/lib/cms/dal";
import { searchPostsForLinking } from "@/lib/cms/queries";
import {
  PostError,
  archivePost,
  checkPost,
  createPost,
  deletePostPermanently,
  publishPost,
  restorePost,
  restoreRevision,
  savePost,
  schedulePost,
  unpublishPost,
} from "@/lib/cms/post-service";
import { lagosLocalToDate } from "@/lib/cms/dates";

type Ok<T = object> = { ok: true } & T;
type Fail = { ok: false; error: string };

const uuid = z.string().uuid();
const Payload = z.object({
  title: z.string().trim().min(1, "A title is required").max(200),
  slug: z.string().trim().max(160).optional(),
  excerpt: z.string().max(400),
  body: z.unknown(),
  categoryId: uuid.nullable(),
  serviceSlug: z.string().regex(/^[a-z0-9-]{1,120}$/).nullable(),
  authorId: uuid.nullable(),
  heroMediaId: uuid.nullable(),
  isConcept: z.boolean(),
  listed: z.boolean(),
  seo: z.object({
    title: z.string().max(120).optional(),
    description: z.string().max(320).optional(),
    canonical: z.union([z.string().url().max(512), z.literal("")]).optional(),
    ogMediaId: uuid.nullable().optional().transform((v) => v ?? undefined),
    focusKeyword: z.string().max(120).optional(),
    noindex: z.boolean().optional(),
  }),
  faq: z.array(z.object({ q: z.string().trim().min(1).max(300), a: z.string().trim().min(1).max(1500) })).max(12),
  relatedIds: z.array(uuid).max(6),
});
export type PostPayload = z.infer<typeof Payload>;

function fail(error: unknown): Fail {
  if (error instanceof Forbidden || error instanceof PostError) return { ok: false, error: error.message };
  if (error instanceof z.ZodError) return { ok: false, error: error.issues[0]?.message ?? "Invalid input" };
  console.error("post action failed", error);
  return { ok: false, error: "Something went wrong. Nothing was lost, try again." };
}

export async function createPostAction(formData: FormData): Promise<void> {
  const user = await authorize();
  const title = z.string().trim().min(1).max(200).parse(String(formData.get("title") ?? ""));
  const categoryRaw = String(formData.get("categoryId") ?? "");
  const id = await createPost(user, { title, categoryId: uuid.safeParse(categoryRaw).success ? categoryRaw : null });
  redirect(`/admin/posts/${id}`);
}

export async function saveAction(id: string, payload: PostPayload, note?: string): Promise<Ok<{ slug: string; savedAt: string; slugChanged: boolean }> | Fail> {
  try {
    const user = await authorize();
    const input = Payload.parse(payload);
    const r = await savePost(user, uuid.parse(id), input, note?.slice(0, 200) || null);
    return { ok: true, slug: r.slug, savedAt: r.savedAt.toISOString(), slugChanged: r.slugChanged };
  } catch (error) {
    return fail(error);
  }
}

export async function publishAction(id: string, overrideReason?: string): Promise<Ok | Fail> {
  try {
    const user = await authorize();
    await publishPost(user, uuid.parse(id), { overrideReason: overrideReason?.trim() || undefined });
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function scheduleAction(id: string, localLagos: string, overrideReason?: string): Promise<Ok | Fail> {
  try {
    const user = await authorize();
    const when = lagosLocalToDate(localLagos);
    if (!when) throw new PostError("Choose a date and time");
    await schedulePost(user, uuid.parse(id), when, { overrideReason: overrideReason?.trim() || undefined });
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function unpublishAction(id: string): Promise<Ok | Fail> {
  try {
    await unpublishPost(await authorize(), uuid.parse(id));
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function archiveAction(id: string): Promise<Ok | Fail> {
  try {
    await archivePost(await authorize(), uuid.parse(id));
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function restoreAction(id: string): Promise<Ok | Fail> {
  try {
    await restorePost(await authorize(), uuid.parse(id));
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/** Owner only. */
export async function deleteAction(id: string): Promise<Ok | Fail> {
  try {
    await deletePostPermanently(await authorize(["owner"]), uuid.parse(id));
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function restoreRevisionAction(postId: string, revisionId: string): Promise<Ok | Fail> {
  try {
    await restoreRevision(await authorize(), uuid.parse(postId), uuid.parse(revisionId));
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function serverChecksAction(id: string): Promise<Ok<{ results: { id: string; severity: "block" | "warn"; ok: boolean; message: string }[] }> | Fail> {
  try {
    await authorize();
    return { ok: true, results: await checkPost(uuid.parse(id)) };
  } catch (error) {
    return fail(error);
  }
}

export async function searchRelatedAction(q: string, excludeId: string): Promise<{ id: string; title: string }[]> {
  await authorize();
  return searchPostsForLinking(q.trim().slice(0, 80), uuid.safeParse(excludeId).success ? excludeId : undefined);
}
