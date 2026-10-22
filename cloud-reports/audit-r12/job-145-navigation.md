# Figma audit 2, job 145 navigation

Second audit on preview/r8-all 694273fe at 1440 dark: every first-audit row re-checked (still open) plus a fresh pass (new), each re-checked by a second reviewer. Close every row or record why it stays.

## /en/docs/components/pagination: differs (4)

Note: Verifier: re-read get_metadata 138:1269 and get_design_context 138:1300 (stage + Try it) and 138:1362 (states). I took my own 1x capture and DOM dump (r12-review/job-145-navigation-skeptic/me-pagination.png, dom-pagination.json) and made side-by-sides pag-top, pag-states, pag-code and pag-install.png. All four rows hold. Row 3's fix was wrong: pageCount={2} makes 'middle' page 2 of 2, which is the last page, so 'middle' and 'last page' would draw the same row. I rewrote that fix. The page cells' 24 px height against Figma's 17-19 px, and their 8 px radius, are recorded at DECISIONS.md:217. Dead cells are opacity 0.5 against Figma's 0.4; that is the shared DISABLED token and too faint a change to list.

1. **[medium] stage, page row**
   - Frame: « ‹ [1] 2 3 … 24 › »: five cells between the arrows. The row is 328x19 (32 px cells, gap 5), centred at x 183-511 of the 694 px stage
   - Build: « ‹ [1] 2 3 4 5 … 24 › »: seven cells between the arrows. The nav is 448x25 (32x24 cells, gap 6) at x 117-565 of the 682 px stage
   - Cause: packages/topclassui/src/components/pagination/lib.ts:37-41. slots = boundary*2 + siblings*2 + 3 = 7, and start is clamped to at least boundary + 2 = 3, so page 1 with siblingCount 1 lists 1, 2, 3-5, gap, 24 (the 'same length on every page' rule at lib.ts:23-24, :39). The stage is dummy/playground.tsx:9 (value 1 of 24). No DECISIONS entry records the row length.
   - Fix: Either let listPages shrink the window at the ends, so page 1 shows 1 2 3 … 24, or keep the fixed-length rule, redraw Figma 138:1302 as 1 2 3 4 5 … 24 and record the rule in docs/DECISIONS.md.
2. **[medium] stage and Try it row, height**
   - Frame: Stage 694x311 (py 34). The pagination sits 146 px from the stage top
   - Build: Stage 682x180, which is Try it's height (two selects). The nav sits 77.5 px from the top. The 96 px min-height from stageHeight 6 never applies
   - Cause: apps/docs/content/components/pagination.ts:13 stageHeight: 6 (6rem = 96 px). The row takes the taller Try it column.
   - Fix: stageHeight: 19.4 (310.4 px), as stepper.ts:10 and sidebar.ts:13 already do.
3. **[low] Every state, cell and pagination size**
   - Frame: Four 227 px cells that wrap 3 + 1. 'disabled' starts row 2 under the first column (its nav at x 34-193). Each pagination is 159x17: 24 px wide cells (13-17 px tall), gap 3, 13 px icons, two pages
   - Build: Three 298 px cells on row 1. The 4th cell ('disabled') grows to the full 894 px and centres its nav at x 335-559 of the strip. Each nav is 224x26: 30x24 arrow cells, 24-25.8x24 page cells, gap 4, 12 px icons, three pages (1 2 3)
   - Cause: packages/topclassui/src/components/pagination/dummy/states.tsx:12-15 (size xs, pageCount={3}). pagination/classes.ts CELL_SIZE.xs 'px-pad-x-xs text-xs' pads an arrow cell to 30 px where Figma draws 24. STATE_CELL grow (apps/docs/components/classes.ts:222) stretches the lone 4th cell across the row.
   - Fix: Keep three pages: pageCount={2} would turn 'middle' (value 2) into the last page. Narrow the xs cells to the drawn 24 px instead, with CELL_SIZE.xs = 'min-w-control-xs px-1 text-xs' in pagination/classes.ts. Every cell is then 24 px and each nav about 192-196 px, so all four fit one row of 223.5 px cells and no cell sits alone and centred. If 30 px arrows stay, a lone last cell needs start alignment, which is a STATE_CELL change shared by every strip.
