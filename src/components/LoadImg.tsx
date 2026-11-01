"use client";

import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";

/** A plain <img> that shows the `.skel` shimmer in its own box until it has loaded (for uploads that are not run through next/image). */
export default function LoadImg({ className, onLoad, onError, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, []);
  return (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      {...rest}
      ref={ref}
      className={[className, loaded ? "" : "skel"].filter(Boolean).join(" ") || undefined}
      onLoad={(e) => { setLoaded(true); onLoad?.(e); }}
      onError={(e) => { setLoaded(true); onError?.(e); }}
    />
  );
}
