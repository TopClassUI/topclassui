// R-8.3-2: the value list and the defaults. Banner bounds nothing.
import { DEFAULT_TONE, TONES } from '#shared/contracts/tone.js'

export const BANNER_TONES = TONES

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const BANNER_DEFAULTS = {
  tone: DEFAULT_TONE,
  // Off, so a plain banner stays server HTML and ships no client code.
  dismissible: false,
} as const

/** A dismissal is remembered in localStorage under this prefix and the banner's id. */
export const BANNER_STORAGE_PREFIX = 'tc-banner-dismissed:'
