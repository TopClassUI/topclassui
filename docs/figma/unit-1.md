# Figma facts for Unit 1

What the design file says about the ten Unit 1 components - Badge, Spinner, Skeleton,
Separator, Kbd, Alert, EmptyState, Progress, Card and Tooltip - and what to build from it.

**Read this instead of Figma.** A session with no Figma access has no other design input.
Do not ask for screenshots.

Each component has two parts:

- **The facts**, in a fenced block: what is drawn, with node ids. Observations only.
- **Build this**: the decision. Parts, props, defaults, classes and what is left out. Where a
  fact and a Build this line disagree, Build this wins: it is the fact after the rules were
  applied to it.

## How to use this file

**Source.** File `BxRSdAVOhk9Hj3Tkq4tjcy`, read on 2026-10-07, text facts only. Six reviewers
then re-read every node the same day: 535 statements held, 18 were wrong and are corrected
here, and 62 missing facts were added. A line marked "inferred" could not be settled without
a screenshot.

**Words.** "bound" means a Figma variable is attached. "raw" means a typed number with no
variable: a drawing, not a decision.

**When sources disagree**, the order is:

1. the rules in `CLAUDE.md`, because a gate enforces most of them. Where a
   `docs/DECISIONS.md` entry names a rule and changes how it applies, the rule reads as the
   entry says: today that is `R-0-1`, whose record goes in the pull request first;
2. `docs/DECISIONS.md`, where the newest entry wins;
3. the Build this block of the component;
4. its catalog row in `docs/PLAN.md` section 18 and the Unit 1 table in `docs/CLOUD-PLAN.md`;
5. a value marked bound;
6. a value marked raw;
7. a prop name in a docs playground, which is the weakest evidence and never a requirement.

`docs/PLAN.md` 6.6 says the Figma frame wins, and it still does wherever the first four are
silent. Each place Unit 1 departs from the drawing is written in a Build this block, and the
DECISIONS entry of 2026-10-07, "Unit 1 is built from docs/figma/unit-1.md", adopts them all.

**Turning a number into a class.**

- A bound value uses the code token of the same role: `padding-y/md` is `py-pad-y-md`,
  `radius/chip` is `rounded-chip`, `base/line` is `border-line`. Where the value of the token
  differs from Figma, as the Ocean radii do, the token wins. Do not edit `src/tokens.css`,
  `src/styles.css` or `src/shared/classes.ts` to match Figma.
- A raw value is never copied as an arbitrary value. Use the token of the same role and the
  same size step if one exists. Otherwise use the plain Tailwind step equal to the drawn
  pixels (12 px is `px-3`), in the `classes.ts` of the component when it is a lookup table.
  Never borrow a
  token from another size step to hit a number.
- A stroke is always `BORDER`, `BORDER_STRONG` or `BORDER_WIDTH`; the one-sided line of
  Separator is the one exception, at the same `--tc-line-width` knob. A radius is always
  `rounded-chip`, `rounded-control` or `rounded-box`; the Skeleton circle is the one
  exception.
- Text is `text-xs`, `text-sm`, `text-base` or `text-lg` with its own line height. Figma uses
  Auto line height (12 -> 15, 14 -> 17, 16 -> 19) and the code does not, so every hug height
  and every "doc width" below describes the drawing and is not a target. Never assert a Figma
  height in a test.
- The lint rejects these outside a `classes.ts`: `rounded-full`, a numbered height such as
  `h-1`, `border-2`, `outline-2`, `duration-200`, and a hand-written `hover:`,
  `focus-visible:` or `active:`. Every class named in a Build this block compiles, and
  passes the lint in the file the block puts it in; both were run against `main` on
  2026-10-07.

**Which props get built.** The Build this block is the list. It was written by one test: a
prop is in if it is in the catalog row, in the Unit 1 table, in `docs/PLAN.md` 18.11, or
drawn in more than one value. Two props are in on other grounds: Spinner `tone`, because
the one color drawn is the on-soft of a tone and every toned component offers the same six
(`src/shared/contracts/tone.ts`), and Separator `decorative`, because the frame description
states it and the role depends on it. A prop that a playground names but nothing draws is
not built, and one prop is out although its row names it: Progress `min` and `max`, which
wait for Meter. Each Build this block has a **Not built** line; copy it into the pull
request under Decisions.

**When this file does not answer.** Choose what the rules and Button's precedent give, build
it, and write the question and your choice in the pull request under Decisions. Do not edit
`docs/DECISIONS.md` from a component branch, and do not stop. Stop only if the choice needs a
new tone, size or state value, a new dependency, a new label key, or an edit to a shared
file that "Shared pull requests" below does not list. `scripts/mutations/index.ts` is the one
shared file every component branch edits itself: append the mutation of the component at
the end of the array (`docs/CLOUD-PLAN.md` section 8, step 17).

**Code samples show intent, not imports.** `Text`, `Heading`, `IconButton` and `next/link` do
not exist here, and `<Icon name>` is async, so it cannot render in `dummy/` or in the ssr
tests. In demos use plain elements with semantic classes, `Button`, and `<Svg icon={x}>`
with a per-icon import. A link in a demo is `<Button render={<a href="/x" />}>`, never a
bare `<a href>` or `<button>`: `e2e/target-size.spec.ts` measures every one in every demo,
and a text link is 20 px tall against the 24 px floor (44 px under a coarse pointer). Where
a sample passes an icon by name (`icon="tray"`), the component takes a `ReactNode`.

## Rules for all ten

- **Nine are server components.** No `'use client'`, no hook and no import from
  `@base-ui/react`: its Separator and Progress parts are `'use client'` modules, so importing
  one would ship JavaScript while `meta.ts` still said server. Their `meta.ts` has
  `rendering: 'server'`, `baseUi: null` and `baseUiRange: null`. Tooltip is the only client
  component.
- **`meta.ts`**: `status: 'beta'`, the tier of the catalog row, and the category of its
  `docs/PLAN.md` 18 section. The scaffold writes `'draft'` and `'actions'`; change both.
- **Start from `pnpm new:component`, then delete.** It writes `variant`, `tone` and `size` on
  a `div` with `CONTROL_SIZE` and `FOCUS_RING`. Remove every prop and file the component does
  not have (`R-8.1-1`). A component with no design prop has no `schema.ts` and no
  `variants.ts`, and one with nothing to bound has no `boundaries.ts`, as `icon` and `svg`
  already do.
- **Defaults live in `constants.ts`** as `<NAME>_DEFAULTS`. `boundaries.ts` holds
  `<NAME>_BOUNDARIES` and nothing else (`R-8.3-6`).
- **None of the nine is interactive.** No `FOCUS_RING`, `HOVER`, `DISABLED`, `TOUCH_TARGET` or
  `TRANSITION`, and no `render` prop: a Badge or a Card rendered as a link would be an
  interactive element with no drawn states. `className` (last in `cn()`), `style`, `ref` and
  the rest props reach the root element on all ten. On Spinner the root is `Svg`, which sets
  `role` itself. On Tooltip it is the element of `TooltipTrigger` and the Base UI Popup
  inside `TooltipPopup`; `TooltipRoot` renders no element.
- **A design prop is also an attribute**: `data-variant`, `data-tone`, `data-size`,
  `data-orientation`. A boolean state is a presence attribute (`R-5.7-6`).
- **No Unit 1 component imports another.** The branches start from the same `main`, where
  none of the ten exists. `#shared/*`, `#icons/*` and `#components/svg` are the imports
  available, plus `#components/button` in `dummy/` files. So Badge copies `truncateLabel` into its own `lib.tsx`, and a `skeleton.tsx`
  follows `ButtonSkeleton` instead of importing Skeleton. Lifting either into `shared/` is a
  follow-up after the unit merges.
- **`skeleton.tsx`**: Badge and Card only. A skeleton uses `bg-neutral-soft`, the fill Figma
  binds, with `animate-pulse motion-reduce:animate-none` and `aria-hidden`.
- **Labels.** A server component that shows built-in text takes `labels?: Labels` and falls
  back to `en` from `#shared/labels/en.js`. `Labels` is the `labels` field of what
  `getLabels(locale)` returns, not the whole `{ locale, labels }` object. `docs/PLAN.md` 5.11
  passes `locale` too; no Unit 1 component takes it, because none of its three strings
  formats a number. Unit 1 adds no label key: `common.loading`, `state.empty` and
  `state.emptyDescription` exist in both languages.
- **Icons.** All twelve the designs use are in `src/icons/data`. Add nothing to `raw/`.
- **Right to left.** Only Alert is drawn in RTL. Logical utilities mirror the rest, and every
  component still ships `dummy/rtl.tsx`.
- **Dark and Ocean.** Only Badge, Alert and Card are drawn in the Modes frame. The tokens
  carry the rest.
- **Ignore every KB chip.** They are budgets, not measurements, and `pnpm size` does not
  exist.

## Shared pull requests

Two, each its own pull request (`docs/CLOUD-PLAN.md` section 9). Progress needs the first
one merged before it starts; Tooltip does not wait for the second. Open both before Badge: they are the only work that may sit
beside it, and Omar has to merge them, so they should be waiting while Badge is built and
reviewed. If the first is not merged yet, build the other components first; never copy the
change into a component branch.

1. **`feat/shared-progress-token`**, before Progress. Two additions. In `src/tokens.css`, one
   line at the end of the first `:root` block, with the knobs: `--tc-progress-value: 0%;`,
   because `check-css` fails on a `--tc-*` name that `tokens.css` does not declare
   (`R-4-2`). And a new `src/shared/style-tokens.ts`, types only, with a type test beside it:

   ```ts
   declare module 'react' {
     interface CSSProperties {
       [token: `--tc-${string}`]: string | number | undefined
     }
   }

   export {}
   ```

   `style` may carry only a `--tc-*` variable (`R-5.2-5`), but `CSSProperties` in React has
   no custom properties: without this `tsc` rejects the key, and a cast inside the attribute
   fails the lint rule that reads it. With it `'--tc-progress-value'` compiles and
   `'--other'` is still an error.
2. **`feat/shared-tooltip-provider`**, opened before Tooltip. `<Tooltip.Provider>` from
   `@base-ui/react/tooltip`, with no props, inside `TopClassProvider`
   (`src/shared/provider/provider.tsx`). It renders no element, so the markup does not
   change, and there is no new provider prop. The dom test goes in `provider.dom.test.tsx`
   and uses the Base UI parts directly, because `TooltipRoot` does not exist yet: two
   `Tooltip.Root`s inside `TopClassProvider`, hover the first and wait out its 600 ms, move
   to the second, and assert that its popup is open within 100 ms. On `main` today that
   fails, which is the proof. Append the mutation that removes the provider.
   `docs/PLAN.md` 18.8 and the Figma Provider page both say the provider renders it.

Nothing else is needed: no icon, no label key, no class constant and no contract value. The
mutation each component appends to `scripts/mutations/index.ts` is not a shared pull request.

## Badge

