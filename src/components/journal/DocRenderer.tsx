import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import Img from "@/components/Img";
import Reveal from "@/components/Reveal";
import VideoEmbed from "@/components/VideoEmbed";
import { SERVICE_PAGES } from "@/data/services";
import { headingsOf } from "@/lib/cms/doc";
import { resolvePrice } from "@/lib/cms/prices";
import { CONCEPT_LABEL_TEXT, CTA_WORDING } from "@/lib/cms/rules";
import type { BlockNode, Doc, InlineNode, ParagraphNode } from "@/lib/cms/types";
import type { MediaView } from "@/lib/journal";
import { SITE_URL } from "@/lib/seo";

function inline(nodes: InlineNode[] | undefined): ReactNode {
  return (nodes ?? []).map((n, i) => {
    if (n.type === "hardBreak") return <br key={i} />;
    let out: ReactNode = n.text;
    for (const m of n.marks ?? []) {
      if (m.type === "bold") out = <strong>{out}</strong>;
      else if (m.type === "italic") out = <em>{out}</em>;
      else if (m.type === "link") {
        const href = m.attrs.href.startsWith(SITE_URL) ? m.attrs.href.slice(SITE_URL.length) || "/" : m.attrs.href;
        out = href.startsWith("/") || href.startsWith("#") ? <Link href={href}>{out}</Link> : <a href={href} rel="noopener noreferrer" target={href.startsWith("mailto:") ? undefined : "_blank"}>{out}</a>;
      }
    }
    return <Fragment key={i}>{out}</Fragment>;
  });
}

const para = (p: ParagraphNode, key: number) => <p key={key}>{inline(p.content)}</p>;

function Pic({ m, alt, eager }: { m: MediaView | undefined; alt?: string; eager?: boolean }) {
  if (!m) return null;
  return <Img id={m.url} w={m.width} h={m.height} alt={alt ?? m.alt} eager={eager} />;
}

/**
 * Renders a Doc with the journal's existing layout: every H2 starts a two-column "split" section, H3s are sub headings,
 * and an image pair closes the section and sits between sections. Only known node types render, so nothing in the
 * stored JSON can inject markup.
 */
export default function DocRenderer({ doc, media }: { doc: Doc; media: Map<string, MediaView> }) {
  type Item = { kind: "section"; heading: string | null; id: string | null; blocks: BlockNode[] } | { kind: "pair"; first: MediaView | undefined; second: MediaView | undefined; n: number };
  const ids = new Map(headingsOf(doc).map((h) => [h.text, h.id]));
  const items: Item[] = [];
  let current: Extract<Item, { kind: "section" }> | null = null;
  let pairs = 0;

  for (const b of doc.content) {
    if (b.type === "heading" && b.attrs.level === 2) {
      const text = (b.content ?? []).map((n) => (n.type === "text" ? n.text : " ")).join("").trim();
      current = { kind: "section", heading: text, id: ids.get(text) ?? null, blocks: [] };
      items.push(current);
    } else if (b.type === "imagePair") {
      current = null;
      items.push({ kind: "pair", first: media.get(b.attrs.first), second: media.get(b.attrs.second), n: ++pairs });
    } else {
      if (!current) {
        current = { kind: "section", heading: null, id: null, blocks: [] };
        items.push(current);
      }
      current.blocks.push(b);
    }
  }

  const renderBlock = (b: BlockNode, i: number): ReactNode => {
    switch (b.type) {
      case "heading":
        return <h3 key={i} className="t-h5 sub" id={ids.get((b.content ?? []).map((n) => (n.type === "text" ? n.text : " ")).join("").trim())}>{inline(b.content)}</h3>;
      case "paragraph":
        return b.content?.length ? para(b, i) : null;
      case "bulletList":
        return <ul key={i}>{b.content.map((li, j) => <li key={j}>{li.content.map((p) => inline(p.content))}</li>)}</ul>;
      case "orderedList":
        return <ol key={i} className="steps">{b.content.map((li, j) => <li key={j}>{li.content.map((p) => inline(p.content))}</li>)}</ol>;
      case "blockquote":
        return <blockquote key={i} className="post__quote">{b.content.map((p, j) => para(p, j))}</blockquote>;
      case "image": {
        const m = media.get(b.attrs.mediaId);
        return m ? <figure key={i} className="post__figure"><Pic m={m} />{b.attrs.caption ? <figcaption>{b.attrs.caption}</figcaption> : null}</figure> : null;
      }
      case "conceptLabel":
        return <p key={i} className="post__concept"><strong>{CONCEPT_LABEL_TEXT}</strong></p>;
      case "serviceCta": {
        const s = SERVICE_PAGES.find((x) => x.slug === b.attrs.serviceSlug);
        return s ? <p key={i} className="services-note"><Link href={`/services/${s.slug}`}>Explore the {s.name} service.</Link> <Link href="/contact">{CTA_WORDING}</Link></p> : null;
      }
      case "video":
        return <div key={i}><VideoEmbed youtubeId={b.attrs.youtubeId} title={b.attrs.title} /><p className="video__cap">{b.attrs.title}</p></div>;
      case "priceToken":
        return <p key={i}><strong>{resolvePrice(b.attrs.token)}</strong></p>;
      default:
        return null;
    }
  };

  return (
    <>
      {items.map((it, i) =>
        it.kind === "pair" ? (
          <Reveal key={i} className="post__gallery">
            <div><Pic m={it.first} alt={it.first ? undefined : ""} /></div>
            <div><Pic m={it.second} alt={it.second ? undefined : ""} /></div>
          </Reveal>
        ) : (
          <Reveal key={i} className="split">
            {it.heading ? <h2 className="t-h4" id={it.id ?? undefined}>{it.heading}</h2> : <span />}
            <div>{it.blocks.map(renderBlock)}</div>
          </Reveal>
        ),
      )}
    </>
  );
}
