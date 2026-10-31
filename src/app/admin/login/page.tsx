import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/cms/session";
import LoginForm from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  if (await getSessionUser()) redirect("/admin");
  const { expired } = await searchParams;
  return (
    <div className="adm-auth">
      <aside className="adm-auth__brand">
        <div className="adm-auth__top">
          <span className="adm-auth__wordmark">SLIIQQUE</span>
          <span>Studio / Journal</span>
        </div>
        <div className="adm-auth__statement">
          <p className="adm-kicker"><span className="adm-dot" /> Private workspace</p>
          <h1>Journal<em>console</em></h1>
          <p>A private room for the studio&apos;s writing. Drafts, images, schedules and the published edit, kept in one place.</p>
        </div>
        <div className="adm-auth__strip" aria-hidden="true">
          <div className="adm-auth__strip-track">
            {["Drafts", "Edits", "Schedules", "Stories", "Signals", "Drafts", "Edits", "Schedules", "Stories", "Signals"].map((word, i) => <span key={`${word}-${i}`}>{word}</span>)}
          </div>
        </div>
        <div className="adm-auth__foot">
          <span>Lagos, Nigeria</span>
          <span>Private by design</span>
        </div>
      </aside>

      <main className="adm-auth__panel">
        <div className="adm-auth__form">
          <p className="adm-kicker"><span className="adm-dot" /> Sign in</p>
          <h2>Welcome back.</h2>
          <p>Enter the email address on your account. We will send a one-time link to let you in.</p>
          {expired ? <p className="adm-flash adm-flash--warn" role="alert">That link is invalid, used or expired. Request a new one.</p> : null}
          <LoginForm />
          <p className="adm-auth__legal">Access is limited to addresses on the roster. Links expire in 15 minutes and work once.</p>
          <div className="adm-auth__meta">
            <span>One-time link</span>
            <span>No passwords</span>
          </div>
        </div>
      </main>
    </div>
  );
}
