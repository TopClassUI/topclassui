# Figma audit, getting started

On preview/r8-all d9c04b21 at 1440 dark, frame vs build, each difference re-checked by a second reviewer. Fix what your branch has not fixed yet; skip a row your later commits already cover.

## /en/docs/installation: differs (22)

Note: The shell differences (navbar, search, mode switch, sidebar, On this page, footer, tab card, code-block icon and line pitch, prose inline code) are listed once here and apply to all five guide pages. I re-checked every claim against Figma design context (193:1590 navbar, 193:1623 sidebar, 193:1724 tab block, 193:1768/193:1814 tables, 193:1875 code block, 193:1708 On this page), against stacked crops in handoff/figma-audit/r11-review/getting-started/verify/ (nav-*.png, side-*.png, ins-a..f.png, foot-*.png), and against a fresh 2x Playwright probe of localhost:4620 (probe.mjs, pw-tabcard-2x.png). These are not counted: scrollbar-gutter (content column 932 vs 944, On this page at x=1240), type-scale snaps of 1-2 px (13 vs 12/14 px labels, 32 vs 34 px h1), Geist Mono vs Roboto Mono, and ClearType colour fringes in the capture. The Previous+Next pager is refuted on every page because it is recorded in DECISIONS.md:61 (job 130). No states strip on these pages, so the 5+1 wrap does not apply. Several of the reviewer's file:line causes were wrong and are corrected below (site-sidebar.tsx:17, sidebar-groups.tsx:21, framework-tabs.tsx:26, package-managers.tsx:27, mdx-table.tsx:49, code-fence.tsx:50).

1. **[high] navbar, search trigger border**
   - Frame: 127x29 field on base/page with a 1 px base/line border (sampled rgb 38,38,38 at x=907)
   - Build: 144x32 field whose 1 px border is line-strong, computed lab(66.1) = sampled rgb 161,161,161: a bright outline around Search on every page
   - Cause: apps/docs/components/classes.ts:31 SEARCH_TRIGGER is merged over <Button variant="outline"> (apps/docs/components/search/search-button.tsx:44), which brings border-line-strong (packages/topclassui/src/components/button/variants.ts:33). SEARCH_TRIGGER never resets the border colour
   - Fix: SEARCH_TRIGGER = `bg-page border-line font-normal text-muted ${TYPE.nav}`
2. **[high] Pick your framework and Install tab cards, header row**
   - Frame: The tab row is a full-width 942x38 base/surface strip with a 1 px base/line border under the whole row (at x=900: rgb 23 fill, then the rgb 38 line)
   - Build: The TabsList is w-fit, so the surface fill and the inset hairline stop after the last tab: 331 px for the frameworks, 220 px for the package managers. The other ~600-710 px of the header is page colour rgb 10 with no line (live probe: tablists 331.2x41 and 220.2x41)
   - Cause: apps/docs/components/mdx/code-tabs.tsx:10 LIST = 'gap-0 bg-surface' over the library's TABS_LIST.line `w-fit max-w-full ... pb-px` (packages/topclassui/src/components/tabs/classes.ts:26). The hugging list is the library's recorded Tabs default (DECISIONS 2026-10-19), but the docs frames draw this card full width
   - Fix: code-tabs.tsx:10 LIST = 'w-full max-w-none gap-0 bg-surface' (cn replaces w-fit/max-w-full, so the surface and the inset hairline span the card)
3. **[medium] tab cards, code body**
   - Frame: No copy control in the tabbed block: the 942 px bx (p 14) holds only the commands
   - Build: An icon-only 24x24 copy button at the inline end of each code body (x=1163, y=352 and y=563). The pre keeps 48 px of end padding for it
   - Cause: apps/docs/components/mdx/framework-tabs.tsx:26 and package-managers.tsx:27 render CodeBlock with the default showCopy: true (packages/topclassui/src/components/code-block/constants.ts:5). apps/docs/app/globals.css:182-190 lays its header over the body as an absolute button, and :201-203 pads the pre
   - Fix: Pass showCopy={false} to the CodeBlock at framework-tabs.tsx:26 and package-managers.tsx:27, and drop `.docs-tabbed .docs-code > pre { padding-inline-end: 3rem }` (globals.css:201-203)
