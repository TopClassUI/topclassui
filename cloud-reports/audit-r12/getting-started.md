# Figma audit 2, getting started

Second audit on preview/r8-all 6963704f (preview 99ae7ded with 144, 146, 141 and 147 merged; the lead has since merged the same) at 1440 dark: every first-audit row re-checked (still open) plus a fresh pass (new), each re-checked by a second reviewer. Close every row or record why it stays.

## /en/docs/installation: differs (13)

Note: Verifier pass, done independently. I re-read the Figma design context for 193:1768, 193:1814, 193:1590, 193:1623 and 193:1885 and get_metadata for 193:1588. I re-probed http://localhost:4621 with Playwright (probe.json, shell.txt and the foot.mjs output) and cropped fig-installation.png against r13/page-installation.png. All crops and probes are in handoff/figma-audit/r13-review/getting-started-skeptic/: ins-tables.png, ins-vite.png, nav-left/right.png, side.png and foot-l/r.png. 11 of the reviewer's 12 open shell and page differences survive, some with corrected numbers. Row 13 (the brand tile) is refuted as a recorded decision. Row 17 loses its licence/license spelling half. I added 2 differences. Not a difference: the content column is 930/932 px against 944 because headless Chromium draws a 10 px classic scrollbar (the page lays out at 1430), and docs-site.md records one shell spacing. Recorded, so not reported: the breadcrumb in place of the route text (docs-site.md:446-448), the dropped Next steps callout (docs-site.md:1285), and the Previous/Next pager (DECISIONS.md:71).

1. **[medium] (new) Peer dependencies and Framework support tables, header row (also CSS, Provider and the two CLI tables)**
   - Frame: 41 px header row on base/page: py 12 around Inter Semi Bold 14 px on a normal (17 px) line, base/body. This holds in every column: 'Package | Range | Why it is required' (193:1769) and 'Framework | Tier | What changes' (193:1815). The CSS frame (193:2478, 193:2505) and the Provider frame (193:2809) draw the same.
   - Build: 38 px header row. Every column but the last is Geist Mono 11 px/14 px w400 ('Package' 144.1 px, 'Range' 94.9 px, 'Framework' 246.4 px, 'Tier' 94.9 px), and only the last column is Inter 14 px w600, on a 14 px line. Measured the same on CSS ('Line', 'Token'), on Provider ('Prop', 'Type', 'Default'), and on the CLI tables ('Where', 'Next.js App Router', 'Vite', 'Flag'). Figma draws no CLI table at all, but the drawn header style is the same on every other guide table.
   - Cause: apps/docs/components/classes.ts:92-95 PROSE_HEAD.code ('in-aria-[rowindex=1]:font-mono in-aria-[rowindex=1]:text-[0.6875rem]/3.5') is built into PROSE_COLUMN.fit and .wrap (:99-100), which every column but the last gets (mdx-table.tsx:53, props-table.tsx:29-31, theme-utilities.tsx:47). PROSE_HEAD.prose (:94) is text-sm/3.5 (a 14 px line). Both came in with c7c65f16.
   - Fix: classes.ts:99-100: build fit and wrap with PROSE_HEAD.prose. Make PROSE_HEAD.prose 'in-aria-[rowindex=1]:text-sm/[1.0625rem] in-aria-[rowindex=1]:font-semibold', which gives a 12+17+12 = 41 px header. If another guide frame really draws a mono header, give that table an opt-in constant.
