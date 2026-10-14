import { Resend } from "resend";
import { SITE } from "@/lib/data";

export const runtime = "nodejs";

type Payload = {
  kind: "contact" | "newsletter";
  hp?: string;
  name?: string;
  email?: string;
  phone?: string;
  type?: string;
  budget?: string;
  message?: string;
};

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real visitors never fill this hidden field, so a filled one is a bot.
  // Respond as if it worked, without sending anything, so the bot gets no signal.
  if (body.hp) return Response.json({ ok: true });

  const email = (body.email ?? "").trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: false, error: "A valid email address is required." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set; contact form submission was not sent.", { kind: body.kind, email });
    return Response.json({ ok: false, error: "The contact form is not yet configured. Please email us directly." }, { status: 503 });
  }

  const resend = new Resend(apiKey);
  const isNewsletter = body.kind === "newsletter";
  const subject = isNewsletter ? `Journal sign-up: ${email}` : `New project inquiry from ${body.name || email}`;
  const rows = isNewsletter
    ? [["Email", email]]
    : [
        ["Name", body.name || "—"],
        ["Email", email],
        ["Phone", body.phone || "—"],
        ["Project type", body.type || "—"],
        ["Budget range", body.budget || "—"],
        ["Message", body.message || "—"],
      ];
  const html = `<table>${rows.map(([k, v]) => `<tr><td><strong>${escape(k)}</strong></td><td>${escape(v).replace(/\n/g, "<br>")}</td></tr>`).join("")}</table>`;

  try {
    await resend.emails.send({
      // Must be a verified sending domain in Resend (or the shared onboarding@resend.dev sandbox
      // address, which only delivers to the Resend account's own email, while testing).
      from: process.env.RESEND_FROM || "SLIIQQUE Studio site <onboarding@resend.dev>",
      to: SITE.email,
      replyTo: email,
      subject,
      html,
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Resend send failed:", err);
    return Response.json({ ok: false, error: "Something went wrong sending your message. Please email us directly." }, { status: 502 });
  }
}
