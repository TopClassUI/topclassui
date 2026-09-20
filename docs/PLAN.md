# TopClass UI - Master Build Plan

A design system for Next.js App Router and Tailwind CSS v4. Written to be executed with Claude Code.

Omar Abed - 20 September 2026 - plan v1.0

# 0. How to read and execute this plan

**Who this is for.** Claude Code, working with Omar Abed inside the TopClass UI repository. Omar reads it too, so it is written in plain language. It is the complete specification: goals, rules, architecture, examples, the component catalog, the roadmap and the acceptance criteria.

**What TopClass UI is.** A React design system for Next.js App Router and Tailwind CSS v4. Omar will use it in every project he builds (his portfolio, a visual 3D scroll-animation editor, client work) and publish it as open source at topclassui.com. Because it is meant to last for years, correctness, consistency and maintainability matter more than speed of delivery.

**How to work.**

1. Work one phase at a time (section 19). Start each phase in plan mode, write a short plan for that phase only, get Omar's OK, then implement.
2. One component per branch and per pull request. Conventional commits (`feat(button): ...`).
3. Before saying a task is done, run `pnpm check` (lint, types, unit tests, structure check, boundary check) and report the real output. If something fails and cannot be fixed, say so plainly.
4. Do not add scope. No component outside the current phase, and no new dependency without naming it, its purpose and its size in the PR description.
5. When a rule in this plan conflicts with reality (a library changed, a rule is impossible), stop, explain the conflict to Omar, and record the outcome in `docs/DECISIONS.md`. Do not silently deviate.

**Verify library APIs before using them.** The code in this document was written from the documentation as of September 2026 and has not been compiled. Before using any API from Base UI, Tailwind CSS v4, Next.js 16 or Zod 4, check the installed package's types or the official docs. Items marked **(verify)** are the ones most likely to differ. The examples show intent and structure; the installed versions are the authority on exact names.

**First actions in a fresh repo.**

1. Save this document as `docs/PLAN.md`.
2. Create `CLAUDE.md` from Appendix A so every session loads the core rules.
3. Create `docs/DECISIONS.md` and record the pinned versions chosen in Phase 0.

# 1. Vision, goals and non-goals

## Why this library should exist

These seven points are the reasons to build TopClass UI instead of using shadcn/ui. When two options compete, choose the one that protects these.

1. **RTL-first.** Arabic and other right-to-left languages are first-class. Every component is built and tested in both directions from day one, not patched later.
2. **Server-first.** Each component is split into `index.tsx` (server) and `client.tsx` (only the interactive part), so pages ship the least JavaScript possible.
3. **Adaptive connectors.** One component that is a dropdown on desktop and a bottom drawer on mobile, automatically, with the compiler guaranteeing both sides accept the same props. No more `if (isMobile)` in app code.
4. **One-file theming with global knobs.** Light, dark and any custom mode, plus global settings such as corner radius (square to pill), density and motion, all controlled from one CSS file.
5. **A state contract.** Loading, error and empty states are part of every data component, not an afterthought.
6. **Schema-described props.** Each component's design props are described by a Zod schema. That one schema feeds the docs props table, the playground controls, the future editor's inspector panel and AI tool definitions.
7. **SEO-aware.** Components render semantic, crawlable HTML, and the library ships an SEO kit (structured data, metadata helpers).

## Goals

- One design system used by all of Omar's projects, published as `@topclassui/*` on npm, source at github.com/TopClassUI, docs at topclassui.com.
- Strict TypeScript, fully tested, accessible (WCAG 2.2 AA), fast, consistent across browsers.
- A docs site that ranks well on Google in English and Arabic.

## Non-goals for v1

React Native, Vue or other frameworks; styling systems other than Tailwind; CSS-in-JS; legacy browsers; an animation library (may come later, the design leaves room for it); charts; a rich text editor.

## Success criteria (measurable)

- Docs pages score 100 in Lighthouse Performance, Accessibility, Best Practices and SEO.
- Zero axe violations across all demos.
- `Button` adds 0 KB of client JavaScript when used from a Server Component.
- Every demo passes the visual matrix: {light, dark, custom} x {ltr, rtl} x {mobile, desktop}.
- The portfolio and the editor run on it in production.

# 2. Technology stack

| Layer | Choice | Why |
|------------|----------------------|------------------------------------------|
| Language | TypeScript, strict | Lifetime maintainability; props are the public API |
| Target framework | Next.js 16 App Router, React 19.2 | Omar's stack; Server Components are the performance lever |
| Styling | Tailwind CSS v4 (CSS-first config) | Theme variables become utilities automatically; oklch palette |
| Behaviour primitives | Base UI (`@base-ui/react`, v1.x) | Accessible unstyled parts, collision-aware positioning, Drawer, Toast. Made by the creators of Radix, Floating UI and Material UI; stable since Dec 2025 |
| Variants | `class-variance-authority`, `clsx`, `tailwind-merge` v3 | Typed variants and safe class merging |
| Schemas | Zod 4 | `z.toJSONSchema()` for docs and AI tools **(verify)** |
| Icons | Phosphor (default) as an SVG sprite | Zero JS, works in Server Components |
| Monorepo | pnpm workspaces + Turborepo | Cached tasks, clear package boundaries |
| Package build | `tsc` only, ESM only, one output file per source file | Keeps the `'use client'` directive intact |
| Unit tests | Vitest, Testing Library, user-event, vitest-axe | Fast, standard |
| Browser tests | Playwright + `@axe-core/playwright` | Chromium, Firefox, WebKit; visual regression |
| Lint / format | ESLint 9 flat config, typescript-eslint strict, Prettier + `prettier-plugin-tailwindcss`, custom rules | The strict rules are enforced by tools, not memory |
| Release | Changesets, publint, `@arethetypeswrong/cli`, size-limit | Safe publishing and bundle budgets |
| Docs | Next.js 16 app, MDX, Shiki at build time | The docs site must be built with TopClass UI itself |

**Optional dependencies, loaded only by the component that needs them:** TanStack Table (DataTable), TanStack Virtual (VirtualList), react-day-picker (Calendar, DatePicker), Embla (Carousel), react-resizable-panels (Resizable), dnd-kit (sortable), react-hook-form (Form adapter). They are declared as optional peer dependencies so installing the library for a Button never pulls them in.

**Version policy.** In Phase 0 install the latest stable version of each tool, pin exact versions, and record them in `docs/DECISIONS.md`. Enable Renovate or Dependabot with a weekly schedule.

# 3. Decisions

## Decisions already made

| # | Decision | Reason |
|----|--------------------------|----------------------------------------------|
| D1 | Build behaviour on Base UI | Focus traps, collision handling, scroll lock and ARIA patterns are years of work; TopClass UI's value is elsewhere |
| D2 | Ship as a versioned npm package | One upgrade path for all of Omar's projects. A copy-paste registry can be added later |
| D3 | `schema.ts` is imported as a type only by components | Zod never reaches the browser bundle |
| D4 | Icons are an SVG sprite with `<Icon name>` | A component that imports every icon breaks tree-shaking |
| D5 | Modes use a `data-theme` attribute | Supports unlimited custom modes and nested themed sections |
| D6 | Server Components never rely on React context | Context is unavailable on the server. Direction and theme come from HTML attributes and CSS; text labels come from props |
| D7 | A file exists only if the component needs it | No empty `client.tsx` or `error.tsx`; a script validates the folder contract |
| D8 | Flat named exports (`DialogRoot`, `DialogTrigger`) | A Server Component cannot read properties of a client module object, so `Dialog.Root` exported from a client file breaks |
| D9 | Components use semantic tokens only | This is what makes custom modes free |
| D10 | Core stays framework-agnostic React; Next.js-specific pieces live in `@topclassui/next` | Usable outside Next.js, no cost to the Next.js experience |

## Open decisions (defaults apply until Omar changes them)

| # | Question | Default |
|----|-------------------------------|------------------------------------------|
| O1 | Icon library | Phosphor, regular weight |
| O2 | Brand colour | Tailwind `violet` as a placeholder |
| O3 | Fonts (docs site only; the library ships none) | Inter + IBM Plex Sans Arabic via `next/font` |
| O4 | Licence | MIT |
| O5 | Docs hosting | Vercel |
| O6 | Default radius | `0.5rem` |
| O7 | Adaptive breakpoint | below `48rem` is mobile |
| O8 | Locales | `en` and `ar` |

# 4. Repository architecture

```text
topclassui/
  CLAUDE.md
  docs/
    PLAN.md  DECISIONS.md
  apps/
    docs/                     Next.js App Router: docs, colors, icons, playground, preview
  packages/
    tokens/                   CSS only: semantic tokens, modes, global knobs
    icons/                    raw SVGs, build script, sprite, <Icon>
    react/
      src/
        shared/               cn, clamp, labels, contracts, floating defaults, adaptive
        components/<name>/    the folder contract (section 8)
        connectors/<name>/    adaptive components (section 11)
    next/                     ThemeScript, Link/Image adapters, metadata + JSON-LD helpers
    eslint-config/            shared ESLint config and the custom rules
    tsconfig/                 shared tsconfig bases
  scripts/
    new-component.ts          scaffolds a component folder
    check-structure.ts        validates the folder contract
    check-boundaries.ts       validates server/client rules
    check-contrast.ts         WCAG contrast of every token pair in every mode
```

## Package exports

Consumers import by subpath so bundlers only ever see the components they use. There is no root barrel file.

