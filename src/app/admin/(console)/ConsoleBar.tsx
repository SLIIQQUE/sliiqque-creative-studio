"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ConsoleClock from "./ConsoleClock";

type IconName = "search" | "plus" | "image" | "grid" | "doc" | "tag" | "redirect" | "sliders" | "users" | "clock" | "globe";

type Command = {
  href: string;
  label: string;
  group: "Create" | "Navigate" | "Public";
  hint: string;
  icon: IconName;
  owner?: boolean;
  keywords?: string;
};

const LABELS: Record<string, string> = {
  admin: "Console",
  posts: "Posts",
  new: "New post",
  media: "Media",
  categories: "Categories",
  redirects: "Redirects",
  settings: "Settings",
  users: "Users",
  audit: "Audit log",
};

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5-4-9 8" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    doc: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /><path d="M9 12h6M9 16h6" /></>,
    tag: <><path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8z" /><circle cx="7.5" cy="7.5" r="1.2" /></>,
    redirect: <><path d="M4 7h11a4 4 0 014 4v6" /><path d="M16 14l3 3 3-3" /><path d="M4 17V7" /></>,
    sliders: <><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="8" cy="6" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="10" cy="18" r="2" /></>,
    users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0111 0" /><path d="M16 5.5a3 3 0 010 5.8" /><path d="M17 20a5.5 5.5 0 00-2-4.3" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function crumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length <= 1) return ["Studio", "Journal", "Console"];
  const section = LABELS[parts[1]] ?? parts[1];
  if (parts[1] === "posts" && parts[2]) {
    const leaf = parts[2] === "new" ? "New post" : "Edit post";
    return ["Studio", "Journal", section, leaf];
  }
  return ["Studio", "Journal", section];
}

export default function ConsoleBar({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(() => {
    const all: Command[] = [
      { href: "/admin/posts/new", label: "Start a new post", group: "Create", hint: "New", icon: "plus", keywords: "draft write story" },
      { href: "/admin/media", label: "Upload media", group: "Create", hint: "Library", icon: "image", keywords: "image photo upload" },
      { href: "/admin", label: "Dashboard", group: "Navigate", hint: "Home", icon: "grid", keywords: "overview signal" },
      { href: "/admin/posts", label: "Posts", group: "Navigate", hint: "Index", icon: "doc", keywords: "stories articles drafts" },
      { href: "/admin/media", label: "Media", group: "Navigate", hint: "Library", icon: "image", keywords: "images files" },
      { href: "/admin/categories", label: "Categories", group: "Navigate", hint: "Taxonomy", icon: "tag", keywords: "services shelves" },
      { href: "/admin/redirects", label: "Redirects", group: "Navigate", hint: "Owner", icon: "redirect", owner: true, keywords: "routes urls" },
      { href: "/admin/settings", label: "Settings", group: "Navigate", hint: "Owner", icon: "sliders", owner: true, keywords: "journal identity health" },
      { href: "/admin/users", label: "Users", group: "Navigate", hint: "Owner", icon: "users", owner: true, keywords: "team people access" },
      { href: "/admin/audit", label: "Audit log", group: "Navigate", hint: "Owner", icon: "clock", owner: true, keywords: "history activity trail" },
      { href: "/blogs", label: "Open the journal", group: "Public", hint: "Live", icon: "globe", keywords: "site public view" },
      { href: "/", label: "Open the studio", group: "Public", hint: "Live", icon: "globe", keywords: "home site public" },
    ];
    return all.filter((c) => isOwner || !c.owner);
  }, [isOwner]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.label} ${c.group} ${c.keywords ?? ""}`.toLowerCase().includes(q));
  }, [commands, query]);

  const grouped = useMemo(() => {
    const groups = ["Create", "Navigate", "Public"] as const;
    return groups
      .map((group) => ({ group, items: filtered.filter((c) => c.group === group) }))
      .filter((g) => g.items.length);
  }, [filtered]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((value) => !value);
        setQuery("");
        setActive(0);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, Math.max(0, filtered.length - 1)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[active]) {
        e.preventDefault();
        router.push(filtered[active].href);
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, active, router]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => input.current?.focus(), 30);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(id);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.querySelector(".adm-cmd__item[data-active='true']")?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const parts = crumbs(pathname);
  let flatIndex = -1;

  return (
    <>
      <nav className="adm-crumbs" aria-label="Breadcrumb">
        {parts.map((part, i) => (
          <Fragment key={`${part}-${i}`}>
            {i > 0 ? <i aria-hidden="true">/</i> : null}
            {i === parts.length - 1 ? <b>{part}</b> : <span>{part}</span>}
          </Fragment>
        ))}
      </nav>

      <div className="adm-topbar__right">
        <button
          type="button"
          className="adm-cmd-trigger"
          onClick={() => {
            setOpen(true);
            setQuery("");
            setActive(0);
          }}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <Icon name="search" />
          <span>Jump to anything</span>
          <kbd>⌘K</kbd>
        </button>
        <span className="adm-status">Private</span>
        <ConsoleClock />
      </div>

      {open ? (
        <div
          className="adm-cmd"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="adm-cmd__panel" role="dialog" aria-modal="true" aria-label="Command palette">
            <div className="adm-cmd__search">
              <Icon name="search" />
              <input
                ref={input}
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder="Search pages and actions"
                aria-label="Search pages and actions"
                autoComplete="off"
              />
              <kbd>ESC</kbd>
            </div>
            <div className="adm-cmd__list">
              {grouped.map(({ group, items }) => (
                <div key={group}>
                  <div className="adm-cmd__group">{group}</div>
                  {items.map((item) => {
                    flatIndex += 1;
                    const index = flatIndex;
                    return (
                      <button
                        key={`${item.group}-${item.label}`}
                        type="button"
                        className="adm-cmd__item"
                        data-active={index === active}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => {
                          router.push(item.href);
                          setOpen(false);
                        }}
                      >
                        <Icon name={item.icon} />
                        <span>{item.label}</span>
                        <span className="adm-cmd__hint">{item.hint}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
              {filtered.length === 0 ? <div className="adm-cmd__empty">Nothing matches “{query}”. Try “post”, “media” or “settings”.</div> : null}
            </div>
            <div className="adm-cmd__foot">
              <span>↑ ↓ to move · ↵ to open</span>
              <span>SLIIQQUE console</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
