# Figma audit 2, guides: status of every row (job 126, fix/r11-guides)

Each row of cloud-reports/audit-r12/guides.md (cloud/audit-r11 6916e771), by page and number. fixed: the commit on fix/r11-guides. shared: the cause is apps/docs/components/classes.ts (AUTHORED_CELL, PROSE_HEAD, PROSE_COLUMN.fit, PROSE_CODE, TEXT_LINK, TOC_LINK), which job 150 owns. kept: the record it rests on. library: needs a CodeBlock icon prop, and the library is closed this round. The refuted rows need no status.

## Colors (15)

| # | Row | Status |
| --- | --- | --- |
| 1 | Every class code cells muted | shared (150): AUTHORED_CELL [&_code]:text-body |
| 2 | 'What it is for' header | fixed 26230265 (DataTable head="code" from TokenTable) |
| 3 | Every class row height and columns | shared (150): AUTHORED_CELL [&_code]:leading-[inherit] |
| 4 | Contrast check table | shared (150): AUTHORED_CELL colour, PROSE_HEAD leading, TEXT_LINK -my, PROSE_COLUMN.fit width |
| 5 | Code block headers | fixed 03b5ee03 (an untitled fence is named "code", repeats numbered); the copy icon: library |
| 6 | Code colours in css fences | fixed 03b5ee03 (attribute selectors amber); the className line stays in its css fence: kept, it is a CSS sample |
| 7 | WCAG 1.4.11 underline | shared (150): TEXT_LINK |
| 8 | Inline names in paragraphs and the callout | fixed 26230265 (@theme inline and the two token names plain) |
| 9 | On this page two-line entry | shared (150): TOC_LINK py-1 |
| 10 | Add your own theme paragraph | fixed 26230265 (one line; the ThemeScript fact moved into the sample's comment) |
| 11 | Plain code text colour | kept: DECISIONS 2026-10-22 "Plain code on a dark ground stays neutral-300" (03b5ee03) |
| 12 | Board Save button | fixed 26230265 (px-3, semibold) |
| 13 | Sidebar vertical offset | fixed 5b7ed57d (title pb-1) |
| 14 | On this page first entry offset | fixed 5b7ed57d (eyebrow mb-0.5) |
| 15 | Navbar current link | kept: docs-site.md "What the Figma reading changes" row 19 (5b7ed57d) |

## Icons (8)

| # | Row | Status |
| --- | --- | --- |
| 1 | Tile height | fixed d2ea27bd (glyph box leading-none, name leading 15 px: 81 px tiles) |
| 2 | The set Count column | fixed d2ea27bd (counts printed as TABLE_CODE); header row shared (150) |
| 3 | Sizes table | fixed d2ea27bd (sm and md plain in the prose cells); code colour, fit width and header shared (150) |
| 4 | What flips cards | fixed d2ea27bd (title 17 px line, body 15 px line, names in Inter) |
| 5 | Search clear icon | fixed d2ea27bd (always drawn, disabled while empty) |
| 6 | Filter chips height | fixed d2ea27bd (17 px line, 33 px chips) |
| 7 | Phosphor underline | shared (150): TEXT_LINK |
| 8 | Inline names in leads | fixed d2ea27bd (Icon, Svg, 1em and viewBox plain) |

## Theming (6)

| # | Row | Status |
| --- | --- | --- |
| 1 | Knob names muted | shared (150): AUTHORED_CELL |
| 2 | Knobs columns and header | shared (150): PROSE_HEAD leading, PROSE_COLUMN.fit width |
| 3 | Ocean block code colour | fixed 03b5ee03 |
| 4 | Code headers | fixed 03b5ee03 (Scoping is named "code"); the copy icon: library |
| 5 | data-theme in paragraphs | fixed 49a990f4 |
| 6 | On this page two-line entries | shared (150): TOC_LINK py-1 |

## Right to left (4)

| # | Row | Status |
| --- | --- | --- |
| 1 | Logical classes table | fixed 49a990f4 (class names plain, tracking-* stays code; the content test reads both); header shared (150) |
| 2 | Transforms code colours | fixed 03b5ee03 (dir amber); the className lines stay in their css fence: kept, a CSS sample |
| 3 | Paragraph inline names | fixed 49a990f4 (html, --tc-dir, 1, -1, placement, side, start, end plain) |
| 4 | Code block header icons | library (the file-name titles are recorded) |

## Server first (6)

| # | Row | Status |
| --- | --- | --- |
| 1 | On this page | fixed 5b7ed57d (list 160 px, "Why index.tsx has no hooks" on one line); py-1 shared (150) |
| 2 | Section paragraph names | fixed 1331f349 (index.tsx, hook.ts and use client plain, no quotes) |
| 3 | Right pane wraps | fixed 1331f349 (type Item, onSelect broken over three lines; still compiled) |
| 4 | Three kinds header row | shared (150): PROSE_HEAD leading |
| 5 | Card lines | fixed d2ea27bd (17 and 15 px lines, names in Inter) |
| 6 | Code block header icons | library |

## Accessibility (10)

| # | Row | Status |
| --- | --- | --- |
| 1 | Automatic and manual table | shared (150): AUTHORED_CELL, TEXT_LINK, PROSE_HEAD |
| 2 | Contrast Minimum column | fixed 26230265 and 4e491f62 (a short last column leaves the slack to the first long one) |
| 3 | Contrast values | shared (150): AUTHORED_CELL, PROSE_HEAD |
| 4 | WCAG 2.2 AA lead link | fixed 1331f349 (pages.ts leadLink, rendered in docs-shell) |
| 5 | WCAG 2.5.7 underline | shared (150): TEXT_LINK |
| 6 | Paragraph names | fixed 1331f349 (--tc-ring, id, aria-label, aria-labelledby plain) |
| 7 | On this page two-line entries | shared (150): TOC_LINK py-1 |
| 8 | Constant names in the class samples | fixed 03b5ee03 (variable.other.constant in the keyword blue) |
| 9 | Code block header icons | library |
| 10 | 'Contrast' in mono | kept: docs-site.md row 20, a frame slip (5b7ed57d) |

## Changelog

Matches (0 rows).
