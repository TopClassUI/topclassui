// R-8.3-2: the value lists and the defaults. The bounds live in boundaries.ts.
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'
import { TONES } from '#shared/contracts/tone.js'

export const TAG_TONES = TONES

export const TAG_SIZES = SIZES

/** Every prop's starting value. A caller overrides any of them by passing the prop.
 * neutral, not the shared primary: a tag names a topic, and a row of them stays quiet. */
export const TAG_DEFAULTS = {
  tone: 'neutral',
  size: DEFAULT_SIZE,
  disabled: false,
} as const
