# Figma facts for Unit 4

The form controls: Switch, Checkbox, RadioGroup, Textarea, SegmentedControl, Slider,
NumberField, OTPField, Select and Combobox. That is the build order, not the order of the
catalog. Read `docs/figma/unit-1.md` first: its section "How to use this file" applies here
unchanged, except that no component branch edits `scripts/mutations/index.ts`. Then read
three sections of `docs/figma/unit-3.md`: "What the reviews of Unit 2 found", "What Dialog
settled" and "Rules for all fourteen". The first two apply here unchanged: the measuring is
part of the build. Of the third these still apply and are not repeated below: a file in
`parts/` starts with `'use client'`, and the zod guard and the meta test only know a file
named `client.tsx`; a file warns at 200 lines and fails at 300, tests included; the z-index
tokens; the live harness (`openLive`, the page name, `?edge=`, the port); a mutation label
names its component in lowercase. Everywhere else "Rules for all ten" below replaces it.

The brief every builder is handed (`U3-BUILD.md`) applies with four things changed:
`unit-3.md` is this file; "Rules for all fourteen" is "Rules for all ten"; the template is
the folder of the last finished Unit 4 control (Switch for a toggle, Popover for a popup,
Input for Textarea); and each branch built beside another gets its own worktree and its own
`TC_HARNESS_PORT` from the lead.

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

Checked on 2026-10-13 and 2026-10-14 against the checkout `u3-popover` (commit `51bf261`:
main, the shared pieces of Unit 3, and Dialog, Popover, Drawer, Tabs and Accordion), with
Base UI 1.8.0, React 19.3.0 and the Chromium of Playwright 1.63.0. Nothing was written into
that checkout. Three passes: the planner's, three reviews of the planner's draft, and a
final edit that checked each finding before it changed this file and then ran the file's
own verification again. The scripts are in the lead's handoff folder, under
`unit-4/scratch-plan/` (the planner's), `unit-4/scratch-baseui/` (the Base UI reader's) and
`unit-4/scratch-review-forms/` (the forms reviewer's) and `unit-4/scratch-final/` (the final
edit's).

- **Base UI types.** Every part and prop a Build this block names was read in the installed
  types under `node_modules/@base-ui/react/` and then looked up again by a script: 253 names
  in 39 type files, and 32 more that the reviews made the blocks name. Three are not written
  in the file the script reads and are right all the same: `aria-label`, `aria-labelledby`
  and `aria-describedby` on a slider thumb come from React's own attributes, and the built
  `SliderThumb.js` sends each to the range input (rendered). Every other name is there, and
  the names the blocks call absent are absent. Three corrections to what was assumed:
  `otp-field` does export a `Separator` in 1.8.0; `Select.Portal` has `container` and no
  `keepMounted`; `RadioGroup` has no `orientation`.
- **Classes.** The thirteen fenced `ts` blocks of this file were read back out of it and
  evaluated against the repo's shared constants: 88 constants, 292 distinct classes, each
  compiled alone with the repo's own entry (`compileCss` from `scripts/lib/harness.ts`). All
  produce a rule except the six markers that never do (`group/toggle`, `group/radios`,
  `group/slider`, `group/thumb`, `group/number`, `peer`); each marker is named by a variant
  that does. Of the 88 constants, 65 are the strings the planner measured in the browser,
  character for character. Nineteen were changed or added after the reviews and measured
  again by the final edit, whose scripts read every class out of the blocks of this file:
  `TOGGLE_TARGET`, `RADIO_TARGET`, `FIELD_HOLDER`, `FIELD_HOLDER_FULL`, `TEXTAREA_BOX`,
  `SEGMENTED_HOLDER`, `SEGMENTED_ROOT`, `SEGMENTED_FULL`, `SLIDER_ROOT`, `SLIDER_ROW`,
  `NUMBER_FIELD_ROOT`, `NUMBER_FIELD_GROUP`, `NUMBER_FIELD_STEP`, `OTP_ROOT`, `OTP_WRAP`,
  `OTP_CELL`, `OTP_CELL_SIZE`, `SELECT_ROOT` and `SELECT_TRIGGER`. Four were added after the
  planner's table and hold plain layout classes: `TEXTAREA_RESIZE`, `SEGMENTED_ICON`,
  `COMBOBOX_ITEM_TEXT` and `COMBOBOX_ITEM_TICK`.
- **Lint.** The three shared blocks, appended to the real `src/shared/classes.ts`, and each
  of the ten component blocks as a `classes.ts`, pass the repo's lint with no message. Under
  any other file name the same strings get 11 errors (`rounded-full`, `h-1`, `h-2`): keep
  every class string in a `classes.ts`. From the shell it is
  `npx eslint --stdin --stdin-filename src/components/popover/classes.ts`: the name must be
  a file the project knows, or the typed lint stops on a parsing error.
- **Names.** Every shared constant, hook, helper, label key, token, icon, test and file
  this file leans on was looked up in the checkout: 151 exist, and the 62 a shared pull
  request or a component creates do not exist yet.
- **Two class traps, found here.** `src/styles.css` declares its sizes with
  `@theme inline`, which emits no `--spacing-*` and no `--radius-*` variable. So
  `w-[calc(var(--spacing-toggle-md)*1.75)]` compiles and resolves to nothing in a browser.
  Every size below is written in rem times `--tc-density`. And two classes for one property
  in one constant do not merge: the stylesheet order decides there, and `cn()` decides the
  other way once a part merges them (a switch track with two fills was painted white, and
  one with two `justify` classes would have centred its thumb). So the repo's `cn()` was
  run over every constant and over each set a part puts on one element: no constant holds
  a conflict, and the three overrides left are wanted: `SEGMENTED_FULL` over `w-fit`,
  `FIELD_HOLDER_FULL` over `w-fit` and the column of `FIELD_HOLDER`, and the read-only fill
  over the fill of a field, as on Input.
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
    320 px coarse only the six cells of a six-cell OTP field are, and the page has no
    sideways scroll at 1280, 390 or 320 px, in LTR and RTL.
  - A slider thumb is 24 x 24 px around a 20 px knob (44 x 44 coarse), and stays inside its
    control at 0 and at 100. A number field is 193.2 x 40 px, the width of an Input, with
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
  - The final edit ran this prototype again with the classes printed in this file and the
    three boxes that own a width (Select, Slider, NumberField): every line above came out
    the same.
- **happy-dom (the Base UI reader, twelve scripts).** What each control submits from its
  server HTML and after hydration, what names and tab stops the server HTML has, the keys of
  every part in both directions. Those results are quoted where a block depends on them.
  One thing misleads there: a click on a label does not reliably press a native-button
  toggle in happy-dom (a `label[for]` click after an Enter did nothing, and a click on the
  text of a wrapping label did nothing). Chromium presses it every time. Test label clicks
  in the browser spec.
- **Three reviews of the planner's draft.** Three reviewers read it, each through one
  lens and each with scripts of its own against the same checkout. All three said fix
  first: 35 findings, one a blocker, fifteen majors, nineteen minors.
  - *Can a builder with no memory build from it?* Sound: every shared name, the Base UI
    spot checks, 28 of the riskier classes, that no component branch has to edit a shared
    file, and that the first half needs nothing from the second, from Dropdown or from
    Command. Found: the Combobox list part called two hooks; three sentences disagreed on
    when the session waits for Omar; `e2e/fixtures` and three test files were never named;
    `aria-invalid` on an OTPField landed on the group; the Textarea seam was left to guess;
    and eight things a real form does that the draft never considered.
  - *Is it accurate against Base UI, the stylesheet, the lint and the rules?* It compiled
    all 284 classes of the draft, read the compiled rule of 163, linted the blocks and
    rendered every Base UI claim: sound. Found: a disabled NumberField painted its
    steppers at a quarter; twelve OTP cells scrolled a 320 and a 390 px page sideways; the
    Combobox input had no default cap; Select and Combobox listed a `boundaries.ts` with
    nothing to hold.
  - *Does it work as a form, for everyone?* It composed the ten in one form, in Chromium,
    with and without script. Sound: the table of what the form receives, also after a real
    hydration; a role, a name and a state for all ten in the server HTML; `required`; the
    radio keys in both directions; 27 targets; forced colours; and that the server-action
    form compiles against the stated props with no Field. Found: the blocker, that after a
    form reset four controls showed one value and sent another; a number typed before
    hydration stayed on screen and was not sent; a pre-filled Textarea lost early typing at
    hydration; a Select and a Slider collapsed in a parent that sizes to its content; the
    OTP row sat at the wrong side of an Arabic form; three public types were `any` or did
    not compile.
- **The final edit.** It checked the blocker and the fifteen majors before it changed
  anything: by running the reviewer's own probe again (the reset, typing before a late
  script, the widths, the type probe), by a fresh render (the OTP attributes, the
  read-only attributes, the hidden input of `uncheckedValue`) or by reading the cited
  line (the hook-count test, `e2e/fixtures`, `resolveMaxLength`, `R-8.3-6`, the mutation
  rows). All sixteen held, and all 35 findings changed this file. Five were applied with
  another fix than the one proposed, and the block says why each time: the shape of the
  reset hook, the width of a Select and a Slider, the bounds of a Combobox, how the
  Combobox root reaches its list, and which controls get a hostile fixture. What it ran
  itself, in Chromium:
  - **Reset.** The nine client controls composed as the blocks say, with `useFormValue` as
    shared pull request 9 words it, hydrated: after `form.reset()`, after a click on a
    reset button and after a React 19 form action every control was back at its default on
    screen and in `FormData`; with the action's result as the new defaults every value
    stayed and was sent again; the console stayed empty. A caller's handler still heard
    Base UI's reason and thumb index, and `details.cancel()` still cancelled. A controlled
    control kept its owner's value, on screen and in the form. Controls outside their form,
    tied to it by `form`, followed its reset. Without the hook, the reviewer's page showed
    the blocker again.
  - **Before a late script** (served 1.5 s after the HTML): a number typed early was
    replaced by the default and `guests=2` was sent; text typed early into a Textarea with a
    default was replaced, and into one without was kept, with and without the holder.
  - **The Textarea seam:** `12 / 5000` in the server HTML and after hydration; the rows
    went from 3 to 6 and scrolled; the counter appeared at 54 of 60.
  - **Inside the repo's Dialog:** a Select and a Combobox, as their blocks tell.
  - **Types:** the props as the blocks state them, compiled against the installed Base UI
    types: a number setter and a pair setter on a Slider, `value={null}` on a Select; a
    radio value read as a number, `type` on a Select and the bare control object on a
    Slider, a RadioGroupRoot and a SegmentedControlRoot are refused.
  - **Layouts.** Each of the ten alone in eight parents (a block, a grid item, a wrapper in
    a grid track, a flex column, a label row, a `flex-1` column, a `w-fit` parent, a table
    cell), and the five fields in seven more (a 120 px row; two side by side in a grid of
    `1fr 1fr` and in a flex row, each alone and each in a plain wrapper; beside a label in
    a grid of `auto 1fr`, alone and in a wrapper), at 320 and 390 px with a coarse pointer
    and at 1280 px, at each of the five sizes: 5,765 cases, none with a sideways page
    scroll. The same pass, before the classes changed, is what found six faults no review
    had: a toggle laid straight into a grid was 1201 px wide; seven segments widened a
    table cell and scrolled the page; six OTP cells with a `basis` did the same; a Select
    holding one 300-character word was 2,324 px wide in a table cell; the fixed width one
    review proposed for a Select and a Slider scrolled the page with two in a grid of
    `1fr 1fr`; and two NumberFields in a row did not fit 320 px, which the draft said they
    did.
  - **Also:** four to twelve OTP cells at three widths, with and without separators; the
    opacity and the hover of a NumberField's steppers when it is disabled, at its limit and
    read-only; the five sizes of a switch and a checkbox in both directions; and the
    selector of shared pull request 1 on the ten in one form (27 targets, none under the
    floor at 1280 and at 390 px; with the first wording of the selector one hidden input of
    0 x 0 px).

Not checked. Say so in the pull request when one of these turns out wrong:

- Figma itself, by anyone but the first reader. And nothing in Figma shows any of the ten
  in Arabic, or nine of the ten in Dark or Ocean.
- The prototypes are not the components: no `index.tsx`, no `hook.ts`, no Server Component
  above them, no demo. Hydration was run in Chromium from HTML that `renderToString` made,
  never under Next.js.
- Firefox, WebKit, a real phone, a screen reader. Dark and Ocean, apart from one radius.
  Every layout number in this file is Chromium's.
- A range slider's drag, and its two thumbs meeting; its keys, its form entries and its
  reset were run. A vertical slider.
- `loadMore`, `hasMore` and `status` on the Combobox. How long a ten-thousand-row Combobox
  takes to open. The reset rule and a Dialog around a Combobox whose list is windowed: both
  were run with a plain list.
- A Select or a Combobox inside a Drawer.
- `useFormValue` in happy-dom, where its tests will run, and under Next.js with a real
  Server Action.
- Where the browser draws its validation bubble when the invalid element is a hidden input
  of 1 px. That the submit is blocked, and where the focus goes, was run.
- A control inside `<fieldset disabled>`. The native buttons and inputs follow `:disabled`;
  Base UI's own `data-disabled` does not.
- The keyboard a phone shows for a NumberField that takes a minus or a decimal: Base UI
  serves `inputmode="numeric"`, and the iOS keypad has neither key.
