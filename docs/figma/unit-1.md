# Figma facts for Unit 1

What the design file says about the ten Unit 1 components: Badge, Spinner, Skeleton,
Separator, Kbd, Alert, EmptyState, Progress, Card and Tooltip.

**Read this instead of Figma.** A session with no Figma access has no other design input,
and this file is everything it needs.

- **Source.** File `BxRSdAVOhk9Hj3Tkq4tjcy`, read on 2026-10-07 by a read-only scout in 19
  calls. Text facts only, no screenshots.
- **Not independently verified.** One agent read it once. Where it disagrees with the code,
  the code's tokens win for values and this file wins for structure and intent.
- **"bound"** means a Figma variable is attached; **"raw"** means a typed number with none.
  A raw number is a drawing, not a decision: map it to the nearest token, do not copy it.
- **The "Surprising" lines are the valuable ones.** Each is a place where the design
  contradicts itself or the code. Resolve it in `docs/DECISIONS.md`; do not pick silently.
- The last section, **Notes**, holds the shared size scale, the knobs in all three modes
  and the cross-cutting disagreements, including the Ocean radius mismatch.

## Badge

```text
Where: page Components. COMPONENT_SET "Badge" 89:457 (18 variants). Also a plain documentation FRAME "Badge" 69:95 (variant x tone grid plus a "sizes" row 69:177) and the docs card FRAME "Previewer: Badge" 137:319 on page Docs pages.
Variant properties (set): variant = solid | soft | outline; tone = primary | neutral | success | warning | danger | info. No size property, no state property. Default variant: variant=solid, tone=primary (89:405).
Default variant: 67 x 29, horizontal auto-layout, hugs both axes, centered both ways.
- padding top/bottom 6 -> Size padding-y/md (bound); padding left/right 12 -> raw, NOT bound
- item spacing 0 in the set; the frame copies bind it to Size gap/<size>; the previewer copies use raw 4
- corner radius 4 on all four corners -> Knobs radius/chip (bound; Light 4, Dark 4, Ocean 100)
- no height variable: height is hug (text box + padding)
- fill -> Semantic primary/solid; no stroke
- text "Badge": Inter Medium 14, line height Auto (17 px box), font size -> Size font-size/md (bound), no text style, fill -> Semantic primary/on-solid
Per variant (identical for all six tones):
- solid: fill <tone>/solid, text <tone>/on-solid
- soft: fill <tone>/soft, text <tone>/on-soft
- outline: no fill, stroke <tone>/on-soft, weight 1 raw (inside), text <tone>/on-soft; measures 69 x 31, so the stroke adds 1 px per side to the box
Sizes (frame 69:177 only; drawn soft + primary as plain frames, not variants):
 size | box   | py (bound)      | px (raw) | gap (bound) | font size (bound)
 xs   | 45x19 | 2 padding-y/xs  | 4        | 4 gap/xs    | 12 font-size/xs
 sm   | 59x25 | 4 padding-y/sm  | 8        | 6 gap/sm    | 14 font-size/sm
 md   | 67x29 | 6 padding-y/md  | 12       | 8 gap/md    | 14 font-size/md
 lg   | 81x35 | 8 padding-y/lg  | 16       | 8 gap/lg    | 16 font-size/lg
 xl   | 95x42 | 10 padding-y/xl | 20       | 12 gap/xl   | 18 font-size/xl
 Radius is Knobs radius/chip and weight is Medium at every size.
Children: one TEXT layer named "Badge". The docs code sample also puts an icon first: <Badge tone='success' variant='soft'><Icon name='check-circle' />Paid</Badge>.
States: none drawn. The previewer's "Every state" panel says "3 states" and they are the three variants. No hover, focus or disabled.
Docs previewer: chip "server - 0 KB". Playground controls: variant (soft), tone (primary), size (md), and toggles dot, uppercase, truncate. Note under the code: "Badge has no ARIA role: the text must carry the meaning, color alone never does."
Surprising:
- Horizontal padding is raw and equals 2 x padding-y (4/8/12/16/20). It is not Size padding-x/<size> (8/12/16/20/24).
- Size is not a variant axis in the set. dot, uppercase and truncate are named in the playground but drawn nowhere.
- The Modes frame (84:261) draws a Badge with a 12 px label at md padding (69x27), which matches no row of the size table.
- Ocean: Figma radius/chip = 100, a full pill (frame text: "Radius comes from radius/chip, so Ocean makes them full pills"). src/styles.css has --radius-chip: min(calc(var(--tc-radius) * 0.5), 0.5rem), which caps at 8 px in Ocean. The two disagree.
```

