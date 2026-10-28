"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Reveal from "./Reveal";
import { Btn, PageHero, SecHead } from "./ui";
import type { Plan, ProjectRow } from "@/lib/data";

type Cur = "NGN" | "USD";
type Platforms = 1 | 2 | 3;

const BREADCRUMB = [{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }];

/** Add-on prices mirror Studio Policies section 10. Percentages are the same in either currency. */
const ADD_ONS = [
  { name: "Extra video", detail: "One more vertical video, 15 to 30 seconds.", ngn: "₦40,000 each", usd: "$75 each" },
  { name: "Extra still", detail: "One more high-resolution product or lifestyle still.", ngn: "₦5,000 each", usd: "$10 each" },
  { name: "Extra revision round", detail: "One more round on a delivered batch.", ngn: "₦15,000 each", usd: "$30 each" },
  { name: "Paid-ad licence", detail: "For retainer content, where not already included.", ngn: "+30%", usd: "+30%" },
  { name: "Rush delivery", detail: "For a compressed schedule.", ngn: "+50%", usd: "+50%" },
];

const PAYMENT_TERMS = [
  ["Projects", "50% deposit to start, 50% on delivery."],
  ["Retainers", "Billed monthly in advance."],
  ["Currency", "Naira for Nigerian clients, US dollars for international clients."],
  ["Taxes", "Prices exclude taxes, duties and withholding."],
  ["Notice", "Retainers end with 30 days' written notice."],
];

function CurrencyToggle({ cur, onChange }: { cur: Cur; onChange: (c: Cur) => void }) {
  return (
    <div className="cur-toggle cur-toggle--lg" role="group" aria-label="Currency">
      {(["NGN", "USD"] as const).map((c) => (
        <button key={c} type="button" aria-pressed={cur === c} className={cur === c ? "is-on" : ""} onClick={() => onChange(c)}>
          {c === "NGN" ? "₦ NGN" : "$ USD"}
        </button>
      ))}
    </div>
  );
}

const naira = (s: string) => Number(s.replace(/[^\d]/g, ""));

