# Cloud jobs, round 12: the follow-up PR after #183

Started 06:30 UTC 2026-10-22 from the laptop's plan (Omar's word, 05:5x UTC): "Next, after the merge: one follow-up PR from main with 144b steps 2 and 3, 150's confirmation commit d7749569 and the rows marked library across the round-11 statuses, same rules, the laptop gates it." PR #183 merged into main ad3e1a8c at 06:01 UTC (tree = ebb6a5f2).

Rules (Omar's, verbatim): every job pushes only its own branch. Never push to main, never open a pull request, never merge, never force-push. Every commit is by OmarAbed16 <OmarFathiAbed@gmail.com>, one line, no trailer, no Claude or AI mention anywhere. Round-12 additions (the laptop, Omar's word): Vercel is rate limited for up to 24 hours, so a branch is pushed exactly once, when it is ready to merge, never in small steps; progress goes to the lead by message, and a job's row here is written with its one push. Any branch that touches packages/topclassui runs the library e2e for the components it touched before pushing, and the full pnpm check with the real output. The lead merges every finished branch into preview/r12-followup (from main ad3e1a8c) with plain one-line merges and pushes it when it is complete; the laptop runs the final Windows pnpm check and docs:check on it and opens the one PR.

Scope and the lead's reading of "the rows marked library": every round-11 status row whose status says library, kept-library or left for Omar with a component-source cause, grouped by component family below. What stays out, recorded on the rows as "kept, DECISIONS 2026-10-19": the Try it props the frames draw with nothing behind them (the "Not built, for Omar" lists of DECISIONS 2026-10-19 and the Try it prop lists of 141, 144 and 145), the pagination window rule, the navbar mobile menu, the file-upload per-file status API, the date format, and every row Omar's own call closes. A job that finds a row needs a new public prop beyond those named here builds it only when the frame's own Try it draws it and R-5.7 asks for it (Accordion size), and otherwise records it for Omar with a status. Each row gets one status: fixed (commit), already fixed (commit), kept (the DECISIONS line), or for Omar (why).

