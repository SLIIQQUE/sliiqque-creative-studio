"use server";

import { revalidatePath } from "next/cache";
import { and, count, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { audit } from "@/lib/cms/audit";
import { Forbidden, authorize } from "@/lib/cms/dal";
import { endAllSessions } from "@/lib/cms/session";

export type UserState = { error?: string; ok?: string } | undefined;

export async function inviteUser(_prev: UserState, formData: FormData): Promise<UserState> {
  try {
    const owner = await authorize(["owner"]);
    const v = z.object({ email: z.string().trim().toLowerCase().email().max(320), name: z.string().trim().min(1).max(255), role: z.enum(["owner", "editor"]) }).parse({ email: formData.get("email"), name: formData.get("name"), role: formData.get("role") });
    await db.insert(users).values(v);
    await audit(owner, "create", "user", null, { email: v.email, role: v.role });
    revalidatePath("/admin/users");
    return { ok: `${v.name} can now request a sign-in link.` };
  } catch (e) {
    if (e instanceof Forbidden) return { error: e.message };
    if (e instanceof z.ZodError) return { error: e.issues[0]?.message ?? "Invalid input" };
    return { error: "Could not add the user. The email may already exist." };
  }
}

/** Guards against locking everyone out: at least one enabled owner must remain. */
async function otherOwners(excludeId: string) {
  const [r] = await db.select({ n: count() }).from(users).where(and(eq(users.role, "owner"), eq(users.disabled, false), ne(users.id, excludeId)));
  return r.n;
}

export async function updateUser(formData: FormData): Promise<void> {
  const owner = await authorize(["owner"]);
  const id = z.string().uuid().parse(formData.get("id"));
  const role = z.enum(["owner", "editor"]).parse(formData.get("role"));
  const disabled = formData.get("disabled") === "on";
  if ((role !== "owner" || disabled) && (await otherOwners(id)) === 0) return;
  await db.update(users).set({ role, disabled }).where(eq(users.id, id));
  if (disabled) await endAllSessions(id);
  await audit(owner, "update", "user", id, { role, disabled });
  revalidatePath("/admin/users");
}

export async function revokeSessions(formData: FormData): Promise<void> {
  const owner = await authorize(["owner"]);
  const id = z.string().uuid().parse(formData.get("id"));
  await endAllSessions(id);
  await audit(owner, "revoke-sessions", "user", id);
  revalidatePath("/admin/users");
}