export default function PricingPage({ plans, plansIntro, projects, projectsIntro }: { plans: Plan[]; plansIntro: string; projects: ProjectRow[]; projectsIntro: string }) {
  const [cur, setCur] = useState<Cur>("NGN");
  const [platforms, setPlatforms] = useState<Platforms>(1);
  const [needsCommercial, setNeedsCommercial] = useState(false);
  const [needsHuman, setNeedsHuman] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("sliiqque-currency");
      if (saved === "NGN" || saved === "USD") {
        setCur(saved);
        return;
      }
      if (!Intl.DateTimeFormat().resolvedOptions().timeZone.startsWith("Africa/Lagos")) setCur("USD");
    } catch {
      /* keep NGN */
    }
  }, []);

  const choose = (c: Cur) => {
    setCur(c);
    try {
      window.localStorage.setItem("sliiqque-currency", c);
    } catch {
      /* the toggle still works for this visit */
    }
  };

  const money = (ngn: string, usd: string) => (cur === "NGN" ? ngn : usd);
  const planFrom = plans.reduce((a, p) => (naira(p[2]) < naira(a[2]) ? p : a), plans[0]);
  const projectFrom = projects.reduce((a, p) => (naira(p[3]) < naira(a[3]) ? p : a), projects[0]);

  const recIndex = needsCommercial || platforms === 3 ? 2 : platforms === 2 || needsHuman ? 1 : 0;
  const rec = plans[recIndex] ?? plans[plans.length - 1];

  return (
    <>
      <PageHero
        h1="pricing"
        className="page-hero--pricing page-hero--flush"
        breadcrumb={BREADCRUMB}
        sub="Three monthly retainers for always-on content, and fixed-scope projects for a single launch. Priced in naira and US dollars, quoted in one working day."
      />

      <div className="rate-bar">
        <div className="rate-bar__in">
          <div className="rate-bar__mark">
            <span className="rate-bar__glyph" aria-hidden="true">{cur === "NGN" ? "₦" : "$"}</span>
            <span className="rate-bar__label">Rate card 2026</span>
          </div>
          <p className="rate-bar__meta">Retainers from <strong>{money(planFrom[2], planFrom[5])}</strong> / month · Projects from <strong>{money(projectFrom[3], projectFrom[4])}</strong></p>
          <CurrencyToggle cur={cur} onChange={choose} />
        </div>
      </div>

      <section className="sec rate-sec rate-sec--plans" id="retainers">
        <span className="rate-ghost" aria-hidden="true">{cur === "NGN" ? "₦" : "$"}</span>
        <div className="container">
          <Reveal>
            <SecHead index="01 / Retainers" title="monthly retainers" aside={<p>{plansIntro}</p>} />
          </Reveal>

          <Reveal className="rate-plans">
            {plans.map(([name, desc, ngn, feats, dark, usd], i) => (
              <article className={`rate-plan${dark ? " rate-plan--ink" : ""}`} key={name}>
                <div className="rate-plan__head">
                  <span className="rate-plan__no">{String(i + 1).padStart(2, "0")}</span>
                  {dark && <span className="rate-plan__badge">Start here</span>}
                </div>
                <h3 className="rate-plan__name">{name}</h3>
                <p className="rate-plan__desc">{desc}</p>
                <p className="rate-plan__price">
                  <strong key={`${name}-${cur}`} className="rate-swap">{money(ngn, usd)}</strong>
                  <span>/ month</span>
                </p>
                <ul className="rate-plan__feats">{feats.map((f) => <li key={f}>{f}</li>)}</ul>
                <div className="rate-plan__foot">
                  <Btn href="/contact">Start a project</Btn>
                  <span className="rate-plan__meta">Billed monthly in advance</span>
                </div>
              </article>
            ))}
          </Reveal>

          <Reveal className="rate-shared">
            <p><strong>Every retainer:</strong> monthly in advance, two revision rounds per batch, organic usage included.</p>
            <p>Paid-ad licensing is included on Scale and available as an add-on on the other plans. <a href="#extras">See add-ons and terms</a>.</p>
          </Reveal>

          <Reveal className="rate-finder">
            <div className="rate-finder__main">
              <h3 className="rate-finder__title">find your retainer</h3>
              <p className="rate-finder__intro">Three answers, one starting point. This is a guide, not a quote.</p>

              <div className="rate-finder__qs">
                <div className="rate-finder__q" role="group" aria-label="How many platforms?">
                  <span>Platforms</span>
                  <div className="rate-finder__opts">
                    {([1, 2, 3] as const).map((n) => (
                      <button key={n} type="button" className="rate-finder__opt" aria-pressed={platforms === n} onClick={() => setPlatforms(n)}>{n}</button>
                    ))}
                  </div>
                </div>

                <div className="rate-finder__q" role="group" aria-label="Need a monthly commercial?">
                  <span>Monthly commercial</span>
                  <div className="rate-finder__opts">
                    <button type="button" className="rate-finder__opt" aria-pressed={needsCommercial} onClick={() => setNeedsCommercial(true)}>Yes</button>
                    <button type="button" className="rate-finder__opt" aria-pressed={!needsCommercial} onClick={() => setNeedsCommercial(false)}>No</button>
                  </div>
                </div>

                <div className="rate-finder__q" role="group" aria-label="Need a digital human?">
                  <span>Digital human</span>
                  <div className="rate-finder__opts">
                    <button type="button" className="rate-finder__opt" aria-pressed={needsHuman} onClick={() => setNeedsHuman(true)}>Yes</button>
                    <button type="button" className="rate-finder__opt" aria-pressed={!needsHuman} onClick={() => setNeedsHuman(false)}>No</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rate-finder__result">
              <div aria-live="polite">
                <span className="rate-finder__kicker">Start with</span>
                <h4 className="rate-finder__name">{rec[0]}</h4>
                <p className="rate-finder__desc">{rec[1]}</p>
                <p className="rate-finder__price"><strong key={`${rec[0]}-${cur}`} className="rate-swap">{money(rec[2], rec[5])}</strong><small> / month</small></p>
              </div>
              <div>
                <Btn href="/contact">Start a project</Btn>
                <p className="rate-finder__note">A starting point, not a quote.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="sec rate-sec" id="projects">
        <div className="container">
          <Reveal>
            <SecHead index="02 / Projects" title="fixed scope, fixed price" aside={<p>{projectsIntro}</p>} />
          </Reveal>

          <div className="rate-split">
            <aside className="rate-split__aside">
              <p className="rate-split__lead">One brief, one fixed quote, one delivery date. Every project includes two revision rounds and commercial usage rights.</p>
              <dl className="rate-facts">
                <div><dt>Turnaround</dt><dd>5 to 21 days</dd></div>
                <div><dt>Deposit</dt><dd>50% to begin</dd></div>
                <div><dt>Revisions</dt><dd>Two rounds</dd></div>
                <div><dt>Usage</dt><dd>Commercial rights</dd></div>
              </dl>
              <Btn href="/contact">Scope a project</Btn>
              <p className="rate-split__note">Every project starts with a scoped brief. Prices exclude taxes.</p>
            </aside>

            <Reveal className="rate-ledger">
              <div className="rate-ledger__head" aria-hidden="true"><span /><span>Project and scope</span><span>From</span></div>
              {projects.map(([title, sub, desc, ngn, usd], i) => (
                <article className="rate-row" key={title}>
                  <span className="rate-row__no">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="rate-row__title">{title}</h3>
                    <p className="rate-row__sub">{sub}</p>
                    <p className="rate-row__desc">{desc}</p>
                  </div>
                  <p className="rate-row__price"><span className="rate-swap" key={`${title}-${cur}`}>{money(ngn, usd)}</span></p>
                </article>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      <section className="sec rate-sec" id="extras">
        <div className="container">
          <Reveal>
            <SecHead index="03 / Add-ons & terms" title="the line items" aside={<p>Extra videos, stills and revisions, priced here, alongside the payment terms that apply to every plan.</p>} />
          </Reveal>

          <Reveal className="rate-terms">
            <div className="rate-terms__col">
              <h3 className="rate-terms__title">add-ons</h3>
              <dl className="rate-terms__list">
                {ADD_ONS.map((a) => (
                  <div className="rate-terms__row" key={a.name}>
                    <dt>{a.name}</dt>
                    <dd><span>{a.detail}</span><strong className="rate-swap" key={`${a.name}-${cur}`}>{money(a.ngn, a.usd)}</strong></dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rate-terms__col">
              <h3 className="rate-terms__title">payment &amp; terms</h3>
              <dl className="rate-terms__list">
                {PAYMENT_TERMS.map(([dt, dd]) => (
                  <div className="rate-terms__row" key={dt}>
                    <dt>{dt}</dt>
                    <dd>{dd}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          <Reveal className="rate-footnote">
            <p><strong>No logo design.</strong> SLIIQQUE works from the brand assets you supply. Read the <Link href="/policies">Studio Policies</Link> for the full terms.</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