- Browser autofill and password managers, on any of the ten.
- OTP paste, `mask`, `autoSubmit`, and a default value written in Arabic-Indic digits.
- NumberField press-and-hold, wheel, and `ar-EG` digits in a browser.
- The Textarea skeleton, and the row estimate the server makes before hydration. Whether
  text typed into a pre-filled Textarea before a late hydration survives when a Server
  Component emits the textarea: in a client tree it does not.
- Dropdown and Command are not on the branch that was read. What they settled for a 44 px
  row and for a windowed list is not in this file: read them first if they are merged.
- Next.js: that a Server Action receives these entries. Bundle sizes (`pnpm size` does not
  exist). The seven Arabic strings of shared pull request 5 were written by the lead and
  read by no second Arabic speaker: Omar reads them in that pull request.

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
- **A row that cannot wrap is as wide as its content to a parent that sizes to its
  content.** A table cell does, and a wrapper inside a grid track, and a label row inside a
  column that shrinks. `TABS_ROOT` is `grid grid-cols-1` for that reason: a list that
  scrolled would otherwise widen them to the width of all its tabs. SegmentedControl copies
  it, and an OTP cell is sized by `w-full` under a `max-w`, never by a `basis`.
- **A control with no width of its own stretches as a grid item.** An `inline-flex` button
  laid straight into a grid fills its track, and its drawn box sits in the middle of it. A
  toggle target and a segmented track carry `w-fit`.
- **A width that does not depend on the parent is a floor.** Input's width is a
  percentage with a cap because the browser's own width, a fixed one, made two Inputs in
  a grid form 426 px wide on a 320 px phone. The same holds for any definite width, and
  for a box whose content has one: a grid track of `1fr` and a flex row cannot shrink
  it. A percentage alone fails the other way on an element the browser gives no width:
  in a parent that sizes to its content it resolves to the content. A box of one column
  that may shrink to nothing and grows to the width of an Input does both
  (`FIELD_HOLDER`, shared pull request 4).
- **happy-dom has no layout and its labels are approximate.** Sizes, scrolling, focus rings,
  a click on a label and every popup are browser tests.

## Rules for all ten

- **Nine are client components, one is split.** Every Base UI part starts with
  `'use client'` and throws under the `react-server` condition, so none of the nine can be a
  Server Component. Their `index.tsx` re-exports only (`R-5.1-2`), as `tabs/index.tsx` does.
  Textarea is the split: its `index.tsx` holds the native `<textarea>`.
- **The folder of a client control:** `index.tsx`, `client.tsx`, `hook.ts`, `classes.ts`,
  `constants.ts`, `schema.ts`, `types.ts`, `meta.ts`, `README.md`, `dummy/`, `test/`, and
  only where the block says so `lib.ts`, `boundaries.ts`, `parts/`. No `variants.ts`: a
  lookup is a plain object in `classes.ts`. No `skeleton.tsx`, except Textarea's.
  `client.tsx` is markup plus at most one hook call per part (`R-5.12-1`): a part in
  `parts/` counts too, and `<slug>.client.test.ts` counts the hook calls of every part
  file. `hook.ts` returns plain objects and writes no type argument in angle brackets
  (`check-boundaries` reads `<Letter` there as JSX). A folder whose only bounds are shared
  ones has no `boundaries.ts` (`R-8.3-6`): delete the one the scaffold writes.
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
  is drawn: that is a Field's. `required` works through the browser's own validation of
  the real input each control serves: an empty required control blocks the submit, with
  and without script, for the eight that can be empty, which is every one but a Slider
  and a SegmentedControl (run). After hydration the focus then goes to the control.
  Before it, for a Select, a Checkbox, a RadioGroup, a Switch and a Combobox, it goes to
  the hidden input, a box of 1 px nobody can see: say so in each README. A disabled
  toggle is a `<button disabled>`, so it leaves the tab order and `DISABLED` dims it
  whole. Slider has no `readOnly` in Base UI. A read-only Switch, Checkbox, RadioGroup or
  SegmentedControl has no look of its own in this unit: it carries `aria-readonly` and
  `data-readonly` (rendered) and looks like a live one. Say so in each README and under
  Not built. A read-only NumberField has one: see its block.
- **Shaped for a Field that comes later.** `docs/PLAN.md` 12 hands a control
  `{ id, name, required, 'aria-describedby', 'aria-invalid' }`. Every control here takes
  those five as plain props and puts each on the right element, so a server Field can
  spread them with no change to the control. Three cannot take that object alone: a
  Slider, a RadioGroupRoot and a SegmentedControlRoot also need `aria-labelledby`, and
  their type refuses the five props without it (compiled). A Slider has no `required`
  either: Base UI has none and a slider always has a value, so `Slider` accepts `required`
  and drops it. Left in the rest props it lands on the root as `<div required>`
  (rendered).
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

  `name` is optional, as on a native control. Before hydration only a Textarea sends what
  was typed; the other nine send their default (`docs/PLAN.md` 12). Four of them can
  still be touched then, and what is done is not sent or not shown. The visible inputs of
  a NumberField, an OTPField and a Combobox take typing that the form does not send. A
  Slider's range input takes the arrow keys, so the form sends the new number while the
  thumb does not move (measured with no script: `volume=70` with the thumb at 60).
  Hydration puts all four back to the default. Say so in each README; no demo and no test
  may promise that these four are inert before hydration. Each of the ten ships
  `dummy/form.tsx`, and its spec reads `FormData` from the static page, where no script runs.
- **A form reset, and a React form action.** React 19 resets a form when its `action`
  settles, and a reset button does the same. Left to Base UI, a Switch, a Checkbox, a
  RadioGroup and a SegmentedControl then show one value and send another (measured: the
  box is ticked and `FormData` has no entry), and the other five ignore the reset. So each
  of the nine client controls holds its value with `useFormValue` (shared pull request 9).
  `use<Name>()` in `hook.ts` calls it and returns the value, one ref and one handler, and
  the part hands Base UI the controlled pair: `checked` and `onCheckedChange`, or `value`
  and `onValueChange`. Base UI never gets a `defaultValue` or a `defaultChecked` from us
  (choice 37).
  - The handler calls the caller's own handler first, with Base UI's details, and then
    `setValue` unless `details.isCanceled`. So `details.reason`, a slider's
    `details.activeThumbIndex` and `details.cancel()` all still work (measured).
  - A reset returns the control to its current default: the `defaultValue` or
    `defaultChecked` of the latest render. So a Server Action that sends the rejected
    values back as defaults is shown and sent again, and Base UI's warning about a
    changing default never fires (measured). A reset calls no `onValueChange`, as a native
    reset fires no `change`.
  - A control with no default holds an explicit empty value, never `undefined`, which
    Base UI reads as not controlled: `false` for a Switch and a Checkbox, `null` for a
    RadioGroup, a NumberField, a Select and a Combobox, the empty string for an OTPField,
    and `min`, or 0, for a Slider (run with every default empty: no warning).
  - A control the caller controls keeps its value through a reset: its owner resets it.
    Its hidden checkbox or radio input is still written back, or the form would send the
    first default while the screen shows the owner's value (measured).
  - The ref each control hands Base UI, so the hook finds the form, also for a control
    that sits outside it and names it with the `form` attribute (measured for all nine):

    | Control | Ref | `sync` |
    |---|---|---|
    | Switch, Checkbox | `inputRef` | writes `input.checked` |
    | RadioGroupRoot, SegmentedControlRoot | `rootRef`, on the `radiogroup` | writes the `checked` of each radio input inside it |
    | Slider, OTPField | `rootRef` | none |
    | NumberField, Select, Combobox | `inputRef` | none |

    Where the caller passed a ref of the same kind (`inputRef`, or `ref` on a control that
    hands over `rootRef`), the control's hook makes it follow with `useImperativeHandle`,
    as `useDialogBody` does.
  - Textarea is native and resets by itself. One trap for demos: a button with
    `id="reset"` or `name="reset"` inside a form hides `form.reset` and breaks React's
    own reset.
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
  Where Base UI's type is generic the block pins it: left alone, a radio group's value is
  `any` and a slider's handler takes `number | readonly number[]` (compiled).
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
  `long-content` where the control holds caller text. No demo writes `tabIndex`. The
  exact list, which the two demos tests write out ("the five" are `basic`, `sizes`,
  `states`, `form` and `rtl`):

  | Folder | `dummy/` |
  |---|---|
  | `switch` | the five, `unchecked-value` |
  | `checkbox` | the five, `labelled` (one box named by `label[for]`, one inside a wrapping label) |
  | `radio-group` | the five, `long-content`, `horizontal` |
  | `textarea` | the five, `long-content`, `autosize` (one empty, one pre-filled past `maxRows`), `show-count`, `row` (two in a flex row), `skeleton` |
  | `segmented-control` | the five, `long-content`, `with-icons`, `full-width`, `many` (seven long segments) |
  | `slider` | the five, `range`, `show-value` |
  | `number-field` | the five, `limits` (a value at `max`, a `step` of 0.5), `row` (two in a flex row) |
  | `otp-field` | the five, `grouped` (`groupSize={3}`), `long` (twelve cells) |
  | `select` | the five, `long-content`, `sixty-items` (one option disabled), `four-rows` (`visibleRows={4}`), `phase-4-form` |
  | `combobox` | the five, `long-content`, `ten-thousand`, `load-more`, `status` |

  Anything else a test needs is a fixture.
- **Tests.** The file set of Tabs and Popover, by suffix: `.test.tsx` (server render),
  `.client.test.ts`, `.exports.test.ts`, `.types.test.ts`, `.compile.test.ts` (the README
  sample compiles; a control with no name does not), `.schema.test.ts`, `.meta.test.ts`,
  `.css.test.ts`, `.dom.test.tsx`, `.keyboard.dom.test.tsx` (every key of the pattern, in
  both directions), `.form.dom.test.tsx` (`FormData` from the server HTML, after a
  change, and after a reset), `.hydration.dom.test.tsx`, `.demos.ssr.test.tsx`,
  `.demos.rsc.test.tsx` and `.demos.dom.test.tsx` (every demo, hydrated, does what its
  control names; the list of demos is written out there). Select and Combobox add
  `.direction.dom.test.tsx` and `.placement.dom.test.tsx`, as Popover has. Then one new
  `e2e/<slug>.spec.ts`: the static page for what the server HTML promises (the form
  entries, the two boxes of the target, 320 and 390 px, forced colours), and the live
  harness for everything that needs a script. Each block lists what is the component's
  own.
- **Fixtures.** A page that is not an example lives in `e2e/fixtures/<slug>-<what>.tsx` and
  is loaded by the component's own spec, as `e2e/popover.spec.ts` loads
  `popover-hostile.tsx`, `popover-layouts.tsx` and `popover-no-provider.tsx`. It never
  goes in `dummy/`: the shared static specs run on every demo and the README lists every
  demo. It uses inline styles: the harness compiles only the classes it finds under
  `src/`. A fixture may import another component; a component may not.
  - Each of the ten has `<slug>-layouts.tsx`: the control alone as a grid item, in a
    wrapper inside a grid track, in a `flex-1` column, in a `w-fit` parent, in a table
    cell, and in a label row inside a column that aligns to the start. At 320 px with a
    coarse pointer and at 1280 px the page never scrolls sideways and the control keeps
    its size. The final edit ran this for all ten (see "What was checked"); a block names
    what its control does there.
  - The five fields (Textarea, Slider, NumberField, Select, Combobox) add two side by
    side to that page: in a grid whose columns are written `1fr 1fr`, in a flex row, each
    of the two alone and each in a plain `<div>`, and one beside a label in a grid of
    `auto 1fr`. Write `1fr`, not `minmax(0, 1fr)`: only the first has a minimum of `auto`,
    and it is the one that found a 162 px sideways scroll in this file. At 320 and
    390 px with a coarse pointer the two are as wide as two Inputs there (124 and
    159 px) and the page does not scroll.
  - The seven that hold caller text or a typed value (RadioGroup, Textarea,
    SegmentedControl, NumberField, OTPField, Select, Combobox) have `<slug>-hostile.tsx`:
    a 300-character word, an empty value, and sixty items where the control takes items.
  - The nine client controls have `<slug>-reset.tsx`: a plain form with a reset button,
    a form with a function `action`, and one whose action returns the next defaults. It
    is where "the reset cases of Switch" run for each of them.
  - Select and Combobox add `<slug>-no-provider.tsx` and `<slug>-in-dialog.tsx`.
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

Nine, each small, each on its own, each in place before the first component that needs it
(`docs/CLOUD-PLAN.md` section 9). None opens before the Unit 3 stack holds what it sits on:
4 re-points Input, 6 re-points Tabs, and 7 and 8 sit on what Dropdown and Command leave in
`src/shared`. When a pull request moves a line that a mutation row anchors on, it moves
the row too (its `file` and its `from`), or `pnpm test:mutation` stops on a lost anchor.
Each item below names the rows it moves. 3, 4 and 7 each add to the end of
`src/shared/classes.ts` and of `classes.test.ts`: build them in that order, each on the
one before, never two at once.

