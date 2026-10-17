// R-8.3-2: the value lists and the defaults. The bounds live in boundaries.ts.
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'

export const SLIDER_SIZES = SIZES

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const SLIDER_DEFAULTS = {
  size: DEFAULT_SIZE,
  invalid: false,
  fullWidth: false,
  showValue: false,
  // Base UI's own three, written here so the schema documents them and a slider with no default starts at min.
  min: 0,
  max: 100,
  step: 1,
  largeStep: 10,
  minStepsBetweenValues: 0,
} as const
