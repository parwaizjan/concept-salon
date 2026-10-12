import { site, type Locale } from "../data/site";
import type { UiKey } from "../i18n/ui";
import { tagMessage } from "./demo";
import { formatPrice } from "./format";

export type AppointmentLine = {
  id: string;
  name: string;
  price: number;
};

export type AppointmentDetails = {
  lines: AppointmentLine[];
  total: number;
  /** ISO `yyyy-mm-dd`, if the visitor picked a preferred date. */
  date?: string;
  /** Preferred time windows ("HH:MM"); empty means any time. */
  slots: string[];
  name?: string;
  notes?: string;
};

type Translate = (key: UiKey) => string;

/** Format an ISO date as a clear, unambiguous label, e.g. `Sat 10 Oct 2026`. */
export function formatPreferredDate(iso: string, lang: Locale): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;

  const locale = lang === "en" ? "en-GB" : `${lang}-LK`;
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
    .format(new Date(year, month - 1, day))
    .replace(/,/g, "");
}

/**
 * Build the plain-text WhatsApp appointment message. Keep it human-readable on a
 * phone and use WhatsApp `*bold*` markup.
 */
export function buildAppointmentMessage(
  details: AppointmentDetails,
  lang: Locale,
  t: Translate,
): string {
  const parts: string[] = [`Hello ${site.name}! ${t("msg.intro")}`];

  if (details.lines.length > 0) {
    parts.push(
      "",
      `*${t("msg.services")}*`,
      ...details.lines.map(
        (line, index) =>
          `${index + 1}. ${line.name} — ${formatPrice(line.price)}`,
      ),
      "",
      `*${t("msg.total")}*: ${formatPrice(details.total)}`,
    );

    const schedule: string[] = [];
    if (details.date) {
      schedule.push(
        `*${t("msg.date")}*: ${formatPreferredDate(details.date, lang)}`,
      );
    }

    const timeText =
      details.slots.length > 0 ? details.slots.join(", ") : t("msg.timeAny");
    schedule.push(`*${t("msg.time")}*: ${timeText}`);
    parts.push("", ...schedule);

    if (details.name?.trim()) {
      parts.push(`*${t("msg.name")}*: ${details.name.trim()}`);
    }

    if (details.notes?.trim()) {
      parts.push(`*${t("msg.notes")}*: ${details.notes.trim()}`);
    }
  }

  parts.push("", t("msg.footer"));
  return tagMessage(parts.join("\n"));
}

/** A generic "chat with us" enquiry, tagged like every other demo request. */
export function buildEnquiryMessage(t: Translate): string {
  return tagMessage(`${t("msg.intro")} ${t("msg.footer")}`);
}
