# Figma facts for Unit 3

The overlays and the navigation set: Dialog, Drawer, Popover, Toast, Dropdown, Command,
Tabs, Accordion, Navbar and Sidebar. Then, as a short second part, what Unit 2 left out:
Rating, and the client halves of Tag, Avatar and Banner. Read `docs/figma/unit-1.md` first:
its section "How to use this file" applies here unchanged, except that no component branch
edits `scripts/mutations/index.ts` any more. Its "Rules for all ten" were written for server
components; "Rules for all fourteen" below replaces them.

**Read this instead of Figma.** File `BxRSdAVOhk9Hj3Tkq4tjcy`, read on 2026-10-09: the
fourteen docs previewers in `Docs site - LTR` (133:148), their drawings on the Components
page, `Page: Provider` (193:2659) and `Page: Accessibility` (183:1877). Text and layer
facts only, no screenshot. One reader; a second read of four frames (Dialog, Dropdown menu,
Toast, Drawer) matched. Where a fact looks wrong, build from the Build this block and say
so in the pull request.

Each component has the two parts of the earlier files: the facts in a fenced block, and
**Build this**, which wins where the two disagree.

## What was checked, and what was not

Checked on 2026-10-09, in the worktree of this file:

- **Base UI.** Every Build this block names its part from the installed types under
  `node_modules/@base-ui/react/` (1.8.0), not from memory. `drawer` exists in 1.8.0. No
  `command` part exists: the palette is `dialog` plus `autocomplete` with its `inline` prop.
- **Classes.** Every class named below was read back out of this file and compiled with the
  repo's own entry (`compileCss` from `scripts/lib/harness.js`): 211 distinct classes, none
  missing. All 211 pass the custom lint rules in a file named `classes.ts`. Outside one,
  the lint refuses `rounded-full`, `h-1` and the four `focus-visible:` classes of
  `FOCUS_RING_INSET`, so keep every class string in a `classes.ts`.
- **A browser can open an overlay with no new dependency.** A scratch script started a Vite
  server through `createViteServer` from `vitest/node`, server-rendered
  `tooltip/dummy/basic.tsx`, hydrated it in Chromium and hovered the trigger: the popup
  opened, with no console error and no recoverable hydration error. Nothing was written to
  the repo. This is what shared pull request 2 builds on.
- **The isolation root does nothing today.** `TopClassProvider` renders
  `<div class="isolate contents">`. In Chromium an element with `isolation: isolate` and
  `display: contents` creates no stacking context: a page element at `z-index: 9999` painted
  above a fixed layer at `z-index: 50`. Without `display: contents` it stayed below. Shared
  pull request 3 fixes it.
- **A second pass, the same day.** Read again in the installed packages: the fifteen
  `drawer` parts and `swipeDirection` on `Drawer.Root`; `inline` on `Autocomplete.Root`;
  `Menu.LinkItem`; `Dialog.Viewport`; `createToastManager` in a file with no client
  directive; `createViteServer` in the types of `vitest/node` 5.0.3; every token named
  below in `src/tokens.css`. Forty-three of the unusual classes compiled again. `Menu` has
  no `virtualized` prop; `Combobox` has one. That pass changed the Drawer's x and safe
  area, the Navbar on a narrow screen, the fourth kind of menu item, and choices 26 to 28.

Not checked. Say so in the pull request when one of these turns out wrong:

- Nothing here was rendered. The class lists compile one by one; no layout, no cascade
  order between two classes on one element, and no dark or Ocean look was seen.
- Base UI behaviour was read in the types, and in a few places in the built JavaScript,
  never run: the Drawer swipe against a scrolling body, `Autocomplete` inline inside a
  Dialog, a windowed list under it, what `Tabs.Panel keepMounted` and `hiddenUntilFound`
  put in the server HTML, and a Server Action called from a menu item.
- The Vite harness ran once, for one demo, on Windows. Linux, every demo and the
  Playwright `webServer` wiring are the work of the pull request.
- Unit 2 is not merged. Its server halves were read from the local branches `feat/tag`,
  `feat/avatar`, `feat/banner` and `feat/shared-unit-2-labels`, which can still change.
- Next.js itself: that a client part a server page never renders is never downloaded.
- The Arabic strings. This file is ASCII, so it lists the English ones only.

## What Units 1 and 2 taught, and what changes

- **Tooltip is the client template.** One `client.tsx` holding the parts, an `index.tsx`
  that only re-exports, types derived at the seam, class strings in `classes.ts`, and
  fifteen test files. Copy its shape, not its size.
- **The static harness cannot open anything.** It renders with `renderToStaticMarkup` and
  runs no script. Tooltip left "stays inside the viewport" under Deferred. Unit 3 cannot:
  `docs/PLAN.md` section 19, Phase 5, accepts the overlays only on browser tests. Shared
  pull request 2 comes first.
- **A popup's classes never reach the static stylesheet.** The harness compiles the classes
  it finds in the rendered markup, and a closed popup renders none. Every component here
  ships a `<slug>.css.test.ts` like Tooltip's, and the live harness compiles from source.
- **One mutation file per component, found by itself.** On 2026-10-09 `feat/tag` still
  appended to `scripts/mutations/index.ts`. Shared pull request 1 ends that.
- **A helper two components need goes in `src/shared/` first.** Tooltip unwraps and merges
  the `render` element of its trigger by hand. Four triggers here need the same code.
- **A link in a demo is a `Button` with `render`**, a title inside a demo card is an `<h2>`,
  and every interactive box in a demo is measured at 24 px and at 44 px under a coarse
  pointer. The selector includes `input`, so a visually hidden radio fails (see Rating).
- **`meta.name` is the PascalCase of the folder name.** `src/shared/meta.test.ts` asserts
  it. That is why two names below are `Dropdown` and `Command`.
- **The lint reads one file at a time.** `root-part-is-named-root` refuses `Tag` beside
  `TagRemove` and `Accordion` beside `AccordionRoot` in the same file. It accepts
  `DropdownMenu` beside `DropdownRoot`, and it does not follow a re-export.
- **Commit as Omar**, one conventional-commit line, no trailer, no attribution, no comment
  on a pull request. GitHub's checks may not run: paste the real tail of `pnpm check` and
  `pnpm test:mutation`.

## Rules for all fourteen

- **Client code lives in `client.tsx`.** `index.tsx` never has `'use client'`. If
  `client.tsx` would pass 200 lines, move parts into `parts/*.tsx`, each starting with
  `'use client'`, and keep `client.tsx` re-exporting them: the zod guard and
  `meta.test.ts` only know a file named `client.tsx`.
- **`client.tsx` is markup.** No `useState`, `useEffect`, `useRef`, `useMemo` or
  `useCallback` (`R-5.12-1`). A part that needs state, a label or the direction calls one
  `use<Name>...()` from `hook.ts`, and `useLabels()`, `useDirection()` and
  `useControllableState()` are called there. A component whose state is all Base UI's has
  no `hook.ts`.
- **Types are derived at the seam** (`R-5.7-5`): `Omit<Base.X.Props, 'className'>` plus a
  string `className`, as `tooltip/types.ts` does. Every Base UI prop passes through
  untouched. A Build this block lists only the props we add or change.
- **Class strings live in `<slug>/classes.ts`**, one constant per element, built from the
  shared constants. A part merges with `cn()` and the caller's `className` comes last.
  `className`, `style`, `ref` and the rest props reach the element each part renders. No
  `variants.ts` and no `skeleton.tsx`: a lookup is a plain object, as in Tooltip.
- **Shared pull requests.** All ten need 1, 2 and 4. A block names the others it needs.
- **`meta.ts`.** `status: 'beta'`, `baseUiRange: '1.8.0'` wherever `baseUi` is set.
  `rendering: 'client'`, category `overlays`: Dialog, Drawer, Popover, Toast, Dropdown
  (tier 1), Command (tier 3). `rendering: 'split'`, category
  `navigation-and-disclosure`: Tabs, Accordion (tier 1), Navbar, Sidebar (tier 2).
- **Placement.** One `placement` prop through `toSideAlign` (`R-5.3-4`), with
  `collisionPadding` and `sideOffset` from `POPUP_BOUNDS`. Never a physical side, never a
  `left-*` or `right-*` class. No part here draws an arrow, so Base UI's own collision
  rule stays.
- **Z-index** comes from the tokens: `z-(--tc-z-sticky)`, `-drawer`, `-dialog`, `-popup`,
  `-toast` (10, 40, 50, 60, 70 in `src/tokens.css`).
- **State attributes are Base UI's.** Style on `data-open`, `data-highlighted`,
  `data-active`, `data-panel-open`, `data-starting-style` and so on, and never re-emit one.
  What we add is a design value: `data-size`, `data-variant`, `data-tone`,
  `data-placement`.
- **Scrolling (`R-10.5-1`).** The overlay scrolls inside itself, in a container that
  carries `SCROLL_AREA`. Base UI locks the page behind a modal. `html` already keeps its
  scrollbar gutter. Nothing sets `overflow: hidden` on `body`.
- **Labels.** A client part reads `useLabels()`. A server part takes `labels?: Labels` and
  falls back to `en`. No English in markup: the lint reads `aria-label` too.
- **Imports.** No Unit 3 component imports another. `#components/svg`, a per-icon import
  from `#icons/data/`, and `buttonVariants` from `#components/button` are allowed, and
  anything in `dummy/`.
- **Demos.** One per file. A trigger is a `Button`. `rtl.tsx` wraps itself in
  `TopClassProvider` with `direction="rtl"`, as Tooltip's does. Each overlay has one demo
  with sixty rows or a body taller than the screen.
- **Tests.** The Tooltip set, plus one `e2e/<slug>.spec.ts` on the live harness: a file of
  its own, so two branches never edit the same spec. happy-dom has no layout, so the
  viewport, scrolling and focus order are browser tests, and axe runs there on the open
  overlay in three modes and both directions.
- **Mutation.** `scripts/mutations/<slug>.ts`. A mutation must be caught by `vitest run`:
  the runner does not start Playwright.
- **Deferred**, in every pull request: the four lines of `docs/CLOUD-PLAN.md` section 10,
  and for Drawer and Toast the check on a real iPhone that Phase 5 asks Omar to record.

## Shared pull requests

Eight, each on its own, opened first, and one carried over: `fix/readme-part-family` of
`unit-2.md` was not built in Unit 2. Build it here, before Dialog: every part family needs
the README to print flat names. None of the nine opens before Unit 2 is merged.

1. **`feat/shared-mutation-files`.** Every Unit 2 branch still appends to
   `scripts/mutations/index.ts`, and this one rewrites it, so it waits for all of them.
   One file per area in `scripts/mutations/`
   (`shared.ts`, `button.ts`, one per component), each exporting its rows. `index.ts` reads
   the folder (`readdirSync`, sorted, then `await import`) and exports `MUTATIONS`, so a
   component branch adds a file and never edits `index.ts`. A test proves every file is
   collected and no label repeats. If Unit 2 already split the file, only the discovery
   step is left.
2. **`feat/shared-live-harness`.** The gate for the whole unit.
   - `scripts/serve-harness.ts` and `pnpm harness:serve`: a Vite server from
     `createViteServer` in `vitest/node`, on a fixed port with `strictPort`. `vitest` is
     already a dev dependency, so this adds none. Record it in the pull request
     (`R-0-1`): `vitest/node` exporting the Vite server is an implementation detail of
     Vitest 5.
   - One route per demo, mode and direction. The server renders the demo with
     `renderToString` from Node's own `react-dom/server` (loading it through Vite fails
     with "require is not defined"), wraps it in `TopClassProvider` with the direction and
     locale of the page, and an inline module script calls `hydrateRoot` on the same tree
     and sets a flag the tests wait for. A recoverable hydration error fails the page.
   - The stylesheet is compiled from the source text of `src/components` and `src/shared`
     (every token of every string), not from the markup.
   - Query parameters the specs need: one that pins the demo to an edge of the viewport
     (top, bottom, start, end), and one that makes the page taller than the screen.
   - `playwright.config.ts` gains a `webServer`. The static pages and their four specs do
     not change.
   - Proof: `e2e/tooltip.spec.ts` closes Tooltip's two deferred lines (inside the viewport
     at all four edges, and the arrow on the edge that faces the trigger), in both
     directions, and one spec hydrates every demo once and fails on a console error.
3. **`fix/shared-isolation-root`**, after 2. Remove `contents` from the wrapper in
   `src/shared/provider/provider.tsx`, so it is a box, as `docs/PLAN.md` 10.2 draws it.
   The browser test: a page element at `z-index: 9999`, an open tooltip, and
   `elementFromPoint` on the popup returns the popup. A dom test asserts the wrapper has
   no `contents` class, and the mutation puts it back. Say in the pull request that the
   app now has one more box between `body` and its content.
