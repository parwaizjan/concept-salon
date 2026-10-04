# Decision Log

Append-only. Each entry: ID, date, decision, rationale, alternatives considered.

Context: `concept-salon` is the third entry in the Zuvo Web Studio Express concept
series (after `concept-laundry-shop` and `concept-bakery`). It is built to be cloned
and rebranded quickly for paying salon clients. See `AGENTS.md` for the rules.

---

## D-S01 — Base: port `concept-bakery`'s structure

- **Date:** 2026-10-02
- **Decision:** Build `concept-salon` from the structure and patterns of
  `concept-bakery`: Astro Content Collections for services/categories/page copy, a
  `src/data/site.ts` single source of truth, `src/i18n/ui.ts` UI catalog, a Google
  Sheet pipeline for owner-editable prices, and the same multi-page shape
  (home / list / gallery / about / visit).
- **Rationale:** Bakery is the most recent concept and its domain maps cleanly onto a
  salon (menu≈services, products≈treatments, order≈appointment). It already ships
  the Sheet reader, gallery, visit/map and translation scaffolding we need. Reusing
  it keeps turnaround fast and the toolchain familiar.
- **Alternatives:** `concept-laundry-shop` (single-page + JSON catalogs — rejected:
  salon benefits from a separate gallery and service page); `zuvo-astro-starter`
  (rejected: more work, no Sheet/content pipeline); building fresh (rejected: no
  reuse benefit).

## D-S02 — Toolchain: latest Astro 7 stack on pnpm

- **Date:** 2026-10-02
- **Decision:** Pin the current Astro 7 line: **Astro 7.3.5**, **Tailwind CSS
  4.3.3** via `@tailwindcss/vite` 4.3.3, **`@astrojs/cloudflare` 14.3.3**,
  **`@astrojs/sitemap` 3.7.4**, **`@astrojs/check` 0.9.10**, **TypeScript ^6.0.3**,
  **Node 22**, **pnpm 12.5.1**. `wrangler` pinned to one exact recent release that
  satisfies pnpm 12's 24h `minimumReleaseAge` gate.
- **Rationale:** "Latest versions" on the current toolchain, matching the Astro 7
  siblings (`concept-laundry-shop`, `zuvo-studio-express`) so the three concepts
  share one mental model and one dependency surface.
- **TypeScript exception:** the registry's latest is TypeScript 7, but `astro check`
  still relies on the TypeScript 6 programmatic API. Pin `^6.0.3` until `astro check`
  supports TS 7. This mirrors `concept-laundry-shop` D-016.
- **Alternatives:** stay on bakery's Astro 5.14 / npm (rejected: user wants latest);
  TypeScript 7 (blocked by `astro check`).

## D-S03 — Adapter and static output

- **Date:** 2026-10-02
- **Decision:** Use `@astrojs/cloudflare` with `output: 'static'`,
  `session: false` and `imageService: 'compile'`. All routes are prerendered; no
  on-demand/SSR code ships.
- **Rationale:** The adapter is the current official Cloudflare integration and
  matches the sibling Astro 7 projects. Disabling sessions avoids a KV namespace;
  `compile` optimizes imported content images at build time (Sharp → WebP
  variants) without the Cloudflare Images binding. The full-bleed hero uses
  pre-sized WebP via plain `<img>`/CSS.
- **Alternatives:** bakery's adapter-less static `dist/` + `assets.directory`
  (works, but diverges from the Astro 7 siblings); SSR (rejected: not needed, breaks
  the zero-cost/static rule).

## D-S04 — Core feature set

- **Date:** 2026-10-02
- **Decision:** The demo showcases five things: **service + price list**,
  **gallery of work**, **WhatsApp appointment request**, **testimonials**, and a
  **price estimator / package builder**. Stylist profiles and an offers/promotions
  section are **out** of the baseline (they are paid add-ons on express).
