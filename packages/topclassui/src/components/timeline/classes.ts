// R-5.12-4: Timeline's own class tables. The stroke of every dot is the shared knob.
import { FORCED_EDGE } from '#shared/classes.js'
import type { Tone } from '#shared/contracts/tone.js'

/** As tall as the first line of the title (text-sm is 20 px), so the marker centres on it. */
export const TIMELINE_MARKER = 'flex min-h-5 shrink-0 items-center'

/** A circle is a shape, not a radius knob, as the Skeleton circle is. */
const DOT = 'block size-3 rounded-full'

/** Stroked in its own fill, so the dot reads solid as the previewer draws it; amber alone is 2.15:1 on white, so
 * its stroke is the darker text step. forced-color-adjust-none keeps the fill, which forced colours would erase. */
const FILLED = `${DOT} border-(length:--tc-line-width) forced-color-adjust-none`

/** A kept theme colour can match a forced canvas (1.17:1 measured), so the dot paints
 * itself in the system text colour there, which no canvas can be. */
const FORCED = 'forced-colors:border-[CanvasText] forced-colors:bg-[CanvasText]'

/** R-5.2-3: complete strings. A done item, or one with no status: the fill reaches the stroke. */
export const TIMELINE_DOT = {
  primary: `${FILLED} ${FORCED} border-primary-solid bg-primary-solid`,
  neutral: `${FILLED} ${FORCED} border-neutral-solid bg-neutral-solid`,
  success: `${FILLED} ${FORCED} border-success-solid bg-success-solid`,
  warning: `${FILLED} ${FORCED} border-warning-on-soft bg-warning-solid`,
  danger: `${FILLED} ${FORCED} border-danger-solid bg-danger-solid`,
  info: `${FILLED} ${FORCED} border-info-solid bg-info-solid`,
} as const satisfies Record<Tone, string>

/** Under forced colours every fill is one system colour, so there the fill is clipped inside the padding: a gap under the stroke. */
const TARGET = 'forced-colors:bg-clip-content forced-colors:p-0.5'

/** The current step: filled as the previewer draws it, in its own tone; the order and the hidden word say which
 * step it is. Under forced colours, where hue is gone, it keeps a dot in a ring. Nothing is drawn outside the box. */
export const TIMELINE_DOT_CURRENT = {
  primary: `${TIMELINE_DOT.primary} ${TARGET}`,
  neutral: `${TIMELINE_DOT.neutral} ${TARGET}`,
  success: `${TIMELINE_DOT.success} ${TARGET}`,
  warning: `${TIMELINE_DOT.warning} ${TARGET}`,
  danger: `${TIMELINE_DOT.danger} ${TARGET}`,
  info: `${TIMELINE_DOT.info} ${TARGET}`,
} as const satisfies Record<Tone, string>

/** A todo item: a 2 px strong ring on the raised surface, as drawn. Forced colours repaint a border, so it needs no opt-out. */
export const TIMELINE_DOT_HOLLOW = `${DOT} border-[length:calc(var(--tc-line-width)*2)] border-line-strong bg-surface-raised`

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

/** The default for no items: the tray and the empty label, muted, as the states strip draws it. */
export const TIMELINE_EMPTY = 'flex items-center gap-2 text-sm text-muted'

/** TimelineSkeleton: three rows of a dot and a bar, in the fill and pulse of Skeleton. */
const PULSE = `bg-neutral-soft animate-pulse motion-reduce:animate-none ${FORCED_EDGE}`

export const TIMELINE_SKELETON = 'flex flex-col gap-4'

export const TIMELINE_SKELETON_ROW = 'flex items-center gap-3'

export const TIMELINE_SKELETON_DOT = `block size-3 shrink-0 rounded-full ${PULSE}`

export const TIMELINE_SKELETON_BAR = `block h-2.5 rounded-chip ${PULSE}`

/** One width per row, so the bars read as titles of different lengths. */
export const TIMELINE_SKELETON_WIDTHS = ['w-36', 'w-48', 'w-28'] as const
