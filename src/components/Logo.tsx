import Image from "next/image";

/** SLIIQQUE wordmark: Syne 800, uppercase, 0.05em tracking (Brand Book §8). */
const font = { fontFamily: "var(--font-syne), Syne, sans-serif", fontWeight: 800 } as const;

/** Top bar: the SLIIQQUE icon mark (double-Q with blue square), 24px tall like the template's logo slot. */
export function LogoNav() {
  return <Image src="/brand/sliiqque-mark.png" width={374} height={232} alt="SLIIQQUE Creative Studio" priority />;
}

export function LogoFooter() {
  return (
    <svg viewBox="0 0 1320 130" role="img" aria-label="SLIIQQUE Studio" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="118" style={font} fontSize="158" letterSpacing="0.05em" fill="currentColor">SLIIQQUE</text>
    </svg>
  );
}