4. **`feat/shared-overlay-styles`.** In `src/shared/classes.ts`, each with a test in
   `classes.test.ts`:

   ```ts
   export const SCRIM = 'fixed inset-0 bg-overlay'
   export const FADE_MOTION = 'transition-opacity duration-(--tc-duration) ease-out data-starting-style:opacity-0 data-ending-style:opacity-0'
   export const POPUP_MOTION = 'origin-(--transform-origin) transition-[opacity,scale] duration-(--tc-duration) ease-out data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0'
   export const SLIDE_MOTION = 'transition-[translate,opacity] duration-(--tc-duration-slow) ease-out data-swiping:transition-none'
   export const OVERLAY_SURFACE = `rounded-box bg-surface-raised text-body ${BORDER} shadow-lg`
   export const ROW = 'flex min-h-(--tc-row-height) w-full items-center gap-2 rounded-control px-3 text-start text-sm outline-none'
   export const ROW_HIGHLIGHT = 'data-highlighted:bg-primary-soft data-highlighted:text-primary-on-soft forced-colors:data-highlighted:forced-color-adjust-none forced-colors:data-highlighted:bg-[Highlight] forced-colors:data-highlighted:text-[HighlightText]'
   export const LIST_CAP = 'max-h-[min(var(--available-height,100dvh),calc(var(--tc-list-rows)*var(--tc-row-height)))]'
   export const SCROLL_X = 'overflow-x-auto overscroll-x-contain'
   export const STICKY_TOP = 'sticky top-0 z-(--tc-z-sticky)'
   export const ICON_BUTTON = `inline-flex shrink-0 items-center justify-center rounded-control ${TOUCH_TARGET} ${FOCUS_RING} ${TRANSITION}`
   export const FOCUS_RING_INSET = 'outline-none focus-visible:outline-solid focus-visible:outline-(length:--tc-ring-width) focus-visible:-outline-offset-(length:--tc-ring-width) focus-visible:outline-ring'
   export const FOCUS_RING_WITHIN = 'outline-none has-focus-visible:outline-solid has-focus-visible:outline-(length:--tc-ring-width) has-focus-visible:outline-offset-(length:--tc-ring-offset) has-focus-visible:outline-ring'
   ```

   Every reset here is `outline-none`, never `outline-hidden`: under forced colours
   Tailwind's `outline-hidden` draws a 2 px ring on the element at rest, which the review
   of Pagination measured on every link. `fix/shared-forced-colors` changes `FOCUS_RING`
   on `main` the same way and must be merged first. Forced colours also erase a fill, so
   a state told by its fill alone (a highlighted row, the active tab of the enclosed look,
   the current link of the Sidebar) takes the system pair `Highlight` and
   `HighlightText` with `forced-color-adjust: none`, as `ROW_HIGHLIGHT` does. Measure it in
   the browser with `forcedColors: 'active'`.
   `LIST_CAP` counts rows only, not the padding of the popup or the gaps between rows, so
   the last row it shows is cut short. That is wanted: a cut row says there is more.
   `FOCUS_RING_INSET` is for a control that sits flush against an edge that clips, such as
   an accordion trigger or a tab in a scrolling list. `FOCUS_RING_WITHIN` is for a label
   that wraps a hidden input. And one rule in `src/tokens.css`, inside the existing
   `@layer base` block for `html`:
   `scroll-padding-block: var(--tc-sticky-top) var(--tc-sticky-bottom);`. Both tokens exist
   and nothing reads them yet (`R-10.5-3`). No new token: the z-index scale, the overlay
   inset, the safe-area tokens and the three durations are all there, and Base UI holds the
   scroll lock.
5. **`feat/shared-unit-3-labels`.** In `en.ts`, `ar.ts`, `types.ts`, and in
   `withOverrides()` of `get-labels.ts`, which names every group by hand:
   `drawer.close` ("Close this panel"), `toast.region` ("Notifications"), `toast.close`
   ("Dismiss this notification"), `command.label` ("Command palette"),
   `command.placeholder` ("Type a command or search"), `navbar.label` ("Main"),
   `sidebar.label` ("Sidebar"), `sidebar.collapse` ("Collapse the sidebar"),
   `sidebar.expand` ("Expand the sidebar"), `tag.remove` ("Remove"), `banner.dismiss`
   ("Dismiss") and `rating.stars`, a count label ("1 star", "3 stars") with the six Arabic
   forms. `dialog.close` and `common.close` exist and are used as they are. The `rating`
   group itself arrives with Unit 2's label pull request, which adds `rating.value`.
6. **`feat/shared-render-trigger`.** Lift the lines of `TooltipTrigger` that unwrap a
   `render` element handed over by a Server Component and merge its `className` with
   `cn()` into `src/shared/render-trigger.ts`, with Tooltip's own tests proving nothing
   changed. Dialog, Drawer, Popover and Dropdown call it.
7. **`feat/shared-menu-contract`.** `src/shared/contracts/menu.ts`, types only, with a type
   test: `MenuItem` and `MenuContract` as `docs/PLAN.md` 11.3 writes them, with three
   changes. `icon` is a `ReactNode` (`<Icon name>` is async). An item is a union of four:
   `href` (a plain anchor), `render` (a link element that carries its own `href`, such as
   `<Link href="/profile" />` from `next/link`), `action` (a Server Action) or `onSelect`
   (client only). `render` is not in PLAN 11.3: a plain anchor loads the whole page in
   Next.js, and an element is the one link form that crosses from a server page. `size`
   is left out until a menu has more than one row height.
8. **`feat/shared-toast-provider`.** The mechanics, as `feat/shared-tooltip-provider` was
   for Tooltip:
   - `src/shared/contracts/toast.ts`: `TOAST_PLACEMENTS` (`top-start`, `top`, `top-end`,
     `bottom-start`, `bottom`, `bottom-end`), `TOAST_DEFAULTS` (`placement: 'bottom-end'`,
     `limit: 3`, `duration: 5000`, `tone: 'neutral'`) and `TOAST_BOUNDARIES` (`limitMin: 1`,
     `limitMax: 10`, `durationMin: 0`, `durationMax: 600000`).
   - `src/shared/toast/manager.ts`: `export const toastManager =
     Toast.createToastManager()`. The module has no `'use client'` in 1.8.0.
   - `TopClassProvider` gains one optional prop, `toast?: { placement, limit, duration }`,
     clamps it, exposes it as `useToastSettings()`, and wraps its children in
     `<Toast.Provider toastManager limit timeout>` at the outermost provider only, the way
     it treats the tooltip provider.
   - The mutation that removes the tooltip provider anchors on the exact line this pull
     request rewrites. Update its `from`, or `pnpm test:mutation` stops on a lost anchor.
   - The dom test uses Base UI's parts directly, since the component does not exist yet.

**No icon pull request.** `raw/star-fill.svg` exists, and so does `icon/star-fill` on the
Icons page. `star-half` is in neither, and nothing in the file draws a half star. Rating
clips a filled star instead (see Rating), so `feat/shared-icons-unit-2` of `unit-2.md` is
not needed. Every other icon these drawings use is in `src/icons/data`: `x`, `check`,
`caret-down`, `caret-right`, `list`, `sidebar-simple`, `magnifying-glass`, `file-text`,
`dots-three`, `check-circle`, `warning-circle`, `warning`, `info`, `spinner`.

## Dialog

```text
Where: Components page, FRAME "Dialog" 74:356 (not a component set). Docs card "Previewer: Dialog" 138:1814.
Frame text (74:358): "Header and footer stay put, the body scrolls, and the page behind is locked and never scrolls. The scrim is base/overlay at 45%."
Drawing: a 520 x 300 mock screen (radius 12, clipped): "page behind" fill -> base/page with six grey bars, a "scrim" rectangle fill -> base/overlay at paint opacity 0.5 and layer opacity 0.5, and a centered panel.
Panel: 400 wide, hugs its height (193), vertical, gap 0, radius 12 raw, fill -> base/surface-raised, stroke -> base/line 1 inside, no shadow.
- header row: gap 12, padding 16 / 20, title "Delete this project?" Inter Semi Bold 16 -> base/body, then icon/x 14 -> base/muted
- a 1 px line -> base/line
- body: padding 20, "This removes the project and every file in it. This cannot be undone." Inter Regular 14 -> base/muted
- a 1 px line -> base/line
- footer row: gap 8, padding 16 / 20, aligned to the end: two "Button sm" frames (height -> Size control/sm, radius -> Knobs radius/control), one stroked base/line-strong, one filled danger/solid
Caption: "AlertDialog, destructive action".
Docs card: chip "client - 2.1 KB". Head: "Modal dialog whose body scrolls between a sticky header and footer, with no layout shift."
Playground: size (md), placement (center), toggles dismissible, modal, scrollBody, all on (138:1885, 138:1890, 138:1895).
Stage (138:1846): the same drawing, panel 380 wide, radius -> Knobs radius/box, shadow 0 8 20 black at 0.45, header padding 14 / 18, body padding 18, buttons "Cancel" and "Delete" 29 tall raw. Scrim -> base/overlay at 0.7 with layer opacity 0.62.
States (5): closed (a Button "Open"), open, alert, scrolled, focus trapped (a 2 px -> base/ring rectangle 4 px outside the panel).
Code (150:1031), captioned "DialogBody is the scroll container: the header and footer stay put while it scrolls.":
  import { DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger } from 'topclassui/dialog'
  <DialogRoot><DialogTrigger render={<Button />}>Publish</DialogTrigger><DialogPopup render={<form action={publishSite} />}><DialogHeader><DialogTitle>Publish changes</DialogTitle><DialogDescription>Your changes go live right away.</DialogDescription></DialogHeader><DialogBody><Text>11 files changed since the last publish.</Text></DialogBody><DialogFooter><DialogClose render={<Button variant="outline" />}>Cancel</DialogClose><Button type="submit">Publish</Button></DialogFooter></DialogPopup></DialogRoot>
Note: "The popup renders the form, so a Server Action submit ships no client handler."
Install row: "npx topclassui add dialog", then "import { Dialog } from '@/topclassui/components/dialog'" (the stale side, as for Tooltip).
Surprising:
- The frame says the scrim is 45%. The layers are 0.5 x 0.5 on the Components page and 0.7 x 0.62 in the card. src/tokens.css has --tc-overlay at 0.5 in Light and 0.7 in Dark.
- The only full drawing is captioned AlertDialog, and "alert" is a state of the Dialog card. No AlertDialog card exists among the 46.
- An x is drawn in the header. The code sample has none, and en.ts already has dialog.close.
- The radius is raw 12 on the Components page and bound to radius/box in the card. The shadow exists only in the card, raw. The file has no effect style and the code has no shadow token.
- "scrolled" is the same drawing as "open". scrollBody and placement have one value each.
```

**Build this.** Client. Built first and alone: it is the template for every modal here.
Needs shared pull request 6. Base UI `dialog` (`baseUi: 'dialog'`): `Root`, `Trigger`,
`Portal`, `Backdrop`, `Viewport`, `Popup`, `Title`, `Description`, `Close`.

- **Parts**, exported flat from `client.tsx`: `DialogRoot`, `DialogTrigger`, `DialogPopup`,
  `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogBody`, `DialogFooter`,
  `DialogClose`. `DialogRoot` renders no element.
- **What Base UI gives** (from `DialogRoot.d.ts`): `open`, `defaultOpen`, `onOpenChange`,
  `modal` (default `true`: focus is trapped, the page scroll is locked, outside pointer
  events are off), `disablePointerDismissal` (default `false`), `actionsRef`, `handle`. The
  popup takes `initialFocus` and `finalFocus`; focus returns to the trigger by default. It
  sets `data-open`, `data-closed`, `data-starting-style`, `data-ending-style`,
  `data-nested` and `data-nested-dialog-open`, and names the popup from `DialogTitle` and
  `DialogDescription`. `Dialog.Title` is an `<h2>`.
- **`DialogTrigger`.** Base UI's Trigger with `render`, through
  `#shared/render-trigger.js`. No class of its own. It sets `data-popup-open`.
- **`DialogPopup`** renders Portal, Backdrop, Viewport and Popup. `size`: the six `SIZES`,
  default `md`, as `data-size`. `render` passes to Base UI, so `render={<form />}` works.
  - Backdrop: `SCRIM z-(--tc-z-dialog)` and `FADE_MOTION`.
  - Viewport: `fixed inset-0 z-(--tc-z-dialog) grid place-items-center
    p-(--tc-overlay-inset)`.
  - Popup: `flex max-h-[calc(100dvh-2*var(--tc-overlay-inset))] w-full flex-col
    overflow-hidden`, `OVERLAY_SURFACE`, `POPUP_MOTION`, `FOCUS_RING`, and the width of the
    size from `dialog/classes.ts`: `max-w-80`, `max-w-90`, `max-w-100`, `max-w-128`,
    `max-w-160` (320, 360, 400, 512, 640 px), `custom` empty.
- **`DialogHeader`.** A `<div>`: `flex shrink-0 items-start gap-3
  border-b-(length:--tc-line-width) border-line px-5 py-4`. Its children sit in a
  `min-w-0 flex-1` column, then a `DialogClose` with no children. `closeButton`: default
  `true`.
- **`DialogTitle`**: `text-base font-semibold text-body`. **`DialogDescription`**:
  `text-sm text-muted`.
