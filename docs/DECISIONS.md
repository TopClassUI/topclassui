# Decisions

One entry per decision, newest first. A decision is recorded here when it differs from `docs/PLAN.md`, when the plan asks for it explicitly, or when a rule in `docs/RULES.md` had to be bent. Reference the rule id where one exists.

The format is: date, decision, why, and what it affects.

---

## 2026-09-22 - Phase 0.5: 46 components drawn, 8 of them as variant sets

**Decision.** The Components page carries all 46 tier-1 components as documentation frames showing every state, a three-column Light / Dark / Ocean comparison, and a left-to-right against right-to-left comparison in Arabic. Eight are real Figma component sets, 263 variants in total: Button 90, Input 30, Tag 30, Checkbox 30, Radio 25, Switch 25, Badge 18, Avatar 15.

**Why.** Breadth first. A drawn component settles the visual decisions, which is what the parity gate of 6.6 actually needs, and it surfaces contradictions early - the loading-versus-disabled clash was found this way. The eight componentised are the ones a designer reaches for most and the ones with a clean property grid; the rest are compositions whose variants would be guesses until the code exists.

**Affects.** Phase 0.5 is not complete until each row of section 18 has a component set whose properties match section 5.7 verbatim. Today a designer can instance those eight and read the other 38.

RTL is covered by one comparison section showing six components in both directions in Arabic, not by a mirrored copy of every frame. That is enough to settle the rules - the layout mirrors, `arrow-*` and `caret-*` flip, `magnifying-glass` and `check-circle` do not - and cheaper than doubling the page. A per-component RTL frame is only needed where a component's mirroring is not obvious from those rules.

**Still missing from Phase 0.5:** component sets for the other 38; the docs route page frames; tiers 2 to 4.

## 2026-09-22 - Three more Size groups: padding-y, toggle and icon

**Decision.** The Size collection gains `padding-y/<size>` (2, 4, 6, 8, 10), `toggle/<size>` (14, 16, 20, 24, 28) and `icon/<size>` (16, 20, 24, 32, 40), taking it to 35 variables.

**Why.** Drawing the components found three scales the plan used but never defined. A Badge and an Alert need vertical padding that is not `padding-x`. A Checkbox, Radio and Switch need a box size that is neither a control height nor an icon size - 40px would be a huge checkbox. And `icon/<size>` is the scale behind the five `<Icon>` names.

**Affects.** `shared/contracts/size.ts` carries all three alongside `CONTROL_SIZE`. Every value is a variable in Figma, so no component drawn on the page contains a raw number.

## 2026-09-22 - A loading Button stays at full colour

**Decision.** The Button base classes gain `aria-busy:opacity-100`, so a loading button keeps its colour instead of dimming (PLAN.md 8.4).

**Why.** Found while drawing the Button states in Figma. `index.tsx` sets `disabled: disabled || loading`, and the base classes carry `disabled:opacity-50`, so every loading button would have rendered at half opacity and read as disabled. Loading and disabled are different states and must look different: loading keeps full colour, shows the spinner and sets `aria-busy`; disabled dims.

**Affects.** PLAN.md 8.4 and every component that follows the same pattern. The Figma states matrix shows the two side by side, which is how the clash was noticed - the reason Figma comes before code.

## 2026-09-22 - Button hover, active and soft-hover become real tokens

**Decision.** The Semantic collection gains `<tone>/hover`, `<tone>/active`, `<tone>/soft-hover` and `<tone>/soft-active` for the three Button tones, and the Palette gains `violet/800`, `red/500`, `red/800`, `cyan/800`, `cyan/900`.

**Why.** PLAN.md 8.4 says tones set `--tc-hover`, `--tc-active` and `--tc-soft-hover`, but no such variables existed, and 6.6 forbids a raw colour anywhere in the Figma file. Solid hover and active step one and two shades toward more contrast with the page: darker in light mode, lighter in dark mode, because a near-black neutral button cannot get darker. The soft steps were derived the same way the existing `soft` values were - an oklch mix of the solid into the page - which measured at exactly 12%, so hover is 20% and active 28%.

**Affects.** The Semantic collection is now 45 variables, the Palette 36. `shared/classes.ts` `HOVER` reads these. Success, warning and info do not have them yet; add them when a component needs a toned hover outside Button's three.

## 2026-09-21 - Icon takes the five size names too; only its default differs

**Decision.** `<Icon>` accepts `xs | sm | md | lg | xl` against its own pixel values - `ICON_SIZE = { xs: 16, sm: 20, md: 24, lg: 32, xl: 40 }` - as well as any CSS length. Its default stays `1em`, not `md` (R-5.7-2, PLAN.md 5.7 and 7.3).

**Why.** Omar read the Figma page and could not find the size names on the icon card: an icon documented only in pixels looks like a different API from every other component. Giving it the same five words removes the exception from the part people read. The default cannot move to `md`, because an icon inside a `sm` button would then render at 24px against 14px text and every caller would have to pass a size to undo it; `1em` keeps the common case free.

**Affects.** `shared/contracts/size.ts` gains `ICON_SIZE`, `IconSize` and `resolveIconSize`, so the control scale and the icon scale sit in one file. This supersedes the earlier entry that called `<Icon>` "the documented exception: its `size` is a CSS length" - the exception is now only the default.

## 2026-09-21 - The Arabic font is Noto Sans Arabic, not IBM Plex Sans Arabic

**Decision.** The docs site loads Noto Sans Arabic for `--tc-font-arabic` (PLAN.md O3).

