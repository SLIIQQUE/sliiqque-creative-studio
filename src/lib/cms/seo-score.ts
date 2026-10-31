import { docToText, headingsOf, linksOf, wordCount } from "./doc";
import type { Doc } from "./types";

export type ScoreItem = { id: string; label: string; weight: number; status: "ok" | "warn" | "bad"; detail: string };
export type ScoreInput = {
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  doc: Doc;
  hasHero: boolean;
  imageAlts: string[];
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
const has = (haystack: string, needle: string) => needle.length > 0 && ` ${norm(haystack)} `.includes(` ${needle} `);

/** 0 to 100 SEO grade for the editor. Pure and deterministic. The focus keyphrase is editor-only and never rendered publicly. */
export function seoScore(i: ScoreInput): { score: number; items: ScoreItem[] } {
  const key = norm(i.focusKeyword ?? "");
  const text = docToText(i.doc);
  const words = wordCount(text);
  const firstPara = (() => {
    const p = i.doc.content.find((b) => b.type === "paragraph" && b.content?.length);
    return p && p.type === "paragraph" ? (p.content ?? []).map((n) => (n.type === "text" ? n.text : " ")).join("") : "";
  })();
  const headings = headingsOf(i.doc);
  const links = linksOf(i.doc);
  const internal = links.filter((h) => h.startsWith("/")).length;
  const outbound = links.filter((h) => /^https?:/.test(h)).length;
  const seoTitle = i.seoTitle?.trim() || i.title.trim();
  const description = i.seoDescription?.trim() ?? "";
  const density = key && words ? ((norm(text).split(key).length - 1) * key.split(" ").length) / words : 0;

  const items: ScoreItem[] = [];
  const add = (id: string, label: string, weight: number, status: ScoreItem["status"], detail: string) => items.push({ id, label, weight, status, detail });
  const need = (ok: boolean, label: string, id: string, weight: number, detail: string) => add(id, label, weight, !key ? "bad" : ok ? "ok" : "bad", !key ? "Set a focus keyphrase first" : detail);

  add("keyphrase", "Focus keyphrase set", 5, key ? "ok" : "bad", key ? "Set" : "Add one focus keyphrase for this post");
  need(has(seoTitle, key), "Keyphrase in the title", "kw-title", 10, "Use the keyphrase in the SEO title");
  need(has(description, key), "Keyphrase in the description", "kw-desc", 10, "Use the keyphrase in the meta description");
  need(has(firstPara, key), "Keyphrase in the first paragraph", "kw-intro", 10, "Mention the keyphrase in the opening paragraph");
  need(headings.some((h) => has(h.text, key)), "Keyphrase in a subheading", "kw-heading", 8, "Use the keyphrase in at least one H2 or H3");
  const tl = seoTitle.length;
  add("title-len", "SEO title length", 8, tl >= 30 && tl <= 60 ? "ok" : tl > 0 ? "warn" : "bad", `${tl} characters, aim for 30 to 60`);
  const dl = description.length;
  add("desc-len", "Meta description length", 8, dl >= 120 && dl <= 155 ? "ok" : dl > 0 ? "warn" : "bad", `${dl} characters, aim for 120 to 155`);
  add("words", "Length", 10, words >= 600 ? "ok" : words >= 300 ? "warn" : "bad", `${words} words, aim for 600 or more`);
  add("headings", "Subheadings", 6, headings.length >= 3 ? "ok" : headings.length >= 1 ? "warn" : "bad", `${headings.length} subheadings, aim for 3 or more`);
  add("alt", "Image alt text", 6, i.imageAlts.every((a) => a.trim()) ? "ok" : "bad", i.imageAlts.every((a) => a.trim()) ? "All images described" : "Some images have no alt text");
  add("internal", "Internal links", 7, internal >= 1 ? "ok" : "bad", `${internal} internal links`);
  add("outbound", "Outbound links", 5, outbound >= 1 ? "ok" : "warn", `${outbound} outbound links`);
  add("hero", "Hero image", 4, i.hasHero ? "ok" : "bad", i.hasHero ? "Set" : "Add a hero image");
  add("density", "Keyphrase density", 3, !key ? "bad" : density >= 0.005 && density <= 0.025 ? "ok" : "warn", key ? `${(density * 100).toFixed(1)}%, aim for 0.5% to 2.5%` : "Set a focus keyphrase first");

  const score = Math.round(items.reduce((s, it) => s + (it.status === "ok" ? it.weight : it.status === "warn" ? it.weight / 2 : 0), 0));
  return { score, items };
}
