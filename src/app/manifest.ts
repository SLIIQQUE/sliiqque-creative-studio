import type { MetadataRoute } from "next";
import { BRAND_DESC, SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} | Premium Creative Studio Powered by AI`,
    short_name: SITE_NAME,
    description: BRAND_DESC,
    start_url: "/",
    display: "standalone",
    background_color: "#030303",
    theme_color: "#FFFFFF",
    icons: [
      { src: "/icon.png", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon.png", sizes: "192x192", type: "image/png" },
    ],
  };
}
