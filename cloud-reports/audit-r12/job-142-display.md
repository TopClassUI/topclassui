# Figma audit 2, job 142 display

Second audit on preview/r8-all 694273fe at 1440 dark: every first-audit row re-checked (still open) plus a fresh pass (new), each re-checked by a second reviewer. Close every row or record why it stays.

## /en/docs/components/button: differs (5)

Note: Checked against Figma design context for 135:155, 135:198, 145:927, 135:230 and 135:270, plus fresh bands in r12-review/job-142-display/verify/ (b-head, b-stage, b-tryit at 2x, b-states, b-copyicons, b-codecopy) and the DOM probe. Four of the reviewer's five rows hold (chip, checkbox offset, line heights, row height). The code-part gap is refuted because it is 2 px. One shell row is added: the copy icons are body-coloured. As before, the shell rows apply to all 9 cards and are listed only here. Stage fills, outline edge (161) and the focus ring (81,162,255) match the frame.

1. **[low] (still open) shell, all 9 cards: head, render chip beside the name**
   - Frame: Chip 85x16 (204x16 for split): Roboto Mono Regular 9 px on a 12 px line, padding 2/7, radius 4, no border
   - Build: Chip 109.6x22 (275.2x22 for split): Geist Mono 12 px on a 16 px line, padding 2/7 plus a 1 px transparent border, radius 4. It is 6 px taller and its text is 3 px larger, which is outside the 1-2 px snap. The shell already uses 10 and 11 px steps
   - Cause: apps/docs/components/previewer/previewer.tsx:91 <Badge size="xs" className="px-1.75 font-mono font-normal">. Badge xs is text-xs (12/16) with py-pad-y-xs and a 1 px border
   - Fix: previewer.tsx:91: className="px-1.75 py-px font-mono font-normal text-[0.625rem]/3". That gives 10 px text on a 12 px line, 12 + 2 + 2 = 16 px tall
2. **[low] (new) shell, cards with boolean switches (Button, Separator): Try it checkbox column**
   - Frame: The 16 px box sits on the column's start edge, flush with the select's left edge (both at card x 714), and the label starts 24 px after the box
   - Build: The 16 px box is centred in its 24 px target, so it sits 4 px inside the select's edge (box x 706 against select x 702). The label is at x 730 against a drawn 726. Visible in verify/b-tryit.png
   - Cause: apps/docs/components/classes.ts:192 CHECK_ROW 'flex min-w-0 items-center gap-1 -my-[0.40625rem]' pulls the 24 px target in on the block axis only
   - Fix: classes.ts:192: add -ms-1 to CHECK_ROW. The target then overhangs the panel padding by 4 px, the box lands on x 702 and the label on x 726
3. **[low] (new) shell, all 9 cards: caption and label line heights (Try it, Every state, install row)**
   - Frame: TRY IT, the control labels, Every state with its count, Copy the source and Then import it are 10 px on a 12 px line. The state captions are 9 px on 12, the install notes 10 px on 12. Every state part 140 (18+13+14+77+18), install row 108 (18+12+7+34+7+12+18), Button Try it column 311
   - Build: Those are 12 px on a 16 px line (text-xs). The state captions are 11 px on 16 and the install notes 10 px on 14. Every state part 146 + 1 border (18+16+12+82+18), install row 116 + 1 border (18+16+8+34+8+14+18), Button Try it column 319. Each part is 6 to 8 px taller, and the first Try it select sits 8 px lower (y 70 against 62)
   - Cause: apps/docs/components/classes.ts:170 H3, :172 CAPTION and :190 CONTROL_LABEL use text-xs (16 px line). :225 STATE_CAPTION uses TYPE.eyebrow (:9, leading-4). :178 INSTALL_NOTE has leading-3.5. CARD_PART gap-3 (:135) sets the states gap to 12 against 14
   - Fix: Add leading-3 to H3, CAPTION and CONTROL_LABEL. Give STATE_CAPTION its own 'text-[0.6875rem] leading-3' in place of the shared TYPE.eyebrow, change INSTALL_NOTE to leading-3, and set leading-3 on the states count. The sizes stay on the scale; only the lines tighten to the drawn 12 px
