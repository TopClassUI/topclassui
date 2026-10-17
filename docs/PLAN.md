# TopClass UI - Master Build Plan

A design system for Next.js App Router and Tailwind CSS v4. Written to be executed with Claude Code.

Omar Abed - 21 September 2026 - plan v1.1

## What changed in v1.1

v1.0 was checked line by line against the current documentation of every library it uses. The full review, with evidence and exact edits, is in `docs/reviews/2026-09-21-plan-v1.0-review.md`. v1.1 applies all of it and adds the decisions Omar took during that review.

Corrections:

- The package could not be installed or used as written: the `exports` map reached nothing in `shared/`, `dist/styles.css` was never built, and `zod`, `@topclassui/icons`, `clsx`, `tailwind-merge` and `cva` were undeclared. Fixed in section 4.
- `cn()` cannot resolve the knob utilities without configuration; `shared/cn.ts` now uses `extendTailwindMerge` (5.2).
- Thirteen of twenty-eight default token pairs failed the contrast rule this plan sets for itself. Tone shades, `-text` tokens and the border rule are corrected in 6.2.
- The Arabic font never applied: `--tc-font-sans` and `--tc-font-arabic` referenced each other, which is a custom-property cycle. Fixed in 6.2.
- `createAdaptive` did not catch prop drift; the contract type is now explicit (11.3).
- `--tc-motion` multiplied nothing; it now drives every transition duration (5.8, 6.2).
- Base UI has no `placement` prop: placement is `side` + `align` (10.1).
- Tailwind deprecated `start-*` and `end-*` in 4.2 in favour of `inset-s-*` and `inset-e-*` (5.3), and added four hues (Appendix C).
- Versions: Next.js 16.3, React 19.3, Base UI 1.8, Tailwind 4.3, Zod 4.6, tailwind-merge 3.7.
- Acceptance criteria that could not be met as ordered (docs pages, the colours page, RTL in forms, `pnpm check`) are reordered in section 19.
- Forms: Base UI Field parts are client components and `useActionState` is a hook, so Field and Form are split into server and client halves (section 12).

Decisions Omar took, now part of the plan:

- Everything is designed in Figma before any component code, and what is in Figma is what gets built (6.6, Phase 0.5).
- `<Icon name>` stays; it renders inline SVG from one generated module per icon instead of a sprite (section 7).
- One size scale on every component: `xs | sm | md | lg | xl | custom` (5.7).
- Docs demos are a two-column grid with a States block that shows every state at once (section 16).
- Data constants and class constants are separate files (5.12, 8.1).
- Logic is separated from markup, files stay small, comments are one line (5.12).
- Lists never render ten thousand rows: one contract with a visible-rows knob, windowing and page-by-page loading (8.5).
- One scroll policy for every component (10.5).
- All foundations are complete before the first component; then one component is finished to the last line; then components are quantity (section 19).
- The rules live in `docs/RULES.md` and are generated into `CLAUDE.md`, `AGENTS.md` and `.cursor/rules` so every tool reads the same list (section 23).

Every decision is recorded with its date in `docs/DECISIONS.md`.

# 0. How to read and execute this plan

**Who this is for.** Claude Code, working with Omar Abed inside the TopClass UI repository. Omar reads it too, so it is written in plain language. It is the complete specification: goals, rules, architecture, examples, the component catalog, the roadmap and the acceptance criteria.

**What TopClass UI is.** A React design system for Next.js App Router and Tailwind CSS v4. Omar will use it in every project he builds (his portfolio, a visual 3D scroll-animation editor, client work) and publish it as open source at topclassui.com. Because it is meant to last for years, correctness, consistency and maintainability matter more than speed of delivery.

**How to work.**

1. Work one phase at a time (section 19). Start each phase in plan mode, write a short plan for that phase only, get Omar's OK, then implement.
2. One catalog row (section 18) per branch and per pull request: a row like `Field, Label` or `Dialog, AlertDialog` is one pull request because its parts are designed and reviewed together; never two rows in one. Infrastructure and docs-only changes are their own pull requests. Conventional commits (`feat(button): ...`).
3. Before saying a task is done, run `pnpm check` (lint, typecheck, unit tests, `check:structure`, `check:boundaries`, `check:contrast`, `rules:sync`) and report the real output. If something fails and cannot be fixed, say so plainly.
4. Do not add scope. No component outside the current phase, and no new dependency without naming it, its purpose and its size in the pull request description.
5. When a rule in this plan conflicts with reality (a library changed, a rule is impossible), stop, explain the conflict to Omar, and record the outcome in `docs/DECISIONS.md`. Do not silently deviate.

**Library versions this plan was written against** (checked 21 September 2026): Next.js 16.3.5, React 19.3.0, `@base-ui/react` 1.8.0, Tailwind CSS 4.3.3, Zod 4.6.5, tailwind-merge 3.7.0, class-variance-authority 0.7.1, Playwright 1.63.0, Node 22.14 (floor), pnpm 10.28.2. Phase 0 pins the exact versions installed and records them in `docs/DECISIONS.md`. Before using an API, check the installed package's types; the installed version is the authority.

**First actions in a fresh repo.**

1. Commit `.gitattributes` (`* text=auto eol=lf`) before any source file, then run `git add --renormalize .` once. Omar's Git has `core.autocrlf=true` in the system config, and the attributes file is what makes his checkout and Linux CI identical.
2. Save this document as `docs/PLAN.md`.
3. Create `docs/RULES.md` (section 23) and generate `CLAUDE.md`, `AGENTS.md` and `.cursor/rules/topclassui.mdc` from it, so every session in every tool loads the same rules.
4. Create `docs/DECISIONS.md` and record the pinned versions chosen in Phase 0 and the decisions listed at the top of this document.

# 1. Vision, goals and non-goals

## Why this library should exist

These seven points are the reasons to build TopClass UI instead of using shadcn/ui. When two options compete, choose the one that protects these.

1. **RTL-first, enforced.** Logical-property-only lint, `--tc-dir` for gestures and transforms, an Arabic type stack with plural rules, and every demo tested in the {ltr, rtl} matrix - not an RTL note per component.
2. **Server-first.** Each component is split into `index.tsx` (server) and `client.tsx` (only the interactive part), so pages ship the least JavaScript possible.
3. **Adaptive connectors.** One component that is a dropdown on desktop and a bottom drawer on mobile, automatically, with both sides checked against one contract type. No more `if (isMobile)` in app code.
4. **One-file theming with global knobs.** Light, dark and any custom mode, plus global settings such as corner radius (square to pill), density, motion and list length, all controlled from one CSS file.
5. **A state contract.** Loading, error and empty states are part of every data component, not an afterthought. Lists never render more rows than they show (section 8.5).
6. **Schema-described props.** Each component's design props are described by a Zod schema. That one schema feeds the docs props table, the playground controls, the future editor's inspector panel and AI tool definitions.
7. **SEO-aware.** Components render semantic, crawlable HTML, and the library ships an SEO kit (structured data, metadata helpers).

shadcn/ui now offers a Base UI-backed set with RTL notes on each component page. TopClass UI differs in being server-first, adaptive by connector, schema-described and tested in the full mode x direction x device matrix - not in the primitive it uses.

## Goals

- One design system used by all of Omar's projects, published as `@topclassui/*` on npm, source at github.com/TopClassUI, docs at topclassui.com.
- Strict TypeScript, fully tested, accessible (WCAG 2.2 AA), fast, consistent across browsers.
- A docs site that ranks well on Google in English and Arabic.

## Non-goals for v1

React Native, Vue or other frameworks; styling systems other than Tailwind; CSS-in-JS; legacy browsers; an animation library (may come later, the design leaves room for it); charts; a rich text editor.

## Success criteria (measurable)

- Docs pages score 100 in Lighthouse Accessibility, Best Practices and SEO on every run, and meet the section 14 lab budgets (median of five mobile runs of Lighthouse CI against a local production build).
- Zero axe violations across all demos.
- `Button` adds 0 KB of client JavaScript when used from a Server Component, measured in the browser against a blank preview page (section 14).
- Every demo passes the visual matrix: {light, dark, custom} x {ltr, rtl} x {mobile, desktop}.
- Within 90 days of publishing 0.1.0, Google Search Console shows every `en` and `ar` component page indexed, zero hreflang errors and zero Core Web Vitals URLs rated poor on mobile.
- The portfolio and the editor run on it in production.

# 2. Technology stack

| Layer | Choice | Why |
|------------|----------------------|------------------------------------------|
| Language | TypeScript, strict | Lifetime maintainability; props are the public API |
| Target framework | Next.js 16 App Router (16.3.5), React 19.3, Node 20.9+ | Omar's stack; Server Components are the performance lever. The App Router runs on the React canary bundled inside Next, so install `react@latest` alongside `next@latest` |
| Styling | Tailwind CSS v4 (CSS-first config), 4.2 or newer | Theme variables become utilities automatically; oklch palette; logical inset utilities (`inset-s-*`) need 4.2 |
| Behaviour primitives | Base UI (`@base-ui/react`, 1.8.0) | Accessible unstyled parts, collision-aware positioning, Drawer, Toast. Stable since 1.0.0 on 11 December 2025. Never install the deprecated `@base-ui-components/react` |
| Variants | `class-variance-authority` 0.7.1, `clsx`, `tailwind-merge` 3.7 configured with `extendTailwindMerge` | Typed variants and safe class merging. Custom spacing and radius keys are unknown to tailwind-merge without configuration (5.2) |
| Schemas | Zod 4.6 | `z.toJSONSchema(schema, { io: 'input' })` for docs and AI tools. A required peer dependency: the published types reference it |
| Icons | Phosphor (default), inline SVG from one generated module per icon | Zero client JavaScript, no requests, any set size (section 7) |
| Monorepo | pnpm workspaces + Turborepo | Cached tasks, clear package boundaries |
| Package build | `tsc` plus a CSS copy step, ESM only, one output file per source file | Keeps the `'use client'` directive intact; `tsc` emits no CSS |
| Unit tests | Vitest, Testing Library, user-event, `axe-core` | Fast, standard. `vitest-axe` is a stale fork; call axe-core directly through a small matcher (17.1) |
| Browser tests | Playwright 1.63 + `@axe-core/playwright` | Chromium, Firefox, WebKit; visual regression with Linux-only baselines (17.3) |
| Lint / format | ESLint 9 flat config, typescript-eslint strict, Prettier + `prettier-plugin-tailwindcss`, custom rules | The strict rules are enforced by tools, not memory. There is no `next lint` in Next 16; run `eslint .` |
| Release | Changesets, publint, `@arethetypeswrong/cli`, size-limit | Safe publishing and bundle budgets, npm trusted publishing (17.4) |
| Docs | Next.js 16 app, MDX, Shiki at build time | The docs site must be built with TopClass UI itself |

**Optional dependencies, loaded only by the component that needs them:** TanStack Table (DataTable), TanStack Virtual (any collection above the windowing threshold, section 8.5), react-day-picker (Calendar, DatePicker), Embla (Carousel), react-resizable-panels (Resizable), dnd-kit (sortable), react-hook-form (Form adapter). They are declared as optional peer dependencies so installing the library for a Button never pulls them in.

**Version policy.** In Phase 0 install the latest stable version of each tool, pin exact versions, and record them in `docs/DECISIONS.md`. Enable Renovate or Dependabot with a weekly schedule.

**Toolchain on Windows.** Omar develops on Windows 11 and CI runs Linux. The scripts in `scripts/` are TypeScript run with `tsx` (a root devDependency), which needs no Node flags and works on the installed Node 22.14; moving to Node's own type stripping (Node 22.18 or newer) is a later decision. The root `package.json` pins `"packageManager": "pnpm@10.28.2"` and `"engines": { "node": ">=22.14" }`, with `.node-version` alongside. `.npmrc` sets `engine-strict=true`, `shell-emulator=true` (so package scripts behave the same in PowerShell and bash) and `save-exact=true`. Scripts never call `rm`, `cp` or `mkdir -p`; they use `rimraf`, `copyfiles` or Node. They normalise paths with `path.posix`, split lines with `/\r?\n/` and write `\n`. `.gitattributes` and `.editorconfig` keep every checkout LF. Before the first install, move the checkout to a short path, enable Windows long paths and exclude the repo and the pnpm store from Defender; record it in `docs/DECISIONS.md`.

# 3. Decisions

## Decisions already made

| # | Decision | Reason |
|----|--------------------------|----------------------------------------------|
| D1 | Build behaviour on Base UI | Focus traps, collision handling, scroll lock and ARIA patterns are years of work; TopClass UI's value is elsewhere |
| D2 | Ship as a versioned npm package | One upgrade path for all of Omar's projects. A copy-paste registry can be added later |
| D3 | `schema.ts` is imported as a type only by components | Zod never reaches the browser bundle. It stays a type-level peer dependency: the emitted `.d.ts` chain references it (8.3) |
| D4 | `<Icon name>` renders inline SVG from one generated module per icon | Only the icons that are used are loaded on the server or shipped to the client; no requests, no files to serve, works in Open Graph images, and the set can be any size (section 7) |
| D5 | Modes use a `data-theme` attribute | Supports unlimited custom modes and nested themed sections |
| D6 | Server Components never rely on React context | Context does not exist in the Server Component render; it works only inside client trees, including when those trees are server-side rendered. Direction and theme come from HTML attributes and CSS; text labels come from props |
| D7 | A file exists only if the component needs it | No empty `client.tsx` or `states.tsx`; a script validates the folder contract |
| D8 | Flat named exports (`DialogRoot`, `DialogTrigger`) | React's client-module proxy allows one level of property access from a server file: `mod.Dialog` is a client reference, `Dialog.Root` throws `Cannot access Dialog.Root on the server. You cannot dot into a client module from a server component. You can only pass the imported name through.` A namespace re-export would work, but flat names keep tree-shaking, `check-boundaries` and the docs simpler |
| D9 | Components use semantic tokens only | This is what makes custom modes free |
| D10 | Core stays framework-agnostic React; Next.js-specific pieces live in `@topclassui/next` | Usable outside Next.js, no cost to the Next.js experience. Theming uses no Next.js API, so it lives in `@topclassui/react/theme` |

## Open decisions (defaults apply until Omar changes them)

| # | Question | Default |
|----|-------------------------------|------------------------------------------|
| O1 | Icon library | Phosphor: the regular weight, plus the three solid variants named in docs/icons.md |
| O2 | Brand colour | Tailwind `blue`, chosen on 17 October 2026 (`violet` until then) |
| O3 | Fonts (docs site only; the library ships none) | Inter + Noto Sans Arabic via `next/font`; the docs set `--tc-font-latin` and `--tc-font-arabic` from those variables |
| O4 | Licence | MIT |
| O5 | Docs hosting | Vercel |
| O6 | Default radius | `0.5rem` |
| O7 | Adaptive breakpoint | `(width < 48rem)` is mobile |
| O8 | Locales | `en` and `ar` |
| O9 | Figma | Everything is designed before it is built, with 1:1 parity (6.6) |

# 4. Repository architecture

```text
topclassui/
  CLAUDE.md  AGENTS.md            generated from docs/RULES.md (section 23)
  .cursor/rules/topclassui.mdc    generated from docs/RULES.md
  .gitattributes  .editorconfig  .npmrc  .node-version  turbo.json
  docs/
    PLAN.md  RULES.md  DECISIONS.md  reviews/
  apps/
    docs/                     Next.js App Router: docs, colors, icons, preview
  packages/
    tokens/                   CSS only: semantic tokens, modes, global knobs
    icons/
      raw/                    source SVGs (the allow-list)
      src/icons/<name>.ts     one generated module per icon
      src/*.generated.ts      names, directional, loaders, version
      src/cli.ts              sync and add-set
    react/
      src/
        shared/
          cn.ts  classes.ts  clamp.ts  render.ts  floating.ts  meta.ts
          contracts/          size, state, collection, menu and the other connector contracts
          collection/         useCollection: windowing, paging, keyboard
          adaptive/           useAdaptiveMode, createAdaptive
          labels/             en.ts, ar.ts, types.ts, getLabels
          theme/              ThemeScript, useTheme
          provider/           TopClassProvider
        components/<name>/    the folder contract (section 8)
        components/icon/      <Icon name>, server only
        components/svg/       <Svg icon>, shared
        connectors/<name>/    adaptive components (section 11)
    next/                     Link/Image adapters, metadata + JSON-LD helpers (tier 2)
    eslint-config/            shared ESLint config and the custom rules
    tsconfig/                 library.json and nextjs.json
  scripts/
    new-component.ts          scaffolds a component folder
    check-structure.ts        validates the folder contract and the structure rules (5.12)
    check-boundaries.ts       validates server/client rules
    check-contrast.ts         WCAG contrast of every token pair in every mode
    list-entrypoints.ts       generates the entrypoint list for attw
    rules-sync.ts             generates CLAUDE.md, AGENTS.md and .cursor/rules from docs/RULES.md
```

## Package exports

Consumers import by subpath so bundlers only ever see the components they use. There is no root barrel file.

```json
{
  "name": "@topclassui/react",
  "type": "module",
  "sideEffects": ["**/*.css"],
  "exports": {
    "./package.json": "./package.json",
    "./styles.css": "./dist/styles.css",
    "./provider": { "types": "./dist/shared/provider/index.d.ts", "default": "./dist/shared/provider/index.js" },
    "./theme":    { "types": "./dist/shared/theme/index.d.ts",    "default": "./dist/shared/theme/index.js" },
    "./utils":    { "types": "./dist/shared/utils.d.ts",          "default": "./dist/shared/utils.js" },
    "./adaptive": { "types": "./dist/shared/adaptive/index.d.ts", "default": "./dist/shared/adaptive/index.js" },
    "./labels/*": { "types": "./dist/shared/labels/*.d.ts",       "default": "./dist/shared/labels/*.js" },
    "./icon":     { "types": "./dist/components/icon/index.d.ts", "default": "./dist/components/icon/index.js" },
    "./svg":      { "types": "./dist/components/svg/index.d.ts",  "default": "./dist/components/svg/index.js" },
    "./connectors/*": { "types": "./dist/connectors/*/index.d.ts", "default": "./dist/connectors/*/index.js" },
    "./schemas/*":    { "types": "./dist/components/*/schema.d.ts", "default": "./dist/components/*/schema.js" },
    "./demos/*":      { "types": "./dist/components/*/demos/index.d.ts", "default": "./dist/components/*/demos/index.js" },
    "./meta/*":       { "types": "./dist/components/*/meta.d.ts",   "default": "./dist/components/*/meta.js" },
    "./*":            { "types": "./dist/components/*/index.d.ts",  "default": "./dist/components/*/index.js" }
  },
  "files": ["dist", "src"],
  "dependencies": {
    "@topclassui/icons": "workspace:*",
    "@base-ui/react": "<pinned>",
    "class-variance-authority": "<pinned>",
    "clsx": "<pinned>",
    "tailwind-merge": "<pinned>"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^4.2.0",
    "zod": "^4.0.0",
    "@topclassui/tokens": "workspace:^"
  }
}
```

Usage: `import { Button } from '@topclassui/react/button'`.

`zod` is a required peer, not an optional one: `index.d.ts` imports from `schema.d.ts`, which imports Zod types. Without it installed, `skipLibCheck` turns the unresolved import into `any` and every design prop disappears from `ButtonProps` with no error. `@topclassui/tokens` is a peer because the utility names the components are written against come from its variables; both packages are in one Changesets `fixed` group so their majors always match.

`packages/tokens` is CSS only and needs no build, but Tailwind resolves a bare `@import` with its own resolver, which looks for a `style` field or `style` export condition and a `.css` extension - never `main`:

```json
{
  "name": "@topclassui/tokens",
  "type": "module",
  "sideEffects": true,
  "style": "./src/index.css",
  "exports": {
    ".": { "style": "./src/index.css", "default": "./src/index.css" },
    "./package.json": "./package.json"
  },
  "files": ["src"],
  "peerDependencies": { "tailwindcss": "^4.2.0" }
}
```

`packages/icons` ships data only, one module per icon, and the CLI:

```json
{
  "name": "@topclassui/icons",
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
    "./*": { "types": "./dist/icons/*.d.ts", "default": "./dist/icons/*.js" },
    "./package.json": "./package.json"
  },
  "bin": { "topclassui-icons": "./dist/cli.js" },
  "files": ["dist"]
}
```

It has no React dependency: the components that render icons live in `@topclassui/react` (section 7).

## TypeScript configs