4. **[low] Every state, current page per cell**
   - Frame: 'middle' draws page 1 as current with dead « ‹, the same as 'first page'. 'last page' draws no current page, with live « ‹ › and a dead »
   - Build: 'middle': page 2 current, all four arrows live. 'last page': page 3 current, › and » dead (spans at opacity 0.5)
   - Cause: Figma 138:1388 and 138:1408 are drawn wrong (copies of the first cell). The build follows the captions (states.tsx:13-14).
   - Fix: No code change. Redraw the two Figma cells (middle: 2 current, all arrows live; last page: last page current, › » dead).

## /en/docs/components/breadcrumb: differs (4)

Note: Verifier: re-read get_design_context 138:1140 and get_metadata 138:1216. I took my own capture with the sticky header made static (me-breadcrumb.png, dom-breadcrumb.json) and made crops bc-stage-z.png (2x) and bc-states.png. Rows 1 and 3 hold. I corrected row 3's Figma trail widths: idle is 88 px (138:1219), not 84, and collapsed is 116. I refuted row 2: DECISIONS.md:776 records that the current crumb is font-semibold. I added two rows: the extra caret after the house on the stage, and Figma's 9 px mono 'Docs' in the collapsed cell. One row of four state cells is the intended strip, so it is not reported.

1. **[medium] Every state, hover cell**
   - Frame: 'Docs' underlined in the body colour, an 11 px caret, then 'Button' 12 px Regular muted (a plain link)
   - Build: 'Docs' underlined #fafafa, a 12 px caret, then 'Button' 12 px SemiBold #fafafa: the current page, because it has no href
   - Cause: packages/topclassui/src/components/breadcrumb/dummy/states.tsx:19-23. link={<a data-hover />} would hover every linked crumb, so 'Button' is left without an href and renders CURRENT (breadcrumb/classes.ts:30).
   - Fix: Redraw Figma 138:1231 as the current crumb (12 px SemiBold body). Otherwise the library needs a per-item hover (for example, items accepting attributes for their link); states.tsx:22 then becomes { href: '/docs/button', label: 'Button' } with the hover on Docs only.
2. **[low] Every state, crumb gaps**
   - Frame: 5 px between crumb, caret and crumb, with 11 px carets. The idle trail is 88 px (138:1219) and the collapsed one 116 px (138:1235)
   - Build: 8 px gaps (the ol and each li use gap-2) and 12 px carets. The idle trail is 94 px and the collapsed one 135.2 px
   - Cause: packages/topclassui/src/components/breadcrumb/classes.ts:9 (LIST gap-2) and :13 (ITEM gap-2). states.tsx:9, :17, :26 and :37 only add text-xs.
   - Fix: In states.tsx give each Breadcrumb className="text-xs *:gap-1.25 *:*:gap-1.25", which gives 5 px on the ol and on each li. The stage keeps its 8 px, which matches Figma's stage.
3. **[low] (added by verifier) stage, after the house**
   - Frame: House icon (14 px), 8 px, 'Docs', caret, 'Components', caret, 'Button': no caret between the house and Docs (138:1173 row: house, Docs, caret, Components, caret, Button)
   - Build: House (14 px icon in a 24x24 link), 8 px, a 14 px caret, 8 px, 'Docs' …: a caret sits after the house. The house-to-Docs distance is 35 px against Figma's 8
   - Cause: packages/topclassui/src/components/breadcrumb/index.tsx:57 renders a caret before every crumb but the first, so the crumb after the showHome house gets one. DECISIONS.md:221 records the house as the first crumb, not a separator after it.
   - Fix: Skip the separator after a showHome crumb: index.tsx:57 {index === 0 || (showHome && index === 1) ? null : <Svg icon={caretRight} />}. Or redraw Figma 138:1173 with a caret after the house and add that to the showHome bullet in DECISIONS.
4. **[low] (added by verifier) Every state, collapsed cell, first crumb**
   - Frame: 'Docs' drawn in 9 px Roboto Mono muted (138:1236, 22x12), unlike every other crumb
   - Build: 'Docs' 12 px Inter Regular muted (29x16), like the other cells
   - Cause: A Figma slip in 138:1236. The build renders every crumb in the trail's own type (states.tsx:26 text-xs).
   - Fix: No code change. Redraw Figma 138:1236 at 12 px Inter Regular muted.

## /en/docs/components/tabs: differs (5)