4. **[medium] navbar height**
   - Frame: Navbar 1440x58, its line at y=57
   - Build: header 1430x52 (min-h-13, pt 6, pb 4), its line at y=51, so the whole shell starts 6 px higher
   - Cause: apps/docs/components/shell/site-navbar.tsx:54 <NavbarRoot className="bg-surface"> keeps the library bar's min-h-13 (packages/topclassui/src/components/navbar/classes.ts:9). 52 px is the library Navbar's recorded default (DECISIONS 2026-10-19), but the docs frames draw 58
   - Fix: <NavbarRoot className="bg-surface min-h-14.5"> at site-navbar.tsx:54 (--tc-sticky-top follows the measured height)
5. **[medium] sidebar rows**
   - Frame: nav rows 199x29 (px 8 py 6), 31 apart (gap 2), text 14 px. Accessibility text at page y=520, Components at y=584
   - Build: rows 199x26, 28 apart (live probe: Home y=140, Install y=168), text 13 px. Accessibility at y=485, Components at y=547: the list ends 35-37 px higher
   - Cause: apps/docs/components/shell/site-sidebar.tsx:17 RAIL `[--tc-row-height:1.625rem]`. Its comment at :15 says the frames draw 26/28, but all five guide frames draw 29/31. Also classes.ts:38-39 SIDE_LINK `${TYPE.nav}`
   - Fix: RAIL `[--tc-row-height:1.8125rem]` at site-sidebar.tsx:17, and SIDE_LINK current/rest `text-sm` in place of TYPE.nav (classes.ts:38-39)
6. **[medium] Peer dependencies and Framework support tables, column widths**
   - Frame: Peer: 146 / 96 / 702 px. Framework support: 232 / 96 / 616 px. Row 1 breaks after 'Icon works'
   - Build: Peer: 159 / 115.5 / 655. Framework support: 196 / 55 / 679. Row 1 breaks after 'by name, and'
   - Cause: apps/docs/components/mdx/mdx-table.tsx:49 sizes every column with columnFit (apps/docs/lib/table-of.ts:50): fit columns shrink to their content and the last column takes the rest
   - Fix: Give MdxTable a widths prop and set it in installation.mdx: Peer `w-[15.5%]`, `w-[10.2%]`; Framework support `w-[24.6%]`, `w-[10.2%]` (as ThemeUtilities already does with w-[37%])
7. **[medium] Framework support row 2, inline code**
   - Frame: 'imported from icon-registry' kept whole on line 2
   - Build: The code 'icon-registry' breaks at its hyphen: 'icon-' ends line 1 and 'registry' starts line 2 (code box 634x37.6)
   - Cause: apps/docs/components/classes.ts:100 AUTHORED_CELL lets inline code wrap inside a prose cell
   - Fix: AUTHORED_CELL = '**:text-[length:inherit] **:whitespace-nowrap' (or un-tick icon-registry, see the cell-fonts item)
8. **[medium] React without Next.js, code**
   - Frame: One 944x358 block (header 43 + body 313) holding both files, each opened by a comment line ('// vite.config.ts', '// src/icons.ts - once per app')
   - Build: Two blocks, 'vite.config.ts' (~190 px) and 'src/icons.ts' (~156 px), 12 px apart
   - Cause: apps/docs/content/en/installation.mdx:44-60, two fences
   - Fix: One ```ts fence with no title, starting with `// vite.config.ts` and continuing with `// src/icons.ts - once per app`, keeping the check on the icons half
9. **[low] tab cards, tabs**
   - Frame: Tab px 14 py 9: label row 35 + 2 px indicator = 37, header row 38 with its line. Tab widths 155 / 54 / 134
   - Build: Tab 40 tall with px 12 (label at x+12), header row 41 with its hairline. Widths 151 / 49.7 / 128.6
   - Cause: The library TabsTab size is used unchanged at apps/docs/components/mdx/code-tabs.tsx:22
   - Fix: <TabsTab className="h-9.25 px-3.5"> at code-tabs.tsx:22
10. **[low] navbar inline padding**
   - Frame: px 28: the brand tile at x=28, the GitHub icon ending 28 px from the edge
   - Build: ps/pe 16: brand at x=16, 12 px further out than drawn. The 16 vs 18 px link gap is within 2 px and not counted
   - Cause: packages/topclassui/src/components/navbar/classes.ts:10 ps-[calc(1rem+…)] pe-[calc(1rem+…)], not overridden at apps/docs/components/shell/site-navbar.tsx:54
   - Fix: Add `md:ps-[calc(1.75rem+var(--tc-safe-start))] md:pe-[calc(1.75rem+var(--tc-safe-end))]` to NavbarRoot at site-navbar.tsx:54