- **`DialogBody`.** The scroll container: `min-h-0 flex-1 px-5 py-5 text-sm text-muted`
  and `SCROLL_AREA`. The header and footer do not scroll because they are flex items that
  do not shrink; no `position: sticky` is needed.
- **`DialogFooter`.** `flex shrink-0 flex-wrap items-center justify-end gap-2
  border-t-(length:--tc-line-width) border-line px-5 py-4`.
- **`DialogClose`.** Base UI's Close. With `render` or children it adds no class. With
  neither it is the x: `ICON_BUTTON text-muted tone-neutral` and `HOVER.ghost`, holding
  `<Svg icon={x} />`, named by `labels.dialog.close`.
- **Keyboard and ARIA**, all Base UI's: `role="dialog"`, Tab stays inside, Escape closes,
  an outside press closes unless `disablePointerDismissal`.
- **Files.** `client.tsx`, `hook.ts` (the close label), `classes.ts`, `constants.ts`,
  `schema.ts` (`size`), `types.ts`, `index.tsx`, `meta.ts`. No `boundaries.ts`.
- **Browser tests** (`e2e/dialog.spec.ts`): focus moves in and returns to the trigger on
  Escape; a wheel over the open dialog leaves `window.scrollY` alone; the trigger does not
  move sideways when the dialog opens (no layout shift); in the long-body demo the body
  scrolls and the header and footer keep their boxes; the popup is inside the viewport at
  320 x 480; in RTL the x is at the left; axe on the open dialog.
- **Mutation.** `DialogBody` loses `SCROLL_AREA`.
- **Not built:** AlertDialog (its own component on Base UI `alert-dialog`, in no unit), a
  `dismissible` prop (pass `disablePointerDismissal`), `placement`, `scrollBody`, a style
  for a nested dialog.
- **For the reviewer:** the first focus lands on the x, the first tabbable element; a form
  dialog passes `initialFocus`. Only `md` is drawn (400 px); the other four widths are a
  choice. `shadow-lg` is Tailwind's and is the same in every mode.

## Drawer

```text
Where: FRAME "Drawer" 79:289. Docs card 138:1976.
Frame text: "A side sheet on desktop and a bottom sheet on a phone. The grabber is the swipe area, and the body scrolls with overscroll-behavior contain, so pulling past the end never scrolls the page behind."
Side sheet: a 380 x 260 mock screen with the scrim; the sheet is 240 x 260 at the inline end, fill -> base/surface-raised, no stroke, no radius, no shadow.
- header row: gap 8, padding 14 / 16, "Filters" Inter Semi Bold 16 -> base/body, icon/x 14 -> base/muted
- a 1 px line -> base/line
- body: padding 16, gap 10, rows of Inter Regular 14 -> base/body ("Status", "Owner", "Updated")
Bottom sheet: a 300 x 260 mock screen; the sheet is 300 x 169 at the bottom, same fill.
- grabber row: padding 10 / 0 / 4 / 0, centered, a 36 x 4 bar, radius 2, fill -> base/line-strong
- header "Choose a country", then body rows "Jordan", "Egypt", "Morocco"
Captions: "side sheet", "bottom sheet with grabber".
Docs card: chip "client - 2.8 KB". Head: "Dialog that slides from a logical edge, so it mirrors in RTL without a code change."
Playground: side (inline-end), size (md), toggles dismissible on, snapPoints off, swipeToClose on.
States (5): closed, side sheet, bottom sheet, dragging (the sheet at opacity 0.75), focus trapped (a 2 px ring around the sheet).
Code: import { DrawerBody, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger } from 'topclassui/drawer'
  <DrawerRoot><DrawerTrigger render={<Button variant="ghost" />}>Menu</DrawerTrigger><DrawerPopup placement="start"><DrawerTitle>Browse</DrawerTitle><DrawerBody><Link render={<NextLink href="/docs" />}>Documentation</Link> ...</DrawerBody></DrawerPopup></DrawerRoot>
Note: "placement is logical: start opens from the left in LTR and from the right in RTL."
Page: Accessibility (183:2060): "A Drawer and a Toast always render a close button."
Surprising:
- The playground calls the prop side with the value inline-end. The sample calls it placement with the value start.
- The sample puts placement on DrawerPopup. Base UI's swipeDirection is a prop of Drawer.Root.
- "The grabber is the swipe area". In Base UI 1.8.0 Drawer.SwipeArea is "an invisible area that listens for swipe gestures to open the drawer"; the swipe that closes is handled by Drawer.Viewport over the whole popup.
- The sample has no close button and no header, but an x is drawn in both sheets.
- A side sheet is 240 of a 380 px mock screen: a miniature, not a width.
```

**Build this.** Client. After Dialog. Needs shared pull requests 5 and 6. Base UI `drawer`
(`baseUi: 'drawer'`), which shares Dialog's store: `Root`, `Trigger`, `Portal`, `Backdrop`,
`Viewport`, `Popup`, `Content`, `Title`, `Description`, `Close`,
`VirtualKeyboardProvider`.

- **Parts:** `DrawerRoot`, `DrawerTrigger`, `DrawerPopup`, `DrawerHeader`, `DrawerTitle`,
  `DrawerDescription`, `DrawerBody`, `DrawerFooter`, `DrawerClose`.
- **`DrawerRoot`.** `placement`: `'start' | 'end' | 'top' | 'bottom'`
  (`DRAWER_PLACEMENTS`), default `end`. `size`: the six `SIZES`, default `md`. Both reach
  the popup through a context made in `hook.ts`. The Root owns them because it owns the
  gesture: it passes `swipeDirection`, which is physical in Base UI (`'up' | 'down' |
  'left' | 'right'`, default `'down'`). `toSwipeDirection(placement, direction)` in
  `drawer/lib.ts`: bottom is `down`, top is `up`, end is `right` in LTR and `left` in RTL,
  start is the reverse. The direction comes from `useDirection()`, never from the DOM.
- **`DrawerPopup`** renders Portal, Backdrop, Viewport and Popup, with `data-placement`.
  - Backdrop: `SCRIM z-(--tc-z-drawer)` and `FADE_MOTION`.
  - Viewport: `fixed inset-0 z-(--tc-z-drawer) flex`, and by placement `justify-end`,
    `justify-start`, `items-end` or `items-start`.
  - Popup: `relative flex flex-col bg-surface-raised text-body shadow-lg`, `FOCUS_RING`,
    `SLIDE_MOTION`, `translate-x-[var(--drawer-swipe-movement-x,0px)]
    translate-y-[var(--drawer-swipe-movement-y,0px)]` so it follows the finger, and by
    placement, from `drawer/classes.ts`:
    - `end`: `h-dvh w-full border-s-(length:--tc-line-width) border-line pt-safe pb-safe
      pe-safe`, and `data-starting-style:translate-x-[calc(100%*var(--tc-dir))]` with the
      same value on `data-ending-style:`.
    - `start`: the mirror: `border-e-...`, `ps-safe`, and
      `translate-x-[calc(-100%*var(--tc-dir))]`.
    - `bottom`: `max-h-[90dvh] w-full border-t-(length:--tc-line-width) border-line
      pb-safe ps-safe pe-safe`, and `translate-y-full` on both attributes.
    - `top`: `border-b-...`, `pt-safe ps-safe pe-safe`, and `-translate-y-full`.
  - Width, for `start` and `end` only: `max-w-64`, `max-w-72`, `max-w-80`, `max-w-96`,
    `max-w-120` (256 to 480 px), `custom` empty.
  - A bottom sheet starts with the grabber, `aria-hidden`: `mx-auto mt-2.5 mb-1 h-1 w-9
    rounded-full bg-line-strong`, in `classes.ts`. It is decoration: the whole sheet takes
    the swipe. A bottom sheet also wraps its children in `Base.VirtualKeyboardProvider`.
  - The popup always ends with the x: `DrawerClose` with no children, `absolute`, named by
    `labels.drawer.close`. An absolute box ignores the padding of its parent, so its
    offsets add the safe area themselves, by placement: `top-3` for `bottom` and
    `top-[calc(0.75rem+var(--tc-safe-top))]` for the other three; `inset-e-3` for `start`
    and `inset-e-[calc(0.75rem+var(--tc-safe-end))]` for the other three. No prop removes
    it: a swipe is a drag, and WCAG 2.5.7 needs the other path. It is last in the markup,
    so the first focus goes to the content.
- **`DrawerHeader`**: Dialog's header classes with `pe-16`, so a title never runs under the
  x, which is 44 px wide under a coarse pointer. **`DrawerTitle`**, **`DrawerDescription`**, **`DrawerFooter`**: as Dialog's. The
  strings are written again in `drawer/classes.ts`; Drawer does not import Dialog.
- **`DrawerBody`.** `Base.Content` with `min-h-0 flex-1 px-4 py-4` and `SCROLL_AREA`.
  `Content` marks the region where a mouse drag selects text instead of swiping.
- **Keyboard and ARIA:** as Dialog. Escape and the x close it with no gesture.
- **Files.** As Dialog, plus `lib.ts`. No `boundaries.ts`.
- **Tests.** Node: `toSwipeDirection` for the four placements in both directions, written
  out. Unit: the compiled rules of the bottom popup read `--tc-safe-bottom`, and
  `src/tokens.css` sets that to `env(safe-area-inset-bottom)` (Phase 5 asks for this,
  because emulation reports zero). Browser: `start` opens at the left in LTR and at the
  right in RTL; focus returns; the page behind does not scroll; with touch emulation a
  scroll gesture at the end of the body leaves `window.scrollY` alone.
- **Mutation.** `toSwipeDirection` stops reading the direction.
- **Not built:** snap points (`snapPoints` reaches Base UI, but no class reads
  `--drawer-snap-point-offset`, so do not show it in a demo), the swipe that opens
  (`Drawer.SwipeArea`), `Drawer.Indent`, a nested drawer, a `dismissible` prop.
- **For the reviewer:** `docs/PLAN.md` 10.5 says the swipe starts only from the handle.
  1.8.0 has no such part; its Viewport tells a body scroll from a swipe itself. That, the
  virtual keyboard and the safe area need the iPhone check. `placement` is on the Root,
  not on the popup as the sample writes it. Nothing keeps the first line of a drawer with
  no `DrawerHeader` clear of the x: every demo has a header, and the README says why.

## Popover

```text
Where: FRAME "Popover and Empty state" 77:316 (shared with EmptyState). Docs card 138:2132.
Frame text: "A Popover is where anything richer than two lines of text goes. ..."
Panel: 280 wide, hugs (140), vertical, gap 12, padding 16, radius -> Knobs radius/box, fill -> base/surface-raised, stroke -> base/line 1, shadow 0 8 24 black at 0.12.
- title row, gap 8: "Share this page" Inter Semi Bold 14 -> base/body, icon/x 14 -> base/muted
- "Anyone with the link can read it. Only your team can edit." Inter Regular 14 -> base/muted
- a button "Copy link": padding 7 / 12, radius 8 raw, fill -> primary/solid, Inter Medium 14 -> primary/on-solid
Caption: "popover with an action".
Docs card: chip "client - 1.7 KB". Head: "Anchored panel for links and controls; it flips and shrinks instead of overflowing."
Playground: placement (bottom), sideOffset (8), size (md), toggles modal off (138:2203), showArrow on (138:2206), dismissible on (138:2211).
Stage (138:2164): a trigger Button "Share" (icon/arrow-square-out 14) centered above the panel, 6 px apart; the panel as above with shadow 0 8 20 at 0.45.
States (5): closed, open, flipped (the panel above the trigger), focus-visible (the ring on the trigger), dismissed (the trigger at 0.5).
Code: import { PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from 'topclassui/popover'
  <PopoverRoot><PopoverTrigger render={<Button variant="ghost" size="sm" />}><Icon name="info" />Details</PopoverTrigger><PopoverPopup><PopoverTitle>How billing works</PopoverTitle><PopoverDescription>Only the seats in use are billed.</PopoverDescription><Link render={<NextLink href="/docs/billing" />}>Read the guide</Link></PopoverPopup></PopoverRoot>
Note: "A tooltip that needs a link or a control is a Popover; a lint rule enforces it."
Surprising:
- showArrow is on, and no arrow is drawn anywhere on a popover.
- sideOffset says 8. The stage draws 6, and POPUP_BOUNDS.sideOffset in code is 6.
- An x is drawn. The sample has no close part.
- No such lint rule exists. Tooltip refuses an element by its type instead.
```

**Build this.** Client. Needs shared pull request 6. Base UI `popover`
(`baseUi: 'popover'`): `Root`, `Trigger`, `Portal`, `Positioner`, `Popup`, `Title`,
`Description`, `Close`.

- **Parts:** `PopoverRoot`, `PopoverTrigger`, `PopoverPopup`, `PopoverTitle`,
  `PopoverDescription`, `PopoverClose`.
