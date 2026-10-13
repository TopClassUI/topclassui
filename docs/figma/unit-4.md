# Figma facts for Unit 4

The form controls: Switch, Checkbox, RadioGroup, Textarea, SegmentedControl, Slider,
NumberField, OTPField, Select and Combobox. That is the build order, not the order of the
catalog. Read `docs/figma/unit-1.md` first: its section "How to use this file" applies here
unchanged, except that no component branch edits `scripts/mutations/index.ts`. Then read two
sections of `docs/figma/unit-3.md`: "What the reviews of Unit 2 found" and "What Dialog
settled". Both apply here unchanged: the measuring is part of the build. "Rules for all ten"
below replaces "Rules for all fourteen" where the two differ. The brief every builder is
handed (`U3-BUILD.md`) applies too.

**Read this instead of Figma.** File `BxRSdAVOhk9Hj3Tkq4tjcy`, read on 2026-10-13 by one
reader, 26 plugin calls: the ten docs previewers in `Docs site - LTR` (133:148) and in its
copy on the Components page (438:2388), their drawings on the Components page, the three
component sets (Checkbox 90:422, Radio 90:493, Switch 90:574), and the pages Accessibility,
Right to left, Provider, Add with the CLI and Your first component. Text and layer facts
only, no screenshot. The planner of this file did not open Figma: every facts block is that
reader's note, trimmed. Where a fact looks wrong, build from the Build this block and say so
in the pull request.

Each component has the two parts of the earlier files: the facts in a fenced block, and
**Build this**, which wins where the two disagree. Each Build this block also holds the
component's `classes.ts` as a fenced block. Copy it: those strings are the ones that were
measured.

## What was checked, and what was not

