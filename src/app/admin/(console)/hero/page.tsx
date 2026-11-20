import { requireUser } from "@/lib/cms/dal";
import { listMedia } from "@/lib/cms/queries";
import { builtInFrames, frameHref, frameLabel, listHeroRows } from "@/lib/hero";
import HeroManager from "./HeroManager";

export default async function HeroPage() {
  await requireUser();
  const [rows, library] = await Promise.all([listHeroRows(), listMedia(200)]);
  const frames = rows.map((r) => ({ id: r.id, url: r.url, alt: r.alt, label: r.label ?? "", href: r.href ?? "", autoLabel: frameLabel(r.url), autoHref: frameHref(r.url) }));
  return (
    <HeroManager
      frames={frames}
      usingBuiltIn={rows.length === 0}
      builtInCount={builtInFrames().length}
      library={library.map((m) => ({ id: m.id, url: m.url, alt: m.alt }))}
    />
  );
}
