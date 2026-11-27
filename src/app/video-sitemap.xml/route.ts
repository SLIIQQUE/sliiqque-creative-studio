import { isoToSeconds } from "@/lib/video-utils";
import { abs } from "@/lib/seo";
import { getVideos, type VideoItem } from "@/lib/videos";

// Built on every request for the same reason as sitemap.xml: a cached copy was not refreshed after a publish.
export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** Google video sitemap: one <url> per page that shows films, listing every film on it. Built from the admin's videos, so it always matches the site. */
export async function GET() {
  const videos = await getVideos();
  const byPage = new Map<string, VideoItem[]>();
  const add = (path: string, v: VideoItem) => byPage.set(path, [...(byPage.get(path) ?? []), v]);
  const featured = videos.filter((v) => v.featured).slice(0, 3);
  for (const v of videos) for (const path of new Set(["/videos", ...v.pages])) add(path, v);
  for (const v of featured) add("/", v);

  const entries = [...byPage.entries()].map(([path, list]) => {
    const films = [...new Map(list.map((v) => [v.youtubeId, v])).values()]
      .map((v) => {
        const seconds = isoToSeconds(v.duration);
        return [
          "    <video:video>",
          `      <video:thumbnail_loc>https://i.ytimg.com/vi/${esc(v.youtubeId)}/hqdefault.jpg</video:thumbnail_loc>`,
          `      <video:title>${esc(v.title.slice(0, 100))}</video:title>`,
          `      <video:description>${esc((v.description || v.title).slice(0, 2048))}</video:description>`,
          `      <video:player_loc>https://www.youtube.com/embed/${esc(v.youtubeId)}</video:player_loc>`,
          ...(seconds ? [`      <video:duration>${seconds}</video:duration>`] : []),
          `      <video:publication_date>${esc(v.uploadDate)}</video:publication_date>`,
          "    </video:video>",
        ].join("\n");
      })
      .join("\n");
    return `  <url>\n    <loc>${esc(abs(path))}</loc>\n${films}\n  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${entries.join("\n")}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
