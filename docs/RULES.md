# TopClass UI - rules

The full specification is `docs/PLAN.md`; the rules below are the complete list; do not deviate without a `docs/DECISIONS.md` entry.

This file is the single source. `CLAUDE.md`, `AGENTS.md` and `.cursor/rules/topclassui.mdc` are generated from it by `pnpm rules:sync`, and `pnpm check` fails if any of them has drifted. Edit this file, never the generated ones.

Each rule has an id, one line of rule, one line of reason, and what enforces it. `manual` means no tool can check it, so it is on the pull-request checklist.

## Commands

```
pnpm check            lint + typecheck + unit tests + structure/boundary/contrast + rules:sync
pnpm test:visual      Playwright visual matrix (baselines are Linux-only)
pnpm test:e2e         Playwright behaviour tests
pnpm size             bundle budgets
pnpm new:component x  scaffold a component folder
pnpm icons:build      regenerate the icon modules
pnpm rules:sync       regenerate CLAUDE.md, AGENTS.md and .cursor/rules from this file
```

## How to work

- One phase at a time (PLAN.md section 19), one catalog row (section 18) per branch and per pull request.
- Read `docs/DECISIONS.md` before proposing anything that looks like a decision; it may already be made.
- Check the installed package's types before using an API. Never guess an API.
- Run `pnpm check` before reporting done, and report the real output.
- If a rule cannot be followed, stop and ask. Do not silently deviate.
- No new dependency and no extra scope without naming it, its purpose and its size.

## 1. Server and client

### R-5.1-1 index.tsx is server or shared
**Rule:** `index.tsx` never contains `'use client'`, never imports a React client hook (only `useId` and `use` are allowed) and never imports `./hook.js`.
**Why:** it is what keeps atoms at 0 KB of client JavaScript.
**Enforced by:** `scripts/check-boundaries.ts`

### R-5.1-2 Client components re-export through index
**Rule:** for a C component or a connector, `index.tsx` holds no markup: it re-exports the client parts, the prop types, the variants and the skeleton.
**Why:** `exports` resolves `*/index.js`, and a directive-less re-export of a client module is safe.
**Enforced by:** `scripts/check-structure.ts`

### R-5.1-3 Only serializable props cross the boundary
**Rule:** strings, numbers, booleans, plain objects, arrays and `ReactNode` children only; functions never, except Server Actions.
**Why:** React throws at render otherwise.
**Enforced by:** `manual` (contracts document each callback as client-only or Server Action)

### R-5.1-4 No React context in Server Components
**Rule:** direction and theme come from `dir` and `data-theme` on the HTML; labels come from props.
**Why:** context does not exist in the Server Component render.
**Enforced by:** `scripts/check-boundaries.ts`

### R-9.2-3 Never dot into a client module from a server file
**Rule:** export flat names (`DialogRoot`), never an object (`Dialog.Root`) that a server file would dot into.
**Why:** React's client-module proxy allows one level of access and throws on the second.
**Enforced by:** `eslint`

## 2. Styling

### R-5.2-1 Semantic classes only
**Rule:** inside `packages/react`, use `bg-primary`, `text-fg`, `border-border`; palette classes, arbitrary colours and the `dark:` variant are banned.
**Why:** a component that never names a real colour works in every mode, including modes that do not exist yet.
**Enforced by:** `eslint` (Appendix C patterns)

### R-5.2-2 Merge with the configured cn()
**Rule:** merge classes with `cn()` from `shared/cn.ts`, which uses `extendTailwindMerge`; the consumer's `className` is passed last.
**Why:** tailwind-merge does not know the custom spacing and radius keys, so the default `twMerge` would keep both conflicting classes.
**Enforced by:** `eslint` + unit test

### R-5.2-3 Never build class names dynamically
**Rule:** no `` `bg-${tone}` ``; use a lookup object or cva variants.
**Why:** Tailwind only sees complete strings.
**Enforced by:** `eslint`

### R-5.2-4 Feel comes from knobs
**Rule:** sizes, radius, border width, the focus ring, hover, transitions and scroll classes come from the knobs and `shared/classes.ts`; never `rounded-md`, `h-10`, `outline-2`, `border-2`, `duration-200`, or a hand-written `hover:` or `focus-visible:`.
**Why:** one variable must change every component, and the focus ring must be identical everywhere.
**Enforced by:** `eslint`

