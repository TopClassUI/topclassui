# Figma audit 2, job 140 fields-1

Second audit on preview/r8-all 694273fe at 1440 dark: every first-audit row re-checked (still open) plus a fresh pass (new), each re-checked by a second reviewer. Close every row or record why it stays.

## /en/docs/components/checkbox: differs (4)

Note: I checked all four rows against Figma 135:1086 (head 135:1087, playground 135:1127, code 150:983, install 135:1192), the r12 capture and live 2x shots (r12-review/job-140-fields-1-skeptic/z-chip.png, z-install-right.png, z-code.png, live2.json). All four are real. The chip and Try it rows stand as written. The install-inset row stands with corrected framing: the 2 px text-start gap is within tolerance, but the icon inset and the crowding are not. The blank-line row is real, but the reviewer's fix does not work. I injected it live and the lines stayed 20.4 px apart, because highlight.tsx puts each line's newline inside its own span, so `span:empty` matches 0 elements. A corrected fix is given and was tested live (z-code-fix.png: 30.4 px between the import line and the JSX, the drawn 10 px gap). Side note, not a row: CODE_PART (apps/docs/components/classes.ts:140) appends gap-2.5 to CARD_PART's gap-3 without cn(), so the computed gap is 12 px against the drawn 10, which is within 2 px. The tone select is missing, which is recorded (unit-4.md choice 14). The select's line-strong edge is recorded (DECISIONS 2026-10-19, fields). The six-cell strip is on one row (6 x 149 px).

1. **[low] (still open) Try it, defaultChecked toggle at rest**
   - Frame: All four toggles are unticked at rest: 16x16 surface-raised boxes with a 1 px line-strong edge, radius 4, 8 px to an 11 px label, 25 px pitch (135:1142).
   - Build: defaultChecked starts ticked (aria-checked=true, measured live): a 16 px primary-solid box with an 11.2 px tick. indeterminate, disabled and invalid are unticked.
   - Cause: apps/docs/content/components/checkbox.ts:17 `starts: { defaultChecked: true }` mirrors packages/topclassui/src/components/checkbox/dummy/playground.tsx:8, which hard-codes `defaultChecked` on the playground box.
   - Fix: Delete `starts` at checkbox.ts:17 and remove `defaultChecked` from playground.tsx:8. The toggle then starts unticked, as drawn, and ticking it passes defaultChecked to the playground. No e2e or unit test pins the current start.
2. **[low] (still open) head, chip (shared by all six cards)**
   - Frame: Chip 96x16: 9 px Roboto Mono regular, px 7, py 2, radius 4, primary/soft fill, primary/on-soft text.
   - Build: Chip 131.2x22: 12 px Geist Mono on a 16 px line, px 7, py 2, plus a 1 px transparent border. The text is 3 px larger than drawn, and 1-2 px off the site's own 10 and 11 px steps, so this is not a type-scale snap. The chip is 6 px taller. Its longer text is the generated chip and is not counted.
   - Cause: apps/docs/components/previewer/previewer.tsx:91 `<Badge ... size="xs" className="px-1.75 font-mono font-normal">`. Badge xs is `px-1 py-pad-y-xs gap-1 text-xs` (packages/topclassui/src/components/badge/classes.ts:38) with a 1 px border.
   - Fix: At previewer.tsx:91 use className="px-1.75 py-px font-mono font-normal text-[0.6875rem] leading-3". cn() replaces text-xs and py-pad-y-xs, giving 11 px text on a 12 px line, plus 1 px of padding and a 1 px border each side: a 16 px chip. 11 px is the step the site already uses for the drawn 9 px state captions (STATE_CAPTION, TYPE.eyebrow).
