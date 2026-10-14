"use client";

import { useEffect, useState } from "react";

/** Fixed gradient bar at the top of the viewport, scaled to scroll position (site.css .scroll-progress). Shared visual language with sliiqque.space. */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const max = scrollHeight - clientHeight;
      setProgress(max > 0 ? Math.min(1, scrollTop / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="scroll-progress"
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ transform: `scaleX(${progress})` }}
    />
  );
}