- **What Base UI gives:** `open`, `defaultOpen`, `onOpenChange`, `modal` (default `false`).
  The popup is `role="dialog"`, named by the title, with `initialFocus` and `finalFocus`.
  The positioner sets `--available-height`, `--available-width`, `--anchor-width`,
  `--transform-origin`, `data-side`, `data-align` and `data-anchor-hidden`. Its collision
  default is `{ fallbackAxisSide: 'end' }`, which stays.
- **`PopoverTrigger`.** As Dialog's. `delay` and `closeDelay` only matter with Base UI's
  `openOnHover`; they are clamped to `POPOVER_BOUNDARIES` (`delayMin: 0`,
  `delayMax: 10000`) only when the caller passes them, as Tooltip does.
- **`PopoverPopup`** renders Portal, Positioner and Popup. `placement`: the twelve
  `PLACEMENTS`, default `bottom`, in `POPOVER_DEFAULTS`.
  - Positioner: `z-(--tc-z-popup) data-anchor-hidden:invisible`, `sideOffset` and
    `collisionPadding` from `POPUP_BOUNDS`.
  - Popup: `flex w-70 max-w-(--available-width) max-h-(--available-height) flex-col gap-3
    p-4 text-sm`, `OVERLAY_SURFACE`, `POPUP_MOTION`, `FOCUS_RING` and `SCROLL_AREA`. It is
    its own scroll container, so it shrinks and scrolls where it has no room.
- **`PopoverTitle`**: `text-sm font-semibold text-body`. **`PopoverDescription`**:
  `text-sm text-muted`. **`PopoverClose`**: as `DialogClose`, named by
  `labels.common.close`. The caller places it.
- **Keyboard:** Escape and an outside press close it, Tab leaves it, focus returns to the
  trigger.
- **Files.** As Dialog, plus `boundaries.ts`; `schema.ts` holds `placement` and the delays.
- **Browser tests:** with the trigger pinned to each of the four edges the popup is inside
  the viewport; `start` and `end` mirror in RTL; a tall popup near the bottom flips, and
  where it still does not fit it scrolls inside; focus returns.
- **Mutation.** The popup loses `max-h-(--available-height)`.
- **Not built:** the arrow (not drawn), `size` (one width; pass a class), `sideOffset` as
  a prop, a `dismissible` prop.
- **For the reviewer:** a modal popover traps focus only when a `PopoverClose` is inside
  it (Base UI's own note).

## Toast

```text
Where: FRAME "Toast" 76:304. Docs card 137:1841.
Frame text: "A close button is always rendered, because swiping a toast away is a drag and WCAG 2.5.7 requires a non-drag path. The viewport pauses its timers while the pointer is over it."
Toast: 320 wide, horizontal, gap 12, padding 14 / 16, radius -> Knobs radius/box, fill -> base/surface-raised, stroke -> base/line 1, shadow 0 8 24 black at 0.12.
- an icon 16: icon/check-circle -> success/on-soft, or icon/x -> danger/on-soft
- a column, gap 3: title Inter Semi Bold 14 -> base/body, description Inter Regular 14 -> base/muted
- icon/x 14 -> base/muted
Examples: "Project created" / "You can invite your team now." (67 tall), and "Could not save" / "Check your connection and try again." (84 tall, two lines). Captions "success", "error".
Docs card: chip "client - 3.4 KB". Head: "A close button is always rendered, because swiping one away is a drag (WCAG 2.5.7)."
Playground: tone (success), position (bottom-end), duration (5000), toggles dismissible on, pauseOnHover on, withAction off.
States (6): success (icon/check-circle), error (icon/warning-circle -> danger/on-soft), loading (icon/spinner -> base/muted), stacked (three panels 120, 112 and 104 wide, overlapping by 6), entering (opacity 0.55), limited (opacity 0.35).
Code: 'use client'; import { toast } from 'topclassui/toast'
  toast.add({ tone: 'success', title: 'Invitation sent', description: 'They get an email within the minute.' })
Note: "The viewport lives in TopClassProvider; toast.add works outside React too."
Page: Provider, "What it renders" (193:2890): "Toast viewport - One live region, positioned by direction, with the safe-area padding." Its props table has no toast row.
Surprising:
- The error icon is icon/x on the Components page and icon/warning-circle in the card.
- The sample passes tone. Base UI's field is type, and its promise helper writes the types 'loading', 'success' and 'error' itself.
- The playground says position; every other overlay says placement.
- withAction exists, and no action is drawn.
- The package ships no component, and the provider is in the package. A provider that renders the viewport therefore carries Toast with it.
```

**Build this.** Client. Alone: it is the one branch that edits the provider. Needs shared
pull requests 5 and 8. Base UI `toast` (`baseUi: 'toast'`): `Portal`, `Viewport`, `Root`,
`Content`, `Title`, `Description`, `Action`, `Close`, `useToastManager`.

- **Exports:** `ToastViewport` from `client.tsx`, and `toast` from `lib.ts`, re-exported
  by `index.tsx`. No other part is public.
- **`toast`.** Four functions over `toastManager` from `#shared/toast/manager.js`: `add`,
  `update`, `close`, `promise`. It works anywhere in the browser, with or without React.
  `add` takes `tone` (the six `TONES`, default `neutral`), `title`, `description`,
  `duration` (clamped to `TOAST_BOUNDARIES`; `0` stays until closed), `priority` and
  `action: { label: string; onClick: () => void }`, and maps them to Base UI's `type`,
  `timeout`, `priority` and `actionProps`. Left out, `duration` is not forwarded, so the
  provider's applies.
- **`ToastViewport`.** No props but `className`. Portal, Viewport, and one `Base.Root` per
  toast of `useToastManager().toasts`. `useToastViewport()` in `hook.ts` returns the
  toasts, the labels, the placement of `useToastSettings()` and the swipe directions.
  - Viewport: `fixed z-(--tc-z-toast) flex w-90 max-w-full flex-col gap-2
    p-(--tc-overlay-inset)`, named by `labels.toast.region` (Base UI's own default is the
    English "Notifications"), and by placement from `toast/classes.ts`: `bottom-0` with
    `pb-[calc(var(--tc-overlay-inset)+var(--tc-safe-bottom))]`, or `top-0` with the
    `--tc-safe-top` form; and `inset-e-0`, `inset-s-0`, or `inset-x-0 mx-auto`. At the top
    the column is `flex-col-reverse`, so the newest is nearest the edge either way.
  - Root: `OVERLAY_SURFACE`, `FADE_MOTION`, `flex items-start gap-3 px-4 py-3.5`,
    `data-limited:hidden`, and `translate-x-[var(--toast-swipe-movement-x,0px)]
    translate-y-[var(--toast-swipe-movement-y,0px)]`. `swipeDirection` from
    `toSwipeDirections(placement, direction)` in `lib.ts`: down or up, plus right or left
    toward the nearer inline edge, and no sideways swipe when centered.
  - Inside: the icon of the type (`success` check-circle, `danger` and `error`
    warning-circle, `warning` warning, `info` info, `loading` spinner with `animate-spin
    motion-reduce:animate-none`, none otherwise) in the `on-soft` color of its tone, from
    a lookup; `Base.Content` with `min-w-0 flex-1 flex flex-col gap-0.5`; `Base.Title`
    `text-sm font-semibold text-body`; `Base.Description` `text-sm text-muted
    wrap-anywhere`; `Base.Action`, when the toast has one, with
    `buttonVariants({ variant: 'outline', tone: 'neutral', size: 'sm' })`; and always
    `Base.Close`: `ICON_BUTTON text-muted tone-neutral`, `HOVER.ghost`, named by
    `labels.toast.close`.
- **What Base UI gives:** the `role="region"` live viewport, F6 to reach it, timers paused
  on hover, on focus and when the window loses focus, a hidden `role="alert"` copy for
  `priority: 'high'`, and `data-limited` on the toasts past the limit, which stay mounted.
- **The provider.** This pull request also adds one line to
  `src/shared/provider/provider.tsx`: `ToastViewport`, after the children, at the outermost
  provider. It is the one planned exception to `docs/CLOUD-PLAN.md` section 9, and the
  reason Toast is built alone. `toast.add()` must show a toast in an app that mounts
  nothing but `TopClassProvider`: that is the test.
- **Files.** `client.tsx`, `hook.ts`, `lib.ts`, `classes.ts`, `constants.ts` and
  `boundaries.ts` (both re-export the shared contract), `schema.ts`, `types.ts`,
  `index.tsx`, `meta.ts`.
- **Tests.** Node: the clamp and `toSwipeDirections`. Dom: add, update, close and promise;
  the fourth toast is hidden at a limit of 3; the close button is always there; the Arabic
  names under an RTL provider. Unit: the viewport rule reads the safe-area token. Browser:
  the viewport is at the bottom right in LTR and the bottom left in RTL; axe with a toast
  open.
- **Mutation.** `add` stops clamping `duration`.
- **Not built:** the collapsed stack that expands on hover, the entering slide, anchored
  toasts (`Toast.Positioner`), `pauseOnHover` and `dismissible` as props.
- **For the reviewer:** the provider now imports a component, so Toast ships with the base
  package whatever the CLI copies. The default tone is `neutral`, with no icon.

## Dropdown

```text
Where: FRAME "Dropdown menu" 76:152. Docs card "Previewer: Dropdown menu" 138:1464.
Frame text: "One item per row, with an icon, a shortcut, a tick, a submenu caret, a disabled row and a destructive row. A menu longer than the --tc-list-rows knob scrolls inside instead of growing."
Menu: 236 wide, vertical, gap 2, padding 6, radius -> Knobs radius/box, fill -> base/surface-raised, stroke -> base/line 1, shadow 0 8 24 black at 0.12.
MenuItem: horizontal, gap 8, padding 8 / 12, radius 8 raw; icon 14 and Inter Regular 14 -> base/body; a shortcut in Roboto Mono 10 -> base/muted at the end.
- "Profile" (icon/user, "Ctrl P")
- "Settings" (icon/gear), fill -> primary/soft: the highlighted row
- "Duplicate" (icon/copy), icon/caret-right -> base/muted at the end: a submenu
- "Rename" (icon/pencil-simple) at opacity 0.5: disabled
- a 1 px line, "Show hidden files" with icon/check -> primary/on-soft at the end, a 1 px line
- "Delete" (icon/trash), icon and text -> danger/on-soft, "Del"
Caption: "every item kind".
Docs card: chip "client - 2.4 KB". Head: "Menu whose link items render real anchors, so open-in-new-tab and middle-click work."
Playground: placement (bottom-start), size (md), sideOffset (8), toggles modal off, loop on, closeOnSelect on.
Stage (138:1496): a trigger Button "Actions" (icon/dots-three); the panel 220 wide; rows 208 x 31, padding 7 / 9, gap 8. The highlighted row has fill -> primary/soft with icon and text -> primary/on-soft.
States (6): closed, open, hover item, submenu, checked, disabled item.
Code: import { DropdownMenu } from 'topclassui/dropdown'
  <DropdownMenu trigger={<Button variant="outline">Account</Button>} title="Account" items={[{ id: 'profile', label: 'Profile', icon: 'user', href: '/profile' }, { id: 'settings', label: 'Settings', icon: 'gear', href: '/settings' }, { id: 'signout', label: 'Sign out', icon: 'sign-out', tone: 'danger', separatorBefore: true, action: signOut }]} />
Note: "href and Server Action items work from a server page; onSelect needs a client file."
Install row: "npx topclassui add dropdown", then "import { Dropdownmenu } from '@/topclassui/components/dropdown'".
Surprising:
- On the Components page every MenuItem frame is fixed at 224 x 16 with 8 px of padding, so the text overflows its row. The card draws 31 px rows. Neither is a target.
- The highlighted row keeps body-colored text on the Components page and takes on-soft in the card.
- Four names: "Dropdown menu" (the card), DropdownMenu (the sample), dropdown (the path and the command), Dropdownmenu (the install row).
- modal is drawn off; Base UI's Menu defaults to modal. loop and closeOnSelect are loopFocus and closeOnClick in Base UI.
- The sample passes icons by name.
```

**Build this.** Client. Folder `dropdown`, so `meta.name` is `Dropdown`. Needs shared pull
requests 6 and 7. No label. Base UI `menu` (`baseUi: 'menu'`): `Root`, `Trigger`, `Portal`,
`Positioner`, `Popup`, `Item`, `LinkItem`, `Group`, `GroupLabel`, `Separator`.

- **Parts:** `DropdownRoot`, `DropdownTrigger`, `DropdownPopup`, `DropdownItem`,
  `DropdownLinkItem`, `DropdownGroup`, `DropdownGroupLabel`, `DropdownSeparator`. And the
  data-driven **`DropdownMenu`**, in the same `client.tsx`: the lint accepts that name
  beside `DropdownRoot`.
- **What Base UI gives:** `open`, `defaultOpen`, `onOpenChange`, `modal` (default `true`:
  the page scroll is locked), `loopFocus` (default `true`), `highlightItemOnHover`. Arrow
  keys, Home, End, type-ahead, Enter, Space and Escape. An item sets `data-highlighted`
  and `data-disabled`. `Item` closes the menu on click (`closeOnClick` default `true`);
  `LinkItem` does not (default `false`). The positioner's collision default is
  `{ fallbackAxisSide: 'none' }`.
- **`DropdownPopup`** renders Portal, Positioner and Popup. `placement`: default
  `bottom-start`, the shared `DEFAULT_PLACEMENT`.
  - Positioner: `z-(--tc-z-popup)`, `sideOffset` and `collisionPadding` from `POPUP_BOUNDS`.
  - Popup: `flex min-w-48 max-w-(--available-width) flex-col gap-0.5 p-1.5`,
    `OVERLAY_SURFACE`, `POPUP_MOTION`, `LIST_CAP`, `SCROLL_AREA`, `outline-none`.
- **`DropdownItem`.** `Base.Item`: `ROW`, `ROW_HIGHLIGHT`, `DISABLED`, `cursor-default
  select-none`. `icon?: ReactNode` before the label, `shortcut?: string` after it
  (`ms-auto ps-4 font-mono text-xs text-muted`), and the label through
  `truncateLabel(children, DROPDOWN_BOUNDARIES.labelMaxLength)`, a bound of 100.
  `tone`: `'neutral' | 'danger'`, default `neutral`; `danger` is `text-danger-on-soft
  data-highlighted:bg-danger-soft data-highlighted:text-danger-on-soft`.
- **`DropdownLinkItem`.** `Base.LinkItem`, a real `<a href>`, same look and props, with
  `closeOnClick` set, so a client-side navigation closes the menu.
- **`DropdownGroup`**, **`DropdownGroupLabel`** (`px-3 py-1.5 text-xs font-medium
  text-muted`), **`DropdownSeparator`** (`my-1 border-t-(length:--tc-line-width)
  border-line`).
- **`DropdownMenu`.** Props: `MenuContract` (`trigger`, `title`, `items`, `open`,
  `defaultOpen`, `onOpenChange`) plus `placement` and `className`. It renders the parts:
  the trigger through `render`, one group labelled by `title`, a separator before an item
  with `separatorBefore`, a link item for `href`, a link item with the element as its
  `render` for `render`, and an item whose click runs `onSelect`, or runs
  `action(new FormData())` inside `startTransition`. That handler is `useDropdownMenu()`
  in `hook.ts`.
- **Not a collection.** `docs/PLAN.md` 8.5 says a Dropdown windows above the threshold. It
  does not: Base UI's Menu has no `virtualized` prop, and its arrow keys and type-ahead
  reach mounted items only. The row cap alone applies (`R-8.5-1`: say so in the pull
  request).
- **`DropdownTrigger`.** As Dialog's. `delay` and `closeDelay` (Base UI's hover opening)
  are clamped to `delayMin: 0`, `delayMax: 10000` when passed.
