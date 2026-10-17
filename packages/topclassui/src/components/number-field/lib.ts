// R-5.12-1: the pure helpers of the number field. No React, so a node test reads them as they are.
import { clamp } from '#shared/clamp.js'
import { NUMBER_FIELD_BOUNDARIES as BOUNDS } from './boundaries.js'
import { NUMBER_FIELD_DEFAULTS } from './constants.js'
import type { NumberFieldLimits } from './types.js'

/** R-5.7-7: `min` and `max` between the two limits, a numeric `step` from `stepMin` up. An absent or NaN bound stays
 * absent and a NaN step is the default, since clamp() reads NaN as its floor; a `max` under `min` is raised to it, as
 * clamp() does for the value, so the hidden input can still submit. */
export function resolveLimits(min: number | undefined, max: number | undefined, step: number | 'any'): NumberFieldLimits {
  const low = isBound(min) ? clamp(min, BOUNDS.limitMin, BOUNDS.limitMax) : undefined
  const high = isBound(max) ? clamp(max, BOUNDS.limitMin, BOUNDS.limitMax) : undefined
  return {
    min: low,
    max: low !== undefined && high !== undefined && high < low ? low : high,
    step: step === 'any' ? 'any' : Number.isNaN(step) ? NUMBER_FIELD_DEFAULTS.step : clamp(step, BOUNDS.stepMin, BOUNDS.limitMax),
  }
}

/** A bound the caller set: NaN reads as none, ±Infinity is pulled to a limit. */
function isBound(n: number | undefined): n is number {
  return n !== undefined && !Number.isNaN(n)
}

/** Base UI clamps what is typed, not what it is given: `defaultValue={50}` with `max={10}` would render and send 50. */
export function clampValue(value: number | null | undefined, limits: NumberFieldLimits, allowOutOfRange = false): number | null | undefined {
  if (value === undefined || value === null || allowOutOfRange) return value
  if (Number.isNaN(value)) return null
  return clamp(value, limits.min ?? BOUNDS.limitMin, limits.max ?? BOUNDS.limitMax)
}

/** The text Base UI shows for a value: the same formatter, so the two agree to the character. */
export function formatValue(value: number | null, locale: Intl.LocalesArgument, format: Intl.NumberFormatOptions | undefined): string {
  return value === null ? '' : new Intl.NumberFormat(locale, format).format(value)
}

/** The digits to write: the caller's `format.numberingSystem`, else a `-u-nu-` the caller wrote in `locale`, else the
 * provider's. Never the runtime's own default, which the server and the browser may not share. */
export function numberingSystemOf(locale: Intl.LocalesArgument, format: Intl.NumberFormatOptions | undefined, fallback: string): string {
  if (format?.numberingSystem !== undefined) return format.numberingSystem
  const tag = typeof locale === 'string' || locale instanceof Intl.Locale ? locale : locale?.[0]
  if (tag === undefined) return fallback
  try {
    return new Intl.Locale(tag).numberingSystem ?? fallback
  } catch {
    return fallback
  }
}

const LATIN_GROUPED = /^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/

/** Base UI 1.8.0 reads a pasted "1,234.5" as 1 where both separators are not Latin (Arabic-Indic digits use U+066C and
 * U+066B): there an ASCII comma can only be a Latin group. The plain number for such a paste, else null. */
export function latinPaste(text: string, locale: Intl.LocalesArgument, format: Intl.NumberFormatOptions | undefined): string | null {
  const trimmed = text.trim()
  if (!LATIN_GROUPED.test(trimmed)) return null
  try {
    const parts = new Intl.NumberFormat(locale, format).formatToParts(11111.1)
    const latin = parts.some(({ type, value }) => (type === 'group' || type === 'decimal') && (value === ',' || value === '.'))
    return latin ? null : trimmed.replace(/,/g, '')
  } catch {
    return null
  }
}