`packages/tsconfig` ships two bases, because one cannot serve both the library and a Next.js app. `library.json` is used by every `packages/*` (all have `"type": "module"`):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true
  }
}
```

`nextjs.json` is used by `apps/docs`: the same strictness, but `"module": "esnext"`, `"moduleResolution": "bundler"`, `"noEmit": true`, `"allowJs": true`, `"incremental": true`, `"esModuleInterop": true`, `"resolveJsonModule": true`, `"exactOptionalPropertyTypes": true`, `"isolatedModules": true` and `"plugins": [{ "name": "next" }]`. Next.js 16 rewrites the app's tsconfig on first run if these differ.

- `verbatimModuleSyntax` forces `import type`, which guarantees type-only imports (the Zod schemas) are erased. It also implies `isolatedModules`.
- `NodeNext` requires explicit `.js` extensions on relative imports (`'./client.js'`). This makes the published ESM valid for every consumer, including plain Node. The examples in this plan use that style.
- `forceConsistentCasingInFileNames` is explicit because Omar's filesystem is case-insensitive and CI is not: a wrong-case import passes locally and fails on Linux. `check-structure` additionally fails on any file or folder under `packages/` whose name is not kebab-case, and case-only renames are done with `git mv -f`.
- `exactOptionalPropertyTypes` is **off** for `packages/*` and on for `apps/docs` and `scripts/`. A component library must accept `size={cond ? 'lg' : undefined}`, which the flag rejects, and it would put `| undefined` on every line of the public types and the generated props table.

## Build and consumption

- Build with `"build": "tsc -p tsconfig.build.json && copyfiles -u 1 \"src/**/*.css\" dist"`. `tsc` emits only `.js`, `.d.ts` and maps, so without the copy step `dist/styles.css` never exists and the consumer's CSS entry fails. `copyfiles` works on Windows; `cp` does not. `tsconfig.build.json` sets `"include": ["src"]`, `"exclude": ["src/**/*.test.ts", "src/**/*.test.tsx", "src/test/**"]`, `"outDir": "dist"`, `"rootDir": "src"`: tests never ship, while `demos/` and `meta.ts` are compiled on purpose because the docs app imports them.
- No bundler. `tsc` keeps the `'use client'` string at the top of each file. A bundler that merges files would strip or misplace it and silently break the server/client split.
- After every build run `publint --strict` and `attw --pack . --profile esm-only --exclude-entrypoints styles.css --include-entrypoints <list>`, where `<list>` comes from `scripts/list-entrypoints.ts`: `attw` skips subpath patterns containing `*`, so every concrete subpath must be named.
- Inside the monorepo the docs app consumes each package's `dist` through `exports`, and `turbo dev` runs `tsc --watch` per package next to `next dev` (the `dev` task is `persistent` and depends on `^build`, so a cold start has a `dist`). `transpilePackages` is not used: it only opts a package into compilation and never redirects resolution from `dist` to `src`, and Next.js 16 transpiles workspace packages automatically. Consuming source is deferred until Turbopack resolves `./client.js` to `client.tsx`; the decision is recorded in `docs/DECISIONS.md`.
- A consumer's CSS entry is three lines:

```css
@import "tailwindcss";
@import "@topclassui/tokens";
@import "@topclassui/react/styles.css";
```

`packages/react/src/styles.css` owns every Tailwind directive the library needs, because the utility names are the react package's contract:

```css
@source "./components";
@source "./connectors";

/* Hover, focus and active also match a forced attribute so the docs can show every state at once. */
@custom-variant hover {
  @media (hover: hover) { &:hover { @slot } }
  &[data-hover] { @slot }
}
@custom-variant focus-visible {
  &:focus-visible { @slot }
  &[data-focus-visible] { @slot }
}
@custom-variant active {
  &:active { @slot }
  &[data-active] { @slot }
}

/* For consumer code only; the library never uses dark:. The :not() makes one level of nesting behave. */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *):not(:where([data-theme="light"], [data-theme="light"] *)));

@utility pb-safe { padding-bottom: env(safe-area-inset-bottom); }
@utility pt-safe { padding-top: env(safe-area-inset-top); }
@utility ps-safe { padding-inline-start: env(safe-area-inset-left); }
@utility pe-safe { padding-inline-end: env(safe-area-inset-right); }

