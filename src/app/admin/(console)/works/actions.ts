"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { asc, eq, inArray, max } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { media, works } from "@/db/schema";
import { audit } from "@/lib/cms/audit";
import { Forbidden, authorize } from "@/lib/cms/dal";
import { SERVICE_PAGES } from "@/data/services";
import { builtInWorks, type WorkEntry } from "@/lib/works";
import { frameAlt } from "@/lib/hero";

export type WorkState = { error?: string; ok?: string } | undefined;

const MIME: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };
const RESERVED = new Set(["new"]);
const uuid = z.string().uuid();

const schema = z.object({
  id: z.string().optional(),
  slug: z.string().trim().toLowerCase().min(2, "Slug is required").max(120).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug can use lowercase letters, numbers and single hyphens").refine((s) => !RESERVED.has(s), "That slug is reserved"),
  name: z.string().trim().min(1, "Name is required").max(160),
  category: z.string().trim().min(1, "Category is required").max(160),
  service: z.string().trim().min(1, "Service line is required").max(200),
  year: z.string().trim().min(2, "Year is required").max(12),
  overview: z.string().trim().max(4000),
  challenge: z.string().trim().max(4000),
  results: z.string().trim().max(4000),
  conclusion: z.string().trim().max(4000),
  cardMediaId: uuid.catch("" as never).refine((v) => !!v, "Choose a card image"),
  wideMediaId: z.string().trim().transform((v) => v || null).pipe(uuid.nullable()),
  duoMediaIds: z.array(uuid).max(8, "At most 8 campaign images"),
  serviceSlugs: z.array(z.string()).transform((a) => a.filter((s) => SERVICE_PAGES.some((p) => p.slug === s))),
  ageGate: z.boolean(),
  published: z.boolean(),
});

function refresh(slug?: string, serviceSlugs: string[] = []) {
  for (const p of ["/", "/works", "/admin/works", "/sitemap.xml", "/llms.txt", "/llms-full.txt"]) revalidatePath(p);
  if (slug) revalidatePath(`/works/${slug}`);
  for (const s of serviceSlugs) revalidatePath(`/services/${s}`);
}

function fail(e: unknown, fallback: string): WorkState {
  if (e instanceof Forbidden) return { error: e.message };
  if (e instanceof z.ZodError) return { error: e.issues[0]?.message ?? "Invalid input" };
  return { error: fallback };
}

/** Copies the works that ship with the site into the editable list so the first change never wipes the current ones. */
async function seedBuiltIns(): Promise<void> {
  const [{ n }] = await db.select({ n: max(works.sortOrder) }).from(works);
  if (n !== null) return;
  const mediaFor = async (src: string): Promise<string> => {
    const url = src.startsWith("/") ? src : `/img/${src}`;
    const [existing] = await db.select({ id: media.id }).from(media).where(eq(media.url, url)).limit(1);
    if (existing) return existing.id;
    const file = url.split("/").pop() ?? url;
    const [row] = await db.insert(media).values({ url, mime: MIME[file.split(".").pop() ?? ""] ?? "image/jpeg", alt: frameAlt(file) }).returning({ id: media.id });
    return row.id;
  };
  let order = 0;
  for (const w of builtInWorks() satisfies WorkEntry[]) {
    await db.insert(works).values({
      slug: w.slug, name: w.name, category: w.category, service: w.service, year: w.year,
      cardMediaId: await mediaFor(w.img), wideMediaId: await mediaFor(w.wide),
      duoMediaIds: await Promise.all(w.duo.map(mediaFor)),
      overview: w.overview, challenge: w.challenge, results: w.results, conclusion: w.conclusion,
      serviceSlugs: w.serviceSlugs, ageGate: w.ageGate, published: true, sortOrder: order++,
    });
  }
}

export async function importBuiltInWorks(): Promise<WorkState> {
  try {
    await authorize();
    await seedBuiltIns();
    refresh();
    return { ok: "Current works copied into the list" };
  } catch (e) {
    return fail(e, "Could not import the works");
  }
}

