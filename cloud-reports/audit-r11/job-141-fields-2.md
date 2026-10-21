# Figma audit, job 141 fields-2

On preview/r8-all d9c04b21 at 1440 dark, frame vs build, each difference re-checked by a second reviewer. Fix what your branch has not fixed yet; skip a row your later commits already cover.

## /en/docs/components/input: differs (11)

Note: Checked against the 135:531 design context, the r11 capture and a fresh Playwright measure of the live build (v/check.mjs; crops in handoff/figma-audit/r11-review/job-141-fields-2/v/). The shell rows (radius, mode switch, Install, Try it select and checkbox, Copy, note inline code) come from the shared Previewer, so they apply to all 8 cards. They are listed in full only here. The six-cell strip wraps 5 + 1 at 1440; job 140's gap-x-0 covers that. Refuted: the card shadow, the 12 vs 10 code-part gap, the import-line styling and the caption size (see refuted). Reviewer line numbers corrected: the Inputs in states.tsx are lines 13-18.

1. **[high] stage**
   - Frame: two 190x40 fields side by side, 12 px apart, centred, with no label: one with placeholder 'Email' (14 px muted), one with the value 'you@mail.com' (14 px body)
   - Build: a 14 px medium 'Email' label over one empty 193.2x40 field (group 225x64)
   - Cause: packages/topclassui/src/components/input/dummy/playground.tsx:7-10 (a label and one Input). input.ts sets no stageDemo, so the stage shows the playground.
   - Fix: Add a dummy demo with two Inputs in a flex gap-3 row: aria-label='Email' placeholder='Email', and aria-label='Email' defaultValue='you@mail.com'. Point stageDemo at it in content/components/input.ts. The envelope icon stays out (recorded).
2. **[medium] head, description**
   - Frame: one line in a 590 px column, 14 px muted: 'A native input that ships 0 KB. It will not compile without an id or an aria-label.'; head 79 px tall
   - Build: two lines in a 556.3 px column: 'A native input that renders on the server and ships 0 KB of JavaScript. The types refuse one with no name.'; head 108 px tall
   - Cause: apps/docs/content/components/input.ts:9, a sentence of about 105 characters that cannot fit even the frame's 590 px column
   - Fix: Shorten en and ar to one line of about 80 characters, as the frame has it.
3. **[medium] Try it, controls and play-row height**
   - Frame: selects for variant (outline), size (md) and type (text), then disabled, invalid, required and fullWidth; play row 336 px
   - Build: only the size select, then the 4 checkboxes; play row 224 px (110 to 334)
   - Cause: The controls come from input/schema.ts (size, invalid, fullWidth) plus extraSwitches in content/components/input.ts:14-15. Input has no variant prop, and type is not a schema enum.
   - Fix: Add type as a select (text, email, password, search, tel, url, number), which needs a content-level extra select next to extraSwitches in apps/docs/scripts/lib/content.ts:27. For variant, either add the prop or record in DECISIONS.md that the frame's variant select is dropped.
4. **[medium] Try it, select controls (shared)**
   - Frame: 208x29, padding 6/8/6/10, value in 11 px mono, caret 13 px
   - Build: 211x32, padding 0/12, value in 14px/20 Geist Mono, caret 14 px
   - Cause: apps/docs/components/previewer/try-it-control.tsx:62-66 <Select size="sm" className="font-mono">
   - Fix: size="xs" (28 px, CONTROL_SIZE.xs) and className="font-mono text-xs". Set CONTROL_RESERVE.select to h-7 (classes.ts:181) so the reserved box matches.
5. **[medium] code part, Copy button (shared)**
   - Frame: 73x29, padding 6/10, gap 6, surface fill, line border, label 12 px medium
   - Build: 83.2x32, padding 0/12, gap 8, transparent fill, line-strong border lab(66), label 14px/20 medium
   - Cause: apps/docs/components/previewer/copy-button.tsx:49-56 <Button variant="outline" tone="neutral" size="sm">
   - Fix: When the word is shown, use size="xs" with className="shrink-0 gap-1.5 px-2.5 bg-surface": 28 px tall with a 12 px label, the same look as CODE_COPY (classes.ts:121) on the guide pages.
