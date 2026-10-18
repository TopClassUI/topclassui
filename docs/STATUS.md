# Where things stand

Read this first in a new session, then `docs/PLAN.md` for the specification and `docs/DECISIONS.md` (newest entries at the top). The newest DECISIONS entry is from 16 October 2026 and records what the deep reviews of Units 4 and 5 changed.

Last updated: 16 October 2026 (Units 1 and 2 on `main`; Unit 3 and its review fixes being merged; Units 4 and 5 built, reviewed and fixed on local branches). The build order is `docs/CLOUD-PLAN.md`: the site's 46, the server set first. The design of each unit is written out in `docs/figma/unit-1.md` to `docs/figma/unit-5.md`, because the session that builds them has no Figma access.

---

## The one-line version

The design system and the documentation site exist in Figma. **20 of the 46 components are on `main`**: Button, then Unit 1 (Badge, Kbd, Separator, Spinner, Skeleton, EmptyState, Alert, Card, Progress, Tooltip), then Unit 2 (Input, Tag, Avatar, AvatarGroup, Breadcrumb, Pagination, Timeline, Table, Banner). `pnpm check` is green on the merged tree: 5201 unit tests in 290 files, 1463 Playwright tests over 924 harness pages (154 demos, three modes, two directions), and 289 mutations in `pnpm test:mutation`. All 46 components of the site are built: the other 26 are Units 3 to 5 (below).

## What is on main

| Unit | Components | Notes |
|---|---|---|
| Button | Button | The template. Server, with `render`. |
| Unit 1 | Badge, Kbd, Separator, Spinner, Skeleton, EmptyState, Alert, Card, Progress, Tooltip | Tooltip is the first client component and the only one on Base UI so far. |
| Unit 2 | Input, Tag, Avatar, AvatarGroup, Breadcrumb, Pagination, Timeline, Table, Banner | All server, 0 KB. Tag, Avatar and Banner are the server half only. |

Unit 2 also added: labels for breadcrumb, avatar, rating, table, timeline and `pagination.pageOf` in English and Arabic; the tokens `--tc-table-sticky-width` and `--tc-input-width`; the utility `text-match-parent`; and one Playwright spec per component beside the four shared ones.

Every component is `status: 'beta'`. None is `stable`: PLAN 20 asks for the visual matrix, the docs page and the Figma parity check, and none of the three exists yet.

**Where Unit 2 differs from its design file** is one entry in `docs/DECISIONS.md`, dated 10 October. The short list: a `link` prop on Breadcrumb, Pagination and Table for Next.js; Input has its own width and keeps Latin values left-to-right; Table cells stay on one line and the table scrolls inside itself; Pagination defaults to `md`; Timeline says its status in words; Rating moved to Unit 3.

## Built, not merged yet (16 October)

**Unit 3**, all built and checked: Dialog, Drawer, Popover, Toast, Dropdown, Command, Tabs, Accordion, Navbar, Sidebar; and the second part: Rating, Tag's remove button, Avatar's image fallback, Banner's dismiss. Its departures are one entry in `docs/DECISIONS.md`, dated 14 October; its deep review found 73 faults, fixed in fourteen `fix/*-review` branches (16 October entry). Unit 3 and those fixes are pull requests #38 to #81, and its notes #82, being merged now. Plan: `docs/figma/unit-3.md`.

**Unit 4**, all ten built on top: the shared pieces 1 to 9, then Switch, Checkbox, RadioGroup, SegmentedControl, Textarea, Slider, NumberField, OTPField, Select and Combobox. Its departures are one entry in `docs/DECISIONS.md`, dated 15 October. Plan: `docs/figma/unit-4.md`.

**Unit 5**, the last unit, built on top: the shared labels, tokens and form errors, then Meter, Stepper, CodeBlock, Field, Form, TreeView, FileUpload and DatePicker. Its departures are one entry in `docs/DECISIONS.md`, dated 15 October. Plan: `docs/figma/unit-5.md`.

**Units 4 and 5 are reviewed and fixed.** The deep reviews found 56 faults in Unit 4 and 40 in Unit 5, three blockers each. Each code fix carries a test that fails without it, in eight `fix/*-review` branches after `feat/combobox` and six after `feat/date-picker`. OTPField's and Slider's fixes were made on Omar's laptop; the other twelve branches were checked a second time there. What they changed, and what is left for Omar, is the 16 October entry.

**Next:** the pull requests of Units 4 and 5 and their review fixes, in stack order, once Unit 3 is merged.

