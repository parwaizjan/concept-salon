import type { LocalizedText } from "./site";

/**
 * Client testimonials shown on the home page.
 *
 * These are placeholder, invented quotes. A clone replaces them with the salon's
 * real reviews (with permission). Add `si`/`ta` values when translated.
 */
export type Testimonial = {
  quote: LocalizedText;
  author: string;
  detail?: LocalizedText;
};

export const testimonials: Testimonial[] = [
  {
    quote: {
      en: "The nicest colour work I've had in Colombo. My hair still looks fresh weeks later.",
    },
    author: "Dinushi R.",
    detail: { en: "Colour & highlights" },
  },
  {
    quote: {
      en: "Booking on WhatsApp took a minute and they confirmed the time straight away.",
    },
    author: "Tharindu P.",
    detail: { en: "Haircut & finish" },
  },
  {
    quote: {
      en: "I had my nails and a facial done before a wedding — everything was perfect.",
    },
    author: "Anjali S.",
    detail: { en: "Bridal & occasion" },
  },
  {
    quote: {
      en: "Warm, professional and they listen to what you actually want.",
    },
    author: "Kavitha M.",
    detail: { en: "Skin & facials" },
  },
];
