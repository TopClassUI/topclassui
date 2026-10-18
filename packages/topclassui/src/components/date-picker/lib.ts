// The date math on plain { year, month, day }, a UTC Date only for a weekday and a month's length, and the formatters.
import { clamp } from '#shared/clamp.js'
import { DATE_PICKER_BOUNDARIES } from './boundaries.js'
import { DATE_PICKER_DEFAULTS, DATE_PICKER_ISO_PATTERN } from './constants.js'
import type { DateFormats, DateParts, DateRange } from './types.js'

const { minDate: FIRST, maxDate: LAST, firstDayOfWeekMin, firstDayOfWeekMax } = DATE_PICKER_BOUNDARIES

/** Midnight UTC of any year: Date.UTC(1, 0, 1) is a day in 1901, setUTCFullYear keeps the year as given. */
function utcDate(year: number, month: number, day: number): Date {
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  return date
}

const partsOf = (date: Date): DateParts => ({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() })

export function daysInMonth(year: number, month: number): number {
  return utcDate(year, month + 1, 0).getUTCDate()
}

/** Monday 1 to Sunday 7, as Intl counts them. */
export function isoWeekday({ year, month, day }: DateParts): number {
  return ((utcDate(year, month, day).getUTCDay() + 6) % 7) + 1
}

/** The day an ISO string names, or null for anything that is not a real day: 2026-02-30, 2026-9-1, a number. */
export function parseIsoDate(iso: unknown): DateParts | null {
  if (typeof iso !== 'string') return null
  const match = DATE_PICKER_ISO_PATTERN.exec(iso)
  if (!match) return null
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null
  return { year, month, day }
}

export function toIsoDate({ year, month, day }: DateParts): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** The string itself when it names a real day, else null: the value a DatePicker holds. */
export function toValue(iso: unknown): string | null {
  return parseIsoDate(iso) === null ? null : (iso as string)
}

/** R-5.7-7 for a date. Four-digit ISO strings compare as the days they name. */
export function clampIso(iso: string, min: string, max: string): string {
  if (iso < min) return min
  return iso > max ? max : iso
}

/** Past the first or the last day four digits can write, the math stops there, so every string stays four digits. */
function withinYears(parts: DateParts): DateParts {
  if (parts.year < 1) return { year: 1, month: 1, day: 1 }
  return parts.year > 9999 ? { year: 9999, month: 12, day: 31 } : parts
}

export function addDays(parts: DateParts, days: number): DateParts {
  return withinYears(partsOf(utcDate(parts.year, parts.month, parts.day + days)))
}

/** The same day in another month, kept inside it: 31 January plus a month is 28 or 29 February. */
export function addMonths(parts: DateParts, months: number): DateParts {
  const index = parts.year * 12 + parts.month - 1 + months
  const year = Math.floor(index / 12)
  const month = index - year * 12 + 1
  return withinYears({ year, month, day: Math.min(parts.day, daysInMonth(year, month)) })
}

/** Six weeks of seven days from the week's first day, null outside the month: always 42, so the popup keeps its height. */
export function monthGrid(year: number, month: number, firstDay: number): (DateParts | null)[] {
  const offset = (isoWeekday({ year, month, day: 1 }) - firstDay + 7) % 7
  const length = daysInMonth(year, month)
  return Array.from({ length: 42 }, (_, at) => {
    const day = at - offset + 1
    return day >= 1 && day <= length ? { year, month, day } : null
  })
}

/** The browser's local calendar day: never a UTC getter, which in Riyadh after 21:00 UTC is already tomorrow. */
export function todayParts(now: Date): DateParts {
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
}

/** minDate and maxDate, each a real day clamped into the bounds, and maxDate raised to minDate when below it. */
export function resolveRange(minDate: unknown, maxDate: unknown): DateRange {
  const min = clampIso(toValue(minDate) ?? FIRST, FIRST, LAST)
  const max = clampIso(toValue(maxDate) ?? LAST, FIRST, LAST)
  return { min, max: max < min ? min : max }
}

interface WeekSource { getWeekInfo?: () => { firstDay?: unknown }, weekInfo?: { firstDay?: unknown } }

