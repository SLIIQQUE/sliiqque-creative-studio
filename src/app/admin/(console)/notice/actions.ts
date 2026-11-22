"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { siteNotice } from "@/db/schema";
import { audit } from "@/lib/cms/audit";
import { Forbidden, authorize } from "@/lib/cms/dal";
import { revalidateSite } from "@/lib/cms/revalidate";
import { isSafeHref } from "@/lib/notice-utils";

export type NoticeState = { error?: string; ok?: string } | undefined;

const schema = z
  .object({
    enabled: z.boolean(),
    label: z.string().trim().max(40, "Keep the tag under 40 characters"),
    message: z.string().trim().min(1, "Write the notice text").max(280, "Keep the notice under 280 characters"),
    linkLabel: z.string().trim().max(60),
    linkHref: z.string().trim().max(512),
    hideAfter: z.string().trim().refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Choose a valid last day"),
  })
  .superRefine((v, ctx) => {
    if (!!v.linkLabel !== !!v.linkHref) ctx.addIssue({ code: "custom", message: "Give the link both a label and an address, or leave both empty" });
    if (v.linkHref && !isSafeHref(v.linkHref)) ctx.addIssue({ code: "custom", message: "The link must be a site path like /contact or an https address" });
  });

export async function saveNotice(_prev: NoticeState, formData: FormData): Promise<NoticeState> {
  try {
    const user = await authorize();
    const v = schema.parse({
      enabled: formData.get("enabled") === "on",
      label: formData.get("label") ?? "",
      message: formData.get("message") ?? "",
      linkLabel: formData.get("linkLabel") ?? "",
      linkHref: formData.get("linkHref") ?? "",
      hideAfter: formData.get("hideAfter") ?? "",
    });
    const values = { enabled: v.enabled, label: v.label || null, message: v.message, linkLabel: v.linkLabel || null, linkHref: v.linkHref || null, hideAfter: v.hideAfter || null, updatedAt: new Date() };
    await db.insert(siteNotice).values({ id: 1, ...values }).onConflictDoUpdate({ target: siteNotice.id, set: values });
    await audit(user, "update", "notice", "1", { enabled: v.enabled });
    revalidateSite();
    revalidatePath("/admin/notice");
    return { ok: v.enabled ? "Saved. The notice is live on every public page." : "Saved. The notice is switched off." };
  } catch (e) {
    if (e instanceof Forbidden) return { error: e.message };
    if (e instanceof z.ZodError) return { error: e.issues[0]?.message ?? "Invalid input" };
    return { error: "Could not save the notice" };
  }
}
