"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Reveal from "./Reveal";
import { Btn, SecHead } from "./ui";
import type { Plan, ProjectRow, Row } from "@/lib/data";

type Cur = "NGN" | "USD";
type Tab = "retainer" | "projects";

/** Retainers and one-off projects share one section, split into tabs. The currency toggle applies to both. */
export default function Pricing({ plans, plansIntro, projects, projectsIntro, index }: { plans: Plan[]; plansIntro: string; projects: ProjectRow[]; projectsIntro: string; index?: string }) {
  const [cur, setCur] = useState<Cur>("NGN");
  const [tab, setTab] = useState<Tab>("retainer");

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

  const onTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next: Tab = tab === "retainer" ? "projects" : "retainer";
    setTab(next);
    document.getElementById(`tab-${next}`)?.focus();
  };

  const rows: Row[] = projects.map(([t, s, desc, ngn, usd]) => [t, s, desc, cur === "NGN" ? ngn : usd]);

  return (
    <section className="sec" id="pricing">
      <Reveal className="container">
        <SecHead
          index={index}
          title="investment"
          aside={<><p>{tab === "retainer" ? plansIntro : projectsIntro}</p>{toggle}</>}
        />

        <div className="bill-tabs" role="tablist" aria-label="Pricing model" onKeyDown={onTabKey}>
          <button id="tab-retainer" role="tab" type="button" aria-selected={tab === "retainer"} aria-controls="panel-retainer" tabIndex={tab === "retainer" ? 0 : -1} onClick={() => setTab("retainer")}>
            Monthly retainers <sup>{String(plans.length).padStart(2, "0")}</sup>
          </button>
          <button id="tab-projects" role="tab" type="button" aria-selected={tab === "projects"} aria-controls="panel-projects" tabIndex={tab === "projects" ? 0 : -1} onClick={() => setTab("projects")}>
            One-off projects <sup>{String(projects.length).padStart(2, "0")}</sup>
          </button>
        </div>

        {tab === "retainer" ? (
          <div className="plans plans--3 bill-panel" id="panel-retainer" role="tabpanel" aria-labelledby="tab-retainer">
            {plans.map(([n, d, ngn, feats, dark, usd], i) => (
              <article className={`plan${dark ? " plan--dark" : ""}`} key={n}>
                <span className="plan__no">{String(i + 1).padStart(2, "0")}</span>
                {dark && <span className="plan__badge">Start here</span>}
                <h3 className="t-h5">{n}</h3>
                <p className="desc">{d}</p>
                <div className="plan__price"><p className="t-h3">{cur === "NGN" ? ngn : usd}</p><span>/ month</span></div>
                <ul>{feats.map((f) => <li key={f}>{f}</li>)}</ul>
                <Btn href="/contact" className={`btn--block${dark ? " btn--accent" : ""}`}>Get started</Btn>
              </article>
            ))}
          </div>
        ) : (
          <div className="bill-panel" id="panel-projects" role="tabpanel" aria-labelledby="tab-projects">
            <div className="bill-head" aria-hidden="true"><span>Project</span><span>Best for</span><span>What you get</span><span>From</span></div>
            <div className="awards awards--price">
              {rows.map(([t, s, d, n]) => (
                <div className="award" key={t}>
                  <h3 className="t-h5">{t}</h3>
                  <p className="award__sub">{s}</p>
                  <p className="award__desc">{d}</p>
                  <p className="award__year">{n}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="bill-note">Prices exclude taxes. Every project starts with a scoped brief, and the currency toggle sets the invoice currency. <Link href="/pricing">See the full rate card</Link>.</p>
      </Reveal>
    </section>
  );
}
