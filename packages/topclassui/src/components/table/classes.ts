/** R-5.12-4: Table's own class tables. A cell reads its alignment from one and a sticky
 * cell its fill from another, so the columns scrolling under it never show through. */
import { BORDER, CONTAIN, FOCUS_RING, FORCED_EDGE, HOVER, SCROLLBAR, TOUCH_TARGET } from '#shared/classes.js'
import type { TableAlign, TableDensity, TableVariant } from './types.js'

/** relative: the box contains every sr-only span, or one in a far column widens the page.
 * isolate: the z-index of a stuck cell stays inside, under any sticky bar of the page.
 * grid grid-cols-1: a grid or flex parent can shrink the box instead of being widened by it. */
export const BOX = `relative isolate grid grid-cols-1 overflow-x-auto rounded-box bg-surface-raised ${SCROLLBAR}`

/** R-8.5-1: overflow-x auto scrolls the block axis too. The header row and --tc-list-rows body rows, each its padding, one line of text and its line, then the
 * body scrolls under the header. A visible caption scrolls away with the rows, so it adds a row's height. */
export const BOX_CAP = {
  comfortable: {
    hidden: 'max-h-[calc(var(--spacing)*8+var(--tc-list-rows)*(var(--spacing)*11+var(--tc-line-width)))]',
    visible: 'max-h-[calc(var(--spacing)*19+var(--tc-line-width)+var(--tc-list-rows)*(var(--spacing)*11+var(--tc-line-width)))]',
  },
  compact: {
    hidden: 'max-h-[calc(var(--spacing)*7+var(--tc-list-rows)*(var(--spacing)*8+var(--tc-line-width)))]',
    visible: 'max-h-[calc(var(--spacing)*18+var(--tc-line-width)+var(--tc-list-rows)*(var(--spacing)*8+var(--tc-line-width)))]',
  },
} as const satisfies Record<TableDensity, Record<'hidden' | 'visible', string>>

/** The frame's outline variant draws the hairline round the box; plain leaves it out. */
export const BOX_VARIANT = {
  outline: BORDER,
  plain: '',
} as const satisfies Record<TableVariant, string>

/** The header stays at the top of the box while the body scrolls, over every body cell, the stuck one too. */
export const HEAD = 'sticky top-0 z-[calc(var(--tc-z-sticky)+1)]'

/** The rows windowing left out above and below, as tall as the hook measured them. */
export const SPACER = {
  start: 'h-(--tc-list-pad-start) p-0',
  end: 'h-(--tc-list-pad-end) p-0',
} as const

/** Chromium leaves a focused control where it is while any of it is in view, and centres it only when none is. 2rem
 * off each edge is what counts as in view; the top keeps the sticky header's height clear. */
export const FOCUS_ROOM = 'scroll-ps-8 scroll-pe-8 scroll-pt-[calc(var(--spacing)*9)]'

/** SC 2.4.11: the same room measured from the stuck column, which is never wider than this,
 * so a focused control is never under it. It replaces the start half of FOCUS_ROOM. */
export const STICKY_BOX = 'scroll-ps-[calc(var(--tc-table-sticky-width,8rem)+2rem)]'

/** The edge of the stuck column, so text scrolling under it does not read as part of it. The strong
 * line, because in dark the hairline is the very fill of a raised cell. On a pseudo-element:
 * a border on the cell would widen the column by its own width. */
export const STICKY_LINE = 'after:absolute after:inset-y-0 after:inset-e-0 after:border-e-(length:--tc-line-width) after:border-line-strong'

/** A control in the stuck column cannot be scrolled clear of it. A margin wider than any box
 * makes it cover the room STICKY_BOX leaves, which reads as in view: focusing it moves nothing. */
export const STICKY_STOPS = '**:scroll-mx-[100vw]'

/** R-5.3-1: the inline start, so the column sticks to the right edge in Arabic. The z-index
 * keeps a dimmed Button or a Spinner in a later cell under it; the cap matches STICKY_BOX. */
export const STICKY_CELL = `sticky inset-s-0 z-(--tc-z-sticky) max-w-[var(--tc-table-sticky-width,8rem)] truncate ${STICKY_LINE} ${STICKY_STOPS}`