### R-5.2-5 No inline style except a CSS variable
**Rule:** `style` is only for setting a `--tc-*` variable.
**Why:** anything else escapes the token system.
**Enforced by:** `eslint`

### R-5.2-6 Bare data and aria variants
**Rule:** write `data-open:`, `group-data-panel-open:`, `aria-busy:`; brackets only for values.
**Why:** it is the v4 idiom and the upgrade tool rewrites the bracket form.
**Enforced by:** `eslint`

### R-4-1 Every authored rule sits in a cascade layer
**Rule:** only custom-property declarations and `@keyframes` may be unlayered; other rules go in `@layer base` (tokens) or `@layer components` (react).
**Why:** an unlayered rule outranks every consumer utility and `cn()` cannot fix that.
**Enforced by:** `stylelint`

## 3. RTL

### R-5.3-1 Logical utilities only
**Rule:** `ps-`, `pe-`, `ms-`, `me-`, `inset-s-`, `inset-e-`, `text-start`, `border-s`, `rounded-s`; never physical `left`/`right`, never the deprecated `start-*`/`end-*`, never `space-x` or `divide-x`.
**Why:** layout must follow the text direction with no JavaScript.
**Enforced by:** `eslint` (Appendix C patterns)

### R-5.3-2 Directional motion uses --tc-dir
**Rule:** translate, transform origin and gradient direction multiply by `--tc-dir`; `object-*` and `bg-*` positions use an `rtl:` variant, since no logical form exists.
**Why:** these properties have no logical equivalent.
**Enforced by:** `eslint`

### R-5.3-3 No letter-spacing
**Rule:** no `tracking-*` anywhere inside `packages/react`.
**Why:** it breaks the joined letter shapes of Arabic, and a component never knows its text's language.
**Enforced by:** `eslint`

### R-5.3-4 Logical overlay placement
**Rule:** use the `placement` prop, which maps to Base UI's `side` and `align`; never `left` or `right` as a side.
**Why:** `align` and the `inline-*` sides flip in RTL automatically.
**Enforced by:** `eslint` + type

### R-13-1 TopClassProvider is required
**Rule:** the app mounts `TopClassProvider` at the root layout with `direction` and `locale` as props from the layout, never read from `document.dir` in an effect.
**Why:** Base UI learns the direction only from `DirectionProvider`, and reading it in an effect disagrees with the server render.
**Enforced by:** development warning

## 4. API conventions

### R-5.7-1 The prop vocabulary
**Rule:** `variant`, `tone`, `size`, positive booleans (`disabled`, `loading`, `fullWidth`); events are `onValueChange` and `onOpenChange`; controlled pairs are `value`/`defaultValue` and `open`/`defaultOpen`.
**Why:** consistency across components is the main feature of a design system.
**Enforced by:** `manual` + type tests

### R-5.7-2 One size scale
**Rule:** `size` is `xs | sm | md | lg | xl | custom`, default `md`, on every component that has a visual scale; `custom` emits no size classes. `<Icon>` is the exception: its `size` is a CSS length.
**Why:** a Button, an Input and a Select trigger of the same size must line up in a form row.
**Enforced by:** `shared/contracts/size.ts` + type tests

### R-5.7-3 Pass through className, style, ref and rest
**Rule:** every component accepts them and spreads the rest onto its root element; `ref` is a normal prop, never `forwardRef`.
**Why:** consumers must be able to extend any component.
**Enforced by:** type tests

### R-5.7-4 Polymorphism through render
**Rule:** server components accept the element form only, implemented with `renderElement`; client components may also accept the function form through `useRender`.
**Why:** `useRender` calls hooks, so it can never appear in `index.tsx`.
**Enforced by:** `scripts/check-boundaries.ts`

### R-5.7-5 Public types are aliases derived at the seam
**Rule:** `export type DialogRootProps = Omit<Base.Root.Props, 'className'> & OwnProps`; never re-export a Base UI type name and never hand-copy a primitive's prop list.
**Why:** a hand-copied list hides new props and drifts; the alias is the one line that changes if the primitive changes.
**Enforced by:** `eslint` + review

### R-5.7-6 Base UI state attribute grammar
**Rule:** boolean presence attributes (`data-open`, `data-loading`, `data-disabled`), never `data-state="..."`; enumerated design props are value attributes (`data-variant`, `data-size`, `data-tone`).
**Why:** Base UI already sets the boolean form, and two vocabularies would drift.
**Enforced by:** `eslint`

