// R-5.2-4: every size, radius, ring, hover and transition class lives here, so a knob change reaches all 46 at once.

/** The width alone, so a filled control can hold the box size with a transparent colour. */
export const BORDER_WIDTH = 'border-(length:--tc-line-width)'

/** A hairline that is decorative, so it is exempt from the 3:1 rule. */
export const BORDER = `${BORDER_WIDTH} border-line`

/** A control boundary, which must reach 3:1 against every surface it can sit on. */
export const BORDER_STRONG = `${BORDER_WIDTH} border-line-strong`

/** Forced colours erase every fill, so a shape drawn by its fill alone keeps a line there and
 * nowhere else. An outline, not a border: it takes no room, so the box is the same in every mode. */
export const FORCED_EDGE = 'forced-colors:outline-(length:--tc-line-width)'

/** A real CSS outline with an offset, so the gap shows the actual backdrop on any surface. */
export const FOCUS_RING = [
  // outline-none, not outline-hidden: under forced colours that one paints a 2px outline on every control at rest.
  'outline-none',
  // Both resets set --tw-outline-style: none, which the width utility would substitute.
  'focus-visible:outline-solid',
  'focus-visible:outline-(length:--tc-ring-width)',
  'focus-visible:outline-offset-(length:--tc-ring-offset)',
  'focus-visible:outline-ring',
].join(' ')

/** Every transition multiplies by --tc-motion, so one knob can stop all of them. */
export const TRANSITION = 'transition-[color,background-color,border-color,outline-color,opacity,translate] duration-(--tc-duration) ease-out'

/** R-5.6-2: SC 2.5.8 is written in CSS px, so the floor is a px token, never a rem step. */
export const TOUCH_TARGET = [
  // The fallback matters: a consumer token file missing these would leave no floor at all.
  'min-h-[var(--tc-target-min,24px)]',
  'min-w-[var(--tc-target-min,24px)]',
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]',
  'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
].join(' ')

/** Hover and active are tone-driven: the compound variant sets the variables, these read them. */
export const HOVER = {
  solid: 'hover:bg-(--tc-hover) active:bg-(--tc-active)',
  soft: 'hover:bg-(--tc-soft-hover) active:bg-(--tc-soft-active)',
  // Transparent at rest, so they borrow the tone's tint on the way in rather than its next step.
  outline: 'hover:bg-(--tc-soft) active:bg-(--tc-soft-hover)',
  ghost: 'hover:bg-(--tc-soft) active:bg-(--tc-soft-hover)',
  link: 'hover:underline',
} as const

/** The height alone, so a skeleton stands in for a control without copying the value. */
export const CONTROL_HEIGHT = {
  xs: 'h-control-xs',
  sm: 'h-control-sm',
  md: 'h-control-md',
  lg: 'h-control-lg',
  xl: 'h-control-xl',
  custom: '',
} as const

/** Height, inline padding and the type step. `custom` emits nothing, which opts a component out. */
export const CONTROL_SIZE = {
  xs: `${CONTROL_HEIGHT.xs} px-pad-x-xs text-xs`,
  sm: `${CONTROL_HEIGHT.sm} px-pad-x-sm text-sm`,
  md: `${CONTROL_HEIGHT.md} px-pad-x-md text-sm`,
  lg: `${CONTROL_HEIGHT.lg} px-pad-x-lg text-base`,
  xl: `${CONTROL_HEIGHT.xl} px-pad-x-xl text-base`,
  custom: '',
} as const

/** Checkbox, radio and switch boxes, which are square rather than control-height. */
export const TOGGLE_SIZE = {
  xs: 'size-toggle-xs',
  sm: 'size-toggle-sm',
  md: 'size-toggle-md',
  lg: 'size-toggle-lg',
  xl: 'size-toggle-xl',
  custom: '',
} as const

/** R-10.5-1: a scroll container inside an overlay never scrolls the page behind it. A control that
 * Tab scrolls into view lands flush with its edge, so the area keeps the reach of the focus ring clear. */
export const SCROLL_AREA = 'overflow-y-auto overscroll-contain scroll-py-[calc(var(--tc-ring-width)+var(--tc-ring-offset))]'