1. **`fix/shared-target-hidden-input`.** Before everything: eight of the ten cannot ship a
   demo without it.
   - `scripts/lib/targets.ts` exports the selector, and `e2e/target-size.spec.ts` imports
     it in place of its own:

     ```text
     button, a[href], [role="button"], input:not([type="hidden"]):not([aria-hidden="true"]), input:not([type="hidden"]):not([tabindex="-1"]), select, textarea, [role="checkbox"], [role="radio"], [role="switch"]
     ```

   - What changes: an input that is both `aria-hidden="true"` and `tabindex="-1"` is no
     longer measured. No pointer and no key can reach it: Base UI clips it to 1 px, which
     also takes it out of hit testing. An `<input type="hidden">` is not measured either:
     it has no box, and Base UI adds one beside a Switch or a Checkbox that has
     `uncheckedValue` (rendered; with the first selector the shared spec failed on it at
     0 x 0 px). The three roles are added so the box a finger does hit is measured
     whatever element draws it.
   - `scripts/lib/targets.test.ts`, in the node project, with a happy-dom `Window`: Base
     UI's hidden input does not match; an `<input type="hidden">` does not; a plain input
     does; an input with only `aria-hidden="true"` does; one with only `tabindex="-1"`
     does; a `<span role="checkbox">` does.
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
   no name is required. It moves two mutation rows to `scripts/mutations/shared.ts`, each
   re-anchored on `src/shared/contracts/name.ts`: the `InputName` row of
   `scripts/mutations/input.ts` (on `input/types.ts`) and the `TabsListName` row of
   `scripts/mutations/tabs.ts` (on `tabs/types.ts`).
3. **`feat/shared-toggle-styles`.** In `src/shared/classes.ts`, for Switch, Checkbox and
   the radio of a RadioGroup. Each with a test in `classes.test.ts` and a rule in a css
   test:

   ```ts
   /** What takes the press: 24 px, 44 under a coarse pointer, whatever size the drawn box is. w-fit: laid straight into a grid it would fill the track. */
   export const TOGGLE_TARGET = `group/toggle relative inline-flex w-fit shrink-0 items-center justify-center outline-none ${TOUCH_TARGET} ${DISABLED}`
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
   is one, and a checkbox inside it would wear the trigger's focus ring. Without `w-fit` a
   switch laid straight into a grid was 1201 px wide at 1280 px, with its track in the
   middle; with it the target is 35 x 24 px there, as everywhere else (measured). Mutation
   rows in `scripts/mutations/shared.ts`: the target loses `TOUCH_TARGET`; the target
   loses `w-fit`; the ring moves back to the target; the compound invalid class is
   removed.
4. **`feat/shared-field-styles`.** Input's own strings move to `src/shared/classes.ts`,
   and Input is re-pointed at them with its fourteen test files and `e2e/input.spec.ts`
   unchanged. That is the proof nothing moved.

   ```ts
   /** The height of a target alone, for a field whose width may shrink. */
   export const TARGET_HEIGHT = 'min-h-[var(--tc-target-min,24px)] pointer-coarse:min-h-[var(--tc-target-coarse,44px)]'
   /** iOS Safari zooms the page when a focused field's text is under 16 CSS px. */
   export const FIELD_TEXT_COARSE = 'pointer-coarse:text-[max(1rem,16px)]'
   /** A percentage with a cap, which a flex row can shrink. fullWidth replaces it with w-full. For a field the browser gives a width: an input, a textarea, or a box that holds nothing else. */
   export const FIELD_OWN_WIDTH = 'w-[min(100%,var(--tc-input-width))]'
   /** The same width for a box with no width of its own, on a grid or an inline grid: one column that may shrink to nothing and grows to an Input. A parent that sizes to its content counts the box as an Input wide, and a narrow track still shrinks it. */
   export const FIELD_HOLDER = 'w-fit max-w-full grid-cols-[minmax(0,var(--tc-input-width))]'
   /** fullWidth, merged after it by cn(): w-full replaces w-fit and the column fills the box. */
   export const FIELD_HOLDER_FULL = 'w-full grid-cols-1'
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

   `FIELD_HOLDER` exists because of three more. A Select trigger, a Slider and the box of
   a NumberField have no width the browser gives them, and each of the two plain widths
   failed in a layout a real form has (measured at 320 and 390 px with a coarse pointer
   and at 1280 px, sixteen layouts each):

   | Width | In a parent that sizes to its content | Two side by side in a grid of `1fr 1fr` |
   |---|---|---|
   | `FIELD_OWN_WIDTH` on the control | a Select was as wide as its label (97 px for "Jordan", and it changed with each choice), a Slider 24 px; a Select holding one 300-character word scrolled the page by 2,036 px | fits: 124 px each at 320 px |
   | `w-(--tc-input-width) max-w-full` on the control | 193.2 px, as an Input | 220.8 px each: the page scrolled sideways by 162 px at 320 px and by 92 px at 390 px, and by 24 px beside a label in a grid of `auto 1fr` |
   | `FIELD_HOLDER` around it | 193.2 px in a parent of 193.2 px | fits: 124 px each, exactly as two Inputs |

   A definite width is a floor in every grid track whose minimum is `auto`, which `1fr`
   is; Tailwind's `grid-cols-2` is `minmax(0, 1fr)` and hid it. The NumberField had the
   same fault from the other side: its box took `FIELD_OWN_WIDTH`, but the visible input
   inside it kept the browser's own width as a floor, so two in a flex row were 220.8 px
   each and scrolled a 320 px page by 162 px. With `FIELD_HOLDER` the three were measured
   at all five sizes in the sixteen layouts: never a sideways scroll, the width of an
   Input in a block parent at every size and pointer, and the width two Inputs take
   wherever two share a row. A Combobox and a Textarea in its holder keep
   `FIELD_OWN_WIDTH` on their box: it holds nothing but an input or a textarea that is
   `w-full`, which a parent counts as nothing wide, and they passed the same sixteen.

   It moves five rows of `scripts/mutations/input.ts` to `scripts/mutations/shared.ts`,
   each re-anchored on `src/shared/classes.ts`: the one on `input/variants.ts`
   (`'aria-invalid:border-danger-solid'`), the three on the lines of
   `INPUT_INVALID_WIDTH`, and the one on the `md` line of `INPUT_SIZE` (lines 31, 115, 121,
   127 and 133 today). `INPUT_INVALID_WIDTH` is deleted; no test imports it. The constants
   Input does not use (`TARGET_HEIGHT`, `FIELD_HOLDER`, `FIELD_HOLDER_FULL`,
   `FIELD_INVALID_WITHIN`, `FIELD_SURFACE`, `FIELD_TEXT`) each get a test in
   `classes.test.ts` and a compiled rule in a css test, as in 3, and two more mutation
   rows: `FIELD_INVALID_WITHIN` loses the inset ring; the column of `FIELD_HOLDER` loses
   its `minmax(0, ...)`, so the box is a floor again.
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

   Arabic, supplied by the lead on 2026-10-14. This file is ASCII, so each string is
   written here as `\u` escapes; `ar.ts` takes the real letters, and the lead's handoff
   folder has them ready to copy in `unit-4/arabic-labels.md`, with the reason for each
   word. The digits in the two ratio rows stand for the two numbers.

   | Key | Arabic, escaped |
   |---|---|
   | `numberField.increase` | `\u0632\u064a\u0627\u062f\u0629` |
   | `numberField.decrease` | `\u0625\u0646\u0642\u0627\u0635` |
   | `numberField.field` | `\u062d\u0642\u0644 \u0631\u0642\u0645\u064a` |
   | `slider.minimum` | `\u0627\u0644\u062d\u062f \u0627\u0644\u0623\u062f\u0646\u0649` |
   | `slider.maximum` | `\u0627\u0644\u062d\u062f \u0627\u0644\u0623\u0642\u0635\u0649` |
   | `otp.character` | `\u0627\u0644\u062e\u0627\u0646\u0629 2 \u0645\u0646 6` |
   | `textarea.count` | `\u0639\u062f\u062f \u0627\u0644\u0623\u062d\u0631\u0641: 42 \u0645\u0646 500` |

   `textarea.count` puts the noun before the numbers ("character count: 42 of 500"): an
   Arabic noun after a number changes with it, so this is the one order that is right for
   every pair and needs no `Intl.PluralRules`. `ar.ts` is typed `satisfies Labels`, so this
   pull request needs all seven. Both ratio labels pass both numbers through `fmt`, as
   `rating.value` and `pagination.pageOf` do. A `src/shared/labels/unit-4.test.ts` like
   `unit-3.test.ts`, and rows in `scripts/mutations/shared-labels.ts`. Labels that exist
   and are used as they are: `select.placeholder` ("Select"), `collection.noResults`
   ("No results"), `common.loading`, `state.loadingMore`.
6. **`feat/shared-server-tab-stop`.** `src/shared/use-server-tab-stop.ts`, a client file:
   `useServerTabStop(isStop: boolean)` returns `{ tabIndex: 0 }` in the server render and
   in the first client render when `isStop` is true, and `{}` in every other case. It is
   the three lines `useTabsTab` has today
   (`useSyncExternalStore(subscribe, () => false, () => true)`); `tabs/hook.ts` calls it
   and Tabs' tests do not change. RadioGroup and SegmentedControl need it: Base UI serves
   every radio with `tabindex="-1"`. Measured in happy-dom with native-button radios: the
   server HTML has one `tabindex="0"`, on the checked radio, and hydration reports nothing.
   Its own tests: `src/shared/use-server-tab-stop.test.tsx` (server render: `tabindex="0"`
   when true, nothing when false) and a hydration test (after hydration the hook returns
   `{}`). Of the five rows of `scripts/mutations/tabs.ts` on `tabs/hook.ts`, two anchor on
   lines this moves (the `useSyncExternalStore` line and the `stop:` line of
   `useTabsTab`): they go to `scripts/mutations/shared.ts`, re-anchored on the new file.
7. **`feat/shared-option-contract`.** For Select and Combobox. Types only in
   `src/shared/contracts/option.ts`, with a type test:

   ```text
   ListOption = { value: string, label: string, disabled?: boolean }
   ```

   `value` is what the form receives and what `value` and `onValueChange` carry; it is
   unique in its list. `label` is what the row and the trigger show and what a query is
   matched against. Plain data, so a Server Component can pass a list. In
   `src/shared/contracts/collection.ts`, the bounds of the two numeric props every
   collection takes, so no folder copies them (`R-5.7-7`):

   ```text
   COLLECTION_BOUNDARIES = { visibleRowsMin: 1, visibleRowsMax: 20, loadMoreThresholdMin: 0, loadMoreThresholdMax: 200 }
   ```

   `loadMoreThreshold` is a count of rows, 10 by default; `useCollection` only stops it at
   0 today. And two class constants in `src/shared/classes.ts`:

   ```ts
   /** A row under a finger: ROW is 40 px tall and has no floor of its own. */
   export const ROW_TOUCH = 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]'
   /** The chosen row differs by weight as well as by its tick. */
   export const ROW_SELECTED = 'data-selected:font-medium'
   ```

   If Dropdown already landed a 44 px row in `src/shared`, use that and drop `ROW_TOUCH`.
   `ROW_TOUCH` and `ROW_SELECTED` each get a test in `classes.test.ts` and a compiled
   rule, and the bounds a line in `contracts.test.ts`. Mutation row: `ROW_TOUCH` is
   emptied.
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
9. **`feat/shared-form-value`.** Before Switch: all nine client controls use it.
   `src/shared/use-form-value.ts`, a client file, on top of `useControllableState`:

   ```text
   useFormValue({ value, defaultValue, sync }) returns { value, setValue, inputRef, rootRef }
   ```

   - `value` is the caller's controlled value, or `undefined`. `setValue` does nothing
     while the caller controls it. The hook takes no `onChange`: the control's own handler
     calls the caller's, so Base UI's details reach it (see "A form reset" in the rules).
   - `inputRef` and `rootRef` are the hook's own refs; a control hands one of them to
     Base UI. An effect finds the form once: `inputRef.current?.form`, else the `form` of
     the first input inside `rootRef.current`, else the closest form of that root. So the
     `form` attribute is honoured.
   - The effect listens for `reset` on that form and ignores an event whose target is not
     the form. The event is fired before the browser resets the inputs, so the listener
     waits one `setTimeout` of 0. Then: not controlled, it sets the value to the
     `defaultValue` of the latest render and calls `sync` with it; controlled, it calls
     `sync` with the caller's value and sets nothing.
   - `sync(value, input, root)` is for a checkbox or a radio input: it writes
     `input.checked`, because the browser has just put it back to its first default and
     React does not write `checked` again when the state did not change. The hidden text
     and number inputs and a range input need none: after a reset they hold the value of
     the state (measured for a default that changed and for a controlled value).
   - `src/shared/use-form-value.dom.test.tsx`: the default returns after a reset, the
     latest default and not the first one; a controlled value stays and `sync` gets it;
     the listener is removed on unmount; no form, no listener. Mutation rows in
     `scripts/mutations/shared.ts`: the listener is removed; a reset sets the first
     default and not the latest; a controlled control stops calling `sync`.
   - Measured in Chromium with the nine composed as the blocks say (the forms reviewer,
     then the final edit with this wording of the hook): after `form.reset()`, after a
     click on a reset button and after a React 19 form action, every control is back at
     its default on screen and in `FormData`; with the action's result as the new
     defaults every value stays and is sent again, and the console is empty.

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
  `docs/PLAN.md` 12 spreads onto it later with no change to the control. Three of the ten
  need `aria-labelledby` beside that object (below).
