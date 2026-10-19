# Decisions

One entry per decision, newest first. A decision is recorded here when it differs from `docs/PLAN.md`, when the plan asks for it explicitly, or when a rule in `docs/RULES.md` had to be bent. Reference the rule id where one exists.

The format is: date, decision, why, and what it affects.

---

## 2026-10-19 - No default scrollbar anywhere: the page wears the shared bar, and an e2e reads every scroller

**Decision.** Job 123. `html` in `src/tokens.css` sets `scrollbar-width: thin` and `scrollbar-color` from the two scrollbar tokens, so the page's own bar is drawn like every SCROLLBAR, SCROLL_AREA and SCROLL_X container. The Sidebar's in-a-layout demo wears SCROLL_AREA; on the site, STAGE and STATE_SCOPE wear SCROLL_X and On this page wears SCROLL_AREA. `e2e/scrollbar-everywhere.spec.ts` (every harness page and every overlay opened live) and `apps/docs/e2e/scrollbars.spec.ts` (every sitemap page at 1440 and 390, and the open search palette) fail on any rendered element whose overflow is auto or scroll and whose computed `scrollbar-width` is not `thin`. `none` passes: it draws no bar, and the closed Sidebar rail hides its own on purpose.

**Why.** Omar's round-8 review: no default browser scrollbar anywhere; the classic bar beside the search palette was the page's.

**What it affects.** `src/tokens.css`, `src/scrollbar.test.ts` (the page rule, and a raw overflow in a demo), the mutation rows in `scripts/mutations/shared-scrollbar.ts`, the sidebar demo and its test, `apps/docs/components/classes.ts`, `apps/docs/components/shell/on-this-page.tsx`, the two specs.
## 2026-10-19 - The hand on every pressable control: `POINTER`

**Decision.** Round 8, job 120. `shared/classes.ts` gains `POINTER`: `cursor-pointer`, then `cursor-default` under `disabled:`, `aria-disabled:`, `data-disabled:`, `data-readonly:` and `data-loading:`, so a control that cannot be pressed shows the arrow whichever mark it carries. `ICON_BUTTON`, `ROW` and `TOGGLE_TARGET` wear it, which reaches every x and icon button (Dialog, Drawer, Popover, Toast, Sidebar, Tag, Banner, CodeBlock, FileUpload, DatePicker's month buttons), every row of a menu or a list (Dropdown, Command, Select, Combobox, Sidebar) and every Checkbox, Radio and Switch. Button, Tabs, SegmentedControl, Accordion, the Select and DatePicker triggers, NumberField's steppers, DatePicker's days, TreeView's rows and Pagination's cells add it to their own strings; the `cursor-default` the option rows, Dropdown and TreeView set by hand is gone. Rating's stars and FileUpload's input already had the hand.

**Why.** Tailwind 4 dropped the pointer on buttons from its preflight, so every control showed the arrow, which Omar's review read as unfinished. A rule in the base layer would have reached the consumer's own buttons too; a class reaches only ours. `LOADING` keeps no cursor of its own (the 2026-10-06 entry): `data-loading:cursor-default` only stops the hand, and `cursor: progress` still never ships.

**Affects.** R-5.2-4 (the cursor comes from `shared/classes.ts`). Proved by `e2e/cursor.spec.ts`, which reads the computed cursor of every `button, [role=button], [role=tab], [role=option], [role=menuitem], [role=treeitem], [role=gridcell][tabindex]` with a box on every harness page and in the open Select, Combobox, Dropdown, Command and DatePicker: the hand when enabled, never the hand when disabled, read-only or loading. `src/shared/classes.pointer.css.test.ts` and the "shared pointer" rows of `pnpm test:mutation`.
## 2026-10-19 - pnpm size measures every client half with esbuild, and fifteen budgets are raised to what was measured

**Decision.** Job 118. `pnpm size` (`packages/topclassui/scripts/size.ts`, its logic in `scripts/lib/size.ts`) bundles the 33 `dist/components/<slug>/client.js` entries in one esbuild run, ESM, minified, with splitting, `process.env.NODE_ENV` set to production, and gzips each output chunk with `node:zlib` at level 9. A component's number is the sum of the chunks its entry loads at once; the chunks it loads through `import()` are its lazy bytes. Two runs give two numbers: **own** (`react`, `react-dom`, `react/jsx-runtime` and `@base-ui/react/*` external), which is the chip on the site, and **with Base UI** (React external only), which is recorded and never budgeted. Both go into `packages/topclassui/size.json`, committed and shipped in `files` so the site and a consumer read the same numbers; `check-pack` allows it beside the four root files. `pnpm size --check` runs in `pnpm check` right after `check:package` (which builds `dist/`), fails a component over its budget, a lazy one that loads nothing on demand, a component with no budget or a budget with no component, and a `size.json` more than 64 bytes away from a fresh run (a different zlib may move a gzip by a few bytes).

**The class runtime is left out of the budgeted number.** `shared/cn.js` with `tailwind-merge` and `clsx` is one chunk of 9.0 KB gzipped that every client half but Form and Navbar loads, and a page pays it once, as it pays Base UI. Counted in, no simple control could meet 6 KB (Switch is 14.6 KB own). So `size.json` records `runtimeBytes` once and, per component, `budgetedBytes` (own less that chunk), and the budget holds `budgetedBytes`. The chip still prints the full own number. PLAN 14 used size-limit with an `ignore` list; esbuild is what size-limit's preset runs, without the two packages around it.

**Budgets** (`packages/topclassui/size-budget.json`): 6 KB for a simple control, 14 KB for an overlay (Dialog, Drawer, Popover, Dropdown, Select, Combobox, Toast, Tooltip), and `lazy` for Command and DatePicker, which must load a chunk on demand and keep their eager part at 6 KB. Fifteen components measured over their class on the first run; each carries its measured number plus 10 % as its own budget, so the check stays green and an overrun cannot grow unseen: accordion 7.5, banner 7.7, checkbox 6.9, command 7.1, date-picker 11.5, file-upload 13.1, number-field 8.2, otp-field 6.9, radio-group 7.6, segmented-control 8.3, slider 7.3, table 7.3, tabs 7.2, tag 8.3, tree-view 11.4 (KB). DatePicker's lazy chunk is only 1.3 KB: its hook, lib and classes (3.6 KB) are imported at once by the trigger, so most of the calendar is eager. Every overlay is within 14 KB.

**The dependency.** `esbuild` 0.28.2, exact, a devDependency of the library only; its purpose is the bundling above. It was already in the lockfile through `tsx`, so the install adds no package: its own package is 147 KB unpacked and its platform binary (`@esbuild/linux-x64` here) 11.4 MB.

**The site.** `docs:data` reads `size.json` into `clientBytes` on every entry of `components.json` (null for a server component; a client or split folder with no number is an issue). The chip prints `client - 4.8 KB`, `split - 0 KB server + 2.1 KB client` and `, lazy` from it, so "size not measured yet" is gone from the chip, the product frame, the server panel, the Open Graph image and both `server-first.mdx`. Home's server panel shows the Dialog's lines of `size-budget.json` as the check behind the number.

**For Omar, two numbers.** (1) The budgets as written cannot be met while the runtime chunk counts: to budget the full own number he would raise them to about 23 KB for a simple control (FileUpload is 20.9 KB own), 22 KB for an overlay (Combobox, 20.0 KB) and 21.4 KB for the eager part of a lazy one (DatePicker, 19.4 KB), each the largest measured plus 10 %. (2) The runtime chunk is 9,196 bytes gzipped (9.0 KB of 1,024), most of it `tailwind-merge`; slimming or replacing it is a saving of its own, paid back on every page with a client component.

**Affects.** PLAN 14 and 16 (the chip), R-0-2 (`pnpm check` has a new gate), `docs/RULES.md` commands, `docs/figma/docs-site.md` choice 15. Left for Omar: whether the class runtime should count in the budget, the fifteen raised budgets (slimming them, or moving the classes), and DatePicker's eager hook.

---
## 2026-10-19 - Breadcrumb writes JSON-LD only when given siteUrl

**Decision.** Job 122. `Breadcrumb`'s `baseUrl` is replaced by `siteUrl`, an absolute http or https origin with no trailing slash (`https://example.com`), declared in `schema.ts` (with `BREADCRUMB_SITE_URL_PATTERN` in `constants.ts`) and derived into `types.ts` (R-8.3-4). With it, the trail is written as `BreadcrumbList` JSON-LD: every crumb with an `href` is a `ListItem` whose `item` is absolute against the origin of `siteUrl`, and the current page is the last `ListItem`, with its name and no `item`, as Google documents for the last crumb. Without it no script is written. A `siteUrl` that does not parse as an http or https URL writes no script either and never throws; a path or a trailing slash on it is ignored, since only its origin is used. A trail with no link writes no script, because a list holding only the current page points nowhere.

**Why.** Every demo on the site, in the harness and in a consumer's own gallery wrote a `BreadcrumbList` of relative URLs into the page that showed it, which Google reads as that page's own trail, and relative `item` URLs are dropped anyway. Opt-in by the absolute origin fixes both.

**What it affects.** `src/components/breadcrumb/{index.tsx,lib.ts,types.ts,schema.ts,constants.ts,README.md}`, its tests and mutation rows, and the site's two `Breadcrumb`s (`component-page.tsx`, `docs-shell.tsx`), which now pass `siteUrl={SITE_URL}` and so gain the current page as the last `ListItem`. A caller still passing `baseUrl` fails to compile. The 10 October entry's Breadcrumb bullet is superseded on this point.

---

## 2026-10-19 - The command palette's focus appearance is an underline and a bar, not a ring

**Decision.** Omar's review of the Command composite asked for the frame's look: a borderless search row with no ring, and an active row that is a fill with no ring. In the palette the DOM focus never leaves the input (the rows are reached through `aria-activedescendant`), and a text input matches `:focus-visible` on every focus, so the pointer and keyboard split of `ROW_FOCUSED` cannot apply. The palette keeps a keyboard mark in another shape, a lead call recorded for Omar on `cloud/reports-8`: the input is borderless and `outline-none`; while it has the focus, the hairline under the search row is overdrawn by a `--tc-ring` line as thick as a ring (`COMMAND_SEARCH_FOCUS`, a border on `::after`, so forced colours keep it and the row keeps its height). The active row is the soft fill plus a `--tc-ring` bar as thick as a ring at its inline start (`COMMAND_ACTIVE`, a border on `::before`, so it flips in RTL); forced colours keep the Highlight fill and HighlightText label, with the bar in HighlightText. The frame's Enter hint is drawn on the active row only as `::after` content from `labels.command.enter`, with CSS alternative text `"Enter" / ""`, so it is never part of the option's accessible name or its text.

**Why.** R-5.6-1 and WCAG 2.4.7 ask for a visible focus indicator; a 2 px `--tc-ring` line holds 3:1 on the raised surface in every mode (`check:contrast` measures `--tc-ring`), which the soft fill alone does not. This supersedes, for Command only, the ring of `FOCUS_RING_INSET` on the input and of `ROW_HIGHLIGHT` on its rows.

**What it affects.** `command/classes.ts` (`COMMAND_SEARCH_FOCUS`, `COMMAND_INPUT`, `COMMAND_ACTIVE`, `COMMAND_ENTER_HINT`), the `--tc-command-enter` token, `e2e/keyboard-command.spec.ts` (it reads the line and the bar), the forced-colours case of `e2e/command.spec.ts`, and the Command rows of `review-notes/figma-audit/diffs/command.md`.

## 2026-10-19 - The overlays follow their Previewer frames

**Decision.** Job 110 compared Dialog, Drawer, Command, Dropdown, Popover and Tooltip with their `Previewer: <Name>` frames (138:1814, 138:1976, 138:1653, 138:1464, 138:2132, 138:2273) in dark, then light and ocean, in both directions, and changed the build where it differed. The composites are `docs/figma/parity/<slug>.png`, frame left and build right.

- **Two new values in `tokens.css`.** `--tc-shadow-overlay` is the frames' drop shadow, `0 8px 10px` at 45% black in dark and 15% on a light page (light and ocean), and `OVERLAY_SURFACE` and the Drawer's sheet wear it instead of `shadow-lg`. `--tc-row-height` is now `2rem` times the density, 32 px: every menu and list row in the frames is 31 px (14 px text, 7 px of padding above and below), against 40 before. A coarse pointer still gets 44 px from `ROW_TOUCH` and `COMMAND_UNIT`, and the 24 px floor of R-5.6-2 is untouched. `ROW` pads 10 px a side instead of 12 (the frames draw 9). Every component that wears `ROW` or the knob moves with it: Select, Combobox, Sidebar, TreeView, FileUpload and DatePicker as well as the six here.
- **The scrim.** `--tc-overlay` is 30% black on a light page and 40% in dark (was 50% and 70%): the frames dim the page behind a dialog or a sheet so that it stays readable.
- **Dialog.** Header and footer pad 18 by 14 px and the body 18, as drawn; `md` is 380 px wide (`max-w-95`), the drawn panel. The x reaches 5 px into the padding (`-me-1.25`), so its glyph ends on the padding line while its box keeps 24 px. The basic demo's actions are `sm`, as drawn.
- **Drawer.** The header pads 14 px above and below.
- **Command.** 400 px wide, the search row pads 14 px at its start, the input is 40 px tall and 48 under a finger, and an Esc keycap (`labels.command.escape`, aria-hidden, gone under a coarse pointer) ends the search row. The group heading sits 2 px over its rows.
- **Dropdown.** 220 px at least (`calc(var(--spacing)*55)`), and the separator has no margin of its own: the 2 px gap of the popup is all the frame leaves around the line. A row holds the real focus, so it wears job 114's `ROW_FOCUSED` (the same text as on `figma/forms-1`): the frame's hover row is the tint alone, and a key brings the focus ring back. The basic demo's trigger is `sm`.
- **Popover.** The basic demo carries the x beside the title and the two icons the frame draws.

**Not followed, and why.** The Command input and its active row keep a keyboard mark in another shape than the ring (the entry above). Dialog's bars draw their line only while the body scrolls, as the frame's scrolled state does. The Dialog demos' Cancel is the neutral soft Button, as drawn. The neutral look of an outline Button (the frames' Cancel and triggers) is Button's own frame, job 116.

- **The stage and the states strip (a lead call for the docs site).** Each of the six `dummy/playground.tsx` takes an optional `stage`: the overlay is drawn open inside the demo's own box (`data-stage`, `contain: paint`, the portal's container), not modal, taking no focus, over a scrim where the frame draws one (Dialog, Drawer). Command is always modal, so its stage is a picture built from its own class constants and hidden from a reader; Tooltip is held `open`, because the provider's delay group keeps one tooltip open at a time. Each `dummy/states.tsx` is one captioned cell per drawn state (the `title` of each direct child), real components drawn open in their cells (Command's as pictures). Left out, because they need a live focus, pointer or gesture, or look the same as another cell: Dialog and Drawer "focus trapped", Drawer "dragging", Popover "focus-visible" and "dismissed", Tooltip "delayed", Dropdown "hover item". Dropdown's "submenu" and "checked" need a submenu and a checkbox item, which Dropdown does not have: new API, for Omar. A Dropdown menu drawn open takes the focus (Base UI 1.8.0's `MenuPopup` hardcodes its initial focus), so the last open menu of the strip shows its focus ring.
- **TooltipPopup takes `container` and `keepMounted`,** the two props of its portal, as PopoverPopup does, so a stage can draw it inside its own box.

**What it affects.** `src/tokens.css`, `src/shared/classes.ts`, the six `classes.ts`, `command/parts/command-panel.tsx`, the labels (`command.escape` in English and Arabic), the Popover basic demo, the tests that pin those class strings, and their mutation rows.

---

## 2026-10-18 - The site hydrates in islands, and the shell's code waits for the first paint

**Decision.** Job 83 (Lighthouse on the docs site, mobile preset). Every client part of the site goes through `apps/docs/components/lazy-island.tsx`: the server's HTML is rendered as before, and the part's own chunk loads only when it comes within one viewport (`near`) or, for what is on screen from the start, after the first paint and an idle moment (`idle`). A pointer, touch or focus on it loads it at once, and a press or hover that lands before the chunk is given again afterwards. While it waits, the island's box keeps the server's HTML untouched (an empty `dangerouslySetInnerHTML` during hydration, which React leaves alone); once the chunk is in, the part renders afresh in its place in one transition, and focus goes back where it was. Parts are not hydrated late because a Base UI part hydrated inside a deferred boundary could be left with sync updates React never committed (the Dialog, Popover, Tooltip and Switch states stopped answering). The one island that hydrates is the root provider, in an `<Activity>`: React streams a Suspense boundary over 500 bytes out of order once the page passes 12.8 KB, hidden until a script reveals it, which held the first paint; an Activity stays inline. A client navigation mounts an island with no HTML to keep, so it loads at once.

