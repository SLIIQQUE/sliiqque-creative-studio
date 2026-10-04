"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";

type Item = { key: string; content: ReactNode };

/** One-open-at-a-time accordion (services + FAQ). First item starts open, as in the template. */
export default function Accordion({ className, itemClass, items }: { className: string; itemClass: string; items: Item[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const toggle = (i: number) => setOpen((cur) => (cur === i ? null : i));
  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(i);
    }
  };

  return (
    <div className={className}>
      {items.map((it, i) => (
        <div
          key={it.key}
          className={`${itemClass}${open === i ? " is-open" : ""}`}
          role="button"
          tabIndex={0}
          aria-expanded={open === i}
          onClick={() => toggle(i)}
          onKeyDown={(e) => onKey(e, i)}
        >
          {it.content}
        </div>
      ))}
    </div>
  );
}
