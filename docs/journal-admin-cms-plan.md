# Journal admin and CMS plan

> Purpose: plan for adding an authenticated admin, a database-backed Journal and a full post workflow to the creative studio site, replacing the hand-edited JSON publishing flow.
> Owner: Gabriel Njoabozia | Status: Phases 0 to 6 built and verified locally, not deployed, phase 7 not started | Last reviewed: 2026-10-31

## 1. Summary

Today the Journal is content in `src/data/content.json`. Publishing a post means editing JSON by hand, adding an image id, raising a counter and redeploying. There is no scheduler, no preview, no author record and no way to check a post against the studio's rules before it ships.

The plan adds, inside the same Next.js app and the same Vercel project:

1. A protected `/admin` area for the founder and a small number of editors.
2. A Postgres database holding posts, categories, media, redirects, settings and an audit trail.
3. A rich-text editor that stores structured JSON, rendered by the site's own React components so the current design is preserved and no raw HTML is ever injected into pages.
4. A publishing pipeline: draft, preview, schedule, publish, revalidate, ping search engines, update the feed and `llms.txt`.
5. Studio guardrails built into the editor as publish checks (no em dashes, concept labels, safe-claims wording, price facts from one source).
6. A one-time, verifiable migration of the 10 posts already in the repo, with no URL changes.

Recommended order: foundation, then posts and editor, then media, then migrate and cut over, then the publishing pipeline and guardrails, then the optional enquiries inbox. Each phase ends with acceptance criteria that can be checked in minutes.

## 2. Where the studio is today

Verified against the repo on 2026-10-31.

| Area | Current state |
|---|---|
| Framework | Next.js 16 App Router, React 19, TypeScript, deployed on Vercel |
| Styling | Hand-written CSS in `src/app/site.css`, no utility framework, Syne and DM Sans |
| Dependencies | `next`, `react`, `resend`, `@vercel/analytics`, `@next/third-parties`. No database, auth, ORM or editor |
| Post data | `BLOGS` rows `[slug, date, category, title, image]` plus `POSTS[slug]` with `groups > subs > paragraphs` and a two-image `gallery` |
| Counts | 7 entries in `BLOGS`, `BLOGS_LISTED` is 6, 10 entries in `POSTS`. The README's "3 live, 3 unpublished" is stale |
| Images | Files in `public/img`, rendered through `Img` at fixed width and height |
| Post page | `src/app/blogs/[slug]/page.tsx`: statically generated, JSON-LD `BlogPosting`, breadcrumbs, `split` two-column sections, image pair after the second section, related service note, video block, share links, pager |
| Author | Hard-coded founder byline |
| Category to service | `CATEGORY_SERVICE` in `src/data/services.ts` drives the related service note and `postsForService` |
| Consumers of post data | `sitemap.ts`, `feed.xml`, `llms.ts`, `Home.tsx`, `blogs/page.tsx`, the post page |
| Contact form | `/api/contact` emails through Resend. Nothing is stored |
| Analytics | GA4 behind a consent banner, Vercel Analytics, IndexNow script run by hand |
| Process | `Documents/Sales/SLIIQQUE-Studio-Journal-Drafts-Nov-Dec-2026.md` says the site has no scheduler and lists a manual four-step publish |

Constraints that shape the design:

- The header config sets `X-Frame-Options: DENY`, so an admin preview cannot be an iframe on the same origin. Preview opens in a new tab.
- `AGENTS.md` warns that this Next.js version differs from training data. Every Next API named in this plan is a hypothesis until checked against `node_modules/next/dist/docs/` in Phase 0.
- The site is static today and scores well. Public journal pages must stay statically served with on-demand revalidation, not become per-request dynamic.

## 3. Goals and non-goals

Goals:

- Publish, schedule and edit a Journal post without touching code or redeploying.
- Keep every existing URL, the current design, the JSON-LD and the Lighthouse results.
- Make workspace rules (RULES.md, content template guardrails) enforceable at publish time.
- Keep the stack small: one new database, one blob store, no UI framework.
- One source of truth: prices, service names and CTA wording are read from the site's data modules (which follow COMPANY.md), never retyped into post bodies.

Non-goals for the first release:

