import { getFeedItems } from "@/lib/journal";
import { abs, BRAND_DESC, FEED_PATH, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS 2.0 feed of the journal, newest first, so readers and AI crawlers can follow new posts. */
export async function GET() {
  const posts = await getFeedItems();
  const items = posts.map((b) => {
    const url = abs(`/blogs/${b.slug}`);
    return [
      "<item>",
      `<title>${esc(b.title.replace(/\.$/, ""))}</title>`,
      `<link>${url}</link>`,
      `<guid isPermaLink="true">${url}</guid>`,
      `<pubDate>${new Date(b.iso).toUTCString()}</pubDate>`,
      `<category>${esc(b.category)}</category>`,
      `<description>${esc(b.description)}</description>`,
      "</item>",
    ].join("");
  });
  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>`,
    `<title>${esc(SITE_NAME)} journal</title>`,
    `<link>${abs("/blogs")}</link>`,
    `<atom:link href="${abs(FEED_PATH)}" rel="self" type="application/rss+xml"/>`,
    `<description>${esc(BRAND_DESC)}</description>`,
    `<language>en-ng</language>`,
    ...items,
    `</channel></rss>`,
  ].join("");
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
