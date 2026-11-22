"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { VIDEO_TYPES, parseYoutubeId } from "@/lib/video-utils";
import { saveVideo, type VideoState } from "./actions";

export type VideoValues = {
  id: string; youtubeId: string; title: string; description: string; type: string; orientation: "landscape" | "portrait";
  duration: string; uploadDate: string; pages: string[]; featured: boolean; published: boolean;
};
type Option = { path: string; label: string };

export default function VideoForm({ initial, services, works }: { initial?: VideoValues; services: Option[]; works: Option[] }) {
  const [state, action, saving] = useActionState<VideoState, FormData>(saveVideo, undefined);
  const [link, setLink] = useState(initial?.youtubeId ?? "");
  const [orientation, setOrientation] = useState<"landscape" | "portrait">(initial?.orientation ?? "landscape");
  const editing = !!initial;
  const id = parseYoutubeId(link);
  const known = new Set([...services, ...works].map((o) => o.path));
  const extra = (initial?.pages ?? []).filter((p) => !known.has(p));

  const onLink = (value: string) => {
    setLink(value);
    if (/\/shorts\//.test(value)) setOrientation("portrait");
  };

  const group = (title: string, options: Option[]) => options.length ? (
    <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
      <legend className="adm-kicker" style={{ marginBottom: 8 }}>{title}</legend>
      <div className="adm-row" style={{ flexWrap: "wrap" }}>
        {options.map((o) => (
          <label key={o.path} className="adm-row" style={{ gap: 6 }}>
            <input type="checkbox" name="pages" value={o.path} defaultChecked={initial?.pages.includes(o.path)} /> {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  ) : null;

  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-kicker"><span className="adm-dot" /> Films <i>·</i> {editing ? "Edit" : "New"}</p>
          <h1 className="adm-head__title">{editing ? initial.title : "Add a"} <em className="adm-gradient-text">{editing ? "film" : "video"}</em><span className="adm-head__ghost">.</span></h1>
          <p className="adm-sub">Upload the film to YouTube first (Unlisted works too), then paste its link. Every film appears on the Videos page.</p>
        </div>
        <div className="adm-head__actions"><Link className="adm-btn adm-btn--ghost" href="/admin/videos">Back to videos</Link></div>
      </div>

      <form action={action} className="adm-card" style={{ display: "grid", gap: 18 }}>
        {editing ? <input type="hidden" name="id" value={initial.id} /> : null}

        <div className="adm-row" style={{ alignItems: "flex-start" }}>
          <div className="adm-field grow" style={{ marginBottom: 0 }}>
            <label htmlFor="v-link">YouTube link</label>
            <input id="v-link" name="youtubeId" type="text" required value={link} onChange={(e) => onLink(e.target.value)} placeholder="https://www.youtube.com/watch?v=… or a Shorts link" />
            <p className="adm-card__note">{link ? (id ? `Video ID ${id}` : "Not a YouTube link yet") : "Watch, youtu.be, Shorts and embed links all work."}</p>
          </div>
          <div style={{ width: 160, aspectRatio: orientation === "portrait" ? "9 / 16" : "16 / 9", maxHeight: 180, overflow: "hidden", borderRadius: 8, background: "#000" }}>
            {id ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
          </div>
        </div>

        <div className="adm-field" style={{ marginBottom: 0 }}><label htmlFor="v-title">Title</label><input id="v-title" name="title" type="text" required maxLength={160} defaultValue={initial?.title} placeholder="ODÈ: The Man Before The Morning" /></div>
        <div className="adm-field" style={{ marginBottom: 0 }}><label htmlFor="v-desc">Description (one or two sentences, shown under the film and used by search engines)</label><textarea id="v-desc" name="description" rows={3} maxLength={1000} defaultValue={initial?.description} /></div>

        <div className="adm-row" style={{ flexWrap: "wrap" }}>
          <div className="adm-field" style={{ marginBottom: 0 }}>
            <label htmlFor="v-type">Type</label>
            <select id="v-type" name="type" required defaultValue={initial?.type ?? ""}>
              <option value="" disabled>Choose a type</option>
              {VIDEO_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="adm-field" style={{ marginBottom: 0 }}>
            <label htmlFor="v-or">Shape</label>
            <select id="v-or" name="orientation" value={orientation} onChange={(e) => setOrientation(e.target.value as "landscape" | "portrait")}>
              <option value="landscape">Horizontal (16:9)</option>
              <option value="portrait">Vertical (9:16)</option>
            </select>
          </div>
          <div className="adm-field" style={{ marginBottom: 0, width: 120 }}><label htmlFor="v-dur">Length</label><input id="v-dur" name="duration" type="text" required defaultValue={initial?.duration} placeholder="0:30" pattern="(\d{1,2}:)?\d{1,3}:[0-5]\d" title="Like 0:30 or 1:15" /></div>
          <div className="adm-field" style={{ marginBottom: 0 }}><label htmlFor="v-date">Published on YouTube</label><input id="v-date" name="uploadDate" type="date" required defaultValue={initial?.uploadDate ?? new Date().toISOString().slice(0, 10)} /></div>
        </div>

        <div>
          <p className="adm-kicker" style={{ marginBottom: 8 }}>Where it shows</p>
          <p className="adm-card__note" style={{ marginBottom: 10 }}>Always on the Videos page. Tick more places:</p>
          <div style={{ display: "grid", gap: 14 }}>
            <label className="adm-row" style={{ gap: 6 }}><input type="checkbox" name="featured" defaultChecked={initial?.featured} /> Homepage showreel (the first 3 featured films show)</label>
            {group("Service pages", services)}
            {group("Work pages", works)}
            <div className="adm-field" style={{ marginBottom: 0 }}>
              <label htmlFor="v-extra">Other pages (site paths, comma separated, e.g. /blogs/my-post)</label>
              <input id="v-extra" name="extraPaths" type="text" defaultValue={extra.join(", ")} />
            </div>
          </div>
        </div>

        <label className="adm-row" style={{ gap: 6 }}><input type="checkbox" name="published" defaultChecked={initial?.published ?? true} /> Published (visible on the site)</label>

        {state?.error ? <p className="adm-flash adm-flash--err" role="alert" style={{ margin: 0 }}>{state.error}</p> : null}
        <div className="adm-row">
          <button className="adm-btn adm-btn--gradient" type="submit" disabled={saving}>{saving ? "Saving" : editing ? "Save changes" : "Add video"}</button>
          <Link className="adm-btn adm-btn--ghost" href="/admin/videos">Cancel</Link>
        </div>
      </form>
    </>
  );
}