```text
Where: page Components. COMPONENT_SET "Badge" 89:457 (18 variants). Also a plain documentation FRAME "Badge" 69:95 (variant x tone grid plus a "sizes" row 69:177) and the docs card FRAME "Previewer: Badge" 137:319 on page Docs pages.
Variant properties (set): variant = solid | soft | outline; tone = primary | neutral | success | warning | danger | info. No size property, no state property. Figma's defaultVariant is variant=solid, tone=primary (89:405), but in this file that is only the first cell of each set: Input, Tag, Checkbox, Radio, Switch and Avatar all "default" to size=xs while every playground says md. The docs playground selects soft (137:398), and every single-Badge drawing is soft: the sizes row 69:181 to 69:197, the Modes copies (84:292 and siblings) and the Table previewer (137:1078).
The solid + primary cell (89:405): 67 x 29, horizontal auto-layout, hugs both axes, centered both ways.
- padding top/bottom 6 -> Size padding-y/md (bound); padding left/right 12 -> raw, NOT bound
- item spacing 0 (unbound) in the set; the frame 69:95 copies bind it to Size gap/<size> (8 at md); the previewer and Modes copies (137:354, 84:292) use raw 4. The gap only shows once an icon is added, and no Badge with an icon is drawn anywhere, so the icon size inside a badge is undefined too
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
Children: a single TEXT child on every Badge node (the Tag chips below, also named "Badge", are the one exception). The docs code sample (148:947) puts an icon first, though none is drawn: inside <div className="flex flex-wrap items-center gap-2"> it has <Badge tone="success" variant="soft"><Icon name="check-circle" />Paid</Badge>, <Badge tone="warning" variant="soft">Pending</Badge> and <Badge tone="danger" variant="solid">Overdue</Badge>. Imports: { Badge } from 'topclassui/badge' and { Icon } from 'topclassui/icon'.
States: none drawn. The previewer's "Every state" panel says "3 states" and they are the three variants. No hover, focus or disabled.
Docs previewer: chip "server - 0 KB". Head (137:327): "A status label in three variants across all six tones, with its own radius token." Playground controls: variant (soft), tone (primary), size (md), and toggles dot, uppercase, truncate, all three drawn off. Note under the code: "Badge has no ARIA role: the text must carry the meaning, color alone never does."
Set description (89:457): "Three variants across all six tones. radius/chip, so Ocean makes them pills."
Bindings: padding-y, gap and font size are bound only in the set 89:457 and the frame 69:95 (the gap in the frame alone). The previewer copies (137:354 to 137:390, state cells 137:432, 137:437, 137:442) and the Modes copies bind no Size variable, only the radius; their padding-y 6, gap 4 and font size are raw.
Other layers named "Badge": 98 on Docs pages ignore this spec (96 on Page: Connectors, six in each of sixteen Adaptive* previewers such as 413:2052, and 2 on Page: Theme builder). They are 21 tall, padding 4 / 10 raw, radius 999 raw, Inter Medium 11, with only the colors bound. The Tag previewer's chips are also layers named "Badge" (135:327 has a label plus icon/x 14 x 14, gap 4 raw). The Table previewer uses real xs badges (137:1078 "Active" 45 x 19, 137:1100 "Invited").
Surprising:
- Horizontal padding is raw and equals 2 x padding-y (4/8/12/16/20). It is not Size padding-x/<size> (8/12/16/20/24).
- Size is not a variant axis in the set. dot, uppercase and truncate are named in the playground but drawn nowhere.
- The Modes frame (84:261) draws a Badge with a 12 px label at md padding (69x27), which matches no row of the size table. It is an unbound drawing, not a sixth size.
- Ocean: Figma radius/chip = 100, a full pill (frame text: "Radius comes from radius/chip, so Ocean makes them full pills"). src/styles.css has --radius-chip: min(calc(var(--tc-radius) * 0.5), 0.5rem), which caps at 8 px in Ocean. The two disagree.
- The default variant is solid in the set and soft in the playground and in every single-Badge drawing.
- The icon gap has three values (0 in the set, gap/<size> in frame 69:95, raw 4 in the previewer) and there is no drawing with an icon to settle it.
```

**Build this.** Server. Tier 1, `media-and-display`. A `<span>` with no role.

- **Props.** `variant`: `solid | soft | outline`, default `soft`. `tone`: the six `TONES`,
  default `primary`. `size`: the six `SIZES`, default `md`. `children`.
- **Size**, as a table in `badge/classes.ts`, with `custom` empty:

  | size | classes |
  |---|---|
  | `xs` | `px-1 py-pad-y-xs gap-1 text-xs` |
  | `sm` | `px-2 py-pad-y-sm gap-1.5 text-sm` |
  | `md` | `px-3 py-pad-y-md gap-2 text-sm` |
  | `lg` | `px-4 py-pad-y-lg gap-2 text-base` |
  | `xl` | `px-5 py-pad-y-xl gap-3 text-lg` |

  The inline padding is the drawn value, twice `padding-y` at every size: a chip is tighter
  than a control, so it is not `pad-x`. The gap and the type step follow the Size collection
  and `docs/PLAN.md` 5.2, which is why xl is `text-lg` here while Button's xl is `text-base`.
- **Base.** `inline-flex items-center rounded-chip font-medium`, plus `BORDER_WIDTH` and
  `CONTAIN`.
- **Variant by tone**, as lookup tables in `badge/classes.ts` (`R-5.2-3`). Solid:
  `bg-<tone>-solid text-<tone>-on-solid border-transparent`. Soft:
  `bg-<tone>-soft text-<tone>-on-soft border-transparent`. Outline:
  `text-<tone>-on-soft border-current`. Every variant carries the border width, as Button
  does, so changing the variant never moves the layout.
- **Label.** Text children go through a copy of Button's `truncateLabel` in `badge/lib.tsx`:
  one span carrying `LABEL`, capped at `BADGE_BOUNDARIES.labelMaxLength` (100). An `<Svg>`
  child keeps its own flex slot at `1em`. Truncation is always on; it is not a prop.
  `dummy/long-label.tsx` and a test like `button.truncate.test.tsx` prove it.
- **`BadgeSkeleton`.** An `aria-hidden` `<span>` around one non-breaking space, written
  `&nbsp;` (a literal U+00A0 fails the lint). It carries the Badge box, not only the size
  classes: `inline-flex rounded-chip`, `BORDER_WIDTH` with `border-transparent`, and the
  size classes of the table above, so its height is the Badge's own and never a copied
  number; without the border it is 2 px short. The width comes from `SKELETON_WIDTH` in
  `badge/classes.ts`: `w-12`, `w-14`, `w-16`, `w-20`, `w-24`, with `custom` empty. Its one
  prop is `size`.
- **Files.** `constants.ts`, `boundaries.ts`, `classes.ts`, `schema.ts`, `types.ts`,
  `variants.ts` (cva in `memoizeVariants`, exported as `badgeVariants`; the scaffolded
  `TONE_CLASS` goes, because it sets hover variables nothing here reads), `lib.tsx`,
  `skeleton.tsx`.
- **Mutation.** The border width on every variant.
- **Not built:** `dot`, `uppercase`, `truncate` as a prop, any state, `render`, a pill shape
  (the 98 connector chips are docs chrome).
- **For the reviewer:** the density knob reaches the block padding but not the inline
  padding. In Ocean `rounded-chip` is 8 px, not the full pill Figma draws.
  `e2e/contain.spec.ts` opens Button's demo by name and is a shared file, so Badge's
  truncation is not measured in a browser yet: leave the spec and list it as a follow-up.

## Spinner

```text
Where: page Components, plain FRAME "Spinner" 69:283. No COMPONENT_SET, no variant properties. Docs card "Previewer: Spinner" 137:2234 on Docs pages.
Structure (Components page): FRAME "Spinner" (horizontal auto-layout, hug, centered, padding 0, gap 0, no fill, no stroke) holding one INSTANCE of icon/circle-notch, whose single Vector carries the color. The docs previewer draws the instance alone (see Sizes).
Sizes (on the Components page the five instances 69:290, 69:295, 69:300, 69:305 and 69:310 bind width and height to Size icon/<size>; in the docs previewer the spinner is a bare icon/circle-notch INSTANCE with no "Spinner" wrapper and raw sizes, 137:2268 to 137:2274 and 137:2310 to 137:2330; the numbers agree):
 xs 16x16 -> icon/xs | sm 20x20 -> icon/sm | md 24x24 -> icon/md | lg 32x32 -> icon/lg | xl 40x40 -> icon/xl
Color: Vector fill -> Semantic base/muted on the Components page; Semantic primary/on-soft in the docs previewer (playground tone = primary). Only that one tone is drawn and no tone list exists for Spinner. base/muted is not a tone, and the raw icon component's own fill is base/body (42:66).
Radius, stroke, padding, text: none.
States: none drawn. The previewer's "5 states" are the five sizes. No rotation frame, no arc: the drawing is the static icon.
Docs previewer: chip "server - 0 KB". Head text: "A spinner is an icon, so it uses the icon sizes and follows the text it sits in." Playground: size (md), tone (primary), toggles label, centered, overlay, all three drawn off. Stage shows 20, 24, 32 and 40.
Code sample (149:955): the body of export default function Loading(), a <div className="flex items-center justify-center gap-3 py-16"> holding <Spinner size="lg" /> and <Text muted>Building your preview</Text>. So it is a route-level loading fallback with a 12 px gap between the spinner and its text. Imports: { Spinner } from 'topclassui/spinner' and { Text } from 'topclassui/text'. Note: "Prefer Skeleton when the final shape is known; Spinner is for unknown waits."
Frame description: "One icon, five sizes. It uses icon/<size>, the same scale as Icon, because a spinner is an icon."
The glyph: icon/circle-notch (42:67, Icons page, 24 x 24, an open ring). Its description is "Not directional: never flips", and src/icons/data/circle-notch.ts has directional: false. Its Vector is 19.5 x 18.75 at offset 2.25, 3 in the 24 box.
The loading glyph of Button is a different icon: all 15 loading variants of the Button set use icon/spinner (42:40, eight spokes) at 14 x 14, and src/components/button/index.tsx imports #icons/data/spinner.js. Both icons exist in src/icons/data.
Section: the docs site files Spinner under "Feedback", whose intro says "Toast and Progress announce themselves to screen readers; the rest stay silent."
Surprising:
- The default color differs between the two pages (base/muted vs primary/on-soft), and "follows the text it sits in" does not say whether it means size or color.
- label, centered and overlay are named in the playground but not drawn.
- The scale is the icon scale (16/20/24/32/40), not the control scale.
- Spinner and the loading state of Button use two different glyphs in Figma (circle-notch and spinner). The code already uses spinner for Button, and has no Spinner yet.
```

**Build this.** Server. Tier 1, `media-and-display`. The root is the `<Svg>` itself, with no
wrapper, as the previewer draws it. It shares its catalog row with Skeleton; the two are
still two branches and two pull requests.

- **Glyph.** `circleNotch` from `#icons/data/circle-notch.js`, with
  `animate-spin motion-reduce:animate-none`, the classes Button's loading state uses. It
  never flips in RTL.
- **Props.** `size`: `xs | sm | md | lg | xl | custom`, default `md` (24 px). It is passed to
  `Svg`, which owns the icon scale; `custom` passes no size, so the `1em` default follows the
  text. `tone`: the six `TONES`, default `primary`, as `text-<tone>-on-soft` from a lookup
  table. `labels?: Labels`.
- **Props type.** `Omit<SvgProps, 'icon' | 'size' | 'label' | 'flipRtl' | 'role'>`, plus the
  design props and `labels`. `Svg` spreads the rest first and then sets `role`, `aria-label`
  and `aria-hidden` itself, so Spinner reads two attributes instead of forwarding them.
