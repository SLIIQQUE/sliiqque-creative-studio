import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import { Btn, PageHero } from "@/components/ui";
import { SERVICE_PAGES } from "@/data/services";
import { abs, breadcrumbSchema, ORG_ID, pageMeta, PRODUCT_ENGINEERING, shareImg } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Creative Services: AI Ads & Photography",
  description:
    "AI commercials, AI UGC and digital humans, AI product photography and brand launches from SLIIQQUE in Lagos. From ₦150,000 / $280 a month.",
  path: "/services",
  keywords: ["AI creative studio Lagos", "AI advertising studio Africa", "creative studio Lagos", "AI video ads agency Lagos"],
  image: { url: shareImg("digital-human-portrait-wide.jpg"), alt: "SLIIQQUE Studio: identity-locked photorealistic AI digital human portrait" },
});

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }]),
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
        sub="Eight creative services under one studio, run as monthly retainers and fixed-scope projects."
        className="page-hero--legal"
      />
      <section className="sec sec--last">
        <Reveal className="container">
          <div className="process">
            {SERVICE_PAGES.map((s) => (
              <Link className="process__card service-card" key={s.slug} href={`/services/${s.slug}`}>
                <h2 className="t-h4">{s.name}</h2>
                <p>{s.answer.split(". ")[0]}.</p>
                <p className="service-card__meta">{s.priceLabel} {s.priceNgn} ({s.priceUsd}) · {s.timeline}</p>
              </Link>
            ))}
          </div>
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
