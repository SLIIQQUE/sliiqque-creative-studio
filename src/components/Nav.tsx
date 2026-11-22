import Link from "next/link";
import { LogoNav } from "./Logo";
import NavLinks from "./NavLinks";
import ScrollProgress from "./ScrollProgress";

/** The sticky header. `children` (the notice bar) sits above the navigation inside the same sticky block, so both stay in view while scrolling. */
export default function Nav({ children }: { children?: React.ReactNode }) {
  return (
    <header className="nav-wrap">
      <a className="skip-link" href="#main">Skip to content</a>
      <ScrollProgress />
      {children}
      <nav className="nav" aria-label="Primary">
        <div className="nav__inner">
          <Link className="logo" href="/" aria-label="SLIIQQUE Studio home"><LogoNav /></Link>
          <NavLinks />
        </div>
      </nav>
    </header>
  );
}
