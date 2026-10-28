import JsonLd from "@/components/JsonLd";
import { abs, breadcrumbSchema, pageMeta, PRODUCT_ENGINEERING, shareImg } from "@/lib/seo";
import LoadMore from "@/components/LoadMore";
import { PageHero } from "@/components/ui";
import { WORKS, WORKS_LISTED } from "@/lib/data";

export const metadata = pageMeta({
  title: "Work: AI Concept Brand Worlds in Lagos",
  description:
    "Concept work by SLIIQQUE: ÀLÀ skincare, ODÈ grooming and ÀSE spirits, with AI commercials and AI photography. Not client work. Start your own.",
  path: "/works",
  keywords: ["AI commercial portfolio", "AI product photography portfolio", "digital humans portfolio", "concept brand work"],
  image: { url: shareImg(WORKS[0][5]), alt: `${WORKS[0][1]}: concept brand visual by SLIIQQUE` },
});

const BREADCRUMB = [{ name: "Home", path: "/" }, { name: "Work", path: "/works" }];

export default function WorksPage() {
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
          <LoadMore
            gridClass="works-grid works-grid--page"
            wrapClass="center-btn"
            cells={WORKS.map((w, i) => ({ kind: "work" as const, item: w, hidden: i >= WORKS_LISTED, phHide: i >= 3 && i < WORKS_LISTED }))}
          />
          <p className="services-note">
            Looking for product work instead? Visit <a href={PRODUCT_ENGINEERING.url} target="_blank" rel="noopener noreferrer">{PRODUCT_ENGINEERING.name} ↗</a> for websites, SaaS interfaces and case studies.
          </p>
        </div>
      </section>
    </>
  );
}