- Public comments (spam and moderation cost, no demand today).
- A general page builder or editing of service, pricing, work or legal pages. Those stay in code and in their owner files.
- Menu management, a form builder, first-party analytics or geo reports. GA4, Vercel Analytics and Search Console already cover reporting.
- Multi-language content.
- Logo creation or any logo tooling.

## 4. Decisions needed

| # | Decision | Recommendation | Why |
|---|---|---|---|
| D1 | Database | Neon Postgres via the Vercel Marketplace | Serverless friendly, branching for safe migrations, point-in-time restore, one-click env wiring. A Neon connector is available in this workspace for setup, which needs your approval before it creates anything |
| D2 | ORM | Drizzle ORM with `drizzle-kit` migrations | Typed, small, plain SQL migrations that can be reviewed |
| D3 | Media storage | Vercel Blob | Local disk does not exist on Vercel. Direct client upload avoids the 4.5 MB function body limit |
| D4 | Auth | Auth.js with an email sign-in link sent through Resend, restricted to an allowlist of addresses | No passwords to store or leak, Resend is already in the stack. Fallback: credentials with bcrypt |
| D5 | Editor | Tiptap (headless) storing its JSON document | Headless means it takes the studio's CSS. JSON is safer and more portable than stored HTML |
| D6 | Admin UI | Separate route group with its own `admin.css`, using the existing design tokens, native `dialog`, no Tailwind or component library | Matches the "no utility framework" rule and adds no styling dependency |
| D7 | Roles | `owner` (everything) and `editor` (posts and media only) | Two roles are enough, and they can be enforced in every server action |
| D8 | Cutover | Environment flag `JOURNAL_SOURCE=json` or `db`, switched after parity checks | Reversible in one deploy |
| D9 | Enquiries inbox | Include in a later optional phase | Stored leads, with the type list now containing AI Fashion Imagery, are valuable but separate from the Journal |

## 5. Target architecture

```
Browser
  |-- public site (static, revalidated on demand)
  |     /blogs, /blogs/[slug], /blogs/category/[slug], /feed.xml, /sitemap.xml, /llms.txt
  |-- admin (dynamic, noindex, behind auth)
  |     /admin/login, /admin, /admin/posts, /admin/media, /admin/categories,
  |     /admin/redirects, /admin/settings, /admin/users, /admin/audit
  |
Next.js app on Vercel
  |-- request guard for /admin (session check at the edge of the app)
  |-- server actions for every admin write (each re-checks session and role)
  |-- route handlers: upload token, draft preview, scheduled publish (cron)
  |-- query layer (one module, typed) used by public pages, feed, sitemap, llms
  |
Neon Postgres (posts, revisions, categories, media, redirects, settings, users, audit)
Vercel Blob (uploaded images)
Resend (sign-in links, enquiry email)
Vercel Cron (publish scheduled posts, once a minute or every five minutes)
IndexNow (called automatically after publish)
```

New dependencies, all to be confirmed against installed versions in Phase 0: `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit` (dev), `next-auth`, a Drizzle adapter for it, `@vercel/blob`, `@tiptap/react`, `@tiptap/starter-kit` and a few extensions, `zod`, `sharp` for validation and placeholders. No UI framework, no state library.

## 6. Data model

Names are the studio's own. All tables use `uuid` or `bigint` keys, `created_at` and `updated_at`.

| Table | Purpose | Key fields |
|---|---|---|
| `users` | Admin accounts | email (unique, allowlisted), name, role (`owner`, `editor`), title, avatar media id, last login |
| `posts` | Journal posts | slug (unique), title, excerpt, body (JSON), status (`draft`, `scheduled`, `published`, `archived`), listed (bool, replaces `BLOGS_LISTED`), published_at, scheduled_for, category id, service slug (nullable, overrides the category mapping), author id, hero media id, is_concept (bool), reading minutes, seo (JSON: title, description, OG media, canonical, focus keyword, noindex), faq (JSON list), search vector |
| `post_revisions` | Version history | post id, title, body, saved by, saved at. Keep the last 30 per post |
| `categories` | Journal categories | slug, name, default service slug. Seeded with Commercials, Digital Humans, Fashion, Photography, Studio, Process, Post-production |
| `media` | Uploaded images | blob URL and pathname, mime, bytes, width, height, alt (required), caption, blur placeholder, focal point x and y, uploaded by |
| `post_media` | Gallery membership | post id, media id, sort order |
| `post_related` | Hand-picked related posts | post id, related post id, sort order |
| `redirects` | Moved URLs | from path (unique), to path, status code |
| `settings` | Singleton | journal title, description, posts per page, default share image |
| `audit_log` | Who did what | user id, action, entity, entity id, small JSON detail, timestamp |
| `enquiries` (phase 7) | Stored leads | name, email, phone, type, budget, message, attribution (JSON from the existing attribution helper), status (`new`, `contacted`, `won`, `lost`), notes |
| `subscribers` (phase 7) | Newsletter | email, source, confirmed at, unsubscribed at |

