# Figma audit, catalog and search

On preview/r8-all d9c04b21 at 1440 dark, frame vs build, each difference re-checked by a second reviewer. Fix what your branch has not fixed yet; skip a row your later commits already cover.

## /en/docs/components (the page above the first component card: navbar, sidebar, title, intro, filters, chips, the first cards): differs (15)

Note: Re-checked against fresh 1x and 2x Playwright shots of :4620 and fresh Figma design context and renders (133:150, 151:973/977/979/983/1031, 193:1629, 133:285, 165:1096, 140:913, 140:942, 138:2773, 135:155). The composites are in r11-review/catalog-and-search-skeptic: cmp-nav-l/r, cmp-sidebar-rows, cmp-hd, cmp-before-a/b, cmp-legend-section, cmp-toc and cmp-top-0/1. Four reviewer items were refuted (see refuted), and parts of two kept items were dropped as snap or shell spacing. One item was added: the section leads have no 760 px measure. Recorded decisions are not reported. The Button card's six-cell states strip wraps 5 + 1, which job 140 is fixing. The build's On this page lists How to read a card before Before you start, while the page renders Before you start first. The frame does the same, so this is not counted. One side effect: the spy (use-toc-spy.ts:30-34, which walks the entries in list order) marks Before you start while the legend is being read.

1. **[medium] navbar, bar height and side padding**
   - Frame: 133:150 is 1440x58, padding 0/28, gap 18. The brand row is at x 28 and the GitHub icon at x 1396-1412. The guide frame 193:1590 is the same.
   - Build: The header is 52 px including its 1 px bottom line (pt 6, pb 4, min-h-13), with 16 px sides. The brand is at x 16 and the GitHub icon at x 1394-1410. The sidebar, main and On this page start at y 52 instead of 58.
   - Cause: packages/topclassui/src/components/navbar/classes.ts:8-10 NAVBAR_ROOT 'min-h-13 ... pb-1 ps-[calc(1rem+var(--tc-safe-start))] pe-[calc(1rem+var(--tc-safe-end))]' is the library bar, 52 px from its own Previewer 138:2393. apps/docs/components/shell/site-navbar.tsx:54 passes only className="bg-surface".
   - Fix: site-navbar.tsx:54 <NavbarRoot className="bg-surface min-h-14.5 ps-[calc(1.75rem+var(--tc-safe-start))] pe-[calc(1.75rem+var(--tc-safe-end))]">. This gives 58 px and 28 px sides on the site and keeps the safe-area term that a bare ps-7 would drop. The library Navbar keeps 52 px.
2. **[medium] navbar, search button border**
   - Frame: 133:163 has a 1 px base/line border (pixel rgb 38,38,38 at x 907) on base/page, radius 8: a quiet sunk field.
   - Build: The border is 1 px --tc-line-strong (pixel rgb 161,161,161 at x 875). It is the brightest edge in the bar.
   - Cause: apps/docs/components/search/search-button.tsx:44 uses Button variant="outline", which maps to packages/topclassui/src/components/button/variants.ts:33 'border-line-strong'. apps/docs/components/classes.ts:31 SEARCH_TRIGGER sets no border colour.
   - Fix: classes.ts:31 add border-line to SEARCH_TRIGGER: `bg-page border-line font-normal text-muted ...`.
3. **[medium] sidebar, row label colour**
   - Frame: Nav rows 151:979 and 151:983 (and 193:1629 on the guide frame) are 14 px Inter Regular in base/body. Brightest text pixel: rgb(250,250,250).
   - Build: 13 px Regular in --tc-muted. Brightest text pixel: rgb(161,161,161), so the whole list reads grey. 13 against 14 px is within the snap and is not counted.
   - Cause: apps/docs/components/classes.ts:39 SIDE_LINK.rest = `px-2 text-muted hover:text-body ${TYPE.nav}`.
   - Fix: classes.ts:39 SIDE_LINK.rest = `px-2 text-body ${TYPE.nav}`. The library ROW hover fill still marks hover.