**Small shared fixes, built in Unit 3** (each its own branch): the focus ring at rest under forced colours, digits from the locale tag, the README of a part family, the grapheme label cut with `dir="auto"`, the table skeleton's edge, the Escape guard. Still open:
- The page-scroll check in `e2e/pagination.spec.ts` compares with `documentElement.clientWidth`, which is 15 px lenient under `scrollbar-gutter: stable` (`e2e/table.spec.ts` reads `document.body.clientWidth` since 79f7a6e).
- `--tc-line` is faint in dark.

**Not built on purpose, and waiting for a reason:** Table's sticky header, loading and error states and row class hook; Pagination's page-size selector (it needs Select); AvatarGroup's `total` and a ring that follows the surface of a Card; `useCollection` in Table and Timeline.

**GitHub Actions is off** (the billing budget). The gate is `pnpm check` and `pnpm test:mutation` on Omar's machine, run on `main` after every merge.

## The product, in the words the site uses

TopClass UI is a component library for **Next.js first, React second**. 46 components. Most render on the server and add no JavaScript to the page; all of them work in Arabic without a code change. Light, dark and a custom mode from one small CSS block.

**How it is installed, as of 2 October:**

```
npm i topclassui zod          # the base: tokens CSS, icons, shared helpers, the provider
npx topclassui add button     # one component at a time, copied into your repo
```

The package ships **zero components**. They arrive through the CLI, shadcn-style, into a single `topclassui/` folder in the consumer's project.

Not supported, decided and recorded: plain JavaScript projects, React 18, Next.js 14 and older.

## The four things it competes on

RTL enforced by lint rather than documented per component; server-first so most components cost nothing; lighter, because the dependency list is short by design; and an architecture a contributor cannot break, because `check-structure`, `check-boundaries` and the custom ESLint rules fail the build. Anything that weakens one of those four is not worth adding.

---

## The Figma file

File key `BxRSdAVOhk9Hj3Tkq4tjcy`, **four pages**: Foundations, Icons, Components, and **Docs pages**. An earlier version of this file said five; the "archive row" is a region at y = 64000 inside Docs pages, not a page.

`Docs pages` holds the site: **19 frames at y = 0, left to right in sidebar order**, 1680 px apart. `Page: Colours` was renamed `Page: Colors` on 3 October when the site moved to American spelling.

| x | Frame |
|---|---|
| 0 | Page: Home |
| 1680 | Page: Install the package |
| 3360 | Page: Add with the CLI |
| 5040 | Page: CSS entry |
| 6720 | Page: Provider |
| 8400 | Page: Your first component |
| 10080 | Page: Colors |
| 11760 | Page: Icons |
| 13440 | Page: Theming |
| 15120 | Page: Right to left |
| 16800 | Page: Server first |
| 18480 | Page: Accessibility |
| 20160 | Docs site - LTR (the 46 component cards, ~49 000 px tall) |
| 21840 | Docs site - RTL (the Arabic page, 3 cards) |
| 23520 | Page: Connectors |
| 25200 | Page: Theme builder |
| 26880 | Page: Changelog |
| 28560 | Page: Blog |
| 30240 | Page: Demo preview |

Earlier drafts are parked at y = 64000 under a heading "Earlier drafts". They are superseded; do not edit them. They still carry British spelling and old token names on purpose.

### Conventions inside a frame

- `page bg` is a bound rectangle with STRETCH constraints, because a frame's explicit variable mode does not apply to its own fill.
- Content column is **944 px** on docs pages, **1200 px** on the home page.
- **Reflow after any height change.** Set the `shell` frame height to `main`'s last child bottom plus `main.paddingBottom` (56 on every page), then resize `page bg` to the frame height. Skip this and a gap opens above the footer.
- Layer names that scripts depend on: `Navbar`, `Sidebar`, `main`, `On this page`, `Footer`, `nav` / `nav:current`, `Section: <heading>`, `Previewer: <Component>`, `head`, `stage`, `playground`, `code`, `states`, `block`, `Segmented:global-mode`, `Segmented:global-dir`, `seg:<Mode>`.
- A section frame is named after its heading, which is what the on-this-page scroll links resolve against.

---

## What was done on 2 and 3 October

Every docs page except the components page and the home page was reviewed line by line and fixed. The pattern repeated: copy that contradicted the new decisions, paragraphs too long for the beginner rule, and layout faults.

**Real defects found and fixed, not just copy:**

