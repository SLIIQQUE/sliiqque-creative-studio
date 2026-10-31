import "server-only";
import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, media, postRelated, posts, redirects, settings, users } from "@/db/schema";
import { SERVICE_PAGES } from "@/data/services";
import { BLOGS, BLOGS_LISTED, POSTS, type Blog } from "@/lib/data";
import { legacyToDoc, staticMediaId } from "@/lib/cms/legacy";
import { firstParagraphText, mediaIdsOf } from "@/lib/cms/doc";
import type { Doc, FaqItem, SeoFields } from "@/lib/cms/types";
import { isoDate, trimDesc } from "@/lib/seo";

/**
 * One reader for the journal, with two interchangeable sources:
 *   JOURNAL_SOURCE=json (default): the hand-edited content.json, exactly as before.
 *   JOURNAL_SOURCE=db: the admin's database.
 * Switching is one environment variable, so cutover and rollback are a redeploy.
 */
export const journalSource = (): "json" | "db" => (process.env.JOURNAL_SOURCE === "db" ? "db" : "json");

export type MediaView = { id: string; url: string; alt: string; width: number; height: number; blurDataUrl?: string | null };

export type JournalEntry = {
  slug: string;
  title: string;
  excerpt: string;
  /** Meta description. Built per source so the stored excerpt is never trimmed twice. */
  metaDescription: string;
  dateLabel: string;
  isoDate: string;
  modifiedIso: string;
  category: string;
  serviceSlug: string | null;
  doc: Doc;
  media: Map<string, MediaView>;
  hero: MediaView | null;
  isConcept: boolean;
  listed: boolean;
  faq: FaqItem[];
  seo: SeoFields & { shareUrl?: string };
  author: { name: string; title: string | null; avatarId: string | null };
  related: Blog[];
};

const FOUNDER = { name: "Gabriel Njoabozia", title: "Founder", avatarId: "gabriel-njoabozia-avatar.webp" };

const dateLabel = (d: Date) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Africa/Lagos" }).format(d);
const iso = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(d);

/** Same mapping the old site used from category to service. */
const serviceForCategorySlug = (slug: string | null | undefined) => (slug && SERVICE_PAGES.some((s) => s.slug === slug) ? slug : null);

// ---------- JSON source ----------

const CATEGORY_SERVICE: Record<string, string> = {
  "Digital Humans": "ai-ugc-digital-humans",
  Process: "ai-commercials",
  "Post-production": "ai-photography",
  Photography: "ai-photography",
  Commercials: "ai-commercials",
  Fashion: "ai-fashion-imagery",
  Studio: "brand-launches-campaigns",
};

function jsonEntry(b: Blog): JournalEntry {
  const [slug, date, category, title, img] = b;
  const P = POSTS[slug];
  const headline = title.replace(/\.$/, "");
  const doc = legacyToDoc(P.groups, P.gallery);
  const media = new Map<string, MediaView>();
  P.gallery.forEach((file, i) => media.set(staticMediaId(file), { id: staticMediaId(file), url: `/img/${file}`, alt: `${headline}, illustration ${i + 1}`, width: 640, height: 635 }));
  const hero: MediaView = { id: staticMediaId(img), url: `/img/${img}`, alt: headline, width: 1188, height: 754 };
  return {
    slug,
    title,
    excerpt: P.groups[0][1][0][1][0],
    metaDescription: trimDesc(P.groups[0][1][0][1][0]),
    dateLabel: date,
    isoDate: isoDate(date),
    modifiedIso: isoDate(date),
    category,
    serviceSlug: CATEGORY_SERVICE[category] ?? null,
    doc,
    media,
    hero,
    isConcept: false,
    listed: true,
    faq: [],
    seo: {},
    author: FOUNDER,
    related: [],
  };
}

// ---------- Database source ----------

