/** Lagos time (WAT, UTC+1, no daylight saving) for display. Storage is always UTC. */
export function formatLagos(date: Date | null | undefined): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-NG", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" }).format(date) + " WAT";
}

/** "2026-11-05T09:30" typed in the admin as Lagos time to a UTC Date. */
export function lagosLocalToDate(local: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number) as unknown as number[];
  return new Date(Date.UTC(y, mo - 1, d, h - 1, mi));
}

/** A UTC Date to the value a datetime-local input expects, in Lagos time. */
export function dateToLagosLocal(date: Date | null | undefined): string {
  if (!date) return "";
  const t = new Date(date.getTime() + 3600_000);
  return t.toISOString().slice(0, 16);
}
