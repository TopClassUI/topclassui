# Figma facts for the docs site

The docs website, `apps/docs`: a Next.js 16 app in this repo, built with TopClass UI itself,
written in MDX, in English and Arabic, static from top to bottom. It is the design file for
that app, in the shape of `docs/figma/unit-5.md`: the facts in fenced blocks, and a **Build
this** block that wins where the two disagree.

The build order is the shell and the home page first, then the getting-started pages, then
the component page template generated for all 46, then the rest (see Build order). The site
is built after the first npm release, 0.1.0 marked beta, and consumes that package from the
workspace, as a user would.

**Read this instead of Figma.** File `BxRSdAVOhk9Hj3Tkq4tjcy`, page "Docs pages" (3:120),
read on 2026-10-17 by one reader, read-only: 34 `use_figma` plugin calls, 31 returned, 3
returned an error and wrote nothing. No screenshot: every fact is text, layer names, sizes
and variable bindings, not pixels. That reader's note is the lead's handoff file
`handoff/release-plan/site-figma-facts.md`, and **it is the Figma for this file**: the
planner of this file did not open Figma, and every facts block below is copied from that
note. Where a fact looks wrong, build from the Build this block and say so in the pull
request.

**The primary colour is now blue.** A theme change (`feat/theme-blue-scrollbar`: blue
primary in light and dark, themed scrollbars) merges before the site is built, and Figma is
being updated to match. Every violet in the facts below (the Colors page, the Theme builder
output, the glows on Home) is out of date. The site never writes a colour by hand: it reads
`--tc-*` tokens, so it turns blue with the tokens. Only the copy that names a shade
("violet-600") must be rewritten, and Build this says where.

## How to use this file

- One step of the build order per branch and per pull request, as for the units.
- Read "Rules for all pages" and "Shared pieces" before any page. Every page section assumes
  them.
- Each page has a facts block (what Figma draws, copied) and **Build this** (what to build).
  Build this wins.
- The copy in the facts is the first draft, not the final text. The copy rules below apply to
  every line, and several lines are stale (listed per page).
- A choice is marked "choice N" and has a default that is built. Nothing here waits for Omar,
  except the scope rows asked before the first step (Build order, step 0).
- The site's code lives in `apps/docs`. No step changes the library's components, except the
  `dummy/` additions of step 3, which are library pull requests of their own.
- **Paths.** The release plan (`docs/plan/release.md`, R3) moves the library into
  `packages/topclassui/`. Every library path in this file (`src/`, `scripts/`, `raw/`,
  `docs/icons.md`) is relative to `packages/topclassui/`, the same rule `docs/RULES.md` gets in R3.
  Site paths start with `apps/docs/`.
- **Reviewed on 17 October 2026** against the repo and the release plan. The fixes are folded
  into the sections below; nothing here is a second list to reconcile.

## What the site is, in one table

| Part | Default | Source |
|---|---|---|
| Where | `apps/docs`, a pnpm workspace member beside the library | PLAN 4, PLAN 16 |
| Framework | Next.js 16 App Router, `next` 16.3.8 pinned exactly (choice 1), React 19.3.0 as installed | PLAN 2 |
| Rendering | Fully static: every page from `generateStaticParams`, `dynamicParams = false`, no `searchParams`, `cookies()`, `headers()` or `connection()`. Cache Components off | PLAN 15.3, DECISIONS 2026-09-21 (Cache Components stays off) |
| The library | `"topclassui": "workspace:*"`, resolved through its `exports` map to `dist`, never to `src`. The library's `build:watch` beside `next dev` | PLAN 4, DECISIONS 2026-09-21 (the docs app consumes `dist`) |
| Content | MDX for prose pages; typed TypeScript data for the 46 components; the component's own `meta.ts`, `schema.ts`, `types.ts` and `dummy/` files for everything generated | PLAN 16 |
| Code highlighting | Shiki at build time, in a server component, passed to `CodeBlock`'s `highlighted` prop | PLAN 15.3, unit-5 choice 12 |
| Locales | `/en/...` and `/ar/...`, English slugs in both, `/` redirects to `/en` | PLAN 15.3 |
| Modes | Light, Dark, Ocean; the site opens in the visitor's system mode, light when the system does not say dark (choice 9) | DECISIONS 2026-09-25 (dark first) |
| Hosting | Vercel, on `topclassui.com` | PLAN O5 |
| Search | A build-time JSON index in the library's `Command` palette, loaded on first open | choice 6 |

## What was checked, and what was not

Checked on 2026-10-17 on `main` at 9fb1288, in the worktree `rv-spinner` (branch
`docs/release-and-site-plan`), by the planner of this file, reading files and running
commands:

- **The three handoff notes** (`site-figma-facts.md`, `site-rules.md`, `release-facts.md` in
  `handoff/release-plan/`). The Figma facts are copied from the first, not re-read in Figma.
- **The component data the site generates from.** 52 folders under `src/components`: the
  46 cards, Field, Form and Meter, and `icon`, `svg`, `icon-registry`. 391 demo files in 49
  `dummy/` folders (none for the three icon folders), 48 with an `rtl.tsx`, 35 with a
  `basic.tsx`, 14 with a `states.tsx`. 43 `schema.ts`; of the 46, five have none:
  `breadcrumb`, `card`, `empty-state`, `kbd`, `timeline`. 52 `meta.ts`, each `satisfies
  ComponentMeta` (`src/shared/meta.ts`): name, slug, category, tier, status, rendering,
  `baseUi`, `baseUiRange`, `optionalDeps`.
- **How the demos import.** Over all 391 files: `../index.js` 389 times, `#components/<x>/index.js`
  241, `#icons/...` 92, `#shared/...` 44, `react` 20, `../types.js` 5, `../skeleton.js` 3, and
  the bare `topclassui` once. Every demo is a default export with no props.
- **meta.ts against Figma.** The categories in `meta.ts` are PLAN 18's ten
  (`typography-and-layout`, `media-and-display`, `actions`, `forms`, `overlays`,
  `navigation-and-disclosure`, `data`, ...), not the seven sections Figma draws (Actions,
  Forms, Display, Data, Feedback, Overlays, Navigation). Only `tree-view` is `data` in
  `meta.ts`; Figma's Data section holds four. Rendering differs on two cards: `avatar-group`
  and `stepper` are `server` in `meta.ts` and `split` on their Figma chips (Stepper was built
  as a server component on purpose, unit-5 choice 10). Names differ: `meta.ts` says
  `Dropdown`, `Command`, `OtpField` where Figma says "Dropdown menu", "Command palette",
  "OTP field" and the export is `OTPField`.
- **What the site can reuse.** `scripts/lib/readme.ts` (`rowsFromJsonSchema`, `mergeRows`,
  `PropRow`), `scripts/lib/readme-types.ts` (`ownPropsOf`, `familyOf`),
  `scripts/lib/harness.ts` (`MODES`, `DIRECTIONS`, `LANG`, `findDemos`, `compileCss`),
  `scripts/lib/contrast-checks.ts` (`MARGIN` 0.15, `VISIBLE_STEP` 1.06, `SURFACES`),
  `src/shared/theme/` (`THEME_SCRIPT`, `THEME_STORAGE_KEY` = `tc-theme`, `ThemeScript`;
  there is **no** `useTheme` yet), `src/shared/provider/` (`TopClassProvider`),
  `src/shared/labels/` (`en.ts` 128 lines, `ar.ts` 186), Navbar's
  `NAVBAR_OFFSET_VARIABLE` = `--tc-sticky-top`, CodeBlock's `highlighted?: ReactNode`.
  `src/styles.css` already lets `data-hover`, `data-focus-visible` and `data-active` force the
  three states, so the states block needs no interaction.
- **The blue branch.** `git diff main...feat/theme-blue-scrollbar -- src/tokens.css`:
  `--tc-primary-solid` violet-600 to blue-600, `--tc-primary-on-soft` to blue-800 (light) and
  blue-400 (dark), hover and active to blue-700 and blue-800. Two commits, 54 files
  (`git diff --stat main...feat/theme-blue-scrollbar` on 2026-10-17).
- **The package today.** `topclassui` 0.0.0, no `exports` map, dependencies `@base-ui/react`
  1.8.0, `class-variance-authority` 0.7.1, `clsx` 2.1.1, `server-only` 0.0.1,
  `tailwind-merge` 3.7.0, `zod` 4.6.5; peers `react` and `react-dom` `^19.0.0`,
  `tailwindcss` `^4.2.0`. 84 SVGs in `raw/`.
- **The candidate dependencies, on npm** (`npm view`, 2026-10-17): `next` 16.3.8, published
  30 Sept, 186 MB unpacked, `node >=20.9.0` (16.4.0 6 Oct, 16.4.2 15 Oct); `@next/mdx`
  16.3.8, 15 KB; `@mdx-js/loader` 3.1.1, 15 KB; `remark-gfm` 4.0.1, 22 KB; `shiki` 4.5.0,
  602 KB alone; `schema-dts` 2.1.0, 1 MB, types only. The rules reader measured the rest
  (`@mdx-js/react` 3.1.1 14 KB, `@types/mdx` 2.0.14 10 KB, `@lhci/cli` 0.15.1 98 KB,
  `@vercel/analytics` 2.0.1 497 KB, `pagefind` 1.5.2 37 KB plus a 58 MB binary, shiki with its
  dependencies about 11.4 MB).

Not checked:

- **No Next.js app was built.** Nothing in this file was compiled as a Next.js 16 page. Every
  Next API named here (`generateStaticParams`, `generateMetadata`, `next/root-params`,
  `next/og`, `next/font`, `sitemap.ts`, `robots.ts`, `manifest.ts`, the `turbopack` options in
  `next.config.ts`, MDX plugin options under Turbopack) is checked against the installed
  types before it is used, as R-0-1 asks, and any difference goes in `docs/DECISIONS.md`.
- **No class string in this file was compiled or linted**, unlike the unit files. The site's
  classes are written in step 1 against the repo's stylesheet and lint. This file names the
  shared constants and tokens to use, not the strings.
- **No pixel.** The Figma reader took no screenshot, so the look of the glows, shadows and
  the Home gradients is known only as values.
- **The release.** The `exports` map, the import paths (`topclassui/button` or another
  shape), and whether 0.1.0 ships components or only the CLI are the release plan's to
  decide. This file assumes that plan's defaults (subpath imports, components in the
  package, the CLI after 0.1.0) and marks every place that changes if it decides otherwise.

## What the Figma reading changes

The reader's surprises that change the build, each with the answer this file takes. The
numbers are the reader's.

| # | Found | This file builds |
|---|---|---|
| 1 | "Icons" replaced by "The install command and this site" on Home, the Components page and the Navbar card | "Icons" everywhere. A find-and-replace accident |
| 2 | Only a catalog page of 46 cards; no page per component | Both: the catalog, and one page per component (PLAN 16, PLAN 20, and SEO). Shared piece S8 is the card both use |
| 3 | No English/Arabic switch; an LTR/RTL switch that is a static drawing | The LTR/RTL switch becomes the language switch: two links to the same page in the other locale (choice 4) |
| 4 | Figma routes are flat (`/en/docs/installation`); PLAN's are nested (`/docs/getting-started/*`) | Figma's flat routes for the guide pages; components under `/en/docs/components/<slug>` (choice 3) |
| 5 | Nothing is sticky | The navbar, the sidebar and On this page are sticky, as PLAN 10.5 rule 8 asks |
| 6 | Text sizes, fonts and spacing are raw; only colour is bound | Sizes come from the library's type scale and spacing; the drawn sizes are read as the nearest step (S2) |
| 7 | Primary is violet | Blue, from the tokens |
| 8 | Install paths disagree three ways | One path, from the release plan (S8, install row) |
| 9 | Install-row names mis-cased on 7 cards; part families imported by a name the sample does not use | Names come from the code: `meta.ts` and the component's exports |
| 10 | Code samples import Heading, Text, IconButton, Link, `topclassui/utils`, `topclassui/vite`, `registerIcons`, 16 connectors | The code tab shows the repo's `dummy/` files, never the Figma samples (S7) |
| 11 | Stale status lines on Changelog, Accessibility, Home, Server first | Rewritten for 0.1.0 beta (listed per page) |
| 12 | Connector counts disagree (16, 3, 0) | No connector page in the first site release (choice 11) |
| 14 | The "next" chain has slips | "Next" is derived from the page order, never written by hand |
| 15 | Arabic sidebar lacks "Your first component" and MORE | The Arabic sidebar is the English one, translated: one list, two languages |
| 17 | The Components page is spaced differently from the docs pages | One shell spacing for every docs page, the Components page included |
| 18 | Chip wording differs by page | One chip, generated (S8) |

## Rules for all pages

These hold on every page and every step. Where a page's Build this says otherwise, the page
wins for that page only.

1. **Built with TopClass UI.** Every control, card, table, code block, tab, badge and
   navigation part on the site is a library component imported from the package, as a user
   imports it. Where the library has no component for a need (S12 lists them), the site uses
   plain HTML with the library's semantic classes and a `{/* TODO(tc): ... */}` marker, as
   PLAN 16 says. The site never imports from `src/` or `#shared/*`. The site's own interactive
   pieces take their focus ring, hover and target size from `topclassui/classes` (release
   plan C18), as a component does.
2. **Tokens only.** No hex, no palette class, no `dark:`; the same rules as `src/`
   (R-5.2-1 to R-5.2-5, R-5.3-1, R-5.3-3). The repo's config does not reach the site: after
   the release's R3 it sits in `packages/topclassui/`, and its custom rules apply to `src/**` only.
   So `apps/docs` has its own `eslint.config.ts` that imports the plugin from
   `../../packages/topclassui/eslint-rules/index.ts` and turns on, for `app/**`, `components/**` and
   `lib/**`: `logical-properties-only`, `semantic-classes-only`, `no-dynamic-class-names`,
   `shared-class-constants`, `style-sets-tokens-only`, `presence-state-attributes`, `no-enum`,
   `one-line-comments` and `text-comes-from-labels`, plus `no-derived-expectations` on the
   site's tests. `icon-loaders-stay-server` is left off: the site imports `topclassui/icon`,
   never the loader map. A test in step 1 lints one bad file per rule and expects each error,
   so a rule that silently does not run fails the step. The glows on Home are `color-mix()` of `--tc-primary-solid` and
   friends, never Figma's raw hex.
3. **Logical CSS.** `ps-`, `pe-`, `ms-`, `me-`, `inset-s-`, `text-start`; never `left` or
   `right`. Every page renders correctly at `dir="rtl"` without a second stylesheet.
4. **Static.** No page reads a request. A page that needs a value at request time is a design
   error, not a reason to turn static generation off.
5. **One source per fact.** The page list, the sidebar, "next", the sitemap, the search index,
   `llms.txt` and the metadata all read one typed page registry (S1). The 46 cards, their
   pages, the search entries and the Open Graph images all read one generated component file
   (S7). Nothing is written twice.
6. **Copy for a beginner who skims.** Lead each section with the command or the code. One or
   two lines of prose per section, never a paragraph; a reason that is not needed to make the
   code work is cut or becomes a table row. Next.js is named before React everywhere. No
   phase numbers, no tiers, no catalog rows, no competitor named. A budget is called a budget.
   Figma's copy is the first draft; Omar approves the final text.
7. **English and Arabic.** Every page exists in both locales from the first release (choice
   10). Every string the site writes comes from the site's own labels (`apps/docs/labels/en.ts`
   and `ar.ts`) or the page's MDX, never a literal in a component. Code stays in Latin and
   left to right inside an Arabic page.