11. **[low] navbar, search trigger box**
   - Frame: 127x29, pl 10 pr 8 py 6, gap 8, magnifier 14 px
   - Build: 144.3x32 (Button size sm: 32 tall, px 12), magnifier 16 px. Label sizes are type-scale snaps and not counted
   - Cause: apps/docs/components/search/search-button.tsx:44-45 size="sm", Svg size="1rem"
   - Fix: At search-button.tsx:44-45, Button className adds `h-7.25 ps-2.5 pe-2` and the Svg takes size="0.875rem"
12. **[low] navbar, mode switch weight**
   - Frame: 217x31. All three labels (Light, Dark, Ocean) are Inter Medium 500
   - Build: 229x32. Light and Ocean are regular 400 and only the checked Dark is 500 (live probe), so the unselected labels read thinner than drawn. Padding 10 vs 9, gap 6 vs 5 and icon 13 vs 14 are each within 1 px
   - Cause: apps/docs/components/classes.ts:34 MODE_SEGMENT `font-normal data-checked:font-medium ${TYPE.nav}`
   - Fix: MODE_SEGMENT = `font-medium ${TYPE.nav}`
13. **[low] navbar brand tile (and footer brand)**
   - Frame: Navbar tile 15x25, radius 4, palette icon 15 px. Footer tile 14x24, palette 14 px
   - Build: 24x24 square tile with the TopClass brand mark, in the navbar and the footer
   - Cause: apps/docs/components/shell/brand-mark.tsx:24 BrandTile size-6 with the mark from review-notes/logo/final (used at site-navbar.tsx:56 and site-footer.tsx:70). No DECISIONS entry records the swap
   - Fix: Keep the logo and update the Figma navbar and footer tiles to it (and record it), or render the drawn 15x25 palette tile
14. **[low] sidebar group labels**
   - Frame: START HERE / FOUNDATIONS / REFERENCE / MORE at x=18 (row pl 8)
   - Build: Labels at x=22, 4 px further in than the drawn 8 px inset
   - Cause: packages/topclassui/src/components/sidebar/classes.ts:50 SIDEBAR_GROUP_LABEL px-3, not overridden at apps/docs/components/shell/sidebar-groups.tsx:21
   - Fix: At sidebar-groups.tsx:21 bring the label to the rows' 8 px start (e.g. SidebarGroup className `pt-2 *:gap-0.5 *:first:ps-2`)
15. **[low] sidebar, rest-row text colour**
   - Frame: Inactive rows render rgb 128,128,128 (sampled max on Home, Colors; their layers name base/body but render dimmed)
   - Build: rgb 161,161,161 (text-muted, lab 66.1), visibly brighter
   - Cause: apps/docs/components/classes.ts:39 SIDE_LINK.rest text-muted
   - Fix: SIDE_LINK.rest `text-muted/80` (about rgb 131 on the page, still 4.5:1), or keep muted and update the frame
16. **[low] On this page, vertical offset**
   - Frame: ON THIS PAGE eyebrow on a 12 px line at 36. First entry text box at 58 below the shell top. Pitch 25
   - Build: Eyebrow on a 16 px line plus mb 10, entries in 24 px boxes: first entry box at 62 and its text at 66, so 8 px lower. Pitch 25 matches
   - Cause: apps/docs/components/shell/on-this-page.tsx:16 `mb-2.5 ${SHELL_EYEBROW}` (TYPE.eyebrow leading-4)
   - Fix: <p className={`mb-1.5 leading-3 ${SHELL_EYEBROW}`}> at on-this-page.tsx:16
17. **[low] footer, Get started column and chips**
   - Frame: Get started: Installation, Tailwind CSS v4 setup, Provider and root layout, Your first component, Install one component (CLI). Chips 'MIT licence' and 'v0.1.0' (51 px)
   - Build: Get started: Install the package, Install one component (CLI), CSS entry, Provider, Your first component (registry titles, CLI second). Chips 'MIT license' and 'v0.1.0-beta.1 beta' (about 115 px). docs-site.md:479-480 records 'v0.1.0 beta'
   - Cause: apps/docs/components/shell/site-footer.tsx:51-54 takes LIVE_PAGES titles in sidebar order. site-footer.tsx:77 passes the full prerelease VERSION to labels.footer.version (apps/docs/labels/en.ts:41). en.ts:39 spells 'license'
   - Fix: Use footer labels for Get started in the drawn order, CLI last. Pass the version without its prerelease suffix so the chip reads 'v0.1.0 beta'. Links left out (Connectors, Figma library, registry, Privacy) stay out, as recorded
