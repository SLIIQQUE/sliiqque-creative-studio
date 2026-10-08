import Img from "./Img";
import Reveal from "./Reveal";
import Stats from "./Stats";
import Accordion from "./Accordion";
import Awards from "./Awards";
import Pricing from "./Pricing";
import { BlogCard, WorkCard } from "./cards";
import { Btn, SecHead } from "./ui";
import { IconPlus } from "./icons";
import { ABOUT, BLOGS, HERO, HOME_WORKS, PLANS, PLANS_INTRO, PROCESS_ROWS, PROJECT_ROWS, PROJECTS_INTRO, AWARDS_INTRO, SECTION_SUB, SERVICES, WORKS } from "@/lib/data";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero__row">
          <p className="hero__title t-hero">
            <span className="line">sliiqque</span>
            <span className="line">studio</span>
          </p>
          <div className="hero__aside">
            <p className="hero__tag">{HERO.tag}</p>
            <h1 className="t-h4">{HERO.sub}</h1>
            <a className="scroll" href="#gallery">Scroll Down ↓</a>
          </div>
        </div>
        <div className="ticker" id="gallery">
          <div className="ticker__track">
            {[0, 1].map((copy) =>
              HERO.ticker.map((id, n) => (
                <span key={`${copy}-${id}`} style={{ display: "contents" }} aria-hidden={copy ? true : undefined}>
                  <Img id={id} w={450} h={550} alt={`SLIIQQUE AI-produced visual ${n + 1}`} eager={!copy && n === 0} />
                </span>
              )),
            )}
          </div>
        </div>
      </section>

      <section className="sec" id="about">
        <Reveal className="about__row1">
          <div className="about__label">About<br />SLIIQQUE Studio</div>
          <div className="about__copy">
            <h3 className="t-h3">{ABOUT.heading}</h3>
            <p>{ABOUT.body}</p>
            <Btn href="/about">About us</Btn>
          </div>
        </Reveal>
        <Reveal className="about__row2">
          <Img id={ABOUT.img} w={290} h={197} alt="SLIIQQUE Studio creative production sample" />
          <Stats className="stats" stats={ABOUT.stats} />
        </Reveal>
      </section>

      <section className="sec sec--works" id="works">
        <div className="container">
          <SecHead
            title="selected works"
            asideClass="sec-aside--lift"
            aside={<><p>Concept brand worlds built to show how we work, and labelled as exactly that.</p><Btn href="/works">View all work</Btn></>}
          />
          <div className="works-grid">{WORKS.slice(0, HOME_WORKS).map((w) => <WorkCard key={w[0]} w={w} />)}</div>
        </div>
      </section>

      <section className="sec" id="services">
        <Reveal className="container">
          <SecHead title="our services" aside={<><p>{SECTION_SUB}</p><Btn href="/services">All services</Btn></>} />
          <Accordion
            className="acc"
            itemClass="acc__item"
            items={SERVICES.map(([t, d, tags, im, alt]) => ({
              key: t,
              content: (
                <div className="acc__row">
                  <div className="acc__thumb"><Img id={im} w={193} h={100} alt={alt} /></div>
                  <div className="acc__main">
                    <h4 className="acc__title">{t}</h4>
                    <div className="acc__body"><p>{d}</p></div>
                    <div className="acc__tags">{tags.map((x) => <span className="tag" key={x}>{x}</span>)}</div>
                  </div>
                  <div className="icon-ring"><IconPlus /></div>
                </div>
              ),
            }))}
          />
        </Reveal>
      </section>

      <Awards id="process" title="our process" intro={AWARDS_INTRO} rows={PROCESS_ROWS} />

      <Pricing plans={PLANS} plansIntro={PLANS_INTRO} projects={PROJECT_ROWS} projectsIntro={PROJECTS_INTRO} />

      <section className="sec sec--last" id="blogs">
        <Reveal className="container">
          <SecHead title="journal" aside={<><p>Notes on identity lock, storyboarding, grading and fashion imagery, written from our own production work.</p><Btn href="/blogs">All Articles</Btn></>} />
          <div className="blog-grid">{BLOGS.slice(0, 2).map((b) => <BlogCard key={b[0]} b={b} />)}</div>
        </Reveal>
      </section>
    </>
  );
}
