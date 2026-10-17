import { describe, expect, it } from 'vitest'

import {
  addDays, addMonths, clampIso, daysInMonth, isoWeekday, monthEnds, monthGrid, moveByKey, parseIsoDate, resolveRange, shiftMonth,
  toIsoDate, toValue,
} from '../lib.js'

// The date math, on plain days: the Intl half (today, the week's first day, the words) is date-picker.intl.test.ts.

const day = (iso: string) => parseIsoDate(iso) ?? { year: -1, month: -1, day: -1 }
const iso = (parts: { year: number, month: number, day: number }) => toIsoDate(parts)
const ALL = { min: '0001-01-01', max: '9999-12-31' }

describe('parseIsoDate and toIsoDate', () => {
  it('reads a real day and prints it back, four digits of year and two of month and day', () => {
    expect(parseIsoDate('2026-09-22')).toEqual({ year: 2026, month: 9, day: 22 })
    expect(toIsoDate({ year: 1, month: 2, day: 3 })).toBe('0001-02-03')
    expect(toIsoDate({ year: 9999, month: 12, day: 31 })).toBe('9999-12-31')
  })

  it('a string that is not a real day is null: no 30 February, no 13th month, no short form, no time, no number', () => {
    for (const wrong of ['2026-02-30', '2026-13-01', '2026-00-10', '2026-04-31', '2026-9-1', '26-09-01', '2026-09-22T00:00', ' 2026-09-22', '', 'tomorrow']) {
      expect(parseIsoDate(wrong), wrong).toBeNull()
    }
    expect(parseIsoDate(20260922)).toBeNull()
    expect(parseIsoDate(null)).toBeNull()
    expect(toValue('2026-02-29')).toBeNull()
    expect(toValue('2028-02-29')).toBe('2028-02-29')
  })
})

describe('month lengths and leap years', () => {
  it('every month of 2026, and February in a leap year, a century and a fourth century', () => {
    expect(Array.from({ length: 12 }, (_, at) => daysInMonth(2026, at + 1))).toEqual([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31])
    expect(daysInMonth(2024, 2)).toBe(29)
    expect(daysInMonth(2100, 2)).toBe(28)
    expect(daysInMonth(2000, 2)).toBe(29)
    expect(daysInMonth(1900, 2)).toBe(28)
  })

  it('year 1 and year 9999: a year under 100 is not moved to 1900', () => {
    expect(daysInMonth(1, 1)).toBe(31)
    expect(daysInMonth(4, 2)).toBe(29)
    expect(isoWeekday({ year: 1, month: 1, day: 1 })).toBe(1)
    expect(isoWeekday({ year: 9999, month: 12, day: 31 })).toBe(5)
    expect(isoWeekday({ year: 2026, month: 9, day: 1 })).toBe(2)
  })
})

describe('addDays and addMonths', () => {
  it('days cross a month, a year and 29 February', () => {
    expect(iso(addDays(day('2026-09-30'), 1))).toBe('2026-10-01')
    expect(iso(addDays(day('2026-12-31'), 1))).toBe('2027-01-01')
    expect(iso(addDays(day('2024-02-28'), 1))).toBe('2024-02-29')
    expect(iso(addDays(day('2026-03-01'), -1))).toBe('2026-02-28')
    expect(iso(addDays(day('2026-09-22'), -7))).toBe('2026-09-15')
  })

  it('the day is kept inside the new month: 31 March back to 28 February, 29 February 2024 on to 28 February 2025', () => {
    expect(iso(addMonths(day('2026-03-31'), -1))).toBe('2026-02-28')
    expect(iso(addMonths(day('2024-03-31'), -1))).toBe('2024-02-29')
    expect(iso(addMonths(day('2024-02-29'), 12))).toBe('2025-02-28')
    expect(iso(addMonths(day('2026-01-31'), 1))).toBe('2026-02-28')
    expect(iso(addMonths(day('2026-08-31'), 1))).toBe('2026-09-30')
    expect(iso(addMonths(day('2026-12-15'), 1))).toBe('2027-01-15')
    expect(iso(addMonths(day('2026-01-15'), -1))).toBe('2025-12-15')
  })

  it('stops at the first and the last day four digits can write', () => {
    expect(iso(addDays(day('0001-01-01'), -1))).toBe('0001-01-01')
    expect(iso(addMonths(day('0001-01-15'), -1))).toBe('0001-01-01')
    expect(iso(addDays(day('9999-12-31'), 1))).toBe('9999-12-31')
    expect(iso(addMonths(day('9999-12-15'), 12))).toBe('9999-12-31')
  })
})