- **Accessibility.** Named but silent. The name is `labels.common.loading`, or the caller's
  `aria-label` in its place, passed as the `label` of `Svg`, which renders `role="img"` and
  `aria-label`. No `role="status"` and no live region: the Feedback section says Spinner
  stays silent. `aria-hidden` on the Spinner makes it decorative by passing no label, for a
  spinner that sits beside its own text.
- **To inherit the text color** a caller passes `className="text-current"`.
- **Files.** `constants.ts`, `classes.ts` (the tone table), `schema.ts`, `types.ts`. No
  `variants.ts` (one lookup, no cva) and no `boundaries.ts`.
- **Mutation.** `aria-hidden` passing no label.
- **Not built:** `label` as visible text, `centered`, `overlay`, `skeleton.tsx`.
- **For the reviewer:** Button's loading glyph is `spinner`, not `circle-notch`. Button is
  not touched in Unit 1; list the mismatch as a follow-up.

## Skeleton

```text
Where: page Components, plain FRAME "Skeleton" 69:324. No COMPONENT_SET, no variant properties. Docs card "Previewer: Skeleton" 137:916.
Every shape is one FRAME "Skeleton": fill -> Semantic neutral/soft, no stroke, clips content, no children. Sizes and radii are all raw; nothing is bound except the fill.
Components page shapes (captioned "text line", "avatar" and "card" at 69:331, 69:334, 69:337: three shapes, no rect, and "avatar" where the docs card says "circle"):
- text line 200 x 14, radius 4
- avatar 40 x 40, radius 20
- card 200 x 80, radius 12
Docs previewer stage: circle 44 x 44 (radius 22) beside three lines 220 / 180 / 140 wide, 10 tall, radius 4, line gap 8, row gap 16.
Docs previewer states ("4 states", captioned text / circle / rect / card at 137:993, 137:997, 137:1001, 137:1005; these four captions are the only names the file gives the values, no variant list is stated as such, and the variant select shows "text"):
- text: two lines 110 x 8 and 84 x 8, radius 4, gap 6
- circle: 36 x 36, radius 18
- rect: 110 x 40, radius 6
- card: 110 x 46, radius 10
Docs previewer: chip "server - 0 KB". Playground: variant (text), lines (3), toggles animate and rounded, both drawn on.
Code sample: <Suspense fallback={<Skeleton rows={5} />}>. Note: "Give the skeleton the real dimensions; rows is clamped, and a mismatch is layout shift."
Frame description: "The placeholder every component ships with, so a page holds its shape while it loads. Fill is neutral/soft."
Used inside other docs cards, always fill neutral/soft and raw sizes: the "loading" state cell of Avatar (40 x 40, radius 20, 137:554), Table (three lines 120 / 120 / 90 x 8, radius 4, gap 5, 137:1203 to 137:1205), TreeView (100 / 80 x 8, gap 5, 137:1385 and 137:1386) and Timeline (90 x 10, 137:1529); and as the placeholder content of all three Card state panels (80 x 8 over 110 x 6, gap 6, 137:783 to 137:797).
Motion: no keyframes, animation styles or prototype reactions on the Skeleton frames of the docs card (137:950 to 137:954, 137:991 to 137:1004), no gradient or overlay layer, no motion or duration variable among Knobs, Size and Type, and no such text on the Foundations page.
Bounds: nothing in the file gives a minimum or maximum for rows. docs/PLAN.md names the prop rows (the bounded-props list in 18.11, and <TableSkeleton rows={5} /> in 8.2).
Surprising:
- The prop name disagrees inside Figma: the playground says "lines", the code sample says "rows". docs/PLAN.md says rows.
- No shimmer or pulse is drawn; "animate" exists only as a toggle label.
- Radii are raw. 4 and 12 equal the Light values of radius/chip and radius/box, but they are unbound, so they do not change in Ocean in Figma. 6 and 10 match no knob.
- Line height varies by drawing (14, 10, 8, and 6 inside the Card panels); there is no size scale.
- The shape names disagree between the two pages (avatar vs circle), and rect is missing from the Components page.
```

**Build this.** Server. Tier 1, `media-and-display`. A `<span>` with `aria-hidden`. It
shares its catalog row with Spinner; the two are still two branches and two pull requests.

- **Props.** `variant`: `text | circle | rect | card`, default `text`. `rows`: default 3,
  clamped with `clamp()` to `SKELETON_BOUNDARIES` (`rowsMin: 1`, `rowsMax: 50`), with the same
  two numbers in `schema.ts`. `rows` applies to `text` only.
- **Fill.** `bg-neutral-soft animate-pulse motion-reduce:animate-none`: on the root for
  `circle`, `rect` and `card`, and on each row for `text`, whose root is only a column. The
  pulse is always on, as `ButtonSkeleton` has it; reduced motion stops it.
- **`text`.** The root is `flex flex-col w-full`, with no gap and no fill. Each row is a
  `<span>` with `block h-[1em] my-[calc((1lh-1em)/2)] rounded-chip`: the bar is as tall as
  the font size and its margins make up the rest of the line height, so `rows={3}` is
  exactly as tall as three lines of the text it replaces, at any type step. With more than
  one row the last is `w-2/3`.
- **`circle`.** `block size-control-md shrink-0 rounded-full`: 40 px, the Components-page
  avatar. `block` because the root is a `<span>` and an inline box takes no size; `shrink-0`
  because a flex row would squeeze it into an oval. `rounded-full` is written once, in
  `skeleton/classes.ts`, the only file the lint allows it in, with a one-line reason: a
  circle is a shape, not a radius knob.
- **`rect`.** `block h-control-md w-full rounded-control`.
- **`card`.** `block w-full aspect-5/2 rounded-box`, the 200 x 80 ratio of the Components
  page.
- **Real dimensions come from the caller** through `className`, which is last in `cn()` and
  replaces the default size of a shape. For `text` it reaches the root, so it sets the width
  of the block, and the font size sets the height of a row.
- **Files.** `constants.ts`, `boundaries.ts`, `classes.ts`, `schema.ts`, `types.ts`. No
  `variants.ts`.
- **Mutation.** The `rows` clamp.
- **Not built:** `animate` and `rounded` as props, `size`, `skeleton.tsx` (it is one).
- **For the reviewer:** `ButtonSkeleton` still uses `bg-surface`. Moving it and the other
  skeletons onto this component is a follow-up after the unit merges.

## Separator

```text
Where: page Components, plain FRAME "Separator" 69:313. No COMPONENT_SET, no variant properties. Docs card "Previewer: Separator" 137:815.
Structure: one FRAME "Separator" with a fill and no children. It is a filled 1 px box, not a stroke.
- horizontal: 200 x 1, fill -> Semantic base/line
- vertical: 1 x 80, fill -> Semantic base/line
- thickness 1 is raw; the description says "at border/width" but Knobs border/width is not bound
- no radius, no padding, no stroke
Docs previewer stage: a 300 x 1 line, then a labelled one: line 120 x 1, text "or", line 120 x 1, gap 10. The two are stacked with gap 16. The labelled form is a plain FRAME "row" (horizontal auto-layout, hug, cross-axis centered; 137:850 gap 10, 137:895 gap 8) of a fixed-width line, a TEXT and a fixed-width line; no single Separator node contains the label.
Docs previewer states ("3 states"): horizontal 110 x 1; vertical 1 x 40; with label (40 x 1, "or", 40 x 1, gap 8).
Label text: Roboto Mono Regular 10 (9 in the states cell), line height Auto, fill -> Semantic base/muted, no text style.
Docs previewer: chip "server - 0 KB". Head (137:823): "A hairline divider. It is decorative, so it is exempt from the 3:1 contrast rule." Playground: orientation (horizontal), spacing (md), toggles withLabel (drawn off) and decorative (drawn on).
Code sample (148:1011): an outer <div className="flex flex-col gap-4"> holding <Text>Personal details</Text>, then a plain <Separator /> as a direct child of the column, then the row <div className="flex h-5 items-center gap-3"> holding <Text size="sm">Draft</Text>, <Separator orientation="vertical" /> and <Text size="sm">Edited 2 hours ago</Text>. No spacing prop is passed: the space around the lines is the gap-4 of the column and the gap-3 of the row. Imports: Separator from 'topclassui/separator' and Text from 'topclassui/text'. Note: "A vertical Separator takes its height from the row; give the row a height or stretch."
Frame description: "One hairline, base/line, at border/width. It is decorative, so it is exempt from the 3:1 contrast rule."
Layer names: in the docs card the line frames are named "Frame", not "Separator" (137:849, 137:851, 137:853, 137:887, 137:891, 137:896, 137:898); only the Components-page ones (69:319, 69:322) carry the name.
Used inside five other drawings on the Components page, always 1 px, fill base/line, no children, no size bound: Dropdown menu (76:181, 76:187, 224 x 1 between items; the Menu 76:157 has padding 6 and gap 2, so the line is inset), Accordion (76:250, 76:255, 420 x 1), Table (77:194 and three more, 640 x 1 between rows), Drawer (79:300, 79:318, 240 x 1) and Command palette (79:340, 420 x 1). The space around it always comes from the gap and padding of the parent, so it has to work as a zero-margin flex child.
The type of the label (Roboto Mono Regular 9 or 10, base/muted) is identical to the caption chrome of the docs card itself ("horizontal", "vertical", "with label" at 137:888, 137:892, 137:899, and "3 states" at 137:883), so it is most likely documentation styling rather than a label spec.
docs/PLAN.md lists Separator as "Horizontal and vertical" only; the labelled form exists only in Figma.
Surprising:
- "spacing" is a playground control with no drawing; no margin is drawn around the line.
- The labelled form exists only in the docs previewer, not on the Components page.
- The label is drawn in the mono font at 9-10 px, below the smallest step of the type scale (12).
```

**Build this.** Server. Tier 1, `typography-and-layout`. A `<div>`.

- **Props.** `orientation`: `horizontal | vertical`, default `horizontal`. `decorative`:
  default `true`, as the playground and the frame description have it.
- **Role.** Decorative: `role="none"` and no `aria-orientation`, which axe rejects on that
  role. Otherwise `role="separator"` with `aria-orientation`.
- **Classes.** A one-sided border, not a filled box, so the line survives forced colors.
  Horizontal: `w-full border-t-(length:--tc-line-width) border-line`. Vertical:
  `self-stretch border-s-(length:--tc-line-width) border-line`. No margin: the space around
  it is the gap of the parent. No `shrink-0` either: a border cannot shrink, and two
  horizontal lines beside a text have to share the row.
- **`data-orientation`** carries the prop.
- **Files.** `constants.ts`, `classes.ts`, `schema.ts`, `types.ts`. No `variants.ts` and no
  `boundaries.ts`.
- **Mutation.** The role of the decorative form.
- **Not built:** the labelled form ("or"), `withLabel`, `spacing`, `size`, `skeleton.tsx`.
- **For the reviewer:** a vertical separator draws only as a child of a flex or grid
  container: `self-stretch` takes the height of the row whatever its `items-*`, and in a
  block parent it is 0 px tall even when the parent has a height. One demo shows it inside
  `flex h-5 items-center gap-3`. In Dark `--tc-line` and `--tc-surface-raised` are the same
  neutral-800, so a Separator on a raised surface is invisible; no token changes here.

