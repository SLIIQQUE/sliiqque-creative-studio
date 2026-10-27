/** First-touch campaign attribution kept for the browser session only (no cookies), so a contact or
 *  newsletter submission can say which post sent the visitor. Read by DemoForm, written by AttributionCapture. */
const KEY = "sq_attr";
const PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export type Attribution = { source?: string; medium?: string; campaign?: string; content?: string; term?: string; referrer?: string; landing?: string };

export function captureAttribution(): void {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const q = new URLSearchParams(location.search);
    const hasUtm = PARAMS.some((p) => q.get(p));
    const ref = document.referrer && !document.referrer.includes(location.host) ? new URL(document.referrer).hostname : "";
    if (!hasUtm && !ref) return;
    const a: Attribution = {
      source: q.get("utm_source") ?? undefined, medium: q.get("utm_medium") ?? undefined, campaign: q.get("utm_campaign") ?? undefined,
      content: q.get("utm_content") ?? undefined, term: q.get("utm_term") ?? undefined, referrer: ref || undefined, landing: location.pathname,
    };
    sessionStorage.setItem(KEY, JSON.stringify(a));
  } catch { /* storage blocked: attribution is simply not recorded */ }
}

export function readAttribution(): Attribution | null {
  try { const v = sessionStorage.getItem(KEY); return v ? (JSON.parse(v) as Attribution) : null; } catch { return null; }
}

/** One short line for emails: "facebook / social / studio-novdec-2026 / fb-03 / commercials, landed on /ai-commercials-lagos". */
export function describeAttribution(a: Attribution | undefined | null): string {
  if (!a) return "";
  const utm = [a.source, a.medium, a.campaign, a.content, a.term].filter(Boolean).join(" / ");
  const bits = [utm || (a.referrer ? `referrer ${a.referrer}` : ""), a.landing ? `landed on ${a.landing}` : ""].filter(Boolean);
  return bits.join(", ").slice(0, 300);
}
