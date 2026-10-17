# Figma facts for Unit 5

The last unit. It builds the five cards of the site's 46 that no unit has built yet,
DatePicker, FileUpload, TreeView, Stepper and CodeBlock, and three pieces from outside the 46
that the earlier units left open: Field (with FieldLive), Form (with FormAction) and Meter.
The build order is Meter, Stepper, CodeBlock, Field, Form, FileUpload, TreeView, DatePicker:
the order of risk, not the order of the catalog. Once this unit and the second half of Unit 4
are merged, all 46 cards are built.

Read `docs/figma/unit-1.md` first: its section "How to use this file" applies here unchanged,
except that no component branch edits `scripts/mutations/index.ts`. Then read three sections
of `docs/figma/unit-3.md` ("What the reviews of Unit 2 found", "What Dialog settled", "Rules
for all fourteen") and two of `docs/figma/unit-4.md` ("What Units 1 to 3 taught a form
control", "Rules for all ten"). Everything they say still applies unless this file says
otherwise. Where a rule in "Rules for all eight" below and a rule there disagree, the rule
below wins.

The brief every builder is handed (`U3-BUILD.md`) applies with five things changed:
`unit-3.md` is this file; "Rules for all fourteen" is "Rules for all eight"; the template is
the finished folder named in "Rules for all eight" for each kind; the port is the one the lead
gives, from 4580 up (4517 to 4570 belong to another session); and one builder runs at a time
unless Omar says otherwise (see Build order).

**Read this instead of Figma.** File `BxRSdAVOhk9Hj3Tkq4tjcy`, read on 2026-10-14 by one
reader, read-only, 24 plugin calls (23 returned; one was refused for its size and wrote
nothing): the five docs previewers of the candidates in `Docs site - LTR` (133:148) and their
copies on the Components page (438:2388), their drawings on the Components page, the Progress
and EmptyState drawings, the Button docs frame, and the pages Accessibility, Add with the CLI,
Your first component and Connectors. Text, layer and variable facts only, no screenshot. The
planner of this file did not open Figma: every facts block is that reader's note, trimmed.
Three of the eight are not drawn at all (Meter, Field with FieldLive, Form with
FormAction): for those the design source is this file, and the block says so. Where a fact looks wrong,
build from the Build this block and say so in the pull request.

Each component has the two parts of the earlier files: the facts in a fenced block, and
**Build this**, which wins where the two disagree. Each Build this block holds the
component's `classes.ts` as a fenced block. Copy it: every string in it compiles with the
repo's stylesheet and passes the repo's lint as a `classes.ts` (see "What was checked").

## What Unit 5 builds, and what is left of the 46

The 46 are the 46 cards of the home page catalog (192:1905) and of `Docs site - LTR`; the
rules reader extracted them by name and the two lists agree. `docs/DECISIONS.md` 2026-10-07:
the site's 46 is the build list.

| Candidate | Among the 46 | Decision | Overruled by |
|---|---|---|---|
| DatePicker | yes (Forms, C) | built | - |
| FileUpload | yes (Forms, C) | built | - |
| TreeView | yes (Data, C) | built | - |
| Stepper | yes (Data, Sp) | built, as a server component | choice 10 |
| CodeBlock | yes (Display, Sp) | built, with no highlighter dependency | choices 12 to 14 |
| Field and FieldLive | no | built: eleven card samples, "Your first component" and two open clauses of Phase 4 need them | choice 1 |
| Label | no | not an export: it is Field's `label` prop. No card and no text in the file names a Label component | choice 1 |
| Form and FormAction | no | built, with Field | choice 1 |
| Meter | no | built: `docs/CLOUD-PLAN.md` Unit 5 names it, PLAN 18.2 and 18.11 promise its `min`, `max` and clamp, and `progress/boundaries.ts` sends a custom range to it | choice 2 |
| ErrorState | no | not built: TreeView and FileUpload take no `error` status | choice 3 |
| ErrorBoundary | no | not built: waived for TreeView and FileUpload, as it was for Command and Combobox | choice 3 |
| IconButton | no | not built: no Unit 5 component may import it, and each draws its own icon buttons with `ICON_BUTTON` | choice 4 |
| Heading, Text, Container, Stack, Grid | no | not built: CLOUD-PLAN's default answer is no | choice 5 |
| CopyButton, Calendar, DateRangePicker, AdaptiveDatePicker, Fieldset, CheckboxGroup | no | not built; named so that nobody builds one by accident | - |

**The count.** 46 promised. 36 are built on the merged read base (`u5-read`, local branch
`u5/read-base`: main, Unit 3, the first half of Unit 4 and every Unit 4 shared piece). Five
are being built in the second half of Unit 4 (Slider, NumberField, OTPField, Select,
Combobox). Five are built here. After both: **46 of 46, none left.** Field, Form and Meter
are three more components outside the 46; with the folders `icon`, `svg` and
`icon-registry`, `src/components` will hold 52 folders.

## What was checked, and what was not

Checked on 2026-10-14 and 2026-10-15 against the read base `u5-read` (local branch
`u5/read-base`, head `d4bdb61`), with Base UI 1.8.0, Tailwind 4.3.3, happy-dom 20.14.5,
Node 22.14.0, React 19.3.0 and Playwright's Chromium. Nothing was written into that
checkout. Three passes: the planner's, three reviews of the planner's draft, and a final
edit that checked each blocker and major before it changed this file and then ran the
file's own verification again. The scripts are in the lead's handoff folder: the planner's
under `unit-5/scratch-plan/`; the readers' under `unit-5/scratch-figma/`, `scratch-baseui/`,
`scratch-code/` and `rules-scratch/`; the reviewers' under `scratch-acc/`, `scratch-bui/`
and `scratch-review-everyone/`; the final edit's under `scratch-final/`.

By the four readers, whose notes are in `handoff/unit-5/`:

- **Figma** (`figma-facts.md`): 24 read-only plugin calls, as the header says. No screenshot.
- **Base UI** (`base-ui-notes.md`): the server HTML in Node and the same tree hydrated in
  happy-dom for Field, Fieldset, Form, Meter, Progress, Collapsible, Toolbar, ScrollArea,
  Toggle, Button and Input, and Field around the five Unit 4 controls on the base; plain
  forms with a file input submitted in Chromium 153 with no script; `Intl` in Node 22.14.0
  (ICU 76.1) and Chromium 153; the registry sizes of the candidate dependencies.
- **Code** (`code-notes.md`): read every shared module; compiled and custom-linted the
  candidate classes; ran `npx tsx scripts/readme-build.ts --check` (three stale READMEs).
- **Rules** (`rules-notes.md`): the 46 by name from two Figma frames (three calls); every
  rule, PLAN section and DECISIONS entry that touches a candidate.

By the planner, and run again by the final edit on this file as it now stands (the numbers
are the final edit's):

- **Classes.** The seven fenced `ts` blocks were read back out of this file and evaluated
  against the repo's `src/shared/classes.ts`: 77 constants and 224 distinct classes, each
  compiled alone with `compileCss` from `scripts/lib/harness.ts`. All produce a rule except
  the three group markers (`group/zone`, `group/tree`, `group/row`), each of which is read by
  a variant that does. No constant takes the name of a shared one. No inline-code class in
  the prose is missing from the blocks. The repo's `cn()` run over every constant drops no
  class, so none holds two classes for one property.
- **Lint.** Each block, with the shared names it reads imported, through the repo's own
  ESLint config, typed rules included, as `src/components/popover/classes.ts`: 0 messages
  for all seven. `npx eslint --stdin --stdin-filename src/components/popover/classes.ts`
  exits 0 on two of them. The same blocks named `index.tsx` get 4 errors from
  `shared-class-constants`: `rounded-full` (Stepper), `h-5` (Field), and the two
  hand-written states recorded as departures, `hover:` (CodeBlock) and `focus-visible:`
  (TreeView). Keep every string in a `classes.ts`.
- **The root-part lint.** `Field` declared in `index.tsx` with `FieldLive` re-exported,
  `FieldLive` alone in `client.tsx`, and `Form` with `FormAction` re-exported: 0 messages.
  The controls: `Field` and `FieldLive` declared in one file, 1 message; `DatePicker` beside
  `DatePickerCalendar` in one file, 1 message (so the calendar is a part of its own).
- **Cascade.** The emitted order of each pair that sets one property on one element:
  `aria-selected:` and `data-selected:` fills come after `hover:` and `active:`, so a
  selected row or day keeps its fill under the pointer; `data-dragging:` borders come after
  `has-aria-invalid:`; `group-aria-selected/row:` text comes after `text-muted`.
- **Base UI.** 73 names in the installed types and built files: the seven popover parts
  (with `Close`) and every prop this file gives them, `'trap-focus'` and the type comment
  that asks for a `Close` with it, `focusManagerModal = modal !== false && hasClosePart` in
  `PopoverPopup.js`, the trigger's focus guards when it is false, the popup's
  `role: 'dialog'` and its `aria-labelledby` from the title, the trigger's
  `aria-haspopup`, the parts of `field`, `fieldset`, `form` and `meter`, `'use client'` at
  the top of Meter, Field and Form, `internals/composite`, no `dispatchEvent` in
  `SelectRoot.js`, and no calendar, tree, stepper, file or code export.
- **Names.** 176 names: every shared constant, hook, helper, contract, label key, token,
  icon and file this file leans on exists where it says, and every one a shared pull
  request creates (two label groups and nine keys, three tokens, `form-errors.ts`) does not
  exist yet. Among them, what the reviews made the file lean on: `useId` in the server
  `index.tsx` of Table, Tag and Textarea; `textarea.demos.rsc.test.tsx`, and none for
  Progress; Rating's `lib.ts` and its shared `parts/rating-star.tsx`, tested as `rating.lib.test.ts`; Timeline's
  `role="list"`; the `askedAt.current === count` guard of `useCollection`; Command's
  `hook.ts` imported by both `client.tsx` and its lazy part; `--color-ring` read through
  `@theme inline`; `common.close` and `common.required`; and react-dom 19.3.0's
  `requestFormReset` before a function action. The five controls of Unit 4's second half
  are not on the base, and each has its section in `unit-4.md`.
- **`Intl`, in Node 22.14.0, where the dom tests run.** `getLabels('ar-u-nu-arab')` keeps
  the tag; `createNumberFormat` prints U+0662 for it and `2` for `ar` and `ar-EG`.
  `Intl.Locale` week info: `en` 7, `en-GB` 1, `ar` 6, `ar-SA` 7, `ar-EG` 6, `he` 7, through
  the `weekInfo` getter; `getWeekInfo` is undefined there. `Date.UTC(1, 0, 1)` falls in 1901
  and `setUTCFullYear` gives year 1. The dates quoted in DatePicker. `fa` defaults to the
  Persian calendar. `en` formats 2.4 megabytes as "2.4 MB" and 512 kilobytes as "512 kB";
  300 bytes as "300 byte" in the short form and "300 bytes" in the long. A `process.env.TZ`
  set at run time takes effect at once: `2026-10-14T22:30:00Z` is the 15th by `getDate()` in
  `Asia/Riyadh` and the 14th by `getUTCDate()`.
- **happy-dom 20.14.5** has `DataTransfer` and `File`, and an assigned `input.files` keeps
  its two files.
- **Static layout in Chromium** (one browser): the blocks on hand-written markup that follows
  each Build this block, with the repo's page shell, stylesheet and `cn()`, the three new
  tokens set inline, at 320 px with a coarse pointer and at 1280 px, in LTR and RTL:
  - Stepper at `xs`, `md` and `xl`: marks of 24, 32 and 48 px; every connector starts and
    ends on the centres of its two marks and sits level with them (0 px off); in RTL the
    first step is at the right. Six steps with 40-character titles at 320 px never scroll
    the page sideways; the titles wrap.
  - The calendar: the popup 280 x 274 px at 1280 and 280 x 354 at 320 coarse; the smallest
    day 31.1 x 32 px, and 31.1 x 44 under a coarse pointer; the 1st of September 2026 in the
    second column from the inline start in both directions; no sideways scroll. Measured
    again by the final edit with the header as it now is (previous, title, next, close):
    the same two heights; the three buttons 24 px, 44 coarse; the title 150 px wide on one
    line at 1280, and 90 px on two lines at 320 coarse, where "September 2026" and a longer
    month wrap and nothing is cut.
  - The tree: rows of 40 px, 44 coarse; the caret 17, 35 and 53 px from the tree's inline
    start at levels 0, 1 and 2, in both directions; a 300-character label scrolls nothing
    sideways. The final edit: Tab onto the tree with no highlighted row draws the tree's
    own ring (solid, 2 px); with a row holding `data-highlighted` the tree's ring goes and
    the row's shows, in both directions.
  - FileUpload: the input fills the zone inside its 1 px line; the zone is 152 px tall; the
    remove button 24 px, 44 coarse; a 300-character name scrolls nothing sideways. The final
    edit: the hidden status line is placed absolutely, and the root is as tall with a
    refusal in it as without.
  - CodeBlock: a 300-character line scrolls inside the `<pre>` and the page does not, alone,
    in a grid track of `1fr`, in a `flex-1` column and in a table cell, in both directions;
    in RTL the code still starts at the left of the `<pre>` and the button sits at the left,
    the inline end; the button is 44 px under a coarse pointer. The final edit, with the
    shared rings: in Light and Dark the `<pre>`'s ring and, once its 150 ms transition has
    run, the button's ring are the block's text colour (`--tc-ring` reads `#fff` on the
    button in Light); one cold read under Playwright's `isMobile` caught the button's ring
    mid-transition at its 70% text colour, and the same case read white on a second run and
    with reduced motion.
  - Field with `inline` and a 300-character label: the box first, the hint under the label,
    no sideways scroll, in both directions.
  - Meter: 512 of 1024 fills half the track from the inline start in both directions; `md`
    is 6 px tall.
- **ASCII.** The file holds no character outside ASCII, no carriage return and no tab.
- **Three reviews of the planner's draft.** Three reviewers read it, each through one lens
  and each with scripts of its own against the same base: 37 findings, three blockers,
  fifteen majors, nineteen minors.
  - *Is it accurate?* Found: Field's `lib.ts` beside a `lib.tsx` cannot work (`./lib.js`
    resolves to `lib.ts`; the two compile to one `lib.js`; probed with the repo's `tsc`);
    `modal="trap-focus"` traps nothing without a `Close` part (read in `PopoverPopup.js`);
    CodeBlock wrote its own rings and hover; Field's ids clashed when one form is rendered
    twice; five slips (a key count, a bound's purpose, a string count, a test file Progress
    does not have, what `unit: 'byte'` prints).
  - *Does it work for everyone?* It rendered the built controls with the control object,
    ran axe on server HTML and dispatched events in happy-dom. Found: React 19 resets a form
    after every function action, so FormAction erased what was typed; one name on several
    Fields gave several controls one id; a required DatePicker was never heard as required;
    a scripted value fires no event, so FieldLive kept a fixed error; the focus after errors
    landed on a radiogroup that takes none; the `<ol>` and `<ul>` lost their list in Safari
    with VoiceOver; a refused file was silent; the tree drew no ring before hydration or
    after a wheel, and named an id no element had; today was left to UTC; and four small
    gaps (the clipboard outside a secure context, five copy buttons with one name, the order
    of FileUpload's descriptions, month buttons with no type).
  - *Can a builder with no memory build from it?* Found the same ids, events, list role and
    today, and: DatePicker had none of the layout and no-provider fixtures unit-4.md gives a
    field; a tree's `loadMore` would be asked twice when a branch opens near the end
    (`useCollection` guards on the visible rows); what a server `Form` cannot show with no
    script; and small gaps in the Not built lists, a test set, the lazy claim (`hook.ts` and
    `lib.ts` load with the trigger, as in Command) and a value outside the range.
- **The final edit.** It checked the three blockers and the fifteen majors before it changed
  anything: by running a reviewer's probe again (the `lib` pair through `tsc`, the server
  HTML of the built controls with the control object), by reading the cited line (the
  close-part condition and the trigger's focus guards, `startHostTransition`, the guard of
  `useCollection`, Timeline's role, `SelectRoot.js`, unit-4.md's fixtures, `guardEscape`)
  or by a run of its own (`Intl` for bytes, `TZ` at run time). All eighteen held. Two parts
  of the proposed fixes did not, and were left out: keeping Field's ids from the name with
  no `useId` (one name on several Fields is common, and three server files on the base
  already call `useId`), and `guardEscape` on DatePicker's root (it guards an Escape meant
  for a tooltip inside the popup; the calendar holds none, and Select's in-dialog case
  passes without it). Where two reviewers proposed different fixes for
  one fault, the file takes one and says why: Field's ids from `useId` (choice 33), and
  FieldLive's error cleared by comparing the field's entries after any `input`, `change`,
  `click` or `keyup`, with DatePicker and FileUpload dispatching `input`, since Base UI's
  Select dispatches nothing. Then it ran this file's verification again: the classes, the
  lint, the Base UI names, the shared names, ASCII, and the static probe above for what
  changed.

Not checked. Say so in the pull request when one of these turns out wrong:

- Figma itself, by anyone but the first reader. No candidate is drawn in Dark, Ocean or
  Arabic.
- No component was built or rendered. The layout probe is markup written by hand: no React,
  no Base UI, no hook, no positioning (the popup's `--available-width` was set by hand to
  304 px).
- No behaviour was run: the keys, the focus, the lazy calendar, drag and drop, the
  clipboard, `useActionState`, the windowing of a tree, the reset cases, a popover with
  `modal="trap-focus"` around a lazy child whose `Close` part mounts after the popup opens,
  FieldLive's comparison of entries, the `input` events DatePicker and FileUpload dispatch,
  React's form reset in a browser (read in the react-dom source, not run), FormAction's
  focus moving into a radiogroup, and the tree's `loadMore` guard.
- Two measurements are a reviewer's and were not repeated here: axe's `aria-allowed-attr`
  on a button with `aria-required`, and `aria-valid-attr-value` on a dangling
  `aria-activedescendant` (`scratch-review-everyone/axe-probe.mts`).
- Next.js: a Server Action, the response it renders with no script through
  `useActionState`, the `enctype` React writes for a function action, a file posted through
  a Server Action.
- Firefox, WebKit, a real phone, a screen reader. Week info in Firefox and WebKit. Whether a
  browser's ICU prints the trigger's date as Node's does. Whether a screen reader reads the
  hidden "required" word of a DatePicker, and the list role of the `<ol>` in Safari with
  VoiceOver (the reason is Timeline's comment, not a run).
- Contrast that `check-contrast` does not measure: primary/on-soft "Browse" on base/surface,
  danger/on-soft errors on the page, the 70% header text, the copy button's 10% hover tint
  and the on-solid rings on neutral/solid, in the three modes. Each block's spec measures
  them with `e2e/pixels.ts`.
- Bundle sizes: `pnpm size` does not exist, and the chips are budgets.
- The nine Arabic strings of shared pull request 1 were written by the lead and read by no
  second Arabic speaker: Omar reads them in that pull request.
- Unit 4's second half is not on the base: what Field says of Slider, NumberField, OTPField,
  Select and Combobox comes from their Build this blocks.
- The readers' own lists of what they did not check apply to the facts they report.

## What Units 1 to 4 taught

Only what changes how these eight are built. The long forms are in the earlier files and in
`handoff/LOG-2.md`.

- **Base UI names nothing on the server.** Field.Label, Fieldset.Legend and Meter.Label
  link their names in an effect, and a caller's `id` on `Field.Control` is dropped from the
  server HTML (measured by the Base UI reader). `e2e/axe.spec.ts` reads the server HTML. So
  Field writes its own `<label for>`, ids and `aria-describedby`, and Meter writes its own
  `role="meter"`, as Progress writes `role="progressbar"`.
- **The shared static specs run before hydration, on every demo.** The target selector
  (`scripts/lib/targets.ts`) measures every `input` that is not both `aria-hidden="true"`
  and `tabindex="-1"`. So FileUpload's file input stays a real box, and DatePicker's form
  input is both.
- **A popup's classes never reach the static stylesheet**, and neither does a class holding
  `&` or `>`. DatePicker ships `date-picker.css.test.ts` and is tested on the live harness.
- **A portaled part puts `dir` and `lang` from `usePortalLocale()` on its positioner**, and
  its spec opens the RTL demo on the LTR page as well.
- **A windowed list:** every row exactly one unit tall and no `gap` (Command: rows drifted
  2 px a step with one); the two spacers are pseudo-elements reading `--tc-list-pad-start`
  and `--tc-list-pad-end` (Combobox: a padding cannot be capped and grew to 379,436 px); the
  row estimate is measured from the first row; a highlighted row that is not mounted is
  brought in with `scrollToIndex`, whose `'nearest'` shared pull request 8 fixed.
- **A state told by a fill is lost under forced colours, and hue alone is lost to many
  readers.** A selected day, a done step, a selected tree row, an invalid zone each differ by
  a mark, a weight, an underline or a line, and take the system pair behind `forced-colors:`.
- **A box that can hold a scroller is `grid grid-cols-1`**, or a grid or flex parent is
  widened by it. A box that holds an `sr-only` element is `relative` (an `sr-only` label
  grew the Sidebar page by 1,732 px).
- **A field without a width of its own sits in a holder** (`FIELD_HOLDER`): a Select trigger
  in a table cell was 2,324 px wide without one. DatePicker's trigger copies Select's box.
- **A form control holds its value with `useFormValue`.** React 19 resets a form when its
  action settles, and a reset button does the same; without the hook four controls showed
  one value and sent another.
- **A `<p>` that holds a block element is emptied by the parser** and fails hydration
  (Timeline). Field's hint and error are `<div>`s.
- **Digits.** `createNumberFormat(locale)` reads only the tag's `-u-nu-` extension
  (measured in Node 22: `ar` and `ar-EG` print `2`, `ar-u-nu-arab` prints U+0662), and the
  provider passes `latn` unless told otherwise. A client part formats with the provider's
  numbering system; a server half with its `locale` prop.
- **A client half imported only on the branch that needs it** keeps a plain component server
  HTML with no script (Tag, Rating, Banner). CodeBlock copies that: no copy button, no
  JavaScript.
- **The root-part lint reads one file at a time**, and the README generator prints the import
  of `meta.name` for a folder whose index exports no `<Name>Root` (OTPField, Toast).
- **Process.** Every browser test is broken once and seen to fail. A full check that exits 1
  on load timeouts under parallel load is judged by re-running the failing spec alone. A
  session can die mid-proof: a resumed builder reads `git status` and `git diff` first.
- **`src/shared/classes.ts` is 243 lines** (warn at 200, fail at 300). Unit 5 adds nothing
  to it (see "Rules for all eight").

## Rules for all eight

- **Three kinds, and the folder each copies.**

  | Kind | Components | Template | `index.tsx` |
  |---|---|---|---|
  | Server | Meter, Stepper | Progress (Meter), Timeline (Stepper) | the markup; no `client.tsx`, no `hook.ts` |
  | Split | CodeBlock, Field, Form | Tag (CodeBlock imports its client part only when used), Textarea | the server markup, and `export { X } from './client.js'` for the client export |
  | Client | DatePicker, FileUpload, TreeView | Select (DatePicker's box and popup), Switch (the form tests), Combobox and Command (TreeView's window) | re-exports only (`R-5.1-2`) |

  `client.tsx` is markup plus at most one hook call per part (`R-5.12-1`); a part that holds
  client markup starts with `'use client'`, a part shared by both halves has no directive and
  calls no hook but `useId` and `use`; a part exports one component named after its file, is not
  re-exported by `index.tsx`, and its hook calls count in `<slug>.client.test.ts`. `hook.ts`
  writes no type argument in angle brackets. `lib.ts` imports no React; markup both halves
  draw, such as Rating's star or Field's frame, is a part in `parts/`, never a helper in
  `lib.ts`, and there is no `lib.tsx` (`./lib.js` would resolve to `lib.ts` first, and the
  two would compile to one `lib.js`). A folder whose only bounds are shared has no
  `boundaries.ts`. No `variants.ts`: a lookup is a plain object in `classes.ts`. No
  `skeleton.tsx` (see Deferred).
- **Folders, exports and `meta.ts`.** Every export is flat (`R-9.2-3`). None of the eight is
  a family, so none has a `Root` (`R-9.2-4`). Field and Form each export a second name from
  `client.tsx`; the root-part lint reads one file at a time and a re-export line does not
  count, so `Field` in `index.tsx` beside `FieldLive` in `client.tsx` passes (linted, see
  "What was checked"). The README generator prints `import { Field }` and `import { Form }`;
  the hand-written block names both exports, as OTPField's does.

  | Folder | Exports | `meta.name` | Category (PLAN 18) | Tier | `rendering` | `baseUi` |
  |---|---|---|---|---|---|---|
  | `meter` | `Meter` | `Meter` | `media-and-display` | 2 | `server` | `null` |
  | `stepper` | `Stepper` | `Stepper` | `navigation-and-disclosure` | 3 | `server` | `null` |
  | `code-block` | `CodeBlock` | `CodeBlock` | `typography-and-layout` | 2 | `split` | `null` |
  | `field` | `Field`, `FieldLive` | `Field` | `forms` | 1 | `split` | `null` |
  | `form` | `Form`, `FormAction` | `Form` | `forms` | 1 | `split` | `null` |
  | `file-upload` | `FileUpload` | `FileUpload` | `forms` | 3 | `client` | `null` |
  | `tree-view` | `TreeView` | `TreeView` | `data` | 3 | `client` | `null` |
  | `date-picker` | `DatePicker` | `DatePicker` | `forms` | 3 | `client` | `popover` |

  `status: 'beta'` and `optionalDeps: []` for all eight; `baseUiRange: '1.8.0'` for
  DatePicker only, `null` elsewhere. The card titles "Date picker" and "File upload" are
  prose; the install rows "Datepicker" and "Fileupload" are slips.
- **Labels (`R-5.11-1`).** A client part reads `useLabels()` through `hook.ts`. A server
  component takes `labels` (default `en`) and `locale` (default `'en'`), so
  `{...getLabels(locale)}` spreads; where it formats no number it accepts `locale` and drops
  it, as Timeline does. CodeBlock hands its three strings (`common.copy`, `common.copied`,
  `common.copyFailed`) to its client part as props, so a server page's `labels` reach the
  button with or without a provider. Shared pull request 1
  adds the nine keys. No English in markup: the lint reads `aria-label` too.
- **Form participation**, as Unit 4. DatePicker and FileUpload take `id`, `name`, `required`,
  `aria-labelledby`, `aria-describedby` and `aria-invalid` as plain props and put each on the
  right element, so Field's control object spreads onto them with no change. Both take
  `invalid` (default `false`), `disabled`, `form` and a name by type (`ControlName`). Each
  puts a real input in the server HTML and ships `dummy/form.tsx`, read by its spec on the
  static page with `serverEntries` from `e2e/form.ts`. DatePicker holds its value with
  `useFormValue`; FileUpload its list. Each has an `e2e/fixtures/<slug>-reset.tsx`. Each
  writes its form input from script (a value, a file list), which fires no event, so each
  dispatches `new Event('input', { bubbles: true })` on that input after the write: an app's
  own listener and FieldLive then hear the change as they hear a typed one.
- **Values and events.**

  | Component | Controlled pair | Event |
  |---|---|---|
  | DatePicker | `value`, `defaultValue`: `string \| null`, an ISO date `YYYY-MM-DD` | `onValueChange(value)`; and Base UI's `open`, `defaultOpen`, `onOpenChange` |
  | FileUpload | none: a file list cannot be set by a page | `onValueChange(files)`, the accepted files |
  | TreeView | `value`, `defaultValue`: the selected id, `string \| null`; `expanded`, `defaultExpanded`: `readonly string[]` | `onValueChange(id)`, `onExpandedChange(ids)` |
  | Stepper | `value`: the current step's id, display only | none |
  | Meter | `value`, display only | none |
  | Field, FieldLive | none: the control holds its own value | none |
  | FormAction | none: React's `useActionState` holds the state | the `action` it is given |

  `expanded` and `onExpandedChange` are words `R-5.7-1` does not have (choice 28).
- **Sizes (`R-5.7-2`).** Every candidate is drawn at one size with raw numbers. The drawn one
  is `md`, and the builders map it onto the scale this way:

  | Component | `size` | Drawn | Built |
  |---|---|---|---|
  | Meter | yes, default `md` | Progress: track 4, 4, 6, 8, 10 px | `h-pad-y-*`: 2, 4, 6, 8, 10 px, as the built Progress |
  | Stepper | yes, default `md` | circle 32 px | 24, 28, 32, 40, 48 px: one step under the control scale |
  | DatePicker | yes, the trigger | trigger 128 x 40, radius 8 raw | `FIELD_SIZE[size]` in a Select box: an Input's height and width |
  | DatePicker calendar | no | day 34 x 32 | one size: 32 px tall, 44 under a coarse pointer, as wide as its column |
  | TreeView | no | rows 29 px | `--tc-row-height` (40 px, 44 coarse), as Select and Command rows |
  | FileUpload, CodeBlock, Field, Form | no | | no visual scale, as Popover, Command and EmptyState |

  `custom` emits no size class.
- **Direction.** Logical classes only. What stays left-to-right in an Arabic page:

  | What | How |
  |---|---|
  | The code of a CodeBlock | `<pre dir="ltr">`; the header keeps the page's direction |
  | The value a DatePicker submits | an ISO date in an input nobody sees |
  | A file name, a tree label, a step title | `dir="auto"`: it takes its own text's direction |
  | The trigger text of a DatePicker | not forced: `Intl` writes Arabic dates in their own order with U+200F marks |

  ArrowRight and ArrowLeft swap in RTL in the day grid and in the tree; the hook reads
  `useDirection()`, since no Base UI part handles those keys. Indents and connectors use
  logical classes and so mirror by themselves. A directional icon (the carets) flips by
  itself through `Svg`; nothing rotates it (PLAN 5.3).
- **Digits.** A client part formats with `useLocale()` and the numbering system of
  `useNumberFormat().resolvedOptions().numberingSystem`, as NumberField does. A server half
  formats with `createNumberFormat(locale)`, so `getLabels('ar-u-nu-arab')` gives
  Arabic-Indic digits and `getLabels('ar')` Latin ones. The provider keeps its `latn`
  default (choice 30).
- **Imports.** No Unit 5 component imports another. `#components/svg`, a per-icon import
  from `#icons/data/`, the shared modules, and anything in `dummy/`, `test/` and
  `e2e/fixtures/` are allowed. A demo may import other components: DatePicker's and
  FileUpload's `in-field` demos import Field.
- **State and errors (`docs/PLAN.md` 8.2).** TreeView takes `status`: `idle`, `loading`,
  `loading-more` or `empty`. No component here takes `error`, renders an ErrorState or wraps
  itself in an ErrorBoundary: Command and Combobox shipped the same way (choice 3). A
  per-component state file, when one is ever needed, exports `<Name>EmptyState` or
  `<Name>ErrorState` (the root-part lint exempts both suffixes), so it never collides with a
  shared `ErrorState` (`docs/DECISIONS.md` 2026-10-02 item 5).
- **Collections (`R-8.5-1`).** TreeView's collection is its flattened visible rows, windowed
  by `useCollection`, with `visibleRows` and `loadMoreThreshold` clamped to the shared
  `COLLECTION_BOUNDARIES` (1 to 20, 0 to 200). Command's own 1 to 100 stays Command's. The
  FileUpload list renders every row: `maxFiles` caps it at 100 (choice 25).
- **Tokens and shared classes.** Every `--tc-*` a component reads is declared in
  `src/tokens.css` (`R-4-2`): shared pull request 2 adds three. Unit 5 adds no constant to
  `src/shared/classes.ts`: nothing here is used by two components. When a later piece needs
  one, it goes in a new file named `classes.ts` in a folder under `src/shared` (for example
  `src/shared/forms/classes.ts`, imported as `#shared/forms/classes.js`): the lint's
  exemption reads the base name `classes.ts` and nothing else (`eslint-rules/index.ts`, the
  `shared-class-constants` rule), `check-structure` walks only `src/components` and
  `src/connectors`, and `@source "./shared"` scans every folder under it.
- **Demos.** One per file. Every control in a demo is named and valid as server HTML. No demo
  writes `tabIndex`. `rtl.tsx` wraps itself in `TopClassProvider` with `direction="rtl"` and
  `locale="ar"` (a server one spreads `getLabels('ar')`). Each block lists its demos;
  anything else a test needs is a fixture in `e2e/fixtures/<slug>-<what>.tsx`, with inline
  styles only. The two fields, DatePicker and FileUpload, each have `<slug>-layouts.tsx` as
  unit-4.md's ten do: alone as a grid item, in a wrapper in a grid track, in a `flex-1`
  column, in a `w-fit` parent, in a table cell and in a label row. DatePicker, a trigger
  that copies Select's box, adds Select's two side by side (a grid written `1fr 1fr`, a flex
  row, one beside a label in `auto 1fr`) and `date-picker-no-provider.tsx`.
- **Tests.** The file set of the template of each kind, by suffix:

  | Kind | Files |
  |---|---|
  | Server (Progress; `.demos.rsc.test.tsx` copied from Textarea, since Progress has none) | `.test.tsx`, `.compile.test.ts`, `.types.test.ts`, `.schema.test.ts`, `.meta.test.ts`, `.styles.test.tsx`, `.dom.test.tsx`, `.hydration.dom.test.tsx`, `.demos.ssr.test.tsx`, `.demos.rsc.test.tsx` |
  | Split (Textarea) | the server set, and `.client.test.ts`, `.exports.test.ts`, `.css.test.ts`, `.demos.dom.test.tsx`, `.lib.test.ts` where there is a `lib.ts` or a `lib.tsx` |
  | Client (Switch) | the split set, and `.keyboard.dom.test.tsx` and `.form.dom.test.tsx` where the block names keys or a form |

  Then one `e2e/<slug>.spec.ts`: the static page for what the server HTML promises, the live
  harness (`openLive`) for anything scripted. Wherever the server HTML claims to submit
  (DatePicker, FileUpload, Field, Form), the spec submits the static page with no script and
  reads what was sent. Every browser test is broken once and seen to fail. The measuring of
  `U3-BUILD.md` (320, 390, 1280 and 844 x 390 px, both directions, hostile content, forced
  colours, a coarse pointer, reduced motion, text zoom) is part of each spec.
- **Mutation.** `scripts/mutations/<slug>.ts`, found by itself: the block's rows, plus one per
  guarantee a class or a line carries. A row must be caught by `vitest run`. A label names
  its component in lowercase.
- **Dependencies (`R-5.9-1`, `docs/DECISIONS.md` 2026-10-03).** Unit 5 adds none: no date
  library, no highlighter, no virtualiser. The two that were asked about are choices with
  their sizes: `shiki` for CodeBlock (choice 12) and `@internationalized/date` for
  DatePicker (choice 15). A builder who finds one needed stops on that item and says so.
- **Deferred**, in every pull request: the four lines of `docs/CLOUD-PLAN.md` section 10
  (the visual matrix, Firefox and WebKit, the docs page, a changeset), the bundle budget of
  `docs/PLAN.md` 14 (`pnpm size` does not exist; the card chips are budgets, not
  measurements), and the skeleton line of PLAN 20: none of the eight ships a
  `skeleton.tsx`; a DatePicker trigger stands in with `InputSkeleton`, as Unit 4's fields do.
- **Ports.** `TC_HARNESS_PORT=4580 pnpm check` for the one builder; 4581 for a second when
  Omar allows two. Never 4517 to 4570.

## Shared pull requests

Four, each small, each on its own, each merged before the first component that needs it
(`docs/CLOUD-PLAN.md` section 9). None opens before Units 3 and 4 are on `main` with a green
`pnpm check`. When a pull request moves a line a mutation row anchors on, it moves the row
too.

0. **`docs/readme-regenerate`, by the lead.** On `main` after Units 3 and 4 merge, run
   `pnpm readme:build` and commit what it rewrites, then `pnpm check:readme`. On the read
   base `npx tsx scripts/readme-build.ts --check` reports three stale READMEs
   (`radio-group`, `segmented-control`, `tabs`; run by the code reader): left as they are,
   `check:readme` fails on every Unit 5 branch.
1. **`feat/shared-unit-5-labels`.** In `types.ts`, `en.ts`, `ar.ts`, and in
   `withOverrides()` of `get-labels.ts`, which names every group by hand. Two new groups of
   three keys each (`datePicker`, `stepper`) and three keys in existing groups
   (`file.tooLarge`, `file.wrongType`, `common.copyFailed`), nine keys in all. English:

   | Key | English | Kind |
   |---|---|---|
   | `datePicker.placeholder` | `Pick a date` | string: the trigger with no value, as drawn |
   | `datePicker.previousMonth` | `Previous month` | string: the name of the button |
   | `datePicker.nextMonth` | `Next month` | string: the name of the button |
   | `file.tooLarge` | `Too large` | string: the reason on a rejected file's row |
   | `file.wrongType` | `Not an accepted type` | string: the reason on a rejected file's row |
   | `stepper.done` | `Completed` | string: read after a done step's title |
   | `stepper.todo` | `Not started` | string: read after a step not reached |
   | `stepper.error` | `Needs attention` | string: read after a step with an error |
   | `common.copyFailed` | `Could not copy` | string: announced when the clipboard refuses |

   Arabic, supplied by the lead on 2026-10-15. This file is ASCII, so each string is
   written here as `\u` escapes; `ar.ts` takes the real letters, and the lead's handoff
   folder has them ready to copy in `unit-5/arabic-labels.md`, with the reason for each
   word.

   | Key | Arabic, escaped |
   |---|---|
   | `datePicker.placeholder` | `\u0627\u062e\u062a\u0631 \u062a\u0627\u0631\u064a\u062e\u064b\u0627` |
   | `datePicker.previousMonth` | `\u0627\u0644\u0634\u0647\u0631 \u0627\u0644\u0633\u0627\u0628\u0642` |
   | `datePicker.nextMonth` | `\u0627\u0644\u0634\u0647\u0631 \u0627\u0644\u062a\u0627\u0644\u064a` |
   | `file.tooLarge` | `\u0627\u0644\u062d\u062c\u0645 \u0643\u0628\u064a\u0631 \u062c\u062f\u064b\u0627` |
   | `file.wrongType` | `\u0646\u0648\u0639 \u063a\u064a\u0631 \u0645\u0642\u0628\u0648\u0644` |
   | `stepper.done` | `\u0645\u0643\u062a\u0645\u0644` |
   | `stepper.todo` | `\u0644\u0645 \u064a\u0628\u062f\u0623` |
   | `stepper.error` | `\u064a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0645\u0631\u0627\u062c\u0639\u0629` |
   | `common.copyFailed` | `\u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u0646\u0633\u062e` |

   `stepper.done` and `stepper.todo` are the words of `timeline.done` and `timeline.todo`.
   `ar.ts` is typed `satisfies Labels`, so the pull request needs all nine. None holds a number, so none needs `byCount`. `ar.ts`
   is 172 lines; nine keys and two group lines keep it under 200. A
   `src/shared/labels/unit-5.test.ts` like `unit-4.test.ts`, and rows in
   `scripts/mutations/shared-labels.ts`. Labels used as they are: `common.copy`,
   `common.copied`, `common.close`, `common.required`, `common.loading`, `state.empty`,
   `state.loadingMore`, `file.drop`,
   `file.browse`, `file.remove`, `file.tooMany`. Month and weekday names are not labels: they
   come from `Intl` (`docs/DECISIONS.md` 2026-10-03).
2. **`feat/shared-unit-5-tokens`.** Three lines in `src/tokens.css`, in `:root` under
   `--tc-list-pad-end`, each with a one-line comment as the two above it have:

   ```text
   --tc-meter-value: 0%;
   --tc-tree-level: 0;
   --tc-tree-indent: calc(1.125rem * var(--tc-density));
   ```

   `--tc-meter-value` is set inline by Meter from its clamped value. `--tc-tree-level` is set
   inline on each tree row. `--tc-tree-indent` is the indent of one level: 18 px at density
   1, the drawn indent of the Components page and the playground (the card stage draws 16).
   No type change: `src/shared/style-tokens.ts` already accepts every `--tc-*` key. A test
   that reads `src/tokens.css` and finds the three declarations as written
   (`src/tokens-unit-5.test.ts`), and a new `scripts/mutations/shared-tokens.ts` with one row
   per declaration.
3. **`feat/shared-form-errors`.** A client file `src/shared/form-errors.ts`, for FormAction to
   provide and FieldLive to read (neither component may import the other):

   ```text
   FormErrors = Readonly<Record<string, string | readonly string[] | undefined>>
   FormErrorsContext = createContext<FormErrors | undefined>(undefined)
   useFormErrors() returns FormErrors | undefined
   ```

   `src/shared/form-errors.dom.test.tsx`: a value under the provider reaches a reader; with
   no provider the hook returns `undefined`. A new `scripts/mutations/shared-form-errors.ts`:
   the hook always returns `undefined`.

**No icon pull request.** Every icon these blocks use is in `src/icons/data`:
`calendar-blank`, `caret-left`, `caret-right`, `caret-down`, `check`, `x`, `copy`,
`terminal-window`, `upload-simple`, `file`, `warning-circle`, `asterisk`. **No contract pull
request:** each new type (the tree node, the step, the field control object) is used by one
component and lives in its `types.ts`.

## Meter

```text
Not drawn. No Components-page frame, no docs card, no layer and no text containing "meter" on the Components and Docs pages (the Foundations and Icons pages were not searched for text). Not one of the 46 cards.
Design source: the Progress drawing, which this file adopts for Meter.
FRAME "Progress" 74:274, text: "The track is neutral/soft, the bar is the tone. Height follows padding-y, so it scales with everything else."
Track 220 wide raw, fill -> neutral/soft, radius = height raw, clips; bar -> primary/solid (or the tone), the same radius. Heights by size: xs 4, sm 4, md 6, lg 8, xl 10, all raw. Values drawn: 15, 50, 85 percent and complete; tones primary, success, warning, danger.
Card "Previewer: Progress" 137:2113: chip "server - 0 KB". Head: "A neutral track with a bar in the chosen tone; height follows the spacing scale." Playground: tone primary, size md, value 60.
Catalog: PLAN 18.2 "Progress, Meter | S | 2 | min/max, clamped"; PLAN 18.11 lists Meter.value. src/components/progress/boundaries.ts: "a custom range is Meter's job, which is why Progress takes no min or max prop."
Base UI 1.8.0 has meter (Root, Label, Track, Indicator, Value). Every part file starts with 'use client'; the server HTML has role="meter" and no name: aria-labelledby is set in an effect (measured by the Base UI reader). With no locale it formats with the runtime's, which differs between Node (en-US) and a browser.
Surprising:
- Size padding-y is 2, 4, 6, 8, 10, but Progress xs is drawn 4. The built Progress follows the token (xs 2 px), as docs/DECISIONS.md 2026-10-07 records.
- No meter look exists anywhere: no low, high or optimum band, no value text.
```

**Build this.** Server, first and alone: the smallest piece of the unit and the nearest to a
finished one. Needs shared pull request 2. No Base UI part: built on `role="meter"`, as
Progress is built on `role="progressbar"` (Base UI's meter is client and named only after
hydration).

- **Export:** `Meter`, one element, in `index.tsx`.
- **What the platform gives:** the ARIA `meter` role with `aria-valuemin`, `aria-valuemax`,
  `aria-valuenow` and, when the caller passes one, `aria-valuetext`. The native `<meter>` is
  not used: the browser draws its bar, and its look cannot take the tokens in every engine.
- **Props.** `value` (default 0), `min` (default 0) and `max` (default 100). `min` and `max`
  are clamped to `METER_BOUNDARIES` (-1e15 to 1e15, the guard rail NumberField and Slider use
  for their `min` and `max`); `max` is raised to `min` when it is below it; `value` is
  clamped to the result with `clamp()`, which also turns `NaN` into `min`. `tone`: the six
  `TONES`, default `primary`. `size`: default `md`. The name: `MeterName`, written as
  `ProgressName` is (one of `aria-label` or `aria-labelledby` required). `aria-valuetext`
  passes through, for a caller who wants "512 GB of 1 TB" read. No `labels`: Meter writes no
  text.
- **The bar's width** is `meterPercent(value, min, max)` in `lib.ts`: `(value - min) / (max
  - min) * 100`, and 100 when `max` equals `min`.
- **Markup.** As Progress: `<div {...rest} role="meter" aria-valuemin={min}
  aria-valuemax={max} aria-valuenow={value} data-tone data-size style={{ ...style,
  '--tc-meter-value': '<percent>%' }}>` with `METER_TRACK` and `METER_TRACK_HEIGHT[size]`,
  and inside it one `<div>` with `METER_BAR` and `METER_FILL[tone]`. The rest props go first:
  JSX accepts any hyphenated attribute, so the type alone cannot stop `aria-valuenow`. The
  type omits `children`, `dangerouslySetInnerHTML`, `role` and the three values.
  `import type {} from '#shared/style-tokens.js'`, as Progress.

  ```ts
  // meter/classes.ts
  /** Progress's track, copied: no component imports another. The fill survives forced colours. */
  export const METER_TRACK = 'w-full overflow-hidden rounded-control bg-neutral-soft forced-color-adjust-none'
  /** Height follows padding-y, as the Progress frame says: 2 to 10 px, so it scales with density. */
  export const METER_TRACK_HEIGHT = {
    xs: 'h-pad-y-xs',
    sm: 'h-pad-y-sm',
    md: 'h-pad-y-md',
    lg: 'h-pad-y-lg',
    xl: 'h-pad-y-xl',
    custom: '',
  } as const
  /** As wide as the clamped value, which index.tsx writes into --tc-meter-value. */
  export const METER_BAR = 'h-full w-(--tc-meter-value) rounded-control'
  /** R-5.2-3: complete strings, never a name built from the tone. */
  export const METER_FILL = {
    primary: 'bg-primary-solid',
    neutral: 'bg-neutral-solid',
    success: 'bg-success-solid',
    warning: 'bg-warning-solid',
    danger: 'bg-danger-solid',
    info: 'bg-info-solid',
  } as const
  ```

- **Keyboard and ARIA.** The Authoring Practices meter: a role, a name and the three values.
  Nothing takes the focus.
- **RTL.** The bar starts at the inline start because it is a block in the track; nothing
  translates.
- **Files.** `index.tsx`, `lib.ts`, `classes.ts`, `constants.ts` (`METER_TONES`,
  `METER_SIZES`, `METER_DEFAULTS`: value 0, min 0, max 100, tone, size), `boundaries.ts`
  (`METER_BOUNDARIES = { limitMin: -1e15, limitMax: 1e15 }`), `schema.ts` (the same numbers),
  `types.ts`, `meta.ts`, `README.md`. Demos: `basic`, `range` (512 of 1024), `tones`,
  `sizes`, `custom-size`, `rtl`.
- **Tests.** The server set, and `meter.clamp.test.tsx`: 150 of 0 to 100 gives
  `aria-valuenow="100"` and `--tc-meter-value: 100%`; -5 gives 0; `min={10} max={5}` gives
  max 10 and 100%; 512 of 0 to 1024 gives 50%; `min={100} max={200} value={150}` gives 50%;
  `NaN` gives `min`. Types: a Meter with no name does not compile; `role` is not a prop.
  Browser, static (`e2e/meter.spec.ts`): the bar of `range` is half the track, from the left
  edge in LTR and from the right edge in RTL; the five heights are 2, 4, 6, 8 and 10 px;
  under forced colours the bar is still painted.
- **Mutation.** `meterPercent` drops `- min`, so 150 between 100 and 200 draws 150%: the clamp
  test catches it. A second row: `METER_TRACK` loses `forced-color-adjust-none` (a styles
  test reads it).
- **Not built:** Base UI's meter, a value text or a label part, low, high and optimum bands,
  an indeterminate state (that is Progress), `format` and `locale`.
- **For the reviewer:** the two tables of Progress are copied on purpose; if Omar wants one
  copy, a shared pull request moves both into a `classes.ts` under `src/shared` and
  re-points Progress, as shared pull request 4 of Unit 4 did for Input. A meter at its
  minimum shows an empty track.

## Stepper

```text
Where: Components page, FRAME "Stepper" 79:259 (the stepper is 79:263). Docs card "Previewer: Stepper" 137:2477 (Data section on the docs site; Feedback in the Contents frame 87:288). Copy: 438:6585.
Frame text: "Done steps carry a tick, not just a colour, so the state survives a greyscale screenshot and a colour-blind reader."
The drawing (79:263), horizontal, no gap; steps and connectors alternate:
- step: vertical, centred, gap 8 raw: a circle 32 x 32 raw, radius 16 raw, content centred; under it the title Inter 12 raw.
- done (Account): fill -> primary/solid, icon/check 18 raw -> primary/on-solid; title Regular -> base/body.
- current (Profile, "2"): fill -> primary/solid, number Inter Medium 14 raw -> primary/on-solid; title Semi Bold -> base/body.
- todo (Team "3", Done "4"): fill -> base/surface, stroke -> base/line-strong 1 raw inside, number Inter Medium 14 -> base/muted; title Regular -> base/muted.
- connector: a frame 90 wide raw with padding-top 16 raw holding a line 90 x 1 raw: after a done step -> primary/solid, otherwise -> base/line. The line sits level with the circle centres.
Caption: "four steps, second one current".
Docs card: chip "split - 0 KB server + 1.8 KB client" (info/soft). Head: "A done step carries a tick, not just a color, so it survives a greyscale screenshot."
Stage (137:2510): the same four steps with circles 30 x 30, icon/check 16, connectors 56 wide with padding-top 15.
Playground: orientation "horizontal", size "md", activeStep "2". Toggles: clickable off, showConnector on, compact off.
States (5), one circle each, 32 x 32: todo (base/surface, line-strong 1, "2" base/muted); current (primary/solid, "2" on-solid); done (primary/solid, icon/check 17); error (danger/solid, icon/x 17 -> danger/on-solid); disabled (the todo circle at opacity 0.5).
Code (145:1048), copied exactly:
  import { Stepper } from 'topclassui/stepper'

  <Stepper
    defaultValue="account"
    items={[
      { id: 'account', title: 'Account', content: <AccountFields /> },
      { id: 'details', title: 'Details', content: <DetailsFields /> },
      { id: 'review', title: 'Review', content: <ReviewSummary /> },
    ]}
  />
Note (145:1053): "From a server page pass defaultValue: onValueChange is a function and cannot cross."
Home catalog badge: Sp.
Surprising:
- The playground's prop is activeStep (a number, 2); the code's is defaultValue (an id).
- The items carry content (a panel per step); no panel, no next or back button is drawn.
- Circles 32 on the Components page and in the states row, 30 on the stage. Nothing is bound to Size.
- orientation, compact and clickable are in the playground; no vertical, compact, hover or focus look is drawn.
- The current step differs from a done step only by the number against a tick and a Semi Bold title; no ring marks it.
- The error state has no title and nothing else tells what failed.
- The docs site puts Stepper under Data, whose text speaks of visible rows and windowing; the Contents frame puts it under Feedback.
```

**Build this.** Server: the catalog row and the chip say split, and nothing drawn needs a
script (choice 10). Second, after Meter. Needs shared pull request 1. No Base UI part: built
on an ordered list and `aria-current="step"`.

- **Export:** `Stepper`, one element, in `index.tsx`.
- **What the platform gives:** an `<ol>` tells a screen reader how many steps there are and
  where each one sits ("2 of 4"), so no "Step 2 of 4" label is needed; `aria-current="step"`
  names the current one.
- **Props.** `items: readonly StepperItem[]`, required, plain data so a server page passes
  them: `StepperItem = { id: string, title: ReactNode, status?: StepperStatus }`, with
  `STEPPER_STATUSES = ['done', 'current', 'todo', 'error'] as const` in `constants.ts`.
  `value`: the id of the current step, default the first item's. A step's status is its own
  `status` when it has one, else `done` before the current step, `current`, and `todo` after
  it; a `value` that no item has leaves every step `todo`. That is `statusOf(items, value)` in
  `lib.ts`. `size`: default `md`. `labels` (default `en`) and `locale` (default `'en'`, for
  the digits). `className`, `style`, `ref` and the rest props reach the `<ol>`. The prop is
  `value`, an id, as the code sample has it, not the playground's `activeStep`. Empty
  `items` render nothing (`null`), as Timeline does.
- **Markup.** `<ol>` with `STEPPER_ROOT`, the rest props, and after them `role="list"`, as
  Timeline writes it: with `list-style: none` Safari with VoiceOver drops the list unless
  the role is written, and with it the "2 of 4" this markup relies on, since the mark is
  hidden. Each step is an `<li>` with `STEPPER_STEP`,
  `data-status` (a value attribute, as Timeline writes it) and `aria-current="step"` when
  current. In it a `<div>` with `STEPPER_MARK_ROW` holding, on every step but the last, the
  connector `<span aria-hidden="true">` with `STEPPER_CONNECTOR` and `data-done` when this
  step is done, then the mark `<span aria-hidden="true">` with `STEPPER_MARK`,
  `STEPPER_MARK_SIZE[size]` and `STEPPER_MARK_STATUS[status]`. The mark holds the step's
  number from `createNumberFormat(locale)` (current and todo), `<Svg icon={check}
  size="55%" />` (done) or `<Svg icon={x} size="55%" />` (error): 55% of the circle is the
  drawn 18 of 32. Under the row the title, a `<span dir="auto">` with `STEPPER_TITLE`,
  `STEPPER_TITLE_SIZE[size]` and `STEPPER_TITLE_STATUS[status]`, then a `<span>` with
  `STEPPER_STATUS_TEXT` holding `labels.stepper.done`, `.todo` or `.error`; a current step
  has none, since `aria-current` says it. The mark is hidden: the list gives the number, the
  word gives the state.

  ```ts
  // stepper/classes.ts
  /** Equal columns, so each connector runs from one centre to the next. */
  export const STEPPER_ROOT = 'flex w-full min-w-0 items-start'
  /** relative: the hidden status word sits inside it (an sr-only span outside one grew the Sidebar page). */
  export const STEPPER_STEP = 'relative flex min-w-0 flex-1 flex-col items-center gap-2 text-center'
  /** The mark and the line behind it share one row, so the line is level with the centre at every size. */
  export const STEPPER_MARK_ROW = 'relative flex w-full justify-center'
  /** From this centre to the next. A border, not a fill: forced colours repaint a border and erase a fill. */
  export const STEPPER_CONNECTOR = 'absolute top-1/2 inset-s-1/2 w-full -translate-y-1/2 border-t-(length:--tc-line-width) border-line data-done:border-primary-solid'
  /** Painted after the line, so it covers the line's ends. A circle is a shape, not a radius knob. */
  export const STEPPER_MARK = 'relative inline-flex shrink-0 items-center justify-center rounded-full font-medium tabular-nums'
  /** One step under the control scale: md is the drawn 32 px. */
  export const STEPPER_MARK_SIZE = {
    xs: 'size-[calc(1.5rem*var(--tc-density))] text-xs',
    sm: 'size-control-xs text-xs',
    md: 'size-control-sm text-sm',
    lg: 'size-control-md text-sm',
    xl: 'size-control-lg text-base',
    custom: '',
  } as const
  /** Forced colours erase a fill: a filled mark paints itself in the text colour there, as Timeline's dot does. */
  const FILLED = 'forced-color-adjust-none forced-colors:bg-[CanvasText] forced-colors:text-[Canvas]'
  /** The state is the tick, the number or the x; the colour only repeats it. */
  export const STEPPER_MARK_STATUS = {
    done: `bg-primary-solid text-primary-on-solid ${FILLED}`,
    current: `bg-primary-solid text-primary-on-solid ${FILLED}`,
    todo: `bg-surface text-muted ${BORDER_STRONG}`,
    error: `bg-danger-solid text-danger-on-solid ${FILLED}`,
  } as const
  /** A long title wraps inside its column: a step is read whole, never cut. */
  export const STEPPER_TITLE = 'max-w-full wrap-anywhere'
  export const STEPPER_TITLE_SIZE = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
    custom: '',
  } as const
  export const STEPPER_TITLE_STATUS = {
    done: 'text-body',
    current: 'font-semibold text-body',
    todo: 'text-muted',
    error: 'text-body',
  } as const
  export const STEPPER_STATUS_TEXT = 'sr-only'
  ```

- **Digits.** `createNumberFormat(locale)`: `{...getLabels('ar-u-nu-arab')}` gives
  Arabic-Indic numbers, `{...getLabels('ar')}` Latin ones (measured in Node, see "What was
  checked"). Ship a demo of each.
- **Keyboard and ARIA.** None of its own: nothing takes the focus.
- **RTL.** The list starts at the inline start, and each connector runs from its centre
  toward the inline end (`inset-s-1/2`), so both mirror; the tick and the x are not
  directional.
- **Files.** `index.tsx`, `lib.ts`, `classes.ts`, `constants.ts` (`STEPPER_STATUSES`,
  `STEPPER_SIZES`, `STEPPER_DEFAULTS`), `schema.ts` (`size`), `types.ts`, `meta.ts`,
  `README.md`. No `boundaries.ts`, no `client.tsx`. Demos: `basic`, `sizes`, `statuses`
  (one step with `status: 'error'`), `rtl`, `arabic-digits`, `long-content` (six steps of
  40-character titles).
- **Tests.** The server set, and: with four items and the second as `value`, the first step
  holds a tick and "Completed", the second has `aria-current="step"` and a "2", the last two
  "Not started"; an item's own `status` wins; an unknown `value` makes every step todo; the
  connector of a done step has `data-done`, and the last step has no connector;
  `arabic-digits` prints U+0662; the `<ol>` carries `role="list"` as an attribute, also when
  the caller passes another `role`; empty `items` render nothing. Browser, static
  (`e2e/stepper.spec.ts`): at 320, 390 and 1280 px in both directions each connector starts
  at its circle's centre and ends at the next one's, level with both centres, within 1 px;
  `long-content` never scrolls the page sideways and its titles wrap inside their columns;
  at the five sizes the circles are 24, 28, 32, 40 and 48 px; under forced colours a done, a
  current and a todo mark are all visible and differ (tick, number with a fill, number with
  a line).
- **Mutation.** `statusOf` marks the current step `done`: the server render test catches it. A
  second row: `STEPPER_CONNECTOR` loses `inset-s-1/2` (a styles test reads it). A third: the
  `<ol>` loses `role="list"` (the server render test).
- **Not built:** the client half of the catalog (clickable steps, `defaultValue`,
  `onValueChange`; choice 10), step panels and next or back buttons, `orientation`
  (vertical), `compact`, `showConnector`, a description line, a disabled look, `tone`.
- **For the reviewer:** a title wraps where `R-5.2-7` would cut a label: a step must be read
  whole. The current step differs from a done one by its number against a tick and by the
  weight of its title, as drawn. Check the connector geometry at `xs` and `xl` too: it
  depends on the mark covering the line's ends. `meta.ts` takes its category from PLAN 18.6,
  `navigation-and-disclosure`; whether the docs site files the card under Data or Feedback
  is the docs site's question.

## CodeBlock

```text
Where: Components page, FRAME "Code block, Kbd and Avatar group" 83:337; the block is "CodeBlock" 83:342. Docs card "Previewer: CodeBlock" 137:1552 (Display section). Copy: 438:5918.
Frame text: "The code block is the one place a fixed dark surface is allowed, because code colour is its own language. Kbd renders real keys, and an avatar group overlaps and counts the rest."
The drawing (83:342): 520 x 122, vertical, clips its content, radius 12 -> Knobs radius/box, fill -> neutral/solid, no stroke.
- header row 520 x 35, centred, padding 14 / 10 raw, gap 8 raw: icon/terminal-window 14 raw -> neutral/on-solid at opacity 0.7; file name "button.tsx" Roboto Mono Regular 11 raw -> neutral/on-solid at opacity 0.7, filling the row; icon/copy 14 raw -> neutral/on-solid at opacity 0.7.
- body 520 x 87, gap 3 raw, padding-x 14, padding-bottom 14, padding-top 0. One text node per line, Roboto Mono Regular 12 raw, every line -> neutral/on-solid (no syntax colour).
- Not drawn: line numbers, a highlighted line, a scrollbar, wrapping, a copied look.
Caption: "with a copy button".
Docs card: chip "split - 0 KB server + 0.9 KB client". Head: "Code highlighted by Shiki on the server; the only JavaScript is the copy button."
Stage (137:1585): 420 x 95, radius -> Knobs radius/box, fill -> neutral/solid; header padding 12 / 9, icons 14 at opacity 0.6, "button.tsx" Roboto Mono 10, then icon/copy; three lines Roboto Mono 11 -> neutral/on-solid.
Playground: language "tsx", theme "dark", maxLines "20". Toggles: lineNumbers off, wrap off, showCopy on.
States (5): idle (icon/copy at 0.6); copy hover (icon/copy at full opacity); copied (icon/check 12 -> success/on-soft); wrapped and no header (both drawn the same as idle).
Code (148:1042), copied exactly:
  import { CodeBlock } from 'topclassui/code-block'

  <CodeBlock lang="tsx">
    {`export default async function Page() {
    const invoices = await getInvoices()
    return <InvoiceTable items={invoices} />
  }`}
  </CodeBlock>
