# Figma audit, job 145 navigation

On preview/r8-all d9c04b21 at 1440 dark, frame vs build, each difference re-checked by a second reviewer. Fix what your branch has not fixed yet; skip a row your later commits already cover.

## /en/docs/components/pagination: differs (11)

Note: Checked against frames/previewer-pagination-138-1269.png, Figma design context for 138:1270, 138:1300, 148:921 and 138:1408, and my own 2x capture and DOM dump (r11-review/job145-navigation-skeptic/b2x-pagination.png, dom2-pagination.json). The reviewer's full-pagination.png matches the live page. Figma's states row uses gap '16px 0px', which is job 140's gap-x-0. Even with that fix, four 224 px state cells need 896 px against 894 px, so the strip still wraps 3 + 1. One claim is refuted: the 32x24 cell, which DECISIONS records. Several cause line numbers were wrong and are corrected below: try-it-control.tsx is 102 lines, the Checkbox is at :35 and the Select at :62-73; 'The code' in a playground card is playground-island.tsx:100.

1. **[medium] head, description**
   - Frame: One line of 14 px muted text. The 89-character sentence measures 585 px in the build's Inter. Column 590 px, head 79 px tall.
   - Build: 119 characters wrap to two 20 px lines (40 px) in a 556.3 px column. Head is 108 px tall.
   - Cause: apps/docs/content/components/pagination.ts:9 (description.en). The column is 556 px because of apps/docs/components/previewer/previewer.tsx:84: the end group is 327.7 px against Figma's 306.
   - Fix: Shorten description.en to at most about 550 px, roughly 80 characters, e.g. 'Page numbers are real links, not click handlers; siblingCount is clamped.' Neither Figma's own sentence (585 px) nor the reviewer's suggestion (581 px) fits 556 px.
2. **[medium] stage, page row**
   - Frame: « ‹ [1] 2 3 … 24 › »: five cells between the arrows, row 328 px wide (x 183 to 511 of the 694 px stage)
   - Build: « ‹ [1] 2 3 4 5 … 24 › »: seven cells between the arrows, row 448 px wide (x 118 to 534)
   - Cause: packages/topclassui/src/components/pagination/lib.ts:37-41. slots = boundary*2 + siblings*2 + 3 = 7, and start is clamped to at least boundary + 2, so page 1 with siblingCount 1 shows pages 1 to 5. lib.ts:24 states the rule 'the row is the same length on every page'.
   - Fix: Either redraw Figma 138:1302 as 1 2 3 4 5 … 24 (the library rule), or let the window shrink at the ends in listPages. The playground comment (dummy/playground.tsx:4-5) claims the frame's row, which it does not produce.
3. **[medium] Try it, size select value**
   - Frame: The size select shows 'sm', matching the stage.
   - Build: The size select shows 'md' while the stage renders size="sm" (nav data-size=sm; dummy/playground.tsx:7), so the control contradicts the stage.
   - Cause: apps/docs/content/components/pagination.ts has no `starts`, so withStarts (apps/docs/scripts/lib/controls.ts:63-71) leaves the schema default md.
   - Fix: Add `starts: { size: 'sm' },` to apps/docs/content/components/pagination.ts, as toast.ts:17 does.
4. **[medium] Try it, select control**
   - Frame: 208x29, bg #262626 with a #262626 (line) border, so no edge shows; pl 10, pr 8; value 11 px mono; caret 13 px
   - Build: 211x32, bg #262626 with a 1 px #a1a1a1 (line-strong) border that shows clearly; px 12; value 14 px mono; caret 14 px
   - Cause: apps/docs/components/previewer/try-it-control.tsx:62-73 (<Select size="sm"> at :64). packages/topclassui/src/shared/classes.ts:265 FIELD_SURFACE uses BORDER_STRONG.
   - Fix: try-it-control.tsx:64 size="xs" (28 px, text-xs) and :66 className="font-mono border-line". This gives up the 3:1 field edge in the docs panel only; say so in DECISIONS.
5. **[medium] code part, Copy button**
   - Frame: 73x29, bg surface #171717, 1 px #262626 border, px 10, gap 6, 14 px icon, 'Copy' 12 px Medium
   - Build: 83.2x32, transparent bg, 1 px #a1a1a1 border (outline variant), px 12, gap 8, 'Copy' 14 px Medium
   - Cause: apps/docs/components/previewer/copy-button.tsx:49-52 (<Button variant="outline" size="sm">)
   - Fix: copy-button.tsx:52 size="xs", and when word is set className="bg-surface border-line px-2.5 gap-1.5". This is the look the site's own CODE_COPY already draws (apps/docs/components/classes.ts:121).
6. **[medium] Every state, cell and pagination size**
   - Frame: Cells 227 wide. Each state is 159x17: 24 px cells, gap 3, 13 px icons, two pages (1, 2). The 4th cell wraps to the start of row 2.
   - Build: Cells 282 wide. Each state is 224x26: 30 px arrows, 24 to 25.8 px pages, gap 4, three pages (1, 2, 3). The 4th cell (disabled) grows to 894 px and its nav is centred (x 354).
   - Cause: packages/topclassui/src/components/pagination/dummy/states.tsx:10-13 (pageCount={3}); apps/docs/components/classes.ts:207 (STATE_CELL grow)
   - Fix: states.tsx:10-13 set pageCount={2}, which makes each row about 194 px. Four cells then fit on one row with or without job 140's gap-x-0. With gap-x-0 alone, 4 x 224 = 896 > 894 and the strip still wraps.
