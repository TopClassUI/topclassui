// R-5.12-4: Timeline's own class tables. The stroke of the hollow dot is the shared knob.
import { BORDER_STRONG } from '#shared/classes.js'
import type { Tone } from '#shared/contracts/tone.js'

/** As tall as the first line of the title (text-sm is 20 px), so the marker centres on it. */
export const TIMELINE_MARKER = 'flex min-h-5 shrink-0 items-center'

/** A circle is a shape, not a radius knob, as the Skeleton circle is. */
const DOT = 'block size-3 rounded-full'

/** R-5.2-3: complete strings. forced-color-adjust-none keeps the fill, which forced colours
 * would repaint to nothing and leave a done item with no marker at all. */
export const TIMELINE_DOT = {
  primary: `${DOT} bg-primary-solid forced-color-adjust-none`,
  neutral: `${DOT} bg-neutral-solid forced-color-adjust-none`,
  success: `${DOT} bg-success-solid forced-color-adjust-none`,
  warning: `${DOT} bg-warning-solid forced-color-adjust-none`,
  danger: `${DOT} bg-danger-solid forced-color-adjust-none`,
  info: `${DOT} bg-info-solid forced-color-adjust-none`,
} as const satisfies Record<Tone, string>

/** A todo item: no fill, and a stroke that reaches 3:1 and survives forced colours. */
export const TIMELINE_DOT_HOLLOW = `${DOT} ${BORDER_STRONG}`

/** The colour of an icon that stands in for the dot; it reaches 4.5:1 on the page. */
export const TIMELINE_ICON = {
  primary: 'flex text-primary-on-soft',
  neutral: 'flex text-neutral-on-soft',
  success: 'flex text-success-on-soft',
  warning: 'flex text-warning-on-soft',
  danger: 'flex text-danger-on-soft',
  info: 'flex text-info-on-soft',
} as const satisfies Record<Tone, string>

export const TIMELINE_ICON_HOLLOW = 'flex text-muted'

/** The drawn 2 px fill, plus a transparent inline-start border inside the same box:
 * forced colours drop the fill and paint the border, so the rail never vanishes. */
export const TIMELINE_CONNECTOR = 'block w-0.5 flex-1 bg-line border-s-(length:--tc-line-width) border-transparent'
