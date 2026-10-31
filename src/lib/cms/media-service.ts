import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import sharp, { type FormatEnum, type Metadata } from "sharp";
import { db } from "@/db/client";
import { media } from "@/db/schema";
import { audit } from "./audit";
import { mediaUsage } from "./queries";
import type { SessionUser } from "./session";

export class MediaError extends Error {}

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_EDGE = 2400;
/** Real formats only, sniffed from the bytes. SVG and anything else is refused. */
const FORMATS: Record<string, { ext: string; mime: string }> = {
  jpeg: { ext: "jpg", mime: "image/jpeg" },
  png: { ext: "png", mime: "image/png" },
  webp: { ext: "webp", mime: "image/webp" },
  avif: { ext: "avif", mime: "image/avif" },
};

const LOCAL_DIR = path.join(process.cwd(), "storage", "uploads");
const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

async function blurPlaceholder(buffer: Buffer): Promise<string | null> {
  try {
    const tiny = await sharp(buffer).resize(12, 12, { fit: "inside" }).blur(1).webp({ quality: 40 }).toBuffer();
    return `data:image/webp;base64,${tiny.toString("base64")}`;
  } catch {
    return null;
  }
}

export type UploadInput = { bytes: Buffer; filename: string; alt: string; caption?: string | null };

export async function uploadImage(user: SessionUser, input: UploadInput) {
  if (input.bytes.length === 0) throw new MediaError("The file is empty");
  if (input.bytes.length > MAX_UPLOAD_BYTES) throw new MediaError(`The file is over ${MAX_UPLOAD_BYTES / 1024 / 1024} MB. Resize it and try again.`);
  if (!input.alt.trim()) throw new MediaError("Alt text is required");

  let meta: Metadata;
  try {
    meta = await sharp(input.bytes, { failOn: "error" }).metadata();
  } catch {
    throw new MediaError("That file is not a readable image");
  }
  const format = FORMATS[meta.format ?? ""];
  if (!format) throw new MediaError("Only JPEG, PNG, WebP and AVIF images are accepted");

  // Re-encode from decoded pixels: strips EXIF and any trailing payload, applies orientation, and bounds the size.
  const clean = await sharp(input.bytes).rotate().resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true }).toFormat(meta.format as keyof FormatEnum).toBuffer({ resolveWithObject: true });

  const now = new Date();
  const key = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomBytes(8).toString("hex")}.${format.ext}`;
  let url: string;
  if (useBlob()) {
    const blob = await put(`journal/${key}`, clean.data, { access: "public", contentType: format.mime, addRandomSuffix: false });
    url = blob.url;
  } else {
    if (process.env.NODE_ENV === "production") throw new MediaError("BLOB_READ_WRITE_TOKEN is not set, uploads are unavailable");
    const file = path.join(LOCAL_DIR, key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, clean.data);
    url = `/media/${key}`;
  }

  const [row] = await db
    .insert(media)
    .values({
      url,
      storageKey: useBlob() ? url : key,
      mime: format.mime,
      bytes: clean.data.length,
      width: clean.info.width,
      height: clean.info.height,
      alt: input.alt.trim().slice(0, 500),
      caption: input.caption?.trim() || null,
      blurDataUrl: await blurPlaceholder(clean.data),
      uploadedBy: user.id,
    })
    .returning();
  await audit(user, "upload", "media", row.id, { bytes: row.bytes, filename: input.filename.slice(0, 120) });
  return row;
}

export async function updateMediaText(user: SessionUser, id: string, alt: string, caption: string | null) {
  if (!alt.trim()) throw new MediaError("Alt text is required");
  await db.update(media).set({ alt: alt.trim().slice(0, 500), caption: caption?.trim() || null }).where(eq(media.id, id));
  await audit(user, "update", "media", id);
}

/** Refuses to delete an image a post still uses, so a published page never loses its picture. */
export async function deleteMedia(user: SessionUser, id: string) {
  const [row] = await db.select().from(media).where(eq(media.id, id)).limit(1);
  if (!row) return;
  const used = await mediaUsage(id);
  if (used.length) throw new MediaError(`Used in ${used.length} post${used.length === 1 ? "" : "s"}: ${used.map((u) => u.title).slice(0, 3).join(", ")}. Remove it there first.`);
  if (row.storageKey) {
    if (useBlob() && /^https?:/.test(row.storageKey)) await del(row.storageKey);
    else if (!row.storageKey.startsWith("http")) await unlink(path.join(LOCAL_DIR, row.storageKey)).catch(() => undefined);
  }
  await db.delete(media).where(eq(media.id, id));
  await audit(user, "delete", "media", id);
}

/** Reads a locally stored upload (development only). Rejects any path that escapes the uploads folder. */
export async function readLocalUpload(segments: string[]): Promise<{ data: Buffer; mime: string } | null> {
  const resolved = path.resolve(LOCAL_DIR, ...segments);
  if (!resolved.startsWith(LOCAL_DIR + path.sep)) return null;
  const ext = path.extname(resolved).slice(1).toLowerCase();
  const mime = Object.values(FORMATS).find((f) => f.ext === ext)?.mime;
  if (!mime) return null;
  try {
    return { data: await readFile(resolved), mime };
  } catch {
    return null;
  }
}
