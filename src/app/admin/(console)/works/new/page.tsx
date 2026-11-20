import { requireUser } from "@/lib/cms/dal";
import { listMedia } from "@/lib/cms/queries";
import { SERVICE_PAGES } from "@/data/services";
import WorkForm from "../WorkForm";

export default async function NewWorkPage() {
  await requireUser();
  const library = (await listMedia(200)).map((m) => ({ id: m.id, url: m.url, alt: m.alt }));
  return <WorkForm library={library} services={SERVICE_PAGES.map((s) => ({ slug: s.slug, name: s.name }))} />;
}
