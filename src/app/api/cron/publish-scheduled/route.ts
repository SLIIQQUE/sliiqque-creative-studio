import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { runDueSchedule } from "@/lib/cms/post-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = request.headers.get("authorization") ?? "";
  const want = `Bearer ${secret}`;
  return given.length === want.length && timingSafeEqual(Buffer.from(given), Buffer.from(want));
}

// Vercel Cron calls this with "Authorization: Bearer $CRON_SECRET". It publishes scheduled posts that have come due.
export async function GET(request: Request) {
  if (!authorised(request)) return new NextResponse("Unauthorized", { status: 401 });
  const result = await runDueSchedule();
  return NextResponse.json(result);
}
