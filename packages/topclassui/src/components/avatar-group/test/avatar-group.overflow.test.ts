import { describe, expect, it } from 'vitest'

import { splitOverflow } from '../lib.js'

const THIRTEEN = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'] as const
const THIRTY = Array.from({ length: 30 }, (_, i) => i)

describe('the first max items show and the rest are counted', () => {
  it('shows every item when the list is shorter than max', () => {
    expect(splitOverflow(['a', 'b'], 4)).toEqual({ visible: ['a', 'b'], hidden: 0 })
  })

  it('shows every item when the list is exactly max, so no counter says +0', () => {
    expect(splitOverflow(['a', 'b', 'c', 'd'], 4)).toEqual({ visible: ['a', 'b', 'c', 'd'], hidden: 0 })
  })

  it('hides one for one past max, which the counter shows as +1', () => {
    expect(splitOverflow(['a', 'b', 'c'], 2)).toEqual({ visible: ['a', 'b'], hidden: 1 })
  })

  it('keeps the first four of thirteen and counts nine, the overflow state the site draws', () => {
    expect(splitOverflow(THIRTEEN, 4)).toEqual({ visible: ['a', 'b', 'c', 'd'], hidden: 9 })
  })

  it('counts nothing for an empty list', () => {
    expect(splitOverflow([], 4)).toEqual({ visible: [], hidden: 0 })
  })

  it('returns a new list and leaves the one it was given alone', () => {
    const given = ['a', 'b', 'c']
    const { visible } = splitOverflow(given, 2)
    expect(visible).not.toBe(given)
    expect(given).toEqual(['a', 'b', 'c'])
  })
})

/** max given, how many of thirty show, and how many the counter stands for: written out. */
const CASES = [
  [1, 1, 29],
  [2, 2, 28],
  [4, 4, 26],
  [20, 20, 10],
  [0, 1, 29],
  [-3, 1, 29],
  [21, 20, 10],
  [500, 20, 10],
  [2.5, 2, 28],
  [2.999, 2, 28],
  [0.5, 1, 29],
  [20.7, 20, 10],
  [Number.POSITIVE_INFINITY, 20, 10],
  [Number.NEGATIVE_INFINITY, 1, 29],
  [Number.NaN, 1, 29],
] as const

describe('max is clamped to 1-20 and truncated before it reaches the list (R-5.7-7)', () => {
  for (const [max, shown, hidden] of CASES) {
    it(`${String(max)} shows ${String(shown)} of thirty and counts ${String(hidden)}`, () => {
      const result = splitOverflow(THIRTY, max)
      expect(result.visible, String(max)).toHaveLength(shown)
      expect(result.hidden, String(max)).toBe(hidden)
    })
  }

  it('always shows the head of the list, never the tail', () => {
    expect(splitOverflow(THIRTY, 0).visible).toEqual([0])
    expect(splitOverflow(THIRTY, 3).visible).toEqual([0, 1, 2])
  })

  it('never counts a negative number, whatever max is', () => {
    expect(splitOverflow(['a'], 20).hidden).toBe(0)
    expect(splitOverflow(['a'], Number.POSITIVE_INFINITY).hidden).toBe(0)
  })
})
