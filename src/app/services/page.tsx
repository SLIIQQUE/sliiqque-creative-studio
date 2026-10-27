import Link from "next/link";
import Img from "@/components/Img";
import JsonLd from "@/components/JsonLd";
import { IconArrow } from "@/components/icons";
import Reveal from "@/components/Reveal";
import { Btn, PageHero } from "@/components/ui";
import { SERVICE_PAGES } from "@/data/services";
import { abs, breadcrumbSchema, ORG_ID, pageMeta, PRODUCT_ENGINEERING, shareImg } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Creative Services: AI Ads & Photography",
  description:
    "AI commercials, AI UGC, digital humans, AI product photography and brand launches from SLIIQQUE in Lagos. Start a project from ₦150,000 a month.",
  path: "/services",
  keywords: ["AI creative studio Lagos", "AI advertising studio Africa", "creative studio Lagos", "AI video ads agency Lagos"],
  image: { url: shareImg("digital-human-portrait-wide.jpg"), alt: "SLIIQQUE Studio: identity-locked photorealistic AI digital human portrait" },
});

/** Services without a gallery of their own borrow a frame from the concept work that best represents them. */
const FALLBACK_IMG: Record<string, { id: string; alt: string }> = {
  "ai-commercials": { id: "ode-portrait.jpg", alt: "AI commercial frame: ODÈ grooming concept, portrait" },
  "brand-launches-campaigns": { id: "ala-serum-prismatic-hero.png", alt: "Brand launch visual: ÀLÀ skincare concept, prismatic serum hero" },
};

const BREADCRUMB = [{ name: "Home", path: "/" }, { name: "Services", path: "/services" }];

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(BREADCRUMB),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "SLIIQQUE Studio creative services",
            itemListElement: SERVICE_PAGES.map((s, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/services/${s.slug}`), name: s.name })),
          },
        ]}
      />
      <PageHero
        h1="creative services"
        sub="Five creative services under one studio, run as monthly retainers and fixed-scope projects."
        breadcrumb={BREADCRUMB}
      />
      <section className="sec sec--last">
        <Reveal className="container">
          <ol className="svc-list">
            {SERVICE_PAGES.map((s, i) => {
              const img = s.gallery?.[0] ?? FALLBACK_IMG[s.slug];
              return (
                <li key={s.slug}>
                  <Link className="svc-row" href={`/services/${s.slug}`}>
                    <span className="svc-row__num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                    <div className="svc-row__main">
                      <h2 className="svc-row__name">{s.name}</h2>
                      <p>{s.answer.split(". ")[0]}.</p>
                      <p className="svc-row__meta"><strong>{s.priceLabel} {s.priceNgn}</strong> ({s.priceUsd}) · {s.timeline}</p>
                    </div>
                    {img && <div className="svc-row__img"><Img id={img.id} w={320} h={400} alt={img.alt} /></div>}
                    <span className="svc-row__go" aria-hidden="true"><IconArrow /></span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <p className="services-note">
            SLIIQQUE does not offer logo design. See <Link href="/#pricing">pricing</Link>, the <Link href="/faq">FAQ</Link> or <Link href="/contact">start a project</Link>.
          </p>
          <p className="services-note">
            Need a website, AI bot or software instead? Visit <a href={PRODUCT_ENGINEERING.url} target="_blank" rel="noopener noreferrer">{PRODUCT_ENGINEERING.name} ↗</a>.
          </p>
          <div className="center-btn"><Btn href="/contact">Start a project</Btn></div>
        </Reveal>
      </section>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Creative services", url: abs("/services"), isPartOf: { "@id": ORG_ID } }} />
    </>
  );
}
