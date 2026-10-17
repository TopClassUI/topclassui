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

/** An outline, not a border, marks the full range at 3:1 and takes no room from a 2 px track;
 * forced colours paint the track, its edge and the bar in system colours. */
export const TRACK = 'w-full overflow-hidden rounded-control bg-neutral-soft outline-solid outline-(length:--tc-line-width) outline-line-strong forced-color-adjust-none forced-colors:bg-[Canvas] forced-colors:outline-[CanvasText]'

/** R-5.2-3: complete strings. The tone's text colour, which check-contrast holds at 3:1 on the track. */
export const BAR_FILL = {
  primary: 'bg-primary-on-soft',
  neutral: 'bg-neutral-on-soft',
  success: 'bg-success-on-soft',
  warning: 'bg-warning-on-soft',
  danger: 'bg-danger-on-soft',
  info: 'bg-info-on-soft',
} as const satisfies Record<Tone, string>