## Spinner

```text
Where: page Components, plain FRAME "Spinner" 69:283. No COMPONENT_SET, no variant properties. Docs card "Previewer: Spinner" 137:2234 on Docs pages.
Structure: FRAME "Spinner" (horizontal auto-layout, hug, centered, padding 0, gap 0, no fill, no stroke) holding one INSTANCE of icon/circle-notch, whose single Vector carries the color.
Sizes (instance width and height both bound to Size icon/<size>):
 xs 16x16 -> icon/xs | sm 20x20 -> icon/sm | md 24x24 -> icon/md | lg 32x32 -> icon/lg | xl 40x40 -> icon/xl
Color: Vector fill -> Semantic base/muted on the Components page; Semantic primary/on-soft in the docs previewer (playground tone = primary).
Radius, stroke, padding, text: none.
States: none drawn. The previewer's "5 states" are the five sizes. No rotation frame, no arc: the drawing is the static icon.
Docs previewer: chip "server - 0 KB". Head text: "A spinner is an icon, so it uses the icon sizes and follows the text it sits in." Playground: size (md), tone (primary), toggles label, centered, overlay. Stage shows 20, 24, 32 and 40.
Code sample: <Spinner size='lg' /> next to <Text muted>Building your preview</Text>. Note: "Prefer Skeleton when the final shape is known; Spinner is for unknown waits."
Frame description: "One icon, five sizes. It uses icon/<size>, the same scale as Icon, because a spinner is an icon."
Surprising:
- The default color differs between the two pages (base/muted vs primary/on-soft).
- label, centered and overlay are named in the playground but not drawn.
- The scale is the icon scale (16/20/24/32/40), not the control scale.
```

## Skeleton

```text
Where: page Components, plain FRAME "Skeleton" 69:324. No COMPONENT_SET, no variant properties. Docs card "Previewer: Skeleton" 137:916.
Every shape is one FRAME "Skeleton": fill -> Semantic neutral/soft, no stroke, clips content, no children. Sizes and radii are all raw; nothing is bound except the fill.
Components page shapes:
- text line 200 x 14, radius 4
- avatar 40 x 40, radius 20
- card 200 x 80, radius 12
Docs previewer stage: circle 44 x 44 (radius 22) beside three lines 220 / 180 / 140 wide, 10 tall, radius 4, line gap 8, row gap 16.
Docs previewer states ("4 states"):
- text: two lines 110 x 8 and 84 x 8, radius 4, gap 6
- circle: 36 x 36, radius 18
- rect: 110 x 40, radius 6
- card: 110 x 46, radius 10
Docs previewer: chip "server - 0 KB". Playground: variant (text), lines (3), toggles animate, rounded.
Code sample: <Suspense fallback={<Skeleton rows={5} />}>. Note: "Give the skeleton the real dimensions; rows is clamped, and a mismatch is layout shift."
Frame description: "The placeholder every component ships with, so a page holds its shape while it loads. Fill is neutral/soft."
Surprising:
- The prop name disagrees inside Figma: the playground says "lines", the code sample says "rows".
- No shimmer or pulse is drawn; "animate" exists only as a toggle label.
- Radii are raw. 4 and 12 equal the Light values of radius/chip and radius/box, but they are unbound, so they do not change in Ocean in Figma. 6 and 10 match no knob.
- Line height varies by drawing (14, 10, 8); there is no size scale.
```

## Separator

