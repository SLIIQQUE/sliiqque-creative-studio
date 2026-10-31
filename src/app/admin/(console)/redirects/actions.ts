"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { redirects } from "@/db/schema";
import { audit } from "@/lib/cms/audit";
import { Forbidden, authorize } from "@/lib/cms/dal";

export type RedirectState = { error?: string; ok?: string } | undefined;
const path = z.string().trim().min(2).max(512).refine((p) => p.startsWith("/") && !p.startsWith("//"), "Paths must start with a single /");

export async function addRedirect(_prev: RedirectState, formData: FormData): Promise<RedirectState> {
  try {
    const owner = await authorize(["owner"]);
    const v = z.object({ fromPath: path, toPath: path, code: z.coerce.number().refine((c) => [301, 302, 307, 308].includes(c), "Use 301, 302, 307 or 308") }).parse({ fromPath: formData.get("fromPath"), toPath: formData.get("toPath"), code: formData.get("code") });
    if (v.fromPath === v.toPath) return { error: "From and to are the same" };
    const [loop] = await db.select().from(redirects).where(eq(redirects.fromPath, v.toPath)).limit(1);
    if (loop?.toPath === v.fromPath) return { error: "That would create a redirect loop" };
    await db.insert(redirects).values(v).onConflictDoUpdate({ target: redirects.fromPath, set: { toPath: v.toPath, code: v.code } });
    await audit(owner, "create", "redirect", null, v);
    revalidatePath("/admin/redirects");
    return { ok: "Saved" };
  } catch (e) {
    if (e instanceof Forbidden) return { error: e.message };
    if (e instanceof z.ZodError) return { error: e.issues[0]?.message ?? "Invalid input" };
    return { error: "Could not save" };
  }
}

export async function removeRedirect(formData: FormData): Promise<void> {
  const owner = await authorize(["owner"]);
  const id = z.string().uuid().parse(formData.get("id"));
  await db.delete(redirects).where(eq(redirects.id, id));
  await audit(owner, "delete", "redirect", id);
  revalidatePath("/admin/redirects");
}
