import "server-only";
import { revalidatePath } from "next/cache";

/**
 * Public pages derive counts, names, images and links from admin content (works, hero reel, videos, journal, media,
 * categories), so a change refreshes every page instead of a hand-picked list that can fall behind.
 * The explicit sitemap and llms paths are listed too, because they are route handlers.
 */
export function revalidateSite(): void {
  revalidatePath("/", "layout");
  for (const p of ["/sitemap.xml", "/video-sitemap.xml", "/llms.txt", "/llms-full.txt", "/feed.xml"]) revalidatePath(p);
}
