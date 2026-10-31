"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Forbidden, authorize } from "@/lib/cms/dal";
import { MediaError, deleteMedia, updateMediaText } from "@/lib/cms/media-service";

export type MediaState = { error?: string; ok?: string } | undefined;

export async function saveMediaText(_prev: MediaState, formData: FormData): Promise<MediaState> {
  try {
    const user = await authorize();
    await updateMediaText(user, z.string().uuid().parse(formData.get("id")), String(formData.get("alt") ?? ""), String(formData.get("caption") ?? "") || null);
    revalidatePath("/admin/media");
    return { ok: "Saved" };
  } catch (e) {
    if (e instanceof Forbidden || e instanceof MediaError) return { error: e.message };
    return { error: "Could not save" };
  }
}

export async function removeMedia(_prev: MediaState, formData: FormData): Promise<MediaState> {
  try {
    const user = await authorize();
    await deleteMedia(user, z.string().uuid().parse(formData.get("id")));
    revalidatePath("/admin/media");
    return { ok: "Deleted" };
  } catch (e) {
    if (e instanceof Forbidden || e instanceof MediaError) return { error: e.message };
    return { error: "Could not delete" };
  }
}
