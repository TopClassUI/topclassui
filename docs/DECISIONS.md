# Decisions

One entry per decision, newest first. A decision is recorded here when it differs from `docs/PLAN.md`, when the plan asks for it explicitly, or when a rule in `docs/RULES.md` had to be bent. Reference the rule id where one exists.

The format is: date, decision, why, and what it affects.

---

## 2026-09-21 - Everything is designed in Figma before it is built

**Decision.** The whole design system exists in Figma before any component code: every catalog row as a component set with all states, modes and both directions, and every docs route as a page frame. What is in Figma is what gets built (PLAN.md 6.6, Phase 0.5).

**Why.** Omar wants the visual decisions settled before code, and one reference that code is checked against instead of two sources drifting.

**Affects.** Phase 0.5 sits before Phase 1. Every component's Definition of Done includes a parity check against its Figma frame. "1:1" means the same tokens, dimensions and states with a screenshot diff inside the visual-test tolerance; pixel-identical output is not achievable across a browser and Figma.

## 2026-09-21 - Figma access stays on the free plan for now

**Decision.** Use the remote Figma MCP server on the existing Starter plan and View seat. Do not upgrade yet.

**Why.** Verified on this date by creating a file and writing a component into it: the write tools are exempt from Figma's rate limits and the View seat was allowed to write. The desktop MCP server was ruled out because it is read-only and needs a paid Dev or Full seat.

**Affects.** The monthly cap applies to read tools, so Phase 0.5 verifies each batch from the write tool's own return value and takes screenshots only at sign-off points. If a write is ever refused, upgrade to Professional with a Full seat (200 calls a day) before continuing.

## 2026-09-21 - `<Icon name>` stays; the sprite does not

**Decision.** Keep the `<Icon name="arrow-left" />` API. Implement it as inline SVG from one generated module per icon, with `<Icon>` async and server-only and `<Svg icon={x}>` for client and shared files (PLAN.md section 7, R-7-1).

**Why.** The API is what data-driven props, the future inspector and AI tools need. A sprite cannot grow past a few hundred icons, needs a per-consumer sync step, is same-origin only and does not work in Open Graph images. A single hashmap of icons would ship every icon to the browser as soon as one client file imported it. One module per icon keeps the API and loads only what is used.

**Affects.** `packages/icons` ships data and a CLI only; the components live in `packages/react`. `@topclassui/next` stays tier 2. Repeated icons inline their path more than once; this is measured in Phase 3.

## 2026-09-21 - One size scale on every component

**Decision.** `size` is `xs | sm | md | lg | xl | custom` with `md` as the default, defined once as `--spacing-control-*` tokens and `CONTROL_SIZE` classes (R-5.7-2).

**Why.** Omar asked for the full scale everywhere, not only on Button and Input. Defining it once is what makes a Button, an Input and a Select trigger of the same size line up in a form row.

**Affects.** Every schema imports `sizeSchema`. Connector contracts carry `size`. `<Icon>` is the documented exception: its `size` is a CSS length.

## 2026-09-21 - Lists window and page instead of rendering everything

**Decision.** One collection contract for every component that renders items: the `--tc-list-rows` knob (default 7), windowing above 200 items, and optional `loadMore` (PLAN.md 8.5, R-8.5-1).

**Why.** A dropdown with ten thousand options must not create ten thousand elements, and the app must not be forced to hand over every item at once.

**Affects.** Select, Combobox, Command, menus, DataTable, TreeView, Carousel, FileUpload, the icons page. TanStack Virtual becomes an optional peer. `StateProps` gains `loading-more`.

## 2026-09-21 - Logic separated from markup, comments one line

**Decision.** `client.tsx` is markup plus at most one hook call; logic lives in `hook.ts`, pure helpers in `lib.ts`; files stay under 200 lines; comments are one line (PLAN.md 5.12).

**Why.** Omar asked for clean, split, readable code and no paragraph comments in every file.

**Affects.** The folder contract gains `hook.ts`, `lib.ts` and `parts/`. `check-structure` enforces all of it. The plan's own code samples were rewritten to match.

## 2026-09-21 - The rules live in one file and are generated for every tool

**Decision.** `docs/RULES.md` is the single source; `CLAUDE.md`, `AGENTS.md` and `.cursor/rules/topclassui.mdc` are generated from it and checked in CI (PLAN.md section 23).

**Why.** A fresh session in any tool must get the identical, complete rule set, and three hand-maintained copies would drift.

**Affects.** `pnpm rules:sync` is a Phase 0 deliverable and part of `pnpm check`. The three files were written by hand on this date; `rules-sync` must reproduce them byte for byte, which is its first test.

## 2026-09-21 - Foundations first, then one component, then quantity

**Decision.** Phase 0 builds every shared module, contract, script and docs template before any component exists. Phase 3 finishes exactly one component (Button) to the last line of the Definition of Done. Phases 4 to 7 add components and are forbidden from adding infrastructure (PLAN.md section 19).

**Why.** Omar asked that components be built fully from the start rather than upgraded later. Adding a component should be quantity, not design.

**Affects.** `TopClassProvider`, `shared/floating`, `useCollection` and the docs page template move into Phase 0. A component that needs something new stops the phase; the shared piece is added with tests first and recorded here.

## 2026-09-21 - Tier 1 trimmed to 46 components

