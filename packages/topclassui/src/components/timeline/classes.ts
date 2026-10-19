// R-5.12-4: Timeline's own class tables. The stroke of every dot is the shared knob.
import { BORDER_STRONG } from '#shared/classes.js'
import type { Tone } from '#shared/contracts/tone.js'

/** As tall as the first line of the title (text-sm is 20 px), so the marker centres on it. */
export const TIMELINE_MARKER = 'flex min-h-5 shrink-0 items-center'

/** A circle is a shape, not a radius knob, as the Skeleton circle is. */
const DOT = 'block size-3 rounded-full'

/** The stroke reaches 3:1 on the page whatever fills it: the amber fill alone is 2.13:1 on white.
 * forced-color-adjust-none keeps the fill, which forced colours would repaint to nothing. */
const FILLED = `${DOT} ${BORDER_STRONG} forced-color-adjust-none`

/** A kept theme colour can match a forced canvas (1.17:1 measured), so the dot paints
 * itself in the system text colour there, which no canvas can be. */
const FORCED = 'forced-colors:border-[CanvasText] forced-colors:bg-[CanvasText]'

/** R-5.2-3: complete strings. A done item, or one with no status: the fill reaches the stroke. */
export const TIMELINE_DOT = {
  primary: `${FILLED} ${FORCED} bg-primary-solid`,
  neutral: `${FILLED} ${FORCED} bg-neutral-solid`,
  success: `${FILLED} ${FORCED} bg-success-solid`,
  warning: `${FILLED} ${FORCED} bg-warning-solid`,
  danger: `${FILLED} ${FORCED} bg-danger-solid`,
  info: `${FILLED} ${FORCED} bg-info-solid`,
} as const satisfies Record<Tone, string>

/** The fill is clipped to the box inside the padding, which leaves a gap under the stroke. */
const TARGET = 'bg-clip-content p-0.5'

/** The current step: a smaller dot inside the same 12 px box, so it differs from a done
 * one by shape and not by hue alone (SC 1.4.1). Nothing is drawn outside the box. */
export const TIMELINE_DOT_CURRENT = {
  primary: `${TIMELINE_DOT.primary} ${TARGET}`,
  neutral: `${TIMELINE_DOT.neutral} ${TARGET}`,
  success: `${TIMELINE_DOT.success} ${TARGET}`,
  warning: `${TIMELINE_DOT.warning} ${TARGET}`,
  danger: `${TIMELINE_DOT.danger} ${TARGET}`,
  info: `${TIMELINE_DOT.info} ${TARGET}`,
} as const satisfies Record<Tone, string>

/** A todo item: the stroke and no fill. Forced colours repaint a border, so it needs no opt-out. */
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

/** The drawn 2 px fill, plus a transparent inline-start border inside the same box: forced colours drop the
 * fill and paint the border, so the rail never vanishes. -my-1 crosses the 4 px of the marker box above and
 * below a 12 px dot, so the rail runs dot to dot without a gap, as the previewer draws it. */
export const TIMELINE_CONNECTOR = 'block w-0.5 flex-1 -my-1 bg-line border-s-(length:--tc-line-width) border-transparent'

/** One line tall even when empty, or an item with no title is as short as its marker
 * and its connector has no height left to draw. */
export const TIMELINE_TITLE = 'min-h-5 text-sm font-medium text-body'

export const TIMELINE_TIME = 'text-xs text-muted'