**Why.** IBM Plex Sans Arabic is on Google Fonts but is not in Figma's font list, so the Arabic half of every frame could not be drawn in the font the site ships. The parity rule of 6.6 makes that unacceptable. Noto Sans Arabic is in both, carries Regular, Medium and SemiBold - the exact three weights of the type scale - and is the closest Arabic counterpart to Inter's neutral tone. Cairo, Tajawal and Almarai are also in both and remain available if the brand wants more character.

**Affects.** PLAN.md O3, the type specimen on the Foundations page, and `next/font` in Phase 0's docs skeleton. The library still ships no font.

## 2026-09-21 - The starter icon set is 84 named icons, including three solid variants

**Decision.** The starter set is fixed at the 84 Phosphor icons listed in `docs/icons.md`, sixteen of which flip in RTL. Eighty-one come from the `regular` weight; `star-fill`, `circle-fill` and `heart-fill` come from the `fill` weight.

**Why.** The plan said "the first 40 to 60 icons" without naming them, which left Phase 2 and the Figma page free to diverge. Two audits of the tier-1 catalog and the docs site against the first 62 found twenty-two missing: Rating had no filled star, RadioGroup no selected dot, Pagination no first and last, Table no sort direction, ThemeSwitcher no "system", the state contract's `empty` state no icon at all, TreeView no open folder or leaf, `Field` no required marker, and nothing for a drag handle or an external link. Completing the set before the Figma page is signed off is cheaper than redrawing the page after.

The second audit proposed about ninety more. They were declined and listed at the end of `docs/icons.md` instead, because no tier-1 component needs them to render a documented state and adding one later costs a single SVG and a rebuild. The rule for adding: a component in the current phase needs it, and Figma is updated in the same change.

**Affects.** PLAN.md 7.2 and Phase 2. Two points worth keeping: the `fill` weight is a separate folder in Phosphor, named `<name>-fill.svg`, and is used only where an outline cannot express an on state; and `sign-out`, `paper-plane-tilt` and `sidebar-simple` remain the manual directional entries, because the `arrow-*` / `caret-*` / `chevron-*` patterns do not catch them.

## 2026-09-21 - Everything is designed in Figma before it is built

**Decision.** The whole design system exists in Figma before any component code: every catalog row as a component set with all states, modes and both directions, and every docs route as a page frame. What is in Figma is what gets built (PLAN.md 6.6, Phase 0.5).

**Why.** Omar wants the visual decisions settled before code, and one reference that code is checked against instead of two sources drifting.

**Affects.** Phase 0.5 sits before Phase 1. Every component's Definition of Done includes a parity check against its Figma frame. "1:1" means the same tokens, dimensions and states with a screenshot diff inside the visual-test tolerance; pixel-identical output is not achievable across a browser and Figma.

## 2026-09-21 - Figma free plan cannot carry Phase 0.5 (corrected)

**Decision.** Phase 0.5 needs Figma Professional with a Full seat. The free Starter plan cannot do it.

**Why.** Two limits were found by hitting them, not by reading about them:
1. **Variable modes:** Starter allows one mode per collection, so light, dark and ocean cannot live in one collection. Worked around with three parallel collections (`Semantic Light`, `Semantic Dark`, `Semantic Ocean`) that share identical token names.
2. **Tool calls:** Starter allows 20 MCP calls per month **in total**. An earlier entry recorded that the write tools were exempt; that was wrong. Figma's docs exempt only `create_new_file`, `whoami` and `add_code_connect_map` - not `use_figma`, which is the tool that draws. The cap was reached after 20 write calls, partway through the foundations.

**Affects.** Phase 0.5 is blocked until the plan is upgraded (200 calls a day on Professional). What was completed before the cap is saved in the file: 161 variables (palette, three semantic sets, knobs, sizes), the palette grid, the three mode cards, the size scale, and a screen example showing where each colour is used. Section 6.6 of the plan is corrected to state the requirement rather than the assumption.

**Lesson recorded.** Verify a platform limit by attempting the operation once, early, before planning around the documentation.

## 2026-09-21 - `<Icon name>` stays; the sprite does not

**Decision.** Keep the `<Icon name="arrow-left" />` API. Implement it as inline SVG from one generated module per icon, with `<Icon>` async and server-only and `<Svg icon={x}>` for client and shared files (PLAN.md section 7, R-7-1).

**Why.** The API is what data-driven props, the future inspector and AI tools need. A sprite cannot grow past a few hundred icons, needs a per-consumer sync step, is same-origin only and does not work in Open Graph images. A single hashmap of icons would ship every icon to the browser as soon as one client file imported it. One module per icon keeps the API and loads only what is used.

**Affects.** `packages/icons` ships data and a CLI only; the components live in `packages/react`. `@topclassui/next` stays tier 2. Repeated icons inline their path more than once; this is measured in Phase 3.

## 2026-09-21 - One size scale on every component

**Decision.** `size` is `xs | sm | md | lg | xl | custom` with `md` as the default, defined once as `--spacing-control-*` tokens and `CONTROL_SIZE` classes (R-5.7-2).

**Why.** Omar asked for the full scale everywhere, not only on Button and Input. Defining it once is what makes a Button, an Input and a Select trigger of the same size line up in a form row.

**Affects.** Every schema imports `sizeSchema`. Connector contracts carry `size`. `<Icon>` was the documented exception here; see the later entry of the same date, which gives it the five names and leaves only its `1em` default different.

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