Rules baked into the schema: slug is unique and URL safe, alt text is `NOT NULL`, a published post must have a hero image, an excerpt of 50 to 160 characters and a category. Deleting a post is a soft archive by default.

Posts reference categories and the service slug by value, with the list of services still owned by `src/data/services.ts`. The admin never creates a service.

## 7. Content format and renderer

Store the Tiptap JSON document. Render it with a studio-owned React mapper, not `dangerouslySetInnerHTML`. Consequences:

- No stored XSS path from the body: only known node types render, and links and images are validated at render.
- The existing design survives: the mapper groups blocks under each H2 into the current `split` layout, keeps `Reveal`, keeps the H3 `sub` style and keeps the bold short-label paragraph rule (a paragraph that ends in a colon and is under 40 characters renders bold today).
- Plain text for the feed, `llms.txt`, word count, excerpt fallback and search is derived from the same JSON, so every consumer stays consistent.

Supported blocks at launch:

| Block | Notes |
|---|---|
| Heading 2 and 3 | The only heading levels. H1 is the post title |
| Paragraph, bold, italic, link, ordered and unordered list, blockquote | Links get `rel` and external handling in the mapper |
| Image | From the media library only, alt required, optional caption and size |
| Image pair | Reproduces the current two-image gallery layout |
| Concept label callout | Renders the approved wording "Concept campaign, not a client project." |
| Service call to action | Picks a service, renders the approved CTA wording and link from the data modules |
| Video | YouTube id, validated against the existing `VIDEOS` shape so VideoObject JSON-LD still emits |
| FAQ | Question and answer pairs, also emitted as `FAQPage` JSON-LD |
| Price token | Inserts a price from the data module (for example the AI commercial starting price) so post text never goes stale |

Not supported: raw HTML, scripts, iframes other than the video block, tables (add later if a post needs one), and H4 and below.

## 8. Admin feature set

Priority: M = must for launch, S = should, L = later.

### Access and accounts
- M Sign in by emailed link, allowlist enforced server side, session cookie httpOnly, secure, SameSite, short lifetime with sliding renewal.
- M Roles enforced in every server action and route handler, not only in the UI.
- M Sign out, session list, owner can add or disable users.
- S Login and upload rate limiting.
- L Passkeys.

### Dashboard
- M Counts: drafts, scheduled, published, archived. Next scheduled post. Recently edited.
- S Publish checklist failures across all drafts (missing alt, no excerpt, brand lint hits).
- S Links out to Search Console, GA4 and Vercel Analytics rather than rebuilding reports.

### Posts
- M List with search, filters (status, category, service, concept), sort, pagination, bulk archive.
- M Create and edit: title, slug (auto from title, editable, locked after publish unless a redirect is created), excerpt, body, hero image, gallery, category, service override, author, concept flag, FAQ, related posts.
- M Status workflow: draft, schedule for a date and time (Lagos time shown, stored in UTC), publish now, unpublish, archive.
- M Preview in a new tab through Next.js draft mode, with a visible banner and an exit link.
- M Autosave of drafts every few seconds, with a "saved" indicator and a guard against losing unsaved edits.
- M Revision history with restore.
- S Duplicate a post, "load more" listing control (`listed` flag).
- S Internal link suggester: while typing, suggest published posts and service pages to link to.
- S Reading time, word count and heading outline sidebar.
- L Table block, embeds beyond YouTube, post series.

