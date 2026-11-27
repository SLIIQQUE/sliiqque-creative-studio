import "server-only";
import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { videos } from "@/db/schema";
import { VIDEOS } from "@/data/videos";
import { journalSource } from "@/lib/journal";
import { ORG_ID, abs } from "@/lib/seo";

export type VideoItem = {
  youtubeId: string;
  title: string;
  description: string;
  type: string;
  orientation: "landscape" | "portrait";
  /** ISO 8601 duration. */
  duration: string;
  /** ISO date. */
  uploadDate: string;
  pages: string[];
  featured: boolean;
};

/** Published films in the order set in the admin. Without a database, the list in src/data/videos.ts. */
export const getVideos = cache(async (): Promise<VideoItem[]> => {
  if (journalSource() === "json") {
    return VIDEOS.map((v) => ({ ...v, type: "Commercial", orientation: "landscape" as const, featured: false }));
  }
  const rows = await db.select().from(videos).where(eq(videos.published, true)).orderBy(asc(videos.sortOrder), asc(videos.createdAt));
  return rows.map((r) => ({
    youtubeId: r.youtubeId, title: r.title, description: r.description, type: r.type, orientation: r.orientation === "portrait" ? "portrait" : "landscape",
    duration: r.duration, uploadDate: r.uploadDate, pages: r.pages, featured: r.featured,
  }));
});

export const videosForPath = async (path: string) => (await getVideos()).filter((v) => v.pages.includes(path));

/** Admin rows, including hidden films. */
export const listVideoRows = () => db.select().from(videos).orderBy(asc(videos.sortOrder), asc(videos.createdAt));

/** schema.org VideoObject for a film. `pagePath` is the page it is shown on, so each page names itself and not always /videos. */
export const videoSchema = (v: VideoItem, pagePath = "/videos") => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: v.title,
  description: v.description || v.title,
  thumbnailUrl: [`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`],
  uploadDate: v.uploadDate,
  duration: v.duration,
  embedUrl: `https://www.youtube.com/embed/${v.youtubeId}`,
  contentUrl: `https://www.youtube.com/watch?v=${v.youtubeId}`,
  publisher: { "@id": ORG_ID },
  inLanguage: "en-NG",
  url: abs(pagePath),
});