## Kbd

```text
Where: no frame of its own. Drawn inside FRAME "Code block, Kbd and Avatar group" 83:337 on page Components, where the keys are unnamed "row" frames. The docs card "Previewer: Kbd" 135:411 names them "Kbd". No COMPONENT_SET, no variant properties.
One key: horizontal auto-layout, hugs both axes.
- padding top/bottom 3, left/right 7 (raw); gap 0
- corner radius 4 (raw, not bound to radius/chip)
- stroke -> Semantic base/line-strong, weight 1 (raw, inside); the stroke counts in layout (strokesIncludedInLayout on 83:358), so the 23 height is 1 + 3 + 15 + 3 + 1: a border of 1 plus padding 3 / 7
- fill -> Semantic base/surface on the Components page; Semantic base/surface-raised in the previewer's idle key. In both places the fill is a different surface variable from the one the key sits on: the Components-page keys sit on a card filled base/surface-raised (83:340), the previewer keys on a stage filled base/page (135:443)
- text: Roboto Mono Regular 11, line height Auto (15 px box), fill -> Semantic base/body, no text style
- measured: "K" 23 x 23, "Tab" 36 x 23, "Ctrl" 43 x 23, "Shift" 50 x 23
Combination: every combination sits in its own wrapper FRAME "row": horizontal auto-layout, gap 4 (5 in the previewer), children centered, no padding, no fill, no stroke (Components page 83:357 holds Ctrl and K, 83:364 holds Shift and Tab; previewer 135:444, 135:485, 135:493, 135:501, 135:509). The gap lives on the wrapper. No visible outer keycap and no "+" between keys is drawn, which agrees with the unstyled outer <kbd> of the head text.
Only color variables are bound. Radius, padding, stroke weight and font size are raw.
States (previewer, "4 states"):
- idle: fill base/surface-raised
- hover: drawn identical to idle
- active: fill base/surface
- disabled: opacity 0.5 set on the wrapper "row" (135:509), so the whole key group dims
Docs previewer: chip "server - 0 KB". Head: "A keycap; a combo nests one <kbd> per key inside an outer <kbd>, as the HTML spec says." Playground: variant (outline), size (md), toggles pressed, muted, disabled, all three drawn off (135:468, 135:471, 135:474). The stage draws three keys in one row: Ctrl, Shift, K.
Code sample (145:969): <Text muted>Press <Kbd><Icon name="command" label="Command" /></Kbd> <Kbd>K</Kbd> to open the command palette.</Text>. That is two sibling <Kbd> elements separated by a space, with no outer <Kbd>, which contradicts the head text. No key holding an icon is drawn anywhere: every drawn key is text (Ctrl, K, Shift, Tab). Note: "Icon takes no size here: it defaults to 1em and follows the key's own text."
Frame description (83:339): "... Kbd renders real keys, and an avatar group overlaps and counts the rest." The two Components-page examples are captioned Ctrl + K "open the command palette" and Shift + Tab "move focus backwards".
Contents frame 87:288 files Kbd under "Actions" (Button, Tag, Segmented control, Kbd); docs/PLAN.md files it under 18.1, Typography and layout.
Surprising:
- Only one size is drawn although the playground has size (md); only one variant although it has variant (outline).
- Font size 11 is on neither the Size scale nor the Type scale (both start at 12).
- hover, active and disabled are drawn for an element that is not interactive, and hover has no visual difference.
- The resting fill differs between the two pages (base/surface vs base/surface-raised).
- The head text says a combo nests its keys in an outer <kbd>; the code sample uses two siblings with no outer element.
```

**Build this.** Server. Tier 2, `typography-and-layout`. One export, `Kbd`, rendering one
`<kbd>`.

- **Props.** None of its own: `children`, `className`, `style`, `ref` and the rest.
- **Classes.** `inline-flex items-center justify-center rounded-chip bg-surface px-1.5 py-0.5
  font-mono text-xs text-body`, plus `BORDER_STRONG`. `text-xs` is the smallest step of the
  type scale; the drawn 11 px is below it. The padding is 2 / 6, one pixel under the drawn
  3 / 7, because `text-xs` brings a 16 px line where the drawing has 15: the key comes to
  22 px against the drawn 23.
- **A combination is siblings**, as the code sample writes it: `<Kbd>Ctrl</Kbd> <Kbd>K</Kbd>`.
  No group part and no "+". A caller who wants the nested form of the HTML spec wraps them in
  a plain `<kbd>`.
- **An icon inside a key** is an `<Svg>` child at its `1em` default, so it follows the text
  of the key.
- **Files.** No design prop, so no `schema.ts`, `variants.ts`, `constants.ts`, `classes.ts`
  or `boundaries.ts`. `types.ts` stays, as `KbdProps`, and the class string sits in
  `index.tsx` inside `cn()`. `svg` is the precedent.
- **Mutation.** The element: a `<span>` in place of the `<kbd>` must fail a test.
- **Not built:** `variant`, `size`, `pressed`, `muted`, `disabled`, the hover and active
  drawings (a key is not interactive), `skeleton.tsx`.

## Alert

```text
Where: page Components, plain FRAME "Alert" 74:162. No COMPONENT_SET, no variant properties. Docs card "Previewer: Alert" 137:1708. Also drawn in the Modes frame 84:261 and the Direction frame 86:276.
Drawn matrix: three variants (soft, solid, outline) x four tones (info, success, warning, danger). primary and neutral are not drawn.
Root "Alert": horizontal auto-layout, items top-aligned, width 258 fixed (doc width), height hug (79; outline 81).
- gap 8, padding top/bottom 12, left/right 16 (all raw)
- corner radius 12 -> Knobs radius/box (bound; Ocean 28)
Children in order:
1. INSTANCE icon, 16 x 16: info -> icon/info, success -> icon/check-circle, warning -> icon/warning, danger -> icon/warning-circle
2. FRAME "b": vertical, gap 4 on the Components page and 3 in every other drawing, fills the width
   - title: Inter Semi Bold 14, line height Auto (17); it hugs its text on the Components page and fills the width elsewhere. No text has truncation or a line cap: a long description wraps (74:175 is two lines)
   - description: Inter Regular 14, line height Auto, layer opacity 0.9 on the four solid drawings (74:211, 74:219, 74:227, 74:235) and 0.85 on the soft and outline rows and on every other drawing (previewer stage, Modes, Direction)
3. INSTANCE icon/x, 14 x 14 (dismiss): a bare icon with no button frame, no hit area and no hover or focus state. It is drawn on all twelve Components-page alerts and nowhere else: not in the previewer stage, the state cells, Modes (84:298, 84:343, 84:388) or Direction (86:316, 86:388), so never in Dark, Ocean or RTL
Colors (icon, title, description and close all share one color):
- soft: fill <tone>/soft, content <tone>/on-soft
- solid: fill <tone>/solid, content <tone>/on-solid
- outline: no fill, stroke <tone>/on-soft weight 1 (raw), content <tone>/on-soft; the stroke counts in layout (74:242), so the body is 178 wide instead of 180 and the 81 height is a normal border box: a border of 1 plus padding 12 / 16
No text style on any text.
Docs previewer stage (soft info and soft success): width 340, gap 10, padding 12 / 14, body gap 3, no close icon.
Docs previewer states ("4 states" = the four tones, soft): a compact drawing with padding 8 / 10, icon 14, title only at Semi Bold 12.
Docs previewer: chip "server - 0 KB". Head (137:1716): "Four tones, each with its own icon, so the message reads without relying on color." Playground: tone (info), variant (soft), size (md), toggles dismissible and withIcon, both drawn on (137:1777, 137:1782), although the two stage alerts beside them (137:1742, 137:1748) have no dismiss icon.
Code sample (148:1059), wrapped in export default function Page(): <Alert tone="warning" icon="warning" title="Your trial ends in three days">Deploys pause when it does. Projects stay readable, and adding a payment method turns deploys back on.</Alert>. Note: "Not a live region: page content. Announce what just happened with Toast instead."
RTL (Direction frame, 280 wide, soft + success only): the icon moves to the other end by reordering the children (body first, icon second) in an auto-layout that still runs left to right; text is right-aligned in Noto Sans Arabic (SemiBold 14 / Regular 12); the box grows from 59 to 82 tall. The 16 x 16 wrapper FRAME "icon" is in both Direction drawings (86:317 LTR, 86:389 RTL); every other drawing places the icon instance directly.
Frame description: "Four tones, each with its own icon so the message reads without colour. Success is emerald-700 and info sky-700, both chosen to pass 4.5:1 against white."
Modes frame: soft + success only, 230 wide, no close icon. No other pair is drawn in Dark, Ocean or RTL - not solid, not outline, and not soft in info, warning or danger - so eleven of the twelve drawn variant and tone pairs rely on the tokens alone.
Section: the docs site files Alert under "Feedback", whose intro says "Toast and Progress announce themselves to screen readers; the rest stay silent." Install row: "npx topclassui add alert" and import { Alert } from '@/topclassui/components/alert'. The Contents frame 87:288 also files it under "Feedback".
Surprising:
- Spacing differs by drawing: gap 8 and padding 12/16 on the Components page; gap 10 and padding 12/14 in the previewer, Modes and Direction.
- Description size differs: 14 on the Components page and previewer stage, 12 in Modes and Direction.
- Only one size is drawn although the playground has size (md). No action buttons are drawn.
- Padding, gap and icon size are raw; only the radius and colors are bound.
- warning/on-solid is dark (neutral/950) in every mode. primary, success, danger and info on-solid are white in every mode. neutral/on-solid is white in Light and Ocean and neutral/950 in Dark.
- The dismiss icon contradicts the card it sits in: the chip says "server - 0 KB", the dismissible toggle is on, the previewer stage draws no x, and the Components page draws it on every alert with no button around it.
- The reduced opacity of the description lowers its contrast. Reviewer arithmetic, not read from Figma: with the Light colors of Figma (on-soft at the 700 step) 0.85 over the soft fill is about 3.5:1 for success and 3.8:1 for info; with the colors of the code, white at 0.9 on the danger solid is about 4:1, against 4.76:1 at full opacity. The on-soft of the code is the 800 step (see Notes), so the first two numbers are Figma's, not the code's; the third alone is under the 4.5:1 of R-5.6-4.
```

**Build this.** Server. Tier 1, `media-and-display`. A `<div>` with no role: the Figma note
says it is page content, not a live region. A caller who needs one passes `role="alert"`.
One export, `Alert`: `Callout` in the catalog row is a second name for it, not a second
component.

- **Props.** `tone`: the six `TONES`, default `info`. `variant`: `soft | solid | outline`,
  default `soft`. `icon?: ReactNode`. `title?: ReactNode`, so the native `title` attribute is
  omitted from the props type. `children`: the description. `actions?: ReactNode`.
- **Icon.** The default follows the tone: `info` for info, `check-circle` for success,
  `warning` for warning, `warning-circle` for danger, and `info` for primary and neutral,
  which Figma does not draw. The table is `ALERT_ICONS` in `alert/constants.ts`, typed
  `Record<Tone, IconData>`. Each is `<Svg icon={x} size="xs" />` with no label: the title
  carries the meaning. `icon={null}` hides it. `mt-0.5` centers the 16 px icon on the first
  line of the title.