Note (148:1047): "Pass the code as a template-literal child; Shiki highlights it at build time."
Home catalog badge: Sp.
The only syntax colouring drawn in the file is on the docs cards' own code panels (fill -> base/page): keywords -> primary/on-soft, strings -> success/on-soft, attribute names -> warning/on-soft, component names -> info/on-soft, the rest -> base/body or base/muted.
Surprising:
- "a fixed dark surface": the fill is Semantic neutral/solid, which is neutral/900 in Light and Ocean and neutral/100 in Dark. In Dark the block turns light. Nothing in the file is a fixed dark colour.
- The head says Shiki highlights "on the server"; the note says "at build time". The block has no syntax colour at all.
- The playground calls the prop language; the code calls it lang.
- The copy control is a bare 14 px (12 in the states) icon at 60 or 70 percent opacity, under the 24 px floor, with no label.
- The copied tick is success/on-soft on neutral/solid, a pairing no contrast rule names.
```

**Build this.** Split: the server markup and a client copy button. Third. Needs shared pull
request 1 (`common.copyFailed`). No Base UI part: a `<pre><code>`, and a native `<button>`
that calls `navigator.clipboard.writeText`. No highlighter (choice 12).

- **Exports:** `CodeBlock`, from `index.tsx`. Its copy button, `CodeBlockCopy`, lives in
  `client.tsx` and is not re-exported, as `TagRemove` is not.
- **What the platform gives:** `<pre>` keeps every space and line break;
  `navigator.clipboard.writeText` works in a secure context after a press. Outside one (plain
  `http` on a LAN address, some embedded views) `navigator.clipboard` is `undefined`.
- **Props.** `children: string`, required: the code, as the sample passes it. `lang`: written
  as `data-lang` and nothing else (a class built from it would be a built class name,
  `R-5.2-3`). `title: ReactNode`: the file name in the header (the HTML `title` attribute is
  omitted from the type). `highlighted: ReactNode`: the same code as nodes the caller made,
  for example with Shiki at build time or in its own async Server Component; it is rendered in
  `<code>` in place of `children`, and the button still copies `children`. `showCopy`:
  default `true`. `wrap`: default `false`. `labels` (default `en`); `locale` accepted and
  dropped. `className`, `style`, `ref` and the rest props reach the root.
- **Markup.** A `<div>` with `CODE_BLOCK_ROOT` and `data-lang`. A header, a `<div>` with
  `CODE_BLOCK_HEADER`, when there is a `title` or a copy button: with a title, a
  `<span aria-hidden="true">` with `CODE_BLOCK_ICON` holding `<Svg icon={terminalWindow}
  size="0.875rem" />`, and the title in a `<span dir="auto" id>` with `CODE_BLOCK_TITLE`, its
  id from `useId()` (`R-5.1-1` allows it; Table does the same); then `<CodeBlockCopy>` when
  `showCopy`, imported from `./client.js` and rendered on that branch only, so a block
  without it ships no script. Then `<pre dir="ltr" translate="no">` with `CODE_BLOCK_PRE`,
  `CODE_BLOCK_PRE_ALONE` when there is no header and `CODE_BLOCK_WRAP` with `wrap`, and
  `tabIndex={0}` unless `wrap`: a server render cannot know whether it overflows, so it is
  always a tab stop, as Table's box is; with a title, the `<pre>` is also `role="region"`
  with `aria-labelledby` set to the title's id, as Table's box is named by its caption. In
  it `<code>` with `highlighted` or `children`.
- **The copy button.** `CodeBlockCopy` takes `code`, `label` (`labels.common.copy`),
  `copied` (`labels.common.copied`) and `failed` (`labels.common.copyFailed`), strings the
  server hands it, and `titleId` when the block has a title. It calls one hook,
  `useCodeBlockCopy(code)` in `hook.ts`, which also makes the button's id. The hook copies
  with `await navigator.clipboard?.writeText(code)` inside `try`, and treats a missing
  clipboard, a throw and a rejection alike: each says `failed` and the icon stays. It renders
  a `<button type="button" id aria-label={label}>`, which with a title also takes
  `aria-labelledby="<its own id> <titleId>"`, so it reads "Copy page.tsx" and five blocks on
  a page are five different buttons, as FileUpload's remove names its file. It carries
  `CODE_BLOCK_COPY` and `data-copied` while copied, holding `<Svg icon={copy} />` or, for
  `COPY_RESET_MS` (2000, in `constants.ts`), `<Svg icon={check} />`, both at `0.875rem`; and
  beside it a `<span role="status">` with `CODE_BLOCK_STATUS`, which says the copied or the
  failed text and is emptied after the same time, so the next copy is announced again. The
  name of the button never changes (PLAN 16). The tick is the colour of the button, not
  success/on-soft: the change of icon is the cue.

  ```ts
  // code-block/classes.ts
  /** One column, so the code scrolls inside the block and never widens its parent. relative: it holds the live region. The rings take the block's text colour. */
  export const CODE_BLOCK_ROOT = `relative grid min-w-0 grid-cols-1 rounded-box bg-neutral-solid text-neutral-on-solid [--tc-ring:var(--tc-neutral-on-solid)] ${CONTAIN} ${FORCED_EDGE}`
  export const CODE_BLOCK_HEADER = 'flex min-w-0 items-center gap-2 px-3.5 py-1.5'
  export const CODE_BLOCK_ICON = 'flex shrink-0 text-neutral-on-solid/70'
  export const CODE_BLOCK_TITLE = `${LABEL} flex-1 font-mono text-xs text-neutral-on-solid/70`
  /** 24 px, 44 under a finger: the drawn 14 px icon is under the floor. HOVER.ghost reads the page's neutral/soft, which sits next to this text colour. */
  export const CODE_BLOCK_COPY = `ms-auto ${ICON_BUTTON} text-neutral-on-solid/70 hover:bg-neutral-on-solid/10 hover:text-neutral-on-solid`
  /** Sideways inside its own box; the ring is drawn inside, since the block sits flush with its edges. */
  export const CODE_BLOCK_PRE = `rounded-b-box px-3.5 pb-3.5 font-mono text-sm whitespace-pre tab-2 text-start ${FOCUS_RING_INSET} ${SCROLL_X}`
  /** No header above it: the top padding comes back and every corner rounds. */
  export const CODE_BLOCK_PRE_ALONE = 'rounded-box pt-3.5'
  /** wrap: a long line breaks, and nothing scrolls sideways. */
  export const CODE_BLOCK_WRAP = 'whitespace-pre-wrap wrap-anywhere'
  export const CODE_BLOCK_STATUS = 'sr-only'
  ```

- **Keyboard and ARIA.** Tab reaches the button; Enter or Space copies. Tab reaches the
  `<pre>`, where the arrow keys scroll it. The status is polite.
- **Direction.** The `<pre>` is always `dir="ltr"`: code reads left to right in an Arabic
  page. The header keeps the page's direction, so the button sits at the inline end, and the
  title is `dir="auto"`.
- **Surface.** `neutral-solid` as drawn, so in Dark the block is light (choice 13). The text
  and the icons are `neutral-on-solid`, a pair the tokens keep at 4.5:1. Both rings are the
  shared `FOCUS_RING` (through `ICON_BUTTON`) and `FOCUS_RING_INSET`, recoloured by
  `--tc-ring` set to neutral/on-solid on the root, as Pagination, Sidebar and Tabs recolour
  theirs; `--tc-ring` itself is measured on the page and the surfaces, not on neutral/solid.
  `FORCED_EDGE` draws its edge under forced colours.
- **Files.** `index.tsx`, `client.tsx` (`CodeBlockCopy`), `hook.ts` (`useCodeBlockCopy`),
  `classes.ts`, `constants.ts` (`CODE_BLOCK_DEFAULTS`, `COPY_RESET_MS`), `schema.ts`
  (`showCopy`, `wrap`), `types.ts`, `meta.ts`, `README.md`. No `boundaries.ts`. Demos:
  `basic` (the sample with `title="page.tsx"`), `no-header`, `no-copy`, `wrap`, `long-line`
  (one 300-character line), `highlighted` (spans the demo writes by hand with semantic
  classes), `rtl`.
- **Tests.** The split set, and: the server HTML of `<pre>` is `dir="ltr"` and holds the code
  with its spaces; `highlighted` replaces the text and the button still copies `children`;
  `showCopy={false}` renders no button and no header without a title; the `<pre>` is a tab
  stop unless `wrap`; with a title the `<pre>` is a `region` named by it and the button is
  named "Copy page.tsx", without one it is "Copy". Dom (`navigator.clipboard` stubbed, fake
  timers): a press writes exactly `children`; the status says "Copied" and is empty again
  after 2000 ms; the name of the button stays the same; a rejected write says "Could not
  copy"; with `navigator.clipboard` undefined a press says "Could not copy" and throws
  nothing. Browser
  (`e2e/code-block.spec.ts`): static, at 320 px in LTR and RTL, `long-line` scrolls inside
  the `<pre>` (its `scrollWidth` is over its `clientWidth`) and the page does not scroll
  sideways, alone, in a grid track of `1fr`, in a `flex-1` column and in a table cell; in RTL
  the code's first character is at the left of the `<pre>` and the button at the left of the
  header; the button is at least 24 px (44 coarse); its ring and the `<pre>`'s are
  neutral/on-solid and have 3:1 against the block in the three modes (`e2e/pixels.ts`);
  under forced colours the block has an edge. Live, with
  clipboard permission granted to Chromium: Tab to the button, Enter, the clipboard holds the
  code, the status says the copied text, the name is unchanged.
- **Mutation.** The `<pre>` loses `dir="ltr"`: the server render test catches it. A second
  row: the button's name becomes the copied text after a press (the dom test). A third:
  `CODE_BLOCK_ROOT` loses `[--tc-ring:var(--tc-neutral-on-solid)]` (a styles test reads it).
- **Not built:** Shiki or any highlighter (choice 12), a syntax palette (the docs cards'
  on-soft colours sit on base/page, not on neutral/solid, and belong to the docs app), line
  numbers, highlighted lines, `maxLines`, a `theme` prop, a language badge, a fixed dark
  surface (choice 13), the CopyButton component (choice 14), a download button, `size`.
- **For the reviewer:** the `<pre>` is a tab stop even when nothing overflows, because the
  server cannot measure; `wrap` drops it. The colours of `highlighted` nodes are the
  caller's and nothing here checks them against `neutral-solid`. The success tick is drawn
  in the block's own text colour, not the drawn success/on-soft. The copy button's hover is
  written by hand, a 10% tint of neutral/on-solid: `HOVER.ghost` would paint the page's
  neutral/soft under a text of nearly the same colour (`R-5.2-4`; see the departures).

## Field

```text
Not drawn. No Components-page frame, no docs card ("Previewer: Field", "Form" or "Label" does not exist in either docs site), no drawing of a label, hint, error message or required mark beside any control. Not among the 46. What the file says, all text:
Nine Forms cards plus DatePicker and FileUpload wrap the control in Field with a function child:
  <Field name="..." label="..." hint="...">{(control) => (<X {...control} ... />)}</Field>
