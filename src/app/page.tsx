import Home from "@/components/Home";
import JsonLd from "@/components/JsonLd";
import { HERO, PLANS, PROJECT_ROWS, SERVICES } from "@/lib/data";
import { ORG_ID, SITE_URL, pageMeta, shareImg } from "@/lib/seo";

export const metadata = pageMeta({
  title: "AI Commercial & UGC Studio in Lagos, Nigeria | SLIIQQUE",
  description: "SLIIQQUE is a Lagos creative studio producing AI commercials, UGC, digital humans and AI product photography. Start a project from ₦150,000 / $280 a month.",
  path: "/",
  absoluteTitle: true,
  keywords: ["AI creative studio Lagos", "AI commercial production Nigeria", "AI UGC ads Nigeria", "AI product photography Lagos", "digital humans for advertising"],
  image: { url: shareImg(HERO.ticker[0]), alt: "SLIIQQUE Studio: AI-produced photorealistic digital human, extreme close-up" },
});

const num = (s: string) => s.replace(/[^\d]/g, "");

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": `${SITE_URL}/#webpage`,
            url: SITE_URL,
            name: "AI Commercials, AI UGC and AI Photography Studio in Lagos, Nigeria",
            isPartOf: { "@id": `${SITE_URL}/#website` },
            about: { "@id": ORG_ID },
            inLanguage: "en-NG",
          },
          {
            "@context": "https://schema.org",
            "@type": "OfferCatalog",
            name: "SLIIQQUE Studio retainers and projects",
            itemListElement: [
              ...PLANS.flatMap(([name, desc, ngn, , , usd]) => [
                { "@type": "Offer", name: `${name} (NGN)`, description: desc, priceCurrency: "NGN", price: num(ngn), priceSpecification: { "@type": "UnitPriceSpecification", price: num(ngn), priceCurrency: "NGN", unitText: "MONTH" }, seller: { "@id": ORG_ID } },
                { "@type": "Offer", name: `${name} (USD)`, description: desc, priceCurrency: "USD", price: num(usd), priceSpecification: { "@type": "UnitPriceSpecification", price: num(usd), priceCurrency: "USD", unitText: "MONTH" }, seller: { "@id": ORG_ID } },
              ]),
              ...PROJECT_ROWS.flatMap(([name, , desc, ngn, usd]) => [
                { "@type": "Offer", name: `${name} (NGN)`, description: desc, priceCurrency: "NGN", price: num(ngn), seller: { "@id": ORG_ID } },
                { "@type": "Offer", name: `${name} (USD)`, description: desc, priceCurrency: "USD", price: num(usd), seller: { "@id": ORG_ID } },
              ]),
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "SLIIQQUE Studio services",
            itemListElement: SERVICES.map(([name, desc], i) => ({ "@type": "ListItem", position: i + 1, name, description: desc })),
          },
        ]}
      />
      <Home />
    </>
  );
}