/** Creates or updates a work from the editor form. A new work lands at the end of the list. */
export async function saveWork(_prev: WorkState, formData: FormData): Promise<WorkState> {
  let slug: string;
  try {
    const user = await authorize();
    const v = schema.parse({
      id: String(formData.get("id") ?? "") || undefined,
      slug: formData.get("slug"),
      name: formData.get("name"),
      category: formData.get("category"),
      service: formData.get("service"),
      year: formData.get("year"),
      overview: formData.get("overview") ?? "",
      challenge: formData.get("challenge") ?? "",
      results: formData.get("results") ?? "",
      conclusion: formData.get("conclusion") ?? "",
      cardMediaId: formData.get("cardMediaId"),
      wideMediaId: formData.get("wideMediaId") ?? "",
      duoMediaIds: formData.getAll("duoMediaIds").map(String).filter(Boolean),
      serviceSlugs: formData.getAll("serviceSlugs").map(String),
      ageGate: formData.get("ageGate") === "on",
      published: formData.get("published") === "on",
    });
    const refs = [v.cardMediaId, v.wideMediaId, ...v.duoMediaIds].filter((x): x is string => !!x);
    const found = await db.select({ id: media.id }).from(media).where(inArray(media.id, refs));
    if (found.length !== new Set(refs).size) return { error: "One of the chosen images no longer exists" };

    const { id, ...fields } = v;
    if (id) {
      const [row] = await db.select({ slug: works.slug }).from(works).where(eq(works.id, uuid.parse(id))).limit(1);
      if (!row) return { error: "That work no longer exists" };
      const { slug: _slug, ...rest } = fields; // the address never changes after creation
      await db.update(works).set(rest).where(eq(works.id, id));
      await audit(user, "update", "work", id, { slug: row.slug });
      slug = row.slug;
    } else {
      await seedBuiltIns();
      const [taken] = await db.select({ id: works.id }).from(works).where(eq(works.slug, fields.slug)).limit(1);
      if (taken) return { error: "A work with that slug already exists" };
      const [{ top }] = await db.select({ top: max(works.sortOrder) }).from(works);
      const [row] = await db.insert(works).values({ ...fields, sortOrder: (top ?? -1) + 1 }).returning({ id: works.id });
      await audit(user, "create", "work", row.id, { slug: fields.slug });
      slug = fields.slug;
    }
    refresh(slug, v.serviceSlugs);
  } catch (e) {
    return fail(e, "Could not save the work");
  }
  redirect("/admin/works?saved=1");
}

export async function moveWork(workId: string, direction: "up" | "down"): Promise<WorkState> {
  try {
    const user = await authorize();
    const wid = uuid.parse(workId);
    const rows = await db.select({ id: works.id }).from(works).orderBy(asc(works.sortOrder), asc(works.createdAt));
    const from = rows.findIndex((r) => r.id === wid);
    const to = direction === "up" ? from - 1 : from + 1;
    if (from < 0 || to < 0 || to >= rows.length) return undefined;
    const order = rows.map((r) => r.id);
    [order[from], order[to]] = [order[to], order[from]];
    await db.transaction(async (tx) => {
      for (const [i, rowId] of order.entries()) await tx.update(works).set({ sortOrder: i }).where(eq(works.id, rowId));
    });
    await audit(user, "update", "work", wid, { moved: direction });
    refresh();
    return { ok: "Order saved" };
  } catch (e) {
    return fail(e, "Could not reorder");
  }
}

export async function setWorkPublished(workId: string, published: boolean): Promise<WorkState> {
  try {
    const user = await authorize();
    const wid = uuid.parse(workId);
    const [row] = await db.update(works).set({ published }).where(eq(works.id, wid)).returning({ slug: works.slug, serviceSlugs: works.serviceSlugs });
    if (!row) return { error: "That work no longer exists" };
    await audit(user, "update", "work", wid, { published });
    refresh(row.slug, row.serviceSlugs);
    return { ok: published ? "Published" : "Hidden from the site" };
  } catch (e) {
    return fail(e, "Could not update the work");
  }
}

export async function deleteWork(workId: string): Promise<WorkState> {
  try {
    const user = await authorize();
    const wid = uuid.parse(workId);
    const [{ n }] = await db.select({ n: max(works.sortOrder) }).from(works);
    const all = await db.select({ id: works.id }).from(works);
    if (n !== null && all.length <= 1) return { error: "Keep at least one work, or hide it instead" };
    const [row] = await db.delete(works).where(eq(works.id, wid)).returning({ slug: works.slug, serviceSlugs: works.serviceSlugs });
    if (!row) return { error: "That work no longer exists" };
    await audit(user, "delete", "work", wid, { slug: row.slug });
    refresh(row.slug, row.serviceSlugs);
    return { ok: "Deleted" };
  } catch (e) {
    return fail(e, "Could not delete the work");
  }
}