```text
Where: page Components, plain FRAME "Separator" 69:313. No COMPONENT_SET, no variant properties. Docs card "Previewer: Separator" 137:815.
Structure: one FRAME "Separator" with a fill and no children. It is a filled 1 px box, not a stroke.
- horizontal: 200 x 1, fill -> Semantic base/line
- vertical: 1 x 80, fill -> Semantic base/line
- thickness 1 is raw; the description says "at border/width" but Knobs border/width is not bound
- no radius, no padding, no stroke
Docs previewer stage: a 300 x 1 line, then a labelled one: line 120 x 1, text "or", line 120 x 1, gap 10.
Docs previewer states ("3 states"): horizontal 110 x 1; vertical 1 x 40; with label (40 x 1, "or", 40 x 1, gap 8).
Label text: Roboto Mono Regular 10 (9 in the states cell), line height Auto, fill -> Semantic base/muted, no text style.
Docs previewer: chip "server - 0 KB". Playground: orientation (horizontal), spacing (md), toggles withLabel, decorative.
Code sample: <Separator /> and <Separator orientation='vertical' /> inside a row with className 'flex h-5 items-center gap-3'. Note: "A vertical Separator takes its height from the row; give the row a height or stretch."
Frame description: "One hairline, base/line, at border/width. It is decorative, so it is exempt from the 3:1 contrast rule."
Surprising:
- "spacing" is a playground control with no drawing; no margin is drawn around the line.
- The labelled form exists only in the docs previewer, not on the Components page.
- The label is drawn in the mono font at 9-10 px, below the smallest step of the type scale (12).
```

## Kbd

```text
Where: no frame of its own. Drawn inside FRAME "Code block, Kbd and Avatar group" 83:337 on page Components, where the keys are unnamed "row" frames. The docs card "Previewer: Kbd" 135:411 names them "Kbd". No COMPONENT_SET, no variant properties.
One key: horizontal auto-layout, hugs both axes.
- padding top/bottom 3, left/right 7 (raw); gap 0
- corner radius 4 (raw, not bound to radius/chip)
- stroke -> Semantic base/line-strong, weight 1 (raw, inside)
- fill -> Semantic base/surface on the Components page; Semantic base/surface-raised in the previewer's idle key
- text: Roboto Mono Regular 11, line height Auto (15 px box), fill -> Semantic base/body, no text style
- measured: "K" 23 x 23, "Tab" 36 x 23, "Ctrl" 43 x 23, "Shift" 50 x 23
Combination: keys sit side by side, gap 4 (Components page) or 5 (previewer). No outer wrapper frame and no "+" between keys is drawn.
Only color variables are bound. Radius, padding, stroke weight and font size are raw.
States (previewer, "4 states"):
- idle: fill base/surface-raised
- hover: drawn identical to idle
- active: fill base/surface
- disabled: the whole key group at opacity 0.5
Docs previewer: chip "server - 0 KB". Head: "A keycap; a combo nests one <kbd> per key inside an outer <kbd>, as the HTML spec says." Playground: variant (outline), size (md), toggles pressed, muted, disabled.
Code sample: <Text muted>Press <Kbd><Icon name='command' label='Command' /></Kbd> <Kbd>K</Kbd> to open the command palette.</Text>. Note: "Icon takes no size here: it defaults to 1em and follows the key's own text."
Surprising:
- Only one size is drawn although the playground has size (md); only one variant although it has variant (outline).
- Font size 11 is on neither the Size scale nor the Type scale (both start at 12).
- hover, active and disabled are drawn for an element that is not interactive, and hover has no visual difference.
- The resting fill differs between the two pages (base/surface vs base/surface-raised).
```

## Alert