- **Layout.** Root: `flex items-start gap-2 rounded-box px-pad-x-md py-3`, plus
  `BORDER_WIDTH`. Body: `flex min-w-0 flex-1 flex-col gap-1 wrap-anywhere`. Title: a `<p>`
  with `text-sm font-semibold`. Description: a `<div>` with `text-sm`, because `children` may
  hold paragraphs or a list. Actions: a `flex flex-wrap gap-2 pt-1` row under the
  description, the spacing of the action row Card draws. Long text wraps and nothing
  truncates; `wrap-anywhere` breaks a URL or a path that has no space in it.
- **Variant by tone**, as lookup tables in `alert/classes.ts`. Soft:
  `bg-<tone>-soft text-<tone>-on-soft border-transparent`. Solid:
  `bg-<tone>-solid text-<tone>-on-solid border-transparent`. Outline:
  `text-<tone>-on-soft border-current`. The icon, title and description inherit that one
  color.
- **No opacity on the description.** The drawn 0.9 takes white on the danger solid from
  4.76:1 to about 4:1, under the 4.5:1 of `R-5.6-4`, and axe would fail it.
- **Actions in demos** go on the soft variant, as `<Button size="sm" tone={tone}>` and
  `<Button size="sm" variant="outline" tone={tone}>`. An unfilled Button on a solid Alert is
  `on-soft` text on a `solid` fill, 1 to 3.4:1, and `e2e/axe.spec.ts` fails it.
- **Files.** `constants.ts`, `classes.ts`, `schema.ts`, `types.ts`, `variants.ts` (the
  scaffolded `TONE_CLASS` goes, as on Badge). No `boundaries.ts`.
- **Mutation.** The default icon of a tone.
- **Not built:** the dismiss icon and `dismissible` (dismissal needs client state and belongs
  to Banner in Unit 2), `withIcon` (`icon={null}` covers it), `size`, `skeleton.tsx`.
- **For the reviewer:** only soft + success is drawn in Dark, Ocean and RTL; the other pairs
  rely on the tokens.

## EmptyState

```text
Where: no frame of its own. Drawn as FRAME "EmptyState" inside FRAME "Popover and Empty state" 77:316 on page Components. Docs card "Previewer: EmptyState" 137:2349, whose stage holds the drawing, a layer named "e" (137:2382). No COMPONENT_SET, no variant properties.
Root: vertical auto-layout, children centered, width 340 fixed, height hug (228).
- gap 12, padding 32 on all sides (raw)
- corner radius 12 -> Knobs radius/box (bound)
- fill -> Semantic base/surface
- stroke -> Semantic base/line, weight 1 (raw), dashed 6 / 4; it is inside and counts in layout, so 228 is 226 of content and padding plus 2 of border
Children in order:
1. INSTANCE icon/tray, 40 x 40, Vector fill -> Semantic base/muted
2. title: Inter Semi Bold 16, line height Auto (19), fill -> Semantic base/body
3. description: Inter Regular 14, line height Auto, centered, fills the width, fill -> Semantic base/muted
4. action: a plain frame, not a Button instance. Padding 8 / 14, gap 6, radius 8 raw, fill -> Semantic primary/solid; icon/plus 14 and label Inter Medium 14, both -> Semantic primary/on-solid (77:337, 129 x 33). It matches no Button size: Size control/sm is 32 tall with padding-x 12
No text style on any text.
Docs previewer stage: gap 10, padding 28, stroke -> Semantic base/line-strong (dashed 6 / 4), icon 36, action padding 7 / 12 with a 12 px label (137:2387, 114 x 29).
Docs previewer states ("4 states"), each an icon above a caption:
- default: icon/tray 24, base/muted, "empty"
- filtered: icon/magnifying-glass 24, base/muted, "no matches"
- error: icon/warning-circle 24, fill -> Semantic danger/on-soft, "failed"
- compact: icon/tray 18, "empty"
Docs previewer: chip "server - 0 KB". Head: "What every collection renders when there is nothing to show." Playground: size (md), variant (dashed, the only variant value named or drawn anywhere), icon (tray), toggles withAction (drawn on), compact (off) and bordered (on).
Code sample: <EmptyState icon="tray" title="No invoices yet"> with children <Text muted>...</Text> and <Button size="sm" render={<Link href="/invoices/new" />}>Create an invoice</Button>. It imports Link from next/link and Button from topclassui/button. Note: "Collections render this for status 'empty'; replace it with emptyFallback."
Frame description (77:318): "A Popover is where anything richer than two lines of text goes. The empty state is the one every collection component renders when it has nothing to show - that is why the set needed the tray icon."
Drawing copy, the same in both drawings: "No projects yet" / "Create your first project and it will show up here." / "New project".
Section: the docs site files EmptyState under "Feedback", so it stays silent: no status role and no live region. It appears in neither the Modes frame nor the Direction frame, so there is no Dark, Ocean or RTL drawing.
Surprising:
- The border color differs between the two pages (base/line vs base/line-strong).
- Spacing differs: gap 12 / padding 32 / icon 40 on the Components page; gap 10 / padding 28 / icon 36 in the previewer.
- Only one size is drawn (twice: the Components page and the previewer stage) although the playground has size (md). The filtered, error and compact states are drawn only as an icon plus caption.
- Padding, gap and icon size are raw.
- Two pairs of playground controls describe the same thing: variant (dashed) beside the bordered toggle, and the size select beside the compact toggle and the compact state cell.
- The drawn action is not a Button of any size, while the code sample uses <Button size="sm">.
```

**Build this.** Server. Tier 1, `media-and-display`. A `<div>` with no role and no live
region. `EmptyState` only: `ErrorState` shares the catalog row but is in no unit, so say so
in the pull request.

- **Props.** `icon?: ReactNode`, default `<Svg icon={tray} size="xl" />` in `text-muted`;
  `icon={null}` hides it. `title?: ReactNode`, default `labels.state.empty`, with the native
  `title` attribute omitted from the props type as on Alert. `description?: ReactNode`:
  `labels.state.emptyDescription` when neither `title` nor `description` is passed; with a
  caller's `title` and no `description` there is none, and `null` hides it. `children`: the
  action, which the caller passes as a `Button`. `labels?: Labels`.
- **Classes.** Root: `flex flex-col items-center gap-3 rounded-box bg-surface p-8 text-center
  wrap-anywhere border-dashed`, plus `BORDER`. Title: a `<p>` with `text-base font-semibold
  text-body`. Description: a `<div>` with `text-sm text-muted`.
- **The component draws no button of its own.** The drawn action matches no Button size, and
  the code sample passes `<Button size="sm">`.
- **The filtered and error cells** are demos that pass another icon and title
  (`magnifying-glass`, `warning-circle`), not variants.
- **Files.** `types.ts` and `classes.ts`. No design prop, so no `schema.ts`, `variants.ts`,
  `constants.ts` or `boundaries.ts`.
- **Mutation.** The default description appearing under a caller's title.
- **Not built:** `size`, `variant`, `compact`, `bordered`, `withAction`, `skeleton.tsx`.
- **For the reviewer:** the border is `base/line` on one page and `base/line-strong` on the
  other. `BORDER` is the decorative one, which is what a dashed frame is. CSS cannot set the
  6 / 4 dash lengths, so `border-dashed` is the browser's own dash. The Figma sample passes
  its description as a `<Text muted>` child beside the Button; here that text is the
  `description` prop and `children` holds only the action.

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
Docs previewer: chip "server - 0 KB". Head: "A neutral track with a bar in the chosen tone; height follows the spacing scale." Playground: tone (primary), size (md), value (60), toggles indeterminate and showLabel, both drawn off (137:2176, 137:2179).
Code sample: a <div className="grid gap-2"> holding <Text id="storage-label" size="sm">Storage: 7.2 GB of 10 GB</Text> and <Progress value={72} tone="warning" aria-labelledby="storage-label" />. Note: "It renders no text and clamps value to 0-100, so label it with aria-labelledby."
Frame description: "The track is neutral/soft, the bar is the tone. Height follows padding-y, so it scales with everything else."
Also drawn inside File upload, three times: Components page 80:343 (an unnamed "Frame", 200 x 4, radius 2, bar 120 = 60%, primary/solid), the docs File upload previewer 137:3087 (200 x 4, radius 4, bar 130 = 65%, under the file name "brief.pdf") and 137:3151 (100 x 6, radius 4, bar 60 = 60%). So the real consumer is a 4 px bar at a fixed width inside a list row.
Section: the docs site files Progress under "Feedback", whose intro says "Toast and Progress announce themselves to screen readers; the rest stay silent." So Progress carries the progressbar role with its value. It appears in neither the Modes frame nor the Direction frame.
Surprising:
- "Height follows padding-y" (2/4/6/8/10), but xs is drawn at 4, the same as sm, and no height is bound to a variable.
- Not a contradiction, though it reads like one: the radius equals the height in the Progress frame on the Components page, is 4 on the 4 px and 6 px tracks of the previewers, and is 2 on the 4 px track inside File upload (80:343), but Figma clamps a radius at half the shorter side, so every Progress drawing in the file is a full pill. The only decision is "always a pill". (The pill is inferred from the clamp, not seen in a screenshot.)
- "complete" is primary on the Components page and success in the previewer.
- The playground has showLabel while the code note says the component renders no text; no label is drawn.
- The indeterminate bar is a static 35% segment (137:2216). No prototype reaction is attached to the track, the bar or either card. The separate motion and keyframe data of Figma was not queried for Progress, so "no motion" is confirmed for prototype reactions only.
```

**Build this.** Server. Tier 2, `media-and-display`. Needs `feat/shared-progress-token`
merged first. `Meter` shares the catalog row and is not in this unit.

- **Element.** A `<div role="progressbar">` with `aria-valuemin={0}`, `aria-valuemax={100}`
  and `aria-valuenow`, holding one bar `<div>`. No native `<progress>` and no Base UI.
- **Props.** `value`: default 0, clamped with `clamp()` to `PROGRESS_BOUNDARIES`
  (`valueMin: 0`, `valueMax: 100`), with the same two numbers in `schema.ts`. No `min` or
  `max` prop: a custom range is Meter's job. `tone`: the six `TONES`, default `primary`.
  `size`: the six `SIZES`, default `md`. `indeterminate`: default `false`.
- **Props type.** The props of a `<div>` without `children`, `dangerouslySetInnerHTML`,
  `role`, `aria-valuemin`, `aria-valuemax` and `aria-valuenow`, then the design props, then
  the union of the next bullet; an `Omit` wrapped around the union would flatten it and
  make both names optional. The type alone does not keep a caller out: TypeScript accepts
  any hyphenated JSX attribute, so `<Progress aria-valuenow={150}>` still compiles. Spread
  `...rest` first and write `role` and the three `aria-value*` attributes after it, as `Svg`
  does, so no caller value passes the clamp. One test passes `aria-valuenow={150}` and reads
  the clamped number back.
- **A name is required.** The props type requires one of `aria-label` or `aria-labelledby`;
  passing neither is a type error (`R-5.6-1`). The component renders no text. The generated
  README table cannot say "one of two", so say it in the hand-written block.
- **Track.** `w-full overflow-hidden rounded-control bg-neutral-soft
  forced-color-adjust-none`, with the height from a size table in `progress/classes.ts`:
  `h-pad-y-xs` to `h-pad-y-xl`, which is 2 / 4 / 6 / 8 / 10 px, and `custom` empty.
  `rounded-control` is a full pill at every one of those heights in all three modes, which
  is what every drawing shows. Track and bar are two fills, which forced colors would
  repaint to nothing; `forced-color-adjust-none` keeps both.
- **Bar.** `h-full rounded-control w-(--tc-progress-value)` and `bg-<tone>-solid` from a
  lookup table. The root sets the variable from the clamped value:
  ``style={{ ...style, '--tc-progress-value': `${String(percent)}%` }}``. `String()` because
  the lint rejects a number in a template literal; the key type-checks through the
  declaration the shared pull request adds. It starts at the inline-start edge, so RTL needs
  nothing.
- **Indeterminate.** No `aria-valuenow`, and the bar is `w-1/3 animate-pulse
  motion-reduce:animate-none` at the start edge. No new keyframe.
- **Attributes.** `data-tone`, `data-size`, and the presence attributes `data-complete` (at
  100) and `data-indeterminate`. The bar keeps the caller's tone at 100.
- **Files.** `constants.ts`, `boundaries.ts`, `classes.ts`, `schema.ts`, `types.ts`. No
  `variants.ts`: the track and the bar are two elements, each reading one table through
  `cn()`.
- **Mutation.** The clamp: remove it and a `value` of 150 must fail a test.
- **Not built:** `showLabel`, `min`, `max`, a tone change on complete, `skeleton.tsx`.
- **For the reviewer:** xs is 2 px, from the token and the frame text "Height follows
  padding-y"; the drawing shows 4. The warning bar on the neutral-soft track is about 2:1 in
  Light, under the 3:1 of a graphical object; the value is still exposed through
  `aria-valuenow`, and no token changes here.

## Card

```text
Where: page Components, plain FRAME "Card" 74:126. No COMPONENT_SET, no variant properties. Docs card "Previewer: Card" 137:705, whose stage holds the card drawing, a layer named "panel" (137:738). Also drawn in the Modes frame 84:261 (84:304 Light, 84:349 Dark, 84:394 Ocean).
Root "Card" (Components page: 74:131, 74:137, 74:148): vertical auto-layout, width 280 fixed (doc width), height hug, clips content.
- gap 0, padding 0 on the root, on the Components page only. The previewer panel and all three Modes cards have no "body" frame: padding 18 and gap 10 sit on the root itself, and clipping is off
- corner radius 12 -> Knobs radius/box (bound; Ocean 28)
- fill -> Semantic base/surface-raised
- stroke -> Semantic base/line, weight 1 (raw, inside); it counts in layout, so the body is 278 wide at (1, 1)
- no shadow or other effect
Three drawings: "card" (120 tall), "card with actions" (164), "card with media" (284).
Parts in order:
1. media (third drawing only): frame 280 x 120, fill -> Semantic neutral/soft, icon/image 32 centered, Vector fill -> Semantic base/muted. The layer is literally named "Frame" and is fixed 280 wide, so it overflows the 278 content box by 2 px and the clip of the root cuts it
2. FRAME "body": vertical, padding 20 on all sides (raw), gap 8, fills the width
   - title: Inter Semi Bold 16, line height Auto (19), fill -> Semantic base/body
   - text: Inter Regular 14, line height Auto, fill -> Semantic base/muted
   - actions row (layer "row", in the second and third drawings): gap 8, top padding 4, so 12 from the text to the buttons; two "Button sm" frames (height -> Size control/sm, radius -> Knobs radius/control, padding left/right 12 raw, gap 6) labelled "Read more" and "Later" in Inter Medium 14: one primary/solid, one outline with no fill, stroke base/line-strong and text base/body
