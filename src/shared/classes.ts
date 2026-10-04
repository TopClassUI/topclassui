// R-5.2-4: every size, radius, ring, hover and transition class lives here, so a knob change reaches all 46 at once.

/** A hairline that is decorative, so it is exempt from the 3:1 rule. */
export const BORDER = 'border-(length:--tc-line-width) border-line'

/** A control boundary, which must reach 3:1 against every surface it can sit on. */
export const BORDER_STRONG = 'border-(length:--tc-line-width) border-line-strong'

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

/** R-5.6-2: 24px on every pointer, 44px where the pointer is coarse. */
export const TOUCH_TARGET = 'min-h-6 min-w-6 pointer-coarse:min-h-11 pointer-coarse:min-w-11'

/** Hover and active are tone-driven: the compound variant sets the variables, these read them. */
export const HOVER = {
  solid: 'hover:bg-(--tc-hover) active:bg-(--tc-active)',
  soft: 'hover:bg-(--tc-soft-hover) active:bg-(--tc-soft-active)',
  outline: 'hover:bg-(--tc-soft-hover) active:bg-(--tc-soft-active)',
  ghost: 'hover:bg-(--tc-soft-hover) active:bg-(--tc-soft-active)',
  link: 'hover:underline',
} as const

/** Control height by size. `custom` emits nothing, which is what opts a component out. */
export const CONTROL_SIZE = {
  xs: 'h-control-xs px-pad-x-xs text-xs',
  sm: 'h-control-sm px-pad-x-sm text-sm',
  md: 'h-control-md px-pad-x-md text-sm',
  lg: 'h-control-lg px-pad-x-lg text-base',
  xl: 'h-control-xl px-pad-x-xl text-base',
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
export const DISABLED = 'disabled:pointer-events-none disabled:opacity-50'
export const LOADING = 'aria-busy:cursor-progress aria-busy:opacity-100'
