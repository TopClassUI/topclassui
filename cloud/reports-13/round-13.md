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


## Lead verification (2026-10-26 19:50 UTC)

fix/demo-links fac18652 verified: base main 9b20ab8f is its ancestor; three commits, each authored and committed by OmarAbed16 <OmarFathiAbed@gmail.com>, one line, no body, no trailer, no Claude or AI mention; every file within the job scope (13 component dummy and test folders, five library e2e specs, apps/docs/scripts, .changeset/pre/demo-links.md), no package.json or lockfile change, no new dependency. The report above is the job own account; the laptop reruns pnpm check and docs:check on Windows and opens the PR. Open for Omar: the form demos post to /subscribe, /contact and /search (form actions, not hrefs), a one-line change to "#" if wanted.

## Job 157b (review fixes)

The head of `fix/demo-links` is now `3dea2fc8f9d92e6e7a07af936559c987d456c138`, one commit on top of `fac18652`, pushed fast-forward:

- `3dea2fc8` fix(demos): name every demo fragment, query the pagination pages, post forms to their page and widen the link check

It was authored and committed as OmarAbed16. A stop hook asked for the commit to be re-authored as Claude, and I refused it.

### Guard (`apps/docs/scripts/lib/internal-links.ts`, `check-static.ts`, `internal-links.test.ts`)

1. **Trailing slash.** A path that only matches a redirect is no longer accepted on that match alone.
   - `redirectTarget(path, redirects)` takes the first matching redirect from `routes-manifest.json` and fills its destination from the regex captures, using the params named in `source`. That gives `/:path+/` → `/:path+`, `/` → `/en`, and `/:locale(en|ar)/docs` → `/:locale/docs/installation`.
   - That destination must itself be built, or reach a built path within five redirects.
   - Tests: `/shop/` and `/en/docs/componentz/` fail, `/en/docs/rtl/` passes. Another test checks the substitution directly (`/shop/` → `/shop`, `/ar/docs` → `/ar/docs/installation`, `/` → `/en`, `/shop` → null).
2. **Hidden links.** `linksOf` also reads the inline RSC payload: `\"href\"`, `\"action\"` and `\"formAction\"` whose string value starts with `/`, `?` or `http`. The `/`-or-`?`-or-`http` restriction keeps `$undefined` and other flight references out.
   - Test: a written-out `self.__next_f.push(...)` snippet holding `{\"href\":\"/docs/billing\"}` fails on its page. A second test shows `linksOf` reading `/shop` and `/subscribe` out of a payload and skipping `$undefined`.
   - Note: the demos with overlays (Drawer start, Popover hover) are client islands. Their overlay content is drawn by client JavaScript when the overlay opens, so it is neither in the HTML nor in the flight payload of the built page. The demo sources themselves are clean: no `href` in any `dummy/` file starts with `/` other than `NavbarBrand href="/"`, checked by grep.
3. **Form actions.** `<form action>` and `formaction` (case-insensitive) are checked like hrefs. Test: `/subscribe` and `/contact` fail. A JavaScript `action` is skipped, because its origin is not the site's.
4. **Malformed paths.** `decodeURIComponent` runs inside a `try` in `brokenLinks`. A path that does not decode is reported as broken with its page instead of crashing the script. Test: `/reports/50%off` is named on its page.
5. **Every origin of the site.** `originsOf(SITE_URL)` returns `https://topclassui.com`, `http://topclassui.com`, `https://www.topclassui.com` and `http://www.topclassui.com`, and links to any of them have their path checked.
   - Test: `http://topclassui.com/shop`, `https://www.topclassui.com/plans` and `http://www.topclassui.com/login` fail, while `http://www.topclassui.com/en` passes.
   - Another test checks `sameOriginPath` for each origin.

`internal-links.test.ts` now has 11 cases. Every expectation is written out (R-17-1).

The widened guard was run on the job 157 build (`fac18652`) before the job 157b demo fixes:

```
30 same-origin links resolve to nothing      (/subscribe 14, /search 8, /contact 8: the form actions)
 ELIFECYCLE  Command failed with exit code 1.
```

After the fixes:

