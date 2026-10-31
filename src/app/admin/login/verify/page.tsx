import { verifyLink } from "../actions";

// The link opens this page and only a button press (a POST) consumes it, so mail scanners that prefetch the URL cannot use it up.
export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <div className="adm-auth adm-auth--solo">
      <div className="adm-auth__form">
        <p className="adm-kicker"><span className="adm-dot" /> Secure entry</p>
        <h2>Confirm sign-in.</h2>
        <p>Press the button to finish signing in to the journal admin.</p>
        <form action={verifyLink} style={{ marginTop: 22 }}>
          <input type="hidden" name="token" value={token} />
          <button className="adm-btn adm-btn--gradient adm-btn--block" type="submit">Sign in <span className="adm-btn__arrow">↗</span></button>
        </form>
        <p className="adm-auth__legal">Only a button press consumes this link, so mail scanners that prefetch the URL cannot use it up.</p>
        <div className="adm-auth__meta">
          <span>One-time link</span>
          <span>Expires in 15 minutes</span>
        </div>
      </div>
    </div>
  );
}
