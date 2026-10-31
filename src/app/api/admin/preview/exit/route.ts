import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  (await draftMode()).disable();
  const back = new URL(request.url).searchParams.get("to") ?? "/admin/posts";
  // Only same-site relative paths, so this cannot be used as an open redirect.
  return NextResponse.redirect(new URL(back.startsWith("/") && !back.startsWith("//") ? back : "/admin/posts", request.url));
}
