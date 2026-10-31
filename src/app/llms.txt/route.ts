import { getFeedItems } from "@/lib/journal";
import { llmsTxt } from "@/lib/llms";

export const dynamic = "force-static";

export async function GET() {
  return new Response(llmsTxt(await getFeedItems()), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