describe('monthGrid', () => {
  const days = (cells: ReturnType<typeof monthGrid>) => cells.map((cell) => cell?.day ?? 0)

  it('September 2026, Monday first: one blank, then 1 to 6; the last row of days ends with 28, 29, 30', () => {
    const cells = days(monthGrid(2026, 9, 1))
    expect(cells).toHaveLength(42)
    expect(cells.slice(0, 7)).toEqual([0, 1, 2, 3, 4, 5, 6])
    expect(cells.slice(28, 35)).toEqual([28, 29, 30, 0, 0, 0, 0])
    expect(cells.slice(35)).toEqual([0, 0, 0, 0, 0, 0, 0])
  })

  it('Sunday first: two blanks; Saturday first: three', () => {
    expect(days(monthGrid(2026, 9, 7)).slice(0, 7)).toEqual([0, 0, 1, 2, 3, 4, 5])
    expect(days(monthGrid(2026, 9, 6)).slice(0, 7)).toEqual([0, 0, 0, 1, 2, 3, 4])
  })

  it('a February that starts a Monday fills four rows and leaves two blank, still 42 cells', () => {
    const cells = days(monthGrid(2027, 2, 1))
    expect(cells.slice(0, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(cells.slice(21, 28)).toEqual([22, 23, 24, 25, 26, 27, 28])
    expect(cells.slice(28).every((cell) => cell === 0)).toBe(true)
  })

  it('a month that needs six rows: August 2026 Monday first ends on the 31st in the sixth', () => {
    expect(days(monthGrid(2026, 8, 1)).slice(35)).toEqual([31, 0, 0, 0, 0, 0, 0])
  })

  it('year 1 and year 9999', () => {
    expect(days(monthGrid(1, 1, 1)).slice(0, 2)).toEqual([1, 2])
    expect(days(monthGrid(9999, 12, 1)).slice(28, 35)).toEqual([27, 28, 29, 30, 31, 0, 0])
  })
})

describe('clampIso and resolveRange (R-5.7-7 for a date)', () => {
  it('clamps into the range and keeps what is inside', () => {
    expect(clampIso('2026-09-01', '2026-09-25', '2027-03-31')).toBe('2026-09-25')
    expect(clampIso('2027-04-01', '2026-09-25', '2027-03-31')).toBe('2027-03-31')
    expect(clampIso('2026-10-02', '2026-09-25', '2027-03-31')).toBe('2026-10-02')
  })

  it('a date that is not real takes the bound; year 0 is clamped up to year 1; maxDate below minDate is raised to it', () => {
    expect(resolveRange(undefined, undefined)).toEqual({ min: '0001-01-01', max: '9999-12-31' })
    expect(resolveRange('2026-02-30', 'soon')).toEqual({ min: '0001-01-01', max: '9999-12-31' })
    expect(resolveRange('0000-06-01', '2026-01-01')).toEqual({ min: '0001-01-01', max: '2026-01-01' })
    expect(resolveRange('2027-01-01', '2026-01-01')).toEqual({ min: '2027-01-01', max: '2027-01-01' })
    expect(resolveRange('2026-09-25', '2027-03-31')).toEqual({ min: '2026-09-25', max: '2027-03-31' })
  })
})

describe('moveByKey: the keys of the Authoring Practices grid', () => {
  const move = (from: string, key: string, options: { shift?: boolean, rtl?: boolean, start?: number, range?: { min: string, max: string } } = {}) =>
    moveByKey(from, key, options.shift ?? false, options.rtl ?? false, options.start ?? 1, options.range ?? ALL)

  it('the arrows move a day and a week; in RTL ArrowLeft is the next day', () => {
    expect([move('2026-09-22', 'ArrowRight'), move('2026-09-22', 'ArrowLeft')]).toEqual(['2026-09-23', '2026-09-21'])
    expect([move('2026-09-22', 'ArrowRight', { rtl: true }), move('2026-09-22', 'ArrowLeft', { rtl: true })]).toEqual(['2026-09-21', '2026-09-23'])
    expect([move('2026-09-22', 'ArrowDown'), move('2026-09-22', 'ArrowUp')]).toEqual(['2026-09-29', '2026-09-15'])
    expect([move('2026-09-22', 'ArrowDown', { rtl: true }), move('2026-09-30', 'ArrowDown')]).toEqual(['2026-09-29', '2026-10-07'])
  })

  it('Home and End: the first and the last day of the row, by the week\'s first day, kept inside the month', () => {
    expect([move('2026-09-23', 'Home'), move('2026-09-23', 'End')]).toEqual(['2026-09-21', '2026-09-27'])
    expect([move('2026-09-23', 'Home', { start: 7 }), move('2026-09-23', 'End', { start: 7 })]).toEqual(['2026-09-20', '2026-09-26'])
    expect([move('2026-09-03', 'Home'), move('2026-09-29', 'End')]).toEqual(['2026-09-01', '2026-09-30'])
    expect([move('2026-09-23', 'Home', { rtl: true }), move('2026-09-23', 'End', { start: 6 })]).toEqual(['2026-09-21', '2026-09-25'])
  })

  it('PageUp and PageDown: a month, with Shift a year; PageUp from 31 March is 28 February', () => {
    expect([move('2026-03-31', 'PageUp'), move('2026-01-31', 'PageDown')]).toEqual(['2026-02-28', '2026-02-28'])
    expect([move('2024-02-29', 'PageDown', { shift: true }), move('2024-02-29', 'PageUp', { shift: true })]).toEqual(['2025-02-28', '2023-02-28'])
  })

  it('the range stops the active day, and a day outside it moves in on the first key', () => {
    const range = { min: '2026-09-25', max: '2027-03-31' }
    expect(move('2026-09-25', 'ArrowLeft', { range })).toBe('2026-09-25')
    expect(move('2026-09-26', 'ArrowUp', { range })).toBe('2026-09-25')
    expect(move('2027-03-31', 'PageDown', { range })).toBe('2027-03-31')
    expect(move('2030-01-01', 'ArrowRight', { range })).toBe('2027-03-31')
    expect(move('2020-01-01', 'ArrowLeft', { range })).toBe('2026-09-25')
  })

  it('any other key is left alone', () => {
    for (const key of ['Enter', ' ', 'Tab', 'Escape', 'a']) expect(move('2026-09-22', key), key).toBeNull()
  })
})

describe('the month buttons', () => {
  const range = { min: '2026-09-25', max: '2027-03-31' }

  it('move a month, kept in the range, and stop where the month beyond lies wholly outside it', () => {
    expect(shiftMonth('2026-10-02', -1, range)).toBe('2026-09-25')
    expect(shiftMonth('2027-01-31', 1, range)).toBe('2027-02-28')
    expect(monthEnds('2026-09-30', range)).toEqual({ atFirst: true, atLast: false })
    expect(monthEnds('2026-10-01', range)).toEqual({ atFirst: false, atLast: false })
    expect(monthEnds('2027-03-01', range)).toEqual({ atFirst: false, atLast: true })
    expect(monthEnds('0001-01-15', ALL)).toEqual({ atFirst: true, atLast: false })
    expect(monthEnds('9999-12-01', ALL)).toEqual({ atFirst: false, atLast: true })
  })
})

