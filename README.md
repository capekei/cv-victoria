# Victoria Zeder — Visual Artist Portfolio

Editorial-quality single-page site for [victoriazeder.com](https://victoriazeder.com): Miami-based visual artist working in 24k gold leaf, acrylic ink, thread, and encaustic. Living Systems (2026).

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| React | 19 |
| Styling | Tailwind CSS v4 (`@theme inline` tokens) |
| Animation | GSAP 3 + Lenis (bridged to ScrollTrigger in `scroll-panel.tsx`) |
| Validation | Zod 4 |
| Contact | Server Action → Nodemailer over SMTP |
| Rate-limit | Upstash Ratelimit (falls back to in-memory) |
| Hosting | Vercel (all routes statically prerendered) |

## Routes

| Path | Kind | Notes |
|---|---|---|
| `/` | static | Identity panel + scroll panel (statement, works, process, exhibitions, education, contact CTA) |
| `/contact` | static | Multi-phase pinned scroll experience: quote → invitation words → contact form → "my best work." postscript |
| `/sitemap.xml`, `/robots.txt`, `/apple-icon`, `/icon.svg` | static | SEO + social surface |

## Local development

```bash
pnpm install
cp .env.example .env.local   # fill SMTP_* + optional UPSTASH_*
pnpm dev
```

Dev server runs on `http://localhost:3000`. `pnpm build` + `pnpm start` for production parity.

## Quality gates

```bash
pnpm typecheck   # strict TS, zero `any`
pnpm lint        # eslint-config-next
pnpm test:e2e    # Playwright smoke (8 tests, chromium only, ~4s)
```

All three must pass before merge.

## Architecture in 60 seconds

- **Data** — `app/_lib/artist.ts` is the single source of truth. Person, works, exhibitions, education, process, contact info all live there. Server components read it; JSON-LD is generated from the same shape in `app/_lib/jsonld.ts`.
- **Private folders** — `app/_components/` (UI), `app/_lib/` (data + serialization + Zod schemas), `app/_actions/` (Server Actions). The `_` prefix keeps them out of the route tree.
- **Contact experience** — `app/_components/contact/ContactExperience.tsx` orchestrates five phases via a single raw-scroll handler. Lenis provides momentum; phase progress functions drive opacity/transform/blur. Viewport-fixed `VideoBackground` + `GrainOverlay` layer at z-index 0; phase content layers above.
- **Email** — form posts to the `submitContact` Server Action, which rate-limits by IP (Upstash preferred, in-memory fallback), validates via Zod, strips CRLF from header-bound fields, escapes HTML in the email body, and delivers via Nodemailer.

## Deploying

Connected to Vercel. Pushing to `main` deploys production. Preview URLs for every other branch. Zero custom CI config — Next.js + Vercel defaults.

## Project conventions

- **Spanish UI text on DR projects; English here** (per global CLAUDE.md rules).
- **No brand color or font changes without approval.**
- **Strict TS, no `any`.**
- **Inline styles are acceptable only for GSAP-driven values or CSS-custom-property bridges** — static styling goes through Tailwind.
