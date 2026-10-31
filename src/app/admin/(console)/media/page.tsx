import { requireUser } from "@/lib/cms/dal";
import { listMedia, mediaUsage } from "@/lib/cms/queries";
import MediaManager from "./MediaManager";

export default async function MediaPage() {
  await requireUser();
  const rows = await listMedia(120);
  const items = await Promise.all(
    rows.map(async (m) => ({ id: m.id, url: m.url, alt: m.alt, caption: m.caption, width: m.width, height: m.height, bytes: m.bytes, usedIn: (await mediaUsage(m.id)).map((p) => p.title) })),
  );
  return <MediaManager items={items} />;
}
