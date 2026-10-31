"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  archiveAction,
  deleteAction,
  publishAction,
  restoreAction,
  restoreRevisionAction,
  saveAction,
  scheduleAction,
  searchRelatedAction,
  unpublishAction,
  type PostPayload,
} from "@/app/admin/(console)/posts/actions";
import { blockers, runChecks, warnings } from "@/lib/cms/checks";
import { docToText, mediaIdsOf, safeHref, sanitizeDoc } from "@/lib/cms/doc";
import { aeoScore, geoScore, seoScore } from "@/lib/cms/seo-score";
import type { Doc, FaqItem, PostStatus, PriceToken, SeoFields } from "@/lib/cms/types";
import { extensions, hydrateDoc, type MediaLite } from "./extensions";
import MediaPicker from "./MediaPicker";

export type EditorPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: Doc;
  status: PostStatus;
  listed: boolean;
  isConcept: boolean;
  categoryId: string | null;
  serviceSlug: string | null;
  authorId: string | null;
  heroMediaId: string | null;
  seo: SeoFields;
  faq: FaqItem[];
  relatedIds: string[];
  scheduledForLocal: string;
  publishedAtLabel: string;
  scheduledLabel: string;
};

type Props = {
  post: EditorPost;
  categories: { id: string; name: string; serviceSlug: string | null }[];
  services: { slug: string; name: string }[];
  authors: { id: string; name: string }[];
  media: MediaLite[];
  related: { id: string; title: string }[];
  revisions: { id: string; title: string; savedAtLabel: string; note: string | null; savedBy: string | null }[];
  priceTokens: [PriceToken, string][];
  role: "owner" | "editor";
  siteOrigin: string;
  /** CSP nonce for the style element Tiptap injects. */
  nonce?: string;
};

type Target = "hero" | "og" | "image" | "pair1" | "pair2" | null;

const youtubeIdFrom = (value: string) => {
  const v = value.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(v)) return v;
  try {
    const u = new URL(v);
    const id = u.hostname === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v") ?? u.pathname.split("/").pop();
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
};

