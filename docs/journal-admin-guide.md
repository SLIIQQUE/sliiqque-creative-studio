# Journal admin guide

> Purpose: how to run, use and deploy the journal admin that was built from docs/journal-admin-cms-plan.md.
> Owner: Gabriel Njoabozia | Status: Built locally, not deployed | Last reviewed: 2026-10-31

## What exists

The admin lives at `/admin` in the same Next.js app. It has posts (editor, autosave, revisions, scheduling, preview), media, categories, redirects, settings, users and an audit log. The public journal reads from the admin database when `JOURNAL_SOURCE=db`, and from `src/data/content.json` when it is `json` (the default, so nothing changes until you switch).

Not built yet, listed in the plan: the enquiries inbox and newsletter list (phase 7), category pages, a table of contents, and automatic related posts. Related posts are hand-picked only.

## Run it locally

1. Start the throwaway Postgres cluster (one time per login session):
   `/usr/local/opt/postgresql@16/bin/pg_ctl -D ~/.sliiqque-dev/pg-studio -o "-p 54329 -k /tmp" -l ~/.sliiqque-dev/pg-studio.log start`
2. `.env.local` needs `DATABASE_URL` (see `.env.example`). Then `npm run db:migrate` and `npm run db:seed`.
3. Import the existing posts once: `npx tsx --env-file=.env.local scripts/import-journal.mts` (add `--dry` first to see the report). It skips slugs that already exist.
4. `npm run dev`, open `/admin/login`, enter the owner address. With no `RESEND_API_KEY` in development the sign-in link is printed in the terminal running the dev server.
5. Tests: `npm test` runs the unit tests for the document sanitiser, the publish checks, the SEO score, price tokens and dates.

To read the journal from the database locally, run with `JOURNAL_SOURCE=db`.

## Using it

- **Sign in** with an emailed link. It works once and expires in 15 minutes. Only addresses in the Users list can request one.
- **Write** in Posts. Changes autosave a few seconds after you stop typing. Use H2 for sections and H3 for sub headings. The sidebar blocks add images, image pairs, the concept label, service calls to action, YouTube videos and price tokens.
- **Prices** come from the rate card data through price tokens. Do not type a naira or dollar figure into a post, the checks warn you.
- **Publish checks** run live. Blocking checks stop an editor from publishing: no em dash anywhere, no company alias definitions, no off-limits names, no offer of logo creation, a hero image, alt text on every image, an excerpt of 50 to 160 characters, a category and a linked service, and the concept label on concept work. The owner can override a block with a reason, which is logged.
- **Schedule** with a date and time in Lagos time. A Vercel Cron call publishes it when due, see below.
- **Preview** opens the post in a new tab with a banner, for you only.
- **Changing the slug of a live post** adds a redirect from the old address automatically.
- **Roles.** Editors write, publish and manage media and categories. Owners also manage users, settings, redirects, the audit log, override blocks and permanently delete archived posts.

## Deploy

Nothing below has been done. Each step needs your approval because it creates or changes something outside the repo.

1. Create the database: add the Neon integration to the Vercel project. This sets `DATABASE_URL`. Run `npm run db:migrate` and `npm run db:seed` against it with that URL, and set `OWNER_EMAIL` to the real owner address first.
2. Add Vercel Blob to the project. This sets `BLOB_READ_WRITE_TOKEN`. Uploads are capped at 4 MB after the browser shrinks large photos, because the upload goes through a route handler.
3. Set `CRON_SECRET`, and `RESEND_API_KEY` plus a verified `RESEND_FROM` so sign-in links are delivered. Without them production sign-in fails on purpose.
4. Add the scheduler to `vercel.json`:
   `{ "crons": [{ "path": "/api/cron/publish-scheduled", "schedule": "*/5 * * * *" }] }`
   Vercel's Hobby plan only allows daily cron jobs, so on Hobby use a daily schedule and schedule posts for that hour, or move to Pro. A schedule that is too frequent for the plan makes the deployment fail.
5. Run the import against the production database, then deploy with `JOURNAL_SOURCE=json`, check `/admin`, and only then set `JOURNAL_SOURCE=db` and redeploy. To roll back set it to `json` and redeploy.
6. After a week with no problems, remove the post bodies from `src/data/content.json` and update the README.

## Checked so far

Verified locally on 2026-10-31 against the original code:

- With `JOURNAL_SOURCE=json` and with `JOURNAL_SOURCE=db`, the journal list, all 7 live posts, the home page, the 5 service pages, `feed.xml`, `llms.txt` and `sitemap.xml` render the same as before. The one intended difference is that headings gained `id` attributes for deep links.
- Publishing, revalidation, the feed, sitemap and `llms.txt`, slug-change redirects, unpublishing, draft preview, scheduling with the cron route, the em dash block, the editor role limits and script text escaping all behaved as designed in a real browser against a production build.

Not yet checked: Vercel Blob uploads, real email delivery, a deployment on Vercel, and behaviour on a very large post.
