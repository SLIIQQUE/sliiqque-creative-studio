"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { lagosToday, type Notice } from "@/lib/notice-utils";

const KEY = "sliiqque-notice-closed";

/** Notice above the navigation on every public page. Closing it is remembered on the device until the notice changes. */
export default function NoticeBar({ notice }: { notice: Notice }) {
  const [hidden, setHidden] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    // The page can be cached past the notice's last day, so the date is checked in the browser too.
    if (notice.hideAfter && lagosToday() > notice.hideAfter) return setHidden(true);
    try {
      if (localStorage.getItem(KEY) === notice.version) setHidden(true);
    } catch {
      /* Storage can be blocked. The notice then simply shows on every visit. */
    }
  }, [notice.hideAfter, notice.version]);

  // The notice is part of the sticky header, so sticky and scroll offsets elsewhere add its height (--head-h in site.css).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const publish = () => root.style.setProperty("--notice-h", `${el.offsetHeight}px`);
    publish();
    const watch = new ResizeObserver(publish);
    watch.observe(el);
    return () => {
      watch.disconnect();
      root.style.removeProperty("--notice-h");
    };
  }, [hidden]);

  if (hidden) return null;

  const close = () => {
    setHidden(true);
    try {
      localStorage.setItem(KEY, notice.version);
    } catch {
      /* Not remembered, still closed for this page view. */
    }
  };

  const cta = notice.link ? (
    notice.link.href.startsWith("/") ? (
      <Link className="notice__cta" href={notice.link.href}>{notice.link.label}<i aria-hidden="true" /></Link>
    ) : (
      <a className="notice__cta" href={notice.link.href} target="_blank" rel="noopener noreferrer">{notice.link.label}<i aria-hidden="true" /></a>
    )
  ) : null;

  return (
    <aside className="notice" aria-label="Notice" ref={ref}>
      <div className="notice__in">
        {notice.label ? <span className="notice__tag"><b aria-hidden="true" />{notice.label}</span> : null}
        <p className="notice__text">{notice.message}</p>
        {cta}
        <button type="button" className="notice__close" onClick={close} aria-label="Close this notice">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
    </aside>
  );
}
