// R-8.3-2: the value lists and the defaults. The bounds live in boundaries.ts.
import { SIZES } from '#shared/contracts/size.js'
import { DEFAULT_TONE, TONES } from '#shared/contracts/tone.js'

export const BUTTON_VARIANTS = ['solid', 'soft', 'outline', 'ghost', 'link'] as const

export const BUTTON_TONES = TONES

export const BUTTON_SIZES = SIZES

/** The unfilled variants whose label stays body text in every tone, as Figma 64:340 draws them. */
export const BUTTON_BODY_TEXT = ['outline', 'ghost'] as const

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const BUTTON_DEFAULTS = {
  variant: 'solid',
  tone: DEFAULT_TONE,
  size: 'md',
  loading: false,
  fullWidth: false,
} as const
