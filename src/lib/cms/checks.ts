import { docToText, linksOf } from "./doc";
import { ALIAS_DEFINITION, BRAND_NAME, BRAND_VARIANT, EM_DASH, GUARANTEES, LOGO_OFFER, NEGATION_BEFORE, OFF_LIMITS, TYPED_PRICE } from "./rules";
import type { Doc, FaqItem, SeoFields } from "./types";

export type Severity = "block" | "warn";
export type CheckResult = { id: string; severity: Severity; ok: boolean; message: string };

export type CheckInput = {
  title: string;
  excerpt: string;
  doc: Doc;
  seo: SeoFields;
  faq: FaqItem[];
  isConcept: boolean;
  hasCategory: boolean;
  hasService: boolean;
  hero: { alt: string } | null;
  /** Alt text of every library image used in the body. */
  imageAlts: string[];
};

/** Every piece of text an author controls, with a label for messages. */
function fields(i: CheckInput): [label: string, text: string][] {
  return [
    ["title", i.title],
    ["excerpt", i.excerpt],
    ["body", docToText(i.doc)],
    ["SEO title", i.seo.title ?? ""],
    ["SEO description", i.seo.description ?? ""],
    ["FAQ", i.faq.map((f) => `${f.q} ${f.a}`).join(" ")],
    ["hero alt text", i.hero?.alt ?? ""],
    ["image alt text", i.imageAlts.join(" ")],
  ];
}

const where = (hits: string[]) => hits.join(", ");

export function runChecks(i: CheckInput): CheckResult[] {
  const all = fields(i);
  const results: CheckResult[] = [];
  const add = (id: string, severity: Severity, ok: boolean, message: string) => results.push({ id, severity, ok, message });

  const dashHits = all.filter(([, t]) => EM_DASH.test(t)).map(([l]) => l);
  add("em-dash", "block", dashHits.length === 0, dashHits.length ? `Em dash found in ${where(dashHits)}. Use a comma, colon, period, brackets or a spaced hyphen.` : "No em dashes");

  const aliasHits = all.filter(([, t]) => ALIAS_DEFINITION.test(t)).map(([l]) => l);
  add("alias", "block", aliasHits.length === 0, aliasHits.length ? `Company alias definition found in ${where(aliasHits)}. Write SLIIQQUE, never SLIIQQUE ("we", "us").` : "No alias definitions");

  const offHits = all.filter(([, t]) => OFF_LIMITS.test(t)).map(([l]) => l);
  add("off-limits", "block", offHits.length === 0, offHits.length ? `Off-limits name found in ${where(offHits)}.` : "No off-limits names");

  const logoHits = all
    .filter(([, t]) => {
      const m = LOGO_OFFER.exec(t);
      return m ? !NEGATION_BEFORE.test(t.slice(0, m.index)) : false;
    })
    .map(([l]) => l);
  add("logo", "block", logoHits.length === 0, logoHits.length ? `Logo creation appears to be offered in ${where(logoHits)}. SLIIQQUE does not create logos.` : "No logo creation offered");

  add("hero", "block", !!i.hero, i.hero ? "Hero image set" : "Add a hero image");
  add("hero-alt", "block", !i.hero || i.hero.alt.trim().length > 0, "The hero image needs alt text");
  add("image-alt", "block", i.imageAlts.every((a) => a.trim().length > 0), "Every image in the body needs alt text");
  const len = i.excerpt.trim().length;
  add("excerpt", "block", len >= 50 && len <= 160, `Excerpt is ${len} characters, it should be 50 to 160`);
  add("category", "block", i.hasCategory, i.hasCategory ? "Category set" : "Choose a category");
  add("service", "block", i.hasService, i.hasService ? "Linked to a service page" : "Link the post to a service (set a category or a service override)");

  const hasLabel = i.doc.content.some((b) => b.type === "conceptLabel");
  add("concept-label", "block", !i.isConcept || hasLabel, i.isConcept ? (hasLabel ? "Concept label present" : "This is concept work: add the concept label block") : "Not concept work");

  const guaranteeHits = GUARANTEES.flatMap((g) => all.filter(([, t]) => g.pattern.test(t)).map(([l]) => `${l} (try: "${g.use}")`));
  add("guarantees", "warn", guaranteeHits.length === 0, guaranteeHits.length ? `Guarantee language: ${where(guaranteeHits)}` : "No guarantee language");

  const body = all.find(([l]) => l === "body")?.[1] ?? "";
  add("typed-price", "warn", !TYPED_PRICE.test(body), TYPED_PRICE.test(body) ? "A price is typed into the body. Use a price token so it stays in step with the rate card." : "No typed prices");

  const variantHits = all.filter(([, t]) => [...t.matchAll(BRAND_VARIANT)].some((m) => m[0] !== BRAND_NAME)).map(([l]) => l);
  add("brand-name", "warn", variantHits.length === 0, variantHits.length ? `Write the name as ${BRAND_NAME} in ${where(variantHits)}` : "Brand name spelled correctly");

  add("seo-title", "warn", (i.seo.title ?? i.title).length <= 60, "SEO title is over 60 characters");
  add("seo-description", "warn", !i.seo.description || i.seo.description.length <= 155, "SEO description is over 155 characters");
  add("internal-links", "warn", linksOf(i.doc).some((h) => h.startsWith("/")), "Add at least one link to another page on the site");

  return results;
}

export const blockers = (r: CheckResult[]) => r.filter((c) => c.severity === "block" && !c.ok);
export const warnings = (r: CheckResult[]) => r.filter((c) => c.severity === "warn" && !c.ok);
