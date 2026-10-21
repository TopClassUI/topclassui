# Figma audit, guides

On preview/r8-all d9c04b21 at 1440 dark, frame vs build, each difference re-checked by a second reviewer. Fix what your branch has not fixed yet; skip a row your later commits already cover.

## /en/docs/colors: differs (19)

Note: Checked against frame 181:1144 (get_metadata, plus get_design_context on 344:1792, 344:1799, 181:1356, 181:1275, 181:1301, 345:11, 181:1337, 181:1395 and 345:1856) and against r11/page-colors.png, using the reviewer's same-scale composites, my own 2x shots (r11-review/guides-skeptic/cmp/colors-board-2x.png) and live DOM probes (r11-review/guides-skeptic/ev.mjs). Not reported because they are recorded: the breadcrumb, blue for violet, PageControls, the contrast line in each tone row, the tokens.css excerpt, the pager and the sidebar rows that were left out. Code line pitch and paragraph line height are refuted below. The shell row covers all seven guide pages. There is no states strip here, so the job-140 grid does not apply.

1. **[medium] Every class table, header row**
   - Frame: 38 px header row on base/page. Class, Variable and What it is for are all Roboto Mono 10.5 px Regular in the body colour
   - Build: 44 px header row. All three headers are Inter Semi Bold 14 px (text-sm font-semibold text-body)
   - Cause: apps/docs/components/classes.ts:90 PROSE_CELL: in-aria-[rowindex=1]:text-sm in-aria-[rowindex=1]:font-semibold on every header cell
   - Fix: classes.ts:90: set the header row to in-aria-[rowindex=1]:font-mono in-aria-[rowindex=1]:text-[0.6875rem] in-aria-[rowindex=1]:font-normal. Keep text-sm font-semibold only on the header of a prose last column (PROSE_COLUMN.prose). That rule matches 7 of the 8 guide tables. The exception is this table, whose frame also draws 'What it is for' in mono.
