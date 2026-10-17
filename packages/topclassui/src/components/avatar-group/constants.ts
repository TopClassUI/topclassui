// R-8.3-2: the value lists and the defaults. The bounds live in boundaries.ts.
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'

export const AVATAR_GROUP_SIZES = SIZES

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const AVATAR_GROUP_DEFAULTS = {
  max: 4,
  size: DEFAULT_SIZE,
  locale: 'en',
} as const
