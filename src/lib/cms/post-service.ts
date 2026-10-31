import "server-only";
import { and, desc, eq, inArray, lte, ne, notInArray, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, media, postRelated, postRevisions, posts, redirects, settings } from "@/db/schema";
import { SERVICE_PAGES } from "@/data/services";
import { slugify } from "@/lib/seo";
import { audit } from "./audit";
import { blockers, runChecks, type CheckResult } from "./checks";
import { docToText, mediaIdsOf, readingMinutes, sanitizeDoc } from "./doc";
import { pathsAffected, pingIndexNow, revalidateJournal } from "./pipeline";
import { resolvePrice } from "./prices";
import type { FaqItem, PostStatus, SeoFields } from "./types";
import type { SessionUser } from "./session";

export type PostInput = {
  title: string;
  slug?: string;
  excerpt: string;
  body: unknown;
  categoryId: string | null;
  serviceSlug: string | null;
  authorId: string | null;
  heroMediaId: string | null;
  isConcept: boolean;
  listed: boolean;
  seo: SeoFields;
  faq: FaqItem[];
  relatedIds: string[];
};

export class PostError extends Error {}

const REVISION_GAP_MS = 5 * 60_000;
const REVISION_KEEP = 30;

export const isServiceSlug = (slug: string | null | undefined): slug is string => !!slug && SERVICE_PAGES.some((s) => s.slug === slug);

async function uniqueSlug(wanted: string, excludeId?: string): Promise<string> {
  const base = slugify(wanted).slice(0, 150) || "post";
  for (let n = 0; n < 200; n++) {
    const candidate = n === 0 ? base : `${base}-${n + 1}`;
    const [hit] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(sql`lower(${posts.slug}) = ${candidate}`, excludeId ? ne(posts.id, excludeId) : undefined))
      .limit(1);
    if (!hit) return candidate;
  }
  throw new PostError("Could not find a free slug");
}

async function snapshot(postId: string, user: SessionUser, note: string | null, force = false) {
  const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  if (!post) return;
  const [last] = await db.select({ savedAt: postRevisions.savedAt }).from(postRevisions).where(eq(postRevisions.postId, postId)).orderBy(desc(postRevisions.savedAt)).limit(1);
  if (!force && last && Date.now() - last.savedAt.getTime() < REVISION_GAP_MS) return;
  await db.insert(postRevisions).values({ postId, title: post.title, excerpt: post.excerpt, body: post.body, savedBy: user.id, note });
  const keep = await db.select({ id: postRevisions.id }).from(postRevisions).where(eq(postRevisions.postId, postId)).orderBy(desc(postRevisions.savedAt)).limit(REVISION_KEEP);
  if (keep.length === REVISION_KEEP) {
    await db.delete(postRevisions).where(and(eq(postRevisions.postId, postId), notInArray(postRevisions.id, keep.map((k) => k.id))));
  }
}

async function replaceRelated(postId: string, ids: string[]) {
  const wanted = [...new Set(ids)].filter((id) => id !== postId).slice(0, 6);
  await db.delete(postRelated).where(eq(postRelated.postId, postId));
  if (wanted.length) {
    const existing = await db.select({ id: posts.id }).from(posts).where(inArray(posts.id, wanted));
    const ok = new Set(existing.map((e) => e.id));
    const rows = wanted.filter((id) => ok.has(id)).map((relatedPostId, sortOrder) => ({ postId, relatedPostId, sortOrder }));
    if (rows.length) await db.insert(postRelated).values(rows);
  }
}

function cleanSeo(seo: SeoFields): SeoFields {
  const out: SeoFields = {};
  if (seo.title?.trim()) out.title = seo.title.trim();
  if (seo.description?.trim()) out.description = seo.description.trim();
  if (seo.canonical?.trim()) out.canonical = seo.canonical.trim();
  if (seo.ogMediaId) out.ogMediaId = seo.ogMediaId;
  if (seo.focusKeyword?.trim()) out.focusKeyword = seo.focusKeyword.trim();
  if (seo.noindex) out.noindex = true;
  return out;
}

