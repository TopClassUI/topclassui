// R-5.12-4: this component's own class tables, built from the shared constants.
import { CONTAIN, DISABLED, FOCUS_RING_WITHIN, FORCED_EDGE, TOUCH_TARGET } from '#shared/classes.js'
import type { Size } from '#shared/contracts/size.js'
import type { RatingFill } from './types.js'

/** The row, read-only or editing. Ten xl stars are 436 px, so a row that meets a narrow box wraps. */
export const RATING_ROOT = `inline-flex flex-wrap items-center gap-1 ${CONTAIN}`

/** The radio group adds the disabled look: dimmed, and no pointer reaches a star. */
export const RATING_GROUP = `${RATING_ROOT} ${DISABLED}`

/** One star: the outline, in a colour of 3:1, on the span and never on the svg. */
export const RATING_STAR = 'relative inline-flex shrink-0 text-line-strong'

/** The filled star over it, clipped from the inline start, so a half fills the right half in Arabic.
 * warning-on-soft, not warning-solid: amber-500 is 2.13:1 on a white page, and an icon needs 3:1. */
export const RATING_FILL = 'absolute inset-y-0 inset-s-0 flex overflow-hidden text-warning-on-soft'

/** How much of the filled star the clip shows. */
export const RATING_FILL_WIDTH = {
  full: 'w-full',
  half: 'w-1/2',
} as const satisfies Record<Exclude<RatingFill, 'none'>, string>

/** The filled icon keeps its full width inside a clip half as wide. */
export const RATING_FILL_ICON = 'max-w-none'

/** One step: a label as large as a target, ringed when the radio inside it has the keyboard. */
export const RATING_STEP = `relative inline-flex cursor-pointer items-center justify-center rounded-control ${TOUCH_TARGET} ${FOCUS_RING_WITHIN}`

/** The native radio, over the whole label: not sr-only, or it is a 1 px target. */
export const RATING_RADIO = 'absolute inset-0 size-full cursor-pointer appearance-none opacity-0'

/** A circle is a shape, not a radius knob, and a star fills about the circle of its box. */
export const RATING_SKELETON_STAR = `block shrink-0 rounded-full bg-neutral-soft animate-pulse motion-reduce:animate-none ${FORCED_EDGE}`

/** R-5.2-3: the px of ICON_SIZE, which Svg writes as its width and height; custom is 1em, as iconSizeOf makes it. */
export const RATING_SKELETON_SIZE = {
  xs: 'size-[16px]',
  sm: 'size-[20px]',
  md: 'size-[24px]',
  lg: 'size-[32px]',
  xl: 'size-[40px]',
  custom: 'size-[1em]',
} as const satisfies Record<Size, string>
