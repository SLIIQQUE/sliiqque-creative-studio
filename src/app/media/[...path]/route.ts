import { readLocalUpload } from "@/lib/cms/media-service";

// Serves images uploaded while developing locally. In production uploads live in Vercel Blob and this route is unused.
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (process.env.BLOB_READ_WRITE_TOKEN) return new Response("Not found", { status: 404 });
  const { path } = await params;
  const file = await readLocalUpload(path);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.data), { headers: { "Content-Type": file.mime, "Cache-Control": "public, max-age=3600", "X-Content-Type-Options": "nosniff" } });
}