8. **Accessible.** WCAG 2.2 AA, as the library: one `h1` per page, headings in order,
   landmarks (`header`, `<nav aria-label="Site">`, `main`, `<nav aria-label="On this
   page">`, `footer`), a skip link, a visible focus ring on every interactive element,
   24 px targets and 44 px under a coarse pointer, `aria-current="page"` on the current
   sidebar row, every repeated control named by what it acts on (PLAN 16's table).
9. **Fast.** The budgets of PLAN 14: LCP under 1.8 s, CLS under 0.02, TBT under 150 ms in the
   lab (Lighthouse mobile, median of five runs against `next build && next start`); INP under
   200 ms and LCP under 2.5 s at p75 in the field. Lighthouse 100 in Accessibility, Best
   Practices and SEO on every page.
10. **No dependency without its name, purpose and size** in the pull request. The ones this
    file expects are listed in S1, each as a candidate; none is installed by this file.

## Shared pieces

Built in the order given, mostly in step 1. Each page section leans on them.

### S1. The app: folders, configuration, the page registry

```text
Not drawn. Figma draws pages, not files.
PLAN 4: apps/docs, "Next.js App Router: docs, colors, icons, preview".
PLAN 15.3: app/(site)/[locale]/layout.tsx is the root layout, there is no app/layout.tsx;
  generateStaticParams returns en and ar; dynamicParams = false; / redirects to /en through
  redirects() in next.config.ts; not-found.tsx lives inside [locale].
PLAN 16: app/(preview)/preview/[theme]/[dir]/layout.tsx is a second root layout.
PLAN 4 / DECISIONS: the docs app consumes dist; transpilePackages is not used; Turbopack does
  not resolve ./client.js to client.tsx. exactOptionalPropertyTypes is on for apps/docs.
Repo: tsconfig.json already excludes "apps"; eslint.config.ts already ignores apps/**/.next;
  pnpm-workspace.yaml has no packages list yet.
```

**Build this.**

- **The workspace.** The release plan's R3 already writes `pnpm-workspace.yaml` with
  `packages/*` and `apps/*`, and puts the library in `packages/topclassui/`; nothing to add.
  `apps/docs/package.json` is private, named `@topclassui/docs`, and depends on
  `"topclassui": "workspace:*"`. pnpm does not hoist, so the app names its own `next`,
  `react` and `react-dom` (19.3.0, as the library), `tailwindcss` and `@tailwindcss/postcss`
  (both 4.3.3), `typescript`, `vitest`, `tsx`, `eslint`, `typescript-eslint`, `@eslint/js` and `jiti` (the
  library's versions). Scripts
  at the root: `docs:dev` (`pnpm --filter topclassui build:watch` beside `next dev -p 4610`),
  `docs:build` (library `build`, then `docs:data`, then `next build`), `docs:check` (S13).
- **Folders.**

  ```text
  apps/docs/
    app/
      (site)/[locale]/layout.tsx        the root layout: html lang dir data-theme, fonts, provider
      (site)/[locale]/page.tsx          Home
      (site)/[locale]/opengraph-image.tsx               Home's image
      (site)/[locale]/docs/[page]/page.tsx              the guide pages, from the registry
      (site)/[locale]/docs/[page]/opengraph-image.tsx   one image per guide page
      (site)/[locale]/docs/components/page.tsx          the catalog
      (site)/[locale]/docs/components/[slug]/page.tsx   one page per component
      (site)/[locale]/docs/components/[slug]/opengraph-image.tsx
      (site)/[locale]/changelog/page.tsx
      (site)/[locale]/not-found.tsx                     a 404 inside a locale (page 20)
      (preview)/preview/[theme]/[dir]/layout.tsx        the second root layout
      (preview)/preview/[theme]/[dir]/[component]/[demo]/page.tsx
      global-not-found.tsx              a 404 for a URL outside both root layouts (page 20)
      sitemap.ts  robots.ts  manifest.ts
      llms.txt/route.ts                 exports dynamic = 'force-static'
    content/
      pages.ts                  the page registry
      en/<page>.mdx  ar/<page>.mdx
      components/<slug>.ts      the hand-written data of one component, en and ar
      sections.ts               the seven catalog sections and their 46 slugs
    components/                 the site's own pieces: Shell, Previewer, Playground, ...
    labels/en.ts  labels/ar.ts  the site's strings, INSTALL_LINE among them (S8)
    lib/                        pure helpers: rewrite imports, highlight, metadata, json-ld, slug
    lib/site.ts                 SITE_URL, the one absolute origin every URL is built from (S6)
    lib/remark-meta.mjs         a local remark plugin: copies a fence's info string onto the code node (S3)
    scripts/docs-data.ts        docs:data, run with tsx (S7)
    .generated/                 written by docs:data, git-ignored: components.json, toc.json,
                                dates.json, demos.ts (S7)
    public/search/<locale>.json written by docs:data, git-ignored (S5)
    assets/fonts/               TTF or WOFF files for the Open Graph images (S6)
    mdx-components.tsx  next.config.ts  tsconfig.json
    postcss.config.mjs          { plugins: { '@tailwindcss/postcss': {} } }
    eslint.config.ts            the site's lint, rule 2
  ```

  File names are kebab-case, as R-5.12-4; components PascalCase; one component per file in
  `components/`; each file under 300 lines (R-5.12-2 applies to the site too).
- **`next.config.ts`.** `redirects()`: `/` to `/en`, and `/:locale(en|ar)/docs` to
  `/:locale/docs/installation`, both permanent (there is no page at `/en/docs`). `pageExtensions`
  adds `mdx`. The MDX plugin with `remark-gfm` for tables and the local `lib/remark-meta.mjs`
  (S3), both named as strings (a package name, a file path), because the Turbopack MDX loader
  takes no function values; check the shape against the installed `@next/mdx` types. No resolve
  alias for the demos: `docs:data` writes `.generated/demos.ts`, a map of explicit static
  imports (S7, choice 7). The Turbopack root is set to the repository root, so those relative
  imports into `packages/topclassui/dist` resolve from inside `apps/docs`. A component's meta comes
  from the package's own `topclassui/meta/<slug>` export, so it needs no alias either. No
  `transpilePackages`, no `cacheComponents`. Check every option name against the installed Next
  types first.
- **`tsconfig.json`**, written out in full: `moduleResolution: bundler`, `module: esnext`,
  `noEmit`, `allowJs`, `incremental`, `esModuleInterop`, `resolveJsonModule`,
  `exactOptionalPropertyTypes: true`, `isolatedModules`, the `next` plugin, with the library's
  `strict` set. PLAN 4 draws these as a shared `tsconfig/nextjs.json`, but no `tsconfig/`
  folder exists in the repo, so the settings go inline and nothing waits for one.
- **The page registry** (`content/pages.ts`), one `as const` array, the single source of rule 5:

  ```ts
  // apps/docs/content/pages.ts, shape only
  interface PageEntry {
    slug: 'home' | 'installation' | 'css' | 'provider' | ... // the key, English in both locales
    path: '/' | '/docs/installation' | '/docs/components' | '/changelog' | ... // the route
                                                    // under /{locale}; a slug alone cannot say
                                                    // /en, /en/docs/components or /en/changelog
    group: 'start' | 'foundations' | 'reference' | 'more'
    icon: IconName                                  // the sidebar icon Figma draws
    title: { en: string; ar: string }
    description: { en: string; ar: string }         // the lead line; 50 to 160 characters
    status: 'live' | 'later'                        // 'later' is not routed, listed or indexed
  }
  ```

  Order in the array is sidebar order; "next" is the following live entry.
- **Candidate dependencies** (named here, installed by step 1's pull request with sizes in
  its description): `next` 16.3.8 (186 MB unpacked, dev and runtime of the app only),
  `@next/mdx` 16.3.8 (15 KB), `@mdx-js/loader` 3.1.1 (15 KB), `@mdx-js/react` 3.1.1 (14 KB),
  `@types/mdx` 2.0.14 (10 KB), `remark-gfm` 4.0.1 (22 KB), `shiki` 4.5.0 (602 KB, about
  11.4 MB with its dependencies; build time only), `schema-dts` 2.1.0 (1 MB, types only),
  `@tailwindcss/postcss` 4.3.3, the same version as `tailwindcss` (100 KB unpacked, plus
  `@tailwindcss/node` and the native `@tailwindcss/oxide` binary; build time only; without it
  Next cannot compile the three `@import` lines and the site renders unstyled). The library's
  devDependencies already hold the tooling the app names (`tsx`, `typescript`, `vitest`, the
  ESLint set); the app pins the same versions, so the lockfile gains no new tooling package. All in `apps/docs`; the library's dependencies do not
  change. Not needed: `@shikijs/rehype`
  (MDX code goes through the same highlighter as the demos, S3), Turborepo (one app, one
  package: `pnpm --filter` is enough), a search service.

### S2. The shell: navbar, sidebar, main, On this page, footer

```
What is bound and what is raw (the reader's note, "What is bound to variables and what is raw"):
  Colour: bound. Semantic (3 modes: Light, Dark, Ocean) 51 variables; Knobs (3 modes) 11:
    radius/base 8, radius/control 8, radius/box 12, radius/chip 4, border/width 1, ring/width 2,
    ring/offset 2, density 1, list/rows 7, list/row-height 40, overlay/inset 16;
    Size 35: control/xs..xl 28,32,40,48,56, icon 16,20,24,32,40; Type 18: font-size xs..5xl
    12 14 16 18 20 24 30 36 48, line-height 16 20 24 28 28 32 36 40 48.
  Every one of the 19 frames sets Knobs = Dark and Semantic = Dark. Nothing is drawn sticky.
  Text: fonts and sizes raw; 0 of 3,673 text nodes use a style. Inter Regular/Medium/Semi Bold,
    Roboto Mono Regular for code, Noto Sans Arabic Regular/Medium/SemiBold on the Arabic frame.
  Spacing, radius, size: raw, nowhere bound to Knobs or Size.
  Effects (shadows): raw, on seg:LTR, the Previewer cards, popups, Home's product frame, toast
    and number cards. No effect style, no paint style.
  Home's raw paints: 19 black shadows-as-fills at 0.25 and 0.30, a violet glow #9e73ff at 0.55,
    four radial glows #8c5cfa #3399ff #33bf80 #ffa633 at 0.14 behind the number cards; the
    number cards and the "46"/"84" text use a linear gradient. Gradients exist only on Home.

Page frame 1440 wide, V g0 p0:  R page bg (base/page) | Navbar 1440x58 | shell | Footer 1440x321

Navbar 1440x58 @0,0  H g18 p0,28,0,28
  i:palette | [15]"TopClass UI"
  "Docs" | "Components" | "Icons" | "Theming" | "Blog"            (14 px, Components is 14 Semi Bold)
  spacer 211 wide
  search 127x29 H g8 p6,8,6,10: i:magnifying-glass | "Search" | "Ctrl K"
  Segmented:global-mode 217x31 @1052,13 H g2 p3: seg:Light (i:sun "Light") 66x23,
    seg:Dark (i:moon "Dark") 64x23, seg:Ocean (i:palette "Ocean") 75x23; each H g5 p4,9
  Segmented:global-dir 91x31 @1287,13: seg:LTR "LTR" 40x23, seg:RTL "RTL" 41x23
  i:github-logo 16x16 @1396,21
  No language switch (English/Arabic) anywhere in the file.

shell 1440 wide, H g0 p0:  Sidebar 220 | main 1030 | On this page 190   (all three full height)

Sidebar 220 wide @0,0  V g2 p20,10,24,10
  i:book-open | "Documentation"
  "START HERE"
    nav i:house "Home" | nav i:download-simple "Install the package" | nav i:terminal-window
    "Add with the CLI" | nav i:code "CSS entry" | nav i:gear "Provider" | nav i:play
    "Your first component"
  "FOUNDATIONS"
    nav i:palette "Colors" | nav i:image "Icons" | nav i:moon "Theming" | nav i:translate
    "Right to left" | nav i:globe "Server first" | nav i:check-circle "Accessibility"
  "REFERENCE"
    nav i:list "Components" | nav i:link-simple "Connectors"
  "MORE"
    nav i:pencil-simple "Theme builder" | nav i:clock "Changelog" | nav i:file-text "Blog"
  each row: nav (or nav:current) 199x29 H g9 p6,8,6,8, icon then label
  Demo preview's own sidebar adds one row after Blog: "Demo preview". No other frame has it.

main 1030 wide  V g32 p36,43,56,43   (content column 944)
  hd 944 V g10:  route text (small, e.g. "/en/docs/installation") | [34] H1 | [16] lead
  Section: <heading> 944 V g12:  [21] heading | [16] paragraph(s) | one or more blocks
  next 944x67 H g10 p16,18,16,18:  "NEXT" | [16] next page title | i:arrow-right

On this page 190 wide @1250,0  V g10 p36,16,16,16
  "ON THIS PAGE" | one line per Section heading, in order

Footer 1440x321  V g0
  row H g48 p40,40,40,40:
    brand 360 V g12: i:palette | [15]"TopClass UI" | "RTL-first, server-first, and yours to own."
      | "46 components for Next.js and React, styled with Tailwind CSS v4. Documented in
      English and Arabic, and tested in every mode and both directions."
      | "MIT licence" | "v0.1.0" | "WCAG 2.2 AA"
      | "npm i topclassui zod" i:copy
      | Button 129x29: i:github-logo "Star on GitHub"
    col 202 "Get started": "Installation" | "Tailwind CSS v4 setup" | "Provider and root layout"
      | "Your first component" | "Install one component (CLI)"
    col 202 "Foundations": "Colors" | "Icons" | "Theming" | "Right to left" | "Server first"
      | "Accessibility"
    col 202 "Components": "All 46 components" | "Actions" | "Forms" | "Overlays" | "Navigation"
      | "Data" | "Connectors"
    col 202 "Resources": "Figma library" | "Component registry" | "llms.txt for AI tools"
      | "Changelog"
  hr 1440x1
  row 52 p18,40: "MIT licensed. Built in the open." | social (logo:github logo:youtube
    logo:x, 16 px, g14) | "Privacy" | "Changelog" | "GitHub"
```

**Build this.**

- **One layout component, `DocsShell`**, used by every docs page, the catalog and the
  component pages. Home uses the navbar and the footer without the three columns.
- **Widths.** The page is fluid up to 1440 px. Sidebar 220 px (13.75rem), main up to 1030 px
  with a content column of at most 944 px (59rem), On this page 190 px (11.875rem). Home's
  content column is 1200 px (75rem). Written as rem in the site's CSS, not px.
- **Type sizes.** Figma's raw sizes map to the nearest step of the library's type scale
  (12/14/16/18/20/24/30/36/48): H1 34 and 36 become 36 (`text-4xl`), the section heading 21
  becomes 20 (`text-xl`), card title 19 becomes 18, lead 16 stays 16, Home's hero 92 and
  section title 40 become 48 and 36 at mobile and grow to Figma's sizes at `lg` with
  `clamp()`. Inter Regular, Medium and Semi Bold only (choice 8 for the Arabic font). Code is
  set in the library's `font-mono`, which is `--tc-font-mono`, the system monospace stack
  (`tokens.css`); Figma's Roboto Mono is not loaded, so code costs no font bytes. If Omar wants
  Roboto Mono, it is one more `next/font` instance setting `--tc-font-mono` on `:root`, named in
  that pull request.
- **Shadows.** Figma's shadows are raw and the library has no shadow token. The Previewer card,
  the product frame and the number cards get a `border-line` border and no shadow, like the
  library's `Card`; popups keep the library's own `OVERLAY_SURFACE` (which carries `shadow-lg`);
  nothing on the site writes a shadow of its own, so no token decision is needed.
- **Navbar.** The library's `Navbar` (split; its client part is the mobile menu), sticky,
  publishing `--tc-sticky-top`. Left to right in LTR: brand ("TopClass UI" and the palette
  icon, a link to Home), links Docs (to `/{locale}/docs/installation`, the first guide page),
  Components, Icons, Theming (Blog only once it is live),
  the search button ("Search" and the keys `Ctrl K` in `Kbd`), the mode switch (S4), the
  language switch (S4), the GitHub link (an icon link named "GitHub", shown only when the
  repository is public, choice 12). Under 48rem the links and the search label collapse into
  the Navbar's menu; the search icon, the mode switch (icons only) and the menu button stay.
- **Sidebar.** The library's `Sidebar` with `SidebarGroup` and `SidebarLink`, generated from
  the registry. Groups START HERE, FOUNDATIONS, REFERENCE, MORE, with Figma's icons. On the
  catalog and on a component page, the Components row opens a nested list of the seven
  sections and their components (the 46, plus Field, Form and Meter, choice 5). Sticky under
  the navbar, `top: var(--tc-sticky-top)`, its own scroll container with
  `overscroll-behavior: contain`. Under 64rem it is hidden and the navbar's menu button opens
  the same groups in a `Drawer` from the inline start. The current row carries
  `aria-current="page"`.
- **Main.** `hd` (the breadcrumb: Home > Components > {Title} on a component page, Home >
  {Title} on a guide page, the library's `Breadcrumb` with `baseUrl` from `SITE_URL`, so every
  docs page gets the BreadcrumbList PLAN 15.3 asks for; the route text Figma draws is dropped,
  a URL is not content), the `h1`, the lead, then one `section` per MDX `##` heading, then the
  "next" card (a link: "Next" and the title, the arrow icon flipping in RTL because it is a
  directional icon). Padding as Figma's docs pages: 36 top, 43 inline, 56 bottom, sections
  32 apart, at every page including the catalog (surprise 17).
- **Heading ids and On this page, one mechanism, no dependency.** `lib/slug.ts` is a pure
  function of about ten lines (lower-case, Latin letters and digits kept, Arabic letters kept,
  everything else one hyphen) with written-out tests. `docs:data` reads each MDX source, takes
  the `##` lines with a regex, slugs them with that function and writes `.generated/toc.json`
  (per page, per locale). The `h2` mapping in `mdx-components.tsx` calls the same function for
  its `id` and renders the anchor link of S11, so the list and the ids cannot disagree. No
  `rehype-slug`, `github-slugger` or unified package is added: under pnpm none of them is
  reachable unless declared, and the regex covers every heading the site writes.
- **On this page.** A server-rendered list of `toc.json`'s entries for the page as anchor
  links, sticky under the navbar, hidden under 80rem. No scroll-spy in the first release (it
  would be the TableOfContents component, tier 2, which is not built: choice 13). Its `nav`
  is named "On this page".
- **Scroll padding.** The html element reads `scroll-padding-block-start:
  var(--tc-sticky-top)`, so an `#anchor` or a focused element clears the sticky navbar
  (PLAN 10.5 rule 8, WCAG 2.4.11). `scroll-behavior: smooth` only under
  `prefers-reduced-motion: no-preference`. `body` never gets `overflow: hidden`.
- **Footer.** As drawn, five columns, in both locales (the Arabic frame has none; build it).
  Links that point at nothing yet are left out, not greyed: "Figma library", "Component
  registry" and "llms.txt for AI tools" only once they exist (choice 12); YouTube and X only
  if the handles exist, and then as text links, since the icon set has no YouTube or X logo
  (`raw/` holds `github-logo` only; the GitHub link uses it). "Privacy" is left out until a
  privacy page exists (choice 12 by name; with no analytics there is nothing to disclose). In
  the Components column, "All 46 components" links to the catalog and Actions, Forms,
  Overlays, Navigation and Data link to the catalog's section anchors
  (`/docs/components#actions`, ...); "Connectors" is left out (choice 11). "v0.1.0" reads the
  package version and prints "v0.1.0 beta" while the version carries a prerelease tag. "Icons",
  not "The install command and this site". The install line is a `CodeBlock` with its copy
  button, from the one install constant `INSTALL_LINE` (S8).
- **Skip link.** First in `body`, "Skip to content", to `#main`, visible on focus. Plain HTML
  with a `TODO(tc)` marker until SkipLink exists (S12).

### S3. The content blocks

```
code block   944 wide: i:copy | "code" (or i:terminal-window | "terminal") | Button 73x29
             i:copy "Copy" | the code in Roboto Mono
tabbed code  "block": a row of Tab frames (e.g. "npm" "pnpm" "yarn" "bun") over one code text
table        "block" of cell frames, one header row; 2 to 4 columns
callout      "block" 944x43: i:info (or i:warning-circle) | one sentence
wrong/right  "block": i:warning-circle "Wrong" <code> | i:check-circle "Right" <code>
cards        "block" of 2 to 4 "card" frames: title | sentence
```

**Build this.** Each block is a library component wrapped by an MDX mapping in
`mdx-components.tsx`, so a page author writes plain MDX:

| Drawn | Built with | MDX |
|---|---|---|
| code block | `CodeBlock` with `highlighted` from Shiki, the copy button its own, the title "terminal" or the file name, the code in `font-mono` (S2) | a fenced block; the info string carries `title="app/globals.css"` and `check` (page 6). MDX drops the info string unless a plugin keeps it, so `lib/remark-meta.mjs` (about 15 lines, no dependency) copies `node.meta` onto the code node as a `data-meta` prop, and the `pre` mapping reads it |
| tabbed code (npm, pnpm, yarn, bun) | `Tabs` (`keepMounted`, so every tab is in the HTML) over one `CodeBlock` per tab | `<PackageManagers />`, which writes the four lines from the one install constant (S8) |
| table | `Table` (server) | a GFM table |
| callout | `Alert`, tone `info` or `warning`, with its icon | `<Callout tone="info">` |
| wrong/right | two `CodeBlock`s side by side (stacked under 48rem) with "Wrong" and "Right" titles, the warning and check icons | `<WrongRight>` with two fences |
| cards | `CardRoot` with `CardHeader` and `CardBody`, 2 to 4 per row, one per row under 48rem | `<Cards>` with `<Card title>` children |

- **One highlighter.** `lib/highlight.ts` calls Shiki's `codeToHtml` once per distinct
  string at build time, in an async server component, and the result goes into
  `CodeBlock`'s `highlighted`. Fences in MDX and demo sources take the same path. Shiki is
  never in a client bundle.
- **Shiki's colours must pass 4.5:1 on CodeBlock's surface.** CodeBlock is drawn on
  `neutral/solid` (unit-5 choice 13): a light block in Dark, a dark block in Light and Ocean.
  So the Shiki theme flips the other way from the page: a light theme in dark mode, a dark
  theme in light and ocean, switched with Shiki's dual-theme CSS variables under
  `[data-theme]`. A unit test measures every token colour of both themes against the
  CodeBlock surface in each mode with `scripts/lib/color.ts`, at 4.5:1 plus the repo's 0.15
  margin. Pick the two themes by that test, not by eye (choice 14).
- **Copy feedback.** A copy button's name never changes to "Copied"; success is announced
  from one polite live region per section (PLAN 16). Check how `CodeBlock`'s copy part
  announces before adding anything.

### S4. The mode switch and the language switch

```text
Navbar: Segmented:global-mode 217x31: seg:Light (sun "Light") | seg:Dark (moon "Dark") |
  seg:Ocean (palette "Ocean"); Segmented:global-dir 91x31: seg:LTR | seg:RTL.
Arabic navbar: mode labels فاتح / داكن / محيط, label then icon; RTL segment first.
The direction state is drawn, not driven (seg:LTR filled on every LTR frame).
No English/Arabic switch anywhere.
PLAN 6: ThemeScript first in head; data-theme and suppressHydrationWarning on html.
DECISIONS 2026-09-25: "The documentation site defaults to dark".
Repo: THEME_SCRIPT reads localStorage 'tc-theme'; with nothing stored it follows
  prefers-color-scheme, and light when that says light. No useTheme exists.
```

**Build this.**

- **Mode switch.** The library's `SegmentedControl` (client) with three items, Light, Dark,
  Ocean, icons sun, moon, palette, named "Colour mode for the whole page". A site hook,
  `useModeSwitch`, reads `document.documentElement.dataset.theme` after mount, writes the
  attribute and `localStorage['tc-theme']` on change (the key the library's script reads,
  imported as `THEME_STORAGE_KEY`), and sets `<meta name="theme-color">` from the computed
  `color-scheme`. Before hydration it renders the server's default; the first effect corrects
  it, inside the segmented control only, so the page never flashes. The hook is the
  ThemeSwitcher PLAN 18 names, written in the site with a `TODO(tc)` marker until the
  library ships `useTheme` (S12).
- **The default mode.** `<html data-theme="dark" suppressHydrationWarning>` in the server
  HTML, and `<ThemeScript />` first in `<head>`. The script as built follows the system when
  nothing is stored, and picks light when the system does not say dark
  (`src/shared/theme/script.ts`). So a first visitor with no preference, Lighthouse and most
  crawlers get light; the server's `dark` shows only without JavaScript. DECISIONS 2026-09-25
  wants dark first; that needs the library change of choice 9.
- **Language switch.** Where Figma draws LTR/RTL: two links, "English" and "العربية", each
  with `hreflang` and `lang`, to the same page in the other locale; the current one carries
  `aria-current="page"`. A server component: 0 KB. It is the LanguageSwitcher of PLAN 18,
  written in the site with a `TODO(tc)` marker. No direction toggle on an English page:
  direction comes from the locale, as R-13-1 and PLAN 15.3 require (choice 4).

### S5. Search

```text
Navbar: search 127x29: i:magnifying-glass | "Search" | "Ctrl K". Arabic: "ابحث في التوثيق".
Nothing else is drawn: no open state, no results.
PLAN: nothing decided. Command is built: client, lazy, a collection with getKey, getLabel,
  getGroup, onSelect.
```

**Build this.**

- **The index.** `docs:data` writes `apps/docs/public/search/<locale>.json` (git-ignored;
  Next serves files only from `public/`), fetched as `/search/<locale>.json`: every live page (title, lead, each `##` heading with its anchor), every component
  (name, title, description, section, and its props by name), and the 84 icon names pointing
  at the Icons page's anchors. About 150 page entries and 84 icons per locale; a few tens of
  KB. Grouped Pages, Components, Icons.
- **The palette.** The search button and `Ctrl K` (or `⌘ K` on a Mac, read after mount) open
  the library's `Command`, loaded with `React.lazy` on first open, as the Command card shows.
  The JSON is fetched on first open. Selecting an entry navigates with the router. Filtering
  is Command's own over the loaded items. The palette is named "Search the docs". 0 KB until
  opened.
- **Not built:** a full-text index, a hosted search, typo tolerance beyond what Command does
  (choice 6).

### S6. The SEO kit

```text
Not drawn, except the Blog's RSS address and the footer's "llms.txt for AI tools" link.
PLAN 15.3: generateMetadata per page; title pattern for a component
  "React {Component} - Tailwind CSS, RTL, accessible | TopClass UI"; an Open Graph image per
  component per locale from opengraph-image.tsx with fonts loaded from files; an Arabic image
  never mixes Latin and Arabic on one line; TechArticle and BreadcrumbList on docs pages,
  SoftwareSourceCode and Organization on Home, FAQPage where there is a FAQ; sitemap.ts,
  robots.ts, manifest.ts, llms.txt; preview routes noindex and out of the sitemap;
  Search Console and Bing after launch.
PLAN 1: 100 in Lighthouse SEO; within 90 days every en and ar component page indexed, zero
  hreflang errors, zero URLs rated poor.
Repo: Breadcrumb already emits BreadcrumbList JSON-LD with baseUrl. No JsonLd component and
  no createMetadata exist.
```

**Build this.**

- **`lib/metadata.ts`, `createMetadata(entry, locale)`**: title, description (the lead, 50 to
  160 characters, checked by a unit test), `alternates.canonical` (the page's own URL),
  `alternates.languages` with `en`, `ar` and `x-default` (the English URL), Open Graph and
  Twitter card. `metadataBase` once, in the locale layout, from `SITE_URL` in `lib/site.ts`
  (`https://topclassui.com`): the one constant the sitemap, `robots.ts`, `llms.txt` and every
  `Breadcrumb`'s `baseUrl` also read (rule 5), so no absolute URL is typed twice.
- **Titles.** Home: "TopClass UI - React components for Next.js, RTL-first and server-first".
  A guide page: "{Title} - TopClass UI". A component page: PLAN's pattern, with the human
  title ("React Dropdown menu - Tailwind CSS, RTL, accessible | TopClass UI"). The Arabic
  titles are translated, with the component's name kept in Latin. Every title is unique
  (unit test over the registry and the 46).
- **Structured data.** A site `JsonLd` server component that serialises with `<` escaped,
  typed with `schema-dts`. `TechArticle` on every docs page (headline, description,
  `inLanguage`, `dateModified`), `BreadcrumbList` from the library's `Breadcrumb` on every
  docs page, guide pages included (it already emits it, and only for crumbs with an `href`,
  absolute when given `baseUrl`; do not emit a second), `SoftwareSourceCode` and
  `Organization` on Home (`codeRepository` only once the repository is public). No FAQPage in
  the first release.
- **Dates.** `dateModified` and the sitemap's `lastModified` never come from the build clock,
  which would restamp every page on every deploy. `docs:data` runs `git log -1 --format=%cI`
  over each page's MDX file (both locales) and, for a component page, over its content file
  and the component's folder, and writes the newest date to `.generated/dates.json`.
- **Open Graph images.** `opengraph-image.tsx` for Home, each guide page and each component
  (the three files in S1's tree), in both locales, with `next/og` (part of Next, no
  dependency), each with `generateStaticParams` so it is built once. 1200x630, the page
  background of the dark mode, the name, the chip and one line. Fonts loaded from files
  committed under `apps/docs/assets/fonts` (Inter and Noto Sans Arabic, the weights used) as
  TTF or WOFF, never WOFF2: `next/og` (Satori) does not read WOFF2. Write each file's size in
  the pull request. In Arabic the Latin name sits on its own line and the Arabic line on its
  own line with `direction: rtl`. Satori's Arabic shaping and bidi are not reliable, so one
  Arabic image is checked by eye before launch (PLAN 19, Phase 7); if it is wrong, the `/ar`
  pages use one static template image per locale instead (PLAN 15.3's fallback).
- **`sitemap.ts`**: every live page in both locales, each with its `alternates.languages` and
  `lastModified` from `dates.json`; no `/preview`. **`robots.ts`**: allow all, the sitemap
  URL, and no `disallow` line: `/preview` is kept out of the index by its `noindex`
  (`metadata.robots` in the preview layout, S9) and out of the sitemap, as PLAN says. A
  disallowed URL's `noindex` is never read, so the two together would do less than one.
  **`manifest.ts`**: name, short name, the dark page colour, the icon.
  **`llms.txt`**: generated from the registry and the component file: one line per page and
  per component, title, URL, description. Its `route.ts` exports `dynamic = 'force-static'`:
  since Next 15 a `GET` route handler is dynamic unless it opts out (rule 4). The later RSS
  route does the same.
- **Internal links.** Every component page links to the other components of its section,
  to Field when it is a form control, and to Right to left and Theming (PLAN 15.3).
- **After launch** (not a pull request): verify the domain in Google Search Console and Bing
  Webmaster Tools, submit the sitemap, watch hreflang and Core Web Vitals.

### S7. The component data pipeline

```text
Not drawn. The cards in Figma carry a description, a chip, Try it controls, a code sample, a
note and a states row; the samples import things the repo does not have (surprise 10).
PLAN 16: the props table from the emitted .d.ts with defaults and limits from schema.ts
  (R-8.3-3); the playground from schema.ts (an enum is a select, a boolean a switch, a number
  a slider with min and max); demos from the component's demo folder.
DECISIONS 2026-10-06: R-8.3-3 still stands for the site's props table, "a different output
  from the same two sources" as the README.
```

**Build this.** One script, `apps/docs/scripts/docs-data.ts`, run with `tsx` by
`docs:build` and `docs:dev` before Next, writing `apps/docs/.generated/components.json`,
`toc.json`, `dates.json`, `demos.ts` and the search files. It imports
`../../../packages/topclassui/scripts/lib/*.js` (tsx maps `.js` to `.ts`, and the library's own
`imports` resolve `#shared/*` for those files). A unit test runs it against the repo and pins
its output's shape, and renders every demo it lists as a Server Component (the settings of the
library's `rsc` vitest project): only 25 of the 49 `dummy/` folders have a `demos.rsc` test
today, and the site renders all 391 demos that way.

- **The one door.** Everything the site reads from the library's `src/`, `scripts/lib/`,
  `raw/` or `docs/icons.md` (tokens, contrast results, the utility list, the icon counts,
  props, demo sources, heading lists, dates) is read by `docs:data` under tsx and written to
  `.generated/`. `apps/docs` itself imports only `.generated/` and the `topclassui` package.
  Next cannot import the library's scripts or source: they are `.ts` files behind
  `#shared/*`, and Turbopack does not resolve `.js` to `.ts` (PLAN 4, DECISIONS).

- **Per component** it collects:
  - from `meta.ts`: `name`, `slug`, `rendering`, `status`, `baseUi`, `tier`;
  - from `content/sections.ts`: its catalog section (the seven of Figma; `meta.ts`'s
    category is not used for the catalog, because it is PLAN 18's grouping, not the
    site's), and its order;
  - from `content/components/<slug>.ts`: the human title, the one-line description, the
    note, the keyboard rows, the RTL note and the related slugs, in `en` and `ar`, which
    demos the page shows, in order, the stage's reserved height, `stageHeight` (S8), and for
    a component with no schema the demo its stage renders, `stageDemo` (S8);
  - **props**: the README generator's rows (`rowsFromJsonSchema` over `z.toJSONSchema` of
    the schema, `ownPropsOf` over `types.ts`, `mergeRows`), per part for a part family
    (`familyOf`). Same sources as the README, so the two never disagree. This reads
    `types.ts`, not the emitted `.d.ts`: recorded as a departure;
  - **playground controls**: from the schema's JSON: an enum is a select (a segmented
    control when it has three values or fewer), a boolean a switch, a number with `min` and
    `max` a slider, a number without them a number field; default from the schema; the
    `custom` size is left out of the size control;
  - **demos**: every `dummy/*.tsx` file name, and its source text with the imports rewritten
    for the reader (below).
- **The import rewrite** (`lib/rewrite-imports.ts`, pure, unit-tested). The demo source is
  what the reader copies, so its imports must be what a user writes:
  `'../index.js'` becomes `'topclassui/<slug>'`, `'#components/<x>/index.js'` becomes
  `'topclassui/<x>'`, `'#icons/data/<name>.js'` (the shape all 91 icon imports in `dummy/`
  use) becomes `'topclassui/icons/<name>'`, `'#icons/types.js'` (one type import, in
  `command/dummy/with-shortcuts.tsx`) becomes `'topclassui/icons'`, and each `#shared/...`
  path becomes the public subpath that exports it: `#shared/provider/provider.js` to
  `topclassui/provider`, `#shared/labels/ar.js` to `topclassui/labels/ar`,
  `#shared/labels/get-labels.js` to `topclassui/labels/get-labels`, `#shared/cn.js` to
  `topclassui/cn`, `#shared/classes.js` to `topclassui/classes` (release plan C18; two demos
  need it, `avatar-group/dummy/linked.tsx` and `tag/dummy/link.tsx`). The mapping is built from
  the package's `exports` map, so a demo can only print an import that resolves; a specifier
  with no public subpath fails the build and names the demo. `'../types.js'` and
  `'../skeleton.js'` map to the component's subpath. If the release plan picks another import
  shape, only this file changes.
- **The demos run from `dist`, through a generated map.** `docs:data` writes
  `.generated/demos.ts`: one line per demo, an explicit static import such as
  `'button/variants': () => import('../../../packages/topclassui/dist/components/button/dummy/variants.js')`,
  plus the list of keys. The pages pick a demo by key and `React.lazy` or `await` it. No
  resolve alias (choice 7): an alias with two wildcards and a dynamic `import()` built from
  route params was never tested under Turbopack, while a map of literal specifiers is what
  every bundler handles, and `tsc` fails the step when a listed demo has no file. A demo's
  `../index.js` resolves to the same `dist` file the site gets from `topclassui/<slug>`
  (the workspace link points `node_modules/topclassui` at `packages/topclassui`). The library's
  build has already rewritten every `#shared/*` in `dist` to a relative path (release plan
  R4), so nothing needs the `imports` field. `dummy/` is not packed to npm (release plan C17);
  it exists in the workspace's `dist`.
- **Checks** (unit tests in `apps/docs`): `sections.ts` holds exactly the 46 slugs of
  the catalog, each once; every slug with a component page has a content file with both
  locales; every demo a content file lists exists; every description is 50 to 160
  characters; no rewritten source still contains `#` or `../`; no shown source contains
  `'topclassui'` without a subpath, in an import or in a string (today
  `code-block/dummy/highlighted.tsx` prints `from 'topclassui'` inside a template string,
  which the `#` and `../` check never sees; the release plan's R6 fixes the two demo files).

### S8. The Previewer card

```
Previewer: <Component> 944 wide, V g0 p0, 1 px border (children sit at x = 1, 942 wide),
  a raw shadow; height 845 to 1246
  head 942x79  V g12 p18
    [19] name | chip ("server - 0 KB", "client - n KB", "split - 0 KB server + n KB client")
    | one-sentence description
    Segmented:card 217x31: seg:Light (i:sun) | seg:Dark (i:moon) | seg:Ocean (i:palette)
    Button 79x29 H g6 p7,12: i:download-simple "Install"
  hr 942x1
  row: stage 694x311 V p34,20 (the component on the page background)
     | playground 248x311 V g14 p18: "TRY IT" | three ctl 208x47 (V g6: prop name, then a
       select showing the value and i:caret-down) | tg (three toggles, one per line)
  hr
  code 942 V g10 p18: "THE CODE" (or a one-line caption) | Button 73x29 i:copy "Copy"
    | the import lines | the JSX | i:info + one note line
  hr
  states 942 V g14 p18: "Every state" | "<n> states" | one rendered instance per state, its
    name under it (focus-visible draws a separate "ring" rectangle 4 px larger)
  hr
  install row, two halves: "Copy the source" | npx line i:copy | "Source lands in your repo.
    You own it." || "Then import it" | import line i:copy | "It is your file now. Edit it
    freely; topclassui diff shows what changed upstream."
```

**Build this.** One component, `Previewer`, used by the catalog (46 cards), by the top of
every component page, and by nothing else. Its five parts in Figma's order.

- **Head.** The name (an `h2` on the catalog, linking to the component's page; the `h1` is
  outside the card on a component page), the chip, the description, the card's mode switch
  (S4's `SegmentedControl`, named "Colour mode for {Component}", setting a scoped
  `data-theme` on the card's stage, playground and states only), and "Install", a link to
  the card's install row.
- **The chip.** Generated, one wording everywhere: `server - 0 KB`, `client - {n} KB`,
  `split - 0 KB server + {n} KB client`, plus `, lazy` for Command and DatePicker. The kind
  is `meta.ts`'s `rendering` (so AvatarGroup and Stepper read `server`, not Figma's split).
  The number is measured: until the library's `pnpm size` exists, a client or split chip
  prints the kind and "size not measured yet", never Figma's budgets (choice 15).
- **Stage and Try it.** The stage renders the component on `bg-page`, 694 wide beside a
  248 px Try it column; under 48rem Try it goes under the stage. Try it holds the controls of
  S7, each a library control (`Select`, `SegmentedControl`, `Switch`, `Slider`,
  `NumberField`), each labelled with the prop name. The stage renders the component's
  `dummy/playground.tsx` (choice 2) with the controls' values as props. A component with no
  schema (Breadcrumb, Card, EmptyState, Kbd, Timeline) has no Try it: its stage takes the
  full row and renders the demo its content file names as `stageDemo`. That is `basic` for
  Breadcrumb, Card and Timeline; EmptyState and Kbd have no `basic.tsx` (EmptyState has
  `default`, `failed`, `filtered`, ...; Kbd has `combination`, `keys`, `nested`, ...), so their
  files name `default` and `keys`. A `stageDemo` that names no file fails the S7 checks.
- **The code.** "The code", the copy button, then the JSX. At rest it is the stage's source:
  the Shiki-highlighted, rewritten `dummy/playground.tsx`'s usage line, or the `stageDemo`
  where there is no playground. When a control changes, the block shows a plain (not
  highlighted) snippet of the root element with the props that differ from their defaults,
  and the copy button copies exactly what is shown. Then the note, with the info icon.
- **Every state.** "Every state" and the count, then the component's `dummy/states.tsx`
  (choice 2), rendered on the server with the forced-state attributes (`data-hover`,
  `data-focus-visible`, `data-active`) and the real ones (`disabled`, `loading`,
  `aria-invalid`), each with its name under it. The `/preview` route renders the same file,
  so the docs and the tests never disagree (PLAN 16).
- **Install.** The release plan's paths. With its defaults: one row, "Import from the
  package", `import { Button } from 'topclassui/button'` with a copy button named "Copy the
  import for Button", and one line: "Install once:" with the release plan's install line
  (`npm i topclassui@beta zod` during the betas, `npm i topclassui zod` after; one constant,
  `INSTALL_LINE` in the site's labels, derived from the package version at build time, and used
  by every install line on the site: Home's hero, the footer, the Install page, the catalog's
  "Before you start" and this row) linking to the Install page. The second half, "Copy the source" with `npx topclassui add <slug>`, appears
  when the CLI ships (choice 11).
- **Lazy.** Server parts (head, code, states, a server component's stage) are plain server
  HTML. A client stage and the Try it panel mount when the card comes within one viewport
  of the screen, through a small site island. The island reserves the height itself: a
  `min-block-size` from the content file's `stageHeight` (rem), filled with one neutral
  library `Skeleton` block until the component mounts, so nothing shifts. It does not rely on
  a component skeleton: only seven components ship one (avatar, badge, button, card, input,
  table, textarea), and none of the 20 client ones does. The S13 Playwright run measures the
  layout shift of the catalog while it scrolls, and a `stageHeight` that is too small fails it.
- **RTL.** The card mirrors as a whole on `/ar`: Try it on the inline start, states in
  reading order. The control labels are Arabic and the values stay Latin, as the Arabic frame
  draws; prop names stay Latin and left to right.

### S9. The `/preview` route

```
hd: "/preview/[theme]/[dir]/[component]/[demo]" | [34]"Demo preview" | [16]"Every demo, rendered
  on its own at a stable address. Our visual tests take screenshots of these pages, and so can
  you."
Section: What the route is for
  [16]"Each demo on a component page is also a page of its own, with no navigation, sidebar or
  footer - only the demo on the page background. A browser test screenshots it in every mode,
  both directions and two widths, and compares the result against a stored baseline."
  [16]"The docs and the tests render the same demo file, so what you see in the docs is what is
  tested."
Section: The address  [16]"The address has four segments, all generated at build time."
  terminal: /preview/dark/ltr/button/variants
            /preview/dark/rtl/button/variants
            /preview/light/ltr/select/open
            /preview/ocean/rtl/dialog/scroll-body

            # theme:     light | dark | ocean
            # dir:       ltr | rtl
            # component: the catalog slug
            # demo:      a file in that component's demos/ folder
Section: Why it is static
  [16]"The route reads nothing at request time. Every combination comes from
  generateStaticParams, so every preview page is prerendered and a screenshot gives the same
  result every time. Knobs such as radius and density are set by the test, not by the address,
  so the number of pages stays fixed."
  code: // app/(preview)/preview/[theme]/[dir]/layout.tsx
        export function generateStaticParams() {
          return THEMES.flatMap((theme) => DIRS.map((dir) => ({ theme, dir })))
        }

        export const dynamicParams = false
Section: The blank baseline
  [16]"One reserved address renders an empty page. The size test loads a demo page and the empty
  one, adds up the script bytes of each and reports the difference. That is how a server
  component proves it adds 0 KB of JavaScript, rather than claiming it."
  terminal: /preview/light/ltr/blank/empty
Section: What the test sets
  table Setting | How | Why not in the address
    --tc-radius | page.addInitScript | Three values would triple the page count
    --tc-density | page.addInitScript | Same
    --tc-motion | Set to 0 | Animations make screenshots unreliable
    Viewport | 1280 and 390 | The two widths tested
    Fonts | Pinned Docker image | A font difference is not a regression
next: "Components"
```

**Build this.** The route only; its documentation page is not built (page 19).
`app/(preview)/preview/[theme]/[dir]/layout.tsx` is the second root layout: `<html lang
dir data-theme>` from the params, the same CSS, `<meta name="robots" content="noindex">`,
no navbar, sidebar or footer. `[component]/[demo]/page.tsx` renders one demo on `bg-page`.
`generateStaticParams` from the generated file: three themes, two directions, every slug and
demo, plus the reserved `blank/empty`. 391 demos give 2,346 pages plus 6 blank ones; check
that `next build` stays inside the laptop's memory (rule 9 of S13). Out of the sitemap and
`noindex` through the layout's `metadata.robots`; not disallowed in `robots.ts`, so the
`noindex` is read (S6). Its first users are the library's later `test:visual` and the
0 KB test of PLAN 14; the e2e specs stay on the harness until then.

### S10. Arabic

```
Frame 1440x3533: page bg | Navbar | shell. No Footer.
Navbar 1440x58  H g16 p0,32,0,32, order from the left edge:
  i:github-logo | Segmented:global-dir 90x32 (seg:RTL "RTL" first, then seg:LTR "LTR")
  | Segmented:global-mode 197x41 (seg:Ocean "محيط" i:palette, seg:Dark "داكن" i:moon,
    seg:Light "فاتح" i:sun; label then icon)
  | spacer 390 | search 260x44: "Ctrl K" | "ابحث في التوثيق" | i:magnifying-glass
  | links "المكوّنات" "الأيقونات" "الألوان" "التوثيق" (Components, Icons, Colors, Docs: four, not five)
  | brand [16]"توب كلاس" + i:palette (at the right edge)
shell H: On this page 190 @0 | main 1030 @190 | Sidebar 220 @1220
On this page V g10 p24,16,16,16: "في هذه الصفحة" | count + name per section:
  4 الإجراءات | 13 النماذج | 7 العرض | 4 البيانات | 6 التنبيهات | 6 الطبقات | 6 التنقّل
main V g26 p28,43,48,43
  hd: [30]"المكوّنات" | [16]"ستة وأربعون مكوّنًا، كل واحد داخل نفس الغلاف: العرض، الشيفرة، كل
    الحالات، وطريقتان للتثبيت. الصفحة نفسها معكوسة بالكامل - لا يوجد أي صنف فيزيائي يمين أو يسار."
  Previewer: button | Previewer: input | Previewer: pagination
  note 944x91 V g6 p16: "ثلاثة مكوّنات من ستة وأربعين" | "هذه الصفحة تثبت أن القالب نفسه
    ينعكس بالكامل: الشريط العلوي، الشريط الجانبي، الفهرس، الغلاف، الحالات وطريقتا التثبيت.
    البقية تُولَّد من نفس المواصفات ولا تضيف قرارًا جديدًا."
Sidebar V g2 p20,10,24,10, rows 199x42 (label then icon at the right):
  "التوثيق" | "ابدأ من هنا": "الصفحة الرئيسية" "تثبيت الحزمة" "الإضافة عبر الطرفية" "مدخل CSS"
  "المزوّد" | "الأساسيات": "الألوان" "الأيقونات" "السمات" "من اليمين إلى اليسار" "الخادم أولًا"
  "إمكانية الوصول" | "المرجع": "المكوّنات" "الموصّلات"
  Missing: "Your first component", the whole MORE group (Theme builder, Changelog, Blog).
  Rows are named "row", not "nav" or "nav:current".

Previewer card in RTL (head 109 tall, stage and playground 380 tall):
  head: chip "server - 0 KB" (in Latin) | [19] Arabic name | description
    | Button "تثبيت" (Install) | Segmented:card 197x41 Ocean, Dark, Light
  row: playground 248 first (so it sits on the left), then stage 694
    playground: "جرّبه" (Try it) | ctl labels in Arabic, values in Latin | toggles in Arabic
  code: Button "نسخ" (Copy) | "الشيفرة" (The code) | JSX | note + i:info
  states: "<n> حالات" | "كل الحالات، بدون تمرير الفأرة" (Every state, without hovering), states
    in reverse order (loading ... idle reading right to left)
  install row, reversed and reworded: "أو استورده من الحزمة" (Or import it from the package)
    | import { X } from 'topclassui/<slug>' | "هذا المكوّن وحده يُشحن. لا شيء غيره." (Only
    this component ships. Nothing else.) || "أضف هذا المكوّن فقط" (Add only this component)
    | npx topclassui add <slug> | "الشيفرة تصل إلى مستودعك. أنت تملكها." (The code lands in
    your repo. You own it.)

The three cards:
button "زر" | "خمسة أنماط عبر ثلاث نبرات. النص والأيقونة ينعكسان معًا، ولا يوجد صنف يمين أو يسار
  في أي منهما." | try: النمط solid, النبرة primary, الحجم md; التحميل, بعرض كامل, معطّل | stage:
  Button "كل المشاريع", Button "مشروع جديد" + i:plus | code "<Button>\n  <Icon name="plus" />\n
  مشروع جديد\n</Button>" | note "الأيقونة تسبق النص في الاتجاهين: ترتيب العناصر منطقي لا فيزيائي."
  | "6 حالات": تحميل معطّل تركيز ضغط تمرير عادي
input "حقل نص" | "يعمل قبل الترطيب. النص يبدأ من اليمين، والأيقونة اللاحقة تنتقل إلى اليسار
  تلقائيًا." | try: الحجم md, النوع email, النبرة neutral; مطلوب (on), غير صالح, معطّل | stage:
  field "البريد الإلكتروني" * | i:envelope-simple "omar@example.com" | "لن نشاركه مع أحد" | code
  "<Field name="email" label="البريد" required>\n  {(control) => <Input {...control}
  type="email" />}\n</Field>" | note "الأيقونة اللاحقة تستخدم pe- لا pr-، فتنتقل مع الاتجاه بلا
  شيفرة إضافية." | "5 حالات": معطّل، غير صالح، تركيز، تمرير، عادي
pagination "ترقيم الصفحات" | "روابط حقيقية لا معالجات نقر. الأسهم تنقلب، والأرقام تصبح هندية شرقية
  من إعداد المزوّد." | try: عدد الجيران 1, الحجم sm, الشكل rounded; الأول والأخير (on), السابق
  والتالي (on), مختصر | stage: » › ١٢ … ٣ ٢ ١ ‹ « | code = the LTR Pagination sample | note
  "الأرقام الهندية الشرقية تأتي من numberingSystem في TopClassProvider، لا من المكوّن." | "4 حالات":
  معطّل، الأخيرة، الوسط، الصفحة الأولى
```

**Build this.**

- **One tree, two locales.** `/ar` renders the same components as `/en` with
  `<html lang="ar" dir="rtl">`, `TopClassProvider direction="rtl" locale="ar"`, the site's
  `ar.ts` labels and the Arabic MDX. Nothing is drawn twice: the shell mirrors through
  logical CSS. The Arabic navbar's order in the facts is what that mirroring gives.
- **The footer and the MORE group exist in Arabic** (the frame omits them), and the Arabic
  sidebar has every row the English one has.
- **Mixed text.** A component or prop name inside an Arabic sentence is wrapped in `<bdi>`
  or written as inline `code` (which is `dir="ltr"`). Code blocks stay left to right.
- **Digits.** Latin digits in prose; the card's controls show values in Latin, as drawn.
  Pagination and other counts follow the provider (`numberingSystem` stays `latn` unless a
  demo shows `arab`).
- **The font.** `next/font` with Inter (latin subset) and Noto Sans Arabic (arabic subset,
  Regular, Medium and SemiBold), each with a `variable` (`--font-inter`, `--font-noto-arabic`)
  whose class goes on the html element. The site's CSS then sets `:root { --tc-font-latin:
  var(--font-inter); --tc-font-arabic: var(--font-noto-arabic) }` after the three imports:
  `tokens.css` declares both on `:root` (lines 33 and 34), so a declaration on the html
  element's class has the same specificity and wins only by order, which the `:root` rule
  after the imports makes certain. The library's `[lang|='ar']` rule applies the Arabic one.
  Only Inter is preloaded (PLAN 14).
  The Arabic line-height is left at the type scale's until Omar looks at `/ar` pages (choice
  8).
- **Who translates.** The planner drafts every Arabic page from the English one; Omar
  corrects it before the page merges, as for the unit label files (choice 10).

### S11. Accessibility of the site itself

**Build this.** Rule 8 above, and:

- Every repeated control on the catalog is named by what it acts on, from the site's labels,
  as PLAN 16's table: "Colour mode for {Component}", "Copy the import for {Component}",
  "Copy the {demo} code for {Component}", "Link to the {Component} section". The tab list of a
  demo is "{Component} demo"; its tabs stay "Preview" and "Code".
- The playground's controls are labelled with the prop name and described by the prop's
  description.
- A live preview never steals focus, and a lazy island keeps the focus where it was when it
  mounts.
- Every heading anchor is a link named "Link to the {heading} section", visible on focus.

### S12. What the site needs that the library does not have

| Need | Library today | First release of the site |
|---|---|---|
| ThemeSwitcher, `useTheme` (PLAN 18.9, "Needed by the docs site") | not built | the site's `useModeSwitch` with `SegmentedControl`, marked `TODO(tc)` |
| LanguageSwitcher (18.9) | not built | two links, marked `TODO(tc)` |
| SkipLink, VisuallyHidden (18.12) | not built | plain HTML with the library's classes and `sr-only`, marked `TODO(tc)` |
| TableOfContents (tier 2) | not built | a server list of anchors, no scroll-spy (choice 13) |
| Heading, Text (unit-5 choice 5) | not built | plain `h1`, `h2`, `p` with the type-scale classes; not a `TODO(tc)`, since they are not on the roadmap |
| Connectors | none; `src/connectors` holds a README | no Connectors page (choice 11) |
| `JsonLd`, `createMetadata` (PLAN 15.2, the SEO kit) | not built | site-owned in `apps/docs/lib`, the first users; they move into a package when the kit is built |
| Size numbers for the chips | `pnpm size` does not exist | "size not measured yet" (choice 15) |
| `playground.tsx` and `states.tsx` demos | 14 `states.tsx`, no `playground.tsx` | step 3 adds them (choice 2) |

PLAN 16 says Phase 7 is accepted only when the `TODO(tc)` list is empty. A script,
`scripts/list-todo-tc.ts`, lists the markers in `apps/docs`, and `docs:check` prints the
list. The site launches with the four markers above unless Omar builds ThemeSwitcher,
LanguageSwitcher and SkipLink into the library first (choice 13).

### S13. Gates for the site

**Build this.** `pnpm docs:check`, run before every site pull request and on `main` after
each merge (GitHub Actions is off). It is separate from `pnpm check`, which stays the
library's gate, because `next build` of about 2,500 pages is slow and heavy.

1. `tsc --noEmit -p apps/docs`.
2. ESLint over `apps/docs` with the site's `eslint.config.ts` and the library's custom rules
   it turns on (rule 2), including its test that each rule fires.
3. The site's unit tests (vitest, node project): the pipeline, the import rewrite, the
   registry, metadata uniqueness and length, the sitemap's alternates, the Shiki contrast,
   and the guide pages' code samples type-checked against the package. Only fences whose
   info string carries `check` are compiled; each is prefixed with one shared preamble of
   `declare` stubs (`saveSubscriber`, `cities`, `items`, `React`, ...) so a sample can stay
   short; a `…` or a `<PLACEHOLDER>` in a fence means it is not marked `check`; "Wrong"
   fences fail on purpose and are never compiled. A `check` sample that does not compile
   fails the step.
4. `pnpm docs:build`, then a check over its route list: every route is static or SSG (no
   route marked dynamic), `/search/en.json` and `/search/ar.json` exist in the output, and
   `/llms.txt` is prerendered. Read the marks from the installed Next's build output.
5. Playwright against `next start -p 4611`, both locales, a sample of pages (Home, every
   guide page, the catalog, five component pages, `not-found`): axe, the library's target
   size and focus ring checks, no horizontal scroll at 390 px, the sticky-bar test of PLAN
   10.5 rule 11 (the last link before the footer is fully visible when focused), an anchor
   clears the navbar, hreflang and canonical present and reciprocal, the JSON-LD parses,
   the mode switch persists across a reload with no flash (`data-theme` before first paint),
   the language switch keeps the path, the catalog's layout shift while scrolling stays under
   0.02, an unknown URL (`/fr/x`, `/random`) returns 404 with the global not-found page,
   `/en/docs` redirects to `/en/docs/installation`.
6. The `TODO(tc)` list, printed.
7. Lighthouse, by hand before launch and after big changes: `@lhci/cli` 0.15.1 (98 KB,
   choice 16), five mobile runs, median, against `next start`, never a Vercel preview
   (Vercel marks previews noindex).
8. The library's `pnpm check` still passes; the site never changes it.
9. **Memory.** The laptop has 15 GB. Run `docs:check` alone, not beside `pnpm check` or a
   mutation run. If `next build` runs out of memory, lower its static-generation workers
   (check the option's name in the installed Next types) before anything else.

## The pages

Each page: the facts as drawn, then Build this. The route is the default of choice 3. Every
page has the shell (S2), its metadata and Open Graph image (S6), and an Arabic twin (S10).

### 1. Home: `/en`

```
Navbar (as the shell, but its links read: "Docs" | "Components" |
  "The install command and this site" | "Theming" | "Blog")

Hero 1440x1488 V p112,0,0,0, centred
  E glow 1500x900 (radial, raw violet)
  chip: "Early access - v0.1 on npm soon"
  [92] "Top-class UI.\nBuilt for Next.js."
  [20] "Premium components that help you build faster. Server-first on React 19 and Tailwind
       CSS v4, in English and Arabic from the same code."
  install command 264x56: "$" | "npm i topclassui zod" | i:copy
  cta:docs 180x45: i:book-open [16]"Read the docs"
  cta:github 186x47: i:github-logo [16]"Star on GitHub"
  "Available with v0.1. Read the docs to get ready."
  Product frame 1200x720 (a dashboard drawn from the library):
    Sidebar 212: "TopClass UI" | Overview | Components | Icons | Themes | Settings
    main 986: [22]"Components" | "46 components, 3 kinds" | search "Search components"
      | Button i:funnel "Filter" | Button i:plus "Add component"
      Table: Component | Kind | Client JavaScript | Status | Updated
        button  Button       0 KB    Server  Sep 2026
        select  Select       4.8 KB  Client  Sep 2026
        date-picker Date picker 18.5 KB Client Sep 2026
        input   Input        0 KB    Server  Sep 2026
        tag     Tag          0.4 KB  Split   Sep 2026
        table   Table        0 KB    Server  Sep 2026
        dialog  Dialog       2.1 KB  Client  Sep 2026
      "Showing 1 to 7 of 46" | page size "50 per page" | pagination << < 1 2 3 > >>
    Toast 280x54: i:check-circle "Button added to your project"
      "components/topclassui/button, 5 files." i:x
  "Every piece of this screen is a component from the library, showing the library itself."

Section: Proof
  "WHAT MAKES IT DIFFERENT" | [40]"Three things you get from day one"
  | [17]"Every example on this page is a real component. Each one has its own page in the docs."
  three panels 385x707, g22:
  Panel: Server first, measured
    [15]"Less JavaScript" | "Seven of the eight components in this card add no JavaScript to
    your page. Only the dialog does."
    invoice: "Invoice TC-2041" "Paid" | "Issued 12 Sep 2026" | [16]"1,240.00 SAR"
      | Button "Download" | client island: Button "Void" "client - Dialog"
    "The solid border marks what renders on the server."
    "Renders on the server" "0 KB" | "Runs in the browser" "under 14 KB gzipped"
    "The component tree": Card Heading Text Badge Separator Icon Button Dialog
      | "7 server, 0 KB each" | "1 client"
    "How the 0 KB is checked": "// .size-limit.json\n{\n  "path": "dist/components/dialog/**",
      \n  "limit": "14 KB",\n  "gzip": true,\n  "ignore": ["react", "react-dom",\n
      "@base-ui/react"]\n}"
      "Every component has a JavaScript size target. A change that goes over it cannot be
      released, so the number on the chip cannot quietly drift."
    "The numbers are targets until v0.1 ships. From then on, a browser test adds up the
    JavaScript each demo loads, compares it with an empty page, and the chip shows the
    measured number."
  Panel: Right to left, enforced
    [15]"Arabic, built in" | "The same form in English and in Arabic. Layout, icons and digits
    mirror on their own."
    ltr: dir="ltr" | breadcrumb Docs > Components > Select | search "Search components" "/"
      | Button "Send" i:paper-plane-tilt | Button "Open" i:arrow-square-out | pagination 1 2 3
    rtl: dir="rtl" | "قائمة الاختيار" < "المكوّنات" < "الوثائق" < house | "ابحث في المكوّنات"
      | Button "فتح خارجيًا" | Button "إرسال" | pagination ٣ ٢ ١
    "EVERY DEMO, 12 SCREENSHOTS": grid Light Dark Ocean x ltr/desktop ltr/mobile rtl/desktop
      rtl/mobile, all ticked
      "3 modes x 2 directions x 2 widths. Every screenshot is taken in the same test
      environment, so a difference between runs is a real change, not a font."
    "The layout mirrors. Caret and arrow icons flip; the magnifying glass does not. The
    components use logical CSS utilities such as ps-, pe-, inset-s- and text-start, never left
    or right."
  Panel: One call, two patterns
    [15]"Desktop and mobile, one component" | "A menu on desktop becomes a bottom sheet on a
    phone. Same items, same code."
    call: "<AdaptiveMenu trigger items title />" | "(width < 48rem) is mobile"
    desktop: mode="desktop" | "Landing page" ... | popup Edit E, Duplicate D, Copy link, Delete
    mobile: mode="mobile" | sheet "Row actions" Edit E, Duplicate D, Copy link, Delete
    "Same trigger, same four items, same order, with no device check in your code. 16
    connectors work this way; AdaptiveMenu, AdaptiveSelect and AdaptiveDialog are available
    with v0.1."

Section: Modes
  "THEMING" | [40]"Light, dark, or your own" | [17]"A theme is one small CSS block. Switch
  modes, or add your brand colors, without touching a component."
  mode:Light | mode:Dark | mode:Ocean, 387x248 each: [15]name | data-theme="light|dark|ocean"
    | Field "Email" i:envelope-simple "omar@example.com" | "Save changes" "Cancel"
    | badges "Paid" "Pending" "Overdue" | switch "Weekly digest"
  "Same components, three themes."

Section: Numbers
  "BY THE NUMBERS" | [40]"What is inside" | [17]"Everything counted, nothing rounded up."
  four cards 288x192 with a glow: [60]"46" "components" | [60]"84" "icons, 16 flip
  automatically in Arabic" | [60]"12" "screenshots per demo, across every theme, direction
  and screen size" | [60]"0 KB" "JavaScript added by a server-rendered component"

Section: Catalog
  "THE CATALOG" | [40]"46 components, one consistent layout" | [17]"Each card carries a
  badge. S renders on the server and adds no JavaScript. C runs in the browser. Sp renders on
  the server with one small interactive part."
  catalog (192:1905) 1200x212, 46 chips "chip:<Name>" 36 tall, badge then name:
    S Button, Sp Tag, S Kbd, C SegmentedControl, S Input, Sp Textarea, C Select, C Combobox,
    C Checkbox, C RadioGroup, C Switch, C Slider, C Number field, C OTP field, C Date picker,
    C File upload, Sp Rating, S Badge, Sp Avatar, Sp Avatar group, S Card, S Separator,
    S Skeleton, Sp CodeBlock, S Table, C TreeView, S Timeline, Sp Stepper, S Alert, C Toast,
    Sp Banner, S Progress, S Spinner, S EmptyState, C Dialog, C Drawer, C Popover, C Tooltip,
    C Dropdown menu, C Command palette, Sp Navbar, Sp Sidebar, Sp Tabs, Sp Accordion,
    S Breadcrumb, S Pagination
  link:components: "Open the components page" i:arrow-right

Section: CTA
  "FOLLOW US" | [40]"One handle, everywhere" | [17]"@topclassui on GitHub, YouTube and X.
  Star, subscribe or follow, and you will hear the moment v0.1 ships."
  social:github 386x264: logo | [20]"GitHub" "@topclassui" | "Star the repository, read the
    source and open issues." | link "Star on GitHub" | "github.com/topclassui"
  social:youtube: [20]"YouTube" "@topclassui" | "Short videos on how each component is
    built." | link "Subscribe" | "youtube.com/@topclassui"
  social:x: [20]"X" "@topclassui" | "Release notes, previews and answers." | link "Follow"
    | "x.com/topclassui"

Section: Install
  "INSTALL" | [40]"Copy the source, or import the package" | [17]"Copy a component into your
  project and edit it, or install the package and import it. Same component either way."
  card 590: i:terminal-window [20]"Copy the source" | "npx topclassui add button" i:copy
    | "The component and its files are copied into your project, ready to edit."
  card 590: i:download-simple [20]"Import from the package" | "import { Button } from
    'topclassui/button'" i:copy | "Import only what you use. Nothing else ends up in your bundle."

Section: Status
  "WHAT YOU NEED" | [40]"Three things, current versions" | [17]"If your project runs these,
  it runs TopClass UI."
  req:nextdotjs [44]"15+" [20]"Next.js" "App Router. Server components and Server Actions
    come from here."
  req:react [44]"19+" [20]"React" "ref is an ordinary prop and a form takes an action.
    Nothing older works."
  req:tailwindcss [44]"4.2+" [20]"Tailwind CSS" "Configured in CSS with three import lines.
    No config file."

Footer (as the shell, but the Foundations column reads "Colors" |
  "The install command and this site" | "Theming" | ...)
```

**Build this.** No sidebar, no On this page; content 1200 px (75rem) wide, centred (Figma: at
x = 120 in a 1440 frame). Each section is drawn `V g28 p96,0,32,0`: 96 px (6rem) above, 32 px
(2rem) below, 28 px (1.75rem) between its heading row and its body. Sections in Figma's order,
each a `section` with an `h2`, so On this page is not needed and the outline is clean.

- **Hero.** The chip reads "v0.1 beta" with a link to the changelog, not "Early access -
  v0.1 on npm soon". The `h1` as drawn, "Top-class UI. Built for Next.js." (Figma is newer
  than DECISIONS' "The React UI kit that reads both ways"; Omar picks, choice 17). The lead as
  drawn. The install command in a `CodeBlock` with its copy button. "Read the docs" (a
  `Button` rendered as a link, primary) and "Star on GitHub" (outline, only when the
  repository is public). The line "Available with v0.1. Read the docs to get ready." is
  dropped: it is out of date the day 0.1.0 ships.
- **The glow.** A radial gradient of `--tc-primary-solid` mixed toward transparent behind
  the hero, CSS only, `aria-hidden`, no image; it turns blue with the token.
- **The product frame.** Built from real library components, server-rendered: Sidebar,
  Input (search), Button, Table with the drawn rows, Pagination, Badge. The Kind column reads
  each component's real `rendering` and the Client JavaScript column follows choice 15. No
  Toast (it is a client overlay): drop it, or show a static `Alert` in its place. This frame
  is the LCP candidate on desktop: it must be HTML, not an image, and nothing in it
  hydrates. The caption as drawn.
- **Proof.** Three panels as drawn, with these changes. Panel 1 (server first): build it,
  with the invoice `Card`, Badge, Button and a `Dialog` island; the size numbers follow
  choice 15; the size-limit snippet is shown only once `pnpm size` exists, and the sentence
  "The numbers are targets until v0.1 ships" is rewritten. Panel 2 (right to left): the same
  small form twice, the second inside `dir="rtl" lang="ar"`, real components. Its grid
  "EVERY DEMO, 12 SCREENSHOTS" is false today (no screenshot test exists; the harness renders
  3 modes x 2 directions): it becomes "EVERY DEMO, 6 PAGES" with "3 modes x 2 directions,
  checked in a real browser". Panel 3 (AdaptiveMenu): no connector exists, so it is replaced
  by "Tested, not promised": axe, target size, the focus ring and contrast, each with the
  count of what the library's gates check today, filled in at build time (choice 11).
- **Modes.** Three cards, each a scoped `data-theme` around real Field, Input, Button, Badge
  and Switch. As drawn.
- **Numbers.** 46 components, 84 icons and 16 that flip, 6 pages per demo (not 12, as above),
  0 KB per server component. Each number read from the generated data, never typed. The four
  glows as the hero's, one tone each in Figma's order: `--tc-primary-solid` (drawn violet
  #8c5cfa, blue after the theme change), `--tc-info-solid` (drawn #3399ff), `--tc-success-solid`
  (#33bf80) and `--tc-warning-solid` (#ffa633), each a `color-mix()` toward transparent at
  about 14 %. The "46" and "84" are drawn with a linear gradient; build them in `text-body`,
  the glow behind carries the colour, and no gradient text is written.
- **Catalog.** 46 chips, each a link to its component page, with S, C or Sp from
  `meta.ts`. "Open the components page" links to the catalog.
- **Follow.** Only the channels that exist (choice 12). If none but GitHub, this section is
  one card or is dropped. The GitHub card uses the library's `github-logo`; YouTube and X have
  no icon in the set, so their cards, when they exist, carry the channel name as text.
- **Install.** One card, "Import from the package", until the CLI ships (choice 11). The
  import line from the release plan; the install line is `INSTALL_LINE` (S8).
- **What you need.** As drawn: Next.js 15+, React 19+, Tailwind CSS 4.2+ (the package's
  peers are `^19.0.0` and `^4.2.0`), the ranges read from the package at build time. Without
  the brand logos: `req:nextdotjs`, `req:react` and `req:tailwindcss` are not among the 84
  icons, and no third-party logo is committed in the first release (a logo is a trademark
  with its own licence; the version number and the name are the content). Each item is the
  number, the name and the line.
- **Structured data:** `SoftwareSourceCode` and `Organization`.
- **Not built:** the Earlier drafts, YouTube and X cards without handles, the toast.

### 2. Install the package: `/en/docs/installation`

```
hd: "/en/docs/installation" | [34]"Install the package" | [16]"Two steps. Install the package,
  then add the components you need."
Section: Pick your framework  [16]"Same on every framework."
  tabs "Next.js App Router" | "Vite" | "React Router v7" over:
  "npm i topclassui zod\nnpx topclassui add button"
Section: Install  [16]"Use whichever you already have."
  tabs "npm" | "pnpm" | "yarn" | "bun" over "npm i topclassui zod"
Section: Peer dependencies  [16]"Three, and your project already has them."
  table Package | Range | Why it is required
    react | ^19.0.0 | The components are written for React 19, where ref is an ordinary prop
    react-dom | ^19.0.0 | Same
    tailwindcss | ^4.2.0 | The inset-s-* utilities need Tailwind 4.2 or later
Section: Framework support  [16]"Tier means feature coverage, not quality."
  table Framework | Tier | What changes
    Next.js 15 or 16, App Router | 1 | Nothing. This is the reference setup: server components
      add no JavaScript, Icon works by name, and Server Actions are available
    Vite single-page app | 2 | No server render. Every component you use is in the browser
      bundle, and Icon is imported from icon-registry
Section: React without Next.js  [16]"Everything works the same. Two things change."
  [16]"No server render, so every component you use ships in your bundle. Import Icon from
  topclassui/icon-registry and register the icons you use, once."
  code: // vite.config.ts
        import { defineConfig } from 'vite'
        import react from '@vitejs/plugin-react'
        import tailwindcss from '@tailwindcss/vite'
        import { topclassui } from 'topclassui/vite'

        export default defineConfig({
          plugins: [react(), tailwindcss(), topclassui()],
        })

        // src/icons.ts - once per app
        import { registerIcons } from 'topclassui/icon-registry'
        import { caretDown } from 'topclassui/icons/caret-down'

        registerIcons({ 'caret-down': caretDown })
Section: Next steps
  callout i:info "Not on npm yet. These commands work from v0.1."
next: "CSS entry"
TOC: Pick your framework | Install | Peer dependencies | Framework support |
  React without Next.js | Next steps
```

**Build this.** As drawn, with the release plan's install line and import paths.

- "Pick your framework": `Tabs` Next.js App Router, Vite, React Router v7, each with the
  install line. If the release ships no CLI, the `npx topclassui add button` line is
  removed from every tab.
- "Install": the `PackageManagers` block.
- "Peer dependencies" and "Framework support": the tables as drawn, the ranges read from the
  package's `peerDependencies` at build time.
- "React without Next.js": the Vite sample names `topclassui/vite` and `registerIcons`,
  which do not exist as drawn. `registerIcons` exists only if the release exports
  `icon-registry`; `topclassui/vite` does not exist: the sample shows the plain
  `@tailwindcss/vite` setup without it, and the ThemeScript line is pasted in `index.html`
  by hand (page 5).
- "Next steps": the callout "Not on npm yet" is removed once 0.1.0 is published; this page is
  built after the release, so it is never shown.
- Next: CSS entry.

### 3. Add with the CLI: `/en/docs/cli` (later)

```
hd: "/en/docs/cli" | [34]"Add with the CLI" | [16]"Copy a component into your project and own
  the file."
Section: Initialise once  [16]"init detects your package manager and framework, then asks two
  questions."
  terminal: $ npx topclassui@latest init

              Detected   Next.js 16.3, App Router, TypeScript
              Detected   npm

              Where is your CSS entry?          app/globals.css
              Import alias for shared code?     @/lib/topclassui

              Added      3 imports to app/globals.css
              Wrote      topclassui.json
              Done
Section: Add a component  [16]"add copies the component and everything it imports, and
  installs what is missing."
  terminal: $ npx topclassui add select

              select       ->  components/topclassui/select/
              field        ->  components/topclassui/field/      (select imports it)
              shared       ->  lib/topclassui/                   (cn, classes, collection)

              Installed    @base-ui/react
              Done

            # the same command under each package manager
            $ npm dlx topclassui add select
            $ yarn dlx topclassui add select
            $ bunx topclassui add select
Section: What lands in your project  [16]"One folder for everything we add. Your own code stays
  untouched."
  tree (rows 942x40, icon | name | note):
    your-app/ | app/ | globals.css "init adds 3 import lines"
    | topclassui/ "everything of ours, in one folder" | components/
    | button/ "npx topclassui add button"
    | index.tsx "the component, renders on the server" | client.tsx "the interactive part only"
    | hook.ts "state, effects, handlers" | lib.ts "pure helpers, no React"
    | variants.ts "how it looks" | classes.ts "its own class constants"
    | constants.ts "its default values" | types.ts "its props" | schema.ts "prop rules and limits"
    | skeleton.tsx "loading" | empty-state.tsx "empty" | error-state.tsx "error"
    | meta.ts "docs info, never ships" | dummy/ "working examples, one per file"
    | parts/ "sub-parts, one component per file" | test/ "behaviour, keyboard, a11y, ssr"
    | input/ "one folder per component" | schemas/ "shared value rules - email, phone, url"
    | lib/ "cn, classes, labels - shared by every component" | topclassui.json "your settings"
Section: The config file  [16]"Written by init and read by add. Every field has a default. Edit
  it by hand if your paths change."
  code: // topclassui.json
        {
          "framework": "next-app",
          "css": "app/globals.css",
          "components": "components/topclassui",
          "alias": "@/lib/topclassui",
          "packageManager": "npm"
        }
Section: When you have edited a copied file  [16]"add never overwrites your edits. diff shows
  what changed upstream; --overwrite replaces it and prints the diff first."
  terminal: $ npx topclassui diff select

              components/topclassui/select/client.tsx   modified locally, 2 upstream changes
              components/topclassui/select/variants.ts  up to date

            $ npx topclassui add select --overwrite
Section: Running without prompts
  code: npx topclassui init --yes            # accept every inferred default
        npx topclassui add button --yes
        npx topclassui add button --dry-run  # print what would be written, write nothing
Section: What it never does
  cards: "No telemetry" "It sends nothing. The only network call is fetching the registry."
    | "Nothing outside its own files" "It adds three lines to the CSS entry you name and
    touches nothing else." | "No silent overwrite" "A file you have edited is left alone
    unless you pass --overwrite, and even then the diff prints first."
next: "CSS entry"
TOC: the seven headings above
```

**Build this.** Not in the first release: the CLI does not exist (`package.json` has no
`bin`, `scripts/` has no CLI). The registry entry is `status: 'later'`, so the page is not
routed, not in the sidebar, not in the sitemap. When the CLI ships, the page is built as
drawn, with one install path chosen from the three the facts disagree on (surprise 8).

### 4. CSS entry: `/en/docs/css`

```
hd: "/en/docs/css" | [34]"CSS entry" | [16]"Three import lines, in order, and no configuration
  file. That is the whole Tailwind setup."
Section: The three lines
  code: /* app/globals.css */
        @import "tailwindcss";
        @import "topclassui/tokens.css";
        @import "topclassui/styles.css";
Section: What each line brings
  table Line | Brings
    tailwindcss | Tailwind itself: the base layer and the utility classes
    topclassui/tokens.css | Every --tc-* variable, the three mode blocks, the knobs and the
      Arabic font rule
    topclassui/styles.css | The @source line that scans the components, the @theme inline
      mapping and the variants for forced states
Section: Why there is no tailwind.config.js
  [16]"Tailwind v4 is configured in CSS. The third import carries the mapping and the @source
  line, so it can never fall out of step with the components."
Section: The utility names you get  [16]"Every token becomes a utility class, with the same
  names the components use."
  table Token | Utilities
    --tc-page, surface, surface-raised | bg-page bg-surface bg-surface-raised
    --tc-body, muted | text-body text-muted
    --tc-line, line-strong | border-line border-line-strong
    --tc-primary-solid and its on-solid, on-soft, soft | bg-primary-solid text-primary-on-solid
      text-primary-on-soft bg-primary-soft
    --tc-ring | outline-ring
    control sizes | h-control-xs to h-control-xl
    radius knobs | rounded-control rounded-box rounded-chip
Section: Overriding a token  [16]"Set the variable after the three imports. Nothing checks the
  contrast of a value you set yourself."
  code: @import "topclassui/styles.css";

        :root {
          --tc-primary-solid: var(--color-emerald-700);
          --tc-primary-on-solid: var(--color-white);
          --tc-primary-on-soft: var(--color-emerald-700);
          --tc-radius: 0.75rem;
        }
Section: If the order is wrong  [16]"Tailwind’s layer order is set by the first import. Open a
  layer before it and the components lose to the base resets."
  Wrong: @import "topclassui/styles.css";
         @import "tailwindcss";

         /* the components layer is opened before Tailwind's layer
            order statement, so it sinks below base and the resets win */
  Right: @import "tailwindcss";
         @import "topclassui/tokens.css";
         @import "topclassui/styles.css";
Section: On Vite  [16]"On Vite, the same three lines apply, with @tailwindcss/vite in the
  plugin list instead of PostCSS."
  code: // vite.config.ts ... export default defineConfig({ plugins: [react(), tailwindcss(),
        topclassui()] })   (same imports as on Install)
next: "Provider"
```

**Build this.** As drawn, with the release plan's two CSS subpaths in place of
`topclassui/tokens.css` and `topclassui/styles.css` if they differ. "The utility names you get"
is generated from `src/styles.css`'s `@theme inline` block by `docs:data` (S7), so it cannot
fall behind. The override sample's emerald stays (it is an example of a user's own colour). The
Vite section links to page 2 instead of repeating its code.

### 5. Provider: `/en/docs/provider`

```
hd: "/en/docs/provider" | [34]"Provider" | [16]"One provider at the root of your app, with
  direction and locale as props. It is required, and everything it does is listed on this page."
Section: Where it goes  [16]"Your root layout, wrapping everything. direction and locale come
  from the route, never from the DOM."
  code: // app/[locale]/layout.tsx
        import { TopClassProvider } from 'topclassui/provider'
        import { ThemeScript } from 'topclassui/theme'

        export default async function RootLayout({ children, params }: {
          children: React.ReactNode
          params: Promise<{ locale: string }>
        }) {
          const { locale } = await params
          const dir = locale === 'ar' ? 'rtl' : 'ltr'
          return (
            <html lang={locale} dir={dir} data-theme="dark" suppressHydrationWarning>
              <head><ThemeScript /></head>
              <body>
                <TopClassProvider direction={dir} locale={locale}>
                  {children}
                </TopClassProvider>
              </body>
            </html>
          )
        }
Section: The props
  table Prop | Type | Default | What it does
    direction | ltr | rtl | required | Sets the text direction for gestures and popup placement
    locale | string | required | Picks the built-in labels and the Intl formatters
    labels | Partial<Labels> | {} | Override any built-in string
    numberingSystem | latn | arab | latn | Digits in counts and dates; a server component such
      as Pagination takes them through getLabels(locale)
    adaptive | { query } | (width < 48rem) | The width below which connectors switch to their
      mobile layout
    collection | { visibleRows, virtualizeAbove, loadMoreThreshold } | 7, 200, 10 | Defaults for
      every list
Section: Why direction is a prop
  [16]"Reading document.dir in an effect would give the server one answer and the browser
  another for one frame, which shows as a flash in the wrong direction. A prop from the layout
  has the same value in both places. In development, a warning fires if the prop and the html
  dir attribute disagree."
  Wrong: useEffect(() => {\n  setDir(document.documentElement.dir)\n}, [])
  Right: <html dir={dir}>\n  <TopClassProvider direction={dir}>
Section: What it renders
  cards: "Direction provider" "Popups read the direction from here, so a Select opens on the
    correct side in Arabic." | "Toast viewport" "One live region, positioned by direction, with
    the safe-area padding." | "Tooltip provider" "A shared delay, so the second tooltip opens at
    once." | "Isolation root" "A div with isolation: isolate, so overlays stack above your page
    without z-index conflicts."
Section: ThemeScript
  [16]"A small inline script, first in head, reads the stored preference and sets data-theme
  before the first paint. Without it the page renders in the default mode and then switches,
  which shows a flash of the wrong mode. The script is a constant string with a published hash,
  so a strict Content Security Policy can allow it by hash."
  code: import { ThemeScript, THEME_SCRIPT_HASH } from 'topclassui/theme'

        <head><ThemeScript /></head>

        // CSP: script-src 'self' 'sha256-<THEME_SCRIPT_HASH>'
Section: In a single-page app
  [16]"In a single-page app nothing React renders runs before the first paint, so the same
  script goes in index.html above the module script. The Vite plugin adds it for you, and the
  initial lang, dir and data-theme are static attributes on the html element. When the visitor
  changes locale, update the html attributes and the provider props at the same time."
  code: <!-- index.html -->
        <html lang="en" dir="ltr" data-theme="dark">
          <head>
            <script>/* injected by topclassui/vite: the same THEME_SCRIPT */</script>
next: "Your first component"
```

**Build this.** As drawn. "The props" table is generated from the provider's own types with
the README generator's `ownPropsOf`, not copied (the drawn defaults may have moved; check
`adaptive`, which belongs to the connectors and is left out if the provider has no such
prop). The "In a single-page app" sample does not mention `topclassui/vite`: it shows the
`THEME_SCRIPT` constant pasted into `index.html`. The ThemeScript section's sample imports
`THEME_SCRIPT_HASH`, which does not exist: `src/shared/theme` exports `BUILT_IN_MODES`,
`THEME_SCRIPT`, `THEME_STORAGE_KEY` and `ThemeScript({ nonce })` only. The sample imports
`ThemeScript` alone, and the CSP line prints the real hash as text, computed by `docs:data`
as the SHA-256 of `THEME_SCRIPT` from the installed package, so it is never typed and changes
with the script. (Exporting the hash from the package is a library change; name it in a
release pull request if a user asks for it.) The import paths follow the release plan.

### 6. Your first component: `/en/docs/first-component`

```
hd: "/en/docs/first-component" | [34]"Your first component" | [16]"A form that renders on the
  server and posts to a Server Action. No JavaScript for its markup."
Section: What you will build  [16]"A subscribe form: an Input inside a Field, and a Button."
  callout i:info "Add the components first: npx topclassui add form field input button"
Section: 1. The action  [16]"Zod validates on the server, so it cannot be bypassed and costs the
  browser nothing. fieldErrors comes out keyed by field name, which is what Field expects."
  code: // app/subscribe/actions.ts
        'use server'
        import { z } from 'zod'

        const schema = z.object({ email: z.email('Enter a valid email') })

        export async function subscribe(formData: FormData) {
          const parsed = schema.safeParse(Object.fromEntries(formData))
          if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors }

          await saveSubscriber(parsed.data.email)
          return { ok: true }
        }
