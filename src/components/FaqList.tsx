import Accordion from "./Accordion";
import Reveal from "./Reveal";
import { IconArrow } from "./icons";
import { SecHead } from "./ui";
import type { Faq } from "@/data/services";

/** Visible FAQ accordion. Pair with faqSchema() so the markup and the structured data match. */
export default function FaqList({ faqs, title = "questions & answers", intro, id = "faq", last = true }: { faqs: Faq[]; title?: string; intro?: string; id?: string; last?: boolean }) {
  return (
    <section className={`sec${last ? " sec--last" : ""}`} id={id}>
      <Reveal className="container">
        <SecHead title={title} aside={intro ? <p>{intro}</p> : undefined} />
        <Accordion
          className="faq"
          itemClass="faq__item"
          items={faqs.map((f) => ({
            key: f.q,
            content: (
              <>
                <div className="faq__q"><h3 className="t-h5">{f.q}</h3><div className="icon-ring"><IconArrow /></div></div>
                <div className="faq__a"><p>{f.a}</p></div>
              </>
            ),
          }))}
        />
      </Reveal>
    </section>
  );
}
