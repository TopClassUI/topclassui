# Figma audit 2, job 144 feedback

Second audit on preview/r8-all 6963704f (preview 99ae7ded with 144, 146, 141 and 147 merged; the lead has since merged the same) at 1440 dark: every first-audit row re-checked (still open) plus a fresh pass (new), each re-checked by a second reviewer. Close every row or record why it stays.

## /en/docs/components/alert: differs (1)

Note: Checked again against get_metadata of 137:1708, get_design_context of its head (137:1709), playground (137:1754), code (148:1049) and states (137:1787), r13/card-alert.png and a fresh DOM dump (r13-review/job-144-feedback-verify/dom-alert.json, alert-*.png bands). Of the reviewer's three rows, one survives: the chip is still 6 px taller. S4 (switch) is refuted because every part is within 1 px. S8 (mono font) is refuted as a recorded choice. The stage pair (340x62 at y 76 of the stage), the 286 row, the 211x28 selects, the 142x31 strip alerts with 14 px icons and padding 7/9 plus the edge, Install 80x28 and Copy 72x28 all match. The fresh pass found nothing new.

1. **[low] head, chip beside the name (S2)**
   - Frame: 85x16: 9 px Roboto Mono Regular on a 12 px line, padding 2/7, radius 4, success soft, no border
   - Build: 109.6x22: 12 px mono on a 16 px line (text-xs), padding 2/7, radius 4, with Badge's 1 px transparent border above and below. The 12 px step is the agreed snap and accounts for the width. The box is still 6 px taller: 4 px from the 16 px line and 2 px from the border
   - Cause: apps/docs/components/previewer/previewer.tsx:91 renders <Badge size="xs" className="px-1.75 font-mono font-normal">. BADGE_SIZE.xs is 'px-1 py-pad-y-xs gap-1 text-xs' (packages/topclassui/src/components/badge/classes.ts:38), and the Badge root always carries BORDER_WIDTH (badge/variants.ts:17, 'so changing the variant never moves the layout'), which ON_SOFT makes transparent
   - Fix: At previewer.tsx:91 use className="px-1.75 py-px font-mono font-normal leading-3": 1+1+12+1+1 = 16 px. Keep the transparent border, because forced colours paint it as the chip's edge. The reviewer's border-0 would remove that edge and make the chip a different size from an outline Badge. Optionally text-[0.6875rem], the site's 11 px TYPE.eyebrow step, to bring the width closer to the frame's

## /en/docs/components/banner: differs (3)

Note: Checked again against get_metadata of 137:1991 and get_design_context of 137:1997 (chip), 137:2023 (stage) and 137:2065 (states), r13/card-banner.png, a fresh DOM dump and the bands in r13-review/job-144-feedback-verify/ (banner-row, banner-stage2x, banner-states). The stage banner matches: 460x57 at y 127 of a 311 row, centred, 18/11 padding, Read more 12 px after the text and 12 px before the x. The chip's 6 px and the strip chips' 12 px type survive. S4 and S8 are refuted. One row is added: the note does not use the frame's sentence. THE CODE's stage-tuning classes are the dummy file, which is exempt.

1. **[low] head, chip beside the name (S2)**
   - Frame: 204x16: 9 px Roboto Mono on a 12 px line, padding 2/7, info soft, no border
   - Build: 'split - 0 KB server + 16.2 KB client' 275.2x22: 12 px mono on a 16 px line plus a 1 px transparent border top and bottom. 6 px taller than the frame (the wording is generated)
   - Cause: apps/docs/components/previewer/previewer.tsx:91 (Badge xs: text-xs with its 16 px line, badge/classes.ts:38; the always-on BORDER_WIDTH, badge/variants.ts:17)
   - Fix: previewer.tsx:91 className="px-1.75 py-px font-mono font-normal leading-3" (16 px, keeping the transparent border for forced colours)