2. **[medium] (still open) row 8, React without Next.js, code**
   - Frame: 193:1875: one 944x358 block. A 43 px header (icon/copy + 'code' + Copy) over a 313 px body holding 15 lines: '// vite.config.ts' … blank … '// src/icons.ts - once per app' … registerIcons(...).
   - Build: Two blocks, 12 px apart: 'vite.config.ts' (932x192, pre 146) and 'src/icons.ts' (932x157.7, pre 111.7). That is 362 px in all, with two headers and two Copy buttons.
   - Cause: apps/docs/content/en/installation.mdx:52-60 and :62-68 are two fences (the second marked check). No DECISIONS.md or docs-site.md entry records the split. docs-site.md:500 records only the file-name header.
   - Fix: Either merge them into one ```ts fence with the two '// file' comment lines as drawn (keep check by compiling the icons half through a hidden preamble), or record the two-block form in docs/DECISIONS.md and redraw 193:1875.
3. **[medium] (added by verifier) plain code text colour in every guide code block**
   - Frame: Untokenised code text binds base/body: rgb 250 in dark (193:1886 '{ defineConfig }', the whole CLI transcripts 193:2220 and 193:2122, the tab code 193:1740). Only keywords (#51a2ff), strings (#00d492) and comments (#a1a1a1) are coloured.
   - Build: Plain identifiers in highlighted fences peak at rgb 212 (#d4d4d4), against 250 drawn ('{ defineConfig }' at y 1373, and the tab code 'npm i topclassui@beta zod'). Every 'text' fence (the CLI's init, add and diff transcripts) peaks at 158-161 (muted), so those blocks look clearly greyer than drawn (cli-diff.png). Keyword and comment colours match.
   - Cause: apps/docs/lib/shiki-themes.ts:13 DARK_GROUND.text '#d4d4d4' (and LIGHT_GROUND.text '#262626' for light). apps/docs/app/globals.css:167 `.docs-code > pre { color: var(--tc-muted) }`: a 'text' fence's spans carry no --tc-code-on-dark, so globals.css:173 resolves to inherit and they take the pre's muted colour.
   - Fix: shiki-themes.ts: DARK_GROUND.text '#fafafa' and LIGHT_GROUND.text '#0a0a0a' (the body colour of each ground; shiki-contrast.test.ts still passes). globals.css:167: color var(--tc-body).
4. **[low] (still open) row 19, table cell fonts (Range, package and framework names)**
   - Frame: 193:1768: Range '^19.0.0' and '^4.2.0' are Roboto Mono 10.5 px, base/body, on a 1.72 line. 'react' and 'tailwindcss' are Inter 14 muted, and 'react-dom' is Roboto Mono 10.5 body. 193:1814: framework names are Roboto Mono 10.5 body. The Framework column is 232 px, and the 'What changes' row 1 breaks after 'Icon works'.
   - Build: Range is Geist Mono 13 px in the body colour (lab 98), and '^19.0.0' is 54.6 px wide, so it reads heavy. All three package names are Geist Mono 13 px muted. Framework names are Geist Mono 13 px muted, and 'Next.js 15 or 16, App Router' is 218.4 px with nowrap. That makes column 1 246.4 px (the Widths value w-[24.6%] would be 228.8) and What changes 588.7 px, so row 1 breaks after 'Icon works by'.
   - Cause: apps/docs/components/mdx/peer-range.tsx:9 uses INLINE_CODE (classes.ts:81 'font-mono text-sm text-body'). Backticked cells (installation.mdx:27-29, :41-42) render through mdx-map.tsx:36 with PROSE_CODE (classes.ts:84, text-muted). AUTHORED_CELL (classes.ts:105 '**:text-[length:inherit] **:whitespace-nowrap') scales both to the cell's 13 px and forbids a break.
   - Fix: Set code in a guide cell to the drawn 11 px in the body colour: mdx-map.tsx:36 marks inline code (for example data-code), and AUTHORED_CELL adds '**:data-code:text-[0.6875rem] **:data-code:text-body'. peer-range.tsx:9 becomes 'font-mono text-[0.6875rem] text-body'. Drop the backticks on react and tailwindcss at installation.mdx:27 and :29, keeping react-dom as code, as drawn. At 11 px the framework name is about 185 px and fits the 228.8 px column.
5. **[low] (still open) row 12, navbar mode switch weight**
   - Frame: 193:1606: the Light, Dark and Ocean labels are all Inter Medium (500) 12 px.
   - Build: Light and Ocean are w400 and only the checked Dark is w500 (13 px, probe), so the two unselected labels look thinner than drawn (nav-right.png).
   - Cause: apps/docs/components/classes.ts:34 MODE_SEGMENT = `font-normal data-checked:font-medium ${TYPE.nav}`.
   - Fix: MODE_SEGMENT = `font-medium ${TYPE.nav}`.
6. **[low] (still open) row 15, sidebar rest-row text colour**
   - Frame: In the export the rest rows render at a peak of rgb 128 (Home, Add with the CLI, Colors, Changelog) on rgb 10. The layers bind base/body (193:1631 etc.), so the frame is internally inconsistent: only 'Components' renders at 250.
   - Build: Every rest row peaks at rgb 161 (text-muted, lab 66.1), so the rows are visibly brighter than drawn (side.png).
   - Cause: apps/docs/components/classes.ts:39 SIDE_LINK.rest 'text-muted'.
   - Fix: Either SIDE_LINK.rest 'text-muted/80' (about rgb 131 on the page, about 5:1, still AA), or keep muted and fix the frame's rows so that what it renders matches its binding. Pick one and record it.
7. **[low] (still open) row 16, On this page vertical offset**
   - Frame: 193:1708: ON THIS PAGE at shell+36 on a 12 px line; entries from shell+58 at a 25 px pitch. Measured ink tops: eyebrow 96, first entry 119 (page y).
   - Build: Eyebrow ink at 98 (+2). First entry ink at 127 (+8): the eyebrow sits on a 16 px line with mb 10 above a 24 px entry box at y 120. The pitch matches at 25.
   - Cause: apps/docs/components/shell/on-this-page.tsx:20 `mb-2.5 ${SHELL_EYEBROW}`, where SHELL_EYEBROW carries TYPE.eyebrow 'leading-4' (classes.ts:9, :28), over the 24 px TOC_LINK box.
   - Fix: on-this-page.tsx:20: replace the eyebrow's leading-4 with leading-3 and mb-2.5 with mb-1.5, through cn() or a TOC-only constant. Do not just append leading-3: both set --tw-leading and leading-4 sorts later. The eyebrow then lands at 96 and the first entry's ink at 119.
8. **[low] (still open) row 17, footer Get started column and version chip**
   - Frame: Get started: Installation, Tailwind CSS v4 setup, Provider and root layout, Your first component, Install one component (CLI). Version chip 'v0.1.0', 51 px.
   - Build: Get started: Install the package, Install one component (CLI), CSS entry, Provider, Your first component (page titles in sidebar order, CLI second). Version chip 'v0.1.0-beta.1 beta', 115.2 px, which pushes WCAG 2.2 AA to x 244.6 against 181.
   - Cause: apps/docs/components/shell/site-footer.tsx:51-55 lists LIVE_PAGES titles in registry order. site-footer.tsx:77 passes the full VERSION ('0.1.0-beta.1', lib/site.ts:28) to labels.footer.version, which then appends ' beta' as well. docs-site.md:479-480 asks for 'v0.1.0 beta'.
   - Fix: Give the Get started column its own footer labels in the drawn order, with the CLI last. Pass VERSION.split('-')[0] to labels.footer.version so the chip reads 'v0.1.0 beta'.
9. **[low] (still open) row 20, code block header icon (every guide fence)**
   - Frame: Code blocks draw icon/copy at 13 px before 'code' (193:1877, 193:2196, 193:2465, 193:3145 …). icon/terminal-window appears only on the 'terminal' blocks (193:2113, 193:2128, 193:2211).
   - Build: Every titled header draws terminal-window at 14 px: vite.config.ts, src/icons.ts, app/globals.css, app/[locale]/layout.tsx, topclassui.json, the actions/page/subscribe-form files, and the untitled 'code' blocks too (ins-vite.png).
   - Cause: packages/topclassui/src/components/code-block/index.tsx:40 hard-codes <Svg icon={terminalWindow}> for every named header.
   - Fix: Give CodeBlock an icon prop that defaults to terminalWindow. apps/docs/components/mdx/code-frame.tsx:35 passes the copy icon unless the block is titled 'terminal' (code-fence.tsx:97, the SHELL branch at :33).
10. **[low] (still open) row 21, code block body line pitch and padding**
   - Frame: Roboto Mono 11 px on a 1.72 line (18.9 px pitch) in a body padded 14 px on every side. The 2-line tab body is 66 px (193:1739) and the 15-line Vite body is 313 px.
   - Build: Geist Mono 12 px on a 17.14 px pitch, with pre padding 14 top, 12 sides and 12 bottom. The 2-line tab body is 60.3 px, and every multi-line fence is about 10% shorter than drawn (ins-vite.png: line pitch 17 against 19). The WrongRight panes already use an 18 px pitch.
   - Cause: apps/docs/app/globals.css:165-170 `.docs-code > pre { line-height: var(--text-sm--line-height) }` gives 20/14 x 12 = 17.14. px-3 pb-3 come from CodeBlock's pre.
   - Fix: globals.css:169: line-height 1.58 (19 px at 12 px). Add padding-inline: 0.875rem and padding-block-end: 0.875rem in the same rule.
11. **[low] (still open) row 22, prose inline code on every guide page**
   - Frame: Backticked words in paragraphs, step texts and cards are plain Inter in the paragraph's own size and colour: 'Import Icon from topclassui/icon-registry' (193:1874), 'add never overwrites … diff … --overwrite' (193:2208), 'an Input inside a Field' (193:3135), '--overwrite' in the CLI card (193:2261).
   - Build: Geist Mono 14 px muted runs inside the 16 px sentences. Installation: Icon, topclassui/icon-registry, index.html. CSS: @source, @tailwindcss/vite. Provider: direction, locale, document.dir, html, dir, head, data-theme and 7 more. First component: Input, Field, Button, fieldErrors, FormAction, <SubscribeForm …/>. CLI: init, add, diff, --all, --json, --overwrite, --cwd <dir> and more, plus the card texts (topclassui/, topclassui.json, --no-install, --overwrite).
   - Cause: apps/docs/components/classes.ts:84 PROSE_CODE 'font-mono text-sm text-muted', applied to every MDX inline code at mdx-map.tsx:36 (the cards keep it through cards.tsx:19 '**:text-[length:inherit]').
   - Fix: PROSE_CODE = 'text-muted' (keep dir=ltr) to match the frames, or redraw the frames' prose with mono runs. Pick one for every guide.
12. **[low] (new) sidebar, vertical position of the list**
   - Frame: 193:1623: Documentation row 27 px (17 px line + pb 10), gap 2; each group label row 31 px (pt 14 + 12 + pb 5), gap 2. Home at page y 140, Colors 359, Components 578.
   - Build: Title row 30 px (20 px line + pb 10), root gap 4, then a group pt of 8 and a 24 px label. Home at y 146 (+6), Colors 366 (+7), Components 586 (+8): every group adds 1 px (DOM probe, shell.txt).
   - Cause: apps/docs/components/shell/site-sidebar.tsx:18 TITLE text-sm (20 px line); SIDEBAR_ROOT gap-1 (packages/topclassui/src/components/sidebar/classes.ts:16); sidebar-groups.tsx:21 'pt-2' above SIDEBAR_GROUP_LABEL (py-1, 16 px line = 24).
   - Fix: site-sidebar.tsx:18 TITLE adds 'leading-[1.0625rem]' (a 27 px row); RAIL (:17) adds 'gap-0.5', which merges over gap-1; sidebar-groups.tsx:21 'pt-1.75 *:gap-0.5'. That puts Home at 140, Colors at 359 and Components at 578.
13. **[low] (added by verifier) navbar and sidebar, which section is marked current**
   - Frame: Every guide frame (193:1590 and the same navbar on 193:1976, 193:2330, 193:2661, 193:3003) draws 'Components' as the active top link: Inter Semi Bold 14, base/body, while Docs is Regular muted. The sidebar's Components row renders at rgb 250 while the other rest rows render at 128.
   - Build: 'Docs' is w600 body with aria-current=page and Components is w400 muted. The sidebar Components row is muted (161) like every other rest row (nav-left.png, side.png).
   - Cause: The build marks the section of the current page (the shell navbar's current link). The frames appear to copy the Components-page navbar onto the guide pages. docs-site.md:354 only notes what the frame draws, and DECISIONS.md:89 adds 'Docs' to the navbar but says nothing about which link is current.
   - Fix: Keep the build. Record in docs/DECISIONS.md that the navbar and sidebar mark the current page's section ('Docs' on a guide page), and redraw the five guide frames' navbars with Docs semibold and the sidebar's Components row like the other rest rows.

## /en/docs/cli: differs (5)

Note: Verifier pass. I re-read get_metadata 193:1974 and the design context for 193:2206, 281:1762, 322:1801 and 193:2252, probed with Playwright (probe.json, pages.json), and cropped r11-review/getting-started/fig-cli.png against r13/page-cli.png (cli-diff.png, cli-tree.png, cli-cards.png, cli-toc.png, ov-cli-1/2.png). All 4 claimed differences survive. Two have corrected numbers: the first card runs 4 lines, not 5, and the diff lead is a further lengthened block. I added 1 difference. The shipped-CLI transcripts, the file names and the 24 tree rows against 26 are content, not reported. The shell, code-header icon, line pitch, plain code colour and prose code differences are under /en/docs/installation.

1. **[low] (still open) row 6, extra blocks folded into the drawn sections**
   - Frame: Seven sections and no table or callout. Every lead is one line. Shell 3255 px, page 3634.
   - Build: Under Initialise once, the 'Where | Next.js App Router | Vite' table (930x168.7). Extra paragraphs: 'It then installs …' (3 lines), 'list prints …', 'Import from the folder …' (2 lines), 'After you update the package …' and 'Every command also takes --cwd …'. Lengthened leads: Initialise once (2 lines) and When you have edited a copied file (2 lines, 48 against 26 px). The Flags table (930x342.9, 7 rows) and the 932x41.5 'Exit codes' info callout under Running without prompts. Page 4532 px tall.
   - Cause: apps/docs/content/en/cli.mdx:9, :28-34, :51, :84, :109, :120 and :130-142. No DECISIONS.md or docs-site.md entry covers them; docs-site.md:1408 says 'built as drawn'.
   - Fix: Add the table, the flags table and the callout to Figma 193:1974 and record them in docs/DECISIONS.md. Or move the flags table and exit codes to a reference page and trim the two leads back to one line.
2. **[low] (new) What lands in your project, file tree rows and fill**
   - Frame: 281:1762: rows 40 px (border-t 1 + py 11 + Roboto Mono 13 px on a normal 17 px line; Inter 12 muted note), 26 rows, 944x1041. The card binds base/surface, but the export renders it rgb 0, darker than the page's 10.
   - Build: Rows 42.5 px, because the name span takes a 19.5 px line (13 x 1.5 inherited). 24 rows, 932x1021. Card fill bg-page, rgb 10 (cli-tree.png: the drawn pitch is 40 and the build's 42.5).
   - Cause: apps/docs/components/mdx/file-tree.tsx:10 NAME 'shrink-0 font-mono text-[0.8125rem] text-body' (no line height); file-tree.tsx:5 CARD 'bg-page'.
   - Fix: file-tree.tsx:10 NAME 'shrink-0 font-mono text-[0.8125rem]/[1.0625rem] text-body' (40 px rows). For the fill, the frame contradicts itself (base/surface would render 23 in dark, not 0). Keep bg-page and rebind the frame's tree to base/page, or use bg-surface if the binding is the intent.
3. **[low] (new) What it never does, card heights**
   - Frame: 193:2252: three 305 px cards, 87 / 87 / 102 px. p 16, title Inter Semi Bold 14 on a 17 px line, gap 6, text Inter 12 on a 15 px line: 2 / 2 / 3 lines, all plain text ('--overwrite' is Inter).
   - Build: Three 301.3 px cards, 125.1 / 110.3 / 109.1 px. The title is on a 20 px line and the text on a 16 px line. The first card runs 4 lines (65.1 px) and the other two 3 lines each, because the wording is longer, and the cards carry Geist Mono runs (topclassui/, topclassui.json, --no-install, --overwrite).
   - Cause: apps/docs/components/mdx/cards.tsx:15 h3 'text-sm' (20 px line) and :19 'text-xs' (16 px line); cli.mdx:147-149 card texts longer than drawn; inline code via PROSE_CODE (installation row 22).
   - Fix: cards.tsx:15 'text-sm/[1.0625rem] font-semibold text-body'; cards.tsx:19 'text-xs/[0.9375rem] text-muted …'. Shorten cli.mdx:147-148 to two lines each (for example 'It sends nothing. The only download is the install it runs.').
4. **[low] (new) On this page, an entry that wraps to two lines (also CSS and First component)**
   - Frame: 193:2100 'When you have edited a copied file' wraps to a 30 px box. Ink tops: The config file 194, the wrapped entry 219 / 234, Running without prompts 259. That is 25 px above the wrapped entry and 25 below its second line (text tops 25 and 40 apart).
   - Build: Ink tops 202, 223 / 239, 260: 21 px above and 21 below the second line (text tops 21 and 37 apart), so the wrapped entry crowds its neighbours. Measured the same on CSS ('Why there is no tailwind.config.js': anchors 145/170/203) and First component ('4. Show the error without a reload': 195/220/253).
   - Cause: apps/docs/components/classes.ts:22-25 TOC_LINK is QUIET with TOUCH_TARGET (a 24 px minimum and no padding), used at toc-list.tsx:17. A one-line entry centres its 16 px line in 24, while a two-line entry fills 32 with no room above it.
   - Fix: Add 'py-1' to TOC_LINK.current and TOC_LINK.rest. A one-line entry stays 24 px and a two-line entry becomes 40, so text tops sit 25 and 41 px apart as drawn.
5. **[low] (added by verifier) Running without prompts, code block header**
   - Frame: 193:2239: icon/copy and the label 'code' (a code block, not a terminal).
   - Build: The header reads 'terminal' with the terminal-window icon (ov-cli-2.png).
   - Cause: apps/docs/content/en/cli.mdx:124 ```bash title="terminal".
   - Fix: cli.mdx:124 title="code" (keep bash for the comment colour). With the installation row 20 fix, choose the icon from the 'terminal' title rather than the language, so this block gets icon/copy.

