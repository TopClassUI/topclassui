/** R-5.12-4: Separator's own class table. A one-sided border at the --tc-line-width knob,
 * not a filled box, so the line survives forced colors. No margin and no shrink-0: the gap
 * of the parent spaces it, and two lines beside a text have to share the row. */
import type { SeparatorOrientation } from './types.js'

/** R-5.3-1: the vertical line is the inline-start border, so it mirrors in RTL. */
export const SEPARATOR_ORIENTATION = {
  horizontal: 'w-full border-t-(length:--tc-line-width) border-line',
  vertical: 'self-stretch border-s-(length:--tc-line-width) border-line',
} as const satisfies Record<SeparatorOrientation, string>
