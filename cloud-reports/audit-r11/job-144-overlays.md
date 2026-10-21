# Figma audit, job 144 overlays

On preview/r8-all d9c04b21 at 1440 dark, frame vs build, each difference re-checked by a second reviewer. Fix what your branch has not fixed yet; skip a row your later commits already cover.

## /en/docs/components/dialog: differs (16)

Note: Verified against Figma design context (138:1815 head, 138:1845 stage and Try it, 150:1031 code, 138:1900 states; root radius 16 read from 138:1464, the same Previewer shell), a fresh 2x Playwright probe (verify/probe.json, verify/live-dialog-*.png) and pixel samples of r11/card-dialog.png. Side-by-side crops are in r11-review/job-144-overlays/verify/dialog-*.png. Rows for the chip, card radius, Try it select and checkbox, code caption, Copy button, plain code colour and note code are card-wide and also apply to the drawer, dropdown and command cards. The reviewer gave the wrong lines for try-it-control.tsx (:170-181 and :143). The Select is at :62-73 and the Checkbox at :35. The 9 px vs 12 px mono text row is refuted as type-scale snapping.

1. **[medium] head, chip next to the name**
   - Frame: 96x16 chip: Roboto Mono 9 px regular, padding 7/2, radius 4, primary-soft fill, no border
   - Build: 152x26 chip: mono 14 px weight 500, padding 8/4, radius 4, 1 px transparent border. It is 56 px wider and 10 px taller than drawn, and 14 px is not the nearest step to 9 px (12 is)
   - Cause: apps/docs/components/previewer/previewer.tsx:89 <Badge ... size="sm" className="font-mono"> -> packages/topclassui/src/components/badge/classes.ts:39 sm = 'px-2 py-pad-y-sm gap-1.5 text-sm/4'
   - Fix: previewer.tsx:89: size="xs" (classes.ts:38 'px-1 py-pad-y-xs gap-1 text-xs', about 22 px tall) and className="font-mono font-normal". The generated wording stays.
2. **[medium] stage row height**
   - Frame: stage row 348 px: 34 px padding above and below a 280 px overlay box
   - Build: stage row 388 px (card y 110-498), 40 px taller
   - Cause: apps/docs/content/components/dialog.ts:23 stageHeight: 24.25 (388 px). packages/topclassui/src/components/dialog/dummy/playground.tsx:30 Stage 'min-h-87' (348 px) plus STAGE p-5 (20+20)
   - Fix: dialog.ts:23: stageHeight: 21.75 (348 px), together with the 280 px box in the next row, so that STAGE centres it 34 px from each edge
3. **[medium] stage, the page behind the scrim**
   - Frame: 520x280 box, radius 12, overflow clipped, centred with 87 px each side. 4 bars 8 px tall, radius 3, neutral/soft fill (rgb 18 under the scrim), 14 px inset, 8 px gap, widths 271/418/344/221
   - Build: The box fills the stage content: 642x348 with computed border-radius 0 (square corners). Bars are surface-raised (rgb 22 under the scrim), 24 px inset, widths 297/475/396/238
   - Cause: dialog/dummy/playground.tsx:30 'relative min-h-87 w-full [contain:paint]', :17 PageBehind 'p-6', :12 BAR 'bg-surface-raised'
   - Fix: :30 -> 'relative h-70 w-130 max-w-full overflow-hidden rounded-box [contain:paint]'; :17 p-6 -> p-3.5; :12 bg-surface-raised -> bg-neutral-soft
4. **[medium] stage, the open dialog**
   - Frame: Panel 380x178. Header 47 tall with only the title 'Delete this project?' (16 semibold). Body has 18 px padding around 2 lines of 14 px muted text. Footer has a quiet Cancel and a danger-solid red 'Delete', both 62x29
   - Build: Panel 380x196. Header 73 tall: the title 'Publish changes' plus a description line 'Your changes go live right away.' (14 px muted). Body is one line in a 60 px min-height. Footer has Cancel 72x32 and a primary blue 'Publish now' 107x32
   - Cause: packages/topclassui/src/components/dialog/dummy/playground.tsx:35-43 (Stage) and :59-67 (Demo, which also feeds the code sample)
   - Fix: In Stage and Demo: DialogTitle 'Delete this project?', drop DialogDescription, put the drawn sentence in DialogBody, and make the last action <DialogClose render={<Button size="sm" tone="danger">Delete</Button>} />. Cancel stays the neutral soft Button (DECISIONS 2026-10-19).
