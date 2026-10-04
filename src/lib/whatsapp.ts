import { site } from "../data/site";

/**
 * Build a wa.me deep link. The number must be digits only (country code, no `+`).
 * Every WhatsApp entry point routes through here — never inline `wa.me` URLs in
 * components.
 */
export function buildWhatsAppUrl(
  message: string,
  number: string = site.whatsappNumber,
): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
