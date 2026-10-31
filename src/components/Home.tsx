import Img from "./Img";
import Reveal from "./Reveal";
import CountUp from "./CountUp";
import Awards from "./Awards";
import Pricing from "./Pricing";
import SocialFollow from "./SocialFollow";
import ServiceIndex from "./ServiceIndex";
import FaqList from "./FaqList";
import HeroReel from "./HeroReel";
import LagosTime from "./LagosTime";
import { BlogCard, WorkCard } from "./cards";
import { Btn, SecHead } from "./ui";
import { ABOUT, HERO, HOME_WORKS, PLANS, PLANS_INTRO, PROCESS_ROWS, PROJECT_ROWS, PROJECTS_INTRO, AWARDS_INTRO, SECTION_SUB, WORKS } from "@/lib/data";
import { HOME_FAQ } from "@/data/services";
import { getJournalCards } from "@/lib/journal";
import { CONTENT_UPDATED, PRODUCT_ENGINEERING, displayDate } from "@/lib/seo";

const [FIRST, ...AFTER] = ABOUT.body.split(". ");
const LEAD = FIRST.includes(", ") ? [FIRST.slice(0, FIRST.indexOf(", ")), FIRST.slice(FIRST.indexOf(", ") + 2)] : [FIRST, ""];
const [AI_WORD, ...PRODUCE_WORDS] = LEAD[0].split(" ");
const PRODUCE_REST = PRODUCE_WORDS.join(" ");
const REST = AFTER.join(". ");
const PARTS = (REST.match(/systems, (.+?) assets/)?.[1] ?? "").split(/, | and /).filter(Boolean).map((x, i, a) => (i === a.length - 1 ? `${x} assets` : x));

/** Plain-language answer to "what is this studio?", the passage search engines, assistants and voice read first. Price comes from PLANS, never retyped. */
const [STARTER] = PLANS;
const ANSWER = `SLIIQQUE Studio is a creative studio in Lagos, Nigeria. It produces AI commercials, AI UGC and digital humans, AI product photography and fashion imagery for brands in Nigeria, Africa and worldwide. Monthly retainers start at ${STARTER[2]} or ${STARTER[5]}, and every project begins with a scoped brief.`;

/** Phrases picked out inside the answer paragraph. The text stays one plain sentence run for crawlers and voice. */
const KEY_TERMS = /(AI commercials|AI UGC and digital humans|AI product photography|fashion imagery)/;
const FACTS: [label: string, value: string, note: string][] = [
  ["Based in", "Lagos", "Nigeria"],
  ["Works with", "Brands", "Nigeria, Africa and worldwide"],
  ["Retainers from", STARTER[2], `or ${STARTER[5]} a month`],
  ["Every project", "Scoped brief", "agreed before any production"],
];

const STRIP = ["AI commercials", "AI UGC", "Digital humans", "AI photography", "Fashion imagery", "Brand launches"];

