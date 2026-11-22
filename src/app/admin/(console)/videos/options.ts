import { SERVICE_PAGES } from "@/data/services";
import { getWorkEntries } from "@/lib/works";

/** Pages a film can be attached to in the editor. */
export async function pageOptions() {
  return {
    services: SERVICE_PAGES.map((s) => ({ path: `/services/${s.slug}`, label: s.name })),
    works: (await getWorkEntries()).map((w) => ({ path: `/works/${w.slug}`, label: w.name })),
  };
}
