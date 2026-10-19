// R-5.12-4: Pagination's own class tables, read by variants.ts and index.tsx.
import { BORDER_STRONG, HOVER, POINTER } from '#shared/classes.js'
import type { Size } from '#shared/contracts/size.js'
import { TONE_CLASS } from '#shared/contracts/tone.js'

/** A page or a gap: only in the full row. */
export const FULL = 'pagination-full'

/** "3 of 12": only in the compact row, between previous and next. */
export const COMPACT = 'pagination-compact'

/** The row wraps, so eleven cells at 44 px still fit a phone; the list is the container the compact row measures. */
export const LIST = 'flex flex-wrap items-center gap-1 @container/pagination'

/** What a link, an edge control and a gap share: a centred box with the control radius.
 * tabular-nums gives every digit one width, so Next stays put from page 111 to 112. */
export const CELL = 'inline-flex items-center justify-center rounded-control font-medium tabular-nums'

/** A square at the control height that grows with a long number instead of spilling it.
 * min-w-auto replaces the px floors of TOUCH_TARGET: the ratio carries min-height across. */
export const CELL_SIZE = {
  xs: 'h-control-xs aspect-square min-w-auto pointer-coarse:min-w-auto px-0.5 text-xs',
  sm: 'h-control-sm aspect-square min-w-auto pointer-coarse:min-w-auto px-0.5 text-sm',
  md: 'h-control-md aspect-square min-w-auto pointer-coarse:min-w-auto px-1 text-sm',
  lg: 'h-control-lg aspect-square min-w-auto pointer-coarse:min-w-auto px-1 text-base',
  xl: 'h-control-xl aspect-square min-w-auto pointer-coarse:min-w-auto px-1 text-base',
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

/** Every other cell: a control boundary at 3:1, body text, and the neutral tint under a pointer. */
export const CELL_OTHER = `${BORDER_STRONG} text-body ${TONE_CLASS.neutral} ${HOVER.outline} ${POINTER}`

/** The page in words, filling what the four controls leave; pagination-compact makes it a flex box.
 * flex-1 lets "12,345 of 123,456" wrap inside its box, so the row itself never breaks on a phone. */
export const STATUS = 'flex-1 items-center justify-center rounded-control px-1 text-center font-medium tabular-nums text-body'

/** The cell height as a floor, so a wrapped status grows instead of spilling. */
export const STATUS_SIZE = {
  xs: 'min-h-control-xs text-xs',
  sm: 'min-h-control-sm text-sm',
  md: 'min-h-control-md text-sm',
  lg: 'min-h-control-lg text-base',
  xl: 'min-h-control-xl text-base',
  custom: '',
} as const satisfies Record<Size, string>

/** A gap is text, not a control: no boundary, no ring and no hover. */
export const CELL_GAP = `${CELL} text-body`
