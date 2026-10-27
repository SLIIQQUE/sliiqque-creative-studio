import { SITE } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

/**
 * HTML email builders for /api/contact notifications. Mirrors the site's own design system
 * (Brand Book v1.1): the ink/orange/gradient palette, the stacked "SLIIQQUE / STUDIO" wordmark,
 * and the same label-over-value "meta row" pattern used for case studies and journal posts
 * (src/app/site.css, "Floating actions"/"case study + blog post" sections).
 *
 * Email clients don't run a stylesheet reliably, so every rule here is inlined and the layout is
 * table-based (Outlook's Word engine ignores modern CSS and div-based sizing). Syne/DM Sans are
 * linked as a progressive enhancement; the fallback stack is a bold system sans so the design
 * still reads correctly when a client blocks the web font.
 */

// Exact values from src/app/site.css :root — not approximated Tailwind grays.
const INK = "#050505"; // --ink / --ink-2
const TEXT = "#6B7280"; // --text / --text-2
const MUTED = "#9CA3AF"; // --text-muted
const LINE = "#e6e6e6"; // --line: rgba(0,0,0,.10) flattened on white
const TINT = "#f5f5f5"; // --surface-tint: rgba(0,0,0,.04) flattened on white
const ACCENT = "#f97316"; // --accent
const FOOTER_BG = "#f0f0f0"; // --footer-bg
// The exact top-of-page scroll-progress gradient (site.css .scroll-progress), not the --gradient token.
const GRADIENT = "linear-gradient(to right, #f97316, #3b82f6, #a855f7)";
// Web fonts rarely survive webmail clients (Gmail strips <link> entirely); "Arial Black" as a
// fallback renders far heavier than Syne 800 ever does on the real site, which read as oversized.
// A plain bold system sans tracks much closer to Syne's actual visual weight.
const DISPLAY_FONT = "'Syne', Helvetica, Arial, sans-serif";
const BODY_FONT = "'DM Sans', Helvetica, Arial, sans-serif";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

const nl2br = (s: string) => escapeHtml(s).replace(/\n/g, "<br>");

/** One label/value row, styled like the site's case-study and journal "meta" rows. */
function fieldRow(label: string, value: string, isLast = false) {
  return `
  <tr>
    <td style="padding:13px 0;${isLast ? "" : `border-bottom:1px solid ${LINE};`}">
      <div style="font-family:${BODY_FONT};font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${INK};">${escapeHtml(label)}</div>
      <div style="margin-top:4px;font-family:${BODY_FONT};font-size:14px;line-height:1.5;color:${TEXT};">${value}</div>
    </td>
  </tr>`;
}

/** The message field gets the site's "short answer" callout treatment: an orange-bordered block. */
function messageRow(message: string, isLast = true) {
  return `
  <tr>
    <td style="padding:13px 0;${isLast ? "" : `border-bottom:1px solid ${LINE};`}">
      <div style="font-family:${BODY_FONT};font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${INK};">Message</div>
      <div style="margin-top:8px;padding:12px 14px;background-color:${TINT};border-left:3px solid ${ACCENT};font-family:${BODY_FONT};font-size:14px;line-height:1.6;color:${TEXT};">${nl2br(message)}</div>
    </td>
  </tr>`;
}

