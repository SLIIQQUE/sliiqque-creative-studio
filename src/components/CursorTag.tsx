"use client";

import { useEffect, useRef } from "react";

/** A single disc that follows the pointer and names the action under it. Touch and reduced-motion safe. */
export default function CursorTag() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(hover: none)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let x = -100;
    let y = -100;

    const paint = () => {
      raf = 0;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      if (target) {
        const label = target.dataset.cursor;
        if (label && el.textContent !== label) el.textContent = label;
        el.classList.add("is-on");
      } else {
        el.classList.remove("is-on");
      }
    };

    const leave = () => el.classList.remove("is-on");

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} className="cursor-tag" aria-hidden="true" />;
}