- **Rationale:** These are exactly the features express markets for the salon
  baseline (`docs/strategy.md` §"Salon | Service + price list, gallery, appointment
  request"). The estimator and date/time picker make the pitch memorable without
  adding a backend.
- **Alternatives:** full booking system (rejected: paid add-on, needs a backend);
  stylist profiles (rejected: add-on, more content to maintain per clone).

## D-S05 — Appointment flow: WhatsApp + date/time picker, no calendar

- **Date:** 2026-10-02
- **Decision:** The visitor selects services, sees an indicative total, chooses a
  preferred date and one or more preferred time slots, and taps a WhatsApp button.
  WhatsApp opens with an itemized request addressed to the salon. No calendar sync,
  no availability check, no payment. The owner confirms the real slot in chat.
- **Rationale:** Matches how salons already work and keeps the site static and free.
  A picker UI raises perceived quality versus a bare "chat on WhatsApp" button while
  still producing an ordinary WhatsApp message.
- **Alternatives:** plain message only (rejected: weaker pitch); native Google
  Calendar embed (rejected: third-party, not owner's workflow, privacy); real
  booking (deferred, see express add-on).

## D-S06 — Owner edits services/prices via a Google Sheet

- **Date:** 2026-10-02
- **Decision:** The service list and live prices come from a shared, free Google
  Sheet. The demo fetches the public Sheet in the browser at runtime
  (`mode: "runtime"`); production clones fetch during the build and redeploy
  (`mode: "build"`). Leaving `sheetId` empty runs entirely from the content
  collections. Owner does not add new categories.
- **Rationale:** Salon prices change often; the owner must update them for free with
  minimal tech skill, and no CMS may be introduced. Same proven mechanism as bakery.
- **Alternatives:** agency-managed files only (rejected: slower for frequent price
  changes); a CMS/admin (rejected by rule §3.4).

## D-S07 — English first, translation-ready

- **Date:** 2026-10-02
- **Decision:** Ship **English only** in the demo: `locale.enabled: ['en']`. The
  `Locale` type is `'en' | 'si' | 'ta'`, localized fields (`LocalizedText`) exist on
  all content, `src/i18n/ui.ts` is structured for `si`/`ta`, and locale routing is
  configured so enabling a language is a config + content change, never a refactor.
- **Rationale:** User direction: English first, translations later, but easy to add.
  Matches bakery's trilingual architecture while keeping the shipped surface small.
- **Alternatives:** trilingual now (rejected: translations not yet available);
  English-only hardcoded (rejected: violates rule §3.6).

## D-S08 — Design direction: modern elegant, warm neutral + rose

- **Date:** 2026-10-02
- **Decision:** Warm neutral canvas (cream/sand) with charcoal text and a
  rose/terracotta primary accent, plus a muted sage/olive secondary. Elegant serif
  display type, clean sans body. Generous whitespace, hairline borders, minimal
  shadows. Works for all-gender salons; not overly feminine or luxury-dark.
- **Rationale:** Chosen by the owner of the concept (see question round). Distinct
  from laundry's cool blue and bakery's warm crumb-orange while still feeling
  premium and local.
- **Alternatives:** luxe dark + gold (rejected: heavier, pricier feel);
  fresh sage minimal (rejected: closer to spa); bold editorial (rejected: less
  broadly sellable).

## D-S09 — Demo brand is invented

- **Date:** 2026-10-02
- **Decision:** The demo uses an invented placeholder salon: **Amara Studio**,
  Colombo 07, LKR pricing, placeholder WhatsApp number. Real clone values replace it
  via `docs/CUSTOMIZATION.md`.
- **Rationale:** The concept must be pitchable without waiting on a real client, and
  must never use another business's trademark (express `docs/demos.md`).
- **Alternatives:** use a real salon (rejected: permissions/trademark); no brand
  (rejected: weaker demo).

## D-S10 — Demo domain, no indexing, private repo

- **Date:** 2026-10-02
- **Decision:** Deploy to **https://demo-salon.zuvo.lk** (`workers_dev: false`).
  `indexable: false` plus the `X-Robots-Tag: noindex` header in `public/_headers`
  keep the demo out of search. Worker name `concept-salon`; source is a private
  GitHub repo `parwaizjan/concept-salon`. Indexing turns on in three places only
  (see rule §3.5 and `docs/CUSTOMIZATION.md`).
- **Rationale:** Demo is a pitch tool shared by link; real clones want SEO. One flag
  plus one header plus `siteUrl` control both.
- **Alternatives:** index the demo (rejected by rule §3.5).

## D-S11 — Imagery: licensed stock placeholders

- **Date:** 2026-10-02
- **Decision:** Use licensed-free stock (Unsplash/Pexels) or generated placeholder
  art for hero, gallery and service imagery, with a documented swap checklist.
  Images are pre-sized and served with plain `<img>`.
- **Rationale:** Fast, free, legally safe, and demonstrates the layout; a client's
  own photos replace them on clone.
- **Alternatives:** wait for client photos (rejected: blocks the demo).

## D-S12 — Documentation-first

- **Date:** 2026-10-02
- **Decision:** Write and maintain `AGENTS.md`, `README.md` and `/docs` **before**
  application code, and keep them current as the source of durable context.
- **Rationale:** Preserves decisions across conversations; required by the studio
  workflow.
- **Alternatives:** code-first (rejected).

## D-S13 — Page structure

- **Date:** 2026-10-02
- **Decision:** Multi-page site: **Home**, **Services** (service + price list),
  **Book** (estimator + date/time picker), **Gallery**, **About**, **Visit**
  (location/hours/contact), plus `404` and generated `robots.txt`. Privacy/Terms are
  deferred (see open questions).
- **Rationale:** Mirrors bakery, gives gallery and booking room to breathe, and
  keeps each page's job obvious on mobile. A dedicated `/book` page carries the
  estimator + picker, with entry points from the header, sticky bar and CTAs.
- **Alternatives:** single-page with anchors (rejected: salon has more imagery and
  two distinct jobs — browse and plan a visit).

## D-S14 — No analytics in the concept

- **Date:** 2026-10-02
- **Decision:** The concept ships without analytics or pixels. Cloudflare Web
  Analytics and/or Meta Pixel may be added per client later behind config, with a
  privacy page added at the same time.
- **Rationale:** Keep the concept lean and avoid a required consent/privacy surface;
  analytics is not part of the salon pitch.
- **Alternatives:** ship Cloudflare Web Analytics now (deferred).

## D-S15 — Sticky appointment bar, no floating button

- **Date:** 2026-10-02
- **Decision:** On mobile, a sticky bottom **"Book on WhatsApp"** bar carries the
  primary action and the current estimate; it only appears once a service is
  selected (or is a plain "Book now" link before that). There is no floating action
  button; every other CTA is an inline button.
- **Rationale:** Mirrors bakery's sticky order bar, keeps the action thumb-reachable
  without competing floating elements, and shows the running total where it matters.
- **Alternatives:** floating WhatsApp bubble (rejected: overlaps the sticky bar and
  competes with the estimator); header CTA only (rejected: too easy to miss while
  scrolling the price list).

---

## Open questions

Copied from `AGENTS.md` §8 and tracked there:

- Setup CLI vs manual rebrand checklist.
- Whether clones need Privacy/Terms pages.
- Sheet build trigger for production clones.
- Where `si`/`ta` service names come from once translated.
- Capturing `public/demos/salon.webp` for express.
- Native-speaker review of translations before pitching.
