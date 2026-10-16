/** R-5.12-4: Meter's own class tables. The track reads its height from one, and the bar
 * its fill from the other. */
import type { Size } from '#shared/contracts/size.js'
import type { Tone } from '#shared/contracts/tone.js'

/** Progress's track, copied: no component imports another. An outline, not a border, marks the full
 * range at 3:1 and takes no room from a 2 px track; forced colours paint both in system colours. */
export const METER_TRACK = 'w-full overflow-hidden rounded-control bg-neutral-soft outline-solid outline-(length:--tc-line-width) outline-line-strong forced-color-adjust-none forced-colors:bg-[Canvas] forced-colors:outline-[CanvasText]'

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
export const METER_BAR = 'h-full w-(--tc-meter-value) rounded-control forced-colors:bg-[CanvasText]'

/** R-5.2-3: complete strings. The tone's text colour, which check-contrast holds at 3:1 on the track. */
export const METER_FILL = {
  primary: 'bg-primary-on-soft',
  neutral: 'bg-neutral-on-soft',
  success: 'bg-success-on-soft',
  warning: 'bg-warning-on-soft',
  danger: 'bg-danger-on-soft',
  info: 'bg-info-on-soft',
} as const satisfies Record<Tone, string>
