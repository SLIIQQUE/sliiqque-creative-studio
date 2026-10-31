import { requireOwner } from "@/lib/cms/dal";
import { listRedirects } from "@/lib/cms/queries";
import { removeRedirect } from "./actions";
import RedirectForm from "./RedirectForm";

function logged(value: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export default async function RedirectsPage() {
  await requireOwner();
  const rows = await listRedirects();
  const permanent = rows.filter((r) => r.code === 301 || r.code === 308).length;
  const temporary = rows.length - permanent;
  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-kicker"><span className="adm-dot" /> Routes <i>·</i> {rows.length} {rows.length === 1 ? "redirect" : "redirects"}</p>
          <h1 className="adm-head__title">The route <em className="adm-gradient-text">book</em><span className="adm-head__ghost">.</span></h1>
          <p className="adm-sub">Journal addresses that moved. A redirect is added automatically when a published post&apos;s slug changes.</p>
        </div>
      </div>

      <div className="adm-bento">
        <div className="adm-card adm-span-4 adm-reg adm-addcard">
          <div className="adm-card__head">
            <div>
              <p className="adm-kicker"><i>01</i> Add</p>
              <h2>New redirect</h2>
            </div>
          </div>
          <RedirectForm />
          <p className="adm-card__note">Use the permanent codes unless the move is temporary. The journal resolves redirects before it renders a post.</p>
        </div>

        <section className="adm-card adm-card--dark adm-span-8 adm-ledger">
          <div className="adm-card__head adm-ledger__head">
            <div>
              <p className="adm-kicker"><i>02</i> Ledger</p>
              <h2>Every move</h2>
            </div>
            <div className="adm-ledger__count">
              <b>{String(rows.length).padStart(2, "0")}</b>
              <span>{rows.length === 1 ? "route" : "routes"}</span>
            </div>
          </div>

          {rows.length ? (
            <>
              <div className="adm-ledger__meta">
                <span><b>{permanent}</b> Permanent</span>
                <span><b>{temporary}</b> Temporary</span>
                <span className="adm-ledger__hint">Newest first</span>
              </div>
              <ol className="adm-ledger__list">
                {rows.map((r, i) => {
                  const isPermanent = r.code === 301 || r.code === 308;
                  return (
                    <li className="adm-ledger__row" key={r.id}>
                      <span className="adm-ledger__num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                      <div className="adm-ledger__paths">
                        <div className="adm-ledger__path adm-ledger__from">
                          <span className="adm-ledger__tag">From</span>
                          <code title={r.fromPath}>{r.fromPath}</code>
                        </div>
                        <div className="adm-ledger__path adm-ledger__to">
                          <span className="adm-ledger__tag">To</span>
                          <code title={r.toPath}>{r.toPath}</code>
                        </div>
                      </div>
                      <div className="adm-ledger__code">
                        <span className={`adm-ledger__stamp adm-ledger__stamp--${isPermanent ? "perm" : "temp"}`}>{r.code}</span>
                        <small>{isPermanent ? "Permanent" : "Temporary"}</small>
                      </div>
                      <div className="adm-ledger__side">
                        <span className="adm-ledger__date">Logged {logged(r.createdAt)}</span>
                        <form action={removeRedirect}>
                          <input type="hidden" name="id" value={r.id} />
                          <button className="adm-ledger__remove" type="submit" aria-label={`Remove redirect from ${r.fromPath}`}>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" /></svg>
                            Remove
                          </button>
                        </form>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <footer className="adm-ledger__foot">
                <span className="adm-ledger__live" aria-hidden="true" />
                Slug changes are logged automatically. Redirects resolve before a post renders.
              </footer>
            </>
          ) : (
            <div className="adm-ledger__empty">
              <span className="adm-ledger__empty-route" aria-hidden="true">/old-route <i>→</i> /new-route</span>
              <b>No redirects.</b>
              <span>The address book is empty. Nothing has moved.</span>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
