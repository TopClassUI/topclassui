// R-5.12-4: the class strings of the slider (unit-4.md, Slider), built from the shared field and target constants.
import {
  DISABLED, FIELD_HOLDER, FIELD_HOLDER_FULL, FIELD_TEXT, KNOB_SIZE, TARGET_HEIGHT, TOUCH_TARGET,
} from '#shared/classes.js'

/** The box that owns the width. No type step here: FIELD_TEXT[size] gives it, so the em of the width is an Input's.
 * has-disabled: a disabled fieldset disables the range input, which Base UI does not know, so the root dims on that. */
export const SLIDER_ROOT = `group/slider grid ${FIELD_HOLDER} ${DISABLED} has-disabled:pointer-events-none has-disabled:opacity-50`

/** An Input's type step at each size, which sets the em of --tc-input-width. */
export const SLIDER_TEXT = FIELD_TEXT

/** fullWidth, merged after the root: w-full replaces w-fit and the column fills the box. */
export const SLIDER_FULL = FIELD_HOLDER_FULL

/** The knob, of the knob scale: 14, 16, 20, 24 and 28 px. */
export const SLIDER_KNOB_SIZE = KNOB_SIZE

/** The one item of that grid: the control, and the value after it, or below it when the value would eat the track. */
export const SLIDER_ROW = 'flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1'

/** Padded by half a target on each side, so a thumb at 0 or at 100 stays inside the box; custom keeps this. */
export const SLIDER_CONTROL = `relative flex min-w-2/3 flex-1 touch-none select-none items-center px-[calc(var(--tc-target-min,24px)/2)] pointer-coarse:px-[calc(var(--tc-target-coarse,44px)/2)] ${TARGET_HEIGHT}`

/** Merged after the control: half the knob plus its focus ring when that is more than half a target, as at xl or a
 * 32 px root, so the ring of a thumb at either end stays inside the box too. custom keeps the control's own. */
export const SLIDER_CONTROL_SIZE = {
  xs: 'px-[max(calc(var(--tc-target-min,24px)/2),calc(var(--spacing-knob-xs)/2+var(--tc-ring-offset)+var(--tc-ring-width)))] pointer-coarse:px-[max(calc(var(--tc-target-coarse,44px)/2),calc(var(--spacing-knob-xs)/2+var(--tc-ring-offset)+var(--tc-ring-width)))]',
  sm: 'px-[max(calc(var(--tc-target-min,24px)/2),calc(var(--spacing-knob-sm)/2+var(--tc-ring-offset)+var(--tc-ring-width)))] pointer-coarse:px-[max(calc(var(--tc-target-coarse,44px)/2),calc(var(--spacing-knob-sm)/2+var(--tc-ring-offset)+var(--tc-ring-width)))]',
  md: 'px-[max(calc(var(--tc-target-min,24px)/2),calc(var(--spacing-knob-md)/2+var(--tc-ring-offset)+var(--tc-ring-width)))] pointer-coarse:px-[max(calc(var(--tc-target-coarse,44px)/2),calc(var(--spacing-knob-md)/2+var(--tc-ring-offset)+var(--tc-ring-width)))]',
  lg: 'px-[max(calc(var(--tc-target-min,24px)/2),calc(var(--spacing-knob-lg)/2+var(--tc-ring-offset)+var(--tc-ring-width)))] pointer-coarse:px-[max(calc(var(--tc-target-coarse,44px)/2),calc(var(--spacing-knob-lg)/2+var(--tc-ring-offset)+var(--tc-ring-width)))]',
  xl: 'px-[max(calc(var(--tc-target-min,24px)/2),calc(var(--spacing-knob-xl)/2+var(--tc-ring-offset)+var(--tc-ring-width)))] pointer-coarse:px-[max(calc(var(--tc-target-coarse,44px)/2),calc(var(--spacing-knob-xl)/2+var(--tc-ring-offset)+var(--tc-ring-width)))]',
  custom: '',
} as const

/** The soft fill is 1.2:1 on the page, so a line-strong edge at 3:1 shows where the range ends, in forced colours too.
 * Invalid turns that line to danger: the red fill alone is a cue by hue. */
export const SLIDER_TRACK = 'w-full rounded-full bg-neutral-soft outline-solid outline-(length:--tc-line-width) outline-line-strong group-aria-invalid/slider:outline-danger-solid forced-colors:group-aria-invalid/slider:outline-(length:--tc-ring-width)'

export const SLIDER_TRACK_SIZE = { xs: 'h-1', sm: 'h-1', md: 'h-1.5', lg: 'h-2', xl: 'h-2', custom: '' } as const

/** Under forced colours the fill is Highlight, invalid too: its red would paint an author colour in the user's palette. */
export const SLIDER_INDICATOR = 'rounded-full bg-primary-solid group-aria-invalid/slider:bg-danger-solid forced-colors:forced-color-adjust-none forced-colors:bg-[Highlight] forced-colors:group-aria-invalid/slider:bg-[Highlight]'

/** The thumb is the target. The hidden range input fills it, and the shared spec measures that input. */
export const SLIDER_THUMB = `group/thumb flex items-center justify-center ${TOUCH_TARGET}`

/** The drawn knob, with the ring of the input that has the focus beside it. */
export const SLIDER_KNOB = 'block rounded-full border-(length:--tc-ring-width) border-primary-solid bg-surface-raised group-aria-invalid/slider:border-danger-solid group-has-focus-visible/thumb:outline-solid group-has-focus-visible/thumb:outline-(length:--tc-ring-width) group-has-focus-visible/thumb:outline-offset-(length:--tc-ring-offset) group-has-focus-visible/thumb:outline-ring'

/** At the end of its line, beside the track or below it; a value longer than the slider wraps rather than leaving it. */
export const SLIDER_VALUE = 'ms-auto min-w-[3ch] max-w-full text-end text-sm tabular-nums text-muted wrap-anywhere'
