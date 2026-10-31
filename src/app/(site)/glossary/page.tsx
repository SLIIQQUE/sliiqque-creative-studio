import FaqList from "@/components/FaqList";
import JsonLd from "@/components/JsonLd";
import { PageHero } from "@/components/ui";
import { GLOSSARY } from "@/data/glossary";
import { breadcrumbSchema, CONTENT_UPDATED, glossarySchema, pageMeta, shareImg } from "@/lib/seo";

export const metadata = pageMeta({
  title: "AI Production Glossary: Key Terms",
  description:
    "Plain-English definitions of AI commercial, AI UGC, digital human, identity lock, storyboard, grade, cutdown and retainer, as SLIIQQUE uses them.",
  path: "/glossary",
  keywords: ["AI production glossary", "what is identity lock", "what is a digital human", "AI commercial terms"],
  image: { url: shareImg("studio-campaign-systems-moodboard.jpg"), alt: "SLIIQQUE Studio campaign systems moodboard" },
});

const BREADCRUMB = [{ name: "Home", path: "/" }, { name: "Glossary", path: "/glossary" }];

export default function GlossaryPage() {
  const faqs = GLOSSARY.map((t) => ({ q: t.term, a: t.def }));
  return (
    <>
      <JsonLd data={[glossarySchema(GLOSSARY), breadcrumbSchema(BREADCRUMB)]} />
      <PageHero h1="glossary" sub="The AI-production terms used across this site, defined plainly." className="page-hero--legal page-hero--flush" breadcrumb={BREADCRUMB} />
      <FaqList faqs={faqs} title="key terms" id="glossary" updated={CONTENT_UPDATED} />
    </>
  );
}
