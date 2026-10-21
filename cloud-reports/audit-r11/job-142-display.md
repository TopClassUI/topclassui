# Figma audit, job 142 display

On preview/r8-all d9c04b21 at 1440 dark, frame vs build, each difference re-checked by a second reviewer. Fix what your branch has not fixed yet; skip a row your later commits already cover.

## /en/docs/components/button: differs (10)

Note: Checked against the Figma design context (135:154 and children), side-by-side crops, fresh 2x Playwright shots and DOM probes (verify/ under handoff/figma-audit/r11-review/job-142-display/). The 'shell, all 9 cards' rows apply to every item in this group and are listed only here. The six-cell strip wraps 5 + 1 (cells 159.6 px plus gap-x-6); job 140 is fixing that with gap-x-0, so it is not reported. The card is 932 px against 944 (recorded decision 17), and the code shows the dummy files (decision 10), so neither is reported. Cards taller than 900 px show a black band at the bottom of the r11 captures (tag, kbd). That band is a capture artifact: a scrolled shot renders the card bottom correctly. Two line references from the review were corrected: InlineText is inline-text.tsx:6, and the install-row CopyButton is install-row.tsx:18.

1. **[medium] shell, all 9 cards: head, render chip beside the name**
   - Frame: 85x16 chip (Button); Roboto Mono Regular 9 px; padding 2/7; radius 4; no border
   - Build: Badge sm 127.2x26; mono 14 px weight 500 on a 16 px line; padding 4/8 plus a 1 px transparent border; radius 4
   - Cause: apps/docs/components/previewer/previewer.tsx:89 <Badge ... size="sm" className="font-mono">; BADGE_SIZE.sm is 'px-2 py-pad-y-sm gap-1.5 text-sm/4' (badge/classes.ts)
   - Fix: previewer.tsx:89: size="xs" and className="font-mono font-normal". BADGE_SIZE.xs is 'px-1 py-pad-y-xs gap-1 text-xs', which draws 12 px text in a 22 px chip (16 line + 2x2 padding + 2x1 border) with 4 px inline padding. The chip wording stays generated (decision 18).
2. **[medium] shell, all 9 cards: Try it select**
   - Frame: 208x29; fill surface-raised; border base/line (barely visible on the raised fill); value Roboto Mono 11 px; padding 6, start 10, end 8; caret 13; label 10 px; control block 47 px
   - Build: 211x32; fill surface-raised; bright line-strong border, lab(66) ≈ rgb(161,161,161); value mono 14 px; padding 0/12; caret 14; label 12 px; control block 54 px. Button's stage and Try it row is therefore 334 px against 311.
   - Cause: apps/docs/components/previewer/try-it-control.tsx:62-66 <Select size="sm" className="font-mono">; FIELD_SIZE.sm is 32 px with text-sm; SELECT_TRIGGER uses FIELD_BOX (BORDER_STRONG)
   - Fix: try-it-control.tsx:64: size="xs". Select takes FIELD_SIZE.xs: 28 px with text-xs. Change CONTROL_RESERVE.select (classes.ts:181) to 'h-7 pointer-coarse:h-11' so the reserved box matches. Keep the line-strong border, because a control boundary needs 3:1 (R-5.6-4), and record in DECISIONS that it is brighter than the drawn base/line.
3. **[medium] shell, Button, Tag and Kbd cards: note under the code**
   - Frame: one run of 10.5 px muted text with no code styling; 13 px tall
   - Build: backticked words (`loading`, `aria-busy`; Tag `onRemove`; Kbd `<Svg>`) print as 14 px body-colour mono inside the 12 px muted note. The line is 20 px tall and the code words outshine the sentence.
   - Cause: apps/docs/components/inline-text.tsx:6 always uses INLINE_CODE ('font-mono text-sm text-body', classes.ts:81), including inside NOTE (previewer.tsx:70-72)
   - Fix: Give InlineText an optional codeClassName prop, defaulting to INLINE_CODE. In previewer.tsx:72, pass a mono-only class that inherits the note's size and colour, for example 'font-mono text-[length:inherit] text-muted'.
