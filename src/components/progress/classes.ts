/** R-5.12-4: Progress's own class tables. The track reads its height from one, and
 * the bar its fill from the other. */
import type { Size } from '#shared/contracts/size.js'
import type { Tone } from '#shared/contracts/tone.js'

/** The frame says "height follows padding-y": 2 to 10 px, so it scales with density. */
export const TRACK_HEIGHT = {
  xs: 'h-pad-y-xs',
  sm: 'h-pad-y-sm',
  md: 'h-pad-y-md',
  lg: 'h-pad-y-lg',
  xl: 'h-pad-y-xl',
  custom: '',
} as const satisfies Record<Size, string>

/** R-5.2-3: a lookup of complete class strings, never a name built from an expression. */
export const BAR_FILL = {
  primary: 'bg-primary-solid',
  neutral: 'bg-neutral-solid',
  success: 'bg-success-solid',
  warning: 'bg-warning-solid',
  danger: 'bg-danger-solid',
  info: 'bg-info-solid',
} as const satisfies Record<Tone, string>
