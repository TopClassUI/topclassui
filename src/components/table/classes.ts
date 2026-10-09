/** R-5.12-4: Table's own class tables. A cell reads its alignment from one and a sticky
 * cell its fill from another, so the columns scrolling under it never show through. */
import { FOCUS_RING, HOVER, TOUCH_TARGET } from '#shared/classes.js'
import type { TableAlign } from './types.js'

/** R-5.3-1: logical, so an end-aligned amount sits on the left in Arabic. */
export const CELL_ALIGN = {
  start: 'text-start',
  end: 'text-end',
} as const satisfies Record<TableAlign, string>

/** The sort link is a flex row, where text-align moves nothing. */
export const LINK_ALIGN = {
  start: 'justify-start',
  end: 'justify-end',
} as const satisfies Record<TableAlign, string>

/** The fill of a row: the frame's own, or the tint `striped` gives every second one. */
export const ROW_FILL = {
  plain: 'bg-surface-raised',
  striped: 'bg-surface',
} as const

/** R-5.3-1: the inline start, so the column sticks to the right edge in Arabic. */
export const STICKY_CELL = 'sticky inset-s-0'

/** Drawn above the header row, or read out without being drawn. */
export const CAPTION = {
  visible: 'border-b-(length:--tc-line-width) border-line px-4 py-3 text-start text-sm font-medium text-body',
  hidden: 'sr-only',
} as const

export const HEADER_CELL = 'px-4 py-2.5 text-xs font-medium text-muted bg-surface'

/** The line is on the cell, not the row: a sticky cell carries its own border with it. */
export const BODY_CELL = 'border-t-(length:--tc-line-width) border-line px-4 py-3 text-sm text-body'

export const EMPTY_CELL = 'border-t-(length:--tc-line-width) border-line px-4 py-3 text-center text-sm text-muted'

/** -my-1 gives back the 8 px the 24 px target adds, so a sortable header row is no taller. */
export const SORT_LINK = `flex items-center -my-1 rounded-chip underline-offset-4 ${HOVER.link} ${FOCUS_RING} ${TOUCH_TARGET}`