const toView = (m: typeof media.$inferSelect): MediaView => ({ id: m.id, url: m.url, alt: m.alt, width: m.width ?? 1200, height: m.height ?? 800, blurDataUrl: m.blurDataUrl });

async function loadMedia(ids: string[]): Promise<Map<string, MediaView>> {
  const real = ids.filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  if (!real.length) return new Map();
  const rows = await db.select().from(media).where(inArray(media.id, real));
  return new Map(rows.map((m) => [m.id, toView(m)]));
}

type Row = { post: typeof posts.$inferSelect; category: string | null; categoryService: string | null; authorName: string | null; authorTitle: string | null };

async function dbRow(slug: string, includeDrafts: boolean): Promise<Row | null> {
  const [r] = await db
    .select({ post: posts, category: categories.name, categoryService: categories.serviceSlug, authorName: users.name, authorTitle: users.title })
    .from(posts)
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(users, eq(users.id, posts.authorId))
    .where(and(eq(posts.slug, slug), includeDrafts ? ne(posts.status, "archived") : eq(posts.status, "published")))
    .limit(1);
  return r ?? null;
}

function cardFromRow(post: typeof posts.$inferSelect, category: string | null, heroUrl: string | null): Blog {
  const d = post.publishedAt ?? post.updatedAt;
  return [post.slug, dateLabel(d), category ?? "Journal", post.title, heroUrl ?? ""];
}

export async function getJournalCards(): Promise<{ cards: Blog[]; listed: number }> {
  if (journalSource() === "json") return { cards: BLOGS, listed: BLOGS_LISTED };
  const rows = await db
    .select({ post: posts, category: categories.name, heroUrl: media.url })
    .from(posts)
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(media, eq(media.id, posts.heroMediaId))
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt));
  const [s] = await db.select({ n: settings.postsPerPage }).from(settings).where(eq(settings.id, 1));
  const listedRows = rows.filter((r) => r.post.listed);
  return { cards: listedRows.map((r) => cardFromRow(r.post, r.category, r.heroUrl)), listed: s?.n ?? 6 };
}

export async function getJournalEntry(slug: string, opts: { draft?: boolean } = {}): Promise<JournalEntry | null> {
  if (journalSource() === "json") {
    const b = BLOGS.find((x) => x[0] === slug);
    return b ? jsonEntry(b) : null;
  }
  const r = await dbRow(slug, !!opts.draft);
  if (!r) return null;
  const { post } = r;
  const ids = [...mediaIdsOf(post.body), ...(post.heroMediaId ? [post.heroMediaId] : []), ...(post.seo.ogMediaId ? [post.seo.ogMediaId] : [])];
  const mediaMap = await loadMedia(ids);
  const relatedRows = await db
    .select({ post: posts, category: categories.name, heroUrl: media.url })
    .from(postRelated)
    .innerJoin(posts, eq(posts.id, postRelated.relatedPostId))
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(media, eq(media.id, posts.heroMediaId))
    .where(and(eq(postRelated.postId, post.id), eq(posts.status, "published")))
    .orderBy(asc(postRelated.sortOrder));
  const og = post.seo.ogMediaId ? mediaMap.get(post.seo.ogMediaId) : undefined;
  const d = post.publishedAt ?? post.updatedAt;
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    metaDescription: post.seo.description?.trim() || post.excerpt,
    dateLabel: dateLabel(d),
    isoDate: iso(d),
    modifiedIso: iso(post.updatedAt),
    category: r.category ?? "Journal",
    serviceSlug: serviceForCategorySlug(post.serviceSlug ?? r.categoryService),
    doc: post.body,
    media: mediaMap,
    hero: post.heroMediaId ? (mediaMap.get(post.heroMediaId) ?? null) : null,
    isConcept: post.isConcept,
    listed: post.listed,
    faq: post.faq,
    seo: { ...post.seo, shareUrl: og?.url },
    author: { name: r.authorName ?? FOUNDER.name, title: r.authorTitle ?? FOUNDER.title, avatarId: r.authorName && r.authorName !== FOUNDER.name ? null : FOUNDER.avatarId },
    related: relatedRows.map((x) => cardFromRow(x.post, x.category, x.heroUrl)),
  };
}

