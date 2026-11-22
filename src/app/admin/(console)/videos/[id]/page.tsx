import { notFound } from "next/navigation";
import { requireUser } from "@/lib/cms/dal";
import { isoToClock } from "@/lib/video-utils";
import { listVideoRows } from "@/lib/videos";
import VideoForm from "../VideoForm";
import { pageOptions } from "../options";

export default async function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const row = (await listVideoRows()).find((r) => r.id === id);
  if (!row) notFound();
  const { services, works } = await pageOptions();
  return (
    <VideoForm
      services={services}
      works={works}
      initial={{ id: row.id, youtubeId: row.youtubeId, title: row.title, description: row.description, type: row.type, orientation: row.orientation === "portrait" ? "portrait" : "landscape", duration: isoToClock(row.duration), uploadDate: row.uploadDate, pages: row.pages, featured: row.featured, published: row.published }}
    />
  );
}