3. **[low] (still open) install row, copy field insets and text crowding the copy icon (shared)**
   - Frame: Field 434.5x34, pl 12, pr 8, gap 8, 10.5 px Roboto Mono (135:1202). The text starts 13 px in. The 14 px icon ends 9 px from the field's end edge. The 59-character import (about 372 px) leaves about 27 px clear before the icon.
   - Build: Field 428x34, ps 10, pe 0, gap 2, 11 px Geist Mono, then a 24 px copy button. The text starts 11 px in, which is within tolerance. The icon ends 6 px from the end edge. The 389.4 px line ends 7.6 px before the icon (measured live), so the import runs almost into the icon.
   - Cause: apps/docs/components/classes.ts:148 COPY_FIELD `gap-0.5 ps-2.5 pe-0`, :150 COPY_FIELD_TEXT `text-[0.6875rem]` (11 px, 6.6 px per character) and :151 COPY_FIELD_BUTTON `size-6 px-0`. At 11 px the line fills the box, so the insets were cut to fit it.
   - Fix: Set COPY_FIELD_TEXT at :150 to text-[0.65625rem] (the drawn 10.5 px) and COPY_FIELD at :148 to ps-3 pe-0.5. Tested live: text at 13 px, icon end at 8 px, 21.3 px clear on checkbox, and the OTP line fits one line. 10.5 px is off the site's type scale, so this needs a line under docs-site.md row 6. The on-scale alternative is text-[0.625rem] (10 px, the step the row's own notes use): tested live, it gives 39 px clear on checkbox, and OTP fits one line at 34 px.
4. **[low] (new) code part, gap between the import lines and the JSX (shared)**
   - Frame: The imports and the JSX are two text blocks with a flex gap of 10 px (150:983). The imports are 10 px on a 17 px pitch and the JSX 11 px on 18.7, so the last import line's top is 27 px above the first JSX line's top.
   - Build: A full blank code line separates them. Import line top y 359, blank line 379.4, first JSX line 399.8: 40.8 px, where the drawn 10 px gap would give 30.4 at the build's 20.4 px line. Same on all six cards.
   - Cause: apps/docs/lib/usage.ts:132 joins imports and JSX with '\n\n'. apps/docs/lib/highlight.tsx:37-41 renders each line as `<span>…{'\n'}</span>`, so the blank line is `<span>\n</span>`: a full 20.4 px line box at line-height 1.7 (globals.css:326-329). It is not `:empty`, so the reviewer's `.shiki > span:empty` rule matches nothing: tested live, the spacing stayed 20.4/20.4.
   - Fix: In apps/docs/lib/highlight.tsx:37 render `<span key={row} data-blank={line.length === 0 ? '' : undefined}>`. In apps/docs/app/globals.css inside the @layer utilities block after :336, add `.docs-flat-code .shiki > span[data-blank] { display: block; block-size: 0.625rem; overflow: hidden; }`. Tested live: the lines land at 633, 651.4, 663.4, 683.8, so the import-to-JSX distance is 30.4 px (the drawn 10 px gap), the other lines keep 20.4, and the pre is 10.4 px shorter.

## /en/docs/components/radio-group: matches (0)

Note: Confirmed against 135:1207 and the r12 capture. Stage: Monthly, Yearly (checked), Lifetime, 85.5x92, centred (stage centre 341 of 682, drawn 347 of 694), 34 px pitch. Try it: size, orientation (vertical), disabled, required, invalid, in the drawn order. Recorded and not reported: no tone (unit-4 choice 14), the primary-on-soft checked dot and line (DECISIONS 2026-10-16 and the 2026-10-19 form-controls entry), the invalid 2 px inset line, and the line-strong select edge. The six cells unselected, selected, hover, focus-visible, disabled and invalid are on one row (149 px each). 'Then import it' wraps in both the frame (48 px) and the build (50 px). The shared chip, install-inset and blank-line rows under checkbox apply here.


## /en/docs/components/switch: differs (1)

Note: Confirmed against 135:1334 and the r12 capture. Stage: 42x24 off and on switches, 16 px apart, centred. The off thumb sits 2 px from its end against the drawn 3, which is within tolerance. Recorded: no tone select, the line-strong off thumb, the invalid 2 px inset line. The description runs two lines in both. The strip is on one row, and the import fits one line. The shared rows under checkbox apply.

1. **[low] (still open) Try it, defaultChecked toggle at rest**
   - Frame: defaultChecked, disabled, required and invalid are all unticked 16 px boxes with a line-strong edge (135:1387).
   - Build: defaultChecked starts ticked (aria-checked=true, measured live): a 16 px primary-solid box with an 11.2 px tick. The other three are unticked.
   - Cause: apps/docs/content/components/switch.ts:17 `starts: { defaultChecked: true }`, which exists because packages/topclassui/src/components/switch/dummy/playground.tsx:8 hard-codes `defaultChecked`.
   - Fix: Delete `starts` at switch.ts:17 and remove `defaultChecked` from switch/dummy/playground.tsx:8. The toggle then starts unticked, as drawn, and drives the playground switch both ways.

## /en/docs/components/slider: differs (1)