```text
Where: page Components, plain FRAME "Alert" 74:162. No COMPONENT_SET, no variant properties. Docs card "Previewer: Alert" 137:1708. Also drawn in the Modes frame 84:261 and the Direction frame 86:276.
Drawn matrix: three variants (soft, solid, outline) x four tones (info, success, warning, danger). primary and neutral are not drawn.
Root "Alert": horizontal auto-layout, items top-aligned, width 258 fixed (doc width), height hug (79; outline 81).
- gap 8, padding top/bottom 12, left/right 16 (all raw)
- corner radius 12 -> Knobs radius/box (bound; Ocean 28)
Children in order:
1. INSTANCE icon, 16 x 16: info -> icon/info, success -> icon/check-circle, warning -> icon/warning, danger -> icon/warning-circle
2. FRAME "b": vertical, gap 4, fills the width
   - title: Inter Semi Bold 14, line height Auto (17)
   - description: Inter Regular 14, line height Auto, layer opacity 0.9
3. INSTANCE icon/x, 14 x 14 (dismiss)
Colors (icon, title, description and close all share one color):
- soft: fill <tone>/soft, content <tone>/on-soft
- solid: fill <tone>/solid, content <tone>/on-solid
- outline: no fill, stroke <tone>/on-soft weight 1 (raw), content <tone>/on-soft
No text style on any text.
Docs previewer stage (soft info and soft success): width 340, gap 10, padding 12 / 14, body gap 3, no close icon.
Docs previewer states ("4 states" = the four tones, soft): a compact drawing with padding 8 / 10, icon 14, title only at Semi Bold 12.
Docs previewer: chip "server - 0 KB". Playground: tone (info), variant (soft), size (md), toggles dismissible, withIcon.
Code sample: <Alert tone='warning' icon='warning' title='Your trial ends in three days'>...body...</Alert>. Note: "Not a live region: page content. Announce what just happened with Toast instead."
RTL (Direction frame): the icon sits in a 16 x 16 wrapper FRAME "icon" and moves to the other end; text is right-aligned in Noto Sans Arabic (SemiBold 14 / Regular 12); the box grows from 59 to 82 tall.
Frame description: "Four tones, each with its own icon so the message reads without colour. Success is emerald-700 and info sky-700, both chosen to pass 4.5:1 against white."
Surprising:
- Spacing differs by drawing: gap 8 and padding 12/16 on the Components page; gap 10 and padding 12/14 in the previewer, Modes and Direction.
- Description size differs: 14 on the Components page and previewer stage, 12 in Modes and Direction.
- Only one size is drawn although the playground has size (md). No action buttons are drawn.
- Padding, gap and icon size are raw; only the radius and colors are bound.
- warning/on-solid is dark (neutral/950) while the other on-solid colors are white.
```

## EmptyState

```text
Where: no frame of its own. Drawn as FRAME "EmptyState" inside FRAME "Popover and Empty state" 77:316 on page Components. Docs card "Previewer: EmptyState" 137:2349 (root layer named "e"). No COMPONENT_SET, no variant properties.
Root: vertical auto-layout, children centered, width 340 fixed, height hug (228).
- gap 12, padding 32 on all sides (raw)
- corner radius 12 -> Knobs radius/box (bound)
- fill -> Semantic base/surface
- stroke -> Semantic base/line, weight 1 (raw), dashed 6 / 4
Children in order:
1. INSTANCE icon/tray, 40 x 40, Vector fill -> Semantic base/muted
2. title: Inter Semi Bold 16, line height Auto (19), fill -> Semantic base/body
3. description: Inter Regular 14, line height Auto, centered, fills the width, fill -> Semantic base/muted
4. action: a plain frame, not a Button instance. Padding 8 / 14, gap 6, radius 8 raw, fill -> Semantic primary/solid; icon/plus 14 and label Inter Medium 14, both -> Semantic primary/on-solid
No text style on any text.
Docs previewer stage: gap 10, padding 28, stroke -> Semantic base/line-strong (dashed 6 / 4), icon 36, action padding 7 / 12 with a 12 px label.
Docs previewer states ("4 states"), each an icon above a caption:
- default: icon/tray 24, base/muted, "empty"
- filtered: icon/magnifying-glass 24, base/muted, "no matches"
- error: icon/warning-circle 24, fill -> Semantic danger/on-soft, "failed"
- compact: icon/tray 18, "empty"
Docs previewer: chip "server - 0 KB". Head: "What every collection renders when there is nothing to show." Playground: size (md), variant (dashed), icon (tray), toggles withAction, compact, bordered.
Code sample: <EmptyState icon='tray' title='No invoices yet'> with children <Text muted>...</Text> and <Button size='sm' render={<Link href='/invoices/new' />}>Create an invoice</Button>. Note: "Collections render this for status 'empty'; replace it with emptyFallback."
Surprising:
- The border color differs between the two pages (base/line vs base/line-strong).
- Spacing differs: gap 12 / padding 32 / icon 40 on the Components page; gap 10 / padding 28 / icon 36 in the previewer.
- Only one full-size drawing exists although the playground has size (md). The filtered, error and compact states are drawn only as an icon plus caption.
- Padding, gap and icon size are raw.
```

## Progress

