import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { posts } from "@/db/schema";
import { getSessionUser } from "@/lib/cms/session";

// Turns on Next.js draft mode (a signed, httpOnly bypass cookie) for the signed-in editor only, then opens the post.
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse("Bad request", { status: 400 });
  const [post] = await db.select({ slug: posts.slug }).from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) return new NextResponse("Not found", { status: 404 });
  (await draftMode()).enable();
  return NextResponse.redirect(new URL(`/blogs/${post.slug}`, request.url));
}
