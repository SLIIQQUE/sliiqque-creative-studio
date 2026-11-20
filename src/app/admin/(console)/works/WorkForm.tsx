"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import MediaPicker from "@/components/admin/MediaPicker";
import LoadImg from "@/components/LoadImg";
import type { MediaLite } from "@/components/admin/extensions";
import { saveWork, type WorkState } from "./actions";

export type WorkValues = {
  id: string; slug: string; name: string; category: string; service: string; year: string;
  overview: string; challenge: string; results: string; conclusion: string;
  card: MediaLite | null; wide: MediaLite | null; duo: MediaLite[]; serviceSlugs: string[]; ageGate: boolean; published: boolean;
};

type Target = "card" | "wide" | "duo";

const thumb = { aspectRatio: "4 / 5", overflow: "hidden", borderRadius: 8, position: "relative", background: "var(--paper, #eee)" } as const;

export default function WorkForm({ initial, library, services }: { initial?: WorkValues; library: MediaLite[]; services: { slug: string; name: string }[] }) {
  const [state, action, saving] = useActionState<WorkState, FormData>(saveWork, undefined);
  const [media, setMedia] = useState(library);
  const [card, setCard] = useState<MediaLite | null>(initial?.card ?? null);
  const [wide, setWide] = useState<MediaLite | null>(initial?.wide ?? null);
  const [duo, setDuo] = useState<MediaLite[]>(initial?.duo ?? []);
  const [target, setTarget] = useState<Target | null>(null);
  const editing = !!initial;

  const pick = (m: MediaLite) => {
    if (target === "card") setCard(m);
    else if (target === "wide") setWide(m);
    else if (target === "duo") setDuo((d) => (d.some((x) => x.id === m.id) ? d : [...d, m]));
  };
  const shift = (i: number, by: number) => setDuo((d) => { const n = [...d]; const j = i + by; if (j < 0 || j >= n.length) return d; [n[i], n[j]] = [n[j], n[i]]; return n; });

  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-kicker"><span className="adm-dot" /> Portfolio <i>·</i> {editing ? "Edit" : "New"}</p>
          <h1 className="adm-head__title">{editing ? initial.name : "Add a"} <em className="adm-gradient-text">{editing ? "case" : "work"}</em><span className="adm-head__ghost">.</span></h1>
          <p className="adm-sub">The card shows on the homepage and the Work page. The rest builds the case study page.</p>
        </div>
        <div className="adm-head__actions"><Link className="adm-btn adm-btn--ghost" href="/admin/works">Back to works</Link></div>
      </div>

      <form action={action} className="adm-card" style={{ display: "grid", gap: 18 }}>
        {editing ? <input type="hidden" name="id" value={initial.id} /> : null}
        <input type="hidden" name="cardMediaId" value={card?.id ?? ""} />
        <input type="hidden" name="wideMediaId" value={wide?.id ?? ""} />
        {duo.map((m) => <input key={m.id} type="hidden" name="duoMediaIds" value={m.id} />)}

        <div className="adm-row" style={{ alignItems: "flex-end" }}>
          <div className="adm-field grow" style={{ marginBottom: 0 }}><label htmlFor="w-name">Name</label><input id="w-name" name="name" type="text" required maxLength={160} defaultValue={initial?.name} placeholder="ÀLÀ" /></div>
          <div className="adm-field grow" style={{ marginBottom: 0 }}>
            <label htmlFor="w-slug">Address {editing ? "(fixed)" : ""}</label>
            <input id="w-slug" name="slug" type="text" required maxLength={120} defaultValue={initial?.slug} readOnly={editing} placeholder="ala-skin" pattern="[a-z0-9]+(-[a-z0-9]+)*" title="Lowercase letters, numbers and single hyphens" />
          </div>
          <div className="adm-field" style={{ marginBottom: 0, width: 110 }}><label htmlFor="w-year">Year</label><input id="w-year" name="year" type="text" required maxLength={12} defaultValue={initial?.year ?? String(new Date().getFullYear())} /></div>
        </div>
        <div className="adm-row">
          <div className="adm-field grow" style={{ marginBottom: 0 }}><label htmlFor="w-cat">Category</label><input id="w-cat" name="category" type="text" required maxLength={160} defaultValue={initial?.category} placeholder="Skincare · Concept" /></div>
          <div className="adm-field grow" style={{ marginBottom: 0 }}><label htmlFor="w-svc">Services shown</label><input id="w-svc" name="service" type="text" required maxLength={200} defaultValue={initial?.service} placeholder="Brand system · AI photography" /></div>
        </div>

        <div>
          <p className="adm-kicker" style={{ marginBottom: 8 }}><i>01</i> Card image</p>
          <div className="adm-row" style={{ alignItems: "flex-start" }}>
            <div style={{ ...thumb, width: 110 }}>{card ? <LoadImg src={card.url} alt={card.alt} loading="lazy" /> : null}</div>
            <div><button type="button" className="adm-btn adm-btn--sm" onClick={() => setTarget("card")}>{card ? "Change" : "Choose"} image</button><p className="adm-card__note">Also the hero of the case page and the share image.</p></div>
          </div>
        </div>

        {(["overview", "challenge", "results", "conclusion"] as const).map((k, n) => (
          <div className="adm-field" style={{ marginBottom: 0 }} key={k}>
            <label htmlFor={`w-${k}`}><i>{String(n + 2).padStart(2, "0")}</i> {{ overview: "Project overview", challenge: "The challenge", results: "What we delivered", conclusion: "The takeaway" }[k]}</label>
            <textarea id={`w-${k}`} name={k} rows={4} maxLength={4000} defaultValue={initial?.[k]} />
          </div>
        ))}

        <div>
          <p className="adm-kicker" style={{ marginBottom: 8 }}><i>06</i> Campaign images ({duo.length})</p>
          <div className="adm-row" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
            {duo.map((m, i) => (
              <div key={m.id} style={{ width: 110 }}>
                <div style={thumb}><LoadImg src={m.url} alt={m.alt} loading="lazy" /></div>
                <div className="adm-row" style={{ marginTop: 6, gap: 4 }}>
                  <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" disabled={i === 0} onClick={() => shift(i, -1)} aria-label="Move earlier">←</button>
                  <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" disabled={i === duo.length - 1} onClick={() => shift(i, 1)} aria-label="Move later">→</button>
                  <button type="button" className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => setDuo((d) => d.filter((x) => x.id !== m.id))} aria-label={`Remove ${m.alt}`}>×</button>
                </div>
              </div>
            ))}
            <button type="button" className="adm-btn adm-btn--sm" onClick={() => setTarget("duo")}>Add image +</button>
          </div>
        </div>

        <div>
          <p className="adm-kicker" style={{ marginBottom: 8 }}><i>07</i> Wide image</p>
          <div className="adm-row" style={{ alignItems: "flex-start" }}>
            <div style={{ ...thumb, width: 180, aspectRatio: "16 / 9" }}>{wide ? <LoadImg src={wide.url} alt={wide.alt} loading="lazy" /> : null}</div>
            <div className="adm-row">
              <button type="button" className="adm-btn adm-btn--sm" onClick={() => setTarget("wide")}>{wide ? "Change" : "Choose"} image</button>
              {wide ? <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setWide(null)}>Use the card image</button> : null}
            </div>
          </div>
        </div>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="adm-kicker" style={{ marginBottom: 8 }}><i>08</i> Listed on these service pages</legend>
          <div className="adm-row" style={{ flexWrap: "wrap" }}>
            {services.map((s) => (
              <label key={s.slug} className="adm-row" style={{ gap: 6 }}>
                <input type="checkbox" name="serviceSlugs" value={s.slug} defaultChecked={initial?.serviceSlugs.includes(s.slug)} /> {s.name}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="adm-row" style={{ flexWrap: "wrap", gap: 20 }}>
          <label className="adm-row" style={{ gap: 6 }}><input type="checkbox" name="published" defaultChecked={initial?.published ?? true} /> Published (visible on the site)</label>
          <label className="adm-row" style={{ gap: 6 }}><input type="checkbox" name="ageGate" defaultChecked={initial?.ageGate ?? false} /> Legal-age gate (alcohol work)</label>
        </div>

        {state?.error ? <p className="adm-flash adm-flash--err" role="alert" style={{ margin: 0 }}>{state.error}</p> : null}
        <div className="adm-row">
          <button className="adm-btn adm-btn--gradient" type="submit" disabled={saving}>{saving ? "Saving" : editing ? "Save changes" : "Create work"}</button>
          <Link className="adm-btn adm-btn--ghost" href="/admin/works">Cancel</Link>
        </div>
      </form>

      <MediaPicker
        open={target !== null}
        onClose={() => setTarget(null)}
        onPick={pick}
        media={media}
        onUploaded={(m) => setMedia((l) => [m, ...l])}
        heading={target === "card" ? "Choose the card image" : target === "wide" ? "Choose the wide image" : "Add a campaign image"}
      />
    </>
  );
}
