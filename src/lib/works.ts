import "server-only";
import { cache } from "react";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { media, works } from "@/db/schema";
import { SERVICE_WORKS } from "@/data/services";
import { CASES, WORKS, type Work } from "@/lib/data";
import { journalSource } from "@/lib/journal";
import { abs, shareImg } from "@/lib/seo";

/** A work with its whole case study, from the admin or from the built-ins. Image fields are an id under /img/, a site path or a full URL. */
export type WorkEntry = {
  slug: string;
  name: string;
  category: string;
  service: string;
  year: string;
  img: string;
  overview: string;
  challenge: string;
  results: string;
  conclusion: string;
  duo: string[];
  wide: string;
  serviceSlugs: string[];
  ageGate: boolean;
};

/** The tuple the cards and the grid render. */
export const workTuple = (w: WorkEntry): Work => [w.slug, w.name, w.category, w.service, w.year, w.img, ""];

/** Open Graph image: shipped images go through /og, uploads are used as they are. */
export const shareFor = (src: string) => (src.startsWith("/img/") ? shareImg(src.slice(5)) : /^(\/|https?:)/.test(src) ? src : shareImg(src));

/** Absolute URL for structured data and sitemaps. */
export const absImg = (src: string) => (/^https?:/.test(src) ? src : src.startsWith("/") ? abs(src) : abs(`/img/${src}`));

/** The works that ship with the site (content.json). Used until the admin list has at least one work. */
export const builtInWorks = (): WorkEntry[] =>
  WORKS.map(([slug, name, category, service, year, img]) => {
    const c = CASES[slug];
    return {
      slug, name, category, service, year, img,
      overview: c.overview, challenge: c.challenge, results: c.results, conclusion: c.conclusion, duo: c.duo, wide: c.wide,
      serviceSlugs: Object.entries(SERVICE_WORKS).filter(([, list]) => list.includes(slug)).map(([s]) => s),
      ageGate: slug === "ase",
    };
  });

/** Admin rows with every media reference resolved, in display order. Includes unpublished works. */
export async function listWorkRows() {
  const rows = await db.select().from(works).orderBy(asc(works.sortOrder), asc(works.createdAt));
  const ids = [...new Set(rows.flatMap((r) => [r.cardMediaId, r.wideMediaId, ...r.duoMediaIds]).filter((x): x is string => !!x))];
  const found = ids.length ? await db.select({ id: media.id, url: media.url, alt: media.alt }).from(media).where(inArray(media.id, ids)) : [];
  const byId = new Map(found.map((m) => [m.id, m]));
  return rows.map((r) => ({ ...r, card: byId.get(r.cardMediaId) ?? null, wide: r.wideMediaId ? byId.get(r.wideMediaId) ?? null : null, duo: r.duoMediaIds.map((i) => byId.get(i)).filter((m): m is NonNullable<typeof m> => !!m) }));
}

/** Published works for the public site, in the order set in the admin. */
export const getWorkEntries = cache(async (): Promise<WorkEntry[]> => {
  if (journalSource() === "json") return builtInWorks();
  const rows = await db.select({ n: works.id }).from(works).limit(1);
  if (!rows.length) return builtInWorks();
  const all = await listWorkRows();
  return all
    .filter((r) => r.published && r.card)
    .map((r) => ({
      slug: r.slug, name: r.name, category: r.category, service: r.service, year: r.year, img: r.card!.url,
      overview: r.overview, challenge: r.challenge, results: r.results, conclusion: r.conclusion,
      duo: r.duo.map((m) => m.url), wide: r.wide?.url ?? r.card!.url, serviceSlugs: r.serviceSlugs, ageGate: r.ageGate,
    }));
});

export const getWorkEntry = async (slug: string) => (await getWorkEntries()).find((w) => w.slug === slug) ?? null;

/** Slugs of every published work, for static generation. */
export const getWorkSlugs = async () => (await getWorkEntries()).map((w) => w.slug);
