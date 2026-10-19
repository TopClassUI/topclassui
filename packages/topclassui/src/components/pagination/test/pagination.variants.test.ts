import { describe, expect, it } from 'vitest'

import { paginationVariants } from '../variants.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const

describe('paginationVariants is a cache, so it has to behave like a pure function', () => {
  it('returns the same string for the same props, every time', () => {
    const once = paginationVariants({ size: 'lg', current: true })
    expect(paginationVariants({ size: 'lg', current: true })).toBe(once)
  })

  it('keeps both props in the key, so no two of the twelve combinations collide', () => {
    const seen = new Map<string, string>()
    for (const size of SIZES) {
      for (const current of [true, false]) {
        const classes = paginationVariants({ size, current })
        const label = `${size}/${String(current)}`
        const clash = seen.get(classes)
        expect(clash, `${label} paints the same as ${String(clash)}`).toBeUndefined()
        seen.set(classes, label)
      }
    }
    expect(seen.size).toBe(12)
  })

  it('is the md cell of a page that is not current when nothing is passed', () => {
    expect(paginationVariants()).toBe(paginationVariants({ size: 'md', current: false }))
    expect(paginationVariants().split(' ')).toContain('h-control-xs')
    expect(paginationVariants().split(' ')).toContain('border-line')
    expect(paginationVariants().split(' ')).not.toContain('bg-primary-solid')
  })

  it('still answers a size no list contains, which a JS caller can pass', () => {
    expect(paginationVariants({ size: 'enormous' as never })).toContain('inline-flex')
  })

  it('does not let that answer leak into a real key', () => {
    const before = paginationVariants({})
    paginationVariants({ size: 'enormous' as never })
    expect(paginationVariants({})).toBe(before)
  })

  it('appends the consumer classes last, which is what lets them win', () => {
    expect(paginationVariants({ className: 'mt-4' }).endsWith('mt-4')).toBe(true)
    expect(paginationVariants({ current: true, className: 'bg-neutral-solid' }).split(' '))
      .not.toContain('bg-primary-solid')
  })
})
