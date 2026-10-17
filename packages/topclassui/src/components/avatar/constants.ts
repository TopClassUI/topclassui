// R-8.3-2: the value lists and the defaults. Avatar bounds nothing, so it has no boundaries.ts.
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'

export const AVATAR_SIZES = SIZES

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const AVATAR_DEFAULTS = {
  size: DEFAULT_SIZE,
} as const
