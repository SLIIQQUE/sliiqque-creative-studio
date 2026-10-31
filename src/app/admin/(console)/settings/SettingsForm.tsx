"use client";

import { useActionState } from "react";
import { saveSettings, type SettingsState } from "./actions";

type Props = { journalTitle: string; journalDescription: string; postsPerPage: number; defaultShareMediaId: string | null; media: { id: string; alt: string }[] };

export default function SettingsForm(p: Props) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveSettings, undefined);
  return (
    <form action={action} className="adm-card">
      <div className="adm-card__head">
        <div>
          <p className="adm-kicker"><i>01</i> Journal</p>
          <h2>Public identity</h2>
        </div>
      </div>
      {state?.error ? <p className="adm-flash adm-flash--err" role="alert">{state.error}</p> : state?.ok ? <p className="adm-flash adm-flash--ok" role="status">{state.ok}</p> : null}
      <div className="adm-field">
        <label htmlFor="jt">Journal title</label>
        <input id="jt" name="journalTitle" type="text" defaultValue={p.journalTitle} required />
      </div>
      <div className="adm-field">
        <label htmlFor="jd">Journal description</label>
        <textarea id="jd" name="journalDescription" defaultValue={p.journalDescription} rows={3} />
      </div>
      <div className="adm-field">
        <label htmlFor="pp">Posts shown before &ldquo;Load more&rdquo;</label>
        <input id="pp" name="postsPerPage" type="number" min={1} max={24} defaultValue={p.postsPerPage} />
      </div>
      <div className="adm-field">
        <label htmlFor="dm">Default share image</label>
        <select id="dm" name="defaultShareMediaId" defaultValue={p.defaultShareMediaId ?? ""}>
          <option value="">None</option>
          {p.media.map((m) => <option key={m.id} value={m.id}>{m.alt.slice(0, 70)}</option>)}
        </select>
      </div>
      <button className="adm-btn adm-btn--gradient" type="submit" disabled={pending}>{pending ? "Saving" : "Save settings"}</button>
    </form>
  );
}