/** R-5.3-1: logical, so an end-aligned amount sits on the left in Arabic, digits in line. */
export const CELL_ALIGN = {
  start: 'text-start',
  end: 'text-end tabular-nums',
} as const satisfies Record<TableAlign, string>

/** The link is as wide as its label, but never under the 24 and 44 px floors: inside that
 * width text-align moves nothing, so a short label is pushed to the side its column reads from. */
export const LINK_ALIGN = {
  start: 'justify-start',
  end: 'justify-end',
} as const satisfies Record<TableAlign, string>

/** The fill of a row: the frame's own, or the tint `striped` gives every second one. A stuck cell carries the row's
 * hover tint itself, or the raised fill it needs to cover the columns under it would hide the tint. */
export const ROW_FILL = {
  plain: 'bg-surface-raised group-hover/row:bg-surface',
  striped: 'bg-surface',
} as const

/** The frame's hover row: the page's surface under the pointer, so the eye can follow it across. */
export const ROW = 'group/row hover:bg-surface'

/** Drawn above the header row, or read out without being drawn. */
export const CAPTION = {
  visible: 'border-b-(length:--tc-line-width) border-line px-4 py-3 text-start text-sm font-medium text-body',
  hidden: 'sr-only',
} as const

/** One line each: a narrow screen scrolls the box instead of stacking a date word by word. */
export const HEADER_CELL = 'px-3.5 text-xs font-medium whitespace-nowrap text-muted bg-surface'

/** The line is on the cell, not the row: a sticky cell carries its own border with it. The frame reads a row from
 * its header cell, so the other cells are muted. */
export const BODY_CELL = 'border-t-(length:--tc-line-width) border-line px-3.5 text-sm whitespace-nowrap text-muted'

/** The block padding of each density: comfortable is the frame's row, compact the same row with a quarter of it. */
export const CELL_DENSITY = {
  comfortable: { header: 'py-2', body: 'py-3' },
  compact: { header: 'py-1.5', body: 'py-1.5' },
} as const satisfies Record<TableDensity, Record<'header' | 'body', string>>

/** A row header is a th, which a browser draws bold and centred; the frame draws it medium, in the body colour. */
export const ROW_HEADER = 'font-medium text-body'

export const EMPTY_CELL = 'border-t-(length:--tc-line-width) border-line px-3.5 py-6 text-center text-xs text-muted'

/** The cell is as wide as the table, so its words stick to the part of the box in view; the tray sits over them. */
export const EMPTY_WORDS = 'sticky inset-s-4 inset-e-4 mx-auto flex w-fit flex-col items-center gap-1.25'

/** The frame's empty tray, a step over the text. */
export const EMPTY_ICON = 'text-muted'

/** The caret after a header: a muted pair while the column can be sorted, the direction once it is. */
export const SORT_ICON = 'ms-1.25 shrink-0'
export const SORT_IDLE = `${SORT_ICON} text-muted`

/** inline-flex: as wide as its label, so the ring is the header's and not the column's. align-top:
 * on the baseline a header that wraps makes its row 4 px taller. -my-1 gives back the 8 px the
 * 24 px target adds, so a sortable header row is no taller. CONTAIN is R-5.2-7. */
export const SORT_LINK = `inline-flex items-center -my-1 align-top rounded-chip ${CONTAIN} ${HOVER.link} ${FOCUS_RING} ${TOUCH_TARGET}`

/** R-5.2-7: LABEL without its nowrap, so the cell still decides whether its header wraps. */
export const HEADER_LABEL = 'min-w-0 overflow-hidden text-ellipsis'

/** The placeholder never scrolls: it has no tab stop, so nothing in it may need one.
 * grid grid-cols-1 as on BOX: it stands where the table will, in the same grid or flex parent. */
export const SKELETON_BOX = 'grid grid-cols-1 overflow-hidden rounded-box bg-surface-raised'

/** One line of nothing: as tall as the type, with margins making up the line height. */
export const SKELETON_BAR = `block h-[1em] my-[calc((1lh-1em)/2)] w-full rounded-chip bg-neutral-soft animate-pulse motion-reduce:animate-none ${FORCED_EDGE}`

/** A percentage width adds nothing to the column, so a narrow box squeezes the bars and never overflows. */
export const SKELETON_WIDTH = {
  header: 'max-w-12',
  cell: 'max-w-24',
} as const