## /en/docs/css: differs (2)

Note: Verifier pass. I re-read the design context for 193:2477 and 193:2504 and get_metadata 193:2328, probed with Playwright, and cropped r11-review/getting-started/fig-css.png against r13/page-css.png (css-t1.png, css-t2.png, css-wr.png, ov-css-0.png). Both claimed differences survive. Row 1 is narrowed: its three extra rows (overlay, tones, font) are the recorded consequence of generating the table from @theme inline (docs-site.md:1430-1432), so only the wrapping and the cell look remain. The Wrong/Right panes match: 18 px pitch, edges, labels. Out of scope here: the table headers, the two-line On this page entry, the code icon, line pitch, plain code colour and prose code, each covered under another target.

1. **[low] (still open) row 1, The utility names you get, wrapping and cell font**
   - Frame: 193:2504: 7 rows, 944x340, columns 348/596. Every row is one line, 41-43 px. Cells are mostly Inter 14 muted ('--tc-page, surface, surface-raised', 'bg-page bg-surface …', 'control sizes', 'radius knobs'), with Roboto Mono 10.5 body only for 'text-body text-muted', '--tc-ring', 'outline-ring' and 'h-control-xs to h-control-xl'.
   - Build: 930x530: 10 rows, of which 3 are recorded extras. Every cell is Geist Mono 13 px muted. Three rows wrap in the 344.1 px Token column or the 585.9 px Utilities column: primary 63 px (2 lines in both columns), spacing 59 px (2 lines), tones 76 px (3 lines). The 7 drawn families alone take 343 px against 340 drawn, the primary and spacing rows adding 38 px.
   - Cause: apps/docs/components/mdx/theme-utilities.tsx:10 VALUE 'font-mono text-muted' at the cell's 13 px; the long family strings from groupedRows (apps/docs/lib/utility-row.ts), for example '--spacing-control-*, toggle-*, knob-*, icon-*, pad-x-*, pad-y-* (* is xs to xl)'.
   - Fix: Keep the generation, but have groupedRows emit the drawn short family names ('--tc-primary-solid and its on-solid, on-soft, soft', 'control sizes', 'radius knobs', '{tone} as primary (…)') and the 'h-control-xs to h-control-xl' scale form. theme-utilities.tsx:10/:21: render the token names as plain muted text and the utilities in the cell-code style of installation row 19 (11 px body). Every row then fits on one line.
