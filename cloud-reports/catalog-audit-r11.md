# Catalog and search audit, row by row (job 134)

Closes cloud-reports/audit-r11/catalog-and-search.md (origin/cloud/audit-r11 606dbc97). Branch fix/r11-catalog, tip 47865ac1. Fixed rows were measured in a browser at 1440 px on 16aa59ed.

| Row | Status | Where |
| --- | --- | --- |
| LTR 1 navbar height and sides | fixed | dfc90103: site-navbar.tsx, 58 px bar, 28 px sides with the safe-area term, brand at x 28 |
| LTR 2 search button border | shared (job 150) | apps/docs/components/classes.ts SEARCH_TRIGGER |
| LTR 3 sidebar row label colour | shared (job 150) | classes.ts SIDE_LINK.rest |
| LTR 4 sidebar row height and pitch | fixed | dfc90103: site-sidebar.tsx --tc-row-height 1.8125rem, rows 29 px on a 31 px pitch |
| LTR 5 lead under the h1 | fixed | dfc90103: catalog-page.tsx text-base, 2 lines at 16/24 |
| LTR 6 Before you start step 3 | fixed | dfc90103: before-you-start.tsx, both tags on one line, suppressHydrationWarning in the step note (en, ar), p-2.75 at the call site; 13 lines, no sideways scroll |
| LTR 7 section count chip position | fixed | dfc90103: section-heading.tsx anchorBefore, anchor out of flow at lg; chip 10 px after every section title |
| LTR 8 On this page groups and counts | already fixed | 0c98cf54 |
| LTR 9 card title colour | shared (job 150) | previewer.tsx and classes.ts LINK |
| LTR 10 search button size | fixed, one part shared | dfc90103: search-button.tsx size xs (28 px), 14 px magnifier; the TYPE.nav drop is classes.ts SEARCH_TRIGGER, job 150 |
| LTR 11 mode switch label weight | shared (job 150) | classes.ts MODE_SEGMENT |
| LTR 12 sidebar group label offset | fixed | dfc90103: sidebar-groups.tsx -ms-1, label text at x 18 with the icons |
| LTR 13 card corner radius | shared (job 150) | classes.ts CARD |
| LTR 14 step 1 code colours | fixed | dfc90103: 'text' in LANGS (lib/shiki-themes.ts), step 1 lang 'text' |
| LTR 15 section lead measure | fixed | dfc90103: catalog-page.tsx max-w-190, 760 px |
| AR 1 Arabic typeface | kept: job 147 | the root layout's body font-sans (app/(site)/[locale]/layout.tsx), handed over by the lead |
| AR 2 Try it prop labels | shared (job 150) | classes.ts CONTROL_LABEL, try-it-control.tsx |
| AR 3 navbar brand name | kept: for Omar | no recorded decision yet: labels/ar.ts siteName 'توب كلاس', or a DECISIONS entry for the Latin wordmark |
| AR 4 Every state captions | shared (job 150) | previewer/state-strip.tsx |
| search 1 Enter hint | already fixed | 0c98cf54: search-palette.tsx drops its own kbd |
| search 2 list bottom padding | kept: library need | packages/topclassui/src/components/command/classes.ts COMMAND_LIST cap plus its 6 px padding |
| search 3 Esc keycap | kept: library need | command/classes.ts COMMAND_ESCAPE_HINT bg-surface |
| search 4 text offset after the magnifier | kept: library need | command/classes.ts COMMAND_INPUT ps-0 pe-2 |
| search 5 group heading height | kept: library need | command/classes.ts COMMAND_GROUP_LABEL and command/lib.ts, or a line in DECISIONS 2026-10-19 overlays |

## Audit 2 (cloud-reports/audit-r12/catalog-and-search.md, origin/cloud/audit-r11 6916e771)

Branch fix/r11-catalog, tip 2ef45b99, on preview/r8-all 62ce0c67 (which holds df334f0d and 87f2863a). Fixed rows were measured in a browser at 1440.

| Row | Status | Where |
| --- | --- | --- |
| EN 1 sidebar row label colour | shared (job 150) | apps/docs/components/classes.ts:39 SIDE_LINK.rest |
| EN 2 navbar mode switch label weight | shared (job 150) | classes.ts:34 MODE_SEGMENT, or the DECISIONS line the audit offers |
| EN 3 sidebar title row and groups 6 px low | fixed | 0cae5832: site-sidebar.tsx TITLE pb-1; Home at 82 below the sidebar top (page y 140), as drawn |
| EN 4 '@' of @import | fixed | 0cae5832: punctuation.definition.keyword.css in PLAIN_IN_CSS (lib/shiki-themes.ts); '@' plain, 'import' #51a2ff |
| EN 5 On this page second entry | fixed | 0cae5832: installHeading 'Install: CLI or package' (en), 'التثبيت: سطر الأوامر أو الحزمة' (ar) |
| AR 1 Arabic glyphs in mono set in Arial | fixed | 0cae5832: globals.css --tc-font-mono "Geist Mono", var(--font-noto-arabic, "Geist Mono"), var(--font-geist-mono), ...; /ar section chip Noto Sans Arabic 9 glyphs + Geist Mono 2, /en chip Geist Mono 12 (CSS.getPlatformFontsForNode) |
| AR 2 navbar brand name | kept: for Omar | no recorded decision: labels/ar.ts siteName 'توب كلاس' or a DECISIONS entry for the Latin wordmark |
| search 1 Esc keycap | kept: library need | packages/topclassui/src/components/command/classes.ts:67 COMMAND_ESCAPE_HINT bg-surface |
| search 2 text offset after the magnifier | kept: library need | command/classes.ts:31 COMMAND_INPUT ps-0 pe-2 |
| search 3 group heading height | kept: library need | command/classes.ts:48 COMMAND_GROUP_LABEL and command/lib.ts, or the DECISIONS 2026-10-19 overlays sentence |
| refuted: capped list bottom padding | not acted on | refuted by the second reviewer |

Gates on 2ef45b99 from apps/docs: docs:data, typecheck, lint, vitest 298, docs:build, check:static all 0; e2e catalog and search 17 passed.
