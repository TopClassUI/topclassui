// R-5.12-4: one class string per element Sidebar styles, built from the shared constants.
import { CONTAIN, FOCUS_RING, HOVER, ICON_BUTTON, LABEL, ROW, SCROLL_AREA, TOUCH_TARGET, TRANSITION } from '#shared/classes.js'

/** 220 px expanded and 52 collapsed, as Figma 138:2539 draws the rail. A server part cannot read context (R-5.1-4): every part
 * under the rail learns its state from this group and the attribute the root sets on it. */
export const SIDEBAR_WIDTH = 'data-open:w-55 data-closed:w-13'

/** Under a finger a collapsed rail is as wide as a 44 px target, its padding and its line:
 * at 52 px it leaves a row 35, which a 44 px row would overflow. */
export const SIDEBAR_COARSE = 'pointer-coarse:data-closed:min-w-[calc(var(--tc-target-coarse,44px)+1rem+var(--tc-line-width))]'

/** A column as tall as its parent that a flex row never squeezes, and never wider than that
 * parent. It sits on the page colour behind its line, as Figma 138:2539 draws the bordered rail. The line is on the inline end, so it faces the page in either direction.
 * relative: it holds the hidden labels of a rail that has no body, inside whatever scrolls it. */
export const SIDEBAR_ROOT = [
  'group/sidebar relative flex h-full shrink-0 flex-col gap-1 bg-page p-2 text-body',
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

/** Even the thin classic scrollbar is 10 px of a collapsed rail's 39: it leaves a row 29 and pushes every
 * icon off the middle. Collapsed, the bar is not drawn; the wheel, a finger and the keys still scroll. */
export const SIDEBAR_BAR = 'group-data-closed/sidebar:[scrollbar-width:none]'

/** The scroll container. relative: it holds every sr-only label of a collapsed rail, or each
 * would be laid out against the page and make it as tall as the whole list. No min-h-0:
 * a box that scrolls has no minimum height of its own, so the class would change nothing. */
export const SIDEBAR_BODY = `relative flex flex-1 flex-col gap-0.5 ${SCROLL_AREA} ${SIDEBAR_RING_ROOM} ${SIDEBAR_BAR}`

export const SIDEBAR_GROUP = 'flex flex-col gap-0.5'

/** One line that ends in an ellipsis. Collapsed, it is hidden and still names its list. As wide as its text and
 * at the start of the rail, so a label in its own direction, an English one in an Arabic rail, sits where the rows do. */
export const SIDEBAR_GROUP_LABEL = `self-start ${CONTAIN} truncate px-3 py-1 text-xs font-medium text-muted group-data-closed/sidebar:sr-only`

export const SIDEBAR_LIST = 'flex flex-col gap-0.5'

/** A row at least --tc-row-height tall (32 px), 44 under a finger, padded 8 px as drawn, that clips what it holds. Collapsed, its icon is
 * centred, and needs no px-0: what is centred stays centred when it is wider than its room.
 * The floors come first: cn() keeps the last min-height, and after ROW that would be 24 px. */
export const SIDEBAR_LINK = [
  'relative overflow-hidden',
  TOUCH_TARGET,
  ROW,
  FOCUS_RING,
  TRANSITION,
  'px-2 group-data-closed/sidebar:justify-center',
].join(' ')

/** Forced colours erase the fill, so there the current row takes the system pair and paints
 * it itself, as a highlighted row of a menu does.
 * A row that paints itself keeps the ring of its theme, so it takes the text colour of the canvas. */
export const SIDEBAR_CURRENT_FORCED = [
  'forced-colors:forced-color-adjust-none forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]',
  'forced-colors:[--tc-ring:CanvasText]',
].join(' ')

/** Rows sit 2 px apart and a ring reaches 4 px out, over the row above: forced colours may draw it in the colour that
 * row is filled with, so there another row draws its ring inside its own box, on the canvas. */
export const SIDEBAR_REST_FORCED = 'forced-colors:focus-visible:-outline-offset-(length:--tc-ring-width)'

/** R-5.2-3: the row by whether it is the page being read: the tint and the weight, with no bar, as
 * Figma 138:2539 draws it. Semibold, not medium: a font with a regular and a bold face paints 500 as regular. Only another row answers the pointer:
 * under forced colours a hover fill on the current one would lie under the text of the highlight. */
export const SIDEBAR_LINK_STATE = {
  current: `bg-primary-soft font-semibold text-primary-on-soft ${SIDEBAR_CURRENT_FORCED}`,
  rest: `tone-neutral text-body ${HOVER.ghost} ${SIDEBAR_REST_FORCED}`,
} as const

/** The colour sits on a wrapper, never on the svg: one set on an svg survives forced colours.
 * The icon of the current row takes the colour of its label. */
export const SIDEBAR_ICON = {
  current: 'inline-flex shrink-0',
  rest: 'inline-flex shrink-0 text-muted',
} as const

/** An element of its own, so a long label ends in an ellipsis and a collapsed one can hide. */
export const SIDEBAR_LINK_LABEL = `${LABEL} group-data-closed/sidebar:sr-only`