### R-5.7-7 Clamp every numeric limit
**Rule:** numeric props have `min` and `max` in the schema and are clamped at runtime with `clamp()`.
**Why:** a bad value must never break the UI.
**Enforced by:** unit test

## 5. Schemas and constants

### R-8.3-1 schema.ts is type-only for components
**Rule:** components import the schema with `import type`; `zod` is a required peer dependency.
**Why:** Zod must never reach the client bundle, but the published types reference it.
**Enforced by:** `scripts/check-boundaries.ts` + `attw`

### R-8.3-2 Defaults live once
**Rule:** defaults and component-specific enums live in `constants.ts` and are imported by the schema, by cva and by the component; the size enum comes from `shared/contracts/size.ts`.
**Why:** three declarations of the same default cannot be kept in agreement.
**Enforced by:** unit test

### R-8.3-3 Props table from the types
**Rule:** the docs props table is generated from the emitted `.d.ts`, with defaults and limits supplied by the schema.
**Why:** the schema covers only design props and would omit `className`, `children` and inherited props.
**Enforced by:** docs build

## 6. Text and i18n

### R-5.11-1 No hard-coded user-visible text
**Rule:** every built-in string comes from the `labels` prop with defaults from `shared/labels/en.ts`; `ar.ts` ships too. Demo files are exempt.
**Why:** the library must be usable in any language without patching components.
**Enforced by:** `eslint`

### R-5.11-2 Labels with numbers are functions
**Rule:** a label containing a count is `(n, fmt) => string` and the Arabic file uses `Intl.PluralRules`.
**Why:** Arabic has six plural categories; a single template string is wrong for 1, 2 and 3.
**Enforced by:** type (`satisfies Labels`)

## 7. Collections and scrolling

### R-8.5-1 Lists use the collection contract
**Rule:** any component that renders items uses `CollectionProps` and `useCollection`: the `--tc-list-rows` knob, windowing above the threshold, and optional page-by-page loading.
**Why:** a component must never create ten thousand DOM nodes, and the app must not be forced to hand over every item at once.
**Enforced by:** `scripts/check-structure.ts` + Playwright test

### R-8.5-2 The app owns the data
**Rule:** components never fetch, cache or paginate; they call `loadMore()` and render what they are given.
**Why:** data belongs to the application, not to the design system.
**Enforced by:** `eslint` (no fetch inside `packages/react`)

### R-10.5-1 Overlays scroll inside themselves
**Rule:** popups use `POPUP_BOUNDS` and the row cap, dialogs and drawers scroll their body with sticky header and footer, and every scroll container inside an overlay sets `overscroll-behavior: contain`.
**Why:** the page must never scroll behind an open overlay.
**Enforced by:** Playwright test

### R-10.5-2 Tooltips never scroll
**Rule:** a tooltip is one or two lines of plain text; anything larger, or anything with a link or control, is a Popover.
**Why:** a scrolling tooltip cannot be reached by pointer or keyboard.
**Enforced by:** `eslint` (`tooltip-content-is-text`)

### R-10.5-3 Sticky bars set the scroll padding
**Rule:** a sticky or fixed bar sets `--tc-sticky-top` or `--tc-sticky-bottom`, and the scroll container reads them into `scroll-padding-block`.
**Why:** WCAG 2.4.11: a focused element must not be hidden behind a bar.
**Enforced by:** Playwright test

## 8. Code structure

### R-5.12-1 Logic is separate from markup
**Rule:** `client.tsx` is JSX plus at most one call to `useXxx()` from `hook.ts`; it holds no `useState`, `useEffect`, `useReducer`, `useRef`, `useMemo` or `useCallback`. Pure helpers live in `lib.ts`.
**Why:** markup and behaviour change for different reasons and are tested differently.
**Enforced by:** `eslint` + `scripts/check-structure.ts`

### R-5.12-2 Files stay small
**Rule:** `check-structure` warns at 200 lines and fails at 300; a component that needs more files gets a `parts/` folder with one component per file.
**Why:** small focused files are easier to review and to edit correctly.
**Enforced by:** `scripts/check-structure.ts`