2. **[low] (still open) row 2, What each line brings, path cells**
   - Frame: 193:2477: topclassui/tokens.css and topclassui/styles.css are Roboto Mono 10.5 px, base/body, on a 1.72 line; tailwindcss is Inter 14 muted.
   - Build: Both paths are Geist Mono 13 px muted (lab 66). The columns, 213.9/716.1, match the drawn 23%, and tailwindcss is plain text as drawn.
   - Cause: apps/docs/content/en/css.mdx:22-23 backticks render through PROSE_CODE (classes.ts:84, text-muted), and AUTHORED_CELL (classes.ts:105) scales them to the cell's 13 px.
   - Fix: The same cell-code fix as installation row 19: inline code in a guide cell at text-[0.6875rem] in the body colour.

## /en/docs/provider: differs (2)

Note: Verifier pass. I re-read get_metadata 193:2659 and the design context for 193:2808, probed with Playwright (probe.json, pages.json), and cropped r11-review/getting-started/fig-provider.png against r13/page-provider.png (prov-wr.png, ov-provider-0/1.png). Both claimed differences survive, with one correction. The frame's types are mixed, not all mono (ltr | rtl, Partial<Labels> and latn | arab are mono 10.5 body; string, { query } and the collection type are Inter 14 muted). The reviewer's 115 px Prop column would break 'numberingSystem' mid-word, as the frame does, so the fix below takes the room from Default instead. Recorded, so not reported: the generated 9 rows (docs-site.md:1512-1515) and the SPA sample without topclassui/vite (docs-site.md:1514-1515). The Wrong/Right panes match.

