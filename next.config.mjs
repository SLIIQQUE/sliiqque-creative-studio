/** @type {import('next').NextConfig} */
const nextConfig = {
  // AVIF first, WebP fallback, for every image the optimizer serves through Img.tsx.
  images: {
    qualities: [90],
    formats: ["image/avif", "image/webp"],
    // Journal uploads live in Vercel Blob in production.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  // Vercel redirects HTTP to HTTPS at the edge; this tells browsers to skip that round
  // trip on repeat visits and never downgrade to plain HTTP for this host.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // The site never needs to be framed by another origin.
          { key: "X-Frame-Options", value: "DENY" },
          // Stop browsers from guessing a response's MIME type from its content.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Send the full referrer only to same-origin requests; a trimmed origin elsewhere.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // No page here uses camera, microphone, geolocation, or payment APIs.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
        ],
      },
      // Logo files never change in place (a redesign gets a new filename), so these can be cached hard.
      {
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // Photography is occasionally replaced at the same filename, so a week-long cache (not
      // immutable) balances repeat-visit speed against that history without baking in staleness.
      {
        source: "/(img|og)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};
export default nextConfig;