6. **[medium] code part, note line (shared)**
   - Frame: one plain 10.5 px muted Inter line, 13 px tall: 'Outside a Field, Input needs id or aria-label - ...', with the code words in the same muted text
   - Build: the 12 px muted note with id, aria-label and aria-labelledby set in 14px/20 Geist Mono in the body colour lab(98); the line is 20 px tall and the code words stand out (the same on every card: items, autosize, showCount, hasMore, loadMore, TopClassProvider, value, maxSize)
   - Cause: apps/docs/components/inline-text.tsx:6 applies INLINE_CODE ('font-mono text-sm text-body', classes.ts:81) inside the NOTE paragraph built at previewer.tsx:70-73
   - Fix: Make code in the note take the note's own size and colour. Add a NOTE_CODE constant on the precedent of AUTHORED_CELL (classes.ts:100), '**:text-[length:inherit] **:text-muted', to the <p> at previewer.tsx:70.
7. **[medium] Every state, field size**
   - Frame: each field 128x40, centred in a 151 px cell
   - Build: each field fills its cell, 159.6x40 (the invalid one is 225x40 on the wrapped row)
   - Cause: packages/topclassui/src/components/input/dummy/states.tsx:13-18 sets fullWidth on every Input
   - Fix: Replace fullWidth with className="w-32" (128 px) on the six Inputs.
8. **[low] card frame, corner radius (shared, all 8 cards)**
   - Frame: 16 px corner (rounded-[16px] on 135:531)
   - Build: 12 px (rounded-box), measured on article[data-component]
   - Cause: apps/docs/components/classes.ts:127 CARD 'rounded-box', which :129 PREVIEWER reuses as `${CARD} shadow-md`
   - Fix: Give PREVIEWER its own string, not `${CARD}`: `grid min-w-0 overflow-hidden bg-surface ${BORDER} ${ROUNDED_CARD}` (ROUNDED_CARD at classes.ts:57 is the 16 px corner). Appending ROUNDED_CARD to a string that still holds rounded-box would leave both classes in the list. Drop shadow-md as well, since docs-site.md:426 says the Previewer card has no shadow.
9. **[low] head, colour-mode switch (shared)**
   - Frame: Segmented:card 217x31; segments 66/64/75 x 23, px 9, gap 5, icons 14 px
   - Build: 230.1x32; segments 70.1/69/79 x 24, px 10, gap 6, icons 16x16
   - Cause: apps/docs/components/previewer/card-mode-switch.tsx:41 <Svg ... size="1rem"> (16 px icons) plus the sm segment's 10 px padding and 6 px gap
   - Fix: Set size="0.875rem" on the three segment icons (14 px). That brings the track to about 224x32. The remaining 1 px of padding and gap is within tolerance.
10. **[low] head, Install button (shared)**
   - Frame: 79x29, padding 7/12, gap 6, icon 14, label 12 px medium
   - Build: 87.6x32, padding 0/12, gap 8, icon 14, label 14px/20 medium
   - Cause: apps/docs/components/previewer/previewer.tsx:95 <Button size="sm"> (h-control-sm, text-sm)
   - Fix: <Button size="xs" className="gap-1.5 px-pad-x-sm">: 28 px tall, text-xs, 12 px inline padding (--spacing-pad-x-sm, styles.css:173).
11. **[low] Try it, checkboxes (shared)**
   - Frame: 16x16 box, radius 4, line-strong border; 11 px label 8 px after it; 25 px pitch
   - Build: 20x20 box in a 24 px target; 12 px label; 26 px pitch
   - Cause: apps/docs/components/previewer/try-it-control.tsx:35 <Checkbox size="sm"> (20 px toggle step)
   - Fix: size="xs" (the 16 px toggle step). The 24 px target stays.

## /en/docs/components/textarea: differs (5)

Note: The shared shell rows under Input apply here too. Not reported because they are recorded: the 193 px width knob, the bold count at limit with no red, line-strong borders and the 2 px inset invalid line (DECISIONS.md:237). The frame's idle placeholder 'Email' is a slip in the frame. Reviewer line numbers corrected: read-only is states.tsx:21, and the fields are lines 13-21.

