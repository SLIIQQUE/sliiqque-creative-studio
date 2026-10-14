import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, pageMeta, shareImg } from "@/lib/seo";
import LegalPage from "@/components/LegalPage";
import { LEGAL } from "@/lib/data";

export const metadata = pageMeta({
  title: "Terms & Conditions",
  description:
    "Terms for using the SLIIQQUE website and engaging SLIIQQUE for AI commercials, UGC, photography and launches: fees, payment, ownership, liability.",
  path: "/terms",
  image: { url: shareImg("studio-ai-review-monitor.webp"), alt: "SLIIQQUE Studio reviewing AI-generated production stills" },
});

const BREADCRUMB = [{ name: "Home", path: "/" }, { name: "Terms & Conditions", path: "/terms" }];

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbSchema(BREADCRUMB)} />
      <LegalPage doc={LEGAL.terms} breadcrumb={BREADCRUMB} />
    </>
  );
}
