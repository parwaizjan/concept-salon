# Deployment

How the concept demo and each salon clone are hosted, built and published. The goal
is a repeatable, near-zero-cost deploy.

## 1. Target

- **Host:** Cloudflare Workers (static assets). No SSR, no bindings.
- **Demo domain:** `https://demo-salon.zuvo.lk`
- **Per clone:** `<salon>.zuvo.lk` or the owner's own domain, attached to that
  clone's Worker.
- **Source:** private GitHub repo per salon (created from this template).
- **Cost:** Cloudflare free tier and Google Sheets free tier only.

## 2. Build

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm check
corepack pnpm lint
corepack pnpm build     # output in dist/client/
```

`dist/` is plain static HTML/CSS/JS/images; `dist/server/` is empty. There is no
server component.

## 3. Cloudflare Workers

This project uses `@astrojs/cloudflare` with `output: 'static'`. The adapter emits
`dist/client/wrangler.json` plus a `.wrangler/deploy/config.json` redirect, so
`wrangler deploy` from the repo root picks up the generated assets config. The root
`wrangler.jsonc` stays minimal and must not hand-specify `assets.directory`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "concept-salon",
  "workers_dev": false,
  "compatibility_date": "2026-10-01",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@astrojs/cloudflare/entrypoints/server",
  "assets": {
    "not_found_handling": "404-page",
  },
  "observability": {
    "enabled": true,
  },
}
```

Deploy:

```sh
corepack pnpm deploy        # wrangler deploy
```

Each clone sets its own `name` (the Worker name) in `wrangler.jsonc`. Keep the
Worker name and the domain aligned (e.g. worker `amara-studio`, domain
`amara-studio.zuvo.lk`).

`not_found_handling: "404-page"` serves the built 404 page for unknown paths. Keep
`src/pages/404.astro`.

`workers_dev: false` prevents a later deploy from re-enabling the `*.workers.dev`
URL on the demo.

## 4. Custom domain

1. The `zuvo.lk` zone is managed in the Cloudflare account.
2. In the Worker's **Settings > Domains & Routes**, add a custom domain
   `demo-salon.zuvo.lk` (demo) or `<salon>.zuvo.lk` (clone).
3. Cloudflare creates the DNS record automatically because the zone is on the same
   account. TLS is automatic.
4. For an owner's external domain, add it as a custom domain on the Worker and have
   the owner point DNS at Cloudflare as instructed by the dashboard.

## 5. Continuous deployment

Two options; pick one per repo:

- **Cloudflare Workers Builds** — connect the GitHub repo in the Cloudflare
  dashboard, set install/build commands (`pnpm install`, `pnpm build`) and deploy on
  every push to `main`.
- **GitHub Actions** — a workflow running
  `corepack pnpm install --frozen-lockfile && pnpm build` then `wrangler deploy`
  using a `CLOUDFLARE_API_TOKEN` secret. This is also the target for the Sheet
  event-driven rebuild (see `docs/CONTENT-AND-SERVICES.md`).

For the concept demo either is fine. For clones, Workers Builds is usually the least
setup.

## 6. Secrets

The static site needs no runtime secrets. Deployment credentials
(`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) live only as CI/GitHub secrets,
never in the repo or in `src/data/site.ts`.

The Google Sheet URL is public (published to web) and safe to commit; it contains no
credentials.

## 7. Headers and caching

- `public/_headers` sets a one-year immutable cache for hashed `/_astro/*` assets
  and adds `X-Robots-Tag: noindex, nofollow`.
- **The `X-Robots-Tag` line is the demo's no-index switch.** A real salon clone must
  delete it when it sets `indexable: true`, or the site stays out of search results
  regardless of `robots.txt`. See "Turning on indexing" in
  `docs/CUSTOMIZATION.md`; verify with
  `curl -sI https://<domain>/ | grep -i x-robots` (should return nothing).
- Because output is static, Cloudflare's edge caching handles most traffic.
- Keep total page weight low; most visitors are on mobile networks.

## 8. Rollback

Cloudflare keeps previous Worker versions. Roll back from **Workers > Deployments >
Rollback** if a deploy breaks the demo or a live salon. Always verify the live
domain after deploying.

## 9. GitHub repo setup (once)

1. Create the private repo `parwaizjan/concept-salon` from the local project (see
   `README.md` / `AGENTS.md`), push `main`.
2. Mark the repo as a **Template Repository** in GitHub settings so clones start
   clean without history.
3. Connect it to Workers Builds (or add the GitHub Actions workflow).

## 10. Post-deploy checklist

- [ ] Home, Services, Book, Gallery, About, Visit pages load on mobile.
- [ ] Appointment request opens WhatsApp with the correct number and itemized
      message.
- [ ] `robots.txt` matches the intended `indexable` state; sitemap present only if
      indexable.
- [ ] If indexable: `X-Robots-Tag` header gone, no `noindex` meta, `siteUrl` set to
      the real domain.
- [ ] No demo branding or demo phone number remains in a clone.
- [ ] Opening hours and map are correct.
- [ ] If translations are enabled, the language switcher works and preserves the
      page.
