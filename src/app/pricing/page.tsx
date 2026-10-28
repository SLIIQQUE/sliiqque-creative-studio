import FaqList from "@/components/FaqList";
import JsonLd from "@/components/JsonLd";
import PricingPage from "@/components/PricingPage";
import { SITE_FAQ } from "@/data/services";
import { PLANS, PLANS_INTRO, PROJECT_ROWS, PROJECTS_INTRO } from "@/lib/data";
import { abs, breadcrumbSchema, CONTENT_UPDATED, faqSchema, ORG_ID, pageMeta, shareImg, SITE_URL } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Pricing: AI Creative Retainers and Project Rates",
  description:
    "SLIIQQUE pricing in naira and US dollars: monthly retainers from ₦150,000 ($280), plus AI commercials, product photo packs, digital humans and launch campaigns.",
  path: "/pricing",
  keywords: ["AI commercial pricing Nigeria", "AI UGC retainer cost", "digital human price", "AI product photography cost Lagos", "creative studio pricing Lagos"],
  image: { url: shareImg("studio-campaign-systems-moodboard.jpg"), alt: "SLIIQQUE Studio: campaign systems moodboard used to scope monthly retainers" },
});

const BREADCRUMB = [{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }];

/** The money questions already answered sitewide, shown here so the page and its FAQ schema carry the same text. */
const PRICING_FAQ = SITE_FAQ.filter(({ q }) => /how much do|revisions|payment|how long does|who owns|logos/i.test(q));

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const num = (s: string) => s.replace(/[^\d]/g, "");

export default function PricingRoute() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": `${SITE_URL}/pricing#webpage`,
            url: abs("/pricing"),
            name: "Pricing: AI creative retainers and project rates",
            isPartOf: { "@id": `${SITE_URL}/#website` },
            about: { "@id": ORG_ID },
            inLanguage: "en-NG",
          },
          {
            "@context": "https://schema.org",
            "@type": "OfferCatalog",
            name: "SLIIQQUE Studio retainers and projects",
            url: abs("/pricing"),
            itemListElement: [
              ...PLANS.flatMap(([name, desc, ngn, , , usd]) => [
                {
                  "@type": "Offer",
                  name: `${cap(name)} (NGN)`,
                  description: desc,
                  priceCurrency: "NGN",
                  price: num(ngn),
                  url: abs("/pricing"),
                  priceSpecification: { "@type": "UnitPriceSpecification", price: num(ngn), priceCurrency: "NGN", unitText: "MONTH" },
                  seller: { "@id": ORG_ID },
                },
                {
                  "@type": "Offer",
                  name: `${cap(name)} (USD)`,
                  description: desc,
                  priceCurrency: "USD",
                  price: num(usd),
                  url: abs("/pricing"),
                  priceSpecification: { "@type": "UnitPriceSpecification", price: num(usd), priceCurrency: "USD", unitText: "MONTH" },
                  seller: { "@id": ORG_ID },
                },
              ]),
              ...PROJECT_ROWS.flatMap(([name, , desc, ngn, usd]) => [
                { "@type": "Offer", name: `${cap(name)} (NGN)`, description: desc, priceCurrency: "NGN", price: num(ngn), url: abs("/pricing"), seller: { "@id": ORG_ID } },
                { "@type": "Offer", name: `${cap(name)} (USD)`, description: desc, priceCurrency: "USD", price: num(usd), url: abs("/pricing"), seller: { "@id": ORG_ID } },
              ]),
            ],
          },
          faqSchema(PRICING_FAQ),
          breadcrumbSchema(BREADCRUMB),
        ]}
      />

      <PricingPage plans={PLANS} plansIntro={PLANS_INTRO} projects={PROJECT_ROWS} projectsIntro={PROJECTS_INTRO} />

      <FaqList
        faqs={PRICING_FAQ}
        title="money questions"
        intro="What the price includes, how payment works and who owns the finished work."
        id="questions"
        updated={CONTENT_UPDATED}
      />
    </>
  );
}
