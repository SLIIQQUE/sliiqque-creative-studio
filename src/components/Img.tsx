import Image from "next/image";

type Props = { id: string; w: number; h: number; alt?: string; className?: string; eager?: boolean; /** Fetch at page load without LCP priority, for images that scroll in sideways (e.g. the reel). */ preload?: boolean; /** Overrides the default `sizes` when the rendered width is not the viewport on mobile (e.g. 46vw reel tiles). */ sizes?: string };

/** Original Framer images (public/img/<id>), rendered at the template's measured size. */
export default function Img({ id, w, h, alt = "", className, eager = false, preload = false, sizes }: Props) {
  return (
    <Image
      src={`/img/${id}`}
      width={w}
      height={h}
      alt={alt}
      className={className}
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