5. **[medium] Try it select (every card)**
   - Frame: 208x29, radius 8, surface-raised fill (rgb 38) with a line border of the same rgb 38, so no visible edge. Value in Roboto Mono 11 px, caret 13
   - Build: 211x32, rgb 38 fill with a 1 px line-strong border (rgb 161), a bright outline. Value 14 px mono, caret 14
   - Cause: apps/docs/components/previewer/try-it-control.tsx:62-73 <Select size="sm" fullWidth className="font-mono">. The className reaches the trigger (select/client.tsx:70), whose FIELD_SURFACE uses BORDER_STRONG (packages/topclassui/src/shared/classes.ts:265)
   - Fix: Pass a docs constant to the trigger, for example TRY_SELECT = 'font-mono text-xs border-line' in apps/docs/components/classes.ts, used at try-it-control.tsx:66. Line-strong is the 3:1 field edge (R-5.6-4), so dropping it on the docs needs a DECISIONS entry.
6. **[medium] code part, Copy button (every card)**
   - Frame: 73x29: surface fill rgb 23, 1 px line border rgb 38 (quiet), icon 14, 12 px medium
   - Build: 83x32 (capture x 830-912, y 517-549): transparent over the page (rgb 10) with a 1 px line-strong border rgb 161 (bright outline), 14 px
   - Cause: apps/docs/components/previewer/copy-button.tsx:50 variant 'outline' -> packages/topclassui/src/components/button/variants.ts:33 'border-line-strong'. Job 116's entry (DECISIONS 2026-10-19) changed only the outline label colour, not this border
   - Fix: copy-button.tsx:55: className={word === undefined ? 'shrink-0' : 'shrink-0 bg-surface border-line'}, or give the outline Button the frame's neutral look in the library
7. **[medium] code part, note line with inline code (every card)**
   - Frame: Note in one size (10.5 px muted, no inline code styling) with a 12 px info icon
   - Build: Note at 12 px, but the inline code 'contents' is 14 px mono in body white (67x18), taller and brighter than the sentence around it
   - Cause: apps/docs/components/inline-text.tsx:6 uses INLINE_CODE (apps/docs/components/classes.ts:81 'font-mono text-sm text-body'). previewer.tsx:72 renders the note through InlineText
   - Fix: previewer.tsx:72: <span className={AUTHORED_CELL}> (classes.ts:100 '**:text-[length:inherit]'), so the code takes the note's 12 px. Or add NOTE_CODE = 'font-mono text-[length:inherit] text-body'.
