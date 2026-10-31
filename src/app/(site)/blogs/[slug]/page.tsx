import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import Link from "next/link";
import Img from "@/components/Img";
import ShareLinks from "@/components/ShareLinks";
import SocialFollow from "@/components/SocialFollow";
import VideoBlock from "@/components/VideoBlock";
import { Pager } from "@/components/ui";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import DocRenderer from "@/components/journal/DocRenderer";
import { BlogCard } from "@/components/cards";
import { serviceBySlug } from "@/data/services";
import { docToText, firstParagraphText, wordCount } from "@/lib/cms/doc";
import { resolvePrice } from "@/lib/cms/prices";
import { findRedirect, getJournalCards, getJournalEntry, getPublishedSlugs } from "@/lib/journal";
import { abs, breadcrumbSchema, faqSchema, founderSchema, ORG_ID, pageMeta, SITE_NAME, shareImg } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    return (await getPublishedSlugs()).map((slug) => ({ slug }));
  } catch (error) {
    // No database at build time: pages are then generated on first request and cached.
    console.error("generateStaticParams: could not list journal posts", error);
    return [];
  }
}

const isStatic = (url: string) => url.startsWith("/img/");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const draft = (await draftMode()).isEnabled;
  const e = await getJournalEntry(slug, { draft });
  if (!e) return {};
  const headline = e.title.replace(/\.$/, "");
  const seoTitle = e.seo.title?.trim();
  const branded = `${seoTitle || headline} | ${SITE_NAME}`;
  const hero = e.seo.shareUrl ? { url: e.seo.shareUrl, alt: headline } : e.hero ? (isStatic(e.hero.url) ? { url: shareImg(e.hero.url.slice(5)), alt: headline } : { url: e.hero.url, alt: headline, width: e.hero.width, height: e.hero.height }) : undefined;
  const meta = pageMeta({
    // Same suffix as every other page, dropped when it would push the title past ~60 characters.
    title: branded.length <= 60 ? branded : seoTitle || headline,
    absoluteTitle: true,
    image: hero,
    description: e.metaDescription,
    path: `/blogs/${slug}`,
    type: "article",
    published: e.isoDate,
    noindex: !!e.seo.noindex || draft,
    keywords: [e.category, "AI creative studio Lagos", "AI production workflow"],
  });
  return e.seo.canonical ? { ...meta, alternates: { ...meta.alternates, canonical: e.seo.canonical } } : meta;
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const draft = (await draftMode()).isEnabled;
  const e = await getJournalEntry(slug, { draft });
  if (!e) {
    const moved = await findRedirect(`/blogs/${slug}`);
    if (moved) (moved.code === 301 || moved.code === 308 ? permanentRedirect : redirect)(moved.to);
    notFound();
  }

  const { cards } = await getJournalCards();
  const i = cards.findIndex((c) => c[0] === slug);
  const title = e.title;
  const headline = title.replace(/\.$/, "");
  const service = serviceBySlug(e.serviceSlug ?? "");
  const breadcrumb = [{ name: "Home", path: "/" }, { name: "Journal", path: "/blogs" }, { name: headline, path: `/blogs/${slug}` }];
  const heroImg = e.hero ? (e.hero.url.startsWith("http") ? e.hero.url : abs(e.hero.url)) : undefined;

  return (
    <section className="case post">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline,
            description: e.seo.description?.trim() || firstParagraphText(e.doc) || e.excerpt,
            datePublished: e.isoDate,
            dateModified: e.modifiedIso,
            articleSection: e.category,
            keywords: [e.category, "AI creative studio Lagos", "AI production workflow"].join(", "),
            wordCount: wordCount(docToText(e.doc, resolvePrice)),
            isPartOf: { "@type": "Blog", name: "SLIIQQUE Studio journal", url: abs("/blogs") },
            inLanguage: "en-NG",
            url: abs(`/blogs/${slug}`),
            mainEntityOfPage: abs(`/blogs/${slug}`),
            ...(heroImg ? { image: heroImg } : {}),
            author: founderSchema({ worksFor: { "@id": ORG_ID } }),
            publisher: { "@id": ORG_ID },
          },
          breadcrumbSchema(breadcrumb),
          ...(e.faq.length ? [faqSchema(e.faq)] : []),
        ]}
      />
      {draft ? (
        <p className="services-note" style={{ background: "#fff6e0", padding: 12, borderRadius: 8 }}>
          Preview: you are viewing {e.slug} as a draft, only you can see this. <a href={`/api/admin/preview/exit?to=/admin/posts`}>Exit preview</a>
        </p>
      ) : null}
      <Breadcrumbs items={breadcrumb} />
      <div className="case__head">
        <h1 className="case__title">{title}</h1>
        <div className="case__meta case__meta--post">
          <div><p className="t-h5 case__label">Published</p><p><time dateTime={e.isoDate}>{e.dateLabel}</time></p></div>
          <div><p className="t-h5 case__label">Category</p><p>{e.category}</p></div>
          <div><p className="t-h5 case__label">Written by</p><p className="byline">{e.author.avatarId ? <Img id={e.author.avatarId} w={32} h={32} alt="" className="byline__img" /> : null}<Link href="/about">{e.author.name}{e.author.title ? `, ${e.author.title}` : ""}</Link></p></div>
        </div>
      </div>
      {e.hero ? <div className="post__hero"><Img id={e.hero.url} w={1188} h={754} alt={e.hero.alt || headline} eager /></div> : null}
      <DocRenderer doc={e.doc} media={e.media} />
      {e.faq.length ? (
        <div className="split">
          <h2 className="t-h4">Questions</h2>
          <div>{e.faq.map((f) => <div key={f.q}><h3 className="t-h5 sub">{f.q}</h3><p>{f.a}</p></div>)}</div>
        </div>
      ) : null}
      {e.related.length ? (
        <div className="split">
          <h2 className="t-h4">Related</h2>
          <div className="blog-grid">{e.related.map((b) => <BlogCard key={b[0]} b={b} />)}</div>
        </div>
      ) : null}
      {service && (
        <p className="services-note">
          Related service: <Link href={`/services/${service.slug}`}>{service.name}</Link>. <Link href="/services">All services</Link> · <Link href="/works">Concept work</Link> · <Link href="/contact">Start a project</Link>.
        </p>
      )}
      <VideoBlock path={`/blogs/${slug}`} />
      <ShareLinks url={abs(`/blogs/${slug}`)} title={headline} />
      <SocialFollow placement="journal-post" />
      <Pager prev={i > 0 ? `/blogs/${cards[i - 1][0]}` : undefined} next={i >= 0 && i < cards.length - 1 ? `/blogs/${cards[i + 1][0]}` : undefined} />
    </section>
  );
}
