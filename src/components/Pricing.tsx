"use client";

import { useEffect, useState } from "react";
import Awards from "./Awards";
import Reveal from "./Reveal";
import { Btn, SecHead } from "./ui";
import type { Plan, ProjectRow, Row } from "@/lib/data";

type Cur = "NGN" | "USD";

/** Monthly retainers + one-off projects with a naira / US-dollar toggle (international clients are invoiced in USD). */
export default function Pricing({ plans, plansIntro, projects, projectsIntro }: { plans: Plan[]; plansIntro: string; projects: ProjectRow[]; projectsIntro: string }) {
  const [cur, setCur] = useState<Cur>("NGN");

  // Visitors outside Lagos see US dollars first; the toggle always overrides.
  useEffect(() => {
    try {
      if (!Intl.DateTimeFormat().resolvedOptions().timeZone.startsWith("Africa/Lagos")) setCur("USD");
    } catch {
      /* keep NGN */
    }
  }, []);

  const toggle = (
    <div className="cur-toggle" role="group" aria-label="Currency">
      {(["NGN", "USD"] as const).map((c) => (
        <button key={c} type="button" aria-pressed={cur === c} className={cur === c ? "is-on" : ""} onClick={() => setCur(c)}>
          {c === "NGN" ? "₦ NGN" : "$ USD"}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <section className="sec" id="pricing">
        <Reveal className="container">
          <SecHead title="monthly retainers" aside={<><p>{plansIntro}</p>{toggle}</>} />
          <div className={`plans${plans.length === 3 ? " plans--3" : ""}`}>
            {plans.map(([n, d, ngn, feats, dark, usd]) => (
              <div className={`plan${dark ? " plan--dark" : ""}`} key={n}>
                {dark && <span className="plan__badge">Start here</span>}
                <h5 className="t-h5">{n}</h5>
                <p className="desc">{d}</p>
                <div className="plan__price"><h3 className="t-h3">{cur === "NGN" ? ngn : usd}</h3><span>/ month</span></div>
                <ul>{feats.map((f) => <li key={f}>{f}</li>)}</ul>
                <Btn href="/contact" className={`btn--block${dark ? " btn--accent" : ""}`}>Get started</Btn>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
      <Awards
        id="projects"
        title="one-off projects"
        intro={projectsIntro}
        rows={projects.map(([t, s, desc, ngn, usd]): Row => [t, s, desc, cur === "NGN" ? ngn : usd])}
        priceCol
      />
    </>
  );
}
