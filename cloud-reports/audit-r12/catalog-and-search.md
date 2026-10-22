# Figma audit 2, catalog and search

Second audit on preview/r8-all 694273fe at 1440 dark: every first-audit row re-checked (still open) plus a fresh pass (new), each re-checked by a second reviewer. Close every row or record why it stays.

## /en/docs/components: differs (5)

Note: I checked all four claims again against Figma (151:973/977/979/1031, 193:1588 metadata, 133:168, 133:156, 133:163, 165:1113). I also cropped fig/top.png and r12/page-components.png and took fresh 2x Playwright shots and computed styles (skeptic dir: probe1.mjs/json, p-en-nav-right.png, p-en-sidebar.png, c-sidebar.png, c-mode.png, c-css.png, b1-b3.png, b-toc.png, b-footer.png). All four claims hold.

- The sidebar offset is not the one-shell decision: guide frame 193:1624/1629 draws Home at 82 too.
- The '@' scope was confirmed with Shiki 4.5.0 from r9-a (shiki-scope.mjs). The proposed PLAIN_IN_CSS entry was tested and turns '@' to #d4d4d4 while 'import' stays #51a2ff (shiki-fix.mjs).
- On the mode switch weight: DECISIONS 2026-10-19 (actions and display) records 'segments are regular, the selected one medium' for the library SegmentedControl. That entry comes from the component's own Previewer and does not cover the navbar frame. The navbar frame 133:168 and the card switch 138:1662 both draw Medium on every segment, so the row stays open.

I added one row: the On this page entry label.

Checked and not reported:
- TOC rows sit on a 25 px pitch against the drawn 21. The 24 px rows come from R-5.6-2 target size.
- The brand tile is the recorded mark (DECISIONS 2026-10-19 Home).
- The navbar Ctrl K is 12 px against 10 (snap).
- A 10 px page scrollbar at the right edge is browser chrome, not design.
- The footer lists are generated, and Privacy and Blog are missing because those pages do not exist.

1. **[medium] (still open) sidebar, row label colour**
   - Frame: 151:979 Home (and 193:1629 on the guide frame): 14 px Inter Regular, var(base/body), white in dark. Icons are muted. Only nav:current 151:1031 is primary/on-soft Medium.
   - Build: Every non-current SidebarLink is 13 px, weight 400, colour lab(66.1), i.e. --tc-muted (about rgb 161,161,161). Measured on Home at x 10 y 146 199x29 and Install the package at y 177, the same through Changelog. The list reads grey; only Components is primary. 13 against 14 px is the snap.
   - Cause: apps/docs/components/classes.ts:39: SIDE_LINK.rest = `min-h-[1.8125rem] px-2 text-muted hover:text-body ${TYPE.nav}`. This overrides the library's SIDEBAR_LINK_STATE.rest `text-body` (packages/topclassui/src/components/sidebar/classes.ts:83). The doc at :36 says 'muted until hovered'. No DECISIONS entry covers it.
   - Fix: classes.ts:39 SIDE_LINK.rest = `min-h-[1.8125rem] px-2 ${TYPE.nav}`. Dropping text-muted and hover:text-body lets the library's text-body and its HOVER.ghost fill apply. Reword the doc at :36.
2. **[low] (still open) navbar, mode switch label weight**
   - Frame: 133:168: Light, Dark and Ocean are all 12 px Inter Medium (500). Track: surface, 1 px line, p 3, gap 2, 217x31.
   - Build: The radios at x 1019 (Light), 1091 (Dark) and 1161 (Ocean) are 13 px. Light and Ocean are weight 400 and muted; only the checked Dark is 500. The 2x shot shows the unchecked labels visibly lighter than the frame. Track 228.8x32 (snap).
   - Cause: apps/docs/components/classes.ts:34: MODE_SEGMENT = `font-normal data-checked:font-medium ${TYPE.nav}`. It restates the library SegmentedControl rule (DECISIONS 2026-10-19, regular with the selected one medium), which was read from that component's own Previewer, not from the navbar frame.
   - Fix: classes.ts:34 MODE_SEGMENT = `font-medium ${TYPE.nav}`. Or add a DECISIONS line saying the site's switch follows the component's regular/medium split, which closes the row.
