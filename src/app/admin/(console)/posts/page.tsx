import Link from "next/link";
import { requireUser } from "@/lib/cms/dal";
import { listCategories, listPosts } from "@/lib/cms/queries";
import { formatLagos } from "@/lib/cms/dates";
import type { PostStatus } from "@/lib/cms/types";

const STATUSES: PostStatus[] = ["draft", "scheduled", "published", "archived"];

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; category?: string; page?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const status = STATUSES.find((s) => s === sp.status);
  const categories = await listCategories();
  const categoryId = categories.find((c) => c.id === sp.category)?.id;
  const page = Math.max(1, Number(sp.page) || 1);
  const { rows, total, pages } = await listPosts({ q: sp.q?.slice(0, 80), status, categoryId, page });
  const qs = (p: number) => new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), ...(status ? { status } : {}), ...(categoryId ? { category: categoryId } : {}), page: String(p) }).toString();
  const tab = (next?: PostStatus) => {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (next) params.set("status", next);
    if (categoryId) params.set("category", categoryId);
    const query = params.toString();
    return query ? `/admin/posts?${query}` : "/admin/posts";
  };

  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-kicker"><span className="adm-dot" /> Library <i>·</i> {total} {total === 1 ? "story" : "stories"}</p>
          <h1 className="adm-head__title">The <em className="adm-gradient-text">index</em><span className="adm-head__ghost">.</span></h1>
          <p className="adm-sub">Every draft, queue entry and live story in one editorial ledger. Filter the shelf, then open a piece to edit.</p>
        </div>
        <div className="adm-head__actions">
          <Link className="adm-btn adm-btn--gradient" href="/admin/posts/new">New post <span className="adm-btn__arrow">↗</span></Link>
        </div>
      </div>

      <div className="adm-browse">
        <div className="adm-tabs" role="navigation" aria-label="Filter by status">
          <Link className="adm-tab" data-active={!status} href={tab()}>All</Link>
          {STATUSES.map((s) => <Link className="adm-tab" data-active={status === s} href={tab(s)} key={s}>{s}</Link>)}
        </div>
        <form className="adm-browse__form" method="get" role="search">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <div className="adm-browse__search">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input name="q" type="search" defaultValue={sp.q ?? ""} placeholder="Search the journal by title or slug" aria-label="Search posts" />
          </div>
          <select name="category" defaultValue={categoryId ?? ""} aria-label="Filter by category">
            <option value="">Every category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="adm-btn" type="submit">Filter</button>
          <Link className="adm-btn adm-btn--ghost" href="/admin/posts">Reset</Link>
        </form>
      </div>

      <div className="adm-card adm-indexcard">
        {rows.length ? (
          <div className="adm-index">
            <div className="adm-index__head" aria-hidden="true">
              <span>No.</span><span>Story</span><span>Shelf</span><span>Date</span><span>State</span><span />
            </div>
            {rows.map((p, i) => (
              <Link className="adm-index__row" href={`/admin/posts/${p.id}`} key={p.id}>
                <span className="adm-index__num">{String((page - 1) * 20 + i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="adm-index__title">{p.title}</div>
                  <div className="adm-index__slug">/blogs/{p.slug}</div>
                </div>
                <span className="adm-index__cat">{p.category ?? "Unfiled"}</span>
                <span className="adm-index__date">
                  {formatLagos(p.status === "scheduled" ? p.scheduledFor : p.status === "published" ? p.publishedAt : p.updatedAt)}
                </span>
                <span className="adm-index__badges">
                  <span className={`adm-pill adm-pill--${p.status}`}>{p.status}</span>
                  {p.isConcept ? <span className="adm-pill adm-pill--concept">concept</span> : null}
                  {p.status === "published" && !p.listed ? <span className="adm-pill adm-pill--quiet">unlisted</span> : null}
                </span>
                <span className="adm-index__arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="adm-empty">
            <b>Nothing on this shelf.</b>
            <span>Adjust the filters, or start a new post.</span>
          </div>
        )}
      </div>

      <div className="adm-row" style={{ marginTop: 16, justifyContent: "space-between", alignItems: "center" }}>
        <span className="adm-chip"><b>{total}</b> {total === 1 ? "result" : "results"} <i>·</i> page {page} of {pages}</span>
        {pages > 1 ? (
          <div className="adm-row" style={{ gap: 8 }}>
            {page > 1 ? <Link className="adm-btn adm-btn--ghost adm-btn--sm" href={`/admin/posts?${qs(page - 1)}`}>← Previous</Link> : null}
            {page < pages ? <Link className="adm-btn adm-btn--ghost adm-btn--sm" href={`/admin/posts?${qs(page + 1)}`}>Next →</Link> : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
