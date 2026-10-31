"use client";

import { useActionState } from "react";
import { inviteUser, type UserState } from "./actions";

export default function InviteForm() {
  const [state, action, pending] = useActionState<UserState, FormData>(inviteUser, undefined);
  return (
    <form action={action}>
      {state?.error ? <p className="adm-flash adm-flash--err" role="alert">{state.error}</p> : state?.ok ? <p className="adm-flash adm-flash--ok" role="status">{state.ok}</p> : null}
      <div className="adm-field">
        <label htmlFor="iu-name">Name</label>
        <input id="iu-name" name="name" type="text" placeholder="Name" required />
      </div>
      <div className="adm-field">
        <label htmlFor="iu-email">Email</label>
        <input id="iu-email" name="email" type="email" placeholder="Email address" required />
      </div>
      <div className="adm-field">
        <label htmlFor="iu-role">Role</label>
        <select id="iu-role" name="role" defaultValue="editor">
          <option value="editor">Editor</option>
          <option value="owner">Owner</option>
        </select>
      </div>
      <button className="adm-btn adm-btn--block" type="submit" disabled={pending}>{pending ? "Adding" : "Add user"}</button>
    </form>
  );
}