1. **[medium] (still open) row 1, The props table, column widths**
   - Frame: 193:2808: columns 115/322/115/392, 6 rows, 944x366. Descriptions run 1-2 lines (rows 41-61 px). Defaults are Inter 14 muted (only '(width < 48rem)' is mono and wraps).
   - Build: Columns 139.7/303.9/246.4/240, 9 rows, 930x705. The Default column grows to 246.4 px to keep object defaults on one line at 13 px mono ('{ query: '(width < 48rem)' }' is 218.4 px; '{ placement: 'bottom-end',' is 202.8). That leaves descriptions 240 px, so they wrap to 2-5 lines and rows run 59-110 px. Types are Geist Mono 13 px in the body colour.
   - Cause: apps/docs/components/mdx/props-table.tsx:31 gives Default PROSE_COLUMN.fit (whitespace-nowrap) over DEFAULT_CODE/DEFAULT_LINE blocks, so w-[12%] is only a floor. :29 Prop is fit ('numberingSystem' 111.7 + 28). :30 TABLE_CODE (classes.ts:108) prints at the cell's 13 px.
   - Fix: props-table.tsx:31: PROSE_COLUMN.wrap, so a default may break at its spaces. DEFAULT_CODE and TABLE_CODE in this table use text-[0.6875rem] (the drawn 10.5). :32: description 'w-[41.5%]'. Keep Prop at fit (140 px) so 'numberingSystem' stays whole; Default then holds about 115 px and descriptions about 350-390 px with 1-2 lines.
