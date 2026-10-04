import type { ImageMetadata } from "astro";

/**
 * Category photos, auto-loaded from `src/assets/categories/`.
 *
 * Drop an image named after the category id (`hair`, `colour`, `nails`, `skin`,
 * `bridal`, `waxing`) and every service in that category falls back to it. A
 * per-service photo in `src/assets/services/<service-id>` overrides it.
 */
const modules = import.meta.glob<ImageMetadata>(
  "../assets/categories/*.{jpg,jpeg,png,webp,avif}",
  { eager: true, import: "default" },
);

export const categoryImages: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(modules).map(([path, image]) => {
    const id =
      path
        .split("/")
        .pop()
        ?.replace(/\.[^.]+$/, "") ?? "";
    return [id, image];
  }),
);
