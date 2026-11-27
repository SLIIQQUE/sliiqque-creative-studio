"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Img from "./Img";
import type { HeroFrame } from "@/lib/hero";

function Row({ frames, reverse, offset, first }: { frames: HeroFrame[]; reverse?: boolean; offset: number; first?: boolean }) {
  const ordered = reverse ? [...frames].reverse() : frames;
  // A short list is repeated until one pass is wide enough, so the row never shows a gap when it loops.
  const list = Array.from({ length: Math.max(1, Math.ceil(6 / Math.max(1, ordered.length))) }, () => ordered).flat();
  const doubled = [...list, ...list];
  return (
    <div className={`showcase__row${reverse ? " showcase__row--rev" : ""}`}>
      {doubled.map((f, n) => {
        const clone = n >= list.length;
        return (
          <Link
            className="showcase__item"
            href={f.href}
            key={`${f.src}-${n}`}
            aria-hidden={clone ? true : undefined}
            tabIndex={clone ? -1 : undefined}
            data-cursor="View"
            aria-label={`${f.label}. Open ${f.href.startsWith("/works") ? "the concept case" : "the page"}`}
          >
            <Img id={f.src} w={300} h={375} alt={f.alt} sizes="(max-width: 767px) 46vw, 300px" eager={first && n === 0} preload />
            <span className="showcase__cap">{String((n % ordered.length) + offset).padStart(2, "0")} / {f.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function HeroReel({ frames }: { frames: HeroFrame[] }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
  }, []);

  return (
    <div className="showcase">
      <div className={`showcase__rows${paused ? " is-paused" : ""}`}>
        <Row frames={frames} offset={1} first />
        <Row frames={frames} reverse offset={6} />
      </div>
      <div className="showcase__bar">
        <p className="showcase__meta"><span className="showcase__pulse" aria-hidden="true" />Selected frames / {String(frames.length).padStart(2, "0")} <span className="showcase__hint">Hover to hold</span></p>
        <button className="reel-toggle" type="button" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
          <span className={`reel-toggle__icon${paused ? " is-paused" : ""}`} aria-hidden="true" />
          {paused ? "Play reel" : "Pause reel"}
        </button>
      </div>
    </div>
  );
}
