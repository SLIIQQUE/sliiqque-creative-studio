import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { auditLog } from "@/db/schema";
import { requireOwner } from "@/lib/cms/dal";
import { formatLagos } from "@/lib/cms/dates";

export default async function AuditPage() {
  await requireOwner();
  const rows = await db.select().from(auditLog).orderBy(desc(auditLog.at)).limit(200);
  const actors = new Set(rows.map((r) => r.userEmail).filter(Boolean)).size;
  const last = rows[0];
  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-kicker"><span className="adm-dot" /> Ledger <i>·</i> Last {rows.length} actions</p>
          <h1 className="adm-head__title">The <em className="adm-gradient-text">trail</em><span className="adm-head__ghost">.</span></h1>
          <p className="adm-sub">A quiet record of every privileged move. Read-only, newest first, kept for the studio&apos;s own memory.</p>
        </div>
      </div>

      <div className="adm-band" style={{ marginBottom: 16 }}>
        <div>
          <p className="adm-kicker"><span className="adm-dot" /> At a glance</p>
          <h2 style={{ marginTop: 7 }}>{rows.length ? "The room is awake." : "The room is quiet."}</h2>
          <p style={{ marginTop: 5 }}>{last ? `Last action: ${last.action} at ${formatLagos(last.at)}.` : "The trail begins with the first privileged action."}</p>
        </div>
        <div className="adm-row">
          <span className="adm-chip"><b>{rows.length}</b> entries</span>
          <span className="adm-chip"><b>{actors}</b> actors</span>
          <span className="adm-chip"><b>Read-only</b> ledger</span>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-card__head">
          <div>
            <p className="adm-kicker"><i>01</i> Activity</p>
            <h2>The trail, newest first</h2>
          </div>
          <span className="adm-kicker">{String(rows.length).padStart(2, "0")} entries</span>
        </div>
        {rows.length ? (
          <div className="adm-timeline">
            {rows.map((r) => (
              <div className="adm-timeline__row" key={r.id}>
                <div className="adm-timeline__time">{formatLagos(r.at)}</div>
                <div className="adm-timeline__mark" aria-hidden="true" />
                <div className="adm-timeline__main">
                  <div className="adm-timeline__action">{r.action}</div>
                  <div className="adm-timeline__detail">
                    {r.entity}
                    {r.entityId ? <span className="mono"> · {r.entityId.slice(0, 8)}</span> : null}
                    {r.detail ? ` — ${JSON.stringify(r.detail).slice(0, 160)}` : ""}
                  </div>
                </div>
                <div className="adm-timeline__who">{r.userEmail ?? "system"}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="adm-empty">
            <b>Nothing yet.</b>
            <span>The trail begins with the first privileged action.</span>
          </div>
        )}
      </div>
    </>
  );
}
