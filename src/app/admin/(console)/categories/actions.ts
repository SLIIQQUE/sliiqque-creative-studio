"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { categories, posts } from "@/db/schema";
import { SERVICE_PAGES } from "@/data/services";
import { audit } from "@/lib/cms/audit";
import { Forbidden, authorize } from "@/lib/cms/dal";
import { slugify } from "@/lib/seo";

export type FormState = { error?: string; ok?: string } | undefined;
const Cat = z.object({ name: z.string().trim().min(1, "A name is required").max(120), serviceSlug: z.string().refine((s) => s === "" || SERVICE_PAGES.some((p) => p.slug === s), "Unknown service") });

export async function saveCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const user = await authorize();
    const parsed = Cat.parse({ name: formData.get("name"), serviceSlug: formData.get("serviceSlug") ?? "" });
    const id = String(formData.get("id") ?? "");
    if (id) {
      await db.update(categories).set({ name: parsed.name, serviceSlug: parsed.serviceSlug || null }).where(eq(categories.id, z.string().uuid().parse(id)));
    } else {
      await db.insert(categories).values({ slug: slugify(parsed.name), name: parsed.name, serviceSlug: parsed.serviceSlug || null });
    }
    await audit(user, id ? "update" : "create", "category", id || null, { name: parsed.name });
    revalidatePath("/admin/categories");
    return { ok: "Saved" };
  } catch (e) {
    if (e instanceof Forbidden) return { error: e.message };
    if (e instanceof z.ZodError) return { error: e.issues[0]?.message };
    return { error: "Could not save. The name may already exist." };
  }
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const user = await authorize(["owner"]);
  const id = z.string().uuid().parse(formData.get("id"));
  const used = await db.select({ id: posts.id }).from(posts).where(eq(posts.categoryId, id)).limit(1);
  if (used.length) return;
  await db.delete(categories).where(eq(categories.id, id));
  await audit(user, "delete", "category", id);
  revalidatePath("/admin/categories");
}
