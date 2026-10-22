import { describe, expect, it } from 'vitest'

import { clampPage, clampPageCount, listPages, measureRow, pickRowStep } from '../lib.js'

/** The four numbers in the order a case reads them, with the defaults of the component. */
const pages = (value: number, pageCount: number, siblingCount = 1, boundaryCount = 1) =>
  listPages({ value, pageCount, siblingCount, boundaryCount })

describe('1, 2 and 7 pages fit the default row, so nothing is left out', () => {
  it('1 page is one cell', () => {
    expect(pages(1, 1)).toEqual([1])
  })

  it('2 pages are both cells, whichever one is current', () => {
    expect(pages(1, 2)).toEqual([1, 2])
    expect(pages(2, 2)).toEqual([1, 2])
  })

  it('7 pages are all seven on every page, with no gap', () => {
    for (const value of [1, 2, 3, 4, 5, 6, 7]) {
      expect(pages(value, 7), String(value)).toEqual([1, 2, 3, 4, 5, 6, 7])
    }
  })

  it('4, 5 and 6 pages are every page too', () => {
    expect(pages(1, 4)).toEqual([1, 2, 3, 4])
    expect(pages(3, 5)).toEqual([1, 2, 3, 4, 5])
    expect(pages(6, 6)).toEqual([1, 2, 3, 4, 5, 6])
    expect(pages(1, 2, 0, 0)).toEqual([1, 2])
  })

  it('8 pages are the first count that needs a gap, and the row stays seven cells', () => {
    expect(pages(1, 8)).toEqual([1, 2, 3, 4, 5, 'gap-end', 8])
    expect(pages(4, 8)).toEqual([1, 2, 3, 4, 5, 'gap-end', 8])
    expect(pages(5, 8)).toEqual([1, 'gap-start', 4, 5, 6, 7, 8])
    expect(pages(8, 8)).toEqual([1, 'gap-start', 4, 5, 6, 7, 8])
  })
})

describe('7 pages with no sibling', () => {
  it('holds five cells and moves the gap with the page', () => {
    expect(pages(1, 7, 0)).toEqual([1, 2, 3, 'gap-end', 7])
    expect(pages(4, 7, 0)).toEqual([1, 'gap-start', 4, 'gap-end', 7])
    expect(pages(7, 7, 0)).toEqual([1, 'gap-start', 5, 6, 7])
  })

  it('shows a page instead of a gap that would hide only that page', () => {
    expect(pages(3, 7, 0)).toEqual([1, 2, 3, 'gap-end', 7])
    expect(pages(5, 7, 0)).toEqual([1, 'gap-start', 5, 6, 7])
  })
})

describe('500 pages', () => {
  it('are seven cells at the start, in the middle and at the end', () => {
    expect(pages(1, 500)).toEqual([1, 2, 3, 4, 5, 'gap-end', 500])
    expect(pages(250, 500)).toEqual([1, 'gap-start', 249, 250, 251, 'gap-end', 500])
    expect(pages(500, 500)).toEqual([1, 'gap-start', 496, 497, 498, 499, 500])
  })

  it('open the first gap on page 5 and close the last one on page 497', () => {
    expect(pages(4, 500)).toEqual([1, 2, 3, 4, 5, 'gap-end', 500])
    expect(pages(5, 500)).toEqual([1, 'gap-start', 4, 5, 6, 'gap-end', 500])
    expect(pages(496, 500)).toEqual([1, 'gap-start', 495, 496, 497, 'gap-end', 500])
    expect(pages(497, 500)).toEqual([1, 'gap-start', 496, 497, 498, 499, 500])
  })

  it('hold the current page in a row of seven on every one of the 500', () => {
    for (let value = 1; value <= 500; value += 1) {
      const row = pages(value, 500)
      expect(row, String(value)).toHaveLength(7)
      expect(row, String(value)).toContain(value)
    }
  })

  it('list the pages in rising order with no page twice, on every one of the 500', () => {
    for (let value = 1; value <= 500; value += 1) {
      const numbers = pages(value, 500).filter((item) => typeof item === 'number')
      expect(numbers.every((page, index) => index === 0 || page > (numbers[index - 1] ?? 0)), String(value)).toBe(true)
    }
  })

  it('are 15 cells with both counts at 3, and 3 with both at 0', () => {
    expect(pages(250, 500, 3, 3)).toEqual(
      [1, 2, 3, 'gap-start', 247, 248, 249, 250, 251, 252, 253, 'gap-end', 498, 499, 500],
    )
    expect(pages(250, 500, 0, 0)).toEqual(['gap-start', 250, 'gap-end'])
    expect(pages(1, 500, 0, 0)).toEqual([1, 2, 'gap-end'])
    expect(pages(500, 500, 0, 0)).toEqual(['gap-start', 499, 500])
  })
})

