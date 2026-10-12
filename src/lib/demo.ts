import { site } from "../data/site";

/**
 * Demo-vs-clone helpers.
 *
 * The concept/demo is noindex (`indexable: false`); a real salon clone flips
 * `indexable` to true. Everything demo-only — the sample ribbon and the source
 * tag on visitor requests — is gated on that one flag, so a clone removes both
 * by turning on indexing (no extra step).
 */
export const isDemo = !site.indexable;

/** Prefix added to every visitor-facing demo request. Empty for real clones. */
export const demoTag = isDemo ? site.demo.tag : "";

/** Prefix a WhatsApp message with the demo source tag (no-op for real clones). */
export function tagMessage(message: string): string {
  return demoTag ? `${demoTag} ${message}` : message;
}
