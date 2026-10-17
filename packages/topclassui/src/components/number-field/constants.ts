// R-8.3-2: the value lists and the defaults. The bounds live in boundaries.ts.
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'

export const NUMBER_FIELD_SIZES = SIZES

/** Every prop's starting value. A caller overrides any of them by passing the prop. No `min` or `max`: Home and End
 * would jump to one. */
export const NUMBER_FIELD_DEFAULTS = {
  size: DEFAULT_SIZE,
  invalid: false,
  fullWidth: false,
  // Base UI's own default (choice 20): a decimal needs a step it fits, or the hidden input reports a step mismatch.
  step: 1,
} as const