Checked on 2026-10-13 against the checkout `u3-popover` (commit `51bf261`: main, the shared
pieces of Unit 3, and Dialog, Popover, Drawer, Tabs and Accordion), with Base UI 1.8.0 and
the Chromium of Playwright 1.63.0. Nothing was written into that checkout. The scripts are
in the lead's handoff folder, under `unit-4/scratch-plan/` (the planner's) and
`unit-4/scratch-baseui/` (the Base UI reader's).

- **Base UI types.** Every part and prop a Build this block names was read in the installed
  types under `node_modules/@base-ui/react/` and then looked up again by a script: 237 names
  in 38 type files, none missing, and the seven the blocks call absent are absent. Three
  corrections to what was assumed: `otp-field` does export a `Separator` in 1.8.0;
  `Select.Portal` has `container` and no `keepMounted`; `RadioGroup` has no `orientation`.
- **Classes.** The thirteen fenced `ts` blocks of this file were read back out of it and
  evaluated against the repo's shared constants: 82 constants, 284 distinct classes, each
  compiled alone with the repo's own entry (`compileCss` from `scripts/lib/harness.ts`). All
  produce a rule except the five markers that never do (`group/toggle`, `group/radios`,
  `group/slider`, `group/thumb`, `peer`); each marker is named by a variant that does. Of
  the 82 constants, 78 are the strings that were measured in the browser, character for
  character; the other four were added after. The blocks pass the repo's lint with no
  problem as a `classes.ts`, and get 11 errors under any other file name (`rounded-full`,
  `h-1`, `h-2`): keep every class string in a `classes.ts`.
- **Names.** Every shared constant, hook, helper, label key, token, icon and file this
  file leans on was looked up in the checkout: 105 exist, and the 42 a shared pull request
  or a component creates do not exist yet.
- **Two class traps, found here.** `src/styles.css` declares its sizes with
  `@theme inline`, which emits no `--spacing-*` and no `--radius-*` variable. So
  `w-[calc(var(--spacing-toggle-md)*1.75)]` compiles and resolves to nothing in a browser.
  Every size below is written in rem times `--tc-density`. And two classes for one property
  in one constant do not merge: the stylesheet order decides there, and `cn()` decides the
  other way once a part merges them (a switch track with two fills was painted white, and
  one with two `justify` classes would have centred its thumb). So the repo's `cn()` was
  run over every constant and over each set a part puts on one element: no constant holds
  a conflict, and the one override left is wanted (`SEGMENTED_FULL` over `inline-flex`).
- **Static pages in Chromium (the planner).** The class lists below were put on Base UI's
  own server HTML (`renderToStaticMarkup`, as `pnpm harness:build` does), with the repo's
  `pageHtml` and compiled stylesheet, and measured with the selector and the floors of
  `e2e/target-size.spec.ts`:
  - With the shared selector as it is, a page of fourteen toggles and five radios fails on
    19 hidden inputs of 1 x 1 px. With the selector of shared pull request 1 it has 19
    targets, none under 24 px, and none under 44 px at 390 x 844 with a coarse pointer.
  - Drawn boxes, at the five sizes: a checkbox and a radio are 14, 16, 20, 24 and 28 px; a
    switch track is 24.5 x 14, 28 x 16, 35 x 20, 42 x 24 and 49 x 28 px, its thumb 10, 12,
    16, 20 and 24 px, 2 px from the start when off and 2 px from the end when on, in both
    directions. The focus ring is on the drawn box (2 px solid, `--tc-ring`), and the
    target has no outline.
  - Invalid against checked: with the compound class the border of a checked invalid box is
    `--tc-danger-solid`; without it `--tc-primary-solid` won.
  - Forced colours, both palettes: a switch that is on is `Highlight` with a `HighlightText`
    thumb, off it is a `ButtonText` thumb in a `ButtonText` line; no target has an outline at
    rest. Ocean: a checkbox has a radius of 8 px at every size, so the 14 px box is a circle.
  - The field page, 52 targets: none under 24 px; none under 44 px at 390 px coarse; at
    320 px coarse only the six cells of a six-cell OTP field are (33 x 44 px), and the page
    has no sideways scroll at 1280, 390 or 320 px, in LTR and RTL.
  - A slider thumb is 24 x 24 px around a 20 px knob (44 x 44 coarse), and stays inside its
    control at 0 and at 100. A number field is 193.19 x 40 px, the width of an Input, with
    40 px steppers (44 coarse). OTP cells are 40 x 40 px (44 x 44 at 390 coarse). A segmented
    track is 40 px with 32 px segments (`xs`: 32 with 24; coarse: 52 with 44); seven long
    segments at 390 px scroll inside the track (620 px in 324). A textarea of three rows is
    82 px tall. A select trigger and a combobox input are 193.2 x 40 px.
  - axe: no violation on either page, in LTR and RTL.
- **A live prototype in Chromium (the planner).** A bundle built outside the repo with
  esbuild, resolved from `u3-popover`, with the same class table, inside `TopClassProvider`:
  - Toggles with a native button as root: a click on `label[for]` toggles a checkbox and a
    switch; Space toggles both; Enter toggles a switch; Enter on a checkbox does not toggle
    it and submits the form. A radio group: Tab lands on the checked radio, ArrowDown skips
    a disabled one and selects, ArrowRight goes back in RTL, a click on the label text
    selects. `FormData` after: `terms=on`, `digest=on`, `plan=free`.
  - Select, sixty options: nothing is mounted until the trigger has focus, then all sixty.
    The list is 280 px (7 rows of 40) of 2530, the selected row is in view, highlighted and
    focused. Twelve ArrowDown, Home, End: the highlight stays in view and `window.scrollY`
    stays 0. Enter selects, the hidden input follows and focus returns to the trigger. A
    letter typed on the closed trigger changes the value. `visibleRows={4}` gives 160 px. In
    RTL the popup ends at the right edge of the trigger. At 390 px coarse a row is 44 px and
    the popup stays 8 px inside the screen. While it is open `body` has `overflow: hidden`
    and Base UI adds four focus guards that axe counts (see Select).
  - Combobox, ten thousand options, Base UI's `virtualized` with `useCollection`: 15 options
    mounted on open, 20 after thirty-one ArrowDown, 13 at the end. ArrowUp past the first
    row lands on option 9994, which was never mounted: `aria-activedescendant` names it and
    it is in view. A wheel to the end leaves `window.scrollY` at 0. Typing `999` leaves 19
    rows (the filter is "contains"), `zzz` shows "No results". axe on the open popup: no
    violation. Escape on the closed input clears the value.
  - NumberField: 250 typed with `max={14}` becomes 14 on blur; Home goes to `min`;
    U+0661 U+0662 typed is 12. A value of 12.5 with the default step and `min={0}` makes the
    hidden input report `stepMismatch` and the form invalid; with no `min`, with
    `step={0.5}` or with `step="any"` it is valid.
  - OTPField in an RTL page: the cells run left to right, U+0661 and U+06F2 are taken as 1
    and 2, a letter is refused, ArrowLeft goes to the cell before. axe: no violation.
  - Slider: ArrowRight adds a step in LTR and takes one away in RTL; Shift with an arrow and
    Page Up move by ten; Home and End work; a click at three quarters of the track gives 75
    in LTR and 25 in RTL; a drag works.
  - Textarea: the rows follow the text from 3 to 6 and back, then it scrolls; the counter
    appears at nine tenths of the cap and turns bold at the cap.
- **happy-dom (the Base UI reader, twelve scripts).** What each control submits from its
  server HTML and after hydration, what names and tab stops the server HTML has, the keys of
  every part in both directions. Those results are quoted where a block depends on them.
  One thing misleads there: a click on a label does not reliably press a native-button
  toggle in happy-dom (a `label[for]` click after an Enter did nothing, and a click on the
  text of a wrapping label did nothing). Chromium presses it every time. Test label clicks
  in the browser spec.

Not checked. Say so in the pull request when one of these turns out wrong:

- Figma itself, by the planner. And nothing in Figma shows any of the ten in Arabic, or
  nine of the ten in Dark or Ocean.
- The prototype is not the component: no `index.tsx`, no `hook.ts`, no Server Component
  above it, no demo, and it was rendered on the client. Hydration was run in happy-dom only.
- Firefox, WebKit, a real phone, a screen reader. Dark and Ocean, apart from one radius.
- A range slider in a browser (its server HTML only). A vertical slider.
- `loadMore`, `hasMore` and `status` on the Combobox. How long a ten-thousand-row Combobox
  takes to open. The Combobox inside a Dialog.
- `required` on a Select or a NumberField against the browser's own validation bubble.
- OTP paste, `mask`, `autoSubmit`, and a default value written in Arabic-Indic digits.
- NumberField press-and-hold, wheel, and `ar-EG` digits in a browser.
- The Textarea skeleton, and the row estimate the server makes before hydration.
- Dropdown and Command are not on the branch that was read. What they settled for a 44 px
  row and for a windowed list is not in this file: read them first if they are merged.
- Next.js: that a Server Action receives these entries. Bundle sizes (`pnpm size` does not
  exist). The Arabic strings: this file is ASCII and lists the English ones.

## What Units 1 to 3 taught a form control

- **Input is the template of a field.** Its type asks for a name. `invalid` sets
  `aria-invalid`, and the line turns to danger and thickens, since hue alone is no cue. It
  has its own width (`--tc-input-width`) unless `fullWidth`. Under a coarse pointer its text
  is 16 px, or iOS zooms the page. A Latin-ordered value is `dir="ltr"` and keeps the form's
  side. Its cap is `resolveMaxLength`. Read-only is set from the prop. The rest props are
  spread first. Shared pull request 4 lifts those class strings so five more fields share
  them.
- **The shared static specs run before hydration, on every demo.** `e2e/target-size.spec.ts`
  measures every `input`, and Base UI puts a hidden one of 1 x 1 px beside eight of these
  ten controls: all but Textarea and Slider. Shared pull request 1 comes first, or the first
  demo fails `pnpm check`.
- **Base UI names nothing on the server.** `aria-labelledby` from a wrapping label, from
  `Field.Label`, from `Select.Label` or `Slider.Label` is added in an effect, and
  `e2e/axe.spec.ts` reads the server HTML. A control is named by what we write in that HTML:
  an attribute, or a native label that points at a native element.
- **Base UI serves a radio group with no tab stop.** Every radio is `tabindex="-1"` until
  hydration, as every tab was. Tabs fixed it in `useTabsTab`; shared pull request 6 lifts it.
- **A state told by a fill is lost under forced colours,** and a state told by hue alone is
  lost to many readers. A checked box, a switch that is on, the selected segment and an
  invalid field each differ by a shape, a mark or a thicker line, and take the system pair
  behind `forced-colors:`.
- **A popup's classes never reach the static stylesheet.** A closed listbox renders none.
  Select and Combobox ship a `<slug>.css.test.ts`, and their popup is tested on the live
  harness, which compiles from source.
- **A class that holds `&` or `>` never reaches the static stylesheet either.**
  `candidatesIn` splits the escaped attribute. No class below holds one. Do not add one.
- **A listbox popup is a portaled part.** It reads `usePortalLocale()` through `hook.ts` and
  puts `dir` and `lang` on the Positioner. It needs no scroll tab stop: its options take the
  focus (Select) or the highlight (Combobox).
- **`openOverlay` waits for the focus to move into the popup.** A Select moves it; a
  Combobox keeps it in the input, so its spec waits with `atRest` on the popup instead.
- **`TRANSITION` moves colour, opacity and `translate`,** so a switch thumb slides with it.
  It does not move `width` or `inset`.
- **happy-dom has no layout and its labels are approximate.** Sizes, scrolling, focus rings,
  a click on a label and every popup are browser tests.

## Rules for all ten

- **Nine are client components, one is split.** Every Base UI part starts with
  `'use client'` and throws under the `react-server` condition, so none of the nine can be a
  Server Component. Their `index.tsx` re-exports only (`R-5.1-2`), as `tabs/index.tsx` does.
  Textarea is the split: its `index.tsx` holds the native `<textarea>`.
- **The folder of a client control:** `index.tsx`, `client.tsx`, `classes.ts`,
  `constants.ts`, `schema.ts`, `types.ts`, `meta.ts`, `README.md`, `dummy/`, `test/`, and
  only where the block says so `hook.ts`, `lib.ts`, `boundaries.ts`, `parts/`. No
  `variants.ts`: a lookup is a plain object in `classes.ts`. No `skeleton.tsx`, except
  Textarea's. `client.tsx` is markup plus at most one hook call per part (`R-5.12-1`).
  `hook.ts` returns plain objects and writes no type argument in angle brackets
  (`check-boundaries` reads `<Letter` there as JSX). A folder with nothing to bound has no
  `boundaries.ts`.
- **Exports are flat (`R-9.2-3`), and a family names its root `Root` (`R-9.2-4`).** A
  control that is one element keeps its bare name:

  | Folder | Exports |
  |---|---|
  | `switch` | `Switch` |
  | `checkbox` | `Checkbox` |
  | `radio-group` | `RadioGroupRoot`, `RadioGroupItem` |
  | `textarea` | `Textarea`, `TextareaSkeleton` |
  | `segmented-control` | `SegmentedControlRoot`, `SegmentedControlItem` |
  | `slider` | `Slider` |
  | `number-field` | `NumberField` |
  | `otp-field` | `OTPField` |
  | `select` | `Select` |
  | `combobox` | `Combobox` |

  The samples write `RadioGroup` and `Radio`: under `R-9.2-4` they are `RadioGroupRoot` and
  `RadioGroupItem`. The install rows print `Numberfield` and `OTPfield`: the samples'
  `NumberField` and `OTPField` are right. Which families are parts and which are one
  element is choice 7.
- **`checked` stays `checked`.** `R-5.7-1` says controlled pairs are `value` and
  `defaultValue` and the event is `onValueChange`. `R-5.7-5` says a part's props are
  derived from Base UI's at the seam and never copied. On Switch and Checkbox the two
  meet: Base UI's state is `checked`, `defaultChecked` and `onCheckedChange`, and its
  `value` is already the string the form receives when the box is on, as on a native
  checkbox. So Switch and Checkbox keep Base UI's three names, and `value` keeps its
  native meaning. The other eight already use `value`, `defaultValue` and `onValueChange`.
  This is the recommendation `docs/CLOUD-PLAN.md` asks Switch to make; it is choice 2, and
  nothing waits for the answer.
- **A name, by type (`R-5.6-1`).** None of the ten draws text that names it, except a
  radio and a segment. Shared pull request 2 adds two unions. `ControlName` is Input's:
  one of `id` (for a `<label htmlFor>`), `aria-label` or `aria-labelledby` is required.
  `GroupName` is Tabs': one of `aria-label` or `aria-labelledby`.

  | Control | Type | The name lands on |
  |---|---|---|
  | Switch, Checkbox | `ControlName` | the root, a native `<button>` |
  | Textarea | `ControlName` | the `<textarea>` |
  | NumberField | `ControlName` | `id` on Base UI's Root, which gives it to the visible input; the two ARIA names on `NumberField.Input` |
  | Select | `ControlName` | `id` on the Root, which gives it to the trigger; the two ARIA names on the Trigger |
  | Combobox | `ControlName` | `id` on the Root, which gives it to the input; the two ARIA names on the Input |
  | OTPField | `id` or `aria-labelledby` | the first cell. Base UI drops `aria-label` on that cell on purpose |
  | Slider | `GroupName` | the range input inside the thumb. A caller's `id` cannot reach that input |
  | RadioGroupRoot, SegmentedControlRoot | `GroupName` | the `radiogroup`. Each radio is named by its own text |

- **A native element carries the role.** Base UI draws a switch, a checkbox and a radio as
  a `<span>`. A span is not labelable: with `<label htmlFor>` the server HTML has no name
  and axe reports `aria-toggle-field-name` (measured by the code reader). So Switch,
  Checkbox, `RadioGroupItem` and `SegmentedControlItem` pass `nativeButton` and
  `render={<button />}`: the root is a `<button type="button">` with the role, the `id`
  moves to it, a native label names it before any script runs, and a click on that label
  presses it. Neither prop is in our public types.
- **`invalid`.** A boolean, default `false`, on all ten. It sets `aria-invalid` on the
  element that carries the role (on the `radiogroup` for the two families, on the root
  `group` for a Slider), and an `aria-invalid` the caller passes survives when `invalid` is
  off, as on Input. The look keys on `aria-invalid`, never on a prop: the line turns to
  `--tc-danger-solid` and thickens to `--tc-ring-width`. No ring is always on. The design
  draws one (choice 9).
- **`required`, `disabled`, `readOnly`** are Base UI's and pass through. No required mark
  is drawn: that is a Field's. A disabled toggle is a `<button disabled>`, so it leaves the
  tab order and `DISABLED` dims it whole. Slider has no `readOnly` in Base UI.
- **Shaped for a Field that comes later.** `docs/PLAN.md` 12 hands a control
  `{ id, name, required, 'aria-describedby', 'aria-invalid' }`. Every control here takes
  those five as plain props and puts each on the right element, so a server Field can
  spread them with no change to the control. The one gap is Slider (see its block).
- **What the form receives.** Each control with a `name` puts a real input in the server
  HTML. Measured from that HTML, and the same after hydration (the Base UI reader):

  | Control | Submits |
  |---|---|
  | Switch, Checkbox, off | nothing; `name=<uncheckedValue>` when that prop is set |
  | Switch, Checkbox, on | `name=on`, or `name=<value>` |
  | Checkbox, indeterminate | nothing |
  | RadioGroup, SegmentedControl | `name=<value>`; nothing when no radio is checked |
  | Slider | `name=<value>`; the minimum when no default is given; the name twice for a range |
  | NumberField | `name=<the plain number>`, never the formatted text; `name=` when empty |
  | OTPField | `name=<what is typed so far>`; `name=` when empty |
  | Select, Combobox | `name=<value>`; `name=` with nothing chosen |
  | Textarea | its text, natively |
  | anything `disabled` | nothing. `readOnly` still submits |

  `name` is optional, as on a native control. Before hydration only Textarea can be
  changed; the other nine submit their default (`docs/PLAN.md` 12). Each of the ten ships
  `dummy/form.tsx`, and its spec reads `FormData` from the static page, where no script runs.
- **The target is not the drawn box (`R-5.6-2`).** A checkbox at `md` is 20 px and a slider
  knob too. The element that takes the press is at least 24 x 24 px, and 44 x 44 under a
  coarse pointer: it carries `TOUCH_TARGET`, and the drawn box is a child inside it. The
  focus ring is on the drawn box, by a group variant, so on a phone the ring is not 44 px
  wide. The component's own spec measures both boxes at all five sizes.
- **Sizes (`R-5.7-2`).** `size` is the six `SIZES`, default `md`, as `data-size` on the
  root. A field takes `FIELD_SIZE` or the heights of `CONTROL_HEIGHT`; a toggle box takes
  `TOGGLE_SIZE`. `md` is 20 px, as the sets say; the stages that draw 24 px are slips.
  `custom` emits no size class, so the drawn parts take their size from the caller's CSS.
  Where text is typed (Textarea, NumberField, Combobox, OTPField) it is 16 px under a
  coarse pointer.
- **Direction.** Logical classes only. A thumb that slides multiplies by `--tc-dir`
  (`R-5.3-2`). Arrow keys follow Base UI's `DirectionProvider`, which `TopClassProvider`
  mounts: a demo with no provider keeps LTR keys whatever its `dir`. Two values stay
  left-to-right in an Arabic form: the number of a NumberField (`dir="ltr"` on its input)
  and the cells of an OTPField (`dir="ltr"` on the group, inside its own
  `DirectionProvider`). A Slider mirrors.
- **Numbers.** NumberField and Slider always pass Base UI a `locale` and a
  `format.numberingSystem`: the caller's, else the provider's (`useLocale()`, and
  `useNumberFormat().resolvedOptions().numberingSystem`). Left to its defaults Base UI
  formats with the runtime's locale, the server and the browser can print different
  digits, and it silences the hydration warning instead of fixing the text.
- **Labels (`R-5.11-1`).** A client part reads `useLabels()` through `hook.ts`. Base UI
  writes five English strings into these parts. Four are replaced from `labels` (shared
  pull request 5); the fifth cannot be (see Combobox). No English in markup: the lint reads
  `aria-label` too.
- **Types are derived at the seam (`R-5.7-5`).** `Omit<Base.X.Props, 'className'>` plus a
  string `className`. Every Base UI prop passes through untouched unless the block removes
  it. A block lists only the props we add, change or remove. `className`, `style`, `ref`
  and the rest props reach the root element; a block says where a prop goes when the
  control has more than one element. The caller's `className` is merged last with `cn()`.
- **State attributes are Base UI's:** `data-checked`, `data-unchecked`,
  `data-indeterminate`, `data-disabled`, `data-readonly`, `data-selected`,
  `data-highlighted`, `data-popup-open`, `data-placeholder`. Style on them and never
  re-emit one. What we add is a design value (`data-size`, `data-orientation`,
  `data-placement`) or a state Base UI has no name for (`data-at-limit`, `data-over-limit`).
- **Imports.** No Unit 4 component imports another. `#components/svg`, a per-icon import
  from `#icons/data/`, and anything in `dummy/` are allowed.
- **Demos.** One per file. Every control in a demo is named and valid as server HTML. Each
  folder has `basic`, `sizes`, `states` (invalid, disabled, read-only), `form`, `rtl`
  (wrapped in `TopClassProvider` with `direction="rtl"` and `locale="ar"`) and
  `long-content` where the control holds caller text. No demo writes `tabIndex`.
- **Tests.** The file set of Tabs and Popover, by suffix: `.test.tsx` (server render),
  `.client.test.ts`, `.exports.test.ts`, `.types.test.ts`, `.compile.test.ts` (the README
  sample compiles; a control with no name does not), `.schema.test.ts`, `.meta.test.ts`,
  `.css.test.ts`, `.dom.test.tsx`, `.keyboard.dom.test.tsx` (every key of the pattern, in
  both directions), `.form.dom.test.tsx` (`FormData` from the server HTML and after a
  change), `.hydration.dom.test.tsx`, `.demos.ssr.test.tsx` and `.demos.rsc.test.tsx`.
  Then one new `e2e/<slug>.spec.ts`: the static page for what the server HTML promises
  (the form entries, the two boxes of the target, 320 and 390 px, forced colours), and the
  live harness for everything that needs a script. Each block lists what is the
  component's own.
- **Mutation.** `scripts/mutations/<slug>.ts`: the block's row, plus one per guarantee a
  class or a line carries. A row must be caught by `vitest run`.
- **`meta.ts`.** Category `forms`, `status: 'beta'`, `optionalDeps: []`,
  `baseUiRange: '1.8.0'` wherever `baseUi` is set. The tier is the catalog's
  (`docs/PLAN.md` 18.4), as Unit 3 did:

  | Folder | `name` | Tier | `rendering` | `baseUi` |
  |---|---|---|---|---|
  | `switch` | `Switch` | 1 | `client` | `switch` |
  | `checkbox` | `Checkbox` | 1 | `client` | `checkbox` |
  | `radio-group` | `RadioGroup` | 1 | `client` | `radio-group` |
  | `textarea` | `Textarea` | 1 | `split` | `null` |
  | `segmented-control` | `SegmentedControl` | 2 | `client` | `radio-group` |
  | `slider` | `Slider` | 1 | `client` | `slider` |
  | `number-field` | `NumberField` | 1 | `client` | `number-field` |
  | `otp-field` | `OtpField` | 3 | `client` | `otp-field` |
  | `select` | `Select` | 1 | `client` | `select` |
  | `combobox` | `Combobox` | 2 | `client` | `combobox` |

  `src/shared/meta.test.ts` forces `OtpField` for the folder `otp-field`. The export is
  `OTPField`, and the hand-written import block of its README says so (choice 24).
- **Deferred**, in every pull request: the four lines of `docs/CLOUD-PLAN.md` section 10,
  the bundle budget of `docs/PLAN.md` 14 (`pnpm size` does not exist), and the skeleton
  line of `docs/PLAN.md` 20 for the nine that have none. Textarea and Select also list the
  two clauses of Phase 4 that need a Field.

## Shared pull requests

Eight, each small, each on its own, each merged before the first component that needs it
(`docs/CLOUD-PLAN.md` section 9). None opens before Unit 3 is merged: 4 re-points Input, 6
re-points Tabs, and 7 and 8 sit on what Dropdown and Command leave in `src/shared`. When a
pull request moves a line that a mutation row anchors on, it moves the row too (its `file`
and its `from`), or `pnpm test:mutation` stops on a lost anchor: five rows of
`scripts/mutations/tabs.ts` anchor on `tabs/hook.ts`, and several of
`scripts/mutations/input.ts` on `input/classes.ts`.

1. **`fix/shared-target-hidden-input`.** Before everything: eight of the ten cannot ship a
   demo without it.
   - `scripts/lib/targets.ts` exports the selector, and `e2e/target-size.spec.ts` imports
     it in place of its own:

     ```text
     button, a[href], [role="button"], input:not([aria-hidden="true"]), input:not([tabindex="-1"]), select, textarea, [role="checkbox"], [role="radio"], [role="switch"]
     ```

   - What changes: an input that is both `aria-hidden="true"` and `tabindex="-1"` is no
     longer measured. No pointer and no key can reach it: Base UI clips it to 1 px, which
     also takes it out of hit testing. The three roles are added so the box a finger does
     hit is measured whatever element draws it.
   - `scripts/lib/targets.test.ts`, in the node project, with a happy-dom `Window`: Base
     UI's hidden input does not match; a plain input does; an input with only
     `aria-hidden="true"` does; one with only `tabindex="-1"` does; a
     `<span role="checkbox">` does.
   - Mutation rows in `scripts/mutations/harness.ts`: the selector measures every input
     again; it loses the three roles.
   - `e2e/focus-ring.spec.ts` does not change: a hidden input has no outline.
   - Measured: with the selector as it is, 19 inputs of 1 x 1 px fail on a page of toggles;
     with this one the same page has 19 targets and none is under 24 px, or under 44 px
     with a coarse pointer.
2. **`feat/shared-control-name`.** `src/shared/contracts/name.ts`, types only, with a
   compile test like `menu.compile.test.ts`:

   ```text
   ControlName = { id: string } | { 'aria-label': string } | { 'aria-labelledby': string }
   GroupName   = { 'aria-label': string } | { 'aria-labelledby': string }
   ```

   Each arm keeps the other keys optional, exactly as `InputName` in `input/types.ts` and
   `TabsListName` in `tabs/types.ts` are written today. Those two become aliases of the
   shared types and keep their public names; their own compile tests do not change. The
   README trap stays true for all ten: `Omit<XProps, 'y'>` merges the arms into one where
   no name is required.
3. **`feat/shared-toggle-styles`.** In `src/shared/classes.ts`, for Switch, Checkbox and
   the radio of a RadioGroup. Each with a test in `classes.test.ts` and a rule in a css
   test:

   ```ts
   /** What takes the press: 24 px, 44 under a coarse pointer, whatever size the drawn box is. */
   export const TOGGLE_TARGET = `group/toggle relative inline-flex shrink-0 items-center justify-center outline-none ${TOUCH_TARGET} ${DISABLED}`
   /** The ring of a focused target, drawn on the box inside it. */
   export const TOGGLE_RING = 'group-focus-visible/toggle:outline-solid group-focus-visible/toggle:outline-(length:--tc-ring-width) group-focus-visible/toggle:outline-offset-(length:--tc-ring-offset) group-focus-visible/toggle:outline-ring'
   /** The drawn box. It sets no fill and no justify: two classes for one property do not merge in a string. */
   export const TOGGLE_BOX = `inline-flex shrink-0 items-center ${BORDER_STRONG} ${TRANSITION} ${TOGGLE_RING}`
   /** Checked: the fill, and under forced colours the system pair, since a fill is erased there. */
   export const TOGGLE_ON = 'group-data-checked/toggle:border-primary-solid group-data-checked/toggle:bg-primary-solid group-data-checked/toggle:text-primary-on-solid forced-colors:group-data-checked/toggle:forced-color-adjust-none forced-colors:group-data-checked/toggle:border-[Highlight] forced-colors:group-data-checked/toggle:bg-[Highlight] forced-colors:group-data-checked/toggle:text-[HighlightText]'
   /** Invalid: red and thicker, as on Input. The compound class makes it win over checked. */
   export const TOGGLE_INVALID = 'group-aria-invalid/toggle:border-danger-solid group-aria-invalid/toggle:group-data-checked/toggle:border-danger-solid group-aria-invalid/toggle:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))] group-aria-invalid/toggle:inset-ring-danger-solid forced-colors:group-aria-invalid/toggle:border-(length:--tc-ring-width)'
   ```

   The group is named. A bare `group` would also match an ancestor: an accordion trigger
   is one, and a checkbox inside it would wear the trigger's focus ring. Mutation rows in
   `scripts/mutations/shared.ts`: the target loses `TOUCH_TARGET`; the ring moves back to
   the target; the compound invalid class is removed.
4. **`feat/shared-field-styles`.** Input's own strings move to `src/shared/classes.ts`,
   and Input is re-pointed at them with its fourteen test files and `e2e/input.spec.ts`
   unchanged. That is the proof nothing moved.

   ```ts
   /** The height of a target alone, for a field whose width may shrink. */
   export const TARGET_HEIGHT = 'min-h-[var(--tc-target-min,24px)] pointer-coarse:min-h-[var(--tc-target-coarse,44px)]'
   /** iOS Safari zooms the page when a focused field's text is under 16 CSS px. */
   export const FIELD_TEXT_COARSE = 'pointer-coarse:text-[max(1rem,16px)]'
   /** A percentage with a cap, which a flex row can shrink. fullWidth replaces it with w-full. */
   export const FIELD_OWN_WIDTH = 'w-[min(100%,var(--tc-input-width))]'
   /** Thicker as well as red (WCAG 1.4.1). Forced colours drop shadows, so there the line grows. */
   export const FIELD_INVALID = 'aria-invalid:border-danger-solid aria-invalid:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))] aria-invalid:inset-ring-danger-solid forced-colors:aria-invalid:border-(length:--tc-ring-width)'
   /** The same, on a box whose invalid field is inside it. */
   export const FIELD_INVALID_WITHIN = 'has-aria-invalid:border-danger-solid has-aria-invalid:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))] has-aria-invalid:inset-ring-danger-solid forced-colors:has-aria-invalid:border-(length:--tc-ring-width)'
   /** A value forced left-to-right keeps the form's side. */
   export const FIELD_LTR = 'data-ltr:text-match-parent data-ltr:placeholder:[unicode-bidi:plaintext]'
   /** Kept but not typed in. Set from the prop, never from read-only:. */
   export const FIELD_READ_ONLY = 'bg-neutral-soft'
   /** The box of a field: its fill, its 3:1 line and its radius. */
   export const FIELD_SURFACE = `rounded-control bg-surface-raised text-body ${BORDER_STRONG} ${CONTAIN} ${TRANSITION}`
   /** A field that is one element: the box, the ring, the floor and the invalid mark. */
   export const FIELD_BOX = `${FIELD_SURFACE} placeholder:text-muted ${DISABLED} ${FOCUS_RING} ${TOUCH_TARGET} ${FIELD_INVALID}`
   /** The type step of a field, for a wrapper that owns the width: --tc-input-width is in em. */
   export const FIELD_TEXT = {
     xs: `text-xs ${FIELD_TEXT_COARSE}`,
     sm: `text-sm ${FIELD_TEXT_COARSE}`,
     md: `text-sm ${FIELD_TEXT_COARSE}`,
     lg: 'text-base',
     xl: 'text-base',
     custom: '',
   } as const
   /** Height, inline padding and the type step of a one-line field. */
   export const FIELD_SIZE = {
     xs: `${CONTROL_SIZE.xs} ${FIELD_TEXT_COARSE}`,
     sm: `${CONTROL_SIZE.sm} ${FIELD_TEXT_COARSE}`,
     md: `${CONTROL_SIZE.md} ${FIELD_TEXT_COARSE}`,
     lg: `${CONTROL_SIZE.lg} ${FIELD_TEXT_COARSE}`,
     xl: `${CONTROL_SIZE.xl} ${FIELD_TEXT_COARSE}`,
     custom: '',
   } as const
   ```

   In `input/classes.ts`, `INPUT_OWN_WIDTH`, `INPUT_LTR`, `INPUT_READ_ONLY` and
   `INPUT_SIZE` become those constants under their old names, and `input/variants.ts`
   builds its base from `FIELD_BOX` and `FIELD_LTR`. `FIELD_INVALID` is
   `INPUT_INVALID_WIDTH` plus the `aria-invalid:border-danger-solid` that
   `input/variants.ts` writes beside it. `INPUT_SKELETON` stays where it is.
   `FIELD_TEXT` exists because of a measurement: a wrapper with no type step of its own
   resolved `--tc-input-width` against the page's 16 px and was 220.8 px beside a 193.2 px
   Input.
5. **`feat/shared-unit-4-labels`.** In `types.ts`, `en.ts`, `ar.ts`, and in
   `withOverrides()` of `get-labels.ts`, which names every group by hand. Four new groups,
   seven keys. English:

   | Key | English | Kind |
   |---|---|---|
   | `numberField.increase` | `Increase` | string |
   | `numberField.decrease` | `Decrease` | string |
   | `numberField.field` | `Number field` | string, the role description of the input |
   | `slider.minimum` | `Minimum` | string, the first thumb of a range |
   | `slider.maximum` | `Maximum` | string, the second thumb of a range |
   | `otp.character` | `Character 2 of 6` | `RatioLabel`: `(place, length, fmt)` |
   | `textarea.count` | `42 of 500 characters` | `RatioLabel`: `(length, max, fmt)` |

   Arabic: to be supplied, for all seven. `ar.ts` is typed `satisfies Labels`, so this pull
   request cannot merge without them: ask for the strings on the first day. Both ratio
   labels pass both numbers through `fmt`, as `rating.value` and `pagination.pageOf` do. A
   `src/shared/labels/unit-4.test.ts` like `unit-3.test.ts`, and rows in
   `scripts/mutations/shared-labels.ts`. Labels that exist and are used as they are:
   `select.placeholder` ("Select"), `collection.noResults` ("No results"), `common.loading`,
   `state.loadingMore`.
6. **`feat/shared-server-tab-stop`.** `src/shared/use-server-tab-stop.ts`, a client file:
   `useServerTabStop(isStop: boolean)` returns `{ tabIndex: 0 }` in the server render and
   in the first client render when `isStop` is true, and `{}` in every other case. It is
   the three lines `useTabsTab` has today
   (`useSyncExternalStore(subscribe, () => false, () => true)`); `tabs/hook.ts` calls it
   and Tabs' tests do not change. RadioGroup and SegmentedControl need it: Base UI serves
   every radio with `tabindex="-1"`. Measured in happy-dom with native-button radios: the
   server HTML has one `tabindex="0"`, on the checked radio, and hydration reports nothing.
7. **`feat/shared-option-contract`.** For Select and Combobox. Types only in
   `src/shared/contracts/option.ts`, with a type test:

   ```text
   ListOption = { value: string, label: string, disabled?: boolean }
   ```

   `value` is what the form receives and what `value` and `onValueChange` carry; it is
   unique in its list. `label` is what the row and the trigger show and what a query is
   matched against. Plain data, so a Server Component can pass a list. In
   `src/shared/contracts/collection.ts`:
   `COLLECTION_BOUNDARIES = { visibleRowsMin: 1, visibleRowsMax: 20 }`. And two class
   constants in `src/shared/classes.ts`:

   ```ts
   /** A row under a finger: ROW is 40 px tall and has no floor of its own. */
   export const ROW_TOUCH = 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]'
   /** The chosen row differs by weight as well as by its tick. */
   export const ROW_SELECTED = 'data-selected:font-medium'
   ```

   If Dropdown already landed a 44 px row in `src/shared`, use that and drop `ROW_TOUCH`.
8. **`fix/shared-collection-popup`.** For Combobox, the first user of `useCollection`
   unless Command got there first. Two parts; skip the one Command already did.
   - `offsetForIndex` in `src/shared/collection/window.ts`: `'nearest'` always puts the row
     at the bottom edge, also when it was above the view or already in it. It takes the
     current `scrollTop`: a row above the view goes to the top edge, a row below to the
     bottom edge, a row in view moves nothing. `scrollToIndex` passes
     `node.scrollTop`. Three cases written out in `window.test.ts`, and a mutation row.
   - Two tokens in `src/tokens.css`, under the one Progress sets inline:
     `--tc-list-pad-start: 0px;` and `--tc-list-pad-end: 0px;`. A windowed list sets them
     inline to the spacers of `useCollection` (`R-4-2`, `R-5.2-5`).

**No icon pull request.** Every icon these drawings use is in `src/icons/data`:
`caret-down`, `check`, `minus`, `plus`, `circle-fill`, `spinner`. **No other token:**
`--tc-list-rows` exists, and `visibleRows` sets it inline.

### Field, Label and Form

They are tier 1 in the catalog, first and last in Phase 4 of `docs/PLAN.md` 19, and in none
of the five units of `docs/CLOUD-PLAN.md`. Nine of the ten samples wrap their control in
`<Field name label hint>{(control) => ...}</Field>`, and the CLI page says `select` copies
`field` with it. Nothing draws one: no Field, Form, Label, hint, error text or required
mark exists anywhere in the file, and none is among the 46 cards.

**Built in this unit: none of the three** (choice 1). The ten do not wait for them:

- Every control takes `id`, `name`, `required`, `aria-describedby` and `aria-invalid` as
  plain props and puts each on the right element, so the control object of
  `docs/PLAN.md` 12 spreads onto it later with no change.
- README samples and demos name a control with a plain `<label htmlFor>`, as
  `input/dummy/labelled.tsx` does. No sample imports `topclassui/field`.
- Two clauses of Phase 4 stay open and are listed under Deferred: the form of Input and
  Textarea inside server Fields posted to a Server Action with JavaScript off, and the same
  form with `FormAction` and `FieldLive`. The other clauses are met here: see Build order.

What this unit learned that a Field will need:

- The child is a function, as `docs/PLAN.md` 12 and every card write it. The element
  child on the Accessibility page (`<Field><Input /></Field>`) is stale: a server Field has
  no context to reach an element through.
- `<label for>` names every control here in the server HTML except three: a Slider, a
  RadioGroup and a SegmentedControl. For those the Field must hand over the id of its
  label as `aria-labelledby`, which the control object of `docs/PLAN.md` 12 does not carry.
- Where the label, the hint and the error sit beside a Checkbox, a Switch or a RadioGroup
  is not drawn and not decided here.
- Base UI's Field cannot wire a native Input or Textarea. `FieldLive` needs
  `Field.Control` with `render`.

## Switch

```text
Where: Components page, COMPONENT_SET "Switch" 90:574, 25 variants: size (xs | sm | md | lg | xl) x state (off | on | focus-visible | disabled-off | disabled-on). Also the "switch" row of FRAME "Checkbox, Radio and Switch" 72:239. Docs card "Previewer: Switch" 135:1334.
Set description: "The knob sits at the start or the end through auto-layout alignment, so it lands on the correct side in RTL without a second design."
The track: 25 x 14, 28 x 16, 35 x 20, 42 x 24, 49 x 28, all raw (the heights equal Size toggle/*, the width is 1.75 x the height). Padding 2. Radius raw, half the height.
The thumb: an ellipse, track height minus 4 (10, 12, 16, 20, 24).
- off: fill -> neutral/soft, stroke -> base/line-strong 1 inside, thumb -> base/surface-raised at the start (x = 3)
- on: fill -> primary/solid, no stroke, thumb -> primary/on-solid at the end (2 px from the end)
- focus-visible: the off switch, and a ring rectangle 2 px -> base/ring 4 px outside, radius half height + 4
- disabled-off, disabled-on: opacity 0.5
Docs card: chip "client - 0.9 KB". Head: "An on/off switch whose thumb travels the correct way in right-to-left layouts, with no code change."
Playground: size (md), tone (primary), toggles defaultChecked, disabled, required, invalid, all off (135:1389, 135:1392, 135:1395, 135:1398).
Stage (135:1366): two switches 42 x 24, gap 16: off, on. No label.
States (6): off, on, hover (the same as off), focus-visible, disabled (off at 0.5), invalid (off, stroke -> danger/solid 1, ring rectangle -> danger/solid 2).
Code (150:1024): import { Field } from 'topclassui/field'; import { Switch } from 'topclassui/switch'
  <Field name="digest" label="Weekly digest" hint="One email every Sunday">{(control) => (<Switch {...control} defaultChecked />)}</Field>
Note: "xs and sm still grow to 44px under a coarse pointer, so the thumb stays tappable."
Page: Right to left (183:1448): "A translate, a transform origin, a gradient or a swipe has no logical form in CSS. These multiply by --tc-dir, which is 1 in LTR and -1 in RTL." Sample: --tc-slide: calc(1rem * var(--tc-dir)); className="translate-x-(--tc-slide)".
Surprising:
- Two ways to move the thumb: the set says alignment, the Right to left page says a translate multiplied by --tc-dir.
- The card has an invalid state and the set has none. The set has disabled-on and the card has one "disabled", drawn off.
- The stage draws 42 x 24 with size md (md is 35 x 20).
- No width or height of the switch is bound, unlike Checkbox and Radio. The radius is raw, so Ocean changes nothing.
- The off thumb sits 3 px from the start and the on thumb 2 px from the end.
- No label is drawn: it comes from Field in the sample. required is a toggle with no drawing.
- No hover look and no checked focus look is drawn.
```

**Build this.** Client. First and alone: it settles the names of the state props, the
native button, the target around a small box and the form test, for every toggle after it.
Needs shared pull requests 1, 2 and 3. Base UI `switch` (`baseUi: 'switch'`): `Root`,
`Thumb`.

- **Export:** `Switch`, one element, in `client.tsx`.
- **What Base UI gives** (from `SwitchRoot.d.ts`): `checked`, `defaultChecked` (default
  `false`), `onCheckedChange(checked, details)`, `name`, `form`, `value` (the string
  submitted when on, default `on`), `uncheckedValue`, `disabled`, `readOnly`, `required`,
  `id` and `inputRef` (the hidden input). Root and Thumb set `data-checked`,
  `data-unchecked`, `data-disabled`, `data-readonly` and `data-required`. Space, Enter and
  a click toggle it. Left alone the root is a `<span role="switch">` followed by a hidden
  `<input type="checkbox">`.
- **What we change.** `nativeButton` and `render={<button />}`, always, and neither is in
  `SwitchProps`. The root is then `<button type="button" role="switch">`, the `id` is on
  it, and `disabled` is the real attribute (rendered).
- **What we add.** `size`: the six `SIZES`, default `md`. `invalid`: default `false`. The
  name: `ControlName`. `checked`, `defaultChecked` and `onCheckedChange` keep their names.
- **Markup.** `Base.Root` with `data-size`, `aria-invalid` and `TOGGLE_TARGET`. Inside it
  a `<span>` with `SWITCH_TRACK` and `SWITCH_TRACK_SIZE[size]`. Inside that `Base.Thumb`
  with `SWITCH_THUMB` and `SWITCH_SLIDE[size]`. `className`, `style`, `ref` and the rest
  props reach the root.

  ```ts
  // switch/classes.ts
  /** The track. Its line stays when it is on, in the colour of the fill, so nothing moves. */
  export const SWITCH_TRACK = `rounded-full bg-neutral-soft p-px ${TOGGLE_BOX} ${TOGGLE_ON} ${TOGGLE_INVALID}`
  /** The heights of the toggle scale, and 1.75 times that as the width. */
  export const SWITCH_TRACK_SIZE = {
    xs: 'h-toggle-xs w-[calc(1.53125rem*var(--tc-density))]',
    sm: 'h-toggle-sm w-[calc(1.75rem*var(--tc-density))]',
    md: 'h-toggle-md w-[calc(2.1875rem*var(--tc-density))]',
    lg: 'h-toggle-lg w-[calc(2.625rem*var(--tc-density))]',
    xl: 'h-toggle-xl w-[calc(3.0625rem*var(--tc-density))]',
    custom: '',
  } as const
  /** As tall as the inside of the track. Forced colours erase a fill, so there it is a system colour. */
  export const SWITCH_THUMB = `block aspect-square h-full rounded-full bg-surface-raised group-data-checked/toggle:bg-primary-on-solid forced-colors:forced-color-adjust-none forced-colors:bg-[ButtonText] forced-colors:group-data-checked/toggle:bg-[HighlightText] ${TRANSITION}`
  /** R-5.3-2: the width minus the height, toward the inline end. */
  export const SWITCH_SLIDE = {
    xs: 'group-data-checked/toggle:translate-x-[calc(0.65625rem*var(--tc-density)*var(--tc-dir))]',
    sm: 'group-data-checked/toggle:translate-x-[calc(0.75rem*var(--tc-density)*var(--tc-dir))]',
    md: 'group-data-checked/toggle:translate-x-[calc(0.9375rem*var(--tc-density)*var(--tc-dir))]',
    lg: 'group-data-checked/toggle:translate-x-[calc(1.125rem*var(--tc-density)*var(--tc-dir))]',
    xl: 'group-data-checked/toggle:translate-x-[calc(1.3125rem*var(--tc-density)*var(--tc-dir))]',
    custom: '',
  } as const
  ```

- **What that draws** (measured): tracks of 24.5 x 14, 28 x 16, 35 x 20, 42 x 24 and
  49 x 28 px; thumbs of 10, 12, 16, 20 and 24 px, 2 px from the start when off and 2 px
  from the end when on, in LTR and in RTL. The target is 24 px tall around every track,
  and 44 x 44 px under a coarse pointer.
- **Keyboard and ARIA.** The Authoring Practices switch: `role="switch"`, `aria-checked`,
  Space and Enter. All Base UI's.
- **Form.** `name`, `value`, `uncheckedValue`, `required` and `form` are Base UI's. Off it
  submits nothing; on it submits `name=on`. `dummy/form.tsx` holds one switch that is on in
  a plain `<form>`.
- **RTL.** The thumb is laid out at the inline start and slides by a translate times
  `--tc-dir`. No class names a side.
- **Files.** `client.tsx`, `classes.ts`, `constants.ts`, `schema.ts` (`size`, `invalid`),
  `types.ts`, `index.tsx`, `meta.ts`. No `hook.ts` and no `boundaries.ts`. This pull
  request also adds `e2e/form.ts`: `serverEntries(page, form = 'form')` returns the entries
  of `new FormData(...)` read in the page. Every later control imports it.
- **Tests.** Types and compile: a Switch with no name does not compile; `nativeButton` and
  `render` are not props; `onCheckedChange` receives a boolean. Server render: the root is
  a `button` with `role="switch"`, the `id` is on it, the hidden input carries the `name`.
  Dom: a click, Space and Enter each call `onCheckedChange` once; controlled and
  uncontrolled; `disabled` and `readOnly` do nothing; `className` wins last. Form:
  `FormData` from the server HTML, and after a press. Browser, static pages: at each of the
  five sizes the track and the thumb have the sizes above and the target is at least 24 px,
  then 44 px under a coarse pointer; the thumb is 2 px from the end when on, in both
  directions; `serverEntries` on `switch--form` is `[['digest', 'on']]`; under forced
  colours a switch that is on is filled and its thumb can be seen; an invalid track has a
  2 px danger line. Browser, live: a click on `label[for]` toggles it; Tab then Space; the
  ring is painted around the track and the target has no outline.
- **Mutation.** `SWITCH_SLIDE` loses `var(--tc-dir)`, so the thumb leaves its track in
  Arabic. A css test that reads the compiled rule catches it.
- **Not built:** `tone` (only primary is drawn), a label, a hint and a required mark
  (they are a Field's), a hover look (none is drawn), the invalid ring that is always on,
  text or an icon inside the thumb, a loading state.
- **For the reviewer:** the track keeps a line when it is on; the drawing drops it, which
  would move the thumb by a pixel. The off thumb is 2 px from the start, not the drawn 3.
  The ring is around the track, on a phone too, while the target is 44 px. `required` on a
  switch means "must be on", as on a native checkbox: say so in the README.

## Checkbox

```text
Where: Components page, COMPONENT_SET "Checkbox" 90:422, 30 variants: size (xs | sm | md | lg | xl) x state (unchecked | checked | indeterminate | focus-visible | disabled | invalid). Also FRAME "Checkbox, Radio and Switch" 72:239. Docs card "Previewer: Checkbox" 135:1086.
Set description: "Five sizes against six states, including the indeterminate state a parent checkbox shows."
The box: width and height -> Size toggle/<size> (14, 16, 20, 24, 28), radius -> Knobs radius/chip (4; 100 in Ocean), content centered.
- unchecked: fill -> base/surface-raised, stroke -> base/line-strong 1 inside
- checked: fill -> primary/solid, no stroke, icon/check at 72% of the box (10.08, 11.52, 14.4, 17.28, 20.16) -> primary/on-solid
- indeterminate: the same with icon/minus
- focus-visible: the unchecked box, and a "focus ring" rectangle 2 px -> base/ring, 4 px outside, radius 8 raw
- disabled: the unchecked box at opacity 0.5
- invalid: fill -> base/surface-raised, stroke -> danger/solid 1, and the "focus ring" rectangle with stroke -> danger/solid 2
Second card in the frame, "target card" 105:357: "The box you see is not the target you press". "A checkbox at xs is 14px, which is smaller than WCAG 2.5.8 allows on its own. The drawn box is the visual; the clickable area is the dashed square, which never goes below 24px on a mouse or 44px on a touch screen." Four drawings: "xs box 14px, target 24px", "sm box 16px, target 24px", "md box 20px, target 24px", "xs on a touch screen, target 44px".
Modes frame (84:261): a checked and an unchecked md Checkbox in Light, Dark and Ocean. In Ocean the radius resolves to 100: the box is a circle.
Docs card: chip "client - 1.2 KB". Head: "Checked, unchecked or indeterminate; a hidden input posts the default before hydration."
Playground: size (md), tone (primary), toggles defaultChecked, indeterminate, disabled, invalid, all off.
Stage (135:1118): three boxes 24 x 24, gap 14, radius 4 raw: unchecked, checked, indeterminate. No label beside them.
States (6): unchecked, checked, indeterminate, hover (the same drawing as unchecked), focus-visible, disabled. All 24 x 24.
Code (150:992): <Field name="terms" label="I accept the terms" hint="You can change this later">{(control) => (<Checkbox {...control} defaultChecked />)}</Field>
Note: "Before hydration it submits its default value: the control is a span, not an input."
Surprising:
- The head says a hidden input posts the default. The note says the control is a span, not an input.
- The label comes from Field. No drawing puts a label, a hint or an error beside or under a checkbox.
- The playground says size md and the stage draws 24 px, which is toggle/lg. md is 20.
- The set has an invalid state and the card has none. The card has hover and the set has none.
- tone is a prop. Only primary is drawn.
- Not drawn: checked and disabled together, checked and focused, checked and invalid, a parent with children.
- In Ocean a checkbox is a circle, the same shape as a radio. Only the tick and the fill tell them apart.
```

**Build this.** Client. After Switch, which it copies. Needs shared pull requests 1, 2 and
3. Base UI `checkbox` (`baseUi: 'checkbox'`): `Root`, `Indicator`.

- **Export:** `Checkbox`, one element.
- **What Base UI gives** (from `CheckboxRoot.d.ts`): `checked`, `defaultChecked`,
  `onCheckedChange`, `indeterminate`, `name`, `form`, `value`, `uncheckedValue`, `disabled`,
  `readOnly`, `required`, `parent`, `id`, `inputRef`. The root sets `data-checked`,
  `data-unchecked`, `data-indeterminate` (then neither of the other two), `data-disabled`,
  `data-readonly`, `data-required` and `aria-checked`, which is `mixed` when indeterminate.
  `Indicator` renders only while the box is checked or indeterminate. Space toggles it.
  Enter does not: on a native button it submits the form the box is in (measured).
- **What we change and add.** As Switch: the native button, `size`, `invalid`,
  `ControlName`. `parent` reaches Base UI but does nothing without a `CheckboxGroup`,
  which is not built.
- **Markup.** `Base.Root` with `data-size`, `aria-invalid` and `TOGGLE_TARGET`. Inside it
  a `<span>` with `CHECKBOX_BOX` and `TOGGLE_SIZE[size]`. Inside that `Base.Indicator` with
  `CHECKBOX_MARK`, holding `<Svg icon={minus} size="80%" />` when `indeterminate` is set
  and `<Svg icon={check} size="80%" />` otherwise: 80% of the inside of the box is the drawn
  72% of the whole. The colour of the mark is on the box, never on the svg.

  ```ts
  // checkbox/classes.ts
  /** Indeterminate is filled as checked is: Base UI then sets neither data-checked nor data-unchecked. */
  export const CHECKBOX_MIXED = 'group-data-indeterminate/toggle:border-primary-solid group-data-indeterminate/toggle:bg-primary-solid group-data-indeterminate/toggle:text-primary-on-solid forced-colors:group-data-indeterminate/toggle:forced-color-adjust-none forced-colors:group-data-indeterminate/toggle:border-[Highlight] forced-colors:group-data-indeterminate/toggle:bg-[Highlight] forced-colors:group-data-indeterminate/toggle:text-[HighlightText] group-aria-invalid/toggle:group-data-indeterminate/toggle:border-danger-solid'
  export const CHECKBOX_BOX = `rounded-chip bg-surface-raised ${TOGGLE_BOX} ${TOGGLE_ON} ${TOGGLE_INVALID} ${CHECKBOX_MIXED}`
  export const CHECKBOX_MARK = 'flex size-full items-center justify-center'
  ```

- **What that draws** (measured): boxes of 14, 16, 20, 24 and 28 px, ticks of 9.6, 11.2,
  14.4, 17.6 and 20.8 px, a radius of 4 px, a target of 24 px (28 at `xl`, 44 coarse).
  Invalid: a danger line 2 px thick, also when checked. In Ocean the radius is 8 px at
  every size (`rounded-chip` is capped), so the `xs` and `sm` boxes are circles and the
  `md` box nearly one.
- **Keyboard and ARIA.** The Authoring Practices checkbox: Space; `aria-checked` with
  `mixed`. Base UI's.
- **Form.** Off or indeterminate it submits nothing; on, `name=on` or `name=<value>`.
- **Files.** As Switch.
- **Tests.** As Switch, and: `indeterminate` gives `aria-checked="mixed"` and the dash;
  the tick is 14.4 px in the 20 px box; Enter leaves the state alone; a click on
  `label[for]` and on a label that wraps the box each toggle it once (browser); the three
  states differ under forced colours.
- **Mutation.** The mark ignores `indeterminate`, so a parent box draws a tick.
- **Not built:** `CheckboxGroup` and the parent box that goes with it (its own catalog
  row, tier 2), `tone`, a label child (choice 5), a hover look, the always-on invalid ring.
- **For the reviewer:** an indeterminate box submits nothing. Enter submits the form: that
  is Base UI copying the native control. In Ocean a small checkbox and a radio are both
  circles until one is checked (choice 12). When the group is built its boxes each need
  the `name`: Base UI's `CheckboxGroup` has none to hand down.

## RadioGroup

```text
Where: Components page, COMPONENT_SET "Radio" 90:493, 25 variants: size (xs..xl) x state (unchecked | checked | focus-visible | disabled | invalid). Also the "radio" row of FRAME 72:239. Docs card "Previewer: RadioGroup" 135:1207.
Set description: "The selected dot is circle-fill from the icon set, not a drawn circle, so it scales with the rest."
The circle: width and height -> Size toggle/<size> (14..28). Radius raw, equal to the size. No radius variable.
- unchecked: fill -> base/surface-raised, stroke -> base/line-strong 1 inside
- checked: fill -> base/surface-raised, stroke -> primary/solid 2 inside, icon/circle-fill at 50% of the circle (7, 8, 10, 12, 14) -> primary/solid
- focus-visible: the unchecked circle, and a ring rectangle 2 px -> base/ring 4 px outside
- disabled: the unchecked circle at 0.5
- invalid: stroke -> danger/solid 1, and the ring rectangle -> danger/solid 2
Docs card: chip "client - 1.6 KB". Head: "Radios rendered as buttons under one name: one Tab stop, read-only until hydration."
Playground: size (md), tone (primary), orientation (vertical), toggles disabled, required, invalid, all off.
Stage (135:1239): a column, gap 10, of three rows; each row gap 9: a 24 x 24 circle (raw), then a label Inter Regular 14 -> base/body. "Monthly", "Yearly" (selected), "Lifetime".
States (6): unselected, selected, hover (the same as unselected), focus-visible, disabled, invalid. One circle each, no label.
Code (150:1008): import { Radio, RadioGroup } from 'topclassui/radio-group'
  <Field name="plan" label="Plan">{(control) => (<RadioGroup {...control} defaultValue="pro"><Radio value="free">Free</Radio><Radio value="pro">Pro</Radio><Radio value="team">Team</Radio></RadioGroup>)}</Field>
Note: "The group carries name and defaultValue; each Radio carries only its value and label."
Surprising:
- Three names: the set is "Radio", the Contents list says "Radio", the card is "RadioGroup". The sample exports RadioGroup and Radio.
- The head says "read-only until hydration". The Forms section says every control but Input and Textarea submits its default value before it.
- The stage draws 24 px with size md (md is 20).
- The radius is raw, so Ocean changes nothing here. The dot is an icon, not a shape.
- orientation has one value, vertical. No horizontal group is drawn. tone has one value.
- The gap between a circle and its label is 9 and between rows 10, both raw. This is the only drawing in the ten of a label beside a control.
```

**Build this.** Client. After Switch; it can run beside Checkbox and Textarea. Needs
shared pull requests 1, 2, 3 and 6. Base UI `radio-group` and `radio`
(`baseUi: 'radio-group'`): `RadioGroup`, `Radio.Root`, `Radio.Indicator`.

- **Parts**, flat, in `client.tsx`: `RadioGroupRoot` and `RadioGroupItem`.
- **What Base UI gives.** The group (`RadioGroup.d.ts`): `value`, `defaultValue`,
  `onValueChange(value, details)`, `name`, `form`, `disabled`, `readOnly`, `required`,
  `inputRef`; a `<div role="radiogroup">`. A radio (`RadioRoot.d.ts`): `value` (required),
  `disabled`, `readOnly`, `required`, `inputRef`; a `<span role="radio">` and a hidden
  `<input type="radio">`. The arrow keys move and select, skip a disabled radio and wrap;
  ArrowLeft and ArrowRight swap under an RTL provider (run in Chromium). There is no Home
  or End, Enter does not select, and there is no `orientation` prop.
- **`RadioGroupRoot`.** `size`: default `md`. `orientation`: `'vertical' | 'horizontal'`,
  default `vertical`; it is layout only, written as `data-orientation`. `invalid` sets
  `aria-invalid` on the group. Its type asks for `GroupName`. `useRadioGroupRoot()` in
  `hook.ts` shares the size and the value the page opens on (`value`, else `defaultValue`,
  read once) with its items through a context, as `useTabsRoot` does.
- **`RadioGroupItem`.** A `<label>` with `RADIO_ITEM` and `RADIO_ITEM_TEXT[size]`. In it,
  `Base.Radio.Root` as a native button with `RADIO_TARGET`, holding a `<span>` with
  `RADIO_BOX` and `TOGGLE_SIZE[size]`, holding `Base.Radio.Indicator` with `RADIO_DOT` and
  `<Svg icon={circleFill} size="56%" />` (a dot of 10 px at `md`, as drawn). After the
  button, a `<span>` with `RADIO_LABEL` around the children. The label element names the
  button in the server HTML, and a click on the text selects the radio. `className` and
  `style` go to the `<label>`; `ref` and the rest props go to the radio button.
- **One tab stop in the server HTML.** The item spreads
  `useServerTabStop(value === opensOn)` before its other props.

  ```ts
  // radio-group/classes.ts
  export const RADIO_GROUP = {
    vertical: 'group/radios flex min-w-0 max-w-full flex-col items-start gap-2.5',
    horizontal: 'group/radios flex min-w-0 max-w-full flex-row flex-wrap items-start gap-x-4 gap-y-2.5',
  } as const
  export const RADIO_ITEM = 'inline-flex min-w-0 max-w-full items-center gap-2 text-body'
  export const RADIO_ITEM_TEXT = { xs: 'text-xs', sm: 'text-sm', md: 'text-sm', lg: 'text-base', xl: 'text-base', custom: '' } as const
  /** The peer of its label text, so the text of a disabled radio dims with it. */
  export const RADIO_TARGET = `peer ${TOGGLE_TARGET}`
  /** aria-invalid sits on the group: role="radio" does not take it. */
  export const RADIO_INVALID = 'group-aria-invalid/radios:border-danger-solid group-aria-invalid/radios:group-data-checked/toggle:border-danger-solid group-aria-invalid/radios:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))] group-aria-invalid/radios:inset-ring-danger-solid group-aria-invalid/radios:group-data-checked/toggle:inset-ring-danger-solid forced-colors:group-aria-invalid/radios:border-(length:--tc-ring-width)'
  /** Checked: a line 2 px thick in primary, and the dot. The fill does not change. */
  export const RADIO_BOX = `rounded-full bg-surface-raised text-primary-solid ${TOGGLE_BOX} group-data-checked/toggle:border-primary-solid group-data-checked/toggle:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))] group-data-checked/toggle:inset-ring-primary-solid ${RADIO_INVALID}`
  export const RADIO_DOT = 'flex size-full items-center justify-center'
  /** A choice is read whole, so its text wraps. */
  export const RADIO_LABEL = 'min-w-0 wrap-anywhere peer-disabled:opacity-50'
  ```