1. **[high] stage**
   - Frame: a 300x78 textarea with the value 'Tell us what you think about TopClass UI.' (14 px body, 2 lines, padding 10/16 inside a 1 px line), then a right-aligned '42 / 500' counter (10 px mono muted) 6 px below; no label, no resize grip
   - Build: a 14 px medium 'About you' label over an empty 193.2x82 textarea with placeholder 'Write a short paragraph' and a resize grip; no counter
   - Cause: packages/topclassui/src/components/textarea/dummy/playground.tsx:7-10
   - Fix: Make the stage <Textarea aria-label="Feedback" defaultValue="Tell us what you think about TopClass UI." showCount maxLength={500} {...props} />, with no visible label. The width stays the 193 px knob (recorded).
2. **[medium] head, description**
   - Frame: one line, head 79 px: 'Native textarea on the server; autosize and the live counter are the only client parts.'
   - Build: two lines, head 108 px: 'A native textarea rendered on the server. Autosize and the live counter are the only parts that load in the browser.'
   - Cause: apps/docs/content/components/textarea.ts:9
   - Fix: Shorten en and ar to one line of about 85 characters, as in the frame.
3. **[medium] Try it, controls**
   - Frame: selects for variant (outline), size (md) and maxRows (6), then autosize, showCount, disabled and invalid; play row 336 px
   - Build: size and maxRows, the 4 checkboxes, then an extra 'rows' select (3) under the checkboxes; play row 360 px
   - Cause: apps/docs/content/components/textarea.ts:14-15: rows is neither in controlOrder nor in controlsHidden, so it ranks last. Textarea has no variant prop.
   - Fix: controlsHidden: ['fullWidth', 'rows']. For variant, record the drop in DECISIONS.md or add the prop.
4. **[medium] Every state, cells**
   - Frame: 6 cells (idle, hover, focus-visible, disabled, invalid, at limit), '6 states', one row
   - Build: 7 cells with an extra read-only, '7 states', wrapping 5 + 2. Seven 144 px cells cannot fit in 894 px, so even after job 140 it would wrap 6 + 1.
   - Cause: packages/topclassui/src/components/textarea/dummy/states.tsx:21 (the read-only Textarea, which the comment at :9 says the frame leaves out)
   - Fix: Remove the read-only cell, or record it in DECISIONS.md and accept the wrap.
5. **[medium] Every state, field size**
   - Frame: 126x50 fields with no resize grip
   - Build: 159.6x62 fields (rows=2, fullWidth) with a resize grip in the corner; the at-limit and read-only fields are 204x62 on the wrapped row
   - Cause: packages/topclassui/src/components/textarea/dummy/states.tsx:13-21: fullWidth rows={2} on every Textarea
   - Fix: Replace fullWidth with className="w-32 resize-none" on each Textarea, including the one inside the at-limit group.

## /en/docs/components/select: differs (4)

Note: The shared shell rows under Input apply here too ('items' renders as 14 px white mono in the note). Recorded, so not reported: the two-line head (both sides have two lines), line-strong borders, the inset invalid line, the 193 px width knob, the ring on the open trigger and the popup's OVERLAY_SURFACE shadow (DECISIONS.md:226-237). When opened by hand, the popup is 194x148 with four 32 px rows 2 px apart (v/../open-select.png).

1. **[high] stage**
   - Frame: an open Select with no label: a 220x40 trigger 'Jordan' with a 14 px caret and a 2 px ring. 6 px below it, a 220x111 popup (surface-raised, line border, radius 12, padding 6, gap 2) with three 208x31 rows: Jordan selected (primary-soft fill, primary-on-soft text, 14 px check), Egypt, Morocco.
   - Build: a closed 193.2x40 'Jordan' trigger under a 14 px regular 'Country' label, with no popup. Opened by hand, the list has 4 rows (Saudi Arabia added).
   - Cause: apps/docs/content/components/select.ts sets no stageOpen; packages/topclassui/src/components/select/dummy/playground.tsx:12-19 renders a label and a closed Select over 4 countries
   - Fix: Set stageOpen: true in select.ts. Have the playground accept `stage`, as popover/dummy/playground.tsx:41 does. With it, render the Select without the label (aria-label='Country'), with items Jordan/Egypt/Morocco, defaultValue='jo' and defaultOpen (Select passes defaultOpen through at client.tsx:39/60).