3. **[low] (new) sidebar, title row and every group sit 6 px low**
   - Frame: 151:973 and 193:1624: the 'Documentation' row spans 20 to 47 below the sidebar top (pb 10, 17 px text). The START HERE row spans 49 to 80 (pt 14, text 63 to 75). Home is at 82, Colors at 301 and Components at 520 on the guide frame (537 on the catalog frame, which has a 2-line row).
   - Build: Title p spans 20 to 50 (20 px line plus pb 10). Then come the root's 4 px gap and the group's pt-2: the START HERE label p is at 62 (text 67 to 81), Home at 88 (page y 146), Colors at 308 and Components at 528. Glyph rows measured on the captures: Home cap height at page 156 against 150, FOUNDATIONS at 348 against 342. The 29 px rows and 31 px pitch match.
   - Cause: apps/docs/components/shell/site-sidebar.tsx:18: TITLE has 'pb-2.5' on a 20 px line, so the row is 30 tall against the drawn 27. The rest comes from SidebarRoot's gap-1 (sidebar/classes.ts:16) plus the group's pt-2 (sidebar-groups.tsx:21), 12 px before the label against the drawn 2.
   - Fix: site-sidebar.tsx:18: change pb-2.5 to pb-1. Home moves to 82, START HERE text to 61 to 75 (drawn 63 to 75), Colors to 302 and Components to 522: within 2 px.
4. **[low] (new) Before you start, step 2 code, '@' of @import**
   - Frame: 165:1114: in each of the three @import lines, '@' is var(base/body) and only 'import' is #51a2ff. Strings are #00d492 and ';' is plain.
   - Build: The whole '@import' is #51a2ff in all three lines (3x crop c-css.png). Strings are green and ';' is plain, as drawn.
   - Cause: Shiki 4.5.0's CSS grammar scopes '@' as punctuation.definition.keyword.css inside keyword.control.at-rule.import.css. apps/docs/lib/shiki-themes.ts:34 colours keyword.control, and PLAIN_IN_CSS (:20-23) has no entry for that punctuation.
   - Fix: Add 'punctuation.definition.keyword.css' to PLAIN_IN_CSS at shiki-themes.ts:20-23. Tested with the site's theme rules: '@' becomes #d4d4d4 and 'import' stays #51a2ff. This also applies to @media and @theme in the guide pages' CSS fences.
5. **[low] (added by verifier) On this page, START HERE, second entry label**
   - Frame: 138:2772 (On this page 133:288): 'Install: CLI or package', 12 px, under 'How to read a card'. docs/figma/docs-site.md:2094 transcribes the same text.
   - Build: 'Before you start' (a at x 1256 y 165, 90.7x24, 12 px muted). It repeats the card heading instead of the drawn entry.
   - Cause: apps/docs/labels/en.ts:247: installHeading: 'Before you start', used for the entry at apps/docs/components/catalog/catalog-page.tsx:33 (ar.ts:253 'قبل أن تبدأ'). No DECISIONS entry.
   - Fix: en.ts:247 installHeading: 'Install: CLI or package', with the matching Arabic in ar.ts:253. Or add a DECISIONS line saying an On this page entry repeats its section's heading, which closes the row.

## /ar/docs/components: differs (2)

Note: Both claims hold, but the font fix as written is wrong.

On /en, getComputedStyle(html).getPropertyValue('--font-noto-arabic') is empty: lib/fonts.ts fontClassOf adds notoArabic.variable only for 'ar'. So a bare var(--font-noto-arabic) makes --tc-font-mono invalid on every English page. I measured this with the reviewer's value injected: on /en the caption, the section chip and the Before you start pre all compute to Inter. With var(--font-noto-arabic, "Geist Mono") instead, /en keeps Geist Mono and /ar renders the Arabic glyphs in Noto (probe2.mjs and probe2.json).

