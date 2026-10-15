// R-8.3-2: the value lists and the defaults. Stepper bounds nothing, so it has no boundaries.ts.
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'

/** A step's own status wins; without one it is worked out from `value` (lib.ts). */
export const STEPPER_STATUSES = ['done', 'current', 'todo', 'error'] as const

export const STEPPER_SIZES = SIZES

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const STEPPER_DEFAULTS = {
  size: DEFAULT_SIZE,
  locale: 'en',
} as const
