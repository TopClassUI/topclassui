// R-5.12-4: one class string per element Sidebar styles, built from the shared constants.
import { CONTAIN, FOCUS_RING, HOVER, ICON_BUTTON, LABEL, ROW, SCROLL_AREA, TOUCH_TARGET, TRANSITION } from '#shared/classes.js'

/** 220 px expanded and 60 collapsed. A server part cannot read context (R-5.1-4): every part
 * under the rail learns its state from this group and the attribute the root sets on it. */
export const SIDEBAR_WIDTH = 'data-open:w-55 data-closed:w-15'

/** Under a finger a collapsed rail is as wide as a 44 px target, its padding and its line:
 * at 60 px it leaves a row 39, which a 44 px row would overflow. */
export const SIDEBAR_COARSE = 'pointer-coarse:data-closed:min-w-[calc(var(--tc-target-coarse,44px)+1.25rem+var(--tc-line-width))]'

/** A column as tall as its parent that a flex row never squeezes, and never wider than that
 * parent. The line is on the inline end, so it faces the page in either direction.
 * relative: it holds the hidden labels of a rail that has no body, inside whatever scrolls it. */
export const SIDEBAR_ROOT = [
  'group/sidebar relative flex h-full shrink-0 flex-col gap-1 bg-surface p-2.5 text-body',
  'border-e-(length:--tc-line-width) border-line',
  SIDEBAR_WIDTH,
  SIDEBAR_COARSE,
  CONTAIN,
].join(' ')

/** The toggle: an icon button on the neutral ramp, so its hover is the ghost tint. */
export const SIDEBAR_TRIGGER = `${ICON_BUTTON} text-muted tone-neutral ${HOVER.ghost}`

/** It never shrinks, so it keeps its box while the body scrolls. Collapsed, the trigger
 * stands alone and is centred over the icons below it. */
export const SIDEBAR_HEADER = 'flex shrink-0 items-center gap-2 pb-1.5 group-data-closed/sidebar:justify-center'

/** Hidden with sr-only and not removed, so the rail keeps its title for a screen reader. */
export const SIDEBAR_TITLE = `${LABEL} text-sm font-semibold group-data-closed/sidebar:sr-only`

/** A ring reaches its width and its offset outside a row, and a box that scrolls clips there:
 * the body is that much larger than its rows on every side, into the padding of the rail. */
export const SIDEBAR_RING_ROOM = '-m-[calc(var(--tc-ring-width)+var(--tc-ring-offset))] p-[calc(var(--tc-ring-width)+var(--tc-ring-offset))]'

/** A classic scrollbar is 15 px of a collapsed rail's 39: it leaves a row 24 and pushes every
 * icon off the middle. Collapsed, the bar is not drawn; the wheel, a finger and the keys still scroll. */
export const SIDEBAR_BAR = 'group-data-closed/sidebar:[scrollbar-width:none]'

/** The scroll container. relative: it holds every sr-only label of a collapsed rail, or each
 * would be laid out against the page and make it as tall as the whole list. No min-h-0:
 * a box that scrolls has no minimum height of its own, so the class would change nothing. */
export const SIDEBAR_BODY = `relative flex flex-1 flex-col gap-1 ${SCROLL_AREA} ${SIDEBAR_RING_ROOM} ${SIDEBAR_BAR}`

export const SIDEBAR_GROUP = 'flex flex-col gap-1'

/** One line that ends in an ellipsis. Collapsed, it is hidden and still names its list. As wide as its text and
 * at the start of the rail, so a label in its own direction, an English one in an Arabic rail, sits where the rows do. */
export const SIDEBAR_GROUP_LABEL = `self-start ${CONTAIN} truncate px-3 py-1 text-xs font-medium text-muted group-data-closed/sidebar:sr-only`

export const SIDEBAR_LIST = 'flex flex-col gap-1'

/** A row at least 40 px tall, 44 under a finger, that clips what it holds. Collapsed, its icon is
 * centred, and needs no px-0: what is centred stays centred when it is wider than its room.
 * The floors come first: cn() keeps the last min-height, and after ROW that would be 24 px. */
export const SIDEBAR_LINK = [
  'relative overflow-hidden',
  TOUCH_TARGET,
  ROW,
  FOCUS_RING,
  TRANSITION,
  'group-data-closed/sidebar:justify-center',
].join(' ')

/** A bar inside the inline start of the current row: a shape, where the fill and the text are
 * colours and the weight is hidden with the label of a collapsed rail. It takes the colour of
 * the label, so it keeps the label's contrast in every mode, and sits clear of a pill's round end. */
export const SIDEBAR_MARK = 'before:absolute before:inset-y-2 before:inset-s-1 before:w-0.75 before:rounded-full before:bg-current'

/** Forced colours erase the fill, so there the current row takes the system pair and paints
 * it itself, as a highlighted row of a menu does. The bar follows: it is the colour of the text.
 * A row that paints itself keeps the ring of its theme, so it takes the text colour of the canvas. */
export const SIDEBAR_CURRENT_FORCED = [
  'forced-colors:forced-color-adjust-none forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]',
  'forced-colors:[--tc-ring:CanvasText]',
].join(' ')

/** R-5.2-3: the row by whether it is the page being read. Semibold, not medium: a font with
 * a regular and a bold face alone paints 500 as regular. Only another row answers the pointer:
 * under forced colours a hover fill on the current one would lie under the text of the highlight. */
export const SIDEBAR_LINK_STATE = {
  current: `bg-primary-soft font-semibold text-primary-on-soft ${SIDEBAR_MARK} ${SIDEBAR_CURRENT_FORCED}`,
  rest: `tone-neutral text-body ${HOVER.ghost}`,
} as const

/** The colour sits on a wrapper, never on the svg: one set on an svg survives forced colours.
 * The icon of the current row takes the colour of its label. */
export const SIDEBAR_ICON = {
  current: 'inline-flex shrink-0',
  rest: 'inline-flex shrink-0 text-muted',
} as const

/** An element of its own, so a long label ends in an ellipsis and a collapsed one can hide. */
export const SIDEBAR_LINK_LABEL = `${LABEL} group-data-closed/sidebar:sr-only`
