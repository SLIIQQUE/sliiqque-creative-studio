import "server-only";
import { redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "./session";
import type { Role } from "./types";

/** For pages: redirects to sign-in when there is no valid session. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  return user;
}

export class Forbidden extends Error {
  constructor(message = "Not allowed") {
    super(message);
  }
}

/**
 * For server actions and route handlers: throws instead of redirecting, and checks the role every time.
 * The proxy only does an optimistic cookie check, so this is the real control.
 */
export async function authorize(roles: Role[] = ["owner", "editor"]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Forbidden("Not signed in");
  if (!roles.includes(user.role)) throw new Forbidden("Your role cannot do this");
  return user;
}

/** For pages restricted to the owner. */
export async function requireOwner(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "owner") redirect("/admin");
  return user;
}
