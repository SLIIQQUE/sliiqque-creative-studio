import { BLOGS, POSTS } from "@/lib/data";
import { abs, BRAND_DESC, FEED_PATH, isoDate, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS 2.0 feed of the journal, newest first, so readers and AI crawlers can follow new posts. */
export function GET() {
  const posts = [...BLOGS].sort((a, b) => isoDate(b[1]).localeCompare(isoDate(a[1])));
  const items = posts.map((b) => {
    const url = abs(`/blogs/${b[0]}`);
    return [
      "<item>",
      `<title>${esc(b[3].replace(/\.$/, ""))}</title>`,
      `<link>${url}</link>`,
      `<guid isPermaLink="true">${url}</guid>`,
      `<pubDate>${new Date(isoDate(b[1])).toUTCString()}</pubDate>`,
      `<category>${esc(b[2])}</category>`,
      `<description>${esc(POSTS[b[0]].groups[0][1][0][1][0])}</description>`,
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