- **Keyboard and ARIA.** The Authoring Practices radio group: one tab stop, on the checked
  radio; the arrows move and select; Space selects. Base UI's.
- **Form.** `name`, `required` and `form` on the root. It submits `name=<value>`, and
  nothing while no radio is checked.
- **RTL.** A column or a wrapping row of logical flex. The circle is at the inline start
  of its text.
- **Files.** `client.tsx`, `hook.ts`, `classes.ts`, `constants.ts`
  (`RADIO_GROUP_ORIENTATIONS`), `schema.ts` (`size`, `orientation`, `invalid`), `types.ts`,
  `index.tsx`, `meta.ts`. No `boundaries.ts`.
- **Tests.** Types: a root with no name does not compile; an item with no `value` does
  not. Server render: one `tabindex="0"`, on the radio of the default value; each radio is
  a `button` inside a `label`; `aria-invalid` is on the group. Hydration: clean, and the
  tab stop is then Base UI's. Keyboard: the four arrows in both directions, a disabled
  radio skipped, the wrap at both ends, Space. Form: before and after. Browser, static:
  circles of 14 to 28 px inside 24 px targets (44 coarse); a long label wraps at 320 px and
  the page does not scroll sideways; axe. Browser, live: Tab lands on the checked radio; a
  click on the text selects once; in the `rtl` demo ArrowRight goes to the radio before.