Note: Verifier: re-read get_metadata 138:809 and get_design_context 138:903 (states). I took my own capture and DOM (me-tabs.png, dom-tabs.json), a 2x shot (x2/me-tabs@2x.png), and crops tabs-top, tabs-states, tabs-fv-dis-2x, tabs-fv-fig-2x and tabs-dis-fig-2x.png. All five rows hold. Corrections to the run-together row: the text gap between 'A11y' and the next 'Overview' is 20.2 px, not about 12 (A11y ends at x 679.4, Overview starts at 699.6). Figma's own lists also sit 1 px apart (line list 233.5, enclosed list 234.5), but those neighbours are a line list and an enclosed box; the build's touching pair is two line lists whose hairlines join. The reviewer's gap-4 alternative gives 213.3 px lists about 10 px apart, not 209 and 14, and it would break the recorded 20 px tab gap (DECISIONS.md:218). I made the disabled fix more complete.

1. **[medium] Every state, focus-visible cell**
   - Frame: 2 px ring, radius 12, 95x39 at -4,-4 around the 87x31 text row. The blue 2 px bar under Overview stays visible below it
   - Build: 2 px #51a2ff outline at offset -2, inset on the square 80.5x32 tab (radius 0). It covers the 2 px bar, so no bar shows under the focused Overview (seen in tabs-fv-dis-2x.png)
   - Cause: packages/topclassui/src/components/tabs/dummy/states.tsx:5 (RING with -outline-offset), used at :28, mirroring FOCUS_RING_INSET in tabs/classes.ts:45. It is inset because the list clips (classes.ts:38-39). No DECISIONS entry covers it.
   - Fix: Redraw Figma 138:949 with the live inset ring. Or in the library draw the line tab's inset ring above its bar (an outline offset of -(ring width + 2px), plus rounded-control if the bar's ends may round) and mirror that in states.tsx:5.
2. **[medium] stage and Try it row, height**
   - Frame: Stage 694x311. The two lists sit 135.5 px from the top
   - Build: Stage 682x205, which is Try it's height. The two lists sit 82 px from the top
   - Cause: apps/docs/content/components/tabs.ts:13 stageHeight: 7 (112 px), so the row takes Try it's 205 px
   - Fix: stageHeight: 19.4 (310.4 px), as stepper.ts and sidebar.ts do.
3. **[medium] Every state, the focus-visible and disabled lists run together**
   - Frame: Figma wraps 'disabled' to row 2, so no two line lists touch. Its only touching neighbours, 1 px apart, are the line list and the boxed enclosed list
   - Build: Four 221.3 px lists in 223.5 px cells on one row. The focus-visible list ends at x 688.4 and the disabled list starts at 690.6, 2.2 px apart. 'A11y' and the next 'Overview' are 20.2 px apart, closer than the 36 px between tabs inside a list, and the two hairlines read as one six-tab list. The other list boxes are 19.2 px apart
   - Cause: packages/topclassui/src/components/tabs/dummy/states.tsx:12, :19, :26 and :33 (w-max sm lists) with STATE_GRID gap-x-0 (apps/docs/components/classes.ts:221)
   - Fix: Add mx-2 to each TabsRoot className (w-max mx-2). Each cell is then about 237 px, so the strip wraps 3 + 1 as the frame does (the lone 4th cell then centres, through STATE_CELL grow). Keeping one row with gap-4 on each TabsList gives 213.3 px lists about 10 px apart, but that breaks the recorded 20 px tab gap (DECISIONS.md:218).
4. **[low] Every state, disabled cell**
   - Frame: The whole list at opacity 50 (138:962): labels, the bar under Overview (dim blue) and the hairline
   - Build: Only the labels are at opacity 0.5. The bar under Overview stays full #155dfc and the hairline stays full #262626
   - Cause: packages/topclassui/src/components/tabs/classes.ts:33-34 (TABS_TAB_DISABLED data-disabled:*:opacity-50 dims the children only, so the ring keeps its contrast), TABS_BAR at :54, and the hairline is the list's shadow at :15
   - Fix: Dim the bar with data-disabled:data-active:border-primary-soft on TABS_BAR (classes.ts:54). The hairline stays full unless the line list dims when all its tabs are disabled. Alternatively, redraw Figma 138:962 with only the labels dimmed, which is the library's recorded reason (classes.ts:30-31).
5. **[low] Every state, tab size**
   - Frame: md tabs 87x39 (px 11, a 31 px row, the bar 6 px below). Line list 240x40, enclosed list 212x37 (p 3, gap 3)
   - Build: sm tabs 80.5x32 (px 8). Line list 221.3x33, enclosed list 187.3x32 (p 2, gap 2, tabs 80.5x28)
   - Cause: packages/topclassui/src/components/tabs/dummy/states.tsx:12, :19, :26 and :33 (size="sm", chosen so each list fits a 223.5 px cell; the reason is not in DECISIONS)
   - Fix: Use size="md" if the strip may wrap 3 + 1 as the frame does (4 x ~245 px > 894). Otherwise keep sm and redraw the frame at sm.

