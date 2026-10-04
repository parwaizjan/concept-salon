/**
 * All user-facing UI strings.
 *
 * English ships complete. `si` and `ta` are intentionally empty until translated;
 * missing values fall back to English at runtime (see `utils.ts`). Every new
 * string must be added to `en` (and translated later) — do not hardcode English
 * copy into components.
 */

import type { Locale } from "../data/site";

export const languages = {
  en: "English",
  si: "සිංහල",
  ta: "தமிழ்",
} as const;

export const defaultLang: Locale = "en";

const en = {
  "a11y.skip": "Skip to content",

  "nav.home": "Home",
  "nav.services": "Services",
  "nav.book": "Book",
  "nav.about": "About",
  "nav.gallery": "Gallery",
  "nav.visit": "Visit us",

  "common.viewServices": "View services",
  "common.viewGallery": "View gallery",
  "common.bookNow": "Book now",
  "common.chatOnWhatsApp": "Chat on WhatsApp",
  "common.close": "Close",
  "common.remove": "Remove",
  "common.optional": "optional",
  "common.language": "Language",
  "common.from": "from",
  "common.min": "min",

  "hero.eyebrow": "Hair · Skin · Nails",
  "hero.cta": "Book an appointment",
  "hero.secondary": "Chat on WhatsApp",

  "services.title": "Services & prices",
  "services.subtitle": "Tap a service to add it to your appointment request.",
  "services.all": "All",
  "services.add": "Add",
  "services.added": "Added",
  "services.available": "Available",
  "services.unavailable": "Unavailable",
  "services.empty":
    "Our service list is being updated. Please check back soon.",
  "services.filter": "Filter by category",

  "featured.title": "Signature services",

  "how.title": "How it works",
  "how.step1Title": "Browse services",
  "how.step1Body": "See everything we offer, with clear prices.",
  "how.step2Title": "Build your request",
  "how.step2Body": "Pick your services and a preferred date and time.",
  "how.step3Title": "Send on WhatsApp",
  "how.step3Body": "We confirm your slot and answer any questions.",

  "booking.title": "Book your appointment",
  "booking.subtitle":
    "Choose your services, then tell us your preferred date and time. We will confirm on WhatsApp.",
  "booking.stepServices": "1. Choose services",
  "booking.stepDetails": "2. Preferred date & time",
  "booking.stepSend": "3. Send your request",
  "booking.selected": "Selected services",
  "booking.empty": "No services selected yet. Pick from the list above.",
  "booking.total": "Estimated total (indicative)",
  "booking.indicative":
    "This is an estimate only. The studio confirms the final price and time on WhatsApp.",
  "booking.date": "Preferred date",
  "booking.dateHint": "Optional — pick a day that suits you.",
  "booking.time": "Preferred time",
  "booking.timeHint": "Pick one or more windows, or leave it to us.",
  "booking.timeAny": "Any time",
  "booking.name": "Your name",
  "booking.namePlaceholder": "e.g. Nimali Perera",
  "booking.notes": "Notes",
  "booking.notesPlaceholder":
    "Any special requests or a style you have in mind?",
  "booking.send": "Send request on WhatsApp",
  "booking.selectFirst": "Select at least one service to send a request.",
  "booking.noPayment":
    "No payment online. You confirm everything with the studio on WhatsApp.",
  "booking.summary": "Your request",

  "msg.intro": "I would like to request an appointment.",
  "msg.services": "Services",
  "msg.total": "Estimated total (indicative)",
  "msg.date": "Preferred date",
  "msg.time": "Preferred time",
  "msg.timeAny": "Any time",
  "msg.name": "Name",
  "msg.notes": "Notes",
  "msg.footer": "Please confirm availability. Thank you!",

  "testimonials.title": "Loved by our clients",

  "about.title": "Our story",
  "about.teaser":
    "A calm, independent studio in Colombo where good hair and skin care come first.",
  "about.imageAlt":
    "Inside the studio — styling chairs, mirrors and warm light",
  "about.readMore": "Read more",

  "gallery.title": "From the studio",
  "gallery.altHair": "A finished haircut and blow-dry styled in the studio",
  "gallery.altColour":
    "Freshly coloured hair with soft, dimensional highlights",
  "gallery.altNails": "A neat gel manicure in a soft nude shade",
  "gallery.altSkin": "A client relaxing during a facial treatment",
  "gallery.altInterior": "The calm, modern interior of the salon",
  "gallery.altDetail": "A close-up of styling tools and products on a worktop",

  "visit.title": "Visit us",
  "visit.address": "Address",
  "visit.hours": "Opening hours",
  "visit.phone": "Phone",
  "visit.whatsapp": "WhatsApp",
  "visit.map": "Find us",
  "visit.directions": "Get directions",
  "visit.openNow": "Open now",
  "visit.closedNow": "Closed now",
  "visit.today": "Today",

  "sticky.book": "Book now",
  "sticky.review": "Review & book",
  "sticky.service": "service",
  "sticky.services": "services",

  "footer.bookNote": "Appointments are arranged on WhatsApp.",
  "footer.rights": "All rights reserved.",

  "notFound.title": "Page not found",
  "notFound.body": "Sorry, we could not find that page.",
  "notFound.cta": "Back to services",
};

const si: Partial<typeof en> = {};

const ta: Partial<typeof en> = {};

export const ui = { en, si, ta } as const;

export type UiKey = keyof typeof en;