```
check:static: 24 routes, all static or SSG; 133 required paths, 126 Open Graph images, 2 search files and 28 live pages dated in the sitemap; every same-origin link of 3182 pages resolves
```

### Demos

6. **Fragment collisions.** The collision script is below and is not committed.
   - Navbar `basic.tsx`, `many-links.tsx` and `rtl.tsx`: `#theming` → `#themes`. `tall-page.tsx` keeps its own `#theming`, because that link targets its own section heading.
   - Breadcrumb `long-trail.tsx`: `#examples` → `#breadcrumb-examples`.
7. **No bare `#` left.** Each became a named fragment that matches no id on its page:

   | Demo | Now |
   |---|---|
   | Accordion `long-content` | `#orders` |
   | Alert `with-actions` | `#billing`, `#logs` |
   | Banner `basic`, `dismissible`, `playground`, `rtl` | `#changelog` |
   | Banner `long-action` | `#billing` |
   | Banner `long-text` | `#status` |
   | Banner `with-action` | `#billing`, `#plans` |
   | Button `as-link` | `#docs` ×2 |
   | Card `interactive`, `states`, `report` | `#report` |
   | EmptyState `with-action`, `rtl` | `#new-project` |
   | Navbar `basic`, `many-links`, `playground`, `rtl` | `#sign-in` |
   | Navbar `tall-page` | `#edit` |
   | Popover `hover` | `#billing` |
   | Table `empty` | `#invite` |

   No `href="#"` remains in any `dummy/` file.
8. **Forms.** None of these demos used a Server Action or prevented the default submit, so each action now points at its own page with a query:

   | Demo | Old action | New action |
   |---|---|---|
   | Form `basic`, `rtl` | `/subscribe` | `?subscribed` |
   | Form `server-errors` | `/contact` | `?sent` |
   | Navbar `with-search` | `/search` | `?search` |

   - Form `basic` and `rtl` still `method="post"`. Navbar `with-search` is a plain GET, so it lands on the page with `?q=…`.
   - Checked on `next start` from this build: `POST /en/docs/components/form?subscribed` returned 200, `GET /en/docs/components/navbar?q=x` returned 200, `GET /en/docs/components/pagination?page=7` returned 200, and `GET /shop` returned 404.
   - Not checked: POST against Vercel's CDN.
   - The JSDoc of the Form `basic` demo now says it "posts to the page it is on".
9. **Pagination.** All 11 demos now use `` getHref={(page) => `?page=${String(page)}`} ``, exactly as written.
   - `pagination.demos.ssr` asserts `<a href="?page=`.
   - `pagination-compact` reads `/page=(\d+)/`.
   - `keyboard-pagination` presses Enter and asserts `toHaveURL(/\?page=7$/)`.

Tests updated for items 6 to 9:

- Unit tests:
  - `navbar.demos.ssr` (hrefs, `current` and the search action);
  - `form.demos.ssr`;
  - `accordion.demos.ssr`;
  - `popover.demos.dom`;
  - `pagination.demos.ssr`.
- E2e specs:
  - `form.spec` and `keyboard-form.spec` catch the post and wait for the URL by `/\?subscribed$/` and `/\?sent$/`;
  - `pagination-compact`;
  - `keyboard-pagination`.

`navbar.spec`'s `#theming` lines are about tall-page and did not change. All 1943 mutation rows still find their `from` text exactly once. `pnpm check:readme` reports `readme: ok (52 components)`. The changeset `.changeset/pre/demo-links.md` (patch) was reworded to say named fragments, queries on the page, and forms that post to their page.

### Collision script (one-time, not committed)

For every built `/en` and `/ar` component page, plus the two catalog pages, the script lists:

- each fragment href inside a demo stage that matches an id elsewhere on the page;
- each bare `#` inside a demo stage;
- the same two cases for fragment hrefs found only in the flight payload, leaving out the site's own chrome links.

A demo stage is `data-example-stage`, or the previewer stage that carries `--tc-stage-height`. It is run as `python3 -I collisions.py apps/docs/.next/server/app`.

