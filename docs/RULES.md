# TopClass UI - rules

Read `docs/STATUS.md` first for where things stand. The full specification is `docs/PLAN.md`; the rules below are the complete list; do not deviate without a `docs/DECISIONS.md` entry.

This file is the single source. `CLAUDE.md`, `AGENTS.md` and `.cursor/rules/topclassui.mdc` are generated from it by `pnpm rules:sync`, and `pnpm check` fails if any of them has drifted. Edit this file, never the generated ones.

Each rule has an id, one line of rule, one line of reason, and what enforces it. `manual` means no tool can check it, so it is on the pull-request checklist.

## Commands

```
pnpm check            every gate below, in order
pnpm lint             eslint, including the twenty-one custom rules
pnpm typecheck        tsc --noEmit
pnpm test             vitest, four projects: node, dom, rsc, ssr
pnpm check:structure  the folder contract and file sizes
pnpm check:boundaries the server and client rules
pnpm check:css        cascade layers, token references, one-line comments in CSS
pnpm check:icons      the generated icon modules still match raw/
pnpm check:readme     every component README still matches its schema and types
pnpm check:contrast   AA contrast in every mode
pnpm test:e2e         playwright: target size, the focus ring and axe, in a real browser
pnpm rules:sync       regenerate CLAUDE.md, AGENTS.md and .cursor/rules from this file
pnpm icons:build      regenerate the icon modules from raw/
pnpm readme:build     regenerate every component README
pnpm new:component x  scaffold a component folder that already passes pnpm check
pnpm test:mutation    break the code on purpose; a surviving mutation is a test measuring nothing
pnpm harness:build    the static demo pages test:e2e measures
```

Every command runs from the repo root and forwards to `packages/topclassui`, where the package lives; the paths in the rules (`src/`, `scripts/`) are relative to `packages/topclassui/`.

`pnpm check` runs `test:e2e`, which cannot launch a browser it has not downloaded.
Once per machine: `pnpm --filter topclassui exec playwright install chromium`. `pnpm test:mutation` is not in
`pnpm check`, because it runs the whole suite once per mutant; CI runs it as its own job.

Not built yet, so do not run them: `pnpm test:visual`, `pnpm size`.
They arrive with the phases that need them.

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
**Enforced by:** `scripts/check-structure.ts`, for every folder whose `meta.ts` says `rendering: 'client'` and every folder under `src/connectors/`: each statement of `index.tsx` is an `import type` or a re-export from its own folder, values only from `client`, `variants`, `skeleton`, `lib.ts` or a `'use client'` file; `src/shared/meta.test` ties `rendering` to PLAN 18

### R-5.1-3 Only serializable props cross the boundary
**Rule:** only serializable props cross the boundary: strings, numbers, booleans, plain objects, arrays and `ReactNode` children; functions never, except Server Actions.
**Why:** React throws at render otherwise.
**Enforced by:** `src/test/serializable.ts`, through `test/<slug>.serializable.test.ts` in every component that renders in `index.tsx` (a type test, run by `pnpm typecheck`)

### R-5.1-4 No React context in Server Components
**Rule:** no React context in Server Components: direction and theme come from `dir` and `data-theme` on the HTML, and labels come from props.
**Why:** context does not exist in the Server Component render.
**Enforced by:** `scripts/check-boundaries.ts`

### R-5.1-5 Only `components/icon/index.tsx` may be async or import `server-only`
**Rule:** only `components/icon/index.tsx` may be async or import `server-only`; every other `index.tsx` renders in a non-RSC React tree, and the sync `<Icon>` from `icon-registry` carries the identical props for browser-only trees.
**Why:** it is the gate that keeps every non-Next target working; without it the first component that quietly becomes async breaks every Vite and React Router consumer and nothing catches it.
**Enforced by:** `scripts/check-boundaries.ts`

### R-9.2-3 Never dot into a client module from a server file
**Rule:** export flat names (`DialogRoot`), never an object (`Dialog.Root`) that a server file would dot into.
**Why:** React's client-module proxy allows one level of access and throws on the second.
**Enforced by:** `eslint`

