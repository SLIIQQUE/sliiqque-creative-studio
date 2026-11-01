"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = { id: string; w: number; h: number; alt?: string; className?: string; eager?: boolean; /** Fetch at page load without LCP priority, for images that scroll in sideways (e.g. the reel). */ preload?: boolean; /** Overrides the default `sizes` when the rendered width is not the viewport on mobile (e.g. 46vw reel tiles). */ sizes?: string };

/**
 * Original Framer images (public/img/<id>), rendered at the template's measured size. An id that is already a path or URL (journal uploads) is used as is.
 * The image element is its own skeleton: it already holds its final box, so the shimmer (`.skel`) matches the layout exactly until it loads.
 */
export default function Img({ id, w, h, alt = "", className, eager = false, preload = false, sizes }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  // Cached images can finish before hydration, so onLoad never fires for them.
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, []);
  return (
    <Image
      ref={ref}
      src={/^(\/|https?:)/.test(id) ? id : `/img/${id}`}
      width={w}
      height={h}
      alt={alt}
      className={[className, loaded ? "" : "skel"].filter(Boolean).join(" ") || undefined}
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(true)}
      quality={90}
      sizes={sizes ?? `(max-width: 767px) 100vw, ${w}px`}
      priority={eager}
      // `priority` alone only adds the preload link; it does not set fetchPriority, so the LCP
      // image competes with everything else at browser-default priority unless this is explicit.
      fetchPriority={eager ? "high" : undefined}
      loading={eager || preload ? "eager" : "lazy"}
    />
  );
}
