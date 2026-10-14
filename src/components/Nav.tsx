import Link from "next/link";
import { LogoNav } from "./Logo";
import NavLinks from "./NavLinks";
import ScrollProgress from "./ScrollProgress";

export default function Nav() {
  return (
    <header className="nav-wrap">
      <a className="skip-link" href="#main">Skip to content</a>
      <ScrollProgress />
      <nav className="nav" aria-label="Primary">
        <div className="nav__inner">
          <Link className="logo" href="/" aria-label="SLIIQQUE Studio home"><LogoNav /></Link>
          <NavLinks />
        </div>
      </nav>
    </header>
  );
}
