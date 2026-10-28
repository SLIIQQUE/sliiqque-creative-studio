"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Img from "./Img";

function frameLabel(id: string) {
  if (id.startsWith("digital-human")) return "Digital human";
  if (id.startsWith("ala-")) return "ÀLÀ / Skincare";
  if (id.startsWith("ase-")) return "ÀSE / Spirits";
  if (id.startsWith("ode-")) return "ODÈ / Grooming";
  if (id.startsWith("fashion-")) return "Fashion";
  return "Studio frame";
}

/** Descriptive alt text from the frame's filename, e.g. "ode-beard-macro.jpg" -> "ODÈ grooming concept: beard macro". */
function frameAlt(id: string) {
  const [prefix, label] = ([["digital-human-", "Digital human"], ["ala-", "ÀLÀ skincare concept"], ["ase-", "ÀSE spirits concept"], ["ode-", "ODÈ grooming concept"], ["fashion-", "AI fashion imagery"]] as const).find(([p]) => id.startsWith(p)) ?? ["", "SLIIQQUE Studio frame"];
  const detail = id.replace(/\.[a-z]+$/, "").slice(prefix.length).replace(/-\d+$/, "").replace(/-/g, " ");
  return detail ? `${label}: ${detail}` : label;
}

function frameHref(id: string) {
  if (id.includes("ala")) return "/works/ala-skin";
  if (id.includes("ase")) return "/works/ase";
  if (id.includes("ode")) return "/works/ode";
  if (id.startsWith("fashion")) return "/services/ai-fashion-imagery";
  return "/services/ai-ugc-digital-humans";
}

function Row({ ids, reverse, offset, first }: { ids: string[]; reverse?: boolean; offset: number; first?: boolean }) {
  const list = reverse ? [...ids].reverse() : ids;
  const doubled = [...list, ...list];
  return (
    <div className={`showcase__row${reverse ? " showcase__row--rev" : ""}`}>
      {doubled.map((id, n) => {
        const clone = n >= list.length;
        return (
          <Link
            className="showcase__item"
            href={frameHref(id)}
            key={`${id}-${n}`}
            aria-hidden={clone ? true : undefined}
            tabIndex={clone ? -1 : undefined}
            data-cursor="View"
            aria-label={`${frameLabel(id)}. Open ${frameHref(id).startsWith("/works") ? "the concept case" : "the service"}`}
          >
            <Img id={id} w={300} h={375} alt={clone ? "" : frameAlt(id)} sizes="(max-width: 767px) 46vw, 300px" eager={first && n === 0} preload />
            <span className="showcase__cap">{String((n % list.length) + offset).padStart(2, "0")} / {frameLabel(id)}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function HeroReel({ ids }: { ids: string[] }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
  }, []);

  return (
    <div className="showcase">
      <div className={`showcase__rows${paused ? " is-paused" : ""}`}>
        <Row ids={ids} offset={1} first />
        <Row ids={ids} reverse offset={6} />
      </div>
      <div className="showcase__bar">
        <p className="showcase__meta"><span className="showcase__pulse" aria-hidden="true" />Selected frames / {String(ids.length).padStart(2, "0")} <span className="showcase__hint">Hover to hold</span></p>
        <button className="reel-toggle" type="button" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
          <span className={`reel-toggle__icon${paused ? " is-paused" : ""}`} aria-hidden="true" />
          {paused ? "Play reel" : "Pause reel"}
        </button>
      </div>
    </div>
  );
}
