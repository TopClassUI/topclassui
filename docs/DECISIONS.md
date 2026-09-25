# Decisions

One entry per decision, newest first. A decision is recorded here when it differs from `docs/PLAN.md`, when the plan asks for it explicitly, or when a rule in `docs/RULES.md` had to be bent. Reference the rule id where one exists.

The format is: date, decision, why, and what it affects.

---

## 2026-09-25 - The site copy is written for users, not for us

**Decision.** Every string on the 19 frames was reworded for a developer who has never seen the project: no phase numbers, no catalog rows, no tiers, no file names from the plan, no budget jargon, no competitor. Early access is stated once per page, calmly. A separate review of the seven newest pages found 46 defects - two code samples that would not compile, a wrong provider prop, a file layout that contradicted R-8.1-1 - and all were applied. The hero now reads "The React UI kit that reads both ways", because "rendered on the server" oversold a library where a third of the components run in the browser.

**Affects.** Figma only. The plan keeps its own vocabulary; the site does not use it.

## 2026-09-25 - Next.js and React only; the table gets sorting, sticky columns and a page size

**Decision.** The library supports TypeScript projects on Next.js and React. Plain-JavaScript projects are not a target: the docs no longer describe them, the registry CLI has no type-stripping mode, and the earlier JavaScript decision is closed rather than left open. The published package still works in a JavaScript project because it ships compiled code with declarations, but nothing is promised or tested there.

**Why.** Omar chose it: "since js will be hard, make it nextjs + react only". Every hour spent on stripped-type output, sibling declaration files and a second CI job is an hour not spent on the 40 rows. It can be reopened after 1.0 if a real user asks.

**Table.** Omar asked whether the table supports sortable columns, fixed columns and a choice of rows per page. It now does, by decision: `sortable` on a column definition renders a real sort control in the header and sorts on the server through a `?sort=` link, so it works before hydration; `stickyFirstColumn` keeps the first column in view while a wide table scrolls, using `inset-s-0` so it mirrors; and `pageSize` takes `25 | 50 | 100 | 500` with a page-size selector that is also a link. All three are on the Table card and in the props table.

**Affects.** PLAN.md 18 (Table row), the Install and CLI pages, the JavaScript sections removed from both. The open question on `zod` recorded in the CLI entry is unaffected.

## 2026-09-25 - Publishing: one organisation, a hand-published 0.0.1, then trusted publishing with no token fallback

**Decision.** Create the free npm organisation `topclassui` this week (the organisation name is the scope), publish a real `0.0.1` of `@topclassui/react`, `@topclassui/tokens` and `@topclassui/icons` by hand with `--access public`, then attach a trusted publisher to each with the direct-publish permission and release from `release.yml` on Node 24. Delete the token fallback.

**Why.** Three things in 17.4 would have failed the first release, each verified against npm's current documentation on 2026-09-25: a trusted publisher cannot be attached to a package that does not exist yet, so OIDC cannot perform a first publish; since 2026-09-03 a new trusted publisher allows only staged publishing unless direct publish is enabled, and `changeset publish` publishes directly; and `npm install -g npm@latest` no longer installs on Node 22.14, which the plan's engines floor allows. Provenance additionally requires a public repository, which `TopClassUI/topclassui` is not today - a private repository does not fail the publish, it silently produces releases with no attestation. An organisation rather than a user scope because npm does not rename published packages, so the scope cannot be migrated later. The token fallback goes because classic tokens no longer exist, a granular write token expires within 90 days, and a token does not buy provenance on its own.

**Answered plainly.** npm, pnpm, yarn and bun are four clients of one registry. One npm account and one organisation; nothing to create anywhere else.

**Affects.** PLAN.md 17.4 rewritten. Before the bootstrap publish: three package READMEs, `"license": "MIT"` per package, `repository` with `directory`, keywords, and the repository made public.

## 2026-09-25 - React without Next.js: support tiers, the icon registry, and one new rule

**Decision.** Next.js App Router is tier 1. Vite single-page apps, React Router v7 framework mode and the Next.js Pages Router are tier 2: every component works and they sit in the same CI matrix, and the features that need a server render are documented as unavailable. TanStack Start, Astro islands, Remix v2 and webpack-based React are tier 3: same mechanism, not in CI. A tier is feature coverage, not quality.