Frame 162:1140 sets the captions in Noto Sans Arabic Regular 9 px, not in mono. The build's larger Arial forms are visible in r-states-find.png. The brand row is confirmed in r-nav-brand.png. Everything else is S10 one tree, as the reviewer says.

1. **[medium] (new) Every state captions and count, section count chips, the 'once per app' chip: Arabic glyphs in Arial**
   - Frame: 162:1140: the captions تحميل معطّل تركيز ضغط تمرير عادي are Noto Sans Arabic Regular 9 px, muted. The count '6 حالات' is 10 px. All Arabic in the frame is Noto Sans Arabic.
   - Build: CSS.getPlatformFontsForNode on /ar:
- Button card captions (STATE_CAPTION, font-mono, 11 px): 'عادي' Arial 4 glyphs, 'تحميل' Arial 5.
- Section chip '4 مكوّنات': Arial 7, Geist Mono 2.
The reviewer also measured the '6 حالات' count and the 'مرة واحدة لكل تطبيق' chip in Arial. On the captures, the captions are visibly larger and in Arial letterforms against the frame's Noto. This holds for every state caption on every card and for every section and Before you start chip on /ar.
   - Cause: apps/docs/lib/fonts.ts:8: Geist_Mono (next/font, default adjustFontFallback) defines 'Geist Mono Fallback' as an @font-face on local Arial with no unicode-range, and var(--font-geist-mono) carries it. apps/docs/app/globals.css:11 `--tc-font-mono: var(--font-geist-mono), ui-monospace, monospace, var(--font-noto-arabic, monospace)` puts Noto after it, so Arial takes every Arabic glyph. The comment at :10 says the opposite should happen.
   - Fix: globals.css:11 `--tc-font-mono: "Geist Mono", var(--font-noto-arabic, "Geist Mono"), var(--font-geist-mono), ui-monospace, monospace;`, and reword :10. The fallback inside var() is required, because /en never defines --font-noto-arabic.

Verified in the browser: /en code, chips and captions stay Geist Mono, and on /ar the captions become Noto Sans Arabic (5 and 7 glyphs) and the section chip Noto 9 plus Geist Mono 2.

Do not use the reviewer's bare var(--font-noto-arabic): it turns every mono element on /en into Inter (measured). Their adjustFontFallback alternative needs the same var() fallback.
2. **[low] (still open) navbar, brand name**
   - Frame: 159:1073: 'توب كلاس', 16 px Noto SemiBold (text 73x34), beside the palette tile at the right edge, row x 1313 to 1408.
   - Build: 'TopClass UI' in Latin, 16 px 600, at about x 1280 to 1370, with the tile at 1378 to 1402 (3x crop r-nav-brand.png).
   - Cause: apps/docs/labels/ar.ts:5 meta.siteName: 'TopClass UI', rendered at components/shell/site-navbar.tsx:57. The job marked it 'kept: for Omar' with no DECISIONS entry. docs-site.md:880 transcribes the Arabic wordmark.
   - Fix: labels/ar.ts:5 siteName: 'توب كلاس' if the Arabic frame wins. siteName also feeds the /ar footer, the Open Graph image (opengraph-image.tsx:23) and metadata siteName (lib/metadata.ts:95), so a navbar-only label is the narrower change. Otherwise add a DECISIONS entry recording the Latin wordmark on /ar, which closes the row.

## /en/docs/components with Ctrl K open: differs (3)

Note: I compared 138:1686/1687/1691/1694/1695 (get_design_context) with the reviewer's search-geom-open/but.json, s-but-2x.png and r12/page-search.png. The side-by-side is skeptic dir s-cmp.png, frame left at 2x and build right.

- Three claims hold: Esc keycap, text inset and heading height.
- The capped-list padding claim is refuted.
- The scrim is present: the page behind is dimmed about 40%, as recorded.
- The search row is 41 tall against the drawn 43 + 1 (within 2 px).
- The 16 against 14 px magnifier and the 12 against 9 px Esc and heading text are snaps.
- 'Button group' is missing because of index content.

