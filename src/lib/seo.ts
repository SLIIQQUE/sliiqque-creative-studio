import type { Metadata } from "next";

export const SITE_URL = "https://sliiqque.space";
export const SITE_NAME = "SLIIQQUE Studio";
export const BRAND_DESC =
  "SLIIQQUE Studio is a premium creative studio in Lagos, Nigeria producing AI commercials, AI UGC and digital humans, AI product photography, AI fashion imagery, brand launches and visual campaigns for brands in Nigeria, Africa and worldwide.";

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

type Opts = { title: string; description: string; path: string; keywords?: string[]; type?: "website" | "article"; absoluteTitle?: boolean; published?: string; noindex?: boolean };

/** One place that builds title, description, canonical, Open Graph and Twitter metadata for a page. */
export function pageMeta({ title, description, path, keywords = [], type = "website", absoluteTitle = false, published, noindex = false }: Opts): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: [...keywords, ...KEYWORDS.slice(0, 8)],
    alternates: { canonical: abs(path) },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: { type, url: abs(path), siteName: SITE_NAME, title: fullTitle, description, locale: "en_NG", ...(published ? { publishedTime: published } : {}) },
    twitter: { card: "summary_large_image", title: fullTitle, description, site: "@sliiqque", creator: "@sliiqque" },
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
    sameAs: ["https://x.com/sliiqque", "https://www.linkedin.com/company/sliiqque", "https://www.instagram.com/sliiqque"],
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
