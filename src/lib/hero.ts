import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { heroFrames, media } from "@/db/schema";
import { HERO } from "@/lib/data";
import { journalSource } from "@/lib/journal";

/** One tile in the homepage reel, ready to render. */
export type HeroFrame = { src: string; alt: string; label: string; href: string };

const PREFIXES: [prefix: string, label: string, alt: string][] = [
  ["digital-human-", "Digital human", "Digital human"],
  ["ala-", "ÀLÀ / Skincare", "ÀLÀ skincare concept"],
  ["ase-", "ÀSE / Spirits", "ÀSE spirits concept"],
  ["ode-", "ODÈ / Grooming", "ODÈ grooming concept"],
  ["fashion-", "Fashion", "AI fashion imagery"],
];

const fileOf = (src: string) => src.split("?")[0].split("/").pop() ?? src;

/** Caption derived from the file name, e.g. "ode-portrait.jpg" -> "ODÈ / Grooming". */
export function frameLabel(src: string) {
  const f = fileOf(src);
  return PREFIXES.find(([p]) => f.startsWith(p))?.[1] ?? "Studio frame";
}

/** Descriptive alt text from the file name, e.g. "ode-beard-macro.jpg" -> "ODÈ grooming concept: beard macro". */
export function frameAlt(src: string) {
  const f = fileOf(src);
  const [prefix, , label] = PREFIXES.find(([p]) => f.startsWith(p)) ?? ["", "", "SLIIQQUE Studio frame"];
  const detail = f.replace(/\.[a-z]+$/, "").slice(prefix.length).replace(/-\d+$/, "").replace(/-/g, " ");
  return detail ? `${label}: ${detail}` : label;
}

/** Link derived from the file name: concept frames open their case, everything else opens a service. */
export function frameHref(src: string) {
  const f = fileOf(src);
  if (f.includes("ala")) return "/works/ala-skin";
  if (f.includes("ase")) return "/works/ase";
  if (f.includes("ode")) return "/works/ode";
  if (f.startsWith("fashion")) return "/services/ai-fashion-imagery";
  return "/services/ai-ugc-digital-humans";
}

/** The frames that ship with the site (content.json). Used until the admin list has at least one frame. */
export const builtInFrames = (): HeroFrame[] =>
  HERO.ticker.map((id) => ({ src: `/img/${id}`, alt: frameAlt(id), label: frameLabel(id), href: frameHref(id) }));

/** Frames for the homepage reel, in the order set in the admin. */
export async function getHeroFrames(): Promise<HeroFrame[]> {
  if (journalSource() === "json") return builtInFrames();
  const rows = await listHeroRows();
  if (!rows.length) return builtInFrames();
  return rows.map((r) => ({ src: r.url, alt: r.alt, label: r.label || frameLabel(r.url), href: r.href || frameHref(r.url) }));
}

/** Raw rows for the admin page, in display order. */
export const listHeroRows = () =>
  db
    .select({ id: heroFrames.id, mediaId: heroFrames.mediaId, label: heroFrames.label, href: heroFrames.href, sortOrder: heroFrames.sortOrder, url: media.url, alt: media.alt })
    .from(heroFrames)
    .innerJoin(media, eq(media.id, heroFrames.mediaId))
    .orderBy(asc(heroFrames.sortOrder), asc(heroFrames.createdAt));
