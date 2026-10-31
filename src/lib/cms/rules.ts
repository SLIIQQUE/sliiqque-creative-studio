/**
 * Studio writing rules as data, in one place. Sources: CLAUDE.md, RULES.md and the content system template
 * (guardrails and safe-claims table). Edit the rules here, not in the checks.
 */

/** The em dash (U+2014), built from its code point so the character never appears in source. */
export const EM_DASH = new RegExp(String.fromCharCode(0x2014));

/** A parenthetical list of company aliases after the name, e.g. SLIIQQUE ("we", "us"). */
export const ALIAS_DEFINITION = /SLIIQQUE\s*\(\s*["“']/;

/** Offering logo creation as a service. Negated sentences ("does not create logos") are allowed. */
export const LOGO_OFFER = /\b(logo design|logo creation|designs? (?:a |your |the )?logos?|creat(?:e|es|ing) (?:a |your |the )?logos?)\b/i;
export const NEGATION_BEFORE = /\b(not|never|no|n't|without|don't|doesn't)\b[^.]{0,40}$/i;

/** Names that must never appear in studio content (day-job products, see CLAUDE.md "BizEdge stays out"). */
export const OFF_LIMITS = /\b(bizedge|myedge|torilo)\b/i; // audit-allow: this rule forbids these names

export const BRAND_NAME = "SLIIQQUE";
export const BRAND_VARIANT = /\bsliiqque\b/gi;

export const GUARANTEES: { pattern: RegExp; use: string }[] = [
  { pattern: /\bguarantee[sd]?\b/i, use: "Designed to help products look campaign-ready" },
  { pattern: /\brank (?:#|no\.? ?)?1\b/i, use: "Built to answer what buyers search for" },
  { pattern: /\bgo(?:ing)? viral\b/i, use: "A repeatable format for earning attention" },
  { pattern: /\bcheaper than (?:any|every)\b/i, use: "Can reduce the need for a physical shoot for some projects" },
  { pattern: /\bperfect likeness\b/i, use: "Here is how consistency is managed, and where it still needs checking" },
  { pattern: /\b100% (?:accurate|consistent|safe|results)\b/i, use: "State the limit honestly instead" },
];

/** Prices typed as numbers instead of price tokens. */
export const TYPED_PRICE = /(?:₦|NGN\s?|US?\$|\$)\s?\d[\d,]*/;

export const CONCEPT_LABEL_TEXT = "Concept campaign, not a client project.";
export const CTA_WORDING = "Start a project with SLIIQQUE Studio.";
