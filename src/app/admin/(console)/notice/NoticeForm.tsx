"use client";

import { useActionState, useState } from "react";
import { saveNotice, type NoticeState } from "./actions";

type Values = { enabled: boolean; label: string; message: string; linkLabel: string; linkHref: string; hideAfter: string };

export default function NoticeForm({ initial, saved }: { initial: Values; saved: boolean }) {
  const [state, action, saving] = useActionState<NoticeState, FormData>(saveNotice, undefined);
  const [tag, setTag] = useState(initial.label);
  const [message, setMessage] = useState(initial.message);
  const [label, setLabel] = useState(initial.linkLabel);
  const [on, setOn] = useState(initial.enabled);

  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-kicker"><span className="adm-dot" /> Site <i>·</i> {on ? "Showing" : "Switched off"}</p>
          <h1 className="adm-head__title">The <em className="adm-gradient-text">notice</em><span className="adm-head__ghost">.</span></h1>
          <p className="adm-sub">A slim bar above the navigation on every public page, never in the admin. Visitors can close it, and it comes back if you change the text.</p>
        </div>
      </div>

      {!saved ? <p className="adm-flash" role="status">Showing the built-in pricing notice. Save below to take over the wording.</p> : null}

      <form action={action} className="adm-card" style={{ display: "grid", gap: 18 }}>
        <label className="adm-row" style={{ gap: 6 }}><input type="checkbox" name="enabled" checked={on} onChange={(e) => setOn(e.target.checked)} /> Show the notice on the website</label>

        <div className="adm-field" style={{ marginBottom: 0, maxWidth: 320 }}>
          <label htmlFor="n-tag">Tag (optional, short)</label>
          <input id="n-tag" name="label" type="text" maxLength={40} value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Pricing update" />
        </div>

        <div className="adm-field" style={{ marginBottom: 0 }}>
          <label htmlFor="n-msg">Notice text ({message.length}/280)</label>
          <textarea id="n-msg" name="message" rows={3} maxLength={280} required value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>

        <div className="adm-row" style={{ flexWrap: "wrap" }}>
          <div className="adm-field grow" style={{ marginBottom: 0 }}><label htmlFor="n-label">Link label (optional)</label><input id="n-label" name="linkLabel" type="text" maxLength={60} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Get in touch" /></div>
          <div className="adm-field grow" style={{ marginBottom: 0 }}><label htmlFor="n-href">Link address (optional)</label><input id="n-href" name="linkHref" type="text" maxLength={512} defaultValue={initial.linkHref} placeholder="/contact or https://…" /></div>
        </div>

        <div className="adm-field" style={{ marginBottom: 0, maxWidth: 260 }}>
          <label htmlFor="n-until">Last day to show (optional)</label>
          <input id="n-until" name="hideAfter" type="date" defaultValue={initial.hideAfter} />
          <p className="adm-card__note">Lagos time. Empty keeps it showing until you switch it off.</p>
        </div>

        <div>
          <p className="adm-kicker" style={{ marginBottom: 8 }}>Preview</p>
          <div className="notice" style={{ borderRadius: 10, overflow: "hidden", animation: "none" }}>
            <div className="notice__in">
              {tag ? <span className="notice__tag"><b aria-hidden="true" />{tag}</span> : null}
              <p className="notice__text">{message || "Your notice text"}</p>
              {label ? <span className="notice__cta">{label}<i aria-hidden="true" /></span> : null}
            </div>
          </div>
        </div>

        {state?.error ? <p className="adm-flash adm-flash--err" role="alert" style={{ margin: 0 }}>{state.error}</p> : null}
        {state?.ok ? <p className="adm-flash" role="status" style={{ margin: 0 }}>{state.ok}</p> : null}
        <div className="adm-row"><button className="adm-btn adm-btn--gradient" type="submit" disabled={saving}>{saving ? "Saving" : "Save notice"}</button></div>
      </form>
    </>
  );
}
