// R-5.12-4: Pagination's own class tables, read by variants.ts and index.tsx.
import { BORDER_STRONG } from '#shared/classes.js'
import type { Size } from '#shared/contracts/size.js'

/** The row wraps, so eleven cells at 44 px still fit a phone instead of scrolling it. */
export const LIST = 'flex flex-wrap items-center gap-1'

/** What a link, an edge control and a gap share: a centred box with the control radius. */
export const CELL = 'inline-flex items-center justify-center rounded-control font-medium'

/** A square at the control height, with the type step CONTROL_SIZE gives that height. */
export const CELL_SIZE = {
  xs: 'size-control-xs text-xs',
  sm: 'size-control-sm text-sm',
  md: 'size-control-md text-sm',
  lg: 'size-control-lg text-base',
  xl: 'size-control-xl text-base',
  custom: '',
} as const satisfies Record<Size, string>

/** The page the reader is on: filled, so it is found without reading a number. */
export const CELL_CURRENT = 'bg-primary-solid text-primary-on-solid'

/** Every other cell: a control boundary at 3:1 and the body text colour. */
export const CELL_OTHER = `${BORDER_STRONG} text-body`

/** A gap is text, not a control: no boundary, no ring and no touch target. */
export const CELL_GAP = `${CELL} text-body`