- **Mutation.** The item drops the server tab stop, so the group cannot be reached by Tab
  until the page hydrates.
- **Not built:** `tone`, `RadioCards` (its own row, tier 2), a data-driven `RadioGroup`
  that takes `items`, a description under a label, Home and End.
- **For the reviewer:** with no `value` and no `defaultValue` the server HTML has no tab
  stop: the root cannot know which item is first (choice 35). A radio label wraps instead
  of ending in an ellipsis (choice 32). The checked line is 2 px, as drawn, and the dots
  measure 6.7, 7.8, 10.1, 12.3 and 14.6 px against the drawn 7, 8, 10, 12 and 14. Each
  radio is a native button, so a disabled one leaves the arrow order: check that against
  the Authoring Practices, which keep it focusable.

## Textarea

```text
Where: Components page, FRAME "Select and Textarea" 72:191, row "textarea" 72:223 (not a component set). Docs card "Previewer: Textarea" 135:660.
Frame text (72:193): "A Select trigger is an Input with a caret. A Textarea is an Input that grows. Both keep the same border, radius and ring."
Drawing: three boxes, captioned "idle", "focus-visible", "disabled".
The box: 300 x 96, padding 12 / 16 raw, radius -> Knobs radius/control, fill -> base/surface-raised, stroke 1 inside. Height raw. Text Inter Regular 14, not bound.
- idle (72:227): stroke -> base/line, "Write your message" -> base/muted
- focus-visible (72:231): stroke -> base/line-strong, two lines of text -> base/body, and a ring rectangle 2 px -> base/ring 4 px outside, radius 12 raw
- disabled (72:236): opacity 0.5, fill -> base/surface, stroke -> base/line
Docs card: chip "split - 0 KB server + 1.2 KB client". Head: "Native textarea on the server; autosize and the live counter are the only client parts."
Playground: variant (outline), size (md), maxRows (6), toggles autosize, showCount, disabled, invalid, all off.
Stage (135:692): a column 300 wide, gap 6.
- box 300 x 78, padding 10 / 16, radius -> Knobs radius/control, stroke -> base/line, "Tell us what you think about TopClass UI." on two lines -> base/body
- under it a row with a counter at the end: "42 / 500" Roboto Mono Regular 10 -> base/muted
States (6), each 126 x 50: idle, hover (stroke base/line-strong), focus-visible (ring), disabled (0.5, fill base/surface), invalid (stroke -> danger/solid 1, ring -> danger/solid 2), at limit (the same drawing as invalid).
Code (149:1098): <Field name="bio" label="About you" hint="A short paragraph is enough">{(control) => (<Textarea {...control} rows={3} maxRows={10} maxLength={500} />)}</Field>
Note: "Server-rendered on its own; maxRows is what loads the small client half for autosize."
Elsewhere, the Forms section: "Input and Textarea work before any JavaScript loads".
Surprising:
- showCount is off and a counter is drawn. The sample has maxLength and no showCount.
- The counter says 42 and the text has 41 characters.
- "at limit" is drawn in danger, the same as invalid.
- The playground says maxRows 6 and the sample says maxRows={10}.
- autosize is a toggle; the note says maxRows is what loads the client half. Two switches for one behaviour.
- The padding is 12 / 16 on the Components page and 10 / 16 in the card. Size padding-y/md is 6.
- No resize handle, no size but md, and no second variant are drawn.
```

**Build this.** Split, and the only one of the ten that works before any script. It can
run beside Checkbox and RadioGroup. Needs shared pull requests 2, 4 and 5. No Base UI part
exists (`baseUi: null`).

- **Exports:** `Textarea` and `TextareaSkeleton`, from `index.tsx`.
- **`index.tsx` always renders the native `<textarea>`,** as Input renders its `<input>`:
  the rest props first, then `rows`, `maxLength`, `aria-invalid`, `data-invalid`,
  `data-size`, and `TEXTAREA_BOX`, `TEXTAREA_SIZE[size]`, the width and the read-only
  fill. With neither `autosize` nor `showCount` that is all: no client code is rendered.
- **Props.** `ControlName`, as Input. `size`: default `md`. `invalid`: default `false`.
  `fullWidth`: default `false`; otherwise the field has `FIELD_OWN_WIDTH`. `rows`: default
  3, clamped to `TEXTAREA_BOUNDARIES` (`rowsMin: 1`, `rowsMax: 40`). `maxLength`:
  `number | null | undefined`, through `resolveMaxLength(maxLength, 'textarea')`, so the
  default is 5000 and `null` removes the cap (`R-5.7-8`). `autosize`: default `false`.
  `maxRows`: default 6, clamped to `maxRowsMin: 1` and `maxRowsMax: 40`, and never under
  `rows`. `showCount`: default `false`. `readOnly` adds `FIELD_READ_ONLY`, set from the
  prop. `dir` is the caller's; `dir="auto"` is native.
- **The client half is a holder around that same textarea.** With `autosize` or
  `showCount`, `index.tsx` wraps its `<textarea>` in `TextareaField` from `client.tsx`,
  an internal part that is not exported. The textarea stays the server's element, so it
  takes typing before hydration. The holder is a `<div>` with `TEXTAREA_HOLDER`,
  `FIELD_TEXT[size]` and the width (`w-full` with `fullWidth`, else `FIELD_OWN_WIDTH`); the
  textarea inside it is `w-full`. It hears the textarea through the `input` event, which
  bubbles. `index.tsx` makes the id of the counter with `useId` and joins it to the
  caller's `aria-describedby`.
- **Autosize** (`useTextareaField` in `hook.ts`, `rowsFor` in `lib.ts`). After every
  commit and every input: set `rows` back to the caller's, read `scrollHeight`, and set
  `rows` to `ceil((scrollHeight - padding) / lineHeight)`, clamped between `rows` and
  `maxRows`; past `maxRows` the textarea scrolls. With `autosize` it is `resize-none`, and
  otherwise `resize-y`. The server cannot measure: it renders
  `estimateRows(text, rows, maxRows)`, the count of line breaks plus one, clamped.
- **The counter.** A `<span>` under the box, at the inline end, with the id. It holds the
  visible text `42 / 500` in a `<span aria-hidden dir="ltr">`, both numbers through the
  provider's number format, and `labels.textarea.count(length, max, fmt)` in a `sr-only`
  span. With `showCount` it is always shown. With `autosize` alone it appears once the
  length reaches `COUNTER_THRESHOLD` of the cap. With `maxLength={null}` there is none.
  At the cap it carries `data-at-limit` and turns bold; that is not an error. Over the cap,
  which only a value set by code can be, it carries `data-over-limit` and takes the danger
  text colour. The holder does not own the textarea, so it does not mark it invalid.

  ```ts
  // textarea/classes.ts
  export const TEXTAREA_BOX = `block ${FIELD_BOX} ${FIELD_LTR}`
  /** The block padding of each size. The inline padding and the type step are the field's. */
  export const TEXTAREA_SIZE = {
    xs: `px-pad-x-xs py-1.5 text-xs ${FIELD_TEXT_COARSE}`,
    sm: `px-pad-x-sm py-1.5 text-sm ${FIELD_TEXT_COARSE}`,
    md: `px-pad-x-md py-2.5 text-sm ${FIELD_TEXT_COARSE}`,
    lg: 'px-pad-x-lg py-3 text-base',
    xl: 'px-pad-x-xl py-4 text-base',
    custom: '',
  } as const
  export const TEXTAREA_RESIZE = { plain: 'resize-y', autosize: 'resize-none' } as const
  export const TEXTAREA_HOLDER = 'grid max-w-full gap-1.5'
  export const TEXTAREA_COUNT = 'justify-self-end font-mono text-xs tabular-nums text-muted empty:hidden data-at-limit:font-semibold data-at-limit:text-body data-over-limit:font-semibold data-over-limit:text-danger-on-soft'
  export const TEXTAREA_SKELETON = `block whitespace-pre ${BORDER_WIDTH} border-transparent ${CONTAIN} animate-pulse rounded-control bg-neutral-soft motion-reduce:animate-none`
  ```

- **`TextareaSkeleton`**, in `skeleton.tsx`: a `<span aria-hidden>` with
  `TEXTAREA_SKELETON`, `TEXTAREA_SIZE[size]` and the width, holding `rows` lines of a
  no-break space. It takes the control's own `size`, `fullWidth` and `rows`, as
  `InputSkeleton` takes its two.
- **Measured.** Three rows at `md` are 82 px tall (16 px text on touch: 90.5 px). In the
  prototype the rows went 3, 5, 6 and back to 3 as lines came and went, and at 6 it
  scrolled. The counter stayed empty at 41 of 60, read `55 / 60` at 55, and turned bold at
  60, where the browser stopped the typing.
- **Keyboard and ARIA.** Native. The counter is the description of the field, not a live
  region.
- **Form.** Native: `name`, `required`, `minLength`, `maxLength`, `form`.
- **RTL.** The counter is at the inline end; its two numbers stay in LTR order.
- **Files.** `index.tsx`, `client.tsx`, `hook.ts`, `lib.ts`, `skeleton.tsx`, `classes.ts`,
  `constants.ts`, `boundaries.ts`, `schema.ts`, `types.ts`, `meta.ts`.
- **Tests.** Server render: a plain Textarea is one `<textarea>` and no holder (a walk of
  the tree finds no client part); the default cap is 5000 and `null` removes it; `rows`
  99 becomes 40. Node: `rowsFor` and `estimateRows`, written out. Dom: the counter text
  and its three states; `aria-describedby` keeps the caller's id and adds the counter's.
  Hydration: with and without the holder. Browser, static: typing works with no script;
  two Textareas in a row fit 320 px; the text is 16 px under a coarse pointer; the
  skeleton is as tall as the field. Browser, live: the rows follow the text up to
  `maxRows` and back; a pre-filled autosize field does not jump more than a row at
  hydration.
- **Mutation.** The cap stops going through `resolveMaxLength`, so a Textarea has no
  default limit.
- **Not built:** the `variant` prop (one value), a live region for the counter, a check
  written with `zod/mini` (choice 30), danger at the limit (choice 10), a counter on a
  Textarea that renders no client code, a character count by grapheme.
- **For the reviewer:** the sample's `rows={3} maxRows={10}` with no `autosize` grows
  nothing here: `autosize` is the switch and `maxRows` only bounds it. With the holder the
  width belongs to the holder: a width class in `className` lands on the textarea inside
  it, so say in the README to use `fullWidth` or to size the parent. A long first line
  that wraps is under-counted by the server's estimate, so that field grows at hydration
  (choice 29).

## SegmentedControl

```text
Where: Components page, FRAME "Sidebar, Segmented control, Number field and OTP" 83:244, groups 83:304 and 83:311 (not a component set). Docs card "Previewer: SegmentedControl" 138:668. The card sits under "Actions", not "Forms".
Frame text (83:246): "... the control the docs use to switch mode and direction ..."
Drawing: two tracks. Everything but colour is raw.
The track ("Segmented"): 37 tall, horizontal, gap 2, padding 3, radius 8, fill -> base/surface, stroke -> base/line 1 inside.
A segment: 29 tall, gap 6, padding 6 / 12, radius 8.
- selected: fill -> base/surface-raised, shadow 0 1 3 black at 0.08, text Inter Medium 14 -> base/body, icon -> base/body
- not selected: no fill, text Inter Regular 14 -> base/muted, icon -> base/muted
- first track (83:291): icon/sun "Light" (selected), icon/moon "Dark", icon/monitor "System"; icons 14. Caption "theme switcher - light, dark, system".
- second track (83:306): "LTR" (selected), "RTL", no icon. Caption "direction switcher".
Docs card: chip "client - 1.2 KB". Head: "A radio group drawn as one track; arrow keys select as they move, and reverse in RTL."
Playground: size (md), tone (neutral), orientation (horizontal), toggles fullWidth, invalid, disabled, all off.
Stage (138:701): track 228 x 35, gap 2, padding 3, radius 8. Segments 27 tall, gap 5, padding 6 / 11, text Inter 12, icons 14.
States (5): idle (A selected), hover (nothing selected, nothing else changes), focus-visible (nothing selected, a ring 2 px -> base/ring 4 px outside the whole track, radius 12), checked (the same drawing as idle), disabled (nothing selected, 0.5).
Code (145:984): 'use client'
  import { SegmentedControlItem, SegmentedControlRoot } from 'topclassui/segmented-control'
  const [view, setView] = useState('board')
  <SegmentedControlRoot value={view} onValueChange={setView} aria-label="View"><SegmentedControlItem value="board">Board</SegmentedControlItem><SegmentedControlItem value="table">Table</SegmentedControlItem><SegmentedControlItem value="calendar">Calendar</SegmentedControlItem></SegmentedControlRoot>
Note: "Arrow keys move between segments, and the direction for RTL comes from TopClassProvider."
Surprising:
- The only one of the ten whose sample has flat part names, is controlled with useState, and has no Field, no name and no label prop: it carries aria-label.
- invalid is a toggle on a control whose sample is not in a form. No invalid drawing.
- Text is 14 on the Components page and 12 in the card. Segment padding 6 / 12 and 6 / 11.
- The track and the segment both have radius 8 raw. In Ocean nothing here would turn into a pill, while every Input does.
- hover, focus-visible and disabled are drawn with no segment selected. "checked" is the same as "idle".
- The focus ring is around the whole track, not around one segment.
- tone and orientation have one value each. No vertical track is drawn.
```

