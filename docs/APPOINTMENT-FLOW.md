# Appointment flow (WhatsApp)

This is the feature the whole concept exists to sell. Read it before touching
`src/lib/appointment.ts`, `src/lib/whatsapp.ts`, `src/scripts/appointment.ts`, or
the `book/*` components.

## 1. Principles

- **No backend, no payment, no account, no calendar.** The request is a message,
  not a booking.
- **Enquiry only.** The total shown is indicative; the owner confirms the actual
  slot, price and duration in the chat.
- **No availability check.** Preferred time slots are a wish list, not a promise.
- **Mobile-first.** Assume the visitor is on a phone, arriving from a Facebook,
  Instagram or WhatsApp link.
- **Never lose the request.** The selection survives a page reload
  (`sessionStorage`) and the WhatsApp link contains the full request, so even if the
  tab closes nothing is lost.

## 2. The flow

```text
Browse services (/services or /book)
   │  tap "Add" on one or more services
   ▼
Book page (/book)
   ├─ Estimator: selected services + indicative total  ◀── adjust / remove
   ├─ Date: native date input (within lead-time window)
   ├─ Time: one or more preferred slots (chips), or "any time"
   ├─ Name (optional)
   └─ Notes (optional)
   │  "Send request on WhatsApp"
   ▼
wa.me/<owner-number>?text=<url-encoded itemized message>
   │
   ▼
Owner's WhatsApp opens with the request pre-filled.
```

Entry points to `/book`: header CTA, hero primary button, featured-service cards,
service list, and the mobile sticky bar. The sticky bar is the primary mobile
action (see `DECISIONS.md` D-S15).

## 3. Message format

Built by `src/lib/appointment.ts`, delivered by `src/lib/whatsapp.ts`. Keep it plain
text, unambiguous on a phone, and localized where it does not confuse the owner.

```text
Hi Amara Studio! I'd like to request an appointment.

*Services*
1. Gel Manicure — Rs. 4,500
2. Eyebrow Threading — Rs. 500

*Estimated total (indicative)*: Rs. 5,000

*Preferred date*: Sat 10 Oct 2026
*Preferred time*: 15:00, 16:00
*Name*: Nimali
*Notes*: Please use a nude shade if possible.

Please confirm availability. Thank you!
```

- Use `*bold*` (WhatsApp markdown) for section headers.
- One line per service: name and price. No quantities in the baseline (each service
  is requested once). A note can carry special requests.
- State clearly that the total is indicative and the owner will confirm.
- Omit optional lines (`Name`, `Notes`) when blank.
- When no time is picked, write `Any time` (localized).
- Numbers are encoded with `encodeURIComponent`; `\n` becomes `%0A`.
- The configured number is digits with country code (`94770000000`), never `+`.

## 4. Selection rules

- Service identity is the service `id`; the selection stores only `{ id }` (plus
  optional note).
- Service details (name, price, duration) are resolved from the current service data
  at render and message-build time, so a stale selection cannot hold an old price.
- Empty selection: the send button is disabled and the user is told to pick a
  service. (A generic "Chat on WhatsApp" link is always available.)
- Unavailable services (`available: false` from the Sheet) cannot be selected and
  are shown as unavailable; if a selected service becomes unavailable, warn before
  sending.
- The indicative total is the sum of selected service prices. No discounts, taxes
  or deposits are calculated.

## 5. Date and time picker

- **Date:** a native `<input type="date">`, constrained by
  `site.appointment.minLeadDays` (default 0) and `maxLeadDays` (default 60). No
  availability is implied.
- **Time:** chips generated from `site.appointment.slots` (default hourly windows
  across the working day). Multi-select; visitors may pick several preferred slots.
  A "Any time" option (localized) is always offered.
- The picker never blocks sending: a request with only services and no date is still
  valid.
- Formatting is locale-aware via `src/lib/appointment.ts` / `Intl.DateTimeFormat`;
  the message uses a clear, unambiguous format (`Sat 10 Oct 2026`).
- Controls are real form controls with labels, keyboard operable, and usable without
  JS. Without JS, the Book page renders a generic WhatsApp link (services can still
  be mentioned in the notes the visitor types in chat).

## 6. Configuration

- Owner WhatsApp number: `site.whatsappNumber` in `src/data/site.ts`.
- Lead time and time slots: `site.appointment`.
- Message template and labels: `src/i18n/ui.ts` (all enabled languages).
- Service data and availability: `src/lib/services.ts` (collections + Sheet).

## 7. Verification (smoke test)

After any change to the flow, manually verify on a phone-sized viewport:

1. Select two different services; the count and indicative total are correct.
2. Remove one; the total updates.
3. Reload the page — the selection persists.
4. Pick a date and two preferred time slots; then send a request with no date at all
   (still valid).
5. Leave name/notes blank; the message omits those lines.
6. Tap send; WhatsApp opens with a correctly itemized, correctly encoded message, to
   the configured number, in the selected language.
7. Mark a service unavailable in the Sheet; confirm it cannot be selected.
8. Disable JavaScript; confirm the page still offers a usable WhatsApp entry point.

If a Playwright smoke test is added later, automate steps 1–6 and document it in
`AGENTS.md`.
