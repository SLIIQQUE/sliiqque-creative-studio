/** Tiptap JSON document, narrowed to the nodes and marks the journal supports. See docs/journal-admin-cms-plan.md section 7. */
export type Mark =
  | { type: "bold" }
  | { type: "italic" }
  | { type: "link"; attrs: { href: string } };

export type TextNode = { type: "text"; text: string; marks?: Mark[] };

export type InlineNode = TextNode | { type: "hardBreak" };

export type ParagraphNode = { type: "paragraph"; content?: InlineNode[] };
export type HeadingNode = { type: "heading"; attrs: { level: 2 | 3 }; content?: InlineNode[] };
export type ListItemNode = { type: "listItem"; content: ParagraphNode[] };
export type BulletListNode = { type: "bulletList"; content: ListItemNode[] };
export type OrderedListNode = { type: "orderedList"; content: ListItemNode[] };
export type BlockquoteNode = { type: "blockquote"; content: ParagraphNode[] };
/** An image from the media library, referenced by id. Alt text lives on the media row. */
export type ImageNode = { type: "image"; attrs: { mediaId: string; caption?: string | null } };
/** Two library images side by side, matching the existing journal gallery layout. */
export type ImagePairNode = { type: "imagePair"; attrs: { first: string; second: string } };
/** The approved concept-work label. */
export type ConceptLabelNode = { type: "conceptLabel" };
/** A call to action linking to one of the five service pages. */
export type ServiceCtaNode = { type: "serviceCta"; attrs: { serviceSlug: string } };
export type VideoNode = { type: "video"; attrs: { youtubeId: string; title: string } };
/** Inserts a price from the data module so post text never goes stale. */
export type PriceTokenNode = { type: "priceToken"; attrs: { token: PriceToken } };

export type PriceToken = "ai-commercial-from" | "starter-retainer" | "growth-retainer" | "scale-retainer" | "brand-launch" | "photo-pack" | "digital-human";

export type BlockNode =
  | ParagraphNode
  | HeadingNode
  | BulletListNode
  | OrderedListNode
  | BlockquoteNode
  | ImageNode
  | ImagePairNode
  | ConceptLabelNode
  | ServiceCtaNode
  | VideoNode
  | PriceTokenNode;

export type Doc = { type: "doc"; content: BlockNode[] };

export type FaqItem = { q: string; a: string };

export type SeoFields = {
  title?: string;
  description?: string;
  canonical?: string;
  ogMediaId?: string;
  focusKeyword?: string;
  noindex?: boolean;
};

export const EMPTY_DOC: Doc = { type: "doc", content: [{ type: "paragraph" }] };

export type Role = "owner" | "editor";
export type PostStatus = "draft" | "scheduled" | "published" | "archived";

/** The old JSON post shape: [heading, [[subheading, paragraphs[]], ...]]. */
export type PostGroupLike = [heading: string, subs: [string, string[]][]];
