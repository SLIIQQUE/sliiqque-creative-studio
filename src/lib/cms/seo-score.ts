import nlp from "compromise";
import readability from "text-readability";
import { docToText, headingsOf, linksOf, wordCount } from "./doc";
import type { Doc, FaqItem } from "./types";

export type ScoreItem = { id: string; label: string; weight: number; status: "ok" | "warn" | "bad"; detail: string };
export type ScoreInput = {
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  doc: Doc;
  hasHero: boolean;
  imageAlts: string[];
  /** Used by the AEO and GEO grades. */
  excerpt?: string;
  faq?: FaqItem[];
};
export type Grade = { score: number; items: ScoreItem[] };

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

  return { score: total(items), items };
}

const total = (items: ScoreItem[]) => Math.round(items.reduce((s, it) => s + (it.status === "ok" ? it.weight : it.status === "warn" ? it.weight / 2 : 0), 0));
const sentences = (t: string) => t.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
const QUESTION = /^(what|why|how|when|where|who|which|can|do|does|is|are|should|will|need)\b/i;
const DEFINITION = /\b(is|are|means|refers to|is defined as)\b/i;
const NUMBER = /\b\d[\d,.]*\s?(%|percent|x|k|m|days?|weeks?|months?|years?|hours?|minutes?|seconds?|ads?|videos?|posts?|images?|clients?|brands?)?\b/gi;

/** Shared pieces both answer-engine grades read from. */
function facts(i: ScoreInput) {
  const text = docToText(i.doc);
  const paras = i.doc.content.flatMap((b) => (b.type === "paragraph" && b.content?.length ? [(b.content ?? []).map((n) => (n.type === "text" ? n.text : " ")).join("").trim()] : [])).filter(Boolean);
  const headings = headingsOf(i.doc);
  const links = linksOf(i.doc);
  return {
    text,
    words: wordCount(text),
    paras,
    headings,
    outbound: links.filter((h) => /^https?:/.test(h)).length,
    lists: i.doc.content.filter((b) => b.type === "bulletList" || b.type === "orderedList").length,
    quotes: i.doc.content.filter((b) => b.type === "blockquote").length,
    faq: (i.faq ?? []).filter((f) => f.q.trim() && f.a.trim()),
  };
}

/**
 * 0 to 100 AEO grade (answer engine optimisation): how easily a search answer box or voice assistant can lift a direct
 * answer from the post. Pure and deterministic.
 */
export function aeoScore(i: ScoreInput): Grade {
  const f = facts(i);
  const items: ScoreItem[] = [];
  const add = (id: string, label: string, weight: number, status: ScoreItem["status"], detail: string) => items.push({ id, label, weight, status, detail });

  const lede = f.paras[0] ?? "";
  const lw = wordCount(lede);
  add("a-lede", "Direct answer up top", 16, lw >= 25 && lw <= 70 ? "ok" : lw > 0 ? "warn" : "bad", `Opening paragraph is ${lw} words, aim for 25 to 70 that answer the topic outright`);
  const def = sentences(lede).slice(0, 2).some((x) => DEFINITION.test(x));
  add("a-def", "Plain definition in the opening", 8, def ? "ok" : "warn", def ? "The opening states what the topic is" : "Open with a sentence that says what the topic is or does");
  const qh = f.headings.filter((h) => QUESTION.test(h.text) || h.text.trim().endsWith("?") || nlp(h.text).questions().found).length;
  add("a-qheads", "Question-style subheadings", 14, qh >= 3 ? "ok" : qh >= 1 ? "warn" : "bad", `${qh} subheadings phrased as questions, aim for 3 or more`);
  add("a-faq", "FAQ block", 18, f.faq.length >= 3 ? "ok" : f.faq.length >= 1 ? "warn" : "bad", `${f.faq.length} questions answered, aim for 3 or more`);
  const longAns = f.faq.filter((x) => wordCount(x.a) > 80).length;
  add("a-faq-len", "FAQ answers stay short", 8, !f.faq.length ? "bad" : longAns === 0 ? "ok" : "warn", f.faq.length ? (longAns ? `${longAns} answers run past 80 words, aim for 40 to 60` : "Answers are short enough to quote") : "Add an FAQ first");
  add("a-lists", "Lists for steps and options", 10, f.lists >= 2 ? "ok" : f.lists === 1 ? "warn" : "bad", `${f.lists} lists, aim for 2 or more`);
  const long = f.paras.filter((p) => wordCount(p) > 120).length;
  add("a-short", "Short paragraphs", 6, long === 0 ? "ok" : long <= 2 ? "warn" : "bad", long ? `${long} paragraphs run past 120 words` : "No wall-of-text paragraphs");
  const ex = (i.excerpt ?? "").trim();
  add("a-excerpt", "Summary sentence set", 6, ex.length >= 60 && ex.length <= 200 ? "ok" : ex ? "warn" : "bad", `${ex.length} characters, aim for 60 to 200`);
  const ease = f.words >= 50 ? readability.fleschReadingEase(f.text) : 0;
  add("a-read", "Plain-language readability", 8, !f.words || f.words < 50 ? "bad" : ease >= 60 ? "ok" : ease >= 40 ? "warn" : "bad", f.words < 50 ? "Write at least 50 words first" : `Flesch reading ease ${Math.round(ease)}, aim for 60 or higher`);
  add("a-sections", "Scannable sections", 6, f.headings.length >= 3 && f.words / Math.max(1, f.headings.length) <= 220 ? "ok" : f.headings.length >= 1 ? "warn" : "bad", `${f.headings.length} subheadings across ${f.words} words, aim for a heading every 200 words`);
  return { score: total(items), items };
}

