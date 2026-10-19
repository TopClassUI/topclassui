// R-8.3-2: the value lists and the defaults. The bounds live in boundaries.ts.
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'

export const PAGINATION_SIZES = SIZES

/** The two places a run of pages can be left out; each one renders "..." once. */
export const PAGINATION_GAPS = ['gap-start', 'gap-end'] as const

/** Every prop's starting value. A caller overrides any of them by passing the prop.
 * md like every control (R-5.7-2); size="sm" is the 32 px cell the frame draws. */
export const PAGINATION_DEFAULTS = {
  siblingCount: 1,
  boundaryCount: 1,
  size: DEFAULT_SIZE,
  disabled: false,
  locale: 'en',
} as const
