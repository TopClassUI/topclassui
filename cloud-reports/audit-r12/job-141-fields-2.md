# Figma audit 2, job 141 fields-2

Second audit on preview/r8-all 694273fe at 1440 dark: every first-audit row re-checked (still open) plus a fresh pass (new), each re-checked by a second reviewer. Close every row or record why it stays.

## /en/docs/components/input: differs (4)

Note: Verifier: I checked all four claims against 135:531 (get_metadata and get_design_context on 135:571), crops in r12-review/job-141-fields-2-verify/ (input-playcol, input-note, input-states) and my own Playwright measure of :4620 (m-input.txt). All four are real. One cause line was wrong: try-it-control.tsx has 102 lines, and the xs Checkbox is at :35. I added nothing new. The stage, head and code parts differ only in recorded ways.

1. **[medium] (still open) Try it controls and play-row height**
   - Frame: playground 248x336 (135:571): selects for variant (outline), size (md) and type (text), each 208x29 at a 61 px pitch, then 4 checkboxes (disabled, invalid, required, fullWidth) on a 25 px pitch
   - Build: Only the size select (211x28), then the 4 checkboxes. Play row 216 px (y 82 to 298). The stage reserves 136 px (8.5rem).
   - Cause: apps/docs/content/components/input.ts:13 stageHeight: 8.5, :15 controlOrder and :16 extraSwitches. packages/topclassui/src/components/input/schema.ts declares only size, invalid and fullWidth, so it offers no variant or type to generate a select from.
   - Fix: Set stageHeight: 21 (336 px) in input.ts. Add type as a select (text, email, password, search, tel, url, number), either as a content-level extra select or as a z.enum in input/schema.ts. Add a variant prop, or write a docs/DECISIONS.md entry that drops the frame's variant select.
