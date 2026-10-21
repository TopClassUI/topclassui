# Figma audit, job 140 fields-1

On preview/r8-all d9c04b21 at 1440 dark, frame vs build, each difference re-checked by a second reviewer. Fix what your branch has not fixed yet; skip a row your later commits already cover.

## /en/docs/components/checkbox: differs (15)

Note: I checked frame 135:1086 (get_design_context and get_metadata) against r11/card-checkbox.png and a fresh DOM dump of the same build. The stacked frame-over-build bands and zoomed crops are in handoff/figma-audit/r11-review/job-140-fields-1-skeptic/bands/. Rows marked (shared) come from the card shell, so they apply to all six cards and are listed only here: chip, mode switch, Install, Try it select and toggle boxes, Copy button, code token colour, note inline code, state captions, install-row wrap and icon inset, card radius. Four reviewer fixes were wrong and are corrected below. (1) The defaultChecked toggle also needs the hard-coded defaultChecked removed from the playground. (2) The xs toggle box needs CHECK_ROW gap-1. (3) The install line is 59 characters, not 57, so 10.5 px text alone still wraps. (4) The weight of the mode-switch labels is a recorded decision. The six-cell states strip wraps 5 + 1 (cells 159.6 px, 24 px gap); job 140 is fixing that with gap-x-0, so it is not listed.

