import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { loginTokens, sessions, users } from "@/db/schema";
import type { Role } from "./types";
import { audit } from "./audit";
import { sendSignInLink } from "./mail";
import { allow, clientKey, newToken, sha256 } from "./security";

export const SESSION_COOKIE = "studio_session";
const SESSION_DAYS = 7;
const LINK_MINUTES = 15;
const TOUCH_MS = 10 * 60 * 1000;

export type SessionUser = { id: string; email: string; name: string; role: Role; title: string | null };

/** Base URL for sign-in links. Falls back to the request origin in development. */
async function origin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Starts sign-in. Always resolves the same way whether or not the email is allowed, so the form cannot be used
 * to discover which addresses have accounts.
 */
export async function requestSignInLink(emailRaw: string): Promise<void> {
  const email = emailRaw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) return;
  const h = await headers();
  const ipOk = await allow(`signin-ip:${clientKey(h)}`, 20, 3600);
  const emailOk = await allow(`signin-email:${email}`, 5, 3600);
  if (!ipOk || !emailOk) return;

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || user.disabled) return;

  const token = newToken();
  await db.insert(loginTokens).values({ userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + LINK_MINUTES * 60_000) });
  const link = `${await origin()}/admin/login/verify?token=${token}`;
  await sendSignInLink(user.email, link);
}

/** Consumes a one-time link and starts a session. Returns false for a bad, used or expired link. */
export async function consumeSignInLink(token: string): Promise<boolean> {
  if (!token || token.length > 128) return false;
  const h = await headers();
  if (!(await allow(`verify-ip:${clientKey(h)}`, 30, 3600))) return false;

  const [used] = await db
    .update(loginTokens)
    .set({ usedAt: new Date() })
    .where(and(eq(loginTokens.tokenHash, sha256(token)), isNull(loginTokens.usedAt), gt(loginTokens.expiresAt, new Date())))
    .returning({ userId: loginTokens.userId });
  if (!used) return false;

  const [user] = await db.select().from(users).where(eq(users.id, used.userId)).limit(1);
  if (!user || user.disabled) return false;

  const sessionToken = newToken();
  await db.insert(sessions).values({
    userId: user.id,
    tokenHash: sha256(sessionToken),
    expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000),
    userAgent: (h.get("user-agent") ?? "").slice(0, 255),
  });
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  (await cookies()).set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
  await audit({ id: user.id, email: user.email }, "sign-in", "session");
  return true;
}

/** The current user, or null. Cached per request. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return null;
  const rows = await db
    .select({ s: sessions, u: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, sha256(value)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  const row = rows[0];
  if (!row || row.u.disabled) return null;
  // Sliding renewal, written at most every ten minutes.
  if (Date.now() - row.s.lastSeenAt.getTime() > TOUCH_MS) {
    await db
      .update(sessions)
      .set({ lastSeenAt: new Date(), expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000) })
      .where(eq(sessions.id, row.s.id));
  }
  return { id: row.u.id, email: row.u.email, name: row.u.name, role: row.u.role, title: row.u.title };
});

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const value = jar.get(SESSION_COOKIE)?.value;
  if (value) await db.delete(sessions).where(eq(sessions.tokenHash, sha256(value)));
  jar.delete(SESSION_COOKIE);
}

export async function endAllSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}
