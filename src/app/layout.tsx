import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { BRAND_DESC, FEED_PATH, KEYWORDS, ORG_ID, SITE_NAME, SITE_URL } from "@/lib/seo";
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
  alternates: { canonical: SITE_URL, languages: { "en-NG": SITE_URL, "x-default": SITE_URL }, types: { "application/rss+xml": FEED_PATH } },
  formatDetection: { telephone: true, email: true, address: false },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  // Bing Webmaster Tools site ownership verification.
  // Google Search Console: set GOOGLE_SITE_VERIFICATION in Vercel env to the token from the HTML tag method.
  verification: { ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}), other: { "msvalidate.01": "872930D99381693004A6F51EC748030C" } },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_NG", url: SITE_URL, title: `${SITE_NAME} | Premium Creative Studio Powered by AI`, description: BRAND_DESC },
  twitter: { card: "summary_large_image", title: `${SITE_NAME} | Premium Creative Studio Powered by AI`, description: BRAND_DESC },
  other: { "geo.region": "NG-LA", "geo.placename": "Lagos", "geo.position": "6.5244;3.3792", ICBM: "6.5244, 3.3792", "organization-id": ORG_ID },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={`${syne.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
