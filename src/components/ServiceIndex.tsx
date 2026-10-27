"use client";

import Link from "next/link";
import { useState } from "react";
import Img from "./Img";
import { SERVICES } from "@/lib/data";
import { SERVICE_PAGES } from "@/data/services";

export default function ServiceIndex() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="svc-acc">
      {SERVICES.map((s, i) => {
        const [title, desc, tags, img] = s;
        const page = SERVICE_PAGES[i];
        const isOpen = open === i;
        return (
          <div className={`svc-acc__item${isOpen ? " is-open" : ""}`} key={page.slug}>
            <h3 className="svc-acc__h">
              <button
                className="svc-acc__head"
                type="button"
                aria-expanded={isOpen}
                aria-controls={`svc-panel-${i}`}
                id={`svc-btn-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="svc-acc__num">{String(i + 1).padStart(2, "0")}</span>
                <span className="svc-acc__name">{title}</span>
                <span className="svc-acc__tags">{tags.slice(0, 2).map((t) => <span className="tag" key={t}>{t}</span>)}</span>
                <span className="svc-acc__icon" aria-hidden="true">+</span>
              </button>
            </h3>
            <div className="svc-acc__panel" id={`svc-panel-${i}`} role="region" aria-labelledby={`svc-btn-${i}`} inert={!isOpen ? true : undefined}>
              <div className="svc-acc__inner">
                <div className="svc-acc__grid">
                  <figure className="svc-acc__media">
                    <Img id={img} w={760} h={475} alt={`${title} example frame by SLIIQQUE`} />
                  </figure>
                  <div className="svc-acc__detail">
                    <p className="svc-acc__desc">{desc}</p>
                    <ul className="svc-acc__list">
                      {page.included.slice(0, 4).map((x) => <li key={x}>{x}</li>)}
                    </ul>
                    <div className="svc-acc__meta">
                      <span>{page.priceLabel} <strong>{page.priceNgn}</strong></span>
                      <span>{page.timeline}</span>
                    </div>
                    <Link className="svc-acc__link" href={`/services/${page.slug}`}>Explore {title} <span aria-hidden="true">↗</span></Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