**Build this.** Client. After RadioGroup, which settles the item and the tab stop. Needs
shared pull requests 1, 2, 4 and 6. Base UI has no segmented part. It is `radio-group`
and `radio` (`baseUi: 'radio-group'`), not `toggle-group`: the head of the card and
`docs/PLAN.md` 16 both call it a radio group, and only a radio group gives one value, a
`name`, a segment that is always selected, and arrows that select as they move. A toggle
group is buttons with `aria-pressed` and an array value, it can be emptied by pressing the
pressed button again, and it submits nothing (choice 15).

- **Parts:** `SegmentedControlRoot` and `SegmentedControlItem`, as the sample writes them.
- **`SegmentedControlRoot`.** `Base.RadioGroup`. Its type asks for `GroupName`, and for
  `value` or `defaultValue`: a segmented control always has a selected segment. `size`:
  default `md`. `fullWidth`: default `false`; with it the track fills its parent and the
  segments share it equally. `invalid` sets `aria-invalid` on the track. The size and the
  opening value reach the items through a context made in `hook.ts`, as in RadioGroup.
- **`SegmentedControlItem`.** `Base.Radio.Root` as a native button, with the server tab
  stop. `icon?: ReactNode` before the label, in a `<span>` with `SEGMENTED_ICON`. The
  label through `truncateLabel(children, SEGMENTED_CONTROL_BOUNDARIES.labelMaxLength)`, a
  bound of 100, so its text sits in a span with `LABEL`. No `Radio.Indicator`: the raised
  surface is the mark.

  ```ts
  // segmented-control/classes.ts
  /** The track scrolls sideways inside itself when its segments do not fit, as a list of tabs does. */
  export const SEGMENTED_ROOT = `relative inline-flex max-w-full items-stretch gap-0.5 rounded-control bg-surface p-0.75 scroll-px-px ${BORDER} ${SCROLL_X} ${FIELD_INVALID}`
  export const SEGMENTED_ROOT_SIZE = { xs: 'min-h-control-xs', sm: 'min-h-control-sm', md: 'min-h-control-md', lg: 'min-h-control-lg', xl: 'min-h-control-xl', custom: '' } as const
  export const SEGMENTED_FULL = 'flex w-full *:flex-1'
  /** The selected segment is raised and heavier. Forced colours erase both, so there it takes the system pair. */
  export const SEGMENTED_ITEM = [
    'inline-flex shrink-0 items-center justify-center-safe gap-1.5 overflow-hidden whitespace-nowrap rounded-control font-medium text-muted',
    'data-checked:bg-surface-raised data-checked:font-semibold data-checked:text-body data-checked:shadow-sm',
    'forced-colors:data-checked:forced-color-adjust-none forced-colors:data-checked:bg-[Highlight] forced-colors:data-checked:text-[HighlightText]',
    'forced-colors:data-checked:shadow-none forced-colors:data-checked:[--tc-ring:HighlightText]',
    CONTAIN, FOCUS_RING_INSET, TOUCH_TARGET, TRANSITION, DISABLED,
  ].join(' ')
  export const SEGMENTED_ITEM_SIZE = { xs: 'px-2 text-xs', sm: 'px-2.5 text-sm', md: 'px-3 text-sm', lg: 'px-4 text-base', xl: 'px-5 text-base', custom: '' } as const
  export const SEGMENTED_ICON = 'flex shrink-0'
  ```

- **What that draws** (measured): a track 40 px tall at `md` with segments of 32 px; at
  `xs` the track is 32 px, because a segment cannot go under 24; under a coarse pointer
  the segments are 44 px and the track 52. With `fullWidth` three segments are equal.
  Seven long segments in 326 px scroll inside the track and the page does not move.
- **Keyboard and ARIA.** `role="radiogroup"` with radios. The arrows move and select and
  swap in RTL. The ring is on the focused segment, inside it, because the track clips.
- **Form.** `name` on the root gives the form `name=<value>`. Without a `name` it is a
  view switch, as in the sample.
- **Files.** `client.tsx`, `hook.ts`, `classes.ts`, `constants.ts`, `boundaries.ts`,
  `schema.ts` (`size`, `fullWidth`, `invalid`), `types.ts`, `index.tsx`, `meta.ts`.
- **Tests.** Types: no name, or neither `value` nor `defaultValue`, does not compile.
  Server render: one tab stop, on the selected segment. Keyboard: arrows in both
  directions; a disabled segment is skipped. Dom: `onValueChange` with the value, never
  with nothing. Browser: the heights above; a 300-character label ends in an ellipsis and
  the track stays inside a 320 px page; the selected segment differs under forced
  colours; the ring of a focused segment is fully painted.
- **Mutation.** The selected segment loses `data-checked:font-semibold`, so only a fill
  tells it from the others.
- **Not built:** `tone` (neutral is the only one drawn), `orientation` (no vertical
  track), a sliding indicator, a ring around the whole track, a toggle-group flavour that
  can be empty.
- **For the reviewer:** the `xs` track is 4 px taller than an `xs` Button. The radius of
  the track and of a segment is `rounded-control`, so both are pills in Ocean (choice 13).
  The card is under "Actions" in the design; `meta.ts` says `forms`, from the catalog.

## Slider

```text
Where: Components page, FRAME "Slider and Rating" 77:252 (not a component set). Docs card "Previewer: Slider" 135:1455.
Frame text (77:254): "Both are drag controls, so both need a keyboard path: arrow keys move a slider, and a rating is a radio group underneath. WCAG 2.5.7 makes that mandatory, not optional."
Drawing: three sliders, each a frame 240 x 20, captioned "idle", "focus-visible", "disabled". Everything but colour is raw.
- track: 240 x 6, radius 3, fill -> neutral/soft
- filled part: 6 tall, radius 3, fill -> primary/solid; 84 wide (idle), 144 (focus-visible), 48 (disabled)
- thumb: a 20 x 20 ellipse, fill -> base/surface-raised, stroke -> primary/solid 2 inside
- focus-visible: a 28 x 28 ellipse, stroke -> base/ring 2, no fill, 4 px outside the thumb
- disabled: the whole slider at opacity 0.5
Docs card: chip "client - 1.9 KB". Head: "Single or range; arrow keys and a click on the track replace every drag."
Playground: size (md), tone (primary), orientation (horizontal), toggles disabled, showValue, invalid, all off.
Stage (135:1487): two sliders 260 wide, 18 px apart, each with one thumb: track 6 tall, thumb 18 x 18, filled 104 and 182.
States (6): idle, hover (the same as idle), active (the filled part is longer; nothing else changes), focus-visible (a 26 x 26 ring ellipse), disabled (0.5), invalid (filled part and thumb stroke -> danger/solid).
Code (149:986): <Field name="volume" label="Volume" hint="Drag, or use the arrow keys">{(control) => (<Slider {...control} defaultValue={60} min={0} max={100} step={5} />)}</Field>
Note: "Ships a hidden input, so it submits with the form but cannot move before hydration."
Page: Accessibility: "Every drag has a keyboard path" - "WCAG 2.5.7. A Slider takes arrow keys."
Surprising:
- The three layers are laid out in a row, not stacked: the geometry of the drawing is not usable; only the sizes and colours are.
- The head says "Single or range". No slider with two thumbs is drawn. The stage has two sliders with one thumb each.
- The thumb is 20 on the Components page and 18 in the card. Track height 6 in both.
- showValue is a toggle. No value text, no tooltip, no tick mark and no min or max label is drawn.
- size and orientation are props. One size and one direction are drawn.
- No hover look and no active look are drawn; "active" only moves the value.
- The sample is one element, Slider: no part name.
```

**Build this.** Client. It can run beside NumberField and OTPField. Needs shared pull
requests 2, 4 and 5. Base UI `slider` (`baseUi: 'slider'`): `Root`, `Control`, `Track`,
`Indicator`, `Thumb`, `Value`. `Slider.Label` is not used: it names nothing until
hydration.

- **Export:** `Slider`, one element.
- **What Base UI gives** (from `SliderRoot.d.ts` and `SliderThumb.d.ts`): `value` and
  `defaultValue` (a number or an array), `onValueChange(value, details)` with
  `details.activeThumbIndex`, `onValueCommitted`, `min` (0), `max` (100), `step` (1),
  `largeStep` (10), `minStepsBetweenValues` (0), `orientation`, `disabled`, `name`, `form`,
  `format`, `locale`, `thumbAlignment`, `thumbCollisionBehavior`. No `readOnly` and no
  `required`. The root is a `<div role="group">`. Each thumb holds a visually hidden
  `<input type="range">`, which takes the focus and the `name`. Base UI clamps the value to
  `min` and `max` when it renders (500 with `max={100}` rendered 100). On a Thumb,
  `aria-label`, `aria-labelledby` and `aria-describedby` go to that input, and `index` is
  needed for a range to exist in the server HTML.
- **Keys** (run in Chromium, `step={5}`): ArrowRight and ArrowUp add a step, ArrowLeft and
  ArrowDown take one away, Shift with an arrow and Page Up or Page Down move by
  `largeStep`, Home and End go to the ends. Under an RTL provider ArrowRight takes a step
  away and ArrowLeft adds one. A click on the track moves the thumb there. That is the
  keyboard path `R-5.6-3` asks for; a test presses every key.
- **What we add.** `size`: default `md`. `invalid`: default `false`, as `aria-invalid` on
  the root. `fullWidth`: default `false`; otherwise the slider has `FIELD_OWN_WIDTH`.
  `showValue`: default `false`; it renders `Base.Value` after the control. The name:
  `GroupName`. `min`, `max` and `step`, when passed, are clamped to `SLIDER_BOUNDARIES`:
  `limitMin: -1e15`, `limitMax: 1e15`, `stepMin: 0.000001` (`R-5.7-7`).
- **What we remove.** `thumbAlignment`: it stays `center`. The `edge` value hides the
  thumb in the server HTML and places it with an inline script, which needs a CSP nonce.
- **One thumb or two.** A number gives one thumb. An array of two gives a range; its type
  is a pair. For one thumb the name and `aria-describedby` go to the Thumb. For a range the
  name goes to the root, and the thumbs are named `labels.slider.minimum` and
  `labels.slider.maximum`, each with `getAriaValueText={(formatted) => formatted}`: Base
  UI's own value text is the English "20 start range".
- **Markup.** `Base.Root` with `SLIDER_ROOT`, the width, `data-size` and `aria-invalid`.
  In it `Base.Control` with `SLIDER_CONTROL`, holding `Base.Track` with `SLIDER_TRACK` and
  `SLIDER_TRACK_SIZE[size]`, holding `Base.Indicator` with `SLIDER_INDICATOR` and one
  `Base.Thumb` per value with its `index` and `SLIDER_THUMB`. Each thumb holds a `<span>`
  with `SLIDER_KNOB` and `TOGGLE_SIZE[size]`. With `showValue`, `Base.Value` with
  `SLIDER_VALUE` follows the control. `useSlider()` in `hook.ts` returns the labels, the
  locale and the numbering system.

  ```ts
  // slider/classes.ts
  export const SLIDER_ROOT = `group/slider flex min-w-0 max-w-full items-center gap-3 text-sm ${DISABLED}`
  /** Padded by half a target on each side, so a thumb at 0 or at 100 stays inside the box. */
  export const SLIDER_CONTROL = `relative flex min-w-0 flex-1 touch-none select-none items-center px-[calc(var(--tc-target-min,24px)/2)] pointer-coarse:px-[calc(var(--tc-target-coarse,44px)/2)] ${TARGET_HEIGHT}`
  /** Invalid adds a line around the track: the red fill alone is a cue by hue. */
  export const SLIDER_TRACK = `w-full rounded-full bg-neutral-soft ${FORCED_EDGE} group-aria-invalid/slider:outline-solid group-aria-invalid/slider:outline-(length:--tc-line-width) group-aria-invalid/slider:outline-danger-solid forced-colors:group-aria-invalid/slider:outline-(length:--tc-ring-width)`
  export const SLIDER_TRACK_SIZE = { xs: 'h-1', sm: 'h-1', md: 'h-1.5', lg: 'h-2', xl: 'h-2', custom: '' } as const
  export const SLIDER_INDICATOR = 'rounded-full bg-primary-solid group-aria-invalid/slider:bg-danger-solid forced-colors:forced-color-adjust-none forced-colors:bg-[Highlight]'
  /** The thumb is the target. The hidden range input fills it, and the shared spec measures that input. */
  export const SLIDER_THUMB = `group/thumb flex items-center justify-center ${TOUCH_TARGET}`
  /** The drawn knob, with the ring of the input that has the focus beside it. */
  export const SLIDER_KNOB = 'block rounded-full border-(length:--tc-ring-width) border-primary-solid bg-surface-raised group-aria-invalid/slider:border-danger-solid group-has-focus-visible/thumb:outline-solid group-has-focus-visible/thumb:outline-(length:--tc-ring-width) group-has-focus-visible/thumb:outline-offset-(length:--tc-ring-offset) group-has-focus-visible/thumb:outline-ring'
  export const SLIDER_VALUE = 'min-w-[3ch] shrink-0 text-end text-sm tabular-nums text-muted'
  ```

- **What that draws** (measured): a track 6 px tall at `md`, a knob of 20 px with a 2 px
  primary line, inside a thumb of 24 x 24 px, 44 x 44 under a coarse pointer, and the
  range input is as large as the thumb. At 0 the thumb starts at the edge of the control
  and at 100 it ends there. In RTL the thumb of 30 is 30% in from the right. A click at
  three quarters of the track gives 75 in LTR and 25 in RTL.
- **Form.** The range inputs carry the `name`. It submits `name=<value>`, the minimum when
  no default is given, and the name twice for a range.
- **RTL.** Base UI places the thumb with `inset-inline-start`, so the position follows the
  `dir` of the page, while the keys and a press on the track follow the provider. The two
  must agree: `dummy/rtl.tsx` wraps itself in `TopClassProvider`.
- **Files.** `client.tsx`, `hook.ts`, `classes.ts`, `constants.ts`, `boundaries.ts`,
  `schema.ts` (`size`, `invalid`, `fullWidth`, `showValue`, `min`, `max`, `step`),
  `types.ts`, `index.tsx`, `meta.ts`.
- **Tests.** Server render: one thumb for a number, two for a pair, each with its `index`
  and neither hidden; the Arabic names of a range under an RTL provider; `step={0}`
  becomes the bound. Keyboard: every key above, in both directions. Form: the three rows
  of the table. Browser, static: the thumb is at least 24 px at every size and 44 px
  coarse; at 0 and at 100 nothing is outside the root at 320 px; the track can be seen
  under forced colours. Browser, live: a click on the track, a drag, and the same in the
  `rtl` demo; the ring is on the knob.
- **Mutation.** A thumb of a range loses its `index`, so both thumbs are hidden in the
  server HTML.
- **Not built:** `tone`, a vertical look (`orientation` still reaches Base UI, but no
  class reads it), `thumbAlignment`, more than two thumbs, tick marks, labels for the two
  ends, a tooltip on the thumb.
- **For the reviewer:** `aria-invalid` is on the root group. Base UI routes only names and
  descriptions to the range input, so a screen reader hears the error through
  `aria-describedby`. A caller's `id` reaches the root, not the input: a Field has to name
  a Slider with `aria-labelledby`. The track is inset by 12 px, 22 on touch, so its ends
  do not line up with a field above it (choice 18). A `format` of percent multiplies: use
  values from 0 to 1 with it.

## NumberField

```text
Where: Components page, FRAME "Sidebar, Segmented control, Number field and OTP" 83:244, group 83:322 (not a component set). Docs card "Previewer: Number field" 135:1594.
Frame text (83:246): "... a stepper input ..."
Drawing (83:313): a frame named "Input", 160 x 40, horizontal, radius 8 raw, fill -> base/surface-raised, stroke -> base/line 1 inside, clipped. Nothing bound but colours.
- a 40 x 40 cell with icon/minus 14 -> base/body, centered
- a 78 x 38 cell with "12" Inter Medium 14 -> base/body, centered
- a 40 x 40 cell with icon/plus 14 -> base/body, centered
- no line between the cells
Docs card: chip "client - 2.3 KB". Head: "A min/max/step stepper over a hidden input, so the form submits even before hydration."
Playground: size (md), variant (outline), step (1), toggles disabled, invalid, required, fullWidth, all off.
Stage (135:1627): 170 x 40, the side cells 32 wide, the middle 104, "12".
States (6), each 120 x 40: idle (stroke base/line), hover (stroke base/line-strong), focus-visible (stroke base/line-strong and a ring 2 px -> base/ring 4 px outside the whole field, radius 12), at-limit ("99", the plus icon at opacity 0.35, stroke -> danger/solid 1 and a ring -> danger/solid 2), invalid (the same danger stroke and ring, "12", plus at full opacity), disabled (0.5).
Code (149:1002): <Field name="guests" label="Guests" hint="Two to eight people per booking">{(control) => (<NumberField {...control} defaultValue={2} min={2} max={8} />)}</Field>
Note: "min, max and step are clamped at runtime, so a typed value cannot break the UI."
Install row: "import { Numberfield } from '@/topclassui/components/number-field'".
Surprising:
- The install row prints "Numberfield". The sample imports "NumberField".
- at-limit is drawn in danger, the same as invalid. A value at its maximum is not an error.
- The head says "over a hidden input". The note says "a typed value". Nothing shows whether the number in the middle is an editable input.
- The focus ring is drawn around the whole field. No focus on a single button is drawn.
- The buttons are 40 wide on the Components page and 32 in the card.
- The height is raw 40 and the radius raw 8, unlike the Select trigger.
- variant has one value. No size but md is drawn. No prefix, suffix, unit or format is drawn.
```

**Build this.** Client. Needs shared pull requests 1, 2, 4 and 5. Base UI `number-field`
(`baseUi: 'number-field'`): `Root`, `Group`, `Input`, `Increment`, `Decrement`.