describe('siblingCount is clamped to 0-3 (R-5.7-7)', () => {
  it('reads anything above 3 as 3, so the row cannot grow without bound', () => {
    expect(pages(250, 500, 50)).toEqual([1, 'gap-start', 247, 248, 249, 250, 251, 252, 253, 'gap-end', 500])
    expect(pages(250, 500, Number.POSITIVE_INFINITY))
      .toEqual([1, 'gap-start', 247, 248, 249, 250, 251, 252, 253, 'gap-end', 500])
  })

  it('reads a negative count or NaN as 0', () => {
    expect(pages(250, 500, -4)).toEqual([1, 'gap-start', 250, 'gap-end', 500])
    expect(pages(250, 500, Number.NaN)).toEqual([1, 'gap-start', 250, 'gap-end', 500])
  })

  it('drops a fraction, because half a sibling is no cell', () => {
    expect(pages(250, 500, 1.9)).toEqual([1, 'gap-start', 249, 250, 251, 'gap-end', 500])
  })
})

describe('boundaryCount is clamped to 0-3 (R-5.7-7)', () => {
  it('reads anything above 3 as 3', () => {
    expect(pages(250, 500, 1, 50)).toEqual([1, 2, 3, 'gap-start', 249, 250, 251, 'gap-end', 498, 499, 500])
  })

  it('reads a negative count or NaN as 0, which leaves the window and its gaps', () => {
    expect(pages(250, 500, 1, -1)).toEqual(['gap-start', 249, 250, 251, 'gap-end'])
    expect(pages(250, 500, 1, Number.NaN)).toEqual(['gap-start', 249, 250, 251, 'gap-end'])
  })

  it('drops a fraction', () => {
    expect(pages(250, 500, 1, 2.9)).toEqual([1, 2, 'gap-start', 249, 250, 251, 'gap-end', 499, 500])
  })
})

describe('a value outside 1 to pageCount', () => {
  it('below 1 is page 1', () => {
    expect(pages(0, 12, 0)).toEqual([1, 2, 3, 'gap-end', 12])
    expect(pages(-3, 12, 0)).toEqual([1, 2, 3, 'gap-end', 12])
    expect(pages(Number.NaN, 12, 0)).toEqual([1, 2, 3, 'gap-end', 12])
  })

  it('past the count is the last page', () => {
    expect(pages(99, 12, 0)).toEqual([1, 'gap-start', 10, 11, 12])
    expect(pages(Number.POSITIVE_INFINITY, 12, 0)).toEqual([1, 'gap-start', 10, 11, 12])
  })

  it('is one number for the component too, so the links and the list cannot disagree', () => {
    expect(clampPage(0, 12)).toBe(1)
    expect(clampPage(-3, 12)).toBe(1)
    expect(clampPage(Number.NaN, 12)).toBe(1)
    expect(clampPage(99, 12)).toBe(12)
    expect(clampPage(Number.POSITIVE_INFINITY, 12)).toBe(12)
    expect(clampPage(5, 12)).toBe(5)
  })

  it('drops a fraction, because page 3.7 is still page 3', () => {
    expect(clampPage(3.7, 12)).toBe(3)
    expect(pages(6.7, 12, 0)).toEqual([1, 'gap-start', 6, 'gap-end', 12])
  })
})

describe('pageCount', () => {
  it('below 1, or NaN, is one page', () => {
    expect(clampPageCount(0)).toBe(1)
    expect(clampPageCount(-5)).toBe(1)
    expect(clampPageCount(Number.NaN)).toBe(1)
    expect(pages(1, 0)).toEqual([1])
    expect(pages(4, Number.NaN)).toEqual([1])
  })

  it('rounds a fraction up, because the rows on half a page still need a page', () => {
    expect(clampPageCount(7.5)).toBe(8)
    expect(pages(3, 2.5)).toEqual([1, 2, 3])
  })

  it('stops at the largest exact integer, so the last links still name real pages', () => {
    expect(clampPageCount(Number.POSITIVE_INFINITY)).toBe(9007199254740991)
    expect(pages(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)).toEqual([
      1, 'gap-start', 9007199254740987, 9007199254740988, 9007199254740989, 9007199254740990, 9007199254740991,
    ])
  })

  it('leaves a whole count alone', () => {
    expect(clampPageCount(12)).toBe(12)
    expect(clampPageCount(500)).toBe(500)
  })
})

describe('the width the full row claims', () => {
  it('adds four arrows, each page at its floor or by its digits, a gap at the floor, and the room between cells', () => {
    // 4 x 24 arrows, 3 x 24 pages and 6 x 4 between them at xs.
    expect(measureRow(['1', '2', '3'], 'xs')).toBe(192)
    // The middle row at md: 4 x 40 arrows, 7 x 40 pages and gaps, 10 x 6 between them.
    expect(measureRow(['1', '', '5', '6', '7', '', '12'], 'md')).toBe(500)
    // "12,345" is 6 x 8 + 21 = 69 wide, past the 40 px floor: 160 + 69 + 4 x 6.
    expect(measureRow(['12,345'], 'md')).toBe(253)
  })

  it('picks the narrowest step that holds the row, and the widest for a row past it', () => {
    expect(pickRowStep(0)).toBe(10)
    expect(pickRowStep(160)).toBe(10)
    expect(pickRowStep(161)).toBe(12)
    expect(pickRowStep(222)).toBe(14)
    expect(pickRowStep(500)).toBe(32)
    expect(pickRowStep(5000)).toBe(48)
  })
})
