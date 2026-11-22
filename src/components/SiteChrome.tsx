import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import SectionRail from "@/components/SectionRail";
import AttributionCapture from "@/components/AttributionCapture";
import CursorTag from "@/components/CursorTag";
import JsonLd from "@/components/JsonLd";
import AnalyticsConsent from "@/components/AnalyticsConsent";
import { Analytics } from "@vercel/analytics/next";
import NoticeBar from "@/components/NoticeBar";
import { getNotice } from "@/lib/notice";
import { organizationSchema, websiteSchema } from "@/lib/seo";

/** The public site's chrome. Used by (site)/layout.tsx and the global 404, never by /admin. */
export default async function SiteChrome({ children }: { children: React.ReactNode }) {
  const notice = await getNotice();
  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema()]} />
      <Nav>{notice ? <NoticeBar notice={notice} /> : null}</Nav>
      <main id="main">{children}</main>
      <Footer />
      <SectionRail />
      <FloatingActions />
      <CursorTag />
      <Analytics />
      <AnalyticsConsent />
      <AttributionCapture />
    </>
  );
}