## /en/docs/components/accordion: differs (4)

Note: Verifier: re-read get_metadata 138:994 and get_design_context 138:1079 (states). I took my own capture and DOM (me-accordion.png, dom-accordion.json) and made crops acc-top.png and acc-states.png. All four rows hold with the reviewer's numbers. The stage triggers render at weight 500, as drawn, though Windows hinting makes them look heavier. I refined the disabled fix: bg-surface gives a #171717 fill with a full #262626 edge, while the frame's 50% box is about #1e1e1e for both fill and edge.

1. **[medium] Every state, trigger boxes**
   - Frame: Boxes 132x33: px 9, py 8, 'Question' 12 px Medium, 13 px caret
   - Build: Boxes 114.1x46: px 14, py 12, 'Question' 14 px Medium, 14 px caret
   - Cause: packages/topclassui/src/components/accordion/classes.ts:22 (ACCORDION_TRIGGER 'px-3.5 py-3 text-sm'). Accordion has no size prop, so the states (dummy/states.tsx:13-47) render its one scale.
   - Fix: Add a size prop (R-5.7-2) and render the states at size="xs" (12 px, py-2, px-2.5, about 34 px tall). Or redraw Figma's strip at the real 46 px trigger.
2. **[low] stage, accordion box and stage height**
   - Frame: Box 400x175, 37.5 px from the top of a 250 px stage. Triggers 41 px. The answer region is 48 px (no top padding, pb 14)
   - Build: Box 400x194, 20 px from the top of a 234 px stage. Triggers 44 px. The answer region is 58 px (pt 4, pb 14)
   - Cause: apps/docs/content/components/accordion.ts:13 stageHeight: 14 (224 px, less than the 234 px of content). accordion/classes.ts:49 ACCORDION_CONTENT pt-1. The 3 px per trigger is the 20 px line of the type scale.
   - Fix: stageHeight: 15.6 (249.6 px), which puts the box about 28 px from the top. pt-1 can stay: it gives a focus ring on the answer's first line room.
3. **[low] Every state, open cell**
   - Frame: Box 132x64 ('Question', an up caret, 'answer'). It overflows its 58 px row (y -3), so the caption 'open' sits level with the others at y 67
   - Build: Box 151.8x80 ('Open question', 'Answer.' 12 px). The caption 'open' is at y 823, 24 px below the other four (y 799)
   - Cause: packages/topclassui/src/components/accordion/dummy/states.tsx:20-26 (the 80 px box and the title 'Open question', kept for the axe landmark-unique reason at :8, which is not in DECISIONS). STATE_BOX min-h-14 grows to fit (apps/docs/components/classes.ts:224).
   - Fix: states.tsx:20 <section aria-label="open" className="-my-3">. The 80 px box then takes 56 px of the row and overflows it as the frame's panel does, and the caption lines up. Use title="Question" if axe passes with only one open region in the strip.
4. **[low] Every state, disabled cell**
   - Frame: The whole panel at opacity 50 (138:1118): fill and edge about #1e1e1e, with dimmed text and caret
   - Build: Only the trigger is at opacity 0.5. The box keeps its full #262626 fill and edge
   - Cause: packages/topclassui/src/components/accordion/dummy/states.tsx:42. A disabled AccordionRoot dims the trigger only (classes.ts:28 DISABLED on ACCORDION_TRIGGER); ACCORDION_ROOT (:8) has no disabled look, although Base UI sets data-disabled on the root.
   - Fix: Dim the box when the whole root is disabled: ACCORDION_ROOT gains data-disabled:opacity-50, and the trigger's own 50% applies only to a single disabled item, so text is not dimmed twice. As a demo-only stopgap, className="bg-surface" on states.tsx:42 gives a darker #171717 fill but keeps the #262626 edge. Or redraw Figma with the live look.

## /en/docs/components/stepper: differs (3)

Note: Verifier: re-read get_metadata 137:2477 and took my own capture, DOM and 2x shot (me-stepper.png, dom-stepper.json, x2/me-stepper@2x.png, step-stage-2x.png, step-stage-fig-2x.png). Both rows hold. 'Account' is weight 400 #fafafa in the DOM and reads Regular at 2x, as drawn. I added one row: Figma's connectors stop short of some marks.

