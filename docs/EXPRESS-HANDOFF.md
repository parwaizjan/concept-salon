# Express hand-off — listing `demo-salon.zuvo.lk`

This document is for the agent/developer who maintains
`~/Projects/zuvo-studio-express` (**express.zuvo.lk**). It lists the exact changes
needed to list the new salon demo. The `concept-salon` repo must **not** edit the
express repo; apply these there.

The salon category page, offer and add-ons already exist in express (`salon` is in
`src/data/categories.ts` with baseline Rs. 29,500 / renewal Rs. 12,000 and
`demoSlug: 'salon'`). Only the demo is `coming-soon`. Flipping it to `live` is the
core change.

## 1. `src/data/demos.ts` — flip the salon demo to live

Replace the existing `salon` entry:

```ts
  {
    slug: 'salon',
    category: 'Salon',
    tagline: 'Services, prices and appointment requests in one link.',
    url: '',
    screenshot: '',
    features: ['Service list', 'Gallery', 'Appointment request'],
    status: 'coming-soon',
    order: 2,
  },
```

with:

```ts
  {
    slug: 'salon',
    category: 'Salon',
    tagline: 'Services, prices and appointment requests in one link.',
    url: 'https://demo-salon.zuvo.lk',
    screenshot: '/demos/salon.webp',
    features: [
      'Service + price list',
      'Gallery',
      'Price estimator',
      'WhatsApp appointment request',
    ],
    status: 'live',
    order: 2,
  },
```

`CategoryCard.astro` and `DemoPreview.astro` read `getDemo(category.demoSlug)`, so
this single edit makes the home card and `/websites/salon/` show the live demo,
screenshot and link. No page/code changes are needed.

## 2. `public/demos/salon.webp` — add the screenshot

- Capture the live demo and save to `public/demos/salon.webp`.
- Match the existing screenshots: **1280×960 (4:3)**, WebP. `laundry.webp` and
  `bakery.webp` are both 1280×960.
- Capture the mobile/home view (a phone-width screenshot scaled to 4:3 is what the
  other demos use).

## 3. `docs/demos.md` — update the registry

In the **Registry** table, change the salon row:

```md
| Salon | `salon` | Rs. 29,500 | Rs. 12,000 | https://demo-salon.zuvo.lk | `/websites/salon/` | **Live** |
```

In **Live demos**, add a salon line, e.g.:

```md
- **Salon** ("Amara Studio") — service + price list, gallery, price estimator,
  WhatsApp appointment requests, EN (SI/TA ready).
```

## 4. `docs/product.md` — category catalogue table

Change the Salon row's Demo column from `Planned` to
`` `demo-salon.zuvo.lk` ✅ ``.

## 5. `docs/strategy.md` — target categories table

Change the Salon row's Demo column from `Planned` to
`` `demo-salon.zuvo.lk` ✅ ``.

## 6. `docs/roadmap.md` — phase 7 progress

In **Phase 7 — Growth**, update:

```md
- [~] Build the remaining category demos — **laundry ✅, bakery ✅, salon ✅**;
  restaurant, café, spa outstanding.
```

## 7. `docs/decisions.md` — optional note

If desired, add a decision entry recording that the third demo (`concept-salon`)
shipped, and that concept demos are now ported onto the **Astro 7 + Tailwind v4 +
`@astrojs/cloudflare`** toolchain. No decision is strictly required for listing.

## Notes / possible follow-ups

- **Positioning copy:** the category page copy already matches the demo feature set
  (service list, gallery, appointment request). The demo also ships a price
  estimator and testimonials; if you want those reflected in the category page's
  `categoryIncludes`/FAQ, update `src/data/categories.ts` (optional).
- **Languages:** express markets Sinhala/Tamil as paid add-ons. The salon demo ships
  English-only with translation structure in place, which matches that position.
- **Screenshot for the hub** must be captured after the demo is deployed and
  polished; do not advertise the category (or publish conflicting copy) before the
  demo is live.

## What is already in express (no change needed)

- `salon` category entry, page route `/websites/salon/`, baseline/renewal prices,
  includes, add-ons, FAQs, SEO meta.
- Category grid card rendering from `demos.ts`.

Handoff verified against express as of 2026-10-01 (commit state at time of writing).
