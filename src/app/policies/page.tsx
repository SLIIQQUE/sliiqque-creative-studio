import { pageMeta } from "@/lib/seo";
import LegalPage from "@/components/LegalPage";
import { LEGAL } from "@/lib/data";

export const metadata = pageMeta({
  title: "Studio Policies and Usage Rights",
  description:
    "SLIIQQUE's policies: revision rounds, turnaround, retainer billing, add-ons, usage rights, AI disclosure, digital human consent and complaints.",
  path: "/policies",
});

export default function Page() {
  return <LegalPage doc={LEGAL.policies} />;
}
