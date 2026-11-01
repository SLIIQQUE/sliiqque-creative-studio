import { requireUser } from "@/lib/cms/dal";
import { endSession } from "@/lib/cms/session";
import { redirect } from "next/navigation";
import AdminNav from "./AdminNav";
import ConsoleBar from "./ConsoleBar";
import { journalSource } from "@/lib/journal";
import { runDueSchedule } from "@/lib/cms/post-service";

async function signOut() {
  "use server";
  await endSession();
  redirect("/admin/login");
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  // Catch-up: publish anything that came due while no cron ran (the daily cron is the only other trigger).
  await runDueSchedule().catch((error) => console.error("catch-up schedule run failed", error));
  const jsonSource = journalSource() === "json";
  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <div className="adm-brand">
          <span className="adm-brand__mark" aria-hidden="true">S</span>
          <div>
            <div className="adm-brand__name">SLIIQQUE</div>
            <small>Journal console</small>
          </div>
        </div>

        <AdminNav isOwner={user.role === "owner"} />

        <div className="adm-side__note">
          <span className="adm-side__note-mark">Field note / 01</span>
          <p>Useful first. Beautiful second. Both, always.</p>
          <span className="adm-side__note-line" aria-hidden="true" />
        </div>

        <div className="adm-side__foot">
          <div className="adm-user">
            <span className="adm-avatar" aria-hidden="true">{initials(user.name) || "S"}</span>
            <div>
              <div className="adm-user__name">{user.name}</div>
              <div className="adm-user__role">{user.role === "owner" ? "Owner" : "Editor"}</div>
            </div>
          </div>
          <form action={signOut}>
            <button className="adm-btn adm-btn--ghost adm-btn--sm adm-btn--block" type="submit">Sign out</button>
          </form>
          <div className="adm-side__meta">
            <span className="adm-live">Live workspace</span>
            <span>v1.1</span>
          </div>
        </div>
      </aside>

      <div className="adm-body">
        <header className="adm-topbar">
          <ConsoleBar isOwner={user.role === "owner"} />
        </header>
        <main className="adm-main">
          {jsonSource ? (
            <p className="adm-notice" role="alert">
              The public journal is still reading from content.json, so posts published here do not appear on the site. Set JOURNAL_SOURCE=db and redeploy to switch it over.
            </p>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
