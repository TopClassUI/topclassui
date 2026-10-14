import { describe, expect, it } from 'vitest'

import { getWindow, offsetForIndex, shouldLoadMore } from './window.js'

const base = { estimateRowHeight: 36, overscan: 6, viewportHeight: 360 }

describe('getWindow', () => {
  it('renders the first screen plus overscan at the top', () => {
    const w = getWindow({ ...base, scrollTop: 0, count: 10_000 })
    expect(w.start).toBe(0)
    expect(w.end).toBe(10 + 1 + 6)
    expect(w.paddingStart).toBe(0)
    expect(w.totalHeight).toBe(360_000)
  })

  it('keeps a ten thousand row list under a hundred rows in the DOM', () => {
    for (const scrollTop of [0, 1_000, 50_000, 180_000, 359_000]) {
      const w = getWindow({ ...base, scrollTop, count: 10_000 })
      expect(w.end - w.start, `at ${String(scrollTop)}`).toBeLessThan(100)
    }
  })

  it('the spacers always add up to the rows that are not rendered', () => {
    const w = getWindow({ ...base, scrollTop: 5_000, count: 10_000 })
    const rendered = (w.end - w.start) * 36
    expect(w.paddingStart + rendered + w.paddingEnd).toBe(w.totalHeight)
  })

  it('moves the window as the list scrolls', () => {
    const top = getWindow({ ...base, scrollTop: 0, count: 1_000 })
    const mid = getWindow({ ...base, scrollTop: 18_000, count: 1_000 })
    expect(mid.start).toBeGreaterThan(top.start)
    expect(mid.paddingStart).toBeGreaterThan(0)
  })

  it('reaches the last row at the bottom', () => {
    const w = getWindow({ ...base, scrollTop: 1_000_000, count: 1_000 })
    expect(w.end).toBe(1_000)
    expect(w.paddingEnd).toBe(0)
  })

  it('handles an empty list', () => {
    expect(getWindow({ ...base, scrollTop: 0, count: 0 })).toEqual({
      start: 0, end: 0, paddingStart: 0, paddingEnd: 0, totalHeight: 0,
    })
  })

  it('renders everything when the list is shorter than the viewport', () => {
    const w = getWindow({ ...base, scrollTop: 0, count: 3 })
    expect(w.start).toBe(0)
    expect(w.end).toBe(3)
    expect(w.paddingEnd).toBe(0)
  })

  it('uses measured heights instead of the estimate', () => {
    const measured = new Map([[0, 200], [1, 200]])
    const w = getWindow({ ...base, scrollTop: 0, count: 10, measured })
    expect(w.totalHeight).toBe(200 + 200 + 8 * 36)
  })

  it('a very tall row pushes later rows down, so the same scroll shows earlier rows', () => {
    const measured = new Map([[0, 1_000]])
    const withTall = getWindow({ ...base, scrollTop: 2_000, count: 100, measured })
    const without = getWindow({ ...base, scrollTop: 2_000, count: 100 })
    expect(withTall.start).toBeGreaterThan(0)
    expect(withTall.start).toBeLessThan(without.start)
  })

  it('never produces a negative scroll or padding', () => {
    const w = getWindow({ ...base, scrollTop: -500, count: 100 })
    expect(w.start).toBe(0)
    expect(w.paddingStart).toBe(0)
    expect(w.paddingEnd).toBeGreaterThanOrEqual(0)
  })

  it('treats a zero or negative row height as one pixel rather than dividing by zero', () => {
    const w = getWindow({ ...base, estimateRowHeight: 0, scrollTop: 0, count: 10 })
    expect(Number.isFinite(w.totalHeight)).toBe(true)
    expect(w.totalHeight).toBe(10)
  })
})

describe('offsetForIndex', () => {
  const list = { ...base, count: 1_000, scrollTop: 0 }

  it('puts the row at the top for block start', () => {
    expect(offsetForIndex(100, { ...list, block: 'start' })).toBe(3_600)
  })

  it('centres the row for block center', () => {
    const got = offsetForIndex(100, { ...list, block: 'center' })
    expect(got).toBe(3_600 - (360 - 36) / 2)
  })

  it('never scrolls past the end', () => {
    const got = offsetForIndex(999, { ...list, block: 'start' })
    expect(got).toBe(1_000 * 36 - 360)
  })

  it('never scrolls before the start', () => {
    expect(offsetForIndex(0, { ...list, block: 'center' })).toBe(0)
  })

  it('clamps an index outside the list', () => {
    expect(offsetForIndex(-5, { ...list, count: 10, block: 'start' })).toBe(0)
    expect(offsetForIndex(999, { ...list, count: 10, block: 'start' })).toBe(0)
  })
})

// Row 100 spans 3,600 to 3,636 px; the view is 360 px tall. Nearest is the default block.
describe('offsetForIndex, block nearest, from where the list is', () => {
  const list = { ...base, count: 1_000 }

  it('puts a row above the view at the top edge', () => {
    expect(offsetForIndex(100, { ...list, scrollTop: 10_000 })).toBe(3_600)
  })

  it('puts a row below the view at the bottom edge', () => {
    expect(offsetForIndex(100, { ...list, scrollTop: 0 })).toBe(3_276)
  })

  it('moves nothing for a row already in view', () => {
    expect(offsetForIndex(100, { ...list, scrollTop: 3_500 })).toBe(3_500)
  })

  it('treats a row the top edge cuts as above, and one the bottom edge cuts as below', () => {
    expect(offsetForIndex(100, { ...list, scrollTop: 3_610 })).toBe(3_600)
    expect(offsetForIndex(100, { ...list, scrollTop: 3_250 })).toBe(3_276)
  })

  it('takes a row flush with either edge as in view', () => {
    expect(offsetForIndex(100, { ...list, scrollTop: 3_600 })).toBe(3_600)
    expect(offsetForIndex(100, { ...list, scrollTop: 3_276 })).toBe(3_276)
  })
})

describe('shouldLoadMore', () => {
  it('asks once the window is within the threshold of the end', () => {
    expect(shouldLoadMore(95, 100, 10, true)).toBe(true)
    expect(shouldLoadMore(80, 100, 10, true)).toBe(false)
  })

  it('never asks when there is no more to load', () => {
    expect(shouldLoadMore(100, 100, 10, false)).toBe(false)
  })

  it('never asks for an empty list', () => {
    expect(shouldLoadMore(0, 0, 10, true)).toBe(false)
  })
})

describe('cost at scale', () => {
  it('a scroll over 100,000 rows stays well under a frame', () => {
    const started = performance.now()
    for (let i = 0; i < 100; i++) {
      getWindow({ ...base, scrollTop: i * 1_000, count: 100_000 })
    }
    const perCall = (performance.now() - started) / 100
    expect(perCall, `${perCall.toFixed(3)}ms per window`).toBeLessThan(16)
  })
})
