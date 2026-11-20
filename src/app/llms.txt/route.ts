import { getFeedItems } from "@/lib/journal";
import { llmsTxt } from "@/lib/llms";
import { getWorkEntries } from "@/lib/works";

export const dynamic = "force-static";

export async function GET() {
  return new Response(llmsTxt(await getFeedItems(), await getWorkEntries()), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
