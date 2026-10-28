"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SITE } from "@/lib/data";

export const NAV_LINKS = [
  { label: "Work", href: "/works" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/blogs" },
] as const;

const MENU_SERVICES = [
  ["AI Commercials", "/services/ai-commercials"],
  ["AI UGC & Digital Humans", "/services/ai-ugc-digital-humans"],
  ["AI Photography", "/services/ai-photography"],
  ["AI Fashion Imagery", "/services/ai-fashion-imagery"],
  ["Brand Launches & Campaigns", "/services/brand-launches-campaigns"],
];

/** Desktop links, the CTA, and a full-screen mobile menu with focus handling. */
export default function NavLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 960px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("menu-open");
    const panel = panelRef.current;
    const focusables = () => Array.from(panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      document.body.classList.remove("menu-open");
    };
  }, [open]);

  const current = (href: string) => !href.includes("#") && (pathname === href || pathname.startsWith(href + "/"));

  return (
    <>
      <ul className="nav-links">
        {NAV_LINKS.map((l) => (
          <li key={l.label}>
            <Link className="link-u" href={l.href} aria-current={current(l.href) ? "page" : undefined}>{l.label}</Link>
          </li>
        ))}
      </ul>
      <Link className="btn nav-cta" href="/contact" aria-current={pathname === "/contact" ? "page" : undefined}>Start a project</Link>

      <button ref={toggleRef} className="nav-toggle" type="button" aria-expanded={open} aria-controls="nav-panel" onClick={() => setOpen((o) => !o)}>
        {open ? "Close" : "Menu"}
      </button>

      {open && createPortal(
        <div className="nav-panel nav-panel--full" id="nav-panel" ref={panelRef} role="dialog" aria-modal="true" aria-label="Site menu">
          <div className="nav-panel__inner">
            <p className="nav-panel__eyebrow">Menu <span>{String(NAV_LINKS.length).padStart(2, "0")}</span></p>
            <ul className="nav-panel__main">
              {NAV_LINKS.map((l, i) => (
                <li key={l.label}>
                  <Link href={l.href} aria-current={current(l.href) ? "page" : undefined} aria-label={l.label}>
                    <span className="nav-panel__num">{String(i + 1).padStart(2, "0")}</span>
                    {l.label}
                    <span className="nav-panel__arrow" aria-hidden="true">↗</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="nav-panel__cols">
              <div>
                <h6>Services</h6>
                <ul>
                  {MENU_SERVICES.map(([label, href]) => <li key={href}><Link href={href}>{label}</Link></li>)}
                </ul>
              </div>
              <div>
                <h6>Studio</h6>
                <ul>
                  <li><Link href="/about">About</Link></li>
                  <li><Link href="/faq">FAQ</Link></li>
                  <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
                  <li><a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a></li>
                </ul>
              </div>
            </div>

            <Link className="btn btn--accent nav-panel__cta" href="/contact">Start a project ↗</Link>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