@theme inline {
  /* the full mapping is in section 6.2 */
}
```

`@source` paths are relative to the stylesheet that declares them, including a stylesheet imported from `node_modules`, and an explicit `@source` under `node_modules` is not filtered by the consumer's `.gitignore`. Without these lines Tailwind ignores `node_modules` and the components render unstyled. Scoping to `./components` and `./connectors` keeps source maps and type declarations out of the scan.

Everything the library authors must sit inside a cascade layer. Only custom-property declarations and `@keyframes` may be unlayered: an unlayered rule outranks every consumer utility regardless of specificity, which breaks the promise that a consumer's `className` wins, and `cn()` cannot fix that because it only merges class strings. Authored rules go in `@layer components` here and in `@layer base` in the tokens package. A Stylelint rule enforces it.

## Running the scripts

The scripts in `scripts/` are TypeScript executed with `tsx` (`"check:structure": "tsx scripts/check-structure.ts"`), which needs no Node flags and runs on Node 22.14. They have no shebangs. They normalise paths with `path.posix` before comparing, split lines with `/\r?\n/` so a CRLF checkout cannot change the result, and write files with `\n`. Moving to Node's own type stripping (Node 22.18 or newer, with `erasableSyntaxOnly` and `.ts` import extensions) is a later decision recorded in `docs/DECISIONS.md`.

# 5. The strict rules

Every rule has a reason. The rules are enforced by ESLint rules and scripts wherever possible, because a rule that lives only in a document gets broken. `docs/RULES.md` (section 23) is the machine-readable copy that every AI assistant reads.

## 5.1 Server-first

- A component is a Server Component unless it cannot be. Interactivity goes in `client.tsx` and nowhere else.
- `index.tsx` never contains `'use client'`, never imports React client hooks and never imports `./hook.js`. The only React hooks allowed there are `useId` and `use`, which work in Server Components; `check-boundaries` whitelists exactly those two and fails the build on anything else.
- For components marked C and for connectors, `index.tsx` holds no markup: it re-exports the client parts plus the prop types, the variants and the skeleton. A directive-less file that re-exports from a `'use client'` file is safe, because the re-exported names are client references.
- Props passed from `index.tsx` to `client.tsx` must be serializable: data and `children`. Never functions (Server Actions are the only exception).
- Server Components cannot read React context. Direction and theme come from `dir` and `data-theme` on the HTML, handled in CSS. Text labels come from a `labels` prop.
- Full patterns and examples are in section 9.

## 5.2 Styling

- **Semantic classes only** inside `packages/react`: `bg-primary-solid`, `text-body`, `border-line`. Palette classes (`bg-violet-600`), arbitrary colours (`bg-[#fff]`) and the `dark:` variant are banned there. Reason: a component that never names a real colour works in every mode, including modes that do not exist yet.
- Merge classes with `cn()` (`clsx` plus a **configured** `tailwind-merge`). `shared/cn.ts` uses `extendTailwindMerge`, never the default `twMerge`: tailwind-merge only knows Tailwind's own `--spacing-*` and `--radius-*` keys, so `h-control-md` and `rounded-control` are unknown to it and `cn('h-control-md', 'h-12')` would keep both classes. Custom `--color-*` keys need no configuration.

```typescript
// shared/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Keep these lists in sync with @theme inline in packages/react/src/styles.css.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: [
        'control-xs', 'control-sm', 'control-md', 'control-lg', 'control-xl',
        'toggle-xs', 'toggle-sm', 'toggle-md', 'toggle-lg', 'toggle-xl',
        'icon-xs', 'icon-sm', 'icon-md', 'icon-lg', 'icon-xl',
        'pad-y-xs', 'pad-y-sm', 'pad-y-md', 'pad-y-lg', 'pad-y-xl',
      ],
      radius: ['control', 'box', 'chip'],
    },
  },
})

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```

- The consumer's `className` is always passed last so it wins.
- **Every shared class string lives in one file**, so a focus ring or a disabled treatment can never drift between components:

```typescript
// shared/classes.ts
export const FOCUS_RING =
  'outline-none focus-visible:outline-(length:--tc-ring-width) focus-visible:outline-offset-(length:--tc-ring-offset) focus-visible:outline-ring'
export const BORDER = 'border-(length:--tc-line-width)'
export const DISABLED =
  'disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50'
export const LOADING = 'data-loading:cursor-progress'
export const INVALID = 'aria-invalid:border-danger aria-invalid:outline-danger'
export const TOUCH_TARGET = 'min-h-6 min-w-6 pointer-coarse:min-h-11'
export const TRANSITION = 'transition-colors motion-reduce:transition-none'

export const CONTROL_SIZE = {
  xs: 'h-control-xs px-2 text-xs gap-1',
  sm: 'h-control-sm px-3 text-sm gap-1.5',
  md: 'h-control-md px-4 text-sm gap-2',
  lg: 'h-control-lg px-5 text-base gap-2',
  xl: 'h-control-xl px-6 text-lg gap-3',
  custom: '',
} as const

// The tone sets the four interaction variables, so these strings never change per tone.
export const HOVER = {
  solid: 'hover:bg-(--tc-hover) active:bg-(--tc-active)',
  soft: 'hover:bg-(--tc-soft-hover) active:bg-(--tc-soft-active)',
  // outline and ghost are transparent at rest, so they borrow the tone's tint on the way in.
  outline: 'hover:bg-(--tc-soft) active:bg-(--tc-soft-hover)',
  ghost: 'hover:bg-(--tc-soft) active:bg-(--tc-soft-hover)',
  link: 'hover:underline active:underline',
} as const

export const POPUP_BOUNDS =
  'max-h-(--available-height) max-w-(--available-width) overflow-y-auto origin-(--transform-origin)'
export const SCROLL_Y = 'min-h-0 overflow-y-auto overscroll-contain'
export const SCROLL_X = 'min-w-0 overflow-x-auto overscroll-x-contain'
export const STICKY_EDGE = 'sticky z-(--tc-z-sticky) bg-surface'
```

`outline-(length:--tc-ring-width)` is how a knob reaches a utility that has no theme namespace; writing `outline-2` would hard-code the width and make `--tc-ring-width` decorative.

- Never build class names dynamically (`` `bg-${tone}` ``). Tailwind only sees complete strings. Use a lookup object or cva variants.
- No inline `style` except to set a CSS variable.
- Global feel comes from knobs (`rounded-control`, `h-control-md`, `FOCUS_RING`, `BORDER`), never from hard-coded values (`rounded-md`, `h-10`, `outline-2`, `border`, `border-2`), so one variable changes every component.
- State, focus, border, transition, touch-target, hover and scroll classes come from `shared/classes.ts`. Never retype a focus ring or a disabled style in a component, and never write a `hover:` or `focus-visible:` literal inside `packages/react`: a component writes `HOVER[variant]` and `FOCUS_RING`. A lint rule enforces both.
- List heights come from the `--tc-list-rows` knob (section 8.5), never a fixed `max-h-*`.
- Write `data-*` and `aria-*` variants in the bare form (`data-open:`, `data-panel-open:`, `group-data-panel-open:`, `aria-busy:`). Brackets are only for values, as in `data-[side=top]:`.
- The forced-state variants (`hover`, `focus-visible`, `active` matching `data-hover`, `data-focus-visible`, `data-active`) are redefined once in `packages/react/src/styles.css`, so components keep writing plain `hover:` and the docs States block can show every state without interaction. Only the docs and preview renderer set those attributes; components never do.

## 5.3 RTL

Use logical utilities so layout follows the text direction automatically.

| Banned | Use instead |
|--------------------------------|------------------------------------------|
| `pl-*` `pr-*` | `ps-*` `pe-*` |
| `ml-*` `mr-*` | `ms-*` `me-*` |
| `left-*` `right-*` and the deprecated `start-*` `end-*` | `inset-s-*` `inset-e-*` (Tailwind 4.2 renamed them; the old names still compile but are deprecated) |
| `text-left` `text-right` | `text-start` `text-end` |
| `border-l` `border-r` | `border-s` `border-e` |
| `rounded-l` `rounded-r` `rounded-tl` ... | `rounded-s` `rounded-e` `rounded-ss` `rounded-se` `rounded-es` `rounded-ee` |
| `float-left` `float-right` | `float-start` `float-end` |
| `scroll-ml` `scroll-pr` ... | `scroll-ms` `scroll-pe` ... |
| `space-x-*` `divide-x-*` | `gap-*` on flex or grid; `border-s` on children |
| `translate-x-*` `-translate-x-*` | `translate-x-(--tc-slide)` where the variable is `calc(<length> * var(--tc-dir))` |
| `origin-left` `origin-right` `origin-top-left` ... | `origin-(--transform-origin)` on popups (Base UI sets it per side); `rtl:origin-*` elsewhere |
| `bg-linear-to-r` `bg-linear-to-l` ... | `bg-linear-[calc(90deg*var(--tc-dir))]`, or a vertical direction |
| `object-left` `object-right` `bg-left` `bg-right` | no logical form exists: `object-left rtl:object-right` |
| `rotate-*` on a directional icon | never; the icon flips itself. Rotate only non-directional icons |
| `cursor-e-resize` `cursor-w-resize` | `cursor-col-resize` |
| `tracking-*` | nothing; letter-spacing breaks Arabic letter joining |

- Directional motion (slide-in, translate, transform origin) multiplies by `--tc-dir`, which is `1` in LTR and `-1` in RTL.
- Directional icons (arrows, carets, "send", "undo") flip automatically in RTL (section 7). Non-directional icons (search, clock, check) never flip.
- No `tracking-*` anywhere inside `packages/react`: it breaks the joined letter shapes of Arabic, and a component never knows which language its text will be. The Arabic font and line-height are set through `:lang(ar)` in the tokens file, which works for `<html lang="ar">` and for a nested `lang="ar"` element alike.
- Text a user types can be in either direction: inputs accept `dir="auto"`, and user-generated text inside components is wrapped in `<bdi>`.
- Overlay placement is logical: TopClass UI's `placement` prop maps to Base UI's `side` and `align` (10.1). `start` and `end` become `inline-start` and `inline-end`, so a menu opens on the correct side in both directions. Never use `left` or `right` as a side.
- Scrollbars move to the start edge in RTL. Never reserve space for one with padding; where a scrollbar appearing must not shift layout, use `scrollbar-gutter: stable` (10.5).

## 5.4 Responsive

- Mobile-first classes.
- Components respond to their **container**, not the viewport, using Tailwind's container queries (`@container`, `@md:`). A card in a narrow sidebar must look right on a wide screen. Note that `@md` is a 28rem container width, not the 48rem viewport breakpoint.
- Touch targets: every interactive element is at least 24x24 CSS px on every pointer type, and at least 44px under `pointer-coarse`. Both come from `TOUCH_TARGET` in `shared/classes.ts`.
- Switching between a desktop and a mobile pattern is the job of connectors (section 11), not of app code.

## 5.5 Browser support

- Tailwind v4 sets the floor: Safari 16.4+, Chrome 111+, Firefox 128+. Declare `chrome >= 111, safari >= 16.4, firefox >= 128, ios_saf >= 16.4` in `browserslist`.
- Nothing newer than that baseline without a fallback (examples needing care: CSS anchor positioning, `@starting-style`, `field-sizing`).
- Use `dvh` for full-height overlays and `env(safe-area-inset-*)` for anything pinned to a screen edge on iOS. Tailwind has no safe-area utility; `packages/react/src/styles.css` defines `pb-safe` and its siblings.
- All behaviour tests run in Chromium, Firefox and WebKit. Playwright's WebKit on Windows is a WebKit build, not Safari; rendering and iOS-only behaviour (virtual keyboard, safe areas, `dvh`) are verified on a real device before each minor release.

## 5.6 Accessibility

- Target WCAG 2.2 AA. Keyboard behaviour follows the WAI-ARIA Authoring Practices (Base UI provides this; do not break it when styling).
- A visible focus ring on every interactive element via `focus-visible`, from `FOCUS_RING`. Never remove an outline without replacing it.
- Types enforce labels: `IconButton` requires `label`; `Image` requires `alt`; form controls require a label through `Field`.
- Respect `prefers-reduced-motion` and support `forced-colors` (borders stay visible in Windows high-contrast mode).
- Contrast is checked in CI for every mode by `scripts/check-contrast.ts`: 4.5:1 for text, including a tone's text colour on its own `-soft` tint; 3:1 for `--tc-line-strong`, `--tc-ring` and icons, measured against **every** surface the element can sit on (`--tc-page`, `--tc-surface` and `--tc-surface-raised`), not only the page. It also asserts that every `-soft` tint keeps at least a 1.06 step from all three surfaces, because a tint nobody can see is not a tint: a boundary that passes on the page can fail on a card, which is how the dark `--tc-line-strong` reached only 3.19:1 before it was corrected. `--tc-line` is a decorative divider and is exempt, because no neutral light enough to read as a hairline reaches 3:1; controls that need a visible boundary use `--tc-line-strong`. The script uses CSS Color 4 gamut mapping, not naive clipping, and fails anything within 0.15 of a threshold, because the chromatic shades are outside sRGB and browsers map them differently.
- Essential information never lives only in a tooltip.
- **WCAG 2.2 criteria that axe cannot check, enforced by rule and by test:**
  - **2.5.8 Target Size (Minimum):** 24x24 CSS px on every pointer type, including `size="xs"`, Tag remove buttons, Pagination items, Slider thumbs and the Toast close button; 44px under `pointer-coarse`. A Playwright test measures every focusable element in every demo.
  - **2.5.7 Dragging Movements:** every drag has a non-drag path. Slider (arrow keys and a click on the track, from Base UI), Drawer and Toast swipe (a visible Close button is always rendered), Carousel (previous and next buttons), Resizable (arrow keys on the handle), sortable lists and LayersPanel (move up and down actions plus dnd-kit's keyboard sensor), NumberScrubber, ColorPicker and Timeline keyframes (a typed numeric input for the same value).
  - **2.4.11 Focus Not Obscured:** sticky and fixed bars set `scroll-padding-block` on the scroll container equal to their heights, so a focused element is never hidden behind one (10.5).

## 5.7 TypeScript and API conventions

Consistency across components is the main feature of a design system. Every component follows the same vocabulary.

- **Prop vocabulary:** `variant` (visual style), `tone` (`primary | neutral | success | warning | danger | info`), `size` (`xs | sm | md | lg | xl | custom`, default `md`), plus booleans with positive names (`disabled`, `loading`, `fullWidth`, never `isDisabled`).
- **The size scale is the same five names on every component that has a visual scale.** `custom` emits no size classes and the consumer supplies them through `className` or the component's size variables. Components with no meaningful scale (Separator, VisuallyHidden, SkipLink, Container) do not take `size`. On coarse pointers `xs` and `sm` controls still grow to the 44px touch target. `<Icon>` takes the same five names, mapped to its own pixel values (`xs` 16, `sm` 20, `md` 24, `lg` 32, `xl` 40), and also accepts any CSS length; it is the one component whose default is not `md` but `1em`, so an icon with no `size` follows the text it sits in.
- **Events:** `onValueChange(value)`, `onOpenChange(open)`.
- **Controlled and uncontrolled:** `value` + `defaultValue`, `open` + `defaultOpen`.
- **Always:** accept `className`, `style`, `ref` (React 19: `ref` is a normal prop, never `forwardRef`), and spread remaining props onto the root element.
- **Polymorphism:** a `render` prop in Base UI's style. Server-rendered components accept only the **element form** (`render={<Link href="/x" />}`) and implement it with the hook-free `renderElement(render, props)` in `shared/render.ts`, which clones the element and merges props with `mergeProps` from `@base-ui/react/merge-props`. Client components may also accept the **function form** through `useRender` from `@base-ui/react/use-render`. `useRender` calls hooks, so it can never appear in `index.tsx`.
- **Public prop types are TopClass-named aliases derived at the seam**, never Base UI names in the public surface and never a hand-copied prop list: `export type DialogRootProps = Omit<BaseDialog.Root.Props, 'className' | 'render'> & DialogDesignProps`. Consumers only ever see `DialogRootProps`; the alias is the one line that changes if the primitive changes. Hand-retyping a primitive's props is banned because it hides new props and drifts.
- **State attributes for styling and tests:** boolean presence attributes in Base UI's grammar, never `data-state="..."`: `data-open`, `data-closed`, `data-disabled`, `data-loading`, `data-invalid`, `data-checked`, `data-starting-style`, `data-ending-style`. Enumerated design props are value attributes: `data-variant="soft"`, `data-size="md"`, `data-tone="danger"`. A component built on a Base UI part never re-emits an attribute the part already sets.
- **Exports:** flat named exports only, no default exports. Each component's index exports the component or components, their prop types, its `xxxVariants` and its skeleton.
- **Limits:** numeric props have documented `min` and `max` in the schema and are clamped at runtime with `clamp()` so a bad value can never break the UI.
- No `any`, no non-null assertions without a one-line reason, no `@ts-ignore`.

## 5.8 Motion

- CSS only, animating `transform` and `opacity`.
- Transitions use the default duration or `duration-(--tc-duration-fast|base|slow)`, never `duration-<number>`. All of them are multiplied by `--tc-motion` in the tokens file, which also sets it to `0` under `prefers-reduced-motion`, so one variable disables motion globally and the preview routes can freeze animation for screenshots.
- Enter and exit transitions use the data attributes Base UI sets while mounting and unmounting: `data-starting-style` and `data-ending-style` on the popup, `data-open` and `data-closed` on the positioner and the popup. The pattern is `origin-(--transform-origin) transition data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0`. Always animate `opacity` as well as `transform`: Base UI waits for an opacity animation before unmounting, and a transform-only transition is not awaited.
- Off under `prefers-reduced-motion`.
- An animation library can be added later as an optional layer. Components must not depend on one.

## 5.9 Dependencies

- Allowed in core, declared in `dependencies` of `@topclassui/react`: `@topclassui/icons` (workspace), `@base-ui/react`, `clsx`, `tailwind-merge`, `class-variance-authority`.
- Declared in `peerDependencies`: `react`, `react-dom`, `tailwindcss` (`^4.2.0`), `@topclassui/tokens` and `zod` (required: the published types and the `./schemas/*` subpath reference it).
- Everything else is an optional peer dependency (`peerDependenciesMeta`) used by exactly the components that need it.
- Banned: CSS-in-JS runtimes, lodash, moment, runtime theme objects.

## 5.10 Naming

- Folders and files: kebab-case. Components: PascalCase. Hooks: `useThing`.
- CSS variables: `--tc-*`. Component-scoped variables only when needed: `--tc-button-*`.
- Storage keys, data attributes and class prefixes that belong to the library start with `tc`.

## 5.11 Built-in text

- No hard-coded user-visible English inside a component. Every built-in string ("Close", "Next page", "No results", "Try again") comes from a `labels` prop with defaults from `shared/labels/en.ts`. Demo files are exempt.
- `shared/labels/ar.ts` ships too. Client components can also read labels from `TopClassProvider`; Server Components take them as props.
- **Labels with numbers are functions, not templates.** A label is `string | ((n: number, fmt: Intl.NumberFormat) => string)`, because Arabic has six plural categories and a single template string is wrong for 1, 2 and 3. `ar.ts` uses `Intl.PluralRules('ar')`. `shared/labels/types.ts` holds the `Labels` type; `en.ts` and `ar.ts` are written with `satisfies Labels`, so a missing Arabic key is a type error.
- **Locale travels with labels.** `getLabels(locale)` returns `{ locale, labels }`. Server Components receive both as props; `TopClassProvider` takes `locale`, `labels` and `numberingSystem` and exposes them with the direction to client components. `Intl.NumberFormat` is created once per provider, and Arabic-Indic or Latin digits are a provider option, not a component prop.

## 5.12 Code structure

Enforced by `check-structure`, ESLint and Prettier. A rule that only lives in prose does not count.

- **Logic and markup are separate files.** `client.tsx` contains JSX and calls at most one component hook, `useXxx(props)` from `hook.ts`, when the component has state or effects. It holds no `useState`, `useEffect`, `useReducer`, `useRef`, `useMemo` or `useCallback`, and no function longer than a return statement. `hook.ts` holds the state, the effects and the handlers and returns a plain object; it contains no JSX and is a `.ts` file. Pure helpers (formatting, clamping, key derivation, filtering) live in `lib.ts` as exported functions with unit tests, and `hook.ts` calls them. Shared behaviour lives in `shared/` hooks (`useCollection`, `useControllableState`, `useAdaptiveMode`).
- **Server files hold markup only.** `index.tsx` composes markup from props and constants; `useId` and `use` are allowed there, nothing else is. Any derivation longer than one expression is a function in `lib.ts`.
- **Data never lives in components.** Fetching, caching and pagination belong to the app; components receive data and callbacks through the contracts in 8.2 and 8.5.
- **File size:** `check-structure` warns at 200 lines and fails at 300. A component that needs more files than the contract lists gets a `parts/` folder with one part per file.
- **Naming:** files in `parts/` export one component named after the file (`dialog-root.tsx` exports `DialogRoot`). The contract's fixed files export what the contract says; `index.tsx` may re-export several names. Hooks are `useThing`, pure functions are verb-first (`clampValue`, `formatCount`), and constants are `SCREAMING_CASE` in `constants.ts` or `classes.ts` only.
- **Types live in `types.ts`.** A component's prop interfaces and unions are declared there, derived from `constants.ts` and `schema.ts`, and imported with `import type` by the files that need them. No prop interface is declared inline in `index.tsx` or `client.tsx`, and no value list is a TypeScript `enum`, which would survive compilation into the bundle (8.3).
- **Comments are one line, and only for what the code cannot say**: a browser quirk, a spec reference, a constraint that is not visible locally. No paragraph comments, no commented-out code, no explanation of what the next line does. JSDoc on a public prop is one line. A lint rule fails on any comment block longer than one line outside `shared/labels`.
- **No `any`, no `@ts-ignore`, no non-null assertion without a one-line reason.**
- **Imports** are relative with explicit `.js` extensions, and type imports use `import type`.

# 6. Tokens, modes and global knobs (Phase 1)

## 6.1 Three layers

1. **Palette** - Tailwind's built-in oklch colours (`--color-violet-600`) plus, later, a generated brand scale. Components never use this layer directly.
2. **Semantic tokens** (`--tc-*`) - what a colour is *for*: background, text, border, each tone. A mode is just a different set of values for these. Each tone has three parts: the solid colour, the foreground that sits on it, and a text colour for when the tone is written on its own soft tint.
3. **Global knobs** - radius, density, border width, motion, fonts, list length. One variable changes every component.

Soft (tinted) tone backgrounds are **derived** with `color-mix`, not defined by hand, so a custom mode needs about a dozen variables instead of forty.

The tokens package holds only these variables, the mode blocks and its `@layer base` rules. The mapping from tokens to Tailwind utilities lives in `packages/react/src/styles.css` (section 4), because those utility names are what the components are written against. A consumer may replace the tokens file with their own `--tc-*` file and keep every component working.

## 6.2 The tokens file

```css
/* packages/tokens/src/index.css
   Consumer order:  @import "tailwindcss";  then  @import "@topclassui/tokens";  */

/* Knobs live on :root only, so a nested themed section keeps the page's feel. */
:root {
  --tc-radius: 0.5rem;          /* 0 = square, 9999px = pill */
  --tc-line-width: 1px;
  --tc-ring-width: 2px;
  --tc-ring-offset: 2px;
  --tc-density: 1;              /* 0.875 compact, 1 default, 1.125 comfortable */
  --tc-motion: 1;               /* 0 = no animation */
  --tc-list-rows: 7;            /* rows a list shows before it scrolls */
  --tc-row-height: calc(2.5rem * var(--tc-density));
  --tc-overlay-inset: 1rem;     /* space between a dialog and the viewport edge */
  --tc-sticky-top: 0px;         /* set by sticky bars, read by scroll-padding */
  --tc-sticky-bottom: 0px;
  --tc-font-latin: ui-sans-serif, system-ui, sans-serif;
  --tc-font-arabic: ui-sans-serif, system-ui, sans-serif;
  --tc-font-sans: var(--tc-font-latin);
  --tc-font-mono: ui-monospace, monospace;
  --tc-dir: 1;

  --tc-duration-fast: calc(100ms * var(--tc-motion));
  --tc-duration-base: calc(150ms * var(--tc-motion));
  --tc-duration-slow: calc(300ms * var(--tc-motion));

  --tc-z-sticky: 10;
  --tc-z-drawer: 40;
  --tc-z-dialog: 50;
  --tc-z-popup: 60;
  --tc-z-toast: 70;
}

/* Light is the default and an explicit mode, so a light section inside a dark page resets every colour. */
:root,
[data-theme="light"] {
  color-scheme: light;

  --tc-page: var(--color-white);
  --tc-surface: var(--color-neutral-50);
  --tc-surface-raised: var(--color-white);
  --tc-body: var(--color-neutral-950);
  --tc-muted: var(--color-neutral-600);
  --tc-line: var(--color-neutral-200);          /* decorative hairline, exempt from 3:1 (5.6) */
  --tc-line-strong: var(--color-neutral-500);   /* control boundaries, 4.73:1 on white */
  --tc-overlay: oklch(0 0 0 / 0.5);

  --tc-primary-solid: var(--color-blue-600);
  --tc-primary-on-solid: var(--color-white);
  --tc-primary-on-soft: var(--color-blue-800);
  --tc-neutral-solid: var(--color-neutral-900);
  --tc-neutral-on-solid: var(--color-white);
  --tc-neutral-on-soft: var(--color-neutral-900);
  --tc-success-solid: var(--color-emerald-700);
  --tc-success-on-solid: var(--color-white);
  --tc-success-on-soft: var(--color-emerald-700);
  --tc-warning-solid: var(--color-amber-500);
  --tc-warning-on-solid: var(--color-neutral-950);
  --tc-warning-on-soft: var(--color-amber-700);
  --tc-danger-solid: var(--color-red-600);
  --tc-danger-on-solid: var(--color-white);
  /* red-800 not red-700: red-700 measures 4.35:1 on danger-soft-active. */
  --tc-danger-on-soft: var(--color-red-800);
  --tc-info-solid: var(--color-sky-700);
  --tc-info-on-solid: var(--color-white);
  --tc-info-on-soft: var(--color-sky-700);

  /* How much of the tone goes into its soft tint. Dark needs more (see the dark block). */
  --tc-primary-mix: 12%;
  --tc-neutral-mix: 8%;
  --tc-success-mix: 12%;
  --tc-warning-mix: 16%;
  --tc-danger-mix: 12%;
  --tc-info-mix: 12%;
}

[data-theme="dark"] {
  color-scheme: dark;

  --tc-page: var(--color-neutral-950);
  --tc-surface: var(--color-neutral-900);
  --tc-surface-raised: var(--color-neutral-800);
  --tc-body: var(--color-neutral-50);
  --tc-muted: var(--color-neutral-400);
  --tc-line: var(--color-neutral-800);
  --tc-line-strong: var(--color-neutral-400);   /* 5.83:1 on a raised card; neutral-500 measured only 3.19:1 there */
  --tc-overlay: oklch(0 0 0 / 0.7);

  --tc-neutral-solid: var(--color-neutral-100);
  --tc-neutral-on-solid: var(--color-neutral-950);
  --tc-neutral-on-soft: var(--color-neutral-200);
  --tc-primary-on-soft: var(--color-blue-400);
  --tc-success-on-soft: var(--color-emerald-400);
  --tc-warning-on-soft: var(--color-amber-400);
  --tc-danger-on-soft: var(--color-red-400);
  --tc-info-on-soft: var(--color-sky-400);

  /* A tone mixed into near-black barely moves: at the light percentages every dark soft
     tint measured 1.01-1.03 against --tc-surface, which is invisible. These are the
     smallest values that keep a step against all three surfaces and the text above 4.5:1. */
  --tc-primary-mix: 24%;
  --tc-neutral-mix: 12%;
  --tc-success-mix: 24%;
  --tc-warning-mix: 14%;
  --tc-danger-mix: 22%;
  --tc-info-mix: 24%;
}

/* A custom mode is one more block. It may change knobs as well as colours,
   and it declares its own color-scheme. */
[data-theme="ocean"] {
  color-scheme: light;
  --tc-primary-solid: var(--color-cyan-700);
  --tc-primary-on-solid: var(--color-white);
  /* cyan-800 not cyan-700: the whole ocean soft ramp fails at cyan-700. */
  --tc-primary-on-soft: var(--color-cyan-800);
  --tc-radius: 9999px;
}

/* Anything defined as a var() of another token is declared on every themed element,
   not only :root, so a nested section recomputes it from its own values. */
:root,
[data-theme] {
  /* Not var(--tc-primary-solid): blue-600 measures 2.88:1 on a dark raised surface. */
  --tc-ring: var(--tc-primary-on-soft);
  --tc-primary-soft: color-mix(in oklch, var(--tc-primary-solid) var(--tc-primary-mix), var(--tc-page));
  --tc-neutral-soft: color-mix(in oklch, var(--tc-neutral-solid) var(--tc-neutral-mix), var(--tc-page));
  --tc-success-soft: color-mix(in oklch, var(--tc-success-solid) var(--tc-success-mix), var(--tc-page));
  --tc-warning-soft: color-mix(in oklch, var(--tc-warning-solid) var(--tc-warning-mix), var(--tc-page));
  --tc-danger-soft: color-mix(in oklch, var(--tc-danger-solid) var(--tc-danger-mix), var(--tc-page));
  --tc-info-soft: color-mix(in oklch, var(--tc-info-solid) var(--tc-info-mix), var(--tc-page));
  /* A solid button's hover is constrained by its own label, not by the page, so it
     steps away from that label in every mode. Each tone sets these three; the values
     here are the primary tone. Mixing toward black instead would keep darkening on a
     dark page, and stepping toward the page would drop white text below 4.5:1. */
  --tc-hover: var(--color-blue-700);
  --tc-active: var(--color-blue-800);
  --tc-soft-hover: color-mix(in oklch, var(--tc-primary-solid) calc(var(--tc-primary-mix) + 8%), var(--tc-page));
  --tc-soft-active: color-mix(in oklch, var(--tc-primary-solid) calc(var(--tc-primary-mix) + 16%), var(--tc-page));
}

[dir="rtl"] { --tc-dir: -1; }

@media (prefers-reduced-motion: reduce) {
  :root { --tc-motion: 0; }
}
```

**The interaction ramp, per tone.** `--tc-hover` and `--tc-active` are named shades, not a computed mix, because the step has to keep the button's own label readable and no single mix does that in both modes. Every value below is computed and passes 4.5:1 against its `-fg`:

| Tone | hover | active | Why |
|------|-------|--------|-----|
| primary | blue-700 | blue-800 | White label in every mode, so the step is the same in every mode |
| danger | red-700 | red-800 | Same |
| neutral | light: neutral-800 then 700; dark: neutral-200 then 300 | | Its solid is already near-black or near-white, so it steps toward the middle and its label flips with it |

`--tc-soft-hover` and `--tc-soft-active` stay a mix, because a tint has no label of its own. The rule is **the tone's own soft percentage plus 8, then plus 16**, and the percentage is `--tc-<tone>-mix`, which differs per tone **and per mode**. Light and ocean: `primary`, `success`, `danger` and `info` are 12, `neutral` is 8, `warning` is 16. Dark: 24, 24, 22, 24, 12 and 14 respectively. Dark needs roughly double because a mid-lightness tone mixed into near-black hardly moves - at the light percentages every dark soft tint measured 1.01-1.03 against `--tc-surface`, which is no step at all. Reading one number off the primary block and applying it to every tone, or reading the light number and applying it to dark, are the two mistakes to avoid.

```css

@layer base {
  /* font-family inherits as a resolved list, so setting the property is the only thing that works
     on a nested lang="ar" element. */
  :lang(ar) {
    font-family: var(--tc-font-arabic);
    letter-spacing: 0;
  }
  html { scrollbar-gutter: stable; }
}
```

`--tc-font-arabic` is a literal stack, never `var(--tc-font-sans)`: on `<html lang="ar">` both rules match the same element, and two custom properties that reference each other are a dependency cycle that makes both invalid, which would render the whole Arabic site in the browser's default serif.

The mapping to utilities lives in `packages/react/src/styles.css`:

```css
@theme inline {
  --color-page: var(--tc-page);
  --color-surface: var(--tc-surface);
  --color-surface-raised: var(--tc-surface-raised);
  --color-body: var(--tc-body);
  --color-muted: var(--tc-muted);
  --color-line: var(--tc-line);
  --color-line-strong: var(--tc-line-strong);
  --color-overlay: var(--tc-overlay);
  --color-ring: var(--tc-ring);

  --color-primary-solid: var(--tc-primary-solid);
  --color-primary-on-solid: var(--tc-primary-on-solid);
  --color-primary-soft: var(--tc-primary-soft);
  --color-primary-on-soft: var(--tc-primary-on-soft);
  --color-neutral-solid: var(--tc-neutral-solid);
  --color-neutral-on-solid: var(--tc-neutral-on-solid);
  --color-neutral-soft: var(--tc-neutral-soft);
  --color-neutral-on-soft: var(--tc-neutral-on-soft);
  --color-success-solid: var(--tc-success-solid);
  --color-success-on-solid: var(--tc-success-on-solid);
  --color-success-soft: var(--tc-success-soft);
  --color-success-on-soft: var(--tc-success-on-soft);
  --color-warning-solid: var(--tc-warning-solid);
  --color-warning-on-solid: var(--tc-warning-on-solid);
  --color-warning-soft: var(--tc-warning-soft);
  --color-warning-on-soft: var(--tc-warning-on-soft);
  --color-danger-solid: var(--tc-danger-solid);
  --color-danger-on-solid: var(--tc-danger-on-solid);
  --color-danger-soft: var(--tc-danger-soft);
  --color-danger-on-soft: var(--tc-danger-on-soft);
  --color-info-solid: var(--tc-info-solid);
  --color-info-on-solid: var(--tc-info-on-solid);
  --color-info-soft: var(--tc-info-soft);
  --color-info-on-soft: var(--tc-info-on-soft);

  --radius-control: var(--tc-radius);                        /* buttons, inputs */
  --radius-box: min(calc(var(--tc-radius) * 1.5), 1.5rem);   /* cards, dialogs */
  --radius-chip: min(calc(var(--tc-radius) * 0.5), 0.5rem);  /* badges, checkboxes */

  --font-sans: var(--tc-font-sans);
  --font-mono: var(--tc-font-mono);

  --spacing-control-xs: calc(1.75rem * var(--tc-density));
  --spacing-control-sm: calc(2rem * var(--tc-density));
  --spacing-control-md: calc(2.5rem * var(--tc-density));
  --spacing-control-lg: calc(3rem * var(--tc-density));
  --spacing-control-xl: calc(3.5rem * var(--tc-density));

  /* A toggle is neither a control height nor an icon: a 40px checkbox is absurd and a
     16px one is not a control. Its own scale, and every step still carries a 24px
     target through TOUCH_TARGET. */
  --spacing-toggle-xs: calc(0.875rem * var(--tc-density));
  --spacing-toggle-sm: calc(1rem * var(--tc-density));
  --spacing-toggle-md: calc(1.25rem * var(--tc-density));
  --spacing-toggle-lg: calc(1.5rem * var(--tc-density));
  --spacing-toggle-xl: calc(1.75rem * var(--tc-density));

  /* The five names behind ICON_SIZE (section 7.3). Not multiplied by density: an icon
     follows its text, and the text is not scaled by the density knob either. */
  --spacing-icon-xs: 1rem;
  --spacing-icon-sm: 1.25rem;
  --spacing-icon-md: 1.5rem;
  --spacing-icon-lg: 2rem;
  --spacing-icon-xl: 2.5rem;

  /* Vertical padding for things that hug their text rather than take a control
     height: Badge, Tag, Alert, Toast. padding-x is not the right value for them. */
  --spacing-pad-y-xs: calc(0.125rem * var(--tc-density));
  --spacing-pad-y-sm: calc(0.25rem * var(--tc-density));
  --spacing-pad-y-md: calc(0.375rem * var(--tc-density));
  --spacing-pad-y-lg: calc(0.5rem * var(--tc-density));
  --spacing-pad-y-xl: calc(0.625rem * var(--tc-density));

  /* Every transition-* utility reads this, so the motion knob reaches all of them. */
  --default-transition-duration: calc(150ms * var(--tc-motion));
}
```

Notes for implementation:

- Every `--color-*` theme variable automatically becomes `bg-*`, `text-*`, `border-*`, `ring-*`, `outline-*`, `fill-*`, `stroke-*`, `from-*` and so on. This is the "custom colour classes that work on text, background, etc." requirement.
- The `min()` on `--radius-box` stops cards turning into circles when buttons are pills.
- A named `--spacing-*` key generates a value for every spacing-driven utility: `h-`, `min-h-`, `max-h-`, `w-`, `size-`, `p*-`, `m*-`, `gap-`, `inset*-` and more. The bare `--spacing` multiplier is a different key and is untouched, so `h-10` still works. With `@theme inline`, `h-control-md` compiles to `height: calc(2.5rem * var(--tc-density))`. The namespace also leaks into unrelated utilities such as `leading-control-md`; that is harmless, but the lint rule must not assume `control-*` only appears on `h-` and `w-`.
- Tailwind emits only the theme variables it sees used, and a `var(--color-*)` reference in plain CSS counts as usage, so the palette values this file references are emitted without `@theme static`. The reverse matters more: `@theme inline` variables are inlined into utilities and are not emitted as CSS variables, so consumer CSS and the colours page always read `var(--tc-primary-solid)`, never `var(--color-primary)`.
- Opacity modifiers work on these colours: `bg-primary-solid/90` compiles to `color-mix(in oklab, var(--tc-primary-solid) 90%, transparent)`, evaluated at the element, so a nested themed section recomputes it correctly.

## 6.3 Switching modes without a flash, while pages stay static

Reading the theme from a cookie on the server makes every page dynamic, which hurts caching and SEO. Instead a tiny inline script sets the attribute before first paint. It lives in `packages/react/src/shared/theme/` and is exported from `@topclassui/react/theme`; it uses no Next.js API.

```typescript
// packages/react/src/shared/theme/theme-script.tsx  (Server Component)
import { THEME_SCRIPT_HASH } from './theme-script-hash.generated.js'

const code = `(function(){try{var m=["light","dark","ocean"];var t=localStorage.getItem('tc-theme');
if(!t||t==='system'||m.indexOf(t)<0){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}
document.documentElement.dataset.theme=t}catch(e){}})()`

export { THEME_SCRIPT_HASH }

export function ThemeScript({ nonce }: { nonce?: string | undefined }) {
  return (
    <script
      type="text/javascript"
      suppressHydrationWarning
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: code }}
    />
  )
}
```

- Put `<ThemeScript />` first in `<head>`, with `data-theme="light"` and `suppressHydrationWarning` on `<html>`. React leaves inline scripts in place, so the browser runs it while parsing, before first paint. This is the pattern Next.js documents for preventing a flash before hydration.
- The stored value is validated against the list of known modes, so a stale value from an older build cannot leave the page in a mode that no longer exists.
- `THEME_SCRIPT_HASH` is the SHA-256 of the script, generated at build time and unit-tested against the literal. A consumer with a strict Content Security Policy allows the script by hash and stays fully static; a `nonce` requires dynamic rendering, which defeats the point.
- Every custom mode block declares its own `color-scheme`. `useTheme()` exposes `resolved: 'light' | 'dark'` read from `getComputedStyle(document.documentElement).colorScheme`, so ThemeSwitcher and `<meta name="theme-color">` never guess. It also re-applies the stored theme in a `useLayoutEffect` on mount, because React's development Strict Mode remount resets the attributes on `<html>`.
- Any element can carry `data-theme`, so a dark hero inside a light page just works, and a light section inside a dark page works too.

## 6.4 The colours page

A docs page modelled on Tailwind's colour reference.

- Grid 1: the palette, 50-950 per hue, showing the oklch value on hover and copying the class name on click.
- Grid 2: every semantic token, shown in all modes side by side, with the class name (`bg-primary-solid`), the variable (`--tc-primary-solid`) and a contrast badge (pass or fail, from the same computation `check-contrast` uses) for each foreground and background pair.
- Live controls at the top: mode, direction, radius, density. They change the page itself so the knobs are demonstrated, not described. In Phase 1 these are native `<select>` and `<input type="range">` elements in a small client component, replaced by ThemeSwitcher, Select and Slider in Phase 6.

## 6.5 Later: theme builder

A page where a user picks a brand colour, radius and density and receives a ready `[data-theme="x"] { ... }` block. The 50-950 brand scale is generated in oklch. Not part of v0.1.

## 6.6 Figma: the visual source of truth

Everything is designed in Figma before it is built, and what is in Figma is what gets built. The file is generated with the Figma MCP from the token values above and the component specs of section 18, and it is the reference every implementation is checked against.

- **Variables:** five collections - `Palette`, `Semantic`, `Knobs`, `Size`, `Type`. `Semantic` and `Knobs` carry the three modes; the rest have one. Changing a knob re-renders the whole file.

**Figma and CSS now use the same names, and this table is the contract.** Figma has no custom properties, so a variable is named by its role in a path (`base/page`); CSS spells the same role as a custom property (`--tc-page`). One name per role, so a generator or a reviewer never has to translate.

| Figma variable | CSS custom property | What it is |
|---|---|---|
| `base/page` | `--tc-page` | the page behind everything |
| `base/surface` | `--tc-surface` | a recessed or striped surface |
| `base/surface-raised` | `--tc-surface-raised` | a card, a popup, an input |
| `base/body` | `--tc-body` | body text |
| `base/muted` | `--tc-muted` | secondary text |
| `base/line` | `--tc-line` | a decorative hairline, exempt from 3:1 |
| `base/line-strong` | `--tc-line-strong` | a control boundary, must reach 3:1 |
| `base/ring` | `--tc-ring` | the focus ring |
| `base/overlay` | `--tc-overlay` | the scrim behind a dialog |
| `<tone>/solid` | `--tc-<tone>-solid` | the strong fill |
| `<tone>/on-solid` | `--tc-<tone>-on-solid` | text on that fill |
| `<tone>/soft` | `--tc-<tone>-soft` | the tint |
| `<tone>/on-soft` | `--tc-<tone>-on-soft` | text on the tint, and coloured text anywhere |
| `<tone>/hover`, `/active` | `--tc-hover`, `--tc-active` | set by the tone's compound variant |
| `<tone>/soft-hover`, `/soft-active` | `--tc-soft-hover`, `--tc-soft-active` | same |
| `control/<size>` | `--spacing-control-<size>` | control height |
| `toggle/<size>` | `--spacing-toggle-<size>` | checkbox, radio and switch box |
| `icon/<size>` | `--spacing-icon-<size>` | the five `ICON_SIZE` values |
| `padding-x/<size>`, `padding-y/<size>` | `--spacing-pad-x-*`, `--spacing-pad-y-*` | control padding |
| `radius/control`, `/box`, `/chip` | `--tc-radius`, and the box and chip derivations | corner radii |

Phase 1's `tokens:check` script asserts this table in both directions: every Figma variable has a CSS counterpart and every `--tc-*` has a Figma variable. Neither side may gain a token without the other.
- **Components:** one component set per catalog row, with properties named exactly as section 5.7 (`variant`, `tone`, `size`, `disabled`, `loading`, `invalid`, `open`), one variant frame per state in the States block grammar (idle, hover, focus-visible, active, disabled, loading, invalid, empty, error), in LTR and RTL, in every mode. Every colour, radius, spacing and font in the file is a variable, never a raw value.
- **Pages:** every docs route of section 16 as a page frame at 390 px and 1280 px, in both directions.
- **Parity gate:** a component or page is done only when its `/preview` screenshot matches its Figma frame within the visual-test tolerance. The Figma frame wins: a deliberate change is made in Figma first, then in code, and `docs/DECISIONS.md` records every intentional divergence. Pixel-identical output between Figma and a browser is not achievable (font rasterisation, sub-pixel rounding), so 1:1 means the same tokens, the same dimensions, the same states and a screenshot diff inside the tolerance.
- **Order of work:** foundations (variables, type, icons), Omar signs off, then tier-1 components, then the docs pages, then tiers 2, 3 and 4. Later tiers are generated from the same specs but are not the parity gate until their code phase starts.

**Access.** The connector is the remote Figma MCP server; the desktop server is read-only and needs a paid seat, so it is not an option. **Phase 0.5 requires Figma Professional with a Full seat.** Both limits of the free Starter plan were confirmed by hitting them on 21 September 2026: a collection may have only one mode, so light, dark and ocean cannot share one collection; and the whole account gets 20 MCP tool calls per month, which the drawing tool spends. Professional allows ten modes and 200 calls a day. The file needs roughly 150 to 300 write calls, one per component set or page, so it is about one month of subscription. Until then the three modes live in parallel collections (`Semantic Light`, `Semantic Dark`, `Semantic Ocean`) with identical token names, which a script can swap on a frame.

**Token naming.** Six tones (`primary`, `neutral`, `success`, `warning`, `danger`, `info`), each with four values: `solid`, `on-solid`, `soft`, `on-soft`. `on-` always means the colour that sits on top, so a filled button is `bg-primary-solid text-primary-on-solid` and a soft badge is `bg-primary-soft text-primary-on-soft`. Nine page colours: `page`, `surface`, `surface-raised`, `body`, `muted`, `line`, `line-strong`, `ring`, `overlay`. No abbreviations and no name repeats its Tailwind prefix.

# 7. Icons (Phase 2)

## 7.1 Approach

A single component that imports every icon would put every icon in every bundle, and a sprite with every symbol in one file cannot grow past a few hundred icons. Instead every icon becomes one tiny ES module, and the icon is rendered inline.

```typescript
// packages/icons/src/icons/arrow-left.ts  (generated)
import type { IconData } from '../types.js'

export const arrowLeft: IconData = {
  viewBox: '0 0 256 256',
  path: 'M224 128a8 8 0 0 1-8 8H59.31l58.35 58.34a8 8 0 0 1-11.32 11.32l-72-72a8 8 0 0 1 0-11.32l72-72a8 8 0 0 1 11.32 11.32L59.31 120H216a8 8 0 0 1 8 8Z',
  directional: true,
}
```

`<Icon name="arrow-left" />` renders `<svg viewBox="..."><path d="..." fill="currentColor" /></svg>` straight into the HTML. Nothing is fetched, the markup is complete on first paint, and the icon works wherever HTML works, including Open Graph images and e-mail. Only the icons a page actually renders are ever loaded, so a set of twenty thousand icons costs nothing until one is used.

## 7.2 Pipeline

1. Only the SVG files actually used are placed in `packages/icons/raw/` (downloaded from the chosen library). This folder is the allow-list.
2. `pnpm icons:build` runs SVGO on each file, rewrites hard-coded colours to `currentColor`, extracts the `viewBox` and the merged path, and writes one module per icon to `src/icons/<name>.ts` with LF and no BOM.
3. The same script generates `src/names.generated.ts` (the `IconName` union), `src/directional.generated.ts` (names that flip in RTL, matched by pattern: `arrow-*`, `caret-*`, `chevron-*`, plus the manual list in `docs/icons.md`), `src/version.generated.ts` (a content hash over the generated modules) and `src/loaders.generated.ts`:

```typescript
// packages/icons/src/loaders.generated.ts
export const LOADERS = {
  'arrow-left': () => import('./icons/arrow-left.js'),
  'caret-down': () => import('./icons/caret-down.js'),
  // one line per icon
} as const
```

Each entry is its own code-split chunk, so the map costs a few bytes per icon and never pulls path data in until it is called.

4. Apps that want more icons than the built-in set register one with `topclassui-icons add-set <name> <dir>`, which generates the same modules, names and loaders under `<name>/`. Names are `set:name`, and the built-in set needs no prefix, so `<Icon name="brand:facebook" />` is type-checked too.

## 7.3 The two entry points

**Server: `<Icon name>`** lives in `packages/react/src/components/icon/index.tsx`, so it can use `cn()` and is covered by the react package's `@source`. It is an async Server Component and the file starts with `import 'server-only'`, so importing it from a client or shared file fails at build time rather than at runtime.

```typescript
// packages/react/src/components/icon/index.tsx
import 'server-only'
import type { SVGProps } from 'react'
import { DIRECTIONAL, loadIcon, type IconName } from '@topclassui/icons'
import { cn } from '../../shared/cn.js'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  /** The five names, or any CSS length. Defaults to 1em so the icon follows the text. */
  size?: IconSize | number | (string & {}) | undefined
  /** Set for a meaningful icon; leave unset for a decorative one. */
  label?: string | undefined
  /** Defaults to true for directional icons (arrows, carets). */
  flipRtl?: boolean | undefined
}

export async function Icon({ name, size = '1em', label, flipRtl, className, ...rest }: IconProps) {
  const icon = await loadIcon(name)
  const flip = flipRtl ?? DIRECTIONAL.has(name)
  const length = resolveIconSize(size)

  return (
    <svg
      width={length}
      height={length}
      viewBox={icon.viewBox}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      className={cn('inline-block shrink-0', flip && 'rtl:-scale-x-100', className)}
      {...rest}
    >
      <path d={icon.path} fill="currentColor" />
    </svg>
  )
}
```

`loadIcon` caches in memory, so an icon used on many pages is loaded once per server process; the docs are static, so it happens at build time.

`resolveIconSize` lives in `shared/contracts/size.ts` next to `sizeSchema`, so the icon scale and the control scale are declared in one file:

```typescript
export const ICON_SIZE = { xs: 16, sm: 20, md: 24, lg: 32, xl: 40 } as const
export type IconSize = keyof typeof ICON_SIZE

export function resolveIconSize(size: IconSize | number | (string & {})): number | string {
  return typeof size === 'string' && size in ICON_SIZE ? ICON_SIZE[size as IconSize] : size
}
```

`<Icon>` is the only component whose default is not `md`. Leaving `size` off gives `1em`, so an icon inside a `sm` button is 14px and the same markup inside an `xl` button is 18px without anyone passing a size. The five names exist for a standalone icon that has no text to follow.

**Client and shared: `<Svg icon>`** lives in `packages/react/src/components/svg/index.tsx`, has no directive, and is exported as `@topclassui/react/svg`. Every file that can end up in a client bundle - `client.tsx` files and shared components such as Button - imports the icon it needs explicitly:

```typescript
import { spinner } from '@topclassui/icons/spinner'
import { Svg } from '../svg/index.js'

<Svg icon={spinner} className="animate-spin motion-reduce:animate-none" />
```

Only that icon's few hundred bytes ship. A lint rule forbids importing `loaders.generated` anywhere except `components/icon/index.tsx`, so the map can never reach the browser.

**Names in data props.** `MenuItem.icon` and its siblings stay `IconName` strings, because that is what the docs props table, the future inspector and AI tools need. The server half of a component resolves a name to an `<Icon>` element before passing items to `client.tsx`, and the client-side contract carries `icon?: ReactNode`.

**Repeated icons.** A list of two hundred rows with the same chevron inlines the path two hundred times. Gzip removes almost all of it because the strings are identical, and long lists are windowed anyway (8.5). This is measured in Phase 3; if it ever matters, a per-page symbol dedupe can be added behind the same API.

## 7.4 The icons page

A searchable grid of every registered set, built as a collection (8.5) whose `loadMore` is a Server Action returning the next page of icon data, so twenty thousand icons render as a few hundred DOM nodes and the browser only ever holds the visible window. Clicking an icon copies `<Icon name="..." />`. Controls for size and colour, and a direction toggle that shows which icons flip.

# 8. Component anatomy

## 8.1 The folder contract

Each component is a folder. A file exists only when the component needs it. `pnpm new:component <name>` scaffolds the folder, and `pnpm check:structure` fails CI when a folder breaks the contract or a rule in 5.12.

| File | Role | Rule |
|----------------|--------------------------------------|----------------------------------------|
| `index.tsx` | The public entry. For S and Sp components, the server or shared markup; for C components and connectors, re-exports only | No `'use client'`, no hooks except `useId` and `use`, no import of `./hook.js`. Required |
| `client.tsx` | Only the interactive parts | First line is `'use client'`. Markup plus at most one call to `useXxx()` from `hook.ts` |
| `hook.ts` | The component's state, effects and handlers | Returns a plain object, contains no JSX, imported only by `client.tsx` |
| `lib.ts` | Pure helpers, unit-tested | No React imports; called by `hook.ts` and `index.tsx` |
| `variants.ts` | cva class definitions | Exported, so other elements can reuse the look (a link styled as a button) |
| `schema.ts` | Zod schema of the design props, with min/max | Imports `constants.ts`; components import it with `import type` only |
| `types.ts` | Every type the component exposes: the unions derived from `constants.ts`, the design props derived from `schema.ts`, and the public prop interfaces | Types only, so the file erases completely. No runtime value, no TypeScript `enum` |
| `constants.ts` | Data constants: the `as const` value lists, the limits and the defaults shared by the schema, cva and the component | No classes, no Zod, no types |
| `classes.ts` | Component-specific class constants, only when the shared ones are not enough | Imported by `variants.ts` |
| `skeleton.tsx` | Skeleton with the same dimensions as the real component | Usable as a `<Suspense fallback>`; layout shift must be zero. Never named `loading.tsx`: Next.js reserves that name in `app/` |
| `states.tsx` | Default error and empty states | Data components only; overridable by props. Never named `error.tsx`: in `app/` that name must be a Client Component |
| `demos/<name>.tsx` | One demo per file, default export; `demos/index.ts` is generated | The single source for docs, visual tests and the playground |
| `parts/` | One sub-part per file when the contract is not enough | Each file exports one component named after the file |
| `meta.ts` | Name, category, tier, status, Base UI primitive, optional deps, verified Base UI version range | Feeds the docs navigation and a generated `registry.json` after v0.1 |
| `index.test.tsx` | Unit and accessibility tests | Required |

## 8.2 The state contract

Data-bearing components (Table, DataTable, Select with remote options, Combobox, Command, TreeView, FileUpload, lists) share one contract:

```typescript
// shared/contracts/state.ts
import type { ReactNode } from 'react'

export interface StateProps {
  status?: 'idle' | 'loading' | 'loading-more' | 'error' | 'empty' | undefined
  loadingFallback?: ReactNode
  errorFallback?: ReactNode
  emptyFallback?: ReactNode
  /** Client-only, or a Server Action. A plain function from a Server Component throws at render. */
  onRetry?: (() => void | Promise<void>) | undefined
}
```

Defaults come from the component's own `skeleton.tsx` and `states.tsx`. Simple controls get a plain `loading` boolean (Button shows a spinner and sets `aria-busy`). With Server Components the same skeleton is used as `<Suspense fallback={<TableSkeleton rows={5} />}>`, which streams content in without layout shift.

`status: 'loading-more'` belongs to the collection contract (8.5): it renders a trailing skeleton row while the next page loads, without replacing the rows already shown.

**Render errors are separate from data status.** A cell renderer that throws unmounts the nearest boundary, which in Next.js is the route segment. Every data component and every connector wraps its interactive part in `ErrorBoundary` (a class component, because only class components can catch render errors) whose default fallback is `ErrorState` with a retry that remounts the children by key, plus an `onError` for reporting. It does not replace the app's route-level `error.tsx`.

## 8.3 Constants, schema, types

Three files, one direction of flow, so a value is declared exactly once:

```text
constants.ts  the values          (runtime, no types, no Zod)
     v
schema.ts     the Zod schema      (imports constants; the only file that imports Zod)
     v
types.ts      every type          (derives from both; erases completely)
     v
index.tsx / client.tsx / variants.ts / hook.ts
```

The Zod schema describes the design-prop subset that must be machine-editable: the playground controls, the generated `registry.json`, the future editor's inspector panel and AI tool definitions. The **public props table** is generated from the emitted `.d.ts`, because that is the type users actually consume and it includes `className`, `render`, `children` and every inherited HTML or Base UI prop; the schema supplies the defaults and the limits.

**Value lists are `as const` arrays, never a TypeScript `enum`.** An `enum` is a runtime value: it survives compilation into the bundle, it does not tree-shake, and Node's type stripping rejects it outright. An `as const` array gives the same closed set, feeds `z.enum()` directly, and disappears from the types layer.

The shared size list lives in one place for the whole library:

```typescript
// shared/contracts/size.ts
import { z } from 'zod'

export const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const
export const sizeSchema = z.enum(SIZES)
export type Size = (typeof SIZES)[number]
```

```typescript
// components/button/constants.ts
export const BUTTON_VARIANTS = ['solid', 'soft', 'outline', 'ghost', 'link'] as const
export const BUTTON_TONES = ['primary', 'neutral', 'danger'] as const
export const BUTTON_DEFAULTS = { variant: 'solid', tone: 'primary', size: 'md' } as const
```

```typescript
// components/button/schema.ts
import { z } from 'zod'
import { sizeSchema } from '../../shared/contracts/size.js'
import { BUTTON_DEFAULTS, BUTTON_TONES, BUTTON_VARIANTS } from './constants.js'

export const buttonSchema = z.object({
  variant: z.enum(BUTTON_VARIANTS).default(BUTTON_DEFAULTS.variant),
  tone: z.enum(BUTTON_TONES).default(BUTTON_DEFAULTS.tone),
  size: sizeSchema.default(BUTTON_DEFAULTS.size),
  loading: z.boolean().default(false),
  fullWidth: z.boolean().default(false),
})
```

```typescript
// components/button/types.ts
import type { ComponentPropsWithRef, ReactElement } from 'react'
import type { z } from 'zod'
import type { BUTTON_TONES, BUTTON_VARIANTS } from './constants.js'
import type { buttonSchema } from './schema.js'

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number]
export type ButtonTone = (typeof BUTTON_TONES)[number]

/** z.input keeps fields that have defaults optional, which is what props need. */
export type ButtonDesignProps = z.input<typeof buttonSchema>

export interface ButtonProps extends ComponentPropsWithRef<'button'>, ButtonDesignProps {
  /** Render as another element, for example a framework link. */
  render?: ReactElement | undefined
}

export type ButtonSkeletonProps = Pick<ButtonDesignProps, 'size' | 'fullWidth'> & {
  className?: string | undefined
}
```

Every import in `types.ts` is an `import type`, including the one from `schema.ts`, so the whole file erases at compile time and Zod never reaches a bundle. `index.tsx` and `client.tsx` import their types from `./types.js` and never redeclare a prop interface inline; `variants.ts` and `hook.ts` do the same. One file to open to see a component's whole public surface.

Limits use the same constants so the schema and the runtime clamp can never disagree:

```typescript
// components/progress/constants.ts
export const PROGRESS_MIN = 0
export const PROGRESS_MAX = 100
```

```typescript
// components/progress/schema.ts
import { z } from 'zod'
import { sizeSchema } from '../../shared/contracts/size.js'
import { PROGRESS_MAX, PROGRESS_MIN } from './constants.js'

export const progressSchema = z.object({
  value: z.number().min(PROGRESS_MIN).max(PROGRESS_MAX).default(0),
  size: sizeSchema.default('md'),
})
```

Rules that follow from Zod 4:

- Prop descriptions live in the schema with `.meta({ description })`, which is copied into the JSON Schema output. Metadata belongs to one schema instance, so `.meta()` must be the last call in a chain: `sizeSchema.default('md').meta({ description: 'Control height' })`. Calling `.default()` after `.meta()` returns a new instance without the metadata.
- Generate with `z.toJSONSchema(schema, { io: 'input' })`. The default output describes the *output* type, in which defaulted fields are required; `io: 'input'` keeps them optional and emits `.default()` values as the JSON Schema `default` keyword.
- `zod` is a required peer dependency (section 4): the emitted `.d.ts` chain references it, and without it installed a consumer's `ButtonProps` silently loses every design prop. The Phase 7 fresh-app test runs `tsc --noEmit` in that app and asserts `<Button variant="nope" />` is a type error.
- Props a schema cannot express (`children`, event handlers, `ref`, `render`) are added in the TypeScript interface.

## 8.4 Full example: Button

Button needs no `client.tsx`, no `hook.ts` and no `states.tsx`, so those files do not exist.

```typescript
// components/button/variants.ts
import { cva } from 'class-variance-authority'
import { BORDER, CONTROL_SIZE, FOCUS_RING, HOVER, TOUCH_TARGET, TRANSITION } from '../../shared/classes.js'
import { BUTTON_DEFAULTS } from './constants.js'

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium',
    'rounded-control border-transparent',
    'disabled:pointer-events-none disabled:opacity-50 aria-busy:opacity-100 aria-busy:cursor-progress',
    BORDER,
    FOCUS_RING,
    TOUCH_TARGET,
    TRANSITION,
  ],
  {
    variants: {
      variant: {
        solid: `bg-primary-solid text-primary-on-solid ${HOVER.solid}`,
        soft: `bg-primary-soft text-primary-on-soft ${HOVER.soft}`,
        outline: `border-line-strong text-body ${HOVER.outline}`,
        ghost: `text-body ${HOVER.ghost}`,
        link: `text-primary-on-soft underline-offset-4 ${HOVER.link}`,
      },
      size: CONTROL_SIZE,
      fullWidth: { true: 'w-full' },
    },
    defaultVariants: { variant: BUTTON_DEFAULTS.variant, size: BUTTON_DEFAULTS.size },
  },
)
```

The example shows the `primary` tone only. Tones are implemented as cva compound variants (`variant` x `tone`) that set `--tc-hover`, `--tc-active` and `--tc-soft-hover` and swap the matching `-soft`, `-fg` and `-text` tokens, so the hover classes themselves never change.

```typescript
// components/button/index.tsx
// No 'use client': a Server Component by default, and it becomes part of the
// client bundle only when a client file imports it.
import { spinner } from '@topclassui/icons/spinner'
import { cn } from '../../shared/cn.js'
import { renderElement } from '../../shared/render.js'
import { Svg } from '../svg/index.js'
import type { ButtonProps } from './types.js'
import { buttonVariants } from './variants.js'

export function Button({
  variant = 'solid',
  size = 'md',
  loading = false,
  fullWidth = false,
  type = 'button',
  disabled,
  className,
  children,
  render,
  ...rest
}: ButtonProps) {
  const content = (
    <>
      {loading ? <Svg icon={spinner} className="animate-spin motion-reduce:animate-none" /> : null}
      {children}
    </>
  )

  return renderElement(render ?? <button type={type} />, {
    disabled: disabled || loading,
    'aria-busy': loading || undefined,
    'data-loading': loading ? '' : undefined,
    'data-variant': variant,
    'data-size': size,
    className: cn(buttonVariants({ variant, size, fullWidth }), className),
    children: content,
    ...rest,
  })
}

export { buttonVariants }
export { ButtonSkeleton } from './skeleton.js'
export type { ButtonProps, ButtonDesignProps, ButtonTone, ButtonVariant } from './types.js'
```

```typescript
// components/button/skeleton.tsx
import { cn } from '../../shared/cn.js'
import type { ButtonSkeletonProps } from './types.js'

const SIZES = {
  xs: 'h-control-xs w-16',
  sm: 'h-control-sm w-20',
  md: 'h-control-md w-24',
  lg: 'h-control-lg w-28',
  xl: 'h-control-xl w-32',
  custom: '',
} as const

export function ButtonSkeleton({ size = 'md', fullWidth = false, className }: ButtonSkeletonProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'block animate-pulse rounded-control bg-surface motion-reduce:animate-none',
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
    />
  )
}
```

```typescript
// components/button/demos/variants.tsx
import { Button } from '../index.js'

export default function Demo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button>Save</Button>
      <Button variant="soft">Draft</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">Skip</Button>
    </div>
  )
}
```

```typescript
// components/button/demos/index.ts  (generated by pnpm new:component and pnpm demos:index)
export const demos = {
  variants: () => import('./variants.js'),
  sizes: () => import('./sizes.js'),
  loading: () => import('./loading.js'),
} as const
```

One demo per file, because the docs read the file itself at build time and show it in the code tab; a closure inside an object literal has no readable source. The docs rewrite `../index.js` to `@topclassui/react/button` with a three-line regex so users see what they would type.

```typescript
// components/button/meta.ts
import type { ComponentMeta } from '../../shared/meta.js'

export const meta = {
  name: 'Button',
  slug: 'button',
  category: 'actions',
  tier: 1,
  status: 'beta',
  rendering: 'server',      // 'server' | 'split' | 'client'
  baseUi: null,
  baseUiRange: null,
  optionalDeps: [],
} satisfies ComponentMeta
```

For SEO, navigation must be a real link, not a button with a click handler: `<Button render={<Link href="/docs" />}>Docs</Button>` renders an `<a>` with the button look and 0 KB of client JavaScript.

## 8.5 The collection contract

Every component that renders a list of items - Select, MultiSelect, Combobox, Autocomplete, Command, Dropdown, ContextMenu and Menubar items, TagsInput suggestions, TreeView, Table, DataTable, VirtualList, LoadMore, Carousel, the FileUpload file list, Timeline, the icons page grid, LayersPanel - shares one contract and one hook, so behaviour is identical everywhere.

```typescript
// shared/contracts/collection.ts
import type { StateProps } from './state.js'

export interface CollectionProps<T> extends StateProps {
  items: readonly T[]
  /** Stable identity across pages. */
  getKey: (item: T) => string
  /** Rows before scrolling; defaults to the --tc-list-rows knob. */
  visibleRows?: number | undefined
  /** 'auto' turns windowing on above collection.virtualizeAbove. */
  virtualize?: 'auto' | boolean | undefined
  estimateRowHeight?: number | undefined
  hasMore?: boolean | undefined
  /** Client-only, or a Server Action. Called once when the window nears the end. */
  loadMore?: (() => void | Promise<void>) | undefined
  loadMoreThreshold?: number | undefined
  /** The selected value's item when it is not in the loaded pages. */
  selectedItem?: T | undefined
}
```

- **The knob.** `--tc-list-rows: 7` sets how many rows a list shows before it scrolls, next to radius and density. `visibleRows` overrides it per instance by setting the variable inline. Precedence: the `visibleRows` prop, then `collection.visibleRows` on `TopClassProvider`, then the CSS knob; a server-rendered list reads only the CSS knob, because the provider is client-side. Popups still clamp to Base UI's `--available-height`, so the knob is a maximum, not a fixed height.
- **Windowing.** `shared/collection/use-collection.ts` wraps TanStack Virtual (an optional peer, loaded only by the components that use it). It renders the rows in view plus an overscan, recycles rows on scroll, measures variable heights, and exposes `scrollToKey` and `scrollToIndex`, both taking `{ block: 'nearest' | 'center' | 'start' }`. Above `virtualizeAbove` (default 200) it is on automatically; below it, rows are plain DOM. It follows Base UI's own virtualisation example for Select and Combobox, and a Phase 4 keyboard test proves `aria-activedescendant` tracks rows that are not mounted.
- **Incremental loading.** When `hasMore` is true and the window reaches `loadMoreThreshold` rows from the end (default 10), the hook calls `loadMore()` once, sets `status: 'loading-more'`, and does not call it again until `items` grows or the promise rejects. The app owns the fetching, the cursor and the cache; the component only asks. `LoadMore` and paginated server lists keep a real `href` for the next page so crawlers and users without JavaScript reach every item.
- **Edge cases every collection component handles, and tests:** ten thousand items with `virtualize: 'auto'` keep fewer than a hundred rows in the DOM at any time with stable memory; a rejected `loadMore` shows `status: 'error'` at the tail with a retry row from `labels.retry` and keeps the loaded rows; a `loadMore` still in flight while the user filters is discarded by request id; a `selectedItem` outside the loaded pages still shows its label on the trigger, never a blank; duplicate keys across pages warn in development and the second occurrence is dropped; an empty first page is `status: 'empty'`; Home, End, PageUp, PageDown and type-ahead work over rows that are not mounted, because the hook scrolls first and then focuses; `aria-setsize` and `aria-posinset` reflect the total when it is known, and `aria-busy` is set while loading more; horizontal lists mirror their scroll direction in RTL; scroll position survives a page being prepended or the list re-rendering; very tall rows use measured heights, not estimates; the server-rendered first page is real HTML and hydrates without re-rendering.
- **Per component:** Select, Combobox, Autocomplete and Command show `visibleRows` rows, window above the threshold and page on scroll and on search (a new query restarts the pages); Dropdown and ContextMenu stay small by design but window above the threshold too; DataTable and Table window their rows and use either `loadMore` or `Pagination`, never both; TreeView's collection is its flattened visible nodes; Carousel's `slidesPerView` is the visible-rows knob on the horizontal axis; the FileUpload file list and the TagsInput suggestion popup are collections.

# 9. The server / client split in depth

## 9.1 The pattern: client shell, server children

The client file holds only the interaction. The content is rendered on the server and passed in as `children`, so it is real HTML for search engines and costs no JavaScript.

```typescript
// components/accordion/client.tsx
'use client'

import type { ReactNode } from 'react'
import { Accordion as Base } from '@base-ui/react/accordion'
import { caretDown } from '@topclassui/icons/caret-down'
import { cn } from '../../shared/cn.js'
import { Svg } from '../svg/index.js'

export type AccordionRootProps = Omit<Base.Root.Props, 'className'> & { className?: string | undefined }

export function AccordionRoot({ className, ...rest }: AccordionRootProps) {
  return (
    <Base.Root
      className={cn('divide-y divide-line rounded-box border border-line', className)}
      {...rest}
    />
  )
}

const TRIGGER =
  'group flex w-full items-center justify-between gap-4 px-4 py-3 text-start font-medium'

interface AccordionItemProps {
  value: string
  title: ReactNode
  children: ReactNode
}

export function AccordionItem({ value, title, children }: AccordionItemProps) {
  return (
    <Base.Item value={value}>
      <Base.Header>
        <Base.Trigger className={TRIGGER}>
          {title}
          <Svg icon={caretDown} className="transition-transform group-data-panel-open:rotate-180" />
        </Base.Trigger>
      </Base.Header>
      {/* hiddenUntilFound keeps closed content in the DOM: findable with Ctrl+F and indexable. */}
      <Base.Panel hiddenUntilFound className="px-4 pb-4 text-muted">
        {children}
      </Base.Panel>
    </Base.Item>
  )
}
```

`AccordionRootProps` is derived from Base UI's own props at the seam rather than retyped, so `multiple`, `value`, `onValueChange` and every prop a future Base UI version adds are available without the library copying a list that then drifts. Consumers only ever see the TopClass name.

```typescript
// components/accordion/index.tsx  (Server Component)
import type { ReactNode } from 'react'
import { AccordionItem, AccordionRoot } from './client.js'

export interface AccordionEntry {
  id: string
  title: ReactNode
  /** May be an async Server Component that fetches its own data. */
  content: ReactNode
}

export function Accordion({ items }: { items: AccordionEntry[] }) {
  return (
    <AccordionRoot>
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id} title={item.title}>
          {item.content}
        </AccordionItem>
      ))}
    </AccordionRoot>
  )
}

export { AccordionItem, AccordionRoot }
export type { AccordionRootProps } from './client.js'
```

Both the data-driven `Accordion` (easy path) and the parts (`AccordionRoot`, `AccordionItem`, full control) are exported. Every compound component offers both.

## 9.2 Rules and traps

1. `'use client'` is the first line of `client.tsx`. Nothing above it except comments.
2. A file with no directive is a *shared* component: server when imported from a server file, client when imported from a client file. That is why Button works everywhere. Shared files must not use anything server-only or client-only, and they import icons explicitly rather than through `<Icon name>`.
3. **Do not dot into a client module from a server file.** React's client-module proxy allows one level of property access: `mod.Dialog` is a client reference, but `Dialog.Root` throws `Cannot access Dialog.Root on the server. You cannot dot into a client module from a server component. You can only pass the imported name through.` Export flat names. Using Base UI's own `Accordion.Root` namespace *inside* `client.tsx` is fine, because that file is already client code.
4. Only serializable props cross the boundary: strings, numbers, booleans, plain objects, arrays, `ReactNode` children. No functions, except Server Actions. Every optional callback in a shared contract (`MenuItem.onSelect`, `StateProps.onRetry`, `CollectionProps.loadMore`) is documented as client-only or Server Action, and the docs props table shows a "client only" badge for it.
5. Context does not exist in the Server Component render (rule D6). It does exist inside client trees, including when those trees are server-side rendered.
6. `index.tsx` for a C component or a connector is re-exports only; it still exists, because `exports` resolves `*/index.js`.
7. Heavy client parts (Command, DatePicker, ColorPicker) are loaded lazily and mounted when first opened, not on page load.
8. Overlay content that matters for SEO stays in the HTML: accordion panels use `hiddenUntilFound`, tab panels need `<Tabs.Panel keepMounted>` because Base UI unmounts inactive panels by default. Overlay content that does not matter (menus, dialogs) is not mounted until opened, which is Base UI's default.
9. `pnpm check:boundaries` parses every `index.tsx` and fails if it contains `'use client'`, imports a React client hook other than `useId` or `use`, or imports `./hook.js`.

# 10. Overlays and floating elements

## 10.1 Never cut off by the screen

Base UI's Positioner (built on Floating UI) flips, shifts and resizes popups. Its API is two props, `side` and `align`, not a single placement string. TopClass UI exposes one `placement` prop and maps it once, so app code stays logical and every floating component behaves the same.

```typescript
// shared/floating.ts
export type Placement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'start' | 'start-start' | 'start-end'
  | 'end' | 'end-start' | 'end-end'

/** Base UI takes side + align; start/end map to the logical inline sides. */
export function toSideAlign(placement: Placement) {
  const [s, a = 'center'] = placement.split('-') as [string, 'start' | 'end' | 'center']
  const side = s === 'start' ? 'inline-start' : s === 'end' ? 'inline-end' : s
  return { side, align: a } as const
}

export const FLOATING = {
  placement: 'bottom-start' as Placement,
  sideOffset: 8,
  collisionPadding: 8,
} as const
```

`align` and the `inline-*` sides are logical and flip in RTL automatically, so a menu written as `placement="bottom-start"` opens on the correct side in both directions. Base UI's own defaults are `sideOffset: 0` and `collisionPadding: 5`, so the values above are a deliberate override. Collision behaviour is `collisionAvoidance={{ side, align, fallbackAxisSide }}`; Base UI defaults to `{ fallbackAxisSide: 'end' }` for popovers and tooltips and `{ fallbackAxisSide: 'none' }` for dropdowns, and TopClass UI only overrides it where a component needs something different. `Select.Positioner` sets `alignItemWithTrigger={false}`, because its default aligns the selected item with the trigger and ignores `side`, `align` and `sideOffset`.

Base UI sets these custom properties as inline styles on every Positioner element: `--available-height`, `--available-width`, `--anchor-height`, `--anchor-width`, `--positioner-height`, `--positioner-width` and `--transform-origin`. Custom properties inherit, so the Popup reads them directly, which is what `POPUP_BOUNDS` does. The Popup itself also exposes `--popup-width` and `--popup-height`, used when animating between different content. With `max-h-(--available-height)` a long menu near the bottom of the screen flips upward, and if there is still not enough room it shrinks and scrolls instead of overflowing.

Components that use these defaults: Tooltip, Popover, HoverCard, Dropdown, ContextMenu, Menubar, NavigationMenu, Select, Combobox, Autocomplete, DatePicker, ColorPicker.

## 10.2 Solved once for all overlays

- One portal layer and a small z-index scale; `TopClassProvider` renders the isolation root (`<div class="tc-root" style="isolation:isolate">`), which is what Base UI recommends so that app z-indexes can never climb above the portal layer.
- Scroll lock, focus trap, focus return to the trigger, Escape, outside click, nested overlays (from Base UI).
- Logical placement through `placement` (10.1), so RTL is automatic. The one exception is gestures: Base UI's swipe directions are physical, so Drawer and Toast compute theirs from `useDirection()`.
- iOS: `dvh` heights, `env(safe-area-inset-*)` padding on Drawer and Toast, and bottom drawers that contain inputs are wrapped in Base UI's `Drawer.VirtualKeyboardProvider` so the virtual keyboard does not cover them.
- Enter and exit transitions scaled by `--tc-motion`, always animating opacity (5.8).

## 10.3 Toast

Built on Base UI Toast.

**Provided by Base UI, configure only:** `Toast.Provider limit={3} timeout={5000}`; pausing on hover, on keyboard focus and on window blur; F6 to jump into the viewport; the `role="region" aria-live="polite"` viewport with a visually hidden `role="alert"` copy for high-priority toasts; `swipeDirection`; and the manager API `add`, `update`, `close` and `promise`.

**Built by TopClass UI:** the logical viewport position (default `bottom-end`) in CSS, safe-area padding, the stacking styles driven by `--toast-index` and `--toast-offset-y`, tones, the optional action button, and a `Toast.Close` button that is always rendered, because a swipe is a drag gesture and WCAG 2.5.7 requires an alternative.

Two details the API does not make obvious: Base UI does not queue past `limit` - the oldest toasts get `data-limited` and stay mounted, so TopClass UI hides or animates them out; and `swipeDirection` is physical, defaulting to `['down', 'right']`, so TopClass UI passes `['down', dir === 'rtl' ? 'left' : 'right']`.

`toast` is `Toast.createToastManager()` exported from `@topclassui/react/toast` and passed as `toastManager` to the provider, which is how `toast.promise(...)` and `toast.update(id, ...)` work from any function outside React.

## 10.4 Tooltip

A provider groups delays so moving between tooltips feels instant: `Tooltip.Provider` takes `delay`, `closeDelay` and `timeout` (400 ms by default: another tooltip opens instantly if the previous one closed inside that window). Base UI's per-trigger defaults are 600 ms to open and 0 ms to close.

Base UI disables tooltips on touch devices, because there is no discoverable way to reveal one before tapping. Every tooltip trigger therefore also carries an `aria-label` matching the tooltip text, and `AdaptiveTooltip` (section 11) switches on input modality rather than width.

## 10.5 Scrolling

Every component follows these rules, and the class constants come from `shared/classes.ts` so no component writes its own.

1. **Popups** (Dropdown, Menu, Select, Combobox, Autocomplete, Command, Popover, HoverCard, DatePicker, ColorPicker): `POPUP_BOUNDS` and the `--tc-list-rows` cap, whichever is smaller. The list scrolls; the popup chrome (search input, header, footer, an "Apply" row) sits outside the scroll container and stays fixed. On open, the selected or active item is scrolled into view with `block: 'nearest'`, and keyboard navigation keeps the active item visible without moving the page. A submenu never scrolls its parent.
2. **Tooltip:** never scrolls. It is one or two lines of plain text with a `max-w-xs` and wrapping. Content that would need scrolling, or that contains links or controls, is a Popover; the lint rule `tooltip-content-is-text` enforces it. A tooltip whose anchor scrolls out of view closes, using the positioner's `data-anchor-hidden`.
3. **Dialog and AlertDialog:** `max-h-[calc(100dvh-2*var(--tc-overlay-inset))]`. The body scrolls; the header and footer are sticky inside the popup. The page behind is locked by Base UI and keeps its scrollbar gutter, so the layout does not shift (`scrollbar-gutter: stable` on `html`, set once in the tokens file).
4. **Drawer:** full height on its axis (`h-dvh` for side drawers, `max-h-[90dvh]` for bottom sheets, with Base UI snap points). The body scrolls, the header and footer are sticky, `env(safe-area-inset-*)` padding applies, and `overscroll-behavior: contain` stops a scroll at the end of the sheet from moving the page behind. Swipe-to-close starts only from the handle (`Drawer.SwipeArea`), never from the scrolling body, and bottom sheets with inputs use `Drawer.VirtualKeyboardProvider`.
5. **Every scroll container inside an overlay** sets `overscroll-behavior: contain`, so nested scroll areas (a Select inside a Dialog inside a Drawer) each stop chaining at their own edge.
6. **ScrollArea** is the one component that draws custom scrollbars (Base UI ScrollArea, with Tailwind's `scrollbar-*` utilities as a fallback), used by Command, Sidebar, TableOfContents, the icons grid and DataTable. Everything else uses native scrollbars, which sit at the start edge in RTL automatically. Components never reserve space for a scrollbar with padding.
7. **Horizontal scrolling** (scrollable Tabs, Carousel, Toolbar overflow, a wide Table): `SCROLL_X`, with `scroll-snap-type: x mandatory` where the items are discrete. Keyboard arrows move the selection and scroll it into view, edge fades signal overflow, and the axis mirrors in RTL through `--tc-dir`. A wide Table scrolls inside a `Table.Scroll` wrapper with a sticky first column (`inset-s-0`) and a sticky header row.
8. **Sticky and fixed bars** (Navbar, BottomNav, AdaptiveActions, the Toast viewport, Toolbar): `STICKY_EDGE` plus safe-area padding, and the bar sets `--tc-sticky-top` or `--tc-sticky-bottom` to its own height. The page's scroll container reads those into `scroll-padding-block`, so a focused element or an `#anchor` target is never hidden behind a bar (WCAG 2.4.11). This includes the docs site's own header and table of contents.
9. **Windowed lists** (8.5): recycling never resets the scroll position, prepending a page preserves the visual position, and `scrollToIndex` and `scrollToKey` are the only programmatic scroll APIs.
10. **Page level:** the docs app sets `scroll-behavior: smooth` only under `prefers-reduced-motion: no-preference`, restores the scroll position on back navigation, and never sets `overflow: hidden` on `body` outside Base UI's scroll lock.
11. **Tests:** every overlay demo has a Playwright test that opens it with the trigger near all four viewport edges and a sixty-item list, asserting that the popup is fully inside the viewport, that the list scrolls internally, that the page behind did not scroll, and, on mobile emulation, that a scroll at the end of a Drawer body does not move the page. The sticky-bar test focuses the last link before a sticky footer and asserts it is fully visible.

# 11. Connectors (adaptive components)

## 11.1 The idea

Every component can be used on its own. A connector joins two components that solve the same task on different devices, and picks the right one automatically. App code never writes `if (isMobile)` again, and desktop and mobile stay consistent because they are driven by the same props.

## 11.2 The three rules

1. **Shared contract.** Both sides accept exactly the same props type, including `size` and, for overlays, `open`, `defaultOpen` and `onOpenChange`. The serializable part of the contract is a Zod schema in `shared/contracts/`. A mobile side accepts every contract prop; it may clamp one to its own minimum (a Drawer row is never smaller than `md`) but never rejects it.
2. **Overlays decide in JavaScript at open time.** The trigger is the same element on both sides, rendered once. `createAdaptive` reads the current mode when `onOpenChange(true)` fires and holds that choice until the overlay closes, so resizing across the breakpoint never remounts an open overlay. An overlay is closed on first render, so the server HTML and the client HTML are identical: no hydration mismatch and no flash.
3. **Layout decides in CSS on a single DOM.** Table to cards is container-query CSS on the same markup. Never render both versions: duplicated content is bad for SEO, accessibility and performance.

## 11.3 Code

```typescript
// shared/contracts/menu.ts
import type { ReactElement } from 'react'
import type { IconName } from '@topclassui/icons'
import { z } from 'zod'
import { sizeSchema } from './size.js'

export const menuItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  href: z.string().optional(),
  shortcut: z.string().optional(),
  tone: z.enum(['neutral', 'danger']).default('neutral'),
  disabled: z.boolean().default(false),
  separatorBefore: z.boolean().default(false),
})

/** Components import these types with `import type`, so Zod is not bundled. */
export type MenuItem = Omit<z.input<typeof menuItemSchema>, 'icon'> & {
  icon?: IconName | undefined
  /** Client-only: a plain function cannot cross the server/client boundary. */
  onSelect?: (() => void) | undefined
  /** The server-side equivalent of onSelect. */
  action?: ((formData: FormData) => void | Promise<void>) | undefined
}

/** The contract both DropdownMenu and DrawerMenu must accept. */
export interface MenuContract {
  trigger: ReactElement
  title: string
  items: MenuItem[]
  size?: z.input<typeof sizeSchema> | undefined
  open?: boolean | undefined
  defaultOpen?: boolean | undefined
  onOpenChange?: ((open: boolean) => void) | undefined
}
```

```typescript
// shared/adaptive/use-adaptive-mode.ts
'use client'

import { createContext, useCallback, useContext, useSyncExternalStore } from 'react'

export type AdaptiveMode = 'desktop' | 'mobile'

/** TopClassProvider overrides this value from its `adaptive.query` prop. */
export const AdaptiveQueryContext = createContext('(width < 48rem)')

export function useAdaptiveMode(force: AdaptiveMode | 'auto' = 'auto', query?: string): AdaptiveMode {
  const contextQuery = useContext(AdaptiveQueryContext)
  const media = query ?? contextQuery

  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(media)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [media],
  )

  const isMobile = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(media).matches,
    () => false, // server snapshot: hydrate as desktop, then correct
  )

  if (force !== 'auto') return force
  return isMobile ? 'mobile' : 'desktop'
}
```

```typescript
// shared/adaptive/create-adaptive.tsx
'use client'

import { useState, type ComponentType } from 'react'
import { type AdaptiveMode, useAdaptiveMode } from './use-adaptive-mode.js'

export function createAdaptive<P extends object>(
  Desktop: ComponentType<NoInfer<P>>,
  Mobile: ComponentType<NoInfer<P>>,
  options: { query?: string | undefined } = {},
) {
  return function Adaptive(props: P & { mode?: AdaptiveMode | 'auto' | undefined }) {
    const { mode = 'auto', ...rest } = props
    const live = useAdaptiveMode(mode, options.query)
    const [latched, setLatched] = useState<AdaptiveMode | null>(null)
    const resolved = latched ?? live
    const Comp = resolved === 'mobile' ? Mobile : Desktop

    // Latched while open, so a resize never swaps an open overlay.
    const onOpenChange = (open: boolean) => {
      setLatched(open ? live : null)
      ;(rest as { onOpenChange?: (o: boolean) => void }).onOpenChange?.(open)
    }

    return <Comp {...(rest as P)} onOpenChange={onOpenChange} />
  }
}
```

```typescript
// connectors/adaptive-menu/client.tsx
'use client'

import { DropdownMenu } from '../../components/dropdown/client.js'
import { DrawerMenu } from '../../components/drawer/client.js'
import { createAdaptive } from '../../shared/adaptive/create-adaptive.js'
import type { MenuContract } from '../../shared/contracts/menu.js'

export const AdaptiveMenu = createAdaptive<MenuContract>(DropdownMenu, DrawerMenu)
```

```typescript
// connectors/adaptive-menu/index.tsx  (the public entry; re-exports only)
export { AdaptiveMenu } from './client.js'
export type { MenuContract, MenuItem } from '../../shared/contracts/menu.js'
```

`createAdaptive` is always called with the contract type spelled out. `NoInfer` stops TypeScript from inferring `P` from the two components: without it, both parameters are inference sites, TypeScript picks the common subtype, and a mobile-only required prop is silently promoted into the connector's public API for every caller. With the explicit type argument the compiler guarantees that each side **accepts** every contract prop - a side that requires a prop outside the contract, or types one differently, does not compile, and forgetting the type argument fails too. It cannot prove that a side *honours* a prop; that is what the connector demos do, by rendering every demo with `mode="desktop"` and `mode="mobile"` in the visual matrix.

Per rule 5.12 the body of `createAdaptive` lives in `shared/adaptive/`, which is the library's own hook module; a component's own logic lives in its `hook.ts`.

The breakpoint is configured once in `<TopClassProvider adaptive={{ query: '...' }}>` and can combine width with `(pointer: coarse)`. A connector may override it with its own query, and every connector also takes a `mode` prop (`'auto' | 'desktop' | 'mobile'`) for overrides and for tests.

## 11.4 Connector list

| Connector | Desktop | Mobile | Strategy |
|-----------------------|-------------------|---------------------------|----------|
| AdaptiveMenu | Dropdown | Drawer action sheet | JS at open |
| AdaptiveSelect | Select popup | Drawer list | JS at open |
| AdaptiveCombobox | Combobox popup | Full-height Drawer with search | JS at open |
| AdaptiveDialog | Dialog | Bottom Drawer | JS at open |
| AdaptivePopover | Popover | Bottom Drawer | JS at open |
| AdaptiveTooltip | Tooltip on hover | Popover on tap | JS; query `(hover: none), (pointer: coarse)` |
| AdaptiveDatePicker | Popover calendar | Drawer calendar | JS at open |
| AdaptiveContextMenu | Right-click menu | Long-press Drawer | JS; query `(pointer: coarse)` |
| AdaptiveSidebar | Fixed sidebar | Side Drawer | CSS + JS |
| AdaptiveNav | Navbar with links | Hamburger Drawer or BottomNav | CSS + JS |
| AdaptiveFilters | Filter sidebar | Drawer with "Apply" | CSS + JS |
| AdaptiveTabs | Tabs | Scrollable tabs | CSS |
| AdaptiveTable | Table | Stacked cards | CSS |
| AdaptivePagination | Full page list | Compact prev/next | CSS |
| AdaptiveActions | Inline buttons | Sticky bottom action bar | CSS |
| AdaptiveToolbar | Full toolbar | Overflow "more" menu | JS |

# 12. Forms

Base UI's Field parts are client components that wire ids through React context, and `useActionState` is a hook. A server-rendered native `<input>` can therefore never register with a client `Field.Root`, and no hook can live in `index.tsx`. Field and Form are each split into two halves, and the plan says which half to use.

- **Field** wires `<label for>`, `aria-describedby` for hint and error, `aria-invalid`, the required marker and the error text.
  - `field/index.tsx` (server, no context) renders the label, hint, error and required marker, derives deterministic ids from the required `name` (`tc-f-${name}`, `tc-f-${name}-hint`, `tc-f-${name}-err`, or `useId` when a name cannot be stable) and passes them to the control through a render-prop child that runs on the server:

    ```typescript
    <Field name="email" label="Email" hint="We never share it" error={errors.email}>
      {(control) => <Input type="email" {...control} />}
    </Field>
    ```

    where `control` is `{ id, name, required, 'aria-describedby', 'aria-invalid' }`. This is what gives a server-rendered form 0 KB of JavaScript. `Input` therefore requires `id` or `aria-label` in its types, so an Input outside a Field is a type error.
  - `field/client.tsx` (`FieldLive`) wraps Base UI's `Field.Root`, `Field.Label`, `Field.Description` and `Field.Error` for forms validated in the browser.
- **Form.** `form/index.tsx` (server) renders a plain `<form action={serverAction}>` with server Fields, which covers create, contact and newsletter forms. When server errors must appear without a page reload, `form/hook.ts` (`useFormAction`) calls `useActionState(action, initialState, permalink)` and returns `{ state, formAction }`, and `form/client.tsx` (`FormAction`) renders Base UI's `<Form errors={state.errors}>` with `FieldLive` children. Base UI's `errors` prop is an object keyed by each `Field.Root` `name`, and it clears an entry once that field's value changes. The `permalink` argument is passed so a submit before hydration still lands on the right page.
- **Progressive enhancement, stated precisely.** Every control carries a native `name` and a hidden or real input, so a `<form action={serverAction}>` always submits a valid value. Only native controls (Input, Textarea) are *operable* before hydration: Base UI's Checkbox, RadioGroup, Switch, Select, Slider and NumberField render a `<span>` or `<button>` plus a hidden input, so before hydration they submit their default value but cannot be changed. The Base UI docs say so on each of those component pages.
- **react-hook-form adapter** (optional peer, tier 2): `FormField` connects RHF's `control` to any TopClass control; validation uses the app's own Zod schemas through the standard resolver, so the same schema validates in the browser and in the Server Action.
- **Limits are props, documented in the schema:** `min`, `max`, `step` (NumberField, Slider), `minLength`, `maxLength` with an optional counter (Input, Textarea), `length` (OTPField), `maxFiles`, `maxSize`, `accept` (FileUpload), `maxTags` (TagsInput), `minDate`, `maxDate` (DatePicker), `max` (Rating), `visibleRows` (any collection).
- **Input details:** a `dir="auto"` option, correct `inputMode` and `autoComplete`, numbers and emails stay left-to-right inside RTL forms, and prefix and suffix slots through `InputGroup` using logical sides.

# 13. Internationalisation and RTL details

- `<html lang dir>` is the source of truth. CSS reads `[dir="rtl"]` and `:lang(ar)`; no JavaScript is needed for layout direction. The exception is gestures: Base UI's swipe directions are physical, so Drawer and Toast compute theirs from the current direction.
- **`TopClassProvider` is required** at the root layout. It takes `direction` and `locale` as props from `app/(site)/[locale]/layout.tsx` - never read from `document.dir` in an effect, which would differ from the server render - and forwards `direction` to Base UI's `DirectionProvider` (`@base-ui/react/direction-provider`, default `'ltr'`), which is the only way Base UI learns the direction for keyboard arrows, Slider direction and `align="start"`. It also provides `labels`, the numbering system, the adaptive and collection defaults, the toast viewport, the tooltip provider and the isolation root, and exposes `useDirection()`, `useLocale()` and `useLabels()`. In development every Base UI-backed component warns once if no provider is found, or if `direction` disagrees with `document.documentElement.dir`.
- Labels: `shared/labels/en.ts` and `ar.ts`, typed by `shared/labels/types.ts`. Server Components receive labels as props; `getLabels(locale)` returns `{ locale, labels }` in a server file. Labels that contain a number are functions using `Intl.PluralRules` (5.11).
- Dates, numbers and lists are formatted with `Intl` using the locale from the provider or the props. Never hand-format. Arabic-Indic or Latin digits are a provider option.
- Mixed-direction text: wrap user content in `<bdi>`.
- Every visual test runs in both directions, so an RTL regression cannot ship unnoticed. The WebKit and Firefox smoke set always includes the overlays, Drawer, ScrollArea, Slider and Tabs in RTL, because horizontal-scroll and transform bugs there are WebKit-specific.

# 14. Performance budget

Budgets are checked in CI with size-limit and Lighthouse CI. A failing budget blocks the merge.

| Item | Budget |
|----------------------------------------|----------------------------------|
| Server-rendered atoms (Button, Badge, Card, Heading ...) | 0 KB client JS beyond the empty-page baseline |
| Simple client controls (Switch, Checkbox, Tabs) | under 6 KB gzip each, excluding React and the shared Base UI core |
| Overlays (Dialog, Dropdown, Popover, Select) | under 14 KB gzip each, on the same basis |
| Heavy components (DatePicker, Command, DataTable) | lazy-loaded; never in the initial bundle |
| Icons | each generated module under 600 bytes; a client bundle contains only the icons its components import |
| Docs pages (lab, Lighthouse CI mobile profile) | LCP under 1.8 s, CLS under 0.02, TBT under 150 ms |
| Docs pages (field, CrUX and Search Console after launch) | INP under 200 ms at p75, LCP under 2.5 s at p75 |

How each row is measured:

- The client rows use size-limit with the `@size-limit/preset-small-lib` preset, one entry per component generated from `meta.ts`, with `"ignore": ["react", "react-dom", "@base-ui/react"]` (that is what "excluding the shared Base UI core" means) and `"gzip": true`, because the preset defaults to Brotli. A second entry per package without `ignore` is reported but not limited, so the real cost of Base UI stays visible in the pull request comment.
- The 0 KB rows cannot be measured by size-limit, which bundles whatever it is given and has no notion of a Server Component. They are measured in the browser: a Playwright test sums the bytes of every `<script>` and `.js` response on `/preview/light/ltr/<component>/<demo>` and compares them with `/preview/light/ltr/blank/empty`, a reserved slug the preview route always generates.
- INP is a field metric that needs real interactions, so the lab row uses TBT as its proxy and the field row is read from CrUX after launch.

Rules that protect the budget: subpath imports only; `sideEffects` declared; no root barrel; overlay content not mounted until opened; heavy parts loaded with `React.lazy`; skeletons match final dimensions; no runtime style generation; icons imported per module in client files; lists windowed above the threshold (8.5); fonts through `next/font` with `display: 'swap'` (the default) and preloading limited to the primary font instance and subset, since `next/font` has no per-weight preload.

Set the real numbers after the first measurements in Phase 3 and record them in `docs/DECISIONS.md`. The table above is the starting target.

# 15. SEO plan

A component library cannot rank a site by itself. What it can do is make good SEO the default, and the docs site can be an excellent example of it.

## 15.1 Inside the components

- Semantic elements first: `<nav>`, `<main>`, `<article>`, `<header>`, `<button>`, `<a href>`, real `<table>` markup, real headings.
- `Heading` takes `level` (the tag) separately from `size` (the look), so visual design never forces a wrong heading order.
- Navigation is always an anchor with an `href`. `Pagination`, `Breadcrumb`, `Tabs` (when they change the URL) and `NavigationMenu` render crawlable links, and Base UI's `Menu.LinkItem` renders a real `<a>`.
- The `Image` adapter requires `alt`, `width` and `height` in its types, which also prevents layout shift.
- Content inside Accordion and Tabs stays in the server HTML (9.2 rule 8).
- `LoadMore` and windowed lists keep a real paginated `href` underneath, so every item is reachable without JavaScript.
- Minimal client JavaScript improves INP; matching skeletons keep CLS near zero. Both are ranking signals.

## 15.2 The SEO kit (`@topclassui/next`)

- `JsonLd` - a typed component (types from `schema-dts`) that serialises safely (escapes `<` as `<`).
- `Breadcrumb` emits `BreadcrumbList` structured data; `FAQ` (an Accordion) emits `FAQPage`; `Rating` can emit `AggregateRating`.
- `createMetadata()` - a typed helper around Next.js `Metadata`: title template, description, canonical URL, `alternates.languages` for hreflang, Open Graph and Twitter cards. It sets `metadataBase` once in the locale layout, where `title.template` also belongs, since a template only applies to child segments.
- Helpers for `sitemap.ts` (with language alternates) and `robots.ts`. In Next 16 the image-generating functions receive their props as Promises, and `generateSitemaps` receives `id` as a Promise.

## 15.3 The docs site (topclassui.com)

- **Fully static, by construction.** Every page is generated at build time with `generateStaticParams`, and nothing in `apps/docs` reads `searchParams`, `cookies()`, `headers()` or `connection()`. Caching model: in Next.js 16.3 Cache Components is **off by default** and opt-in through `cacheComponents: true`; v0.1 keeps it off and revisits before 1.0. Under the default model a route is prerendered unless it uses a request-time API. If locale negotiation is ever added, the request hook is `proxy.ts` (not `middleware.ts`, which is deprecated and Edge-only), it runs on the Node runtime, and its matcher excludes `_next`, the metadata files, `llms.txt` and `/preview`.
- **Locales in the URL:** `/en/...` and `/ar/...`. The site root layout is `app/(site)/[locale]/layout.tsx` - there is no `app/layout.tsx` - so `<html lang dir>` is correct in the server HTML. It exports `generateStaticParams` returning `en` and `ar` and sets `export const dynamicParams = false`, so any other first segment is a 404 instead of the home page rendered under an unknown locale. `/` redirects to `/en` through `redirects()` in `next.config.ts`. `locale` is a root parameter readable with `next/root-params` in any Server Component, and `not-found.tsx` lives inside `[locale]`. Every page declares hreflang alternates and a canonical URL. **Arabic docs are the biggest SEO opportunity: a serious RTL-first React library documented in Arabic has almost no competition.**
- **Metadata per page** through `generateMetadata`. Title pattern: `React {Component} - Tailwind CSS, RTL, accessible | TopClass UI`.
- **Open Graph image per component** generated by `opengraph-image.tsx` in each locale, with fonts loaded from files rather than `next/font`. The image renderer does not support bidirectional text, so an Arabic image never mixes Latin and Arabic on one line: the component name sits on its own line in Latin and the Arabic tagline on its own line with `direction: rtl`. Phase 7 includes a visual check of one Arabic image; if the output is still wrong, the Arabic pages use a static per-locale template image.
- **Structured data:** `TechArticle` and `BreadcrumbList` on docs pages, `SoftwareSourceCode` and `Organization` on the home page, `FAQPage` where there is a FAQ.
- `sitemap.ts`, `robots.ts`, `manifest.ts`, and an `llms.txt` route (`app/llms.txt/route.ts`) so AI assistants can discover and cite the docs.
- **Content is server-rendered text.** MDX compiled at build time, code highlighted by Shiki at build time, and live previews loaded lazily below the fold.
- **Internal linking:** every component page links to related components, its connector and the rule pages (RTL, theming).
- **Pages that attract search traffic:** in v0.1, the colours page and the icons page. After v0.1 (section 22): the theme builder, comparison pages, a changelog page generated from the Changesets output, and a blog with tutorials.
- Preview routes used by tests are `noindex` and excluded from the sitemap.
- After launch: verify the domain in Google Search Console and Bing Webmaster Tools, submit the sitemap, and track Core Web Vitals field data.

## 15.4 The 3D editor, later

- Static marketing pages built with TopClass UI; the editor application itself is `noindex`.
- A public gallery in which every published effect has its own indexable page (title, description, live preview, the exported code). These pages are what can make the editor rank.
- Tutorials that answer real searches, for example how to build a bent-plane scroll effect in React Three Fiber.

# 16. The docs application

| Route | Purpose |
|-----------------------------------------|------------------------------------------|
| `/[locale]` | Home: what it is, the seven differentiators, install |
| `/[locale]/docs/getting-started/*` | Install, CSS entry, provider, first component |
| `/[locale]/docs/foundations/colors` | The colours page (section 6.4) |
| `/[locale]/docs/foundations/icons` | The icons page (section 7.4) |
| `/[locale]/docs/foundations/theming` | Modes, knobs, nested themes, custom modes |
| `/[locale]/docs/foundations/rtl` | The RTL rules and how to build RTL apps |
| `/[locale]/docs/foundations/server-first` | The index/client split explained |
| `/[locale]/docs/components/[slug]` | One page per component |
| `/[locale]/docs/connectors/[slug]` | One page per connector |
| `/[locale]/theme-builder` | Later |
| `/[locale]/compare/[slug]`, `/[locale]/blog/*`, `/[locale]/changelog` | Search traffic and trust. After v0.1; they live under `[locale]` so they get hreflang pairs like every other page |
| `/preview/[theme]/[dir]/[component]/[demo]` | One demo alone on a blank page. `noindex` |

The preview tree lives outside `[locale]`, so `app/(preview)/preview/[theme]/[dir]/layout.tsx` is a second root layout and renders its own `<html lang="en" dir={dir} data-theme={theme}>`; Turbopack does not create a root layout automatically. Every segment comes from `generateStaticParams`, including a reserved `blank/empty` demo used as the JavaScript baseline (section 14), so the route is prerendered like every other page. The knobs that are not in the URL (radius, density, motion) are set by the Playwright fixture with `page.addInitScript` before the page loads, which also freezes animation for screenshots. Navigating between `/preview` and `/[locale]` is a full page load, which is fine for tests.

A component page contains: a one-sentence description; the install and import line; a **demo grid** - two columns on desktop, one on mobile - where each demo from `demos/` is a live preview with a code tab and a copy button; a **States block** that renders the full state matrix at once, with states as rows (`idle`, `hover`, `focus-visible`, `active`, `disabled`, `loading`, `invalid`, `empty`, `error`) and variants as columns, using the forced-state attributes (`data-hover`, `data-focus-visible`, `data-active`) that the variants also match, so no interaction is needed to see a state; **page controls** - segmented, not a dropdown - for mode, direction, density and radius, which change every block on the page; the props table generated from the emitted `.d.ts` with defaults and limits from `schema.ts`; accessibility notes with a keyboard table; RTL notes; the server/client breakdown with the measured client JavaScript size; and related components. The `/preview` route renders the same States block, so the visual tests and the docs can never disagree.

The live demo at the top of a component page is the playground: its controls are generated from `schema.ts` (an enum becomes a select, a boolean a switch, a number a slider with the schema's min and max). It is built with the page template in Phase 0, not later.

**The previewer.** Every component on the catalog page and at the top of its own page sits in one wrapper, so a reader learns the layout once and then reads 46 components with it. Five parts, in this order: the **stage** (the hero demo on `--tc-page`, so the component is seen against the page it will live on); the **playground** (the schema-generated controls, beside the stage); the **code** (the JSX that produces the stage, syntax-highlighted, with the copy button bound to *it* - a copy button with no visible source is ambiguous and is not allowed); the **states block**; and the **two install paths**, the CLI command and the package import, side by side. The kind chip in the header carries the measured size, never the bare word: `server - 0 KB`, `client - 4.8 KB`, `split - 0 KB server + 1.2 KB client`, generated from the size-limit JSON so the page cannot drift from the budget. A component whose chip says `lazy` says so on the chip.

**Accessible names on a page of 46 previewers.** The page repeats the same control dozens of times, and a screen-reader user meets them as one long list, so every repeated control is named by what it acts on. Each string is a `labels` entry with `en` and `ar` defaults (R-5.11-1) composed with the component name, never a literal.

| Control | Count | Accessible name |
|---|---|---|
| Section mode switcher | 46 | `Colour mode for {Component}` on the radiogroup; the options keep their own words, `Light` / `Dark` / `Ocean`, and never repeat the component name |
| Page mode switcher | 1 | `Colour mode for the whole page` - deliberately different wording, so it is never announced like a section control |
| Page direction, density, radius | 1 each | `Text direction for the whole page`, and the same shape for the other two |
| Copy, CLI line | 46 | `Copy the CLI command for {Component}` |
| Copy, import line | 46 | `Copy the import for {Component}` |
| Copy, demo code | 46 | `Copy the {demo} code for {Component}`, where `{demo}` is the `demos/` file name |
| Preview / Code tabs | 46 pairs | The tab list is `{Component} demo`; the tabs keep the bare words `Preview` and `Code`, and each panel is named by its tab with `aria-labelledby` |
| Section heading anchor | 46 | `Link to the {Component} section` |
| The two navigation landmarks | 2 | `<nav aria-label="Site">` and `<nav aria-label="On this page">`; two unnamed navs are announced identically |

A copy button's accessible name never changes to "Copied". Success is announced from one polite live region per section - renaming the focused control re-announces it and throws away the name the reader just heard. The current sidebar row carries `aria-current="page"`.

**Part naming.** The root of a part family is `<Name>Root` without exception: `CardRoot`, `DialogRoot`, `DrawerRoot`, `AvatarRoot`, `TabsRoot`, `AccordionRoot`, `NavbarRoot`, `SidebarRoot`, `PopoverRoot`, `TooltipRoot`, `SegmentedControlRoot`. A scrolling overlay names its three parts `<Name>Header`, `<Name>Body` and `<Name>Footer`, and the **Body** is the scroll container that rule 10.5-3 requires - a Dialog whose title and footer sit loose in the popup has nothing to scroll.

The docs site is built only with TopClass UI components once they exist. Until the component a page needs is shipped, the docs use plain HTML elements styled with the same semantic classes, each marked `{/* TODO(tc): replace with <Select> in Phase 4 */}`. `pnpm check` lists these markers, and Phase 7 is accepted only when the list is empty. If the docs need a component that is not on the roadmap at all, that is a signal for the roadmap.

# 17. Testing, CI and releases

## 17.1 Test layers

| Layer | Tool | What it proves |
|----------------------|-------------------------------|----------------------------------------|
| Types | `tsc --noEmit`, `expectTypeOf` | The public prop types are what we promise |
| Unit and interaction | Vitest, Testing Library, user-event | Behaviour, keyboard, controlled and uncontrolled |
| Accessibility | `axe-core` through a small `expect.extend` matcher, `@axe-core/playwright` | Zero violations on every demo |
| SSR and hydration | Vitest, two projects | `ssr` (node): `renderToString` of every demo must not throw, which catches `window` access. `dom` (jsdom): set `container.innerHTML` from `renderToString`, then `hydrateRoot` with `onRecoverableError`, asserting no recoverable error and no `console.error`. Hydration warnings are emitted on the client, so a Node-only test can never see them |
| Server-only rules | Vitest project `rsc` with `resolve.conditions: ['react-server']` | Under that condition React has no client hooks, so a hook in a server file throws |
| Cross-browser | Playwright: Chromium, Firefox, WebKit | Overlays, focus, scroll lock, touch emulation |
| Visual regression | Playwright screenshots of `/preview` routes | Matrix: {light, dark, custom} x {ltr, rtl} x {mobile, desktop} |
| Structure | `check-structure`, `check-boundaries` | The folder contract, the structure rules (5.12) and the server/client rules |
| Tokens | `check-contrast` | AA contrast in every mode, with gamut mapping |
| Collections | Playwright | A ten-thousand-item demo keeps the DOM row count under a hundred while scrolling |
| Bundle | size-limit and a Playwright byte count | The budgets in section 14 |
| Package | publint, attw | The published package is valid for every consumer |
| Performance and SEO | Lighthouse CI on a local production build | Scores and Core Web Vitals |
| Rules | `rules-sync --check` | `CLAUDE.md`, `AGENTS.md` and `.cursor/rules` match `docs/RULES.md` |

Async Server Components cannot be rendered by Vitest; they are covered by Playwright against `/preview`. Visual regression runs the full matrix in Chromium, and a smaller smoke set in WebKit and Firefox that always includes RTL, to keep CI time reasonable.

## 17.2 Scripts

`pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm test:visual`, `pnpm check:structure`, `pnpm check:boundaries`, `pnpm check:contrast`, `pnpm rules:sync`, `pnpm size`, `pnpm icons:build`, `pnpm new:component <name>`, and

```
pnpm check = turbo run lint typecheck test check:structure check:boundaries check:contrast rules:sync
```

That is the one definition; section 0 and `CLAUDE.md` repeat it verbatim.

**Script portability.** Every `package.json` script must run identically on Omar's Windows machine and on Linux CI. `.npmrc` sets `shell-emulator=true` so pnpm runs scripts in its bash-like emulator on every OS, which makes quotes, `&&` and `VAR=x cmd` behave the same. Never call `rm`, `cp`, `mkdir -p` or `cat` in a script: delete with `rimraf`, copy with `copyfiles`, and do anything else in Node. Use double quotes inside scripts, never single quotes, and do not rely on `$npm_package_*` variables. `pnpm check` is a Turborepo task list, not a chained shell command, so it contains no `&&` at all.

Root `turbo.json` declares the dependencies, because several checks need a built `dist`:

```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**", "!.next/cache/**"] },
    "dev": { "dependsOn": ["^build"], "persistent": true, "cache": false },
    "typecheck": { "dependsOn": ["^build"] },
    "lint": {},
    "test": { "dependsOn": ["^build"], "env": ["CI"] },
    "check:structure": {},
    "check:boundaries": {},
    "check:contrast": { "dependsOn": ["@topclassui/tokens#build"] },
    "rules:sync": {},
    "size": { "dependsOn": ["build"] },
    "test:e2e": { "dependsOn": ["build"], "cache": false },
    "test:visual": { "dependsOn": ["build"], "cache": false }
  }
}
```

Vitest runs with `--maxWorkers 50%` locally so Turborepo's parallel tasks and Vitest's workers together do not oversubscribe the machine, and Playwright is never run inside `pnpm check`.

## 17.3 CI (GitHub Actions)

On every pull request: install with the pnpm cache, `pnpm check`, build, size-limit, publint and attw, Playwright (sharded), and Lighthouse CI against a **local production build** (`startServerCommand`, `numberOfRuns: 5`, `aggregationMethod: median`). Lighthouse assertions are `categories:accessibility`, `categories:best-practices` and `categories:seo` at `minScore: 1`, plus the metric budgets of section 14; the performance *score* is never asserted, because it is a distribution. Lighthouse is never scored against a Vercel preview URL, because Vercel adds `X-Robots-Tag: noindex` to every preview deployment, which fails the `is-crawlable` audit outright, and previews may sit behind authentication. All of this is required to pass before merge from Phase 3 on; in Phases 0 to 2 Lighthouse CI runs but only warns.

**Visual baselines are Linux-only.** Playwright names snapshots per browser and platform and its `updateSnapshots` default is `missing`, so a first CI run on Linux would silently write new baselines and pass while asserting nothing. `playwright.config.ts` therefore sets `snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}-{projectName}{ext}'` (no platform token) and `updateSnapshots: process.env.CI ? 'none' : 'missing'`, so a missing baseline fails in CI. Baselines are generated only inside the pinned Playwright Docker image - locally through Docker Desktop with the WSL 2 backend, or by a manually triggered `update-snapshots` workflow that runs on `ubuntu-latest` and commits to the pull request branch for review. The Playwright version in the Docker tag, in `package.json` and in CI must be identical, and `.gitignore` excludes `*-win32.png` and `*-darwin.png`.

## 17.4 Releases

- Changesets for versioning and changelogs. Publishing uses npm **trusted publishing** (OIDC) from GitHub Actions, so no npm token is stored anywhere and provenance is generated automatically - on the condition that the repository is public, because npm does not generate provenance for a private repository even when the package is public. A trusted publisher can only be attached to a package that already exists on the registry, so the very first version of each package (`0.0.1`, not `0.1.0`) is published by hand with `npm publish --access public` from a machine with 2FA; every release after that is `release.yml`. Each package is then registered on npmjs.com with the repository, the **workflow filename only** (`release.yml`, never a path) and the environment, with the direct-publish permission enabled (`npm trust github @topclassui/react --repo TopClassUI/topclassui --file release.yml --allow-publish`): since September 2026 a new trusted publisher allows only `npm stage publish` by default, and `changeset publish` performs a direct publish. `release.yml` runs on `ubuntu-latest` and **Node 24** with `permissions: { contents: write, pull-requests: write, id-token: write }`, upgrades npm (`npm install -g npm@latest`, because trusted publishing needs npm 11.5.1 or newer; the current npm no longer installs on Node 22.14, which is why the release runner is Node 24 while the package engines floor stays at 22.14), then runs `changesets/action` with `pnpm changeset publish`. Do not set `registry-url` or `NODE_AUTH_TOKEN` on `actions/setup-node` in that job: an `_authToken` makes the client skip the OIDC exchange. Each `package.json` carries `"repository"` with the exact GitHub casing and a `directory`, `"license": "MIT"`, its own README, keywords, and `"publishConfig": { "access": "public" }`. There is no token fallback: classic and automation tokens no longer exist, a granular write token lives at most 90 days, and a token does not buy provenance on its own. If trusted publishing is unavailable, publish by hand.
- One npm organisation, `topclassui`, on the free plan, with 2FA required of every member. The organisation name is the scope. pnpm, yarn and bun are clients of the same registry and need no account of their own.
- Semver. Before 1.0, breaking changes may land in minor versions but must be listed in the changelog with a migration note.
- Deprecation policy after 1.0: a deprecated prop keeps working for at least one minor version and logs a development-only warning.
- 1.0 is released only after the portfolio and the editor have run on the library in production.

# 18. Component catalog

Rendering: **S** = server only (0 KB JS), **Sp** = split (`index.tsx` + `client.tsx`), **C** = client. Tier 1 is v0.1 and holds 46 components; tier 2 and 3 follow; tier 4 is the editor kit.

## 18.1 Typography and layout

| Component | Rendering | Tier | Notes |
|----------------------|-----|-----|--------------------------------------------|
| Heading | S | 1 | `level` separate from `size` |
| Text | S | 1 | sizes, `muted`, truncate, line clamp |
| Link | S | 1 | `render` for the framework link; external-link handling |
| Prose | S | 2 | Styles long-form MDX/CMS content, RTL-aware |
| Code | S | 1 | Inline code |
| Kbd | S | 2 | Keyboard keys |
| CodeBlock | Sp | 2 | Shiki on the server + a client CopyButton |
| Blockquote, List, DescriptionList | S | 2 | |
| Container, Section | S | 1 | Max-width and vertical rhythm |
| Stack, Grid | S | 1 | Layout primitives using `gap` |
| Cluster, Center | S | 2 | |
| Separator | S | 1 | Horizontal and vertical |
| AspectRatio | S | 2 | |
| VisuallyHidden, SkipLink | S | 1 | Accessibility helpers |

## 18.2 Media and display

| Component | Rendering | Tier | Notes |
|----------------------|-----|-----|--------------------------------------------|
| Icon | S | 1 | Section 7; the component lives in `packages/react`, the data in `@topclassui/icons` |
| Svg | S | 1 | Shared; renders an imported `IconData` in client and shared files |
| Image | S | 2 | Adapter; requires `alt`, `width`, `height` |
| Avatar, AvatarGroup | Sp | 2 | Fallback initials; `max` with "+N" |
| Badge | S | 1 | Tones and variants |
| Tag / Chip | Sp | 2 | Removable version is client |
| Card | S | 1 | Header, body, footer parts |
| Stat | S | 2 | Value, label, trend |
| Timeline | S | 3 | Collection (8.5) when it grows |
| Skeleton, Spinner | S | 1 | Used by every `skeleton.tsx` |
| Alert / Callout | S | 1 | Tones, icon, title, actions |
| Banner | Sp | 2 | Dismissible, remembers dismissal |
| EmptyState, ErrorState | S | 1 | Used by every `states.tsx` |
| ErrorBoundary | C | 1 | Class component; default fallback `ErrorState` with `labels.retry`, remounts children by key; `onError` for reporting; used internally by every data component and connector |
| Progress, Meter | S | 2 | `min`/`max`, clamped |
| Table | S | 1 | Sortable columns through `?sort=` links; `stickyFirstColumn` with `inset-s-0`; `pageSize` of 25, 50, 100 or 500 with a link-based selector; the collection contract of 8.5 |
| Rating | Sp | 3 | Display is server; input is client |

## 18.3 Actions

| Component | Rendering | Tier | Notes |
|----------------------|-----|-----|--------------------------------------------|
| Button | S | 1 | Section 8.4 |
| IconButton | S | 1 | `label` required by the types |
| ButtonGroup | S | 2 | Joined radius using logical corners |
| CopyButton | C | 2 | |
| Toggle, ToggleGroup | C | 2 | Base UI Toggle |
| SplitButton | C | 3 | Button + Dropdown |

## 18.4 Forms

| Component | Rendering | Tier | Notes |
|----------------------|-----|-----|--------------------------------------------|
| Form | Sp | 1 | `index.tsx`: plain `<form action>`; `hook.ts` + `client.tsx`: `FormAction` with `useActionState` and Base UI `Form errors` (section 12) |
| Field, Label | Sp | 1 | Server half passes control props through a render-prop child; `FieldLive` wraps Base UI Field |
| Fieldset | Sp | 2 | |
| Input | S | 1 | Native; requires `id` or `aria-label`; `dir="auto"` option |
| InputGroup | S | 2 | Prefix/suffix with logical sides |
| Textarea | Sp | 1 | Autosize and counter are client |
| PasswordInput, SearchInput | C | 2 | |
| NumberField | C | 1 | `min`, `max`, `step`; Base UI; hidden input, needs JS to change |
| Slider | C | 1 | Single and range; RTL-aware; Base UI; keyboard alternative to dragging |
| Checkbox | C | 1 | Base UI; renders a span plus a hidden input |
| CheckboxGroup | C | 2 | Base UI |
| RadioGroup | C | 1 | Base UI |
| RadioCards | C | 2 | |
| Switch | C | 1 | Base UI |
| SegmentedControl | C | 2 | |
| Select | C | 1 | Base UI; collision-aware popup; `alignItemWithTrigger={false}`; collection (8.5) |
| MultiSelect | C | 3 | Collection |
| Combobox, Autocomplete | C | 2 | Base UI; remote options use the collection contract |
| TagsInput | C | 3 | `maxTags`; suggestions are a collection |
| OTPField | C | 3 | Base UI `OTPField` (stable since 1.6.0): parts Root/Input/Separator, Root requires `length`, plus `validationType`, `mask`, `autoSubmit`, `onValueComplete` |
| FileUpload / Dropzone | C | 3 | `maxFiles`, `maxSize`, `accept`; the file list is a collection |
| Calendar, DatePicker, DateRangePicker | C | 3 | react-day-picker; RTL; locale-aware; lazy |
| TimePicker | C | 3 | |
| ColorPicker | C | 3 | oklch-aware; needed by the editor |
| PhoneInput | C | 3 | Always LTR digits inside RTL forms |

## 18.5 Overlays

| Component | Rendering | Tier | Notes |
|----------------------|-----|-----|--------------------------------------------|
| Tooltip | C | 1 | Provider with grouped delay; text only (10.5) |
| Popover | C | 1 | The destination for any rich content a tooltip cannot hold |
| HoverCard | C | 3 | Base UI Preview Card |
| Dropdown | C | 1 | Base UI Menu; data-driven and parts; link items use `Menu.LinkItem` |
| ContextMenu | C | 2 | |
| Menubar | C | 3 | |
| Dialog, AlertDialog | C | 1 | Body scrolls, header and footer sticky (10.5) |
| Popconfirm | C | 2 | Small confirm popover |
| Drawer / Sheet | C | 1 | Base UI Drawer (extends Dialog). Bottom, top, start, end, placed with logical CSS; `swipeDirection` computed from the direction; `Drawer.Close` always rendered; `Drawer.VirtualKeyboardProvider` for bottom sheets with inputs |
| Toast | C | 1 | Section 10.3 |
| Command | C | 3 | Command palette; lazy; collection |
| Lightbox, Tour | C | 3 | |

## 18.6 Navigation and disclosure

| Component | Rendering | Tier | Notes |
|----------------------|-----|-----|--------------------------------------------|
| Accordion | Sp | 1 | Content stays in HTML with `hiddenUntilFound` |
| Collapsible | Sp | 2 | Same panel props as Accordion |
| Tabs | Sp | 1 | Panels rendered on the server with `<Tabs.Panel keepMounted>` |
| Stepper | Sp | 3 | |
| Breadcrumb | S | 1 | Emits structured data |
| Pagination | S | 1 | Real `href`s; `siblingCount` limits |
| Navbar, Footer | Sp | 2 | |
| NavigationMenu | C | 3 | Mega menu with crawlable links |
| Sidebar | Sp | 2 | |
| BottomNav | S | 2 | Mobile tab bar with safe-area padding |
| TableOfContents | Sp | 2 | Scroll-spy is client |
| ScrollArea | C | 2 | Base UI; the only custom scrollbars (10.5) |
| Toolbar | C | 2 | Base UI |
| BackToTop | C | 3 | |
| ThemeSwitcher, LanguageSwitcher | C | 1 | Needed by the docs site |

## 18.7 Data

| Component | Rendering | Tier | Notes |
|----------------------|-----|-----|--------------------------------------------|
| DataTable | C | 3 | TanStack Table; sorting, filtering, pagination; collection contract |
| VirtualList | C | 3 | The collection hook with no chrome |
| TreeView | C | 3 | Needed by the editor's layers panel; flattened visible nodes are the collection |
| Carousel | C | 3 | Embla; RTL-aware; `slidesPerView` is the visible-rows knob |
| LoadMore | Sp | 3 | Real pagination link underneath |
| Resizable | C | 3 | react-resizable-panels; keyboard alternative to dragging |

## 18.8 SEO kit, providers and utilities

| Item | Tier | Notes |
|----------------------|-----|------------------------------------------------|
| JsonLd, FAQ, createMetadata, sitemap/robots helpers | 2 | In `@topclassui/next` |
| TopClassProvider | 1 | Required at the root layout. Props: `direction`, `locale`, `labels`, `numberingSystem`, `adaptive`, `collection`. Renders the toast viewport, the tooltip provider and the isolation root; exposes `useDirection`, `useLocale`, `useLabels` |
| ThemeScript, useTheme | 1 | Section 6.3; exported from `@topclassui/react/theme` |
| cn, clamp, renderElement, toSideAlign, getLabels, useAdaptiveMode, createAdaptive, useCollection, useControllableState, useMediaQuery, the class constants | 1 | In `shared/`, exported through `@topclassui/react/utils`, `/adaptive` and `/provider` |

## 18.9 Connectors

Listed in section 11.4. `AdaptiveMenu`, `AdaptiveDialog` and `AdaptiveSelect` are tier 1; the rest are tier 2 and 3.

## 18.10 Editor kit (tier 4, separate package `@topclassui/editor-kit`)

Built only when the 3D editor needs them, on top of the core library.

| Component | Purpose |
|----------------------|------------------------------------------------------|
| NumberScrubber | Drag sideways on a number to change it (Blender/Figma style), with `min`, `max`, `step` and a typed input alternative |
| VectorInput | x / y / z fields for position, rotation, scale |
| Inspector | A property panel **generated from a Zod schema**. This is where the schema strategy pays off: describe an object once, get its editing UI for free |
| LayersPanel | TreeView with visibility and lock toggles, drag to reorder plus move up/down actions |
| Timeline, KeyframeTrack | Scroll-progress timeline from 0 to 1 with draggable keyframes |
| EasingEditor | Cubic-bezier curve editor |
| GradientEditor | Colour stops |
| ShortcutHint | Shows keyboard shortcuts consistently |
| CodeExportDialog | CodeBlock + copy + download |

## 18.11 Props that have limits (must be in the schema and clamped)

`Progress.value`, `Meter.value`, `Slider.min/max/step`, `NumberField.min/max/step`, `Rating.max`, `Input.maxLength`, `Textarea.maxLength/maxRows`, `OTPField.length`, `TagsInput.maxTags`, `FileUpload.maxFiles/maxSize`, `AvatarGroup.max`, `Pagination.siblingCount/boundaryCount`, `Toast` visible limit and duration, `Skeleton` rows, `Carousel.slidesPerView`, `DatePicker.minDate/maxDate`, `Tooltip` delays, `Text` line clamp, `size` on every component that has one (`custom` opts out), and `visibleRows` on every collection.

# 19. Roadmap with acceptance criteria

Nothing about *how* a component is built is ever deferred. Every base is finished before the first component exists, the first component is then finished to the last line of the Definition of Done, and after that adding a component is quantity, not design. Only *which* components exist changes over time.

Each phase ends with a demo to Omar and a green CI run. Time estimates are rough and assume part-time work with Claude Code: Phase 0.5 (Figma) roughly three to five weekends of generation and review; Phases 0 to 2 about four to six weekends; Phases 3 to 7 about six to nine months at the trimmed tier-1 scope. If the pace after Phase 3 is below three finished components per weekend, cut tier 1 further, never the Definition of Done. Do not start a phase before the previous one meets its acceptance criteria.

## Phase 0 - Foundations

Everything a component will ever need, built and tested before any component exists.

**Build, tooling:** the monorepo (pnpm workspaces, Turborepo) with the toolchain pinned - `.gitattributes`, `.editorconfig`, `.prettierrc` with `endOfLine: "lf"`, root `package.json` with `"packageManager": "pnpm@10.28.2"` and `"engines": { "node": ">=22.14" }`, `.node-version`, `.npmrc` (`engine-strict`, `shell-emulator`, `save-exact`), `pnpm-workspace.yaml` with a reviewed `onlyBuiltDependencies` allow-list, `renovate.json` on a weekly schedule, a pull-request template carrying the manual rules checklist, and `turbo.json` (17.2). Shared tsconfig bases (4). ESLint 9 flat config including every custom rule of 5.2, 5.3 and 5.12. Vitest with the `ssr`, `dom` and `rsc` projects. A Playwright skeleton with the Linux-only baseline pipeline. GitHub Actions. Changesets. size-limit, publint and attw wiring. The scripts: `new-component`, `check-structure`, `check-boundaries`, `list-entrypoints`, `rules-sync` (`check-contrast` arrives in Phase 1 and until then is a no-op that exits 0). `docs/RULES.md` and the generated `CLAUDE.md`, `AGENTS.md` and `.cursor/rules/topclassui.mdc`.

**Build, library:** every shared module, each with unit tests - `shared/cn.ts` (configured tailwind-merge), `shared/classes.ts` (every class constant of 5.2), `shared/clamp.ts`, `shared/render.ts` (`renderElement`), `shared/floating.ts` (`Placement`, `toSideAlign`, `FLOATING`), `shared/contracts/` (size, state, collection, menu and the other connector contracts), `shared/collection/` (`useCollection`: windowing, paging, keyboard over unmounted rows, `scrollToKey`), `shared/adaptive/` (`useAdaptiveMode`, `createAdaptive`), `shared/labels/` (`types.ts`, `en.ts`, `ar.ts`, plural functions, `getLabels`), `shared/theme/` (`ThemeScript` with its hash, `useTheme`), `shared/provider/` (`TopClassProvider` with the direction, locale, labels, numbering system, adaptive and collection defaults, the isolation root, and empty slots for the toast viewport and tooltip provider), `ErrorBoundary`, and the two icon components `<Icon>` and `<Svg>`.

**Build, docs app:** the `(site)/[locale]` and `(preview)` root layouts, the component page template (demo grid, States block, page controls, the props table from `.d.ts` plus schema, and the schema-generated playground controls), the `/preview` route with its `generateStaticParams` including the `blank/empty` baseline, and the visual-matrix fixture.

**Accept when:** `pnpm check` and CI are green; every shared module has tests; the lint fixtures prove that `pl-4`, `bg-red-500`, `dark:bg-black`, `` `bg-${x}` ``, `outline-2`, `start-4` and a two-line comment all fail inside `packages/react`, and that `ps-4`, `bg-primary-solid`, `inset-s-4` and `FOCUS_RING` pass; `cn('h-control-md','h-control-sm')` returns only the second class and the same holds for `rounded-control` against `rounded-box`; `useCollection` keeps fewer than a hundred rows in the DOM for a ten-thousand-item harness; the `createAdaptive` type tests pass; the docs skeleton prerenders every route; `git ls-files --eol` shows `i/lf w/lf` for every text file on Omar's machine and `check-boundaries` passes its CRLF fixture; `rules-sync --check` is clean.

## Phase 0.5 - Design (Figma)

**Build:** section 6.6 in full - the variable collections with all three modes, the type scale, the icon set, then every catalog row as a component set, then every docs route as a page frame.

**Accept when:** every catalog row in section 18 has a component set whose properties match section 5.7 verbatim; every docs route has a page frame at 390 px and 1280 px in both directions; no raw colour, spacing or radius value exists anywhere in the file; Omar has signed off the foundations, tier 1 and the page templates.

## Phase 1 - Tokens and the colours page

**Build:** `packages/tokens` (section 6), the `@theme inline` mapping and the directives in `packages/react/src/styles.css`, `ThemeScript`, `useTheme`, the colours page, `check-contrast`.

**Accept when:** switching mode never flashes on reload; a nested `<section data-theme="dark">` inside a light page and a nested `<section data-theme="light">` inside a dark page both render correctly including the soft tones; the focus ring inside a nested `ocean` section is cyan, not violet; the `ocean` custom mode works without touching any component; changing `--tc-radius`, `--tc-density` and `--tc-list-rows` visibly changes the demo controls, and `--tc-motion: 0` stops every transition; a computed-style test on `<html lang="ar">` asserts `font-family` resolves to the Arabic stack; contrast passes in every mode with gamut mapping; the page is prerendered and Lighthouse CI on a local production build (17.3, warn-only until Phase 3) reports 100 for accessibility, best practices and SEO.

## Phase 2 - Icons

**Build:** `packages/icons` (section 7) - the build pipeline, the 84 icons of the starter set listed in `docs/icons.md`, the generated modules, names, directional list and loaders - plus `<Icon>` and `<Svg>` wired up, the icons page as a collection, and the `topclassui-icons add-set` CLI.

**Accept when:** a wrong icon name is a TypeScript error; directional icons flip in RTL and others do not; a page that renders icons makes no icon requests and ships no icon JavaScript from a Server Component; a client component that imports one icon ships only that icon; `<Icon className="hidden md:inline-block" />` is actually hidden, proving `cn()` is used; decorative and labelled icons pass axe; the icons page keeps its DOM under the collection limit with twenty thousand entries registered.

## Phase 3 - The first component, finished

Button only, to the last line of the Definition of Done. This phase is the template every later component copies.

**Build:** every file of the folder contract that Button needs, its schema and constants, its skeleton, its demos, its States block, its bilingual docs page from the Phase 0 template, its unit, accessibility, SSR and hydration tests, the full visual matrix in Chromium plus the WebKit and Firefox smoke set, its size-limit entry and the 0 KB browser check, and a changeset.

**Accept when:** Button meets every line of section 20 with zero exceptions; its `/preview` frames match its Figma frames within tolerance; the measured client JavaScript equals the blank-page baseline; and `pnpm new:component` scaffolds a second component whose empty skeleton already passes `pnpm check`.

## Phases 4 to 7 - Quantity

The remaining tier-1 components in catalog order, each to the same Definition of Done. **No new infrastructure is allowed:** a component that needs something new stops the phase, the shared piece is added to `shared/` with tests first, and the decision is recorded in `docs/DECISIONS.md`.

**Phase 4 - forms.** Field, Label, Input, Textarea, Checkbox, RadioGroup, Switch, NumberField, Slider, Select, Form. Accept when: a demo form of Input and Textarea inside server Fields submits through a Server Action with JavaScript disabled and shows server errors on the right fields after the full-page response; the same form with `FormAction` and `FieldLive` shows errors without a reload; a second demo with Checkbox, RadioGroup, Switch, Select, Slider and NumberField submits the correct FormData after hydration and submits default values when submitted before it; numeric limits clamp; the Select demo with ten thousand options keeps its DOM under the collection limit and pages on scroll, with `aria-activedescendant` tracking rows that are not mounted; every control is correct in RTL (Slider direction, NumberField buttons, Select popup side).

**Phase 5 - overlays.** `shared/floating` is already built, so this phase fills the provider's toast viewport and tooltip provider slots and adds Tooltip, Popover, Dropdown, Dialog, AlertDialog, Drawer and Toast. Accept when: Playwright opens each popup with the trigger near all four viewport edges and asserts the popup is entirely inside the viewport; a sixty-item menu scrolls inside itself and the page behind does not move; focus returns to the trigger on close; background scroll is locked and the layout does not shift; placements mirror in RTL; a scroll at the end of a Drawer body does not scroll the page in mobile emulation; a unit test on the built CSS asserts the Drawer popup and Toast viewport rules contain `env(safe-area-inset-bottom)`, because emulation always reports zero for it, and one manual check on a real iPhone is recorded in `docs/DECISIONS.md` before the phase closes.

**Phase 6 - disclosure, switchers and the first connectors.** Accordion, Tabs, ThemeSwitcher, LanguageSwitcher, AdaptiveMenu, AdaptiveDialog, AdaptiveSelect. Accept when: a test fetches the server HTML and finds the text of closed accordion panels (`hiddenUntilFound`) and of inactive tab panels (`keepMounted`); type tests prove `createAdaptive<MenuContract>` rejects a side that requires a prop outside the contract, rejects a side that types one differently, and rejects a call without the explicit type argument, and `expectTypeOf` proves the connector's props are `MenuContract & { mode?: ... }`; a Playwright test loads each connector demo at a mobile viewport and asserts zero console hydration warnings and that the mobile pattern is shown after hydration; resizing across the breakpoint while closed swaps the pattern, and resizing while open does not.

**Phase 7 - docs, SEO and v0.1.** The remaining docs pages (getting started, foundations, connectors), replacing the template's interim plain HTML with real components; metadata, hreflang, sitemap, robots, structured data, Open Graph images, `llms.txt`; the Lighthouse CI budgets made blocking; `CONTRIBUTING.md` (setup on each OS, running the visual matrix in Docker, adding an icon, the Definition of Done), `SECURITY.md`, `CODE_OF_CONDUCT.md`, issue and pull-request templates that ask for the mode, direction, browser and version; cookie-free docs analytics allowed by origin in the CSP; the README; and publishing `0.1.0` with provenance. Component pages already exist from Phases 3 to 6, because the Definition of Done requires them. Accept when: Lighthouse CI passes as defined in 17.3; every page has a unique title, description, canonical and hreflang pair; structured data validates; one Arabic Open Graph image is visually checked; the `TODO(tc)` list is empty; the package installs and works in a fresh Next.js app following only the Getting Started page, and `tsc --noEmit` in that app reports `<Button variant="nope" />` as an error. Then migrate the portfolio to it and fix what that exposes.

## Phase 8 and later

Tier 2 (v0.2-0.5), tier 3 (towards 1.0), then the editor kit (tier 4) in step with the 3D editor. Order inside each tier follows what the portfolio and the editor need next. That keeps the work honest: nothing is built on speculation.

# 20. Definition of Done for a component

A component is done only when every line is true.

- [ ] The folder matches the contract; `check-structure` and `check-boundaries` pass, including the structure rules of 5.12.
- [ ] Rendering mode is the lightest possible and matches `meta.ts`; measured client JS is within budget.
- [ ] Only semantic tokens, logical utilities and the shared class constants are used; lint passes with zero disables.
- [ ] Props follow the vocabulary (5.7), including the `xs | sm | md | lg | xl | custom` scale; controlled and uncontrolled both work; `className`, `style`, `ref` and rest props are passed through.
- [ ] `schema.ts` covers every design prop with defaults and limits, defaults live once in `constants.ts`, and limits are clamped at runtime.
- [ ] All built-in text comes from `labels`, with English and Arabic defaults, and any label with a number is a function using plural rules.
- [ ] `skeleton.tsx` matches the real dimensions; `states.tsx` exists if the component shows data.
- [ ] If the component renders items, it uses `useCollection`; a ten-thousand-item demo and a `loadMore` demo exist, and a Playwright test asserts the DOM row count stays under a hundred while scrolling.
- [ ] Scrolling follows 10.5: overlays scroll inside themselves, the page never scrolls behind an overlay, sticky bars set the scroll padding, and horizontal lists mirror in RTL.
- [ ] `demos/` covers every variant, size, tone and state, one demo per file.
- [ ] Unit tests cover behaviour and keyboard; axe reports zero violations.
- [ ] The `ssr` and `dom` tests pass: the server render throws nothing and hydration reports no recoverable error.
- [ ] The visual matrix is approved: {light, dark, custom} x {ltr, rtl} x {mobile, desktop}, and the frames match Figma within tolerance (6.6).
- [ ] Behaviour tests pass in Chromium, Firefox and WebKit, with RTL included in the smoke set.
- [ ] The docs page exists in English and Arabic, with a props table generated from the `.d.ts` and the schema.
- [ ] `meta.ts` records the Base UI version range the component was verified against.
- [ ] A changeset is added.

# 21. Risks and mitigations

| Risk | Mitigation |
|--------------------------------|-------------------------------------------------|
| Scope grows without end | Tiers; build what the portfolio and editor need next; v0.1 is tier 1 only, trimmed to 46 components |
| Base UI changes or is replaced one day | Pin versions. Public prop types are **TopClass-named aliases derived at the seam** (`Omit<Base.Root.Props, ...> & OwnProps`), never Base UI names in the public surface and never a hand-copied prop list, which would hide new props and drift |
| Tailwind major upgrade | Colours and knobs live in one tokens file; class strings live in `variants.ts` and `shared/classes.ts`, easy to find and codemod |
| Server/client boundary bugs | `check-boundaries`, the `rsc` Vitest project, SSR and hydration tests, flat exports |
| Flaky visual tests | Preview routes set `--tc-motion: 0`, use fixed fonts and deterministic demo data; baselines are generated only in the pinned Docker image and never on Windows |
| API inconsistency across components | The prop vocabulary, the shared contracts, the scaffold script and the Definition of Done |
| Accessibility regressions | axe in unit and browser tests; keyboard tests are required; the WCAG 2.2 checks of 5.6 |
| One maintainer, limited time | Small pull requests, strong automation, dogfooding before adding breadth |
| Plan details that go out of date | `docs/DECISIONS.md` records what actually shipped, and every rule has an owner in `docs/RULES.md` |

# 22. Ideas for after v0.1

- **`registry.json`** generated from every `meta.ts` and `schema.ts`: one machine-readable description of the whole library. It powers the docs, the editor's inspector and AI tools.
- **An MCP server** that serves the registry, so Claude Code, Cursor and similar tools can look up TopClass UI components, props and examples while coding.
- **A copy-paste CLI** (`npx topclassui add button`) for teams that prefer owning the source. Compatibility with the shadcn registry format was not verified for this plan; check the registry-item schema when the work is scheduled.
- **Comparison pages, a changelog page and a blog** under `/[locale]/...` (section 16). The changelog page is generated from the Changesets output; comparison pages are written only once v0.1 has something to compare.
- **Blocks and templates** (hero sections, pricing, dashboards, auth screens) in LTR and RTL. These drive adoption and search traffic more than single components do.
- **Figma library** kept in sync from the tokens file, so design and code never drift (6.6 is the starting point).
- **Theme builder**, **codemods** for upgrades, **VS Code snippets**.
- **An optional animation layer** and **charts**.
- **Hijri calendar** support in DatePicker for Arabic markets.

# 23. Rule files for AI assistants

Claude Code, Cursor and any other assistant must start from the same list of rules, and that list must not drift between them.

`docs/RULES.md` is the single source. It contains the numbered strict rules of section 5 (5.1 to 5.12), the folder contract (8.1), the state and collection contracts (8.2, 8.5), the scroll policy (10.5), the Definition of Done (20), the "how to work" list (section 0) and the commands. Each rule is one entry:

```text
### R-<section>-<n> <title>
**Rule:** one line.
**Why:** one line.
**Enforced by:** <eslint rule | script | test> or `manual`
```

`CLAUDE.md`, `AGENTS.md` (read by Cursor, Codex and others) and `.cursor/rules/topclassui.mdc` (front matter `description: TopClass UI rules`, `alwaysApply: true`) are **generated** from it by `pnpm rules:sync`, and `rules:sync --check` in `pnpm check` fails CI if any of them differs from the generated output. Rules marked `manual` are reviewed in every pull request through the template checklist. Deviations are recorded in `docs/DECISIONS.md` with the rule id.

Every generated file starts with the same sentence: "The full specification is docs/PLAN.md; the rules below are the complete list; do not deviate without a DECISIONS.md entry."

# Appendix A - CLAUDE.md for the repository

This is what `pnpm rules:sync` generates. Do not edit it by hand.

```text
# TopClass UI - working rules

The full specification is docs/PLAN.md; the rules below are the complete list;
do not deviate without a DECISIONS.md entry. Decisions are in docs/DECISIONS.md.

## Commands
pnpm check            lint + typecheck + unit tests + structure/boundary/contrast + rules:sync
pnpm test:visual      Playwright visual matrix (baselines are Linux-only)
pnpm size             bundle budgets
pnpm new:component x  scaffold a component folder

## How to work
- One phase at a time, one catalog row per branch. Plan first, then implement.
- Check the installed types before using an API. Never guess an API.
- Run pnpm check before reporting done, and report the real output.
- If a rule cannot be followed, stop and ask. Do not silently deviate.
- No new dependency and no extra scope without saying so.

## Rules that must never be broken (reasons are in PLAN.md section 5)
1. index.tsx is a Server Component: no 'use client', no hooks except useId and use,
   no import of ./hook.js. Interactivity lives only in client.tsx. Props crossing the
   boundary are serializable. For C components and connectors, index.tsx re-exports only.
2. Server Components never use React context. Direction and theme come from HTML attributes
   and CSS. Labels come from props.
3. Semantic colour classes only (bg-primary-solid). No palette classes, no arbitrary colours,
   no dark: variant, inside packages/react.
4. Logical utilities only (ps- pe- ms- me- inset-s- inset-e- text-start border-s rounded-s).
   No physical left/right utilities, no deprecated start-*/end-*, no space-x / divide-x.
   Directional motion uses --tc-dir. No tracking-* anywhere.
5. Sizes, radius, border width, the focus ring, hover, transitions and scroll classes come
   from knobs and shared/classes.ts, never from fixed values or hand-written hover:/focus-visible:.
6. The size scale is xs | sm | md | lg | xl | custom on every component that has one.
7. schema.ts is imported with `import type` only. Zod must not reach the client bundle.
   Defaults live once in constants.ts.
8. Flat named exports. No default exports. No dotting into client modules from server files.
9. No hard-coded user-visible text; use the labels prop (en + ar defaults). Labels with a
   number are functions using Intl.PluralRules.
10. Public prop types are TopClass-named aliases derived from the primitive at the seam.
    Never re-export a Base UI type name and never hand-copy a primitive's prop list.
11. Any component that renders a list uses the collection contract (PLAN.md 8.5):
    the --tc-list-rows knob, windowing above the threshold, optional page-by-page loading.
12. Scrolling follows PLAN.md 10.5. Tooltips never scroll; overlays scroll inside themselves;
    the page never scrolls behind an overlay; sticky bars set the scroll padding.
13. Code structure (PLAN.md 5.12): client.tsx is markup plus at most one hook from hook.ts;
    logic lives in hook.ts; pure helpers in lib.ts; files stay under 200 lines;
    comments are one line and only for what the code cannot say.
14. Icons: <Icon name> on the server, <Svg icon={x}> with an explicit import in client and
    shared files. Never import the loader map outside components/icon.
15. TypeScript strict: no any, no ts-ignore, explicit .js extensions in relative imports.
16. A component is finished only when the Definition of Done (section 20) is fully met,
    including its Figma parity check.
```

# Appendix B - Prompt template for building one component with Claude Code

```text
Build the <Name> component (tier <n>) following docs/PLAN.md.

0. Read docs/RULES.md and docs/DECISIONS.md.
1. Read PLAN.md sections 5, 8 and 9, section 10.5 if it scrolls, section 8.5 if it renders
   a list, and the catalog row for <Name> in section 18.
2. Open the <Name> frames in the Figma file (6.6). The design is the reference.
3. Check the installed Base UI types/docs for <primitive>. List the parts and props you will
   use, and anything that differs from the plan.
4. Propose, and wait for my OK:
   - public API: props, parts, events, labels, limits
   - rendering mode (S / Sp / C) and exactly which files the folder needs, with reasons
   - the demos for demos/ and the tests you will write
5. Run pnpm new:component <name>, then implement, test and write the demos.
6. Run pnpm check and the visual tests for this component. Show me the real output, the
   measured client JS size, and the diff against the Figma frames.
7. Write the docs page in English and Arabic, and add a changeset.
```

# Appendix C - Banned class patterns for the custom lint rule

The rule inspects string literals passed to `className`, `cn()`, `cva()` and `class` inside `packages/react` and `packages/icons`. Keep the hue list in sync with the installed Tailwind version; a unit test reads `node_modules/tailwindcss/theme.css`, extracts every `--color-<hue>-50` name and asserts the list matches.

```typescript
// A class starts at: string start, whitespace, a variant colon, or the legacy leading "!".
// A class ends at: whitespace, string end, or the v4 important suffix "!" (bg-red-500!).
export const BANNED_CLASS_PATTERNS: ReadonlyArray<{ pattern: RegExp; use: string }> = [
  { pattern: /(^|[\s:!])-?p[lr]-/, use: 'ps-* / pe-*' },
  { pattern: /(^|[\s:!])-?m[lr]-/, use: 'ms-* / me-*' },
  { pattern: /(^|[\s:!])-?(left|right)-/, use: 'inset-s-* / inset-e-*' },
  { pattern: /(^|[\s:!])-?(start|end)-(\d|px|full|auto|\[|\()/, use: 'inset-s-* / inset-e-* (start-*/end-* are deprecated)' },
  { pattern: /(^|[\s:!])(text|float|clear|object|bg)-(left|right)(?=[\s!]|$)/, use: 'text/float/clear: *-start / *-end; object/bg: rtl: variant' },
  { pattern: /(^|[\s:!])origin-(top-|bottom-)?(left|right)(?=[\s!]|$)/, use: 'origin-(--transform-origin) on popups; rtl:origin-* elsewhere' },
  { pattern: /(^|[\s:!])bg-linear-to-(r|l|tr|tl|br|bl)(?=[\s!]|$)/, use: 'bg-linear-[calc(90deg*var(--tc-dir))] or a vertical direction' },
  { pattern: /(^|[\s:!])border-[lr](?=-|[\s!]|$)/, use: 'border-s / border-e' },
  { pattern: /(^|[\s:!])rounded-(l|r|tl|tr|bl|br)(?=-|[\s!]|$)/, use: 'rounded-s/e/ss/se/es/ee' },
  { pattern: /(^|[\s:!])scroll-[mp][lr]-/, use: 'scroll-ms/me/ps/pe' },
  { pattern: /(^|[\s:!])-?(space|divide)-x-/, use: 'gap-* or border-s on children' },
  { pattern: /(^|[\s:!])-?translate-x-(?!\()/, use: 'translate-x-(--tc-slide) with calc(... * var(--tc-dir))' },
  { pattern: /(^|[\s:!])cursor-[ew]-resize(?=[\s!]|$)/, use: 'cursor-col-resize' },
  { pattern: /(^|[\s:!])tracking-/, use: 'nothing; letter-spacing breaks Arabic letter joining' },
  { pattern: /(^|[\s:!])duration-\d/, use: 'duration-(--tc-duration-fast|base|slow)' },
  { pattern: /(^|[\s:!])outline-(offset-)?\d/, use: 'FOCUS_RING from shared/classes.ts' },
  { pattern: /(^|[\s:!])dark:/, use: 'semantic tokens; never dark:' },
  { pattern: /(^|[\s:!])(hover|focus-visible):/, use: 'HOVER[variant] / FOCUS_RING from shared/classes.ts' },
  { pattern: /-\[#[0-9a-fA-F]{3,8}\]/, use: 'a semantic token' },
]

const HUES =
  'red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|' +
  'purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|mauve|olive|mist|taupe'
const PROPS =
  'bg|text|border(-[tbsexy])?|divide|ring|ring-offset|inset-ring|outline|fill|stroke|' +
  'from|via|to|shadow|inset-shadow|text-shadow|accent|caret|decoration|placeholder'

/** bg-neutral-solid (a tone token) is allowed; bg-neutral-500 (palette) is not.
 *  Also catches hover:bg-red-500, bg-red-500/50, bg-red-500!, border-s-red-500, ring-offset-white. */
export const BANNED_PALETTE = new RegExp(
  `(^|[\\s:!])(${PROPS})-((${HUES})-\\d{2,3}|white|black)(?=[/\\s!]|$)`,
)
```

A second rule reports template literals with interpolation inside class strings (`` `bg-${tone}` ``), because Tailwind cannot see dynamic class names. A third reports comment blocks longer than one line outside `shared/labels`, and a fourth reports `tooltip-content-is-text` violations.
