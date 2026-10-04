"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const NAV_LINKS = [
  { label: "Work", href: "/works" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/#pricing" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/blogs" },
] as const;

/** Primary links, "Start a project" CTA and the small-screen menu. Marks the current section with aria-current. */
export default function NavLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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

      <button className="nav-toggle" type="button" aria-expanded={open} aria-controls="nav-panel" onClick={() => setOpen((o) => !o)}>
        {open ? "Close" : "Menu"}
      </button>
      {open && (
        <div className="nav-panel" id="nav-panel">
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} aria-current={current(l.href) ? "page" : undefined}>{l.label}</Link>
              </li>
            ))}
          </ul>
          <Link className="btn btn--accent btn--block" href="/contact">Start a project</Link>
        </div>
      )}
    </>
  );
}
