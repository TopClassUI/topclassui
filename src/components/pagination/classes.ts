// R-5.12-4: Pagination's own class tables, read by variants.ts and index.tsx.
import { BORDER_STRONG, HOVER } from '#shared/classes.js'
import type { Size } from '#shared/contracts/size.js'
import { TONE_CLASS } from '#shared/contracts/tone.js'

/** The row wraps, so eleven cells at 44 px still fit a phone instead of scrolling it. */
export const LIST = 'flex flex-wrap items-center gap-1'

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

/** The page the reader is on: filled, so it is found without reading a number. */
export const CELL_CURRENT = `bg-primary-solid text-primary-on-solid ${TONE_CLASS.primary} ${HOVER.solid}`

/** Every other cell: a control boundary at 3:1, body text, and the neutral tint under a pointer. */
export const CELL_OTHER = `${BORDER_STRONG} text-body ${TONE_CLASS.neutral} ${HOVER.outline}`

/** A gap is text, not a control: no boundary, no ring and no hover. */
export const CELL_GAP = `${CELL} text-body`