### SEO
- M Fields for SEO title (60 characters), meta description (155), canonical, OG image (defaults to the hero), noindex.
- M Live search result preview and share card preview.
- M Focus keyphrase with a 0 to 100 score covering: keyphrase in title, description, first paragraph and one subheading, title and description length, word count, number of subheadings, image alt text, internal links, outbound links. The scoring is plain functions in `src/lib`, unit tested.
- M JSON-LD generated from the record: `BlogPosting` with real `dateModified`, author as `Person` from the user record, `FAQPage` when FAQ blocks exist, `VideoObject` when a video block exists, breadcrumb.
- S Keyword master list check: warn when the focus keyphrase does not appear in `Documents/Sales/SLIIQQUE-Studio-Keyword-Master-List-Oct2026.md` terms, loaded at build time as a read-only list.

### Media
- M Library grid with search and filter by unused.
- M Direct upload to Blob, multiple files, drag and drop, progress.
- M Validation: JPEG, PNG, WebP and AVIF only, no SVG, size cap, real content sniff through `sharp`, EXIF stripped, dimensions and blur placeholder generated.
- M Alt text required before a media item can be inserted in a post. Caption and focal point optional.
- M "Used in" list before delete, and block delete when the file is used by a published post.
- S Crop and resize as a new derived file, never overwriting the original.
- L Rename and replace-in-place with redirect.

### Categories, redirects and settings
- M Categories CRUD with default service mapping.
- M Redirects CRUD, plus an automatic redirect row when a published slug changes.
- M Settings: Journal title and description, posts per page, default share image.

### Audit and operations
- M Audit log of publish, unpublish, delete, role change, settings change.
- S Export all posts as JSON (a portable backup the owner can download).
- S Admin health page: database reachable, blob reachable, cron last run, last IndexNow result.

### Enquiries inbox (phase 7, optional)
- Store every contact form submission with attribution, show a list with status, notes, search and CSV export. Email through Resend keeps working in parallel so a database outage never loses a lead.

## 9. Public Journal features

Keep what exists (list, post, pager, share links, related service note, JSON-LD, breadcrumbs, feed, sitemap with images, `llms.txt`) and add:

- M Scheduled posts appear on time without a deploy.
- M Category pages at `/blogs/category/[slug]` with their own metadata and breadcrumb, linking to the mapped service.
- M Related posts: hand-picked first, then same category, then same service. Replace the current prev and next only logic where it adds value, keep the pager.
- M Table of contents for posts with three or more H2 sections, collapsed on mobile.
- S Search at `/blogs?q=` using the stored search vector, no client library.
- S Reading progress is already present site-wide through `ScrollProgress`, so reuse it.
- S Author block with the user's title and avatar.
- Keep out: comments, sidebars, pop-ups.

SEO details that must not regress: canonical URLs unchanged, the title suffix rule (drop the brand suffix above about 60 characters), `en-NG` language, image sitemap entries including gallery images, absolute URLs through `abs()`.

## 10. Studio guardrails as publish checks

Run when saving a draft (warnings) and when publishing (blocking, owner can override with a reason that is logged).

| Check | Source rule | Behaviour |
|---|---|---|
| No em dash character in title, excerpt, body, SEO fields or alt text | CLAUDE.md | Block |
| No defined company aliases such as a parenthetical list of pronouns after the company name | CLAUDE.md | Block |
| No logo creation offered or implied as a service | RULES.md | Block on a phrase list, warn otherwise |
| No mention of the day-job products listed in CLAUDE.md | CLAUDE.md | Block |
| Concept flag set means the callout block must be present near the top | Content template section 2 | Block |
| Guarantee language ("guaranteed", "rank #1", "go viral", "cheaper than any") | Content template safe-claims table | Warn with the approved replacement phrase |
| Price figures typed as numbers instead of price tokens | One source of truth | Warn, offer to convert |
| Brand name written as SLIIQQUE | CLAUDE.md | Warn on variants |
| Hero image present, alt text on every image, excerpt length, one primary service link | Content template section 11 | Block |
| Pre-publish QA checklist (strategy, honesty, packaging) | Content template section 11 | Checklist the author ticks, stored with the revision |

The phrase lists live in one file in the repo so the rules are edited in one place. The checks are plain functions with unit tests. They complement, and do not replace, the workspace pre-commit hook, which still guards the repo.

## 11. Publishing pipeline

```
draft  --save-->  autosave + revision
  |
  |--preview--> draft mode cookie, new tab, banner
  |
schedule(date, time) or publish now
  |
  |-- run publish checks
  |-- set status, published_at
  |-- revalidate: the post, /blogs, category page, /feed.xml, /sitemap.xml, home page journal preview, related service page
  |-- IndexNow ping for the new or changed URL (server side, key from env or the public key file)
  |-- audit log entry
```

