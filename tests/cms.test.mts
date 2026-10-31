import assert from "node:assert/strict";
import { test } from "node:test";
import { safeHref, sanitizeDoc, docToText, headingsOf, readingMinutes } from "../src/lib/cms/doc.ts";
import { runChecks, blockers, type CheckInput } from "../src/lib/cms/checks.ts";
import { seoScore } from "../src/lib/cms/seo-score.ts";
import { dateToLagosLocal, lagosLocalToDate } from "../src/lib/cms/dates.ts";
import { resolvePrice } from "../src/lib/cms/prices.ts";
import type { Doc } from "../src/lib/cms/types.ts";

const p = (text: string) => ({ type: "paragraph" as const, content: [{ type: "text" as const, text }] });
const h2 = (text: string) => ({ type: "heading" as const, attrs: { level: 2 as const }, content: [{ type: "text" as const, text }] });
const doc = (...content: Doc["content"]): Doc => ({ type: "doc", content });
const ID = "123e4567-e89b-42d3-a456-426614174000";

const base = (over: Partial<CheckInput> = {}): CheckInput => ({
  title: "How AI commercials are made",
  excerpt: "A plain-language look at how an AI commercial goes from brief to finished spot at the studio.",
  doc: doc(p("Body text."), { type: "serviceCta", attrs: { serviceSlug: "ai-commercials" } }),
  seo: {},
  faq: [],
  isConcept: false,
  hasCategory: true,
  hasService: true,
  hero: { alt: "A product on a table" },
  imageAlts: [],
  ...over,
});

test("safeHref allows http, https, mailto and relative, rejects the rest", () => {
  assert.equal(safeHref("/services"), "/services");
  assert.equal(safeHref("https://example.com/a"), "https://example.com/a");
  assert.equal(safeHref("mailto:hello@example.com"), "mailto:hello@example.com");
  assert.equal(safeHref("javascript:alert(1)"), null);
  assert.equal(safeHref("//evil.example"), null);
  assert.equal(safeHref("data:text/html,x"), null);
});

test("sanitizeDoc drops unknown nodes and script-like input", () => {
  const out = sanitizeDoc({
    type: "doc",
    content: [
      { type: "script", content: [{ type: "text", text: "alert(1)" }] },
      { type: "html", attrs: { html: "<script>alert(1)</script>" } },
      p("<script>alert(1)</script> stays as inert text"),
      { type: "image", attrs: { mediaId: "not-a-uuid" } },
      { type: "image", attrs: { mediaId: ID, caption: "ok" } },
      { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Level one becomes two" }] },
      { type: "paragraph", content: [{ type: "text", text: "link", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }, { type: "bold" }] }] },
    ],
  });
  assert.deepEqual(out.content.map((b) => b.type), ["paragraph", "image", "heading", "paragraph"]);
  const heading = out.content[2];
  assert.equal(heading.type === "heading" && heading.attrs.level, 2);
  const link = out.content[3];
  assert.deepEqual(link.type === "paragraph" && link.content, [{ type: "text", text: "link", marks: [{ type: "bold" }] }]);
});

test("sanitizeDoc never returns an empty document", () => {
  assert.deepEqual(sanitizeDoc(null).content, [{ type: "paragraph" }]);
  assert.deepEqual(sanitizeDoc({ content: "nope" }).content, [{ type: "paragraph" }]);
});

test("docToText, headings and reading time", () => {
  const d = doc(h2("First"), p("one two three"), h2("First"));
  assert.equal(docToText(d), "First\none two three\nFirst");
  assert.deepEqual(headingsOf(d).map((h) => h.id), ["first", "first-1"]);
  assert.equal(readingMinutes("word ".repeat(400)), 2);
  assert.equal(readingMinutes("short"), 1);
});

test("price tokens resolve from the data module", () => {
  assert.match(resolvePrice("starter-retainer"), /150,000/);
  assert.match(resolvePrice("ai-commercial-from"), /350,000/);
  assert.match(resolvePrice("brand-launch"), /900,000/);
});

test("a clean post passes every blocking check", () => {
  assert.deepEqual(blockers(runChecks(base())), []);
});