18. **[low] tables, row height**
   - Frame: Header 41, one-line rows 43, two-line rows 59 (14 px on a normal ~17 px line, py 12). Peer table 172 px, Framework 161 px
   - Build: Header 44, one-line rows 45.6, two-line rows 65.6 (13 px on a 20 px line). Peer 180.7 px, Framework 175.7 px
   - Cause: apps/docs/components/classes.ts:90 PROSE_CELL `text-[0.8125rem]/5`, with the header at in-aria-[rowindex=1]:text-sm on a 20 px line
   - Fix: PROSE_CELL `text-[0.8125rem]/[1.0625rem]` plus `in-aria-[rowindex=1]:leading-[1.0625rem]`
19. **[low] tables, cell fonts**
   - Frame: Range values mono 10.5 px body. Framework names ('Next.js 15 or 16, App Router', 'Vite single-page app') mono 10.5 px body. 'ref', 'inset-s-*', 'Icon', 'icon-registry' plain Inter in the prose cells. Package names react and tailwindcss Inter 14 muted (react-dom mono)
   - Build: Range 13 px mono body, reading heavy. Framework names Inter 13 muted. ref, inset-s-*, Icon and icon-registry 13 px mono. All three package names 13 px mono muted
   - Cause: apps/docs/content/en/installation.mdx:25-36 (backticks on prose words, none on the framework names). apps/docs/components/mdx/peer-range.tsx:9 INLINE_CODE, scaled to the cell by AUTHORED_CELL (classes.ts:100)
   - Fix: Backtick the two framework names at installation.mdx:35-36, un-tick ref, inset-s-*, Icon and icon-registry in the prose cells, and optionally render PeerRange at text-[0.6875rem]
20. **[low] code block header icon (every guide fence)**
   - Frame: Code blocks carry icon/copy 13 px before 'code'. icon/terminal-window appears only on terminal blocks
   - Build: terminal-window 14 px on every named header, including code files (vite.config.ts, src/icons.ts, app/globals.css, layout.tsx, actions.ts)
   - Cause: packages/topclassui/src/components/code-block/index.tsx:40 hard-codes terminalWindow for every titled header
   - Fix: Give CodeBlock an icon prop (default terminalWindow). Pass the copy icon from apps/docs/components/mdx/code-frame.tsx:35 unless the fence is a shell fence (code-fence.tsx:33 SHELL)
21. **[low] code block body, line pitch**
   - Frame: 11 px mono on a 1.72 line (18.9 px pitch): the 15-line Vite body is 313 px, the 2-line tab body 66 px
   - Build: 12 px on a 17.14 px pitch: the 2-line tab body is 60.3 px, and every multi-line sample is about 10% shorter than drawn
   - Cause: apps/docs/app/globals.css:168 `.docs-code > pre { line-height: var(--text-sm--line-height) }` (20/14 x 12 px)
   - Fix: globals.css:168 `line-height: 1.58` (19 px at 12 px)
22. **[low] prose inline code, every guide page (added by verifier)**
   - Frame: Backticked words in paragraphs are plain Inter at the paragraph's 16 px: 'Import Icon from topclassui/icon-registry' (Installation), '@source' (CSS), 'direction and locale' (Provider), 'an Input inside a Field' (First component)
   - Build: They render as 14 px mono muted runs inside the 16 px Inter sentence: Icon, topclassui/icon-registry, index.html here, and the same on the other four pages
   - Cause: apps/docs/components/classes.ts:84 PROSE_CODE 'font-mono text-sm text-muted', applied to MDX inline code
   - Fix: Pick one for all guides: PROSE_CODE = 'text-muted' (keep dir=ltr) to match the frames, or redraw the frames' prose with mono runs

## /en/docs/cli: differs (7)