**The one hard break, and its answer.** The catalog's RSC-hard surface is one file: `components/icon/index.tsx` is async and imports `server-only`. Everything else renders in a plain React tree. A second entry point, `@topclassui/react/icon-registry`, ships a synchronous `<Icon>` with the identical props plus `registerIcons()`, so `name` keeps working in a browser-only tree - including in every contract that carries an `IconName`. A typo is a type error; a missing registration renders an empty SVG at the resolved size, warns in development, and `npx topclassui icons scan` writes the registration file from source. A map of lazy loaders was rejected because a 20,000-icon map is 600 KB before a single path loads; `<Svg>`-only was rejected because it forks the data contract between the two worlds.

**Also decided.** `@topclassui/vite`, one file with `vite` as its only peer, scopes the `MODULE_LEVEL_DIRECTIVE` warning to our package ids and injects the theme script into `index.html`; `THEME_SCRIPT` is exported as a string beside `ThemeScript` so the two cannot drift. `MenuItem` becomes a discriminated union on `onSelect` or `action`, because the two render different elements and nothing stopped a caller setting both. `<form action={fn}>` takes any function; only a Server Action also works before hydration, and the docs say so. `JsonLd` moves to `@topclassui/react/json-ld`; the `Image` adapter is `render`-based before it is built. The `0 KB` rows are an RSC guarantee and every chip on the docs site is read as the Next.js cost.

**Affects.** New rule R-5.1-5 in RULES.md, enforced by `check-boundaries`. PLAN.md 4, 7.2, 7.3, 11.3, 12, 14, 15.2, 16, 17.3 and 18.8 carry the edits listed in the React-support decision; they land with the phases that build those parts, not in 0.5.

## 2026-09-25 - The registry CLI: init and add, auto-detect first, ask second

**Decision.** `npx topclassui@latest init` detects the package manager (`npm_config_user_agent`, then the `packageManager` field, then the lockfile), the framework (its config file plus the `app` or `pages` directory) and TypeScript (`tsconfig.json`), and asks two questions: the CSS entry and the import alias for shared code. It adds the three `@import` lines and writes `topclassui.json`. `add <slug>` copies the component folder with `../../shared` rewritten to the alias, pulls the components it imports, installs missing peers with the detected manager, never overwrites a file it did not just write, and offers `diff`, `--overwrite`, `--yes`, `--dry-run`, `--schema` and `--js`/`--ts`. It sends no telemetry and touches no file it did not create. The four invocations are `npx`, `pnpm dlx`, `yarn dlx` and `bunx`.

**Open question, recorded rather than decided.** The JavaScript decision argues that `zod` should move from required to optional peer by declaring the design-prop interfaces in `types.ts` and proving them equal to the schema's input type with a type test, which also removes a runtime `zod` import from `<Icon>`'s size helper. It was not adversarially reviewed before the session limit and it reverses M1, so the docs and 5.9 keep `zod` required until Phase 0 settles it. The mechanism is in the decision file and is the recommended default.

## 2026-09-25 - The documentation site is drawn in full: 19 frames, one prototype

**What exists.** On the Docs pages page, left to right in sidebar order: Home, Install the package, Add with the CLI, CSS entry, Provider, Your first component, Colours, Icons, Theming, Right to left, Server first, Accessibility, Components, Components in Arabic, Connectors, Theme builder, Changelog, Blog, Demo preview. Every sidebar row, navbar link, footer link, next block and on-this-page entry navigates; every mode switcher sets the variable mode; 857 wired links. The prototype starts on Home.

**The landing page.** A centred two-line headline at 92px over a violet radial glow, the install command with two calls to action, and a 1200 by 720 product frame - an invoices screen drawn only from catalog components - rising out of the glow. Below it: the three proof panels cloned from the components page, the same form in three explicit variable modes side by side, five labelled numbers, the 46-chip catalog, the two install paths, the phase ledger with 0.5 highlighted, and three things a visitor can do today. Four concepts were drafted; the GitHub-style structure won on first impression and the honest status chip and larger type were grafted from two others. Nothing on it claims to exist that does not.

**Copy.** The reviewer's 37 replacements were applied across every card: no competitor named, no shouting eyebrows, budgets labelled as budgets, the count corrected to 46.

## 2026-09-25 - The docs page: one previewer, and a prototype built from variable modes

**Decision.** The documentation site is one page of 46 component cards, all in the same five-part previewer: stage, playground, code, every state, two install paths. It is drawn in Figma as `Docs site - LTR` (1440 x 48709) and `Docs site - RTL` (1440 x 3533), both on the Docs pages page, with `Docs site` as the prototype's starting point.

