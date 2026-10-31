"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import MediaPicker from "@/components/admin/MediaPicker";
import type { MediaLite } from "@/components/admin/extensions";
import { removeMedia, saveMediaText, type MediaState } from "./actions";

type Item = MediaLite & { caption: string | null; width: number | null; height: number | null; bytes: number | null; usedIn: string[] };

function Asset({ m, index, onRemoved }: { m: Item; index: number; onRemoved: (id: string) => void }) {
  const [saved, save, saving] = useActionState<MediaState, FormData>(saveMediaText, undefined);
  const [removed, remove, removing] = useActionState<MediaState, FormData>(removeMedia, undefined);
  const [copied, setCopied] = useState(false);
  const [broken, setBroken] = useState(false);
  const size = m.width && m.height ? `${m.width} × ${m.height}` : "Image";

  async function copy() {
    await navigator.clipboard.writeText(m.url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  useEffect(() => {
    if (removed?.ok) onRemoved(m.id);
  }, [removed, onRemoved, m.id]);

  return (
    <article className="adm-asset">
      <div className="adm-asset__frame" data-broken={broken || undefined}>
        {broken ? (
          <div className="adm-asset__missing">
            <span className="adm-kicker">Missing file</span>
            <b>{m.alt}</b>
            <span>{m.url}</span>
          </div>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt={m.alt} loading="lazy" onError={() => setBroken(true)} />
          </>
        )}
        <span className="adm-asset__shade" aria-hidden="true" />
        <span className="adm-asset__idx">{String(index + 1).padStart(2, "0")}</span>
        <span className="adm-asset__dims">{size}</span>
        <button type="button" className="adm-asset__copy" onClick={() => void copy()}>{copied ? "Copied" : "Copy URL"}</button>
      </div>
      <div className="adm-asset__body">
        <div className="adm-asset__alt">{m.alt}</div>
        <div className="adm-asset__url" title={m.url}>{m.url}</div>
        <div className="adm-asset__foot">
          <span className="adm-asset__used">{m.usedIn.length ? `${m.usedIn.length} ${m.usedIn.length === 1 ? "post" : "posts"}` : "Unused"}</span>
          <span className="adm-asset__meta">{m.bytes ? `${(m.bytes / 1024).toFixed(0)} KB` : ""}</span>
        </div>
        <details className="adm-asset__details">
          <summary>Edit metadata</summary>
          <form action={save} className="adm-asset__form">
            <input type="hidden" name="id" value={m.id} />
            <div className="adm-field">
              <label htmlFor={`a-${m.id}`}>Alt text</label>
              <input id={`a-${m.id}`} name="alt" type="text" defaultValue={m.alt} required />
            </div>
            <div className="adm-field">
              <label htmlFor={`c-${m.id}`}>Caption</label>
              <input id={`c-${m.id}`} name="caption" type="text" defaultValue={m.caption ?? ""} />
            </div>
            <div className="adm-asset__foot">
              <button className="adm-btn adm-btn--sm" type="submit" disabled={saving}>{saving ? "Saving" : "Save changes"}</button>
              {saved?.ok ? <span className="adm-asset__used">{saved.ok}</span> : null}
            </div>
            {saved?.error ? <p className="adm-flash adm-flash--err">{saved.error}</p> : null}
          </form>
          <form action={remove}>
            <input type="hidden" name="id" value={m.id} />
            <button className="adm-btn adm-btn--danger adm-btn--sm" type="submit" disabled={removing || m.usedIn.length > 0} title={m.usedIn.length ? "Remove it from posts first" : "Delete"}>
              {removing ? "Deleting" : m.usedIn.length ? "In use" : "Delete image"}
            </button>
            {removed?.error ? <p className="adm-asset__used" style={{ color: "#8a1c10", marginTop: 6 }}>{removed.error}</p> : null}
          </form>
        </details>
        <p className="adm-asset__meta">{m.usedIn.length ? `Used in: ${m.usedIn.join(", ")}` : "Not used in any post."}</p>
      </div>
    </article>
  );
}

export default function MediaManager({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState(items);
  const [filter, setFilter] = useState("");
  const remove = useCallback((id: string) => setList((l) => (l.some((m) => m.id === id) ? l.filter((m) => m.id !== id) : l)), []);
  const shown = list.filter((m) => !filter || `${m.alt} ${m.url}`.toLowerCase().includes(filter.toLowerCase()));

  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-kicker"><span className="adm-dot" /> Library <i>·</i> {list.length} {list.length === 1 ? "image" : "images"}</p>
          <h1 className="adm-head__title">The contact <em className="adm-gradient-text">sheet</em><span className="adm-head__ghost">.</span></h1>
          <p className="adm-sub">Every frame in the journal, with its alt text, dimensions and usage. Uploads are re-encoded and stripped of metadata.</p>
        </div>
        <div className="adm-head__actions">
          <button type="button" className="adm-btn adm-btn--gradient" onClick={() => setOpen(true)}>Upload an image <span className="adm-btn__arrow">↑</span></button>
        </div>
      </div>

      <div className="adm-browse">
        <div className="adm-browse__form">
          <div className="adm-browse__search">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search by description or file name" aria-label="Search media" />
          </div>
          <span className="adm-chip"><b>{shown.length}</b> of {list.length} <i>·</i> JPEG, PNG, WebP, AVIF</span>
        </div>
      </div>

      <div className="adm-asset-grid">
        <button type="button" className="adm-upload" onClick={() => setOpen(true)}>
          <span className="adm-upload__icon" aria-hidden="true">+</span>
          <div>
            <div className="adm-upload__title">Add a frame</div>
            <p className="adm-upload__note">Up to 4 MB. Large photos are shrunk in the browser before upload. Alt text is required.</p>
          </div>
          <span className="adm-upload__rule" aria-hidden="true" />
          <span className="adm-kicker">Choose a file ↗</span>
        </button>
        {shown.map((m, i) => <Asset key={m.id} m={m} index={i} onRemoved={remove} />)}
      </div>

      {!list.length ? (
        <div className="adm-empty">
          <b>No images yet.</b>
          <span>Upload the first frame. The journal will thank you for the alt text.</span>
        </div>
      ) : null}

      {list.length && !shown.length ? (
        <div className="adm-empty">
          <b>No frames match.</b>
          <span>Try a different description or file name.</span>
        </div>
      ) : null}

      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onPick={() => undefined}
        media={list}
        onUploaded={(m) => setList((l) => [{ ...m, caption: null, width: null, height: null, bytes: null, usedIn: [] }, ...l])}
        heading="Upload an image"
      />
    </>
  );
}
