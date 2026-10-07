// R-8.3-2: the value lists and defaults, imported by the schema, by cva and by the component.
import { SIZES } from '#shared/contracts/size.js'
import { DEFAULT_TONE, TONES } from '#shared/contracts/tone.js'

export const BUTTON_VARIANTS = ['solid', 'soft', 'outline', 'ghost', 'link'] as const

export const BUTTON_TONES = TONES

export const BUTTON_SIZES = SIZES

/** The three variants with no fill, so only the tone's text colour applies. */
export const BUTTON_UNFILLED = ['outline', 'ghost', 'link'] as const

export const BUTTON_DEFAULTS = {
  variant: 'solid',
  tone: DEFAULT_TONE,
  size: 'md',
  loading: false,
  fullWidth: false,
} as const