- **Export:** `NumberField`, one element.
- **What Base UI gives** (from `NumberFieldRoot.d.ts`): `value` (`number | null`),
  `defaultValue`, `onValueChange(value, details)`, `onValueCommitted`, `min`, `max`, `step`
  (1, or `'any'`), `smallStep` (0.1), `largeStep` (10), `snapOnStep`, `allowOutOfRange`,
  `allowWheelScrub`, `format`, `locale`, `name`, `form`, `required`, `disabled`,
  `readOnly`, `id` (it goes to the visible input) and `inputRef` (the hidden input). The
  visible input is an editable `<input type="text" inputmode="numeric">`. The steppers are
  `<button type="button" tabindex="-1">`. After the root comes a hidden
  `<input type="number">` with the `name`, `min`, `max`, `step` and `required`.
- **Keys** (run): ArrowUp and ArrowDown move by `step`, with Shift by `largeStep`, with
  Alt by `smallStep`; Home and End go to `min` and `max` when they are set; a letter is
  refused; 250 typed with `max={14}` becomes 14 on blur. Arabic-Indic digits are read in
  any locale: U+0661 U+0662 is 12.
- **What we add.** `size`: default `md`. `invalid`. `fullWidth`: default `false`;
  otherwise `FIELD_OWN_WIDTH`. `placeholder`. The name: `ControlName`.
- **The clamp at our seam (`R-5.7-7`).** Base UI clamps what is typed, not what it is
  given: `defaultValue={50}` with `max={10}` renders 50 and submits 50. So `defaultValue`
  and `value` go through `clamp()` between `min` and `max` before they reach Base UI,
  unless `allowOutOfRange` is set. `min` and `max` themselves are clamped to
  `NUMBER_FIELD_BOUNDARIES` (`limitMin: -1e15`, `limitMax: 1e15`), and a numeric `step` to
  `stepMin: 0.000001`. No default `min` or `max` is passed down: Home would jump to it.
- **The three English strings.** `aria-label` on `Decrement` and `Increment` from
  `labels.numberField.decrease` and `.increase`, and `aria-roledescription` on the Input
  from `labels.numberField.field`. `locale` and `format.numberingSystem` as the rules say.
- **Markup.** `Base.Root` with `NUMBER_FIELD_ROOT`, `FIELD_TEXT[size]`, the width and
  `data-size`. In it `Base.Group` with `NUMBER_FIELD_GROUP` and `CONTROL_HEIGHT[size]`,
  holding `Base.Decrement` (`NUMBER_FIELD_STEP`, `<Svg icon={minus} size="0.875rem" />`),
  `Base.Input` (`NUMBER_FIELD_INPUT`, `dir="ltr"` unless the caller passes `dir`) and
  `Base.Increment` (the same with `plus`). `className`, `style`, `ref` and the rest props
  reach the root `<div>`. `id`, `name` and `required` go to `Base.Root`; the two ARIA
  names, `aria-describedby`, `aria-invalid` and `placeholder` go to `Base.Input`.

  ```ts
  // number-field/classes.ts
  export const NUMBER_FIELD_ROOT = 'inline-block max-w-full align-middle'
  /** The box of the field. Its ring shows while the input inside it has the focus. */
  export const NUMBER_FIELD_GROUP = `flex w-full items-stretch overflow-hidden ${FIELD_SURFACE} ${FOCUS_RING_WITHIN} ${TARGET_HEIGHT} ${FIELD_INVALID_WITHIN} data-disabled:opacity-50 data-readonly:bg-neutral-soft`
  /** It reaches over the line of the box, or it is 42 px tall on touch and the shared spec refuses it. */
  export const NUMBER_FIELD_INPUT = `-my-(--tc-line-width) min-w-0 flex-1 bg-transparent px-1 text-center tabular-nums outline-none placeholder:text-muted ${TARGET_HEIGHT}`
  export const NUMBER_FIELD_STEP = `-my-(--tc-line-width) inline-flex aspect-square shrink-0 items-center justify-center text-body tone-neutral ${HOVER.ghost} ${FOCUS_RING_INSET} ${TOUCH_TARGET} ${TRANSITION} ${DISABLED}`
  ```

- **What that draws** (measured): a field of 193.19 x 40 px at `md`, the width of an
  Input, with steppers of 40 x 40 px and the number centred between them; 28 px tall at
  `xs`. Under a coarse pointer the field, the steppers and the input are 44 px tall and
  the text is 16 px. The ring is around the whole field. Invalid: the danger line.
- **Keyboard and ARIA.** The steppers stay out of the tab order, as Base UI and the
  Authoring Practices spin button leave them: the arrow keys do their work. A stepper at
  its limit is disabled by Base UI and `DISABLED` dims it.
- **Form.** The hidden input submits the plain number, never the formatted text, and
  `name=` when empty. A decimal value needs a `step` it fits: 12.5 with the default step
  and `min={0}` reports a step mismatch and the form does not validate (measured). With
  `step={0.5}` or `step="any"` it does. Say so in the README.
- **RTL.** Decrease, the number, increase, in that order in the markup, so the row
  mirrors: in Arabic increase is at the left, the side a Slider grows toward. The number
  itself stays left-to-right and centred.
- **Files.** `client.tsx`, `hook.ts`, `classes.ts`, `constants.ts`, `boundaries.ts`,
  `schema.ts` (`size`, `invalid`, `fullWidth`, `min`, `max`, `step`), `types.ts`,
  `index.tsx`, `meta.ts`.
- **Tests.** Server render: `defaultValue={50}` with `max={10}` renders and submits 10;
  the Arabic names of the steppers; `ar` with Latin digits prints the same text on the
  server and in the browser. Keyboard: the keys above. Form: the plain number, and empty.
  Browser, static: the field is as wide as an Input of the same size, at every size; every
  target is 44 px under a coarse pointer; two fields in a row fit 320 px. Browser, live: a
  click on each stepper; typing past `max`; the `rtl` demo has increase at the left and a
  negative number keeps its sign at the left.
- **Mutation.** The default value is no longer clamped, so a value past `max` is submitted.
- **Not built:** `NumberField.ScrubArea`, a prefix, a suffix or a unit, the `variant`
  prop, danger at the limit (choice 10), steppers stacked at one end.
- **For the reviewer:** the visible input is editable; the hidden one only carries the
  form value. The steppers are not tab stops and their order mirrors (choice 19). The
  default `step` is 1 (choice 20). Press-and-hold and the wheel are Base UI's and were not
  run.

## OTPField

```text
Where: Components page, FRAME "Sidebar, Segmented control, Number field and OTP" 83:244, group 83:335 (not a component set). Docs card "Previewer: OTP field" 135:1768.
Frame text (83:246): "... and a one-time-code field with its own separator."
Drawing ("OTPField" 83:324, 322 x 52): a row, gap 8, captioned "OTP, three digits entered". Everything but colour is raw.
- six cells 44 x 52, radius 8, fill -> base/surface-raised, stroke -> base/line 1 inside, content centered
- the first three hold "4", "8", "2": Inter Semi Bold 18 -> base/body
- a separator after the third cell: a 10 x 2 bar, fill -> base/line-strong
- the fourth cell, the active one: stroke -> base/ring 2 inside, no outer ring
- the fifth and sixth are empty
Docs card: chip "client - 1.8 KB". Head: "One input per digit that accepts a paste into any box and can auto-submit when full."
Playground: length (6), validationType (numeric), size (md), toggles mask, autoSubmit, disabled, invalid, all off.
Stage ("OTPField" 135:1801, 268 x 46): six cells 38 wide, gap 8, radius 8, no separator.
States (6), four cells 20 wide: idle, focus-visible, partly filled, complete, invalid (every stroke -> danger/solid, the third 2 px), disabled (0.5).
Code (149:1018): import { OTPField } from 'topclassui/otp-field'
  <Field name="code" label="Verification code" hint="Six digits from your authenticator app">{(control) => (<OTPField {...control} length={6} />)}</Field>
Note: "autoSubmit posts the enclosing form the moment the last digit is typed."
Install row: "import { OTPfield } from '@/topclassui/components/otp-field'".
Surprising:
- The install row prints "OTPfield". The sample imports "OTPField". The card title is "OTP field".
- The Components page draws a separator after the third cell. The card draws none, and no prop or part names it.
- Focus is the cell's own border, 2 px in base/ring. Every other control in the file draws a separate rectangle 4 px outside.
- In the card a filled cell is shorter than an empty one: the cells hug their text. The Components page has one height, 52.
- Cells are 44 x 52 on the Components page and 38 x 46 in the card. Neither is a Size control/* value.
- mask and validationType are props. No masked digit and no letter is drawn.
- The radius is raw 8: Ocean changes nothing here.
```

**Build this.** Client. Tier 3. Needs shared pull requests 1, 4 and 5. Base UI
`otp-field` (`baseUi: 'otp-field'`): `Root`, `Input`. Its `Separator` exists in 1.8.0
and is not used: ours is decoration.

- **Export:** `OTPField`, one element. The folder is `otp-field`, so the scaffold writes
  `OtpField` and `OTP_FIELD`: keep `OTP_FIELD_DEFAULTS` and `OTP_FIELD_BOUNDARIES`,
  `meta.name` stays `OtpField`, and the function is `OTPField`.
- **What Base UI gives** (from `OTPFieldRoot.d.ts`): `length` (required there), `value`,
  `defaultValue`, `onValueChange(value, details)`, `onValueComplete`, `onValueInvalid`,
  `validationType` (`numeric`, `alpha`, `alphanumeric`, `none`), `normalizeValue`, `mask`,
  `inputMode`, `autoComplete` (`one-time-code`), `autoSubmit`, `name`, `form`, `required`,
  `disabled`, `readOnly`, `id` (the first cell; the others are `<id>-2`, `<id>-3`). The
  root is a `<div role="group">`, each cell an `<input>`, and a hidden input carries the
  `name`. A character fills a cell and moves on, Backspace clears and moves back, the
  arrows move a cell, a paste fills from the focused cell, and the focus cannot pass the
  first empty cell. One cell is the tab stop in the server HTML.
- **What we add.** `length`: default 6, clamped to `OTP_FIELD_BOUNDARIES`
  (`lengthMin: 1`, `lengthMax: 12`). `size`: default `md`. `invalid`. `groupSize`: default
  0; with 3 on a length of 6 a separator follows every third cell. It is clamped between 0
  and `length`. The name: `id` or `aria-labelledby` is required. `aria-label` is not
  offered: Base UI drops it on the first cell on purpose.
- **Digits in Arabic.** Base UI's `numeric` type is ASCII only: an Arabic keyboard on a
  desktop cannot fill the field. So when `validationType` is `numeric`, which is the
  default, and the caller passes no `normalizeValue`, we pass Base UI
  `validationType="none"`, `inputMode="numeric"` and `normalizeValue={toAsciiDigits}`.
  `toAsciiDigits` in `lib.ts` maps U+0660 to U+0669 and U+06F0 to U+06F9 to 0 to 9 and
  drops everything else. Run in Chromium: U+0661 and U+06F2 are stored as 1 and 2, a letter
  is refused. The cost is the `pattern` attribute. The other three types pass through.
- **Left to right, always.** The root carries `dir="ltr"` and sits inside Base UI's
  `DirectionProvider` with `direction="ltr"`, imported from
  `@base-ui/react/direction-provider`. Without the provider the arrow keys of an Arabic
  page would run against the cells.
- **Names.** The first cell takes the caller's `aria-labelledby` and `aria-describedby`;
  with an `id`, a `<label htmlFor>` reaches it. Each later cell takes
  `aria-label={labels.otp.character(place, length, fmt)}`. Every cell takes
  `aria-invalid` when the field is invalid.
- **Markup.** `Base.Root` with `OTP_ROOT`, `dir="ltr"` and `data-size`. In it `length`
  times `Base.Input` with `OTP_CELL` and `OTP_CELL_SIZE[size]`, and between groups a
  `<span aria-hidden>` with `OTP_SEPARATOR`.

  ```ts
  // otp-field/classes.ts
  export const OTP_ROOT = 'flex min-w-0 max-w-full items-center gap-2'
  /** A cell may give up width where six do not fit, and never height. */
  export const OTP_CELL = `min-w-[var(--tc-target-min,24px)] shrink grow-0 p-0 text-center font-semibold tabular-nums ${FIELD_SURFACE} ${DISABLED} ${FOCUS_RING} ${TARGET_HEIGHT} ${FIELD_INVALID}`
  /** A square of the control scale. Under a coarse pointer the three small sizes ask for 44 px of width. */
  export const OTP_CELL_SIZE = {
    xs: `h-control-xs basis-control-xs text-sm pointer-coarse:basis-[var(--tc-target-coarse,44px)] ${FIELD_TEXT_COARSE}`,
    sm: 'h-control-sm basis-control-sm text-base pointer-coarse:basis-[var(--tc-target-coarse,44px)]',
    md: 'h-control-md basis-control-md text-lg pointer-coarse:basis-[var(--tc-target-coarse,44px)]',
    lg: 'h-control-lg basis-control-lg text-xl',
    xl: 'h-control-xl basis-control-xl text-2xl',
    custom: '',
  } as const
  export const OTP_SEPARATOR = 'h-0.5 w-2.5 shrink-0 rounded-full bg-line-strong forced-colors:bg-[CanvasText]'
  ```

- **What that draws** (measured): six cells of 40 x 40 px at `md` with 18 px digits, 298 px
  with one separator. At 390 px with a coarse pointer the cells are 44 x 44 px. At 320 px
  they are 33 x 44 px and nothing scrolls sideways: six cells of 44 px do not fit there.
  In an RTL page the cells still run left to right.
- **Form.** The hidden input submits what is typed so far, also a code that is not
  complete, and `name=` when empty. `autoSubmit` and `mask` are Base UI's.
- **Files.** `client.tsx`, `hook.ts`, `lib.ts`, `classes.ts`, `constants.ts`,
  `boundaries.ts`, `schema.ts` (`length`, `size`, `invalid`, `groupSize`), `types.ts`,
  `index.tsx`, `meta.ts`.
- **Tests.** Node: `toAsciiDigits`, written out for both digit ranges, a letter and a
  mixed string. Types: no `id` and no `aria-labelledby` does not compile. Server render:
  `length={99}` renders twelve cells; one tab stop; the Arabic names of cells two to six;
  `dir="ltr"` on the group. Dom: an Arabic-Indic digit is stored as ASCII; ArrowLeft goes
  to the cell before under an RTL provider; `onValueComplete` at the last cell. Browser,
  static: cells of 44 px at 390 px coarse; no sideways scroll at 320 px. Browser, live: a
  click on the label focuses the first cell; a paste of six digits; the ring of a focused
  cell is fully painted.
- **Mutation.** `toAsciiDigits` stops mapping the Arabic-Indic range.
- **Not built:** the cell border as the focus mark (choice 23), cells that hug their
  text, a separator as a part, a `pattern` on numeric cells.
- **For the reviewer:** at 320 px a six-cell field gives each cell 33 px of width under a
  finger. A partial code is submitted as it is. A default value written in Arabic-Indic
  digits was not run. Paste was not run.

## Select

```text
Where: Components page, FRAME "Select and Textarea" 72:191 (not a component set). Docs card "Previewer: Select" 135:789.
Frame text (72:193): "A Select trigger is an Input with a caret. A Textarea is an Input that grows. Both keep the same border, radius and ring."
Drawing: a row labelled "select" with four triggers. No popup is drawn on the Components page.
Trigger: a frame named "Input", 165 x 40, horizontal, gap -> Size gap/md (8), padding-x -> Size padding-x/md (16), height -> Size control/md (40), radius -> Knobs radius/control (8), fill -> base/surface-raised, stroke 1 inside.
- text Inter Regular 14, size -> Size font-size/md; then an empty spacer; then icon/caret-down 14 -> base/muted
- 1st (72:198): stroke -> base/line, text "Choose a country" -> base/muted
- 2nd (72:204): the same with stroke -> base/line-strong (the hover look of Input)
- 3rd (72:210): stroke -> base/line-strong, text "Jordan" -> base/body, and a "focus ring" rectangle 2 px -> base/ring, 4 px outside
- 4th (72:217): opacity 0.5, fill -> base/surface, stroke -> base/line, the placeholder
Docs card: chip "client - 4.8 KB". Head: "A listbox whose popup stays inside the viewport and switches to windowed rendering above 200 options."
Playground: variant (outline), size (md), placement (bottom-start), toggles disabled, invalid, required, fullWidth, all off.
Stage (135:821): a column 220 wide, gap 6.
- trigger 220 x 40, stroke -> base/line-strong, "Jordan" -> base/body, caret, and the ring
- panel 220 x 111: vertical, gap 2, padding 6, radius -> Knobs radius/box (12), fill -> base/surface-raised, stroke -> base/line 1, shadow 0 6 16 black at 0.4 raw
- rows 208 x 31: gap 8, padding 7 / 9, radius 8 raw, text Inter Regular 14
  - "Jordan", the chosen one: fill -> primary/soft, text -> primary/on-soft, icon/check 14 at the end -> primary/on-soft
  - "Egypt", "Morocco": no fill, text -> base/body
States (6): idle, hover, focus-visible, open (the same drawing as focus-visible, no panel), disabled, invalid.
Code (150:960): 'use client'
  <Field name="city" label="City">{(control) => (<Select {...control} items={[{ id: 'ruh', label: 'Riyadh' }, { id: 'jed', label: 'Jeddah' }]} getKey={(city) => city.id} defaultValue="ruh" />)}</Field>
Note: "getKey is a function, so the file needs 'use client'; it cannot cross from a server page."
Page: Add with the CLI (193:2137): "field -> components/topclassui/field/ (select imports it)".
Page: Provider: "Direction provider - Popups read the direction from here, so a Select opens on the correct side in Arabic."
Connector (not this unit): "Previewer: AdaptiveSelect" 402:1872, "A popup list on desktop, a drawer list on a phone."
Surprising:
- The sample is one element, Select, with items and getKey. No part name is written anywhere in the file.
- The sample starts with 'use client', because of getKey.
- "open" is the same drawing as "focus-visible".
- The placeholder is "Choose a country" on the Components page and "Country" in the card. The sample has no placeholder prop.
- variant and placement have one value each. No size but md is drawn.
- The head says windowed above 200 options. No long list, no scrolling popup, no group, no disabled option and no separate highlighted row is drawn: the chosen row is the only tinted one.
- required is a toggle. No required mark is drawn anywhere.
```

**Build this.** Client. Alone, after Slider and NumberField: it holds the form that closes
Phase 4. Needs shared pull requests 1, 2, 4 and 7. Base UI `select` (`baseUi: 'select'`):
`Root`, `Trigger`, `Value`, `Icon`, `Portal`, `Positioner`, `Popup`, `List`, `Item`,
`ItemText`, `ItemIndicator`.

