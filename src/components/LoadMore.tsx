"use client";

import { useEffect, useState } from "react";
import { BlogCard, WorkCard } from "./cards";
import type { Blog, Work } from "@/lib/data";

type Cell =
  | { kind: "work"; item: Work; hidden: boolean; phHide: boolean }
  | { kind: "post"; item: Blog; hidden: boolean; phHide: boolean };

/** Grid + "Load More". Cards flagged `hidden` are display:none everywhere; `phHide` only on phones (matches the template). */
export default function LoadMore({ gridClass, wrapClass, cells, step = 4 }: { gridClass: string; wrapClass: string; cells: Cell[]; step?: number }) {
  const [shown, setShown] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);

  // Nothing left to reveal at this viewport (e.g. every card already listed on desktop): hide the button.
  useEffect(() => {
    const phone = window.matchMedia("(max-width: 767.98px)").matches;
    if (!cells.some((c) => c.hidden || (c.phHide && phone))) setDone(true);
  }, [cells]);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const phone = window.matchMedia("(max-width: 767.98px)").matches;
    const hiddenNow = cells.filter((c) => (c.hidden || (c.phHide && phone)) && !shown.has(c.item[0]));
    const next = new Set(shown);
    hiddenNow.slice(0, step).forEach((c) => next.add(c.item[0]));
    setShown(next);
    if (hiddenNow.length <= step) setDone(true);
  };

  return (
    <>
      <div className={gridClass}>
        {cells.map((c) => {
          const cls = shown.has(c.item[0]) ? "is-shown" : c.hidden ? "is-hidden" : c.phHide ? "ph-hide" : "";
          return c.kind === "work" ? <WorkCard key={c.item[0]} w={c.item} className={cls} /> : <BlogCard key={c.item[0]} b={c.item} className={cls} />;
        })}
      </div>
      <div className={wrapClass}>
        <a className={`btn${done ? " is-hidden" : ""}`} href="#" onClick={onClick}>Load More</a>
      </div>
    </>
  );
}
