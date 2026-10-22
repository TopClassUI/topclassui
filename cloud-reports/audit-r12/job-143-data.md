# Figma audit 2, job 143 data

Second audit on preview/r8-all 694273fe at 1440 dark: every first-audit row re-checked (still open) plus a fresh pass (new), each re-checked by a second reviewer. Close every row or record why it stays.

## /en/docs/components/table: differs (5)

Note: Checked against Figma 137:1022 (design context for states 137:1139 and playground 137:1102) and fresh 2x Playwright measurements from localhost:4620 (r12-review/job-143-data-skeptic/measure.json, measure2.json; crops table-states.png, table-tryit.png, table-headR.png, table-stage.png, table-code.png). All 5 rows hold. The stage, badges, avatars, code colours and install row match or are recorded. Recorded and not reported: the Try it control list comes from the schema (S7), with pageSize unbuilt (DECISIONS 2026-10-19 Toast and Table); the select's #a1a1a1 line-strong border (DECISIONS 2026-10-19 form fields: 'A field's line at rest is line-strong'); the empty cell's header row and the boxed table-shaped skeleton (DECISIONS 2026-10-19 Toast and Table). Two cause line numbers are corrected (playground-island.tsx is 110 lines long).

1. **[medium] (still open) Every state, idle / hover row / sorted / selected cells**
   - Frame: Panel 126x91 (surface-raised, 1 px line, radius 12), with no header row: three 29 px rows (py 7, px 8) split by 1 px hairlines, in 12 px regular muted text
   - Build: Table 128x129. It opens with a 28 px header row ('Name' at 12 px medium, plus the up-down or sort icon), then three 33 px rows (py 6, px 14, a 1 px top line each) in 14 px muted text. The text starts 14 px in, against the drawn 8
   - Cause: packages/topclassui/src/components/table/dummy/states.tsx:13-15 and :20-27 give every column the header 'Name' and a sortHref, and the tables at :35-52 use density="compact". table/classes.ts:91 HEADER_CELL, :95 BODY_CELL 'px-3.5 text-sm' and :100 CELL_DENSITY.compact 'py-1.5'
   - Fix: In states.tsx, give the strip columns className 'px-2 py-1.75 text-xs'. Table merges TableColumn.className last, on the header cell and every body cell. Change the hovered span at :25 to '-mx-2 -my-1.75 px-2 py-1.75' to match. Then either add a visually hidden header option to Table for these four cells, or record in DECISIONS.md that the strip keeps its header row, as the empty cell already does
2. **[low] (still open) Every state, 'sorted' cell**
   - Frame: No header. The first row reads 'A - Z'
   - Build: The sort shows only through the sort-ascending icon in the 'Name' header. The rows read Row 1 / Row 2 / Row 3, and the DOM text of the header row is 'Sort by Name'
   - Cause: packages/topclassui/src/components/table/dummy/states.tsx:40-50 shows the sort through the sort prop and the sortHref in the header
   - Fix: Name the first row 'A - Z' in the sorted cell's items, as drawn. If the header row is kept, record in DECISIONS.md that the sort shows in the header
3. **[low] (still open) head, card mode switch width**
   - Frame: Track 217x31 (padding 4, 2 px between segments). Segments are 66 / 64 / 75 x 23, each with px 9 and a 5 px icon-to-label gap, a 14 px icon and a 12 px label
   - Build: Track 224.1x32 (padding 3 plus a 1 px border, gap 2). Segments are 68.1 / 67 / 77 x 24, each with px 10 and a 6 px gap. The 14 px icons and 12 px labels match. The track is 7 px wider, so its left edge sits 7 px further from the card's right edge
   - Cause: packages/topclassui/src/components/segmented-control/classes.ts:39 SEGMENTED_ITEM_SIZE.sm 'px-2.5' and :28 SEGMENTED_ITEM 'gap-1.5', used by apps/docs/components/previewer/card-mode-switch.tsx:41
   - Fix: In card-mode-switch.tsx:41, pass className="gap-1.25 px-2.25" to each SegmentedControlItem. The caller's class merges last, which gives the drawn 9 px padding, the 5 px gap, 66/64/75 segments and a 217 px track