- Until then a control gets its label and its error from the page. The label is a plain
  `<label htmlFor>` on the control's `id`, as `input/dummy/labelled.tsx` does, or
  `aria-label` or `aria-labelledby`; the type refuses a control with none. The error is
  the `invalid` prop, which sets `aria-invalid` and the danger line, and a text of the
  caller's own that `aria-describedby` points at. No sample imports `topclassui/field`.
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
native button, the target around a small box, the value that follows a form reset and the
form test, for every control after it. Needs shared pull requests 1, 2, 3 and 9. Base UI
`switch` (`baseUi: 'switch'`): `Root`, `Thumb`.

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
- **The value.** `useSwitch()` in `hook.ts` calls `useFormValue` with `checked`,
  `defaultChecked` and a `sync` that writes `input.checked`. The part hands `Base.Root`
  `checked`, the handler and `inputRef` from it, and never `defaultChecked`. A caller's own
  `inputRef` follows the hook's.
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
  from the end when on, in LTR and in RTL. The target is as wide as its track and at
  least 24 px tall (28 at `xl`), and at least 44 x 44 px under a coarse pointer, also
  when the switch is laid straight into a grid.
- **Keyboard and ARIA.** The Authoring Practices switch: `role="switch"`, `aria-checked`,
  Space and Enter. All Base UI's.
- **Form.** `name`, `value`, `uncheckedValue`, `required` and `form` are Base UI's. Off it
  submits nothing; on it submits `name=on`. `dummy/form.tsx` holds one switch that is on in
  a plain `<form>`.
- **RTL.** The thumb is laid out at the inline start and slides by a translate times
  `--tc-dir`. No class names a side.
- **Files.** `client.tsx`, `hook.ts` (`useSwitch`), `classes.ts`, `constants.ts`,
  `schema.ts` (`size`, `invalid`), `types.ts`, `index.tsx`, `meta.ts`. No `boundaries.ts`.
  This pull request also adds `e2e/form.ts`: `serverEntries(page, form = 'form')` returns
  the entries of `new FormData(...)` read in the page. Every later control imports it.
- **Tests.** Types and compile: a Switch with no name does not compile; `nativeButton` and
  `render` are not props; `onCheckedChange` receives a boolean. Server render: the root is
  a `button` with `role="switch"`, the `id` is on it, the hidden input carries the `name`.
  Dom: a click, Space and Enter each call `onCheckedChange` once, with Base UI's details;
  a handler that calls `details.cancel()` leaves the switch as it was; controlled and
  uncontrolled; `disabled` and `readOnly` do nothing; `className` wins last; a caller's
  `inputRef` holds the hidden input. Form: `FormData` from the server HTML, and after a
  press. Browser, static pages: at each of the five sizes the track and the thumb have the
  sizes above and the target is at least 24 px, then 44 px under a coarse pointer; the
  thumb is 2 px from the end when on, in both directions; `serverEntries` on
  `switch--form` is `[['digest', 'on']]`; on `switch--unchecked-value` the page passes the
  shared target spec and a switch that is off sends that value; under forced colours a
  switch that is on is filled and its thumb can be seen; an invalid track has a 2 px
  danger line. Browser, live: a click on `label[for]` toggles it; Tab then Space; the ring
  is painted around the track and the target has no outline. Browser, live, with
  `e2e/fixtures/switch-reset.tsx`, the four reset cases every later client control
  repeats: toggle it and call `form.reset()`, and the switch and `serverEntries` are both
  the default again; the same after a click on a reset button; the same after a form
  with a function `action` settles; a default that changes with the action's result is
  shown and sent, with an empty console. A fifth for the toggles: a controlled switch
  keeps its value through a reset and `serverEntries` agrees with it. Browser, live,
  `switch-layouts`: laid straight into a grid the target is 35 x 24 px at `md`, as wide
  as its track and not as wide as the grid.
- **Mutation.** `SWITCH_SLIDE` loses `var(--tc-dir)`, so the thumb leaves its track in
  Arabic. A css test that reads the compiled rule catches it. A second row: the part hands
  Base UI `defaultChecked` again, so a reset leaves the switch as it was; the reset case of
  `switch.form.dom.test.tsx` catches it.
- **Not built:** `tone` (only primary is drawn), a label, a hint and a required mark
  (they are a Field's), a hover look (none is drawn), a read-only look, the invalid ring
  that is always on, text or an icon inside the thumb, a loading state.
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

**Build this.** Client. After Switch, which it copies. Needs shared pull requests 1, 2, 3
and 9. Base UI `checkbox` (`baseUi: 'checkbox'`): `Root`, `Indicator`.

- **Export:** `Checkbox`, one element.
- **What Base UI gives** (from `CheckboxRoot.d.ts`): `checked`, `defaultChecked`,
  `onCheckedChange`, `indeterminate`, `name`, `form`, `value`, `uncheckedValue`, `disabled`,
  `readOnly`, `required`, `parent`, `id`, `inputRef`. The root sets `data-checked`,
  `data-unchecked`, `data-indeterminate` (then neither of the other two), `data-disabled`,
  `data-readonly`, `data-required` and `aria-checked`, which is `mixed` when indeterminate.
  `Indicator` renders only while the box is checked or indeterminate. Space toggles it.
  Enter does not: on a native button it submits the form the box is in (measured).
- **What we change and add.** As Switch: the native button, `size`, `invalid`,
  `ControlName`, and the value through `useFormValue` in `useCheckbox()`. `parent` reaches
  Base UI but does nothing without a `CheckboxGroup`, which is not built.
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
  row, tier 2), `tone`, a label child (choice 5), a hover look, a read-only look, the
  always-on invalid ring.
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
shared pull requests 1, 2, 3, 6 and 9. Base UI `radio-group` and `radio`
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
  `aria-invalid` on the group. Its type asks for `GroupName`. Its props are derived from
  `Base.RadioGroup.Props<string>`: `value`, `defaultValue` and the argument of
  `onValueChange` are a `string`. Base UI's own default is `any` (`R-5.12-5`), and a form
  only ever receives a string. `useRadioGroupRoot()` in `hook.ts` does two things. It
  holds the value with `useFormValue`: the part hands `Base.RadioGroup` `value`, the
  handler and `rootRef`, and `sync` writes the `checked` of each radio input in the group.
  And it shares the size and the value the page opens on (`value`, else `defaultValue`,
  read once) with its items through a context, as `useTabsRoot` does.
- **`RadioGroupItem`.** `value` is a `string`. A `<label>` with `RADIO_ITEM` and
  `RADIO_ITEM_TEXT[size]`. In it, `Base.Radio.Root` as a native button with
  `RADIO_TARGET`, holding a `<span>` with `RADIO_BOX` and `TOGGLE_SIZE[size]`, holding
  `Base.Radio.Indicator` with `RADIO_DOT` and `<Svg icon={circleFill} size="56%" />` (a
  dot of 10 px at `md`, as drawn). After the button, a `<span>` with `RADIO_LABEL` around
  the children. The label element names the button in the server HTML, and a click on the
  text selects the radio. `className` and `style` go to the `<label>`; `ref` and the rest
  props go to the radio button.
- **One tab stop in the server HTML.** The item calls one hook, `useRadioGroupItem(value)`
  from `hook.ts`, which reads the context and calls `useServerTabStop(value === opensOn)`.
  The item spreads the tab stop before its other props, so a `tabIndex` the caller wrote
  wins, as on a tab.

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
  radio skipped, the wrap at both ends, Space. Types: `const wrong: number = value` inside
  `onValueChange` does not compile. Form: before and after. Browser, static: circles of 14
  to 28 px inside 24 px targets (44 coarse); a long label wraps at 320 px and the page
  does not scroll sideways; axe. Browser, live: Tab lands on the checked radio; a click on
  the text selects once; in the `rtl` demo ArrowRight goes to the radio before; the reset
  cases of Switch, where "the default" is also a group with no radio checked.
- **Mutation.** The item drops the server tab stop, so the group cannot be reached by Tab
  until the page hydrates.
- **Not built:** `tone`, `RadioCards` (its own row, tier 2), a data-driven `RadioGroup`
  that takes `items`, a description under a label, Home and End, a read-only look.
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

**Build this.** Split, and the only one of the ten that sends what is typed with no script
at all. It can run beside Checkbox and RadioGroup. Needs shared pull requests 2, 4 and 5,
and not 9: a native textarea resets by itself. No Base UI part exists (`baseUi: null`).

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
  an internal part that is not exported. The holder is a `<div>` with `TEXTAREA_HOLDER`,
  `FIELD_TEXT[size]` and the width (`w-full` with `fullWidth`, else `FIELD_OWN_WIDTH`); the
  textarea inside it is `w-full`. It hears the textarea through the `input` event, which
  bubbles. `index.tsx` makes the id of the counter with `useId` and joins it to the
  caller's `aria-describedby`.
- **What crosses the seam.** `index.tsx` renders
  `<TextareaField size fullWidth rows maxRows autosize showCount cap counterId length>`
  around the textarea: plain values and one element. `cap` is the resolved `maxLength`, or
  `null`. `length` is the length of `value ?? defaultValue ?? ''` as the server sees it,
  so the counter the server prints (with `showCount`, or already past the threshold) is
  the one the first client render prints, and hydration reports nothing. The holder never
  clones its child and passes it no prop. `useTextareaField` keeps one ref on the holder
  `<div>` and finds the field with `querySelector('textarea')`. It reads `value.length`
  and `scrollHeight` there in a layout effect after every commit and in the `onInput` of
  the holder, and it writes `rows` on the element and nothing else. Measured in Chromium,
  hydrated: a default of twelve characters with `showCount` reads `12 / 5000` in the
  server HTML and after hydration, with an empty console.
- **Typed before hydration.** The textarea stays the server's element. With no script at
  all, what is typed is kept and sent. With a late script it is kept only when the field
  has no default text: React 19 sets a `<textarea>` back to its default when it hydrates
  one whose default is not empty (`initTextarea` in react-dom 19.3.0; measured with the
  script served 1.5 s late: `typed early` became `Hello`, and stayed `typed early` in a
  field with no default, with and without the holder). That is React's, on every textarea
  of a hydrated page. Say so in the README, and do not promise more.
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
  /** No FIELD_LTR: it reads data-ltr, which only an Input writes. The dir of a textarea is the caller's. */
  export const TEXTAREA_BOX = `block ${FIELD_BOX}`
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
  `constants.ts`, `boundaries.ts`, `schema.ts` (`size`, `invalid`, `fullWidth`, `rows`,
  `maxRows`, `maxLength`, `autosize`, `showCount`), `types.ts`, `meta.ts`.
- **Tests.** Server render: a plain Textarea is one `<textarea>` and no holder (a walk of
  the tree finds no client part); the default cap is 5000 and `null` removes it; `rows`
  99 becomes 40. Node: `rowsFor` and `estimateRows`, written out. Dom: the counter text
  and its three states; `aria-describedby` keeps the caller's id and adds the counter's.
  Hydration: with and without the holder; `showCount` with a `defaultValue` of 12
  characters reads `12 / 5000` in the server HTML and hydration reports nothing. Browser,
  static: typing works with no script; two Textareas in a row fit 320 px; the text is
  16 px under a coarse pointer; the skeleton is as tall as the field. Browser, live: the
  rows follow the text up to `maxRows` and back; a pre-filled autosize field does not
  jump more than a row at hydration. Browser, live, with the script served late: text
  typed early into a Textarea with no default is still there after hydration; into one
  with a default it is replaced by the default, and the README says so.
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
  (choice 29). In a `w-fit` parent and in a table cell a Textarea is 178 px wide (185 on
  touch) and not 193.2: there it takes the browser's own width, as an Input does
  (measured).

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
shared pull requests 1, 2, 4, 6 and 9. Base UI has no segmented part. It is `radio-group`
and `radio` (`baseUi: 'radio-group'`), not `toggle-group`: the head of the card and
`docs/PLAN.md` 16 both call it a radio group, and only a radio group gives one value, a
`name`, a segment that is always selected, and arrows that select as they move. A toggle
group is buttons with `aria-pressed` and an array value, it can be emptied by pressing the
pressed button again, and it submits nothing (choice 15).

- **Parts:** `SegmentedControlRoot` and `SegmentedControlItem`, as the sample writes them.
- **`SegmentedControlRoot`.** `Base.RadioGroup`, the track, inside a holder. Its type
  asks for `GroupName`, and for `value` or `defaultValue`: a segmented control always has
  a selected segment. It is typed as RadioGroupRoot is: a `string` value. `size`: default
  `md`. `fullWidth`: default `false`; with it the track fills its parent and the segments
  share it equally. `invalid` sets `aria-invalid` on the track. The value is held with
  `useFormValue` and the size and the opening value reach the items through a context,
  both in `useSegmentedControlRoot()`, as in RadioGroup.
- **The track sits in a holder,** as a list of tabs sits in `TabsRoot`. The root renders a
  `<div>` with `SEGMENTED_HOLDER` (and `w-full` with `fullWidth`) around
  `Base.RadioGroup`, which carries `SEGMENTED_ROOT`, `SEGMENTED_ROOT_SIZE[size]`,
  `SEGMENTED_FULL` with `fullWidth`, `data-size` and `aria-invalid`. `className`, `style`,
  `ref` and the rest props reach the track, the `radiogroup`; the holder takes nothing
  from the caller. Without the holder, seven long segments made the track 622 px wide and
  scrolled a 320 px page sideways inside a table cell, inside a wrapper in a grid track
  and inside a label row of a column that aligns to the start (measured). With it the
  track scrolls inside itself in all of them.
