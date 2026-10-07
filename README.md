# SLIIQQUE Studio: Next.js

Next.js 16 (App Router) port of the Halo Studio template in `../halo-template`, rebranded as SLIIQQUE Studio.

Live at **https://studio.sliiqque.space** (its own app and Vercel project; `sliiqque.space` is a separate site). The domain is set once in `SITE_URL` in `src/lib/seo.ts`, and `CONTENT_UPDATED` there feeds the sitemap: bump it when copy changes.
`src/app/site.css` is the template's measured stylesheet, unchanged apart from a tablet hero tweak for the longer name.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

- Copy and image ids: `src/data/content.json` (exported from the template's `scripts/content.py`)
- Pages: `/`, `/about`, `/works`, `/works/[slug]`, `/blogs`, `/blogs/[slug]`, `/contact`, `/404`
- Logo: `src/components/Logo.tsx` (Syne 800 wordmark, Brand Book §8)
- Images in `public/img` are the template author's (TempBix / Framer template licence), swap for your own before publishing.
- Copy is SLIIQQUE's (Creative Studio): sourced from COMPANY.md, the Knowledge Base, brand book and the ÀLÀ / ODÈ / ÀSE / BrandEpics project files. Concept work is labelled as concept; there are no invented clients, testimonials, awards or metrics.
- Still placeholders: all imagery (template photos), social profile URLs, journal dates, and the team portraits on /about.
- Not documented, so left out: phone/WhatsApp number, founding year, creative revision policy, AI-disclosure policy.