2. **[medium] Try it, controls**
   - Frame: selects for variant (outline), size and placement, then disabled, invalid, required and fullWidth; play row 336 px
   - Build: size and placement, then the 4 checkboxes; play row 292 px
   - Cause: Select has no variant prop (select/schema.ts); content/components/select.ts:14
   - Fix: Record in DECISIONS.md that the frame's variant select is dropped, or add the prop.
3. **[medium] Every state, cells**
   - Frame: 6 cells (idle, hover, focus-visible, open, disabled, invalid), '6 states', one row
   - Build: 7 cells with an extra read-only, '7 states', wrapping 5 + 2 (still 6 + 1 after job 140)
   - Cause: packages/topclassui/src/components/select/dummy/states.tsx:22, the read-only Select
   - Fix: Remove the read-only cell, or record it and accept the wrap.
4. **[medium] Every state, trigger size**
   - Frame: every trigger 128x40, caret at x 97
   - Build: triggers sized to their content: 109.1x40 for 'Country', 102.1x40 for 'Jordan'
   - Cause: select/dummy/states.tsx:16-22 sets fullWidth inside STATE_BOX (apps/docs/components/classes.ts:209). That box is shrink-to-fit, so w-full resolves to the content width.
   - Fix: Use className="w-32" instead of fullWidth on each Select in states.tsx.

## /en/docs/components/combobox: differs (8)

Note: The shared shell rows under Input apply here too (hasMore and loadMore render as 14 px white mono in the note). Recorded, so not reported: the glass at the inline start and the spinner at the end, including the loading cell keeping its glass (DECISIONS.md:227), line-strong borders, the inset invalid line and the 193 px width knob. The frame's focus-visible value 'you@mail.com' is a slip. The open list has no 2 px row gap (COMBOBOX_LIST) against the frame's 2; that is within tolerance.

1. **[high] stage**
   - Frame: an open Combobox with no label: a 230x40 input with the glass at x 17, typed 'jor' at x 39 and a 2 px ring. Below it, a 230x78 popup (padding 6, radius 12) with two 218x31 rows: Jordan selected (primary-soft fill, check) and Jordan Valley.
   - Build: a 14 px medium 'Framework' label over a closed 193.2x40 input with placeholder 'Search frameworks'; no popup
   - Cause: apps/docs/content/components/combobox.ts sets no stageOpen; packages/topclassui/src/components/combobox/dummy/playground.tsx:20-23 renders the label and a closed field
   - Fix: Set stageOpen: true. Have the playground accept `stage` and render without the label (aria-label='Country'), with items that include Jordan and Jordan Valley, defaultInputValue='jor' and defaultOpen (Combobox takes defaultOpen, types.ts:75).
2. **[medium] head, description**
   - Frame: one line, head 79 px: 'A text input that filters a listbox; it calls loadMore() for the next page and caches nothing.'
   - Build: two lines, head 108 px: 'A text input that filters a list as you type. It is windowed above 200 options and calls loadMore for the next page.'
   - Cause: apps/docs/content/components/combobox.ts:9
   - Fix: Shorten en and ar to one line, as in the frame.
3. **[medium] stage, placeholder clipped**
   - Frame: text may run to 16 px from the inline end (px 16 on the idle cell)
   - Build: 'Search frameworks' is cut to 'Search framewor', with no ellipsis: the input keeps 36 px of end padding (padding 0 36 0 36) although no spinner shows, which leaves about 119 px for text
   - Cause: packages/topclassui/src/components/combobox/classes.ts:17 COMBOBOX_INPUT_END 'pe-9', applied unconditionally in combobox/client.tsx:88
   - Fix: Apply COMBOBOX_INPUT_END only while status === 'loading'. Otherwise keep the size's own end padding (16 px at md).
4. **[medium] Try it, controls**
   - Frame: selects for variant, size and visibleRows (7), then disabled, invalid, fullWidth and hasMore; play row 336 px
   - Build: size and visibleRows, the 4 checkboxes, then extra 'placement' (bottom-start) and 'status' (idle) selects under them; play row 428 px
   - Cause: apps/docs/content/components/combobox.ts:14-15: placement and status are neither ordered nor hidden
   - Fix: controlsHidden: ['loadMoreThreshold', 'placement', 'status']. Record that variant is dropped (Combobox has no such prop).