export async function createPost(user: SessionUser, input: Pick<PostInput, "title"> & Partial<PostInput>): Promise<string> {
  const doc = sanitizeDoc(input.body);
  const slug = await uniqueSlug(input.slug || input.title);
  const [row] = await db
    .insert(posts)
    .values({
      slug,
      title: input.title.trim(),
      excerpt: input.excerpt ?? "",
      body: doc,
      categoryId: input.categoryId ?? null,
      serviceSlug: isServiceSlug(input.serviceSlug) ? input.serviceSlug : null,
      authorId: input.authorId ?? user.id,
      heroMediaId: input.heroMediaId ?? null,
      isConcept: input.isConcept ?? false,
      listed: input.listed ?? true,
      readingMinutes: readingMinutes(docToText(doc, resolvePrice)),
      seo: cleanSeo(input.seo ?? {}),
      faq: input.faq ?? [],
    })
    .returning({ id: posts.id });
  await snapshot(row.id, user, "Created", true);
  await audit(user, "create", "post", row.id, { slug });
  return row.id;
}

export type SaveResult = { slug: string; savedAt: Date; slugChanged: boolean };

export async function savePost(user: SessionUser, id: string, input: PostInput, note: string | null = null): Promise<SaveResult> {
  const [current] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!current) throw new PostError("Post not found");
  if (current.status === "archived") throw new PostError("Restore the post from the archive before editing it");

  const doc = sanitizeDoc(input.body);
  const wantsSlug = input.slug?.trim() ? slugify(input.slug) : current.slug;
  const slug = wantsSlug === current.slug ? current.slug : await uniqueSlug(wantsSlug, id);
  const slugChanged = slug !== current.slug;
  const live = current.status === "published";

  await db
    .update(posts)
    .set({
      slug,
      title: input.title.trim(),
      excerpt: input.excerpt,
      body: doc,
      categoryId: input.categoryId,
      serviceSlug: isServiceSlug(input.serviceSlug) ? input.serviceSlug : null,
      authorId: input.authorId,
      heroMediaId: input.heroMediaId,
      isConcept: input.isConcept,
      listed: input.listed,
      readingMinutes: readingMinutes(docToText(doc, resolvePrice)),
      seo: cleanSeo(input.seo),
      faq: input.faq,
    })
    .where(eq(posts.id, id));
  await replaceRelated(id, input.relatedIds);
  await snapshot(id, user, note, !!note);

  if (slugChanged && live) {
    // A live URL moved: keep the old one working with one hop, and avoid a redirect loop back onto a live slug.
    await db.delete(redirects).where(eq(redirects.fromPath, `/blogs/${slug}`));
    await db
      .insert(redirects)
      .values({ fromPath: `/blogs/${current.slug}`, toPath: `/blogs/${slug}`, code: 308 })
      .onConflictDoUpdate({ target: redirects.fromPath, set: { toPath: `/blogs/${slug}`, code: 308 } });
    await audit(user, "slug-change", "post", id, { from: current.slug, to: slug });
  }
  if (live) {
    const service = await resolveServiceSlug(id);
    revalidateJournal(slug, service, slugChanged ? [current.slug] : []);
  }
  return { slug, savedAt: new Date(), slugChanged };
}

export async function resolveServiceSlug(postId: string): Promise<string | null> {
  const [row] = await db
    .select({ service: posts.serviceSlug, category: categories.serviceSlug })
    .from(posts)
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .where(eq(posts.id, postId))
    .limit(1);
  return row?.service ?? row?.category ?? null;
}

/** Runs the publish checks against what is saved in the database. */
export async function checkPost(id: string): Promise<CheckResult[]> {
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) throw new PostError("Post not found");
  const ids = [...new Set([...(post.heroMediaId ? [post.heroMediaId] : []), ...mediaIdsOf(post.body)])];
  const rows = ids.length ? await db.select({ id: media.id, alt: media.alt }).from(media).where(inArray(media.id, ids)) : [];
  const alt = new Map(rows.map((r) => [r.id, r.alt]));
  const service = await resolveServiceSlug(id);
  return runChecks({
    title: post.title,
    excerpt: post.excerpt,
    doc: post.body,
    seo: post.seo,
    faq: post.faq,
    isConcept: post.isConcept,
    hasCategory: !!post.categoryId,
    hasService: isServiceSlug(service),
    hero: post.heroMediaId ? { alt: alt.get(post.heroMediaId) ?? "" } : null,
    imageAlts: mediaIdsOf(post.body).map((m) => alt.get(m) ?? ""),
  });
}