No text style on any text. No separate header or footer frame and no divider line is drawn.
Docs previewer stage ("panel"): width 300, padding 18, gap 10, same fill, stroke and radius binding. Its two buttons (137:742, 137:744) are raw drawings, not the Components-page buttons: radius 8 unbound, hug height 29, 12 px labels, and the outline one has fill base/surface with stroke base/line.
Docs previewer states ("3 states"; each cell is a compact stand-in, 150 x 46 with padding 12, gap 6 and two Skeleton bars, 137:782, 137:788, 137:794):
- idle: fill base/surface-raised
- hover: fill base/surface (neutral/50 in Light, neutral/900 in Dark)
- focus-visible: a RECTANGLE "ring" (137:795), 158 x 134 at (-4, -4) inside the 150 x 46 panel: 4 px outside the top, left and right edges, which leaves a 2 px gap, but 84 px below the bottom edge, because it was sized for a taller panel. Stroke -> Semantic base/ring, weight 2 (raw), radius 16 (raw). The numbers equal Knobs ring/width 2 and ring/offset 2. The Accessibility page (183:2065, 183:2077) specifies the ring as the one shared CSS outline, FOCUS_RING.
Docs previewer: chip "server - 0 KB". Head: "A surface with a larger radius than a control, so it never reads as a button." Playground: variant (outline), padding (md), toggles interactive (drawn off, 137:763), media (off, 137:766) and footer (on, 137:769).
Code sample (148:995): <CardRoot><CardHeader><Heading level={3} size="sm">Monthly report</Heading></CardHeader><CardBody><Text muted>Revenue rose 12% against April, driven by renewals.</Text></CardBody><CardFooter><Button variant="outline" size="sm">Download PDF</Button></CardFooter></CardRoot>. Imports: { CardRoot, CardHeader, CardBody, CardFooter } from 'topclassui/card', plus Heading, Text and Button. Note: "Card sizes to its container with @container, not the viewport, so it fits a sidebar."
Frame description (74:128): "A surface that holds other components. Radius comes from radius/box, which is larger than a control, so a card never looks like a button."
Modes cards: 230 wide, each holding one "Button md" (height -> Size control/md, padding 16, gap 8, label font size -> Size font-size/md). In Dark the border is invisible: base/surface-raised and base/line both alias Palette neutral/800 (84:349 resolves fill #262626 and stroke #262626), so a dark Card is separated from the page by its fill alone. src/tokens.css has the same pair.
Ocean: Knobs radius/box is 28 and the Ocean card 84:394 measures 28. src/styles.css caps --radius-box at 1.5rem, which is 24 px.
Changelog (Page: Changelog, 183:2702): "## 0.4.0 / Breaking - `Card` is now `CardRoot`. Find and replace; nothing else changed. Every part family now has a `<Name>Root`, so a server file can import the flat name." The install row (137:811, import { Card } from '@/topclassui/components/card') is the stale side.
Surprising:
- The code sample has four parts (Root, Header, Body, Footer); the drawing has only a media frame and one "body" frame.
- Padding is 20 with gap 8 on the Components page and 18 with gap 10 in the previewer and Modes frame; both are raw. The state cells use a third value, 12.
- Only one variant is drawn although the playground has variant (outline); padding (md) has no other step drawn.
- The install row of the docs card imports { Card } while the code sample imports CardRoot, CardHeader, CardBody, CardFooter. The Changelog of the file itself settles it: CardRoot.
- The structure differs by drawing: a padded "body" child inside an unpadded, clipping root on the Components page; padding and gap on the root itself, with no body frame and no clip, in the previewer and in all three Modes cards.
```

**Build this.** Server. Tier 1, `media-and-display`. Four parts, all `<div>`, exported flat:
`CardRoot`, `CardHeader`, `CardBody`, `CardFooter` (`R-9.2-3`, `R-9.2-4`). No bare `Card`.

- **Files.** `parts/card-root.tsx`, `parts/card-header.tsx`, `parts/card-body.tsx` and
  `parts/card-footer.tsx`, one component each; `skeleton.tsx`; `classes.ts` with the class
  strings; `types.ts` with `CardRootProps`, `CardHeaderProps`, `CardBodyProps`,
  `CardFooterProps` and `CardSkeletonProps`. `index.tsx` re-exports the four parts,
  `CardSkeleton` and the types, and holds no markup. No design prop, so no `schema.ts`,
  `variants.ts`, `constants.ts` or `boundaries.ts`.
- **`CardRoot`.** `flex flex-col gap-2 rounded-box bg-surface-raised p-5`, plus `BORDER`.
  The padding and the gap sit on the root, as the previewer and the three Modes cards draw
  it, with the Components-page numbers (20 and 8).
- **`CardHeader`.** `text-base font-semibold text-body`, the drawn title.
- **`CardBody`.** `text-sm text-muted`, the drawn text. A block, not a flex column: in a flex
  container every element child is its own item, so a sentence with a link in it would stack
  as three rows. A caller with several paragraphs spaces them.
- **`CardFooter`.** `flex flex-wrap items-center gap-2 pt-1`, the drawn action row: 8 between
  the buttons and 12 from the text above.
- **`CardSkeleton`.** `block w-full aspect-5/2 rounded-box` with the skeleton classes; the
  caller gives the real height through `className`.
- **Tests.** Two that no gate covers for a component in `parts/`. The export names of
  `index.tsx`, written out: `CardBody`, `CardFooter`, `CardHeader`, `CardRoot`,
  `CardSkeleton` and no `Card`, because the lint rule reads declarations and sees nothing in
  a file of re-exports. And that no file under `parts/` starts with `'use client'` or
  imports a React hook, because `check-boundaries` applies `R-5.1-1` to `index.tsx` only.
- **In a demo** a title inside `CardHeader` is an `<h2>`: the harness page has one `<h1>`,
  and the `heading-order` rule of axe fails on the `<h3>` of the Figma sample.
- **Mutation.** A bare `Card` export appearing beside the parts.
- **Not built:** `interactive` with its hover and focus-visible drawings, `variant`,
  `padding`, a media part, `@container`, `render`.
- **For the reviewer:** in Dark the border has the color of the fill, in Figma and in
  `src/tokens.css`, so only the fill separates a card from the page. In Ocean `rounded-box`
  is 24 px where Figma has 28. An image cannot bleed to the edge without a media part. The
  generated README prints `import { Card } from 'topclassui'`, which is not an export; that
  line comes from `scripts/lib/readme.ts`, which the local session fixes. Do not edit the
  script or the generated lines.

## Tooltip

```text
Where: page Components, plain FRAME "Tooltip" 74:333. No COMPONENT_SET, no variant properties. Docs card "Previewer: Tooltip" 138:2273.
Popup (inner FRAME "Tooltip"; on the Components page an outer FRAME "Tooltip", vertical, gap -1, cross-axis centered, wraps it and a layer named "Polygon"; in the previewer the wrapper is "g" and the popup is "row"): horizontal auto-layout, hugs both axes, 23 tall.
- padding top/bottom 4, left/right 12 (raw); gap 0
- corner radius 8 (raw, not bound)
- fill -> Semantic neutral/solid; no stroke; no shadow or other effect
- text: Inter Regular 12, line height Auto (15 px box), fill -> Semantic neutral/on-solid, no text style
Arrow: POLYGON 10 x 6, fill -> Semantic neutral/solid, horizontally centered, stacked with item spacing -1 so it overlaps the popup by 1 px.
- above the trigger: popup first, arrow under it (rotated 180; the pointing direction is inferred from the rotation, not seen)
- below the trigger: arrow first, popup under it
Examples: "Copy to clipboard" (above), "Delete this row" (below), "Keyboard shortcut: Ctrl + K" (captioned "longest allowed"). All are one line. The "longest allowed" one measures 179 x 23 (text 155 px, 27 characters) and is the only length evidence in the file.
Docs previewer stage: popup, arrow, an 8 px spacer, then a trigger frame "Button" (138:2311; radius 8, fill base/surface, stroke base/line). The trigger is a placeholder, not a design: an empty frame with no children at the Figma default of 100 x 100, with no label and no icon, and the trigger of the "hidden" state (138:2354) is the same. The stack uses item spacing -1 between all four children, so the spacer nets 6 px from the arrow tip to the trigger and 11 px from the popup edge to the trigger.
Docs previewer states ("4 states"):
- hidden: the trigger alone at opacity 0.5
- top: popup above, arrow pointing down (direction inferred, as above)
- bottom: arrow pointing up, popup below (direction inferred)
- delayed: the top drawing at opacity 0.5
 The state popups are smaller: padding 4 / 8, arrow 9 x 5.
Docs previewer: chip "client - 1.1 KB" (the only one of the ten not marked server). Head: "One or two lines of text on hover; a shared delay makes the next tooltip open instantly." Playground: placement (top), delay (600), closeDelay (0), toggles showArrow (drawn on, 138:2335), disabled (off, 138:2340) and instant (off, 138:2343).
Code sample (150:1089): <TooltipRoot><TooltipTrigger render={<IconButton label="Copy link" variant="ghost" />}><Icon name="link-simple" /></TooltipTrigger><TooltipPopup placement="top">Copy link</TooltipPopup></TooltipRoot>. Imports: { TooltipPopup, TooltipRoot, TooltipTrigger } from 'topclassui/tooltip', IconButton from 'topclassui/icon-button' and Icon from 'topclassui/icon'. The sample has no provider element. Note: "Touch never shows a tooltip, so the trigger's own label must repeat the text."
Frame description: "One or two lines of plain text, never more. Anything with a link or a control is a Popover instead - that is a lint rule, not a suggestion."
The shared delay belongs to the app provider. Page: Provider, "What it renders" (193:2890, 193:2900): "Tooltip provider - A shared delay, so the second tooltip opens at once.", listed beside Direction provider, Toast viewport and Isolation root.
A connector consumes Tooltip. Page: Connectors, "Previewer: AdaptiveTooltip" 402:2180: "A hover tooltip where there is a pointer, a tap popover where there is not."; fine pointer -> Tooltip, coarse pointer -> Popover, query (hover: none); Keyboard: "Focus opens it". Sample: <AdaptiveTooltip content="Copy link"><IconButton icon="link-simple" label="Copy" /></AdaptiveTooltip>.
Section: the docs site files Tooltip under "Overlays", whose intro says "Overlays share one scroll rule: the overlay scrolls, the page behind it does not. Placement is logical, so it mirrors in Arabic."
Modes: Tooltip is drawn in Light only; nothing named Tooltip is in the Modes frame or the Direction frame. From the variables, Dark flips it: neutral/solid aliases Palette neutral/100 and neutral/on-solid aliases neutral/950, so the popup becomes a light chip with dark text on a dark page. src/tokens.css agrees.
Changelog (183:2702): "Every part family now has a `<Name>Root`, so a server file can import the flat name." The install row (138:2389, import { Tooltip } from '@/topclassui/components/tooltip') is the stale side.
Surprising:
- Only top and bottom are drawn; no placement on the inline sides (start and end in src/shared/floating.ts).
- No two-line example and no maximum width are drawn, although the text allows two lines.
- Radius 8 equals radius/control in Light but is unbound, so it does not become a pill in Ocean in Figma.
- Padding, radius and arrow size are raw; only the colors are bound.
- The install row imports { Tooltip } while the code sample imports TooltipRoot, TooltipTrigger, TooltipPopup. The Changelog settles it: TooltipRoot.
- No trigger is designed: the stage trigger is an empty placeholder square, and the IconButton of the code sample is drawn nowhere.
```

**Build this.** Client, the first client component in the repo. Tier 1, `overlays`. Built
last and alone. Read `node_modules/@base-ui/react/tooltip/` first (`R-0-1`). It imports
nothing from the provider and every test passes without it, so if
`feat/shared-tooltip-provider` is still open when the nine are done, build Tooltip anyway
and say so in the pull request: the grouped delay arrives when both are merged.

- **Parts**, exported flat: `TooltipRoot`, `TooltipTrigger`, `TooltipPopup`. No bare
  `Tooltip` and no provider export: `TopClassProvider` owns the shared delay.
- **Types** are derived at the seam (`R-5.7-5`): `Omit<Base.Root.Props, 'className'>` and so
  on, never a hand-copied prop list. Every Base UI prop (`open`, `defaultOpen`,
  `onOpenChange`, `disabled`, `closeOnClick` and the rest) passes through untouched; "Which
  props get built" is about the design props we add.
- **`TooltipRoot`** renders no element, so it takes no `className`, `style` or `ref`.
- **`TooltipTrigger`.** Base UI's Trigger, so it takes `render`, as the code sample uses it.
  It adds no class of its own: the ring and the target belong to the element passed to
  `render`. Every demo passes `render={<Button ... />}`; a bare trigger is an unstyled
  24 px `<button>` and fails the 44 px coarse check of `e2e/target-size.spec.ts`. `delay`
  and `closeDelay` are clamped to `TOOLTIP_BOUNDARIES` (`delayMin: 0`, `delayMax: 10000`)
  only when the caller passes them; left out, nothing is forwarded, so Base UI's own 600 and
  0 apply and a provider delay can still reach the trigger. `TOOLTIP_DEFAULTS` and the
  schema record 600 and 0. In 1.8.0 the two props are on Trigger and on Provider, not on
  Root.
- **`TooltipPopup`.** Renders Base UI's Portal, Positioner, Popup and Arrow. `placement`: the
  twelve `PLACEMENTS` through `toSideAlign`, default `top`, declared in `TOOLTIP_DEFAULTS`
  because the shared default is for menus. `children` is text only, typed in `types.ts` as
  `TooltipText | readonly TooltipText[]` with `TooltipText = string | number`, on
  `Omit<Base.Popup.Props, 'className' | 'children' | 'render'>`. A bare `string` would
  reject `Delete {count} rows`, which JSX passes as an array; this takes it and still
  refuses an element or a link, so a tooltip stays text-only without a lint rule
  (`R-10.5-2`).
- **Classes.** Popup: `max-w-xs wrap-anywhere rounded-control bg-neutral-solid px-3 py-1
  text-xs text-neutral-on-solid`, so it wraps, and a long file name breaks instead of
  leaving the chip. Positioner: `z-(--tc-z-popup) data-anchor-hidden:invisible`, so a
  tooltip whose trigger scrolls away hides (`docs/PLAN.md` 10.5), with `collisionPadding`
  from `POPUP_BOUNDS` and a `sideOffset` of `POPUP_BOUNDS.sideOffset +
  TOOLTIP_ARROW_HEIGHT`, a `5` in `tooltip/constants.ts`: Figma nets 11 px from the popup
  to the trigger.
- **Arrow.** A rotated square, `size-2 rotate-45 bg-neutral-solid`, always shown, the last
  child of the Popup. Base UI sets only its cross-axis offset inline, so the edge it sits on
  is ours, keyed on the `data-side` Base UI writes: `data-[side=top]:-bottom-1
  data-[side=bottom]:-top-1 data-[side=inline-start]:-inset-e-1
  data-[side=inline-end]:-inset-s-1`. Those four are all `toSideAlign` asks for, but Base
  UI also writes `left` and `right`: its tooltip default is `fallbackAxisSide: 'end'`, so a
  `top` or `bottom` popup with room on neither side moves beside the trigger, where no
  class above matches and the lint refuses `left-*` and `right-*`. Pass
  `collisionAvoidance={{ fallbackAxisSide: 'none' }}` to the Positioner, so a side only
  ever flips to its opposite. `<Svg>` is the only component that may emit an `<svg>`.
- **Accessibility.** Base UI 1.8.0 gives the popup no `role` and the trigger no
  `aria-describedby`: the tooltip is visual only. So the accessible name of the trigger
  carries the text (`docs/PLAN.md` 10.4 and the Figma note): an icon-only trigger in a demo
  takes an `aria-label` equal to the tooltip text. Add no role by hand, and find the popup
  in tests by its text, not by `getByRole('tooltip')`.
- **No `zod/mini`.** `clamp()` covers the two delays. `schema.ts` still exists, imported
  with `import type` only: `placement` as an enum of `PLACEMENTS`, and `delay` and
  `closeDelay` with the bounds of `TOOLTIP_BOUNDARIES` (`R-5.7-7`). No `variants.ts`: the
  classes are plain strings in `tooltip/classes.ts`.
- **`meta.ts`.** `rendering: 'client'`, `baseUi: 'tooltip'`, `baseUiRange: '1.8.0'`.
- **File layout.** Yours to propose, inside `R-5.1-2` (`index.tsx` holds no markup) and
  `R-5.12-1`. What the gates allow: none requires `client.tsx`, a `parts/*.tsx` may start
  with `'use client'`, and `hook.ts` is refused without `client.tsx`. The two guards that
  know about client code (`src/shared/meta.test.ts` and `no-zod-at-runtime.test.ts`) only
  see a file named `client.tsx`, so prefer one `client.tsx` holding the three parts, with
  no `hook.ts` and no `lib.tsx`: Base UI holds the state. Write the layout under Decisions.
- **Tests.** happy-dom: opens on hover and on focus, closes on Escape and on leave, the
  delays clamp, `placement` maps to `side` and `align`, and hydration is clean. Base UI
  reads `inline-start` and `inline-end` from its own direction context, not from `dir`, so
  an RTL test wraps the tooltip in `TopClassProvider` with `direction="rtl"`. The static
  harness runs no script, so no popup can open in Playwright: list "stays inside the
  viewport at all four edges" and "the arrow sits on the right edge" under Deferred, and
  leave `scripts/build-harness.tsx` alone.
- **Mutation.** The `delay` clamp: remove it and a `delay` of 20000 must fail a test.
- **Not built:** `showArrow`, `instant`, a character cap, a touch fallback (that is the
  AdaptiveTooltip connector), an enter or exit transition (the pattern of `docs/PLAN.md`
  5.8 needs `scale`, which `TRANSITION` does not carry).
- **For the reviewer:** in Dark the popup is a light chip with dark text, from the tokens.
  In Ocean `rounded-control` makes a two-line popup very round. The generated README prints
  `import { Tooltip } from 'topclassui'`, which is not an export, and says the rest props
  reach the root element, which `TooltipRoot` does not render. Both lines come from
  `scripts/lib/readme.ts`, which the local session fixes. Do not edit the script or the
  generated lines.

## Notes

```text
Source: file BxRSdAVOhk9Hj3Tkq4tjcy, read-only, text facts only. "bound" means a Figma variable is attached; "raw" means a typed number with no variable.
Component sets: of the ten, only Badge is a COMPONENT_SET. The other nine are plain frames. The Components page has eight sets in total: Button, Input, Badge, Tag, Checkbox, Radio, Switch, Avatar.
Kbd and EmptyState have no frame of their own; they sit inside "Code block, Kbd and Avatar group" 83:337 and "Popover and Empty state" 77:316.
Variables: five collections, 151 variables. Palette (36, one mode), Knobs (11; Light / Dark / Ocean), Size (35, one mode), Semantic (51; Light / Dark / Ocean), Type (18, one mode). None carries code syntax (0 of 151). There are no paint styles and no effect styles.
How the variables map to code (docs/PLAN.md 6.6 has the table): Semantic <tone>/<role> and base/<role> are --tc-<tone>-<role> and --tc-<role> in src/tokens.css, used as bg-, text- and border- classes. Size control, toggle, icon, padding-x and padding-y are --spacing-control-*, -toggle-*, -icon-*, -pad-x-* and -pad-y-* in src/styles.css (h-control-md, px-pad-x-md, py-pad-y-md). Size gap/* and font-size/* have no token in code at all. The radii are --radius-control, --radius-box and --radius-chip in src/styles.css (rounded-control, rounded-box, rounded-chip). Knobs radius/base is --tc-radius, border/width is --tc-line-width and list/row-height is --tc-row-height; ring/width, ring/offset, density, list/rows and overlay/inset keep their names.
Size scale (xs / sm / md / lg / xl):
- control 28 / 32 / 40 / 48 / 56
- padding-x 8 / 12 / 16 / 20 / 24
- padding-y 2 / 4 / 6 / 8 / 10
- gap 4 / 6 / 8 / 8 / 12 (Figma only: the code has no gap token, and Button uses gap-2 at every size)
- font-size 12 / 14 / 14 / 16 / 18 (Figma only: the code has no font-size token, and CONTROL_SIZE uses text-xs / text-sm / text-sm / text-base / text-base, so xl is 16 in code; docs/PLAN.md 5.2 says text-lg at xl)
- icon 16 / 20 / 24 / 32 / 40
- toggle 14 / 16 / 20 / 24 / 28
Two scales share step names for different values: Size font-size/lg is 16 and /xl is 18, while Type font-size/lg is 18 and /xl is 20 (Type runs xs, sm, base, lg, xl). So a Badge at size lg is text-base, not text-lg.
Knobs (Light / Dark / Ocean): radius/base 8/8/100, radius/control 8/8/100, radius/box 12/12/28, radius/chip 4/4/100, border/width 1, ring/width 2, ring/offset 2, density 1, list/rows 7, list/row-height 40, overlay/inset 16.
Radius by family:
- radius/chip: Badge (and Tag)
- radius/box: Card, Alert, EmptyState
- radius/control: Button, and the buttons drawn inside Card on the Components page and in the Modes frame (the buttons in the Card previewer are raw 8)
- raw radii: Kbd 4, Tooltip 8, Skeleton 4/6/10/12/half, Progress 2 to 10 (always a full pill)
Ocean radius, Figma against code: Figma has chip 100 and box 28. src/styles.css computes --radius-chip as min(0.5 x --tc-radius, 0.5rem) = 8 px and --radius-box as min(1.5 x --tc-radius, 1.5rem) = 24 px. The Light values agree (4 and 12). In code Ocean sets --tc-radius to 9999px, so base and control are 9999px where Figma has 100; both are a full pill at every control height, so nothing renders differently.
What is bound across the ten, on the Components page: all fills, strokes and text colors (Semantic); Badge padding-y, font size and radius, and its gap in the frame 69:95; Spinner icon size; the radius of Card, Alert and EmptyState; and, on the "Button sm" frames inside Card, the height (Size control/sm) and the radius (Knobs radius/control). Everything else is raw: every stroke weight (1 everywhere except the Card focus ring, which is 2; never Knobs border/width), all padding except the vertical padding of Badge, all gaps except the gap of Badge, and every other height. In the docs previewers fewer sizes are bound: the Badge copies bind the radius alone, and the Spinner instances bind no size (their fill stays bound). In the Modes frame the Badge copies bind the radius alone, and the "Button md" inside each card binds its height (Size control/md) and its label font size (Size font-size/md).
Tones: Semantic has solid, on-solid, soft and on-soft for all six tones. Badge draws all six. Alert draws info, success, warning, danger. Progress draws primary, success, warning, danger. Tooltip uses neutral/solid with neutral/on-solid. Skeleton and the Progress track use neutral/soft.
Hover and active variables (hover, active, soft-hover, soft-active) exist in Figma only for primary, neutral and danger. In code all six tones have all four (src/tokens.css), as the DECISIONS entry of 2026-09-22 planned. None of the ten uses them; Card's hover is a fill swap from base/surface-raised to base/surface.
base/ring is an alias of primary/on-soft in all three modes. warning/on-solid is neutral/950 (dark) in every mode. primary, success, danger and info on-solid are white in every mode. neutral/on-solid is white in Light and Ocean and neutral/950 in Dark, where neutral/solid flips from neutral/900 to neutral/100: so a Tooltip and a solid neutral Badge are dark text on a light fill in Dark. src/tokens.css agrees.
Text: 27 text styles exist (text-xs to text-5xl in regular / medium / strong: 12/16, 14/20, 16/24, 18/28, 20/28 and up), but no layer in these ten uses one, and every line height is Auto. Hug-height drawings therefore use Inter's automatic line box: 12 -> 15, 14 -> 17, 16 -> 19, 18 -> 22. A md Badge is 29 tall in Figma; with the 20 px line height of the type scale it would be 32.
Fonts: Inter for UI text (Medium for Badge and button labels, Semi Bold for titles, Regular for body); Roboto Mono for Kbd and the Separator label; Noto Sans Arabic in the RTL drawing. The library ships no font (DECISIONS 2026-09-21): the code uses the system stacks behind font-sans and font-mono and never names a family, so the line boxes of Inter are not targets.
States drawn: Kbd (idle, hover, active, disabled), Card (idle, hover, focus-visible), Progress (empty, half, complete, success, danger, indeterminate), Tooltip (hidden, top, bottom, delayed), EmptyState (default, filtered, error, compact). Badge, Spinner, Skeleton, Separator and Alert have no interaction states. Disabled is always opacity 0.5.
Docs previewers: each "Previewer: <Name>" frame is head / stage + playground / code / states / install row. The playground lists prop names, and several named props are drawn nowhere (Badge dot, uppercase, truncate; Spinner label, centered, overlay; Separator spacing; Skeleton animate; Progress showLabel; Kbd variant and size; Card variant and padding; Alert and EmptyState size beyond md). Progress is drawn at all five sizes, on the Components page only.
Playground toggles: the position is readable from the layers. Each toggle is a 16 x 16 frame under playground > tg > row; on is fill Semantic primary/solid plus an icon/check instance, off is fill base/surface-raised with a base/line-strong stroke and no child. On: Skeleton animate and rounded; Separator decorative; Alert dismissible and withIcon; EmptyState withAction and bordered; Card footer; Tooltip showArrow. Off: Badge dot, uppercase, truncate; Spinner label, centered, overlay; Separator withLabel; Kbd pressed, muted, disabled; EmptyState compact; Progress indeterminate and showLabel; Card interactive and media; Tooltip disabled and instant. The Button playground (135:154: solid, primary, md) equals BUTTON_DEFAULTS in code, so the selected values of a playground are the best evidence the file has for a default.
Docs sections: the docs site groups the 46 cards under section headers. Kbd is under Actions; Badge, Card, Separator and Skeleton under Display; Alert, Progress, Spinner and EmptyState under Feedback; Tooltip under Overlays. Display intro: "Nearly all of them render on the server and ship no JavaScript...". The Contents frame on the Components page (87:288) spells it "Empty state" and counts 7 in Feedback (it adds Stepper); the docs site says 6. meta.ts takes its category from docs/PLAN.md section 18, not from either.
Two copies of the docs site exist: "Docs site - LTR" 133:148 on Docs pages, and a second "Docs site - LTR" 438:2388 on the Components page. The ten previewers match in structure, but the Components-page copy still ends each card with "Import from the package" (docs/STATUS.md open question 2 calls that text false), where 133:148 says "Then import it" from '@/topclassui/components/<name>'. I read 133:148, which is the one to trust: it sits in the finished row at (20160, 0) on Docs pages, as docs/STATUS.md lists it, while 438:2388 sits at (7824, -7593) on Components. Both hold the same 46 previewers in the same order, and the ten have identical node counts.
Import paths disagree inside 133:148: every code sample imports from 'topclassui/<name>', while the install row imports from '@/topclassui/components/<name>'.
The code samples also import Text, Heading and IconButton, which have no card among the 46 previewers and are in no unit of docs/CLOUD-PLAN.md, plus Icon (Badge, Kbd, Tooltip), Button (EmptyState, Card), Link from next/link (EmptyState) and Suspense from react (Skeleton). Only button, icon, icon-registry and svg exist under src/components today, and no docs frame uses any of the ten in JSX outside its own card.
Icons used by these drawings and samples: circle-notch, info, check-circle, warning, warning-circle, x, tray, magnifying-glass, plus, image, command, link-simple. All twelve already exist under src/icons/data.
RTL: the only one of the ten drawn right-to-left is Alert (Direction frame 86:276). The Docs site - RTL frame holds only button, input and pagination. (Confirmed by layer name only: a right-to-left drawing under another layer name would not have been found.)
Other places where Figma and code differ in value, all expected: on-soft for success, warning and info is the 700 step in Figma Light (emerald/700, amber/700, sky/700) and the 800 step in src/tokens.css; Figma Ocean overrides base/page, base/surface, base/surface-raised, base/line and the primary soft tints as raw hex, while the ocean block in code overrides only primary-* and --tc-radius; soft tints are raw hex per mode in Figma and color-mix in code. A rendered Alert or Badge will therefore not match Figma pixel for pixel, and should not be made to.
```

## Choices for Omar

Every row has a default above, so nothing here blocks the build. Changing one later is one
small pull request.

| # | Choice | Built as | The other option |
|---|---|---|---|
| 1 | Badge default variant | `soft`, as the docs playground and every drawing of one Badge on its own show | `solid`, the first cell of the Figma set and Button's default |
| 2 | Ocean radius | the code caps: chip 8 px, box 24 px | Figma's 100 and 28, which makes Ocean badges full pills and needs a change to `src/styles.css` |
| 3 | The xl text size | Badge xl is 18 px, as Figma and the plan say | 16 px, to match Button's xl in code; or fix Button to 18 |
| 4 | Alert dismiss button | not built: Alert stays a server component and Banner owns dismissal | a close slot on Alert, with a 24 px target and a focus ring that are not drawn |
| 5 | Card | not interactive, no media part, padding on the root | hover and focus states, a media part that bleeds to the edge |
| 6 | Separator label ("or") | not built | a labelled form, with a real type size instead of the drawn 9 or 10 px |
| 7 | Spinner glyph | `circle-notch`, as Figma draws | the `spinner` glyph Button's loading state uses, so the two match |
| 8 | Spinner default color | `primary`, as the playground shows | the color of the surrounding text |
| 9 | Kbd | one size, no states | the hover, active and disabled drawings |
| 10 | Progress xs height | 2 px, from the token | 4 px, as drawn |
| 11 | Alert description opacity | none, to keep 4.5:1 | the drawn 0.85 and 0.9 |
| 12 | Tooltip in a browser test | deferred: the harness cannot open a popup | a hydrating harness, which every overlay in Unit 3 will need anyway |

Outside Unit 1, noticed while checking: `ErrorState` and `IconButton` are in no unit of
`docs/CLOUD-PLAN.md`, and `Meter` is in Unit 5 without a card among the site's 46.