4. **[medium] sidebar, row height and pitch**
   - Frame: Rows are 199x29 (padding 6/8 around a 17 px line) and 2 px apart: a 31 px pitch. The title row is 27 tall. From the sidebar top: Home at 82, the FOUNDATIONS row at 268, Components at 520 (counting the frame's two-line 'Icons' row as one line).
   - Build: Rows are 199x26 with a 28 px pitch; the title row is 30 tall. Home at 88, the FOUNDATIONS label at 264, Components at 492. By the REFERENCE group the rows sit 28 px higher.
   - Cause: apps/docs/components/shell/site-sidebar.tsx:17 RAIL '[--tc-row-height:1.625rem]' (26 px). The comment at :15 reads the frames as 26/28; the metadata says 29/31.
   - Fix: site-sidebar.tsx:17 '[--tc-row-height:1.8125rem]' (29 px). With the existing gap-0.5 that gives the 31 px pitch.
5. **[medium] header, lead under the h1**
   - Frame: 133:287: 16 px Inter Regular muted, 740 wide, 2 lines. hd 133:285 is 92 tall (44 + 10 + 38).
   - Build: 18 px on a 28 px line, 740 wide, 3 lines, 84 tall. The header block is 134 tall, so Before you start starts 162 px below the h1's top instead of 120: 42 px lower, not the 28 the reviewer gave.
   - Cause: apps/docs/components/catalog/catalog-page.tsx:46 `${LEAD} max-w-185`, where LEAD (classes.ts:54) = 'max-w-3xl text-lg text-muted'. docs-site.md:419 itself says 'lead 16 stays 16'.
   - Fix: catalog-page.tsx:46 className="max-w-185 text-base text-muted" (2 lines at 16/24).
6. **[medium] Before you start, step 3 code box and card height**
   - Frame: 165:1119 has 13 code lines. `<html lang={locale} dir={dir} data-theme="dark">` and `<TopClassProvider direction={dir} locale={locale}>` are each on one line. The box is 434.5x232 with 11 px padding; grid rows are 196 + 340; the card is 944x620.
   - Build: 18 lines: <html is broken over 4 lines with an added suppressHydrationWarning line, and <TopClassProvider over 3. The box is 429x393, rows are 216.6 + 518, and the card is 932x822.6 (202.6 px taller). The 12 px code size is a snap of the drawn 9.5 px and is not counted.
   - Cause: apps/docs/components/catalog/before-you-start.tsx:16-33 ROOT_LAYOUT wraps the two opening tags (lines 20-23 and 26-28).
   - Fix: before-you-start.tsx:20-28: put `  <html lang={locale} dir={dir} data-theme="dark">` (360 px in 12 px Geist Mono) and `      <TopClassProvider direction={dir} locale={locale}>` (403.2 px) on one line each, and move suppressHydrationWarning into the step note. Also change classes.ts:141 BOXED_CODE p-3 to p-2.75, the drawn 11 px. That widens the pre from 403 to 405 px so the 403.2 px line fits without a sideways scroll (the pre is white-space: pre, overflow-x: auto). The reviewer's 'both fit' was 0.2 px short. Result: 13 lines and a box of about 289 px.
7. **[medium] section headers (all seven), count chip position**
   - Frame: 140:943: 'Actions' (96 wide), then the '4 components' chip 10 px after it (row gap 10).
   - Build: In every section the chip sits 42 px after the visible title. For Actions the text is 88 wide but the h2 is 120.3, because the h2 holds the invisible 24 px anchor and its 8 px gap.
   - Cause: apps/docs/components/section-heading.tsx:19-21 renders the anchor in flow, and ANCHOR (classes.ts:126) is only opacity-0. catalog-page.tsx:53-55 places the chip after the h2.
   - Fix: Take the anchor out of flow for the catalog section titles. Add 'relative' to H2_BASE (classes.ts:151), and give SectionHeading an option that adds 'absolute inset-e-full me-1' to the anchor, so it sits in the main column's 44 px gutter before the title. The reviewer's inset-s-full would land the 24 px anchor on the chip. In-card headings keep the in-flow anchor, because CARD clips overflow.
8. **[medium] On this page, groups and counts**
   - Frame: 133:288: 'ON THIS PAGE'; a 'START HERE' eyebrow (9 px Semi Bold muted) over 'How to read a card' and 'Install: CLI or package'; then 'SECTIONS' 14 px lower over Actions..Navigation. Each section row (138:2775) has the 12 px label at the start and its count in 9 px Roboto Mono muted, flush at the end (x 152 of 158).
   - Build: One flat list of nine links with no START HERE or SECTIONS eyebrows. Each count is glued to its label in the same 12 px Inter ('Actions 4', 53.7 px wide). Not counted: the 25 px row pitch (21 drawn) is the shared shell spacing, and the second entry's wording follows its heading 'Before you start'.
   - Cause: apps/docs/app/(site)/[locale]/docs/components/page.tsx:32 flattens catalogToc(locale) with flatMap((group) => group.items), which drops the group labels that catalog-page.tsx:33-34 already provides. catalog-page.tsx:34 builds the text as `${title} ${count}`. shell/toc-list.tsx:74 renders only text.
   - Fix: Pass the groups through. Add a groups prop to OnThisPage (shell/on-this-page.tsx) that renders each group label with SHELL_EYEBROW above its items. Make the catalogToc items { id, text: title, count }. In toc-list.tsx, render the count as <span className="ms-auto font-mono text-xs text-muted">{count}</span> inside a w-full flex link.
9. **[medium] first card (Button), title colour**
   - Frame: 135:159: 'Button' 19 px Semi Bold in base/body (white).
   - Build: The title is a link in primary-on-soft (lab 65 -1.4 -57). It is 18 px Semi Bold; the size is the snap.
   - Cause: apps/docs/components/previewer/previewer.tsx:87 <a href={href} className={LINK}>, where LINK (classes.ts:124) sets text-primary-on-soft.
   - Fix: Add CARD_TITLE_LINK = `inline-flex items-center rounded-control text-body underline-offset-4 ${HOVER.link} ${FOCUS_RING} ${TOUCH_TARGET}` to classes.ts and use it at previewer.tsx:87.
10. **[low] navbar, search button size**
   - Frame: 127x29, padding 6/8/6/10, gap 8, magnifier 14 px, 'Search' 12 px Regular.
   - Build: 144.3x32 at x 875, padding 0/12, magnifier 16 px, label 13 px. The 12 px mono 'Ctrl K' is the scale floor for the drawn 10 px and is not counted.
   - Cause: search-button.tsx:44 size="sm" (h-8, px-pad-x-sm) and :45 <Svg size="1rem">. classes.ts:31 SEARCH_TRIGGER adds TYPE.nav (13 px).
   - Fix: search-button.tsx:44 size="xs": CONTROL_SIZE.xs is the 28 px control with text-xs and the xs padding. search-button.tsx:45 size="0.875rem". Drop ${TYPE.nav} from SEARCH_TRIGGER so the 12 px label of the xs size stays.
11. **[low] navbar, mode switch label weight**
   - Frame: 133:168: all three labels are 12 px Inter Medium (500). Segments are 23 tall, padding 9/4, icons 14 px.
   - Build: 'Light' and 'Ocean' are Regular (400); only the checked 'Dark' is 500. Each size is within 1 px of the frame: labels 13 px, icons 13 px, segments 24 tall, padding 10. The whole switch is 228.8 wide against 217.
   - Cause: apps/docs/components/classes.ts:34 MODE_SEGMENT = `font-normal data-checked:font-medium ${TYPE.nav}`.
   - Fix: classes.ts:34 MODE_SEGMENT = `font-medium ${TYPE.nav}`, or 'font-medium text-xs' to also take the drawn 12 px.
12. **[low] sidebar, group label inline offset**
   - Frame: 151:977: the label row has padding-left 8, so the 'START HERE' text starts at x 18, in line with the row icons. 10 px Medium muted.
   - Build: The label is padded 12 px, so its text starts at x 22, 4 px in from the icons. The 11 px size is a snap and is not counted.
   - Cause: packages/topclassui/src/components/sidebar/classes.ts:50 SIDEBAR_GROUP_LABEL 'px-3 py-1'. apps/docs/components/shell/sidebar-groups.tsx:21 styles only the inner span.
   - Fix: sidebar-groups.tsx:21 give the label span `-ms-1 uppercase ${TYPE.eyebrow}` to pull the text to x 18, or add a ps-2 option to the library label.
13. **[low] Before you start and How to read a card, corner radius**
   - Frame: rounded-[16px] on 165:1096 and 140:913 (surface fill, 1 px line).
   - Build: 12 px (rounded-box) on both; the corner curve measures about 10 px.
   - Cause: apps/docs/components/classes.ts:127 CARD 'grid min-w-0 overflow-hidden rounded-box bg-surface ...', used at before-you-start.tsx:44 and card-legend.tsx:11.
   - Fix: classes.ts: add CATALOG_CARD = `grid min-w-0 overflow-hidden bg-surface ${BORDER} ${ROUNDED_CARD}` (ROUNDED_CARD at classes.ts:57 gives 16 px at the default radius) and use it at before-you-start.tsx:44 and card-legend.tsx:11.
14. **[low] Before you start, step 1 code colours**
   - Frame: 165:1109: all three lines are plain base/body mono. Step 2 beside it is highlighted.
   - Build: '# then add the components you want:' is drawn in the comment grey; the other two lines are body.
   - Cause: before-you-start.tsx:38 lang: 'bash' (Shiki colours the # comment).
   - Fix: Render step 1 as plain text: add 'text' to LANGS (apps/docs/lib/shiki-themes.ts:51; CodeLang at lib/highlight.tsx:7 derives from it) and pass lang: 'text' at before-you-start.tsx:38.
15. **[low] section leads, line length (added by verifier)**
   - Frame: 140:948 to 140:996: each section lead is 14 px and 760 px wide. Data, Feedback, Overlays and Navigation wrap to 2 lines (34 tall; their section frames are 108 tall). The texts match the build word for word.
   - Build: The lead p is 932 px wide, so those four leads sit on one line (20 tall) and their section heads are 95 tall instead of the drawn 108.
   - Cause: apps/docs/components/catalog/catalog-page.tsx:57 <p className={SMALL}> has no measure.
   - Fix: catalog-page.tsx:57 className={`${SMALL} max-w-190`} (760 px).

## /ar/docs/components: differs (4)

Note: Compared a fresh 1x render of 159:1038 (fig/rtl-full.png) with /ar captures (b-ar-full-1x.png, b-ar-card-button.png). CDP platform fonts and the computed styles are in geom-ar.json. Composites: cmp-rtl-nav-l/r, cmp-rtl-top-0/1, cmp-rtl-card-0/1. Only Arabic-specific differences are kept. Every LTR item above applies unchanged on /ar and is not repeated: navbar 52 against 58 px, the search border, muted sidebar labels and the 28 px pitch, the 18 px lead, On this page groups and counts, the blue card title, the Before you start wrap and the 42 px chip gap. The frame is an abridged mock. Several reviewer items fall under docs-site.md S10 'One tree, two locales' (the shell mirrors; nothing is drawn twice), choice 8 (Arabic line height left at the type scale) and S11 (playground controls labelled with the prop name), so they are refuted. The Button card's states strip wraps 5 + 1, which job 140 is fixing.

1. **[high] whole page, Arabic typeface**
   - Frame: Every Arabic string is set in Noto Sans Arabic (Regular, Medium, SemiBold): navbar links 14 px, sidebar 14 px, H1 30 px SemiBold, lead 16 px.
   - Build: html computes 'Noto Sans Arabic', ... but body computes 'Inter, "Inter Fallback", ui-sans-serif, system-ui, sans-serif'. CSS.getPlatformFontsForNode reports ArialMT for the h1 (9 glyphs), the lead (130 Arabic glyphs, plus 29 in Inter), the sidebar link and the navbar link. Noto Sans Arabic never renders: every Arabic glyph is the OS fallback, Arial, thinner and smaller than drawn. The reviewer said Segoe UI; it is Arial.
   - Cause: apps/docs/app/(site)/[locale]/layout.tsx:43 <body className="min-h-dvh bg-page font-sans ...">. font-sans resolves to --tc-font-sans = var(--tc-font-latin) (packages/topclassui/src/tokens.css:37) and is re-declared on body. That overrides the html-level [lang|='ar'] { font-family: var(--tc-font-arabic) } at tokens.css:269-271, which every descendant would otherwise inherit.
   - Fix: In apps/docs/app/globals.css, after the :root block, add `:root:lang(ar) { --tc-font-sans: var(--tc-font-arabic); }`. This is an unlayered custom property, which R-4-1 allows, and has no cycle because --tc-font-arabic is literal. Then font-sans is Noto Sans Arabic on /ar and Inter on /en. Also put var(--font-inter) after var(--font-noto-arabic) in --tc-font-arabic (globals.css:8), so Latin words inside Arabic text stay in Inter and do not fall to the system font.
2. **[medium] first card, Try it prop labels**
   - Frame: Labels (162:1090 and the others) sit at the inline start, the right edge of the 211 px column, above each select and under 'جرّبه'.
   - Build: 'variant', 'tone' and 'size' are 211 px wide boxes at x 253 with dir=ltr and text-align start. The text therefore sits at the column's left edge, 19 px from the card's left: the inline end in RTL, across from the title and the select values.
   - Cause: apps/docs/components/previewer/try-it-control.tsx:43, and the pre-mount copy at playground-island.tsx:92: <span dir="ltr" className={CONTROL_LABEL}> is a stretched item of CONTROL = 'grid gap-1.5' (classes.ts:174), and its own ltr direction puts the text left.
   - Fix: classes.ts:175 CONTROL_LABEL = 'justify-self-start text-xs font-medium text-muted'. The span shrinks to its text and sits at the grid's start, which is the right edge in RTL. Both call sites share the constant.
3. **[low] navbar, brand name**
   - Frame: 159:1073: 'توب كلاس' 16 px SemiBold beside the tile at the right edge.
   - Build: 'TopClass UI' in Latin.
   - Cause: apps/docs/labels/ar.ts:5 meta.siteName: 'TopClass UI'.
   - Fix: labels/ar.ts:5 siteName: 'توب كلاس' if the Arabic frame wins, or record the Latin wordmark in DECISIONS.
4. **[low] first card, Every state captions**
   - Frame: The six captions are in Arabic (عادي، تمرير، ضغط، تركيز، معطّل، تحميل), as S10 lists them.
   - Build: Captions are the Latin mono ids (idle, hover, active, focus-visible, disabled, loading) under an Arabic '6 حالات' heading.
   - Cause: apps/docs/components/previewer/state-strip.tsx:20-33 nameOf/captionOf reads each state's English title from dummy/states.tsx, with no locale.
   - Fix: Add per-locale state names to content/components/<slug>.ts (for example stateNames.ar) and print them in the strip when locale is 'ar'. Or record that state ids stay Latin, as the props table does.

## /en/docs/components with Ctrl K open (the site search palette): differs (5)

Note: Fresh 2x shots after hydration are s-open-2x.png (opened) and s-but-2x.png ('but' typed); geometry is in search-geo.json and the comparison in cmp-search-build.png. Compared with panel 138:1686 and its state cells. The reviewer's matches hold: 400 wide, radius 12, surface-raised fill, line border, the overlay shadow, the soft-primary active row with primary text and icon, 32 px rows, the 14 px file-text icon at x 16 with an 8 px gap, and no highlighted row on open. The underline and bar are DECISIONS 2026-10-19. With 'but' the site index returns only Button (no Button group); that is content.

1. **[high] active result row, Enter hint**
   - Frame: One 'Enter' hint, 9 px mono muted, at the end of the highlighted 'Button' row.
   - Build: 'Enter Enter': the option's ::after content is "Enter" and a visible <kbd>Enter</kbd> (x 818, 36x16) also sits in the highlighted row.
   - Cause: apps/docs/components/search/search-palette.tsx:48 renders its own <kbd>{t.enter}</kbd> with in-data-highlighted:inline. The library already draws the hint as ::after (packages/topclassui/src/components/command/classes.ts:60 COMMAND_ENTER_HINT, content from --tc-command-enter).
   - Fix: Delete search-palette.tsx:48. If the site's wording must show, pass it at search-palette.tsx:27: { command: { label: t.title, placeholder: t.placeholder, enter: t.enter } }.
2. **[low] result list, bottom padding when capped**
   - Frame: The list (138:1694) is padded 6 px on every side, so the last row always has 6 px of list under it.
   - Build: When opened, the list is capped at 224 px (7 units x 32) with its 6 px padding inside the cap. The 6th result (y 375-407) is cut at the list edge, y 401. Its text sits 6 px above the panel's bottom border, and no list padding shows.
   - Cause: packages/topclassui/src/components/command/classes.ts:35 COMMAND_LIST 'p-1.5 ${LIST_CAP}'. LIST_CAP (src/shared/classes.ts:169) is min(available, rows x row-height) and leaves no room for the padding.
   - Fix: command/classes.ts:35: use max-h-[min(var(--available-height,100dvh),calc(var(--tc-list-rows)*var(--tc-row-height)+0.75rem))] for the list, so the 7 units fit whole inside the 6 px padding.
3. **[low] search row, Esc keycap**
   - Frame: 138:1691: 'Esc' in a visible chip with base/surface fill (23), a 1 px line border, radius 4, padding 6/2.
   - Build: A 35.6x22 Kbd whose fill and border are both rgb(38,38,38), the panel's own surface-raised. The box is invisible and only the text shows.
   - Cause: packages/topclassui/src/components/command/classes.ts:67 COMMAND_ESCAPE_HINT 'shrink-0 border-line text-muted pointer-coarse:hidden' keeps Kbd's default bg-surface-raised.
   - Fix: command/classes.ts:67 COMMAND_ESCAPE_HINT = 'shrink-0 bg-surface border-line text-muted pointer-coarse:hidden'.
4. **[low] search row, text offset after the magnifier**
   - Frame: 138:1687: row padding 12/14, gap 10. The magnifier is at x 14 and the typed text 10 px after it (x 38).
   - Build: The magnifier is at x 14 of the panel (16 px; within tolerance). The input starts 10 px after it but pads 8 px more, so the text sits 18 px after the icon (x 48). The 41 px row against 43 is within tolerance.
   - Cause: packages/topclassui/src/components/command/classes.ts:31 COMMAND_INPUT 'px-2'.
   - Fix: command/classes.ts:31 COMMAND_INPUT 'ps-0 pe-2' (text 10 px after the icon). Sizing the magnifier 0.875rem in command/parts/command-panel.tsx:55 is optional.
5. **[low] result list, group heading height**
   - Frame: 138:1695: 'Components' with padding 6 top, 2 bottom, 9 left, about 19 px tall. The first row starts 27 px below the list top.
   - Build: The 'Components' or 'Pages' heading fills a whole 32 px unit, with the text at its foot. The first row starts 38 px below the list top. The 12 px size is the snap of the drawn 9.
   - Cause: packages/topclassui/src/components/command/classes.ts:48 COMMAND_GROUP_LABEL '... ${COMMAND_UNIT}': one whole row unit, so the windowing in command/lib.ts counts units. The DECISIONS 2026-10-19 overlays entry records only 'sits 2 px over its rows'.
   - Fix: Record the one-unit heading in that DECISIONS entry, or give toRunViews a separate heading height so the drawn 19 px can be matched.

## Refuted by the second reviewer (do not act)

- /en/docs/components, navbar, brand tile: This is the recorded brand mark: DECISIONS 2026-10-19, Home from 191:1495 (job 124, 'the mark from docs/brand/ in the navbar'). The tile is 24 px tall against the drawn 25, within 1 px, and the drawn 15 px width is the hug of the old palette glyph that the mark replaces. The label's 16 against 15 px is a snap.
- /en/docs/components, navbar, links gap: The links are 16 px apart in the build and 18 in the frame: 2 px, within tolerance.
- /en/docs/components, On this page, highlighted entry at the top of the page: This depends on scroll state. The frame is an unscrolled full-page drawing with Actions marked, and the spy marks Actions once its heading reaches the bar. The reviewer's own fix is 'no change'.
- /en/docs/components, content column width: Of the 12 px (932 against 944), 10 px is the page scrollbar under scrollbar-gutter: stable, recorded in DECISIONS 2026-10-19 ('No default scrollbar anywhere'). The remaining 1 px per side (44 against the 43 that docs-site.md S2 names) is within tolerance.
- /en/docs/components, On this page, row pitch (part of 'groups and counts'): The 25 px pitch against the drawn 21 is the shared shell spacing (docs-site.md change 17). The guide frame's On this page, 193:1708, draws 25 px. Removed from the kept item.
- /en/docs/components, sidebar, row label size and mode switch sizes (parts of kept items): 13 against 14 px row labels, and the mode switch's 13 against 12 px labels, 13 against 14 px icons and 24 against 23 px segments, are each within 1 px. Only the colour and the weight are kept.
- /ar/docs/components, navbar, height and padding: This is the LTR navbar item: the same 52 against 58 px, the same cause and the same fix. The Arabic frame's 32 px sides against LTR's 28 is the one-shell spacing (change 17). It is not a separate change.
- /ar/docs/components, navbar, search field: The position after the links, the 260x44 box and the boxed 'Ctrl K' are drawn only on the Arabic frame. S10 'One tree, two locales' (the Arabic navbar is the mirrored LTR one) and the LTR frame's 127x29 field with plain 'Ctrl K' govern. The 44 px height follows the Arabic line height, which choice 8 leaves at the scale. The border colour is the LTR item.
- /ar/docs/components, navbar, link list order, 'Colors' and the current weight (part of 'links and brand'): S10 'One tree, two locales': one navLinks list mirrored for both locales. The LTR frame draws the current link Semi Bold, as built, and the reviewer itself proposes accepting it. The brand-name part is kept.
- /ar/docs/components, navbar, mode switch track: Only the Arabic frame fills the track with page; the LTR frame draws surface, which the build uses for both locales (S10 one tree). The 33 px segments are the Arabic line height (choice 8). The reviewer itself says accept.
- /ar/docs/components, sidebar, background and labels: The surface fill is drawn only on the Arabic frame; the LTR frames draw page, and S10 builds one mirrored shell. The 44 px pitch is Noto's normal line height, which choice 8 leaves at the type scale. The muted 13 px labels and the 28 px pitch are the LTR sidebar items.
- /ar/docs/components, header, H1 and lead: H1 36 px is the scale's text-4xl that docs-site.md:419 fixes for both frames (S10 one tree). The 740 px measure is drawn on the LTR frame. The 18 against 16 px lead is the LTR lead item. Nothing here is Arabic-specific.
- /ar/docs/components, On this page (left column): The 36 px top padding is the one-shell spacing (change 17), and the 25 px rows are the shell spacing too (the Arabic 35 px is choice 8's line height). The extra START HERE entries are on the LTR frame (one tree). The glued counts are the LTR 'groups and counts' item, whose fix puts the count at the inline end in Arabic as drawn.
- /ar/docs/components, first card (زر), head order: S10 'One tree, two locales': the head mirrors the LTR head through logical CSS, and the frame's different order is not built by design. The reviewer itself proposes no change.
- /ar/docs/components, first card, Try it labels translated (part of 'Try it and Every state captions language'): docs-site.md S11 records that the playground's controls are labelled with the prop name and described by the prop's description. The state-caption part is kept.
- /ar/docs/components, first card, title colour: This is the LTR card-title item: the same LINK at previewer.tsx:87 and the same fix. It is not a separate change.
- /en/docs/components with Ctrl K open, page behind the palette (scrim): Command is always modal (DECISIONS 2026-10-19, overlays entry: 'Command is always modal, so its stage is a picture'). The frame's stage and state cells are pictures inside a demo box and cannot show a page backdrop. The --tc-overlay 40% dark scrim is the recorded value; it moves page 10 to 6 and is barely visible.
