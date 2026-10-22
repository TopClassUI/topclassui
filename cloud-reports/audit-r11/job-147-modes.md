# Job 147: every card, the catalog and the search palette in light and ocean

Branch fix/r11-light-ocean. Base preview/r8-all. Each row compares the dark Figma Previewer frame (file BxRSdAVOhk9Hj3Tkq4tjcy, ids from review-notes/figma-audit/previewer-frames.json) with the light and ocean builds, en, 1440 px. Text contrast was measured directly in en and ar (canvas-resolved colours composited over every ancestor background), because axe's color-contrast rule cannot parse oklch or lab and left 854 nodes incomplete. Contrast results: no text below 4.5:1 (3:1 for large text), and no dark surface except the intended neutral-solid ones (CodeBlock, the Tooltip, the solid Badge), across all 49 card pages, the catalog, the open search palette and the seven guides, in light and ocean, en and ar.

Status: **fixed** = fixed on this branch through the site tokens. **ok** = nothing mode-specific is wrong. **Figma** = Ocean draws it this way (Knobs radius Ocean 100); it stays, and it goes to Omar. **named** = the fix belongs to another job or to the library, which is closed this round. Composites: docs/figma/parity/site-modes-<slug>.png.

## Ocean's radius knob (item 1)

Figma Knobs, Light / Dark / Ocean: radius/base 8/8/100, radius/control 8/8/100, radius/box 12/12/28, radius/chip 4/4/100. The Checkbox box is bound to radius/chip, and Input, Select, Combobox and Textarea are bound to radius/control. The Modes frame 84:261 ("Ocean also swaps the radius knob, which is why every corner becomes a pill") draws the Ocean checkbox as a circle and the Ocean search field as a pill. The build matches Figma. docs/figma/unit-4.md, Choices for Omar row 12 records it: built as "rounded-chip, as bound: 8 px in Ocean, so small boxes are circles"; the other option is "capped at a quarter of the box, so it never looks like a radio". Row 13 records pill fields. **Not changed: this is Omar's choice.** If he takes row 12's other option, the change is one library knob for the checkbox radius in tokens.css, about min(var(--radius-chip), 25% of the box).

## Rows

| Card | Light | Ocean | Status |
|---|---|---|---|
| catalog | tints, lines and drops hold on white | Before you start code boxes were discs that clipped their letters | **fixed** (57a08f98: .docs-flat-code and .docs-box take min(--radius-control, --radius-box)) |
| search palette | ok, AA in en and ar | ok, radius capped | ok |
| install row (every card) | ok | the multi-line Then import it field was a stadium | **fixed** (c72e0ae2) |
| icons guide tiles | ok | already boxes on the tip | **already fixed** upstream; held by the c72e0ae2 e2e |
| Arabic body and catalog font (AR 1) | body, h1 and p computed Inter on /ar | the same | **fixed** (ebe24d6f) |
| accordion | ok | outline items are pills, as Figma's radius/control | ok, Figma |
| alert | soft tints visible on white, AA | ok | ok |
| avatar | ok | ok | ok |
| avatar-group | ok | ok | ok |
| badge | soft tints visible, outline lines hold | pills, as radius/chip | ok, Figma |
| banner | ok | ok | ok; the states strip's opacity-40 "hidden" cell fails axe color-contrast in every mode (0bb543b0), named for the Banner owner |
| breadcrumb | ok | ok | ok |
| button | ok | pills | ok, Figma |
| card | ok, the outline line holds | box radius 24 px (the library caps Figma's 28) | ok |
| checkbox | ok | every box is a circle and reads as a radio | **Figma** (84:261, unit-4 row 12), for Omar |
| code-block | the dark box on white, as S3 | the pill knob rounds the box ends | ok; the CodeBlock radius in Ocean is the library's rounded-box |
| combobox | ok | pill fields | ok, Figma |
| command | ok | ok | ok |
| date-picker | ok | pill trigger | ok, Figma |
| dialog | the stage was a mid-grey block: the library's 30 % black over white | the same | **fixed** (08d0a700: scrim 12 % black in light and ocean inside a card, 40 % kept in dark) |
| drawer | the page side of the stage is a solid grey with no bars; with the new scrim it is a light grey | the same | **fixed** the scrim (08d0a700); **named**: the Drawer stage draws no page bars (the dark frame has four), for the Drawer stage owner (144) |
| dropdown | the open, hover and disabled state cells render empty (their menus are visibility hidden, 14 px tall) | the same | **named**: the same in dark, a states-strip bug, not a mode one |
| empty-state | the dashed line holds on white | ok | ok |
| field | ok | pill input | ok, Figma |
| file-upload | dashed zone holds | ok | ok |
| form | ok | pill input and button | ok, Figma |
| input | ok | pills | ok, Figma (unit-4 row 13) |
| kbd | ok | ok | ok |
| meter | ok | ok | ok |
| navbar | ok | ok | ok |
| number-field | ok | pill | ok, Figma row 13 |
| otp-field | ok | the cells are circles | ok, Figma row 13 |
| pagination | ok | ok | ok |
| popover | the open and flipped state cells show only their triggers | the same | **named**: states strip, every mode |
| progress | the track holds on white | ok | ok |
| radio-group | ok | ok | ok |
| rating | stars take a deep amber on white (bright amber is about 2:1 on white; 3:1 is the floor for icons) | the same | ok |
| segmented-control | ok | the track is a pill | ok, Figma row 13 |
| select | ok | pill trigger | ok, Figma |
| separator | the line is faint, as it is decorative and exempt | ok | ok |
| sidebar | ok | the active row is a pill | ok, Figma |
| skeleton | ok | the rect and card shapes are pills (rounded-control); the frame's rect is a box | **named**: the library skeleton rect and card should take --radius-box; the library is closed this round |
| slider | ok | ok | ok |
| spinner | ok | ok | ok |
| stepper | ok | ok | ok |
| switch | ok | ok | ok |
| table | ok | ok | ok |
| tabs | ok | ok | ok |
| textarea | ok | 62-82 px tall stadiums (radius/control 100 in Figma: the same binding) | **Figma** row 13, for Omar: a multi-line box at 9999 px |
| timeline | ok | ok | ok |
| toast | ok, the drop shadow is light enough on white | ok | ok |
| tooltip | the top and bottom state cells show only arrows | the same | **named**: states strip, every mode |
| tree-view | ok | ok | ok |

## Gates and known reds

Red on the preview tip itself, not caused by this branch, measured with and without its changes: catalog, preview-route and mobile e2e (the banner states cell's opacity-40 color-contrast, the toast stage 372 > 326 px and the alert stage at 360 and 390 px), and component-pages banner in every mode.