2. **[low] (new) What it renders, card heights**
   - Frame: 193:2892: cards 87 / 72 / 72 / 87 px (p 16, title 14 on a 17 px line, gap 6, text 12 on a 15 px line). The block is 188 px.
   - Build: Cards 92 / 76 / 76 / 93.1 px, with the title on a 20 px line and the text on a 16 px line. The block is about 199 px. The 'isolation: isolate' run is mono (prose code, installation row 22).
   - Cause: apps/docs/components/mdx/cards.tsx:15 h3 'text-sm' and :19 'text-xs' use the scale's default line heights.
   - Fix: The same as the CLI cards: cards.tsx:15 'text-sm/[1.0625rem]' and :19 'text-xs/[0.9375rem]'.

## /en/docs/first-component: differs (3)

Note: Verifier pass. I re-read get_metadata 193:3001 and the design context for 193:3172 and 193:3133, probed with Playwright (pages.json, probe.json), and cropped r11-review/getting-started/fig-first-component.png against r13/page-first-component.png (fc-steps.png, ov-first-component-0.png). All 3 claimed differences survive. The badge offset is 2.5 px of visual difference (the badge is centred on the title line in the build and sits at the title box top in the frame); it is kept only as part of the row fix. Not reported: the callout wording (recorded, docs-site.md:1600-1601), the file-name headers in place of the '// path' comment lines (docs-site.md:500), the import paths (docs-site.md:1599-1600), and the two-line On this page entry (covered under /en/docs/cli).

