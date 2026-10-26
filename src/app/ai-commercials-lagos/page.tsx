import Link from "next/link";
import CityLanding from "@/components/CityLanding";
import { pageMeta, shareImg } from "@/lib/seo";

const PATH = "/ai-commercials-lagos";
const BLOG = "how-much-does-an-ai-commercial-cost-in-lagos";

export const metadata = pageMeta({
  title: "AI Commercials Lagos from ₦350,000",
  description: "AI commercial production in Lagos: storyboard, build, grade, sound and Meta, TikTok and YouTube cutdowns. From ₦350,000 ($650), delivered in 7 days.",
  path: PATH,
  keywords: ["AI commercials Lagos", "AI video ads Lagos", "AI ad production Nigeria", "commercial production company Lagos"],
  image: { url: shareImg("ode-portrait.jpg"), alt: "AI commercial production from Lagos: ODÈ concept commercial" },
});

export default function Page() {
  return (
    <CityLanding
      path={PATH}
      service="ai-commercials"
      h1="AI commercials in Lagos"
      breadcrumbName="AI Commercials in Lagos"
      offer={{ name: "AI Commercial", ngn: "350000", usd: "650" }}
      lead={<p>SLIIQQUE is a Lagos creative studio that storyboards, builds, grades and cuts 30 to 60 second AI commercials for brands in Nigeria, Africa and worldwide. An AI commercial starts from ₦350,000 (US$650) with a 7 day turnaround, and includes platform cutdowns for Meta, TikTok and YouTube.</p>}
      gallery={[
        { id: "ode-portrait.jpg", alt: "AI commercial frame: ODÈ grooming concept, portrait" },
        { id: "ase-whiskey-sunset-stone-01.png", alt: "AI commercial frame: ÀSE spirits concept, bottle on stone at sunset" },
        { id: "ala-serum-prismatic-hero.png", alt: "AI commercial frame: ÀLÀ skincare concept, prismatic serum hero" },
      ]}
      who={[
        "Lagos brands launching a product that need a premium ad without a full production crew",
        "Startups and SMEs that want cinematic video for Meta, TikTok, YouTube and Instagram Reels",
        "Marketing teams that need several platform cutdowns from one hero spot",
        "Agencies that need a fast, storyboard-led production partner",
      ]}
      extra={{
        title: "What the price covers",
        body: <p>The ₦350,000 (US$650) AI Commercial is a 30 to 60 second spot with a nine-panel storyboard, locked product and character identity, one grade, sound, vertical, square and landscape cutdowns, two revision rounds and commercial usage rights. Larger scopes are quoted after a brief. The breakdown is in <Link href={`/blogs/${BLOG}`}>how much an AI commercial costs in Lagos</Link>.</p>,
      }}
      faqs={[
        { q: "How much does an AI commercial cost in Lagos?", a: "SLIIQQUE AI commercials start from ₦350,000 (US$650) for a 30 to 60 second spot with platform cutdowns, a high-resolution master, two revision rounds and commercial usage rights. Larger scopes are quoted after a brief. Prices exclude taxes." },
        { q: "How long does it take?", a: "The standard timeline is 7 days from receipt of the deposit and all required materials. Rush delivery is available at +50% where the schedule allows." },
        { q: "Can I run it as a paid ad?", a: "Yes. One-off projects include commercial usage, including paid media, assigned to you on full payment. You are responsible for any AI or synthetic-media labels the platform or law requires, and SLIIQQUE supplies suggested wording on request." },
        { q: "Do I need to be in Lagos?", a: "No. The work is done remotely from your brief and assets, so brands anywhere can order. Nigerian clients pay in naira and international clients in US dollars." },
        { q: "Do you design the logo?", a: "No. SLIIQQUE does not offer logo design and uses the logo and brand assets you supply." },
      ]}
      related={<><Link href="/services/ai-ugc-digital-humans">AI UGC and Digital Humans</Link>, <Link href="/ai-product-photography-lagos">AI product photography in Lagos</Link>.</>}
      conceptNote={<p>The frames above are self-initiated concept work for fictional brands, not client work. See <Link href="/works/ode">ODÈ</Link> and <Link href="/works/ase">ÀSE</Link>.</p>}
    />
  );
}