/**
 * 0 to 100 GEO grade (generative engine optimisation): how likely an AI assistant is to trust, quote and cite the post.
 * Rewards specifics, named sources, quotable statements and structured facts. Pure and deterministic.
 */
export function geoScore(i: ScoreInput): Grade {
  const f = facts(i);
  const items: ScoreItem[] = [];
  const add = (id: string, label: string, weight: number, status: ScoreItem["status"], detail: string) => items.push({ id, label, weight, status, detail });

  const doc = nlp(f.text);
  const nums = Math.max((f.text.match(NUMBER) ?? []).filter((n) => /\d/.test(n)).length, doc.numbers().length);
  add("g-stats", "Specific numbers and facts", 18, nums >= 5 ? "ok" : nums >= 2 ? "warn" : "bad", `${nums} figures, aim for 5 or more (prices, timelines, counts)`);
  add("g-sources", "Cited outside sources", 16, f.outbound >= 2 ? "ok" : f.outbound === 1 ? "warn" : "bad", `${f.outbound} outbound links, aim for 2 or more to credible sources`);
  const brand = (f.text.match(/SLIIQQUE/g) ?? []).length;
  add("g-brand", "Brand named in the copy", 10, brand >= 2 ? "ok" : brand === 1 ? "warn" : "bad", `SLIIQQUE named ${brand} times, aim for 2 or more so a citation can credit it`);
  const places = doc.places().length;
  const orgs = doc.organizations().length + doc.people().length;
  const entities = places + orgs + (brand ? 1 : 0);
  add("g-entity", "Named places, people and organisations", 8, places >= 1 && entities >= 3 ? "ok" : entities >= 1 ? "warn" : "bad", `${places} places, ${orgs} people or organisations named, so assistants can place the claims (mention Lagos, Nigeria where it applies)`);
  const quotable = sentences(f.text).filter((x) => { const w = wordCount(x); return w >= 8 && w <= 28 && (/\d/.test(x) || DEFINITION.test(x)); }).length;
  add("g-quotable", "Quotable statements", 14, quotable >= 6 ? "ok" : quotable >= 3 ? "warn" : "bad", `${quotable} short factual sentences, aim for 6 or more`);
  add("g-depth", "Depth", 10, f.words >= 900 ? "ok" : f.words >= 500 ? "warn" : "bad", `${f.words} words, aim for 900 or more`);
  add("g-structure", "Structured sections", 8, f.headings.length >= 4 ? "ok" : f.headings.length >= 2 ? "warn" : "bad", `${f.headings.length} subheadings, aim for 4 or more`);
  add("g-faq", "FAQ markup", 8, f.faq.length >= 3 ? "ok" : f.faq.length >= 1 ? "warn" : "bad", `${f.faq.length} FAQ entries become structured data`);
  add("g-quote", "Expert voice or pull quote", 4, f.quotes >= 1 ? "ok" : "warn", f.quotes ? "Has a quoted passage" : "A pull quote or named expert line adds authority");
  const vague = (f.text.match(/\b(best in class|world[- ]class|cutting[- ]edge|state[- ]of[- ]the[- ]art|revolutionary|game[- ]chang\w+|synerg\w+)\b/gi) ?? []).length;
  add("g-fluff", "Free of vague hype", 4, vague === 0 ? "ok" : "warn", vague ? `${vague} hype phrases, replace them with concrete claims` : "No empty superlatives");
  return { score: total(items), items };
}
