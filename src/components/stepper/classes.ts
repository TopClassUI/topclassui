// R-5.12-4: Stepper's own class tables. The stroke of a todo circle is the shared knob.
import { BORDER_STRONG } from '#shared/classes.js'

/** Equal columns that wrap onto another row when the circles no longer fit, so none overlaps and the page never scrolls. */
export const STEPPER_ROOT = 'flex w-full min-w-0 flex-wrap items-start gap-y-4'

/** relative: the hidden status word sits inside it (an sr-only span outside one grew the Sidebar page).
 * Never narrower than its circle; the title wraps to the column instead. */
export const STEPPER_STEP = 'relative flex min-w-(--tc-stepper-mark) flex-1 flex-col items-center gap-2 text-center'

/** The mark and the line behind it share one row, so the line is level with the centre at every size. */
export const STEPPER_MARK_ROW = 'relative flex w-full justify-center'

/** Half a line: each step draws its own, so a row that wraps ends at the list's edge. A border, not a fill: forced colours erase a fill. */
const HALF_LINE = 'absolute top-1/2 w-1/2 -translate-y-1/2 border-t-(length:--tc-line-width) border-line data-done:border-primary-solid'

/** From this centre to the end of the column, where the next step's half takes over. */
export const STEPPER_CONNECTOR = `${HALF_LINE} inset-s-1/2`

/** From the start of the column to this centre, done when the step before it is. */
export const STEPPER_CONNECTOR_BEFORE = `${HALF_LINE} inset-s-0`

/** The circle's size, set on the list, one step under the control scale: md is the drawn 32 px. custom sets
 * none, so the circle reads the caller's --tc-stepper-mark, or the default of tokens.css. */
export const STEPPER_ROOT_SIZE = {
  xs: '[--tc-stepper-mark:calc(1.5rem*var(--tc-density))]',
  sm: '[--tc-stepper-mark:var(--spacing-control-xs)]',
  md: '[--tc-stepper-mark:var(--spacing-control-sm)]',
  lg: '[--tc-stepper-mark:var(--spacing-control-md)]',
  xl: '[--tc-stepper-mark:var(--spacing-control-lg)]',
  custom: '',
} as const

/** Painted after the line, so it covers the line's ends. A circle is a shape, not a radius knob. */
export const STEPPER_MARK = 'relative inline-flex size-(--tc-stepper-mark) shrink-0 items-center justify-center rounded-full font-medium tabular-nums'

/** The number's type step, beside the circle of each size. */
export const STEPPER_MARK_SIZE = {
  xs: 'text-xs',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-sm',
  xl: 'text-base',
  custom: '',
} as const

/** Forced colours erase a fill: a filled mark paints itself in the text colour there, as Timeline's dot does. */
const FILLED = 'forced-color-adjust-none forced-colors:bg-[CanvasText] forced-colors:text-[Canvas]'

/** The state is the tick, the number or the x; the colour only repeats it. */
export const STEPPER_MARK_STATUS = {
  done: `bg-primary-solid text-primary-on-solid ${FILLED}`,
  current: `bg-primary-solid text-primary-on-solid ${FILLED}`,
  todo: `bg-surface text-muted ${BORDER_STRONG}`,
  error: `bg-danger-solid text-danger-on-solid ${FILLED}`,
} as const

/** A long title wraps inside its column: a step is read whole, never cut. */
export const STEPPER_TITLE = 'max-w-full wrap-anywhere'

export const STEPPER_TITLE_SIZE = {
  xs: 'text-xs',
  sm: 'text-xs',
  md: 'text-xs',
  lg: 'text-sm',
  xl: 'text-base',
  custom: '',
} as const

export const STEPPER_TITLE_STATUS = {
  done: 'text-body',
  current: 'font-semibold text-body',
  todo: 'text-muted',
  error: 'text-body',
} as const

export const STEPPER_STATUS_TEXT = 'sr-only'
