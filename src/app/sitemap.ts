import type { MetadataRoute } from "next";
import { SERVICE_PAGES } from "@/data/services";
import { BLOGS, WORKS } from "@/lib/data";
import { isoDate, SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const top: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["", 1, "weekly"], ["/services", 0.9, "monthly"], ["/works", 0.8, "monthly"], ["/about", 0.7, "monthly"],
    ["/faq", 0.8, "monthly"], ["/blogs", 0.7, "weekly"], ["/contact", 0.8, "yearly"],
    ["/terms", 0.3, "yearly"], ["/policies", 0.4, "yearly"], ["/privacy", 0.3, "yearly"],
  ];
  return [
    ...top.map(([p, priority, changeFrequency]) => ({ url: SITE_URL + p, lastModified: now, changeFrequency, priority })),
    ...SERVICE_PAGES.map((s) => ({ url: `${SITE_URL}/services/${s.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 })),
    ...WORKS.map((w) => ({ url: `${SITE_URL}/works/${w[0]}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...BLOGS.map((b) => ({ url: `${SITE_URL}/blogs/${b[0]}`, lastModified: new Date(isoDate(b[1])), changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
