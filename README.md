# SLIIQQUE Creative Studio

The website for SLIIQQUE's creative-production division: a premium creative studio in Lagos, Nigeria producing AI commercials, AI UGC and digital humans, AI product and fashion photography, and brand launch campaigns for brands in Nigeria, Africa and worldwide.

**Live:** [https://studio.sliiqque.space](https://studio.sliiqque.space)

**Documents:** the journal admin plan and guide are in `docs/` ([plan](docs/journal-admin-cms-plan.md), [guide](docs/journal-admin-guide.md)). The growth plan, keyword master list and journal drafts are in the workspace at `Documents/Sales/` (`SLIIQQUE-Studio-Social-Content-Plan-Nov-Dec-2026.md`, `SLIIQQUE-Studio-Keyword-Master-List-Oct2026.md`, `SLIIQQUE-Studio-Journal-Drafts-Nov-Dec-2026.md`).

SLIIQQUE runs two divisions under one studio, founded 22 December 2025 by Gabriel Njoabozia:

| Division | Site | What it does |
|---|---|---|
| **Creative Studio** (this repo) | `studio.sliiqque.space` | AI commercials, AI UGC, digital humans, AI photography, brand launches |
| **Product & Engineering** | `sliiqque.space` | Websites, AI bots and agents, SaaS interfaces, workflow automation |

They are separate Next.js codebases and separate deployments. This site links to the other (home page, about page, footer, FAQ) and vice versa — see `PRODUCT_ENGINEERING` in `src/lib/seo.ts`.

---

## Tech stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Language | TypeScript (strict) |
| Styling | Hand-written CSS (`src/app/site.css`), no utility framework |
| Fonts | Syne (display) and DM Sans (body), via `next/font/google` |
| Images | `next/image`, source files in `public/img` |
| SEO | Next.js `metadata` API, JSON-LD, `sitemap.ts`, `robots.ts`, `manifest.ts`, `llms.txt` / `llms-full.txt` |
| Hosting | Vercel |

No animation library. Page content lives in two JSON files and a couple of TypeScript data modules. The Journal can be served from either `src/data/content.json` or the admin database (Postgres through Drizzle, with Tiptap for editing, images in Vercel Blob), chosen by `JOURNAL_SOURCE`; see [docs/journal-admin-guide.md](docs/journal-admin-guide.md). Scroll-reveal and the scroll-progress bar are plain React + `IntersectionObserver` / scroll events.

Requires Node.js 18.18 or newer.

---

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000 (or the next free port)
npm run build && npm start
```

| Command | What it does |
|---|---|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build. Also prerenders every static route and the sitemap |
| `npm start` | Serve the production build |

Copy `.env.example` to `.env.local` and fill in real values for local dev — `.env.local` is gitignored and never committed.

| Variable | Required | Used for |
|---|---|---|
| `RESEND_API_KEY` | Yes | `/api/contact` (`src/app/api/contact/route.ts`) emails submissions from the contact form and the footer newsletter sign-up to `hello@sliiqque.space`, via [Resend](https://resend.com). Without it, the route returns a clear "not yet configured" error and the form shows a visible fallback (email us directly) instead of silently failing. Get a key at [resend.com/api-keys](https://resend.com/api-keys). |
| `RESEND_FROM` | No | The verified "From" address, e.g. `SLIIQQUE Studio <notifications@sliiqque.space>`. Unset, it falls back to Resend's shared `onboarding@resend.dev` sandbox address, which only delivers to the email on the Resend account itself — fine for a first test, not for real visitor submissions. |

To enable real delivery for live visitors: create a Resend account, verify `sliiqque.space` as a sending domain (Resend will give you DNS records to add at your registrar), set `RESEND_FROM` to an address on that domain, then add both variables to Vercel's project environment variables and redeploy. Restart `next dev` (or `next start`) after changing `.env.local` — Next.js only reads env files at server start.

---

## Routes

| Route | Description |
|---|---|
| `/` | Home: hero, about, selected work, services, process, pricing, ecosystem callout, journal preview |
| `/about` | Story, how we work, studio standards, ecosystem callout, FAQ |
| `/pricing` | Full rate card: monthly retainers, plan finder, one-off projects, add-ons, payment terms and pricing FAQ |
| `/services`, `/services/[slug]` | Five service pages, each with its own JSON-LD `Service` + `FAQPage` schema |
| `/works`, `/works/[slug]` | Three concept case studies: ÀLÀ (skincare), ODÈ (grooming), ÀSE (spirits, age-gated 18+) |
| `/blogs`, `/blogs/[slug]` | Journal. Read from `content.json` (default) or the admin database when `JOURNAL_SOURCE=db`. See the note below |
| `/admin` | Private journal admin: posts, media, categories, redirects, settings, users, audit log. Signed-in only, never indexed. Not part of the public site |
| `/faq` | Site-wide FAQ, also emitted as `FAQPage` schema |
| `/contact` | Contact form (see the gap noted above) and direct contact details |
| `/terms`, `/policies`, `/privacy` | Legal pages, rendered from `src/data/legal.json` |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` | Generated from the `MetadataRoute` conventions |
| `/llms.txt`, `/llms-full.txt` | Plain-text index and full reference for AI assistants, built from the same data at request time |
| `/opengraph-image` | Fallback social-share card (only used where a page sets no image of its own — currently none do) |

**The Journal source.** With `JOURNAL_SOURCE=json` (the default), `src/data/content.json`'s `BLOGS` array controls which posts are live and `BLOGS_LISTED` how many show before "Load more"; a post's full content stays in `POSTS[slug]` even when removed from `BLOGS`. With `JOURNAL_SOURCE=db` the admin controls all of that and `content.json` post bodies are no longer read. At the time of writing `BLOGS` has 7 entries (6 listed) and `POSTS` has 10; the 3 posts not in `BLOGS` are drafts in the database after the import. The old note about publishing by hand-editing JSON still applies in `json` mode.

---

## Project structure

```
public/
  brand/                   Logo marks (app-tile logo, white icon, horizontal wordmark)
  img/                     All photography, named either by AI-generation id
                            or descriptively (ala-*, ode-*, ase-*, fashion-suit-*,
                            digital-human-*, studio-*)
src/
  app/
    page.tsx                       Home
    about/, services/, works/,     One folder per route; [slug] folders use
      blogs/, faq/, contact/,      generateStaticParams + generateMetadata
      terms/, policies/, privacy/
    layout.tsx                     Root layout: fonts, global <head> metadata,
                                    Organization/WebSite JSON-LD, Nav, Footer
    site.css                       The entire stylesheet (one file, commented
                                    by section)
    sitemap.ts, robots.ts,         SEO file conventions
      manifest.ts, opengraph-image.tsx
    llms.txt/, llms-full.txt/      Route handlers serving src/lib/llms.ts output
  components/
    Nav.tsx, NavLinks.tsx,         Header, nav links + mobile menu,
      ScrollProgress.tsx           scroll-progress bar
    Footer.tsx                     Footer columns and social/ecosystem links
    Home.tsx                       All homepage sections
    Img.tsx                        Thin wrapper over next/image for public/img
    JsonLd.tsx                     Renders one or more schema.org <script> blocks
    LegalPage.tsx                  Shared layout for Terms/Policies/Privacy
    Accordion.tsx, Awards.tsx,     Reusable UI building blocks
      Stats.tsx, Pricing.tsx,
      FaqList.tsx, cards.tsx, ui.tsx
    Reveal.tsx                     Scroll-reveal wrapper (IntersectionObserver)
    AgeGate.tsx                    18+ gate for the ÀSE (spirits) case study
    DemoForm.tsx                   Contact form — see the gap noted above
  data/
    content.json                  Nearly all page copy and image ids: HERO,
                                    ABOUT, ABOUT_PAGE, WORKS, CASES, SERVICES,
                                    BLOGS, POSTS, PLANS, PROJECT_ROWS, SITE,
                                    CONTACT, NOT_FOUND, STANDARDS_ROWS, etc.
    legal.json                     Terms, Studio Policies and Privacy Policy text
    services.ts                    Service-page detail content (answers, FAQs,
                                    pricing, galleries) + the site-wide FAQ list
  lib/
    data.ts                        Typed re-exports of content.json / legal.json
    seo.ts                         SITE_URL, BRAND_DESC, KEYWORDS,
                                    PRODUCT_ENGINEERING, pageMeta() (the one
                                    function every page's metadata goes through),
                                    and the JSON-LD builder functions
    llms.ts                        Builds llms.txt and llms-full.txt from the
                                    data above
```

---

## Content model

Almost everything a non-developer would want to change lives in `src/data/content.json` or `src/data/services.ts` — prices, copy, image filenames, FAQ answers. A few things to know before editing:

- **Images** are referenced by filename only (e.g. `"ode-portrait.jpg"`); the actual files live in `public/img/`. `Img.tsx` builds the `/img/<id>` path and passes it to `next/image`.
- **One function builds every page's metadata.** `pageMeta()` in `src/lib/seo.ts` takes `{ title, description, path, keywords, image, ... }` and returns title (with the `%s | SLIIQQUE Studio` suffix), description, canonical, Open Graph and Twitter Card metadata together, so a page can't have its OG tags drift from its `<title>`. Every route currently sets its own `image`, so no page falls back to the generic `/opengraph-image` card.
- **`CONTENT_UPDATED`** in `src/lib/seo.ts` drives the sitemap's `lastModified` for most pages. Bump it when copy changes — a build alone is not a content change.
- **Structured data** lives next to each page (`JsonLd` component), not in a central file, so it's easy to check a page's schema matches what's actually on the page. `organizationSchema()` and `websiteSchema()` in `lib/seo.ts` are the two site-wide nodes, rendered once in the root layout.

---

## SEO, AEO and LLM visibility

This site is built to be found by search engines, quoted by AI answer engines, and recommended by AI assistants, not just indexed:

- **Every page** sets its own title, description, canonical, keywords, Open Graph and Twitter Card metadata through `pageMeta()`, and its own share image (see above) — no page relies on the generic fallback card.
- **JSON-LD** on every page: `Organization` + `WebSite` sitewide; `Service`, `FAQPage`, `BreadcrumbList`, `CreativeWork`, `CollectionPage`, `AboutPage`, `ContactPage` and `BlogPosting` as appropriate per page.
- **Copy is written to be quoted directly**: service pages open with a direct, factual "short answer" paragraph before any marketing copy, and FAQs state prices, timelines and policies as plain facts (this is what AI answer engines lift verbatim).
- **`sitemap.ts`** includes Google's image-sitemap extension (`images[]`) on every page that has photography, so the studio's visuals surface in Image Search and AI crawls, not just its text.
- **`robots.ts`** explicitly allows the major AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bytespider, etc.) alongside standard search bots — the goal is to be crawled and cited, not blocked.
- **`/llms.txt`** (short index, llmstxt.org format) and **`/llms-full.txt`** (full reference: every service, price, policy and FAQ answer) are generated at request time from the same data files everything else reads, so they can't drift from the live site.
- **`manifest.ts`** provides a web app manifest for installability and additional metadata signals.

