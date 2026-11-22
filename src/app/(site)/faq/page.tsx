import FaqList from "@/components/FaqList";
import JsonLd from "@/components/JsonLd";
import { PageHero } from "@/components/ui";
import { SITE_FAQ, withWorkNames } from "@/data/services";
import { getWorkFacts } from "@/lib/site-facts";
import { breadcrumbSchema, CONTENT_UPDATED, faqSchema, pageMeta, shareImg } from "@/lib/seo";

export const metadata = pageMeta({
  title: "FAQ: AI Ads, UGC, Digital Humans, Pricing",
  description:
    "What AI commercials, AI UGC and digital humans are, what they cost in naira and USD, turnaround, revisions, usage rights, logos and AI disclosure.",
  path: "/faq",
  keywords: ["how much does an AI commercial cost in Nigeria", "what is AI UGC", "what is a digital human", "AI ads pricing Nigeria"],
  image: { url: shareImg("digital-human-woman-lifestyle.jpg"), alt: "SLIIQQUE Studio: AI-produced photorealistic lifestyle visual" },
});

const BREADCRUMB = [{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }];

export default async function FaqPage() {
  const facts = await getWorkFacts();
  const faqs = withWorkNames(SITE_FAQ, facts.namesList, facts.count);
  return (
    <>
      <JsonLd data={[faqSchema(faqs), breadcrumbSchema(BREADCRUMB)]} />
      <PageHero h1="faq" sub="Straight answers on what SLIIQQUE makes, what it costs, how long it takes and who owns the work." className="page-hero--legal page-hero--flush" breadcrumb={BREADCRUMB} />
      <FaqList faqs={faqs} title="frequently asked questions" id="faq" updated={CONTENT_UPDATED} />
    </>
  );
}