5. **[medium] Every state, cells**
   - Frame: 6 cells (idle, focus-visible, open, loading, empty, disabled), '6 states'
   - Build: 9 cells (invalid, read-only and 'one option disabled' added), '9 states', wrapping 5 + 4. The 'one option disabled' cell is just an empty 205.5x40 field with a glass, because its list is shut.
   - Cause: packages/topclassui/src/components/combobox/dummy/states.tsx:24-26
   - Fix: Remove the invalid, read-only and one-option-disabled cells. The last one cannot show anything while its list is shut.
6. **[medium] Every state, empty cell**
   - Frame: a 'zzz' field with a 9 px muted 'no matches' line 5 px under it, in a 128x57 group
   - Build: a 'zzz' field (with the recorded glass) and no 'no matches' line
   - Cause: combobox/dummy/states.tsx:22: the empty note only shows inside the open list, which is shut here
   - Fix: Wrap the empty cell in role='group' aria-label='empty' and add the empty text under the field in text-xs text-muted, as Rating's group cells do.
7. **[medium] Every state, field size**
   - Frame: every field 128x40
   - Build: 159.6x40 on the first row, 205.5x40 on the second
   - Cause: combobox/dummy/states.tsx:18-26 fullWidth
   - Fix: Use className="w-32" in place of fullWidth.
8. **[low] stage and cells, glass position**
   - Frame: glass 17 px from the border-box edge (1 px border + 16 px padding), text at 39 px
   - Build: glass at 12 px (inset-s-3 on the wrapper), text at 37 px (ps-9 + 1 px border)
   - Cause: combobox/classes.ts:20 COMBOBOX_SEARCH 'inset-s-3' and :16 COMBOBOX_INPUT_START 'ps-9'
   - Fix: inset-s-4 for the glass and ps-9.5 for the text, which puts it 8 px after the 14 px glass, as drawn.

## /en/docs/components/segmented-control: differs (7)

Note: The shared shell rows under Input apply here too (TopClassProvider renders as 14 px white mono in the note). Recorded, so not reported: the ring on the focused segment rather than around the track, and regular segments with the selected one medium (DECISIONS.md:270).

1. **[medium] head, description**
   - Frame: one line, head 79 px: 'A radio group drawn as one track; arrow keys select as they move, and reverse in RTL.'
   - Build: two lines, head 108 px
   - Cause: apps/docs/content/components/segmented-control.ts:6
   - Fix: Shorten en and ar to one line, as in the frame.
2. **[medium] stage**
   - Frame: a 228x35 track of icon segments: Light (sun), Dark (moon) selected (surface-raised, drop shadow 0 1 1 rgba(0,0,0,.25), 12 px medium body) and Ocean (palette); segments 70/68/78 x 27, padding 6/11, gap 5, icons 14 px
   - Build: a text-only 193.9x36 track, 'Board | Table | Calendar', segments 55.9/52.9/73.1 x 28, Board selected
   - Cause: the stage renders packages/topclassui/src/components/segmented-control/dummy/playground.tsx:5-12, since the content sets no stageDemo
   - Fix: Set stageDemo: 'with-icons' in segmented-control.ts. Change dummy/with-icons.tsx to Light/Dark/Ocean with sun/moon/palette and defaultValue='dark'; it now has System with a monitor icon and defaults to light.
3. **[medium] play-row height and Try it**
   - Frame: play row 311 px; selects for size (md), tone (neutral) and orientation (horizontal), then fullWidth, invalid and disabled
   - Build: play row 320 px (stageHeight 20rem); size only, then fullWidth, invalid and disabled
   - Cause: apps/docs/content/components/segmented-control.ts:10 stageHeight: 20. SegmentedControl has no tone or orientation prop.
   - Fix: stageHeight: 19.4375 (311 px). Record in DECISIONS.md that tone and orientation are dropped, or add the props.
4. **[medium] Every state, cells**
   - Frame: 5 cells of 181 px in one row (idle, hover, focus-visible, checked, disabled), '5 states'
   - Build: 8 cells (invalid, one disabled and read-only added), '8 states', wrapping 5 + 3
   - Cause: packages/topclassui/src/components/segmented-control/dummy/states.tsx:31-43
   - Fix: Remove the three extra roots from states.tsx; track-states.tsx already serves the specs.