Nothing else found.

1. **[low] (still open) search row, Esc keycap**
   - Frame: 138:1691: a chip with base/surface fill (the darker surface) and a 1 px base/line border, radius 4, padding 2/6, 31x18, holding 9 px mono muted 'Esc'. It reads as a dark inset box on the raised panel.
   - Build: kbd 35.6x22 at x 866.4 y 145, radius 4, padding 2/6. Fill and border are both lab(15.2), and in dark --tc-surface-raised and --tc-line are the same lab(15.2), so the box disappears into the panel (dialog bg and border are also lab(15.2)). Only the text 'Esc' shows.
   - Cause: packages/topclassui/src/components/command/classes.ts:67: COMMAND_ESCAPE_HINT = 'shrink-0 border-line text-muted pointer-coarse:hidden'. It keeps Kbd's own bg-surface-raised (the Kbd cap decision), which is the panel's colour.
   - Fix: command/classes.ts:67 COMMAND_ESCAPE_HINT = 'shrink-0 bg-surface border-line text-muted pointer-coarse:hidden'
2. **[low] (still open) search row, text offset after the magnifier**
   - Frame: 138:1687: row px 14 py 12, gap 10. The 14 px magnifier spans 15 to 29 from the panel's outer edge, and the typed text starts at 39 (10 px after the icon).
   - Build: Panel at x 515. The 16 px magnifier spans 530 to 546 (15 in, as drawn). The input box starts at 556 (gap 10) but pads 8 px more, so the placeholder and the typed 'but' start at x 564: 49 from the panel edge and 18 px after the icon.
   - Cause: packages/topclassui/src/components/command/classes.ts:31: COMMAND_INPUT = 'h-control-md ... bg-transparent px-2 text-base ...'
   - Fix: command/classes.ts:31: replace px-2 with 'ps-0 pe-2'. The text then starts at 556: 10 px after the icon, and 41 from the edge against 39, the 2 px left being the 16 against 14 px glass.
3. **[low] (still open) result list, group heading height**
   - Frame: 138:1695: 'Components' row with pt 6, pb 2, ps 9, 19 tall at list y 6. Its text spans 12 to 23 below the list top, and the first row 138:1697 starts 27 px below it.
   - Build: With 'but' typed: listbox at y 177. The 'Components' heading is a 386x32 box at 183, its 12 px text at 197 to 213 (20 below the list top). The Button row starts at 215, 38 px below the list top: 11 px lower than drawn. The extra space above the heading is visible in s-cmp.png.
   - Cause: packages/topclassui/src/components/command/classes.ts:48: COMMAND_GROUP_LABEL = `flex items-end px-2.5 pb-0.5 text-xs font-medium text-muted ${COMMAND_UNIT}`. COMMAND_UNIT (:39) makes the heading one 32 px row unit, so the spacers in command/lib.ts count whole units. DECISIONS 2026-10-19 (overlays) records only that the heading 'sits 2 px over its rows'. Line 724, 'every row one unit tall', does not name the heading.
   - Fix: Either add a sentence to DECISIONS 2026-10-19 (overlays, Command) saying a group heading takes one row unit so the windowing counts whole units, which closes the row. Or give the heading its own height (pt-1.5 pb-0.5 on an 11 px line, about 1.1875rem, without COMMAND_UNIT) and have command/lib.ts toRunViews and the spacers count heading heights apart from row units.

## Refuted by the second reviewer (do not act)

- /en/docs/components with Ctrl K open, (still open) result list, bottom padding when capped: The frame never draws a capped list: 138:1694 holds two rows. In the drawn 'but' state the build also leaves 6 px under its last row (listbox 177-253, row ends 247). The cut row when capped is LIST_CAP's documented intent (shared/classes.ts:167-168: 'a cut row says there is more'). The proposed padded cap would only swap the cut row for a 6 px sliver of the next unit, because a scroll container's content runs into its bottom padding.