- **Export:** `Select`, one element that takes its options as data.
- **What Base UI gives** (from `SelectRoot.d.ts`): `value`, `defaultValue`,
  `onValueChange(value, details)`, `open`, `defaultOpen`, `onOpenChange`,
  `onOpenChangeComplete`, `items`, `name`, `form`, `autoComplete`, `id` (the trigger's),
  `required`, `readOnly`, `disabled`, `modal` (default `true`), `highlightItemOnHover`,
  `multiple`. The trigger is a `<button role="combobox">`, the list a
  `<div role="listbox">`, an option a `<div role="option">`. `items` is what lets the
  server HTML print the label of the value.
- **Keys** (run in Chromium): ArrowDown and Space on the trigger open it. Open, the focus
  is on the selected option, which Base UI has scrolled into view. ArrowDown, ArrowUp,
  Home and End move. Enter selects and closes, Escape closes, and the focus returns to the
  trigger. A letter typed on the closed trigger changes the value at once.
- **Props.** `items: readonly ListOption[]`, required: plain data, so a Server Component
  can render a Select with no function crossing. It goes to Base UI's `items` and is
  mapped to one `Base.Item` each. `value` and `defaultValue` are `string | null`.
  `placeholder`: the text of an empty trigger, default `labels.select.placeholder`. `size`:
  default `md`. `invalid`. `fullWidth`: default `false`; otherwise `FIELD_OWN_WIDTH`.
  `placement`: the twelve `PLACEMENTS`, default `bottom-start`, through `toSideAlign`.
  `visibleRows`: clamped to `COLLECTION_BOUNDARIES`; when it is passed the popup sets
  `--tc-list-rows` inline, and otherwise the CSS knob applies. `container` goes to the
  Portal. The name: `ControlName`.
- **What we remove from the type.** `multiple` (MultiSelect is its own row),
  `itemToStringLabel`, `itemToStringValue` and `isItemEqualToValue` (a value is a string),
  and `children`.
- **Markup.** `Base.Root` with `items`, `id`, `name` and the state props. `Base.Trigger`
  with `SELECT_TRIGGER`, `FIELD_SIZE[size]`, the width, `data-size`, the two ARIA names,
  `aria-describedby` and `aria-invalid`; `className`, `style`, `ref` and the rest props
  reach it. In it `Base.Value` with `SELECT_VALUE` and the placeholder, and `Base.Icon`
  with `SELECT_ICON` and `<Svg icon={caretDown} size="0.875rem" />`. Then `Base.Portal`,
  `Base.Positioner` with `SELECT_POSITIONER`, `alignItemWithTrigger={false}`
  (`docs/DECISIONS.md`, 2026-09-21), the side and align, `sideOffset` and
  `collisionPadding` from `POPUP_BOUNDS`, and `dir` and `lang` from `usePortalLocale()`.
  Then `Base.Popup` with `SELECT_POPUP` and `data-placement`, and `Base.List` with
  `SELECT_LIST`: the list is the scroll container. Each option is `Base.Item` with
  `SELECT_ITEM`, holding `Base.ItemText` with `SELECT_ITEM_TEXT` and `Base.ItemIndicator`
  with `SELECT_ITEM_TICK` and `<Svg icon={check} size="0.875rem" />`.

  ```ts
  // select/classes.ts
  export const SELECT_TRIGGER = `inline-flex items-center justify-between gap-2 text-start ${FIELD_BOX} data-readonly:bg-neutral-soft`
  export const SELECT_VALUE = `${LABEL} flex-1 data-placeholder:text-muted`
  export const SELECT_ICON = 'flex shrink-0 text-muted'
  export const SELECT_POSITIONER = 'z-(--tc-z-popup) data-anchor-hidden:invisible'
  /** At least as wide as its trigger, and never wider than the room Base UI measured. */
  export const SELECT_POPUP = `flex min-w-(--anchor-width) max-w-(--available-width) flex-col ${OVERLAY_SURFACE} ${POPUP_MOTION}`
  export const SELECT_LIST = `flex flex-col gap-0.5 p-1.5 outline-none ${LIST_CAP} ${SCROLL_AREA}`
  export const SELECT_ITEM = `cursor-default select-none ${ROW} ${ROW_HIGHLIGHT} ${ROW_TOUCH} ${ROW_SELECTED} ${DISABLED}`
  export const SELECT_ITEM_TEXT = `${LABEL} flex-1`
  export const SELECT_ITEM_TICK = 'ms-auto flex shrink-0'
  ```

- **Measured in the prototype,** sixty options: the trigger is 193.2 x 40 px and named by
  `label[for]`. The list is 280 px tall of 2530, with `overscroll-behavior: contain`; rows
  are 40 px; the selected row is in view, highlighted, focused, heavier, and ends in a
  tick. Twelve ArrowDown keep the highlight in view and `window.scrollY` at 0. The popup
  starts at the left edge of the trigger in LTR and ends at its right edge in RTL.
  `visibleRows={4}` gives 160 px. At 390 px with a coarse pointer a row is 44 px and the
  popup is 8 px inside the screen on both sides.
- **Not a collection.** `docs/PLAN.md` 8.5 and Phase 4 say a Select windows above the
  threshold and tracks rows that are not mounted with `aria-activedescendant`. Base UI's
  Select cannot: it has no `virtualized` prop and no item `index`, it moves the real focus
  to an option, and it mounts every option as soon as the trigger has the focus (measured:
  none before, sixty after). So a Select renders the options it is given, under the row
  cap, as a Dropdown does. A list of thousands is a Combobox, which windows. Say so in the
  README and in the pull request (`R-8.5-1`).
- **Keyboard and ARIA.** The Authoring Practices select-only combobox, all Base UI's.
- **Form.** The hidden input submits `name=<value>`, and `name=` with nothing chosen.
  `dummy/form.tsx` is a Select alone. `dummy/phase-4-form.tsx` is the second demo of Phase
  4: one plain `<form>` with a Checkbox, a RadioGroup, a Switch, a Select, a Slider and a
  NumberField, each with a `name` and a default. A demo may import other components.
- **RTL.** `bottom-start` is the inline start. The caret and the tick are at the inline
  end. The popup takes `dir` and `lang` from the provider, also in an RTL island.
- **Files.** `client.tsx`, `hook.ts` (the placeholder and `usePortalLocale`),
  `classes.ts`, `constants.ts`, `boundaries.ts`, `schema.ts` (`size`, `invalid`,
  `fullWidth`, `placement`, `visibleRows`), `types.ts`, `index.tsx`, `meta.ts`.
- **Tests.** Server render: the trigger prints the label of the default value, or the
  placeholder; a demo is a Server Component that passes only data (`rsc`). Types: no
  name does not compile; `items` is required; `multiple` is not a prop. Dom: `placement`
  reaches Base UI as side and align; `dir` and `lang` on the positioner, in an island and
  with no provider. Browser, live, with `dummy/sixty-items.tsx`: everything under
  "Measured" above, at the four edges of the viewport, in both directions; the popup opens
  6 px under its trigger and never covers it; a label of 300 characters ends in an
  ellipsis in the row and in the trigger; a disabled option is skipped. Browser, both
  pages of `phase-4-form`: `serverEntries` on the static page gives the six defaults, and
  on the live page the six values after each control was changed. axe on the open popup,
  scoped as Popover's spec scopes it, and with `[data-base-ui-focus-guard]` excluded.
- **Mutation.** The positioner stops taking the side and the align of `placement`, so
  `top-start` opens under the trigger.
- **Not built:** the parts as public exports (choice 7), `multiple`, groups and
  separators, an icon or a second line in an option, `StateProps` and remote options,
  windowing, the scroll arrows, `variant`, the adaptive Select that is a Drawer on a phone
  (a connector).
- **For the reviewer:** while it is open `body` has `overflow: hidden`: that is `modal`,
  Base UI's default, kept (choice 27). Base UI adds four focus guards, each
  `aria-hidden` and focusable, and axe counts them (`aria-hidden-focus`: 4 with them, 0
  without): they are Base UI's, so the spec leaves them out and says why. The popup grows
  with its longest label up to the room there is; it does not stay as narrow as the
  trigger. A row is 40 px, not the drawn 31. The list keeps its sixty options mounted
  after it closes. `openOverlay` needs `popup: '[data-placement]'`: the listbox itself
  has no `data-open`. `required` against the browser's own bubble was not run.

## Combobox

```text
Where: Components page, FRAME "Combobox" 79:359 (not a component set). Docs card "Previewer: Combobox" 135:939.
Frame text (79:361): "The list is filtered as you type and the chosen row keeps a tick, so the selection is never colour alone. It asks the app for the next page when you scroll near the end."
Drawing (79:364): a column 280 wide, gap 6, captioned "open, filtered on "jor"".
- input 280 x 40: gap 8, padding 0 / 16, radius 8, all raw; fill -> base/surface-raised, stroke -> base/line-strong 1; "jor" Inter Regular 14 -> base/body; icon/caret-down 14 at the end -> base/muted
- panel 280 x 117: vertical, gap 2, padding 6, radius -> Knobs radius/box, fill -> base/surface-raised, stroke -> base/line 1, shadow 0 8 24 black at 0.12 raw
- rows 266 x 33: gap 8, padding 8 / 10, radius 8 raw
  - "Jordan": fill -> primary/soft, text -> primary/on-soft, icon/check 14 at the end -> primary/on-soft
  - "Jordan Valley", "New Jordan": text -> base/body
Docs card: chip "client - 5.6 KB". Head: "A text input that filters a listbox; it calls loadMore() for the next page and caches nothing."
Playground: variant (outline), size (md), visibleRows (7), toggles disabled, invalid, fullWidth, hasMore, all off.
Stage (135:971): a column 230 wide, gap 6.
- input 230 x 40, stroke -> base/line-strong: icon/magnifying-glass 14 at the start -> base/muted, "jor", no caret, and a ring 2 px -> base/ring 4 px outside
- panel 230 x 78, as Select: "Jordan" chosen with the tick, then "Jordan Valley"
States (6): idle (magnifier, "Search" -> base/muted), focus-visible, open ("jor", ring, no panel), loading ("jor", no magnifier, icon/spinner 14 at the end -> base/muted), empty ("zzz", no icon, and "no matches" Roboto Mono 9 -> base/muted 5 px under the input), disabled (0.5, fill base/surface).
Code (150:976): 'use client'
  <Field name="framework" label="Framework">{(control) => (<Combobox {...control} items={[{ id: 'next', label: 'Next.js' }, { id: 'astro', label: 'Astro' }]} getKey={(item) => item.id} defaultValue="next" />)}</Field>
Note: "Filtering runs over the loaded items; remote pages arrive through hasMore and loadMore."
Connector (not this unit): "Previewer: AdaptiveCombobox" 403:1920.
Surprising:
- The Components page draws a caret at the end and no magnifier. The card draws a magnifier at the start and no caret.
- invalid is a toggle. No invalid state is drawn.
- "New Jordan" matches "jor": the filter is drawn as "contains", not "starts with".
- The sample has no loadMore and no hasMore. Both are named in the head, the note and the playground.
- The empty text "no matches" is drawn under the input, not inside a panel.
- Row height is 33 on the Components page and 31 in the card. The shadow differs too.
- No clear button, no multiple selection, no chip, no group is drawn. One element, as Select.
```

**Build this.** Client. Tier 2. Last and alone: it is the one that renders a collection.
Needs shared pull requests 1, 2, 4, 7 and 8, and Select merged: it copies the popup and
the row. If Command is merged, read how it windows its list first, and keep what it
settled. Base UI `combobox` (`baseUi: 'combobox'`): `Root`, `Input`, `Portal`,
`Positioner`, `Popup`, `List`, `Item`, `ItemIndicator`, `Empty`, `Status`, the hook
`useFilteredItems` and the helper `createItems`.

- **Export:** `Combobox`, one element that takes its options as data.
- **What Base UI gives** (from `ComboboxRoot.d.ts` and `AriaCombobox.d.ts`): `value`,
  `defaultValue`, `onValueChange`, `inputValue`, `defaultInputValue`,
  `onInputValueChange`, `open`, `defaultOpen`, `onOpenChange`, `items`, `filter`
  (`null` turns it off), `limit`, `virtualized`, `autoHighlight`, `loopFocus` (`true`),
  `openOnInputClick` (`true`), `modal` (`false`), `onItemHighlighted(value, details)`
  with `details.index` and a `reason` of `keyboard`, `pointer` or `none`, `name`, `form`,
  `id` (the input's), `required`, `readOnly`, `disabled`. The input is an
  `<input role="combobox">` and keeps the focus; the highlight moves through
  `aria-activedescendant`. An item takes `index`. The default filter is "contains", as
  drawn.
- **Keys** (run in Chromium): a click or ArrowDown opens it, the arrows move the
  highlight and wrap, Enter chooses and closes, typing filters, Escape closes. Escape on
  the closed input clears the value.
- **Props.** `items: readonly ListOption[]`, required. `value` and `defaultValue` are
  `string | null`. `placeholder`. `size`, `invalid`, `fullWidth`, `placement` (default
  `bottom-start`), `visibleRows` and `container`, as Select; `keepMounted` goes to the
  Portal too. From `CollectionProps`: `virtualize` (default `'auto'`), `hasMore`,
  `loadMore` and `loadMoreThreshold`. `status`: `'idle' | 'loading' | 'loading-more'`,
  default `idle`. `emptyFallback`: what an empty list says, default
  `labels.collection.noResults`. The name: `ControlName`.
- **What we remove from the type.** `multiple`, `virtualized` (it is ours to set),
  `filteredItems`, `grid`, `inline`, `limit`, and the three item converters.
- **The options become a collection** in `hook.ts`:
  `Base.createItems(items, { getValue, getLabel })`, memoised on `items`. Then the value
  is the string, the input shows the label in the server HTML, and the form receives the
  value (rendered: with plain `{ value, label }` objects and a string default the input
  showed the raw `jo`).
- **The list is windowed by the shared hook** (`R-8.5-1`), in
  `parts/combobox-list.tsx`, which mounts with the popup. `Base.Root` always gets
  `virtualized`. The part calls `Base.useFilteredItems()` and hands the result to
  `useCollection` with `getKey` reading `value`. It renders `collection.rows` only, each
  a `Base.Item` with `index`, `value`, `ref={collection.rowRef(index)}`,
  `aria-setsize` and `aria-posinset`. `Base.List` takes `collection.scrollRef`, and sets
  `--tc-list-pad-start` and `--tc-list-pad-end` inline from `paddingStart` and
  `paddingEnd`: two pseudo-elements read them, so the listbox holds options only. The
  row estimate is the height of the first row once it is measured. The root's
  `onItemHighlighted` scrolls when the reason is `keyboard`: to the row if it is mounted,
  else with `collection.scrollToIndex(index)`.

  ```ts
  // combobox/classes.ts
  /** The box that owns the width. The input fills it and the caret sits over its end. */
  export const COMBOBOX_ROOT = 'relative inline-block max-w-full align-middle'
  export const COMBOBOX_INPUT = `w-full ${FIELD_BOX} data-readonly:bg-neutral-soft`
  /** Merged after the size: it replaces the end padding of the size, to keep the text clear of the caret. */
  export const COMBOBOX_INPUT_END = 'pe-9'
  export const COMBOBOX_ICON = 'pointer-events-none absolute inset-y-0 inset-e-3 flex items-center text-muted'
  export const COMBOBOX_SPIN = 'animate-spin motion-reduce:animate-none'
  export const COMBOBOX_POSITIONER = 'z-(--tc-z-popup) data-anchor-hidden:invisible'
  /** As wide as the input. A long label ends in an ellipsis. */
  export const COMBOBOX_POPUP = `flex w-(--anchor-width) max-w-(--available-width) flex-col ${OVERLAY_SURFACE} ${POPUP_MOTION}`
  /** No gap between rows: the window counts rows only. The two spacers are pseudo-elements. */
  export const COMBOBOX_LIST = `relative flex flex-col p-1.5 outline-none empty:hidden before:h-(--tc-list-pad-start) before:shrink-0 after:h-(--tc-list-pad-end) after:shrink-0 ${LIST_CAP} ${SCROLL_AREA}`
  export const COMBOBOX_ITEM = `shrink-0 cursor-default select-none ${ROW} ${ROW_HIGHLIGHT} ${ROW_TOUCH} ${ROW_SELECTED} ${DISABLED}`
  export const COMBOBOX_ITEM_TEXT = `${LABEL} flex-1`
  export const COMBOBOX_ITEM_TICK = 'ms-auto flex shrink-0'
  /** The empty text and the status line. With nothing to say they take no room. */
  export const COMBOBOX_NOTE = 'px-3 py-2 text-sm text-muted empty:hidden'
  ```

- **Markup.** A `<span>` with `COMBOBOX_ROOT`, `FIELD_TEXT[size]` and the width. In it
  `Base.Root`, and `Base.Input` with `COMBOBOX_INPUT`, `FIELD_SIZE[size]` and then
  `COMBOBOX_INPUT_END`, in that order for `cn()`, plus `data-size`, the names,
  `aria-describedby`, `aria-invalid` and `aria-busy` while loading. After the input a
  `<span aria-hidden>` with `COMBOBOX_ICON` holds the caret, or the spinner with
  `COMBOBOX_SPIN` while `status` is `loading`. `className`, `style`, `ref` and the rest
  props reach the input. Then Portal, Positioner (as Select's, without
  `alignItemWithTrigger`, which a Combobox does not have) and `Base.Popup` with
  `COMBOBOX_POPUP`. In the popup: `Base.Empty` with `COMBOBOX_NOTE`, the list part, and
  `Base.Status` with `COMBOBOX_NOTE` holding `labels.state.loadingMore` while `status` is
  `loading-more`, or `labels.common.loading` while it is `loading` and there are no items.
- **Measured in the prototype,** ten thousand options: 15 options in the DOM on open, 20
  after thirty-one ArrowDown, 13 at the end; the list is 280 px tall and 400,012 px
  long. ArrowUp held past the first row comes round to the end: option 9994, never mounted
  before. `aria-activedescendant` names it, it is in view, and it reads 9995 of 10000. A
  wheel to the end moves the list and not the page. Typing `999` leaves 19 rows, not
  windowed. `zzz` shows "No results" and hides the list. axe on the open popup: no
  violation. The first version put the two spacers in the padding of the list: a
  padding cannot be capped, and the list grew to 379,436 px. They are pseudo-elements.
- **Paging (`R-8.5-2`).** The component asks and never fetches: `useCollection` calls
  `loadMore()` once per length of `items` when the window nears the end, only while
  `hasMore`. The hook runs in the list part, so nothing is asked while the popup is
  closed. Filtering runs over the loaded items.
- **Keyboard and ARIA.** The Authoring Practices editable combobox with a listbox popup,
  Base UI's.
- **Form.** The hidden input submits `name=<value>`; `name=` with nothing chosen, also
  when text was typed and nothing picked.
- **Files.** `client.tsx`, `parts/combobox-list.tsx`, `hook.ts`, `classes.ts`,
  `constants.ts`, `boundaries.ts`, `schema.ts` (`size`, `invalid`, `fullWidth`,
  `placement`, `visibleRows`), `types.ts`, `index.tsx`, `meta.ts`.
- **Tests.** Server render: the input shows the label of the default value and the hidden
  input its value. Dom: typing narrows by "contains"; Enter chooses; an empty list says
  the label; `loadMore` is not called while closed and is called once when the list is
  opened near its end; `status`. Browser, live, with `dummy/ten-thousand.tsx`: fewer than
  a hundred options in the DOM on open, while the keys move and after a wheel to the end
  (the line of `docs/PLAN.md` 20); the highlight wraps to a row that was never mounted and
  that row is in view; `window.scrollY` stays 0; the popup is as wide as the input and
  inside the viewport at the four edges; axe on the open popup. With
  `dummy/load-more.tsx`: one call per page.
- **Mutation.** An item loses its `index`, so the highlight cannot reach a row that is
  not mounted.
- **Not built:** `multiple` and chips, groups, a clear button and a trigger button (the
  caret is decoration: a click on the input opens it), the magnifier at the start (choice
  25), an error row with a retry, `Autocomplete`, async search helpers, the adaptive
  Combobox.
- **For the reviewer:** this is the riskiest of the ten. `loadMore`, `hasMore` and
  `status` were read and not run. `useCollection` asks for the next page as soon as the
  list mounts when it has no container yet: check it against a list longer than its box.
  Its `'nearest'` is fixed by shared pull request 8; without that fix every ArrowUp in the
  middle of the list jumps the row to the bottom edge. While it is open Base UI renders
  two hidden buttons named "Dismiss", in English, and the name cannot be replaced: it is
  recorded as a known gap of `R-5.11-1`. Escape on the closed input clears the value: say
  so in the README. `openOverlay` waits for focus inside the popup, which never comes
  here: wait with `atRest`. Keep `items` stable between renders, or the collection is
  rebuilt each time.

## Notes

```text
Source: file BxRSdAVOhk9Hj3Tkq4tjcy, read-only, 26 plugin calls on 2026-10-13. "->" means a Figma variable is attached; "raw" means a typed number. Pages: Foundations 0:1, Icons 41:2, Components 3:119, Docs pages 3:120.
Size (one mode): control/xs..xl = 28 32 40 48 56. padding-x/xs..xl = 8 12 16 20 24. padding-y/xs..xl = 2 4 6 8 10. gap/xs..xl = 4 6 8 8 12. font-size/xs..xl = 12 14 14 16 18. icon/xs..xl = 16 20 24 32 40. toggle/xs..xl = 14 16 20 24 28.
Knobs (Light | Dark | Ocean): radius/base 8 | 8 | 100. radius/control 8 | 8 | 100. radius/box 12 | 12 | 28. radius/chip 4 | 4 | 100. border/width 1. ring/width 2. ring/offset 2. list/rows 7. list/row-height 40.
Component sets among the ten: Checkbox 90:422 (30: size x state), Radio 90:493 (25), Switch 90:574 (25). The property names are "size" and "state"; no boolean, text or instance-swap property exists. The other seven are plain frames: Select, Combobox, Textarea, Slider, Number field, Segmented control, OTP.
The Input set 89:402 is the model the Select trigger, the Combobox input and the Number field copy: their frames are named "Input".
What is bound: every fill, stroke, text colour and icon colour. Checkbox and Radio width and height (Size toggle/*). Checkbox radius (Knobs radius/chip). The Select trigger on the Components page: height, padding-x, gap, font size, radius. In the cards: the height and radius of the Select and Combobox inputs, the radius of the Textarea, the radius of the two popup panels (Knobs radius/box).
What is raw: the Switch (every number), the Radio radius, the Slider, the Number field, the Segmented control, the OTP field, the Combobox input on the Components page, every focus ring (2 px, 4 px outside, radius = the control's + 4), every popup row (height, padding, gap, radius 8), every shadow. The file has no effect style.
Shared looks: hover is stroke base/line-strong on a field and is not drawn at all on a toggle. Disabled is opacity 0.5, and fields also change fill to base/surface. Invalid is stroke danger/solid 1 plus a danger/solid rectangle 2 px, 4 px outside: a ring that is always on. The chosen row of a list is primary/soft with primary/on-soft and icon/check at the end.
Docs sections (133:148). "Actions" (140:942): "Things a person clicks. Each one renders on the server unless it needs an event handler in the browser." Holds Button, Tag, Kbd, SegmentedControl. "Forms" (140:950, "13 components"): "Each control carries a real name and submits inside a plain <form>. Input and Textarea work before any JavaScript loads; the rest submit their default value and become interactive once it does." Holds Input, Textarea, Select, Combobox, Checkbox, RadioGroup, Switch, Slider, Number field, OTP field, Date picker, File upload, Rating. meta.ts takes its category from docs/PLAN.md section 18, not from these.
Rendering chips: Textarea "split - 0 KB server + 1.2 KB client". The other nine "client": Select 4.8, Combobox 5.6, Checkbox 1.2, RadioGroup 1.6, Switch 0.9, Slider 1.9, Number field 2.3, OTP field 1.8, SegmentedControl 1.2 KB.
Two docs sites. "Docs site - LTR" 133:148 is on the page Docs pages; a second "Docs site - LTR" 438:2388 is on the Components page with the same 46 cards. For the ten every text is the same except the install row: 438:2388 prints "import { <Name> } from 'topclassui/<slug>'", 133:148 prints "import { <Name> } from '@/topclassui/components/<slug>'". Both print a bare name (Select, Numberfield, OTPfield, SegmentedControl, RadioGroup).
Modes and directions: of the ten only Checkbox, checked and unchecked, md, is in the Modes frame (84:261). None is in the Direction frame (86:276) or in "Docs site - RTL" (159:1038). So nine of the ten are not drawn in Dark or Ocean, and none in Arabic.
Labels, errors and Field: nine of the ten samples wrap the control in <Field name label [hint]>{(control) => (<X {...control} ... />)}</Field>, imported from 'topclassui/field'; SegmentedControl is the exception. hint is passed for Textarea, Checkbox, Switch, Slider, NumberField, OTPField. No card "Previewer: Field", "Previewer: Form" or "Previewer: Label" exists in either docs site, and no label, hint, error message or required mark is drawn for any of the ten; the only label drawn is the text beside each radio.
Page: Accessibility (183:2079): "Labels are enforced by the types" - "An Input outside a Field needs an id or an aria-label, and TypeScript rejects one without." Right: <Field name="email" label="Email"><Input type="email" /></Field>. Here the child of Field is an element, not a function.
Page: Your first component (193:3001): a subscribe form of Field, Input, Button and Form posted to a Server Action; then "Move the form into a client file and use FormAction. Errors land on the matching field.", with FieldLive.
Page: Accessibility: "Every interactive element is at least 24 by 24 CSS pixels, and grows to 44 on touch and other coarse pointers." "One focus ring on every control: a CSS outline with an offset." "Forced-colors mode is a manual check. A layout that relies on background fills disappears there, so every component is drawn with borders." "Known gaps: Nothing has been tested yet."
The playgrounds: "required" is a toggle on Select, RadioGroup, Switch and Number field. "invalid" is a toggle on all ten. Neither is a prop spelled in any sample of the ten.
Not found: a Field, Form, Label, Fieldset or error-message drawing; a range slider, a vertical slider or segmented control, a horizontal radio group, a checkbox group, a select with groups or a long list, a multiple select, a masked OTP; a hover look for Checkbox, Radio, Switch, Slider or a segment; any size but md for the seven plain frames; a tone other than primary (neutral for SegmentedControl); a variant other than outline.
```

Read in the built JavaScript of Base UI 1.8.0, or rendered from it, where the types are
silent:

- Every part file starts with `'use client'`.
- `switch/root`, `checkbox/root`, `radio/root`: with `nativeButton` the root is a
  `<button type="button">`, the `id` moves to it, and `disabled` is the attribute.
  `CheckboxRoot.js` cancels Enter and clicks the default submitter of the form.
- `slider/thumb/SliderThumb.js`: the id of the range input is always generated; the
  default value text of a range is "`<n>` start range" and "`<n>` end range".
  `SliderControl.js` measures a press from the right edge under an RTL provider.
- `number-field`: `useNumberFieldStepperButton.js` writes `aria-label` "Increase" and
  "Decrease", `NumberFieldInput.js` writes `aria-roledescription` "Number field"; each is
  replaced by a prop.
- `otp-field/input/OTPFieldInput.js`: the first cell drops `aria-label` and warns in
  development; `aria-labelledby` on that cell is kept.
- `select/trigger/SelectTrigger.js` sets `forceMount` when the trigger takes the focus, so
  every option mounts then.
- `combobox/utils/ComboboxInternalDismissButton.js`: a hidden button with `aria-label`
  "Dismiss", written after the props, so no prop replaces it.
- `utils/FocusGuard.js`: `tabIndex: 0` and `aria-hidden: true`.

## Build order

1. **The shared pull requests**, once Unit 3 is merged. 1, 2 and 3 first: Switch needs
   them. 4, 5 and 6 can be open beside Switch. 7 and 8 can wait for the second half. Ask
   for the seven Arabic strings of 5 on the first day: nothing with a new label merges
   without them. GitHub's checks may not run: after each merge run `pnpm check` on `main`.
2. **The first half: Switch, Checkbox, RadioGroup, Textarea, SegmentedControl.** This is
   what a fresh session builds after Unit 3.
   - **Switch, alone, and stop for review.** It settles the names of the state props, the
     native button under a role, the target around a small box, `e2e/form.ts` and the first
     form test. Needs 1, 2 and 3.
   - **Then three at a time: Checkbox, RadioGroup and Textarea.** Checkbox needs 1, 2 and
     3. RadioGroup needs 1, 2, 3 and 6. Textarea needs 2, 4 and 5.
   - **Then SegmentedControl,** once RadioGroup is merged: it copies its hook and its tab
     stop. Needs 1, 2, 4 and 6.
   - Why these five: they need nothing from Dropdown or Command, no option contract and no
     collection. The four toggles share one target, one naming rule and one fix for the
     hidden input, so Switch pays for all of them. Textarea is the one control that is
     server HTML, and it lands the field styles four later controls reuse.
3. **The second half: Slider, NumberField, OTPField, Select, Combobox.**
   - **Three at a time: Slider, NumberField and OTPField.** Slider needs 2, 4 and 5.
     NumberField needs 1, 2, 4 and 5. OTPField needs 1, 4 and 5.
   - **Then Select, alone.** Needs 1, 2, 4 and 7, and Checkbox, RadioGroup, Switch, Slider
     and NumberField merged: its `phase-4-form` demo holds all six.
   - **Then Combobox, last and alone.** Needs 1, 2, 4, 7 and 8, and Select merged. It is
     the one that renders a collection, and the riskiest.
4. **What that leaves of Phase 4** (`docs/PLAN.md` 19):

   | Clause | Where it is met |
   |---|---|
   | Input and Textarea in server Fields, posted with JavaScript off | not met: no Field, no Form (choice 1) |
   | The same form with `FormAction` and `FieldLive` | not met, for the same reason |
   | Six controls submit the right `FormData` after hydration | `select/dummy/phase-4-form.tsx`, on the live page |
   | The same six submit their defaults before it | the same demo, on the static page |
   | Numeric limits clamp | Slider, NumberField, `Textarea.rows` and `maxRows`, `OTPField.length`, `visibleRows` |
   | A Select with ten thousand options stays under the limit, with `aria-activedescendant` on rows that are not mounted | moved to Combobox: `combobox/dummy/ten-thousand.tsx` |
   | Every control is right in RTL: Slider direction, NumberField buttons, Select popup side | the `rtl` demo and the spec of each of the three |

## Choices for Omar

Every row has a default above, so nothing here blocks the build. Row 2 is the
recommendation `docs/CLOUD-PLAN.md` asks Switch to bring.

| # | Choice | Built as | The other option |
|---|---|---|---|
| 1 | Field, Label and Form | not in this unit; the ten take the five field props plainly, and two clauses of Phase 4 stay open | an eleventh and a twelfth pull request: Field and Label before Checkbox, Form after Select, as Appendix B of CLOUD-PLAN orders them |
| 2 | The state props of Switch and Checkbox | Base UI's `checked`, `defaultChecked` and `onCheckedChange`; `value` stays the submitted string | `value` as a boolean with `onValueChange`, as `R-5.7-1` reads, and the submitted string under a new name |
| 3 | Hidden inputs and the target spec | the shared spec stops measuring an input no pointer and no key can reach, and measures the three toggle roles | the spec stays; every control wraps itself in a holder that stretches Base UI's hidden input to 24 px |
| 4 | The root of a toggle | a native `<button>`, so a `<label htmlFor>` names it in the server HTML | Base UI's `<span>`; a name only by `aria-label` or `aria-labelledby` |
| 5 | The label of a Checkbox and a Switch | none: the caller writes it, and later a Field does | their children become a label, as a `RadioGroupItem`'s do |
| 6 | Where the look of a field lives | in `src/shared/classes.ts`, with Input re-pointed | a fourth allowed import: `inputVariants` from `#components/input` |
| 7 | One element or parts | Switch, Checkbox, Slider, NumberField, OTPField, Textarea, Select and Combobox are one element; RadioGroup and SegmentedControl are a Root and an Item | parts for Select and Combobox as well (`SelectRoot`, `SelectItem` and the rest), as Dropdown has both |
| 8 | The options of a Select and a Combobox | plain data, `{ value, label, disabled }`, so a server page can render one | the sample's `items` of any shape with `getKey`: functions, so a client file only |
| 9 | The look of invalid | the line turns to danger and thickens, as on Input | the drawn ring that is always on, 2 px, 4 px outside |
| 10 | At the limit | not an error: a stepper at its limit is disabled, a counter at the cap is bold | danger, as drawn for Textarea and Number field |
| 11 | How a switch thumb moves | a translate times `--tc-dir`, animated | start and end alignment, as the set says, with no motion |
| 12 | The radius of a Checkbox | `rounded-chip`, as bound: 8 px in Ocean, so small boxes are circles | capped at a quarter of the box, so it never looks like a radio |
| 13 | The radius where the design is raw | Switch and radio are round; SegmentedControl, NumberField and OTP cells take `rounded-control`, so they are pills in Ocean as Input is | the drawn 8 px in every mode |
| 14 | `tone` on Checkbox, RadioGroup, Switch, Slider, SegmentedControl | not built: one tone is drawn | the six tones, as a lookup per control |
| 15 | What a SegmentedControl is underneath | a radio group: one value, a `name`, never empty, the arrows select | a toggle group: pressed buttons, Home and End, can be emptied, no form value |
| 16 | The focus ring of a SegmentedControl | on the focused segment, inside it | around the whole track, as drawn |
| 17 | A range Slider | built: two values give two thumbs | single only, until one is drawn |
| 18 | A slider thumb at the ends | centred on the value, the control padded by half a target, so the track is inset 12 px (22 on touch) | Base UI's `edge` alignment, which needs an inline script and a CSP nonce |
| 19 | The steppers of a NumberField | out of the tab order, and mirrored in RTL | tab stops; minus at the left in every direction |
| 20 | The default `step` of a NumberField | 1, as Base UI and the playground; a decimal needs its own `step` | `'any'`, so a decimal never fails the hidden input |
| 21 | Digits in an OTPField | Arabic-Indic and Persian digits are taken and stored as ASCII; the `pattern` attribute is lost | Base UI's `numeric`: ASCII only |
| 22 | The separator of an OTPField | a `groupSize` prop, 0 by default | not built; or a part between cells |
| 23 | The focus mark of an OTP cell | the shared ring, outside the cell | the drawn 2 px border inside it |
| 24 | The name of the OTP export | `OTPField`, with `meta.name` `OtpField` as the meta test forces | `OtpField` everywhere, or a meta test that allows an acronym |
| 25 | The icon of a Combobox | a caret at the end, as on the Components page | a magnifier at the start, as in the card |
| 26 | A very long list | a Select mounts what it is given under the row cap; ten thousand rows are a Combobox's | build Select on Combobox parts with a trigger that cannot be typed in, so it windows too |
| 27 | `modal` | Base UI's own: a Select locks the page scroll, a Combobox does not | one value for both |
| 28 | The counter of a Textarea | with `showCount` always; with `autosize` alone from nine tenths of the cap; a Textarea with no client code has none | every Textarea hydrates, so the counter always appears at nine tenths, as `R-5.7-8` reads |
| 29 | How a Textarea grows | its `rows` follow `scrollHeight` in the browser; the server counts line breaks | a CSS mirror in a grid, exact before hydration; it needs a token and a second copy of the box classes |
| 30 | The check DEC 2026-10-07 expected from the first client control | not written with `zod/mini`: every check here is a clamp or a length | write it now, for the Textarea cap |
| 31 | Skeletons | `TextareaSkeleton` only; a one-line field uses `InputSkeleton`, a toggle uses `Skeleton` | one `skeleton.tsx` per control, as `docs/PLAN.md` 20 reads |
| 32 | The label of a radio | wraps, as a footer action does: a choice is read whole | ends in an ellipsis, `R-5.2-7` to the letter |
| 33 | A Select or Combobox on a phone | the popup, as on a desktop | the adaptive connectors of `docs/PLAN.md` 11, a Drawer on a phone |
| 34 | Which of the two docs frames is current | not settled: nothing built depends on it, and a README prints the import the generator writes | settle it, and correct the stale install rows (`Numberfield`, `OTPfield`) |
| 35 | A radio group with no default value | no tab stop in the server HTML until hydration: the root cannot know its first item | the root reads its children to find the first value |

## Where this file departs from docs/PLAN.md

The local session records these as one `docs/DECISIONS.md` entry once Omar has answered the
choices, before any Unit 4 branch opens. No component branch edits that file.

- Field, Label and Form (18.4, Phase 4) are not built with the form controls. The two
  Phase 4 clauses about server Fields, `FormAction` and `FieldLive` stay open.
- Switch and Checkbox keep `checked`, `defaultChecked` and `onCheckedChange` (5.7 and
  `R-5.7-1` say `value` and `onValueChange`).
- A Select is not windowed (8.5) and does not take `CollectionProps`. The Phase 4 clause
  about ten thousand options is met by Combobox.
- Options are plain `{ value, label, disabled }` data. Neither Select nor Combobox takes
  `getKey`, which 8.5 makes part of every collection.
- The shared target spec no longer measures an input that is hidden from assistive
  technology and out of the tab order (5.6, `R-5.6-2`).
- The shared `INVALID` of 5.2 is `FIELD_INVALID`: a border and an inset ring, no outline.
- Compound controls do not all offer both forms (9.1): Select and Combobox are data-driven
  only, RadioGroup and SegmentedControl are parts only.
- SegmentedControl is built on Base UI's radio group.
- OTPField does not use Base UI's `Separator` (18.4), and `length` has a default.
- A Textarea that renders no client code has no counter (`R-5.7-8`). The `zod/mini`
  validator is still unwritten.
- Nine of the ten have no `skeleton.tsx` (5.7, section 20).
- A radio label wraps (`R-5.2-7`).
- "Form controls require a label through Field" (5.6) is "a name is required by the
  type", as Input already does.
- Combobox renders Base UI's English "Dismiss" (`R-5.11-1`).
- The adaptive Select and Combobox (11) are not built.
- New infrastructure, which Phases 4 to 7 forbid without a record: the name contract, the
  option contract, the toggle and field class constants, the server tab stop, two tokens,
  seven label keys, `e2e/form.ts` and `scripts/lib/targets.ts`.

Outside Unit 4, noticed while reading: `docs/PLAN.md` 8.5 says `use-collection.ts` wraps
TanStack Virtual, and it is hand-written with no such peer; its `'nearest'` always scrolls
a row to the bottom edge; `@theme inline` emits no `--spacing-*` variable, so an arbitrary
value that reads one resolves to nothing; the Accessibility page of the design gives Field
an element child where every card gives it a function; `docs/STATUS.md` is one unit behind.
