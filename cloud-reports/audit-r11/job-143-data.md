# Figma audit, job 143 data

On preview/r8-all d9c04b21 at 1440 dark, frame vs build, each difference re-checked by a second reviewer. Fix what your branch has not fixed yet; skip a row your later commits already cover.

## /en/docs/components/table: differs (15)

Note: Frame 137:1022 (944x982) vs card 932x1787; the extra height is mostly the dummy code sample (recorded). Many of the reviewer's line refs were wrong: table/dummy/states.tsx is 52 lines and try-it-control.tsx is 102, so the refs are corrected below. The six-cell strip wraps 5+1 (loading on its own row), which job 140's gap-x-0 fix covers. The Figma drawing errors (carets inside the avatars, 91 px state panels spilling over 'Every state', the Try it column clipped at 336) are not copied, and that is correct. Crops are in r11-review/job-143-data-skeptic/table-*.png.

1. **[high] Every state, 'hover row' cell**
   - Frame: row 2 filled base/surface #171717 on the #262626 panel
   - Build: identical to 'idle': no row is tinted (tr has no data attribute; bg transparent)
   - Cause: table/dummy/states.tsx:27-29 renders a plain <Table>. ROW (table/classes.ts:82) has only hover:bg-surface and no forced data-hover hook, though docs-site.md S8 says the strip renders forced-state attributes (data-hover).
   - Fix: Add a forced hover hook to Table, such as data-hover:bg-surface on ROW plus a hoveredKeys-style prop, and use it in states.tsx:28 for row-2. Or, as a demo-only stopgap, wrap row 2's cell content in a span with bg-surface and the cell's negative padding.
2. **[medium] stage, table panel**
   - Frame: panel 460x176 centred in a 694x336 stage (x 117, y 80); fixed columns 200 / 120 / 100 after 14 px inline padding
   - Build: table box 313x175 centred in a 682x352 stage (x 184); columns shrink to content: 155 / 74 / 83
   - Cause: packages/topclassui/src/components/table/dummy/playground.tsx:16-22: <Table> has no width and its columns no className. BOX (table/classes.ts:9) is a grid item inside STAGE's place-items-center (apps/docs/components/classes.ts:168), so it shrinks to its content.
   - Fix: playground.tsx:16 add className="w-full max-w-115" (460 px), and give the name column className 'w-50' and the role column 'w-30' (TableColumn.className, table/types.ts:36), so status takes the rest
3. **[medium] Every state, idle / hover row / sorted / selected cells**
   - Frame: panel 126x91: three rows only, no header; each row 29 tall (py 7, px 8), text 12 px regular muted, radius 12
   - Build: Table 128x129: a 28 px 'Name' header row with a sort icon, then three 33 px rows (py 6, px 14, 1 px line), text 14 px muted
   - Cause: table/dummy/states.tsx:13-15 (columns with header 'Name' and sortHref) and density="compact" at :25, :28, :31-39 and :42. CELL_DENSITY.compact py-1.5 plus BODY_CELL text-sm (table/classes.ts:95, :100).
   - Fix: Give Table a visually hidden header option (or a states-only column with an sr-only header) and a 12 px cell step for the strip, or record in DECISIONS.md that the strip keeps the header, as it already does for empty
4. **[medium] Try it, selects**
   - Frame: 208x29: pl 10 / pr 8 / py 6, value 11 px Roboto Mono, caret 13
   - Build: 211x32: px 12, value 14 px Geist Mono, caret 14
   - Cause: apps/docs/components/previewer/try-it-control.tsx:62-66 Select size="sm" (FIELD_TEXT.sm is text-sm, src/shared/classes.ts:276)
   - Fix: try-it-control.tsx:64 size="xs" (28 px, text-xs 12 px). The line-strong border stays (recorded).
