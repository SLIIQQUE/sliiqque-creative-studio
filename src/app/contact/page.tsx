import JsonLd from "@/components/JsonLd";
import { abs, breadcrumbSchema, ORG_ID, pageMeta, shareImg } from "@/lib/seo";
import DemoForm from "@/components/DemoForm";
import Reveal from "@/components/Reveal";
import { PageHero } from "@/components/ui";
import { CONTACT as C, SITE } from "@/lib/data";

export const metadata = pageMeta({
  title: "Contact SLIIQQUE: Start a Project",
  description:
    "Contact SLIIQQUE in Lagos: hello@sliiqque.space or call/WhatsApp +234 704 100 0085. Mon to Fri, 9am to 6pm WAT. Replies within one working day.",
  path: "/contact",
  keywords: ["contact SLIIQQUE", "hire AI creative studio Lagos", "AI commercial quote Nigeria"],
  image: { url: shareImg("digital-human-face-macro.jpg"), alt: "SLIIQQUE Studio: AI-produced photorealistic digital human, extreme close-up" },
});

function Select({ id, name, placeholder, options }: { id: string; name: string; placeholder: string; options: string[] }) {
  return (
    <select id={id} name={name} required defaultValue="">
      <option value="" disabled>{placeholder}</option>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

const BREADCRUMB = [{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }];

export default function ContactPage() {
  return (
    <>
      <JsonLd data={[{ "@context": "https://schema.org", "@type": "ContactPage", name: "Contact SLIIQQUE Studio", url: abs("/contact"), about: { "@id": ORG_ID } }, breadcrumbSchema(BREADCRUMB)]} />
      <PageHero h1={C.h2} sub={C.sub} className="page-hero--contact" breadcrumb={BREADCRUMB} />
      <section className="sec sec--last">
        <Reveal className="contact">
          <div className="contact__info">
            <h4 className="t-h4">Start Here</h4>
            {C.groups.map(([t, h, d]) => <div className="contact__grp" key={t}>{h ? <a href={h}>{t}</a> : <span>{t}</span>}<p>{d}</p></div>)}
          </div>
          <DemoForm className="form" label="Send message" kind="contact" successMessage="Thanks — your message is in. We reply within one working day." mailtoFallback={SITE.email}>
            <div className="field"><label htmlFor="f-name">Name</label><input id="f-name" name="name" type="text" placeholder="Your name" required /></div>
            <div className="field"><label htmlFor="f-email">email address</label><input id="f-email" name="email" type="email" placeholder="Your email address" required /></div>
            <div className="field"><label htmlFor="f-phone">Phone number</label><input id="f-phone" name="phone" type="tel" placeholder="Your phone number" /></div>
            <div className="field"><label htmlFor="f-type">project type</label><Select id="f-type" name="type" placeholder="Select…" options={C.types} /></div>
            <div className="field field--full"><label htmlFor="f-budget">project budget range</label><Select id="f-budget" name="budget" placeholder="Ex: $2000-5000" options={C.budgets} /></div>
            <div className="field field--full field--msg"><label htmlFor="f-msg">message</label><textarea id="f-msg" name="message" placeholder="Write your project details/message" required /></div>
          </DemoForm>
        </Reveal>
      </section>
    </>
  );
}
