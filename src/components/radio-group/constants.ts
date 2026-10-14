// R-8.3-2: the value lists and the defaults. RadioGroup bounds nothing, so it has no boundaries.ts (R-8.3-6).
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'

export const RADIO_GROUP_SIZES = SIZES

/** Layout only: a column, or a row that wraps. The arrow keys are the same in both. */
export const RADIO_GROUP_ORIENTATIONS = ['vertical', 'horizontal'] as const

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const RADIO_GROUP_DEFAULTS = {
  size: DEFAULT_SIZE,
  orientation: 'vertical',
  invalid: false,
} as const