Scheduled posts: a Vercel Cron job calls a protected route handler (secret from env) at a short interval. It publishes due posts and runs the same pipeline. If the cron fails, the admin health page shows the last successful run.

Unpublish and delete: unpublish returns the post to draft and revalidates the same paths. A published URL that is archived returns 410 or redirects, chosen per post.

Rebuild cost: no redeploy is needed for content changes. The sitemap, feed and `llms.txt` read from the query layer at revalidation time.

## 12. Security

Design requirements, to be reviewed by the `security-auditor` agent before cutover:

- Authorization is checked inside every server action and route handler. The request guard is a convenience, not the control.
- Role checks are explicit per action. Editors cannot manage users, settings, redirects or delete other people's posts unless the owner allows it.
- Server actions validate input with `zod`. IDs are parsed, never trusted.
- Body content is JSON and is rendered through the mapper. Links accept `http`, `https`, `mailto` and site-relative only. Images must come from the library.
- Uploads are validated by content, not by the client mime type, with a size cap and no SVG.
- Sessions: httpOnly, secure, SameSite=Lax cookies, rotation on sign-in, sign-out invalidates server side.
- Rate limit sign-in requests and uploads. Use the platform's rate limiting or a small database counter.
- Security headers stay as configured. Add a Content Security Policy for `/admin` that allows only the app, Blob and the fonts already used.
- `/admin` and `/api` stay out of `robots.ts` and the sitemap, and admin pages send `noindex`.
- Secrets live only in Vercel environment variables and the macOS Keychain. `.env.example` lists names only.
- Database backups through the provider's point-in-time restore, plus the owner-downloadable JSON export.
- An audit log row for every privileged action.

## 13. Migrating the existing 10 posts

A one-time, idempotent script, `scripts/import-journal.ts` (kebab-case), run locally against a database branch first.

1. Read `BLOGS` and `POSTS` from the JSON module.
2. For each slug, convert `groups > subs > paragraphs` to the JSON document: group heading becomes H2, sub heading becomes H3, each paragraph becomes a paragraph, short colon-ended paragraphs become bold paragraphs, and an image pair block is inserted after the second group so the layout is unchanged.
3. Create categories, media rows for every referenced image (the files stay in `public/img` and are registered with their `/img/<id>` path, so no image moves), and the post row with `listed` set from `BLOGS_LISTED` order.
4. Set author to the founder record, `published_at` from the existing date, status `published`, and mark the 3 posts not in `BLOGS` as `draft`.
5. Upsert keyed on slug so it can be re-run safely. Never delete rows without an explicit flag.
6. Print a report: counts, posts without an image, paragraphs that do not map, categories without a service.

Parity checks before switching `JOURNAL_SOURCE` to `db`:

- For each live post: same URL, same title, same H2 and H3 text in order, same paragraph text, same image ids, same JSON-LD (allowing the intended `dateModified` change), same canonical.
- `sitemap.xml`, `feed.xml` and `llms.txt` list the same URLs as before for the live posts.
- A text diff of the rendered page main content between the JSON build and the database build is empty for each of the 7 listed posts.
- Lighthouse results on `/blogs` and one post are within the thresholds already in `lighthouserc.json`.

After a week with no issues, delete the post bodies from `content.json`, keep the git history as the archive, update the README, and replace the manual steps in `Documents/Sales/SLIIQQUE-Studio-Journal-Drafts-Nov-Dec-2026.md` with a link to the admin. Draft journal posts J1 to J3 can then be entered through the editor.

## 14. Phased delivery

Sizes are rough estimates for one developer, not commitments: S = 1 to 2 days, M = 3 to 5 days, L = 6 to 10 days.

### Phase 0: decisions and spike (S)
- Settle D1 to D9. Read the installed Next.js docs for the request guard, caching and revalidation APIs, server actions and draft mode. Confirm the Auth.js, Tiptap and Drizzle versions work with the installed React and Next.
- Spike: Neon database from the Marketplace, one Drizzle table, one server action, one revalidation.
- Acceptance: a written one-page "confirmed APIs" note, a working database round trip on a preview deployment, decisions recorded here.

