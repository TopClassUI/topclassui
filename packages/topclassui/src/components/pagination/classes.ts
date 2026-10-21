// R-5.12-4: Pagination's own class tables, read by variants.ts and index.tsx.
import { BORDER, HOVER, POINTER } from '#shared/classes.js'
import type { Size } from '#shared/contracts/size.js'
import { TONE_CLASS } from '#shared/contracts/tone.js'
import type { PAGINATION_ROW_STEPS } from './constants.js'

/** A page or a gap: only in the full row. */
export const FULL = 'pagination-full'

/** "3 of 12": only in the compact row, between previous and next. */
export const COMPACT = 'pagination-compact'

/** The width the list claims and below which it turns compact, one class per step of PAGINATION_ROW_STEPS. */
export const ROW_AT = {
  10: 'pagination-at-10',
  12: 'pagination-at-12',
  14: 'pagination-at-14',
  16: 'pagination-at-16',
  18: 'pagination-at-18',
  20: 'pagination-at-20',
  22: 'pagination-at-22',
  24: 'pagination-at-24',
  26: 'pagination-at-26',
  28: 'pagination-at-28',
  30: 'pagination-at-30',
  32: 'pagination-at-32',
  34: 'pagination-at-34',
  36: 'pagination-at-36',
  38: 'pagination-at-38',
  40: 'pagination-at-40',
  42: 'pagination-at-42',
  44: 'pagination-at-44',
  46: 'pagination-at-46',
  48: 'pagination-at-48',
} as const satisfies Record<(typeof PAGINATION_ROW_STEPS)[number], string>

/** In a cell sized to its content the root takes no more than the cell, so a narrow cell turns compact instead of spilling. */
export const ROOT = 'max-w-full'

/** The row wraps, so eleven cells at 44 px still fit a phone; the list is the container the compact row measures. */
export const LIST = 'flex flex-wrap items-center @container/pagination'

/** The room between two cells grows with them: 3 to 6 px as Figma 138:1269 draws xs and sm. */
export const LIST_GAP = {
  xs: 'gap-1',
  sm: 'gap-1.5',
  md: 'gap-1.5',
  lg: 'gap-2',
  xl: 'gap-2',
  custom: 'gap-1',
} as const satisfies Record<Size, string>

/** What a link, an edge control and a gap share: a centred box with the control radius.
 * tabular-nums gives every digit one width, so Next stays put from page 111 to 112. */
export const CELL = 'inline-flex items-center justify-center rounded-control font-medium tabular-nums'

/** A cell wider than it is tall, as Figma 138:1269 draws it: the width of the control step, the height a step
 * or two under it and never under the 24 px floor of TOUCH_TARGET. It grows with a long number instead of spilling it. */
export const CELL_SIZE = {
  xs: 'px-pad-x-xs text-xs',
  sm: 'min-w-control-sm px-pad-x-xs text-sm',
  md: 'h-control-xs min-w-control-md px-pad-x-xs text-sm',
  lg: 'h-control-sm min-w-control-lg px-pad-x-sm text-base',
  xl: 'h-control-md min-w-control-xl px-pad-x-sm text-base',
  custom: '',
} as const satisfies Record<Size, string>

/** Forced colours erase a fill, so the current page takes the system pair and paints it itself.
 * Without forced-color-adjust-none Chromium lays a backplate under the digit, which hides it. */
export const CELL_CURRENT_FORCED = [
  'forced-colors:forced-color-adjust-none',
  'forced-colors:bg-[Highlight]',
  'forced-colors:text-[HighlightText]',
  'forced-colors:[--tc-ring:Highlight]',
  // Opted out, so nothing forces HOVER.solid either: the theme's blue under a black digit measures 3.1:1.
  'forced-colors:hover:bg-[Highlight]',
  'forced-colors:active:bg-[Highlight]',
].join(' ')

/** The page the reader is on: filled, so it is found without reading a number. */
export const CELL_CURRENT = `bg-primary-solid text-primary-on-solid ${TONE_CLASS.primary} ${HOVER.solid} ${POINTER} ${CELL_CURRENT_FORCED}`

/** Every other cell: the hairline the frame draws, body text, and the neutral tint under a pointer.
 * The digit names the link, so the box is decorative; a dead edge drops it, as Figma 138:1269 does. */
export const CELL_OTHER = `${BORDER} text-body ${TONE_CLASS.neutral} ${HOVER.outline} ${POINTER} data-disabled:border-transparent`

/** The page in words, filling what the four controls leave; pagination-compact makes it a flex box.
 * min-w-0 and flex-1 let "12,345 of 123,456" wrap inside its box, so the row itself never breaks on a phone. */
export const STATUS = 'min-w-0 flex-1 items-center justify-center rounded-control px-1 text-center font-medium tabular-nums text-body'

/** The cell height as a floor, so a wrapped status grows instead of spilling. */
export const STATUS_SIZE = {
  xs: 'min-h-control-xs text-xs',
  sm: 'min-h-control-sm text-sm',
  md: 'min-h-control-md text-sm',
  lg: 'min-h-control-lg text-base',
  xl: 'min-h-control-xl text-base',
  custom: '',
} as const satisfies Record<Size, string>

/** A gap is a mark, not a control: muted, with no boundary, no ring, no hover and no pointer. */
export const CELL_GAP = 'inline-flex items-center justify-center text-muted'