5. **[low] head, title**
   - Frame: 'SegmentedControl'
   - Build: 'Segmented control'
   - Cause: apps/docs/content/components/segmented-control.ts:4
   - Fix: Pick one naming rule for card titles and record it in DECISIONS.md. The frames mix export names (SegmentedControl) with words (Date picker, File upload).
6. **[low] Every state, selection**
   - Frame: the hover, focus-visible and disabled tracks show no selected segment (A and B both regular muted); only idle and checked fill A
   - Build: A is selected and filled in every cell (the demo comment says hover is drawn the same as idle)
   - Cause: segmented-control/dummy/states.tsx:15, :19 and :27: defaultValue="a" on the hover, focus-visible and disabled roots
   - Fix: Drop defaultValue on the hover, focus-visible and disabled roots.
7. **[low] Every state, track size**
   - Frame: small track 63x31, segments 27x23, padding 4/9
   - Build: md track 70.4x36, segments 30.5x28, padding 0/11
   - Cause: segmented-control/dummy/states.tsx: the roots use the default md size
   - Fix: size="sm" on each SegmentedControlRoot in states.tsx, giving a 32 px track like the card's own mode switch.

## /en/docs/components/rating: differs (5)

Note: The shared shell rows under Input apply here too (value and readOnly={false} render as 14 px white mono). Recorded, so not reported: the warning-on-soft fill, full-strength read-only stars and the ring on the focused star (DECISIONS.md:252). The head has two lines on both sides. The stage gaps are refuted (within 1-2 px).

1. **[medium] Try it, controls**
   - Frame: selects for max (5), size (md) and precision (half), then readOnly (checked), showValue and allowClear; play row 311 px
   - Build: max and size, then readOnly (checked) and disabled; play row 240 px
   - Cause: apps/docs/content/components/rating.ts:14-15. Rating has no precision, showValue or allowClear prop; disabled comes from the schema.
   - Fix: Hide 'disabled' (controlsHidden: ['value', 'defaultValue', 'disabled']). Record that precision, showValue and allowClear are dropped, or add them.
2. **[medium] code part**
   - Frame: a 4-line usage (a div, Rating value={4}, Text); code part 218 px tall
   - Build: the whole 19-line playground file (export default function Demo..., with three returns); code part 439 px tall. Line 5 runs past the 894 px block and is cut at 'aria-label="Rate this co'.
   - Cause: apps/docs/components/previewer/previewer.tsx:66-67: usageOf (apps/docs/lib/usage.ts) returns null when anything but a STAGE_BRANCH sits before the last return, so sampleOf prints the whole rating/dummy/playground.tsx (lines 7-11 branch on readOnly and value)
   - Fix: Reshape rating/dummy/playground.tsx into a single return that usageOf can read: move the readOnly and value branches into a helper and keep at most the `if (stage) return <Stage .../>` line before it. Setting stageDemo: 'read-only' would also swap the stage to that demo's five rows, so it is not the fix.
3. **[medium] Every state, star size**
   - Frame: 15 px stars 3 px apart (row 87x15)
   - Build: 24 px stars 4 px apart (row about 136x24)
   - Cause: packages/topclassui/src/components/rating/dummy/states.tsx:11-17 (the default md size)
   - Fix: size="xs" on every Rating in states.tsx.
4. **[medium] Every state, cells**
   - Frame: 6 cells (empty, partial, full, hover, focus-visible, read-only), '6 states'
   - Build: 7 cells with an extra disabled, '7 states', wrapping 5 + 2
   - Cause: rating/dummy/states.tsx:17, the disabled Rating
   - Fix: Remove the disabled cell.
5. **[low] Every state, partial**
   - Frame: 3 filled and 2 empty stars
   - Build: 3.5 stars (a half star)
   - Cause: rating/dummy/states.tsx:12 value={3.5}
   - Fix: value={3}.

## /en/docs/components/date-picker: differs (5)

Note: The shared shell rows under Input apply here too. Recorded, so not reported: the Close button and the 28 px day rows (DECISIONS.md:248), line-strong borders, the inset invalid line and the 193 px trigger width. The trigger text is 14 px against 12, within the type-scale tolerance. The six-cell strip wraps 5 + 1, which job 140 covers. The states demo lines are 11-16, not 10-15.

