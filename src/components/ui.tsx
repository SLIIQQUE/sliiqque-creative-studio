import Link from "next/link";
import type { ReactNode } from "react";

export function Btn({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return <Link className={`btn ${className}`.trim()} href={href}>{children}</Link>;
}

export function SecHead({ title, aside, asideClass = "" }: { title: ReactNode; aside?: ReactNode; asideClass?: string }) {
  return (
    <div className="sec-head">
      <h2 className="t-title">{title}</h2>
      {aside && <div className={`sec-aside ${asideClass}`.trim()}>{aside}</div>}
    </div>
  );
}

export function PageHero({ h1, sub, className = "", h1Class = "t-display" }: { h1: ReactNode; sub: string; className?: string; h1Class?: string }) {
  return (
    <section className={`page-hero${className ? " " + className : ""}`}>
      <div className="container">
        <div className="sec-head">
          <h1 className={h1Class}>{h1}</h1>
          <div className="sec-aside"><p>{sub}</p></div>
        </div>
      </div>
    </section>
  );
}

export function Pager({ prev, next }: { prev?: string; next?: string }) {
  return (
    <div className="pager">
      {prev && <Btn href={prev}>Previous</Btn>}
      {next && <Btn href={next}>Next</Btn>}
    </div>
  );
}
