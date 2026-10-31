import { z } from "zod";
import type { BlockNode, Doc, InlineNode, ListItemNode, Mark, ParagraphNode, PriceToken } from "./types";

/** Only these link targets are allowed in a post: http(s), mailto and site-relative paths. */
export function safeHref(href: string): string | null {
  const value = href.trim();
  if (!value || value.length > 2048) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (value.startsWith("#")) return value;
  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

const PRICE_TOKENS: PriceToken[] = ["ai-commercial-from", "starter-retainer", "growth-retainer", "scale-retainer", "brand-launch", "photo-pack", "digital-human"];
const uuid = z.string().uuid();
const youtubeId = z.string().regex(/^[A-Za-z0-9_-]{11}$/);

function cleanInline(nodes: unknown): InlineNode[] {
  if (!Array.isArray(nodes)) return [];
  const out: InlineNode[] = [];
  for (const raw of nodes) {
    if (!raw || typeof raw !== "object") continue;
    const n = raw as { type?: string; text?: unknown; marks?: unknown };
    if (n.type === "hardBreak") {
      out.push({ type: "hardBreak" });
    } else if (n.type === "text" && typeof n.text === "string" && n.text.length > 0) {
      const marks: Mark[] = [];
      if (Array.isArray(n.marks)) {
        for (const m of n.marks as { type?: string; attrs?: { href?: unknown } }[]) {
          if (m?.type === "bold") marks.push({ type: "bold" });
          else if (m?.type === "italic") marks.push({ type: "italic" });
          else if (m?.type === "link" && typeof m.attrs?.href === "string") {
            const href = safeHref(m.attrs.href);
            if (href) marks.push({ type: "link", attrs: { href } });
          }
        }
      }
      out.push(marks.length ? { type: "text", text: n.text, marks } : { type: "text", text: n.text });
    }
  }
  return out;
}

function cleanParagraph(raw: unknown): ParagraphNode | null {
  const n = raw as { type?: string; content?: unknown };
  if (n?.type !== "paragraph") return null;
  const content = cleanInline(n.content);
  return content.length ? { type: "paragraph", content } : { type: "paragraph" };
}

function cleanListItems(raw: unknown): ListItemNode[] {
  if (!Array.isArray(raw)) return [];
  const items: ListItemNode[] = [];
  for (const item of raw as { type?: string; content?: unknown }[]) {
    if (item?.type !== "listItem" || !Array.isArray(item.content)) continue;
    const paragraphs = item.content.map(cleanParagraph).filter((p): p is ParagraphNode => p !== null);
    if (paragraphs.length) items.push({ type: "listItem", content: paragraphs });
  }
  return items;
}

/**
 * Turns whatever the editor sent into a Doc that contains only supported nodes, marks and attributes.
 * Unknown nodes are dropped, links are checked, ids are validated. Run on every save.
 */
export function sanitizeDoc(input: unknown): Doc {
  const blocks: BlockNode[] = [];
  const raw = (input as { content?: unknown })?.content;
  if (Array.isArray(raw)) {
    for (const node of raw as Record<string, unknown>[]) {
      switch (node?.type) {
        case "paragraph": {
          const p = cleanParagraph(node);
          if (p) blocks.push(p);
          break;
        }
        case "heading": {
          const level = (node.attrs as { level?: number } | undefined)?.level;
          blocks.push({ type: "heading", attrs: { level: level === 3 ? 3 : 2 }, content: cleanInline(node.content) });
          break;
        }
        case "bulletList":
        case "orderedList": {
          const items = cleanListItems(node.content);
          if (items.length) blocks.push({ type: node.type, content: items } as BlockNode);
          break;
        }
        case "blockquote": {
          const content = Array.isArray(node.content) ? node.content.map(cleanParagraph).filter((p): p is ParagraphNode => p !== null) : [];
          if (content.length) blocks.push({ type: "blockquote", content });
          break;
        }
        case "image": {
          const a = node.attrs as { mediaId?: unknown; caption?: unknown } | undefined;
          const id = uuid.safeParse(a?.mediaId);
          if (id.success) blocks.push({ type: "image", attrs: { mediaId: id.data, caption: typeof a?.caption === "string" && a.caption.trim() ? a.caption.trim().slice(0, 300) : null } });
          break;
        }
        case "imagePair": {
          const a = node.attrs as { first?: unknown; second?: unknown } | undefined;
          const first = uuid.safeParse(a?.first);
          const second = uuid.safeParse(a?.second);
          if (first.success && second.success) blocks.push({ type: "imagePair", attrs: { first: first.data, second: second.data } });
          break;
        }
        case "conceptLabel":
          blocks.push({ type: "conceptLabel" });
          break;
        case "serviceCta": {
          const slug = (node.attrs as { serviceSlug?: unknown } | undefined)?.serviceSlug;
          if (typeof slug === "string" && /^[a-z0-9-]{1,120}$/.test(slug)) blocks.push({ type: "serviceCta", attrs: { serviceSlug: slug } });
          break;
        }
        case "video": {
          const a = node.attrs as { youtubeId?: unknown; title?: unknown } | undefined;
          const id = youtubeId.safeParse(a?.youtubeId);
          if (id.success) blocks.push({ type: "video", attrs: { youtubeId: id.data, title: typeof a?.title === "string" ? a.title.slice(0, 200) : "Video" } });
          break;
        }
        case "priceToken": {
          const token = (node.attrs as { token?: unknown } | undefined)?.token;
          if (PRICE_TOKENS.includes(token as PriceToken)) blocks.push({ type: "priceToken", attrs: { token: token as PriceToken } });
          break;
        }
        default:
          break;
      }
    }
  }
  return { type: "doc", content: blocks.length ? blocks : [{ type: "paragraph" }] };
}

const inlineText = (nodes: InlineNode[] | undefined) => (nodes ?? []).map((n) => (n.type === "text" ? n.text : " ")).join("");

/** Plain text of the whole document, one block per line. Used for the feed, llms.txt, search and word counts. */
export function docToText(doc: Doc, resolvePrice?: (token: PriceToken) => string): string {
  const lines: string[] = [];
  for (const b of doc.content) {
    switch (b.type) {
      case "paragraph":
      case "heading":
        lines.push(inlineText(b.content));
        break;
      case "bulletList":
      case "orderedList":
        for (const li of b.content) lines.push(li.content.map((p) => inlineText(p.content)).join(" "));
        break;
      case "blockquote":
        lines.push(b.content.map((p) => inlineText(p.content)).join(" "));
        break;
      case "priceToken":
        if (resolvePrice) lines.push(resolvePrice(b.attrs.token));
        break;
      default:
        break;
    }
  }
  return lines.map((l) => l.trim()).filter(Boolean).join("\n");
}

export const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;
export const readingMinutes = (text: string) => Math.max(1, Math.round(wordCount(text) / 200));

export type Heading = { level: 2 | 3; text: string; id: string };

export function headingsOf(doc: Doc): Heading[] {
  const used = new Map<string, number>();
  const out: Heading[] = [];
  for (const b of doc.content) {
    if (b.type !== "heading") continue;
    const text = inlineText(b.content).trim();
    if (!text) continue;
    const base = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "section";
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    out.push({ level: b.attrs.level, text, id: n === 0 ? base : `${base}-${n}` });
  }
  return out;
}

export function mediaIdsOf(doc: Doc): string[] {
  const ids = new Set<string>();
  for (const b of doc.content) {
    if (b.type === "image") ids.add(b.attrs.mediaId);
    if (b.type === "imagePair") {
      ids.add(b.attrs.first);
      ids.add(b.attrs.second);
    }
  }
  return [...ids];
}

export const linksOf = (doc: Doc): string[] => {
  const hrefs: string[] = [];
  const scan = (nodes: InlineNode[] | undefined) => {
    for (const n of nodes ?? []) if (n.type === "text") for (const m of n.marks ?? []) if (m.type === "link") hrefs.push(m.attrs.href);
  };
  for (const b of doc.content) {
    if (b.type === "paragraph" || b.type === "heading") scan(b.content);
    else if (b.type === "bulletList" || b.type === "orderedList") b.content.forEach((li) => li.content.forEach((p) => scan(p.content)));
    else if (b.type === "blockquote") b.content.forEach((p) => scan(p.content));
  }
  return hrefs;
};

/** Text of the first non-empty paragraph, the lede used for structured data when no description is set. */
export function firstParagraphText(doc: Doc): string {
  for (const b of doc.content) {
    if (b.type === "paragraph") {
      const t = inlineText(b.content).trim();
      if (t) return t;
    }
  }
  return "";
}