### R-9.2-4 The root of a part family is `<Name>Root`
**Rule:** a component split into parts names its root `<Name>Root` without exception (`CardRoot`, `DialogRoot`, `AvatarRoot`), and a scrolling overlay names its parts `<Name>Header`, `<Name>Body` and `<Name>Footer`, where the Body is the scroll container R-10.5-1 requires.
**Why:** one family naming its root `Card` while ten others use `XxxRoot` is the drift a cross-file audit catches and an author never does; an overlay without a Body has nothing to scroll.
**Enforced by:** `eslint`, which reads the exported names; `check-structure`, which fails a scrolling overlay (Dialog, AlertDialog, Drawer, or any overlay exporting a Header or a Footer) whose `index.tsx` exports no `<Name>Body`, and which checks the `parts/` half through the parts-folder naming contract in `scripts/lib/part-names.ts`, which requires Dialog's and Drawer's Header, Body and Footer

## 2. Styling

### R-5.2-1 Semantic classes only
**Rule:** inside `src/`, use `bg-primary-solid`, `text-body`, `border-line`; palette classes, arbitrary colours (a hex, a colour function or a named colour such as `bg-[red]`) and the `dark:` variant are banned. The one exception is a CSS system colour (`CanvasText`, `Canvas`, `Highlight`), allowed only behind the `forced-colors:` variant.
**Why:** a component that never names a real colour works in every mode, including modes that do not exist yet.
**Enforced by:** `eslint` (a subset of the Appendix C patterns)

### R-5.2-2 Merge with the configured cn()
**Rule:** merge classes with `cn()` from `shared/cn.ts`, which uses `extendTailwindMerge`; the consumer's `className` is passed last.
**Why:** tailwind-merge does not know the custom spacing and radius keys, so the default `twMerge` would keep both conflicting classes.
**Enforced by:** unit test (`shared/cn.test.ts`) for the merge; eslint (`topclass/cn-class-name-last`) for the argument order

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
**Enforced by:** `eslint` over `src/`, `e2e/` and `scripts/build-harness.tsx`, arbitrary selectors such as `[&[data-open]]:` and `has-[[data-open]]:` included

### R-4-1 Every authored rule sits in a cascade layer
**Rule:** only custom-property declarations and `@keyframes` may be unlayered; other rules go in `@layer base` (tokens) or `@layer components` (react). `@utility` and `@custom-variant` count as layered, because Tailwind emits them into its own layers.
**Why:** an unlayered rule outranks every consumer utility and `cn()` cannot fix that.
**Enforced by:** `check-css`

### R-4-2 Every token a file reads is declared
**Rule:** every `--tc-*` name referenced anywhere in `src/` is declared in `src/tokens.css`.
**Why:** a misspelled custom property is silent - `bg-(--tc-primry-soft)` compiles and paints nothing, and no type or lint rule can see it.
**Enforced by:** `check-css`

### R-4-3 One-line comments in stylesheets too
**Rule:** R-5.12-3 applies to `.css` files; no comment spans more than one line.
**Why:** the ESLint rule reads TypeScript under `src/` only, so stylesheets needed their own check.
**Enforced by:** `check-css`

### R-5.2-7 Content shrinks the control, never the layout
**Rule:** a control that renders caller-supplied text carries `CONTAIN` from `shared/classes.ts`, and its label sits on an element of its own carrying `LABEL`, so a long label truncates with an ellipsis instead of pushing the page apart. The data is never cut: only the rendering is.
**Why:** a Button with a 60-character label measured 436px inside a 200px box and escaped it. `truncate` on the control alone does not fix that - a bare string inside `inline-flex` is an anonymous flex item, and `text-overflow` never applies to one, so it clips with no ellipsis.
**Enforced by:** `e2e/contain.spec.ts`, which measures the control against its container in three modes and both directions


## 3. RTL

