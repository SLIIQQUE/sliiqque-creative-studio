import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Img from "@/components/Img";
import Reveal from "@/components/Reveal";
import { Pager } from "@/components/ui";
import AgeGate from "@/components/AgeGate";
import VideoBlock from "@/components/VideoBlock";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { SERVICE_PAGES } from "@/data/services";
import { abs, breadcrumbSchema, ORG_ID, pageMeta, trimDesc } from "@/lib/seo";
import { absImg, getWorkEntries, getWorkSlugs, shareFor } from "@/lib/works";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    return (await getWorkSlugs()).map((slug) => ({ slug }));
  } catch (error) {
    // No database at build time: pages are then generated on first request and cached.
    console.error("generateStaticParams: could not list works", error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const w = (await getWorkEntries()).find((x) => x.slug === slug);
  if (!w) return {};
  return pageMeta({
    title: `${w.name}: ${w.category.split(" · ")[0]} concept work`,
    description: trimDesc(w.overview),
    path: `/works/${slug}`,
    keywords: [`${w.name} concept brand`, "AI commercial portfolio", "AI product photography"],
    image: { url: shareFor(w.img), alt: `${w.name}: concept brand visual by SLIIQQUE` },
  });
}

const Split = ({ h, p }: { h: string; p: string }) => (
  <Reveal className="split"><h2 className="t-h4">{h}</h2><p>{p}</p></Reveal>
);

export default async function CasePage({ params }: Props) {
  const { slug } = await params;
  const WORKS = await getWorkEntries();
  const i = WORKS.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const { name, category: cat, service: svc, year: yr, img: cardImg } = WORKS[i];
  const C = WORKS[i];
  const services = SERVICE_PAGES.filter((s) => WORKS[i].serviceSlugs.includes(s.slug));
  const narrow = false;
  const [heroW, heroH] = narrow ? [1188, 698] : [1320, 775];
  const [wideW, wideH] = ({ "ala-skin": [1318, 774], ode: [1319, 774] } as Record<string, number[]>)[slug] ?? [1320, 775];
  const breadcrumb = [{ name: "Home", path: "/" }, { name: "Work", path: "/works" }, { name: name, path: `/works/${slug}` }];

  return (
    <section className="case">
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "CreativeWork", name: name, description: C.overview, url: abs(`/works/${slug}`), creator: { "@id": ORG_ID }, genre: cat, dateCreated: yr, image: [cardImg, ...C.duo, C.wide].map(absImg) },
          breadcrumbSchema(breadcrumb),
        ]}
      />
      <Breadcrumbs items={breadcrumb} />
      {WORKS[i].ageGate && <AgeGate />}
      <div className="case__head">
        <h1 className="t-display case__title">{name}</h1>
        <div className="case__meta">
          {([["Service", svc], ["Category", cat], ["Year", yr]] as const).map(([k, v]) => <div key={k}><p className="t-h5 case__label">{k}</p><p>{v}</p></div>)}
        </div>
      </div>
      <div className={`case__hero${narrow ? " case__hero--narrow" : ""}`}><Img id={cardImg} w={heroW} h={heroH} alt={`${name}: concept brand hero visual by SLIIQQUE`} eager /></div>
      <Split h="project overview" p={C.overview} />
      <Reveal className="case__duo">{C.duo.map((id, n) => <div key={id}><Img id={id} w={645} h={645} alt={`${name} campaign visual ${n + 1}`} /></div>)}</Reveal>
      <Split h="the challenge" p={C.challenge} />
      <Split h="what we delivered" p={C.results} />
      <VideoBlock path={`/works/${slug}`} />
      <Reveal className={`case__wide${narrow ? " case__wide--narrow" : ""}`}><Img id={C.wide} w={wideW} h={wideH} alt={`${name} wide campaign visual`} /></Reveal>
      <Split h="the takeaway" p={C.conclusion} />
      {services.length > 0 && (
        <p className="services-note">
          Services shown in this project: {services.map((s, n) => <span key={s.slug}>{n ? ", " : ""}<Link href={`/services/${s.slug}`}>{s.name}</Link></span>)}.
        </p>
      )}
      <Pager prev={i > 0 ? `/works/${WORKS[i - 1].slug}` : undefined} next={i < WORKS.length - 1 ? `/works/${WORKS[i + 1].slug}` : undefined} />
    </section>
  );
}
