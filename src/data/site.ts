/**
 * THE per-salon configuration.
 *
 * Every salon-specific value lives here. A clone only needs to edit this file,
 * `src/styles/theme.css`, the content collections and `public/`. Components must
 * never contain salon-specific literals.
 */

export type Locale = "en" | "si" | "ta";

export type LocalizedText = {
  en: string;
  si?: string;
  ta?: string;
};

export type OpeningHour = {
  /** 0 = Sunday … 6 = Saturday */
  day: number;
  /** 24h "HH:MM". Leave `open` empty to mark the day closed. */
  open: string;
  close: string;
};

const tagline: LocalizedText = {
  en: "Hair, skin and nails — beautifully done.",
};

const address: LocalizedText = {
  en: "24 Ward Place, Colombo 07, Sri Lanka",
};

export const site = {
  // Identity
  name: "Amara Studio",
  tagline,
  logo: "/logo.svg",
  ogImage: "/og.jpg",
  heroImage: "/images/hero.webp",
  heroImageSrcSet: "/images/hero-960.webp 960w, /images/hero.webp 1680w",
  heroImageMobile: "/images/hero-mobile.webp",

  // Contact
  whatsappNumber: "94743430033", // digits only, country code, no "+"
  phone: "+94 74 343 0033",
  email: "", // display only; appointment requests go to WhatsApp
  address,
  mapEmbedUrl:
    "https://www.google.com/maps?q=Ward%20Place%2C%20Colombo%2007%2C%20Sri%20Lanka&output=embed",
  mapLink: "https://maps.google.com/?q=Ward+Place,+Colombo+07,+Sri+Lanka",

  // Opening hours (0 = Sunday … 6 = Saturday)
  hours: [
    { day: 0, open: "10:00", close: "17:00" },
    { day: 1, open: "", close: "" }, // Monday — closed
    { day: 2, open: "09:00", close: "19:00" },
    { day: 3, open: "09:00", close: "19:00" },
    { day: 4, open: "09:00", close: "19:00" },
    { day: 5, open: "09:00", close: "19:00" },
    { day: 6, open: "09:00", close: "19:00" },
  ] as OpeningHour[],

  // Socials (empty string hides the link)
  socials: {
    facebook: "",
    instagram: "",
    tiktok: "",
  },

  // i18n — English ships first; add "si"/"ta" when translations exist.
  defaultLocale: "en" as Locale,
  locales: ["en"] as Locale[],

  // Appointment preferences
  appointment: {
    /** Earliest selectable preferred day, relative to today. */
    minLeadDays: 0,
    /** Latest selectable preferred day, relative to today. */
    maxLeadDays: 60,
    /** Preferred time windows offered as chips (24h "HH:MM"). */
    slots: [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ],
  },

  // Service data source.
  //  - "runtime": the demo fetches the public Sheet in the browser (instant edits).
  //  - "build":   clones fetch the Sheet during the build (static, event-driven rebuild).
  // Leave `sheetId` empty to run entirely from the content collections.
  services: {
    mode: "runtime" as "runtime" | "build",
    sheetId: "",
    sheetTab: "Services",
    refreshMinutes: 5,
  },

  // SEO — false for the concept demo, true for a real salon clone.
  indexable: false,
  siteUrl: "https://demo-salon.zuvo.lk",
  currency: { code: "LKR", symbol: "Rs." },
  heroVariant: "overlay" as "classic" | "split" | "overlay",
};

export type Site = typeof site;
