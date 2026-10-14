// Pure helpers: the clamps, the row count and the counter. No React, so the node tests run them as they are.
import { clamp } from '#shared/clamp.js'
import { COUNTER_THRESHOLD } from '#shared/contracts/boundaries.js'
import { TEXTAREA_BOUNDARIES } from './boundaries.js'

/** R-5.7-7: the caller's rows as a whole number inside the bounds. */
export function clampRows(rows: number): number {
  return clamp(Math.round(rows), TEXTAREA_BOUNDARIES.rowsMin, TEXTAREA_BOUNDARIES.rowsMax)
}

/** maxRows inside its bounds, and never under rows: a field cannot grow to less than it starts at. */
export function clampMaxRows(maxRows: number, rows: number): number {
  return Math.max(clamp(Math.round(maxRows), TEXTAREA_BOUNDARIES.maxRowsMin, TEXTAREA_BOUNDARIES.maxRowsMax), rows)
}

/** The server cannot measure a wrapped line: a row per line break, clamped. */
export function estimateRows(text: string, rows: number, maxRows: number): number {
  return clamp(text.split('\n').length, rows, maxRows)
}

/** The rows the text needs, from the scrollHeight read with rows at the minimum. The browser rounds
 * scrollHeight to a whole pixel, so a pixel is taken off before the division: three lines of 22.86 px read 3, not 4. */
export function rowsFor(scrollHeight: number, padding: number, lineHeight: number, rows: number, maxRows: number): number {
  return clamp(Math.ceil((scrollHeight - padding - 1) / lineHeight), rows, maxRows)
}

/** Whether the counter shows: always with showCount, else once the length reaches nine tenths of the cap. */
export function isCounted(length: number, cap: number | null, showCount: boolean): boolean {
  if (cap === null) return false
  return showCount || length >= cap * COUNTER_THRESHOLD
}

/** At the cap is not an error; over it, which only a value set by code can be, is. */
export function limitOf(length: number, cap: number | null): 'under' | 'at' | 'over' {
  if (cap === null || length < cap) return 'under'
  return length === cap ? 'at' : 'over'
}

/** The visible count, both numbers in the provider's digits: "42 / 500". */
export function countText(length: number, cap: number, format: Intl.NumberFormat): string {
  return `${format.format(length)} / ${format.format(cap)}`
}

/** The ids aria-describedby reads, the caller's first. */
export function joinIds(...ids: (string | undefined)[]): string | undefined {
  const joined = ids.filter((id) => id !== undefined && id !== '').join(' ')
  return joined === '' ? undefined : joined
}
