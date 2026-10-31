import Link from "next/link";
import CityLanding from "@/components/CityLanding";
import { pageMeta, shareImg } from "@/lib/seo";

const PATH = "/ai-product-photography-lagos";
const BLOG = "ai-product-photography-vs-studio-shoot-cost-turnaround";

export const metadata = pageMeta({
  title: "AI Product Photography Lagos from ₦75,000",
  description: "AI product photography for Lagos brands: 5 SKUs, 3 styled images each, from ₦75,000 ($140), in 5 working days. Product identical in every frame.",
  path: PATH,
  keywords: ["AI product photography Lagos", "AI product photography Nigeria", "ecommerce product photos Lagos", "packshot photography Lagos", "AI photoshoot for brands"],
  image: { url: shareImg("ode-beard-oil.jpg"), alt: "AI product photography from Lagos: ODÈ beard oil bottle in hand, concept work" },
});

export default function Page() {
  return (
    <CityLanding
      path={PATH}
      service="ai-photography"
      h1="AI product photography in Lagos"
      breadcrumbName="AI Product Photography in Lagos"
      offer={{ name: "Product Photo Pack, 5 SKUs", ngn: "75000", usd: "140" }}
      lead={<p>SLIIQQUE is a Lagos creative studio that produces commercial product and lifestyle images without a conventional studio shoot. The Product Photo Pack covers 5 SKUs with 3 styled high-resolution images each for ₦75,000 (US$140), delivered in 5 working days, with your product held consistent in every frame.</p>}
      who={[
        "Online stores and Instagram-led sellers with many SKUs and no studio budget for each one",
        "Beauty, skincare, grooming and food brands that need styled lifestyle scenes",
        "Brands refreshing product pages, marketplace listings, paid ads and social feeds",
        "Teams that need images fast, without booking a studio, models and props across the city",
      ]}
      extra={{
        title: "AI photography or a studio shoot?",
        body: <p>AI photography suits catalogues, product pages, ads and social content. A studio shoot is still right when exact fit, fabric or texture must be documented. Many brands use both. The full comparison is in <Link href={`/blogs/${BLOG}`}>AI photography vs a studio shoot: cost and speed</Link>.</p>,
      }}
      faqs={[
        { q: "How much does AI product photography cost in Lagos?", a: "SLIIQQUE's Product Photo Pack is ₦75,000 (US$140) for 5 SKUs with 3 styled high-resolution images each, delivered in 5 working days. Prices exclude taxes. Monthly retainers from ₦150,000 (US$280) include stills alongside video." },
        { q: "Do I need to be in Lagos?", a: "No. SLIIQQUE is based in Lagos, but the work is done from photos you send, so brands anywhere in Nigeria, Africa and worldwide can order. Nigerian clients pay in naira and international clients in US dollars." },
        { q: "Will the product look exactly like mine?", a: "That is the point of the process. SLIIQQUE writes a permanent profile of the product covering shape, material, colour, label and the details that must not drift, and reuses it in every image. Your logo and packaging are used exactly as you supply them." },
        { q: "Can I use the images on marketplaces and in ads?", a: "One-off projects include commercial usage, assigned to you on full payment. Check each marketplace's own image rules, since some require unretouched photographs of the item." },
        { q: "When is a traditional studio shoot the better choice?", a: "When the exact fit, fabric behaviour or physical texture must be documented, or a platform requires unretouched photography. SLIIQQUE will tell you when that is the case." },
      ]}
      related={<><Link href="/services/ai-fashion-imagery">AI Fashion Imagery</Link>, <Link href="/ai-commercials-lagos">AI commercials in Lagos</Link>.</>}
      conceptNote={<p>The photography above is self-initiated concept work for fictional brands, not client work. See <Link href="/works/ode">ODÈ</Link> and <Link href="/works/ala-skin">ÀLÀ</Link>.</p>}
    />
  );
}
