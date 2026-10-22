// R-5.12-4: this component's own class tables, built from the shared constants.
import { CONTAIN, DISABLED, FOCUS_RING_WITHIN, POINTER, TOUCH_TARGET } from '#shared/classes.js'
import type { RatingFill } from './types.js'

/** The row, read-only or editing. Ten xl stars are 436 px, so a row that meets a narrow box wraps. */
export const RATING_ROOT = `inline-flex flex-wrap items-center gap-1 ${CONTAIN}`

/** The radio group adds the disabled look: dimmed, and not-allowed under the pointer. */
export const RATING_GROUP = `${RATING_ROOT} ${DISABLED}`

/** One star: the outline, in a colour of 3:1, on the span and never on the svg. Drawn over the radio, it lets the pointer
 * through to it, so the radio's own cursor is the one shown, not-allowed when disabled, and a press still reaches it. */
export const RATING_STAR = 'pointer-events-none relative inline-flex shrink-0 text-line-strong'

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
export const RATING_STEP = `relative inline-flex items-center justify-center rounded-control ${TOUCH_TARGET} ${FOCUS_RING_WITHIN}`

/** The native radio, over the whole label: not sr-only, or it is a 1 px target. */
export const RATING_RADIO = `absolute inset-0 size-full appearance-none opacity-0 ${POINTER}`
