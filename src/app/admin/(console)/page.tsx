import Link from "next/link";
import type { CSSProperties } from "react";
import { requireUser } from "@/lib/cms/dal";
import { dashboardData } from "@/lib/cms/queries";
import { formatLagos } from "@/lib/cms/dates";
import type { PostStatus } from "@/lib/cms/types";

const STATUS: { key: PostStatus; label: string; hint: string; color: string }[] = [
  { key: "draft", label: "Drafts", hint: "In the writing room", color: "var(--amber)" },
  { key: "scheduled", label: "Scheduled", hint: "Waiting for the slot", color: "var(--blue)" },
  { key: "published", label: "Published", hint: "Live in the world", color: "var(--green)" },
  { key: "archived", label: "Archived", hint: "Filed away", color: "var(--text-muted)" },
];

const R = 54;
const C = 2 * Math.PI * R;

function dateParts(value: Date) {
  const format = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-NG", { timeZone: "Africa/Lagos", ...options }).format(value);
  return { day: format({ day: "2-digit" }), month: format({ month: "short" }) };
}

export default async function Dashboard() {
  const user = await requireUser();
  const d = await dashboardData();
  const total = Object.values(d.counts).reduce((sum, n) => sum + n, 0);
  const today = new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date());
  const next = d.nextScheduled;
  const when = next ? dateParts(next.scheduledFor) : null;

  let offset = 0;
  const arcs = STATUS.map((s) => {
    const value = d.counts[s.key];
    const dash = total ? (value / total) * C : 0;
    const arc = { ...s, value, dash, offset, pct: total ? Math.round((value / total) * 100) : 0 };
    offset += dash;
    return arc;
  });

  const ticker = [
    ["Drafts", d.counts.draft],
    ["Scheduled", d.counts.scheduled],
    ["Published", d.counts.published],
    ["Archived", d.counts.archived],
    ["Total stories", total],
    ["Next slot", next ? formatLagos(next.scheduledFor) : "Clear"],
  ] as const;

  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-kicker"><span className="adm-dot" /> {today} <i>·</i> Lagos</p>
          <h1 className="adm-head__title">
            The signal <em className="adm-gradient-text">room</em><span className="adm-head__ghost">.</span>
          </h1>
          <p className="adm-sub">
            Welcome back, {user.name.split(" ")[0]}. {total === 0 ? "The journal is a blank page waiting for its first story." : `${total} ${total === 1 ? "story" : "stories"} on the board, ${d.counts.scheduled} queued for a future slot.`}
          </p>
        </div>
        <div className="adm-head__actions">
          <Link className="adm-btn adm-btn--gradient" href="/admin/posts/new">New post <span className="adm-btn__arrow">↗</span></Link>
          <Link className="adm-btn adm-btn--ghost" href="/blogs" target="_blank" rel="noreferrer">View journal</Link>
        </div>
      </div>

      <section className="adm-card adm-metrics" aria-label="Journal status">
        {STATUS.map((s, i) => (
          <Link className={`adm-metric adm-metric--${s.key}`} href={`/admin/posts?status=${s.key}`} key={s.key}>
            <div className="adm-metric__top">
              <span className="adm-metric__label">{s.label}</span>
              <span className="adm-metric__idx">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="adm-metric__value">{d.counts[s.key]}<small>{total ? `${Math.round((d.counts[s.key] / total) * 100)}%` : "0%"}</small></div>
            <div className="adm-metric__bar" aria-hidden="true"><span style={{ width: `${total ? (d.counts[s.key] / total) * 100 : 0}%` }} /></div>
            <div className="adm-metric__foot"><span>{s.hint}</span><span>Open ↗</span></div>
          </Link>
        ))}
      </section>

      <div className="adm-bento" style={{ marginTop: 16 }}>
        <section className="adm-card adm-card--dark adm-span-7 adm-reg">
          <div className="adm-card__head">
            <div>
              <p className="adm-kicker"><i>01</i> The mix</p>
              <h2>Where the stories sit</h2>
            </div>
            <span className="adm-kicker">{String(total).padStart(2, "0")} total</span>
          </div>
          <div className="adm-pulse">
            <div className="adm-ring">
              <svg viewBox="0 0 120 120" role="img" aria-label={`${total} posts across four statuses`}>
                <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="9" />
                {arcs.filter((a) => a.value > 0).map((a) => (
                  <circle
                    key={a.key}
                    cx="60"
                    cy="60"
                    r={R}
                    fill="none"
                    stroke={a.color}
                    strokeWidth="9"
                    strokeDasharray={`${a.dash} ${C - a.dash}`}
                    strokeDashoffset={-a.offset}
                  />
                ))}
              </svg>
              <div className="adm-ring__center">
                <span className="adm-ring__value">{total}</span>
                <span className="adm-ring__label">stories on file</span>
              </div>
            </div>
            <div className="adm-legend">
              {arcs.map((a) => (
                <Link className="adm-legend__row" href={`/admin/posts?status=${a.key}`} key={a.key} style={{ "--legend": a.color } as CSSProperties}>
                  <span className="adm-legend__dot" aria-hidden="true" />
                  <span className="adm-legend__name">{a.label}</span>
                  <span className="adm-legend__count">{a.value}</span>
                  <span className="adm-legend__pct">{a.pct}%</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={`adm-card adm-card--dark adm-ticket adm-span-5${next ? "" : " adm-ticket--empty"}`}>
          <div className="adm-card__head">
            <div>
              <p className="adm-kicker"><i>02</i> Up next</p>
              <h2>The next slot</h2>
            </div>
            <span className="adm-kicker">{next ? "Locked" : "Open"}</span>
          </div>
          {next && when ? (
            <div className="adm-ticket__body">
              <div className="adm-ticket__date">
                <span className="adm-ticket__day">{when.day}</span>
                <span className="adm-ticket__month">{when.month}</span>
              </div>
              <div>
                <Link className="adm-ticket__title" href={`/admin/posts/${next.id}`}>{next.title}</Link>
                <p className="adm-ticket__meta">Goes live {formatLagos(next.scheduledFor)}</p>
              </div>
            </div>
          ) : (
            <div className="adm-empty">
              <b>The runway is clear.</b>
              <span>Nothing is queued. Write something and give it a time.</span>
            </div>
          )}
          <div className="adm-ticket__actions">
            {next ? (
              <Link className="adm-btn adm-btn--ghost adm-btn--sm" href={`/admin/posts/${next.id}`}>Edit the post</Link>
            ) : (
              <Link className="adm-btn adm-btn--ghost adm-btn--sm" href="/admin/posts/new">Plan a post</Link>
            )}
            <Link className="adm-btn adm-btn--sm" href="/admin/posts?status=scheduled">Queue</Link>
          </div>
        </section>

        <section className="adm-card adm-span-8 adm-recent">
          <div className="adm-card__head">
            <div>
              <p className="adm-kicker"><i>03</i> Recently edited</p>
              <h2>The open desk</h2>
            </div>
            <Link className="adm-btn adm-btn--ghost adm-btn--sm" href="/admin/posts">All posts</Link>
          </div>
          {d.recent.length ? (
            <div className="adm-index adm-index--compact">
              <div className="adm-index__head" aria-hidden="true">
                <span>No.</span><span>Story</span><span>Last edit</span><span>State</span><span />
              </div>
              {d.recent.map((p, i) => (
                <Link className="adm-index__row" href={`/admin/posts/${p.id}`} key={p.id}>
                  <span className="adm-index__num">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <div className="adm-index__title">{p.title}</div>
                    <div className="adm-index__slug">/blogs/{p.slug}</div>
                  </div>
                  <span className="adm-index__date">{formatLagos(p.updatedAt)}</span>
                  <span className="adm-index__badges"><span className={`adm-pill adm-pill--${p.status}`}>{p.status}</span></span>
                  <span className="adm-index__arrow" aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="adm-empty">
              <b>No posts yet.</b>
              <span>The first draft is always the hardest. Start it anyway.</span>
            </div>
          )}
        </section>

        <section className="adm-card adm-span-4 adm-deskcard">
          <div className="adm-card__head">
            <div>
              <p className="adm-kicker"><i>04</i> Shortcuts</p>
              <h2>The desk</h2>
            </div>
          </div>
          <div className="adm-desk">
            <Link className="adm-desk__item" href="/admin/posts/new">
              <span className="adm-desk__num">01</span>
              <span className="adm-desk__label">Start a draft<small>Open a blank journal post</small></span>
              <span className="adm-desk__arrow">↗</span>
            </Link>
            <Link className="adm-desk__item" href="/admin/media">
              <span className="adm-desk__num">02</span>
              <span className="adm-desk__label">Upload media<small>Drop in the next image</small></span>
              <span className="adm-desk__arrow">↗</span>
            </Link>
            <Link className="adm-desk__item" href="/admin/categories">
              <span className="adm-desk__num">03</span>
              <span className="adm-desk__label">Organise categories<small>Map posts to services</small></span>
              <span className="adm-desk__arrow">↗</span>
            </Link>
            {user.role === "owner" ? (
              <Link className="adm-desk__item" href="/admin/settings">
                <span className="adm-desk__num">04</span>
                <span className="adm-desk__label">Tune the journal<small>Share image, page size, health</small></span>
                <span className="adm-desk__arrow">↗</span>
              </Link>
            ) : (
              <Link className="adm-desk__item" href="/blogs" target="_blank" rel="noreferrer">
                <span className="adm-desk__num">04</span>
                <span className="adm-desk__label">View the journal<small>See the public edit</small></span>
                <span className="adm-desk__arrow">↗</span>
              </Link>
            )}
          </div>
          <div className="adm-keys">
            <span className="adm-kicker">Keyboard</span>
            <div><kbd>⌘K</kbd><span>Jump to any room</span></div>
            <div><kbd>Esc</kbd><span>Close the palette</span></div>
          </div>
        </section>

        <div className="adm-band adm-span-12">
          <div>
            <p className="adm-kicker"><span className="adm-dot" /> Studio note</p>
            <h2 style={{ marginTop: 8 }}>A journal grows by one clear idea at a time.</h2>
            <p style={{ marginTop: 6 }}>Reports stay in Search Console, GA4 and Vercel Analytics. This room is for the work itself: write, arrange, publish.</p>
          </div>
          <div className="adm-band__spark" aria-hidden="true">
            {[34, 52, 41, 68, 58, 82, 64, 74, 46, 60, 88, 72].map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}
          </div>
          <Link className="adm-btn adm-btn--ghost adm-btn--sm" href="/admin/posts">Open the index</Link>
        </div>

        <div className="adm-ticker adm-span-12" aria-hidden="true">
          <div className="adm-ticker__track">
            {[...ticker, ...ticker].map(([label, value], i) => (
              <span className="adm-ticker__item" key={`${label}-${i}`}>{label} <b>{value}</b></span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
