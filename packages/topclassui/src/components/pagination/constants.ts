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

/** The widths, in rem, a row can claim; styles.css holds a pagination-at-<n> for each, and the widest stands for any longer row. */
export const PAGINATION_ROW_STEPS = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48] as const

/** The widest step, which any longer row takes. */
export const PAGINATION_ROW_WIDEST = 48

/** A cell's width in px as the cell classes draw it at each size: an arrow, a page at its floor, and a page's
 * digit and padding, so a long number widens its cell. Measured in Chromium at 1440 px; rounded up. */
export const PAGINATION_CELL_PX = {
  xs: { arrow: 30, page: 26, digit: 7, padding: 18, gap: 4 },
  sm: { arrow: 32, page: 32, digit: 8, padding: 21, gap: 6 },
  md: { arrow: 40, page: 40, digit: 8, padding: 21, gap: 6 },
  lg: { arrow: 48, page: 48, digit: 9, padding: 24, gap: 8 },
  xl: { arrow: 56, page: 56, digit: 9, padding: 24, gap: 8 },
} as const