### R-5.12-3 Comments are one line
**Rule:** one line maximum, only for what the code cannot say (a browser quirk, a spec reference, a non-local constraint). No paragraph comments, no commented-out code, no narration of the next line.
**Why:** long comments go stale and hide the code.
**Enforced by:** `eslint`

### R-5.12-4 Naming
**Rule:** kebab-case files and folders, PascalCase components, `useThing` hooks, verb-first pure functions, `SCREAMING_CASE` constants in `constants.ts` or `classes.ts` only; a file in `parts/` exports one component named after the file.
**Why:** a predictable name is the cheapest documentation.
**Enforced by:** `scripts/check-structure.ts`

### R-5.12-5 Strict TypeScript
**Rule:** no `any`, no `@ts-ignore`, no non-null assertion without a one-line reason; relative imports carry explicit `.js` extensions and type imports use `import type`.
**Why:** the types are the public API.
**Enforced by:** `eslint` + `tsc`

### R-8.1-1 The folder contract
**Rule:** a file exists only if the component needs it, and only the files in PLAN.md 8.1 may exist. Never `loading.tsx` or `error.tsx` (Next.js reserves those names); use `skeleton.tsx` and `states.tsx`. Demos are one file each under `demos/`.
**Why:** a predictable folder is what makes scaffolding, checking and documenting automatic.
**Enforced by:** `scripts/check-structure.ts`

## 9. Icons

### R-7-1 Two entry points
**Rule:** `<Icon name>` on the server; `<Svg icon={x}>` with an explicit per-icon import in client and shared files. Never import the loader map outside `components/icon`.
**Why:** a string-keyed map in a client file would ship every icon.
**Enforced by:** `eslint` + `server-only`

### R-7-2 Names in data props resolve on the server
**Rule:** a contract that carries `icon: IconName` is resolved to an element by the component's server half; the client-side contract carries `ReactNode`.
**Why:** it keeps string names in the public API without shipping the map.
**Enforced by:** type

## 10. Accessibility

### R-5.6-1 WCAG 2.2 AA
**Rule:** keyboard behaviour follows the ARIA Authoring Practices; a visible `focus-visible` ring on every interactive element; types enforce labels.
**Why:** it is a promise of the library, not an extra.
**Enforced by:** axe (unit and browser) + `manual`

### R-5.6-2 Target size
**Rule:** every interactive element is at least 24x24 CSS px on every pointer type and 44px under `pointer-coarse`.
**Why:** WCAG 2.5.8.
**Enforced by:** Playwright test

### R-5.6-3 Every drag has an alternative
**Rule:** Slider, Drawer and Toast swipe, Carousel, Resizable, sortable lists and the editor kit each provide a keyboard or button path to the same result.
**Why:** WCAG 2.5.7.
**Enforced by:** `manual` + keyboard tests

### R-5.6-4 Contrast
**Rule:** 4.5:1 for text, including a tone's text colour on its own soft tint; 3:1 for `--tc-border-strong`, `--tc-ring` and icons. `--tc-border` is decorative and exempt.
**Why:** a hairline divider cannot reach 3:1 with any neutral light enough to read as a hairline.
**Enforced by:** `scripts/check-contrast.ts`

## 11. Dependencies and process

### R-5.9-1 The allowed dependency list
**Rule:** core may depend on `@topclassui/icons`, `@base-ui/react`, `clsx`, `tailwind-merge` and `class-variance-authority`; `react`, `react-dom`, `tailwindcss`, `@topclassui/tokens` and `zod` are peers; anything else is an optional peer used by exactly the components that need it. Banned: CSS-in-JS runtimes, lodash, moment, runtime theme objects.
**Why:** installing the library for a Button must not pull in a calendar.
**Enforced by:** `publint` + review

### R-0-1 Verify before using an API
**Rule:** check the installed package's types or the official docs before using any API, and record anything that differs in `docs/DECISIONS.md`.
**Why:** this plan's code was written from documentation, and libraries move.
**Enforced by:** `manual`

### R-0-2 Report the real output
**Rule:** run `pnpm check` before reporting done and paste the real output; if something fails and cannot be fixed, say so.
**Why:** a claim without evidence is not a result.
**Enforced by:** `manual`

### R-20-1 The Definition of Done
**Rule:** a component is finished only when every line of PLAN.md section 20 is true, including the Figma parity check.
**Why:** partial components accumulate into a library nobody trusts.
**Enforced by:** pull-request checklist
