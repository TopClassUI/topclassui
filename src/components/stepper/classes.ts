// R-5.12-4: Stepper's own class tables. The stroke of a todo circle is the shared knob.
import { BORDER_STRONG } from '#shared/classes.js'

/** Equal columns, so each connector runs from one centre to the next. */
export const STEPPER_ROOT = 'flex w-full min-w-0 items-start'

/** relative: the hidden status word sits inside it (an sr-only span outside one grew the Sidebar page). */
export const STEPPER_STEP = 'relative flex min-w-0 flex-1 flex-col items-center gap-2 text-center'

/** The mark and the line behind it share one row, so the line is level with the centre at every size. */
export const STEPPER_MARK_ROW = 'relative flex w-full justify-center'

/** From this centre to the next. A border, not a fill: forced colours repaint a border and erase a fill. */
export const STEPPER_CONNECTOR = 'absolute top-1/2 inset-s-1/2 w-full -translate-y-1/2 border-t-(length:--tc-line-width) border-line data-done:border-primary-solid'

/** Painted after the line, so it covers the line's ends. A circle is a shape, not a radius knob. */
export const STEPPER_MARK = 'relative inline-flex shrink-0 items-center justify-center rounded-full font-medium tabular-nums'

/** One step under the control scale: md is the drawn 32 px. */
export const STEPPER_MARK_SIZE = {
  xs: 'size-[calc(1.5rem*var(--tc-density))] text-xs',
  sm: 'size-control-xs text-xs',
  md: 'size-control-sm text-sm',
  lg: 'size-control-md text-sm',
  xl: 'size-control-lg text-base',
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
