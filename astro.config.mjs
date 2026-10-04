// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

import { site } from "./src/data/site.ts";

// Sitemap is only generated for indexable sites (real salon clones).
// The concept/demo ships with `indexable: false` and must not be indexed.
export default defineConfig({
  site: site.siteUrl,
  output: "static",
  session: false,
  i18n: {
    defaultLocale: site.defaultLocale,
    locales: [...site.locales],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: site.indexable ? [sitemap()] : [],
  adapter: cloudflare({ imageService: "compile" }),
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
  },
});