export default async function Home() {
  const { cards } = await getJournalCards();
  return (
    <>
      <section className="hero">
        <div className="hero__meta">
          <span><i aria-hidden="true" />Creative studio, Lagos</span>
          <span className="hero__meta-right"><LagosTime /><b aria-hidden="true">/</b>Working worldwide</span>
        </div>

        <div className="hero__stage">
          <h1 className="hero__title t-hero">
            <span className="line">sliiqque</span>
            <span className="line line--ghost">studio</span>
            <span className="sr-only">: AI commercials, UGC and photography studio in Lagos, Nigeria</span>
          </h1>
          <div className="hero__aside">
            <p className="hero__tag">{HERO.tag}</p>
            <p className="hero__sub">{HERO.sub}</p>
            <a className="scroll" href="#gallery">Scroll to the work</a>
          </div>
        </div>

        <div id="gallery"><HeroReel ids={HERO.ticker} /></div>
      </section>

      <div className="strip" aria-hidden="true">
        <div className="strip__track">
          {[...STRIP, ...STRIP, ...STRIP].map((x, i) => <span className="strip__item" key={`${x}-${i}`}>{x}</span>)}
        </div>
      </div>

      <section className="answer" id="in-brief" aria-label="SLIIQQUE Studio in brief">
        <Reveal className="container answer__in">
          <div className="answer__top">
            <p className="answer__label"><span aria-hidden="true" />In brief</p>
            <p className="answer__updated">Last updated <time dateTime={CONTENT_UPDATED}>{displayDate(CONTENT_UPDATED)}</time></p>
          </div>
          <p className="answer__text">
            {ANSWER.split(KEY_TERMS).map((part, i) => (KEY_TERMS.test(part) ? <mark className="answer__key" key={i}>{part}</mark> : part))}
          </p>
          <dl className="answer__facts">
            {FACTS.map(([label, value, note]) => (
              <div className="answer__fact" key={label}>
                <dt>{label}</dt>
                <dd><b>{value}</b><span>{note}</span></dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* About / manifesto section, hidden for now. Restore by removing this comment wrapper.
      <section className="ab" id="about" aria-labelledby="about-title">
        <div className="ab__glow ab__glow--a" aria-hidden="true" />
        <div className="ab__glow ab__glow--b" aria-hidden="true" />
        <Reveal className="ab__in">
          <div className="ab__top">
            <p className="ab__label"><span aria-hidden="true" />About SLIIQQUE Studio</p>
            <p className="ab__idx">Manifesto <i aria-hidden="true">/</i> 01</p>
          </div>

          <h2 className="ab__statement" id="about-title">
            <span className="ab__line"><em className="ab__ai">{AI_WORD}</em> {PRODUCE_REST},</span>
            <span className="ab__line ab__ghost">{LEAD[1]}.</span>
          </h2>

          <div className="ab__grid">
            <div className="ab__intro">
              <p className="ab__heading">{ABOUT.heading}</p>
              <p className="ab__body">{REST}</p>
              <div className="ab__actions">
                <Btn href="/about">About the studio</Btn>
                <span className="ab__where">Lagos, Nigeria <i aria-hidden="true">/</i> Working worldwide</span>
              </div>
            </div>
            <figure className="ab__figure">
              <div className="ab__shot">
                <Img id={ABOUT.img} w={640} h={426} alt="SLIIQQUE Studio reviewing AI-generated production stills" />
                <span className="ab__badge">In studio <i aria-hidden="true">/</i> Lagos</span>
              </div>
              <figcaption>Reviewing AI-generated production stills</figcaption>
            </figure>
          </div>

          <div className="ab__stats">
            {ABOUT.stats.map(([n, sign, caption]) => (
              <div className="ab__stat" key={caption}>
                <p className="ab__num"><CountUp target={n} /><span>{sign}</span></p>
                <p className="ab__stat-copy">{caption}</p>
              </div>
            ))}
          </div>

          <div className="ab__sell">
            <div className="ab__sell-lead">
              <p className="ab__cap">What we sell</p>
              <p className="ab__sell-title">Creative systems</p>
            </div>
            {PARTS.length > 0 && (
              <ul className="ab__chips" aria-label="What a SLIIQQUE creative system includes">
                {PARTS.map((x) => <li key={x}>{x}</li>)}
              </ul>
            )}
          </div>
        </Reveal>
      </section>
      */}

      <section className="sec sec--works" id="works">
        <div className="container">
          <SecHead
            index="02 / Selected work"
            title="the work"
            asideClass="sec-aside--lift"
            aside={<><p>Three concept brand worlds, built end to end and labelled as exactly that. Not client work.</p><Btn href="/works">View all work</Btn></>}
          />
          <div className="works-grid">
            {WORKS.slice(0, HOME_WORKS).map((w) => <WorkCard key={w[0]} w={w} />)}
          </div>
        </div>
      </section>

      <section className="sec sec--services" id="services">
        <div className="container">
          <SecHead
            index="03 / Capabilities"
            title="what we make"
            aside={<><p>{SECTION_SUB}</p><Btn href="/services">All services</Btn></>}
          />
          <ServiceIndex />
        </div>
      </section>

      <Awards id="process" index="04 / Process" title="how it gets made" intro={AWARDS_INTRO} rows={PROCESS_ROWS} tone="night" ghost="Process" />

      <Pricing index="05 / Investment" plans={PLANS} plansIntro={PLANS_INTRO} projects={PROJECT_ROWS} projectsIntro={PROJECTS_INTRO} />

      <section className="sec" id="ecosystem">
        <div className="container">
          <SecHead
            index="06 / Ecosystem"
            title="one studio, two doors"
            aside={<p>Creative production here. Product engineering next door. Separate teams, one standard.</p>}
          />
          <div className="ecosystem-card">
            <div className="ecosystem-card__text">
              <h3 className="t-h4">{PRODUCT_ENGINEERING.name}</h3>
              <p>{PRODUCT_ENGINEERING.description}</p>
            </div>
            <a className="btn" href={PRODUCT_ENGINEERING.url} target="_blank" rel="noopener noreferrer">Visit Product &amp; Engineering ↗</a>
          </div>
        </div>
      </section>

      <FaqList faqs={HOME_FAQ} id="faq" title="questions people ask" index="07 / Questions" last={false} intro="Short answers on what SLIIQQUE makes, what it costs and how it works." />

      <section className="sec sec--last" id="blogs">
        <div className="container">
          <SecHead
            index="08 / Journal"
            title="notes from the floor"
            aside={<><p>Identity lock, storyboarding, grading and fashion imagery, written from our own production work.</p><Btn href="/blogs">All articles</Btn></>}
          />
          <div className="blog-grid">{cards.slice(0, 2).map((b) => <BlogCard key={b[0]} b={b} />)}</div>
          <SocialFollow placement="home" />
        </div>
      </section>
    </>
  );
}
