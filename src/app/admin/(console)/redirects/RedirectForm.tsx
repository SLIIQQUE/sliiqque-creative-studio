"use client";

import { useActionState } from "react";
import { addRedirect, type RedirectState } from "./actions";

export default function RedirectForm() {
  const [state, action, pending] = useActionState<RedirectState, FormData>(addRedirect, undefined);
  return (
    <form action={action}>
      {state?.error ? <p className="adm-flash adm-flash--err" role="alert">{state.error}</p> : state?.ok ? <p className="adm-flash adm-flash--ok" role="status">{state.ok}</p> : null}
      <div className="adm-field">
        <label htmlFor="rf">From</label>
        <input id="rf" name="fromPath" type="text" placeholder="/blogs/old-slug" required />
      </div>
      <div className="adm-field">
        <label htmlFor="rt">To</label>
        <input id="rt" name="toPath" type="text" placeholder="/blogs/new-slug" required />
      </div>
      <div className="adm-field">
        <label htmlFor="rc">Code</label>
        <select id="rc" name="code" defaultValue="308">
          <option value="308">308 permanent</option>
          <option value="301">301 permanent</option>
          <option value="307">307 temporary</option>
          <option value="302">302 temporary</option>
        </select>
      </div>
      <button className="adm-btn adm-btn--block" type="submit" disabled={pending}>{pending ? "Adding" : "Add redirect"}</button>
    </form>
  );
}