When changing a price, a service, or any other fact that appears in more than one place, check `src/data/content.json`, `src/data/services.ts` and `src/lib/seo.ts` — `pageMeta()`, the JSON-LD builders and `llms.ts` all read from the same source data, so a single edit there is usually enough.

---

## Design system

- **Palette:** white/light background, near-black ink text, SLIIQQUE orange as the single accent. The one exception is the scroll-progress bar, which uses an orange → blue → purple gradient shared with the Product & Engineering site.
- **Type:** Syne (bold, uppercase) for display and headings; DM Sans for body copy. Nav items and the nav CTA are uppercase, bold and slightly tracked out.
- **Logo:** `src/components/Logo.tsx` — an SVG Syne wordmark, not an image file, so it stays crisp at any size (Brand Book §8).
- **Motion:** `Reveal.tsx` fades/slides elements in on scroll via `IntersectionObserver`; respects `prefers-reduced-motion`. `ScrollProgress.tsx` is a fixed gradient bar at the top of every page, filled by scroll position.
- **Sections:** most pages compose from a small set of primitives — `PageHero`, `SecHead`, `Reveal`, `Accordion`, `Awards`, `Stats`, `Btn` (see `src/components/ui.tsx`) — so new pages stay visually consistent without new CSS.

---

## Deployment

