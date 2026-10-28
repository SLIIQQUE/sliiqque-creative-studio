/** GA4 Measurement ID. Override with NEXT_PUBLIC_GA_ID; it is public by design. */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-0Q1FTZE6MT";

export const CONSENT_KEY = "sliiqque-analytics-consent";
export const OPEN_SETTINGS_EVENT = "sliiqque:cookie-settings";

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

/** Sends a GA4 event. Does nothing until the visitor has accepted analytics. */
export function trackEvent(name: string, params: Record<string, string | number> = {}) {
  if (typeof window === "undefined") return;
  (window as GtagWindow).gtag?.("event", name, params);
}
