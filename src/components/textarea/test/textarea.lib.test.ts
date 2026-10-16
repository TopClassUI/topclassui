import { describe, expect, it } from 'vitest'

import { clampCap, clampMaxRows, clampRows, countText, estimateRows, isCounted, joinIds, limitOf, rowsFor } from '../lib.js'

const latn = new Intl.NumberFormat('en', { numberingSystem: 'latn' })
const arab = new Intl.NumberFormat('ar', { numberingSystem: 'arab' })

describe('clampRows and clampMaxRows (R-5.7-7)', () => {
  it('keeps rows between 1 and 40, as a whole number', () => {
    expect([clampRows(3), clampRows(0), clampRows(-5), clampRows(99), clampRows(2.4), clampRows(Number.NaN)]).toEqual([3, 1, 1, 40, 2, 1])
  })

  it('keeps maxRows between 1 and 40 and never under rows', () => {
    expect([clampMaxRows(6, 3), clampMaxRows(2, 3), clampMaxRows(99, 3), clampMaxRows(0, 1), clampMaxRows(10, 40)]).toEqual([6, 3, 40, 1, 40])
  })
})

describe('clampCap (R-5.7-7)', () => {
  it('keeps the cap a whole number from 0 to the 2147483647 Chromium keeps, rounded down, and none as null', () => {
    expect([clampCap(500), clampCap(-1), clampCap(2.5), clampCap(2_147_483_648), clampCap(Infinity), clampCap(undefined)])
      .toEqual([500, 0, 2, 2147483647, 2147483647, null])
  })
})

describe('estimateRows, what the server can count', () => {
  it('is a row per line break plus one, between rows and maxRows', () => {
    expect([estimateRows('', 3, 6), estimateRows('a\nb\nc\nd', 3, 6), estimateRows('a\nb\nc\nd\ne\nf\ng\nh', 3, 6)]).toEqual([3, 4, 6])
  })

  it('counts a Windows line break once', () => {
    expect(estimateRows('a\r\nb\r\nc\r\nd', 1, 6)).toBe(4)
  })
})

describe('rowsFor, what the browser measured', () => {
  it('reads three lines of 20 px with 20 px of padding as 3, and four as 4', () => {
    expect([rowsFor(80, 20, 20, 3, 6), rowsFor(100, 20, 20, 3, 6)]).toEqual([3, 4])
  })

  it('reads three lines of 22.86 px, rounded up to a whole pixel by the browser, as 3', () => {
    expect([rowsFor(89, 20, 22.857, 1, 6), rowsFor(111, 20, 22.857, 1, 6)]).toEqual([3, 4])
  })

  it('never goes under rows or over maxRows', () => {
    expect([rowsFor(20, 20, 20, 3, 6), rowsFor(2000, 20, 20, 3, 6)]).toEqual([3, 6])
  })
})

describe('the counter', () => {
  it('shows always with showCount, from nine tenths of the cap without it, and never with no cap', () => {
    expect([isCounted(0, 60, true), isCounted(53, 60, false), isCounted(54, 60, false), isCounted(4500, 5000, false)]).toEqual([true, false, true, true])
    expect([isCounted(4499, 5000, false), isCounted(10, null, true)]).toEqual([false, false])
  })

  it('is under the cap, at it, or over it', () => {
    expect([limitOf(59, 60), limitOf(60, 60), limitOf(61, 60), limitOf(9999, null)]).toEqual(['under', 'at', 'over', 'under'])
  })

  it('reads both numbers in the digits of the format, the length first', () => {
    expect([countText(42, 500, latn), countText(42, 500, arab), countText(1234, 5000, latn)]).toEqual(['42 / 500', '٤٢ / ٥٠٠', '1,234 / 5,000'])
  })
})

describe('joinIds', () => {
  it("keeps the caller's ids first and drops the empty ones", () => {
    expect([joinIds('hint', 'count'), joinIds(undefined, 'count'), joinIds('', 'count'), joinIds(undefined)]).toEqual(['hint count', 'count', 'count', undefined])
  })
})
