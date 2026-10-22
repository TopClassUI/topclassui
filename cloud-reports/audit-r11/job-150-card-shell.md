# Job 150, the card shell: status of every shared row

Branch fix/r11-card-shell. The 115 rows of the ten audit files marked (shared) or whose cause is in apps/docs/components/previewer/* or apps/docs/components/classes.ts (8 high, 53 medium, 54 low), plus the catalog job's TYPE.nav hand-over (116) and job 144's stage tooltip (117). Fixed: c7c65f16 (the shell), ae033af1 (Arabic state captions, search label), 6de2da3b (CHECK_ROW gap-1 on job 140's pitch). Composite: docs/figma/parity/site-card-shell.png (Checkbox frame 135:1086 left, the build right, 1440 dark).

| # | Source | Page | Row | Status |
|---|---|---|---|---|
| 1 | catalog-and-search.md | /en/docs/components | 2 [medium] navbar, search button border | fixed (c7c65f16) |
| 2 | catalog-and-search.md | /en/docs/components | 3 [medium] sidebar, row label colour | fixed (51e730dc): SIDE_LINK.rest drops text-muted, the library body text and hover fill (the r12 audit read base/body on the frame) |
| 3 | catalog-and-search.md | /en/docs/components | 9 [medium] first card (Button), title colour | fixed (c7c65f16) |
| 4 | catalog-and-search.md | /en/docs/components | 11 [low] navbar, mode switch label weight | fixed (51e730dc): MODE_SEGMENT all medium (the r12 audit read the navbar frame 133:168 itself; the SegmentedControl decision stays for the component) |
| 5 | catalog-and-search.md | /en/docs/components | 13 [low] Before you start and How to read a card, corner radius | fixed (c7c65f16) |
| 6 | catalog-and-search.md | /ar/docs/components | 2 [medium] first card, Try it prop labels | fixed (c7c65f16) |
| 7 | catalog-and-search.md | /ar/docs/components | 4 [low] first card, Every state captions | fixed (ae033af1) |
| 8 | getting-started.md | /en/docs/installation | 1 [high] navbar, search trigger border | fixed (c7c65f16) |
| 9 | getting-started.md | /en/docs/installation | 7 [medium] Framework support row 2, inline code | fixed (c7c65f16) |
| 10 | getting-started.md | /en/docs/installation | 12 [low] navbar, mode switch weight | fixed (51e730dc) as row 4 |
| 11 | getting-started.md | /en/docs/installation | 15 [low] sidebar, rest-row text colour | fixed (51e730dc) as row 2 |
| 12 | getting-started.md | /en/docs/installation | 18 [low] tables, row height | fixed (c7c65f16) |
| 13 | getting-started.md | /en/docs/installation | 22 [low] prose inline code, every guide page (added by verifier) | open for Omar: the row asks him to pick muted plain text or mono runs for every guide's inline code |
| 14 | getting-started.md | /en/docs/provider | 3 [low] What it renders, Isolation root card text (added by verifier) | page row (guides): the fix is cards.tsx:16, not a shell file |
| 15 | guides.md | /en/docs/colors | 1 [medium] Every class table, header row | fixed (c7c65f16) |
| 16 | guides.md | /en/docs/colors | 15 [low] Contrast table link 'WCAG 1.4.11' | fixed (51e730dc): TEXT_LINK underlined (Home's catalog-chips link carries it too; if Home's frame draws it plain, that is the Home owner's no-underline) |
| 17 | guides.md | /en/docs/colors | 19 [low] Shell (all seven guide pages) | fixed (c7c65f16) (SIDE_LINK 29 px rows); the 58 px navbar is site-navbar.tsx, not a shell file |
| 18 | guides.md | /en/docs/icons | 5 [medium] The set table | fixed (c7c65f16) (header, 17 px line); code in cells body-coloured in 51e730dc (AUTHORED_CELL) |
| 19 | guides.md | /en/docs/theming | 1 [medium] The knobs table, header row | fixed (c7c65f16) |
| 20 | guides.md | /en/docs/rtl | 2 [medium] Logical classes only table | fixed (c7c65f16) (header, 17 px line); code in cells body-coloured in 51e730dc (AUTHORED_CELL) |
| 21 | guides.md | /en/docs/server-first | 2 [medium] The three kinds table | fixed (c7c65f16) (header, 17 px line); ONE_LINE is lib/table-of.ts, the guides job |
| 22 | guides.md | /en/docs/accessibility | 2 [medium] Contrast table, header and values | fixed (c7c65f16) (header, 17 px line); code in cells body-coloured in 51e730dc (AUTHORED_CELL) |
| 23 | guides.md | /en/docs/accessibility | 5 [medium] Automatic and manual table | fixed (c7c65f16) (header, 17 px line); TEXT_LINK underlined in 51e730dc |
| 24 | job-140-fields-1.md | /en/docs/components/checkbox | 1 [high] stage (play row, left), content at rest | page row (job 140: checkbox stageDemo) |
| 25 | job-140-fields-1.md | /en/docs/components/checkbox | 3 [medium] Try it, select trigger (shared) | fixed (c7c65f16); the select keeps its line-strong edge (kept, R-5.6-4: a control boundary needs 3:1) |
| 26 | job-140-fields-1.md | /en/docs/components/checkbox | 4 [medium] head, chip (shared) | fixed (c7c65f16) |
| 27 | job-140-fields-1.md | /en/docs/components/checkbox | 5 [medium] code part, Copy button (shared) | fixed (c7c65f16) |
| 28 | job-140-fields-1.md | /en/docs/components/checkbox | 6 [medium] code part, note line (shared) | fixed (c7c65f16) |
| 29 | job-140-fields-1.md | /en/docs/components/checkbox | 7 [medium] install row, 'Then import it' field and notes (shared) | fixed (c7c65f16) (10 px notes) and already fixed 8d15e6d2 (job 140: 11 px field text, 24 px copy target) |
| 30 | job-140-fields-1.md | /en/docs/components/checkbox | 8 [low] Try it, toggle boxes (shared) | fixed (c7c65f16) (xs box), already fixed d2d37d27 (job 140: 25 px pitch), gap-1 in 6de2da3b |
| 31 | job-140-fields-1.md | /en/docs/components/checkbox | 10 [low] head, mode switch (shared) | fixed (c7c65f16); the card switch keeps the SegmentedControl weights (DECISIONS 2026-10-19); its segments take the drawn 9 px padding in 51e730dc |
| 32 | job-140-fields-1.md | /en/docs/components/checkbox | 11 [low] head, Install button (shared) | fixed (c7c65f16) |
| 33 | job-140-fields-1.md | /en/docs/components/checkbox | 12 [low] code part, plain code tokens (shared) | fixed (c7c65f16) |
| 34 | job-140-fields-1.md | /en/docs/components/checkbox | 13 [low] Every state, captions (shared) | fixed (c7c65f16) |
| 35 | job-140-fields-1.md | /en/docs/components/checkbox | 14 [low] install row, copy icon position (shared) | already fixed 8d15e6d2 (job 140: size-6 px-0 copy target, pe-0) |
| 36 | job-140-fields-1.md | /en/docs/components/checkbox | 15 [low] card frame, corner radius (shared) | fixed (c7c65f16) |
| 37 | job-140-fields-1.md | /en/docs/components/radio-group | 4 [low] install row, note under 'Then import it' | fixed (c7c65f16) |
| 38 | job-140-fields-1.md | /en/docs/components/otp-field | 1 [high] install row, 'Then import it' line | fixed (job 140 d47b95c0, which replaces c7c65f16's props.ts lines: the case-insensitive match also renamed Toast's part to the toast function; 140 requires a capitalised export) |
| 39 | job-141-fields-2.md | /en/docs/components/input | 4 [medium] Try it, select controls (shared) | fixed (c7c65f16); the select keeps its line-strong edge (kept, R-5.6-4: a control boundary needs 3:1) |
| 40 | job-141-fields-2.md | /en/docs/components/input | 5 [medium] code part, Copy button (shared) | fixed (c7c65f16) |
| 41 | job-141-fields-2.md | /en/docs/components/input | 6 [medium] code part, note line (shared) | fixed (c7c65f16) |
| 42 | job-141-fields-2.md | /en/docs/components/input | 8 [low] card frame, corner radius (shared, all 8 cards) | fixed (c7c65f16) |
| 43 | job-141-fields-2.md | /en/docs/components/input | 9 [low] head, colour-mode switch (shared) | fixed (c7c65f16) |
| 44 | job-141-fields-2.md | /en/docs/components/input | 10 [low] head, Install button (shared) | fixed (c7c65f16) |
| 45 | job-141-fields-2.md | /en/docs/components/input | 11 [low] Try it, checkboxes (shared) | fixed (c7c65f16) |
| 46 | job-141-fields-2.md | /en/docs/components/select | 4 [medium] Every state, trigger size | page row (job 141: select states.tsx) |
| 47 | job-141-fields-2.md | /en/docs/components/rating | 2 [medium] code part | page row (job 141: rating playground) |
| 48 | job-142-display.md | /en/docs/components/button | 1 [medium] shell, all 9 cards: head, render chip beside the name | fixed (c7c65f16) |
| 49 | job-142-display.md | /en/docs/components/button | 2 [medium] shell, all 9 cards: Try it select | fixed (c7c65f16); the select keeps its line-strong edge (kept, R-5.6-4: a control boundary needs 3:1) |
| 50 | job-142-display.md | /en/docs/components/button | 5 [low] shell, all 9 cards: card corner and shadow | fixed (c7c65f16); the shadow is dropped, not drawn (kept, docs-site.md Shadows: the Previewer card has no shadow) |
| 51 | job-142-display.md | /en/docs/components/button | 9 [low] shell, all 9 cards: code part, Copy button | fixed (c7c65f16) |
| 52 | job-142-display.md | /en/docs/components/button | 10 [low] shell, all 9 cards: Every state captions | fixed (c7c65f16) |
| 53 | job-143-data.md | /en/docs/components/table | 2 [medium] stage, table panel | page row (job 143: table playground) |
| 54 | job-143-data.md | /en/docs/components/table | 4 [medium] Try it, selects | fixed (c7c65f16); the select keeps its line-strong edge (kept, R-5.6-4: a control boundary needs 3:1) |
| 55 | job-143-data.md | /en/docs/components/table | 5 [medium] The code, Copy button | fixed (c7c65f16) |
| 56 | job-143-data.md | /en/docs/components/table | 9 [low] Try it, checkboxes | fixed (c7c65f16) |
| 57 | job-143-data.md | /en/docs/components/table | 10 [low] head | fixed (c7c65f16) |
| 58 | job-143-data.md | /en/docs/components/table | 11 [low] head, card mode switch size | fixed (c7c65f16) |
| 59 | job-143-data.md | /en/docs/components/table | 12 [low] head, Install button | fixed (c7c65f16) |
| 60 | job-143-data.md | /en/docs/components/table | 14 [low] card frame | fixed (c7c65f16); the shadow is dropped, not drawn (kept, docs-site.md Shadows: the Previewer card has no shadow) |
| 61 | job-143-data.md | /en/docs/components/table | 15 [low] Every state captions | fixed (c7c65f16) |
| 62 | job-143-data.md | /en/docs/components/tree-view | 3 [medium] The code, note | fixed (c7c65f16) |
| 63 | job-143-data.md | /en/docs/components/timeline | 2 [medium] The code, note | fixed (c7c65f16) |
| 64 | job-143-data.md | /en/docs/components/timeline | 6 [low] head | fixed (c7c65f16) |
| 65 | job-144-feedback.md | /en/docs/components/alert | 3 [medium] Try it selects (S6) | fixed (c7c65f16); the select keeps its line-strong edge (kept, R-5.6-4: a control boundary needs 3:1) |
| 66 | job-144-feedback.md | /en/docs/components/alert | 6 [low] head, chip (S2) | fixed (c7c65f16) |
| 67 | job-144-feedback.md | /en/docs/components/alert | 7 [low] head, Light/Dark/Ocean switch (S4) | fixed (c7c65f16) |
| 68 | job-144-feedback.md | /en/docs/components/alert | 8 [low] head, Install button (S5) | fixed (c7c65f16) |
| 69 | job-144-feedback.md | /en/docs/components/alert | 9 [low] The code, Copy button (S7) | fixed (c7c65f16) |
| 70 | job-144-feedback.md | /en/docs/components/alert | 10 [low] card frame (S1), corner radius | fixed (c7c65f16) |
| 71 | job-144-feedback.md | /en/docs/components/banner | 4 [medium] Try it select (S6) | fixed (c7c65f16); the select keeps its line-strong edge (kept, R-5.6-4: a control boundary needs 3:1) |
| 72 | job-144-feedback.md | /en/docs/components/banner | 6 [low] Try it, dismissible checkbox | fixed (c7c65f16), gap-1 in 6de2da3b |
| 73 | job-144-feedback.md | /en/docs/components/banner | 11 [low] The code, Copy button (S7) | fixed (c7c65f16) |
| 74 | job-144-feedback.md | /en/docs/components/banner | 12 [low] card corner (S1) and mono font (S8) | fixed (c7c65f16); Geist Mono stays (kept, docs-site.md: Roboto Mono is not loaded) |
| 75 | job-144-feedback.md | /en/docs/components/toast | 6 [medium] Try it select and number field (S6) | fixed (c7c65f16); the select keeps its line-strong edge (kept, R-5.6-4: a control boundary needs 3:1) |
| 76 | job-144-feedback.md | /en/docs/components/toast | 12 [low] card corner (S1) and mono font (S8) | fixed (c7c65f16); Geist Mono stays (kept, docs-site.md: Roboto Mono is not loaded) |
| 77 | job-144-feedback.md | /en/docs/components/tooltip | 1 [high] Every state strip | page row (job 144: tooltip states.tsx) |
| 78 | job-144-feedback.md | /en/docs/components/tooltip | 4 [medium] The code, note | fixed (c7c65f16) (note code); the sentence is content, job 144 |
| 79 | job-144-feedback.md | /en/docs/components/tooltip | 6 [medium] Try it select (S6) | fixed (c7c65f16); the select keeps its line-strong edge (kept, R-5.6-4: a control boundary needs 3:1) |
| 80 | job-144-feedback.md | /en/docs/components/tooltip | 10 [low] card corner (S1) and mono font (S8) | fixed (c7c65f16); Geist Mono stays (kept, docs-site.md: Roboto Mono is not loaded) |
| 81 | job-144-feedback.md | /en/docs/components/popover | 1 [high] Every state strip | page row (job 144: popover states.tsx) |
| 82 | job-144-feedback.md | /en/docs/components/popover | 4 [medium] Try it select (S6) | fixed (c7c65f16); the select keeps its line-strong edge (kept, R-5.6-4: a control boundary needs 3:1) |
| 83 | job-144-feedback.md | /en/docs/components/popover | 10 [low] card corner (S1) and mono font (S8) | fixed (c7c65f16); Geist Mono stays (kept, docs-site.md: Roboto Mono is not loaded) |
| 84 | job-144-overlays.md | /en/docs/components/dialog | 1 [medium] head, chip next to the name | fixed (c7c65f16) |
| 85 | job-144-overlays.md | /en/docs/components/dialog | 5 [medium] Try it select (every card) | fixed (c7c65f16); the select keeps its line-strong edge (kept, R-5.6-4: a control boundary needs 3:1) |
| 86 | job-144-overlays.md | /en/docs/components/dialog | 6 [medium] code part, Copy button (every card) | fixed (c7c65f16) |
| 87 | job-144-overlays.md | /en/docs/components/dialog | 7 [medium] code part, note line with inline code (every card) | fixed (c7c65f16) |
| 88 | job-144-overlays.md | /en/docs/components/dialog | 9 [low] card outline, corners | fixed (c7c65f16) |
| 89 | job-144-overlays.md | /en/docs/components/dialog | 10 [low] Try it column, the control list | page row (job 144: dialog Try it list, content) |
| 90 | job-144-overlays.md | /en/docs/components/dialog | 11 [low] Try it checkbox (every card) | fixed (c7c65f16) |
| 91 | job-144-overlays.md | /en/docs/components/dialog | 12 [low] code part, caption row | kept (docs-site.md S8 allows "THE CODE (or a one-line caption)") |
| 92 | job-144-overlays.md | /en/docs/components/drawer | 6 [medium] code part, note line | fixed (c7c65f16) |
| 93 | job-144-overlays.md | /en/docs/components/dropdown | 1 [high] Every state, open and disabled-item cells | page row (job 144: dropdown states.tsx) |
| 94 | job-144-overlays.md | /en/docs/components/command | 8 [low] code part, caption row | kept (docs-site.md S8 allows "THE CODE (or a one-line caption)") |
| 95 | job-145-navigation.md | /en/docs/components/pagination | 1 [medium] head, description | page row (job 145: description text); the head end group is narrower after fixed (c7c65f16) |
| 96 | job-145-navigation.md | /en/docs/components/pagination | 4 [medium] Try it, select control | fixed (c7c65f16); the select keeps its line-strong edge (kept, R-5.6-4: a control boundary needs 3:1) |
| 97 | job-145-navigation.md | /en/docs/components/pagination | 5 [medium] code part, Copy button | fixed (c7c65f16) |
| 98 | job-145-navigation.md | /en/docs/components/pagination | 6 [medium] Every state, cell and pagination size | page row (job 145: pagination states.tsx) |
| 99 | job-145-navigation.md | /en/docs/components/pagination | 7 [low] head, mode switch and Install | fixed (c7c65f16); the card switch keeps the SegmentedControl weights (DECISIONS 2026-10-19); its segments take the drawn 9 px padding in 51e730dc |
| 100 | job-145-navigation.md | /en/docs/components/pagination | 9 [low] Try it, checkbox rows | fixed (c7c65f16) |
| 101 | job-145-navigation.md | /en/docs/components/pagination | 10 [low] code part, header row | kept (docs-site.md S8 allows "THE CODE (or a one-line caption)") |
| 102 | job-145-navigation.md | /en/docs/components/breadcrumb | 4 [medium] code part, header row and Copy | fixed (c7c65f16) (Copy); caption kept (docs-site.md S8 allows "THE CODE (or a one-line caption)") |
| 103 | job-145-navigation.md | /en/docs/components/tabs | 1 [high] Every state, line / focus-visible / disabled cells | page row (job 145: tabs states.tsx) |
| 104 | job-145-navigation.md | /en/docs/components/tabs | 4 [medium] Try it, select and checkbox | fixed (c7c65f16); the select keeps its line-strong edge (kept, R-5.6-4: a control boundary needs 3:1) |
| 105 | job-145-navigation.md | /en/docs/components/tabs | 5 [medium] code part, Copy button and note | fixed (c7c65f16) |
| 106 | job-145-navigation.md | /en/docs/components/accordion | 2 [medium] code part, Copy button | fixed (c7c65f16) |
| 107 | job-145-navigation.md | /en/docs/components/accordion | 6 [low] Try it, checkbox | fixed (c7c65f16) |
| 108 | job-145-navigation.md | /en/docs/components/accordion | 8 [low] Every state, open | page row (job 145: accordion states.tsx); STATE_BOX stays min-h-14 until that demo is cut |
| 109 | job-145-navigation.md | /en/docs/components/stepper | 3 [medium] Try it, select | fixed (c7c65f16); the select keeps its line-strong edge (kept, R-5.6-4: a control boundary needs 3:1) |
| 110 | job-145-navigation.md | /en/docs/components/stepper | 4 [medium] code part, Copy button and note | fixed (c7c65f16) |
| 111 | job-145-navigation.md | /en/docs/components/navbar | 4 [medium] Try it, select and checkbox | fixed (c7c65f16); the select keeps its line-strong edge (kept, R-5.6-4: a control boundary needs 3:1) |
| 112 | job-145-navigation.md | /en/docs/components/navbar | 5 [medium] code part, Copy button | fixed (c7c65f16) |
| 113 | job-145-navigation.md | /en/docs/components/sidebar | 2 [high] Every state, captions and cells | page row (job 145: sidebar states.tsx) |
| 114 | job-145-navigation.md | /en/docs/components/sidebar | 3 [medium] code part, Copy button and note | fixed (c7c65f16) |
| 115 | job-145-navigation.md | /en/docs/components/sidebar | 6 [low] Try it, checkbox | fixed (c7c65f16) |
| 116 | catalog-and-search.md | /en/docs/components | 10 [low] navbar, search button size (the TYPE.nav part) | fixed (ae033af1); the xs size and 14 px icon are the catalog job's |
| 117 | lead, from job 144 | stage tooltip | stageOpen tooltip shares Base UI's delay group | library item: the fix is a TooltipProvider around the docs stage; topclassui exports none and the docs may not import @base-ui/react (no new dependency) |
| 118 | lead, from job 143 | every card with a dummy/stage.tsx | THE CODE printed the whole stage file | fixed (14f32510): THE CODE is codeDemo when set, else the playground's usage whatever the stage draws |

## Second audit (cloud-reports/audit-r12, preview/r8-all 694273fe): the shell rows

45 rows whose cause is in apps/docs/components/previewer/* or classes.ts, or marked shared (2 high, 10 medium, 33 low: 35 fixed, 9 page rows, 1 open for Omar). Fixed in 51e730dc on fix/r11-card-shell.

| # | Source | Page | Row | Status |
|---|---|---|---|---|
| r12-1 | audit-r12/catalog-and-search.md | /en/docs/components | 1 [medium] (still open) sidebar, row label colour | fixed (51e730dc) |
| r12-2 | audit-r12/catalog-and-search.md | /en/docs/components | 2 [low] (still open) navbar, mode switch label weight | fixed (51e730dc) |
| r12-3 | audit-r12/guides.md | /en/docs/colors | 1 [medium] (still open) Every class table, Class and Variable cells (row 2) | fixed (51e730dc) |
| r12-4 | audit-r12/guides.md | /en/docs/colors | 7 [low] (still open) 'WCAG 1.4.11' link (row 15) | fixed (51e730dc) |
| r12-5 | audit-r12/guides.md | /en/docs/icons | 7 [low] (still open) 'Phosphor' link (row 10) | fixed (51e730dc) |
| r12-6 | audit-r12/guides.md | /en/docs/theming | 1 [medium] (still open) The knobs table, knob names (row 2) | fixed (51e730dc) |
| r12-7 | audit-r12/guides.md | /en/docs/server-first | 4 [low] (new) The three kinds table, header row | open for Omar: Colors' header row is drawn 38 px (r11 guides row 1, fixed) and Server first's 42 px; PROSE_HEAD is one class for every guide table |
| r12-8 | audit-r12/guides.md | /en/docs/accessibility | 5 [low] (still open) 'WCAG 2.5.7' link (row 8) | fixed (51e730dc) |
| r12-9 | audit-r12/job-140-fields-1.md | /en/docs/components/checkbox | 2 [low] (still open) head, chip (shared by all six cards) | fixed (51e730dc) |
| r12-10 | audit-r12/job-140-fields-1.md | /en/docs/components/checkbox | 3 [low] (still open) install row, copy field insets and text crowding the copy icon (shared) | fixed (51e730dc) |
| r12-11 | audit-r12/job-140-fields-1.md | /en/docs/components/checkbox | 4 [low] (new) code part, gap between the import lines and the JSX (shared) | fixed (51e730dc) |
| r12-12 | audit-r12/job-140-fields-1.md | /en/docs/components/otp-field | 1 [medium] (still open) install row, 'Then import it' line wraps | fixed (51e730dc) |
| r12-13 | audit-r12/job-140-fields-1.md | /en/docs/components/otp-field | 2 [medium] (new) Every state, four-cell groups crowd one another | page row (job 140: otp-field states.tsx gap) |
| r12-14 | audit-r12/job-141-fields-2.md | /en/docs/components/input | 2 [low] (new) Try it, checkbox rows (shared, all 8 cards) | fixed (51e730dc) |
| r12-15 | audit-r12/job-141-fields-2.md | /en/docs/components/input | 4 [low] (new) code part, note line code words (shared) | fixed (51e730dc) |
| r12-16 | audit-r12/job-141-fields-2.md | /en/docs/components/textarea | 4 [low] (new) Every state, at-limit caption | fixed (51e730dc) (one caption line per row); the bold counter stays (recorded at-limit signal); rows={1} is the page job |
| r12-17 | audit-r12/job-142-display.md | /en/docs/components/button | 1 [low] (still open) shell, all 9 cards: head, render chip beside the name | fixed (51e730dc) |
| r12-18 | audit-r12/job-142-display.md | /en/docs/components/button | 2 [low] (new) shell, cards with boolean switches (Button, Separator): Try it checkbox column | fixed (51e730dc) |
| r12-19 | audit-r12/job-142-display.md | /en/docs/components/button | 3 [low] (new) shell, all 9 cards: caption and label line heights (Try it, Every state, install row) | fixed (51e730dc) (12 px lines on TRY IT, the labels, the captions, the count and the install notes); CARD_PART gap-3 (12 against 14) is kept for every part |
| r12-20 | audit-r12/job-142-display.md | /en/docs/components/button | 5 [low] (added by verifier) shell, all 9 cards: copy icon colour in THE CODE's Copy button and in both install fields | fixed (51e730dc) |
| r12-21 | audit-r12/job-142-display.md | /en/docs/components/kbd | 1 [high] (still open) Try it panel and stage centring | page row (job 142: kbd schema.ts and playground, packages) |
| r12-22 | audit-r12/job-142-display.md | /en/docs/components/card | 1 [high] (still open) Try it panel and stage centring | page row (job 142: card schema.ts and playground, packages) |
| r12-23 | audit-r12/job-142-display.md | /en/docs/components/separator | 1 [low] (still open) install row, Then import it field | fixed (51e730dc) |
| r12-24 | audit-r12/job-143-data.md | /en/docs/components/table | 3 [low] (still open) head, card mode switch width | fixed (51e730dc) |
| r12-25 | audit-r12/job-143-data.md | /en/docs/components/table | 4 [low] (new) Every state, caption line | fixed (51e730dc) |
| r12-26 | audit-r12/job-143-data.md | /en/docs/components/table | 5 [low] (new) Try it, vertical rhythm | fixed (51e730dc) |
| r12-27 | audit-r12/job-143-data.md | /en/docs/components/tree-view | 3 [medium] (new) stage, after the first Try it change | page row (job 143: tree-view playground.tsx) |
| r12-28 | audit-r12/job-143-data.md | /en/docs/components/tree-view | 4 [medium] (new) Every state, caption line | fixed (51e730dc) |
| r12-29 | audit-r12/job-143-data.md | /en/docs/components/tree-view | 6 [low] (still open) head, card mode switch width | fixed (51e730dc) |
| r12-30 | audit-r12/job-143-data.md | /en/docs/components/tree-view | 8 [low] (added by verifier) Try it, vertical rhythm | fixed (51e730dc) |
| r12-31 | audit-r12/job-143-data.md | /en/docs/components/timeline | 2 [low] (still open) head, card mode switch width | fixed (51e730dc) |
| r12-32 | audit-r12/job-143-data.md | /en/docs/components/timeline | 3 [low] (new) stage, vertical position of the events | page row (job 143: timeline stage.tsx pb-4) |
| r12-33 | audit-r12/job-143-data.md | /en/docs/components/timeline | 4 [low] (new) Every state, caption line | fixed (51e730dc) |
| r12-34 | audit-r12/job-143-data.md | /en/docs/components/code-block | 2 [low] (still open) head, card mode switch width | fixed (51e730dc) |
| r12-35 | audit-r12/job-143-data.md | /en/docs/components/code-block | 3 [low] (new) Every state, caption line | fixed (51e730dc) |
| r12-36 | audit-r12/job-143-data.md | /en/docs/components/progress | 1 [low] (still open) head, card mode switch width | fixed (51e730dc) |
| r12-37 | audit-r12/job-143-data.md | /en/docs/components/progress | 2 [low] (new) Try it, vertical rhythm | fixed (51e730dc) |
| r12-38 | audit-r12/job-143-data.md | /en/docs/components/spinner | 1 [medium] (new) stage, after the first Try it change | page row (job 143: spinner playground.tsx) |
| r12-39 | audit-r12/job-143-data.md | /en/docs/components/spinner | 2 [low] (still open) head, card mode switch width | fixed (51e730dc) |
| r12-40 | audit-r12/job-143-data.md | /en/docs/components/spinner | 3 [low] (new) Try it, vertical rhythm | fixed (51e730dc) |
| r12-41 | audit-r12/job-143-data.md | /en/docs/components/empty-state | 2 [medium] (new) Every state, caption line | fixed (51e730dc) |
| r12-42 | audit-r12/job-143-data.md | /en/docs/components/empty-state | 3 [low] (still open) head, card mode switch width | fixed (51e730dc) |
| r12-43 | audit-r12/job-145-navigation.md | /en/docs/components/pagination | 3 [low] Every state, cell and pagination size | page row (job 145: pagination CELL_SIZE.xs, packages) |
| r12-44 | audit-r12/job-145-navigation.md | /en/docs/components/tabs | 3 [medium] Every state, the focus-visible and disabled lists run together | page row (job 145: tabs states.tsx) |
| r12-45 | audit-r12/job-145-navigation.md | /en/docs/components/accordion | 3 [low] Every state, open cell | page row (job 145: accordion states.tsx) |