### Phase 1: foundation (M)
- Database, migrations, query layer skeleton, environment validation, `/admin` route group with its own layout and `admin.css`, sign-in by email link with allowlist, sessions, roles, request guard, audit log, admin shell and navigation.
- Acceptance: unauthenticated `/admin` redirects to sign-in, a non-allowlisted email gets no link, an editor cannot open owner-only pages (checked by calling the server actions directly), admin pages are `noindex`, the public site is unchanged and passes `next build`.

### Phase 2: posts, editor and renderer (L)
- Posts list and editor with autosave, revisions, the block set in section 7, the React mapper, slug rules, status field, category and service fields, SEO fields and the SEO score, JSON-LD generation.
- Acceptance: create, edit, restore a revision and archive a post end to end. A post rendered from the database matches the current layout on desktop and mobile. The same body renders through the mapper with no raw HTML path (a test proves a script tag typed into the editor never reaches the page).

### Phase 3: media (M)
- Blob upload, validation, library, alt requirement, used-in check, hero and gallery pickers, optional crop.
- Acceptance: an upload with an SVG or a renamed non-image is rejected, an image without alt cannot be inserted, deleting a used image is blocked, uploaded images render through `next/image` with a placeholder.

### Phase 4: migrate and cut over reads (M)
- Import script, query layer used by the post page, list page, home page preview, sitemap, feed, `llms.ts`, related service lookup, `JOURNAL_SOURCE` flag.
- Acceptance: every parity check in section 13 passes on a preview deployment, then production with the flag on `db`. Rolling back is one environment change and a redeploy.

### Phase 5: publishing pipeline (M)
- Draft preview, scheduling with cron, publish and unpublish, targeted revalidation, IndexNow ping, redirects manager and automatic redirect on slug change, category pages.
- Acceptance: a post scheduled five minutes ahead appears on its own with the feed, sitemap and home preview updated and an IndexNow success logged. Changing a published slug leaves the old URL redirecting with one hop.

### Phase 6: guardrails and SEO tooling (M)
- Publish checks from section 10, QA checklist, brand lint phrase file, internal link suggester, keyword list check, FAQ and video blocks wired to JSON-LD, table of contents, related posts logic.
- Acceptance: a draft containing an em dash cannot be published, a concept post without the callout cannot be published, price tokens render the current figure from the data module, unit tests cover every check.

### Phase 7: enquiries and newsletter (optional, S to M)
- Persist contact form and newsletter submissions in addition to the existing Resend email, inbox UI with status, notes and CSV export.
- Acceptance: a submission appears in the inbox and in email, a database outage still sends the email, the type list includes AI Fashion Imagery.

### Phase 8: hardening and handover (S)
- Security review, rate limits, CSP, restore drill from a database snapshot, README and a short admin guide in `docs/`, update the Journal drafts document to link to the admin.
- Acceptance: security review findings closed or accepted in writing, a restore from backup tested once, the owner completes a full publish from a clean browser using only the guide.

## 15. Testing and verification

- Type check and `next build` on every phase. The build also prerenders the sitemap, so errors surface there.
- Unit tests for pure logic: SEO score, publish checks, slug rules, the JSON to text derivation, the import conversion. Pure functions only, so no browser is needed.
- Server action tests that call actions with no session, an editor session and an owner session, asserting the result.
- End to end checks with `curl` against a preview deployment for status codes, headers, redirects, `noindex` on admin, canonical tags, and JSON-LD validity.
- Visual check of the post page against the current live version at 375, 768 and 1440 pixel widths before cutover.
- Lighthouse CI with the existing `lighthouserc.json` budgets on the list and a post page.
- State verified, not assumed: each acceptance line is checked and reported with the evidence.

## 16. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Next.js 16 APIs differ from expectations | Rework in phases 1 and 5 | Phase 0 reads the installed docs and spikes each API first |
| Editor output cannot reproduce the current layout | Visual regression | Own React mapper, parity diff, mobile check, flag-based rollback |
| Database outage takes the Journal down | Public pages fail | Statically served pages with revalidation keep serving the last good copy, queries fail soft, enquiries still email |
| Cron missed or late | Scheduled posts publish late | Short interval, health page shows last run, manual publish always available |
| Auth misconfiguration exposes admin | Content tampering | Server-side checks in every action, allowlist, security review, audit log |
| Content rules drift between the workspace and the admin | Rule violations ship | Phrase lists in one file, referenced from CLAUDE.md and RULES.md wording, unit tests |
| Scope creep into a general CMS | Delay | Non-goals in section 3, anything else goes to the later list |
| Image placeholder and upload cost | Slow admin, storage cost | Size caps, generated placeholders, blob cost reviewed after phase 3 |
| Two sources of post truth during migration | Confusing edits | Flag-based single source, freeze JSON edits at cutover, remove bodies after a week |

