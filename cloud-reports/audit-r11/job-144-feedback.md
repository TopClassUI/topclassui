# Figma audit, job 144 feedback

On preview/r8-all d9c04b21 at 1440 dark, frame vs build, each difference re-checked by a second reviewer. Fix what your branch has not fixed yet; skip a row your later commits already cover.

## /en/docs/components/alert: differs (13)

Note: Re-checked against Figma design context for 137:1708 (head, row, code, states), frame PNG offset (8,6), r11/card-alert.png, dom-alert.json and my crops in r11-review/job-144-feedback-skeptic/. Every claim was re-measured. Three were dropped (see refuted): the S1 shadow, and the switch's label weight and shadow-sm. Corrected line numbers: try-it-control.tsx has 102 lines, so Select is :62-66 and Checkbox :35, not :170-174 and :143. The 3+1 wrap of the frame's states strip is a drawing artefact (4 x 227 = 908 > 906). S2 is kept because 'generated chips' covers the chip's wording (docs-site.md #18), not its type size.

1. **[medium] stage (left of Try it)**
   - Frame: Two alerts 340x61 stacked 10 px apart (group 340x132), info then success, centred in a 694x286 stage
   - Build: One info alert, 299.6x62 at auto width, centred in a 682x188 stage. No success alert
   - Cause: packages/topclassui/src/components/alert/dummy/playground.tsx:6-10 renders a single <Alert {...props}> with no width, and apps/docs/content/components/alert.ts has no stageDemo (previewer.tsx:62 already supports a stageDemo beside a playground)
   - Fix: Give the playground Alert className="w-85". Add dummy/pair.tsx (flex flex-col gap-2.5 with an info and a success Alert, both w-85, with the frame's words) and set stageDemo: 'pair' in alert.ts
2. **[medium] stage / Try it row height**
   - Frame: Row 286 px
   - Build: Row 188 px. The stage floor is 8rem (128 px), so the two-control Try it (18+16+14+54+14+54+18) sets the height
   - Cause: apps/docs/content/components/alert.ts:14 stageHeight: 8
   - Fix: stageHeight: 17.875 (286 px)
3. **[medium] Try it selects (S6)**
   - Frame: 208x29: pl 10 / pr 8 / py 6, Roboto Mono 11 px, caret 13. Fill surface-raised (38,38,38) with a line (38,38,38) edge, so no edge shows (pixel-checked)
   - Build: 211x32: px 12, Geist Mono 14 px, caret 14. Fill (38,38,38) with a clearly visible 1 px (161,161,161) line-strong edge
   - Cause: apps/docs/components/previewer/try-it-control.tsx:62-66 <Select size="sm" className="font-mono">. FIELD_SURFACE (packages/topclassui/src/shared/classes.ts:265) draws BORDER_STRONG
   - Fix: size="xs" (28 px, text-xs) with className="font-mono border-line", and CONTROL_RESERVE.select (apps/docs/components/classes.ts:181) → 'h-7 pointer-coarse:h-11'. Record in DECISIONS that the Try it field drops its 3:1 edge
4. **[medium] head, description (S3)**
   - Frame: One line, 82 characters ('Four tones, each with its own icon, so the message reads without relying on color.') in a 590 px column. Head 79 px
   - Build: Two lines (40 px), 137 characters, in a 556 px column. Head 108 px
   - Cause: apps/docs/content/components/alert.ts:6 is longer than the frame's sentence (docs-site.md:2256). The right cluster is 327.7 px against the frame's 306 (S4, S5), which narrows the column
   - Fix: Use the frame's sentence (or one of 85 characters at most) in alert.ts:6, and apply S4 and S5
5. **[low] Try it controls**
   - Frame: Selects for tone (info), variant (soft) and size (md), then checkboxes dismissible (on) and withIcon (on)
   - Build: Only the tone and variant selects
   - Cause: alert/schema.ts has only variant and tone. Controls come from the schema (docs-site.md:2361-2364), and DECISIONS.md:176 leaves size and dismissible for Omar
   - Fix: Omar's call: build size and dismissible, and add extraSwitches: ['withIcon'] (mapped to icon={null}). Otherwise leave it recorded as is
6. **[low] head, chip (S2)**
   - Frame: 16 px tall: Roboto Mono 9 px at weight 400, padding 2/7, radius 4
   - Build: Badge 26 px tall: Geist Mono 14 px at weight 500, padding 4/8, radius 4
   - Cause: apps/docs/components/previewer/previewer.tsx:89 <Badge size="sm" className="font-mono"> (badge/classes.ts:39 'px-2 py-pad-y-sm text-sm/4', medium weight)
   - Fix: size="xs" className="px-1.75 font-mono font-normal" (12 px step, as the type scale reads 9 px)
7. **[low] head, Light/Dark/Ocean switch (S4)**
   - Frame: 217x31: segments 23 tall, px 9, gap 5, 14 px icons
   - Build: 230.1x32: segments 24 tall, px 10, gap 6, 16 px icons. Each step is within 2 px, but together the switch is 13 px wider
   - Cause: apps/docs/components/previewer/card-mode-switch.tsx:41 icon size="1rem" (and size="sm" at :36)
   - Fix: Svg size="0.875rem" in card-mode-switch.tsx:41 (saves 6 px)
8. **[low] head, Install button (S5)**
   - Frame: 79x29: px 12 / py 7, 14 px icon, gap 6, 12 px medium label
   - Build: 87.6x32: px 12, 14 px icon, gap 8, 14 px medium label
   - Cause: apps/docs/components/previewer/previewer.tsx:95 <Button size="sm">
   - Fix: size="xs" (28 px, text-xs) with className="gap-1.5"
9. **[low] The code, Copy button (S7)**
   - Frame: 73x29: fill surface (23,23,23), 1 px line edge (38,38,38), px 10 / py 6, 12 px medium label, gap 6
   - Build: 83.2x32: no fill (the code part's (10,10,10) shows), 1 px (161,161,161) edge, px 12, 14 px label, gap 8
   - Cause: apps/docs/components/previewer/copy-button.tsx:49-55: variant 'outline', size="sm"
   - Fix: size="xs" className="shrink-0 gap-1.5 bg-surface border-line" (the site's own CODE_COPY, classes.ts:121, already draws this 28 px edged look for guide code)
10. **[low] card frame (S1), corner radius**
   - Frame: Corner radius 16 (rounded-[16px]). The flat top edge starts about 14 px in
   - Build: Corner radius 12 (rounded-box). The flat edge starts about 12 px in
   - Cause: apps/docs/components/classes.ts:127-129: CARD uses rounded-box, and PREVIEWER = CARD + shadow-md
   - Fix: PREVIEWER = `${CARD} ${ROUNDED_CARD}` (classes.ts:57 is already the drawn 16 px corner used on Home). docs-site.md:426-428 also asks for no shadow, so shadow-md can go
11. **[low] Every state, the four alerts**
   - Frame: Each 142x31: padding 10/8, 14 px icon, gap 10, title 'Saved' 12 px semibold
   - Build: Each 144x41.5: padding 13/11 plus a 1 px edge (14/12), 16 px icon, title 14 px semibold on a 17.5 px line
   - Cause: packages/topclassui/src/components/alert/dummy/states.tsx:12-15 uses the default (md) Alert at w-36, and Alert has no size prop (DECISIONS.md:176)
   - Fix: In states.tsx, pass className="w-35.5 px-2.25 py-1.75 **:text-xs/tight" and icon={<Svg icon={...} size="0.875rem" />} for each tone, or build Alert size sm (Omar's call) and use it here
12. **[low] The code, note**
   - Frame: One line, 406 px at 10.5 px: 'Not a live region: page content. Announce what just happened with Toast instead.'
   - Build: One line, 650 px at 12 px: 'Not a live region: it is page content. Pass role="alert" when it appears after load, or announce the event with Toast.'
   - Cause: apps/docs/content/components/alert.ts:10
   - Fix: Use the frame's sentence (docs-site.md:2257), or keep the longer one
13. **[low] all mono text: code, selects, chip, captions (S8)**
   - Frame: Roboto Mono Regular
   - Build: Geist Mono, wider and heavier
   - Cause: apps/docs/app/globals.css:10 sets --tc-font-mono to var(--font-geist-mono) first. docs-site.md:420-425 asks for the system mono stack, and DECISIONS 2026-10-21 sets tokens.css's to ui-monospace
   - Fix: Drop var(--font-geist-mono) from globals.css:10, or load Roboto Mono with next/font. Record the choice in DECISIONS either way

## /en/docs/components/banner: differs (12)

Note: Re-checked against the design context for 137:1991, r11/card-banner.png, dom-banner.json and my crop banner-stage.png. The stage banner matches: 460x57, primary soft fill, 18/11 padding, two-line message, 'Read more' semibold. Corrections: the blank code line comes from usage.ts:33 (not :31); the 'Read more' to x gap is 18 px, not 17; the checkbox fix needs a gap change. One difference added: the states chips' icons. The S1 shadow and the code's lone '>' are refuted.

1. **[medium] The code, rendered sample**
   - Frame: Every line fits the 906 px part, and there is no blank line inside the tag
   - Build: An empty line right after '<Banner'. The action line is about 125 characters and runs past the 894 px code box: it is cut at '...render={<a href="/changelog" />}>Read' and needs a horizontal scroll
   - Cause: apps/docs/lib/usage.ts:33 drops 'dismissible = true' from `passed`, because /^\w+$/ rejects a name with a default. Then :99 strips '  dismissible={dismissible}' with /[ \t]+(\w+)=\{\1\}/ and leaves its line break. The long line is packages/topclassui/src/components/banner/dummy/playground.tsx:14
   - Fix: In usage.ts:33 map each name through name.split('=')[0].trim() before the /^\w+$/ test, so :95 removes the pass-through with its line break (passThrough uses \s+). Or add jsx = jsx.replace(/\n[ \t]*(\w+)=\{\1\}(?=\n)/g, '') before :99. In playground.tsx:14 split the action's Button over lines
2. **[medium] stage / Try it row height**
   - Frame: Row 311 px, the banner centred vertically
   - Build: Row 146 px (banner centred at y 44.5)
   - Cause: apps/docs/content/components/banner.ts:14 stageHeight: 4 (64 px floor), so the two-control Try it sets the height
   - Fix: stageHeight: 19.4375 (311 px)
3. **[medium] head, description (S3)**
   - Frame: One line, 83 characters ('Full width above the header; it pushes the page down rather than covering anything.'). Head 79 px
   - Build: Two lines, 133 characters. Head 108 px
   - Cause: apps/docs/content/components/banner.ts:6. The 327.7 px right cluster narrows the column to 556 px
   - Fix: Use the frame's sentence (docs-site.md:2265-2266), and apply S4 and S5
4. **[medium] Try it select (S6)**
   - Frame: 208x29, 11 px mono. Edge in the fill's colour (38,38,38), so none shows
   - Build: 211x32, 14 px Geist Mono, 1 px (161,161,161) edge
   - Cause: apps/docs/components/previewer/try-it-control.tsx:62-66 <Select size="sm" className="font-mono">. FIELD_SURFACE draws line-strong
   - Fix: size="xs" className="font-mono border-line". CONTROL_RESERVE.select → h-7 (classes.ts:181)
5. **[low] Try it controls**
   - Frame: Selects for tone (primary), variant (soft) and placement (top), then checkboxes dismissible (on), sticky (off) and withAction (on)
   - Build: The tone select and the dismissible checkbox only
   - Cause: banner/schema.ts has only tone and dismissible. DECISIONS.md:176 leaves variant, placement and sticky for Omar. withAction is not a prop
   - Fix: Omar's call: build variant, placement and sticky. Add extraSwitches: ['withAction'] in banner.ts, mapped to action={undefined} in the playground
6. **[low] Try it, dismissible checkbox**
   - Frame: 16x16 box, radius 4, label 8 px to the right
   - Build: 20x20 box centred in a 24 px target. The visible gap to the label is 10 px
   - Cause: apps/docs/components/previewer/try-it-control.tsx:35 <Checkbox size="sm">, and CHECK_ROW gap-2 (apps/docs/components/classes.ts:177)
   - Fix: size="xs" (toggle-xs is 16 px). The 24 px target then puts 4 px around the box, so CHECK_ROW needs gap-1 to keep the drawn 8 px
7. **[low] stage banner, gap from 'Read more' to the x**
   - Frame: 12 px (gap-12 between 'Read more' and the 14 px x)
   - Build: 18 px: the text ends at x 522 and the glyph starts at 540 (12 gap + 1 px link edge + 5 px of the 24 px dismiss box before its glyph)
   - Cause: packages/topclassui/src/components/banner/classes.ts:26 DISMISS 'ms-auto -me-1.25' pulls the 24 px box into the padding at its end only
   - Fix: Pull the box 5 px toward the action as well, for example '-me-1.25' on the action Button in banner/dummy/playground.tsx:14, or a negative start margin on DISMISS when an action precedes it. The 24 px target is unchanged
8. **[low] Every state, 'dismissed' cell**
   - Frame: 'x hidden' (14 px x plus 9 px mono) at opacity 40
   - Build: x (16 px) plus 'hidden' at full muted (161,161,161)
   - Cause: packages/topclassui/src/components/banner/dummy/states.tsx:19-22 has no opacity
   - Fix: Add opacity-40 to the glyph and text, with aria-hidden on them (the group keeps its aria-label). Check that the axe contrast run still passes
9. **[low] Every state, info and warning chips' icon (added by verifier)**
   - Frame: 13 px icon, 6 px from 9 px mono text
   - Build: 16 px icon (Svg size xs), 6 px from 12 px text
   - Cause: packages/topclassui/src/components/banner/dummy/states.tsx:17-18 <Svg ... size="xs" />
   - Fix: size="0.8125rem"
10. **[low] head chip, mode switch, Install (S2, S4, S5)**
   - Frame: Chip 16 px tall with 9 px mono. Switch 217x31 with 14 px icons. Install 79x29 with a 12 px label
   - Build: Badge 26 px tall with 14 px mono at weight 500. Switch 230x32 with 16 px icons. Install 87.6x32 with a 14 px label
   - Cause: previewer.tsx:89 Badge size sm. card-mode-switch.tsx:41 icon 1rem. previewer.tsx:95 Button size sm
   - Fix: Badge size="xs" className="px-1.75 font-mono font-normal". Svg size="0.875rem". Install size="xs" className="gap-1.5"
11. **[low] The code, Copy button (S7)**
   - Frame: 73x29: surface fill (23,23,23), line edge (38,38,38), 12 px label
   - Build: 83.2x32: no fill, (161,161,161) edge, 14 px label
   - Cause: apps/docs/components/previewer/copy-button.tsx:49-55 variant outline, size sm
   - Fix: size="xs" className="shrink-0 gap-1.5 bg-surface border-line"
12. **[low] card corner (S1) and mono font (S8)**
   - Frame: Radius 16. Roboto Mono
   - Build: Radius 12. Geist Mono
   - Cause: apps/docs/components/classes.ts:127-129 (rounded-box). apps/docs/app/globals.css:10
   - Fix: PREVIEWER with ROUNDED_CARD (classes.ts:57). Choose the mono font and record it

## /en/docs/components/toast: differs (13)

Note: Re-checked against the design context for 137:1841, r11/card-toast.png, dom-toast.json and my crop toast-stage.png. The resting toast matches the frame (320x68, padding 14, 16 px icon, fill (38,38,38)); only its place and the extra button differ. The states strip's 5+1 wrap at 1440 (159.6 px cells with a 24 px gap, against the frame's 6 x 151 = 906 with no gap) is left to job 140's gap-x-0 fix. Refuted: the 'limited' cell (recorded in DECISIONS.md:176) and the S1 shadow. Corrected: the stacked-panel padding in the fix.

1. **[high] stage**
   - Frame: One resting toast, 320x67, centred in a 694x311 stage (x 187, y 122). Nothing else
   - Build: An outline 'Show a toast' button (120x40, 14 px) at the stage's top-left (20,20). The resting toast sits in the bottom-end corner (x 326, y 176) of a 682x280 stage
   - Cause: packages/topclassui/src/components/toast/dummy/playground.tsx:19-23 passes {button} as ToastStage's child. toast/classes.ts:82 TOAST_STAGE_VIEWPORT is 'absolute bottom-0 inset-e-0 ...'. DECISIONS.md:176 lists the button stage as pending (job 127)
   - Fix: In the stage branch render <ToastStage toast={...} className="grid min-h-60 w-full place-items-center" /> without {button}, and keep the button for the non-stage return. Give the stage a centred viewport (a TOAST_STAGE_VIEWPORT_CENTRED of 'relative ...', or a prop on ToastStage), so the toast sits in the middle
2. **[medium] stage / Try it row height**
   - Frame: 311 px
   - Build: 280 px
   - Cause: apps/docs/content/components/toast.ts:14 stageHeight: 17.5
   - Fix: stageHeight: 19.4375
3. **[medium] Try it, duration**
   - Frame: A duration control showing '5000'
   - Build: An empty NumberField (211x32): only '−' and '+', with no value
   - Cause: toast/schema.ts:13 duration is optional with no default, and 0..600000 is wider than SLIDER_SPAN (apps/docs/scripts/lib/controls.ts:15, :39), so it is a number field. toast.ts:17 starts holds only tone, so startOf (playground-island.tsx:41-46) leaves it null
   - Fix: toast.ts:17 starts: { tone: 'success', duration: 5000 } (withStarts, controls.ts:68, takes a number start)
4. **[medium] Every state, 'stacked' cell**
   - Frame: Three panels 120/112/104 wide, 30 px tall (padding 8, 9 px text), overlapping by 6 px. The 78 px group overflows the 56 px row, so every caption sits on one line
   - Build: Three panels 37 px tall, overlapping by 6 px. The 99 px group grows its li to 125 px (others 82), and the 'stacked' caption sits 43 px lower (y 960.9 against 917.9)
   - Cause: packages/topclassui/src/components/toast/dummy/states.tsx:36: CELL 'grid min-h-14' plus 'place-items-start justify-center' lets the group grow. Panel (:15) 'px-3 py-2.5' makes 37 px panels
   - Fix: Stacked cell: cn('grid h-14 content-center justify-center place-items-start'), so the group overflows its 56 px box and the caption lines up. Stacked panels: 'px-2 py-2' (the drawn 8 px; 33 px with the 12 px step)
5. **[medium] head, description (S3)**
   - Frame: One line, 83 characters. Head 79 px
   - Build: Two lines, 127 characters. Head 108 px
   - Cause: apps/docs/content/components/toast.ts:6, in the 556 px column
   - Fix: One sentence of about 80 characters (docs-site.md:2260 has the frame's), and S4 and S5
6. **[medium] Try it select and number field (S6)**
   - Frame: 29 px tall, 11 px mono, no visible edge
   - Build: 32 px tall, 14 px Geist Mono, 1 px (161,161,161) edge on the selects and the number field
   - Cause: apps/docs/components/previewer/try-it-control.tsx:62-66 (Select size sm) and :89-91 (NumberField size sm)
   - Fix: size="xs" className="font-mono border-line" on both. CONTROL_RESERVE select and number → h-7
7. **[low] Try it controls**
   - Frame: Selects for tone (success), position (bottom-end) and duration (5000), then checkboxes dismissible (on), pauseOnHover (on) and withAction (off)
   - Build: tone (select), duration (number field), priority (select 'low'). No position and no checkboxes
   - Cause: The controls come from toastSchema (tone, duration, priority). Placement lives on the provider, and dismissible, pauseOnHover and withAction are not toast.add options (docs-site.md:2361-2364)
   - Fix: controlsHidden: ['priority']. Add an extraSwitches withAction that passes an action in the playground. Record position, dismissible and pauseOnHover as not applicable
8. **[low] Every state, 'stacked' label colour**
   - Frame: 'toast' in muted
   - Build: 'toast' in body (250,250,250)
   - Cause: toast/dummy/states.tsx:15: Panel is always text-body
   - Fix: Add 'text-muted' to the three stacked Panels (:37-39)
9. **[low] Every state, 'entering' cell**
   - Frame: Panel at opacity 55 with the usual line edge
   - Build: Panel at full opacity with a 1 px dashed (161,161,161) edge
   - Cause: toast/dummy/states.tsx:42 'border-dashed border-line-strong'. The comment at :22-23 says a faded text would fail 4.5:1, but no DECISIONS entry records it
   - Fix: opacity-55 with aria-hidden on the panel (the group keeps its aria-label), or keep the dashed edge and record it in DECISIONS
10. **[low] Every state, single panels**
   - Frame: 134x34: padding 9, gap 7, 14 px icon
   - Build: 136x37: padding 10/12, gap 8, 14 px icon
   - Cause: toast/dummy/states.tsx:15 'w-34 ... gap-2 px-3 py-2.5'
   - Fix: 'gap-1.75 px-2.25 py-2.25' (keep w-34)
11. **[low] head chip, mode switch, Install, Copy (S2, S4, S5, S7)**
   - Frame: Chip 16 px. Switch 217x31. Install 79x29 at 12 px. Copy 73x29 with a surface fill and a line edge
   - Build: Chip 26 px at 14 px/500. Switch 230x32. Install 87.6x32 at 14 px. Copy 83.2x32, unfilled, with a (161,161,161) edge
   - Cause: previewer.tsx:89 and :95. card-mode-switch.tsx:41. copy-button.tsx:49-55
   - Fix: As for Alert: Badge xs, Svg 0.875rem, Install and Copy size="xs", Copy className bg-surface border-line
12. **[low] card corner (S1) and mono font (S8)**
   - Frame: Radius 16. Roboto Mono
   - Build: Radius 12. Geist Mono
   - Cause: apps/docs/components/classes.ts:127-129. apps/docs/app/globals.css:10
   - Fix: ROUNDED_CARD on PREVIEWER. Choose the mono font and record it
13. **[low] The code, note**
   - Frame: One line, 372 px: 'The viewport lives in TopClassProvider; toast.add works outside React too.'
   - Build: One line, 772 px: 'TopClassProvider mounts the one viewport, so there is nothing to mount; toast.add works from any browser module, inside React or not.'
   - Cause: apps/docs/content/components/toast.ts:10
   - Fix: Use the frame's sentence, or keep the longer one

## /en/docs/components/tooltip: differs (10)

Note: Re-checked against the design context for 138:2304 (stage, playground) and 138:2346 (states), r11/card-tooltip.png, dom-tooltip.json, live-states-tooltip.png and my crop tooltip-stage.png. The stage chip matches: 76.7x24, 12 px, px 12 / py 4, radius 8, white in dark, an 11 px gap to the trigger. Two parts of the states claim are refuted: the missing 'delayed' cell (recorded) and the popups missing from the card capture (an off-screen anchor artefact). The Try it sliders are kept at low, because docs-site.md S7 derives a slider from a number with min and max.

1. **[high] Every state strip**
   - Frame: Cells 227 wide in a 58 px row. hidden: the 100x100 surface trigger box at opacity 50. top: a 'Tip' chip (px 8 / py 4) with its arrow below. bottom: the arrow above a 'Tip' chip. No trigger drawn in top or bottom
   - Build: Cells 282 wide with a 112 px box (h-28). Each cell is a 48x40 ghost icon button (link, arrow-up, arrow-down). Live (scrolled into view), the popups are cut to the 48 px cell: 'Top' loses its end corners and 'Bottom' is cut to 'Bott'
   - Cause: packages/topclassui/src/components/tooltip/dummy/states.tsx:12: CELL has no width. StateStrip (apps/docs/components/previewer/state-strip.tsx:62-63) puts each cell in STATE_BOX (apps/docs/components/classes.ts:209) inside a justify-items-center li, so the cell, which is the popup's container (states.tsx:44, :56) with overflow-hidden and paint containment, shrinks to its 48 px button. The triggers are md ghost buttons
   - Fix: states.tsx:12 CELL → 'relative flex h-28 w-56 items-center justify-center overflow-hidden [contain:paint]', so the container is 224 px and nothing is cut. Popups 'Tip' with className="px-2". Hidden cell (:23-27): the frame's box (Button variant="outline" className="size-25 bg-surface border-line opacity-50"). Dropping the visible triggers in top and bottom is Omar's call
2. **[medium] stage trigger**
   - Frame: A 100x100 box under the tooltip: fill surface (23,23,23), 1 px line edge, radius 8. The frame's own code sample names an IconButton with link-simple, so the empty box may be a drawing stand-in
   - Build: A 48x40 ghost button with a 14 px link icon and no box
   - Cause: packages/topclassui/src/components/tooltip/dummy/playground.tsx:23-25 <Button variant="ghost" aria-label="Copy link">
   - Fix: Omar's call: <Button variant="outline" aria-label="Copy link" className="size-25 bg-surface border-line"> as drawn, or keep the icon button and record it
3. **[medium] stage / Try it row height**
   - Frame: 311 px. The group (chip, arrow, box) is centred, with the chip's top at y 88.5
   - Build: 388 px. The chip's top is at y 139
   - Cause: apps/docs/content/components/tooltip.ts:10 stageHeight: 24.25, and tooltip/dummy/playground.tsx:16 min-h-87 (348 px plus the 40 px padding)
   - Fix: stageHeight: 19.4375, and the Stage min-h-87 → min-h-67.75 (271 px inside the 20 px padding)
4. **[medium] The code, note**
   - Frame: Plain 10.5 px muted text on one 13 px line: 'Touch never shows a tooltip, so the trigger's own label must repeat the text.'
   - Build: A 12 px muted note whose `aria-label` is set in 14 px Geist Mono in body white (250,250,250), which raises the line to 20 px. The sentence is longer too
   - Cause: apps/docs/components/inline-text.tsx:6 applies INLINE_CODE (apps/docs/components/classes.ts:81 'font-mono text-sm text-body') inside the note (previewer.tsx:72). Text: tooltip.ts:13
   - Fix: Give InlineText a codeClassName prop and pass 'font-mono text-[length:inherit] text-muted' from previewer.tsx:72. Optionally use the frame's sentence
5. **[medium] head, description (S3)**
   - Frame: One line, 88 characters. Head 79 px
   - Build: Two lines, 110 characters. Head 108 px
   - Cause: apps/docs/content/components/tooltip.ts:6, in the 556 px column
   - Fix: The frame's sentence (docs-site.md:2298-2299) or one of at most about 85 characters, and S4 and S5
6. **[medium] Try it select (S6)**
   - Frame: 208x29, 11 px mono, no visible edge
   - Build: 211x32, 14 px Geist Mono, 1 px (161,161,161) edge
   - Cause: apps/docs/components/previewer/try-it-control.tsx:62-66
   - Fix: size="xs" className="font-mono border-line". CONTROL_RESERVE.select → h-7
7. **[low] Try it controls**
   - Frame: Three 29 px selects: placement (top), delay (600), closeDelay (0). Checkboxes showArrow (on), disabled (off) and instant (off)
   - Build: A placement select, then delay and closeDelay as sliders (4 px track, 16 px knob, value in 14 px muted at the end). No checkboxes
   - Cause: apps/docs/scripts/lib/controls.ts:36-37 makes a 0-10000 number a slider, as docs-site.md S7 asks. showArrow and instant are not built, and disabled is not in tooltipSchema
   - Fix: Omar's call: an override that turns delay and closeDelay into selects (options 0, 300, 600, 1000), and extraSwitches: ['disabled'] if the trigger takes it. Otherwise record it
8. **[low] stage tooltip text**
   - Frame: 'Copy to clipboard', chip 125 px wide
   - Build: 'Copy link', chip 76.7 px wide
   - Cause: packages/topclassui/src/components/tooltip/dummy/playground.tsx:28
   - Fix: 'Copy to clipboard' in the stage popup and the aria-label
9. **[low] head chip, mode switch, Install, Copy (S2, S4, S5, S7)**
   - Frame: Chip 16 px at 9 px mono. Switch 217x31. Install 79x29. Copy 73x29 with a surface fill
   - Build: Chip 26 px at 14 px/500. Switch 230x32. Install 87.6x32. Copy 83.2x32, unfilled, with a (161,161,161) edge
   - Cause: previewer.tsx:89 and :95. card-mode-switch.tsx:41. copy-button.tsx:49-55
   - Fix: As for Alert
10. **[low] card corner (S1) and mono font (S8)**
   - Frame: Radius 16. Roboto Mono
   - Build: Radius 12. Geist Mono
   - Cause: apps/docs/components/classes.ts:127-129. apps/docs/app/globals.css:10
   - Fix: ROUNDED_CARD on PREVIEWER. Choose the mono font and record it

## /en/docs/components/popover: differs (10)

Note: Re-checked against the design context for 138:2132, r11/card-popover.png, dom-popover.json, live-states-popover.png and my crop popover-stage.png. The stage panel matches in width (280), padding (16), gap (12), radius (12), fill (38,38,38) and its 6 px offset. Corrections: the states triggers are medium, not semibold, and the stage trigger already sits at the frame's y (68 against 69), so only the height needs to change. Refuted: the missing focus-visible and dismissed cells (recorded), the popups missing from the card capture (capture artefact), and the outline triggers' fill and edge (recorded as Button's own frame). One difference added: the note.

1. **[high] Every state strip**
   - Frame: Cells 181 wide, row 58. Triggers are small 'Open' buttons: 12 px medium, px 10 / py 6, about 54x29. The panel is 110 wide, padding 8, with a muted 9 px mono 'panel', 4 px from its trigger (open below, flipped above)
   - Build: Cells 282 wide with a 112 px box (h-28). Triggers are md outline buttons, 40 px tall with 14 px medium labels: 'Share', 'Details', 'Settings'. Live, the w-28 (112 px) panels are squeezed to the 80-89 px cell, so their labels break mid-word ('Detai/ls', 'Settin/gs'). The panel text repeats the trigger's name
   - Cause: packages/topclassui/src/components/popover/dummy/states.tsx:8: CELL has no width, and STATE_BOX (apps/docs/components/classes.ts:209) shrinks it to the trigger, so the popup container (states.tsx:32, :40) is as wide as the trigger. :22, :31 and :39 use Button variant="outline" at md. :33 and :41 label the panel with the trigger's name
   - Fix: CELL → 'relative flex h-28 w-45 justify-center overflow-hidden [contain:paint]' (180 px). Triggers <Button size="xs" variant="outline">Open</Button>. PopoverTitle text 'panel' with the LABEL class
2. **[medium] stage / Try it row height**
   - Frame: Row 311 px. Trigger top at y 69, panel bottom at 242
   - Build: Row 388 px. Trigger top at 68, panel bottom at 260, leaving 128 px empty below
   - Cause: apps/docs/content/components/popover.ts:10 stageHeight: 24.25, and popover/dummy/playground.tsx:20 min-h-87 (348 px plus 40 px padding)
   - Fix: stageHeight: 19.4375 and Stage min-h-87 → min-h-67.75. The pt-12 wrapper already puts the trigger at the frame's y
3. **[medium] head, description (S3)**
   - Frame: One line, 83 characters. Head 79 px
   - Build: Two lines, 115 characters. Head 108 px
   - Cause: apps/docs/content/components/popover.ts:6
   - Fix: 'Anchored panel for links and controls; it flips and shrinks instead of overflowing.' (docs-site.md:2294-2295), or a sentence under about 85 characters, and S4 and S5
4. **[medium] Try it select (S6)**
   - Frame: 208x29, 11 px mono, no visible edge
   - Build: 211x32, 14 px Geist Mono, 1 px (161,161,161) edge
   - Cause: apps/docs/components/previewer/try-it-control.tsx:62-66
   - Fix: size="xs" className="font-mono border-line". CONTROL_RESERVE.select → h-7
5. **[low] stage trigger 'Share', size**
   - Frame: About 76x29: px 10 / py 6, 14 px icon, gap 6, 12 px medium label
   - Build: 86.8x32: px 12, 14 px icon, gap 8, 14 px medium label
   - Cause: packages/topclassui/src/components/popover/dummy/playground.tsx:23 (and :45) <Button variant="outline" size="sm">
   - Fix: size="xs" className="gap-1.5"
6. **[low] stage panel contents**
   - Frame: Panel about 280x138: title row 17 px (14 px x), description 2 x 17 px lines, 'Copy link' primary button about 92x29 with a 12 px label
   - Build: Panel 280x154: title row 24 px (the 24 px PopoverClose target), description 2 x 20 px lines, 'Copy link' 110.2x32 with a 14 px label
   - Cause: popover/dummy/playground.tsx:30 <Button size="sm">. POPOVER_DESCRIPTION 'text-sm text-muted' (popover/classes.ts:23) gives a 20 px line. The close target sets the title row
   - Fix: Copy link size="xs". Description className="text-sm/tight". Pull the close target into the row with -my-1
7. **[low] Try it controls**
   - Frame: Selects for placement (bottom), sideOffset (8) and size (md), then checkboxes modal (off), showArrow (on) and dismissible (on)
   - Build: The placement select only
   - Cause: popoverSchema has placement, delay and closeDelay, and popover.ts:12 hides the last two. docs-site.md:2363 names Popover's sideOffset among the drawn controls with no prop behind them
   - Fix: Omar's call: add modal as a PopoverRoot switch (extraSwitches: ['modal']). Record sideOffset, size, showArrow and dismissible as not built
8. **[low] The code, note (added by verifier)**
   - Frame: One line, about 375 px at 10.5 px: 'A tooltip that needs a link or a control is a Popover; a lint rule enforces it.'
   - Build: One line, about 570 px at 12 px: 'A tooltip is plain text only: its children are typed as text. Anything with a link or a control is a Popover.'
   - Cause: apps/docs/content/components/popover.ts:15
   - Fix: Use the frame's sentence (docs-site.md:2296), or keep the longer one
9. **[low] head chip, mode switch, Install, Copy (S2, S4, S5, S7)**
   - Frame: Chip 16 px at 9 px mono. Switch 217x31. Install 79x29. Copy 73x29 with a surface fill
   - Build: Chip 26 px at 14 px/500. Switch 230x32. Install 87.6x32. Copy 83.2x32, unfilled, with a (161,161,161) edge
   - Cause: previewer.tsx:89 and :95. card-mode-switch.tsx:41. copy-button.tsx:49-55
   - Fix: As for Alert
10. **[low] card corner (S1) and mono font (S8)**
   - Frame: Radius 16. Roboto Mono
   - Build: Radius 12. Geist Mono
   - Cause: apps/docs/components/classes.ts:127-129. apps/docs/app/globals.css:10
   - Fix: ROUNDED_CARD on PREVIEWER. Choose the mono font and record it

## Refuted by the second reviewer (do not act)

- /en/docs/components/alert, head, Light/Dark/Ocean switch (S4): unselected labels at weight 400 and shadow-sm on the selected segment: The weight is the library's recorded SegmentedControl look (DECISIONS.md 2026-10-19, job 116: segments regular, the selected one medium). shadow-sm on the (23,23,23) surface changes no visible pixel. The same holds wherever S4 is repeated.
- /en/docs/components/alert, card frame (S1): shadow 0 2px 12px -4px /0.3 against shadow-md: Not visible in Dark: both shadows darken the (10,10,10) page by 1-2 levels (the frame PNG's margin reads 10-12 next to the card). docs-site.md:426-428 asks for no shadow at all. Only the radius part is kept.
- /en/docs/components/banner, card frame (S1): shadow: Not visible in Dark, as for Alert. Only the radius part is kept.
- /en/docs/components/banner, The code: the closing '>' alone on its own line: That is the formatting of dummy/playground.tsx:15, which the code tab shows on purpose (do-not-report: the repo's dummy files instead of Figma's sample). The blank line and the overflow are kept.
- /en/docs/components/toast, Every state, 'limited' cell (no 35% ghost toast; a two-line caption on a row of its own): Recorded in DECISIONS.md:176: 'The toast past the limit stays undrawn (data-limited:hidden), not the frame's 40% ghost'. The wrap to a row of its own is the 5+1 grid wrap that job 140's gap-x-0 fixes.
- /en/docs/components/toast, card frame (S1): shadow: Not visible in Dark, as for Alert. Only the radius part is kept.
- /en/docs/components/tooltip, Every state strip: '3 states' against 4, no 'delayed' cell: Recorded in DECISIONS.md 2026-10-19 'The overlays follow their Previewer frames': Tooltip 'delayed' is left out because it needs a live pointer.
- /en/docs/components/tooltip, Every state strip: no popup in the card capture: A capture artefact: Base UI sets data-anchor-hidden (invisible) while the strip is off-screen. The live shot shows the popups, and their clipping is kept.
- /en/docs/components/tooltip, card frame (S1): shadow: Not visible in Dark, as for Alert. Only the radius part is kept.
- /en/docs/components/popover, Every state strip: '3 states' against 5, no focus-visible or dismissed cell: Recorded in DECISIONS.md 2026-10-19 'The overlays follow their Previewer frames': Popover 'focus-visible' and 'dismissed' are left out because they need a live focus or gesture.
- /en/docs/components/popover, Every state strip: no open or flipped panel in the card capture: A capture artefact (data-anchor-hidden while off-screen). The live shot shows the panels, and their squeezing is kept.
- /en/docs/components/popover, stage trigger 'Share' and the states triggers: no surface fill and a (161,161,161) line-strong edge instead of the line edge: Recorded in DECISIONS.md 2026-10-19 (overlays, 'Not followed'): the neutral look of an outline Button, the frames' Cancel and triggers, is Button's own frame (job 116). The size part is kept.
- /en/docs/components/popover, stage / Try it: the group 'top-aligned with pt-12': Misread: the trigger already sits at y 68 against the frame's 69. Only the 388 px height leaves the empty space, and that part is kept.
- /en/docs/components/popover, card frame (S1): shadow: Not visible in Dark, as for Alert. Only the radius part is kept.
