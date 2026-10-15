"use client";

import { track } from "@vercel/analytics";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/data";
import { IconWhatsApp } from "./icons";

/** Persistent WhatsApp entry point, on every page except Contact (which already covers it). */
export default function FloatingActions() {
  const pathname = usePathname();
  if (pathname === "/contact") return null;

  const digits = SITE.phone.replace(/[^\d]/g, "");
  const wa = `https://wa.me/${digits}?text=${encodeURIComponent("Hi SLIIQQUE, I'd like to start a project.")}`;

  return (
    <a className="fab fab--whatsapp" href={wa} target="_blank" rel="noopener noreferrer" aria-label="Chat with SLIIQQUE on WhatsApp" onClick={() => track("whatsapp_click", { placement: "fab" })}>
      <IconWhatsApp />
    </a>
  );
}