1. **[low] Every state, digits**
   - Frame: The todo, current and disabled marks show '2'
   - Build: The todo, current and disabled marks show '1'
   - Cause: packages/topclassui/src/components/stepper/dummy/states.tsx:10, :11 and :14 render one-step lists, which number from 1
   - Fix: Redraw Figma 137:2577, 137:2582 and 137:2599 with '1'. No code change.
2. **[low] Every state, mark position in its box**
   - Frame: The 32 px mark sits centred in the 56 px row (y 12-44). The caption is 21 px below the mark
   - Build: The mark sits at y 8-40 of the 56 px box, 4 px above centre, because each step is 32x40. The caption is 26 px below the mark
   - Cause: packages/topclassui/src/components/stepper/classes.ts:10 STEPPER_STEP gap-2 keeps 8 px between the mark row and the in-flow title span, whose content states.tsx:7 makes sr-only (the span is 0x0 but still takes the gap)
   - Fix: On each Stepper in states.tsx:10-14, className="w-auto *:gap-0", so each step is 32x32 and centres in the box.
3. **[low] (added by verifier) stage, connector ends**
   - Frame: The connectors stop short of some marks: 9 px after the Account mark, 4 px before and after the Profile mark, then 0.5 and 0 px. The lines run between the label boxes (137:2516 x 48-104, 137:2522 x 142-198, 137:2528 x 229-285)
   - Build: Every connector runs mark edge to mark edge, with no gap (half lines from each column's centre, under the 32 px marks)
   - Cause: packages/topclassui/src/components/stepper/classes.ts:17-23 (HALF_LINE from the centre, w-1/2, painted under the mark). Figma's gaps are an auto-layout effect of lines placed between label-width boxes, so they vary with label width.
   - Fix: No code change: redraw Figma 137:2510 with the connectors meeting the marks. If gaps are wanted, they need to be a fixed inset on STEPPER_CONNECTOR(_BEFORE) recorded in DECISIONS, not label-dependent.

## /en/docs/components/navbar: differs (4)

Note: Verifier: re-read get_metadata 138:2393 and get_design_context 138:2426 (stage bar) and 138:2475 (states). I took my own capture, DOM and 2x shot (me-navbar.png, dom-navbar.json, nav-stage-2x.png, nav-stage-fig-2x.png, nav-states-2x.png, nav-states-fig-2x.png). I refuted the Try it 'current' row as not a frame difference (see refuted). Corrections to the brand row: the bell's visible glyph is 14 px in both, because the 48x40 ghost Button has no fill at rest, so only its spacing differs. I added the tile-to-name gap (Figma 16, build 8). The scrolled cell's shadow-md is recorded (DECISIONS.md:226) and barely visible in either.

1. **[medium] stage and Try it row, height**
   - Frame: Stage 694x250. The bar sits 99 px from the top
   - Build: Stage 682x166, which is Try it's height. The bar sits 57 px from the top
   - Cause: apps/docs/content/components/navbar.ts:13 stageHeight: 6 (96 px)
   - Fix: stageHeight: 15.6 (249.6 px).
2. **[low] stage, brand tile and actions**
   - Frame: Tile 13x22 (radius 4, 13 px palette), then 16 px to 'TopClass'. The bell is a bare 14 px icon, 16 px before 'OA'. 'OA' is a 26 px tall neutral-soft chip with 10 px text
   - Build: Tile 24x24 (p 4, 16 px palette), then 8 px to 'TopClass'. The bell is a 14 px icon inside a 48x40 ghost Button, which is invisible at rest, so the glyph sits 25 px before the avatar. The avatar is a 32x32 circle on #202020 with 12 px 'OA'
   - Cause: packages/topclassui/src/components/navbar/dummy/stage.tsx:14 (span p-1 with the Svg at its 1em default, inside NavbarBrand's gap-2), :23 (Button variant ghost at its default size) and :24 (AvatarRoot size sm)
   - Fix: stage.tsx:14 p-0.5 and <Svg icon={palette} size="0.8125rem" /> (gap-4 on that NavbarBrand if the 16 px gap is wanted). :23 Button size="xs", which still clears the 24 px floor. :24 AvatarRoot size="xs".
3. **[low] Every state, bar size**
   - Frame: Bars 132x32: px 8, gap 6, radius 4, a plain 14 px blue tile (radius 3, no icon), 'TopClass' 8 px mono Regular, then empty room to the 132 px edge
   - Build: Bars 111.8x36 that hug the brand: px 16, pt 6, pb 4, a 16 px tile holding a 12 px palette icon, and 'TopClass' 12 px SemiBold sans
   - Cause: packages/topclassui/src/components/navbar/dummy/states.tsx:10 (Logo with the palette icon) and :13 (BAR 'w-auto min-h-8 …', which keeps NAVBAR_ROOT's 16 px side padding and pt 6 / pb 4). NavbarBrand is font-semibold (navbar/classes.ts NAVBAR_BRAND).
   - Fix: states.tsx:13 BAR = 'w-33 min-h-8 rounded-chip border-(length:--tc-line-width) ps-2 pe-2 py-0'. Make :10 Logo = <><span className="size-3.5 rounded-chip bg-primary-solid" />TopClass</> and give each NavbarBrand className="text-xs font-mono font-normal gap-1.5".
4. **[low] Every state, focus-visible ring**
   - Frame: A ring around the whole bar: 140x40, 2 px, radius 8, 4 px outside the 132x32 bar
   - Build: The ring is on the brand link only: 2 px at a 2 px offset around the 77.8x24 link, inside the 111.8x36 bar
   - Cause: packages/topclassui/src/components/navbar/dummy/states.tsx:28 (RING on NavbarBrand, the focusable element)
   - Fix: Redraw Figma 138:2514 with the ring on the brand link. No code change.

## /en/docs/components/sidebar: differs (1)

Note: Verifier: re-read get_metadata 138:2539 and get_design_context 138:2572 (stage rail). I took my own capture and DOM (me-sidebar.png, dom-sidebar.json) and made crop sb-top.png. The stage row holds: the header is 30 px (24 px toggle plus pb 6), and the rail's 4 px gap, cancelled and restored by the body's ring-room margin and padding, puts Home at y 43 against Figma's 32. Home is weight 600 against Figma's Medium (138:2580). The SemiBold reason is a classes.ts comment only; DECISIONS.md:220 records 'the weight', not which weight. I refuted the rail-size row (see refuted).

1. **[low] stage, rail header and current link**
   - Frame: Rail 190x171, 70 px from the stage top. Header row 21 px (16 px icon at pl 6, 'Workspace' 14 SemiBold, pb 4), rail gap 2, so Home's row is at y 32. Home in Medium (500) on primary-soft
   - Build: Rail 190x186, 62 px from the stage top. The header is 30 px (a 24 px toggle plus pb 6), then the rail's 4 px gap, so Home sits at y 43, 11 px lower. Home in SemiBold (600)
   - Cause: packages/topclassui/src/components/sidebar/classes.ts:28 (SIDEBAR_HEADER pb-1.5), the rail's gap-1 (nav gap 4 px), and :82 (SIDEBAR_LINK_STATE.current font-semibold). The 24 px toggle is R-5.6-2 and stays.
   - Fix: SIDEBAR_HEADER pb-0.5 and gap-0.5 on the rail. The header is then 26 px and Home sits at about y 37, with the 24 px floor kept. Use font-medium in SIDEBAR_LINK_STATE.current (:82), or record SemiBold in DECISIONS and redraw Figma.

## Refuted by the second reviewer (do not act)

- /en/docs/components/breadcrumb, (still open) stage and collapsed cell, current crumb weight: Recorded: DECISIONS.md:776 (Unit 2) says the current page is font-semibold as well as text-body, and no later entry supersedes it. Figma's own 'current' cell (138:1251) is also SemiBold.
- /en/docs/components/navbar, (new) Try it, current checkbox: Not a frame difference. At rest the build's stage draws Docs current, as the frame does, and the frame draws no 'current' control (the Try it list comes from the schema, docs-site.md:2359). The unchecked box, and the swap to the full-width playground bar (Sign in, 'TopClass UI') on the first change, are a site behaviour bug for a separate ticket.
- /en/docs/components/sidebar, (still open) Every state, rail size: Nothing remains beyond the stage row. The 160 px width is a deliberate fit, since the frame's 190 px rails overflow their 181 px cells (the reviewer's own 'keep'). The 32 px rows are recorded (DECISIONS.md:220, :234), the 24 px toggle is R-5.6-2, and the rest of the height is the same header pb-1.5 plus rail gap-1 cause, whose fix applies to every Rail.
