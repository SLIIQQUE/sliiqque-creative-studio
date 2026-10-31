import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { requireOwner } from "@/lib/cms/dal";
import { formatLagos } from "@/lib/cms/dates";
import { getSettings, listMedia } from "@/lib/cms/queries";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  await requireOwner();
  const [s, media] = await Promise.all([getSettings(), listMedia(100)]);
  let db_ok = true;
  try {
    await db.execute(sql`select 1`);
  } catch {
    db_ok = false;
  }
  const blob = !!process.env.BLOB_READ_WRITE_TOKEN;
  const cron = !!process.env.CRON_SECRET;
  const signals = [db_ok, blob, cron];
  const healthy = signals.filter(Boolean).length;
  const pct = Math.round((healthy / signals.length) * 100);
  const ring = 2 * Math.PI * 56;
  const dash = (pct / 100) * ring;
  const ringColor = pct === 100 ? "#1b8a48" : pct >= 50 ? "#b57a00" : "#c0392b";

  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-kicker"><span className="adm-dot" /> Control room <i>·</i> Owner only</p>
          <h1 className="adm-head__title">The control <em className="adm-gradient-text">room</em><span className="adm-head__ghost">.</span></h1>
          <p className="adm-sub">The journal&apos;s public identity and the systems behind it. Changes here apply to every reader.</p>
        </div>
      </div>

      <div className="adm-bento">
        <div className="adm-span-7">
          <SettingsForm
            journalTitle={s.journalTitle}
            journalDescription={s.journalDescription}
            postsPerPage={s.postsPerPage}
            defaultShareMediaId={s.defaultShareMediaId}
            media={media.map((m) => ({ id: m.id, alt: m.alt }))}
          />
        </div>

        <div className="adm-card adm-span-5">
          <div className="adm-card__head">
            <div>
              <p className="adm-kicker"><i>02</i> Signals</p>
              <h2>System monitor</h2>
            </div>
            <span className={`adm-pill adm-pill--${db_ok ? "published" : "archived"}`}>{db_ok ? "Online" : "Offline"}</span>
          </div>
          <div className="adm-monitor">
            <div className="adm-monitor__ring">
              <svg viewBox="0 0 140 140" role="img" aria-label={`${healthy} of ${signals.length} systems ready`}>
                <circle cx="70" cy="70" r="56" fill="none" stroke="var(--line)" strokeWidth="8" />
                <circle cx="70" cy="70" r="56" fill="none" stroke={ringColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${dash} ${ring - dash}`} />
              </svg>
              <div><b>{healthy}/{signals.length}</b><span>signals ready</span></div>
            </div>
          </div>
          <div className="adm-health">
            <div className="adm-health__row"><span>Database</span><span>{db_ok ? "Reachable" : "Not reachable"}</span></div>
            <div className="adm-health__row"><span>Image storage</span><span>{blob ? "Vercel Blob" : "Local disk (development only)"}</span></div>
            <div className="adm-health__row"><span>Scheduler secret</span><span>{cron ? "Set" : "Not set, scheduled posts will not publish automatically"}</span></div>
            <div className="adm-health__row"><span>Scheduler last ran</span><span>{s.schedulerLastRunAt ? formatLagos(s.schedulerLastRunAt) : "Never"}</span></div>
            <div className="adm-health__row"><span>Last search engine ping</span><span>{s.indexNowLastStatus ?? "None yet"}</span></div>
          </div>
          <p className="adm-card__note">Health is read live each time this page loads. Missing secrets are flagged, never guessed.</p>
        </div>
      </div>
    </>
  );
}