- **The demos.** `docs:data` sorts each demo: one that reaches no `'use client'` file stays a server render with no script (`server-demos.ts`); one that does hydrates through the island, from a two-level map (`client-demos.ts`, one loader per component, then one per demo); the one demo that defines an inline Server Action beside a client part (Dropdown's data-driven) cannot be a client module, so it renders on the server from `action-demos.ts`, which only the Dropdown page imports. That page has a route of its own (`docs/components/dropdown/`) with the same URL and Open Graph image, so the other 97 component pages do not carry its Dropdown code; a second component with such a demo fails the build until it has one (`ACTION_ROUTES`). The `/preview` route keeps the full map and hydrates every demo at once, as the browser tests expect.
- **The shell.** `TopClassProvider` is still mounted at the root layout with `direction` and `locale` from the route (R-13-1); only its chunk (the toast region, the tooltip group and their floating code) loads at the idle moment, and the page hydrates under it then. The search button, the mode switch, the phone menu and the sidebar's rail are idle islands; the palette and its index still load on the first open.
- **The Previewer and the component page.** Try it, the card's mode switch, the examples' tabs and density knobs, and FrameworkTabs and PackageManagers are near islands. The knobs no longer wrap the examples (they wrote two variables on the box around them; they now write them by id), so each example hydrates on its own.
- **The catalog.** Its 46 cards carry no script at load: everything interactive in them is a near island. Each card has `content-visibility: auto` with a remembered size (`docs-card-deferred`, 85rem estimate), as Home's sections already had, so style and layout skip the cards off screen.

**Why.** The route's client chunk group held every client reference in its server graph: each guide page shipped every guide's islands and, through DirectionPair's map, every client demo of the library; each component page and the catalog shipped every demo. Lighthouse counts every script Chrome evaluates before the first paint toward LCP, so the bytes were the LCP.

**What it affects.** No markup, class, colour, type or content changed: the island adds one `<div class="contents" data-island>` around each client part (and an Activity marker comment around the provider's). The parts are interactive a moment later than before (after the first paint, or near the viewport), and a part's ids change when it renders afresh. The numbers before and after are in job 83's row of `cloud-reports/round-4.md`. Not done, and left for Omar: preloading Noto Sans Arabic on `/ar` only (`next/font` preloads per layout file, and the `[locale]` layout serves both locales, so `preload: true` would add its 166 KB to every English page), and the catalog's weight, which is its HTML (choice 18).
## 2026-10-17 - R-5.1-2 is checked, with no exemption

**Decision.** `check-structure` enforces R-5.1-2 (`scripts/lib/index-markup.ts`). A folder is covered when it sits under `src/connectors/`, whatever its meta says, or when its `meta.ts` sets `rendering: 'client'`, read from the TypeScript syntax tree so a comment does not count. Re-exporting `./client.js` does not mark a folder as C, because split components (Banner, Tag, Rating) do it beside their server markup. For a covered folder, every top-level statement of `index.tsx` is an `import type` or a re-export from a file of its own folder (`./x.js` or `./parts/x.js`, never a `..` step). A type re-export may name any such file; a value re-export only `client.tsx`, `variants.ts`, `skeleton.tsx`, `lib.ts` (not `lib.tsx`, which may hold JSX) or a file whose first statement is `'use client'`. Anything else is reported, as `markup` when it holds JSX. All twenty C folders pass, `icon-registry` included.

**icon-registry follows the rule.** Its registry `Map`, `registerIcons()`, `registeredIcons()` and `resolveIcon()` live in a directive-less `lib.ts` with no React import; `<Icon>` is a `'use client'` `client.tsx` that renders `<Svg icon={resolveIcon(name)}>`; `index.tsx` re-exports the two. Registration and render must run in the same module graph, which is the only use the entry point has: a browser-only tree (R-5.1-5, the 2026-09-25 entry), where `client.tsx` reads the same `lib.ts` instance; an RSC app uses the server `<Icon>`. Toast has the same shape: a client viewport and a `lib.ts` store, re-exported side by side. PLAN 18 has no IconRegistry row; its C comes from its meta.

**meta.rendering is tied to PLAN 18.** `src/shared/meta.test.ts` parses the Rendering column of PLAN 18 and fails when a folder's `rendering` differs from its row, so a C component cannot leave R-5.1-2 by calling itself split. The departures are written out in the test: `stepper` is `server` (the Unit 5 entry, "Stepper is a server component") and `avatar-group` is `server` (the entry below); `icon-registry` has no row.

**Affects** `scripts/check-structure.ts`, `scripts/lib/index-markup.ts` and its test, `src/shared/meta.test.ts`, `src/components/icon-registry/{index.tsx,client.tsx,lib.ts}` and `docs/RULES.md`.

## 2026-10-17 - AvatarGroup is a server component

**Decision.** PLAN 18 gives "Avatar, AvatarGroup" one row, Sp. Avatar is split (its image fallback needs the client); AvatarGroup only lays out avatars and counts the rest as "+N", so it has no client half and its meta says `server`. `src/shared/meta.test.ts` records it as a departure.

## 2026-10-17 - R-5.3-2 is linted, with two allowances

**Decision.** `topclass/dir-aware-transforms` rejects, in any class string under `src/` and in any `--tc-*` style value (read as one CSS value): a `translate-x-*` or two-axis `translate-*` whose x is not `calc(<expr>*var(--tc-dir))` with `--tc-dir` a factor of the whole expression and nothing added beside it, the same inside an arbitrary `translateX()`, `translate()`, `translate3d()` or `[translate:]`; a transform origin whose x is not `center`, `50%`, a `*var(--tc-dir)` term or Base UI's `var(--transform-origin)` (so `origin-left`, `origin-[0_0]`, `origin-[25%_50%]` and `origin-(--my-origin)` fail, `origin-[top]` and `origin-[calc(50%-50%*var(--tc-dir))_50%]` pass); a gradient pointed or centred on a physical side, in `bg-` and `mask-` `linear`, `gradient`, `conic` and `radial` utilities with or without a `/` colour space or `!`, an inline-axis angle unless it multiplies by `--tc-dir`, an angle in a variable, `from <angle>` and `at <x>`, and `mask-l-*`/`mask-r-*`; a direction variant (`rtl:`, `ltr:`, their `not-`, `group-`, `peer-`, `in-` and `has-` forms, `[dir=rtl]`, `:dir()`) on anything but an `object-*` or `bg-*` position; and a physical `object-*` or `bg-*` position, keyword or arbitrary (`object-[left_top]`, `bg-position-[25%_0]`, `bg-[position:right_top]`), without its own right-to-left mirror under the same other variants (`md:object-left` needs `md:rtl:object-right`). Two measured values pass: an x of exactly `var(--drawer-swipe-movement-x)` or `var(--toast-swipe-movement-x)`, with an optional zero fallback and in any spelling, the pointer offset Base UI measures in physical px; and `var(--transform-origin)`, which Base UI measures from the anchor. The icon mirror has no allowance: a directional icon (Svg, and both `<Icon>`s through it) carries `scale-x-(--tc-dir)`, and `rtl:-scale-x-100` or `not-ltr:-scale-x-100` fails like any other direction variant outside a position. A zero x and block-axis motion (`translate-y-*`, `translateY()`, `bg-linear-to-b`, 0 and 180 degrees) need no direction. Tests and demos are linted too: a string holding a `;` is CSS, not a class list, and a bare prefix (`rtl:`, `translate-x-`) is no class. `scripts/check-css.ts` applies the same reading to every declaration in `src/**/*.css`, where a physical `object-position` or `background-position` may stand only inside a `[dir]` rule.

**Why.** Each allowance is a physical value Base UI 1.8.0 measures for the current direction, so multiplying it by `--tc-dir` would mirror it twice: Toast sets `--toast-swipe-movement-x` from `clientX - dragStartPosRef.current.x` (`toast/root/ToastRoot.js`), the Drawer from the drag delta signed by its physical dismiss side (`drawer/swipe-area/DrawerSwipeArea.js`), and the positioner writes `--transform-origin` in px and percent after asking `platform.isRTL` (`internals/useAnchorPositioning.js`). The icon mirror was a third allowance when the rule was armed; it is now the knob, since the variant and the knob mirror the same icons, and `e2e/icon.spec.ts` measures it in both directions, in an ltr block inside an rtl page and under forced colours. PLAN section 7 is updated to match. In left to right the icon now computes `scale: 1` rather than `none`, which paints the same.

**What it affects.** No stylesheet under `src/` translates, sets an origin or draws a gradient today, so `check:css` finds nothing. A position, an origin or a gradient whose x sits in a variable is not read, except that an origin variable must be `--transform-origin` and a gradient utility may not take its angle from one. A direction variant in one class string does not mirror a position in another.

## 2026-10-17 - R-8.5-1: Table, Select, FileUpload and Command follow the collection contract

**Decision.** The round 5 review (`cloud-reports/round-6-review.md`, rows 43.1 to 43.13) upheld six fixes, and four exemptions stay.
- **Table is Sp, not S** (PLAN 18 gives S). `index.tsx` stays a server file: it draws the box, the caption and the header, runs `getKey` and every `cell`, and hands the client part `TableRows` plain rows (`{ key, cells }`, the cells already rendered) and plain column data. `TableRows` (`client.tsx`) renders the `<tbody>` through `useTableRows` (`hook.ts`), which calls `useCollection` and scrolls in the box the server drew. Above 200 rows the body windows, with a spacer row across every column above and below, `aria-rowcount` on the table and `aria-rowindex` on every row; `striped` tints by the row's place in the whole table. `hasMore` and `loadMore` (a Server Action on a server page) page it; `virtualize={false}` keeps every row in the HTML. The header row is sticky and the box keeps its height clear with `scroll-padding-top`.
- **The 7-row cap.** The box is capped at the header and `--tc-list-rows` body rows (`visibleRows`, 1 to 20, sets it inline), and scrolls inside itself under the header; a visible caption adds a row. Without a vertical cap the box never scrolls, every scroll position is the end, and `loadMore` would be asked page after page (the defect in the 2026-10-05 entry, item 4). A body row is counted as its padding, one line of `text-sm` and its line: a row that wraps or holds a coarse-pointer button shows fewer rows in the same box.
- **Select** takes `hasMore`, `loadMore` and `loadMoreThreshold` and calls `useCollection` with `virtualize: false`: the knob and paging, never windowing, because Base UI 1.8.0 moves real focus over the mounted items (`select/root/SelectRoot.js:292-306`, `useListNavigation` over `listRef` with no `virtual` flag) and no Select type has `virtualized`. It asks only while open, and above the windowing threshold it warns in development and points to Combobox. It takes no `getKey`: an option's key is its value, and a function prop would stop a server page from rendering it.
- **FileUpload** windows its file list through `useCollection` (refused rows are not capped by `maxFiles`, so ten thousand wrong-type files are ten thousand rows). The removed row's focus moves by `data-index`, scrolling to a row the window has not mounted. The hidden status line reads the first five refused names and `labels.file.refusedMore`, a count. One measured row and the grid's gap are the unit the window counts in.
- **Command** takes `hasMore`, `loadMore` (asked only while open, one page per count of items loaded, since its rows are filtered and grouped), `loadMoreThreshold`, `onQueryChange` for paging on search, and `status: 'loading-more'`, which sets `aria-busy` on the list. Its `visibleRows` now reaches the window as well as the box. The error status and its retry row stay unbuilt: a failed page is asked again on the next scroll.
- **The check sees a list by its knob.** A folder whose `types.ts` declares `visibleRows`, or whose `schema.ts`, `classes.ts` or `client.tsx` reads `--tc-list-rows`, renders items whatever they are called, which is how FileUpload is found. `e2e/collections.spec.ts` derives its load-more loop from the folders whose props take `loadMore`, and names Select as the one list it does not window (`UNWINDOWED`, with the Base UI line).
- **Kept.** Dropdown: Base UI's Menu moves real focus over `store.context.itemDomElements` (`menu/root/MenuRoot.js:368-382`) and `MenuRoot.d.ts` has no `virtualized`, a deviation from PLAN 8.5 (1399), which asks Dropdown to window above the threshold. Timeline: PLAN 18 (1986) defers it, "Collection (8.5) when it grows"; whether that means "when the list grows" is Omar's call. Breadcrumb and Stepper are not collections in PLAN 8.5 (1371) or 18 (2061, 2062), and every crumb must be HTML (1800, 1809).

**Why.** Omar's standing: no exemption stands where the code can follow the rule. Table and Select could; Dropdown cannot (Base UI); Timeline, Breadcrumb and Stepper are outside the rule's text.

**Affects.** `src/components/table` (new `client.tsx` and `hook.ts`, `meta.ts` rendering `split`, two demos), `src/components/select`, `src/components/file-upload`, `src/components/command`, the label `file.refusedMore` in English and Arabic, `scripts/lib/collections.ts`, `scripts/check-structure.ts`, `e2e/collections.spec.ts`, the mutation rows of the four folders and of the check, and R-8.5-1 in `docs/RULES.md`.

## 2026-10-17 - R-8.5-1 is checked, and six lists are exempt by name

**Decision.** `check-structure` requires `useCollection` in the `hook.ts` of every component folder whose `types.ts` takes an `items` prop, `CollectionProps` (whole or picked) or `MenuContract` (`scripts/lib/collections.ts`). Combobox, Command and TreeView pass. Six folders rendered items without it and were named in `COLLECTION_EXEMPT`; four stay, by the entry above: Dropdown (Base UI), Timeline (PLAN 18, 1986), and Breadcrumb and Stepper, which are not collections in PLAN 8.5 (1371) or 18 (2061, 2062), every crumb being HTML (1800, 1809). Select and Table call `useCollection` since the entry above. An exemption never covers props that take `CollectionProps`, and one that no longer holds (the folder calls `useCollection`, or renders no items) fails the check, so the table cannot grow stale. `e2e/collections.spec.ts` drives every folder whose hook calls `useCollection`: its `ten-thousand` demo keeps fewer than a hundred rows mounted at the top, the middle and the end, and when its props take `loadMore`, its `load-more` demo asks once at the end.

**Why.** The rule was "not yet" while three lists already windowed and six did not, each for a recorded reason; a check that names the six keeps the next list honest without forcing windowing on a breadcrumb. FileUpload's list renders the files it holds, not an `items` prop, and was unwindowed by the 2026-10-15 entry (Unit 5); the entry above windows it, and the check now sees it by its knob. Tabs, Sidebar, Navbar, Accordion, RadioGroup and SegmentedControl are composed from parts, not data, and Pagination draws a bounded run of page cells.

**Affects.** `scripts/check-structure.ts`, `scripts/lib/collections.ts` and its test, four rows in `scripts/mutations/scripts.ts`, `e2e/collections.spec.ts`, and R-8.5-1 in `docs/RULES.md`.

## 2026-10-17 - R-8.5-2 is linted, and the Banner keeps its dismissal in localStorage

**Decision.** `topclass/no-fetch-in-components` refuses `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `new Request()`, `localStorage`, `sessionStorage`, `indexedDB`, `caches`, `navigator.sendBeacon`, `document.cookie`, React's `cache()` (named or through a namespace import), `unstable_cache`, and any import from `next/cache`, `axios`, `swr`, `@tanstack/react-query`, `@apollo/client` or `ky`, under `src/`, whether read bare, off `window`, `globalThis` or `self` (nested or computed), or destructured off one; tests are exempt, demos are not, since they ship. Pagination is not linted: a slice for an overflow cap or a calendar's weeks reads the same as a page. One exemption: `src/components/banner/hook.ts` (`lib.ts` until round 6 moved the store) may use `localStorage` and nothing else on the list, through the rule's `allow` option in `eslint.config.ts`.

**Why.** A dismissed Banner is remembered per `id` across pages (PLAN.md:1989 "Dismissible, remembers dismissal"; unit-3.md:1248 and :1255-1257, `useBannerDismiss(id)` under `tc-banner-dismissed:<id>`): that is the component's own UI state, not application data, and the README documents the key. The theme script in `src/shared/theme/script.ts` also reads `localStorage`, but as the text of an inline script the app injects before paint, so the rule, which reads code rather than strings, does not see it and needs no exemption.

**What it affects.** A new storage, cache or network call in a component fails lint; widening the Banner's exemption needs an entry here.

## 2026-10-17 - R-10.5-2 is a type and a lint rule

**Decision.** A tooltip's text-only rule has three halves. The type, in `tooltip/types.ts`, makes `TooltipPopup`'s `children` `TooltipText | readonly TooltipText[]` and takes no `render` and no `dangerouslySetInnerHTML`, so tsc rejects an element, an array holding one, a boolean and markup (`tooltip.types.test.ts`). The lint rule `tooltip-content-is-text` reports, at any depth, a JSX element or fragment or a cast (`as`, `satisfies`, an angle-bracket assertion; `as const` is not one) in the children, the `children` or `render` prop or a spread, and any `dangerouslySetInnerHTML`, on `TooltipPopup` under any import name and on Base UI's own `Tooltip.Popup` and `Tooltip.Viewport`, keyed on an import from `@base-ui/react/tooltip` or `@base-ui/react`, named or namespace; only Base UI's `Tooltip.Arrow`, decoration with no children, may sit inside. It is on for `src/` (so the demos too), `e2e/**/*.tsx` and `scripts/**/*.tsx` (the harness and its fixtures). "One or two lines" is proven for every demo by `e2e/tooltip.spec.ts`, which measures each open popup at no more than two of its line heights plus its padding, with nothing scrolling. For a caller's text, `max-w-xs` and wrapping are the guard rail, not a validator, as with the text caps of 2026-10-07: no character cap, since characters are no proxy for lines (107 of `W` take five lines, of `i` two) and the lint sees only literals, and no `line-clamp-2`, which would cut data (R-5.2-7).

**Why.** The type alone is beaten by a cast, a spread or a `@ts-expect-error`, and it says nothing about Popover or about Base UI's popup used directly; the lint message names the way out. A consumer `className` merged last can bring back scrolling (`max-h-40 overflow-auto`) or lift the width; that is the consumer's choice, as the page scrollbar is, because PLAN promises that a consumer's `className` wins (Build and consumption) and R-5.7-3 lets a consumer extend any component. Every existing tooltip in `src/`, the demos and `e2e/fixtures` was plain text, so nothing needed fixing and nothing is exempt.

## 2026-10-17 - R-10.5-1 and R-10.5-3 are checked, and where the overlays differ from the letter

**Decision.** `e2e/overlay-scroll.spec.ts` proves both rules across every overlay and bar in a real browser, and `check-structure` requires the Body of a scrolling overlay and the variable of a sticky bar. `POPUP_BOUNDS` is the class of PLAN 10.1 in `src/shared/classes.ts`, `POPUP_MAX_H` joined to `POPUP_MAX_W`: `max-h-(--available-height) max-w-[round(down,var(--available-width),1px)]`, the room Base UI measured. Popover, Select, Combobox and DatePicker wear it, and none writes its own. The width rounds down for every popup, not for Select alone: floating-ui places the popup at `roundByDPR(x)` (`@floating-ui/react-dom/dist/floating-ui.react-dom.mjs:70-73, :213-214`) while Base UI writes the room unrounded (`@base-ui/react/internals/useAnchorPositioning.mjs:221`), so an unrounded cap ended 0.2 px past the collision padding. It leaves out two classes PLAN 10.1 lists: `overflow-y-auto`, which would make the popup a second scroller around the lists of Select, Combobox and DatePicker (PLAN 10.5 rule 1) and lacks `overscroll-contain` (rule 5), so a popup that scrolls as one adds `SCROLL_AREA` itself; and `origin-(--transform-origin)`, which `POPUP_MOTION` already carries. The object in `src/shared/floating.ts` is PLAN 10.1's `FLOATING`: it gives every anchored popup (those five and Tooltip) its side offset and its 8 px collision padding, and the spec measures both on the first five. The side offset is 6 px, not PLAN 10.1's 8, because Figma draws 6 (`docs/figma/unit-3.md:571, :578`; `unit-1.md:832-834`, where a tooltip's 6 and its 5 px arrow make 11). Where an overlay meets the rule by other means:

- **Dropdown** is a popup that is its own list: `LIST_CAP` takes the place of `POPUP_MAX_H`, the smaller of `--available-height` and the row cap (PLAN 10.5 rule 1), and `DROPDOWN_WIDTH` holds it to 12 to 20rem and never past the room as `POPUP_MAX_W` rounds it. The rounded room is written out inside each `min()`: tailwind-merge keeps one `max-w-*`, and Tailwind compiles only a class it finds whole in the source, never one built from a shared fragment (tailwindcss.com/docs/detecting-classes-in-source-files, "Dynamic class names").
- **Command** is a centred dialog with no anchor, so Base UI measures no room and `POPUP_BOUNDS` does not apply: its popup is bounded by the screen (`85dvh` less the inset) and its list by `LIST_CAP`, whose `--available-height` falls back to `100dvh`.
- **Toast** is a bar of PLAN 10.5 rule 8: while a stack shows at a bottom placement, `useToastViewport` writes the viewport's height to `--tc-sticky-bottom`, in whole px, and removes it when the stack empties or the viewport unmounts, so Tab never leaves a control under a toast. Like Navbar's, a stack taller than a third of the screen claims nothing. A top placement writes nothing: there `--tc-sticky-top` is the Navbar's, and the two would overwrite each other. That clash is open for Omar. Its viewport is a scroll container, and sets `overscroll-behavior: contain` like every other.
- **On a short screen the popup scrolls as one**, departing from PLAN 10.5 rules 3 and 4, where the header and the footer stay. At WCAG 1.4.10's 320 x 256 the fixed bars leave the Body four lines or fewer, and a wheel that starts on so short a Body ends inside it. So under 15rem of viewport less its inset (Dialog, a container query, since the bars grow with the root) or under 17rem of screen (Drawer, a media query: a side sheet has no container of its height) the Body stops scrolling and the popup scrolls instead. Telling bars taller than the room apart in CSS is not possible, and a ResizeObserver for it is not worth its code, so the threshold stays. DatePicker does the same under 20rem of screen, where the room beside its trigger leaves the grid a row or less: above it, the month and its buttons stay while the grid scrolls in a wrapper of its own, since a table cannot be a scroll container.

**Why.** The rules were marked `not yet` while no overlay existed; nine now do. Five of the spec's tests break an overlay or a bar on purpose (a Body that no longer scrolls, a container that chains, a popup freed of its max-height, a page that drops the variables from `scroll-padding-block`, and the same page under a toast, where Tab then leaves the last link under the stack) to prove each measure can fail. The focus test of PLAN 10.5 rule 11 scrolls the last link of a page under a Toast stack and Tabs to it: it lands clear of the stack only because the padding takes that strip. The dialogs' and drawers' header and footer are flex items that never shrink, not `position: sticky`: the spec proves the effect, that both keep their boxes while the Body scrolls to its end and the page behind does not move.

**What it affects.** The status lines of R-9.2-4, R-10.5-1 and R-10.5-3. A future AlertDialog is already a scrolling overlay to `check-structure`. The page test of PLAN 10.5 rule 11 near all four edges stays in each component's own spec; this one opens the anchored popups at the top and the bottom edge. `FLOATING` no longer carries `maxHeightVar` and `maxWidthVar`, which nothing read.

## 2026-10-17 - The provider warns when the layout leaves out direction or locale, or is missing

**Decision.** `useProviderLocale` in `src/shared/provider/use-provider-locale.ts` gives `TopClassProvider` the direction and locale it runs on: the layout's when `direction` is `ltr` or `rtl` and `locale` is a non-empty string, `FALLBACK_CONTEXT`'s (`ltr`, `en`) otherwise. In development it warns once per page per missing prop, naming only the fallback used for each, from an effect, so a server render never warns and a production build never does. The outermost provider also warns once when `<html dir>` is set and differs from its `direction` (PLAN 13); that comparison is the one read of the page's dir in `src`, and `src/shared/no-document-dir.test` fails on any other. An app that mounts no provider at all warns too, as PLAN 13 asks: `useProviderPresence()` in `context.ts` runs from `useTopClass`, from `usePortalLocale` and from the hook.ts of the six Base UI-backed components that read neither (Accordion, Checkbox, RadioGroup, SegmentedControl, Switch, Tabs); the component still works on the fallback. Every warning shares one once-per-page memory, `warnOnce` in `context.ts`. Vitest isolates modules per file, so `test/setup-dom.ts` renders one provider-less probe before each dom file to spend that once, and no test's silence depends on its order; the warning tests reset the modules to get it back.

**Why.** Before, a missing locale reached the context as `undefined` and a missing direction reached Base UI in silence, so a route that lost its param rendered left to right with no sign of why; an app with no provider did the same. The logic lives in hook files because R-5.12-1 keeps effects out of the files that render.

**Affects.** R-13-1, R-5.12-1.

## 2026-10-17 - A popup part lands on the popup, inside the presentation boxes Base UI wraps it in

**Decision.** A part that renders into a portal takes className, style, ref and the rest on the element that carries its role, not on the outermost box of the portal. `src/test/root-props.ts` holds each such case to the selector it records, to a Base UI portal, and to `role="presentation"` on every box between the two.

- `DialogPopup`, `DrawerPopup` and `Command` land on `[role="dialog"]` inside Base UI's Viewport, which is `role="presentation"` (`@base-ui/react` dialog/viewport/DialogViewport.js:50; the role is the Popup's, dialog/popup/DialogPopup.js:75). `PopoverPopup` (`[role="dialog"]`, popover/popup/PopoverPopup.js:91), `DropdownPopup` and `DropdownMenu` (`[role="menu"]`, menu/root/MenuRoot.js:426) and `TooltipPopup` land on the popup inside the Positioner, which is `role="presentation"` (utils/usePositioner.js:33). `ToastViewport` is the `[role="region"]` the portal holds directly (toast/viewport/ToastViewport.js:186). The Viewport and the Positioner place the popup and own no role a caller could want to name, style or measure (`R-5.7-3`).
- The parts inside a popup are no departure: their place is compared with a slot the same Root and Popup hold, from the page body down.

**Why.** Round 5 found that `portal: true` skipped the place of the root, so any portaled part could spread onto any inner element, and that the Popups' landing was nowhere recorded.

## 2026-10-17 - Every export is proven to pass className, style, ref and data-* on, and where they land instead

**Decision.** `R-5.7-3` is proven by `src/test/root-props.dom.test.tsx`: it walks every component folder, renders each component that `index.tsx` and `skeleton.tsx` export with the required props from that folder's `test/fixture.ts`, and checks that one `className`, one `style` (a `--tc-*` variable, as `R-5.2-5` allows), one `ref` and one unknown `data-*` attribute land on one element, and that the element sits where a slot the same parents hold sits, so it is the outermost one the component renders. The parents in a case's `wrap` must render no element with the classes of that root. A fixture entry may be a list of cases, one per branch a prop opens. `check-structure` requires the fixture. A skeleton with no case in its fixture is rendered with no props, so one merged from another branch is covered at once. A case may only depart from the root by naming the props that land elsewhere, each as a selector written against `:scope`, the outermost element, which must find that element first, and the heading of the entry here that records it; one bullet of that entry must name the export as a whole word and `R-5.7-3`. The test reads this file. A headless root must render no element at all.

**Departures this records**, each the narrowest the test allows:

- `DialogRoot`, `DrawerRoot`, `PopoverRoot`, `TooltipRoot` and `DropdownRoot` are Base UI Roots that render no element, so there is nothing to spread onto (`R-5.7-3`). Base UI says so ("Doesn't render its own HTML element.", dialog/root/DialogRoot.d.ts:8, drawer/root/DrawerRoot.d.ts:9, popover/root/PopoverRoot.d.ts:8, tooltip/root/TooltipRoot.d.ts:8, menu/root/MenuRoot.d.ts:12), and no prop makes one render. The test proves they render no element of their own.
- `DatePicker` is held in a span with its hidden input and its required note; className, style, ref and the rest reach the trigger button, the span's first child (`R-5.7-3`). A box with no width of its own needs a holder to be as wide as an Input in a `w-fit` parent (`src/shared/classes.ts`, `FIELD_HOLDER`), and the holder is a grid track, which sizes the content box: on the button its padding and border would add to that width. `e2e/date-picker.spec.ts` pins the Input's width.
- `TreeView` is held in a div with its live status note; className, style, ref and the rest reach the `role="tree"` element, the div's first child, which is the scroll container and the tab stop (`R-5.7-3`). The note cannot sit inside the tree, which owns only `group` and `treeitem` (WAI-ARIA 1.2), and as a sibling of the tree in a fragment it would be a second item of the caller's flex or grid.

**What it fixed.** `ToastViewport` took a className alone, and `DropdownMenu` the menu contract, placement and className alone; both now take the rest and the ref. The viewport keeps its own `dir`, `lang`, name and toasts; `DropdownMenu` spreads onto its popup, where its className already went, and takes no `children`, `container`, `keepMounted` or `render`. Round 6 moved the list item of `NavbarLink` and `SidebarLink` into the list (the entry below).

**Why.** "No check proves all 46 have one" was the gap. A recorded departure is still measured, so a part that moves its props again fails.

## 2026-10-17 - The parts-folder naming contract, with no exceptions

**Decision.** `check-structure` reads each fixed file's exports from the syntax tree (`scripts/lib/part-names.ts`): a file in `parts/` exports exactly one function component named after the file (`card-body.tsx` exports `CardBody`, and nothing else, not even a type); `hook.ts` exports only `use*` hooks; `lib.ts` and `lib.tsx` export only functions; and the scrolling overlays, Dialog and Drawer, export `<Name>Root`, `<Name>Header`, `<Name>Body` and `<Name>Footer` from `index.tsx`, with the three parts in `parts/<slug>-header.tsx`, `-body.tsx` and `-footer.tsx` whenever the folder has a `parts/`. The check names only the parts; that the Body is the scroll container is `check/overlay-scroll`'s. A file in `parts/` that is a test is an error: tests live in `test/` (R-8.1-1). There is no exemption list. A context a root provides is module-private in `hook.ts`, and the root's hook returns it (`useTabsRoot` returns `{ look, Context }`, and `TabsRoot` renders `<root.Context value={root.look}>`), so `hook.ts` exports hooks alone (Dialog, Drawer, Dropdown, Popover, RadioGroup, SegmentedControl, Sidebar, Tabs). The `toast` call object (`toast.add`, `toast.update`, `toast.close`, `toast.promise`, the name and shape PLAN 10.3 fixes) lives in `src/shared/toast/toast.ts` beside the manager it drives, and `toast/index.tsx` re-exports it; the registry of mounted viewports, module state rather than a pure helper, lives in `src/shared/toast/viewports.ts`. Neither imports a component at runtime, so the provider's `ToastViewport` stays the one shared-to-components import. `toast/lib.ts` keeps `iconTypeOf` and `toSwipeDirections`.

**Why.** R-9.2-4's parts half and R-5.12-4's naming rest were manual. Running the check over `src/` found three violations, each fixed: Combobox's `optionAccessors` object became `getOptionValue` and `getOptionLabel` (verb-first, PLAN 5.12), and Meter's `MeterRange` and Number Field's `NumberFieldLimits` moved from `lib.ts` to `types.ts` (R-8.3-4). Every existing part file already exported one component named after it.

**Affects.** R-9.2-4 and R-5.12-4 in `docs/RULES.md`, which now name `check-structure`. Verb-first function names and PascalCase component names outside `parts/` stay manual.

## 2026-10-17 - What counts as derived at the seam (R-5.7-5)

**Decision.** In any file under `src/` a Base UI `.Props` may be omitted from with `'className'` among the keys, read by index (`Props['modal']`), taken with `keyof`, or pinned to its generics in a private alias (or an alias of one) that is then used in one of those ways. Used whole, in an intersection, in an `extends`, in an exported alias or in a `Pick`, it is refused. A Popup part takes the Portal's own props as `Omit<Base.Portal.Props, 'className' | keyof Base.Popup.Props>`; a hook input picks from our own derived type, never from Base UI's. A headless root with no `className` (Select, Combobox, Menu) still names it in its `Omit`, so a later Base UI release cannot add one unmerged. Tests and demos are outside the rule: a type test compares ours against Base UI's raw props on purpose.

**Why.** An indexed prop type is a derivation; a `Pick` is a hand-copied list that hides every prop it does not name (PLAN.md 5.7), as DatePicker's open state hid `onOpenChangeComplete`. A hand-copied list of own props cannot be told from a list of our own props by syntax, so it stays review.

**Affects.** R-5.7-5, `eslint-rules/index.ts` (`props-derived-at-the-seam`), `eslint.config.ts` (the test and demo override).

## 2026-10-17 - R-5.2-2: which caller class wins when a part takes a render element

**Decision.** `renderElement(element, base)` (`src/shared/render.ts`) and `renderPart(render, base)` (`src/shared/render-trigger.ts`) put the `render` element's own class after the component's finished class `cn(OWN, className)`, as Base UI does (`useRenderElement.js:133`), with no lint narrowing; `renderTrigger` puts a trigger's or a close's `className` after its `render` element's class, since that part has no class of its own.

## 2026-10-17 - R-5.3-4 is linted everywhere in src but the rejection tests

**Decision.** `topclass/no-physical-placement` flags `left` or `right` in a `side`, `align` or `placement` value, as a JSX attribute or an object property (a computed key written as a string literal included), through every branch of a conditional, a `??` fallback, an `as` cast and a same-file `const` it names. It is on for every file under `src/`, demos, dom tests and `src/test/` helpers included, and off only for `src/**/*.schema.test.ts` and `src/shared/contracts/toast.test.ts`, in a block of its own in `eslint.config.ts`. A swipe direction is not covered: Base UI's swipe is physical, and Drawer and Toast compute theirs from the direction (PLAN 10.2).

**Why.** Forcing the rule on over every test, test helper and demo finds ten hits, every one a rejection input: the combobox, date picker, drawer (two), dropdown, popover, select and tooltip schema tests, and the toast contract test (two), each passing `left`, `right` or `bottom-right` to prove the schema or the resolver refuses it. A rejection test cannot avoid the value. A shared fixture of physical placements would only pass by hiding the string behind an identifier, which the rule now follows, and the repo has no lint disables, so the exemption is a config block naming those files. No component, demo or dom test names a physical side. `eslint-rules/config.test.ts` fails if any other block turns the rule off or the block's files change.

**Affects.** R-5.3-4, `eslint.config.ts`, `eslint-rules/index.ts`, `eslint-rules/config.test.ts`.

## 2026-10-17 - R-5.1-3 is a type test, and what it sets aside (revised the same night)

**Decision.** `src/test/serializable.ts` turns R-5.1-3 into a type: `UnserializableKeys<Props>` names every prop whose type admits a function or a class instance (an object with methods, such as `Date` or `Intl.NumberFormat`), recursing through objects and arrays and letting `ReactNode` and the Server Action signature `(formData: FormData) => void | Promise<void>` through. `any` and `unknown` fail closed, since either could hold a function. Each of the 31 components whose `index.tsx` renders a component or re-exports a server part or skeleton has `test/<slug>.serializable.test.ts`, which pins the set of each of those exports exactly, so a new function prop fails `pnpm typecheck` until it is added there and here; `src/test/serializable.test.ts` fails when one of those folders has no such file. Set aside everywhere: `ref`, a native `on*` handler while it keeps React's own event type (an `onChange(value)` of our own still counts), and `inlist` and `download` while they keep the `any` that `@types/react` gives them (index.d.ts:2917, 3012, 3113, 3128), because a shared component spreads them onto its root exactly as a `<span>` would. `TopClassProvider` takes `ProviderLabels`, the string labels only: R-13-1 mounts it from the server root layout, and a count label is a function, set on the component instead (`src/shared/provider/provider.serializable.test.ts`). `src/test/client-callbacks.test.ts` reads every `client.js` re-export with the compiler and fails on a callback we declare whose JSDoc says neither client-only nor Server Action (PLAN 9.2 rule 4). Pinned per component:
- `labels` (Avatar Group, Breadcrumb, Code Block, Empty State, Spinner, Stepper, Pagination, Rating, Table, Timeline): R-5.11-2 makes a count label a function; it is called during the server render and only its string reaches the element or the client part.
- `getHref` (Pagination), `getKey` (Table, Timeline), `columns` for each column's `cell` (Table) and the render-function `children` of Field: called during the server render; none of these components hands them to a client part.
- No callback. Round 6 moved the three this entry first pinned, `onDismiss` (Banner), `onRemove` (Tag) and `onValueChange` (an editable Rating), each to a client export, so the server export takes only serializable props and the tests pin `never`, `never` and `labels`:
  - **Banner** keeps `dismissible` and `id`: its x, the internal client part `BannerShell`, owns the dismissal and the hidden state, so a server page still renders a dismissible banner with no wrapper. `BannerDismissible` in `client.tsx` is the same region, always dismissible, and takes `onDismiss`.
  - **Tag** is the plain chip only. `TagRemovable` in `client.tsx` is the chip with its label span and the x, takes `onRemove` (required) and gets both ids from `useTagRemovable()`; `index.tsx` imports nothing from React and only re-exports it. The x needs the caller's list, so it cannot own the removal alone: this is the client root PLAN 5.1 allows, not a part.
  - **Rating** keeps `readOnly={false}` with `defaultValue`, `value`, `name` and `disabled`, which a server page writes. `RatingInput` in `client.tsx` is the same radio group, takes `onValueChange`, and names its steps with the same `toField()` from `lib.tsx` as the server half, so both default to English and `locale="en"`.
  Each client export is re-exported by `index.tsx`, takes the root props and `ref`, and accepts a Server Action from a server page. The generated props table documents the bare export, as Field's does beside `FieldLive`; the client export is in the hand-written part of each README. Banner gained no demo, because its demos are all Server Components and the e2e fixture already counts `onDismiss`; Tag's two removable demos and Rating's `controlled` demo now use the client exports.

**Why.** React throws only when a function reaches a client component or a host element, so a function a server component consumes itself is safe. The pins that remain are that kind, each checked against the code: `labels`, `getHref`, `getKey`, `columns[].cell` and Field's render `children` are called during the server render, and only strings or elements reach a client part (Code Block hands its copy button three strings, an editable Rating hands `RatingField` the step names). A callback a client component calls is different: the server export must not take it (R-5.1-3, PLAN 9.2), so it lives on a client export instead of an exemption. The check stays on every key, so each remaining pin is a visible line in a test.

**Affects.** R-5.1-3, whose status moves from manual to this test. The `labels` of Navbar Links is pinned for the same reason as the components above. Not covered: a callback a client export inherits from Base UI or React, whose JSDoc is theirs and which R-5.7-5 forbids copying into ours; a function nested inside a client export's prop; and a `(formData) => void` that is not marked `'use server'`, which no type can tell from a Server Action.

## 2026-10-17 - The keyboard specs of Unit 3

**Decision.** R-5.6-1 and R-5.6-3 are proved for Unit 3 by sixteen Playwright specs, `e2e/keyboard-<slug>.spec.ts`, on the live harness in both directions, with the helpers in `e2e/keyboard.ts`. The ring is read as the computed outline (`solid`, 2 px, on an element that matches `:focus-visible`, or on a highlighted row for a menu or a list), not as pixels: the pixel and forced-colours reads stay in `focus-ring.spec` and each component's own spec.

**Found and fixed.** A toast reached by Tab, not by F6, then closed by Escape or by its x, left the focus on the body: Base UI records where the focus came from only on F6. The viewport now keeps it on a keyboard focus from outside and gives it back once the toast is gone, when nothing else took it.

**Written down as they are, not changed.** The specs hold these as the contract: a non-modal Popover closes and goes on to the control after the trigger when Tab leaves its last control, and stays open when Shift+Tab goes back to the trigger (Base UI's focus manager); a disabled Dropdown item is an arrow stop that neither Enter nor Space picks, as the Authoring Practices allow; the Accordion has no arrow keys, as the current Accordion pattern lists none. Left for Omar: Base UI gives the Tooltip popup no `role="tooltip"` and the trigger no `aria-describedby`; the trigger's own name carries the text.

**Tooltip role and description (amended 2026-10-17, round 6).** Base UI 1.8.0 really sets neither, open or closed: `tooltip/popup/TooltipPopup.mjs` 59-64 renders a `div` with `FOCUSABLE_POPUP_PROPS` (only `tabIndex` and a data attribute), the root's popup props (`useDismiss` only, `tooltip/root/TooltipRoot.mjs` 120-143, no `useRole`) and no `id`; `tooltip/trigger/TooltipTrigger.mjs` 205-242 adds an `id`, hover, focus and dismiss props and no ARIA; the only ARIA in `tooltip/` is the arrow's `aria-hidden`; its docs (`docs/react/components/tooltip.md` 390-391) call a tooltip visual only, named by the trigger's `aria-label`. Playwright on the open `tooltip--basic` showed the same. So Tooltip now adds both, through render props and no wrapper element: the popup is `role="tooltip"` with its root's React `useId` (a caller's `id` wins, and the trigger names that one), and `TooltipTrigger` hands Base UI a render function that gives the caller's element, merged by Base UI's `useRender` as Base UI merges its own, `aria-describedby` while `state.open` is true. That is Base UI's own ownership: the trigger that opened the popup, or the only one of a controlled-open root; a `defaultOpen` popup no trigger opened is linked to none, as it marks none `data-popup-open`. The `aria-label` stays, so Chromium exposes the text as the name and again as the description. This replaces "add no role by hand" in `docs/figma/unit-1.md`. Asserted in `tooltip.aria.dom.test.tsx`, `e2e/tooltip.spec.ts` (with axe on the open page) and `e2e/keyboard-tooltip.spec.ts`; three mutation rows. The specs that told a tooltip from a dialog by its missing role (popover, drawer, dropdown) now find `[role="tooltip"]`.

**Changed in round 6 (the exemption review, rows 55.1 to 55.16).** Three departures had no earlier entry and are now fixed in the code (R-5.6-1; APG Dialog, "focus is initially set on the first focusable element", and the keyboard interface's "Persistence of focus"). The Drawer takes the first focus a Dialog takes: `useDrawerPopup` hands Base UI `drawer/lib.ts` `firstFocusOf`, which is the first control (a scrolling body counts), and the sheet itself after a touch, so no virtual keyboard rises, or while the sheet itself scrolls, so its top stays in view (the APG's own exception for long content); a caller's `initialFocus` replaces it, and the caller's `ref` still reaches the sheet. A dismissed Banner and a removed Tag hand the focus on instead of dropping it on the body: the part that owns the press (the x in `banner/hook.ts` and `tag/hook.ts`) records, when the x held the focus, the next tab stop after the banner's region (else the one before), or the next x of the tag's own list (else the one before, else the next tab stop), and focuses it once the element is gone, only when the focus fell to the body, so a caller that moved it keeps its choice. The tab stops come from `src/shared/focus-neighbour.ts`, hand-written rather than the `tabbable` package (R-5.9-1). The Toast viewport also forgets the trigger it recorded when the focus comes in from no element, so a later Escape never sends it back to a stale one. The specs now write out every expectation (R-17-1) and assert where Tab out of a Popover, a Dropdown and a non-modal Dialog lands, on a sentinel button `e2e/keyboard.ts` puts after the demo; `e2e/keyboard.self.spec.ts` proves on static pages that `expectRing`, `expectRowRing`, `pressTo`, `tabStops` and `rowRingOf` fail on a page that breaks the rule; and the demos with a contract of their own (dialog confirm and trap-focus, drawer non-modal and trap-focus, dropdown in a dialog and with links, accordion first-open, sidebar groups, command groups) and Rating's Space on an unchecked star have their own tests.

**Helpers folded (round 6 integration).** `e2e/keyboard.ts` is the one helper module (Unit 4's `ring.ts` and Unit 5's `keys.ts` are gone), and its one `expectRing(page | locator, label, holder?)` runs Unit 5's strict probe on every call; a highlighted row, whose ring follows `data-highlighted`, is held to its outline only.

**Affects.** R-5.6-1 and R-5.6-3 in `docs/RULES.md` (Unit 3 only; Units 4 and 5 are their own jobs). `src/components/toast/hook.ts` and `client.tsx`. Round 6: `src/shared/focus-neighbour.ts`; `src/components/drawer/hook.ts`, `lib.ts` and `client.tsx`; `src/components/banner/hook.ts`, `lib.ts` and `types.ts`; `src/components/tag/hook.ts`, the new `lib.ts`, `client.tsx`, `types.ts` and `dummy/removable.tsx`; the Drawer, Banner and Tag READMEs.

## 2026-10-17 - R-5.2-6 covers arbitrary selectors, and bare aria means "true"

**Decision.** `topclass/bare-data-variants` flags a bracketed bare name in every form Tailwind 4.3.3 has a bare variant for: `data-[open]:`, `aria-[busy]:`, `aria-[busy=true]:` (quoted or not), `[&[data-open]]:`, `[&:has([data-open])]:`, `has-[[data-open]]:`, `[&:not([data-open])]:`, `not-[[data-open]]:` and `[[data-open]_&]:`, with any `group-`/`peer-` prefix, and reports every hit in a string. It runs on `src/`, `e2e/` and `scripts/build-harness.tsx`, since the rule has no "inside src/" clause; `scripts/mutations` injects broken source and stays out. Two rewrites are not equivalent, and the message says so: `aria-busy:` emits `&[aria-busy="true"]` where `aria-[busy]:` emits presence, so the attribute is set only as `"true"` or removed; and `in-data-open:` emits `:where(*[data-open]) &`, dropping the 0,1,0 specificity `[[data-open]_&]:` had. `aria-[x=false]:`, `data-[x=y]:` and descendant selectors such as `[&_[data-open]]:` stay legal. A class list outside a class context may now open on `[` or quote a value when the token holds `]:`, which widens what all fourteen rules see; `pnpm lint` finds no new hit.


## 2026-10-17 - What check-boundaries reads as a server render prop (R-5.7-4)

**Decision.** The check walks every `.ts`/`.tsx` under `src/` without `'use client'`. Tests are out of it entirely, and a demo only for the render-prop half: a demo passes `render` and never takes it, but the CLI copies it into the consumer's repo as server code, so a `useRender` in one fails. A prop counts as taken when it is destructured under any annotation, from `const { ... } = <first parameter>`, or read as `<first parameter>.render`; `link` counts too, since `shared/link.tsx` is R-5.7-4's link form. Taken means implemented only when the file calls the name its import of `renderElement` binds, or `renderLink`, resolved to `src/shared/render.ts` and `src/shared/link.tsx`; `render={render}` handed on unchanged counts for `render`.

**Why.** Importing `renderElement` is not using it. Client files keep the function form (PLAN 5.7), so `'use client'` files are outside, and `shared/render-trigger.ts` stays without `'use client'`: it only hands a function form on to a Base UI part in client code, and the directive would turn its `hasContent` into a client reference for its server importers.

**What it affects.** The element-only type half is not the regex: `tsc` rejects a function passed to `renderElement`, and each server `types.ts` declares `render: ReactElement` (button, avatar, sidebar, navbar), pinned by their type tests. A `typeof render === 'function'` or a call to `render(` in a server file that takes `render` is rejected as a backstop. Not checked: the client half, and a server file reaching `useRender` through a local `'use client'` helper (direct imports only, as R-5.1-1).

## 2026-10-17 - R-5.12-1 counts one hook per component, a `'use client'` part may import hook.ts, and there is no lib.tsx

**Decision.** R-5.12-1's Rule line now reads "`client.tsx` and every `'use client'` part are JSX plus at most one call to `useXxx()` from `hook.ts` per component": the `client-shape` lint counts the limit per exported component, as unit-4.md and unit-5.md (adopted 15 October) already said and 22 `<slug>.client.test.ts` suites pin. PLAN.md 8.1 is amended to match: `hook.ts` is imported only by `client.tsx` and its `'use client'` parts (Combobox's list, Command's panel and DatePicker's calendar import it). `lib.tsx` leaves the folder contract: `lib.ts` holds pure helpers and imports no React, and markup both halves draw is a part with no directive. Rating's star is `parts/rating-star.tsx`, Field's frame is `parts/field-frame.tsx`, Dropdown's row is `parts/dropdown-row.tsx` and its link element is `toLinkElement` in `src/shared/link.tsx`, Table's `lib.tsx` is `lib.ts`. `check-boundaries` holds a part with no `'use client'` to index.tsx's rule, since index.tsx may render it: no hook but `useId` and `use`, no import of `hook.ts`. Command's run keys and spacer gaps are `toRunViews` in `lib.ts`, and Banner's dismissal store moved from `lib.ts` into `hook.ts`.

**Why.** Per file would make every part import hook.ts or move into client.tsx, against the folder pins, the mutation anchors and R-9.2-4; the Enforced-by line alone cannot widen the Rule line. A directive-less part was client code with no gate, and `lib.tsx` let React into the one file PLAN.md 8.1 keeps pure.

**Affects.** R-5.12-1, R-5.1-1 (Enforced by), R-8.1-1 (the contract loses `lib.tsx`), PLAN.md 8.1, unit-3.md, unit-5.md and CLOUD-PLAN.md, the 7 October zod/mini entry (no `lib.tsx` among client files).

## 2026-10-17 - A list gives each of its links a list item

**Decision.** `NavbarLinks` and `SidebarGroup` put each direct child in a `<li>` of their own, and `NavbarLink` and `SidebarLink` render the link alone, so className, style, ref and the rest reach the outermost element they render (`R-5.7-3`). A child that renders nothing (`null`, `false`) gets no item. `docs/figma/unit-3.md` put the list item in the link; this corrects it.

- Each direct child is one item (`R-5.7-3`): a component child that renders several `NavbarLink` or `SidebarLink` elements, or a fragment of them, becomes one `<li>` holding them all. Write the links, or an array of them, straight into the list.

**Why.** The `<li>` is ours and the list that owns it can render it; no Base UI part is involved.

## 2026-10-18 - The mutation copy keeps the repository's shape

**Decision.** `pnpm test:mutation` copies the package to `<tmp>/packages/topclassui`, copies `pnpm-workspace.yaml` to `<tmp>` and links the repo's `docs/` there, so `findRepoRoot` finds the copy's root as it finds the repo's. `meta.test` (PLAN 18) and the root-props test (DECISIONS) both read `docs/` through `findRepoRoot`.

**Why.** Three branches fixed the same fault, a copy without `docs/`: `TC_REPO_ROOT` passed to the copy (check/root-props-everywhere 34ac0e2), a layout copy with a `docs/` link (fix/index-no-markup fc2302f) and a shaped copy with `docs/DECISIONS.md` alone (fix/root-props-everywhere 62c4d63). The integration keeps the third, extended by the second's `docs/` link so PLAN.md resolves too, and drops `TC_REPO_ROOT`: one mechanism, and a test reads the copy the way it reads the repo.

**Affects.** `scripts/mutate.ts`, `src/shared/meta.test.ts`, `src/test/root-props.dom.test.tsx`.

## 2026-10-18 - Where two round-6 rules met in the integration

**Decision.** `scripts/lib/index-markup.ts` lets an index re-export `#shared/toast/toast.js` by name, and no other module outside the folder. `useTooltipRoot` returns the popup-id context with its value, so `tooltip/hook.ts` exports hooks only.

**Why.** fix/parts-and-hooks-names moved `toast`, a call object with no React, to `src/shared/toast` and forbids an object in `lib.ts`, while fix/index-no-markup lets a C index re-export only its own folder's files; one named shared module is the narrowest seam. fix/tooltip-aria's exported context met the same branch's hooks-only rule, and the shape the other eight roots use answers it.

**Affects.** `scripts/lib/index-markup.ts` and its test, `src/components/toast/index.tsx`, `src/components/tooltip/hook.ts`, `client.tsx` and its client test.

## 2026-10-17 - One thin themed scrollbar for every scroll area

**Decision.** `SCROLLBAR` in `src/shared/classes.ts` is `scrollbar-width: thin` and `scrollbar-color: var(--tc-scrollbar-thumb) var(--tc-scrollbar-track)`. `SCROLL_AREA` and `SCROLL_X` carry it, so every dialog and drawer body, popover, dropdown, command, select and combobox list, date picker, tree view, file upload list, toast viewport, sidebar body, accordion region, tabs list, navbar links, segmented control and code block wears it; the table box and the textarea, which scroll without those two, add it by hand. The thumb is neutral-500 in light and ocean and neutral-400 in dark, on a transparent track, so it stands on the surface beneath it: 4.53 to 4.73:1 in light, 5.83 to 7.63 in dark, and 3.93 / 6.27 on a read-only field. `check:contrast` measures it on every surface and on its track whenever the track is not transparent. The code block sets the two tokens to its own fill and halfway thumb, as before. The collapsed Sidebar still hides its bar. Two widths follow from the thinner bar, measured under a mouse: an expanded Sidebar's bar is 10 px (15 before), and a Textarea that takes the browser's own width, in a `w-fit` parent or beside a label, is 173 px (178 before; unit-4.md says 178), since Chromium reserves the vertical bar in it.

**Why.** The native bar stays fast, keyboard and screen-reader neutral, and under forced colours Chromium computes `scrollbar-color` to `auto`, so the system colours win with no class of ours (`e2e/scrollbar.spec.ts` reads it). No JavaScript scrollbar. Arbitrary properties, not the `scrollbar-*` utilities of the installed Tailwind 4.3.3, which the 4.2 floor of the peer range may lack. The page's own bar is the consumer's and is left alone.

## 2026-10-17 - The primary colour is blue

**Decision.** Omar chose blue over violet (PLAN O2). Light and dark: `--tc-primary-solid` blue-600, `--tc-primary-hover` blue-700, `--tc-primary-active` blue-800, `--tc-primary-on-soft` blue-800 in light and blue-400 in dark. The ring follows `--tc-primary-on-soft`, as before. Ocean keeps cyan.

**Why blue-800 in light.** The first try, blue-700 as violet-700 was, measures 4.62:1 on `--tc-primary-soft-active`, inside the 0.15 margin of `check:contrast`; blue-800 measures 5.99 there and 7.52 on the resting tint.

**What it affects.** The white label on the fill is 5.26:1 (violet 5.88), on hover 6.82 (7.29), on press 8.84 (9.16). The light ring is 8.84 on the page (7.29); the dark ring 5.73 on a raised card (5.30). The comments and mutation labels that gave violet's measurements give blue's now: the dark fill is 2.88:1 on a raised surface (2.57), and the theme ring a forced palette would keep is 2.4:1 on Canvas (2.85 to 2.9). Figma still draws violet.

## 2026-10-16 - The deep reviews of Units 4 and 5, and what they changed

**Decision.** Two independent reviews measured Units 4 and 5 in a browser and found faults that every gate had passed. Unit 4: 56, of them 3 blockers (a Slider drag inside a Drawer swiped the Drawer shut; the checked radio dot at 2.57:1 in dark; an OTPField `autoSubmit` that sent another form), 27 major and 26 minor. Unit 5: 40, of them 3 blockers (an Escape during the DatePicker's first load left an invisible calendar that took the focus; a month button disabled under the focus, so one Escape also closed the Dialog around it; code in an Arabic page that was not monospace), 16 major and 21 minor. Each was reproduced before it was fixed, and each code fix carries a test that fails without it. The fixes are the `fix/*-review` branches after `feat/combobox` (otp-field, slider, radio-segmented, toggles, number-field, textarea, select, combobox) and after `feat/date-picker` (date-picker, file-upload, tree-view, stepper-meter, field-form, code-block). OTPField's and Slider's were made on Omar's laptop; every other fix was verified a second time there, by a fresh agent, which fixed what did not hold on every path (SELECT-1 with a full-width trigger, SC-1 at a 32 px root on a 320 px screen, NF-3 on Enter) and two test faults (a Textarea fixture that followed the fonts, two stale mutation anchors). Some new mutation rows were run against their component's own tests only, to spare the laptop's memory. The Unit 4 and Unit 5 entries below are amended where these fixes change them. What the fixes decided:

Unit 4:

- **Switch: the off thumb is `line-strong`**, not the drawn `surface-raised`, which was 1.2:1 on its track (1.08 in dark). It is now 3.94:1 in light and ocean and 6.31 in dark, and `check:contrast` measures it.
- **RadioGroup: the checked dot and line are `primary-on-soft`** (the ring colour), not the drawn primary/solid: the dark dot was 2.57:1 on its fill, now 5.31.
- **Toggles under forced colours** (`TOGGLE_RING`, `TOGGLE_ON`, `TOGGLE_INVALID`): the ring of a focused filled box is CanvasText; a checked invalid box turns its line CanvasText and drops the red inset ring, so the 2 px width is the cue; a checked disabled box is GrayText. A disabled selected segment takes GrayText too.
- **A mixed Checkbox sends nothing**, before and after hydration and through a reset, as unit-4.md says; it sent `on` after a press.
- **`useFormValue` follows the form a control names now**, so a changed `form` prop resets the right form.
- **The server tab stop.** A RadioGroup or SegmentedControl with nothing checked, or with a default that names no item, puts it on the first enabled item in the server HTML, so hydration no longer moves it: choice 35 now takes its other option. A reset or a value set from outside puts it back on the checked radio (the group remounts).
- **Slider.** The control carries Base UI's `data-base-ui-swipe-ignore`, so a drag inside a Drawer moves the thumb. `aria-invalid` reaches each range input from hydration on; the server HTML has it on the group only. The root carries Base UI's direction, so with no provider it is a working LTR slider. It dims and refuses presses inside a disabled fieldset (`has-disabled:`). `largeStep` and `minStepsBetweenValues` are clamped. It is padded by half the knob and its ring, so the track inset is 14 px at md and 18 at xl (choice 18 said 12). A long `showValue` moves below the track. The track has a `line-strong` outline, 3:1 in every mode.
- **`FIELD_TEXT` lg and xl take the 16 px floor under a coarse pointer**, as xs to md do. unit-4.md 717-718 keep the old block as history.
- **NumberField.** A NaN `min`, `max` or `step` is unset, and a `max` under `min` is raised to `min`. Inside a disabled fieldset the whole field dims. A Latin `1,234` typed under Arabic-Indic digits is 1234 on blur and on the Enter that submits; after Enter it shows the Latin text until blur. The steppers give way at 200% text.
- **Textarea.** Autosize keeps the scroll of the page and of every box around it. `maxLength` is clamped to a whole number from 0 to 2,147,483,647. A one-row field stays one row under the touch floor, and the holder of a lg or xl field takes the touch floor of its text.
- **OTPField.** `autoSubmit` is ours: it calls `requestSubmit()` on the field's own form, or the one its `form` attribute names; Base UI's could submit another. `aria-labelledby` names the group too. The row wraps: cells have a 24 px basis, so a parent narrower than six cells' 184 px breaks the row (4 + 2 in a 1fr 1fr grid at 320 px) instead of scrolling the page. Choice 38's one row holds only where it fits; twelve cells still break at whole 44 px cells.
- **Select.** A side placement with no room beside the trigger opens below or above, at the trigger's width: on a 390 or 320 px phone every side placement does. The open list is named after its field. Read-only is a dashed line under forced colours.
- **Combobox and `useCollection`.** `useCollection` asks for a page only once the list is read at its count, not on mount and not again when a page lands. A Combobox counts a page by the options loaded, not the matches, and asks for none while closed, so a short filtered list keeps asking until `hasMore` is false (three asks where it asked one), as unit-4.md says. A value whose option is in no loaded page shows an empty input. The label's text is on the input only while the list is open. The chosen row is centred once its height is measured, and again when Base UI cuts the list to fit.
- **A row under a finger is raised to 44 px, never shortened** below the row height a 32 px root or a density sets (`ROW_TOUCH`, and Dropdown's row in Unit 3).
- **The focused option of a Select** (SELECT-2, in Unit 3's code) is ringed by Unit 3's fix of the highlighted row (`fix/menu-rows-review`), recorded in the entry below.

Unit 5:

- **Meter and Progress paint the bar in `<tone>-on-soft`, not `<tone>-solid`**, with a `line-strong` outline on the track: the bar is 5.64:1 or more on the track, the edge 4.74 (7.66 in dark) on the page. Under forced colours the bar is CanvasText on a Canvas track. `check:contrast` holds the bar on the track at 3:1. A Meter's track is at least 4rem wide, so a `w-fit` parent no longer hides it, and a NaN `min` or `max` takes its default.
- **The Arabic font is set only where `lang` is written** (`[lang|='ar']`, not `:lang(ar)`), so a `font-mono` beneath it, code or a keycap, stays monospace. Letter spacing stays 0 for every Arabic descendant (`R-5.3-3`).
- **CodeBlock.** A classic scrollbar is drawn in the block's colours (a new token, `--tc-neutral-solid-thumb`), so the pre's ring keeps its bottom side. A pre with no title is a region named by a new label, `common.code` ("Code", Arabic "الشيفرة البرمجية"). Each press writes its status words in a new node, so a repeat failure is read again.
- **Stepper.** Steps that do not fit wrap onto another row, 16 px apart, rather than scroll sideways as the reviewer suggested. Every circle is sized from a new token, `--tc-stepper-mark`, so a custom Stepper takes the caller's size. The step `value` names is current even when it carries its own status.
- **DatePicker.** A close before the lazy part arrives unmounts the root. The month buttons at the end of the range are `aria-disabled`, not `disabled`, so the focus stays on them and one Escape closes one layer. The chosen day's button is `aria-pressed`. The chosen day carries an inset line at 3:1 (the dark fill alone is 2.57:1), and its ring under forced colours is CanvasText. The popup's padding stops at 16 px and gives up its sides to a narrow screen; a cell has 2 px above and below and none beside, so a day fills its column (35 px on a 320 px phone) and two digits fit at a 32 px root.
- **TreeView.** A press brings the focus without scrolling; a press off a row, or on a disabled row, highlights nothing. While a wheel leaves the highlighted row out of sight, the tree draws its own ring. A space inside a type-ahead query is text.
- **Shared, from TreeView.** An unmeasured collection windows the rows its box shows, so a server-rendered list has no blank rows. A dev warning reads `process.env.NODE_ENV` in the dot form every bundler inlines, so it never throws in the browser.
- **FileUpload.** The list is capped at `visibleRows` whole rows, gaps and the coarse row included, and a row never shrinks. A disabled upload dims its remove buttons. The input has an empty `title`, so Chromium shows no "No file chosen" tooltip. Each over-limit cut writes its message anew. A size is rounded before its unit is picked (1 MB, not 1,024 kB). A long word wraps, and a link in the hint is lifted over the input.
- **Field and Form.** A form error is cleared from every FieldLive of a name once one of them changes. The errors context holds `undefined` until an answer holds errors: the test was reworded, the code did not change (SHARED5-3). The Form README says a FileUpload loses its files when an action resets the form. The buttons of Field's form demo wrap, so a 32 px root never scrolls a 320 px page.

Left for Omar, each built as the first option:

- OTPField under its 184 px floor: the drawn 8 px gap, so a 1fr 1fr pair breaks 4 + 2 at 320 px and 5 + 1 at 390; or a 6 or 4 px gap, which keeps the 390 pair on one line but departs from the drawing.
- An OTPField in equal 1fr 1fr halves beside a short span: it breaks 4 + 2; or no wrap for eight cells or fewer, which brings the page scroll back.
- The Slider in dark (SLIDER-9, the one finding only partly fixed): the fill stays primary/solid as drawn, 2.76:1 on the empty track, with the knob face 2.57 on the fill; or the fill and the knob line take `--tc-ring`, 5.31 or better everywhere but a shade darker than Figma in light and ocean.
- The Slider's `aria-invalid` before hydration: on the group only; or Base UI's Field.Root around the slider, which hides an outer Field context.
- A NumberField `min` or `max` of plus or minus Infinity: pulled to 1e15, so End jumps there; or read as unset.
- A RadioGroup whose `defaultValue` names a disabled radio: Base UI puts the only tab stop on it, so Tab skips the group, now after a reset too; or a `highlightedIndex`.
- An element given as a label ends in an ellipsis inside SegmentedControl only; or the shared `truncateLabel` wraps an element child too.
- The Switch's off thumb in Figma: still `surface-raised`; parity needs `line-strong` there too.
- Select: every side placement on a phone opens below; confirm.
- TreeView: a press on a disabled row highlights nothing, where the plan says a disabled row takes the highlight; confirm. With duplicate ids (a broken contract), ArrowDown stops at the row before the dropped one.
- Stepper: wrap; or the reviewer's sideways scroller. Meter and Progress: `<tone>-on-soft` fills; or solid fills with darker solids.
- The form errors context: `undefined` until an answer holds errors; or FormAction provides a frozen `{}`, a code change with its own entry here.
- `field--controls` in RTL at a 32 px root on a 320 px screen: the segmented control's "Table" radio starts at x = -7 inside its own scroller, as before the review; for SegmentedControl's next look.
- Under forced colours a classic scrollbar thumb crosses the bottom row of the CodeBlock ring at 1.39:1 (1.46 in dark): the browser's own limit, the same before the fix.
- After the Slider fix, `e2e/field.spec.ts:50` and the Slider row of the Field README on the Unit 5 branches still put `aria-invalid` on the group; they change when Unit 5 is stacked on the fixed Unit 4.
- FU-8 is proven from Chromium's source, since headless Chrome cannot capture a tooltip: hover the basic FileUpload demo in Chrome to see that none shows.
- Housekeeping: old agent worktrees held stale copies of seven fix branches with leftover edits; the edits are saved in `handoff/crash-backup/agent-leftovers/`, those worktrees are detached, and the local fix branches now hold the pushed, verified tips. `u3-popover` and `u3-accordion` are left on a detached HEAD. Three files pass the 200-line warning: tree-view `hook.ts` (217), `slider.test.tsx` (216) and `file-upload.dom.test.tsx` (207). On some bases `scripts/mutate.ts` still lacks Unit 3's runner fix; it arrives with the stack.

SELECT-5, the two merges on `feat/select` that keep git's default message ("Merge branch 'feat/slider' into feat/select" and the same for `feat/number-field`), stays as history.

**Why.** Each line answers a reproduced fault; the findings, reproductions and fixes are in `handoff/review-4`, `handoff/review-5` and the pull requests.

---

## 2026-10-16 - The deep review of Unit 3, and what it changed

**Decision.** An independent review measured all of Unit 3 in a browser and found 73 faults that every gate had passed: 2 blockers (a Drawer opened from a Dialog drawn under it; a filled Rating star at 2.13:1), 33 major and 38 minor. Each was reproduced before it was fixed, and each fix carries a test proven to fail without it. The fixes are the fourteen `fix/*-review` pull requests after `feat/command`; the whole chain passes `pnpm check`. What the fixes decided:

- **One overlay layer.** `--tc-z-drawer` and `--tc-z-dialog` now alias `--tc-z-popup` (60), so the overlay opened last is on top whatever its kind; the toast stays at 70. PLAN 620-622 and unit-3.md 161 keep the old three numbers as history. A `keepMounted` overlay reopened after another keeps its first place in the DOM and can be drawn under it: no demo does this.
- **Every Drawer sits in Base UI's `VirtualKeyboardProvider`**, not only a bottom sheet, so changing `placement` while open keeps the sheet and what was typed.
- **A highlighted list or menu row carries the focus ring** (it follows `data-highlighted`), so the keyboard mark is 3:1 and not a 1.1:1 fill. A row under the mouse is ringed as well.
- **The filled Rating star is `warning-on-soft`** (amber-800 in light and ocean, amber-400 in dark), 4.5:1 on every surface; the drawn amber-500 is 2.13:1 (R-5.6-4).
- **Tabs**: inactive labels are regular, not medium (Windows draws 500 and 600 alike, and the docs stage says Regular), and the active enclosed tab gains a `line-strong` edge.
- **Navbar**: a bar taller than a third of the screen scrolls away instead of sticking (`NAVBAR_STICKY_SHARE`); this only happens with large text.
- **A label carries `dir="auto"` only when it is written in one direction**; a label that mixes directions takes the page direction. This amends the 2026-10-14 line below.
- **The test helpers measure**: `rgbOf` reads oklch, `expectNoSidewaysScroll` sees overflow past the inline start, `viewportBox` fails for an element that is not rendered, and the mutation runner checks the unmutated suite first and no longer counts a crash as caught. Playwright defaults to 4 workers (`TC_E2E_WORKERS` lowers it) so a full check fits this laptop.
- **Accepted from Base UI 1.8.0**: a popover opened by the pointer has its focus manager off, so the first Tab from its trigger rests once on a hidden focus guard; a spec pins it, so an upstream fix shows.
- **README generator**: imports what `index.tsx` exports, and marks a prop required by another prop's literal or required boolean.

Left for Omar, each built as the first option: the dark `--tc-line` that equals the Accordion's surface (keep, or `line-strong`); a Dropdown label wider than its row at a 32 px root (one line with an ellipsis, or two lines); a plain Tag loads its x's code (about 3 KB) because `<Tag onRemove>` must render it; `onDismiss` of a Banner runs while the banner is still in the page; DropdownMenu takes no `...rest` or `ref`; the Navbar list springs back to the focused link after a hover (CSS only, or a `scrollIntoView`); 4 Playwright workers by default; digits for a bare Arabic tag (the question of 2026-10-14, still open). A mutation row that only a browser can catch is still caught only by its class pins: running Playwright per mutant is the next step for `test:mutation`.

**Why.** Each line answers a reproduced fault; the findings, reproductions and fixes are in the pull requests.

---

## 2026-10-15 - Unit 5: where it departs from its plan

**Decision.** Unit 5 is built as `docs/figma/unit-5.md` asks, on top of the local Units 3 and 4 stack, with these departures. Omar has not answered its "Choices for Omar"; every open choice is built as its "Built as" column.

From the plan itself:

- Field, Form and Meter are built, though they are not among the 46. Label is a prop, not a component.
- Field's control object gains `aria-labelledby`; its ids come from `useId()` unless `id` is given.
- FieldLive and FormAction use neither Base UI's Field nor its Form. FormAction keeps the browser's own validation and takes a function child that gets the action's state.
- Stepper is a server component. CodeBlock has no highlighter and its own copy part.
- CodeBlock's copy button writes its own hover, a 10% tint of neutral/on-solid, because `HOVER.ghost` reads the page's neutral/soft beside the block's text colour (`R-5.2-4`). Its rings stay the shared ones.
- TreeView writes its own two rings (`R-5.2-4`). DatePicker is built on `Intl` (2026-10-03); its grid is Gregorian, six rows, with a Close button. PLAN 2 and 18.4 still name react-day-picker; this line corrects them.
- The FileUpload list is not windowed (windowed since the R-8.5-1 entry of 2026-10-17). `FileUpload`'s rest is the input's own attributes (`ComponentPropsWithoutRef<'input'>`) and reaches the `<input type="file">`, which is void, so the zone, prompt and hint cannot sit inside it; className, style and ref reach the root (`R-5.7-3`).
- TreeView takes no `getKey`, `selectedItem` or request ids (8.5). TreeView and FileUpload take no `error` status. FileUpload, TreeView, CodeBlock and Field take no `size`.
- `expanded`, `defaultExpanded` and `onExpandedChange` join the vocabulary.
- Not built in v0.1: ErrorState, ErrorBoundary, IconButton, Heading, Text, Container, Stack, Grid.
- New infrastructure: nine label keys, three tokens, `src/shared/form-errors.ts`.

From the builders, each measured in Chromium:

- **Shared.** The tokens' mutation file is `shared-unit-5-tokens.ts`; the plan said `shared-tokens.ts`.
- **Meter.** As built, some tones filled the bar at under 3:1 against the track, and a meter in a `w-fit` parent was 0 px wide, as Progress; the review changed both (2026-10-16). The rtl demo is a `dir` and `lang` div, not a provider.
- **Stepper.** `defaultValue` is refused by the type. `data-size` sits on the `<ol>`; an unknown status is ignored; the rtl demo is inside a provider. As built, past about 8 steps at md on a 320 px phone the circles overlapped; since the review they wrap (2026-10-16).
- **CodeBlock.** Copy reports "Could not copy" when there is no clipboard (the plan's optional chain reported success).
- **Field.** All eleven Unit 4 controls work inside a Field before and after hydration. Found in other folders: Slider put `aria-invalid` on its group, not its range input (fixed by the review, 2026-10-16); Checkbox's `aria-required` is not in Chromium's tree; OTPField's group gets `aria-labelledby` only after hydration (since the review, in the server HTML too).
- **Form.** `method`, `encType` and `target` are not FormAction props (React writes them). `initialState` is required unless every key is optional. The permalink is proven only with a hand-made Server Action reference.
- **FileUpload.** The empty message line is `sr-only`, not hidden (a live region); a drag also turns the line solid; refused rows stay until the next pick. A form reset rewrites `input.files`; files picked before hydration join the list; native input props are refused by the type.
- **TreeView.** The note is a live region kept in the tree when empty; the tree itself is `empty:hidden`; the selected row's ring under forced colours is fixed by specificity.
- **DatePicker.** The whole Positioner and Popup live in the lazy part, inside the Portal (a popup that grew after mounting made Base UI flip it inside a ResizeObserver callback). Focus moves to the day one frame after the popup is placed. Home and End go to the first and the last day of the active day's week, turning the month as the arrows do (the Authoring Practices grid; they stayed inside the visible month until 2026-10-17). As built, days were 31 px wide on a 320 px phone (choice 19); since the review a day fills its column, 35 px (2026-10-16). The modal popup hides the caller's label while open, as Combobox's does.

**Why.** Each line answers a measurement or a rule; the numbers are in `handoff/LOG-5.md` and the specs.

---

## 2026-10-15 - Unit 4: where it departs from its plan

**Decision.** Unit 4 is built as `docs/figma/unit-4.md` asks, on top of the local Unit 3 stack (`feat/command`), with these departures. Omar has not answered its "Choices for Omar"; every open choice is built as its "Built as" column, and each builder's list of the choices it took is in `handoff/LOG-2.md`.

From the plan itself:

- Field, Label and Form are not built with the form controls; the two Phase 4 clauses about server Fields, `FormAction` and `FieldLive` stay open for Unit 5.
- Switch and Checkbox keep Base UI's `checked`, `defaultChecked` and `onCheckedChange` (`R-5.7-1` says `value` and `onValueChange`). The recommendation is asked as choice 2, before the session, not on Switch's pull request.
- Select is not windowed: Base UI moves real focus over its mounted items (`SelectRoot.js:292-306`); the ten thousand options of Phase 4 are Combobox's. Since the R-8.5-1 entry of 2026-10-17 it takes the knob and paging of `CollectionProps` through `useCollection`. Options are plain `{ value, label, disabled }` data, with no `getKey`. `selectedItem`, a stale `loadMore` dropped by request id and the error row with a retry are not built. A Select does not warn for two options with one `value`; a Combobox does.
- The shared target spec no longer measures an input hidden from assistive technology and out of the tab order, or an `<input type="hidden">` (`R-5.6-2`).
- As built, at 320 px under a coarse pointer a six-cell OTPField's cells were 36 px wide (33 with a separator), and seven or eight cells were under 44 px wide at 390 px too (`R-5.6-2`). Since the review the row wraps under its floor, and six cells in a block are 41.3 px wide at 320 px (2026-10-16).
- `RadioGroupItem` takes className and style on its `<label>`, and the ref and the rest on the radio button (`R-5.7-3`). Base UI's Radio renders the button and its hidden input as siblings (radio/root/RadioRoot.js:211-222), so no one Base UI element holds both; the label names the radio and takes the click, while the circle keeps its own 24 px target and ring.
- `Select` is held in a span; className, style, ref and the rest reach its trigger, `role="combobox"` (`R-5.7-3`). Base UI's Select.Root renders no box (select/root/SelectRoot.js:390-398), and the button cannot own a content-sized grid track without changing its border-box width, as `DatePicker`'s cannot (2026-10-17). `e2e/select.spec.ts` pins the width in eight parents.
- `Combobox` is held in a positioned span; className, style, ref and the rest reach the `<input>` (`R-5.7-3`). The input is void, so the caret and the spinner need a box around it, and Base UI puts `role="combobox"` and its ARIA on the input (combobox/root/AriaCombobox.js:999), so the name, the id and the ref must reach it.
- A held `Textarea` (with `autosize` or `showCount`) is a div holding the textarea and the counter; className, style, ref and the rest reach the `<textarea>`, its first child, which holds text only (`R-5.7-3`).
- `SegmentedControlRoot` is held in a div of one column; className, style, ref and the rest reach the track, `role="radiogroup"`, its first child (`R-5.7-3`). The track draws the line and scrolls, and it must be the radiogroup: Base UI scrolls the segment the arrows reach into view inside the element its radio group renders (internals/composite/root/useCompositeRoot.js:46 and :95 call `scrollIntoViewIfNeeded(rootRef.current, …)`). Round 6 made the radiogroup the holder, with the track inside it; the radiogroup then no longer scrolled, and in `e2e/segmented-control.spec.ts` ("many", 320 px, coarse) three segments the arrows reached stayed cut by the track in both directions, so it was put back. The holder is a grid of one column so that a long track never widens a table cell or a `w-fit` parent.
- Select and Combobox clamp with the shared `COLLECTION_BOUNDARIES` and have no `boundaries.ts` (`R-8.3-6`). A Combobox input has the cap of a search field and no counter (`R-5.7-8`).
- The shared `INVALID` of PLAN 5.2 is `FIELD_INVALID`: a border and an inset ring, no outline.
- Select and Combobox are data-driven only, RadioGroup and SegmentedControl parts only (9.1). SegmentedControl is built on Base UI's radio group. OTPField does not use Base UI's `Separator`, and `length` has a default.
- A Textarea that renders no client code has no counter (`R-5.7-8`), and the `zod/mini` validator is still unwritten. Nine of the ten have no `skeleton.tsx`. A radio label wraps (`R-5.2-7`).
- "Form controls require a label through Field" (5.6) is "a name is required by the type". Combobox renders Base UI's English "Dismiss" (`R-5.11-1`). The adaptive Select and Combobox (11) are not built.
- New infrastructure: the name contract, the option contract, the toggle and field class constants, the server tab stop, `src/shared/use-form-value.ts`, two tokens, seven label keys, `e2e/form.ts` and `scripts/lib/targets.ts`.

From the shared pull requests 1 to 9:

- **Target spec (1).** Its "finds interactive elements" test stops at the first demo with a target instead of loading all 204 in one 30 s test.
- **Toggle and field styles (3, 4).** The plan's classes are kept character for character, and Input's class lists are identical once sorted. `src/shared/classes.ts` passes the 200-line warning (243 lines after 7).
- **Labels (5).** The English of the two ratio labels is chosen: `Character {place} of {length}` and `{length} of {max} characters`.
- **Server tab stop (6).** Three expectations in `tabs.client.test.ts`, which pin hook imports, changed; no behaviour test did.
- **Option contract (7).** `ListOption`, `COLLECTION_BOUNDARIES`, `ROW_TOUCH` and `ROW_SELECTED`.
- **Collection popup (8).** `offsetForIndex` takes `scrollTop`, so `'nearest'` is the nearest edge; `scrollToIndex` reads the padding and the scroll padding; two tokens, `--tc-list-pad-start` and `--tc-list-pad-end`. Command was not re-run against it; the stacked check covers it.
- **Form value (9).** `rootRef` is typed `HTMLDivElement`, since every Base UI root that takes it is a div; a cancelled reset is ignored.

From the builders, each measured in Chromium:

- **Switch.** Its README recommends keeping `checked`, `defaultChecked` and `onCheckedChange` (choice 2).
- **Checkbox.** Base UI leaves `indeterminate` to the owner. As built, a mixed box sent `name=on` after a press while it still showed the dash; the review changed that (2026-10-16).
- **RadioGroup.** Base UI's RadioGroup takes no `rootRef`; the value is typed `string` and `null` is handled. A disabled radio leaves the tab and arrow order. The generated README import names `RadioGroup` (its `meta.name`), which is not an export; Tabs has the same generator fault.
- **SegmentedControl.** `SEGMENTED_HOLDER_FULL` and a `SegmentedControlSelection` type are added; in a narrow parent the segments scroll inside the track.
- **Textarea.** lg and xl get the 16 px text floor under a coarse pointer (the plan left it off: 14 px measured). The skeleton has a height floor, the holder hears a form reset, `rowsFor` subtracts 1 px and the counter groups thousands (5,000). The README prints the type of `maxLength` as `unknown`: the generator does not read zod's nullable.
- **Slider.** The range is built (choice 17). In RTL ArrowLeft raises the value. One thumb carries the name; a range's group does. Before hydration the range input moves the value but not the thumb.
- **NumberField.** The input comes first in the markup and Decrease takes `order-first`, because a wrapping label pointed at the button. It has a `lib.ts`. A Latin grouped paste under Arabic digits is fixed (Base UI parses "1,234.5" as 1); a focused reset writes the default; `-u-nu-` in the caller's locale is honoured; `step` stops at 1e15; NaN is empty. At a 32 px root on 320 px the digits clip; the README said so only after the review, which also lets the steppers give way (2026-10-16).
- **NumberField's role.** The input is a text box with `aria-roledescription="Number field"`, not a `spinbutton`, as Base UI (NumberFieldInput.js:112,116) and React Aria (useNumberField, `role: null`) build it, because iOS VoiceOver cannot type into a spinbutton.
  Its keys follow the Authoring Practices spin button: ArrowUp, ArrowDown, Home and End; `e2e/keyboard-number-field.spec.ts` presses them in both directions (2026-10-17).
- **OTPField.** Built on Base UI's otp-field (Root, Input). The cells stay LTR in RTL, Arabic-Indic digits are stored as ASCII (choice 21), and the coarse text is `max(own step, 16px)` from md to xl. It found two test-helper faults that the Unit 3 review fixed: `rgbOf` read only `rgb()`, and `expectNoSidewaysScroll` could not see overflow past the inline start.
- **Select.** The popup has its own `max-h` (8 px padding). The trigger types drop `render` and `nativeButton`; `ListOption` is not re-exported; the Escape guard is wired but cannot be tested. Base UI facts: read-only still opens, a value of `''` means nothing chosen, and `alignItemWithTrigger` still defaults to true. Two merges on `feat/select` keep git's default messages.
- **Combobox.** 10,000 options: 14 rows mounted, open in 48 to 213 ms, a key in 23 to 35 ms; a wrap to row 10,000 is named by `aria-activedescendant`. Base UI's modal popup hides the caller's `<label for>` while open, so the label's text is copied to the input's `aria-label` (only while open since the review). `useCollection` asked for pages on open and twice per page, so Combobox gated `hasMore`; the review moved the fix into `useCollection` (2026-10-16).
- **The stack.** One conflict, in `shared-labels.ts`, with both sides kept. The Drawer's mouse-drag test now holds 400 ms before release: Base UI dismisses at 0.5 px/ms or more, and the test failed on any idle machine from `feat/drawer` on.

**Why.** Each line answers a measurement or a rule; the numbers are in `handoff/LOG-2.md` and the specs.

---

## 2026-10-14 - Unit 3: where it departs from its plan

**Decision.** Unit 3 is built as `docs/figma/unit-3.md` asks, with these departures. Omar has not answered that file's "Choices for Omar"; every open choice is built as its "Built as" column.

From the plan itself:

- AlertDialog is not built: it is not among the 46.
- `MenuContract`: `icon` is a `ReactNode`, the contract gains `link`, `size` is left out.
- Dropdown is not windowed: Base UI's Menu moves real focus over mounted items only (`menu/root/MenuRoot.js:368-382`), so the row cap alone applies, a deviation from PLAN 8.5 (1399).
- The toast stack is a plain column, not the collapsed stack.
- A Drawer swipes from the whole sheet, has no handle and no snap points.
- An enter or exit transition may animate `translate` too: Base UI waits for every animation.
- The provider renders one real `<div>` (the isolation root) and takes `className`. An app with a flex or grid body moves those classes onto the provider.
- New infrastructure: the live harness, `renderTrigger`, the menu contract, the toast manager.
- Overlays use the native scrollbar; `ScrollArea` is not built.

From the shared set:

- **The focus ring is `outline-none`, not `outline-hidden`.** Under forced colours `outline-hidden` painted a 2 px outline on every control at rest.
- **Toast ships with the provider.** The provider mounts `ToastViewport`, the one planned exception to CLOUD-PLAN 9. Every app now loads Button, Svg, six icons and cva with it.
- **One Escape closes one layer.** `guardEscape` takes a selector; `useOverlayRoot` (src/shared/overlay-scope.ts) scopes it to its own root. Dialog and Drawer use it (Drawer since `fix/drawer-escape-scope`); Popover, Dropdown and Command use their own scopes.
- **Digits follow the locale tag** (`ar-u-nu-arab`) when no numbering system is passed: choice A of a question Omar has not answered.
- **A label is cut between graphemes** and its span carries `dir="auto"` when the label is written in one direction (amended by the review, 2026-10-16).

From the builders, each measured in Chromium:

- **Toast.** Newest toast at the edge; the viewport lets presses through; one viewport per page across React roots; the region is always there, so 11 expectations in the Dialog, Drawer and Popover specs count it.
- **Dropdown.** Popup 12 to 20rem and never past the room; a shortcut capped; a disabled row dims its content; the menu is a tab stop while it scrolls; `DropdownGroupLabel` lives in `parts/` (the root-part lint).
- **Command.** Windowed with `useCollection` (10,000 rows, 14 mounted, open in 50 to 80 ms); every row one unit tall; the first lazy open waits one commit so it animates.
- **Navbar.** The bar wraps to a second row on a phone; the links scroll inside a grid column; a link half in view snaps whole on Tab.
- **Sidebar.** The current row is bold plus a bar, not a fill alone; a collapsed rail is 65 px under a finger; `relative` on the body stops `sr-only` labels growing the page.
- **Accordion.** A `hook.ts` after all, for the scroll tab stop of a wide panel; the region role sits on an inner div, so a closed panel is no landmark; 4 px above the content for a control's ring; a one-column grid, so a wide table cannot widen a fit-content parent; `wrap-anywhere` for a 300-letter title.
- **Tabs.** A disabled tab is an arrow-key stop: Base UI 1.8.0 makes it focusable and gives no way to skip it. It is announced as disabled and cannot be opened.
- **Rating, Tag, Avatar, Banner.** Each renders server HTML when its client half is not needed; Rating, Avatar and Banner import that half only when used, while a plain Tag still loads its x's code, because `index.tsx` must be able to render it. Rating's row wraps; a removable Tag is a grid; a failed avatar image is confirmed by `decode()`; a dismissed Banner shows until the script runs (choice 24).

**Why.** Each line answers a measurement or a rule; the numbers are in the builders' reports and the specs.

---

## 2026-10-10 - The review of the merged Unit 2, and what it changed

**Decision.** With Unit 2 on main, six reviewers looked at the unit as a whole: the components used together in three dashboard pages, a sweep of every demo page, the code, the API across components, a keyboard and screen-reader journey, and the record. There was no blocker. What changed, one line each:

- **One mutation file per area.** `scripts/mutations/<area>.ts`, found by `index.ts`, so a component branch edits no shared file. The 289 rows moved byte for byte.
- **A test gets 20 seconds.** On a busy machine the first test of a file paid for its imports and timed out at 5.
- **The lint holds R-5.2-1 for named colours.** `bg-[red]` is refused, and a system colour passes only behind `forced-colors:`. The rule text says so.
- **One `link` helper.** `renderLink` in `src/shared/link.tsx` serves Pagination, Breadcrumb and Table, and says which prop is wrong when it is not an element.
- **The `--tc-*` style typing is imported by Table and Input**, so the README's `style` samples compile in a program without Progress.
- **`locale` is accepted and dropped** by Breadcrumb, Table, Timeline, EmptyState and Spinner, so `{...getLabels('ar')}` no longer writes a `locale` attribute. ESLint's unused-variable rule ignores rest siblings for this.
- **AvatarGroup keeps its natural width** (`w-max max-w-full`), so a team in a table cell stays on one row. The cost: a group of twenty in a box sized by its content no longer wraps on a phone; `className="w-auto"` brings the wrap back.
- **Table.** A sort link is as wide as its label. The box keeps 2rem of focus room at both ends, and the controls of the stuck column never move it. The stuck column has an edge in `--tc-line-strong`, drawn on a pseudo-element so no cell moves. `TableSkeleton` takes up to 500 rows. `aria-label` on a Table compiles and is ignored, as its README says.
- **InputSkeleton is the box of its field**: its own width, or the full width with `fullWidth`, and the touch height. Beside a Button the README's recipe is `flex-1` on the Input.
- **Small guards.** A false icon in a Timeline keeps the dot. A Breadcrumb label that is not a string leaves its crumb out. Pagination exports `clampPage`, which its README tells a caller to query with.
- **A live harness** hydrates every demo in a real browser (`pnpm harness:serve`, `e2e/live.ts`), on a Vite server taken from `vitest/node`, so no dependency is added.

**Why.** Each line answers a measurement, in Chromium.

- An AvatarGroup in a scrolling table cell stacked one avatar per line: 40 x 216 px for five members.
- `InputSkeleton` was 1201 px wide for a 193 px field, and 28 px tall where the field is 44 on touch.
- A sort link filled its column, so its ring was as wide as the column and was cut by the box; tabbing down 25 rows moved the box 49 times. Chromium leaves a focused control alone when any part of it is inside the scroll padding, so the padding is what decides how much of it shows.
- In dark the hairline is the colour of a raised cell, so an edge in `--tc-line` painted nothing.
- `style={{ '--tc-table-sticky-width': '24rem' }}` failed with TS2353 unless Progress was imported somewhere.
- `{...getLabels('ar')}` put `locale="ar"` on the root of three components.
- Four tests timed out at 5 s in a run beside other suites and passed alone.
- The live harness is what Unit 3 is accepted on (PLAN 19, Phase 5). On its first run it measured a Tooltip arrow 76 px from the edge that faces its trigger, inside a right-to-left provider on a left-to-right page: a portal takes the direction of `<body>`.

**Affects.** R-5.2-1 and its lint. `docs/CLOUD-PLAN.md` sections 7 and 9. `vitest.config.ts`, `eslint.config.ts`, `playwright.config.ts`. Left open for Omar: a `total` on AvatarGroup, an Input that gives way by default, whether Tag and Badge may shrink, the page-size selector, and Arabic-Indic digits in a Server Component. The use of `createViteServer` from `vitest/node` leans on an export Vitest does not document as public (R-0-1).

## 2026-10-10 - Unit 2 is on main, and where it leaves its Build this blocks the reason was measured

**Decision.** Unit 2 is nine components: Input, Tag, Avatar, AvatarGroup, Breadcrumb, Pagination, Timeline, Table and Banner, built from the Build this blocks of `docs/figma/unit-2.md`. Each was reviewed twice in a real browser before it merged, and the review changed the blocks in the places below. The code, the README of each component and this entry are the record; the blocks are not edited. One line per change:

- **Rating moves to Unit 3.** It is built whole there, with its editable half, beside the client halves of Tag (remove), Avatar (hide a failed image) and Banner (dismiss). `rating.value` is already in the labels and has no reader until then.
- **`link` on Breadcrumb, Pagination and Table.** `link={<Link href="" />}` is the element every link is cloned from; its `href` is replaced. The blocks had a plain `<a>` only.
- **Input.** Its own width is `--tc-input-width` (13.8em), less in a narrow row; `fullWidth` fills. Email, number, tel and url are `dir="ltr"` unless the caller passes `dir`, and keep the form's side through the new utility `text-match-parent`. `invalid` thickens the line as well as colouring it. Under a coarse pointer the text is at least 16 px. `readOnly` sits on `bg-neutral-soft`. `maxLength` is written only on the six types HTML allows it on.
- **Table.** Cells are `whitespace-nowrap`. A column takes `className` and `rowHeader`. The stuck column is capped at `--tc-table-sticky-width` (`clamp(8rem, 30vw, 16rem)`) and the box keeps the same width free with `scroll-padding`. The box is `relative isolate grid grid-cols-1`, a named `role="region"` with a tab stop. `captionVisible` draws the caption. `columns` skips false, null and undefined. `TableSkeleton` exists, with `rows` (1 to 100) and `columns` (1 to 50). Its category is `media-and-display`, as PLAN 18.2 lists it, not `data` as the block says; the same holds for Timeline.
- **Table and Timeline do not use `useCollection`.** docs/CLOUD-PLAN.md says they are its first users. They render the `items` they are given; windowing and `loadMore` wait for the first list that needs them (R-8.5-1 stays "not yet"). Table uses it since the R-8.5-1 entry of 2026-10-17; Timeline waits on PLAN 18 (1986).
- **Pagination.** The default size is `md`, not the drawn `sm`. A cell is a square that grows with its number. The current page is named by the new label `pagination.pageOf` ("Page 3 of 12"). Previous and next carry `rel`. An edge control is `<span role="link" aria-disabled="true">`.
- **Timeline.** The status is said in words: a visually hidden `labels.timeline.done`, `.current` or `.todo` in each item (three new labels). The current marker is a smaller dot inside the same 12 px box. Every filled dot carries the `BORDER_STRONG` stroke. A status with no tone takes success for done and primary for current. Title and time are `<div>`, not `<p>`. `getKey` returns a string.
- **Banner.** The row wraps (`flex-wrap`), and the message is `min-w-0 grow basis-40`, so the action drops under it. Forced colours get a bottom edge.
- **Breadcrumb.** `baseUrl` makes the JSON-LD URLs absolute. The current page is `font-semibold` as well as `text-body`. A crumb with a blank label is left out. A crumb with no `href` that is not the last is plain text. It takes no `locale`: it formats no number.
- **Avatar.** `AvatarImage` takes `render` (the element form) for next/image. `AvatarRoot` takes `role="img"` by itself when it is given `aria-label` or `aria-labelledby`. `AvatarFallback` is `aria-hidden` unless told otherwise. A failed image no longer paints its alt (`text-transparent`). Forced colours get an outline.
- **AvatarGroup.** The group wraps and is never wider than its container. The counter is a circle until its count is too long, then a pill. The overlap is 4 px at `xs` and `sm`, 8 px above. A child that is a link is ringed and rises when focused.
- **Tag.** The root is `overflow-hidden whitespace-nowrap shrink-0`, so a label passed as an element is clipped at the chip. `TAG_BOUNDARIES.labelMaxLength` is 100; Breadcrumb's is 200.
- **System colours are allowed behind `forced-colors:` and nowhere else.** Timeline writes `forced-colors:bg-[CanvasText]` and `forced-colors:border-[CanvasText]`. This narrows R-5.2-1. The lint holds the line since the entry above.
- **Two tokens and one utility are new:** `--tc-table-sticky-width`, `--tc-input-width` and `text-match-parent`.

**Why.** Each change answers a measurement on the built component; the numbers are from Chromium, on the harness pages.

- `link`: every crumb, page and sort link was a full page load in Next.js, and the types refused any other element (TS2353).
- Input width: two Inputs in a row inside a grid form were 426 px wide on a 320 px phone. Direction: in an Arabic form `-1234.5` was painted `1234.5-`, and an email put its domain before the `@`. Invalid: the idle line was 4.74:1 and the invalid one 4.77:1 on white, so they differed by hue alone, and under forced colours not at all. Touch: the text was 12 to 14 px, and iOS Safari zooms the page under 16. Read-only looked exactly like a filled input.
- Table: at 390 px the page itself scrolled, to 430 px on the RTL demo and 594 px with the sticky column, because the hidden "Sort by" spans sat outside the box. Inside a flex item the page was 797 px wide at 390, and inside an `inline-flex` parent 755; the grid box brings both to 375. The stuck column took 240 px of a 384 px box and hid the control that had focus. Without `nowrap` a narrow screen stacked a date word by word. A table without a row header gives a screen reader a number with no row to belong to. PLAN 8.2 names `TableSkeleton`: five rows are 263 px in both.
- Pagination: R-5.7-2 says `md` on every component with a scale, and 40 px is the height of the Button beside it. A long page number spilled out of a fixed square.
- Timeline: the status reached a screen reader for `current` only, and the done and current fills were 1.1:1 against each other. The warning dot was 2.13:1 on white. Under forced colours a kept neutral fill was 1.17:1 on the canvas, which is what the system colour is for. A `<p>` title holding paragraphs was emptied by the parser and failed hydration.
- Banner: at 320 px the action squeezed the message to 0 px, 25 lines, in a banner 524 px tall.
- Breadcrumb: the JSON-LD listed `"item":"/"`, which a crawler cannot resolve. The current page differed from a link by colour alone. A blank label was a nameless 24 x 24 link that failed axe.
- Avatar: next/image had no way in. `aria-label` on a span with no role fails axe (`aria-prohibited-attr`). A failed image printed its alt over the initials. Under forced colours the circle was 1:1 against the page.
- AvatarGroup: a long group made a 320 px page 1048 px wide. `+12,345` at `xs` lost 76 px of ink to the circle. At `xs` the overlap covered 4.5 of the 17 px of the initials.
- Tag: `<Tag><strong>` with 300 characters put a 2319 px child in a 182 px tag and the page at 2341 px. Without `shrink-0` a row crushed a 55 px tag to 36.
- Rating: its editing half is client code, and the client template is settled by Unit 3's first overlay, not before.

**Affects.** PLAN 6.6 for Unit 2. R-5.2-1 (the forced-colours exception, to be written into `docs/RULES.md` with the lint). R-5.7-4 in use for the first time on a server component (`link`, `AvatarImage render`). docs/CLOUD-PLAN.md Appendix A: Rating leaves Unit 2 for Unit 3, and the line that Table and Timeline use `useCollection` is not true yet. `src/tokens.css`, `src/styles.css` and `src/shared/labels`. Open and planned, not decided here: the focus ring under forced colours, Arabic-Indic digits in a Server Component, the README import line of a part family, an emoji-safe label cut, and one mutation file per component.

## 2026-10-07 - Unit 1 is built from docs/figma/unit-1.md, and where it leaves the drawing the file says so

**Decision.** The session that builds Unit 1 has no Figma access, so the design of its ten components is written out in `docs/figma/unit-1.md`: the facts read from the file, and a **Build this** block per component that fixes its parts, props, defaults and classes. When sources disagree the order is the rules in CLAUDE.md, this file, the Build this block, the catalog row and the Unit 1 table, a bound Figma variable, a raw Figma number, and last a prop name in a docs playground. The Build this blocks are adopted as written. The larger changes from the drawing or from the recipe, one line each; the Not built and For the reviewer lines of each block hold the rest:

- Radii stay on the formulas in `src/styles.css`, so in Ocean a chip is 8 px and a box 24 px where Figma has 100 and 28.
- Text uses the type steps with their own line heights, not the Auto line height of the drawings, so no drawn height is a target.
- Badge defaults to `soft`, which the docs playground and every drawing of a single Badge show (the variant grids draw all three), not to the first cell of the Figma set. It carries a border on every variant, and its xl type step is `text-lg` as Figma and PLAN 5.2 say, while Button's xl stays `text-base` until that is decided.
- Alert has no dismiss button and no opacity on its description. Kbd, Card and Separator are built without the states, the media part and the label that are drawn.
- Progress xs is 2 px from the token, not the drawn 4.
- None of the nine server components takes `render`, which narrows the 2026-10-05 line "This is the shape all 46 components will use" to the components that take it.
- A decision made in a component branch, and anything R-0-1 asks to be recorded, is written in the pull request under Decisions. The local session copies it here when the unit merges, so ten branches never edit this file at once.

**Why.** PLAN 6.6 says the Figma frame wins and that every intentional divergence is recorded here. It also asks that a deliberate change is made in Figma first; it is not, because the session cannot write to Figma, so the drawings stay as they are until Omar rules on the twelve choices. The Figma file contradicts itself or the code in more than forty places, so "the frame wins" alone would stop the session on the first component, and mapping a raw number to "the nearest token" would have it write classes the lint rejects, such as `h-1` and `rounded-full`. A second pass re-read every node: 535 statements held, 18 were wrong and are corrected, and 62 missing facts were added. Most of the changes above keep a gate green - contrast, the lint, the server boundary - or keep a catalog row from growing; the Badge default and its xl step follow the stronger evidence.

**Affects.** PLAN 6.6 for Unit 1, R-0-1 in where its record is first written, and docs/CLOUD-PLAN.md sections 1, 3 to 6 and 8 to 12 with Appendices A and C, which now point at the file. The twelve choices that are Omar's to revisit are the table at the end of `docs/figma/unit-1.md`; changing one is a small pull request.

## 2026-10-07 - Defaults stay in constants.ts; boundaries.ts holds bounds, and only when there are any

**Decision.** `<NAME>_DEFAULTS` lives in `constants.ts` beside the value lists. `boundaries.ts` holds `<NAME>_BOUNDARIES` and nothing else, and a component with nothing to bound has no `boundaries.ts` at all. This corrects the entry below of the same date, "Defaults and bounds move out of constants.ts into boundaries.ts", in the one point where it says the defaults move.

**Why.** That entry was written before the split was finished. What shipped, and what R-8.3-6, Button and `pnpm new:component` all do, is defaults in `constants.ts`: a default is what the component does when asked for nothing, a bound is what it refuses whatever it is asked, and the file a reviewer opens to check the guard rails should hold only guard rails. Two texts that disagree are worse than either, and a new session reads both. On the missing file: R-8.3-6 said every folder has a `boundaries.ts`, but `icon`, `svg` and `icon-registry` have none and `check-structure` does not ask for one, and an empty table would be a file that exists for nothing, which R-8.1-1 forbids.

**Affects.** R-8.3-6, reworded in the same change: a component that enforces a bound has the file, and one with nothing to bound does not. docs/CLOUD-PLAN.md section 8 step 5, corrected with it.

## 2026-10-07 - The site's 46 is the build list, server set first

**Decision.** The 46 components the home page advertises are what v0.1 builds, in the five
units of Appendix A in docs/CLOUD-PLAN.md: the server set first, Tooltip as the first
client component, then the overlays, then the Phase 4 form controls. PLAN.md section 18
stays as the long-term catalog, and its extras - Heading, Text, Container, Stack, Grid -
are reconsidered only after the 46 ship.

**Why.** Two reasons, and they point the same way. The catalog and the site disagree: the
catalog lists components the home page never promises, so building them first would delay
what a reader was told to expect. And no component has a client.tsx yet, so the client
half of the folder contract is described by R-5.12-1 and checked by check-boundaries but
proven by nothing; Phase 4 is almost entirely client components, which would mean
inventing the client template, the Field architecture and the Base UI Field integration at
volume and in parallel. The server set copies Button exactly, so it is quantity rather
than design, and it re-proves the template before the second one is written.

**Affects.** PLAN.md section 19 phase order and section 18's priority. Every Definition of
Done line and every acceptance criterion is unchanged, and Phase 4's own criteria still
gate the form controls when Unit 4 reaches them.

## 2026-10-07 - `zod/mini` may run in a client file; the full build still never ships

**Decision.** R-8.3-1 is relaxed. A client file (`client.tsx`, `hook.ts`, `lib.ts`) may `import * as z from 'zod/mini'` at runtime for layer-2 validation. `schema.ts` is still imported with `import type` only, the full `zod` build still never reaches the browser, and a Server Component may import neither. The guard in `src/shared/no-zod-at-runtime.test.ts` now reads the exact specifier rather than the package name, because `packageName()` collapsed `zod/mini` to `zod`.

**Why.** Measured with esbuild, minified and gzipped, for one `z.string().max(100)`: the full build is 89 KB and `zod/mini` is 3.4 KB. The earlier rule assumed one number for both. Validation needs three layers and the library owns two of them: `maxLength` on the input stops typing, but not a paste, not `input.value = ...` and not a DevTools edit, so a client control needs a real check in JavaScript. 3.4 KB buys that. 89 KB does not, and the server half still costs nothing either way.

**Affects.** R-8.3-1. No component uses it yet - Button is server-only and no input exists - so the validator itself is written with the first client control rather than invented ahead of it.

## 2026-10-07 - Defaults and bounds move out of constants.ts into boundaries.ts

*Corrected the same day: the defaults stayed in `constants.ts`. See "Defaults stay in constants.ts" above.*

**Decision.** A new file joins the folder contract: `boundaries.ts`, holding `<NAME>_DEFAULTS` and `<NAME>_BOUNDARIES`. `constants.ts` keeps the `as const` value lists and nothing else. `schema.ts`, `variants.ts` and the component import the defaults from `boundaries.ts`. `pnpm new:component` writes it, and `check-structure` allows it. A team overrides any default by passing the prop.

**Why.** PLAN.md 8.1 put the value lists, the limits and the defaults in one file. In practice the defaults are the only part a consuming team reads: they are the answer to "what happens if I pass nothing, and what may I change". Mixed in with twenty lines of value lists they read as constants rather than as choices. The split also keeps `R-5.7-8` honest, because the default cap a text field inherits is now visible in one short file per component rather than buried.

**Affects.** PLAN.md 8.1 and the new R-8.3-6; R-8.3-2 narrowed to the value lists. The scaffold also gained `classes.ts`, because R-5.12-4 now rejects the `ON_SOLID` and `ON_SOFT` tables it used to write into `variants.ts` - which means `pnpm new:component` had been producing a folder that failed its own gate since that rule landed.

## 2026-10-07 - Every text field has a default maxLength, set high enough never to cut real input

**Decision.** `shared/contracts/boundaries.ts` holds `TEXT_MAX_LENGTH`, a default character cap per input type: text 512, email 254, url 2048, tel 32, search 256, password 256, textarea 5000. `resolveMaxLength(given, type)` is the single implementation every input component calls: it takes the caller's number when there is one, falls back to the type's default, and returns `undefined` for an explicit `null`, which is the documented opt-out. A counter appears at `COUNTER_THRESHOLD` (0.9) of the cap. A number field never uses a length cap at all; it is bounded by `min`, `max` and `step`.

**Why.** An earlier version of R-5.7-8 said the opposite - that `maxLength` should have no default, because a default truncates data. That reasoning was about a single field in a single app. In a design system used by several teams, no default means each team picks a different number and one team forgets entirely, which is how an unbounded field reaches production. The default exists for the developer who never considered the case. The objection still holds for a *low* default, so every number here sits far above the longest real value of its type: the RFC 5321 maximum address, a 2048-character URL, a 72-character bcrypt password and a 2000-word review all fit, while a one-megabyte paste is stopped for every type.

**Affects.** R-5.7-8, rewritten. Every input component of PLAN 18.4, none of which exists yet, so nothing has to be retrofitted. `src/shared/contracts/boundaries.test.ts` proves each cap clears the longest real value of its type and still stops a pasted file.

## 2026-10-07 - A long label truncates the control, and a limit never truncates data

**Decision.** Two rules, R-5.2-7 and R-5.7-8. A control that renders caller-supplied text carries `CONTAIN` (`max-w-full`) and wraps the text parts of its children in a span carrying `LABEL` (`truncate min-w-0`); element children are left alone so an icon keeps its own flex slot. Separately: numeric and structural props get a default limit that is clamped and overridable, while `maxLength` and `minLength` get no default at all, and a number field limits with `min`, `max` and `step`.

**Why.** Measured in Chromium: a Button with a 60-character label was 436px wide inside a 200px box and escaped it. The obvious fix does not work - `truncate` on the control itself clips with no ellipsis, because a bare string inside `inline-flex` is an anonymous flex item and `text-overflow` never applies to one. The label needs an element of its own, and only the text parts can be wrapped, or the gap between an icon and its label collapses. On limits: a bad number or an unbounded row count breaks the UI, so a default is a safety net; a default character cap silently truncates a name, an address or a pasted token, which is data loss the caller never asked for and which no browser does either.

**Affects.** PLAN.md 5.2 and 5.7, every component that renders a label. `e2e/contain.spec.ts` measures the control against its container in three modes and both directions, and the six tests fail if `CONTAIN` is emptied. Tooltip moves into Unit 1 of docs/CLOUD-PLAN.md so the truncated text has somewhere to be read in full.

## 2026-10-06 - Every component carries a generated README.md

**Decision.** A new file joins the folder contract: `README.md`, written by `pnpm readme:build` from `schema.ts` (types, enums, defaults, limits, descriptions), `types.ts` (which props the component declares and whether each is required) and `meta.ts` (category, tier, status, rendering cost, Base UI range). Prose lives between `<!-- hand-written -->` markers and survives every regeneration. `pnpm check:readme` is in `pnpm check` and fails when a README is stale, `check-structure` requires the file, and `pnpm new:component` generates it so a scaffolded folder still passes clean.

**Why.** The first thing anyone asks of a component - a person or an assistant reading the repo - is whether a prop is optional or mandatory and what its default is. Answering that from the source means reading `types.ts`, `schema.ts` and `constants.ts` together. A hand-written table would answer it immediately and would be wrong within a week, which is worse than no table. Generating it means it cannot disagree with the code: the required flag comes from the TypeScript checker, walking every branch of the props union and marking a prop required only when every branch requires it, and the defaults and limits come from the Zod schema through `z.toJSONSchema`.

**Affects.** PLAN.md 8.1 lists the files a component folder may hold and did not include `README.md`; R-8.1-1 and the new R-8.1-3 now do. R-8.3-3 still stands for the docs site's props table, which is a different output from the same two sources.

## 2026-10-06 - A disabled `render={<a>}` loses its `href`; a component element keeps it

**Decision.** When `disabled` or `loading` is set and `render` is an intrinsic `<a>`, Button removes the `href` and adds `role="link"`. When `render` is a component element, such as `next/link`, the `href` stays and only `aria-disabled` and `tabIndex={-1}` apply.

**Why.** ARIA 1.2 asks that a disabled control cannot be activated. `pointer-events: none` stops a real pointer but not `Enter` or `HTMLElement.click()`, and a Server Component has no event handler to cancel with - Base UI's `useButton` needs `onClick` plus `preventDefault` for the same job. Dropping the `href` is the only server-side stop. It is not applied to a component element because `href` is a required prop of `next/link`, so removing it would crash the component rather than disable it. `role="link"` is needed because an `<a>` with no `href` exposes no role, which would leave `aria-disabled` unannounced.

**Affects.** R-5.6-1, PLAN.md 8.4. Guidance for consumers: do not disable a navigation link - hide it, or render a real button.

## 2026-10-06 - `LOADING` drops the progress cursor PLAN.md asks for

**Decision.** `LOADING` is `aria-busy:opacity-100 data-loading:pointer-events-none`. The `cursor-progress` half of PLAN.md 5.2 and 8.4 is gone.

**Why.** A loading control is always `pointer-events: none`: a native button gets the `disabled` attribute, which `DISABLED` pairs with `disabled:pointer-events-none`, and anything else gets `data-loading:pointer-events-none`. An element that is not a hit target takes its cursor from an ancestor, so `cursor: progress` could never paint in either case. Keeping the pointer block matters more than the cursor, because dropping it would let `hover:` repaint a disabled control. `src/cascade.test.ts` now fails if the cursor comes back.

**Affects.** PLAN.md 5.2 and 8.4, R-5.2-4. If the progress cursor is wanted later, the pointer block has to be replaced by `not-disabled:hover:` guards on `HOVER`, which is a change to every component.

## 2026-10-06 - The emitted order of two same-property utilities is pinned by a test

**Decision.** `src/cascade.test.ts` asserts that Tailwind emits `aria-busy:opacity-100` after `disabled:opacity-50` and `data-disabled:opacity-50` after both.

**Why.** Both are the `opacity` utility under different variants, so they carry the same specificity and the emitted order is the only thing that decides. Every test we had asserted the class was in the `class` attribute, which says nothing about which one the browser takes. A Tailwind variant-order change would silently make a loading button look disabled.

**Affects.** R-5.2-4, R-4-1.

## 2026-10-05 - The guarantees get gates: a lint rule, a mutation runner, and a real browser

**Decision.** Five weaknesses that no reviewer raised, because they are about the shape of the project rather than its code. Each is now enforced rather than remembered.

1. **The mistake that caught me seven times is an ESLint rule.** `topclass/no-derived-expectations` is the eighth custom rule: inside a `*.test.ts(x)` file, the expectation side of `toEqual`, `toContain`, `toHaveLength`, `toBe` and `toStrictEqual` may not be `CONSTANT.split(' ')`, `Object.keys/values/entries(CONSTANT)` of an imported binding, or `readdirSync(...)`. A local fixture built in the test file is fine; so is splitting the value under test on the *actual* side. It found a real instance the moment it was switched on - `button.schema.test.ts` compared the schema's keys against `Object.keys(BUTTON_DEFAULTS)`, so dropping a design prop would have dropped it from both sides. Twelve fixture tests, seven rejected forms and five allowed ones.

2. **`check-structure` now requires `meta.ts` and at least one test** in every component folder, which PLAN 8.1 lists as required and nothing enforced. Turning it on failed immediately: **`svg` is a tier-1 catalog row and had no test of its own** - it was covered only incidentally by Icon's tests. It now has 19, including the empty-path case, the labelled and decorative branches, and the directional flip. `icon`, `svg` and `icon-registry` gained the `meta.ts` they were missing; `icon-registry` is honestly `rendering: 'client'`, and the contract test's rendering cross-check was softened to the direction that matters - a folder with `client.tsx` may not call itself `server`, because that is what would make the 0 KB claim false.

3. **`render` now decides which attributes exist.** `<Button render={<a/>} name="n" value="v" form="f" type="submit">` type-checked and rendered all four onto an anchor. `ButtonProps` is a union: the native half carries the button-only attributes, the rendered half declares each of them `?: never`, which keeps them destructurable while making them impossible to pass. Nine `expectTypeOf` cases prove both halves. This is the shape all 46 components will use.

4. **Mutation testing is `pnpm test:mutation`.** Every mutation run in this session was a throwaway script; the finding that mattered most - that a test can pass while measuring nothing - deserves a command. `scripts/mutations/index.ts` holds 30 rows, each a behaviour some test claims to protect and most of them a real survivor from this week. The runner copies the repo to a temp directory, applies one mutation, runs the suite, and fails if it still passes. It also fails when a mutation's anchor text no longer exists, because a mutation that matches nothing tests nothing - the same failure mode as the gates it guards. All 30 are caught.

5. **Playwright and axe are in, three phases early.** PLAN 19 puts them in Phase 7; that would mean 45 components finished against unmeasured promises. Five lines of PLAN 20 need a browser, and three of them can be measured today without the docs app: `scripts/build-harness.tsx` renders every demo to a static page with the real compiled stylesheet - 60 pages, 10 demos across three modes and both directions - and `e2e/` measures them. Target size is now measured on every interactive box at both pointer types rather than asserted on a class name; the focus ring is proven to paint by reading the computed outline after a real Tab; and axe runs over all 60 pages, scoped to the demo because landmarks and document structure belong to the docs app. 84 tests, all passing. `pnpm check` has a tenth gate.

**Dependencies added**, all `devDependencies`, so the published package is unchanged: `@playwright/test` with `playwright` (~19 MB) and `axe-core` with `@axe-core/playwright` (~2.4 MB). Chromium is already in the container; `playwright.config.ts` points at it with `executablePath` rather than downloading a second copy, guarded by an `existsSync` so a normal machine still works.

**Still not done, and said plainly.** The visual matrix of PLAN 20 - the screenshots compared against Figma - is not built. That needs baselines and a Figma parity decision, not just a browser. The 0 KB measurement still needs the docs app's `/preview` route. Button therefore stays `status: 'beta'`.

**Affects** `eslint-rules/`, `eslint.config.ts`, `scripts/check-structure.ts`, `scripts/{mutate.ts,mutations/,lib/mutate.ts,lib/harness.ts,build-harness.tsx}`, `playwright.config.ts`, `e2e/`, `src/components/{icon,svg,icon-registry}/meta.ts`, `src/components/svg/svg.test.tsx`, `src/components/button/types.ts`, `package.json`, `tsconfig.json` and `docs/RULES.md`.

---

## 2026-10-05 - 85 mutations against the new tests; 23 got through, and six of them were one mistake

**Decision.** The sixth reviewer attacked the rewritten tests with 85 mutations rather than reading them. 62 were caught. The 23 that survived are fixed, and all 23 were replayed against the fix before this entry was written. The kill rate was 73%; it is now 100% of what was thrown.

**The one mistake, made six times.** The previous entry says a test derived from the constant it tests shrinks when the constant does, and that the first draft of the new size test had exactly that flaw. The fix was applied to that test and nowhere else, so the same shape survived in six more places:

- `TRANSITION` could be reduced to `duration-(--tc-duration)`, or set to `transition-none`, and nothing failed. Every one of the 46 components would have stopped animating. The assertion was `constant.split(' ')`, so it shrank with the constant, and no test named the property list.
- The whole size scale could collapse onto one type step, because the "no other size's classes" test filtered a foreign class out of its own list once two sizes shared it.
- `TOGGLE_SIZE` could become `size-toggle-md` five times over: only its key set was checked, while `CONTROL_HEIGHT` beside it had a real per-size assertion.
- The skeleton could reserve `w-24` at every size, because the width half of its test counted classes where the height half compared them.
- Any four of the ten demos could be deleted, because `readdirSync` sized the loop.
- A demo could render `<div />` and pass, because the assertion was `toContain('<')`.

Each of these now names its expected value literally, beside a one-line comment saying why.

**The two that mattered most.**

1. **The 3:1 half of R-5.6-4 was unenforced.** Changing the comparison to `ratio < min + MARGIN && min > 4.4` deleted every `line-strong` and `ring` check, and the gate still reported 285 pairs, because `pairs++` ran before the comparison. `MARGIN` could be set to 0 and the 4.5 thresholds to 3 or to 1, all silently: the existing "thresholds bite" test seeded a colour so pale that it failed under any threshold, so it could not tell which one was in force. The thresholds are now exported and asserted directly, and three seeds are measured to land between the floors - 3.95 on the page (clears 3, misses 4.5), 4.00 on the danger fill, and 2.23 for the 3:1 pair.

2. **The zod guard had no positive control.** `buildGraph` could be made to stop after one hop, or to read only the entry file's own imports, and the suite stayed green - because it only ever asserts an empty result over a codebase where nothing reaches zod. Against a real two-hop violation the crippled walk found 1 of 11 files instead of 11. `buildGraph` now has a synthetic three-file chain, a cycle and an isolated file.

**Also:** `worst()` could return `contrastRange().max` instead of `.min`, undoing the gamut bracket the 3 October entry introduced, because the test that names that behaviour exercised `contrastRange` directly and never `checkTokens`; it now seeds a colour measured at min 4.15 / max 5.68 against `success-soft`, which fails only while the low end is taken. `meta.ts` could change its category, rendering, name, tier or status freely, since every field but `slug` was checked only for membership in its own list; the shared test now derives the name from the slug, cross-checks `rendering` against whether `client.tsx` exists and refuses `status: 'stable'` while PLAN 20 is open, and Button pins its own row value by value. `inline-flex`, `items-center`, `justify-center`, `gap-2`, `font-medium` and the skeleton's `animate-pulse` had no assertion anywhere - the last one making "respects reduced motion" pass vacuously, since nothing was animating. And `vitest.config.ts` could drop a project's `exclude` while `test-projects.test.ts` still proved the data symmetric, so a test now compares the config's entries against that data.

**Affects** `src/shared/classes.test.ts`, `src/shared/meta.test.ts`, `src/components/button/test/`, `scripts/lib/{contrast-checks,module-graph,test-projects}.test.ts`, `scripts/lib/contrast-checks.ts` (the thresholds are exported).

---

## 2026-10-05 - Six parallel reviewers find two holes in the gates that had just been written

**Decision.** The 28 fixes above were themselves reviewed across six dimensions in parallel, each reviewer working in its own copy of the repo and required to reproduce a finding before reporting it. They found 2 high, 11 medium and 9 low. Everything below is fixed, and every attack was replayed against the fix.

**Two high, both in gates written hours earlier.**

1. **A comment on the same line as an import defeated the zod guard.** `/* R-8.3-1 */ import { z } from 'zod'` passed all nine gates, because the patterns were anchored with `^[ \t]*`. So did `;import ...`, a second `import` later on the same line, and a backtick specifier. The scanner now blanks comments first (preserving length, so a commented-out import cannot hide a real one behind it) and matches unanchored on a word boundary. `scripts/lib/module-graph.test.ts` holds all nineteen forms as a table, plus the type-only non-matches.

2. **`import { z } from 'zod/v4'` walked straight in**, because the guard compared the raw specifier against the string `zod` while `zod@4.6.5` really exports `./v4`. Specifiers are now reduced to a package name (`zod/v4`, `zod/mini` and `zod?raw` all to `zod`, with both segments kept for a scoped package).

**The rest.**

3. **The ramp check was chained but not anchored**, so a state that stepped away and back passed: `--tc-primary-active: var(--tc-primary-solid)` reported ok in all three modes, meaning a pressed button painting its resting colour. Both ramps now require a step from the base as well as from the state before.

4. **A tone's text at rest was never measured against a bare surface** - which is exactly where `outline`, `ghost` and `link` labels sit, since they have no fill. 54 pairs were missing; all pass, the worst at 5.23 in dark. The gate now measures 339 pairs.

5. **"285 pairs measured" was 285 calls, not 285 measurements.** `--tc-page` and `--tc-surface-raised` are the same colour in light and ocean, and 47 of the 55 tokens the gate reads are identical in those two modes, so 42% of the readings were duplicates. This is the project's own documented failure mode - a number reported as evidence - so the gate now prints both: `339 pairs, 205 distinct colour readings`.

6. **The RTL demo rendered Arabic without `lang`**, so `:lang(ar)` set neither the Arabic font nor the `letter-spacing: 0` reset that R-5.3-3 exists to guarantee. Demos are the docs code tab and the visual baselines, so this would have shipped as the example people copy.

7. **`min-h-(--tc-target-min)` removes the floor entirely if the token is missing**, because an unresolved `var()` is invalid at computed-value time and `min-height` falls back to its initial value. PLAN 6.1 lets a consumer replace the whole token file, so the classes now carry the px fallback: `min-h-[var(--tc-target-min,24px)]`.

8. **A fifth Vitest project would have been silently double-run**, because each project's `exclude` was hand-written. Excludes are now derived from the `SUFFIXES` map, the config is built by mapping over the projects rather than destructuring them positionally, and the test derives its table from the same map - reproduced by adding an `edge` project, which the old test passed and the new one fails.

9. **Nothing gated the schema descriptions** the previous entry had just added: no file called `z.toJSONSchema`, so a field with no `.meta()` kept `pnpm check` green. `button.schema.test.ts` now asserts a description and the `constants.ts` default for every field.

10. **The scaffold still wrote the old shape.** `pnpm new:component` emitted a schema with no descriptions, `z.enum(SIZES)` instead of the shared `sizeSchema`, and a hand-written `DesignProps` interface rather than one derived from the schema - handing all 45 later components the drift this branch exists to remove.

11. **Smaller, all confirmed:** `render={null}` threw a raw `TypeError` instead of falling back to a button, because line 37 used `=== undefined` while line 39 used `??`; `buttonVariants` silently dropped a `className` that the old cva export appended; `ButtonSkeleton` let a consumer set `aria-hidden={false}` on a decorative placeholder, because the spread came after it; the hydration test hard-coded eight demos and so never hydrated the two new ones; `layerOf` in `styles.test.ts` was a brace counter that one `content: "{"` would desync; the touch-target assertion in the same file was satisfied by the width classes alone; and `docs/STATUS.md` overstated its own test count, Button's test-file count, and what the meta contract validates.

**Rejected.** Using `es-module-lexer` for the import scan, as one reviewer suggested: it is in `node_modules` only as a transitive dependency of Vite, and R-5.9-1 does not permit reaching for an undeclared package.

**Still open, for Omar.** `ButtonProps` extends `ComponentPropsWithRef<'button'>`, so `name`, `value` and `form` typecheck and render on `render={<a/>}`. That is inherent to the element-form `render` API and wants one decision for all 46 components, not a patch here.

**Affects** `scripts/lib/{module-graph,test-projects,contrast-checks,scaffold}.ts` and their tests, `scripts/check-contrast.ts`, `vitest.config.ts`, `src/shared/{classes,meta}.ts`, `src/shared/classes.test.ts`, `src/components/button/{index.tsx,types.ts,skeleton.tsx,variants.ts}`, `src/components/button/test/`, `src/components/button/dummy/rtl.tsx`, `src/styles.test.ts`, `src/test/`, `docs/RULES.md` and `docs/STATUS.md`.

---

## 2026-10-05 - The Button template closes its last 28 findings, most of them tests that proved nothing

**Decision.** Every finding the 83-agent Button review left open is fixed on `feat/button`, because Button is the file 45 components copy and a weak test shape copied 45 times costs more than the component did. Each fix below was proved by mutation: the defect was reintroduced, the suite was run, and the failure was recorded. Eighteen mutations, eighteen failures.

**Two were real misbehaviour, not coverage.**

1. **A tone lost to the theme on the same element.** The five interaction variables (`--tc-soft`, `--tc-hover`, `--tc-active`, `--tc-soft-hover`, `--tc-soft-active`) were declared in an unlayered `:root, [data-theme]` block. CSS Cascade 5 puts unlayered normal declarations above every layer, and the `tone-*` utilities are emitted inside `@layer utilities`, so `<div data-theme="dark" class="tone-danger">` resolved to the *primary* ramp. Verified by compiling the real entry and reading the layer each declaration lands in. The five declarations now sit in `@layer base`, which `@layer utilities` outranks; the `color-mix` definitions above them stay unlayered, because nothing overrides those.

2. **`loading` rendered no spinner when the render element carried its own children.** `renderElement` applied the component's children only when the element had none, so `<Button render={<a>Go</a>} loading>` dropped the spinner with them. The shared answer for every component that composes its own content with the consumer's is a third argument: `renderElement(element, props, decorate)` wraps whichever children survive. Button passes it only while loading, so the output is byte-identical otherwise.

**The rest were contracts and tests.**

3. **`meta.ts` had no contract.** `ComponentMeta` and `src/shared/meta.ts` were named by PLAN 8.4 and existed nowhere, so 46 hand-written `as const` objects would have drifted before anything read them. `shared/meta.ts` now declares the type plus the `CATEGORIES`, `RENDERINGS`, `STATUSES` and `TIERS` lists; Button's file is `satisfies ComponentMeta` and its keys go back to the plan's names (`baseUi`, `baseUiRange`, lower-case `category`, with `slug` restored). Its `status` is **`beta`, not `stable`**: PLAN 20 is not met while the visual matrix and the docs page do not exist. A test walks every `meta.ts` in `src/components/` and checks the slug against the folder name. The scaffold writes the same shape with a `TODO(tc)` on the category.

4. **`buttonVariants` was a trap and a cost.** PLAN 8.1 exports it so a plain element can reuse the look, but its raw output carried two or three conflicting border declarations that only the component's own `cn()` resolved, and its cva signature admitted `null` where the component's props did not. Each variant now names its own border colour, so the string is conflict-free by construction, and the export is a typed function over `ButtonVariantProps` that memoises its 360 outcomes. Measured in one process on one machine: **12.26 us/call before, 0.32 us/call after**, a 38x difference on what was the largest single cost of rendering a Button.

5. **The 24 px touch floor was not 24 px.** `min-h-6` compiles to `1.5rem`, and SC 2.5.8 is written in CSS px, so a consumer stylesheet with `html { font-size: 14px }` dropped the floor to 21 px. `--tc-target-min: 24px` and `--tc-target-coarse: 44px` are new tokens and `TOUCH_TARGET` reads them.

6. **`tone-*` was not a tailwind-merge group**, so `cn('tone-primary', 'tone-danger')` kept both and stylesheet order decided the winner - an override that worked for two tones of six. It is now its own group, which needed `extendTailwindMerge<'tone'>` to declare the id.

7. **The contrast gate measured the solid ramp's readability but not its motion.** Setting any `--tc-<tone>-hover` to its own `-solid` passed. The solid ramp now gets the same `STATE_STEP` check the soft ramp already had, which took the gate from 249 to **285 pairs**, and the mutation that used to pass now fails in all three modes.

8. **The zod guard caught one of seven ways in.** It was a per-file regex for a direct `import ... from 'zod'`, while the failure mode is transitive: `types.ts` importing `schema.ts` as a value ships 104 KB to the browser. `scripts/lib/module-graph.ts` now walks the value-import graph across relative and `#` subpath specifiers, covering bare `import 'zod'`, `export ... from`, dynamic `import()` and `require()`. Both previously-missed mutations were reproduced and now fail.

9. **A `*.ssr.test.ts` file would have run twice.** The node project excluded `.ssr.test.tsx` but not `.ssr.test.ts`, and `.rsc.test.ts` but not `.rsc.test.tsx`. The four projects now come from `scripts/lib/test-projects.ts`, which `vitest.config.ts` reads, and a test asserts every test file in `src/` lands in exactly one project.

10. **Nine test shapes that would have been copied 45 times.** The per-variant loop asserted `inline-flex`, a base class, for every variant; 17 of 30 variant x tone cells had no assertion; the size loop measured height and not padding or the type step; the `link` variant could emit nothing; the spinner's identity and its position before the label were untested; the shared-constant block was a five-string spot check that four half-copies passed; the skeleton test asserted a string against itself rather than against `CONTROL_HEIGHT`; nothing rendered the eight demos; and two test names claimed checks their bodies did not make. Each is replaced by a table named independently of the thing it measures, which is the point: **a test derived from the constant it tests shrinks when the constant does.** The first version of the new size test had exactly that flaw and the mutation run caught it.

**Also:** `CONTROL_HEIGHT` is split out of `CONTROL_SIZE` so a skeleton reads the control's height instead of copying it; `ButtonSkeleton` takes `ref`, `style` and the rest props that PLAN 20 requires of every component, and its defaults come from `BUTTON_DEFAULTS`; `buttonSchema` carries a `.meta({ description })` per field and uses the shared `sizeSchema`, which nothing had imported; `#test/*` is a new subpath so the three markup helpers live once rather than in 46 test folders; and `dummy/` gains a `custom` size demo and an RTL demo, with the tone demo widened to outline, ghost and link.

**Not done, and why.** `icon` and `svg` are catalog rows (PLAN 18.2) with no `meta.ts`; `check-structure` still does not require the file, because making it mandatory would also demand one for `icon-registry`, which is an entry point rather than a catalog row. That is a folder-contract decision for Phase 4, not a Button fix.

**Affects** `src/tokens.css`, `src/styles.css`, `src/styles.test.ts`, `src/shared/{classes,cn,render,meta}.ts`, `src/shared/{classes,meta,no-zod-at-runtime}.test.ts`, `src/components/button/` in full, `scripts/lib/{contrast-checks,module-graph,test-projects,scaffold}.ts`, `vitest.config.ts`, `test/markup.ts` and `package.json`.

---

## 2026-10-05 - The review backlog, including two crashes and a production-only divergence

**Decision.** Eight more findings from the 5 October review are fixed. Two of them crashed, one behaved differently in production than in development, and one module cited by a rule as unit-tested had no test file at all.

1. **A label override containing an explicit `undefined` crashed at render.** `{ ...base.common, ...overrides.common }` writes `undefined` over the default, so `{ common: { close: undefined } }` - which any object built from optional props produces - left a label missing. The groups are still spelled out one by one, so a new group fails to compile, but each is merged by a helper that skips `undefined`.

2. **An invalid locale tag took the whole tree down.** `getLabels` accepts any string, and `new Intl.NumberFormat('en_US')` throws `RangeError` on the POSIX form. `createNumberFormat` now tries the tag, then its language subtag, then `en`, and `getLabels` reads the language across `-` or `_`.

3. **`renderElement` silently dropped a ref.** When the render element carried its own ref, the component's ref was discarded, so `<Button render={<Link ref={mine} />}>` left the component unable to see its own root. Both refs are composed now, including the React 19 cleanup form, and an object ref is cleared on unmount. The old test asserted the element's ref *won*, which encoded the defect; it now asserts composition.

4. **`useControllableState` behaved differently in production.** The controlled-or-uncontrolled ref was only refreshed inside the `NODE_ENV !== 'production'` branch, so a production build kept the mount-time value forever while development followed the switch. The ref is updated unconditionally and only the warning is dev-only.

5. **The theme script set no mode at all when storage was blocked.** One `try` wrapped everything, so a `localStorage` read that throws - Safari private mode, blocked site data - skipped the `prefers-color-scheme` fallback entirely and left `data-theme` unset, giving a dark-preferring reader a light page. The read now has its own `try`, so a storage failure still falls through to the media query.

6. **`clampToStep` drifted.** `min + steps * step` makes `0.1 + 2 * 0.1` render as `0.30000000000000004` in the DOM. The result is rounded to the decimal places that `min` and `step` are written with.

7. **`DISABLED` only styled `:disabled`.** R-5.7-6 marks anything that is not a real form control with `data-disabled`, so a disabled anchor or div had no disabled styling at all. It now carries both.

8. **The duplicate-key warning fired on every scroll**, because it sat inside a memo that recomputes per scroll position. It is now warned once per key.

**Also:** `clamp.ts` had no test file, while R-5.7-7 names a unit test as its enforcement - the same class of gap as the 23 rules corrected earlier the same day. It now has twelve tests, covering `NaN`, both infinities, an inverted range, a zero-width range, a non-finite step, and the cases where the last step would overshoot `max`.

**Rejected after trying it.** Caching one `MediaQueryList` per query in `useAdaptiveMode` broke three adaptive tests, because a module-level cache outlives a stubbed `matchMedia` and silently serves the first test's object to every later one. Making the hook untestable is not worth saving a `matchMedia` call, so only the useful half was kept: when the mode is forced the hook no longer subscribes to a query it never reads.

**Affects** `src/shared/labels/get-labels.ts`, `src/shared/render.ts`, `src/shared/use-controllable-state.ts`, `src/shared/theme/script.ts`, `src/shared/clamp.ts`, `src/shared/classes.ts`, `src/shared/collection/use-collection.ts`, `src/shared/adaptive/use-adaptive-mode.ts` and their tests.

---

## 2026-10-05 - What a 113-agent review found, and the rule file stops overstating itself

**Decision.** Everything below was found by adversarially reviewing the repo against itself, confirmed by reproducing it, and fixed with a test that fails if the fix is reverted. 74 findings were confirmed and 34 refuted; the seven rated high are all fixed.

1. **The focus ring painted nothing, anywhere.** `FOCUS_RING` paired `outline-none` with `focus-visible:outline-(length:--tc-ring-width)`. Tailwind v4 compiles the first to `--tw-outline-style: none` unconditionally and the second to `outline-style: var(--tw-outline-style)`, so on `:focus-visible` the style resolved to `none`: correct width, correct colour, correct offset, nothing drawn. Measured in a real browser over a real Tab keypress: 0 ring-coloured pixels before, 592 after. R-5.6-1 promises a visible ring on every interactive element, and it was false for all 46 components before one existed. It now reads `outline-none focus-visible:outline-solid ...`. (It first read `outline-hidden`; under forced colours that painted a 2 px outline on every control at rest, so Unit 3 went back to `outline-none`.)

2. **Six holes in the lint rules**, each now covered by a fixture test: a negative physical utility (`-ml-2`), `float-left` and `clear-right`, the fixed colours `bg-white` and `text-black`, a palette colour or a `dark:` or `hover:` behind another variant (`md:dark:`, `md:hover:`), `border-2` which R-5.2-4 names explicitly, and Tailwind v4's `rounded-xs` and `rounded-4xl`. **`bg-transparent`, `fill-current` and `text-inherit` are deliberately still allowed**, against the reviewer's recommendation: they carry no fixed colour and behave correctly in every mode, so banning them would be a false positive.

3. **CI was red.** The "Line endings are LF" step rejected anything not reporting `i/lf`, and the 84 Phosphor SVGs had no trailing newline, so git reported `i/none` for all of them. The step also would have failed on any `.bat` or `.cmd` file, which `.gitattributes` deliberately marks `eol=crlf`. The SVGs gained a trailing newline and the step now fails only on `crlf` or `mixed`, honouring a declared `eol=crlf`.

4. **Three defects in `useCollection`.** The scroll listener and the ResizeObserver were bound inside an effect keyed on `[virtualized]` while the node came from a ref, so replacing the container left both bound to a detached node and windowing froze; the container is now state and the effect rebinds. Paging asked `count - end <= threshold`, which for an unvirtualized list is always `0 <= threshold`, so a short list with `hasMore` fetched page after page on mount - an infinite fetch loop against an endless feed; it now also requires a measured scroll position within reach of the bottom, and an unmeasured container still allows the ask so the documented once-per-page contract is unchanged. Row measurement copied the whole `Map` per measured row, which is quadratic in rows scrolled past - about 50 million entry copies over a 10,000-row list; the map is now mutated behind a version counter, which React batches into one render per pass.

5. **The rule file stops claiming enforcement it does not have.** Cross-referencing every rule id against every file that could enforce it showed **23 rules naming a mechanism that does not exist**, and several more crediting the wrong one. 27 `Enforced by:` lines were rewritten to the truth, in a vocabulary that now distinguishes three states: enforced today, `manual`, and `not yet - planned: X`. Nothing that depends on Playwright, axe, publint, attw or the docs build claims to be enforced, because none of those are in the repo. R-8.3-5 credited `no-restricted-syntax` when the work is done by the custom `topclass/no-enum`. R-4-2 was genuinely enforced but its failure message did not name the rule, so it now does. **This matters more than it looks:** the project's pitch is that its rules are enforced rather than documented, and a third of them were documentation wearing an enforcement label.

6. **Three rule texts still described decisions that had been reversed.** R-8.3-1 called `zod` a required peer when the 2 October decision made it a direct dependency; R-8.1-1 named `states.tsx` and `demos/`, both of which `check-structure` rejects in favour of `empty-state.tsx`, `error-state.tsx` and `dummy/`; R-5.9-1 listed the three scoped packages and `@topclassui/tokens` as peers. The Commands block listed four scripts that do not exist (`test:visual`, `test:e2e`, `size`, `new:component`) and omitted every gate that does; it now lists the real ones and names the missing four as not built yet.

**Also fixed, from the same review:** `check-boundaries` could not see `import 'server-only'` - the bare form, which is the only form the one allowed file uses - because every predicate was anchored on `from`; it now reads bare, namespace, re-export, dynamic and `require` forms, and the `server-only` and loader-map checks apply to every file rather than only `index.tsx`. The `icon-loaders-stay-server` ESLint rule visited only `ImportDeclaration`, so five other ways in were silent.

**One defect was invisible in a diff.** `check-structure`'s R-8.3-4 check never fired once: a heredoc had written a literal backspace byte (0x08) where the source said `\b`, so the pattern required a backspace after "Props" and could never match. The check had been dead since the moment it was written, while reporting success. A test now walks every text file in the repo and fails on any control byte or BOM, because this class of bug had already struck twice.

**Affects** `src/shared/classes.ts`, `src/shared/collection/use-collection.ts`, `eslint-rules/index.ts`, `scripts/check-boundaries.ts`, `scripts/check-structure.ts`, `scripts/check-css.ts`, `scripts/lib/source-checks.ts`, `.github/workflows/ci.yml`, `raw/*.svg`, `docs/RULES.md` and the generated rule files, and `docs/STATUS.md`.

---

## 2026-10-03 - Phase 2, icons: one renderer, and the loader map physically out of reach

**Decision.** The 84 starter icons ship as one generated module each, with a single rendering path and eight departures from PLAN.md section 7 recorded below.

1. **`server-only` is a new dependency.** It is two files and under a kilobyte, it is published by the React team, and PLAN 7.3 and R-5.1-5 both require `import 'server-only'`. R-5.9-1 does not list it, so this entry is the amendment. Without it, importing the async `<Icon>` from a client file fails at runtime instead of at build time.

2. **One renderer.** `<Svg icon={data}>` is the only component that emits an `<svg>`. The server `<Icon>` resolves a name and returns `<Svg>`; the browser `<Icon>` from `icon-registry` looks the name up and returns `<Svg>`. PLAN 7.3 writes the markup out twice, once per entry point, which is two places for the aria, size and flip rules to drift apart. A test asserts the registry `<Icon>` renders byte-identical markup to `<Svg>` for the same icon, and the rsc test asserts the server `<Icon>` returns a `<Svg>` element and nothing else.

3. **`loadIcon` lives in `src/components/icon/lib.ts`, not in the icons barrel.** PLAN 7.3 imports it from the icons package, but the barrel is the file a client may import for `IconName` and `DIRECTIONAL`; exporting `loadIcon` there puts `loaders.generated` on an import path a bundler can follow. Tree-shaking would probably drop it, and "probably" is not a safety property. This also makes R-7-1 literally true: the loader map is imported only inside `components/icon`. Two independent guards enforce it, a new ESLint rule `icon-loaders-stay-server` and a test that walks every source file, and a planted import was confirmed to fail both.

4. **No SVGO.** PLAN 7.2 step 2 runs SVGO to merge paths and rewrite colours. Every one of the 84 Phosphor sources is already a single `<path>` with `fill="currentColor"` and `viewBox="0 0 256 256"`, verified across the whole set, so the dependency would do nothing. Instead `readIcon` **fails** on anything with a second path, a shape element, a hard-coded colour or a different viewBox, which enforces the "one path per icon" rule in docs/icons.md rather than silently producing a broken icon.

5. **`docs/icons.md` is the parity gate.** `pnpm icons:build` fails if `raw/` and the doc's "The set" section disagree in either direction, and if the directional set derived from the patterns plus the manual list differs from the doc's own table. The doc says sixteen of the eighty-four flip; the build proves it.

6. **A loader entry resolves to the icon, not to the module.** `() => import('./data/x.js').then((m) => m.x)` rather than returning the namespace, so no data module needs a default export and the map stays explicit. Paths are `./data/<name>.js` because the modules sit in `src/icons/data/`.

7. **`SvgProps` omits `name` as well as `children`.** `SVGProps<SVGSVGElement>` already carries a `name` attribute, which would collide with the icon name; PLAN 7.3 omits it for the same reason.

8. **A fourth Vitest project, `rsc`.** PLAN 17.1 names it. It needs `ssr.resolve.conditions` **and** `ssr.resolve.externalConditions` set to `['react-server']`: `server-only` is a dependency, so Vite externalises it and Node resolves it, and the plain `resolve.conditions` never applies. With only the first, every test in the project failed to import. Async Server Components cannot be rendered by Vitest, so the test calls `Icon(props)` and asserts the element it returns.

**Deferred, with the reason.** The icons page, the `topclassui-icons add-set` CLI, the axe assertions and the Playwright "no icon requests, no icon JavaScript" measurement are not built, because the docs app, `axe-core` and Playwright do not exist in this repo yet. The static reachability test is not a substitute for a measured bundle and is not presented as one.

**Affects** `raw/` (84 files), `scripts/lib/icons.ts`, `scripts/icons-build.ts`, `src/icons/`, `src/components/{svg,icon,icon-registry}/`, `eslint-rules/index.ts`, `vitest.config.ts`, `package.json`, and the `icons:build` and `check:icons` scripts.

---

## 2026-10-03 - The checks are measured against their own blind spots, not trusted

**Decision.** Three defects found by auditing the check scripts themselves are fixed at the root, and the one judgement call is recorded rather than quietly taken.

1. **One string-aware CSS parser, `scripts/lib/css-parse.ts`, replaces both regex parsers.** The old ones were string-blind and could not nest. Measured consequences, each reproduced before the fix: writing `[data-theme="dark"]` instead of `[data-theme='dark']` made `check-contrast` print `ok (3 modes, 138 pairs measured)` while dark mode was never measured at all and light was measured three times; `@media` wrappers were discarded, so the reduced-motion block leaked `--tc-motion: 0` into light unconditionally; `content: "/*"` erased every real offence that followed it; `content: "}"` invented an offence in valid CSS; a block's last declaration was dropped if it had no trailing semicolon, leaking the light value into the mode.

2. **A mode that declares no block of its own is now a failure.** `declaredModes()` plus a guard in `checkTokens` means a renamed, misspelled or deleted mode block fails loudly instead of being silently measured with the base values. This is what makes defect 1 structurally impossible rather than merely patched, and it is covered by a test that mutates only the dark block and only the ocean block.

3. **`@property`, `@font-face`, `@counter-style` and `@font-palette-values` are exempt from R-4-1,** because a cascade layer cannot reorder their contents. Before this, declaring `--tc-dir` with `@property` - the standard next step for a custom property that gets multiplied - produced three spurious R-4-1 errors.

4. **The gamut question is answered by bracketing, not by choosing.** `gamutMap()` reduces chroma by bisection; a plain clip is the other plausible reading, and the two disagree by up to **0.1474** on the shipped tokens (worst case: dark `--tc-success-on-soft` on `--tc-success-soft`). `MARGIN` is 0.15, so the margin that existed to absorb *browser* differences was almost entirely consumed by our own choice of algorithm. Rather than pick one and hope, `contrastRange()` computes both and `check-contrast` judges the **worse** of the two, with `MARGIN` now sitting on top of that bracket. Every token still passes under the stricter measurement, so no value had to move. The alternative - adopting CSS Color 4's `css-gamut-map` - was rejected for now because it shifts all 138 ratios and cannot be verified against a real browser offline.

**Why.** A check that passes while measuring nothing is worse than no check, because it is reported as evidence. Every defect above was reproduced by mutation before being fixed, and each now has a test that fails if the fix is reverted.

**Affects** `scripts/lib/css-parse.ts` (new), `scripts/lib/css-layers.ts`, `scripts/lib/tokens.ts`, `scripts/lib/contrast-checks.ts`, `scripts/lib/color.ts` and their tests.

**Also fixed in `color.ts`**, found in the same audit: alpha was composited in linear light instead of gamma-encoded sRGB, and `contrast()` never flattened a translucent *background*, so the same pair read 1.909 one way and 21.000 the other; 50% black on white now reads 3.9767 both ways. `parseOklch` is anchored, so a wrapper like `light-dark(oklch(..), oklch(..))` no longer silently resolves to its first colour, and it now accepts percentage alpha, percentage chroma, `deg` hues and negative hues. `mixOklch` interpolates in polar Oklch with the CSS Color 4 powerless-hue rule, which is what `in oklch` means; it agreed with the old rectangular code only because every page colour has chroma 0.

---

## 2026-10-03 - Four corrections to the stylesheets as PLAN.md section 4 writes them

**Decision.** The two stylesheets ship as `src/tokens.css` and `src/styles.css`, and four things differ from the snippet in PLAN.md section 4.

1. **`@source "./shared"` is added** to the two the plan lists. `shared/classes.ts` holds the class constants every component spreads (`FOCUS_RING`, `CONTROL_SIZE`, `SCROLL_AREA`). Without the third line Tailwind never sees those strings and every focus ring, control height and scroll container renders unstyled.
2. **The safe-area utilities read `--tc-safe-*`** rather than `env(safe-area-inset-left)` directly. `env()` is physical, so the plan's `ps-safe { padding-inline-start: env(safe-area-inset-left) }` applies the left inset to the right edge of an RTL page. `tokens.css` names the four insets and swaps start and end under `[dir='rtl']`.
3. **R-4-1 is enforced by `scripts/check-css.ts`, not stylelint.** One rule does not justify stylelint and its plugin chain; the script is 40 lines, adds no dependency, and follows the pattern of the four checks already in `pnpm check`. `@utility` and `@custom-variant` are treated as layered, because Tailwind emits them into its own layers. `docs/RULES.md` is updated, so the generated rule files say `check-css`.
4. **`color-scheme` moved into `@layer base`.** It is not a custom property, so R-4-1 applies to it; it was unlayered in the first draft of `tokens.css`.

**Why.** Points 1 and 2 are correctness: the first makes the library render at all, the second is the RTL promise the library is built on. Points 3 and 4 close the gap between a rule and its enforcement.

5. **A new rule, R-4-2, is added:** every `--tc-*` name referenced in `src/` must be declared in `src/tokens.css`. `check-css` enforces it alongside R-4-1. This is an addition to the rule set, not a deviation from it, and it exists because a misspelled custom property is the one styling mistake nothing else in the toolchain can see: `bg-(--tc-primry-soft)` compiles without complaint and paints nothing.

6. **A second new rule, R-4-3:** no comment in a `.css` file spans more than one line. R-5.12-3 already says this, but the ESLint rule reads TypeScript only, so stylesheets were the one place it went unenforced - and seven comments had already drifted past one line before the check existed.

7. **`[dir='ltr']` is declared as well as `[dir='rtl']`.** PLAN.md section 6.2 declares only the rtl block. Custom properties inherit, so an English island inside an Arabic page keeps `--tc-dir: -1` and every translate, transform origin and gradient in that subtree points the wrong way, with `ps-safe` and `pe-safe` still swapped. PLAN 5.3 explicitly allows `dir="auto"` on inputs, which makes this reachable. The plan needs the same amendment.

8. **Four token values differ from PLAN.md section 6.2, each for a measured reason.** `--tc-success-on-soft` is emerald-800 and `--tc-warning-on-soft` is amber-800, because the plan's emerald-700 and amber-700 measure 4.64:1 and 4.51:1 on their own tints and fail `check-contrast` in light and ocean. `--tc-hover` and `--tc-active` moved from the `:root, [data-theme]` block to the light block, because that block is last and its violet would otherwise beat a custom mode at equal specificity, hovering an ocean button violet on a cyan fill; ocean declares its own cyan pair. `--tc-duration` is added so `shared/classes.ts` can write `duration-(--tc-duration)` once.

**Affects** `src/styles.css`, `src/tokens.css`, `scripts/check-css.ts`, `scripts/lib/css-layers.ts`, `scripts/lib/token-refs.ts`, `docs/RULES.md`, the generated rule files, and the `check` script.

**Confirmed by measurement.** Tailwind 4.3.3 compiles the block form of `@custom-variant hover` to `@media (hover: hover) { &:hover }` plus `&[data-hover]`; the list form `(&:hover, &[data-hover])` drops the media guard, which leaves a tapped control stuck in its hover state on a touch device. The plan's block form is correct and is what ships.

---

## 2026-10-03 - Tailwind as far as it goes, Base UI the one exception, and a quality test for every dependency

**Decision.** Build on Tailwind and the platform wherever possible. `@base-ui/react` is the single accepted behaviour dependency. No stack of third-party libraries behind the components.

**The test is quality, not thinness.** Omar's rule: "if library can save from 100 lines to 20 lines iam ok if it stay - just focus on what is better". A dependency goes only when the platform already does the job as well or better.

**Two optional peers are struck:**

| Dependency | Replaced by |
|---|---|
| `react-day-picker` | `Intl.DateTimeFormat` for locale month and weekday names, `calendar: "islamic"` for Hijri, and the logical utilities for RTL. Our own month grid is roughly 200 lines and inherits the tokens |
| `@tanstack/react-virtual` | `useCollection`, which the plan already specifies with windowing and paging - the two were duplicates |

**Four are kept**, each because hand-rolling it would be worse, not merely longer:

| Dependency | Why it stays |
|---|---|
| `embla-carousel` | CSS `scroll-snap` snaps, but does not give drag momentum, loop or programmatic control |
| `react-resizable-panels` | CSS `resize` has no per-panel min and max, no keyboard path and no persistence |
| `@tanstack/react-table` | Sorting, filtering and the column model are a thousand lines of someone else's solved problem |
| `dnd-kit` | Accessible drag-and-drop with a keyboard alternative is the hardest thing on this list |

`react-hook-form` is not counted here: it is an adapter the consumer installs themselves, and costs nothing to anyone who does not.

**All six are tier 2 or 3, so v0.1 ships with no optional dependency at all.**

**Why.** Omar's words: "one of our goals is the library be built based on tailwind as possible, i accept base ui as exception, i dont want be like shadcn, multi layers." A component library whose headline numbers are 0 KB server and a small client cost cannot also carry a calendar library, a virtualiser and a carousel engine. Every dependency is also a second RTL implementation to fight, a second set of class names to override, and a second upgrade path.

**The competitive position, stated plainly.** TopClass UI competes on four things and nothing else: RTL enforced by lint rather than documented per component; server-first so most components cost nothing; lighter, because the dependency list is short by design; and an architecture a contributor cannot break, because `check-structure`, `check-boundaries` and the custom ESLint rules fail the build. Anything that weakens one of those four is not worth adding.

**Affects.** PLAN.md 2 (the optional dependency list), 18.4 (Calendar, DatePicker and DateRangePicker lose their library and are built on `Intl`), 8.5 (`useCollection` is now the only virtualiser), and R-5.9-1.

## 2026-10-02 - CSS token names now match the Figma names, so `border-border` is gone

**Decision.** The CSS custom properties and the Tailwind utility names are renamed to the names already used in Figma. One name per role, everywhere.

| Role | Was | Now | Utility |
|---|---|---|---|
| page background | `--tc-bg` | `--tc-page` | `bg-page` |
| body text | `--tc-fg` | `--tc-body` | `text-body` |
| secondary text | `--tc-muted-fg` | `--tc-muted` | `text-muted` |
| hairline | `--tc-border` | `--tc-line` | `border-line` |
| control boundary | `--tc-border-strong` | `--tc-line-strong` | `border-line-strong` |
| strong fill | `--tc-<tone>` | `--tc-<tone>-solid` | `bg-<tone>-solid` |
| text on that fill | `--tc-<tone>-fg` | `--tc-<tone>-on-solid` | `text-<tone>-on-solid` |
| text on the tint | `--tc-<tone>-text` | `--tc-<tone>-on-soft` | `text-<tone>-on-soft` |

`--tc-surface`, `--tc-surface-raised`, `--tc-<tone>-soft`, `--tc-ring` and `--tc-overlay` already complied and are unchanged.

**Why.** PLAN.md 6.6 already carried the rule - "no abbreviations and no name repeats its Tailwind prefix" - and the Figma Semantic collection already followed it (`base/page`, `base/body`, `base/line`, `<tone>/on-soft`). Only the CSS side was never brought across, which left the plan contradicting itself: 6.6 prescribed `bg-primary-solid text-primary-on-solid` while 6.2, R-5.2-1 and the Button example of 8.4 used `bg-primary text-primary-fg`, and the docs site published `bg-bg`, `border-border` and `text-primary-text`. Omar spotted the inconsistency on the CSS entry page and remembered the rule had been settled; it had, on one side only.

**What this removes.** The Figma-to-CSS translation table in 6.6 was "the only thing that reconciles them". It is now a contract, not a translation: every row reads the same on both sides, so a generator, a reviewer or `tokens:check` compares names directly instead of mapping them.

**Applied.** 131 replacements in PLAN.md, 5 in RULES.md, 2 each in CLAUDE.md, AGENTS.md and `.cursor/rules/topclassui.mdc`. The `@theme inline` block gains `--color-<tone>-solid` so `bg-<tone>-solid` resolves; without it the renamed Button example would have referenced a class that does not exist. `--tc-<tone>-mix`, `--tc-<tone>-soft` and the Tailwind palette (`--color-violet-600`) were deliberately excluded from the rename.

**Still to do.** The Figma docs frames that print the old names - CSS entry, Colours, Theming, Theme builder, Home and the components page - and the `tokens:check` script of Phase 1, which now asserts equality rather than a mapping.

**Affects.** PLAN.md 5.2, 6.2, 6.6, 8.4, 9; R-5.2-1; the three generated rule files.

## 2026-10-02 - One package named `topclassui`, components come from the CLI, and three state files

**Decision.** Seven changes, taken together while reviewing the docs site page by page.

1. **One unscoped package, `topclassui`.** `@topclassui/react`, `@topclassui/tokens` and `@topclassui/icons` are folded into it. The install line is `npm i topclassui zod`. Omar confirmed he holds the npm name and the domain. This reverses the three-package scope decision of 2026-09-25; that entry's publishing *mechanics* (org, hand-published 0.0.1, then trusted publishing) still stand, applied to one package instead of three.
2. **`npm` is the documented default**, with pnpm, yarn and bun behind a switcher. npm ships with Node; pnpm costs a first-time visitor an extra install and an error on step one. The repository itself still uses pnpm - that is a contributor concern and belongs in CONTRIBUTING.md.
3. **`zod` becomes a normal dependency, not a peer.** It is imported `import type` only, so it never reaches the browser bundle, and as a dependency it installs itself. This closes the open question recorded in the registry-CLI entry, in the direction that entry recommended.
4. **The package ships zero components.** `npm i topclassui zod` installs the base - tokens CSS, icons, shared helpers, the provider. Components arrive one at a time through `npx topclassui add <slug>`, shadcn-style. The docs must say this on the Install page or a reader installs the package and has no Button.
5. **`states.tsx` splits into `empty-state.tsx` and `error-state.tsx`.** Three states, three files, each named after the component it exports (`EmptyState`, `ErrorState`), matching `skeleton.tsx` for loading. One file was only ever a saving of one file, which is a weak reason against a structure a reader never has to think about. `check-structure` enforces all three. The ban on `loading.tsx` and `error.tsx` stands: those names are reserved by Next.js inside `app/` only, so in a component folder they promise route behaviour that never happens.
6. **`demos/` is renamed `dummy/`, and the CLI copies it.** Omar's preference on the name. Copying it means a user who runs `topclassui add button` gets working examples in their own repo and never needs the docs site open.
8. **`index.test.tsx` becomes a `test/` folder.** One file cannot hold the four kinds of test the Definition of Done requires, and a component that grows gets a 400-line test file that nobody reads. The folder holds `behaviour.test.tsx`, `keyboard.test.tsx`, `a11y.test.tsx` and `ssr.test.tsx`; `check-structure` requires the folder and at least one file in it, and the file-size rule applies per file.
7. **No animation layer in v0.1.** Icon morphing was considered and rejected: morphicons needs stroke icons on a 24x24 grid while this set is one filled path per icon, and any morph engine is client JavaScript on a server-first library. A two-icon CSS crossfade driven by `--tc-motion` covers the visible cases at 0 KB. Transitions are unaffected.

**Also applied to the docs site.** The framework-support table is trimmed to Next.js App Router (tier 1) and Vite (tier 2); React Router v7, the Pages Router, TanStack Start, Astro and Remix come back when they are in CI. Every table row in the Figma was fixed-height, so any description that wrapped to two lines was clipped - rows now hug their content on the Install and CLI pages, and the same fix is owed on the remaining 17 frames.

**Still open.** How the three-package monorepo in PLAN.md section 4 reconciles with shipping one package. Whether the CLI path needs the npm package at all - the CLI page says `shared/` is copied into the user's repo, which would make components standalone and contradict point 4.

**Affects.** PLAN.md 4, 8.1, 17.4, the Install and Add-with-the-CLI pages, R-8.1-1 and R-5.9-1 in RULES.md.

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

## 2026-10-18 - The tarball budget covers the CLI registry

`SIZE_BUDGET_BYTES` in `scripts/lib/pack-checks.ts` rises from 1,300,000 to 3,050,000: the build with the CLI and its registry inside packs 2,769,859 bytes unpacked, and the budget is that plus 10 %, rounded up.

**Why.** The CLI plan (K1) ships the component sources once, as the registry JSON in `dist/registry/`, so `npx topclassui add` reads its own installed version with no network; the registry is 1.48 MB unpacked (one item per component with its demos, one base item for `shared/` and `icons/`). The 1.3 MB budget was written for the components-only tarball of release R5.

**Affects.** `pack-checks.ts`, its test, and every later release: a tarball over 3.05 MB needs a new entry here, not a bigger number.
