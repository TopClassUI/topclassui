// R-8.3-2: the value lists and the defaults. The bounds live in boundaries.ts.
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'

export const RATING_SIZES = SIZES

/** How much of a star is drawn: the read-only half rounds to the nearest half. */
export const RATING_FILLS = ['none', 'half', 'full'] as const

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const RATING_DEFAULTS = {
  value: 0,
  max: 5,
  size: DEFAULT_SIZE,
  readOnly: true,
  disabled: false,
  locale: 'en',
} as const
