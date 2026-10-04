# Content and services

How services are defined, how the salon owner keeps prices and availability up to
date for free, and how translations will be added.

This doc contains **open decisions** (flagged below). Do not silently pick one —
record the decision in `docs/DECISIONS.md` and remove the flag.

## 1. What is static vs what is live

| Data                                       | Source                                         | Who edits | How often                        |
| ------------------------------------------ | ---------------------------------------------- | --------- | -------------------------------- |
| Service name, category, image, description | Content collections (repo)                     | Developer | Rarely — when a service is added |
| Duration                                   | Content (default), overridden by Google Sheet  | Developer | Rarely                           |
| Price                                      | Default in content, overridden by Google Sheet | Owner     | Often                            |
| Availability                               | Google Sheet                                   | Owner     | Often                            |
| Categories                                 | Content collections                            | Developer | Rarely                           |
| Page copy (about, gallery, visit)          | Content collections                            | Developer | Rarely                           |

Rule of thumb: **the owner edits a spreadsheet; the developer edits the repo.**
The owner does not add new service categories (rule §3.4).

## 2. Content collections

`src/content/services/` — one Markdown file per service:

```yaml
# src/content/services/gel-manicure.md
category: nails
name:
  en: Gel Manicure
  # si / ta added later
description:
  en: A long-lasting gel polish finish.
duration: 60 # minutes
price: 4500 # default in LKR; overridden by the Sheet
available: true # default; overridden by the Sheet
featured: true # shown on the home page
order: 0
```

**The file name (without `.md`) is the service id** and is what the Sheet must
reference. Keep it stable once live.

**Service photos:** drop an image named after the service id into
`src/assets/services/` (e.g. `gel-manicure.jpg`). It is picked up by
`src/data/service-images.ts` — no code change needed. Services without a matching
file fall back to `public/images/placeholder.svg`. Preferred size: 4:3 landscape,
1200×900, JPG or PNG.

`src/content/categories/` — one file per category with localized names and sort
order (`hair`, `colour`, `nails`, `skin`, `bridal`, `waxing`). `src/content/pages/`
— about/gallery/visit copy, one file per locale (`about/en.md`; `si`/`ta` added
later).

`src/content.config.ts` defines and validates these schemas so `pnpm check` catches
mistakes. Build-time Sheet data is written to `src/data/services-live.json` and
merged over these defaults by `src/lib/services.ts`.

New services and photos are added by the **developer** after the owner sends
details.

## 3. The owner's editing surface: Google Sheets

The owner maintains a single Google Sheet with live price and availability. They
already understand spreadsheets and it costs nothing.

### Sheet format

| id             | name (read-only) | price | duration | available | note (optional) |
| -------------- | ---------------- | ----- | -------- | --------- | --------------- |
| gel-manicure   | Gel Manicure     | 4500  | 60       | yes       |                 |
| global-colour  | Global Colour    | 8500  | 90       | yes       |                 |
| bridal-package | Bridal Package   | 45000 |          | yes       | by appointment  |

- `id` matches the service's content file id (the developer sets this when adding
  the service).
- `price` in LKR, numbers only.
- `duration` in minutes, optional (blank = use the value in the repo).
- `available` = `yes` / `no` (or `TRUE` / `FALSE`).
- The owner edits `price`, `duration` and `available` only. They can add a short
  `note`.

### Decisions

- **Mechanism:** the demo uses **runtime browser fetch**; production clones use an
  **event-driven build** (see below). Both read the same simple sheet format.
- **Ownership:** every Sheet is **owner-owned**. Ideally the salon creates a
  dedicated Gmail the owner controls rather than using a personal account; it is
  shared with the developer as an editor, and a last-known-good copy is kept in the
  repo. The concept demo uses a developer-owned Sheet.
- **Access:** the Sheet is link-shared as viewer (prices are not secret). Owners who
  insist on a private Sheet need the optional service-account path noted below.

### Demo: runtime browser fetch

The concept demo fetches the Sheet in the visitor's browser and merges values over
the base content, so price/availability changes appear without a rebuild.

- Endpoint: the **Google Visualization CSV** endpoint
  `…/gviz/tq?tqx=out:csv&sheet=<tab>`, or published CSV. **Verify CORS** from a
  Cloudflare origin with a real fetch before relying on it; the Sheets API v4 with a
  referrer-restricted key is the fallback if a CORS problem appears.
- Cache the successful response in `sessionStorage` for a few minutes to cut
  requests and speed up repeat views.
- **Never guess at CORS** — test it.

### Clones: event-driven build (recommended)