4. **[medium] shell, all 9 cards: install row copy fields**
   - Frame: field 434.5x34; text 10.5 px mono in 390.5 px; bare 14 px copy icon 8 px from the end. On Button the import line fits one line, and the note under it is one 10 px line.
   - Build: field 429x34 for the add line. On Button the same import string wraps to 2 lines (50 px): 12 px text in a 362 px box beside a 40x32 ghost button. The 'Then import it' note wraps to 2 lines (32 px). Avatar and card take 3 lines (66 px), partly because their generated import names are longer (decision 9).
   - Cause: classes.ts:143-144 COPY_FIELD 'ps-3 pe-1' and COPY_FIELD_TEXT 'text-xs'; install-row.tsx:18 renders CopyButton, whose copy-button.tsx:52 size 'sm' makes a 40 px wide ghost button; NOTE 'text-xs' (classes.ts:165)
   - Fix: COPY_FIELD_TEXT: text-[0.6875rem] (11 px). In copy-button.tsx, use size="xs" when word is undefined, a 32 px wide button. The Button import line (55 characters at 11 px is about 363 px) then fits the 371 px text box on one line.
5. **[low] shell, all 9 cards: card corner and shadow**
   - Frame: rounded-[16px]; shadow 0 2px 12px -4px rgba(0,0,0,0.3)
   - Build: radius 12 px (rounded-box = min(0.5rem*1.5, 1.5rem)); shadow-md = 0 4px 6px -1px rgb(0 0 0/.1), 0 2px 4px -2px rgb(0 0 0/.1). The shadow barely shows on the dark page, but the 4 px corner difference does.
   - Cause: apps/docs/components/classes.ts:127 CARD 'rounded-box'; classes.ts:129 PREVIEWER `${CARD} shadow-md`
   - Fix: classes.ts:129: PREVIEWER = `grid min-w-0 overflow-hidden ${ROUNDED_CARD} bg-surface ${BORDER} shadow-(--docs-card-shadow)`. ROUNDED_CARD (classes.ts:57) is already the drawn 16 px. Declare --docs-card-shadow: 0 2px 12px -4px rgb(0 0 0 / 0.3) in apps/docs/app/globals.css.
6. **[low] shell, all 9 cards: head, Install button**
   - Frame: 79x29; label 12 px Medium; padding 7/12; gap 6; icon 14
   - Build: 87.6x32; label 14 px Medium; padding 0/12; gap 8; icon 14
   - Cause: previewer.tsx:95 <Button size="sm"> (CONTROL_SIZE.sm: h-control-sm 32, px-pad-x-sm, text-sm)
   - Fix: previewer.tsx:95: size="xs" (CONTROL_SIZE.xs: 28 px, text-xs), the step CODE_COPY already uses for the drawn 28 px.
7. **[low] head, description**
   - Frame: one line of 88 characters in a 590 px column; head 79 px
   - Build: two lines of 135 characters in a 556.3 px column at 20 px leading; head 108 px
   - Cause: apps/docs/content/components/button.ts:6 en description is 135 characters
   - Fix: Shorten button.ts:6 en to one line at 14 px, about 85 characters for today's 556 px column (about 90 once the Install fix widens it).
8. **[low] shell, all 9 cards: Try it checkboxes**
   - Frame: 16 px box, radius 4, line-strong border; label 11 px; 25 px pitch
   - Build: 20 px visible box inside a 24 px target, radius 4; label 12 px; 26 px pitch
   - Cause: try-it-control.tsx:35 <Checkbox size="sm"> (TOGGLE_SIZE.sm = 1.25rem)
   - Fix: try-it-control.tsx:35: size="xs" (toggle-xs = 16 px). The 24 px target (TOGGLE_TARGET) stays.
