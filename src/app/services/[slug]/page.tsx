import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FaqList from "@/components/FaqList";
import Img from "@/components/Img";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import { Btn, PageHero } from "@/components/ui";
import { SERVICE_PAGES, SERVICE_WORKS, serviceBySlug } from "@/data/services";
import { WORKS } from "@/lib/data";
import { abs, breadcrumbSchema, faqSchema, ORG_ID, pageMeta, shareImg } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SERVICE_PAGES.map((s) => ({ slug: s.slug }));
}

/** Services with no gallery of their own borrow the hero of the concept work that best represents them. */
const FALLBACK_SHARE_WORK: Record<string, string> = { "ai-commercials": "ode", "brand-launches-campaigns": "ala-skin" };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = serviceBySlug(slug);
  if (!s) return {};
  const firstGalleryId = s.gallery?.[0]?.id;
  const fallbackWork = FALLBACK_SHARE_WORK[s.slug] && WORKS.find((w) => w[0] === FALLBACK_SHARE_WORK[s.slug]);
  const imageId = firstGalleryId ?? fallbackWork?.[5];
  return pageMeta({
    title: s.title,
    description: s.description,
    path: `/services/${s.slug}`,
    keywords: s.keywords,
    ...(imageId ? { image: { url: shareImg(imageId), alt: `${s.name}: example work by SLIIQQUE` } } : {}),
  });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const s = serviceBySlug(slug);
  if (!s) notFound();
  const related = SERVICE_PAGES.filter((x) => s.related.includes(x.slug));
  const works = WORKS.filter((w) => SERVICE_WORKS[s.slug]?.includes(w[0]));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: s.name, path: `/services/${s.slug}` }]),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: s.name,
            serviceType: s.name,
            description: s.answer,
            url: abs(`/services/${s.slug}`),
            provider: { "@id": ORG_ID },
            areaServed: ["Nigeria", "Africa", "Worldwide"],
            ...(s.gallery ? { image: s.gallery.map((g) => abs(`/img/${g.id}`)) } : {}),
            offers: [
              { "@type": "Offer", name: `${s.priceLabel} (NGN)`, priceCurrency: "NGN", price: s.priceNgn.replace(/[^\d]/g, ""), url: abs("/#pricing") },
              { "@type": "Offer", name: `${s.priceLabel} (USD)`, priceCurrency: "USD", price: s.priceUsd.replace(/[^\d]/g, ""), url: abs("/#pricing") },
            ],
          },
          faqSchema(s.faqs),
        ]}
      />
      <PageHero h1={s.h1} sub={`${s.priceLabel} ${s.priceNgn} (${s.priceUsd}) · ${s.timeline}`} className="page-hero--legal" h1Class="t-h3" />
      <section className="sec legal">
        <Reveal className="split">
          <h2 className="t-h4">The short answer</h2>
          <div><p>{s.answer}</p></div>
        </Reveal>
        {s.gallery && (
          <Reveal className="svc-gallery">
            {s.gallery.map((g) => <div key={g.id}><Img id={g.id} w={427} h={640} alt={g.alt} /></div>)}
          </Reveal>
        )}
        <Reveal className="split">
          <h2 className="t-h4">Who it is for</h2>
          <div><ul>{s.forWho.map((x) => <li key={x}>{x}</li>)}</ul></div>
        </Reveal>
        <Reveal className="split">
          <h2 className="t-h4">What is included</h2>
          <div><ul>{s.included.map((x) => <li key={x}>{x}</li>)}</ul></div>
        </Reveal>
        <Reveal className="split">
          <h2 className="t-h4">How it works</h2>
          <div>
            <ol className="steps">{s.how.map(([t, d]) => <li key={t}><strong>{t}.</strong> {d}</li>)}</ol>
          </div>
        </Reveal>
        <Reveal className="split">
          <h2 className="t-h4">Pricing and timeline</h2>
          <div>
            <p><strong>{s.priceLabel}:</strong> {s.priceNgn} for Nigerian clients, {s.priceUsd} for international clients. Timeline: {s.timeline}.</p>
            <p>Prices exclude taxes. Two revision rounds are included. See <Link href="/#pricing">all retainers and projects</Link>, the <Link href="/policies">Studio Policies</Link> and the <Link href="/terms">Terms &amp; Conditions</Link>.</p>
          </div>
        </Reveal>
        {works.length > 0 && (
          <Reveal className="split">
            <h2 className="t-h4">See it in practice</h2>
            <div>
              <ul>{works.map((w) => <li key={w[0]}><Link href={`/works/${w[0]}`}>{w[1]}</Link>: {w[3]} ({w[2]})</li>)}</ul>
              <p>These are self-initiated concept projects for fictional brands, not client work.</p>
            </div>
          </Reveal>
        )}
      </section>
      <FaqList faqs={s.faqs} title="faq" id="faq" last={false} />
      <section className="sec sec--last">
        <Reveal className="container">
          <div className="center-btn"><Btn href="/contact">Start a project</Btn></div>
          <p className="services-note">
            Related services: {related.map((r, i) => (<span key={r.slug}>{i ? ", " : ""}<Link href={`/services/${r.slug}`}>{r.name}</Link></span>))}. <Link href="/services">All services</Link>.
          </p>
        </Reveal>
      </section>
    </>
  );
}
