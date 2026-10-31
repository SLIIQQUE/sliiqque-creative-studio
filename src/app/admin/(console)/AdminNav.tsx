"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: IconName; owner?: boolean };

const CONTENT: Item[] = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/posts", label: "Posts", icon: "doc" },
  { href: "/admin/media", label: "Media", icon: "image" },
  { href: "/admin/categories", label: "Categories", icon: "tag" },
];

const OPERATIONS: Item[] = [
  { href: "/admin/redirects", label: "Redirects", icon: "redirect", owner: true },
  { href: "/admin/settings", label: "Settings", icon: "sliders", owner: true },
  { href: "/admin/users", label: "Users", icon: "users", owner: true },
  { href: "/admin/audit", label: "Audit log", icon: "clock", owner: true },
];

type IconName = "grid" | "doc" | "image" | "tag" | "redirect" | "sliders" | "users" | "clock";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    doc: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /><path d="M9 12h6M9 16h6" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5-4-9 8" /></>,
    tag: <><path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8z" /><circle cx="7.5" cy="7.5" r="1.2" /></>,
    redirect: <><path d="M4 7h11a4 4 0 014 4v6" /><path d="M16 14l3 3 3-3" /><path d="M4 17V7" /></>,
    sliders: <><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="8" cy="6" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="10" cy="18" r="2" /></>,
    users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0111 0" /><path d="M16 5.5a3 3 0 010 5.8" /><path d="M17 20a5.5 5.5 0 00-2-4.3" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function Group({ label, items, isOwner, path }: { label: string; items: Item[]; isOwner: boolean; path: string }) {
  const shown = items.filter((i) => isOwner || !i.owner);
  if (!shown.length) return null;
  return (
    <div className="adm-nav__group">
      <span className="adm-nav__label">{label}</span>
      {shown.map((item, i) => {
        const current = item.href === "/admin" ? path === "/admin" : path.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className="adm-nav__item" aria-current={current ? "page" : undefined}>
            <span className="adm-nav__icon"><Icon name={item.icon} /></span>
            <span>{item.label}</span>
            <span className="adm-nav__num">{String(i + 1).padStart(2, "0")}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function AdminNav({ isOwner }: { isOwner: boolean }) {
  const path = usePathname();
  return (
    <nav className="adm-nav" aria-label="Admin">
      <Group label="Content" items={CONTENT} isOwner={isOwner} path={path} />
      <Group label="Operations" items={OPERATIONS} isOwner={isOwner} path={path} />
    </nav>
  );
}
