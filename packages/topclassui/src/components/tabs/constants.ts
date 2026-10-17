// R-8.3-2: the value lists and the defaults. The bound of a label lives in boundaries.ts.
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'

/** line underlines the active tab; enclosed lifts it onto a raised surface inside a tinted box. */
export const TABS_VARIANTS = ['line', 'enclosed'] as const

export const TABS_SIZES = SIZES

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const TABS_DEFAULTS = {
  variant: 'line',
  size: DEFAULT_SIZE,
  // Not Base UI's false: a panel that stays mounted is in the server HTML, so its text is indexed.
  keepMounted: true,
} as const
