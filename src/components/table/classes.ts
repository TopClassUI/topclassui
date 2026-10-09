/** R-5.12-4: Table's own class tables. A cell reads its alignment from one and a sticky
 * cell its fill from another, so the columns scrolling under it never show through. */
import { CONTAIN, FOCUS_RING, HOVER, TOUCH_TARGET } from '#shared/classes.js'
import type { TableAlign } from './types.js'

/** relative: the box contains every sr-only span, or one in a far column widens the page.
 * isolate: the z-index of a stuck cell stays inside, under any sticky bar of the page.
 * grid grid-cols-1: a grid or flex parent can shrink the box instead of being widened by it. */
export const BOX = 'relative isolate grid grid-cols-1 overflow-x-auto rounded-box bg-surface-raised'

/** SC 2.4.11: a focused control is scrolled clear of the stuck column, which is never wider than this. */
export const STICKY_BOX = 'scroll-ps-[var(--tc-table-sticky-width,8rem)]'

/** R-5.3-1: the inline start, so the column sticks to the right edge in Arabic. The z-index
 * keeps a dimmed Button or a Spinner in a later cell under it; the cap matches STICKY_BOX. */
export const STICKY_CELL = 'sticky inset-s-0 z-(--tc-z-sticky) max-w-[var(--tc-table-sticky-width,8rem)] truncate'

/** R-5.3-1: logical, so an end-aligned amount sits on the left in Arabic, digits in line. */
export const CELL_ALIGN = {
  start: 'text-start',
  end: 'text-end tabular-nums',
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

/** Drawn above the header row, or read out without being drawn. */
export const CAPTION = {
  visible: 'border-b-(length:--tc-line-width) border-line px-4 py-3 text-start text-sm font-medium text-body',
  hidden: 'sr-only',
} as const

/** One line each: a narrow screen scrolls the box instead of stacking a date word by word. */
export const HEADER_CELL = 'px-4 py-2.5 text-xs font-medium whitespace-nowrap text-muted bg-surface'

/** The line is on the cell, not the row: a sticky cell carries its own border with it. */
export const BODY_CELL = 'border-t-(length:--tc-line-width) border-line px-4 py-3 text-sm whitespace-nowrap text-body'

/** A row header is a th, which a browser draws bold and centred. */
export const ROW_HEADER = 'font-normal'

export const EMPTY_CELL = 'border-t-(length:--tc-line-width) border-line px-4 py-3 text-center text-sm text-muted'

/** The cell is as wide as the table, so its words stick to the part of the box in view. */
export const EMPTY_WORDS = 'sticky inset-s-4 inset-e-4 mx-auto w-fit'

/** -my-1 gives back the 8 px the 24 px target adds, so a sortable header row is no taller. CONTAIN is R-5.2-7. */
export const SORT_LINK = `flex items-center -my-1 rounded-chip ${CONTAIN} ${HOVER.link} ${FOCUS_RING} ${TOUCH_TARGET}`

/** R-5.2-7: LABEL without its nowrap, so the cell still decides whether its header wraps. */
export const HEADER_LABEL = 'min-w-0 overflow-hidden text-ellipsis'

/** The placeholder never scrolls: it has no tab stop, so nothing in it may need one.
 * grid grid-cols-1 as on BOX: it stands where the table will, in the same grid or flex parent. */
export const SKELETON_BOX = 'grid grid-cols-1 overflow-hidden rounded-box bg-surface-raised'

/** One line of nothing: as tall as the type, with margins making up the line height. */
export const SKELETON_BAR = 'block h-[1em] my-[calc((1lh-1em)/2)] w-full rounded-chip bg-neutral-soft animate-pulse motion-reduce:animate-none'

/** A percentage width adds nothing to the column, so a narrow box squeezes the bars and never overflows. */
export const SKELETON_WIDTH = {
  header: 'max-w-12',
  cell: 'max-w-24',
} as const
