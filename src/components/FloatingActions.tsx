"use client";

import { track } from "@vercel/analytics";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/data";
import { IconWhatsApp } from "./icons";

/** Persistent WhatsApp entry point (every page) plus a mobile sticky CTA bar, since the nav's
 *  "Start a project" button is hidden below the mobile breakpoint until the menu is opened. */
export default function FloatingActions() {
  const pathname = usePathname();
  if (pathname === "/contact") return null;

  const digits = SITE.phone.replace(/[^\d]/g, "");
  const wa = `https://wa.me/${digits}?text=${encodeURIComponent("Hi SLIIQQUE, I'd like to start a project.")}`;

  return (
    <div className="floating-actions">
      <a className="fab fab--whatsapp" href={wa} target="_blank" rel="noopener noreferrer" aria-label="Chat with SLIIQQUE on WhatsApp" onClick={() => track("whatsapp_click", { placement: "fab" })}>
        <IconWhatsApp />
      </a>
      <div className="mobile-cta-bar">
        <a className="btn btn--outline btn--block" href={wa} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_click", { placement: "mobile_cta_bar" })}>WhatsApp</a>
        <a className="btn btn--block" href="/contact" onClick={() => track("start_project_click", { placement: "mobile_cta_bar" })}>Start a project</a>
      </div>
    </div>
  );
}
