# The starter icon set

Eighty icons, one merged path each, `viewBox="0 0 256 256"`. They exist as components on the **Icons** page of the Figma file and are the exact list `packages/icons/raw/` carries in Phase 2 (PLAN.md section 7, Phase 2).

Source, MIT licensed:

- regular weight - `https://raw.githubusercontent.com/phosphor-icons/core/main/assets/regular/<name>.svg`
- the three solid variants - `https://raw.githubusercontent.com/phosphor-icons/core/main/assets/fill/<name>.svg`

## Which icons flip in RTL

Sixteen of the eighty. `arrow-*`, `caret-*` and `chevron-*` are matched by pattern; the rest are the manual list that `icons:build` reads from here.

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

**Status and feedback** (11) - `bell` `bell-slash` `check-circle` `circle-notch` `info` `prohibit` `question` `spinner` `warning` `warning-circle` `x-circle`

**Objects and places** (34) - `book-open` `calendar-blank` `circle` `clock` `code` `dots-six-vertical` `dots-three` `dots-three-vertical` `envelope-simple` `eye` `eye-slash` `file` `folder` `gear` `github-logo` `globe` `heart` `house` `image` `list` `lock-open` `lock-simple` `monitor` `moon` `paper-plane-tilt` `pause` `play` `sidebar-simple` `sign-out` `star` `sun` `terminal-window` `user` `users`

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

## Rules this set has to keep

- One path per icon. A multi-path or `<circle>`/`<rect>` icon does not survive the `path` field of `IconData`; convert it in `raw/` first.
- `currentColor` fill, no stroke. In Figma the fill is bound to the `base/body` variable, which is the same thing.
- Size takes the five names (`xs` 16, `sm` 20, `md` 24, `lg` 32, `xl` 40) or any CSS length. The default is `1em`, not `md`, so an icon with no `size` matches the text beside it (R-5.7-2).
- Adding an icon means adding its SVG to `raw/` and rerunning `pnpm icons:build`; the Figma page is updated in the same change, because Figma is the parity gate (PLAN.md 6.6).
