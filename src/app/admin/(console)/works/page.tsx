import { requireUser } from "@/lib/cms/dal";
import { builtInWorks, listWorkRows } from "@/lib/works";
import WorksManager from "./WorksManager";

export default async function WorksPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireUser();
  const { saved } = await searchParams;
  const rows = await listWorkRows();
  return (
    <WorksManager
      saved={saved === "1"}
      builtInCount={builtInWorks().length}
      works={rows.map((r) => ({ id: r.id, slug: r.slug, name: r.name, category: r.category, year: r.year, published: r.published, imageUrl: r.card?.url ?? null }))}
    />
  );
}
