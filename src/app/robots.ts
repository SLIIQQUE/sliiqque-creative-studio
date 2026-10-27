import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Search and AI crawlers are welcome: the goal is to be found and cited.
const AI_BOTS = ["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot", "DuckAssistBot", "Meta-ExternalAgent", "Amazonbot", "cohere-ai", "YouBot", "Bytespider", "Diffbot", "Timpibot", "omgili", "FacebookBot", "LinkedInBot"];

export default function robots(): MetadataRoute.Robots {
  return {
    // The contact form endpoint is not a page; keep every crawler out of it.
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }, ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: "/api/" }))],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