9. **[low] shell, all 9 cards: code part, Copy button**
   - Frame: 73x29; fill base/surface; border base/line; label 12 px Medium; padding 6/10; icon 14
   - Build: 83.2x32; transparent fill; bright line-strong border lab(66); label 14 px Medium; padding 0/12
   - Cause: apps/docs/components/previewer/copy-button.tsx:49-53 Button variant 'outline', tone 'neutral', size 'sm'
   - Fix: When word is set: size="xs" and className="bg-surface border-line". That matches CODE_COPY (classes.ts:121), which the guide pages already draw at 28 px.
10. **[low] shell, all 9 cards: Every state captions**
   - Frame: Roboto Mono 9 px muted; 12 px tall
   - Build: mono 12 px (text-xs); 16 px tall
   - Cause: apps/docs/components/classes.ts:210 STATE_CAPTION '... font-mono text-xs text-muted'
   - Fix: classes.ts:210: replace text-xs with TYPE.eyebrow ('text-[0.6875rem] leading-4', 11 px), the site's smallest drawn step.

## /en/docs/components/tag: differs (3)

Note: The shared shell rows under button apply here too. The import field fits on one line. The chip wording ('split - 0 KB server + 16.9 KB client' against the drawn 0.4 KB) is generated, so it is not reported. Cells are 159.6 px plus gap 24; job 140's gap-x-0 handles that.

1. **[high] stage, demo at rest**
   - Frame: a centred row of five soft tags (primary, neutral, success, warning, danger), gap 8, 426x29. Each tag has padding 6/12, 14 px Medium text and radius/chip. Danger carries a 14 px x after its label (gap 4).
   - Build: one neutral tag 'Design systems', 132x30, centred in a 320 px stage
   - Cause: apps/docs/content/components/tag.ts sets no stageDemo (only stageHeight: 20 at :10), so the stage is tag/dummy/playground.tsx, a single <Tag>
   - Fix: Add a client stage dummy (for example tag/dummy/stage.tsx) with 'flex items-center gap-2' holding Tag tone primary, neutral, success and warning, then TagRemovable tone danger, and set stageDemo: 'stage' in tag.ts. The existing tones.tsx is close, but it has six tones and no x.
2. **[medium] Try it panel**
   - Frame: variant (soft), tone (neutral) and size (md) selects; removable, truncate and disabled checkboxes; 311 px row
   - Build: tone and size selects only; no checkboxes; 320 px row (stageHeight 20)
   - Cause: tag/schema.ts declares only tone and size; tag.ts has no extraSwitches; Tag has no variant (soft only). None of these props is in the DECISIONS 'Not built, for Omar' list.
   - Fix: Add extraSwitches: ['removable', 'disabled'] in tag.ts, and have playground.tsx render TagRemovable when removable is true. Record variant and truncate under 'Not built, for Omar' in DECISIONS.
3. **[medium] Every state, hover and active cells**
   - Frame: hover fill primary/soft-hover, sampled (18,37,77); active fill primary/soft-active, sampled (19,44,96); idle (16,30,59)
   - Build: idle, hover and active all fill (16,30,59): computed oklch(0.241 0.059 262.9) on all three. --tc-soft-hover and --tc-soft-active resolve on the anchors, and the .bg-\(--tc-soft-hover\) rule exists, but .bg-primary-soft sits later in the utilities layer and wins.
   - Cause: packages/topclassui/src/components/tag/dummy/states.tsx:12-13 build the class with a template string, `${chip} bg-(--tc-soft-hover)`. Both bg utilities stay on the element and the cascade order picks bg-primary-soft. Button's states work because Button merges its className with cn().
   - Fix: states.tsx:12-13: import { cn } from '#shared/cn.js' (other dummies already do) and write cn(chip, 'bg-(--tc-soft-hover)') and cn(chip, 'bg-(--tc-soft-active)'), so tailwind-merge drops bg-primary-soft.

## /en/docs/components/kbd: differs (4)

Note: The shared shell rows under button apply here too. The import field fits on one line. DECISIONS 2026-10-19 records Kbd variant, size and muted as 'Not built, for Omar'. pressed and disabled exist, but Try it cannot reach them. The review cited kbd.ts:124-125; the stageDemo is at kbd.ts:10 and stageHeight at :11. Idle, hover and active fills match the frame: (38,38,38), (38,38,38) and (23,23,23).

