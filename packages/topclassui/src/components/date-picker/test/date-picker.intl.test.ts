import { afterEach, describe, expect, it } from 'vitest'

import { addDays, createDateFormats, localeWeekStart, monthGrid, parseIsoDate, resolveWeekStart, toIsoDate, todayParts } from '../lib.js'

// What the platform gives: the local calendar day, the locale's first day of the week, and the words and digits of Intl.
const day = (iso: string) => parseIsoDate(iso) ?? { year: -1, month: -1, day: -1 }
/** Intl writes an Arabic short date with a right-to-left mark before each slash, invisible in source, so it is spelt here. */
const marked = (text: string) => text.replaceAll('/', `${String.fromCodePoint(0x200f)}/`)

describe('todayParts reads the local calendar day, never the UTC one', () => {
  const zone = process.env['TZ']
  afterEach(() => {
    if (zone === undefined) delete process.env['TZ']
    else process.env['TZ'] = zone
  })

  it('Asia/Riyadh at 2026-10-14T22:30:00Z is 15 October; America/Los_Angeles at 2026-10-15T05:30:00Z is 14 October', () => {
    process.env['TZ'] = 'Asia/Riyadh'
    expect(todayParts(new Date('2026-10-14T22:30:00Z'))).toEqual({ year: 2026, month: 10, day: 15 })
    process.env['TZ'] = 'America/Los_Angeles'
    expect(todayParts(new Date('2026-10-15T05:30:00Z'))).toEqual({ year: 2026, month: 10, day: 14 })
  })

  it('across the change to summer time in Los Angeles, 8 March 2026: one calendar day either side of it', () => {
    process.env['TZ'] = 'America/Los_Angeles'
    expect(todayParts(new Date('2026-03-08T09:59:00Z'))).toEqual({ year: 2026, month: 3, day: 8 })
    expect(todayParts(new Date('2026-03-08T10:01:00Z'))).toEqual({ year: 2026, month: 3, day: 8 })
    expect(todayParts(new Date('2026-03-09T06:59:00Z'))).toEqual({ year: 2026, month: 3, day: 8 })
    expect(todayParts(new Date('2026-03-09T07:01:00Z'))).toEqual({ year: 2026, month: 3, day: 9 })
  })

  it('the date math is UTC, so a day in the summer-time change is still one day long, in any zone', () => {
    process.env['TZ'] = 'America/Los_Angeles'
    expect(toIsoDate(addDays(day('2026-03-07'), 1))).toBe('2026-03-08')
    expect(toIsoDate(addDays(day('2026-03-08'), 1))).toBe('2026-03-09')
    expect(toIsoDate(addDays(day('2026-11-01'), 1))).toBe('2026-11-02')
    process.env['TZ'] = 'Europe/London'
    expect(toIsoDate(addDays(day('2026-03-29'), 1))).toBe('2026-03-30')
    expect(monthGrid(2026, 3, 7).slice(7, 14).map((cell) => cell?.day ?? 0)).toEqual([8, 9, 10, 11, 12, 13, 14])
  })
})

describe('the first day of the week', () => {
  it('the locale\'s, from Intl: Sunday in en, Monday in en-GB, Saturday in ar', () => {
    expect(localeWeekStart('en')).toBe(7)
    expect(localeWeekStart('en-GB')).toBe(1)
    expect(localeWeekStart('ar')).toBe(6)
    expect(localeWeekStart('not a locale')).toBeNull()
  })

  it('a prop is rounded and clamped to 1 to 7; none takes the locale\'s, and Monday where there is none', () => {
    expect(resolveWeekStart(6, 'en')).toBe(6)
    expect(resolveWeekStart(0, 'en')).toBe(1)
    expect(resolveWeekStart(12, 'en')).toBe(7)
    expect(resolveWeekStart(2.6, 'en')).toBe(3)
    expect(resolveWeekStart(Number.NaN, 'en')).toBe(1)
    expect(resolveWeekStart(undefined, 'en-GB')).toBe(1)
    expect(resolveWeekStart(undefined, 'en')).toBe(7)
    expect(resolveWeekStart(undefined, 'not a locale')).toBe(1)
  })
})

describe('createDateFormats: Gregorian, UTC, the locale\'s words and the numbering system\'s digits', () => {
  const sept = { year: 2026, month: 9, day: 22 }

  it('en, en-GB and ar, in Latin digits', () => {
    const en = createDateFormats('en', 'latn')
    expect([en.date(sept), en.month(sept), en.full(sept)]).toEqual(['Sep 22, 2026', 'September 2026', 'Tuesday, September 22, 2026'])
    expect(en.weekday(1)).toEqual({ narrow: 'M', long: 'Monday' })
    expect(en.weekday(7)).toEqual({ narrow: 'S', long: 'Sunday' })
    expect(createDateFormats('en-GB', 'latn').date(sept)).toBe('22 Sept 2026')
    const ar = createDateFormats('ar', 'latn')
    expect([ar.date(sept), ar.month(sept)]).toEqual([marked('22/09/2026'), 'سبتمبر 2026'])
    expect(ar.weekday(2)).toEqual({ narrow: 'ث', long: 'الثلاثاء' })
  })

  it('Arabic-Indic digits with arab, also when the tag asks for them and the provider does too', () => {
    expect(createDateFormats('ar-u-nu-arab', 'arab').month(sept)).toBe('سبتمبر ٢٠٢٦')
    expect(createDateFormats('ar', 'arab').date(sept)).toBe(marked('٢٢/٠٩/٢٠٢٦'))
    expect(createDateFormats('ar-u-nu-arab', 'latn').month(sept)).toBe('سبتمبر 2026')
  })

  it('a locale that is Persian by calendar still names the Gregorian month; year 1 is year 1; a bad tag falls back to English', () => {
    expect(createDateFormats('fa', 'latn').month(sept)).toBe('سپتامبر 2026')
    expect(createDateFormats('en', 'latn').date({ year: 1, month: 1, day: 1 })).toBe('Jan 1, 1')
    expect(createDateFormats('not a locale', 'latn').date(sept)).toBe('Sep 22, 2026')
  })
})