imported from 'topclassui/field'. The Input card adds required: <Field name="email" label="Email" hint="We never share it" required>. Its note (149:1087): "Outside a Field, Input needs id or aria-label - the types reject an unlabelled one."
Page: Accessibility (183:1877), "Labels are enforced by the types": an element child, not a function:
  <Field name="email" label="Email">
    <Input type="email" />
  </Field>
Page: Your first component (193:3001): "Field wires the label, hint and error to the control. Input is a native input, so it works before any JavaScript." "Zod validates on the server, so it cannot be bypassed and costs the browser nothing. fieldErrors comes out keyed by field name, which is what Field expects."
Page: Add with the CLI (193:1974): "field -> components/topclassui/field/ (select imports it)".
Forms section text (140:956): "Each control carries a real name and submits inside a plain <form>. Input and Textarea work before any JavaScript loads; the rest submit their default value and become interactive once it does."
Surprising:
- Field takes a function child on the cards and an element child on the Accessibility page.
- Label is never a component in any text: it is the label prop of Field.
- Two import paths for the same files: '@/components/topclassui/field' and 'topclassui/field'.
```

**Build this.** Split: `Field` in `index.tsx` (server, no script), `FieldLive` in
`client.tsx`. Fourth, after the three that need no form. Needs shared pull request 3. No Base
UI part (choice 6): Base UI's Field cannot wire a native Input or Textarea, links its labels
and descriptions only after hydration, drops a caller's `id` from the server HTML, and
renames every radio of a group to the field's label (all measured by the Base UI reader).
The look is this file's: nothing is drawn.

- **Exports:** `Field` and `FieldLive`. Label is not an export (choice 1).
- **Props, both.** `name`: required. `label: ReactNode`: required. `hint: ReactNode`.
  `error: string | readonly string[]`: one message, or the array Zod's `fieldErrors` gives.
  `invalid`: default `true` when `error` holds a message. `required`: default `false`.
  `inline`: default `false`: the control first and the label beside it, for a Checkbox or a
  Switch. `id`: the control's id, and with it every id of the field (see Ids).
  `children: (control: FieldControl) => ReactNode`:
  required, a function (choice 8). `className`, `style`, `ref` and the rest props reach the
  root. `FieldLive` takes the same and, when it is given no `error`, reads its own from the
  nearest `FormAction` through `useFormErrors()`.
- **The control object** (`FieldControl` in `types.ts`, exported):

  ```text
  { id, name, required, 'aria-labelledby', 'aria-describedby', 'aria-invalid' }
  ```

  PLAN 12's five, and `aria-labelledby` for every control (choice 7): Unit 4 measured that a
  `<label for>` cannot name a Slider, a RadioGroupRoot or a SegmentedControlRoot, and their
  types refuse the five without it. On the others it names what the label already names.
  `aria-describedby` lists the hint's id and then the error's, only those rendered.
  `aria-invalid` is `true` or absent.
- **Ids.** `toFieldIds(controlId)` in `lib.ts`, where `controlId` is `id ?? useId()`: the
  label `<controlId>-label`, the hint `-hint`, the error `-err`. `R-5.1-1` allows `useId` in
  `index.tsx`, and Table, Tag and Textarea already call it there; React's server renderer
  and the client agree on it, so FieldLive hydrates with the same ids. Never from `name`
  alone (choice 33): a checkbox group repeats one name across several Fields, and two forms
  on a page (a header and a footer subscribe form) can share one; ids from the name would
  give two controls one id, point every label but the first at the wrong control (a click on
  "Text me" would toggle "Email me") and make axe report `duplicate-id-aria`. A Server
  Action's errors stay keyed by `name`.
- **How each control takes it.** `{...control}` spreads onto all eleven with no change to
  them:

  | Control | What lands where | Named by |
  |---|---|---|
  | Input, Textarea | everything on the native element | `<label for>`, and `aria-labelledby` |
  | Switch, Checkbox | `id` and the ARIA on the native button root; `name`, `required` on Base UI's hidden input | both |
  | RadioGroupRoot, SegmentedControlRoot | the ARIA on the `radiogroup`; `name`, `required` to Base UI; `id` on the group's `div`, which no label can point at | `aria-labelledby` |
  | Slider | the ARIA on the range input; `required` accepted and dropped | `aria-labelledby` |
  | NumberField, Select, Combobox | `id` on Base UI's Root, which moves it to the input or the trigger; the ARIA there | both |
  | OTPField | `id` and the ARIA on the first cell | both |
  | DatePicker | everything on the trigger button | both |
  | FileUpload | everything on the native file input | both |

- **Markup**, written once in the part `FieldFrame` (`parts/field-frame.tsx`, no directive), which both halves render: a `<div>`
  with `FIELD_ROOT` and `FIELD_STACK` (or `FIELD_INLINE`). In it `<label id htmlFor>` with
  `FIELD_LABEL` (and `FIELD_LABEL_INLINE`), holding the label and, when `required`, a
  `<span aria-hidden="true">` with `FIELD_REQUIRED` and `<Svg icon={asterisk}
  size="0.625em" />`; then a `<div>` with `FIELD_CONTROL` (or `FIELD_CONTROL_INLINE`) holding
  `children(control)`; then the hint, a `<div id>` with `FIELD_HINT`; then the error, a
  `<div id>` with `FIELD_ERROR` holding a `<span aria-hidden="true">` with `FIELD_ERROR_ICON`
  and `<Svg icon={warningCircle} />`, and each message in its own `<div>`. With `inline` the
  hint and the error also take `FIELD_NOTE_INLINE`. The hint and the error are `<div>`s: a
  `<p>` that holds a block is emptied by the parser (Timeline). A required field is heard
  through the control: `required` on a native one, `aria-required` on Checkbox, Switch and
  the two groups (measured in their server HTML), and the word "required" in a DatePicker's
  description (see DatePicker). The asterisk is only seen.

  ```ts
  // field/classes.ts
  /** min-w-0: a long label wraps instead of widening a grid track. */
  export const FIELD_ROOT = 'grid min-w-0 content-start'
  /** One column: the label, the control, the hint, the error. */
  export const FIELD_STACK = 'grid-cols-1 gap-1.5'
  /** inline: the control first and the label beside it; the hint and the error under the label. */
  export const FIELD_INLINE = 'grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2.5 gap-y-1'
  export const FIELD_LABEL = 'text-sm font-medium text-body wrap-anywhere'
  export const FIELD_LABEL_INLINE = 'col-start-2 row-start-1 font-normal'
  export const FIELD_CONTROL = 'min-w-0'
  export const FIELD_CONTROL_INLINE = 'col-start-1 row-start-1 flex'
  export const FIELD_HINT = 'text-sm text-muted wrap-anywhere'
  /** A mark as well as a colour (SC 1.4.1): the icon is what a reader of greys keeps. */
  export const FIELD_ERROR = 'flex items-start gap-1.5 text-sm text-danger-on-soft wrap-anywhere'
  /** As tall as the first line of the message, so the icon centres on it. */
  export const FIELD_ERROR_ICON = 'flex h-5 shrink-0 items-center'
  export const FIELD_NOTE_INLINE = 'col-start-2'
  /** The asterisk of a required field. Colour goes on the wrapper, never on the svg. */
  export const FIELD_REQUIRED = 'ms-0.5 inline-flex text-danger-on-soft'
  ```

- **FieldLive.** It calls one hook, `useFieldLive({ id, name, error })` in `hook.ts`, and
  then renders `FieldFrame`. The hook makes the ids as Field does and takes the error from the
  prop, else from `useFormErrors()?.[name]`. An error from the form goes once the field's
  value changes, and comes back with the next result of the action, as Base UI's `errors`
  prop does; the hook keys that on the identity of the errors object. When new errors
  arrive, the hook records the field's entries, `new FormData(form).getAll(name)` with a
  file read by its name, where `form` is found as `useFormValue`'s private `findForm` finds
  it (the input's `form`, else the closest `<form>`); it records them
  in a `setTimeout` from its effect, so React's reset and `useFormValue`'s restore have
  landed first. On every `input`, `change`, `click` and `keyup` caught on its root as React
  events (so a press in a portaled popup counts), it reads them again on the next frame and
  clears the error when they differ: a click that changes nothing keeps it. A plain
  `input` or `change` is not enough: Base UI's Select writes its hidden input from state and
  dispatches nothing (read in `SelectRoot.js`), which the `click` and `keyup` catch; and
  DatePicker and FileUpload dispatch an `input` event after a scripted write (see "Rules
  for all eight"), which also covers a drop. FieldLive
  writes the same ids, label and `aria-describedby` into its server HTML as Field does. Its
  child is a function, so it is used from a client file, as the sample is; a server page
  uses Field (`R-5.1-3`).
- **Form.** Field adds nothing a form submits: the control does. `dummy/form.tsx` is a plain
  `<form>` of an Input, a Textarea and a Checkbox in Fields, read with `serverEntries` on the
  static page.
- **RTL.** A grid and logical classes: with `inline` the control sits at the inline start.
- **Files.** `index.tsx` (`Field`), `client.tsx` (`FieldLive`), `hook.ts` (`useFieldLive`),
  `lib.ts` (`toFieldIds`, `messagesOf`, `describedByOf` and the form readers),
  `parts/field-frame.tsx` (`FieldFrame`), `classes.ts`,
  `constants.ts` (`FIELD_DEFAULTS`), `schema.ts` (`required`, `inline`, `invalid`), `types.ts`
  (`FieldControl`, `FieldProps`, `FieldLiveProps`), `meta.ts`, `README.md`. No
  `boundaries.ts`. Demos: `basic` (an Input), `hint-error`, `required`, `inline` (a Checkbox
  and a Switch), `group` (a RadioGroup), `form`, `rtl`, `long-content` (a 300-character label
  and hint), `live` (FieldLive outside a form).
- **Tests.** The split set, and `field.lib.test.ts` (importing from `../lib.js`):
  `toFieldIds` and `messagesOf`. Server render: the label's `for` is the control's id; the
  ids follow `id` when it is given; two Fields with one `name` write no id twice, each
  label's `for` is its own control's id, and each control's `aria-describedby` resolves to
  its own hint; `aria-describedby` lists the hint and then the error and nothing that is not
  rendered; `aria-invalid` with an error; the asterisk is hidden and `required` reaches the
  control. A compile test spreads one `control` onto each of the eleven controls (a test may
  import other components, as a demo may) and refuses a child that is not a function.
  Hydration: FieldLive hydrates with the same ids and no warning. Dom: a FieldLive error from
  a provided `FormErrors` shows; it goes after a real change of an Input, a Checkbox and a
  Select inside a form (Unit 4 is on `main` by gate 0), and not after a click that changes
  nothing; it comes back with a new errors object. DatePicker and FileUpload test the same
  in their own branches, since they are built after Field. Browser (`e2e/field.spec.ts`):
  static, `serverEntries` on `field--form`;
  axe on every demo (the shared spec) with the label, hint and error linked in the server
  HTML; `long-content` wraps and never scrolls a 320 px page sideways, also in a grid track
  of `1fr`, a `flex-1` column and a table cell; under forced colours the asterisk and the
  error icon are visible. Live: a click on the label of the `inline` Checkbox toggles it; a
  click on the label of an Input focuses it.
- **Mutation.** `describedByOf` leaves the error's id out of `aria-describedby`: the server
  render test catches it. A second row: FieldLive's error no longer goes after a change (the
  dom test). A third: the ids are built from `name` again (the server render test with two
  Fields of one name).
- **Not built:** a Label export (choice 1), an element child (choice 8), Base UI's Field
  (choice 6), `size`, an "optional" text, a counter, Fieldset (its own catalog row), any
  check in the browser beyond the browser's own.
- **For the reviewer:** on a RadioGroup, a SegmentedControl and a Slider the label's `for`
  points at an element no label can name; the group is named by `aria-labelledby`, and a
  click on its label does nothing. The error carries no role and no live region: it arrives
  with the page, and after a FormAction the focus goes to the first invalid control (see
  Form). The ids come from `useId` unless `id` is given, so a page that links to a field
  (`#email`, an error summary of its own) passes `id`.