Note: I fetched the frame with get_screenshot (r11-review/getting-started/fig-cli.png, 1440x3634) and its structure with get_metadata 193:1974. docs-site.md:1367-1371 says that when the CLI ships, the page is 'built as drawn'. No DECISIONS entry records the rewrite, so the content differences stand. The fix may still be a Figma redraw, since the drawn transcripts describe a CLI that differs from the shipped one. All shell items from /en/docs/installation apply. Pager and terminal-label-size claims are refuted below. Crops: verify/ov-cli.png, verify/cli-a.png.

1. **[high] page structure**
   - Frame: 7 sections: Initialise once, Add a component, What lands in your project, The config file, When you have edited a copied file, Running without prompts, What it never does (On this page has 7 entries)
   - Build: 8 sections: Start a project, Add a component, The topclassui folder, Keep up with new versions, See what is there, Flags, Next.js and Vite, Copy or package (On this page has 8 entries)
   - Cause: apps/docs/content/en/cli.mdx, rewritten for the shipped CLI (docs-site.md:1367-1371 asked for the drawn outline)
   - Fix: Rebuild cli.mdx on the drawn outline with the real commands inside it, or redraw Figma 193:1974 to the shipped CLI and record the change in DECISIONS
2. **[high] What lands in your project (file tree)**
   - Frame: A 944x1041 tree card (node 281:1762) with 26 rows, each 40 px with a 1 px base/line top border, py 11, gap 10. Folder/file-text/code/file icons 15 px. Names Roboto Mono 13 px body, notes Inter 12 px muted. Indent 22 px per level (pl 14/36/58/80/102)
   - Build: A 7-line plain `text` fence titled 'topclassui/' (about 932x190), with the notes as aligned monospace columns
   - Cause: apps/docs/content/en/cli.mdx:38-46 uses a code fence. The site has no tree component
   - Fix: Add a FileTree MDX component: row `flex items-center gap-2.5 py-2.75 pe-3.5 border-t border-line`, ps = 0.875rem + depth x 1.375rem, Icon at 15 px, name `font-mono text-[0.8125rem] text-body`, note `text-xs text-muted`. Use it in place of the fence
3. **[high] What it never does**
   - Frame: Three 305 px cards in a row, 14 px apart (base/surface, 1 px base/line, radius 12, p 16, gap 6, title 14 semibold body, text 12 muted), the shorter two centred vertically
   - Build: Section absent
   - Cause: cli.mdx has no such section
   - Fix: Add '## What it never does' with three <Card>s and a 3-column variant of Cards (md:grid-cols-3 gap-3.5 items-center)
4. **[medium] terminal blocks**
   - Frame: Full transcripts with the '$' prompt and the CLI's output: init 11 lines (237 px body), add select 14 lines (275 px), diff 6 lines (142 px)
   - Build: Commands only, with no prompt or output: 1-2 lines, 43-60 px bodies
   - Cause: apps/docs/content/en/cli.mdx:11-13, 27-30, 58-61
   - Fix: Show the prompt and the real output under each command, as drawn
5. **[medium] The config file**
   - Frame: A 944x225 code block of topclassui.json (7 lines) under 'The config file'
   - Build: Absent. topclassui.json appears only as one line of the folder fence
   - Cause: apps/docs/content/en/cli.mdx (no such section)
   - Fix: Add the section with the real topclassui.json
6. **[medium] extra blocks**
   - Frame: No tables and no callout on the page
   - Build: Flags table (930x362.9, 7 rows), Next.js and Vite table (930x180.7), and an info callout 'Exit codes: …' (about 932x42)
   - Cause: apps/docs/content/en/cli.mdx:73-101
   - Fix: Fold these into the drawn sections, or add them to the frame
7. **[low] page head, lead**
   - Frame: One line (24 px): 'Copy a component into your project and own the file.'
   - Build: Two lines (48 px): 'Copy one component into your project with one command. The CLI brings its source, constants, schema, types and variants, and you edit them as your own files.' DECISIONS 2026-10-19 (job 130) keeps drawn leads and moves meta descriptions to content/descriptions.ts
   - Cause: apps/docs/content/en/cli.mdx:4 description
   - Fix: Use the drawn one-line description and put the 120-160 character meta text in content/descriptions.ts

## /en/docs/css: differs (3)

Note: Checked against get_metadata 193:2328 and design context for 193:2504 (utility table), 193:2477 (What each line brings) and 193:2563 (Wrong/Right). Crops: verify/css-a1, a2, b, c, d.png. All shell items from /en/docs/installation apply. The code-header item for 'The three lines' is the shared icon item; its file-name title is recorded. On Vite and the pager are recorded (refuted below).