**The code block is not optional.** The first draft had a stage, a playground, a state matrix and two install lines, and never showed a line of JSX - while carrying a `Copy` button in the header with no visible source. A reviewer reading it as a working engineer stopped there, and was right to: a copy button that does not say what it copies is worse than no copy button. Every card now carries the JSX that produces its own stage, syntax-highlighted, with the copy button moved onto that block. The header keeps only `Install`.

**The size is on the chip.** `server`, `client` and `split` alone hide the number that decides whether a component is worth using. Each chip now reads `server - 0 KB`, `client - 4.8 KB` or `split - 0 KB server + 1.2 KB client`. These are **budgets, not measurements** - no code exists yet - and the page says so where it matters. Phase 3 generates them from the size-limit JSON so the two cannot drift.

**Three modes, one page, no clones.** The obvious way to prototype a mode switcher is to duplicate the page three times. On a 48000 px page that is three copies to keep in sync, and they would drift by the second edit. Figma's prototype can set a variable mode instead, so all 47 mode switchers - one global, one per card - carry a `SET_VARIABLE_MODE` action on the Semantic and Knobs collections, and the single page recolours. Six new variables (`ui/seg-on-*`, `ui/seg-label-*`) make the active segment follow the mode, so the control is not lying about its own state.

**What the prototype cannot do honestly.** A per-card switcher changes the whole page rather than that card. In the built site it is a scoped `data-theme` on the card and behaves correctly; the limitation is Figma's, not the design's, and the per-card control stays because it is the real specification.

**Direction needed a second frame, and got a small one.** Direction is layout, not colour, so no variable mode can express it. A full mirrored copy of 48000 px would be the drift problem the mode switcher just avoided, and mirroring it by hand across thousands of nodes would introduce errors rather than prove anything. `Docs site - RTL` is instead a complete page - navbar, sidebar on the inline-end, table of contents on the inline-start, footer note - carrying **three** cards (Button, Input, Pagination) chosen because between them they cover text, a Field-wrapped control, directional icons and Arabic-Indic digits. The LTR and RTL switchers navigate between the two frames. What it proves is that the template mirrors; the other 43 add no new decision.

**The sidebar is the site, the table of contents is the page.** They were the same list of seven groups twice on one screen. The sidebar is now the route tree of section 16 - Start here, Foundations, Reference, More - and the right rail stays the seven sections of this page.

**Also added, from the same review.** A proof band above the catalog, because the old fold opened on `Heading` and `Text` and said nothing about why this library exists: three panels, each a rendered demonstration rather than a claim - the server/client split of one invoice card with the size-limit entry that enforces it, the same component tree in both directions in Arabic with the 3 x 4 test matrix, and one `AdaptiveMenu` call rendering as a Dropdown and as a Drawer. And a **Before you start** block, because 46 install lines are useless without the package install, the three `@import` lines, and the provider.

**Affects.** PLAN.md 16 gains the previewer contract, the accessible-name table for a page that repeats one control 46 times, and the part-naming rule. The catalog page is a new route and does not replace the per-component pages the Definition of Done requires; both render the same previewer.

## 2026-09-25 - Ten defects in the first pass of the docs code samples

**Decision.** The 46 JSX samples were written by eight authors who could not see each other's work, then audited against PLAN.md and RULES.md as one set. Ten defects were found in eight snippets and all ten are fixed; the other 38 were clean.

**Three would not have run.** Toast had `'use client'` *after* its imports, where a directive prologue is a dead string - the file would have compiled as a Server Component with a function prop and thrown at render. Dialog rendered `DialogFooter` without importing it. The Command palette imported `useState`, never called it, and had no component wrapper, so `open` and `setOpen` were undefined.

**One was a boundary error.** TreeView is a client component passing `getKey`, and carried no `'use client'` - while its own caption said it needed one.

**The rest were drift between authors**, which is the defect a single reviewer never catches and a cross-cutting audit always does: TreeView passed `<Svg>` elements where Timeline, DropdownMenu and the `MenuItem` contract all pass `IconName` strings; Card was the only part family whose root was not `CardRoot`; Dialog had no `DialogBody`, so rule 10.5-3 had nothing to scroll, while Drawer two cards away did it correctly; Rating reached past `<Text muted>` for a raw `text-muted-fg` span; Breadcrumb and Pagination both dropped the `locale` half of `getLabels`, which a count label of the form `(n, fmt)` cannot work without and which a Server Component has no other way to obtain (R-5.1-4).