1. **[low] (new) 3. What you should see, step row heights**
   - Frame: 193:3172: rows 66 / 84 / 67 px. px 16, py 14, gap 12. The title is Inter Semi Bold 14 on a 17 px line, then a 4 px gap, then the text, Inter 14 on a 17 px line. The 22x12 badge's top is level with the title box (both at row y 14). Block 219 px.
   - Build: Rows 73 / 93 / 72 px, with the title and text on 20 px lines. The badge has mt 4 (badge 1415.8, title box 1411.8), so it centres on the title line instead of sitting at its top. Block 240 px. Step 3's 'Input, Button and Field' are mono (installation row 22).
   - Cause: apps/docs/components/mdx/steps.tsx:10 TITLE and :11 TEXT 'text-sm' (20 px line); apps/docs/components/classes.ts:228 STEP_NUMBER '… mt-1'.
   - Fix: steps.tsx:10 and :11 use 'text-sm/[1.0625rem]'; classes.ts:228 drops 'mt-1'. That gives 66/84/67 px rows with the badge at the title top.
2. **[low] (new) 2. The page, code sample length**
   - Frame: 193:3158: 17 lines (body 351 px, block 944x396), the first line being the '// app/subscribe/page.tsx' comment.
   - Build: 21 lines in a 932x432 fence (pre 386). The path moved to the header (recorded), but a 5-line 'async function send(formData: FormData) { 'use server'; await subscribe({}, formData) }' wrapper and a blank line sit before the return.
   - Cause: apps/docs/content/en/first-component.mdx:45-49. The wrapper is needed because step 1's action now takes (_state, formData) for FormAction (:24). No DECISIONS.md entry records it; docs-site.md:1599 says 'As drawn'.
   - Fix: Record the wrapper in docs/DECISIONS.md and redraw 193:3158. Or export a one-argument action for step 2 and keep the two-argument one for step 4's FormAction.