1. **[medium] The utility names you get, table**
   - Frame: 7 rows, 944x340. Columns 348/596. Cells are mostly Inter 14 muted prose ('--tc-page, surface, surface-raised', 'control sizes', 'radius knobs', 'bg-page bg-surface bg-surface-raised'). Only --tc-ring, text-body text-muted, outline-ring and h-control-xs to h-control-xl are mono 10.5 body. Every row is one line, 41-43 px
   - Build: 20 generated rows, 930x1355, four times taller. Every value is 13 px mono in bright body colour, and many cells wrap to 2-3 lines (Token column 344 px)
   - Cause: apps/docs/components/mdx/theme-utilities.tsx:13 (each value a <code> with TABLE_CODE `font-mono text-body`, classes.ts:103) and :29, one row per @theme group. Generating the table is recorded (docs-site.md:1430-1432); its look and row grouping are not
   - Fix: Render the values `font-mono text-muted` (or plain muted text as drawn) and group the families as drawn (surfaces, text, lines, primary, ring, control sizes, radius knobs, one row per tone), so the table stays near 7-10 rows
2. **[low] What each line brings, table**
   - Frame: Columns 217/727. Rows 41/42/43/59, with row 3 wrapping to 2 lines. 'tailwindcss' Inter 14 muted, the two topclassui paths mono 10.5 body, '--tc-*', '@source' and '@theme inline' plain Inter
   - Build: Columns 199.7/730.3. Rows 44/45.6/45.6/45.6, all on one line. Every path is 13 px mono muted, and --tc-*, @source and @theme inline are mono
   - Cause: apps/docs/content/en/css.mdx:19-21 (backticks), columnFit (apps/docs/lib/table-of.ts:50) and classes.ts:90 PROSE_CELL
   - Fix: Paths in TABLE_CODE (mono body), tailwindcss and the prose tokens plain, first column w-[23%], and the PROSE_CELL line height from the installation table item
3. **[low] If the order is wrong, Wrong pane**
   - Frame: The comment keeps its 2 authored lines. Pane 465x120, code 10.5 px
   - Build: The comment wraps to 3 lines ('…and the resets' / 'win */'). Pane 457x128.8, code 12 px
   - Cause: apps/docs/components/mdx/wrong-right.tsx:35 passes `wrap` to every pane, and 12 px code no longer fits the drawn line in a 457 px pane
   - Fix: Drop `wrap` for panes whose lines fit (or set pane code to text-[0.6875rem]), so the authored breaks hold

## /en/docs/provider: differs (3)

Note: Checked against get_metadata 193:2659 and design context for 193:2818 (props row) and 193:2892 (cards). Crops: verify/prov-a..f.png. All shell items from /en/docs/installation apply. The generated prop rows, the printed CSP hash block, the pasted-script SPA sample and the pager are recorded (refuted below). The untitled ThemeScript fence shows 'tsx' as its header; that is listed with the same cause under /en/docs/first-component.

1. **[medium] The props table**
   - Frame: 6 rows, 944x366. Columns 115/322/115/392. Prop names Inter 14 muted, types mono 10.5 body, defaults Inter 14 muted, descriptions mostly 1-2 lines
   - Build: 9 generated rows, 930x712. Columns 145/242/246/297. Prop names and types 13 px mono in bright body colour, and object defaults print over 4-5 lines. The narrow 297 px description column wraps almost every row
   - Cause: apps/docs/components/mdx/props-table.tsx:28-31: names and types through TABLE_CODE `font-mono text-body` (classes.ts:103), with PROSE_COLUMN fit/wrap/fit/prose widths. The generated rows are recorded (docs-site.md:1490-1493); the look is not
   - Fix: Render the prop column as plain `text-muted` (no code) and give the columns w-[12%] / w-[34%] / w-[12%] as drawn. Keep the generated rows
2. **[low] What it renders, cards**
   - Frame: 465 px cards, p 16, title-to-text gap 6, 14 px gaps both ways, flex-wrap items-center. Card heights follow the text (87 and 72), and the shorter card is centred in its row
   - Build: 460 px cards, p 14, gap 4, 12 px gaps. Grid rows stretch to equal height (86/86, 90/90), so 'Toast viewport' and 'Tooltip provider' carry 14-18 px of empty space
   - Cause: apps/docs/components/mdx/cards.tsx:6 `grid grid-cols-1 gap-3 md:grid-cols-2` and :11 CardRoot `gap-1 bg-surface p-3.5`
   - Fix: cards.tsx:6 `grid grid-cols-1 items-center gap-3.5 md:grid-cols-2`; cards.tsx:11 `gap-1.5 bg-surface p-4`
