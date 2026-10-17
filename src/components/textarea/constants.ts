// R-8.3-2: the value lists and the defaults. The bounds live in boundaries.ts, the cap in shared/contracts/boundaries.ts.
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'

export const TEXTAREA_SIZES = SIZES

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const TEXTAREA_DEFAULTS = {
  size: DEFAULT_SIZE,
  invalid: false,
  fullWidth: false,
  rows: 3,
  maxRows: 6,
  autosize: false,
  showCount: false,
  validate: false,
} as const

/** The key of TEXT_MAX_LENGTH a textarea takes its default cap from. */
export const TEXTAREA_CAP_TYPE = 'textarea'

/** What a skeleton holds on each of its lines: a no-break space, which keeps the line's height. */
export const TEXTAREA_SKELETON_LINE = String.fromCharCode(0xa0)