**One number was wrong.** The Command palette was chipped at 6.2 KB while being a Combobox-class collection (5.6) inside a Dialog (2.1) - below the sum of its own parts. It is now `client - 9.4 KB, lazy`, which also surfaces that it is one of the three components rule 9.2-7 requires to be lazy-loaded.

**Why this is recorded.** Eight of 46 is a 17% defect rate in code that reads fluently and was written against the specification. Writing many samples in parallel and auditing them as one set is now the method, not an afterthought - a reviewer with all 46 in front of them finds the inconsistencies that no author of six of them can see.

## 2026-09-25 - The dark soft tints were invisible, and the dark control boundary was thin

**Decision.** The soft-tint mix percentage becomes a per-tone, per-mode variable, `--tc-<tone>-mix`. Light and ocean keep 12 / 8 / 12 / 16 / 12 / 12 for primary, neutral, success, warning, danger and info. Dark gets 24 / 12 / 24 / 14 / 22 / 24. Dark `--tc-border-strong` moves from neutral-500 to neutral-400.

**Why.** Building the docs page put every component on a card, which is a surface the original token audit never measured against. Two things fell out of that, both measured from the Tailwind 4.3.3 `theme.css` with CSS Color 4 gamut mapping, not estimated:

- Every dark soft tint measured **1.01 to 1.03** against `--tc-surface`. That is not a faint tint, it is no tint: a soft Badge on a striped panel in dark mode was the panel. The cause is arithmetic - a mid-lightness tone mixed 12% into near-black hardly moves, so the result lands almost exactly on neutral-900. The light percentages were never wrong for light; they were applied to dark without being re-measured there.
- Dark `--tc-border-strong` (neutral-500) on `--tc-surface-raised` (neutral-800) measured **3.19:1**. It passes 3:1, but the plan's own check fails anything within 0.15 of a threshold, so it cleared the bar by 0.04. On the page being built, every input sits on exactly that surface. neutral-400 measures 5.83:1 there.

**How the dark percentages were chosen.** The smallest value per tone that keeps at least a 1.06 step from all three surfaces while holding the tone's text above 4.5:1 on the tint, on its +8 hover and on its +16 active. Stricter targets were tried first and are not reachable: at a 1.12 floor, primary and danger have **no feasible value at all**, because any tint bright enough to show on a raised card has moved into the lightness of the 400-shade text that sits on it. That is a real constraint of a single-hue ramp in dark mode, not a number that needed more searching.

**Affects.** `--tc-soft-hover` and `--tc-soft-active` become `calc(var(--tc-primary-mix) + 8%)` and `+ 16%`, so the plus-8-then-16 rule survives unchanged and now follows the mode. `check-contrast.ts` gains two duties: measure `--tc-border-strong`, `--tc-ring` and icons against **all three** surfaces rather than the page alone, and assert every `-soft` tint keeps a 1.06 step from all three. The Figma Semantic collection's dark mode was updated to match, with `base/line-strong` re-aliased to Palette neutral-400 rather than given a raw value.

**Not changed, and why.** A reviewer also asked for a `--tc-ring-offset-color` token, on the grounds that the focus ring's offset gap would show the wrong colour on a card. That applies to Tailwind's v3 box-shadow ring, where the offset is a painted ring. This plan uses a real CSS `outline` with `outline-offset`, where the gap is not painted at all - it shows the actual backdrop, which is correct on any surface. No token is needed.

## 2026-09-25 - Two ways to install: the registry CLI and the package

**Decision.** Every component is available two ways, and the docs show both on every component page: `npx topclassui add <slug>` copies that component's source into the consumer's repo, and `import { X } from '@topclassui/react/<slug>'` imports it from the published package. The registry moves from "after v0.1" to a v0.1 deliverable.

**Why.** Omar asked for the shadcn model - take only what you need rather than installing a library. Worth being precise about what that buys, because the package already solved half of it: per-component subpath exports plus `sideEffects: false` mean a consumer who imports one component ships one component, so "the whole library" was never shipping. What the registry adds is **ownership** - the source lands in your repo, you can edit it, and you are not waiting on us for a change. Those are different goods and there is no reason to choose between them.

