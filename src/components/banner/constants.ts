// R-8.3-2: the value list and the default. Banner bounds nothing.
import { DEFAULT_TONE, TONES } from '#shared/contracts/tone.js'

export const BANNER_TONES = TONES

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const BANNER_DEFAULTS = {
  tone: DEFAULT_TONE,
} as const
