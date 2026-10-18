<!-- Generated from docs/RULES.md by `pnpm rules:sync`. Do not edit. -->

# TopClass UI - working rules

Read docs/STATUS.md first for where things stand. The full specification is docs/PLAN.md; the rules below are the complete list; do not deviate without a docs/DECISIONS.md entry.

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

- **R-5.1-1** `index.tsx` never contains `'use client'`, never imports a React client hook (only `useId` and `use` are allowed) and never imports `./hook.js`. _(check-boundaries, which holds every parts/*.tsx without 'use client' to the same hook rules, since index.tsx may render it)_
- **R-5.1-2** For a C component or a connector, `index.tsx` holds no markup: it re-exports the client parts, the prop types, the variants and the skeleton. _(check-structure, for every folder whose meta says rendering: 'client' and every folder under src/connectors/: each statement of index.tsx is an import type or a re-export from its own folder, values only from client, variants, skeleton, lib or a 'use client' file; src/shared/meta.test ties rendering to PLAN 18)_
- **R-5.1-3** Only serializable props cross the boundary: strings, numbers, booleans, plain objects, arrays and `ReactNode` children; functions never, except Server Actions. _(src/test/serializable, through test/<slug>.serializable.test in every component that renders in index.tsx)_
- **R-5.1-4** No React context in Server Components: direction and theme come from `dir` and `data-theme` on the HTML, and labels come from props. _(check-boundaries)_
- **R-5.1-5** Only `components/icon/index.tsx` may be async or import `server-only`; every other `index.tsx` renders in a non-RSC React tree, and the sync `<Icon>` from `icon-registry` carries the identical props for browser-only trees. _(check-boundaries)_
- **R-9.2-3** Export flat names (`DialogRoot`), never an object (`Dialog.Root`) that a server file would dot into. _(eslint)_
- **R-9.2-4** A component split into parts names its root `<Name>Root` without exception (`CardRoot`, `DialogRoot`, `AvatarRoot`), and a scrolling overlay names its parts `<Name>Header`, `<Name>Body` and `<Name>Footer`, where the Body is the scroll container R-10.5-1 requires. _(eslint, which reads the exported names; check-structure, which fails a scrolling overlay whose index.tsx exports no <Name>Body, and which checks the parts/ half through the parts-folder naming contract in lib/part-names, which requires Dialog's and Drawer's Header, Body and Footer)_

## 2. Styling

- **R-5.2-1** Inside `src/`, use `bg-primary-solid`, `text-body`, `border-line`; palette classes, arbitrary colours (a hex, a colour function or a named colour such as `bg-[red]`) and the `dark:` variant are banned. The one exception is a CSS system colour (`CanvasText`, `Canvas`, `Highlight`), allowed only behind the `forced-colors:` variant. _(eslint)_
- **R-5.2-2** Merge classes with `cn()` from `shared/cn.ts`, which uses `extendTailwindMerge`; the consumer's `className` is passed last. _(unit test for the merge; eslint for the argument order)_
- **R-5.2-3** No `` `bg-${tone}` ``; use a lookup object or cva variants. _(eslint)_
- **R-5.2-4** Sizes, radius, border width, the focus ring, hover, transitions and scroll classes come from the knobs and `shared/classes.ts`; never `rounded-md`, `h-10`, `outline-2`, `border-2`, `duration-200`, or a hand-written `hover:` or `focus-visible:`. _(eslint)_
- **R-5.2-5** `style` is only for setting a `--tc-*` variable. _(eslint)_
- **R-5.2-6** Write `data-open:`, `group-data-panel-open:`, `aria-busy:`; brackets only for values. _(eslint over src/, e2e/ and build-harness.tsx, arbitrary selectors such as [&[data-open]]: and has-[[data-open]]: included)_
- **R-4-1** Only custom-property declarations and `@keyframes` may be unlayered; other rules go in `@layer base` (tokens) or `@layer components` (react). `@utility` and `@custom-variant` count as layered, because Tailwind emits them into its own layers. _(check-css)_
- **R-4-2** Every `--tc-*` name referenced anywhere in `src/` is declared in `src/tokens.css`. _(check-css)_
- **R-4-3** R-5.12-3 applies to `.css` files; no comment spans more than one line. _(check-css)_
- **R-5.2-7** A control that renders caller-supplied text carries `CONTAIN` from `shared/classes.ts`, and its label sits on an element of its own carrying `LABEL`, so a long label truncates with an ellipsis instead of pushing the page apart. The data is never cut: only the rendering is. _(e2e/contain.spec, which measures the control against its container in three modes and both directions)_

## 3. RTL

- **R-5.3-1** `ps-`, `pe-`, `ms-`, `me-`, `inset-s-`, `inset-e-`, `text-start`, `border-s`, `rounded-s`; never physical `left`/`right`, never the deprecated `start-*`/`end-*`, never `space-x` or `divide-x`. _(eslint)_
- **R-5.3-2** Translate, transform origin and gradient direction multiply by `--tc-dir`; `object-*` and `bg-*` positions use an `rtl:` variant, since no logical form exists. _(eslint and check-css for stylesheets)_
- **R-5.3-3** No `tracking-*` anywhere inside `src/`. _(eslint)_
- **R-5.3-4** Use the `placement` prop, which maps to Base UI's `side` and `align`; never `left` or `right` as a side. _(type + eslint)_
- **R-13-1** The app mounts `TopClassProvider` at the root layout with `direction` and `locale` as props from the layout, never read from `document.dir` in an effect. _(src/shared/provider/provider.warning.dom.test and .ssr.test, which prove the provider warns once in development when the layout leaves out direction or locale, never in production and never on the server; an app with no provider at all is review)_

## 4. API conventions

- **R-5.7-1** `variant`, `tone`, `size`, positive booleans (`disabled`, `loading`, `fullWidth`); events are `onValueChange` and `onOpenChange`; controlled pairs are `value`/`defaultValue` and `open`/`defaultOpen`. _(manual + type tests)_
- **R-5.7-2** `size` is `xs | sm | md | lg | xl | custom`, default `md`, on every component that has a visual scale; `custom` emits no size classes. `<Icon>` takes the same five names against its own pixel values (`ICON_SIZE`: 16, 20, 24, 32, 40) and any CSS length, and is the only component whose default is `1em` rather than `md`. _(shared/contracts/size + type tests)_
- **R-5.7-3** Every component accepts them and spreads the rest onto its root element; `ref` is a normal prop, never `forwardRef`. A skeleton is a component too. _(src/test/root-props.dom.test.tsx, which renders every export and skeleton of every folder from its test/fixture and proves className, ref and an unknown data-* reach the root, or the element a DECISIONS entry names; style is manual)_
- **R-5.7-4** Server components accept the element form only, implemented with `renderElement`; client components may also accept the function form through `useRender`. _(check-boundaries, which rejects a runtime useRender in any file without 'use client', demos included, and a server file that takes render or a link element without calling renderElement ; tsc rejects a function passed to renderElement, and each server component's types declares render: ReactElement, pinned by its type tests)_
- **R-5.7-5** `export type DialogRootProps = Omit<Base.Root.Props, 'className'> & OwnProps`; never re-export a Base UI type name and never hand-copy a primitive's prop list. _(eslint ; a hand-copied prop list is review)_
- **R-5.7-6** Boolean presence attributes (`data-open`, `data-loading`, `data-disabled`), never `data-state="..."`; enumerated design props are value attributes (`data-variant`, `data-size`, `data-tone`). _(eslint)_
- **R-5.7-7** Numeric props have `min` and `max` in the schema and are clamped at runtime with `clamp()`. _(unit test)_

## 5. Schemas and constants

- **R-5.7-8** Every bounded prop ships a default: numeric and structural ones (`visibleRows`, `maxRows`, `siblingCount`, `slidesPerView`, `Rating.max`) are clamped, and a text field takes its `maxLength` from `TEXT_MAX_LENGTH` in `shared/contracts/boundaries.ts`, keyed by input type. Each number sits far above any real value of that type, a counter appears at `COUNTER_THRESHOLD` of it, and the caller overrides with their own `maxLength` or removes the cap with `maxLength={null}`. A number field is bounded by `min`, `max` and `step`, never by a count of characters. _(src/shared/contracts/boundaries.test, which proves each cap clears the longest real value of its type and still stops a pasted file; the clamping half is R-5.7-7)_
- **R-8.3-1** `schema.ts` is imported with `import type` only, so the full `zod` build never reaches the browser. A client file may import `zod/mini` at runtime for layer-2 validation; a Server Component may not import either. `zod` is a direct dependency, because `npm i topclassui zod` installs it for validation and types together. _(unit test , which allows zod/mini in a client file and nothing else; attw is not in the repo yet)_
- **R-8.3-2** Component-specific value lists live in `constants.ts` and are imported by the schema, by cva and by the component; the size list comes from `shared/contracts/size.ts`. The bounds live in `boundaries.ts` (R-8.3-6). _(unit test)_
- **R-8.3-4** A component's unions and prop interfaces are declared in `types.ts`, derived from `constants.ts` and `schema.ts`, and imported with `import type`; no prop interface is declared inline in `index.tsx` or `client.tsx`. _(check-structure + eslint)_
- **R-8.3-5** Value lists are `as const` arrays with the union derived from them; never a TypeScript `enum`. _(eslint)_
- **R-8.3-6** A component that enforces a bound has a `boundaries.ts` holding `<NAME>_BOUNDARIES` and nothing else: the bounds the component enforces, each far above any real value so that it is a guard rail rather than a validator. A component with nothing to bound has no such file (R-8.1-1). The value lists and the defaults stay in `constants.ts`. A bounded prop is clamped with `clamp()` and declared in `schema.ts` with the same number (R-5.7-7, R-5.7-8). _(check-structure allows boundaries in the folder contract and pnpm new:component writes it; that the component enforces the bound is review)_
- **R-8.3-3** The docs props table is generated from the emitted `.d.ts`, with defaults and limits supplied by the schema. _(not yet - the docs build does not exist yet)_

## 6. Text and i18n

- **R-5.11-1** Every built-in string comes from the `labels` prop with defaults from `shared/labels/en.ts`; `ar.ts` ships too. Demo files are exempt. _(eslint for visible text and the labelled attributes; a string built at runtime is manual)_
- **R-5.11-2** A label containing a count is `(n, fmt) => string` and the Arabic file uses `Intl.PluralRules`. _(type)_

## 7. Collections and scrolling

- **R-8.5-1** Any component that renders items uses `CollectionProps` and `useCollection`: the `--tc-list-rows` knob, windowing above the threshold, and optional page-by-page loading. _(check-structure, which requires useCollection in the hook of every folder whose props take items, CollectionProps, MenuContract or visibleRows, or whose code reads --tc-list-rows, less the exemptions docs/DECISIONS.md records; e2e/collections.spec, which keeps fewer than a hundred of ten thousand rows mounted in every windowed list and sees loadMore called at the end of every list whose props take it)_
- **R-8.5-2** Components never fetch, cache or paginate; they call `loadMore()` and render what they are given. _(eslint for fetch, storage and cache ; paginate is manual)_
- **R-10.5-1** Popups use `POPUP_BOUNDS` and the row cap, dialogs and drawers scroll their body with sticky header and footer, and every scroll container inside an overlay sets `overscroll-behavior: contain`. _(e2e/overlay-scroll.spec, which proves in a browser that the Body of Dialog and Drawer is the scroll container between a header and a footer that keep their boxes, and that on a 320 x 256 screen the popup scrolls as one instead, that Popover, Dropdown, Select, Combobox and DatePicker sit at the offset and the collision padding of FLOATING inside the room Base UI measured, with their lists inside the row cap and the DatePicker's grid scrolling under its month, that Command caps its list under its input, and that every scroll container in an open overlay, the Toast viewport included, sets overscroll-behavior: contain; src/shared/classes.overlay.test, which fails any classes under src/components that writes the room as its own bound instead of POPUP_BOUNDS; check-structure requires the Body)_
- **R-10.5-2** A tooltip is one or two lines of plain text; anything larger, or anything with a link or control, is a Popover. _(type + eslint + e2e/tooltip.spec, which proves two lines for every demo; a caller's text is held by max-w-xs and wrapping, a guard rail rather than a validator)_
- **R-10.5-3** A sticky or fixed bar sets `--tc-sticky-top` or `--tc-sticky-bottom`, and the scroll container reads them into `scroll-padding-block`. _(e2e/overlay-scroll.spec, which proves that the sticky Navbar writes its height to --tc-sticky-top, that a Toast stack at the bottom writes its height to --tc-sticky-bottom and Tab leaves the last link of the page clear of it, and that the page reads both variables into scroll-padding-block; check-structure, which fails a folder that wears STICKY_TOP or STICKY_BOTTOM and never writes the matching variable)_

## 8. Code structure

- **R-5.12-1** `client.tsx` and every `'use client'` part are JSX plus at most one call to `useXxx()` from `hook.ts` per component; they hold no `useState`, `useEffect`, `useReducer`, `useRef`, `useMemo` or `useCallback`. Pure helpers live in `lib.ts`. _(eslint + check-structure + check-boundaries)_
- **R-5.12-2** `check-structure` warns at 200 lines and fails at 300; a component that needs more files gets a `parts/` folder with one component per file. _(check-structure)_
- **R-5.12-3** One line maximum, only for what the code cannot say (a browser quirk, a spec reference, a non-local constraint). No paragraph comments, no commented-out code, no narration of the next line. A `/** ... */` block documenting an export may run to three lines of prose and no more; past that it is an article and belongs in `docs/DECISIONS.md`. `scripts/`, `eslint-rules/` and config files are outside the check. _(eslint under src/; the JSDoc exemption and everything outside src/ are manual)_
- **R-5.12-4** Kebab-case files and folders, PascalCase components, `useThing` hooks, verb-first pure functions, `SCREAMING_CASE` constants in `constants.ts` or `classes.ts` inside a component folder; a shared contract under `shared/` may declare its own. A file in `parts/` exports one component named after the file. _(check-structure for the kebab-case names, for a SCREAMING_CASE table declared outside constants or classes, and for the parts-folder naming contract in lib/part-names, where a parts/ file exports one component named after it, hook only use* hooks and the contexts they read, lib only functions; verb-first and PascalCase names elsewhere are manual)_
- **R-17-1** An expectation is written out, never computed from the thing under test; deleting half the implementation must not also delete half the assertion. _(eslint)_
- **R-5.12-5** No `any`, no `@ts-ignore`, no non-null assertion without a one-line reason; relative imports carry explicit `.js` extensions and type imports use `import type`. _(eslint + tsc)_
- **R-8.1-1** A file exists only if the component needs it, and only the files in PLAN.md 8.1 may exist. Never `loading.tsx`, `error.tsx`, `page.tsx` or `layout.tsx` (Next.js reserves those names); use `skeleton.tsx`, `empty-state.tsx` and `error-state.tsx`. Examples are one file each under `dummy/`, and tests under `test/`. _(check-structure)_
- **R-8.1-2** `meta.ts` is declared `satisfies ComponentMeta` from `#shared/meta.js`, its `slug` is the folder name, and `baseUiRange` is non-null whenever `baseUi` is. `status` is `stable` only when every line of PLAN 20 is true. _(check-structure requires the file; src/shared/meta.test checks its shape for every folder that has one)_
- **R-8.1-3** Every component folder has a `README.md` written by `pnpm readme:build` from `schema.ts`, `types.ts` and `meta.ts`. Prose goes between the `<!-- hand-written -->` markers and nothing else in the file is edited. _(check-structure requires the file; check:readme fails when it is stale)_

## 9. Icons

- **R-7-1** `<Icon name>` on the server; `<Svg icon={x}>` with an explicit per-icon import in client and shared files. Never import the loader map outside `components/icon`. _(eslint + server-only)_
- **R-7-2** A contract that carries `icon: IconName` is resolved to an element by the component's server half; the client-side contract carries `ReactNode`. _(type, once a component carries an IconName contract)_

## 10. Accessibility

- **R-5.6-1** Keyboard behaviour follows the ARIA Authoring Practices; a visible `focus-visible` ring on every interactive element; types enforce labels. _(e2e/keyboard-<slug>.spec, one per interactive component of Units 3 to 5 , which presses every key of its Authoring Practices pattern in both directions, the roving tab stop, Escape and the focus return, and reads the computed 2 px focus-visible ring on each stop; e2e/focus-ring.spec for Button; the rest of Units 1 and 2 is manual; axe covers the ARIA attributes in test:e2e; the labels are type tests)_
- **R-5.6-2** Every interactive element is at least 24x24 CSS px on every pointer type and 44px under `pointer-coarse`. The floor is a px token with a px fallback, never a rem step, because the success criterion is written in CSS px. _(e2e/target-size.spec, which measures every interactive box in a real browser at both pointer types)_
- **R-5.6-3** Slider, Drawer and Toast swipe, Carousel, Resizable, sortable lists and the editor kit each provide a keyboard or button path to the same result. _(e2e/keyboard-slider.spec, where the keys reach every value a drag reaches, and e2e/keyboard-drawer.spec and e2e/keyboard-toast.spec ; Carousel, Resizable, sortable lists and the editor kit do not exist yet)_
- **R-5.6-4** 4.5:1 for text, including a tone's text colour on its own soft tint; 3:1 for `--tc-line-strong`, `--tc-ring` and icons. `--tc-line` is decorative and exempt. _(check-contrast)_

## 11. Dependencies and process

- **R-5.9-1** The package may depend on `@base-ui/react`, `clsx`, `tailwind-merge`, `class-variance-authority`, `zod` and `server-only`; `react`, `react-dom` and `tailwindcss` are peers; anything else is an optional peer used by exactly the components that need it. Banned: CSS-in-JS runtimes, lodash, moment, runtime theme objects. _(review; publint is not in the repo yet)_
- **R-0-1** Check the installed package's types or the official docs before using any API, and record anything that differs in `docs/DECISIONS.md`. _(manual)_
- **R-0-2** Run `pnpm check` before reporting done and paste the real output; if something fails and cannot be fixed, say so. _(manual)_
- **R-20-1** A component is finished only when every line of PLAN.md section 20 is true, including the Figma parity check. _(pull-request checklist)_