## 17. Environment variables (names only)

| Name | Phase | Purpose |
|---|---|---|
| `DATABASE_URL` | 1 | Postgres connection, provided by the Marketplace integration |
| `AUTH_SECRET` | 1 | Session signing |
| `AUTH_RESEND_KEY` or the existing `RESEND_API_KEY` | 1 | Sign-in links |
| `ADMIN_ALLOWLIST` | 1 | Seed owner email, other users live in the database |
| `BLOB_READ_WRITE_TOKEN` | 3 | Blob uploads |
| `CRON_SECRET` | 5 | Authorizes the scheduled publish route |
| `INDEXNOW_KEY` | 5 | Ping key, matching the public key file |
| `JOURNAL_SOURCE` | 4 | `json` or `db` |

Values go only in Vercel environment variables and the Keychain, never in the repo.

## 18. After launch

Candidates, only if the need appears: tables and richer embeds, post series, an admin-side translation field, comments with a spam filter, passkeys, tag taxonomy, and editing the service and works pages through the same admin.

## 19. Open questions

1. Approve D1 to D9, or change any of them?
2. Who else needs an editor account besides the founder?
3. Should archived posts return 410 or redirect to the Journal by default?
4. Is the enquiries inbox in scope for this round, or later?
5. Should the admin live at `/admin` on `studio.sliiqque.space` (recommended) or on its own subdomain?
6. Do you want category pages indexed from day one?

## 20. Implementation notes (2026-10-31)

What was built follows this plan except for the points below. See [journal-admin-guide.md](journal-admin-guide.md) for how to run and deploy it.

| Plan | What was done and why |
|---|---|
| D4: Auth.js with an email link | A small custom flow from Next's own authentication guide: hashed one-time links, server-side sessions stored hashed, rate limits, role checks in every action. It avoids a beta dependency and an adapter for two or three users. It still needs the planned security review before cutover |
| D1/D2: Neon serverless driver | Plain `postgres` (postgres.js) with Drizzle, which works with a local database and with Neon's pooled URL. No cloud database was created |
| D3: direct client upload to Blob | Uploads go through a route handler with a 4 MB cap, and the browser shrinks large photos first. The server re-encodes every image and strips metadata. Direct-to-Blob upload is still possible later |
| Section 6: unique media URL | The URL is not unique, so an image that ships in `public/img` can have one row per use with its own alt text. Four images are reused across posts with different alt text |
| Section 8: search vector, table block, internal link suggester, dashboard check summary | Not built |
| Section 9: category pages, table of contents, automatic related posts, search | Not built. Related posts are hand-picked only. These would change the public pages, so they should follow cutover, not precede it |
| Phase 5: Vercel Cron config | The route exists and is secured with `CRON_SECRET`, but `vercel.json` was not added: Vercel's Hobby plan only allows daily cron jobs and a more frequent schedule fails the deployment |
| Phase 7: enquiries inbox and newsletter | Not started |
| Section 12: CSP | Done with a per-request nonce for `/admin` only |
| Site structure | Public pages moved into an `(site)` route group so `/admin` can have its own layout. URLs are unchanged |

Extra work that the plan implied: the journal reader (`src/lib/journal.ts`) with the `JOURNAL_SOURCE` flag, the one-time import script, and the post data consumers (sitemap, feed, `llms.txt`, home, service pages) now go through it.

Verification done: 13 unit tests; a side-by-side comparison of 17 rendered surfaces against the original code in both `json` and `db` mode (identical apart from added heading ids); end-to-end runs in a real browser for sign-in, editing, publishing, revalidation, redirects, preview, scheduling, the guardrail blocks, the editor role limits and the Content Security Policy.

Not verified: Vercel Blob, real email delivery, any Vercel deployment, the Lighthouse budgets on the new pages, and a formal security review.
