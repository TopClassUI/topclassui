import { describe, expect, it } from 'vitest'

import { TAG_SIZES, TAG_TONES } from '../constants.js'
import { tagVariants } from '../variants.js'

describe('tagVariants is a cache, so it has to behave like a pure function', () => {
  it('returns the same string for the same props, every time', () => {
    const once = tagVariants({ tone: 'danger', size: 'lg' })
    expect(tagVariants({ tone: 'danger', size: 'lg' })).toBe(once)
  })

  it('keeps both props in the key, so no two combinations collide', () => {
    const seen = new Map<string, string>()
    for (const tone of TAG_TONES) {
      for (const size of TAG_SIZES) {
        const classes = tagVariants({ tone, size })
        const label = `${tone}/${size}`
        const clash = seen.get(classes)
        expect(clash, `${label} paints the same as ${String(clash)}`).toBeUndefined()
        seen.set(classes, label)
      }
    }
    expect(seen.size).toBe(6 * 6)
  })

  it('fills the defaults when a prop is left out', () => {
    expect(tagVariants({})).toBe(tagVariants({ tone: 'neutral', size: 'md' }))
  })

  it('still answers a value no list contains, which a JS caller can pass', () => {
    expect(tagVariants({ tone: 'nope' as never })).toContain('inline-flex')
  })

  it('does not let that answer leak into a real key', () => {
    const before = tagVariants({})
    tagVariants({ tone: 'nope' as never })
    tagVariants({ size: 'enormous' as never })
    expect(tagVariants({})).toBe(before)
  })

  it('appends the consumer classes last, which is what lets them win', () => {
    expect(tagVariants({ className: 'mt-4' }).endsWith('mt-4')).toBe(true)
    expect(tagVariants({ class: 'mt-4' }).endsWith('mt-4')).toBe(true)
  })
})
