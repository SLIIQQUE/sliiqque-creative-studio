import type { MetadataRoute } from "next";
import { SERVICE_PAGES } from "@/data/services";
import { LEGAL, WORKS } from "@/lib/data"; // BLOGS is unused while the journal route is commented out
import { CONTENT_UPDATED, isoDate, SITE_URL } from "@/lib/seo";

const LEGAL_PATHS = { "/terms": 1, "/policies": 1, "/privacy": 1 };

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date(CONTENT_UPDATED);
  const legal = (slug: string) => new Date(isoDate(LEGAL[slug as keyof typeof LEGAL].effective));
  const top: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["", 1, "weekly"], ["/services", 0.9, "monthly"], ["/works", 0.8, "monthly"], ["/about", 0.7, "monthly"],
    ["/faq", 0.8, "monthly"], /* ["/blogs", 0.7, "weekly"], */ ["/contact", 0.8, "yearly"],
    ["/terms", 0.3, "yearly"], ["/policies", 0.4, "yearly"], ["/privacy", 0.3, "yearly"],
  ];
  return [
    ...top.map(([p, priority, changeFrequency]) => ({ url: SITE_URL + p, lastModified: p in LEGAL_PATHS ? legal(p.slice(1)) : updated, changeFrequency, priority })),
    ...SERVICE_PAGES.map((s) => ({ url: `${SITE_URL}/services/${s.slug}`, lastModified: updated, changeFrequency: "monthly" as const, priority: 0.9 })),
    ...WORKS.map((w) => ({ url: `${SITE_URL}/works/${w[0]}`, lastModified: updated, changeFrequency: "monthly" as const, priority: 0.6 })),
    // Journal is temporarily disabled; uncomment to restore blog posts in the sitemap.
    // ...BLOGS.map((b) => ({ url: `${SITE_URL}/blogs/${b[0]}`, lastModified: new Date(isoDate(b[1])), changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
