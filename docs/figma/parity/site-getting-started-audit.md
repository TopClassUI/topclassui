# Getting started, audit status (job 146)

Each row of cloud-reports/audit-r11/getting-started.md (on cloud/audit-r11) with its status on fix/r11-getting-started. Shared means the shell, the library or a class constant the five pages share with every other page; those rows go to job 150.

## /en/docs/installation

| # | Row | Status |
|---|---|---|
| 1 | navbar, search trigger border | fixed, 3260f1d2, and the same line landed in c7c65f16 (job 140's card shell); the merge keeps c7c65f16's constant. dfc90103 had changed only the size |
| 2 | tab cards, header row | fixed, aa83e64c (code-tabs LIST w-full max-w-none) |
| 3 | tab cards, copy button | fixed, aa83e64c (showCopy={false} in both tab blocks, the 3rem pre padding dropped) |
| 4 | navbar height | already fixed, dfc90103 (min-h-14.5) |
| 5 | sidebar rows | already fixed for the 29/31 px pitch, dfc90103 (RAIL 1.8125rem); the 14 px text (SIDE_LINK TYPE.nav) is shared, job 150 |
| 6 | table column widths | fixed, aa83e64c (`<Widths>` around the two tables: 15.5/10.2 and 24.6/10.2 %) |
| 7 | icon-registry breaks at its hyphen | fixed, aa83e64c (plain text in the prose cell, as drawn); c7c65f16 also keeps code in a cell whole (AUTHORED_CELL) |
| 8 | React without Next.js, one block | kept: src/icons.ts is compiled under `check` (scripts/samples.test.ts); one fence would compile vite.config.ts against vite, @vitejs/plugin-react and @tailwindcss/vite, which the docs app does not install. The file-name headers are recorded (docs-site.md:493) |
| 9 | tab cards, tab size | fixed, aa83e64c (TabsTab h-9.25 px-3.5) |
| 10 | navbar inline padding | already fixed, dfc90103 |
| 11 | navbar, search trigger box | already fixed, dfc90103 (size xs, 14 px magnifier) |
| 12 | navbar, mode switch weight | shared, job 150 (MODE_SEGMENT) |
| 13 | navbar and footer brand tile | shared, job 150 (brand-mark.tsx; keep the logo and redraw, or the palette tile, is Omar's call) |
| 14 | sidebar group labels | already fixed, dfc90103 (-ms-1) |
| 15 | sidebar rest-row colour | shared, job 150 (SIDE_LINK.rest) |
| 16 | On this page offset | shared, job 150 (on-this-page.tsx) |
| 17 | footer, Get started and chips | shared, job 150 (site-footer.tsx, labels) |
| 18 | tables, row height | already fixed, c7c65f16 (PROSE_CELL on a 17 px line) |
| 19 | tables, cell fonts | fixed, aa83e64c (framework names in mono; ref, inset-s-*, Icon, icon-registry plain). Kept: the three package names stay mono, the frame draws react-dom mono and the other two plain; PeerRange keeps the table's code size (shared PROSE_CELL scale) |
| 20 | code block header icon | shared, job 150 (CodeBlock hard-codes the terminal icon: a library prop) |
| 21 | code block line pitch | shared, job 150 (globals.css .docs-code) |
| 22 | prose inline code | shared, job 150 (PROSE_CODE serves every guide) |

## /en/docs/cli

| # | Row | Status |
|---|---|---|
| 1 | page structure | fixed, 180289ab (the drawn seven sections: Initialise once, Add a component, What lands in your project, The config file, When you have edited a copied file, Running without prompts, What it never does) |
| 2 | file tree | fixed, 180289ab (FileTree: 40 px rows, hairlines, 22 px indent, 15 px icons, mono names and muted notes; the rows are the files init and add write) |
| 3 | What it never does | fixed, 9264c0df (three cards, three columns; facts checked against packages/cli) |
| 4 | terminal transcripts | fixed, 180289ab (the '$' prompt and the real output of init, add select and diff select, run on the next-app fixture) |
| 5 | The config file | fixed, 180289ab (the real topclassui.json init writes) |
| 6 | extra blocks | fixed, 180289ab (folded: the Next.js and Vite table under Initialise once, list under Add a component, the flags table and the exit codes under Running without prompts, copy-or-package into the init paragraph) |
| 7 | lead | fixed, 180289ab (the drawn one-liner; the meta text moved to content/descriptions.ts) |

The transcripts differ from the drawn ones where the shipped CLI does: two CSS lines, not three; the folder is topclassui/, not components/topclassui/; diff prints "modified locally"; init asks nothing with --yes.

## /en/docs/css

| # | Row | Status |
|---|---|---|
| 1 | utility table | fixed, 83548180 and 40bff750 (ten rows: the five tones as one {tone} row, every xs to xl scale as one * row, families named once; values muted mono) |
| 2 | What each line brings | fixed, 40bff750 (first column 23 %, tailwindcss, --tc-*, @source and @theme inline plain). Shared, job 150: the paths' body colour and the row height (PROSE_CODE, PROSE_CELL) |
| 3 | Wrong pane wraps | fixed, 40bff750 (pane code at the drawn 11 px, so the comment keeps its two lines) |

## /en/docs/provider

| # | Row | Status |
|---|---|---|
| 1 | props table | fixed, 50b914d0 (prop names plain muted, columns 12/34/12 %); the generated rows stay, as recorded (docs-site.md:1490) |
| 2 | What it renders, cards | fixed, 50b914d0 (items-center, gap 14, p 16, title gap 6) |
| 3 | Isolation root inline code size | fixed, 50b914d0 (inline code in a card inherits its 12 px) |

## /en/docs/first-component

| # | Row | Status |
|---|---|---|
| 1 | step rows | fixed, c3513cb2 (no full stops in the leads) and 2b33cb77 (22 x 12 pill, 10 px semibold, py 14, gap 4) |
| 2 | step 4, one block | fixed, 2b33cb77 (the client file alone; the page line is a sentence of the lead) |
| 3 | callout | kept, with the install line added in c3513cb2: the samples import the package subpaths (docs-site.md:1597), so the callout installs the package; the drawn `npx topclassui add` would copy files the samples do not import |
| 4 | the action, third sentence | kept: FormActionState's first argument needs it, or the step 4 signature reads wrong |
| 5 | untitled fence header | fixed, 50b914d0 (an untitled fence reads code, a shell fence terminal; the ThemeScript block too) |

# Audit 2 (cloud-reports/audit-r12/getting-started.md, cloud/audit-r11 815df5a3)

## /en/docs/installation

| # | Row | Status |
|---|---|---|
| 1 | table header row, mono 11 px in every column but the last | shared, job 150 (PROSE_HEAD.code in classes.ts, built into PROSE_COLUMN.fit and .wrap) |
| 2 | React without Next.js, one block | fixed, 7fb760a5 (one untitled fence with the two '// file' comment lines as drawn; `checklines="10-14"` compiles the icons half, scripts/lib/samples.ts) |
| 3 | plain code text at rgb 212 against 250 | shared, job 150 (shiki-themes.ts and globals.css serve every guide fence; rests on the DECISIONS 2026-10-22 plain-code entry) |
| 4 | table cell fonts | fixed in part, 7fb760a5 (react and tailwindcss plain, react-dom code, as drawn); shared, job 150: code in a guide cell at 11 px body (AUTHORED_CELL, PROSE_CODE, INLINE_CODE in classes.ts) |
| 5 | mode switch weight | shared, job 150 (MODE_SEGMENT) |
| 6 | sidebar rest-row colour | shared, job 150 (SIDE_LINK.rest) |
| 7 | On this page offset | shared, job 150 (on-this-page.tsx, SHELL_EYEBROW) |
| 8 | footer Get started and version chip | shared, job 150 (site-footer.tsx) |
| 9 | code block header icon | shared, job 150 (CodeBlock hard-codes the terminal icon) |
| 10 | code body line pitch and padding | shared, job 150 (globals.css .docs-code) |
| 11 | prose inline code | shared, job 150 (PROSE_CODE) |
| 12 | sidebar list position | shared, job 150 (site-sidebar.tsx, sidebar-groups.tsx) |
| 13 | which section the navbar marks current | shared, job 150: keep the build and record it in DECISIONS.md, then redraw the guide navbars (Omar's call) |

## /en/docs/cli

| # | Row | Status |
|---|---|---|
| 1 | extra blocks | fixed in part, c27a8112 (both leads back to one line). Kept: the Next.js and Vite table, the flags table, the exit codes callout and the short paragraphs carry facts the drawn page lacks; they need a DECISIONS.md entry and a Figma redraw, or a reference page, which is Omar's call (DECISIONS.md is outside this branch) |
| 2 | tree rows 42.5 px, card fill | fixed, c27a8112 (names on a 17 px line: 40 px rows). Kept: the fill stays bg-page, since the frame binds base/surface but renders 0 |
| 3 | What it never does, card heights | fixed, c27a8112 (title on a 17 px line; the guides job's cards.tsx already sets the 15 px text line; the three texts shortened to two lines each, plain text as drawn) |
| 4 | On this page entry that wraps | shared, job 150 (TOC_LINK in classes.ts) |
| 5 | Running without prompts header | fixed, c27a8112 (title "code"); the icon is row 9 above, shared |

## /en/docs/css

| # | Row | Status |
|---|---|---|
| 1 | utility table wrapping and cell font | fixed, 241b9ba1 (token names plain muted text, the families shortened, size and padding named in words, utilities 10.5 px body code: every row on one line) |
| 2 | path cells | shared, job 150 (cell code style, AUTHORED_CELL and PROSE_CODE) |

## /en/docs/provider

| # | Row | Status |
|---|---|---|
| 1 | props table column widths | fixed, 290dcb7a (types and defaults at 10.5 px, Default wraps, description 41.5 %; Prop stays fit so numberingSystem keeps whole) |
| 2 | What it renders, card heights | fixed, c27a8112 (cards.tsx title line) with the guides job's 15 px text line |

## /en/docs/first-component

| # | Row | Status |
|---|---|---|
| 1 | step row heights and badge | fixed, 8d6a62d1 (title and text on 17 px lines, the badge at the title top) |
| 2 | step 2 page sample length | kept: step 1's action takes (_state, formData) so step 4's FormAction can use it, and step 2 wraps it in a one-line Server Action; a DECISIONS.md entry and a redraw of 193:3158 are Omar's call |
| 3 | step 4 lead | fixed, 8d6a62d1 (the page line is a Caption under the block; the lead is the drawn sentence) |
