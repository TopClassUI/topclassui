// R-8.3-2: the value lists and the defaults. The bounds live in boundaries.ts.
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'

export const OTP_FIELD_SIZES = SIZES

/** The zero of each digit range a numeric field reads as 0 to 9: Arabic-Indic (U+0660) and Persian (U+06F0). */
export const OTP_FIELD_DIGIT_ZEROS = [0x660, 0x6f0] as const

/** Past this many items, cells and separators together, a row breaks at whole cells, so on a phone each keeps 44 px. */
export const OTP_FIELD_WRAP_ABOVE = 8

/** The characters a cell keeps, Base UI's four; `numeric` is ours, with Arabic-Indic and Persian digits too (choice 21). */
export const OTP_FIELD_VALIDATION_TYPES = ['numeric', 'alpha', 'alphanumeric', 'none'] as const

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const OTP_FIELD_DEFAULTS = {
  length: 6,
  size: DEFAULT_SIZE,
  invalid: false,
  groupSize: 0,
  validationType: 'numeric',
  // Held by our hook: Base UI is always handed the controlled pair, and the empty string is no code typed yet.
  defaultValue: '',
} as const
