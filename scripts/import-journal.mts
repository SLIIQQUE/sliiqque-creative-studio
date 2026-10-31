// One-time, repeatable import of the journal posts that live in src/data/content.json into the admin database.
// Safe to re-run: existing slugs are skipped unless --force is given (which overwrites them, so edits made in the admin are lost).
// Usage: npx tsx --env-file=.env.local scripts/import-journal.mts [--dry] [--force]
import { readFileSync } from "node:fs";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categories, media, posts, users } from "../src/db/schema.ts";
import { docToText, readingMinutes } from "../src/lib/cms/doc.ts";
import { isStaticMediaId, legacyToDoc } from "../src/lib/cms/legacy.ts";
import { trimDesc } from "../src/lib/seo.ts";
import type { BlockNode, PostGroupLike } from "../src/lib/cms/types.ts";

const dry = process.argv.includes("--dry");
const force = process.argv.includes("--force");
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const raw = JSON.parse(readFileSync(path.join(process.cwd(), "src/data/content.json"), "utf8")) as {
  BLOGS: [slug: string, date: string, category: string, title: string, img: string][];
  BLOGS_LISTED: number;
  POSTS: Record<string, { groups: PostGroupLike[]; gallery: string[] }>;
};

const client = postgres(url, { max: 1 });
const db = drizzle(client);

const mimeOf = (file: string) => ({ jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" })[file.split(".").pop()!.toLowerCase()] ?? "image/jpeg";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "Oct 26, 2026" to a Date at 09:00 Lagos time (08:00 UTC), plus an offset in minutes to keep the original order within a day. */
function parseDate(label: string, offsetMinutes: number): Date {
  const m = /^([A-Za-z]{3}) (\d{1,2}), (\d{4})$/.exec(label);
  if (!m) throw new Error(`Unrecognised date: ${label}`);
  return new Date(Date.UTC(Number(m[3]), MONTHS.indexOf(m[1]), Number(m[2]), 8, offsetMinutes));
}
/** "Oct 26, 2026" to "2026-10-26". */
const isoDay = (label: string) => {
  const m = /^([A-Za-z]{3}) (\d{1,2}), (\d{4})$/.exec(label)!;
  return `${m[3]}-${String(MONTHS.indexOf(m[1]) + 1).padStart(2, "0")}-${m[2].padStart(2, "0")}`;
};
const humanise = (slug: string) => slug.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

const report = { created: [] as string[], skipped: [] as string[], drafts: [] as string[], problems: [] as string[] };

const [owner] = await db.select().from(users).where(eq(users.role, "owner")).limit(1);
if (!owner) throw new Error("No owner user found. Run the seed script first.");
const cats = new Map((await db.select().from(categories)).map((c) => [c.name, c.id]));

async function registerMedia(file: string, alt: string, width: number, height: number): Promise<string> {
  const urlPath = `/img/${file}`;
  const [existing] = await db.select().from(media).where(and(eq(media.url, urlPath), eq(media.alt, alt))).limit(1);
  if (existing) return existing.id;
  if (dry) return "00000000-0000-4000-8000-000000000000";
  const [row] = await db.insert(media).values({ url: urlPath, storageKey: null, mime: mimeOf(file), width, height, alt, uploadedBy: owner.id }).returning({ id: media.id });
  return row.id;
}

const live = new Set(raw.BLOGS.map((b) => b[0]));
const order = [...raw.BLOGS.map((b, i) => ({ slug: b[0], blog: b, index: i })), ...Object.keys(raw.POSTS).filter((s) => !live.has(s)).map((slug) => ({ slug, blog: null, index: -1 }))];

for (const { slug, blog, index } of order) {
  const P = raw.POSTS[slug];
  if (!P) {
    report.problems.push(`${slug}: listed in BLOGS but has no POSTS entry`);
    continue;
  }
  const [existing] = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug)).limit(1);
  if (existing && !force) {
    report.skipped.push(slug);
    continue;
  }

  const title = blog ? blog[3] : humanise(slug);
  const headline = title.replace(/\.$/, "");
  const doc = legacyToDoc(P.groups, P.gallery);
  // Replace the "img:<file>" placeholders with real media rows, one per use so each keeps its own alt text.
  let n = 0;
  for (const node of doc.content as BlockNode[]) {
    if (node.type !== "imagePair") continue;
    for (const key of ["first", "second"] as const) {
      const id = node.attrs[key];
      if (!isStaticMediaId(id)) continue;
      n += 1;
      node.attrs[key] = await registerMedia(id.slice(4), `${headline}, illustration ${n}`, 640, 635);
    }
  }
  const heroId = blog ? await registerMedia(blog[4], headline, 1188, 754) : null;
  const first = P.groups[0][1][0][1][0];
  if (!heroId) report.drafts.push(slug);

  const values = {
    slug,
    title,
    excerpt: trimDesc(first),
    body: doc,
    status: blog ? ("published" as const) : ("draft" as const),
    listed: true,
    publishedAt: blog ? parseDate(blog[1], (raw.BLOGS.length - index) * 1) : null,
    // A migrated post was last modified when it was published, so dateModified in structured data stays truthful.
    ...(blog ? { updatedAt: new Date(`${isoDay(blog[1])}T00:00:00Z`) } : {}),
    categoryId: blog ? (cats.get(blog[2]) ?? null) : null,
    authorId: owner.id,
    heroMediaId: heroId,
    isConcept: false,
    readingMinutes: readingMinutes(docToText(doc)),
    seo: {},
    faq: [],
  };
  if (blog && !values.categoryId) report.problems.push(`${slug}: category "${blog[2]}" does not exist`);
  if (!dry) {
    if (existing) await db.update(posts).set(values).where(eq(posts.id, existing.id));
    else await db.insert(posts).values(values);
  }
  report.created.push(`${slug} (${blog ? "published" : "draft"})`);
}

console.log(JSON.stringify({ mode: dry ? "dry run" : "written", force, ...report }, null, 2));
await client.end();