export type PublishOptions = { overrideReason?: string };

async function goLive(user: SessionUser | null, id: string, status: "published" | "scheduled", scheduledFor: Date | null, opts: PublishOptions) {
  const results = await checkPost(id);
  const blocking = blockers(results);
  if (blocking.length) {
    if (!opts.overrideReason || user?.role !== "owner") throw new PostError(`Cannot publish: ${blocking.map((b) => b.message).join(" | ")}`);
    await audit(user, "publish-override", "post", id, { reason: opts.overrideReason, overridden: blocking.map((b) => b.id) });
  }
  const [current] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!current) throw new PostError("Post not found");
  await db
    .update(posts)
    .set({
      status,
      scheduledFor: status === "scheduled" ? scheduledFor : null,
      publishedAt: status === "published" ? (current.publishedAt ?? new Date()) : current.publishedAt,
    })
    .where(eq(posts.id, id));
  if (status === "published") {
    const service = await resolveServiceSlug(id);
    revalidateJournal(current.slug, service);
    await pingIndexNow(pathsAffected(current.slug, service));
  }
  await audit(user, status === "published" ? "publish" : "schedule", "post", id, scheduledFor ? { at: scheduledFor.toISOString() } : undefined);
}

export const publishPost = (user: SessionUser, id: string, opts: PublishOptions = {}) => goLive(user, id, "published", null, opts);

export async function schedulePost(user: SessionUser, id: string, when: Date, opts: PublishOptions = {}) {
  if (when.getTime() < Date.now() + 60_000) throw new PostError("Pick a time at least a minute in the future");
  await goLive(user, id, "scheduled", when, opts);
}

async function setStatus(user: SessionUser, id: string, status: PostStatus, action: string) {
  const [current] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!current) throw new PostError("Post not found");
  await db.update(posts).set({ status, scheduledFor: null }).where(eq(posts.id, id));
  const service = await resolveServiceSlug(id);
  revalidateJournal(current.slug, service);
  await audit(user, action, "post", id);
}

export const unpublishPost = (user: SessionUser, id: string) => setStatus(user, id, "draft", "unpublish");
export const archivePost = (user: SessionUser, id: string) => setStatus(user, id, "archived", "archive");
export const restorePost = (user: SessionUser, id: string) => setStatus(user, id, "draft", "restore");

export async function deletePostPermanently(user: SessionUser, id: string) {
  const [current] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!current) return;
  if (current.status !== "archived") throw new PostError("Archive the post before deleting it");
  await db.delete(posts).where(eq(posts.id, id));
  await audit(user, "delete", "post", id, { slug: current.slug });
  revalidateJournal(current.slug, null);
}

export async function restoreRevision(user: SessionUser, postId: string, revisionId: string) {
  const [rev] = await db.select().from(postRevisions).where(and(eq(postRevisions.id, revisionId), eq(postRevisions.postId, postId))).limit(1);
  if (!rev) throw new PostError("Revision not found");
  await snapshot(postId, user, "Before restore", true);
  await db
    .update(posts)
    .set({ title: rev.title, excerpt: rev.excerpt, body: rev.body, readingMinutes: readingMinutes(docToText(rev.body, resolvePrice)) })
    .where(eq(posts.id, postId));
  await audit(user, "restore-revision", "post", postId, { revisionId });
}

/** Called by the cron route. Publishes every due scheduled post, leaving blocked ones scheduled and logging why. */
export async function runDueSchedule(): Promise<{ published: string[]; blocked: { slug: string; reason: string }[] }> {
  const due = await db.select({ id: posts.id, slug: posts.slug }).from(posts).where(and(eq(posts.status, "scheduled"), lte(posts.scheduledFor, new Date())));
  const published: string[] = [];
  const blocked: { slug: string; reason: string }[] = [];
  for (const p of due) {
    try {
      await goLive(null, p.id, "published", null, {});
      published.push(p.slug);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown";
      blocked.push({ slug: p.slug, reason });
      await audit(null, "schedule-blocked", "post", p.id, { reason });
    }
  }
  await db.update(settings).set({ schedulerLastRunAt: new Date() }).where(eq(settings.id, 1));
  return { published, blocked };
}
