import Link from "next/link";
import type { ReactNode } from "react";
import Breadcrumbs from "./Breadcrumbs";
import { slugify } from "@/lib/seo";

export function Btn({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return <Link className={`btn ${className}`.trim()} href={href}>{children}</Link>;
}

export function SecHead({ title, aside, asideClass = "", index }: { title: ReactNode; aside?: ReactNode; asideClass?: string; index?: string }) {
  return (
    <div className="sec-head">
      <div>
        {index && <span className="sec-head__idx">{index}</span>}
        <h2 className="t-title" id={typeof title === "string" ? slugify(title) : undefined}>{title}</h2>
      </div>
      {aside && <div className={`sec-aside ${asideClass}`.trim()}>{aside}</div>}
    </div>
  );
}

export function PageHero({ h1, sub, className = "", h1Class = "t-display", breadcrumb }: { h1: ReactNode; sub: ReactNode; className?: string; h1Class?: string; breadcrumb?: { name: string; path: string }[] }) {
  return (
    <section className={`page-hero${className ? " " + className : ""}`}>
      <div className="container">
        {breadcrumb && <Breadcrumbs items={breadcrumb} />}
        <div className="sec-head">
          <h1 className={h1Class}>{h1}</h1>
          <div className="sec-aside">{typeof sub === "string" ? <p>{sub}</p> : sub}</div>
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
