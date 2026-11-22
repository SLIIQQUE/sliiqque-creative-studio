"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteVideo, moveVideo, setVideoPublished, type VideoState } from "./actions";

type Row = { id: string; youtubeId: string; title: string; type: string; orientation: string; featured: boolean; published: boolean; pages: number };

export default function VideosManager({ videos, saved }: { videos: Row[]; saved: boolean }) {
  const [note, setNote] = useState<VideoState>(saved ? { ok: "Saved" } : undefined);
  const [pending, start] = useTransition();
  const run = (job: () => Promise<VideoState>) => start(async () => setNote(await job()));

  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-kicker"><span className="adm-dot" /> Films <i>·</i> {videos.length} {videos.length === 1 ? "video" : "videos"}</p>
          <h1 className="adm-head__title">The <em className="adm-gradient-text">videos</em><span className="adm-head__ghost">.</span></h1>
          <p className="adm-sub">YouTube films shown on the Videos page, the homepage showreel and any work or service page you pick. Paste a link, set where it appears, and it goes live straight away.</p>
        </div>
        <div className="adm-head__actions">
          <Link className="adm-btn adm-btn--gradient" href="/admin/videos/new">Add a video <span className="adm-btn__arrow">+</span></Link>
        </div>
      </div>

      {note?.ok ? <p className="adm-flash" role="status">{note.ok}</p> : null}
      {note?.error ? <p className="adm-flash adm-flash--err" role="alert">{note.error}</p> : null}

      {videos.length === 0 ? (
        <div className="adm-empty"><b>No videos yet.</b><span>Upload a film to YouTube, then add its link here.</span></div>
      ) : (
        <ol style={{ display: "grid", gap: 12, listStyle: "none", padding: 0, margin: 0 }}>
          {videos.map((v, i) => (
            <li className="adm-card" key={v.id} style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 16, alignItems: "center", opacity: v.published ? 1 : 0.6 }}>
              <div style={{ aspectRatio: v.orientation === "portrait" ? "9 / 16" : "16 / 9", maxHeight: 120, overflow: "hidden", borderRadius: 8, background: "#000" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <p className="adm-kicker"><i>{String(i + 1).padStart(2, "0")}</i> {v.published ? "Live" : "Hidden"} · {v.type} · {v.orientation}{v.featured ? " · Homepage" : ""}</p>
                <h2 style={{ marginTop: 6 }}>{v.title}</h2>
                <p className="adm-card__note">Also on {v.pages} {v.pages === 1 ? "page" : "pages"} · <a href={`https://youtu.be/${v.youtubeId}`} target="_blank" rel="noopener noreferrer">Open on YouTube ↗</a></p>
              </div>
              <div style={{ display: "grid", gap: 8, justifyItems: "stretch" }}>
                <div className="adm-row">
                  <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" disabled={pending || i === 0} onClick={() => run(() => moveVideo(v.id, "up"))} aria-label="Move earlier">↑</button>
                  <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" disabled={pending || i === videos.length - 1} onClick={() => run(() => moveVideo(v.id, "down"))} aria-label="Move later">↓</button>
                </div>
                <Link className="adm-btn adm-btn--sm" href={`/admin/videos/${v.id}`}>Edit</Link>
                <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" disabled={pending} onClick={() => run(() => setVideoPublished(v.id, !v.published))}>{v.published ? "Hide" : "Publish"}</button>
                <button type="button" className="adm-btn adm-btn--danger adm-btn--sm" disabled={pending} onClick={() => { if (window.confirm(`Remove ${v.title} from the site? The film stays on YouTube.`)) run(() => deleteVideo(v.id)); }}>Delete</button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
