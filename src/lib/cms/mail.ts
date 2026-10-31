import "server-only";
import { Resend } from "resend";

/**
 * Sends the sign-in link. In development the link is also printed to the server console, and a failed send (for example
 * Resend's sandbox only delivers to the account owner's own address) falls back to the console instead of blocking sign-in.
 * In production a failed send throws.
 */
export async function sendSignInLink(to: string, link: string): Promise<void> {
  const dev = process.env.NODE_ENV !== "production";
  const print = () => console.info(`\n[admin sign-in link for ${to}]\n${link}\n`);
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (!dev) throw new Error("RESEND_API_KEY is not set, cannot send sign-in links.");
    return print();
  }
  if (dev) print();
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM || "SLIIQQUE Studio admin <onboarding@resend.dev>",
      to,
      subject: "Your SLIIQQUE Studio admin sign-in link",
      text: `Use this link to sign in. It works once and expires in 15 minutes.\n\n${link}\n\nIf you did not ask for this, ignore this email.`,
    });
    if (error) throw new Error(`Could not send sign-in email: ${error.message}`);
  } catch (error) {
    if (!dev) throw error;
    console.warn("Sign-in email was not sent (development), use the link printed above:", error instanceof Error ? error.message.slice(0, 160) : error);
  }
}