```text
Where: page Components, plain FRAME "Progress" 74:274. No COMPONENT_SET, no variant properties. Docs card "Previewer: Progress" 137:2113.
Structure: track FRAME "Progress" (clips content, fill -> Semantic neutral/soft) with one child bar frame (fill -> Semantic <tone>/solid) at the start edge, same height and radius as the track. No stroke, no padding, no text.
Track width: 220 on the Components page, 280 in the previewer stage, 110 in the state cells (doc widths).
Sizes (Components page, primary, bar at 60%); height and radius are raw, nothing bound:
 xs 4 tall, radius 4 | sm 4 tall, radius 4 | md 6 tall, radius 6 | lg 8 tall, radius 8 | xl 10 tall, radius 10
Tones drawn: primary, success, warning, danger (bar -> <tone>/solid). info and neutral are not drawn.
Values drawn (md): 15%, 50%, 85%, complete (full width, still primary/solid on the Components page).
Docs previewer stage: three 6 px tracks with radius 4: 15% primary, 60% primary, 100% in success/solid.
Docs previewer states ("6 states"):
- empty: a 2 px sliver of bar
- half: 50%, primary/solid
- complete: full, success/solid
- success: full, success/solid
- danger: 40%, danger/solid
- indeterminate: a bar 39 of 110 wide, primary/solid, at the start edge (static drawing)
Docs previewer: chip "server - 0 KB". Head: "A neutral track with a bar in the chosen tone; height follows the spacing scale." Playground: tone (primary), size (md), value (60), toggles indeterminate, showLabel.
Code sample: <Progress value={72} tone='warning' aria-labelledby='storage-label' /> under a <Text id='storage-label' size='sm'>. Note: "It renders no text and clamps value to 0-100, so label it with aria-labelledby."
Frame description: "The track is neutral/soft, the bar is the tone. Height follows padding-y, so it scales with everything else."
Surprising:
- "Height follows padding-y" (2/4/6/8/10), but xs is drawn at 4, the same as sm, and no height is bound to a variable.
- Radius is a full pill on the Components page (radius = height) but 4 on a 6 px track in the previewer.
- "complete" is primary on the Components page and success in the previewer.
- The playground has showLabel while the code note says the component renders no text; no label is drawn.
- The indeterminate bar is a static 35% segment; no motion is specified.
```

## Card

```text
Where: page Components, plain FRAME "Card" 74:126. No COMPONENT_SET, no variant properties. Docs card "Previewer: Card" 137:705 (root layer named "panel"). Also drawn in the Modes frame 84:261.
Root "Card": vertical auto-layout, width 280 fixed (doc width), height hug, clips content.
- gap 0, padding 0 on the root
- corner radius 12 -> Knobs radius/box (bound; Ocean 28)
- fill -> Semantic base/surface-raised
- stroke -> Semantic base/line, weight 1 (raw, inside)
- no shadow or other effect
Three drawings: "card" (120 tall), "card with actions" (164), "card with media" (284).
Parts in order:
1. media (third drawing only): frame 280 x 120, fill -> Semantic neutral/soft, icon/image 32 centered, Vector fill -> Semantic base/muted
2. FRAME "body": vertical, padding 20 on all sides (raw), gap 8, fills the width
   - title: Inter Semi Bold 16, line height Auto (19), fill -> Semantic base/body
   - text: Inter Regular 14, line height Auto, fill -> Semantic base/muted
   - actions row: gap 8, top padding 4, two "Button sm" frames (height -> Size control/sm, radius -> Knobs radius/control, padding left/right 12 raw, gap 6): one primary/solid, one outline with stroke base/line-strong
No text style on any text. No separate header or footer frame and no divider line is drawn.
Docs previewer stage ("panel"): width 300, padding 18, gap 10, same fill, stroke and radius binding.
Docs previewer states ("3 states"):
- idle: fill base/surface-raised
- hover: fill base/surface
- focus-visible: a RECTANGLE "ring" 4 px outside every edge, stroke -> Semantic base/ring, weight 2, radius 16; that leaves a 2 px gap. The numbers equal Knobs ring/width 2 and ring/offset 2 but are raw.
Docs previewer: chip "server - 0 KB". Head: "A surface with a larger radius than a control, so it never reads as a button." Playground: variant (outline), padding (md), toggles interactive, media, footer.
Code sample: <CardRoot><CardHeader><Heading level={3} size='sm'>...</Heading></CardHeader><CardBody><Text muted>...</Text></CardBody><CardFooter><Button variant='outline' size='sm'>...</Button></CardFooter></CardRoot>. Note: "Card sizes to its container with @container, not the viewport, so it fits a sidebar."
Surprising:
- The code sample has four parts (Root, Header, Body, Footer); the drawing has only a media frame and one "body" frame.
- Padding is 20 with gap 8 on the Components page and 18 with gap 10 in the previewer and Modes frame; both are raw.
- Only one variant is drawn although the playground has variant (outline); padding (md) has no other step drawn.
- The install row of the docs card imports { Card } while the code sample imports CardRoot, CardHeader, CardBody, CardFooter.
```

