"use client";

import { useActionState } from "react";
import { requestLink, type LoginState } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(requestLink, undefined);
  if (state?.sent) {
    return <p className="adm-flash adm-flash--ok" role="status">If that address has an account, a sign-in link is on its way. It works once and expires in 15 minutes.</p>;
  }
  return (
    <form action={action}>
      {state?.error ? <p className="adm-flash adm-flash--err" role="alert">{state.error}</p> : null}
      <div className="adm-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" autoFocus placeholder="you@sliiqque.space" />
      </div>
      <button className="adm-btn adm-btn--gradient" type="submit" disabled={pending}>{pending ? "Sending" : "Email me a sign-in link"} <span className="adm-btn__arrow">↗</span></button>
    </form>
  );
}
