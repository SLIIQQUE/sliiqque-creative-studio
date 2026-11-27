"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import VideoEmbed from "./VideoEmbed";

export type ReelItem = { youtubeId: string; title: string; type: string; portrait: boolean };

/**
 * Homepage showreel: a filmstrip of films at one shared height, so horizontal and vertical films line up.
 * Several films are on screen at once and the next one peeks in at the edge. Scroll, swipe or use the arrows.
 */
export default function ReelRail({ items }: { items: ReelItem[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [at, setAt] = useState(1);

  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    // The film whose left edge is nearest the left of the rail is "current".
    const cards = Array.from(el.children) as HTMLElement[];
    let best = 0;
    let gap = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - el.offsetLeft - el.scrollLeft);
      if (d < gap) { gap = d; best = i; }
    });
    setAt(best + 1);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const go = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="reel">
      <div className="reel__bar">
        <p className="reel__count" aria-live="polite"><strong>{pad(at)}</strong> / {pad(items.length)}</p>
        <div className="reel__nav">
          <button type="button" className="reel__btn" onClick={() => go(-1)} disabled={edge.start} aria-label="Previous films">&larr;</button>
          <button type="button" className="reel__btn" onClick={() => go(1)} disabled={edge.end} aria-label="Next films">&rarr;</button>
        </div>
      </div>
      <div className="reel__rail" ref={rail} onScroll={measure} tabIndex={0} aria-label="Showreel films, scroll sideways">
        {items.map((v) => (
          <article key={v.youtubeId} className={`reel__card${v.portrait ? " reel__card--tall" : ""}`} style={{ "--ar": v.portrait ? 9 / 16 : 16 / 9 } as React.CSSProperties}>
            <div className="reel__media">
              <VideoEmbed youtubeId={v.youtubeId} title={v.title} portrait={v.portrait} />
              <span className="reel__chip">{v.type}</span>
            </div>
            <h3 className="reel__title">{v.title}</h3>
          </article>
        ))}
      </div>
    </div>
  );
}