export default function PostEditor({ post, categories, services, authors, media: initialMedia, related: initialRelated, revisions, priceTokens, role, siteOrigin, nonce }: Props) {
  const router = useRouter();
  const [media, setMedia] = useState(initialMedia);
  const mediaMap = useMemo(() => new Map(media.map((m) => [m.id, m])), [media]);

  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [categoryId, setCategoryId] = useState(post.categoryId);
  const [serviceSlug, setServiceSlug] = useState(post.serviceSlug);
  const [authorId, setAuthorId] = useState(post.authorId);
  const [heroMediaId, setHeroMediaId] = useState(post.heroMediaId);
  const [isConcept, setIsConcept] = useState(post.isConcept);
  const [listed, setListed] = useState(post.listed);
  const [seo, setSeo] = useState<SeoFields>(post.seo);
  const [faq, setFaq] = useState<FaqItem[]>(post.faq);
  const [related, setRelated] = useState(initialRelated);
  const [status, setStatus] = useState(post.status);
  const [when, setWhen] = useState(post.scheduledForLocal);
  const [version, setVersion] = useState(0);
  const [saveState, setSaveState] = useState<"saved" | "dirty" | "saving" | "error">("saved");
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [target, setTarget] = useState<Target>(null);
  const pairFirst = useRef<MediaLite | null>(null);
  const [relQuery, setRelQuery] = useState("");
  const [relResults, setRelResults] = useState<{ id: string; title: string }[]>([]);
  const [focus, setFocus] = useState(false);
  const mounted = useRef(false);
  const archived = status === "archived";

  const editor = useEditor({
    extensions,
    content: hydrateDoc(post.body, new Map(initialMedia.map((m) => [m.id, m]))) as never,
    immediatelyRender: false,
    injectNonce: nonce,
    editable: !archived,
    editorProps: { attributes: { class: "ProseMirror", "aria-label": "Post body" } },
    onUpdate: () => setVersion((v) => v + 1),
  });

  const buildPayload = useCallback((): PostPayload => {
    const body = sanitizeDoc(editor?.getJSON());
    return { title, slug, excerpt, body, categoryId, serviceSlug, authorId, heroMediaId, isConcept, listed, seo: { ...seo, ogMediaId: seo.ogMediaId ?? undefined }, faq, relatedIds: related.map((r) => r.id) };
  }, [editor, title, slug, excerpt, categoryId, serviceSlug, authorId, heroMediaId, isConcept, listed, seo, faq, related]);

  const saveNow = useCallback(
    async (note?: string) => {
      setSaveState("saving");
      const r = await saveAction(post.id, buildPayload(), note);
      if (r.ok) {
        setSaveState("saved");
        if (r.slugChanged || r.slug !== slug) setSlug(r.slug);
        return true;
      }
      setSaveState("error");
      setMessage({ kind: "err", text: r.error });
      return false;
    },
    [post.id, buildPayload, slug],
  );

  // Autosave two and a half seconds after the last change.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (archived) return;
    setSaveState("dirty");
    const t = setTimeout(() => void saveNow(), 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, title, slug, excerpt, categoryId, serviceSlug, authorId, heroMediaId, isConcept, listed, seo, faq, related]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (saveState === "dirty" || saveState === "saving") e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveState]);

  const doc = useMemo(() => sanitizeDoc(editor?.getJSON()), [editor, version]); // eslint-disable-line react-hooks/exhaustive-deps
  const wordCount = useMemo(() => docToText(doc).split(/\s+/).filter(Boolean).length, [doc]);
  const hero = heroMediaId ? mediaMap.get(heroMediaId) : undefined;
  const effectiveService = serviceSlug ?? categories.find((c) => c.id === categoryId)?.serviceSlug ?? null;

  const checks = useMemo(
    () =>
      runChecks({
        title,
        excerpt,
        doc,
        seo,
        faq,
        isConcept,
        hasCategory: !!categoryId,
        hasService: !!effectiveService,
        hero: hero ? { alt: hero.alt } : null,
        imageAlts: mediaIdsOf(doc).map((id) => mediaMap.get(id)?.alt ?? ""),
      }),
    [title, excerpt, doc, seo, faq, isConcept, categoryId, effectiveService, hero, mediaMap],
  );
  const blocking = blockers(checks);
  const warn = warnings(checks);
  const score = useMemo(
    () => seoScore({ title, seoTitle: seo.title, seoDescription: seo.description, focusKeyword: seo.focusKeyword, doc, hasHero: !!hero, imageAlts: mediaIdsOf(doc).map((id) => mediaMap.get(id)?.alt ?? "") }),
    [title, seo, doc, hero, mediaMap],
  );
  const [lens, setLens] = useState<"seo" | "aeo" | "geo">("seo");
  const grades = useMemo(() => {
    const input = { title, seoTitle: seo.title, seoDescription: seo.description, focusKeyword: seo.focusKeyword, doc, hasHero: !!hero, imageAlts: mediaIdsOf(doc).map((id) => mediaMap.get(id)?.alt ?? ""), excerpt, faq };
    return { seo: score, aeo: aeoScore(input), geo: geoScore(input) };
  }, [title, seo, doc, hero, mediaMap, excerpt, faq, score]);
  const shown = grades[lens];

  async function run(label: string, fn: () => Promise<{ ok: boolean; error?: string }>, next?: PostStatus) {
    setMessage(null);
    const r = await fn();
    if (r.ok) {
      if (next) setStatus(next);
      setMessage({ kind: "ok", text: label });
      router.refresh();
    } else setMessage({ kind: "err", text: r.error ?? "Failed" });
  }

  async function publish() {
    if (!(await saveNow("Before publish"))) return;
    let reason: string | undefined;
    if (blocking.length) {
      if (role !== "owner") return setMessage({ kind: "err", text: "Fix the blocking checks first." });
      reason = window.prompt(`${blocking.length} blocking check(s) fail. Enter a reason to publish anyway (it is logged):`) ?? undefined;
      if (!reason?.trim()) return;
    }
    await run("Published.", () => publishAction(post.id, reason), "published");
  }

  async function schedule() {
    if (!when) return setMessage({ kind: "err", text: "Choose a date and time (Lagos time)." });
    if (!(await saveNow("Before schedule"))) return;
    let reason: string | undefined;
    if (blocking.length) {
      if (role !== "owner") return setMessage({ kind: "err", text: "Fix the blocking checks first." });
      reason = window.prompt("Blocking checks fail. Enter a reason to schedule anyway (it is logged):") ?? undefined;
      if (!reason?.trim()) return;
    }
    await run("Scheduled.", () => scheduleAction(post.id, when, reason), "scheduled");
  }

  function onPick(m: MediaLite) {
    if (target === "hero") setHeroMediaId(m.id);
    else if (target === "og") setSeo((s) => ({ ...s, ogMediaId: m.id }));
    else if (target === "image") editor?.chain().focus().insertContent({ type: "image", attrs: { mediaId: m.id, src: m.url, alt: m.alt, caption: null } }).run();
    else if (target === "pair1") {
      pairFirst.current = m;
      setTarget("pair2");
      return;
    } else if (target === "pair2" && pairFirst.current) {
      const f = pairFirst.current;
      editor?.chain().focus().insertContent({ type: "imagePair", attrs: { first: f.id, second: m.id, firstSrc: f.url, secondSrc: m.url } }).run();
      pairFirst.current = null;
    }
    setTarget(null);
  }

  function setLink() {
    if (!editor) return;
    const current = editor.getAttributes("link").href as string | undefined;
    const input = window.prompt("Link address (https://, mailto: or a site path like /services)", current ?? "https://");
    if (input === null) return;
    if (input === "") return void editor.chain().focus().unsetLink().run();
    const href = safeHref(input);
    if (!href) return setMessage({ kind: "err", text: "That link is not allowed. Use https://, mailto: or a path starting with /." });
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }

  async function searchRelated(q: string) {
    setRelQuery(q);
    setRelResults(q.length >= 2 ? await searchRelatedAction(q, post.id) : []);
  }

  const btn = (label: string, active: boolean, onClick: () => void, title?: string) => (
    <button type="button" aria-pressed={active} onClick={onClick} title={title ?? label} disabled={archived}>{label}</button>
  );

  const serp = {
    title: (seo.title || title || "Post title").slice(0, 70),
    url: `${siteOrigin.replace(/^https?:\/\//, "")} › blogs › ${slug || "slug"}`,
    description: (seo.description || excerpt || "The meta description appears here.").slice(0, 160),
  };
  const seoRing = 2 * Math.PI * 42;
  const seoDash = (shown.score / 100) * seoRing;
  const gradeColor = (n: number) => (n >= 80 ? "#1b8a48" : n >= 50 ? "#b57a00" : "#c0392b");
  const seoColor = gradeColor(shown.score);
  const lensCopy = {
    seo: ["Search health", "The piece is ready for discovery.", "Useful, but still has room to sharpen.", "Needs work before search can carry it."],
    aeo: ["Answer engines (AEO)", "Easy for answer boxes and voice assistants to quote.", "Some answers can be lifted, but they are not clear enough yet.", "Hard to pull a direct answer from. Lead with one and add an FAQ."],
    geo: ["AI citation (GEO)", "Specific and sourced enough for AI assistants to cite.", "Reasonable, but it needs more facts and sources to be cited.", "Too vague for AI assistants to trust. Add figures, sources and named facts."],
  }[lens];

  return (
    <div className={`adm-editorpage${focus ? " is-focus" : ""}`}>
      <div className="adm-head">
        <div style={{ minWidth: 0 }}>
          <p className="adm-kicker"><span className="adm-dot" /> Post editor <i>·</i> {status}</p>
          <h1 className="adm-head__title adm-head__title--post" style={{ marginTop: 12 }}>{title || "Untitled post"}</h1>
          <div className="adm-row" style={{ marginTop: 13, gap: 8 }}>
            <span className={`adm-pill adm-pill--${status}`}>{status}</span>
            <span className={`adm-savechip adm-savechip--${saveState}`}>
              {saveState === "saving" ? "Saving" : saveState === "dirty" ? "Unsaved changes" : saveState === "error" ? "Save failed" : "All changes saved"}
            </span>
            {post.publishedAtLabel ? <span className="adm-kicker">Published {post.publishedAtLabel}</span> : null}
            {status === "scheduled" && post.scheduledLabel ? <span className="adm-kicker">Goes live {post.scheduledLabel}</span> : null}
          </div>
        </div>
        <div className="adm-head__actions">
          <button type="button" className="adm-btn adm-btn--ghost adm-focus-btn" aria-pressed={focus} onClick={() => setFocus((value) => !value)}>
            {focus ? "Exit focus" : "Focus mode"}
          </button>
          <a className="adm-btn adm-btn--ghost" href={`/api/admin/preview?id=${post.id}`} target="_blank" rel="noreferrer">Preview</a>
          {status === "published" ? <a className="adm-btn adm-btn--ghost" href={`/blogs/${slug}`} target="_blank" rel="noreferrer">View live</a> : null}
        </div>
      </div>

      {message ? <p className={`adm-flash adm-flash--${message.kind === "ok" ? "ok" : "err"}`} role="status">{message.text}</p> : null}
      {archived ? <p className="adm-flash adm-flash--warn">This post is archived. Restore it to edit.</p> : null}

      <div className="adm-split">
        <div>
          <div className="adm-card adm-write-card">
            <div className="adm-card__head">
              <div>
                <p className="adm-kicker"><i>01</i> Writing</p>
                <h2>The piece</h2>
              </div>
              <span className={`adm-savechip adm-savechip--${saveState}`}>
                {saveState === "saving" ? "Saving" : saveState === "dirty" ? "Unsaved" : saveState === "error" ? "Save failed" : "Saved"}
              </span>
            </div>
            <div className="adm-field">
              <label className="sr-only" htmlFor="title">Title</label>
              <input className="adm-title-input" id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} disabled={archived} placeholder="Untitled post" />
            </div>
            <div className="adm-field"><label htmlFor="slug">Slug</label><input id="slug" type="text" value={slug} onChange={(e) => setSlug(e.target.value)} maxLength={160} disabled={archived} />
              <span className="hint">/blogs/{slug}. {status === "published" ? "Changing a live slug adds a redirect from the old address." : ""}</span></div>
            <div className="adm-field"><label htmlFor="excerpt">Excerpt ({excerpt.trim().length}/160)</label><textarea className="adm-excerpt" id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={400} rows={3} disabled={archived} />
              <span className="hint">50 to 160 characters. Answer first: it is used on cards, in the feed and as the fallback meta description.</span></div>
          </div>

          <div className="adm-editor" style={{ marginTop: 16 }}>
            <div className="adm-editor__head">
              <span className="adm-kicker"><i>02</i> Body</span>
              <span className="adm-kicker">{wordCount} words</span>
            </div>
            <div className="adm-toolbar" role="toolbar" aria-label="Formatting">
              {btn("H2", !!editor?.isActive("heading", { level: 2 }), () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), "Section heading")}
              {btn("H3", !!editor?.isActive("heading", { level: 3 }), () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), "Sub heading")}
              {btn("P", !!editor?.isActive("paragraph"), () => editor?.chain().focus().setParagraph().run(), "Paragraph")}
              <span className="sep" />
              {btn("B", !!editor?.isActive("bold"), () => editor?.chain().focus().toggleBold().run(), "Bold")}
              {btn("I", !!editor?.isActive("italic"), () => editor?.chain().focus().toggleItalic().run(), "Italic")}
              {btn("Link", !!editor?.isActive("link"), setLink)}
              <span className="sep" />
              {btn("• List", !!editor?.isActive("bulletList"), () => editor?.chain().focus().toggleBulletList().run(), "Bullet list")}
              {btn("1. List", !!editor?.isActive("orderedList"), () => editor?.chain().focus().toggleOrderedList().run(), "Numbered list")}
              {btn("Quote", !!editor?.isActive("blockquote"), () => editor?.chain().focus().toggleBlockquote().run())}
              <span className="sep" />
              {btn("Image", false, () => setTarget("image"), "Insert an image")}
              {btn("Image pair", false, () => setTarget("pair1"), "Insert two images side by side")}
              {btn("Concept label", false, () => editor?.chain().focus().insertContent({ type: "conceptLabel" }).run())}
              {btn("Video", false, () => {
                const id = youtubeIdFrom(window.prompt("YouTube link or video id") ?? "");
                if (id) editor?.chain().focus().insertContent({ type: "video", attrs: { youtubeId: id, title: window.prompt("Video title") ?? "Video" } }).run();
              })}
              <select aria-label="Insert service call to action" value="" disabled={archived} onChange={(e) => e.target.value && editor?.chain().focus().insertContent({ type: "serviceCta", attrs: { serviceSlug: e.target.value } }).run()} style={{ width: "auto" }}>
                <option value="">+ Service CTA</option>
                {services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
              </select>
              <select aria-label="Insert price" value="" disabled={archived} onChange={(e) => e.target.value && editor?.chain().focus().insertContent({ type: "priceToken", attrs: { token: e.target.value } }).run()} style={{ width: "auto" }}>
                <option value="">+ Price</option>
                {priceTokens.map(([t, label]) => <option key={t} value={t}>{label}</option>)}
              </select>
              <span className="sep" />
              {btn("Undo", false, () => editor?.chain().focus().undo().run())}
              {btn("Redo", false, () => editor?.chain().focus().redo().run())}
            </div>
            <div className="adm-prose"><EditorContent editor={editor} /></div>
          </div>

          <div className="adm-card" style={{ marginTop: 16 }}>
            <div className="adm-card__head">
              <div>
                <p className="adm-kicker"><i>03</i> Optional</p>
                <h2>FAQ</h2>
              </div>
            </div>
            <p className="muted small" style={{ margin: "0 0 10px" }}>Question and answer pairs. They also emit FAQPage structured data.</p>
            {faq.map((f, i) => (
              <div key={i} className="adm-card" style={{ marginBottom: 10 }}>
                <div className="adm-field"><label>Question</label><input type="text" value={f.q} onChange={(e) => setFaq(faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} maxLength={300} /></div>
                <div className="adm-field"><label>Answer</label><textarea value={f.a} onChange={(e) => setFaq(faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} maxLength={1500} /></div>
                <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setFaq(faq.filter((_, j) => j !== i))}>Remove</button>
              </div>
            ))}
            {faq.length < 12 ? <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setFaq([...faq, { q: "", a: "" }])} disabled={archived}>Add a question</button> : null}
          </div>
        </div>

        <aside>
          <div className="adm-card">
            <div className="adm-card__head">
              <div>
                <p className="adm-kicker"><i>04</i> Ship it</p>
                <h2>Publish</h2>
              </div>
              <span className={`adm-pill adm-pill--${status}`}>{status}</span>
            </div>
            <div className="adm-row" style={{ margin: "0 0 12px" }}>
              <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => void saveNow("Manual save")} disabled={archived}>Save</button>
              {status !== "published" && !archived ? <button type="button" className="adm-btn adm-btn--gradient adm-btn--sm" onClick={publish} disabled={role !== "owner" && blocking.length > 0}>Publish now</button> : null}
              {status === "published" ? <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => run("Moved to draft.", () => unpublishAction(post.id), "draft")}>Unpublish</button> : null}
            </div>
            {!archived && status !== "published" ? (
              <div className="adm-field">
                <label htmlFor="when">Schedule (Lagos time)</label>
                <input id="when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
                <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={schedule} style={{ justifySelf: "start" }}>Schedule</button>
              </div>
            ) : null}
            {status === "scheduled" ? <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => run("Moved to draft.", () => unpublishAction(post.id), "draft")}>Cancel schedule</button> : null}
            <div className="adm-row" style={{ marginTop: 10 }}>
              {archived ? <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => run("Restored to draft.", () => restoreAction(post.id), "draft")}>Restore</button> : <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => window.confirm("Archive this post? It leaves the public site.") && run("Archived.", () => archiveAction(post.id), "archived")}>Archive</button>}
              {archived && role === "owner" ? <button type="button" className="adm-btn adm-btn--danger adm-btn--sm" onClick={async () => { if (window.confirm("Delete permanently? This cannot be undone.")) { const r = await deleteAction(post.id); if (r.ok) router.push("/admin/posts"); else setMessage({ kind: "err", text: r.error }); } }}>Delete forever</button> : null}
            </div>
          </div>

          <div className="adm-card">
            <div className="adm-card__head">
              <div>
                <p className="adm-kicker"><i>05</i> Gate</p>
                <h2>Publish checks</h2>
              </div>
            </div>
            <ul className="adm-checks">
              {checks.filter((c) => !c.ok).map((c) => <li key={c.id}><span className={`dot dot--${c.severity === "block" ? "block" : "warn"}`} /><span>{c.message}</span></li>)}
              {blocking.length === 0 && warn.length === 0 ? <li><span className="dot dot--ok" /><span>All checks pass.</span></li> : null}
            </ul>
            {blocking.length === 0 ? <p className="small muted" style={{ marginTop: 8 }}>{checks.filter((c) => c.ok).length} of {checks.length} checks pass.</p> : null}
          </div>

          <div className="adm-card">
            <div className="adm-card__head">
              <div>
                <p className="adm-kicker"><i>06</i> Filing</p>
                <h2>Details</h2>
              </div>
            </div>
            <div className="adm-field"><label htmlFor="cat">Category</label>
              <select id="cat" value={categoryId ?? ""} onChange={(e) => setCategoryId(e.target.value || null)} disabled={archived}><option value="">Choose</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div className="adm-field"><label htmlFor="svc">Service (overrides the category)</label>
              <select id="svc" value={serviceSlug ?? ""} onChange={(e) => setServiceSlug(e.target.value || null)} disabled={archived}><option value="">From category{effectiveService && !serviceSlug ? ` (${services.find((s) => s.slug === effectiveService)?.name})` : ""}</option>{services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select></div>
            <div className="adm-field"><label htmlFor="author">Author</label>
              <select id="author" value={authorId ?? ""} onChange={(e) => setAuthorId(e.target.value || null)} disabled={archived}>{authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
            <div className="adm-field"><span className="adm-label">Hero image</span>
              {hero ? <>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={hero.url} alt="" style={{ maxWidth: "100%", borderRadius: 8 }} /><span className="hint">{hero.alt}</span></> : <span className="hint">None yet.</span>}
              <div className="adm-row"><button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setTarget("hero")} disabled={archived}>{hero ? "Change" : "Choose"}</button>{hero ? <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setHeroMediaId(null)} disabled={archived}>Remove</button> : null}</div></div>
            <label className="adm-check" style={{ marginBottom: 8 }}><input type="checkbox" checked={isConcept} onChange={(e) => setIsConcept(e.target.checked)} disabled={archived} /> Concept work, not a client project</label>
            <label className="adm-check"><input type="checkbox" checked={listed} onChange={(e) => setListed(e.target.checked)} disabled={archived} /> Show in the journal grid</label>
          </div>

          <div className="adm-card">
            <div className="adm-card__head">
              <div>
                <p className="adm-kicker"><i>07</i> Threads</p>
                <h2>Related posts</h2>
              </div>
            </div>
            <ul className="adm-checks" style={{ margin: "0 0 10px" }}>
              {related.map((r) => <li key={r.id}><span style={{ flex: 1 }}>{r.title}</span><button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setRelated(related.filter((x) => x.id !== r.id))}>Remove</button></li>)}
            </ul>
            {related.length < 6 ? <>
              <input type="search" value={relQuery} onChange={(e) => void searchRelated(e.target.value)} placeholder="Search published posts" aria-label="Search published posts" />
              <ul className="adm-checks" style={{ marginTop: 6 }}>
                {relResults.filter((r) => !related.some((x) => x.id === r.id)).map((r) => <li key={r.id}><button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => { setRelated([...related, { id: r.id, title: r.title }]); setRelResults([]); setRelQuery(""); }}>Add</button><span>{r.title}</span></li>)}
              </ul></> : null}
          </div>

          <div className="adm-card">
            <div className="adm-card__head">
              <div>
                <p className="adm-kicker"><i>08</i> Time machine</p>
                <h2>Revisions</h2>
              </div>
            </div>
            <ul className="adm-checks">
              {revisions.map((r) => (
                <li key={r.id}><span style={{ flex: 1 }}>{r.savedAtLabel}{r.savedBy ? ` · ${r.savedBy}` : ""}{r.note ? ` · ${r.note}` : ""}</span>
                  <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" disabled={archived} onClick={() => window.confirm("Restore this version? The current text is saved as a revision first.") && run("Revision restored. Reloading.", () => restoreRevisionAction(post.id, r.id)).then(() => window.location.reload())}>Restore</button></li>
              ))}
              {revisions.length === 0 ? <li className="muted">None yet.</li> : null}
            </ul>
          </div>
        </aside>
      </div>

      <div className="adm-card adm-seo">
        <div className="adm-card__head">
          <div>
            <p className="adm-kicker"><i>09</i> Discoverability</p>
            <h2>SEO</h2>
          </div>
          <span className="adm-chip"><b>{score.score}</b> / 100</span>
        </div>
        <div className="adm-seo__grid">
          <div>
            <div className="adm-field"><label htmlFor="kw">Focus keyphrase (editor only)</label><input id="kw" type="text" value={seo.focusKeyword ?? ""} onChange={(e) => setSeo({ ...seo, focusKeyword: e.target.value })} maxLength={120} /></div>
            <div className="adm-field"><label htmlFor="st">SEO title ({(seo.title ?? "").length}/60)</label><input id="st" type="text" value={seo.title ?? ""} onChange={(e) => setSeo({ ...seo, title: e.target.value })} maxLength={120} placeholder={title} /></div>
            <div className="adm-field"><label htmlFor="sd">Meta description ({(seo.description ?? "").length}/155)</label><textarea id="sd" value={seo.description ?? ""} onChange={(e) => setSeo({ ...seo, description: e.target.value })} maxLength={320} rows={3} placeholder={excerpt} /></div>
            <div className="adm-field"><label htmlFor="cn">Canonical URL (leave empty for the default)</label><input id="cn" type="url" value={seo.canonical ?? ""} onChange={(e) => setSeo({ ...seo, canonical: e.target.value })} /></div>
            <div className="adm-field"><span className="adm-label">Share image (defaults to the hero)</span>
              <div className="adm-row"><button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setTarget("og")}>{seo.ogMediaId ? "Change" : "Choose"}</button>{seo.ogMediaId ? <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setSeo({ ...seo, ogMediaId: undefined })}>Use hero</button> : null}</div></div>
            <label className="adm-check"><input type="checkbox" checked={!!seo.noindex} onChange={(e) => setSeo({ ...seo, noindex: e.target.checked })} /> Hide from search engines (noindex)</label>
          </div>
          <div className="adm-seo__preview">
            <div className="adm-seohead">
              <div className="adm-seoring">
                <svg viewBox="0 0 100 100" role="img" aria-label={`${lens.toUpperCase()} score ${shown.score} out of 100`}>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--line)" strokeWidth="7" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={seoColor} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${seoDash} ${seoRing - seoDash}`} />
                </svg>
                <div className="adm-seoring__center"><b>{shown.score}</b><span>of 100</span></div>
              </div>
              <div>
                <p className="adm-kicker">{lensCopy[0]}</p>
                <p className="adm-card__note">{shown.score >= 80 ? lensCopy[1] : shown.score >= 50 ? lensCopy[2] : lensCopy[3]}</p>
              </div>
            </div>
            <div className="adm-lens" role="tablist" aria-label="Score type">
              {(["seo", "aeo", "geo"] as const).map((k) => (
                <button key={k} type="button" role="tab" aria-selected={lens === k} className={lens === k ? "is-on" : ""} onClick={() => setLens(k)}>
                  <span>{k.toUpperCase()}</span>
                  <b style={{ color: gradeColor(grades[k].score) }}>{grades[k].score}</b>
                </button>
              ))}
            </div>
            <div className="adm-serp"><div className="adm-serp__t">{serp.title}</div><div className="adm-serp__u">{serp.url}</div><div className="adm-serp__d">{serp.description}</div></div>
            <ul className="adm-checks">
              {shown.items.filter((i) => i.status !== "ok").map((i) => <li key={i.id}><span className={`dot dot--${i.status === "bad" ? "block" : "warn"}`} /><span><strong>{i.label}:</strong> {i.detail}</span></li>)}
            </ul>
          </div>
        </div>
      </div>

      <MediaPicker
        open={target !== null}
        onClose={() => { setTarget(null); pairFirst.current = null; }}
        onPick={onPick}
        media={media}
        onUploaded={(m) => setMedia((list) => [m, ...list])}
        heading={target === "pair1" ? "Pair: choose the first image" : target === "pair2" ? "Pair: choose the second image" : "Choose an image"}
      />
    </div>
  );
}