- **`SegmentedControlItem`.** `Base.Radio.Root` as a native button, with the server tab
  stop from its one hook, `useSegmentedControlItem(value)`, as in RadioGroup. `value` is a
  `string`. `icon?: ReactNode` before the label, in a `<span>` with `SEGMENTED_ICON`. The
  label through `truncateLabel(children, SEGMENTED_CONTROL_BOUNDARIES.labelMaxLength)`, a
  bound of 100, so its text sits in a span with `LABEL`. No `Radio.Indicator`: the raised
  surface is the mark.

  ```ts
  // segmented-control/classes.ts
  /** A grid of one column that may shrink to nothing, as TABS_ROOT is: a track that scrolls would otherwise widen a table cell or a shrinking parent to the width of all its segments. */
  export const SEGMENTED_HOLDER = 'grid grid-cols-1'
  /** The track scrolls sideways inside itself when its segments do not fit, as a list of tabs does. w-fit: a grid item would fill its holder. */
  export const SEGMENTED_ROOT = `relative flex w-fit max-w-full items-stretch gap-0.5 rounded-control bg-surface p-0.75 scroll-px-px ${BORDER} ${SCROLL_X} ${FIELD_INVALID}`
  export const SEGMENTED_ROOT_SIZE = { xs: 'min-h-control-xs', sm: 'min-h-control-sm', md: 'min-h-control-md', lg: 'min-h-control-lg', xl: 'min-h-control-xl', custom: '' } as const
  /** Merged after the track by cn(): w-full replaces w-fit. */
  export const SEGMENTED_FULL = 'w-full *:flex-1'
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
  the segments are 44 px and the track 52. With `fullWidth` three segments are equal
  (81.3 px each in a 256 px parent). Seven long segments in 326 px scroll inside the track
  and the page does not move. In its holder the track was measured alone in eight parents
  at 320 px coarse and at 1280 px: a block, a grid item, a wrapper in a grid track, a flex
  column, a label row, a `flex-1` column, a `w-fit` parent and a table cell. Three
  segments are 210.9 px in every one, also as a grid item, where the track without `w-fit`
  was 1201 px. Seven long segments, and one 300-character word, scroll inside the track in
  every one and the page never scrolls.
- **Keyboard and ARIA.** `role="radiogroup"` with radios. The arrows move and select and
  swap in RTL. The ring is on the focused segment, inside it, because the track clips.
- **Form.** `name` on the root gives the form `name=<value>`. Without a `name` it is a
  view switch, as in the sample.
- **Files.** `client.tsx`, `hook.ts`, `classes.ts`, `constants.ts`, `boundaries.ts`,
  `schema.ts` (`size`, `fullWidth`, `invalid`), `types.ts`, `index.tsx`, `meta.ts`.
- **Tests.** Types: no name, or neither `value` nor `defaultValue`, does not compile.
  Server render: one tab stop, on the selected segment. Keyboard: arrows in both
  directions; a disabled segment is skipped. Dom: `onValueChange` with the value, never
  with nothing; `className` and `ref` are on the `radiogroup`, not on the holder. Types:
  as RadioGroup. Browser: the heights above; a 300-character label ends in an ellipsis and
  the track stays inside a 320 px page; the selected segment differs under forced
  colours; the ring of a focused segment is fully painted; the reset cases of Switch.
  Browser, live, `segmented-control-layouts` with the `many` segments: in each of the
  parents above the track scrolls inside itself and the page does not scroll sideways.
- **Mutation.** The selected segment loses `data-checked:font-semibold`, so only a fill
  tells it from the others. A second row: the holder loses `grid-cols-1`, so a long track
  widens a table cell; a css test reads the compiled rule.
- **Not built:** `tone` (neutral is the only one drawn), `orientation` (no vertical
  track), a sliding indicator, a ring around the whole track, a toggle-group flavour that
  can be empty, a read-only look.
- **For the reviewer:** the `xs` track is 4 px taller than an `xs` Button. The radius of
  the track and of a segment is `rounded-control`, so both are pills in Ocean (choice 13).
  The card is under "Actions" in the design; `meta.ts` says `forms`, from the catalog. In
  Light the selected segment is white on a track of `--tc-surface`, about 1.04 to 1, with
  a soft shadow: what tells it apart for a reader with low vision is the weight (600
  against 500) and the darker text. Under forced colours it is `Highlight` (measured). A
  line around the selected segment is choice 36. With `fullWidth`, seven long segments at
  320 px are 44 px each and their labels are cut to nothing: a full-width track is for a
  few short segments, and the README says so. With `fullWidth` in a parent that sizes to
  its content (a `w-fit` parent, a table cell) the track is as wide as its segments,
  since there is no width to fill.

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
requests 2, 4, 5 and 9. Base UI `slider` (`baseUi: 'slider'`): `Root`, `Control`, `Track`,
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
  the root. `fullWidth`: default `false`. The root is the box that owns the width: it
  takes `FIELD_HOLDER`, and `FIELD_HOLDER_FULL` after it with `fullWidth` (shared pull
  request 4 says what the two plain widths did to a slider). `showValue`: default
  `false`; it renders `Base.Value` after the control. The name: `GroupName`. `min`, `max`
  and `step`, when passed, are clamped to `SLIDER_BOUNDARIES`: `limitMin: -1e15`,
  `limitMax: 1e15`, `stepMin: 0.000001` (`R-5.7-7`).
- **What we remove.** `thumbAlignment`: it stays `center`. The `edge` value hides the
  thumb in the server HTML and places it with an inline script, which needs a CSP nonce.
  `required` is accepted, so a Field can spread its object, and dropped: Base UI has none.
- **One thumb or two.** A number gives one thumb. An array of two gives a range.
  `SliderProps` is generic, as Base UI's is:
  `SliderProps<Value extends number | readonly [number, number] = number>`, derived from
  `Base.Slider.Root.Props<Value>`, and `Slider` is a generic function. So `onValueChange`
  hands a number to a single slider and a pair to a range; derived without the type
  argument it takes `number | readonly number[]` and `onValueChange={setVolume}` does not
  compile (compiled both ways). For one thumb the name and `aria-describedby` go to the
  Thumb. For a range the name goes to the root, `aria-describedby` goes to both thumbs
  (on the root it stays on the group, which no screen reader lands on), and the thumbs
  are named `labels.slider.minimum` and `labels.slider.maximum`, each with
  `getAriaValueText={(formatted) => formatted}`: Base UI's own value text is the English
  "20 start range".
- **Markup.** `Base.Root` with `SLIDER_ROOT`, `FIELD_TEXT[size]`, `FIELD_HOLDER_FULL`
  with `fullWidth`, `data-size` and `aria-invalid`. In it one `<div>` with `SLIDER_ROW`:
  the root is a grid of one column, and the row is its one item. In the row
  `Base.Control` with `SLIDER_CONTROL`, holding `Base.Track` with `SLIDER_TRACK` and
  `SLIDER_TRACK_SIZE[size]`, holding `Base.Indicator` with `SLIDER_INDICATOR` and one
  `Base.Thumb` per value with its `index` and `SLIDER_THUMB`. Each thumb holds a `<span>`
  with `SLIDER_KNOB` and `TOGGLE_SIZE[size]`. With `showValue`, `Base.Value` with
  `SLIDER_VALUE` follows the control, inside the row. `className`, `style`, `ref` and the
  rest props reach the root. `useSlider()` in `hook.ts` returns the labels, the locale
  and the numbering system, and the value through `useFormValue`: the part hands
  `Base.Root` `value`, the handler and `rootRef`.

  ```ts
  // slider/classes.ts
  /** The box that owns the width. No type step here: FIELD_TEXT[size] gives it, so the em of the width is an Input's. */
  export const SLIDER_ROOT = `group/slider grid ${FIELD_HOLDER} ${DISABLED}`
  /** The one item of that grid: the control, and the value after it. */
  export const SLIDER_ROW = 'flex min-w-0 items-center gap-3'
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
  three quarters of the track gives 75 in LTR and 25 in RTL. The slider is
  `--tc-input-width` wide, the width of an Input of its size: 165.6 px at `xs`, 193.2 at
  `sm` and `md`, 220.8 at `lg` and `xl`, and 220.8 at every size under a coarse pointer,
  in a block, a grid track, a `flex-1` column, a `w-fit` parent, a table cell and a label
  row; in a 120 px flex row it is 120 px. Two side by side are 124 px each at 320 px and
  159 at 390, in a grid of `1fr 1fr`, in a flex row and inside plain wrappers, as two
  Inputs are, and the track between the two paddings follows (80 and 115 px). With
  `text-sm` on the root it was 193.2 px at every size. In a `w-fit` parent and in a table
  cell an Input itself is a little narrower at `xs`, `sm` and `md` (163, 185 and 193 px;
  199, 207 and 215 on touch): there it takes the browser's own width for twenty
  characters.
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
  becomes the bound; `aria-describedby` is on the range input of one thumb and of both
  thumbs of a range; `required` is on no element. Types: `onValueChange={setNumber}`
  compiles on a single slider and `onValueChange={setPair}` on a range. Keyboard: every
  key above, in both directions. Form: the three rows of the table. Browser, static: the
  thumb is at least 24 px at every size and 44 px coarse; at 0 and at 100 nothing is
  outside the root at 320 px; the track can be seen under forced colours; in a block
  parent a Slider is as wide as an Input of the same size, at every size and under a
  coarse pointer. Browser, live: a click on the track, a drag, and the same in the `rtl`
  demo; the ring is on the knob; the reset cases of Switch, for one thumb and for a
  range. Browser, live, `slider-layouts`: in a `w-fit` parent and in a label row the
  slider keeps `--tc-input-width`; two in a grid of `1fr 1fr` at 320 px with a coarse
  pointer are 124 px each and the page does not scroll sideways.
- **Mutation.** A thumb of a range loses its `index`, so both thumbs are hidden in the
  server HTML. A second row: the root loses `FIELD_HOLDER`, so in a `w-fit` parent the
  slider is as wide as its thumb; a test of the server HTML reads the class, and the
  browser test above measures what it costs.
- **Not built:** `tone`, a vertical look (`orientation` still reaches Base UI, but no
  class reads it), `thumbAlignment`, more than two thumbs, tick marks, labels for the two
  ends, a tooltip on the thumb.
- **For the reviewer:** `aria-invalid` is on the root group. Base UI routes only names and
  descriptions to the range input, so a screen reader hears the error through
  `aria-describedby`. A caller's `id` reaches the root, not the input: a Field has to name
  a Slider with `aria-labelledby`. The track is inset by 12 px, 22 on touch, so its ends
  do not line up with a field above it (choice 18). A `format` of percent multiplies: use
  values from 0 to 1 with it. Before hydration the range input takes the arrow keys: the
  form then sends the new number while the thumb stays put, until hydration puts the
  default back. With `fullWidth` in a parent that sizes to its content (a `w-fit` parent,
  a table cell) there is no width to fill and the slider is as wide as its thumb: 24 px,
  44 on touch (measured). Say both in the README.

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

**Build this.** Client. Needs shared pull requests 1, 2, 4, 5 and 9. Base UI
`number-field` (`baseUi: 'number-field'`): `Root`, `Group`, `Input`, `Increment`,
`Decrement`.

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
- **What we add.** `size`: default `md`. `invalid`. `fullWidth`: default `false`. The root
  is the box that owns the width: `FIELD_HOLDER`, and `FIELD_HOLDER_FULL` after it with
  `fullWidth`. `placeholder`. The name: `ControlName`.
- **The clamp at our seam (`R-5.7-7`).** Base UI clamps what is typed, not what it is
  given: `defaultValue={50}` with `max={10}` renders 50 and submits 50. So `defaultValue`
  and `value` go through `clamp()` between `min` and `max` before they reach Base UI,
  unless `allowOutOfRange` is set. `min` and `max` themselves are clamped to
  `NUMBER_FIELD_BOUNDARIES` (`limitMin: -1e15`, `limitMax: 1e15`), and a numeric `step` to
  `stepMin: 0.000001`. No default `min` or `max` is passed down: Home would jump to it.
- **The three English strings.** `aria-label` on `Decrement` and `Increment` from
  `labels.numberField.decrease` and `.increase`, and `aria-roledescription` on the Input
  from `labels.numberField.field`. `locale` and `format.numberingSystem` as the rules say.
- **The value.** `useNumberField()` in `hook.ts` holds it with `useFormValue`, after the
  clamp above: the part hands `Base.Root` `value`, the handler and `inputRef` (the hidden
  input).
- **Typed before hydration.** The visible input is a real text field, so a person can type
  in it before the script runs. React keeps that text when it hydrates, while Base UI's
  state and the hidden input keep the default (measured with a script served 1.5 s late:
  7 on screen, `guests=2` sent, also after a blur). So `useNumberField()` puts a ref on
  `Base.Input` and, in an effect on mount, writes `input.defaultValue` back into
  `input.value` when the two differ. The early text is lost, as it is in an OTPField and
  a Combobox, and the screen and the form agree (measured: 2 on screen, `guests=2`).
