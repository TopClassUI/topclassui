# Figma audit 2, guides

Second audit on preview/r8-all 694273fe at 1440 dark: every first-audit row re-checked (still open) plus a fresh pass (new), each re-checked by a second reviewer. Close every row or record why it stays.

## /en/docs/colors: differs (15)

Note: Checked again against frame 181:1144 using get_metadata, plus design context on 344:1792, 344:1799, 181:1385, 181:1341, 181:1392, 181:1278 and 345:16. I compared it with r12/page-colors.png in crops (r12-review/guides/skeptic/c-*.png) and fresh DOM probes (skeptic/ev.mjs with tables.js, misc.js, callout.js, board.js, shell.js, toc.js, fhead.js). Pixel samples: frame plain code is 250,250,250 and build plain code is 212,212,212. Frame code in the class cells is about 235 and the build is 161. Every row below was reproduced. I refuted the callout-icon row because it is within 2 px. I widened row 11 to cover all three fences. I added the navbar current-link row.

1. **[medium] (still open) Every class table, Class and Variable cells (row 2)**
   - Frame: Roboto Mono 13 px in base/body (#fafafa), from 344:1801 and 344:1803
   - Build: Geist Mono 13 px in text-muted (lab 66, about #a1a1a1) in all 24 code cells
   - Cause: apps/docs/components/mdx/mdx-map.tsx:35 renders backticks with PROSE_CODE (apps/docs/components/classes.ts:84, text-muted). AUTHORED_CELL at classes.ts:105 resets only the size and the wrapping
   - Fix: classes.ts:105: AUTHORED_CELL = '**:text-[length:inherit] **:whitespace-nowrap [&_code]:text-body'
2. **[low] (still open) Every class table, 'What it is for' header (row 1)**
   - Frame: Roboto Mono 10.5 px Regular in body, like Class and Variable (344:1798)
   - Build: Inter Semi Bold 14 px (PROSE_HEAD.prose), because the last column is classified 'prose'
   - Cause: apps/docs/components/guides/data-table.tsx:29 applies PROSE_COLUMN[columnFit(...)], and classes.ts:101 gives the prose column PROSE_HEAD.prose. TokenTable (token-table.tsx:27) cannot override it
   - Fix: Add an optional head?: 'code' prop to DataTable (data-table.tsx:15) that swaps PROSE_HEAD.prose for PROSE_HEAD.code on the header row, and pass head='code' from TokenTable (token-table.tsx:27)
3. **[low] (still open) Every class table, rows and columns (row 7)**
   - Frame: Body rows 42 px (12 + 17 + 12 + 1 px rule). Columns 270/270/404. Table 944x544
   - Build: Body rows 43.6 px, because the inline code's 18.57 px line box raises the 17 px line. Columns 285/285/360. Table 930x560.8 (+17 px over 12 rows)
   - Cause: classes.ts:84 PROSE_CODE text-sm keeps text-sm's 1.43 line-height ratio (18.57 px at 13 px) inside the 17 px cell. The auto table layout (data-table.tsx:18-32) sets the column widths
   - Fix: classes.ts:105: add '[&_code]:leading-[inherit]' to AUTHORED_CELL so code rows are 42 px. Optionally give TokenTable a table-fixed layout with 28.6%/28.6%/42.8% columns
4. **[low] (still open) What the contrast check enforces table (row 8)**
   - Frame: Columns 456/96/392. Header row 42 px (10.5 px mono on a 1.72 line). 4.5:1, 3:1, line and exempt in Roboto Mono 10.5 px, body colour. Body rows 43/43/42/43. Table 944x215
   - Build: Columns 418/133/380. Header row 38 px. The code values are Geist Mono 13 px in muted. Rows 43.6/43.6/42/49: in the last row the 24 px inline-flex 'WCAG 1.4.11' link raises the line, so 'Decorative hairline, WCAG 1.4.11' sits 4 px below 'line' and 'exempt'. Table 930x216
   - Cause: classes.ts:105 AUTHORED_CELL sets the code colour. classes.ts:93-94 PROSE_HEAD uses /3.5 (a 14 px line), so the header is 38 px. classes.ts:5 TEXT_LINK is inline-flex with TOUCH_TARGET (min-h 24) inside a 17 px line. The auto layout hands slack to the 'fit' Threshold column, which has no width at classes.ts:99
   - Fix: Apply the AUTHORED_CELL text-body fix above. Header: in-aria-[rowindex=1]:leading-4.5 on PROSE_HEAD.code and .prose gives 42 px; keep Every class at 38 px through the head override. TEXT_LINK: add -my-[0.21875rem] so the 24 px target's margin box fits the 17 px line. PROSE_COLUMN.fit (classes.ts:99): add w-24, the frames' 96 px short column
5. **[low] (still open) Code block headers of Three layers, Three modes and Add your own theme (row 11)**
   - Frame: icon/copy 13 px, then 'code' in Roboto Mono 9 px muted (181:1280, 181:1342, 345:1849)
   - Build: terminal-window 14 px in all three. The labels are 'css', then 'topclassui/tokens.css', then 'app/globals.css' (11 px Geist Mono). The two file names are allowed. The 'css' label and the terminal icon are not
   - Cause: apps/docs/components/mdx/code-fence.tsx:51 names an untitled, non-shell fence by its language. packages/topclassui/src/components/code-block/index.tsx:40 always draws terminalWindow
   - Fix: code-fence.tsx:51: use labelsFor(locale).blocks.code for every untitled non-shell fence instead of lang. Add an icon prop to CodeBlock (index.tsx:40) and pass the copy icon unless the title is the terminal label
6. **[low] (still open) Code colours in the css fences (row 12)**
   - Frame: [data-theme="dark"]: data-theme in amber #ffb900 and "dark" in emerald (181:1352). In the Layers sample, className is amber, its string emerald, and '@theme inline {' plain
   - Build: [data-theme= in plain #d4d4d4 and 'dark' in emerald. className=" is plain and the class names are sky #00bcff. '@theme' is blue #51a2ff
   - Cause: apps/docs/lib/shiki-themes.ts:20-23 PLAIN_IN_CSS includes entity.other.attribute-name.css, so the rule at :40 paints attribute selectors plain. The className line sits in a css fence (colors.mdx:14-29)
   - Fix: shiki-themes.ts: after :40 add { scope: ['meta.attribute-selector.css entity.other.attribute-name'], settings: { foreground: palette.attribute } }. Move the className line (colors.mdx:28) into its own tsx fence, or accept CSS tokenising
7. **[low] (still open) 'WCAG 1.4.11' link (row 15)**
   - Frame: Underlined, #51a2ff (181:1391 'underline')
   - Build: text-decoration none. It underlines only on hover
   - Cause: apps/docs/components/classes.ts:5 TEXT_LINK uses HOVER.link ('hover:underline', packages/topclassui/src/shared/classes.ts:52)
   - Fix: classes.ts:5: add underline to TEXT_LINK
8. **[low] (still open) Inline names in paragraphs and in the warning callout (row 16)**
   - Frame: '@theme inline' (181:1278), and --tc-primary-solid and --tc-primary-on-solid in the callout (181:1398), all in the running Inter text
   - Build: 14 px Geist Mono (PROSE_CODE). In paragraph 2 this moves 'one' onto the second line (the frame breaks after 'each one'). The callout's two names are 14 px mono (151x18 and 176x18)
   - Cause: apps/docs/components/mdx/mdx-map.tsx:35 maps code to PROSE_CODE (classes.ts:84 'font-mono text-sm text-muted'). colors.mdx:12, :115 and :117 use backticks
   - Fix: Drop the backticks where the frame draws plain text (colors.mdx:12, :117), or set PROSE_CODE to 'font-mono text-[0.9375em] text-muted'
9. **[low] (still open) On this page, two-line entry (row 18)**
   - Frame: 'What the contrast check enforces' is 30 px tall (241-271), then a 10 px gap. 'Add your own theme' is 40 px below its top
   - Build: Box 32 px (245-277), then a 1 px gap. 'Add your own theme' box is at 278 and its text at 282, 37 px below the two-line text
   - Cause: apps/docs/components/shell/toc-list.tsx:11 gap-px, with TOC_LINK (classes.ts:22-25) min-h 24 on a 16 px line and no block padding
   - Fix: Add py-1 to TOC_LINK.current and .rest (classes.ts:23-24). Single entries stay on a 25 px pitch and a two-line entry gets 41
10. **[low] (new) Add your own theme, first paragraph**
   - Frame: One line, 26 px: 'Add one CSS block and one entry in the mode list. A mode can change knobs as well as colors.' (181:1394)
   - Build: Two lines, 48 px (3596-3644). The ThemeScript sentence was folded in, with data-theme="brand" and ThemeScript set in mono
   - Cause: apps/docs/content/en/colors.mdx:115 (the row-14 fix moved the removed callout's sentence here)
   - Fix: colors.mdx:115: shorten it to one line, e.g. 'Add one CSS block and set data-theme on the section it covers. A mode can change knobs as well as colors.' Keep the ThemeScript fact in the callout or in the code comment
11. **[low] (new) Every guide code block, plain code text colour**
   - Frame: Plain code in base/body #fafafa (181:1352 text-[color:var(--base/body)]; sampled at 250,250,250)
   - Build: #d4d4d4 (sampled at 212,212,212) on every plain token
   - Cause: apps/docs/lib/shiki-themes.ts:14 sets DARK_GROUND.text to '#d4d4d4' (commit 7fb765f6 'soften code text'; no DECISIONS or docs-site entry)
   - Fix: shiki-themes.ts:14: text '#fafafa' (neutral-50), or record the softer text in docs/DECISIONS.md
12. **[low] (new) Where each color is used, Save button inside the board**
   - Frame: 53x30. Inter Semi Bold 11.4 px, px 13, py 8, radius 6.5 (345:19)
   - Build: 46.1x28. Inter Medium 12 px, px 8, radius 8
   - Cause: apps/docs/components/guides/role-board.tsx:63 <Button size='xs'>
   - Fix: role-board.tsx:63: <Button type='button' size='xs' className='px-3 font-semibold'>
13. **[low] (new) Shell sidebar, vertical offset (all seven guide pages)**
   - Frame: Documentation row 78-105 (27 px), START HERE text at 121, Home row at 140, Colors at 359, Accessibility at 514
   - Build: Documentation 78-108 (30 px), START HERE text at 125, Home at 146, Colors at 366, Accessibility at 521: 6 to 7 px lower (the same on theming, server-first and accessibility)
   - Cause: apps/docs/components/shell/site-sidebar.tsx:18 TITLE pb-2.5
   - Fix: site-sidebar.tsx:18: change pb-2.5 to pb-1 (Home lands at 140)
14. **[low] (new) On this page, first entry offset (all seven guide pages)**
   - Frame: Eyebrow 94-106, first entry text at 116
   - Build: Eyebrow box 94-110, mb 10, first entry box at 120 with its text at 124: 8 px lower on every page
   - Cause: apps/docs/components/shell/on-this-page.tsx:20 mb-2.5 under SHELL_EYEBROW leading-4
   - Fix: on-this-page.tsx:20: change mb-2.5 to mb-0.5
15. **[low] (added by verifier) Navbar, current link on a guide page**
   - Frame: 'Components' in Inter Semi Bold, body colour, with Docs muted, on every guide frame (181:1153, 181:1817, 183:1587, ...)
   - Build: 'Docs' is the current link (semibold, body) and Components is muted on Colors. On /en/changelog no link is current
   - Cause: apps/docs/components/shell/site-navbar.tsx:61 current={link.slugs.includes(current)} marks the page's own section. The frames carry the same Components highlight on every page
   - Fix: No code change. Record in docs/figma/docs-site.md S2 ('What the Figma reading changes') that the navbar marks the page's own section, since the frames highlight Components everywhere

## /en/docs/icons: differs (8)

Note: Checked again against frame 181:1465 using get_metadata (skeptic/icons-meta.xml), plus design context on 358:1825, 358:2178, 181:1607, 181:1686, 181:1724, 181:1598 and 181:1663. I compared it with r12/page-icons.png in crops (skeptic/i-*.png) and with probes (finder.js, tables.js, cards.js, misc.js). Every row was reproduced. I refuted the Sizes table row-height sub-claim (43.6 against 43 px is within 1 px).

1. **[medium] (new) The whole set, tile height**
   - Frame: Tile 123x81: border 1 + pt 16 + glyph 24 + gap 10 + name 15 (Roboto Mono 11 px, normal leading) + pb 14 + border 1. Row pitch 89. Panel 944x1276, section 1396 px
   - Build: Tile 142.3x90.5. The glyph span is 32 px tall (text-2xl carries a 32 px line), so the svg sits 5.5 px lower and the name (16.5 px line) is 8 px lower. Row pitch 98.5. Panel 932x1409, section 1537 px (+141)
   - Cause: apps/docs/components/guides/icon-finder.tsx:54 <span className='text-2xl'> (24/32) around the glyph. At :55 the code text-[0.6875rem] inherits a 1.5 line (16.5 px)
   - Fix: icon-finder.tsx:54: add 'flex leading-none' to the glyph span (a 24 px box). icon-finder.tsx:55: add leading-[0.9375rem] to the name. The tile becomes 81 px
2. **[medium] (still open) The set table, Count column (row 5)**
   - Frame: Counts 13/19/13/36/3 in Roboto Mono 10.5 px, body colour (181:1611). Columns 221/96/627. Header row 42 px
   - Build: The counts are plain Inter 13 px muted, with no code element rendered. Columns 244/96/590. Header row 38 px
   - Cause: apps/docs/components/guides/icon-groups.tsx:13 replaces the authored `13` cell with String(count), which drops the backticks of icons.mdx:14-18. The header is 38 px because of PROSE_HEAD /3.5 (classes.ts:93-94)
   - Fix: icon-groups.tsx:13: wrap the count as <code dir='ltr' className={TABLE_CODE}>{String(...)}</code> (TABLE_CODE from ../classes). Header: in-aria-[rowindex=1]:leading-4.5 in PROSE_HEAD for 42 px
3. **[medium] (still open) Sizes table (row 6)**
   - Frame: (default), 1em, xs-xl and 16-40 in Roboto Mono 10.5 px, body colour (181:1688, 181:1690). Columns 127/96/721. Header 42 px. 'A control at sm' and 'A control at md' are plain Inter 14 px muted (181:1692)
   - Build: The code cells are 13 px Geist Mono in muted. Columns 188/130/612. Header 38 px. 'sm' and 'md' inside the 'Where it fits' prose cells are mono
   - Cause: classes.ts:105 AUTHORED_CELL keeps PROSE_CODE's text-muted. The 'fit' columns at classes.ts:99 have no width. apps/docs/content/en/icons.mdx:62-63 backtick sm and md inside the prose cell
   - Fix: AUTHORED_CELL: add [&_code]:text-body (classes.ts:105). PROSE_COLUMN.fit: add w-24. PROSE_HEAD: in-aria-[rowindex=1]:leading-4.5. icons.mdx:62-63: drop the backticks in 'A control at sm' and 'A control at md'
4. **[low] (still open) What flips in right to left, cards (row 9)**
   - Frame: Cards 305x87: title Inter Semi Bold 14 px on a 17 px line, body Inter 12 px on a 15 px line, two lines each, icon names in the same Inter (181:1724)
   - Build: Cards 301x109.1: title row 20 px, and body lines with code are 17.1 px. The icon names are 12 px Geist Mono, so 'Why a list' wraps to 3 lines (49 px) and stretches all three cards
   - Cause: apps/docs/components/mdx/cards.tsx:15 h3 text-sm (20 px line). At cards.tsx:19 the body keeps PROSE_CODE's mono font and text-sm line ratio (17.14 px at 12 px)
   - Fix: cards.tsx:15: text-sm/[1.0625rem]. cards.tsx:19: add 'leading-[0.9375rem] **:font-sans **:leading-[inherit]' to the body div
5. **[low] (still open) The whole set, search field clear icon (row 2)**
   - Frame: An x clear icon, 14 px, at the end of the 320x40 field, drawn while empty (358:1829)
   - Build: The 320x40 field has only the glass at the start. The x is rendered only once a query is typed
   - Cause: apps/docs/components/guides/icon-finder.tsx:39 renders the clear button only when finder.query !== ''
   - Fix: icon-finder.tsx:39-43: always render the x, disabled and muted while the query is empty
6. **[low] (new) The whole set, filter chips height**
   - Frame: All 41x31 (no border), Directional 97x33, Solid 59x33: py 7 around a 17 px line (358:1831-358:1835)
   - Build: All 43x36, Directional 96.6x36, Solid 58.7x36: py 7 around text-sm's 20 px line, plus a 1 px border
   - Cause: apps/docs/components/guides/icon-finder.tsx:26 CHIP text-sm (20 px line)
   - Fix: icon-finder.tsx:26: change text-sm to text-sm/[1.0625rem] (33 px chips)
7. **[low] (still open) 'Phosphor' link (row 10)**
   - Frame: Underlined #51a2ff (181:1598)
   - Build: td none (probe) until hover
   - Cause: apps/docs/components/classes.ts:5 TEXT_LINK (HOVER.link)
   - Fix: classes.ts:5: add underline
8. **[low] (still open) Inline names in leads (row 11)**
   - Frame: Icon, Svg and 1em in the paragraph's Inter 16 px muted (181:1663)
   - Build: 14 px Geist Mono for Icon, Svg, 1em and viewBox
   - Cause: apps/docs/components/mdx/mdx-map.tsx:35 PROSE_CODE (classes.ts:84)
   - Fix: Drop the backticks in icons.mdx:30 and :56 (and :79, whose lead is otherwise recorded), or set PROSE_CODE to font-mono text-[0.9375em] text-muted

## /en/docs/theming: differs (6)

Note: Checked again against frame 181:1808 using get_metadata, plus design context on 181:1941, 181:1993 and 181:2009. I compared it with r12/page-theming.png in crops (skeptic/t-*.png) and with probes. The cited mdx lines were wrong: theming.mdx has 48 lines, so the paragraphs are :25 and :33 and the scoping fence is :35. The knobs-table row-height sub-claim is refuted (43.6 against 43 px).

1. **[medium] (still open) The knobs table, knob names (row 2)**
   - Frame: --tc-radius ... --tc-line-width in Roboto Mono 10.5 px, body colour (181:1951)
   - Build: Geist Mono 13 px in text-muted. The defaults beside them are TABLE_CODE body, so the two code columns now differ in colour
   - Cause: apps/docs/components/classes.ts:105 AUTHORED_CELL does not reset PROSE_CODE's text-muted (mdx-map.tsx:35). knobs-table.tsx:13 gives only the Default column TABLE_CODE
   - Fix: classes.ts:105: add [&_code]:text-body to AUTHORED_CELL
2. **[low] (still open) The knobs table, columns and header (row 5)**
   - Frame: Columns 217/96/631. Header 42 px (181:1942). Table 944x302
   - Build: Columns 233.5/120.5/576. Header 38 px. Table 930x299
   - Cause: classes.ts:93-94 PROSE_HEAD /3.5 (a 14 px line). The 'fit' Default column at classes.ts:99 has no width, so the auto layout widens it
   - Fix: PROSE_HEAD: in-aria-[rowindex=1]:leading-4.5. PROSE_COLUMN.fit: w-24
3. **[low] (still open) A mode is one block, code colour (row 6)**
   - Frame: [data-theme="ocean"]: data-theme amber #ffb900, "ocean" emerald
   - Build: [data-theme= in plain #d4d4d4, 'ocean' emerald
   - Cause: apps/docs/lib/shiki-themes.ts:20-23 and :40: PLAIN_IN_CSS paints entity.other.attribute-name.css plain
   - Fix: shiki-themes.ts: after :40 add { scope: ['meta.attribute-selector.css entity.other.attribute-name'], settings: { foreground: palette.attribute } }
4. **[low] (still open) Code headers, Scoping a theme to a section (row 7) and A mode is one block**
   - Frame: icon/copy 13 px + 'code' (181:2011, 181:1995)
   - Build: Scoping: terminal-window + 'tsx'. A mode: terminal-window + 'topclassui/tokens.css' (the file name is recorded, the icon is not)
   - Cause: apps/docs/components/mdx/code-fence.tsx:51 names an untitled fence by its language. theming.mdx:35 has no title. code-block/index.tsx:40 always draws terminalWindow
   - Fix: code-fence.tsx:51: use labelsFor(locale).blocks.code for an untitled non-shell fence. Add an icon prop to CodeBlock and pass the copy icon for non-terminal titles
5. **[low] (still open) data-theme in paragraphs (row 8)**
   - Frame: data-theme in the paragraph's Inter 16 px muted (181:1993, 181:2009)
   - Build: 14 px Geist Mono
   - Cause: apps/docs/components/mdx/mdx-map.tsx:35 PROSE_CODE
   - Fix: Drop the backticks in theming.mdx:25 and :33, or set PROSE_CODE to text-[0.9375em]
6. **[low] (still open) On this page, two-line entries (row 9)**
   - Frame: 'Scoping a theme to a section' at 166, 30 px, then a 10 px gap before 'What is deliberately not themeable' at 206 (a 40 px pitch)
   - Build: Box 170-202 (32 px), then the next entry at 203: a 1 px gap (33 px pitch)
   - Cause: apps/docs/components/shell/toc-list.tsx:11 gap-px. TOC_LINK has no block padding (classes.ts:22-25)
   - Fix: Add py-1 to TOC_LINK (classes.ts:23-24)

## /en/docs/rtl: differs (4)

Note: Checked again against frame 183:1245 using get_metadata, plus design context on 183:1395, 183:1449 and 183:1448. docs-site.md page 10 says 'Build this. As drawn', so the class names in Inter are not recorded. Crops are in skeptic/r-*.png. I refuted the 'Placement, not side' rewrap sub-claim. I added the code-header icon row.

1. **[low] (still open) Logical classes only table (row 2)**
   - Frame: Class names in Inter 14 px muted; only tracking-* is Roboto Mono 10.5 px body (183:1443). Columns 278/666. Header 42 px, rows 42 px. Table 944x423
   - Build: The header is fixed (Banned is 11 px mono, Use instead is 14 px semibold), but every class name, gap-* and border-s included, is 13 px Geist Mono muted. Columns 349.4/580.6. Header 38 px, rows 43.6 px. Table 930x430
   - Cause: apps/docs/content/en/rtl.mdx:33-41 backticks render through mdx-map.tsx:35 PROSE_CODE. classes.ts:105 AUTHORED_CELL. The auto layout has no column widths. PROSE_HEAD /3.5
   - Fix: Drop the backticks in rtl.mdx:33-40 and keep `tracking-*` (row 41) as code with [&_code]:text-body. PROSE_HEAD in-aria-[rowindex=1]:leading-4.5
2. **[low] (still open) Transforms and gestures, code colours (row 3)**
   - Frame: [dir="rtl"]: dir amber. In both className lines, className is amber and the strings emerald (183:1460)
   - Build: [dir= and className=" in plain #d4d4d4. 'translate-x-(--tc-slide)' is plain. In 'object-left rtl:object-right' the class names are sky #00bcff
   - Cause: apps/docs/lib/shiki-themes.ts:20-23 and :40 PLAIN_IN_CSS. The className lines sit in a css fence (rtl.mdx:47-56)
   - Fix: Colour meta.attribute-selector.css entity.other.attribute-name with palette.attribute. Move the two className lines into a tsx fence, or accept them
3. **[low] (still open) Paragraph inline names (row 6)**
   - Frame: html, --tc-dir, 1, -1, placement, side, start and end in the paragraph's Inter 16 px muted (183:1448)
   - Build: 14 px Geist Mono. This rewraps 'Transforms and gestures': the frame breaks after '1 in LTR', the build after '1 in', so 'LTR' moves to line 2. 'Placement, not side' breaks at the same word in both
   - Cause: apps/docs/components/mdx/mdx-map.tsx:35 PROSE_CODE (classes.ts:84)
   - Fix: Drop the backticks in rtl.mdx:8, :45 and :60, or set PROSE_CODE to text-[0.9375em]
4. **[low] (added by verifier) Code block headers: The rule, Transforms and gestures, Type, plurals and digits**
   - Frame: icon/copy 13 px + 'code' in Roboto Mono 9 px muted (183:1381, 183:1450, 183:1483)
   - Build: terminal-window 14 px before 'app/layout.tsx', 'styles.css' and the Type fence's title. The file-name titles are recorded; the terminal icon is not
   - Cause: packages/topclassui/src/components/code-block/index.tsx:40 always draws terminalWindow when the block has a title
   - Fix: Add an icon prop to CodeBlock (index.tsx:40) and pass the copy icon from code-fence.tsx unless the title is the terminal label

## /en/docs/server-first: differs (6)

Note: Checked again against frame 183:1578 using get_metadata. Crops are in skeptic/s-*.png and the reviewer's cmp-server-first-*.png; probes were heads.js, tables.js and cards.js. server-first.mdx has 99 lines, so the cited :160, :166 and :176 were wrong. They are now :42, :48 and :58. I added the code-header icon row.

1. **[low] (still open) On this page (row 7)**
   - Frame: 'Why index.tsx has no hooks' on one line (15 px, at 181). Two-line entries ('What may cross the boundary', 'How a split component works') are followed by a 10 px gap (a 40 px pitch)
   - Build: 'Why index.tsx has no hooks' wraps to 2 lines ('Why index.tsx has no' / 'hooks') in the 158 px list. Every two-line entry is followed by a 1 px gap, so the three entries from 145 to 243 run together (33 px pitch)
   - Cause: apps/docs/components/shell/on-this-page.tsx:19 px-4 leaves 158 px for the list. toc-list.tsx:11 gap-px
   - Fix: on-this-page.tsx:19: change px-4 to ps-4 pe-3.5 (a 160 px list). Add py-1 to TOC_LINK (classes.ts:23-24)
2. **[low] (still open) Section paragraphs, inline names (row 6)**
   - Frame: index.tsx, hook.ts and use client in Inter 16 px muted, without quotes (183:1762); the line breaks after 'A build check'
   - Build: 14 px Geist Mono with 'use client' in quotes, which rewraps the paragraph ('A build' / 'check enforces it.')
   - Cause: apps/docs/components/mdx/mdx-map.tsx:35 PROSE_CODE
   - Fix: Drop the backticks in server-first.mdx:58, or set PROSE_CODE to text-[0.9375em]
3. **[low] (new) What may cross the boundary, Right pane wraps**
   - Frame: Every line on one line (183:1759)
   - Build: Pane 457x300. 'export function Search({ commands }: { commands: { id: / string, label: string }[] }) {' wraps mid-type, and the onSelect line wraps so that 'window.location.assign(...)' starts at column 0
   - Cause: apps/docs/components/mdx/wrong-right.tsx:35 passes wrap. apps/docs/content/en/server-first.mdx:42 (85 characters) and :48 run past the pane's width
   - Fix: server-first.mdx: add 'type Item = { id: string, label: string }' and change :42 to 'export function Search({ commands }: { commands: Item[] }) {'. Break :48 into 'onSelect={(command) => {' / 'window.location.assign(`/docs/${command.id}`)' / '}}'
4. **[low] (new) The three kinds table, header row**
   - Frame: Header row 42 px (183:1714, 10.5 px mono on a 1.72 line)
   - Build: 38 px
   - Cause: apps/docs/components/classes.ts:93-94 PROSE_HEAD /3.5 (a 14 px line plus py-3)
   - Fix: PROSE_HEAD.code and .prose: in-aria-[rowindex=1]:leading-4.5 (42 px)
5. **[low] (new) What it costs you, card lines**
   - Frame: Cards 305x102: title on a 17 px line, body Inter 12 px on a 15 px line, 3 lines (183:1802)
   - Build: Cards 301x142.3: title row 20 px, body lines 16 px (17.1 where code sits). getKey, getLabel, onSelect and 'use client' are mono. The recorded longer middle copy runs 5 lines and stretches all three; without it the outer cards would still be 108 px, against 102
   - Cause: apps/docs/components/mdx/cards.tsx:15 h3 text-sm (20 px line). At cards.tsx:19 the body is text-xs (16 px line) and keeps PROSE_CODE's mono font and 1.43 line ratio
   - Fix: cards.tsx:15: text-sm/[1.0625rem]. cards.tsx:19: 'leading-[0.9375rem] **:font-sans **:leading-[inherit]'
6. **[low] (added by verifier) Code block headers: Why index.tsx has no hooks, How a split component works**
   - Frame: icon/copy 13 px + 'code' in Roboto Mono 9 px muted (183:1764, 183:1780)
   - Build: terminal-window 14 px before 'index.tsx' and 'tag/index.tsx'. The file-name titles are recorded; the terminal icon is not
   - Cause: packages/topclassui/src/components/code-block/index.tsx:40 always draws terminalWindow when the block has a title
   - Fix: Add an icon prop to CodeBlock (index.tsx:40) and pass the copy icon from code-fence.tsx unless the title is the terminal label

## /en/docs/accessibility: differs (10)

Note: Checked again against frame 183:1877 using get_metadata, plus design context on 183:2098, 183:2009, 183:2062 and 183:2047. docs-site.md page 12 builds the lead as drawn, so the missing WCAG 2.2 AA link is not recorded. Crops are in skeptic/a-*.png. The '--tc- / ring' break is refuted because the frame breaks it the same way. I added two rows.

1. **[medium] (still open) Automatic and manual table (row 5)**
   - Frame: check-contrast.ts in Roboto Mono 10.5 px body (183:2110). The links axe-core and ARIA Authoring Practices are underlined, #51a2ff. Columns 212/507/225. Header 42 px, rows 43/42/42/42/42/42. Table 944x297
   - Build: check-contrast.ts and 'pnpm check' are 13 px mono muted. The links are not underlined. Their rows are 49 px (43.6/49/43.6/49/42/42), with the row's text 4 px lower. Columns 182/567/181. Header 38 px. Table 930x307
   - Cause: classes.ts:105 AUTHORED_CELL sets the code colour. classes.ts:5 TEXT_LINK has a hover-only underline and is inline-flex with TOUCH_TARGET (min-h 24) inside a 17 px line. classes.ts:93-94 header /3.5
   - Fix: AUTHORED_CELL: add [&_code]:text-body. TEXT_LINK: add underline and -my-[0.21875rem], so the 24 px target no longer raises the line. PROSE_HEAD: in-aria-[rowindex=1]:leading-4.5
2. **[low] (still open) Contrast table, Minimum column (row 1)**
   - Frame: What 828 px, Minimum 116 px. The ratios start at x 1105
   - Build: What 759.5, Minimum 170.5. The ratios start at x 1038.5, 67 px early
   - Cause: apps/docs/lib/table-of.ts:50-53 makes Minimum 'fit' and What 'wrap' (min-w-32 only), so the auto layout splits the slack in proportion to content (classes.ts:99-100)
   - Fix: classes.ts:99: give PROSE_COLUMN.fit w-24, or have data-table.tsx:29 add w-full to the first wrap or prose column when the last column fits
3. **[low] (still open) Contrast table values (row 2)**
   - Frame: 4.5:1 and 3:1 in Roboto Mono 10.5 px, body colour (183:2023). Header 42 px
   - Build: Geist Mono 13 px in muted. Header 38 px
   - Cause: classes.ts:105 AUTHORED_CELL. classes.ts:93-94 PROSE_HEAD
   - Fix: AUTHORED_CELL: add [&_code]:text-body. PROSE_HEAD: leading-4.5 on the header row
4. **[low] (still open) Lead, 'WCAG 2.2 AA' link (row 7)**
   - Frame: The lead opens with 'WCAG 2.2 AA' as an underlined #51a2ff link (183:2009)
   - Build: Plain muted 15 px text, no link
   - Cause: apps/docs/components/shell/docs-shell.tsx:59 renders entry.description[locale] as plain text
   - Fix: Let a page entry in apps/docs/content/pages.ts carry an optional lead link (text and href), and render it with TEXT_LINK in docs-shell.tsx:59
5. **[low] (still open) 'WCAG 2.5.7' link (row 8)**
   - Frame: Underlined (183:2062)
   - Build: td none until hover
   - Cause: apps/docs/components/classes.ts:5 TEXT_LINK
   - Fix: Add underline to TEXT_LINK
6. **[low] (still open) Paragraph inline names (row 10)**
   - Frame: --tc-ring, id and aria-label in the paragraph's Inter 16 px muted (183:2065, 183:2080); the frame also breaks '--tc-' / 'ring' at the line end
   - Build: 14 px Geist Mono for --tc-ring, id, aria-label and aria-labelledby
   - Cause: apps/docs/components/mdx/mdx-map.tsx:35 PROSE_CODE
   - Fix: Drop the backticks in accessibility.mdx:33 and :39, or set PROSE_CODE to text-[0.9375em]
7. **[low] (still open) On this page, two-line entries (row 11)**
   - Frame: 'Every drag has a keyboard path' and 'Labels are enforced by the types' are 30 px, then a 10 px gap
   - Build: 32 px each, then a 1 px gap (170-202, next at 203; 228-260, next at 261)
   - Cause: apps/docs/components/shell/toc-list.tsx:11 gap-px
   - Fix: Add py-1 to TOC_LINK (classes.ts:23-24)
8. **[low] (new) TOUCH_TARGET and FOCUS_RING samples, constant names**
   - Frame: 'export const TOUCH_TARGET =' all in #51a2ff (183:2058), and 'export const FOCUS_RING =' the same (183:2077)
   - Build: 'export const' is blue, but TOUCH_TARGET, FOCUS_RING and '=' are plain #d4d4d4
   - Cause: apps/docs/lib/shiki-themes.ts:33-36 has no rule for variable.other.constant
   - Fix: shiki-themes.ts:34: add 'variable.other.constant' to the keyword scope list
9. **[low] (added by verifier) Code block headers: Target size, Focus is always visible**
   - Frame: icon/copy 13 px + 'code' in Roboto Mono 9 px muted (183:2048, 183:2067)
   - Build: terminal-window 14 px before 'topclassui/classes' in both. The printed-from-source title is recorded; the terminal icon is not
   - Cause: packages/topclassui/src/components/code-block/index.tsx:40 always draws terminalWindow when the block has a title
   - Fix: Add an icon prop to CodeBlock (index.tsx:40) and pass the copy icon from code-fence.tsx unless the title is the terminal label
10. **[low] (added by verifier) Automatic and manual table, 'Contrast' check name**
   - Frame: 'Contrast' in Roboto Mono 10.5 px, body colour (183:2108), while the other five check names are Inter 14 px muted
   - Build: 'Contrast' in Inter 13 px muted, like the other check names
   - Cause: apps/docs/content/en/accessibility.mdx writes Contrast as plain text in the first cell. The frame's mono here looks like a copy slip from the How cell beside it
   - Fix: No build change recommended. Record it in docs/figma/docs-site.md page 12 as a frame slip (the Check column is labels), or write `Contrast` as code if the drawing is meant

## /en/docs/changelog: matches (0)

Note: Confirmed. /en/docs/changelog is a recorded route change (docs-site page 17 builds /en/changelog). I compared frame changelog-183-2536.png with r12-review/guides/build-changelog.png side by side (skeptic/ch-ov-0.png, ch-ov-1.png, ch-nav.png). These are all recorded by page 17 or the shared list: the CHANGELOG.md body, no Current state, How an entry is written or sample entries, the Breaking changes code sample (a sample entry), the pager, the footer lists, the brand tile and the Blog link. The two kept sections (Breaking changes, then Version policy) match the drawn order, heading size and paragraph layout. The shared shell rows (sidebar 6-7 px lower, On this page 8 px lower, navbar current link) are listed under Colors.


## Refuted by the second reviewer (do not act)

- /en/docs/colors, (still open) Warning callout icon size (row 13 remainder): Within 2 px: warning-circle is 16 px against the drawn 14. The padding is 1 px transparent border + 11/13 = 12/14 against the drawn 13/14, and the box is 44 px against 43
- /en/docs/theming, (still open) The knobs table, geometry (row 5): rows 43 against 43.6 px: The frame's knob rows are 43 px (10.5 px mono on a 1.72 line, 181:1949-181:1984), so 43.6 is within 1 px. The column and header parts are kept
- /en/docs/icons, (still open) Sizes table (row 6): rows 43 against 43.6 px: The frame's code rows are 43 px (181:1672-181:1707), so the build's 43.6 is within 1 px. The colour, column, header and sm/md parts are kept
- /en/docs/rtl, (still open) Paragraph inline names (row 6): 'rewraps Placement, not side': The crop (skeptic/r-para2.png) shows both breaking after 'so a menu opens', so the line count and the break are the same. Only the Transforms paragraph rewraps
- /en/docs/accessibility, (still open) Paragraph inline names (row 10): '--tc-ring breaks as --tc- / ring across lines': The frame (183:2065, skeptic/a-focuspara.png) breaks '--tc-' / 'ring' at the same place. Only the mono font is a difference
