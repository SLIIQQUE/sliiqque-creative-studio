"use client";

import { track } from "@vercel/analytics";

/** Plain share links (no third-party scripts): WhatsApp first, because that is where Lagos brand decisions get forwarded. */
export default function ShareLinks({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links: [string, string][] = [
    ["WhatsApp", `https://wa.me/?text=${t}%20${u}`],
    ["LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${u}`],
    ["X", `https://twitter.com/intent/tweet?text=${t}&url=${u}`],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${u}`],
  ];
  return (
    <div className="share">
      <span className="share__label">Share this note</span>
      {links.map(([name, href]) => (
        <a key={name} className="share__link" href={href} target="_blank" rel="noopener noreferrer" onClick={() => track("share_click", { network: name.toLowerCase() })}>{name}</a>
      ))}
    </div>
  );
}
