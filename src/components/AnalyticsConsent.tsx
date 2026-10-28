"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";
import { CONSENT_KEY, GA_MEASUREMENT_ID, OPEN_SETTINGS_EVENT } from "@/lib/analytics";

type Consent = "granted" | "denied" | null;

const readConsent = (): Consent => {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
};

/** Removes Google Analytics cookies when a visitor declines or withdraws consent. */
const clearAnalyticsCookies = () => {
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    if (name !== "_ga" && !name.startsWith("_ga_")) return;
    const host = window.location.hostname.split(".");
    for (let i = 0; i < host.length - 1; i++) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${host.slice(i).join(".")}`;
    }
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
};

/**
 * Loads Google Analytics only after the visitor accepts, and shows the choice banner.
 * Nothing is sent to Google before consent. Same behaviour as the Product & Engineering site.
 */
export default function AnalyticsConsent() {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    setConsent(stored);
    setOpen(stored === null);
    setReady(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
  }, []);

  const choose = useCallback((value: "granted" | "denied") => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* storage unavailable: the choice applies for this visit only */
    }
    if (value === "denied") clearAnalyticsCookies();
    setConsent(value);
    setOpen(false);
  }, []);

  return (
    <>
      {consent === "granted" && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}

      {ready && open && (
        <div role="dialog" aria-label="Analytics cookies" className="consent">
          <p>
            We use Google Analytics cookies to understand how the site is used. Nothing is loaded unless you accept. Read our{" "}
            <Link href="/privacy#cookies-and-similar-technologies">Privacy Policy</Link>.
          </p>
          <div className="consent__actions">
            <button type="button" className="consent__btn consent__btn--accept" onClick={() => choose("granted")}>
              Accept
            </button>
            <button type="button" className="consent__btn" onClick={() => choose("denied")}>
              Decline
            </button>
          </div>
        </div>
      )}
    </>
  );
}
