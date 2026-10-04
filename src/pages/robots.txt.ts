import type { APIRoute } from "astro";

import { site } from "../data/site";

/**
 * robots.txt is generated from `site.indexable`:
 *  - demo/concept: disallow everything
 *  - real salon clone (`indexable: true`): allow, plus a sitemap
 */
export const GET: APIRoute = () => {
  const body = site.indexable
    ? `User-agent: *\nAllow: /\n\nSitemap: ${site.siteUrl}/sitemap-index.xml\n`
    : `User-agent: *\nDisallow: /\n`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
