// R-5.12-4: Spinner's own class table. The size is not a class: Svg owns the icon scale.
import type { Tone } from '#shared/contracts/tone.js'

/** R-5.2-3: a lookup of complete class strings. The glyph paints in currentColor, so the
 * text colour is the spinner's colour: the tone's on-soft step, the one Figma draws. */
export const SPINNER_TONE = {
  primary: 'text-primary-on-soft',
  neutral: 'text-neutral-on-soft',
  success: 'text-success-on-soft',
  warning: 'text-warning-on-soft',
  danger: 'text-danger-on-soft',
  info: 'text-info-on-soft',
} as const satisfies Record<Tone, string>