```json
{
  "name": "@topclassui/react",
  "type": "module",
  "sideEffects": ["**/*.css"],
  "exports": {
    "./styles.css": "./dist/styles.css",
    "./connectors/*": {
      "types": "./dist/connectors/*/index.d.ts",
      "default": "./dist/connectors/*/index.js"
    },
    "./schemas/*": {
      "types": "./dist/components/*/schema.d.ts",
      "default": "./dist/components/*/schema.js"
    },
    "./*": {
      "types": "./dist/components/*/index.d.ts",
      "default": "./dist/components/*/index.js"
    }
  },
  "peerDependencies": { "react": "^19.0.0", "react-dom": "^19.0.0", "tailwindcss": "^4.0.0" }
}
```

Usage: `import { Button } from '@topclassui/react/button'`.

## TypeScript base config

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true
  }
}
```

- `verbatimModuleSyntax` forces `import type`, which guarantees type-only imports (the Zod schemas) are erased.
- `NodeNext` requires explicit `.js` extensions on relative imports (`'./client.js'`). This makes the published ESM valid for every consumer, including plain Node. The examples in this plan use that style.
- If `exactOptionalPropertyTypes` fights third-party types too much, turn it off and record why.

## Build and consumption

- Build with `tsc -p tsconfig.build.json`. No bundler. `tsc` keeps the `'use client'` string at the top of each file. A bundler that merges files would strip or misplace it and silently break the server/client split. After every build run `publint` and `attw`.
- Inside the monorepo the docs app consumes the package source through `transpilePackages` in `next.config.ts`. **(verify)** that Turbopack resolves `./client.js` to `client.tsx` for workspace source. If it does not, the docs app consumes `dist` and the package runs `tsc --watch`.
- A consumer's CSS entry is three lines:

```css
@import "tailwindcss";
@import "@topclassui/tokens";
@import "@topclassui/react/styles.css";
```

`styles.css` inside the react package contains `@source "./";` so Tailwind scans the library's compiled files for class names. `@source` paths are relative to the stylesheet that declares them **(verify)**. Without this, Tailwind ignores `node_modules` and the components render unstyled.

# 5. The strict rules

Every rule has a reason. The rules are enforced by ESLint rules and scripts wherever possible, because a rule that lives only in a document gets broken.

## 5.1 Server-first

- A component is a Server Component unless it cannot be. Interactivity goes in `client.tsx` and nowhere else.
- `index.tsx` never contains `'use client'`, never imports React client hooks, and never imports `./hook.js`. `scripts/check-boundaries.ts` fails the build if it does.
- Props passed from `index.tsx` to `client.tsx` must be serializable: data and `children`. Never functions (Server Actions are the only exception).
- Server Components cannot read React context. Direction and theme come from `dir` and `data-theme` on the HTML, handled in CSS. Text labels come from a `labels` prop.
- Full patterns and examples are in section 9.

## 5.2 Styling

- **Semantic classes only** inside `packages/react`: `bg-primary`, `text-fg`, `border-border`. Palette classes (`bg-violet-600`), arbitrary colours (`bg-[#fff]`) and the `dark:` variant are banned there. Reason: a component that never names a real colour works in every mode, including modes that do not exist yet.
- Merge classes with `cn()` (`clsx` + `tailwind-merge`). The consumer's `className` is always applied last so it wins.
- Never build class names dynamically (`` `bg-${tone}` ``). Tailwind only sees complete strings. Use a lookup object or cva variants.
- No inline `style` except to set a CSS variable.
- Global feel comes from knobs (`rounded-control`, `h-control-md`), never from hard-coded values (`rounded-md`, `h-10`), so one variable changes every component.

## 5.3 RTL

Use logical utilities so layout follows the text direction automatically.

| Banned | Use instead |
|--------------------------------|------------------------------------------|
| `pl-*` `pr-*` | `ps-*` `pe-*` |
| `ml-*` `mr-*` | `ms-*` `me-*` |
| `left-*` `right-*` | `start-*` `end-*` **(verify: Tailwind 4.2+ may prefer `inset-s-*` / `inset-e-*`)** |
| `text-left` `text-right` | `text-start` `text-end` |
| `border-l` `border-r` | `border-s` `border-e` |
| `rounded-l` `rounded-r` `rounded-tl` ... | `rounded-s` `rounded-e` `rounded-ss` `rounded-se` `rounded-es` `rounded-ee` |
| `float-left` `float-right` | `float-start` `float-end` |
| `scroll-ml` `scroll-pr` ... | `scroll-ms` `scroll-pe` ... |
| `space-x-*` `divide-x-*` | `gap-*` on flex or grid; `border-s` on children |

- Directional motion (slide-in, translate, transform origin) multiplies by `--tc-dir`, which is `1` in LTR and `-1` in RTL: `translate-x-[calc(1rem*var(--tc-dir))]`.
- Directional icons (arrows, carets, "send", "undo") flip automatically in RTL (section 7). Non-directional icons (search, clock, check) never flip.
- No `tracking-*` (letter-spacing) on Arabic text; it breaks the joined letter shapes. Arabic font and line-height are set through `:lang(ar)`.
- Text a user types can be in either direction: inputs accept `dir="auto"`, and user-generated text inside components is wrapped in `<bdi>`.
- Overlay placements are logical (`bottom-start`), so a menu opens on the correct side in both directions.

## 5.4 Responsive

- Mobile-first classes.
- Components respond to their **container**, not the viewport, using Tailwind's container queries (`@container`, `@md:`). A card in a narrow sidebar must look right on a wide screen.
- Touch targets: `pointer-coarse:min-h-11` (44px) on interactive controls.
- Switching between a desktop and a mobile pattern is the job of connectors (section 11), not of app code.

## 5.5 Browser support

- Tailwind v4 sets the floor: Safari 16.4+, Chrome 111+, Firefox 128+. Declare it in `browserslist`.
- Nothing newer than that baseline without a fallback (examples needing care: CSS anchor positioning, `@starting-style`, `field-sizing`).
- Use `dvh` for full-height overlays and `env(safe-area-inset-*)` for anything pinned to a screen edge on iOS.
- All behaviour tests run in Chromium, Firefox and WebKit.

## 5.6 Accessibility

- Target WCAG 2.2 AA. Keyboard behaviour follows the WAI-ARIA Authoring Practices (Base UI provides this; do not break it when styling).
- A visible focus ring on every interactive element via `focus-visible`. Never remove an outline without replacing it.
- Types enforce labels: `IconButton` requires `label`; `Image` requires `alt`; form controls require a label through `Field`.
- Respect `prefers-reduced-motion` and support `forced-colors` (borders stay visible in Windows high-contrast mode).
- Contrast of every foreground/background token pair is checked in CI for every mode (`scripts/check-contrast.ts`, 4.5:1 for text, 3:1 for UI borders and icons).
- Essential information never lives only in a tooltip.

## 5.7 TypeScript and API conventions

Consistency across components is the main feature of a design system. Every component follows the same vocabulary.

- **Prop vocabulary:** `variant` (visual style), `tone` (`primary | neutral | success | warning | danger | info`), `size` (`sm | md | lg`; add `xs`/`xl` only when truly needed), plus booleans with positive names (`disabled`, `loading`, `fullWidth`, never `isDisabled`).
- **Events:** `onValueChange(value)`, `onOpenChange(open)`.
- **Controlled and uncontrolled:** `value` + `defaultValue`, `open` + `defaultOpen`.
- **Always:** accept `className`, `style`, `ref` (React 19: `ref` is a normal prop, no `forwardRef`), and spread remaining props onto the root element.
- **Polymorphism:** a `render` prop in Base UI's style (`render={<Link href="/x" />}`) so a Button can be a real link. Use Base UI's `useRender` and `mergeProps` for components that are not Base UI parts **(verify)**.
- **State hooks for styling and tests:** `data-state`, `data-disabled`, `data-loading`, `data-invalid`, `data-variant`, `data-size`.
- **Exports:** flat named exports only, no default exports. Each component's index exports the component(s), their prop types, its `xxxVariants`, and its skeleton.
- **Limits:** numeric props have documented `min`/`max` in the schema and are clamped at runtime with `clamp()` so a bad value can never break the UI.
- No `any`, no non-null assertions without a comment explaining why, no `@ts-ignore`.

## 5.8 Motion

- CSS only, animating `transform` and `opacity`. Durations are multiplied by `--tc-motion` (`0` disables motion globally).
- Enter/exit transitions use the data attributes Base UI sets while mounting and unmounting **(verify: `data-starting-style`, `data-ending-style`)**.
- Off under `prefers-reduced-motion`.
- An animation library can be added later as an optional layer. Components must not depend on one.

## 5.9 Dependencies

- Allowed in core: `react`, `@base-ui/react`, `clsx`, `tailwind-merge`, `class-variance-authority`.
- Everything else is an optional peer dependency used by exactly the components that need it.
- Banned: CSS-in-JS runtimes, lodash, moment, runtime theme objects.

## 5.10 Naming

- Folders and files: kebab-case. Components: PascalCase. Hooks: `useThing`.
- CSS variables: `--tc-*`. Component-scoped variables only when needed: `--tc-button-*`.
- Storage keys, data attributes and class prefixes that belong to the library start with `tc`.

## 5.11 Built-in text

- No hard-coded user-visible English inside a component. Every built-in string ("Close", "Next page", "No results", "Try again") comes from a `labels` prop with defaults from `shared/labels/en.ts`.
- `shared/labels/ar.ts` ships too. Client components can also read labels from `TopClassProvider`; Server Components take them as props.

# 6. Tokens, modes and global knobs (Phase 1)

## 6.1 Three layers

1. **Palette** - Tailwind's built-in oklch colours (`--color-violet-600`) plus, later, a generated brand scale. Components never use this layer directly.
2. **Semantic tokens** (`--tc-*`) - what a colour is *for*: background, text, border, each tone. A mode is just a different set of values for these.
3. **Global knobs** - radius, density, border width, motion, fonts. One variable changes every component.

Soft (tinted) tone backgrounds are **derived** with `color-mix`, not defined by hand, so a custom mode needs about ten variables instead of forty.

## 6.2 The tokens file

```css
/* packages/tokens/src/index.css
   Consumer order:  @import "tailwindcss";  then  @import "@topclassui/tokens";  */

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

:root {
  color-scheme: light;

  /* ---------- global knobs: the one place that controls the feel ---------- */
  --tc-radius: 0.5rem;          /* 0 = square, 9999px = pill */
  --tc-border-width: 1px;
  --tc-ring-width: 2px;
  --tc-ring-offset: 2px;
  --tc-density: 1;              /* 0.875 compact, 1 default, 1.125 comfortable */
  --tc-motion: 1;               /* 0 = no animation */
  --tc-font-sans: ui-sans-serif, system-ui, sans-serif;
  --tc-font-arabic: var(--tc-font-sans);
  --tc-font-mono: ui-monospace, monospace;
  --tc-dir: 1;

  /* ---------- semantic colours: base ---------- */
  --tc-bg: var(--color-white);
  --tc-surface: var(--color-neutral-50);
  --tc-surface-raised: var(--color-white);
  --tc-fg: var(--color-neutral-950);
  --tc-muted-fg: var(--color-neutral-600);
  --tc-border: var(--color-neutral-200);
  --tc-border-strong: var(--color-neutral-400);
  --tc-overlay: oklch(0 0 0 / 0.5);

  /* ---------- semantic colours: tones (solid + text that sits on it) ---------- */
  --tc-primary: var(--color-violet-600);
  --tc-primary-fg: var(--color-white);
  --tc-neutral: var(--color-neutral-900);
  --tc-neutral-fg: var(--color-white);
  --tc-success: var(--color-emerald-600);
  --tc-success-fg: var(--color-white);
  --tc-warning: var(--color-amber-500);
  --tc-warning-fg: var(--color-neutral-950);
  --tc-danger: var(--color-red-600);
  --tc-danger-fg: var(--color-white);
  --tc-info: var(--color-sky-600);
  --tc-info-fg: var(--color-white);
  --tc-ring: var(--tc-primary);
}

[data-theme="dark"] {
  color-scheme: dark;
  --tc-bg: var(--color-neutral-950);
  --tc-surface: var(--color-neutral-900);
  --tc-surface-raised: var(--color-neutral-800);
  --tc-fg: var(--color-neutral-50);
  --tc-muted-fg: var(--color-neutral-400);
  --tc-border: var(--color-neutral-800);
  --tc-border-strong: var(--color-neutral-600);
  --tc-overlay: oklch(0 0 0 / 0.7);
  --tc-primary: var(--color-violet-500);
  --tc-neutral: var(--color-neutral-100);
  --tc-neutral-fg: var(--color-neutral-950);
}

/* A custom mode is one more block. It may change knobs as well as colours. */
[data-theme="ocean"] {
  --tc-primary: var(--color-cyan-600);
  --tc-radius: 9999px;
}

/* Derived tokens are declared on every themed element, not only :root,
   so a nested <section data-theme="dark"> recomputes them correctly. */
:root,
[data-theme] {
  --tc-primary-soft: color-mix(in oklch, var(--tc-primary) 12%, var(--tc-bg));
  --tc-neutral-soft: color-mix(in oklch, var(--tc-neutral) 8%, var(--tc-bg));
  --tc-success-soft: color-mix(in oklch, var(--tc-success) 12%, var(--tc-bg));
  --tc-warning-soft: color-mix(in oklch, var(--tc-warning) 16%, var(--tc-bg));
  --tc-danger-soft: color-mix(in oklch, var(--tc-danger) 12%, var(--tc-bg));
  --tc-info-soft: color-mix(in oklch, var(--tc-info) 12%, var(--tc-bg));
}

[dir="rtl"] { --tc-dir: -1; }
:lang(ar) { --tc-font-sans: var(--tc-font-arabic); letter-spacing: 0; }

/* Map tokens to Tailwind utilities. "inline" makes utilities read the --tc-*
   variable at the element, so modes and nested themes work. */
@theme inline {
  --color-bg: var(--tc-bg);
  --color-surface: var(--tc-surface);
  --color-surface-raised: var(--tc-surface-raised);
  --color-fg: var(--tc-fg);
  --color-muted-fg: var(--tc-muted-fg);
  --color-border: var(--tc-border);
  --color-border-strong: var(--tc-border-strong);
  --color-overlay: var(--tc-overlay);
  --color-ring: var(--tc-ring);

  --color-primary: var(--tc-primary);
  --color-primary-fg: var(--tc-primary-fg);
  --color-primary-soft: var(--tc-primary-soft);
  --color-neutral: var(--tc-neutral);
  --color-neutral-fg: var(--tc-neutral-fg);
  --color-neutral-soft: var(--tc-neutral-soft);
  --color-success: var(--tc-success);
  --color-success-fg: var(--tc-success-fg);
  --color-success-soft: var(--tc-success-soft);
  --color-warning: var(--tc-warning);
  --color-warning-fg: var(--tc-warning-fg);
  --color-warning-soft: var(--tc-warning-soft);
  --color-danger: var(--tc-danger);
  --color-danger-fg: var(--tc-danger-fg);
  --color-danger-soft: var(--tc-danger-soft);
  --color-info: var(--tc-info);
  --color-info-fg: var(--tc-info-fg);
  --color-info-soft: var(--tc-info-soft);

  --radius-control: var(--tc-radius);                        /* buttons, inputs */
  --radius-box: min(calc(var(--tc-radius) * 1.5), 1.5rem);   /* cards, dialogs */
  --radius-chip: min(calc(var(--tc-radius) * 0.5), 0.5rem);  /* badges, checkboxes */

  --font-sans: var(--tc-font-sans);
  --font-mono: var(--tc-font-mono);

  --spacing-control-sm: calc(2rem * var(--tc-density));
  --spacing-control-md: calc(2.5rem * var(--tc-density));
  --spacing-control-lg: calc(3rem * var(--tc-density));
}
```

Notes for implementation:

- Every `--color-*` theme variable automatically becomes `bg-*`, `text-*`, `border-*`, `ring-*`, `outline-*`, `fill-*`, `stroke-*`, `from-*` and so on. This is the "custom colour classes that work on text, background, etc." requirement.
- The `min()` on `--radius-box` stops cards turning into circles when buttons are pills.
- `h-control-md` should come from `--spacing-control-md` **(verify that named keys in the `--spacing-*` namespace generate sizing utilities; if not, use `h-(--tc-control-md)`)**.
- Tailwind may drop palette variables it thinks are unused. If a `--color-*` value referenced only from this file is missing in the output, declare the palette with `@theme static` **(verify)**.
- z-index is a small fixed scale as plain variables (`--tc-z-sticky: 10` ... `--tc-z-toast: 70`), because all overlays portal into one layer and the app root uses `isolation: isolate`.

## 6.3 Switching modes without a flash, while pages stay static

Reading the theme from a cookie on the server makes every page dynamic, which hurts caching and SEO. Instead a tiny inline script sets the attribute before first paint.

```typescript
// packages/next/src/theme-script.tsx  (Server Component)
const code = `(function(){try{var t=localStorage.getItem('tc-theme');
if(!t||t==='system'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}
document.documentElement.dataset.theme=t}catch(e){}})()`

export function ThemeScript({ nonce }: { nonce?: string | undefined }) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: code }} />
}
```

- Put `<ThemeScript />` in `<head>` and `suppressHydrationWarning` on `<html>`.
- A client hook `useTheme()` reads and sets the value, persists it under `tc-theme`, and follows system changes when the value is `system`.
- Any element can carry `data-theme`, so a dark hero inside a light page just works.

## 6.4 The colours page

A docs page modelled on Tailwind's colour reference.

- Grid 1: the palette, 50-950 per hue, showing the oklch value on hover and copying the class name on click.
- Grid 2: every semantic token, shown in all modes side by side, with the class name (`bg-primary`), the variable (`--tc-primary`) and a contrast badge (AA pass or fail) for each foreground/background pair.
- Live controls at the top: mode, direction, radius, density. They change the page itself so the knobs are demonstrated, not described.

## 6.5 Later: theme builder

A page where a user picks a brand colour, radius and density and receives a ready `[data-theme="x"] { ... }` block. The 50-950 brand scale is generated in oklch. Not part of v0.1.

# 7. Icons (Phase 2)

## 7.1 Approach

A single `<Icon name="...">` component that imports every icon would put every icon in every bundle. Instead the icons are compiled into one SVG **sprite**, and `<Icon>` references a symbol inside it.

Benefits: zero JavaScript, works in Server Components, one cached request, and `name` is type-checked against the icons that really exist.

Constraints to respect: the sprite must be served from the same origin as the page (`<use>` does not load cross-origin), and individual paths cannot be styled separately (one colour per icon through `currentColor`).

## 7.2 Pipeline

1. Only the SVG files actually used are placed in `packages/icons/raw/` (downloaded from the chosen library). This folder is the allow-list, which keeps the sprite small.
2. `pnpm icons:build` runs SVGO on each file, removes hard-coded colours so icons use `currentColor`, wraps each in `<symbol id="name" viewBox="...">`, and writes `dist/sprite.svg`.
3. The same script generates `src/names.generated.ts` (a union type of all names), `src/directional.generated.ts` (names that flip in RTL, matched by pattern: `arrow-*`, `caret-*`, `chevron-*`, plus a manual list) and a content hash used as `?v=` for cache busting.
4. A small CLI, `topclassui-icons sync --out public/topclass-icons.svg`, copies the sprite into an app's `public/` folder. Apps run it in their build step.

## 7.3 The component

```typescript
// packages/icons/src/index.tsx  (Server Component, zero JS)
import type { SVGProps } from 'react'
import { DIRECTIONAL } from './directional.generated.js'
import type { IconName } from './names.generated.js'
import { SPRITE_URL } from './sprite-url.generated.js'

export type { IconName }

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  /** CSS size. Defaults to 1em so the icon follows the text size. */
  size?: number | string | undefined
  /** Set for a meaningful icon; leave unset for a decorative one. */
  label?: string | undefined
  /** Defaults to true for directional icons (arrows, carets). */
  flipRtl?: boolean | undefined
}

export function Icon({ name, size = '1em', label, flipRtl, className, ...rest }: IconProps) {
  const flip = flipRtl ?? DIRECTIONAL.has(name)
  const classes = ['inline-block shrink-0', flip ? 'rtl:-scale-x-100' : '', className ?? '']
    .filter(Boolean)
    .join(' ')

  return (
    <svg
      width={size}
      height={size}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      className={classes}
      {...rest}
    >
      <use href={`${SPRITE_URL}#${name}`} />
    </svg>
  )
}
```

## 7.4 The icons page

A searchable grid. Clicking an icon copies `<Icon name="..." />`. Controls for size and colour, and a direction toggle that shows which icons flip.

# 8. Component anatomy

## 8.1 The folder contract

Each component is a folder. A file exists only when the component needs it. `pnpm new:component <name>` scaffolds the folder, and `pnpm check:structure` fails CI when a folder breaks the contract.

| File | Role | Rule |
|----------------|--------------------------------------|----------------------------------------|
| `index.tsx` | Server/shared markup; the public entry | No `'use client'`, no hooks. Required |
| `client.tsx` | Only the interactive parts | First line is `'use client'`. As small as possible |
| `variants.ts` | cva class definitions | Exported, so other elements can reuse the look (a link styled as a button) |
| `schema.ts` | Zod schema of the design props, with min/max | Components import it with `import type` only |
| `constants.ts` | Limits and defaults shared by schema and component | No imports from Zod |
| `hook.ts` | Behaviour logic | Imported only by `client.tsx` |
| `loading.tsx` | Skeleton with the same dimensions as the real component | Usable as a `<Suspense fallback>`; layout shift must be zero |
| `error.tsx` | Default error and empty states | Data components only; overridable by props |
| `dummy.tsx` | Demos and fake data | The single source for docs, visual tests and the playground |
| `meta.ts` | Name, category, tier, status, Base UI primitive, optional deps | Feeds the docs navigation and a generated `registry.json` |
| `index.test.tsx` | Unit and accessibility tests | Required |

## 8.2 The state contract

Data-bearing components (Table, DataTable, Select with remote options, Combobox, Command, TreeView, FileUpload, lists) share one contract:

```typescript
// shared/state.ts
import type { ReactNode } from 'react'