Note: Confirmed against 135:1455 (stage group 135:1488 is 260x54 at x 217 of 694; both tracks are 260x6; the fills of 104 and 182 px are drawn past the track, read as 40% and 70%) and against the r12 DOM. Recorded and not reported: the 20 px knob, the line-strong track edge, no tone select, and no orientation select (unit-4.md, Slider: 'a vertical look … not built'). The strip is on one row with 108 px tracks, and the import fits.

1. **[medium] (still open) stage, two sliders: track length, centring and pitch**
   - Frame: A 260x54 group centred in the stage (x 217 to 477 of 694). Two 260 px, 6 px tracks at 40% and 70%. Knob rows of 18 px start 36 px apart, so the tracks are 36 px apart.
   - Build: Each Slider root is 288 px (w-72), but its grid column is capped at --tc-input-width (193.2 px), so the track is 165.2 px (stage x 211 to 376) with fills of 66.1 and 115.6 px. The visible pair is centred at stage x 293.6 against a stage centre of 341: 47 px left of centre, with 95 px empty on its end side. The roots are 24 px tall with gap-4.5, so the tracks are 42 px apart.
   - Cause: packages/topclassui/src/components/slider/dummy/stage.tsx:6-8: `<div className="grid gap-4.5">` and `<Slider ... className="w-72" />` without fullWidth. SLIDER_ROOT carries FIELD_HOLDER `grid-cols-[minmax(0,var(--tc-input-width))]` (packages/topclassui/src/shared/classes.ts:247), so the column stays 193.2 px whatever the root's width.
   - Fix: At stage.tsx:7-8 add fullWidth to both Sliders. client.tsx:67 merges cn(SLIDER_ROOT, …, SLIDER_FULL, className), so w-72 still beats w-full, and grid-cols-1 replaces the capped column. The track is then 288 - 2 x 14 = 260 px, centred. At :6 change gap-4.5 to gap-3, so the 24 px roots put the tracks 36 px apart, as drawn.

## /en/docs/components/number-field: matches (0)

Note: Confirmed against 135:1594 and the r12 capture. Stage: a bare 40 px field with 32x40 steppers and 14 px icons, '12' at 14 px weight 500, centred. Try it: size, step (1), then disabled, invalid, required, fullWidth, in the drawn order. Recorded: the 193 px --tc-input-width field against the drawn 170, the line-strong and hover lines, an at-limit field that is not red, the invalid 2 px line, the disabled field on surface, and no variant select (unit-4.md, NumberField 'Not built'). The frame's focus-visible ring (135:1712, 2 px, 5 px out) is clipped by the Input's overflow-clip in the export, so the build's visible blue ring follows the drawn intent. The strip is on one row (120x40 fields in 149 px cells). 'Then import it' wraps in both (48 against 50 px). The dark band at the bottom of the r12 capture is a capture artifact: with the card's bottom at y 899, elementFromPoint 10 and 25 px above it hits the card's own install column and its note (live4.mjs), and probe-bottom.png shows the note intact. The shared rows under checkbox apply.


## /en/docs/components/otp-field: differs (4)

Note: Confirmed against 135:1768 (states 135:1847 read in full) and live measurements (live2.json, live6.mjs, z-otp-bottom.png). Recorded and not reported: the 40x48 md cell and 28x32 xs cell, the line-strong edge, the invalid 2 px line on every cell, the focus mark as the shared outside ring rather than the drawn inner 2 px border (unit-4 choice 23), and cells that hug their text (not built). The bottom band in the r12 capture is a capture artifact, as on number-field.

1. **[medium] (still open) install row, 'Then import it' line wraps**
   - Frame: "import { OTPfield } from '@/topclassui/components/otp-field'" fits one line at 10.5 px (about 378 px of 390.5) in a 434.5x34 field.
   - Build: "import { OTPField } from '@/topclassui/components/otp-field'" is 60 characters at 11 px Geist Mono (6.6 px each), 396 px in a 390 px box. It wraps after 'otp-' into two lines, and the field is 428x50 (measured live: 2 line rects), which makes the card 16 px taller.
   - Cause: apps/docs/components/classes.ts:150 COPY_FIELD_TEXT `text-[0.6875rem]` (11 px). The box is 428 - 2 border - 10 ps - 2 gap - 24 button = 390 px (classes.ts:148, :151).
   - Fix: The same change as the checkbox install row: COPY_FIELD_TEXT at :150 to text-[0.65625rem] (10.5 px, which needs a docs-site row-6 note) or text-[0.625rem] (10 px, an existing site step), and COPY_FIELD at :148 to ps-3 pe-0.5. Both were tested live: the line fits one line and the field is 34 px tall.
