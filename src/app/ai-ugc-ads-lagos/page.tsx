import Link from "next/link";
import CityLanding from "@/components/CityLanding";
import { pageMeta, shareImg } from "@/lib/seo";

const PATH = "/ai-ugc-ads-lagos";

export const metadata = pageMeta({
  title: "AI UGC Ads Lagos from ₦150,000 a Month",
  description: "AI UGC ads and identity-locked digital humans for Lagos brands. Retainers from ₦150,000 ($280) a month. Custom digital human ₦150,000. Start now.",
  path: PATH,
  keywords: ["AI UGC ads Lagos", "AI UGC ads Nigeria", "digital humans for brands Nigeria", "AI spokesperson Nigeria"],
  image: { url: shareImg("digital-human-woman-portrait.jpg"), alt: "AI UGC from Lagos: identity-locked digital human portrait" },
});

export default function Page() {
  return (
    <CityLanding
      path={PATH}
      service="ai-ugc-digital-humans"
      h1="AI UGC ads in Lagos"
      breadcrumbName="AI UGC Ads in Lagos"
      offer={{ name: "AI UGC retainer", ngn: "150000", usd: "280" }}
      lead={<p>SLIIQQUE is a Lagos creative studio that builds identity-locked digital humans and produces vertical UGC-style video for TikTok, Instagram Reels and Meta. Retainers start at ₦150,000 (US$280) a month, and a custom digital human is ₦150,000 (US$280).</p>}
      who={[
        "Lagos DTC, beauty, fashion, wellness, food and e-commerce brands that need a steady flow of short-form ads",
        "Brands that want one consistent on-screen spokesperson across every ad",
        "Teams that want to test many hooks and variants without booking creators for each one",
      ]}
      extra={{
        title: "What AI UGC is and is not",
        body: <>
          <p>AI UGC is creator-style short-form video presented by a photorealistic AI-generated person. The person is a synthetic digital human, exclusive to you, and is not presented as a real customer.</p>
          <p>SLIIQQUE does not produce fake reviews or testimonials presented as genuine, and does not create a likeness of a real person without written consent. Disclose AI content wherever a platform or law requires it. See the <Link href="/policies">Studio Policies</Link>.</p>
        </>,
      }}
      faqs={[
        { q: "How much do AI UGC ads cost in Lagos?", a: "SLIIQQUE retainers start at ₦150,000 (US$280) a month. A custom, identity-locked digital human is ₦150,000 (US$280) as a one-off project and is included in the Growth retainer at ₦350,000 (US$650) a month. Prices exclude taxes." },
        { q: "Will the same digital human appear in every ad?", a: "Yes. Each custom digital human has a permanent identity profile reused in every generation, and it is exclusive to you." },
        { q: "Do you create fake customer reviews?", a: "No. Digital humans are synthetic people and are not presented as real customers." },
        { q: "How soon is the first batch?", a: "The first batch is delivered within 7 days of the cycle starting, then in batches agreed in a monthly content plan." },
        { q: "Do I need to be in Lagos?", a: "No. The work is done remotely, so brands anywhere can order. Nigerian clients pay in naira and international clients in US dollars." },
      ]}
      related={<><Link href="/ai-commercials-lagos">AI commercials in Lagos</Link>, <Link href="/services/ai-fashion-imagery">AI Fashion Imagery</Link>.</>}
    />
  );
}
