// Pure helpers of the code field: the digit filter, the clamps and the layout of the row. No React here.
import { clamp } from '#shared/clamp.js'
import { OTP_FIELD_BOUNDARIES } from './boundaries.js'
import { OTP_FIELD_DIGIT_ZEROS, OTP_FIELD_WRAP_ABOVE } from './constants.js'
import type { OtpFieldValueProps } from './types.js'

const [arabicIndic, persian] = OTP_FIELD_DIGIT_ZEROS

/** Keeps 0 to 9, reads Arabic-Indic (U+0660) and Persian (U+06F0) digits as them, and drops everything else. */
export function toAsciiDigits(value: string): string {
  let out = ''
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0
    if (char >= '0' && char <= '9') out += char
    else if (code >= arabicIndic && code <= arabicIndic + 9) out += String(code - arabicIndic)
    else if (code >= persian && code <= persian + 9) out += String(code - persian)
  }
  return out
}

/** A whole number of cells between 1 and 12 (R-5.7-7). */
export function clampLength(length: number): number {
  return Math.trunc(clamp(length, OTP_FIELD_BOUNDARIES.lengthMin, OTP_FIELD_BOUNDARIES.lengthMax))
}

/** After which cells a separator stands, and whether the row of cells and separators wraps. */
export function layoutCells(length: number, groupSize: number): { separators: boolean[], wraps: boolean } {
  const group = Math.trunc(clamp(groupSize, OTP_FIELD_BOUNDARIES.groupSizeMin, length))
  const separators = Array.from({ length }, (_, index) => group > 0 && index < length - 1 && (index + 1) % group === 0)
  const items = length + separators.filter(Boolean).length
  return { separators, wraps: items > OTP_FIELD_WRAP_ABOVE }
}

type Digits = Pick<OtpFieldValueProps, 'validationType' | 'normalizeValue' | 'inputMode'>

/** Base UI's numeric type is ASCII only, so an Arabic keyboard could not fill the field: numeric becomes none with
 * our filter as the only gate (choice 21). A caller's own normalizeValue, or another type, passes through. */
export function digitRules({ validationType = 'numeric', normalizeValue, inputMode }: Digits): Digits {
  if (validationType !== 'numeric' || normalizeValue) return { validationType, normalizeValue, inputMode }
  return { validationType: 'none', normalizeValue: toAsciiDigits, inputMode: inputMode ?? 'numeric' }
}
