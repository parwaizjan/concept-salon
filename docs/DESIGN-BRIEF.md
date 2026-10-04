# Design Brief

## Brand feeling

**Modern elegant, warm and local.** A relaxed upmarket studio you would trust with
your hair, skin and nails — not a luxury hotel spa, not a bright walk-in barber.
Warm cream and sand surfaces, soft charcoal text, a rose/terracotta primary, a
muted sage secondary. Calm spacing, generous imagery, hairline dividers, restrained
shadows. Works for all-gender salons.

Demo brand (placeholder, invented — see `DECISIONS.md` D-S09):

| Field        | Value                                    |
| ------------ | ---------------------------------------- |
| Name         | **Amara Studio**                         |
| Tagline (EN) | Hair, skin and nails — beautifully done. |
| Location     | 24 Ward Place, Colombo 07, Sri Lanka     |
| WhatsApp     | +94 77 000 0000 (placeholder)            |
| Hours        | Tue–Sun 09:00–19:00; Mon closed          |
| Currency     | LKR (Rs.)                                |

## Theme tokens

Edit `src/styles/theme.css` to rebrand; `global.css` maps tokens to Tailwind.

| Token                | Value     | Use                       |
| -------------------- | --------- | ------------------------- |
| `--c-bg`             | `#FAF6F2` | Page background           |
| `--c-surface`        | `#FFFFFF` | Cards                     |
| `--c-surface-alt`    | `#F4EBE4` | Subtle section background |
| `--c-text`           | `#2B2320` | Primary text              |
| `--c-text-muted`     | `#7A6A63` | Secondary text            |
| `--c-primary`        | `#B76E79` | Rose — buttons, links     |
| `--c-primary-strong` | `#9C5561` | Primary hover             |
| `--c-on-primary`     | `#FFFFFF` | Text on primary           |
| `--c-accent`         | `#7C8C6A` | Sage — badges, eyebrows   |
| `--c-border`         | `#E7DAD2` | Hairline borders          |
| `--c-success`        | `#3F7D4E` | Available                 |
| `--c-danger`         | `#B23A3A` | Unavailable / error       |
| `--c-focus`          | `#1D4ED8` | Focus ring                |

- Radius: `--radius-sm 6px`, `--radius-md 12px`, `--radius-lg 20px`.
- Shadow: one soft `--shadow-soft` for raised cards only; default to hairlines.
- Type: `font-heading` **Fraunces** (display/headings), `font-body` **Inter**
  (body/UI). Both stacks append Noto Sans Sinhala and Noto Sans Tamil.
- Scale: hero `text-4xl sm:text-5xl`, section headings `text-2xl sm:text-3xl`,
  body `text-base`, meta `text-sm`.
- Utilities: `bg-bg bg-surface text-text text-text-muted border-border bg-primary
text-primary bg-accent`. Classes: `.eyebrow .btn-primary .btn-secondary .card`.

Presets (pitch variety) may live in `src/styles/themes/*.css` with a `data-theme`
attribute; the default is the warm-rose palette above. A clone keeps the structure
and swaps values only.

## Pages

| Page      | Route       | Job                                                      |
| --------- | ----------- | -------------------------------------------------------- |
| Home      | `/`         | Pitch in 30 seconds: who, what, proof, primary Book CTA. |
| Services  | `/services` | Full service + price list by category, add-to-request.   |
| Book      | `/book`     | Estimator + date/time picker → WhatsApp request.         |
| Gallery   | `/gallery`  | Photos of work; the decisive trust signal for a salon.   |
| About     | `/about`    | Story, values, the team's craft (no stylist profiles).   |
| Visit     | `/visit`    | Address, hours, map, phone, WhatsApp, directions.        |
| Not found | `/404`      | Friendly recovery with links to Services/Book.           |

Legal pages are deferred (see `AGENTS.md` §8). `robots.txt` is generated.

## Home section order

1. **Hero** — brand, tagline, primary CTA (Book), secondary (View services),
   featured image.
2. **Featured services** — 3–4 signature treatments with "from" prices.
3. **How it works** — Browse services → Build your request → Send on WhatsApp.
4. **Gallery teaser** — 4–6 images linking to `/gallery`.
5. **Testimonials** — 2–4 short quotes.
6. **Visit** — hours, address, map, directions.
7. **CTA band** — "Book on WhatsApp".

The estimator and date/time picker live on `/book`, linked from the header, hero,
featured services and the sticky bar — not repeated on the home page.

## Mobile-first rules

Most traffic arrives on phones from social apps, often on 3G.

- Design and test at **375px first**, then scale up.
- Tap targets ≥ 44px; primary actions bottom-reachable.
- The sticky **Book on WhatsApp** bar sits above the safe area, shows the running
  indicative total once services are selected, and never overlaps the footer.
- Images are pre-sized, lazy-loaded below the fold, and served with explicit
  `width`/`height` to avoid layout shift.
- The header collapses to a CSS-first `<details>` menu below `lg` (works without
  JS; a tiny script closes it on tap-out).
- No horizontal scroll; no more than one visual accent competing with the CTA.

## Component inventory

| Component                                                    | Notes                                                       |
| ------------------------------------------------------------ | ----------------------------------------------------------- |
| `Header`                                                     | Logo, primary nav, Book CTA, language switcher.             |
| `Footer`                                                     | Brand, full nav, socials, hours, copyright.                 |
| `LangSwitcher`                                               | Hidden when only one locale is enabled.                     |
| `Seo`                                                        | Title/description/canonical/OG/JSON-LD helpers.             |
| `hero/Hero`                                                  | Variants `classic`, `split`, `overlay` (config).            |
| `services/CategoryNav`                                       | Sticky category jump links.                                 |
| `services/ServiceList`                                       | Grouped cards, price + duration, select control.            |
| `services/ServiceCard`                                       | Name, description, duration, price, availability, image.    |
| `services/ServiceImage`                                      | Pre-sized resolution with placeholder fallback.             |
| `services/FeaturedServices`                                  | Signature treatments for home.                              |
| `book/Estimator`                                             | Selection + live indicative total.                          |
| `book/DateTimePicker`                                        | Native date input + preferred time-slot choices.            |
| `book/StickyBookBar`                                         | Mobile summary + Book on WhatsApp.                          |
| `book/BookButton`                                            | Inline Book CTA, disabled/held until a service is selected. |
| `gallery/GalleryGrid`                                        | Responsive image grid with lightbox-free design.            |
| `visit/ContactLinks`, `visit/MapEmbed`, `visit/OpeningHours` | Visit page blocks.                                          |
| `pages/*`                                                    | Compose each route from the above.                          |

## Accessibility

- Semantic landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page.
- All images have localized alt text; decorative images are `alt=""`.
- Estimator and picker are real form controls with labels; selection state is
  announced; keyboard operable and usable without JS.
- Contrast targets WCAG AA: charcoal on cream, white on rose (verify in the final
  palette).
- `lang` set per locale; focus visible on all interactive elements.