- **Markup.** `Base.Root` with `NUMBER_FIELD_ROOT`, `FIELD_TEXT[size]`,
  `FIELD_HOLDER_FULL` with `fullWidth`, and `data-size`. In it `Base.Group` with
  `NUMBER_FIELD_GROUP` and `CONTROL_HEIGHT[size]`, holding `Base.Decrement`
  (`NUMBER_FIELD_STEP`, `<Svg icon={minus} size="0.875rem" />`), `Base.Input`
  (`NUMBER_FIELD_INPUT`, `dir="ltr"` unless the caller passes `dir`) and `Base.Increment`
  (the same with `plus`). `className`, `style`, `ref` and the rest props reach the root
  `<div>`. `id`, `name` and `required` go to `Base.Root`; the two ARIA names,
  `aria-describedby`, `aria-invalid` and `placeholder` go to `Base.Input`.

  ```ts
  // number-field/classes.ts
  /** The box that owns the width. As an inline block with a width of its own it could not shrink: the input inside keeps the browser's width as a floor. */
  export const NUMBER_FIELD_ROOT = `inline-grid align-middle ${FIELD_HOLDER}`
  /** The box of the field. Its ring shows while the input inside it has the focus. It dims the whole field when disabled. */
  export const NUMBER_FIELD_GROUP = `group/number flex w-full items-stretch overflow-hidden ${FIELD_SURFACE} ${FOCUS_RING_WITHIN} ${TARGET_HEIGHT} ${FIELD_INVALID_WITHIN} data-disabled:opacity-50 data-readonly:bg-neutral-soft`
  /** It reaches over the line of the box, or it is 42 px tall on touch and the shared spec refuses it. */
  export const NUMBER_FIELD_INPUT = `-my-(--tc-line-width) min-w-0 flex-1 bg-transparent px-1 text-center tabular-nums outline-none placeholder:text-muted ${TARGET_HEIGHT}`
  /** DISABLED dims a stepper at its limit. In a disabled field the box already dims it, and opacity multiplies. A read-only stepper has no disabled attribute, so it is dimmed by name. */
  export const NUMBER_FIELD_STEP = `-my-(--tc-line-width) inline-flex aspect-square shrink-0 items-center justify-center text-body tone-neutral ${HOVER.ghost} ${FOCUS_RING_INSET} ${TOUCH_TARGET} ${TRANSITION} ${DISABLED} data-readonly:pointer-events-none data-readonly:opacity-50 group-data-disabled/number:disabled:opacity-100`
  ```

- **What that draws** (measured): a field of 193.2 x 40 px at `md`, the width of an
  Input, with steppers of 40 x 40 px and the number centred between them; 28 px tall at
  `xs`. Under a coarse pointer the field, the steppers and the input are 44 px tall and
  the text is 16 px. The ring is around the whole field. Invalid: the danger line. The
  field has the width of an Input at each of the five sizes, and in a `w-fit` parent and
  a table cell it is 193.2 px in a parent of 193.2. Two side by side are 124 px each at
  320 px and 159 at 390, in a grid of `1fr 1fr`, in a flex row and inside plain
  wrappers. With the root as an inline block of `FIELD_OWN_WIDTH`, as this block first
  had it, the same two were 220.8 px each and the page scrolled sideways by 162 px in a
  flex row and by 220 in the grid. Computed opacity, the box then a stepper: a disabled
  field 0.5 and 1, so everything is painted once at half (without the last class of
  `NUMBER_FIELD_STEP` a stepper was 0.5 inside 0.5, a quarter, beside a number at a
  half); a live field at its `max` 1 and 0.5 on the plus; a read-only field 1 and 0.5 on
  both, and the pointer paints no hover on them (without the two `data-readonly` classes
  it did).
- **Keyboard and ARIA.** The steppers stay out of the tab order, as Base UI and the
  Authoring Practices spin button leave them: the arrow keys do their work. A stepper at
  its limit is disabled by Base UI and `DISABLED` dims it. In a read-only field Base UI
  gives the steppers `aria-disabled="true"` and `data-readonly`, and no `disabled`
  (rendered).
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
  target is 44 px under a coarse pointer; on `number-field--row` the two fields are
  124 px each at 320 px with a coarse pointer and the page does not scroll sideways; in a
  disabled field the computed opacity of a stepper is 1 inside a group at 0.5; at `max`
  in a live field the plus stepper is 0.5; in a read-only field a stepper is 0.5 and the
  pointer paints no hover on it. Browser, live: a click on each stepper; typing past
  `max`; the `rtl` demo has increase at the left and a negative number keeps its sign at
  the left; the reset cases of Switch; with the script served late, a number typed
  before it arrives is replaced by the default once the page hydrates, and `FormData`
  holds the default. Browser, live, `number-field-layouts`: two in a grid of `1fr 1fr`,
  each alone and each in a plain wrapper, at 320 px: 124 px each, no sideways scroll.