/** Slugs of every published post, for static generation and the sitemap. */
export async function getPublishedSlugs(): Promise<string[]> {
  if (journalSource() === "json") return BLOGS.map((b) => b[0]);
  const rows = await db.select({ slug: posts.slug }).from(posts).where(eq(posts.status, "published")).orderBy(desc(posts.publishedAt));
  return rows.map((r) => r.slug);
}

export type SitemapPost = { slug: string; modified: Date; images: string[] };
export async function getSitemapPosts(): Promise<SitemapPost[]> {
  if (journalSource() === "json") {
    return BLOGS.map((b) => ({ slug: b[0], modified: new Date(isoDate(b[1])), images: [b[4], ...POSTS[b[0]].gallery].map((f) => `/img/${f}`) }));
  }
  const rows = await db.select({ post: posts, heroUrl: media.url }).from(posts).leftJoin(media, eq(media.id, posts.heroMediaId)).where(eq(posts.status, "published")).orderBy(desc(posts.publishedAt));
  const visible = rows.filter((r) => !r.post.seo.noindex);
  const bodyIds = [...new Set(visible.flatMap((r) => mediaIdsOf(r.post.body)))];
  const bodyMedia = await loadMedia(bodyIds);
  return visible.map((r) => ({
    slug: r.post.slug,
    modified: r.post.updatedAt,
    // Hero first, then the images inside the body, as the old sitemap listed them.
    images: [...(r.heroUrl ? [r.heroUrl] : []), ...mediaIdsOf(r.post.body).map((id) => bodyMedia.get(id)?.url).filter((u): u is string => !!u)],
  }));
}

/** Plain-text summary of each post for the feed and llms.txt. */
export async function getFeedItems(): Promise<{ slug: string; title: string; category: string; iso: string; description: string }[]> {
  if (journalSource() === "json") {
    return [...BLOGS].sort((a, b) => isoDate(b[1]).localeCompare(isoDate(a[1]))).map((b) => ({ slug: b[0], title: b[3], category: b[2], iso: isoDate(b[1]), description: POSTS[b[0]].groups[0][1][0][1][0] }));
  }
  const rows = await db.select({ post: posts, category: categories.name }).from(posts).leftJoin(categories, eq(categories.id, posts.categoryId)).where(eq(posts.status, "published")).orderBy(desc(posts.publishedAt)).limit(50);
  return rows.map((r) => ({ slug: r.post.slug, title: r.post.title, category: r.category ?? "Journal", iso: iso(r.post.publishedAt ?? r.post.updatedAt), description: firstParagraphText(r.post.body) || r.post.excerpt }));
}

export async function getPostsForService(serviceSlug: string): Promise<Blog[]> {
  if (journalSource() === "json") return BLOGS.filter((b) => CATEGORY_SERVICE[b[2]] === serviceSlug);
  const rows = await db
    .select({ post: posts, category: categories.name, categoryService: categories.serviceSlug, heroUrl: media.url })
    .from(posts)
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(media, eq(media.id, posts.heroMediaId))
    .where(and(eq(posts.status, "published"), eq(posts.listed, true)))
    .orderBy(desc(posts.publishedAt));
  return rows.filter((r) => (r.post.serviceSlug ?? r.categoryService) === serviceSlug).map((r) => cardFromRow(r.post, r.category, r.heroUrl));
}

export async function findRedirect(fromPath: string): Promise<{ to: string; code: number } | null> {
  if (journalSource() === "json") return null;
  const [r] = await db.select().from(redirects).where(eq(redirects.fromPath, fromPath)).limit(1);
  return r ? { to: r.toPath, code: r.code } : null;
}