## Tooltip

```text
Where: page Components, plain FRAME "Tooltip" 74:333. No COMPONENT_SET, no variant properties. Docs card "Previewer: Tooltip" 138:2273.
Popup (inner FRAME "Tooltip"): horizontal auto-layout, hugs both axes, 23 tall.
- padding top/bottom 4, left/right 12 (raw); gap 0
- corner radius 8 (raw, not bound)
- fill -> Semantic neutral/solid; no stroke; no shadow or other effect
- text: Inter Regular 12, line height Auto (15 px box), fill -> Semantic neutral/on-solid, no text style
Arrow: POLYGON 10 x 6, fill -> Semantic neutral/solid, horizontally centered, stacked with item spacing -1 so it overlaps the popup by 1 px.
- above the trigger: popup first, arrow under it (rotated 180)
- below the trigger: arrow first, popup under it
Examples: "Copy to clipboard" (above), "Delete this row" (below), "Keyboard shortcut: Ctrl + K" (captioned "longest allowed"). All are one line.
Docs previewer stage: popup, arrow, an 8 px spacer, then a trigger frame "Button" (radius 8, fill base/surface, stroke base/line).
Docs previewer states ("4 states"):
- hidden: the trigger alone at opacity 0.5
- top: popup above, arrow pointing down
- bottom: arrow pointing up, popup below
- delayed: the top drawing at opacity 0.5
 The state popups are smaller: padding 4 / 8, arrow 9 x 5.
Docs previewer: chip "client - 1.1 KB" (the only one of the ten not marked server). Head: "One or two lines of text on hover; a shared delay makes the next tooltip open instantly." Playground: placement (top), delay (600), closeDelay (0), toggles showArrow, disabled, instant.
Code sample: <TooltipRoot><TooltipTrigger render={<IconButton label='Copy link' variant='ghost' />}><Icon name='link-simple' /></TooltipTrigger><TooltipPopup placement='top'>Copy link</TooltipPopup></TooltipRoot>. Note: "Touch never shows a tooltip, so the trigger's own label must repeat the text."
Frame description: "One or two lines of plain text, never more. Anything with a link or a control is a Popover instead - that is a lint rule, not a suggestion."
Surprising:
- Only top and bottom are drawn; no inline-start or inline-end placement.
- No two-line example and no maximum width are drawn, although the text allows two lines.
- Radius 8 equals radius/control in Light but is unbound, so it does not become a pill in Ocean in Figma.
- Padding, radius and arrow size are raw; only the colors are bound.
- The install row imports { Tooltip } while the code sample imports TooltipRoot, TooltipTrigger, TooltipPopup.
```

## Notes

