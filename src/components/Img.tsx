import Image from "next/image";

type Props = { id: string; w: number; h: number; alt?: string; className?: string; eager?: boolean };

/** Original Framer images (public/img/<id>), rendered at the template's measured size. */
export default function Img({ id, w, h, alt = "", className, eager = false }: Props) {
  return (
    <Image
      src={`/img/${id}`}
      width={w}
      height={h}
      alt={alt}
      className={className}
      quality={90}
      sizes={`(max-width: 767px) 100vw, ${w}px`}
      priority={eager}
      loading={eager ? undefined : "lazy"}
    />
  );
}
