"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Item = { id: string; label: string };

/** Curated order and labels for the homepage; every other page builds its rail from its own headings. */
const HOME: Item[] = [
  { id: "works", label: "Work" },
  { id: "services", label: "Services" },
  { id: "process", label: "Process" },
  { id: "pricing", label: "Pricing" },
  { id: "blogs", label: "Journal" },
];

/** Fewer than this is not worth a rail. Long pages (Terms, Policies) scroll inside the rail, see .rail in site.css. */
const MIN = 3;
const MAX = 40;

function pageItems(): Item[] {
  const seen = new Set<string>();
  const items: Item[] = [];
  document.querySelectorAll<HTMLElement>("main h2").forEach((h, n) => {
    // Use the wrapping section only when it holds this one heading; otherwise (legal and service pages put
    // every heading in one section) the heading itself is the scroll target.
    const sec = h.closest<HTMLElement>("section");
    const target = sec && sec.querySelectorAll("h2").length === 1 ? sec : h;
    if (!target.id) target.id = `rail-${n}`;
    const label = (h.textContent ?? "").replace(/\s+/g, " ").trim().replace(/^\d+\s*[./]?\s*/, "");
    if (!label || seen.has(target.id)) return;
    seen.add(target.id);
    items.push({ id: target.id, label: label.length > 28 ? `${label.slice(0, 26).trimEnd()}...` : label });
  });
  return items;
}

export default function SectionRail() {
  const pathname = usePathname();
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState("");
  const [hidden, setHidden] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Keep the active dot centred in a rail that scrolls (without moving the page itself).
  useEffect(() => {
    const nav = navRef.current;
    const cur = nav?.querySelector<HTMLElement>('a[aria-current="true"]');
    if (nav && cur) nav.scrollTo({ top: cur.offsetTop - nav.clientHeight / 2 + cur.offsetHeight / 2, behavior: "smooth" });
  }, [active, items]);

  useEffect(() => {
    let io: IntersectionObserver | undefined;
    let fo: IntersectionObserver | undefined;
    // Wait a frame so the new route's content is in the DOM before reading headings.
    const raf = requestAnimationFrame(() => {
      const list = pathname === "/" ? HOME.filter((s) => document.getElementById(s.id)) : pageItems();
      const usable = list.length >= MIN && list.length <= MAX ? list : [];
      setItems(usable);
      setActive(usable[0]?.id ?? "");
      if (!usable.length) return;
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
        },
        { rootMargin: "-40% 0px -45% 0px", threshold: 0 },
      );
      usable.forEach((s) => io!.observe(document.getElementById(s.id)!));
      const foot = document.querySelector(".footer");
      if (foot) {
        fo = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), { threshold: 0.04 });
        fo.observe(foot);
      }
    });
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      fo?.disconnect();
      setHidden(false);
    };
  }, [pathname]);

  if (!items.length) return null;
  return (
    <nav ref={navRef} className={`rail${hidden ? " is-hidden" : ""}`} aria-label="Page sections">
      <ol>
        {items.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} aria-current={active === s.id ? "true" : undefined}>
              <span className="rail__label">{s.label}</span>
              <span className="rail__dot" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