/** The locale's first day, 1 to 7: getWeekInfo() in Chromium, the weekInfo getter in Node 22; null where neither is. */
export function localeWeekStart(locale: string): number | null {
  try {
    const source = new Intl.Locale(locale) as unknown as WeekSource
    const first = (source.getWeekInfo?.() ?? source.weekInfo)?.firstDay
    return typeof first === 'number' && first >= 1 && first <= 7 ? first : null
  } catch {
    return null
  }
}

/** The caller's day, rounded and clamped to 1 to 7, else the locale's, else Monday. */
export function resolveWeekStart(firstDayOfWeek: number | undefined, locale: string): number {
  if (firstDayOfWeek !== undefined) return clamp(Math.round(firstDayOfWeek), firstDayOfWeekMin, firstDayOfWeekMax)
  return localeWeekStart(locale) ?? DATE_PICKER_DEFAULTS.weekStartFallback
}

/** Where a key of the day grid moves the active day, kept in the range; null for a key the grid leaves alone. */
export function moveByKey(active: string, key: string, shift: boolean, rtl: boolean, weekStart: number, range: DateRange): string | null {
  const parts = parseIsoDate(active)
  if (parts === null) return null
  const ahead = rtl ? -1 : 1
  const back = (isoWeekday(parts) - weekStart + 7) % 7
  const moves: Record<string, () => DateParts> = {
    ArrowRight: () => addDays(parts, ahead),
    ArrowLeft: () => addDays(parts, -ahead),
    ArrowDown: () => addDays(parts, 7),
    ArrowUp: () => addDays(parts, -7),
    Home: () => addDays(parts, -back),
    End: () => addDays(parts, 6 - back),
    PageUp: () => addMonths(parts, shift ? -12 : -1),
    PageDown: () => addMonths(parts, shift ? 12 : 1),
  }
  const move = moves[key]
  return move ? clampIso(toIsoDate(move()), range.min, range.max) : null
}

/** The same day in the month before or after, kept in the range: what the previous and next buttons do. */
export function shiftMonth(active: string, months: number, range: DateRange): string {
  const parts = parseIsoDate(active) ?? parseIsoDate(range.min) ?? { year: 1, month: 1, day: 1 }
  return clampIso(toIsoDate(addMonths(parts, months)), range.min, range.max)
}

/** Whether the month before lies wholly under minDate, and the month after wholly over maxDate. */
export function monthEnds(active: string, range: DateRange): { atFirst: boolean, atLast: boolean } {
  const parts = parseIsoDate(active) ?? { year: 1, month: 1, day: 1 }
  const first = toIsoDate({ ...parts, day: 1 })
  const last = toIsoDate({ ...parts, day: daysInMonth(parts.year, parts.month) })
  return { atFirst: first <= range.min, atLast: last >= range.max }
}

/** A formatter that never throws: a tag Intl refuses falls back to its language, then to English. */
function formatter(locale: string, numberingSystem: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const fixed = { ...options, calendar: 'gregory', timeZone: 'UTC' }
  for (const tag of [locale, locale.split(/[-_]/)[0] ?? 'en']) {
    try {
      return new Intl.DateTimeFormat(tag, { ...fixed, numberingSystem })
    } catch {
      continue
    }
  }
  return new Intl.DateTimeFormat('en', fixed)
}

/** One set per locale and numbering system. Gregorian and UTC always: each formats a plain day, never an instant. */
export function createDateFormats(locale: string, numberingSystem: string): DateFormats {
  const date = formatter(locale, numberingSystem, { dateStyle: 'medium' })
  const month = formatter(locale, numberingSystem, { month: 'long', year: 'numeric' })
  const full = formatter(locale, numberingSystem, { dateStyle: 'full' })
  const narrow = formatter(locale, numberingSystem, { weekday: 'narrow' })
  const long = formatter(locale, numberingSystem, { weekday: 'long' })
  const at = (parts: DateParts) => utcDate(parts.year, parts.month, parts.day)
  return {
    date: (parts) => date.format(at(parts)),
    month: (parts) => month.format(at(parts)),
    full: (parts) => full.format(at(parts)),
    // 1 January 2024 was a Monday, so the first week of 2024 names the seven days in Intl's order.
    weekday: (day) => ({ narrow: narrow.format(utcDate(2024, 1, day)), long: long.format(utcDate(2024, 1, day)) }),
  }
}
