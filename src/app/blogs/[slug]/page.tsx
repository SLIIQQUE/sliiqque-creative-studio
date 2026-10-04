import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import Img from "@/components/Img";
import Reveal from "@/components/Reveal";
import { Pager } from "@/components/ui";
import JsonLd from "@/components/JsonLd";
import { BLOGS, POSTS } from "@/lib/data";
import { abs, breadcrumbSchema, isoDate, ORG_ID, pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BLOGS.map((b) => ({ slug: b[0] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const b = BLOGS.find((x) => x[0] === slug);
  if (!b) return {};
  const first = POSTS[slug].groups[0][1][0][1][0];
  return pageMeta({
    title: `${b[3].replace(/\.$/, "")} | SLIIQQUE`,
    absoluteTitle: true,
    description: first.length > 155 ? `${first.slice(0, 152).trimEnd()}...` : first,
    path: `/blogs/${slug}`,
    type: "article",
    published: isoDate(b[1]),
    keywords: [b[2], "AI creative studio Lagos", "AI production workflow"],
  });
}

const Para = ({ p }: { p: string }) => (p.endsWith(":") && p.length < 40 ? <p><strong>{p}</strong></p> : <p>{p}</p>);

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const i = BLOGS.findIndex((x) => x[0] === slug);
  if (i < 0) notFound();
  const [, date, cat, title, cardImg] = BLOGS[i];
  const P = POSTS[slug];

  return (
    <section className="case post">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: title.replace(/\.$/, ""),
            description: P.groups[0][1][0][1][0],
            datePublished: isoDate(date),
            dateModified: isoDate(date),
            articleSection: cat,
            inLanguage: "en-NG",
            url: abs(`/blogs/${slug}`),
            mainEntityOfPage: abs(`/blogs/${slug}`),
            author: { "@type": "Person", name: "Gabriel Njoabozia" },
            publisher: { "@id": ORG_ID },
          },
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Journal", path: "/blogs" }, { name: title.replace(/\.$/, ""), path: `/blogs/${slug}` }]),
        ]}
      />
      <div className="case__head">
        <h1 className="case__title">{title}</h1>
        <div className="case__meta case__meta--post">
          <div><h5 className="t-h5">Date</h5><p>{date}</p></div>
          <div><h5 className="t-h5">Category</h5><p>{cat}</p></div>
        </div>
      </div>
      <Reveal className="post__hero"><Img id={cardImg} w={1188} h={754} alt={title.replace(/\.$/, "")} eager /></Reveal>
      {P.groups.map(([h4, subs], gi) => (
        <Fragment key={h4}>
          <Reveal className="split">
            <h4 className="t-h4">{h4}</h4>
            <div>
              {subs.map(([h, ps]) => (
                <Fragment key={h}>
                  <h5 className="t-h5 sub">{h}</h5>
                  {ps.map((x) => <Para key={x} p={x} />)}
                </Fragment>
              ))}
            </div>
          </Reveal>
          {gi === 1 && (
            <Reveal className="post__gallery">
              <div><Img id={P.gallery[0]} w={640} h={635} alt={`${title.replace(/\.$/, "")}, illustration 1`} /></div>
              <div><Img id={P.gallery[1]} w={640} h={635} alt={`${title.replace(/\.$/, "")}, illustration 2`} /></div>
            </Reveal>
          )}
        </Fragment>
      ))}
      <Pager prev={i > 0 ? `/blogs/${BLOGS[i - 1][0]}` : undefined} next={i < BLOGS.length - 1 ? `/blogs/${BLOGS[i + 1][0]}` : undefined} />
    </section>
  );
}
