import { describe, expect, it } from 'vitest'

import { componentNeighbours, componentOrder } from './components.js'

describe('the reading order of the component pages', () => {
  it('follows the catalog, then the pages with no card, each once', () => {
    const order = componentOrder().map((entry) => entry.slug)
    expect(order).toHaveLength(49)
    expect(new Set(order).size).toBe(49)
    expect(order.slice(0, 3)).toEqual(['button', 'tag', 'kbd'])
  })

  it('gives the first page no previous, the last no next, and every other one both', () => {
    const order = componentOrder().map((entry) => entry.slug)
    const first = order[0] ?? ''
    const last = order.at(-1) ?? ''
    expect(componentNeighbours(first).previous).toBeUndefined()
    expect(componentNeighbours(first).next?.slug).toBe('tag')
    expect(componentNeighbours('tag')).toMatchObject({ previous: { slug: 'button' }, next: { slug: 'kbd' } })
    expect(componentNeighbours(last).next).toBeUndefined()
    expect(componentNeighbours('no-such-page')).toEqual({ previous: undefined, next: undefined })
  })
})
