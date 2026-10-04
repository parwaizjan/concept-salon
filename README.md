# concept-salon

A reusable, translation-ready concept website for small salons in Sri Lanka.
Visitors browse services and prices, build an estimated appointment, pick a
preferred date and time, and send the whole request to the owner **on WhatsApp**.
No payments, no backend, no monthly cost.

This repository is a **concept / template**. It is shown to salon owners as a live
demo and then cloned and rebranded into that salon's real site. The demo lives at
`https://demo-salon.zuvo.lk`, and is catalogued on `express.zuvo.lk`.

> If you are an AI agent or a developer about to change anything, read
> [`AGENTS.md`](./AGENTS.md) first. It contains the non-negotiable rules.

## Why this exists

Small salons in Sri Lanka take bookings through Facebook, Instagram, WhatsApp and
phone calls. They do not have websites, and they do not want a payment gateway or a
complex booking system. This concept gives them a fast, mobile-first page where
every appointment request arrives as a normal WhatsApp chat they already know how
to handle.

- **Zero running cost** — static files on Cloudflare's free tier.
- **WhatsApp-only appointments** — no forms, no calendar sync, no checkout.
- **Owner-editable services/prices** — via a free Google Sheet (see below).
- **Translation-ready** — English ships first; Sinhala/Tamil structure is in place.
- **Fast to clone** — branding and content are centralized so a rebrand is quick.

## Quickstart

```sh
corepack pnpm install   # install deps (pnpm 12)
corepack pnpm dev       # http://localhost:4321
corepack pnpm build     # static output in dist/
corepack pnpm preview   # preview the built site
corepack pnpm check     # astro check (types + content schema)
corepack pnpm lint      # prettier check
corepack pnpm deploy    # wrangler deploy
```

If `pnpm` is installed globally, drop the `corepack` prefix.

## Documentation

| Doc                                                              | What it covers                                                   |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| [`AGENTS.md`](./AGENTS.md)                                       | Purpose, rules, where to change what, definition of done         |
| [`docs/DECISIONS.md`](./docs/DECISIONS.md)                       | Every locked decision and its rationale                          |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)                 | Stack, folder structure, data flow, i18n, components             |
| [`docs/DESIGN-BRIEF.md`](./docs/DESIGN-BRIEF.md)                 | Pages/sections, mobile-first rules, theme tokens, component list |
| [`docs/CONTENT-AND-SERVICES.md`](./docs/CONTENT-AND-SERVICES.md) | Service data, the Google Sheet, translations                     |
| [`docs/APPOINTMENT-FLOW.md`](./docs/APPOINTMENT-FLOW.md)         | The estimator + date/time picker + WhatsApp flow in detail       |
| [`docs/CUSTOMIZATION.md`](./docs/CUSTOMIZATION.md)               | Clone/rebrand checklist for a real salon                         |
| [`docs/CLIENT-CHECKLIST.md`](./docs/CLIENT-CHECKLIST.md)         | Client-facing intake list and ready-to-send WhatsApp message     |
| [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)                     | Cloudflare Workers, domain, GitHub, indexing headers             |
| [`docs/EXPRESS-HANDOFF.md`](./docs/EXPRESS-HANDOFF.md)           | Exact changes the express.zuvo.lk repo needs to list this demo   |

## Status

Implemented and building clean (`pnpm check` 0 errors, `pnpm lint`, `pnpm build`,
`wrangler deploy --dry-run`). The demo ships with `indexable: false`, an empty
`services.sheetId` (so it runs from the content collections until a Sheet is
connected) and `services.mode: "runtime"`. English is enabled; the `si`/`ta`
structure is in place but not yet translated.

- Home, Services, Book, Gallery, About and Visit pages, plus `404` and `robots.txt`.
- Vanilla service selection + indicative total + date/time picker + WhatsApp
  hand-off (`src/scripts/appointment.ts`).
- Warm Rose theme tokens in `src/styles/theme.css` (plus sage / midnight / citrus
  presets).
- Google Sheet reader shared by the runtime and build-time paths
  (`src/lib/sheet.ts`, `scripts/fetch-services.ts`).
- Photo placeholders in `src/assets/` and a 1200×630 Open Graph image in
  `public/og.jpg`.

Remaining implementation detail: the exact event-driven build trigger for clones.
See `docs/CONTENT-AND-SERVICES.md` and `AGENTS.md` §8.