1. **[high] stage**
   - Frame: the open calendar panel alone, with no trigger: 270x159, padding 14, gap 10, radius 12, surface-raised, line border, drop shadow 0 6 8 rgba(0,0,0,.4). Header 'September 2026' 14 px semibold between 15 px carets; M-S weekday row 9 px medium muted; 34 px day columns; 22 selected as a primary-solid pill in medium white.
   - Build: a 14 px 'Check-in' label over a closed 193x40 trigger 'Sep 22, 2026' with the calendar icon; the calendar appears only after a click (268x236 open)
   - Cause: apps/docs/content/components/date-picker.ts sets no stageOpen; packages/topclassui/src/components/date-picker/dummy/playground.tsx:7-10 renders a label and the trigger
   - Fix: Set stageOpen: true. Have the playground accept `stage` and pass defaultOpen (DatePicker has it, types.ts:79), with no visible label (aria-label='Check-in'). The trigger will still sit above the panel, where the frame draws the panel alone; accept that or record it.
2. **[medium] head, description**
   - Frame: one line, head 79 px: 'A lazy-loaded calendar popover that formats dates with the provider's locale and digits.'
   - Build: two lines, head 108 px: 'One day picked from a month. The calendar loads on its first open, and every month name and digit comes from Intl.'
   - Cause: apps/docs/content/components/date-picker.ts:9
   - Fix: Shorten en and ar to one line.
3. **[medium] Try it, controls**
   - Frame: selects for mode (single), placement (bottom-start) and firstDayOfWeek (1), then disabled, invalid, clearable (checked) and showWeekNumbers; play row 336 px
   - Build: an extra size select, then placement, then firstDayOfWeek as a 172 px slider with '1' at its end, then disabled and invalid; play row 300 px
   - Cause: packages/topclassui/src/components/date-picker/schema.ts:29: firstDayOfWeek is z.number() without .int(), so apps/docs/scripts/lib/controls.ts:29-38 makes it a slider rather than a select. date-picker.ts:14 puts size first. mode, clearable and showWeekNumbers are not props.
   - Fix: Add .int() to firstDayOfWeek so 0-6 becomes a select. Add 'size' to controlsHidden. Record that mode, clearable and showWeekNumbers are dropped, or add them.
4. **[low] Every state, trigger size**
   - Frame: every trigger 128x40
   - Build: 128.8x40 for 'Pick a date'; 145.3x40 for 'Sep 22, 2026' (open, selected, today), sized to content
   - Cause: packages/topclassui/src/components/date-picker/dummy/states.tsx:11-16 fullWidth inside the shrink-to-fit STATE_BOX
   - Fix: Use className="w-32" in place of fullWidth.
5. **[low] stage and states, date format**
   - Frame: '22 Sep 2026'
   - Build: 'Sep 22, 2026'
   - Cause: the en provider locale formats month-first (Intl, en-US)
   - Fix: If the frame's day-first order is wanted, give the en site the en-GB locale for DatePicker; otherwise record that en-US is kept.

## /en/docs/components/file-upload: differs (6)

Note: The shared shell rows under Input apply here too (maxSize renders as 14 px white mono). Recorded, so not reported: the progress bar and the done row (DECISIONS.md:249/252), and so the uploading and done cells. The zone itself matches: padding 24, gap 8, a 26 px icon, a 14 px medium title, a 12 px muted hint, a dashed line-strong border, radius 12, on surface. The reviewer's fixes for the strip were corrected. FileUpload sends className to the root (client.tsx:40), not to the zone (client.tsx:45), and sets data-dragging only from its own state (client.tsx:43).

1. **[high] Every state, cells**
   - Frame: 6 cells, '6 states': idle; drag over (primary-soft fill, dashed primary-solid line, primary icon and 'drop'); uploading; done; error (warning-circle and 'too big'); disabled
   - Build: 3 cells, '3 states': idle, disabled and an extra invalid
   - Cause: packages/topclassui/src/components/file-upload/dummy/states.tsx:3-19. The zone does style data-dragging (file-upload/classes.ts:12, :17, :23), but data-dragging comes only from the hook's state (client.tsx:43), and className lands on the root, so a demo cannot force drag-over at rest. A refused row needs a held file.
   - Fix: Remove the invalid cell (states.tsx:16-19). For drag over and error, either expose a way to draw them at rest (for example a prop that sets data-dragging on the zone, and a static refused-row demo) or record them in DECISIONS.md with uploading and done.