- **Files.** `client.tsx`, `hook.ts`, `classes.ts`, `constants.ts`, `boundaries.ts`,
  `schema.ts`, `types.ts`, `index.tsx`, `meta.ts`.
- **Tests.** Dom: arrows, Home, End, type-ahead and Escape; a link item is an anchor with
  its `href`; an `action` item calls the action once; a disabled item does nothing; the
  three kinds of `MenuItem` map as written. Browser, with `dummy/sixty-items.tsx`: the
  list scrolls inside the popup and `window.scrollY` does not move; the popup stays inside
  the viewport at all four edges; `bottom-start` opens at the left in LTR and at the right
  in RTL; focus returns to the trigger.
- **Mutation.** An `href` item stops rendering a link item.
- **Not built:** checkbox items, radio items and submenus (all three are drawn), `size`,
  a visible arrow, and icons by name.
- **For the reviewer:** a row is `--tc-row-height` tall (40 px), not the drawn 31, so the
  cap shows about `--tc-list-rows` rows, the last one cut. Under a coarse pointer a row is
  44 px and the cap shows fewer. A dom test proves a `render` item renders the given
  element, keeps its `href` and is a `menuitem`.

## Command

```text
Where: FRAME "Command palette" 79:328. Docs card "Previewer: Command palette" 138:1653.
Frame text: "Search, a group heading, a highlighted row and a key hint. It is a collection, so with ten thousand commands it still renders only the rows you can see."
Panel: 420 wide, vertical, radius -> Knobs radius/box, fill -> base/surface-raised, stroke -> base/line 1, shadow 0 8 24 black at 0.12.
- search row: gap 10, padding 14 / 16: icon/magnifying-glass 14 -> base/muted, the query "but" Inter Regular 16 -> base/body, a key hint "Esc" (padding 2 / 6, radius 4, fill -> base/surface, stroke -> base/line, Roboto Mono 10 -> base/muted)
- a 1 px line -> base/line
- list: gap 2, padding 6: a heading "Components" Inter Medium 10 -> base/muted, then rows 33 tall, padding 8 / 10, gap 10, radius 8 raw
  - "Button", highlighted: fill -> primary/soft, icon/file-text and text -> primary/on-soft, hint "Enter" at the end
  - "Button group", "Icon button": icon -> base/muted, text -> base/body
Caption: typing "but".
Docs card: chip "client - 9.4 KB, lazy". Head: "Searchable action palette that loads on first open, never in the initial bundle."
Playground: visibleRows (7), placement (center), shortcut (Ctrl K), toggles modal, loop, filter, all on.
States (6): closed ("Ctrl" "K"), open, typing, empty (icon/magnifying-glass 18 over "no results"), loading (icon/spinner 20), selected.
Code, captioned "Loaded with React.lazy and mounted on first open, so it is never in the initial bundle.":
  'use client'; import { Command } from 'topclassui/command'
  const [open, setOpen] = useState(false)
  <Button variant="outline" onClick={() => setOpen(true)}><Svg icon={magnifyingGlass} />Search</Button>
  <Command items={commands} getKey={(command) => command.id} open={open} onOpenChange={setOpen} />
Note: "getKey is a function, so the palette must be configured inside a client file."
Install row: "npx topclassui add command", then "import { Commandpalette } from '@/topclassui/components/command'".
Surprising:
- No scrim and no page are drawn behind the palette.
- The sample never says what choosing a row does: no onSelect, and no way to read a label from an item.
- Three names: "Command palette" (the card), Command (the sample and the path), Commandpalette (the install row). docs/PLAN.md 18.5 says Command; docs/CLOUD-PLAN.md says CommandPalette.
```

**Build this.** Client, lazy, tier 3. Built last and alone. Needs shared pull request 5.
Folder `command`, so `meta.name` is `Command`, and the one export is `Command`, as the
sample writes it. Base UI
has no command part. It is `dialog` (`Root`, `Portal`, `Backdrop`, `Viewport`, `Popup`,
`Title`) around `autocomplete` (`Root`, `Input`, `List`, `Group`, `GroupLabel`, `Item`,
`Empty`) with `inline`: "Whether the list is rendered inline without using the component's
own popup". `baseUi: 'autocomplete'`. Read `autocomplete/root/AutocompleteRoot.d.ts` and
`combobox/root/AriaCombobox.d.ts` under `node_modules/@base-ui/react/` first, for `inline`,
`virtualized`, `items`, `filteredItems`, `onItemHighlighted`, and the `index` prop of an
item: the types say to bind the `open` and `onOpenChange` of the Autocomplete to the
Dialog's, so the query resets on close.

- **Props** (`CommandProps<T>`): `CollectionProps<T>` (`items`, `getKey`, `visibleRows`,
  `virtualize`, `status`, `emptyFallback`, `loadingFallback`), `getLabel: (item: T) =>
  string`, `onSelect: (item: T) => void`, `getGroup?: (item: T) => string | undefined`,
  `renderItem?: (item: T) => ReactNode` (the row content; the label by default), `open`,
  `defaultOpen`, `onOpenChange`, and `shortcut?: string | null`, default `'k'`: the key
  that opens it with Ctrl or Cmd, `null` for none.
- **Two files, so it is lazy.** `client.tsx` holds the shell: the open state
  (`useControllableState`), the key listener on `document`, both in `hook.ts`, and
  `lazy()` over `import('./parts/command-panel.js')`, mapped to its named export
  `CommandPanel`, inside `<Suspense>`, mounted on the first open and kept.
  `parts/command-panel.tsx` holds everything from Base UI. A test walks the static imports
  of `client.tsx` and finds no `@base-ui/react`.
- **Filtering.** `filterCommands(items, query, getLabel)` in `lib.ts`: every word of the
  query, case-insensitive, anywhere in the label; the item order is kept. The Autocomplete
  gets the filtered list, with its own filter off, and `autoHighlight`, so Enter takes the
  first match.
- **Rows.** `useCollection` over the filtered items: windowing above the threshold, the
  spacers, and `scrollToIndex` when the highlight moves to a row that is not mounted.
- **Classes**, in `command/classes.ts`:
  - Backdrop: `SCRIM z-(--tc-z-dialog)`, `FADE_MOTION`.
  - Viewport: `fixed inset-0 z-(--tc-z-dialog) flex items-start justify-center
    p-(--tc-overlay-inset) pt-[15dvh]`.
  - Popup: `flex max-h-[calc(85dvh-var(--tc-overlay-inset))] w-full max-w-105 flex-col`,
    `OVERLAY_SURFACE`, `POPUP_MOTION`. No `overflow-hidden`: the ring of the input must
    not be clipped.
  - Search row: `flex shrink-0 items-center gap-2.5 border-b-(length:--tc-line-width)
    border-line px-4 text-muted`, the `magnifying-glass` icon, and the input: `h-control-lg
    min-w-0 flex-1 rounded-control bg-transparent text-base text-body
    placeholder:text-muted`, `FOCUS_RING_INSET`.
  - List: `flex min-h-0 flex-col gap-0.5 p-1.5`, `LIST_CAP`, `SCROLL_AREA`. Group label:
    `px-3 pt-2 pb-1 text-xs font-medium text-muted`. Item: `ROW`, `ROW_HIGHLIGHT`,
    `DISABLED`, `cursor-default select-none`.
  - Empty and loading: `px-4 py-6 text-center text-sm text-muted`, with
    `labels.collection.noResults` and `labels.common.loading`, or the caller's fallbacks.
- **ARIA.** A visually hidden `Dialog.Title` (`sr-only`) with `labels.command.label`. The
  input is named and given its placeholder by `labels.command.placeholder`. Base UI makes
  the input a combobox over a listbox and moves `aria-activedescendant`.
- **Keyboard:** the shortcut opens it, arrows move the highlight, Enter calls `onSelect`
  and closes, Escape closes, and focus returns to where it was.
- **Files.** `client.tsx`, `hook.ts`, `lib.ts`, `parts/command-panel.tsx`, `classes.ts`,
  `constants.ts`, `schema.ts`, `types.ts`, `index.tsx`, `meta.ts`. `visibleRows` is the
  shared collection bound, so no `boundaries.ts`.
- **Tests.** Node: `filterCommands`, written out, for one word, two words, a different
  case and no match. Dom: opens on Ctrl+K and on Cmd+K, not on K alone; typing narrows;
  Enter selects; empty and loading. Browser, with a ten-thousand-item demo: fewer than a
  hundred rows in the DOM while scrolling; the list scrolls and the page does not; focus
  returns.
- **Mutation.** `filterCommands` stops lowering the case.
- **Not built:** the parts as public exports, the "Esc" and "Enter" key hints (a key name
  is English text; it would need two more label keys), `loadMore`, icons by name,
  `placement`.
- **For the reviewer:** this is the riskiest of the ten: the windowed list under an inline
  Autocomplete is read from the types, not proven. If it cannot be made to work, ship it
  with `virtualize={false}`, a `limit` of `visibleRows` times ten, and say so. The panel
  is anchored near the top, not centered as the playground says, so it does not jump as
  the results change.

## Tabs

```text
Where: FRAME "Tabs" 76:196. Docs card 138:809.
Frame text: "Two looks. The line variant underlines the active tab with primary/solid; the enclosed variant lifts it onto a raised surface. The inactive label is base/muted, never a lighter primary."
Line: a row, gap 24. A tab is a label (padding 8 / 12, Inter 14) over a 2 px bar, 6 px below it.
- active "Overview": Semi Bold -> base/body, bar fill -> primary/solid
- "Props", "Accessibility": Medium -> base/muted, no bar
- "Changelog": the same at opacity 0.5 (disabled)
- under the row a 1 px line -> base/line, the full 430 width
Enclosed: a container, gap 4, padding 4, radius 8 raw, fill -> base/surface. The active tab has fill -> base/surface-raised, radius 8, shadow 0 1 3 black at 0.08. The others have no fill.
Docs card: chip "split - 0 KB server + 1.4 KB client". Head: "Panels render on the server and stay in the HTML, so inactive text is still indexed."
Playground: variant (line), size (md), orientation (horizontal), toggles keepMounted on, fullWidth off, disabled off.
Stage: both looks, with tabs "Overview", "Props", "A11y"; gap 20, padding 7 / 11, inactive labels Regular.
States (4): line, enclosed, focus-visible (a ring around the label of the active tab), disabled (the whole list at 0.5).
Code: import { TabsList, TabsPanel, TabsRoot, TabsTab } from 'topclassui/tabs'
  <TabsRoot defaultValue="overview"><TabsList><TabsTab value="overview">Overview</TabsTab><TabsTab value="activity">Activity</TabsTab></TabsList><TabsPanel value="overview" keepMounted><Text>Revenue is up 12% against last quarter.</Text></TabsPanel><TabsPanel value="activity" keepMounted>...</TabsPanel></TabsRoot>
Note: "keepMounted keeps inactive panels in the server HTML; Base UI unmounts them by default."
Surprising:
- No panel is drawn anywhere.
- A tab is 33 px tall (raw), which is no control size.
- The head says panels stay in the HTML; the sample has to pass keepMounted to each panel to make it so.
- Inactive labels are Medium on the Components page and Regular in the card.
```