2. **[low] (new) Try it, checkbox rows (shared, all 8 cards)**
   - Frame: The 16x16 box starts at x 19 in the 248 px column, the same x as the selects (135:594 / 135:576). The label starts 24 px from the box's start, an 8 px gap.
   - Build: The selects start at x 702 but the box is drawn at x 706 (its 24x24 button spans 702 to 726), so it sits 4 px in from the selects. The label starts at 730.
   - Cause: apps/docs/components/classes.ts:192 CHECK_ROW 'flex min-w-0 items-center gap-1 -my-[0.40625rem]' pulls the 24 px target back on the block axis only. The xs Checkbox is at apps/docs/components/previewer/try-it-control.tsx:35 (the file has 102 lines, so the reviewer's :145 does not exist).
   - Fix: CHECK_ROW = 'flex min-w-0 items-center gap-1 -my-[0.40625rem] -ms-1'. The box then lands at 702 and the label at 726, 8 px after the box.
3. **[low] (new) Every state, focus-visible, read-only and invalid values**
   - Frame: The focus-visible, read-only and invalid cells all hold 'you@mail.com'. Figma wraps it onto two lines in its 94 px text box, which is a slip.
   - Build: 'you@mail.com' measures 97.4 px at 14 px Inter in a 94 px text box (input scrollWidth 129, clientWidth 126). The focus-visible and read-only cells cut it to 'you@mail.co' plus half an m, with no ellipsis. The invalid cell holds 'you@mail'.
   - Cause: packages/topclassui/src/components/input/dummy/states.tsx:18 and :20 put defaultValue="you@mail.com" in a w-32 field (128 - 2x16 padding - 2 border = 94 px). :21 sets defaultValue="you@mail".
   - Fix: Use defaultValue="jo@mail.com" (84.9 px measured, so it fits 94 px) in all three cells, the invalid cell included, as the frame draws a full address there.
4. **[low] (new) code part, note line code words (shared)**
   - Frame: One plain 10.5 px Inter sentence (149:1087). 'id' and 'aria-label' are in the same muted Inter as the words around them.
   - Build: Size and colour match (12 px, muted L66), but 'id', 'aria-label' and 'aria-labelledby' are set in Geist Mono (code boxes 14.4, 72 and 108 px wide). The same happens on every card's note (showCount, hasMore, loadMore, TopClassProvider, readOnly={false}, maxSize).
   - Cause: apps/docs/components/classes.ts:180 NOTE_CODE '**:text-[length:inherit] **:text-muted' (applied at previewer/previewer.tsx:74) resets only size and colour. inline-text.tsx:6 still gives each code part INLINE_CODE, whose font-mono is at classes.ts:81.
   - Fix: NOTE_CODE = '**:text-[length:inherit] **:text-muted **:font-sans'

## /en/docs/components/textarea: differs (5)

Note: Verifier: I checked all five claims against 135:660 (get_metadata, and get_design_context on the states row 135:739), the crops textarea-stage, textarea-states and textarea-disabled, and m-textarea.txt. All five are real. I measured the disabled text's colour difference in pixels: the brightest text pixel is 136 in the frame and 92 in the build. I rewrote the fix for the at-limit caption: the reviewer's version would have re-centred every field in its stretched cell. I added nothing new.

1. **[medium] (still open) Try it, variant and play-row height**
   - Frame: playground 248x336 (135:699): selects for variant (outline), size (md) and maxRows (6), then autosize, showCount, disabled and invalid
   - Build: The size and maxRows selects, then the 4 checkboxes. Play row 280 px (y 82 to 362).
   - Cause: apps/docs/content/components/textarea.ts:13 stageHeight: 10 (160 px). Textarea has no variant prop.
   - Fix: Set stageHeight: 21 (336 px). Add the variant prop, or write a docs/DECISIONS.md entry that drops it.
2. **[medium] (still open) Every state, field height**
   - Frame: Each field is 126x50, padding 10/16, with one line of text (135:742 and the rest: h-50)
   - Build: Each field is 128x62: two 20 px rows, 20 px of padding and 2 px of border. The at-limit field is 62 px too.
   - Cause: packages/topclassui/src/components/textarea/dummy/states.tsx:16-22 put rows={2} on all six Textareas
   - Fix: Use rows={1} (42 px) on all six. If the lint allows a height in a dummy file, also add h-12.5 (50 px) to CELL, HOVER and RING (states.tsx:4, 7, 10).
3. **[low] (still open) stage, resize grip**
   - Frame: A 300x78 field with no resize grip (135:694), then '42 / 500' 6 px below it
   - Build: A 193.2x82 field with the value on two lines and the counter 6 px below (both match), but the computed resize is vertical, so a grip is drawn in the bottom-end corner
   - Cause: packages/topclassui/src/components/textarea/dummy/stage.tsx:5 passes no resize class, so TEXTAREA_RESIZE.plain 'resize-y disabled:resize-none' applies (textarea/classes.ts:20)
   - Fix: Add className="resize-none" to the stage Textarea in dummy/stage.tsx:5
4. **[low] (new) Every state, at-limit caption**
   - Frame: All six captions sit on one line, 9 px under the 56 px box (y 65 in each cell). The at-limit cell draws no counter.
   - Build: The bold '7 / 7' counter (a 16 px line after a 6 px gap) grows the at-limit cell to 110 px, so 'at limit' sits at y 731.5 against 709.5 for the other five, 22 px lower
   - Cause: textarea/dummy/states.tsx:21-23 puts showCount inside the cell. apps/docs/components/classes.ts:221 STATE_GRID 'items-start' and :222 STATE_CELL 'content-start' let each caption follow its own box.
   - Fix: Put the captions of one row on one line: STATE_GRID 'items-stretch' in place of 'items-start', STATE_CELL 'grid-rows-[auto_1fr]' in place of 'content-start', and add 'self-end' to STATE_CAPTION (:225). The boxes stay on the top line and every caption drops to the tallest cell's caption line. The bold counter is the recorded at-limit signal, so it stays. rows={1} also brings the cell down to 64 px.
5. **[low] (new) Every state, disabled cell text**
   - Frame: The disabled field holds 'Message' in the body colour, with the whole field at opacity 50% (135:758/135:759). Its brightest text pixel is 136.
   - Build: The disabled field shows the placeholder 'Message' in muted L66 at 50%. Its brightest text pixel is 92, so it reads fainter than drawn.
   - Cause: textarea/dummy/states.tsx:19 uses placeholder="Message"
   - Fix: Use defaultValue="Message" in place of placeholder on the disabled Textarea

## /en/docs/components/select: differs (3)

Note: Verifier: I checked all three claims against 135:789 (get_metadata), the crops select-states, select-stage and select-play, and m-select.txt. All three are real and the reviewer's numbers hold. In each states cell the 149 px wrapper span holds a 128 px trigger at its start, so the trigger's centre (83) sits 10.5 px left of the caption's (93.5).

1. **[high] (still open) stage**
   - Frame: An open Select with no label (135:822). A 220x40 'Jordan' trigger with a 14 px caret and a 2 px ring (228x48). 6 px below it, a 220x111 popup with three 208x31 rows inset 7 px on a 33 px pitch: Jordan selected (primary-soft fill, primary-on-soft text, 14 px check), Egypt, Morocco.
   - Build: A closed 193.2x40 'Jordan' trigger under a 'Country' label (53.1x20, 14 px regular), 6 px above it. No popup. The list behind it has 4 items, Saudi Arabia added.
   - Cause: apps/docs/content/components/select.ts sets no stageDemo or stageOpen. packages/topclassui/src/components/select/dummy/playground.tsx:14-16 renders a label and a closed Select over COUNTRIES (:4-9, four items).
   - Fix: Add select/dummy/stage.tsx: the live closed trigger (aria-label 'Country', no visible label, items Jordan, Egypt and Morocco, defaultValue 'jo', the states RING), above a static aria-hidden, inert picture of the open list built from SELECT_POPUP, SELECT_LIST and SELECT_ITEM with ROW_SELECTED on Jordan. Then set stageDemo: 'stage' in select.ts. Otherwise write a DECISIONS.md entry that keeps the list closed.
2. **[medium] (still open) Try it, variant and play-row height**
   - Frame: playground 248x336 (135:837): selects for variant (outline), size (md) and placement (bottom-start), then disabled, invalid, required and fullWidth
   - Build: The size and placement selects, then the 4 checkboxes. Play row 280 px (y 99.5 to 379.5).
   - Cause: apps/docs/content/components/select.ts:13 stageHeight: 7.5 (120 px). Select has no variant prop.
   - Fix: Set stageHeight: 21 (336 px). Add variant, or write a DECISIONS.md entry that drops it.
3. **[medium] (new) Every state, trigger position in each cell**
   - Frame: Each 128x40 trigger is centred in its 151 px cell (x 11.5), with its caption centred under it
   - Build: Each 128x40 trigger starts at the inline start of its 149 px cell: idle at x 19.0 in a cell at 19.0, hover at 168 in a cell at 168, and so on. In all six cells the trigger's centre is 10.5 px left of its caption's centre.
   - Cause: select/dummy/states.tsx:6, :9 and :12 put w-32 on the trigger (className reaches the trigger at select/client.tsx:70). The wrapper span (SELECT_ROOT, select/classes.ts:8, with FIELD_HOLDER from shared/classes.ts:247: w-fit max-w-full grid-cols-[minmax(0,var(--tc-input-width))]) fills the 149 px box, and the trigger sits at the start of its track.
   - Fix: Add justify-self-center to the three constants in select/dummy/states.tsx: CELL = 'w-32 justify-self-center', HOVER = 'w-32 justify-self-center border-body', and the same in RING.

## /en/docs/components/combobox: differs (7)

Note: Verifier: I checked all six claims against 135:939 (get_metadata, and get_design_context on the empty cell 135:1056), the crops combobox-states, combobox-stage and combobox-empty, a 2x Playwright shot (b2-combobox-states.png) and m-combobox.txt. All six are real. Measured: the placeholder is 129.0 px in a 119 px content box, and the description is 587.1 px in a 570 px column. In the glass claim, the text offset (37 against 39) is within 2 px; only the glass's 5 px is out. I added the font of 'no matches'. The values in the 1x capture look bold, but the computed weight is 400 and the 2x shot reads regular, so that is hinting.

1. **[high] (still open) stage**
   - Frame: An open Combobox with no label (135:972). A 230x40 input with the glass at x 17, the typed 'jor' at x 39 and a 2 px ring (238x48). 6 px below it, a 230x78 popup with two 218x31 rows inset 7 px: Jordan selected (primary-soft fill, check) and Jordan Valley.
   - Build: A 'Framework' label (74.9x20, 14 px medium) over a closed 193.2x40 input with the placeholder 'Search frameworks'. No popup.
   - Cause: apps/docs/content/components/combobox.ts sets no stageDemo or stageOpen. packages/topclassui/src/components/combobox/dummy/playground.tsx:20-23 renders the label and a closed field.
   - Fix: Add combobox/dummy/stage.tsx: the live input (aria-label 'Country', defaultInputValue 'jor', the states RING) above a static aria-hidden, inert picture of the open list (COMBOBOX_POPUP rows: Jordan, selected with ROW_SELECTED, and Jordan Valley). Then set stageDemo: 'stage' in combobox.ts, or write a DECISIONS.md entry that keeps it closed.
2. **[medium] (still open) head, description**
   - Frame: One line in the 590 px column (135:947); head 79 px
   - Build: Two lines, with 'nothing.' alone on the second: the sentence measures 587.1 px at 14 px Inter in the 570 px column. Head 97.5 px.
   - Cause: apps/docs/content/components/combobox.ts:9 uses the frame's own sentence in a column 20 px narrower than the frame's
   - Fix: Shorten en (and ar), for example 'A text input that filters a listbox; it calls loadMore() for the next page, caches nothing.' (562.5 px measured)
3. **[medium] (still open) stage, placeholder clipped**
   - Frame: The text runs to 17 px from the inline end (text 39 to 213 in the 230 px input)
   - Build: 'Search frameworks' (129.0 px) is cut to 'Search framework' with no ellipsis. The input keeps 36 px of end padding (padding 0 36px) with no spinner showing, which leaves 119 px for text.
   - Cause: packages/topclassui/src/components/combobox/classes.ts:17 COMBOBOX_INPUT_END 'pe-9', applied unconditionally at combobox/client.tsx:88
   - Fix: Apply COMBOBOX_INPUT_END only while status === 'loading'. Otherwise the size's own 16 px end padding applies and the text gets 139 px.
4. **[medium] (still open) Try it, variant and play-row height**
   - Frame: playground 248x336 (135:985): selects for variant (outline), size (md) and visibleRows (7), then disabled, invalid, fullWidth and hasMore
   - Build: The size and visibleRows selects, then the 4 checkboxes. Play row 280 px (y 99.5 to 379.5).
   - Cause: apps/docs/content/components/combobox.ts:13 stageHeight: 7.5. Combobox has no variant prop.
   - Fix: Set stageHeight: 21 (336 px). Add variant, or write a DECISIONS.md entry that drops it.
5. **[low] (still open) stage and cells, glass position**
   - Frame: Glass 17 px from the input's edge (135:974, 135:1029), text at 39 px
   - Build: Glass 12 px from the edge: 221.5 - 209.5 in the stage, 41.5 - 29.5 in the idle cell. Text at 37 px, which is within 2 px.
   - Cause: combobox/classes.ts:20 COMBOBOX_SEARCH 'inset-s-3' and :16 COMBOBOX_INPUT_START 'ps-9'
   - Fix: inset-s-4 for the glass (16 px) and ps-9.5 for the text (38 + 1 border = 39), which puts the text 8 px after the 14 px glass
6. **[low] (new) Every state, empty cell caption**
   - Frame: The 128x57 group (a 40 px field, a 5 px gap and the 'no matches' line) sits in the 56 px box, so 'empty' stays on the row's caption line (y 65)
   - Build: The group is 60 px (40 + a 4 px gap + a 16 px line), so the cell is 86 px tall and 'empty' sits at y 725 against 721 for the other five: 4 px lower
   - Cause: combobox/dummy/states.tsx:25-27: 'grid justify-items-center gap-1' around a span with 'text-xs text-muted' on a 16 px line
   - Fix: Use 'grid justify-items-center gap-0.5' and 'font-mono text-xs/3.5 text-muted' on the span (40 + 2 + 14 = 56 px), which also fixes the font (next row)
7. **[low] (added by verifier) Every state, empty cell 'no matches' font**
   - Frame: 'no matches' is Roboto Mono 9 px muted (135:1061), in the same mono as the captions, centred 5 px under the field
   - Build: 'no matches' is Inter 12 px muted (66x16), a sans line that reads like body text
   - Cause: combobox/dummy/states.tsx:27 <span className="text-xs text-muted">
   - Fix: className="font-mono text-xs/3.5 text-muted" (with gap-0.5 on the group, as in the row above)

## /en/docs/components/segmented-control: differs (5)

Note: Verifier: I checked the claims against 138:668 (get_metadata, and get_design_context on the states row 138:751), the crop segmented-control-states, m-segmented-control.txt and pixel samples of the track line. Five of the six rows are real. I refuted the stage-icon row: the icons are 12 px in the build against 14 px in the frame, a 2 px difference. The disabled row is confirmed by pixels: the track's line is 30 in the frame's disabled cell and 38 (full strength) in the build's. I gave the disabled fix a guard against dimming twice.

1. **[medium] (still open) head, description**
   - Frame: One line in the 590 px column (138:676); head 79 px
   - Build: Two lines, with 'RTL.' alone on the second: the sentence measures 572.2 px in the 570 px column. Head 97.5 px.
   - Cause: apps/docs/content/components/segmented-control.ts:6 uses the frame's sentence in a column 20 px narrower than the frame's
   - Fix: Shorten en (and ar), for example 'A radio group drawn as one track; arrows select as they move, and reverse in RTL.' (545.2 px measured)
2. **[medium] (still open) Try it, tone and orientation**
   - Frame: Selects for size (md), tone (neutral) and orientation (horizontal), then fullWidth, invalid and disabled (138:714)
   - Build: The size select, then fullWidth, invalid and disabled. The play row is 311 px, which matches.
   - Cause: SegmentedControl has no tone or orientation prop (segmented-control/schema.ts), and no DECISIONS.md entry drops them
   - Fix: Add the props, or write a DECISIONS.md entry that drops the frame's tone and orientation selects
3. **[low] (still open) head, title**
   - Frame: 'SegmentedControl' (138:673)
   - Build: 'Segmented control'
   - Cause: apps/docs/content/components/segmented-control.ts:4 title.en
   - Fix: Set title.en to 'SegmentedControl', or record the site's word-title rule in DECISIONS.md. The frames mix the two forms: 'Date picker' and 'File upload' are words.
4. **[low] (still open) Every state, selection in hover, focus-visible and disabled**
   - Frame: The hover, focus-visible and disabled tracks have no selected segment: A and B are both regular, muted and unfilled (138:763, 138:771, 138:788). Only idle and checked fill A (surface-raised, medium, body).
   - Build: A is selected (L15 fill, medium weight, body colour) in all five cells
   - Cause: packages/topclassui/src/components/segmented-control/dummy/states.tsx:15, :19 and :27 set defaultValue="a". The types require a value (segmented-control/types.ts:17), and the reason sits in a code comment, not a DECISIONS entry.
   - Fix: Write a DECISIONS.md entry ('a track always has a selected segment; the strip draws A selected in every cell'), or draw those three cells as static pictures
5. **[low] (new) Every state, disabled cell**
   - Frame: The whole track is at 50% opacity (138:787: opacity-50 on the Segmented frame): its line, its fill and both segments. The line's pixel value is 30.
   - Build: Only the two segments are at 50% (opacity on each button[radio]). The root's opacity is 1, so its 1 px L15 line stays at full strength (pixel value 38, the same as idle).
   - Cause: segmented-control/classes.ts:35 puts DISABLED on SEGMENTED_ITEM. SEGMENTED_ROOT (:16) has no disabled look.
   - Fix: Add data-disabled:opacity-50 to SEGMENTED_ROOT, and stop the items dimming again inside a disabled root (for example in-data-disabled:opacity-100 on SEGMENTED_ITEM), so a single disabled segment still dims on its own

## /en/docs/components/rating: differs (2)

Note: Verifier: I checked both claims against 137:2617 (get_metadata), the crops rating-play and rating-states, and m-rating.txt. Both are real. In the hover and focus-visible cells each star sits in a 24 px label on a 28 px pitch, so those rows are 136 px wide against 96 px for the other four (87 px in the frame).

1. **[medium] (still open) Try it controls and play-row height**
   - Frame: playground 248x311 (137:2684): selects for max (5), size (md) and precision (half), then readOnly (checked), showValue and allowClear
   - Build: The max and size selects, then readOnly (checked). Play row 205 px (y 99.5 to 304.5).
   - Cause: apps/docs/content/components/rating.ts:13 stageHeight: 8 (128 px). rating/schema.ts has no precision, showValue or allowClear.
   - Fix: Set stageHeight: 19.4375 (311 px). Add the three props, or write a DECISIONS.md entry that drops them.
2. **[medium] (new) Every state, hover and focus-visible cells**
   - Frame: All six rows have 15 px stars 3 px apart, each row 87x15 (137:2768, 137:2782)
   - Build: The empty, partial, full and read-only rows are 96 px (16 px stars, 4 px gap). The hover and focus-visible rows are editable radio groups: each 16 px star sits in a 24x24 label on a 28 px pitch, so each row is 136 px wide with 12 px between stars.
   - Cause: packages/topclassui/src/components/rating/dummy/states.tsx:14-15 set readOnly={false} on the hover and focus-visible Ratings (24 px targets, R-5.6-2)
   - Fix: Draw both cells as pictures, like the other four. :14 becomes <div role="group" aria-label="hover" className="flex"><Rating size="xs" value={4} /></div>, and :15 becomes <div role="group" aria-label="focus-visible" className="flex"><Rating size="xs" value={3} className={RING} /></div>, so RING's *:nth-3 rings the third star.

## /en/docs/components/date-picker: differs (5)

Note: Verifier: I checked all five claims against 137:2825 (get_metadata), the crops date-picker-states, date-picker-head and date-picker-play, and m-date-picker.txt. All five are real. The site's provider gets locale 'en' (app/(site)/[locale]/layout.tsx:45), which formats month-first. firstDayOfWeek is bounded 1 to 7 (date-picker/boundaries.ts:6-7), so .int() makes it a 7-option select.

1. **[high] (still open) stage**
   - Frame: The open calendar panel alone, with no trigger (137:2858): 270x159, padding 15, 10 px between the 17 px header and the grid. 'September 2026' between 15 px carets, M to S weekday row, 34 px columns, 22 selected as a primary-solid pill.
   - Build: A 'Check-in' label (59.8x20, 14 px regular) over a closed 193.2x40 trigger showing 'Sep 22, 2026' with a 14 px calendar icon. No calendar.
   - Cause: apps/docs/content/components/date-picker.ts sets no stageDemo or stageOpen. packages/topclassui/src/components/date-picker/dummy/playground.tsx:8-9 renders a label and the trigger. The root hardcodes modal="trap-focus" (date-picker/client.tsx:38), so a calendar open on load would trap the page's focus.
   - Fix: Add date-picker/dummy/stage.tsx that draws the frame's panel as a static aria-hidden picture from the calendar's own class constants, and set stageDemo: 'stage'. Otherwise write a DECISIONS.md entry that keeps the closed trigger.
2. **[medium] (still open) head, description**
   - Frame: One line in the 590 px column (137:2833); head 79 px
   - Build: Two lines, with 'digits.' alone on the second: the sentence measures 578.4 px in the 570 px column. Head 97.5 px.
   - Cause: apps/docs/content/components/date-picker.ts:9 uses the frame's sentence in a column 20 px narrower than the frame's
   - Fix: Shorten en (and ar), for example 'A lazy calendar popover that formats dates with the provider’s locale and digits.' (526.1 px measured)
3. **[medium] (still open) Try it controls and play-row height**
   - Frame: playground 248x336 (137:2940): selects for mode (single), placement (bottom-start) and firstDayOfWeek (1), then disabled, invalid, clearable (checked) and showWeekNumbers
   - Build: A size select first, then placement, then firstDayOfWeek as a 172 px slider with '1' at its end, then disabled and invalid. Play row 290 px (y 99.5 to 389.5).
   - Cause: packages/topclassui/src/components/date-picker/schema.ts:29: firstDayOfWeek is z.number() without .int(), so apps/docs/scripts/lib/controls.ts makes it a slider. date-picker.ts:14 puts size first, and date-picker.ts:13 sets stageHeight: 7.5. mode, clearable and showWeekNumbers are not props.
   - Fix: Add .int() to firstDayOfWeek (its 1 to 7 range becomes a select). Add 'size' to controlsHidden. Set stageHeight: 21. Write a DECISIONS.md entry for mode, clearable and showWeekNumbers, or add them.
4. **[low] (still open) Every state, trigger width**
   - Frame: Every trigger is 128x40, centred in its 151 px cell, about 23 px from its neighbours
   - Build: The 'Pick a date' triggers are 128.8x40. The open, selected and today triggers are 145.3x40 ('Sep 22, 2026' is 89.3 px), so they nearly fill their 149 px cells and leave 3.7 px between neighbours.
   - Cause: packages/topclassui/src/components/date-picker/dummy/states.tsx:11-16 set fullWidth inside the shrink-to-fit STATE_BOX. The job's reason for keeping it (w-32 would truncate the date, R-5.2-7) is not in DECISIONS.md.
   - Fix: Write a DECISIONS.md entry that keeps the content width, or use className="w-32" and accept the ellipsis
5. **[low] (still open) stage and states, date format**
   - Frame: '22 Sep 2026'
   - Build: 'Sep 22, 2026'
   - Cause: apps/docs/app/(site)/[locale]/layout.tsx:45 passes locale 'en' to TopClassProvider, and Intl formats 'en' month-first
   - Fix: Give the en site's provider the en-GB locale, or write a DECISIONS.md entry that keeps the en default

## /en/docs/components/file-upload: differs (6)

Note: Verifier: I checked all six claims against 137:3043 (get_metadata, and get_design_context on the stage group 137:3076), the crops file-upload-code, file-upload-states and file-upload-stage, and m-file-upload.txt (pre scrollWidth 1001, clientWidth 894). All six are real. I lowered the stage file-row claim to low: the frame draws that row with a progress bar, and the progress bar is recorded as not built. Only the absence of any seeded row is open.

1. **[medium] (still open) Every state, cells**
   - Frame: 6 cells, '6 states': idle, drag over (primary-soft fill, dashed primary line, primary icon and 'drop'), uploading, done, error (warning-circle and 'too big') and disabled
   - Build: 2 cells, '2 states': idle and disabled, each 447 px wide. Drag over and error are missing. Uploading and done are recorded as not built.
   - Cause: packages/topclassui/src/components/file-upload/dummy/states.tsx:7-15. data-dragging comes only from the hook's state, and className lands on the root, so no demo can draw drag over at rest, and a refused row needs a held file.
   - Fix: Expose a way to draw them at rest (for example a prop that sets data-dragging on the zone, plus a static refused-row demo), or write DECISIONS.md entries for drag over and error beside the recorded uploading and done
2. **[medium] (still open) head, description**
   - Frame: One line in the 590 px column (137:3051); head 79 px
   - Build: Two lines, with 'collection.' alone on the second: the sentence measures 579.7 px in the 570 px column. Head 97.5 px.
   - Cause: apps/docs/content/components/file-upload.ts:9
   - Fix: Shorten en (and ar), for example 'A drop zone that always has a browse button; the file list is a windowed collection.' (543.8 px measured)
3. **[medium] (still open) Try it controls**
   - Frame: Selects for accept (image/*), maxSize (10MB) and maxFiles (5), then multiple (checked), disabled and showList (checked)
   - Build: maxFiles (5), then disabled and invalid. The play row is 311 px, which matches.
   - Cause: apps/docs/content/components/file-upload.ts:15 controlsHidden includes 'maxSize'. The schema has no accept or showList, and multiple is owned by maxFiles (types.ts:18). invalid is not in controlOrder (:14) but is still shown.
   - Fix: Show maxSize as a select of byte presets labelled 1MB, 5MB and 10MB (a content-level select). Hide 'invalid', or record why it stays. Write a DECISIONS.md entry for accept, multiple and showList, or add them.
4. **[medium] (still open) Every state, zone size**
   - Frame: A mini zone of 126x60 (137:3135): an 18 px icon at y 13 and a 9 px mono 'browse' at y 35
   - Build: The full 218.8x104 zone: padding 24, a 26 px icon and 'Drag files here or browse' at 14 px medium
   - Cause: file-upload/dummy/states.tsx:8-15 renders the default zone. Its padding, icon and prompt live on the zone (file-upload/client.tsx:45-50), which a caller's className cannot reach.
   - Fix: Add a compact option to FileUpload (as EmptyState's compact) and use it in the strip with className="w-32", or write a DECISIONS.md entry for the difference
5. **[medium] (new) code part, the FileUpload line**
   - Frame: The sample breaks the FileUpload props one per line, and the whole block fits within 536 px
   - Build: Line 3, '<FileUpload aria-label="Attachment" name="attachment" accept=".png,.jpg,.jpeg,.pdf" maxSize={10 * 1024 * 1024} className="w-80 max-w-full">', overflows the 894 px pre (scrollWidth 1001, clientWidth 894). It is cut at 'className="w-' and scrolls sideways.
   - Cause: packages/topclassui/src/components/file-upload/dummy/playground.tsx:8 puts every prop on one line, and apps/docs/lib/usage.ts keeps the JSX lines as written
   - Fix: Break the props of playground.tsx:8 onto their own lines (aria-label, name, accept, maxSize, maxFiles, className, {...props}), each indented under <FileUpload
6. **[low] (still open) stage, file row**
   - Frame: A 320x47 file row 10 px under the zone (137:3082): line border, radius 8, padding 10/12, a 16 px file icon, 'brief.pdf' at 14 px medium, a 200x4 progress bar and a 14 px x. The zone plus the row form a 181 px group, with the zone at y 65 in the 311 px stage.
   - Build: No file row. The 320x128 zone stands alone and is centred in the stage (y 92), 27 px lower than drawn.
   - Cause: FileUpload has no initial-files API (file-upload/types.ts omits value and defaultValue), so the stage cannot hold a picked file. The row's progress bar is recorded as not built (DECISIONS 2026-10-19, form controls).
   - Fix: Add an initial-files API so a row without progress can be seeded in dummy/playground.tsx, or write a DECISIONS.md entry that the stage stays empty until a file is picked

## Refuted by the second reviewer (do not act)

- /en/docs/components/segmented-control, (new) stage, segment icons: Within 2 px: the icons are 12x12 in the build against 14x14 in the frame (138:703), with a 6 px label gap against 5 and segments 68.1/67/77 x 28 against 70/68/78 x 27. Every gap is within 1-2 px.
