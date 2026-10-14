import JsonLd from "@/components/JsonLd";
import { abs, breadcrumbSchema, pageMeta, shareImg } from "@/lib/seo";
import LoadMore from "@/components/LoadMore";
import { PageHero } from "@/components/ui";
import { BLOGS, BLOGS_LISTED } from "@/lib/data";

export const metadata = pageMeta({
  title: "Journal: AI Production Notes",
  description:
    "SLIIQQUE's journal on identity lock, storyboarding, upscaling, grading and ten-second animation blocks, written from the studio's own production work.",
  path: "/blogs",
  keywords: ["AI commercial production guide", "digital human identity lock", "AI storyboard workflow", "AI photography guide"],
  image: { url: shareImg(BLOGS[0][4]), alt: `${BLOGS[0][3]} SLIIQQUE Studio journal` },
});

export default function BlogsPage() {
  return (
    <>
      <JsonLd data={[{ "@context": "https://schema.org", "@type": "Blog", name: "SLIIQQUE Studio journal", url: abs("/blogs") }, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Journal", path: "/blogs" }])]} />
      <PageHero h1="journal" sub="Notes on identity lock, storyboarding, grading and fashion imagery, written from our own production work." className="page-hero--blogs" />
      <section className="sec sec--last">
        <div className="container">
          <LoadMore
            gridClass="blog-grid"
            wrapClass="center-btn center-btn--blogs"
            cells={BLOGS.map((b, i) => ({ kind: "post" as const, item: b, hidden: i >= BLOGS_LISTED, phHide: i === 3 }))}
          />
        </div>
      </section>
    </>
  );
}