1. **[high] Try it panel**
   - Frame: 248 px Try it column: variant (outline) and size (md) selects; pressed, muted and disabled checkboxes
   - Build: no Try it column; the stage spans the full 930 px
   - Cause: Kbd has no schema.ts and no dummy/playground.tsx (the folder holds README, dummy, index, meta, test, types), so previewer.tsx:60 finds no playground and takes the stage-only branch (previewer.tsx:119-125)
   - Fix: Add packages/topclassui/src/components/kbd/schema.ts with pressed and disabled (booleans, default false), plus a dummy/playground.tsx that renders <Kbd {...props}>Ctrl</Kbd><Kbd {...props}>Shift</Kbd><Kbd {...props}>K</Kbd> in 'flex items-center gap-1'. variant, size and muted stay recorded as not built.
2. **[high] stage, demo at rest**
   - Frame: three bare keycaps (Ctrl, Shift, K), gap 5, centred. Each cap: padding 3/7, Roboto Mono 11 px, radius 4, line-strong border, surface-raised fill, 23 px tall.
   - Build: a raised panel 344.7x90 (rounded-box 12 px, border-line, bg-surface-raised, p-4) holding two sentences: 'Press Ctrl K to open the command palette.' and 'Press Shift Tab to move focus backwards.'
   - Cause: apps/docs/content/components/kbd.ts:10 stageDemo: 'combination', which renders kbd/dummy/combination.tsx (a panel of sentences)
   - Fix: Once the playground exists, remove stageDemo so the stage is the three sibling keys. Until then, point stageDemo at a new dummy holding Ctrl, Shift and K in 'flex items-center gap-1'.
3. **[medium] stage height**
   - Frame: stage and Try it row 250 px
   - Build: stage 130 px (min-h 8rem plus content)
   - Cause: kbd.ts:11 stageHeight: 8, with no Try it to set the row
   - Fix: Once Try it exists, its column sets the row. Otherwise use stageHeight: 15.625 (250 px).
4. **[low] Every state, disabled cell**
   - Frame: the idle keycaps at opacity 0.5: sampled fill (30,30,30), with the line-strong border and body text faded
   - Build: opacity 1; fill surface (23,23,23); border line; text muted
   - Cause: packages/topclassui/src/components/kbd/index.tsx:14 'data-disabled:bg-surface data-disabled:border-line data-disabled:text-muted' (the code comment keeps 4.5:1 text). DECISIONS line 267 says the disabled look is 'as the frame's strip draws them', which it is not.
   - Fix: Either use data-disabled:opacity-50 as drawn, or correct the DECISIONS Kbd bullet to say that a disabled key keeps 4.5:1 text in place of the drawn 50% fade.

## /en/docs/components/badge: differs (3)

Note: The shared shell rows under button apply here too, including the import field wrapping to 2 lines. The code part is 680 px tall against 294 because the stage sample is the 27-line tones.tsx; dummy-file samples are recorded (decision 10). The states match: 3 cells, solid, soft and outline. Badges are 30 px tall, recorded in DECISIONS ('30 px tall as drawn'). The capitalised labels (Primary against primary) are a wording difference only.

1. **[low] stage, solid, soft and outline rows**
   - Frame: badges 8 px apart, rows 10 px apart; group 478x109
   - Build: badges 12 px apart, rows 12 px apart; group 504.2x114
   - Cause: packages/topclassui/src/components/badge/dummy/tones.tsx:5 'flex flex-col gap-3'; the rows at :6, :14 and :22 use 'gap-3'
   - Fix: tones.tsx:5: gap-3 becomes gap-2.5. tones.tsx:6, :14 and :22: gap-3 becomes gap-2.
2. **[low] stage and Try it row height**
   - Frame: row 311 px
   - Build: row 256 px; Try it holds the three selects only
   - Cause: dot, uppercase and truncate are recorded as not built (DECISIONS line 274), so the Try it column is shorter; badge.ts:10 sets stageHeight: 8
   - Fix: Keep the props as recorded. To hold the drawn row, set stageHeight: 19.4375 (311 px) in badge.ts:10.
