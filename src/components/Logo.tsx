import Image from "next/image";

/** SLIIQQUE wordmark: Syne 800, uppercase, 0.05em tracking (Brand Book §8). */
const font = { fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800 } as const;

/** Top bar: the SLIIQQUE app-tile logo (black rounded tile, white double-Q, blue accent), the same mark as the favicon and the other SLIIQQUE sites. */
export function LogoNav() {
  return <Image src="/brand/sliiqque-logo.png" width={192} height={192} alt="SLIIQQUE Creative Studio" priority />;
}

export function LogoFooter() {
  return (
    <svg viewBox="0 0 1320 112" role="img" aria-label="SLIIQQUE Studio" xmlns="http://www.w3.org/2000/svg">
      {/* Open above (round tops overshoot the footer edge), cut 12 units below the baseline as before (short Q tails). */}
      <clipPath id="footer-wordmark-clip"><rect x="0" y="-40" width="1320" height="152" /></clipPath>
      <text x="0" y="100" style={font} fontSize="158" letterSpacing="0.05em" fill="#050505" clipPath="url(#footer-wordmark-clip)">SLIIQQUE</text>
    </svg>
  );
}
