import JsonLd from "@/components/JsonLd";
import { abs, breadcrumbSchema, pageMeta, PRODUCT_ENGINEERING } from "@/lib/seo";
import { WorkCard } from "@/components/cards";
import { PageHero } from "@/components/ui";
import { getWorkEntries, shareFor, workTuple } from "@/lib/works";

export async function generateMetadata() {
  const [first] = await getWorkEntries();
  return pageMeta({
    title: "Work: AI Concept Brand Worlds in Lagos",
    description:
      "Concept work by SLIIQQUE: ÀLÀ skincare, ODÈ grooming and ÀSE spirits, with AI commercials and AI photography. Not client work. Start your own.",
    path: "/works",
    keywords: ["AI commercial portfolio", "AI product photography portfolio", "digital humans portfolio", "concept brand work"],
    ...(first ? { image: { url: shareFor(first.img), alt: `${first.name}: concept brand visual by SLIIQQUE` } } : {}),
  });
}

const BREADCRUMB = [{ name: "Home", path: "/" }, { name: "Work", path: "/works" }];

export default async function WorksPage() {
  const WORKS = (await getWorkEntries()).map(workTuple);
  return (
    <>
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "CollectionPage", name: "SLIIQQUE Studio work", url: abs("/works") },
          { "@context": "https://schema.org", "@type": "ItemList", itemListElement: WORKS.map((w, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/works/${w[0]}`), name: w[1] })) },
          breadcrumbSchema(BREADCRUMB),
        ]}
      />
      <PageHero h1="Our Work" sub="Concept brand worlds, self-initiated studio work, labelled as exactly that." className="page-hero--flush" breadcrumb={BREADCRUMB} />
      <section className="sec sec--works sec--last">
        <div className="container">
          <div className="works-grid works-grid--page">
            {WORKS.map((w) => <WorkCard key={w[0]} w={w} />)}
          </div>
          <p className="services-note">
            Looking for product work instead? Visit <a href={PRODUCT_ENGINEERING.url} target="_blank" rel="noopener noreferrer">{PRODUCT_ENGINEERING.name} ↗</a> for websites, SaaS interfaces and case studies.
          </p>
        </div>
      </section>
    </>
  );
}