export interface StateProps {
  status?: 'idle' | 'loading' | 'error' | 'empty' | undefined
  loadingFallback?: ReactNode
  errorFallback?: ReactNode
  emptyFallback?: ReactNode
  onRetry?: (() => void) | undefined
}
```

Defaults come from the component's own `loading.tsx` and `error.tsx`. Simple controls get a plain `loading` boolean (Button shows a spinner and sets `aria-busy`). With Server Components the same skeleton is used as `<Suspense fallback={<TableSkeleton rows={5} />}>`, which streams content in without layout shift.

## 8.3 Schemas without runtime cost

The schema is the single source of truth for design props, and costs nothing at runtime because components import only its type:

```typescript
// components/button/schema.ts
import { z } from 'zod'

export const buttonSchema = z.object({
  variant: z.enum(['solid', 'soft', 'outline', 'ghost', 'link']).default('solid'),
  tone: z.enum(['primary', 'neutral', 'danger']).default('primary'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  loading: z.boolean().default(false),
  fullWidth: z.boolean().default(false),
})

/** z.input keeps fields that have defaults optional, which is what props need. */
export type ButtonDesignProps = z.input<typeof buttonSchema>
```

Limits use the shared constants so the schema and the runtime clamp can never disagree:

```typescript
// components/progress/constants.ts
export const PROGRESS_MIN = 0
export const PROGRESS_MAX = 100

// components/progress/schema.ts
import { z } from 'zod'
import { PROGRESS_MAX, PROGRESS_MIN } from './constants.js'

export const progressSchema = z.object({
  value: z.number().min(PROGRESS_MIN).max(PROGRESS_MAX).default(0),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
})
```

Who uses the real schema object: the docs props table and playground controls, the generated `registry.json`, the future editor's inspector panel, and AI tool definitions through `z.toJSONSchema()`. Props that a schema cannot express (`children`, event handlers, `ref`) are added in the TypeScript interface.

## 8.4 Full example: Button

Button needs no `client.tsx`, no `hook.ts` and no `error.tsx`, so those files do not exist.

```typescript
// components/button/variants.ts
import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium',
    'rounded-control border border-transparent transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress',
    'pointer-coarse:min-h-11',
  ],
  {
    variants: {
      variant: {
        solid: 'bg-primary text-primary-fg hover:bg-primary/90',
        soft: 'bg-primary-soft text-primary hover:bg-primary/20',
        outline: 'border-border text-fg hover:bg-surface',
        ghost: 'text-fg hover:bg-surface',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-control-sm px-3 text-sm',
        md: 'h-control-md px-4 text-sm',
        lg: 'h-control-lg px-6 text-base',
      },
      fullWidth: { true: 'w-full' },
    },
    defaultVariants: { variant: 'solid', size: 'md' },
  },
)
```

The example shows the `primary` tone only. Tones are implemented as cva compound variants (`variant` x `tone`) using the matching `-soft` and `-fg` tokens.

```typescript
// components/button/index.tsx
// No 'use client': a Server Component by default, and it becomes part of the
// client bundle only when a client file imports it (for example to add onClick).
import type { ComponentPropsWithRef } from 'react'
import { Icon } from '@topclassui/icons'
import { cn } from '../../shared/cn.js'
import type { ButtonDesignProps } from './schema.js' // type-only: Zod is never bundled
import { buttonVariants } from './variants.js'

