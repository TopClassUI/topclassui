# Job 145 navigation: status of every audit row

Rows of `cloud-reports/audit-r11/job-145-navigation.md` (origin/cloud/audit-r11 606dbc97), on fix/r11-pages-145. Shared means the cause is in apps/docs/components/previewer/* or apps/docs/components/classes.ts (job 150, or 140 where it already landed). Library means a schema prop or component class, closed this round.

| Page | Row | Status |
|---|---|---|
| pagination | 1 description | fixed f6703b1f |
| pagination | 2 stage row 1 2 3 4 5 … 24 | kept: listPages keeps the row one length on every page (lib.ts:24, recorded with the wide cells, DECISIONS 2026-10-19); Figma to redraw or Omar to change the rule |
| pagination | 3 size select shows md | already fixed 22e38a2a (starts size sm) |
| pagination | 4 select control | shared (try-it-control; 140's 94f50361 merged) |
| pagination | 5 Copy button | shared (copy-button, job 150) |
| pagination | 6 state cell size | kept: three pages so middle is a middle; the strip wraps 3 + 1 as the frame's does; the full-row cell is shared (STATE_CELL) |
| pagination | 7 mode switch, Install | shared (card-mode-switch, previewer, job 150) |
| pagination | 8 Try it control list | library: shape, showFirstLast, showPrevNext, compact (DECISIONS rows not built); disabled hidden in 22e38a2a |
| pagination | 9 checkbox rows | shared (try-it-control, CHECK_ROW; 140) |
| pagination | 10 code caption | shared (playground-island, job 150) |
| pagination | 11 current page per cell | kept: Figma draws two cells wrong (audit says no code change) |
| breadcrumb | 1 stage and Try it | fixed b1c68cb4 (stageHeight 15.6); Try it is library (showHome, maxItems need a schema) |
| breadcrumb | 2 description | fixed b1c68cb4 |
| breadcrumb | 3 house and Docs one crumb | kept: DECISIONS Breadcrumb, showHome draws the first crumb as the house icon |
| breadcrumb | 4 code caption, Copy | shared (job 150) |
| breadcrumb | 5 hover cell Button | kept: the link element serves every crumb, so a linked Button would be hovered too; the cell ends on the current Button |
| breadcrumb | 6 current weight | kept: CURRENT semibold (classes.ts:28-29 reason); Figma's own current cell is semibold |
| breadcrumb | 7 mode switch, Install | shared (job 150) |
| breadcrumb | 8 crumb size in states | fixed b1c68cb4 (text-xs) |
| tabs | 1 state lists cut | fixed 4c2a4e97 (w-max) |
| tabs | 2 description | fixed 4c2a4e97 |
| tabs | 3 stage content | fixed 4c2a4e97 (dummy/stage.tsx, stageDemo stage) |
| tabs | 4 select and checkbox | shared (140) |
| tabs | 5 Copy and note | shared (job 150) |
| tabs | 6 focus ring | kept: the live ring is inset because the list clips (classes.ts:38-40); library |
| tabs | 7 Try it list | library: orientation, fullWidth, disabled |
| tabs | 8 mode switch, Install | shared (job 150) |
| tabs | 9 disabled bar | library (TABS_BAR) |
| tabs | 10 tab size | kept: sm, since md cannot fit the strip cell (audit's own fallback) |
| accordion | 1 description | fixed 7587556d |
| accordion | 2 Copy | shared (job 150) |
| accordion | 3 trigger boxes | library: Accordion has no size prop |
| accordion | 4 stage box | fixed 7587556d (max-w-100) |
| accordion | 5 Try it list | library: type, variant, collapsible |
| accordion | 6 checkbox | shared (140) |
| accordion | 7 mode switch, Install | shared (job 150) |
| accordion | 8 open cell | fixed 7587556d (answer text-xs); title kept "Open question": two open regions named Question fail axe landmark-unique; caption alignment is STATE_BOX, shared |
| accordion | 9 hover | fixed 7587556d (bg-surface) |
| accordion | 10 focus-visible, disabled | fixed 7587556d (ring outside); disabled kept: the trigger dims, the box stays (component class) |
| stepper | 1 stage centring | fixed d16a1a05 (justify-center) |
| stepper | 2 description | fixed d16a1a05 |
| stepper | 3 select | shared (140) |
| stepper | 4 Copy and note | shared (job 150) |
| stepper | 5 Try it list, stage height | fixed d16a1a05 (stageHeight 19.4); the list is library: orientation, activeStep, clickable, showConnector, compact |
| stepper | 6 mode switch, Install | shared (job 150) |
| stepper | 7 digits | kept: a one-step list numbers from 1 (audit: optional) |
| navbar | 1 description | fixed feb5d1ba |
| navbar | 2 stage bar shape | fixed feb5d1ba (dummy/stage.tsx: max-w-115 rounded-box) |
| navbar | 3 stage content | fixed feb5d1ba (Docs current, bell and account, no Sign in); type sizes kept (DECISIONS rows not built) |
| navbar | 4 select and checkbox | shared (140) |
| navbar | 5 Copy | shared (job 150) |
| navbar | 6 mobile and open menu cells | kept: DECISIONS rows not built (mobile menu), Omar decides |
| navbar | 7 state bar size | fixed feb5d1ba (small card bars, none sticky) |
| navbar | 8 focus-visible ring | kept: the ring is on the brand link, the focusable element (audit: preferred) |
| navbar | 9 Try it list | library: size, bordered, collapsible |
| navbar | 10 mode switch, Install | shared (job 150) |
| sidebar | 1 stage rail | fixed ff68c1a8 (card rail, stageHeight 19.4) |
| sidebar | 2 state captions and cells | fixed ff68c1a8 (Rail takes aria-label, the strip captions each cell) |
| sidebar | 3 Copy and note | shared (job 150) |
| sidebar | 4 header toggle, current weight | kept: the 24 px toggle (R-5.6-2) and semibold current (component class) |
| sidebar | 5 Try it list | library: variant, width, collapsible, bordered, overlayOnMobile |
| sidebar | 6 checkbox | shared (140) |
| sidebar | 7 mode switch, Install | shared (job 150) |
| sidebar | 8 state rails | fixed ff68c1a8 (rounded border, hover bg-surface) |

## Audit 2 (cloud-reports/audit-r12/job-145-navigation.md, 25 rows)

On fix/r11-pages-145 after preview/r8-all 62ce0c67. Library means a component source or schema change, which this round leaves closed; each is listed for Omar.

| Page | Row | Status |
|---|---|---|
| pagination | 1 stage row 1 2 3 4 5 … 24 | library: listPages keeps the row one length (lib.ts:23-24, :39); Omar decides the window rule or Figma redraws 138:1302; not in DECISIONS, to record |
| pagination | 2 stage height | fixed 0eb4dc79 (stageHeight 19.4) |
| pagination | 3 state cell size | library: CELL_SIZE.xs pads an arrow cell to 30 px (pagination/classes.ts); three pages kept so middle is a middle; the lone centred 4th cell is STATE_CELL, shared with 150 |
| pagination | 4 current page per cell | kept: Figma 138:1388 and 138:1408 drawn wrong (audit: no code change) |
| breadcrumb | 1 hover cell | library: a per-item hover needs items to take link attributes; until then the cell ends on the current Button, or Figma redraws 138:1231 |
| breadcrumb | 2 crumb gaps | fixed bab94a78 (text-xs, 5 px gaps on the list and each item) |
| breadcrumb | 3 caret after the house | library: index.tsx:57 draws a caret before every crumb but the first; the showHome bullet in DECISIONS to extend, or Figma redraws 138:1173 |
| breadcrumb | 4 collapsed Docs in 9 px mono | kept: Figma slip in 138:1236 (audit: no code change) |
| tabs | 1 focus-visible ring over the bar | library: the inset ring (FOCUS_RING_INSET, tabs/classes.ts:45) because the list clips; Figma redraws 138:949 or the library draws it above the bar |
| tabs | 2 stage height | fixed 3f5ee746 (stageHeight 19.4) |
| tabs | 3 lists run together | fixed 3f5ee746 (mx-2 w-max; the strip wraps 3 + 1 as the frame's does) |
| tabs | 4 disabled bar and hairline | library: TABS_BAR and TABS_TAB_DISABLED (tabs/classes.ts:33-34, :54) |
| tabs | 5 tab size | fixed 3f5ee746 (md, now the strip wraps) |
| accordion | 1 trigger boxes | library: Accordion has no size prop (R-5.7-2) |
| accordion | 2 stage height | fixed b1a585ac (stageHeight 15.6); pt-1 kept for the ring room (audit) |
| accordion | 3 open cell caption | fixed b1a585ac (-my-3 on the open section); title "Open question" kept: two open regions named Question fail axe landmark-unique when the last item opens |
| accordion | 4 disabled box | library: ACCORDION_ROOT has no disabled look (classes.ts:8); a demo opacity on the root would dim the trigger twice |
| stepper | 1 digits | kept: one-step lists number from 1 (audit: Figma to redraw) |
| stepper | 2 mark position | fixed 06cce276 (*:gap-0 on each state stepper) |
| stepper | 3 connector ends | kept: Figma auto-layout effect (audit: no code change) |
| navbar | 1 stage height | fixed 9baf7480 (stageHeight 15.6) |
| navbar | 2 stage tile and actions | fixed 9baf7480 (13 px palette in a p-0.5 tile, 16 px brand gap, xs bell button, xs avatar) |
| navbar | 3 state bar size | fixed 9baf7480 (132 px bars, px 8, plain tile, 12 px mono name; the frame's 8 px type is under the 12 px floor of the type scale) |
| navbar | 4 focus-visible ring | kept: the ring is on the brand link, the focusable element (audit: Figma to redraw) |
| sidebar | 1 header and current link | library: SIDEBAR_HEADER pb-1.5, the rail gap-1 and SIDEBAR_LINK_STATE.current font-semibold (sidebar/classes.ts:28, :82); the 24 px toggle stays (R-5.6-2) |