3. **[low] head, description**
   - Frame: one line (82 characters); head 79 px
   - Build: 2 lines (107 characters); head 108 px
   - Cause: apps/docs/content/components/badge.ts:6 en description
   - Fix: Shorten it to one line, about 85 characters, together with the shared head fixes.

## /en/docs/components/avatar: differs (5)

Note: The shared shell rows under button apply here too. The import field takes 3 lines (66 px against 34), partly because of the generated names (decision 9). Shape, bordered, status and clickable are recorded as 'Not built, for Omar' (DECISIONS line 274). The 'LH' initials against the drawn 'OA' are wording only.

1. **[high] stage, demo at rest**
   - Frame: three 56 px avatars, gap 14: a primary/solid disc with a white 28 px image glyph, initials 'OA' (21 px Medium on neutral/soft), and a 28 px user icon on neutral/soft
   - Build: one 40 px avatar showing the slate portrait SVG
   - Cause: apps/docs/content/components/avatar.ts sets no stageDemo, so the stage is avatar/dummy/playground.tsx: one AvatarRoot at the Try it size md (40 px)
   - Fix: Add a stage dummy with three AvatarRoot size="xl" (control-xl = 56 px) in 'flex items-center gap-3.5': an image, the initials OA, and a user icon. Set stageDemo to it in avatar.ts.
2. **[medium] stage height**
   - Frame: row 250 px
   - Build: 128 px
   - Cause: avatar.ts:10 stageHeight: 8, and the Try it has one select
   - Fix: stageHeight: 15.625 (250 px).
3. **[medium] Every state, avatar size**
   - Frame: 40 px discs (md); initials 15 px; icons 20 px
   - Build: 48 px discs (lg); initials 18 px; user icon 24.3 px
   - Cause: packages/topclassui/src/components/avatar/dummy/states.tsx:13, 19, 24 and 29 size="lg"
   - Fix: states.tsx:13, 19, 24 and 29: size="md", or drop size.
4. **[low] Every state, image cell**
   - Frame: primary/solid disc with a white 20 px image glyph
   - Build: slate #475569 disc with an #e2e8f0 portrait figure
   - Cause: avatar/dummy/states.tsx:6 PORTRAIT data URI
   - Fix: Record in DECISIONS that a real portrait stands in for the drawn image placeholder, or draw the placeholder.
5. **[low] head, description**
   - Frame: one line (85 characters); head 79 px
   - Build: 2 lines (118 characters); head 108 px
   - Cause: avatar.ts:6 en description
   - Fix: Shorten it to one line, together with the shared head fixes.

## /en/docs/components/avatar-group: differs (6)

Note: The shared shell rows under button apply here too. The import field takes 2 lines in both the frame and the build. Spacing, showCount and bordered are recorded as 'Not built, for Omar'. The counter reads +2 and +3 against the drawn +9, and the chip says server against the drawn split; both are content or generated.

1. **[medium] stage and Every state, clipped initials**
   - Frame: the 4th disc reads 'RK' and stays clear of the counter
   - Build: the 4th disc reads 'MN' (26.7 px wide in a 40 px disc). The counter overlaps it by 8 px plus a 2 px ring and cuts off the N, on the stage and in the overflow cell.
   - Cause: packages/topclassui/src/components/avatar-group/dummy/playground.tsx:5 and dummy/states.tsx:5: TEAM holds ['SK','Sara Khalil'], ['MN','Mona Nasser']
   - Fix: Use the drawn members in both files: SN (Sara Nasser) and RK (Rami Khoury) in place of SK and MN.
2. **[medium] Every state, disc size**
   - Frame: 32 px discs (sm), 24 px pitch, initials 12 px; groups 56, 104 and 128 px wide
   - Build: 40 px discs (md), 32 px pitch, initials 16 px; groups 72, 136 and 168 px wide
   - Cause: packages/topclassui/src/components/avatar-group/dummy/states.tsx:20 and :22: AvatarGroup and AvatarRoot have no size, so they default to md
   - Fix: states.tsx: size="sm" on AvatarGroup and on each AvatarRoot.