export interface ButtonProps extends ComponentPropsWithRef<'button'>, ButtonDesignProps {}

export function Button({
  variant = 'solid',
  size = 'md',
  loading = false,
  fullWidth = false,
  type = 'button',
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-loading={loading ? '' : undefined}
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...rest}
    >
      {loading ? <Icon name="spinner" className="animate-spin motion-reduce:animate-none" /> : null}
      {children}
    </button>
  )
}

export { buttonVariants }
export { ButtonSkeleton } from './loading.js'
```

```typescript
// components/button/loading.tsx
import { cn } from '../../shared/cn.js'
import type { ButtonDesignProps } from './schema.js'

const SIZES = {
  sm: 'h-control-sm w-20',
  md: 'h-control-md w-24',
  lg: 'h-control-lg w-32',
} as const

type ButtonSkeletonProps = Pick<ButtonDesignProps, 'size' | 'fullWidth'>

export function ButtonSkeleton({ size = 'md', fullWidth = false }: ButtonSkeletonProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'block animate-pulse rounded-control bg-surface motion-reduce:animate-none',
        SIZES[size],
        fullWidth && 'w-full',
      )}
    />
  )
}
```

```typescript
// components/button/dummy.tsx  -- demos used by docs, visual tests and the playground
import { Button } from './index.js'

export const buttonDemos = {
  variants: () => (
    <div className="flex flex-wrap gap-3">
      <Button>Save</Button>
      <Button variant="soft">Draft</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">Skip</Button>
    </div>
  ),
  sizes: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
  loading: () => <Button loading>Saving</Button>,
}
```

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
  optionalDeps: [],
} satisfies ComponentMeta
```

For SEO, navigation must be a real link, not a button with a click handler. Use `render` for polymorphism or apply `buttonVariants()` to a `<Link>`.

# 9. The server / client split in depth

## 9.1 The pattern: client shell, server children

The client file holds only the interaction. The content is rendered on the server and passed in as `children`, so it is real HTML for search engines and costs no JavaScript.