7. **[low] head, mode switch and Install**
   - Frame: Segmented:card is 217x31 with 14 px icons, and all three labels are 12 px Medium (500). Install is 79x29: px 12, 14 px icon, 'Install' 12 px Medium.
   - Build: Segmented is 230x32 with 16 px icons. Light and Ocean are 12 px weight 400; Dark is 500. Install is 87.6x32 with 'Install' at 14 px Medium.
   - Cause: apps/docs/components/previewer/card-mode-switch.tsx:41 (Svg size="1rem"; the item has no className). The 400 weight comes from packages/topclassui/src/components/segmented-control/classes.ts:28 (SEGMENTED_ITEM font-normal). MODE_SEGMENT (apps/docs/components/classes.ts:34) is used only by shell/mode-switch.tsx:27, not by this switch. The Install button is previewer.tsx:95 (<Button size="sm">).
   - Fix: card-mode-switch.tsx:41: <SegmentedControlItem ... className="font-medium" icon={<Svg icon={ICONS[item]} size="0.875rem" />}>. previewer.tsx:95: <Button size="xs" className="px-3">, which gives 28 px tall, a 12 px label and about 79 px wide.
8. **[low] Try it, control list**
   - Frame: Selects siblingCount '1', size 'sm', shape 'rounded'; checkboxes showFirstLast (on), showPrevNext (on), compact (off). Panel 248x311.
   - Build: Selects siblingCount and size; one checkbox, disabled (off). Panel 248x214, stage 682x214.
   - Cause: packages/topclassui/src/components/pagination/schema.ts:9-28 has no shape, showFirstLast, showPrevNext or compact, and disabled comes from :26. Controls come from the schema (docs-site.md S7). docs/DECISIONS.md:216 lists shape/showFirstLast/showPrevNext as 'rows not built', left for Omar.
   - Fix: No site fix. Omar decides whether to add the props (DECISIONS.md:216).
9. **[low] Try it, checkbox rows**
   - Frame: 16 px box, radius 4; 14 px from the bottom of the last select to the first box
   - Build: 20 px visible box in a 24 px hit area; 10 px from the select bottom (y 280) to the box top (y 290)
   - Cause: apps/docs/components/previewer/try-it-control.tsx:35 (<Checkbox size="sm">, toggle-sm 20 px); apps/docs/components/classes.ts:177 (CHECK_ROW -my-1.5)
   - Fix: try-it-control.tsx:35 size="xs" (toggle-xs is 16 px).
10. **[low] code part, header row**
   - Frame: One-line caption 'locale travels with labels: a count label is (n, fmt) and needs an Intl.NumberFormat.' (10 px muted), then Copy
   - Build: 'THE CODE' heading (12 px uppercase muted), then Copy
   - Cause: apps/docs/components/previewer/playground-island.tsx:100 always prints labels.theCode
   - Fix: Optional: add a per-card codeCaption to the content file and print it in place of 'The code' when set. docs-site.md S8 allows 'THE CODE (or a one-line caption)'.
11. **[low] Every state, current page per cell**
   - Frame: 'middle' draws page 1 as current with dead first/prev arrows, the same as 'first page'. 'last page' draws no current page and a live next arrow.
   - Build: middle: page 2 current, all arrows live. last page: page 3 current, next and last dimmed.
   - Cause: Figma 138:1388 and 138:1408 are drawn wrong; the build follows the captions
   - Fix: No code change. Redraw the two Figma cells.

## /en/docs/components/breadcrumb: differs (8)

Note: Checked against frames/previewer-breadcrumb-138-1140.png, design context 138:1172 and 138:1216, and my 2x capture and DOM. Figma's states row has gap '16px 0px' (job 140's gap-x-0). The build shows the four 205.5 px cells on one row. docs-site.md S8 (lines 775-778) deliberately gives a schema-less Breadcrumb no Try it. The difference is real anyway, and the stage height can be fixed without that decision.

1. **[high] stage and Try it**
   - Frame: Stage 694x250 beside a 248 px Try it: separator select 'caret', maxItems select '4', showHome (on), collapse (off), truncate (off)
   - Build: No Try it panel. The stage spans the full 930 px and is 64 px tall: a 24 px trail plus 20 px padding, so stageHeight 3rem does not bind.
   - Cause: packages/topclassui/src/components/breadcrumb/schema.ts:7-10 holds only siteUrl, and there is no dummy/playground.tsx, so previewer.tsx:60 sets playground false (as S8 specifies). apps/docs/content/components/breadcrumb.ts:13 stageHeight: 3. showHome and maxItems are props (types.ts) but not schema fields.
   - Fix: Minimum: set stageHeight: 15.6 (250 px) in content/components/breadcrumb.ts so the stage has Figma's height. Full fix: add showHome (boolean) and maxItems (2..100, clamped with BREADCRUMB_BOUNDARIES) to breadcrumb/schema.ts and add dummy/playground.tsx rendering basic.tsx's trail with {...props}.