2. **[medium] head, description**
   - Frame: one line, head 79 px: 'A drop zone that always has a browse button, with the file list as a windowed collection.'
   - Build: two lines, head 108 px
   - Cause: apps/docs/content/components/file-upload.ts:9
   - Fix: Shorten en and ar to one line.
3. **[medium] stage, zone**
   - Frame: a 320x124 zone with no label; hint 'PNG, JPG or PDF, up to 10 MB'
   - Build: a 14 px medium 'Attachment' label over a 218.8x128 zone; hint 'PNG, JPG or PDF'
   - Cause: packages/topclassui/src/components/file-upload/dummy/playground.tsx:7-13 (a label, the component's own width and a short hint)
   - Fix: Drop the visible label (aria-label='Attachment'), give the FileUpload className="w-80" (320 px; className reaches the root, which the zone fills) and use the hint 'PNG, JPG or PDF, up to 10 MB'.
4. **[medium] stage, file row**
   - Frame: a 320x47 file row 10 px under the zone: line border, radius 8, padding 10/12, 16 px file icon, 'brief.pdf' 14 px medium, a 200x4 progress bar, 14 px x icon
   - Build: no file row
   - Cause: the stage holds no picked file. FileUpload has no initial-files prop (types.ts:19 omits value and defaultValue), and the progress bar is recorded as not built.
   - Fix: Record that the stage stays empty until a file is picked, or add an initial-files API so the row (without progress) can be seeded; that is an API choice for Omar.
5. **[medium] Try it, controls**
   - Frame: selects for accept (image/*), maxSize (10MB) and maxFiles (5), then multiple (checked), disabled and showList (checked); play row 311 px
   - Build: maxFiles (1), then disabled and invalid; play row 224 px
   - Cause: apps/docs/content/components/file-upload.ts:14-15 hides maxSize; the schema has no accept, multiple or showList prop; maxFiles defaults to 1; stageHeight 14 (224 px)
   - Fix: Start maxFiles at 5 (content `starts`), hide 'invalid', set stageHeight: 19.4375 (311 px), and record that accept, multiple and showList are dropped, or add them.
6. **[medium] Every state, zone size**
   - Frame: a mini zone of 126x60: padding 12, gap 4, an 18 px icon, a 9 px mono 'browse'
   - Build: the full 218.8x104 zone: padding 24, a 26 px icon, 14 px medium 'Drag files here or browse'; each cell grows to 282 px
   - Cause: file-upload/dummy/states.tsx:7-19 renders the default zone; its padding, gap, icon and title live on the zone (classes.ts:12, client.tsx:45-50), which a caller's className does not reach
   - Fix: className="w-32" narrows the root and the zone with it, but the padding, icon and title need a compact option (as EmptyState's `compact`, DECISIONS.md:193) or a recorded difference.

## Refuted by the second reviewer (do not act)

- /en/docs/components/input, card frame, shadow part of the shared card claim: Not visible: on the dark page (lab 2.75) the frame's 0 2 12 -4 rgba(0,0,0,.3) and the build's shadow-md at 0.1 both vanish against near-black. docs-site.md:426 also says the card has no shadow; dropping shadow-md is folded into the radius fix.
- /en/docs/components/input, code part, spacing (shared): 12 vs 10 px is within 2 px. The class bug is real, though: CODE_PART (classes.ts:135) is a plain join of CARD_PART's gap-3 and gap-2.5, and gap-3 wins (measured 12 px).
- /en/docs/components/input, code part, import lines: Recorded: the code tab shows the repo's dummy file as one Shiki block, blank line included (docs-site S7). The 10 px vs 12 px size is the type-scale snap, so the reviewer marked it optional.
- /en/docs/components/input, Every state, captions (shared): Recorded type-scale snap: the frame's 9 px rounds to the scale's 12 px xs (docs-site.md type sizes; classes.ts:164 reads the frames' 10 px notes as xs). The 10 vs 9 px gap is within 1 px.
- /en/docs/components/rating, stage: Within 1-2 px: stars 4 vs 5 px apart, rows 8 vs 10 px apart, group 136x88 vs 140x92.
