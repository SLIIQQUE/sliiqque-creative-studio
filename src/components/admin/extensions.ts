"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { CONCEPT_LABEL_TEXT } from "@/lib/cms/rules";
import { PRICE_TOKEN_LABELS } from "@/lib/cms/prices";
import type { Doc } from "@/lib/cms/types";

export type MediaLite = { id: string; url: string; alt: string };

/** Atom block nodes that mirror the supported blocks in src/lib/cms/types.ts. Display attrs (src, alt) are editor-only and stripped on save. */
const imageNode = Node.create({
  name: "image",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return { mediaId: { default: null }, caption: { default: null }, src: { default: null }, alt: { default: "" } };
  },
  parseHTML: () => [{ tag: "div[data-type=image]" }],
  renderHTML({ node, HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "image", class: "block-card", contenteditable: "false" }), ["strong", "Image"], ["div", ["img", { src: node.attrs.src ?? "", alt: node.attrs.alt ?? "" }]], ["small", node.attrs.caption ? `Caption: ${node.attrs.caption}` : node.attrs.alt || "No alt text"]];
  },
});

const imagePairNode = Node.create({
  name: "imagePair",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return { first: { default: null }, second: { default: null }, firstSrc: { default: null }, secondSrc: { default: null } };
  },
  parseHTML: () => [{ tag: "div[data-type=imagePair]" }],
  renderHTML({ node, HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "imagePair", class: "block-card", contenteditable: "false" }), ["strong", "Image pair"], ["div", { class: "pair" }, ["img", { src: node.attrs.firstSrc ?? "" }], ["img", { src: node.attrs.secondSrc ?? "" }]]];
  },
});

const conceptLabelNode = Node.create({
  name: "conceptLabel",
  group: "block",
  atom: true,
  draggable: true,
  parseHTML: () => [{ tag: "div[data-type=conceptLabel]" }],
  renderHTML: ({ HTMLAttributes }) => ["div", mergeAttributes(HTMLAttributes, { "data-type": "conceptLabel", class: "block-card", contenteditable: "false" }), ["strong", "Concept label: "], CONCEPT_LABEL_TEXT] as never,
});

const serviceCtaNode = Node.create({
  name: "serviceCta",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return { serviceSlug: { default: null } };
  },
  parseHTML: () => [{ tag: "div[data-type=serviceCta]" }],
  renderHTML: ({ node, HTMLAttributes }) => ["div", mergeAttributes(HTMLAttributes, { "data-type": "serviceCta", class: "block-card", contenteditable: "false" }), ["strong", "Service call to action: "], String(node.attrs.serviceSlug ?? "")] as never,
});

const videoNode = Node.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return { youtubeId: { default: null }, title: { default: "Video" } };
  },
  parseHTML: () => [{ tag: "div[data-type=video]" }],
  renderHTML: ({ node, HTMLAttributes }) => ["div", mergeAttributes(HTMLAttributes, { "data-type": "video", class: "block-card", contenteditable: "false" }), ["strong", "YouTube video: "], `${node.attrs.title} (${node.attrs.youtubeId})`] as never,
});

const priceTokenNode = Node.create({
  name: "priceToken",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return { token: { default: "starter-retainer" } };
  },
  parseHTML: () => [{ tag: "div[data-type=priceToken]" }],
  renderHTML: ({ node, HTMLAttributes }) => ["div", mergeAttributes(HTMLAttributes, { "data-type": "priceToken", class: "block-card", contenteditable: "false" }), ["strong", "Price: "], PRICE_TOKEN_LABELS[node.attrs.token as keyof typeof PRICE_TOKEN_LABELS] ?? String(node.attrs.token)] as never,
});

export const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    code: false,
    codeBlock: false,
    strike: false,
    underline: false,
    horizontalRule: false,
    link: { openOnClick: false, autolink: false, protocols: ["http", "https", "mailto"] },
  }),
  Placeholder.configure({ placeholder: "Write the post. Start with a direct answer in the first two sentences." }),
  imageNode,
  imagePairNode,
  conceptLabelNode,
  serviceCtaNode,
  videoNode,
  priceTokenNode,
];

/** Adds the editor-only display attributes (image URL and alt) to a stored document. */
export function hydrateDoc(doc: Doc, media: Map<string, MediaLite>): unknown {
  const content = doc.content.map((b) => {
    if (b.type === "image") {
      const m = media.get(b.attrs.mediaId);
      return { ...b, attrs: { ...b.attrs, src: m?.url ?? null, alt: m?.alt ?? "" } };
    }
    if (b.type === "imagePair") {
      return { ...b, attrs: { ...b.attrs, firstSrc: media.get(b.attrs.first)?.url ?? null, secondSrc: media.get(b.attrs.second)?.url ?? null } };
    }
    return b;
  });
  return { ...doc, content };
}
