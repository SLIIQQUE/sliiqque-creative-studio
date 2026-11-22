import { requireUser } from "@/lib/cms/dal";
import { listVideoRows } from "@/lib/videos";
import VideosManager from "./VideosManager";

export default async function VideosAdminPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireUser();
  const { saved } = await searchParams;
  const rows = await listVideoRows();
  return <VideosManager saved={saved === "1"} videos={rows.map((r) => ({ id: r.id, youtubeId: r.youtubeId, title: r.title, type: r.type, orientation: r.orientation, featured: r.featured, published: r.published, pages: r.pages.length }))} />;
}
