import { requireOwner } from "@/lib/cms/dal";
import { formatLagos } from "@/lib/cms/dates";
import { listUsers } from "@/lib/cms/queries";
import { revokeSessions, updateUser } from "./actions";
import InviteForm from "./InviteForm";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function UsersPage() {
  const me = await requireOwner();
  const rows = await listUsers();
  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-kicker"><span className="adm-dot" /> Team <i>·</i> {rows.length} {rows.length === 1 ? "person" : "people"}</p>
          <h1 className="adm-head__title">The <em className="adm-gradient-text">roster</em><span className="adm-head__ghost">.</span></h1>
          <p className="adm-sub">Only addresses listed here can request a sign-in link. Editors write and publish. Owners also manage people, settings, redirects and deletions.</p>
        </div>
      </div>

      <div className="adm-bento">
        <div className="adm-card adm-span-4 adm-reg">
          <div className="adm-card__head">
            <div>
              <p className="adm-kicker"><i>01</i> Invite</p>
              <h2>Add a user</h2>
            </div>
          </div>
          <InviteForm />
          <p className="adm-card__note">They sign in with a one-time email link. No passwords live in this system.</p>
        </div>

        <div className="adm-card adm-span-8">
          <div className="adm-card__head">
            <div>
              <p className="adm-kicker"><i>02</i> Roster</p>
              <h2>People with access</h2>
            </div>
            <span className="adm-chip"><b>{rows.length}</b> with access</span>
          </div>
          <div className="adm-userlist">
            {rows.map((u) => (
              <div key={u.id} className="adm-userrow">
                <div className="adm-userrow__id">
                  <span className={`adm-avatar${u.role === "owner" ? " adm-avatar--owner" : ""}`} aria-hidden="true">{initials(u.name)}</span>
                  <div style={{ minWidth: 0 }}>
                    <div className="adm-userrow__name">{u.name}{u.id === me.id ? <span className="adm-pill adm-pill--quiet" style={{ marginLeft: 8 }}>you</span> : null}</div>
                    <div className="adm-userrow__email">{u.email}</div>
                  </div>
                </div>
                <form action={updateUser} className="adm-userrow__controls">
                  <input type="hidden" name="id" value={u.id} />
                  <select name="role" defaultValue={u.role} aria-label={`Role for ${u.name}`}>
                    <option value="editor">Editor</option>
                    <option value="owner">Owner</option>
                  </select>
                  <label className="adm-check"><input type="checkbox" name="disabled" defaultChecked={u.disabled} /> Disabled</label>
                  <button className="adm-btn adm-btn--ghost adm-btn--sm" type="submit">Save</button>
                  <span className="adm-userrow__last">{u.lastLoginAt ? `Last in ${formatLagos(u.lastLoginAt)}` : "Never signed in"}</span>
                </form>
                <div className="adm-userrow__actions">
                  <form action={revokeSessions}>
                    <input type="hidden" name="id" value={u.id} />
                    <button className="adm-btn adm-btn--ghost adm-btn--sm" type="submit">Sign out everywhere</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