4. **[low] (new) Every state, caption line**
   - Frame: Every box is 56 px tall, and all six captions sit 9 px under their box (cell y 65)
   - Build: The empty table box is 122 tall and the others are 129, and each caption follows its own box. The 'empty' caption is at card y 1433.2 and the other five are at 1440.2
   - Cause: apps/docs/components/classes.ts:221 STATE_GRID 'items-start' and :222 STATE_CELL 'content-start': each cell is as tall as its own box
   - Fix: In classes.ts, make STATE_GRID 'flex min-w-0 flex-wrap items-stretch gap-x-0 gap-y-4' and replace 'content-start' with 'grid-rows-[1fr_auto]' in STATE_CELL. Each box then fills the row's height, STATE_BOX keeps its content centred, and every caption sits on the row's last line
5. **[low] (new) Try it, vertical rhythm**
   - Frame: The first select's top is 62 px below the row top, and the controls repeat every 61 px: a 12 px label line, 6 gap, 29 select, 14 gap. 'TRY IT' sits on a 12 px line
   - Build: The first select's top is 70 px below the row top, and the controls repeat every 64 px: a 16 px label line, 6 gap, 28 select, 14 gap. 'TRY IT' sits on a 16 px line. Measured: h3 at 18 and the density control at 48, with its select at 70
   - Cause: apps/docs/components/classes.ts:170 H3 'text-xs ...', used for the Try it heading at apps/docs/components/previewer/playground-island.tsx:73, and :190 CONTROL_LABEL 'text-xs', used at try-it-control.tsx:43. Both take text-xs's 16 px line
   - Fix: In classes.ts:190, set CONTROL_LABEL to 'justify-self-start text-xs/3 font-medium text-muted', and at playground-island.tsx:73 use className={`${H3} leading-3`}. The first select then sits at 62, with a 60 px pitch

## /en/docs/components/tree-view: differs (8)