4. **[low] (new) Button: stage and Try it row height**
   - Frame: Row 311 px (stage 694x311; Try it 18+12+14+3x47+2x14+14+66+18)
   - Build: Row 320 px: the stage min-height is 320 (stageHeight 20) and the Try it column is 319. Every other card in this group sets the drawn height
   - Cause: apps/docs/content/components/button.ts:10 stageHeight: 20, where Tag and Badge use 19.4375 (311). The 16 px label lines (row above) make the Try it column 319
   - Fix: button.ts:10: stageHeight: 19.4375. Together with the leading-3 fix above (Try it then about 303 px), the row is the drawn 311
5. **[low] (added by verifier) shell, all 9 cards: copy icon colour in THE CODE's Copy button and in both install fields**
   - Frame: The icon/copy glyph is muted: brightest stroke pixel (152,152,152), the same as the muted carets. The 'Copy' word beside it is body (250)
   - Build: The glyph is body-coloured: brightest stroke pixel (229,229,229) in the Copy button and (227,227,227) in the install fields, so both icons read brighter than drawn (verify/b-copyicons.png, verify/b-codecopy.png at 5x)
   - Cause: apps/docs/components/previewer/copy-button.tsx:60 <Svg icon={copy} size="0.875rem"> inherits the button's text-body. The muted CODE_COPY_ICON ('flex text-muted', classes.ts:127) is used only by the guide pages
   - Fix: copy-button.tsx:60: add className="text-muted" to the Svg (or wrap it in CODE_COPY_ICON). The check icon after a copy can keep the body colour

## /en/docs/components/tag: differs (2)

Note: Design context 135:318 and 135:285 confirm both rows. The stage tag fills and text match the frame exactly (for example neutral (32,32,32) with text (229,229,229)), and the 5 state cells and the 2-line head match. No DECISIONS or docs-site entry covers Tag's drawn variant, removable, truncate or disabled controls.

1. **[medium] (still open) Try it panel**
   - Frame: variant (soft), tone (neutral) and size (md) selects, then removable, truncate and disabled checkboxes
   - Build: tone and size selects only, no checkboxes (verify/t-stage.png)
   - Cause: packages/topclassui/src/components/tag/schema.ts:8-13 declares only tone and size. apps/docs/content/components/tag.ts has no extraSwitches. tag/dummy/playground.tsx:5-7 always renders a plain <Tag>. DECISIONS.md:284 lists no Tag props as not built
   - Fix: tag.ts: extraSwitches: ['removable', 'disabled'] and controlOrder: ['tone', 'size', 'removable', 'disabled']. In dummy/playground.tsx, render <TagRemovable {...props} onRemove={() => {}}> when removable is set, and the tagVariants({ interactive: true }) disabled chip when disabled is set. Add Tag variant and truncate to the 'Not built, for Omar' list at DECISIONS.md:284
2. **[low] (new) stage, removable danger tag**
   - Frame: Danger tag 90x29: 12 px padding, 48 px label, 4 px gap, 14 px x glyph, 12 px end padding
   - Build: Danger tag 99.3x30. The label ends at x 524.7. The 24 px x target spans 532.7-556.7 with its glyph at 537.7-551.7, then 6 px of end padding. The label-to-glyph gap is 13 px against 4 (verify/t-stagezoom.png at 2.5x)
   - Cause: packages/topclassui/src/components/tag/classes.ts:30 TAG_SIZE.md gap-2 (8 px), plus 5 px of the 24 px ICON_BUTTON target on each side of the 14 px glyph. REMOVE_SIZE (:61-68) pulls the target in on the block axis only
   - Fix: tag/classes.ts REMOVE_SIZE: add an inline-start pull that keeps the 24 px target (md '-ms-[0.5625rem]', so the glyph sits 4 px after the label and the tag is about 90 px), scaled per size. Or record the 13 px gap in DECISIONS as the price of the 24 px target

## /en/docs/components/kbd: differs (2)

Note: Design context 135:477 confirms both rows. The frame draws its keys on surface-raised with a line-strong edge and 11 px mono, and the disabled cell as the idle pair at opacity 0.5. The stage keys (22 against 23 tall, gap 4 against 5) and the idle, hover and active cells match. Four cells on one row is correct; the frame's 3 + 1 wrap is 4x227 = 908 px in a 906 px row. One caveat: docs-site.md:775-777 still says a component with no schema (Kbd, Card) has no Try it. Its premise, at docs-site.md:2359-2362 (Kbd's pressed has no prop behind it), was overtaken by DECISIONS.md:277, so the spec line must change together with the fix.