- `TOUCH_TARGET` set the 44 px minimum on height only, so a narrow control would have passed the constant and failed R-5.6-2. It now sets `min-w-11` as well.
- The RTL breadcrumb in both proof panels read **Home > Select > Components > Docs** and marked the wrong crumb as current. The three Arabic labels were in left-to-right order.
- Table rows were **fixed height** on nine pages, so any description that wrapped to two lines was clipped. 57 rows were affected. All table rows now hug.
- The CLI page's "Add a component" paragraph contained a duplicated sentence, and the `schema.ts` row read "the only file that imports zodops from it, and it is the only file that imports zod".
- The Connectors list showed **6 of 16** connectors.
- The "next" block on the CLI page said Provider and linked to "Your first component". Both wrong.
- `Page: Provider` content overflowed its shell by 25 px.
- The Theme builder said "the four knobs" while Theming says six, and its control table was missing ring width and line width.
- The Changelog said "the three packages release together" and used internal vocabulary ("40 tier-one catalog rows").
- The components page said "All five peer dependencies are required, including zod".
- The Icons page's "Adding icons" section was written for contributors: it showed `pnpm icons:build` and `packages/icons/dist`.

**Added:**

- **Colors**: an "Every class" reference table (12 classes, each with its variable and role), the annotated "Where each color is used" screen cloned from Foundations, and a complete `[data-theme="brand"]` example replacing a two-line stub.
- **Icons**: all **84 icons** in a wrapping grid with dashed tiles and the search row, the 16 directional ones marked amber. Phosphor links to phosphoricons.com.
- **Theme builder**: the builder is now drawn - sliders with real tracks and thumbs, a mode segmented control, a motion switch, a list-rows stepper, six tone chips, a live preview screen, and a Live output block with a Copy button.
- **CLI page**: the "What lands in your project" table became a Next.js-style **file tree** (node 281:1762). Another session is polishing it; do not edit that section.
- **Connectors**: a section "Every connector, both ways" (node 389:1872) with **16 previewer cards**, each reusing the component previewer wrapper with the mode switcher replaced by Desktop / Tablet / Mobile.

**Site-wide:**

- Token rename applied to 18 Figma frames and all four rule files: `bg-bg` to `bg-page`, `text-fg` to `text-body`, `border-border` to `border-line`, `bg-primary` to `bg-primary-solid`, and the `-fg` / `-text` suffixes to `-on-solid` / `-on-soft`.
- 127 nodes renamed from `@topclassui/*` to the single package.
- British to American spelling across 57 nodes.
- `Demo preview` removed from the sidebar on all 16 frames. The page is parked; the `/preview` route in code must still exist, because the visual tests screenshot demos there.

---

## The foundation, as of 5 October (history)

On 5 October `pnpm check` ran all eleven gates green with 1224 unit tests in 57 files and 84 browser tests (the current counts are in the one-line version above): lint, typecheck, `check-structure`, `check-boundaries`, `check-css`, `check-icons`, `check-readme`, `check-contrast`, `rules:sync --check`.

