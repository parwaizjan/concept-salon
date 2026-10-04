import type { ImageMetadata } from "astro";

/**
 * Service photos, auto-loaded from `src/assets/services/`.
 *
 * Drop an image in that folder named after the service id (the content file name),
 * e.g. `gel-manicure.jpg`, `global-colour.png`. No code change is needed — the file
 * is picked up here and used on the service card. Services without a matching file
 * fall back to `public/images/placeholder.svg`.
 *
 * Recommended: 4:3 landscape (e.g. 1200x900), JPG or PNG.
 */
const modules = import.meta.glob<ImageMetadata>(
  "../assets/services/*.{jpg,jpeg,png,webp,avif}",
  { eager: true, import: "default" },
);

export const serviceImages: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(modules).map(([path, image]) => {
    const id =
      path
        .split("/")
        .pop()
        ?.replace(/\.[^.]+$/, "") ?? "";
    return [id, image];
  }),
);
