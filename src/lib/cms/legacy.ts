import type { BlockNode, Doc, PostGroupLike } from "./types";

/** Image ids that ship in public/img are addressed as "img:<file>" instead of a media row id. */
export const staticMediaId = (file: string) => `img:${file}`;
export const isStaticMediaId = (id: string) => id.startsWith("img:");

/**
 * Converts the old JSON post shape (groups > subs > paragraphs, plus a two-image gallery) to a Doc.
 * Group heading becomes H2, sub heading becomes H3, paragraphs stay paragraphs, and short colon-ended paragraphs
 * (which the old renderer printed bold) become bold. The image pair goes after the second group, as before.
 * Used by the one-time import and by the JSON source adapter, so both render the same.
 */
export function legacyToDoc(groups: PostGroupLike[], gallery: string[]): Doc {
  const content: BlockNode[] = [];
  groups.forEach(([heading, subs], gi) => {
    content.push({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: heading }] });
    for (const [sub, paragraphs] of subs) {
      content.push({ type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: sub }] });
      for (const text of paragraphs) {
        const label = text.endsWith(":") && text.length < 40;
        content.push({ type: "paragraph", content: [label ? { type: "text", text, marks: [{ type: "bold" }] } : { type: "text", text }] });
      }
    }
    if (gi === 1 && gallery.length >= 2) {
      content.push({ type: "imagePair", attrs: { first: staticMediaId(gallery[0]), second: staticMediaId(gallery[1]) } });
    }
  });
  return { type: "doc", content };
}
