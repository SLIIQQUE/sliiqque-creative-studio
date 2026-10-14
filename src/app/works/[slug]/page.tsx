import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Img from "@/components/Img";
import Reveal from "@/components/Reveal";
import { Pager } from "@/components/ui";
import AgeGate from "@/components/AgeGate";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { servicesForWork } from "@/data/services";
import { CASES, WORKS } from "@/lib/data";
import { abs, breadcrumbSchema, ORG_ID, pageMeta, shareImg } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return WORKS.map((w) => ({ slug: w[0] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const w = WORKS.find((x) => x[0] === slug);
  if (!w) return {};
  const c = CASES[slug];
  return pageMeta({
    title: `${w[1]}: ${w[2].split(" · ")[0]} concept work`,
    description: c.overview.length > 155 ? `${c.overview.slice(0, 152).trimEnd()}...` : c.overview,
    path: `/works/${slug}`,
    keywords: [`${w[1]} concept brand`, "AI commercial portfolio", "AI product photography"],
    image: { url: shareImg(w[5]), alt: `${w[1]}: concept brand visual by SLIIQQUE` },
  });
}

const Split = ({ h, p }: { h: string; p: string }) => (
  <Reveal className="split"><h2 className="t-h4">{h}</h2><p>{p}</p></Reveal>
);

export default async function CasePage({ params }: Props) {
  const { slug } = await params;
  const i = WORKS.findIndex((x) => x[0] === slug);
  if (i < 0) notFound();
  const [, name, cat, svc, yr, cardImg, alt] = WORKS[i];
  const C = CASES[slug];
  const services = servicesForWork(slug);
  const narrow = false;
  const [heroW, heroH] = narrow ? [1188, 698] : [1320, 775];
  const [wideW, wideH] = ({ "ala-skin": [1318, 774], ode: [1319, 774] } as Record<string, number[]>)[slug] ?? [1320, 775];
  const breadcrumb = [{ name: "Home", path: "/" }, { name: "Work", path: "/works" }, { name: name, path: `/works/${slug}` }];

  return (
    <section className="case">
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "CreativeWork", name: name, description: C.overview, url: abs(`/works/${slug}`), creator: { "@id": ORG_ID }, genre: cat, dateCreated: yr, image: [cardImg, ...C.duo, C.wide].map((id) => abs(`/img/${id}`)) },
          breadcrumbSchema(breadcrumb),
        ]}
      />
      <Breadcrumbs items={breadcrumb} />
      {slug === "ase" && <AgeGate />}
      <div className="case__head">
        <h1 className="t-display case__title">{name}</h1>
        <div className="case__meta">
          {([["Service", svc], ["Category", cat], ["Year", yr]] as const).map(([k, v]) => <div key={k}><h5 className="t-h5">{k}</h5><p>{v}</p></div>)}
        </div>
      </div>
      <div className={`case__hero${narrow ? " case__hero--narrow" : ""}`}><Img id={cardImg} w={heroW} h={heroH} alt={`${name}: concept brand hero visual by SLIIQQUE`} eager /></div>
      <Split h="project overview" p={C.overview} />
      <Reveal className="case__duo">{C.duo.map((id, n) => <div key={id}><Img id={id} w={645} h={645} alt={`${name} campaign visual ${n + 1}`} /></div>)}</Reveal>
      <Split h="the challenge" p={C.challenge} />
      <Split h="what we delivered" p={C.results} />
      <Reveal className={`case__wide${narrow ? " case__wide--narrow" : ""}`}><Img id={C.wide} w={wideW} h={wideH} alt={`${name} wide campaign visual`} /></Reveal>
      <Split h="the takeaway" p={C.conclusion} />
      {services.length > 0 && (
        <p className="services-note">
          Services shown in this project: {services.map((s, n) => <span key={s.slug}>{n ? ", " : ""}<Link href={`/services/${s.slug}`}>{s.name}</Link></span>)}.
        </p>
      )}
      <Pager prev={i > 0 ? `/works/${WORKS[i - 1][0]}` : undefined} next={i < WORKS.length - 1 ? `/works/${WORKS[i + 1][0]}` : undefined} />
    </section>
  );
}
