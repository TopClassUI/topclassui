// R-8.3-2: the value lists and the defaults. The bound of a label lives in boundaries.ts.
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'

export const SEGMENTED_CONTROL_SIZES = SIZES

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const SEGMENTED_CONTROL_DEFAULTS = {
  size: DEFAULT_SIZE,
  fullWidth: false,
  invalid: false,
} as const
