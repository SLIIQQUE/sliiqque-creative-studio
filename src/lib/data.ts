import raw from "@/data/content.json";

export type Work = [slug: string, name: string, category: string, service: string, year: string, img: string, alt: string];
export type Blog = [slug: string, date: string, category: string, title: string, img: string];
export type Service = [title: string, desc: string, tags: string[], img: string, alt: string];
export type Plan = [name: string, desc: string, price: string, features: string[], dark: boolean, priceUsd: string];
export type Stat = [n: number, sign: string, caption: string];
export type PostGroup = [heading: string, subs: [string, string[]][]];

export const SITE = raw.SITE as {
  name: string; title: string; email: string; phone: string; hours: string; footer_blurb: string;
  news_blurb: string; copyright: string; social: [string, string][];
};
export const HERO = raw.HERO as { tag: string; sub: string; ticker: string[] };
export const ABOUT = raw.ABOUT as { heading: string; body: string; img: string; stats: Stat[] };
export const WORKS = raw.WORKS as Work[];
export const BLOGS = raw.BLOGS as Blog[];
export const SERVICES = raw.SERVICES as Service[];
export const PLANS = raw.PLANS as Plan[];
export const ABOUT_PAGE = raw.ABOUT_PAGE as {
  hero_h1: string; hero_sub: string; story_img: string; story_label: string; story_h3: string; story_p: string;
  stats: Stat[]; how_intro: string; steps: [string, string][];
  faq_intro: string; faq: [string, string][];
};
export const CONTACT = raw.CONTACT as {
  h2: string; sub: string; groups: [string, string, string][]; types: string[]; budgets: string[];
};
export const NOT_FOUND = raw.NOT_FOUND as { p: string };
export const CASES = raw.CASES as Record<string, { overview: string; duo: string[]; challenge: string; results: string; wide: string; conclusion: string }>;
export const POSTS = raw.POSTS as unknown as Record<string, { groups: PostGroup[]; gallery: string[] }>;

import legalRaw from "@/data/legal.json";
export type LegalBlock = string | string[];
export type LegalDoc = { slug: string; title: string; sub: string; effective: string; version: string; intro: string[]; sections: { h: string; blocks: LegalBlock[] }[] };
export const LEGAL = legalRaw as unknown as Record<"terms" | "policies" | "privacy", LegalDoc>;

export const SECTION_SUB = raw.SECTION_SUB;
export type Row = [title: string, sub: string, desc: string, tag: string];
export type ProjectRow = [title: string, sub: string, desc: string, priceNgn: string, priceUsd: string];
export const PROCESS_ROWS = raw.PROCESS_ROWS as Row[];
export const PROJECT_ROWS = raw.PROJECT_ROWS as ProjectRow[];
export const PROJECTS_INTRO = raw.PROJECTS_INTRO as string;
export const STANDARDS_ROWS = raw.STANDARDS_ROWS as Row[];
export const AWARDS_INTRO = raw.AWARDS_INTRO;
export const PLANS_INTRO = raw.PLANS_INTRO;
export const WORKS_LISTED = raw.WORKS_LISTED;
export const HOME_WORKS = raw.HOME_WORKS;
export const BLOGS_LISTED = raw.BLOGS_LISTED;