| Done | What it is |
|---|---|
| Scaffold | One package `topclassui`, `private: true`, `0.0.0`. Exact pins. TypeScript **6.0.3**, not 7.x, because typescript-eslint caps at `<6.1.0`. happy-dom, not jsdom, which needs a newer Node than the 22.14 floor. |
| ESLint rules | Seventeen custom rules in `eslint-rules/`, the thing the library actually sells: `logical-properties-only`, `dir-aware-transforms`, `semantic-classes-only`, `no-dynamic-class-names`, `shared-class-constants`, `bare-data-variants`, `no-enum`, `icon-loaders-stay-server`, `one-line-comments`, `no-derived-expectations`, `style-sets-tokens-only`, `presence-state-attributes`, `flat-part-exports`, `root-part-is-named-root`, `text-comes-from-labels`, `no-fetch-in-components`, `tooltip-content-is-text`. Fixture tests prove each one fires and that correct code passes, and a second set proves each leaves real component code alone. |
| Check scripts | `check-structure`, `check-boundaries`, `check-css`, `check-contrast`, `rules-sync`. Shared predicates live in `scripts/lib/` and are tested against **LF and CRLF** both. The scripts were themselves audited and five silent-failure defects fixed; see the 3 October DECISIONS entry. CSS is parsed by one string-aware walker, `scripts/lib/css-parse.ts`, because both regex parsers could be made to pass while measuring nothing. |
| `shared/` | `cn()` on `extendTailwindMerge`, `classes.ts`, the size contract split so `resolveIconSize` never pulls zod into the bundle, `renderElement`, `toSideAlign`, `useCollection` with windowing, labels in English and Arabic with real `Intl.PluralRules`, `TopClassProvider`, the theme script. |
| Icons | The 84 starter icons of `docs/icons.md`, one generated module each from `raw/`. `pnpm icons:build` writes them, `pnpm check:icons` proves they still match, and the build fails if `raw/` and the doc disagree or if the 16 directional icons drift from the doc's table. One renderer, `<Svg icon={data}>`; the server `<Icon name>` is the only async, `server-only` file; `icon-registry` is its synchronous browser twin with `registerIcons()`. A wrong name is a type error. The loader map is kept out of every browser bundle by an ESLint rule and a test, both proven against a planted leak. |
| Button | The first component, finished as the template for the other 45: `index.tsx` (a sync Server Component, no `client.tsx`), five variants x six tones x six sizes, the skeleton, eleven demos and fourteen test files. Reviewed by 83 agents, then every one of the 51 confirmed findings fixed. |
| The tone mechanism | `shared/contracts/tone.ts` is the one source of the six tones; `tokens.css` carries `--tc-<tone>-hover`, `-active`, `-soft-hover` and `-soft-active`; `styles.css` has one `@utility tone-<tone>` that swaps the five variables a component reads, so eleven class strings replace thirty compound variants. Adding a tone is one file plus its tokens, and five tests fail by name if either is missing. |
| Contracts | `shared/meta.ts` (`ComponentMeta`, validated for every component that has one), `#shared/*`, `#icons/*`, `#components/*` and `#test/*` subpath imports, and `pnpm new:component <name>`, which writes eleven files that already pass every gate. |
| Tokens | `src/tokens.css` and `src/styles.css`. Three modes, six knobs, direction-aware safe-area insets. `check-contrast` measures **339 pairs, 205 of them distinct** across the three modes and the three surfaces, taking the worse of the two gamut readings; `src/styles.test.ts` compiles both files through the installed Tailwind and asserts the semantic utilities, the knob maths and the forced-state variants all resolve. |

Deliberate departures from PLAN.md sections 4, 6 and 7 are recorded in `docs/DECISIONS.md` (the `@source "./shared"` line, the RTL-correct safe-area insets, `check-css` in place of stylelint, and `color-scheme` moved into `@layer base`).

**Reviewed hard on 5 October.** 113 agents reviewed everything except the icons; 74 findings confirmed, 34 refuted, and all seven rated high are fixed. The 5 October DECISIONS entry has the detail. The one that matters most: `FOCUS_RING` painted no ring at all, so R-5.6-1 was false for every component. Eight more were fixed on 5 October, including two that crashed and one that behaved differently in production; about 35 low and cosmetic findings remain.

**Open, for Omar to decide:** PLAN 5.3 says `:lang(ar)` sets the Arabic font *and* line-height, but 6.2 omits line-height and names no value. It changes the rhythm of every Arabic page, so the number is a design call, not a default to guess.

**Reviewed again on 5 October**, after Button. 83 agents found 51 confirmed defects and 26 refuted claims; 23 of the entries were fixed with Button itself, and **the remaining 28 are now fixed too**. Two of those 28 were real misbehaviour: a `tone-*` class lost to `data-theme` on the same element because the fallback variables were unlayered, and `loading` rendered no spinner when the `render` element carried its own children. The other 26 were contracts that did not exist and tests that passed while measuring nothing; 18 of them were proved by reintroducing the defect and watching the suite fail.

**Then reviewed again, six dimensions in parallel**, which found 2 high defects in the new gates themselves - a comment on the same line as an `import`, and the subpath `zod/v4`, both walked straight past the new zod guard - plus a ramp check that accepted a pressed state identical to the resting one, a contrast count that overstated itself by 40%, Arabic rendered without `lang`, and a touch-target token with no fallback. All are fixed. A sixth reviewer then threw 85 mutations at the rewritten tests: 62 were caught and **23 got through**, six of them the same circular-expectation mistake applied narrowly the first time - a test whose expected value is derived from the constant it tests cannot fail when that constant shrinks. The worst two: the 3:1 half of R-5.6-4 could be deleted with the gate still reporting success, and the zod guard had no positive control, so its transitive walk was never exercised. All 23 are fixed and replayed. The three 5 October entries in `docs/DECISIONS.md` have the detail.

**Carried forward, each needing something that does not exist yet.** The colours page, the icons page and the no-flash-on-reload check need the docs app. The `topclassui-icons add-set` CLI, the axe assertions and the measured "no icon requests, no icon JavaScript" check need the docs app (`axe-core` and Playwright are installed now). None of these are claimed as done.

