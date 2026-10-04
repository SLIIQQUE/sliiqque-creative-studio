import Reveal from "./Reveal";
import { PageHero } from "./ui";
import type { LegalDoc } from "@/lib/data";

/** Terms, Studio Policies and Privacy Policy share one layout: numbered sections in the template's split rows. */
export default function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <PageHero h1={doc.title} sub={`Effective ${doc.effective} · Version ${doc.version}. ${doc.sub}`} className="page-hero--legal" />
      <section className="sec sec--last legal">
        <div className="legal__intro">
          {doc.intro.map((p) => <p key={p}>{p}</p>)}
        </div>
        {doc.sections.map((s) => (
          <Reveal className="split" key={s.h}>
            <h4 className="t-h4">{s.h}</h4>
            <div>
              {s.blocks.map((b, i) =>
                Array.isArray(b) ? <ul key={i}>{b.map((x) => <li key={x}>{x}</li>)}</ul> : <p key={i}>{b}</p>,
              )}
            </div>
          </Reveal>
        ))}
      </section>
    </>
  );
}
