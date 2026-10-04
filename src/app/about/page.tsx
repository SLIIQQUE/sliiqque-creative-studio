import JsonLd from "@/components/JsonLd";
import { abs, breadcrumbSchema, faqSchema, ORG_ID, pageMeta } from "@/lib/seo";
import Img from "@/components/Img";
import Reveal from "@/components/Reveal";
import Stats from "@/components/Stats";
import Accordion from "@/components/Accordion";
import Awards from "@/components/Awards";
import { IconArrow } from "@/components/icons";
import { PageHero, SecHead } from "@/components/ui";
import { ABOUT_PAGE as A, STANDARDS_ROWS } from "@/lib/data";

export const metadata = pageMeta({
  title: "About SLIIQQUE, a Lagos AI Creative Studio",
  description:
    "SLIIQQUE is a Lagos creative studio founded on 22 December 2025 by Gabriel Njoabozia. How it works, its standards, and its policies on AI, likeness and ownership.",
  path: "/about",
  keywords: ["about SLIIQQUE", "creative studio Lagos", "AI creative studio Nigeria", "Gabriel Njoabozia"],
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "AboutPage", name: "About SLIIQQUE Studio", url: abs("/about"), about: { "@id": ORG_ID } },
          faqSchema(A.faq.map(([q, a]) => ({ q, a }))),
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }]),
        ]}
      />
      <PageHero h1={<>about<br />our studio</>} sub={A.hero_sub} h1Class="t-display nw" />

      <section className="story">
        <Reveal className="story__img"><Img id={A.story_img} w={1320} h={800} alt="SLIIQQUE Studio creative work" eager /></Reveal>
        <Reveal className="split story__row">
          <h4 className="t-h4">{A.story_label}</h4>
          <div><h3 className="t-h3">{A.story_h3}</h3><p>{A.story_p}</p></div>
        </Reveal>
        <Stats className="stats--4" reveal stats={A.stats} />
      </section>

      <section className="sec" id="how">
        <Reveal className="container">
          <SecHead title="How we work" aside={<p>{A.how_intro}</p>} />
          <div className="process">
            {A.steps.map(([t, d]) => <div className="process__card" key={t}><h4 className="t-h4">{t}</h4><p>{d}</p></div>)}
          </div>
        </Reveal>
      </section>

      <Awards id="standards" title="studio standards" intro="The rules we hold every project to, whether the work is concept or client." rows={STANDARDS_ROWS} />

      <section className="sec sec--last" id="faq">
        <Reveal className="container">
          <SecHead title="questions & answers" aside={<p>{A.faq_intro}</p>} />
          <Accordion
            className="faq"
            itemClass="faq__item"
            items={A.faq.map(([q, a]) => ({
              key: q,
              content: (
                <>
                  <div className="faq__q"><h5 className="t-h5">{q}</h5><div className="icon-ring"><IconArrow /></div></div>
                  <div className="faq__a"><p>{a}</p></div>
                </>
              ),
            }))}
          />
        </Reveal>
      </section>
    </>
  );
}
