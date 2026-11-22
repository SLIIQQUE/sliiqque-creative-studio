import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { siteNotice } from "@/db/schema";
import { journalSource } from "@/lib/journal";
import { lagosToday, noticeVersion, type Notice } from "@/lib/notice-utils";

/** Shown until the admin saves a notice of its own. Change it from the admin, not here. */
export const DEFAULT_NOTICE = {
  enabled: true,
  label: "Pricing update",
  message: "Our pricing changes from 22 December 2026. Current clients keep their agreed rates until their term ends.",
  linkLabel: "Get in touch",
  linkHref: "/contact",
  hideAfter: null as string | null,
};

type Row = Omit<typeof DEFAULT_NOTICE, "label"> & { label: string | null };

const shape = (r: Row): Notice | null => {
  if (!r.enabled || !r.message.trim()) return null;
  if (r.hideAfter && lagosToday() > r.hideAfter) return null;
  const link = r.linkHref && r.linkLabel ? { label: r.linkLabel, href: r.linkHref } : null;
  const label = r.label?.trim() || null;
  return { label, message: r.message, link, hideAfter: r.hideAfter, version: noticeVersion(label ?? "", r.message, link?.href ?? "", link?.label ?? "") };
};

/** The raw saved notice, or the default when none was saved. For the admin form. */
export async function getNoticeRow(): Promise<Row & { saved: boolean }> {
  const [row] = await db.select().from(siteNotice).where(eq(siteNotice.id, 1)).limit(1);
  return row ? { enabled: row.enabled, label: row.label, message: row.message, linkLabel: row.linkLabel ?? "", linkHref: row.linkHref ?? "", hideAfter: row.hideAfter, saved: true } : { ...DEFAULT_NOTICE, saved: false };
}

/** The notice for the public site, or null when it is switched off or past its last day. A database problem never hides a notice the site is meant to show. */
export async function getNotice(): Promise<Notice | null> {
  if (journalSource() === "json") return shape(DEFAULT_NOTICE);
  try {
    const row = await getNoticeRow();
    return shape(row);
  } catch (error) {
    console.error("getNotice: could not read the notice, using the default", error);
    return shape(DEFAULT_NOTICE);
  }
}