function ctaButton(href: string, label: string) {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px auto 0;">
    <tr>
      <td style="border-radius:999px;background-color:${ACCENT};" bgcolor="${ACCENT}">
        <a href="${href}" style="display:inline-block;padding:11px 28px;font-family:${BODY_FONT};font-size:12px;font-weight:700;letter-spacing:.04em;color:#ffffff;text-decoration:none;border-radius:999px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

function eyebrow(label: string) {
  return `<span style="display:inline-block;padding:4px 12px;background-color:${ACCENT};color:#ffffff;font-family:${BODY_FONT};font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border-radius:999px;">${escapeHtml(label)}</span>`;
}

/** Shared chrome: gradient bar, dark wordmark header, white content card, light footer band. */
function shell({ eyebrowLabel, heading, bodyHtml, preheader }: { eyebrowLabel: string; heading: string; bodyHtml: string; preheader: string }) {
  const social = SITE.social
    .map(([label, url]) => `<a href="${url}" style="color:${MUTED};text-decoration:underline;">${escapeHtml(label)}</a>`)
    .join(" &nbsp;&middot;&nbsp; ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${escapeHtml(heading)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
<!--[if mso]>
<style>table,td,div,p,a{font-family:Arial,Helvetica,sans-serif !important;}</style>
<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#ffffff;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:560px;background-color:#ffffff;">

          <!-- the site's own scroll-progress gradient, exact colors -->
          <tr>
            <td height="4" style="height:4px;line-height:4px;font-size:0;background-color:${ACCENT};background-image:${GRADIENT};">&nbsp;</td>
          </tr>

          <!-- dark header: the hero wordmark, stacked -->
          <tr>
            <td style="padding:26px 28px 22px;background-color:${INK};" bgcolor="${INK}">
              <img src="${SITE_URL}/brand/sliiqque-icon-white.png" width="44" alt="SLIIQQUE" style="display:block;width:44px;height:auto;margin:0 0 14px;border:0;" />
              <div style="font-family:${DISPLAY_FONT};font-weight:700;font-size:20px;line-height:1.15;letter-spacing:-.3px;text-transform:uppercase;color:#ffffff;">SLIIQQUE<br />STUDIO</div>
              <div style="margin-top:8px;font-family:${BODY_FONT};font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:${MUTED};">Premium creative studio powered by AI</div>
            </td>
          </tr>

          <!-- body -->
          <tr>
            <td style="padding:26px 28px 4px;">
              ${eyebrow(eyebrowLabel)}
              <h1 style="margin:12px 0 0;font-family:${DISPLAY_FONT};font-weight:700;font-size:18px;line-height:1.3;letter-spacing:0;color:${INK};">${escapeHtml(heading)}</h1>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;">
                ${bodyHtml}
              </table>
            </td>
          </tr>

          <!-- footer -->
          <tr>
            <td style="padding:22px 28px;background-color:${FOOTER_BG};" bgcolor="${FOOTER_BG}">
              <div style="font-family:${BODY_FONT};font-size:11px;line-height:1.7;color:${TEXT};text-align:center;">
                <strong style="color:${INK};">SLIIQQUE Studio</strong> &middot; Lagos, Nigeria<br />
                ${social}<br />
                <span style="color:${MUTED};">Sent automatically from <a href="${SITE_URL}" style="color:${MUTED};">${SITE_URL.replace("https://", "")}</a></span>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export type ContactFields = { name?: string; email: string; phone?: string; type?: string; budget?: string; message?: string; source?: string };

export function contactInquiryEmail(f: ContactFields): { subject: string; html: string; text: string } {
  const name = f.name?.trim() || "there";
  const firstName = name.split(/\s+/)[0];
  const submittedAt = new Date().toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" });

  const rows = [
    fieldRow("Name", escapeHtml(f.name || "—")),
    fieldRow("Email", `<a href="mailto:${encodeURIComponent(f.email)}" style="color:${ACCENT};font-weight:700;text-decoration:none;">${escapeHtml(f.email)}</a>`),
    fieldRow("Phone", escapeHtml(f.phone || "—")),
    fieldRow("Project type", escapeHtml(f.type || "—")),
    fieldRow("Budget range", escapeHtml(f.budget || "-"), !f.message && !f.source),
    ...(f.source ? [fieldRow("Came from", escapeHtml(f.source), !f.message)] : []),
  ].join("");
  const body = f.message ? rows + messageRow(f.message) : rows;

  const html = shell({
    preheader: `${name} wants to start a project${f.type ? ` — ${f.type}` : ""}.`,
    eyebrowLabel: "New project inquiry",
    heading: `${firstName} just reached out.`,
    bodyHtml:
      body +
      `<tr><td style="padding-top:2px;">${ctaButton(`mailto:${encodeURIComponent(f.email)}?subject=${encodeURIComponent("Re: your project with SLIIQQUE")}`, `Reply to ${firstName}`)}</td></tr>` +
      `<tr><td style="padding-top:14px;text-align:center;font-family:${BODY_FONT};font-size:11px;color:${MUTED};">Submitted via studio.sliiqque.space/contact &middot; ${submittedAt} WAT</td></tr>`,
  });

  const text = [
    `New project inquiry — ${name}`,
    `Email: ${f.email}`,
    `Phone: ${f.phone || "—"}`,
    `Project type: ${f.type || "—"}`,
    `Budget range: ${f.budget || "—"}`,
    f.source ? `Came from: ${f.source}` : "",
    f.message ? `Message: ${f.message}` : "",
    "",
    `Submitted via studio.sliiqque.space/contact · ${submittedAt} WAT`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject: `New project inquiry from ${name}`, html, text };
}

export function newsletterSignupEmail(email: string, source = ""): { subject: string; html: string; text: string } {
  const submittedAt = new Date().toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" });

  const html = shell({
    preheader: `${email} just subscribed to the SLIIQQUE journal.`,
    eyebrowLabel: "New journal subscriber",
    heading: "Someone just joined the list.",
    bodyHtml:
      fieldRow("Email", `<a href="mailto:${encodeURIComponent(email)}" style="color:${ACCENT};font-weight:700;text-decoration:none;">${escapeHtml(email)}</a>`, !source) +
      (source ? fieldRow("Came from", escapeHtml(source), true) : "") +
      `<tr><td style="padding-top:12px;font-family:${BODY_FONT};font-size:12px;line-height:1.6;color:${MUTED};font-style:italic;">No mailing list is wired up yet — this is a raw notification. Add this address wherever you send journal updates from.</td></tr>` +
      `<tr><td style="padding-top:14px;text-align:center;font-family:${BODY_FONT};font-size:11px;color:${MUTED};">Submitted via studio.sliiqque.space &middot; ${submittedAt} WAT</td></tr>`,
  });

  const text = `New journal subscriber: ${email}\n\nNo mailing list is wired up yet — add this address wherever you send journal updates from.\n\nSubmitted via studio.sliiqque.space · ${submittedAt} WAT`;

  return { subject: `Journal sign-up: ${email}`, html, text };
}