1. **[high] (still open) Try it panel and stage centring**
   - Frame: 248 px Try it column: variant (outline) and size (md) selects, then pressed, muted and disabled checkboxes. The keys centre in the 694 px stage (card x 348)
   - Build: No Try it column. The stage spans 930 px and the keys centre at card x 466 (verify/k-head.png)
   - Cause: packages/topclassui/src/components/kbd has no schema.ts and no dummy/playground.tsx, so apps/docs/components/previewer/previewer.tsx:60 finds no playground and renders the stage-only branch (:122-138). variant, size and muted are recorded as not built (DECISIONS.md:284), but pressed and disabled exist on Kbd (DECISIONS.md:277) and no control reaches them. docs-site.md:775-777 still describes the old no-schema rule
   - Fix: Add kbd/schema.ts with pressed and disabled (z.boolean().default(false)) and kbd/dummy/playground.tsx rendering <div className="flex items-center gap-1"><Kbd {...props}>Ctrl</Kbd><Kbd {...props}>Shift</Kbd><Kbd {...props}>K</Kbd></div>. Keep stageDemo: 'stage' (kbd.ts:10) and stageHeight 15.625, and drop Kbd from the no-schema list at docs-site.md:776
2. **[low] (still open) Every state, disabled cell**
   - Frame: The idle keys at opacity 0.5: surface-raised fill, line-strong edge sampled (92,92,92) and faded body text
   - Build: Opacity 1: surface fill (23,23,23), line edge (38,38,38) and muted text. The outline almost vanishes against the card (verify/k-dis.png at 2.5x)
   - Cause: packages/topclassui/src/components/kbd/index.tsx:14 'data-disabled:bg-surface data-disabled:border-line data-disabled:text-muted'. Its comment keeps 4.5:1 text, while DECISIONS.md:277 says the states are drawn as the frame's strip draws them
   - Fix: Either use data-disabled:opacity-50 as drawn (kbd/index.tsx:14), or rewrite the Kbd bullet at DECISIONS.md:277 to record that a disabled key keeps 4.5:1 muted text on a line-coloured edge in place of the drawn 50% fade

## /en/docs/components/badge: matches (0)

Note: Checked against design context 137:352 and verify/g-stage.png, g-stagezoom.png (2x) and g-states.png. All 18 stage fills and texts match, the rows are 8 apart within and 10 apart between, and the 3 state cells match. Outline badges are 30 against 31, within 1 px. dot, uppercase and truncate are recorded as not built (DECISIONS.md:284), and 'Primary' against 'primary' is wording only. Only the shared shell rows under button apply (chip, checkbox offset where present, line heights, copy icon colour).


## /en/docs/components/avatar: differs (1)

Note: Design context 137:494 confirms the image disc is primary/solid with a 28 px white icon/image. DECISIONS.md:281 covers only the fallback discs (neutral-soft), not a portrait in place of the drawn image disc. Disc sizes (56 and 40), initials and icon sizes, gap 14 and the 250 px row match. The 2-line import comes from the generated part names (decision 9).