3. **[low] (new) 4. Show the error without a reload, lead**
   - Frame: 193:3193: one line (26 px): 'Move the form into a client file and use FormAction. Errors land on the matching field.'
   - Build: Two lines (48 px). The sentence 'The page renders <SubscribeForm action={subscribe} />.' is added, and its 14 px mono run wraps across the line break (code box 902.6x42).
   - Cause: apps/docs/content/en/first-component.mdx:69.
   - Fix: Move the sentence after the block as a one-line Caption (mdx-map.tsx:43) so the lead keeps the drawn single line, or record it and redraw 193:3193.

## Refuted by the second reviewer (do not act)

- /en/docs/installation, (still open) row 13, navbar and footer brand tile: Recorded decision: DECISIONS.md:89 (job 124, 'Home is built from the Figma frame 191:1495') took 'the mark from docs/brand/ in the navbar, footer, product frame …'. The 24x24 primary tile with the TopClass mark replaces the drawn 15x25 palette tile by decision, and the name shifts with it (footer x 72 against 62, navbar links +12).
- /en/docs/installation, (still open) row 17, the 'MIT licence' vs 'MIT license' chip: Only the spelling differs: the chip is 77.4 px against 78 drawn, with the same layout. That is a wording-only difference, which the brief excludes. The rest of row 17 (Get started column, version chip) is kept above.
- /en/docs/css, (still open) row 1, the overlay, tones and font rows that the frame lacks: Recorded: docs-site.md:1430-1432 generates 'The utility names you get' from styles.css's @theme inline block so it cannot fall behind, which brings these three families in. Only the wrapping and the cell look are kept above.
- /en/docs/installation, (still open) row 12, the switch measuring 228.8x32 against 217x31: The size comes from the 13 px nav step against the drawn 12 px (a type-scale snap within 1 px) and is within tolerance; only the weight difference is kept.