## What is not done

- **26 components are not on `main` yet.** Unit 3 (ten, plus Rating and three client halves), Unit 4 (the form controls) and Unit 5 are built and reviewed, waiting to merge.
- **The docs site** is not built, only designed. The harness pages under `.harness/` stand in for it in the browser tests.
- **`pnpm test:visual` and `pnpm size`** do not exist, so no component can be `stable`.
- **The components page** (`Docs site - LTR`, 46 cards) has not been reviewed. It is the largest frame in the file and the most important one left.
- **The home page** has not been reviewed.
- **The Connectors page needs a visual pass.** The 16 cards were built without being able to see them, and Omar's verdict on the result was "so bad". The structure is sound and the audit is clean - no raw colours, no fixed rows, no overflow - but it needs eyes.
- The **Theme builder** describes a tool that does not exist. It is labelled as such.
- The **registry CLI** is designed, not built. Nothing is on npm.

---

## Open questions, with the recommended default

1. **Does the CLI copy `shared/` or import it?** The CLI page says `shared/` is copied into the consumer's repo, which would make components standalone and contradict `npm i topclassui zod` providing the base. Recommended: copied components **import** shared from the installed package, so copies stay small and fixes arrive by upgrade.
2. **The second install column.** Every component card ends with "Copy the source" and "Import from the package". The package no longer ships components, so the second half is false on all 46 cards. On the connector cards it was changed to "Force a layout" (`mode="mobile"`). The 46 need the same decision.
3. **The three-package monorepo.** PLAN.md section 4 still describes `packages/react`, `packages/tokens` and `packages/icons` with Turborepo. One package may not need a monorepo at all.
4. **`@tanstack/react-table` and `dnd-kit`** are the two undecided dependencies. Both tier 3, so this can wait.
5. **Per-route Arabic** for the 18 non-RTL pages is still unscoped.
6. **The "0 KB" claim.** The home page shows a `.size-limit.json` block whose `ignore` list contains `@base-ui/react`, so the number is the marginal cost of our own code, not what the browser downloads. Either drop Base UI from `ignore` and publish the real total, or relabel the chip.
7. **The twelve Unit 1 choices.** `docs/figma/unit-1.md` ends with a table, "Choices for Omar": the Badge default variant, the Ocean radius, the xl text size and nine more. Each already has a default, so none blocks the build.
8. **Three components with no home.** `ErrorState` and `IconButton` are in no unit of `docs/CLOUD-PLAN.md`, and `Meter` is in Unit 5 without a card among the site's 46. `ErrorState` was not built in Unit 2, and Table has no error state yet. Recommended: it comes with Table's loading and error states; the other two wait until something needs them.
9. **The Unit 2 choices.** `docs/figma/unit-2.md` ends with five, and the review added four: Arabic-Indic digits by a locale tag (`-u-nu-arab`) or by a prop; whether Input keeps its own width unless `fullWidth`; a `total` prop on AvatarGroup; and the two new tokens. Each has a default in the code, so none blocks Unit 3.

---

## Before the first publish

1. npm account with 2FA, and **confirm the unscoped name `topclassui` is free** before anything else - npm never renames a published package.
2. Make the GitHub repository public, or there is no provenance.
3. Publish `0.0.1` **by hand** with `npm publish --access public`. A trusted publisher cannot be attached to a package that does not exist.
4. Attach a trusted publisher with `--allow-publish`, release from `release.yml` on **Node 24**.
5. README, `license`, `repository`, keywords - all before the bootstrap publish.

---

## Known environment problems

- **Figma access works on Omar's machine; the cloud session has none.** The connector is authenticated as `omarfathiabed@gmail.com`, Full seat, Pro, admin. Writes succeed. An earlier version of this file said access was broken; that is out of date.
- **`get_metadata` under-reports pages.** Called without a nodeId it listed 2 of the 4 pages. Use `use_figma` with `figma.root.children` for anything structural.
- **Images stop working in a long session.** Once a conversation accumulates several large screenshots, every later image is rejected, including `node.screenshot()` from the Figma tool. **Start a fresh session for visual work.** This is what caused the Connectors page to be built blind.
- **Writing Figma text resets syntax highlighting.** Setting `characters` on a multi-segment code block flattens it to one colour. Use targeted `insertCharacters` plus `deleteCharacters` to preserve it.
- **`findAll` matches text layers by name.** A caption text named `desktop` matches a name check as well as the frame. Filter by frame type too.