/** Disabled is opacity plus no pointer events; loading keeps full colour so it never reads as disabled. */
// data-disabled carries it for an element with no disabled attribute, such as an anchor.
export const DISABLED = [
  'disabled:pointer-events-none disabled:opacity-50',
  'data-disabled:pointer-events-none data-disabled:opacity-50',
].join(' ')

/** Full colour while busy, and no clicks. No cursor: a loading control is always
 * pointer-events: none, so one could never paint. The order is pinned by a test. */
export const LOADING = 'aria-busy:opacity-100 data-loading:pointer-events-none'

/** A control never outgrows its box. Measured at 436px inside a 200px box before
 * this existed. */
export const CONTAIN = 'max-w-full'

/** The label truncates, so the control shrinks rather than the page. It needs its
 * own element: `text-overflow` never applies to an anonymous flex item. */
export const LABEL = 'truncate min-w-0'

// Unit 3: what the overlays, the menus and the bars share. A state class reads the attribute Base UI sets.

/** The dimmed layer behind a modal. It sets no z-index: each overlay brings its own from the scale. */
export const SCRIM = 'fixed inset-0 bg-overlay'

/** Fades on the two attributes Base UI sets for one frame on the way in and for the way out. */
export const FADE_MOTION = 'transition-opacity duration-(--tc-duration) ease-out data-starting-style:opacity-0 data-ending-style:opacity-0'

/** A popup grows from the side that faces its anchor: Base UI measures --transform-origin. */
export const POPUP_MOTION = 'origin-(--transform-origin) transition-[opacity,scale] duration-(--tc-duration) ease-out data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0'

/** A panel that slides. A swipe follows the finger, so nothing eases while one holds it. */
export const SLIDE_MOTION = 'transition-[translate,opacity] duration-(--tc-duration-slow) ease-out data-swiping:transition-none'

/** The box of a dialog, a popup and a toast. Forced colours drop the shadow and keep the line. */
export const OVERLAY_SURFACE = `rounded-box bg-surface-raised text-body ${BORDER} shadow-lg`

/** One row of a menu or a list, at least --tc-row-height tall. Its highlight is its focus mark. */
export const ROW = 'flex min-h-(--tc-row-height) w-full items-center gap-2 rounded-control px-3 text-start text-sm outline-none'

/** The row the keyboard or the pointer is on. Forced colours erase a fill, so there it takes the
 * system pair and paints it itself: left adjusted, Chromium lays a backplate over the label. */
export const ROW_HIGHLIGHT = 'data-highlighted:bg-primary-soft data-highlighted:text-primary-on-soft forced-colors:data-highlighted:forced-color-adjust-none forced-colors:data-highlighted:bg-[Highlight] forced-colors:data-highlighted:text-[HighlightText]'

/** At most --tc-list-rows rows, and never past the room Base UI measured. It counts rows and not
 * the padding or the gaps, so the last row shown is cut short: a cut row says there is more. */
export const LIST_CAP = 'max-h-[min(var(--available-height,100dvh),calc(var(--tc-list-rows)*var(--tc-row-height)))]'

/** Scrolls sideways inside its own box, so the page never grows wider than the screen. */
export const SCROLL_X = 'overflow-x-auto overscroll-x-contain'

/** R-10.5-3: a bar that sticks to the top. Whoever wears it sets --tc-sticky-top to its height. */
export const STICKY_TOP = 'sticky top-0 z-(--tc-z-sticky)'

/** A control that holds one icon and no text: the x of an overlay, the toggle of a sidebar. */
export const ICON_BUTTON = `inline-flex shrink-0 items-center justify-center rounded-control ${TOUCH_TARGET} ${FOCUS_RING} ${TRANSITION}`

/** The ring drawn inside the box, for a control flush against an edge that clips it. */
export const FOCUS_RING_INSET = 'outline-none focus-visible:outline-solid focus-visible:outline-(length:--tc-ring-width) focus-visible:-outline-offset-(length:--tc-ring-width) focus-visible:outline-ring'

/** The ring on a wrapper whose focused element is hidden: a label around a native radio. */
export const FOCUS_RING_WITHIN = 'outline-none has-focus-visible:outline-solid has-focus-visible:outline-(length:--tc-ring-width) has-focus-visible:outline-offset-(length:--tc-ring-offset) has-focus-visible:outline-ring'

