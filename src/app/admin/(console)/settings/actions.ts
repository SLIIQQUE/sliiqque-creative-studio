"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { settings } from "@/db/schema";
import { audit } from "@/lib/cms/audit";
import { Forbidden, authorize } from "@/lib/cms/dal";

export type SettingsState = { error?: string; ok?: string } | undefined;

export async function saveSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  try {
    const user = await authorize(["owner"]);
    const v = z
      .object({ journalTitle: z.string().trim().min(1).max(255), journalDescription: z.string().trim().max(500), postsPerPage: z.coerce.number().int().min(1).max(24), defaultShareMediaId: z.union([z.string().uuid(), z.literal("")]) })
      .parse({ journalTitle: formData.get("journalTitle"), journalDescription: formData.get("journalDescription"), postsPerPage: formData.get("postsPerPage"), defaultShareMediaId: formData.get("defaultShareMediaId") ?? "" });
    await db.update(settings).set({ journalTitle: v.journalTitle, journalDescription: v.journalDescription, postsPerPage: v.postsPerPage, defaultShareMediaId: v.defaultShareMediaId || null, updatedAt: new Date() }).where(eq(settings.id, 1));
    await audit(user, "update", "settings");
    revalidatePath("/blogs");
    revalidatePath("/admin/settings");
    return { ok: "Settings saved" };
  } catch (e) {
    if (e instanceof Forbidden) return { error: e.message };
    if (e instanceof z.ZodError) return { error: e.issues[0]?.message ?? "Invalid input" };
    return { error: "Could not save" };
  }
}