Hosted on Vercel, deployed from this repo. `npm run build` prerenders every static route; the sitemap, robots.txt, manifest and `llms*.txt` are all generated at build/request time, not hand-maintained files.

After a deploy, submit `https://studio.sliiqque.space/sitemap.xml` in Google Search Console and Bing Webmaster Tools, and spot-check a few pages with Google's Rich Results Test.

---

## Current facts (keep in sync with the data files)

| Item | Value | Source |
|---|---|---|
| Founded | 22 December 2025, by Gabriel Njoabozia | `src/lib/seo.ts` (`organizationSchema`) |
| Location | Lagos, Nigeria; works with clients in Nigeria, Africa and worldwide | — |
| Contact | hello@sliiqque.space · +234 704 100 0085 (call/WhatsApp) | `src/data/content.json` (`SITE`, `CONTACT`) |
| Retainers | ₦150,000 / $280, ₦350,000 / $650, ₦750,000 / $1,400 per month | `src/data/content.json` (`PLANS`) |
| One-off projects | AI Commercial from ₦350,000/$650 · Product Photo Pack ₦75,000/$140 · Custom Digital Human ₦150,000/$280 · Brand Launch Campaign ₦900,000/$1,700 | `src/data/content.json` (`PROJECT_ROWS`) |
| Legal docs version | 1.0, effective 4 October 2026 | `src/data/legal.json` |

If any of these change, update the data file and bump `CONTENT_UPDATED` in `src/lib/seo.ts`.

---

## License

Private. All rights reserved, SLIIQQUE Studio.
