import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { DM_Sans, Syne } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import JsonLd from "@/components/JsonLd";
import { BRAND_DESC, KEYWORDS, ORG_ID, SITE_NAME, SITE_URL, organizationSchema, websiteSchema } from "@/lib/seo";
import "./fonts.css";
import "./site.css";

/** SLIIQQUE brand system (Brand Book v1.1 §4): Syne for display/headings, DM Sans for body/UI. */
const syne = Syne({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-syne", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-dm-sans", display: "swap" });

export const viewport: Viewport = { themeColor: "#FFFFFF", width: "device-width", initialScale: 1 };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | Premium Creative Studio Powered by AI`, template: `%s | ${SITE_NAME}` },
  description: BRAND_DESC,
  applicationName: SITE_NAME,
  keywords: KEYWORDS,
  authors: [{ name: "Gabriel Njoabozia" }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Creative studio",
  alternates: { canonical: SITE_URL },
  formatDetection: { telephone: true, email: true, address: false },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_NG", url: SITE_URL, title: `${SITE_NAME} | Premium Creative Studio Powered by AI`, description: BRAND_DESC },
  twitter: { card: "summary_large_image", title: `${SITE_NAME} | Premium Creative Studio Powered by AI`, description: BRAND_DESC },
  other: { "geo.region": "NG-LA", "geo.placename": "Lagos", "geo.position": "6.5244;3.3792", ICBM: "6.5244, 3.3792", "organization-id": ORG_ID },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={`${syne.variable} ${dmSans.variable}`}>
      <body>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <FloatingActions />
        <Analytics />
      </body>
    </html>
  );
}