3. **[low] +N counter ring**
   - Frame: counter disc (primary/soft) with no ring
   - Build: a visible 2 px grey ring around the primary-soft counter: computed box-shadow 0 0 0 2px oklch(0.244 0 0)
   - Cause: avatar-group/classes.ts:11 GROUP_RING '*:ring-2 *:ring-neutral-soft'. The *: variant has the same specificity as GROUP_COUNTER's 'ring-primary-soft' (classes.ts:33-37) but comes later in the CSS, so it wins.
   - Fix: classes.ts:33-37: write ring-primary-soft! in each size, or scope GROUP_RING to the children that are not the counter.
4. **[low] stage, disc size and overlap**
   - Frame: 5 discs of 44 px, overlap 10 (34 px pitch), initials 17 px; row 180x44
   - Build: 5 discs of 40 px, overlap 8 (32 px pitch), initials 16 px; row 168x40
   - Cause: the playground stage at size md (control-md 40) with classes.ts:24 md 'ps-2 *:-ms-2'
   - Fix: The drawn 44 px sits between md and lg. Either keep md and record it, or draw the stage at a custom size-11 with *:-ms-2.5.
5. **[low] stage and Try it row height**
   - Frame: row 286 px
   - Build: row 188 px (max and size selects)
   - Cause: spacing, showCount and bordered are recorded as not built, so Try it is shorter; avatar-group.ts:10 stageHeight: 8
   - Fix: Keep the props as recorded, and set stageHeight: 17.875 (286 px) to keep the drawn row.
6. **[low] head, description**
   - Frame: one line (70 characters); head 79 px
   - Build: 2 lines (104 characters); head 108 px
   - Cause: avatar-group.ts:6 en description
   - Fix: Shorten it to one line, together with the shared head fixes.

## /en/docs/components/card: differs (5)

Note: The shared shell rows under button apply here too. The import field takes 3 lines (66 px against 34), partly because of the generated names. Card variant and padding are recorded as 'Not built, for Omar'. The drawn focus ring (158x134, running down over the install row) is a frame slip and is not reported. The idle (surface-raised) and hover (surface) fills of the states match. The review cited card.ts:11 for stageHeight; it is card.ts:10.

1. **[high] Try it panel**
   - Frame: 248 px Try it: variant (outline) and padding (md) selects; interactive, media and footer (checked) checkboxes
   - Build: no Try it at all. The stage spans 930 px, and the panel is centred at x 316 instead of x 197.
   - Cause: card has no schema.ts and card/dummy has no playground.tsx, so previewer.tsx:60 finds no playground and takes the stage-only branch (previewer.tsx:119-125)
   - Fix: Add card/schema.ts and card/dummy/playground.tsx with interactive, media and footer booleans (render as <a>, add CardMedia, add CardFooter) so Try it renders. Otherwise record the whole Try it as not built in DECISIONS.
2. **[medium] Every state, panels**
   - Frame: 150x46 panels (p 12, gap 6, radius/box), each holding two neutral/soft skeleton bars (80x8 and 110x6, radius 4); idle on surface-raised, hover on surface
   - Build: 250.3x85.5 cards holding text: 'Monthly report' (16 px semibold) over 'Revenue rose 12% against April.' (14 px). The strip is 147 px tall where the frame draws 140.
   - Cause: packages/topclassui/src/components/card/dummy/states.tsx:6-15: Sample renders CardHeader and CardBody text
   - Fix: Sample: CardRoot className="w-37.5 gap-1.5 p-3" with two Skeleton rect bars (w-20 h-2 and w-27.5 h-1.5) in place of the text, as drawn.
3. **[low] stage height**
   - Frame: row 250 px
   - Build: 192 px
   - Cause: apps/docs/content/components/card.ts:10 stageHeight: 12
   - Fix: stageHeight: 15.625 (250 px), or let the Try it set it.
