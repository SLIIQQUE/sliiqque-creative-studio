import JsonLd from "@/components/JsonLd";
import { abs, breadcrumbSchema, ORG_ID, pageMeta, shareImg } from "@/lib/seo";
import DemoForm from "@/components/DemoForm";
import Reveal from "@/components/Reveal";
import SocialFollow from "@/components/SocialFollow";
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

/** WebMCP parameter hint for AI agents filling the form. Spread, because the DOM types do not know the attribute yet. */
const mcp = (description: string) => ({ toolparamdescription: description });

function Select({ id, name, placeholder, options, hint }: { id: string; name: string; placeholder: string; options: string[]; hint: string }) {
  return (
    <select id={id} name={name} required defaultValue="" {...mcp(hint)}>
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
      <PageHero h1={C.h2} sub={C.sub} className="page-hero--contact page-hero--flush" breadcrumb={BREADCRUMB} />
      <section className="sec sec--last">
        <Reveal className="contact" visible>
          <div className="contact__info">
            <h2 className="t-h4">Start Here</h2>
            {C.groups.map(([t, h, d]) => <div className="contact__grp" key={t}>{h ? <a href={h}>{t}</a> : <span>{t}</span>}<p>{d}</p></div>)}
          </div>
          <DemoForm className="form" label="Send message" kind="contact" successMessage="Thanks — your message is in. We reply within one working day." mailtoFallback={SITE.email}>
            <div className="field"><label htmlFor="f-name">Name</label><input id="f-name" name="name" type="text" placeholder="Your name" required {...mcp("The sender's full name")} /></div>
            <div className="field"><label htmlFor="f-email">email address</label><input id="f-email" name="email" type="email" placeholder="Your email address" required {...mcp("The email address the studio should reply to")} /></div>
            <div className="field"><label htmlFor="f-phone">Phone number</label><input id="f-phone" name="phone" type="tel" placeholder="Your phone number" {...mcp("Optional phone or WhatsApp number")} /></div>
            <div className="field"><label htmlFor="f-type">project type</label><Select id="f-type" name="type" placeholder="Select…" options={C.types} hint="The kind of project, chosen from the listed options" /></div>
            <div className="field field--full"><label htmlFor="f-budget">project budget range</label><Select id="f-budget" name="budget" placeholder="Ex: $2000-5000" options={C.budgets} hint="The budget range, chosen from the listed options" /></div>
            <div className="field field--full field--msg"><label htmlFor="f-msg">message</label><textarea id="f-msg" name="message" placeholder="Write your project details/message" required {...mcp("What the sender wants made, for which product or brand, and any deadline")} /></div>
          </DemoForm>
        </Reveal>
        <div className="container"><SocialFollow placement="contact" heading="Prefer to look first?" sub="See the latest production notes and price breakdowns before you write to us." /></div>
      </section>
    </>
  );
}
