# Getting started, audit status (job 146)

Each row of cloud-reports/audit-r11/getting-started.md (on cloud/audit-r11) with its status on fix/r11-getting-started. Shared means the shell, the library or a class constant the five pages share with every other page; those rows go to job 150.

## /en/docs/installation

| # | Row | Status |
|---|---|---|
| 1 | navbar, search trigger border | fixed, 3260f1d2 (SEARCH_TRIGGER takes border-line; dfc90103 had changed only the size) |
| 2 | tab cards, header row | fixed, aa83e64c (code-tabs LIST w-full max-w-none) |
| 3 | tab cards, copy button | fixed, aa83e64c (showCopy={false} in both tab blocks, the 3rem pre padding dropped) |
| 4 | navbar height | already fixed, dfc90103 (min-h-14.5) |
| 5 | sidebar rows | already fixed for the 29/31 px pitch, dfc90103 (RAIL 1.8125rem); the 14 px text (SIDE_LINK TYPE.nav) is shared, job 150 |
| 6 | table column widths | fixed, aa83e64c (`<Widths>` around the two tables: 15.5/10.2 and 24.6/10.2 %) |
| 7 | icon-registry breaks at its hyphen | fixed, aa83e64c (plain text in the prose cell, as drawn) |
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
| 18 | tables, row height | shared, job 150 (PROSE_CELL in classes.ts serves every guide table) |
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