Section: 2. The page  [16]"Field wires the label, hint and error to the control. Input is a
  native input, so it works before any JavaScript."
  code: // app/subscribe/page.tsx
        import { Field } from '@/components/topclassui/field'
        import { Input } from '@/components/topclassui/input'
        import { Button } from '@/components/topclassui/button'
        import { Form } from '@/components/topclassui/form'
        import { subscribe } from './actions'

        export default function Page() {
          return (
            <Form action={subscribe} className="flex flex-col gap-4">
              <Field name="email" label="Email" hint="We never share it" required>
                {(control) => <Input {...control} type="email" autoComplete="email" />}
              </Field>
              <Button type="submit">Subscribe</Button>
            </Form>
          )
        }
Section: 3. What you should see
  numbered list:
    1 "A labelled input and a button, styled in the current mode" | "If they are unstyled, the
      CSS entry is missing a line or the order is wrong."
    2 "Disable JavaScript and submit" | "The form still posts, the action runs and the page
      reloads. That is the Server Action doing its job; the returned errors appear in step 4."
    3 "Open the network panel" | "No script for the form. Input, Button and Field all ship 0 KB
      here."
Section: 4. Show the error without a reload  [16]"Move the form into a client file and use
  FormAction. Errors land on the matching field."
  code: 'use client'
        import { FormAction } from '@/components/topclassui/form'
        import { FieldLive } from '@/components/topclassui/field'
        import { Input } from '@/components/topclassui/input'
        import { Button } from '@/components/topclassui/button'
        import type { subscribe } from './actions'

        export function SubscribeForm({ action }: { action: typeof subscribe }) {
          return (
            <FormAction action={action}>
              <FieldLive name="email" label="Email" required>
                {(control) => <Input {...control} type="email" />}
              </FieldLive>
              <Button type="submit">Subscribe</Button>
            </FormAction>
          )
        }
