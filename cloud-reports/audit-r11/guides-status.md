# Figma audit, guides: status of every row (job 126, fix/r11-guides)

Each row of cloud-reports/audit-r11/guides.md (cloud/audit-r11 606dbc97), by page and number. fixed: the commit on fix/r11-guides. shared: its cause is classes.ts, the shell, the code-block header or the Shiki theme, which job 150 (fix/r11-card-shell) owns. kept: the recorded decision it rests on. The refuted rows need no status.

## Colors (181:1144)

| # | Row | Status |
| --- | --- | --- |
| 1 | Every class header row | shared (job 150): PROSE_CELL header, classes.ts:90 |
| 2 | Class and Variable cells muted | shared (job 150): AUTHORED_CELL [&_code]:text-body, classes.ts:100 |
| 3 | Six tones role column | fixed 927ec640 (textOf(role), 12 px body) |
| 4 | Captions under the layers block and the tones | fixed 927ec640 (Caption, NOTE) |
| 5 | Board leaders and dots | fixed 927ec640 (lines text-line, dots fill-primary-on-soft) |
| 6 | Three modes Copy button | fixed 793b1d98 (TokensSample through CodeFrame) |
| 7 | Every class row height and columns | shared (job 150): PROSE_CELL leading |
| 8 | Contrast check table | fixed 927ec640 (ratios and exempt as code, line-strong and ring plain); header and cell colour shared (job 150) |
| 9 | primary/soft shade wraps | fixed 927ec640 (mix label "24% into the page", en and ar) |
| 10 | Board role labels | fixed 927ec640 (0.625rem, names nowrap) |
| 11 | Code block header icon and "code" | shared (job 150): code-fence.tsx naming and the CodeBlock icon |
| 12 | Code colours in CSS fences | shared (job 150): lib/shiki-themes.ts |
| 13 | Warning callout | fixed 927ec640 (warning-circle icon, code in the tone colour) |
| 14 | Extra ThemeScript callout | fixed 927ec640 (folded into the section's sentence) |
| 15 | WCAG 1.4.11 underline | shared (job 150): TEXT_LINK |
| 16 | Paragraph inline names | shared (job 150): PROSE_CODE |
| 17 | Three modes first paragraph | fixed 927ec640 ("This site follows your system's mode.", en and ar) |
| 18 | On this page two-line entry | shared (job 150): TOC_LINK |
| 19 | Navbar and sidebar pitch | shared (job 150): the shell |

## Icons (181:1465)

| # | Row | Status |
| --- | --- | --- |
| 1 | What flips cards | fixed 0cee95c8 (three a row) and 7659c6ac (gap 14, p-4, gap 6) |
| 2 | Search field | fixed 7659c6ac (320 px, glass at the start, clear at the end, placeholder in the body colour) |
| 3 | Filter | fixed 7659c6ac (three chips, the chosen one on primary soft; the library control keeps its radio keys) |
| 4 | Tiles | fixed d4bb5406 and 7659c6ac (dashed line border, no fill, radius 10, pt 16 pb 14, gap 10, 24 px glyph) |
| 5 | The set table | fixed 0d40525c (counts as code); header and cell colour shared (job 150) |
| 6 | Sizes table | fixed 0d40525c ((default) and pixels as code); header and cell colour shared (job 150) |
| 7 | Tile names cut | fixed 7659c6ac (11 px; caret-double-right and dots-three-vertical whole) |
| 8 | Panel | fixed 7659c6ac (p 18, gap 8; the six tracks stretch) |
| 9 | Card body text | fixed 7659c6ac (inline names at the body size) |
| 10 | Phosphor underline | shared (job 150): TEXT_LINK |
| 11 | Inline names in leads | shared (job 150): PROSE_CODE |

## Theming (181:1808)

| # | Row | Status |
| --- | --- | --- |
| 1 | Knobs header row | shared (job 150): PROSE_CELL header |
| 2 | Knob and default cells | fixed 281647a0 (defaults TABLE_CODE, body colour); knob names through AUTHORED_CELL shared (job 150) |
| 3 | Mode block Copy button | fixed 793b1d98 (CodeFrame) |
| 4 | Ocean caption | fixed 281647a0 (Caption) |
| 5 | Knobs table geometry | fixed 281647a0 (0 and prefers-reduced-motion plain); row leading shared (job 150) |
| 6 | Ocean block code colours | shared (job 150): lib/shiki-themes.ts |
| 7 | Scoping block header | shared (job 150): code-fence.tsx naming |
| 8 | data-theme in paragraphs | shared (job 150): PROSE_CODE |
| 9 | On this page two-line entries | shared (job 150): TOC_LINK |

## Right to left (183:1245)

| # | Row | Status |
| --- | --- | --- |
| 1 | The rule sample | fixed 80206d7a (shows the html, body, comment and provider lines; the whole layout still compiles) |
| 2 | Logical classes table | shared (job 150): header, AUTHORED_CELL and leading; the class names stay code, the frame's own tracking-* row is code |
| 3 | Transforms code colours | shared (job 150): lib/shiki-themes.ts |
| 4 | Placement Right pane | fixed 80206d7a (the import is compiled, not shown) |
| 5 | Plural sample length | kept: DECISIONS 2026-10-22 (b57ade35), Arabic has six plural forms |
| 6 | Inline names in paragraphs | shared (job 150): PROSE_CODE |

## Server first (183:1578)

| # | Row | Status |
| --- | --- | --- |
| 1 | What it costs you cards | fixed 0cee95c8 and 7659c6ac (three a row, card spacing) |
| 2 | Three kinds table | fixed 6245b3a9 (the 33-character chip fits: ONE_LINE 34); header and leading shared (job 150) |
| 3 | Hooks caption | fixed 6245b3a9 (Caption) |
| 4 | Count line under the table | fixed 6245b3a9 (muted) |
| 5 | Wrong pane wraps | fixed 6245b3a9 (broken at the props by hand) |
| 6 | Inline names in paragraphs | shared (job 150): PROSE_CODE |
| 7 | On this page | shared (job 150): TOC_LINK |

## Accessibility (183:1877)

| # | Row | Status |
| --- | --- | --- |
| 1 | Minimum column | fixed 6245b3a9 (a short last column fits at the end) |
| 2 | Contrast header and values | fixed 97664b2e (ratios as code); header and colour shared (job 150) |
| 3 | Target size block and caption | fixed 97664b2e (the TOUCH_TARGET definition printed from topclassui/classes, then the caption) |
| 4 | Focus block | fixed 97664b2e (the FOCUS_RING definition printed, no value paragraph) |
| 5 | Automatic and manual table | shared (job 150): header, AUTHORED_CELL, leading, TEXT_LINK; the When column fits since 6245b3a9 |
| 6 | Labels Right pane | fixed 97664b2e (shows the Field lines; the whole file compiles) |
| 7 | WCAG 2.2 AA lead link | shared (job 150): docs-shell.tsx renders the lead |
| 8 | WCAG 2.5.7 underline | shared (job 150): TEXT_LINK |
| 9 | Known gaps callout icon | fixed 927ec640 (warning-circle for every warning callout) |
| 10 | Inline names in paragraphs | shared (job 150): PROSE_CODE |
| 11 | On this page two-line entries | shared (job 150): TOC_LINK |

## Changelog (183:2536)

| # | Row | Status |
| --- | --- | --- |
| 1 | Release entries | fixed 6cfcbb51 (muted list, PROSE_CODE names, no chips) |
| 2 | Section order | fixed 6cfcbb51 (Breaking changes before Version policy) |
| - | Refuted: How an entry is written, the 0.4.0 sample | removed again f2f74028 (page 17 records them as not built) |
