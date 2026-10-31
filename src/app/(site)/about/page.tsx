import JsonLd from "@/components/JsonLd";
import { abs, breadcrumbSchema, faqSchema, ORG_ID, pageMeta, PRODUCT_ENGINEERING, shareImg, slugify } from "@/lib/seo";
import Img from "@/components/Img";
import SocialFollow from "@/components/SocialFollow";
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
    "SLIIQQUE is a Lagos creative studio founded 22 December 2025 by Gabriel Njoabozia. See how it works, its standards, and start a project today.",
  path: "/about",
  keywords: ["about SLIIQQUE", "creative studio Lagos", "AI creative studio Nigeria", "Gabriel Njoabozia"],
  image: { url: shareImg("gabriel-njoabozia.jpg"), alt: "AI-generated portrait of Gabriel Njoabozia, founder of SLIIQQUE Studio" },
});

const BREADCRUMB = [{ name: "Home", path: "/" }, { name: "About", path: "/about" }];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "AboutPage", name: "About SLIIQQUE Studio", url: abs("/about"), about: { "@id": ORG_ID } },
          faqSchema(A.faq.map(([q, a]) => ({ q, a }))),
          breadcrumbSchema(BREADCRUMB),
        ]}
      />
      <PageHero h1={<>about <br />our studio</>} sub={A.hero_sub} h1Class="t-display nw" className="page-hero--about" breadcrumb={BREADCRUMB} />

      <section className="story">
        <Reveal className="founder" visible>
          <figure className="founder__img">
            <Img id="gabriel-njoabozia-founder.webp" w={753} h={941} alt="AI-generated portrait of Gabriel Njoabozia, founder of SLIIQQUE Studio" eager />
            <figcaption>Gabriel Njoabozia, Founder. AI-generated portrait.</figcaption>
          </figure>
          <div className="founder__text">
            <h2 className="t-h4">{A.story_label}</h2>
            <h3 className="t-h3">{A.story_h3}</h3>
            <p>{A.story_p}</p>
            <p>Gabriel Njoabozia founded SLIIQQUE in Lagos on 22 December 2025. SLIIQQUE runs two divisions: creative production here, and <a href={PRODUCT_ENGINEERING.url} target="_blank" rel="noopener noreferrer">{PRODUCT_ENGINEERING.name}</a> for websites, AI bots and automation.</p>
            <p>The portrait is an AI-generated likeness, made the way the studio makes every digital human: from a locked identity profile.</p>
          </div>
        </Reveal>
        <Stats className="stats--4" reveal stats={A.stats} />
      </section>

      <section className="flow" id="how">
        <div className="flow__in">
          <div className="flow__head">
            <h2 className="t-title">How we work</h2>
            <p>{A.how_intro}</p>
          </div>
          <ol className="flow__list">
            {A.steps.map(([t, d]) => {
              const [n, ...rest] = t.split(" ");
              return (
                <Reveal as="li" className="flow__item" key={t}>
                  <span className="flow__num" aria-hidden="true">{n.padStart(2, "0")}</span>
                  <div className="flow__body">
                    <h3 className="flow__title">{rest.join(" ")}</h3>
                    <p>{d}</p>
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="sec" id="ecosystem">
        <Reveal className="container">
          <SecHead title="the sliiqque ecosystem" aside={<p>SLIIQQUE runs two divisions under one studio: creative production here, and product engineering next door.</p>} />
          <div className="ecosystem-card">
            <div className="ecosystem-card__text">
              <h3 className="t-h4">{PRODUCT_ENGINEERING.name}</h3>
              <p>{PRODUCT_ENGINEERING.description}</p>
            </div>
            <a className="btn" href={PRODUCT_ENGINEERING.url} target="_blank" rel="noopener noreferrer">Visit Product &amp; Engineering ↗</a>
          </div>
        </Reveal>
      </section>

      <Awards id="standards" title="studio standards" intro="The rules we hold every project to, whether the work is concept or client." rows={STANDARDS_ROWS} />

      <section className="sec">
        <div className="container"><SocialFollow placement="about" /></div>
      </section>

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
                  <div className="faq__q"><h3 className="t-h5" id={slugify(q)}>{q}</h3><div className="icon-ring"><IconArrow /></div></div>
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
