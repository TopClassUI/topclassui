import { describe, expect, it, vi } from 'vitest'

import { type RowMouseMove, skipDisabledHighlight } from './row-highlight.js'

/** The two members of a Base UI event the helper reads, recorded. */
function moveOf() {
  const skipped = vi.fn()
  return { event: { preventBaseUIHandler: skipped } as unknown as Parameters<RowMouseMove>[0], skipped }
}

describe('a disabled row keeps the highlight where it was', () => {
  it('skips Base UI\'s own move on a disabled row, after the caller\'s', () => {
    const order: string[] = []
    const own = vi.fn(() => { order.push('own') })
    const { event, skipped } = moveOf()
    skipped.mockImplementation(() => { order.push('skipped') })
    skipDisabledHighlight(true, own)(event)
    expect(order).toEqual(['own', 'skipped'])
  })

  it('leaves an enabled row, and a row that does not say, to Base UI', () => {
    for (const disabled of [false, undefined]) {
      const own = vi.fn()
      const { event, skipped } = moveOf()
      skipDisabledHighlight(disabled, own)(event)
      expect([own.mock.calls.length, skipped.mock.calls.length], String(disabled)).toEqual([1, 0])
    }
  })

  it('needs no handler of the caller\'s', () => {
    const { event, skipped } = moveOf()
    skipDisabledHighlight(true)(event)
    expect(skipped).toHaveBeenCalledTimes(1)
  })
})
