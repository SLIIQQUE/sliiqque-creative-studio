"use client";

import { createElement, useEffect, useRef, useState, type ComponentProps, type ElementType } from "react";

type Props<T extends ElementType> = { as?: T; className?: string } & Omit<ComponentProps<T>, "className" | "as">;

/** Scroll-reveal wrapper: adds `is-in` once 12% visible (opacity/translate defined in site.css). */
export default function Reveal<T extends ElementType = "div">({ as, className = "", ...rest }: Props<T>) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
  }, []);

  return createElement(as ?? "div", { ...rest, ref, className: `reveal${className ? " " + className : ""}${seen ? " is-in" : ""}` });
}
