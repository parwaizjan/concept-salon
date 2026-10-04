import { site } from "../data/site";

/** Format a price in the configured currency, e.g. `Rs. 1,800`. */
export function formatPrice(amount: number): string {
  const value = new Intl.NumberFormat("en-LK", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${site.currency.symbol} ${value}`;
}

/** Format a service duration in minutes, e.g. `60 min`. */
export function formatDuration(
  minutes: number | undefined,
): string | undefined {
  if (!minutes || minutes <= 0) return undefined;
  return `${minutes} min`;
}
