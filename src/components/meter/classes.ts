/** R-5.12-4: Meter's own class tables. The track reads its height from one, and the bar
 * its fill from the other. */
import type { Size } from '#shared/contracts/size.js'
import type { Tone } from '#shared/contracts/tone.js'

/** Progress's track, copied: no component imports another. The fill survives forced colours. */
export const METER_TRACK = 'w-full overflow-hidden rounded-control bg-neutral-soft forced-color-adjust-none'

/** Height follows padding-y, as the Progress frame says: 2 to 10 px, so it scales with density. */
export const METER_TRACK_HEIGHT = {
  xs: 'h-pad-y-xs',
  sm: 'h-pad-y-sm',
  md: 'h-pad-y-md',
  lg: 'h-pad-y-lg',
  xl: 'h-pad-y-xl',
  custom: '',
} as const satisfies Record<Size, string>

/** As wide as the clamped value, which index.tsx writes into --tc-meter-value. */
export const METER_BAR = 'h-full w-(--tc-meter-value) rounded-control'

/** R-5.2-3: complete strings, never a name built from the tone. */
export const METER_FILL = {
  primary: 'bg-primary-solid',
  neutral: 'bg-neutral-solid',
  success: 'bg-success-solid',
  warning: 'bg-warning-solid',
  danger: 'bg-danger-solid',
  info: 'bg-info-solid',
} as const satisfies Record<Tone, string>