5. **[medium] The code, Copy button**
   - Frame: 73x29: px 10, py 6, gap 6, fill base/surface #171717, border base/line #262626, 12 px Medium label
   - Build: 83.2x32: px 12, gap 8, transparent on the #0a0a0a page, border line-strong #a1a1a1 (a light outline), 14 px label
   - Cause: apps/docs/components/previewer/copy-button.tsx:49-53 Button variant="outline" size="sm"; outline is border-line-strong (button/variants.ts:33)
   - Fix: In copy-button.tsx, when word is set, use size="xs" with className="bg-surface border-line px-2.5 gap-1.5" (CODE_COPY's look, apps/docs/components/classes.ts:121) and the icon in CODE_COPY_ICON ('flex text-muted')
6. **[low] Every state, 'sorted' cell**
   - Frame: the first row reads 'A - Z'; no header
   - Build: the sort-ascending icon in the 'Name' header marks the sort; rows read Row 1-3
   - Cause: table/dummy/states.tsx:30-40 shows the sort through the header (sort prop)
   - Fix: Keep it, since it is the component's real sorted look, and record it, or make the first row 'A - Z' as drawn
7. **[low] stage row height**
   - Frame: stage and Try it row 336 tall
   - Build: 352 tall
   - Cause: apps/docs/content/components/table.ts:13 stageHeight: 22 (rem)
   - Fix: stageHeight: 21
8. **[low] stage, status badges**
   - Frame: Badge 45x19: px 4, py 2, no border, 12 px on a 15 px line
   - Build: Badge 46.2x22: px 4, py 2, a 1 px transparent border, 12 px on a 16 px line
   - Cause: table/dummy/playground.tsx:42 Badge size="xs"; badge/classes.ts:38 xs 'px-1 py-pad-y-xs gap-1 text-xs' (16 px line) plus the always-present border
   - Fix: Badge xs 'text-xs/tight' (21 px), or accept it as the library's xs step
9. **[low] Try it, checkboxes**
   - Frame: 16 px box, radius 4, 8 px to an 11 px label, 25 px pitch
   - Build: 20 px box (toggle sm) in a 24 px button, 8 px to a 12 px label, 26 px pitch
   - Cause: apps/docs/components/previewer/try-it-control.tsx:35 Checkbox size="sm"
   - Fix: size="xs" (16 px toggle); the 24 px target stays
10. **[low] head**
   - Frame: 96 tall: title 19 px on a 23 px line, 3 px gap, description 14 px on 17 px lines (2 lines in 590 px)
   - Build: 108 tall: title 18 px on a 28 px line, 4 px gap, description 14 px on 20 px lines (2 lines in 556 px)
   - Cause: apps/docs/components/classes.ts:158 CARD_TITLE 'text-lg' and :163 SMALL 'text-sm' (the scale's line heights); previewer.tsx:84 gap-1
   - Fix: CARD_TITLE 'text-lg/tight font-semibold text-body'; the description at previewer.tsx:91 'text-sm/tight text-muted', and gap-0.75 at :84 (the Toast/Alert tight-line precedent)
11. **[low] head, card mode switch size**
   - Frame: 217x31: segments 66/64/75 x 23, px 9, py 4, gap 5, 14 px icons
   - Build: 230.1x32: segments 70.1/69/79 x 24, px 10, gap 6, 16 px icons (13 px wider, which also narrows the description column to 556 px)
   - Cause: apps/docs/components/previewer/card-mode-switch.tsx:41 Svg size="1rem"; SegmentedControl size sm paddings
   - Fix: card-mode-switch.tsx:41 Svg size="0.875rem"
12. **[low] head, Install button**
   - Frame: 79x29: px 12, py 7, gap 6, 14 px icon, 12 px Medium label
   - Build: 87.6x32: px 12, gap 8, 14 px icon, 14 px Medium label
   - Cause: apps/docs/components/previewer/previewer.tsx:95 Button size="sm"
   - Fix: size="xs" with className="gap-1.5" (28 px, 12 px label)
13. **[low] The code, plain token colour**
   - Frame: JSX plain text base/body #fafafa; the import line muted #a1a1a1
   - Build: every plain token #d4d4d4 (import line and JSX alike)
   - Cause: apps/docs/lib/shiki-themes.ts:14 DARK_GROUND text '#d4d4d4' (neutral-300)
   - Fix: DARK_GROUND.text '#fafafa' (neutral-50, the body colour)
14. **[low] card frame**
   - Frame: radius 16; shadow 0 2px 12px -4px rgba(0,0,0,0.3)
   - Build: radius 12 (rounded-box); shadow-md (0 4px 6px -1px and 0 2px 4px -2px at rgba(0,0,0,0.1))
   - Cause: apps/docs/components/classes.ts:127 CARD rounded-box; :129 PREVIEWER adds shadow-md
   - Fix: PREVIEWER = `grid min-w-0 overflow-hidden ${ROUNDED_CARD} bg-surface ${BORDER}` plus a site class holding the frame's 0 2px 12px -4px shadow (ROUNDED_CARD, classes.ts:57, is already the drawn 16 px)
15. **[low] Every state captions**
   - Frame: 9 px Roboto Mono muted, 9 px under the 56 px box
   - Build: 12 px mono muted, 10 px under
   - Cause: apps/docs/components/classes.ts:210 STATE_CAPTION text-xs
   - Fix: STATE_CAPTION 'text-[0.6875rem]' (TYPE.eyebrow, the docs' 11 px step, the nearest to 9)

## /en/docs/components/tree-view: differs (9)

Note: Frame 137:1223 (944x993) vs card 932x1138. The frame's code caption ('Item icons are IconName strings...') is recorded as wrong (docs-site.md, notes wrong for the built code), so 'The code' is correct. The strip wraps 5+1 (empty on its own row), which job 140's gap-x-0 fix covers. The 32 px rows are recorded (DECISIONS 2026-10-19). Crops are in r11-review/job-143-data-skeptic/tree-view-*.png.

1. **[high] Every state, 'focus-visible' cell**
   - Frame: a 2 px base/ring rectangle, radius 12, 4 px outside the 'src' row (54x31)
   - Build: no ring at rest; the cell looks the same as 'expanded'
   - Cause: packages/topclassui/src/components/tree-view/dummy/states.tsx:30-32 renders a plain TreeView (its comment at :16-17 says the ring shows only once Tab reaches the tree). TREE_VIEW_ROW_ACTIVE (tree-view/classes.ts:35) depends on group-focus-visible/tree, with no forced hook, though S8 asks for forced data-focus-visible.
   - Fix: Add a forced focus hook to TreeView, such as data-focus-visible on the row mapped to the same outline classes as TREE_VIEW_ROW_ACTIVE, and set it on the first row in states.tsx:31
2. **[medium] stage, tree panel**
   - Frame: panel 300x171, p 8, 2 px between rows; 5 nodes: components (open) > button (open) > index.tsx (selected), variants.ts; input (closed)
   - Build: panel 172x242, p 8; 8 nodes (src > app > layout.tsx, page.tsx selected; components; lib; package.json; README.md), 7 visible, README.md scrolled out of the box
   - Cause: tree-view/dummy/playground.tsx:9-24 (8-node ITEMS) and :28 (no width), so the tree shrinks to its labels
   - Fix: playground.tsx:28 add className="w-75" (300 px) and trim ITEMS to the five drawn nodes, expanded and selected as drawn
3. **[medium] The code, note**
   - Frame: a plain 10.5 px muted sentence, no code styling
   - Build: the inline runs `items` and `getKey` are 14 px Geist Mono in #fafafa inside the 12 px muted note, which grows the line to 20 px
   - Cause: apps/docs/components/previewer/previewer.tsx:72 InlineText; apps/docs/components/inline-text.tsx:6 uses INLINE_CODE (apps/docs/components/classes.ts:81 'font-mono text-sm text-body')
   - Fix: Give InlineText an optional codeClassName and pass 'font-mono text-[length:inherit] text-muted' from the note in previewer.tsx:72
4. **[medium] Every state, collapsed / expanded / selected / focus-visible cells**
   - Frame: rows sit bare on the card surface: px 6, py 4 (23 tall), 12 px text, 11 px caret and file icons, 3 px row gap; leaf rows at pl 18 with no caret slot (icon 12 px right of the parent's caret)
   - Build: each state sits in a raised #262626 box (p 8, radius 12): collapsed 72x50, the others 119x114; rows 32 tall, 14 px text; a leaf's icon sits 36 px right of the parent's caret (18 px indent plus a 12 px empty caret slot plus 6 px gap)
   - Cause: tree-view/dummy/states.tsx:21-32 renders full TreeViews; TREE_VIEW_TREE (tree-view/classes.ts:10) 'rounded-box bg-surface-raised p-2'
   - Fix: Let the strip render the tree without its box (a className reaching the tree element: bg-transparent p-0 border-0), or record the boxed strip in DECISIONS.md
5. **[low] stage, branch and item icons**
   - Frame: an expanded branch shows icon/folder-open and a collapsed one icon/folder; caret and folder pixels peak at #8a8a8a / #a1a1a1, which is muted (the selected row's icon reaches #4d99f3, its full primary-on-soft)
   - Build: every branch shows the closed folder (src and app included); caret and icons peak at #bebebe / #cfcfcf (body colour)
   - Cause: tree-view/dummy/playground.tsx:6, :11, :13 FOLDER on every branch; tree-view/classes.ts:41 and :43 TREE_VIEW_CARET / TREE_VIEW_ICON text-body. DECISIONS 2026-10-19 says 'body colour', but the frame's pixels read muted, so that entry misreads the frame.
   - Fix: Import folderOpen from '#icons/data/folder-open.js' for the expanded src and app; classes.ts:41,43 text-body to text-muted (keep group-aria-selected primary-on-soft), and correct the DECISIONS line
6. **[low] stage row height**
   - Frame: 311
   - Build: 352
   - Cause: apps/docs/content/components/tree-view.ts:10 stageHeight: 22
   - Fix: stageHeight: 19.4375
7. **[low] Every state, loading cell**
   - Frame: two bare bars, 100x8 and 80x8, 5 px apart
   - Build: a raised bordered box 134x62 (p 16) holding the 100x8 and 80x8 bars 12 px apart
   - Cause: tree-view/classes.ts:55 TREE_VIEW_NOTE_KIND.loading 'flex flex-col gap-3 rounded-box bg-surface-raised p-4 BORDER' (DECISIONS records only the bars, not the box)
   - Fix: classes.ts:55 'flex flex-col gap-1.25' so the bars sit bare as drawn
8. **[low] head, title and height**
   - Frame: 'TreeView'; head 79 tall: the 86-character description fits one line in 590 px (about 581 px of text)
   - Build: 'Tree view'; head 108 tall: the 110-character description wraps to 2 lines in 556 px, on 20 px lines
   - Cause: apps/docs/content/components/tree-view.ts:6 description.en (longer), plus a text column narrowed to 556 px by the wider mode switch and Install (see Table), plus the scale line heights (classes.ts:158, :163)
   - Fix: Shorten the description to about 80 characters (556 px at 14 px). Even the drawn sentence would wrap at 556, and also at 578 after the chrome fixes. Apply the head tight-line fix listed under Table.
9. **[low] shared card chrome**
   - Frame: mode switch 217x31 with 14 px icons; Install 79x29 at 12 px; Copy 73x29 on surface with a #262626 border; radius 16 with a soft shadow; selects 29 tall at 11 px; captions 9 px
   - Build: 230x32 with 16 px icons; 87.6x32 at 14 px; 83.2x32 transparent with a #a1a1a1 border; radius 12, shadow-md; selects 32 tall at 14 px; captions 12 px
   - Cause: card-mode-switch.tsx:41, previewer.tsx:95, copy-button.tsx:49-53, classes.ts:127-129 and :210, try-it-control.tsx:64
   - Fix: As listed under Table

## /en/docs/components/timeline: differs (7)

Note: Frame 137:1409 (944x938) vs card 932x1124. Having no Try it is recorded (S8). The loading and empty cells follow DECISIONS 2026-10-19 (TimelineSkeleton is three rows; Timeline renders the tray and labels.state.empty). The strip wraps 5+1 (empty on its own row), which job 140's gap-x-0 fix covers. Crops are in r11-review/job-143-data-skeptic/timeline-*.png.

1. **[medium] Every state, done / current / todo / error cells**
   - Frame: a 14 px dot, then 8 px, then the word in 9 px Roboto Mono muted
   - Build: a 12 px dot, then 12 px, then the word in 14 px Inter Medium #fafafa (20 px line)
   - Cause: packages/topclassui/src/components/timeline/dummy/states.tsx:10-13 pass the word as the item title (Timeline title 'min-h-5 text-sm font-medium text-body')
   - Fix: states.tsx:10-13 title: <span className="font-mono text-xs font-normal text-muted">done</span> (and the same for current, todo, error). The 12 px dot is the component's recorded marker.
2. **[medium] The code, note**
   - Frame: a plain 10.5 px muted sentence
   - Build: the run `<Svg icon={check} size="xs" />` is a 252x18 box in 14 px Geist Mono #fafafa inside the 12 px muted note
   - Cause: apps/docs/components/previewer/previewer.tsx:72 InlineText; inline-text.tsx:6 INLINE_CODE (apps/docs/components/classes.ts:81 'font-mono text-sm text-body')
   - Fix: As under Tree view: InlineText takes a codeClassName, and the note passes 'font-mono text-[length:inherit] text-muted'
3. **[low] The code, sample overflow (added by verifier)**
   - Frame: every code line fits inside the code part (longest about 615 px)
   - Build: the first two EVENTS lines are 914.5 and 900 px wide in an 894 px block: line 1's '},' and line 2's ',' are cut at the card edge, and the block scrolls sideways
   - Cause: packages/topclassui/src/components/timeline/dummy/basic.tsx:4-5 put a <time dateTime> element inline in each object
   - Fix: basic.tsx:4-5 break each event object over two lines (time: on its own line), or shorten the dateTime strings so each line stays under about 880 px at 12 px mono
4. **[low] stage, events**
   - Frame: 3 events: Project created (success dot), Invited three teammates (primary dot), First deploy 'pending' (hollow); list 188x156
   - Build: 4 events: Project created and First deploy (both success), In review (primary), Launch (hollow); list 126x192
   - Cause: packages/topclassui/src/components/timeline/dummy/basic.tsx:3-8 EVENTS
   - Fix: Use the drawn three (done, current, todo), the last with time 'pending'
5. **[low] stage row height**
   - Frame: row 311 tall (stage 694x311 beside Try it)
   - Build: stage 930x288
   - Cause: apps/docs/content/components/timeline.ts:10 stageHeight: 18
   - Fix: stageHeight: 19.4375
6. **[low] head**
   - Frame: 96 tall: 2-line description on 17 px lines, title 19/23
   - Build: 108 tall: 2 lines on 20 px lines, title 18/28
   - Cause: apps/docs/components/classes.ts:158 CARD_TITLE, :163 SMALL; previewer.tsx:84 gap-1
   - Fix: Tight lines, as listed under Table
7. **[low] shared card chrome**
   - Frame: mode switch 217x31; Install 79x29 at 12 px; Copy 73x29 on surface with a #262626 border; radius 16; captions 9 px
   - Build: 230x32; 87.6x32 at 14 px; 83.2x32 transparent with a #a1a1a1 border; radius 12; captions 12 px
   - Cause: card-mode-switch.tsx:41, previewer.tsx:95, copy-button.tsx:49-53, classes.ts:127-129 and :210
   - Fix: As listed under Table

## /en/docs/components/code-block: differs (6)

Note: Frame 137:1552 (944x897) vs card 932x947. In dark mode, both draw the stage block on neutral/solid (#f5f5f5, dark text), which matches. The count of 3 vs 5 states, the missing copy hover and copied cells, and the 32 px block header are recorded (DECISIONS 2026-10-19 Actions). Crops are in r11-review/job-143-data-skeptic/code-block-*.png.

1. **[medium] stage, sample code**
   - Frame: a 420x95 block: header 32, then 3 short lines (<Button variant="solid" size="md"> / Download / </Button>) that all fit
   - Build: a 420x116 block with 4 lines; line 2 is about 712 px long and is cut at "'overdue'," at the block edge (the block scrolls sideways)
   - Cause: packages/topclassui/src/components/code-block/dummy/playground.tsx:10, a deliberately long getInvoices line so that wrap shows
   - Fix: Shorten the stage sample so every line fits 396 px (for example the drawn 3-line Button sample), and leave the long line to the long-line and wrap demos
2. **[medium] stage row height**
   - Frame: 311 (the block centred, 108 px above it)
   - Build: 160 (stage 10rem; Try it holds only two checkboxes), with the block 22 px from the top
   - Cause: apps/docs/content/components/code-block.ts:10 stageHeight: 10
   - Fix: stageHeight: 19.4375
3. **[medium] Every state, block headers**
   - Frame: header 24 tall, px 8: 'code' in 9 px mono at 60% and a 12 px copy icon; no terminal icon
   - Build: header 32 tall: a 14 px terminal icon, the title truncated to 'state…' and 'wrapp…' in a 50 px slot, then a 24 px copy button
   - Cause: code-block/dummy/states.tsx:11 and :14 title="states.tsx" / "wrapped" in w-32 (128 px) blocks
   - Fix: Use title="code" in both cells so nothing truncates. The 32 px header is the component's recorded size.
4. **[low] Try it, control order**
   - Frame: wrap, then showCopy (after the unbuilt lineNumbers)
   - Build: showCopy, then wrap
   - Cause: apps/docs/content/components/code-block.ts has no controlOrder, so the schema order applies
   - Fix: controlOrder: ['wrap', 'showCopy'] in content/components/code-block.ts
5. **[low] head**
   - Frame: 'CodeBlock'; 79 tall, the 79-character description on one line
   - Build: 'Code block'; 108 tall, the 125-character description wraps to 2 lines in 556 px on 20 px lines
   - Cause: content/components/code-block.ts:6 description.en (longer); the 556 px column (wider mode switch and Install); classes.ts:158, :163
   - Fix: Shorten the description to about 80 characters, and apply the head tight-line fix listed under Table
6. **[low] shared card chrome**
   - Frame: mode switch 217x31; Install 79x29 at 12 px; Copy 73x29 on surface with a #262626 border; checkboxes 16 px; radius 16; captions 9 px
   - Build: 230x32; 87.6x32 at 14 px; 83.2x32 transparent with a #a1a1a1 border; checkboxes 20 px; radius 12; captions 12 px
   - Cause: card-mode-switch.tsx:41, previewer.tsx:95, copy-button.tsx:49-53, try-it-control.tsx:35, classes.ts:127-129 and :210
   - Fix: As listed under Table

## /en/docs/components/progress: differs (4)

Note: Frame 137:2113 (944x913) vs card 932x1033. The on-soft fills and the outlined track are recorded ('Kept against the frame, by rule', R-5.6-4). The strip wraps 5+1 (indeterminate on its own row), which job 140's gap-x-0 fix covers. Crops are in r11-review/job-143-data-skeptic/progress-*.png.

1. **[medium] Try it, value control**
   - Frame: order tone, size, value (a select showing '60'), then the indeterminate checkbox
   - Build: order tone, size, indeterminate, then value as a slider at 0, while the stage's middle bar (the one the controls drive) shows 60
   - Cause: apps/docs/content/components/progress.ts:15 controlOrder ['tone','size','indeterminate'] leaves value last, and there is no starts entry, so the slider shows its minimum. progress/dummy/playground.tsx:10 draws value={60}.
   - Fix: progress.ts:15 controlOrder: ['tone', 'size', 'value', 'indeterminate'] and add starts: { value: 60 } (the starts field Toast already uses)
2. **[low] stage row height**
   - Frame: 286
   - Build: 274 (set by the Try it column; stageHeight is 3rem)
   - Cause: apps/docs/content/components/progress.ts:14 stageHeight: 3
   - Fix: stageHeight: 17.875
3. **[low] head**
   - Frame: 79 tall, the 75-character description on one line
   - Build: 108 tall, the 125-character description wraps to 2 lines in 556 px on 20 px lines
   - Cause: content/components/progress.ts:6 description (longer); the 556 px column; classes.ts:158, :163
   - Fix: Shorten the description to about 80 characters, and apply the head tight-line fix listed under Table
4. **[low] shared card chrome**
   - Frame: mode switch 217x31; Install 79x29 at 12 px; Copy 73x29 on surface with a #262626 border; selects 29 tall at 11 px; checkbox 16 px; radius 16; captions 9 px
   - Build: 230x32; 87.6x32 at 14 px; 83.2x32 transparent with a #a1a1a1 border; selects 32 tall at 14 px; checkbox 20 px; radius 12; captions 12 px
   - Cause: card-mode-switch.tsx:41, previewer.tsx:95, copy-button.tsx:49-53, try-it-control.tsx:35 and :64, classes.ts:127-129 and :210
   - Fix: As listed under Table

## /en/docs/components/spinner: differs (4)

Note: Frame 137:2234 (944x877) vs card 932x890. r11/card-spinner.png is black below y≈848: that is a capture artefact, and the reviewer's live 2x shot (job-143-data/spinner-bottom-live.png) renders the install row correctly. The 5 strip cells sit off the drawn 181 px columns because of gap-x-6, which job 140's gap-x-0 fix covers.

1. **[medium] stage, spinners**
   - Frame: 4 spinners, 20 / 24 / 32 / 40 px, 22 px apart (row 182x40)
   - Build: 5 spinners, 16 / 20 / 24 / 32 / 40 px, 12 px apart (row 180 wide)
   - Cause: apps/docs/content/components/spinner.ts:15 stageDemo 'sizes'; packages/topclassui/src/components/spinner/dummy/sizes.tsx:6-11 (gap-3, xs included)
   - Fix: Give the stage its own demo with sm, md, lg and xl at gap-5.5 (22 px), and keep sizes.tsx as the five-step demo
2. **[low] stage row height**
   - Frame: 250
   - Build: 188 (set by the Try it column; stageHeight is 4rem)
   - Cause: apps/docs/content/components/spinner.ts:14 stageHeight: 4
   - Fix: stageHeight: 15.625
3. **[low] head**
   - Frame: 79 tall, the 79-character description on one line
   - Build: 108 tall, the 127-character description wraps to 2 lines in 556 px on 20 px lines
   - Cause: content/components/spinner.ts:6 description (longer); the 556 px column; classes.ts:158, :163
   - Fix: Shorten the description to about 80 characters, and apply the head tight-line fix listed under Table
4. **[low] shared card chrome**
   - Frame: mode switch 217x31; Install 79x29 at 12 px; Copy 73x29 on surface with a #262626 border; selects 29 tall at 11 px; radius 16; captions 9 px
   - Build: 230x32; 87.6x32 at 14 px; 83.2x32 transparent with a #a1a1a1 border; selects 32 tall at 14 px; radius 12; captions 12 px
   - Cause: card-mode-switch.tsx:41, previewer.tsx:95, copy-button.tsx:49-53, try-it-control.tsx:64, classes.ts:127-129 and :210
   - Fix: As listed under Table

## /en/docs/components/empty-state: differs (5)

Note: Frame 137:2349 (944x1117) vs card 932x1173. Having no Try it is recorded (S8). Figma's strip cells are 227 px, so its own row wraps 3+1 (908 > 906 px), which looks like a 2 px drawing slip; the build's four-in-a-row is not reported. Crops are in r11-review/job-143-data-skeptic/empty-state-*.png.

1. **[medium] Every state, all four cells**
   - Frame: a bare icon (24 px tray / magnifying glass / red warning circle; an 18 px tray for compact), 5 px over the word in 9 px Roboto Mono muted; no box
   - Build: each state is a full dashed EmptyState (line-strong dashes, p 28, radius 12): 107x128 / 148x128 / 101x128 with 40 px icons and the word in 16 px semibold #fafafa; compact is 77x81 with a 24 px icon and a 14 px semibold word
   - Cause: packages/topclassui/src/components/empty-state/dummy/states.tsx:11-14 render real EmptyStates (dashed BORDER_STRONG, p-7)
   - Fix: Give EmptyState a borderless, unpadded option (the frame's Try it 'bordered') and render the strip with it, the word muted mono, or record the boxed strip in DECISIONS.md
2. **[low] stage, empty state box**
   - Frame: 340x206: p 28, tray 36 px, title 16 semibold, description 14 px on 17 px lines, then 'New project' 114x29 (px 12, py 7, gap 6, 12 px Medium, 14 px plus icon)
   - Build: 340x215: tray 40 px, then 'New project' 128.8x32 (gap 8, 14 px Medium)
   - Cause: empty-state/dummy/with-action.tsx:14 Button size="sm"; the default tray is the xl icon (40 px)
   - Fix: with-action.tsx:14 size="xs" with className="gap-1.5". 36 px is not an icon step, so keep 40 or use lg (32).
3. **[low] stage row height**
   - Frame: row 311 tall (stage 694x311 beside Try it)
   - Build: stage 930x256
   - Cause: apps/docs/content/components/empty-state.ts:15 stageHeight: 16
   - Fix: stageHeight: 19.4375
4. **[low] head**
   - Frame: 'EmptyState'; 79 tall, the 61-character description on one line
   - Build: 'Empty state'; 108 tall, the 118-character description wraps to 2 lines in 556 px on 20 px lines
   - Cause: content/components/empty-state.ts:6 description.en; classes.ts:158, :163
   - Fix: Shorten the description to about 80 characters, and apply the head tight-line fix listed under Table
5. **[low] shared card chrome**
   - Frame: mode switch 217x31; Install 79x29 at 12 px; Copy 73x29 on surface with a #262626 border; radius 16; captions 9 px
   - Build: 230x32; 87.6x32 at 14 px; 83.2x32 transparent with a #a1a1a1 border; radius 12; captions 12 px
   - Cause: card-mode-switch.tsx:41, previewer.tsx:95, copy-button.tsx:49-53, classes.ts:127-129 and :210
   - Fix: As listed under Table

## Refuted by the second reviewer (do not act)

- /en/docs/components/table, Every state, 'empty' cell: Recorded in DECISIONS.md 2026-10-19 'Toast and Table': the empty table keeps its header row, and the tray sits over its words in the small step.
- /en/docs/components/table, Every state, 'loading' cell: Recorded in DECISIONS.md 2026-10-19: the skeleton keeps the table's shape on the page's surface.
- /en/docs/components/table, Try it, control list: Recorded in docs-site.md (the Try it lists are not built as drawn; controls come from the schema) and in DECISIONS.md 2026-10-19 (pageSize not built). captionVisible is a schema prop.
- /en/docs/components/table, stage, avatar size and row heights: Within 1-2 px: avatar 28 vs 26 (the xs avatar step), body row 47 vs 46, header 32 vs 33. Only the 3 px badge height survives.
- /en/docs/components/table, Try it, select border colour: Recorded in DECISIONS.md 2026-10-19 (form fields): a field's resting line is line-strong for WCAG 1.4.11.
- /en/docs/components/table, head, mode switch label weight and selected shadow: The weight (regular, the chosen one medium) is SegmentedControl's recorded look (DECISIONS.md 2026-10-19 Actions), and the card uses the library control (S8). The shadow-sm at 10% black on #262626 over #171717 is not visible.
- /en/docs/components/tree-view, Try it: Recorded in docs-site.md: drawn controls with no prop behind them are not built; the controls come from the schema.
- /en/docs/components/tree-view, Every state, empty cell: Recorded in DECISIONS.md 2026-10-19: empty draws the tray over labels.state.empty in a raised box.
- /en/docs/components/tree-view, stage, 32 px rows and the 18 px indent: The 32 px row is the recorded shared --tc-row-height (DECISIONS.md 2026-10-19). The indent is 18 vs 16 px per level, within 2 px a level.
- /en/docs/components/timeline, Try it column missing: Recorded in docs-site.md S8: a component with no schema (Timeline) has no Try it, and its stage takes the full row. Only the stage height is kept.
- /en/docs/components/timeline, Every state, loading cell: Recorded in DECISIONS.md 2026-10-19: TimelineSkeleton is three rows of a dot and a bar.
- /en/docs/components/timeline, Every state, empty cell: Recorded in DECISIONS.md 2026-10-19: Timeline renders the tray icon and labels.state.empty, muted.
- /en/docs/components/code-block, Every state, count and cells (copy hover, copied): Recorded in DECISIONS.md 2026-10-19 Actions: CodeBlock's copy hover and copied states are live only. The wider 282 px cells follow from three cells.
- /en/docs/components/code-block, Every state, block size: The 32 px header, 12 px body padding, text-xs on an 18 px line and rounded-box are CodeBlock's recorded sizes (DECISIONS.md 2026-10-19 Actions); the reviewer's own fix was 'Accept'.
- /en/docs/components/code-block, Try it, missing selects (language, theme, maxLines) and lineNumbers: Recorded in DECISIONS.md 2026-10-19 Actions (theme, maxLines and lineNumbers not built) and in docs-site.md's rule on unbuilt Try it controls. Only the wrap/showCopy order is kept.
- /en/docs/components/progress, stage and strip bar colours and track outline: Recorded in DECISIONS.md 2026-10-19: 'Kept against the frame, by rule' (on-soft fills and outlined track for R-5.6-4).
- /en/docs/components/progress, stage, bar spacing: Within 2 px: 12 vs 14 px between the bars.
- /en/docs/components/progress, Every state, empty cell stub: The frame's 2 px primary stub on a 0 value is within 2 px, and the track widths (110 vs 112) also differ by 2 px.
- /en/docs/components/progress, Try it, showLabel: No prop behind it; recorded in docs-site.md (drawn controls with no prop are not built).
- /en/docs/components/spinner, Try it (label, centered, overlay): No props behind them; recorded in docs-site.md (drawn controls with no prop are not built).
- /en/docs/components/empty-state, stage and Try it row, Try it missing: Recorded in docs-site.md S8: EmptyState has no schema, so no Try it, and its stage takes the full row. Only the stage height is kept.