```typescript
// components/accordion/client.tsx
'use client'

import type { ReactNode } from 'react'
import { Accordion as Base } from '@base-ui/react/accordion'
import { Icon } from '@topclassui/icons'

export function AccordionRoot({ children }: { children: ReactNode }) {
  return (
    <Base.Root className="divide-y divide-border rounded-box border border-border">
      {children}
    </Base.Root>
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
          <Icon
            name="caret-down"
            className="transition-transform group-data-[panel-open]:rotate-180"
          />
        </Base.Trigger>
      </Base.Header>
      {/* hiddenUntilFound keeps closed content in the HTML: findable with Ctrl+F
          and visible to crawlers. (verify the prop name in Base UI) */}
      <Base.Panel hiddenUntilFound className="px-4 pb-4 text-muted-fg">
        {children}
      </Base.Panel>
    </Base.Item>
  )
}
```

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
```

Both the data-driven `Accordion` (easy path) and the parts (`AccordionRoot`, `AccordionItem`, full control) are exported. Every compound component offers both.

## 9.2 Rules and traps

1. `'use client'` is the first line of `client.tsx`. Nothing above it except comments.
2. A file with no directive is a *shared* component: server when imported from a server file, client when imported from a client file. That is why Button works everywhere. Shared files must not use anything server-only or client-only.
3. **Do not dot into a client module from a server file.** `Dialog.Root`, where `Dialog` is an object exported from a client file, throws in Server Components. Export flat names. (Using Base UI's own `Accordion.Root` namespace *inside* `client.tsx` is fine, because that file is already client code.)
4. Only serializable props cross the boundary: strings, numbers, booleans, plain objects, arrays, `ReactNode` children. No functions, except Server Actions.
5. Context does not exist on the server (rule D6).
6. Heavy client parts (Command, DatePicker, ColorPicker) are loaded lazily and mounted when first opened, not on page load.
7. Overlay content that matters for SEO (accordion panels, tab panels) stays in the HTML. Overlay content that does not (menus, dialogs) is not mounted until opened.
8. `pnpm check:boundaries` parses every `index.tsx` and fails if it contains `'use client'`, imports a client hook from `react`, or imports `./hook.js`.

# 10. Overlays and floating elements

## 10.1 Never cut off by the screen

Base UI's Positioner (built on Floating UI) flips, shifts and resizes popups. TopClass UI sets the defaults **once**, and every floating component uses them, so behaviour is identical everywhere.

```typescript
// shared/floating.ts
export const FLOATING = {
  sideOffset: 8,
  collisionPadding: 8,
} as const

/** Applied to every popup: never larger than the free space, scrolls inside. */
export const POPUP_BOUNDS =
  'max-h-(--available-height) max-w-(--available-width) overflow-y-auto origin-(--transform-origin)'
```

Base UI exposes `--available-height`, `--available-width`, `--anchor-width` and `--transform-origin` on the positioner **(verify)**. With these, a long menu near the bottom of the screen flips upward, and if there is still not enough room it shrinks and scrolls instead of overflowing.

Components that use these defaults: Tooltip, Popover, HoverCard, Dropdown, ContextMenu, Menubar, NavigationMenu, Select, Combobox, Autocomplete, DatePicker, ColorPicker.

## 10.2 Solved once for all overlays

- One portal layer and a small z-index scale; the app root has `isolation: isolate`.
- Scroll lock, focus trap, focus return to the trigger, Escape, outside click, nested overlays (from Base UI).
- Logical placements (`bottom-start`), so RTL is automatic.
- iOS: `dvh` heights, `env(safe-area-inset-bottom)` padding on Drawer and Toast, and the virtual keyboard must not cover inputs inside a Drawer.
- Enter and exit transitions scaled by `--tc-motion`.

## 10.3 Toast

Logical position (default `bottom-end`), at most 3 visible with the rest queued, pause on hover and on window blur, swipe to dismiss, `aria-live` region, a promise API (`toast.promise(...)`), update an existing toast by id, tones, and an optional action button. It is rendered through a viewport inside `TopClassProvider`.

## 10.4 Tooltip

A provider groups delays so moving between tooltips feels instant. Tooltips do not exist on touch devices, which is why `AdaptiveTooltip` exists (section 11).

# 11. Connectors (adaptive components)

## 11.1 The idea

Every component can be used on its own. A connector joins two components that solve the same task on different devices, and picks the right one automatically. App code never writes `if (isMobile)` again, and desktop and mobile stay consistent because they are driven by the same props.

## 11.2 The three rules

1. **Shared contract.** Both sides accept exactly the same props type. The serializable part of the contract is a Zod schema in `shared/contracts/`.
2. **Overlays decide in JavaScript at open time.** An overlay is closed on first render, so the server HTML and client HTML are identical. No hydration mismatch and no flash.
3. **Layout decides in CSS on a single DOM.** Table to cards is container-query CSS on the same markup. Never render both versions: duplicated content is bad for SEO, accessibility and performance.

## 11.3 Code

```typescript
// shared/contracts/menu.ts
import type { ReactElement } from 'react'
import type { IconName } from '@topclassui/icons'
import { z } from 'zod'

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
  onSelect?: (() => void) | undefined
}

/** The contract both DropdownMenu and DrawerMenu must accept. */
export interface MenuContract {
  trigger: ReactElement
  title: string
  items: MenuItem[]
}
```

```typescript
// shared/use-adaptive-mode.ts
'use client'

import { createContext, useCallback, useContext, useSyncExternalStore } from 'react'

export type AdaptiveMode = 'desktop' | 'mobile'

/** TopClassProvider overrides this value from its `adaptive.query` prop. */
export const AdaptiveQueryContext = createContext('(max-width: 47.99rem)')

export function useAdaptiveMode(force: AdaptiveMode | 'auto' = 'auto'): AdaptiveMode {
  const query = useContext(AdaptiveQueryContext)

  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )

  const isMobile = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false, // server snapshot: hydrate as desktop, then correct
  )

  if (force !== 'auto') return force
  return isMobile ? 'mobile' : 'desktop'
}
```

```typescript
// shared/create-adaptive.tsx
'use client'

import type { ComponentType } from 'react'
import { type AdaptiveMode, useAdaptiveMode } from './use-adaptive-mode.js'

export function createAdaptive<P extends object>(
  Desktop: ComponentType<P>,
  Mobile: ComponentType<P>,
) {
  return function Adaptive(props: P & { mode?: AdaptiveMode | 'auto' | undefined }) {
    const { mode = 'auto', ...rest } = props
    const resolved = useAdaptiveMode(mode)
    const Comp = resolved === 'mobile' ? Mobile : Desktop
    // The key remounts cleanly if the viewport crosses the breakpoint.
    return <Comp key={resolved} {...(rest as unknown as P)} />
  }
}
```

```typescript
// connectors/adaptive-menu/client.tsx
'use client'

import { DropdownMenu } from '../../components/dropdown/client.js'
import { DrawerMenu } from '../../components/drawer/client.js'
import { createAdaptive } from '../../shared/create-adaptive.js'