Section: On Vite  [16]"The same form with a plain async function. This one works only after the
  page has loaded its JavaScript."
  code: async function subscribe(formData: FormData) {
          await fetch('/api/subscribe', { method: 'POST', body: formData })
        }

        <form action={subscribe}>…</form>
next: "Colors"
```

**Build this.** As drawn; Field, Form, FieldLive and FormAction are built (Unit 5), so the
samples work. Change the import paths from `@/components/topclassui/...` (the CLI's) to the
package's subpaths, and the callout "Add the components first: npx topclassui add ..." to
"Install the package first", until the CLI ships. Step 3's three checks stay; step 3.3's "0
KB" holds for Field, Input and Button (server and split server halves). The four code samples
are marked `check` and compiled against the package (S13 step 3), each with the shared
preamble that declares `saveSubscriber`; the Vite fence with `…` is not marked and is not
compiled. So the samples cannot rot.

### 7. Colors: `/en/docs/colors`

```
hd: "/en/docs/colors" | [34]"Colors" | [16]"Color has three layers: a palette you never use
  directly, semantic tokens you always use, and the utility classes Tailwind generates from
  those tokens."
Section: The three layers
  [16]"A component never names a color. It names a role, and the role resolves differently in
  each mode."
  [16]"The palette is the Tailwind v4 oklch ramp. The semantic layer maps each role to a shade,
  and @theme inline turns each one into a utility class."
  code: /* palette - never referenced by a component */
        --color-violet-600: oklch(54.1% 0.281 293.009);

        /* semantic - what a component means */
        --tc-primary-solid: var(--color-violet-600);
        --tc-primary-on-solid: var(--color-white);

        /* utility - what Tailwind generates */
        @theme inline {
          --color-primary: var(--tc-primary-solid);
        }

        /* what you write */
        className="bg-primary-solid text-primary-on-solid"
  "Every component uses the semantic layer only, so a new mode never needs a component change."
