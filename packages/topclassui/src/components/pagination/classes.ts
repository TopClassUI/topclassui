// R-5.12-4: Pagination's own class tables, read by variants.ts and index.tsx.
import { BORDER, HOVER, POINTER } from '#shared/classes.js'
import type { Size } from '#shared/contracts/size.js'
import { TONE_CLASS } from '#shared/contracts/tone.js'

/** The row wraps, so eleven cells at 44 px still fit a phone instead of scrolling it. */
export const LIST = 'flex flex-wrap items-center'

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

/** A gap is a mark, not a control: muted, with no boundary, no ring, no hover and no pointer. */
export const CELL_GAP = 'inline-flex items-center justify-center text-muted'
