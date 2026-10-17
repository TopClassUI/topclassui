// R-8.3-2: the value lists and the defaults. The bounds live in boundaries.ts.
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'
import { DEFAULT_TONE, TONES } from '#shared/contracts/tone.js'

export const PROGRESS_TONES = TONES

export const PROGRESS_SIZES = SIZES

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const PROGRESS_DEFAULTS = {
  value: 0,
  tone: DEFAULT_TONE,
  size: DEFAULT_SIZE,
  indeterminate: false,
} as const