1. **[high] stage (play row, left), content at rest**
   - Frame: Three bare 24x24 boxes, 14 px apart, in a 100x24 row centred in the 694x275 stage: unchecked (surface-raised #262626, 1 px line-strong), checked (primary-solid with a 17.28 px tick) and indeterminate (primary-solid with a dash). No label.
   - Build: One checked 24 px box and a 14 px label, 'I accept the terms', 8 px away (a 151.5x24 group at card x 266).
   - Cause: apps/docs/content/components/checkbox.ts has no stageDemo, so apps/docs/components/previewer/previewer.tsx:62 falls back to the playground: packages/topclassui/src/components/checkbox/dummy/playground.tsx:7-10 (box and label). No existing demo draws the three boxes (combined.tsx has 9, sizes.tsx has 5).
   - Fix: Add packages/topclassui/src/components/checkbox/dummy/stage.tsx that returns <div className="flex items-center gap-3.5"><Checkbox aria-label="Unchecked" /><Checkbox aria-label="Checked" defaultChecked /><Checkbox aria-label="Indeterminate" indeterminate /></div>. Then set stageDemo: 'stage' in apps/docs/content/components/checkbox.ts. Try it still swaps in the playground on the first change.
2. **[medium] Try it, toggle list**
   - Frame: Four toggles: defaultChecked, indeterminate, disabled, invalid.
   - Build: Three toggles: indeterminate, disabled, invalid. defaultChecked is missing.
   - Cause: apps/docs/content/components/checkbox.ts:14-15. controlOrder and extraSwitches leave out defaultChecked, a real prop (checkbox/types.ts:30 picks it from Base UI) that is not in the schema. Also, dummy/playground.tsx:8 hard-codes defaultChecked.
   - Fix: Set controlOrder: ['size', 'defaultChecked', 'indeterminate', 'disabled', 'invalid'] and extraSwitches: ['defaultChecked', 'indeterminate', 'disabled']. Also remove the hard-coded defaultChecked from checkbox/dummy/playground.tsx:8. Without that, the toggle starts unticked, a false value is never passed (changedProps in apps/docs/lib/usage.ts:54 drops values equal to their start), and the playground box stays ticked whatever the toggle says.
3. **[medium] Try it, select trigger (shared)**
   - Frame: 208x29, pl 10, pr 8, 11 px mono value, 13 px caret, radius 8.
   - Build: 211x32 (Select sm), px 12, 14 px Geist Mono value, 14 px caret.
   - Cause: apps/docs/components/previewer/try-it-control.tsx:64 <Select size="sm">. The pre-mount reserve is apps/docs/components/classes.ts:181 CONTROL_RESERVE.select 'h-8'.
   - Fix: Use size="xs" at try-it-control.tsx:64 (h-control-xs 28 px, px-pad-x-xs 8 px, text-xs 12 px). Change CONTROL_RESERVE.select to 'h-7 pointer-coarse:h-11'. Move the segmented (:48), slider (:78) and number (:91) controls and their reserves to xs as well, so the column keeps one scale.
4. **[medium] head, chip (shared)**
   - Frame: 96x16 chip, 9 px Roboto Mono Regular (400), px 7, py 2, radius 4, primary-soft fill with #51a2ff text.
   - Build: 152.4x26 chip, 14 px Geist Mono at weight 500 (Badge sm: px 8, py 4, text-sm/4, 1 px transparent border), same colours.
   - Cause: apps/docs/components/previewer/previewer.tsx:89 <Badge size="sm" className="font-mono">. BADGE_SIZE.sm is in badge/classes.ts:39, and the Badge base carries font-medium.
   - Fix: Use size="xs" className="font-mono font-normal px-1.5" at previewer.tsx:89. That gives 12 px regular text on a chip about 22 px tall (py 2, 16 px line, 1 px border), the closest the scale gets to the drawn 16 px.
5. **[medium] code part, Copy button (shared)**
   - Frame: 73x29, surface fill #171717, 1 px base/line #262626 edge, px 10, gap 6, 12 px medium label.
   - Build: 83.2x32, transparent fill (the #0a0a0a page shows through), 1 px line-strong #a1a1a1 edge, px 12, gap 8, 14 px label. In dark it reads as a bright outlined pill.
   - Cause: apps/docs/components/previewer/copy-button.tsx:49-56: Button variant 'outline', tone 'neutral', size 'sm'.
   - Fix: When word is set, draw the guide pages' code-copy look, which is exactly the frame's: classes.ts:121 CODE_COPY uses h-control-xs, bg-surface, BORDER (line), px-2.5, gap-1.5 and text-xs. For example: Button size="xs" className="shrink-0 bg-surface border-line px-2.5" (cn merges the consumer's classes last).
6. **[medium] code part, note line (shared)**
   - Frame: Plain 10.5 px muted text with a 12 px info icon centred 7 px away. One size and one colour; the line is 13 px tall.
   - Build: 12 px muted text. The backtick run '<button role="checkbox">' is 14 px Geist Mono in the body colour (201.6x18), so the line is 20 px tall and the code outshines the sentence. The icon is top-aligned with mt-0.5.
   - Cause: apps/docs/components/inline-text.tsx:6 gives every backtick run INLINE_CODE (apps/docs/components/classes.ts:81 'font-mono text-sm text-body'). The note renders it at previewer.tsx:72.
   - Fix: Give the note's code the note's size and colour. Either wrap it at previewer.tsx:72 as <span className={`${AUTHORED_CELL} **:text-muted`}> (AUTHORED_CELL, classes.ts:100, already does this for table cells), or add a codeClassName prop to InlineText and pass 'font-mono'. Once the code is 12 px the line is 16 px tall and the mt-0.5 icon sits centred, so items-start can stay.
7. **[medium] install row, 'Then import it' field and notes (shared)**
   - Frame: The import line fits on one 34 px row: 10.5 px mono in a 390.5 px text box (pl 12, pr 8, gap 8, 14 px icon). Each note is one 10 px line, and the row is 108 px tall.
   - Build: At 12 px Geist Mono (7.2 px per character), 'import { Checkbox } from '@/topclassui/components/checkbox'' (59 characters, 425 px) wraps onto two lines in a 362 px text box (field 428x50). The note 'It is your file now…' wraps onto two lines (32 px), and the row is 151 px tall. The same happens on switch, slider and otp-field, whose lines fit in the frame.
   - Cause: apps/docs/components/classes.ts:144 COPY_FIELD_TEXT 'text-xs' and :165 NOTE 'text-xs'. The text box is also narrowed by the 40 px icon-only CopyButton (copy-button.tsx:54 size sm with px 12) and by COPY_FIELD gap-2 / pe-1 (classes.ts:143).
   - Fix: Set COPY_FIELD_TEXT to text-[0.65625rem] (10.5 px, 6.3 px per character). That makes this line 372 px and the OTP line 378 px, so the box must also grow. Give the icon-only CopyButton size="xs" className="shrink-0 px-1" (24 px wide, still at the 24 px floor) and use gap-1 in COPY_FIELD: the box becomes 428-2-12-4-24-4 = 382 px. Set the install-row notes to text-[0.625rem]. The reviewer's '57 x 6.3 = 359' miscounts: the line is 59 characters, so 10.5 px alone still wraps in a 362 px box.
8. **[low] Try it, toggle boxes (shared)**
   - Frame: 16x16 box with radius 4. The 11 px label is 8 px from the box, rows are 25 px apart, and the first box is 14 px under the last select.
   - Build: 20x20 box (Checkbox sm) in a 24 px target. The 12 px label is 10 px from the box, rows are 26 px apart, and the first box is 10 px under the select (select bottom y 212, box y 222).
   - Cause: apps/docs/components/previewer/try-it-control.tsx:35 <Checkbox size="sm"> (toggle-sm is 20 px). The row gap is CHECK_ROW 'gap-2' at apps/docs/components/classes.ts:177.
   - Fix: Use size="xs" at try-it-control.tsx:35 (toggle-xs is 16 px). Also change CHECK_ROW gap-2 to gap-1: the xs box sits 4 px inside its 24 px target, so gap-2 would put the label 12 px from the box, and gap-1 gives the drawn 8 px. The first box then sits 12 px under the select. CONTROL_RESERVE.switch can stay size-6.
9. **[low] head, description**
   - Frame: One line of 14 px muted text (87 characters) in a 590 px column. The head is 79 px tall.
   - Build: Two lines (123 characters) in a 556 px column. The head is 108 px tall.
   - Cause: apps/docs/content/components/checkbox.ts:9: description.en is 123 characters.
   - Fix: Shorten description.en (and .ar) to about 80 characters or fewer; the S7 check needs 50 to 160. For example: 'Checked, unchecked or mixed; a hidden input sends the default before hydration.' (80 characters, about 536 px).
10. **[low] head, mode switch (shared)**
   - Frame: 217x31 track. Segments are 23 px tall with px 9, gap 5 and 14 px icons.
   - Build: 230x32 track, 13 px wider. Segments are 24 px tall with px 10, gap 6 and 16 px icons.
   - Cause: apps/docs/components/previewer/card-mode-switch.tsx:41 <Svg size="1rem">. The icons account for 6 of the 13 px; the rest is 1 px of padding and gap per segment.
   - Fix: Use size="0.875rem" at card-mode-switch.tsx:41. The regular weight of Light and Ocean is a recorded decision (DECISIONS.md 2026-10-19, SegmentedControl: 'segments are regular, the selected one medium'), so leave it.
11. **[low] head, Install button (shared)**
   - Frame: 79x29, px 12, gap 6, 14 px icon, 12 px medium label.
   - Build: 87.6x32, px 12, gap 8, 14 px icon, 14 px medium label.
   - Cause: apps/docs/components/previewer/previewer.tsx:95 <Button size="sm">.
   - Fix: Use size="xs" className="px-3": 28 px tall with a 12 px label, keeping the drawn 12 px padding (xs alone pads 8 px).
12. **[low] code part, plain code tokens (shared)**
   - Frame: Plain text in the import lines is muted #a1a1a1 (10 px); plain text in the JSX is body #fafafa.
   - Build: Every plain token is #d4d4d4, so the import line is brighter than drawn and the JSX slightly dimmer.
   - Cause: apps/docs/lib/shiki-themes.ts:14 DARK_GROUND.text '#d4d4d4'. The same theme colours the guide pages' code blocks.
   - Fix: Override the default foreground only for the Previewer's flat code (.docs-flat-code in apps/docs/app/globals.css, or a separate theme for FLAT_CODE) to the body token. Changing DARK_GROUND itself would recolour every guide code block too.
13. **[low] Every state, captions (shared)**
   - Frame: Captions are 9 px Roboto Mono, muted.
   - Build: Captions are 12 px Geist Mono, muted (e.g. 'focus-visible' is 93.6 px wide).
   - Cause: apps/docs/components/classes.ts:210 STATE_CAPTION 'text-xs'.
   - Fix: Use text-[0.625rem] in STATE_CAPTION if the drawn 9-10 px should hold. The 14 vs 12 px row gap and the 9 vs 10 px caption gap are within 2 px and are not listed.
14. **[low] install row, copy icon position (shared)**
   - Frame: 14 px copy icon whose end is 9 px from the field's end edge (pr 8 plus the 1 px border), with no button chrome.
   - Build: The icon's end is 18 px from the field's end edge (pe-1 4 px, a ghost Button sm with px 12, and borders).
   - Cause: apps/docs/components/classes.ts:143 COPY_FIELD 'pe-1' and copy-button.tsx:54 size="sm" for the icon-only button.
   - Fix: The icon-only CopyButton change above (size xs, px-1) puts the icon about 10 px from the edge.
15. **[low] card frame, corner radius (shared)**
   - Frame: 16 px corners.
   - Build: 12 px corners (rounded-box: --tc-radius 8 px x 1.5).
   - Cause: apps/docs/components/classes.ts:127-129: PREVIEWER = `${CARD} shadow-md`, and CARD uses rounded-box.
   - Fix: Set PREVIEWER = `grid min-w-0 overflow-hidden ${ROUNDED_CARD} bg-surface ${BORDER}`. ROUNDED_CARD (classes.ts:57) is the drawn 16 px, capped. Per docs-site.md (Shadows), drop shadow-md at the same time.

## /en/docs/components/radio-group: differs (4)

Note: I checked frame 135:1207 against r11/card-radio-group.png (bands/radio-group-*.png). The shared card-shell differences listed under checkbox apply here too. The missing Try it 'tone' select is a recorded decision: RadioGroup has no tone prop, and docs-site.md says a drawn control with no prop does not appear. orientation is present on both sides. The 'Then import it' line wraps in both the frame and the build (48 vs 50 px). The six-cell states strip wraps 5 + 1; job 140 is fixing that with gap-x-0.

1. **[medium] stage, content at rest**
   - Frame: Three radios (Monthly, Yearly checked, Lifetime): 24 px circles, 9 px to the 14 px label, rows 34 px apart, an 87x92 group centred in the stage. No group label.
   - Build: The same three radios (8 px to label, 34 px pitch) with a visible 14 px 'Billing' label above them (20 px plus an 8 px gap). The group is 85.5x120, and the radios sit 14 px lower.
   - Cause: packages/topclassui/src/components/radio-group/dummy/playground.tsx:8-9: <span id="radio-group-playground-label">Billing</span> plus aria-labelledby. The stage renders the playground because radio-group.ts has no stageDemo.
   - Fix: Delete line 8 and name the group with aria-label="Billing" on RadioGroupRoot (GroupName in shared/contracts/name.ts allows it). The wrapper can then drop 'grid justify-items-start gap-2'.
2. **[medium] code part, note line**
   - Frame: Plain 10.5 px muted text: 'The group carries name and defaultValue; each Radio carries only its value and label.'
   - Build: 12 px muted text with 'RadioGroupItem' and 'value' as 14 px Geist Mono in the body colour. The line is 20 px tall.
   - Cause: apps/docs/components/inline-text.tsx:6 applies INLINE_CODE (classes.ts:81 text-sm text-body) to the backtick runs in apps/docs/content/components/radio-group.ts:17.
   - Fix: The shared fix under checkbox: give the note's code the note's size and colour at previewer.tsx:72.
3. **[low] head, description**
   - Frame: One line (about 82 characters). The head is 79 px tall.
   - Build: 125 characters on two lines. The head is 108 px tall.
   - Cause: apps/docs/content/components/radio-group.ts:9
   - Fix: Shorten description.en (and .ar) to about 80 characters, keeping 50 to 160 for the S7 check.
4. **[low] install row, note under 'Then import it'**
   - Frame: One 10 px line, 12 px tall.
   - Build: Two 12 px lines, 32 px tall.
   - Cause: apps/docs/components/classes.ts:165 NOTE 'text-xs' in a 428 px column.
   - Fix: The shared fix under checkbox (install-row notes at text-[0.625rem]).

## /en/docs/components/switch: differs (3)

Note: I checked frame 135:1334 against r11/card-switch.png (bands/switch-*.png, including switch-statesz.png at 1.5x). The frame's description also runs two lines (head 96 px), so the head is not listed. The shared card-shell differences listed under checkbox apply here too, including the 'Then import it' line wrapping (55 characters: 396 px at 12 px in a 362 px box, against 34 px in the frame). The missing 'tone' select is a recorded decision: Switch has no tone prop. The states strip wraps 5 + 1; job 140 is fixing that with gap-x-0.

1. **[high] stage, content at rest**
   - Frame: Two 42x24 switches 16 px apart, centred (row at stage x 297-397): off on the left (thumb at x 3) and on on the right (white thumb at x 20 on primary-solid). No label.
   - Build: One on switch and a 14 px 'Weekly digest' label 8 px away (143x24 at card x 270.5). No off switch.
   - Cause: apps/docs/content/components/switch.ts has no stageDemo, so previewer.tsx:62 renders packages/topclassui/src/components/switch/dummy/playground.tsx:7-10 (switch and label).
   - Fix: Add packages/topclassui/src/components/switch/dummy/stage.tsx that returns <div className="flex items-center gap-4"><Switch aria-label="Off" /><Switch aria-label="On" defaultChecked /></div>. Then set stageDemo: 'stage' in apps/docs/content/components/switch.ts.
2. **[medium] Try it, toggle list**
   - Frame: Four toggles: defaultChecked, disabled, required, invalid.
   - Build: Three toggles: disabled, required, invalid. defaultChecked is missing.
   - Cause: apps/docs/content/components/switch.ts:14-15. defaultChecked is a real prop (switch/types.ts:30) but is not in the schema. switch/dummy/playground.tsx:8 hard-codes defaultChecked.
   - Fix: Set controlOrder: ['size', 'defaultChecked', 'disabled', 'required', 'invalid'] and extraSwitches: ['defaultChecked', 'disabled', 'required']. Also remove the hard-coded defaultChecked from switch/dummy/playground.tsx:8, or the toggle can never turn the playground switch off (changedProps drops a false that equals its start).
3. **[medium] code part, note line**
   - Frame: Plain 10.5 px muted text: 'xs and sm still grow to 44px under a coarse pointer, so the thumb stays tappable.'
   - Build: 12 px muted text with 'xs' and 'sm' as 14 px Geist Mono in the body colour. The line is 20 px tall.
   - Cause: apps/docs/components/inline-text.tsx:6 applies INLINE_CODE to the backticks in apps/docs/content/components/switch.ts:17.
   - Fix: The shared fix under checkbox: give the note's code the note's size and colour at previewer.tsx:72.

## /en/docs/components/slider: differs (3)

Note: I checked frame 135:1455 against r11/card-slider.png (bands/slider-*.png, slider-statesz.png at 1.5x). The frame's slider drawings are broken: get_metadata shows each fill Frame placed after its track (stage fills at x 260, width 104 and 182; knobs at x 364 and 442). The intended geometry is a 6 px track, a fill as long as the value and an 18 px knob, and the frame is read that way. The shared card-shell differences listed under checkbox apply here too, including the 'Then import it' line wrapping (55 characters). The missing 'tone' and 'orientation' selects are not counted: tone is not a prop, and orientation is only Base UI's pass-through, with no vertical styling in the library. The note has no backticks, so the inline-code issue does not apply. The states strip wraps 5 + 1; job 140 is fixing that with gap-x-0.

1. **[high] stage, content at rest**
   - Frame: Two single sliders stacked 18 px apart, each with a 260 px, 6 px track, at values 40 % (fill 104 px) and 70 % (fill 182 px). No label.
   - Build: One slider: a 165.2 px track inside a 193.2 px root, value 60 % (fill 99.1 px), under a 14 px 'Volume' label (20 px plus an 8 px gap).
   - Cause: apps/docs/content/components/slider.ts has no stageDemo, so previewer.tsx:62 renders packages/topclassui/src/components/slider/dummy/playground.tsx:7-10 (a label and one Slider with defaultValue={60} at --tc-input-width).
   - Fix: Add packages/topclassui/src/components/slider/dummy/stage.tsx that returns <div className="grid gap-4.5"><Slider aria-label="Volume" defaultValue={40} className="w-72" /><Slider aria-label="Balance" defaultValue={70} className="w-72" /></div>. A 288 px root gives a 260 px track inside the 14 px padding. Then set stageDemo: 'stage' in apps/docs/content/components/slider.ts.
2. **[low] Every state, values and widths**
   - Frame: 108 px track. idle, hover, focus-visible, disabled and invalid are at 40 % (fill 43 px); active is at 60 % (fill 65 px).
   - Build: 116 px track (w-36 root). Every cell is at 60 % (fill 69.6 px), so 'active' looks identical to idle and hover.
   - Cause: packages/topclassui/src/components/slider/dummy/states.tsx:11-16: defaultValue={60} and className 'w-36' on every cell.
   - Fix: Use defaultValue={40} on every cell but 'active' (keep 60 there), and className 'w-34' (a 136 px root gives a 108 px track).
3. **[low] head, description**
   - Frame: One line: 'Single or range; arrow keys and a click on the track replace every drag.' The head is 79 px tall.
   - Build: About 105 characters on two lines. The head is 108 px tall.
   - Cause: apps/docs/content/components/slider.ts:9
   - Fix: Shorten description.en (and .ar) to one line of about 80 characters or fewer, keeping 50 to 160 for the S7 check.

## /en/docs/components/number-field: differs (4)

Note: I checked frame 135:1594 against r11/card-number-field.png (bands/number-field-*.png). The shared card-shell differences listed under checkbox apply here too. The 'Then import it' line wraps in both the frame and the build. In Figma, the field's overflow-clip clips the focus-visible ring, so the frame shows only a grey edge; the build's blue ring is the intended look and is not listed. The missing 'variant' select is a recorded decision (no prop). The states strip wraps 5 + 1; job 140 is fixing that with gap-x-0.

1. **[medium] stage, content at rest**
   - Frame: A 170x40 field showing '12' (14 px medium), centred. No label.
   - Build: A 193x40 field showing '2', with a 14 px 'Guests' label above it (20 px plus an 8 px gap). The 193 px width is the recorded --tc-input-width and is not counted.
   - Cause: packages/topclassui/src/components/number-field/dummy/playground.tsx:8-9: the visible <label> and defaultValue={2}.
   - Fix: Delete line 8, name the field with aria-label="Guests" in place of the id and label pair (ControlName allows it), and set defaultValue={12}.
2. **[medium] code part, note line**
   - Frame: Plain 10.5 px muted text: 'min, max and step are clamped at runtime, so a typed value cannot break the UI.'
   - Build: 12 px muted text with 'min', 'max' and 'step' as 14 px Geist Mono in the body colour. The line is 20 px tall.
   - Cause: apps/docs/components/inline-text.tsx:6 applies INLINE_CODE to the backticks in apps/docs/content/components/number-field.ts:18.
   - Fix: The shared fix under checkbox: give the note's code the note's size and colour at previewer.tsx:72.
3. **[low] Try it, missing 'step' select**
   - Frame: A third select, 'step', showing 1, between 'variant' and the toggles.
   - Build: No step control: only the size select and four toggles.
   - Cause: apps/docs/scripts/lib/controls.ts:20-42 controlOf handles enum, boolean and number only, and returns null for a union. number-field/schema.ts:22 declares step as z.union([z.number().min(stepMin)…, z.literal('any')]), which JSON Schema emits as anyOf. step is not in controlsHidden, so dropping it is not intended.
   - Fix: In controlOf, map an anyOf of a bounded number and the literal 'any' to a 'number' control (min stepMin, default 1), or to a select that lists the default plus 'any'. Then add 'step' after 'size' in controlOrder (apps/docs/content/components/number-field.ts:14).
4. **[low] head, description**
   - Frame: One line. The head is 79 px tall.
   - Build: About 128 characters on two lines. The head is 108 px tall.
   - Cause: apps/docs/content/components/number-field.ts:9
   - Fix: Shorten description.en (and .ar) to one line of about 80 characters or fewer, keeping 50 to 160.

## /en/docs/components/otp-field: differs (6)

Note: I checked frame 135:1768 against r11/card-otp-field.png (bands/otp-field-*.png, otp-field-statesz.png at 1.5x). The frame's filled cells lost their fixed height (38x24 on the stage, 20x17 in the strip, against 46 and 26 px for the empty ones). That is a Figma defect; the build's equal heights are the intent. The 40x48 cell, its line-strong edge and the invalid 2 px line are recorded decisions. The shared card-shell differences listed under checkbox apply here too, including the 'Then import it' line wrapping. That line is 60 characters, 378 px even at 10.5 px, which is why the shared install fix also widens the text box. The reviewer's stage fix does not compile: OTPField's type refuses aria-label (OtpFieldName: 'aria-label'?: undefined, because Base UI drops it), so the fix below keeps the label and hides it instead. The states strip wraps 5 + 1; job 140 is fixing that with gap-x-0.

1. **[high] install row, 'Then import it' line**
   - Frame: import { OTPfield } from '@/topclassui/components/otp-field' (mis-cased in Figma; the real export is OTPField).
   - Build: import { OtpField } from '@/topclassui/components/otp-field'. That name is not exported (otp-field/index.tsx:2 exports OTPField), so a pasted copy fails to compile, while the card's own note says 'The export is OTPField'.
   - Cause: apps/docs/scripts/lib/props.ts:56 names the single part meta.name, which is 'OtpField' (otp-field/meta.ts:6; meta.test forces the folder's PascalCase). apps/docs/components/previewer/install-row.tsx:27 and :42 print it through sourceImportLineOf.
   - Fix: In apps/docs/scripts/lib/props.ts:56, name the single part by its real export: `exported.find((name) => name.toLowerCase() === meta.name.toLowerCase()) ?? meta.name` (`exported` is read at :51). The line then prints import { OTPField } …, as docs-site.md item 9 asks ('Names come from the code: meta.ts and the component's exports'). No test pins 'OtpField'.
2. **[medium] stage, content at rest**
   - Frame: Six 38x46 cells 8 px apart, '4 8 2 9' at 18 px semibold, the fifth cell drawn as the caret's cell (2 px ring-coloured border), the sixth empty. No label.
   - Build: Six 40x48 cells 8 px apart, '4 8 2 9' at 18 px semibold, no ring on the fifth cell, and a 14 px 'Verification code' label above (20 px plus an 8 px gap).
   - Cause: packages/topclassui/src/components/otp-field/dummy/playground.tsx:8: the visible <label>. Nothing draws the next-cell ring at rest.
   - Fix: Keep the label for the name, but hide it: className="sr-only" at playground.tsx:8, as states.tsx:12 does, and drop the wrapper's 'grid justify-items-start gap-2'. Do not use aria-label: OtpFieldName refuses it and tsc would fail. If the fifth cell should show its ring at rest, add a stage.tsx with the states.tsx RING pattern on *:nth-5 and set stageDemo: 'stage'.
3. **[medium] code part, note line**
   - Frame: Plain 10.5 px muted text: 'autoSubmit posts the enclosing form the moment the last digit is typed.'
   - Build: 12 px muted text with 'OTPField' as 14 px Geist Mono in the body colour (67.2x18). The line is 20 px tall.
   - Cause: apps/docs/components/inline-text.tsx:6 applies INLINE_CODE to the backticks in apps/docs/content/components/otp-field.ts:18.
   - Fix: The shared fix under checkbox: give the note's code the note's size and colour at previewer.tsx:72.
4. **[low] Try it, missing 'validationType' select**
   - Frame: A select, 'validationType', showing numeric, between 'length' and 'size'.
   - Build: No validationType control (length and size selects, then four toggles).
   - Cause: validationType is a real prop (otp-field/types.ts:50 picks it from Base UI) but is not in otp-field/schema.ts, and the controls are generated from the schema (apps/docs/scripts/lib/controls.ts).
   - Fix: Add validationType to otp-field/schema.ts as an enum of the values Base UI's OTPField accepts, read from the installed @base-ui/react types, with default 'numeric' and its list in constants.ts. Then add it after 'length' in controlOrder (apps/docs/content/components/otp-field.ts:14).
5. **[low] Every state, idle and partly filled cells**
   - Frame: idle: the first cell carries the 2 px ring-coloured border. partly filled: the third cell carries it, the same as focus-visible.
   - Build: idle and partly filled show no ring; only focus-visible has one, on the third cell (states.tsx:17).
   - Cause: packages/topclassui/src/components/otp-field/dummy/states.tsx:13 and :21 add no RING; only :17 does.
   - Fix: If the frame is right, add the RING pattern for *:nth-1 to idle and for *:nth-3 to partly filled. A ring at rest on three cells blurs what focus-visible means, so Omar should confirm first.
6. **[low] head, description**
   - Frame: One line. The head is 79 px tall.
   - Build: About 123 characters on two lines. The head is 108 px tall.
   - Cause: apps/docs/content/components/otp-field.ts:9
   - Fix: Shorten description.en (and .ar) to one line of about 80 characters or fewer, keeping 50 to 160.

## Refuted by the second reviewer (do not act)

- /en/docs/components/checkbox, Try it, select edge (shared): Recorded in DECISIONS.md 2026-10-19 under 'Kept, though the frames differ': a field's line at rest is line-strong (WCAG 1.4.11). The reviewer says so too.
- /en/docs/components/checkbox, code part, spacing (shared): It is 12 vs 10 px, within 2 px. The class conflict the reviewer found is real: CODE_PART at classes.ts:135 carries both gap-3 and gap-2.5, and the computed gap is 12 px. It is a cleanup, not a visible difference.
- /en/docs/components/checkbox, code part, note wording: The frame's note is wrong for the built control (it says 'a span'; the box is a native button), and docs-site.md says notes that are wrong for the built code are fixed in the content files. Both notes are one line, and the reviewer proposes no build change.
- /en/docs/components/checkbox, Every state, spacing (row-to-cells gap and caption gap) (shared): The row gap is 12 vs 14 px and the box-to-caption gap is 10 vs 9 px, both within 2 px. Only the caption size (12 vs 9 px) is kept.
- /en/docs/components/checkbox, card frame, shadow (shared): Not visible: on the #0a0a0a page neither the frame's 0 2 12 -4 rgba(0,0,0,.3) nor shadow-md shows. The confirmed radius fix drops shadow-md anyway, as docs-site.md (Shadows) asks.
- /en/docs/components/checkbox, play row height: Not an independent difference. The row is the taller of the stage and Try it, and Try it's shortfall is the recorded missing 'tone' select (docs-site.md: a drawn control with no prop does not appear) plus the defaultChecked toggle and the xs controls, which are already listed.
- /en/docs/components/checkbox, head, mode switch: label weight: Recorded in DECISIONS.md 2026-10-19 (SegmentedControl): segments are regular and the selected one medium. The width part is kept.
- /en/docs/components/radio-group, stage and states, checked radio: Recorded in DECISIONS.md 2026-10-16 (the checked dot and line are primary-on-soft, 5.31:1) and 2026-10-19 'What stays as built'.
- /en/docs/components/radio-group, Every state, invalid cell: Recorded in DECISIONS.md 2026-10-19 'What stays as built': an invalid radio keeps its 2 px inset line instead of an outer ring.
- /en/docs/components/radio-group, head, title 'RadioGroup' vs 'Radio group': The frames themselves use sentence case for the other field titles ('Number field', 'OTP field'), and the reviewer also says to keep 'Radio group'. The description part is kept.
- /en/docs/components/radio-group, play row height: Derived: the 311 px row comes from the recorded missing 'tone' select (RadioGroup has no tone prop). With it, the build's Try it would be taller than the frame.
- /en/docs/components/switch, Every state, off thumb: Recorded in DECISIONS.md 2026-10-16 and 2026-10-19: the off thumb stays line-strong at 3:1, where the frame's thumb is 1.1:1.
- /en/docs/components/switch, Every state, invalid cell: Recorded in DECISIONS.md 2026-10-19 'What stays as built': an invalid switch keeps its 2 px inset line instead of an outer ring.
- /en/docs/components/switch, play row height: Derived from the recorded missing 'tone' select plus the defaultChecked toggle and the xs controls, which are already listed.
- /en/docs/components/slider, stage and states, knob size: Recorded in DECISIONS.md 2026-10-19: the slider knob keeps the old steps (20 px at md), where the frame draws 18 px.
- /en/docs/components/slider, stage and states, track edge: Recorded in DECISIONS.md 2026-10-19 'What stays as built': the slider track keeps its line-strong edge (R-5.6-4).
- /en/docs/components/slider, play row height: Derived: the 311 px row comes from the 'tone' and 'orientation' selects, which have no supported prop and are recorded as not drawn. The new two-slider stage (about 54 px) fits inside the current row.
- /en/docs/components/number-field, stage and Every state, field line (idle and hover): Recorded in DECISIONS.md 2026-10-19: a field's line at rest is line-strong, and hover steps it up to body (FIELD_HOVER).
- /en/docs/components/number-field, stage, field width: Recorded in DECISIONS.md 2026-10-19: control widths are the --tc-input-width knob (193 px), not the frames' 170 to 230 px samples.
- /en/docs/components/number-field, Every state, at-limit and invalid cells: Recorded in DECISIONS.md 2026-10-19: a NumberField at its limit is not an error, so it is not red, and invalid stays a 2 px line instead of an outer ring.
- /en/docs/components/number-field, Every state, disabled cell: Recorded in DECISIONS.md 2026-10-19: 'A disabled field sits on surface before it dims (FIELD_DISABLED)'. The reviewer marks it as a recorded decision too.
- /en/docs/components/number-field, play row height: Derived from the recorded missing 'variant' select plus the missing 'step' select, which is already listed.
- /en/docs/components/otp-field, Every state, cell size and focus style: There is no permissible fix. The xs cell (28x32) follows the recorded cell scale (DECISIONS.md 2026-10-19: one control step taller than wide), a 20 px cell would break R-5.6-2's 24 px floor, and the 2 px outline at a 2 px offset is the library's FOCUS_RING that R-5.6-1's probe requires. The reviewer proposes no fix either.
- /en/docs/components/otp-field, Every state, invalid cell: Recorded in DECISIONS.md 2026-10-19: invalid stays a 2 px line.
- /en/docs/components/otp-field, play row height: Derived from the missing validationType select (already listed) and the xs control sizes (listed under checkbox).
