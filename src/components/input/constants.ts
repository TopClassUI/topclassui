// R-8.3-2: the value lists and the defaults. The cap lives in shared/contracts/boundaries.ts.
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'

export const INPUT_SIZES = SIZES

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const INPUT_DEFAULTS = {
  size: DEFAULT_SIZE,
  invalid: false,
  fullWidth: false,
} as const

/** The native default, written out so the type is always in the markup. */
export const INPUT_DEFAULT_TYPE = 'text'

/** The six types HTML allows `maxlength` on; every other type gets no cap at all (R-5.7-8). */
export const INPUT_CAPPED_TYPES = ['text', 'search', 'url', 'tel', 'email', 'password'] as const