4. **[low] stage panel, footer buttons**
   - Frame: 'Read more': 86x29, 12 px Medium, padding 7/12. 'Later': 52x29, base/surface fill, base/line border (near invisible), 12 px, padding 6/10. Panel 300x140.
   - Build: 'Read more': 97.8x32, 14 px. 'Later': 60.1x32, transparent fill, bright line-strong border lab(66). Panel 300x145.
   - Cause: packages/topclassui/src/components/card/dummy/basic.tsx:14-15 <Button size="sm"> and <Button size="sm" variant="outline" tone="neutral">
   - Fix: basic.tsx:14-15: size="xs" (28 px, 12 px text). For Later, also pass className="bg-surface border-line" for the drawn filled chip.
5. **[low] head, description**
   - Frame: one line (77 characters); head 79 px
   - Build: 2 lines (114 characters); head 108 px
   - Cause: card.ts:6 en description
   - Fix: Shorten it to one line, together with the shared head fixes.

## /en/docs/components/separator: differs (4)

Note: The shared shell rows under button apply here too. The import field takes 2 lines. 'spacing' is recorded as not built. The label gap of 10 against the 8 in the strip is recorded in DECISIONS ('10 apart'). The rest of the states match: horizontal 112 against 110 px, vertical 40 px.

1. **[low] stage, labelled line**
   - Frame: the 'or' row is 273 px wide (lines of 120 px, gap 10), inset 13.5 px from each end of the 300 px plain line
   - Build: the labelled separator spans the full 300 px (lines of 134.1 px each)
   - Cause: packages/topclassui/src/components/separator/dummy/playground.tsx:12 <Separator {...props}>or</Separator> inside the w-75 column; SEPARATOR_LABELLED.horizontal is w-full (separator/classes.ts:14)
   - Fix: playground.tsx:12: className="w-68 self-center" on the labelled separator when the orientation is horizontal.
2. **[low] stage and Every state, label type**
   - Frame: 'or' in Roboto Mono, 10 px on the stage and 9 px in the strip
   - Build: 'or' in Inter (sans) at 12 px
   - Cause: separator/classes.ts:14-15 SEPARATOR_LABELLED 'text-xs text-muted' has no font-mono
   - Fix: Pass className="font-mono" on the labelled Separator in dummy/playground.tsx and dummy/states.tsx, or add font-mono to SEPARATOR_LABELLED if every label should be mono.
3. **[low] Try it panel and stage height**
   - Frame: orientation and spacing selects; withLabel and decorative (checked) checkboxes; row 225 px
   - Build: orientation select and decorative checkbox; row 146 px
   - Cause: spacing is recorded as not built. withLabel has no switch and is not recorded, because the playground always draws both lines. separator.ts:10 stageHeight: 8.
   - Fix: Add withLabel to extraSwitches in separator.ts and have the playground draw the labelled line only when it is on. Set stageHeight: 14.0625 (225 px).
4. **[low] head, description**
   - Frame: one line (80 characters); head 79 px
   - Build: 2 lines (113 characters); head 108 px
   - Cause: separator.ts:6 en description
   - Fix: Shorten it to one line, together with the shared head fixes.

## /en/docs/components/skeleton: differs (5)

Note: The shared shell rows under button apply here too. The import field takes 2 lines. DECISIONS records 'rows step down (full, 5/6, 2/3) and are 0.75em thick'. The fixes below change only the font size the dummies set, not that rule.

1. **[medium] stage, circle and lines**
   - Frame: 44 px circle, gap 16; bars 220, 180 and 140 px wide, 10 px thick, 8 px apart (18 px pitch); group 280x46
   - Build: 40 px circle, gap 16; bars 232, 193.3 and 154.7 px wide, 12 px thick on a 24 px pitch; group 288x72
   - Cause: skeleton/classes.ts:13 circle 'size-control-md'; :19 SKELETON_ROW 'h-[0.75em] my-[calc((1lh-0.75em)/2)]' at text-base/24; packages/topclassui/src/components/skeleton/dummy/playground.tsx:7 'w-72'
   - Fix: playground.tsx:7: 'flex w-70 max-w-full items-center gap-4 text-[0.8333rem]/[1.125rem]', which gives 0.75em = 10 px bars on an 18 px pitch. Add className="size-11" on the circle at :8.