**Build this.** Split: the four parts are client, and what a panel holds is rendered on the
server and passed in as children. Base UI `tabs` (`baseUi: 'tabs'`): `Root`, `List`, `Tab`,
`Panel`.

- **Parts**, in `client.tsx`: `TabsRoot`, `TabsList`, `TabsTab`, `TabsPanel`.
- **What Base UI gives:** `value`, `defaultValue` (default `0`), `onValueChange`,
  `orientation`. The list is a `tablist`: arrow keys move the focus and follow the
  direction provider, Home and End work, `loopFocus` is on, and `activateOnFocus` is off,
  so Enter or Space activates. A tab sets `data-active` and `data-disabled`.
- **`TabsRoot`.** A `<div>`. `variant`: `'line' | 'enclosed'`, default `line`. `size`: the
  six `SIZES`, default `md`. Both are attributes on the root and reach the list and the
  tabs through a context made in `hook.ts`.
- **`TabsList`.** Its type requires `aria-label` or `aria-labelledby`. `line`: `flex
  items-center gap-6 border-b-(length:--tc-line-width) border-line` and `SCROLL_X`.
  `enclosed`: `inline-flex max-w-full items-center gap-1 rounded-control bg-surface p-1`
  and `SCROLL_X`.
- **`TabsTab`.** `inline-flex shrink-0 items-center justify-center whitespace-nowrap
  font-medium text-muted data-active:font-semibold data-active:text-body`,
  `CONTROL_SIZE[size]`, `FOCUS_RING_INSET` (the list clips), `TOUCH_TARGET`, `TRANSITION`,
  `DISABLED`. `line` adds `border-b-2 border-transparent data-active:border-primary-solid`,
  in `tabs/classes.ts`. `enclosed` adds `rounded-control data-active:bg-surface-raised
  data-active:shadow-sm`. The label goes through `truncateLabel` with a bound of 100.
- **`TabsPanel`.** `keepMounted` defaults to `true`, so every panel is in the server HTML;
  a caller passes `false` for a heavy one. `pt-4` and `FOCUS_RING`.
- **Files.** `client.tsx`, `hook.ts`, `classes.ts`, `constants.ts`, `boundaries.ts`,
  `schema.ts`, `types.ts`, `index.tsx` (re-exports only), `meta.ts`.
- **Tests.** SSR: the text of the inactive panel is in the server HTML (Phase 6 asks for
  it). Dom: arrows, Home and End; `aria-selected` follows; a disabled tab is skipped; RTL
  under the provider reverses the arrows. Browser: the inactive panel is in the DOM and
  not visible; a long list scrolls sideways inside itself.
- **Mutation.** `keepMounted` loses its default.
- **Not built:** `Tabs.Indicator` (its position variables are `--active-tab-left` and
  `--active-tab-right`, which are physical), a vertical look (the `orientation` prop still
  reaches Base UI), `fullWidth`, a hover style (none is drawn), a data-driven `Tabs`.
- **For the reviewer:** a tab is as tall as a control (40 px at `md`), not the drawn 33.
  The active bar sits just above the line of the list, not on it: the list clips, so a tab
  cannot paint over the border of its parent.

## Accordion

```text
Where: FRAME "Accordion" 76:238. Docs card 138:994.
Frame text: "The caret rotates 180 degrees when a panel opens. Closed panels stay in the HTML with hiddenUntilFound, so the browser can find and open them from a Ctrl+F search."
Box: 420 wide, vertical, radius -> Knobs radius/box, fill -> base/surface-raised, stroke -> base/line 1, no shadow.
- trigger row: gap 12, padding 14 / 16: the title Inter Medium 14 -> base/body, icon/caret-down 14 -> base/muted, rotated 180 when open
- panel: padding 0 / 16 / 16 / 16, Inter Regular 14 -> base/muted
- a 1 px line -> base/line between items
Three items: "What is a server component?" (open), "Does it work in Arabic?", "How big is the bundle?". Caption "first item open".
Docs card: chip "split - 0 KB server + 1.1 KB client". Head: "Closed panels stay in the DOM with hiddenUntilFound, so Ctrl+F and crawlers find them."
Playground: type (single), variant (outline), toggles collapsible on, hiddenUntilFound on, disabled off.
States (5): closed, open, hover (the trigger row fill -> base/surface), focus-visible (a ring around the whole box), disabled (0.5).
Code: import { AccordionItem, AccordionRoot } from 'topclassui/accordion'
  <AccordionRoot defaultValue={['install']}><AccordionItem value="install" title="How do I install a component?"><Text>Run npx topclassui add accordion, or import it from the package.</Text></AccordionItem><AccordionItem value="rtl" title="Does it work in Arabic?">...</AccordionItem></AccordionRoot>
Note: "Panels use hiddenUntilFound, so closed text is still found by Ctrl+F and indexed."
Surprising:
- type and collapsible are not Base UI props. Its Root has multiple (default false).
- The focus ring is drawn around the whole box, not around the trigger that has the focus.
- The open state in the states row has a line between the trigger and the panel. The stage has none.
- The sample text says "or import it from the package", which ships no component.
```

**Build this.** Split, as Tabs. Base UI `accordion` (`baseUi: 'accordion'`): `Root`,
`Item`, `Header`, `Trigger`, `Panel`.

- **Parts**, in `client.tsx`: `AccordionRoot` and `AccordionItem`. An item renders Base
  UI's Item, Header, Trigger and Panel, as `docs/PLAN.md` 9.1 sketches.
- **What Base UI gives:** `value` and `defaultValue` (arrays), `onValueChange`, `multiple`
  (default `false`), `disabled`, `hiddenUntilFound`, `keepMounted`. The trigger is a button
  with `aria-expanded`, `aria-controls` and `data-panel-open`. The panel is `role="region"`
  named by its trigger. In 1.8.0 `loopFocus` and `orientation` are marked deprecated,
  "following the APG guidance update": do not document them.
- **`AccordionRoot`.** `rounded-box bg-surface-raised text-body overflow-hidden` and
  `BORDER`.
- **`AccordionItem`.** `value: string` (required here), `title: ReactNode`, `disabled`,
  children for the panel, and `headingLevel`: default 3, clamped to
  `ACCORDION_BOUNDARIES` (`headingLevelMin: 2`, `headingLevelMax: 6`), through a lookup of
  the five tags passed to `render` on `Base.Header`. Base UI's header is an `<h3>`, which
  fails axe under a harness page whose only heading is the `<h1>`: demos pass 2.
  - Item: `border-t-(length:--tc-line-width) border-line first:border-t-0`.
  - Trigger: `group flex w-full items-center justify-between gap-3 px-4 py-3.5 text-start
    text-sm font-medium text-body tone-neutral`, `HOVER.ghost`, `FOCUS_RING_INSET` (the
    root clips), `TOUCH_TARGET`, `TRANSITION`, `DISABLED`.
  - Caret: `<Svg icon={caretDown} />` with `shrink-0 text-muted transition-[rotate]
    duration-(--tc-duration) group-data-panel-open:rotate-180`, in `classes.ts`.
  - Panel: `hiddenUntilFound`, `FADE_MOTION`, `text-sm text-muted`, and an inner `<div>`
    with `px-4 pb-4`.
- **Keyboard:** Tab reaches each trigger; Enter and Space toggle.
- **Files.** `client.tsx`, `classes.ts`, `constants.ts`, `boundaries.ts`, `schema.ts`,
  `types.ts`, `index.tsx`, `meta.ts`. No `hook.ts`.
- **Tests.** SSR: the text of a closed panel is in the server HTML (Phase 6). Dom: toggle
  by click and by key; `multiple`; `aria-expanded`; a disabled item; `headingLevel` 9
  renders an `<h6>`. Browser: a closed panel is not visible, and the focus ring of a
  trigger is fully painted.
- **Mutation.** The panel loses `hiddenUntilFound`.
- **Not built:** a height animation (`docs/PLAN.md` 5.8 animates transform and opacity
  only), `type` and `collapsible`, `variant`, a data-driven `Accordion` (the lint refuses
  that name beside `AccordionRoot` in one file).
- **For the reviewer:** the ring is on the trigger, inset, not around the box as drawn.
  Whether a single-mode item can be closed again is Base UI's; it was not run.

## Navbar

```text
Where: FRAME "Navbar" 80:472, the bar itself 80:476. Docs card 138:2393.
Frame text: "Brand, navigation, search and account. It is sticky, so it sets --tc-sticky-top and the page reads that into scroll-padding, which keeps a focused link from hiding underneath it."
Bar: 1132 x 60, horizontal, gap 24, padding 0 / 20, fill -> base/surface-raised, a 1 px stroke -> base/line on the bottom only.
- brand: a 26 x 26 square, radius 4, fill -> primary/solid, then "TopClass UI" Inter Semi Bold 16 -> base/body
- links, gap 20: "Docs" Inter Semi Bold 14 -> base/body (the current page), "Components", "Icons", "Theming" Inter Regular 14 -> base/muted
- a spacer, then a search field (icon/magnifying-glass, "Search", "Ctrl K"), icon/bell 16 -> base/muted, an avatar "OA"
Docs card: chip "split - 0 KB server + 1.2 KB client". Head: "Sticky header with server-rendered links that publishes its own height as --tc-sticky-top."
Playground: variant (sticky), size (md), toggles sticky on, bordered on, collapsible off.
States (6): top, scrolled (shadow 0 2 6 black at 0.4), mobile (icon/list before the brand), open menu, focus-visible (a ring around the whole bar), transparent (no fill, no stroke).
Code: import { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot } from 'topclassui/navbar'
  <NavbarRoot><NavbarBrand render={<Link href="/" />}>TopClass UI</NavbarBrand><NavbarLinks><NavbarLink render={<Link href="/docs" />}>Docs</NavbarLink><NavbarLink render={<Link href="/components" />}>Components</NavbarLink></NavbarLinks><NavbarActions><Button render={<Link href="/login" />}>Sign in</Button></NavbarActions></NavbarRoot>
Note: "The bar sets --tc-sticky-top to its own height, so #anchor targets clear it."
Page: Connectors, AdaptiveNav (403:2382): "Inline links on desktop, a hamburger drawer or bottom bar on a phone."
Surprising:
- sticky appears twice: as the value of variant and as a toggle.
- "open menu" is the same drawing as "mobile". No menu is drawn.
- Nothing in src/ reads --tc-sticky-top today: no rule sets scroll-padding.
- The search field, the bell and the avatar are drawn and belong to no part: they are children of NavbarActions.
```

**Build this.** Split. No Base UI part (`baseUi: null`): `navigation-menu` is the tier 3
mega menu. Server parts in `parts/`, one small client part. Needs shared pull requests 4
and 5.

- **Parts:** `NavbarRoot`, `NavbarBrand`, `NavbarLinks`, `NavbarLink`, `NavbarActions`.
- **`NavbarRoot`.** A `<header>`: `flex min-h-15 w-full items-center gap-6
  bg-surface-raised px-5 border-b-(length:--tc-line-width) border-line ps-safe pe-safe`.
  `sticky`: default `true`, which adds `STICKY_TOP` and `pt-safe` and renders
  `NavbarOffset` inside.
- **`NavbarOffset`**, in `client.tsx`, not exported from `index.tsx`. A hidden `<span>`
  whose hook (`useNavbarOffset()` in `hook.ts`) watches the parent `<header>` with a
  `ResizeObserver`, writes its height in px to `--tc-sticky-top` on
  `document.documentElement`, and removes it on unmount. The page reads it through the
  `scroll-padding-block` rule of shared pull request 4.
- **`NavbarBrand`.** `render`, the element form, through `renderElement`: `inline-flex
  items-center gap-2 text-base font-semibold text-body rounded-control`, `FOCUS_RING`,
  `TOUCH_TARGET`.
- **`NavbarLinks`.** `<nav>` named by `labels.navbar.label`, holding a `<ul>` with `flex
  w-max items-center gap-5`. `labels?: Labels`. The `<nav>` carries `-m-1 min-w-0 p-1` and
  `SCROLL_X`: on a narrow screen the links scroll sideways inside the bar and the page
  never grows wider. The padding is the room a focus ring needs inside a box that clips.
