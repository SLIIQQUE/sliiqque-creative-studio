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

/** Journal feed (RSS 2.0), advertised on every page via <link rel="alternate">. */
export const FEED_PATH = "/feed.xml";

/**
 * Meta description from longer copy: whole sentences up to `max` characters, so a snippet never ends
 * mid-thought. Falls back to a word boundary plus an ellipsis only when no sentence fits.
 */
export function trimDesc(text: string, max = 155): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const closed = (x: string) => (x.match(/[“"]/g) ?? []).length <= (x.match(/[”"]/g) ?? []).length;
  // The last sentence end (a period, ? or !, optionally followed by a closing quote) that leaves no quote open.
  const ends = [...cut.matchAll(/[.?!][”"]?(?=\s)/g)].map((m) => m.index + m[0].length).filter((i) => i >= 80 && closed(cut.slice(0, i)));
  if (ends.length) return cut.slice(0, ends[ends.length - 1]);
  let words = cut.slice(0, cut.lastIndexOf(" "));
  if (!closed(words)) words = words.slice(0, Math.max(words.lastIndexOf("“"), words.lastIndexOf('"')));
  // Never end on a dangling connector such as "and" or "with the".
  words = words.replace(/[\s,;:.-]+$/, "").replace(/(?:\s+(?:and|or|with|the|a|an|of|to|for|in|on|from|that|which|line))+$/i, "");
  return `${words.replace(/[\s,;:.-]+$/, "")}...`;
}

/** Date the site content last changed (sitemap lastModified). Bump it when copy changes; a build alone is not a change. */
export const CONTENT_UPDATED = "2026-10-29";

/**
 * Social preview for a public/img asset. Points at a static, pre-cropped 1200x630 JPEG in
 * public/og (generated with sharp, not resized on request) rather than the /_next/image proxy:
 * some social/link-preview scrapers handle dynamic, query-string image URLs poorly. Regenerate
 * the file in public/og when the source image changes — see the crop script in git history.
 */
export const shareImg = (id: string) => `/og/${id.replace(/\.[a-zA-Z0-9]+$/, "")}.jpg`;

const DEFAULT_SHARE = { url: "/opengraph-image", width: 1200, height: 630, alt: "SLIIQQUE Studio: premium creative studio powered by AI" };

type Opts = { title: string; description: string; path: string; keywords?: string[]; type?: "website" | "article"; absoluteTitle?: boolean; published?: string; noindex?: boolean; image?: { url: string; alt: string } };

/** One place that builds title, description, canonical, Open Graph and Twitter metadata for a page. */
export function pageMeta({ title, description, path, keywords = [], type = "website", absoluteTitle = false, published, noindex = false, image }: Opts): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  // A page-level openGraph replaces the root one, file-based opengraph-image included, so every page names its image.
  // Every image here, static or DEFAULT_SHARE, is exactly 1200x630.
  const images = [{ width: 1200, height: 630, ...(image ?? DEFAULT_SHARE) }];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: [...keywords, ...KEYWORDS.slice(0, 8)],
    // One language and one market, so the self-referencing en-NG entry and x-default state that plainly.
    alternates: { canonical: abs(path), languages: { "en-NG": abs(path), "x-default": abs(path) }, types: { "application/rss+xml": FEED_PATH } },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: { type, url: abs(path), siteName: SITE_NAME, title: fullTitle, description, locale: "en_NG", images, ...(published ? { publishedTime: published } : {}) },
    twitter: { card: "summary_large_image", title: fullTitle, description, images },
  };
}

/** "How it gets made" -> "how-it-gets-made". Gives headings stable anchor ids for deep links and citations. */
export const slugify = (text: string) => text.toLowerCase().replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Date the site first went live (first deploy), used as the homepage datePublished. */
export const SITE_LAUNCHED = "2026-10-04";

/** "Oct 2, 2026" -> "2026-10-02" */
export function isoDate(label: string): string {
  const d = new Date(`${label} UTC`);
  return isNaN(d.getTime()) ? "2026-10-01" : d.toISOString().slice(0, 10);
}

/** "2026-10-14" -> "Oct 14, 2026", for visible "last updated" dates. */
export function displayDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export const ORG_ID = `${SITE_URL}/#organization`;

/** Same @id as the Person node on the product-engineering site (sliiqque.space/studio/#person),
 * so the two domains' structured data describe one entity, not two unlinked people. */
export const FOUNDER_ID = `${PRODUCT_ENGINEERING.url}/studio/#person`;

export function founderSchema(extra?: Record<string, unknown>) {
  return {
    "@type": "Person",
    "@id": FOUNDER_ID,
    name: "Gabriel Njoabozia",
    jobTitle: "Founder",
    // Same page the @id points at on sliiqque.space; this site's own profile page is the sameAs entry.
    url: `${PRODUCT_ENGINEERING.url}/studio/`,
    sameAs: [abs("/about"), "https://www.linkedin.com/in/gabriel-njoabozia/", "https://github.com/flawlexsaint"],
    description: "Founder of SLIIQQUE, a creative studio in Lagos, Nigeria producing AI commercials, AI UGC, digital humans and AI product photography.",
    knowsAbout: ["AI commercials", "AI UGC", "digital humans", "AI product photography", "creative direction"],
    image: `${SITE_URL}/brand/gabriel-njoabozia.jpg`,
    ...extra,
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "Organization"],
    "@id": ORG_ID,
    name: SITE_NAME,
    alternateName: ["SLIIQQUE", "SLIIQQUE Creative Studio"],
    url: SITE_URL,
    logo: `${SITE_URL}/brand/sliiqque-logo.png`,
    image: `${SITE_URL}/opengraph-image`,
    description: BRAND_DESC,
    slogan: "Premium creative studio powered by AI",
    foundingDate: "2025-12-22",
    founder: founderSchema({ worksFor: { "@id": ORG_ID } }),
    email: "hello@sliiqque.space",
    telephone: "+2347041000085",
    address: { "@type": "PostalAddress", addressLocality: "Lagos", addressRegion: "Lagos State", addressCountry: "NG" },
    geo: { "@type": "GeoCoordinates", latitude: 6.5244, longitude: 3.3792 },
    priceRange: "From ₦75,000",
    areaServed: [{ "@type": "City", name: "Lagos" }, { "@type": "Country", name: "Nigeria" }, { "@type": "Continent", name: "Africa" }, "Worldwide"],
    knowsAbout: [
      "AI commercials", "AI UGC", "digital humans", "AI product photography", "brand launches", "visual campaigns",
      "product cinematography", "short-form video advertising", "AI-generated imagery", "creative direction",
    ],
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" }],
    contactPoint: [{ "@type": "ContactPoint", contactType: "customer service", email: "hello@sliiqque.space", telephone: "+2347041000085", areaServed: ["NG", "Worldwide"], availableLanguage: ["English"] }],
    sameAs: ["https://www.instagram.com/sliiqque", "https://www.youtube.com/@sliiqque", "https://facebook.com/studio.sliiqque/", PRODUCT_ENGINEERING.url],
  };
}

export function websiteSchema() {
  return { "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, inLanguage: "en-NG", description: BRAND_DESC, publisher: { "@id": ORG_ID } };
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

/** For the glossary: a defined-term list, not a FAQPage, so it matches what the content actually is. */
export function glossarySchema(terms: { term: string; def: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "SLIIQQUE AI production glossary",
    url: abs("/glossary"),
    hasDefinedTerm: terms.map((t) => ({ "@type": "DefinedTerm", name: t.term, description: t.def, inDefinedTermSet: abs("/glossary") })),
  };
}
