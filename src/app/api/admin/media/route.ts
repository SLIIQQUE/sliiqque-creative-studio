import { NextResponse } from "next/server";
import { Forbidden, authorize } from "@/lib/cms/dal";
import { MediaError, uploadImage } from "@/lib/cms/media-service";
import { allow } from "@/lib/cms/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await authorize();
    if (!(await allow(`upload:${user.id}`, 60, 3600))) return NextResponse.json({ error: "Too many uploads, try again later" }, { status: 429 });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
    const row = await uploadImage(user, { bytes: Buffer.from(await file.arrayBuffer()), filename: file.name, alt: String(form.get("alt") ?? ""), caption: String(form.get("caption") ?? "") || null });
    return NextResponse.json({ media: { id: row.id, url: row.url, alt: row.alt, width: row.width, height: row.height } });
  } catch (error) {
    if (error instanceof Forbidden) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof MediaError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("upload failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
