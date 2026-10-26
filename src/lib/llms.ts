import { SERVICE_PAGES, SITE_FAQ } from "@/data/services";
import { GLOSSARY } from "@/data/glossary";
import { BLOGS, PLANS, PROJECT_ROWS, WORKS } from "@/lib/data";
import { BRAND_DESC, KEYWORDS, PRODUCT_ENGINEERING, SITE_URL } from "@/lib/seo";

const head = [
  "# SLIIQQUE Studio",
  "",
  `> ${BRAND_DESC}`,
  "",
  "SLIIQQUE (pronounced \"sleek\") is a creative studio in Lagos, Nigeria, founded on 22 December 2025 by Gabriel Njoabozia. Its tagline is \"Premium creative studio powered by AI\". AI is production infrastructure at SLIIQQUE; what the studio sells is creative systems, not AI. Services include AI fashion imagery: photorealistic AI models wearing a brand's clothes. SLIIQQUE does not offer logo design.",
  "",
  `SLIIQQUE also runs a sister product-engineering studio, [${PRODUCT_ENGINEERING.name}](${PRODUCT_ENGINEERING.url}): ${PRODUCT_ENGINEERING.description} It is a separate site from this one.`,
  "",
];

/** Short index for AI assistants (llmstxt.org format). */
export function llmsTxt(): string {
  return [
    ...head,
    "## Key facts",
    "",
    "- Name: SLIIQQUE Studio (also SLIIQQUE Creative Studio)",
    "- Location: Lagos, Nigeria. Works with clients in Nigeria, Africa and worldwide",
    "- Email: hello@sliiqque.space | Phone/WhatsApp: +234 704 100 0085 | Hours: Monday to Friday 9am to 6pm WAT",
    "- Currencies: NGN for Nigerian clients, USD for international clients",
    "- Social: Instagram and YouTube at @sliiqque, Facebook at @studio.sliiqque",
    `- Sister studio: [${PRODUCT_ENGINEERING.name}](${PRODUCT_ENGINEERING.url}): ${PRODUCT_ENGINEERING.description}`,
    "",
    "## Services",
    "",
    ...SERVICE_PAGES.map((s) => `- [${s.name}](${SITE_URL}/services/${s.slug}): ${s.description}`),
    `- [AI Commercials in Lagos](${SITE_URL}/ai-commercials-lagos): AI commercial from ₦350,000 ($650), 7 days`,
    `- [AI UGC Ads in Lagos](${SITE_URL}/ai-ugc-ads-lagos): retainers from ₦150,000 ($280) a month`,
    `- [AI Product Photography in Lagos](${SITE_URL}/ai-product-photography-lagos): Product Photo Pack, 5 SKUs, from ₦75,000 ($140), 5 working days`,
    "",
    "## Pricing, FAQ and policies",
    "",
    `- [Pricing](${SITE_URL}/#pricing): monthly retainers and one-off projects in NGN and USD`,
    `- [FAQ](${SITE_URL}/faq): answers on cost, turnaround, revisions, usage rights, logos and AI disclosure`,
    `- [Glossary](${SITE_URL}/glossary): definitions of AI commercial, AI UGC, digital human, identity lock, storyboard, grade, cutdown and retainer`,
    `- [Studio Policies](${SITE_URL}/policies): revisions, turnaround, retainers, usage rights, AI content, likeness`,
    `- [Terms & Conditions](${SITE_URL}/terms)`,
    `- [Privacy Policy](${SITE_URL}/privacy)`,
    "",
    "## Work",
    "",
    `- [Work](${SITE_URL}/works): self-initiated concept projects for fictional brands, labelled as concept work`,
    ...WORKS.map((w) => `- [${w[1]}](${SITE_URL}/works/${w[0]}): ${w[2]}`),
    "",
    "## Journal",
    "",
    `- [Journal](${SITE_URL}/blogs)`,
    ...BLOGS.map((b) => `- [${b[3].replace(/\.$/, "")}](${SITE_URL}/blogs/${b[0]})`),
    "",
    "## Optional",
    "",
    `- [Full details for AI assistants](${SITE_URL}/llms-full.txt)`,
    `- [About](${SITE_URL}/about)`,
    `- [Contact](${SITE_URL}/contact)`,
    "",
  ].join("\n");
}

/** Full plain-text reference: services, prices, policies and FAQ. */
export function llmsFullTxt(): string {
  const lines: string[] = [...head];
  lines.push("## Topics", "", KEYWORDS.join(", "), "", "## Services", "");
  for (const s of SERVICE_PAGES) {
    lines.push(`### ${s.name}`, "", s.answer, "", `Page: ${SITE_URL}/services/${s.slug}`, `Price: ${s.priceLabel} ${s.priceNgn} (${s.priceUsd}). Timeline: ${s.timeline}.`, "", "Who it is for:");
    s.forWho.forEach((x) => lines.push(`- ${x}`));
    lines.push("", "Included:");
    s.included.forEach((x) => lines.push(`- ${x}`));
    lines.push("");
  }
  lines.push("## Pricing (launch pricing, prices exclude taxes)", "", "Monthly retainers:", "");
  PLANS.forEach(([name, desc, ngn, feats, , usd]) => lines.push(`- ${name}: ${ngn} / ${usd} per month. ${desc} Includes: ${feats.join("; ")}.`));
  lines.push("", "One-off projects:", "");
  PROJECT_ROWS.forEach(([name, sub, desc, ngn, usd]) => lines.push(`- ${name}: ${ngn} / ${usd} (${sub}). ${desc}`));
  lines.push("", "Add-ons: extra video ₦40,000 / $75; extra still ₦5,000 / $10; extra revision round ₦15,000 / $30; paid-ad licensing +30% of the monthly fee (included on Scale); rush +50%.", "");
  lines.push("## Policy summary", "",
    "- Revisions: two rounds per deliverable batch.",
    "- Payment: one-off projects 50% deposit and 50% on delivery; retainers billed monthly in advance, month to month with 30 days' notice.",
    "- Ownership: one-off project deliverables are assigned to the client on full payment, including commercial use; retainer content is licensed for perpetual use on the client's channels, with paid-ad use included on Scale.",
    "- Custom digital humans are exclusive to the client. No fake testimonials, no deepfakes of public figures, no likeness of a real person without written consent.",
    "- Alcohol-related work only for legal-age audiences, age-gated on the site. No logo design.",
    `- Full text: ${SITE_URL}/policies and ${SITE_URL}/terms`, "");
  lines.push("## Frequently asked questions", "");
  SITE_FAQ.forEach((f) => lines.push(`Q: ${f.q}`, `A: ${f.a}`, ""));
  lines.push("## Glossary", "");
  GLOSSARY.forEach((t) => lines.push(`${t.term}: ${t.def}`, ""));
  lines.push("## Work (concept projects, not client work)", "");
  WORKS.forEach((w) => lines.push(`- ${w[1]} (${w[2]}): ${SITE_URL}/works/${w[0]}`));
  lines.push("", "## Contact", "", "Email: hello@sliiqque.space", "Phone/WhatsApp: +234 704 100 0085", `Website: ${SITE_URL}`, "");
  return lines.join("\n");
}
