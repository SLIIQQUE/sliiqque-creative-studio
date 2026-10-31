import { NextResponse, type NextRequest } from "next/server";

/**
 * Admin guard and Content Security Policy.
 *
 * The cookie check is optimistic only: a cookie must exist. Real session and role checks happen in
 * src/lib/cms/dal.ts, inside every page, server action and route handler
 * (see node_modules/next/dist/docs/01-app/02-guides/authentication.md).
 *
 * The CSP uses a per-request nonce (node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md).
 * Admin pages are always rendered per request, so nonces work. The public site is static and is not touched.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login" || pathname.startsWith("/admin/login/");
  if (!isLogin && !request.cookies.get("studio_session")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const dev = process.env.NODE_ENV === "development";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}'`,
    // Inline style attributes in the admin UI and the editor. Attributes only, scripts stay locked down.
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' blob: data: https://*.public.blob.vercel-storage.com https://i.ytimg.com",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src https://www.youtube-nocookie.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