**Affects.** `registry.json` and the `topclassui add` CLI become Phase 7 work rather than post-1.0. The generated source has to compile without the package present, so the CLI rewrites `../../shared/*` imports to a local `lib/` path and pulls the component's `constants.ts`, `schema.ts`, `types.ts` and `variants.ts` alongside it. A component that imports another component pulls that one too, so each registry entry lists its dependencies.

**The risk, stated.** Two distribution paths means two things to keep working. Phase 7 acceptance gains: a fresh Next.js app installs one component through the CLI, `tsc --noEmit` passes without `@topclassui/react` in `package.json`, and the rendered output matches the package version's `/preview` screenshot.

## 2026-09-25 - The docs are dark first

**Decision.** The documentation site defaults to dark, with light and ocean one click away. The component page is designed dark first and light is derived from it.

**Why.** It is what the audience expects from a component library, and it is the harder direction to get right - a design that works dark generally works light, and the reverse often does not. It also exercises the mode system on the page a visitor sees first, so a broken dark token is noticed immediately rather than in a mode nobody opens.

**Affects.** `ThemeScript`'s default flips from `light` to `dark`, following the system only when the visitor has expressed no preference. Note for whoever builds the Figma side: a frame's explicit variable mode applies to its descendants, not to the frame's own fill, so the page background is a bound child rectangle rather than the frame fill.

## 2026-09-22 - Phase 0.5: 46 components drawn, 6 of the 40 tier-1 rows componentised

**Decision.** The Components page carries 46 drawn components as documentation frames showing every state, a three-column Light / Dark / Ocean comparison, and a left-to-right against right-to-left comparison in Arabic. Eight are real Figma component sets, 263 variants in total: Button 90, Input 30, Tag 30, Checkbox 30, Radio 25, Switch 25, Badge 18, Avatar 15.

**The ledger, stated correctly.** Section 18 has **40 tier-1 rows**, not 46. Of the eight component sets, **six are tier-1** (Button, Input, Badge, Checkbox, Radio, Switch) and **two are tier-2** (Tag, Avatar), which were built early because their property grid is clean, not because they were due. So: **6 of 40 tier-1 rows have a component set; 34 remain.** The 46 drawn frames are a count of things drawn, which mixes tiers and includes compositions that are not catalog rows at all.

The first version of this entry said "46 tier-1 components" and "the other 38". Both were wrong: it took the drawn count for the catalog count and it counted two tier-2 sets as tier-1 progress. A ledger that flatters itself is worse than none, because the next session plans against it.

**Why breadth first.** A drawn component settles the visual decisions, which is what the parity gate of 6.6 actually needs, and it surfaces contradictions early - the loading-versus-disabled clash was found this way. The eight componentised are the ones with a clean property grid; the rest are compositions whose variants would be guesses until the code exists.

**Affects.** Phase 0.5 is not complete until each row of section 18 has a component set whose properties match section 5.7 verbatim.

RTL is covered by one comparison section showing six components in both directions in Arabic, not by a mirrored copy of every frame. That is enough to settle the rules - the layout mirrors, `arrow-*` and `caret-*` flip, `magnifying-glass` and `check-circle` do not - and cheaper than doubling the page. A per-component RTL frame is only needed where a component's mirroring is not obvious from those rules.

**Audited 2026-09-22.** Every fill and stroke on all four pages is bound to a variable - zero raw colours, which is what 6.6 asks for and was not true until it was measured. Three things the audit caught: the Icons page tiles used literal amber and grey, the Size chips used a literal violet, and every icon component carried an invisible white fill left behind by `createNodeFromSvg`, which every instance in the file inherited. No page has overlapping sections and no auto-layout frame is collapsed.

Nine docs page frames exist on the Docs pages page: the component page template at 1280 and at 390, and the marketing home, Installation, Colours, Theming, Icons, Server first and Right to left at 1280. The component template is the one that mattered, because it settles the layout every component page inherits - a two-column demo grid with a Preview/Code tab and a copy button on each, page controls for mode, direction and density, the full state matrix rendered at once rather than behind a dropdown, a props table generated from the same names the schema uses, and a "what ships to the browser" block. The mobile frame proves the template degrades: the props table becomes cards and the demo grid becomes one column.

**Still missing from Phase 0.5:** component sets for the remaining 34 tier-1 rows; the connector page template and the `/preview` route; RTL and mobile versions of every page frame but the component template; tiers 2 to 4.