Note: Checked against Figma 137:1223 (design context for states 137:1319) and fresh 2x measurements (measure2.json tree: the expanded cell's rows are 32 px at 14 px, the caret is at x 200.2 and the leaf icon at 236.2, the loading bars are 12 px apart in a 134x62 box, the empty text box is 99x40 on two lines, and no outline shows anywhere in the focus-visible cell). The stage at rest matches; see tree-view-stage.png. 8 of the 9 rows hold, 1 is refuted (the title), and 1 is added (the Try it rhythm). The after-change cause lines are corrected. Recorded and not reported: the 32 px rows, the 12 px caret, the body-coloured icons, the empty cell's raised box (DECISIONS 2026-10-19), the Try it list from the schema and visibleRows 7.

1. **[high] (still open) Every state, 'focus-visible' cell**
   - Frame: A 2 px ring rectangle (base/ring), radius 12, 54x31, drawn at rest 4 px outside the 'src' row
   - Build: No ring at rest. No element in the cell has an outline, so the 118.7x114 cell looks the same as 'expanded'
   - Cause: packages/topclassui/src/components/tree-view/dummy/states.tsx:30-32 renders a plain TreeView, and its comment at :16-17 says the ring shows once Tab reaches the tree. tree-view/classes.ts:35 TREE_VIEW_ROW_ACTIVE needs group-focus-visible/tree:data-highlighted and has no forced hook, although docs-site.md S8 renders the strip with the forced data-focus-visible
   - Fix: Give TreeView a forced focus hook, for example a row id that receives data-focus-visible, and map data-focus-visible on a row to the same outline classes as TREE_VIEW_ROW_ACTIVE. Set it on the 'src' row in states.tsx:31
2. **[medium] (still open) Every state, collapsed / expanded / selected / focus-visible cells**
   - Frame: Rows sit bare on the card surface: px 6, py 4, 23 px tall, 12 px text, 11 px caret and file icons, 3 px between rows. A leaf's icon sits 12 px right of its parent's caret (pl 18). The selected tint is only as wide as the row's content
   - Build: Each state sits in a raised #262626 box with a 1 px border, p 8 and radius 12. The collapsed box is 72.4x56 and the others are 118.7x114. Rows are 32 px with 14 px text and 14 px file icons. A leaf's icon sits 36 px right of the caret (x 200.2 to 236.2)
   - Cause: tree-view/dummy/states.tsx:21-32 renders whole TreeViews. tree-view/classes.ts:10 TREE_VIEW_TREE 'rounded-box bg-surface-raised p-2' plus BORDER (:16), and :23 sets the per-level start padding
   - Fix: Pass className="bg-transparent p-0 border-0" to the four TreeViews in states.tsx (cn lets the caller's classes win), or record the boxed strip in DECISIONS.md. The 32 px rows stay, since they are recorded
3. **[medium] (new) stage, after the first Try it change**
   - Frame: The stage is the drawn 300 px tree: components and button open with folder-open icons, index.tsx selected, input closed
   - Build: At rest the stage matches. After any Try it change (for example visibleRows 12) it swaps to a different tree, 172 px wide: src > app > layout.tsx, page.tsx (selected), then components, lib, package.json and README.md, with closed-folder icons on the open src and app. THE CODE at rest already prints that other tree's usage (defaultExpanded={['src', 'app']} defaultValue="page")
   - Cause: apps/docs/content/components/tree-view.ts:11 stageDemo 'stage' draws dummy/stage.tsx at rest. On the first change, apps/docs/components/previewer/playground-island.tsx:62 (live once changed.length > 0) and :70 swap in tree-view/dummy/playground.tsx:9-28, which still holds the old 8-node ITEMS, FOLDER on every branch and no width
   - Fix: Rewrite playground.tsx with stage.tsx's ITEMS (OPEN, CLOSED and FILE icons), className="w-75", defaultExpanded={['components','button']} and defaultValue="index", spreading {...props}. Keep stageDemo: TreeView is a client component, so previewer.tsx:113 would pass no server stage without it, and the rest view would be a skeleton until the island mounts. The stage, THE CODE and Try it then show one tree
4. **[medium] (new) Every state, caption line**
   - Frame: All six captions on one line (cell y 65)
   - Build: The captions sit on four lines, 66 px apart at the extremes: card y 673.3 (collapsed), 731.3 (expanded, selected, focus-visible), 679.3 (loading) and 739.3 (empty)
   - Cause: apps/docs/components/classes.ts:221 STATE_GRID 'items-start' and :222 STATE_CELL 'content-start'
   - Fix: Same fix as under Table: STATE_GRID items-stretch and STATE_CELL grid-rows-[1fr_auto], so the captions share the row's last line
5. **[low] (still open) Every state, 'loading' cell**
   - Frame: Two bare bars, 100x8 and 80x8, 5 px apart
   - Build: A raised, bordered 134x62 box (p 16) holding the 100x8 and 80x8 bars 12 px apart
   - Cause: tree-view/classes.ts:55 TREE_VIEW_NOTE_KIND.loading 'flex flex-col gap-3 rounded-box bg-surface-raised p-4 BORDER'. DECISIONS 2026-10-19 records the bars, not the box
   - Fix: Set classes.ts:55 to 'flex flex-col gap-1.25', so the bars sit bare and 5 px apart, as drawn
6. **[low] (still open) head, card mode switch width**
   - Frame: 217x31, segments 66/64/75 x 23 (px 9, gap 5)
   - Build: 224.1x32, segments 68.1/67/77 x 24 (px 10, gap 6)
   - Cause: segmented-control/classes.ts:39 'px-2.5' and :28 'gap-1.5', via apps/docs/components/previewer/card-mode-switch.tsx:41
   - Fix: Same fix as under Table: className="gap-1.25 px-2.25" on each SegmentedControlItem
7. **[low] (new) Every state, 'empty' cell**
   - Frame: A 22 px tray icon only
   - Build: The recorded raised 149x122 box holding the tray over 'Nothing here yet', which wraps onto two lines ('Nothing here' / 'yet'). The text box is 99x40
   - Cause: tree-view/classes.ts:57 TREE_VIEW_NOTE_KIND.empty 'p-6' (24 px a side, overriding :49 TREE_VIEW_NOTE's px-3 py-2) leaves 99 px for the 108 px phrase at 14 px in the 149 px STATE_CELL
   - Fix: In classes.ts:57, replace 'p-6' with 'px-4 py-6', which leaves 115 px for the text. Or add 'whitespace-nowrap' to the empty note, so the phrase stays on one line
8. **[low] (added by verifier) Try it, vertical rhythm**
   - Frame: 'TRY IT' sits on a 12 px line. The first select (selectionMode) is 62 px below the row top, and the next is at 123 (61 px pitch)
   - Build: 'TRY IT' sits on a 16 px line. The first select (visibleRows) is at 70, and status is at 134 (64 px pitch)
   - Cause: apps/docs/components/classes.ts:170 H3 (the Try it heading at previewer/playground-island.tsx:73) and :190 CONTROL_LABEL, both text-xs on its 16 px line
   - Fix: Same fix as under Table: CONTROL_LABEL 'text-xs/3' and the Try it heading `${H3} leading-3`

## /en/docs/components/timeline: differs (4)

Note: Checked against Figma 137:1409 (design context for stage 137:1441 and state cell 137:1503) and fresh 2x measurements (measure2.json timeline). Crops: timeline-states.png and timeline-stageV.png, the stage side by side with guide lines at y 77 and 89. All 4 rows hold. The stage cause line is corrected: stage.tsx is 11 lines long. Recorded: the 12 px marker, no Try it, the three-row TimelineSkeleton and the inline empty line. The titles' heavier look is rendering only, since both sides are Inter medium at 14 px.

1. **[low] (still open) Every state, done / current / todo / error cells**
   - Frame: A 14 px dot, then 8 px, then the 9 px mono muted word
   - Build: A 12 px dot (the recorded marker), then 12 px, then the 12 px mono muted word. For example, the dot is at x 67.1-79.1 and the word starts at 91.1
   - Cause: packages/topclassui/src/components/timeline/index.tsx:63 'flex gap-3' between the marker column and the text column. timeline/dummy/states.tsx:6 WORD has no offset
   - Fix: Add '-ms-1' to the strip's WORD in states.tsx:6, which gives the drawn 8 px. The component's 12 px gap stays for the stage, where the frame also draws 12
2. **[low] (still open) head, card mode switch width**
   - Frame: 217x31, segments 66/64/75 x 23 (px 9, gap 5)
   - Build: 224.1x32, segments 68.1/67/77 x 24 (px 10, gap 6)
   - Cause: segmented-control/classes.ts:39 'px-2.5' and :28 'gap-1.5', via apps/docs/components/previewer/card-mode-switch.tsx:41
   - Fix: Same fix as under Table: className="gap-1.25 px-2.25" on each SegmentedControlItem
3. **[low] (new) stage, vertical position of the events**
   - Frame: The 188x156 group is centred in the 311 px stage. Every event, the last included, keeps an 18 px bottom padding (3 x 52), so the first dot's top is 77.5 px below the stage top
   - Build: The list is 140 tall (52 + 52 + 36, with no padding after the last event), centred at 85.5. The first dot sits 4 px into its 20 px marker box, so its top is 89.5 px below the stage top: 12 px lower than drawn
   - Cause: timeline/index.tsx:73 gives 'pb-4' to every item but the last, and timeline/dummy/stage.tsx:11 renders the Timeline bare, centred by STAGE's place-items-center (apps/docs/components/classes.ts STAGE)
   - Fix: In stage.tsx:11, pass className="pb-4" to the Timeline. The ol is then 156 tall, as drawn, and its first dot lands about 81.5 px below the stage top
4. **[low] (new) Every state, caption line**
   - Frame: All six captions on one line (cell y 65)
   - Build: The three-row skeleton box is 68 tall against 56, so the 'loading' caption is at card y 825.2 and the other five are at 813.2
   - Cause: apps/docs/components/classes.ts:221 STATE_GRID 'items-start' and :222 STATE_CELL 'content-start'
   - Fix: Same fix as under Table: STATE_GRID items-stretch and STATE_CELL grid-rows-[1fr_auto]

## /en/docs/components/code-block: differs (3)

Note: Checked against Figma 137:1552 (design context for state cell 137:1637 and stage block 137:1585) and fresh 2x measurements (measure2.json code: both headers are 32 tall, with svgs at x+12 and at the end, 14 px each, and radius 12). The stage block matches; see code-block-stage.png. 3 of the 4 rows hold and the title is refuted. Recorded and not reported: 3 states instead of 5, the 32 px header with a 12 px inset, the 12 px code on 18 px lines, and the unbuilt language, theme, maxLines and lineNumbers. The strip's smaller 8 px radius is the frame's miniature: the stage frame draws this component with radius/box 12, as the build does.

1. **[low] (still open) Every state, block headers**
   - Frame: Header 24 px, px 8: the word 'code' in 9 px mono at 60%, a spacer, then a 12 px copy icon. There is no terminal icon
   - Build: Header 32 px (recorded): a 14 px terminal-window icon at x+12, then the title ('idle' or 'wrap'), then the 14 px copy button
   - Cause: packages/topclassui/src/components/code-block/index.tsx:40 always draws the terminal-window icon in front of a title. code-block/dummy/states.tsx:11 and :14 pass titles
   - Fix: Since the stage frame (137:1585) draws the same header with the icon, the cheaper fix is a DECISIONS.md line saying the strip keeps the component's header icon. Otherwise, let CodeBlock take an icon prop (the terminal by default, null to hide it) and pass icon={null} in states.tsx:11 and :14
2. **[low] (still open) head, card mode switch width**
   - Frame: 217x31, segments 66/64/75 x 23 (px 9, gap 5)
   - Build: 224.1x32, segments 68.1/67/77 x 24 (px 10, gap 6)
   - Cause: segmented-control/classes.ts:39 'px-2.5' and :28 'gap-1.5', via apps/docs/components/previewer/card-mode-switch.tsx:41
   - Fix: Same fix as under Table: className="gap-1.25 px-2.25" on each SegmentedControlItem
3. **[low] (new) Every state, caption line**
   - Frame: Every block is the same 126x44, and all captions sit 9 px under them on one line (cell y 65)
   - Build: The captions sit on three lines up to 24 px apart: card y 759.7 (idle, block 62 tall), 777.7 (wrapped, block 80 tall, two lines) and 753.7 (no header, block 42 in a 56 box)
   - Cause: apps/docs/components/classes.ts:221 STATE_GRID 'items-start' and :222 STATE_CELL 'content-start'
   - Fix: Same fix as under Table: STATE_GRID items-stretch and STATE_CELL grid-rows-[1fr_auto]

## /en/docs/components/progress: differs (2)

Note: Checked against Figma 137:2113 and fresh 2x measurements (measure.json progress); crop progress-states.png. Both rows hold. The strip matches: six 112 px bars on one row with aligned captions. The frame's 'empty' bar carries a 2 px fill sliver, which is not reported (2 px). Recorded: the on-soft fills, the outlined track, the value slider (S7 schema kinds), showLabel unbuilt, and the 12 vs 14 px bar gap (2 px).

1. **[low] (still open) head, card mode switch width**
   - Frame: 217x31, segments 66/64/75 x 23 (px 9, gap 5)
   - Build: 224.1x32, segments 68.1/67/77 x 24 (px 10, gap 6)
   - Cause: segmented-control/classes.ts:39 'px-2.5' and :28 'gap-1.5', via apps/docs/components/previewer/card-mode-switch.tsx:41
   - Fix: Same fix as under Table: className="gap-1.25 px-2.25" on each SegmentedControlItem
2. **[low] (new) Try it, vertical rhythm**
   - Frame: The tone select's top is 62 px below the row top, the size select's 123 (61 px pitch), and the indeterminate box's 227
   - Build: The tone select is at 70, the size select at 134 (64 px pitch), and the 16 px indeterminate box at 233.5
   - Cause: apps/docs/components/classes.ts:170 H3 (the Try it heading at previewer/playground-island.tsx:73) and :190 CONTROL_LABEL take text-xs's 16 px line against the drawn 12
   - Fix: Same fix as under Table: CONTROL_LABEL 'text-xs/3' and the Try it heading `${H3} leading-3`

## /en/docs/components/spinner: differs (3)

Note: Checked against Figma 137:2234 and fresh 2x shots. shots/spinner-rest.png shows the drawn sm-xl row at rest. shots/spinner-after.png, taken after choosing tone 'success', shows one md spinner alone in the stage. All 3 rows hold, and the after-change cause lines are corrected. The strip matches. Recorded: the unbuilt label, centered and overlay controls, and THE CODE showing the playground usage.

1. **[medium] (new) stage, after the first Try it change**
   - Frame: The stage is the drawn row of four spinners (sm, md, lg, xl, 22 px apart) beside Try it's size and tone
   - Build: At rest the stage draws the four. Changing tone (here to success) or size swaps in a single md spinner, centred in the otherwise empty 682x250 stage, so the drawn row disappears
   - Cause: apps/docs/content/components/spinner.ts:15 stageDemo 'stage' (spinner/dummy/stage.tsx) is shown only at rest. On the first change, apps/docs/components/previewer/playground-island.tsx:62 and :70 swap in spinner/dummy/playground.tsx:5-7, which renders one <Spinner {...props} />
   - Fix: Make playground.tsx draw the stage's row with the props applied, for example: <div className="flex items-center gap-5.5"><Spinner size="sm" tone={props.tone} /><Spinner {...props} /><Spinner size="lg" tone={props.tone} /><Spinner size="xl" tone={props.tone} /></div>. stageDemo can stay, since the rest view is unchanged
2. **[low] (still open) head, card mode switch width**
   - Frame: 217x31, segments 66/64/75 x 23 (px 9, gap 5)
   - Build: 224.1x32, segments 68.1/67/77 x 24 (px 10, gap 6)
   - Cause: segmented-control/classes.ts:39 'px-2.5' and :28 'gap-1.5', via apps/docs/components/previewer/card-mode-switch.tsx:41
   - Fix: Same fix as under Table: className="gap-1.25 px-2.25" on each SegmentedControlItem
3. **[low] (new) Try it, vertical rhythm**
   - Frame: The size select's top is 62 px below the row top, and the tone select's is 123
   - Build: The size select is at 70 and the tone select at 134 (64 px pitch against 61)
   - Cause: apps/docs/components/classes.ts:170 H3 (the Try it heading at previewer/playground-island.tsx:73) and :190 CONTROL_LABEL, both on 16 px lines
   - Fix: Same fix as under Table: CONTROL_LABEL 'text-xs/3' and the Try it heading `${H3} leading-3`

## /en/docs/components/empty-state: differs (3)

Note: Checked against Figma 137:2349 (metadata of states 137:2427) and fresh 2x measurements (measure.json empty-state). 3 of the 4 rows hold and the title is refuted. The stage box matches: 339 wide, surface fill, line-strong dash, top within 2.5 px. Recorded: no Try it (S8, no schema), the compact cell's look (DECISIONS 2026-10-19 compact prop) and the 40 px tray. The frame's strip wraps 3+1 only because 4 x 227 is 908 against 906.

1. **[medium] (still open) Every state, default / filtered / error cells**
   - Frame: A bare 24 px icon (tray, magnifying glass, red warning circle) 5 px over the word in 9 px mono muted. No box
   - Build: A full dashed EmptyState in each cell: line-strong dashes, bg-surface, p 28, radius 12. The boxes are 107.3x128 / 148x128 / 100.9x128, with 40 px icons and the word in 16 px semibold body colour
   - Cause: packages/topclassui/src/components/empty-state/dummy/states.tsx:11-13 render real EmptyStates. empty-state/classes.ts:7-8 'gap-2.5 rounded-box bg-surface p-7 ... border-dashed' plus BORDER_STRONG, and :15 TITLE 'text-base ... font-semibold'
   - Fix: Give EmptyState a borderless, unpadded option (the frame's Try it has 'bordered' off) and render the strip with it, using a 24 px icon and the word in mono muted text-xs. Or record the boxed strip in DECISIONS.md next to the compact entry
2. **[medium] (new) Every state, caption line**
   - Frame: Every caption sits 9 px under a 56 px box (cell y 65)
   - Build: The 'compact' caption is at card y 962.8 under its 81.5 px box, and the other three are at 1009.3 under 128 px boxes: 46.5 px apart in one row
   - Cause: apps/docs/components/classes.ts:221 STATE_GRID 'items-start' and :222 STATE_CELL 'content-start'
   - Fix: Same fix as under Table: STATE_GRID items-stretch and STATE_CELL grid-rows-[1fr_auto], so every caption sits on the row's last line
3. **[low] (still open) head, card mode switch width**
   - Frame: 217x31, segments 66/64/75 x 23 (px 9, gap 5)
   - Build: 224.1x32, segments 68.1/67/77 x 24 (px 10, gap 6)
   - Cause: segmented-control/classes.ts:39 'px-2.5' and :28 'gap-1.5', via apps/docs/components/previewer/card-mode-switch.tsx:41
   - Fix: Same fix as under Table: className="gap-1.25 px-2.25" on each SegmentedControlItem

## Refuted by the second reviewer (do not act)

- /en/docs/components/tree-view, (still open) head, title ('TreeView' vs 'Tree view'): The site spec makes the card title the content file's human title: docs-site.md S7 line 683 says 'the human title', and line 2395 makes the page h1 that same human title. Every multi-word content title follows it ('Avatar group', 'Segmented control', 'Dropdown menu', 'Command palette'), so this is the specified title, not drift.
- /en/docs/components/code-block, (still open) head, title ('CodeBlock' vs 'Code block'): Same as TreeView: docs-site.md S7 (line 683) gives the card the content file's human title, and every spaced content title follows that rule.
- /en/docs/components/empty-state, (still open) head, title ('EmptyState' vs 'Empty state'): Same as TreeView: docs-site.md S7 (line 683) gives the card the content file's human title, and every spaced content title follows that rule.
