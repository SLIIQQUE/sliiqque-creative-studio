import JsonLd from "@/components/JsonLd";
import SocialFollow from "@/components/SocialFollow";
import {
  abs,
  breadcrumbSchema,
  isoDate,
  ORG_ID,
  pageMeta,
  shareImg,
} from "@/lib/seo";
import LoadMore from "@/components/LoadMore";
import { PageHero } from "@/components/ui";
import { BLOGS, BLOGS_LISTED } from "@/lib/data";

export const metadata = pageMeta({
  title: "Journal: AI Production Notes",
  description:
    "SLIIQQUE's journal on digital human identity lock, AI fashion imagery and building creative systems, written from the studio's own production work.",
  path: "/blogs",
  keywords: [
    "AI commercial production guide",
    "digital human identity lock",
    "AI storyboard workflow",
    "AI photography guide",
  ],
  image: {
    url: shareImg(BLOGS[0][4]),
    alt: `${BLOGS[0][3]} SLIIQQUE Studio journal`,
  },
});

const BREADCRUMB = [
  { name: "Home", path: "/" },
  { name: "Journal", path: "/blogs" },
];

export default function BlogsPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "SLIIQQUE Studio journal",
            url: abs("/blogs"),
            inLanguage: "en-NG",
            publisher: { "@id": ORG_ID },
            blogPost: BLOGS.map((b) => ({
              "@type": "BlogPosting",
              headline: b[3].replace(/\.$/, ""),
              url: abs(`/blogs/${b[0]}`),
              datePublished: isoDate(b[1]),
            })),
          },
          breadcrumbSchema(BREADCRUMB),
        ]}
      />
      <PageHero
        h1="journal"
        sub="Notes on identity lock, AI fashion imagery and creative systems, written from our own production work."
        className="page-hero--blogs page-hero--flush"
        breadcrumb={BREADCRUMB}
      />
      <section className="sec sec--last">
        <div className="container">
          <LoadMore
            gridClass="blog-grid"
            wrapClass="center-btn center-btn--blogs"
            cells={BLOGS.map((b, i) => ({
              kind: "post" as const,
              item: b,
              hidden: i >= BLOGS_LISTED,
              phHide: i === 3,
            }))}
          />
          <SocialFollow placement="journal" />
        </div>
      </section>
    </>
  );
}
