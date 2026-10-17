import { describe, expect, it } from 'vitest'

import { clampPage, clampPageCount, listPages } from '../lib.js'

/** The four numbers in the order a case reads them, with the defaults of the component. */
const pages = (value: number, pageCount: number, siblingCount = 1, boundaryCount = 1) =>
  listPages({ value, pageCount, siblingCount, boundaryCount })

describe('every count from 1 to 60, on every page, at every sibling and boundary count', () => {
  /** Facts a reader could state without the source: none of them is taken from lib.ts. */
  const broken = (count: number, value: number, siblings: number, boundary: number): string | null => {
    const row = pages(value, count, siblings, boundary)
    const numbers = row.filter((item) => typeof item === 'number')
    if (!numbers.includes(value)) return 'the current page is missing'
    if (numbers.some((page) => page < 1 || page > count)) return 'a page is outside 1 to the count'
    if (numbers.some((page, index) => index > 0 && page <= (numbers[index - 1] ?? 0))) return 'the pages do not rise'
    if (boundary >= 1 && (!numbers.includes(1) || !numbers.includes(count))) return 'an end is missing'
    for (const [index, item] of row.entries()) {
      if (typeof item === 'number') continue
      const before = row[index - 1]
      const after = row[index + 1]
      const from = typeof before === 'number' ? before : 0
      const to = typeof after === 'number' ? after : count + 1
      if (to - from < 3) return 'a gap hides fewer than two pages'
    }
    return null
  }

  it('lists rising pages inside the count, with the current one, both ends and no gap for one page', () => {
    const failures: string[] = []
    let checked = 0
    for (let count = 1; count <= 60; count += 1) {
      for (let value = 1; value <= count; value += 1) {
        for (const siblings of [0, 1, 2, 3]) {
          for (const boundary of [0, 1, 2, 3]) {
            const why = broken(count, value, siblings, boundary)
            if (why !== null) failures.push(`${String(value)} of ${String(count)}, ${String(siblings)}/${String(boundary)}: ${why}`)
            checked += 1
          }
        }
      }
    }
    expect(failures).toEqual([])
    expect(checked).toBe(29280)
  })

  it('holds one row length on every page of a count', () => {
    for (let count = 1; count <= 60; count += 1) {
      for (const siblings of [0, 1, 2, 3]) {
        const lengths = new Set<number>()
        for (let value = 1; value <= count; value += 1) lengths.add(pages(value, count, siblings, 1).length)
        expect(lengths.size, `${String(count)} pages, ${String(siblings)} siblings`).toBe(1)
      }
    }
  })
})

describe('a JavaScript caller that passes something other than a number', () => {
  /** What a caller without types can send: the cast is the point of the test. */
  const loose = (value: unknown, pageCount: unknown, siblingCount: unknown = 1, boundaryCount: unknown = 1) =>
    listPages({ value, pageCount, siblingCount, boundaryCount } as never)

  it('reads a numeric string as its number, as a page from the URL arrives', () => {
    expect(loose('6', '12')).toEqual([1, 'gap-start', 5, 6, 7, 'gap-end', 12])
    expect(clampPage('6' as never, '12' as never)).toBe(6)
    expect(clampPageCount('12' as never)).toBe(12)
  })

  it('reads anything else as the minimum, so NaN never reaches a link', () => {
    expect(clampPage('abc' as never, 12)).toBe(1)
    expect(clampPage(undefined as never, 12)).toBe(1)
    expect(clampPageCount('abc' as never)).toBe(1)
    expect(clampPageCount(undefined as never)).toBe(1)
    expect(loose('abc', 'abc')).toEqual([1])
    expect(loose(undefined, 12, 'abc', 'abc')).toEqual([1, 2, 'gap-end'])
  })

  it('never lists NaN, whichever of the four is not a number', () => {
    for (const bad of ['abc', undefined, null, {}, []]) {
      const rows = [loose(bad, 12), loose(6, bad), loose(6, 12, bad), loose(6, 12, 1, bad)]
      for (const row of rows) expect(row.filter((item) => typeof item === 'number' && Number.isNaN(item))).toEqual([])
    }
  })
})
