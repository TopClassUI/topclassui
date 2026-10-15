// R-5.12-4: the class strings of the code field, built from the shared constants (unit-4.md, OTPField).
import {
  BORDER_STRONG, DISABLED, FIELD_INVALID, FIELD_TEXT_COARSE, FOCUS_RING, TARGET_HEIGHT, TRANSITION,
} from '#shared/classes.js'

/** As wide as its cells, so in an Arabic form the group sits at the start, beside its label, while the cells run left to right. */
export const OTP_ROOT = 'flex w-fit min-w-0 max-w-full items-center gap-2'

/** Past eight items a row cannot shrink enough: nine cells of 24 px and their gaps are 280 px. */
export const OTP_WRAP = 'flex-wrap'

/** A cell may give up width where six do not fit, and never height. w-full under a max-w, not a basis: a table cell or a shrinking parent then counts a cell as 24 px, not 44. */
export const OTP_CELL = `w-full min-w-[var(--tc-target-min,24px)] shrink grow-0 p-0 text-center font-semibold tabular-nums rounded-control bg-surface-raised text-body ${BORDER_STRONG} ${TRANSITION} ${DISABLED} ${FOCUS_RING} ${TARGET_HEIGHT} ${FIELD_INVALID}`

/** A square of the control scale, as the most a cell may be. Under a coarse pointer the three small sizes may be 44 px wide, and typed text is never under 16 px. */
export const OTP_CELL_SIZE = {
  xs: `h-control-xs max-w-control-xs text-sm pointer-coarse:max-w-[var(--tc-target-coarse,44px)] ${FIELD_TEXT_COARSE}`,
  sm: `h-control-sm max-w-control-sm text-base pointer-coarse:max-w-[var(--tc-target-coarse,44px)] ${FIELD_TEXT_COARSE}`,
  md: 'h-control-md max-w-control-md text-lg pointer-coarse:max-w-[var(--tc-target-coarse,44px)] pointer-coarse:text-[max(1.125rem,16px)]',
  lg: 'h-control-lg max-w-control-lg text-xl pointer-coarse:text-[max(1.25rem,16px)]',
  xl: 'h-control-xl max-w-control-xl text-2xl pointer-coarse:text-[max(1.5rem,16px)]',
  custom: '',
} as const

/** Decoration between groups: a 10 x 2 bar, which forced colours would erase as a fill. */
export const OTP_SEPARATOR = 'h-0.5 w-2.5 shrink-0 rounded-full bg-line-strong forced-colors:bg-[CanvasText]'