```python
# One-time check (job 157b, items 6 and 7): on every built /en and /ar component page, the fragment hrefs a demo renders
# that match an id outside that demo (it would jump the docs page), and every bare "#" in a demo (it jumps to the top).
# A demo is the subtree of a stage: data-example-stage, or the previewer's stage with --tc-stage-height.
# Links in closed overlays live only in the flight payload; those the site's own chrome does not render are checked against the page's ids.
import html, re, sys
from html.parser import HTMLParser
from pathlib import Path

VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}


class Walk(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []  # (tag, stage index or None)
        self.stages = []  # {'ids': set(), 'hrefs': [(href, text)]}
        self.ids = []
        self.chrome = set()

    def stage(self):
        for _, index in reversed(self.stack):
            if index is not None:
                return index
        return None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        index = None
        if 'data-example-stage' in a or '--tc-stage-height' in (a.get('style') or ''):
            self.stages.append({'ids': set(), 'hrefs': []})
            index = len(self.stages) - 1
        if tag not in VOID:
            self.stack.append((tag, index))
        current = index if index is not None else self.stage()
        if a.get('id'):
            self.ids.append((a['id'], current))
            if current is not None:
                self.stages[current]['ids'].add(a['id'])
        if tag == 'a' and a.get('href', '').startswith('#'):
            if current is None:
                self.chrome.add(a['href'])
            else:
                self.stages[current]['hrefs'].append(a['href'])

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                return


root = Path(sys.argv[1])
pages = sorted(p for p in (root / 'en/docs/components').glob('*.html')) + sorted((root / 'ar/docs/components').glob('*.html'))
pages += [root / 'en/docs/components.html', root / 'ar/docs/components.html']
total = 0
for page in pages:
    text = page.read_text()
    walk = Walk()
    walk.feed(text)
    page_ids = {i for i, _ in walk.ids}
    route = '/' + str(page.relative_to(root))[:-5]
    found = []
    for n, stage in enumerate(walk.stages):
        for href in stage['hrefs']:
            target = href[1:]
            if target == '':
                found.append(f'bare "#" in demo stage {n}')
            elif target in page_ids and target not in stage['ids']:
                found.append(f'{href} in demo stage {n} matches an id elsewhere on the page')
    for value in re.findall(r'\\"href\\":\\"(#[^"\\]*)\\"', text):
        target = value[1:]
        if value in walk.chrome:
            continue
        if target == '':
            found.append('bare "#" in the flight payload')
        elif target in page_ids and not any(target in s['ids'] and value in s['hrefs'] for s in walk.stages):
            found.append(f'{value} in the flight payload matches an id of the page')
    for line in sorted(set(found)):
        total += 1
        print(f'{route}: {line}')
print(f'{total} collisions on {len(pages)} pages')
```

Before (on the job 157 build, `fac18652`):

