/** Video types offered in the admin, in the order the /videos filter shows them. */
export const VIDEO_TYPES = ["Commercial", "UGC", "Digital human", "Fashion", "Photography", "Behind the scenes"] as const;

const ID = /^[A-Za-z0-9_-]{11}$/;

/** Pulls the 11-character YouTube ID out of a pasted link (watch, youtu.be, shorts, embed, live) or a bare ID. Null when it is not one. */
export function parseYoutubeId(input: string): string | null {
  const text = input.trim();
  if (ID.test(text)) return text;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m)\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.split("/")[1] ?? null;
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    id = url.searchParams.get("v");
    if (!id) {
      const [kind, value] = url.pathname.split("/").filter(Boolean);
      if (["shorts", "embed", "live", "v"].includes(kind)) id = value ?? null;
    }
  }
  return id && ID.test(id) ? id : null;
}

/** "0:30", "8:05" or "1:02:03" to an ISO 8601 duration ("PT0M30S"). Null when it is not a clock time. */
export function clockToIso(input: string): string | null {
  const m = input.trim().match(/^(?:(\d{1,2}):)?(\d{1,3}):([0-5]\d)$/);
  if (!m) return null;
  const [, h, min, s] = m;
  return `PT${h ? `${Number(h)}H` : ""}${Number(min)}M${Number(s)}S`;
}

/** The reverse of clockToIso, for the edit form. */
export function isoToClock(iso: string): string {
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return "";
  const [, h, min = "0", s = "0"] = m;
  return `${h ? `${h}:${min.padStart(2, "0")}` : min}:${s.padStart(2, "0")}`;
}