- **`NavbarLink`.** An `<li>` and a link through `renderElement`. `current`: default
  `false`, sets `aria-current="page"`. `inline-flex items-center rounded-control text-sm
  text-muted aria-[current=page]:font-semibold aria-[current=page]:text-body`,
  `HOVER.link`, `FOCUS_RING`, `TOUCH_TARGET`.
- **`NavbarActions`.** `ms-auto flex items-center gap-2`.
- **Files.** `index.tsx` (re-exports), `parts/navbar-root.tsx` and four more,
  `client.tsx`, `hook.ts`, `classes.ts`, `constants.ts`, `schema.ts`, `types.ts`,
  `meta.ts`.
- **Tests.** Unit: the markup, `aria-current`, the nav name in English and Arabic. Dom:
  the hook sets the variable from a stubbed size and clears it on unmount. Browser: with
  the sticky bar and a long page, an `#anchor` target lands below the bar, and a focused
  link scrolled into view is not under it (WCAG 2.4.11); in RTL the brand is at the right;
  at 320 px wide with six links the page has no sideways scroll and the ring of a focused
  link is fully painted.
- **Mutation.** The hook stops setting the variable.
- **Not built:** the mobile menu (the AdaptiveNav connector, Phase 6), the scrolled
  shadow, the transparent variant, `size`, `bordered`, a search part.
- **For the reviewer:** until the script runs the variable is 0, so an anchor opened
  before hydration can sit under the bar.

## Sidebar

```text
Where: FRAME "Sidebar, Segmented control, Number field and OTP" 83:244. Docs card 138:2539.
Frame text: "A sidebar that collapses to icons, ..."
Expanded: 220 wide, vertical, gap 4, padding 10, fill -> base/surface, stroke -> base/line 1, no radius.
- header row (gap 8): icon/sidebar-simple 16 -> base/muted, "Workspace" Inter Semi Bold 14 -> base/body
- rows 33 tall, padding 8, gap 10, radius 8 raw: an icon 14 and a label Inter 14
  - "Home", the current page: fill -> primary/soft, icon/house and text -> primary/on-soft, Medium
  - "Projects" (icon/folder), "Team" (icon/users), "Settings" (icon/gear): icon -> base/muted, text Regular -> base/body
Collapsed: 60 wide, the same rows centered with the icon alone. Captions "expanded", "collapsed to icons".
Docs card: chip "split - 0 KB server + 1.8 KB client". Head: "Collapsible side rail whose links are server HTML; only the collapse toggle runs in the browser."
Playground: variant (inline), width (220), defaultOpen (true), toggles collapsible, bordered, overlayOnMobile, all on.
Stage: 190 wide, radius -> Knobs radius/box, fill -> base/page.
States (5): expanded, collapsed, active item, hover (the row fill -> base/surface), focus-visible (a ring around one row).
Code: import { SidebarGroup, SidebarLink, SidebarRoot } from 'topclassui/sidebar'
  <SidebarRoot defaultOpen><SidebarGroup label="Getting started"><SidebarLink render={<Link href="/docs/install" />}><Icon name="download-simple" /> Install</SidebarLink><SidebarLink render={<Link href="/docs/theming" />}><Icon name="palette" /> Theming</SidebarLink></SidebarGroup></SidebarRoot>
Note: "defaultOpen is the expanded state; AdaptiveSidebar swaps it for a Drawer on mobile."
Surprising:
- The toggle icon is drawn in the header. The sample has no part for it, and no header.
- The sample has a group label. No drawing shows one.
- The fill is base/surface on the Components page and base/page in the card.
- "active item" is the same drawing as "expanded".
```

**Build this.** Split: a client shell and its toggle, around server-rendered links. No Base
UI part (`baseUi: null`). Needs shared pull requests 4 and 5.

- **Parts.** Client, in `client.tsx`: `SidebarRoot`, `SidebarTrigger`. Server, in
  `parts/`: `SidebarHeader`, `SidebarBody`, `SidebarGroup`, `SidebarLink`.
- **`SidebarRoot`.** A `<nav>` named by `labels.sidebar.label`. `open`, `defaultOpen`
  (default `true`) and `onOpenChange`, through `useControllableState` in `hook.ts`, shared
  with the trigger by a context. It sets `data-open` or `data-closed`. Classes:
  `group/sidebar flex h-full shrink-0 flex-col gap-1 bg-surface p-2.5
  border-e-(length:--tc-line-width) border-line data-open:w-55 data-closed:w-15`.
- **`SidebarTrigger`.** A `<button type="button">` with `aria-expanded`, named by
  `labels.sidebar.collapse` or `labels.sidebar.expand`: `ICON_BUTTON text-muted
  tone-neutral`, `HOVER.ghost`, holding `<Svg icon={sidebarSimple} />`, a directional icon.
- **`SidebarHeader`.** A `<div>` with `flex items-center gap-2 pb-1.5`. It renders
  `SidebarTrigger`, then its children in a `<span>` with `LABEL text-sm font-semibold
  group-data-closed/sidebar:sr-only`.
- **`SidebarBody`.** The scroll container: `flex min-h-0 flex-1 flex-col gap-1` and
  `SCROLL_AREA`.
- **`SidebarGroup`.** `label?: ReactNode` in a `<p>` (`px-3 py-1 text-xs font-medium
  text-muted group-data-closed/sidebar:sr-only`) that names the `<ul>` under it (`flex
  flex-col gap-1`) through `useId`.
- **`SidebarLink`.** An `<li>` and a link through `renderElement`. `icon?: ReactNode`,
  the label as children, `current` (default `false`, sets `aria-current="page"`). `ROW`,
  `HOVER.ghost`, `FOCUS_RING`, `TRANSITION`, `group-data-closed/sidebar:justify-center
  group-data-closed/sidebar:px-0`, and by `current`, from a lookup: `tone-primary
  bg-(--tc-soft) font-medium text-primary-on-soft`, or `tone-neutral text-body`. The label
  is a `<span>` with `LABEL group-data-closed/sidebar:sr-only`, so a collapsed link keeps
  its name.
- **Files.** `index.tsx`, `client.tsx`, `hook.ts`, four files in `parts/`, `classes.ts`,
  `constants.ts`, `boundaries.ts` (the label bound), `schema.ts`, `types.ts`, `meta.ts`.
- **Tests.** Dom: the trigger toggles and calls `onOpenChange`; controlled and
  uncontrolled; a collapsed link is still found by its name; the Arabic names. Browser:
  the rail is 220 and 60 px wide; a list longer than the screen scrolls inside the body;
  in RTL the rail and its border mirror.
- **Mutation.** The trigger stops calling `onOpenChange`.
- **Not built:** `width` as a prop (pass `data-open:w-72`), remembering the state, a width
  animation, a tooltip on a collapsed link, the mobile overlay (the AdaptiveSidebar
  connector), nested groups.
- **For the reviewer:** the sample puts the icon inside the children. Here it is a prop, so
  the label has an element of its own to hide. A collapsed link shows no text to a sighted
  mouse user until the tooltip connector exists. The current row and the hover both read
  `--tc-soft`, so no two background classes compete.

## Part 2: what Unit 2 left out

Four small pull requests. Each one needs its Unit 2 server half merged, except Rating,
which had no branch on 2026-10-09 and is built whole here; if a read-only Rating has
landed since, keep it and add the editing half. No public name is added: a new client
part is internal, imported by `index.tsx` from `./client.js`, so a page that never asks
for it renders no client code. Set `rendering: 'split'` in `meta.ts`.

### Rating

```text
Where: FRAME "Slider and Rating" 77:252. Docs card 137:2617.
Frame text: "Both are drag controls, so both need a keyboard path: arrow keys move a slider, and a rating is a radio group underneath. WCAG 2.5.7 makes that mandatory, not optional."
Three rows of five 20 x 20 icons, gap 4: "0 of 5" (five icon/star -> base/line-strong), "3 of 5" (three icon/star-fill -> warning/solid, two icon/star), "5 of 5".
Docs card: chip "split - 0 KB server + 1.3 KB client". Head: "Read-only stars add 0 KB and can emit AggregateRating JSON-LD; only the editable version hydrates."
Playground: max (5), size (md), precision (half), toggles readOnly on, showValue off, allowClear off.
Stage: three rows of 24 x 24 stars, gap 5: five, three and none filled.
States (6): empty, partial (3), full, hover (4 filled), focus-visible (a ring around the row), read-only (3 filled, at opacity 0.75).
Sample: <Rating value={4} max={5} /> beside a muted "128 reviews". Note: "value renders stars on the server; only an editable rating ships the client half."
Surprising:
- precision says half, and no half star is drawn anywhere. The Icons page has icon/star and icon/star-fill and no star-half.
- The read-only state is drawn dimmed, and readOnly is the default.
```

**Build this.** Split. Tier 3, `media-and-display`. One export, `Rating`. No Base UI part.

- **Props.** `value`: default 0, clamped to 0 and `max`, shown to the nearest half. `max`:
  default 5, clamped to `RATING_BOUNDARIES` (`maxMin: 1`, `maxMax: 10`). `size`: the icon
  scale, default `md`, passed to `Svg`. `readOnly`: default `true`. `labels?: Labels`,
  `locale?: string`. When `readOnly` is `false`: `defaultValue`, `onValueChange`, `name`,
  `disabled`, and a type that requires `aria-label` or `aria-labelledby`.
- **One star**, from `lib.tsx`, used by both halves: a `<span>` with `relative inline-flex
  shrink-0 text-line-strong` holding `<Svg icon={star} />`, and over it, for a full or a
  half star, a `<span aria-hidden>` with `absolute inset-y-0 inset-s-0 flex overflow-hidden
  text-warning-solid` and `w-full` or `w-1/2`, holding `<Svg icon={starFill} />` with
  `max-w-none`. The clip starts at the inline start, so a half star fills its right half in
  Arabic with no second icon.
- **Read-only**, in `index.tsx`: a `<span role="img">` with `inline-flex items-center
  gap-1`, named by `labels.rating.value(value, max, fmt)`.
- **Editing**, `RatingField` in `client.tsx`: a `<span role="radiogroup">`, and for each
  step a `<label>` with `relative inline-flex cursor-pointer items-center justify-center
  rounded-control`, `TOUCH_TARGET` and `FOCUS_RING_WITHIN`, holding a native radio and the
  star. The radio is `absolute inset-0 size-full cursor-pointer appearance-none opacity-0`,
  named by `labels.rating.stars(n, fmt)`. It is not `sr-only`: the target-size spec
  measures every `input`, and a 1 px one fails. A star is filled when its step is at or
  below the hovered step, or the value when nothing is hovered. State and hover are in
  `hook.ts`, on `useControllableState`.
- **Keyboard:** the browser's own radio group: arrows move and select, Tab enters and
  leaves. A native radio also submits in a form before any script runs.
- **Mutation.** The fill rule ignores the value.
- **Not built:** half steps while editing, `allowClear`, `showValue`, the JSON-LD, the
  dimmed read-only look.
- **For the reviewer:** which way the arrow keys move a native radio group in RTL is the
  browser's. Test it, and say what Chromium does.

### Tag

```text
Frame "Tag" 79:199. Frame text: "A Badge you can dismiss. The close button is a real button, at least 24x24 on every pointer, because a tag you can only remove by dragging fails WCAG 2.5.8."
Drawn with the x: md is 141 x 29, padding 6 at the end and 12 at the start, gap 8, then icon/x 14 -> <tone>/on-soft. The x is 12 at xs, 14 at sm and md, 16 at lg, 18 at xl.
Card states: idle, hover (fill -> primary/soft-hover), active (primary/soft-active), focus-visible (a ring around the whole tag), disabled (0.5), all drawn on a tag with no x.
Note: "The removable Tag is the client half; a plain Tag stays on the server and ships 0 KB."
```

**Build this.** `onRemove?: () => void`. When it is passed, `Tag` renders its label inside
one `<span id>` with `LABEL`, then `TagRemove` from `client.tsx`: a `<button
type="button">` with `ICON_BUTTON` and `HOVER.soft`, holding `<Svg icon={x} />`. Its
`aria-label` is `labels.tag.remove` and its `aria-labelledby` is its own id then the id of
the label, so it reads "Remove design-system". Both ids come from `useId` in `index.tsx`.
The end padding of the tag drops to its block padding. The button calls `onRemove`; taking
the tag out of the list is the caller's.

- **Mutation.** The button loses `aria-labelledby`.
- **Not built:** a `removable` boolean (the handler is the switch), `disabled`, and the
  hover, active and focus states of the whole tag: only the button is interactive.
- **For the reviewer:** the button is at least 24 px, so an `xs` tag, drawn 19 px tall,
  grows to 24 px when it can be removed.

### Avatar

```text
Card states: image, initials, icon, loading (a Skeleton circle). Note: "The fallback shows while the image loads and after it fails; initials are children."
```