3. **[low] What it renders, Isolation root card text (added by verifier)**
   - Frame: 'A div with isolation: isolate, so overlays stack…' in plain Inter 12 px muted
   - Build: 'isolation: isolate' renders as 14 px mono inside the 12 px text (live probe: code 14px in a 12px parent). The first line grows to 20 px and the run looks oversized
   - Cause: apps/docs/components/classes.ts:81 INLINE_CODE / :84 PROSE_CODE set text-sm, which the card's text-xs (cards.tsx:16) does not scale down
   - Fix: Make inline code in cards inherit the size: cards.tsx:16 `text-xs text-muted **:text-[length:inherit]`, or plain text as drawn

## /en/docs/first-component: differs (5)

Note: Checked against get_metadata 193:3001 and design context for 193:3172 (steps), plus a live probe of the step badges (16x16, radius 4, 12 px/500). Crops: verify/fc-a, b, c, d.png. All shell items from /en/docs/installation apply. Package-subpath imports, file-name headers and the pager are recorded or refuted below. The callout's recorded wording held only 'until the CLI ships', and the CLI page is now live.

1. **[medium] 3. What you should see, step rows**
   - Frame: Number badge 22x12 pill (radius 11), 10 px semibold primary/on-soft on primary/soft. Row px 16 py 14, gap 12, title-to-text gap 4. Titles have no full stop
   - Build: Badge 16x16 square, radius 4, 12 px medium. Row px 16 py 12, title-to-text gap 2. Titles end with '.'
   - Cause: apps/docs/components/mdx/steps.tsx:7 ROW 'flex gap-3 px-4 py-3', :8 NUMBER 'size-4 rounded-chip text-xs font-medium', :10 TEXT gap-0.5. apps/docs/content/en/first-component.mdx:63-65 put the full stops inside the ** leads
   - Fix: ROW 'flex gap-3 px-4 py-3.5'; NUMBER 'inline-flex h-3 w-5.5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[0.625rem] font-semibold text-primary-on-soft mt-0.5'; TEXT gap-1. Move the full stops out of the bold leads
2. **[medium] 4. Show the error without a reload**
   - Frame: One code block (944x396) with the 'use client' form
   - Build: Two blocks: app/subscribe/subscribe-form.tsx (pre 317.4) and app/subscribe/page.tsx (pre 128.8), 12 px apart
   - Cause: apps/docs/content/en/first-component.mdx:71-98, two fences
   - Fix: Keep the single client-file block as drawn, or fold page.tsx into it after a comment line
3. **[low] What you will build, callout**
   - Frame: Info callout 944x43: 'Add the components first: npx topclassui add form field input button'
   - Build: 932x48 callout: 'Install the package first.' with a link
   - Cause: apps/docs/content/en/first-component.mdx:11. docs-site.md:1599-1600 kept that text only 'until the CLI ships', and /en/docs/cli is now live
   - Fix: Restore the drawn sentence with the shipped `npx topclassui add` command
4. **[low] 1. The action, lead**
   - Frame: Two sentences ('…which is what Field expects.')
   - Build: Adds a third sentence, 'The first argument is the last answer, which step 4 reads.', so the lead takes 2 lines plus
   - Cause: apps/docs/content/en/first-component.mdx:15
   - Fix: Keep it (the FormActionState signature needs it) and add it to the frame, or drop it
