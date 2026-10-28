"use client";

import { createElement, useEffect, useRef, useState, type ComponentProps, type ElementType } from "react";

type Props<T extends ElementType> = { as?: T; className?: string; /** Above-the-fold content: render shown from the server HTML so it can paint (and count as LCP) before hydration. */ visible?: boolean } & Omit<ComponentProps<T>, "className" | "as">;

/** Scroll-reveal wrapper: adds `is-in` once 12% visible (opacity/translate defined in site.css). */
export default function Reveal<T extends ElementType = "div">({ as, className = "", visible = false, ...rest }: Props<T>) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(visible);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return createElement(as ?? "div", { ...rest, ref, className: `reveal${className ? " " + className : ""}${seen ? " is-in" : ""}` });
}
