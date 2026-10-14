import type { Metadata } from "next";

/** The Creative Studio site lives on its own subdomain; sliiqque.space is a separate site. */
export const SITE_URL = "https://studio.sliiqque.space";
export const SITE_NAME = "SLIIQQUE Studio";
export const BRAND_DESC =
  "SLIIQQUE Studio is a premium creative studio in Lagos, Nigeria producing AI commercials, AI UGC and digital humans, AI product photography, AI fashion imagery, brand launches and visual campaigns for brands in Nigeria, Africa and worldwide.";

/** SLIIQQUE's other division: product engineering (websites, AI bots/agents, SaaS interfaces, automation), a separate codebase hosted at the root domain. Mirrors the `creativeStudio` sister-studio entry on that site. */
export const PRODUCT_ENGINEERING = {
  name: "SLIIQQUE Product & Engineering",
  url: "https://sliiqque.space",
  description:
    "The product-engineering vertical of the SLIIQQUE ecosystem: websites, AI bots and agents, SaaS interfaces and workflow automation for businesses in Nigeria and worldwide.",
};

/** Core keyword themes (used in meta keywords, llms.txt and the SEO plan). Natural phrases only, never hidden text. */
export const KEYWORDS = [
  "AI creative studio Lagos",
  "AI commercial production Nigeria",
  "AI video ads agency Lagos",
  "AI UGC ads Nigeria",
  "AI UGC creator",
  "digital humans for advertising",
  "AI avatar spokesperson ads",
  "AI product photography Lagos",
  "AI product photos for e-commerce",
  "AI lifestyle photography",
  "AI photoshoot for brands",
  "AI brand launch campaign",
  "visual campaign production Africa",
  "product cinematography Lagos",
  "short-form video ads Nigeria",
  "TikTok ads UGC",
  "Instagram Reels ads production",
  "Meta ads creative studio",
  "creative studio Lagos",
  "creative agency Nigeria",
  "AI advertising studio Africa",
  "AI-generated commercials",
  "AI fashion imagery",
  "AI fashion photography Nigeria",
  "AI models for clothing brands",
  "AI lookbook",
  "SLIIQQUE",
];

export const abs = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

/** Date the site content last changed (sitemap lastModified). Bump it when copy changes; a build alone is not a change. */
export const CONTENT_UPDATED = "2026-10-14";

/** Social preview for a public/img asset, resized by the image optimizer (1200px is one of its widths, 90 its only quality). */
export const shareImg = (id: string) => `/_next/image?url=${encodeURIComponent(`/img/${id}`)}&w=1200&q=90`;

const DEFAULT_SHARE = { url: "/opengraph-image", width: 1200, height: 630, alt: "SLIIQQUE Studio: premium creative studio powered by AI" };

type Opts = { title: string; description: string; path: string; keywords?: string[]; type?: "website" | "article"; absoluteTitle?: boolean; published?: string; noindex?: boolean; image?: { url: string; alt: string } };

/** One place that builds title, description, canonical, Open Graph and Twitter metadata for a page. */
export function pageMeta({ title, description, path, keywords = [], type = "website", absoluteTitle = false, published, noindex = false, image }: Opts): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  // A page-level openGraph replaces the root one, file-based opengraph-image included, so every page names its image.
  const images = [image ?? DEFAULT_SHARE];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: [...keywords, ...KEYWORDS.slice(0, 8)],
    alternates: { canonical: abs(path) },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: { type, url: abs(path), siteName: SITE_NAME, title: fullTitle, description, locale: "en_NG", images, ...(published ? { publishedTime: published } : {}) },
    twitter: { card: "summary_large_image", title: fullTitle, description, images },
  };
}

/** "Oct 2, 2026" -> "2026-10-02" */
export function isoDate(label: string): string {
  const d = new Date(`${label} UTC`);
  return isNaN(d.getTime()) ? "2026-10-01" : d.toISOString().slice(0, 10);
}

export const ORG_ID = `${SITE_URL}/#organization`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "Organization"],
    "@id": ORG_ID,
    name: SITE_NAME,
    alternateName: ["SLIIQQUE", "SLIIQQUE Creative Studio"],
    url: SITE_URL,
    logo: `${SITE_URL}/brand/sliiqque-mark.png`,
    image: `${SITE_URL}/opengraph-image`,
    description: BRAND_DESC,
    slogan: "Premium creative studio powered by AI",
    foundingDate: "2025-12-22",
    founder: { "@type": "Person", name: "Gabriel Njoabozia", jobTitle: "Founder" },
    email: "hello@sliiqque.space",
    telephone: "+2347041000085",
    address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" },
    areaServed: [{ "@type": "Country", name: "Nigeria" }, { "@type": "Continent", name: "Africa" }, "Worldwide"],
    knowsAbout: [
      "AI commercials", "AI UGC", "digital humans", "AI product photography", "brand launches", "visual campaigns",
      "product cinematography", "short-form video advertising", "AI-generated imagery", "creative direction",
    ],
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" }],
    contactPoint: [{ "@type": "ContactPoint", contactType: "customer service", email: "hello@sliiqque.space", telephone: "+2347041000085", areaServed: ["NG", "Worldwide"], availableLanguage: ["English"] }],
    sameAs: ["https://www.instagram.com/sliiqque", "https://www.youtube.com/@sliiqque", "https://www.facebook.com/sliiqque", PRODUCT_ENGINEERING.url],
  };
}

export function websiteSchema() {
  return { "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, inLanguage: "en", publisher: { "@id": ORG_ID } };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
