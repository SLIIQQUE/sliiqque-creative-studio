export type Notice = { label: string | null; message: string; link: { label: string; href: string } | null; hideAfter: string | null; version: string };

/** Today's date in Lagos as YYYY-MM-DD. */
export const lagosToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date());

/** Short stable key for the notice text, so a visitor who closed one notice sees the next one. */
export function noticeVersion(...parts: string[]): string {
  let h = 5381;
  for (const ch of parts.join("\u0001")) h = ((h * 33) ^ ch.codePointAt(0)!) >>> 0;
  return h.toString(36);
}

/** A site path or an https link. Anything else (javascript:, data:, protocol-relative) is refused. */
export const isSafeHref = (href: string) => (href.startsWith("/") && !href.startsWith("//")) || /^https:\/\/[^\s]+$/i.test(href);