Production clones keep the data static so pages stay fast and reliable:

1. Owner edits price/duration/availability in the Sheet (or clicks a "Publish"
   custom menu item added by the setup script).
2. A Google Apps Script bound to the Sheet fires on change and calls a build
   trigger.
3. The site rebuilds, fetching the Sheet **at build time**, and redeploys.

- Build trigger: prefer a **GitHub Actions `workflow_dispatch`** (Apps Script POSTs
  to the GitHub API with a fine-grained token stored in Script Properties), which
  runs `pnpm build` + `wrangler deploy`. Verify whether Cloudflare Workers Builds
  exposes an inbound deploy hook; if it does, use that instead.
- Debounce triggers (script lock / a short time window) so a burst of edits causes
  one rebuild, not many.
- A failed trigger or build is safe: the previously deployed static site stays live.

**OPEN IMPLEMENTATION NOTE:** the exact build trigger and the Apps Script trigger
type (`onChange` vs a "Publish" menu) are implementation details to finalize while
building. Neither changes the data format or the ownership model.

### Private-sheet option

A build-time fetch can read a Sheet that is **not** public by sharing it with a
Google service account and putting the key in CI secrets. This adds a Google Cloud
project and key rotation per clone, so it is opt-in, not the default. A runtime
browser fetch can never use a private Sheet.

### Cost

- Google Sheets, publishing to web and Apps Script are **free** for a normal Google
  account. No Google Cloud billing account is required for the publish/CSV route.
- Runtime fetch: the Sheet is read in the visitor's browser, so there is **no server
  and no Cloudflare cost**.
- Build-time fetch: the read happens during CI. GitHub Actions free minutes
  (2,000/month on the free plan) comfortably cover the few rebuilds a salon produces
  per day; avoid noisy per-edit rebuilds via debouncing.

### Failure fallback

Both paths must degrade gracefully:

- Render prices/availability from the base content (last known good values under
  version control).
- For runtime fetch, cache the last successful fetch and use it if the network or
  Sheet is unavailable.
- For the event-driven build, the last successful deploy stays live.
- Validate parsed rows; ignore unknown columns; require a known `id`.
- Never block the service list or the WhatsApp button because of a Sheet error — the
  request is an enquiry, so a stale price is not fatal.

## 4. Translations of services

**OPEN DECISION:** Where Sinhala/Tamil service names come from. The concept ships
only `en` (`locale.enabled: ['en']`), so this can be deferred until translations
exist. Options (same as concept-bakery):

- **A. Content collection only** — developer supplies `si`/`ta` names in each
  service file. The Sheet only carries price/duration/availability.
- **B. Sheet carries three name columns** — `name_en`, `name_si`, `name_ta`. Owners
  often cannot comfortably type Sinhala/Tamil.
- **C. Hybrid (recommended)** — Sheet carries `name_en` for quick fixes; developer
  fills `si`/`ta` in the service file.

Regardless of choice, a missing `si`/`ta` value must fall back to `en` rather than
showing an empty string.

## 5. Adding a new service — workflow

1. Owner sends the developer: name, category, price, duration, description, and a
   photo (WhatsApp is fine).
2. Developer optimizes the photo, adds an image under `src/assets/services/`, and
   adds a file under `src/content/services/` with a default price.
3. Developer adds a row with the same `id` to the salon's Google Sheet and tells the
   owner they can now edit its price/duration/availability.
4. `pnpm check && pnpm build`, deploy.

## 6. Demo service list (placeholder)

The demo ships a plausible, invented list across six categories. Prices are
indicative LKR placeholders.

| Category           | Services (examples)                                                 |
| ------------------ | ------------------------------------------------------------------- |
| Hair               | Haircut & Finish, Blow Dry & Style, Wash & Style, Keratin Treatment |
| Colour             | Global Colour, Full Highlights, Root Touch-up, Balayage             |
| Nails              | Classic Manicure, Classic Pedicure, Gel Manicure, Nail Extensions   |
| Skin & Facials     | Classic Facial, Deep Cleansing Facial, Clean-up                     |
| Bridal & Occasion  | Bridal Package, Party Makeup, Hair Up / Styling                     |
| Waxing & Threading | Eyebrow Threading, Upper Lip, Full Face, Full Arms, Full Legs       |

## 7. Currency and formatting

- Currency is LKR (`Rs.`). Format via `src/lib/format.ts`; do not hardcode `Rs.` in
  components.
- Durations are minutes; format via `src/lib/format.ts`.
- Totals in the WhatsApp message are indicative (enquiry only). No tax, package
  discount or deposit is calculated.