| Job | Branch | Base | Tip | Commits | Gates | What is left for Omar |
| --- | --- | --- | --- | --- | --- | --- |
| 144b TooltipProvider (step 2) and the toast, banner strip rows (step 3) | fix/r11-pages-144b | main ad3e1a8c | - | - | - | - |
| 150 the confirmation commit d7749569 | fix/r11-card-shell | preview/r8-all ebb6a5f2 (= main's tree) | d7749569 | 85f6b511, 4834d5f8 | docs gates green, e2e 756/757 | the footer link wording; the navbar current section (DECISIONS line); a CodeBlock icon prop (job 152) |
| 147 the ocean corners test fix 50d54768 (test only) | fix/r11-light-ocean | preview/r8-all ebb6a5f2 | 50d54768 | 50d54768 | site + seo + guides 279/279, the test alone 14/14 | the laptop's call whether it rides this PR |
| 152 library data: table, tree-view, code-block, empty-state, badge | fix/r12-library-data | main ad3e1a8c | - | - | - | - |
| 153 library fields: combobox, date-picker, file-upload, segmented-control, otp-field, select | fix/r12-library-fields | main ad3e1a8c | - | - | - | - |
| 154 library display and overlays: tag, avatar-group, skeleton, card, dropdown, command, popover demo | fix/r12-library-display | main ad3e1a8c | - | - | - | - |
| 155 library navigation: pagination, breadcrumb, tabs, accordion, sidebar | fix/r12-library-navigation | main ad3e1a8c | - | - | - | - |
| lead: preview/r12-followup | preview/r12-followup | main ad3e1a8c | - | - | - | - |

## Job 152, library data (fix/r12-library-data)

Rows (from cloud-reports/audit-r11/job-143-data.md and audit-r12/job-143-data.md statuses in round-11.md, the guides and getting-started audits):
- table 8: the stage badges are 22 px where the frame draws 19: Badge's xs step (badge/classes.ts), to the Badge frame's xs.
- table 1 and tree-view 1: the states strips need a forced hover on Table and a forced focus-visible ring on TreeView to draw those cells at rest; one mechanism for both, a data attribute the classes read, with a DECISIONS line; the live ring stays proved by e2e/keyboard-tree-view.
- tree-view 5: the caret and the item icon are muted where DECISIONS "the caret and the item icon take the body colour" says body; fix to the decision.
- tree-view 7 (audit 1) and 5 (audit 2): the loading cell box, tree-view/classes.ts TREE_VIEW_NOTE_KIND.loading, to the frame.
- tree-view 7 (audit 2): the empty cell wraps, TREE_VIEW_NOTE_KIND.empty p-6, to the frame.
- code-block 1 (audit 2), guides audit 2 rows 4, 5, 4, 6, 9 and getting-started row 20: CodeBlock always draws the terminal icon before a title; an `icon` prop (R-7-2: the server half resolves an IconName, the client contract carries ReactNode; `null` draws none), and the site's fences and code cards pass what the frames draw (file-name titles without the terminal icon where the rows say so).
- empty-state 1 (both audits): a borderless, unpadded EmptyState option, the frame's Try it `bordered`, default the current look.
- Record, not build: tree-view 4 unboxed strip cells (DECISIONS "TreeView draws its states as the previewer does"); Table pageSize, CodeBlock theme, maxLines and lineNumbers (DECISIONS 2026-10-19).

## Job 153, library fields (fix/r12-library-fields)

Rows (from the 141 and 140 statuses in round-11.md):
- combobox 3: the placeholder is clipped because COMBOBOX_INPUT_END (pe-9) applies always (combobox/client.tsx:88); apply it only with an end adornment.
- combobox 5 (audit 2) and 8 (audit 1): the glass position, COMBOBOX_SEARCH and COMBOBOX_INPUT_START, to the frame.
- date-picker 3: firstDayOfWeek takes `.int()` in schema.ts.
- date-picker 4: the trigger's w-32 cuts "Sep 22, 2026" to an ellipsis (R-5.2-7); size the trigger to its longest value or record.
- date-picker 1: the stage cannot draw the calendar open because the root hardcodes modal="trap-focus" (client.tsx:38); give the stage a way (a `modal` prop with the trap as default, or a static calendar panel the stage can render inert), record the choice in DECISIONS.
- file-upload 4 (audit 2) and 6 (audit 1): a compact zone option, the frame's mini zone (padding, icon and title live on the zone).
- file-upload 1: drag-over and error cannot be drawn at rest; a hook (the data-dragging attribute the zone already reads, and a refused row the demo can supply) so the states strip draws them.
- segmented-control 5: the disabled track, SEGMENTED_ROOT and SEGMENTED_ITEM, to the frame.
- segmented-control 4: no selection is impossible (types.ts:17 requires a value; tried and reverted in round 10, b380bed): a DECISIONS entry, no code.
- otp-field 4 (audit 1) and 3 (audit 2): validationType joins schema.ts and constants.ts (the component already takes it), with a Try it control.
- 141's library item (23:05 UTC): the select, combobox and date-picker playgrounds take a `stage` prop and draw their popup open inside their own root, as dropdown/dummy/playground.tsx does, so the site can set stageOpen for the three (apps/docs/content/components/{select,combobox,date-picker}.ts).
- Record, not build (DECISIONS 2026-10-19 and Omar's calls): input `type` as a select and `variant`; textarea, select and combobox `variant`; segmented-control `tone` and `orientation`; rating `precision`, `showValue`, `allowClear`; date-picker `mode`, `clearable`, `showWeekNumbers` and the en date format; file-upload `accept`, `multiple`, `showList`, the maxSize presets, the initial-files and per-file status API; otp-field's idle and partly-filled rest rings.

## Job 154, library display and overlays (fix/r12-library-display)

Rows (from the 142, 142b, 144, 147, 148 and 151 statuses in round-11.md):
- tag 2 (audit 2): TagRemovable's x sits 13 px from the label because tag/classes.ts REMOVE_SIZE keeps the 24 px target; an inline-start pull on the target so the gap reads as drawn, or a DECISIONS line recording the gap as the price of the target.
- tag 1 and 2 (audit 1): Try it: TagRemovable needs a client playground (onRemove) so Try it can offer removable; Tag `disabled` is built only if the Tag frame draws a disabled state, else recorded.
- avatar-group 1: the +N counter's ring is beaten by GROUP_RING (avatar-group/classes.ts): ring-primary-soft! on the counter or GROUP_RING scoped with not-data-counter.
- skeleton 1: `animate` and `rounded` from the frame's Try it: schema, constants and playground, or the DECISIONS.md:284 list if the frame draws nothing behind them.
- card: THE CODE keeps the report sample while Try it changes because card/dummy/playground.tsx passes no props through; pass them.
- 147: the library Skeleton rect and the card pills in ocean (named in cloud-reports/audit-r11/job-147-modes.md): check against the frames in ocean, fix or record.
- dropdown (144): DROPDOWN_ICON draws the menu icons muted where the frame draws them in the body colour; fix to the frame.
- command (144): COMMAND_INPUT px-2: the frame's query starts 10 px after the icon; fix to the frame.
- popover (148): popover/dummy/placements.tsx keeps three columns at 504 px inside a 326 px stage: w-full max-w-[31.5rem].
- Record, not build: Card `variant` and `padding`, Badge `dot`, `uppercase`, `truncate`, Avatar `shape`, `bordered`, `status`, `clickable`, AvatarGroup `spacing`, `showCount`, `bordered`, Separator `spacing`, Kbd `variant`, `size`, `muted`, Tag `variant` and `truncate` (DECISIONS 2026-10-19); Kbd disabled text (DECISIONS 2026-10-22); the 144 Try it lists (alert, banner, toast, dialog, command, drawer, dropdown, popover, tooltip; DECISIONS 2026-10-19); tag/dummy/link.tsx's bare chip (lead call, for Omar); avatar-group discs 40 (R-5.7-2).

## Job 155, library navigation (fix/r12-library-navigation)

Rows (from cloud-reports/audit-r11/job-145-status.md on main and the 145 row in round-11.md):
- pagination 3: CELL_SIZE.xs pads an arrow cell to 30 px (pagination/classes.ts); the xs cell to the frame.
- breadcrumb 3: index.tsx draws a caret before every crumb but the first, so with showHome (151) the house is followed by a caret as the frame 138:1173 draws or not; check the frame row and 151's DECISIONS bullet, fix or extend the bullet.
- breadcrumb 1: a per-item hover needs the items to take link attributes; check what BreadcrumbItem accepts today and give a link item the hover the frame draws.
- tabs 4 and 9: the disabled bar and its hairline, TABS_BAR and TABS_TAB_DISABLED (tabs/classes.ts:33-34, :54), to the frame.
- tabs 1 and 6: the focus ring is inset (FOCUS_RING_INSET, tabs/classes.ts:45) because the list clips; draw it above the bar if the list can stop clipping without breaking the scroll, else a DECISIONS line.
- accordion 1 and 3: Accordion has no `size`, and R-5.7-2 asks for it on every component with a visual scale: add `size` (xs to xl and custom, default md) with the trigger boxes the frame draws, data-size, skeleton, schema, types, README.
- accordion 4: ACCORDION_ROOT has no disabled look (classes.ts:8); a disabled item dims once, not the trigger twice.
- sidebar 1: SIDEBAR_HEADER pb-1.5, the rail gap-1 and SIDEBAR_LINK_STATE.current font-semibold (sidebar/classes.ts:28, :82); the 24 px toggle stays (R-5.6-2).
- Record, not build: the Try it lists (pagination `shape`, `showFirstLast`, `showPrevNext`; tabs `orientation`, `fullWidth`, `disabled`; accordion `type`, `variant`, `collapsible`; stepper `orientation`, `activeStep`, `clickable`, `showConnector`, `compact`; navbar `size`, `bordered`, `collapsible`; sidebar `variant`, `width`, `collapsible`, `bordered`, `overlayOnMobile`), the pagination window rule (Omar or a Figma redraw), navbar's mobile menu and rounded corners, sidebar's card border (DECISIONS 2026-10-19).
