import "server-only";
import { and, asc, count, desc, eq, ilike, inArray, isNotNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, media, postMedia, postRelated, postRevisions, posts, redirects, settings, users } from "@/db/schema";
import type { PostStatus } from "./types";

export async function dashboardData() {
  const counts = { draft: 0, scheduled: 0, published: 0, archived: 0 } as Record<PostStatus, number>;
  const rows = await db.select({ status: posts.status, n: count() }).from(posts).groupBy(posts.status);
  for (const r of rows) counts[r.status] = r.n;
  const [nextScheduled] = await db
    .select({ id: posts.id, title: posts.title, scheduledFor: posts.scheduledFor })
    .from(posts)
    .where(and(eq(posts.status, "scheduled"), isNotNull(posts.scheduledFor)))
    .orderBy(asc(posts.scheduledFor))
    .limit(1);
  const recent = await db
    .select({ id: posts.id, slug: posts.slug, title: posts.title, status: posts.status, updatedAt: posts.updatedAt, category: categories.name })
    .from(posts)
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .orderBy(desc(posts.updatedAt))
    .limit(8);
  return { counts, nextScheduled: nextScheduled ? { ...nextScheduled, scheduledFor: nextScheduled.scheduledFor as Date } : null, recent };
}

export type PostFilters = { q?: string; status?: PostStatus; categoryId?: string; page?: number };
const PAGE_SIZE = 20;

export async function listPosts({ q, status, categoryId, page = 1 }: PostFilters) {
  const where = and(
    status ? eq(posts.status, status) : undefined,
    categoryId ? eq(posts.categoryId, categoryId) : undefined,
    q ? or(ilike(posts.title, `%${q}%`), ilike(posts.slug, `%${q}%`)) : undefined,
  );
  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      status: posts.status,
      listed: posts.listed,
      isConcept: posts.isConcept,
      publishedAt: posts.publishedAt,
      scheduledFor: posts.scheduledFor,
      updatedAt: posts.updatedAt,
      category: categories.name,
    })
    .from(posts)
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .where(where)
    .orderBy(desc(posts.updatedAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);
  const [{ total }] = await db.select({ total: count() }).from(posts).where(where);
  return { rows, total, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), page };
}

export async function getPostForEdit(id: string) {
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) return null;
  const related = await db.select({ id: postRelated.relatedPostId }).from(postRelated).where(eq(postRelated.postId, id)).orderBy(asc(postRelated.sortOrder));
  return { ...post, relatedIds: related.map((r) => r.id) };
}

export const listCategories = () => db.select().from(categories).orderBy(asc(categories.name));

export const listUsers = () => db.select().from(users).orderBy(asc(users.name));

export const listRedirects = () => db.select().from(redirects).orderBy(desc(redirects.createdAt));

export async function getSettings() {
  const [row] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
  if (row) return row;
  const [created] = await db.insert(settings).values({ id: 1 }).returning();
  return created;
}

export const listMedia = (limit = 200) => db.select().from(media).orderBy(desc(media.createdAt)).limit(limit);

export async function mediaByIds(ids: string[]) {
  if (ids.length === 0) return new Map<string, typeof media.$inferSelect>();
  const rows = await db.select().from(media).where(inArray(media.id, ids));
  return new Map(rows.map((m) => [m.id, m]));
}

export const listRevisions = (postId: string) =>
  db
    .select({ id: postRevisions.id, title: postRevisions.title, savedAt: postRevisions.savedAt, note: postRevisions.note, savedBy: users.name })
    .from(postRevisions)
    .leftJoin(users, eq(users.id, postRevisions.savedBy))
    .where(eq(postRevisions.postId, postId))
    .orderBy(desc(postRevisions.savedAt))
    .limit(30);

export const searchPostsForLinking = (q: string, excludeId?: string) =>
  db
    .select({ id: posts.id, title: posts.title, slug: posts.slug })
    .from(posts)
    .where(and(eq(posts.status, "published"), q ? ilike(posts.title, `%${q}%`) : undefined, excludeId ? sql`${posts.id} <> ${excludeId}` : undefined))
    .orderBy(desc(posts.publishedAt))
    .limit(10);

export const duePosts = () =>
  db.select({ id: posts.id, slug: posts.slug }).from(posts).where(and(eq(posts.status, "scheduled"), lte(posts.scheduledFor, new Date())));

export async function mediaUsage(mediaId: string) {
  const hero = await db.select({ id: posts.id, title: posts.title, status: posts.status }).from(posts).where(eq(posts.heroMediaId, mediaId));
  const gallery = await db
    .select({ id: posts.id, title: posts.title, status: posts.status })
    .from(postMedia)
    .innerJoin(posts, eq(posts.id, postMedia.postId))
    .where(eq(postMedia.mediaId, mediaId));
  // Body references live inside the JSON, so search it with a text match on the id.
  const inBody = await db
    .select({ id: posts.id, title: posts.title, status: posts.status })
    .from(posts)
    .where(sql`${posts.body}::text like ${"%" + mediaId + "%"}`);
  const seen = new Map<string, { id: string; title: string; status: PostStatus }>();
  for (const p of [...hero, ...gallery, ...inBody]) seen.set(p.id, p);
  return [...seen.values()];
}
