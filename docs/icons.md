# The starter icon set

Eighty-four icons, one merged path each, `viewBox="0 0 256 256"`. They exist as components on the **Icons** page of the Figma file and are the exact list `packages/icons/raw/` carries in Phase 2 (PLAN.md section 7, Phase 2).

Source, MIT licensed:

- regular weight - `https://raw.githubusercontent.com/phosphor-icons/core/main/assets/regular/<name>.svg`
- the three solid variants - `https://raw.githubusercontent.com/phosphor-icons/core/main/assets/fill/<name>.svg`

## Which icons flip in RTL

Sixteen of the eighty-four. `arrow-*`, `caret-*` and `chevron-*` are matched by pattern; the rest are the manual list that `icons:build` reads from here.

**Manual list:** `sign-out`, `paper-plane-tilt`, `sidebar-simple`.

Everything not in this table never flips, including `magnifying-glass`, `check`, `clock`, `sort-ascending` and `translate`. Sorting is not a direction: the arrow means high-to-low, which is the same in both scripts.

| Flips | Why |
|-------|-----|
| `arrow-down` `arrow-left` `arrow-right` `arrow-u-up-left` `arrow-up` | direction of travel |
| `arrow-square-out` | points away from the reading-end corner |
| `caret-down` `caret-left` `caret-right` `caret-up` `caret-up-down` | disclosure and sort direction |
| `caret-double-left` `caret-double-right` | first and last page |
| `sign-out` | the arrow leaves through a door on the reading-end side |
| `paper-plane-tilt` | send points forward |
| `sidebar-simple` | the sidebar sits on the reading-start side |

## The set

**Arrows and carets** (13) - `arrow-down` `arrow-left` `arrow-right` `arrow-square-out` `arrow-u-up-left` `arrow-up` `caret-double-left` `caret-double-right` `caret-down` `caret-left` `caret-right` `caret-up` `caret-up-down`

**Actions** (19) - `arrows-clockwise` `check` `command` `copy` `download-simple` `funnel` `link-simple` `magnifying-glass` `minus` `palette` `paperclip` `pencil-simple` `plus` `sort-ascending` `sort-descending` `translate` `trash` `upload-simple` `x`

**Status and feedback** (13) - `asterisk` `bell` `bell-slash` `check-circle` `circle-notch` `info` `prohibit` `question` `spinner` `tray` `warning` `warning-circle` `x-circle`

**Objects and places** (36) - `book-open` `calendar-blank` `circle` `clock` `code` `dots-six-vertical` `dots-three` `dots-three-vertical` `envelope-simple` `eye` `eye-slash` `file` `file-text` `folder` `folder-open` `gear` `github-logo` `globe` `heart` `house` `image` `list` `lock-open` `lock-simple` `monitor` `moon` `paper-plane-tilt` `pause` `play` `sidebar-simple` `sign-out` `star` `sun` `terminal-window` `user` `users`

**Solid variants** (3) - `circle-fill` `heart-fill` `star-fill`

## Why the solid three exist

An outline and a solid of the same shape are the clearest way to show an on and off state, and the outline alone cannot express it: Phosphor's regular `star` is a drawn outline, so filling it in CSS is not possible. Rating needs `star` and `star-fill`; a favorite toggle needs `heart` and `heart-fill`; a selected radio needs `circle-fill` for its inner dot. Nothing else in the set has a solid twin, and nothing else should get one without a component that needs it.

## What each addition is for

| Icon | Needed by |
|------|-----------|
| `star-fill` | Rating - a filled star is the whole component |
| `circle-fill` | RadioGroup - the selected inner dot |
| `heart-fill` | a favorite toggle in the demos |
| `caret-double-left` `caret-double-right` | Pagination - first and last page |
| `sort-ascending` `sort-descending` | Table and DataTable column sorting |
| `dots-six-vertical` | drag handles: Resizable, sortable rows, the Drawer grabber |
| `monitor` | ThemeSwitcher - the third option next to `sun` and `moon` is "system" |
| `arrow-square-out` | any link that leaves the site |
| `prohibit` | a disabled or blocked state |
| `lock-open` `bell-slash` | the off half of `lock-simple` and `bell` |
| `circle` | an unselected radio, and a generic status dot |
| `envelope-simple` | form demos |
| `command` | the Command palette and `Kbd` |
| `github-logo` `book-open` | the docs header and its navigation |
| `tray` | the `empty` state of the state contract (8.2), which every collection component renders |
| `folder-open` `file-text` | TreeView - an expanded node and a leaf; `folder` alone only covers the closed node |
| `asterisk` | the required marker on `Field`, on every required control |

## Deliberately not in the set yet

An audit of the tier-1 catalog and the docs site against this list proposed about ninety more. They were left out because no tier-1 component needs them to render a documented state, and adding an icon later costs one SVG file and one `pnpm icons:build`. The ones most likely to be wanted first, so the search does not have to happen twice:

- **Docs site:** `package` (npm link), `keyboard` (the keyboard table), `tag` and `clock-counter-clockwise` (versions and changelog), `hash` (heading anchors), `sliders-horizontal` (the page controls), `list-dashes` (table of contents), `text-align-left` and `text-align-right` (the direction switcher), `browser` and `hard-drives` (the server/client breakdown), `compass` (404).
- **States with no contract entry yet:** `wifi-slash` (offline), `bug` (ErrorBoundary), `image-broken` (failed media), `lightbulb` and `warning-octagon` (Alert tones).
- **Tier 3:** `arrows-out`, `arrows-in`, `magnifying-glass-plus`, `magnifying-glass-minus` (Lightbox), `eyedropper` (ColorPicker), `cloud-arrow-up` (Dropzone), `star-half` (half ratings), `columns` and `rows` (DataTable density and column visibility).

Add any of them the moment a component in a phase actually needs it, and update the Figma page in the same change.

## Rules this set has to keep

- One path per icon. A multi-path or `<circle>`/`<rect>` icon does not survive the `path` field of `IconData`; convert it in `raw/` first.
- `currentColor` fill, no stroke. In Figma the fill is bound to the `base/body` variable, which is the same thing.
- Size takes the five names (`xs` 16, `sm` 20, `md` 24, `lg` 32, `xl` 40) or any CSS length. The default is `1em`, not `md`, so an icon with no `size` matches the text beside it (R-5.7-2).
- Adding an icon means adding its SVG to `raw/` and rerunning `pnpm icons:build`; the Figma page is updated in the same change, because Figma is the parity gate (PLAN.md 6.6).