5. **[low] On Vite code header (also Provider's ThemeScript block)**
   - Frame: Untitled code blocks read 'code' with the copy icon
   - Build: Untitled fences are named after their language: 'tsx' here (first-component.mdx:104) and on Provider's ThemeScript block (provider.mdx:70)
   - Cause: apps/docs/components/mdx/code-fence.tsx:50 names an untitled fence by `lang`, falling back to 'code' only when no language is given
   - Fix: code-fence.tsx:50: name an untitled non-shell fence labelsFor(locale).blocks.code ('code'); keep 'terminal' for shell fences

## Refuted by the second reviewer (do not act)

- /en/docs/installation, navbar links: Blog is left out until live, as recorded (docs-site.md:433-434). The bold link marks the current section (Docs on a guide page). The guide frames reuse the Components-page navbar instance, so this is no build defect.
- /en/docs/installation, sidebar, rows present: Recorded: pages with status 'later' (Connectors, Theme builder, Blog) are not routed and not in the sidebar (docs-site.md:1367-1369, choices 11 and 12).
- /en/docs/installation, page head (route text vs breadcrumb, h1 offset): Recorded: the breadcrumb replaces Figma's route text (docs-site.md:446-448). The h1 is at page y=122 vs 123 drawn; only its offset from the shell top moves, as a consequence of that decision.
- /en/docs/installation, pager under the article: Recorded: 'The guide pages and the changelog show Previous and Next in a nav' (DECISIONS.md:61, 2026-10-19 job 130). The next target comes from the page order (surprise 14).
- /en/docs/installation, On this page, 5 entries (no Next steps): Recorded: the Next steps section is removed after the release (docs-site.md:1285-1286). Only the 8 px offset of the list is kept as a difference.
- /en/docs/installation, footer, left-out links and bottom-row Privacy: Recorded: Figma library, Component registry, Connectors and Privacy are left out until they exist (docs-site.md:470-478, choices 11 and 12). Only the Get started labels and order and the chip text are kept.
- /en/docs/installation, React without Next.js, lead ('Three things change' plus the theme-script sentence): Recorded: the Vite sample drops topclassui/vite and the ThemeScript is pasted into index.html by hand (docs-site.md:1279-1284).
- /en/docs/installation, code block header, file name in the header and no comment line: Recorded in S3: a code block's title is 'terminal' or the file name (docs-site.md:493). Only the icon choice is kept as a difference.
- /en/docs/installation, code body, plain-token colour #fafafa vs rgb 212: The frame is inconsistent: plain tokens are base/body in the Vite block but render about rgb 128 in the CSS override block (193:2559). Token colours come from the Shiki theme chosen by the contrast test (docs-site.md S3, choice 14). Only the line pitch is kept.
- /en/docs/installation, Next steps section and callout: Recorded: the 'Not on npm yet' callout is removed once 0.1.0 is published, so the section never shows (docs-site.md:1285-1286).
- /en/docs/installation, navbar link gap, search and mode-switch label sizes: The link gap is 16 vs 18 px, and the labels are 13 vs 12 px, kbd 12 vs 10 px and icons 13 vs 14 px: each within 1-2 px or a recorded type-scale snap (docs-site.md S2). The real parts (search box size, label weight) are kept.
- /en/docs/cli, pager: Recorded: guide pages show Previous and Next (DECISIONS.md:61, job 130).
- /en/docs/cli, terminal header label 9 px vs 11 px: A 2 px text-size snap on a header label, within the recorded type-scale tolerance.
- /en/docs/css, The three lines, code block header: The file name in the header with no comment line is recorded (docs-site.md:493, S3). The terminal icon is the shared code-header icon item under /en/docs/installation, so it is not listed twice.
- /en/docs/css, On Vite: Recorded: the section links to Install the package (docs-site.md:1434-1435), and the sample has no topclassui/vite because it does not exist (docs-site.md:1279-1283).
- /en/docs/css, pager: Recorded: guide pages show Previous and Next (DECISIONS.md:61, job 130).
- /en/docs/provider, ThemeScript code (two blocks with a printed hash): Recorded: THEME_SCRIPT_HASH does not exist, so the sample imports ThemeScript alone and the CSP line prints the real hash computed by docs:data (docs-site.md:1497-1503).
- /en/docs/provider, In a single-page app (lead and pasted-script sample): Recorded: the SPA sample shows THEME_SCRIPT pasted into index.html and does not mention topclassui/vite (docs-site.md:1494-1496).
- /en/docs/provider, Where it goes, code block header: The file-name title is recorded (docs-site.md:493). The icon is the shared code-header icon item under /en/docs/installation.
- /en/docs/provider, pager: Recorded: guide pages show Previous and Next (DECISIONS.md:61, job 130).
- /en/docs/first-component, code blocks, file names in the header: Recorded: the header carries the file name (docs-site.md:493). The import paths follow the package subpaths (docs-site.md:1597-1599). The icon is the shared code-header icon item.
- /en/docs/first-component, pager: Recorded: guide pages show Previous and Next (DECISIONS.md:61, job 130). 'Next: Colors' matches.