- **Mutation.** The default value is no longer clamped, so a value past `max` is
  submitted. Four more rows: the stepper loses
  `group-data-disabled/number:disabled:opacity-100`; it loses the two `data-readonly`
  classes; the mount effect is removed, so an early number stays on screen and is not
  sent (a hydration test in the dom project sets the input's value before it hydrates);
  the root loses `FIELD_HOLDER` (a test of the server HTML reads the class).
- **Not built:** `NumberField.ScrubArea`, a prefix, a suffix or a unit, the `variant`
  prop, danger at the limit (choice 10), steppers stacked at one end.
- **For the reviewer:** the visible input is editable; the hidden one only carries the
  form value. The steppers are not tab stops and their order mirrors (choice 19). The
  default `step` is 1 (choice 20). Press-and-hold and the wheel are Base UI's and were not
  run. The steppers never give up their 44 px under a coarse pointer, so a narrow field
  takes the room from the number: two in a row at 320 px leave it 34 px, and beside a long
  label in a column of 95 px it has 8 px. Say in the README that a NumberField wants
  about 130 px.

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

**Build this.** Client. Tier 3. Needs shared pull requests 1, 4, 5 and 9. Base UI
`otp-field` (`baseUi: 'otp-field'`): `Root`, `Input`. Its `Separator` exists in 1.8.0
and is not used: ours is decoration.

- **Export:** `OTPField`, one element. The folder is `otp-field`, so the scaffold writes
  `OtpField` and `OTP_FIELD`: keep `OTP_FIELD_DEFAULTS` and `OTP_FIELD_BOUNDARIES`,
  `meta.name` stays `OtpField`, and the function is `OTPField`. The props type in
  `types.ts` is `OtpFieldProps`, with `export type OTPFieldProps = OtpFieldProps` beside
  it: `pnpm readme:build` looks up `${meta.name}Props` (`scripts/readme-build.ts`) and,
  finding none, prints that every prop is optional. The generated Import block prints
  `OtpField`, which is not an export: the hand-written import block is the one a reader
  copies, and a compile test proves `OTPField` is an export and `OtpField` is not.
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
  (`lengthMin: 1`, `lengthMax: 12`; choice 39). `size`: default `md`. `invalid`.
  `groupSize`: default 0; with 3 on a length of 6 a separator follows every third cell. It
  is clamped between 0 and `length`. The name: `id` or `aria-labelledby` is required.
  `aria-label` is not offered: Base UI drops it on the first cell on purpose.
- **Digits in Arabic.** Base UI's `numeric` type is ASCII only: an Arabic keyboard on a
  desktop cannot fill the field. So when `validationType` is `numeric`, which is the
  default, and the caller passes no `normalizeValue`, we pass Base UI
  `validationType="none"`, `inputMode="numeric"` and `normalizeValue={toAsciiDigits}`.
  `toAsciiDigits` in `lib.ts` keeps 0 to 9, maps U+0660 to U+0669 and U+06F0 to U+06F9 to
  0 to 9, and drops every other character: with `none` nothing else filters, so it is the
  only gate. Run in Chromium: U+0661 and U+06F2 are stored as 1 and 2, a letter is
  refused. The cost is the `pattern` attribute. The other three types pass through.
- **Left to right, always.** The root carries `dir="ltr"` and sits inside Base UI's
  `DirectionProvider` with `direction="ltr"`, imported from
  `@base-ui/react/direction-provider`. Without the provider the arrow keys of an Arabic
  page would run against the cells.
- **Names.** `aria-labelledby`, `aria-describedby` and `aria-invalid` are taken out of
  the props and never left in the rest: on `Base.Root` all three land on the `group`,
  the first cell then has no name and no cell turns red (rendered). The first cell takes
  `aria-labelledby` and `aria-describedby`; with an `id`, a `<label htmlFor>` reaches it.
  Each later cell takes `aria-label={labels.otp.character(place, length, fmt)}`. Every
  cell takes `aria-invalid={invalid ? true : ariaInvalid}`, so the one a Field passes
  survives, as on Input.
- **The value.** `useOtpField()` in `hook.ts` holds it with `useFormValue`: the part
  hands `Base.Root` `value`, the handler and `rootRef`.
- **Markup.** `Base.Root` with `OTP_ROOT`, `dir="ltr"` and `data-size`, and `OTP_WRAP`
  when the cells plus the separators are more than `OTP_FIELD_WRAP_ABOVE` (8, in
  `constants.ts`). In it `length` times `Base.Input` with `OTP_CELL` and
  `OTP_CELL_SIZE[size]`, and between groups a `<span aria-hidden>` with `OTP_SEPARATOR`.
  `className`, `style`, `ref` and the rest props reach the root `<div>`.

  ```ts
  // otp-field/classes.ts
  /** As wide as its cells, so in an Arabic form the group sits at the start, beside its label, while the cells run left to right. */
  export const OTP_ROOT = 'flex w-fit min-w-0 max-w-full items-center gap-2'
  /** Past eight items a row cannot shrink enough: nine cells of 24 px and their gaps are 280 px. */
  export const OTP_WRAP = 'flex-wrap'
  /** A cell may give up width where six do not fit, and never height. w-full under a max-w, not a basis: a table cell or a shrinking parent then counts a cell as 24 px, not 44. */
  export const OTP_CELL = `w-full min-w-[var(--tc-target-min,24px)] shrink grow-0 p-0 text-center font-semibold tabular-nums rounded-control bg-surface-raised text-body ${BORDER_STRONG} ${TRANSITION} ${DISABLED} ${FOCUS_RING} ${TARGET_HEIGHT} ${FIELD_INVALID}`
  /** A square of the control scale, as the most a cell may be. Under a coarse pointer the three small sizes may be 44 px wide. */
  export const OTP_CELL_SIZE = {
    xs: `h-control-xs max-w-control-xs text-sm pointer-coarse:max-w-[var(--tc-target-coarse,44px)] ${FIELD_TEXT_COARSE}`,
    sm: 'h-control-sm max-w-control-sm text-base pointer-coarse:max-w-[var(--tc-target-coarse,44px)]',
    md: 'h-control-md max-w-control-md text-lg pointer-coarse:max-w-[var(--tc-target-coarse,44px)]',
    lg: 'h-control-lg max-w-control-lg text-xl',
    xl: 'h-control-xl max-w-control-xl text-2xl',
    custom: '',
  } as const
  export const OTP_SEPARATOR = 'h-0.5 w-2.5 shrink-0 rounded-full bg-line-strong forced-colors:bg-[CanvasText]'
  ```

  `OTP_CELL` spells out the look of a field and does not take `FIELD_SURFACE`: that one
  carries `max-w-full`, and two `max-w` classes in one string do not merge.
- **What that draws** (measured, on the repo's page with its 32 px gutters): six cells of
  40 x 40 px at `md` with 18 px digits, 280 px wide, 298 with one separator; cells of 28,
  32, 40, 48 and 56 px at the five sizes. At 390 px with a coarse pointer the cells are
  44 x 44 px. At 320 px six cells are 36 x 44 px, 33 with one separator, seven are 29.7
  and eight are 25, and nothing scrolls sideways. Nine or more wrap: nine break 5 + 4,
  twelve 5 + 5 + 2, every cell 44 x 44 px, and nothing scrolls. Without `OTP_WRAP` twelve
  cells ended at 408 px and scrolled a 320 and a 390 px page sideways. With the wrap on
  for every length, six cells at 320 px broke 5 + 1, so it is on only where a row cannot
  shrink enough. In an RTL page the cells still run left to right, and the group ends at
  the right edge of a block parent, under its label (953 to 1233 in a 1201 px block;
  without `w-fit` it filled the block and the first cell was at the far left).
- **In the parents a real page has** (measured at 320 px coarse and at 1280 px): a block,
  a grid item, a wrapper in a grid track, a flex column, a label row, a `flex-1` column,
  a `w-fit` parent and a table cell. Six cells are 36 x 44 px in every one and the page
  never scrolls. With a `basis` on the cell, as this block first had it, six cells kept
  44 px in the wrapper in a grid track and in the table cell, and the page scrolled
  sideways (336 px of 320): such a parent counted the row as six times 44 px.
- **Form.** The hidden input submits what is typed so far, also a code that is not
  complete, and `name=` when empty. `autoSubmit` and `mask` are Base UI's.
- **Files.** `client.tsx`, `hook.ts`, `lib.ts`, `classes.ts`, `constants.ts`
  (`OTP_FIELD_WRAP_ABOVE`), `boundaries.ts`, `schema.ts` (`length`, `size`, `invalid`,
  `groupSize`), `types.ts`, `index.tsx`, `meta.ts`.
- **Tests.** Node: `toAsciiDigits`, written out for ASCII digits, both other digit
  ranges, a letter and a mixed string. Types: no `id` and no `aria-labelledby` does not
  compile. Server render: `length={99}` renders twelve cells; one tab stop; the Arabic
  names of cells two to six; `dir="ltr"` on the group; the caller's `aria-labelledby` is
  on the first cell; `aria-invalid` passed as a plain prop is on every cell and not on
  the group; `aria-describedby` is on the first cell only; nine cells carry `OTP_WRAP`
  and eight do not. Dom: an Arabic-Indic digit is stored as ASCII; ArrowLeft goes to the
  cell before under an RTL provider; `onValueComplete` at the last cell. Browser, static:
  cells of 44 px at 390 px coarse; no sideways scroll at 320 px; on `otp-field--long`,
  twelve cells at 320 and 390 px coarse: no sideways scroll, every cell 44 x 44 px; in
  the `rtl` demo the group ends at the inline start edge of a block parent. Browser, live:
  a click on the label focuses the first cell; a paste of six digits; the ring of a
  focused cell is fully painted; the reset cases of Switch. Browser, live,
  `otp-field-layouts`: six cells in a table cell and in a wrapper inside a grid track at
  320 px coarse are 36 x 44 px and the page does not scroll sideways.
- **Mutation.** `toAsciiDigits` stops mapping the Arabic-Indic range. Three more rows:
  the cells read `invalid` alone, so the `aria-invalid` of a Field is lost; the root
  never takes `OTP_WRAP`; a cell takes a `basis` in place of its `max-w` (a css test
  reads the compiled rule).
- **Not built:** the cell border as the focus mark (choice 23), cells that hug their
  text, a separator as a part, a `pattern` on numeric cells.
- **For the reviewer:** at 320 px with a coarse pointer a six-cell field gives each cell
  36 px of width under a finger, 33 with a separator: `R-5.6-2` asks for 44 both ways,
  and six cells of 44 px do not fit there (choice 38). At 390 px six cells are 44 px,
  but seven are 39.7, eight are 33.8, and six with two separators are 41.7. The shared
  target spec measures every demo at 390 px and asks for 44 px both ways, so no demo
  holds one of those three rows: the demos hold six cells, six with one separator, and
  twelve. Eight cells need 248 px: in a parent of 241 px the eighth was painted 7 px
  outside the row, and the page did not scroll. In a wrapped row a separator can end a
  line or start one. A partial code is submitted as it is. A default value written in
  Arabic-Indic digits was not run. Paste was not run.

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
Phase 4. Needs shared pull requests 1, 2, 4, 7 and 9. Base UI `select` (`baseUi: 'select'`):
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
  trigger. A letter typed on the closed trigger changes the value at once. The arrows
  stop at both ends. A disabled option is not skipped: it takes the highlight and the
  focus, and Enter on it does nothing (measured). After a `focus()` from a script the
  focus reached the list only after more than half a second; after Tab, Space or a click
  it was there at once. A spec waits for the focus, never for a fixed time.
- **Props.** `items: readonly ListOption[]`, required: plain data, so a Server Component
  can render a Select with no function crossing. It goes to Base UI's `items` and is
  mapped to one `Base.Item` each. `value` and `defaultValue` are `string | null`.
  `placeholder`: the text of an empty trigger, default `labels.select.placeholder`. `size`:
  default `md`. `invalid`. `fullWidth`: default `false`. A trigger has no width of its
  own, so it sits in a box that owns the width, as a Combobox input does: a `<span>` with
  `FIELD_HOLDER`, and `FIELD_HOLDER_FULL` after it with `fullWidth` (shared pull request 4
  says what the two plain widths did to a trigger). `placement`: the twelve `PLACEMENTS`,
  default `bottom-start`, through `toSideAlign`. `visibleRows`: clamped to
  `COLLECTION_BOUNDARIES`; when it is passed the popup sets `--tc-list-rows` inline, and
  otherwise the CSS knob applies. `container` goes to the Portal. The name:
  `ControlName`.
- **What we remove from the type.** `multiple` (MultiSelect is its own row),
  `itemToStringLabel`, `itemToStringValue` and `isItemEqualToValue` (a value is a string),
  and `children`. From the trigger's rest props: `value`, `defaultValue`, `name`, `form`,
  `disabled` and `type`, which are the Root's or fixed. Left in, the button's own `value`
  makes `value={null}` a type error (compiled both ways).
- **The value.** `useSelect()` in `hook.ts` holds it with `useFormValue`: the part hands
  `Base.Root` `value`, the handler and `inputRef`.
- **Markup.** `Base.Root` with `items`, `id`, `name` and the state props. In it a `<span>`
  with `SELECT_ROOT`, `FIELD_TEXT[size]` and `FIELD_HOLDER_FULL` with `fullWidth`: the box
  that owns the width, which takes nothing from the caller. In the box `Base.Trigger`
  with `SELECT_TRIGGER`, `FIELD_SIZE[size]`, `data-size`, the two ARIA names,
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
  /** The box that owns the width. The trigger fills it, whatever its label is. */
  export const SELECT_ROOT = `inline-grid align-middle ${FIELD_HOLDER}`
  export const SELECT_TRIGGER = `inline-flex w-full items-center justify-between gap-2 text-start ${FIELD_BOX} data-readonly:bg-neutral-soft`
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
- **The width, measured in the parents a real page has** (static, at 320 and 390 px with
  a coarse pointer and at 1280 px): in its box the trigger is 193.2 px (220.8 on touch;
  165.6 at `xs` and 220.8 at `lg` and `xl`) in a block, a grid item, a wrapper in a grid
  track, a flex column, a label row, a `flex-1` column, a `w-fit` parent and a table
  cell, whether it shows the placeholder, a short label or one 300-character word, which
  ends in an ellipsis. Two side by side are 124 px each at 320 px and 159 at 390, in a
  grid of `1fr 1fr`, in a flex row and inside plain wrappers, as two Inputs are. With
  `fullWidth` it fills a block, a grid track and a `flex-1` column, and with the
  300-character word it is never wider than its parent and the page never scrolls.
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
- **Files.** `client.tsx`, `hook.ts` (the value, the placeholder and `usePortalLocale`),
  `classes.ts`, `constants.ts`, `schema.ts` (`size`, `invalid`, `fullWidth`, `placement`,
  `visibleRows`), `types.ts`, `index.tsx`, `meta.ts`. No `boundaries.ts`: the one bound
  is the shared `COLLECTION_BOUNDARIES`, which `schema.ts` imports.
- **Tests.** Server render: the trigger prints the label of the default value, or the
  placeholder; a demo is a Server Component that passes only data (`rsc`). Types: no
  name does not compile; `items` is required; `multiple` is not a prop; `value={null}`
  compiles and `type` on a Select does not. Dom: `placement` reaches Base UI as side and
  align; `dir` and `lang` on the positioner, in an island and with no provider;
  `className` and `ref` are on the trigger, not on the box. Browser, static: in a block
  parent the trigger is as wide as an Input of the same size, at every size and under a
  coarse pointer. Browser, live, `select-layouts` and `select-hostile`: inside a `w-fit`
  parent, a table cell and a label row the trigger is `--tc-input-width` wide whatever
  its label; two in a grid of `1fr 1fr` at 320 px with a coarse pointer are 124 px each;
  with `fullWidth` and one 300-character word, in a table cell, the page does not scroll
  sideways. The reset cases of Switch. Browser, live, with `dummy/sixty-items.tsx`:
  everything under "Measured" above, at the four edges of the viewport, in both
  directions; the popup opens 6 px under its trigger and never covers it; a label of 300
  characters ends in an ellipsis in the row and in the trigger; a disabled option takes
  the highlight, is dimmed, and neither Enter nor a click chooses it. Browser, both pages
  of `phase-4-form`: `serverEntries` on the static page gives the six defaults, on the
  live page the six values after each control was changed, and after a reset the six
  defaults again, on screen and in `serverEntries`. Browser, live, with
  `e2e/fixtures/select-in-dialog.tsx`: the list is painted above the dialog; the first
  Escape closes the list and leaves the dialog open, the second closes the dialog; after
  both the page scrolls again. `modal={false}`: the page scrolls while the list is open.
  One README line per value of `modal`. axe on the open popup, scoped as Popover's spec
  scopes it, and with `[data-base-ui-focus-guard]` excluded.
- **Mutation.** The positioner stops taking the side and the align of `placement`, so
  `top-start` opens under the trigger. A second row: the box loses `FIELD_HOLDER`, so the
  trigger is as wide as its label (a test of the server HTML reads the class).
- **Not built:** the parts as public exports (choice 7), `multiple`, groups and
  separators, an icon or a second line in an option, `StateProps` and remote options,
  windowing, the scroll arrows, `variant`, the adaptive Select that is a Drawer on a phone
  (a connector), a clear button and an empty option (a chosen value cannot be unset by
  the user), `selectedItem`, a warning for two options with one `value`.
- **For the reviewer:** while it is open `body` has `overflow: hidden`: that is `modal`,
  Base UI's default, kept (choice 27). Base UI adds four focus guards, each
  `aria-hidden` and focusable, and axe counts them (`aria-hidden-focus`: 4 with them, 0
  without): they are Base UI's, so the spec leaves them out and says why. The popup grows
  with its longest label up to the room there is; it does not stay as narrow as the
  trigger. A row is 40 px, not the drawn 31. The list keeps its sixty options mounted
  after it closes. `openOverlay` needs `popup: '[data-placement]'`: the listbox itself
  has no `data-open`. A required Select with nothing chosen blocks the submit through the
  browser's own validation of the hidden input; after hydration the focus then goes to
  the trigger, and before it to the hidden input (run by the forms reviewer and again by
  the final edit). Inside the
  repo's Dialog a prototype did this (measured, with `modal` left alone and with `false`):
  the list is at z-index 60 over the dialog's 50 and takes the pointer; one Escape closes
  the list and the focus is back on the trigger; a second closes the dialog; then
  `body` is no longer locked and a wheel moves the page. On a page of its own, the list
  open: a wheel does not move the page with `modal` left alone, and moves it with
  `modal={false}`. With `fullWidth` in a parent that sizes to its content (a `w-fit`
  parent, a table cell) there is no width to fill, and the trigger is as wide as its
  label: 97 px for "Jordan". Without the box the same trigger holding one 300-character
  word was 2,324 px wide in a table cell and the page scrolled sideways. The width
  belongs to the box, as on a Combobox and a Textarea in its holder: a width class in
  `className` lands on the trigger inside it. Say in the README to use `fullWidth` and
  to size the parent.

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
Needs shared pull requests 1, 2, 4, 7, 8 and 9, and Select merged: it copies the popup and
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
  `string | null`. `placeholder`. `maxLength`: `number | null | undefined`, through
  `resolveMaxLength(maxLength, 'search')`, so the typed query is capped at 256 by default
  and `null` removes the cap (`R-5.7-8`); it goes to `Base.Input`, which passes it on
  (rendered), and no counter is drawn. `size`, `invalid`, `fullWidth` (otherwise
  `FIELD_OWN_WIDTH`: the input gives the box a width), `placement` (default
  `bottom-start`), `visibleRows` and `container`, as Select; `keepMounted` goes to the
  Portal too. From `CollectionProps`: `virtualize` (default `'auto'`), `hasMore`,
  `loadMore` and `loadMoreThreshold`, which is clamped to `COLLECTION_BOUNDARIES` before
  it reaches `useCollection` (`R-5.7-7`). `status`: `'idle' | 'loading' | 'loading-more'`,
  default `idle`. `emptyFallback`: what an empty list says, default
  `labels.collection.noResults`. The name: `ControlName`.
- **What we remove from the type.** `multiple`, `virtualized` (it is ours to set),
  `filteredItems`, `grid`, `inline`, `limit`, the three item converters, and `children`.
- **The options become a collection** in `hook.ts`:
  `Base.createItems(items, { getValue, getLabel })`, memoised on `items`. Then the value
  is the string, the input shows the label in the server HTML, and the form receives the
  value (rendered: with plain `{ value, label }` objects and a string default the input
  showed the raw `jo`).
- **The value.** `useCombobox()` in `hook.ts` holds it with `useFormValue`: the part
  hands `Base.Root` `value`, the handler and `inputRef` (the hidden input).
- **The list is windowed by the shared hook** (`R-8.5-1`), in
  `parts/combobox-list.tsx`, which mounts with the popup. `Base.Root` always gets
  `virtualized`. The part calls one hook, `useComboboxList(scroller)` from `hook.ts`, and
  nothing else (`R-5.12-1`). That hook calls `Base.useFilteredItems()`, cast with
  `as readonly ListOption[]` (no angle brackets in `hook.ts`), and `useCollection` with
  those items, `getKey` reading `value`, `virtualize`, `hasMore`, `loadMore`,
  `loadMoreThreshold` and `estimateRowHeight`. The part renders `collection.rows` only,
  each a `Base.Item` with `index`, `value={row.item.value}` (the string, not the option:
  with a `createItems` collection the rows are options and the selection is their
  value), `disabled`, `ref={collection.rowRef(index)}`, `data-row={index}`,
  `aria-setsize` and `aria-posinset`. `Base.List` takes `collection.scrollRef`, and sets
  `--tc-list-pad-start` and `--tc-list-pad-end` inline from `paddingStart` and
  `paddingEnd`: two pseudo-elements read them, so the listbox holds options only.
  - **The row estimate** is a state that starts at 40 and is set in a layout effect to
    the measured height of the first `[role="option"]` (44 under a coarse pointer). Left
    at the default of 36 the scrollbar is 4 px a row short.
  - **The highlight is scrolled into view by the root.** `useCombobox()` makes
    `scroller`, a ref that holds `null` or a function of an index, and the root passes it
    to the part as a prop; the list hook fills it in an effect. The root's
    `onItemHighlighted` calls the caller's handler first, then
    `scroller.current?.(details.index)` when `details.reason` is `keyboard` and the index
    is 0 or more. The function: when the row is mounted and an edge of the list cuts it,
    set `scrollTop` so the row is whole, 6 px inside (the padding of the list); when it
    is not mounted, `collection.scrollToIndex(index)`, with the `'nearest'` of shared
    pull request 8. Nothing scrolls while the popup is closed: the function finds no
    list then.
  - `parts/combobox-list.tsx` starts with `'use client'`, is internal, and `client.tsx`
    imports it. `combobox.client.test.ts` counts the hook calls of the part as well as
    of `client.tsx`. This is the wiring of the prototype that was measured, except that
    the prototype, built before shared pull request 8, passed `'start'` for a row above
    the view.

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

- **Markup.** A `<span>` with `COMBOBOX_ROOT`, `FIELD_TEXT[size]` and the width
  (`w-full` with `fullWidth`, else `FIELD_OWN_WIDTH`). In it
  `Base.Root`, and `Base.Input` with `COMBOBOX_INPUT`, `FIELD_SIZE[size]` and then
  `COMBOBOX_INPUT_END`, in that order for `cn()`, plus `data-size`, the names,
  `maxLength`, `aria-describedby`, `aria-invalid` and `aria-busy` while loading. After the
  input a `<span aria-hidden>` with `COMBOBOX_ICON` holds the caret, or the spinner with
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
  `constants.ts`, `schema.ts` (`size`, `invalid`, `fullWidth`, `placement`,
  `visibleRows`, `virtualize`, `hasMore`, `loadMoreThreshold`, `status`, `maxLength`),
  `types.ts`, `index.tsx`, `meta.ts`. No `boundaries.ts`: its two bounds are the shared
  `COLLECTION_BOUNDARIES`, and the cap of its input is `TEXT_MAX_LENGTH`.
- **Tests.** Server render: the input shows the label of the default value and the hidden
  input its value; the input carries `maxlength="256"`, the caller's number wins, and
  `null` removes it; `loadMoreThreshold={9999}` reaches `useCollection` as 200. Dom:
  typing narrows by "contains"; Enter chooses; an empty list says the label; `loadMore`
  is not called while closed and is called once when the list is opened near its end;
  `status`. Browser, live, with `dummy/ten-thousand.tsx`: fewer than a hundred options in
  the DOM on open, while the keys move and after a wheel to the end (the line of
  `docs/PLAN.md` 20); the highlight wraps to a row that was never mounted and that row is
  in view; `window.scrollY` stays 0; the popup is as wide as the input and inside the
  viewport at the four edges; axe on the open popup. With `dummy/load-more.tsx`: one call
  per page. The reset cases of Switch: the input shows the label of the default again.
  Browser, live, with `e2e/fixtures/combobox-in-dialog.tsx`: the list is painted above
  the dialog; the first Escape closes the list and leaves the dialog open; what the next
  Escape does is under "For the reviewer", and the spec pins it.
- **Mutation.** An item loses its `index`, so the highlight cannot reach a row that is
  not mounted.
- **Not built:** `multiple` and chips, groups, a clear button and a trigger button (the
  caret is decoration: a click on the input opens it), the magnifier at the start (choice
  25), an error row with a retry, `Autocomplete`, async search helpers, the adaptive
  Combobox, a counter on the input, `selectedItem` (a value whose option is in no loaded
  page shows an empty input), a stale `loadMore` dropped by request id.
- **For the reviewer:** this is the riskiest of the ten. `loadMore`, `hasMore` and
  `status` were read and not run. `useCollection` asks for the next page as soon as the
  list mounts when it has no container yet: check it against a list longer than its box.
  Its `'nearest'` is fixed by shared pull request 8; without that fix every ArrowUp in the
  middle of the list jumps the row to the bottom edge. While it is open Base UI renders
  two hidden buttons named "Dismiss", in English, and the name cannot be replaced: it is
  recorded as a known gap of `R-5.11-1`. Escape on the closed input clears the value: say
  so in the README. `openOverlay` waits for focus inside the popup, which never comes
  here: wait with `atRest`. Keep `items` stable between renders, or the collection is
  rebuilt each time. Two options with one `value`: `useCollection` already warns in
  development and drops the second row. The 200 of `loadMoreThresholdMax` is this file's
  number, the default of `virtualizeAbove`. Inside the repo's Dialog a prototype did this
  (measured): the list is at z-index 60 over the dialog's 50; one Escape closes the list
  and the dialog stays; a second Escape, on the closed input that holds a value, clears
  the value and the dialog still stays (the input was empty and the form would send
  `framework=`); a third closes the dialog. So a person who presses Escape to leave the
  dialog loses the chosen value first. That is Base UI's: say so in the README.

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

0. **Gates.** One thing is Omar's, and it is asked before the fresh session starts, not
   during it: the answers to choices 1 to 4, each of which changes all ten controls.
   Inside the unit the session never waits for Omar. If it starts without the answers it
   builds the Built as column, as the handoff says of every choice that is his, and every
   pull request of the unit says in its first line: built on the defaults of `unit-4.md`,
   choices not answered yet. The seven Arabic strings of shared pull request 5 are in
   that item: the pull request copies them and lists them in its description for Omar to
   correct.
   `docs/CLOUD-PLAN.md` section 6 asks Switch's pull request to bring the recommendation
   on the state props and lets Omar choose: the recommendation is choice 2, Switch's pull
   request repeats it, and a different answer later is a rename in Switch and Checkbox.
   Whether Switch is reviewed before the other toggles copy it is choice 40.
1. **The shared pull requests**, on top of the Unit 3 stack. 1, 2, 3 and 9 first: Switch
   needs them. 4, 5 and 6 can be built beside Switch; 4 sits on 3, since both add to the
   end of `src/shared/classes.ts`. 7 and 8 can wait for the second half; 7 sits on 4.
   GitHub's checks do not run: `pnpm check` on each branch, and on `main` after each merge.
2. **The first half: Switch, Checkbox, RadioGroup, Textarea, SegmentedControl.** This is
   what the fresh session builds after Unit 3, in idle worktrees.
   - **Switch, alone.** It settles the names of the state props, the native button under
     a role, the target around a small box, the value that follows a form reset,
     `e2e/form.ts` and the first form test. Needs 1, 2, 3 and 9. The next three start
     once it is built, measured by its builder and green: they copy its folder.
   - **Then three at a time: Checkbox, RadioGroup and Textarea.** Checkbox needs 1, 2, 3
     and 9. RadioGroup needs 1, 2, 3, 6 and 9. Textarea needs 2, 4 and 5. Each has its own
     folder, its own spec, its own fixtures and its own mutation file: no two touch one
     file.
   - **Then SegmentedControl,** once RadioGroup is built: it copies its hook and its tab
     stop. Needs 1, 2, 4, 6 and 9.
   - Why these five: they need nothing from Dropdown or Command, no option contract and no
     collection. The four toggles share one target, one naming rule, one reset rule and
     one fix for the hidden input, so Switch pays for all of them. Textarea is the one
     control that is server HTML, and the first to use the field styles the five fields
     of the second half reuse.
   - Of the shared pull requests the first half needs 1, 2, 3, 4, 5, 6 and 9. The second
     half adds 7 and 8.
3. **The second half: Slider, NumberField, OTPField, Select, Combobox.**
   - **Three at a time: Slider, NumberField and OTPField.** Slider needs 2, 4, 5 and 9.
     NumberField needs 1, 2, 4, 5 and 9. OTPField needs 1, 4, 5 and 9.
   - **Then Select, alone.** Needs 1, 2, 4, 7 and 9, and Checkbox, RadioGroup, Switch,
     Slider and NumberField in place: its `phase-4-form` demo holds all six.
   - **Then Combobox, last and alone.** Needs 1, 2, 4, 7, 8 and 9, and Select in place. It
     is the one that renders a collection, and the riskiest.
4. **What that leaves of Phase 4** (`docs/PLAN.md` 19):

   | Clause | Where it is met |
   |---|---|
   | Input and Textarea in server Fields, posted with JavaScript off | not met: no Field, no Form (choice 1) |
   | The same form with `FormAction` and `FieldLive` | not met, for the same reason |
   | Six controls submit the right `FormData` after hydration | `select/dummy/phase-4-form.tsx`, on the live page |
   | The same six submit their defaults before it | the same demo, on the static page |
   | Numeric limits clamp | Slider, NumberField, `Textarea.rows` and `maxRows`, `OTPField.length`, `visibleRows`, `loadMoreThreshold` |
   | A Select with ten thousand options stays under the limit, with `aria-activedescendant` on rows that are not mounted | moved to Combobox: `combobox/dummy/ten-thousand.tsx` |
   | Every control is right in RTL: Slider direction, NumberField buttons, Select popup side | the `rtl` demo and the spec of each of the three |

## Choices for Omar

Every row has a default above, so nothing here blocks the build: gate 0 of the build
order says what the session does without an answer. Rows 1 to 4 are asked before it
starts. Row 2 is the recommendation `docs/CLOUD-PLAN.md` asks Switch to bring. Rows 36 to
40 came out of the three reviews of this file.

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
| 24 | The name of the OTP export | `OTPField`, with `meta.name` `OtpField` as the meta test forces; the generated Import block of its README then prints `OtpField`, which is not an export | `OtpField` everywhere, or a meta test and a README builder that allow an acronym |
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
| 36 | How the selected segment is told apart | the raised fill, the shadow, the heavier and darker text, as drawn | also a `--tc-line-strong` line around it, so the edge has 3 to 1 |
| 37 | A form reset, and a React form action | each of the nine client controls returns to its current default, on screen and in the form, through one shared hook that holds its value | left to Base UI: four of them show one value and send another after a reset, five ignore it, and the README says so |
| 38 | Six OTP cells on a 320 px phone | one row: the cells give up width, never height, down to 24 px (36 x 44 px measured) | the row always wraps: every cell stays 44 x 44 px, and six cells break 5 + 1 there |
| 39 | The longest OTPField | twelve cells, and a row of more than eight items wraps | eight cells at most and no wrap |
| 40 | A review of Switch before the other toggles copy it | none inside the session: Switch alone, then the next three once its builder's measurements and its check are green; the independent review comes with the whole half, as the handoff says | three independent reviewers on Switch first, as Dialog had, or a stop until Omar has read its pull request, as `docs/CLOUD-PLAN.md` section 6 words it |

## Where this file departs from docs/PLAN.md

The lead records these as one `docs/DECISIONS.md` entry in a docs branch, with what the
builders report as departures, as for Unit 3: gate 0 of the build order says what happens
while a choice is open. No component branch edits that file.

- Field, Label and Form (18.4, Phase 4) are not built with the form controls. The two
  Phase 4 clauses about server Fields, `FormAction` and `FieldLive` stay open.
- Switch and Checkbox keep `checked`, `defaultChecked` and `onCheckedChange` (5.7 and
  `R-5.7-1` say `value` and `onValueChange`).
- A Select is not windowed (8.5) and does not take `CollectionProps`. The Phase 4 clause
  about ten thousand options is met by Combobox.
- Options are plain `{ value, label, disabled }` data. Neither Select nor Combobox takes
  `getKey`, which 8.5 makes part of every collection.
- Three cases 8.5 asks every collection to handle are not built: `selectedItem` (a value
  whose option is in no loaded page), a stale `loadMore` dropped by request id, and the
  error row with a retry. A Select does not warn for two options with one `value`; a
  Combobox does, through `useCollection`.
- The shared target spec no longer measures an input that is hidden from assistive
  technology and out of the tab order, or an `<input type="hidden">` (5.6, `R-5.6-2`).
- At 320 px with a coarse pointer the cells of a six-cell OTPField are 36 px wide and
  44 px tall, 33 px with a separator (`R-5.6-2` asks for 44 both ways): six cells of
  44 px do not fit there. Seven and eight cells are under 44 px wide at 390 px as well
  (39.7 and 33.8 px). The other way is to wrap the row (choice 38).
- Five controls do not spread the rest onto their outermost element (`R-5.7-3`): a
  `RadioGroupItem` gives `className` and `style` to its label and the rest to the radio
  button; a Select, a Combobox, a Textarea with the holder and a SegmentedControlRoot
  give all of them to the element inside the box that owns the width.
- Select and Combobox clamp with the shared `COLLECTION_BOUNDARIES` and have no
  `boundaries.ts` of their own (`R-8.3-6` gives every component that enforces a bound
  one).
- A Combobox input has the default cap of a search field and no counter (`R-5.7-8`).
- `docs/CLOUD-PLAN.md` section 6 has Omar choose the state props on Switch's pull
  request. Here the recommendation is choice 2, asked before the session starts.
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
  option contract, the toggle and field class constants, the server tab stop,
  `src/shared/use-form-value.ts`, two tokens, seven label keys, `e2e/form.ts` and
  `scripts/lib/targets.ts`.

Outside Unit 4, noticed while reading: `docs/PLAN.md` 8.5 says `use-collection.ts` wraps
TanStack Virtual, and it is hand-written with no such peer; its `'nearest'` always scrolls
a row to the bottom edge; `@theme inline` emits no `--spacing-*` variable, so an arbitrary
value that reads one resolves to nothing; the Accessibility page of the design gives Field
an element child where every card gives it a function; `docs/STATUS.md` is one unit behind.
