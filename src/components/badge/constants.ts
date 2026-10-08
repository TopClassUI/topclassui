// R-8.3-2: the value lists and the defaults. The bounds live in boundaries.ts.
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'
import { DEFAULT_TONE, TONES } from '#shared/contracts/tone.js'

export const BADGE_VARIANTS = ['solid', 'soft', 'outline'] as const

export const BADGE_TONES = TONES

export const BADGE_SIZES = SIZES

/** Every prop's starting value. A caller overrides any of them by passing the prop.
 * soft, not solid: the docs playground and every drawing of a single Badge are soft. */
export const BADGE_DEFAULTS = {
  variant: 'soft',
  tone: DEFAULT_TONE,
  size: DEFAULT_SIZE,
} as const