Section: Every class  [16]"One class per role. These are the names components use, and the ones
  you use beside them."
  table Class | Variable | What it is for
    bg-page | --tc-page | The page behind everything
    bg-surface | --tc-surface | A recessed or striped surface
    bg-surface-raised | --tc-surface-raised | A card, a popup, an input
    text-body | --tc-body | Body text
    text-muted | --tc-muted | Secondary text
    border-line | --tc-line | A decorative hairline
    border-line-strong | --tc-line-strong | A control boundary, must reach 3:1
    outline-ring | --tc-ring | The focus ring
    bg-primary-solid | --tc-primary-solid | A filled control
    text-primary-on-solid | --tc-primary-on-solid | Text on that fill
    bg-primary-soft | --tc-primary-soft | A tint, for a chip or a hovered row
    text-primary-on-soft | --tc-primary-on-soft | Text and icons on that tint
Section: The six tones  [16]"Every tone has the same set of roles, so a Badge, an Alert and a
  Button all use a tone in the same way."
  swatch rows (each swatch is bound to the live variable):
    primary/solid | violet-600 | A filled control with a white label
    primary/soft | 24% into the page | A tint, for a chip or a hovered row
    primary/on-soft | violet-400 | Text and icons on that tint
    success/solid | emerald-700 | A filled control with a white label
    warning/solid | amber-500 | Its label is near-black, not white
    danger/solid | red-600 | Destructive actions
    info/solid | sky-700 | Neutral information
    neutral/solid | neutral-100 in dark | Flips with the mode
  "Shown in dark mode. Each row is a live variable, not a picture of one."
