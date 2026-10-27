import Link from "next/link";
import type { ReactNode } from "react";
import FaqList from "@/components/FaqList";
import Img from "@/components/Img";
import VideoBlock from "@/components/VideoBlock";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import { Btn, PageHero } from "@/components/ui";
import { serviceBySlug } from "@/data/services";
import { abs, breadcrumbSchema, faqSchema, ORG_ID } from "@/lib/seo";

export type Faq = { q: string; a: string };

export type CityLandingProps = {
  path: string;
  /** Slug of the service page this landing page narrows to Lagos. */
  service: string;
  /** Visible H1 and the Service schema name */
  h1: string;
  breadcrumbName: string;
  /** Lagos-specific lead paragraph shown under "The short answer" */
  lead: ReactNode;
  who: string[];
  /** One extra section, e.g. the comparison with the alternative */
  extra: { title: string; body: ReactNode };
  faqs: Faq[];
  /** Offers in the schema, one NGN and one USD */
  offer: { name: string; ngn: string; usd: string };
  related: ReactNode;
  /** Shown when the service has no gallery of its own */
  gallery?: { id: string; alt: string }[];
  conceptNote?: ReactNode;
};

/** A Lagos-intent landing page built on a service page's own data, so prices and scope never drift from it. */
export default function CityLanding(p: CityLandingProps) {
  const S = serviceBySlug(p.service)!;
  const gallery = S.gallery ?? p.gallery;
  const breadcrumb = [{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: p.breadcrumbName, path: p.path }];
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(breadcrumb),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: p.h1,
            serviceType: S.name,
            description: S.answer,
            url: abs(p.path),
            provider: { "@id": ORG_ID },
            areaServed: [{ "@type": "City", name: "Lagos" }, { "@type": "Country", name: "Nigeria" }],
            offers: [
              { "@type": "Offer", name: `${p.offer.name} (NGN)`, priceCurrency: "NGN", price: p.offer.ngn, url: abs("/#pricing") },
              { "@type": "Offer", name: `${p.offer.name} (USD)`, priceCurrency: "USD", price: p.offer.usd, url: abs("/#pricing") },
            ],
          },
          faqSchema(p.faqs),
        ]}
      />
      <PageHero h1={p.h1} sub={`${S.priceLabel} ${S.priceNgn} (${S.priceUsd}) · ${S.timeline}`} className="page-hero--legal" h1Class="t-h3" breadcrumb={breadcrumb} />
      <section className="sec legal">
        <Reveal className="split">
          <h2 className="t-h4">The short answer</h2>
          <div>
            {p.lead}
            <p>For the full scope and process, see <Link href={`/services/${S.slug}`}>{S.name}</Link>.</p>
          </div>
        </Reveal>
        {gallery && (
          <Reveal className="svc-gallery">
            {gallery.map((g) => <div key={g.id}><Img id={g.id} w={427} h={640} alt={g.alt} /></div>)}
          </Reveal>
        )}
        <VideoBlock path={p.path} />
        <Reveal className="split">
          <h2 className="t-h4">Who it suits in Lagos</h2>
          <div><ul>{p.who.map((x) => <li key={x}>{x}</li>)}</ul></div>
        </Reveal>
        <Reveal className="split">
          <h2 className="t-h4">{p.extra.title}</h2>
          <div>{p.extra.body}</div>
        </Reveal>
        <Reveal className="split">
          <h2 className="t-h4">What is included</h2>
          <div><ul>{S.included.map((x) => <li key={x}>{x}</li>)}</ul></div>
        </Reveal>
        <Reveal className="split">
          <h2 className="t-h4">How it works</h2>
          <div><ol className="steps">{S.how.map(([t, d]) => <li key={t}><strong>{t}.</strong> {d}</li>)}</ol></div>
        </Reveal>
        <Reveal className="split">
          <h2 className="t-h4">Pricing and timeline</h2>
          <div>
            <p><strong>{S.priceLabel}:</strong> {S.priceNgn} for Nigerian clients, {S.priceUsd} for international clients. Timeline: {S.timeline}.</p>
            <p>Prices exclude taxes. Two revision rounds are included. See <Link href="/#pricing">all retainers and projects</Link>, the <Link href="/policies">Studio Policies</Link> and the <Link href="/terms">Terms &amp; Conditions</Link>.</p>
            {p.conceptNote}
          </div>
        </Reveal>
      </section>
      <FaqList faqs={p.faqs} title="faq" id="faq" last={false} />
      <section className="sec sec--last">
        <Reveal className="container">
          <div className="center-btn"><Btn href="/contact">Start a project</Btn></div>
          <p className="services-note">Related: {p.related} <Link href="/services">All services</Link>.</p>
        </Reveal>
      </section>
    </>
  );
}
