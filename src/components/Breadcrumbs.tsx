import Link from "next/link";

/** Visible breadcrumb trail. Pass the same items used for breadcrumbSchema() so the two never drift. */
export default function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((it, i) =>
          i === items.length - 1 ? (
            <li key={it.path}><span aria-current="page">{it.name}</span></li>
          ) : (
            <li key={it.path}><Link href={it.path}>{it.name}</Link></li>
          ),
        )}
      </ol>
    </nav>
  );
}
