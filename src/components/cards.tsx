"use client";

import Link from "next/link";
import Img from "./Img";
import Reveal from "./Reveal";
import type { Blog, Work } from "@/lib/data";

export function WorkCard({ w, className = "" }: { w: Work; className?: string }) {
  const [slug, name, cat, svc, yr, im, alt] = w;
  return (
    <Reveal as={Link} href={`/works/${slug}`} className={`work ${className}`.trim()}>
      <div className="work__row"><h5>{name}</h5><span>{cat}</span></div>
      <div className="work__img"><Img id={im} w={640} h={577} alt={`${name}: ${cat.split(" · ")[0].toLowerCase()} concept brand visual by SLIIQQUE`} /></div>
      <div className="work__row"><span>{svc}</span><span>{yr}</span></div>
    </Reveal>
  );
}

export function BlogCard({ b, className = "" }: { b: Blog; className?: string }) {
  const [slug, date, cat, title, im] = b;
  return (
    <Reveal as={Link} href={`/blogs/${slug}`} className={`post-card ${className}`.trim()}>
      <div className="post-card__img"><Img id={im} w={640} h={441} alt={title.replace(/\.$/, "")} /></div>
      <div className="post-meta"><span>{date}</span><i /><span>{cat}</span></div>
      <h3>{title}</h3>
    </Reveal>
  );
}
