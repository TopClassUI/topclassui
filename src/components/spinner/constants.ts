// R-8.3-2: the value lists and the defaults. Spinner bounds nothing, so it has no boundaries.ts.
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'
import { DEFAULT_TONE, TONES } from '#shared/contracts/tone.js'

export const SPINNER_TONES = TONES

export const SPINNER_SIZES = SIZES

/** Every prop's starting value. A caller overrides any of them by passing the prop.
 * md is the 24 px icon step; primary is the tone the docs playground shows. */
export const SPINNER_DEFAULTS = {
  size: DEFAULT_SIZE,
  tone: DEFAULT_TONE,
} as const