**Open, and needing a decision before more drawing.** PLAN.md 6.6 asks for every docs route at 390 and 1280 in both directions. Section 16 lists about twelve routes, so that is roughly forty-eight frames against the nine that exist, and the RTL half is an Arabic copywriting job rather than a drawing one. Either that scope is accepted and budgeted, or 6.6 is amended to "1280 LTR for every route, plus 390 and RTL for the component template and the home page" - which is what was actually built. Leaving 6.6 as written means Phase 0.5 has an acceptance criterion nobody intends to meet, and a gate that cannot be passed is the same as no gate.

## 2026-09-22 - Three more Size groups: padding-y, toggle and icon

**Decision.** The Size collection gains `padding-y/<size>` (2, 4, 6, 8, 10), `toggle/<size>` (14, 16, 20, 24, 28) and `icon/<size>` (16, 20, 24, 32, 40), taking it to 35 variables.

**Why.** Drawing the components found three scales the plan used but never defined. A Badge and an Alert need vertical padding that is not `padding-x`. A Checkbox, Radio and Switch need a box size that is neither a control height nor an icon size - 40px would be a huge checkbox. And `icon/<size>` is the scale behind the five `<Icon>` names.

**Affects.** `shared/contracts/size.ts` carries all three alongside `CONTROL_SIZE`. Every value is a variable in Figma, so no component drawn on the page contains a raw number.

## 2026-09-22 - A loading Button stays at full colour

**Decision.** The Button base classes gain `aria-busy:opacity-100`, so a loading button keeps its colour instead of dimming (PLAN.md 8.4).

**Why.** Found while drawing the Button states in Figma. `index.tsx` sets `disabled: disabled || loading`, and the base classes carry `disabled:opacity-50`, so every loading button would have rendered at half opacity and read as disabled. Loading and disabled are different states and must look different: loading keeps full colour, shows the spinner and sets `aria-busy`; disabled dims.

**Affects.** PLAN.md 8.4 and every component that follows the same pattern. The Figma states matrix shows the two side by side, which is how the clash was noticed - the reason Figma comes before code.

## 2026-09-22 - Button hover, active and soft-hover become real tokens

**Decision.** The Semantic collection gains `<tone>/hover`, `<tone>/active`, `<tone>/soft-hover` and `<tone>/soft-active` for the three Button tones, and the Palette gains `violet/800`, `red/500`, `red/800`, `cyan/800` and `cyan/900`. The shades the ramp actually aliases - `violet/400`, `violet/500`, `neutral/200`, `neutral/300`, `neutral/700`, `neutral/800` - were already there.

**Why.** The Figma file had no such variables, and 6.6 forbids a raw colour anywhere in it. Solid hover and active step one and two shades **away from the button's own text**, not away from the page: primary and danger go to the 700 and 800 shades in every mode, because their label is white in every mode. `soft-hover` and `soft-active` stay a mix, at the tone's own soft percentage plus 8 then plus 16.

**Two corrections to this entry, both found by reviewing it.**

*First:* the original wording claimed `--tc-hover`, `--tc-active` and `--tc-soft-hover` did not exist. They did - PLAN.md 6.2 defined them as `color-mix(--tc-primary 88%, black)`, `78%, black` and `20%, --tc-bg`. What actually happened is that the shade-step model **replaces** the black mix, because a black mix keeps darkening on a dark page where the button needs to move the other way to stay distinguishable. The plan is now amended to match; `soft-active` is genuinely new.

*Second:* the soft percentages are not uniform. The plan sets `neutral-soft` at 8% and `warning-soft` at 16%, not 12%. The first pass measured primary and danger, found 12% in both, and generalised - so `neutral/soft-hover` and `soft-active` shipped at 20% and 28% instead of 16% and 24%, a visibly heavier hover than the rest of the system. Corrected in Figma.

**Corrected the same day.** The first version reversed the direction in dark mode, using the 500 and 400 shades on the theory that hover should move toward the page. Computing the ratios killed it: white on violet-500 is 4.40:1 and on violet-400 is 2.85:1, against a 4.5 floor, so every dark-mode hover and press would have failed R-5.6-4. Red was worse at 3.82 and 2.89. The lesson is that a solid button's hover is constrained by its label, not by its background - and that a colour rule that sounds right has to be computed before it is committed.

Neutral is the exception that proves it: its solid is already near-black in light mode and near-white in dark, so it moves the other way (800 then 700 in light, 200 then 300 in dark) and still measures 10:1 or better because its label flips with it.

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
