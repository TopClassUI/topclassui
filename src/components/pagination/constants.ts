// R-8.3-2: the value lists and the defaults. The bounds live in boundaries.ts.
import { SIZES } from '#shared/contracts/size.js'

export const PAGINATION_SIZES = SIZES

/** The two places a run of pages can be left out; each one renders "..." once. */
export const PAGINATION_GAPS = ['gap-start', 'gap-end'] as const

/** Every prop's starting value. A caller overrides any of them by passing the prop.
 * sm is the 32 px cell the frame draws, so it is the default instead of md. */
export const PAGINATION_DEFAULTS = {
  siblingCount: 1,
  boundaryCount: 1,
  size: 'sm',
  locale: 'en',
} as const