2. **[low] Every state, the primary, info and warning chips and the 'hidden' text**
   - Frame: 58x26, 61x27 and 77x27: 9 px Roboto Mono, padding 7/10, radius 4, 13 px icons 6 px from the text. 'hidden' is 9 px
   - Build: 70.4x29, 67.8x29 and 89.4x29: 12 px mono on a 15 px line, padding 7/10, radius 4, 13 px icons, gap 6. 'hidden' is 12 px. The strip's own captions use the 11 px step, so the chips read larger than their captions where the frame draws them the same size
   - Cause: packages/topclassui/src/components/banner/dummy/states.tsx:9 CHIP '... font-mono text-xs/tight font-normal' and :19 'font-mono text-xs text-muted'
   - Fix: states.tsx:9 text-xs/tight → text-[0.6875rem]/tight (about 27.75 px tall, the frame's 26/27) and :19 text-xs → text-[0.6875rem], the 11 px step the strip captions already use
3. **[low] (added by verifier) THE CODE, the note under the code**
   - Frame: 'Dismissal is remembered per id, so change the id when the message changes.' (148:1095, 389 px)
   - Build: 'Dismissal is remembered per id in this browser, so change the id when the message changes.' Alert, Toast and Popover now use their frames' sentences, and Banner does not
   - Cause: apps/docs/content/components/banner.ts:10 (and the Arabic at :11)
   - Fix: Use the frame's sentence at banner.ts:10-11, as Alert, Toast and Popover do. Alternatively keep 'in this browser', which is more exact because dismissal is stored per browser, and treat the frame's copy as the first draft docs-site.md says it is

## /en/docs/components/toast: differs (4)

Note: Checked again against get_metadata of 137:1841 and get_design_context of 137:1919 (states), r13/card-toast.png, a fresh DOM dump, the bands toast-row, toast-tryit2x, toast-states2x and toast-stack3x in r13-review/job-144-feedback-verify/, and a live wait test: the resting stage toast stays up after 12 s. The resting toast matches: 320x68, centred at 181/121.5 in the 682x311 stage, 14 px padding, x 15 px from the edge. The six cells sit on one row at 149 px. Survivors: the extra button (fix corrected), the chip height, the duration display and the strip label size. The stack row is restated: its bottom touching the caption matches the frame's, and its 3.5 px into the empty header row covers nothing. S4 and S8 are refuted.

1. **[medium] stage, the 'Show a toast' button**
   - Frame: Only the resting toast: 320x67, centred (x 187, y 122 of the 694x311 stage)
   - Build: The resting toast is centred and matches. An outline 'Show a toast' Button is drawn as well: 120.2x40, 14 px medium, 1 px line-strong edge, pinned to the stage's top-start corner (20, 20)
   - Cause: packages/topclassui/src/components/toast/dummy/playground.tsx:21 <div className="absolute top-0 inset-s-0">{button}</div> in the stage branch, added by 6360f48e. apps/docs/e2e/feedback-pages.spec.ts:101 clicks it. DECISIONS.md:186's 'on the site it is still a button that adds one' describes the stage before ToastStage existed, so nothing records the button and the drawn toast together
   - Fix: Either record it: rewrite DECISIONS.md:186 to say the stage keeps the button beside the resting toast, because it is the only way a reader sees Try it's duration and priority act on a live toast and because feedback-pages.spec.ts:101 drives Try it through it. Or match the frame: delete playground.tsx:21, keep the button only in the non-stage return (:18), and point feedback-pages.spec.ts:101 at the stage toast. Deleting it alone leaves duration and priority with nothing visible to act on
2. **[low] head, chip beside the name (S2)**
   - Frame: 96x16: 9 px Roboto Mono, padding 2/7, primary soft, no border
   - Build: 'client - 19.9 KB' 131.2x22: 12 px mono on a 16 px line plus a 1 px transparent border top and bottom (6 px taller)
   - Cause: apps/docs/components/previewer/previewer.tsx:91 (Badge xs text-xs, badge/classes.ts:38; BORDER_WIDTH, badge/variants.ts:17)
   - Fix: previewer.tsx:91 className="px-1.75 py-px font-mono font-normal leading-3"
3. **[low] Try it, duration**
   - Frame: '5000' in 11 px Roboto Mono, start-aligned in a 208x29 field with a caret (137:1900)
   - Build: '5,000' with a grouping comma, in 12 px Inter medium in body white, centred between − and + in a 211x28 NumberField. Every other Try it value is mono and start-aligned
   - Cause: apps/docs/components/previewer/try-it-control.tsx:89-98: NumberField with no format and no className. NUMBER_FIELD_INPUT (packages/topclassui/src/components/number-field/classes.ts:15) is 'text-center font-medium tabular-nums'
   - Fix: try-it-control.tsx:89 add format={{ useGrouping: false }} (NumberFieldValueProps picks format, number-field/types.ts:33) and className="font-mono". The control's kind stays as S7 chooses it
4. **[low] Every state, the panel labels and the stack's height**
   - Frame: Labels in 9 px Roboto Mono (body on the single panels, muted on the stack). Single panels 134x34 (1 px edge + 9 px padding, 14 px icon, 7 px gap). Stack panels 120/112/104 x 30 (8 px padding), overlapping 6 px: the stack is 78 px and overhangs its 56 px row by 11 px each side
   - Build: Labels in 12 px mono on 15 px lines. Single panels 136x35, within 2 px. Stack panels are 33 px tall, so the stack is 87 px (y 835.4-922.4) and overhangs its 56 px box by 15.5 px each side. Its bottom meets the 'stacked' caption's ascenders as the frame's does. Its top sits in the empty middle of the header row and covers nothing
   - Cause: packages/topclassui/src/components/toast/dummy/states.tsx:17 Panel '... font-mono text-xs/tight ...'. STACKED 'p-2 text-muted' at :12
   - Fix: states.tsx:17 text-xs/tight → text-[0.6875rem]/tight. The single panels then hold their 14 px icon at 1+9+14+9+1 = 34 px, the frame's height, and the stack panels are about 31.75 px (stack about 83). Add STACKED 'p-1.75 text-muted' for the frame's 30 px stack panels and 78 px stack

## /en/docs/components/tooltip: differs (4)

Note: Checked again against get_metadata of 138:2273 and get_design_context of 138:2305 (stage) and 138:2346 (states), r13/card-tooltip.png, a fresh DOM dump, and live 2x shots (live-tooltip-row.png, live-tooltip-states.png and a scroll test, flip.mjs, in r13-review/job-144-feedback-verify/). The description wrap is real: the sentence measures 570.9 px in a 570 px column. The cause is restated: 12 px of the 20 px column loss is the shell's 932 px card, and 8 px is the head cluster. The stage-trigger row is refuted. Figma's 'Button' 138:2311, and the hidden cell's 138:2354, are empty 100x100 frames: Figma's default new-frame size, no children, the Copy button's px 10 / py 6 styling, and the strip one overflowing its 58 px row at y -21. That is a drawing artefact. The frame's own code (150:1089) names a ghost IconButton with link-simple, which the build draws. The reviewer's playground line numbers were wrong (the file is 54 lines) and are corrected below. S4 survives only as the cause of the wrap, and S8 is refuted.

1. **[medium] head, description (S3)**
   - Frame: One line ('One or two lines of text on hover; a shared delay makes the next tooltip open instantly.') in a 590 px column. Head 79 px
   - Build: The sentence measures 570.9 px against a 570 px column, so 'instantly.' wraps to a second line (lines 507.8 + 59.2 px). The head is 97.5 px, and the stage, code, strip and install row all sit 18.5 px lower
   - Cause: The column is 894 − 10 − 314 = 570 px, where the frame's is 906 − 10 − 306 = 590. 12 px of the difference is the card's 932 px width (main 1020 px with 44 px gutters, the recorded single shell spacing). 8 px is the right cluster: switch 224.1 against 217 (SEGMENTED_ITEM_SIZE.sm 'px-2.5', SEGMENTED_ITEM 'gap-1.5', packages/topclassui/src/components/segmented-control/classes.ts:39 and :28, used by apps/docs/components/previewer/card-mode-switch.tsx:41) plus Install 80 against 79. The sentence is apps/docs/content/components/tooltip.ts:6
   - Fix: card-mode-switch.tsx:41: give SegmentedControlItem className="gap-1.25 px-2.25", which makes the switch about 215 px and the column about 579 px, so the 570.9 px sentence fits. Otherwise shorten tooltip.ts:6, for example 'One or two lines of text on hover; a shared delay opens the next tooltip instantly.'
2. **[medium] Every state strip, cell height and the drawn triggers**
   - Frame: 58 px rows of 227 px cells. top and bottom draw only a 'Tip' chip (34x23, px 8 / py 4, 12 px Inter, radius 8) with its 9x5 arrow, and no trigger. Captions sit 67 px below the cell top
   - Build: 224x112 cells (h-28). top and bottom each draw a 48x40 ghost icon Button (arrow-up, arrow-down) with a 'Top' (37.4x24) or 'Bottom' (56.5x24) tip held open beside it. Captions sit 122 px below the cell top, so the row is 138 px against the frame's 79
   - Cause: packages/topclassui/src/components/tooltip/dummy/states.tsx:12 CELL 'relative flex h-28 w-56 items-center justify-center overflow-hidden [contain:paint]' and :23, the hidden cell's own 'h-28 w-56'. The triggers at :37-43 and :49-55 exist because a held-open tooltip needs an anchor (DECISIONS 2026-10-19 overlays: real components drawn open), but no entry says the strip shows them. The words at :39/:44 and :51/:56 are pinned by the tooltip demos test
   - Fix: Set CELL and :23 to h-19 (76 px). Add items-end in the top cell and items-start in the bottom cell, so the tip (24 px plus the 11 px measured to its trigger) stays inside the clipping cell: 1 + 24 + 11 + 40 = 76. The reviewer's h-18 with a centred trigger leaves 16 px above the trigger, so overflow-hidden would cut the 'Top' tip. Record in DECISIONS that the strip draws each tip's trigger. Renaming the tips 'Tip', with the tests renamed, is optional wording
3. **[low] stage, tip text**
   - Frame: 'Copy to clipboard', chip 125x23 (138:2307)
   - Build: 'Copy link', chip 76.7x24 (px 12 / py 4, 12 px, radius 8, as drawn)
   - Cause: packages/topclassui/src/components/tooltip/dummy/playground.tsx:23 and :28 (stage branch) and :46 and :51 (the usage THE CODE shows). It is pinned by test/tooltip.aria.dom.test.tsx, test/tooltip.delay.dom.test.tsx and apps/docs/e2e/overlay-pages.spec.ts:20 and :220. The frame contradicts itself: its own code (150:1089) says 'Copy link', and its note says the tip must repeat the trigger's label
   - Fix: Preferably redraw Figma 138:2307 as 'Copy link', which agrees with the frame's code and note. Otherwise use 'Copy to clipboard' in the aria-label and popup at playground.tsx:23, :28, :46 and :51 and update those tests
4. **[low] head, chip beside the name (S2)**
   - Frame: 96x16: 9 px Roboto Mono, padding 2/7, primary soft, no border
   - Build: 'client - 12.8 KB' 131.2x22: 12 px mono on a 16 px line plus a 1 px transparent border top and bottom (6 px taller)
   - Cause: apps/docs/components/previewer/previewer.tsx:91 (Badge xs text-xs, badge/classes.ts:38; BORDER_WIDTH, badge/variants.ts:17)
   - Fix: previewer.tsx:91 className="px-1.75 py-px font-mono font-normal leading-3"

## /en/docs/components/popover: differs (5)

Note: Checked again against get_metadata of 138:2132 and get_design_context of 138:2164 (stage) and 138:2227 (open cell), r13/card-popover.png, a fresh DOM dump, live 2x shots (live-popover-row.png, live-popover-states.png), pop-stage2x.png and a scroll test, all in r13-review/job-144-feedback-verify/. The code overflow is confirmed: pre scrollWidth 1015 against clientWidth 894. The reviewer's playground line numbers (:70, :76, :92, :98) do not exist in the 56-line file and are corrected below. The cell-height fix's arithmetic was 1 px short and is corrected. The panel row keeps its size and label numbers. The trigger and panel words are refuted as wording. S4 and S8 are refuted.

1. **[medium] THE CODE, horizontal overflow**
   - Frame: Every line fits the 906 px code part
   - Build: The pre scrolls sideways (scrollWidth 1015 against clientWidth 894). The PopoverTrigger line is cut at '<Svg icon={arrowSquareOut} />S' and the PopoverDescription line at '</PopoverDescrip'
   - Cause: packages/topclassui/src/components/popover/dummy/playground.tsx:45 (the trigger with render={<Button ... className="gap-1.5"><Svg icon={arrowSquareOut} />Share</Button>}) and :51 (PopoverDescription with its text) are one line each in the non-stage return that THE CODE prints. The stage branch repeats them at :23 and :29
   - Fix: Break playground.tsx:45 the way tooltip/dummy/playground.tsx:42-50 does: render={ on its own line, then the Button, the Svg and 'Share' on lines of their own. Put the description text on its own line at :51. Do the same at :23 and :29 so the stage branch stays alike
2. **[low] Every state, panel size and label type**
   - Frame: Panels 110x30: 1 px edge, 8 px padding, 'panel' in 9 px muted Roboto Mono, 4 px from the trigger. Triggers 53x29
   - Build: Panels 112x37: 1 px edge, 10 px padding (p-2.5), labels in 12 px mono on a 15 px line, 6 px from the trigger. Triggers 51.3/57.2/65.1 x 28
   - Cause: packages/topclassui/src/components/popover/dummy/states.tsx:9 PANEL 'w-28 p-2.5' and :10 LABEL 'font-mono text-xs/tight font-normal text-muted'
   - Fix: PANEL 'w-27.5 p-2' and LABEL 'font-mono text-[0.6875rem]/tight font-normal text-muted' (1+8+13.75+8+1 ≈ 32 px)
3. **[low] Every state, cell height and trigger stagger**
   - Frame: 58 px row. The closed trigger is at y 14.5. The open and flipped groups (trigger, 4 px, panel: 63 px) are centred from -2.5 to 60.5, so the three triggers span 34 px. Captions sit 67 px below the cell top
   - Build: 112 px cells (h-28). The closed trigger is centred at y 42. The open group is pinned to the top (pt-2: trigger 8-36, panel 42-79) and the flipped group to the bottom (pb-2: panel 33-70, trigger 76-104), so the triggers span 68 px. Captions sit 122 px below the cell top, and the strip section is 203 px against the frame's 142
   - Cause: packages/topclassui/src/components/popover/dummy/states.tsx:8 CELL 'h-28', :20 the closed cell's 'h-28', :29 'items-start pt-2', :37 'items-end pb-2'
   - Fix: Use h-19 (76 px) for CELL and :20, with pt-0.5 at :29 and pb-0.5 at :37: 2 + 28 + 6 + 37 = 73 fits, and the flipped panel keeps 3 px above it. The reviewer's h-18 cuts the 37 px panel by 1 px through overflow-hidden, unless the panel also shrinks to the frame's p-2 and 11 px label (about 32 px), in which case h-18 holds it
4. **[low] stage, Share and Copy link button icons and padding**
   - Frame: Share 76x29: px 10 inside a 1 px edge, 14 px arrow-square-out, gap 6. Copy link 98x29: px 12 / py 7, 14 px copy icon, gap 6
   - Build: Share 69.3x28: px 8, 12 px icon, gap 6. Copy link 91.3x28: px 8, 12 px icon, gap 8. The icons are visibly smaller at 2x, and Copy link loses 4 px of padding on each side
   - Cause: packages/topclassui/src/components/popover/dummy/playground.tsx:23 and :45 (Share) and :30 and :52 (Copy link): Button size="xs", and <Svg> defaults to 1em, which is 12 px
   - Fix: <Svg ... size="0.875rem" /> in both buttons. className="gap-1.5 px-2.5" on Share (:23, :45) and className="self-start gap-1.5 px-3" on Copy link (:30, :52). Make this together with the line breaks above, so THE CODE still fits
5. **[low] head, chip beside the name (S2)**
   - Frame: 96x16: 9 px Roboto Mono, padding 2/7, primary soft, no border
   - Build: 'client - 16.4 KB' 131.2x22: 12 px mono on a 16 px line plus a 1 px transparent border top and bottom (6 px taller)
   - Cause: apps/docs/components/previewer/previewer.tsx:91 (Badge xs text-xs, badge/classes.ts:38; BORDER_WIDTH, badge/variants.ts:17)
   - Fix: previewer.tsx:91 className="px-1.75 py-px font-mono font-normal leading-3"

## Refuted by the second reviewer (do not act)

- /en/docs/components/alert, (still open) head, Light/Dark/Ocean switch (S4): Every part is within 1 px: segment padding 10 against 9, icon gap 6 against 5, segments 24 against 23, track 32 against 31, 14 px icons as drawn. The 7 px total width changes nothing visible on this card.
- /en/docs/components/alert, (still open) all mono text (S8): A recorded choice: docs-site.md:422-425 says Figma's Roboto Mono is not loaded and code uses the site's --tc-font-mono. Geist Mono was loaded on purpose in 7424203d, and job 150 kept it on docs-site.md (round-11.md:50). Weight is 400 everywhere (probed). That docs-site.md still names the system stack is a docs fix, not a Figma difference.
- /en/docs/components/banner, (still open) head, Light/Dark/Ocean switch (part of the S2/S4 row): Within 1 px per part (px 10 against 9, gap 6 against 5, 32 against 31 px), and the banner's description still fits on one line. The chip half of the row is kept.
- /en/docs/components/banner, (still open) mono text (S8): Recorded: docs-site.md:422-425 rules out Roboto Mono, and Geist Mono is a deliberate commit (7424203d) that job 150 kept.
- /en/docs/components/toast, (still open) head, Light/Dark/Ocean switch (part of the S2/S4 row): Within 1 px per part, with no effect on the one-line description (570 px column, sentence fits). The chip half is kept.
- /en/docs/components/toast, (still open) mono text (S8): Recorded: docs-site.md:422-425 rules out Roboto Mono, and Geist Mono is a deliberate commit (7424203d) that job 150 kept.
- /en/docs/components/toast, (new) Every state, the stack 'reaches into the header row' and 'runs into the caption': Not visible. The top panel overlaps only the empty middle of the header row ('Every state' and '6 states' sit at the two ends), and at 3x the bottom panel meets the caption's ascenders exactly as the frame's does (the frame's stack also overlaps its caption by 2 px). The stack's 9 px of extra height is kept in the label-size row.
- /en/docs/components/tooltip, (still open) stage trigger: The reviewer read a Figma artefact as design. 138:2311 'Button' is an empty 100x100 frame: Figma's default new-frame size, no children, and the Copy button's px 10 / py 6 surface-and-line styling. The frame's own code (150:1089) names a ghost IconButton with link-simple, which the build draws (48x40 ghost Button, 14 px link-simple). The chip's y 88.5 against 101 follows from that box.
- /en/docs/components/tooltip, (still open) Every state strip, the hidden cell's 100x100 box: The same artefact. 138:2354 is an empty 100x100 'Button' at 50% that overflows its own 58 px row (y -21 to 79) and encloses its caption. The build's resting ghost link trigger is what the frame's code describes. The kept strip row covers the cell height and the triggers.
- /en/docs/components/tooltip, (still open) head, Light/Dark/Ocean switch (part of the S2/S4 row): On its own every part is within 1 px. Its only visible effect, the description wrapping by 0.9 px, is kept in the description row with the switch fix as the remedy.
- /en/docs/components/tooltip, (still open) mono text (S8): Recorded: docs-site.md:422-425 rules out Roboto Mono, and Geist Mono is a deliberate commit (7424203d) that job 150 kept.
- /en/docs/components/popover, (still open) Every state, the trigger and panel words ('Share', 'Details', 'Settings' against 'Open' and 'panel'): Demo wording with the same layout (a centred xs trigger, a panel below or above it). Share is 51.3 px against Open's 53. The size and type differences of the panels are kept in their own row.
- /en/docs/components/popover, (still open) head, Light/Dark/Ocean switch (part of the S2/S4 row): Within 1 px per part, and the description fits on one line (531 px in a 570 px column). The chip half is kept.
- /en/docs/components/popover, (still open) mono text (S8): Recorded: docs-site.md:422-425 rules out Roboto Mono, and Geist Mono is a deliberate commit (7424203d) that job 150 kept.
