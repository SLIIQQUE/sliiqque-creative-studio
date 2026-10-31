"use server";

import { redirect } from "next/navigation";
import { consumeSignInLink, requestSignInLink } from "@/lib/cms/session";

export type LoginState = { sent?: boolean; error?: string } | undefined;

export async function requestLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  try {
    await requestSignInLink(email);
  } catch (error) {
    console.error("sign-in link failed", error);
    return { error: "We could not send the link. Try again in a moment." };
  }
  // Same answer whether or not the address has an account.
  return { sent: true };
}

export async function verifyLink(formData: FormData): Promise<void> {
  const ok = await consumeSignInLink(String(formData.get("token") ?? ""));
  if (!ok) redirect("/admin/login?expired=1");
  redirect("/admin");
}
