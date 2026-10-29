import Reveal from "./Reveal";
import { SecHead } from "./ui";
import type { Row } from "@/lib/data";

/** Four-row hover list (the template's awards block), used here for process and studio standards. */
export default function Awards({ id, title, intro, rows, priceCol = false, tone, ghost, index }: { id: string; title: string; intro: string; rows: Row[]; priceCol?: boolean; tone?: "night"; ghost?: string; index?: string }) {
  return (
    <section className={`sec${tone === "night" ? " sec--night" : ""}`} id={id}>
      {ghost && <span className="awards__ghost" aria-hidden="true">{ghost}</span>}
      <Reveal className="container">
        <SecHead index={index} title={title} aside={<p>{intro}</p>} asideClass="sec-aside--lift" />
        <div className={`awards${priceCol ? " awards--price" : ""}`}>
          {rows.map(([t, s, d, n]) => (
            <div className="award" key={t}>
              <h3 className="t-h5">{t}</h3>
              <p className="award__sub">{s}</p>
              <p className="award__desc">{d}</p>
              <p className="award__year">{n}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
