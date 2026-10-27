"use client";

import { track } from "@vercel/analytics";
import type { ReactNode } from "react";

/** External link that records an `outbound_click` event (network or host, plus where it was clicked), so web to social traffic is measurable. */
export default function OutLink({ href, network, placement, className, children }: { href: string; network?: string; placement: string; className?: string; children: ReactNode }) {
  const host = (() => { try { return new URL(href).hostname.replace(/^www\./, ""); } catch { return "unknown"; } })();
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer" onClick={() => track("outbound_click", { network: network ?? host, placement })}>
      {children}
    </a>
  );
}