8. **[medium] Every state, cell size**
   - Frame: Overlay thumbnails 132x72 (radius 12) overflow a 58 px row, with captions 67 px below the row top. The states section is 142 px tall
   - Build: Thumbnails 144x112 (radius 12), with captions 122 px below the box top. The states section is 203 px tall (+61)
   - Cause: packages/topclassui/src/components/dialog/dummy/states.tsx:14 CELL 'relative h-28 w-36 ...' (and the closed cell's h-28 at :54)
   - Fix: states.tsx:14: h-28 w-36 -> h-18 w-33 (72x132), and h-28 -> h-18 at :54
9. **[low] card outline, corners**
   - Frame: radius 16 px (root rounded-[16px]). In the PNG the top edge goes straight about 15 px from the corner
   - Build: radius 12 px (rounded-box). The left edge goes straight 12 px from the corner in the capture
   - Cause: apps/docs/components/classes.ts:127 CARD 'grid min-w-0 overflow-hidden rounded-box ...', used by PREVIEWER at :129
   - Fix: classes.ts:129: build PREVIEWER without CARD's rounded-box, for example `grid min-w-0 overflow-hidden ${ROUNDED_CARD} bg-surface ${BORDER} shadow-md`. ROUNDED_CARD at :57 is the drawn 16 px. Appending ROUNDED_CARD to CARD would leave two radius utilities in one plain string, and nothing would merge them.
10. **[low] Try it column, the control list**
   - Frame: select 'size' = md, select 'placement' = center, then checkboxes dismissible (on), modal (on), scrollBody (on)
   - Build: select 'size' = md and checkbox 'closeButton' (on) only
   - Cause: Try it is generated from packages/topclassui/src/components/dialog/schema.ts (size, closeButton) through apps/docs/components/previewer/previewer.tsx:55. content/components/dialog.ts has no extraSwitches
   - Fix: Record in docs/figma/docs-site.md S8 that placement and scrollBody are not Dialog API, and that dismissible is the inverse of disablePointerDismissal. Optionally expose modal through extraSwitches and pass it through dummy/playground.tsx.
11. **[low] Try it checkbox (every card)**
   - Frame: 16x16 box, radius 4, check glyph 11 px
   - Build: 20x20 box (toggle sm), radius 4, check glyph 14.4 px
   - Cause: apps/docs/components/previewer/try-it-control.tsx:35 <Checkbox size="sm">
   - Fix: try-it-control.tsx:35: size="xs". TOGGLE_SIZE xs is 16 px with an 80% glyph (12.8 px), and TOGGLE_TARGET keeps the 24 px target.
12. **[low] code part, caption row**
   - Frame: One-line caption 'DialogBody is the scroll container: the header and footer stay put while it scrolls.' in 10 px medium sentence case
   - Build: 'THE CODE' (12 px uppercase)
   - Cause: apps/docs/components/previewer/playground-island.tsx:100 always renders labels.theCode. Content files have no caption field, and S8 allows 'THE CODE (or a one-line caption)'
   - Fix: Add an optional codeCaption {en, ar} to content/components/dialog.ts and render it in place of theCode at playground-island.tsx:100 (and previewer.tsx:128) when it is present
13. **[low] code part, plain code text (every card)**
   - Frame: Plain (untokenised) code text is muted: the import lines peak at rgb 161 (#a1a1a1), and the JSX plain text is dimmer still, peaking at rgb 128
   - Build: All plain code text is rgb 212 (neutral-300), clearly brighter than drawn
   - Cause: apps/docs/lib/shiki-themes.ts:14 DARK_GROUND.text '#d4d4d4' is the plain foreground, shown on the card by apps/docs/app/globals.css:332 .docs-flat-code .shiki span
   - Fix: Give the card's flat code a plain foreground of #a1a1a1 (neutral-400, the muted token), for example a FLAT palette variant in shiki-themes.ts. Keep the token colours and re-run lib/shiki-contrast.test.ts.
14. **[low] Every state, small panels**
   - Frame: Panel 96x30, padding 8, label 'dialog'/'alert'
   - Build: Panel 112x37 (w-28), padding 10
   - Cause: dialog/dummy/states.tsx:43 'max-h-[100cqh] w-28' and the headers' 'p-2.5' (:69, :74, :79, :87)
   - Fix: w-28 -> w-24 and p-2.5 -> p-2
15. **[low] Every state, 'scrolled' cell**
   - Frame: Drawn like 'open': the 96x30 panel with 'dialog' only
   - Build: 112x80 panel with the 'dialog' header, a divider, and 'line 1' and 'line 2' visible in a scrolling body
   - Cause: dialog/dummy/states.tsx:78-85 (Open title="scrolled" with a 12-line DialogBody, SCROLLED at :20)
   - Fix: Draw the same header-only panel as 'open' to match the frame, or record that the build shows the scroll as content
16. **[low] Every state, 'closed' cell**
   - Frame: 'Open' button 53x29, surface fill with a line border (quiet), 12 px
   - Build: 62x32, transparent with a bright line-strong border (rgb 161), 14 px
   - Cause: dialog/dummy/states.tsx:56 <Button variant="outline" size="sm"> (outline Button's border-line-strong, button/variants.ts:33)
   - Fix: Follows the outline Button fix, or className 'bg-surface border-line' here

## /en/docs/components/drawer: differs (13)

Note: Verified with Figma 138:1976 (metadata), 138:2008 (stage) and 138:2056 (states), probe.json and verify/drawer-*.png. The card-wide rows from the dialog item also apply: chip, card radius, Try it select border and size, Copy button outline, plain code colour. The divider lines are invisible in both (rgb 38 on rgb 38). The x in every sheet is library policy (drawer/classes.ts:98, WCAG 2.5.7), so a state cell cannot drop it without a recorded exception.

1. **[medium] stage row height**
   - Frame: 328 px (34 px padding around a 260 px box)
   - Build: 388 px (+60)
   - Cause: apps/docs/content/components/drawer.ts:22 stageHeight: 24.25. packages/topclassui/src/components/drawer/dummy/playground.tsx:16 'min-h-87'
   - Fix: stageHeight: 20.5 (328 px), together with the 260 px box below
2. **[medium] stage, the page behind**
   - Frame: 4 bars (216/333/274/176 x 8 px, radius 3, neutral/soft, 14 px inset, 8 px gap) visible under the scrim to the left of the sheet
   - Build: No bars: the left of the stage is a flat rgb 6 field
   - Cause: drawer/dummy/playground.tsx:16-17: Stage renders only the scrim div. There is no PageBehind like dialog/dummy/playground.tsx:15-24
   - Fix: Add the four-bar PageBehind (p-3.5, widths 1/2, 4/5, 2/3, 2/5, rounded-chip, bg-neutral-soft) before the scrim at :17
3. **[medium] stage, overlay box**
   - Frame: 420x260 box, radius 12, overflow clipped, centred (137 px each side). The clip rounds the sheet's end corners
   - Build: 642x348 with square corners. The sheet's corners are square too
   - Cause: drawer/dummy/playground.tsx:16 'relative min-h-87 w-full [contain:paint]'
   - Fix: :16 -> 'relative h-65 w-105 max-w-full overflow-hidden rounded-box [contain:paint]'
4. **[medium] stage, the sheet**
   - Frame: 220x260 sheet at the box's inline end (52% of the box)
   - Build: 320x348 sheet (size md = max-w-80, h-dvh capped by max-h-full)
   - Cause: drawer/dummy/playground.tsx:19 <DrawerPopup ... className="max-h-full"> at the default size md (drawer/classes.ts:65 'max-w-80')
   - Fix: Cap the drawn sheet only while Try it has not set a size: className={cn('max-h-full', size === undefined && 'max-w-55')} at :19. A plain max-w-55 would override every size, and the size control would stop showing.
5. **[medium] stage, sheet content**
   - Frame: Header 'Filters' only (47 tall, padding 16/14) with the x. Body padding 16, gap 10: Status, Owner, Updated. No footer
   - Build: Header 73 tall with an extra description 'Narrow the list of projects.'. Footer with Reset (outline md, 72x40, bright border) and Apply (primary md, 73x40) at the bottom of the 348 px sheet
   - Cause: drawer/dummy/playground.tsx:22 DrawerDescription and :29-32 DrawerFooter with md Buttons (same in Demo at :50 and :57-60)
   - Fix: Drop the description and the footer from Stage, and from Demo so that the code matches, or at least use size="sm" buttons
6. **[medium] code part, note line**
   - Frame: A single 10.5 px muted note
   - Build: Inline codes 'placement', 'start', 'left' and 'right' at 14 px body white inside a 12 px muted note
   - Cause: apps/docs/components/inline-text.tsx:6 INLINE_CODE (apps/docs/components/classes.ts:81), via previewer.tsx:72
   - Fix: Same as dialog: the note's span takes AUTHORED_CELL, so the code inherits 12 px
7. **[medium] Every state, cell size**
   - Frame: Thumbnails 132x72 (radius 12). The states section is 142 px tall
   - Build: Thumbnails 144x96. The states section is 187 px tall (+45)
   - Cause: packages/topclassui/src/components/drawer/dummy/states.tsx:11 CELL 'relative h-24 w-36 ...' (and the closed cell's h-24 at :57)
   - Fix: h-24 w-36 -> h-18 w-33
8. **[low] head, description**
   - Frame: One line, 83 chars ('Dialog that slides from a logical edge, so it mirrors in RTL without a code change.'). The head is 79 px tall
   - Build: Two lines, 115 chars. The head is 109 px tall: the second line adds 20 px, and the rest is the type scale's line heights
   - Cause: apps/docs/content/components/drawer.ts:6
   - Fix: Shorten to one line at 556 px, for example 'A dialog that slides from a logical edge, so it mirrors in Arabic with no code change.'
9. **[low] Try it column**
   - Frame: 'side' = inline-end, 'size' = md, then dismissible (on), snapPoints (off), swipeToClose (on)
   - Build: 'placement' = end and 'size' = md only. No toggles
   - Cause: Generated from packages/topclassui/src/components/drawer/schema.ts (placement, size). R-5.3-4 names the prop placement
   - Fix: Record in docs-site.md S8 that side/inline-end is placement/end, and that snapPoints, dismissible and swipeToClose are not Drawer props. Or expose real props through extraSwitches.
10. **[low] Every state, side sheet (side sheet, dragging, focus trapped)**
   - Frame: Sheet 56x72 (42% of the box), label 'sheet' at padding 8, no x
   - Build: Sheet 96x96 (67% of the box) with a 16 px x glyph in a 24 px box beside the label
   - Cause: drawer/dummy/states.tsx:41 'w-24'. DrawerPopup always renders its x
   - Fix: w-24 -> w-16 (64 px, which still fits the label and the 24 px x). Record that the x stays (WCAG 2.5.7).
11. **[low] Every state, bottom sheet**
   - Frame: 132x27 strip at the bottom, label at padding 8, no grabber
   - Build: 144x58 strip with a 36x4 grabber bar and an x
   - Cause: drawer/dummy/states.tsx:76 DrawerPopup placement="bottom" (grabber from drawer/classes.ts:73 DRAWER_GRABBER, x always rendered)
   - Fix: Record that the grabber and the x are the library's bottom sheet, or hold the strip lower with tighter header padding
12. **[low] Every state, 'dragging' cell**
   - Frame: Sheet in place at 75% opacity
   - Build: Sheet moved 24 px toward the end. Its x is cut at the cell edge, so a stray '>' fragment shows at the cell's end
   - Cause: drawer/dummy/states.tsx:29 DRAGGING 'translate-x-[calc(1.5rem*var(--tc-dir))]'
   - Fix: DRAGGING = 'opacity-75' (as drawn), or a translate small enough to keep the x inside the cell
13. **[low] Every state, 'closed' cell (added by verifier)**
   - Frame: 'Open' button 53x29, surface fill with a quiet line border, 12 px
   - Build: 62x32, transparent with a bright line-strong border (rgb 161), 14 px
   - Cause: packages/topclassui/src/components/drawer/dummy/states.tsx:59 <Button variant="outline" size="sm"> (button/variants.ts:33 border-line-strong)
   - Fix: Follows the outline Button fix, or className 'bg-surface border-line'

## /en/docs/components/dropdown: differs (12)

Note: Verified with Figma 138:1464 (root, which also gives the card radius 16), 138:1496 (stage) and 138:1560 (states), probe.json, verify/live-dropdown-*.png and a live test (verify/dd-fix.mjs, dd-fix-states.png). Forcing the state cells to 9.5rem gives 136x80 menus with whole labels, which proves the width cause. The card-wide rows from the dialog item also apply. The installed @base-ui/react 1.8.0 MenuPopup types have finalFocus but no initialFocus.

1. **[high] Every state, open and disabled-item cells**
   - Frame: Each cell draws a 134x76 menu (rows 124x31: pencil-simple 'Edit', trash 'Delete')
   - Build: The menus collapse. In the 1x capture (strip below the fold) no menu is visible at all, only three bare 'Actions' buttons. Scrolled into view (2x probe), each menu is 60x80 with rows 46 wide and each label cut to one character ('E', '[')
   - Cause: packages/topclassui/src/components/dropdown/dummy/states.tsx:13 cell 'relative flex h-36 justify-center overflow-hidden pt-2 [contain:paint]' has no width. Inside STATE_BOX (apps/docs/components/classes.ts:209, a centring flex) it shrinks to the 76.6 px trigger. Its overflow-hidden makes it the clipping box, and DROPDOWN_WIDTH (dropdown/classes.ts:12) caps the menu at --available-width, which is about 60 px
   - Fix: states.tsx:13: add a width and keep the height for now: 'relative flex h-36 w-38 justify-center overflow-hidden pt-2 [contain:paint]'. Checked live: a 9.5rem cell gives 136x80 menus with whole labels. Do not cut to h-18 while the trigger sits above the menu: 32 + 6 + 80 px does not fit in 72 px, and the menu would flip and clip again.
2. **[medium] Every state, cell form and height**
   - Frame: Open cells draw the panel alone (134x76), centred on a 58 px row. The states section is 142 px tall
   - Build: Each cell is the trigger with the menu hanging under it, in a 144 px tall cell (h-36). The states section is 235 px tall (+93)
   - Cause: dropdown/dummy/states.tsx:13 cell 'h-36 ... pt-2' and :17-27 Open (trigger plus popup)
   - Fix: Draw the open cells as the panel alone (no trigger above it) and then use h-18 (the closed cell keeps its trigger). Or record the trigger-plus-menu picture.
3. **[medium] stage row height**
   - Frame: 311 px
   - Build: 388 px (+77)
   - Cause: dropdown.ts:10 stageHeight: 24.25. packages/topclassui/src/components/dropdown/dummy/playground.tsx:19 'min-h-87'
   - Fix: stageHeight: 19.4375 (311 px), and the Stage box at :19 no taller than the 271 px content box (min-h-67.75 in place of min-h-87)
4. **[medium] stage, position of trigger and menu**
   - Frame: Trigger and menu form one 220x182 group, centred both ways (group at x 237, y 64.5 in the 694x311 stage), with trigger start = menu start
   - Build: Only the trigger is centred (x 299-384). The 220 px menu hangs to its right, so the menu's centre is 68 px right of the stage centre. Both sit at the top (trigger y 44 of 388), leaving 147 px empty under the menu
   - Cause: dropdown/dummy/playground.tsx:20 '<div className="flex justify-center p-6">' centres the trigger only, with no vertical centring
   - Fix: :19 -> 'relative grid min-h-67.75 w-full place-items-center [contain:paint]' and :20 -> '<div className="w-55">' (220 px, trigger at its start), dropping p-6
5. **[medium] stage, trigger**
   - Frame: 86x29: dots-three icon 14, 'Actions' 12 px medium, surface fill, quiet line border
   - Build: 84.6x40 (size md), no icon, 14 px, transparent with a bright line-strong border
   - Cause: dropdown/dummy/playground.tsx:22 render={<Button variant="outline">Actions</Button>}. DECISIONS 2026-10-19 says the basic trigger is sm
   - Fix: <Button variant="outline" size="sm"><Svg icon={dotsThree} />Actions</Button> at :22 and :43. The border follows the outline Button fix.
6. **[medium] stage, menu rows**
   - Frame: Settings row highlighted (208x31, primary-soft fill, primary text rgb 81,162,255 and icon). Delete row is danger: text rgb 255,100,103, trash icon rgb 228,92,95. Icons on neutral rows are muted (rgb 161/146)
   - Build: No row highlighted. Delete is neutral white. Every icon is body white (rgb 250)
   - Cause: Delete: playground.tsx:28 tone={tone}, and tone is undefined at rest, so the row is neutral. Icons: packages/topclassui/src/components/dropdown/classes.ts:52 DROPDOWN_ICON 'inline-flex shrink-0' has no colour. Highlight: the menu's focus sits on the popup, so no item is highlighted
   - Fix: dropdown/dummy/playground.tsx:39: default tone = 'danger' in the Demo signature (scripts/lib/collect.ts reads it through demoStartsOf, so Try it starts at danger and the stage draws it). Content starts alone would not reach the demo. Icons: DROPDOWN_ICON 'inline-flex shrink-0 text-muted group-data-highlighted:text-inherit', with DROPDOWN_ITEM_TONE.danger keeping its icon in the tone colour. Settings: a forced data-highlighted in the Stage, or a record.
7. **[medium] code part, note line**
   - Frame: A single 10.5 px muted note
   - Build: 'href' and 'onSelect' as 14 px body-white code inside the 12 px muted note
   - Cause: apps/docs/components/inline-text.tsx:6 INLINE_CODE (classes.ts:81) via previewer.tsx:72
   - Fix: Same as dialog: the code inherits the note's size
8. **[low] Every state, which states**
   - Frame: 6 states: closed, open, hover item (Edit row in primary-soft fill with primary text), submenu, checked, disabled item. The count reads '6 states'
   - Build: 3 states: closed, open, disabled item. The count reads '3 states'. 'hover item' is missing
   - Cause: dropdown/dummy/states.tsx:31-52. DECISIONS 2026-10-19 left 'hover item' out because it needs a live pointer, but Dialog and Drawer now draw their live states as pictures
   - Fix: Add 'hover item' as a picture: a forced data-highlighted on the first DropdownItem, or a drawn panel as Command's strip does. Submenu and checked stay a decision for Omar.
9. **[low] Every state, 'closed' trigger**
   - Frame: 86x29: dots-three icon 14 + 'Actions' 12 px, surface fill, quiet line border
   - Build: 76.6x32: no icon, 14 px, bright line-strong border (rgb 161)
   - Cause: dropdown/dummy/states.tsx:14 const trigger = <Button variant="outline" size="sm">Actions</Button>
   - Fix: Add <Svg icon={dotsThree} /> before 'Actions'. The border follows the outline Button fix.
10. **[low] head, description**
   - Frame: One line, 84 chars. The head is 79 px tall
   - Build: Two lines, 121 chars. The head is 109 px tall
   - Cause: apps/docs/content/components/dropdown.ts:6
   - Fix: Shorten to one line (about 85 chars at 14 px in 556 px)
11. **[low] stage, menu outline**
   - Frame: No ring. The panel has the line border and the drop shadow
   - Build: 2 px primary focus ring (outline rgb of --tc-ring, inset) around the whole 220x151 menu
   - Cause: Base UI 1.8.0 MenuPopup takes the focus on open (its types have finalFocus but no initialFocus), and the popup wears FOCUS_RING_INSET (packages/topclassui/src/components/dropdown/classes.ts:23). DECISIONS 2026-10-19 records this only for the strip
   - Fix: Record in DECISIONS that the stage shows the focused menu too, or move focus back to the trigger after mount in the Stage
12. **[low] Try it column**
   - Frame: placement = bottom-start, size = md, sideOffset = 8, then modal (off), loop (on), closeOnSelect (on)
   - Build: placement = bottom-start and tone = neutral only
   - Cause: Generated from packages/topclassui/src/components/dropdown/schema.ts (placement, tone, delay, closeDelay). dropdown.ts:12 hides delay and closeDelay
   - Fix: Record in S8 that size, sideOffset, modal, loop and closeOnSelect are not exposed, or add the real ones through extraSwitches

## /en/docs/components/command: differs (10)

Note: Verified with Figma 138:1653 (metadata), 138:1685 (stage) and 138:1744 (states), probe.json and verify/command-*.png. The six-cell states strip wraps 5 + 1 (selected falls to a second row, so the strip is 293 px vs 142); job 140 is fixing that shared grid gap. Recorded in DECISIONS 2026-10-19 and not counted: the 2 px ring line under the search row (in every drawn panel, 'open' included) and the ring bar at the start of the active row. The card-wide rows from the dialog item also apply.

1. **[medium] stage row height**
   - Frame: 311 px. Panel 400x143, centred (y 84)
   - Build: 388 px (+77). Panel 400x152, centred (y 118.5)
   - Cause: command.ts:22 stageHeight: 24.25. packages/topclassui/src/components/command/dummy/playground.tsx:50 Stage 'relative grid min-h-87 w-full place-items-center p-4'
   - Fix: stageHeight: 19.4375 (311 px). At :50 drop min-h-87 (STAGE already centres the panel), or use min-h-67.75.
2. **[medium] code part, note line**
   - Frame: A single 10.5 px muted note
   - Build: 'getKey', 'getLabel' and 'onSelect' as 14 px body-white code inside the 12 px note
   - Cause: apps/docs/components/inline-text.tsx:6 INLINE_CODE (classes.ts:81) via previewer.tsx:72
   - Fix: Same as dialog: the code inherits the note's size
3. **[low] head, description**
   - Frame: One line, 82 chars. The head is 79 px tall
   - Build: Two lines, 114 chars. The head is 109 px tall
   - Cause: apps/docs/content/components/command.ts:6
   - Fix: Shorten to one line (about 85 chars)
4. **[low] stage, search row Esc keycap**
   - Frame: 31x18 chip with a surface fill (rgb 23) and a line border, which reads as a darker chip on the rgb 38 panel. Padding 6/2, radius 4
   - Build: 35.6x22 Kbd filled surface-raised (rgb 38) with a rgb 38 border, the same as the panel, so no visible chip: only the word 'Esc' shows
   - Cause: command/dummy/playground.tsx:29 escape 'shrink-0 border-line text-muted' (the live palette uses command/classes.ts COMMAND_ESCAPE_HINT)
   - Fix: Add 'bg-surface' to the escape classes (and to COMMAND_ESCAPE_HINT for the live palette)
5. **[low] stage, group heading**
   - Frame: 'Components' row 19 px tall (padding top 6, bottom 2, 9 px text). The list is 97 px (6 + 19 + 2 + 31 + 2 + 31 + 6)
   - Build: 32 px heading unit, so the list is 108 px (6 + 32 + 32 + 32 + 6) and the panel 152 px (frame 143)
   - Cause: command/dummy/playground.tsx:22 heading 'h-(--tc-row-height)', which mirrors COMMAND_GROUP_LABEL (command/classes.ts:48) that the windowing spacers count as one unit
   - Fix: Use h-5 for the heading in the picture only. Record that the live palette keeps the unit.
6. **[low] stage, row icons**
   - Frame: The non-active row's file-text icon is muted (rgb 154). The active row's icon is primary
   - Build: Body white (rgb 250) for 'Button group'
   - Cause: command/dummy/playground.tsx:61 <Svg icon={fileText} /> inherits the row's text colour
   - Fix: Give the icon className 'text-muted group-data-highlighted:text-inherit' (with 'group' on the row), or text-muted on non-highlighted rows only
7. **[low] Try it column**
   - Frame: visibleRows = 7, placement = center, shortcut = Ctrl K, then modal, loop and filter (all on)
   - Build: visibleRows = 7 and defaultOpen (off) only
   - Cause: Generated from packages/topclassui/src/components/command/schema.ts. shortcut is a free string and virtualize a union, so neither gets a control, and loadMoreThreshold is hidden at command.ts:24
   - Fix: Add shortcut as a select of the usual keys through the content file, or record that placement, modal, loop and filter are not Command props
8. **[low] code part, caption row**
   - Frame: 'Loaded with React.lazy and mounted on first open, so it is never in the initial bundle.' (10 px medium, sentence case)
   - Build: 'THE CODE'
   - Cause: apps/docs/components/previewer/playground-island.tsx:100 labels.theCode
   - Fix: The optional codeCaption content field described under dialog
9. **[low] Every state, 'closed' cell**
   - Frame: 'Ctrl K' as plain 9 px mono muted text (33x12)
   - Build: Two Kbd keycaps (about 43x22 and 21x22) with bright line-strong borders and body-white 12 px text
   - Cause: packages/topclassui/src/components/command/dummy/states.tsx:58-60 <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>
   - Fix: Render 'Ctrl K' as text in the cell, which already carries 'font-mono text-xs text-muted'
10. **[low] Every state, small panels (size)**
   - Frame: Panel 134x67: padding 5, search row 22 tall (12 px glass), gap 2, one 31 px row
   - Build: Panel 136x74: search row 28 tall (py-1.5 around a 15 px line plus its 1 px rule), then a list with 6 px padding around a 32 px row
   - Cause: command/dummy/states.tsx:12-17: panel 'w-34', search 'px-2.5 py-1.5 text-xs/tight', list 'p-1.5'
   - Fix: py-1 on the search row and p-1.25 on the list (or accept 7 px)

## Refuted by the second reviewer (do not act)

- /en/docs/components/dialog, small mono text (chip, state captions, shortcuts): 9 px vs 12 px: Recorded type-scale snapping (docs-site.md S2 'Type sizes', table row 6). 12 px (text-xs) is the nearest and smallest step to Figma's 9 px, and the reviewer's own fix was 'no change'.
- /en/docs/components/command, stage, magnifying glass 14 px vs 16 px: A 2 px icon-size difference, within the 1-2 px tolerance.
- /en/docs/components/command, Every state, small panels: the 2 px ring line under the search row in the 'open' cell: Recorded in DECISIONS 2026-10-19 (the command palette's focus appearance). An open palette always holds the focus in its input, so the ring line belongs to every drawn open panel, 'open' included. The panel-size half of the row is kept.
- /en/docs/components/dropdown, Every state, which states: the 'submenu' and 'checked' cells: Recorded in DECISIONS 2026-10-19: Dropdown has no submenu or checkbox item, so these need new API and are a decision for Omar. Only 'hover item' is kept.
- /en/docs/components/dropdown, stage, menu rows: the caret-right on Duplicate: It is a submenu affordance, and the submenu API does not exist (DECISIONS 2026-10-19). The rest of the row (highlight, danger tone, icon colour) is kept.
