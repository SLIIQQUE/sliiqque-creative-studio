import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";
import LegalPage from "@/components/LegalPage";
import { LEGAL } from "@/lib/data";

export const metadata = pageMeta({
  title: "Privacy Policy",
  description:
    "How SLIIQQUE collects, uses and protects personal data under the Nigeria Data Protection Act 2023 and GDPR, including AI tools and your rights.",
  path: "/privacy",
});

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Privacy Policy", path: "/privacy" }])} />
      <LegalPage doc={LEGAL.privacy} />
    </>
  );
}
