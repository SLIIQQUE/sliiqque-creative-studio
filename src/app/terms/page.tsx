import { pageMeta } from "@/lib/seo";
import LegalPage from "@/components/LegalPage";
import { LEGAL } from "@/lib/data";

export const metadata = pageMeta({
  title: "Terms & Conditions",
  description:
    "Terms for using the SLIIQQUE website and engaging SLIIQQUE for AI commercials, UGC, photography and launches: fees, payment, ownership, liability.",
  path: "/terms",
});

export default function Page() {
  return <LegalPage doc={LEGAL.terms} />;
}
