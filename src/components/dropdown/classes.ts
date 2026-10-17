// R-5.12-4: one class string per element Dropdown styles, built from the shared overlay constants.
import {
  CONTAIN, FOCUS_RING_INSET, LIST_CAP, OVERLAY_SURFACE, POPUP_MOTION, ROW, ROW_HIGHLIGHT, ROW_TOUCH, SCROLL_AREA,
} from '#shared/classes.js'
import type { DropdownItemTone } from './types.js'

/** Above the page, and hidden once its trigger scrolls out of view (PLAN 10.5). */
export const DROPDOWN_POSITIONER = 'z-(--tc-z-popup) data-anchor-hidden:invisible'

/** As wide as its longest row: 12rem at least and 20rem at most, and neither past the room Base UI
 * measured, so a doubled text size cannot push it off a phone. A wider label ends in an ellipsis. */
export const DROPDOWN_WIDTH = 'min-w-[min(calc(var(--spacing)*48),var(--available-width))] max-w-[min(calc(var(--spacing)*80),var(--available-width))]'

/** R-10.5-1: a column that shows about --tc-list-rows rows and scrolls inside itself. A group label
 * too long for its width breaks, and the ring of a menu that holds the focus itself is drawn inside its box. */
export const DROPDOWN_POPUP = [
  'flex flex-col gap-0.5 p-1.5 wrap-anywhere',
  DROPDOWN_WIDTH,
  LIST_CAP,
  SCROLL_AREA,
  OVERLAY_SURFACE,
  POPUP_MOTION,
  FOCUS_RING_INSET,
].join(' ')

/** A disabled row still takes the focus from the arrow keys, so what it holds is dimmed and not
 * the row: its highlight, which is its focus mark, keeps its full strength. Base UI writes
 * aria-disabled, so no browser greys it: forced colours take the system's grey instead. */
export const DROPDOWN_ITEM_DISABLED = [
  'data-disabled:pointer-events-none data-disabled:*:opacity-50',
  'forced-colors:data-disabled:*:opacity-100 forced-colors:data-disabled:not-data-highlighted:text-[GrayText]',
].join(' ')

/** R-5.6-2: a row is --tc-row-height tall, 40 px, and at least 44 under a finger. It never shrinks:
 * a flex item gives up its height before its container scrolls. */
export const DROPDOWN_ITEM = [
  ROW,
  ROW_HIGHLIGHT,
  DROPDOWN_ITEM_DISABLED,
  CONTAIN,
  'group shrink-0 cursor-default select-none',
  ROW_TOUCH,
].join(' ')

/** R-5.2-3: the colour of each tone. Forced colours erase it: there a danger row is its label. */
export const DROPDOWN_ITEM_TONE = {
  neutral: '',
  danger: 'text-danger-on-soft data-highlighted:bg-danger-soft data-highlighted:text-danger-on-soft',
} as const satisfies Record<DropdownItemTone, string>

/** The icon keeps its size while a long label gives way. */
export const DROPDOWN_ICON = 'inline-flex shrink-0'

/** At the end of the row, never past 10rem or half the room Base UI measured. Where the row is short (a
 * phone, a doubled text size) it gives way first, ten thousand times faster than the label, so the name
 * of the row stays whole. Muted at rest, the colour of its row once that is highlighted. */
export const DROPDOWN_SHORTCUT = 'ms-auto max-w-[min(calc(var(--spacing)*40),calc(var(--available-width)/2))] shrink-10000 truncate ps-4 font-mono text-xs text-muted group-data-highlighted:text-inherit'

/** The rows of a group keep the gap the popup gives its own. */
export const DROPDOWN_GROUP = 'flex shrink-0 flex-col gap-0.5'

export const DROPDOWN_GROUP_LABEL = 'px-3 py-1.5 text-xs font-medium text-muted'

export const DROPDOWN_SEPARATOR = 'my-1 shrink-0 border-t-(length:--tc-line-width) border-line'
