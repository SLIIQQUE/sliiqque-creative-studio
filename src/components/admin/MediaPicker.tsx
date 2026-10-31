"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaLite } from "./extensions";

/** Shrinks big photos in the browser so they fit the 4 MB upload limit. The server re-encodes and strips metadata regardless. */
async function prepare(file: File): Promise<File> {
  if (file.size <= 3.5 * 1024 * 1024 || !file.type.startsWith("image/")) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.85));
  return blob ? new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file;
}

export default function MediaPicker({
  open,
  onClose,
  onPick,
  media,
  onUploaded,
  heading = "Choose an image",
}: {
  open: boolean;
  onClose: () => void;
  onPick: (m: MediaLite) => void;
  media: MediaLite[];
  onUploaded: (m: MediaLite) => void;
  heading?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    if (!(file instanceof File) || !file.size) return setError("Choose a file");
    if (!String(data.get("alt") ?? "").trim()) return setError("Describe the image in the alt text field");
    setBusy(true);
    setError("");
    try {
      data.set("file", await prepare(file));
      const res = await fetch("/api/admin/media", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      onUploaded({ id: json.media.id, url: json.media.url, alt: json.media.alt });
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const shown = media.filter((m) => !filter || m.alt.toLowerCase().includes(filter.toLowerCase()) || m.url.toLowerCase().includes(filter.toLowerCase()));

  return (
    <dialog ref={ref} className="adm-dialog" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="adm-row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <p className="adm-kicker"><span className="adm-dot" /> Media library <i>·</i> {media.length} images</p>
          <h2 style={{ marginTop: 7 }}>{heading}</h2>
        </div>
        <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={onClose}>Close</button>
      </div>
      <form onSubmit={upload} className="adm-card" style={{ marginBottom: 16 }}>
        <div className="adm-row" style={{ alignItems: "flex-end" }}>
          <div className="adm-field grow" style={{ marginBottom: 0 }}><label htmlFor="mp-file">Upload a new image</label><input id="mp-file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" /></div>
          <div className="adm-field grow" style={{ marginBottom: 0 }}><label htmlFor="mp-alt">Alt text (required)</label><input id="mp-alt" name="alt" type="text" placeholder="Describe what the image shows" /></div>
          <button className="adm-btn" type="submit" disabled={busy}>{busy ? "Uploading" : "Upload"} <span className="adm-btn__arrow">↑</span></button>
        </div>
        {error ? <p className="adm-flash adm-flash--err" style={{ marginTop: 10, marginBottom: 0 }} role="alert">{error}</p> : null}
      </form>
      <div className="adm-field"><label htmlFor="mp-filter">Search</label><input id="mp-filter" type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter by description or file name" /></div>
      <div className="adm-media-grid" style={{ maxHeight: "44vh", overflow: "auto", paddingBottom: 4 }}>
        {shown.map((m) => (
          <button type="button" key={m.id} className="adm-media-item" onClick={() => { onPick(m); onClose(); }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt="" loading="lazy" />
            <span title={m.alt}>{m.alt || m.url}</span>
          </button>
        ))}
        {shown.length === 0 ? <div className="adm-media-empty" style={{ gridColumn: "1 / -1" }}>No images match.</div> : null}
      </div>
    </dialog>
  );
}
