import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, pageMeta, shareImg } from "@/lib/seo";
import LegalPage from "@/components/LegalPage";
import { LEGAL } from "@/lib/data";

export const metadata = pageMeta({
  title: "Studio Policies and Usage Rights",
  description:
    "SLIIQQUE's policies: revision rounds, turnaround, retainer billing, add-ons, usage rights, AI disclosure, digital human consent and complaints.",
  path: "/policies",
  image: { url: shareImg("studio-process-flatlay-mosaic.webp"), alt: "SLIIQQUE Studio production flatlay: AI product stills, portrait and storyboard contact sheet" },
});

const BREADCRUMB = [{ name: "Home", path: "/" }, { name: "Studio Policies", path: "/policies" }];

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(BREADCRUMB)} />
      <LegalPage doc={LEGAL.policies} breadcrumb={BREADCRUMB} />
    </>
  );
}