2. **[medium] Every class table, Class and Variable cells**
   - Frame: Roboto Mono 13 px in base/body (#fafafa)
   - Build: Geist Mono 13 px in text-muted (lab 66, about #a1a1a1), so every token name reads grey
   - Cause: apps/docs/components/mdx/mdx-map.tsx:34 renders backticks with PROSE_CODE (font-mono text-sm text-muted). classes.ts:100 AUTHORED_CELL resets only the size (**:text-[length:inherit]), not the colour
   - Fix: classes.ts:100: AUTHORED_CELL = '**:text-[length:inherit] [&_code]:text-body'
3. **[medium] The six tones, role column (primary/solid ...)**
   - Frame: Roboto Mono 11 px in base/body, 190 px column
   - Build: Geist Mono 14 px in text-muted. A nested <code class='font-mono text-sm text-muted'> (PROSE_CODE) sits inside the row's own <code class='text-xs text-body'>, so the inner 14 px grey wins. Column 192 px
   - Cause: apps/docs/components/guides/token-table.tsx:43 renders {role}, the MDX-mapped code element, inside its own code element (the reviewer cited :77; the line is 43)
   - Fix: token-table.tsx:43: render {textOf(role)} (textOf is already imported) so the row's font-mono text-xs text-body applies (12 px body).
4. **[medium] Captions under the three layers code block and under The six tones**
   - Frame: Inter Regular 10.5 px muted, 13 px tall (181:1291, 181:1336)
   - Build: Ordinary paragraphs: 16 px muted on a 24 px line, 932x24 at y 862 and y 2148
   - Cause: apps/docs/components/mdx/mdx-map.tsx:31 maps every p to text-base text-muted. colors.mdx:31 and :75 are plain paragraphs
   - Fix: Add a Caption MDX component, <p className={NOTE}> (classes.ts:165, text-xs text-muted), to mdx-map.tsx, and wrap colors.mdx:31 and :75 in it.
5. **[medium] Where each color is used, leader lines and dots**
   - Frame: Lines 1 px at about #232323 (base/line). Dots 5.7 px in #51a2ff (sampled from the frame PNG)
   - Build: Both the svg stroke and the circle fill compute to lab(66), about #a1a1a1 (anti-aliased lines measure about #939393). The leaders are about 4x brighter and the dots are grey
   - Cause: apps/docs/components/guides/role-board.tsx:89 sets text-muted on the svg; :94 stroke and :95 fill use currentColor
   - Fix: role-board.tsx:89: text-muted → text-line. role-board.tsx:95: replace fill='currentColor' with className='fill-primary-on-soft'.
6. **[medium] The three modes code block, Copy button**
   - Frame: Worded 'Copy' button 73x29: copy icon 14 plus Inter Medium 12, surface fill, 1 px line border, radius 8
   - Build: 24x24 icon-only ghost button with no word, no fill and no border. The header title topclassui/tokens.css is a file name, which S3 allows
   - Cause: apps/docs/components/guides/tokens-sample.tsx:34 renders CodeBlock directly with its own showCopy, instead of CodeFrame with the docs CopyButton
   - Fix: tokens-sample.tsx:34: return <CodeFrame code={code} locale={locale} title={guideLabelsFor(locale).sample.title} lang='css' highlighted={highlighted} /> (apps/docs/components/mdx/code-frame.tsx).
7. **[low] Every class table, row height and columns**
   - Frame: Body rows 42 px (12 + 17 + 12, then a 1 px rule). Table 944x544. Fixed columns 270/270/404
   - Build: Body rows 45.6 px, header 44. Table 932x592.8 (+49 px). Columns 285/285/360
   - Cause: classes.ts:90 PROSE_CELL leading-5 (a 20 px line, 20.6 with inline code) plus py-3. Auto table layout in apps/docs/components/guides/data-table.tsx:18-32
   - Fix: classes.ts:90: leading-5 → leading-[1.0625rem], which makes a 42 px row. Optional: table-fixed with 28.6% / 28.6% / 42.8% columns for the token table.
8. **[low] What the contrast check enforces table**
   - Frame: Columns 456/96/392. Headers What and Threshold are mono 10.5 Regular; Measured against is Inter Semi Bold 14. 4.5:1, 3:1, line and exempt are mono 10.5 body. 'line-strong, ring and icons' is plain Inter 14 muted. Rows 43 px, table 944x215
   - Build: Columns 412/144/374. All headers Inter Semi Bold 14. The ratios and 'exempt' are Inter 13 muted, and 'line' is mono 13 muted. line-strong and ring are mono 13 muted inside the first cell. Rows 45-49 px, table 932x231
   - Cause: classes.ts:90 PROSE_CELL and :100 AUTHORED_CELL. apps/docs/content/en/colors.mdx:108-111 writes the thresholds as plain text and line-strong/ring as backticks. lib/table-of.ts:50-52 columnFit
   - Fix: Apply the header and AUTHORED_CELL fixes from the rows above. In colors.mdx:108-111, write `4.5:1`, `3:1` and `exempt` as inline code and drop the backticks around line-strong and ring.
9. **[low] The six tones, primary/soft row**
   - Frame: Row 51 px. Shade text '24% into the page' on one line, mono 10 px muted, in a 170 px column
   - Build: Row 69 px. '24% primary-solid into the page' wraps to 2 lines in the 176 px (11rem) column, above the recorded contrast line, so the wrap alone adds 16 px
   - Cause: apps/docs/labels/guides-en.ts:7 mix label adds the token name. token-table.tsx:41 sm:grid-cols-[auto_12rem_11rem_1fr] (the reviewer cited :75)
   - Fix: guides-en.ts:7: `${percent}% into the page`, as drawn. Alternatively, widen the third track at token-table.tsx:41 to 13rem.
10. **[low] Where each color is used, role labels**
   - Frame: 9.77 px. Name in Inter Semi Bold with whitespace-nowrap, description Regular, gap 2.44. Both combined names ('bg-primary-solid + text-primary-on-solid', 'bg-primary-soft + text-primary-on-soft') fit on one line. The bg-surface-raised description takes 2 lines
   - Build: 12 px on a 16 px line (text-xs), gap 2. Both combined names wrap to 2 lines (32 px). The bg-surface-raised description takes 3 lines (label 200.8x66)
   - Cause: role-board.tsx:107 li text-xs; :109 name code without whitespace-nowrap
   - Fix: role-board.tsx:107: text-xs → text-[0.625rem]/[1.2]. Add whitespace-nowrap to the code at :109.
11. **[low] Code block header (three layers)**
   - Frame: icon/copy 13 px, then 'code' in mono 9 px muted
   - Build: terminal-window icon, then the fence's language 'css'
   - Cause: apps/docs/components/mdx/code-fence.tsx:50 names an untitled, non-shell fence by its language (the reviewer cited :90). docs-site S3 says the title is 'terminal' or the file name. packages/topclassui/src/components/code-block/index.tsx:40 always draws terminalWindow
   - Fix: code-fence.tsx:50: name an untitled, non-shell fence labelsFor(locale).blocks.code ('code') instead of lang. The icon needs a CodeBlock icon prop (new library API); otherwise accept the terminal icon.
12. **[low] Code colours (three modes, three layers)**
   - Frame: [data-theme="dark"]: data-theme amber #ffb900, "dark" emerald. Layers sample: className amber, its string emerald, @theme plain. (The frame's own brand block, 345:1857, is drawn all plain, so the frames are not consistent.)
   - Build: data-theme plain #d4d4d4. Layers sample: className=" and the quotes plain #d4d4d4, the class names sky #00bcff (the tag colour), @theme blue #51a2ff
   - Cause: apps/docs/lib/shiki-themes.ts:20-23 PLAIN_IN_CSS forces entity.other.attribute-name.css to the text colour (:40). The className line sits in a css fence (colors.mdx:14-29)
   - Fix: shiki-themes.ts: after the PLAIN_IN_CSS rule (:40), add { scope: ['meta.attribute-selector.css entity.other.attribute-name'], settings: { foreground: palette.attribute } }. Accept the className line as CSS-tokenised, or split it into a tsx fence.
13. **[low] Add your own theme, warning callout**
   - Frame: icon/warning-circle 14 px. The whole sentence in warning on-soft Inter 14. 944x43, padding 13/14, gap 10
   - Build: Warning triangle 16 px. --tc-primary-solid and --tc-primary-on-solid are 14 px mono in grey muted inside the amber text. 932x44
   - Cause: apps/docs/components/mdx/callout.tsx:6 <Alert tone> takes the library's warning icon (packages/topclassui/src/components/alert/constants.ts:26). mdx-map.tsx:34 PROSE_CODE text-muted inside the Alert (the reviewer cited callout.tsx:26; the line is 6)
   - Fix: callout.tsx:6: for tone 'warning', pass Alert's icon prop with the warning-circle icon, and add className='[&_code]:text-current'.
14. **[low] Add your own theme, after the code block**
   - Frame: Nothing after the brand code block
   - Build: An extra info callout, 932x64 and 2 lines ('ThemeScript stores only light, dark and ocean...')
   - Cause: apps/docs/content/en/colors.mdx:140
   - Fix: Remove the callout, or fold its sentence into the section's paragraph (colors.mdx:115).
15. **[low] Contrast table link 'WCAG 1.4.11'**
   - Frame: Underlined, #51a2ff
   - Build: Primary-coloured, underlined only on hover
   - Cause: apps/docs/components/classes.ts:5 TEXT_LINK relies on HOVER.link ('hover:underline')
   - Fix: classes.ts:5: add underline to TEXT_LINK.
16. **[low] Paragraph inline names (added by verifier)**
   - Frame: '@theme inline' in the paragraph's Inter 16 muted (181:1278)
   - Build: 14 px Geist Mono (PROSE_CODE)
   - Cause: apps/docs/components/mdx/mdx-map.tsx:34 PROSE_CODE; colors.mdx:12
   - Fix: Set PROSE_CODE (classes.ts:84) to the paragraph's size, 'font-mono text-[0.9375em] text-muted', or drop the backticks as drawn.
17. **[low] The three modes, first paragraph (added by verifier)**
   - Frame: One line: '... set the same variable names. This site uses dark by default.' (26 px)
   - Build: Two lines: '... This site follows your system's mode until you pick one.' (48 px)
   - Cause: apps/docs/content/en/colors.mdx:96
   - Fix: Keep the accurate fact in fewer words, e.g. 'This site follows your system's mode.', so it fits one line as drawn.
18. **[low] On this page, two-line entry**
   - Frame: 'What the contrast check enforces' is 30 px tall, then a 10 px gap (next entry 40 px below)
   - Build: 32 px tall, then a 1 px gap (next entry 33 px below), so it touches 'Add your own theme'
   - Cause: apps/docs/components/shell/toc-list.tsx:11 gap-px, with TOC_LINK (classes.ts:22-25) at min-h 24 and leading-4
   - Fix: Add py-1 to both TOC_LINK entries (classes.ts:22-25). Single-line entries stay 24 px on a 25 px pitch; a two-line entry gets 41.
19. **[low] Shell (all seven guide pages)**
   - Frame: Navbar 58 px. Sidebar rows 29 px on a 31 px pitch (p 6/8)
   - Build: Navbar 52 px. Sidebar rows 26 px on a 28 px pitch, so by Accessibility the list sits 34 px higher than drawn
   - Cause: The library Navbar is 52 px (packages/topclassui/src/components/navbar/classes.ts:9 min-h-13, recorded for its own Previewer frame in DECISIONS 2026-10-19). apps/docs/components/classes.ts:37-40 SIDE_LINK on the library SidebarLink row
   - Fix: Give the site's NavbarRoot (apps/docs/components/shell/site-navbar.tsx:54) min-h-[3.625rem] without changing the library default. Give SIDE_LINK min-h-[1.8125rem].

## /en/docs/icons: differs (11)

Note: Checked against frame 181:1465 (get_metadata, plus get_design_context on 358:1825, 358:2178, 181:1717 and 181:1664) and against r11/page-icons.png, with DOM probes. The reviewer's icon-finder line numbers were off by 12 and are corrected below. Recorded and not reported: 'The whole set' as the section name, the Adding icons sample without the CLI, the breadcrumb and the pager. Code line pitch and the On this page row are refuted below.

1. **[high] What flips in right to left, cards**
   - Frame: Three cards in one row, each 305x87, gap 14. Card padding 16, title-to-text gap 6, radius 12. Section 162 px
   - Build: Two cards per row (460x94); 'Why a list' wraps to a second row. Gap 12, padding 14, inner gap 4. Section 276 px
   - Cause: apps/docs/components/mdx/cards.tsx:6 grid-cols-1 gap-3 md:grid-cols-2; :11 CardRoot gap-1 p-3.5. docs-site S3 asks for 2 to 4 per row
   - Fix: cards.tsx:6: md:grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-3.5. cards.tsx:11: p-4 gap-1.5.
2. **[medium] The whole set, search field**
   - Frame: 320x40, radius 8, surface-raised fill, 1 px line-strong border, px 14, gap 10. magnifying-glass 14 px at the start, x clear icon 14 px at the end. 'Search 84 icons' Inter 14 in the body colour
   - Build: 193x40 Input. Its fill (surface-raised) and line-strong border match, but there is no search icon and no clear icon, the padding is 16 and the placeholder is muted
   - Cause: apps/docs/components/guides/icon-finder.tsx:29 <Input type='search'> with no width and no adornments
   - Fix: icon-finder.tsx:29: give the field w-80. Put the magnifying-glass at its start and a clear (x) button at its end, through the Input's slots or a wrapper as drawn.
3. **[medium] The whole set, filter**
   - Frame: Three separate chips, gap 6, radius 8, px 12 py 7, Inter 14. 'All' is 41x31 on primary soft with primary on-soft Medium text; Directional and Solid have a 1 px line border and muted Regular text
   - Build: One SegmentedControl size sm: a 175x32 bordered track with 24 px segments and 12 px text. The selected 'All' sits on surface-raised in the body colour
   - Cause: icon-finder.tsx:30-32 SegmentedControlRoot size='sm'
   - Fix: Render three toggle buttons (aria-pressed) with gap-1.5, rounded-control, px-3 py-1.75 and text-sm. Selected: bg-primary-soft text-primary-on-soft font-medium. Others: border-line text-muted.
4. **[medium] The whole set, tiles**
   - Frame: Tile 123x81: 1 px dashed base/line border, no fill (the surface panel shows through), radius 10, pt 16, pb 14, px 6, gap 10. Icon 24 px. Name in Roboto Mono 11 muted
   - Build: Tile 144.7x78: solid 1 px line border, filled bg-page (darker than the panel), radius 8, py 12, px 8, gap 8. Icon 20 px (text-xl). Name in mono 12 muted
   - Cause: icon-finder.tsx:19 TILE (rounded-control, BORDER, bg-page, px-2 py-3, gap-2); :39 text-xl on the glyph
   - Fix: TILE: rounded-[0.625rem] border-dashed bg-transparent px-1.5 pt-4 pb-3.5 gap-2.5. Glyph: text-2xl. Keep HOVER.ghost.
5. **[medium] The set table**
   - Frame: Headers Group and Count in mono 10.5 Regular; What it covers in Inter Semi Bold 14. Counts in mono 10.5 body. Columns 221/96/627. Rows 43 px, header 42. Table 944x259
   - Build: All headers Inter Semi Bold 14. Counts Inter 13 muted. Columns 241/107/582. Rows 45 px, header 44. Table 932x271
   - Cause: apps/docs/components/classes.ts:90 PROSE_CELL header and cell styles
   - Fix: Apply the Colors header fix. Write the counts as inline code (or print them with TABLE_CODE) with AUTHORED_CELL [&_code]:text-body. PROSE_CELL leading-[1.0625rem].
6. **[medium] Sizes table**
   - Frame: Headers Name and Pixels in mono 10.5 Regular; Where it fits in Inter Semi Bold 14. (default), the names and the pixel values in mono 10.5 body. Columns 127/96/721. Rows 43 px. Table 944x302
   - Build: Headers Inter Semi Bold 14. (default) in Inter 13 muted; 1em, xs-xl in mono 13 muted; 16-40 in Inter 13 muted. Columns 159/135/635. Rows 45.6 px. Table 932x319
   - Cause: classes.ts:90 PROSE_CELL. classes.ts:100 AUTHORED_CELL keeps code muted. The icons.mdx sizes table writes the pixels as plain text
   - Fix: Apply the header fix from Colors. AUTHORED_CELL adds [&_code]:text-body. Write the pixel values and (default) as inline code. PROSE_CELL leading-[1.0625rem].
7. **[low] The whole set, tile names (added by verifier)**
   - Frame: Every name is whole, 'caret-double-right' and 'dots-three-vertical' included (mono 11)
   - Build: 'caret-double-rig…' and 'dots-three-verti…' are cut with an ellipsis
   - Cause: icon-finder.tsx:40 code max-w-full truncate font-mono text-xs (12 px) inside px-2 padding
   - Fix: icon-finder.tsx:40: text-xs → text-[0.6875rem]. With the px-1.5 tile padding above, both names fit the 145 px tile.
8. **[low] The whole set, panel**
   - Frame: 944x1276, padding 18 (grid at 19 inside the 1 px border), tile gap 8. Six fixed 123 px tiles, left-aligned, leaving about 130 px empty at each row's end
   - Build: 932x1204, padding 16, gap 6. Six equal tracks stretched to 145 px
   - Cause: icon-finder.tsx:35 grid ... gap-1.5 p-4 lg:grid-cols-6
   - Fix: icon-finder.tsx:35: gap-1.5 → gap-2 and p-4 → p-4.5. Keep the stretch, or use lg:grid-cols-[repeat(6,7.6875rem)] for the drawn 123 px.
9. **[low] What flips cards, body text**
   - Frame: Inter 12 px muted. Icon names in the same Inter
   - Build: Icon names in 14 px mono (PROSE_CODE) inside 12 px text, which raises the lines to 20 px
   - Cause: mdx-map.tsx:34 PROSE_CODE text-sm inside cards.tsx:16 text-xs
   - Fix: cards.tsx:16: add **:text-[length:inherit] to the body div.
10. **[low] The set lead, 'Phosphor' link**
   - Frame: Underlined
   - Build: Underlined only on hover
   - Cause: classes.ts:5 TEXT_LINK
   - Fix: Add underline to TEXT_LINK.
11. **[low] Two ways to render and Sizes leads, inline names**
   - Frame: Icon, Svg and 1em in the paragraph's Inter 16 muted
   - Build: 14 px Geist Mono (PROSE_CODE)
   - Cause: mdx-map.tsx:34 PROSE_CODE
   - Fix: PROSE_CODE = 'font-mono text-[0.9375em] text-muted', or drop the backticks as drawn.

## /en/docs/theming: differs (9)

Note: Checked against frame 181:1808 (get_metadata) and r11/page-theming.png, plus a 2x On this page shot (r11-review/guides-skeptic/build/theming-toc-2x.png). Recorded and not reported: the ocean sample read from tokens.css, the live mode pair, the generated knobs table rows, the breadcrumb and the pager. The tokens sample's file-name title is allowed by S3. The callout and the code line pitch are refuted below.

1. **[medium] The knobs table, header row**
   - Frame: 42 px. Knob and Default in Roboto Mono 10.5 Regular body; What it moves in Inter Semi Bold 14
   - Build: 44 px. All three in Inter Semi Bold 14
   - Cause: apps/docs/components/classes.ts:90 PROSE_CELL header styles
   - Fix: Apply the Colors header fix: mono 0.6875rem font-normal on the code columns, text-sm semibold on the prose last column.
2. **[medium] The knobs table, knob and default cells**
   - Frame: --tc-radius, 0.5rem and the rest in Roboto Mono 10.5 px, body colour, 1.72 line
   - Build: Geist Mono 13 px in text-muted (grey)
   - Cause: apps/docs/components/guides/knobs-table.tsx:12 prints the default as <code className='font-mono text-sm'> with no colour (the reviewer cited :107; the line is 12). The knob cells come through mdx-map.tsx:34 PROSE_CODE text-muted. classes.ts:100 AUTHORED_CELL resets the size only
   - Fix: knobs-table.tsx:12: className={TABLE_CODE} (font-mono text-body). classes.ts:100: AUTHORED_CELL adds [&_code]:text-body.
3. **[medium] A mode is one block, Copy button**
   - Frame: Worded 'Copy' button 73x29 with a border (icon 14 + Inter Medium 12)
   - Build: A 24x24 icon-only ghost button with no border or word
   - Cause: apps/docs/components/guides/tokens-sample.tsx:34 renders CodeBlock with its own copy, not CodeFrame
   - Fix: tokens-sample.tsx:34: render through CodeFrame (apps/docs/components/mdx/code-frame.tsx), as on Colors.
4. **[medium] A mode is one block, caption**
   - Frame: 'The ocean mode in full. It changes one tone and one knob.' Inter 10.5 muted, 13 px tall
   - Build: 16 px muted on a 24 px line
   - Cause: apps/docs/content/en/theming.mdx:29 is a plain paragraph → mdx-map.tsx:31 text-base
   - Fix: Wrap theming.mdx:29 in the Caption MDX component (NOTE, text-xs text-muted).
5. **[low] The knobs table, geometry**
   - Frame: Columns 217/96/631. Body rows 43 px. Table 944x302. '0' and 'prefers-reduced-motion' in plain Inter
   - Build: Columns 224/119/587. Rows 45.6 px. Table 932x319. '0' and 'prefers-reduced-motion' in mono
   - Cause: classes.ts:90 PROSE_CELL leading-5 + py-3; auto layout. theming.mdx:16 backticks
   - Fix: PROSE_CELL leading-[1.0625rem]. Drop the backticks in theming.mdx:16 or apply the PROSE_CODE size fix.
6. **[low] Code text colour, ocean block**
   - Frame: [data-theme="ocean"]: data-theme amber #ffb900, "ocean" emerald
   - Build: data-theme plain #d4d4d4; 'ocean' emerald
   - Cause: apps/docs/lib/shiki-themes.ts:20-23 PLAIN_IN_CSS flattens CSS attribute names
   - Fix: Colour meta.attribute-selector.css entity.other.attribute-name with palette.attribute (see Colors).
7. **[low] Scoping a theme to a section, code block header (added by verifier)**
   - Frame: icon/copy + 'code'
   - Build: terminal-window icon + 'tsx'
   - Cause: apps/docs/components/mdx/code-fence.tsx:50 names an untitled fence by its language; theming.mdx:35 has no title
   - Fix: code-fence.tsx:50: name an untitled, non-shell fence 'code' (labels.blocks.code).
8. **[low] Paragraphs with data-theme**
   - Frame: data-theme in the paragraph's Inter 16 muted
   - Build: data-theme in 14 px mono
   - Cause: mdx-map.tsx:34 PROSE_CODE
   - Fix: PROSE_CODE at the paragraph's size (text-[0.9375em]), or no backticks.
9. **[low] On this page, two-line entries**
   - Frame: 'Scoping a theme to a section' is 30 px, then a 10 px gap before 'What is deliberately not themeable'
   - Build: 32 px, then a 1 px gap: the two entries touch
   - Cause: apps/docs/components/shell/toc-list.tsx:11 gap-px
   - Fix: py-1 on TOC_LINK (classes.ts:22-25).

## /en/docs/rtl: differs (6)

Note: Checked against frame 183:1245 (get_metadata) and r11/page-rtl.png. Recorded and not reported: DirectionPair, [lang|='ar'], the lint sample, the breadcrumb and the pager. The code line pitch and the code-block header titles are refuted below.

1. **[medium] The rule, code sample**
   - Frame: <html lang="ar" dir="rtl">, a blank line, the comment and <TopClassProvider ...>. Block 944x149, header 'code'
   - Build: The whole app/layout.tsx (import, RootLayout, html, body, provider with children; 12 lines). Block 932x278
   - Cause: apps/docs/content/en/rtl.mdx:10-23 (a 'check' fence of the full file)
   - Fix: Show the drawn excerpt. If the type check needs the full file, keep it as the checked source and render only the html/provider lines.
2. **[medium] Logical classes only table**
   - Frame: Header 'Banned' in mono 10.5 Regular; 'Use instead' in Inter Semi Bold 14. Class names in Inter 14 muted (only tracking-* is mono 10.5 body). Columns 278/666. Rows 42 px. Table 944x423
   - Build: Both headers Inter Semi Bold 14. Every class in 13 px mono muted. Columns 349/581. Rows 45.6 px. Table 932x456
   - Cause: apps/docs/components/classes.ts:90 PROSE_CELL. rtl.mdx:33-41 backticks render through mdx-map.tsx:34 PROSE_CODE (muted). lib/table-of.ts:50-52 columnFit
   - Fix: Apply the Colors header fix. Either drop the backticks (as drawn) or add [&_code]:text-body to AUTHORED_CELL. PROSE_CELL leading-[1.0625rem].
3. **[low] Transforms and gestures, code colours**
   - Frame: [dir="rtl"]: dir amber. Both className lines: className amber, the strings emerald
   - Build: dir and className plain #d4d4d4. 'translate-x-(--tc-slide)' also plain. In 'object-left rtl:object-right' the class names are sky #00bcff
   - Cause: apps/docs/lib/shiki-themes.ts:20-23 PLAIN_IN_CSS. The className lines sit in a css fence (rtl.mdx:47-56)
   - Fix: Colour CSS attribute-selector names with palette.attribute. Split the className lines into a tsx fence, or accept them.
4. **[low] Placement, not side, Right pane**
   - Frame: 3 lines (placement and two comments), box 465x102
   - Build: Adds an import line and a blank line (6 lines), box 459x131
   - Cause: rtl.mdx:68-75 ('check' fence needs the import)
   - Fix: Drop the import line from what is shown; keep it only in the checked source.
5. **[low] Type, plurals and digits, code sample**
   - Frame: 7 lines (one PluralRules ternary), block 944x206
   - Build: 15 lines (zero/one/two/few/many branches), block 932x329
   - Cause: rtl.mdx:83-99
   - Fix: Either shorten it to the drawn shape (the drawn ternary is wrong for Arabic, which has six plural forms, so it would teach a bug) or record the longer, correct sample in DECISIONS.
6. **[low] Paragraph inline names (html, --tc-dir, 1, -1, placement, side, start, end, --tc-font-arabic, [lang|='ar'])**
   - Frame: Plain Inter 16 muted
   - Build: 14 px mono (PROSE_CODE)
   - Cause: mdx-map.tsx:34 PROSE_CODE
   - Fix: PROSE_CODE at the paragraph's size, or no backticks.

## /en/docs/server-first: differs (7)

Note: Checked against frame 183:1578 (get_metadata) and r11/page-server-first.png. Recorded and not reported: the kinds counted from meta.ts, the Command corrections (the cost card and the boundary sample), the How sizes are checked text, the Tag sample, the generated chip wording, the breadcrumb and the pager. The code line pitch is refuted below.

1. **[high] What it costs you, cards**
   - Frame: Three cards in one row, each 305x102, gap 14, padding 16, inner gap 6. Section 177 px
   - Build: Two cards per row (460x110); 'Some controls wait for hydration' wraps to a second row (460x86). Gap 12, padding 14, inner gap 4. Section 284 px
   - Cause: apps/docs/components/mdx/cards.tsx:6 md:grid-cols-2 gap-3; :11 p-3.5 gap-1
   - Fix: cards.tsx:6: md:grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-3.5. cards.tsx:11: p-4 gap-1.5.
2. **[medium] The three kinds table**
   - Frame: Headers Kind and Chip in mono 10.5 Regular; 'What it means' in Inter Semi Bold 14. Columns 96/162/686. Rows 42/42/59 px. Table 944x187
   - Build: All headers Inter Semi Bold 14. Columns 89/202/640. The recorded chip 'split - 0 KB server + n KB client' wraps to 2 lines in its column. Rows 45/45/65.6 px. Table 932x202
   - Cause: apps/docs/components/classes.ts:90 PROSE_CELL. lib/table-of.ts:47 ONE_LINE = 32 makes the Chip column 'wrap', because the 33-character generated chip is one character over
   - Fix: Apply the Colors header fix and PROSE_CELL leading-[1.0625rem]. Let the Chip column fit (ONE_LINE 34, or the cell nowrap); keep the generated wording.
3. **[medium] Why index.tsx has no hooks, caption**
   - Frame: 'The two hooks a Server Component is allowed to call.' Inter 10.5 muted, 13 px tall
   - Build: 16 px muted paragraph on a 24 px line
   - Cause: apps/docs/content/en/server-first.mdx:63 plain paragraph → mdx-map.tsx:31 text-base
   - Fix: Wrap server-first.mdx:63 in the Caption MDX component (NOTE).
4. **[low] Under the three kinds table**
   - Frame: No text between the table and the next section; every drawn paragraph is muted
   - Build: The (recorded) count paragraph 'Of the 52 component imports today...' is text-body (white) 16 px, unlike every other paragraph
   - Cause: apps/docs/components/guides/kind-counts.tsx:8 className='text-base text-body'
   - Fix: kind-counts.tsx:8: text-body → text-muted, or set it as a NOTE caption (text-xs text-muted).
5. **[low] What may cross the boundary, Wrong pane**
   - Frame: Each line on one line (no wrapping); box 465x84
   - Build: The long Wrong line wraps mid-expression ('getLabel={(c)' / '=> c.label}'), as does the comment; box 459x114. (The Right pane's 14-line length follows from the recorded Command correction and its 'check' fence.)
   - Cause: apps/docs/components/mdx/wrong-right.tsx:35 passes wrap to every pane
   - Fix: Break the sample by hand at the props (server-first.mdx:27), or let code panes scroll (drop wrap at wrong-right.tsx:35).
6. **[low] Section paragraphs, inline names**
   - Frame: index.tsx, hook.ts and use client in Inter 16 muted
   - Build: 14 px mono (PROSE_CODE), with 'use client' in quotes
   - Cause: mdx-map.tsx:34 PROSE_CODE
   - Fix: PROSE_CODE at the paragraph's size, or no backticks.
7. **[low] On this page**
   - Frame: 'Why index.tsx has no hooks' on one line (15 px). The two-line entries are followed by a 10 px gap
   - Build: 'Why index.tsx has no hooks' wraps to 2 lines (text 155 px plus a space in a 158 px column). The two-line entries are followed by a 1 px gap, so three entries run together
   - Cause: apps/docs/components/shell/toc-list.tsx:11 gap-px
   - Fix: py-1 on TOC_LINK (classes.ts:22-25).

## /en/docs/accessibility: differs (11)

Note: Checked against frame 183:1877 (get_metadata, plus get_design_context on 183:2006) and r11/page-accessibility.png. Recorded and not reported: the Known gaps rewrite, 'Every pnpm check', the sentences that were dropped, the breadcrumb and the pager. docs-site page 12 asks for TOUCH_TARGET and FOCUS_RING to be printed, not typed; the build prints them, but outside the drawn code block. The code line pitch is refuted below.

1. **[medium] Contrast table, Minimum column**
   - Frame: What column 828 px; Minimum is a 116 px column at the far end (ratios at x about 1106)
   - Build: What column 539 px; Minimum is 391 px wide from x 804, so the ratios sit mid-table with about 330 px empty after them
   - Cause: apps/docs/lib/table-of.ts:51 makes the last column always 'prose' (whitespace-normal min-w-60), so auto layout gives the slack to Minimum
   - Fix: table-of.ts:51: return 'fit' for a last column whose header and cells are all at most ONE_LINE, and let the first prose-like column take the slack (w-full).
2. **[medium] Contrast table, header and values**
   - Frame: What and Minimum headers in mono 10.5 Regular. Ratios in mono 10.5 body. Rows 43 px. Table 944x259
   - Build: Headers Inter Semi Bold 14. Ratios Inter 13 muted. Rows 45 px. Table 932x271
   - Cause: apps/docs/components/classes.ts:90 PROSE_CELL; accessibility.mdx:15-19 writes the ratios as plain text
   - Fix: Apply the Colors header fix. Write the ratios as inline code with AUTHORED_CELL [&_code]:text-body. PROSE_CELL leading-[1.0625rem].
3. **[medium] Target size, code block and caption**
   - Frame: Code block holding the definition (export const TOUCH_TARGET = '...'), block 944x111, then the caption 'The shared class every control carries.' in Inter 10.5 muted
   - Build: Code block of a SaveButton using TOUCH_TARGET (5 lines, 932x158, titled save-button.tsx), then a 16 px paragraph whose printed value runs over 3 lines as 14 px mono
   - Cause: apps/docs/content/en/accessibility.mdx:25-33
   - Fix: Print the value inside the fence, generated (a CodeFrame with `export const TOUCH_TARGET =\n  '${TOUCH_TARGET}'`). Keep 'The shared class every control carries.' as a NOTE caption.
4. **[medium] Focus is always visible, code block and value**
   - Frame: Code block of the FOCUS_RING definition (944x149), no text after it
   - Build: Code block of a HomeLink (5 lines, 932x158), then 'Its value: ...' as a 16 px paragraph with 2+ lines of 14 px mono
   - Cause: accessibility.mdx:43-51
   - Fix: Generate the definition into the fence, as for TOUCH_TARGET, and drop the 'Its value' paragraph.
5. **[medium] Automatic and manual table**
   - Frame: Headers Check, How and When in mono 10.5 Regular. 'Contrast' and 'check-contrast.ts' in mono 10.5 body. Columns 212/507/225. Rows 42 px. Table 944x297. Links axe-core and ARIA Authoring Practices underlined
   - Build: Headers Inter Semi Bold 14. Contrast in Inter 13; check-contrast.ts in mono 13 muted. Columns 163/509/258. Rows 45.6-49 px. Table 932x325. Links not underlined
   - Cause: apps/docs/components/classes.ts:90 PROSE_CELL, :100 AUTHORED_CELL, :5 TEXT_LINK (underline on hover only)
   - Fix: Apply the Colors header fix. AUTHORED_CELL [&_code]:text-body. PROSE_CELL leading-[1.0625rem]. Add underline to TEXT_LINK.
6. **[low] Labels are enforced by the types, Right pane**
   - Frame: 3 lines (<Field ...><Input type="email" /></Field>), box 465x84
   - Build: 10 lines (imports, function, render prop), box 459x199
   - Cause: accessibility.mdx:64-75 (a 'check' fence)
   - Fix: Show the Field/Input lines only, and keep the full file as the checked source.
7. **[low] Lead, 'WCAG 2.2 AA' (added by verifier)**
   - Frame: The lead opens with 'WCAG 2.2 AA' as an underlined #51a2ff link to w3.org/TR/WCAG22
   - Build: Plain muted text; no link
   - Cause: apps/docs/components/shell/docs-shell.tsx:59 renders entry.description as plain text (apps/docs/content/pages.ts:126)
   - Fix: Let a page entry carry an optional lead link (text and href) in pages.ts, and render it with TEXT_LINK in docs-shell.tsx:59.
8. **[low] Every drag has a keyboard path, 'WCAG 2.5.7' link**
   - Frame: Underlined
   - Build: Underlined only on hover
   - Cause: classes.ts:5 TEXT_LINK
   - Fix: Add underline to TEXT_LINK.
9. **[low] Known gaps, warning callout**
   - Frame: icon/warning-circle 14 px, 944x60
   - Build: Warning triangle 16 px, 932x59
   - Cause: apps/docs/components/mdx/callout.tsx:6 takes the Alert warning icon (packages/topclassui/src/components/alert/constants.ts:26)
   - Fix: callout.tsx:6: pass the warning-circle icon to Alert's icon prop for tone 'warning'.
10. **[low] Paragraph inline names (--tc-ring, id, aria-label, aria-labelledby)**
   - Frame: Plain Inter 16 muted
   - Build: 14 px mono
   - Cause: mdx-map.tsx:34 PROSE_CODE
   - Fix: PROSE_CODE at the paragraph's size.
11. **[low] On this page, two-line entries**
   - Frame: 'Every drag has a keyboard path' and 'Labels are enforced by the types' are 30 px each, then a 10 px gap
   - Build: 32 px, then a 1 px gap
   - Cause: apps/docs/components/shell/toc-list.tsx:11 gap-px
   - Fix: py-1 on TOC_LINK.

## /en/docs/changelog: differs (2)

Note: /en/docs/changelog is a 404 on the build (r11/page-changelog.png shows the not-found page). The page lives at /en/changelog (docs-site page 17), so I compared the reviewer's capture r11-review/guides/build/changelog.png with frame 183:2536. docs-site page 17 records the body read from CHANGELOG.md, only Version policy and Breaking changes kept from the drawing as 'two short sections', no Current state, no sample entries, the new lead and the pager, so most of the drawing is not comparable.

1. **[low] Release entries (0.1.0-beta.1, 0.1.0-beta.0)**
   - Frame: The frame draws no release body. Its guide prose is Inter 16 muted, and inline names are never chips
   - Build: List text in text-body (white) 16 px. Every backticked name sits on a bg-neutral-soft chip (radius 4, px 4, 14 px mono, body colour), so dense lines read as rows of pills, unlike any other guide page
   - Cause: apps/docs/components/guides/releases.tsx:11 CODE = 'rounded-chip bg-neutral-soft px-1 font-mono text-sm text-body'; :29 ul text-body
   - Fix: releases.tsx:11: use PROSE_CODE (classes.ts:84) for inline code. releases.tsx:29: text-body → text-muted.
2. **[low] Section order**
   - Frame: Breaking changes (y 662) before Version policy (y 1001)
   - Build: Version policy (y 780) before Breaking changes (y 900); On this page follows the build's order
   - Cause: apps/docs/content/en/changelog.mdx:9-15
   - Fix: Swap the two ## sections in changelog.mdx.

## Refuted by the second reviewer (do not act)

- /en/docs/colors, Code blocks (three layers, three modes, add your own theme), line pitch: Recorded: DECISIONS 2026-10-19 (job 125) says code on a guide page is text-xs on the text-sm line height, which gives 17.14 px against the frames' 18.9.
- /en/docs/colors, Prose paragraphs (every guide page), 16 px on 1.62 vs 24 px line: Type-scale snapping (recorded #6, S2): text-base carries its 24 px line, and that is 1.9 px per line from the drawn 25.9.
- /en/docs/colors, Shell: main 1020 / column 932 / On this page at x 1240: html has scrollbar-gutter: stable with a thin bar (DECISIONS job 123), which reserves 10 px. Without it, main is 1030 and the column 942 against 944 (gutter 44 vs 43), within 2 px. The sidebar's 13 vs 14 px text is type-scale snapping.
- /en/docs/icons, Code blocks and Wrong/Right panes, line pitch (boxes 459x114 vs 465x120): Recorded line height (DECISIONS job 125). The 6 px width gap is the scrollbar gutter.
- /en/docs/icons, On this page: No difference: the reviewer measured the same 25 px pitch, and there is no two-line entry.
- /en/docs/theming, Code blocks, line pitch (Scoping block 932x141 vs 944x149): Recorded line height (DECISIONS job 125).
- /en/docs/theming, What is deliberately not themeable, callout: Within 2 px (41.5 vs 43 tall); the reviewer also proposed no fix.
- /en/docs/theming, A mode is one block, header 'topclassui/tokens.css' with the terminal icon: docs-site S3 allows a file name as the title, and the tokens.css excerpt is recorded. Only the Copy button is kept.
- /en/docs/rtl, Code blocks and Wrong/Right panes, line pitch: Recorded line height (DECISIONS job 125).
- /en/docs/rtl, Code block headers (file names app/layout.tsx, styles.css, labels/ar.ts): docs-site S3's build table makes the title 'terminal' or the file name, so file names are allowed. The reviewer proposed no fix.
- /en/docs/server-first, Code blocks, line pitch (hooks block 932x175 vs 944x187): Recorded line height (DECISIONS job 125).
- /en/docs/server-first, The three kinds table, chip text 'split - 0 KB + n KB': The wording is the generated chip from lib/chip.ts:27 (recorded: one chip, generated). Only the column wrap is kept.
- /en/docs/accessibility, Code blocks, line pitch: Recorded line height (DECISIONS job 125).
- /en/docs/changelog, Breaking changes, the drawn 0.4.0 sample code block: Recorded by docs-site page 17: Breaking changes is kept as a short section, and the drawn sample entries are not built.
- /en/docs/changelog, How an entry is written, missing section: Recorded by docs-site page 17: only Version policy and Breaking changes are taken from the drawing; the body is CHANGELOG.md.
- /en/docs/changelog, Release headings (h2 version, h3 Minor Changes): Recorded: these are the CHANGELOG.md body that page 17 renders in place of the drawn sections. The reviewer also proposed no fix.