export const AdaptiveMenu = createAdaptive(DropdownMenu, DrawerMenu)
```

Because `createAdaptive` requires both components to share the type `P`, **TypeScript refuses to compile if the desktop and mobile versions drift apart.** Consistency is enforced by the compiler.

The breakpoint is configured once in `<TopClassProvider adaptive={{ query: '...' }}>` and can combine width with `(pointer: coarse)`. Every connector also takes a `mode` prop (`'auto' | 'desktop' | 'mobile'`) for overrides and for tests.

## 11.4 Connector list

| Connector | Desktop | Mobile | Strategy |
|-----------------------|-------------------|---------------------------|----------|
| AdaptiveMenu | Dropdown | Drawer action sheet | JS at open |
| AdaptiveSelect | Select popup | Drawer list | JS at open |
| AdaptiveCombobox | Combobox popup | Full-height Drawer with search | JS at open |
| AdaptiveDialog | Dialog | Bottom Drawer | JS at open |
| AdaptivePopover | Popover | Bottom Drawer | JS at open |
| AdaptiveTooltip | Tooltip on hover | Popover on tap | JS |
| AdaptiveDatePicker | Popover calendar | Drawer calendar | JS at open |
| AdaptiveContextMenu | Right-click menu | Long-press Drawer | JS |
| AdaptiveSidebar | Fixed sidebar | Side Drawer | CSS + JS |
| AdaptiveNav | Navbar with links | Hamburger Drawer or BottomNav | CSS + JS |
| AdaptiveFilters | Filter sidebar | Drawer with "Apply" | CSS + JS |
| AdaptiveTabs | Tabs | Scrollable tabs | CSS |
| AdaptiveTable | Table | Stacked cards | CSS |
| AdaptivePagination | Full page list | Compact prev/next | CSS |
| AdaptiveActions | Inline buttons | Sticky bottom action bar | CSS |
| AdaptiveToolbar | Full toolbar | Overflow "more" menu | JS |

# 12. Forms

- **Field** wires everything once: `<label for>`, `aria-describedby` for hint and error, `aria-invalid`, required marker, and error text. Every form control is used inside a Field. Build on Base UI's Field and Form parts **(verify)**.
- **Progressive enhancement.** Every control works uncontrolled with a native `name`, so a `<form action={serverAction}>` submits correctly before hydration. Server-side errors returned through `useActionState` map straight onto `Field`'s `error` prop.
- **react-hook-form adapter** (optional peer): `FormField` connects RHF's `control` to any TopClass control; validation uses the app's own Zod schemas through the standard resolver. The same schema validates on the client and in the Server Action.
- **Limits are props, documented in the schema:** `min`, `max`, `step` (NumberField, Slider), `minLength`, `maxLength` with an optional counter (Input, Textarea), `length` (OTPField), `maxFiles`, `maxSize`, `accept` (FileUpload), `maxTags` (TagsInput), `minDate`, `maxDate` (DatePicker), `max` (Rating).
- **Input details:** `dir="auto"` option, correct `inputMode` and `autoComplete`, numbers and emails stay left-to-right inside RTL forms, prefix and suffix slots through `InputGroup` using logical sides.

# 13. Internationalisation and RTL details

- `<html lang dir>` is the source of truth. CSS reads `[dir="rtl"]` and `:lang(ar)`; no JavaScript is needed for layout direction.
- `TopClassProvider` (client) passes direction to Base UI's `DirectionProvider` so keyboard arrows and placements follow RTL, and provides `labels` to client components.
- Labels: `shared/labels/en.ts` and `ar.ts`. Server Components receive labels as props; a helper `getLabels(locale)` returns the right object in a server file.
- Dates, numbers and lists are formatted with `Intl` using the locale passed in. Never hand-format. Support Arabic-Indic and Latin digits by locale option.
- Mixed-direction text: wrap user content in `<bdi>`.
- Every visual test runs in both directions, so an RTL regression cannot ship unnoticed.

# 14. Performance budget

Budgets are checked in CI with size-limit and Lighthouse CI. A failing budget blocks the merge.

| Item | Budget |
|----------------------------------------|----------------------------------|
| Server-rendered atoms (Button, Badge, Card, Heading ...) | 0 KB client JS |
| Simple client controls (Switch, Checkbox, Tabs) | under 6 KB gzip each, excluding shared Base UI core |
| Overlays (Dialog, Dropdown, Popover, Select) | under 14 KB gzip each |
| Heavy components (DatePicker, Command, DataTable) | lazy-loaded; never in the initial bundle |
| Icon sprite | under 40 KB gzip for 100 icons |
| Docs pages | LCP under 1.8 s, CLS under 0.02, INP under 120 ms (mobile profile) |

Rules that protect the budget: subpath imports only; `sideEffects` declared; no root barrel; overlay content not mounted until opened; heavy parts loaded with `React.lazy`; skeletons match final dimensions; no runtime style generation; fonts through `next/font` with `display: swap` and only the primary weight preloaded; consumers may add `optimizePackageImports` for the package in `next.config.ts`.

Set the real numbers after the first measurements in Phase 3 and record them in `docs/DECISIONS.md`. The table above is the starting target.

# 15. SEO plan

A component library cannot rank a site by itself. What it can do is make good SEO the default, and the docs site can be an excellent example of it.

## 15.1 Inside the components

- Semantic elements first: `<nav>`, `<main>`, `<article>`, `<header>`, `<button>`, `<a href>`, real `<table>` markup, real headings.
- `Heading` takes `level` (the tag) separately from `size` (the look), so visual design never forces a wrong heading order.
- Navigation is always an anchor with an `href`. `Pagination`, `Breadcrumb`, `Tabs` (when they change the URL) and `NavigationMenu` render crawlable links.
- The `Image` adapter requires `alt`, `width` and `height` in its types, which also prevents layout shift.
- Content inside Accordion and Tabs stays in the server HTML (section 9).
- `LoadMore` and infinite lists keep a real paginated `href` underneath, so every item is reachable without JavaScript.
- Minimal client JavaScript improves INP; matching skeletons keep CLS near zero. Both are ranking signals.

## 15.2 The SEO kit (`@topclassui/next`)

- `JsonLd` - a typed component (types from `schema-dts`) that serialises safely (escapes `<` as `\u003c`).
- `Breadcrumb` emits `BreadcrumbList` structured data; `FAQ` (an Accordion) emits `FAQPage`; `Rating` can emit `AggregateRating`.
- `createMetadata()` - a typed helper around Next.js `Metadata`: title template, description, canonical URL, `alternates.languages` for hreflang, Open Graph and Twitter cards.
- Helpers for `sitemap.ts` (with language alternates) and `robots.ts`.

## 15.3 The docs site (topclassui.com)

- **Fully static.** Every page is generated at build time (`generateStaticParams`). No `cookies()`, `headers()` or `searchParams` in any indexed page. **(verify the current Next.js 16 caching model and the `proxy.ts` / middleware naming before adding locale redirects.)**
- **Locales in the URL:** `/en/...` and `/ar/...`, with `app/[locale]/layout.tsx` as the root layout so `<html lang dir>` is correct in the server HTML. Every page declares hreflang alternates and a canonical URL. **Arabic docs are the biggest SEO opportunity: a serious RTL-first React library documented in Arabic has almost no competition.**
- **Metadata per page** through `generateMetadata`. Title pattern: `React {Component} - Tailwind CSS, RTL, accessible | TopClass UI`.
- **Open Graph image per component** generated by `opengraph-image.tsx`.
- **Structured data:** `TechArticle` and `BreadcrumbList` on docs pages, `SoftwareSourceCode` and `Organization` on the home page, `FAQPage` where there is a FAQ.
- `sitemap.ts`, `robots.ts`, `manifest.ts`, and an `llms.txt` route so AI assistants can discover and cite the docs.
- **Content is server-rendered text.** MDX compiled at build time, code highlighted by Shiki at build time, and live previews loaded lazily below the fold.
- **Internal linking:** every component page links to related components, its connector and the rule pages (RTL, theming).
- **Pages that attract search traffic:** the colours page, the icons page, the theme builder, comparison pages (`/compare/shadcn-ui`, `/compare/mui`), a changelog, and a blog with tutorials.
- Preview routes used by tests (`/preview/...`) are `noindex` and excluded from the sitemap.
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
| `/[locale]/compare/[slug]`, `/blog/*`, `/changelog` | Search traffic and trust |
| `/preview/[component]/[demo]` | One demo alone on a blank page, driven by query params for theme, dir and knobs. `noindex`. Used by Playwright |

A component page contains: a one-sentence description, a live demo with a code tab, install/import line, every demo from `dummy.tsx`, the props table generated from `schema.ts` (including defaults and min/max), accessibility notes (keyboard table), RTL notes, the server/client breakdown with the measured client JS size, and related components.

The docs site is built only with TopClass UI components. If the docs need a component that does not exist yet, that is a signal for the roadmap.

# 17. Testing, CI and releases

## 17.1 Test layers

| Layer | Tool | What it proves |
|----------------------|-------------------------------|----------------------------------------|
| Types | `tsc --noEmit`, `expectTypeOf` | The public prop types are what we promise |
| Unit and interaction | Vitest, Testing Library, user-event | Behaviour, keyboard, controlled/uncontrolled |
| Accessibility | vitest-axe, `@axe-core/playwright` | Zero violations on every demo |
| SSR | `renderToString` in a Node environment | No `window` access on the server; no hydration warnings |
| Cross-browser | Playwright: Chromium, Firefox, WebKit | Overlays, focus, scroll lock, touch emulation |
| Visual regression | Playwright screenshots of `/preview` routes | Matrix: {light, dark, custom} x {ltr, rtl} x {mobile, desktop} |
| Structure | `check-structure`, `check-boundaries` | The folder contract and the server/client rules |
| Tokens | `check-contrast` | AA contrast in every mode |
| Bundle | size-limit | The budgets in section 14 |
| Package | publint, attw | The published package is valid for every consumer |
| Performance and SEO | Lighthouse CI on the docs build | Scores and Core Web Vitals |

Visual regression runs the full matrix in Chromium, and a smaller smoke set in WebKit and Firefox, to keep CI time reasonable.

## 17.2 Scripts

`pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm test:visual`, `pnpm check:structure`, `pnpm check:boundaries`, `pnpm check:contrast`, `pnpm size`, `pnpm icons:build`, `pnpm new:component <name>`, and `pnpm check` (lint + typecheck + test + the three checks).

## 17.3 CI (GitHub Actions)

On every pull request: install with pnpm cache, `pnpm check`, build, size-limit, publint + attw, Playwright (sharded), Lighthouse CI against the docs preview deployment. Required to pass before merge. Visual snapshots are updated only in a dedicated, reviewed commit.

## 17.4 Releases

- Changesets for versioning and changelogs. Publish from CI with npm provenance; 2FA on the npm organisation.
- Semver. Before 1.0, breaking changes may land in minor versions but must be listed in the changelog with a migration note.
- Deprecation policy after 1.0: a deprecated prop keeps working for at least one minor version and logs a development-only warning.
- 1.0 is released only after the portfolio and the editor have run on the library in production.

# 18. Component catalog

Rendering: **S** = server only (0 JS), **Sp** = split (`index.tsx` + `client.tsx`), **C** = client. Tier 1 is v0.1; tier 2 and 3 follow; tier 4 is the editor kit.

## 18.1 Typography and layout

| Component | Rendering | Tier | Notes |
|----------------------|-----|-----|--------------------------------------------|
| Heading | S | 1 | `level` separate from `size` |
| Text | S | 1 | sizes, `muted`, truncate, line clamp |
| Link | S | 1 | `render` for the framework link; external-link handling |
| Prose | S | 2 | Styles long-form MDX/CMS content, RTL-aware |
| Code, Kbd | S | 1 | Inline code and keyboard keys |
| CodeBlock | Sp | 2 | Shiki on the server + a client CopyButton |
| Blockquote, List, DescriptionList | S | 2 | |
| Container, Section | S | 1 | Max-width and vertical rhythm |
| Stack, Cluster, Grid, Center | S | 1 | Layout primitives using `gap` |
| Separator | S | 1 | Horizontal and vertical |
| AspectRatio | S | 2 | |
| VisuallyHidden, SkipLink | S | 1 | Accessibility helpers |

## 18.2 Media and display

| Component | Rendering | Tier | Notes |
|----------------------|-----|-----|--------------------------------------------|
| Icon | S | 1 | Section 7 |
| Image | S | 2 | Adapter; requires `alt`, `width`, `height` |
| Avatar, AvatarGroup | Sp | 2 | Fallback initials; `max` with "+N" |
| Badge | S | 1 | Tones and variants |
| Tag / Chip | Sp | 2 | Removable version is client |
| Card | S | 1 | Header, body, footer parts |
| Stat | S | 2 | Value, label, trend |
| Timeline | S | 3 | |
| Skeleton, Spinner | S | 1 | Used by every `loading.tsx` |
| Alert / Callout | S | 1 | Tones, icon, title, actions |
| Banner | Sp | 2 | Dismissible, remembers dismissal |
| EmptyState, ErrorState | S | 1 | Used by every `error.tsx` |
| Progress, Meter | S | 2 | `min`/`max`, clamped |
| Table | S | 1 | Static semantic table |
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
| Form | Sp | 1 | Server Actions first; RHF adapter optional |
| Field, Fieldset, Label | Sp | 1 | Label, hint and error wiring |
| Input | S | 1 | Native; `dir="auto"` option |
| InputGroup | S | 2 | Prefix/suffix with logical sides |
| Textarea | Sp | 1 | Autosize and counter are client |
| PasswordInput, SearchInput | C | 2 | |
| NumberField | C | 1 | `min`, `max`, `step`; Base UI |
| Slider | C | 1 | Single and range; RTL-aware; Base UI |
| Checkbox, CheckboxGroup | C | 1 | Base UI |
| RadioGroup, RadioCards | C | 1 | Base UI |
| Switch | C | 1 | Base UI |
| SegmentedControl | C | 2 | |
| Select | C | 1 | Base UI; collision-aware popup |
| MultiSelect | C | 3 | |
| Combobox, Autocomplete | C | 2 | Base UI; remote options use the state contract |
| TagsInput | C | 3 | `maxTags` |
| OTPField | C | 3 | Base UI (preview there) **(verify)** |
| FileUpload / Dropzone | C | 3 | `maxFiles`, `maxSize`, `accept`; state contract |
| Calendar, DatePicker, DateRangePicker | C | 3 | react-day-picker; RTL; locale-aware; lazy |
| TimePicker | C | 3 | |
| ColorPicker | C | 3 | oklch-aware; needed by the editor |
| PhoneInput | C | 3 | Always LTR digits inside RTL forms |

## 18.5 Overlays

| Component | Rendering | Tier | Notes |
|----------------------|-----|-----|--------------------------------------------|
| Tooltip | C | 1 | Provider with grouped delay |
| Popover | C | 1 | |
| HoverCard | C | 3 | Base UI Preview Card |
| Dropdown | C | 1 | Base UI Menu; data-driven and parts |
| ContextMenu | C | 2 | |
| Menubar | C | 3 | |
| Dialog, AlertDialog | C | 1 | |
| Popconfirm | C | 2 | Small confirm popover |
| Drawer / Sheet | C | 1 | Bottom, start, end, top; swipe to close |
| Toast | C | 1 | Section 10.3 |
| Command | C | 3 | Command palette; lazy |
| Lightbox, Tour | C | 3 | |

## 18.6 Navigation and disclosure

| Component | Rendering | Tier | Notes |
|----------------------|-----|-----|--------------------------------------------|
| Accordion, Collapsible | Sp | 1 | Content stays in HTML |
| Tabs | Sp | 1 | Panels rendered on the server |
| Stepper | Sp | 3 | |
| Breadcrumb | S | 1 | Emits structured data |
| Pagination | S | 1 | Real `href`s; `siblingCount` limits |
| Navbar, Footer | Sp | 2 | |
| NavigationMenu | C | 3 | Mega menu with crawlable links |
| Sidebar | Sp | 2 | |
| BottomNav | S | 2 | Mobile tab bar with safe-area padding |
| TableOfContents | Sp | 2 | Scroll-spy is client |
| ScrollArea | C | 2 | Base UI |
| Toolbar | C | 2 | Base UI |
| BackToTop | C | 3 | |
| ThemeSwitcher, LanguageSwitcher | C | 1 | Needed by the docs site |

## 18.7 Data

| Component | Rendering | Tier | Notes |
|----------------------|-----|-----|--------------------------------------------|
| DataTable | C | 3 | TanStack Table; sorting, filtering, pagination; state contract |
| VirtualList | C | 3 | TanStack Virtual |
| TreeView | C | 3 | Needed by the editor's layers panel |
| Carousel | C | 3 | Embla; RTL-aware |
| LoadMore | Sp | 3 | Real pagination link underneath |
| Resizable | C | 3 | react-resizable-panels |

## 18.8 SEO kit, providers and utilities

| Item | Tier | Notes |
|----------------------|-----|------------------------------------------------|
| JsonLd, FAQ, createMetadata, sitemap/robots helpers | 2 | In `@topclassui/next` |
| TopClassProvider | 1 | Direction, labels, adaptive config, toast viewport, tooltip provider |
| ThemeScript, useTheme | 1 | Section 6.3 |
| cn, clamp, getLabels, useAdaptiveMode, createAdaptive, useControllableState, useMediaQuery | 1 | In `shared/` |

## 18.9 Connectors

Listed in section 11.4. `AdaptiveMenu`, `AdaptiveDialog` and `AdaptiveSelect` are tier 1; the rest are tier 2 and 3.

## 18.10 Editor kit (tier 4, separate package `@topclassui/editor-kit`)

Built only when the 3D editor needs them, on top of the core library.

| Component | Purpose |
|----------------------|------------------------------------------------------|
| NumberScrubber | Drag sideways on a number to change it (Blender/Figma style), with `min`, `max`, `step` |
| VectorInput | x / y / z fields for position, rotation, scale |
| Inspector | A property panel **generated from a Zod schema**. This is where the schema strategy pays off: describe an object once, get its editing UI for free |
| LayersPanel | TreeView with visibility and lock toggles, drag to reorder |
| Timeline, KeyframeTrack | Scroll-progress timeline from 0 to 1 with draggable keyframes |
| EasingEditor | Cubic-bezier curve editor |
| GradientEditor | Colour stops |
| ShortcutHint | Shows keyboard shortcuts consistently |
| CodeExportDialog | CodeBlock + copy + download |

## 18.11 Props that have limits (must be in the schema and clamped)

`Progress.value`, `Meter.value`, `Slider.min/max/step`, `NumberField.min/max/step`, `Rating.max`, `Input.maxLength`, `Textarea.maxLength/maxRows`, `OTPField.length`, `TagsInput.maxTags`, `FileUpload.maxFiles/maxSize`, `AvatarGroup.max`, `Pagination.siblingCount/boundaryCount`, `Toast` visible limit and duration, `Skeleton` rows, `Carousel.slidesPerView`, `DatePicker.minDate/maxDate`, `Tooltip` delays, `Text` line clamp.

# 19. Roadmap with acceptance criteria

Each phase ends with a demo to Omar and a green CI run. Time estimates are rough and assume part-time work with Claude Code: phases 0-2 about two to three weekends; phases 3-7 about two to three months. Do not start a phase before the previous one meets its acceptance criteria.

## Phase 0 - Foundation

**Build:** the monorepo (pnpm, Turborepo), shared tsconfig, ESLint config including the custom banned-class rules, Prettier, Vitest, a Playwright skeleton, GitHub Actions, Changesets, the four scripts (`new-component`, `check-structure`, `check-boundaries`, `check-contrast`), `shared/cn`, `shared/clamp`, the docs app skeleton with `app/[locale]/layout.tsx` as root layout, `CLAUDE.md`, `docs/DECISIONS.md` with pinned versions.

**Accept when:** `pnpm check` and CI are green; the docs app builds fully static; unit tests prove that `pl-4`, `bg-red-500`, `dark:bg-black` and `` `bg-${x}` `` inside `packages/react` fail lint, and that `ps-4` and `bg-primary` pass.

## Phase 1 - Tokens and the colours page

**Build:** `packages/tokens` (section 6), `ThemeScript`, `useTheme`, the colours page, `check-contrast`.

**Accept when:** switching mode never flashes on reload; a nested `<section data-theme="dark">` renders correctly including the soft tones; the `ocean` custom mode works without touching any component; changing `--tc-radius` and `--tc-density` visibly changes the demo controls; contrast passes in every mode; the page is static and scores 100 in Lighthouse.

## Phase 2 - Icons

**Build:** `packages/icons` (section 7), the first 40-60 icons, the icons page, the `sync` CLI.

**Accept when:** a wrong icon name is a TypeScript error; directional icons flip in RTL and others do not; the icon costs 0 KB of client JS; the sprite is cache-busted by hash; decorative and labelled icons pass axe.

## Phase 3 - Tier 1 server components and the test infrastructure

**Build:** the `/preview` route and the visual matrix first, using Button as the pilot component. Then: Heading, Text, Link, Code, Kbd, Container, Section, Stack, Cluster, Grid, Center, Separator, VisuallyHidden, SkipLink, Badge, Card, Skeleton, Spinner, Alert, EmptyState, ErrorState, Table, Button, IconButton, Breadcrumb, Pagination.

**Accept when:** every component meets the Definition of Done (section 20); the size report shows 0 KB client JS for all of them; Breadcrumb's structured data validates; Pagination works with JavaScript disabled.

## Phase 4 - Tier 1 forms

**Build:** Field, Fieldset, Label, Input, Textarea, Checkbox, CheckboxGroup, RadioGroup, RadioCards, Switch, NumberField, Slider, Select, Form, and the react-hook-form adapter.

**Accept when:** a demo form submits through a Server Action with JavaScript disabled and shows server errors on the right fields; the same form works with react-hook-form; numeric limits clamp; every control is correct in RTL (Slider direction, NumberField buttons, Select popup side).

## Phase 5 - Tier 1 overlays

**Build:** TopClassProvider, `shared/floating`, Tooltip, Popover, Dropdown, Dialog, AlertDialog, Drawer, Toast.

**Accept when:** Playwright tests open each popup with the trigger placed near all four viewport edges and assert the popup is entirely inside the viewport; a 60-item menu scrolls inside itself; focus returns to the trigger on close; background scroll is locked; placements mirror in RTL; Drawer and Toast respect safe areas in WebKit mobile emulation.

## Phase 6 - Tier 1 disclosure, switchers and the first connectors

**Build:** Accordion, Collapsible, Tabs, ThemeSwitcher, LanguageSwitcher, `createAdaptive`, AdaptiveMenu, AdaptiveDialog, AdaptiveSelect.

**Accept when:** a test fetches the server HTML and finds the text of closed accordion panels and inactive tabs; a type test (`// @ts-expect-error`) proves `createAdaptive` rejects two components with different props; resizing the viewport across the breakpoint swaps the pattern with no hydration warning.

## Phase 7 - Docs, SEO and v0.1

**Build:** component and connector pages in English and Arabic for everything in tier 1; metadata, hreflang, sitemap, robots, structured data, Open Graph images, `llms.txt`; Lighthouse CI budgets; README; publish `0.1.0` with provenance.

**Accept when:** Lighthouse CI is 100 across the docs; every page has a unique title, description, canonical and hreflang pair; structured data validates; the package installs and works in a fresh Next.js app following only the Getting Started page. Then migrate the portfolio to it and fix what that exposes.

## Phase 8 and later

Tier 2 (v0.2-0.5), tier 3 (towards 1.0), then the editor kit (tier 4) in step with the 3D editor. Order inside each tier follows what the portfolio and the editor need next. That keeps the work honest: nothing is built on speculation.

# 20. Definition of Done for a component

A component is done only when every line is true.

- [ ] The folder matches the contract; `check-structure` and `check-boundaries` pass.
- [ ] Rendering mode is the lightest possible and matches `meta.ts`; measured client JS is within budget.
- [ ] Only semantic tokens and logical utilities are used; lint passes with zero disables.
- [ ] Props follow the vocabulary (section 5.7); controlled and uncontrolled both work; `className`, `style`, `ref` and rest props are passed through.
- [ ] `schema.ts` covers every design prop with defaults and limits; limits are clamped at runtime.
- [ ] All built-in text comes from `labels`, with English and Arabic defaults.
- [ ] `loading.tsx` matches the real dimensions; `error.tsx` exists if the component shows data.
- [ ] `dummy.tsx` covers every variant, size, tone and state.
- [ ] Unit tests cover behaviour and keyboard; axe reports zero violations.
- [ ] The SSR test passes with no hydration warnings.
- [ ] The visual matrix is approved: {light, dark, custom} x {ltr, rtl} x {mobile, desktop}.
- [ ] Behaviour tests pass in Chromium, Firefox and WebKit.
- [ ] The docs page exists in English and Arabic, with a props table generated from the schema.
- [ ] A changeset is added.

# 21. Risks and mitigations

| Risk | Mitigation |
|--------------------------------|-------------------------------------------------|
| Scope grows without end | Tiers; build what the portfolio and editor need next; v0.1 is tier 1 only |
| Base UI changes or is replaced one day | Pin versions. **Never expose Base UI types in public props**; define TopClass UI's own prop interfaces, so the primitive layer can be swapped without breaking users |
| Tailwind major upgrade | Colours and knobs live in one tokens file; class strings live in `variants.ts` files, easy to find and codemod |
| Server/client boundary bugs | `check-boundaries`, SSR tests, flat exports |
| Flaky visual tests | Preview routes set `--tc-motion: 0`, use fixed fonts and deterministic demo data |
| API inconsistency across components | The prop vocabulary, the scaffold script and the Definition of Done |
| Accessibility regressions | axe in unit and browser tests; keyboard tests are required |
| One maintainer, limited time | Small PRs, strong automation, dogfooding before adding breadth |
| Plan details that are out of date | The "verify" rule in section 0; `docs/DECISIONS.md` records what actually shipped |

# 22. Ideas for after v0.1

- **`registry.json`** generated from every `meta.ts` and `schema.ts`: one machine-readable description of the whole library. It powers the docs, the editor's inspector and AI tools.
- **An MCP server** that serves the registry, so Claude Code, Cursor and similar tools can look up TopClass UI components, props and examples while coding.
- **A copy-paste CLI** (`npx topclassui add button`) for teams that prefer owning the source, possibly compatible with the shadcn registry format **(verify)**.
- **Blocks and templates** (hero sections, pricing, dashboards, auth screens) in LTR and RTL. These drive adoption and search traffic more than single components do.
- **Figma library** whose variables are generated from the tokens file, so design and code never drift.
- **Theme builder**, **codemods** for upgrades, **VS Code snippets**.
- **An optional animation layer** and **charts**.
- **Hijri calendar** support in DatePicker for Arabic markets.

# Appendix A - CLAUDE.md for the repository

Create this file at the repository root in Phase 0.

```text
# TopClass UI - working rules

The full specification is docs/PLAN.md. Read the relevant sections before any task.
Decisions that differ from the plan are recorded in docs/DECISIONS.md.

## Commands
pnpm check            lint + typecheck + unit tests + structure/boundary/contrast checks
pnpm test:visual      Playwright visual matrix
pnpm size             bundle budgets
pnpm new:component x  scaffold a component folder

## How to work
- One phase at a time, one component per branch. Plan first, then implement.
- Verify library APIs (Base UI, Tailwind v4, Next.js 16, Zod 4) against installed
  types or official docs before use. Never guess an API.
- Run pnpm check before reporting done, and report the real output.
- If a rule cannot be followed, stop and ask. Do not silently deviate.
- No new dependency and no extra scope without saying so.

## Rules that must never be broken (reasons are in PLAN.md section 5)
1. index.tsx is a Server Component: no 'use client', no hooks, no import of ./hook.js.
   Interactivity lives only in client.tsx. Props crossing the boundary are serializable.
2. Server Components never use React context. Direction/theme come from HTML attributes
   and CSS. Labels come from props.
3. Semantic colour classes only (bg-primary). No palette classes, no arbitrary colours,
   no dark: variant, inside packages/react.
4. Logical utilities only (ps- pe- ms- me- start- end- text-start border-s rounded-s).
   No physical left/right utilities. No space-x / divide-x. Directional motion uses --tc-dir.
5. Sizes and radius come from knobs (h-control-md, rounded-control), never fixed values.
6. schema.ts is imported with `import type` only. Zod must not reach the client bundle.
7. Flat named exports. No default exports. No dotting into client modules from server files.
8. No hard-coded user-visible text; use the labels prop (en + ar defaults).
9. A file exists only if the component needs it. Follow the folder contract (section 8).
10. Never expose Base UI types in public props.
11. TypeScript strict: no any, no ts-ignore, explicit .js extensions in relative imports.
12. A component is finished only when the Definition of Done (section 20) is fully met.
```

# Appendix B - Prompt template for building one component with Claude Code

```text
Build the <Name> component (tier <n>) following docs/PLAN.md.

1. Read PLAN.md sections 5, 8 and 9, and the catalog row for <Name> in section 18.
2. Check the installed Base UI types/docs for <primitive>. List the parts and props
   you will use, and anything that differs from the plan.
3. Propose, and wait for my OK:
   - public API: props, parts, events, labels, limits
   - rendering mode (S / Sp / C) and exactly which files the folder needs, with reasons
   - the demos for dummy.tsx and the tests you will write
4. Run pnpm new:component <name>, then implement, test and write the demos.
5. Run pnpm check and the visual tests for this component. Show me the real output
   and the measured client JS size.
6. Write the docs page in English and Arabic, and add a changeset.
```

# Appendix C - Banned class patterns for the custom lint rule

The rule inspects string literals passed to `className`, `cn()`, `cva()` and `class` inside `packages/react` and `packages/icons`. Keep the hue list in sync with the installed Tailwind version.

```typescript
export const BANNED_CLASS_PATTERNS: ReadonlyArray<{ pattern: RegExp; use: string }> = [
  { pattern: /(^|[\s:])-?p[lr]-/, use: 'ps-* / pe-*' },
  { pattern: /(^|[\s:])-?m[lr]-/, use: 'ms-* / me-*' },
  { pattern: /(^|[\s:])-?(left|right)-/, use: 'start-* / end-*' },
  { pattern: /(^|[\s:])(text|float|clear)-(left|right)(\s|$)/, use: '*-start / *-end' },
  { pattern: /(^|[\s:])border-[lr](-|\s|$)/, use: 'border-s / border-e' },
  { pattern: /(^|[\s:])rounded-(l|r|tl|tr|bl|br)(-|\s|$)/, use: 'rounded-s/e/ss/se/es/ee' },
  { pattern: /(^|[\s:])scroll-[mp][lr]-/, use: 'scroll-ms/me/ps/pe' },
  { pattern: /(^|[\s:])-?(space|divide)-x-/, use: 'gap-* or border-s on children' },
  { pattern: /(^|[\s:])dark:/, use: 'semantic tokens; never dark:' },
  { pattern: /-\[#[0-9a-fA-F]{3,8}\]/, use: 'a semantic token' },
]

const HUES =
  'red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|' +
  'purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone'
const PROPS =
  'bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|accent|caret|' +
  'decoration|divide|placeholder'

/** bg-neutral (a tone token) is allowed; bg-neutral-500 (palette) is not. */
export const BANNED_PALETTE = new RegExp(
  `(^|[\\s:])(${PROPS})-((${HUES})-\\d{2,3}|white|black)(\\/|\\s|$)`,
)
```

A second rule reports template literals with interpolation inside class strings (`` `bg-${tone}` ``), because Tailwind cannot see dynamic class names.