**Decision.** Kbd, Center, Cluster, RadioCards, CheckboxGroup, Fieldset and Collapsible move to tier 2, and the react-hook-form adapter with them. Popover stays tier 1.

**Why.** Fifty-three components each meeting a sixteen-line Definition of Done is not a credible part-time v0.1. Popover stays because the scroll policy makes it the required home for any content a tooltip cannot hold.

**Affects.** Section 18 rows, the Phase 4 to 6 build lists, and the time estimate.

## 2026-09-21 - Cache Components stays off in v0.1

**Decision.** Do not enable `cacheComponents` in the docs app for v0.1; revisit before 1.0.

**Why.** It is opt-in in Next.js 16.3, and enabling it changes where every request-time API must sit. The docs site is fully static by construction, so it gains nothing now.

**Affects.** PLAN.md 15.3. The static guarantee is enforced instead by having no route read `searchParams`, `cookies()`, `headers()` or `connection()`.

## 2026-09-21 - The docs app consumes `dist`, not source

**Decision.** Inside the monorepo the docs app resolves each package through its `exports` to `dist`, with `tsc --watch` running alongside `next dev`. `transpilePackages` is not used.

**Why.** Turbopack does not resolve a relative import written as `./client.js` to `client.tsx`, which is the extension convention the published ESM needs, and `transpilePackages` never redirects resolution from `dist` to source anyway.

**Affects.** PLAN.md section 4. Revisit when Turbopack supports the extension alias.

## 2026-09-21 - `exactOptionalPropertyTypes` is off in the packages

**Decision.** Off for `packages/*`, on for `apps/docs` and `scripts/`.

**Why.** A component library must accept `size={cond ? 'lg' : undefined}`, which the flag rejects, and it would add `| undefined` to every line of the public types and the generated props table.

**Affects.** `packages/tsconfig/library.json` and `nextjs.json`.

## 2026-09-21 - Scripts run with `tsx`, Node floor 22.14

**Decision.** The scripts in `scripts/` run with `tsx`. `engines.node` is `>=22.14` and `.node-version` is `22.14.0`.

**Why.** The installed Node is 22.14, which cannot run a `.ts` file without a flag; Node's own type stripping is unflagged only from 22.18. `tsx` works today and keeps the `.js` import convention used everywhere else.

**Affects.** PLAN.md section 4. Revisit after upgrading Node.

## 2026-09-21 - `axe-core` directly instead of `vitest-axe`

**Decision.** Use `axe-core` with a small `expect.extend` matcher for unit tests, and `@axe-core/playwright` in the browser.

**Why.** `vitest-axe`'s npm `latest` tag still points at a 2022 build, so installing it normally gets a stale package; it is a low-activity fork of jest-axe.

**Affects.** PLAN.md 17.1.

## 2026-09-21 - Visual baselines are generated on Linux only

**Decision.** Screenshot baselines are produced only inside the pinned Playwright Docker image, locally through WSL 2 or by a manual CI workflow. `updateSnapshots` is `none` in CI.

**Why.** Playwright names snapshots per platform and rendering differs between Windows and Linux, and the default `missing` setting would let the first CI run write its own baselines and pass while asserting nothing.

**Affects.** PLAN.md 17.3, `.gitignore`.

## 2026-09-21 - Token corrections for contrast

**Decision.** `--tc-success` is emerald-700, `--tc-info` is sky-700, `--tc-border-strong` is neutral-500 in both modes, dark mode keeps the light `--tc-primary` (violet-600), the ocean mode uses cyan-700 and sets its own `--tc-primary-fg`, and every tone gains a `-text` token (the 700 shade in light, the 400 shade in dark). `--tc-border` is documented as decorative and exempt from the 3:1 check.

**Why.** Thirteen of twenty-eight default pairs failed the plan's own contrast rule when computed from Tailwind's actual oklch values. No 600-level tone can serve both as a solid background under white text and as text on its own soft tint, and no neutral light enough to read as a hairline reaches 3:1.

**Affects.** PLAN.md 6.2 and 5.6. The warning, info and neutral text values are confirmed by `check-contrast` in Phase 1.

## 2026-09-21 - Select sets `alignItemWithTrigger={false}`

**Decision.** Pass `alignItemWithTrigger={false}` on `Select.Positioner`.

**Why.** Base UI defaults it to true, which aligns the selected item with the trigger and ignores `side`, `align` and `sideOffset`, so the shared floating defaults would not apply to Select.

**Affects.** PLAN.md 10.1.

## 2026-09-21 - `#shared/*` subpath imports deferred

**Decision.** Keep relative imports with explicit `.js` extensions. Do not introduce `#shared/*` imports yet.

**Why.** The `imports` field would have to map to `src` during `tsc` and to `dist` when published, and that mapping is not worth settling before Phase 0 exists.

**Affects.** R-5.12-5. Revisit if relative depth becomes a real problem.

## 2026-09-21 - LF line endings enforced by `.gitattributes`

**Decision.** `.gitattributes` sets `* text=auto eol=lf` (with `eol=crlf` for `.bat` and `.cmd`, and binaries marked), `.editorconfig` sets `end_of_line = lf`, and the repository was renormalised.

**Why.** Git for Windows has `core.autocrlf=true` in the system config, so without this file Omar's checkout and Linux CI would differ, breaking Prettier, the `'use client'` first-line check and the icon content hash.

**Affects.** Every file. Committed before the plan revision.
