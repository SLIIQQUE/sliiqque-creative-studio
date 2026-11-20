import { notFound } from "next/navigation";
import { requireUser } from "@/lib/cms/dal";
import { listMedia } from "@/lib/cms/queries";
import { SERVICE_PAGES } from "@/data/services";
import { listWorkRows } from "@/lib/works";
import WorkForm, { type WorkValues } from "../WorkForm";

export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const library = (await listMedia(200)).map((m) => ({ id: m.id, url: m.url, alt: m.alt }));
  const services = SERVICE_PAGES.map((s) => ({ slug: s.slug, name: s.name }));

  let initial: WorkValues | undefined;
  {
    const row = (await listWorkRows()).find((r) => r.id === id);
    if (!row) notFound();
    initial = {
      id: row.id, slug: row.slug, name: row.name, category: row.category, service: row.service, year: row.year,
      overview: row.overview, challenge: row.challenge, results: row.results, conclusion: row.conclusion,
      card: row.card, wide: row.wide, duo: row.duo, serviceSlugs: row.serviceSlugs, ageGate: row.ageGate, published: row.published,
    };
  }
  return <WorkForm initial={initial} library={library} services={services} />;
}