1. **[medium] (still open) stage first avatar and Every state 'image' cell**
   - Frame: A primary/solid blue disc with a white image glyph: 28 px on the 56 px stage disc, 20 px on the 40 px state disc
   - Build: A slate (#475569) disc with an #e2e8f0 head-and-shoulders portrait on both the stage and the state cell. It is the most prominent of the three stage discs (verify/a-zoom.png at 3x, verify/a-states.png)
   - Cause: packages/topclassui/src/components/avatar/dummy/stage.tsx:6 PORTRAIT data URI, used at :12-15; avatar/dummy/states.tsx:6, used at :13-16
   - Fix: Make PORTRAIT in both files an SVG of the drawn placeholder: a blue (primary-solid hex, as the existing URI already uses hex) square with a centred white image glyph at 50% of the box, still loaded through AvatarImage. Or record in DECISIONS that a real portrait stands in for the drawn image placeholder

## /en/docs/components/avatar-group: differs (2)

Note: Design context 137:605 shows 44 px discs with mr -10, 17 px initials and a primary-soft +9 with no ring. The DOM's full computed box-shadow confirms the counter's 2 px neutral-soft ring. The 4 px overlap at sm in the strip is recorded (DECISIONS 2026-10-10 Unit 2), and so is 8 px at md. spacing, showCount and bordered are recorded as not built. +3 against +9 is content, and the frame's import wraps too.

1. **[low] (still open) +N counter ring, stage and overflow cell**
   - Frame: A primary/soft counter disc with no ring
   - Build: Computed box-shadow 0 0 0 2px oklch(0.244 0 0) (neutral-soft) around the primary-soft counter, on both the 40 px stage counter and the 32 px overflow-cell counter: a visible grey rim (verify/ag-zoom.png at 4x)
   - Cause: packages/topclassui/src/components/avatar-group/classes.ts:11 GROUP_RING '*:ring-2 *:ring-neutral-soft' on the root beats GROUP_COUNTER's 'ring-primary-soft' (:33-37), because the *: variant is emitted later at equal specificity
   - Fix: avatar-group/classes.ts:33-37: write ring-primary-soft! in each size (or ring-0! to drop it). Alternatively, mark the counter with data-counter and scope GROUP_RING to *:not-data-counter:ring-2
2. **[low] (still open) stage, disc size**
   - Frame: 5 discs of 44 px, overlap 10 (34 px pitch), initials 17 px; row 180x44. The frame's own Try it reads size md, and the Avatar frame draws md at 40
   - Build: 5 discs of 40 px (md), overlap 8 (32 px pitch, recorded for md), initials 16 px; row 168x40
   - Cause: apps/docs/content/components/avatar-group.ts:11 stageDemo 'overflow' renders avatar-group/dummy/overflow.tsx at the default md (control-md 40). 44 is off the control scale (40 or 48)
   - Fix: Record in DECISIONS that the stage draws md (40 px), which the frame's own Try it names, in place of the off-scale 44. Or give the docs stage its own dummy/stage.tsx at size="custom" with *:size-11 and *:-ms-2.5, and set stageDemo: 'stage'

## /en/docs/components/card: differs (2)

Note: Design context 137:738 and 137:779 confirm both rows. The stage panel (300x141 against 300x140, surface-raised, line edge, radius 12, padding 18, gap 10) and the three state panels match. The same docs-site.md:775-777 caveat as Kbd applies to the Try it row: the spec still lists Card as having no schema and so no Try it, and its premise (Card's media has no prop, docs-site.md:2361) was overtaken by CardMedia and CardRoot render (DECISIONS.md:274).

1. **[high] (still open) Try it panel and stage centring**
   - Frame: 248 px Try it: variant (outline) and padding (md) selects; interactive and media checkboxes off, footer on. The panel centres in the 694 px stage (stage x 197)
   - Build: No Try it. The stage spans 930 px and the panel sits at card x 316 (verify/c-stage.png)
   - Cause: packages/topclassui/src/components/card has no schema.ts and card/dummy has no playground.tsx, so apps/docs/components/previewer/previewer.tsx:60 takes the stage-only branch (:122-138). Only variant and padding are recorded as not built (DECISIONS.md:284), while interactive (CardRoot render={<a/>}), media (CardMedia) and footer (CardFooter) all exist. docs-site.md:775-777 still describes the old no-schema rule
   - Fix: Add card/schema.ts with interactive, media and footer booleans (footer default true) and card/dummy/playground.tsx that renders basic.tsx's card: CardRoot render={<a href="#" />} when interactive is set, CardMedia when media is set, and CardFooter with Read more and Later when footer is set. Drop Card from the no-schema list at docs-site.md:776
2. **[low] (still open, partly) stage panel footer buttons**
   - Frame: 'Read more' 86x29, padding 7/12, 12 px Medium. 'Later' 52x29, padding 6/10, surface fill, line border
   - Build: 'Read more' 79.6x28 with padding 0/8, 4 px short on each side. 'Later' 47.3x28 with padding 0/8, 2 px short on each side (within tolerance on its own). Height, text and Later's fill and border are right
   - Cause: packages/topclassui/src/components/card/dummy/basic.tsx:14-15 Button size="xs" takes the xs control's px-pad-x-xs (8 px), where the frame's xs buttons (this one and the head's Install) are padded 12
   - Fix: basic.tsx:14: className="px-3" on Read more (as previewer.tsx:97 already does for Install). Optionally basic.tsx:15: add px-2.5 to Later's className

## /en/docs/components/separator: differs (3)

Note: Design context 137:848 shows 'or' at Roboto Mono 10 px on the stage, and 137:897 at 9 px in the states cell. All three of the reviewer's rows hold, but the label row is narrowed to the states cell: on the stage, 12 px against 10 is within the snap. Lines, insets (272 against 273), gaps, the 225 px row and the 3 state cells match.

1. **[low] (still open) install row, Then import it field**
   - Frame: One line: the 61-character import at 10.5 px Roboto Mono (about 384 px) fits the 390.5 px text box. Field 434.5x34, row 108 px
   - Build: Two lines: at 11 px Geist Mono (6.6 px advance), 61 x 6.6 = 403 px overflows the 390 px text box. The field is 428x50 and the row 132 + 1 px (verify/s-states.png)
   - Cause: apps/docs/components/classes.ts:150 COPY_FIELD_TEXT 'text-[0.6875rem]' (11 px). Its comment budgets a 59-character line, and Separator's line is 61. The wrap is not from generated names: the frame prints the same line
   - Fix: classes.ts:150: text-[0.65625rem] (10.5 px, the drawn size: 61 x 6.3 = 384 px fits). Update the comment to '61 characters'
2. **[low] (new) Try it, withLabel checkbox at rest**
   - Frame: withLabel unchecked, decorative checked (although the frame's stage draws the 'or' line)
   - Build: withLabel checked (blue box with a tick) and decorative checked (verify/s-stage.png)
   - Cause: apps/docs/content/components/separator.ts:13 starts: { withLabel: true }, chosen so the stage keeps its drawn 'or' line. No DECISIONS entry records it
   - Fix: Keep it, and record in DECISIONS that the frame's unchecked withLabel contradicts its own stage, so Try it starts checked
3. **[low] (new) Every state, with-label cell, 'or' label size**
   - Frame: 'or' in Roboto Mono 9 px (11x12 box) in the with-label cell. On the stage it is 10 px
   - Build: 'or' in Geist Mono 12 px (14.4x16) in the cell, 3 px over the drawn size and visibly larger (verify/s-orstate.png at 4x). The stage's 12 against 10 is within the snap, but it comes from the same class
   - Cause: packages/topclassui/src/components/separator/classes.ts:14 SEPARATOR_LABELLED 'text-xs'. The dummies add only font-mono: dummy/states.tsx:9 and dummy/playground.tsx:8
   - Fix: separator/dummy/states.tsx:9: className="font-mono text-[0.6875rem]". separator/dummy/playground.tsx:8: label 'w-68 self-center font-mono text-[0.6875rem]' (11 px, the site's smallest shell step, within 2 px of both)

## /en/docs/components/skeleton: differs (1)

Note: The metadata for 137:955 confirms the drawn Try it, and verify/k2-stage.png and k2-states.png confirm the rest matches. The stage is a 44 px circle, gap 16, with bars of 220, 183.3 and 146.7 x 10 on an 18 px pitch (step-down recorded); the state cells match within 2 px.

1. **[low] (still open) Try it panel**
   - Frame: variant (text) and lines (3) selects, then animate and rounded checkboxes, both checked; row 225 px
   - Build: variant and rows (3) selects only, with no checkboxes. The row is 225 px, as drawn
   - Cause: packages/topclassui/src/components/skeleton/schema.ts:8-14 exposes only variant and rows. animate and rounded are neither built nor listed at DECISIONS.md:284
   - Fix: Add animate (default true; false drops animate-pulse) and rounded (default true) to skeleton/schema.ts with the matching classes. Or list Skeleton animate and rounded under 'Not built, for Omar' at DECISIONS.md:284, noting that the drawn 'lines' is the rows prop

## Refuted by the second reviewer (do not act)

- /en/docs/components/button, (new) shell, all 9 cards: THE CODE part spacing: The computed gap is 12 against the drawn 10, which is 2 px and within the 1-2 px tolerance. The cause is real, though: CODE_PART's gap-2.5 at apps/docs/components/classes.ts:140 is dead because CARD_PART's gap-3 wins in the generated CSS. It is worth cleaning when the line-height fix lands.