```text
Source: file BxRSdAVOhk9Hj3Tkq4tjcy, read-only, text facts only, 19 Figma calls. "bound" means a Figma variable is attached; "raw" means a typed number with no variable.
Component sets: of the ten, only Badge is a COMPONENT_SET. The other nine are plain frames. The Components page has eight sets in total: Button, Input, Badge, Tag, Checkbox, Radio, Switch, Avatar.
Kbd and EmptyState have no frame of their own; they sit inside "Code block, Kbd and Avatar group" 83:337 and "Popover and Empty state" 77:316.
Variables: five collections, 151 variables. Palette (36, one mode), Knobs (11; Light / Dark / Ocean), Size (35, one mode), Semantic (51; Light / Dark / Ocean), Type (18, one mode). None carries code syntax (0 of 151), so the mapping to --tc-* names is by name only. There are no paint styles and no effect styles.
Size scale (xs / sm / md / lg / xl):
- control 28 / 32 / 40 / 48 / 56
- padding-x 8 / 12 / 16 / 20 / 24
- padding-y 2 / 4 / 6 / 8 / 10
- gap 4 / 6 / 8 / 8 / 12
- font-size 12 / 14 / 14 / 16 / 18
- icon 16 / 20 / 24 / 32 / 40
- toggle 14 / 16 / 20 / 24 / 28
Knobs (Light / Dark / Ocean): radius/base 8/8/100, radius/control 8/8/100, radius/box 12/12/28, radius/chip 4/4/100, border/width 1, ring/width 2, ring/offset 2, density 1, list/rows 7, list/row-height 40, overlay/inset 16.
Radius by family:
- radius/chip: Badge (and Tag)
- radius/box: Card, Alert, EmptyState
- radius/control: Button, and the buttons drawn inside Card
- raw radii: Kbd 4, Tooltip 8, Skeleton 4/6/10/12/half, Progress 4-10
Ocean radius, Figma against code: Figma has chip 100 and box 28. src/styles.css computes --radius-chip as min(0.5 x --tc-radius, 0.5rem) = 8 px and --radius-box as min(1.5 x --tc-radius, 1.5rem) = 24 px. The Light values agree (4 and 12).
What is bound across the ten: all fills, strokes and text colors (Semantic); Badge padding-y, gap, font size and radius; Spinner icon size; the radius of Card, Alert and EmptyState. Everything else is raw: every stroke weight (always 1, never Knobs border/width), all padding except Badge's vertical, all gaps except Badge's, and every height.
Tones: Semantic has solid, on-solid, soft and on-soft for all six tones. Badge draws all six. Alert draws info, success, warning, danger. Progress draws primary, success, warning, danger. Tooltip uses neutral/solid with neutral/on-solid. Skeleton and the Progress track use neutral/soft.
Hover and active variables (hover, active, soft-hover, soft-active) exist only for primary, neutral and danger. None of the ten uses them; Card's hover is a fill swap from base/surface-raised to base/surface.
base/ring is an alias of primary/on-soft in all three modes. warning/on-solid is neutral/950 (dark); the other on-solid colors are white.
Text: 27 text styles exist (text-xs to text-5xl in regular / medium / strong: 12/16, 14/20, 16/24, 18/28, 20/28 and up), but no layer in these ten uses one, and every line height is Auto. Hug-height drawings therefore use Inter's automatic line box: 12 -> 15, 14 -> 17, 16 -> 19, 18 -> 22. A md Badge is 29 tall in Figma; with the 20 px line height of the type scale it would be 32.
Fonts: Inter for UI text (Medium for Badge and button labels, Semi Bold for titles, Regular for body); Roboto Mono for Kbd and the Separator label; Noto Sans Arabic in the RTL drawing.
States drawn: Kbd (idle, hover, active, disabled), Card (idle, hover, focus-visible), Progress (empty, half, complete, success, danger, indeterminate), Tooltip (hidden, top, bottom, delayed), EmptyState (default, filtered, error, compact). Badge, Spinner, Skeleton, Separator and Alert have no interaction states. Disabled is always opacity 0.5.
Docs previewers: each "Previewer: <Name>" frame is head / stage + playground / code / states / install row. The playground lists prop names, but a toggle's on or off position cannot be read as text, and several named props are drawn nowhere (Badge dot, uppercase, truncate; Spinner label, centered, overlay; Separator spacing; Skeleton animate; Progress showLabel; Kbd variant and size; Card variant and padding; Alert, EmptyState and Progress size beyond md).
Two copies of the docs site exist: "Docs site - LTR" 133:148 on Docs pages, and a second "Docs site - LTR" 438:2388 on the Components page. The ten previewers match in structure, but the Components-page copy still ends each card with "Import from the package" (docs/STATUS.md open question 2 calls that text false), where 133:148 says "Then import it" from '@/topclassui/components/<name>'. I read 133:148.
Import paths disagree inside 133:148: every code sample imports from 'topclassui/<name>', while the install row imports from '@/topclassui/components/<name>'.
The code samples also import Text, Heading and IconButton, which are not among these ten.
Icons used by these drawings and samples: circle-notch, info, check-circle, warning, warning-circle, x, tray, magnifying-glass, plus, image, command, link-simple. All twelve already exist under src/icons/data.
RTL: the only one of the ten drawn right-to-left is Alert (Direction frame 86:276). The Docs site - RTL frame holds only button, input and pagination.
```
