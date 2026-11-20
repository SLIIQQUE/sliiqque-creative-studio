"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import LoadImg from "@/components/LoadImg";
import { deleteWork, importBuiltInWorks, moveWork, setWorkPublished, type WorkState } from "./actions";

type Row = { id: string; slug: string; name: string; category: string; year: string; published: boolean; imageUrl: string | null };

export default function WorksManager({ works, builtInCount, saved }: { works: Row[]; builtInCount: number; saved: boolean }) {
  const [note, setNote] = useState<WorkState>(saved ? { ok: "Saved" } : undefined);
  const [pending, start] = useTransition();
  const run = (job: () => Promise<WorkState>) => start(async () => setNote(await job()));
  const usingBuiltIn = works.length === 0;
  const count = usingBuiltIn ? builtInCount : works.length;

  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-kicker"><span className="adm-dot" /> Portfolio <i>·</i> {count} {count === 1 ? "work" : "works"}</p>
          <h1 className="adm-head__title">The concept <em className="adm-gradient-text">works</em><span className="adm-head__ghost">.</span></h1>
          <p className="adm-sub">Every work on the homepage and the Work page, each with its own case study. Add, edit, reorder, hide or delete. Changes go live straight away.</p>
        </div>
        <div className="adm-head__actions">
          <Link className="adm-btn adm-btn--gradient" href="/admin/works/new">Add a work <span className="adm-btn__arrow">+</span></Link>
        </div>
      </div>

      {note?.ok ? <p className="adm-flash" role="status">{note.ok}</p> : null}
      {note?.error ? <p className="adm-flash adm-flash--err" role="alert">{note.error}</p> : null}

      {usingBuiltIn ? (
        <div className="adm-card">
          <p className="adm-kicker"><i>Built in</i> Not editable yet</p>
          <h2 style={{ marginTop: 7 }}>The site is showing the {builtInCount} works that ship with it</h2>
          <p className="adm-card__note">Copy them into the list to edit, reorder, hide or delete them. Adding a work does this for you automatically.</p>
          <div className="adm-row" style={{ marginTop: 12 }}>
            <button type="button" className="adm-btn" disabled={pending} onClick={() => run(importBuiltInWorks)}>{pending ? "Copying" : "Copy the current works"}</button>
          </div>
        </div>
      ) : (
        <ol style={{ display: "grid", gap: 12, listStyle: "none", padding: 0, margin: 0 }}>
          {works.map((w, i) => (
            <li className="adm-card" key={w.id} style={{ display: "grid", gridTemplateColumns: "88px 1fr auto", gap: 16, alignItems: "center", opacity: w.published ? 1 : 0.6 }}>
              <div style={{ aspectRatio: "4 / 5", overflow: "hidden", borderRadius: 8, position: "relative" }}>
                {w.imageUrl ? <LoadImg src={w.imageUrl} alt="" loading="lazy" /> : null}
              </div>
              <div>
                <p className="adm-kicker"><i>{String(i + 1).padStart(2, "0")}</i> {w.published ? "Live" : "Hidden"} · {w.year}</p>
                <h2 style={{ marginTop: 6 }}>{w.name}</h2>
                <p className="adm-card__note">{w.category} · <code>/works/{w.slug}</code></p>
              </div>
              <div style={{ display: "grid", gap: 8, justifyItems: "stretch" }}>
                <div className="adm-row">
                  <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" disabled={pending || i === 0} onClick={() => run(() => moveWork(w.id, "up"))} aria-label="Move earlier">↑</button>
                  <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" disabled={pending || i === works.length - 1} onClick={() => run(() => moveWork(w.id, "down"))} aria-label="Move later">↓</button>
                </div>
                <Link className="adm-btn adm-btn--sm" href={`/admin/works/${w.id}`}>Edit</Link>
                <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" disabled={pending} onClick={() => run(() => setWorkPublished(w.id, !w.published))}>{w.published ? "Hide" : "Publish"}</button>
                <button type="button" className="adm-btn adm-btn--danger adm-btn--sm" disabled={pending || works.length <= 1} onClick={() => { if (window.confirm(`Delete ${w.name}? Its page /works/${w.slug} will stop existing.`)) run(() => deleteWork(w.id)); }}>Delete</button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
