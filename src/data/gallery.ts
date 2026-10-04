import type { ImageMetadata } from "astro";

import colour from "../assets/gallery/colour.jpg";
import detail from "../assets/gallery/detail.jpg";
import hair from "../assets/gallery/hair.jpg";
import interior from "../assets/gallery/interior.jpg";
import nails from "../assets/gallery/nails.jpg";
import skin from "../assets/gallery/skin.jpg";
import type { UiKey } from "../i18n/ui";

/**
 * Photos shown in the "From the studio" section and on /gallery.
 *
 * The concept ships real placeholder photos in `src/assets/gallery/`. Replace
 * them (same file names) and give each an `altKey` that exists in every enabled
 * language (`src/i18n/ui.ts`).
 */
export type GalleryImage = {
  src: ImageMetadata | string;
  altKey: UiKey;
};

export const gallery: GalleryImage[] = [
  { src: hair, altKey: "gallery.altHair" },
  { src: colour, altKey: "gallery.altColour" },
  { src: nails, altKey: "gallery.altNails" },
  { src: skin, altKey: "gallery.altSkin" },
  { src: interior, altKey: "gallery.altInterior" },
  { src: detail, altKey: "gallery.altDetail" },
];
