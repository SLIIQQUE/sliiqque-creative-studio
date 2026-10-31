import type { MetadataRoute } from "next";
import { SERVICE_PAGES } from "@/data/services";
import { CASES, HERO, LEGAL, WORKS } from "@/lib/data";
import { getJournalCards, getSitemapPosts } from "@/lib/journal";
import { abs, CONTENT_UPDATED, isoDate, SITE_URL } from "@/lib/seo";

const LEGAL_PATHS = { "/terms": 1, "/policies": 1, "/privacy": 1 };

const img = (id: string) => abs(`/img/${id}`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { cards } = await getJournalCards();
  const journalPosts = await getSitemapPosts();
  const updated = new Date(CONTENT_UPDATED);
  const legal = (slug: string) => new Date(isoDate(LEGAL[slug as keyof typeof LEGAL].effective));
  // Google's image sitemap extension: surfaces the studio's visuals directly in Image Search and AI crawls.
  const IMAGES: Record<string, string[]> = {
    "": HERO.ticker.map(img),
    "/works": WORKS.map((w) => img(w[5])),
    "/blogs": cards.map((b) => (/^(\/|https?:)/.test(b[4]) ? (b[4].startsWith("/") ? abs(b[4]) : b[4]) : img(b[4]))),
  };
  const top: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["", 1, "weekly"], ["/services", 0.9, "monthly"], ["/pricing", 0.9, "monthly"], ["/works", 0.8, "monthly"], ["/about", 0.7, "monthly"],
    ["/faq", 0.8, "monthly"], ["/glossary", 0.5, "monthly"], ["/blogs", 0.7, "weekly"], ["/contact", 0.8, "yearly"],
    ["/ai-product-photography-lagos", 0.9, "monthly"], ["/ai-commercials-lagos", 0.9, "monthly"], ["/ai-ugc-ads-lagos", 0.9, "monthly"], ["/terms", 0.3, "yearly"], ["/policies", 0.4, "yearly"], ["/privacy", 0.3, "yearly"],
  ];
  return [
    ...top.map(([p, priority, changeFrequency]) => ({
      url: SITE_URL + p,
      lastModified: p in LEGAL_PATHS ? legal(p.slice(1)) : updated,
      changeFrequency,
      priority,
      ...(IMAGES[p] ? { images: IMAGES[p] } : {}),
    })),
    ...SERVICE_PAGES.map((s) => ({
      url: `${SITE_URL}/services/${s.slug}`,
      lastModified: updated,
      changeFrequency: "monthly" as const,
      priority: 0.9,
      ...(s.gallery ? { images: s.gallery.map((g) => img(g.id)) } : {}),
    })),
    ...WORKS.map((w) => {
      const c = CASES[w[0]];
      return {
        url: `${SITE_URL}/works/${w[0]}`,
        lastModified: updated,
        changeFrequency: "monthly" as const,
        priority: 0.6,
        images: [w[5], ...c.duo, c.wide].map(img),
      };
    }),
    ...journalPosts.map((p) => ({
      url: `${SITE_URL}/blogs/${p.slug}`,
      lastModified: p.modified,
      changeFrequency: "yearly" as const,
      priority: 0.6,
      images: p.images.map((u) => (u.startsWith("http") ? u : abs(u))),
    })),
  ];
}
