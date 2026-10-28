"use client";

import { OPEN_SETTINGS_EVENT } from "@/lib/analytics";

/** Reopens the analytics choice banner. Lives in the footer so consent can be changed at any time. */
export default function CookieSettingsButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}>
      Cookie settings
    </button>
  );
}