## Form

```text
Not drawn. Not among the 46. What the file says, all text (Page: Your first component 193:3001):
- "A subscribe form: an Input inside a Field, and a Button." "Add the components first: npx topclassui add form field input button"
- Code 193:3169, copied exactly:
  import { Form } from '@/components/topclassui/form'
  ...
  export default function Page() {
    return (
      <Form action={subscribe} className="flex flex-col gap-4">
        <Field name="email" label="Email" hint="We never share it" required>
          {(control) => <Input {...control} type="email" autoComplete="email" />}
        </Field>
        <Button type="submit">Subscribe</Button>
      </Form>
    )
  }
- "No script for the form. Input, Button and Field all ship 0 KB here."
- "Move the form into a client file and use FormAction. Errors land on the matching field."
- Code 193:3205, copied exactly:
  'use client'
  import { FormAction } from '@/components/topclassui/form'
  import { FieldLive } from '@/components/topclassui/field'
  ...
  export function SubscribeForm({ action }: { action: typeof subscribe }) {
    return (
      <FormAction action={action}>
        <FieldLive name="email" label="Email" required>
          {(control) => <Input {...control} type="email" />}
        </FieldLive>
        <Button type="submit">Subscribe</Button>
      </FormAction>
    )
  }
Base UI (the Base UI reader): its Form always writes noValidate first, so before hydration a required field posts empty; a caller's noValidate={false} removes it. A client function action makes React write action="javascript:throw ..." plus a replay script; a string action stays as written.
```

