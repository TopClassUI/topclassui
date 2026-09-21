# The starter icon set

Sixty-two icons, Phosphor `regular` weight, one merged path each, `viewBox="0 0 256 256"`. They exist as components on the **Icons** page of the Figma file and are the exact list `packages/icons/raw/` carries in Phase 2 (PLAN.md section 7, Phase 2).

Source: `https://raw.githubusercontent.com/phosphor-icons/core/main/assets/regular/<name>.svg`, MIT.

## Which icons flip in RTL

Thirteen of the sixty-two. `arrow-*`, `caret-*` and `chevron-*` are matched by pattern; the rest are the manual list that `icons:build` reads from here.

**Manual list:** `sign-out`, `paper-plane-tilt`, `sidebar-simple`.

Everything not in this table never flips, including `magnifying-glass`, `check`, `clock` and `translate`.

| Flips | Why |
|-------|-----|
| `arrow-down` `arrow-left` `arrow-right` `arrow-u-up-left` `arrow-up` | direction of travel |
| `caret-down` `caret-left` `caret-right` `caret-up` `caret-up-down` | disclosure and sort direction |
| `sign-out` | the arrow leaves through a door on the reading-end side |
| `paper-plane-tilt` | send points forward |
| `sidebar-simple` | the sidebar sits on the reading-start side |

## The set

**Arrows and carets** (10) - `arrow-down` `arrow-left` `arrow-right` `arrow-u-up-left` `arrow-up` `caret-down` `caret-left` `caret-right` `caret-up` `caret-up-down`

**Actions** (17) - `arrows-clockwise` `check` `copy` `download-simple` `funnel` `link-simple` `magnifying-glass` `minus` `palette` `paper-plane-tilt` `paperclip` `pencil-simple` `plus` `translate` `trash` `upload-simple` `x`

**Status and feedback** (9) - `bell` `check-circle` `circle-notch` `info` `question` `spinner` `warning` `warning-circle` `x-circle`

**Objects and places** (26) - `calendar-blank` `clock` `code` `dots-three` `dots-three-vertical` `eye` `eye-slash` `file` `folder` `gear` `globe` `heart` `house` `image` `list` `lock-simple` `moon` `pause` `play` `sidebar-simple` `sign-out` `star` `sun` `terminal-window` `user` `users`

## Rules this set has to keep

- One path per icon. A multi-path or `<circle>`/`<rect>` icon does not survive the `path` field of `IconData`; convert it in `raw/` first.
- `currentColor` fill, no stroke. In Figma the fill is bound to the `base/body` variable, which is the same thing.
- Size takes the five names (`xs` 16, `sm` 20, `md` 24, `lg` 32, `xl` 40) or any CSS length. The default is `1em`, not `md`, so an icon with no `size` matches the text beside it (R-5.7-2).
- Adding an icon means adding its SVG to `raw/` and rerunning `pnpm icons:build`; the Figma page is updated in the same change, because Figma is the parity gate (PLAN.md 6.6).