2. **[medium] head, description**
   - Frame: One line, 'Real links with aria-current on the last crumb; it also emits BreadcrumbList JSON-LD.' (85 characters, 561 px in the build's Inter). Head 79 px.
   - Build: Two lines (556.3 px column, 40 px tall): 'Where a page sits in the site, as real links with no JavaScript. The same trail is written as BreadcrumbList JSON-LD.' Head 108 px.
   - Cause: apps/docs/content/components/breadcrumb.ts:9
   - Fix: Shorten description.en to at most about 550 px (about 80 characters). Figma's sentence is 561 px, still 5 px too wide for 556 px. It fits once the head's end group shrinks to Figma's 306 px (see the mode-switch entry).
3. **[medium] stage, trail**
   - Frame: [house]Docs › Components › Button: the 14 px house icon sits 8 px before 'Docs' in the same crumb; 3 crumbs, 246 px wide
   - Build: [house] › Docs › Components › Button: Home is an icon-only 24x24 crumb with a separator after it; 4 crumbs, 276.8 px wide
   - Cause: packages/topclassui/src/components/breadcrumb/dummy/basic.tsx:8-10 (showHome plus { href: '/', label: 'Home' }); breadcrumb/index.tsx:50 and :60/:62 draw item 0 as the icon with its label sr-only
   - Fix: Either redraw Figma with a separate Home crumb, or render the house before a visible first label when showHome is set (index.tsx:60/62) and drop the Home item from basic.tsx.
4. **[medium] code part, header row and Copy**
   - Frame: Caption 'Leave href off the last item; the same array emits the BreadcrumbList JSON-LD.' (10 px). Copy is 73x29, bg #171717, #262626 border, 12 px label.
   - Build: 'THE CODE' heading. Copy is 83.2x32, transparent, 1 px #a1a1a1 border, 14 px label.
   - Cause: apps/docs/components/previewer/previewer.tsx:128 (H3 t.theCode); apps/docs/components/previewer/copy-button.tsx:49-52 (outline, sm)
   - Fix: copy-button.tsx:52 size="xs" plus className="bg-surface border-line px-2.5 gap-1.5". The caption is optional (S8 allows either).
5. **[medium] Every state, hover cell**
   - Frame: 'Docs' underlined in body colour, '›', then 'Button' 12 px Regular muted (a plain link)
   - Build: 'Docs' underlined white, '›', then 'Button' 14 px SemiBold white: the current page, because it has no href
   - Cause: packages/topclassui/src/components/breadcrumb/dummy/states.tsx:20 ({ label: 'Button' } with no href)
   - Fix: states.tsx:20 set { href: '/docs/button', label: 'Button' }.
6. **[low] stage, current crumb weight**
   - Frame: 'Button' 14 px Medium (500) on the stage. Figma's own 'current' state cell (138:1251) is SemiBold.
   - Build: 'Button' 14 px SemiBold (600)
   - Cause: packages/topclassui/src/components/breadcrumb/classes.ts:30 (CURRENT font-semibold). The comment at :28-29 gives the reason: a font with only regular and bold faces paints 500 as regular.
   - Fix: Redraw Figma's stage crumb at SemiBold to match its own current cell, rather than change CURRENT.
7. **[low] head, mode switch and Install**
   - Frame: Segmented 217x31 (14 px icons, all labels 12 px Medium); Install 79x29 (12 px label)
   - Build: Segmented 230x32 (16 px icons, Light and Ocean weight 400); Install 87.6x32 (14 px label)
   - Cause: card-mode-switch.tsx:41 (icon 1rem, no className); segmented-control/classes.ts:28 (SEGMENTED_ITEM font-normal); previewer.tsx:95 (size sm)
   - Fix: As for pagination: Svg size="0.875rem" and className="font-medium" on each SegmentedControlItem; Install size="xs" className="px-3".
8. **[low] Every state, crumb size**
   - Frame: Crumbs 12 px, carets 11 px, gap 5; trails 88 to 116 px wide
   - Build: Crumbs 14 px (ROOT text-sm), carets 14 px, gap 8; trails 107 to 152 px wide
   - Cause: packages/topclassui/src/components/breadcrumb/dummy/states.tsx:8-39 render the default text-sm Breadcrumb (classes.ts:6)
   - Fix: Add className="text-xs" to each <Breadcrumb> in states.tsx. The 1em carets follow to 12 px.

## /en/docs/components/tabs: differs (10)

Note: Checked against frames/previewer-tabs-138-809.png, design context 138:842 and 138:941, my 2x capture and DOM. Figma's focus ring is a 2 px border on a rectangle 4 px outside the 87x31 text row: an outer edge 4 px out, the inner edge 2 px out, radius 12. Its bottom edge sits above the 2 px bar, which stays visible. Job 140's gap-x-0 applies to the strip.

1. **[high] Every state, line / focus-visible / disabled cells**
   - Frame: Each full list visible: Overview, Props, A11y, the bar and a 240 px hairline (Figma lets the 240 px list overflow its 227 px cell)
   - Build: The list is cut at the cell edge. Cells are 205.5 px, but the tabs need 221.3 px (80.5 + 54.3 + 44.5 + 2 x 20 + 2), so 'A11y' shows as 'A11' and the list scrolls sideways inside the cell.
   - Cause: packages/topclassui/src/components/tabs/classes.ts:10 (TABS_ROOT 'grid grid-cols-1') gives a min-content of 0. With TABS_LIST (classes.ts:25-28: w-fit max-w-full plus scroll-x), STATE_CELL's min-w max(9rem, min-content) (apps/docs/components/classes.ts:207) lets the cell shrink below the list.
   - Fix: In tabs/dummy/states.tsx add className="w-max" to each TabsRoot so the cell grows to the 221.3 px list. Four cells then fit one row only after job 140's gap-x-0 (4 x 221.3 = 885 ≤ 894); until then the strip wraps 3 + 1 instead of clipping.
2. **[medium] head, description**
   - Frame: One line, 'Panels render on the server and stay in the HTML, so inactive text is still indexed.' (84 characters, 536 px in the build's Inter). Head 79 px.
   - Build: Two lines (556.3 px column, 40 px): 'Views of one thing, shown one at a time. Every panel renders on the server...' Head 108 px.
   - Cause: apps/docs/content/components/tabs.ts:9
   - Fix: Use Figma's sentence as description.en: it measures 536 px and fits.
3. **[medium] stage content**
   - Frame: Two lists 50 px apart, no panel, centred: a line list 240x40 (Overview / Props / A11y, 20 px between tabs, 2 px bar under Overview, 1 px hairline) and an enclosed list 212x37 (bg surface, p 3, gap 3, raised Overview 87x31, radius 8)
   - Build: One md line list, 282x41 (Overview / Activity / Settings), then the panel text 'Revenue is up 12% against last quarter.' (16 px) 16 px below it. No enclosed example.
   - Cause: apps/docs/content/components/tabs.ts has no stageDemo, so the stage renders dummy/playground.tsx (one TabsRoot with three panels)
   - Fix: Add packages/topclassui/src/components/tabs/dummy/variants.tsx rendering a line and an enclosed TabsRoot (Overview / Props / A11y, no panels) in a flex row with gap-12, and set stageDemo: 'variants' in content/components/tabs.ts. Try it still swaps in the playground on the first change (previewer.tsx:61-62).
4. **[medium] Try it, select and checkbox**
   - Frame: Select 208x29 with no visible edge (#262626 on #262626) and an 11 px mono value. Checkbox 16 px.
   - Build: Select 211x32 with a 1 px #a1a1a1 edge and a 14 px mono value. Checkbox 20 px (24 px hit area).
   - Cause: apps/docs/components/previewer/try-it-control.tsx:62-73 (Select size sm; FIELD_SURFACE BORDER_STRONG, shared/classes.ts:265) and :35 (Checkbox size sm)
   - Fix: try-it-control.tsx:64 size="xs", :66 className="font-mono border-line"; :35 size="xs".
5. **[medium] code part, Copy button and note**
   - Frame: Copy 73x29 (bg #171717, #262626 border, 12 px). Note is one 10.5 px muted line, 13 px tall, with no inline code.
   - Build: Copy 83.2x32 (transparent, #a1a1a1 border, 14 px). In the note, `keepMounted` is 14 px mono in body white inside 12 px muted text, so the line grows to 20 px.
   - Cause: apps/docs/components/previewer/copy-button.tsx:49-52; apps/docs/components/inline-text.tsx:6 applies INLINE_CODE (apps/docs/components/classes.ts:81 'font-mono text-sm text-body') inside NOTE (previewer.tsx:70-72)
   - Fix: Copy: size="xs" plus className="bg-surface border-line px-2.5 gap-1.5". Note: on the span at previewer.tsx:72 add '**:text-[length:inherit] **:text-muted' (the AUTHORED_CELL pattern, classes.ts:100).
6. **[medium] Every state, focus-visible**
   - Frame: 2 px ring, radius 12, inner edge 2 px outside the 87x31 text row (rectangle 95x39 at -4,-4). The blue bar still shows under the ring.
   - Build: 2 px ring inset (outline-offset -2 px) on the square 80.5x32 tab (radius 0). It lies over the 2 px border-bottom bar, so the bar does not show.
   - Cause: packages/topclassui/src/components/tabs/dummy/states.tsx:5 (RING with -outline-offset) mirrors the live FOCUS_RING_INSET (tabs/classes.ts:45). It is inset on purpose because the list clips (classes.ts:38-40); the bar is the tab's own border-b-2 (classes.ts:54).
   - Fix: An outside ring cannot be drawn without padding the clipping list, which would move the hairline off the bar. Either redraw Figma with the live inset ring, or in the library draw the line tab's inset ring above its bar (e.g. outline offset of -(ring width + 2px) plus rounded-control on the line tab) and mirror it in states.tsx:5.
7. **[low] Try it, control list**
   - Frame: Selects variant 'line', size 'md', orientation 'horizontal'; checkboxes keepMounted (on), fullWidth (off), disabled (off). Panel 311 px tall.
   - Build: Selects variant 'line' and size 'md'; checkbox keepMounted (on). Panel 214 px tall.
   - Cause: packages/topclassui/src/components/tabs/schema.ts:8-15 has only variant, size and keepMounted. Controls come from the schema (docs-site.md S7: 'The Try it lists above are not built as drawn').
   - Fix: None unless orientation, fullWidth or disabled join the schema.
8. **[low] head, mode switch and Install**
   - Frame: Segmented 217x31 (14 px icons, labels 12 px Medium); Install 79x29 with a 12 px label
   - Build: Segmented 230x32 (16 px icons, unselected labels weight 400); Install 87.6x32 with a 14 px label
   - Cause: card-mode-switch.tsx:41; segmented-control/classes.ts:28 (font-normal); previewer.tsx:95
   - Fix: Svg size="0.875rem" and className="font-medium" on each item; Install size="xs" className="px-3".
9. **[low] Every state, disabled**
   - Frame: The whole list at 50%: labels, the #155dfc bar and the hairline are all dimmed
   - Build: Only the labels are dimmed (span opacity 0.5). The bar under Overview stays full-strength #155dfc and the hairline is undimmed.
   - Cause: packages/topclassui/src/components/tabs/classes.ts:33-36 (data-disabled:*:opacity-50 dims children only, so the ring keeps contrast)
   - Fix: Add 'data-disabled:data-active:border-primary-soft' to TABS_BAR (classes.ts:54) so the bar reads as disabled while the ring keeps full contrast.
10. **[low] Every state, tab size**
   - Frame: md tabs: 87x39 (px 11, 14 px label, 31 px text row, then a 2 px bar 6 px lower). Enclosed list 212x37 (p 3, gap 3, tab 87x31).
   - Build: sm tabs: 80.5x32 (px 8), bar on the bottom edge of the 32 px box. Enclosed list 187.3x32 (p 2, gap 2, tab 80.5x28).
   - Cause: packages/topclassui/src/components/tabs/dummy/states.tsx:12,19,26,33 (size="sm")
   - Fix: Use md once the cells can grow (w-max, see the clipping entry), or keep sm if width is the constraint.

## /en/docs/components/accordion: differs (10)

Note: Checked against frames/previewer-accordion-138-994.png, the 138:994 metadata, pixel sampling of the frame, and my 2x capture and DOM; the island had mounted, so real checkboxes show. The reviewer's hover numbers were wrong and are corrected below. In the exported frame the focus-visible ring (138:1114) is clipped and invisible; its intended geometry comes from the design context. Job 140's gap-x-0 applies to the strip.

1. **[medium] head, description**
   - Frame: One line, 'Closed panels stay in the DOM with hiddenUntilFound, so Ctrl+F and crawlers find them.' (86 characters, 584 px in the build's Inter). Head 79 px.
   - Build: Two lines (556.3 px, 40 px): 'Sections a reader opens one at a time. Closed panels stay in the HTML...' Head 108 px.
   - Cause: apps/docs/content/components/accordion.ts:9
   - Fix: Shorten description.en to at most about 550 px (about 80 characters). Figma's own sentence is 584 px and does not fit 556 px.
2. **[medium] code part, Copy button**
   - Frame: 73x29, bg #171717, #262626 border, 12 px label
   - Build: 83.2x32, transparent, 1 px #a1a1a1 border, 14 px label
   - Cause: apps/docs/components/previewer/copy-button.tsx:49-52
   - Fix: size="xs" plus className="bg-surface border-line px-2.5 gap-1.5".
3. **[medium] Every state, trigger boxes**
   - Frame: Boxes 132x33: px 9, py 8, 'Question' 12 px Medium, 13 px caret
   - Build: Boxes 114.1x46: px 14, py 12, 'Question' 14 px Medium, 14 px caret
   - Cause: packages/topclassui/src/components/accordion/dummy/states.tsx renders the accordion's only scale: ACCORDION_TRIGGER 'px-3.5 py-3 text-sm' (classes.ts:22)
   - Fix: Accordion has no size prop. Add one (R-5.7-2) and render the states at size="xs", or redraw Figma at the component's real 46 px trigger.
4. **[low] stage, accordion box**
   - Frame: 400x175, 37.5 px from the top of a 250 px stage. Triggers 41 px tall (py 12 + 17 px line). Answer region 48 px (no top padding, pb 14).
   - Build: 420x194, 20 px from the top of a 234 px stage. Triggers 44 px tall (py 12 + 20 px line). Answer region 58 px (pt 4, pb 14).
   - Cause: packages/topclassui/src/components/accordion/dummy/playground.tsx:8 (className="max-w-105" = 420 px); accordion/classes.ts:49 (ACCORDION_CONTENT pt-1, kept for the ring of a first-line control)
   - Fix: playground.tsx:8 className="max-w-100" (400 px). The 3 px per row is the 20 px line of the type scale.
5. **[low] Try it, control list**
   - Frame: Selects type 'single' and variant 'outline'; checkboxes collapsible (on), hiddenUntilFound (on), disabled (off). Panel 250 px tall.
   - Build: Checkboxes hiddenUntilFound (on) and disabled (off) only. Panel 234 px tall.
   - Cause: packages/topclassui/src/components/accordion/schema.ts:10-15 has only hiddenUntilFound and headingLevel (hidden); disabled comes from extraSwitches (content/components/accordion.ts:16). docs-site.md S7: controls come from the schema.
   - Fix: None unless type, variant or collapsible become schema props.
6. **[low] Try it, checkbox**
   - Frame: 16 px box, radius 4, 25 px pitch
   - Build: 20 px box in a 24 px hit area, 26 px pitch
   - Cause: apps/docs/components/previewer/try-it-control.tsx:35 (Checkbox size sm)
   - Fix: try-it-control.tsx:35 size="xs".
7. **[low] head, mode switch and Install**
   - Frame: Segmented 217x31 (14 px icons, labels 12 px Medium); Install 79x29 with a 12 px label
   - Build: Segmented 230x32 (16 px icons, unselected labels weight 400); Install 87.6x32 with a 14 px label
   - Cause: card-mode-switch.tsx:41; segmented-control/classes.ts:28 (font-normal); previewer.tsx:95
   - Fix: Svg size="0.875rem" and className="font-medium" on each item; Install size="xs" className="px-3".
8. **[low] Every state, open**
   - Frame: Box 132x64: 'Question' and an up caret, then 'answer' in 9 px mono (p 9). Its caption is on the same line as the others (y 67).
   - Build: Box 151.8x84: 'Open question' and an up caret, then 'Answer.' in 14 px muted. Its caption 'open' sits at y 859, 28 px below the other four (y 831).
   - Cause: accordion/dummy/states.tsx:22-23 (title 'Open question', 14 px answer); apps/docs/components/classes.ts:206-209 (STATE_GRID items-start; STATE_BOX min-h-14 grows)
   - Fix: states.tsx:22 title="Question" and the answer in <p className="text-xs">. Even then the box is about 80 px tall, so captions only align if STATE_BOX (classes.ts:209) becomes a fixed h-14 with overflow-visible. STATE_BOX is shared by every card's strip.
9. **[low] Every state, hover**
   - Frame: Box fill #171717 (the card surface) with a faint #1f1f1f edge, darker than the #262626 closed box
   - Build: Box fill #202020 (tone-neutral bg-(--tc-soft)) with a #262626 edge: slightly darker than the closed box, and lighter than Figma's hover
   - Cause: packages/topclassui/src/components/accordion/dummy/states.tsx:28 (className="tone-neutral bg-(--tc-soft)" on the root)
   - Fix: Draw hover as Figma does, with bg-surface on that root (states.tsx:28), or redraw Figma with the live soft tint.
10. **[low] Every state, focus-visible and disabled**
   - Frame: Ring (design context): 2 px, inner edge 2 px outside the 132x33 box, radius 16. The exported frame shows no ring, because the panel clips it. Disabled dims the whole box: fill #1e1e1e, text dimmed.
   - Build: Ring 2 px inset (outline-offset -2 px) inside the 114x46 box, radius 12. Disabled dims only the trigger (opacity 0.5); the #262626 fill stays full strength.
   - Cause: accordion/dummy/states.tsx:5 (RING with -outline-offset, mirroring FOCUS_RING_INSET); the disabled AccordionRoot (states.tsx:42) dims only the button
   - Fix: states.tsx:5 outline-offset-(length:--tc-ring-offset) on the root (the strip does not clip it). For disabled add opacity-50 on that root, or redraw Figma.

## /en/docs/components/stepper: differs (7)

Note: Checked against frames/previewer-stepper-137-2477.png, design context 137:2510, my 2x capture and DOM, and a live probe of both centring fixes. The connectors' colours, label weights and colours match Figma. The reviewer's w-fit fix is wrong: it collapses the list to 149 px with marks 37 px apart.

1. **[high] stage, horizontal position**
   - Frame: Stepper 315 px wide, centred in the 694 px stage (x 189.5 to 504.5, centre 347)
   - Build: The list is 642 px wide (w-full) and its four 88 px steps sit at the start: x 21 to 373, mark centres 65/153/241/329, against a stage centre of 342. The stepper is 145 px left of centre.
   - Cause: packages/topclassui/src/components/stepper/classes.ts:5 (STEPPER_ROOT 'flex w-full ...' with no justify) and :10 (each step at most 2.75 marks = 88 px)
   - Fix: packages/topclassui/src/components/stepper/dummy/playground.tsx:12: pass className="justify-center" to <Stepper>. Measured, this puts the marks at 210/298/386/474, centred on 342. Do not use w-fit: measured, it shrinks the list to 149 px with marks 37 px apart.
2. **[medium] head, description**
   - Frame: One line, 'A done step carries a tick, not just a color, so it survives a greyscale screenshot.' (84 characters, 531 px in the build's Inter). Head 79 px.
   - Build: Two lines (556.3 px, 40 px): 'Where a reader is in a task of a few steps. A done step carries a tick...' Head 108 px.
   - Cause: apps/docs/content/components/stepper.ts:6
   - Fix: Use Figma's sentence (spelled 'colour', as the site writes it). It measures 531 px and fits.
3. **[medium] Try it, select**
   - Frame: 208x29, no visible edge, 11 px mono value
   - Build: 211x32, 1 px #a1a1a1 edge, 14 px mono value
   - Cause: apps/docs/components/previewer/try-it-control.tsx:62-73 (size sm at :64; FIELD_SURFACE BORDER_STRONG)
   - Fix: try-it-control.tsx:64 size="xs", :66 className="font-mono border-line".
4. **[medium] code part, Copy button and note**
   - Frame: Copy 73x29 (bg #171717, #262626 border, 12 px). Note is one 10.5 px muted line with no inline code.
   - Build: Copy 83.2x32 (transparent, #a1a1a1 border, 14 px). In the note, `value` is 14 px mono in white inside 12 px muted text, so the line is 20 px tall.
   - Cause: copy-button.tsx:49-52; inline-text.tsx:6 with INLINE_CODE (apps/docs/components/classes.ts:81) inside NOTE
   - Fix: Copy size="xs" plus className="bg-surface border-line px-2.5 gap-1.5". On the note span (previewer.tsx:72) add '**:text-[length:inherit] **:text-muted'.
5. **[low] Try it, control list and stage height**
   - Frame: Selects orientation 'horizontal', size 'md', activeStep '2'; checkboxes clickable (off), showConnector (on), compact (off). Row 311 px tall, stepper 129 px from its top.
   - Build: Select size 'md' only. Row 160 px tall, stepper 52 px from its top.
   - Cause: packages/topclassui/src/components/stepper/schema.ts:8-11 has only size. Controls come from the schema (docs-site.md S7).
   - Fix: None unless the props are added. Optionally raise stageHeight (content/components/stepper.ts:10) to 19.4 so the row keeps Figma's 311 px.
6. **[low] head, mode switch and Install**
   - Frame: Segmented 217x31 (14 px icons, labels 12 px Medium); Install 79x29 with a 12 px label
   - Build: Segmented 230x32 (16 px icons, unselected labels weight 400); Install 87.6x32 with a 14 px label
   - Cause: card-mode-switch.tsx:41; segmented-control/classes.ts:28 (font-normal); previewer.tsx:95
   - Fix: Svg size="0.875rem" and className="font-medium" on each item; Install size="xs" className="px-3".
7. **[low] Every state, digits**
   - Frame: todo, current and disabled marks show '2'
   - Build: todo, current and disabled marks show '1'
   - Cause: packages/topclassui/src/components/stepper/dummy/states.tsx:10-14 render one-step lists, which number from 1
   - Fix: Optional. Accept it, or redraw Figma with '1'.

## /en/docs/components/navbar: differs (10)

Note: Checked against frames/previewer-navbar-138-2393.png, design context 138:2425 and 138:2475, my 2x capture and DOM, and a scroll probe. At scrollY 0 the 'top' bar has no data-scrolled. Once the reader scrolls (scrollY 900) the sticky 'top' bar gains data-scrolled and shadow-md, so it looks like 'scrolled'. docs/DECISIONS.md:216 records the navbar's rounded corners, its mobile menu and open-menu state, and its text-base/text-sm type as 'rows not built', left for Omar. They stay listed because the frame differs, but the demo-only fixes below do not touch the library. Figma's bell and 'OA' avatar spill outside its 460 px bar, a Figma slip.

1. **[medium] head, description**
   - Frame: One line, 'Sticky header with server-rendered links that publishes its own height as --tc-sticky-top.' (90 characters, 586 px in the build's Inter). Head 79 px.
   - Build: Two lines (556.3 px, 40 px): 'A sticky header whose links are server HTML. One small client part publishes its height as --tc-sticky-top.' Head 108 px.
   - Cause: apps/docs/content/components/navbar.ts:9
   - Fix: Shorten description.en to at most about 550 px (about 80 characters). Figma's sentence is 586 px and does not fit.
2. **[medium] stage, bar shape**
   - Frame: Bar 460x52, radius 12, surface-raised #262626, border-b line, px 16, gap 16, centred (x 117 to 577 of 694)
   - Build: Bar 642x52 filling the stage (x 21 to 663), radius 0, padding 6/16/4
   - Cause: packages/topclassui/src/components/navbar/classes.ts:8-12 (NAVBAR_ROOT w-full, no radius; DECISIONS.md:216 keeps the library bar square); dummy/playground.tsx:11 passes no className
   - Fix: In navbar/dummy/playground.tsx:11 merge className="max-w-115 rounded-box" into NavbarRoot ({...props} first, cn puts the caller's classes last). This is demo-only; the library stays square.
3. **[medium] stage, bar content**
   - Frame: Brand tile h 22 (radius 4, 13 px palette) plus 'TopClass' 14 px SemiBold. Links 12 px, gap 14: 'Docs' SemiBold in body colour (current), the others Regular muted. End: 14 px bell icon and a 26 px tall 'OA' avatar (neutral soft). No button.
   - Build: Brand tile 24x24 (p 4, 16 px palette) plus 'TopClass UI' 16 px SemiBold. Links 14 px, gap 16, all Regular muted (none current). End: a solid primary 'Sign in' button 79.4x40.
   - Cause: packages/topclassui/src/components/navbar/dummy/playground.tsx:13-22 (brand 'TopClass UI', Button 'Sign in' at :22); apps/docs/content/components/navbar.ts has no starts, so current is false. The 16/14 px type is listed in DECISIONS.md:216.
   - Fix: Add `starts: { current: true }` to apps/docs/content/components/navbar.ts so Docs renders current. In playground.tsx replace the Sign in Button with an icon button (bell) and an Avatar 'OA' in NavbarActions, or redraw Figma with Sign in.
4. **[medium] Try it, select and checkbox**
   - Frame: Select 208x29 with no visible edge and an 11 px mono value. Checkbox 16 px.
   - Build: Select 211x32 with a 1 px #a1a1a1 edge and a 14 px mono value. Checkbox 20 px.
   - Cause: apps/docs/components/previewer/try-it-control.tsx:35 and :62-73
   - Fix: Select size="xs" className="font-mono border-line"; Checkbox size="xs".
5. **[medium] code part, Copy button**
   - Frame: 73x29, bg #171717, #262626 border, 12 px label
   - Build: 83.2x32, transparent, #a1a1a1 border, 14 px label
   - Cause: apps/docs/components/previewer/copy-button.tsx:49-52
   - Fix: size="xs" plus className="bg-surface border-line px-2.5 gap-1.5".
6. **[medium] Every state, cells and count**
   - Frame: 6 states in 151 px cells: top, scrolled, mobile (list icon, tile, name), open menu, focus-visible, transparent. Header reads '6 states'.
   - Build: 4 states in 205.5 px cells: top, scrolled, focus-visible, transparent. 'mobile' and 'open menu' are missing. Header reads '4 states'.
   - Cause: packages/topclassui/src/components/navbar/dummy/states.tsx:12-14 ('Mobile and the open menu are recorded as not built'); docs/DECISIONS.md:216 (the mobile menu toggle is not built in the library)
   - Fix: Omar decides (DECISIONS.md:216). Until the menu exists, the strip can only show static look-alike cells (aria-label 'mobile' and 'open menu', sticky={false}, a list icon before the brand).
7. **[medium] Every state, bar size**
   - Frame: Bars 132x32: 1 px line border all round, radius 4, px 8, gap 6. A plain 14 px blue tile (radius 3, no icon) and 'TopClass' in 8 px mono. 'scrolled' adds a drop shadow (0 2 3, 40% black).
   - Build: Bars 135.8x52: no side borders, radius 0. A 24 px tile with a 16 px palette icon and 'TopClass' 16 px SemiBold. 'top' is sticky (states.tsx:18), so once the reader scrolls (verified at scrollY 900) it takes data-scrolled and shadow-md and matches 'scrolled'.
   - Cause: packages/topclassui/src/components/navbar/dummy/states.tsx:10 (Logo) and :18-29 (full-size NavbarRoot with min-h-13; the first bar keeps sticky)
   - Fix: In states.tsx give each NavbarRoot className="w-auto min-h-8 rounded-chip border-(length:--tc-line-width) border-line" and a smaller Logo (text-xs, a size-3.5 tile). Pass sticky={false} on 'top' too.
8. **[medium] Every state, focus-visible**
   - Frame: Ring around the whole bar: 140x40, 2 px border, radius 8, 3 px outside the 132x32 bar
   - Build: Ring around the brand link only: 2 px at a 2 px offset around the 103.8x24 link, inside the 135.8x52 bar
   - Cause: packages/topclassui/src/components/navbar/dummy/states.tsx:25 (RING on NavbarBrand)
   - Fix: Redraw Figma with the ring on the brand link, which is the focusable element (preferred), or move RING plus rounded-control to that cell's NavbarRoot (states.tsx:24).
9. **[low] Try it, control list**
   - Frame: Selects variant 'sticky' and size 'md'; checkboxes sticky (on), bordered (on), collapsible (off). Row 250 px tall.
   - Build: Select variant 'solid'; checkboxes sticky (on) and current (off). Row 172 px tall.
   - Cause: packages/topclassui/src/components/navbar/schema.ts:7-14 (sticky, variant solid|transparent, current). Controls come from the schema (docs-site.md S7).
   - Fix: None unless size, bordered or collapsible become props.
10. **[low] head, mode switch and Install**
   - Frame: Segmented 217x31 (14 px icons, labels 12 px Medium); Install 79x29 with a 12 px label
   - Build: Segmented 230x32 (16 px icons, unselected labels weight 400); Install 87.6x32 with a 14 px label
   - Cause: card-mode-switch.tsx:41; segmented-control/classes.ts:28 (font-normal); previewer.tsx:95
   - Fix: Svg size="0.875rem" and className="font-medium" on each item; Install size="xs" className="px-3".

## /en/docs/components/sidebar: differs (8)

Note: Checked against frames/previewer-sidebar-138-2539.png, design context 138:2572 and 138:2706, my 2x capture and DOM. Figma's five state rails sit at y -56.5 and overlap the code part, a Figma slip. docs/DECISIONS.md:216 keeps the library rail square with one inline-end line, and says 'a rail drawn as a card is the caller's className (rounded-box border-(length:--tc-line-width))'. So the stage and states fixes below are demo-only. One claim is refuted: the description line heights, which come from the type scale.

1. **[high] stage, rail**
   - Frame: 190x171 card: 1 px #262626 border all round, radius 12, bg page, p 8, gap 2. Centred in the 694x311 stage, 70 px from the top.
   - Build: 220x360 rail filling the 400 px stage (stageHeight 25rem): border only at the inline end (a 360 px vertical line), radius 0. The links end at y 306, leaving about 180 px of empty rail below.
   - Cause: apps/docs/content/components/sidebar.ts:13 (stageHeight: 25); packages/topclassui/src/components/sidebar/classes.ts:15-17 (SIDEBAR_ROOT h-full plus border-e) and :6 (data-open:w-55)
   - Fix: Set stageHeight: 19.4 (311 px). In sidebar/dummy/playground.tsx:13 pass className="h-auto rounded-box border-(length:--tc-line-width) data-open:w-47.5" to SidebarRoot, the caller's className that DECISIONS.md:216 names.
2. **[high] Every state, captions and cells**
   - Frame: Five 181 px cells, each rail centred, captioned expanded / collapsed / active item / hover / focus-visible
   - Build: No captions at all. The five rails sit in a plain flex row (gap 24, starting at x 19), not in the strip's centred cells. The header still says '5 states' (counted from the source).
   - Cause: packages/topclassui/src/components/sidebar/dummy/states.tsx:13 and :35-39: the cells are <Rail label=...>, so nameOf (apps/docs/components/previewer/state-strip.tsx:21-27) finds no aria-label or title, and StateStrip renders the tree raw (state-strip.tsx:58). The rendered navs do carry aria-label, but the strip reads the React props.
   - Fix: In states.tsx rename Rail's prop to 'aria-label' (<Rail aria-label="expanded" />, forwarded to SidebarRoot), so nameOf names each child and the strip builds captioned cells.
3. **[medium] code part, Copy button and note**
   - Frame: Copy 73x29 (bg #171717, #262626 border, 12 px). Note is one 10.5 px muted line.
   - Build: Copy 83.2x32 (transparent, #a1a1a1 border, 14 px). In the note, `defaultOpen={false}` is 14 px mono in white inside 12 px muted text (a 20 px line).
   - Cause: copy-button.tsx:49-52; inline-text.tsx:6 with INLINE_CODE (apps/docs/components/classes.ts:81)
   - Fix: Copy size="xs" plus className="bg-surface border-line px-2.5 gap-1.5". On the note span (previewer.tsx:72) add '**:text-[length:inherit] **:text-muted'.
4. **[low] stage, header and current link**
   - Frame: Header: a static 16 px sidebar-simple icon plus 'Workspace' 14 px SemiBold; row 21 px tall (pl 6, pb 4). Home: Medium (500) in primary-on-soft on primary-soft.
   - Build: Header: a 24x24 collapse button plus 'Workspace'; row 30 px tall (pb 6). Home: SemiBold (600).
   - Cause: The header's toggle keeps the 24 px target floor (R-5.6-2). packages/topclassui/src/components/sidebar/classes.ts:82 (SIDEBAR_LINK_STATE.current font-semibold).
   - Fix: Keep the 24 px toggle. For the current link, set classes.ts:82 to font-medium, or redraw Figma at SemiBold.
5. **[low] Try it, control list**
   - Frame: Selects variant 'inline', width '220', defaultOpen 'true'; checkboxes collapsible (on), bordered (on), overlayOnMobile (on). Row 311 px tall.
   - Build: Checkboxes defaultOpen (on) and current (on). Row 400 px tall.
   - Cause: packages/topclassui/src/components/sidebar/schema.ts:7-14 (defaultOpen, open hidden, current); a boolean is a checkbox (S7)
   - Fix: None unless variant, width or bordered become props.
6. **[low] Try it, checkbox**
   - Frame: 16 px box, 25 px pitch
   - Build: 20 px box in a 24 px hit area, 26 px pitch
   - Cause: apps/docs/components/previewer/try-it-control.tsx:35
   - Fix: Checkbox size="xs".
7. **[low] head, mode switch and Install**
   - Frame: Segmented 217x31 (14 px icons, labels 12 px Medium); Install 79x29 with a 12 px label
   - Build: Segmented 230x32 (16 px icons, unselected labels weight 400); Install 87.6x32 with a 14 px label
   - Cause: card-mode-switch.tsx:41; segmented-control/classes.ts:28 (font-normal); previewer.tsx:95
   - Fix: Svg size="0.875rem" and className="font-medium" on each item; Install size="xs" className="px-3".
8. **[low] Every state, rails**
   - Frame: Rails 190x171 (collapsed 52x158), 1 px border all round, radius 12. Hover row (Projects) bg surface #171717.
   - Build: Rails 160x184 (collapsed 52x184), border only at the inline end, radius 0. Hover row bg #202020 (bg-(--tc-soft)).
   - Cause: sidebar/dummy/states.tsx:16 (className data-open:w-40), SIDEBAR_ROOT border-e (classes.ts:17); states.tsx:21 hover uses bg-(--tc-soft)
   - Fix: states.tsx:16 add 'rounded-box border-(length:--tc-line-width)' to SidebarRoot's className. Optionally states.tsx:21 bg-surface for the drawn hover.

## Refuted by the second reviewer (do not act)

- /en/docs/components/pagination, stage, cell box: Recorded in docs/DECISIONS.md (the 2026-10-19 Pagination bullet: 'sm is 32 x 24 where the frame draws 32 x 18, which R-5.6-2 does not allow'). The gap of 6 against 5 px is within 1 px, and dead arrows at opacity 0.5 against 0.4 barely show.
- /en/docs/components/stepper, stage, step marks: Marks of 32 against 30 px and a check of 17.6 against 16 px are within 2 px, and 32 px is the md control step.
- /en/docs/components/sidebar, head, description: Both sides show two lines. The 28 against 23 px title line and 20 against 17 px description lines are the line heights of the type-scale steps the title and text snap to (recorded decision 6), not a layout difference.
