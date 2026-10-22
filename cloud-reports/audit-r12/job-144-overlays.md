# Figma audit 2, job 144 overlays

Second audit on preview/r8-all 6963704f (preview 99ae7ded with 144, 146, 141 and 147 merged; the lead has since merged the same) at 1440 dark: every first-audit row re-checked (still open) plus a fresh pass (new), each re-checked by a second reviewer. Close every row or record why it stays.

## /en/docs/components/dialog: differs (8)

Note: Checked against the frame PNG, Figma design context (138:1861, 138:1906, 138:1935, 150:1031), the r13 capture and the live probe. My crops are in handoff/figma-audit/r13-review/job-144-overlays/skeptic/ (dlg-stage.png, dlg-panel2x.png, dlg-try2x.png, dlg-code-a/b.png, dlg-states.png). 8 of 9 claims hold. The Try it claim is refuted by docs-site.md:2359-2362. One frame quirk, not counted: Figma binds the plain JSX tokens of 150:1041 to base/body (#fafafa, from get_variable_defs), but its own render paints them at about 50% (rgb 128). Command's 150:1121 does the same, while the Drawer and Dropdown frames paint them at rgb 250. The build's body is the bound value, so the fix belongs in the Figma file, not in the build.

1. **[low] stage, the open dialog's footer buttons**
   - Frame: Cancel and Delete are each 62x29: 12 px medium, padding 10/6 and 12/7, radius 8. Cancel has the surface fill (rgb 23) and a line border. Panel 380x178 (header 47, body 70, footer 57)
   - Build: Cancel 72.5x32 and Delete 68.9x32, 14 px medium (Button sm, padding 12/4). Cancel is neutral soft (rgb 32, no border), which DECISIONS records. Footer 61, panel 380x192 (header 53, body 76)
   - Cause: packages/topclassui/src/components/dialog/dummy/playground.tsx:40-41 (Stage) use <Button ... size="sm">. DECISIONS.md:158 says 'The basic demo's actions are sm, as drawn', but 29 px with 12 px text is the xs step: the card's own Copy button is Button xs at 72x28 and 12 px. Lines :64-65 (Demo) only feed THE CODE
   - Fix: size="xs" on both DialogClose buttons at playground.tsx:40-41 (and :64-65 to keep the code in step). Correct DECISIONS.md:158 to xs. The header keeps its 24 px x box (R-5.6-2)
2. **[low] code part, caption row**
   - Frame: A one-line caption: 'DialogBody is the scroll container: the header and footer stay put while it scrolls.' (10 px medium, muted, sentence case, 451x12)
   - Build: 'THE CODE' (12 px medium, uppercase, muted, 61x16)
   - Cause: apps/docs/components/previewer/playground-island.tsx:102 and previewer.tsx:131 always render labels.theCode. Content files have no caption field, though docs-site.md:747 allows 'THE CODE (or a one-line caption)' and :2284 lists this caption
   - Fix: Add an optional codeCaption {en, ar} to the content schema (apps/docs/scripts/lib/content.ts) and to apps/docs/content/components/dialog.ts. When it is present, render it in place of theCode at playground-island.tsx:102 and previewer.tsx:131, in sentence case
3. **[low] Every state, 'scrolled' cell**
   - Frame: Drawn exactly like 'open' (138:1937): a 96x30 panel with only 'dialog' at padding 8, no rule and no body
   - Build: A 96x40 panel set 16 px from the cell top (open and alert sit at 19.5). Its 32 px header has 'dialog' pinned 8 px from the top, over the first 7 px of a scrolling body ('line 1'...'line 12'). The header rule is switched on by data-scrolls but cannot be seen in dark, where line and surface-raised are both lab 15.2. The panel is 7 px taller than its neighbours, and its label sits 3.5 px higher
   - Cause: packages/topclassui/src/components/dialog/dummy/states.tsx:78-85: Open title="scrolled" with a 12-line DialogBody (SCROLLED at :20)
   - Fix: Draw it like the 'open' cell at :68-72: only DialogHeader closeButton={false} className="border-b-0 p-2". Or record in DECISIONS that the build shows the scroll as content
4. **[low] Every state, 'closed' cell**
   - Frame: 'Open' 53x29: surface fill (rgb 23), 1 px line border (rgb 38), 12 px medium, padding 10/6
   - Build: 62x32: transparent, 1 px border at rgb 161 (the brightest edge in the strip), 14 px
   - Cause: packages/topclassui/src/components/dialog/dummy/states.tsx:56 <Button variant="outline" size="sm">, whose border comes from packages/topclassui/src/components/button/variants.ts:33 'border-line-strong'. DECISIONS.md:164 deferred the neutral outline look to job 116, which changed only the label colour
   - Fix: states.tsx:56: size="xs" className="bg-surface border-line". The site's own Copy button already does this (apps/docs/components/previewer/copy-button.tsx:57)
5. **[low] stage, page bars behind the scrim**
   - Frame: 4 bars of 271, 418, 344 and 221 px (8 px tall, radius 3) in the 520 px box
   - Build: 246, 393.6, 328 and 196.8 px (1/2, 4/5, 2/3 and 2/5 of the 492 px padded width), radius 4: 25, 24, 16 and 24 px short
   - Cause: packages/topclassui/src/components/dialog/dummy/playground.tsx:18-21: w-1/2, w-4/5, w-2/3 and w-2/5 inside the p-3.5 box
   - Fix: Use the drawn widths, each with max-w-full: w-67.75, w-104.5, w-86, w-55.25
6. **[low] Every state, the thumbnails' page and bars**
   - Frame: Each 132x72 thumbnail is drawn on base/page: rgb 6 under the scrim, with neutral/soft bars at rgb 18, the same as the stage
   - Build: The thumbnail has no fill, so the scrim lies on the card surface: backdrop rgb 13. The bars are bg-surface-raised (lab 15.2), about rgb 22 under the scrim. The thumbnails read lighter and flatter than the stage
   - Cause: packages/topclassui/src/components/dialog/dummy/states.tsx:14: CELL has no background. :15: BAR = 'min-h-2 rounded-chip bg-surface-raised'. The stage's playground.tsx:12 already uses bg-neutral-soft
   - Fix: states.tsx:14: add bg-page to CELL. :15: change bg-surface-raised to bg-neutral-soft
7. **[low] Every state, row height and caption gap**
   - Frame: States section 142 px. The 72 px thumbnails overflow a 58 px row by 7 px on each side, and captions sit 9 px under the row (2 px under the thumbnail, 67 px below the row top)
   - Build: States section 163 px (+21). The thumbnails are in flow at 72 px, and captions sit 10 px under them (82 px below the row top)
   - Cause: packages/topclassui/src/components/dialog/dummy/states.tsx:14 CELL 'relative h-18 ...' and the closed cell's 'grid h-18' at :54 take their full 72 px inside STATE_BOX (apps/docs/components/classes.ts:224). STATE_CELL (:222) adds gap-2.5
   - Fix: Add -my-1.75 to CELL and use h-14.5 for the closed cell at :54, so each thumbnail overflows a 58 px row as drawn. Captions then sit about 68 px down, and the section is about 149 px
8. **[low] code part, the multi-line import**
   - Frame: The whole import block (150:1040) is muted #a1a1a1, including 'DialogBody, DialogClose, ...' and the '}' of '} from'
   - Build: Only lines that open with a keyword are muted. 'DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle,', 'DialogTrigger,' and the '}' of '} from' are body (lab 98.26, rgb 250), brighter than the 'import { Button }' line above them (rgb 161)
   - Cause: apps/docs/app/globals.css:337 mutes plain tokens only in a line whose first token has the keyword colour (#51A2FF). Continuation lines start with plain text, so they fall back to :336 (body)
   - Fix: Mark every line of an import statement, from its 'import' line through its 'from' line, with a small Shiki line transformer in the flat-code renderer that sets data-import. Then mute plain tokens on those lines: .docs-flat-code .shiki > span[data-import] > span[style*='#D4D4D4'] { color: var(--tc-muted) }

## /en/docs/components/drawer: differs (8)

Note: Checked against the frame PNG, design context (138:2019, 138:2079, 138:2091), metadata of 138:1976, the capture and the probe. My crops: skeptic/drw-stage.png, drw-states.png, drw-code.png. 8 of 9 claims hold. The Try it claim is refuted by docs-site.md:2359. One correction: the drawer's x is rendered at drawer/client.tsx:78 (<DrawerClose className={DRAWER_X[placement]} />) and the grabber at :76. Line :51 is only the doc comment.

1. **[low] Every state, side sheets (side sheet, dragging, focus trapped)**
   - Frame: A 56x72 sheet (42% of the 132 px box), with 'sheet' in 8 px mono at padding 8 and no x
   - Build: An 80x72 sheet (61% of the box), with 'sheet' in 12 px at padding 12 top / 10 start, and a 24 px x box (16 px glyph) beside it
   - Cause: packages/topclassui/src/components/drawer/dummy/states.tsx:41 'max-h-full w-20 *:first:not-last:pe-8' (97e44aa5 widened 64 to 80 px to keep the label beside the x). DrawerPopup always renders its x (drawer/client.tsx:78), and DrawerHeader has no closeButton prop
   - Fix: Draw the strip's sheets as pictures, as command/dummy/states.tsx does: aria-hidden divs with the sheet's classes, w-14, p-2, no x. Or record in DECISIONS that a drawn sheet keeps the library's x, which forces 80 px
2. **[low] Every state, bottom sheet**
   - Frame: A 132x27 strip at the bottom (38% of the box height), with 'sheet' in 8 px at padding 8, no grabber and no x
   - Build: A 132x58 strip (81% of the 72 px box): a 36x4 grabber (margins 10 and 4), 'sheet' in 12 px at padding 12/10, and a 24 px x box
   - Cause: packages/topclassui/src/components/drawer/dummy/states.tsx:72-82 renders a live DrawerPopup placement="bottom". The grabber comes from drawer/client.tsx:76 (DRAWER_GRABBER, classes.ts:73) and the x from client.tsx:78
   - Fix: A pictured 132x27 strip (h-6.75, p-2, no grabber or x), as for the side sheets. Or a DECISIONS record that the strip shows the library's bottom sheet
3. **[low] Every state, 'dragging' cell**
   - Frame: The sheet in place at 75% opacity (138:2093 opacity-75), so the bars show through it (sheet rgb 30 against 38)
   - Build: The sheet moved 8 px toward the inline end at full opacity (sheet rgb 38), so it looks like 'side sheet' with its x pushed to 4 px from the cell edge
   - Cause: packages/topclassui/src/components/drawer/dummy/states.tsx:29 DRAGGING = 'translate-x-[calc(0.5rem*var(--tc-dir))]'. Commit 040c7702 calls this 'as the frame does', but the frame draws opacity, not a move. No DECISIONS entry records it
   - Fix: DRAGGING = 'opacity-75', as drawn
4. **[low] Every state, 'closed' cell**
   - Frame: 'Open' 53x29: surface fill rgb 23, line border rgb 38, 12 px medium
   - Build: 62x32: transparent, border rgb 161 (line-strong), 14 px
   - Cause: packages/topclassui/src/components/drawer/dummy/states.tsx:59 <Button variant="outline" size="sm">. Its border comes from button/variants.ts:33 border-line-strong
   - Fix: states.tsx:59: size="xs" className="bg-surface border-line", as the site's Copy button does
5. **[low] stage, page bars behind the scrim**
   - Frame: 4 bars of 216, 333, 274 and 176 px (8 px tall, radius 3) in the 420 px box
   - Build: 196, 313.6, 261.3 and 156.8 px (fractions of the 392 px padded width), radius 4: 20, 19, 13 and 19 px short
   - Cause: packages/topclassui/src/components/drawer/dummy/playground.tsx:19-22: w-1/2, w-4/5, w-2/3 and w-2/5 inside p-3.5
   - Fix: Use the drawn widths, each with max-w-full: w-54, w-83.25, w-68.5, w-44
6. **[low] Every state, the thumbnails' page and bars**
   - Frame: Each thumbnail is drawn on base/page (rgb 6 under the scrim) with neutral/soft bars (rgb 18 under the scrim)
   - Build: No page fill: the backdrop is rgb 13 (card surface under the scrim), and the bars are surface-raised (about rgb 22). The thumbnails read lighter than drawn
   - Cause: packages/topclassui/src/components/drawer/dummy/states.tsx:11: CELL has no background. :12: BAR uses bg-surface-raised
   - Fix: Add bg-page to CELL at :11, and change BAR at :12 to bg-neutral-soft
7. **[low] Every state, row height and caption gap**
   - Frame: States section 142 px: the 72 px thumbnails overflow a 58 px row by 7 px, and captions sit 2 px under them (67 px below the row top)
   - Build: States section 163 px (+21): thumbnails in flow at 72 px, and captions 10 px under them (82 px below the row top)
   - Cause: packages/topclassui/src/components/drawer/dummy/states.tsx:11 CELL h-18 and the closed cell's h-18 at :57 take their full height in STATE_BOX (apps/docs/components/classes.ts:224), with gap-2.5 from STATE_CELL (:222)
   - Fix: Add -my-1.75 to CELL and use h-14.5 for the closed cell at :57. The section becomes about 149 px
8. **[low] code part, the multi-line import**
   - Frame: Every import line is muted (150:1056). The frame's imports are single lines, so all their plain tokens are muted
   - Build: 'DrawerBody, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle,', 'DrawerTrigger,' and the '}' of '} from' are body (rgb 250), while '{ Button }' on the line above is muted (rgb 161)
   - Cause: apps/docs/app/globals.css:337 mutes plain tokens only in a line that starts with the keyword colour
   - Fix: The import-line marking described under dialog

## /en/docs/components/dropdown: differs (8)

Note: Checked against the frame PNG, design context (138:1497, 138:1585), the capture, the probe, dd-states.json, and a fresh live probe (skeptic/check.mjs). The probe confirms the stage grid has 2 children (the w-55 box and Base UI's static 0 px div[data-base-ui-portal]), grid-template-rows '151.5px 119.5px', and the box 59.75 px into the 271 px stage. The probe also found the stage's menu holding document.activeElement on load. 8 of 9 claims hold, two of them corrected: the full-card capture blank is a capture artifact, and the tone select changes nothing at all. The Try it claim is refuted by docs-site.md:2359. Pixel samples: frame icons rgb 161/146 (Settings 73,146,231; Delete 228,92,95), build icons 250/228/230 (Delete 220,90,93); frame trigger fill rgb 23 with a rgb 38 edge. The missing caret-right on Duplicate is the submenu API refuted in the first audit, so it is not counted.

1. **[medium] Every state, open cells: form and height**
   - Frame: Open, hover item and disabled item draw the 134x76 panel alone, centred on a 58 px row (overflowing 9 px each side). The closed trigger is centred on the same row. The states section is 142 px
   - Build: Every cell, closed included, is a 152x144 box (h-36 w-38, pt-2): the Actions trigger at its top, with the menu (136x80) hanging 6 px below. The states section is 235 px (+93), and captions sit 154 px below the row top (frame 67). The full-card capture r13/card-dropdown.png shows the four triggers and no menus: DROPDOWN_POSITIONER hides a menu whose trigger is outside the viewport, and Playwright's element shot paints beyond the viewport. A reader who scrolls the strip into view does see the menus (a2/dd-states-2x.png)
   - Cause: packages/topclassui/src/components/dropdown/dummy/states.tsx:13 cell 'relative flex h-36 w-38 justify-center overflow-hidden pt-2 [contain:paint]', used by every cell (:34 too), and :17-27 Open (trigger plus anchored DropdownPopup). The capture blank comes from packages/topclassui/src/components/dropdown/classes.ts:8 'data-anchor-hidden:invisible'
   - Fix: Draw the open, hover item and disabled item cells as pictures of the panel alone, as command/dummy/states.tsx does: an aria-hidden div with the DROPDOWN_POPUP surface classes, and rows with DROPDOWN_ITEM plus data-highlighted / data-disabled, with no trigger and no anchoring. Give every cell h-14.5 (58 px), with the 80 px panel overflowing and the closed trigger centred. No capture then depends on scroll position
2. **[medium] stage, vertical position of trigger and menu**
   - Frame: Trigger and menu form one 220x182 group, centred in the 311 px stage: trigger top at 64.5, and 64.5 px left below the menu
   - Build: Horizontal centring is right (x 231 of 682). The trigger top is at 79.8 and the menu bottom at 269, leaving 80 px above and 42 below: the 189 px group sits 19 px below centre
   - Cause: packages/topclassui/src/components/dropdown/dummy/playground.tsx:19 'relative grid min-h-67.75 w-full place-items-center' centres only the 32 px w-55 box. Base UI appends its portal node (div[data-base-ui-portal], static, 0 px; seen in the live DOM) to the same grid, so the two stretched auto rows are 151.5 and 119.5 px. The trigger therefore lands 59.75 px into the 271 px box
   - Fix: playground.tsx:19: replace place-items-center with 'place-content-center justify-items-center'. :20: 'w-55' becomes 'h-47 w-55' (32 px trigger + 6 px offset + 151 px menu). The trigger then sits about 61.5 px from the stage top
3. **[medium] stage, the Actions trigger**
   - Frame: 86x29: dots-three icon at 14 px + 'Actions' at 12 px medium, gap 6, padding 10/6, surface fill rgb 23, 1 px line border rgb 38
   - Build: 76.6x32 (Button outline sm): no icon, 14 px text, transparent over the rgb 10 page, 1 px line-strong border (lab 66, rgb 161): the brightest edge on the stage
   - Cause: packages/topclassui/src/components/dropdown/dummy/playground.tsx:22 (Stage) render={<Button variant="outline" size="sm">Actions</Button>}. Its border comes from button/variants.ts:33 border-line-strong
   - Fix: <Button variant="outline" size="xs" className="bg-surface border-line"><Svg icon={dotsThree} />Actions</Button> at :22 (and :43 for the code), with import { dotsThree } from '#icons/data/dots-three.js'
4. **[medium] stage and strip, menu rows: highlight and icon colours**
   - Frame: The stage's Settings row is highlighted: 208x31, primary-soft fill, primary-on-soft text and icon (icon rgb 73,146,231). Icons on neutral rows are muted (Profile rgb 161, Duplicate 146). The strip's Edit and Delete icons are muted too (146/161)
   - Build: No row is highlighted on the stage. The Profile, Settings and Duplicate icons are body white (rgb 250/228/230), and so are the strip's Edit and Delete icons (dd-states.json: ic lab 98.26). Delete is danger (rgb 220,90,93), as drawn
   - Cause: Icons: packages/topclassui/src/components/dropdown/classes.ts:52 DROPDOWN_ICON = 'inline-flex shrink-0' sets no colour. Highlight: dropdown/dummy/playground.tsx:25 Settings has no data-highlighted
   - Fix: classes.ts:52: DROPDOWN_ICON = 'inline-flex shrink-0 text-muted group-data-highlighted:text-inherit', and let the icon inherit in DROPDOWN_ITEM_TONE.danger (:48). playground.tsx:25: add data-highlighted="" to the Settings DropdownItem in Stage, as states.tsx:48 does for 'hover item'
5. **[low] Every state, 'closed' trigger**
   - Frame: 86x29: dots-three + 'Actions' at 12 px, surface fill, quiet line border (rgb 38)
   - Build: 76.6x32: no icon, 14 px, line-strong border (rgb 161). The same trigger heads every cell
   - Cause: packages/topclassui/src/components/dropdown/dummy/states.tsx:14 const trigger = <Button variant="outline" size="sm">Actions</Button>
   - Fix: The same trigger as the stage fix: size="xs", className="bg-surface border-line", with <Svg icon={dotsThree} /> before 'Actions'
6. **[low] head, description**
   - Frame: One line in the 590 px text column. Head 79 px
   - Build: The same 84-character sentence wraps 'work.' onto a second line in the 570 px column (card 932 against 944, mode switch 224 against 217). Head 97.5 px (+18.5)
   - Cause: apps/docs/content/components/dropdown.ts:6 needs about 576 px at 14 px, more than the build's 570 px column
   - Fix: Shorten it to fit 570 px, for example 'Menu whose links render real anchors, so open-in-new-tab and middle-click work.' (79 characters)
7. **[low] stage, menu outline**
   - Frame: No ring: the panel has its line border and the overlay shadow
   - Build: A 2 px primary ring (--tc-ring) inset around the whole 220x151 menu. On load the stage menu holds document.activeElement
   - Cause: Base UI 1.8.0 MenuPopup focuses the popup on open (playground.tsx:14-15), and the popup wears FOCUS_RING_INSET (packages/topclassui/src/components/dropdown/classes.ts:23). DECISIONS.md:166 records the ring only for the strip's last menu
   - Fix: Return the focus after mount in Stage, or draw the stage menu as a picture, as in the strip fix. Otherwise record in DECISIONS that the stage shows the focused menu too
8. **[low] Try it, the tone select against the stage**
   - Frame: No tone control. The drawn Delete row is danger
   - Build: The tone select starts at 'neutral' while the stage draws Delete in danger. Neither choice changes the stage. Picking 'danger' passes danger, which is already shown. Picking 'neutral' again equals the start value, so changedProps (apps/docs/lib/usage.ts:69-70) drops it, and `tone ?? 'danger'` keeps Delete danger. The control contradicts the picture and does nothing
   - Cause: packages/topclassui/src/components/dropdown/dummy/playground.tsx:28 tone={tone ?? 'danger'} in Stage. The Demo signature at :39 has no tone default, so Try it starts from the schema default 'neutral' (apps/docs/components/previewer/playground-island.tsx:42-48)
   - Fix: Give the Demo signature tone = 'danger' at :39, so Try it starts at danger (controls.ts reads signature defaults), and drop the ?? at :28. Or hide tone through controlsHidden in apps/docs/content/components/dropdown.ts:12

## /en/docs/components/command: differs (5)

Note: Checked against the frame PNG, metadata of 138:1653, the capture and the probe. My crops: skeptic/cmd-stage2x.png and cmd-states.png. The Try it claim is narrowed to shortcut. placement, modal, loop and filter are not Command schema props, and docs-site.md:2359 records that such controls do not appear. The caption, heading-constant and row-height claims hold. One difference was added.

1. **[medium] code part, a stage-only constant printed in THE CODE**
   - Frame: The code is the usage alone: 'use client', the imports, then the component
   - Build: After the imports, THE CODE prints '// The picture's heading is the frame's 19 px; the live palette keeps the full unit its windowing counts.' and "const heading = 'flex shrink-0 items-end px-2.5 pt-1.5 pb-0.5 text-xs font-medium text-muted'". Only the stage picture uses that constant (playground.tsx:59), and the comment talks about Figma, yet both land in the sample a reader copies (2 lines plus a blank, about 61 px)
   - Cause: apps/docs/lib/sample.ts:139: pruned() keeps a declaration whenever its name appears outside its own statement. The text it searches, code.slice(0, start), still holds the declaration's own leading comment, which contains the word 'heading' (packages/topclassui/src/components/command/dummy/playground.tsx:22). So heading counts as used, while panel, search, input, list, row and escape are pruned
   - Fix: In sample.ts, run the leading-comment regex (:140) before the use test, and test against code.slice(0, start - comment.length) + code.slice(end). Add a case to apps/docs/lib/sample.test.ts. Rewording playground.tsx:22 to avoid the word 'heading' is only a stop-gap
2. **[low] Try it column, shortcut**
   - Frame: A shortcut select showing 'Ctrl K' (138:1721), between placement and the toggles
   - Build: No shortcut control. Only visibleRows = 7 and a defaultOpen checkbox
   - Cause: shortcut is a real schema prop (packages/topclassui/src/components/command/schema.ts:18, z.string().min(1).nullable(), default 'k'), but apps/docs/scripts/lib/controls.ts:22-49 returns null for a free string. Content files can only reorder or hide controls (apps/docs/scripts/lib/content.ts:33-35)
   - Fix: Add a content-file field for a fixed option list (for example controlOptions: { shortcut: ['k', 'p', '/'] }) to scripts/lib/content.ts. Turn it into a select in controls.ts, and fill it in apps/docs/content/components/command.ts
3. **[low] code part, caption row**
   - Frame: A one-line caption: 'Loaded with React.lazy and mounted on first open, so it is never in the initial bundle.' (10 px medium, sentence case, 471x12)
   - Build: 'THE CODE' (12 px medium, uppercase)
   - Cause: apps/docs/components/previewer/playground-island.tsx:102 and previewer.tsx:131 always render labels.theCode
   - Fix: The optional codeCaption content field described under dialog, filled in apps/docs/content/components/command.ts
4. **[low] Every state, row height**
   - Frame: The states section is 142 px. The 67 px panels overflow a 58 px row by 4.5 px, and captions sit 67 px below the row top
   - Build: The states section is 171 px (+29). Each cell is min-h-20 (80 px) with the 68 px panel centred in it, and captions sit 90 px below the row top
   - Cause: packages/topclassui/src/components/command/dummy/states.tsx:50 CELL = 'grid min-h-20 place-items-center'
   - Fix: CELL = 'grid h-14.5 place-items-center' (58 px), so the 68 px panels overflow as drawn. Captions then sit about 68 px down, and the section is about 149 px
5. **[low] (added by verifier) stage, search row: the query's distance from the icon**
   - Frame: Magnifying glass 14 px at x 14, then 'but' at x 38 in the row (gap 10, no padding): the text starts 39 px from the panel edge
   - Build: 16 px icon at 15 px from the panel edge, gap 10, then an input span with px-2. 'but' starts 49 px from the panel edge, 10 px further right than drawn
   - Cause: packages/topclassui/src/components/command/dummy/playground.tsx:19 input = '... flex-1 items-center px-2 ...', copied from the live COMMAND_INPUT at packages/topclassui/src/components/command/classes.ts:31 ('... px-2 ...'). COMMAND_SEARCH (:27) already supplies the gap-2.5
   - Fix: Replace px-2 with pe-2 (no start padding) in COMMAND_INPUT at classes.ts:31 and in the picture's input at playground.tsx:19, so the query starts 10 px after the icon as drawn

## Refuted by the second reviewer (do not act)

- /en/docs/components/dialog, Try it column, the control list (size, placement, dismissible, modal, scrollBody): Recorded at docs/figma/docs-site.md:2359-2362: 'The Try it lists above are not built as drawn: the controls come from each schema (S7)'. Dialog's schema holds size and closeButton, which is what the build shows, so the reviewer's claim that nothing records this is wrong.
- /en/docs/components/drawer, Try it column (side = inline-end, size, dismissible, snapPoints, swipeToClose): Recorded at docs-site.md:2359 (controls come from the schema). The build's placement = end is the same prop, named as R-5.3-4 requires, and snapPoints, dismissible and swipeToClose are not Drawer props.
- /en/docs/components/dropdown, Try it column (placement, size, sideOffset, modal, loop, closeOnSelect): Recorded at docs-site.md:2359: Dropdown's schema has placement, tone, delay and closeDelay (the last two hidden in content/components/dropdown.ts:12). size, sideOffset and closeOnSelect have no prop, and modal and loop are not schema props. The tone mismatch is kept as its own row.
- /en/docs/components/command, Try it column: placement = center and the modal, loop and filter checkboxes: Not Command schema props (schema.ts has visibleRows, virtualize, shortcut, defaultOpen, loadMoreThreshold), so docs-site.md:2359 covers their absence. Only the missing shortcut control, a real schema prop, is kept.