2. **[medium] (new) Every state, four-cell groups crowd one another**
   - Frame: Each 151 px cell holds a 95 px group: four 20 px cells with 5 px gaps and 28 px clear on each side. The groups are 56 px apart, so the six states read as six separate fields.
   - Build: Each 149 px cell (abutting, gap-x-0) holds a 136 px group: four 28x32 xs cells with 8 px gaps and 6.5 px clear on each side (measured live). The groups are 13 px apart against 8 px inside a group, so the strip reads as one row of 24 boxes.
   - Cause: packages/topclassui/src/components/otp-field/dummy/states.tsx:13, 17, 21, 25, 29 and 33 render length={4} size="xs" with OTP_ROOT's gap-2 (packages/topclassui/src/components/otp-field/classes.ts:8, merged by cn at client.tsx:53). STATE_GRID gap-x-0 and STATE_CELL basis-36 (apps/docs/components/classes.ts:221-222) make the cells abut.
   - Fix: Give each strip field the drawn 5 px gap: className="gap-1.25" at states.tsx:13, 21, 25, 29 and 33, and className={`${RING} gap-1.25`} at :17. cn() replaces gap-2. Each group becomes 127 px, the groups 22 px apart, and the 2 px ring at a 2 px offset still clears the next cell by 1 px.
3. **[low] (still open) Try it, missing validationType select**
   - Frame: A validationType select showing 'numeric' (208x29) sits between length and size (135:1821).
   - Build: There is no such control. The controls are length, size, mask, autoSubmit, disabled and invalid (measured live).
   - Cause: validationType reaches the component as a Base UI pass-through (types.ts: Omit<Base.Root.Props, Owned>; OtpFieldValidationType at :63), but it is not in otp-field/schema.ts. Try it builds selects only from the schema; content offers only boolean extraSwitches (apps/docs/scripts/lib/content.ts:29). controlOrder at apps/docs/content/components/otp-field.ts:15 leaves it out. Nothing in unit-4.md's OTP 'Not built' list or in DECISIONS drops it.
   - Fix: Add validationType to otp-field/schema.ts as an enum of 'numeric' | 'alpha' | 'alphanumeric' | 'none', default 'numeric', with the list as an `as const` array in otp-field/constants.ts (R-8.3-2). Keep the hook's choice-21 mapping, where 'numeric' becomes Base UI 'none' with toAsciiDigits. Run pnpm readme:build. Then set controlOrder at otp-field.ts:15 to ['length', 'validationType', 'size', 'mask', 'autoSubmit', 'disabled', 'invalid'].
4. **[low] (still open) Every state, idle and partly filled cells carry no active-cell mark**
   - Frame: idle: the first 20x26 cell has a 2 px base/ring border (135:1856). partly filled: '4 8', and the third cell has the same 2 px ring border (135:1878), identical to focus-visible.
   - Build: idle: four plain cells with no mark. partly filled: '4 8' with no mark. Only focus-visible carries the ring, on its third cell (states.tsx:17).
   - Cause: packages/topclassui/src/components/otp-field/dummy/states.tsx:13 and :21 have no RING class; only :17 does.
   - Fix: If the frame stands, add a nth-1 variant of RING to idle at :13 and the existing nth-3 RING to partly filled at :21, drawn as the shared outside ring per choice 23. This makes partly filled identical to focus-visible, as drawn. The first audit asked Omar to confirm, and no decision is recorded yet.

## Refuted by the second reviewer (do not act)

- /en/docs/components/checkbox, (new) code part, blank line: the reviewer's proposed fix (`.docs-flat-code .shiki { display: grid }` + `.shiki > span:empty { block-size: 0.625rem }`): The difference is real but the fix is wrong. The blank line is `<span>\n</span>` (highlight.tsx:41 puts the newline inside each line span), so `:empty` matches 0 elements. Injected live, the lines stayed 20.4 px apart. It is replaced by the data-blank fix above.
- /en/docs/components/checkbox, install row, text start 11 px against the drawn 13 px (part of the copy-inset row): A 2 px difference is within the 1-2 px tolerance. Only the icon inset (6 px against 9) and the text-to-icon crowding (7.6 px clear against about 27) are kept.