**Build this.** `AvatarImage` moves from `parts/avatar-image.tsx` to `client.tsx`.
`useAvatarImage(src)` in `hook.ts` returns a ref, `failed` and `onError`. It also checks,
when it mounts, an image that failed before the script ran (`complete` with a
`naturalWidth` of 0), and it starts again when `src` changes. A failed image gets
`data-error` and `data-error:opacity-0`: it stays in the tree, so its `alt` still names
the avatar, and the fallback shows through. Base UI has an `avatar` part whose Image has
`keepMounted`, but it needs Base UI's own Root, which would move the root and the fallback
to the client.

- **Mutation.** The check on mount is removed.
- **Not built:** `shape`, `bordered`, `status`, `clickable`, `onLoadingStatusChange`.
- **For the reviewer:** every avatar with an image now hydrates, a table of fifty included.
  An avatar with initials only stays at 0 KB. See choice 27.

### Banner

```text
Frame "Banner" 79:380. Frame text: "Full width, one line, always dismissible. It sits above the header and pushes the page down rather than covering it, so it never hides a focused element."
Both drawn banners end with icon/x 14 -> <tone>/on-soft. Card states: primary, info, warning, dismissed.
Note: "Dismissal is remembered per id, so change the id when the message changes."
```

**Build this.** `dismissible`: default `false`. The type requires `id` with it.
`onDismiss?: () => void`. When it is set, `Banner` renders `BannerShell` from
`client.tsx` in place of its own `<div>`, with the same attributes and children plus a
last child: a `<button type="button">` with `ICON_BUTTON` and `HOVER.soft`, named by
`labels.banner.dismiss`. `useBannerDismiss(id)` in `hook.ts` reads and writes
`localStorage` under `tc-banner-dismissed:<id>` through `useSyncExternalStore`, with a
server snapshot of `false`, and falls back to memory when storage throws. Dismissed, the
shell renders nothing.

- **Mutation.** The hook stops reading the stored value.
- **Not built:** `sticky`, `placement`, `variant`.
- **For the reviewer:** the frame says "always dismissible"; the default is `false`, so a
  plain banner stays at 0 KB. A visitor who dismissed it sees it again on each page until
  the script runs.

## Notes

```text
Source: file BxRSdAVOhk9Hj3Tkq4tjcy, read-only, 22 plugin calls on 2026-10-09. "bound" (written "->") means a Figma variable is attached; "raw" means a typed number.
None of the fourteen is a component set, except Tag (89:608) and Avatar (90:630), which Unit 2 covers. The other twelve are plain frames.
Docs sections (133:148): Toast is under "Feedback" ("Status, progress and empty states. Toast and Progress announce themselves to screen readers; the rest stay silent."). Dialog, Drawer, Popover, Tooltip, Dropdown menu and Command palette are under "Overlays" ("Overlays share one scroll rule: the overlay scrolls, the page behind it does not. Placement is logical, so it mirrors in Arabic."). Navbar, Sidebar, Tabs, Accordion, Breadcrumb and Pagination are under "Navigation" ("Links are links. Every one of these renders a real <a href>, so middle-click, open in a new tab and crawlers all work."). meta.ts takes its category from docs/PLAN.md section 18, not from these.
What is bound: every fill, stroke and text color; the radius of the Popover, Toast, Menu, Command and Accordion boxes (Knobs radius/box); the radius of most panels in the docs cards; the height and radius of the "Button sm" frames in the Dialog footer. Everything else is raw: every padding, gap, row height, width, stroke weight and shadow.
Shadows are raw everywhere: 0 8 24 black at 0.12 on the Components page, 0 8 20 at 0.45 (0 6 16 at 0.4 on Toast) in the docs cards, which are drawn dark. The file has no effect style.
Highlighted and current rows always use primary/soft with primary/on-soft: Dropdown, Command, Sidebar.
Focus is always a 2 px rectangle -> base/ring, 4 px outside the element.
Modes and directions: none of the fourteen is in the Modes frame (84:261: Button, Checkbox, Input, Badge, Alert, Card) or the Direction frame (86:276: Breadcrumb, Button, Input, Alert, Pagination). "Docs site - RTL" has three cards: button, input, pagination. No overlay is drawn in Dark, in Ocean or in Arabic. Found by layer name only.
Page: Provider (193:2659). The layout sample passes direction and locale and nothing else. "What it renders" (193:2890): "Direction provider - Popups read the direction from here, so a Select opens on the correct side in Arabic." "Toast viewport - One live region, positioned by direction, with the safe-area padding." "Tooltip provider - A shared delay, so the second tooltip opens at once." "Isolation root - A div with isolation: isolate, so overlays stack above your page without z-index conflicts." The props table lists direction, locale, labels, numberingSystem, adaptive and collection.
Page: Accessibility (183:1877). "Every interactive element is at least 24 by 24 CSS pixels, and grows to 44 on touch and other coarse pointers." "WCAG 2.5.7. A Slider takes arrow keys. A Drawer and a Toast always render a close button. A sortable list has move up and move down buttons." "Keyboard behaviour - A browser test per component, following the ARIA Authoring Practices - Every CI run". "Known gaps: Nothing has been tested yet."
Connectors that will consume these (Page: Connectors): AdaptiveMenu (397:1860, "A dropdown on desktop, a bottom sheet on a phone. Same items, same code."), AdaptiveDialog (402:2026), AdaptivePopover (402:2334), AdaptiveTooltip (402:2180), AdaptiveSidebar (403:2228, "A fixed sidebar on desktop, a drawer from the start edge on a phone."), AdaptiveNav (403:2382), AdaptiveTabs (404:2430). None is built in this unit.
Every install row prints "import { <Name> } from '@/topclassui/components/<slug>'" with a bare name, and every sample imports the flat parts from 'topclassui/<slug>'. The Changelog settled this for Tooltip: the flat names are right.
Samples import Text, Link, Icon and next/link. Text and Link do not exist in src/. In demos use plain elements, Button, and Svg with a per-icon import.
The Accessibility page prints TOUCH_TARGET as rem classes and FOCUS_RING with outline-none. src/shared/classes.ts differs from both on purpose (px tokens, outline-hidden).
```

Read in the built JavaScript of Base UI 1.8.0, where the types are silent. Not run:

- `internals/constants.js`: a menu's collision default is `{ fallbackAxisSide: 'none' }`;
  a popover's and a tooltip's is `{ fallbackAxisSide: 'end' }`.
- `internals/useAnimationsFinished.js` waits for every animation `getAnimations()`
  returns. So a transition on `translate` alone is awaited too; `docs/PLAN.md` 5.8 says
  only opacity is.
- `toast/store.js`: a timer is set only when `type` is not `'loading'` and the duration is
  above 0, and `promise` sets the types `'loading'`, `'success'` and `'error'`.
- `toast/viewport/ToastViewport.js`: `role="region"`, `aria-live="polite"` and an
  `aria-label` of "Notifications" that a prop replaces.
- `drawer/viewport/DrawerViewport.js`: a mouse press inside `Drawer.Content` does not
  start a swipe, a touch is weighed against the scrollable element under it, and any
  element with `data-base-ui-swipe-ignore` opts out.

## Build order

1. **The shared pull requests**, once Unit 2 is merged. `fix/readme-part-family` and 1, 2,
   4, 5, 6, 7 and 8 can be open together. 3 follows 2. Nothing below starts before 1, 2, 4
   and 6 are merged.
2. **Dialog, alone, and stop for review.** It settles what every later overlay copies: the
   portal, backdrop, viewport and popup in one part, the Header, Body and Footer names,
   the built-in x, and the first `e2e/<slug>.spec.ts` with its helpers.
3. **Then three or four at a time.** First Drawer, Popover, Tabs and Accordion. Then
   Dropdown, Navbar and Sidebar. Drawer follows Dialog because it shares its store and
   its scroll rules. Dropdown needs 7. Navbar needs the scroll-padding rule of 4. Drawer,
   Navbar and Sidebar need the labels of 5, as Toast, Command and Part 2 do.
4. **Toast, alone,** once 8 is merged: it is the only branch that edits
   `src/shared/provider/provider.tsx`.
5. **Command, last and alone.** It is the only one that renders a collection, and the
   riskiest.
6. **Part 2** can run beside steps 3 to 5, each after its Unit 2 half is merged: Rating,
   Tag, Avatar, Banner.

## Choices for Omar

Every row has a default above, so nothing here blocks the build.

| # | Choice | Built as | The other option |
|---|---|---|---|
| 1 | Who mounts the toast viewport | `TopClassProvider`, as PLAN 18.8 and the Provider page say; it imports Toast, so Toast ships with the base | the app mounts `<ToastViewport />` in its layout; the provider imports no component and an app with no toast pays nothing |
| 2 | Toast settings | one new provider prop, `toast={{ placement, limit, duration }}` | fixed defaults and no prop |
| 3 | The isolation root | a real box, as PLAN 10.2: one more `<div>` between `body` and the app | keep `display: contents`, where it isolates nothing, and rely on the z tokens |
| 4 | Names | folders `dropdown` (exports `DropdownMenu` and `Dropdown*` parts) and `command` (exports `Command`), as the samples and the CLI rows write them | `dropdown-menu` and `command-palette`, as the card titles and CLOUD-PLAN do |
| 5 | AlertDialog | not built; a confirm is a Dialog with `disablePointerDismissal` | a second component on Base UI `alert-dialog`, with `role="alertdialog"` |
| 6 | The x of a Dialog | in `DialogHeader`, on by default | none, as the code sample; the caller adds `DialogClose` |
| 7 | Dialog widths | 320, 360, 400, 512, 640; only 400 is drawn | Tailwind's named steps, which put `md` at 448 |
| 8 | Drawer `placement` | on `DrawerRoot`, which owns the swipe | on `DrawerPopup`, as the sample; needs the popup to report up |
| 9 | Popover arrow | none: none is drawn | an arrow, as the `showArrow` toggle suggests |
| 10 | Toast stack | a plain column, newest at the edge | the drawn collapsed stack that opens on hover |
| 11 | Toast default tone | `neutral`, no icon | `success`, the playground value |
| 12 | Overlay shadow | Tailwind's `shadow-lg` in every mode | a shadow token per mode; the dark cards draw 0.45 |
| 13 | Menu row height | `--tc-row-height` (40 px), so the row cap is exact | the drawn 31 to 33 px |
| 14 | Dropdown scope | items, links, groups, separators, `DropdownMenu` | add checkbox items, radio items and submenus now; all are drawn |
| 15 | Icons in a menu item | a `ReactNode` | a name, as PLAN 7 and the sample; needs a sync icon lookup |
| 16 | Command position | near the top, so it does not jump | centered, as the playground says |
| 17 | Tabs indicator | a border on the active tab | Base UI's sliding indicator, which is positioned with physical variables |
| 18 | Accordion motion | a fade | a height animation, against PLAN 5.8 |
| 19 | Navbar offset | measured in the browser after hydration | a fixed height in CSS, right before any script and wrong when the bar wraps |
| 20 | Sidebar link | `icon` prop and a label that stays for screen readers when collapsed | the icon inside children, as the sample |
| 21 | The half star | a filled star clipped at half, no new icon | a `star-half` icon, the 85th, and directional |
| 22 | Editing a Rating | the same `Rating` with `readOnly={false}` | a second export |
| 23 | A removable Tag | passing `onRemove` shows the button | a `removable` boolean beside it |
| 24 | Banner | `dismissible` off by default; hides after hydration | on by default, as the frame says; an inline script that hides it before paint |
| 25 | The live harness | a Vite server from `vitest/node`, no new dependency | `esbuild` as a dev dependency and static bundles |
| 26 | A menu link in Next.js | an item takes `render: <Link href="/profile" />` and navigates on the client | `href` only: a plain anchor, which loads the whole page in Next.js |
| 27 | The image of an Avatar | a client part: a broken image falls back to the initials, and every avatar with an image hydrates | stays server HTML at 0 KB; a broken image shows the browser's broken mark and its `alt` |
| 28 | A very long menu | the row cap only; every item is mounted | windowing, as PLAN 8.5 says; Base UI's Menu cannot reach a row that is not mounted |

## Where this file departs from docs/PLAN.md

The local session records these as one `docs/DECISIONS.md` entry once Omar has answered
the choices, before any Unit 3 branch opens. No component branch edits that file.

- AlertDialog (18.5, Phase 5) is not built: it is not among the 46.
- `MenuContract` (11.3): `icon` is a `ReactNode`, an item has a fourth kind, `render`, and
  `size` is left out.
- A Dropdown is not windowed (8.5).
- The toast stack is a plain column, not the collapsed stack of 10.3.
- A Drawer swipes from the whole sheet, not from a handle, and has no snap points (10.5).
- An enter and exit transition may animate `translate` too (5.8).
- The isolation root has a box, as 10.2 draws it; today it has none.
- New infrastructure, which Phases 4 to 7 forbid without a record: the live harness, the
  render-trigger helper, the menu contract and the toast manager.
- Overlays use the native scrollbar; `ScrollArea` (10.5, rule 6) is not built.

Outside Unit 3, noticed while reading: `TopClassProvider` isolates nothing today (row 3);
`docs/PLAN.md` 10.5 describes a Drawer handle that Base UI 1.8.0 does not have; and
`unit-2.md` asks for a `star-half` icon the design never draws.