**Build this.** Split: `Form` in `index.tsx` (server), `FormAction` in `client.tsx`. Fifth,
after Field. Needs shared pull request 3. No Base UI part (choice 6): a plain `<form>` keeps
the browser's own `required` check before hydration and after, which Base UI's Form turns
off.

- **Exports:** `Form` and `FormAction`.
- **Form.** A `<form>` with every form attribute; `action` is a URL or a Server Action. It
  adds the flat export and the `className` merge, nothing else: no `noValidate`, no class of
  its own (the sample passes its own layout).
- **FormAction.** Props: `action: (state: S, formData: FormData) => S | Promise<S>`,
  required (a Server Action a server page hands it, or a client function); `initialState`:
  default `{}`; `permalink`: passed to `useActionState`, so a submit before hydration lands
  on the right page; `children`: a `ReactNode`, or `(state: S, pending: boolean) =>
  ReactNode`, so the fields can read the action's answer (the submitted values, a form-level
  message); and every form attribute but `action`. `S` extends `FormActionState = {
  errors?: FormErrors }`, in `types.ts`; the caller's own state type adds `values` or
  `message` as it needs. A function child is written in a client file, as the sample is; a
  server page hands FormAction plain children (`R-5.1-3`).
- **The hook.** `useFormAction({ action, initialState, permalink })` in `hook.ts` calls
  `useActionState` and returns the state, the form action and `pending`. After a result
  with errors it moves the focus to the first element in the form with
  `aria-invalid="true"`. When that element cannot take the focus itself (a
  `role="radiogroup"` with no `tabindex`, as RadioGroupRoot and SegmentedControlRoot render
  it, measured; a Slider's root group), the focus goes instead to the first element inside
  it whose `tabIndex` is 0 or more: the checked or first radio, the thumb. A screen reader
  then hears the control and its error.
- **Markup.** `<FormErrorsContext value={state.errors}>` around `<form {...rest}
  action={formAction} aria-busy={pending || undefined}>`, with `className`, `style` and `ref`
  on the form, holding `children(state, pending)` when `children` is a function and
  `children` otherwise. No `classes.ts`: neither half has a class of its own (`R-8.1-1`).
- **What a reset does.** React 19 resets a form whenever a function action settles, errors
  or not: `startHostTransition` calls `requestFormReset` before the action runs (read in
  react-dom 19.3.0, `cjs/react-dom-client.development.js`). So an action that returns errors
  also returns the submitted values, and the fields take them back as their defaults
  through the function child:

  ```text
  <FormAction action={subscribe}>
    {(state) => (
      <FieldLive name="email" label="Email">
        {(control) => <Input {...control} defaultValue={state.values?.email} />}
      </FieldLive>
    )}
  </FormAction>
  ```

  Every control then resets to what was typed: a native field through its new
  `defaultValue`, the others through `useFormValue`, which restores the latest default
  (Unit 4 measured that every control then keeps the value on screen and in the form). The
  no-script response of a `permalink` renders the same child with the same state. Say so in
  the README, with the sample.
- **What a server Form cannot do.** It posts with no script, but it cannot show what the
  action returns: a server component never sees that value. Errors after a no-script post
  come from `FormAction` with `permalink` (`useActionState` renders its state into the
  response), or from the app's own redirect. The README says so.
- **Files.** `index.tsx` (`Form`), `client.tsx` (`FormAction`), `hook.ts`
  (`useFormAction`), `constants.ts` (`FORM_DEFAULTS`), `types.ts`, `meta.ts`, `README.md`.
  No `schema.ts`: neither half has a design prop. Demos: `basic` (the subscribe form, with
  `action="/subscribe"`), `server-errors` (Fields given the errors an action returns),
  `form-action` (a client demo: FormAction with a function child, FieldLive, and a client
  function that returns an error and the submitted values for `taken@example.com`).
- **Tests.** The split set without `.schema.test.ts`, `.styles.test.tsx` and `.css.test.ts`
  (no schema, no classes), and: Form writes its attributes and no `noValidate`. Dom: the
  `form-action` action's errors show in the matching FieldLive with `aria-invalid`, the
  focus moves to it, typing clears it, a second submit with no errors clears every error, and
  `aria-busy` is set while pending; a value typed into `form-action` is still in the field
  and in `FormData` after an action that returns an error; a function child receives the
  state and `pending`; with a RadioGroupRoot first in error, the focus lands on its checked
  or first radio. Browser (`e2e/form.spec.ts`): static, no script: fill
  `form--basic` and submit; `page.route` catches the POST to `/subscribe` and its body holds
  `email=`; an empty required field sends nothing. Static, `form--server-errors`: each error
  is on its own field (`aria-invalid`, and `aria-describedby` resolves to its text); axe
  passes. Live, `form--form-action`: the URL does not change, the error shows, the focus is
  on the field, typing clears it.
- **Mutation.** FormAction no longer provides the errors: the dom test catches it. A second
  row: the focus effect is removed (the dom test). A third: FormAction calls a function
  child with `initialState` instead of the current state (the dom test).
- **Not built:** Base UI's Form (choice 6), an error summary with a count ("2 errors"), the
  `onFormSubmit` values, any check in the browser beyond the browser's own.
- **For the reviewer:** a Server Action posted from a page with no script, and its response
  rendered with the errors, are Next.js's; no Next.js app was run here (see "What was
  checked"). Phase 4's first two clauses are met as far as the harness can reach: see Build
  order. The function child is not in PLAN 12, whose FormAction takes FieldLive children:
  without it, the reset of React 19 empties every field an error was about.

## FileUpload

```text
Where: Components page, FRAME "TreeView and File upload" 80:262 (three FileUpload groups: 80:315 idle, 80:323 dragging over, 80:347 uploading). Docs card "Previewer: File upload" 137:3043 (Forms section). Copy: 438:4913.
Frame text: "A tree is a flat list of the nodes you can see, so a repository with ten thousand files renders a few dozen rows. The dropzone needs a browse button too, because dragging a file is a drag."
The drawing (each FileUpload is 300 wide, vertical, gap 10 raw between the zone and the list):
- dropzone 300 x 126, vertical, centred, padding 24 raw, gap 8 raw, radius 12 raw, stroke 1 raw inside, dashed 6 / 4 raw.
- idle: fill -> base/surface, stroke -> base/line-strong. icon/upload-simple 28 raw -> base/muted. "Drag files here or browse" Inter Medium 14 raw -> base/body. "PNG, JPG or PDF, up to 10 MB" Inter Regular 12 raw -> base/muted.
- dragging over: fill -> primary/soft, stroke -> primary/solid, icon -> primary/on-soft, "Drop to upload" Inter Medium 14 -> primary/on-soft, the hint stays -> base/muted.
- uploading: the idle zone, then two file rows. A row: 300 wide, centred, padding 12 / 10 raw, gap 10 raw, radius 8 raw, no fill, stroke -> base/line 1. icon/file 16 raw -> base/muted; the name Inter Medium 14 raw -> base/body; an end icon 14 raw.
  - "brief.pdf" (done): icon/check-circle -> success/on-soft.
  - "logo.png" (uploading): a track 200 x 4 -> neutral/soft with a bar at 60 percent -> primary/solid; end icon icon/x -> base/muted.
- No file size, no error row, no remove button box, no browse button box.
Docs card: chip "client - 4.4 KB". Head: "A drop zone that always has a browse button, with the file list as a windowed collection."
Stage (137:3075): zone 320 x 124, radius -> Knobs radius/box, dashed 6 / 4; one row "brief.pdf" with a progress track and icon/x 14.
Playground: accept "image/*", maxSize "10MB", maxFiles "5". Toggles: multiple on, disabled off, showList on.
States (6): idle, drag over, uploading, done (icon/check-circle 15 -> success/on-soft and "done"), error (icon/warning-circle 15 -> danger/on-soft and "too big"), disabled (the idle zone at opacity 0.5).
Code (149:1050), copied exactly:
  import { FileUpload } from 'topclassui/file-upload'
  import { Field } from 'topclassui/field'

  <Field name="attachments" label="Attachments" hint="PDF or PNG, up to 5 files">
    {(control) => (
      <FileUpload
        {...control}
        accept="application/pdf,image/png"
        maxFiles={5}
        maxSize={5 * 1024 * 1024}
      />
    )}
  </Field>
Note (149:1055): "maxSize is in bytes, checked in the browser only - check it again in the action."
Home catalog badge: C.
Surprising:
- The frame text and the head both promise a browse button; none is drawn. "browse" is the last word of one text node.
- Three different limits: the drawing's "PNG, JPG or PDF, up to 10 MB"; the playground's image/*, 10MB, 5 files; the code's PDF or PNG, 5 MB, 5 files.
- An upload progress bar and a done tick are drawn; nothing says who reports progress (R-8.5-2: components never fetch).
- The remove icon is a bare 14 px icon, under the 24 px floor.
- The dropzone radius is raw 12 on the Components page and bound to Knobs radius/box on the card.
- "windowed collection" and showList: no long list is drawn and no visibleRows control.
- The error state shows only an icon and "too big"; no invalid state.
```

**Build this.** Client, and it works before hydration: the native file input is in the
server HTML. Sixth. Needs shared pull request 1. No Base UI part: built on
`<input type="file">`, the File API and `DataTransfer`.

- **Export:** `FileUpload`, one element.
- **What the platform gives** (measured by the Base UI reader in Chromium with no script): a
  multipart form sends each chosen file as a part with its name and type, one part per file
  with `multiple`; a urlencoded form sends only the names; an empty input still sends an
  empty part; `required` on an empty input blocks the submit; `accept` is a hint to the
  picker and nothing else (a scripted file of another type passed). Before hydration a drop
  onto the input sets its files (native; not run here).
- **What we add:** the zone and its drag look, the list of chosen files with their sizes and
  a remove button each, the limits, and files that add up across picks and drops.
- **Props.** `maxFiles`: default 1, bounds 1 to 100; the input is `multiple` when it is above
  1 (the sample passes `maxFiles={5}` and no `multiple`); `multiple` is omitted from the
  type, so `maxFiles` alone decides it. `maxSize`, in bytes: default and
  maximum 10,737,418,240 (10 GiB), minimum 1. `accept`: native. `visibleRows`: clamped to
  `COLLECTION_BOUNDARIES`, sets `--tc-list-rows` on the list. `onValueChange(files)`: the
  accepted files after each change. `children`: the hint drawn inside the zone (the
  drawing's "PNG, JPG or PDF, up to 10 MB"), linked to the input by `aria-describedby`: the
  zone hint's id first, then the caller's (Field's hint and error), only those rendered.
  `invalid`, `name`, `required`, `disabled` (each remove button is `disabled` with it),
  `form`, the name by `ControlName`, and `aria-describedby`, `aria-invalid`,
  `aria-labelledby`. `className`, `style` and `ref`
  reach the root; the rest reach the `<input>` (a departure from `R-5.7-3`, as Unit 4's
  RadioGroupItem).
- **The list.** `useFileUpload()` in `hook.ts` holds the accepted files with `useFormValue`
  (default an empty list), so a form reset empties the list as the browser empties the input.
  A pick or a drop runs `sortFiles(current, incoming, limits)` in `lib.ts`: the files in
  order, up to `maxFiles`, a file over `maxSize` rejected as too large, a file that
  `matchesAccept` refuses rejected as the wrong type, and whether the count cut any. The hook
  then writes the accepted files back into `input.files` through a `DataTransfer`, so the
  form sends exactly the list on screen; a rejected file is shown with its reason and never
  sent. With `maxFiles` 1 a new file replaces the old one. After a drop or a remove writes
  `input.files`, the hook dispatches `new Event('input', { bubbles: true })` on the input
  (see "Rules for all eight"). Not `change`: the component's own `onChange` reads that as a
  new pick and would add the files again.
- **Helpers in `lib.ts`.** `matchesAccept(file, accept)`: a `.ext` by the end of the name,
  case apart; `type/*` by the start of the MIME type; an exact MIME type; an empty `accept`
  takes everything. `formatBytes(bytes, locale, numberingSystem)`: `Intl.NumberFormat` with
  `style: 'unit'` and byte, kilobyte, megabyte or gigabyte, steps of 1024 (the sample writes
  `5 * 1024 * 1024`), one decimal; below 1024 bytes `unit: 'byte'` with `unitDisplay: 'long'`
  ("300 bytes": the short form prints "300 byte" in Node 22 and Chromium 153); measured in
  Node: `en` "2.4 MB" and "512 kB", `ar` with Arabic unit names.
- **Markup.** A `<div>` with `FILE_UPLOAD_ROOT`. In it the zone, a `<div>` with
  `FILE_UPLOAD_ZONE`, `data-dragging` while a drag is over it and `data-disabled`: a
  `<span aria-hidden="true">` with `FILE_UPLOAD_ICON` and `<Svg icon={uploadSimple}
  size="1.75rem" />`; a `<span>` with `FILE_UPLOAD_PROMPT` holding `labels.file.drop` and a
  `<span>` with `FILE_UPLOAD_BROWSE` holding `labels.file.browse`; the hint in a
  `<span id>` with `FILE_UPLOAD_HINT`; and last the `<input type="file">` with
  `FILE_UPLOAD_INPUT`, covering the whole zone. Then the list, a `<ul role="list">` with
  `FILE_UPLOAD_LIST` (the role written, as Stepper's: `list-style: none` drops the list in
  Safari with VoiceOver; a tab stop while it overflows: `useScrollTabStop`), one `<li>` with
  `FILE_UPLOAD_ROW` per file: a `<span aria-hidden="true">` with `FILE_UPLOAD_ROW_ICON` and
  `<Svg icon={file} />` (or `FILE_UPLOAD_REJECTED_ICON` and `warningCircle` for a rejected
  file), the name in a `<span dir="auto" id>` with `FILE_UPLOAD_NAME`, the size with
  `FILE_UPLOAD_SIZE` or the reason (`labels.file.tooLarge`, `labels.file.wrongType`) with
  `FILE_UPLOAD_REASON`, and the remove `<button type="button">` with `FILE_UPLOAD_REMOVE`,
  `aria-label={labels.file.remove}` and `aria-labelledby="<its own id> <the name's id>"`, so
  it reads "Remove brief.pdf", as Tag's remove does. Last two live regions, each emptied by
  the next change: a `<div role="status">` with `FILE_UPLOAD_MESSAGE` holding
  `labels.file.tooMany(maxFiles, fmt)` when the latest change cut files; and a `<div
  role="status">` with `FILE_UPLOAD_ANNOUNCE` holding, for each file the latest change
  refused, its name and its reason in two spans ("brief.pdf Too large"), so a screen reader
  hears a refusal the list only shows. The second is `sr-only`, so it is placed out of the
  root's grid and adds no gap. Move the list to `parts/file-upload-list.tsx` if `client.tsx`
  passes 200 lines.

  ```ts
  // file-upload/classes.ts
  /** One column, so the list scrolls instead of widening its parent. relative: it holds the hidden status line. */
  export const FILE_UPLOAD_ROOT = 'relative grid min-w-0 grid-cols-1 gap-2.5 text-body'
  /** The ring shows when the input over the zone has the keyboard; the dashed 3:1 line, danger when invalid, primary while a drag is over it. */
  export const FILE_UPLOAD_ZONE = `group/zone relative flex flex-col items-center justify-center gap-2 rounded-box border-dashed bg-surface p-6 text-center ${BORDER_STRONG} ${TRANSITION} ${FOCUS_RING_WITHIN} ${FIELD_INVALID_WITHIN} data-disabled:opacity-50 data-dragging:border-primary-solid data-dragging:bg-primary-soft data-dragging:text-primary-on-soft forced-colors:data-dragging:border-[Highlight]`
  /** The native input over the whole zone, unseen: a click, a key and a drop reach it before any script. */
  export const FILE_UPLOAD_INPUT = 'absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-default'
  export const FILE_UPLOAD_ICON = 'flex text-muted group-data-dragging/zone:text-primary-on-soft'
  export const FILE_UPLOAD_PROMPT = 'flex flex-col items-center gap-0.5 text-sm font-medium'
  export const FILE_UPLOAD_BROWSE = 'text-primary-on-soft underline underline-offset-2'
  export const FILE_UPLOAD_HINT = 'text-xs text-muted group-data-dragging/zone:text-primary-on-soft'
  /** At most --tc-list-rows rows, then it scrolls inside itself. Nothing at all while empty. */
  export const FILE_UPLOAD_LIST = `grid grid-cols-1 gap-1.5 max-h-[calc(var(--tc-list-rows)*var(--tc-row-height))] pointer-coarse:max-h-[calc(var(--tc-list-rows)*max(var(--tc-row-height),var(--tc-target-coarse,44px)))] empty:hidden ${SCROLL_AREA} ${FOCUS_RING_INSET}`
  export const FILE_UPLOAD_ROW = `flex min-h-(--tc-row-height) min-w-0 items-center gap-2.5 rounded-control px-3 py-1 text-sm ${BORDER} ${ROW_TOUCH}`
  export const FILE_UPLOAD_ROW_ICON = 'flex shrink-0 text-muted'
  export const FILE_UPLOAD_REJECTED_ICON = 'flex shrink-0 text-danger-on-soft'
  export const FILE_UPLOAD_NAME = `${LABEL} flex-1 font-medium`
  export const FILE_UPLOAD_SIZE = 'shrink-0 text-xs text-muted tabular-nums'
  export const FILE_UPLOAD_REASON = 'shrink-0 text-xs text-danger-on-soft'
  /** The x: an icon button on the neutral ramp, as Popover's close. */
  export const FILE_UPLOAD_REMOVE = `${ICON_BUTTON} text-muted tone-neutral ${HOVER.ghost}`
  export const FILE_UPLOAD_MESSAGE = 'text-sm text-danger-on-soft empty:hidden'
  /** The refusals, read and not seen: each row already shows its reason. */
  export const FILE_UPLOAD_ANNOUNCE = 'sr-only'
  ```

- **Drag and drop.** `dragenter` and `dragover` on the zone prevent the default (so a drop is
  allowed) and set `data-dragging`; leaving the zone or a drop clears it (count the enters,
  since a child fires its own). A drop prevents the native one and adds the files through
  `sortFiles`.
- **Remove.** The file leaves the list and `input.files`; the focus goes to the next row's
  remove button, else the previous one, else the input.
- **Keyboard and ARIA (`R-5.6-3`).** The drop has a keyboard and a pointer path: the input
  itself. Tab reaches it and the zone draws the ring; Enter or Space opens the picker
  (native). Each remove button is a tab stop. Both status lines are polite.
- **Form.** Before hydration the input posts its files in a multipart form. An input has no
  `enctype`, so the component cannot set the form's: the README says that a form with a
  string `action` needs `encType="multipart/form-data"`. `maxFiles`, `maxSize` and `accept`
  are checked in the browser only after hydration: the README repeats the card's note to
  check them again in the action.
- **RTL.** The zone centres; rows use gaps and logical padding; names are `dir="auto"`;
  sizes take the provider's digits.
- **Files.** `client.tsx`, `hook.ts` (`useFileUpload`), `lib.ts`, `classes.ts`,
  `constants.ts` (`FILE_UPLOAD_DEFAULTS`), `boundaries.ts` (`FILE_UPLOAD_BOUNDARIES = {
  maxFilesMin: 1, maxFilesMax: 100, maxSizeMin: 1, maxSizeMax: 10737418240 }`), `schema.ts`
  (the same numbers, `invalid`, `visibleRows`), `types.ts`, `index.tsx`, `meta.ts`,
  `README.md`. Demos: `basic`, `multiple` (the sample's limits), `states` (invalid,
  disabled), `form` (a multipart `<form method="post">`), `rtl`, `in-field`.
- **Tests.** The client set, and `file-upload.lib.test.ts`: `matchesAccept` for `.PDF`,
  `image/*`, `application/pdf` and an empty accept; `sortFiles` keeps the order, cuts at
  `maxFiles`, rejects too large and the wrong type, and replaces with `maxFiles` 1;
  `formatBytes` in `en` ("300 bytes", "512 kB", "2.4 MB") and `ar`. Server render: the input
  has the `name`, `accept`, `required` and `id`, `multiple` only above 1, and
  `aria-describedby` with the hint's id; inside a Field with a hint and an error, the input's
  `aria-describedby` lists the zone hint, then the Field hint, then the error, and each
  resolves; the list is `role="list"`; the zone holds the two labels. Dom: a change with
  three files and `maxFiles` 2 shows two rows, "Only 2 files allowed", and two files in
  `input.files`; a remove leaves one and fires one `input` event and no `change`; a file over
  `maxSize` is not in `input.files`, and its name and "Too large" are in the hidden status
  line, which the next accepted pick empties; `disabled` disables each remove button;
  `onValueChange`; a reset empties the list (happy-dom 20.14.5 has `DataTransfer` and `File`
  and keeps an assigned `input.files`: checked); inside a FieldLive in a FormAction, an
  error goes when a file is removed. Browser (`e2e/file-upload.spec.ts`): static, no
  script: `setInputFiles` with two files on `file-upload--form`, submit, and `page.route`
  finds both file parts by name in the body; an empty required input sends nothing; the
  input fills the zone inside its 1 px line, so the shared target spec measures the zone.
  Live: three files with `maxFiles` 2 give two rows and the message; a 6 MB file with
  `maxSize` 5 MB gives a rejected row and is not in the posted body; after a remove the
  focus is on the next remove button; a drop dispatched with a `DataTransfer` adds files,
  and `data-dragging` is set during `dragover`; Tab to the input rings the zone; a
  300-character file name at 320 and 1280 px in both directions never scrolls the page
  sideways; with `e2e/fixtures/file-upload-layouts.tsx` (see "Rules for all eight") at 320
  px coarse and 1280 px the page never scrolls sideways and the zone fills its parent; under
  forced colours the dashed edge is visible; the reset cases of Switch.
- **Mutation.** The hook stops writing the accepted files back into `input.files`, so a
  rejected file is sent: the dom test catches it. A second row: `sortFiles` keeps a file over
  `maxSize` (the lib test). A third: the input is `multiple` at `maxFiles` 1 (the server
  render test). A fourth: the refused file is left out of the hidden status line (the dom
  test).
- **Not built:** upload progress and a done or failed state per file (choice 23), a separate
  Browse button (choice 22), image previews, `capture`, folders, a controlled list
  (`value`), windowing (choice 25), `size`; the drawn "Drop to upload" while dragging (the
  prompt keeps `file.drop`; the zone's colour and line change); a `showList` toggle; paste
  of a file into the zone; a check for the same file twice (a second pick of one file adds
  a second row).
- **For the reviewer:** the input is invisible over the zone and the ring is the zone's
  (`FOCUS_RING_WITHIN`); the browser's own "No file chosen" never shows. The zone is 152 px
  tall where the drawing has 126: "Browse" sits on its own line under the prompt. The
  playground's "10MB" is a string; the prop is bytes, as the code sample. A drop before
  hydration, and Safari's and Firefox's file inputs, were not run.

## TreeView

```text
Where: Components page, FRAME "TreeView and File upload" 80:262, the tree is "panel" 80:267. Docs card "Previewer: TreeView" 137:1223 (Data section). Copy: 438:6278.
Frame text: "A tree is a flat list of the nodes you can see, so a repository with ten thousand files renders a few dozen rows. ..."
The drawing (80:267):
- panel 320 x 233, vertical, padding 8 raw, gap 2 raw, radius 12 -> Knobs radius/box, fill -> base/surface-raised, stroke -> base/line 1 raw inside.
- row 302 x 29, centred, padding-y 6 raw, padding-end 8 raw, gap 6 raw, radius 8 raw. Padding-start by level: 8, 26, 44 raw (18 px per level).
- folder row: caret 14 raw (icon/caret-down open, icon/caret-right closed) -> base/muted, then folder 14 raw (icon/folder-open open, icon/folder closed) -> base/muted, then the name Inter Regular 14 raw -> base/body.
- file row: a 14 x 1 empty frame in place of the caret, icon/file-text 14 raw -> base/muted, the name.
- selected row: fill -> primary/soft, icon and name -> primary/on-soft.
- Not drawn: hover, focus, a guide line, a checkbox, a disabled row, a loading row, an expand animation.
Caption: "two folders open, one file selected".
Docs card: chip "client - 4.6 KB". Head: "A tree whose expanded nodes flatten into one windowed list, so 10,000 nodes stay fast."
Stage (137:1256): panel 300 x 171; padding-start 8, 24, 40 (16 per level); carets 12 raw.
Playground: selectionMode "single", indent "18", visibleRows "12". Toggles: multiSelect off, showLines off, virtualize on.
States (6), rows 23 tall: collapsed, expanded, selected, focus-visible (a ring rectangle around the row, -> base/ring 2), loading (two Skeleton bars -> neutral/soft), empty (icon/tray 22 -> base/muted, no text).
Code (145:1016), copied exactly:
  'use client'

  import { TreeView } from 'topclassui/tree-view'

  <TreeView
    getKey={(node) => node.id}
    defaultValue="page"
    items={[
      { id: 'app', label: 'app', icon: 'folder-open', children: [
        { id: 'layout', label: 'layout.tsx', icon: 'file-text' },
        { id: 'page', label: 'page.tsx', icon: 'file-text' },
      ] },
    ]}
  />
Line above the code (145:1009): "Item icons are IconName strings, like Timeline and DropdownMenu; getKey needs the directive."
Section text (Data, 140:966): "Every list component works the same way: a prop for visible rows, windowing above 200 items, and a loadMore callback. It never fetches."
Home catalog badge: C.
Surprising:
- Three indents: 18 per level on the Components page and in the playground, 16 in the card stage.
- Three caret sizes: 14, 12, 11.
- The code passes icons as IconName strings in a 'use client' file; R-7-1 and R-7-2 say a client contract carries a ReactNode.
- The data gives a folder one icon, but the drawings swap folder and folder-open with the open state.
- showLines and multiSelect are toggles; no guide line, checkbox or multi-selected look is drawn.
- Rows are 29 px (23 in the states row); Knobs list/row-height is 40.
- The empty state is an icon with no text.
```

**Build this.** Client. Seventh: windowing and a pattern with no Base UI part. Needs shared
pull request 2. No Base UI part: built on the ARIA tree pattern with
`aria-activedescendant`, and windowed by `useCollection`. Read Command and Combobox first.

- **Export:** `TreeView`, one element.
- **Props.** `items: readonly TreeNode[]`, required: `TreeNode = { id: string, label: string,
  icon?: ReactNode, disabled?: boolean, children?: readonly TreeNode[] }`. Plain data, so a
  server page passes a tree: no `getKey` (the `id` is the key) and an icon is an element,
  which crosses the boundary (`R-7-2`; choice 29). A node with `children`, even an empty
  array, is a branch: an app loads a branch's children when `onExpandedChange` tells it and
  passes them in. `value` and `defaultValue`: the selected id, default `null`;
  `onValueChange(id)`. `expanded` and `defaultExpanded`: the open ids, default `[]`;
  `onExpandedChange(ids)`. `visibleRows`, `virtualize` (default `'auto'`), `hasMore`,
  `loadMore`, `loadMoreThreshold`, from `CollectionProps`, the two numbers clamped to
  `COLLECTION_BOUNDARIES`. `status`: `'idle' | 'loading' | 'loading-more' | 'empty'`, default
  `idle`. `loadingFallback` and `emptyFallback`: default `labels.common.loading` and
  `labels.state.empty`. The name: `GroupName`. `className`, `style`, `ref` and the rest props
  reach the element with `role="tree"`.
- **The rows.** `flattenTree(items, expanded)` in `lib.ts` returns the visible rows in order,
  each `{ node, level, setSize, posInSet, parentId, branch, open }`, memoised in the hook on
  `items` and `expanded`. `useTreeView()` in `hook.ts` passes them to `useCollection` with
  the id as the key, as Combobox does: the row estimate starts at 40 and is set from the
  measured height of the first row; the tree sets `--tc-list-pad-start` and
  `--tc-list-pad-end` inline from `paddingStart` and `paddingEnd`, and `--tc-list-rows` from
  `visibleRows` when it is passed.
- **The focus.** The tree is the one tab stop: `tabIndex={0}` in the server HTML whenever it
  has rows, so no `useServerTabStop` is needed. `aria-activedescendant` names the row the
  keys are on, which carries `data-highlighted`, only while that row is mounted. While it is
  not (after a wheel), the attribute is absent, never an id no element has (axe
  `aria-valid-attr-value`), and the tree draws its own ring, as it does before hydration
  (`TREE_VIEW_TREE`); the next key brings the row back with `scrollToIndex`. When the tree
  takes the focus the highlight goes to the selected row when it is visible (not inside a
  closed branch), else the first visible row, and that row is brought into view as a key
  would bring it. A key that moves it brings the row into view:
  `scrollIntoView({ block: 'nearest' })` when it is mounted, `scrollToIndex` when it is not.
  The focus never sits on a row, so windowing can never drop it (choice 27).
- **Keys** (the Authoring Practices tree view, single select):

  | Key | Does |
  |---|---|
  | ArrowDown, ArrowUp | the next or the previous visible row; no wrap |
  | ArrowRight (ArrowLeft in RTL) | a closed branch opens; an open branch moves to its first child; a leaf does nothing |
  | ArrowLeft (ArrowRight in RTL) | an open branch closes; anything else moves to its parent |
  | Home, End | the first, the last visible row |
  | Enter | selects the row, and opens or closes a branch |
  | Space | selects the row |
  | a letter | the next visible row whose label starts with what was typed in the last 500 ms (`TYPEAHEAD_MS`), wrapping |

  A press on a row does what Enter does. A disabled row takes the highlight and nothing else.
  The swap in RTL is the hook's (`useDirection()`): the APG is silent on RTL, and Base UI's
  menus and composite swap the same way (choice 26).
- **ARIA.** The tree: `role="tree"`, the name, `aria-busy` while loading. Each row:
  `role="treeitem"`, an `id`, `aria-level`, `aria-setsize`, `aria-posinset`,
  `aria-expanded` on a branch, `aria-selected` true or false, `aria-disabled` when disabled.
  The rows are flat siblings with explicit levels, which windowing needs. The loading and the
  empty text sit outside the tree, in a `<div role="status">`: a tree owns tree items only.
- **Markup.** A `<div>` with `TREE_VIEW_ROOT`; in it the `<div role="tree">` with
  `TREE_VIEW_TREE`, holding only the mounted rows; then the note with `TREE_VIEW_NOTE`. A row
  is a `<div>` with `TREE_VIEW_ROW`, `TREE_VIEW_ROW_SELECTED`, `TREE_VIEW_ROW_ACTIVE`,
  `TREE_VIEW_ROW_DISABLED` and `style={{ '--tc-tree-level': level - 1 }}`: a `<span
  aria-hidden="true">` with `TREE_VIEW_CARET` holding `<Svg icon={caretDown}
  size="0.875rem" />` on an open branch, `caretRight` on a closed one and nothing on a leaf
  (the slot keeps every label of a level on one line); the node's icon, when it has one, in a
  `<span aria-hidden="true">` with `TREE_VIEW_ICON`; the label in a `<span dir="auto">` with
  `TREE_VIEW_LABEL`. The marker is swapped, never rotated: PLAN 5.3 forbids rotating a
  directional icon, and `Svg` flips `caretRight` in RTL by itself. Move the row to
  `parts/tree-view-row.tsx` if `client.tsx` passes 200 lines.

  ```ts
  // tree-view/classes.ts
  /** The box: one column, so the tree scrolls inside it and never widens its parent. */
  export const TREE_VIEW_ROOT = 'grid min-w-0 grid-cols-1 gap-1'
  /** The one tab stop and the scroll container; its own ring shows only while no mounted row holds the highlight. No gap: the spacers count whole rows. */
  export const TREE_VIEW_TREE = [
    'group/tree relative flex flex-col rounded-box bg-surface-raised p-2 outline-none tone-neutral',
    'focus-visible:not-has-data-highlighted:outline-solid focus-visible:not-has-data-highlighted:outline-(length:--tc-ring-width) focus-visible:not-has-data-highlighted:-outline-offset-(length:--tc-ring-width) focus-visible:not-has-data-highlighted:outline-ring',
    'max-h-[calc(var(--tc-list-rows)*var(--tc-row-height))]',
    'pointer-coarse:max-h-[calc(var(--tc-list-rows)*max(var(--tc-row-height),var(--tc-target-coarse,44px)))]',
    'before:h-(--tc-list-pad-start) before:shrink-0 after:h-(--tc-list-pad-end) after:shrink-0',
    BORDER,
    SCROLL_AREA,
  ].join(' ')
  /** Exactly one unit tall, 44 px under a finger. The start padding grows by one indent per level. */
  export const TREE_VIEW_ROW = [
    'group/row flex h-(--tc-row-height) shrink-0 cursor-default select-none items-center gap-1.5 rounded-control text-start text-sm text-body',
    'pe-2 ps-[calc(0.5rem+var(--tc-tree-level)*var(--tc-tree-indent))]',
    'pointer-coarse:h-[max(var(--tc-row-height),var(--tc-target-coarse,44px))]',
    HOVER.ghost,
    TRANSITION,
  ].join(' ')
  /** Selected: the tint, a heavier weight, and under forced colours the system pair. */
  export const TREE_VIEW_ROW_SELECTED = 'aria-selected:bg-primary-soft aria-selected:font-medium aria-selected:text-primary-on-soft forced-colors:aria-selected:forced-color-adjust-none forced-colors:aria-selected:bg-[Highlight] forced-colors:aria-selected:text-[HighlightText]'
  /** The row the keys are on, while the tree has the keyboard: a ring inside the row, since the tree draws none. */
  export const TREE_VIEW_ROW_ACTIVE = 'group-focus-visible/tree:data-highlighted:outline-solid group-focus-visible/tree:data-highlighted:outline-(length:--tc-ring-width) group-focus-visible/tree:data-highlighted:-outline-offset-(length:--tc-ring-width) group-focus-visible/tree:data-highlighted:outline-ring'
  export const TREE_VIEW_ROW_DISABLED = 'aria-disabled:pointer-events-none aria-disabled:opacity-50'
  /** The caret, or an empty slot as wide on a leaf. Colour on the wrapper, never on the svg. */
  export const TREE_VIEW_CARET = 'flex size-3.5 shrink-0 items-center justify-center text-muted group-aria-selected/row:text-primary-on-soft'
  export const TREE_VIEW_ICON = 'flex shrink-0 text-muted group-aria-selected/row:text-primary-on-soft'
  export const TREE_VIEW_LABEL = `${LABEL} flex-1`
  /** The loading and the empty text, outside the tree. Nothing at all while idle. */
  export const TREE_VIEW_NOTE = 'px-3 py-2 text-sm text-muted empty:hidden'
  ```

- **Paging (`R-8.5-2`).** The tree asks and never fetches. `loadMore` asks for more nodes at
  the root; a branch's children arrive through `onExpandedChange` and `items`, never through
  `loadMore`. `useCollection` guards on the count it is given, the visible rows
  (`askedAt.current === count` in `use-collection.ts`), so opening a branch near the end
  would ask again for a page already on its way. So `useTreeView()` hands it a `loadMore`
  that asks once per length of `items`, the root nodes: it keeps that length in a ref, does
  nothing while it is unchanged, and clears the ref when the promise rejects, as the shared
  guard does. Only while `hasMore`.
- **RTL.** The indent is the inline start's padding, the caret points the reading way, and
  the arrow keys swap.
- **Files.** `client.tsx`, `hook.ts` (`useTreeView`), `lib.ts` (`flattenTree`, the key
  moves, the typeahead match), `classes.ts`, `constants.ts` (`TREE_VIEW_DEFAULTS`,
  `TYPEAHEAD_MS`), `schema.ts` (`visibleRows`, `virtualize`, `loadMoreThreshold`, `status`),
  `types.ts`, `index.tsx`, `meta.ts`, `README.md`. No `boundaries.ts`: the bounds are the
  shared ones. Demos: `basic` (the drawn tree, with icons), `selected`, `rtl`,
  `ten-thousand` (ten folders of a thousand files, all open), `load-more`, `status`
  (loading and empty), `long-content`.
- **Tests.** The client set, and `tree-view.lib.test.ts`: levels, set sizes and positions of
  a three-level tree with one branch closed; the key moves in both directions; typeahead.
  Server render: `role="tree"` with `tabindex="0"` and its name; the rows with their
  attributes; `ten-thousand` renders only its first window. Dom, keys: every key of the table
  in both directions, controlled and uncontrolled `value` and `expanded`, a disabled row;
  with the selected row inside a closed branch, the focus highlights the first visible row;
  after the highlighted row is scrolled out of the window, the tree has no
  `aria-activedescendant`. Dom, paging: with `load-more` scrolled to the end, opening and
  closing a branch while the page is pending makes no second call; the next page makes one.
  Browser, static: Tab onto the tree draws its ring. Browser, live (`e2e/tree-view.spec.ts`),
  with `ten-thousand`: fewer than a hundred rows in
  the DOM on load, after fifty ArrowDown, after End and after a wheel to the end (the line of
  PLAN 20); after End the last row is highlighted and in view and `aria-activedescendant`
  names it; after a wheel to the end `aria-activedescendant` is absent and the tree draws
  its ring; `window.scrollY` stays 0. With `load-more`: one call per page. In RTL ArrowLeft
  opens a closed branch. The ring shows on the highlighted row after a key and not after a
  press. Rows are 40 px, 44 under a coarse pointer, and a row three levels deep starts 36 px
  further in than a root row. A 300-character label at 320 and 1280 px never scrolls the page
  sideways. Under forced colours the selected row is `Highlight`. axe on every demo.
- **Mutation.** The swap of ArrowRight and ArrowLeft in RTL is removed: the keyboard test
  catches it. A second row: the rows lose `aria-level` (the server render test). A third:
  the root-length guard of `loadMore` is removed (the dom paging test).
- **Not built:** multi-select and checkboxes, `selectionMode`, `showLines`, the folder and
  folder-open swap, `*` to open every sibling, drag to reorder (the LayersPanel's), links in
  rows, `error` (choice 3), `selectedItem` and a stale `loadMore` dropped by request id
  (`docs/PLAN.md` 8.5), an `indent` prop (the token is the knob), `size`; the drawn Skeleton
  loading rows and the empty icon (both are text in the status line); a loading row inside a
  branch whose children are on their way (the app passes them in).
- **For the reviewer:** after a wheel the highlighted row can be unmounted; the tree then
  renders no `aria-activedescendant`, never a dangling id, and draws its own ring until a
  key brings the row back; the focus stays on the tree. Both rings are written in
  `classes.ts` with the ring's tokens, not `FOCUS_RING` (a departure, see the end): the lint
  passes them there and refuses `focus-visible:` anywhere else. The drawn rows are 29 px;
  these are the list rows of the library.

## DatePicker

```text
Where: Components page, FRAME "Date picker and Timeline" 80:349 (the calendar is "g" 80:447). Docs card "Previewer: Date picker" 137:2825 (Forms section). Copy: 438:4704.
Frame text: "The calendar is a grid of buttons, so every date is reachable with the arrow keys. ..."
The drawing (80:354, an open calendar panel only, no trigger):
- panel 280 x 255, vertical, padding 16 raw, gap 12 raw, radius 12 -> Knobs radius/box, fill -> base/surface-raised, stroke -> base/line 1 raw inside, drop shadow raw.
- header row: icon/caret-left 14 raw -> base/body, "September 2026" Inter Semi Bold 14 raw -> base/body centred, icon/caret-right 14 raw. The carets are bare icons: no button box, no target drawn.
- weekday row: seven cells 34 wide raw, "M T W T F S S" (Monday first), Inter Medium 10 raw -> base/muted.
- day rows 32 tall: cells 34 x 32 raw, radius 8 raw, no fill; numbers Inter Regular 12 raw -> base/body.
- September 2026 starts on a Tuesday: the first row is one empty cell then 1 to 6; the last row is 28, 29, 30 and four empty cells. No days of the next or previous month are drawn.
- selected (22): cell fill -> primary/solid, number Inter Medium 12 raw -> primary/on-solid.
- Not drawn: today, a disabled day, a day outside minDate/maxDate, hover, a focus ring on a day, a range, week numbers.
Docs card: chip "client - 18.5 KB". Head: "A lazy-loaded calendar popover that formats dates with the provider's locale and digits."
Stage (137:2857): only the open panel, 270 x 159; the panel is cut after the 27th.
Playground: mode "single", placement "bottom-start", firstDayOfWeek "1". Toggles: disabled off, invalid off, clearable on, showWeekNumbers off.
States (6), each a trigger 128 x 40 raw, padding-x 16 raw, gap 8 raw, radius 8 raw, icon/calendar-blank 14 raw -> base/muted at the start:
- idle: fill -> base/surface-raised, stroke -> base/line 1, "Pick a date" Inter Regular 12 raw -> base/muted.
- open: stroke -> base/line-strong 1, "22 Sep 2026" -> base/body, plus a ring 2 raw, 4 px outside.
- selected: as idle with "22 Sep 2026" -> base/body. today: drawn exactly as selected.
- disabled: fill -> base/surface, opacity 0.5. invalid: stroke -> danger/solid 1, a danger ring 2.
Code (149:1034), copied exactly:
  import { DatePicker } from 'topclassui/date-picker'
  import { Field } from 'topclassui/field'

  <Field name="checkIn" label="Check-in" hint="Rooms are ready from 15:00">
    {(control) => (
      <DatePicker
        {...control}
        defaultValue="2026-10-02"
        minDate="2026-09-25"
        maxDate="2027-03-31"
      />
    )}
  </Field>
Note (149:1039): "The value is an ISO date string; the shown format comes from the provider locale."
Connector "Previewer: AdaptiveDatePicker" 404:2276 (context only): Sunday first, the selected day primary/soft, a drawer calendar under 48rem, "Calendar: Gregorian or Hijri".
Home catalog badge: C.
Surprising:
- The code sets defaultValue 2026-10-02 and minDate 2026-09-25, yet every drawing shows September with the 22nd selected, which is before minDate.
- Monday first on the Components page and the card (firstDayOfWeek 1); Sunday first on the connector card. Selected is primary/solid on the first two and primary/soft on the connector.
- "today" is a state on the card but drawn exactly like "selected".
- The trigger is drawn 128 px wide with no Size binding; "22 Sep 2026" wraps to two lines in it.
- The header carets are 14 to 15 px icons with no button box: under the 24 px floor.
- Day cells are 34 x 32 and 34 x 15: under 44 px on a coarse pointer.
- "lazy-loaded" and 18.5 KB: nothing says what is in it.
- No label, hint or error is drawn; they come from Field in the sample. No clear button is drawn though clearable is on.
```

**Build this.** Client. Last and alone: the riskiest of the unit. Needs shared pull request
1, and Field for its `in-field` demo. Base UI `popover` (`baseUi: 'popover'`): `Root`,
`Trigger`, `Portal`, `Positioner`, `Popup`, `Title`, `Close`. The month grid is ours, on
`Intl`: no date library (`docs/DECISIONS.md` 2026-10-03 struck react-day-picker, which
PLAN 2 and 18.4 still name; choice 15).

- **Export:** `DatePicker`, one element.
- **What Base UI gives** (from the installed types and the built files): the trigger is a
  `<button>` with `aria-haspopup="dialog"` and `aria-expanded`; the popup has `role="dialog"`
  and `aria-labelledby` set to its `Title`'s id; Escape and a press outside close it and the
  focus returns to the trigger; `modal` takes `true`, `'trap-focus'` or `false`; the focus
  is trapped only while a `Close` part is mounted inside the popup (`PopoverPopup.js`:
  `focusManagerModal = modal !== false && hasClosePart`; without one the trigger renders
  focus guards and Tab leaves the popup), and the types ask for one with `'trap-focus'` "so
  touch screen readers can escape the popup"; the positioner takes `side`, `align`,
  `sideOffset` and `collisionPadding` and sets `--available-width` and
  `--available-height`; the popup sets `data-starting-style` and `data-ending-style`.
  `Portal` takes `container` and `keepMounted`; `Popup` takes `initialFocus` and
  `finalFocus`.
- **What the platform gives:** `Intl.DateTimeFormat` names months and weekdays in the
  locale, with `calendar`, `numberingSystem` and `timeZone` options; `Intl.Locale` gives the
  first day of the week (`getWeekInfo()` in Chromium 153, the `weekInfo` getter in Node 22;
  Firefox and WebKit not checked).
- **Props.** `value` and `defaultValue`: `string | null`, an ISO date `YYYY-MM-DD`; a string
  that is not a real date counts as `null`. `onValueChange(value)`. `minDate` and `maxDate`:
  ISO dates, default and bounds `'0001-01-01'` and `'9999-12-31'` (`DATE_PICKER_BOUNDARIES`);
  each is clamped into the bounds and `maxDate` is raised to `minDate` when below it
  (`clampIso` in `lib.ts`: `R-5.7-7` for a date). A `value` outside `minDate` to `maxDate`
  is kept, shown and submitted as given (the data is never changed); the calendar opens on
  it, and the active day moves into the range on the first key. `firstDayOfWeek`: 1 to 7,
  Monday to Sunday as `Intl` counts them, rounded and clamped; default the locale's, read
  in the browser, and Monday where the browser has none (choice 17). `placeholder`: default
  `labels.datePicker.placeholder`. `size`: default `md`. `invalid`. `fullWidth`: default
  `false`. `placement`: the twelve `PLACEMENTS`, default `bottom-start`, through
  `toSideAlign`. `container`, to the Portal. `open`, `defaultOpen`, `onOpenChange`, to the
  Root. `name`, `form`, `required`, `disabled`, the name by `ControlName`,
  `aria-describedby`, `aria-invalid`, `aria-labelledby`. Removed from the type: the
  trigger's `render`, `nativeButton`, `handle`, `payload`, `openOnHover`, `delay`,
  `closeDelay`, `children`, `value`, `defaultValue` and `type`. `className`, `style`, `ref`
  and the rest props reach the trigger, as on Select.
- **The value.** `useDatePicker()` in `hook.ts` holds it with `useFormValue`, from the parsed
  `defaultValue`; the part hands the calendar the value and a setter, and the form input
  carries it, so a reset returns the default. After a choice, once the new value is
  committed, the hook dispatches `new Event('input', { bubbles: true })` on the form input
  (see "Rules for all eight"): a value set by script fires no event.
- **Date math** in `lib.ts`, on plain `{ year, month, day }`, with a UTC `Date` only for a
  weekday and a month's length: `parseIsoDate`, `toIsoDate`, `addDays`, `addMonths` (the day
  kept inside the new month: 31 January plus a month is 28 or 29 February), `daysInMonth`,
  `monthGrid(year, month, firstDay)` (42 cells, `null` outside the month), `clampIso`,
  `todayParts(now)` (see Keys). A year under 100 needs `setUTCFullYear`: `Date.UTC(1, 0,
  1)` is a day in 1901 (measured). ISO strings compare as strings.
- **Formatting.** One set of formatters per locale and numbering system, from `useLocale()`
  and `useNumberFormat().resolvedOptions().numberingSystem`, always with
  `calendar: 'gregory'` and `timeZone: 'UTC'`: the trigger `dateStyle: 'medium'`, the title
  `month: 'long', year: 'numeric'`, a day's name `dateStyle: 'full'`, the weekday headers
  `weekday: 'narrow'` with `weekday: 'long'` in `abbr`, and the day numbers through the
  provider's `NumberFormat`. Measured in Node 22: `en` "Sep 22, 2026", `en-GB` "22 Sept
  2026", `ar` "22/09/2026" with U+200F marks; `fa` is Persian by default and gives Gregorian
  months in Persian with `calendar: 'gregory'`. The grid is Gregorian whatever the locale
  (choice 16); `ar-SA` is Gregorian by default in both runtimes (the Base UI reader), so no
  Islamic variant has to be chosen for it.
- **Lazy.** `client.tsx` holds `const DatePickerCalendar = lazy(() =>
  import('./parts/date-picker-calendar.js').then(...))`, as Command's `client.tsx` does, and
  renders it in `<Suspense fallback={null}>` inside the popup: the calendar part and its
  markup load on first open (PLAN 9.2 rule 7, PLAN 14). `hook.ts` and `lib.ts` are shared
  with the trigger and load with it, as in Command, whose `parts/command-panel.tsx` imports
  `useCommandPanel` from the `hook.ts` that `client.tsx` imports: a bundler puts a module in
  one chunk, so `useDatePickerCalendar`, the keys and the date math are in the first bundle.
- **Markup.** A `<span>` with `DATE_PICKER_ROOT`, `FIELD_TEXT[size]` and `FIELD_HOLDER_FULL`
  with `fullWidth`: the box that owns the width, as Select's. In it `Base.Root` with
  `modal="trap-focus"` and the open state; `Base.Trigger` with `DATE_PICKER_TRIGGER`,
  `FIELD_SIZE[size]`, `data-size`, the `id`, `aria-invalid`, and `aria-describedby` set to
  the value's id, then, when `required`, the id of the required word below, then the
  caller's. A `<label for>` names the button, so the date is heard as its description. A
  button cannot carry `aria-required` (axe `aria-allowed-attr`, measured by a reviewer), and
  the input that holds `required` is hidden from the accessibility tree, so the word is the
  only place a screen reader learns it. In the trigger a `<span aria-hidden="true">` with
  `DATE_PICKER_ICON` and `<Svg icon={calendarBlank} />`, and the value in a `<span id>` with
  `DATE_PICKER_VALUE` and `data-placeholder` when empty. Then the form input: `<input
  aria-hidden="true" tabIndex={-1} autoComplete="off">` with `DATE_PICKER_INPUT`, `name`,
  `form`, `required`, `disabled`, `value={value ?? ''}` and a no-op `onChange` (React
  refuses a `value` without one, and `readOnly` would take the input out of the `required`
  check). When `required`, a `<span id hidden>` holding `labels.common.required`: hidden,
  and still read where `aria-describedby` points at it. Then `Base.Portal`
  (`container`), `Base.Positioner` with `DATE_PICKER_POSITIONER`, the side and the align,
  `sideOffset` and `collisionPadding` from `POPUP_BOUNDS`, and `dir` and `lang` from
  `usePortalLocale()`; `Base.Popup` with `DATE_PICKER_POPUP` and `data-placement`; in it the
  lazy calendar.
- **The calendar part** (`parts/date-picker-calendar.tsx`, one hook,
  `useDatePickerCalendar(props)`): a header, a `<div>` with `DATE_PICKER_HEADER`: the
  previous `<button type="button">` (`DATE_PICKER_NAV`,
  `aria-label={labels.datePicker.previousMonth}`, `<Svg icon={caretLeft} />`, `disabled`
  when the month before is wholly under `minDate`), `Base.Title` as an `<h2 id
  aria-live="polite">` with `DATE_PICKER_TITLE` holding the month, the next button likewise
  (a `container` can put the popup inside a `<form>`, where a button with no type submits
  it), and last `Base.Close` with `DATE_PICKER_NAV`, `aria-label={labels.common.close}` and
  `<Svg icon={x} />`: without it Base UI traps nothing and a touch screen reader cannot
  leave. Then `<table role="grid" aria-labelledby={titleId}>` with
  `DATE_PICKER_GRID`: a head of seven `<th scope="col" abbr={long}>` with
  `DATE_PICKER_WEEKDAY`, and six rows of seven `<td role="gridcell">` with
  `DATE_PICKER_CELL`, always six, so the popup keeps its height from month to month (choice
  20). A day of the month holds one `<button type="button">` with `DATE_PICKER_DAY`,
  `tabIndex` 0 on the active day and -1 on the others, `aria-label` with the day's full name,
  `aria-current="date"` on today, `aria-disabled` outside `minDate` to `maxDate`, and
  `data-selected` on the chosen day, whose cell has `aria-selected="true"`. A cell outside
  the month is empty, as drawn.

  ```ts
  // date-picker/classes.ts
  /** The box that owns the width, as Select's. relative: it holds the form input. */
  export const DATE_PICKER_ROOT = `relative inline-grid align-middle ${FIELD_HOLDER}`
  export const DATE_PICKER_TRIGGER = `inline-flex w-full items-center gap-2 text-start ${FIELD_BOX}`
  export const DATE_PICKER_ICON = 'flex shrink-0 text-muted'
  export const DATE_PICKER_VALUE = `${LABEL} flex-1 data-placeholder:text-muted`
  /** The form's copy of the value: out of sight and out of the tab order, still checked by required. */
  export const DATE_PICKER_INPUT = 'sr-only'
  export const DATE_PICKER_POSITIONER = 'z-(--tc-z-popup) data-anchor-hidden:invisible'
  /** 280 px as drawn, never wider than the room Base UI measured; on a short screen it scrolls itself. */
  export const DATE_PICKER_POPUP = [
    'flex w-[calc(17.5rem*var(--tc-density))] max-w-(--available-width) max-h-(--available-height) flex-col gap-3 p-4 tone-neutral',
    '*:shrink-0',
    SCROLL_AREA,
    OVERLAY_SURFACE,
    POPUP_MOTION,
    FOCUS_RING_INSET,
  ].join(' ')
  export const DATE_PICKER_HEADER = 'flex items-center gap-2'
  /** Three 44 px buttons under a finger leave about 92 px at 320 px: the month wraps, never cut. */
  export const DATE_PICKER_TITLE = 'min-w-0 flex-1 text-center text-sm font-semibold text-body wrap-anywhere'
  /** Previous, next and close: 24 px, 44 under a finger, where the drawing has bare 14 px carets. */
  export const DATE_PICKER_NAV = `${ICON_BUTTON} text-body ${HOVER.ghost} ${DISABLED}`
  export const DATE_PICKER_GRID = 'w-full table-fixed border-collapse'
  export const DATE_PICKER_WEEKDAY = 'pb-1 text-center text-xs font-medium text-muted'
  export const DATE_PICKER_CELL = 'p-0.5 text-center'
  /** A day: 32 px tall and 44 under a finger, as wide as its column. Selected is a fill and a weight; today an underline. */
  export const DATE_PICKER_DAY = [
    'inline-flex h-control-sm w-full items-center justify-center rounded-control text-sm tabular-nums text-body',
    TARGET_HEIGHT,
    FOCUS_RING,
    TRANSITION,
    HOVER.ghost,
    'data-selected:bg-primary-solid data-selected:font-medium data-selected:text-primary-on-solid',
    'forced-colors:data-selected:forced-color-adjust-none forced-colors:data-selected:bg-[Highlight] forced-colors:data-selected:text-[HighlightText]',
    'aria-[current=date]:font-semibold aria-[current=date]:underline aria-[current=date]:underline-offset-4',
    'aria-disabled:pointer-events-none aria-disabled:opacity-50',
  ].join(' ')
  ```

- **Keys** (the Authoring Practices date picker dialog, its grid):

  | Key | Does |
  |---|---|
  | ArrowRight, ArrowLeft | the next, the previous day; swapped in RTL |
  | ArrowDown, ArrowUp | the same day next week, last week |
  | Home, End | the first, the last day of the active day's row |
  | PageUp, PageDown | the same day last month, next month, kept inside the month |
  | Shift with PageUp, PageDown | the same day last year, next year |
  | Enter, Space | choose the day, close, the focus back on the trigger |
  | Escape | close with no change (Base UI) |
  | Tab | previous, next, close, the grid, round again (`trap-focus` with the `Close` part) |

  The active day never leaves `minDate` to `maxDate`; when it crosses into another month the
  grid shows that month. Today is read in the browser when the calendar mounts, and the
  calendar never renders on the server, so the server and the browser cannot disagree on it.
  Today is the browser's local calendar day: `todayParts(now)` in `lib.ts` returns `{ year:
  now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }` of `new Date()`.
  Never `toISOString()` or a UTC getter: in Riyadh after 21:00 UTC that is tomorrow, and in
  California it is tomorrow from 17:00 local time (16:00 in winter). The UTC `Date` stays
  for a weekday and a month's length, and every formatter keeps `timeZone: 'UTC'`, since it
  formats a plain date, not an instant. On open the focus goes to the chosen day, else today
  clamped into the range: the part's hook does it once it mounts.
- **Form.** The form input submits `name=YYYY-MM-DD`, and `name=` when empty; before
  hydration it sends the default. `required` blocks an empty one, with or without script,
  and the browser then puts the focus on the input nobody sees: say so in the README, as
  Select's does.
- **RTL.** The popup takes `dir` and `lang` from the provider, also in an island; the columns
  run from the inline start; `caretLeft` and `caretRight` flip, so "previous" points to the
  inline start in both directions; the arrow keys swap.
- **On a phone.** At 320 px the 280 px popup fits inside the 8 px collision padding; a day is
  about 31 px wide and 44 px tall under a coarse pointer, under the 44 px width `R-5.6-2`
  asks (choice 19; the same trade OTPField took).
- **Files.** `client.tsx`, `parts/date-picker-calendar.tsx`, `hook.ts` (`useDatePicker`,
  `useDatePickerCalendar`), `lib.ts`, `classes.ts`, `constants.ts` (`DATE_PICKER_DEFAULTS`),
  `boundaries.ts` (`DATE_PICKER_BOUNDARIES = { minDate: '0001-01-01', maxDate:
  '9999-12-31', firstDayOfWeekMin: 1, firstDayOfWeekMax: 7 }`), `schema.ts` (`size`,
  `invalid`, `fullWidth`, `placement`, `firstDayOfWeek`, and the two dates as ISO strings
  with the same bounds), `types.ts`, `index.tsx`, `meta.ts`, `README.md`. Demos: `basic`,
  `sizes`, `states` (invalid, disabled), `form`, `rtl`, `limits` (the sample's dates),
  `week-start` (`firstDayOfWeek` 1 and 6), `in-field` (the card's sample).
- **Tests.** The client set, and `.css.test.ts`, `.direction.dom.test.tsx` and
  `.placement.dom.test.tsx`, as Select. `date-picker.lib.test.ts`: parse and print; a string
  that is not a date; `addMonths` from 31 March back to 28 February and from 29 February
  2024 to 28 February 2025; the grid of September 2026 Monday first (one blank, then 1 to 6)
  and Sunday first (two blanks); year 1 and year 9999; 2100 is not a leap year; `clampIso`;
  `todayParts`, with `process.env.TZ` set in the test and restored after (Node reads it at
  once, measured in Node 22): `Asia/Riyadh` at `2026-10-14T22:30:00Z` is 15 October, and
  `America/Los_Angeles` at `2026-10-15T05:30:00Z` is 14 October. Server render: the trigger
  shows the default in `en` or the placeholder; the form input holds the ISO value and the
  `name`; `aria-describedby` starts with the value's id; a required DatePicker's
  `aria-describedby` resolves to its value, then "required", then the caller's text; a value
  outside the range is kept in the trigger and the input; no calendar is in the HTML. Dom:
  the open popup holds a button named "Close" inside the dialog, and a press on it closes
  the popup with no change; with `container` inside a `<form>`, a press on next month does
  not submit it; after a choice one `input` event reaches the form input; inside a FieldLive
  in a FormAction, choosing a day clears the field's error. Dom, keys: every key of the
  table in both directions; PageUp from 31 March; the range stops the active day; Enter
  chooses and closes; Escape keeps the value. Form: `FormData` from the server HTML, after a
  choice and after a reset. Browser, static: `serverEntries` on `date-picker--form`.
  Browser, live (`e2e/date-picker.spec.ts`): `basic` hydrates with no console error in
  `en`, `en-GB` and `ar` (a server and a browser ICU that print the date differently show
  up here); a click and Enter each open it with the focus on the chosen day; the keys move
  it; Tab from the grid goes to previous, next and close, then back to the grid, also on
  the first open, when the part loads after the popup; in RTL ArrowLeft is the next day;
  with `test.use({ timezoneId: 'Asia/Riyadh' })` and `page.clock.setFixedTime` at
  `2026-10-14T22:30:00Z` the open calendar marks 15 October with `aria-current="date"`;
  at the four edges of the viewport the popup is inside it; at 320 x 480 with a coarse
  pointer every day is at least 24 px wide and 44 px tall and the page does not scroll
  sideways; with `e2e/fixtures/date-picker-in-dialog.tsx` the first Escape closes the
  calendar and the second the dialog; with `date-picker-layouts.tsx` (see "Rules for all
  eight") at 320 and 390 px with a coarse pointer the two side by side are as wide as two
  Inputs there (124 and 159 px), each trigger keeps its height, and the page never scrolls
  sideways, and at 1280 px the trigger is as wide as an Input; with
  `date-picker-no-provider.tsx` it opens, formats in `en`, the popup is LTR and the keys
  work; axe on the open popup; under forced colours the chosen day is `Highlight` and
  today is underlined; the reset cases of Switch.
- **Mutation.** `addMonths` stops keeping the day inside the month: the lib test catches it. A
  second row: the RTL swap of the arrow keys is removed (the keyboard test). A third: the
  `Close` part is removed (the dom test). A fourth: `todayParts` reads the UTC getters (the
  lib test).
- **Not built:** Hijri and every other calendar (choice 16), a range (DateRangePicker), week
  numbers, a clear or a today button (choice 21), a text input to type a date, a time,
  `isDateDisabled`, a month or year menu, two months side by side, `readOnly`, the
  AdaptiveDatePicker connector (choice 19), a `locale` prop (the provider's), the drawn open
  look of the trigger (a ring while the popup is open: the focus is in the popup then).
- **For the reviewer:** the server and the browser each format the trigger's text with their
  own ICU: Node 22 writes `en-GB` "22 Sept 2026", and a browser with other data may write
  "Sep" and report a text mismatch at hydration (the live hydration test is where it shows).
  The 18.5 KB of the chip is a budget; no bundle was measured. What loads lazily is the
  calendar part's markup; its keys, the date math and the formatters sit in `hook.ts` and
  `lib.ts`, which the trigger loads (see Lazy); no library. The `Close` part mounts with the
  lazy part, so on a first open the trap starts once the part has loaded; whether Base UI
  switches its focus manager to modal then was not run. The sample's `minDate` is after the
  drawn selection: the sample wins, and the demo's default sits inside its range.

## Build order

0. **Gates.** Units 3 and 4 merged on `main`, `pnpm check` green there, and shared pull
   request 0 merged. Omar's answers to choices 1 to 5, which decide the scope, are asked
   before the session starts, not during it. Without them the session builds the Built as
   column, and every pull request says in its first line: built on the defaults of
   `unit-5.md`, choices not answered yet. The nine Arabic strings of shared pull request 1
   are in that item, supplied by the lead: the pull request copies them and lists them in
   its description for Omar to correct.
1. **The shared pull requests 1, 2 and 3**, one at a time, in that order. None touches a
   file another touches. `pnpm check` on each, and on `main` after each merge (GitHub's
   checks do not run).
2. **The components, one at a time**, each on `main` after the one before is merged:

   | # | Component | Needs | Why here |
   |---|---|---|---|
   | 1 | Meter | 2 | the smallest; Progress's sibling; warms up the server template |
   | 2 | Stepper | 1 | server, no script; the connector geometry is its only risk |
   | 3 | CodeBlock | 1 | the split pattern of Tag; one small client island |
   | 4 | Field | 3 | the form wiring every later control is shown in |
   | 5 | Form | 3, Field | closes Phase 4 with Field |
   | 6 | FileUpload | 1, Field (demo) | native first; DataTransfer and drops |
   | 7 | TreeView | 2 | windowing and a keyboard pattern with no Base UI part |
   | 8 | DatePicker | 1, Field (demo) | the riskiest: a popup, a lazy part, date math, Intl, two directions |

   If Omar allows two at once, the pairs that share no file are Meter beside Stepper, then
   CodeBlock beside Field. Everything after Field runs alone.
3. **What that leaves of Phase 4** (`docs/PLAN.md` 19):

   | Clause | Where it is met |
   |---|---|
   | Input and Textarea in server Fields, posted with JavaScript off, showing server errors on the right fields after the full-page response | `form--basic` posts with no script; `form--server-errors` shows how Fields render the errors handed to them. A server `Form` cannot read what its action returns: the round trip with no script is FormAction with `permalink`, or the app's own redirect, and it was not run here (no Next.js app) |
   | The same form with FormAction and FieldLive shows errors without a reload | `form--form-action`, live, with the typed values kept through React's reset |
   | Six controls submit the right FormData after hydration, and their defaults before it | Unit 4: `select/dummy/phase-4-form.tsx` |
   | Numeric limits clamp | Unit 4, and here Meter, FileUpload, DatePicker's dates and `firstDayOfWeek`, TreeView's collection numbers |
   | Ten thousand options under the collection limit | Unit 4: Combobox |
   | Every control right in RTL | Unit 4, and each `rtl` demo here |

## Choices for Omar

Every row has a default that is built, so nothing here blocks the build. Rows 1 to 5 decide
the scope and are asked before the session starts.

| # | Choice | Built as | The other option |
|---|---|---|---|
| 1 | Field, Label and Form | built: Field with FieldLive, Form with FormAction; Label is Field's `label` prop, not an export | not built: two clauses of Phase 4 stay open and eleven card samples import a component that does not exist |
| 2 | Meter | built: a server component, Progress's sibling, `min` and `max` clamped | not built: it is not among the 46, as AlertDialog was not |
| 3 | ErrorState and ErrorBoundary | not built: TreeView takes no `error` status, and neither TreeView nor FileUpload is wrapped, as Command and Combobox are not | build both (ErrorState as EmptyState is built, the action as children; ErrorBoundary a class component that remounts by key) and wrap TreeView and FileUpload |
| 4 | IconButton | not built: each component draws its own with `ICON_BUTTON` | a server IconButton on `buttonVariants` with a square size map, the icon as a child and `label` required; the drawn base/body icon on primary/solid read as a slip |
| 5 | Heading, Text, Container, Stack, Grid | not built; the eleven card samples that import Text or Heading change when the docs site is built | Heading and Text as tier-1 server components, so the samples stay as drawn |
| 6 | What FieldLive and FormAction are built on | our own wiring: the same ids, `<label for>` and `aria-describedby` as Field in the server HTML, and a plain `<form>` with `useActionState` | Base UI's Field and Form, as PLAN 12 says: names only after hydration, `noValidate` before it, a group needs Fieldset and Field.Item |
| 7 | The control object | `{ id, name, required, aria-labelledby, aria-describedby, aria-invalid }` for every control | PLAN 12's five, and a `group` prop on Field that adds `aria-labelledby` for the three group controls |
| 8 | Field's child | a function, as every card and PLAN 12 | an element as well, cloned with the control object, as the Accessibility page draws it |
| 9 | The hint and the error beside a Checkbox or a Switch | an `inline` prop: the control first, the label beside it, the hint and the error under the label | always stacked above and below, whatever the control |
| 10 | Stepper's client half | none: a server component that shows the current step from `value` | the catalog's split: clickable done steps with `defaultValue` and `onValueChange`, and a panel per step |
| 11 | Stepper's words | a new `stepper` label group | `labels.timeline`'s three words |
| 12 | Highlighting in CodeBlock | no dependency: plain code as drawn, and a `highlighted` node the caller made | `shiki` 4.5.0 as an optional peer of CodeBlock: 588 kB unpacked alone, 11,380 kB with its direct dependencies; its API returns a promise, so it needs an async `index.tsx` (an exception to `R-5.1-5`) or a client island |
| 13 | CodeBlock's surface | neutral/solid as drawn: a light block in Dark | a fixed dark surface: two new tokens declared the same in every mode, checked by `check-contrast` |
| 14 | CodeBlock's copy button | its own client part | the CopyButton component (18.3, tier 2), with the cross-import exception Toast has |
| 15 | Date code | `Intl` and our month grid (`docs/DECISIONS.md` 2026-10-03) | `@internationalized/date` 3.12.4 as an optional peer of DatePicker: 1,196 kB unpacked, 1,472 kB with its one dependency; it brings Hijri and Persian grids |
| 16 | Hijri | not in v0.1 (PLAN 22): the grid is Gregorian; names and digits follow the locale | an `islamic-umalqura` grid now, which Intl alone cannot count (month lengths) |
| 17 | The first day of the week | `firstDayOfWeek`, default the locale's, read in the browser; Monday where the browser has none | always Monday, as drawn |
| 18 | The chosen day | primary/solid, as the Components page and the card | primary/soft, as the connector card |
| 19 | DatePicker on a phone | the 280 px popup: a day about 31 px wide and 44 px tall under a finger | a Drawer calendar on a phone: the AdaptiveDatePicker connector |
| 20 | Rows of the month grid | six, always, so the popup never changes height | as many as the month needs, five as drawn |
| 21 | A clear or a today button | not built: neither is drawn | `clearable`, as the playground has it, with `common.clear` |
| 22 | FileUpload's browse | the whole zone is the native file input, unseen, so a click, a key or a drop reaches it with no script; "Browse" is a word of the prompt | a visible Browse button beside the zone |
| 23 | Upload progress | not built: the component never uploads (`R-8.5-2`); a row shows the name, the size, or why it was refused | a status map the app writes per file: progress, done, failed |
| 24 | FileUpload's limits | `maxFiles` 1 by default (1 to 100); `maxSize` 10 GiB by default and at most; no `accept` | other numbers |
| 25 | The file list | every row rendered: `maxFiles` caps it at 100 | windowed with `useCollection` |
| 26 | Tree keys in RTL | ArrowRight and ArrowLeft swap | the keys of the Authoring Practices, unchanged |
| 27 | Tree focus | `aria-activedescendant` on the tree, the one tab stop, so windowing never drops the focus | a roving `tabindex` on the rows |
| 28 | Tree names | `value`, `defaultValue`, `onValueChange` for the selection; `expanded`, `defaultExpanded`, `onExpandedChange` | other names, for `R-5.7-1` |
| 29 | Tree icons | `icon` is a ReactNode (`R-7-2`); no folder swap | IconName strings resolved by a server half, as the sample writes them |
| 30 | The provider's digits | unchanged: the provider passes `latn` unless told; a server half follows its locale tag | the provider stops defaulting, so `ar-u-nu-arab` decides everywhere (NumberField and Slider change too) |
| 31 | Keys of the day grid and the tree | our own code | Base UI's undocumented `internals/composite`, safe only while the pin stays 1.8.0 |
| 32 | Builders at once | one | two, as the pairs in Build order |
| 33 | Field's ids | `id ?? useId()`, and the label, hint and error ids from it, so one name on several Fields (a checkbox group, two forms on a page) never repeats an id | from the name, as PLAN 12 (`tc-f-<name>`): readable and linkable, but a page that repeats a name must pass `id` on all but one Field, or labels point at the wrong control |

## Where this file departs from docs/PLAN.md

The lead records these as one `docs/DECISIONS.md` entry in a docs branch, with what the
builders report, as for Units 3 and 4. No component branch edits that file.

- Field, Form and Meter are built, though they are not among the 46. Label is not a
  component (18.4).
- The control object of 12 gains `aria-labelledby`. Field's ids come from `useId()` unless
  `id` is given, never from the name (12: "deterministic ids from the required `name`";
  choice 33).
- FieldLive and FormAction use neither Base UI's Field nor its Form (12, 18.4). FormAction
  keeps the browser's own validation, and takes a function child that receives the action's
  state, so the fields keep what was typed through React's reset (12 gives it FieldLive
  children only).
- Stepper is a server component (18.6 says split).
- CodeBlock has no highlighter and its own copy part (18.1: "Shiki on the server + a client
  CopyButton"). Its copy button writes its own `hover:` (a 10% tint of neutral/on-solid),
  because `HOVER.ghost` reads the page's neutral/soft, which sits next to the block's text
  colour (`R-5.2-4`). Its rings stay the shared ones, recoloured through `--tc-ring`.
- TreeView writes its two rings with the ring's own tokens under its own conditions
  (`R-5.2-4`): the tree's while it has the keyboard and no mounted row holds the highlight,
  a row's while it holds it, as Command's highlighted row writes its own. `FOCUS_RING_INSET`
  on the tree would draw two rings at once.
- DatePicker is built on `Intl`, as `docs/DECISIONS.md` 2026-10-03 decided; PLAN 2 and 18.4
  still name react-day-picker and are corrected with this entry. Its grid is Gregorian. A
  day is narrower than 44 px under a coarse pointer on a phone (`R-5.6-2`). The month grid
  always has six rows. The popup carries a Close button, which nothing draws, because Base
  UI traps the focus only while one is mounted.
- The FileUpload list is not windowed (8.5, 18.4 "the file list is a collection"), and its
  rest props reach the input, not the root (`R-5.7-3`).
- TreeView and FileUpload take no `error` status and are not wrapped in ErrorBoundary (8.2).
  TreeView takes no `getKey`, `selectedItem` or request ids (8.5).
- `expanded`, `defaultExpanded` and `onExpandedChange` join the vocabulary (5.7).
- FileUpload, TreeView, CodeBlock and Field take no `size` (5.7, `R-5.7-2`): none has a
  visual scale.
- ErrorState, ErrorBoundary, IconButton, Heading, Text, Container, Stack and Grid, tier-1 rows
  of 18, are not built in v0.1.
- New infrastructure, which Phases 4 to 7 forbid without a record: nine label keys (six of
  them in two new groups), three tokens, `src/shared/form-errors.ts`.

Outside Unit 5, noticed while reading: PLAN 2 and 8.5 still describe TanStack Virtual, and
PLAN 2 and 18.4 react-day-picker; PLAN 19 still puts tiers 2 and 3 after v0.1; CLOUD-PLAN
Appendix A still says ten components per unit; `docs/STATUS.md` names only `unit-1.md` and
`unit-2.md` as design files and its header calls a 10 October entry the newest;
`createNumberFormat` reads only the `-u-nu-` extension, so `ar-EG`, whose own digits are
Arabic-Indic, prints Latin; Node 22's ICU writes `en-GB` "Sept"; the Figma install rows spell
`Datepicker` and `Fileupload`.
