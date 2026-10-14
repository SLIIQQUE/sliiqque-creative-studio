import Link from "next/link";
import { SITE } from "@/lib/data";
import { PRODUCT_ENGINEERING } from "@/lib/seo";
import { LogoFooter } from "./Logo";
import DemoForm from "./DemoForm";

type Item = [label: string, href: string, external?: boolean];

const STUDIO: Item[] = [
  ["Home", "/"], ["Work", "/works"], ["About", "/about"], ["Journal", "/blogs"], ["FAQ", "/faq"], ["Glossary", "/glossary"], ["Contact", "/contact"],
  [`${PRODUCT_ENGINEERING.name} ↗`, PRODUCT_ENGINEERING.url, true],
];
const SERVICES: Item[] = [
  ["AI Commercials", "/services/ai-commercials"],
  ["AI UGC & Digital Humans", "/services/ai-ugc-digital-humans"],
  ["AI Photography", "/services/ai-photography"],
  ["AI Fashion Imagery", "/services/ai-fashion-imagery"],
  ["Brand Launches & Campaigns", "/services/brand-launches-campaigns"],
  ["Pricing", "/#pricing"],
];
const LEGAL: Item[] = [["Terms & Conditions", "/terms"], ["Studio Policies", "/policies"], ["Privacy Policy", "/privacy"]];

function Column({ title, items }: { title: string; items: Item[] }) {
  return (
    <nav aria-label={title}>
      <h6>{title}</h6>
      <ul>
        {items.map(([label, href, external]) => (
          <li key={label}>
            {external ? (
              <a className="link-u" href={href} target="_blank" rel="noopener noreferrer">{label}</a>
            ) : (
              <Link className="link-u" href={href}>{label}</Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Footer() {
  const phone = SITE.phone.replace(/\s/g, "");
  const connect: Item[] = [
    ...SITE.social.map(([t, u]): Item => [t, u, true]),
    ["WhatsApp", `https://wa.me/${phone.replace("+", "")}`, true],
  ];
  return (
    <footer className="footer">
      <div className="footer__in">
        <Link className="footer__logo" href="/" aria-label="SLIIQQUE Studio home"><LogoFooter /></Link>
        <div className="footer__mid">
          <div className="footer__about">
            <p>{SITE.footer_blurb}</p>
            <a className="mail" href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <a className="tel" href={`tel:${phone}`}>{SITE.phone}</a>
          </div>
          <DemoForm className="footer__news" label="Sign up">
            <p>{SITE.news_blurb}</p>
            <input className="field-dark" type="email" name="email" placeholder="Email address" aria-label="Email address" required />
          </DemoForm>
        </div>
        <div className="footer__cols">
          <Column title="Studio" items={STUDIO} />
          <Column title="Services" items={SERVICES} />
          <Column title="Legal" items={LEGAL} />
          <Column title="Connect" items={connect} />
        </div>
        <div className="footer__bottom">
          <p>{SITE.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
