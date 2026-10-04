import type { ImageMetadata } from "astro";

import about from "../assets/about.jpg";

/**
 * The "Our story" photo, auto-loaded from `src/assets/about.jpg`.
 * Replace that file to rebrand; it is optimized at build time.
 */
export const aboutImage: ImageMetadata = about;