test("em dash blocks publishing, in any field", () => {
  const dash = String.fromCharCode(0x2014);
  for (const over of [{ title: `A ${dash} B` }, { excerpt: `x ${dash} y`.padEnd(60, "z") }, { doc: doc(p(`body ${dash} text`)) }, { seo: { description: `d ${dash} d` } }]) {
    assert.ok(blockers(runChecks(base(over))).some((c) => c.id === "em-dash"), JSON.stringify(over).slice(0, 40));
  }
});

test("alias definitions, off-limits names and logo offers block", () => {
  assert.ok(blockers(runChecks(base({ doc: doc(p('SLIIQQUE ("we", "us") makes ads.')) }))).some((c) => c.id === "alias"));
  assert.ok(blockers(runChecks(base({ doc: doc(p("Case study from Torilo.")) }))).some((c) => c.id === "off-limits")); // audit-allow: tests the off-limits rule
  assert.ok(blockers(runChecks(base({ doc: doc(p("We offer logo design for new brands.")) }))).some((c) => c.id === "logo"));
  assert.ok(!blockers(runChecks(base({ doc: doc(p("SLIIQQUE does not create logos. Clients supply their own.")) }))).some((c) => c.id === "logo"));
});

test("concept work needs the concept label", () => {
  assert.ok(blockers(runChecks(base({ isConcept: true }))).some((c) => c.id === "concept-label"));
  const ok = base({ isConcept: true, doc: doc({ type: "conceptLabel" }, p("x")) });
  assert.ok(!blockers(runChecks(ok)).some((c) => c.id === "concept-label"));
});

test("hero, alt text, excerpt length, category and service are required", () => {
  const ids = (i: CheckInput) => blockers(runChecks(i)).map((c) => c.id);
  assert.ok(ids(base({ hero: null })).includes("hero"));
  assert.ok(ids(base({ imageAlts: [""] })).includes("image-alt"));
  assert.ok(ids(base({ excerpt: "too short" })).includes("excerpt"));
  assert.ok(ids(base({ hasCategory: false })).includes("category"));
  assert.ok(ids(base({ hasService: false })).includes("service"));
});

test("warnings: guarantees, typed prices, brand name spelling", () => {
  const warn = (i: CheckInput) => runChecks(i).filter((c) => c.severity === "warn" && !c.ok).map((c) => c.id);
  assert.ok(warn(base({ doc: doc(p("We guarantee more sales.")) })).includes("guarantees"));
  assert.ok(warn(base({ doc: doc(p("Starts at ₦350,000 per spot.")) })).includes("typed-price"));
  assert.ok(warn(base({ doc: doc(p("Sliiqque makes ads.")) })).includes("brand-name"));
});

test("seo score rewards a well-built post and penalises an empty one", () => {
  const long = Array.from({ length: 40 }, () => p("AI commercial production starts with a brief and a clear idea of the product. ".repeat(2))).concat();
  const good = seoScore({
    title: "AI commercial production for product brands",
    seoTitle: "AI commercial production for product brands | SLIIQQUE",
    seoDescription: "See how AI commercial production works for product brands, from the first brief to the finished spot, with honest limits.",
    focusKeyword: "AI commercial production",
    doc: doc(p("AI commercial production starts with a brief."), h2("How AI commercial production works"), h2("Costs"), h2("Limits"), p("See the [pricing](/pricing) page."), ...long,
      { type: "paragraph", content: [{ type: "text", text: "link", marks: [{ type: "link", attrs: { href: "/pricing" } }] }, { type: "text", text: " and ext", marks: [{ type: "link", attrs: { href: "https://example.com" } }] }] }),
    hasHero: true,
    imageAlts: ["alt"],
  });
  const empty = seoScore({ title: "", doc: doc({ type: "paragraph" }), hasHero: false, imageAlts: [] });
  assert.ok(good.score > 80, `good scored ${good.score}`);
  assert.ok(empty.score < 20, `empty scored ${empty.score}`);
});

test("lagos time conversion round trips and is UTC+1", () => {
  const d = lagosLocalToDate("2026-11-05T09:30");
  assert.equal(d?.toISOString(), "2026-11-05T08:30:00.000Z");
  assert.equal(dateToLagosLocal(d), "2026-11-05T09:30");
  assert.equal(lagosLocalToDate("nonsense"), null);
});
