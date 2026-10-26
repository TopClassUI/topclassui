# Round 13, job 157: demo links that 404 on topclassui.com

- Base: `9b20ab8f040b58a49491dbee2cc5df0eb60e06d2` (origin/main, Merge pull request #187)
- Head of `fix/demo-links`: `fac186525126fca3ef9a58a47f016ad1657ae934` (three commits, all authored and committed as OmarAbed16)
  - `fc4b0265` fix(demos): point example links at # or a fragment and check every same-origin href on the site
  - `d1c199d0` test(e2e): follow a demo link by its fragment instead of a request
  - `fac18652` test(e2e): read the page number from the fragment of a pagination demo

## The guard

`apps/docs/scripts/lib/internal-links.ts` contains the walk: `hrefsOf`, `sameOriginPath` and `brokenLinks`. `apps/docs/scripts/check-static.ts`, which runs in `docs:check`, calls it on the HTML of every prerendered route in `.next/server/app`. An href passes when it is any of these:

- a fragment;
- on another origin;
- a prerendered route;
- a file under `public/` or `.next/static` (served as `/_next/static/...`);
- a match for a redirect regex in `.next/routes-manifest.json`, which covers `/` → `/en` and `/en/docs` → the first guide.

Absolute `https://topclassui.com/...` hrefs count as same-origin. The query and the fragment are dropped before the path is resolved. Each offender prints as `error <href> on <page> is not a route, a redirect or a file of the site`, followed by a count, and the script exits with 1.

Unit test: `apps/docs/scripts/internal-links.test.ts` has 4 cases:

- `hrefsOf`;
- `sameOriginPath`;
- a passing page;
- a failing case whose expected `[{ href, page }]` list is written out (R-17-1).

### Before the fix (base build, guard added)

```
1300 same-origin links resolve to nothing
 ELIFECYCLE  Command failed with exit code 1.
```

These 1300 (page, href) pairs cover 3182 built pages and 102 distinct hrefs. Of the pairs, 256 are on the public `/en` and `/ar` pages: the component pages of accordion, alert, avatar-group, banner, breadcrumb, button, card, empty-state, navbar, pagination and table, plus `/{en,ar}/docs/components` (14 each) and `/{en,ar}/docs/rtl` (8 each, `/blog?page=N` from the Pagination rtl demo). The other 1044 are on the `/preview/...` routes. Every offender came from a demo under `packages/topclassui/src/components/*/dummy/`. None came from `apps/docs/content/**` or `apps/docs/components/**`: their same-origin links already carry a locale and resolve, so no docs content changed.

Distinct offenders on the public pages, with the number of pages that link each:

/docs (8 pages), /changelog (6 pages), /blog?page=5 (6 pages), /blog?page=4 (6 pages), /blog?page=3 (6 pages), /blog?page=2 (6 pages), /blog?page=1 (6 pages), /reports/may (4 pages), /projects/new (4 pages), /icons (4 pages), /docs/components (4 pages), /docs/button (4 pages), /components (4 pages), /blog?page=7 (4 pages), /blog?page=6 (4 pages), /blog?page=24 (4 pages), /blog?page=12 (4 pages), /billing (4 pages), /theming (2 pages), /team/invite (2 pages), /status (2 pages), /shop/shoes (2 pages), /shop (2 pages), /reports/may.pdf (2 pages), /release-notes (2 pages), /plans (2 pages), /people/sara (2 pages), /people/omar (2 pages), /people/lina (2 pages), /orders?page=8 (2 pages), /orders?page=500 (2 pages), /orders?page=5 (2 pages), /orders?page=499 (2 pages), /orders?page=4 (2 pages), /orders?page=3 (2 pages), /orders?page=252 (2 pages), /orders?page=251 (2 pages), /orders?page=250 (2 pages), /orders?page=249 (2 pages), /orders?page=248 (2 pages), /orders?page=2 (2 pages), /orders?page=12346 (2 pages), /orders?page=123456 (2 pages), /orders?page=12345 (2 pages), /orders?page=12344 (2 pages), /orders?page=1 (2 pages), /orders/1042 (2 pages), /orders/1041 (2 pages), /orders/1040 (2 pages), /orders/1039 (2 pages), /orders/1038 (2 pages), /orders/1037 (2 pages), /orders/1036 (2 pages), /orders/1035 (2 pages), /orders/1034 (2 pages), /orders/1033 (2 pages), /orders/1032 (2 pages), /orders/1031 (2 pages), /orders/1030 (2 pages), /orders/1029 (2 pages), /orders/1028 (2 pages), /orders/1027 (2 pages), /orders/1026 (2 pages), /orders/1025 (2 pages), /orders/1024 (2 pages), /orders/1023 (2 pages), /orders/1022 (2 pages), /orders/1021 (2 pages), /orders/1020 (2 pages), /orders/1019 (2 pages), /orders/1018 (2 pages), /orders (2 pages), /logs (2 pages), /login (2 pages), /invoices/inv_1045 (2 pages), /invoices/inv_1044 (2 pages), /invoices/inv_1043 (2 pages), /invoices/inv_1042 (2 pages), /handbook/step-9 (2 pages), /handbook/step-8 (2 pages), /handbook/step-7 (2 pages), /handbook/step-6 (2 pages), /handbook/step-5 (2 pages), /handbook/step-4 (2 pages), /handbook/step-3 (2 pages), /handbook/step-2 (2 pages), /handbook/step-11 (2 pages), /handbook/step-10 (2 pages), /handbook/step-1 (2 pages), /handbook/edit (2 pages), /guides/migrating (2 pages), /docs/components/navigation/breadcrumb/examples/server/json-ld (2 pages), /docs/components/navigation/breadcrumb/examples/server (2 pages), /docs/components/navigation/breadcrumb/examples (2 pages), /docs/components/navigation/breadcrumb (2 pages), /docs/components/navigation (2 pages), /connectors (2 pages), /blog?page=9 (2 pages), /blog?page=8 (2 pages), /blog?page=11 (2 pages), /blog?page=10 (2 pages), /blog (2 pages)

### After the fix

```
check:static: 24 routes, all static or SSG; 133 required paths, 126 Open Graph images, 2 search files and 28 live pages dated in the sitemap; every same-origin href of 3182 pages resolves
```

That is 0 offenders.

## Every demo changed (old → new)

The rules I followed:

- **`#`** for a single call-to-action link.
- **A fragment named after the old target** for a set of links whose values must stay distinct. The Sidebar demos already use this convention (`#home`, `#team`).

Notes by demo:

- **Breadcrumb**: no demo passes `siteUrl`, so no demo emits JSON-LD and nothing there depends on a path. Fragments keep each crumb a distinct, real link, and the last crumb stays the hrefless current page.
- **Navbar**: the active item is the `current` prop, not href matching. Links became `#docs` and so on, and `#docs` stays current.
- **Pagination**: `getHref` became `` `#page-${n}` ``. The current page comes from `value`, not the href.
- **Table**: row links became `#order-N` and `#inv_N`.
- **AvatarGroup**: links became `#omar` and so on.
- **`NavbarBrand href="/"`** stays: it resolves through the site's own `/` → `/en` redirect.

| Demo (`packages/topclassui/src/components/…`) | Old | New |
|---|---|---|
| `accordion/dummy/long-content.tsx` | `/orders` | `#` |
| `alert/dummy/with-actions.tsx` | `/billing`, `/logs` | `#`, `#` |
| `avatar-group/dummy/linked.tsx` | `/people/omar`, `/people/lina`, `/people/sara`, `/people/mona`, `/people/rami` | `#omar`, `#lina`, `#sara`, `#mona`, `#rami` |
| `banner/dummy/basic.tsx` | `/changelog` | `#` |
| `banner/dummy/dismissible.tsx` | `/changelog` | `#` |
| `banner/dummy/long-action.tsx` | `/billing` | `#` |
| `banner/dummy/long-text.tsx` | `/status` | `#` |
| `banner/dummy/playground.tsx` | `/changelog` | `#` |
| `banner/dummy/rtl.tsx` | `/changelog` | `#` |
| `banner/dummy/with-action.tsx` | `/billing`, `/plans` | `#`, `#` |
| `breadcrumb/dummy/all-links.tsx` | `/shop`, `/shop/shoes` | `#shop`, `#shoes` |
| `breadcrumb/dummy/basic.tsx` | `/docs`, `/docs/components` | `#docs`, `#components` |
| `breadcrumb/dummy/deep-trail.tsx` | `/handbook/step-${String(index + 1)}` | `#step-${String(index + 1)}` |
| `breadcrumb/dummy/long-label.tsx` | `/guides/migrating` | `#migrating` |
| `breadcrumb/dummy/long-trail.tsx` | `/docs`, `/docs/components`, `/docs/components/navigation`, `/docs/components/navigation/breadcrumb`, `/docs/components/navigation/breadcrumb/examples`, `/docs/components/navigation/breadcrumb/examples/server`, `/docs/components/navigation/breadcrumb/examples/server/json-ld` | `#docs`, `#components`, `#navigation`, `#breadcrumb`, `#examples`, `#server`, `#json-ld` |
| `breadcrumb/dummy/mixed-label.tsx` | `/release-notes` | `#release-notes` |
| `breadcrumb/dummy/playground.tsx` | `/docs`, `/docs/components` | `#docs`, `#components` |
| `breadcrumb/dummy/rtl.tsx` | `/docs` | `#docs` |
| `breadcrumb/dummy/states.tsx` | `/docs`, `/docs/button`, `/docs`, `/docs`, `/docs/components`, `/docs/components/actions`, `/docs` | `#docs`, `#button`, `#docs`, `#docs`, `#components`, `#actions`, `#docs` |
| `button/dummy/as-link.tsx` | `/docs`, `/docs` | `#`, `#` |
| `card/dummy/interactive.tsx` | `/reports/may` | `#` |
| `card/dummy/report.tsx` | `/reports/may.pdf` | `#` |
| `card/dummy/states.tsx` | `/reports/may` | `#` |
| `drawer/dummy/start.tsx` | `/docs`, `/components`, `/changelog` | `#docs`, `#components`, `#changelog` |
| `empty-state/dummy/rtl.tsx` | `/projects/new` | `#` |
| `empty-state/dummy/with-action.tsx` | `/projects/new` | `#` |
| `navbar/dummy/basic.tsx` | `/docs`, `/components`, `/icons`, `/theming`, `/login` | `#docs`, `#components`, `#icons`, `#theming`, `#` |
| `navbar/dummy/many-links.tsx` | `/docs`, `/components`, `/icons`, `/theming`, `/connectors`, `/changelog`, `/login` | `#docs`, `#components`, `#icons`, `#theming`, `#connectors`, `#changelog`, `#` |
| `navbar/dummy/not-sticky.tsx` | `/docs`, `/blog`, `/changelog` | `#docs`, `#blog`, `#changelog` |
| `navbar/dummy/playground.tsx` | `/docs`, `/components`, `/icons`, `/login` | `#docs`, `#components`, `#icons`, `#` |
| `navbar/dummy/rtl.tsx` | `/docs`, `/components`, `/icons`, `/theming`, `/login` | `#docs`, `#components`, `#icons`, `#theming`, `#` |
| `navbar/dummy/stage.tsx` | `/docs`, `/components`, `/icons` | `#docs`, `#components`, `#icons` |
| `navbar/dummy/tall-page.tsx` | `/handbook/edit` | `#` |
| `navbar/dummy/with-search.tsx` | `/docs`, `/components`, `/icons` | `#docs`, `#components`, `#icons` |
| `pagination/dummy/custom-size.tsx` | `/blog?page=${String(page)}` | `#page-${String(page)}` |
| `pagination/dummy/first-page.tsx` | `/blog?page=${String(page)}` | `#page-${String(page)}` |
| `pagination/dummy/last-page.tsx` | `/blog?page=${String(page)}` | `#page-${String(page)}` |
| `pagination/dummy/many-pages.tsx` | `/orders?page=${String(page)}` | `#page-${String(page)}` |
| `pagination/dummy/middle.tsx` | `/blog?page=${String(page)}` | `#page-${String(page)}` |
| `pagination/dummy/playground.tsx` | `/blog?page=${String(page)}` | `#page-${String(page)}` |
| `pagination/dummy/rtl.tsx` | `/blog?page=${String(page)}` | `#page-${String(page)}` |
| `pagination/dummy/sizes.tsx` | `/blog?page=${String(page)}` | `#page-${String(page)}` |
| `pagination/dummy/states.tsx` | `/blog?page=${String(page)}` | `#page-${String(page)}` |
| `pagination/dummy/two-navs.tsx` | `/orders?page=${String(page)}` | `#page-${String(page)}` |
| `pagination/dummy/wide-numbers.tsx` | `/orders?page=${String(page)}` | `#page-${String(page)}` |
| `popover/dummy/hover.tsx` | `/docs/billing` | `#` |
| `table/dummy/basic.tsx` | `/invoices/${invoice.id}` | `#${invoice.id}` |
| `table/dummy/empty.tsx` | `/team/invite` | `#` |
| `table/dummy/row-actions.tsx` | `/orders/${String(order.number)}` | `#order-${String(order.number)}` |

## Tests, e2e specs, mutation rows, READMEs, changeset

- **Unit tests updated** to the new hrefs:
  - accordion, avatar-group, breadcrumb and table: `*.demos.ssr`;
  - table: `table.row-actions.ssr`;
  - navbar: `navbar.demos.ssr` (the `current` hrefs too);
  - pagination: `pagination.demos.ssr`;
  - drawer: `drawer.demos.props.dom`;
  - popover: `popover.demos.dom`.
- **E2e specs updated**:
  - `navbar.spec` swaps the mark onto `href="#changelog"`;
  - `keyboard-breadcrumb`, `keyboard-navbar` and `keyboard-pagination` used to wait for a request to `/docs`, `/components` or `/blog?page=7`. They now assert the URL ends in `#docs`, `#components` or `#page-7` after Enter;
  - `pagination-compact` reads the page number from `page-N`.
- **Mutation rows**: all 1943 rows still find their `from` text exactly once (checked by script before and after). No row changed.
- **READMEs**: `pnpm check:readme` reports `readme: ok (52 components)`. No README changed.
- **Changeset**: `.changeset/pre/demo-links.md`, patch. `package.json` `files` excludes `dist/**/dummy`, but `dist/registry/<slug>.json` ships in the tarball and embeds the demo source the CLI copies, so the shipped content changed.

## Gate output (cloud, Linux)

| Gate | Result |
|---|---|
| `pnpm lint` (NODE_OPTIONS=--max-old-space-size=8192) | `eslint .` EXIT 0 |
| `pnpm typecheck` | `tsc --noEmit` EXIT 0 |
| library unit tests (13 touched components plus `src/test` and `src/shared`) | `Test Files 323 passed (323)`, `Tests 7523 passed (7523)` |
| `pnpm check:structure` | `check-structure: ok (27 warnings)` (the size warnings already on base) |
| `pnpm check:readme` | `readme: ok (52 components)` |
| docs `docs:data` | `docs:data: 52 folders, 46 catalog cards, 509 demos, 0 issues` |
| docs `typecheck` | `✓ Types generated successfully`, EXIT 0 |
| docs `lint` | EXIT 0 |
| docs `test` | `Test Files 48 passed (48)`, `Tests 345 passed (345)` |
| docs `docs:build` | EXIT 0 (library build, then 3317 static pages) |
| docs `check:static` | the "after" line above, EXIT 0 |

### Library e2e (cloud Chromium 1243)

The 19 specs for the touched components were run on the head: accordion, avatar-group, banner, banner-dismiss, breadcrumb, drawer, navbar, pagination, pagination-compact, popover, table, focus-ring, and keyboard-accordion, -banner, -breadcrumb, -drawer, -navbar, -pagination and -popover.

The first run had 58 failed and 1338 passed. On a clean worktree of the base I ran the 7 specs that had failures: 8 failed and 781 passed. Fifty failures were only on the head, and all came from this change:

- 46 in `pagination-compact`;
- 4 in keyboard-breadcrumb and keyboard-navbar, "Enter follows".

I fixed both groups in commits `d1c199d0` and `fac18652`. After the fixes, `pagination-compact` passed 49 of 49, and the "Enter follows" tests of keyboard-breadcrumb, keyboard-navbar and keyboard-pagination passed 6 of 6.

The 8 failures left are identical on base and head. They are the known cloud baseline:

- accordion: forced colours, the focus ring, dark and light;
- pagination: forced colours, the current page box, dark and light;
- navbar: six links at 320 px, rtl, Tab into view and wheel versus snapping;
- popover: hostile content scrolling sideways, and sixty lines at 320 x 480.

Not run in the cloud:

- the cross-component specs (target-size, contain, collections, overlay-scroll, axe);
- the docs site's Playwright `test:e2e`;
- `pnpm test:mutation`;
- a full `pnpm check`.

The laptop reruns `pnpm check` and `docs:check`.

## Left open

- **Form actions**: `form/dummy/basic.tsx` and `rtl.tsx` post to `/subscribe`, `form/dummy/server-errors.tsx` posts to `/contact`, and `navbar/dummy/with-search.tsx` sends its search form to `/search`. These are form actions, not hrefs, so no crawler follows them and the guard does not cover them, but submitting one on the site lands on a 404. I left them as they are because the job is about hrefs. Changing them to `#` is a one-line follow-up if Omar wants it.
- **Navbar brand on `/ar` pages**: the demos' `NavbarBrand href="/"` resolves through the redirect to `/en`, which is not a 404.
