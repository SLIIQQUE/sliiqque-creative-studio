"use client";

import { useActionState, useState, useTransition } from "react";
import MediaPicker from "@/components/admin/MediaPicker";
import LoadImg from "@/components/LoadImg";
import type { MediaLite } from "@/components/admin/extensions";
import { addFrame, importBuiltIns, moveFrame, removeFrame, saveFrame, type HeroState } from "./actions";

type Frame = { id: string; url: string; alt: string; label: string; href: string; autoLabel: string; autoHref: string };

function FrameRow({ f, index, count, run, busy }: { f: Frame; index: number; count: number; run: (job: () => Promise<HeroState>) => void; busy: boolean }) {
  const [saved, save, saving] = useActionState<HeroState, FormData>(saveFrame, undefined);
  return (
    <li className="adm-card" style={{ display: "grid", gridTemplateColumns: "88px 1fr auto", gap: 16, alignItems: "start" }}>
      <div style={{ aspectRatio: "4 / 5", overflow: "hidden", borderRadius: 8, position: "relative" }}>
        <LoadImg src={f.url} alt={f.alt} loading="lazy" />
      </div>
      <form action={save} style={{ display: "grid", gap: 10 }}>
        <input type="hidden" name="id" value={f.id} />
        <p className="adm-kicker"><i>{String(index + 1).padStart(2, "0")}</i> {f.alt}</p>
        <div className="adm-field" style={{ marginBottom: 0 }}>
          <label htmlFor={`l-${f.id}`}>Caption</label>
          <input id={`l-${f.id}`} name="label" type="text" maxLength={80} defaultValue={f.label} placeholder={f.autoLabel} />
        </div>
        <div className="adm-field" style={{ marginBottom: 0 }}>
          <label htmlFor={`h-${f.id}`}>Links to</label>
          <input id={`h-${f.id}`} name="href" type="text" maxLength={512} defaultValue={f.href} placeholder={f.autoHref} />
        </div>
        <div className="adm-row">
          <button className="adm-btn adm-btn--sm" type="submit" disabled={saving}>{saving ? "Saving" : "Save"}</button>
          {saved?.ok ? <span className="adm-asset__used">{saved.ok}</span> : null}
          {saved?.error ? <span className="adm-asset__used" style={{ color: "#8a1c10" }}>{saved.error}</span> : null}
        </div>
      </form>
      <div style={{ display: "grid", gap: 8 }}>
        <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" disabled={busy || index === 0} onClick={() => run(() => moveFrame(f.id, "up"))} aria-label="Move earlier">↑</button>
        <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" disabled={busy || index === count - 1} onClick={() => run(() => moveFrame(f.id, "down"))} aria-label="Move later">↓</button>
        <button type="button" className="adm-btn adm-btn--danger adm-btn--sm" disabled={busy || count <= 1} onClick={() => run(() => removeFrame(f.id))}>Remove</button>
      </div>
    </li>
  );
}

export default function HeroManager({ frames, usingBuiltIn, builtInCount, library }: { frames: Frame[]; usingBuiltIn: boolean; builtInCount: number; library: MediaLite[] }) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState(library);
  const [note, setNote] = useState<HeroState>();
  const [pending, start] = useTransition();

  const run = (job: () => Promise<HeroState>) => start(async () => setNote(await job()));

  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-kicker"><span className="adm-dot" /> Homepage <i>·</i> {usingBuiltIn ? builtInCount : frames.length} {(usingBuiltIn ? builtInCount : frames.length) === 1 ? "frame" : "frames"}</p>
          <h1 className="adm-head__title">The hero <em className="adm-gradient-text">reel</em><span className="adm-head__ghost">.</span></h1>
          <p className="adm-sub">The images that scroll across the top of the homepage. Add from the media library or upload a new one, reorder, caption, link or remove. Changes go live straight away.</p>
        </div>
        <div className="adm-head__actions">
          <button type="button" className="adm-btn adm-btn--gradient" onClick={() => setOpen(true)} disabled={pending}>Add a frame <span className="adm-btn__arrow">+</span></button>
        </div>
      </div>

      {note?.ok ? <p className="adm-flash" role="status">{note.ok}</p> : null}
      {note?.error ? <p className="adm-flash adm-flash--err" role="alert">{note.error}</p> : null}

      {usingBuiltIn ? (
        <div className="adm-card" style={{ marginBottom: 16 }}>
          <p className="adm-kicker"><i>Built in</i> Not editable yet</p>
          <h2 style={{ marginTop: 7 }}>The reel is using the {builtInCount} frames that ship with the site</h2>
          <p className="adm-card__note">Copy them into the list to reorder, caption or remove them. Adding a frame does this for you automatically.</p>
          <div className="adm-row" style={{ marginTop: 12 }}>
            <button type="button" className="adm-btn" disabled={pending} onClick={() => run(importBuiltIns)}>{pending ? "Copying" : "Copy the current frames"}</button>
          </div>
        </div>
      ) : (
        <ol style={{ display: "grid", gap: 12, listStyle: "none", padding: 0, margin: 0 }}>
          {frames.map((f, i) => <FrameRow key={f.id} f={f} index={i} count={frames.length} run={run} busy={pending} />)}
        </ol>
      )}

      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onPick={(m) => run(() => addFrame(m.id))}
        media={media}
        onUploaded={(m) => setMedia((l) => [m, ...l])}
        heading="Add a frame to the reel"
      />
    </>
  );
}
