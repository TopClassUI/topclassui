// R-5.2-4: every size, radius, ring, hover and transition class lives here, so a knob change reaches all 46 at once.

/** The width alone, so a filled control can hold the box size with a transparent colour. */
export const BORDER_WIDTH = 'border-(length:--tc-line-width)'

/** A hairline that is decorative, so it is exempt from the 3:1 rule. */
export const BORDER = `${BORDER_WIDTH} border-line`

/** A control boundary, which must reach 3:1 against every surface it can sit on. */
export const BORDER_STRONG = `${BORDER_WIDTH} border-line-strong`

/** A real CSS outline with an offset, so the gap shows the actual backdrop on any surface. */
export const FOCUS_RING = [
  // outline-hidden, not outline-none: it keeps a ring under forced-colors.
  'outline-hidden',
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

/** R-10.5-1: a scroll container inside an overlay never scrolls the page behind it. */
export const SCROLL_AREA = 'overflow-y-auto overscroll-contain'

/** Disabled is opacity plus no pointer events; loading keeps full colour so it never reads as disabled. */
// data-disabled carries it for an element with no disabled attribute, such as an anchor.
export const DISABLED = [
  'disabled:pointer-events-none disabled:opacity-50',
  'data-disabled:pointer-events-none data-disabled:opacity-50',
].join(' ')

/** Full colour, so loading never reads as disabled, and no clicks while it is busy. */
export const LOADING = 'aria-busy:cursor-progress aria-busy:opacity-100 data-loading:pointer-events-none'