/** On the bar that holds an overlay's actions. An action is the decision, so its label wraps where
 * Button alone would end it in an ellipsis. A Button of one of the five sizes grows from its own height,
 * and never drops under the 44 px a finger needs; a custom one keeps the height its caller gave it. */
export const ACTIONS_WRAP = [
  '**:whitespace-normal *:data-size:text-center',
  '*:data-size:not-data-[size=custom]:h-auto *:data-size:not-data-[size=custom]:py-1',
  '*:data-[size=xs]:min-h-control-xs *:data-[size=sm]:min-h-control-sm *:data-[size=md]:min-h-control-md',
  '*:data-[size=lg]:min-h-control-lg *:data-[size=xl]:min-h-control-xl',
  'pointer-coarse:*:data-[size=xs]:min-h-[var(--tc-target-coarse,44px)]',
  'pointer-coarse:*:data-[size=sm]:min-h-[var(--tc-target-coarse,44px)]',
  'pointer-coarse:*:data-[size=md]:min-h-[var(--tc-target-coarse,44px)]',
].join(' ')

/** An overlay that is not modal leaves the page usable: the viewport that covers the screen for
 * a dialog or a drawer lets every press through. A popover has no such layer and needs neither. */
export const VIEWPORT_PASSIVE = 'pointer-events-none'

/** And the popup inside that viewport takes its own presses back. */
export const POPUP_PASSIVE = 'pointer-events-auto'

// Unit 4: the toggles. The element that takes the press is a group; the drawn box inside it reads the group's state.

/** What takes the press: 24 px, 44 under a coarse pointer, whatever size the drawn box is. w-fit: laid straight into a grid it would fill the track. */
export const TOGGLE_TARGET = `group/toggle relative inline-flex w-fit shrink-0 items-center justify-center outline-none ${TOUCH_TARGET} ${DISABLED}`

/** The ring of a focused target, drawn on the box inside it. The group is named: a bare one would match an accordion trigger around it. */
export const TOGGLE_RING = 'group-focus-visible/toggle:outline-solid group-focus-visible/toggle:outline-(length:--tc-ring-width) group-focus-visible/toggle:outline-offset-(length:--tc-ring-offset) group-focus-visible/toggle:outline-ring'

/** The drawn box. It sets no fill and no justify: two classes for one property do not merge in a string. */
export const TOGGLE_BOX = `inline-flex shrink-0 items-center ${BORDER_STRONG} ${TRANSITION} ${TOGGLE_RING}`

/** Checked: the fill, and under forced colours the system pair, since a fill is erased there. */
export const TOGGLE_ON = 'group-data-checked/toggle:border-primary-solid group-data-checked/toggle:bg-primary-solid group-data-checked/toggle:text-primary-on-solid forced-colors:group-data-checked/toggle:forced-color-adjust-none forced-colors:group-data-checked/toggle:border-[Highlight] forced-colors:group-data-checked/toggle:bg-[Highlight] forced-colors:group-data-checked/toggle:text-[HighlightText]'

/** Invalid: red and thicker, as on Input. The compound class makes it win over checked. */
export const TOGGLE_INVALID = 'group-aria-invalid/toggle:border-danger-solid group-aria-invalid/toggle:group-data-checked/toggle:border-danger-solid group-aria-invalid/toggle:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))] group-aria-invalid/toggle:inset-ring-danger-solid forced-colors:group-aria-invalid/toggle:border-(length:--tc-ring-width)'

// Unit 4: the fields. Input's own strings, lifted so the fields of Unit 4 share them; Input reads them under its old names.

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

// Unit 4: the rows of a list of options, for Select and Combobox. Each is added to ROW and ROW_HIGHLIGHT.

/** A row under a finger: raised to the coarse target, never below the row height a 32 px root or a density sets. */
export const ROW_TOUCH = 'pointer-coarse:min-h-[max(var(--tc-row-height),var(--tc-target-coarse,44px))]'

/** The chosen row differs by weight as well as by its tick. */
export const ROW_SELECTED = 'data-selected:font-medium'