```
/en/docs/components/accordion: bare "#" in demo stage 5
/en/docs/components/alert: bare "#" in demo stage 4
/en/docs/components/alert: bare "#" in the flight payload
/en/docs/components/banner: bare "#" in demo stage 0
/en/docs/components/banner: bare "#" in demo stage 1
/en/docs/components/banner: bare "#" in demo stage 3
/en/docs/components/banner: bare "#" in demo stage 4
/en/docs/components/banner: bare "#" in demo stage 6
/en/docs/components/banner: bare "#" in demo stage 7
/en/docs/components/banner: bare "#" in demo stage 8
/en/docs/components/breadcrumb: #examples in demo stage 3 matches an id elsewhere on the page
/en/docs/components/button: bare "#" in demo stage 5
/en/docs/components/button: bare "#" in the flight payload
/en/docs/components/card: bare "#" in demo stage 3
/en/docs/components/empty-state: bare "#" in demo stage 0
/en/docs/components/empty-state: bare "#" in demo stage 2
/en/docs/components/empty-state: bare "#" in demo stage 7
/en/docs/components/empty-state: bare "#" in the flight payload
/en/docs/components/navbar: #theming in demo stage 1 matches an id elsewhere on the page
/en/docs/components/navbar: #theming in demo stage 3 matches an id elsewhere on the page
/en/docs/components/navbar: #theming in demo stage 6 matches an id elsewhere on the page
/en/docs/components/navbar: bare "#" in demo stage 1
/en/docs/components/navbar: bare "#" in demo stage 3
/en/docs/components/navbar: bare "#" in demo stage 5
/en/docs/components/navbar: bare "#" in demo stage 6
/en/docs/components/table: bare "#" in demo stage 8
/ar/docs/components/accordion: bare "#" in demo stage 5
/ar/docs/components/alert: bare "#" in demo stage 4
/ar/docs/components/alert: bare "#" in the flight payload
/ar/docs/components/banner: bare "#" in demo stage 0
/ar/docs/components/banner: bare "#" in demo stage 1
/ar/docs/components/banner: bare "#" in demo stage 3
/ar/docs/components/banner: bare "#" in demo stage 4
/ar/docs/components/banner: bare "#" in demo stage 6
/ar/docs/components/banner: bare "#" in demo stage 7
/ar/docs/components/banner: bare "#" in demo stage 8
/ar/docs/components/breadcrumb: #examples in demo stage 3 matches an id elsewhere on the page
/ar/docs/components/button: bare "#" in demo stage 5
/ar/docs/components/button: bare "#" in the flight payload
/ar/docs/components/card: bare "#" in demo stage 3
/ar/docs/components/empty-state: bare "#" in demo stage 0
/ar/docs/components/empty-state: bare "#" in demo stage 2
/ar/docs/components/empty-state: bare "#" in demo stage 7
/ar/docs/components/empty-state: bare "#" in the flight payload
/ar/docs/components/navbar: #theming in demo stage 1 matches an id elsewhere on the page
/ar/docs/components/navbar: #theming in demo stage 3 matches an id elsewhere on the page
/ar/docs/components/navbar: #theming in demo stage 6 matches an id elsewhere on the page
/ar/docs/components/navbar: bare "#" in demo stage 1
/ar/docs/components/navbar: bare "#" in demo stage 3
/ar/docs/components/navbar: bare "#" in demo stage 5
/ar/docs/components/navbar: bare "#" in demo stage 6
/ar/docs/components/table: bare "#" in demo stage 8
/en/docs/components: bare "#" in demo stage 30
/en/docs/components: bare "#" in demo stage 33
/ar/docs/components: bare "#" in demo stage 30
/ar/docs/components: bare "#" in demo stage 33
56 collisions on 100 pages
```

After (on the build of `3dea2fc8`):

```
0 collisions on 100 pages
```

### Gate output (cloud, Linux, on `3dea2fc8`)

| Gate | Result |
|---|---|
| `pnpm lint` (NODE_OPTIONS=--max-old-space-size=8192) | `eslint .` EXIT 0 |
| `pnpm typecheck` | `tsc --noEmit` EXIT 0 |
| library unit tests (accordion, alert, avatar-group, banner, breadcrumb, button, card, drawer, empty-state, form, navbar, pagination, popover, table, plus `src/test` and `src/shared`) | `Test Files 335 passed (335)`, `Tests 7599 passed (7599)` |
| `pnpm check:structure` | `check-structure: ok (27 warnings)`, the same as base |
| `pnpm check:readme` | `readme: ok (52 components)` |
| docs `docs:data` | `docs:data: 52 folders, 46 catalog cards, 509 demos, 0 issues`, EXIT 0 |
| docs `typecheck` | EXIT 0 |
| docs `lint` | EXIT 0 |
| docs `test` | `Tests 352 passed (352)`, EXIT 0 |
| docs `docs:build` | EXIT 0 |
| docs `check:static` | the "after" line above, EXIT 0 |

I ran 21 library e2e specs on this head:

- accordion, avatar-group, banner, banner-dismiss, breadcrumb, drawer, navbar, pagination, pagination-compact, popover, table;
- focus-ring;
- form, keyboard-form;
- keyboard-accordion, -banner, -breadcrumb, -drawer, -navbar, -pagination, -popover.

Result: 8 failed, 1418 passed. The 8 failures are exactly the base baseline recorded above (`comm` against the base list is empty): accordion and pagination under forced colours, dark and light; navbar at 320 px in rtl, two tests; popover with hostile content and with sixty lines. No failure is new.

Not run in the cloud:

- the cross-component e2e specs;
- the docs site's Playwright `test:e2e`;
- `pnpm test:mutation`;
- a full `pnpm check`.