### R-5.3-1 Logical utilities only
**Rule:** `ps-`, `pe-`, `ms-`, `me-`, `inset-s-`, `inset-e-`, `text-start`, `border-s`, `rounded-s`; never physical `left`/`right`, never the deprecated `start-*`/`end-*`, never `space-x` or `divide-x`.
**Why:** layout must follow the text direction with no JavaScript.
**Enforced by:** `eslint` (a subset of the Appendix C patterns)

### R-5.3-2 Directional motion uses --tc-dir
**Rule:** translate, transform origin and gradient direction multiply by `--tc-dir`; `object-*` and `bg-*` positions use an `rtl:` variant, since no logical form exists.
**Why:** these properties have no logical equivalent.
**Enforced by:** `eslint` (`topclass/dir-aware-transforms`; Base UI's measured origin and swipe offset are allowed, DECISIONS 2026-10-17)

### R-5.3-3 No letter-spacing
**Rule:** no `tracking-*` anywhere inside `src/`.
**Why:** it breaks the joined letter shapes of Arabic, and a component never knows its text's language.
**Enforced by:** `eslint`

### R-5.3-4 Logical overlay placement
**Rule:** use the `placement` prop, which maps to Base UI's `side` and `align`; never `left` or `right` as a side.
**Why:** `align` and the `inline-*` sides flip in RTL automatically.
**Enforced by:** type + `eslint` (`no-physical-placement`, which bans `left` and `right` in `side`, `align` and `placement` across `src/`, demos included)

### R-13-1 TopClassProvider is required
**Rule:** the app mounts `TopClassProvider` at the root layout with `direction` and `locale` as props from the layout, never read from `document.dir` in an effect.
**Why:** Base UI learns the direction only from `DirectionProvider`, and reading it in an effect disagrees with the server render.
**Enforced by:** `src/shared/provider/provider.warning.dom.test` and `.ssr.test`, which prove the provider warns once in development when the layout leaves out `direction` or `locale`, never in production and never on the server; an app with no provider at all is review

## 4. API conventions

### R-5.7-1 The prop vocabulary
**Rule:** `variant`, `tone`, `size`, positive booleans (`disabled`, `loading`, `fullWidth`); events are `onValueChange` and `onOpenChange`; controlled pairs are `value`/`defaultValue` and `open`/`defaultOpen`.
**Why:** consistency across components is the main feature of a design system.
**Enforced by:** `manual` + type tests

### R-5.7-2 One size scale
**Rule:** `size` is `xs | sm | md | lg | xl | custom`, default `md`, on every component that has a visual scale; `custom` emits no size classes. `<Icon>` takes the same five names against its own pixel values (`ICON_SIZE`: 16, 20, 24, 32, 40) and any CSS length, and is the only component whose default is `1em` rather than `md`.
**Why:** a Button, an Input and a Select trigger of the same size must line up in a form row; an icon instead has to match the text beside it, which `1em` does without anyone passing a size.
**Enforced by:** `shared/contracts/size.ts` + type tests

### R-5.7-3 Pass through className, style, ref and rest
**Rule:** every component accepts them and spreads the rest onto its root element; `ref` is a normal prop, never `forwardRef`. A skeleton is a component too.
**Why:** consumers must be able to extend any component.
**Enforced by:** `src/test/root-props.dom.test.tsx`, which renders every export and skeleton of every folder from its `test/fixture.ts` (which `check-structure` requires) and proves `className`, `ref` and an unknown `data-*` reach the root, or the element a DECISIONS entry names; `style` is manual

### R-5.7-4 Polymorphism through render
**Rule:** server components accept the element form only, implemented with `renderElement`; client components may also accept the function form through `useRender`.
**Why:** `useRender` calls hooks, so it can never appear in `index.tsx`.
**Enforced by:** `scripts/check-boundaries.ts`, which rejects a runtime `useRender` in any file without `'use client'` and a server file that takes `render` without `renderElement`; `tsc` keeps that `render` to the element form, since `renderElement` accepts only a `ReactElement`

### R-5.7-5 Public types are aliases derived at the seam
**Rule:** `export type DialogRootProps = Omit<Base.Root.Props, 'className'> & OwnProps`; never re-export a Base UI type name and never hand-copy a primitive's prop list.
**Why:** a hand-copied list hides new props and drifts; the alias is the one line that changes if the primitive changes.
**Enforced by:** `eslint` (no Base UI re-export anywhere; in `types.ts` a Base UI `.Props` is only omitted with `'className'`, picked without it, indexed or keyed); a hand-copied prop list is review

### R-5.7-6 Base UI state attribute grammar
**Rule:** boolean presence attributes (`data-open`, `data-loading`, `data-disabled`), never `data-state="..."`; enumerated design props are value attributes (`data-variant`, `data-size`, `data-tone`).
**Why:** Base UI already sets the boolean form, and two vocabularies would drift.
**Enforced by:** `eslint`

### R-5.7-7 Clamp every numeric limit
**Rule:** numeric props have `min` and `max` in the schema and are clamped at runtime with `clamp()`.
**Why:** a bad value must never break the UI.
**Enforced by:** unit test

## 5. Schemas and constants

### R-5.7-8 Every limit has a default, and the default never cuts real input
**Rule:** every bounded prop ships a default: numeric and structural ones (`visibleRows`, `maxRows`, `siblingCount`, `slidesPerView`, `Rating.max`) are clamped, and a text field takes its `maxLength` from `TEXT_MAX_LENGTH` in `shared/contracts/boundaries.ts`, keyed by input type. Each number sits far above any real value of that type, a counter appears at `COUNTER_THRESHOLD` of it, and the caller overrides with their own `maxLength` or removes the cap with `maxLength={null}`. A number field is bounded by `min`, `max` and `step`, never by a count of characters.
**Why:** a design system with no default is a design system where every team picks a different one and the fourth team forgets entirely, which is how an unbounded field reaches production. The default is there for the developer who never considered the case. It is set high enough that it is a guard rail rather than a validator, because a cap that cuts a name, an address or a pasted token is worse than no cap at all.
**Enforced by:** `src/shared/contracts/boundaries.test.ts`, which proves each cap clears the longest real value of its type and still stops a pasted file; the clamping half is `R-5.7-7`
### R-8.3-1 schema.ts is type-only for components
**Rule:** `schema.ts` is imported with `import type` only, so the full `zod` build never reaches the browser. A client file may import `zod/mini` at runtime for layer-2 validation; a Server Component may not import either. `zod` is a direct dependency, because `npm i topclassui zod` installs it for validation and types together.
**Why:** measured, the full build is 89 KB gzipped for one validator and `zod/mini` is 3.4 KB. HTML `maxLength` stops typing but not a paste or a DevTools edit, so a client control needs a real check; 3.4 KB buys that, 89 KB does not.
**Enforced by:** unit test (`no-zod-at-runtime`), which allows `zod/mini` in a client file and nothing else; `attw` is not in the repo yet

### R-8.3-2 Defaults live once
**Rule:** component-specific value lists live in `constants.ts` and are imported by the schema, by cva and by the component; the size list comes from `shared/contracts/size.ts`. The bounds live in `boundaries.ts` (R-8.3-6).
**Why:** three declarations of the same default cannot be kept in agreement.
**Enforced by:** unit test

### R-8.3-4 Types live in types.ts
**Rule:** a component's unions and prop interfaces are declared in `types.ts`, derived from `constants.ts` and `schema.ts`, and imported with `import type`; no prop interface is declared inline in `index.tsx` or `client.tsx`.
**Why:** one file shows a component's whole public surface, and a type-only file erases completely.
**Enforced by:** `scripts/check-structure.ts` + `eslint`

### R-8.3-5 No TypeScript enum
**Rule:** value lists are `as const` arrays with the union derived from them; never a TypeScript `enum`.
**Why:** an `enum` is a runtime value that survives into the bundle, does not tree-shake, and Node's type stripping rejects it.
**Enforced by:** `eslint` (`topclass/no-enum`)

### R-8.3-6 Bounds live apart from the value lists and the defaults
**Rule:** a component that enforces a bound has a `boundaries.ts` holding `<NAME>_BOUNDARIES` and nothing else: the bounds the component enforces, each far above any real value so that it is a guard rail rather than a validator. A component with nothing to bound has no such file (R-8.1-1). The value lists and the defaults stay in `constants.ts`. A bounded prop is clamped with `clamp()` and declared in `schema.ts` with the same number (R-5.7-7, R-5.7-8).
**Why:** a bound is not a default. A default is what the component does when asked for nothing; a bound is what it refuses whatever it is asked. Keeping them apart means the file a reviewer opens to check the guard rails holds only guard rails.
**Enforced by:** `check-structure` allows `boundaries.ts` in the folder contract and `pnpm new:component` writes it; that the component enforces the bound is review

### R-8.3-3 Props table from the types
**Rule:** the docs props table is generated from the emitted `.d.ts`, with defaults and limits supplied by the schema.
**Why:** the schema covers only design props and would omit `className`, `children` and inherited props.
**Enforced by:** not yet - the docs build does not exist yet

## 6. Text and i18n

### R-5.11-1 No hard-coded user-visible text
**Rule:** every built-in string comes from the `labels` prop with defaults from `shared/labels/en.ts`; `ar.ts` ships too. Demo files are exempt.
**Why:** the library must be usable in any language without patching components.
**Enforced by:** `eslint` for visible text and the labelled attributes; a string built at runtime is manual

### R-5.11-2 Labels with numbers are functions
**Rule:** a label containing a count is `(n, fmt) => string` and the Arabic file uses `Intl.PluralRules`.
**Why:** Arabic has six plural categories; a single template string is wrong for 1, 2 and 3.
**Enforced by:** type (`satisfies Labels`)

## 7. Collections and scrolling

### R-8.5-1 Lists use the collection contract
**Rule:** any component that renders items uses `CollectionProps` and `useCollection`: the `--tc-list-rows` knob, windowing above the threshold, and optional page-by-page loading.
**Why:** a component must never create ten thousand DOM nodes, and the app must not be forced to hand over every item at once.
**Enforced by:** `check-structure`, which requires `useCollection` in the `hook.ts` of every folder whose props take `items`, `CollectionProps` or `MenuContract`, less the exemptions `docs/DECISIONS.md` records; `e2e/collections.spec.ts`, which keeps fewer than a hundred of ten thousand rows mounted and sees `loadMore` called at the end

### R-8.5-2 The app owns the data
**Rule:** components never fetch, cache or paginate; they call `loadMore()` and render what they are given.
**Why:** data belongs to the application, not to the design system.
**Enforced by:** `eslint` (`topclass/no-fetch-in-components`, under `src/components`, `src/connectors` and `src/shared`)

### R-10.5-1 Overlays scroll inside themselves
**Rule:** popups use `POPUP_BOUNDS` and the row cap, dialogs and drawers scroll their body with sticky header and footer, and every scroll container inside an overlay sets `overscroll-behavior: contain`.
**Why:** the page must never scroll behind an open overlay.
**Enforced by:** `e2e/overlay-scroll.spec`, which proves in a browser that the Body of Dialog and Drawer is the scroll container between a header and a footer that keep their boxes, that Popover, Dropdown, Select, Combobox and DatePicker sit at the offset and the collision padding of `POPUP_BOUNDS` inside the room Base UI measured, with their lists inside the row cap, that Command caps its list under its input, and that every scroll container in an open overlay, the Toast viewport included, sets `overscroll-behavior: contain`; `check-structure` requires the Body

### R-10.5-2 Tooltips never scroll
**Rule:** a tooltip is one or two lines of plain text; anything larger, or anything with a link or control, is a Popover.
**Why:** a scrolling tooltip cannot be reached by pointer or keyboard.
**Enforced by:** type (`TooltipPopupProps['children']` is `TooltipText`) + `eslint` (`tooltip-content-is-text`, on src, demos and the harness)

### R-10.5-3 Sticky bars set the scroll padding
**Rule:** a sticky or fixed bar sets `--tc-sticky-top` or `--tc-sticky-bottom`, and the scroll container reads them into `scroll-padding-block`.
**Why:** WCAG 2.4.11: a focused element must not be hidden behind a bar.
**Enforced by:** `e2e/overlay-scroll.spec`, which proves that the sticky Navbar writes its height to `--tc-sticky-top` and the page reads both variables into `scroll-padding-block`; `check-structure`, which fails a folder that wears `STICKY_TOP` or `STICKY_BOTTOM` and never writes the matching variable

## 8. Code structure

### R-5.12-1 Logic is separate from markup
**Rule:** `client.tsx` is JSX plus at most one call to `useXxx()` from `hook.ts`; it holds no `useState`, `useEffect`, `useReducer`, `useRef`, `useMemo` or `useCallback`. Pure helpers live in `lib.ts`.
**Why:** markup and behaviour change for different reasons and are tested differently.
**Enforced by:** `eslint` (`client-shape`, per component and in every `'use client'` part) + `check-structure` (only a client file imports `hook.ts`)

### R-5.12-2 Files stay small
**Rule:** `check-structure` warns at 200 lines and fails at 300; a component that needs more files gets a `parts/` folder with one component per file.
**Why:** small focused files are easier to review and to edit correctly.
**Enforced by:** `scripts/check-structure.ts`

### R-5.12-3 Comments are one line
**Rule:** one line maximum, only for what the code cannot say (a browser quirk, a spec reference, a non-local constraint). No paragraph comments, no commented-out code, no narration of the next line. A `/** ... */` block documenting an export may run to three lines of prose and no more; past that it is an article and belongs in `docs/DECISIONS.md`. `scripts/`, `eslint-rules/` and config files are outside the check.
**Why:** long comments go stale and hide the code.
**Enforced by:** `eslint` under `src/`; the JSDoc exemption and everything outside `src/` are manual

### R-5.12-4 Naming
**Rule:** kebab-case files and folders, PascalCase components, `useThing` hooks, verb-first pure functions, `SCREAMING_CASE` constants in `constants.ts` or `classes.ts` inside a component folder; a shared contract under `shared/` may declare its own. A file in `parts/` exports one component named after the file.
**Why:** a predictable name is the cheapest documentation.
**Enforced by:** `scripts/check-structure.ts` for the kebab-case names, for a SCREAMING_CASE table declared outside `constants.ts` or `classes.ts`, and for the parts-folder naming contract in `scripts/lib/part-names.ts`, where a `parts/` file exports one component named after it, `hook.ts` only `use*` hooks and the contexts they read, `lib.ts` only functions; verb-first and PascalCase names elsewhere are manual

### R-17-1 A test expectation is named, never derived
**Rule:** an expectation is written out, never computed from the thing under test; deleting half the implementation must not also delete half the assertion.
**Why:** a derived expectation passes whatever the code does, which is how several suites here passed while the code was wrong.
**Enforced by:** `eslint` (`topclass/no-derived-expectations`)

### R-5.12-5 Strict TypeScript
**Rule:** no `any`, no `@ts-ignore`, no non-null assertion without a one-line reason; relative imports carry explicit `.js` extensions and type imports use `import type`.
**Why:** the types are the public API.
**Enforced by:** `eslint` + `tsc`

### R-8.1-1 The folder contract
**Rule:** a file exists only if the component needs it, and only the files in PLAN.md 8.1 may exist. Never `loading.tsx`, `error.tsx`, `page.tsx` or `layout.tsx` (Next.js reserves those names); use `skeleton.tsx`, `empty-state.tsx` and `error-state.tsx`. Examples are one file each under `dummy/`, and tests under `test/`.
**Why:** a predictable folder is what makes scaffolding, checking and documenting automatic.
**Enforced by:** `scripts/check-structure.ts`

### R-8.1-2 meta.ts answers to one contract
**Rule:** `meta.ts` is declared `satisfies ComponentMeta` from `#shared/meta.js`, its `slug` is the folder name, and `baseUiRange` is non-null whenever `baseUi` is. `status` is `stable` only when every line of PLAN 20 is true.
**Why:** the docs navigation and the generated `registry.json` key on these fields, and 46 hand-written objects drift before anything reads them.
**Enforced by:** `check-structure` requires the file; `src/shared/meta.test.ts` checks its shape for every folder that has one

### R-8.1-3 The README is generated, never written by hand
**Rule:** every component folder has a `README.md` written by `pnpm readme:build` from `schema.ts`, `types.ts` and `meta.ts`. Prose goes between the `<!-- hand-written -->` markers and nothing else in the file is edited.
**Why:** the first question anyone asks of a component is whether a prop is optional or mandatory, and a hand-written table answers it confidently and wrongly within a week. Generating it from the schema and the types means it cannot disagree with the code.
**Enforced by:** `check-structure` requires the file; `check:readme` fails when it is stale

## 9. Icons

### R-7-1 Two entry points
**Rule:** `<Icon name>` on the server; `<Svg icon={x}>` with an explicit per-icon import in client and shared files. Never import the loader map outside `components/icon`.
**Why:** a string-keyed map in a client file would ship every icon.
**Enforced by:** `eslint` + `server-only`

### R-7-2 Names in data props resolve on the server
**Rule:** a contract that carries `icon: IconName` is resolved to an element by the component's server half; the client-side contract carries `ReactNode`.
**Why:** it keeps string names in the public API without shipping the map.
**Enforced by:** type, once a component carries an `IconName` contract

## 10. Accessibility

### R-5.6-1 WCAG 2.2 AA
**Rule:** keyboard behaviour follows the ARIA Authoring Practices; a visible `focus-visible` ring on every interactive element; types enforce labels.
**Why:** it is a promise of the library, not an extra.
**Enforced by:** `e2e/keyboard-<slug>.spec.ts`, one per interactive component of Units 3 to 5 (Unit 3's sixteen, Unit 4's ten, Unit 5's six; helpers in `e2e/keyboard.ts`, `e2e/ring.ts` and `e2e/keys.ts`), which presses every key of its Authoring Practices pattern in both directions, the roving tab stop, Escape and the focus return, and reads the computed 2 px `focus-visible` ring on each stop; `e2e/focus-ring.spec.ts` for Button; the rest of Units 1 and 2 is manual; `axe` covers the ARIA attributes in `test:e2e`; the labels are type tests

### R-5.6-2 Target size
**Rule:** every interactive element is at least 24x24 CSS px on every pointer type and 44px under `pointer-coarse`. The floor is a px token with a px fallback, never a rem step, because the success criterion is written in CSS px.
**Why:** WCAG 2.5.8.
**Enforced by:** `e2e/target-size.spec.ts`, which measures every interactive box in a real browser at both pointer types

### R-5.6-3 Every drag has an alternative
**Rule:** Slider, Drawer and Toast swipe, Carousel, Resizable, sortable lists and the editor kit each provide a keyboard or button path to the same result.
**Why:** WCAG 2.5.7.
**Enforced by:** `e2e/keyboard-slider.spec.ts`, where the keys reach every value a drag reaches, and `e2e/keyboard-drawer.spec.ts` and `e2e/keyboard-toast.spec.ts` (Escape, and the x by Enter and by Space); Carousel, Resizable, sortable lists and the editor kit do not exist yet

### R-5.6-4 Contrast
**Rule:** 4.5:1 for text, including a tone's text colour on its own soft tint; 3:1 for `--tc-line-strong`, `--tc-ring` and icons. `--tc-line` is decorative and exempt.
**Why:** a hairline divider cannot reach 3:1 with any neutral light enough to read as a hairline.
**Enforced by:** `scripts/check-contrast.ts`

## 11. Dependencies and process

### R-5.9-1 The allowed dependency list
**Rule:** the package may depend on `@base-ui/react`, `clsx`, `tailwind-merge`, `class-variance-authority`, `zod` and `server-only`; `react`, `react-dom` and `tailwindcss` are peers; anything else is an optional peer used by exactly the components that need it. Banned: CSS-in-JS runtimes, lodash, moment, runtime theme objects.
**Why:** installing the library for a Button must not pull in a calendar.
**Enforced by:** review; `publint` is not in the repo yet

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