Section: Where each color is used  [16]"One screen, every role labelled."
  Board 944x570: a Screen 456x326 (Top bar "TopClass UI", Card "Project settings" "Choose how
  this project deploys." Button "Save", Dropdown Production / Preview / Development) with
  leader lines (V line + E dot) to eight labels:
    bg-surface "The top bar. A box sitting on the page."
    border-line "The hairline under the bar and around the card."
    text-body "Titles and normal text."
    text-muted "The grey description line."
    bg-primary-solid + text-primary-on-solid "The Save button."
    bg-primary-soft + text-primary-on-soft "The selected row in the dropdown."
    bg-surface-raised "The dropdown, floating above the card. One step lighter, with a shadow."
    bg-page "The whole screen, behind everything."
Section: The three modes
  [16]"Light, dark and ocean are three CSS blocks that set the same variable names. This site
  uses dark by default."
  [16]"Ocean is light mode with a cyan primary and a pill radius. A custom mode needs nothing
  more than one CSS block."
  code: [data-theme="dark"] {
          color-scheme: dark;
          --tc-page: var(--color-neutral-950);
          --tc-surface: var(--color-neutral-900);
          --tc-surface-raised: var(--color-neutral-800);
          --tc-line-strong: var(--color-neutral-400);

          /* a tone mixed into near-black hardly moves, so dark
             needs roughly double the light percentage */
          --tc-primary-mix: 24%;
        }
Section: What the contrast check enforces  [16]"Contrast is checked on every build and a failure
  blocks it. It uses CSS Color 4 gamut mapping, because some shades sit outside sRGB."
  table What | Threshold | Measured against
    Text, including a tone text on its own tint | 4.5:1 | The surface it sits on
    line-strong, ring and icons | 3:1 | All three surfaces, not only the page
    A soft tint | 1.06 step | All three surfaces
    line | exempt | Decorative hairline, WCAG 1.4.11
Section: Add your own theme  [16]"Add one CSS block and one entry in the mode list. A mode can
  change knobs as well as colors."
  callout i:warning-circle "A mode that sets --tc-primary-solid must also set
  --tc-primary-on-solid, or it fails the contrast check."
  code: /* after the three imports */
        [data-theme="brand"] {
          color-scheme: dark;

          --tc-page: var(--color-slate-950);
          --tc-surface: var(--color-slate-900);
          --tc-surface-raised: var(--color-slate-800);
          --tc-body: var(--color-slate-50);
          --tc-muted: var(--color-slate-400);
          --tc-line: var(--color-slate-800);
          --tc-line-strong: var(--color-slate-600);

          --tc-primary-solid: var(--color-teal-500);
          --tc-primary-on-solid: var(--color-slate-950);
          --tc-primary-on-soft: var(--color-teal-300);

          --tc-radius: 1rem;
        }
next: "Icons"
```

**Build this.** The page that attracts search traffic in v0.1 (PLAN 15.3), so it is built
from the real tokens, not from the drawing:

- "The three layers" sample says `blue-600`, not `violet-600`.
- "Every class" and "The six tones": generated by `docs:data` (S7) from `src/tokens.css`
  (the library's `scripts/lib/tokens.ts` parser) in all three modes. Each swatch is a live element
  painted with the token, not a picture, and shows its shade name in the current mode.
- Contrast badges beside each pair, computed by `docs:data` with `scripts/lib/contrast-checks.ts`
  and `color.ts`, the same code `check:contrast` runs (PLAN 6.4), and read from
  `.generated/` by the page.
- Live controls at the top (PLAN 6.4): mode, direction, radius, density, changing the page.
  Mode is the page's mode switch; radius and density are `Slider`s writing `--tc-radius` and
  `--tc-density` on the page's `main`; direction is not offered on an English page (S4).
- "Where each color is used": the labelled board, built from real components with the leader
  lines as CSS borders. If it does not fit under 48rem, it becomes a list of the eight roles
  beside a stacked screen.
- "The three modes" sample is read from `tokens.css`, not typed.
- The "brand" sample in "Add your own theme" uses slate and teal: keep it, it is a user's
  example.

### 8. Icons: `/en/docs/icons`

```
hd: "/en/docs/icons" | [34]"Icons" | [16]"84 icons, inlined as SVG. Only the ones you render are
  loaded."
Section: The set  [16]"Phosphor at regular weight, plus three solid variants where a filled shape
  carries meaning."
  table Group | Count | What it covers
    Arrows and carets | 13 | Every direction, plus the double carets pagination needs
    Actions | 19 | Copy, edit, delete, download, search, filter
    Status and feedback | 13 | One icon for each of the six tones, plus a spinner
    Objects and places | 36 | Files, folders, users, devices, brands
    Solid variants | 3 | Filled shapes, where the fill carries meaning
Section: The set, seen   (layer name; the visible heading is "The whole set")
  [16]"All 84, grouped. Amber marks a directional icon - it mirrors itself in Arabic."
  search "Search 84 icons" i:x | filter "All" | "Directional" | "Solid" | "84 results"
  panel 944x1276, grid 906x1238: one tile per icon, icon instance + its name, in this order:
    arrow-down arrow-left arrow-right arrow-square-out arrow-u-up-left arrow-up
    caret-double-left caret-double-right caret-down caret-left caret-right caret-up
    caret-up-down | arrows-clockwise check command copy download-simple funnel link-simple
    magnifying-glass minus palette paperclip pencil-simple plus sort-ascending sort-descending
    translate trash upload-simple x | asterisk bell bell-slash check-circle circle-notch info
    prohibit question spinner tray warning warning-circle x-circle | book-open calendar-blank
    circle clock code dots-six-vertical dots-three dots-three-vertical envelope-simple eye
    eye-slash file file-text folder folder-open gear github-logo globe heart house image list
    lock-open lock-simple monitor moon paper-plane-tilt pause play sidebar-simple sign-out star
    sun terminal-window user users | circle-fill heart-fill star-fill
Section: Two ways to render
  [16]"Icon takes a name and resolves it on the server. Svg takes an imported icon object and
  works anywhere."
  [16]"This is what keeps unused icons out of your bundle. One big map would pull them all in."
  Wrong: 'use client'\nimport { Icon } from 'topclassui/icon'\n\n// server-only, so this fails
         at build time\n<Icon name="spinner" />
  Right: 'use client'\nimport { Svg } from 'topclassui/svg'\nimport { spinner } from
         'topclassui/icons/spinner'\n\n<Svg icon={spinner} />
Section: Sizes  [16]"Icon defaults to 1em so it matches the text beside it. Use a size name when
  it stands alone."
  table Name | Pixels | Where it fits
    (default) | 1em | Inline with text - a key cap, a link, a button label
    xs | 16 | A dense table row
    sm | 20 | A control at sm
    md | 24 | A control at md
    lg | 32 | An empty state
    xl | 40 | A feature block
Section: What flips in right to left  [16]"16 of the 84 mirror in right-to-left. Direction means
  something for an arrow, not for a magnifying glass."
  cards: "Flips" "Every arrow and caret, plus sign-out, paper-plane-tilt and sidebar-simple."
    | "Does not flip" "magnifying-glass, check-circle, gear, clock. A mirrored clock is a broken
    clock." | "Why a list" "A name is not a reliable signal. arrow-square-out flips;
    arrows-clockwise does not."
Section: Adding icons  [16]"Any SVG works with Svg. To add a whole set that is type-checked by
  name, use the CLI."
  terminal: $ npx topclassui icons add-set lucide

              312 icons  ->  topclassui/icons/lucide
              names type-checked as lucide:arrow-left
              Done

            # one of your own, no CLI needed
            import myLogo from './my-logo.svg'
            <Svg icon={myLogo} size="md" />
next: "Theming"
TOC: The set | A sample of the set | Two ways to render | Sizes | What flips in right to left |
  Adding icons
```

**Build this.** The second page that attracts search traffic.

- "The set": the five groups and their counts, written by `docs:data` (S7) from the "The set"
  section of the library's `docs/icons.md` (`packages/topclassui/docs/icons.md` after R3), which is
  where the grouping lives: `raw/` is 84 flat SVGs with no group. The total comes from `raw/`
  and the flip count from `directional.generated.ts`; a test fails when the groups do not add
  up to the folder.
- "The whole set" (one name for the section, the heading and the On this page row,
  surprise 16): all 84 icons, rendered at build time with `<Icon name>` on the server, each
  tile a button that copies `<Icon name="..." />` and is named "Copy the code for {icon}".
  The search box and the All, Directional and Solid filter are a small client island over
  the server-rendered grid (they hide tiles; they never fetch). PLAN 7.4 asks for a
  collection with a Server Action `loadMore`; a static site has no Server Action at request
  time and 84 tiles need no paging: departure.
- Amber marks a directional icon, from `--tc-warning-*` tokens, plus a text label for colour
  blindness.
- "Adding icons": `icons add-set` is a CLI that does not exist; the section shows only the
  `<Svg icon={myLogo} />` path until it does.

### 9. Theming: `/en/docs/theming`

```
hd: "/en/docs/theming" | [34]"Theming" | [16]"Six knobs change the shape of every component at
  once. A mode changes the colors. Nothing else is themeable, by design."
Section: The knobs  [16]"A knob is one custom property that many classes read. Change it once,
  every component follows."
  table Knob | Default | What it moves
    --tc-radius | 0.5rem | Every corner radius: control, box and chip
    --tc-density | 1 | Every control height and its padding
    --tc-motion | 1 | Every transition, and 0 under prefers-reduced-motion
    --tc-list-rows | 7 | How many rows a list shows before it scrolls
    --tc-ring-width | 2px | The focus ring
    --tc-line-width | 1px | Every border
Section: A mode is one block  [16]"There is no theme object and no provider prop for color. A
  mode is a CSS block selected by data-theme."
  code: [data-theme="ocean"] {
          color-scheme: light;
          --tc-primary-solid: var(--color-cyan-700);
          --tc-primary-on-solid: var(--color-white);
          --tc-primary-on-soft: var(--color-cyan-800);
          --tc-radius: 9999px;
        }
  "The ocean mode in full. It changes one tone and one knob."
Section: Scoping a theme to a section  [16]"data-theme works on any element, not only the root.
  Set it on a panel and everything inside recomputes, including the soft tints and the focus
  ring."
  code: <section data-theme="dark" className="bg-page text-body">
          {/* every component in here is dark, including
              its focus ring and its soft tints */}
        </section>
Section: What is deliberately not themeable  [16]"The type scale, the spacing scale and the
  component anatomy are fixed, so two components always line up in a row."
  callout i:info "If a knob you need is missing, open an issue. Overriding a token in your own
  CSS works, but nothing then checks its contrast."
next: "Right to left"
```

**Build this.** As drawn. The knobs table is generated by `docs:data` (S7) from `tokens.css`
(names and defaults). The ocean sample is read from `tokens.css` the same way. Add one live example: a `section` with
`data-theme="ocean"` holding a Button and an Input, beside the same pair in the page's mode.

### 10. Right to left: `/en/docs/rtl`

```
hd: "/en/docs/rtl" | [34]"Right to left" | [16]"Every component mirrors in Arabic without a code
  change, because no component is allowed to say left or right."
Section: The rule  [16]"Direction is set once, on the html element. Components read it through
  logical CSS, never through JavaScript."
  code: <html lang="ar" dir="rtl">

        {/* the provider forwards direction to Base UI and to gestures */}
        <TopClassProvider direction="rtl" locale="ar">
Section: Logical classes only  [16]"Tailwind still ships the physical utilities. This library
  never uses them; the logical form does the work instead."
  table Banned | Use instead
    ml-* mr-* | ms-* me-*
    pl-* pr-* | ps-* pe-*
    left-* right-* | inset-s-* inset-e-*
    start-* end-* | inset-s-* inset-e-*
    text-left text-right | text-start text-end
    border-l border-r | border-s border-e
    rounded-l-* rounded-r-* | rounded-s-* rounded-e-*
    space-x-* divide-x-* | gap-* and border-s on the item
    tracking-* | nothing - Arabic script does not use letter-spacing
Section: Transforms and gestures  [16]"A translate, a transform origin, a gradient or a swipe has
  no logical form in CSS. These multiply by --tc-dir, which is 1 in LTR and -1 in RTL."
  code: [dir="rtl"] { --tc-dir: -1; }

        /* the switch thumb */
        --tc-slide: calc(1rem * var(--tc-dir));
        className="translate-x-(--tc-slide)"

        /* object and background positions have no logical form */
        className="object-left rtl:object-right"
Section: Placement, not side  [16]"Every overlay takes a placement instead of a side. start and
  end resolve to inline-start and inline-end, so a menu opens correctly in both directions."
  Wrong: <PopoverPopup side="left" align="start" />
  Right: <PopoverPopup placement="start-start" />\n\n// start   -> inline-start, mirrors\n//
         bottom  -> bottom, does not
Section: Type, plurals and digits  [16]"Arabic is set in Noto Sans Arabic through a :lang(ar)
  rule, so you never swap a font variable. A label with a count is a function of that count."
  code: // labels/ar.ts
        selected: (n, fmt) => {
          const rule = new Intl.PluralRules('ar').select(n)
          return rule === 'one' ? 'عنصر واحد محدد' : `${fmt.format(n)} عناصر محددة`
        }

        <TopClassProvider locale="ar" numberingSystem="arab" />
Section: What the lint rule catches  [16]"The rule runs on every class string in the library and
  fails the build on a physical class. It catches the deprecated aliases too."
  Wrong: className="pl-4 text-left !mr-2"\n\n// 3 errors:\n//   pl-4      -> ps-4\n//
         text-left -> text-start\n//   !mr-2     -> me-2!
  Right: className="ps-4 text-start me-2!"
next: "Server first"
```

**Build this.** As drawn. Two corrections: the font rule is `[lang|='ar']`, not `:lang(ar)`
(DECISIONS: the Arabic font is set only where `lang` is written); the banned-class table is
checked against the repo's ESLint rule names at build time, so a row the lint does not catch
is not claimed. A live pair, one demo in `dir="ltr"` and its `rtl` demo, shows the mirroring.

### 11. Server first: `/en/docs/server-first`

```
hd: "/en/docs/server-first" | [34]"Server first" | [16]"A component ships JavaScript only when it
  has to listen for something. Most of them never do."
Section: The three kinds  [16]"Every component is one of three kinds. The kind is shown on the
  chip beside its name."
  table Kind | Chip | What it means
    S - server | server - 0 KB | Renders on the server. No hooks, no event handlers, no client
      JavaScript
    C - client | client - n KB | Needs the browser: a popup, a drag, a keyboard listener
    Sp - split | split - 0 KB + n KB | The markup renders on the server and one small part
      hydrates. Tag is a server component until you make it removable
Section: What may cross the boundary  [16]"Only what React can serialise: strings, numbers,
  booleans, plain objects, arrays and children. A function never crosses, except a Server
  Action."
  Wrong: // in a Server Component\n<Select items={cities} getKey={(c) => c.id} />\n// getKey is
         a function: it cannot cross
  Right: 'use client'\n// the file that configures a collection is a client file\n<Select
         items={cities} getKey={(c) => c.id} />
Section: Why index.tsx has no hooks  [16]"Markup lives in index.tsx, behaviour in hook.ts.
  index.tsx never contains use client and never imports hook.ts. A build check enforces it."
  code: // index.tsx - server
        import { useId } from 'react'   // allowed
        import { use } from 'react'     // allowed

        // anything else fails check-boundaries:
        // useState, useEffect, useRef, useMemo, useCallback
  "The two hooks a Server Component is allowed to call."
Section: How a split component works  [16]"The server half renders the markup and resolves
  anything needing the server, such as icon names. The client half adds the one behaviour."
  code: // tag/index.tsx - server
        export function Tag({ removable, icon, ...rest }) {
          const glyph = icon ? <Icon name={icon} /> : null
          return removable
            ? <TagRemovable icon={glyph} {...rest} />   // client
            : <TagStatic icon={glyph} {...rest} />      // still server
        }
Section: How sizes are checked  [16]"Every component has a size target and the build fails when
  it is crossed. A browser test also compares a preview page against a blank one."
  callout i:info "The numbers on the chips are targets until v0.1 ships with the first measured
  build. Every chip on this site says which one it shows."
Section: What it costs you  [16]"Server-first comes with constraints. These are the ones you will
  notice."
  cards: "No onClick on a server component" "A Button rendered on the server submits a form or
    follows a link. If it must run code in the browser, it lives in a client file."
    | "Collections need a client file" "getKey is a function, so Table, Select, Combobox and
    Command must be configured in a file marked use client."
    | "Some controls wait for hydration" "Checkbox, Switch and Select submit their default value
    until JavaScript loads. Input and Textarea need no JavaScript at all."
next: "Accessibility"
```

**Build this.** As drawn, with one card corrected: "Collections need a client file" names
Select, Combobox and Command, not Table. Table is `rendering: 'server'` in its `meta.ts`, and
eleven of its demos pass `getKey` with no `'use client'`: a function may be created and
passed inside one server file. The "How sizes are checked" callout follows choice 15. The Tag
sample is the real `tag/index.tsx` shape, simplified; check it against the file. The kinds
table counts the components of each kind from `meta.ts` at build time (20 server, 12 split,
20 client across the 52 folders today).

### 12. Accessibility: `/en/docs/accessibility`

```
hd: "/en/docs/accessibility" | [34]"Accessibility" | [16]"WCAG 2.2 AA is the target. This page
  lists what a machine checks, what a person checks, and what is not yet covered."
Section: Contrast  [16]"Contrast is measured from the real token values in every mode, as part of
  the build. Anything within 0.15 of a threshold counts as failing."
  table What | Minimum
    Body and muted text | 4.5:1
    A tone text on its own soft tint | 4.5:1
    A control boundary, on every surface it can sit on | 3:1
    The focus ring | 3:1
    Icons that carry meaning | 3:1
Section: Target size  [16]"Every interactive element is at least 24 by 24 CSS pixels, and grows
  to 44 on touch and other coarse pointers."
  code: export const TOUCH_TARGET =
          'min-h-6 min-w-6 pointer-coarse:min-h-11 pointer-coarse:min-w-11'
  "The shared class every control carries."
Section: Every drag has a keyboard path  [16]"WCAG 2.5.7. A Slider takes arrow keys. A Drawer and
  a Toast always render a close button. A sortable list has move up and move down buttons."
Section: Focus is always visible  [16]"One focus ring on every control: a CSS outline with an
  offset, so the gap shows the real background on any surface. --tc-ring reaches 3:1 on every
  surface."
  code: export const FOCUS_RING =
          'outline-none focus-visible:outline-(length:--tc-ring-width)' +
          ' focus-visible:outline-offset-(length:--tc-ring-offset)' +
          ' focus-visible:outline-ring'
Section: Labels are enforced by the types  [16]"An Input outside a Field needs an id or an
  aria-label, and TypeScript rejects one without. An IconButton requires a label."
  Wrong: <Input placeholder="Email" />\n// Type error: id or aria-label is required
  Right: <Field name="email" label="Email">\n  <Input type="email" />\n</Field>
Section: Automatic and manual
  table Check | How | When
    Contrast | check-contrast.ts | Every build
    ARIA and roles | axe-core in every demo | Every CI run
    Target size | A browser test measures every focusable element | Every CI run
    Keyboard behaviour | A browser test per component, following the ARIA Authoring Practices |
      Every CI run
    Screen reader | NVDA and VoiceOver, by hand | Before each release
    Forced colors | Windows high contrast, by hand | Before each release
Section: Known gaps  [16]"Nothing has been tested yet. This page is the bar every component must
  pass, not a result it has passed. The first checked build ships with v0.1."
  callout i:warning-circle "Forced-colors mode is a manual check. A layout that relies on
  background fills disappears there, so every component is drawn with borders."
next: "Components"
```

**Build this.** Not a PLAN 16 route; built as drawn because it is the page a buyer reads. Its
stale lines change:

- "Known gaps": "Nothing has been tested yet" is false. Rewrite it from the gates: contrast on
  every build; axe, target size, the focus ring and the contain check in a real browser on
  every demo in 3 modes and 2 directions; keyboard tests per component. Still manual and not
  yet done: screen readers (NVDA, VoiceOver) and forced colours. Say that plainly.
- "Automatic and manual": the "When" column says "every `pnpm check`", not "every CI run"
  (CI is off).
- "Labels are enforced by the types": the IconButton sentence goes (IconButton is not built).
- "Every drag has a keyboard path": the sentence "A sortable list has move up and move down
  buttons" goes until a sortable list exists; Slider, Drawer and Toast stay.
- `TOUCH_TARGET` and `FOCUS_RING` are imported from `topclassui/classes` and printed, not
  typed.

### 13. Components (the catalog): `/en/docs/components`

```
Navbar: as the shell, but the third link reads "The install command and this site".
Sidebar: as the shell, but the Icons row reads "The install command and this site" and is
  46 tall (two lines). nav:current = Components.
main 1030  V g28 p28,43,28,43
  hd: [36]"Components" | [16]"46 components, each with a live preview. Every state at once, a
    playground wired to the real props, and two ways to use each one: copy the source into
    your project, or install the package."
  Before you start 944x620: [16]"Before you start" | "once per app" | "Every card below shows a
    copy command and an import line. These four steps make either of them work."
    grid 2 x 2 of step cards (471/472 wide, p18 g9):
    "1. Install the package and its peers" | "npm i topclassui zod\n# then add the components
      you want:\nnpx topclassui add button" | "Three peer dependencies: react, react-dom and
      Tailwind 4.2 or later. Your project already has them, and zod installs with the package."
    "2. The Tailwind CSS v4 entry" | the three @import lines | "Three lines, in this order, and
      no tailwind.config.js. The third carries the mapping that gives Tailwind the semantic
      class names."
    "3. The root layout" | "// app/[locale]/layout.tsx\nconst dir = locale === 'ar' ? 'rtl' :
      'ltr'\n\nreturn (\n  <html lang={locale} dir={dir} data-theme="dark">\n    <head>
      <ThemeScript /></head>\n    <body>\n      <TopClassProvider direction={dir}
      locale={locale}>\n        {children}\n      </TopClassProvider>\n    </body>\n  </html>\n)"
      | "Pass direction and locale to TopClassProvider as props from your layout; do not read
      them from document.dir in an effect. Put ThemeScript first in <head>: it sets data-theme
      before the first paint, so the attribute on <html> is only the default until the script
      runs."
    "4. Or copy the source into your repo" | "npx topclassui add button" | "The CLI copies the
      source into your project with its constants, schema, types and variants. Steps 2 and 3
      still apply."
  Legend 944x170: [16]"How to read a card" | "Every component below is laid out the same way, so
    you learn it once. Five parts, top to bottom."
    "1" "The stage" "The component in its most common configuration, on the page background,
      so you see it in context." | "2" "Try it" "Every prop you can change, with its allowed
      values." | "3" "The code" "The JSX that produces the preview above it. Copy it, paste it
      and it runs." | "4" "Every state" "Hover, focus, disabled, loading, error - all at once.
      You never hover to review a state." | "5" "Two ways in" "Copy the source into your repo,
      or import it from the package. Same component."
  then 7 Section headers (V g8 p26,0,0,0: [26] name | "<n> components" | sentence | rule
  100x1) and 46 Previewer cards, 944 wide, 845 to 1246 tall, g28.
On this page 190  V g7 p16: "ON THIS PAGE" | "START HERE" "How to read a card"
  "Install: CLI or package" | "SECTIONS" Actions 4 | Forms 13 | Display 7 | Data 4 |
  Feedback 6 | Overlays 6 | Navigation 6
Footer: as the shell.
```

The seven section headers:

```
Actions | 4 components | Things a person clicks. Each one renders on the server unless it needs
  an event handler in the browser.
Forms | 13 components | Each control carries a real name and submits inside a plain <form>.
  Input and Textarea work before any JavaScript loads; the rest submit their default value and
  become interactive once it does.
Display | 7 components | Presentational pieces. Nearly all of them render on the server and ship
  no JavaScript; where one adds a button, such as a removable Tag, the chip on its card says so.
Data | 4 components | Every list component works the same way: a prop for visible rows,
  windowing above 200 items, and a loadMore callback. It never fetches.
Feedback | 6 components | Status, progress and empty states. Toast and Progress announce
  themselves to screen readers; the rest stay silent.
Overlays | 6 components | Overlays share one scroll rule: the overlay scrolls, the page behind it
  does not. Placement is logical, so it mirrors in Arabic.
Navigation | 6 components | Links are links. Every one of these renders a real <a href>, so
  middle-click, open in a new tab and crawlers all work.
```

The 46 cards:

```
ACTIONS
Button | server - 0 KB | Five variants across three tones; render={<Link/>} gives a real <a>
  that looks identical. | try: variant solid, tone primary, size md; loading fullWidth disabled
  | import Button, Icon, next/link | note: loading disables the button but keeps full color,
  so it never reads as disabled. | 6 states: idle hover active focus-visible disabled loading
Tag | split - 0 KB server + 0.4 KB client | A label chip that renders on the server. Setting
  removable adds a dismiss button, and that button is the only part that runs in the browser.
  | try: variant soft, tone neutral, size md; removable truncate disabled | note: The
  removable Tag is the client half; a plain Tag stays on the server and ships 0 KB.
  | 5 states: idle hover active focus-visible disabled
Kbd | server - 0 KB | A keycap; a combo nests one <kbd> per key inside an outer <kbd>, as the
  HTML spec says. | try: variant outline, size md; pressed muted disabled | imports Kbd, Text,
  Icon | note: Icon takes no size here: it defaults to 1em and follows the key's own text.
  | 4 states: idle hover active disabled
SegmentedControl | client - 1.2 KB | A radio group drawn as one track; arrow keys select as
  they move, and reverse in RTL. | try: size md, tone neutral, orientation horizontal;
  fullWidth invalid disabled | 'use client', SegmentedControlItem, SegmentedControlRoot | note:
  Arrow keys move between segments, and the direction for RTL comes from TopClassProvider.
  | 5 states: idle hover focus-visible checked disabled

FORMS
Input | server - 0 KB | A native input that ships 0 KB. It will not compile without an id or an
  aria-label. | try: variant outline, size md, type text; disabled invalid required fullWidth
  | Field, Input | note: Outside a Field, Input needs id or aria-label - the types reject an
  unlabelled one. | 6 states: idle hover focus-visible disabled read-only invalid
Textarea | split - 0 KB server + 1.2 KB client | Native textarea on the server; autosize and the
  live counter are the only client parts. | try: variant outline, size md, maxRows 6; autosize
  showCount disabled invalid | note: Server-rendered on its own; maxRows is what loads the
  small client half for autosize. | 6 states: idle hover focus-visible disabled invalid
  "at limit"
Select | client - 4.8 KB | A listbox whose popup stays inside the viewport and switches to
  windowed rendering above 200 options. | try: variant outline, size md, placement
  bottom-start; disabled invalid required fullWidth | 'use client', Field, Select | note:
  getKey is a function, so the file needs 'use client'; it cannot cross from a server page.
  | 6 states: idle hover focus-visible open disabled invalid
Combobox | client - 5.6 KB | A text input that filters a listbox; it calls loadMore() for the
  next page and caches nothing. | try: variant outline, size md, visibleRows 7; disabled
  invalid fullWidth hasMore | note: Filtering runs over the loaded items; remote pages arrive
  through hasMore and loadMore. | 6 states: idle focus-visible open loading "no matches"
  (empty) disabled
Checkbox | client - 1.2 KB | Checked, unchecked or indeterminate; a hidden input posts the
  default before hydration. | try: size md, tone primary; defaultChecked indeterminate
  disabled invalid | note: Before hydration it submits its default value: the control is a
  span, not an input. | 6 states: unchecked checked indeterminate hover focus-visible disabled
RadioGroup | client - 1.6 KB | Radios rendered as buttons under one name: one Tab stop,
  read-only until hydration. | try: size md, tone primary, orientation vertical; disabled
  required invalid | Radio, RadioGroup | note: The group carries name and defaultValue; each
  Radio carries only its value and label. | 6 states: unselected selected hover focus-visible
  disabled invalid
Switch | client - 0.9 KB | An on/off switch whose thumb travels the correct way in
  right-to-left layouts, with no code change. | try: size md, tone primary; defaultChecked
  disabled required invalid | note: xs and sm still grow to 44px under a coarse pointer, so
  the thumb stays tappable. | 6 states: off on hover focus-visible disabled invalid
Slider | client - 1.9 KB | Single or range; arrow keys and a click on the track replace every
  drag. | try: size md, tone primary, orientation horizontal; disabled showValue invalid
  | note: Ships a hidden input, so it submits with the form but cannot move before hydration.
  | 6 states: idle hover active focus-visible disabled invalid
Number field | client - 2.3 KB | A min/max/step stepper over a hidden input, so the form
  submits even before hydration. | try: size md, variant outline, step 1; disabled invalid
  required fullWidth | NumberField | note: min, max and step are clamped at runtime, so a
  typed value cannot break the UI. | 6 states: idle hover focus-visible at-limit invalid
  disabled
OTP field | client - 1.8 KB | One input per digit that accepts a paste into any box and can
  auto-submit when full. | try: length 6, validationType numeric, size md; mask autoSubmit
  disabled invalid | OTPField | note: autoSubmit posts the enclosing form the moment the last
  digit is typed. | 6 states: idle focus-visible "partly filled" complete invalid disabled
Date picker | client - 18.5 KB | A lazy-loaded calendar popover that formats dates with the
  provider's locale and digits. | try: mode single, placement bottom-start, firstDayOfWeek 1;
  disabled invalid clearable showWeekNumbers | DatePicker | note: The value is an ISO date
  string; the shown format comes from the provider locale. | 6 states: idle open selected
  today disabled invalid
File upload | client - 4.4 KB | A drop zone that always has a browse button, with the file list
  as a windowed collection. | try: accept image/*, maxSize 10MB, maxFiles 5; multiple disabled
  showList | FileUpload | note: maxSize is in bytes, checked in the browser only - check it
  again in the action. | 6 states: idle "drag over" uploading done error disabled
Rating | split - 0 KB server + 1.3 KB client | Read-only stars add 0 KB and can emit
  AggregateRating JSON-LD; only the editable version hydrates. | try: max 5, size md,
  precision half; readOnly showValue allowClear | Rating, Text | note: value renders stars on
  the server; only an editable rating ships the client half. | 6 states: empty partial full
  hover focus-visible read-only

DISPLAY
Badge | server - 0 KB | A status label in three variants across all six tones, with its own
  radius token. | try: variant soft, tone primary, size md; dot uppercase truncate | Badge,
  Icon | note: Badge has no ARIA role: the text must carry the meaning, color alone never does.
  | 3 states: solid soft outline
Avatar | split - 0 KB server + 0.5 KB client | Image, initials or an icon, on the same five
  sizes as every control so rows line up. | try: size md, shape circle; bordered status
  clickable | AvatarRoot, AvatarImage, AvatarFallback | note: The fallback shows while the
  image loads and after it fails; initials are children. | 4 states: image initials icon
  loading
Avatar group | split - 0 KB server + 0.4 KB client | Overlapping avatars with a +N counter; max
  is clamped to a safe range. | try: max 4, size md, spacing tight; showCount bordered
  | AvatarGroup + Avatar parts | note: max counts children, so render every member and let the
  group hide the overflow. | 3 states: two four overflow
Card | server - 0 KB | A surface with a larger radius than a control, so it never reads as a
  button. | try: variant outline, padding md; interactive media footer | CardRoot CardHeader
  CardBody CardFooter, Heading, Text, Button | note: Card sizes to its container with
  @container, not the viewport, so it fits a sidebar. | 3 states: idle hover focus-visible
Separator | server - 0 KB | A hairline divider. It is decorative, so it is exempt from the 3:1
  contrast rule. | try: orientation horizontal, spacing md; withLabel decorative | Separator,
  Text | note: A vertical Separator takes its height from the row; give the row a height or
  stretch. | 3 states: horizontal vertical "with label"
Skeleton | server - 0 KB | The placeholder every component ships with, so a page holds its
  shape while it loads. | try: variant text, lines 3; animate rounded | Suspense, Skeleton,
  Heading | note: Give the skeleton the real dimensions; rows is clamped, and a mismatch is
  layout shift. | 4 states: text circle rect card
CodeBlock | split - 0 KB server + 0.9 KB client | Code highlighted by Shiki on the server; the
  only JavaScript is the copy button. | try: language tsx, theme dark, maxLines 20;
  lineNumbers wrap showCopy | note: Pass the code as a template-literal child; Shiki
  highlights it at build time. | 5 states: idle "copy hover" copied wrapped "no header"

DATA
Table | server - 0 KB | Server-rendered table with sortable columns, a sticky first column and
  a page size you choose - 25, 50, 100 or 500 rows. | try: density comfortable, variant
  outline, sortBy name, pageSize 50 "25 / 50 / 100 / 500"; sortable stickyFirstColumn striped
  hasMore | note: On the server visibleRows falls back to the --tc-list-rows knob, not the
  provider. | 6 states: idle "hover row" sorted selected empty loading
TreeView | client - 4.6 KB | A tree whose expanded nodes flatten into one windowed list, so
  10,000 nodes stay fast. | try: selectionMode single, indent 18, visibleRows 12; multiSelect
  showLines virtualize | code caption: "Item icons are IconName strings, like Timeline and
  DropdownMenu; getKey needs the directive." | note: getKey is a function, so the file that
  renders this tree needs 'use client'. | 6 states: collapsed expanded selected focus-visible
  loading empty
Timeline | server - 0 KB | A rail of dated events, each with a marker in its tone; the rail
  mirrors in right-to-left layouts. | try: variant default, align start, tone primary;
  compact showConnector reverse | note: Item icons are IconName strings: the server half
  resolves them, no icon JS ships. | 6 states: done current todo error loading empty
Stepper | split - 0 KB server + 1.8 KB client | A done step carries a tick, not just a color, so
  it survives a greyscale screenshot. | try: orientation horizontal, size md, activeStep 2;
  clickable showConnector compact | note: From a server page pass defaultValue: onValueChange
  is a function and cannot cross. | 5 states: todo current done error disabled

FEEDBACK
Alert | server - 0 KB | Four tones, each with its own icon, so the message reads without
  relying on color. | try: tone info, variant soft, size md; dismissible withIcon | note: Not a
  live region: page content. Announce what just happened with Toast instead. | 4 states: info
  success warning danger
Toast | client - 3.4 KB | A close button is always rendered, because swiping one away is a drag
  (WCAG 2.5.7). | try: tone success, position bottom-end, duration 5000; dismissible
  pauseOnHover withAction | 'use client', Button, toast | note: The viewport lives in
  TopClassProvider; toast.add works outside React too. | 6 states: success error loading
  stacked entering limited
Banner | split - 0 KB server + 1.1 KB client | Full width above the header; it pushes the page
  down rather than covering anything. | try: tone primary, variant soft, placement top;
  dismissible sticky withAction | note: Dismissal is remembered per id, so change the id when
  the message changes. | 4 states: primary info warning dismissed
Progress | server - 0 KB | A neutral track with a bar in the chosen tone; height follows the
  spacing scale. | try: tone primary, size md, value 60; indeterminate showLabel | Progress,
  Text | note: It renders no text and clamps value to 0-100, so label it with aria-labelledby.
  | 6 states: empty half complete success danger indeterminate
Spinner | server - 0 KB | A spinner is an icon, so it uses the icon sizes and follows the text it
  sits in. | try: size md, tone primary; label centered overlay | note: Prefer Skeleton when
  the final shape is known; Spinner is for unknown waits. | 5 states: xs sm md lg xl
EmptyState | server - 0 KB | What every collection renders when there is nothing to show.
  | try: size md, variant dashed, icon tray; withAction compact bordered | next/link, Button,
  EmptyState, Text | note: Collections render this for status 'empty'; replace it with
  emptyFallback. | 4 states: default filtered error compact

OVERLAYS
Dialog | client - 2.1 KB | Modal dialog whose body scrolls between a sticky header and footer,
  with no layout shift. | try: size md, placement center; dismissible modal scrollBody | code
  caption: "DialogBody is the scroll container: the header and footer stay put while it
  scrolls." | DialogBody DialogClose DialogDescription DialogFooter DialogHeader DialogPopup
  DialogRoot DialogTitle DialogTrigger, Button, ./actions | note: The popup renders the form,
  so a Server Action submit ships no client handler. | 5 states: closed open alert scrolled
  "focus trapped"
Drawer | client - 2.8 KB | Dialog that slides from a logical edge, so it mirrors in RTL without
  a code change. | try: side inline-end, size md; dismissible snapPoints swipeToClose
  | DrawerBody DrawerPopup DrawerRoot DrawerTitle DrawerTrigger, Button, Link, next/link
  | note: placement is logical: start opens from the left in LTR and from the right in RTL.
  | 5 states: closed "side sheet" "bottom sheet" dragging "focus trapped"
Popover | client - 1.7 KB | Anchored panel for links and controls; it flips and shrinks instead
  of overflowing. | try: placement bottom, sideOffset 8, size md; modal showArrow dismissible
  | note: A tooltip that needs a link or a control is a Popover; a lint rule enforces it.
  | 5 states: closed open flipped focus-visible dismissed
Tooltip | client - 1.1 KB | One or two lines of text on hover; a shared delay makes the next
  tooltip open instantly. | try: placement top, delay 600, closeDelay 0; showArrow disabled
  instant | TooltipPopup TooltipRoot TooltipTrigger, IconButton, Icon | note: Touch never
  shows a tooltip, so the trigger's own label must repeat the text. | 4 states: hidden top
  bottom delayed
Dropdown menu | client - 2.4 KB | Menu whose link items render real anchors, so open-in-new-tab
  and middle-click work. | try: placement bottom-start, size md, sideOffset 8; modal loop
  closeOnSelect | import { DropdownMenu } from 'topclassui/dropdown' | note: href and Server
  Action items work from a server page; onSelect needs a client file. | 6 states: closed open
  "hover item" submenu checked "disabled item"
Command palette | client - 9.4 KB, lazy | Searchable action palette that loads on first open,
  never in the initial bundle. | try: visibleRows 7, placement center, shortcut Ctrl K; modal
  loop filter | code caption: "Loaded with React.lazy and mounted on first open, so it is
  never in the initial bundle." | 'use client', useState, Button, Command, Svg,
  icons/magnifying-glass | note: getKey is a function, so the palette must be configured
  inside a client file. | 6 states: closed open typing empty loading selected

NAVIGATION
Navbar | split - 0 KB server + 1.2 KB client | Sticky header with server-rendered links that
  publishes its own height as --tc-sticky-top. | try: variant sticky, size md; sticky bordered
  collapsible | NavbarActions NavbarBrand NavbarLink NavbarLinks NavbarRoot | note: The bar
  sets --tc-sticky-top to its own height, so #anchor targets clear it. | 6 states: top
  scrolled mobile "open menu" focus-visible transparent
Sidebar | split - 0 KB server + 1.8 KB client | Collapsible side rail whose links are server
  HTML; only the collapse toggle runs in the browser. | try: variant inline, width 220,
  defaultOpen true; collapsible bordered overlayOnMobile | SidebarGroup SidebarLink
  SidebarRoot | note: defaultOpen is the expanded state; AdaptiveSidebar swaps it for a Drawer
  on mobile. | 5 states: expanded collapsed "active item" hover focus-visible
Tabs | split - 0 KB server + 1.4 KB client | Panels render on the server and stay in the HTML,
  so inactive text is still indexed. | try: variant line, size md, orientation horizontal;
  keepMounted fullWidth disabled | TabsList TabsPanel TabsRoot TabsTab, Text | note:
  keepMounted keeps inactive panels in the server HTML; Base UI unmounts them by default.
  | 4 states: line enclosed focus-visible disabled
Accordion | split - 0 KB server + 1.1 KB client | Closed panels stay in the DOM with
  hiddenUntilFound, so Ctrl+F and crawlers find them. | try: type single, variant outline;
  collapsible hiddenUntilFound disabled | AccordionItem AccordionRoot, Text | note: Panels use
  hiddenUntilFound, so closed text is still found by Ctrl+F and indexed. | 5 states: closed
  open hover focus-visible disabled
Breadcrumb | server - 0 KB | Real links with aria-current on the last crumb; it also emits
  BreadcrumbList JSON-LD. | try: separator caret, maxItems 4; showHome collapse truncate | code
  caption = note: "Leave href off the last item; the same array emits the BreadcrumbList
  JSON-LD." | Breadcrumb, getLabels from 'topclassui/utils' | 4 states: idle hover collapsed
  current
Pagination | server - 0 KB | Page numbers are real hrefs, not click handlers; siblingCount is
  clamped to a safe range. | try: siblingCount 1, size sm, shape rounded; showFirstLast
  showPrevNext compact | code caption: "locale travels with labels: a count label is (n, fmt)
  and needs an Intl.NumberFormat." | Pagination, getLabels | note: getHref keeps every page
  crawlable; siblingCount and boundaryCount are clamped. | 4 states: "first page" middle
  "last page" disabled
```

**Build this.**

- **The shell's spacing** (surprise 17), the `h1` "Components", the lead.
- **Before you start**: the four steps as drawn, with the release plan's install line and
  paths. Step 4 (copy the source) appears only when the CLI ships.
- **How to read a card**: the legend, as drawn (5 parts).
- **The seven sections**, each an `h2` with its count and sentence as drawn, then its cards
  (S8). The section of each card comes from `content/sections.ts`, which holds Figma's
  grouping above. Counts are computed.
- **The 46 cards' copy** (description, note, states) is the first draft of each
  `content/components/<slug>.ts`. The Try it lists above are not built as drawn: the controls
  come from each schema (S7), so a drawn control with no prop behind it (Kbd's `pressed`,
  Card's `media`, Separator's `withLabel`, Popover's `sideOffset` if it is not a prop) does
  not appear. The JSX samples in Figma are not used (S7).
- **Notes that are wrong for the built code**, fixed in the content files: Stepper ("From a
  server page pass defaultValue": Stepper is a server component with `value`); TreeView's code
  caption ("Item icons are IconName strings": its `icon` is a ReactNode, unit-5 choice 29);
  CodeBlock ("highlighted by Shiki on the server": the component has no highlighter; the
  caller passes `highlighted`); Date picker ("lazy-loaded calendar": check that the built one
  is lazy before the chip says so); Tooltip's imports (`IconButton` does not exist); Dropdown
  menu's import (`topclassui/dropdown` is right for the slug, keep it); Breadcrumb and
  Pagination (`getLabels` from `topclassui/utils`: use the release's real subpath).
- **On this page**: START HERE (How to read a card, Install) and SECTIONS (the seven, with
  counts).
- **Weight.** 46 cards are heavy. Server parts are HTML; client stages and Try it mount near
  the viewport (S8). If the lab budgets fail on this page, the fallback is seven pages, one
  per section, with the catalog keeping the chips (choice 18).

### 14. A component's page: `/en/docs/components/<slug>`

```text
Not drawn. Only the catalog and its Arabic copy are drawn; a single-component page exists
only in the superseded drafts at y = 64000.
PLAN 16: a one-sentence description; the install and import line; a demo grid (two columns
  on desktop, one on mobile), each demo a live preview with a code tab and a copy button; a
  States block; page controls for mode, direction, density and radius; the props table; a11y
  notes with a keyboard table; RTL notes; the server/client breakdown with the measured size;
  related components.
PLAN 20: "The docs page exists in English and Arabic, with a props table generated from the
  .d.ts and the schema." No component can be stable without it.
```

**Build this.** The template, generated for all 46 cards, and for Field, Form and Meter
(choice 5). Sections in this order, each an `h2` in On this page:

1. **Head**: the breadcrumb (Home > Components > {Title}, the library's `Breadcrumb` with
   its `baseUrl`, which emits the BreadcrumbList; every crumb is a page that exists), the `h1` (the human title), the description, the chip.
2. **The Previewer card** (S8), whole.
3. **Examples**: the demos the content file lists, a grid of two columns at 64rem and up, one
   below. Each demo is a `Tabs` with "Preview" and "Code" (`keepMounted`, so the code is in
   the HTML for search engines), the code highlighted and rewritten (S7), a copy button named
   "Copy the {demo} code for {Component}". The `rtl` demo is always included, rendered in
   `dir="rtl" lang="ar"`; 48 of the 49 `dummy/` folders have one, and step 3 adds Form's
   (choice 5 gives Form a page).
4. **Props**: one table per part (`Table`, server): Prop, Type, Default, Limits (min and max
   from the schema), Description. Generated (S7). In Arabic the headings and the description
   column are translated; prop names and types stay Latin.
5. **Keyboard and accessibility**: the keyboard table and two or three notes, from the
   content file (first drafted from the README's hand-written section).
6. **Right to left**: one or two lines and what mirrors.
7. **Server and client**: what renders where, from `meta.ts` and the component's files
   (`index.tsx` only, or `client.tsx` too), and the chip's number (choice 15).
8. **Related**: the section's other components and the rule pages (PLAN 15.3).

The page controls PLAN 16 asks for (mode, direction, density, radius, "segmented, not a
dropdown"): mode is the page's switch; density and radius are two `SegmentedControl`s
(three values each) at the top of Examples writing `--tc-density` and `--tc-radius` on the
examples; direction is not offered on an English page (choice 4).

The two pages that share a card (the catalog and this) do not compete in search: the catalog
card's text is short, and each page's canonical is itself.

### 15. Connectors: `/en/docs/connectors` (later)

```
hd: "/en/docs/connectors" | [34]"Connectors" | [16]"A connector pairs a desktop component with a
  mobile one behind one set of props. The viewport decides which one renders; your code does
  not."
Section: What a connector is  [16]"A dropdown is hard to use on a phone. A bottom sheet with the
  same items works better. A connector makes that swap for you."
  code: import { AdaptiveMenu } from '@/topclassui/components/adaptive-menu'

        <AdaptiveMenu
          trigger={<IconButton label="Row actions"><Icon name="dots-three" /></IconButton>}
          title="Row actions"
          items={items}
        />

        // Dropdown at 48rem and up. Drawer below. Same items, same order.
Section: The contract  [16]"Both halves share one set of prop types, and createAdaptive is called
  with those types spelled out. TypeScript checks each half accepts every prop."
  code: export const AdaptiveMenu = createAdaptive<MenuContract>(DropdownMenu, DrawerMenu)

        // NoInfer stops TypeScript inferring the contract from the halves,
        // so a half that needs an extra prop is a type error, not a leak
Section: The list
  table Connector | Desktop | Mobile | Tier
    AdaptiveMenu | DropdownMenu | Drawer sheet | 1
    AdaptiveSelect | Select | Drawer list | 1
    AdaptiveDialog | Dialog | Full-height Drawer | 1
    AdaptiveTooltip | Tooltip | Popover, on tap | 2
    AdaptiveSidebar | Sidebar | Drawer from inline-start | 2
    AdaptiveDatePicker | Popover calendar | Drawer calendar | 3
    AdaptiveCombobox | Combobox | Full-height Drawer with search | 2
    AdaptivePopover | Popover | Bottom Drawer | 2
    AdaptiveContextMenu | Right-click menu | Long-press Drawer | 2
    AdaptiveNav | Navbar links | Hamburger Drawer or BottomNav | 2
    AdaptiveFilters | Filter sidebar | Drawer with Apply | 2
    AdaptiveToolbar | Full toolbar | Overflow menu | 2
    AdaptiveTabs | Tabs | Scrollable tabs | 3
    AdaptiveTable | Table | Stacked cards | 3
    AdaptivePagination | Full page list | Compact prev and next | 3
    AdaptiveActions | Inline buttons | Sticky bottom bar | 3
Section: Every connector, both ways  [16]"Two layouts, one set of props. A tablet gets whichever
  side of 48rem it lands on."
  Segmented:viewport 235x34: seg:Desktop | seg:Tablet | seg:Mobile
  "Desktop and tablet ≥ 48rem  ·  mobile < 48rem"
  cards 944x13867: 16 Previewer cards, 821 to 916 tall (template below)
Section: How the mode is decided  [16]"The default query is (width < 48rem). The layout is chosen
  when the overlay opens and kept until it closes, so resizing never swaps an open overlay."
  callout i:info "The trigger is the same markup in both layouts, so it never flashes on a phone
  after hydration."
Section: Writing your own  [16]"Write two components that share one set of props, then pass them
  to one call. The mobile half may clamp a prop, never reject one."
  code: interface FilterContract extends StateProps {
          filters: readonly Filter[]
          value: string[]
          onValueChange?: (v: string[]) => void
        }

        export const AdaptiveFilters = createAdaptive<FilterContract>(FilterPopover, FilterSheet)
next: "Theme builder"
TOC: What a connector is | The contract | The list | Every connector, both ways |
  How the mode is decided | Writing your own
```

The connector card:

```
AdaptiveMenu | client - 4.1 KB | A dropdown on desktop, a bottom sheet on a phone. Same items,
  same code. | ≥ 48rem · Dropdown / < 48rem · Drawer | try: mode auto, placement bottom-start,
  size md; open modal disabled | note: The layout is chosen when the menu opens and held until
  it closes. | Dropdown: Desktop ≥ 48rem, Tablet landscape; Drawer: Tablet portrait, Phone;
  Held until close: Resized while open; Same items, same order: Keyboard
AdaptiveSelect | client - 4.8 KB | A popup list on desktop, a drawer list on a phone. | Select
  popup / Drawer list (Riyadh Jeddah Dammam Mecca) | note: The layout is chosen when the list
  opens and held until it closes. | ... Arrow keys, type ahead: Keyboard
AdaptiveDialog | client - 5.2 KB | A centred dialog on desktop, a bottom drawer on a phone.
  | Dialog / Drawer ("Publish changes", "Your site goes live.", Cancel, Publish) | try: mode
  auto, width 32rem, size md; open modal dismissible | ... Escape closes: Keyboard
AdaptiveTooltip | client - 2.4 KB | A hover tooltip where there is a pointer, a tap popover where
  there is not. | fine pointer · Tooltip / coarse pointer · Popover ("Copy link", "Tap anywhere
  to dismiss.") | note: Pointer type decides this one, not width. A coarse pointer gets the
  popover. | Tooltip: Mouse, Trackpad; Popover: Touch, Stylus; (hover: none): Query; Focus
  opens it: Keyboard
AdaptivePopover | client - 4.4 KB | A popover on desktop, a bottom drawer on a phone. | Popover /
  Drawer ("Filter by status", Paid, Pending, Overdue)
AdaptiveCombobox | client - 5.6 KB | A search popup on desktop, a full-height drawer with a
  search field on a phone. | Combobox popup / Full-height drawer | Always visible: Search field
AdaptiveContextMenu | client - 4.3 KB | Right-click on a pointer, long-press on touch. | fine
  pointer · Right-click menu / coarse pointer · Long-press drawer (Rename Duplicate Delete)
  | try: mode auto, trigger pointer, size md | (pointer: coarse): Query; Context key opens it
AdaptiveSidebar | split - 0 KB + 2.8 KB | A fixed sidebar on desktop, a drawer from the start
  edge on a phone. | try: mode auto, width 18rem, size md; collapsible defaultOpen disabled
  | note: CSS decides it at every width. No JavaScript, and one set of links in the markup.
  | CSS, no JavaScript: Switch; Crawlable in both: Links
AdaptiveNav | split - 0 KB + 3.1 KB | Inline links on desktop, a hamburger drawer or bottom bar
  on a phone. | try: mode auto, align end, size md; sticky showLabels disabled | note: CSS
  decides it at every width. The links are real anchors in both layouts.
AdaptiveFilters | split - 0 KB + 3.4 KB | A filter sidebar on desktop, a drawer with an Apply
  button on a phone. | note: CSS moves the panel. JavaScript only defers applying until you
  press Apply. | Live, or on Apply: Applies; CSS and JavaScript: Switch
AdaptiveToolbar | client - 3.2 KB | Every tool on desktop, the rest behind an overflow menu on a
  phone. | try: mode auto, overflow auto, size md; wrap showLabels disabled | note: CSS decides
  how many tools fit. The order never changes.
AdaptiveDatePicker | client - 7.8 KB | A popover calendar on desktop, a drawer calendar on a
  phone. | October 2026 calendar, weeks start on Sunday | Month names from Intl: Locale;
  Gregorian or Hijri: Calendar
AdaptiveTabs | split - 0 KB + 1.9 KB | All tabs on desktop, a scrollable strip on a phone.
  | try: mode auto, activation automatic, size md; scrollable keepMounted disabled | note: CSS
  decides it at every width. Every panel is server rendered and kept mounted.
AdaptiveTable | split - 0 KB + 2.2 KB | A table on desktop, stacked cards on a phone. One DOM,
  container queries. | try: mode auto, pageSize 25, size md; sortable stickyFirstColumn
  disabled | note: A container query decides it, so the rows are never written out twice.
AdaptivePagination | server - 0 KB | Numbered pages on desktop, previous and next on a phone.
  Real links either way. | "‹ Prev    2 of 9    Next ›" | note: CSS decides it at every width.
  Every page stays a real href.
AdaptiveActions | split - 0 KB + 1.4 KB | Inline buttons on desktop, a sticky bottom bar on a
  phone. | try: mode auto, align end, size md; sticky safeArea disabled | note: CSS decides it
  at every width. The bar is padded for the safe area.
```

**Build this.** Not in the first release: no connector exists (`src/connectors` holds a
README; `src/shared/adaptive/create-adaptive.tsx` exists). `status: 'later'`. STATUS also
records Omar's verdict on the drawn cards ("so bad"): they need a visual pass before they are
built. The REFERENCE group shows Components only (choice 11).

### 16. Theme builder: `/en/theme-builder` (later)

```
hd: "/en/docs/theme-builder" | [34]"Theme builder" | [16]"Set the knobs and the six tones, watch a
  real screen update, and copy the mode block. Contrast is checked as you go."
Section: What it does  [16]"A mode is one CSS block. The builder is a form for that block, and it
  prints the result ready to paste."
Section: The builder  [16]"Controls on the left, a live screen on the right."
  builder 944x511:
    controls 340: "Mode base" Segmented Light|Dark | "Radius" "0.5rem" track | "Density" "1.00"
      track | "Ring width" "2px" track | "Line width" "1px" track | "Motion" Switch | "List
      rows" NumberField − 7 + | "Tones" tone:primary neutral success warning danger info
    preview 602: [16]"Invoices" Button "Save" | Card: Badge "Paid" Badge "Pending" Input
      "Client name" Button "Cancel" | CodeBlock "Live output" Copy:
      [data-theme="brand"] {
        color-scheme: dark;
        --tc-radius: 0.5rem;
        --tc-density: 1;
        --tc-ring-width: 2px;
        --tc-line-width: 1px;
        --tc-list-rows: 7;
        --tc-primary-solid: var(--color-violet-600);
      }
Section: The controls
  table Control | Kind | Range
    Radius | slider | 0 to 1.5rem, or pill
    Density | slider | 0.85 to 1.15
    Motion | switch | on, off
    List rows | number | 3 to 15
    Each tone | color, from the palette | any palette shade; the builder picks the matching
      foreground and text shades
    Mode base | segmented | light or dark, which sets the three surfaces
    Ring width | slider | 1 to 4px
    Line width | slider | 1 to 2px
Section: The preview  [16]"The components screen from the home page, re-rendered on every change.
  It has a table, badges, a form, a dialog and a toast."
Section: The contrast readout  [16]"Contrast is checked in the browser as you work: every text on
  its surface, every tone text on its tint, and the border on all three surfaces."
  callout i:warning-circle "3 pairs fail. --tc-primary-on-soft on --tc-primary-soft measures
  3.9:1; the minimum is 4.5:1. Try violet-300 for the text shade."
Section: The output
  code: [data-theme="brand"] {
          color-scheme: dark;
          --tc-page: var(--color-neutral-950);
          --tc-surface: var(--color-neutral-900);
          --tc-surface-raised: var(--color-neutral-800);
          --tc-body: var(--color-neutral-50);
          --tc-muted: var(--color-neutral-400);
          --tc-line: var(--color-neutral-800);
          --tc-line-strong: var(--color-neutral-400);
          --tc-primary-mix: 24%;
          --tc-primary-solid: var(--color-emerald-500);
          --tc-primary-on-solid: var(--color-neutral-950);
          --tc-primary-on-soft: var(--color-emerald-300);
          --tc-radius: 0.375rem;
          --tc-density: 0.95;
        }
Section: Not yet available
  callout i:info "This page describes the builder as designed. It follows the v0.1 release."
next: "Colors"
```

**Build this.** Not in the first release (PLAN 15.3 and 22 put it after v0.1; the page itself
says "It follows the v0.1 release"). `status: 'later'`. When built, its route is
`/en/theme-builder` (PLAN), its contrast readout reuses `scripts/lib/contrast-checks.ts` in
the browser, and its samples say blue.

### 17. Changelog: `/en/changelog`

```
hd: "/en/docs/changelog" | [34]"Changelog" | [16]"Every release, with what changed in it. Nothing
  has been released yet."
Section: Current state
  callout i:info "TopClass UI is in early access. The design system exists in Figma, and no
  package is on npm yet. The first release will be v0.1."
Section: How an entry is written  [16]"Every change comes with a short note. At release time
  those notes are collected, the version is bumped and this page is written from them."
  code: ---
        "topclassui": minor
        ---

        Add `DialogBody` as the scroll container. `DialogTitle` and `DialogFooter`
        now stay fixed while the body scrolls, per the scroll policy.
Section: Breaking changes  [16]"A breaking change means a major version bump, marked in the entry
  with migration steps. Before 1.0 a minor release may contain one."
  code: ## 0.4.0

        ### Breaking

        - `Card` is now `CardRoot`. Find and replace; nothing else changed.
          Every part family now has a `<Name>Root`, so a server file
          can import the flat name.
Section: Version policy  [16]"TopClass UI follows semantic versioning. One package, one version
  number. A peer dependency range only widens in a minor release, never narrows."
Section: The first entries  [16]"An example of what the top of this page will look like once
  there is a release."
  code: ## 0.1.0 - the first release

        46 components and 3 connectors.
        Next.js App Router first. Tailwind CSS v4.
        English and Arabic. Light, dark and ocean.

        - Registry CLI: `npx topclassui add <slug>`
        - Package: `topclassui/<slug>` subpath exports
        - Visual matrix: 3 modes x 2 directions x 2 widths
next: "Home"
```

**Build this.** In the first release, because 0.1.0 is a release worth a page. The route is
`/en/changelog` (PLAN), not Figma's `/en/docs/changelog`. The body is the package's
`CHANGELOG.md` (the release plan's Changesets output), rendered as MDX at build time, with
"Version policy" and "Breaking changes" from the drawing as two short sections. The drawn
"Current state" callout and the sample entries are not built: the real 0.1.0 entry replaces
them. In Arabic, the headings are translated and the entries stay English, marked
`lang="en"`, unless Omar wants them translated. Next: Home is wrong; the registry decides.

### 18. Blog: `/en/blog` (later)

```
hd: "/en/blog" | [34]"Blog" | [16]"Notes on how TopClass UI is built: the measurements, the
  mistakes and the decisions behind them. No posts yet."
Section: What this is for
  [16]"The blog is where the reasoning behind a decision gets room: the failed attempts, the
  numbers, and what you can take back to your own system."
  [16]"A post is written when there is something worth sharing, not on a schedule."
  callout i:info "No posts yet. The first ones are drafted and will be published with v0.1."
Section: Planned first posts
  cards: "The dark tint that was not there" "Every dark soft tint measured 1.01 to 1.03 against
    its surface, so it was invisible. How the values were re-derived, and why two tones had no
    passing shade." | "What 0 KB actually means" "A server component adds no JavaScript only
    under React Server Components. What that claim means, and the test that keeps it true."
    | "16 icons that flip" "Why an arrow must flip in a right-to-left layout and a clock must
    not, and why a hand-written list beat a naming pattern."
  "Working titles. Each one is a measurement or a mistake from building the library."
Section: Follow along  [16]"An RSS feed will be available at the address below once the first
  post is up. Releases are also announced in the changelog."
  code: https://topclassui.com/en/blog/feed.xml
next: "Changelog"
```

**Build this.** Not in the first release: no post exists, and an empty blog is a page with
nothing to index. `status: 'later'`. When the first post is written, the route is
`/en/blog/<slug>` with an RSS feed at `/en/blog/feed.xml`, and the three planned titles are
the first drafts.

### 19. Demo preview: the documentation page

**Build this.** Not built as a page. STATUS already removed it from the sidebar, and the
route it documents (S9) is for tests, `noindex`. Its sentences are useful as a short
section on the Accessibility or Server first page once `test:visual` exists.

### 20. Not found

**Build this.** Two files, neither drawn.

- `app/(site)/[locale]/not-found.tsx`, in both locales, inside the shell: "This page does not
  exist", a link to Home, a link to the components, and the search button. `noindex`. It
  answers a `notFound()` inside a locale, such as `/en/docs/components/nope`.
- `app/global-not-found.tsx`, for a URL no root layout matches (`/fr/x`, `/random`): there is
  no `app/layout.tsx` (PLAN 15.3), so the locale one cannot render. Its own
  `<html lang="en" dir="ltr">`, the same CSS, `noindex`, one line and a link to `/en`. Check
  against the installed Next types whether `experimental.globalNotFound` is still needed in
  `next.config.ts`, and record the answer in DECISIONS.

## Build order

0. **Gates.** The release is done: 0.1.0 on npm (or at least the package's `exports` map,
   `dist` build and import shape merged on `main`), and the blue theme merged. `pnpm check`
   green on `main`. Omar's answers to choices 3, 4, 10, 11 and 12 are asked before step 1,
   not during it; without them the step builds the defaults and says so in its first line.
1. **The shell and Home**, two pull requests.
   1. `apps/docs` scaffold (S1), the shell (S2), the content blocks (S3), the mode and
      language switches (S4), the SEO kit (S6) without Open Graph images, the site's labels,
      both not-found pages (page 20), the redirects, `postcss.config.mjs`, the site's
      `eslint.config.ts` (rule 2), `docs:check` (S13). One placeholder guide page proves the shell.
   2. Home (page 1), its Open Graph image, `sitemap.ts`, `robots.ts`, `manifest.ts`.
2. **The getting-started pages**, one pull request: Install the package, CSS entry, Provider,
   Your first component (pages 2, 4, 5, 6), in both locales, with the compile test of their
   samples.
3. **The demos the cards need**, in the library, seven pull requests, one per catalog
   section: a `dummy/playground.tsx` (default export taking the schema's props) and a
   `dummy/states.tsx` where missing, for each component of the section; the Forms pull request
   also adds `form/dummy/rtl.tsx`, the one page component without an `rtl` demo (page 14).
   Each passes the library's `pnpm check` (the harness renders and axe-checks the new demos in
   3 modes and 2 directions). Can run beside step 2: no shared file.
4. **The component page template**, generated for all 46, in three pull requests:
   1. The pipeline (S7): `apps/docs/scripts/docs-data.ts`, `content/sections.ts`, the import rewrite,
      the props rows, the playground controls, the generated demo map, the heading slugs and
      the dates, with their tests.
   2. The Previewer (S8), the component page (page 14) and the `/preview` route (S9), with
      the content files of one section (Actions, four components) to prove them.
   3. The other 42 content files and Field, Form and Meter, in both locales; the catalog (page
      13); the search (S5); the Open Graph images of every page; `llms.txt`.
5. **The rest**, one pull request each: Colors (7), Icons (8), Theming (9), Right to left (10),
   Server first (11), Accessibility (12), Changelog (17).
6. **Launch.** Lighthouse by hand on every page type, both locales; the domain on Vercel;
   Search Console and Bing; one Arabic Open Graph image checked by eye.

Later, outside this plan: Add with the CLI (3), Connectors (15), Theme builder (16), Blog
(18), and the four `TODO(tc)` components in the library.

## Choices for Omar

Every row has a default that is built, so nothing blocks the build. Rows 3, 4, 10, 11 and 12
decide the scope and are asked before step 1.

| # | Choice | Built as | The other option |
|---|---|---|---|
| 1 | Next.js version | `next` 16.3.8, pinned exactly, recorded in DECISIONS: the newest release over two weeks old today | the current 16.4.x |
| 2 | Where the playground and the states come from | new `dummy/playground.tsx` and `dummy/states.tsx` in each component, in the library: one source for the site, the harness and later `test:visual` (PLAN 8.1) | site-owned files per component in `apps/docs`, which the library's tests never see |
| 3 | Routes | Figma's flat guide routes (`/en/docs/installation`, `/en/docs/colors`, ...), components at `/en/docs/components/<slug>`, changelog at `/en/changelog` | PLAN 16's nested `/docs/getting-started/*` and `/docs/foundations/*` |
| 4 | The navbar's LTR/RTL switch | a language switch: links to the same page in English and Arabic | a direction toggle on the English page (PLAN has none, and it breaks the static `dir` of R-13-1) |
| 5 | Field, Form and Meter | their own component pages, listed under Forms and Feedback in the sidebar, not as catalog cards (the catalog stays the drawn 46) | no pages: they are mentioned on Your first component and in the Field-using demos |
| 6 | Search | a build-time JSON index in the library's `Command`, no dependency | `pagefind` 1.5.2 (dev only, a 58 MB binary on disk) for full-text search; or a hosted service |
| 7 | How the site reaches the demos | a generated map of explicit static imports (`.generated/demos.ts`, written by `docs:data`) into the workspace's `dist/components/*/dummy`, type-checked, no resolve alias; `dummy/` left out of the npm package | publish `./dummy/*` as PLAN 4's exports say, which puts demo classes into every user's Tailwind scan; or a two-wildcard resolve alias with a dynamic `import()`, untested under Turbopack |
| 8 | Arabic type | Noto Sans Arabic, three weights, the type scale's line-heights | a taller Arabic line-height, decided by looking at `/ar` pages (STATUS: "a design call") |
| 9 | The default mode | the system's mode, light when the system does not say dark (so Lighthouse and crawlers see light); no library change | dark for every first visit: a `fallback` option on `ThemeScript`, a library change with its own hash |
| 10 | Arabic pages | every live page in Arabic from the first release; the planner drafts, Omar corrects | Arabic for the component pages only at first, the guide pages one by one (hreflang then pairs only those) |
| 11 | What the first release leaves out | the CLI page and every "Copy the source" half, the Connectors page and Home's AdaptiveMenu panel, the Theme builder, the Blog | ship them marked "coming", which search engines index as thin pages |
| 12 | Links to things that may not exist | shown only when they exist: GitHub (public repository), YouTube, X, the Figma library, the registry | drawn as in Figma |
| 13 | ThemeSwitcher, LanguageSwitcher, SkipLink, TableOfContents | site-owned with `TODO(tc)` markers; the site launches with the list printed | build the first three in the library before the site (a small unit), so the list is empty at launch |
| 14 | Shiki themes | the pair that passes 4.5:1 on CodeBlock's surface in every mode, picked by the test | a fixed dark code surface for the whole site (unit-5 choice 13's other option, a library change) |
| 15 | The size on the chip | the kind, and "size not measured yet" for client and split, until `pnpm size` exists | Figma's budgets labelled "budget" |
| 16 | Lighthouse | `@lhci/cli` by hand, never in `docs:check` | in `docs:check` (minutes per run, heavy on 15 GB) |
| 17 | The hero line | Figma's "Top-class UI. Built for Next.js." | DECISIONS' "The React UI kit that reads both ways" |
| 18 | The catalog's weight | one page of 46 cards, client parts mounted near the viewport | seven section pages if the lab budgets fail |
| 19 | Analytics | none in the first release; Search Console and Bing only | Vercel Web Analytics (`@vercel/analytics` 2.0.1, 497 KB on disk; its page script measured against TBT), cookie-free as PLAN asks |
| 20 | The site's focus ring, hover and target size | imported from `topclassui/classes` (release plan C18) | if C18 stays private: the site copies the strings into `apps/docs/components/classes.ts`, two copies to keep in step |

## Where this file departs from docs/PLAN.md

The lead records these as one `docs/DECISIONS.md` entry in a docs branch, with what the
builders report.

- **Routes** (PLAN 16): flat guide routes; the changelog at `/[locale]/changelog` in v0.1
  (PLAN puts it after v0.1); Accessibility is a page PLAN 16 does not list.
- **Pages left out of v0.1** that Figma draws: Add with the CLI, Connectors and every
  connector page, Theme builder, Blog, Demo preview.
- **The props table** reads `types.ts` and `schema.ts` through the README generator, not the
  emitted `.d.ts` (R-8.3-3).
- **The catalog's seven sections** come from a site file, not from `meta.ts`'s category.
- **The demos reach the site** through a generated map of static imports into the
  workspace's `dist`, not through `./demos/*` exports (PLAN 4), and the folder is `dummy/`,
  not `demos/`, with no generated `index.ts` in the library (the map lives in the site's
  `.generated/`).
- **Two new demo files per component** (`playground.tsx`, `states.tsx`) in the library.
- **The page controls** of PLAN 16 have no direction control on an English page; direction
  follows the locale.
- **No scroll-spy** in On this page; ThemeSwitcher, LanguageSwitcher, SkipLink and
  TableOfContents are site-owned with `TODO(tc)` markers at launch, so Phase 7's "empty list"
  is not met by the first site release unless choice 13 goes the other way.
- **The Icons page** is a static grid with a client filter, not a collection with a Server
  Action `loadMore` (PLAN 7.4).
- **The chips** print "size not measured yet" until `pnpm size` exists; PLAN 16 asks for a
  measured number.
- **`JsonLd` and `createMetadata`** live in `apps/docs/lib` first, not in the SEO kit
  package (PLAN 15.2).
- **`docs:check`** is a separate command, not part of `pnpm check` (PLAN 17).

Outside the site, noticed while reading: `meta.ts` names `Dropdown`, `Command` and `OtpField`
where the export is `OTPField`; `docs/RULES.md` R-10.5-3 still says no sticky bar exists,
though Navbar publishes `--tc-sticky-top`; R-8.3-3 and PLAN 4 still say `demos/`; DECISIONS
2026-09-25 says the docs default to dark while the built `THEME_SCRIPT` falls back to light;
every generated README prints `import { X } from 'topclassui'`, a root import PLAN 4 forbids.
