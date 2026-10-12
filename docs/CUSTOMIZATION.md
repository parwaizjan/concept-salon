# Customization — cloning into a real salon

This is the checklist for turning the concept into a specific salon's live site.
It must be quick and mechanical. If a step is unclear or missing, fix this doc.

## 0. Before you start

- Collect from the owner (see `docs/CLIENT-CHECKLIST.md`): business name, logo,
  brand colors, WhatsApp number, phone, address, Google Maps location, opening
  hours, social links, services (categories, names, prices, durations, photos), and
  any Sinhala/Tamil names.
- Confirm the domain (usually `<salon>.zuvo.lk`, or the owner's own domain).
- Confirm whether the owner wants translations now or later.

## 1. Create the new project

1. On GitHub, use this repo's **Use this template** button to create a new private
   repo (do **not** fork — start with clean history).
2. Clone it locally and `corepack pnpm install`.

## 2. Rebrand

1. **`src/data/site.ts`** — edit every value:
   - `name`, `tagline`, `logo`
   - `whatsappNumber` (digits + country code, no `+`), `phone`, `email`, `address`,
     `mapEmbedUrl`, `mapLink`
   - `hours`, `socials`, `appointment` (lead time, slots)
   - `indexable: true` for a real salon (and see "Turning on indexing" below)
   - `siteUrl` to the salon's real domain, `currency` if different
   - `heroVariant` if the owner wants a different hero
2. **`src/styles/theme.css`** — set the brand colors/fonts (CSS variables). Do not
   edit component styles for color.
3. **`public/`** — replace `logo.svg`, `favicon.svg`, and the Open Graph image
   (`og.jpg`, 1200×630).
4. **Images** — the concept ships placeholder SVG art in `public/images/`. For a
   real salon:
   - **Hero** — `site.heroImage` (wide) and `site.heroImageMobile` (portrait) in
     `src/data/site.ts`; the portrait is served below `sm`, the wide image above.
     If you swap in a new photo, also update `site.heroImageSrcSet` with its ~960px
     and full-width WebP variants.
   - **About** — replace `src/assets/about.jpg` (1200×900, 4:3).
   - **Gallery** — add photos under `src/assets/gallery/`, import them in
     `src/data/gallery.ts`, and give each an `altKey` present in every enabled
     language.
   - **Services** — add photos under `src/assets/services/` named after the service
     id (e.g. `gel-manicure.jpg`); they are picked up automatically by
     `src/data/service-images.ts`. Services without a photo fall back to
     `public/images/placeholder.svg`.

### Turning on indexing (do not miss this)

Setting `indexable: true` (step 1) also removes the demo standard automatically:
the sample ribbon and the `[DEMO: Salon]` source tag are gated on `indexable`
(`src/lib/demo.ts`), so a live salon clone shows neither. No extra step needed.

The concept ships invisible to search engines on purpose. A **live salon must be
findable**, so all three of these have to change together or the site will stay
out of Google even when it looks live:

1. **`src/data/site.ts` → `indexable: true`.** This enables the sitemap and makes
   `src/pages/robots.txt.ts` emit an allow-all `robots.txt`.
2. **`public/_headers` → delete the `X-Robots-Tag: noindex, nofollow` line.** This
   header overrides the meta tag, so leaving it in keeps the whole site invisible.
3. **`src/data/site.ts` → `siteUrl`** must be the salon's real domain, not the demo
   domain, or canonical/hreflang/sitemap URLs will point at the demo.

Then confirm on the live domain (not `preview`):

- `robots.txt` shows `Allow: /` (not `Disallow: /`).
- Page head has no `noindex`; `<html lang>` is right.
- `curl -sI https://<domain>/ | grep -i x-robots` returns nothing.
- `https://<domain>/sitemap-index.xml` returns `200`.

## 3. Content

1. Delete the demo services/categories under `src/content/`.
2. Add the salon's categories and services (names, descriptions, default prices,
   durations, images). Optimize images before committing.
3. Update About/Gallery/Visit page copy.
4. Review every string in `src/i18n/ui.ts` — the demo brand name and any
   salon-specific wording must be replaced.
5. If the owner wants Sinhala/Tamil: add `si`/`ta` values to `LocalizedText` fields,
   add `src/content/pages/<page>/{si,ta}.md`, fill the `si`/`ta` catalogs in
   `ui.ts`, then add the locales to `site.locales` (see §7).

## 4. Google Sheet (owner's price editor)

1. Create a new Google Sheet owned by the salon (ideally a dedicated salon Gmail
   they control), and share it with the developer as an editor. Set link sharing to
   viewer if using the default public-read setup.
2. Add the header row and one row per service using the ids from the service files
   (see `docs/CONTENT-AND-SERVICES.md`).
3. Set `site.services.mode = 'build'`, `site.services.sheetId`, and
   `site.services.sheetTab` in `src/data/site.ts`. `scripts/fetch-services.ts` reads
   these automatically.
4. Install the Apps Script on the Sheet that triggers a rebuild on change (the
   event-driven build described in `docs/CONTENT-AND-SERVICES.md`). Prototype this
   once on the concept before cloning so every clone can reuse it.
5. Walk the owner through editing price/duration/availability, then ask them to
   change one price and confirm the live site updates after the rebuild.

## 5. Build and verify

```sh
corepack pnpm check
corepack pnpm lint
corepack pnpm build
corepack pnpm preview
```

Then verify, on a phone-sized viewport:

- [ ] Logo, colors, name, tagline are correct; no leftover demo branding.
- [ ] WhatsApp number is the owner's; no demo numbers anywhere.
- [ ] Services, prices, durations, images are correct.
- [ ] Sheet edits (price + availability) show up on the live page.
- [ ] Appointment flow: select services, pick a date/time, send — the owner receives
      a correct itemized message.
- [ ] Indexing fully on (see "Turning on indexing"): `indexable: true`,
      `X-Robots-Tag` removed from `public/_headers`, `siteUrl` set to the real
      domain; `robots.txt` allows, no `noindex` meta, the header is gone, the
      sitemap returns `200`.
- [ ] Opening hours and Google Map point to the right place.
- [ ] If enabled, the language switcher works and preserves the page.

## 6. Deploy and hand over

1. Follow `docs/DEPLOYMENT.md`: rename the Worker, deploy, attach the domain.
2. Do a final check on the live domain (not just `preview`).
3. Give the owner: the live URL, the Google Sheet link, and a one-page note on how
   to update prices and mark services unavailable.

## 7. Enabling translations later

The site is built for this from day one; enabling a language is a content change,
not a refactor:

1. Add translated content: `LocalizedText` `si`/`ta` fields in services and
   categories, `src/content/pages/<page>/si.md` and `ta.md`, and the `si`/`ta`
   entries in `src/i18n/ui.ts`.
2. Add `'si'` and/or `'ta'` to `site.locales` in `src/data/site.ts`.
3. Rebuild and check the switcher, hreflang, localized WhatsApp messages and the
   date format.
4. Have a native speaker review before pitching (`AGENTS.md` §8).

## Common mistakes

- Leaving `indexable: false` in a production clone.
- Setting `indexable: true` but forgetting to delete `X-Robots-Tag: noindex` from
  `public/_headers`, or leaving `siteUrl` at the demo domain.
- Leaving the demo WhatsApp number or the demo Sheet URL.
- Enabling `si`/`ta` in `site.locales` before the content exists (blank strings).
- Editing colors in components instead of `theme.css`.
- Committing unoptimized multi-megabyte photos.