2. **[low] Try it panel and stage height**
   - Frame: variant (text) and lines (3) selects; animate and rounded, both checked; row 225 px
   - Build: variant and rows selects (the drawn 'lines' is named rows); row 188 px
   - Cause: skeleton/schema.ts exposes only variant and rows. animate and rounded are neither built nor recorded.
   - Fix: Add animate and rounded, or record them under 'Not built, for Omar'. Note there that the drawn 'lines' is the rows prop.
3. **[low] Every state, text cell**
   - Frame: two bars, 110x8 and 84x8, 6 px apart (22 px tall)
   - Build: two bars, 112x12 and 74.7x12, on a 24 px pitch (48 px tall)
   - Cause: packages/topclassui/src/components/skeleton/dummy/states.tsx:7 'w-28' at text-base/24
   - Fix: states.tsx:7: className="w-27.5 text-[0.6667rem]/[0.875rem]" (8 px bars on a 14 px pitch).
4. **[low] Every state, circle cell**
   - Frame: circle 36 px
   - Build: circle 40 px (size-control-md)
   - Cause: states.tsx:8 <Skeleton variant="circle" /> takes skeleton/classes.ts:13 'size-control-md'
   - Fix: states.tsx:8: className="size-9".
5. **[low] head, description**
   - Frame: one line (86 characters); head 79 px
   - Build: 2 lines (113 characters); head 108 px
   - Cause: skeleton.ts:6 en description
   - Fix: Shorten it to one line, together with the shared head fixes.

## Refuted by the second reviewer (do not act)

- /en/docs/components/button, shell, all 9 cards: head, Light/Dark/Ocean switch: DECISIONS 2026-10-19 (SegmentedControl) records that segments are regular weight and the selected one medium. Every remaining measure is within 1-2 px (icon 16 against 14, segment 24 against 23 tall, padding 10 against 9), and the 2.5x crop looks the same.
- /en/docs/components/button, stage, five variants: The gap is 12 against 10 (2 px). The labels Save, Draft and so on against 'Button' are a wording difference, and the row stays the same size (435.5 against 427 px).
- /en/docs/components/tag, head: Both descriptions take 2 lines. The 12 px of extra head height comes from the type scale's 20 px leading and the 28 px title line (recorded snapping), and the reviewer proposed no change.
- /en/docs/components/kbd, Every state, arrangement: This is a frame-side slip: 4 cells of 227 px exceed the 906 px row, so the frame wraps 3 + 1. The build's single row is the intended layout, so there is nothing to change in the build.
- /en/docs/components/kbd, Every state, key spacing: gap 4 against 5 is within 1 px.
- /en/docs/components/badge, Try it panel (dot, uppercase, truncate): These props are recorded as 'Not built, for Omar' (DECISIONS line 274). The row-height consequence is kept as its own low row.
- /en/docs/components/avatar, Try it panel (shape, bordered, status, clickable): These props are recorded as 'Not built, for Omar' (DECISIONS line 274). The stage height is kept as its own row.
- /en/docs/components/avatar, Every state, arrangement: This is a frame-side slip: 4 x 227 px exceeds the 906 px row, so the frame wraps. The build's single row is correct.
- /en/docs/components/avatar-group, Try it panel (spacing, showCount, bordered): These props are recorded as 'Not built, for Omar' (DECISIONS line 274). Only the row height is kept, with a stageHeight fix.
- /en/docs/components/skeleton, Every state, rect and card cells and their radii: Everything here is within 2 px: rect 112 against 110 wide, card 112x44.8 against 110x46, radii 8 against 6 and 12 against 10, all set by the radius knob. Only the 40 against 36 px circle survives, as its own row.
- /en/docs/components/skeleton, Every state, arrangement: This is a frame-side slip: 4 x 227 px exceeds the 906 px row, so the frame wraps 3 + 1. The build's single row is correct.
